#!/bin/bash

# Image Annotator Backend - Quick Start (Linux/macOS)
# This script sets up and runs the backend

set -e  # Exit on error

echo "================================"
echo "Image Annotator Backend Setup"
echo "================================"

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | grep -oP '\d+\.\d+')
echo "✓ Python $PYTHON_VERSION detected"

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create media directory
mkdir -p media/images
echo "✓ Media directories created"

# Run migrations
echo "Running database migrations..."
python manage.py migrate

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Display instructions
echo ""
echo "================================"
echo "✓ Setup Complete!"
echo "================================"
echo ""
echo "To start the development server, run:"
echo "  python manage.py runserver"
echo ""
echo "Then access:"
echo "  • API: http://localhost:8000/api/"
echo "  • Admin: http://localhost:8000/admin/"
echo ""
