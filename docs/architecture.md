# Project Architecture

Comprehensive overview of the Image Annotator system architecture, design patterns, and component interactions.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React + Vite)                │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Navbar     │  │ Image Sidebar │  │ Main Canvas  │      │
│  └──────┬───────┘  └──────┬────────┘  └──────┬───────┘      │
│         │                 │                  │               │
│         └─────────────────┼──────────────────┘               │
│                           │                                 │
│          ┌────────────────┴────────────────┐               │
│          │                                 │               │
│     ┌────▼──────────┐           ┌────────▼──────┐        │
│     │ Annotations   │           │  Inference    │        │
│     │    Panel      │           │    Panel      │        │
│     └───────────────┘           └───────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            │
                    HTTP REST API
                            │
┌─────────────────────────────────────────────────────────────┐
│                Backend (Django REST Framework)              │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │                   URL Router                        │    │
│  │  /api/images/, /api/inference/, etc.              │    │
│  └────────────────┬─────────────────────────────────┘    │
│                   │                                        │
│  ┌────────────────┴─────────────────────────────────┐    │
│  │              ViewSets & Views                     │    │
│  │  - ImageViewSet                                  │    │
│  │  - AnnotationViewSet                            │    │
│  │  - InferenceViewSet                             │    │
│  └────────────────┬─────────────────────────────────┘    │
│                   │                                        │
│  ┌────────────────┴─────────────────────────────────┐    │
│  │           Services & Business Logic              │    │
│  │  - InferenceService (YOLOv8)                    │    │
│  │  - ImageProcessingService                      │    │
│  └────────────────┬─────────────────────────────────┘    │
│                   │                                        │
│  ┌────────────────┴─────────────────────────────────┐    │
│  │               Django ORM Models                   │    │
│  │  - Image Model                                   │    │
│  │  - Annotation Model                             │    │
│  └────────────────┬─────────────────────────────────┘    │
│                   │                                        │
└───────────────────┼────────────────────────────────────────┘
                    │
            Database Abstraction
                    │
        ┌───────────┴───────────┐
        │                       │
    ┌───▼────┐         ┌───────▼──┐
    │PostgreSQL│        │ SQLite   │
    │(Production)      │(Dev)     │
    └─────────┘        └──────────┘
```

## 📁 Directory Structure

### Root Level
```
image-annotator/
├── README.md                     # Installation guide & overview
├── .env                          # Environment configuration (gitignored)
├── .gitignore                    # Git ignore rules
│
├── backend/                      # Django application
│   ├── manage.py               # Django management script
│   ├── requirements.txt         # Python dependencies
│   ├── db.sqlite3              # SQLite database (dev only)
│   │
│   ├── settings.py             # Django settings module
│   ├── urls.py                 # Root URL configuration
│   ├── wsgi.py                 # WSGI application
│   │
│   ├── annotator/              # Main Django app
│   │   ├── models.py           # Image & Annotation models
│   │   ├── views.py            # ViewSets & API endpoints
│   │   ├── serializers.py      # DRF serializers
│   │   ├── urls.py             # App URL routes
│   │   ├── tests.py            # Unit tests
│   │   │
│   │   ├── services/           # Business logic layer
│   │   │   ├── __init__.py
│   │   │   └── inference.py    # YOLOv8 inference service
│   │   │
│   │   └── migrations/         # Database migrations
│   │       ├── __init__.py
│   │       ├── 0001_initial.py
│   │       └── ...
│   │
│   ├── media/                  # User uploads
│   │   └── images/
│   │       └── YYYY/MM/DD/     # Organized by date
│   │
│   ├── frontend/               # React build output
│   │   ├── index.html         # Main HTML
│   │   ├── index.css          # Compiled CSS
│   │   └── static/            # Built assets
│   │       ├── *.js           # Bundled JavaScript
│   │       └── *.css          # Bundled CSS
│   │
│   └── staticfiles/            # Collected static files (for production)
│
├── frontend/                    # React application (source)
│   ├── public/                 # Public assets
│   ├── src/
│   │   ├── main.jsx           # Entry point
│   │   ├── App.jsx            # Main component
│   │   ├── index.css          # Global styles
│   │   ├── api.js             # Axios configuration
│   │   │
│   │   ├── components/        # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── ImageSidebar.jsx
│   │   │   ├── CanvasViewer.jsx
│   │   │   ├── AnnotationCanvas.jsx
│   │   │   ├── AnnotationsPanel.jsx
│   │   │   └── InferencePanel.jsx
│   │   │
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useAnnotations.js
│   │   │   ├── useCanvas.js
│   │   │   └── ...
│   │   │
│   │   └── styles/            # CSS modules
│   │       └── *.module.css
│   │
│   ├── package.json           # Node.js dependencies
│   ├── vite.config.js         # Vite build configuration
│   └── index.html             # HTML template
│
└── docs/                       # Documentation
    ├── README.md              # Documentation index
    ├── day1.md               # Day 1: Project setup
    ├── day2.md               # Day 2: Core features
    ├── day3.md               # Day 3: UI implementation
    ├── day4.md               # Day 4: Security
    ├── day5.md               # Day 5: Inference
    ├── api_reference.md      # API endpoint documentation
    ├── architecture.md       # This file
    ├── QUICK_REFERENCE.md    # Commands & tips
    ├── SECURITY_CONFIGURATION.md
    ├── INFERENCE_DEPLOYMENT_GUIDE.md
    └── YOLO_TESTING_GUIDE.md
