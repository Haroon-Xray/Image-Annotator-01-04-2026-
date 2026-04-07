from django.db import models
from django.core.validators import FileExtensionValidator, MinValueValidator, MaxValueValidator
from django.utils import timezone

class Image(models.Model):
    """Model to store uploaded images and their metadata"""
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    image_file = models.ImageField(
        upload_to='images/%Y/%m/%d/',
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'])]
    )
    size = models.BigIntegerField(help_text="File size in bytes")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    description = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['-uploaded_at']),
            models.Index(fields=['name']),
        ]
    
    def __str__(self):
        return self.name


class Annotation(models.Model):
    """Model to store bounding box annotations for images"""
    id = models.AutoField(primary_key=True)
    image = models.ForeignKey(
        Image,
        on_delete=models.CASCADE,
        related_name='annotations'
    )
    label = models.CharField(max_length=255)
    class_id = models.IntegerField(default=0, help_text="Class ID for YOLO format (0-indexed)")
    # Normalized coordinates (0-1)
    x_center = models.FloatField(
        default=0.5,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Normalized center X coordinate (0-1)"
    )
    y_center = models.FloatField(
        default=0.5,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Normalized center Y coordinate (0-1)"
    )
    width = models.FloatField(
        default=0.5,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Normalized width (0-1)"
    )
    height = models.FloatField(
        default=0.5,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Normalized height (0-1)"
    )
    # Legacy pixel coordinates (kept for backward compatibility)
    x = models.IntegerField(default=0, help_text="X coordinate of top-left corner (legacy)")
    y = models.IntegerField(default=0, help_text="Y coordinate of top-left corner (legacy)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['image', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.label} on {self.image.name}"
