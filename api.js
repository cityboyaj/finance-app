import axios from 'axios';

const API = axios.create({
  baseURL: 'http://192.168.0.215:3000/api', // backend base URL
  headers: { 'Content-Type': 'application/json' }
});

export default API;
