export const demoCustomers = [
  {
    id: 1,
    name: "Helios Manufacturing",
    email: "ops@helios.example",
    phone: "+91 90876 10011",
    city: "Mumbai",
    lifetime_value: 284000,
    status: "active",
  },
  {
    id: 2,
    name: "Nova Freight",
    email: "procurement@nova.example",
    phone: "+91 90876 10021",
    city: "Pune",
    lifetime_value: 192500,
    status: "active",
  },
  {
    id: 3,
    name: "Blue Ridge Retail",
    email: "finance@blueridge.example",
    phone: "+91 90876 10031",
    city: "Bengaluru",
    lifetime_value: 116700,
    status: "on-hold",
  },
];

export const demoInvoices = [
  {
    id: 101,
    number: "INV-24018",
    customer: "Helios Manufacturing",
    date: "2026-05-02",
    amount: 42890,
    status: "paid",
    items: 5,
  },
  {
    id: 102,
    number: "INV-24019",
    customer: "Nova Freight",
    date: "2026-05-05",
    amount: 25900,
    status: "sent",
    items: 3,
  },
  {
    id: 103,
    number: "INV-24020",
    customer: "Blue Ridge Retail",
    date: "2026-05-06",
    amount: 17840,
    status: "overdue",
    items: 2,
  },
];

export const demoRevenue = [
  { name: "Jan", value: 180000 },
  { name: "Feb", value: 220000 },
  { name: "Mar", value: 195000 },
  { name: "Apr", value: 260000 },
  { name: "May", value: 310000 },
  { name: "Jun", value: 285000 },
];

export const demoSubscriptions = [
  {
    id: 1,
    plan: "Growth",
    price: "INR 5,999 / month",
    status: "active",
    renewal: "2026-06-05",
  },
];
