import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Unauthorized request.' }, { status: 401 });
    }

    const { id, isVerified, status } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing record identifier.' }, { status: 400 });
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

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid session.' }, { status: 401 });
    }

    const { error } = await supabase
      .from('expense_logs')
      .update({
        is_verified: isVerified,
        approval_status: status,
      })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Audit update failed.' }, { status: 500 });
  }
}