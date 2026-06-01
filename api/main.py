import os
import logging
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from dotenv import load_dotenv
from supabase import create_client, Client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api")

# Load environment variables from .env.local
load_dotenv(dotenv_path=".env.local")
load_dotenv(dotenv_path="../.env.local")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("Supabase environment variables not found in .env.local")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL or "", SUPABASE_KEY or "")

app = FastAPI(title="Inventory & Order Management System API", version="1.0.0")

# CORS middleware config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------
# PYDANTIC SCHEMAS
# -----------------

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1)
    sku: str = Field(..., min_length=1)
    price: float = Field(..., ge=0.0)
    quantity: int = Field(..., ge=0)

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = Field(None, ge=0.0)
    quantity: Optional[int] = Field(None, ge=0)

class CustomerCreate(BaseModel):
    full_name: str = Field(..., min_length=1)
    email: EmailStr
    phone_number: str = Field(..., min_length=1)

class OrderItem(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItem]


# -----------------
# PRODUCT ENDPOINTS
# -----------------

@app.get("/api/products")
async def get_products():
    try:
        response = supabase.table("products").select("*").order("id", desc=True).execute()
        return response.data or []
    except Exception as e:
        logger.exception("Error listing products")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/products/{product_id}")
async def get_product(product_id: int):
    try:
        response = supabase.table("products").select("*").eq("id", product_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Product not found.")
        return response.data[0]
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.exception("Error getting product")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/products", status_code=201)
async def create_product(product: ProductCreate):
    try:
        # Validate SKU uniqueness
        sku_upper = product.sku.strip().upper()
        check_sku = supabase.table("products").select("id").eq("sku", sku_upper).execute()
        if check_sku.data:
            raise HTTPException(status_code=400, detail="Product SKU/code must be unique.")

        # Create
        data = {
            "name": product.name.strip(),
            "sku": sku_upper,
            "price": product.price,
            "quantity": product.quantity
        }
        response = supabase.table("products").insert([data]).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create product.")
        return response.data[0]
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.exception("Error creating product")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/products/{product_id}")
async def update_product(product_id: int, product: ProductUpdate):
    try:
        # Check if product exists
        check_prod = supabase.table("products").select("*").eq("id", product_id).execute()
        if not check_prod.data:
            raise HTTPException(status_code=404, detail="Product not found.")
        current_product = check_prod.data[0]

        updates = {}
        if product.name is not None:
            updates["name"] = product.name.strip()
        if product.price is not None:
            updates["price"] = product.price
        if product.quantity is not None:
            updates["quantity"] = product.quantity

        if product.sku is not None:
            sku_upper = product.sku.strip().upper()
            if sku_upper != current_product["sku"]:
                # Check SKU uniqueness
                check_sku = supabase.table("products").select("id").eq("sku", sku_upper).execute()
                if check_sku.data:
                    raise HTTPException(status_code=400, detail="Product SKU/code must be unique.")
                updates["sku"] = sku_upper

        if not updates:
            return current_product

        response = supabase.table("products").update(updates).eq("id", product_id).execute()
        return response.data[0]
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.exception("Error updating product")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/products/{product_id}")
async def delete_product(product_id: int):
    try:
        # Check if product exists
        check_prod = supabase.table("products").select("id").eq("id", product_id).execute()
        if not check_prod.data:
            raise HTTPException(status_code=404, detail="Product not found.")

        # Check references in order_items
        check_ref = supabase.table("order_items").select("id").eq("product_id", product_id).execute()
        if check_ref.data:
            raise HTTPException(
                status_code=400, 
                detail="Cannot delete product because it is referenced in existing orders. Set quantity to 0 instead."
            )

        supabase.table("products").delete().eq("id", product_id).execute()
        return {"message": "Product successfully deleted."}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.exception("Error deleting product")
        raise HTTPException(status_code=500, detail=str(e))


# ------------------
# CUSTOMER ENDPOINTS
# ------------------

@app.get("/api/customers")
async def get_customers():
    try:
        response = supabase.table("customers").select("*").order("id", desc=True).execute()
        return response.data or []
    except Exception as e:
        logger.exception("Error listing customers")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/customers/{customer_id}")
async def get_customer(customer_id: int):
    try:
        response = supabase.table("customers").select("*").eq("id", customer_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Customer not found.")
        return response.data[0]
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.exception("Error getting customer")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/customers", status_code=201)
async def create_customer(customer: CustomerCreate):
    try:
        email_clean = customer.email.strip().lower()
        # Check email uniqueness
        check_email = supabase.table("customers").select("id").eq("email", email_clean).execute()
        if check_email.data:
            raise HTTPException(status_code=400, detail="Customer email must be unique.")

        data = {
            "full_name": customer.full_name.strip(),
            "email": email_clean,
            "phone_number": customer.phone_number.strip()
        }
        response = supabase.table("customers").insert([data]).execute()
        return response.data[0]
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.exception("Error creating customer")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/customers/{customer_id}")
async def delete_customer(customer_id: int):
    try:
        # Check if customer exists
        check_cust = supabase.table("customers").select("id").eq("id", customer_id).execute()
        if not check_cust.data:
            raise HTTPException(status_code=404, detail="Customer not found.")

        supabase.table("customers").delete().eq("id", customer_id).execute()
        return {"message": "Customer successfully deleted."}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.exception("Error deleting customer")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------
# ORDER ENDPOINTS
# ---------------

@app.get("/api/orders")
async def get_orders():
    try:
        # Fetch orders along with customer details and line items
        response = supabase.table("orders").select("*, customers(*), order_items(*, products(*))").order("created_at", desc=True).execute()
        return response.data or []
    except Exception as e:
        logger.exception("Error listing orders")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/orders/{order_id}")
async def get_order(order_id: int):
    try:
        response = supabase.table("orders").select("*, customers(*), order_items(*, products(*))").eq("id", order_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Order not found.")
        return response.data[0]
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.exception("Error getting order")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/orders", status_code=201)
async def create_order(order: OrderCreate):
    try:
        # 1. Verify customer exists
        check_cust = supabase.table("customers").select("id").eq("id", order.customer_id).execute()
        if not check_cust.data:
            raise HTTPException(status_code=404, detail="Customer not found.")

        # 2. Fetch all products to validate stock and calculate price
        prod_ids = [item.product_id for item in order.items]
        prod_res = supabase.table("products").select("*").in_("id", prod_ids).execute()
        products_db = {p["id"]: p for p in prod_res.data}

        total_amount = 0.0
        validated_items = []

        for item in order.items:
            if item.product_id not in products_db:
                raise HTTPException(status_code=404, detail=f"Product ID #{item.product_id} not found.")
            
            db_prod = products_db[item.product_id]
            if db_prod["quantity"] < item.quantity:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Insufficient stock for product: '{db_prod['name']}'. Only {db_prod['quantity']} units available."
                )

            price_at_time = float(db_prod["price"])
            total_amount += price_at_time * item.quantity

            validated_items.append({
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price_at_time": price_at_time,
                "db_product": db_prod
            })

        # 3. Create order
        order_data = {
            "customer_id": order.customer_id,
            "total_amount": total_amount
        }
        order_res = supabase.table("orders").insert([order_data]).execute()
        if not order_res.data:
            raise HTTPException(status_code=500, detail="Failed to create order.")
        new_order = order_res.data[0]

        # 4. Create items and reduce inventory
        try:
            items_to_insert = []
            for item in validated_items:
                items_to_insert.append({
                    "order_id": new_order["id"],
                    "product_id": item["product_id"],
                    "quantity": item["quantity"],
                    "price_at_time": item["price_at_time"]
                })

            supabase.table("order_items").insert(items_to_insert).execute()

            # Update stock
            for item in validated_items:
                new_qty = item["db_product"]["quantity"] - item["quantity"]
                supabase.table("products").update({"quantity": new_qty}).eq("id", item["product_id"]).execute()

        except Exception as inner_e:
            # Delete order as rollback
            supabase.table("orders").delete().eq("id", new_order["id"]).execute()
            raise HTTPException(status_code=500, detail=f"Error executing order: {str(inner_e)}")

        # Fetch final populated order
        final_order = supabase.table("orders").select("*, customers(*), order_items(*, products(*))").eq("id", new_order["id"]).execute()
        return final_order.data[0]

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.exception("Error processing order")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/orders/{order_id}")
async def delete_order(order_id: int):
    try:
        # 1. Fetch order and items to restore stock
        order_res = supabase.table("orders").select("*, order_items(*)").eq("id", order_id).execute()
        if not order_res.data:
            raise HTTPException(status_code=404, detail="Order not found.")
        order = order_res.data[0]

        # 2. Restore stock for each item
        for item in order.get("order_items", []):
            prod_res = supabase.table("products").select("quantity").eq("id", item["product_id"]).execute()
            if prod_res.data:
                current_qty = prod_res.data[0]["quantity"]
                new_qty = current_qty + item["quantity"]
                supabase.table("products").update({"quantity": new_qty}).eq("id", item["product_id"]).execute()

        # 3. Delete order (will cascade delete order items)
        supabase.table("orders").delete().eq("id", order_id).execute()
        return {"message": "Order successfully cancelled and deleted, and stock restored."}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.exception("Error deleting order")
        raise HTTPException(status_code=500, detail=str(e))
