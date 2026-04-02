from rest_framework import serializers
from .models import Image, Annotation


class AnnotationSerializer(serializers.ModelSerializer):
    """Serializer for Annotation model"""
    class Meta:
        model = Annotation
        fields = ['id', 'label', 'x', 'y', 'width', 'height', 'created_at', 'updated_at']
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
        fields = ['label', 'x', 'y', 'width', 'height']


class ExportSerializer(serializers.Serializer):
    """Serializer for exporting annotations"""
    name = serializers.CharField()
    annotations = AnnotationSerializer(many=True)
