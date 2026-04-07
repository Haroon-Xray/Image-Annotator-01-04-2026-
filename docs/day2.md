# Day 2: Core Features Development

## Overview
Day 2 focused on building the core API endpoints, database models, and image management functionality.

## ✅ Completed Tasks

### Backend Models

#### Image Model
```python
class Image(models.Model):
    - file: ImageField         # Original uploaded image
    - title: CharField         # Image name/title
    - description: TextField   # Optional description
    - class_ids: JSONField     # Available classes for this image
    - uploaded_at: DateTimeField
    - updated_at: DateTimeField
    - metadata: JSONField      # Additional image metadata
```

**Features:**
- Automatic timestamp tracking
- JSON field for flexible class configuration
- Image file validation and storage

#### Annotation Model
```python
class Annotation(models.Model):
    - image: ForeignKey(Image)           # Reference to image
    - label: CharField                   # Class label
    - class_id: IntegerField            # Class identifier
    - x_center: FloatField              # YOLO normalized X
    - y_center: FloatField              # YOLO normalized Y
    - width: FloatField                 # YOLO normalized width
    - height: FloatField                # YOLO normalized height
    - created_at: DateTimeField
    - updated_at: DateTimeField
```

**Features:**
- YOLO format coordinates (0-1 normalization)
- Linked to parent image
- Timestamp tracking

### API Endpoints

#### Image Endpoints
```
GET    /api/images/              → List all images with pagination
POST   /api/images/              → Upload new image
GET    /api/images/{id}/         → Retrieve specific image
PUT    /api/images/{id}/         → Update image metadata
DELETE /api/images/{id}/         → Delete image and annotations
```

#### Annotation Endpoints
```
GET    /api/images/{id}/annotations/   → List annotations for image
POST   /api/images/{id}/annotations/   → Create annotation
PUT    /api/{annotation_id}/           → Update annotation
DELETE /api/{annotation_id}/           → Delete annotation
```

#### Helper Endpoints
```
GET    /api/health/              → Health check
GET    /api/classes/             → Available classes
POST   /api/images/{id}/upload/  → Bulk image upload
```

### Serializers

#### ImageSerializer
- Serializes image data
- Includes nested annotations
- Handles file uploads

#### AnnotationSerializer
- Validates YOLO coordinates
- Ensures x_center, y_center, width, height are in range [0, 1]
- Validates class_id and label

### File Management

#### Image Storage
- Images stored in `media/images/` directory
- Organized by upload date (YYYY/MM/DD)
- Original filenames preserved

#### Temporary File Handling
- Supports streaming uploads
- Cleanup of failed uploads
- Proper error handling

## 🔄 API Workflow

### Image Upload Workflow
```
1. User uploads image via POST /api/images/
2. Image validated (format, size, etc.)
3. File saved to media/images/{year}/{month}/{day}/
4. Image record created in database
5. Response includes image_id and metadata
```

### Annotation Workflow
```
1. User draws box on canvas
2. Coordinates normalized to YOLO format
3. POST /api/images/{id}/annotations/
4. Annotation validated and saved
5. Real-time update on frontend
```

## 📊 Database Schema

### Images Table
| Column | Type | Purpose |
|--------|------|---------|
| id | PRIMARY KEY | Unique identifier |
| file | ImageField | Uploaded image file |
| title | VARCHAR | Image title |
| description | TEXT | Image description |
| class_ids | JSON | Available classes |
| uploaded_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last modified |

### Annotations Table
| Column | Type | Purpose |
|--------|------|---------|
| id | PRIMARY KEY | Unique identifier |
| image_id | FOREIGN KEY | Reference to image |
| label | VARCHAR | Class label |
| class_id | INTEGER | Class identifier |
| x_center | FLOAT | Normalized X coordinate |
| y_center | FLOAT | Normalized Y coordinate |
| width | FLOAT | Normalized width |
| height | FLOAT | Normalized height |

## 🔧 Technical Decisions

### Why YOLO Normalization?
- Industry standard for object detection datasets
- Coordinates always in range [0, 1]
- Resolution-independent format
- Compatible with ML models

### Why JSON for class_ids?
- Flexible class configuration per image
- No need for separate ClassConfiguration table
- Easy to extend with additional metadata

### Why Separate Annotation Table?
- Multiple annotations per image (one-to-many relationship)
- Atomic operations per annotation
- Easier to query and filter

## 📈 Features Implemented

- [x] Image upload with validation
- [x] Image listing with pagination
- [x] Image metadata storage
- [x] Annotation storage with YOLO format
- [x] RESTful API endpoints
- [x] Input validation and error handling
- [x] Database migrations
- [x] User authentication setup

## 🧪 Testing

**Test Coverage:**
- Image model creation and validation
- Annotation creation with coordinate validation
- API endpoint functionality
- Upload file handling
- Error cases and edge conditions

## 🚀 Next Steps

→ **Day 3**: UI implementation and annotation canvas
