# Security Configuration Guide

This document explains the security improvements made to the Django project to prepare it for production deployment.

## Overview

The Django settings have been refactored to follow security best practices:
- Environment-based configuration using `.env` files
- Removed hardcoded sensitive values
- Added comprehensive security headers
- Implemented secure cookie handling
- Added validations and warnings for production safety

---

## 1. SECRET_KEY Management

### Why This Matters
The `SECRET_KEY` is used for:
- **Session signing**: Validating user session data
- **CSRF tokens**: Preventing cross-site request forgery attacks
- **Password reset tokens**: Securing password reset links
- **Cookie signatures**: Protecting cookie integrity

### How It's Done
```python
SECRET_KEY = config('SECRET_KEY', default=None)

if not SECRET_KEY:
    raise ValueError('CRITICAL ERROR: SECRET_KEY environment variable is not set!')
```

### Best Practices
✅ **DO:**
- Generate a unique, long secret key (50+ characters)
- Store it in `.env` file (not in version control)
- Use a cryptographically secure generator:
  ```bash
  python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
  ```
- Change the key when rotating credentials
- Use different keys for development, staging, and production

❌ **DON'T:**
- Use the default `django-insecure-*` keys in production
- Commit `.env` files to version control
- Share the secret key in emails or chat
- Hardcode secrets in settings.py

---

## 2. DEBUG Mode Configuration

### Why This Matters
When `DEBUG=True`:
- **Information Disclosure**: Error pages show file paths, SQL queries, environment variables
- **Security Risk**: Stack traces reveal application structure and vulnerabilities
- **Performance**: Static files served by Django instead of a proper web server
- **Unnecessary Overhead**: Template debugging adds processing overhead

### How It's Done
```python
DEBUG = config('DEBUG', default='False', cast=lambda x: x.lower() == 'true')

if DEBUG:
    warnings.warn('WARNING: DEBUG mode is enabled. This is only suitable for development.')
```

### Best Practices
✅ **DO:**
- Set `DEBUG=False` in production
- Use proper logging instead of error pages
- Catch and handle exceptions gracefully
- Return generic error messages to users

❌ **DON'T:**
- Enable DEBUG in production under any circumstances
- Rely on error pages for debugging in production
- Fill logs with sensitive information

---

## 3. ALLOWED_HOSTS Configuration

### Why This Matters
`ALLOWED_HOSTS` prevents **HTTP Host Header attacks** where:
- Attacker crafts requests with fake `Host` headers
- Application generates URLs using the spoofed host
- User clicks links to attacker-controlled domains
- Session cookies may be stolen if protocols don't prevent it

### How It's Done
```python
ALLOWED_HOSTS_STR = config('ALLOWED_HOSTS', default='127.0.0.1,localhost')
ALLOWED_HOSTS = [host.strip() for host in ALLOWED_HOSTS_STR.split(',') if host.strip()]
```

### Best Practices
✅ **DO:**
- List all exact domain names:
  ```
  ALLOWED_HOSTS=example.com,www.example.com,api.example.com
  ```
- Use environment variables for flexibility
- Update for each deployment environment

❌ **DON'T:**
- Use `ALLOWED_HOSTS = ['*']` in production
- Include unnecessary domains
- Hardcode localhost in production configs

---

## 4. CORS Configuration

### Why This Matters
CORS (Cross-Origin Resource Sharing) prevents unauthorized cross-origin requests:
- Provides selective domain access to your API
- Prevents CSRF attacks (browser Same-Origin Policy)
- Controls credential sharing across origins

### How It's Done
```python
CORS_ALLOWED_ORIGINS = [origin.strip() for origin in CORS_ALLOWED_ORIGINS_STR.split(',')]
```

### Best Practices
✅ **DO:**
- List only trusted frontend domains
- Use HTTPS URLs in production:
  ```
  CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
  ```
- Remove localhost origins in production
- Keep credentials (`CORS_ALLOW_CREDENTIALS=True`) only when necessary

❌ **DON'T:**
- Use `CORS_ALLOWED_ORIGINS = ['*']` if credentials are enabled
- Include untrusted or competitor domains
- Expose API to all origins

---

## 5. Security Headers

### X-Frame-Options
```python
X_FRAME_OPTIONS = 'DENY'
```
**Purpose**: Prevents clickjacking attacks by disallowing iframe embedding
- `DENY`: Page cannot be embedded in frames
- Alternative: `SAMEORIGIN` (allow same-origin frames)

