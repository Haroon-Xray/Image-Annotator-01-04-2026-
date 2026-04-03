# Image Annotator - Complete Documentation

## 📌 Versions

### Frontend Version
- **React:** 18.2.0
- **Vite:** 5.2.0
- **Node Environment:** Recommended Node.js 16+

### Backend Version
- **Django:** 6.0.3
- **Python:** 3.8+

---

## 📦 Dependencies & Versions

### Frontend Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "lucide-react": "^0.383.0",
  "axios": "^1.6.0"
}
```

### Frontend Dev Dependencies
```json
{
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "@vitejs/plugin-react": "^4.2.0",
  "vite": "^5.2.0"
}
```

### Backend Dependencies
```
Django==6.0.3
djangorestframework==3.14.0
django-cors-headers==4.3.1
psycopg2-binary==2.9.9
Pillow==10.1.0
python-decouple==3.8
```

---

## 🚀 How to Run

### Prerequisites
- **Python 3.8+** installed
- **Node.js 16+** installed
- **npm** package manager

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Run database migrations**
```bash
python manage.py migrate
```

5. **Create superuser (optional)**
```bash
python manage.py createsuperuser
```

6. **Start Django server**
```bash
python manage.py runserver
```
Server runs on: `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Build frontend**
```bash
npm run build
```
This outputs to: `../backend/frontend/`

4. **Collect static files (from backend directory)**
```bash
cd ../backend
python manage.py collectstatic --noinput
```

5. **Access the application**
Open browser: `http://localhost:8000`

---

## 🗄️ Database

### Database Type
- **SQLite** (default, file-based: `db.sqlite3`)
- **PostgreSQL** (optional, via environment configuration)

### Database Tables

#### Image Table
```
- id (AutoField, Primary Key)
- name (CharField, max_length=255)
- image_file (ImageField)
- size (BigIntegerField) - file size in bytes
- uploaded_at (DateTimeField)
- updated_at (DateTimeField)
- description (TextField, nullable)
```

#### Annotation Table
```
- id (AutoField, Primary Key)
- image_id (ForeignKey to Image)
- label (CharField, max_length=255)
- class_id (IntegerField, default=0)
- x_center (FloatField, 0.0-1.0) - normalized coordinate
- y_center (FloatField, 0.0-1.0) - normalized coordinate
- width (FloatField, 0.0-1.0) - normalized size
- height (FloatField, 0.0-1.0) - normalized size
- x (IntegerField) - pixel coordinate (legacy)
- y (IntegerField) - pixel coordinate (legacy)
- created_at (DateTimeField)
- updated_at (DateTimeField)
```

### Database Commands

**Create new database:**
```bash
python manage.py migrate
```

**Create migrations after model changes:**
```bash
python manage.py makemigrations
```

**Reset database (caution - deletes data):**
```bash
rm db.sqlite3
python manage.py migrate
```

---

## 📡 API Endpoints

### Base URL
```
http://localhost:8000/api/
```

### Image Endpoints

**List all images**
```
GET /api/images/
Response: List of images with annotation counts
```

**Get image details**
```
GET /api/images/{id}/
Response: Image data with all annotations
```

**Upload image**
```
POST /api/images/
Content-Type: multipart/form-data
Fields:
  - image_file (required): Image file
  - name (optional): Image name
  - description (optional): Image description
Response: Created image object
```

**Update image**
```
PUT /api/images/{id}/
Content-Type: application/json
Fields:
  - name (optional)
  - description (optional)
Response: Updated image object
```

**Delete image**
```
DELETE /api/images/{id}/
Response: 204 No Content
```

**Get image statistics**
```
GET /api/images/{id}/stats/
Response: {
  "id": 1,
  "name": "image.jpg",
  "total_annotations": 5,
  "file_size": 2048000,
  "uploaded_at": "2026-04-03T10:00:00",
  "updated_at": "2026-04-03T12:00:00"
}
```

