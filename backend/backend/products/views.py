# products/views.py - COMPLETE FIXED VERSION WITH STOCK HANDLING
from rest_framework.permissions import IsAuthenticated, IsAdminUser
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
# PUBLIC ENDPOINTS (No login required)
# =========================

# GET ALL CATEGORIES
@api_view(['GET'])
def getCategories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)


# GET SUBCATEGORIES
@api_view(['GET'])
def getSubCategories(request, category_id):
    subcategories = SubCategory.objects.filter(category_id=category_id)
    serializer = SubCategorySerializer(subcategories, many=True)
    return Response(serializer.data)


# GET ALL PRODUCTS (FILTERED) - PUBLIC
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
        # Try to filter by category name first
        category_obj = Category.objects.filter(name__iexact=category).first()
        if category_obj:
            products = products.filter(category=category_obj)
        elif category.isdigit():
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


# GET SINGLE PRODUCT - PUBLIC
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


# NEW ARRIVALS - PUBLIC
@api_view(['GET'])
def get_new_arrivals(request):
    thirty_days_ago = timezone.now() - timedelta(days=30)
    products = Product.objects.filter(
        created_at__gte=thirty_days_ago).order_by('-created_at')[:10]

    if products.count() < 4:
        products = Product.objects.all().order_by('-created_at')[:10]

    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


# FEATURED PRODUCTS - PUBLIC
@api_view(['GET'])
def getFeaturedProducts(request):
    products = Product.objects.filter(is_featured=True)[:8]
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


# =========================
# WISHLIST ENDPOINTS (Login required)
# =========================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getWishlist(request):
    wishlist_items = Wishlist.objects.filter(
        user=request.user).select_related('product')
    products = [item.product for item in wishlist_items]
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


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


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def removeWishlist(request, pk):
    try:
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def checkWishlist(request, product_id):
    is_wishlisted = Wishlist.objects.filter(
        user=request.user,
        product_id=product_id
    ).exists()

    return Response({"is_wishlisted": is_wishlisted})


# =========================
# ADMIN ENDPOINTS (Admin only)
# =========================

@api_view(['POST'])
@permission_classes([IsAdminUser])
def add_product(request):
    """Admin: Add new product with category support"""
    try:
        # Get category name from frontend
        category_name = request.data.get(
            'category_name') or request.data.get('category')
        category = None

        if category_name:
            category = Category.objects.filter(
                name__iexact=category_name).first()
            if not category:
                category = Category.objects.create(name=category_name)
                print(f"Created new category: {category_name}")

        # ✅ Convert stock to integer
        stock_value = request.data.get('stock')
        if stock_value:
            try:
                stock_value = int(stock_value)
            except ValueError:
                stock_value = 0
        else:
            stock_value = 0

        # ✅ Convert price to decimal
        price_value = request.data.get('price')
        if price_value:
            try:
                price_value = float(price_value)
            except ValueError:
                price_value = 0
        else:
            price_value = 0

        # Create product
        product = Product.objects.create(
            name=request.data.get('name'),
            description=request.data.get('description'),
            price=price_value,
            stock=stock_value,
            category=category,
        )

        # Optional fields
        if request.data.get('brand'):
            product.brand = request.data.get('brand')
        if request.data.get('size'):
            product.size = request.data.get('size')
        if request.data.get('color'):
            product.color = request.data.get('color')
        if request.data.get('gender'):
            product.gender = request.data.get('gender')
        if request.data.get('sub_category'):
            product.sub_category_id = request.data.get('sub_category')

        # Handle image
        if request.FILES.get('image'):
            product.image = request.FILES.get('image')

        product.save()

        print(
            f"✅ Product saved: {product.name}, Stock: {product.stock}, Price: {product.price}")

        serializer = ProductSerializer(product)
        return Response({
            "message": "Product created successfully",
            "id": product.id,
            "stock": product.stock,
            "category": category_name,
            "product": serializer.data
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(f"Error adding product: {str(e)}")
        return Response({
            "error": str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_products(request):
    """Admin: Get all products"""
    products = Product.objects.all().order_by('-id')
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


# ✅ UPDATE PRODUCT - FIXED STOCK HANDLING
@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_product(request, pk):
    """Admin: Update existing product"""
    try:
        product = Product.objects.get(id=pk)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

    try:
        # Update basic fields
        if 'name' in request.data:
            product.name = request.data['name']
        if 'description' in request.data:
            product.description = request.data['description']
        if 'price' in request.data:
            try:
                product.price = float(request.data['price'])
            except ValueError:
                pass
        if 'stock' in request.data:
            try:
                product.stock = int(request.data['stock'])  # ✅ Convert to int
            except ValueError:
                product.stock = 0
        if 'brand' in request.data:
            product.brand = request.data['brand']
        if 'size' in request.data:
            product.size = request.data['size']
        if 'color' in request.data:
            product.color = request.data['color']
        if 'gender' in request.data:
            product.gender = request.data['gender']

        # Handle category by name
        if 'category_name' in request.data or 'category' in request.data:
            category_name = request.data.get(
                'category_name') or request.data.get('category')
            if category_name:
                category = Category.objects.filter(
                    name__iexact=category_name).first()
                if not category:
                    category = Category.objects.create(name=category_name)
                product.category = category

        # Handle sub_category
        if 'sub_category' in request.data:
            product.sub_category_id = request.data.get('sub_category')

        # Handle image update
        if request.FILES.get('image'):
            product.image = request.FILES.get('image')

        product.save()

        print(
            f"✅ Product updated: {product.name}, Stock: {product.stock}, Price: {product.price}")

        serializer = ProductSerializer(product)
        return Response({
            "message": "Product updated successfully",
            "stock": product.stock,
            "product": serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error updating product: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ✅ DELETE PRODUCT
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_product(request, pk):
    """Admin: Delete product"""
    try:
        product = Product.objects.get(id=pk)
        product.delete()
        return Response({"message": "Product deleted successfully"}, status=status.HTTP_200_OK)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
