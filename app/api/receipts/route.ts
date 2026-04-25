//app/api/receipts/route.ts
import { getAllReceipts, getReceiptCount, initializeDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

initializeDb();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const receipts = getAllReceipts(limit, offset);
    const total = getReceiptCount();

    return NextResponse.json({
      success: true,
      data: receipts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('[Receipts] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
