
from rest_framework import serializers
from django.contrib.auth.models import User

from .models import (
    Category,
    Product,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Wishlist
)

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'password'
        ]

    def create(self, validated_data):

        return User.objects.create_user(
            **validated_data
        )




class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'is_staff'
        ]

        read_only_fields = [
            'id',
            'username',
            'is_staff'
        ]

class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )

    class Meta:
        model = Product
        fields = '__all__'

class CartItemSerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(
        source='product.name',
        read_only=True
    )

    product_price = serializers.DecimalField(
        source='product.price',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    image = serializers.ImageField(
        source='product.image',
        read_only=True
    )

    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            'id',
            'product',
            'product_name',
            'product_price',
            'image',
            'quantity',
            'subtotal'
        ]

    def get_subtotal(self, obj):

        return obj.product.price * obj.quantity

class CartSerializer(serializers.ModelSerializer):

    items = CartItemSerializer(many=True, read_only=True)

    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total']

    def get_total(self, obj):

        return sum(
            item.product.price * item.quantity
            for item in obj.items.all()
        )

class OrderItemSerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(
        source='product.name',
        read_only=True
    )

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product',
            'product_name',
            'quantity',
            'price'
        ]


class OrderSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(
        many=True,
        read_only=True
    )

    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    class Meta:
        model = Order

        fields = [
            'id',
            'username',
            'shipping_address',
            'phone',
            'total_amount',
            'status',
            'created_at',
            'items'
        ]

        read_only_fields = fields

class WishlistSerializer(serializers.ModelSerializer):

    product_details = ProductSerializer(
        source='product',
        read_only=True
    )

    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'product_details']