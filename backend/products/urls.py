from django.urls import path
from .views import (
    getCategories,
    getSubCategories,
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    CartListView,
    AddToCartView,
    RemoveCartItemView
)

urlpatterns = [
    # CATEGORY
    path('categories/', getCategories),

    # SUBCATEGORY
    path('subcategories/<int:category_id>/', getSubCategories),

    # PRODUCTS
    path('', getProducts),
    path('<int:pk>/', getProduct),
    path('create/', createProduct),
    path('update/<int:pk>/', updateProduct),
    path('delete/<int:pk>/', deleteProduct),

    # CART
    path('cart/', CartListView.as_view()),
    path('cart/add/', AddToCartView.as_view()),
    path('cart/remove/<int:pk>/', RemoveCartItemView.as_view()),
]
