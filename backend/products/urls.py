from django.urls import path

from .views import (
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
)

urlpatterns = [

    path('', getProducts),

    path('create/', createProduct),

    path('update/<str:pk>/', updateProduct),

    path('delete/<str:pk>/', deleteProduct),

    path('<str:pk>/', getProduct),
]
