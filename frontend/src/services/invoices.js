import { api } from "../api.js";

export async function fetchInvoices() {
  const response = await api.get("/invoices/");
  return response.data;
}

export async function createInvoice(payload) {
  const response = await api.post("/invoices/", payload);
  return response.data;
}

export async function deleteInvoice(id) {
  return api.delete(`/invoices/${id}/`);
}
