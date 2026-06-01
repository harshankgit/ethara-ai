import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        customers (full_name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_id, items } = body; // items: Array<{product_id: number, quantity: number}>

    if (!customer_id) return NextResponse.json({ error: 'Customer ID is required.' }, { status: 400 });
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must have at least one item.' }, { status: 400 });
    }

    // 1. Verify customer
    const { data: customer } = await supabaseAdmin.from('customers').select('id').eq('id', customer_id).maybeSingle();
    if (!customer) return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });

    // 2. Validate all products and stock first
    let totalAmount = 0;
    const itemsToProcess = [];

    for (const item of items) {
      const { product_id, quantity } = item;
      const q = parseInt(quantity);
      if (!product_id || isNaN(q) || q <= 0) {
        return NextResponse.json({ error: 'Invalid product ID or quantity.' }, { status: 400 });
      }

      const { data: product } = await supabaseAdmin.from('products').select('*').eq('id', product_id).maybeSingle();
      if (!product) return NextResponse.json({ error: `Product ID ${product_id} not found.` }, { status: 404 });
      
      if (product.quantity < q) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}. Available: ${product.quantity}` }, { status: 400 });
      }

      const priceAtTime = product.price;
      totalAmount += priceAtTime * q;
      
      itemsToProcess.push({
        product_id,
        quantity: q,
        price_at_time: priceAtTime,
        new_quantity: product.quantity - q
      });
    }

    // 3. Create the order
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert([{ customer_id, total_amount: totalAmount }])
      .select()
      .single();

    if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 });

    // 4. Create order items and update product stock
    for (const item of itemsToProcess) {
      // Insert order item
      await supabaseAdmin.from('order_items').insert([{
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: item.price_at_time
      }]);

      // Update product stock
      await supabaseAdmin.from('products')
        .update({ quantity: item.new_quantity })
        .eq('id', item.product_id);
    }

    return NextResponse.json(order, { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
