# Image Annotator - Full Stack Application

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.8+-blue)
![Django](https://img.shields.io/badge/django-6.0.3-darkgreen)
![React](https://img.shields.io/badge/react-18.2.0-blue)

A professional image annotation tool built with React and Django. Create precise bounding box annotations on images and export your annotations as JSON.

## 🎯 Features

### Frontend (React + Vite)
- ✅ Drag-and-drop image upload
- ✅ Create bounding box annotations with mouse
- ✅ Interactive label management
- ✅ Real-time preview
- ✅ Export annotations as JSON
- ✅ Local storage for projects
- ✅ Beautiful dark UI

### Backend (Django + REST API)
- ✅ RESTful API for image and annotation management
- ✅ Image upload and storage
- ✅ CORS enabled for frontend communication
- ✅ Admin panel for content management
- ✅ Database persistence (SQLite/PostgreSQL)
- ✅ Batch operations support
- ✅ Health check endpoints

## 📊 Tech Stack

### Frontend
- **React** 18.2.0 - UI library
- **Vite** 4.3.9 - Build tool
- **JavaScript/JSX** - Programming language

### Backend
- **Django** 6.0.3 - Web framework
- **Django REST Framework** 3.14.0 - API framework
- **Pillow** 10.1.0 - Image processing
- **SQLite/PostgreSQL** - Database
- **Python** 3.8+ - Programming language

## 🚀 Quick Start

### Option 1: Quick Setup (Recommended)

#### Windows:
```bash
# Clone and navigate
git clone https://github.com/Haroon-Xray/Image-Annotator-01-04-2026-.git
cd Image-Annotator-01-04-2026-

# Setup Backend
cd backend
quick-start.bat

# In another terminal, setup Frontend
cd frontend
npm install
npm run dev
```

#### macOS/Linux:
```bash
# Clone and navigate
git clone https://github.com/Haroon-Xray/Image-Annotator-01-04-2026-.git
cd Image-Annotator-01-04-2026-

# Setup Backend
cd backend
chmod +x quick-start.sh
./quick-start.sh

# In another terminal, setup Frontend
cd frontend
npm install
npm run dev
```

### Option 2: Docker (Easiest)

```bash
# Clone repository
git clone https://github.com/Haroon-Xray/Image-Annotator-01-04-2026-.git
cd Image-Annotator-01-04-2026-

# Run with Docker Compose
docker-compose up -d

# Access
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
# Admin: http://localhost:8000/admin
```

### Option 3: Manual Setup

See detailed instructions in:
- Backend: [Backend Documentation](./backenddoc.md)
- Frontend Integration: [Frontend Integration Guide](./FRONTEND_INTEGRATION.md)

## 📖 Getting Started

### 1. Backend Setup (5 minutes)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Run server
python manage.py runserver
```

**Backend is now running at:** `http://localhost:8000`

### 2. Frontend Setup (5 minutes)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend is now running at:** `http://localhost:5173`

### 3. Access Application

- **Frontend App:** http://localhost:5173
- **Backend API:** http://localhost:8000/api
- **Admin Panel:** http://localhost:8000/admin (use credentials from step 1)
- **Health Check:** http://localhost:8000/api/health

## 📝 Documentation

### Complete Guides
- **[Backend Documentation](./backenddoc.md)** - Complete backend setup, API reference, database schema, troubleshooting
- **[Frontend Integration](./FRONTEND_INTEGRATION.md)** - How to connect frontend to backend API
- **[Environment Setup](./backend/.env.example)** - Environment variables configuration

### API Documentation
See [API Endpoints](./backenddoc.md#api-endpoints) section in backend documentation for:
- Image upload and management
- Annotation creation and management
- Export functionality
- Batch operations
- Health checks

## 🗺️ Project Structure

```
Image-Annotator-01-04-2026/
├── backend/                         # Django Backend
│   ├── annotator/                  # Main Django app
│   │   ├── models.py              # Database models
│   │   ├── views.py               # API endpoints
│   │   ├── serializers.py         # Data serialization
│   │   ├── urls.py                # App routing
│   │   └── tests.py               # Unit tests
│   ├── backend/                    # Project settings
│   ├── manage.py                   # Django CLI
│   ├── requirements.txt            # Dependencies
│   ├── db.sqlite3                  # Database (auto-created)
│   ├── quick-start.bat            # Windows setup script
│   └── quick-start.sh             # Linux/Mac setup script
│
├── frontend/                        # React Frontend
│   ├── src/
│   │   ├── App.jsx                # Main React component
│   │   ├── main.jsx               # Entry point
│   │   └── index.css              # Styles
│   ├── public/                     # Static assets
│   ├── index.html                 # HTML template
│   ├── package.json               # Dependencies
│   ├── vite.config.js             # Vite configuration
│   └── Dockerfile                 # Docker configuration
│
├── backenddoc.md                    # Backend documentation (comprehensive)
├── FRONTEND_INTEGRATION.md          # Frontend integration guide
├── docker-compose.yml              # Docker Compose configuration
├── Dockerfile                       # Backend Docker image
└── README.md                        # This file
```

## 🔧 System Requirements

### Minimum
- Python 3.8+
- Node.js 16+
- 512 MB RAM
- 500 MB disk space

### Recommended
- Python 3.10 LTS
- Node.js 18 LTS
- 1 GB RAM
- 1 GB disk space

## 🗄️ Database

### Default (SQLite)
- No setup required
- Automatically created in `backend/db.sqlite3`
- Perfect for development

### PostgreSQL (Recommended for Production)
```bash
# Install PostgreSQL client
pip install psycopg2-binary

# Configure in settings.py
# See backenddoc.md for details
```

## 🌐 API Overview

### Common Endpoints
```
GET    /api/images/              # List all images
POST   /api/images/              # Upload new image
GET    /api/images/{id}/         # Get image details
DELETE /api/images/{id}/         # Delete image

GET    /api/images/{id}/annotations/              # List annotations
POST   /api/images/{id}/annotations/              # Create annotation
DELETE /api/images/{id}/annotations/{ann_id}/    # Delete annotation

POST   /api/images/{id}/export/          # Export image as JSON
POST   /api/images/batch/export/         # Export multiple images
GET    /api/health/                      # Health check
```

For complete API documentation, see [backenddoc.md](./backenddoc.md#api-endpoints)

## 🐳 Docker Support

### Run with Docker Compose
```bash
docker-compose up -d
```

### Individual Docker Commands
```bash
# Build and run backend
docker build -f Dockerfile -t image-annotator-backend .
docker run -p 8000:8000 image-annotator-backend

# Build and run frontend
docker build -f frontend/Dockerfile -t image-annotator-frontend .
docker run -p 5173:5173 image-annotator-frontend
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### API Testing with cURL
```bash
# Health check
curl http://localhost:8000/api/health/

# List images
curl http://localhost:8000/api/images/

# Get Django admin
curl http://localhost:8000/admin/
```

## 🔐 Security Notes

### For Development:
```python
DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']
```

### For Production:
```python
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com']
SECRET_KEY = 'strong-random-key'
SECURE_SSL_REDIRECT = True
```

See [backenddoc.md - Deployment](./backenddoc.md#deployment) for production setup.

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8000
kill -9 <PID>
```

**CORS Errors:**
Update `backend/settings.py` CORS_ALLOWED_ORIGINS to include your frontend URL.

**Database issues:**
```bash
python manage.py migrate
python manage.py migrate --fake-initial
```

**Module not found:**
```bash
pip install -r requirements.txt
```

See [backenddoc.md - Troubleshooting](./backenddoc.md#troubleshooting) for more solutions.

## 📚 Learning Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 👤 Author

**Haroon-Xray**
- GitHub: [@Haroon-Xray](https://github.com/Haroon-Xray)
- Repository: [Image-Annotator-01-04-2026-](https://github.com/Haroon-Xray/Image-Annotator-01-04-2026-)

## 📞 Support

For issues and questions:
- Check [backenddoc.md](./backenddoc.md#troubleshooting)
- Report issues on GitHub
- See [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) for integration help

## 🎉 What's Included

✅ Complete working backend  
✅ RESTful API with DRF  
✅ SQLite & PostgreSQL support  
✅ Admin panel  
✅ CORS configuration  
✅ Image processing  
✅ Annotation management  
✅ Export functionality  
✅ Docker support  
✅ Comprehensive documentation  

---

**Last Updated:** April 2, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
