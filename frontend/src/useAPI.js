/**
 * Custom Hook - useAPI
 * Simplifies API calls with loading and error states
 */

import { useState, useCallback } from 'react';
import { imageAPI, annotationAPI, utilityAPI } from './api';

/**
 * Custom hook for API calls with loading and error handling
 * @param {Function} apiFunction - The API function to call
 * @returns {Object} { execute, loading, error, data }
 */
export const useAPI = (apiFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'An error occurred');
        setData(null);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return { execute, loading, error, data };
};

/**
 * Hook for image operations
 */
export const useImages = () => {
  const getImages = useAPI(imageAPI.getImages);
  const uploadImage = useAPI(imageAPI.uploadImage);
  const deleteImage = useAPI(imageAPI.deleteImage);
  const exportImage = useAPI(imageAPI.exportImage);
  const exportBatch = useAPI(imageAPI.exportBatch);

  return {
    getImages,
    uploadImage,
    deleteImage,
    exportImage,
    exportBatch,
  };
};

/**
 * Hook for annotation operations
 */
export const useAnnotations = () => {
  const createAnnotation = useAPI(annotationAPI.createAnnotation);
  const updateAnnotation = useAPI(annotationAPI.updateAnnotation);
  const deleteAnnotation = useAPI(annotationAPI.deleteAnnotation);
  const clearAnnotations = useAPI(annotationAPI.clearAnnotations);
  const batchCreateAnnotations = useAPI(annotationAPI.batchCreateAnnotations);

  return {
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    clearAnnotations,
    batchCreateAnnotations,
  };
};

/**
 * Hook for utility operations
 */
export const useUtility = () => {
  const healthCheck = useAPI(utilityAPI.healthCheck);

  return { healthCheck };
};
