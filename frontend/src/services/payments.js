import { api } from "../api.js";

export async function fetchSubscriptions() {
  const response = await api.get("/subscriptions/");
  return response.data;
}

export async function createCheckout(payload) {
  const response = await api.post("/payments/checkout/", payload);
  return response.data;
}
