import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { saveReceipt, initializeDb } from '@/lib/db';
import type { ConfidenceScore } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { extractReceiptData } from "@/lib/openai"; 

initializeDb();

type ReceiptItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type ItemWithConfidence = ReceiptItem & {
  _confidenceMap: Record<string, number>;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; 
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

function generateFilename(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `receipt_${timestamp}_${random}.jpg`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG and PNG images are allowed.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    mkdirSync(uploadsDir, { recursive: true });


    
    const filename = generateFilename();
    const filepath = join(uploadsDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    writeFileSync(filepath, buffer);

    

   


const base64Image = buffer.toString("base64");

const extractionResult = await extractReceiptData(base64Image);


console.log("🔥 EXTRACTION RESULT:", extractionResult);

if (!extractionResult || !extractionResult.data) {
  console.log("❌ Extraction completely failed");

  return NextResponse.json(
    { error: "Extraction failed" },
    { status: 500 }
  );
}

const data = extractionResult.data;

data.vendor = data.vendor || "Unknown Store";
data.date = data.date || new Date().toISOString().split("T")[0];
data.currency = data.currency || "INR";
data.subtotal = data.subtotal || 0;
data.tax = data.tax || 0;
data.total = data.total || 0;

console.log("🔥 FINAL DATA:", data);
if (!data.items || data.items.length === 0) {
  console.log("⚠️ items empty, fixing fallback");

  data.items = [
    {
      description: "Item",
      quantity: 1,
      unitPrice: data.total || 0,
      totalPrice: data.total || 0,
    },
  ];
}
 
    const confidence: Record<string, number> = {};
    const confidenceScores: ConfidenceScore[] = [];
    for (const [fieldName, score] of Object.entries(confidence)) {
      if (!fieldName.startsWith('item_')) {
        confidenceScores.push({
          fieldName,
          confidenceScore: score,
        });
      }
    }

    const items: ItemWithConfidence[] = data.items.map((item: ReceiptItem, index: number) => ({
      
  ...item,
      _confidenceMap: {
        description: confidence[`item_${index}_description`] ?? 0,
        quantity: confidence[`item_${index}_quantity`] ?? 0,
        unitPrice: confidence[`item_${index}_unitPrice`] ?? 0,
        totalPrice: confidence[`item_${index}_totalPrice`] ?? 0,
      } as Record<string, number>,
    }));


    console.log("🔥 SAVING TO DB:", data);
    const receiptId = saveReceipt(
      {
        filename,
        vendor: data.vendor,
        date: data.date,
        currency: data.currency,
        subtotal: data.subtotal,
        tax: data.tax,
        total: data.total,
      },
      items.map((item) => {
        const { _confidenceMap, ...rest } = item;
        return rest;
      }),
            confidenceScores
    );
    console.log("🔥 SAVED ID:", receiptId);

    items.forEach((item: any, index: number) => {      const itemData = data.items[index];
      for (const [fieldName, score] of Object.entries(item._confidenceMap)) {
        confidenceScores.push({
          fieldName: `item_${index}_${fieldName}`,
          confidenceScore: score as number,
        });
      }
    });

    return NextResponse.json({
      success: true,
      receiptId,
      imageUrl: `/uploads/${filename}`,
      extractedData: {
        vendor: data.vendor,
        date: data.date,
        currency: data.currency,
        subtotal: data.subtotal,
        tax: data.tax,
        total: data.total,
        items: data.items,
      },
      confidence,
    });
  } catch (error) {
    console.error('[Upload] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
