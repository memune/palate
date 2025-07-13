-- Add policy to allow users to view their friends' tasting notes
CREATE POLICY "Users can view friends' tasting notes" 
  ON public.tasting_notes FOR SELECT 
  USING (
    user_id IN (
      SELECT friend_id 
      FROM public.friends 
      WHERE user_id = auth.uid()
    )
  );

-- Check if the policy was created successfully
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'tasting_notes' 
ORDER BY policyname;