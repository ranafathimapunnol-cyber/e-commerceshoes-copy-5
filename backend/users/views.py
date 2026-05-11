# users/views.py - CONVERTED TO GENERIC VIEWS (ALL FEATURES PRESERVED)
from rest_framework import generics, status, serializers
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.views import APIView
from rest_framework.generics import GenericAPIView, ListAPIView, RetrieveAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import get_user_model, authenticate
from .serializers import UserSerializer, UserUpdateSerializer, UserAddressSerializer
from .models import UserAddress

# Import Cart and Wishlist
from cart.models import Cart
from products.models import Wishlist

User = get_user_model()


# =========================
# JWT LOGIN - CUSTOMER ONLY (BLOCKS ADMIN)
# =========================
class CustomerTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # 🔴 BLOCK admin users from customer login
        if self.user.is_staff or self.user.is_superuser:
            raise serializers.ValidationError(
                'Admin users cannot login as customers. Please use the admin login page.'
            )
        
        return data


class CustomerTokenObtainPairView(TokenObtainPairView):
    """Customer only login - Blocks admin users"""
    serializer_class = CustomerTokenObtainPairSerializer


# =========================
# ADMIN LOGIN ONLY (BLOCKS REGULAR USERS)
# =========================
class AdminTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # 🔴 ONLY allow admin users
        if not (self.user.is_staff or self.user.is_superuser):
            raise serializers.ValidationError(
                'Access denied. Admin privileges required.'
            )
        
        # ✅ REMOVED the restriction to only 'adminrana'
        # Now ANY admin user (is_staff=True or is_superuser=True) can login
        
        return data


class AdminTokenObtainPairView(TokenObtainPairView):
    """Admin only login - Blocks regular users"""
    serializer_class = AdminTokenObtainPairSerializer


