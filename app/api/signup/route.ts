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

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Globally check if workspace name already exists
    const { data: existingOrg } = await supabase
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

    // 2. Sign up user and pass org_id into metadata for the database trigger
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          org_id: orgSlug,
          role: 'admin',
        },
      },
    });

    if (authError) {
      return NextResponse.json({ success: false, error: authError.message }, { status: 400 });
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