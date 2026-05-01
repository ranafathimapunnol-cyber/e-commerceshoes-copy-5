from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Product, Category, SubCategory, Cart
from .serializers import (
    ProductSerializer,
    CategorySerializer,
    SubCategorySerializer,
    CartSerializer
)

# =========================
# CATEGORY
# =========================


@api_view(['GET'])
def getCategories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)


# =========================
# SUB CATEGORY
# =========================

@api_view(['GET'])
def getSubCategories(request, category_id):
    subs = SubCategory.objects.filter(category_id=category_id)
    serializer = SubCategorySerializer(subs, many=True)
    return Response(serializer.data)


# =========================
# PRODUCTS
# =========================
@api_view(['GET'])
def getProducts(request):

    category = request.GET.get('category')

    products = Product.objects.all()

    if category:
        products = products.filter(category__name__iexact=category)

    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def getProduct(request, pk):
    try:
        product = Product.objects.get(id=pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({"error": "Not found"}, status=404)


# =========================
# CART (AUTH REQUIRED)
# =========================

class CartListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart_items = Cart.objects.filter(user=request.user)
        serializer = CartSerializer(cart_items, many=True)
        return Response(serializer.data)


class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product')

        if not product_id:
            return Response({'error': 'Product ID required'}, status=400)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)

        cart_item, created = Cart.objects.get_or_create(
            user=request.user,
            product=product
        )

        return Response({'message': 'Added to cart'}, status=201)


class RemoveCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            item = Cart.objects.get(id=pk, user=request.user)
            item.delete()
            return Response({"message": "Removed"})
        except Cart.DoesNotExist:
            return Response({"error": "Not found"}, status=404)