# =========
# REGISTER 
# =========
class RegisterUserView(GenericAPIView):
    """Register a new user - Regular customer only"""
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        if not username or not email or not password:
            return Response(
                {'error': 'All fields are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Block registration of admin usernames
        if username.lower() in ['adminrana', 'admin1', 'admin2', 'superadmin']:
            return Response(
                {'error': 'This username is reserved'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

        # Create regular user (NOT admin)
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_staff=False,  # Explicitly NOT admin
            is_superuser=False  # Explicitly NOT superuser
        )

        Cart.objects.create(user=user)

        return Response({
            'message': 'User created successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }, status=status.HTTP_201_CREATED)


# =========================
# USER PROFILE 
# =========================
class ProfileView(GenericAPIView):
    """Get and update user profile"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request):
        try:
            user = request.user
            serializer = UserUpdateSerializer(
                user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error updating profile: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =========================
#   SIMPLE PROFILE 
# =========================
class GetUserProfileView(GenericAPIView):
    """Get simple user profile"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'phone': getattr(user, 'phone', ''),
            'profile_picture': user.profile_picture.url if hasattr(user, 'profile_picture') and user.profile_picture else None,
            'bio': getattr(user, 'bio', '')
        })


# =========================
# ADDRESS VIEWS 
# =========================
class UserAddressesView(GenericAPIView):
    """Get all addresses and create new address"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            addresses = UserAddress.objects.filter(
                user=request.user
            ).order_by('-is_default', '-created_at')
            serializer = UserAddressSerializer(addresses, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print("GET Addresses Error:", str(e))
            return Response(
                {'error': f'Failed to fetch addresses: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        try:
            required_fields = ['address', 'city', 'state', 'pincode']
            missing_fields = [
                field for field in required_fields if not request.data.get(field)]

            if missing_fields:
                return Response(
                    {'error': f'Missing required fields: {", ".join(missing_fields)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            address_data = {
                'full_name': request.data.get('full_name', ''),
                'phone': request.data.get('phone', ''),
                'address': request.data.get('address', ''),
                'city': request.data.get('city', ''),
                'state': request.data.get('state', ''),
                'pincode': request.data.get('pincode', ''),
                'is_default': request.data.get('is_default', False)
            }

            user_address_count = UserAddress.objects.filter(
                user=request.user).count()
            is_default = address_data['is_default']

            if user_address_count == 0:
                is_default = True
            elif is_default:
                UserAddress.objects.filter(
                    user=request.user).update(is_default=False)

            address = UserAddress.objects.create(
                user=request.user,
                full_name=address_data['full_name'],
                phone=address_data['phone'],
                address=address_data['address'],
                city=address_data['city'],
                state=address_data['state'],
                pincode=address_data['pincode'],
                is_default=is_default
            )

            response_serializer = UserAddressSerializer(address)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            print("POST Address Error:", str(e))
            return Response(
                {'error': f'Failed to save address: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserAddressDetailView(GenericAPIView):
    """Update and delete specific address"""
    permission_classes = [IsAuthenticated]

    def get_object(self, address_id, user):
        try:
            return UserAddress.objects.get(id=address_id, user=user)
        except UserAddress.DoesNotExist:
            return None

    def put(self, request, address_id):
        user = request.user
        address = self.get_object(address_id, user)

        if not address:
            return Response({'error': 'Address not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            if 'full_name' in request.data:
                address.full_name = request.data['full_name']
            if 'phone' in request.data:
                address.phone = request.data['phone']
            if 'address' in request.data:
                address.address = request.data['address']
            if 'city' in request.data:
                address.city = request.data['city']
            if 'state' in request.data:
                address.state = request.data['state']
            if 'pincode' in request.data:
                address.pincode = request.data['pincode']
            if 'is_default' in request.data and request.data['is_default']:
                UserAddress.objects.filter(user=user).exclude(
                    id=address_id).update(is_default=False)
                address.is_default = True

            address.save()
            serializer = UserAddressSerializer(address)
            return Response(serializer.data)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, address_id):
        user = request.user
        address = self.get_object(address_id, user)

        if not address:
            return Response({'error': 'Address not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            address_count = UserAddress.objects.filter(user=user).count()
            if address_count <= 1:
                return Response(
                    {'error': 'Cannot delete the only address. Add another address first.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            address.delete()
            return Response({'message': 'Address deleted successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SetDefaultAddressView(GenericAPIView):
    """Set an address as default"""
    permission_classes = [IsAuthenticated]

    def put(self, request, address_id):
        user = request.user

        try:
            address = UserAddress.objects.get(id=address_id, user=user)
        except UserAddress.DoesNotExist:
            return Response({'error': 'Address not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            UserAddress.objects.filter(user=user).update(is_default=False)
            address.is_default = True
            address.save()
            return Response({'message': 'Default address updated successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =========================
# DELETE ACCOUNT - GENERIC VIEW
# =========================
class DeleteAccountView(GenericAPIView):
    """Delete user account - Only if no pending orders"""
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user

        try:
            from orders.models import Order

            pending_statuses = ['pending', 'processing',
                                'shipped', 'confirmed', 'out_for_delivery']
            pending_orders = Order.objects.filter(
                user=user, status__in=pending_statuses)

            if pending_orders.exists():
                return Response({
                    'error': f'Cannot delete account. You have {pending_orders.count()} pending order(s). Please complete or cancel them first.',
                    'pending_orders_count': pending_orders.count()
                }, status=status.HTTP_400_BAD_REQUEST)

            # Delete related data
            try:
                Cart.objects.filter(user=user).delete()
            except:
                pass

            try:
                Wishlist.objects.filter(user=user).delete()
            except:
                pass

            try:
                UserAddress.objects.filter(user=user).delete()
            except:
                pass

            user.delete()

            return Response({
                'message': 'Account deleted successfully',
                'success': True
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Delete account error: {str(e)}")
            return Response({
                'error': f'Failed to delete account: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =========================
# ADMIN - BLOCK / UNBLOCK USER - GENERIC VIEW
# =========================
class BlockUserView(GenericAPIView):
    """Admin: Block or unblock a user"""
    permission_classes = [IsAdminUser]

    def put(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            user.is_active = not user.is_active
            user.save()
            return Response({
                "message": "User status updated",
                "id": user.id,
                "is_active": user.is_active
            })
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


# =========================
# ADMIN - GET/UPDATE SINGLE USER - GENERIC VIEW
# =========================
class AdminUserDetailView(GenericAPIView):
    """Admin: Get or update a single user"""
    permission_classes = [IsAdminUser]

    def get_object(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    def get(self, request, user_id):
        user = self.get_object(user_id)
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_active": user.is_active,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "date_joined": user.date_joined,
            "last_login": user.last_login,
        }
        return Response(data)

    def patch(self, request, user_id):
        user = self.get_object(user_id)
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if 'is_active' in request.data:
            user.is_active = request.data['is_active']
        if 'is_staff' in request.data:
            user.is_staff = request.data['is_staff']
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        if 'email' in request.data:
            user.email = request.data['email']

        user.save()

        return Response({
            "message": "User updated successfully",
            "id": user.id,
            "is_active": user.is_active,
            "is_staff": user.is_staff
        })

    def put(self, request, user_id):
        return self.patch(request, user_id)

# =========================
# ADMIN - GET ALL USERS WITH ORDER COUNT - GENERIC VIEW
# =========================
class AdminUsersView(ListAPIView):
    """Admin: Get all regular users (customers only, not admins)"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        from orders.models import Order

        # ✅ Filter: Show ONLY regular users (NOT admins)
        # Exclude users who are staff or superuser
        users = User.objects.filter(
            is_staff=False,      # Not admin staff
            is_superuser=False   # Not superuser
        ).order_by('-date_joined')

        data = []
        for user in users:
            order_count = Order.objects.filter(user=user).count()

            data.append({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "date_joined": user.date_joined,
                "order_count": order_count,
            })

        return Response(data)