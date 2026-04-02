from django.test import TestCase
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import Image, Annotation


class ImageAPITestCase(TestCase):
    """Test cases for Image API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        # Create a test image
        self.image_file = SimpleUploadedFile(
            "test_image.jpg",
            b"file_content",
            content_type="image/jpeg"
        )
    
    def test_create_image(self):
        """Test creating an image"""
        response = self.client.post('/api/images/', {
            'image_file': self.image_file,
            'name': 'Test Image'
        }, format='multipart')
        self.assertEqual(response.status_code, 201)
    
    def test_list_images(self):
        """Test listing images"""
        response = self.client.get('/api/images/')
        self.assertEqual(response.status_code, 200)
    
    def test_get_image_detail(self):
        """Test getting image details"""
        image = Image.objects.create(
            name='Test',
            image_file=self.image_file,
            size=12
        )
        response = self.client.get(f'/api/images/{image.id}/')
        self.assertEqual(response.status_code, 200)


class AnnotationAPITestCase(TestCase):
    """Test cases for Annotation API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.image_file = SimpleUploadedFile(
            "test_image.jpg",
            b"file_content",
            content_type="image/jpeg"
        )
        self.image = Image.objects.create(
            name='Test',
            image_file=self.image_file,
            size=12
        )
    
    def test_create_annotation(self):
        """Test creating an annotation"""
        response = self.client.post(
            f'/api/images/{self.image.id}/annotations/',
            {
                'label': 'Object 1',
                'x': 10,
                'y': 20,
                'width': 100,
                'height': 150
            },
            format='json'
        )
        self.assertEqual(response.status_code, 201)
    
    def test_list_annotations(self):
        """Test listing annotations"""
        Annotation.objects.create(
            image=self.image,
            label='Test',
            x=10,
            y=20,
            width=100,
            height=150
        )
        response = self.client.get(f'/api/images/{self.image.id}/annotations/')
        self.assertEqual(response.status_code, 200)
