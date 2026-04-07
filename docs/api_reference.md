# API Reference

Complete REST API endpoint documentation for the Image Annotator application.

## Base URL
```
http://localhost:8000/api
```

## Authentication
Currently uses session-based authentication. All endpoints accept both authenticated and unauthenticated requests (AllowAny permission).

---

## Image Endpoints

### List All Images
**Endpoint:** `GET /api/images/`

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `page_size` (optional): Items per page (default: 20)

**Response:**
```json
{
  "count": 15,
  "next": "http://localhost:8000/api/images/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "file": "/media/images/2026/04/07/image1.jpg",
      "title": "Street Scene",
      "description": "Photo of a busy street",
      "class_ids": [0, 1, 2],
      "uploaded_at": "2026-04-07T12:00:00Z",
      "updated_at": "2026-04-07T12:00:00Z",
      "annotations": [
        {
          "id": 1,
          "label": "person",
          "class_id": 0,
          "x_center": 0.45,
          "y_center": 0.55,
          "width": 0.30,
          "height": 0.60
        }
      ]
    }
  ]
}
```

**Status Codes:**
- `200 OK`: Successfully returned image list
- `400 Bad Request`: Invalid query parameters

---

### Upload Image
**Endpoint:** `POST /api/images/`

**Request Headers:**
```
Content-Type: multipart/form-data
```

**Request Body:**
```
file: <image file>
title: "Image Title"           [optional]
description: "Image desc"      [optional]
class_ids: [0, 1, 2]          [optional, JSON array]
```

**Response:**
```json
{
  "id": 5,
  "file": "/media/images/2026/04/07/newimage.jpg",
  "title": "New Image",
  "description": "",
  "class_ids": [],
  "uploaded_at": "2026-04-07T14:30:00Z",
  "updated_at": "2026-04-07T14:30:00Z",
  "annotations": []
}
```

**Status Codes:**
- `201 Created`: Image uploaded successfully
- `400 Bad Request`: Invalid file or missing required fields
- `413 Payload Too Large`: File size exceeds limit

---

### Get Single Image
**Endpoint:** `GET /api/images/{id}/`

**URL Parameters:**
- `id`: Image ID (integer)

**Response:**
```json
{
  "id": 1,
  "file": "/media/images/2026/04/07/image1.jpg",
  "title": "Street Scene",
  "description": "Photo of a busy street",
  "class_ids": [0, 1, 2],
  "uploaded_at": "2026-04-07T12:00:00Z",
  "updated_at": "2026-04-07T12:00:00Z",
  "annotations": [...]
}
```

**Status Codes:**
- `200 OK`: Image found
- `404 Not Found`: Image does not exist

---

### Update Image
**Endpoint:** `PUT /api/images/{id}/`

