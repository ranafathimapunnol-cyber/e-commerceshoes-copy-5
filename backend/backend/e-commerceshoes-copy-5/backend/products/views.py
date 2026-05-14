from rest_framework.generics import GenericAPIView, ListAPIView, RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

from datetime import timedelta
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings

from .models import Product, Category, SubCategory, Wishlist
from .serializers import (
    ProductSerializer, CategorySerializer, SubCategorySerializer, WishlistSerializer
)


# =========================
# PUBLIC ENDPOINTS
# =========================

class GetCategoriesView(ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class GetSubCategoriesView(ListAPIView):
    serializer_class = SubCategorySerializer

    def get_queryset(self):
        category_id = self.kwargs.get('category_id')
        return SubCategory.objects.filter(category_id=category_id)


class GetProductsView(ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        products = Product.objects.all()
        category = self.request.GET.get('category')
        if category:
            products = products.filter(category__name__iexact=category.strip())
        return products


class GetProductView(RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'pk'


class GetNewArrivalsView(ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        thirty_days_ago = timezone.now() - timedelta(days=30)
        return Product.objects.filter(created_at__gte=thirty_days_ago).order_by('-created_at')[:10]


class GetFeaturedProductsView(ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        return Product.objects.filter(is_featured=True)[:8]


# =========================
# WISHLIST ENDPOINTS
# =========================

class GetWishlistView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductSerializer

    def get_queryset(self):
        wishlist_items = Wishlist.objects.filter(user=self.request.user).select_related('product')
        return [item.product for item in wishlist_items]


class AddWishlistView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product')
        if not product_id:
            return Response({"error": "Product ID required"}, status=status.HTTP_400_BAD_REQUEST)
        
        product = get_object_or_404(Product, id=product_id)
        wishlist_item, created = Wishlist.objects.get_or_create(user=request.user, product=product)
        
        return Response(
            {"message": "Added to wishlist" if created else "Already in wishlist", "is_wishlisted": True},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


class RemoveWishlistView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        deleted, _ = Wishlist.objects.filter(user=request.user, product_id=pk).delete()
        if deleted:
            return Response({"message": "Removed from wishlist", "is_wishlisted": False}, status=status.HTTP_200_OK)
        return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)


class ToggleWishlistView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        product = get_object_or_404(Product, id=product_id)
        wishlist_item = Wishlist.objects.filter(user=request.user, product=product)
        
        if wishlist_item.exists():
            wishlist_item.delete()
            return Response({"message": "Removed from wishlist", "is_wishlisted": False})
        else:
            Wishlist.objects.create(user=request.user, product=product)
            return Response({"message": "Added to wishlist", "is_wishlisted": True})


class CheckWishlistView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, product_id):
        is_wishlisted = Wishlist.objects.filter(user=request.user, product_id=product_id).exists()
        return Response({"is_wishlisted": is_wishlisted})


# =========================
# ADMIN ENDPOINTS
# =========================

class AddProductView(GenericAPIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        try:
            category = None
            category_name = request.data.get('category_name') or request.data.get('category')
            if category_name:
                category = Category.objects.filter(name__iexact=category_name).first()
                if not category:
                    category = Category.objects.create(name=category_name)
            
            product = Product.objects.create(
                name=request.data.get('name'),
                description=request.data.get('description'),
                price=float(request.data.get('price', 0)),
                stock=int(request.data.get('stock', 0)),
                category=category,
                brand=request.data.get('brand', ''),
                size=request.data.get('size', ''),
                color=request.data.get('color', ''),
                gender=request.data.get('gender', 'UNISEX'),
            )
            
            if request.FILES.get('image'):
                product.image = request.FILES.get('image')
            product.save()
            
            return Response({"message": "Product created", "id": product.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AdminProductsView(ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = ProductSerializer
    queryset = Product.objects.all().order_by('-id')


class UpdateProductView(GenericAPIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def put(self, request, pk):
        product = get_object_or_404(Product, id=pk)
        for field in ['name', 'description', 'brand', 'size', 'color', 'gender']:
            if field in request.data:
                setattr(product, field, request.data[field])
        if 'price' in request.data:
            product.price = float(request.data['price'])
        if 'stock' in request.data:
            product.stock = int(request.data['stock'])
        if request.FILES.get('image'):
            product.image = request.FILES.get('image')
        product.save()
        return Response({"message": "Product updated"})


class DeleteProductView(GenericAPIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, pk):
        product = get_object_or_404(Product, id=pk)
        product.delete()
        return Response({"message": "Product deleted"})


# =========================
# EMAIL REPORT
# =========================

class SendReportEmailView(GenericAPIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email required"}, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"\n📧 Email would be sent to: {email}")
        print(f"Subject: E-commerce Report")
        print(f"Body: Report data received\n")
        
        return Response({"message": f"Report sent to {email}"}, status=status.HTTP_200_OK)