### Content-Type Protection
```python
SECURE_CONTENT_TYPE_NOSNIFF = True
```
**Purpose**: Prevents MIME-sniffing attacks where browsers guess file types

### XSS Protection
```python
SECURE_BROWSER_XSS_FILTER = True
```
**Purpose**: Enables browser's built-in XSS protection

### HSTS (HTTP Strict-Transport-Security)
```python
SECURE_HSTS_SECONDS = 31536000  # 1 year in production
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
```
**Purpose**: Forces HTTPS connections
- Prevents man-in-the-middle attacks
- Must be served over HTTPS
- Takes effect after first HTTPS visit
- Preload list integration available

### Referrer Policy
```python
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'
```
**Purpose**: Controls referrer information in requests
- `strict-origin-when-cross-origin`: Minimal information on cross-origin requests

---

## 6. Cookie Security

### Session Cookie
```python
SESSION_COOKIE_HTTPONLY = True      # Not accessible to JavaScript
SESSION_COOKIE_SECURE = True        # Only sent over HTTPS
SESSION_COOKIE_SAMESITE = 'Strict'  # CSRF protection
```

### CSRF Cookie
```python
CSRF_COOKIE_HTTPONLY = True         # Not accessible to JavaScript
CSRF_COOKIE_SAMESITE = 'Strict'     # CSRF protection
```

**Why This Matters:**
- `HttpOnly`: Prevents XSS attacks from stealing cookies
- `Secure`: Prevents interception over unencrypted connections
- `SameSite=Strict`: Blocks cookies in cross-site requests (CSRF protection)

---

## 7. Environment Variables

### .env File Structure
```env
# Security
SECRET_KEY=your-secure-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Database
DB_NAME=image_annotator
DB_USER=postgres
DB_PASSWORD=your-secure-password
DB_HOST=localhost
DB_PORT=5432
```

### .env File Protection
- **NEVER commit to version control** (add to `.gitignore`)
- Use different `.env` files for each environment
- Encrypt in transit when sharing
- Rotate sensitive values regularly
- Restrict file permissions: `chmod 600 .env`

---

## 8. Production Deployment Checklist

Before deploying to production, verify all items:

### Configuration
- [ ] Generate and set a new `SECRET_KEY`
- [ ] Set `DEBUG=False`
- [ ] Update `ALLOWED_HOSTS` with actual domains
- [ ] Configure `CORS_ALLOWED_ORIGINS` with HTTPS URLs
- [ ] Update database credentials

### Security
- [ ] Enable HTTPS/SSL on your server
- [ ] Set secure database password
- [ ] Configure proper logging (don't expose sensitive data)
- [ ] Update `SECURE_PROXY_SSL_HEADER` if behind a proxy:
  ```python
  SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
  ```
- [ ] Enable `SECURE_SSL_REDIRECT` if using HTTPS enforcer middleware
- [ ] Set `SECURE_HSTS_SECONDS` to 31536000 (1 year) or higher

### Files & Permissions
- [ ] `.env` file added to `.gitignore`
- [ ] `.env.example` created with template values
- [ ] `.env` file not uploaded to server (use deployment secrets)
- [ ] Static files collected: `python manage.py collectstatic`
- [ ] Database migrations applied: `python manage.py migrate`

### Testing
- [ ] Test with `DEBUG=False` locally
- [ ] Verify all features work without debug information
- [ ] Check security headers are sent: `curl -I https://yourdomain.com`
- [ ] Run Django's security check: `python manage.py check --deploy`

---

## 9. Django Security Check

Run Django's built-in security checklist:
```bash
python manage.py check --deploy
```

This command validates:
- HTTPS configuration
- HSTS settings
- CSRF middleware
- Security middleware
- And more...

Fix any warnings before production deployment.

---

## 10. Additional Resources

- [Django Security Documentation](https://docs.djangoproject.com/en/stable/topics/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)

---

## Summary

| Component | Development | Production |
|-----------|-------------|------------|
| **SECRET_KEY** | Any unique value | Strong, unique, secret |
| **DEBUG** | `True` | `False` |
| **ALLOWED_HOSTS** | `localhost,127.0.0.1` | Exact domains |
| **CORS Origins** | Localhost URLs | HTTPS domain URLs |
| **HSTS Seconds** | 0 | 31536000 (1 year) |
| **SSL/HTTPS** | Not required | Required |
| **Cookie Secure** | False | True |

---

## Questions?

Refer to the `.env.example` file for template environment variables and inline comments in `settings.py` for detailed explanations.
