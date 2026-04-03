"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse, FileResponse
from django.views.static import serve
from pathlib import Path
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

def serve_logo(request):
    """Serve logo.png from frontend"""
    logo_path = settings.BASE_DIR / 'frontend' / 'logo.png'
    if logo_path.exists():
        return FileResponse(open(logo_path, 'rb'), content_type='image/png')
    return JsonResponse({'error': 'Logo not found'}, status=404)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Logo - must be before catch-all
    path('logo.png', serve_logo, name='logo'),
    
    # API routes - must be before the catch-all React route
    path('api/', include('annotator.urls')),
    
    # React app - serve index.html
    path('', ReactAppView.as_view(), name='react_app'),
    
    # Catch-all for React Router - all other paths go to React (excluding files with extensions)
    re_path(r'^(?!api|admin|static|media|logo)(?!.*\.\w+$).*$', ReactAppView.as_view(), name='react_router_fallback'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
