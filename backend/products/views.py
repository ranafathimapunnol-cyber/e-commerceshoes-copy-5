from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

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
    sub_category = request.GET.get('sub_category')

    if sub_category:
        products = Product.objects.filter(sub_category_id=sub_category)
    else:
        products = Product.objects.all()

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


@api_view(['POST'])
def createProduct(request):
    serializer = ProductSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['PUT'])
def updateProduct(request, pk):
    try:
        product = Product.objects.get(id=pk)
    except Product.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

    serializer = ProductSerializer(product, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(['DELETE'])
def deleteProduct(request, pk):
    try:
        product = Product.objects.get(id=pk)
        product.delete()
        return Response({"message": "Deleted"})
    except Product.DoesNotExist:
        return Response({"error": "Not found"}, status=404)


# =========================
# CART
# =========================

class CartListView(APIView):
    def get(self, request):
        cart_items = Cart.objects.filter(user=request.user)
        serializer = CartSerializer(
            cart_items, many=True, context={'request': request})
        return Response(serializer.data)


class AddToCartView(APIView):
    def post(self, request):
        user = request.user
        product_id = request.data.get('product')

        cart_item, created = Cart.objects.get_or_create(
            user=user,
            product_id=product_id
        )

        if not created:
            cart_item.quantity += 1
            cart_item.save()

        serializer = CartSerializer(cart_item, context={'request': request})
        return Response(serializer.data, status=201)


class RemoveCartItemView(APIView):
    def delete(self, request, pk):
        try:
            item = Cart.objects.get(id=pk, user=request.user)
            item.delete()
            return Response({"message": "Removed"})
        except Cart.DoesNotExist:
            return Response({"error": "Not found"}, status=404)
