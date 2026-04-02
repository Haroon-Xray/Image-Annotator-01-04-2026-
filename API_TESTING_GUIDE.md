# API Testing Guide - Image Annotator Backend

This guide provides cURL commands for testing the Image Annotator backend API endpoints.

## 1. Health Check

### Test Backend Connectivity
```bash
curl http://localhost:8000/api/health/
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Backend is running"
}
```

## 2. Image Management

### A. Upload an Image

**Requirements:** JPEG, PNG, GIF, BMP, or WebP file

```bash
# Create a sample image request
curl -X POST http://localhost:8000/api/images/ \
  -F "image_file=@/path/to/image.jpg" \
  -F "name=Sample Image" \
  -F "description=My test image"
```

**Shell Script Helper:**
```bash
#!/bin/bash
IMAGE_PATH=$1
curl -X POST http://localhost:8000/api/images/ \
  -F "image_file=@$IMAGE_PATH" \
  -F "name=$(basename $IMAGE_PATH)" \
  -F "description=Test image"
```

**Expected Response (201 Created):**
```json
{
  "id": 1,
  "name": "Sample Image",
  "image_file": "/media/images/2026/04/02/image_ABC123.jpg",
  "image_url": "http://localhost:8000/media/images/2026/04/02/image_ABC123.jpg",
  "size": 102400,
  "uploaded_at": "2026-04-02T10:30:00Z",
  "updated_at": "2026-04-02T10:30:00Z",
  "description": "My test image",
  "annotations": []
}
```

### B. List All Images

```bash
curl http://localhost:8000/api/images/
```

**Optional Parameters:**
```bash
# Pagination
curl "http://localhost:8000/api/images/?page=1"

# Search by name
curl "http://localhost:8000/api/images/?search=dog"

# Combine
curl "http://localhost:8000/api/images/?search=photo&page=1"
```

### C. Get Single Image Details

```bash
curl http://localhost:8000/api/images/1/
```

**Response includes annotations:**
```json
{
  "id": 1,
  "name": "photo.jpg",
  "annotations": [
    {
      "id": 1,
      "label": "Dog",
      "x": 100,
      "y": 150,
      "width": 200,
      "height": 250
    }
  ]
}
```

### D. Update Image

```bash
curl -X PUT http://localhost:8000/api/images/1/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "description": "Updated description"
  }'
```

### E. Delete Image

```bash
curl -X DELETE http://localhost:8000/api/images/1/
```

**Response:** 204 No Content (empty)

### F. Get Image Statistics

```bash
curl http://localhost:8000/api/images/1/stats/
```

**Response:**
```json
{
  "id": 1,
  "name": "photo.jpg",
  "total_annotations": 3,
  "file_size": 102400,
  "uploaded_at": "2026-04-02T10:30:00Z",
  "updated_at": "2026-04-02T10:31:00Z"
}
```

## 3. Annotation Management

### A. Create Annotation

```bash
curl -X POST http://localhost:8000/api/images/1/annotations/ \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Cat",
    "x": 50,
    "y": 75,
    "width": 150,
    "height": 200
  }'
```

**Response (201 Created):**
```json
{
  "id": 1,
  "label": "Cat",
  "x": 50,
  "y": 75,
  "width": 150,
  "height": 200,
  "created_at": "2026-04-02T10:31:00Z",
  "updated_at": "2026-04-02T10:31:00Z"
}
```

### B. List Annotations for Image

```bash
curl http://localhost:8000/api/images/1/annotations/
```

**Response:**
```json
[
  {
    "id": 1,
    "label": "Cat",
    "x": 50,
    "y": 75,
    "width": 150,
    "height": 200
  },
  {
    "id": 2,
    "label": "Dog",
    "x": 200,
    "y": 150,
    "width": 180,
    "height": 220
  }
]
```

### C. Get Single Annotation

```bash
curl http://localhost:8000/api/images/1/annotations/1/
```

### D. Update Annotation

```bash
curl -X PUT http://localhost:8000/api/images/1/annotations/1/ \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Updated Label",
    "x": 60,
    "y": 85,
    "width": 160,
    "height": 210
  }'
```

### E. Delete Annotation

```bash
curl -X DELETE http://localhost:8000/api/images/1/annotations/1/
```

### F. Clear All Annotations

```bash
curl -X POST http://localhost:8000/api/images/1/annotations/clear-all/
```

**Response:**
```json
{
  "message": "Deleted 3 annotations"
}
```

### G. Batch Create Annotations

```bash
curl -X POST http://localhost:8000/api/images/1/annotations/batch-create/ \
  -H "Content-Type: application/json" \
  -d '{
    "annotations": [
      {
        "label": "Cat",
        "x": 50,
        "y": 75,
        "width": 150,
        "height": 200
      },
      {
        "label": "Dog",
        "x": 200,
        "y": 150,
        "width": 180,
        "height": 220
      },
      {
        "label": "Bird",
        "x": 300,
        "y": 100,
        "width": 100,
        "height": 120
      }
    ]
  }'
```

## 4. Export Functionality

### A. Export Single Image

```bash
curl http://localhost:8000/api/images/1/export/ | jq .
```

