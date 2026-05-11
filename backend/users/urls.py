# users/urls.py
from django.urls import path
from .views import *

urlpatterns = [
    # Customer endpoints
    path('register/', RegisterUserView.as_view(), name='register'),
    path('login/', CustomerTokenObtainPairView.as_view(), name='customer-login'),
    
    # ✅ ADMIN LOGIN - Make sure this line is present
    path('admin-login/', AdminTokenObtainPairView.as_view(), name='admin-login'),
    
    # Profile endpoints
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/simple/', GetUserProfileView.as_view(), name='simple-profile'),
    
    # Address endpoints
    path('addresses/', UserAddressesView.as_view(), name='addresses'),
    path('addresses/<int:address_id>/', UserAddressDetailView.as_view(), name='address-detail'),
    path('addresses/<int:address_id>/set-default/', SetDefaultAddressView.as_view(), name='set-default-address'),
    
    # Account
    path('delete-account/', DeleteAccountView.as_view(), name='delete-account'),
    
    # Admin management endpoints
    path('admin/users/', AdminUsersView.as_view(), name='admin-users'),
    path('admin/users/<int:user_id>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/users/<int:user_id>/block/', BlockUserView.as_view(), name='block-user'),
]