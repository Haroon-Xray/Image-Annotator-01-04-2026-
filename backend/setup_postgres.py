#!/usr/bin/env python
"""
PostgreSQL Database Setup Script
This script creates the database and runs migrations
"""
import os
import subprocess
import sys
from pathlib import Path

# Get environment variables from .env
from dotenv import load_dotenv
load_dotenv()

DB_NAME = os.getenv('DB_NAME', 'image_annotator')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'postgres')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')

print("\n" + "="*50)
print("PostgreSQL Database Setup")
print("="*50 + "\n")

# Step 1: Create database
print(f"Step 1: Creating database '{DB_NAME}'...")
print(f"        Host: {DB_HOST}:{DB_PORT}")
print(f"        User: {DB_USER}\n")

os.environ['PGPASSWORD'] = DB_PASSWORD

# Try to create database via psql
try:
    result = subprocess.run(
        [
            'psql',
            '-h', DB_HOST,
            '-U', DB_USER,
            '-p', DB_PORT,
            '-c', f'CREATE DATABASE {DB_NAME};'
        ],
        capture_output=True,
        text=True,
        timeout=10
    )
    
    if result.returncode == 0 or 'already exists' in result.stderr:
        print("✓ Database created or already exists")
    else:
        print(f"✗ Error: {result.stderr}")
        sys.exit(1)
except Exception as e:
    print(f"✗ Error connecting to PostgreSQL: {e}")
    print("\nMake sure:")
    print(f"  1. PostgreSQL server is running on {DB_HOST}:{DB_PORT}")
    print(f"  2. User '{DB_USER}' exists with correct password")
    print(f"  3. Your .env file has correct DB_PASSWORD")
    sys.exit(1)

# Step 2: Run migrations
print("\nStep 2: Running Django migrations...")
result = subprocess.run(['python', 'manage.py', 'migrate'], capture_output=True, text=True)
if result.returncode == 0:
    print("✓ Migrations completed successfully")
    print(result.stdout)
else:
    print("✗ Migration error:")
    print(result.stderr)
    sys.exit(1)

# Step 3: Create admin user
print("\nStep 3: Creating admin user...")
admin_create_code = """
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Admin user created: admin / admin123')
else:
    print('Admin user already exists')
"""

result = subprocess.run(['python', 'manage.py', 'shell', '-c', admin_create_code], capture_output=True, text=True)
print(result.stdout)

print("\n" + "="*50)
print("Setup Complete!")
print("="*50 + "\n")

print("Next steps:")
print("  1. Run: python manage.py runserver")
print("  2. Visit: http://localhost:8000/admin/")
print("  3. Login: admin / admin123\n")
