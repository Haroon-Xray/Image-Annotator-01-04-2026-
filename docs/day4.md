# Day 4: Security Hardening

## Overview
Day 4 focused on implementing production-grade security configurations, removing hardcoded secrets, and implementing environment-based configuration management.

## ✅ Completed Tasks

### 1. SECRET_KEY Management

#### Before (Insecure)
```python
SECRET_KEY = 'django-insecure-d_k*hlv-3)2yv5sgh$b&n!m3g2d)*@g%oy@b#8agsdz(k-i=-4'
```

**Issues:**
- Hardcoded in source code
- Exposed in version control
- Insecure prefix indicates weakness
- Available to anyone with repo access

#### After (Secure)
```python
SECRET_KEY = config('SECRET_KEY', default=None)

if not SECRET_KEY:
    raise ValueError(
        'CRITICAL ERROR: SECRET_KEY environment variable is not set!\n'
        'Please set the SECRET_KEY in your .env file or deployment environment.'
    )

if SECRET_KEY.startswith('django-insecure-'):
    warnings.warn(
        'WARNING: Using an insecure SECRET_KEY...',
        RuntimeWarning
    )
```

**Improvements:**
- Loaded from `.env` file
- Fails fast if missing
- Warns about insecure keys
- Prevents accidental deployment

**Key Management:**
```bash
# Generate new secure key
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Add to .env
SECRET_KEY=<generated-key>
```

### 2. DEBUG Mode Configuration

#### Before (Insecure)
```python
DEBUG = True
```

**Issues:**
- Always enabled in development
- Info disclosure risks (file paths, SQL queries, env vars)
- Static files auto-served (security risk)
- Performance degradation

#### After (Secure)
```python
DEBUG = config('DEBUG', default='False', cast=lambda x: x.lower() == 'true')

if DEBUG:
    import warnings
    warnings.warn(
        'WARNING: DEBUG mode is enabled. This is only suitable for development.\n'
        'Set DEBUG=False in production to prevent information disclosure.',
        RuntimeWarning
    )
```

**Configuration:**
```env
# Development
DEBUG=true

# Production
DEBUG=false
```

**DEBUG Impact:**
| Setting | Effect |
|---------|--------|
| DEBUG=True | Detailed errors, static file serving, slower |
| DEBUG=False | Generic errors, no auto static serving, optimized |

### 3. ALLOWED_HOSTS Configuration

#### Before (Insecure)
```python
ALLOWED_HOSTS = ['*', 'localhost', '127.0.0.1']
```

**Issues:**
- Wildcard accepts any Host header
- Vulnerable to Host Header attacks
- Too permissive

#### After (Secure)
```python
ALLOWED_HOSTS_STR = config('ALLOWED_HOSTS', default='127.0.0.1,localhost')
ALLOWED_HOSTS = [host.strip() for host in ALLOWED_HOSTS_STR.split(',') if host.strip()]

if '*' in ALLOWED_HOSTS:
    warnings.warn(
        'WARNING: ALLOWED_HOSTS contains "*" which accepts any host header.\n'
        'This is only suitable for development. Set specific hostnames in production.',
        RuntimeWarning
    )
```

**Configuration Examples:**
```env
# Development
ALLOWED_HOSTS=localhost,127.0.0.1

# Production
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,api.yourdomain.com
```

### 4. CORS Configuration

#### Before (Implicit)
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
]
```

#### After (Explicit & Environment-Based)
```python
CORS_ALLOWED_ORIGINS_STR = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173'
)
CORS_ALLOWED_ORIGINS = [origin.strip() for origin in CORS_ALLOWED_ORIGINS_STR.split(',')]
```

**Features:**
```python
CORS_ALLOW_CREDENTIALS = True      # Allow cookies in requests
```

**Configuration:**
```env
# Development
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Production
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
```

### 5. Python-Decouple Integration

#### Installation
```bash
pip install python-decouple==3.8
```

#### Automatic .env Loading
```python
from decouple import config

# Automatically loads from .env file
SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default='False', cast=lambda x: x.lower() == 'true')
```

#### Benefits
- Automatic `.env` file detection
- Type casting support
- Default value handling
- No additional configuration needed

### 6. Environment File Setup

#### .env Template
```env
# ============================================================================
# SECURITY: SECRET KEY MANAGEMENT
# ============================================================================
SECRET_KEY=<your-secret-key-here>

# ============================================================================
# DEBUG MODE CONFIGURATION
# ============================================================================
DEBUG=false

# ============================================================================
# ALLOWED HOSTS
# ============================================================================
ALLOWED_HOSTS=localhost,127.0.0.1

# ============================================================================
# CORS CONFIGURATION
# ============================================================================
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================
DB_NAME=image_annotator
DB_USER=postgres
DB_PASSWORD=<password>
DB_HOST=localhost
DB_PORT=5432
```

#### .env File Handling
```
# .gitignore
.env              # Never commit
.env.local        # Local overrides
.env.example      # Template only
```

### 7. Additional Security Features

#### Cookie Security
```python
SESSION_COOKIE_HTTPONLY = True     # Prevent JS access
CSRF_COOKIE_HTTPONLY = True        # Prevent JS access
SESSION_COOKIE_SAMESITE = 'Strict' # CSRF protection
CSRF_COOKIE_SAMESITE = 'Strict'
```

#### Security Headers
```python
X_FRAME_OPTIONS = 'DENY'                       # Prevent clickjacking
SECURE_CONTENT_TYPE_NOSNIFF = True            # Prevent MIME sniffing
SECURE_BROWSER_XSS_FILTER = True              # Enable browser XSS filter
SECURE_HSTS_SECONDS = 31536000                # HTTP Strict Transport Security
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = False
```

#### HTTPS Configuration (Production)
```python
# Only enable in production with HTTPS
SECURE_SSL_REDIRECT = True                     # Force HTTPS redirect
SESSION_COOKIE_SECURE = True                   # Only send over HTTPS
CSRF_COOKIE_SECURE = True                      # Only send over HTTPS
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
```

## 🔐 Security Checklist

- [x] SECRET_KEY loaded from environment
- [x] DEBUG mode environment-based
- [x] ALLOWED_HOSTS restricted
- [x] CORS origins whitelist
- [x] Cookie security enabled
- [x] Security headers configured
- [x] .env file in .gitignore
- [x] Environment variable validation
- [x] Runtime warnings for insecure configs
- [x] Documentation updated

## 📋 Deployment Checklist

### Before Production
```bash
# 1. Update .env for production
DEBUG=false
SECRET_KEY=<new-secure-key>
ALLOWED_HOSTS=yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# 2. Run security checks
python manage.py check --deploy

# 3. Enable HTTPS
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# 4. Test thoroughly
python manage.py test

# 5. Collect static files
python manage.py collectstatic --noinput
```

## 🚀 Next Steps

→ **Day 5**: Inference and YOLO deployment
