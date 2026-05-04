# products/views.py
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from datetime import timedelta
from django.utils import timezone
from django.shortcuts import get_object_or_404

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
# GET ALL PRODUCTS (FILTERED)
# =========================
@api_view(['GET'])
def getProducts(request):
    category = request.GET.get('category')
    sub_category = request.GET.get('sub_category')
    search = request.GET.get('search')
    gender = request.GET.get('gender')
    is_featured = request.GET.get('is_featured')

    products = Product.objects.all()

    if category:
        category = category.strip()
        if category.isdigit():
            products = products.filter(category_id=category)
        else:
            products = products.filter(category__name__iexact=category)

    if sub_category:
        sub_category = sub_category.strip()
        if sub_category.isdigit():
            products = products.filter(sub_category_id=sub_category)
        else:
            products = products.filter(sub_category__name__iexact=sub_category)

    if search:
        products = products.filter(name__icontains=search)
    
    if gender:
        products = products.filter(gender__iexact=gender)
    
    if is_featured:
        products = products.filter(is_featured=True)

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


# =========================
# WISHLIST - GET USER'S WISHLIST
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getWishlist(request):
    wishlist_items = Wishlist.objects.filter(user=request.user).select_related('product')
    products = [item.product for item in wishlist_items]
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


# =========================
# WISHLIST - ADD PRODUCT
# =========================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addWishlist(request):
    product_id = request.data.get('product')
    
    if not product_id:
        return Response(
            {"error": "Product ID is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    # Check if already in wishlist
    wishlist_item, created = Wishlist.objects.get_or_create(
        user=request.user,
        product=product
    )

    if created:
        return Response(
            {"message": "Added to wishlist", "is_wishlisted": True},
            status=status.HTTP_201_CREATED
        )
    else:
        return Response(
            {"message": "Product already in wishlist", "is_wishlisted": True},
            status=status.HTTP_200_OK
        )


# =========================
# WISHLIST - REMOVE PRODUCT
# =========================
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def removeWishlist(request, pk):
    try:
        # Delete by product_id
        wishlist_item = Wishlist.objects.get(user=request.user, product_id=pk)
        wishlist_item.delete()
        return Response(
            {"message": "Removed from wishlist", "is_wishlisted": False},
            status=status.HTTP_200_OK
        )
    except Wishlist.DoesNotExist:
        return Response(
            {"error": "Item not found in wishlist"},
            status=status.HTTP_404_NOT_FOUND
        )


# =========================
# WISHLIST - TOGGLE (Add/Remove)
# =========================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggleWishlist(request):
    product_id = request.data.get('product_id')
    
    if not product_id:
        return Response(
            {"error": "Product ID is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    product = get_object_or_404(Product, id=product_id)
    
    wishlist_item = Wishlist.objects.filter(user=request.user, product=product)
    
    if wishlist_item.exists():
        wishlist_item.delete()
        return Response({
            "message": "Removed from wishlist",
            "is_wishlisted": False
        }, status=status.HTTP_200_OK)
    else:
        Wishlist.objects.create(user=request.user, product=product)
        return Response({
            "message": "Added to wishlist",
            "is_wishlisted": True
        }, status=status.HTTP_201_CREATED)


# =========================
# WISHLIST - CHECK IF PRODUCT IS IN WISHLIST
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def checkWishlist(request, product_id):
    is_wishlisted = Wishlist.objects.filter(
        user=request.user, 
        product_id=product_id
    ).exists()
    
    return Response({"is_wishlisted": is_wishlisted})


# =========================
# NEW ARRIVALS
# =========================
@api_view(['GET'])
def get_new_arrivals(request):
    # Get products from last 30 days or latest 10
    thirty_days_ago = timezone.now() - timedelta(days=30)
    products = Product.objects.filter(created_at__gte=thirty_days_ago).order_by('-created_at')[:10]
    
    # If not enough products, just get latest
    if products.count() < 4:
        products = Product.objects.all().order_by('-created_at')[:10]
    
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


# =========================
# FEATURED PRODUCTS
# =========================
@api_view(['GET'])
def getFeaturedProducts(request):
    products = Product.objects.filter(is_featured=True)[:8]
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)