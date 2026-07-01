import axios from "axios";

const RENDER_BASE = process.env.RENDER_BASE_URL || "https://api.render.com/v1";
const RENDER_API_KEY = process.env.RENDER_API_KEY || "";

export const renderClient = axios.create({
  baseURL: RENDER_BASE,
  headers: {
    Authorization: `Bearer ${RENDER_API_KEY}`,
    "Content-Type": "application/json",
  },
});
