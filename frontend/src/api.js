/**
 * API Service - Axios Configuration & Methods
 * Centralized API calls for Image Annotator Frontend
 */

import axios from 'axios';

// Configure API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Image API Methods
 */
export const imageAPI = {
  // Get all images
  getImages: async (params = {}) => {
    try {
      const response = await api.get('/images/', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch images:', error);
      throw error;
    }
  },

  // Upload new image
  uploadImage: async (file, name = '', description = '') => {
    try {
      const formData = new FormData();
      formData.append('image_file', file);
      formData.append('name', name || file.name);
      if (description) formData.append('description', description);

      const response = await api.post('/images/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw error;
    }
  },

  // Get image details with annotations
  getImage: async (imageId) => {
    try {
      const response = await api.get(`/images/${imageId}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch image:', error);
      throw error;
    }
  },

  // Update image (name, description)
  updateImage: async (imageId, data) => {
    try {
      const response = await api.put(`/images/${imageId}/`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update image:', error);
      throw error;
    }
  },

  // Delete image
  deleteImage: async (imageId) => {
    try {
      await api.delete(`/images/${imageId}/`);
    } catch (error) {
      console.error('Failed to delete image:', error);
      throw error;
    }
  },

  // Export single image as JSON
  exportImage: async (imageId) => {
    try {
      const response = await api.get(`/images/${imageId}/export/`);
      return response.data;
    } catch (error) {
      console.error('Failed to export image:', error);
      throw error;
    }
  },

  // Export multiple images as JSON
  exportBatch: async (imageIds) => {
    try {
      const response = await api.post('/images/batch/export/', {
        image_ids: imageIds,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export batch:', error);
      throw error;
    }
  },

  // Get image statistics
  getStats: async (imageId) => {
    try {
      const response = await api.get(`/images/${imageId}/stats/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      throw error;
    }
  },
};

/**
 * Annotation API Methods
 */
export const annotationAPI = {
  // Get all annotations for an image
  getAnnotations: async (imageId) => {
    try {
      const response = await api.get(`/images/${imageId}/annotations/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch annotations:', error);
      throw error;
    }
  },

  // Create single annotation
  createAnnotation: async (imageId, annotationData) => {
    try {
      const response = await api.post(`/images/${imageId}/annotations/`, annotationData);
      return response.data;
    } catch (error) {
      console.error('Failed to create annotation:', error);
      throw error;
    }
  },

  // Create multiple annotations (batch)
  batchCreateAnnotations: async (imageId, annotations) => {
    try {
      const response = await api.post(`/images/${imageId}/annotations/batch-create/`, {
        annotations,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to batch create annotations:', error);
      throw error;
    }
  },

  // Get single annotation
  getAnnotation: async (imageId, annotationId) => {
    try {
      const response = await api.get(`/images/${imageId}/annotations/${annotationId}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch annotation:', error);
      throw error;
    }
  },

  // Update annotation
  updateAnnotation: async (imageId, annotationId, data) => {
    try {
      const response = await api.put(`/images/${imageId}/annotations/${annotationId}/`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update annotation:', error);
      throw error;
    }
  },

  // Delete annotation
  deleteAnnotation: async (imageId, annotationId) => {
    try {
      await api.delete(`/images/${imageId}/annotations/${annotationId}/`);
    } catch (error) {
      console.error('Failed to delete annotation:', error);
      throw error;
    }
  },

  // Clear all annotations for an image
  clearAnnotations: async (imageId) => {
    try {
      const response = await api.post(`/images/${imageId}/annotations/clear-all/`);
      return response.data;
    } catch (error) {
      console.error('Failed to clear annotations:', error);
      throw error;
    }
  },
};

/**
 * Utility Methods
 */
export const utilityAPI = {
  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/health/');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },
};

// Export configured axios instance for custom requests
export default api;
