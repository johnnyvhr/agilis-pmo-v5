-- 1. Primeiro remove a política antiga se ela existir (evita o erro 42710)
DROP POLICY IF EXISTS "Authenticated users can delete profiles." ON public.profiles;

-- 2. Agora cria a política limpa
CREATE POLICY "Authenticated users can delete profiles."
ON public.profiles
FOR DELETE
USING (auth.role() = 'authenticated');