```

## 🔄 Data Flow

### Image Upload Flow
```
User selects image
         │
         ▼
Frontend FormData preparation
         │
         ▼
POST /api/images/
         │
         ▼
ImageViewSet.create()
         │
         ├─ Validation (serializer)
         │
         ├─ File save to media/images/YYYY/MM/DD/
         │
         ├─ Create Image model instance
         │
         └─ Return response with image_id
         │
         ▼
Frontend receives image_id
```

### Annotation Creation Flow
```
User draws box on canvas
         │
         ▼
AnnotationCanvas normalizes coordinates
         │
         ▼
useAnnotations.addAnnotation()
         │
         ├─ Local state update (instant UI feedback)
         │
         ├─ POST /api/images/{id}/annotations/
         │
         ▼
AnnotationViewSet.create()
         │
         ├─ Validation (coordinate ranges 0-1)
         │
         ├─ Create Annotation model instance
         │
         └─ Return annotation_id
         │
         ▼
Frontend UI updates with confirmation
```

### Inference Flow
```
User uploads image in InferencePanel
         │
         ▼
POST /api/inference/ with image file
         │
         ▼
InferenceViewSet.create()
         │
         ├─ Save temporary image file
         │
         ├─ Instantiate InferenceService
         │
         ├─ InferenceService.run_inference()
         │
         │   ├─ Load YOLOv8 model (cached)
         │   │
         │   ├─ Run inference on image
         │   │
         │   ├─ Format results to API format
         │   │
         │   └─ Return detections
         │
         ├─ Return JSON response
         │
         └─ Clean up temporary files
         │
         ▼
Frontend CanvasViewer renders image with boxes
```

## 🗂️ Database Schema

### Image Model
```
Image
├── id (PK)
├── file (ImageField)
├── title (CharField)
├── description (TextField)
├── class_ids (JSONField)
├── uploaded_at (DateTimeField)
├── updated_at (DateTimeField)
└── metadata (JSONField)
    └── Annotations (ForeignKey)
```

### Annotation Model
```
Annotation
├── id (PK)
├── image_id (FK → Image)
├── label (CharField)
├── class_id (IntegerField)
├── x_center (FloatField) [0-1]
├── y_center (FloatField) [0-1]
├── width (FloatField) [0-1]
├── height (FloatField) [0-1]
├── created_at (DateTimeField)
└── updated_at (DateTimeField)
```

## 🔌 Component Interaction

### Frontend Component Tree
```
App
├── Navbar
│   └── Navigation buttons
│       └── API calls to upload/generate
│
├── ImageSidebar
│   ├── Image list
│   └── Thumbnail navigation
│
├── CanvasViewer
│   ├── Image display
│   ├── Canvas rendering
│   │
│   └── AnnotationCanvas (child)
│       ├── Draw interaction handlers
│       ├── Box management
│       └── Auto-save to backend
│
├── AnnotationsPanel
│   ├── Annotation list
│   └── Box management UI
│
└── InferencePanel
    ├── Image upload
    ├── Parameter controls
    ├── API call handler
    └── Results display
