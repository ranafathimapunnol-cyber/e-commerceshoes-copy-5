# users/urls.py
from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Auth
    path('login/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.register_user, name='register'),

    # Profile
    path('profile/', views.profile, name='profile'),
    path('me/', views.get_user_profile, name='user_profile'),
    path('delete/', views.delete_account, name='delete_account'),

    # Addresses
    path('addresses/', views.user_addresses, name='user_addresses'),
    path('addresses/<int:address_id>/',
         views.user_address_detail, name='user_address_detail'),
    path('addresses/<int:address_id>/set-default/',
         views.set_default_address, name='set_default_address'),
]
