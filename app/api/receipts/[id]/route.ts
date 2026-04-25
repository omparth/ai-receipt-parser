import { getReceipt, updateReceipt, deleteReceipt, saveEdit, updateReceiptItem, initializeDb } from '@/lib/db';
import { unlinkSync } from 'fs';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';

initializeDb();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = parseInt((await params).id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid receipt ID' }, { status: 400 });
    }

    const receipt = getReceipt(id);

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    console.error('[Get Receipt] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = parseInt((await params).id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid receipt ID' }, { status: 400 });
    }

    const receipt = getReceipt(id);
    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    const body = await request.json();

    const updates: Record<string, any> = {};

    if (body.vendor !== undefined && body.vendor !== receipt.vendor) {
      saveEdit(id, 'vendor', receipt.vendor, body.vendor);
      updates.vendor = body.vendor;
    }

    if (body.date !== undefined && body.date !== receipt.date) {
      saveEdit(id, 'date', receipt.date, body.date);
      updates.date = body.date;
    }

    if (body.currency !== undefined && body.currency !== receipt.currency) {
      saveEdit(id, 'currency', receipt.currency, body.currency);
      updates.currency = body.currency;
    }

    if (body.subtotal !== undefined && body.subtotal !== receipt.subtotal) {
      saveEdit(id, 'subtotal', receipt.subtotal?.toString() || null, body.subtotal.toString());
      updates.subtotal = body.subtotal;
    }

    if (body.tax !== undefined && body.tax !== receipt.tax) {
      saveEdit(id, 'tax', receipt.tax?.toString() || null, body.tax.toString());
      updates.tax = body.tax;
    }

    if (body.total !== undefined && body.total !== receipt.total) {
      saveEdit(id, 'total', receipt.total?.toString() || null, body.total.toString());
      updates.total = body.total;
    }

    if (body.items && Array.isArray(body.items)) {
      body.items.forEach((updatedItem: any, index: number) => {
        const originalItem = receipt.items[index];
        if (originalItem) {
          if (updatedItem.description && updatedItem.description !== originalItem.description) {
            saveEdit(id, `item_description`, originalItem.description, updatedItem.description, originalItem.id);
            updateReceiptItem(originalItem.id!, { description: updatedItem.description });
          }
          if (updatedItem.quantity && updatedItem.quantity !== originalItem.quantity) {
            saveEdit(id, `item_quantity`, originalItem.quantity.toString(), updatedItem.quantity.toString(), originalItem.id);
            updateReceiptItem(originalItem.id!, { quantity: updatedItem.quantity });
          }
          if (updatedItem.unitPrice && updatedItem.unitPrice !== originalItem.unitPrice) {
            saveEdit(id, `item_unitPrice`, originalItem.unitPrice.toString(), updatedItem.unitPrice.toString(), originalItem.id);
            updateReceiptItem(originalItem.id!, { unitPrice: updatedItem.unitPrice });
          }
          if (updatedItem.totalPrice && updatedItem.totalPrice !== originalItem.totalPrice) {
            saveEdit(id, `item_totalPrice`, originalItem.totalPrice.toString(), updatedItem.totalPrice.toString(), originalItem.id);
            updateReceiptItem(originalItem.id!, { totalPrice: updatedItem.totalPrice });
          }
        }
      });
    }

    if (Object.keys(updates).length > 0) {
      updateReceipt(id, updates);
    }

    const updatedReceipt = getReceipt(id);

    return NextResponse.json({
      success: true,
      data: updatedReceipt,
    });
  } catch (error) {
    console.error('[Update Receipt] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = parseInt((await params).id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid receipt ID' }, { status: 400 });
    }

    const receipt = getReceipt(id);

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    try {
      const filepath = join(process.cwd(), 'public', 'uploads', receipt.filename);
            unlinkSync(filepath);
    } catch (fileError) {
      console.warn('[Delete Receipt] Could not delete image file:', fileError);
    }

    deleteReceipt(id);

    return NextResponse.json({
      success: true,
      message: 'Receipt deleted successfully',
    });
  } catch (error) {
    console.error('[Delete Receipt] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
