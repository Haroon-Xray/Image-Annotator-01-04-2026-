# Frontend Integration with Axios

## Setup Complete! ✅

Your frontend now has axios configured for API calls.

### Files Added

1. **src/api.js** - Axios service with all API methods
2. **src/useAPI.js** - Custom React hooks for API calls
3. **.env.example** - Environment variables template

### Installation

```bash
cd frontend
npm install
```

This will install axios automatically (added to package.json).

### Configuration

Create a `.env` file in the frontend folder:

```env
VITE_API_URL=http://localhost:8000/api
VITE_BACKEND_URL=http://localhost:8000
```

### Usage in Components

#### Using API Service Directly

```javascript
import { imageAPI, annotationAPI } from './src/api';

// Upload image
const uploadImage = async (file) => {
  try {
    const response = await imageAPI.uploadImage(file, 'My Image');
    console.log('Uploaded:', response);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

// Create annotation
const createAnnotation = async (imageId) => {
  try {
    const response = await annotationAPI.createAnnotation(imageId, {
      label: 'Object 1',
      x: 10,
      y: 20,
      width: 100,
      height: 150,
    });
    console.log('Created:', response);
  } catch (error) {
    console.error('Creation failed:', error);
  }
};
```

#### Using Custom Hooks (Recommended)

```javascript
import { useImages, useAnnotations } from './src/useAPI';

function MyComponent() {
  const { uploadImage } = useImages();
  const { createAnnotation } = useAnnotations();

  const handleUpload = async (file) => {
    try {
      const image = await uploadImage.execute(file, 'My Image');
      console.log('Uploaded:', image);
    } catch (error) {
      console.error('Upload failed:', uploadImage.error);
    }
  };

  return (
    <div>
      {uploadImage.loading && <p>Uploading...</p>}
      {uploadImage.error && <p>Error: {uploadImage.error}</p>}
      <button onClick={() => handleUpload(file)}>Upload Image</button>
    </div>
  );
}
```

### Available API Methods

#### Image Operations

```javascript
import { imageAPI } from './src/api';

// List all images
imageAPI.getImages({ search: 'keyword', page: 1 })

// Upload image
imageAPI.uploadImage(file, 'Image Name', 'Description')

// Get image details
imageAPI.getImage(imageId)

// Update image
imageAPI.updateImage(imageId, { name: 'New Name' })

// Delete image
imageAPI.deleteImage(imageId)

// Export as JSON
imageAPI.exportImage(imageId)

// Export multiple images
imageAPI.exportBatch([imageId1, imageId2])

// Get statistics
imageAPI.getStats(imageId)
```

#### Annotation Operations

```javascript
import { annotationAPI } from './src/api';

// Get all annotations for image
annotationAPI.getAnnotations(imageId)

// Create annotation
annotationAPI.createAnnotation(imageId, {
  label: 'Object',
  x: 10,
  y: 20,
  width: 100,
  height: 150,
})

// Create multiple annotations
annotationAPI.batchCreateAnnotations(imageId, [
  { label: 'Obj 1', x: 10, y: 20, width: 100, height: 150 },
  { label: 'Obj 2', x: 200, y: 250, width: 80, height: 120 },
])

// Get single annotation
annotationAPI.getAnnotation(imageId, annotationId)

// Update annotation
annotationAPI.updateAnnotation(imageId, annotationId, {
  label: 'Updated',
  x: 20,
  y: 30,
})

// Delete annotation
annotationAPI.deleteAnnotation(imageId, annotationId)

// Clear all annotations
annotationAPI.clearAnnotations(imageId)
```

#### Utility Operations

```javascript
import { utilityAPI } from './src/api';

// Health check
utilityAPI.healthCheck()
```

### Error Handling

All API methods include error handling:

```javascript
try {
  const image = await imageAPI.uploadImage(file);
  console.log('Success:', image);
} catch (error) {
  console.error('Error:', error.response?.data?.error || error.message);
  // error.response.status - HTTP status code
  // error.response.data - Error details from backend
  // error.message - Error message
}
```

### Complete Example Component

```javascript
import React, { useState, useEffect } from 'react';
import { useImages, useAnnotations } from './useAPI';

function AnnotationApp() {
  const { uploadImage, getImages, deleteImage } = useImages();
  const { createAnnotation, clearAnnotations } = useAnnotations();
  const [images, setImages] = useState([]);

  // Fetch images on mount
  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const data = await imageAPI.getImages();
      setImages(data.results || []);
    } catch (error) {
      console.error('Failed to load images:', error);
    }
  };

  const handleUpload = async (file) => {
    try {
      const image = await uploadImage.execute(file, file.name);
      setImages([...images, image]);
      alert('Image uploaded successfully!');
    } catch (error) {
      alert('Upload failed: ' + uploadImage.error);
    }
  };

  const handleDelete = async (imageId) => {
    try {
      await deleteImage.execute(imageId);
      setImages(images.filter(img => img.id !== imageId));
      alert('Image deleted');
    } catch (error) {
      alert('Delete failed: ' + deleteImage.error);
    }
  };

  const handleAddAnnotation = async (imageId) => {
    try {
      const annotation = await createAnnotation.execute(imageId, {
        label: 'New Object',
        x: 10,
        y: 10,
        width: 50,
        height: 50,
      });
      alert('Annotation created: ' + annotation.label);
    } catch (error) {
      alert('Failed to create annotation: ' + createAnnotation.error);
    }
  };

  return (
    <div>
      <h1>Image Annotator</h1>
      
      {/* Upload Section */}
      <div>
        <h2>Upload Image</h2>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
        {uploadImage.loading && <p>Uploading...</p>}
      </div>

      {/* Images List */}
      <div>
        <h2>My Images</h2>
        {images.map((img) => (
          <div key={img.id}>
            <p>{img.name}</p>
            <button onClick={() => handleAddAnnotation(img.id)}>
              Add Annotation
            </button>
            <button onClick={() => handleDelete(img.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AnnotationApp;
```

### Environment Variables

Set these in your `.env` file:

```env
VITE_API_URL=http://localhost:8000/api          # API endpoint
VITE_BACKEND_URL=http://localhost:8000          # Backend base URL
VITE_ENV=development                             # Environment
VITE_API_TIMEOUT=30000                           # Timeout (ms)
```

### Running the Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Troubleshooting

#### CORS Errors
If you see CORS errors in the browser:
1. Make sure backend is running at http://localhost:8000
2. Check CORS_ALLOWED_ORIGINS in backend settings.py includes your frontend URL
3. Restart backend if you made changes

#### API Not Responding
1. Verify backend is running: Access http://localhost:8000/api/health/
2. Check API_URL in vite.config.js or .env file
3. Check network tab in browser DevTools

#### Import Errors
Make sure you're importing from the correct files:
```javascript
// API service
import { imageAPI, annotationAPI } from './api';

// Custom hooks
import { useImages, useAnnotations } from './useAPI';
```

### Next Steps

1. Update your App.jsx to use the new axios API
2. Replace fetch() calls with imageAPI and annotationAPI methods
3. Use custom hooks for cleaner component code
4. Test with the running backend

For more information, see the main documentation: [FRONTEND_INTEGRATION.md](../FRONTEND_INTEGRATION.md)
