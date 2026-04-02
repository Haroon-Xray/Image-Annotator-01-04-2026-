# Frontend Integration Guide

## Connecting Frontend to Backend

This guide explains how to connect the React frontend to the Django backend API.

### Frontend Configuration

#### Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8000/api
VITE_BACKEND_URL=http://localhost:8000
```

Or update `vite.config.js`:

```javascript
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
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

### API Integration Examples

#### Upload Image

```javascript
const uploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image_file', imageFile);
  formData.append('name', imageFile.name);

  const response = await fetch('http://localhost:8000/api/images/', {
    method: 'POST',
    body: formData,
  });
  
  return response.json();
}
```

#### Create Annotation

```javascript
const createAnnotation = async (imageId, annotation) => {
  const response = await fetch(
    `http://localhost:8000/api/images/${imageId}/annotations/`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        label: annotation.label,
        x: annotation.x,
        y: annotation.y,
        width: annotation.w,
        height: annotation.h,
      })
    }
  );
  
  return response.json();
}
```

#### Export Annotations

```javascript
const exportAnnotations = async (imageId) => {
  const response = await fetch(
    `http://localhost:8000/api/images/${imageId}/export/`
  );
  
  return response.json();
}
```

### Running Both Frontend and Backend

**Terminal 1 - Backend:**
```bash
cd backend
python -m venv venv
# Activate venv (Windows): venv\Scripts\activate
# Activate venv (Mac/Linux): source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### CORS Issues Resolution

If you see CORS errors in the browser console:

1. Ensure backend is running
2. Check `backend/settings.py` CORS_ALLOWED_ORIGINS includes your frontend URL
3. Verify frontend is accessing the correct API URL

### API Response Format

All API responses are JSON formatted:

```json
{
  "id": 1,
  "name": "image.jpg",
  "image_url": "http://localhost:8000/media/images/2026/04/02/image.jpg",
  "annotations": [
    {
      "id": 1,
      "label": "Object 1",
      "x": 10,
      "y": 20,
      "width": 100,
      "height": 150
    }
  ]
}
```

### Error Handling

All error responses follow this format:

```json
{
  "error": "Error message here",
  "detail": "More details about the error"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `204` - No Content (Delete)
- `400` - Bad Request
- `404` - Not Found
- `500` - Server Error

### Full Stack Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Frontend (React + Vite)                     │
│         Running on localhost:5173/3000                   │
│                                                           │
│  • Image Upload                                          │
│  • Annotation Management                                │
│  • Local State Management                               │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/REST
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│         Backend (Django + DRF)                           │
│       Running on localhost:8000                          │
│                                                           │
│  • Image Storage & Management                           │
│  • Annotation Database                                  │
│  • Media File Handling                                  │
│  • API Endpoints                                        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│          Database (SQLite)                               │
│       db.sqlite3 file                                    │
│                                                           │
│  • Images Table                                         │
│  • Annotations Table                                    │
└─────────────────────────────────────────────────────────┘
```

For more detailed backend documentation, see `backenddoc.md`.
