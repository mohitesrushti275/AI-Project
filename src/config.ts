export const API_BASE_URL = import.meta.env.PROD 
  ? 'https://apiserver.promptpilot.sharehq.org' // Replace with your actual production backend URL if different
  : 'http://localhost:3000';
