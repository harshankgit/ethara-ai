import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface P { params: Promise<{ id: string }>; }

export async function GET(_: Request, { params }: P) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin.from('products').select('*').eq('id', parseInt(id)).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    return NextResponse.json(data);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function PUT(request: Request, { params }: P) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    const body = await request.json();
    const { name, sku, price, quantity } = body;

    const { data: current, error: getErr } = await supabaseAdmin.from('products').select('*').eq('id', productId).maybeSingle();
    if (getErr) return NextResponse.json({ error: getErr.message }, { status: 500 });
    if (!current) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });

    const updates: any = {};
    if (name !== undefined) updates.name = name.trim();
    if (price !== undefined) updates.price = price;
    if (quantity !== undefined) updates.quantity = quantity;
    if (sku !== undefined) {
      const skuUpper = sku.trim().toUpperCase();
      if (skuUpper !== current.sku) {
        const { data: conflict } = await supabaseAdmin.from('products').select('id').eq('sku', skuUpper).maybeSingle();
        if (conflict) return NextResponse.json({ error: 'A product with this SKU already exists.' }, { status: 400 });
        updates.sku = skuUpper;
      }
    }

    const { data, error } = await supabaseAdmin.from('products').update(updates).eq('id', productId).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(_: Request, { params }: P) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    const { data: exists } = await supabaseAdmin.from('products').select('id').eq('id', productId).maybeSingle();
    if (!exists) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });

    const { count } = await supabaseAdmin.from('order_items').select('*', { count: 'exact', head: true }).eq('product_id', productId);
    if (count && count > 0) return NextResponse.json({ error: 'Cannot delete — product is linked to existing orders.' }, { status: 400 });

    await supabaseAdmin.from('products').delete().eq('id', productId);
    return NextResponse.json({ message: 'Product deleted.' });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
