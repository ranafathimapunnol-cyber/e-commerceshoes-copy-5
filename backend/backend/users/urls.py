from django.urls import path
from . import views

urlpatterns = [
    # User endpoints
    path('register/', views.register_user, name='register'),
    path('profile/', views.profile, name='profile'),
    path('me/', views.get_user_profile, name='user-profile'),

    # Address endpoints
    path('addresses/', views.user_addresses, name='addresses'),
    path('addresses/<int:address_id>/',
         views.user_address_detail, name='address-detail'),
    path('addresses/<int:address_id>/default/',
         views.set_default_address, name='set-default-address'),

    # Account
    path('delete-account/', views.delete_account, name='delete-account'),

    # Admin endpoints
    path('', views.admin_users, name='admin_users'),
    path('<int:user_id>/', views.admin_user_detail, name='admin_user_detail'),
    path('<int:user_id>/block/', views.block_user, name='block-user'),
]
