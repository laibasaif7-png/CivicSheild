// File: src/api.js
import axios from 'axios';

const baseURL = import.meta.env.DEV ? 'http://localhost:8080' : 'https://civicsheild.onrender.com';

const api = axios.create({
  baseURL,
});

export default api;