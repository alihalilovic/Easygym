import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  onCropComplete: (croppedBlob: Blob) => void;
}

export function ImageCropDialog({
  open,
  onOpenChange,
  imageUrl,
  onCropComplete,
}: ImageCropDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [cropSize] = useState(200);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Load image when dialog opens
  useEffect(() => {
    if (open && imageUrl) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        // Center the crop area
        setPosition({ x: 0, y: 0 });
        setScale(1);
      };
      img.src = imageUrl;
    }
  }, [open, imageUrl]);

  // Draw canvas whenever dependencies change
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const containerSize = 400;
    canvas.width = containerSize;
    canvas.height = containerSize;

    // Calculate scaled dimensions
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;

    // Clear canvas
    ctx.clearRect(0, 0, containerSize, containerSize);

    // Draw image centered and scaled
    const x = (containerSize - scaledWidth) / 2 + position.x;
    const y = (containerSize - scaledHeight) / 2 + position.y;

    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);

    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, containerSize, containerSize);

    // Clear the crop area to show the image
    const cropX = (containerSize - cropSize) / 2;
    const cropY = (containerSize - cropSize) / 2;
    ctx.clearRect(cropX, cropY, cropSize, cropSize);

    // Redraw the image in the crop area
    ctx.save();
    ctx.beginPath();
    ctx.rect(cropX, cropY, cropSize, cropSize);
    ctx.clip();
    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
    ctx.restore();

    // Draw crop area border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropSize, cropSize);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(cropX + (cropSize / 3) * i, cropY);
      ctx.lineTo(cropX + (cropSize / 3) * i, cropY + cropSize);
      ctx.stroke();
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(cropX, cropY + (cropSize / 3) * i);
      ctx.lineTo(cropX + cropSize, cropY + (cropSize / 3) * i);
      ctx.stroke();
    }
  }, [image, scale, position, cropSize]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleCrop = async () => {
    if (!image || !canvasRef.current) return;

    const containerSize = 400;
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;

    const imageX = (containerSize - scaledWidth) / 2 + position.x;
    const imageY = (containerSize - scaledHeight) / 2 + position.y;

    const cropX = (containerSize - cropSize) / 2;
    const cropY = (containerSize - cropSize) / 2;

    // Calculate crop coordinates relative to original image
    const sourceX = (cropX - imageX) / scale;
    const sourceY = (cropY - imageY) / scale;
    const sourceSize = cropSize / scale;

    // Create a new canvas for the cropped image
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropSize;
    cropCanvas.height = cropSize;
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) return;

    cropCtx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      cropSize,
      cropSize,
    );

    // Convert to blob
    cropCanvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
          onOpenChange(false);
        }
      },
      'image/jpeg',
      0.95,
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Crop Profile Picture</DialogTitle>
          <DialogDescription>
            Drag to reposition and use the slider to zoom
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="border border-border rounded cursor-move touch-none"
              style={{ width: '400px', height: '400px' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Zoom</label>
            <Slider
              value={[scale]}
              onValueChange={([value]) => setScale(value)}
              min={0.5}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCrop}>Crop & Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
