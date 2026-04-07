# Day 1: Project Setup & Architecture

## Overview
Day 1 focused on establishing the project foundation, setting up the development environment, and implementing the core architecture.

## ✅ Completed Tasks

### Project Initialization

#### Technology Stack Selected
- **Backend:** Django 6.0.3 + Django REST Framework
- **Frontend:** React 18.2.0 + Vite 5.2.0
- **Database:** PostgreSQL (primary) / SQLite (development)
- **AI/ML:** YOLOv8 (object detection)

#### Directory Structure Created
```
image-annotator/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── frontend/          # React build output
│   ├── annotator/         # Django app
│   ├── media/             # User uploads
│   └── staticfiles/       # Collected static assets
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── App.jsx
│       └── api.js
│
└── docs/                  # Documentation
```

### Backend Setup

#### Django Project Initialization
- Created main Django project: `backend`
- Created Django app: `annotator`
- Configured settings for development and production

#### Database Configuration
- Set up PostgreSQL connection support
- SQLite fallback for development
- Configured Django ORM for database abstraction

#### Requirements Installation
**Backend Dependencies:**
```
Django==6.0.3
djangorestframework==3.14.0
django-cors-headers==4.3.1
psycopg2-binary==2.9.9
Pillow==10.1.0
python-decouple==3.8
ultralytics==8.1.0 (added Day 5)
opencv-python==4.8.1.78 (added Day 5)
```

### Frontend Setup

#### React + Vite Configuration
- Initialized React project with Vite
- Configured for fast Hot Module Replacement (HMR)
- Set up asset bundling and optimization

**Frontend Dependencies:**
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "lucide-react": "^0.383.0",
  "axios": "^1.6.0"
}
```

#### Build Output Configuration
- Vite configured to build into `backend/frontend`
- Static assets go to `backend/frontend/static`
- Enables seamless Django + React integration

### API Foundation

#### REST Framework Configuration
- Set up Django REST Framework (DRF)
- Configured default pagination (20 items per page)
- Set up filtering and searching
- Configured CORS for frontend communication

### Environment File Setup

Created initial `.env` file with:
```
DEBUG=false
SECRET_KEY=<secure-key>
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=image_annotator
DB_USER=postgres
DB_PASSWORD=<password>
DB_HOST=localhost
DB_PORT=5432
```

## 🔧 Technical Decisions

### Why Django + React?
- **Django:** Mature framework with strong ORM and REST support
- **React:** Modern component-based UI framework
- **Separation of Concerns:** Clear backend/frontend boundary

### Why Vite over Create React App?
- **Speed:** Lightning-fast build times
- **Modern:** ES modules, better development experience
- **Production:** Optimized bundle sizes

### Why PostgreSQL?
- **Relational:** Strong for structured image/annotation data
- **Scalable:** Good for growing datasets
- **Development:** SQLite fallback available

## 📋 Setup Checklist

- [x] Django project created
- [x] React + Vite configured
- [x] Database setup (PostgreSQL)
- [x] REST Framework configured
- [x] CORS enabled for frontend
- [x] Environment variables template created
- [x] Dependencies installed
- [x] Virtual environment configured

## 🚀 Next Steps

→ **Day 2**: Core API endpoints and image management
