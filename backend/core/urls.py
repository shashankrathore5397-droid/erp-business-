from django.urls import include, path
from rest_framework import routers
from .views import (
    CompanyViewSet, EmployeeViewSet, ProductViewSet, OrderViewSet, CustomerViewSet,
    InvoiceViewSet, SubscriptionViewSet, dashboard, me, google_login, create_checkout_session
)

router = routers.DefaultRouter()
router.register(r'companies', CompanyViewSet)
router.register(r'employees', EmployeeViewSet)
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'subscriptions', SubscriptionViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("google-login/", google_login, name="google_login"),
    path("payments/checkout/", create_checkout_session, name="create_checkout_session"),
    path('dashboard/', dashboard, name='dashboard'),
    path('me/', me, name='me'),
]
