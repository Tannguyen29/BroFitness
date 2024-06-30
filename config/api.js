import axios from 'axios';

const API_URL = 'http://192.168.1.55:5000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
