# Image Annotator Backend Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Requirements](#system-requirements)
3. [Installation & Setup](#installation--setup)
4. [Running the Backend](#running-the-backend)
5. [Project Structure](#project-structure)
6. [API Endpoints](#api-endpoints)
7. [Database Schema](#database-schema)
8. [Clone the Project](#clone-the-project)
9. [Troubleshooting](#troubleshooting)
10. [Deployment](#deployment)

---

## Project Overview

**Image Annotator Backend** is a RESTful API built with Django and Django REST Framework that provides complete image annotation capabilities. It allows users to:

- Upload images
- Create, read, update, and delete bounding box annotations
- Export annotations as JSON
- Batch operations for managing multiple images
- Admin panel for content management

**Project Name:** Image Annotator  
**Backend Framework:** Django  
**API Style:** RESTful (JSON)  
**Database:** SQLite (with support for PostgreSQL, MySQL, etc.)  
**Created:** April 2, 2026

---

## System Requirements

### Minimum Requirements:
- **Python Version:** 3.8 or higher (Recommended: 3.10+)
- **Django Version:** 6.0.3
- **Database:** SQLite 3.8+ (built-in) or PostgreSQL 10+, MySQL 5.7+
- **Operating System:** Windows, macOS, or Linux
- **RAM:** 512 MB minimum (1 GB recommended for production)
- **Disk Space:** 500 MB minimum

### Software to Install:
- Python 3.8+
- pip (Python package manager)
- git (for version control)
- Node.js 16+ (only for frontend, not required for backend)

### Recommended Versions for Production:
```
Python: 3.10.x LTS
Django: 6.0.3 LTS
PostgreSQL: 13+
Ubuntu/CentOS or Windows Server 2019+
```

---

## Installation & Setup

### Step 1: Clone the Repository

```bash
# Navigate to desired directory
cd your-projects-folder

# Clone the repository
git clone https://github.com/Haroon-Xray/Image-Annotator-01-04-2026-.git
cd Image-Annotator-01-04-2026-

# Navigate to backend folder
cd backend
```

### Step 2: Create Virtual Environment

**Windows (PowerShell/CMD):**
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# For PowerShell:
.\venv\Scripts\Activate.ps1

# For Command Prompt:
venv\Scripts\activate.bat
```

**macOS/Linux:**
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
# Ensure pip is up to date
pip install --upgrade pip

# Install required packages
pip install -r requirements.txt
```

**Required Packages:**
- **Django** (6.0.3) - Web framework
- **djangorestframework** (3.14.0) - REST API framework
- **django-cors-headers** (4.3.1) - CORS support for cross-origin requests
- **Pillow** (10.1.0) - Image processing library
- **python-decouple** (3.8) - Environment variable management

### Step 4: Environment Configuration

```bash
# Copy .env.example to .env
# Windows:
copy .env.example .env

# macOS/Linux:
cp .env.example .env
```

Edit `.env` file with your configuration:
```
DEBUG=True
SECRET_KEY=django-insecure-your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Step 5: Initialize Database

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser account for admin panel
python manage.py createsuperuser
```

When prompted:
- **Username:** admin (or your preferred username)
- **Email:** admin@example.com
- **Password:** Enter a strong password (min 8 characters recommended)

### Step 6: Create Media Directories

```bash
# Windows:
if not exist "media" mkdir media
if not exist "media\images" mkdir media\images

# macOS/Linux:
mkdir -p media/images
chmod -R 755 media
```

---

## Running the Backend

### Development Server

```bash
# Ensure virtual environment is activated
# (see Step 2 above if needed)

# Run development server
python manage.py runserver

# Or specify custom port:
python manage.py runserver 0.0.0.0:8000
```

**Development Server Access:**
- API Base URL: `http://localhost:8000/api/`
- Admin Panel: `http://localhost:8000/admin/`
- Health Check: `http://localhost:8000/api/health/`

**Expected Output:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

### Database Information

**Default Database:**
- **Type:** SQLite 3
- **Location:** `backend/db.sqlite3`
- **No Setup Required:** Automatically created on first migration

**Switch to PostgreSQL (Optional):**

Install PostgreSQL client:
```bash
pip install psycopg2-binary
```

Update `settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'image_annotator_db',
        'USER': 'postgres',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

Then run migrations:
```bash
python manage.py migrate
```

---

## Project Structure

```
backend/
├── annotator/                    # Main Django app
│   ├── migrations/              # Database migrations
│   ├── __init__.py
│   ├── admin.py                 # Django admin configuration
│   ├── apps.py                  # App configuration
│   ├── models.py                # Database models (Image, Annotation)
│   ├── serializers.py           # DRF serializers for API
│   ├── urls.py                  # App-level URL routing
│   ├── views.py                 # API viewsets and logic
│   └── tests.py                 # Unit tests
├── backend/                      # Project settings
│   ├── __init__.py
│   ├── asgi.py                  # ASGI configuration (deployment)
│   ├── settings.py              # Django settings
│   ├── urls.py                  # Main URL configuration
│   └── wsgi.py                  # WSGI configuration (deployment)
├── media/                        # User uploaded files
│   └── images/                  # Stored images
├── manage.py                     # Django management script
├── db.sqlite3                    # SQLite database (created after migration)
├── requirements.txt              # Python dependencies
├── .env.example                  # Environment variables template
└── README.md                     # Setup instructions
```

### Key Files Explanation:

**models.py:**
- `Image` - Stores image metadata and file
- `Annotation` - Stores bounding box annotations linked to images

**views.py:**
- `ImageViewSet` - Handles image CRUD operations
- `AnnotationViewSet` - Handles annotation management
- `HealthCheckView` - API health status

**serializers.py:**
- Data validation and serialization for API requests/responses

---

## API Endpoints

### Base URL
```
http://localhost:8000/api/
```

### Comprehensive Endpoint Reference

#### 1. **Health Check**
```http
GET /api/health/
```
**Response (200 OK):**
```json
{
  "status": "ok",
  "message": "Backend is running"
}
```

#### 2. **Images - List All**
```http
GET /api/images/
```
**Query Parameters:**
- `search=keyword` - Search images by name
- `page=1` - Pagination (20 per page)

**Response (200 OK):**
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "photo1.jpg",
      "image_url": "http://localhost:8000/media/images/2026/04/02/photo1.jpg",
      "size": 102400,
      "uploaded_at": "2026-04-02T10:30:00Z",
      "description": "Sample image",
      "annotation_count": 3
    }
  ]
}
```

#### 3. **Images - Upload New**
```http
POST /api/images/
Content-Type: multipart/form-data
```
**Request Body:**
```
image_file: <binary image file>
name: "my_image.jpg" (optional)
description: "Image description" (optional)
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "my_image.jpg",
  "image_file": "/media/images/2026/04/02/my_image.jpg",
  "image_url": "http://localhost:8000/media/images/2026/04/02/my_image.jpg",
  "size": 102400,
  "uploaded_at": "2026-04-02T10:30:00Z",
  "updated_at": "2026-04-02T10:30:00Z",
  "description": "Image description",
  "annotations": []
}
```

**Supported Formats:** JPG, JPEG, PNG, GIF, BMP, WebP  
**Max Size:** No limit (configure in `settings.py` if needed)

#### 4. **Images - Get Details**
```http
GET /api/images/{id}/
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "photo.jpg",
  "image_file": "/media/images/2026/04/02/photo.jpg",
  "image_url": "http://localhost:8000/media/images/2026/04/02/photo.jpg",
  "size": 102400,
  "uploaded_at": "2026-04-02T10:30:00Z",
  "updated_at": "2026-04-02T10:30:00Z",
  "description": "Sample photo",
  "annotations": [
    {
      "id": 1,
      "label": "Person",
      "x": 100,
      "y": 150,
      "width": 200,
      "height": 300,
      "created_at": "2026-04-02T10:31:00Z",
      "updated_at": "2026-04-02T10:31:00Z"
    }
  ]
}
```

#### 5. **Images - Update**
```http
PUT /api/images/{id}/
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated name",
  "description": "Updated description"
}
```

**Response (200 OK):** Updated image object

#### 6. **Images - Delete**
```http
DELETE /api/images/{id}/
```

**Response (204 No Content)** (Empty response)

#### 7. **Images - Export Single**
```http
GET /api/images/{id}/export/
```

**Response (200 OK):**
```json
{
  "name": "photo.jpg",
  "uploaded_at": "2026-04-02T10:30:00Z",
  "annotations": [
    {
      "id": 1,
      "label": "Person",
      "x": 100,
      "y": 150,
      "width": 200,
      "height": 300,
      "created_at": "2026-04-02T10:31:00Z",
      "updated_at": "2026-04-02T10:31:00Z"
    }
  ]
}
```

#### 8. **Images - Batch Export**
```http
POST /api/images/batch/export/
Content-Type: application/json
```

**Request Body:**
```json
{
  "image_ids": [1, 2, 3]
}
```

**Response (200 OK):**
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

#### 9. **Images - Get Statistics**
```http
GET /api/images/{id}/stats/
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "photo.jpg",
  "total_annotations": 5,
  "file_size": 102400,
  "uploaded_at": "2026-04-02T10:30:00Z",
  "updated_at": "2026-04-02T10:31:00Z"
}
```

#### 10. **Annotations - List for Image**
```http
GET /api/images/{image_id}/annotations/
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "label": "Object 1",
    "x": 10,
    "y": 20,
    "width": 100,
    "height": 150,
    "created_at": "2026-04-02T10:31:00Z",
    "updated_at": "2026-04-02T10:31:00Z"
  }
]
```

#### 11. **Annotations - Create**
```http
POST /api/images/{image_id}/annotations/
Content-Type: application/json
```

**Request Body:**
```json
{
  "label": "Object Name",
  "x": 10,
  "y": 20,
  "width": 100,
  "height": 150
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "label": "Object Name",
  "x": 10,
  "y": 20,
  "width": 100,
  "height": 150,
  "created_at": "2026-04-02T10:31:00Z",
  "updated_at": "2026-04-02T10:31:00Z"
}
```

#### 12. **Annotations - Get Details**
```http
GET /api/images/{image_id}/annotations/{annotation_id}/
```

**Response (200 OK):** Annotation object

#### 13. **Annotations - Update**
```http
PUT /api/images/{image_id}/annotations/{annotation_id}/
Content-Type: application/json
```

**Request Body:**
```json
{
  "label": "Updated Label",
  "x": 20,
  "y": 30,
  "width": 120,
  "height": 160
}
```

**Response (200 OK):** Updated annotation object

#### 14. **Annotations - Delete**
```http
DELETE /api/images/{image_id}/annotations/{annotation_id}/
```

**Response (204 No Content)**

#### 15. **Annotations - Clear All for Image**
```http
POST /api/images/{image_id}/annotations/clear-all/
```

**Response (200 OK):**
```json
{
  "message": "Deleted 5 annotations"
}
```

#### 16. **Annotations - Batch Create**
```http
POST /api/images/{image_id}/annotations/batch-create/
Content-Type: application/json
```

**Request Body:**
```json
{
  "annotations": [
    {
      "label": "Object 1",
      "x": 10,
      "y": 20,
      "width": 100,
      "height": 150
    },
    {
      "label": "Object 2",
      "x": 200,
      "y": 250,
      "width": 80,
      "height": 120
    }
  ]
}
```

**Response (201 Created):**
```json
[
  {
    "id": 1,
    "label": "Object 1",
    "x": 10,
    "y": 20,
    "width": 100,
    "height": 150,
    "created_at": "2026-04-02T10:31:00Z",
    "updated_at": "2026-04-02T10:31:00Z"
  },
  {
    "id": 2,
    "label": "Object 2",
    "x": 200,
    "y": 250,
    "width": 80,
    "height": 120,
    "created_at": "2026-04-02T10:31:00Z",
    "updated_at": "2026-04-02T10:31:00Z"
  }
]
```

---

## Database Schema

### Image Table
```sql
CREATE TABLE annotator_image (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    image_file VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    description TEXT,
    uploaded_at DATETIME AUTO_CURRENT,
    updated_at DATETIME AUTO_UPDATE,
    CONSTRAINT unique_filename UNIQUE(image_file),
    INDEX idx_uploaded_at (uploaded_at),
    INDEX idx_name (name)
);
```

**Fields:**
- `id` - Primary key (auto-incrementing)
- `name` - Image filename (e.g., "photo.jpg")
- `image_file` - File path in media storage
- `size` - File size in bytes
- `description` - Optional image description
- `uploaded_at` - Creation timestamp
- `updated_at` - Last modification timestamp

### Annotation Table
```sql
CREATE TABLE annotator_annotation (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    image_id INTEGER NOT NULL,
    label VARCHAR(255) NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    created_at DATETIME AUTO_CURRENT,
    updated_at DATETIME AUTO_UPDATE,
    FOREIGN KEY (image_id) REFERENCES annotator_image(id) ON DELETE CASCADE,
    INDEX idx_image_created (image_id, created_at)
);
```

**Fields:**
- `id` - Primary key (auto-incrementing)
- `image_id` - Foreign key to Image (cascade delete)
- `label` - Annotation label (e.g., "Person", "Car")
- `x` - Top-left X coordinate
- `y` - Top-left Y coordinate
- `width` - Bounding box width in pixels
- `height` - Bounding box height in pixels
- `created_at` - Creation timestamp
- `updated_at` - Last modification timestamp

### Relationships
- **One-to-Many:** One Image has many Annotations
- **Cascade Delete:** Deleting an Image automatically deletes all its Annotations

---

## Clone the Project

### Method 1: Using Git (Recommended)

```bash
# Clone the repository
git clone https://github.com/Haroon-Xray/Image-Annotator-01-04-2026-.git

# Navigate to project
cd Image-Annotator-01-04-2026-

# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database
python manage.py migrate

# Create admin account
python manage.py createsuperuser

# Run server
python manage.py runserver
```

### Method 2: Manual Download

1. Download ZIP from GitHub
2. Extract the archive
3. Follow steps starting from "Create virtual environment" above

### Initial Setup Verification

```bash
# Test if backend is working
curl http://localhost:8000/api/health/

# Expected output:
# {"status":"ok","message":"Backend is running"}
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. **"No module named 'django'"**
```bash
# Solution: Install dependencies
pip install -r requirements.txt

# Or individual package:
pip install Django==6.0.3
```

#### 2. **"Port 8000 already in use"**
```bash
# Solution: Use different port
python manage.py runserver 8001

# Or kill process using port 8000:
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :8000
kill -9 <PID>
```

#### 3. **"No such table: annotator_image"**
```bash
# Solution: Run migrations
python manage.py migrate

# Or recreate everything:
python manage.py migrate --fake-initial
```

#### 4. **CORS Error: "Access to XMLHttpRequest blocked"**
```
Error: Access to XMLHttpRequest at 'http://localhost:8000/api/...' 
from origin 'http://localhost:3000' has been blocked
```

**Solution:** Update `settings.py` CORS configuration:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
]
```

#### 5. **"ModuleNotFoundError: No module named 'PIL'"**
```bash
# Solution: Install Pillow
pip install Pillow==10.1.0
```

#### 6. **Static Files Not Serving**
```bash
# Solution: Collect static files
python manage.py collectstatic --noinput
```

#### 7. **Permission Denied on Media Folder**
```bash
# Solution: Set correct permissions
# macOS/Linux:
chmod -R 755 media/

# Windows:
# Use File Explorer to set folder permissions
```

#### 8. **"Secret key is invalid"**
```bash
# Solution: Generate new secret key
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

# Update settings.py:
SECRET_KEY = '<generated-key-here>'
```

### Debug Mode

Enable detailed error messages:
```
In settings.py:
DEBUG = True

In urls.py (development only):
if settings.DEBUG:
    urlpatterns += path('__debug__/', include('debug_toolbar.urls'))
```

### Check Dependencies

```bash
# List installed packages
pip list

# Expected output should include:
# Django 6.0.3
# djangorestframework 3.14.0
# django-cors-headers 4.3.1
# Pillow 10.1.0
```

---

## Deployment

### Preparation for Production

#### 1. **Update Settings**
```python
# settings.py for production:
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']
SECRET_KEY = 'use-strong-random-key'
```

#### 2. **Collect Static Files**
```bash
python manage.py collectstatic
```

#### 3. **Switch to PostgreSQL** (Recommended)
See "Database Information" section in [Running the Backend](#running-the-backend)

#### 4. **Use Gunicorn Server**
```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

#### 5. **Setup Nginx Reverse Proxy**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /media/ {
        alias /path/to/backend/media/;
    }

    location /static/ {
        alias /path/to/backend/staticfiles/;
    }
}
```

### Deployment Platforms

**Heroku:**
```bash
heroku create your-app-name
git push heroku main
heroku run python manage.py migrate
```

**PythonAnywhere:**
1. Upload code
2. Configure virtual environment
3. Configure web app settings
4. Run migrations

**AWS/Azure/DigitalOcean:**
1. Create server instance
2. Install Python and dependencies
3. Clone project
4. Configure Gunicorn + Nginx
5. Setup SSL (Let's Encrypt)

---

## Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [django-cors-headers](https://github.com/adamchainz/django-cors-headers)
- [Pillow Documentation](https://pillow.readthedocs.io/)

---

## Support & Contribution

For issues, questions, or contributions:
- GitHub: [Image-Annotator-01-04-2026-](https://github.com/Haroon-Xray/Image-Annotator-01-04-2026-)
- Author: Haroon-Xray

---

**Last Updated:** April 2, 2026  
**Backend Version:** 1.0.0  
**Status:** Production Ready