**Response:**
```json
{
  "name": "photo.jpg",
  "uploaded_at": "2026-04-02T10:30:00Z",
  "annotations": [
    {
      "id": 1,
      "label": "Cat",
      "x": 50,
      "y": 75,
      "width": 150,
      "height": 200
    }
  ]
}
```

### B. Save Export to File

```bash
curl http://localhost:8000/api/images/1/export/ > image_1_export.json
```

### C. Batch Export

```bash
curl -X POST http://localhost:8000/api/images/batch/export/ \
  -H "Content-Type: application/json" \
  -d '{
    "image_ids": [1, 2, 3]
  }' | jq .
```

**Response:**
```json
{
  "images": [
    {
      "name": "photo1.jpg",
      "uploaded_at": "2026-04-02T10:30:00Z",
      "annotations": [...]
    },
    {
      "name": "photo2.jpg",
      "uploaded_at": "2026-04-02T10:32:00Z",
      "annotations": [...]
    }
  ]
}
```

### D. Save Batch Export

```bash
curl -X POST http://localhost:8000/api/images/batch/export/ \
  -H "Content-Type: application/json" \
  -d '{"image_ids": [1, 2, 3]}' > batch_export.json
```

## 5. Complete Workflow Example

```bash
#!/bin/bash
# Complete API workflow

echo "1. Health Check"
curl http://localhost:8000/api/health/ | jq .

echo -e "\n2. Upload Image"
RESPONSE=$(curl -X POST http://localhost:8000/api/images/ \
  -F "image_file=@sample.jpg" \
  -F "name=Test Image")
IMAGE_ID=$(echo $RESPONSE | jq -r '.id')
echo $RESPONSE | jq .

echo -e "\n3. Create Annotations"
curl -X POST http://localhost:8000/api/images/$IMAGE_ID/annotations/batch-create/ \
  -H "Content-Type: application/json" \
  -d '{
    "annotations": [
      {"label": "Object 1", "x": 10, "y": 20, "width": 100, "height": 150},
      {"label": "Object 2", "x": 200, "y": 250, "width": 80, "height": 120}
    ]
  }' | jq .

echo -e "\n4. Get Image with Annotations"
curl http://localhost:8000/api/images/$IMAGE_ID/ | jq .

echo -e "\n5. Export"
curl http://localhost:8000/api/images/$IMAGE_ID/export/ | jq .

echo -e "\n6. Get Statistics"
curl http://localhost:8000/api/images/$IMAGE_ID/stats/ | jq .
```

## 6. Using Python for API Testing

```python
import requests
import json

BASE_URL = 'http://localhost:8000/api'

def health_check():
    """Check if API is running"""
    response = requests.get(f'{BASE_URL}/health/')
    return response.json()

def upload_image(file_path, name=''):
    """Upload an image"""
    with open(file_path, 'rb') as f:
        files = {'image_file': f}
        data = {'name': name or file_path}
        response = requests.post(
            f'{BASE_URL}/images/',
            files=files,
            data=data
        )
    return response.json()

def create_annotation(image_id, label, x, y, width, height):
    """Create annotation"""
    data = {
        'label': label,
        'x': x,
        'y': y,
        'width': width,
        'height': height
    }
    response = requests.post(
        f'{BASE_URL}/images/{image_id}/annotations/',
        json=data
    )
    return response.json()

def export_image(image_id):
    """Export image with annotations"""
    response = requests.get(f'{BASE_URL}/images/{image_id}/export/')
    return response.json()

# Usage
if __name__ == '__main__':
    # Check health
    print(health_check())
    
    # Upload image
    result = upload_image('sample.jpg', 'My Image')
    image_id = result['id']
    
    # Create annotation
    ann = create_annotation(image_id, 'Object', 10, 20, 100, 150)
    
    # Export
    export_data = export_image(image_id)
    print(json.dumps(export_data, indent=2))
```

## 7. Response Status Codes Reference

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | GET, PUT requests |
| 201 | Created | POST successful |
| 204 | No Content | DELETE successful |
| 400 | Bad Request | Invalid data |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Backend error |

## 8. Common Error Responses

### Missing Required Field
```json
{
  "label": ["This field is required."]
}
```

### Invalid Image ID
```json
{
  "detail": "Not found."
}
```

### Invalid File Format
```json
{
  "image_file": ["File extension 'txt' is not allowed."]
}
```

## 9. Testing Tips

1. **Use jq for JSON formatting:**
   ```bash
   curl http://localhost:8000/api/images/ | jq .
   ```

2. **Save responses:**
   ```bash
   curl http://localhost:8000/api/images/1/ > response.json
   ```

3. **Check response headers:**
   ```bash
   curl -i http://localhost:8000/api/images/
   ```

4. **Verbose output:**
   ```bash
   curl -v http://localhost:8000/api/images/
   ```

5. **Time the request:**
   ```bash
   curl -w '@curl-format.txt' http://localhost:8000/api/images/
   ```

## 10. Admin Panel

After creating a superuser, access the Django admin:

```
URL: http://localhost:8000/admin/
Username: (from createsuperuser)
Password: (from createsuperuser)
```

Features:
- View all images and annotations
- Edit or delete entries
- Search functionality
- Pagination

For detailed backend documentation, see `backenddoc.md`.
