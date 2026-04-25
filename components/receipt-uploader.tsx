//components/receipt-uploader.tsx
'use client';
import { useState, useRef } from 'react';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';

interface ReceiptUploaderProps {
  onSuccess: (result: any) => void;
  onError?: (error: string) => void;
}

export function ReceiptUploader({ onSuccess, onError }: ReceiptUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    setError(null);

    // ✅ validate type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      const msg = 'Please upload JPEG or PNG image';
      setError(msg);
      onError?.(msg);
      return;
    }

    // ✅ validate size
    if (file.size > 10 * 1024 * 1024) {
      const msg = 'File size must be less than 10MB';
      setError(msg);
      onError?.(msg);
      return;
    }

    // preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setIsLoading(true);

    try {
      // 🔥 ONLY SEND FILE (NO OCR HERE)
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      if (data.success) {
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onSuccess(data);
      } else {
        throw new Error(data.error || 'Extraction failed');
      }

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
      onError?.(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) processFile(files[0]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) processFile(files[0]);
  };

  return (
    <Card className="w-full">
      <div className="p-6">

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isLoading}
          />

          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Processing receipt...</p>
            </div>
          ) : preview ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-40">
                <Image src={preview} alt="Preview" fill className="object-contain" />
              </div>
              <Button onClick={() => fileInputRef.current?.click()} size="sm">
                Change Image
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8" />
              <p>Drag & drop receipt or click to upload</p>
              <Button onClick={() => fileInputRef.current?.click()} size="sm">
                Browse
              </Button>
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

      </div>
    </Card>
  );
}