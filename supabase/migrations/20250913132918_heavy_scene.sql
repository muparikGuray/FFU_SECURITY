/*
# Fix Foreign Key References

This migration fixes incorrect foreign key references in the database schema.
Several tables were incorrectly referencing `public.users` which doesn't exist.
This updates them to reference the correct tables (`auth.users` via `public.profiles`).

## Changes Made
1. Drop incorrect foreign key constraints
2. Recreate foreign key constraints with correct references
3. Ensure all user-related tables properly reference profiles table
*/

-- Drop incorrect foreign key constraints
ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS chats_user_id_fkey;
ALTER TABLE public.firewall_rules DROP CONSTRAINT IF EXISTS firewall_rules_user_id_fkey;
ALTER TABLE public.security_alerts DROP CONSTRAINT IF EXISTS security_alerts_user_id_fkey;
ALTER TABLE public.dictionary_terms DROP CONSTRAINT IF EXISTS dictionary_terms_user_id_fkey;

-- Add correct foreign key constraints
-- These tables should reference profiles.id since profiles.id = auth.users.id
ALTER TABLE public.chats ADD CONSTRAINT chats_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.firewall_rules ADD CONSTRAINT firewall_rules_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.security_alerts ADD CONSTRAINT security_alerts_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.dictionary_terms ADD CONSTRAINT dictionary_terms_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Also fix the files table user_id reference
ALTER TABLE public.files DROP CONSTRAINT IF EXISTS files_user_id_fkey;
ALTER TABLE public.files ADD CONSTRAINT files_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Fix service_connections table user_id reference  
ALTER TABLE public.service_connections DROP CONSTRAINT IF EXISTS service_connections_user_id_fkey;
ALTER TABLE public.service_connections ADD CONSTRAINT service_connections_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;