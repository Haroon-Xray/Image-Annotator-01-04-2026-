from django.contrib import admin
from .models import Image, Annotation


@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    list_display = ('name', 'uploaded_at', 'annotation_count', 'size')
    list_filter = ('uploaded_at', 'updated_at')
    search_fields = ('name', 'description')
    readonly_fields = ('uploaded_at', 'updated_at', 'size')
    
    def annotation_count(self, obj):
        return obj.annotations.count()
    annotation_count.short_description = 'Total Annotations'


@admin.register(Annotation)
class AnnotationAdmin(admin.ModelAdmin):
    list_display = ('label', 'image', 'created_at', 'coordinates')
    list_filter = ('created_at', 'updated_at', 'image')
    search_fields = ('label', 'image__name')
    readonly_fields = ('created_at', 'updated_at')
    
    def coordinates(self, obj):
        return f"({obj.x}, {obj.y}) - {obj.width}x{obj.height}"
    coordinates.short_description = 'Position & Size'
