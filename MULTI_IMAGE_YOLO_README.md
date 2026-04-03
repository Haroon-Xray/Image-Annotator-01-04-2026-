# Multi-Image Annotation & YOLO Dataset Generation - Day 4

## Overview
This refactored project now supports annotating multiple images (10+) simultaneously and generates YOLO-format datasets for computer vision model training.

## New Features

### 1. Multi-Image Support
- **Upload multiple images** in batch (10, 100, or more)
- **Switch between images** easily in the sidebar
- **Track annotations** for each image separately
- **Quick annotation count** displayed on image thumbnails

### 2. Bulk Annotation API
**Endpoint:** `POST /api/images/bulk/annotations/`

Submit all annotations for multiple images in a single request:

```json
{
  "images": [
    {
      "image_id": 1,
      "annotations": [
        {
          "label": "person",
          "class_id": 0,
          "x_center": 0.5,
          "y_center": 0.5,
          "width": 0.3,
          "height": 0.4
        },
        {
          "label": "car",
          "class_id": 1,
          "x_center": 0.7,
          "y_center": 0.7,
          "width": 0.2,
          "height": 0.25
        }
      ]
    },
    {
      "image_id": 2,
      "annotations": [...]
    }
  ]
}
```

**Response:**
```json
{
  "total_images": 2,
  "total_annotations": 15,
  "images_processed": [
    {"image_id": 1, "annotations_count": 5},
    {"image_id": 2, "annotations_count": 10}
  ],
  "errors": []
}
```

Validation automatically ensures:
- All required fields exist (class_id, x_center, y_center, width, height, label)
- Normalized coordinates are between 0 and 1
- class_id is non-negative integer

### 3. YOLO Dataset Generation
**Endpoint:** `POST /api/images/yolo/generate/`

Generates a complete YOLO-format dataset from annotated images:

```json
{
  "image_ids": [1, 2, 3, 4, 5],
  "output_dir": "dataset"
}
```

**Response:**
```json
{
  "success": true,
  "images_copied": 5,
  "labels_created": 5,
  "total_annotations": 32,
  "dataset_path": "/path/to/dataset",
  "images_path": "/path/to/dataset/images",
  "labels_path": "/path/to/dataset/labels",
  "class_distribution": {
    "0": 15,
    "1": 12,
    "2": 5
  },
  "errors": []
}
```

**Dataset Structure:**
```
dataset/
├── images/
│   ├── 1_image1.jpg
│   ├── 2_image2.png
│   └── 3_image3.jpg
└── labels/
    ├── 1_image1.txt
    ├── 2_image2.txt
    └── 3_image3.txt
```

**YOLO Label Format** (`.txt` files):
```
0 0.5 0.5 0.3 0.4
1 0.7 0.7 0.2 0.25
0 0.2 0.3 0.1 0.15
```

Where each line is: `<class_id> <x_center> <y_center> <width> <height>`
- All coordinates are **normalized** (0-1 relative to image dimensions)
- One bounding box per line
- All values space-separated

### 4. Frontend Actions
New buttons in the navbar:
- **📤 Submit** - Submit all annotations to backend
- **🚀 Generate YOLO** - Generate YOLO dataset for all images

## API Endpoints

### Images
- `GET /api/images/` - List all images
- `POST /api/images/` - Upload new image
- `GET /api/images/{id}/` - Get image with annotations
- `PUT /api/images/{id}/` - Update image metadata
- `DELETE /api/images/{id}/` - Delete image
- `POST /api/images/bulk/annotations/` - **NEW**: Submit bulk annotations
- `POST /api/images/yolo/generate/` - **NEW**: Generate YOLO dataset

### Annotations
- `GET /api/images/{image_id}/annotations/` - List annotations for image
- `POST /api/images/{image_id}/annotations/` - Create single annotation
- `POST /api/images/{image_id}/annotations/batch-create/` - Create multiple annotations
- `DELETE /api/images/{image_id}/annotations/clear-all/` - Clear all annotations

## Database Schema Updates

### Annotation Model
New fields added:
- `class_id` (int, default=0) - Class identifier for YOLO format
- `x_center` (float, 0-1) - Normalized center X coordinate
- `y_center` (float, 0-1) - Normalized center Y coordinate
- `width` (float, 0-1) - Normalized width
- `height` (float, 0-1) - Normalized height

Old fields retained for backward compatibility:
- `x`, `y`, `width`, `height` (pixel coordinates)

## Validation

### YOLO Annotation Validation
All annotations are validated to ensure YOLO format compliance:

