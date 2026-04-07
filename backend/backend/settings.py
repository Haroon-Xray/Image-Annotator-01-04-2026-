"""
Django settings for backend project.

"""

from pathlib import Path
import os
from decouple import config

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Note: python-decouple automatically loads from .env file in the project root

# ============================================================================
# SECURITY: SECRET KEY MANAGEMENT
# ============================================================================
# CRITICAL: The SECRET_KEY is used for cryptographic signing of:
#   - Session data
#   - CSRF tokens
#   - Password reset tokens
#   - Signed cookies
# 
# NEVER hardcode the SECRET_KEY in production code or commit it to version control.
# ALWAYS load it from environment variables (.env file or deployed secrets).
# If not set, a warning will be displayed below.
# ============================================================================

SECRET_KEY = config('SECRET_KEY', default=None)

if not SECRET_KEY:
    raise ValueError(
        'CRITICAL ERROR: SECRET_KEY environment variable is not set!\n'
        'Please set the SECRET_KEY in your .env file or deployment environment.\n'
        'To generate a secure SECRET_KEY, run:\n'
        '  python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"'
    )

if SECRET_KEY.startswith('django-insecure-'):
    import warnings
    warnings.warn(
        'WARNING: Using an insecure SECRET_KEY (starts with "django-insecure-").\n'
        'This key is only suitable for development. Generate a new secure key\n'
        'for production deployment.',
        RuntimeWarning
    )

# ============================================================================
# DEBUG MODE CONFIGURATION
# ============================================================================
# CRITICAL: DEBUG must ALWAYS be False in production.
# 
# When DEBUG=True:
#   - Detailed error pages expose sensitive information (file paths, SQL queries, env vars)
#   - Static files are served automatically (security risk)
#   - Performance is degraded
#
# ALWAYS set DEBUG=False in production environments.
# Load from environment variable, default to False for safety.
# ============================================================================

DEBUG = config('DEBUG', default='False', cast=lambda x: x.lower() == 'true')

if DEBUG:
    import warnings
    warnings.warn(
        'WARNING: DEBUG mode is enabled. This is only suitable for development.\n'
        'Set DEBUG=False in production to prevent information disclosure.',
        RuntimeWarning
    )

# ============================================================================
# ALLOWED_HOSTS CONFIGURATION
# ============================================================================
# CRITICAL: ALLOWED_HOSTS prevents HTTP Host Header attacks.
#
# NEVER use ALLOWED_HOSTS = ['*'] in production.
# Only list the exact domain names where your app will be accessed.
#
# Examples:
#   Development: ['127.0.0.1', 'localhost']
#   Production: ['yourdomain.com', 'www.yourdomain.com']
# ============================================================================

ALLOWED_HOSTS_STR = config('ALLOWED_HOSTS', default='127.0.0.1,localhost')
ALLOWED_HOSTS = [host.strip() for host in ALLOWED_HOSTS_STR.split(',') if host.strip()]

if '*' in ALLOWED_HOSTS:
    import warnings
    warnings.warn(
        'WARNING: ALLOWED_HOSTS contains "*" which accepts any host header.\n'
        'This is only suitable for development. Set specific hostnames in production.',
        RuntimeWarning
    )


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party apps
    'rest_framework',
    'corsheaders',
    # Local apps
    'annotator',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'frontend',  # React build folder (Vite output)
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

STATICFILES_DIRS = [
    BASE_DIR / 'frontend' / 'static',  # Vite build output for assets
]

# Media files (User uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ]
}

# ============================================================================
# CORS CONFIGURATION
# ============================================================================
# IMPORTANT: CORS controls which domains can make requests to this API.
# Only add trusted origins. Using ['*'] allows any domain to access your API.
# ============================================================================

CORS_ALLOWED_ORIGINS_STR = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173,http://localhost:8000,http://127.0.0.1:8000'
)
CORS_ALLOWED_ORIGINS = [origin.strip() for origin in CORS_ALLOWED_ORIGINS_STR.split(',') if origin.strip()]

CORS_ALLOW_CREDENTIALS = True

# ============================================================================
# ADDITIONAL SECURITY SETTINGS FOR PRODUCTION
# ============================================================================
# These settings enhance security in production deployments.
# Some are only effective when DEBUG=False and served over HTTPS.
# ============================================================================

# Security Headers
# X-Frame-Options: Prevents clickjacking attacks by restricting iframe embedding
X_FRAME_OPTIONS = 'DENY'

# Secure Content-Type
# Prevents browsers from MIME-sniffing, which can lead to XSS attacks
SECURE_CONTENT_TYPE_NOSNIFF = True

# Secure Browser XSS Filter
# Enables browser's built-in XSS protection
SECURE_BROWSER_XSS_FILTER = True

# HTTP Strict-Transport-Security (HSTS)
# Forces HTTPS connections. Auto-enabled when DEBUG=False and HTTPS is configured.
# Set in production with proper max_age value (e.g., 31536000 for 1 year)
SECURE_HSTS_SECONDS = 0  # Set to 31536000+ in production
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = False  # Set to True only if your domain is on HSTS preload list

# SSL/HTTPS Settings (for production)
# Uncomment and configure these for production HTTPS deployment:
# SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
# SESSION_COOKIE_SECURE = True  # Only send session cookie over HTTPS
# CSRF_COOKIE_SECURE = True     # Only send CSRF cookie over HTTPS
# SECURE_SSL_REDIRECT = True     # Redirect HTTP to HTTPS (when not in development)

# Session and Cookie Security
SESSION_COOKIE_HTTPONLY = True  # Prevent JavaScript access to session cookies
CSRF_COOKIE_HTTPONLY = True     # Prevent JavaScript access to CSRF tokens
SESSION_COOKIE_SAMESITE = 'Strict'  # CSRF protection via SameSite attribute
CSRF_COOKIE_SAMESITE = 'Strict'

# Disable client-side caching of sensitive pages
# This prevents sensitive data from being cached by browsers
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'

# ============================================================================
# ENVIRONMENT-SPECIFIC SECURITY ADJUSTMENTS
# ============================================================================

if not DEBUG and not config('SECRET_KEY', default='').startswith('django-insecure-'):
    # Production environment - enable stricter security
    SECURE_HSTS_SECONDS = int(config('SECURE_HSTS_SECONDS', default='31536000'))
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = False  # Set to True if behind a reverse proxy with HTTPS
    
    # Log a warning if these aren't properly configured
    print('✓ Production security settings enabled')
