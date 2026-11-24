
from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import F
from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    IsAdminUser
)

from .models import (
    Category,
    Product,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Wishlist
)

from .serializers import (
    RegisterSerializer,
    UserSerializer,
    CategorySerializer,
    ProductSerializer,
    CartSerializer,
    CartItemSerializer,
    OrderSerializer,
    WishlistSerializer
)

from .permissions import IsAdminOrReadOnly
from decimal import Decimal, InvalidOperation

from rest_framework.exceptions import ValidationError

# USER REGISTRATION

class RegisterView(generics.CreateAPIView):

    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

# USER PROFILE

class ProfileView(generics.RetrieveUpdateAPIView):

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

# CATEGORY CRUD

class CategoryViewSet(viewsets.ModelViewSet):

    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

# PRODUCT CRUD, SEARCH AND FILTER


class ProductViewSet(viewsets.ModelViewSet):

    queryset = Product.objects.select_related('category').all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):

        products = Product.objects.select_related(
            'category'
        ).all()

        search = self.request.query_params.get('search')
        category = self.request.query_params.get('category')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        ordering = self.request.query_params.get('ordering')

        if search:
            products = products.filter(
                name__icontains=search
            )

        if category:
            products = products.filter(
                category_id=category
            )

        try:

            if min_price is not None:
                minimum = Decimal(min_price)

                if minimum < 0:
                    raise ValidationError(
                        {'min_price': 'Price cannot be negative'}
                    )

                products = products.filter(
                    price__gte=minimum
                )

            if max_price is not None:
                maximum = Decimal(max_price)

                if maximum < 0:
                    raise ValidationError(
                        {'max_price': 'Price cannot be negative'}
                    )

                products = products.filter(
                    price__lte=maximum
                )

            if (
                min_price is not None
                and max_price is not None
                and Decimal(min_price) > Decimal(max_price)
            ):
                raise ValidationError(
                    {'price': 'Minimum price cannot exceed maximum price'}
                )

        except InvalidOperation:
            raise ValidationError(
                {'price': 'Enter a valid price'}
            )

        if ordering in ['price', '-price', 'name', '-name']:
            products = products.order_by(ordering)

        return products

# CART API

class CartView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        serializer = CartSerializer(cart)

        return Response(serializer.data)

# ADD PRODUCT TO CART

