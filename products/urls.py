# products/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Products
    path('', views.getProducts, name='products'),
    path('<int:pk>/', views.getProduct, name='product_detail'),

    # Wishlist
    path('wishlist/', views.getWishlist, name='get_wishlist'),
    path('wishlist/add/', views.addWishlist, name='add_wishlist'),
    path('wishlist/remove/<int:pk>/',
         views.removeWishlist, name='remove_wishlist'),
    path('wishlist/toggle/', views.toggleWishlist, name='toggle_wishlist'),
    path('wishlist/check/<int:product_id>/',
         views.checkWishlist, name='check_wishlist'),

    # Categories
    path('categories/', views.getCategories, name='categories'),
    path('categories/<int:category_id>/sub/',
         views.getSubCategories, name='sub_categories'),

    # New Arrivals & Featured
    path('new-arrivals/', views.get_new_arrivals, name='new_arrivals'),
    path('featured/', views.getFeaturedProducts, name='featured_products'),
]
