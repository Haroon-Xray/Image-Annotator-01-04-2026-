from django.test import TestCase
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image as PILImage
from io import BytesIO
from pathlib import Path
import os
import tempfile
from .models import Image, Annotation
from .yolo_utils import YOLOConverter
from .services.inference import InferenceService


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


class InferenceServiceTestCase(TestCase):
    """Test cases for InferenceService"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test fixtures for all tests"""
        super().setUpClass()
        cls.service = InferenceService()
    
    @classmethod
    def tearDownClass(cls):
        """Clean up after all tests"""
        super().tearDownClass()
        InferenceService.clear_model_cache()
    
    def setUp(self):
        """Set up test fixtures before each test"""
        # Create a temporary test image
        self.test_image = PILImage.new('RGB', (640, 480), color='red')
        self.temp_file = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
        self.test_image.save(self.temp_file.name)
        self.test_image_path = self.temp_file.name
    
    def tearDown(self):
        """Clean up after each test"""
        if hasattr(self, 'test_image_path') and os.path.exists(self.test_image_path):
            try:
                os.unlink(self.test_image_path)
            except Exception:
                pass
    
    def test_model_loads_successfully(self):
        """Test that YOLOv8 model loads correctly"""
        service = InferenceService()
        model = service._load_model()
        
        self.assertIsNotNone(model)
        self.assertTrue(hasattr(model, 'predict'))
    
    def test_model_caching(self):
        """Test that models are cached after loading"""
        service = InferenceService()
        
        # First load
        model1 = service._load_model()
        cached_models_1 = InferenceService.get_cached_models()
        self.assertEqual(len(cached_models_1), 1)
        
        # Second load - should use cache
        model2 = service._load_model()
        cached_models_2 = InferenceService.get_cached_models()
        self.assertEqual(len(cached_models_2), 1)
        self.assertIs(model1, model2)
    
    def test_inference_returns_list(self):
        """Test that inference returns a list"""
        result = self.service.run_inference(self.test_image_path)
        self.assertIsInstance(result, list)
    
    def test_inference_output_structure(self):
        """Test that inference output has correct structure"""
        result = self.service.run_inference(self.test_image_path)
        
        # Result should be a list
        self.assertIsInstance(result, list)
        
        # Each detection should have required keys
        for detection in result:
            self.assertIn('label', detection)
            self.assertIn('confidence', detection)
            self.assertIn('bbox', detection)
            
            # Validate label
            self.assertIsInstance(detection['label'], str)
            
            # Validate confidence
            self.assertIsInstance(detection['confidence'], float)
            self.assertGreaterEqual(detection['confidence'], 0)
            self.assertLessEqual(detection['confidence'], 1)
            
            # Validate bbox structure
            bbox = detection['bbox']
            self.assertIn('x', bbox)
            self.assertIn('y', bbox)
            self.assertIn('width', bbox)
            self.assertIn('height', bbox)
            
            # Validate bbox values are normalized (0-1)
            for key in ['x', 'y', 'width', 'height']:
                value = bbox[key]
                self.assertIsInstance(value, float)
                self.assertGreaterEqual(value, 0)
                self.assertLessEqual(value, 1)
    
    def test_inference_confidence_threshold(self):
        """Test inference with different confidence thresholds"""
        result_high = self.service.run_inference(
            self.test_image_path,
            confidence=0.9
        )
        result_low = self.service.run_inference(
            self.test_image_path,
            confidence=0.1
        )
        
        self.assertGreaterEqual(len(result_low), 0)
        self.assertGreaterEqual(len(result_high), 0)
    
    def test_inference_invalid_image_path(self):
        """Test inference with non-existent image"""
        with self.assertRaises(FileNotFoundError):
            self.service.run_inference("/path/to/nonexistent/image.png")
    
    def test_inference_invalid_confidence(self):
        """Test inference with invalid confidence values"""
        with self.assertRaises(ValueError):
            self.service.run_inference(self.test_image_path, confidence=-0.1)
        
        with self.assertRaises(ValueError):
            self.service.run_inference(self.test_image_path, confidence=1.5)
    
    def test_inference_invalid_iou(self):
        """Test inference with invalid IOU values"""
        with self.assertRaises(ValueError):
            self.service.run_inference(self.test_image_path, iou=-0.1)
        
        with self.assertRaises(ValueError):
            self.service.run_inference(self.test_image_path, iou=1.5)
    
    def test_model_clear_cache(self):
        """Test clearing model cache"""
        service = InferenceService()
        model1 = service._load_model()
        
        self.assertEqual(len(InferenceService.get_cached_models()), 1)
        
        InferenceService.clear_model_cache()
        self.assertEqual(len(InferenceService.get_cached_models()), 0)
        
        # Next load should load fresh model
        model2 = service._load_model()
        self.assertEqual(len(InferenceService.get_cached_models()), 1)
        self.assertIsNot(model1, model2)