class AddToCartView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)

        try:
            quantity = int(quantity)

            if quantity <= 0:
                raise ValueError

            product = Product.objects.get(id=product_id)

            if product.stock < quantity:
                return Response(
                    {'error': 'Insufficient stock'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            cart, created = Cart.objects.get_or_create(
                user=request.user
            )

            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={'quantity': quantity}
            )

            if not created:
                cart_item.quantity += quantity

            if cart_item.quantity > product.stock:
                return Response(
                    {'error': 'Requested quantity exceeds stock'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            cart_item.save()

            return Response(
                CartSerializer(cart).data,
                status=status.HTTP_200_OK
            )

        except (Product.DoesNotExist, ValueError, TypeError):
            return Response(
                {'error': 'Invalid product or quantity'},
                status=status.HTTP_400_BAD_REQUEST
            )

# UPDATE CART QUANTITY

class UpdateCartView(APIView):

    permission_classes = [IsAuthenticated]

    def put(self, request, pk):

        try:
            quantity = int(request.data.get('quantity'))

            if quantity <= 0:
                return Response(
                    {'error': 'Quantity must be positive'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            item = CartItem.objects.get(
                id=pk,
                cart__user=request.user
            )

            if quantity > item.product.stock:
                return Response(
                    {'error': 'Insufficient stock'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            item.quantity = quantity
            item.save()

            return Response(CartSerializer(item.cart).data)

        except (CartItem.DoesNotExist, ValueError, TypeError):
            return Response(
                {'error': 'Invalid cart item or quantity'},
                status=status.HTTP_400_BAD_REQUEST
            )

# REMOVE CART ITEM

class RemoveCartView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):

        try:
            item = CartItem.objects.get(
                id=pk,
                cart__user=request.user
            )

            cart = item.cart
            item.delete()

            return Response(CartSerializer(cart).data)

        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Cart item not found'},
                status=status.HTTP_404_NOT_FOUND
            )

# CLEAR CART

class ClearCartView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request):

        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        cart.items.all().delete()

        return Response({'message': 'Cart cleared'})

# CHECKOUT


class CheckoutView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        address = request.data.get('shipping_address', '').strip()
        phone = request.data.get('phone', '').strip()

        if not address:
            return Response(
                {'error': 'Delivery address is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(phone) < 10 or len(phone) > 15:
            return Response(
                {'error': 'Enter a valid phone number'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            with transaction.atomic():

                cart = Cart.objects.select_for_update().get(
                    user=request.user
                )

                cart_items = list(
                    cart.items.all()
                )

                if not cart_items:
                    return Response(
                        {'error': 'Your cart is empty'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                order_items = []
                total = 0

                # Check stock and calculate total

                for item in cart_items:

                    product = Product.objects.get(
                        id=item.product_id
                    )

                    if item.quantity <= 0:
                        raise ValueError('Invalid quantity')

                    if product.stock < item.quantity:
                        raise ValueError(
                            f'Not enough stock for {product.name}'
                        )

                    total += product.price * item.quantity

                    order_items.append(
                        (product, item.quantity, product.price)
                    )

                # Create order

                order = Order.objects.create(
                    user=request.user,
                    shipping_address=address,
                    phone=phone,
                    total_amount=total
                )

                # Save order items and reduce stock

                for product, quantity, price in order_items:

                    updated = Product.objects.filter(
                        id=product.id,
                        stock__gte=quantity
                    ).update(
                        stock=F('stock') - quantity
                    )

                    if updated == 0:
                        raise ValueError(
                            f'Insufficient stock for {product.name}'
                        )

                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=quantity,
                        price=price
                    )

                # Clear cart

                cart.items.all().delete()

            return Response(
                {
                    'message': 'Order placed successfully',
                    'order_id': order.id,
                    'total_amount': str(total)
                },
                status=status.HTTP_201_CREATED
            )

        except Cart.DoesNotExist:

            return Response(
                {'error': 'Cart not found'},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Product.DoesNotExist:

            return Response(
                {'error': 'A cart product no longer exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        except ValueError as e:

            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

# CUSTOMER ORDER HISTORY

class MyOrdersView(generics.ListAPIView):

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Order.objects.filter(
            user=self.request.user
        ).prefetch_related('items').order_by('-created_at')




# ADMIN - VIEW ALL CUSTOMER ORDERS

class AdminOrdersView(generics.ListAPIView):

    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):

        return Order.objects.all().prefetch_related(
            'items'
        ).order_by('-created_at')




# ORDER DETAILS AND TRACKING

class OrderDetailView(generics.RetrieveAPIView):

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Order.objects.filter(
            user=self.request.user
        ).prefetch_related('items')

# CANCEL ORDER

class CancelOrderView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        try:

            with transaction.atomic():

                order = Order.objects.select_for_update().get(
                    id=pk,
                    user=request.user
                )

                if order.status not in ['Pending', 'Confirmed']:
                    return Response(
                        {'error': 'This order cannot be cancelled'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                for item in order.items.all():

                    Product.objects.filter(
                        id=item.product_id
                    ).update(
                        stock=F('stock') + item.quantity
                    )

                order.status = 'Cancelled'
                order.save(update_fields=['status'])

                return Response({
                    'message': 'Order cancelled successfully'
                })

        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )

# ADMIN ORDER STATUS UPDATE


class AdminOrderStatusView(APIView):

    permission_classes = [IsAdminUser]

    def patch(self, request, pk):

        try:

            order = Order.objects.get(id=pk)

            new_status = request.data.get('status')

            allowed_transitions = {
                'Pending': ['Confirmed'],
                'Confirmed': ['Packed'],
                'Packed': ['Shipped'],
                'Shipped': ['Delivered'],
            }

            if new_status not in allowed_transitions.get(
                order.status, []
            ):

                return Response(
                    {
                        'error': 'Invalid order status transition'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            order.status = new_status

            order.save(update_fields=['status'])

            return Response(
                {
                    'message': 'Order status updated successfully',
                    'order_id': order.id,
                    'status': order.status
                }
            )

        except Order.DoesNotExist:

            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )

# WISHLIST

class WishlistView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        wishlist = Wishlist.objects.filter(
            user=request.user
        )

        serializer = WishlistSerializer(
            wishlist,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        product_id = request.data.get('product_id')

        try:
            product = Product.objects.get(id=product_id)

            item, created = Wishlist.objects.get_or_create(
                user=request.user,
                product=product
            )

            return Response(
                WishlistSerializer(item).data,
                status=(
                    status.HTTP_201_CREATED
                    if created else status.HTTP_200_OK
                )
            )

        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )

# REMOVE WISHLIST ITEM

class RemoveWishlistView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):

        deleted, count = Wishlist.objects.filter(
            id=pk,
            user=request.user
        ).delete()

        if not deleted:
            return Response(
                {'error': 'Wishlist item not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({'message': 'Removed from wishlist'})