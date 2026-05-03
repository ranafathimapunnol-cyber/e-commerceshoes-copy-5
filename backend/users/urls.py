# users/urls.py
from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Auth endpoints
    path('login/', views.MyTokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.register_user, name='register'),

    # Profile endpoints
    path('profile/', views.profile, name='profile'),
    path('me/', views.get_user_profile, name='user_profile'),
    path('delete/', views.delete_account, name='delete_account'),
]
