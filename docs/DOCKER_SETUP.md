# Docker Setup & Deployment Guide

Complete guide for running the Image Annotator application using Docker and Docker Compose.

## 📋 Prerequisites

- **Docker** (~25 MB): https://www.docker.com/products/docker-desktop
- **Docker Compose**: Usually bundled with Docker Desktop
- No need to install Python, Node.js, or any other dependencies locally

## ✨ What is Docker?

Docker containerizes your application, ensuring it runs the same way everywhere:
- **Consistency**: Same environment on laptop, server, production
- **Isolation**: Each container has its own dependencies
- **Simplicity**: No "works on my machine" problems

---

## 🚀 Quick Start

### 1. Clone/Setup Project
```bash
git clone <repository-url>
cd image-annotator
```

### 2. Create Environment File
```bash
# Copy template
cp .env.example .env

# Edit .env with your values (mostly defaults are fine for development)
# At minimum, set SECRET_KEY:
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
# Copy output to SECRET_KEY in .env
```

### 3. Build and Start Services
```bash
# Build images and start containers in foreground
docker-compose up --build

# Or run in background (detached mode)
docker-compose up --build -d

# View logs if running detached
docker-compose logs -f
```

### 4. Access the Application
- **Frontend**: http://localhost:5173 (Vite development server)
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin/

### 5. Stop Services
```bash
# Stop containers (keep images)
docker-compose down

# Stop and remove everything
docker-compose down -v
```

---

## 📚 Docker Architecture

### File Structure
```
image-annotator/
├── docker-compose.yml          # Orchestrate services
├── .env.example               # Environment template
├── .env                       # Your environment (gitignored)
│
├── backend/
│   ├── Dockerfile            # Backend image definition
│   ├── .dockerignore         # What to exclude from image
│   ├── requirements.txt       # Python dependencies
│   └── [Django app files]
│
├── frontend/
│   ├── Dockerfile            # Frontend image definition
│   ├── .dockerignore         # What to exclude from image
│   ├── package.json          # Node.js dependencies
│   └── [React app files]
│
└── docs/                      # Documentation
```

### Services

#### Backend Service
- **Image**: Python 3.11 slim
- **Port**: 8000 (Django development server)
- **Command**: `python manage.py runserver 0.0.0.0:8000`
- **Volumes**: Mounted for hot reload on code changes

#### Frontend Service
- **Image**: Node 18 Alpine
- **Port**: 5173 (Vite development server)
- **Command**: `npm run dev`
- **Volumes**: Mounted for hot module replacement (HMR)

---

## 🔧 Common Docker Commands

### Build Images
```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Rebuild without cache
docker-compose build --no-cache
```

### Start Services
```bash
# Start and build if needed
docker-compose up --build

# Start without building
docker-compose up

# Run in background (detached)
docker-compose up -d

# Start specific service
docker-compose up backend
docker-compose up frontend
```

### Stop Services
```bash
# Stop containers
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes
docker-compose down -v
```

### View Logs
```bash
# View all logs (follow mode)
docker-compose logs -f

# View specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# View last 100 lines
docker-compose logs --tail=100 backend
```

### Execute Commands

#### Django Management Commands
```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic

# Run tests
docker-compose exec backend python manage.py test
```

#### Frontend Commands
```bash
# Install new package
docker-compose exec frontend npm install lodash

# Check Node version
docker-compose exec frontend node --version

# Generate build
docker-compose exec frontend npm run build
```

### Interactive Access
```bash
# Access backend shell
docker-compose exec backend bash

# Access frontend shell
docker-compose exec frontend sh

# Access Python shell
docker-compose exec backend python manage.py shell
```

---

## 🔐 Environment Variables

### Creating .env File
```bash
# Copy template
cp .env.example .env

# Edit with your values
nano .env  # or use your editor
```

### Key Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `SECRET_KEY` | Django security | `django-insecure-...` |
| `DEBUG` | Debug mode (false for production) | `false` |
| `ALLOWED_HOSTS` | Valid hostnames | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | Frontend origin | `http://localhost:5173` |
| `DB_ENGINE` | Database type | `sqlite3` or `postgresql` |
| `VITE_API_URL` | Backend URL for frontend | `http://localhost:8000/api` |

---

## 🐛 Troubleshooting

### Issue: "Port 8000 already in use"
```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
# Change "8000:8000" to "8001:8000"
```

### Issue: "Permission denied" on volumes
```bash
# On Linux, fix permissions
docker-compose exec backend chown -R 1000:1000 /app

# Or in Dockerfile
RUN useradd -m -u 1000 app && chown -R app /app
```

### Issue: Dependencies not installing
```bash
# Rebuild without cache
docker-compose build --no-cache backend

# Clear and reinstall
docker-compose down -v
docker-compose up --build
```

