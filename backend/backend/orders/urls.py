# orders/urls.py - COMPLETE WORKING VERSION
from django.urls import path
from . import views

urlpatterns = [
    # =========================
    # USER ENDPOINTS
    # =========================
    path('create/', views.create_order, name='create_order'),
    path('my-orders/', views.my_orders, name='my_orders'),
    path('<int:order_id>/', views.order_detail, name='order_detail'),

    # =========================
    # ADMIN ENDPOINTS
    # =========================
    # GET /api/orders/
    path('', views.admin_orders, name='admin_orders'),

    # PATCH /api/orders/1/update/
    path('<int:order_id>/update/', views.admin_order_detail,
         name='admin_order_update'),

    # POST /api/orders/1/cancel/ - Cancel order and restore stock
    path('<int:order_id>/cancel/', views.cancel_order, name='cancel_order'),

    # DELETE /api/orders/delete/1/
    path('delete/<int:pk>/', views.delete_order, name='delete_order'),
]
