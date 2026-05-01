from django.urls import path
from . import views

urlpatterns = [
    # PRODUCTS
    path('', views.getProducts, name='products'),
    path('<int:pk>/', views.getProduct, name='product-detail'),

    # CATEGORY
    path('categories/', views.getCategories, name='categories'),
    path('categories/<int:category_id>/sub/',
         views.getSubCategories, name='subcategories'),

    # CART
    path('cart/', views.CartListView.as_view(), name='cart'),
    path('cart/add/', views.AddToCartView.as_view(), name='cart-add'),
    path('cart/remove/<int:pk>/',
         views.RemoveCartItemView.as_view(), name='cart-remove'),
]