### Issue: Frontend not updating on code changes
```bash
# Ensure volumes are mounted correctly in docker-compose.yml
# Check with:
docker-compose exec frontend ls -la /app

# Verify HMR is enabled in vite.config.js
# server: {
#   hmr: true,
#   host: '0.0.0.0'
# }
```

### Issue: "Cannot GET /" on frontend
```bash
# Make sure frontend is running
docker-compose logs frontend

# Check port mapping
docker ps | grep frontend

# Ensure correct URL: http://localhost:5173 (not 3000)
```

### View Container Details
```bash
# List running containers
docker-compose ps

# Inspect container
docker inspect image-annotator-backend

# View resource usage
docker stats
```

---

## 📦 Production Deployment

### Important Changes for Production

#### 1. Update docker-compose.yml
```yaml
# Change to production build
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile.prod  # Create this file

# Remove volume mounts
# volumes: [remove this section]

# Change restart policy
restart: always

# Disable debug mode
environment:
  DEBUG: "false"
```

#### 2. Create Dockerfile.prod for Backend
```dockerfile
# Copy Dockerfile, then at the end:
RUN python manage.py collectstatic --noinput
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
```

#### 3. Add Gunicorn to requirements.txt
```
gunicorn==21.2.0
```

#### 4. Production docker-compose.yml
```yaml
# Remove volume mounts
# Expose via reverse proxy (Nginx)
# Use environment variables for secrets
# Add logging configuration
# Set resource limits
```

#### 5. Use Environment Secrets
```bash
# Never commit .env file
# Use Docker secrets or environment variables from CI/CD

# GitHub Actions example:
env:
  SECRET_KEY: ${{ secrets.DJANGO_SECRET_KEY }}
  DEBUG: "false"
```

---

## 🔄 Development Workflow

### Local Development With Docker

#### 1. Initial Setup
```bash
docker-compose up --build
docker-compose exec backend python manage.py migrate
```

#### 2. Making Code Changes
- Edit files in `backend/` or `frontend/`
- Changes auto-reload via volume mounts and HMR
- No need to rebuild

#### 3. Adding Dependencies
```bash
# Backend
pip install new-package
pip freeze > requirements.txt
# Commit requirements.txt
# Rebuild Docker image next time

# Frontend
docker-compose exec frontend npm install new-package
# Commit package.json and package-lock.json
```

#### 4. Database Migrations
```bash
# Create migration
docker-compose exec backend python manage.py makemigrations

# Apply migration
docker-compose exec backend python manage.py migrate
```

#### 5. Running Tests
```bash
# Backend tests
docker-compose exec backend python manage.py test

# Frontend tests (if configured)
docker-compose exec frontend npm test
```

---

## 📊 Docker Compose File Structure

```yaml
version: '3.8'                    # Docker Compose version

services:                         # Define services
  backend:                        # Service 1
    build:                        # Build configuration
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"              # Map HOST:CONTAINER
    volumes:
      - ./backend:/app            # Mount volume for development
    environment:
      - SECRET_KEY=...            # Environment variables
    networks:
      - app-network               # Connect to network

  frontend:                       # Service 2
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
    environment:
      - VITE_PORT=5173

networks:                         # Define networks
  app-network:
    driver: bridge
```

---

## 🛠️ Advanced Topics

### Multi-Stage Builds
Use multiple `FROM` statements to reduce image size:
```dockerfile
# Stage 1: Build
FROM python:3.11 as builder
COPY requirements.txt .
RUN pip install -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim
COPY --from=builder /usr/local/lib /usr/local/lib
COPY . .
```

### Health Checks
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/api/health/"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### Resource Limits
```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 512M
```

### Networking
```yaml
# Services can communicate using service names:
# Backend → Frontend: http://frontend:5173
# Frontend → Backend: http://backend:8000
```

---

## 📚 Useful Resources

- [Docker Docs](https://docs.docker.com)
- [Docker Compose Docs](https://docs.docker.com/compose)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices)
- [Docker Registry](https://hub.docker.com)

---

## ✅ Docker Checklist

- [x] Dockerfile for backend (Django)
- [x] Dockerfile for frontend (React)
- [x] .dockerignore for both services
- [x] docker-compose.yml with both services
- [x] .env.example for configuration
- [x] Environment variable support
- [x] Volume mounts for development
- [x] Network for service communication
- [x] Clean and production-ready structure

---

## 🎉 Next Steps

1. Create `.env` file: `cp .env.example .env`
2. Update environment variables as needed
3. Start services: `docker-compose up --build`
4. Access application at http://localhost:5173 and http://localhost:8000
5. For changes to dependencies, rebuild: `docker-compose up --build`

Enjoy containerized development! 🐳
