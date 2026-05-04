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
import json
import traceback

# Import Cart and Wishlist
from cart.models import Cart
from products.models import Wishlist

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
# REGISTER
# =========================
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if not username or not email or not password:
        return Response(
            {'error': 'All fields are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
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
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)

    elif request.method == 'PUT':
        try:
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
        'phone': user.phone,
        'profile_picture': user.profile_picture.url if user.profile_picture else None,
        'bio': user.bio
    })


# =========================
# ADDRESS VIEWS - COMPLETELY REWRITTEN
# =========================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_addresses(request):
    user = request.user

    if request.method == 'GET':
        try:
            addresses = UserAddress.objects.filter(
                user=user).order_by('-is_default', '-created_at')
            serializer = UserAddressSerializer(addresses, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print("GET Addresses Error:", str(e))
            print(traceback.format_exc())
            return Response(
                {'error': f'Failed to fetch addresses: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    elif request.method == 'POST':
        try:
            # Log incoming data for debugging
            print("POST Address Data:", request.data)

            # Validate required fields
            required_fields = ['address', 'city', 'state', 'pincode']
            missing_fields = [
                field for field in required_fields if not request.data.get(field)]

            if missing_fields:
                return Response(
                    {'error': f'Missing required fields: {", ".join(missing_fields)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Prepare data for serializer
            address_data = {
                'full_name': request.data.get('full_name', ''),
                'phone': request.data.get('phone', ''),
                'address': request.data.get('address', ''),
                'city': request.data.get('city', ''),
                'state': request.data.get('state', ''),
                'pincode': request.data.get('pincode', ''),
                'is_default': request.data.get('is_default', False)
            }

            serializer = UserAddressSerializer(data=address_data)

            if serializer.is_valid():
                # Check if this is the first address for the user
                user_address_count = UserAddress.objects.filter(
                    user=user).count()
                is_default = address_data['is_default']

                # If no addresses exist, force this to be default
                if user_address_count == 0:
                    is_default = True
                elif is_default:
                    # Remove default from all other addresses
                    UserAddress.objects.filter(
                        user=user).update(is_default=False)

                # Save the address
                address = UserAddress.objects.create(
                    user=user,
                    full_name=address_data['full_name'],
                    phone=address_data['phone'],
                    address=address_data['address'],
                    city=address_data['city'],
                    state=address_data['state'],
                    pincode=address_data['pincode'],
                    is_default=is_default
                )

                # Return the saved address
                response_serializer = UserAddressSerializer(address)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            else:
                print("Serializer validation errors:", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print("POST Address Error:", str(e))
            print(traceback.format_exc())
            return Response(
                {'error': f'Failed to save address: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def user_address_detail(request, address_id):
    user = request.user

    try:
        address = UserAddress.objects.get(id=address_id, user=user)
    except UserAddress.DoesNotExist:
        return Response({'error': 'Address not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if request.method == 'PUT':
        try:
            # Update address fields
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
                # Remove default from all other addresses
                UserAddress.objects.filter(user=user).exclude(
                    id=address_id).update(is_default=False)
                address.is_default = True

            address.save()

            serializer = UserAddressSerializer(address)
            return Response(serializer.data)

        except Exception as e:
            print("PUT Address Error:", str(e))
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    elif request.method == 'DELETE':
        try:
            # Don't allow deleting if it's the only address
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


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def set_default_address(request, address_id):
    user = request.user

    try:
        address = UserAddress.objects.get(id=address_id, user=user)
    except UserAddress.DoesNotExist:
        return Response({'error': 'Address not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        # Remove default from all other addresses
        UserAddress.objects.filter(user=user).update(is_default=False)

        # Set this address as default
        address.is_default = True
        address.save()

        return Response({'message': 'Default address updated successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =========================
# DELETE ACCOUNT
# =========================
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    user = request.user
    try:
        Cart.objects.filter(user=user).delete()
    except:
        pass
    try:
        Wishlist.objects.filter(user=user).delete()
    except:
        pass
    user.delete()
    return Response({'message': 'Account deleted successfully'}, status=status.HTTP_200_OK)
