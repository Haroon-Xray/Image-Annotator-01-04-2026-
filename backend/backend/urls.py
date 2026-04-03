"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from annotator.views import ReactAppView

def home(request):
    """Home page - API welcome message"""
    return JsonResponse({
        'message': 'Welcome to Image Annotator API',
        'status': 'running',
        'endpoints': {
            'admin': 'http://localhost:8000/admin/',
            'api': 'http://localhost:8000/api/',
            'health': 'http://localhost:8000/api/health/',
            'images': 'http://localhost:8000/api/images/',
        },
        'documentation': 'See ./backenddoc.md for complete API documentation'
    })

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API routes - must be before the catch-all React route
    path('api/', include('annotator.urls')),
    
    # React app - serve index.html
    path('', ReactAppView.as_view(), name='react_app'),
    
    # Catch-all for React Router - all other paths go to React
    re_path(r'^(?!api|admin|static|media).*$', ReactAppView.as_view(), name='react_router_fallback'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
