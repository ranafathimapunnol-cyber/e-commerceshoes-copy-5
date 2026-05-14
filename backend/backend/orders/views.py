# orders/views.py - COMPLETE WORKING VERSION WITH STOCK DEDUCTION
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from .models import Order, OrderItem
from products.models import Product
from .serializers import OrderSerializer


# =========================
# CREATE ORDER (WITH STOCK DEDUCTION)
# =========================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    try:
        data = request.data
        print("Received data:", data)

        items = data.get('items', [])
        total_price = data.get('total_price')
        shipping_address = data.get('shipping_address', '')
        payment_method = data.get('payment_method', 'cod')

        # Validate required fields
        if not items:
            return Response({'error': 'No items in order'}, status=400)

        if not total_price:
            return Response({'error': 'Total price is required'}, status=400)

        # ✅ CHECK STOCK FIRST before creating order
        stock_errors = []
        for item in items:
            product_id = item.get('product')
            quantity = item.get('quantity', 1)

            try:
                product = Product.objects.get(id=product_id)
                if product.stock < quantity:
                    stock_errors.append(
                        f"{product.name}: Only {product.stock} available, you requested {quantity}")
            except Product.DoesNotExist:
                return Response({'error': f'Product with ID {product_id} not found'}, status=400)

        # If stock errors, return error without creating order
        if stock_errors:
            return Response({'error': 'Insufficient stock', 'details': stock_errors}, status=400)

        # Create Order
        order = Order.objects.create(
            user=request.user,
            total_price=total_price,
            is_paid=(payment_method != 'cod'),
            status='pending',
            shipping_address=shipping_address,
            payment_method=payment_method
        )

        # Create Order Items AND DEDUCT STOCK
        order_total = 0
        for item in items:
            product = Product.objects.get(id=item['product'])
            quantity = item.get('quantity', 1)
            item_price = product.price * quantity

            # ✅ DEDUCT STOCK
            product.stock -= quantity
            product.save()

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=item_price
            )
            order_total += item_price

        # Update order total if needed
        order.total_price = order_total
        order.save()

        print(
            f"✅ Order {order.id} created. Stock deducted for {len(items)} items.")

        return Response({
            'success': True,
            'message': 'Order placed successfully',
            'order_id': order.id,
            'status': order.status,
            'total_price': str(order.total_price)
        }, status=201)

    except Exception as e:
        print("Error creating order:", str(e))
        return Response({'error': str(e)}, status=500)


# =========================
# MY ORDERS (USER)
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders(request):
    try:
        orders = Order.objects.filter(
            user=request.user).order_by('-created_at')

        data = []
        for order in orders:
            items = OrderItem.objects.filter(order=order)
            order_items = []

            for item in items:
                order_items.append({
                    'id': item.id,
                    'quantity': item.quantity,
                    'price': str(item.price),
                    'product': {
                        'id': item.product.id,
                        'name': item.product.name,
                        'price': str(item.product.price),
                        'image': item.product.image.url if item.product.image else None
                    }
                })

            data.append({
                'id': order.id,
                'total_price': str(order.total_price),
                'is_paid': order.is_paid,
                'status': order.status,
                'status_display': dict(Order.STATUS_CHOICES).get(order.status, order.status),
                'created_at': order.created_at,
                'updated_at': order.updated_at,
                'shipping_address': order.shipping_address,
                'payment_method': order.payment_method,
                'tracking_number': order.tracking_number,
                'items': order_items
            })

        return Response(data)
    except Exception as e:
        print("Error fetching orders:", str(e))
        return Response({'error': str(e)}, status=500)


# =========================
# ORDER DETAIL (USER)
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_detail(request, order_id):
    """Get single order details"""
    try:
        order = Order.objects.get(id=order_id, user=request.user)
        items = OrderItem.objects.filter(order=order)

        order_items = []
        for item in items:
            order_items.append({
                'id': item.id,
                'quantity': item.quantity,
                'price': str(item.price),
                'product': {
                    'id': item.product.id,
                    'name': item.product.name,
                    'price': str(item.product.price),
                    'image': item.product.image.url if item.product.image else None
                }
            })

        data = {
            'id': order.id,
            'total_price': str(order.total_price),
            'is_paid': order.is_paid,
            'status': order.status,
            'status_display': dict(Order.STATUS_CHOICES).get(order.status, order.status),
            'created_at': order.created_at,
            'updated_at': order.updated_at,
            'shipping_address': order.shipping_address,
            'payment_method': order.payment_method,
            'tracking_number': order.tracking_number,
            'items': order_items
        }

        return Response(data)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)
    except Exception as e:
        print("Error fetching order detail:", str(e))
        return Response({'error': str(e)}, status=500)


# =========================
# UPDATE ORDER STATUS (USER)
# =========================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_order_status(request, order_id):
    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)

    status_flow = {
        'pending': 'confirmed',
        'confirmed': 'processing',
        'processing': 'shipped',
        'shipped': 'out_for_delivery',
        'out_for_delivery': 'delivered'
    }

    if order.status in status_flow:
        order.status = status_flow[order.status]
        order.save()
        return Response({'status': order.status, 'message': 'Status updated'})

    return Response({'error': 'Invalid status'}, status=400)


# =========================
# ADMIN - GET ALL ORDERS
# =========================
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_orders(request):
    """Get all orders for admin panel"""
    orders = Order.objects.all().order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


# =========================
# ADMIN - GET/UPDATE SINGLE ORDER
# =========================
@api_view(['GET', 'PATCH', 'PUT'])
@permission_classes([IsAdminUser])
def admin_order_detail(request, order_id):
    """Admin: Get or update a single order"""
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)

    if request.method == 'GET':
        serializer = OrderSerializer(order)
        return Response(serializer.data)

    elif request.method in ['PATCH', 'PUT']:
        if 'status' in request.data:
            order.status = request.data['status']
            order.save()
            return Response({
                "message": "Order status updated successfully",
                "id": order.id,
                "status": order.status
            })

        return Response({"error": "Invalid data"}, status=400)


# =========================
# ADMIN - CANCEL ORDER (RESTORE STOCK)
# =========================
@api_view(['POST'])
@permission_classes([IsAdminUser])
def cancel_order(request, order_id):
    """Admin: Cancel order and restore stock"""
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)

    if order.status == 'cancelled':
        return Response({"error": "Order already cancelled"}, status=400)

    # ✅ Restore stock for all items in the order
    for item in order.items.all():
        product = item.product
        product.stock += item.quantity
        product.save()
        print(f"Restored {item.quantity} stock for {product.name}")

    order.status = 'cancelled'
    order.save()

    return Response({
        "message": "Order cancelled and stock restored",
        "id": order.id,
        "status": order.status
    }, status=200)


# =========================
# ADMIN - DELETE ORDER
# =========================
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_order(request, pk):
    """Admin: Delete order"""
    try:
        order = Order.objects.get(id=pk)
        # First restore stock before deleting
        for item in order.items.all():
            product = item.product
            product.stock += item.quantity
            product.save()
        order.delete()
        return Response({"message": "Order deleted and stock restored"}, status=status.HTTP_200_OK)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
