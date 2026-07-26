import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { email, password, orgName } = await request.json();

    if (!email || !password || !orgName) {
      return NextResponse.json({ success: false, error: 'Please fill in all fields.' }, { status: 400 });
    }

    const orgSlug = orgName.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    if (!orgSlug) {
      return NextResponse.json({ success: false, error: 'Please enter a valid workspace name.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ success: false, error: 'Missing Supabase environment variables.' }, { status: 500 });
    }

    // Use a direct supabase client instance for the API route
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Check globally if workspace name already exists
    const { data: existingOrg, error: checkError } = await supabase
      .from('user_profiles')
      .select('org_id')
      .eq('org_id', orgSlug)
      .maybeSingle();

    if (existingOrg) {
      return NextResponse.json({ 
        success: false, 
        error: 'This workspace name is already in use. Please choose a different name.' 
      }, { status: 400 });
    }

    // 2. Sign up the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json({ success: false, error: authError.message }, { status: 400 });
    }

    const userId = authData.user?.id;
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User creation failed to generate a valid ID.' }, { status: 400 });
    }

    // 3. Insert the user profile
    const { error: profileError } = await supabase.from('user_profiles').insert({
      id: userId,
      role: 'admin',
      org_id: orgSlug,
    });

    if (profileError) {
      if (profileError.code === '23505' || profileError.message?.includes('unique')) {
        return NextResponse.json({ 
          success: false, 
          error: 'This workspace name is already in use. Please choose a different name.' 
        }, { status: 400 });
      }
      return NextResponse.json({ success: false, error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API SIGNUP ERROR:', err);
    return NextResponse.json({ 
      success: false, 
      error: err?.message ? String(err.message) : 'An unexpected server error occurred.' 
    }, { status: 500 });
  }
}