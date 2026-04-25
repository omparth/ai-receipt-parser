'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReceiptDetail } from '@/components/receipt-detail';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      loadReceipt(p.id);
    });
  }, [params]);

  const loadReceipt = async (receiptId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/receipts/${receiptId}`);
      const data = await response.json();

      if (data.success) {
        setReceipt(data.data);
      } else {
        setError('Receipt not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load receipt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    await loadReceipt(id!);
    setIsUpdating(false);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-center h-screen">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p>Loading receipt...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link href="/" className="mb-8 inline-block">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/" className="mb-8 inline-block">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        {receipt && (
          <ReceiptDetail
            receipt={receipt}
            onUpdate={handleUpdate}
          />
        )}
      </div>
    </main>
  );
}
