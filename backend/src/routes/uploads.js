import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.resolve(__dirname, "../../uploads");

const imageTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function requireProductUploader(req, res, next) {
  if (!["admin", "employee", "staff"].includes(req.user?.role)) {
    return res.status(403).json({ message: "Admin or employee access required." });
  }

  return next();
}

function getBoundary(contentType = "") {
  const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  return match?.[1] || match?.[2] || "";
}

function safeFilename(filename, contentType) {
  const extensionFromName = path.extname(filename || "").toLowerCase();
  const extension =
    allowedExtensions.has(extensionFromName)
      ? extensionFromName.replace(".jpeg", ".jpg")
      : imageTypes.get(contentType);

  if (!extension) {
    return "";
  }

  const baseName = path
    .basename(filename || "upload", extensionFromName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);

  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${baseName || "image"}-${unique}${extension}`;
}

function parseMultipartImage(body, boundary) {
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const headerSeparator = Buffer.from("\r\n\r\n");
  let cursor = body.indexOf(boundaryBuffer);

  while (cursor !== -1) {
    let headerStart = cursor + boundaryBuffer.length;

    if (body.slice(headerStart, headerStart + 2).toString() === "--") {
      break;
    }

    if (body[headerStart] === 13 && body[headerStart + 1] === 10) {
      headerStart += 2;
    }

    const headerEnd = body.indexOf(headerSeparator, headerStart);
    if (headerEnd === -1) {
      break;
    }

    const headers = body.slice(headerStart, headerEnd).toString("utf8");
    const nextBoundary = body.indexOf(boundaryBuffer, headerEnd + headerSeparator.length);
    if (nextBoundary === -1) {
      break;
    }

    const filename = headers.match(/filename="([^"]+)"/i)?.[1];
    if (filename) {
      const contentType =
        headers.match(/content-type:\s*([^\r\n]+)/i)?.[1]?.trim().toLowerCase() || "";
      let dataEnd = nextBoundary;

      if (body[dataEnd - 2] === 13 && body[dataEnd - 1] === 10) {
        dataEnd -= 2;
      }

      return {
        contentType,
        filename,
        data: body.slice(headerEnd + headerSeparator.length, dataEnd),
      };
    }

    cursor = nextBoundary;
  }

  return null;
}

function buildPublicUrl(req, filename) {
  const forwardedProtocol = req.headers["x-forwarded-proto"]?.split(",")[0]?.trim();
  const protocol = forwardedProtocol || req.protocol;
  return `${protocol}://${req.get("host")}/uploads/${filename}`;
}

router.post(
  "/",
  requireAuth,
  requireProductUploader,
  express.raw({
    limit: "8mb",
    type: (req) => req.headers["content-type"]?.startsWith("multipart/form-data"),
  }),
  (req, res) => {
    const boundary = getBoundary(req.headers["content-type"]);
    const upload = boundary ? parseMultipartImage(req.body, boundary) : null;

    if (!upload) {
      return res.status(400).json({ message: "No image file was uploaded." });
    }

    if (!imageTypes.has(upload.contentType)) {
      return res.status(400).json({ message: "Only JPG, PNG, WEBP, and GIF images are allowed." });
    }

    const filename = safeFilename(upload.filename, upload.contentType);
    if (!filename) {
      return res.status(400).json({ message: "Unsupported image file type." });
    }

    fs.mkdirSync(uploadsDir, { recursive: true });
    fs.writeFileSync(path.join(uploadsDir, filename), upload.data);

    res.status(201).json({
      path: `/uploads/${filename}`,
      url: buildPublicUrl(req, filename),
    });
  },
);

export default router;
