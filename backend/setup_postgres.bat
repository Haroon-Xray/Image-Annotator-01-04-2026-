@echo off
REM Setup PostgreSQL Database for Image Annotator

echo.
echo ====================================
echo PostgreSQL Database Setup
echo ====================================
echo.

REM Set PostgreSQL password in environment (use your actual password)
set PGPASSWORD=Haroonrasheed@123

echo Creating database image_annotator...
psql -U postgres -h localhost -c "CREATE DATABASE image_annotator;" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Database created successfully.
) else (
    echo Database already exists or error creating it.
)

echo.
echo Running migrations...
python manage.py migrate

echo.
echo Creating admin user...
python manage.py shell -c "from django.contrib.auth.models import User; User.objects.create_superuser('admin', 'admin@example.com', 'admin123') if not User.objects.filter(username='admin').exists() else print('Admin user already exists')"

echo.
echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo Next steps:
echo 1. Run: python manage.py runserver
echo 2. Visit: http://localhost:8000/admin/
echo 3. Login with: admin / admin123
echo.
pause
