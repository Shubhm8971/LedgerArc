import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const orgId = request.headers.get('X-Org-Id');
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);

    if (!authHeader || !orgId) {
      return NextResponse.json({ success: false, error: 'Missing authorization or organization header.' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return ''; },
          set(name: string, value: string, options: any) {},
          remove(name: string, options: any) {},
        },
      }
    );

    // Verify user session via token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid or expired session.' }, { status: 401 });
    }

    // Fetch expense logs for the specified organization
    const { data, error } = await supabase
      .from('expense_logs')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error.' }, { status: 500 });
  }
}