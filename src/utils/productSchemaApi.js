import { apiRequest } from "./api.js";
import { createDefaultProductSchema, normalizeProductSchema } from "../data/productSchema.js";

export async function fetchProductSchema() {
  try {
    return normalizeProductSchema(await apiRequest("/product-schema"));
  } catch {
    return createDefaultProductSchema();
  }
}

export async function updateProductSchema(schema) {
  return normalizeProductSchema(await apiRequest("/admin/product-schema", {
    method: "PATCH",
    body: JSON.stringify(schema),
  }));
}
