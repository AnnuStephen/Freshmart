
from django.contrib import admin

from .models import (
    Category,
    Product,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Wishlist
)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):

    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'name',
        'category',
        'price',
        'stock'
    )

    list_filter = ('category',)
    search_fields = ('name',)

class CartItemInline(admin.TabularInline):

    model = CartItem
    extra = 0

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):

    list_display = ('id', 'user')
    inlines = [CartItemInline]

class OrderItemInline(admin.TabularInline):

    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'price')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'user',
        'total_amount',
        'status',
        'created_at'
    )

    list_filter = ('status',)

    search_fields = ('user__username',)

    readonly_fields = (
        'user',
        'shipping_address',
        'phone',
        'total_amount',
        'status',
        'created_at'
    )

    inlines = [OrderItemInline]

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):

    list_display = ('id', 'user', 'product')