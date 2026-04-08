# Docker Quick Reference

## 📦 Docker Quick Commands

### Initial Setup
```bash
# Copy environment template
cp .env.example .env

# Build and start all services
docker-compose up --build

# Build only (without starting)
docker-compose build

# Start services (if already built)
docker-compose up
```

### Running Services
```bash
# Start in foreground (see logs)
docker-compose up

# Start in background (detached)
docker-compose up -d

# Stop all services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove everything including volumes
docker-compose down -v
```

### Viewing Logs
```bash
# All services (follow mode)
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 50 lines
docker-compose logs --tail=50
```

### Accessing Containers
```bash
# Backend bash shell
docker-compose exec backend bash

# Frontend sh shell  
docker-compose exec frontend sh

# Django management
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py shell
```

### Rebuilding After Changes
```bash
# Rebuild if you changed requirements.txt or package.json
docker-compose up --build

# Rebuild specific service
docker-compose build backend
docker-compose build frontend
```

### Cleaning Up
```bash
# Remove unused images
docker image prune

# Remove unused containers
docker container prune

# Remove everything (careful!)
docker system prune -a
```

## 🌐 Access Points

| Service | URL |
|---------|-----|
| Frontend (Vite) | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Django Admin | http://localhost:8000/admin |

## 📁 File Structure

```
Project Root/
├── docker-compose.yml              # Orchestration
├── .env.example                    # Environment template
├── backend/
│   ├── Dockerfile                  # Backend image
│   └── .dockerignore              # What to exclude
├── frontend/
│   ├── Dockerfile                  # Frontend image
│   └── .dockerignore              # What to exclude
└── docs/
    └── DOCKER_SETUP.md            # Full Docker guide
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

### Hot Reload Not Working
```bash
# For frontend HMR, ensure:
# 1. CHOKIDAR_USEPOLLING=true in docker-compose.yml
# 2. Vite HMR enabled in vite.config.js
```

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Rebuild without cache
docker-compose build --no-cache backend
```

### Clean Rebuild
```bash
docker-compose down -v           # Remove everything
docker-compose up --build        # Fresh start
```
