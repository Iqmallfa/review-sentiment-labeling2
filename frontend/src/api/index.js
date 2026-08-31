import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Sisipkan token JWT otomatis ke setiap request, kalau user sudah login
api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('val_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.access_token) {
          config.headers.Authorization = `Bearer ${userData.access_token}`;
        }
      } catch (e) {
        console.error('Gagal membaca data user tersimpan', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;