from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from products.views import SendReportEmailView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/send-report-email/', SendReportEmailView.as_view(), name='send-report-email'),
    path('api/products/', include('products.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/users/', include('users.urls')),
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
    path('api/notifications/', include('notifications.urls')),
    path('api/', include('notifications.urls')),
]

# React frontend routes
urlpatterns += [
    path('', TemplateView.as_view(template_name='index.html')),
    path('login/', TemplateView.as_view(template_name='index.html')),
    path('register/', TemplateView.as_view(template_name='index.html')),
    path('cart/', TemplateView.as_view(template_name='index.html')),
    path('checkout/', TemplateView.as_view(template_name='index.html')),
    path('products/', TemplateView.as_view(template_name='index.html')),
    path('products/<path:path>/', TemplateView.as_view(template_name='index.html')),
    path('wishlist/', TemplateView.as_view(template_name='index.html')),
    path('profile/', TemplateView.as_view(template_name='index.html')),
    path('order/<path:path>/', TemplateView.as_view(template_name='index.html')),
]

# React Admin Routes
urlpatterns += [
    path('admin/login/', TemplateView.as_view(template_name='index.html')),
    path('admin/products/', TemplateView.as_view(template_name='index.html')),
    path('admin/add-product/', TemplateView.as_view(template_name='index.html')),
    path('admin/users/', TemplateView.as_view(template_name='index.html')),
    path('admin/orders/', TemplateView.as_view(template_name='index.html')),
    path('admin/reports/', TemplateView.as_view(template_name='index.html')),
    path('admin/settings/', TemplateView.as_view(template_name='index.html')),
    path('admin/', TemplateView.as_view(template_name='index.html')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)