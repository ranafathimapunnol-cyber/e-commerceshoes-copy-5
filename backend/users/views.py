from rest_framework.decorators import api_view, permission_classes
from .models import User
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth import get_user_model

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):

    user = request.user

    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
    })
# =========================
# JWT LOGIN
# =========================


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['username'] = user.username

        return token


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# =========================
# REGISTER
# =========================

@api_view(['POST'])
def register_user(request):

    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    # CHECK USERNAME
    if User.objects.filter(username=username).exists():

        return Response(
            {'error': 'Username already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # CREATE USER
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    return Response({
        'message': 'User created successfully'
    })


# =========================
# USER PROFILE
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getUserProfile(request):

    user = request.user

    data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
    }

    return Response(data)
