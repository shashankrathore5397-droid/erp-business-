import { api } from "../api.js";

export async function fetchDashboard() {
  const response = await api.get("/dashboard/");
  return response.data;
}
