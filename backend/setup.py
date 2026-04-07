#!/usr/bin/env python
"""
Quick setup script for the Image Annotator Backend
This script automates the initial setup process
"""
import os
import sys
import subprocess
import platform

def run_command(cmd, description):
    """Run a shell command and handle errors"""
    print(f"\n{'='*60}")
    print(f"▶ {description}")
    print(f"{'='*60}")
    print(f"Running: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, check=True)
        print(f"✓ {description} - SUCCESS")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {description} - FAILED")
        print(f"Error: {e}")
        return False

def main():
    """Main setup function"""
    print("\n" + "="*60)
    print("Image Annotator Backend - Quick Setup")
    print("="*60)
    
    # Detect OS
    system = platform.system()
    is_windows = system == "Windows"
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ is required!")
        print(f"Your version: {sys.version}")
        sys.exit(1)
    
    print(f"✓ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Step 1: Create virtual environment
    venv_path = "venv"
    if not os.path.exists(venv_path):
        if run_command([sys.executable, "-m", "venv", venv_path], "Creating virtual environment"):
            pass
        else:
            return
    else:
        print(f"✓ Virtual environment already exists at {venv_path}")
    
    # Determine pip command
    if is_windows:
        pip_cmd = os.path.join(venv_path, "Scripts", "pip")
        python_cmd = os.path.join(venv_path, "Scripts", "python")
    else:
        pip_cmd = os.path.join(venv_path, "bin", "pip")
        python_cmd = os.path.join(venv_path, "bin", "python")
    
    # Step 2: Install dependencies
    if run_command([pip_cmd, "install", "--upgrade", "pip"], "Upgrading pip"):
        pass
    else:
        return
    
    if run_command([pip_cmd, "install", "-r", "requirements.txt"], "Installing dependencies"):
        pass
    else:
        return
    
    # Step 3: Create .env file if it doesn't exist
    if not os.path.exists(".env"):
        print("\n" + "="*60)
        print("▶ Creating .env file")
        print("="*60)
        try:
            with open(".env.example", "r") as src:
                with open(".env", "w") as dst:
                    dst.write(src.read())
            print("✓ .env file created from .env.example")
        except Exception as e:
            print(f"✗ Failed to create .env file: {e}")
    
    # Step 4: Create media directories
    os.makedirs("media/images", exist_ok=True)
    print("✓ Media directories created")
    
    # Step 5: Run migrations
    if run_command([python_cmd, "manage.py", "migrate"], "Running database migrations"):
        pass
    else:
        return
    
    # Step 6: Create superuser
    print("\n" + "="*60)
    print("▶ Create Admin User")
    print("="*60)
    print("Enter credentials for admin account:")
    
    try:
        subprocess.run([python_cmd, "manage.py", "createsuperuser"], check=True)
    except subprocess.CalledProcessError:
        print("⚠ Skipped superuser creation")
    
    # Final message
    print("\n" + "="*60)
    print("✓ SETUP COMPLETE!")
    print("="*60)
    print(f"""
To start the development server, run:

    python manage.py runserver

Or with venv activated directly:

    {python_cmd} manage.py runserver

Then access:
  • API: http://localhost:8000/api/
  • Admin: http://localhost:8000/admin/
  • Health: http://localhost:8000/api/health/

For more information, see backenddoc.md
""")

if __name__ == "__main__":
    main()
