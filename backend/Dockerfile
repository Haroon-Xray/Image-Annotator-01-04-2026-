# Use Python 3.11 slim image as base
FROM python:3.12

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file first (for better layer caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy entire backend application
COPY . .

# Create necessary directories
RUN mkdir -p media staticfiles

# Collect static files
RUN python manage.py collectstatic --noinput --clear || true

# Expose port 8000 for Django development server
EXPOSE 8000

# Default command: run Django development server
# Using 0.0.0.0 to accept connections from outside the container
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
