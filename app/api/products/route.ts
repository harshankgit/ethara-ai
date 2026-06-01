import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('products').select('*').order('id', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const { name, sku, price, quantity } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });
    if (!sku?.trim()) return NextResponse.json({ error: 'SKU is required.' }, { status: 400 });
    if (typeof price !== 'number' || price < 0) return NextResponse.json({ error: 'Price must be a positive number.' }, { status: 400 });
    if (typeof quantity !== 'number' || quantity < 0) return NextResponse.json({ error: 'Quantity cannot be negative.' }, { status: 400 });

    const skuUpper = sku.trim().toUpperCase();
    const { data: exists } = await supabaseAdmin.from('products').select('id').eq('sku', skuUpper).maybeSingle();
    if (exists) return NextResponse.json({ error: 'A product with this SKU already exists.' }, { status: 400 });

    const { data, error } = await supabaseAdmin.from('products').insert([{ name: name.trim(), sku: skuUpper, price, quantity }]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
