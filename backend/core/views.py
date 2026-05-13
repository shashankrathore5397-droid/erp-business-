from decimal import Decimal

from django.db.models import F, Sum
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests
import stripe

from .models import Company, Employee, Order, Product, Customer, Invoice, Subscription, User
from django.conf import settings
from .serializers import (
    CompanySerializer,
    EmployeeSerializer,
    OrderSerializer,
    ProductSerializer,
    UserSerializer,
    CustomerSerializer,
    InvoiceSerializer,
    SubscriptionSerializer,
)


class TenantModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        model = self.serializer_class.Meta.model
        queryset = model.objects.all()

        if self.request.user.is_superuser:
            return queryset

        if not self.request.user.company_id:
            return queryset.none()

        return queryset.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        if not self.request.user.company_id:
            raise PermissionDenied("Your account is not linked to a company.")
        serializer.save(company=self.request.user.company)


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_superuser:
            return Company.objects.all()
        if not self.request.user.company_id:
            return Company.objects.none()
        return Company.objects.filter(id=self.request.user.company_id)

    def perform_create(self, serializer):
        if not self.request.user.is_superuser:
            raise PermissionDenied("Only superusers can create companies.")
        serializer.save()


class EmployeeViewSet(TenantModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer


class ProductViewSet(TenantModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class OrderViewSet(TenantModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer


class CustomerViewSet(TenantModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer


class InvoiceViewSet(TenantModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer


class SubscriptionViewSet(TenantModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard(request):
    if request.user.is_superuser:
        companies = Company.objects.all()
        employees = Employee.objects.all()
        products = Product.objects.all()
        orders = Order.objects.all()
    elif request.user.company_id:
        companies = Company.objects.filter(id=request.user.company_id)
        employees = Employee.objects.filter(company=request.user.company)
        products = Product.objects.filter(company=request.user.company)
        orders = Order.objects.filter(company=request.user.company)
    else:
        return Response(
            {"detail": "Your account is not linked to a company."},
            status=status.HTTP_403_FORBIDDEN,
        )

    inventory_value = sum((product.inventory_value for product in products), Decimal("0.00"))
    revenue = orders.aggregate(total=Sum("total_amount"))["total"] or Decimal("0.00")

    payload = {
        "company_count": companies.count(),
        "employee_count": employees.count(),
        "product_count": products.count(),
        "order_count": orders.count(),
        "low_stock_count": products.filter(quantity__lte=F("reorder_level")).count(),
        "inventory_value": inventory_value,
        "revenue": revenue,
        "recent_products": ProductSerializer(products.order_by("-created_at")[:5], many=True).data,
        "recent_employees": EmployeeSerializer(employees.order_by("-created_at")[:5], many=True).data,
    }
    return Response(payload)


@api_view(["POST"])
@permission_classes([AllowAny])
def google_login(request):
    if not settings.GOOGLE_CLIENT_ID:
        return Response(
            {"detail": "Google OAuth is not configured."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    credential = request.data.get("credential")
    if not credential:
        return Response(
            {"detail": "Missing Google credential."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        payload = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError:
        return Response(
            {"detail": "Invalid Google token."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    email = payload.get("email")
    if not email:
        return Response(
            {"detail": "Google account has no email."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            "username": email.split("@")[0],
            "first_name": payload.get("given_name", ""),
            "last_name": payload.get("family_name", ""),
            "role": User.Role.STAFF,
        },
    )

    if created and not user.company_id:
        company = Company.objects.first()
        if company:
            user.company = company
            user.save()

    refresh = RefreshToken.for_user(user)
    return Response({"access": str(refresh.access_token), "refresh": str(refresh)})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    if not settings.STRIPE_SECRET_KEY:
        return Response(
            {"detail": "Stripe is not configured."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    plan = request.data.get("plan")
    interval = request.data.get("interval", "monthly")

    plans = {
        "starter": {
            "name": "Starter",
            "amount": 199900,
        },
        "growth": {
            "name": "Growth",
            "amount": 599900,
        },
    }

    if plan not in plans:
        return Response(
            {"detail": "Selected plan is not available."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if interval not in {"monthly", "yearly"}:
        return Response(
            {"detail": "Invalid billing interval."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    stripe.api_key = settings.STRIPE_SECRET_KEY
    success_url = f"{settings.FRONTEND_URL}/billing?success=1"
    cancel_url = f"{settings.FRONTEND_URL}/billing?canceled=1"

    session = stripe.checkout.Session.create(
        mode="subscription",
        payment_method_types=["card"],
        line_items=[
            {
                "price_data": {
                    "currency": "inr",
                    "unit_amount": plans[plan]["amount"],
                    "recurring": {"interval": "month" if interval == "monthly" else "year"},
                    "product_data": {"name": f"ERP {plans[plan]['name']}"},
                },
                "quantity": 1,
            }
        ],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "plan": plan,
            "interval": interval,
            "user_id": str(request.user.id),
            "company_id": str(request.user.company_id or ""),
        },
        customer_email=request.user.email or None,
    )

    return Response({"url": session.url})
