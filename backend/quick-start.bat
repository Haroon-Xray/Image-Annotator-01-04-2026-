@echo off
REM Image Annotator Backend - Quick Start (Windows)
REM This script sets up and runs the backend

echo ================================
echo Image Annotator Backend Setup
echo ================================
echo.

REM Check Python version
python --version

REM Create virtual environment
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt

REM Create media directory
if not exist "media\images" (
    mkdir media\images
)
echo. ✓ Media directories created

REM Run migrations
echo Running database migrations...
python manage.py migrate

REM Collect static files
echo Collecting static files...
python manage.py collectstatic --noinput

REM Display instructions
echo.
echo ================================
echo ✓ Setup Complete!
echo ================================
echo.
echo To start the development server, run:
echo   python manage.py runserver
echo.
echo Then access:
echo   - API: http://localhost:8000/api/
echo   - Admin: http://localhost:8000/admin/
echo.
