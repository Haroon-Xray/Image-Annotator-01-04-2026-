# Frontend Axios Integration - Quick Reference

## What Was Added

✅ **src/api.js** - Axios configuration and API methods  
✅ **src/useAPI.js** - Custom React hooks  
✅ **src/examples.jsx** - Example components  
✅ **.env.example** - Environment variables template  
✅ **AXIOS_SETUP.md** - Detailed setup guide  

## Installation

```bash
npm install
```

Axios is already in package.json dependencies.

## Setup Environment

Create `.env` in frontend folder:
```env
VITE_API_URL=http://localhost:8000/api
VITE_BACKEND_URL=http://localhost:8000
```

## Quick Start - 3 Ways to Use

### Method 1: Import API Service Directly (Simple)

```javascript
import { imageAPI, annotationAPI } from './api';

// Upload image
const image = await imageAPI.uploadImage(file, 'My Image');

// Create annotation
const annotation = await annotationAPI.createAnnotation(imageId, {
  label: 'Object',
  x: 10,
  y: 20,
  width: 100,
  height: 150,
});
```

### Method 2: Use Custom Hooks (Recommended for React)

```javascript
import { useImages, useAnnotations } from './useAPI';

function MyComponent() {
  const { uploadImage } = useImages();
  const { createAnnotation } = useAnnotations();

  const handleUpload = async (file) => {
    try {
      const image = await uploadImage.execute(file);
      console.log('Success:', image);
    } catch (error) {
      console.error('Error:', uploadImage.error);
    }
  };

  return (
    <div>
      {uploadImage.loading && <p>Uploading...</p>}
      {uploadImage.error && <p>Error: {uploadImage.error}</p>}
      <button onClick={() => handleUpload(file)}>Upload</button>
    </div>
  );
}
```

### Method 3: Raw Axios Instance

```javascript
import api from './api';

// For custom requests
const response = await api.get('/images/');
const data = await api.post('/images/', formData);
```

## Available Methods

### Image API

```javascript
imageAPI.getImages(params)           // List images
imageAPI.uploadImage(file, name)     // Upload
imageAPI.getImage(id)                // Get details
imageAPI.updateImage(id, data)       // Update
imageAPI.deleteImage(id)             // Delete
imageAPI.exportImage(id)             // Export JSON
imageAPI.exportBatch(ids)            // Batch export
imageAPI.getStats(id)                // Statistics
```

### Annotation API

```javascript
annotationAPI.getAnnotations(imageId)     // List
annotationAPI.createAnnotation(imgId, data)   // Create
annotationAPI.batchCreateAnnotations(imgId, arr) // Batch
annotationAPI.updateAnnotation(imgId, annId, data) // Update
annotationAPI.deleteAnnotation(imgId, annId) // Delete
annotationAPI.clearAnnotations(imageId)   // Clear all
```

## Custom Hooks

Each hook returns: `{ execute, loading, error, data }`

```javascript
const { uploadImage } = useImages();

uploadImage.execute(file)     // Call function
uploadImage.loading          // Boolean - is loading
uploadImage.error            // String - error message
uploadImage.data             // Object - result data
```

## Error Handling

```javascript
import { imageAPI } from './api';

try {
  const image = await imageAPI.uploadImage(file);
  console.log('Success:', image);
} catch (error) {
  // Error structure:
  error.response.status       // HTTP status
  error.response.data.error   // Backend error message
  error message               // Generic message
}
```

## Example: Upload with Progress

```javascript
import React, { useState } from 'react';
import { imageAPI } from './api';

function UploadForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      const image = await imageAPI.uploadImage(file, file.name);
      alert(`Uploaded: ${image.name}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={loading}
      />
      {loading && <p>Uploading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default UploadForm;
```

## Example: Fetch and Display Images

```javascript
import React, { useState, useEffect } from 'react';
import { useImages } from './useAPI';

function ImageList() {
  const [images, setImages] = useState([]);
  const { getImages } = useImages();

  useEffect(() => {
    const loadImages = async () => {
      try {
        const data = await getImages.execute();
        setImages(data.results || []);
      } catch (error) {
        console.error('Failed to load:', getImages.error);
      }
    };

    loadImages();
  }, []);

  return (
    <div>
      {images.map(img => (
        <div key={img.id}>
          <h3>{img.name}</h3>
          <img src={img.image_url} alt={img.name} style={{ maxWidth: '200px' }} />
        </div>
      ))}
    </div>
  );
}

export default ImageList;
```

## Troubleshooting

### CORS Error
```
Access to XMLHttpRequest blocked by CORS
```
✓ Make sure backend is running  
✓ Check `.env` VITE_API_URL is correct  
✓ Check backend CORS_ALLOWED_ORIGINS includes frontend URL

### 404 Not Found
```
GET http://localhost:8000/api/images/ 404
```
✓ Backend not running? Start with `python manage.py runserver`  
✓ Check API URL in `.env`  
✓ Health check: `curl http://localhost:8000/api/health/`

### Import Errors
```
Cannot find module './api'
```
✓ Make sure files are in `src/` folder  
✓ Check file paths in imports  
✓ Run `npm install` to install axios

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| VITE_API_URL | http://localhost:8000/api | API endpoint |
| VITE_BACKEND_URL | http://localhost:8000 | Backend base |
| VITE_ENV | development | Environment |
| VITE_API_TIMEOUT | 30000 | Timeout (ms) |

## File Locations

```
frontend/
├── src/
│   ├── api.js                    ← API service with all methods
│   ├── useAPI.js                 ← Custom React hooks
│   ├── examples.jsx              ← Example components
│   └── App.jsx                   ← Your main app
├── .env                          ← Environment variables (create this)
├── .env.example                  ← Template
└── AXIOS_SETUP.md               ← Detailed guide
```

## Next Steps

1. Create `.env` file with API URL
2. Import and use API in your components
3. Remove old fetch() calls if any
4. Test with running backend: `python manage.py runserver`
5. Check network tab in DevTools for requests

## Support

See **AXIOS_SETUP.md** for detailed documentation with more examples.

---

**Happy coding!** 🚀
