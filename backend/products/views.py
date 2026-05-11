# products/views.py - CONVERTED TO GENERIC VIEWS (ALL FEATURES PRESERVED)
from rest_framework.generics import GenericAPIView, ListAPIView, RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

from datetime import timedelta
from django.utils import timezone
from django.shortcuts import get_object_or_404

# Add these imports for email functionality
from django.core.mail import send_mail
from django.conf import settings

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
# PUBLIC ENDPOINTS (No login required) - GENERIC VIEWS
# =========================

# GET ALL CATEGORIES
class GetCategoriesView(ListAPIView):
    """Get all categories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


# GET SUBCATEGORIES
class GetSubCategoriesView(ListAPIView):
    """Get subcategories for a category"""
    serializer_class = SubCategorySerializer

    def get_queryset(self):
        category_id = self.kwargs.get('category_id')
        return SubCategory.objects.filter(category_id=category_id)


# GET ALL PRODUCTS (FILTERED) - PUBLIC
class GetProductsView(ListAPIView):
    """Get all products with filtering"""
    serializer_class = ProductSerializer

    def get_queryset(self):
        products = Product.objects.all()

        # Apply filters
        category = self.request.GET.get('category')
        sub_category = self.request.GET.get('sub_category')
        search = self.request.GET.get('search')
        gender = self.request.GET.get('gender')
        is_featured = self.request.GET.get('is_featured')

        if category:
            category = category.strip()
            category_obj = Category.objects.filter(
                name__iexact=category).first()
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
                products = products.filter(
                    sub_category__name__iexact=sub_category)

        if search:
            products = products.filter(name__icontains=search)

        if gender:
            products = products.filter(gender__iexact=gender)

        if is_featured:
            products = products.filter(is_featured=True)

        return products


# GET SINGLE PRODUCT - PUBLIC
class GetProductView(RetrieveAPIView):
    """Get single product by ID"""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'pk'


# NEW ARRIVALS - PUBLIC
class GetNewArrivalsView(ListAPIView):
    """Get new arrivals (last 30 days)"""
    serializer_class = ProductSerializer

    def get_queryset(self):
        thirty_days_ago = timezone.now() - timedelta(days=30)
        products = Product.objects.filter(
            created_at__gte=thirty_days_ago
        ).order_by('-created_at')[:10]

        if products.count() < 4:
            products = Product.objects.all().order_by('-created_at')[:10]

        return products


# FEATURED PRODUCTS - PUBLIC
class GetFeaturedProductsView(ListAPIView):
    """Get featured products"""
    serializer_class = ProductSerializer

    def get_queryset(self):
        return Product.objects.filter(is_featured=True)[:8]


# =========================
# WISHLIST ENDPOINTS (Login required) - GENERIC VIEWS
# =========================

class GetWishlistView(ListAPIView):
    """Get user's wishlist"""
    permission_classes = [IsAuthenticated]
    serializer_class = ProductSerializer

    def get_queryset(self):
        wishlist_items = Wishlist.objects.filter(
            user=self.request.user
        ).select_related('product')
        return [item.product for item in wishlist_items]


class AddWishlistView(GenericAPIView):
    """Add product to wishlist"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
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


class RemoveWishlistView(GenericAPIView):
    """Remove product from wishlist"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            wishlist_item = Wishlist.objects.get(
                user=request.user, product_id=pk)
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


class ToggleWishlistView(GenericAPIView):
    """Toggle product in wishlist (add if not exists, remove if exists)"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')

        if not product_id:
            return Response(
                {"error": "Product ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        product = get_object_or_404(Product, id=product_id)
        wishlist_item = Wishlist.objects.filter(
            user=request.user, product=product)

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


class CheckWishlistView(GenericAPIView):
    """Check if product is in user's wishlist"""
    permission_classes = [IsAuthenticated]

    def get(self, request, product_id):
        is_wishlisted = Wishlist.objects.filter(
            user=request.user,
            product_id=product_id
        ).exists()

        return Response({"is_wishlisted": is_wishlisted})


# =========================
# ADMIN ENDPOINTS (Admin only) - GENERIC VIEWS
# =========================

class AddProductView(GenericAPIView):
    """Admin: Add new product with category support"""
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        try:
            category_name = request.data.get(
                'category_name') or request.data.get('category')
            category = None

            if category_name:
                category = Category.objects.filter(
                    name__iexact=category_name).first()
                if not category:
                    category = Category.objects.create(name=category_name)
                    print(f"Created new category: {category_name}")

            # Convert stock to integer
            stock_value = request.data.get('stock')
            if stock_value:
                try:
                    stock_value = int(stock_value)
                except ValueError:
                    stock_value = 0
            else:
                stock_value = 0

            # Convert price to decimal
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


