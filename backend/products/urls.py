from django.urls import path

from . import views

from .views import (
    getProducts,
    getProduct,
    getCategories,
    getSubCategories,
)

urlpatterns = [

    path('', getProducts),

    path('<int:pk>/', getProduct),

    # WISHLIST
    path('wishlist/', views.getWishlist),

    path('wishlist/add/', views.addWishlist),

    path('wishlist/remove/<int:pk>/', views.removeWishlist),

    # CATEGORIES
    path('categories/', getCategories),

    path('categories/<int:category_id>/sub/', getSubCategories),

]
