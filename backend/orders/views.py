# orders/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Order, OrderItem
from products.models import Product


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

        # Check if all products exist
        product_ids = []
        for item in items:
            product_id = item.get('product')
            if not product_id:
                return Response({'error': 'Product ID missing in item'}, status=400)
            product_ids.append(product_id)

        existing_products = Product.objects.filter(id__in=product_ids)
        existing_ids = set(existing_products.values_list('id', flat=True))

        missing_ids = set(product_ids) - existing_ids
        if missing_ids:
            return Response({
                'error': f'Products not found with IDs: {list(missing_ids)}'
            }, status=400)

        # Create Order
        order = Order.objects.create(
            user=request.user,
            total_price=total_price,
            is_paid=(payment_method != 'cod'),
            status='pending',
            shipping_address=shipping_address,
            payment_method=payment_method
        )

        # Create Order Items
        order_total = 0
        for item in items:
            product = Product.objects.get(id=item['product'])
            quantity = item['quantity']
            item_price = product.price * quantity

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
