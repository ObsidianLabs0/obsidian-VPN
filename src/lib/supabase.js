import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://shkbgehwllpcifgdknux.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoa2JnZWh3bGxwY2lmZ2RrbnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NDIwNzQsImV4cCI6MjA5NDMxODA3NH0.y0G1BEFNuIHw7N9tUw3Eo-_CV2ccCaj6BeXWpQb0KRc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)