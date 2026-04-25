//lib/schemas.ts
import { z } from 'zod';

// Confidence score must be between 0 and 1
const confidenceSchema = z.object({
  value: z.string().or(z.number()).or(z.null()).optional(),
  confidence: z.number().min(0).max(1),
});

// Receipt item schema
const receiptItemSchema = z.object({
  description: confidenceSchema.extend({
    value: z.string(),
  }),
  quantity: confidenceSchema.extend({
    value: z.number(),
  }),
  unitPrice: confidenceSchema.extend({
    value: z.number(),
  }),
  totalPrice: confidenceSchema.extend({
    value: z.number(),
  }),
});

// Full receipt extraction schema with confidence scores
export const receiptExtractionSchema = z.object({
  vendor: confidenceSchema.extend({
    value: z.string(),
  }),
  date: confidenceSchema.extend({
    value: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
  currency: confidenceSchema.extend({
    value: z.string(),
  }),
  items: z.array(receiptItemSchema),
  subtotal: confidenceSchema.extend({
    value: z.number(),
  }),
  tax: confidenceSchema.extend({
    value: z.number(),
  }),
  total: confidenceSchema.extend({
    value: z.number(),
  }),
});

export type ReceiptExtraction = z.infer<typeof receiptExtractionSchema>;

// Schema for extracted values (without confidence - used in database)
export const receiptValueSchema = z.object({
  vendor: z.string(),
  date: z.string(),
  currency: z.string(),
  items: z.array(
    z.object({
      description: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      totalPrice: z.number(),
    })
  ),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
});

export type ReceiptValue = z.infer<typeof receiptValueSchema>;
