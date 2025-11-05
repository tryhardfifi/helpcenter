import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Dialog = ({ open, onOpenChange, children }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50">{children}</div>
    </div>
  );
};

export const DialogContent = ({ children, className }) => {
  return (
    <div
      className={cn(
        'bg-background border rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto',
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
};

export const DialogHeader = ({ children, className }) => {
  return (
    <div className={cn('flex flex-col space-y-1.5 mb-4', className)}>
      {children}
    </div>
  );
};

export const DialogTitle = ({ children, className }) => {
  return (
    <h2 className={cn('text-lg font-semibold', className)}>{children}</h2>
  );
};

export const DialogDescription = ({ children, className }) => {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
  );
};

export const DialogFooter = ({ children, className }) => {
  return (
    <div className={cn('flex justify-end gap-2 mt-6', className)}>
      {children}
    </div>
  );
};