```

### State Management

#### Global (App level)
- `selectedImageId` - Currently displayed image
- `images[]` - List of uploaded images

#### Local (Component level)
- **useAnnotations hook**: `annotations[]`, editing state
- **useCanvas hook**: `scale`, `offset`, canvas state
- **InferencePanel**: `selectedFile`, `confidence`, `iou`, `results`

## 🔐 Security Architecture

### API Layer
- CORS whitelist enforcement
- CSRF token validation
- Session-based authentication

### Data Layer
- Environment-based secrets (SECRET_KEY, DB credentials)
- No hardcoded credentials
- Input validation on all endpoints

### Frontend
- XSS protection via React's automatic escaping
- CSRF tokens in forms

### Backend
- SECURE_CONTENT_TYPE_NOSNIFF header
- SECURE_BROWSER_XSS_FILTER enabled
- X_FRAME_OPTIONS = 'DENY'
- HTTPS in production (SECURE_SSL_REDIRECT)
- Cookie security (HTTPONLY, SECURE, SAMESITE)

## 🚀 Performance Optimizations

### Frontend
- Vite for fast HMR during development
- Lazy loading of heavy components
- Memoized callbacks with `useCallback`
- Optimized re-renders

### Backend
- Model caching in InferenceService
- Pagination on list endpoints (default 20 items)
- Database indexing on frequently queried fields
- Efficient image storage organization

### Infrastructure
- Static files served by CDN/nginx in production
- Database query optimization
- Connection pooling

## 🧪 Testing Architecture

### Test Structure
```
annotator/tests.py
├── ImageModelTestCase
├── AnnotationModelTestCase
├── ImageAPITestCase
├── AnnotationAPITestCase
├── InferenceServiceTestCase
└── InferenceAPITestCase
```

### Coverage
- Model creation and validation: ~90%
- API endpoints: ~95%
- Inference service: ~95%

## 📊 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 18.2.0 |
| **Frontend Build** | Vite | 5.2.0 |
| **Backend Framework** | Django | 6.0.3 |
| **Backend API** | Django REST Framework | 3.14.0 |
| **Database** | PostgreSQL / SQLite | Latest |
| **AI/ML** | YOLOv8 | ultralytics 8.1.0 |
| **Image Processing** | OpenCV | 4.8.1.78 |

## 🔄 Development Workflow

### Backend Development
1. Create/modify models in `models.py`
2. Create migrations: `python manage.py makemigrations`
3. Apply migrations: `python manage.py migrate`
4. Create ViewSets in `views.py`
5. Create serializers in `serializers.py`
6. Add URL routes in `urls.py`
7. Write tests in `tests.py`
8. Run tests: `python manage.py test`

### Frontend Development
1. Create React component in `src/components/`
2. Create CSS module: `*.module.css`
3. Use hooks from `src/hooks/` for logic
4. Call API via `src/api.js` (Axios client)
5. Run dev server: `npm run dev`
6. Build for production: `npm run build`

### Full Stack Integration
1. Backend running: `python manage.py runserver`
2. Frontend dev server: `npm run dev`
3. Frontend builds to: `backend/frontend/`
4. Django serves from: `/frontend/`

## 📈 Scalability Considerations

### For Production
- Use PostgreSQL (not SQLite)
- Enable caching (Redis)
- Use Gunicorn/uWSGI for WSGI
- Nginx for static file serving & reverse proxy
- Load balancing for multiple instances
- CDN for media files
- GPU acceleration for inference (optional)

### Database Optimization
- Add indexes on frequently queried fields
- Archive old image records
- Optimize image file storage

### API Optimization
- Rate limiting
- API versioning
- Pagination optimization
- Response caching

## 🎯 Future Enhancements

- [ ] User authentication & authorization
- [ ] Collaborative annotation
- [ ] Model fine-tuning
- [ ] Custom YOLO model support
- [ ] Batch inference
- [ ] Dataset versioning
- [ ] Export to different formats (COCO, Pascal VOC)
- [ ] Real-time collaboration with WebSockets