**Export single image**
```
GET /api/images/{id}/export/
Response: JSON with image and annotations
```

**Export multiple images**
```
POST /api/images/batch/export/
Content-Type: application/json
Body: {
  "image_ids": [1, 2, 3]
}
Response: JSON with all image data
```

### Annotation Endpoints

**List annotations for image**
```
GET /api/images/{image_id}/annotations/
Response: List of annotations
```

**Create single annotation**
```
POST /api/images/{image_id}/annotations/
Content-Type: application/json
Body: {
  "label": "person",
  "class_id": 0,
  "x": 100,
  "y": 50,
  "width": 150,
  "height": 200,
  "x_center": 0.5,
  "y_center": 0.5
}
Response: Created annotation object
```

**Create multiple annotations**
```
POST /api/images/{image_id}/annotations/batch-create/
Content-Type: application/json
Body: {
  "annotations": [
    {"label": "person", "class_id": 0, ...},
    {"label": "car", "class_id": 1, ...}
  ]
}
Response: List of created annotations
```

**Update annotation**
```
PUT /api/images/{image_id}/annotations/{id}/
Content-Type: application/json
Body: {
  "label": "person",
  "x_center": 0.6,
  "y_center": 0.6,
  ...
}
Response: Updated annotation object
```

**Delete annotation**
```
DELETE /api/images/{image_id}/annotations/{id}/
Response: 204 No Content
```

**Delete all annotations**
```
POST /api/images/{image_id}/annotations/clear-all/
Response: {
  "message": "Deleted X annotations"
}
```

### Bulk Operations

**Submit annotations for multiple images**
```
POST /api/images/bulk/annotations/
Content-Type: application/json
Body: {
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
        }
      ]
    }
  ]
}
Response: {
  "total_images": 1,
  "total_annotations": 5,
  "images_processed": [
    {"image_id": 1, "annotations_count": 5}
  ],
  "errors": []
}
```

**Generate YOLO dataset**
```
POST /api/images/yolo/generate/
Content-Type: application/json
Body: {
  "image_ids": [1, 2, 3],
  "output_dir": "dataset"
}
Response: {
  "success": true,
  "images_copied": 3,
  "labels_created": 3,
  "total_annotations": 15,
  "dataset_path": "/path/to/dataset",
  "images_path": "/path/to/dataset/images",
  "labels_path": "/path/to/dataset/labels",
  "class_distribution": {
    "0": 10,
    "1": 5
  },
  "errors": []
}
```

---

## 📊 Dataset Structure

### YOLO Dataset Generation

When using `/api/images/yolo/generate/`, a dataset is created:

```
dataset/
├── images/
│   ├── 1_image1.jpg
│   ├── 2_image2.jpg
│   └── 3_image3.jpg
└── labels/
    ├── 1_image1.txt
    ├── 2_image2.txt
    └── 3_image3.txt
```

### YOLO Label Format

Each `.txt` file contains one bounding box per line:

```
<class_id> <x_center> <y_center> <width> <height>
```

**Example `1_image.txt`:**
```
0 0.5 0.5 0.3 0.4
1 0.2 0.8 0.1 0.2
0 0.7 0.3 0.25 0.35
```

**Coordinate Format:**
- All values are space-separated
- All coordinates are **normalized** (0.0 to 1.0)
- Relative to image dimensions
- x_center: center X coordinate / image_width
- y_center: center Y coordinate / image_height
- width: box_width / image_width
- height: box_height / image_height

### Using Generated Dataset

With YOLOv8:
```bash
yolo detect train data=/path/to/dataset model=yolov8n.pt
```

With YOLOv5:
```bash
python train.py --img 640 --batch 16 --epochs 100 --data /path/to/dataset
```

---

## 🎯 Workflow

### 1. Upload Images
```
POST /api/images/
```
Upload single or multiple images

