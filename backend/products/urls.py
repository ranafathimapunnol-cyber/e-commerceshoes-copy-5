from django.urls import path
from .views import (
    getProducts,
    getProduct,
    getCategories,
    getSubCategories,
)

urlpatterns = [
    path('', getProducts),
    path('<int:pk>/', getProduct),

    path('categories/', getCategories),
    path('categories/<int:category_id>/sub/', getSubCategories),

]
