'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function signupAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const orgName = formData.get('orgName') as string;

  if (!email || !password || !orgName) {
    return { success: false, error: 'Please fill in all fields.' };
  }

  const orgSlug = orgName.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

  if (!orgSlug) {
    return { success: false, error: 'Please enter a valid workspace name.' };
  }

  const cookieStore = await cookies();

  // Create a server-side Supabase client using service role or standard server client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  try {
    // 1. Check globally if workspace name already exists
    const { data: existingOrg, error: checkError } = await supabase
      .from('user_profiles')
      .select('org_id')
      .eq('org_id', orgSlug)
      .maybeSingle();

    if (existingOrg) {
      return { success: false, error: 'This workspace name is already in use. Please choose a different name.' };
    }

    // 2. Sign up the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    const userId = authData.user?.id;
    if (!userId) {
      return { success: false, error: 'User creation failed to generate a valid ID.' };
    }

    // 3. Insert the user profile
    const { error: profileError } = await supabase.from('user_profiles').insert({
      id: userId,
      role: 'admin',
      org_id: orgSlug,
    });

    if (profileError) {
      if (profileError.code === '23505' || profileError.message?.includes('unique')) {
        return { success: false, error: 'This workspace name is already in use. Please choose a different name.' };
      }
      return { success: false, error: profileError.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected server error occurred.' };
  }
}