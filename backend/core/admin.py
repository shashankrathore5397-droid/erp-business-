from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import Company, Employee, Order, Product, User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("ERP profile", {"fields": ("company", "role")}),
    )
    list_display = ("username", "email", "company", "role", "is_staff")
    list_filter = ("role", "is_staff", "is_superuser", "company")


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "email", "phone", "created_at")
    search_fields = ("name", "slug", "email")


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = (
        "employee_code",
        "full_name",
        "company",
        "department",
        "designation",
        "status",
    )
    list_filter = ("department", "status", "company")
    search_fields = ("employee_code", "first_name", "last_name", "email")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("sku", "name", "company", "unit_price", "quantity", "status")
    list_filter = ("status", "company")
    search_fields = ("sku", "name")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_number",
        "company",
        "customer_name",
        "status",
        "total_amount",
        "order_date",
    )
    list_filter = ("status", "company")
    search_fields = ("order_number", "customer_name", "customer_email")
