from rest_framework import serializers

from .models import (
    Product,
    Category,
    SubCategory,
    Wishlist
)


# CATEGORY
class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = '__all__'


# SUBCATEGORY
class SubCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = SubCategory
        fields = '__all__'


# PRODUCT
class ProductSerializer(serializers.ModelSerializer):

    class Meta:
        model = Product
        fields = '__all__'


# WISHLIST
class WishlistSerializer(serializers.ModelSerializer):

    product = ProductSerializer(read_only=True)

    class Meta:
        model = Wishlist
        fields = '__all__'
