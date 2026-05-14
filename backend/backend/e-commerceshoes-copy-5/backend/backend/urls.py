from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView, RedirectView
from django.conf import settings
from django.conf.urls.static import static
from products.views import SendReportEmailView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Image redirects
    path('logo.png', RedirectView.as_view(url='/static/logo.png')),
    path('logo2.png', RedirectView.as_view(url='/static/logo2.png')),
    path('logo1.png', RedirectView.as_view(url='/static/logo1.png')),
    path('kids.jpg', RedirectView.as_view(url='/static/categories/kids.jpg')),
    path('men.jpg', RedirectView.as_view(url='/static/categories/men.jpg')),
    path('women.jpg', RedirectView.as_view(url='/static/categories/women/w1.jpg')),
    path('new.jpg', RedirectView.as_view(url='/static/categories/new.jpg')),
    
    # Category redirects
    path('categories/kids.jpg', RedirectView.as_view(url='/static/categories/kids.jpg')),
    path('categories/men.jpg', RedirectView.as_view(url='/static/categories/men.jpg')),
    path('categories/women.jpg', RedirectView.as_view(url='/static/categories/women/w1.jpg')),
    path('categories/new.jpg', RedirectView.as_view(url='/static/categories/new.jpg')),
    path('categories/women/women.jpg', RedirectView.as_view(url='/static/categories/women/w1.jpg')),
    
    # React Admin (must be before Django admin)
    re_path(r'^admin/.*$', TemplateView.as_view(template_name='index.html')),
    
    # Django Admin
    path('django-admin/', admin.site.urls),
    
    # API Routes
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
    path('shop/', TemplateView.as_view(template_name='index.html')),
    path('shop/<path:path>/', TemplateView.as_view(template_name='index.html')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
