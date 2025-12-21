-- POLICY: Allow admins to delete profiles
-- Note: 'admin' role check depends on how you implement roles. 
-- Assuming a simplified checks or using the app_metadata/user_metadata.
-- For safety in this MVP, we might allow authenticated users to delete ONLY if they meet certain criteria, 
-- or for this debugging phase, allow authenticated users to delete (use with caution).

-- OPTION 1: Generic Delete for Authenticated (Development only!)
create policy "Authenticated users can delete profiles." on profiles for delete using (auth.role() = 'authenticated');

-- OPTION 2: Admin only (Recommended if you have an is_admin function or claim)
-- create policy "Admins can delete profiles." on profiles for delete using (
--   auth.jwt() ->> 'role' = 'admin' OR 
--   exists (select 1 from profiles where id = auth.uid() and role = 'admin')
-- );
