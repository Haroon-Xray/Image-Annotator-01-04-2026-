"""
YOLO dataset generation utilities.

Handles conversion of annotations to YOLO format and dataset organization.
YOLO format: <class_id> <x_center> <y_center> <width> <height>
All coordinates are normalized (0-1) relative to image dimensions.
"""

import os
from pathlib import Path
from django.conf import settings
from PIL import Image as PILImage


class YOLOConverter:
    """Converts annotations to YOLO dataset format"""
    
    @staticmethod
    def validate_annotation(annotation_data):
        """
        Validate annotation data for YOLO format.
        
        Args:
            annotation_data: Dict with keys class_id, x_center, y_center, width, height
            
        Returns:
            Tuple (is_valid, error_message)
        """
        required_fields = ['class_id', 'x_center', 'y_center', 'width', 'height']
        
        # Check required fields
        for field in required_fields:
            if field not in annotation_data:
                return False, f"Missing required field: {field}"
        
        # Validate class_id
        try:
            class_id = int(annotation_data['class_id'])
            if class_id < 0:
                return False, "class_id must be non-negative"
        except (ValueError, TypeError):
            return False, "class_id must be an integer"
        
        # Validate normalized coordinates
        for field in ['x_center', 'y_center', 'width', 'height']:
            try:
                value = float(annotation_data[field])
                if not (0.0 <= value <= 1.0):
                    return False, f"{field} must be between 0 and 1 (normalized)"
            except (ValueError, TypeError):
                return False, f"{field} must be a float"
        
        return True, None
    
    @staticmethod
    def annotation_to_yolo_line(annotation):
        """
        Convert annotation to YOLO format line.
        
        Args:
            annotation: Annotation model instance
            
        Returns:
            String in format: "<class_id> <x_center> <y_center> <width> <height>"
        """
        return f"{annotation.class_id} {annotation.x_center} {annotation.y_center} {annotation.width} {annotation.height}"
    
    @staticmethod
    def generate_yolo_dataset(images_with_annotations, output_dir='dataset'):
        """
        Generate YOLO dataset from images and annotations.
        
        Args:
            images_with_annotations: List of Image objects with annotations
            output_dir: Base directory for dataset (default: 'dataset')
            
        Returns:
            Dict with generation status and paths
        """
        # Create directory structure
        base_path = Path(settings.BASE_DIR) / output_dir
        images_path = base_path / 'images'
        labels_path = base_path / 'labels'
        
        images_path.mkdir(parents=True, exist_ok=True)
        labels_path.mkdir(parents=True, exist_ok=True)
        
        results = {
            'success': True,
            'images_copied': 0,
            'labels_created': 0,
            'total_annotations': 0,
            'errors': [],
            'dataset_path': str(base_path),
            'images_path': str(images_path),
            'labels_path': str(labels_path),
        }
        
        for image in images_with_annotations:
            try:
                # Copy image file
                image_filename = f"{image.id}_{image.name}"
                source_image_path = image.image_file.path
                dest_image_path = images_path / image_filename
                
                # Copy image using PIL to ensure consistency
                with PILImage.open(source_image_path) as img:
                    img.save(dest_image_path)
                results['images_copied'] += 1
                
                # Create label file
                label_filename = f"{image.id}_{Path(image.name).stem}.txt"
                label_path = labels_path / label_filename
                
                # Get annotations for this image
                annotations = image.annotations.all()
                
                with open(label_path, 'w') as f:
                    for annotation in annotations:
                        line = YOLOConverter.annotation_to_yolo_line(annotation)
                        f.write(line + '\n')
                        results['total_annotations'] += 1
                
                results['labels_created'] += 1
                
            except Exception as e:
                results['success'] = False
                results['errors'].append(f"Error processing image {image.id}: {str(e)}")
        
        return results
    
    @staticmethod
    def class_distribution(images_with_annotations):
        """
        Calculate class distribution in the dataset.
        
        Args:
            images_with_annotations: List of Image objects with annotations
            
        Returns:
            Dict mapping class_id to count
        """
        distribution = {}
        
        for image in images_with_annotations:
            for annotation in image.annotations.all():
                class_id = annotation.class_id
                distribution[class_id] = distribution.get(class_id, 0) + 1
        
        return distribution
