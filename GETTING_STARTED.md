# Getting Started - Image Annotator

A step-by-step guide to get the Image Annotator application running on your machine.

## Prerequisites

Before starting, ensure you have:
- **Git** - Download from [git-scm.com](https://git-scm.com/)
- **Python 3.8+** - Download from [python.org](https://www.python.org/)
- **Node.js 16+** - Download from [nodejs.org](https://nodejs.org/)
- **Text Editor** - VS Code recommended

## Time Estimate

- **Backend Setup:** 10 minutes
- **Frontend Setup:** 10 minutes
- **Total:** ~20 minutes

## Step 1: Clone the Repository

### Windows
```powershell
# Open PowerShell or Command Prompt
cd Desktop  # or your preferred location

# Clone repository
git clone https://github.com/Haroon-Xray/Image-Annotator-01-04-2026-.git
cd Image-Annotator-01-04-2026-
```

### macOS/Linux
```bash
# Open Terminal
cd ~/Documents  # or your preferred location

# Clone repository
git clone https://github.com/Haroon-Xray/Image-Annotator-01-04-2026-.git
cd Image-Annotator-01-04-2026-
```

## Step 2: Backend Setup (Django)

### Windows

```powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Initialize database
python manage.py migrate

# Create admin user
python manage.py createsuperuser
# Follow prompts:
# - Username: admin
# - Email: admin@example.com
# - Password: create a strong password

# Verify setup
python verify_setup.py

# Start development server
python manage.py runserver
```

**Expected output:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

### macOS/Linux

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python manage.py migrate

# Create admin user
python manage.py createsuperuser
# Follow prompts (same as Windows above)

# Verify setup
python verify_setup.py

# Start development server
python manage.py runserver
```

## Step 3: Frontend Setup (React)

**Open a NEW terminal/command prompt window:**

### Windows
```powershell
# Navigate to frontend (from project root)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### macOS/Linux
```bash
# Navigate to frontend (from project root)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected output:**
```
VITE v4.3.9  ready in 123 ms

➜  Local:   http://localhost:5173/
```

## Step 4: Access the Application

### In Your Browser

| Component | URL | Purpose |
|-----------|-----|---------|
| **Frontend** | http://localhost:5173 | Image annotation interface |
| **Backend API** | http://localhost:8000/api/ | API endpoints |
| **Admin Panel** | http://localhost:8000/admin/ | Django admin (use credentials from Step 2) |
| **Health Check** | http://localhost:8000/api/health/ | Check if backend is running |

### Test the Health Endpoint

```bash
curl http://localhost:8000/api/health/

# Should return:
# {"status":"ok","message":"Backend is running"}
```

## Step 5: Start Using the App

### Upload an Image

1. Go to http://localhost:5173
2. Click "Upload Image" or drag and drop an image file
3. Select supported formats: JPG, PNG, GIF, BMP, or WebP

### Create Annotations

1. After uploading, click on the image
2. Draw a bounding box by clicking and dragging
3. Enter a label for the annotation
4. Repeat for multiple objects

### Export Annotations

1. Click "Export" button
2. Receive JSON file with all annotations
3. Use for training ML models or further processing

## Quick Testing

### Test Backend API

```bash
# List all images
curl http://localhost:8000/api/images/

# Should return JSON array (initially empty)
# [  ]
```

### Test Frontend Upload

1. Open http://localhost:5173
2. Look for upload area
3. Try uploading any image file

## Stopping the Servers

### Backend (Terminal 1)
```
Press Ctrl+C
```

### Frontend (Terminal 2)
```
Press Ctrl+C
```

## Troubleshooting

### "Port 8000 already in use"
```bash
# Use different port
python manage.py runserver 8001

# Then access at http://localhost:8001
```

### "Port 5173 already in use"
```bash
# Vite will auto-increment port
# Check terminal output for actual port number
```

### "Module not found" errors
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

### CORS errors in browser console
1. Verify backend is running
2. Check both servers are on localhost
3. See backenddoc.md CORS section

### "No module named django"
```bash
# Ensure virtual environment is activated
# Windows: .\venv\Scripts\Activate.ps1
# Mac/Linux: source venv/bin/activate

# Then reinstall
pip install -r requirements.txt
```

## Next Steps

1. **Read Documentation:**
   - [Backend Docs](./backenddoc.md) - Complete backend reference
   - [API Testing Guide](./API_TESTING_GUIDE.md) - Test all endpoints
   - [Frontend Integration](./FRONTEND_INTEGRATION.md) - Frontend-backend connection

2. **Explore Admin Panel:**
   - Go to http://localhost:8000/admin/
   - Log in with superuser credentials
   - View and manage images and annotations

3. **Test API Endpoints:**
   - Use curl commands from API_TESTING_GUIDE.md
   - Or use Postman/Insomnia for GUI testing

4. **Customize Settings:**
   - Edit `backend/settings.py` for configuration changes
   - Update `.env` file for environment variables

## Development Workflow

### Daily Startup

**Terminal 1 (Backend):**
```bash
cd backend
source venv/bin/activate  # or .\venv\Scripts\Activate.ps1 on Windows
python manage.py runserver
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Making Changes

- **Backend Models/Views:** Edit files and server auto-reloads
- **Frontend Components:** Edit and browser auto-refreshes
- **No Database Migrations:** Get automatic on startup

### Creating Admin User

```bash
cd backend
python manage.py createsuperuser
```

## Useful Commands

### Backend
```bash
# Run tests
python manage.py test

# Create new migration
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Start shell
python manage.py shell

# Collect static files
python manage.py collectstatic
```

### Frontend
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Database Access

SQLite database is stored in `backend/db.sqlite3`

### View with DB Browser
1. Download [DB Browser for SQLite](https://sqlitebrowser.org/)
2. Open `backend/db.sqlite3`
3. Browse tables and data

## Getting Help

1. **Check Documentation:**
   - `backenddoc.md` - Comprehensive backend docs
   - `API_TESTING_GUIDE.md` - API testing examples
   - `FRONTEND_INTEGRATION.md` - Frontend connection guide

2. **Common Issues:**
   - See "Troubleshooting" section above
   - Check backend logs in terminal

3. **GitHub Issues:**
   - Visit [repository](https://github.com/Haroon-Xray/Image-Annotator-01-04-2026-)
   - Create an issue if you find bugs

## Success Indicators

✅ You should see:
- Backend terminal showing "Starting development server at http://127.0.0.1:8000/"
- Frontend terminal showing "Local: http://localhost:5173/"
- Frontend app loads in browser
- Can upload and annotate images
- Admin panel accessible at http://localhost:8000/admin/

---

**Questions?** Check the comprehensive documentation files included in the project.

**Happy Annotating!** 🎉