**URL Parameters:**
- `id`: Image ID (integer)

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "class_ids": [0, 1, 2, 3]
}
```

**Response:** Updated image object (same as GET)

**Status Codes:**
- `200 OK`: Image updated successfully
- `400 Bad Request`: Invalid data
- `404 Not Found`: Image does not exist

---

### Delete Image
**Endpoint:** `DELETE /api/images/{id}/`

**URL Parameters:**
- `id`: Image ID (integer)

**Response:** No content

**Status Codes:**
- `204 No Content`: Image deleted successfully
- `404 Not Found`: Image does not exist

---

## Annotation Endpoints

### List Annotations for Image
**Endpoint:** `GET /api/images/{id}/annotations/`

**URL Parameters:**
- `id`: Image ID (integer)

**Response:**
```json
[
  {
    "id": 1,
    "label": "person",
    "class_id": 0,
    "x_center": 0.45,
    "y_center": 0.55,
    "width": 0.30,
    "height": 0.60,
    "created_at": "2026-04-07T12:00:00Z",
    "updated_at": "2026-04-07T12:00:00Z"
  }
]
```

**Status Codes:**
- `200 OK`: Annotations retrieved successfully
- `404 Not Found`: Image does not exist

---

### Create Annotation
**Endpoint:** `POST /api/images/{id}/annotations/`

**URL Parameters:**
- `id`: Image ID (integer)

**Request Body:**
```json
{
  "label": "person",
  "class_id": 0,
  "x_center": 0.45,
  "y_center": 0.55,
  "width": 0.30,
  "height": 0.60
}
```

**Requirements:**
- `label`: Required, string
- `class_id`: Required, integer >= 0
- `x_center`, `y_center`, `width`, `height`: Required, float in range [0, 1]

**Response:**
```json
{
  "id": 10,
  "label": "person",
  "class_id": 0,
  "x_center": 0.45,
  "y_center": 0.55,
  "width": 0.30,
  "height": 0.60,
  "created_at": "2026-04-07T15:00:00Z",
  "updated_at": "2026-04-07T15:00:00Z"
}
```

**Status Codes:**
- `201 Created`: Annotation created successfully
- `400 Bad Request`: Invalid data or validation error
- `404 Not Found`: Image does not exist

---

### Update Annotation
**Endpoint:** `PUT /api/annotations/{id}/`

**URL Parameters:**
- `id`: Annotation ID (integer)

**Request Body:** (same as create, all fields optional)
```json
{
  "label": "car",
  "class_id": 1,
  "x_center": 0.50,
  "y_center": 0.50,
  "width": 0.25,
  "height": 0.50
}
```

**Response:** Updated annotation object

**Status Codes:**
- `200 OK`: Annotation updated successfully
- `400 Bad Request`: Invalid data
- `404 Not Found`: Annotation does not exist

---

### Delete Annotation
**Endpoint:** `DELETE /api/annotations/{id}/`

**URL Parameters:**
- `id`: Annotation ID (integer)

**Response:** No content

**Status Codes:**
- `204 No Content`: Annotation deleted successfully
- `404 Not Found`: Annotation does not exist

---

## Inference Endpoint

### Run Object Detection
**Endpoint:** `POST /api/inference/`

**Request Headers:**
```
Content-Type: multipart/form-data
```

**Request Body:**
```
image: <image file>              [required]
confidence: 0.5                  [optional, default: 0.5, range: 0-1]
iou: 0.5                         [optional, default: 0.5, range: 0-1]
```

**Response:**
```json
{
  "detections": [
    {
      "class": "person",
      "class_id": 0,
      "confidence": 0.92,
      "bbox": {
        "x_center": 0.45,
        "y_center": 0.55,
        "width": 0.30,
        "height": 0.60
      }
    }
  ],
  "inference_time": 0.342,
  "model": "yolov8n.pt"
}
```

**Parameters:**
- `confidence`: Detection confidence threshold (0-1)
  - Lower values: More detections (including weak ones)
  - Higher values: Only high-confidence detections
- `iou`: NMS IOU threshold (0-1)
  - Lower values: More bounding boxes
  - Higher values: More aggressive box merging

**Status Codes:**
- `200 OK`: Inference completed successfully
- `400 Bad Request`: Missing image or invalid parameters
- `500 Internal Server Error`: Model loading or processing error

---

## Helper Endpoints

### Health Check
**Endpoint:** `GET /api/health/`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-04-07T15:30:00Z"
}
```

**Status Codes:**
- `200 OK`: Service is healthy

---

### Get Available Classes
**Endpoint:** `GET /api/classes/`

**Response:**
```json
[
  {
    "id": 0,
    "name": "person",
    "color": "#FF0000"
  },
  {
    "id": 1,
    "name": "car",
    "color": "#00FF00"
  }
]
```

**Status Codes:**
- `200 OK`: Classes retrieved successfully

---

### Generate YOLO Dataset
**Endpoint:** `GET /api/images/generate_yolo_dataset/`

**Query Parameters:**
- `image_ids` (optional): Comma-separated list of image IDs
  - If empty: Generates for all images
  - Example: `?image_ids=1,2,5`

**Response:**
```
Content-Type: application/zip (for multiple) or text/plain (for single)
Content-Disposition: attachment; filename="dataset.zip"

Headers:
X-Images-Count: 3
X-Total-Annotations: 42
```

**Response Body:**
- Single image: Plain text YOLO format
  ```
  0 0.45 0.55 0.30 0.60
  1 0.60 0.40 0.25 0.45
  ```
- Multiple images: ZIP file with structure:
  ```
  images/
    - image1.jpg
    - image2.jpg
  labels/
    - image1.txt
    - image2.txt
  ```

**Status Codes:**
- `200 OK`: Dataset generated and downloaded
- `400 Bad Request`: Invalid image IDs
- `404 Not Found`: No images found

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message",
  "details": "Additional error information",
  "status_code": 400
}
```

**Common Errors:**
- `400 Bad Request`: Invalid request parameters or data
- `404 Not Found`: Resource does not exist
- `413 Payload Too Large`: File upload exceeds size limit
- `500 Internal Server Error`: Server-side processing error

---

## Rate Limiting
Currently not implemented. Will be added in future versions.

## Pagination
Default page size: 20 items per page

Example with pagination:
```
GET /api/images/?page=2&page_size=50
```

## Sorting
Sorting available via query parameters on list endpoints:
```
GET /api/images/?ordering=-uploaded_at
```

## Filtering
Search available on list endpoints:
```
GET /api/images/?search=street
```
