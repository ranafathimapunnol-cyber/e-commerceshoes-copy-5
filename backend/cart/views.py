from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Cart, CartItem
from .serializers import CartSerializer
from products.models import Product


# =========================
# GET CART
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    try:
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# =========================
# ADD TO CART
# =========================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    try:
        cart, _ = Cart.objects.get_or_create(user=request.user)

        product_id = request.data.get('product')
        quantity = int(request.data.get('quantity', 1))

        if not product_id:
            return Response({"error": "Product ID missing"}, status=400)

        product = Product.objects.filter(id=product_id).first()

        if not product:
            return Response({"error": "Product not found"}, status=404)

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product
        )

        if not created:
            item.quantity += quantity
        else:
            item.quantity = quantity

        item.save()

        return Response({"message": "Item added successfully"})

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# =========================
# UPDATE CART
# =========================
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart(request):
    try:
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 1))

        item = CartItem.objects.get(id=item_id)

        if quantity <= 0:
            item.delete()
        else:
            item.quantity = quantity
            item.save()

        return Response({"message": "Updated"})

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# =========================
# REMOVE ITEM
# =========================
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_item(request, pk):
    try:
        CartItem.objects.get(id=pk).delete()
        return Response({"message": "Removed"})

    except Exception as e:
        return Response({"error": str(e)}, status=500)
