//components/receipt-detail.tsx
'use client';
import { useState } from 'react';
import { AlertCircle, Check, X, Loader2, Edit2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface ReceiptDetailProps {
  receipt: any;
  onUpdate: () => void;
}

export function ReceiptDetail({ receipt, onUpdate }: ReceiptDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedData, setEditedData] = useState({
    vendor: receipt.vendor,
    date: receipt.date,
    currency: receipt.currency,
    subtotal: receipt.subtotal,
    tax: receipt.tax,
    total: receipt.total,
    items: receipt.items,
  });

  const getConfidenceColor = (fieldName: string, itemIndex?: number): string => {
    let key = fieldName;
    if (itemIndex !== undefined) {
      key = `item_${itemIndex}_${fieldName}`;
    }

    const score = receipt.confidence?.[key];
    if (!score) return 'bg-gray-50';
    if (score >= 0.9) return 'bg-green-50';
    if (score >= 0.8) return 'bg-blue-50';
    if (score >= 0.7) return 'bg-yellow-50';
    return 'bg-orange-50';
  };

  const getConfidenceBadge = (fieldName: string, itemIndex?: number) => {
    let key = fieldName;
    if (itemIndex !== undefined) {
      key = `item_${itemIndex}_${fieldName}`;
    }

    const score = receipt.confidence?.[key];
    if (!score) return null;

    const isLowConfidence = score < 0.8;
    const edit = receipt.edits?.find((e: any) => e.fieldName === key);

    return (
      <div className="flex items-center gap-1">
        {edit && (
          <Badge variant="secondary" className="text-xs">
            Edited
          </Badge>
        )}
        <Badge
          variant={isLowConfidence ? 'outline' : 'secondary'}
          className={`text-xs ${
            isLowConfidence ? 'bg-yellow-50 text-yellow-800 border-yellow-300' : ''
          }`}
        >
          {(score * 100).toFixed(0)}%
        </Badge>
      </div>
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/receipts/${receipt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to save changes');
        return;
      }

      setIsEditing(false);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateItemField = (itemIndex: number, field: string, value: any) => {
    setEditedData((prev) => ({
      ...prev,
      items: prev.items.map((item: any, idx: number) =>
        idx === itemIndex ? { ...item, [field]: value } : item
      ),
    }));
  };

  return (
    <div className="space-y-6">
      {receipt.isPartial && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This receipt has incomplete or low-confidence data. Please review and correct as needed.
          </AlertDescription>
        </Alert>
      )}

      {receipt.extractionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{receipt.extractionError}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Receipt Details</h2>
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedData({
                      vendor: receipt.vendor,
                      date: receipt.date,
                      currency: receipt.currency,
                      subtotal: receipt.subtotal,
                      tax: receipt.tax,
                      total: receipt.total,
                      items: receipt.items,
                    });
                  }}
                  variant="outline"
                  size="sm"
                  disabled={isSaving}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSave}
                  size="sm"
                  disabled={isSaving}
                  className="gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vendor */}
            <div>
              <label className="block text-sm font-medium mb-2">Vendor</label>
              <div
                className={`flex items-end gap-3 p-3 rounded-lg border ${getConfidenceColor(
                  'vendor'
                )}`}
              >
                {isEditing ? (
                  <Input
                    value={editedData.vendor}
                    onChange={(e) => updateField('vendor', e.target.value)}
                    placeholder="Vendor name"
                    className="flex-1"
                  />
                ) : (
                  <span className="flex-1">{editedData.vendor || 'N/A'}</span>
                )}
                {getConfidenceBadge('vendor')}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <div
                className={`flex items-end gap-3 p-3 rounded-lg border ${getConfidenceColor(
                  'date'
                )}`}
              >
                {isEditing ? (
                  <Input
                    type="date"
                    value={editedData.date}
                    onChange={(e) => updateField('date', e.target.value)}
                    className="flex-1"
                  />
                ) : (
                  <span className="flex-1">{editedData.date || 'N/A'}</span>
                )}
                {getConfidenceBadge('date')}
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <div
                className={`flex items-end gap-3 p-3 rounded-lg border ${getConfidenceColor(
                  'currency'
                )}`}
              >
                {isEditing ? (
                  <Input
                    value={editedData.currency}
                    onChange={(e) => updateField('currency', e.target.value)}
                    placeholder="Currency"
                    className="flex-1"
                  />
                ) : (
                  <span className="flex-1">{editedData.currency || 'N/A'}</span>
                )}
                {getConfidenceBadge('currency')}
              </div>
            </div>

            {/* Subtotal */}
            <div>
              <label className="block text-sm font-medium mb-2">Subtotal</label>
              <div
                className={`flex items-end gap-3 p-3 rounded-lg border ${getConfidenceColor(
                  'subtotal'
                )}`}
              >
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedData.subtotal}
                    onChange={(e) => updateField('subtotal', Number(e.target.value) || 0)}
                    placeholder="0.00"
                    step="0.01"
                    className="flex-1"
                  />
                ) : (
<span className="flex-1">
  {formatCurrency(editedData.subtotal, editedData.currency)}
</span>                )}
                {getConfidenceBadge('subtotal')}
              </div>
            </div>

            {/* Tax */}
            <div>
              <label className="block text-sm font-medium mb-2">Tax</label>
              <div
                className={`flex items-end gap-3 p-3 rounded-lg border ${getConfidenceColor(
                  'tax'
                )}`}
              >
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedData.tax}
                    onChange={(e) => updateField('tax', Number(e.target.value) || 0)}
                    placeholder="0.00"
                    step="0.01"
                    className="flex-1"
                  />
                ) : (
<span className="flex-1">
  {formatCurrency(editedData.tax, editedData.currency)}
</span>                )}
                {getConfidenceBadge('tax')}
              </div>
            </div>

            {/* Total */}
            <div>
              <label className="block text-sm font-medium mb-2">Total</label>
              <div
                className={`flex items-end gap-3 p-3 rounded-lg border ${getConfidenceColor(
                  'total'
                )}`}
              >
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedData.total}
                    onChange={(e) => updateField('total', Number(e.target.value) || 0)}
                    placeholder="0.00"
                    step="0.01"
                    className="flex-1"
                  />
                ) : (
<span className="flex-1 font-bold">
  {formatCurrency(editedData.total, editedData.currency)}
</span>                )}
                {getConfidenceBadge('total')}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Items */}
      {editedData.items && editedData.items.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Items</h3>
            <div className="space-y-4">
              {editedData.items.map((item: any, index: number) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getConfidenceColor('description', index)}`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Description
                      </label>
                      {isEditing ? (
                        <Input
                          value={item.description}
                          onChange={(e) => updateItemField(index, 'description', e.target.value)}
                          placeholder="Item name"
                        />
                      ) : (
                        <p>{item.description}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Qty
                      </label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItemField(index, 'quantity', Number(e.target.value) || 0)}
                          step="0.01"
                        />
                      ) : (
                        <p>{item.quantity}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Unit Price
                      </label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItemField(index, 'unitPrice', Number(e.target.value) || 0)}
                          step="0.01"
                        />
                      ) : (
<p>{formatCurrency(item.unitPrice, editedData.currency)}</p>                      )}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Total
                      </label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={item.totalPrice}
                          onChange={(e) => updateItemField(index, 'totalPrice', Number(e.target.value) || 0)}
                          step="0.01"
                        />
                      ) : (
<p>{formatCurrency(item.totalPrice, editedData.currency)}</p>                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {getConfidenceBadge('description', index)}
                    {getConfidenceBadge('quantity', index)}
                    {getConfidenceBadge('unitPrice', index)}
                    {getConfidenceBadge('totalPrice', index)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
