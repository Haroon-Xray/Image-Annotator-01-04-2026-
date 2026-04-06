import React, { useState } from 'react';
import styles from './InferencePanel.module.css';
import CanvasViewer from './CanvasViewer';

/**
 * InferencePanel Component
 * 
 * Allows users to:
 * 1. Upload an image for inference
 * 2. Run YOLOv8 inference on the image
 * 3. Display detected objects with bounding boxes
 * 4. Adjust confidence and IOU thresholds
 */
const InferencePanel = () => {
   const [imageFile, setImageFile] = useState(null);
   const [imageUrl, setImageUrl] = useState(null);
   const [detections, setDetections] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [processingTime, setProcessingTime] = useState(null);
   const [confidence, setConfidence] = useState(0.5);
   const [iou, setIou] = useState(0.45);

   /**
    * Handle image file selection
    * @param {Event} e - File input event
    */
   const handleImageSelect = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
         setError('Please select a valid image file');
         return;
      }

      setImageFile(file);
      setError(null);

      // Create local preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
         setImageUrl(event.target?.result);
      };
      reader.readAsDataURL(file);

      // Clear previous detections
      setDetections([]);
   };

   /**
   * Helper function to get CSRF token
   */
   const getCsrfToken = () => {
      let csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
      if (!csrfToken) {
         csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];
      }
      if (!csrfToken) {
         csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      }
      return csrfToken;
   };

   /**
    * Run inference on the selected image
    */
   const runInference = async () => {
      if (!imageFile) {
         setError('Please select an image first');
         return;
      }

      setLoading(true);
      setError(null);
      setDetections([]);

      try {
         const formData = new FormData();
         formData.append('image', imageFile);
         formData.append('confidence', confidence);
         formData.append('iou', iou);

         const headers = {};
         const csrfToken = getCsrfToken();
         if (csrfToken) {
            headers['X-CSRFToken'] = csrfToken;
         }

         const response = await fetch('/api/inference/', {
            method: 'POST',
            body: formData,
            headers: headers,
         });

         // Try to parse as JSON, handle HTML error responses
         let data;
         const contentType = response.headers.get('content-type');

         if (contentType && contentType.includes('application/json')) {
            data = await response.json();
         } else {
            const text = await response.text();
            throw new Error(`Server returned ${response.status}: ${text.substring(0, 100)}`);
         }

         if (!response.ok) {
            throw new Error(
               data.message || `Inference failed with status ${response.status}`
            );
         }
         if (!data.success) {
            throw new Error(data.message || 'Inference failed');
         }

         setDetections(data.detections || []);
         setProcessingTime(data.processing_time);
      } catch (err) {
         setError(err.message || 'Failed to run inference');
         console.error('Inference error:', err);
      } finally {
         setLoading(false);
      }
   };

   /**
    * Reset the panel to initial state
    */
   const handleReset = () => {
      setImageFile(null);
      setImageUrl(null);
      setDetections([]);
      setError(null);
      setProcessingTime(null);
   };

   return (
      <div className={styles.inferencePanel}>
         <h2 className={styles.title}>YOLO Inference</h2>

         {/* Image Upload Section */}
         <div className={styles.uploadSection}>
            <label htmlFor="image-input" className={styles.uploadLabel}>
               <input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={loading}
                  className={styles.fileInput}
               />
               <span className={styles.uploadButton}>
                  {imageFile ? '📁 Change Image' : '📁 Select Image'}
               </span>
            </label>
            {imageFile && (
               <div className={styles.fileName}>{imageFile.name}</div>
            )}
         </div>

         {/* Parameters Section */}
         <div className={styles.parametersSection}>
            <div className={styles.parameterGroup}>
               <label htmlFor="confidence-slider">
                  Confidence Threshold: <span>{confidence.toFixed(2)}</span>
               </label>
               <input
                  id="confidence-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={confidence}
                  onChange={(e) => setConfidence(parseFloat(e.target.value))}
                  disabled={loading}
                  className={styles.slider}
               />
            </div>

            <div className={styles.parameterGroup}>
               <label htmlFor="iou-slider">
                  IOU Threshold: <span>{iou.toFixed(2)}</span>
               </label>
               <input
                  id="iou-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={iou}
                  onChange={(e) => setIou(parseFloat(e.target.value))}
                  disabled={loading}
                  className={styles.slider}
               />
            </div>
         </div>

         {/* Buttons Section */}
         <div className={styles.buttonsSection}>
            <button
               onClick={runInference}
               disabled={!imageFile || loading}
               className={`${styles.button} ${styles.runButton}`}
            >
               {loading ? '⏳ Running...' : '🚀 Run Inference'}
            </button>
            <button
               onClick={handleReset}
               disabled={loading || !imageFile}
               className={`${styles.button} ${styles.resetButton}`}
            >
               🔄 Reset
            </button>
         </div>

         {/* Error Message */}
         {error && (
            <div className={styles.error}>
               <span>❌ {error}</span>
            </div>
         )}

         {/* Processing Time */}
         {processingTime !== null && (
            <div className={styles.processingTime}>
               ✓ Processed in {processingTime.toFixed(3)}s
            </div>
         )}

         {/* Image Preview with Canvas Viewer */}
         {imageUrl && (
            <div className={styles.imageSection}>
               <CanvasViewer
                  imageSrc={imageUrl}
                  detections={detections}
                  imageFile={imageFile}
               />
            </div>
         )}

         {/* Detections Summary */}
         {detections.length > 0 && (
            <div className={styles.detectionsSummary}>
               <h3>Detected Objects ({detections.length})</h3>
               <div className={styles.detectionsList}>
                  {detections.map((detection, idx) => (
                     <div key={idx} className={styles.detectionItem}>
                        <div className={styles.detectionLabel}>
                           {detection.label}
                        </div>
                        <div className={styles.detectionConfidence}>
                           {(detection.confidence * 100).toFixed(1)}%
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* No Detections Message */}
         {detections.length === 0 && imageUrl && !loading && !error && (
            <div className={styles.noDetections}>
               No objects detected with current parameters
            </div>
         )}
      </div>
   );
};

export default InferencePanel;
