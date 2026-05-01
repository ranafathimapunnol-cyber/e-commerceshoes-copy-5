from django.contrib import admin
from .models import Product, Category


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'category',
                    'price', 'stock', 'is_featured')
    list_filter = ('category', 'brand', 'is_featured')
    search_fields = ('name', 'brand')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
