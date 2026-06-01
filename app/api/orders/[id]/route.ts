import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface P { params: Promise<{ id: string }>; }

export async function GET(_: Request, { params }: P) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        customers (*),
        order_items (
          *,
          products (*)
        )
      `)
      .eq('id', orderId)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

    return NextResponse.json(order);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(_: Request, { params }: P) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);

    // 1. Get order items to restock products
    const { data: items, error: fetchErr } = await supabaseAdmin
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', orderId);

    if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

    // 2. Restock products
    if (items) {
      for (const item of items) {
        const { data: product } = await supabaseAdmin.from('products').select('quantity').eq('id', item.product_id).single();
        if (product) {
          await supabaseAdmin.from('products')
            .update({ quantity: product.quantity + item.quantity })
            .eq('id', item.product_id);
        }
      }
    }

    // 3. Delete the order (cascade will delete items)
    const { error: delErr } = await supabaseAdmin.from('orders').delete().eq('id', orderId);
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

    return NextResponse.json({ message: 'Order deleted and products restocked.' });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
