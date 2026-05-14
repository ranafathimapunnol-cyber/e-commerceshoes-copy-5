# products/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # =========================
    # PUBLIC ENDPOINTS
    # =========================
    path('', views.getProducts, name='products'),
    path('<int:pk>/', views.getProduct, name='product_detail'),
    path('categories/', views.getCategories, name='categories'),
    path('categories/<int:category_id>/sub/',
         views.getSubCategories, name='subcategories'),
    path('new-arrivals/', views.get_new_arrivals, name='new_arrivals'),
    path('featured/', views.getFeaturedProducts, name='featured_products'),

    # =========================
    # WISHLIST ENDPOINTS
    # =========================
    path('wishlist/', views.getWishlist, name='wishlist'),
    path('wishlist/add/', views.addWishlist, name='add_wishlist'),
    path('wishlist/remove/<int:pk>/',
         views.removeWishlist, name='remove_wishlist'),
    path('wishlist/toggle/', views.toggleWishlist, name='toggle_wishlist'),
    path('wishlist/check/<int:product_id>/',
         views.checkWishlist, name='check_wishlist'),

    # =========================
    # ADMIN ENDPOINTS
    # =========================
    # POST /api/products/add/
    path('add/', views.add_product, name='add_product'),
    path('update/<int:pk>/', views.update_product,
         name='update_product'),  # PUT /api/products/update/1/
    path('delete/<int:pk>/', views.delete_product,
         name='delete_product'),  # DELETE /api/products/delete/1/
    # GET /api/products/admin/all/
    path('admin/all/', views.admin_products, name='admin_products'),
]
