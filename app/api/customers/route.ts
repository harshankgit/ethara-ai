import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('customers').select('*').order('id', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const { full_name, email, phone_number } = await request.json();
    if (!full_name?.trim()) return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
    if (!email?.trim()) return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    if (!phone_number?.trim()) return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });

    const emailLower = email.trim().toLowerCase();
    const { data: exists } = await supabaseAdmin.from('customers').select('id').eq('email', emailLower).maybeSingle();
    if (exists) return NextResponse.json({ error: 'A customer with this email already exists.' }, { status: 400 });

    const { data, error } = await supabaseAdmin.from('customers').insert([{ 
      full_name: full_name.trim(), 
      email: emailLower, 
      phone_number: phone_number.trim() 
    }]).select().single();
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
