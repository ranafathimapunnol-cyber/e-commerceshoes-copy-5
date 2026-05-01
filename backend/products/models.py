from django.db import models
from users.models import User


# MAIN CATEGORY (MEN / WOMEN / KIDS)
class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


# SUB CATEGORY (Sports / Casual / Running)
class SubCategory(models.Model):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="subcategories"
    )

    def __str__(self):
        return f"{self.category.name} - {self.name}"


# PRODUCT
class Product(models.Model):
    name = models.CharField(max_length=255)
    brand = models.CharField(max_length=255)

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    sub_category = models.ForeignKey(
        SubCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField()

    size = models.CharField(max_length=50)
    color = models.CharField(max_length=100)

    image = models.ImageField(upload_to='products/', null=True, blank=True)

    is_featured = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# CART
class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.user.username} - {self.product.name}"
