"""
YOLO dataset generation utilities.

Handles conversion of annotations to YOLO format and dataset organization.
YOLO format: <class_id> <x_center> <y_center> <width> <height>
All coordinates are normalized (0-1) relative to image dimensions.
"""

import os
import io
import zipfile
from pathlib import Path
from django.conf import settings
from PIL import Image as PILImage, ImageDraw


class YOLOConverter:
    """Converts annotations to YOLO dataset format"""
    
    # YOLO format colors for drawing
    COLORS = [
        (255, 0, 0),      # Red
        (0, 255, 0),      # Green
        (0, 0, 255),      # Blue
        (255, 255, 0),    # Yellow
        (255, 0, 255),    # Magenta
        (0, 255, 255),    # Cyan
        (255, 128, 0),    # Orange
        (128, 0, 255),    # Purple
        (128, 128, 0),    # Olive
        (0, 128, 128),    # Teal
    ]
    
    @staticmethod
    def get_color_for_class(class_id):
        """Get RGB color for a class ID"""
        return YOLOConverter.COLORS[class_id % len(YOLOConverter.COLORS)]
    
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
    
    @staticmethod
    def generate_yolo_text(image):
        """
        Generate YOLO format text content for a single image.
        
        Args:
            image: Image model instance
            
        Returns:
            String with YOLO format annotations (one line per annotation)
        """
        lines = []
        annotations = image.annotations.all()
        
        for annotation in annotations:
            line = YOLOConverter.annotation_to_yolo_line(annotation)
            lines.append(line)
        
        return '\n'.join(lines) + '\n' if lines else ''
    
    @staticmethod
    def generate_yolo_zip(images_with_annotations):
        """
        Generate a ZIP file containing YOLO format label files for multiple images.
        
        Args:
            images_with_annotations: List of Image objects with annotations
            
        Returns:
            BytesIO object containing the ZIP file
        """
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for image in images_with_annotations:
                # Generate filename based on image ID and name
                filename = f"{image.id}_{Path(image.name).stem}.txt"
                
                # Get YOLO text content
                yolo_content = YOLOConverter.generate_yolo_text(image)
                
                # Add to zip
                if yolo_content.strip():  # Only add if there are annotations
                    zip_file.writestr(filename, yolo_content)
        
        zip_buffer.seek(0)
        return zip_buffer
    
    @staticmethod
    def draw_boxes_on_image(image_obj):
        """
        Draw bounding boxes on an image.
        
        Args:
            image_obj: Image model instance
            
        Returns:
            PIL Image object with boxes drawn
        """
        # Load the image
        img = PILImage.open(image_obj.image_file.path).convert('RGB')
        draw = ImageDraw.Draw(img, 'RGBA')
        
        # Get image dimensions
        img_width, img_height = img.size
        
        # Draw boxes
        for annotation in image_obj.annotations.all():
            # Convert normalized coordinates to pixel coordinates
            x_center = annotation.x_center * img_width
            y_center = annotation.y_center * img_height
            box_width = annotation.width * img_width
            box_height = annotation.height * img_height
            
            # Calculate corner coordinates
            x1 = x_center - box_width / 2
            y1 = y_center - box_height / 2
            x2 = x_center + box_width / 2
            y2 = y_center + box_height / 2
            
            # Clamp to image bounds
            x1 = max(0, min(x1, img_width))
            y1 = max(0, min(y1, img_height))
            x2 = max(0, min(x2, img_width))
            y2 = max(0, min(y2, img_height))
            
            # Get color for this class
            color = YOLOConverter.get_color_for_class(annotation.class_id)
            
            # Draw rectangle with semi-transparent fill
            draw.rectangle(
                [(x1, y1), (x2, y2)],
                outline=color,
                width=2,
                fill=(*color, 50)
            )
            
            # Draw label
            label_text = f"{annotation.label} ({annotation.class_id})"
            bbox = draw.textbbox((0, 0), label_text)
            label_width = bbox[2] - bbox[0] + 6
            label_height = bbox[3] - bbox[1] + 4
            
            # Draw label background
            draw.rectangle(
                [(x1, y1 - label_height - 4), (x1 + label_width, y1)],
                fill=(*color, 200)
            )
            
            # Draw label text
            draw.text(
                (x1 + 3, y1 - label_height - 2),
                label_text,
                fill=(255, 255, 255)
            )
        
        return img
    
    @staticmethod
    def generate_yolo_dataset_with_boxes(images_with_annotations, output_dir='dataset'):
        """
        Generate YOLO dataset with boxes drawn on images.
        
        Args:
            images_with_annotations: List of Image objects with annotations
            output_dir: Base directory for dataset (default: 'dataset')
            
        Returns:
            Dict with generation status and paths
        """
        # Create directory structure
        base_path = Path(settings.BASE_DIR) / output_dir
        images_path = base_path / 'images_with_boxes'
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
                # Draw boxes on image
                img_with_boxes = YOLOConverter.draw_boxes_on_image(image)
                
                # Save image with boxes
                image_filename = f"{image.id}_{image.name}"
                dest_image_path = images_path / image_filename
                img_with_boxes.save(dest_image_path)
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
    def generate_yolo_zip_with_images(images_with_annotations):
        """
        Generate a ZIP file containing images with boxes drawn AND labels.
        Always returns text labels even if drawing fails.
        
        Args:
            images_with_annotations: List of Image objects with annotations
            
        Returns:
            BytesIO object containing the ZIP file
        """
        print(f"\n[ZIP-GEN] Starting ZIP generation with {len(images_with_annotations)} images\n")
        zip_buffer = io.BytesIO()
        files_added = 0
        images_added = 0
        labels_added = 0
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for idx, image in enumerate(images_with_annotations, 1):
                print(f"[ZIP-GEN] [{idx}/{len(images_with_annotations)}] Processing image {image.id}: {image.name}")
                
                # Step 1: Try to add the image file (with or without boxes)
                try:
                    print(f"[ZIP-GEN]   Trying to draw boxes on image...")
                    img_with_boxes = YOLOConverter.draw_boxes_on_image(image)
                    
                    img_filename = f"{image.id}_{Path(image.name).stem}.png"
                    img_bytes_io = io.BytesIO()
                    img_with_boxes.save(img_bytes_io, format='PNG')
                    img_bytes_io.seek(0)
                    
                    zip_file.writestr(f"images/{img_filename}", img_bytes_io.read())
                    print(f"[ZIP-GEN]   ✓ Added image with boxes: images/{img_filename}")
                    images_added += 1
                    files_added += 1
                    
                except Exception as e:
                    print(f"[ZIP-GEN]   ✗ ERROR drawing boxes: {str(e)}")
                    print(f"[ZIP-GEN]   Trying to add original image without boxes...")
                    
                    try:
                        # Fallback: add original image without drawing
                        img_filename = f"{image.id}_{Path(image.name).stem}.png"
                        img_bytes_io = io.BytesIO()
                        
                        with PILImage.open(image.image_file.path) as pil_img:
                            pil_img.convert('RGB').save(img_bytes_io, format='PNG')
                        
                        img_bytes_io.seek(0)
                        zip_file.writestr(f"images/{img_filename}", img_bytes_io.read())
                        print(f"[ZIP-GEN]   ✓ Added original image (no boxes): images/{img_filename}")
                        images_added += 1
                        files_added += 1
                    except Exception as e2:
                        print(f"[ZIP-GEN]   ✗ ERROR adding original image: {str(e2)}")
                        print(f"[ZIP-GEN]   Skipping image {image.id}")
                
                # Step 2: Always add label file (with YOLO format)
                try:
                    label_filename = f"{image.id}_{Path(image.name).stem}.txt"
                    yolo_content = YOLOConverter.generate_yolo_text(image)
                    
                    zip_file.writestr(f"labels/{label_filename}", yolo_content)
                    annot_count = image.annotations.count()
                    print(f"[ZIP-GEN]   ✓ Added label: labels/{label_filename} ({annot_count} annotations, {len(yolo_content)} bytes)")
                    labels_added += 1
                    files_added += 1
                    
                except Exception as e:
                    print(f"[ZIP-GEN]   ✗ ERROR adding label: {str(e)}")
        
        zip_buffer.seek(0)
        zip_size = len(zip_buffer.getvalue())
        print(f"\n[ZIP-GEN] ZIP generation complete:")
        print(f"[ZIP-GEN]   Total size: {zip_size} bytes")
        print(f"[ZIP-GEN]   Images added: {images_added}/{len(images_with_annotations)}")
        print(f"[ZIP-GEN]   Labels added: {labels_added}/{len(images_with_annotations)}")
        print(f"[ZIP-GEN]   Total files: {files_added}\n")
        
        return zip_buffer
