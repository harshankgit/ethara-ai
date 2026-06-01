import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface P { params: Promise<{ id: string }>; }

export async function GET(_: Request, { params }: P) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin.from('customers').select('*').eq('id', parseInt(id)).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });
    return NextResponse.json(data);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function PUT(request: Request, { params }: P) {
  try {
    const { id } = await params;
    const customerId = parseInt(id);
    const body = await request.json();
    const { full_name, email, phone_number } = body;

    const { data: current, error: getErr } = await supabaseAdmin.from('customers').select('*').eq('id', customerId).maybeSingle();
    if (getErr) return NextResponse.json({ error: getErr.message }, { status: 500 });
    if (!current) return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });

    const updates: any = {};
    if (full_name !== undefined) updates.full_name = full_name.trim();
    if (phone_number !== undefined) updates.phone_number = phone_number.trim();
    if (email !== undefined) {
      const emailLower = email.trim().toLowerCase();
      if (emailLower !== current.email) {
        const { data: conflict } = await supabaseAdmin.from('customers').select('id').eq('email', emailLower).maybeSingle();
        if (conflict) return NextResponse.json({ error: 'A customer with this email already exists.' }, { status: 400 });
        updates.email = emailLower;
      }
    }

    const { data, error } = await supabaseAdmin.from('customers').update(updates).eq('id', customerId).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(_: Request, { params }: P) {
  try {
    const { id } = await params;
    const customerId = parseInt(id);
    const { data: exists } = await supabaseAdmin.from('customers').select('id').eq('id', customerId).maybeSingle();
    if (!exists) return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });

    // Check if customer has orders
    const { count } = await supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('customer_id', customerId);
    if (count && count > 0) return NextResponse.json({ error: 'Cannot delete — customer has existing orders.' }, { status: 400 });

    await supabaseAdmin.from('customers').delete().eq('id', customerId);
    return NextResponse.json({ message: 'Customer deleted.' });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
