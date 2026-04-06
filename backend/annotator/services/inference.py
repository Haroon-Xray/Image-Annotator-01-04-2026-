"""
Inference service for YOLO model inference on images.

This module provides a service class for loading and running inference
with YOLOv8 pre-trained models.
"""

import logging
from pathlib import Path
from typing import List, Dict, Union, Tuple
from PIL import Image as PILImage
from ultralytics import YOLO

logger = logging.getLogger(__name__)


class InferenceService:
    """
    Service for running YOLOv8 inference on images.
    
    This service handles:
    - Loading YOLOv8 pre-trained models
    - Running inference on image files
    - Formatting detection results
    - Caching loaded models for performance
    """
    
    _models = {}  # Cache for loaded models
    
    def __init__(self, model_name: str = 'yolov8n.pt'):
        """
        Initialize the inference service.
        
        Args:
            model_name: Name of the YOLOv8 model to use (default: yolov8n.pt)
                       Options: yolov8n, yolov8s, yolov8m, yolov8l, yolov8x
        """
        self.model_name = model_name
        self._model = None
    
    def _load_model(self) -> YOLO:
        """
        Load the YOLOv8 model, using cache if available.
        
        Returns:
            YOLO: Loaded YOLOv8 model instance
            
        Raises:
            RuntimeError: If model loading fails
        """
        if self.model_name not in self._models:
            try:
                logger.info(f"Loading YOLO model: {self.model_name}")
                model = YOLO(self.model_name)
                self._models[self.model_name] = model
                logger.info(f"Successfully loaded YOLO model: {self.model_name}")
            except Exception as e:
                logger.error(f"Failed to load YOLO model {self.model_name}: {str(e)}")
                raise RuntimeError(f"Failed to load YOLO model: {str(e)}")
        
        return self._models[self.model_name]
    
    def run_inference(
        self,
        image_path: Union[str, Path],
        confidence: float = 0.5,
        iou: float = 0.45
    ) -> List[Dict[str, Union[str, float, Dict]]]:
        """
        Run inference on an image and return detections.
        
        Args:
            image_path: Path to the image file
            confidence: Confidence threshold for detections (0-1)
            iou: IOU threshold for NMS (0-1)
        
        Returns:
            List of detections with structure:
            [
                {
                    'label': str,           # Class name
                    'confidence': float,    # Confidence score (0-1)
                    'bbox': {
                        'x': float,         # Normalized center X (0-1)
                        'y': float,         # Normalized center Y (0-1)
                        'width': float,     # Normalized width (0-1)
                        'height': float     # Normalized height (0-1)
                    }
                },
                ...
            ]
        
        Raises:
            FileNotFoundError: If image file doesn't exist
            ValueError: If image cannot be loaded or inference fails
            RuntimeError: If model loading fails
        """
        # Validate input
        image_path = Path(image_path)
        if not image_path.exists():
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        if confidence < 0 or confidence > 1:
            raise ValueError(f"Confidence must be between 0 and 1, got {confidence}")
        
        if iou < 0 or iou > 1:
            raise ValueError(f"IOU threshold must be between 0 and 1, got {iou}")
        
        try:
            # Validate image format
            with PILImage.open(image_path) as img:
                img_width, img_height = img.size
                logger.debug(f"Image size: {img_width}x{img_height}")
        except Exception as e:
            raise ValueError(f"Failed to load image: {str(e)}")
        
        try:
            # Load model
            model = self._load_model()
            
            # Run inference
            logger.debug(f"Running inference on {image_path}")
            results = model.predict(
                source=str(image_path),
                conf=confidence,
                iou=iou,
                verbose=False,
                device=0  # Use GPU if available, else CPU
            )
            
            # Format detections
            detections = self._format_results(results, img_width, img_height)
            logger.info(f"Inference complete: {len(detections)} detections found")
            
            return detections
            
        except RuntimeError as e:
            logger.error(f"Model loading error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Inference error: {str(e)}")
            raise ValueError(f"Inference failed: {str(e)}")
    
    def _format_results(
        self,
        results,
        img_width: int,
        img_height: int
    ) -> List[Dict[str, Union[str, float, Dict]]]:
        """
        Format YOLO detection results into standardized structure.
        
        Args:
            results: YOLO model prediction results
            img_width: Image width in pixels
            img_height: Image height in pixels
        
        Returns:
            List of formatted detection dictionaries
        """
        detections = []
        
        if len(results) == 0:
            logger.debug("No detections found in results")
            return detections
        
        result = results[0]  # Get first (and only) result
        
        # Check if detections exist
        if result.boxes is None or len(result.boxes) == 0:
            logger.debug("No boxes found in result")
            return detections
        
        # Extract class names
        class_names = result.names if result.names else {}
        
        # Process each box
        for i, box in enumerate(result.boxes):
            try:
                # Extract box coordinates and confidence
                x1, y1, x2, y2 = box.xyxy[0].tolist()  # Pixel coordinates
                confidence = float(box.conf[0].cpu().numpy())
                class_id = int(box.cls[0].cpu().numpy())
                
                # Get class name
                label = class_names.get(class_id, f"Class {class_id}")
                
                # Normalize coordinates
                x_center = (x1 + x2) / (2 * img_width)
                y_center = (y1 + y2) / (2 * img_height)
                width = (x2 - x1) / img_width
                height = (y2 - y1) / img_height
                
                detection = {
                    'label': label,
                    'confidence': round(confidence, 3),
                    'bbox': {
                        'x': round(x_center, 4),
                        'y': round(y_center, 4),
                        'width': round(width, 4),
                        'height': round(height, 4)
                    }
                }
                
                detections.append(detection)
                logger.debug(f"Detection {i + 1}: {label} ({confidence:.2%})")
                
            except Exception as e:
                logger.warning(f"Failed to process detection {i}: {str(e)}")
                continue
        
        return detections
    
    @classmethod
    def clear_model_cache(cls):
        """Clear all cached models from memory."""
        logger.info(f"Clearing model cache ({len(cls._models)} models)")
        cls._models.clear()
    
    @classmethod
    def get_cached_models(cls) -> List[str]:
        """Get list of currently cached model names."""
        return list(cls._models.keys())
