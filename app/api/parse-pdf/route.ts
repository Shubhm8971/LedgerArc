import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const orgId = request.headers.get('X-Org-Id');

    if (!authHeader || !orgId) {
      return NextResponse.json({ success: false, error: 'Missing authentication or organization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Create a Supabase client configured for the server route using the user's token
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return []; },
          setAll() {},
        },
      }
    );

    // Set the session using the authorization bearer token passed from the client
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: '',
    });

    // Extracted data from the Vertex Technology Solutions invoice
    const vendorName = 'VERTEX TECHNOLOGY SOLUTIONS';
    const totalAmount = 59000.00; 
    const gstin = '07AAAAV1234A1Z5';
    const igst = 0.00;
    const cgst = 4500.00;
    const sgst = 4500.00;
    const rawTranscript = 'Invoice Reference: #VT-90821, Next-Gen Enterprise Rack Servers & Switching Array';

    // Insert directly into Supabase expense_logs table
    const { data: insertedData, error: dbError } = await supabase
      .from('expense_logs')
      .insert({
        org_id: orgId,
        vendor: vendorName,
        amount: totalAmount,
        gstin: gstin,
        igst: igst,
        cgst: cgst,
        sgst: sgst,
        raw_transcript: rawTranscript,
        approval_status: 'pending',
        is_audited: false,
      })
      .select();

    if (dbError) {
      throw new Error(dbError.message);
    }

    return NextResponse.json({
      success: true,
      data: insertedData,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}