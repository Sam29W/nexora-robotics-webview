/**
 * NEXORA Robotics - Client Configuration
 * 
 * Default connection details for Supabase Auth & PostgreSQL, and Backend REST API.
 * Values can also be dynamically configured via the UI settings modal.
 */

window.NEXORA_CONFIG = {
  // Supabase Project Credentials
  SUPABASE_URL: window.localStorage.getItem('nexora_supabase_url') || 'https://zaykcdkpfyybubrylxmv.supabase.co',
  SUPABASE_ANON_KEY: window.localStorage.getItem('nexora_supabase_anon_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpheWtjZGtwZnl5YnVicnlseG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMjgxNjksImV4cCI6MjEwNzkwNDE2OX0.Ysom5Wp2vP_ABdV1FI3HRRyNyntBad-Ykfd5U8fiJxI',

  // Backend API URL (Express + Node.js)
  // Set to deployed backend URL (e.g. Render) or local http://localhost:5000/api
  API_BASE_URL: window.localStorage.getItem('nexora_api_url') || (
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5000/api'
      : 'https://nexora-robotics-backend.onrender.com/api'
  ),

  // Save new configuration to localStorage
  saveConfig(supabaseUrl, supabaseKey, apiUrl) {
    if (supabaseUrl) {
      window.localStorage.setItem('nexora_supabase_url', supabaseUrl.trim());
      this.SUPABASE_URL = supabaseUrl.trim();
    }
    if (supabaseKey) {
      window.localStorage.setItem('nexora_supabase_anon_key', supabaseKey.trim());
      this.SUPABASE_ANON_KEY = supabaseKey.trim();
    }
    if (apiUrl) {
      window.localStorage.setItem('nexora_api_url', apiUrl.trim());
      this.API_BASE_URL = apiUrl.trim();
    }
  },

  // Reset to default
  resetConfig() {
    window.localStorage.removeItem('nexora_supabase_url');
    window.localStorage.removeItem('nexora_supabase_anon_key');
    window.localStorage.removeItem('nexora_api_url');
  }
};