class AdminProductsView(ListAPIView):
    """Admin: Get all products"""
    permission_classes = [IsAdminUser]
    serializer_class = ProductSerializer
    queryset = Product.objects.all().order_by('-id')


class UpdateProductView(GenericAPIView):
    """Admin: Update existing product"""
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def put(self, request, pk):
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
                    product.stock = int(request.data['stock'])
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


class DeleteProductView(GenericAPIView):
    """Admin: Delete product"""
    permission_classes = [IsAdminUser]

    def delete(self, request, pk):
        try:
            product = Product.objects.get(id=pk)
            product.delete()
            return Response({"message": "Product deleted successfully"}, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)


# =========================
# EMAIL REPORT ENDPOINT (Admin only)
# =========================

class SendReportEmailView(GenericAPIView):
    """Admin: Send report via email"""
    permission_classes = [IsAdminUser]

    def post(self, request):
        try:
            email = request.data.get('email')
            report_data = request.data.get('report_data', {})
            message = request.data.get('message', '')
            
            if not email:
                return Response(
                    {'error': 'Email is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create email content
            subject = f"E-commerce Report - {report_data.get('dateRange', 'Monthly')}"
            
            body = f"""
            Report Generated: {report_data.get('generatedAt', 'N/A')}
            Date Range: {report_data.get('dateRange', 'N/A')}
            
            SUMMARY:
            - Total Revenue: {report_data.get('reportData', {}).get('totalRevenue', 0)}
            - Total Orders: {report_data.get('reportData', {}).get('totalOrders', 0)}
            - Total Products: {report_data.get('reportData', {}).get('totalProducts', 0)}
            - Total Users: {report_data.get('reportData', {}).get('totalUsers', 0)}
            - Average Order Value: {report_data.get('reportData', {}).get('avgOrderValue', 0)}
            - Conversion Rate: {report_data.get('reportData', {}).get('conversionRate', 0)}%
            
            TOP SELLING PRODUCTS:
            """
            
            # Add top products
            top_products = report_data.get('topProducts', [])
            for i, product in enumerate(top_products[:5], 1):
                body += f"\n{i}. {product.get('name')} - {product.get('sales')} sold"
            
            body += f"\n\nMessage: {message if message else 'No message'}"
            
            # For development: print to console
            print(f"\n📧 Email would be sent to: {email}")
            print(f"Subject: {subject}")
            print(f"Body: {body}\n")
            
            # Uncomment when email is configured in settings.py
            # send_mail(
            #     subject,
            #     body,
            #     settings.DEFAULT_FROM_EMAIL or 'admin@ecommerce.com',
            #     [email],
            #     fail_silently=False,
            # )
            
            return Response(
                {'message': f'Report sent successfully to {email}'}, 
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            # products/views.py - Add at the very bottom

# =========================
# EMAIL REPORT ENDPOINT (Admin only)
# =========================

# products/views.py - At the very bottom

class SendReportEmailView(GenericAPIView):
    """Admin: Send report via email"""
    permission_classes = [IsAdminUser]

    def post(self, request):
        try:
            email = request.data.get('email')
            report_data = request.data.get('report_data', {})
            message = request.data.get('message', '')
            
            if not email:
                return Response(
                    {'error': 'Email is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create email content
            subject = f"E-commerce Report - {report_data.get('dateRange', 'Monthly')}"
            
            body = f"""
            Report Generated: {report_data.get('generatedAt', 'N/A')}
            Date Range: {report_data.get('dateRange', 'N/A')}
            
            SUMMARY:
            - Total Revenue: {report_data.get('reportData', {}).get('totalRevenue', 0)}
            - Total Orders: {report_data.get('reportData', {}).get('totalOrders', 0)}
            - Total Products: {report_data.get('reportData', {}).get('totalProducts', 0)}
            - Total Users: {report_data.get('reportData', {}).get('totalUsers', 0)}
            - Average Order Value: {report_data.get('reportData', {}).get('avgOrderValue', 0)}
            - Conversion Rate: {report_data.get('reportData', {}).get('conversionRate', 0)}%
            
            TOP SELLING PRODUCTS:
            """
            
            top_products = report_data.get('topProducts', [])
            for i, product in enumerate(top_products[:5], 1):
                body += f"\n{i}. {product.get('name')} - {product.get('sales')} sold"
            
            body += f"\n\nMessage: {message if message else 'No message'}"
            
            # Print to console for testing
            print(f"\n📧 Email to: {email}")
            print(f"Subject: {subject}")
            print(f"Body: {body}\n")
            
            return Response(
                {'message': f'Report sent successfully to {email}'}, 
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            print(f"Error: {str(e)}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )