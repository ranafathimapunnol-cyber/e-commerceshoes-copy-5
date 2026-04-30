from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Product(models.Model):

    CATEGORY_CHOICES = (
        ('MEN', 'Men'),
        ('WOMEN', 'Women'),
        ('KIDS', 'Kids'),
    )

    name = models.CharField(
        max_length=255,
        default='Running Shoe'
    )

    brand = models.CharField(
        max_length=255,
        default='Nike'
    )

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='MEN'
    )

    sub_category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    description = models.TextField(
        default='Good quality shoe'
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00
    )

    stock = models.PositiveIntegerField(
        default=0
    )

    size = models.CharField(
        max_length=50,
        default='42'
    )

    color = models.CharField(
        max_length=100,
        default='Black'
    )

    image = models.ImageField(
        upload_to='products/',
        null=True,
        blank=True
    )

    is_featured = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
