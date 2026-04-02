from django.db import models
from django.core.validators import FileExtensionValidator
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
    x = models.IntegerField(help_text="X coordinate of top-left corner")
    y = models.IntegerField(help_text="Y coordinate of top-left corner")
    width = models.IntegerField(help_text="Width of bounding box")
    height = models.IntegerField(help_text="Height of bounding box")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['image', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.label} on {self.image.name}"
