/**
 * Example API Usage Component
 * Shows how to use axios API with custom hooks in a React component
 */

import React, { useState, useEffect } from 'react';
import { imageAPI, annotationAPI } from './api';

/**
 * Simple example: Upload and manage images
 */
export function ImageUploadExample() {
   const [images, setImages] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   // Fetch images on component mount
   useEffect(() => {
      loadImages();
   }, []);

   const loadImages = async () => {
      try {
         setLoading(true);
         setError(null);
         const data = await imageAPI.getImages();
         setImages(data.results || []);
      } catch (err) {
         setError(err.response?.data?.error || err.message);
      } finally {
         setLoading(false);
      }
   };

   const handleUpload = async (file) => {
      try {
         setLoading(true);
         setError(null);
         const newImage = await imageAPI.uploadImage(file, file.name);
         setImages([newImage, ...images]);
         alert('Image uploaded successfully!');
      } catch (err) {
         setError(err.response?.data?.error || 'Upload failed');
      } finally {
         setLoading(false);
      }
   };

   const handleDelete = async (imageId) => {
      if (!confirm('Delete this image?')) return;

      try {
         setLoading(true);
         setError(null);
         await imageAPI.deleteImage(imageId);
         setImages(images.filter(img => img.id !== imageId));
         alert('Image deleted');
      } catch (err) {
         setError(err.response?.data?.error || 'Delete failed');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div style={{ padding: '20px' }}>
         <h2>Upload Images</h2>

         {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

         <input
            type="file"
            accept="image/*"
            onChange={(e) => {
               const file = e.target.files?.[0];
               if (file) handleUpload(file);
            }}
            disabled={loading}
         />

         {loading && <p>Loading...</p>}

         <h3>Your Images ({images.length})</h3>
         <div>
            {images.map(img => (
               <div key={img.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ccc' }}>
                  <p><strong>{img.name}</strong> ({(img.size / 1024).toFixed(2)} KB)</p>
                  <img src={img.image_url} alt={img.name} style={{ maxWidth: '100px', maxHeight: '100px' }} />
                  <button onClick={() => handleDelete(img.id)}>Delete</button>
               </div>
            ))}
         </div>
      </div>
   );
}

/**
 * Advanced example: Image with annotations
 */
export function ImageAnnotationExample() {
   const [image, setImage] = useState(null);
   const [annotations, setAnnotations] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   // Load image by ID (example: ID = 1)
   useEffect(() => {
      const loadImage = async () => {
         try {
            setLoading(true);
            const data = await imageAPI.getImage(1);
            setImage(data);
            setAnnotations(data.annotations || []);
         } catch (err) {
            setError(err.response?.data?.error || 'Failed to load image');
         } finally {
            setLoading(false);
         }
      };

      loadImage();
   }, []);

   const handleAddAnnotation = async () => {
      if (!image) return;

      try {
         setLoading(true);
         const newAnnotation = await annotationAPI.createAnnotation(image.id, {
            label: `Object ${annotations.length + 1}`,
            x: 10,
            y: 10,
            width: 50,
            height: 50,
         });
         setAnnotations([...annotations, newAnnotation]);
      } catch (err) {
         setError(err.response?.data?.error || 'Failed to create annotation');
      } finally {
         setLoading(false);
      }
   };

   const handleDeleteAnnotation = async (annotationId) => {
      if (!image) return;

      try {
         setLoading(true);
         await annotationAPI.deleteAnnotation(image.id, annotationId);
         setAnnotations(annotations.filter(ann => ann.id !== annotationId));
      } catch (err) {
         setError(err.response?.data?.error || 'Failed to delete annotation');
      } finally {
         setLoading(false);
      }
   };

   const handleExport = async () => {
      if (!image) return;

      try {
         setLoading(true);
         const exportData = await imageAPI.exportImage(image.id);
         // Save as JSON file
         const jsonString = JSON.stringify(exportData, null, 2);
         const blob = new Blob([jsonString], { type: 'application/json' });
         const url = URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = `${image.name}_annotations.json`;
         a.click();
         URL.revokeObjectURL(url);
      } catch (err) {
         setError(err.response?.data?.error || 'Failed to export');
      } finally {
         setLoading(false);
      }
   };

   if (loading && !image) return <div>Loading...</div>;
   if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
   if (!image) return <div>No image found</div>;

   return (
      <div style={{ padding: '20px' }}>
         <h2>{image.name}</h2>
         <img src={image.image_url} alt={image.name} style={{ maxWidth: '400px' }} />

         <div style={{ marginTop: '10px' }}>
            <button onClick={handleAddAnnotation} disabled={loading}>Add Annotation</button>
            <button onClick={handleExport} disabled={loading}>Export as JSON</button>
         </div>

         <h3>Annotations ({annotations.length})</h3>
         <div>
            {annotations.map(ann => (
               <div key={ann.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd' }}>
                  <p><strong>{ann.label}</strong></p>
                  <p>Position: ({ann.x}, {ann.y}) | Size: {ann.width}x{ann.height}</p>
                  <button onClick={() => handleDeleteAnnotation(ann.id)} disabled={loading}>Delete</button>
               </div>
            ))}
         </div>
      </div>
   );
}

/**
 * Hook-based example (Recommended)
 */
export function HookBasedExample() {
   const [imageId, setImageId] = useState(1);
   const [imageData, setImageData] = useState(null);
   const [allAnnotations, setAllAnnotations] = useState([]);

   // Using custom hooks
   const { execute: executeGetImage, loading: getImageLoading, error: getImageError } =
      React.useMemo(() => ({
         execute: async (id) => {
            try {
               const data = await imageAPI.getImage(id);
               setImageData(data);
               setAllAnnotations(data.annotations || []);
               return data;
            } catch (err) {
               console.error('Error:', err);
               throw err;
            }
         },
         loading: false,
         error: null,
      }), []);

   useEffect(() => {
      if (imageId) executeGetImage(imageId);
   }, [imageId, executeGetImage]);

   return (
      <div style={{ padding: '20px' }}>
         <h2>Image {imageId}</h2>

         <input
            type="number"
            value={imageId}
            onChange={(e) => setImageId(Number(e.target.value))}
            min="1"
         />

         {getImageLoading && <p>Loading...</p>}
         {getImageError && <p style={{ color: 'red' }}>Error: {getImageError}</p>}

         {imageData && (
            <div>
               <h3>{imageData.name}</h3>
               <img src={imageData.image_url} alt={imageData.name} style={{ maxWidth: '300px' }} />
               <p>Annotations: {allAnnotations.length}</p>
            </div>
         )}
      </div>
   );
}

export default ImageUploadExample;
