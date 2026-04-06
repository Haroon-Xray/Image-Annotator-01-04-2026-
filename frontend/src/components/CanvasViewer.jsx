import React, { useEffect, useRef } from 'react';
import styles from './CanvasViewer.module.css';

/**
 * CanvasViewer Component
 * 
 * Displays an image with bounding boxes and labels drawn on it using HTML5 Canvas
 * 
 * Props:
 * - imageSrc: URL of the image to display
 * - detections: Array of detection objects with bbox and label
 * - imageFile: File object of the image (used to get actual dimensions)
 */
const CanvasViewer = ({ imageSrc, detections, imageFile }) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  /**
   * Generate random color for each detection
   * Ensures different colors for different objects for better visibility
   */
  const getColorForDetection = (index, totalDetections) => {
    const hue = (index / totalDetections) * 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  /**
   * Draw bounding boxes and labels on canvas
   */
  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = new Image();

    image.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = image.width;
      canvas.height = image.height;

      // Draw the image
      ctx.drawImage(image, 0, 0);

      // Draw detections if available
      if (detections && detections.length > 0) {
        detections.forEach((detection, index) => {
          const color = getColorForDetection(index, detections.length);
          drawBBox(ctx, detection, image.width, image.height, color);
        });
      }
    };

    image.src = imageSrc;
  }, [imageSrc, detections]);

  /**
   * Draw a single bounding box with label and confidence
   * 
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} detection - Detection object with bbox and label
   * @param {number} imgWidth - Image width in pixels
   * @param {number} imgHeight - Image height in pixels
   * @param {string} color - Color for the bounding box
   */
  const drawBBox = (ctx, detection, imgWidth, imgHeight, color) => {
    const { label, confidence, bbox } = detection;

    // Convert normalized coordinates to pixel coordinates
    const x = bbox.x * imgWidth - (bbox.width * imgWidth) / 2;
    const y = bbox.y * imgHeight - (bbox.height * imgHeight) / 2;
    const width = bbox.width * imgWidth;
    const height = bbox.height * imgHeight;

    // Set line properties
    const lineWidth = Math.max(2, Math.floor(imgWidth / 320));
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    // Draw rectangle
    ctx.strokeRect(x, y, width, height);

    // Draw label background
    const fontSize = Math.max(12, Math.floor(imgWidth / 80));
    const text = `${label} ${(confidence * 100).toFixed(1)}%`;
    ctx.font = `bold ${fontSize}px Arial`;
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width + 8;
    const textHeight = fontSize + 6;

    // Label background
    ctx.fillStyle = color;
    ctx.fillRect(x, y - textHeight - 4, textWidth, textHeight);

    // Label text
    ctx.fillStyle = 'white';
    ctx.textBaseline = 'top';
    ctx.fillText(text, x + 4, y - fontSize - 2);

    ctx.shadowColor = 'transparent';
  };

  return (
    <div className={styles.canvasViewerContainer}>
      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          title="Detection results with bounding boxes"
        />
      </div>
    </div>
  );
};

export default CanvasViewer;
