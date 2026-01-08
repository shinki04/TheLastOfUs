-- Migration: Setup Messages Storage (20260107000000)
-- Description: Creates 'messages' bucket and sets up RLS policies for secure file sharing in conversations.

-- 1. Create Bucket
-- We create a private bucket with a 2GB file size limit
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'messages',
  'messages',
  false, -- private bucket
  2147483648, -- 2GB limit (bytes)
  NULL -- allow all mime types
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  public = EXCLUDED.public;

-- 2. Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- We use the folder structure: messages/{conversation_id}/{filename}
-- Access control relies on the conversation_id extracted from the path

-- 3.1 SELECT (Download/View)
-- Allowed if user is admin OR member of the conversation
DROP POLICY IF EXISTS "Messages Select Policy" ON storage.objects;

CREATE POLICY "Messages Select Policy" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'messages'
  AND (
    -- Admin access
    public.func_is_admin()
    OR
    (
      -- Validate path structure to prevent invalid casting: uuid/filename
      name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.*$'
      AND
      -- Check membership using the UUID from the folder name
      public.func_is_conversation_member(
        (storage.foldername(name))[1]::uuid,
        auth.uid()
      )
    )
  )
);

-- 3.2 INSERT (Upload)
-- Allowed if user is member of the conversation
DROP POLICY IF EXISTS "Messages Insert Policy" ON storage.objects;

CREATE POLICY "Messages Insert Policy" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'messages'
  AND (
    -- Validate path structure
    name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.*$'
    AND
    -- Check membership
    public.func_is_conversation_member(
      (storage.foldername(name))[1]::uuid,
      auth.uid()
    )
  )
);

-- 3.3 UPDATE
-- Only owner can update their own files (e.g. metadata)
DROP POLICY IF EXISTS "Messages Update Policy" ON storage.objects;

CREATE POLICY "Messages Update Policy" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'messages' 
  AND owner = auth.uid()
  AND (
    name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.*$'
    AND
    public.func_is_conversation_member(
      (storage.foldername(name))[1]::uuid,
      auth.uid()
    )
  )
);

-- 3.4 DELETE
-- Owner can delete, or Moderators/Admins of the conversation
DROP POLICY IF EXISTS "Messages Delete Policy" ON storage.objects;

CREATE POLICY "Messages Delete Policy" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'messages'
  AND (
    public.func_is_admin()
    OR
    (
      name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.*$'
      AND
      public.func_is_conversation_member(
        (storage.foldername(name))[1]::uuid,
        auth.uid()
      )
      AND
      (
        owner = auth.uid() -- Owner
        OR
        public.func_can_moderate_conversation((storage.foldername(name))[1]::uuid) -- Moderator
      )
    )
  )
);
