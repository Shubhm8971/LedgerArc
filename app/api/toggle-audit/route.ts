import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Unauthorized request.' }, { status: 401 });
    }

    const { expenseId, isAudited } = await request.json();
    if (!expenseId) {
      return NextResponse.json({ success: false, error: 'Missing expense ID.' }, { status: 400 });
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
        is_audited: isAudited,
        audited_at: isAudited ? new Date().toISOString() : null,
      })
      .eq('id', expenseId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error.' }, { status: 500 });
  }
}