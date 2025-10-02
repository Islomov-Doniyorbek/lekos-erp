import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://qarqurifvembpmnjigkl.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhcnF1cmlmdmVtYnBtbmppZ2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3Mjg0NDEsImV4cCI6MjA3MDMwNDQ0MX0.2mqxxUxY2BE5UGfYv7FxLgOIUObGlmKhDsbDO48Jztk"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)