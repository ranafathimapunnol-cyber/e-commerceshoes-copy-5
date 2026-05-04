# users/views.py
from .serializers import UserSerializer, UserUpdateSerializer, UserAddressSerializer
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework import status
from .models import UserAddress

# ✅ Import Cart and Wishlist
from cart.models import Cart
from products.models import Wishlist  # Wishlist is in products app

User = get_user_model()


# =========================
# JWT LOGIN
# =========================
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        return token


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# =========================
# REGISTER (WITH CART & WISHLIST)
# =========================
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    # validation
    if not username or not email or not password:
        return Response(
            {'error': 'All fields are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

    # Create user
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    # ✅ Create empty cart for the user
    Cart.objects.create(user=user)

    # ✅ Note: Wishlist is created when user adds first item
    # No need to create empty wishlist here since Wishlist model requires a product
    # Wishlist items will be created when user adds products to wishlist

    return Response({
        'message': 'User created successfully',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    }, status=status.HTTP_201_CREATED)


# =========================
# USER PROFILE (GET & UPDATE)
# =========================
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = UserUpdateSerializer(
            user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =========================
# SIMPLE PROFILE
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'profile_picture': user.profile_picture.url if user.profile_picture else None
    })


# =========================
# ADDRESS VIEWS
# =========================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_addresses(request):
    user = request.user

    if request.method == 'GET':
        addresses = UserAddress.objects.filter(
            user=user).order_by('-is_default', '-created_at')
        serializer = UserAddressSerializer(addresses, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = UserAddressSerializer(data=request.data)

        if serializer.is_valid():
            is_default = serializer.validated_data.get('is_default', False)

            if is_default or not UserAddress.objects.filter(user=user).exists():
                UserAddress.objects.filter(user=user).update(is_default=False)
                serializer.save(user=user, is_default=True)
            else:
                serializer.save(user=user)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def user_address_detail(request, address_id):
    try:
        address = UserAddress.objects.get(id=address_id, user=request.user)
    except UserAddress.DoesNotExist:
        return Response({'error': 'Address not found'}, status=404)

    if request.method == 'PUT':
        serializer = UserAddressSerializer(
            address, data=request.data, partial=True)
        if serializer.is_valid():
            is_default = serializer.validated_data.get(
                'is_default', address.is_default)

            if is_default and not address.is_default:
                UserAddress.objects.filter(user=request.user).exclude(
                    id=address_id).update(is_default=False)
                serializer.save(is_default=True)
            else:
                serializer.save()

            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':
        if UserAddress.objects.filter(user=request.user).count() <= 1:
            return Response({'error': 'Cannot delete the only address'}, status=400)
        address.delete()
        return Response({'message': 'Address deleted successfully'}, status=200)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def set_default_address(request, address_id):
    try:
        address = UserAddress.objects.get(id=address_id, user=request.user)
    except UserAddress.DoesNotExist:
        return Response({'error': 'Address not found'}, status=404)

    # Remove default from all other addresses
    UserAddress.objects.filter(user=request.user).update(is_default=False)

    # Set this address as default
    address.is_default = True
    address.save()

    return Response({'message': 'Default address updated successfully'})


# =========================
# DELETE ACCOUNT
# =========================
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    user = request.user
    # Delete cart first
    try:
        Cart.objects.filter(user=user).delete()
    except:
        pass
    # Delete wishlist items
    try:
        Wishlist.objects.filter(user=user).delete()
    except:
        pass
    user.delete()
    return Response({'message': 'Account deleted successfully'}, status=200)
