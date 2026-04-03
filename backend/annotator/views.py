from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.generic import TemplateView
from .models import Image, Annotation
from .serializers import (
    ImageSerializer,
    ImageListSerializer,
    AnnotationSerializer,
    AnnotationCreateSerializer,
    ExportSerializer,
    BulkImageAnnotationSerializer,
    YOLODatasetGeneratorSerializer
)
from .yolo_utils import YOLOConverter


class ReactAppView(TemplateView):
    """
    Serve React app's index.html
    This handles fallback for React Router - all non-API routes go to React
    """
    template_name = 'index.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context


class ImageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing images.
    
    Methods:
    - GET /api/images/ - List all images
    - POST /api/images/ - Upload a new image
    - GET /api/images/{id}/ - Get image details with annotations
    - PUT /api/images/{id}/ - Update image (name, description)
    - DELETE /api/images/{id}/ - Delete image and its annotations
    - POST /api/images/{id}/export/ - Export image annotations as JSON
    - POST /api/images/batch/export/ - Export multiple images
    """
    queryset = Image.objects.all()
    parser_classes = (MultiPartParser, FormParser)
    
    def get_serializer_class(self):
        """Use different serializers based on action"""
        if self.action == 'list':
            return ImageListSerializer
        elif self.action == 'retrieve':
            return ImageSerializer
        return ImageSerializer
    
    def get_serializer_context(self):
        """Pass request context to serializer"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def create(self, request, *args, **kwargs):
        """Handle image upload"""
        image_file = request.FILES.get('image_file')
        name = request.data.get('name', image_file.name if image_file else 'Unnamed')
        description = request.data.get('description', '')
        
        if not image_file:
            return Response(
                {'error': 'No image file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        image = Image.objects.create(
            name=name,
            image_file=image_file,
            size=image_file.size,
            description=description
        )
        
        serializer = self.get_serializer(image)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'], url_path='export')
    def export_image(self, request, pk=None):
        """Export single image with annotations as JSON"""
        image = self.get_object()
        export_data = {
            'name': image.name,
            'uploaded_at': image.uploaded_at.isoformat(),
            'annotations': AnnotationSerializer(image.annotations.all(), many=True).data
        }
        return Response(export_data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='batch/export')
    def batch_export(self, request):
        """Export multiple images with annotations as JSON"""
        image_ids = request.data.get('image_ids', [])
        
        if not image_ids:
            return Response(
                {'error': 'No image IDs provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        images = Image.objects.filter(id__in=image_ids)
        export_data = {
            'images': [
                {
                    'name': img.name,
                    'uploaded_at': img.uploaded_at.isoformat(),
                    'annotations': AnnotationSerializer(img.annotations.all(), many=True).data
                }
                for img in images
            ]
        }
        return Response(export_data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get statistics for an image"""
        image = self.get_object()
        stats = {
            'id': image.id,
            'name': image.name,
            'total_annotations': image.annotations.count(),
            'file_size': image.size,
            'uploaded_at': image.uploaded_at.isoformat(),
            'updated_at': image.updated_at.isoformat()
        }
        return Response(stats, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='bulk/annotations')
    def bulk_annotations(self, request):
        """
        Bulk submit annotations for multiple images.
        
        Request format:
        {
            "images": [
                {
                    "image_id": 1,
                    "annotations": [
                        {"label": "person", "class_id": 0, "x_center": 0.5, "y_center": 0.5, "width": 0.3, "height": 0.4},
                        ...
                    ]
                },
                ...
            ]
        }
        """
        serializer = BulkImageAnnotationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        created_annotations = []
        results = {
            'total_images': 0,
            'total_annotations': 0,
            'images_processed': [],
            'errors': []
        }
        
        for img_data in serializer.validated_data['images']:
            image_id = img_data['image_id']
            annotations_data = img_data['annotations']
            
            try:
                image = Image.objects.get(id=image_id)
                results['total_images'] += 1
                
                for ann_data in annotations_data:
                    annotation = Annotation.objects.create(
                        image=image,
                        label=ann_data['label'],
                        class_id=ann_data.get('class_id', 0),
                        x_center=ann_data.get('x_center', 0.5),
                        y_center=ann_data.get('y_center', 0.5),
                        width=ann_data.get('width', 0.5),
                        height=ann_data.get('height', 0.5),
                        x=ann_data.get('x', 0),
                        y=ann_data.get('y', 0)
                    )
                    created_annotations.append(annotation)
                    results['total_annotations'] += 1
                
                results['images_processed'].append({
                    'image_id': image_id,
                    'annotations_count': len(annotations_data)
                })
                
            except Image.DoesNotExist:
                results['errors'].append(f"Image with id {image_id} not found")
            except Exception as e:
                results['errors'].append(f"Error processing image {image_id}: {str(e)}")
        
        return Response(results, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'], url_path='yolo/generate')
    def generate_yolo_dataset(self, request):
        """
        Generate YOLO dataset from annotated images.
        
        Request format:
        {
            "image_ids": [1, 2, 3, ...],
            "output_dir": "dataset" (optional)
        }
        
        Creates dataset structure:
        - dataset/images/ (containing image files)
        - dataset/labels/ (containing .txt files in YOLO format)
        """
        serializer = YOLODatasetGeneratorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        image_ids = serializer.validated_data['image_ids']
        output_dir = serializer.validated_data.get('output_dir', 'dataset')
        
        if not image_ids:
            return Response(
                {'error': 'No image IDs provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            images = Image.objects.filter(id__in=image_ids)
            
            if not images.exists():
                return Response(
                    {'error': 'No images found with provided IDs'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Generate YOLO dataset
            generation_results = YOLOConverter.generate_yolo_dataset(images, output_dir=output_dir)
            
            # Calculate class distribution
            class_distribution = YOLOConverter.class_distribution(images)
            generation_results['class_distribution'] = class_distribution
            
            return Response(generation_results, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to generate dataset: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AnnotationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing annotations.
    
    Methods:
    - GET /api/images/{image_id}/annotations/ - List all annotations for an image
    - POST /api/images/{image_id}/annotations/ - Create annotation
    - GET /api/images/{image_id}/annotations/{id}/ - Get annotation details
    - PUT /api/images/{image_id}/annotations/{id}/ - Update annotation
    - DELETE /api/images/{image_id}/annotations/{id}/ - Delete annotation
    - DELETE /api/images/{image_id}/annotations/clear-all/ - Delete all annotations
    """
    serializer_class = AnnotationSerializer
    parser_classes = (MultiPartParser, FormParser)
    
    def get_queryset(self):
        """Filter annotations by image ID from URL"""
        image_id = self.kwargs.get('image_id')
        return Annotation.objects.filter(image_id=image_id)
    
    def perform_create(self, serializer):
        """Handle annotation creation with image FK"""
        image_id = self.kwargs.get('image_id')
        image = get_object_or_404(Image, id=image_id)
        serializer.save(image=image)
    
    def create(self, request, *args, **kwargs):
        """Create a single annotation"""
        image_id = self.kwargs.get('image_id')
        image = get_object_or_404(Image, id=image_id)
        
        serializer = AnnotationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        annotation = Annotation.objects.create(
            image=image,
            **serializer.validated_data
        )
        
        response_serializer = AnnotationSerializer(annotation)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'], url_path='clear-all')
    def clear_all(self, request, image_id=None):
        """Delete all annotations for an image"""
        image = get_object_or_404(Image, id=image_id)
        deleted_count, _ = image.annotations.all().delete()
        return Response(
            {'message': f'Deleted {deleted_count} annotations'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['post'], url_path='batch-create')
    def batch_create(self, request, image_id=None):
        """Create multiple annotations at once"""
        image = get_object_or_404(Image, id=image_id)
        annotations_data = request.data.get('annotations', [])
        
        if not annotations_data:
            return Response(
                {'error': 'No annotations provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        annotations = []
        for ann_data in annotations_data:
            annotation = Annotation.objects.create(
                image=image,
                **ann_data
            )
            annotations.append(annotation)
        
        serializer = AnnotationSerializer(annotations, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class HealthCheckView(viewsets.ViewSet):
    """Simple health check endpoint"""
    
    @action(detail=False, methods=['get'])
    def health(self, request):
        """Check if API is running"""
        return Response({'status': 'ok', 'message': 'Backend is running'})
