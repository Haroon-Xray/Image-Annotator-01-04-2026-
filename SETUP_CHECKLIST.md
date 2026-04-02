# Setup Verification Checklist

Use this checklist to verify your backend is properly set up before running it.

## Pre-Installation
- [ ] Python 3.8+ installed
- [ ] pip is up to date
- [ ] Git installed (for cloning)
- [ ] Text editor or IDE ready

## Repository Clone
- [ ] Repository cloned locally
- [ ] Project structure visible
- [ ] README and documentation files present

## Virtual Environment
- [ ] Virtual environment created (`venv/` folder exists)
- [ ] Virtual environment activated (terminal shows (venv))
- [ ] Python path correct (verify with `which python` or `where python`)

## Dependencies Installation
- [ ] `requirements.txt` file exists
- [ ] All packages installed without errors
- [ ] Specific packages present:
  - [ ] Django 6.0.3
  - [ ] djangorestframework 3.14.0
  - [ ] django-cors-headers 4.3.1
  - [ ] Pillow 10.1.0

## Database Setup
- [ ] Migrations run successfully
- [ ] `db.sqlite3` file created
- [ ] Admin user created (superuser)
- [ ] No migration errors in terminal

## Project Configuration
- [ ] `.env` file created from `.env.example`
- [ ] Debug mode set appropriately
- [ ] Secret key configured
- [ ] Allowed hosts configured
- [ ] CORS origins configured

## File Structure
- [ ] `backend/settings.py` exists and configured
- [ ] `backend/urls.py` exists and has annotator paths
- [ ] `annotator/models.py` exists
- [ ] `annotator/views.py` exists with ViewSets
- [ ] `annotator/serializers.py` exists
- [ ] `annotator/urls.py` exists
- [ ] `manage.py` exists in backend folder

## Media & Static Files
- [ ] `media/` directory created
- [ ] `media/images/` directory created
- [ ] Directory permissions set correctly (755 on Unix)
- [ ] `staticfiles/` created if needed

## Django Admin
- [ ] Admin panel accessible at http://localhost:8000/admin/
- [ ] Superuser login works
- [ ] Image and Annotation models visible in admin
- [ ] Admin interface functional

## API Endpoints
- [ ] Health check endpoint responds: http://localhost:8000/api/health/
- [ ] Images endpoint accessible: http://localhost:8000/api/images/
- [ ] CORS headers present in responses
- [ ] No 404 errors on API endpoints

## Verification Script
- [ ] `verify_setup.py` runs without errors
- [ ] All checks in verify script pass
- [ ] Output shows green checkmarks

## Development Server
- [ ] `python manage.py runserver` runs without errors
- [ ] Terminal shows "Starting development server at http://127.0.0.1:8000/"
- [ ] No warnings or errors on startup
- [ ] Server responds to requests

## Testing (Optional)
- [ ] `python manage.py test` runs without errors
- [ ] Test cases pass (if any)

## Frontend Integration (Optional)
- [ ] Frontend runs on separate port (5173)
- [ ] Frontend can communicate with backend
- [ ] File upload works from frontend
- [ ] Annotations display correctly

## Production Readiness (If Deploying)
- [ ] DEBUG set to False
- [ ] SECRET_KEY is strong and unique
- [ ] ALLOWED_HOSTS updated with domain
- [ ] Database backup strategy in place
- [ ] Media files backup plan
- [ ] SSL/HTTPS configured
- [ ] Gunicorn or similar WSGI server configured
- [ ] Nginx or Apache reverse proxy configured
- [ ] Environment variables secure

## Documentation Review
- [ ] Read `backenddoc.md` (comprehensive guide)
- [ ] Read `API_TESTING_GUIDE.md` (API reference)
- [ ] Read `FRONTEND_INTEGRATION.md` (integration guide)
- [ ] Read `GETTING_STARTED.md` (quick start)

## Troubleshooting Steps Completed
- [ ] Verified Python version (`python --version`)
- [ ] Verified packages installed (`pip list`)
- [ ] Checked for common errors in terminal
- [ ] Ran migrations without issues (`python manage.py migrate`)

---

## Quick Verification Commands

Run these commands to verify your setup:

```bash
# Check Python version (should be 3.8+)
python --version

# Check virtual environment is activated
# (terminal should show (venv) prefix)

# Verify Django installation
python -c "import django; print(f'Django {django.get_version()}')"

# Verify all packages
pip list | grep -E "(Django|djangorestframework|django-cors|Pillow)"

# Check database
ls -la db.sqlite3  # On Unix/Mac
dir db.sqlite3     # On Windows

# Verify migrations applied
python manage.py showmigrations annotator

# Run verification script
python verify_setup.py

# Test health endpoint (in running server)
curl http://localhost:8000/api/health/
```

---

## Success Criteria

Your backend is ready when:
✅ Virtual environment activated  
✅ All dependencies installed  
✅ Database migrations applied  
✅ Admin user created  
✅ `verify_setup.py` passes all checks  
✅ `python manage.py runserver` starts without errors  
✅ Health check endpoint responds with OK  
✅ Admin panel accessible and functional  

---

## Common Setup Issues & Solutions

### Issue: "ModuleNotFoundError: No module named 'django'"
**Solution:** 
```bash
# Activate virtual environment
# Windows: .\venv\Scripts\Activate.ps1
# Mac/Linux: source venv/bin/activate

# Reinstall requirements
pip install -r requirements.txt
```

### Issue: Port 8000 already in use
**Solution:**
```bash
# Use different port
python manage.py runserver 8001

# Or kill process using port 8000
# Windows: netstat -ano | findstr :8000 → taskkill /PID <PID> /F
# Mac/Linux: lsof -i :8000 → kill -9 <PID>
```

### Issue: Database errors
**Solution:**
```bash
# Reset migrations
python manage.py migrate --fake-initial

# Or remove and recreate
# Delete db.sqlite3
python manage.py migrate
```

### Issue: CORS errors in browser
**Solution:**
Update `settings.py` CORS_ALLOWED_ORIGINS with your frontend URL:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
]
```

---

## Need Help?

1. **Check Documentation:**
   - Main backend docs: `backenddoc.md`
   - Quick start: `GETTING_STARTED.md`
   - API testing: `API_TESTING_GUIDE.md`

2. **Run Verification:**
   ```bash
   python verify_setup.py
   ```

3. **Check Logs:**
   - Look at terminal output for error messages
   - Check `db.sqlite3` permissions

4. **GitHub Issues:**
   - Visit repository and search for similar issues
   - Create new issue if problem persists

---

**Last Updated:** April 2, 2026  
**Checklist Version:** 1.0.0
