from rest_framework import serializers
from .models import Image, Annotation


class AnnotationSerializer(serializers.ModelSerializer):
    """Serializer for Annotation model"""
    class Meta:
        model = Annotation
        fields = ['id', 'label', 'class_id', 'x', 'y', 'width', 'height', 'x_center', 'y_center', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ImageSerializer(serializers.ModelSerializer):
    """Serializer for Image model with nested annotations"""
    annotations = AnnotationSerializer(many=True, read_only=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Image
        fields = ['id', 'name', 'image_file', 'image_url', 'size', 'uploaded_at', 'updated_at', 'description', 'annotations']
        read_only_fields = ['id', 'uploaded_at', 'updated_at', 'size']
    
    def get_image_url(self, obj):
        """Get the full URL for the image"""
        request = self.context.get('request')
        if obj.image_file and request:
            return request.build_absolute_uri(obj.image_file.url)
        return None


class ImageListSerializer(serializers.ModelSerializer):
    """Simplified serializer for image lists"""
    image_url = serializers.SerializerMethodField()
    annotation_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Image
        fields = ['id', 'name', 'image_url', 'size', 'uploaded_at', 'description', 'annotation_count']
        read_only_fields = ['id', 'uploaded_at', 'size']
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image_file and request:
            return request.build_absolute_uri(obj.image_file.url)
        return None
    
    def get_annotation_count(self, obj):
        return obj.annotations.count()


class AnnotationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating annotations"""
    class Meta:
        model = Annotation
        fields = ['label', 'class_id', 'x', 'y', 'width', 'height', 'x_center', 'y_center']


class AnnotationBulkCreateSerializer(serializers.Serializer):
    """Serializer for bulk creating annotations for a single image"""
    annotations = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of annotation objects with: label, class_id, x_center, y_center, width, height"
    )
    
    def validate_annotations(self, annotations):
        """Validate each annotation in the list"""
        from .yolo_utils import YOLOConverter
        
        for i, ann in enumerate(annotations):
            is_valid, error = YOLOConverter.validate_annotation({
                'class_id': ann.get('class_id'),
                'x_center': ann.get('x_center'),
                'y_center': ann.get('y_center'),
                'width': ann.get('width'),
                'height': ann.get('height')
            })
            if not is_valid:
                raise serializers.ValidationError(f"Annotation {i}: {error}")
            
            if 'label' not in ann or not ann['label']:
                raise serializers.ValidationError(f"Annotation {i}: Missing label")
        
        return annotations


class BulkImageAnnotationSerializer(serializers.Serializer):
    """Serializer for bulk submitting multiple images with their annotations"""
    images = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of image objects with image_id and annotations list"
    )
    
    def validate_images(self, images):
        """Validate each image and its annotations"""
        from .yolo_utils import YOLOConverter
        
        for i, img_data in enumerate(images):
            if 'image_id' not in img_data:
                raise serializers.ValidationError(f"Image {i}: Missing image_id")
            
            if 'annotations' not in img_data:
                raise serializers.ValidationError(f"Image {i}: Missing annotations list")
            
            annotations = img_data.get('annotations', [])
            if not isinstance(annotations, list):
                raise serializers.ValidationError(f"Image {i}: Annotations must be a list")
            
            for j, ann in enumerate(annotations):
                is_valid, error = YOLOConverter.validate_annotation({
                    'class_id': ann.get('class_id'),
                    'x_center': ann.get('x_center'),
                    'y_center': ann.get('y_center'),
                    'width': ann.get('width'),
                    'height': ann.get('height')
                })
                if not is_valid:
                    raise serializers.ValidationError(f"Image {i}, Annotation {j}: {error}")
                
                if 'label' not in ann or not ann['label']:
                    raise serializers.ValidationError(f"Image {i}, Annotation {j}: Missing label")
        
        return images


class ExportSerializer(serializers.Serializer):
    """Serializer for exporting annotations"""
    name = serializers.CharField()
    annotations = AnnotationSerializer(many=True)


class YOLODatasetGeneratorSerializer(serializers.Serializer):
    """Serializer for YOLO dataset generation request"""
    image_ids = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="List of image IDs to include in dataset"
    )
    output_dir = serializers.CharField(
        default='dataset',
        required=False,
        help_text="Output directory name for dataset"
    )
