from datetime import date
from decimal import Decimal

from django.core.management.base import BaseCommand

from core.models import Company, Customer, Employee, Invoice, Order, Product, Subscription, User


class Command(BaseCommand):
    help = "Create a demo tenant, owner user, and starter ERP records."

    def handle(self, *args, **options):
        company, _ = Company.objects.get_or_create(
            slug="acme-manufacturing",
            defaults={
                "name": "Acme Manufacturing",
                "email": "hello@acme.test",
                "phone": "+91 98765 43210",
                "address": "42 Industrial Estate, Bengaluru",
            },
        )

        user, created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@example.com",
                "first_name": "ERP",
                "last_name": "Admin",
                "company": company,
                "role": User.Role.OWNER,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if created:
            user.set_password("Admin@12345")
            user.save()

        employees = [
            {
                "employee_code": "EMP-001",
                "first_name": "Asha",
                "last_name": "Rao",
                "email": "asha.rao@acme.test",
                "phone": "+91 90000 10001",
                "department": Employee.Department.HR,
                "designation": "HR Manager",
                "hire_date": date(2023, 4, 10),
                "salary": Decimal("76000.00"),
            },
            {
                "employee_code": "EMP-002",
                "first_name": "Karan",
                "last_name": "Mehta",
                "email": "karan.mehta@acme.test",
                "phone": "+91 90000 10002",
                "department": Employee.Department.OPERATIONS,
                "designation": "Operations Lead",
                "hire_date": date(2022, 9, 15),
                "salary": Decimal("92000.00"),
            },
            {
                "employee_code": "EMP-003",
                "first_name": "Nisha",
                "last_name": "Kapoor",
                "email": "nisha.kapoor@acme.test",
                "phone": "+91 90000 10003",
                "department": Employee.Department.SALES,
                "designation": "Sales Executive",
                "hire_date": date(2024, 1, 8),
                "salary": Decimal("54000.00"),
            },
        ]
        for payload in employees:
            Employee.objects.get_or_create(
                company=company,
                employee_code=payload["employee_code"],
                defaults=payload,
            )

        products = [
            {
                "sku": "SKU-1001",
                "name": "Industrial Bearing",
                "description": "High-load bearing for production machinery.",
                "unit_price": Decimal("1499.00"),
                "cost_price": Decimal("980.00"),
                "quantity": 28,
                "reorder_level": 10,
            },
            {
                "sku": "SKU-1002",
                "name": "Hydraulic Pump",
                "description": "Compact pump assembly for service orders.",
                "unit_price": Decimal("8999.00"),
                "cost_price": Decimal("6200.00"),
                "quantity": 4,
                "reorder_level": 6,
            },
            {
                "sku": "SKU-1003",
                "name": "Control Valve",
                "description": "Precision valve with stainless steel body.",
                "unit_price": Decimal("2799.00"),
                "cost_price": Decimal("1710.00"),
                "quantity": 16,
                "reorder_level": 8,
            },
        ]
        for payload in products:
            Product.objects.get_or_create(
                company=company,
                sku=payload["sku"],
                defaults=payload,
            )

        orders = [
            {
                "order_number": "ORD-2401",
                "customer_name": "Zenith Works",
                "customer_email": "purchase@zenith.test",
                "status": Order.Status.CONFIRMED,
                "order_date": date(2026, 4, 20),
                "total_amount": Decimal("48950.00"),
            },
            {
                "order_number": "ORD-2402",
                "customer_name": "Northline Logistics",
                "customer_email": "ops@northline.test",
                "status": Order.Status.SHIPPED,
                "order_date": date(2026, 4, 28),
                "total_amount": Decimal("121980.00"),
            },
        ]
        for payload in orders:
            Order.objects.get_or_create(
                company=company,
                order_number=payload["order_number"],
                defaults=payload,
            )

        customers = [
            {
                "name": "Helios Manufacturing",
                "email": "ops@helios.example",
                "phone": "+91 90876 10011",
                "city": "Mumbai",
                "country": "India",
                "address": "Plot 9, MIDC Industrial Area",
            },
            {
                "name": "Nova Freight",
                "email": "procurement@nova.example",
                "phone": "+91 90876 10021",
                "city": "Pune",
                "country": "India",
                "address": "E Block, Logistics Park",
            },
            {
                "name": "Blue Ridge Retail",
                "email": "finance@blueridge.example",
                "phone": "+91 90876 10031",
                "city": "Bengaluru",
                "country": "India",
                "address": "120 MG Road",
            },
        ]
        customer_records = []
        for payload in customers:
            customer, _ = Customer.objects.get_or_create(
                company=company,
                email=payload["email"],
                defaults=payload,
            )
            customer_records.append(customer)

        invoices = [
            {
                "invoice_number": "INV-2401",
                "customer": customer_records[0],
                "issue_date": date(2026, 5, 1),
                "due_date": date(2026, 5, 31),
                "total_amount": Decimal("284000.00"),
                "status": "paid",
            },
            {
                "invoice_number": "INV-2402",
                "customer": customer_records[1],
                "issue_date": date(2026, 5, 5),
                "due_date": date(2026, 6, 4),
                "total_amount": Decimal("192500.00"),
                "status": "unpaid",
            },
            {
                "invoice_number": "INV-2403",
                "customer": customer_records[2],
                "issue_date": date(2026, 5, 8),
                "due_date": date(2026, 6, 7),
                "total_amount": Decimal("116700.00"),
                "status": "overdue",
            },
        ]
        for payload in invoices:
            Invoice.objects.get_or_create(
                company=company,
                invoice_number=payload["invoice_number"],
                defaults=payload,
            )

        Subscription.objects.get_or_create(
            company=company,
            plan="Growth",
            defaults={
                "status": "active",
                "start_date": date(2026, 5, 5),
                "end_date": date(2026, 6, 5),
            },
        )

        self.stdout.write(self.style.SUCCESS("Demo data ready. Login: admin / Admin@12345"))
