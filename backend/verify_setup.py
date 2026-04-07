#!/usr/bin/env python3
"""
Setup Verification Script for Image Annotator Backend
Checks if all requirements are met for running the backend
"""

import os
import sys
import subprocess
import json
from pathlib import Path


def print_header(text):
    """Print formatted header"""
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}")


def check_python_version():
    """Check Python version"""
    version = sys.version_info
    print(f"\n✓ Python {version.major}.{version.minor}.{version.micro}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("  ✗ Python 3.8+ required!")
        return False
    return True


def check_django():
    """Check Django installation"""
    try:
        import django
        print(f"✓ Django {django.VERSION[0]}.{django.VERSION[1]}.{django.VERSION[2]}")
        return True
    except ImportError:
        print("✗ Django not installed")
        return False


def check_drf():
    """Check Django REST Framework"""
    try:
        import rest_framework
        print(f"✓ Django REST Framework {rest_framework.__version__}")
        return True
    except ImportError:
        print("✗ Django REST Framework not installed")
        return False


def check_cors():
    """Check django-cors-headers"""
    try:
        import corsheaders
        print(f"✓ django-cors-headers installed")
        return True
    except ImportError:
        print("✗ django-cors-headers not installed")
        return False


def check_pillow():
    """Check Pillow installation"""
    try:
        from PIL import Image
        import PIL
        print(f"✓ Pillow {PIL.__version__}")
        return True
    except ImportError:
        print("✗ Pillow not installed")
        return False


def check_database():
    """Check if database migrations are applied"""
    db_path = Path("db.sqlite3")
    if db_path.exists():
        size_mb = db_path.stat().st_size / (1024 * 1024)
        print(f"✓ Database exists (size: {size_mb:.2f} MB)")
        return True
    else:
        print("✗ Database not created yet")
        return False


def check_media_dir():
    """Check if media directories exist"""
    media_path = Path("media")
    if media_path.exists():
        print("✓ Media directory exists")
        return True
    else:
        print("✗ Media directory not created")
        return False


def check_files():
    """Check if required files exist"""
    files = [
        "manage.py",
        "requirements.txt",
        "backend/settings.py",
        "backend/urls.py",
        "annotator/models.py",
        "annotator/views.py",
    ]
    
    all_exist = True
    for file in files:
        if Path(file).exists():
            print(f"  ✓ {file}")
        else:
            print(f"  ✗ {file} (missing)")
            all_exist = False
    
    return all_exist


def check_django_admin():
    """Check Django admin accessibility"""
    try:
        from django.contrib.admin import site
        print("✓ Django admin available")
        return True
    except Exception as e:
        print(f"✗ Django admin error: {e}")
        return False


def check_settings():
    """Check Django settings"""
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
        import django
        django.setup()
        
        from django.conf import settings
        
        checks = {
            "DEBUG": settings.DEBUG,
            "ALLOWED_HOSTS": len(settings.ALLOWED_HOSTS) > 0,
            "SECRET_KEY": len(settings.SECRET_KEY) > 0,
            "DATABASES": settings.DATABASES is not None,
            "INSTALLED_APPS": 'annotator' in settings.INSTALLED_APPS,
            "REST_FRAMEWORK": hasattr(settings, 'REST_FRAMEWORK'),
            "CORS_ALLOWED_ORIGINS": hasattr(settings, 'CORS_ALLOWED_ORIGINS'),
        }
        
        all_ok = True
        for check, result in checks.items():
            status = "✓" if result else "✗"
            print(f"  {status} {check}")
            if not result:
                all_ok = False
        
        return all_ok
    except Exception as e:
        print(f"✗ Error checking settings: {e}")
        return False


def check_models():
    """Check if models are properly configured"""
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
        import django
        django.setup()
        
        from annotator.models import Image, Annotation
        
        # Check if Image model has expected fields
        image_fields = [f.name for f in Image._meta.get_fields()]
        annotation_fields = [f.name for f in Annotation._meta.get_fields()]
        
        required_image_fields = ['id', 'name', 'image_file', 'size', 'uploaded_at', 'updated_at']
        required_annotation_fields = ['id', 'label', 'x', 'y', 'width', 'height', 'image']
        
        image_ok = all(f in image_fields for f in required_image_fields)
        annotation_ok = all(f in annotation_fields for f in required_annotation_fields)
        
        if image_ok:
            print("  ✓ Image model configured correctly")
        else:
            print("  ✗ Image model missing fields")
        
        if annotation_ok:
            print("  ✓ Annotation model configured correctly")
        else:
            print("  ✗ Annotation model missing fields")
        
        return image_ok and annotation_ok
    except Exception as e:
        print(f"✗ Error checking models: {e}")
        return False


def main():
    """Run all checks"""
    print_header("Image Annotator Backend - Setup Verification")
    
    results = {}
    
    # Python checks
    print("\n▶ Python Environment")
    results['python'] = check_python_version()
    
    # Package checks
    print("\n▶ Installed Packages")
    results['django'] = check_django()
    results['drf'] = check_drf()
    results['cors'] = check_cors()
    results['pillow'] = check_pillow()
    
    # Files checks
    print("\n▶ Project Files")
    results['files'] = check_files()
    
    # Django checks
    print("\n▶ Django Configuration")
    results['admin'] = check_django_admin()
    results['settings'] = check_settings()
    results['models'] = check_models()
    
    # File system checks
    print("\n▶ File System")
    results['database'] = check_database()
    results['media'] = check_media_dir()
    
    # Summary
    print_header("Verification Summary")
    
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    
    for check, result in results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status:8} - {check.replace('_', ' ').title()}")
    
    print(f"\n{'='*60}")
    print(f"Results: {passed}/{total} checks passed")
    print(f"{'='*60}")
    
    if passed == total:
        print("\n✓ All checks passed! Backend is ready to run.")
        print("\nStart the server with:")
        print("  python manage.py runserver")
        return 0
    else:
        failed_checks = [k for k, v in results.items() if not v]
        print(f"\n✗ {len(failed_checks)} check(s) failed:")
        for check in failed_checks:
            print(f"  - {check}")
        print("\nRun setup with:")
        print("  python manage.py migrate")
        return 1


if __name__ == "__main__":
    sys.exit(main())
