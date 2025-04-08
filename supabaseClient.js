import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ykxiamrtzkpxccpcbgjp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlreGlhbXJ0emtweGNjcGNiZ2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMjU5NDcsImV4cCI6MjA1OTYwMTk0N30.SODNRvgBnYMr_Q0mA8ifcHlwUObsap-3mOotWjWuPwY'

export const supabase = createClient(supabaseUrl, supabaseKey)