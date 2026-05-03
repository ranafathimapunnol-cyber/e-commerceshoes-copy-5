from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from .models import (
    Product,
    Category,
    SubCategory,
    Wishlist
)

from .serializers import (
    ProductSerializer,
    CategorySerializer,
    SubCategorySerializer,
    WishlistSerializer
)


# =========================
# GET ALL CATEGORIES
# =========================
@api_view(['GET'])
def getCategories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)


# =========================
# GET SUBCATEGORIES
# =========================
@api_view(['GET'])
def getSubCategories(request, category_id):
    subcategories = SubCategory.objects.filter(category_id=category_id)
    serializer = SubCategorySerializer(subcategories, many=True)
    return Response(serializer.data)


# =========================
# GET ALL PRODUCTS (FIXED FILTERING)
# =========================
@api_view(['GET'])
def getProducts(request):
    category = request.GET.get('category')
    sub_category = request.GET.get('sub_category')
    search = request.GET.get('search')

    products = Product.objects.all()

    # =========================
    # CATEGORY FILTER (ROBUST)
    # supports BOTH id and name
    # =========================
    if category:
        category = category.strip()

        if category.isdigit():
            products = products.filter(category_id=category)
        else:
            products = products.filter(category__name__iexact=category)

    # =========================
    # SUBCATEGORY FILTER
    # =========================
    if sub_category:
        sub_category = sub_category.strip()

        if sub_category.isdigit():
            products = products.filter(sub_category_id=sub_category)
        else:
            products = products.filter(sub_category__name__iexact=sub_category)

    # =========================
    # SEARCH FILTER
    # =========================
    if search:
        products = products.filter(name__icontains=search)

    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


# =========================
# GET SINGLE PRODUCT
# =========================
@api_view(['GET'])
def getProduct(request, pk):
    try:
        product = Product.objects.get(id=pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data)

    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found"},
            status=status.HTTP_404_NOT_FOUND
        )


# GET WISHLIST


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getWishlist(request):

    wishlist = Wishlist.objects.filter(user=request.user)

    serializer = WishlistSerializer(wishlist, many=True)

    return Response(serializer.data)


# ADD TO WISHLIST
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addWishlist(request):

    product_id = request.data.get('product')

    product = Product.objects.get(id=product_id)

    item, created = Wishlist.objects.get_or_create(
        user=request.user,
        product=product
    )

    return Response({
        'message': 'Added to wishlist'
    })


# REMOVE WISHLIST
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def removeWishlist(request, pk):

    item = Wishlist.objects.get(id=pk)

    item.delete()

    return Response({
        'message': 'Removed'
    })
