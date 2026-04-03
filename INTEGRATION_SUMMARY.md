# React + Django Integration Setup - Summary

## ✅ What Was Configured

### 1. Frontend (React + Vite)
- [x] Complete React application with Image Annotator interface
- [x] Components: Navbar, ImageSidebar, Toolbar, AnnotationCanvas, AnnotationsPanel
- [x] Custom hook: `useAnnotations` for state management
- [x] Vite configured to build into `backend/frontend/`
- [x] Axios API client with CSRF protection (`src/api.js`)
- [x] Development server with proxy to Django backend

**Build Output Location**: `backend/frontend/`

### 2. Django Backend Configuration
- [x] Updated `settings.py` static files configuration
  - `STATIC_URL = '/static/'`
  - `STATICFILES_DIRS` points to built React assets
  - Templates folder points to built frontend
- [x] Updated `urls.py` routing
  - `/api/` → Django REST API
  - `/` and all other routes → React's index.html (SPA support)
- [x] `ReactAppView` in `views.py` serves index.html for all non-API routes

### 3. API Integration
- [x] Axios instance with automatic CSRF token reading
- [x] Base URL: `/api` in production, `http://localhost:8000/api` in dev
- [x] Error interceptors and auth handling
- [x] No CORS issues - API and frontend served from same origin

## 🚀 Quick Build & Run

### Development Mode
```bash
# Terminal 1: Frontend dev server (hot reload)
cd frontend
npm install
npm run dev

# Terminal 2: Django backend API
cd backend
python manage.py runserver
```

Visit: `http://localhost:5173` (frontend auto-proxies to backend API)

### Production Mode (Single Django Server)
```bash
# Build frontend
cd frontend
npm run build

# Collect static files
cd backend
python manage.py collectstatic --noinput

# Run Django
python manage.py runserver
# or with Gunicorn: gunicorn backend.wsgi:application
```

Visit: `http://localhost:8000` (everything served by Django)

## 📂 Key Files

| File | Purpose |
|------|---------|
| `frontend/vite.config.js` | Vite → outputs to `../backend/frontend` |
| `frontend/src/api.js` | Axios client for API calls |
| `frontend/src/App.jsx` | Main React component |
| `backend/settings.py` | Static files & templates config |
| `backend/urls.py` | Routes API to `/api/`, React to everything else |
| `backend/annotator/views.py` | `ReactAppView` serves index.html |

## 🔍 How It Works

1. **Development**:
   - Vite runs on `localhost:5173` with hot reload
   - Django API runs on `localhost:8000/api`
   - Vite's dev server proxies `/api/*` to Django

2. **Production**:
   - `npm run build` creates `backend/frontend/index.html` + assets
   - `python manage.py collectstatic` copies `backend/frontend/static/` to `staticfiles/`
   - Django serves:
     - `/static/*` → built JS/CSS from Vite
     - `/api/*` → Django REST API
     - `/*` → `index.html` (React Router handles client-side routing)

## ✨ Features

- ✅ Single Django server for production (no separate frontend server)
- ✅ No CORS issues (frontend + API same origin)
- ✅ Automatic CSRF protection for API calls
- ✅ React Router SPA support
- ✅ Environment-aware API URLs
- ✅ Production-ready setup

## 📋 Next Steps

1. Install dependencies:
   ```bash
   cd frontend && npm install
   cd ../backend && pip install -r requirements.txt
   ```

2. Choose your mode:
   - **Dev**: Run `npm run dev` + `python manage.py runserver`
   - **Prod**: Run `npm run build`, then `python manage.py collectstatic`, then `python manage.py runserver`

3. Test the app:
   - Upload images
   - Draw bounding boxes
   - Edit annotations
   - Export JSON

## 📖 Full Documentation

See `BUILD_AND_RUN_GUIDE.md` for:
- Detailed setup instructions
- Environment variables
- API endpoint reference
- Troubleshooting
- Deployment guide

---

**Status**: ✅ Complete and ready to use  
**Last Updated**: April 3, 2026
