import axios from 'axios'

const API_BASE_URL = process.env.NODE_ENV === 'production'
   ? window.location.origin + '/api'
   : 'http://localhost:8000/api'

const api = axios.create({
   baseURL: API_BASE_URL,
   headers: {
      'Content-Type': 'application/json',
   },
})

// Interceptor to add CSRF token for POST/PUT/DELETE requests
api.interceptors.request.use((config) => {
   if (['post', 'put', 'delete'].includes(config.method?.toLowerCase())) {
      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value ||
         document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1]
      if (csrfToken) {
         config.headers['X-CSRFToken'] = csrfToken
      }
   }
   return config
})

api.interceptors.response.use(
   response => response,
   error => {
      if (error.response?.status === 401) {
         window.location.href = '/login'
      }
      return Promise.reject(error)
   }
)

export default api
