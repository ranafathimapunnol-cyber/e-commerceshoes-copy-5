from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.Serializer):

    id = serializers.IntegerField(read_only=True)

    name = serializers.CharField(max_length=255)

    brand = serializers.CharField(max_length=255)

    category = serializers.CharField(max_length=20)

    description = serializers.CharField()

    price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    stock = serializers.IntegerField()

    size = serializers.CharField(max_length=50)

    color = serializers.CharField(max_length=100)

    image = serializers.ImageField(
        required=False
    )

    is_featured = serializers.BooleanField(default=False)

    created_at = serializers.DateTimeField(read_only=True)

    updated_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):

        return Product.objects.create(**validated_data)

    def update(self, instance, validated_data):

        instance.name = validated_data.get(
            'name',
            instance.name
        )

        instance.brand = validated_data.get(
            'brand',
            instance.brand
        )

        instance.category = validated_data.get(
            'category',
            instance.category
        )

        instance.description = validated_data.get(
            'description',
            instance.description
        )

        instance.price = validated_data.get(
            'price',
            instance.price
        )

        instance.stock = validated_data.get(
            'stock',
            instance.stock
        )

        instance.size = validated_data.get(
            'size',
            instance.size
        )

        instance.color = validated_data.get(
            'color',
            instance.color
        )

        instance.is_featured = validated_data.get(
            'is_featured',
            instance.is_featured
        )

        instance.save()

        return instance