### 2. Annotate Images
```
GET /api/images/{id}/
```
Get image data in frontend

Draw annotations on canvas:
- Frontend captures normalized coordinates
- Stores locally in React state

### 3. Submit Annotations
```
POST /api/images/bulk/annotations/
```
Send all annotations to backend in one request

### 4. Generate YOLO Dataset
```
POST /api/images/yolo/generate/
```
Creates YOLO-format dataset ready for model training

### 5. Use Dataset
Export `dataset/` folder and use with ML frameworks

---

## 🔍 Testing

### Run YOLO Conversion Tests
```bash
cd backend
python manage.py test annotator.tests.YOLOConverterTestCase -v 2
```

**Expected Result:** 9/9 tests passing ✅

### Manual API Testing

Using curl:
```bash
# List images
curl http://localhost:8000/api/images/

# Upload image
curl -X POST -F "image_file=@image.jpg" http://localhost:8000/api/images/

# Generate YOLO dataset
curl -X POST -H "Content-Type: application/json" \
  -d '{"image_ids": [1, 2, 3]}' \
  http://localhost:8000/api/images/yolo/generate/
```

---

## 📁 Project Structure

```
.
├── backend/
│   ├── annotator/
│   │   ├── models.py          # Database models
│   │   ├── views.py           # API endpoints
│   │   ├── serializers.py     # Request/response serialization
│   │   ├── yolo_utils.py      # YOLO conversion utilities
│   │   ├── urls.py            # API routing
│   │   ├── tests.py           # Unit tests
│   │   └── migrations/        # Database migrations
│   ├── backend/
│   │   ├── settings.py        # Django configuration
│   │   ├── urls.py            # URL routing
│   │   └── wsgi.py
│   ├── manage.py
│   ├── requirements.txt       # Python dependencies
│   └── db.sqlite3             # Database file
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/             # React hooks
│   │   ├── api.js             # API client
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json           # Node dependencies
│   ├── vite.config.js         # Vite configuration
│   └── index.html
└── doc.md                     # This file
```

---

## ⚙️ Configuration

### Environment Variables

Optional `.env` file in backend:
```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///db.sqlite3
```

### CORS Settings

Configured in `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8000",
]
```

### Static Files

Frontend built files:
```
backend/frontend/               # React build output
backend/staticfiles/            # Collected static files
backend/frontend/static/        # JS/CSS bundles
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8000
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

### Database Locked
```bash
# Reset database
rm backend/db.sqlite3
cd backend
python manage.py migrate
```

### Frontend Not Loading
```bash
# Rebuild frontend
cd frontend
npm run build

# Collect static files
cd ../backend
python manage.py collectstatic --noinput
```

### YOLO Generation Fails
- Ensure images have annotations
- Verify image_ids are valid
- Check disk space for dataset/

---

## 📝 Example Usage

### Complete Workflow with curl

```bash
# 1. Upload image
IMAGE_ID=$(curl -s -X POST \
  -F "image_file=@photo.jpg" \
  -F "name=photo" \
  http://localhost:8000/api/images/ | jq -r '.id')

# 2. Add annotation
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "label": "person",
    "class_id": 0,
    "x_center": 0.5,
    "y_center": 0.5,
    "width": 0.3,
    "height": 0.4
  }' \
  http://localhost:8000/api/images/${IMAGE_ID}/annotations/

# 3. Generate YOLO dataset
curl -X POST -H "Content-Type: application/json" \
  -d "{\"image_ids\": [${IMAGE_ID}]}" \
  http://localhost:8000/api/images/yolo/generate/
```

---

## 📞 Support

For issues:
1. Check Django error logs: `python manage.py runserver`
2. Run tests: `python manage.py test annotator`
3. Check API responses in browser: `http://localhost:8000/api/images/`
4. Verify database: `python manage.py dbshell`

---

**Last Updated:** April 3, 2026  
**Status:** Production Ready ✅
