# Image Annotator

A web-based image annotation tool with AI-powered object detection using YOLOv8.

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)

```bash
# Clone the project
git clone <repository>
cd image-annotator

# Copy environment template
cp .env.example .env

# Build and start with Docker
docker-compose up --build

# Access the app
# Frontend: http://localhost:5173
# Backend:  http://localhost:8000
```

For detailed Docker setup, see [docs/DOCKER_SETUP.md](docs/DOCKER_SETUP.md)

### Option 2: Manual Setup

**Prerequisites:**
- Python 3.8+
- Node.js 16+
- PostgreSQL (optional, SQLite works for development)

#### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver
```

Server runs on: `http://localhost:8000`

#### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

### Environment Configuration

1. Create `.env` file in backend directory:
```env
DEBUG=false
SECRET_KEY=<your-secret-key>
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=image_annotator
DB_USER=postgres
DB_PASSWORD=<password>
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

2. Generate a secure SECRET_KEY:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

## 📚 Full Documentation

For complete documentation, architecture details, and feature guides, please visit the [**docs** folder](docs/README.md).

### Quick Links
- [Day 1: Project Setup](docs/day1.md) - Architecture and initial setup
- [Day 2: Core Features](docs/day2.md) - API endpoints and models
- [Day 3: UI Implementation](docs/day3.md) - React components and canvas
- [Day 4: Security](docs/day4.md) - Security hardening and configuration
- [Day 5: Inference](docs/day5.md) - YOLOv8 integration and deployment

## ✨ Features

- 📸 Image upload and management
- 🎯 Interactive annotation canvas
- 🤖 AI-powered object detection (YOLOv8)
- 📥 YOLO dataset export
- 🔒 Production-ready security
- 🧪 Comprehensive test coverage

## 🔗 Useful Resources

### Getting Started
- [Installation Guide](README.md) - Setup instructions
- [Docker Setup](docs/DOCKER_SETUP.md) - Run with Docker (recommended)
- [Docker Quick Reference](docs/DOCKER_QUICK_REFERENCE.md) - Docker commands

### Documentation
- [Quick Reference](docs/QUICK_REFERENCE.md) - Commands and API endpoints
- [Security Configuration](docs/SECURITY_CONFIGURATION.md) - Deployment security
- [Inference Guide](docs/INFERENCE_DEPLOYMENT_GUIDE.md) - YOLOv8 setup
- [Testing Guide](docs/YOLO_TESTING_GUIDE.md) - Test procedures
- [Complete Documentation](docs/README.md) - All documentation

## 📝 License

Created as an educational project for image annotation and object detection.

---

**Need detailed information?** → Check the [docs folder](docs/README.md)
