from django.test import TestCase
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image as PILImage
from io import BytesIO
from .models import Image, Annotation
from .yolo_utils import YOLOConverter


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


class YOLOConverterTestCase(TestCase):
    """Test cases for YOLO conversion utilities"""
    
    def setUp(self):
        """Set up test data"""
        # Create test image
        img = PILImage.new('RGB', (100, 100), color='red')
        img_bytes = BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        self.image = Image.objects.create(
            name='test_image.png',
            image_file=SimpleUploadedFile(
                'test_image.png',
                img_bytes.getvalue(),
                content_type='image/png'
            ),
            size=len(img_bytes.getvalue())
        )
    
    def test_validate_annotation_valid(self):
        """Test validation of valid annotation data"""
        valid_data = {
            'class_id': 0,
            'x_center': 0.5,
            'y_center': 0.5,
            'width': 0.3,
            'height': 0.4
        }
        is_valid, error = YOLOConverter.validate_annotation(valid_data)
        self.assertTrue(is_valid)
        self.assertIsNone(error)
    
    def test_validate_annotation_missing_field(self):
        """Test validation with missing required field"""
        invalid_data = {
            'class_id': 0,
            'x_center': 0.5,
            'y_center': 0.5,
            'width': 0.3
            # Missing 'height'
        }
        is_valid, error = YOLOConverter.validate_annotation(invalid_data)
        self.assertFalse(is_valid)
        self.assertIn('height', error)
    
    def test_validate_annotation_invalid_class_id(self):
        """Test validation with invalid class_id"""
        invalid_data = {
            'class_id': -1,
            'x_center': 0.5,
            'y_center': 0.5,
            'width': 0.3,
            'height': 0.4
        }
        is_valid, error = YOLOConverter.validate_annotation(invalid_data)
        self.assertFalse(is_valid)
        self.assertIn('class_id', error)
    
    def test_validate_annotation_out_of_bounds(self):
        """Test validation with coordinates out of bounds"""
        invalid_data = {
            'class_id': 0,
            'x_center': 1.5,  # Out of bounds
            'y_center': 0.5,
            'width': 0.3,
            'height': 0.4
        }
        is_valid, error = YOLOConverter.validate_annotation(invalid_data)
        self.assertFalse(is_valid)
        self.assertIn('x_center', error)
    
    def test_annotation_to_yolo_line(self):
        """Test conversion of annotation to YOLO format line"""
        annotation = Annotation.objects.create(
            image=self.image,
            label='person',
            class_id=0,
            x_center=0.5,
            y_center=0.5,
            width=0.3,
            height=0.4
        )
        
        yolo_line = YOLOConverter.annotation_to_yolo_line(annotation)
        expected = "0 0.5 0.5 0.3 0.4"
        self.assertEqual(yolo_line, expected)
    
    def test_annotation_to_yolo_line_multiple_classes(self):
        """Test YOLO format with different class IDs"""
        annotations = [
            Annotation.objects.create(
                image=self.image,
                label='person',
                class_id=0,
                x_center=0.2,
                y_center=0.3,
                width=0.1,
                height=0.15
            ),
            Annotation.objects.create(
                image=self.image,
                label='car',
                class_id=1,
                x_center=0.8,
                y_center=0.8,
                width=0.2,
                height=0.25
            ),
        ]
        
        lines = [YOLOConverter.annotation_to_yolo_line(ann) for ann in annotations]
        self.assertEqual(lines[0], "0 0.2 0.3 0.1 0.15")
        self.assertEqual(lines[1], "1 0.8 0.8 0.2 0.25")
    
    def test_class_distribution(self):
        """Test class distribution calculation"""
        # Create multiple annotations with different classes
        Annotation.objects.create(
            image=self.image,
            label='person',
            class_id=0,
            x_center=0.5,
            y_center=0.5,
            width=0.3,
            height=0.4
        )
        Annotation.objects.create(
            image=self.image,
            label='person',
            class_id=0,
            x_center=0.2,
            y_center=0.2,
            width=0.1,
            height=0.15
        )
        Annotation.objects.create(
            image=self.image,
            label='car',
            class_id=1,
            x_center=0.8,
            y_center=0.8,
            width=0.2,
            height=0.25
        )
        
        distribution = YOLOConverter.class_distribution([self.image])
        
        self.assertEqual(distribution[0], 2)  # 2 person annotations
        self.assertEqual(distribution[1], 1)  # 1 car annotation
    
    def test_class_distribution_empty(self):
        """Test class distribution with no annotations"""
        distribution = YOLOConverter.class_distribution([self.image])
        self.assertEqual(distribution, {})
    
    def test_normalized_coordinates_boundaries(self):
        """Test that normalized coordinates at boundaries are valid"""
        test_cases = [
            {'class_id': 0, 'x_center': 0.0, 'y_center': 0.0, 'width': 0.0, 'height': 0.0},  # Min
            {'class_id': 0, 'x_center': 1.0, 'y_center': 1.0, 'width': 1.0, 'height': 1.0},  # Max
            {'class_id': 0, 'x_center': 0.5, 'y_center': 0.5, 'width': 0.5, 'height': 0.5},  # Mid
        ]
        
        for case in test_cases:
            is_valid, error = YOLOConverter.validate_annotation(case)
            self.assertTrue(is_valid, f"Should be valid: {case}, Error: {error}")
