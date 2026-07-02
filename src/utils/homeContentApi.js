import { apiRequest } from "./api.js";

export function fetchHomepageOffers() {
  return apiRequest("/home-offers");
}

export function fetchAllHomepageOffers() {
  return apiRequest("/home-offers/all");
}

export function fetchHomepageCategoryCards() {
  return apiRequest("/home-offers/category-cards");
}

export function fetchAllHomepageCategoryCards() {
  return apiRequest("/home-offers/category-cards/all");
}

export async function saveHomepageCategoryCard(card) {
  return apiRequest(`/home-offers/category-cards/${card.key}`, {
    method: "PUT",
    body: JSON.stringify(card),
  });
}

export async function saveHomepageOffer(offer) {
  const exists = Boolean(offer.id);
  return apiRequest(exists ? `/home-offers/${offer.id}` : "/home-offers", {
    method: exists ? "PUT" : "POST",
    body: JSON.stringify(offer),
  });
}

export async function deleteHomepageOffer(offerId) {
  return apiRequest(`/home-offers/${offerId}`, {
    method: "DELETE",
  });
}

export function fetchReviews() {
  return apiRequest("/reviews");
}

export function fetchAllReviews() {
  return apiRequest("/reviews/all");
}

export async function saveReview(review) {
  const exists = Boolean(review.id);
  return apiRequest(exists ? `/reviews/${review.id}` : "/reviews", {
    method: exists ? "PUT" : "POST",
    body: JSON.stringify(review),
  });
}

export async function updateReviewStatus(reviewId, status, isActive = true) {
  return apiRequest(`/reviews/${reviewId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status, isActive }),
  });
}

export async function submitCustomerReview(review) {
  return apiRequest("/reviews", {
    method: "POST",
    body: JSON.stringify(review),
  });
}

export async function deleteReview(reviewId) {
  return apiRequest(`/reviews/${reviewId}`, {
    method: "DELETE",
  });
}
