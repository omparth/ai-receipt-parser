'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

interface ReceiptListProps {
  refreshTrigger?: number;
}

export function ReceiptList({ refreshTrigger }: ReceiptListProps) {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadReceipts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/receipts');
      const data = await response.json();

      if (data.success) {
        setReceipts(data.data);
      } else {
        setError('Failed to load receipts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load receipts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, [refreshTrigger]);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/receipts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReceipts((prev) => prev.filter((r) => r.id !== id));
      }else {
        setError('Failed to delete receipt');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete receipt');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full p-8">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading receipts...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (receipts.length === 0) {
    return (
      <Card className="w-full p-8">
        <div className="text-center">
          <p className="text-muted-foreground">No receipts yet. Upload one to get started!</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {receipts.map((receipt) => {
        const hasLowConfidence =
          Object.entries(receipt.confidence || {})
            .filter(([key]) => !key.startsWith('item_'))
            .some(([, score]) => (score as number) < 0.8);

        return (
          <Card key={receipt.id} className="p-4 hover:bg-accent transition-colors">
          <div className="flex items-start justify-between gap-4">
        
            <Link href={`/receipts/${receipt.id}`} className="flex-1 min-w-0 block">
              <div>
                <h3 className="font-semibold truncate">
                  {receipt.vendor || 'Unknown Vendor'}
                </h3>
        
                <p className="text-sm text-muted-foreground">
                  {receipt.date} • {receipt.currency} {receipt.total?.toFixed(2)}
                </p>
              </div>
            </Link>
        
            <div className="flex items-center gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
        
                <AlertDialogContent>
  <AlertDialogTitle>Delete Receipt</AlertDialogTitle>
  <AlertDialogDescription>
    Are you sure you want to delete this receipt?
  </AlertDialogDescription>
                  <AlertDialogAction
                    onClick={() => handleDelete(receipt.id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogContent>
              </AlertDialog>
            </div>
        
          </div>
        </Card>
        );
      })}
    </div>
  );
}
