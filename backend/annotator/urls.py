from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register viewsets
router = DefaultRouter()
router.register(r'images', views.ImageViewSet, basename='image')

app_name = 'annotator'

urlpatterns = [
    path('', include(router.urls)),
    path('images/<int:image_id>/annotations/', 
         views.AnnotationViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='annotation-list'),
    path('images/<int:image_id>/annotations/<int:pk>/', 
         views.AnnotationViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), 
         name='annotation-detail'),
    path('images/<int:image_id>/annotations/clear-all/', 
         views.AnnotationViewSet.as_view({'post': 'clear_all'}), 
         name='annotation-clear-all'),
    path('images/<int:image_id>/annotations/batch-create/', 
         views.AnnotationViewSet.as_view({'post': 'batch_create'}), 
         name='annotation-batch-create'),
    path('inference/', 
         views.InferenceViewSet.as_view(), 
         name='inference'),
    path('health/', views.HealthCheckView.as_view({'get': 'health'}), name='health-check'),
]