class InferenceAPITestCase(APITestCase):
    """Test cases for Inference API endpoint"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test fixtures for all tests"""
        super().setUpClass()
        InferenceService.clear_model_cache()
    
    @classmethod
    def tearDownClass(cls):
        """Clean up after all tests"""
        super().tearDownClass()
        InferenceService.clear_model_cache()
    
    def setUp(self):
        """Set up test fixtures before each test"""
        self.client = APIClient()
        self.inference_url = '/api/inference/'
        
        # Create a test image
        self.test_image = PILImage.new('RGB', (640, 480), color='blue')
    
    def _get_image_file(self):
        """Get image file for upload"""
        img_io = BytesIO()
        self.test_image.save(img_io, format='PNG')
        img_io.seek(0)
        return SimpleUploadedFile(
            name='test_image.png',
            content=img_io.getvalue(),
            content_type='image/png'
        )
    
    def test_inference_api_success(self):
        """Test successful inference API call"""
        response = self.client.post(
            self.inference_url,
            {'image': self._get_image_file()},
            format='multipart'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertIn('success', data)
        self.assertTrue(data['success'])
        self.assertIn('detection_count', data)
        self.assertIn('detections', data)
        self.assertIn('processing_time', data)
        self.assertIsInstance(data['detections'], list)
    
    def test_inference_api_missing_image(self):
        """Test inference API without image"""
        response = self.client.post(self.inference_url, {})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        data = response.json()
        self.assertFalse(data.get('success', True))
    
    def test_inference_api_confidence_parameter(self):
        """Test inference API with confidence parameter"""
        response = self.client.post(
            self.inference_url,
            {
                'image': self._get_image_file(),
                'confidence': 0.7
            },
            format='multipart'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['success'])
    
    def test_inference_api_iou_parameter(self):
        """Test inference API with IOU parameter"""
        response = self.client.post(
            self.inference_url,
            {
                'image': self._get_image_file(),
                'iou': 0.5
            },
            format='multipart'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['success'])
    
    def test_inference_api_invalid_confidence(self):
        """Test inference API with invalid confidence"""
        response = self.client.post(
            self.inference_url,
            {
                'image': self._get_image_file(),
                'confidence': 1.5
            },
            format='multipart'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_inference_api_response_structure(self):
        """Test inference API response structure"""
        response = self.client.post(
            self.inference_url,
            {'image': self._get_image_file()},
            format='multipart'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        # Check response structure
        required_keys = ['success', 'message', 'detection_count', 'detections', 'processing_time']
        for key in required_keys:
            self.assertIn(key, data)
        
        # Check types
        self.assertIsInstance(data['success'], bool)
        self.assertIsInstance(data['message'], str)
        self.assertIsInstance(data['detection_count'], int)
        self.assertIsInstance(data['detections'], list)
        self.assertIsInstance(data['processing_time'], float)