```python
from annotator.yolo_utils import YOLOConverter

# Validate single annotation
is_valid, error = YOLOConverter.validate_annotation({
    'class_id': 0,
    'x_center': 0.5,
    'y_center': 0.5,
    'width': 0.3,
    'height': 0.4
})
```

Validation rules:
- ✓ All required fields present
- ✓ class_id is non-negative integer
- ✓ x_center, y_center, width, height are floats
- ✓ All coordinates normalized (0.0 ≤ value ≤ 1.0)

## Testing

Run YOLO conversion tests:
```bash
python manage.py test annotator.tests.YOLOConverterTestCase -v 2
```

Test coverage includes:
- ✓ Valid annotation validation
- ✓ Missing field detection
- ✓ Invalid class_id detection
- ✓ Out-of-bounds coordinate detection
- ✓ YOLO line generation
- ✓ Multi-class support
- ✓ Class distribution calculation
- ✓ Boundary coordinate handling

All 9 tests pass!

## Usage Workflow

### 1. Upload Multiple Images
- Click upload zone or drag-drop 10+ images
- See thumbnails appear in sidebar

### 2. Annotate Each Image
- Click on image to select it
- Use Draw tool to create bounding boxes
- Use Select tool to resize/move boxes
- Add labels and class IDs

### 3. Submit Annotations (Optional)
- Click **📤 Submit** button
- All annotations sent to backend in one request
- Status message shows confirmation

### 4. Generate YOLO Dataset
- Click **🚀 Generate YOLO** button
- System creates dataset in `backend/dataset/`
- Images copied to `dataset/images/`
- Labels created in `dataset/labels/`
- Response shows statistics (image count, annotation count, class distribution)

### 5. Use Dataset for Training
```bash
# Copy dataset to your ML framework
cp -r backend/dataset/* /path/to/yolo/data/

# Use with YOLOv8, YOLOv5, etc.
```

## Project Structure

```
backend/
├── annotator/
│   ├── models.py           # Updated: Added normalized coordinates to Annotation
│   ├── views.py            # Updated: Added bulk/YOLO endpoints
│   ├── serializers.py      # Updated: Added bulk/YOLO serializers
│   ├── yolo_utils.py       # NEW: YOLO conversion utilities
│   ├── tests.py            # Updated: Added YOLO converter tests
│   ├── urls.py             # Updated: Register new endpoints
│   └── migrations/
│       └── 0002_*.py       # NEW: Migration for normalized coordinates
├── settings.py             # Updated: STATICFILES configuration
└── db.sqlite3              # Updated schema

frontend/
├── src/
│   ├── App.jsx             # Updated: Pass images/annotations to Navbar
│   ├── api.js              # Existing: API client
│   ├── components/
│   │   ├── Navbar.jsx      # Updated: Added Submit & YOLO buttons
│   │   ├── Navbar.module.css # Updated: New button styles
│   │   ├── ImageSidebar.jsx # Existing: Multi-image support
│   │   └── ...
│   ├── hooks/
│   │   └── useAnnotations.js # Updated: Support class_id
│   └── ...
└── vite.config.js          # Existing: Build configuration

dataset/              # Generated by YOLO generation
├── images/          # Image files
└── labels/          # YOLO format .txt files
```

## Key Implementation Details

### Normalized Coordinates
All YOLO-format annotations use normalized coordinates (0-1):
- `x_center = box_center_x / image_width`
- `y_center = box_center_y / image_height`  
- `width = box_width / image_width`
- `height = box_height / image_height`

Frontend canvas automatically converts pixel coordinates to normalized format before submission.

### Bulk Operations
- `POST /api/images/bulk/annotations/` accepts 100s of annotations atomically
- All validations run before any data is saved
- Error report includes specific issues per annotation

### Dataset Generation
- `YOLOConverter.generate_yolo_dataset()` handles file I/O
- Images copied using PIL for consistency
- Labels created in standard YOLO format (one annotation per line)
- Class distribution calculated for dataset analysis

## Error Handling

All endpoints return detailed error messages:

```json
{
  "error": "Annotation 0: x_center must be between 0 and 1 (normalized)"
}
```

Specific validation errors identify:
- Missing required fields
- Invalid data types
- Out-of-bounds values
- Image not found
- File system errors

## Next Steps

Potential enhancements:
- [ ] Auto-split dataset into train/val/test sets
- [ ] YAML config generation for YOLOv8
- [ ] Batch normalization statistics
- [ ] Dataset versioning
- [ ] Augmentation configuration
- [ ] Multi-class label management UI

