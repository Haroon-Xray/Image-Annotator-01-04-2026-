import React, { useState, useMemo } from 'react';
import styles from './InferencePanel.module.css';
import CanvasViewer from './CanvasViewer';

/**
 * InferencePanel Component
 * 
 * Allows users to:
 * 1. Select an image from the annotated dataset
 * 2. Run YOLOv8 inference on the selected image
 * 3. Display detected objects with bounding boxes
 * 4. Adjust confidence and IOU thresholds
 */
const InferencePanel = ({ images = [], annotations = {}, activeImageId = null, onSelectImage = () => { } }) => {
   const [selectedDatasetImageId, setSelectedDatasetImageId] = useState(null);
   const [detections, setDetections] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [processingTime, setProcessingTime] = useState(null);
   const [confidence, setConfidence] = useState(0.5);
   const [iou, setIou] = useState(0.45);

   // Filter images to show only those from the dataset (numeric IDs) with annotations
   const datasetImages = useMemo(() => {
      return images.filter(img =>
         typeof img.id === 'number' && // Only database images
         (annotations[img.id]?.length || 0) > 0 // Must have annotations
      );
   }, [images, annotations]);

   // Get currently selected image
   const selectedImage = useMemo(() => {
      const imageId = selectedDatasetImageId || activeImageId;
      return datasetImages.find(img => img.id === imageId);
   }, [selectedDatasetImageId, activeImageId, datasetImages]);

   const handleImageSelect = (imageId) => {
      setSelectedDatasetImageId(imageId);
      onSelectImage(imageId);
      setDetections([]);
      setError(null);
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
    * Run inference on the selected dataset image
    */
   const runInference = async () => {
      if (!selectedImage) {
         setError('Please select an image from the dataset first');
         return;
      }

      setLoading(true);
      setError(null);
      setDetections([]);

      try {
         const csrfToken = getCsrfToken();
         const headers = {
            'Content-Type': 'application/json',
         };
         if (csrfToken) {
            headers['X-CSRFToken'] = csrfToken;
         }

         const response = await fetch('/api/inference/', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
               image_id: selectedImage.id,
               confidence: confidence,
               iou: iou,
            }),
         });

         let data;
         const contentType = response.headers.get('content-type');

         if (contentType && contentType.includes('application/json')) {
            data = await response.json();
         } else {
            const text = await response.text();
            throw new Error(`Server error ${response.status}: ${text.substring(0, 100)}`);
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
      setSelectedDatasetImageId(null);
      setDetections([]);
      setError(null);
      setProcessingTime(null);
   };

   // Show message if no dataset images available
   if (datasetImages.length === 0) {
      return (
         <div className={styles.inferencePanel}>
            <h2 className={styles.title}>🤖 YOLO Inference</h2>
            <div className={styles.emptyState}>
               <p>📊 No images with annotations found</p>
               <p className={styles.emptyStateSubtext}>
                  Please go to the Annotate tab to:
               </p>
               <ol className={styles.instructions}>
                  <li>Upload images</li>
                  <li>Draw bounding boxes around objects</li>
                  <li>Return here to run inference</li>
               </ol>
            </div>
         </div>
      );
   }

   return (
      <div className={styles.inferencePanel}>
         <h2 className={styles.title}>🤖 YOLO Inference</h2>
         <p className={styles.subtitle}>Select annotated image from dataset and run detection</p>

         {/* Dataset Image Selection Section */}
         <div className={styles.selectionSection}>
            <label htmlFor="dataset-image-select" className={styles.label}>
               📸 Select Image from Dataset ({datasetImages.length} available)
            </label>
            <select
               id="dataset-image-select"
               value={selectedImage?.id || ''}
               onChange={(e) => handleImageSelect(Number(e.target.value))}
               disabled={loading}
               className={styles.select}
            >
               <option value="">-- Choose an image --</option>
               {datasetImages.map(img => (
                  <option key={img.id} value={img.id}>
                     {img.name} ({annotations[img.id]?.length || 0} boxes)
                  </option>
               ))}
            </select>
            {selectedImage && (
               <div className={styles.selectedInfo}>
                  ✓ Selected: <strong>{selectedImage.name}</strong>
                  <br />
                  Annotations: <span className={styles.annotationCount}>
                     {annotations[selectedImage.id]?.length || 0} boxes
                  </span>
               </div>
            )}
         </div>

         {/* Parameters Section */}
         <div className={styles.parametersSection}>
            <div className={styles.parameterGroup}>
               <label htmlFor="confidence-slider">
                  Confidence Threshold: <span className={styles.value}>{confidence.toFixed(2)}</span>
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
               <div className={styles.hint}>Lower = more detections, Higher = fewer, more confident</div>
            </div>

            <div className={styles.parameterGroup}>
               <label htmlFor="iou-slider">
                  IOU Threshold: <span className={styles.value}>{iou.toFixed(2)}</span>
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
               <div className={styles.hint}>Lower = removes more overlapping boxes, Higher = keeps more</div>
            </div>
         </div>

         {/* Buttons Section */}
         <div className={styles.buttonsSection}>
            <button
               onClick={runInference}
               disabled={!selectedImage || loading}
               className={`${styles.button} ${styles.runButton}`}
            >
               {loading ? '⏳ Running inference...' : '🚀 Run Inference'}
            </button>
            <button
               onClick={handleReset}
               disabled={loading}
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
         {selectedImage && (
            <div className={styles.imageSection}>
               <h3 className={styles.previewTitle}>Detection Results</h3>
               <CanvasViewer
                  imageSrc={selectedImage.url}
                  detections={detections}
               />
            </div>
         )}

         {/* Detections Summary */}
         {detections.length > 0 && (
            <div className={styles.detectionsSummary}>
               <h3>🎯 Detected Objects ({detections.length})</h3>
               <div className={styles.detectionsList}>
                  {detections.map((detection, idx) => (
                     <div key={idx} className={styles.detectionItem}>
                        <span className={styles.detectionLabel}>
                           {detection.label}
                        </span>
                        <span className={styles.detectionConfidence}>
                           {(detection.confidence * 100).toFixed(1)}%
                        </span>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* No Detections Message */}
         {detections.length === 0 && selectedImage && !loading && !error && processingTime !== null && (
            <div className={styles.noDetections}>
               ⭕ No objects detected with current parameters
            </div>
         )}
      </div>
   );
};

export default InferencePanel;
