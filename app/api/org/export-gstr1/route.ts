import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const orgId = url.searchParams.get('orgId');
    const year = url.searchParams.get('year');
    const month = url.searchParams.get('month');

    if (!orgId) {
      return NextResponse.json({ success: false, error: 'Missing organization identifier.' }, { status: 400 });
    }

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

    const { data, error } = await supabase
      .from('expense_logs')
      .select('*')
      .eq('org_id', orgId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    const gstr1Payload = {
      gstin_summary: {
        return_period: `${month}${year}`,
        total_records: data?.length || 0,
        b2b: data || [],
      },
    };

    return NextResponse.json({ success: true, payload: gstr1Payload });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'GSTR-1 compilation failed.' }, { status: 500 });
  }
}