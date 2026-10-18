import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || "https://qteothflfbxlhlrvmeqz.supabase.co";
// Remove sufixo /rest/v1/ e barras finais caso o usuário forneça a URL da API REST
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0ZW90aGZsZmJ4bGhscnZtZXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MTU2NzEsImV4cCI6MjA5MzA5MTY3MX0.f2szMX46FhCWsLNAzdtxZoGc1-rbPxbPYEdLECWNncs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
