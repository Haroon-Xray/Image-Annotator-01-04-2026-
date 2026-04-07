# Quick Reference - Security & Environment Setup

## 🚀 Quick Start

### Development Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your development values (mostly defaults are fine)
python manage.py runserver
```

### First Time Setup
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Create .env from template
cp .env.example .env

# 3. Generate a secure SECRET_KEY for development:
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
# Copy the output and paste into .env as SECRET_KEY value

# 4. Run migrations
python manage.py migrate

# 5. Start development server
python manage.py runserver
```

---

## 🔑 Environment Variables

### Required in .env
```env
SECRET_KEY=<your-secure-key>     # Critical - must be set
DEBUG=True                         # Dev: True, Production: False
ALLOWED_HOSTS=localhost,127.0.0.1 # Comma-separated list
```

### Optional (with defaults provided)
```env
CORS_ALLOWED_ORIGINS=http://localhost:3000  # Comma-separated list
SECURE_HSTS_SECONDS=31536000               # For HTTPS (production)
```

---

## 🔒 Development vs Production Settings

### Development (.env)
```env
SECRET_KEY=django-insecure-generated-once-for-dev
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Production (.env on server only)
```env
SECRET_KEY=<unique-strong-secret-key>
DEBUG=False
ALLOWED_HOSTS=example.com,www.example.com
CORS_ALLOWED_ORIGINS=https://example.com,https://www.example.com
SECURE_HSTS_SECONDS=31536000
```

---

## ⚠️ Common Issues & Solutions

### Issue: "CRITICAL ERROR: SECRET_KEY environment variable is not set!"
**Solution:**
```bash
# Set SECRET_KEY in .env
1. Generate a key: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
2. Add to .env: SECRET_KEY=<paste-key-here>
3. Restart Django server
```

### Issue: "ModuleNotFoundError: No module named 'decouple'"
**Solution:**
```bash
pip install -r requirements.txt
# or
pip install python-decouple
```

### Issue: "DisallowedHost" error
**Solution:**
```bash
# Check your ALLOWED_HOSTS in .env
# If accessing via IP:   ALLOWED_HOSTS=127.0.0.1
# If accessing via DNS:  ALLOWED_HOSTS=yourdomain.com
# If both:               ALLOWED_HOSTS=yourdomain.com,127.0.0.1
```

### Issue: CORS errors in browser console
**Solution:**
```bash
# Update CORS_ALLOWED_ORIGINS in .env with your frontend URL
# Example: CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## 🛡️ Security Checks

### Before Pushing to GitHub
```bash
# ✓ Verify .env is in .gitignore
grep "\.env" .gitignore

# ✓ Ensure .env is NOT staged for commit
git status

# ✓ Verify no secrets in committed code
git diff
```

### Before Production Deployment
```bash
# ✓ Check Django security status
python manage.py check --deploy

# ✓ Verify DEBUG=False
grep "DEBUG=" .env

# ✓ Verify ALLOWED_HOSTS is set correctly
grep "ALLOWED_HOSTS=" .env

# ✓ Verify SECRET_KEY is unique (not django-insecure-)
grep "SECRET_KEY=" .env
```

---

## 🔐 Secret Key Management

### Generate a Secure Key
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Change Secret Key
```bash
# 1. Generate new key (see above)
# 2. Update .env with new key
# 3. All sessions will be invalidated (users will need to log in again)
# 4. Only do this when necessary
```

### Rotate Keys in Production
```bash
# 1. Deploy new SECRET_KEY in .env
# 2. Restart application
# 3. Monitor for user re-authentication
# 4. Do this during low-traffic periods
```

---

## 📋 Environment Variable Reference

| Variable | Type | Default | Example | Notes |
|----------|------|---------|---------|-------|
| `SECRET_KEY` | String | None | `django-insecure-...` | MUST be set. Change for production. |
| `DEBUG` | Bool | False | `False` / `True` | MUST be False in production. |
| `ALLOWED_HOSTS` | CSV | `127.0.0.1,localhost` | `example.com,www.example.com` | Comma-separated, no wildcards. |
| `CORS_ALLOWED_ORIGINS` | CSV | localhost defaults | `https://example.com` | Comma-separated, use HTTPS in prod. |
| `SECURE_HSTS_SECONDS` | Int | 0 | `31536000` | Set to 31536000 (1 year) in prod. |
| `DB_NAME` | String | `sqlite` | `image_annotator` | Database name (if not SQLite). |
| `DB_USER` | String | None | `postgres` | Database user (if not SQLite). |
| `DB_PASSWORD` | String | None | `secure-pass` | Database password (if not SQLite). |

---

## 🚨 Production Safety Checklist

Before `docker build` and deployment:

```bash
# Security checks
[ ] SECRET_KEY is unique and 50+ characters
[ ] DEBUG=False in production .env
[ ] ALLOWED_HOSTS is specific (not ['*'])
[ ] CORS_ALLOWED_ORIGINS uses HTTPS
[ ] Database password is strong
[ ] SSL/HTTPS configured on server

# Code checks
[ ] .env file is in .gitignore
[ ] .env file NOT committed to repo
[ ] No hardcoded secrets in code
[ ] All app requirements in requirements.txt
[ ] Database migrations created and tested

# Deployment checks
[ ] .env file uploaded separately from code
[ ] Static files collected (python manage.py collectstatic)
[ ] Database migrated (python manage.py migrate)
[ ] Application started and tested
[ ] Logs monitored for errors
[ ] Security headers verified (curl -I https://domain.com)
```

---

## 📞 Documentation

- **Full Guide**: See `SECURITY_CONFIGURATION.md`
- **Template**: See `backend/.env.example`
- **Code Comments**: Check `backend/backend/settings.py` for detailed explanations
- **Summary**: See `REFACTORING_COMPLETION_SUMMARY.md`

---

## 🔗 Useful Commands

```bash
# Run Django security check
python manage.py check --deploy

# Generate new SECRET_KEY
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Run development server
python manage.py runserver

# Run tests
python manage.py test
```

---

**Updated**: 2026-04-06
**Django Version**: 6.0.3
**Environment Manager**: python-decouple 3.8
