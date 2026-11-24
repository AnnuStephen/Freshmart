
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)

from .views import (
    RegisterView,
    ProfileView,
    CategoryViewSet,
    ProductViewSet,
    CartView,
    AddToCartView,
    UpdateCartView,
    RemoveCartView,
    ClearCartView,
    CheckoutView,
    MyOrdersView,
    OrderDetailView,
    CancelOrderView,
    AdminOrderStatusView,
    WishlistView,
    RemoveWishlistView,
    AdminOrdersView
)

router = DefaultRouter()

router.register(
    'categories',
    CategoryViewSet,
    basename='category'
)

router.register(
    'products',
    ProductViewSet,
    basename='product'
)

urlpatterns = [

    # Authentication

    path('register/', RegisterView.as_view()),
    path('login/', TokenObtainPairView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('profile/', ProfileView.as_view()),

    # Products and categories

    path('', include(router.urls)),

    # Cart

    path('cart/', CartView.as_view()),
    path('cart/add/', AddToCartView.as_view()),
    path('cart/update/<int:pk>/', UpdateCartView.as_view()),
    path('cart/remove/<int:pk>/', RemoveCartView.as_view()),
    path('cart/clear/', ClearCartView.as_view()),

    # Orders

    path('checkout/', CheckoutView.as_view()),
    path('my-orders/', MyOrdersView.as_view()),
    path('orders/<int:pk>/', OrderDetailView.as_view()),
    path('orders/cancel/<int:pk>/', CancelOrderView.as_view()),

    # Admin

    path(
        'admin/orders/<int:pk>/status/',
        AdminOrderStatusView.as_view()
    ),

    # Wishlist

    path('wishlist/', WishlistView.as_view()),
    path('wishlist/remove/<int:pk>/', RemoveWishlistView.as_view()),
    path('admin/orders/', AdminOrdersView.as_view()),

]