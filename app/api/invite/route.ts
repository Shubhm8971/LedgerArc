import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const orgId = request.headers.get('X-Org-Id');

    if (!authHeader || !orgId) {
      return NextResponse.json({ success: false, error: 'Missing authorization or organization header.' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Initialize Supabase Admin Client using service role key for user invitations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // Verify session of the requesting admin
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized session.' }, { status: 401 });
    }

    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json({ success: false, error: 'Email and role are required.' }, { status: 400 });
    }

    // Validate role tier
    if (!['admin', 'accountant', 'member'].includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid role tier specified.' }, { status: 400 });
    }

    // Invite user via Supabase Auth Admin API
    const { data, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        org_id: orgId,
        role: role,
      },
    });

    if (inviteError) {
      return NextResponse.json({ success: false, error: inviteError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error.' }, { status: 500 });
  }
}