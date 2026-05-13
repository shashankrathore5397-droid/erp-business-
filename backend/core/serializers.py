from rest_framework import serializers

from .models import Company, Employee, Order, Product, User, Customer, Invoice, Subscription


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name", "slug", "email", "phone", "address", "created_at"]
        read_only_fields = ["id", "slug", "created_at"]


class UserSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "role", "company"]


class EmployeeSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    company_name = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = Employee
        fields = [
            "id",
            "company",
            "company_name",
            "employee_code",
            "first_name",
            "last_name",
            "full_name",
            "email",
            "phone",
            "department",
            "designation",
            "hire_date",
            "salary",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "company", "company_name", "full_name", "created_at", "updated_at"]


class ProductSerializer(serializers.ModelSerializer):
    inventory_value = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    company_name = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "company",
            "company_name",
            "sku",
            "name",
            "description",
            "unit_price",
            "cost_price",
            "quantity",
            "reorder_level",
            "status",
            "inventory_value",
            "is_low_stock",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "company",
            "company_name",
            "inventory_value",
            "is_low_stock",
            "created_at",
            "updated_at",
        ]


class OrderSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "company",
            "company_name",
            "order_number",
            "customer_name",
            "customer_email",
            "status",
            "order_date",
            "total_amount",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "company", "company_name", "created_at", "updated_at"]


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = "__all__"
        read_only_fields = ["id", "company", "created_at", "updated_at"]


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = "__all__"
        read_only_fields = ["id", "company", "created_at", "updated_at"]


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = "__all__"
        read_only_fields = ["id", "company", "created_at", "updated_at"]
