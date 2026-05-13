import { api } from "../api.js";

export async function fetchCustomers() {
  const response = await api.get("/customers/");
  return response.data;
}

export async function createCustomer(payload) {
  const response = await api.post("/customers/", payload);
  return response.data;
}

export async function deleteCustomer(id) {
  return api.delete(`/customers/${id}/`);
}
