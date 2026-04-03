# Image Annotator - Production Setup Guide

A full-stack application for annotating images with bounding boxes. Frontend (React + Vite) served directly from Django backend.

## 🎯 Overview

This project combines:
- **Frontend**: React 18 + Vite (built into Django's static files)
- **Backend**: Django 6.0 + Django REST Framework
- **API Communication**: Axios with CSRF protection
- **Database**: SQLite (development) / PostgreSQL (production ready)

## 📁 Project Structure

```
image-annotator/
├── frontend/                    # React Vite app
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── api.js              # Axios API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js          # Configured to build into backend/frontend
│   └── index.html
│
├── backend/                     # Django project
│   ├── backend/
│   │   ├── settings.py        # Configure static files here
│   │   ├── urls.py            # Routes
│   │   └── wsgi.py
│   ├── annotator/              # Django app
│   │   ├── views.py
│   │   ├── models.py
│   │   ├── urls.py
│   │   └── serializers.py
│   ├── frontend/               # Vite build output (git-ignored)
│   │   ├── index.html
│   │   ├── static/             # JS/CSS from Vite
│   │   └── assets/
│   ├── manage.py
│   └── requirements.txt
```

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 16+ (for Vite frontend)
- Python 3.10+ (for Django backend)
- Git

### 2. Installation

#### Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
```

#### Frontend Setup

```bash
cd frontend
npm install
```

### 3. Development Mode

**Terminal 1 - Frontend (auto-rebuild, dev server)**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

**Terminal 2 - Backend API**
```bash
cd backend
python manage.py runserver
# Runs on http://localhost:8000
```

The frontend dev server proxies API calls to `http://localhost:8000/api` (configured in `vite.config.js`).

### 4. Production Build & Deployment

#### Step 1: Build React Frontend
```bash
cd frontend
npm install
npm run build
# Output: backend/frontend/ folder with index.html and static/
```

#### Step 2: Collect Static Files
```bash
cd backend
python manage.py collectstatic --noinput
# Collects: backend/frontend/static/* → backend/staticfiles/
```

#### Step 3: Run Django Server
```bash
cd backend
python manage.py runserver
# Access at http://localhost:8000
```

Everything is served from Django - no need for separate frontend dev server!

## 🔌 API Integration

### Axios Setup

Located in `frontend/src/api.js`:

```javascript
import api from './api'

// Usage in components:
try {
  const response = await api.get('/images/')
  console.log(response.data)
} catch (error) {
  console.error('API error:', error)
}
```

### API Features

- ✅ **Automatic CSRF Protection**: Reads from Django templates or cookies
- ✅ **Base URL Switching**: Production uses `/api`, development uses `http://localhost:8000/api`
- ✅ **Auth Interceptor**: Redirects to login on 401
- ✅ **Error Handling**: Centralized error response handling

### Available Endpoints

```
POST   /api/images/               - Upload image
GET    /api/images/               - List images
GET    /api/images/{id}/          - Get single image
PUT    /api/images/{id}/          - Update image
DELETE /api/images/{id}/          - Delete image
POST   /api/images/{id}/export/   - Export annotations as JSON
POST   /api/images/batch/export/  - Batch export
```

Full API documentation: See `backenddoc.md`

## ⚙️ Django Configuration

### Static Files Settings (`backend/settings.py`)

```python
# Served from /static/ URLs
STATIC_URL = '/static/'

# Built frontend + assets location
STATICFILES_DIRS = [
    BASE_DIR / 'frontend' / 'static',  # Vite output
]

# Collection destination (production)
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Templates point to built React index.html
TEMPLATES = [{
    'DIRS': [BASE_DIR / 'frontend'],  # Points to index.html
}]
```

### URL Routing (`backend/urls.py`)

- `/api/` → Django REST API endpoints
- `/admin/` → Django admin panel
- `/` + all other routes → React's `index.html` (SPA routing)

This allows React Router to handle client-side navigation.

## 🛠️ Build Configuration

### Vite Config (`frontend/vite.config.js`)

```javascript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../backend/frontend',  // Builds into Django folder
    assetsDir: 'static',            // JS/CSS go to static/
    emptyOutDir: true,               // Clean before build
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
```

## 📦 Environment Variables

Create `backend/.env`:

```env
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
CORS_ALLOWED_ORIGINS=http://localhost:8000,http://yourdomain.com
```

## 🔐 CORS & Security

### Development
- CORS enabled for `localhost:5173` (Vite dev server)
- CSRF protection disabled in dev (auto-bypass)

### Production
- CORS limited to your domain only
- CSRF tokens required for POST/PUT/DELETE
- Set `DEBUG=False` in settings.py

## 📝 API Usage Examples

### Upload Image
```javascript
const formData = new FormData()
formData.append('image_file', fileInput.files[0])
formData.append('name', 'My Image')

const response = await api.post('/images/', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
```

### Get Annotations
```javascript
const { data } = await api.get(`/images/${id}/`)
console.log(data.annotations)  // Array of annotation objects
```

### Export Annotations
```javascript
const { data } = await api.get(`/images/${id}/export/`)
const json = JSON.stringify(data, null, 2)
// Download as file...
```

## 🐛 Troubleshooting

### Issue: "Cannot GET /" - React not loading

**Solution**: Make sure you've built the frontend:
```bash
cd frontend
npm run build
cd ../backend
python manage.py collectstatic
```

### Issue: API calls return 404

**Solution**: Check that your Django server is running and API routes are in `backend/urls.py`:
```bash
# Visit http://localhost:8000/api/ to verify API is available
```

### Issue: Static files (CSS/JS) not loading in production

**Solution**: Run `collectstatic` again:
```bash
python manage.py collectstatic --noinput --clear
```

### Issue: CSRF token errors on POST requests

**Solution**: Ensure Axios is picking up CSRF token from Django. Check:
1. `index.html` includes Django's CSRF middleware
2. Browser cookies include `csrftoken`
3. `api.js` interceptor reads the token correctly

## 🚢 Deployment (Production)

### Using Gunicorn + Nginx

1. **Install Gunicorn**
   ```bash
   pip install gunicorn
   ```

2. **Run Gunicorn**
   ```bash
   gunicorn backend.wsgi:application --bind 0.0.0.0:8000
   ```

3. **Nginx config** (reverse proxy for Gunicorn)
   ```nginx
   location / {
       proxy_pass http://127.0.0.1:8000;
   }
   location /static/ {
       alias /path/to/backend/staticfiles/;
   }
   ```

### Environment Setup
```bash
export DEBUG=False
export SECRET_KEY='your-long-random-secret-key'
export ALLOWED_HOSTS='yourdomain.com,www.yourdomain.com'
```

## 📚 File Reference

| File | Purpose |
|------|---------|
| `frontend/vite.config.js` | Vite build configuration (output path) |
| `frontend/package.json` | Frontend dependencies & scripts |
| `frontend/src/api.js` | Axios API client instance |
| `backend/settings.py` | Static files, templates, database config |
| `backend/urls.py` | URL routing & React fallback |
| `backend/requirements.txt` | Python dependencies |

## 🎯 Common Tasks

### Update Frontend
```bash
cd frontend
npm install  # if you added dependencies
npm run build
cd ../backend
python manage.py collectstatic
```

### Add Django Dependency
```bash
cd backend
pip install new-package
pip freeze > requirements.txt
```

### Add Frontend Dependency
```bash
cd frontend
npm install new-package
npm run build
cd ../backend
python manage.py collectstatic
```

## 📖 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Django Documentation](https://docs.djangoproject.com)
- [Django REST Framework](https://www.django-rest-framework.org)
- [Axios Documentation](https://axios-http.com)

## ✅ Checklist Before Production

- [ ] Set `DEBUG=False` in Django settings
- [ ] Generate new `SECRET_KEY` 
- [ ] Configure `ALLOWED_HOSTS` with your domain
- [ ] Set up proper CORS origins
- [ ] Use environment variables for secrets
- [ ] Test frontend build with `npm run build`
- [ ] Test Django with `python manage.py check`
- [ ] Run `collectstatic` 
- [ ] Set up HTTPS/SSL certificate
- [ ] Test file uploads work correctly
- [ ] Verify API endpoints are accessible

---

**Version**: 1.0  
**Last Updated**: April 3, 2026
