import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  headers: {
    "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "supersecret123",
  },
});

export default api;
