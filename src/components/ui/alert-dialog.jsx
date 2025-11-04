import { useEffect } from 'react';
import { cn } from '@/lib/utils';

export const AlertDialog = ({ open, onOpenChange, children }) => {
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

export const AlertDialogContent = ({ children, className }) => {
  return (
    <div
      className={cn(
        'bg-background border rounded-lg shadow-lg w-full max-w-lg p-6',
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
};

export const AlertDialogHeader = ({ children, className }) => {
  return (
    <div className={cn('flex flex-col space-y-2 mb-4', className)}>
      {children}
    </div>
  );
};

export const AlertDialogTitle = ({ children, className }) => {
  return (
    <h2 className={cn('text-lg font-semibold', className)}>{children}</h2>
  );
};

export const AlertDialogDescription = ({ children, className }) => {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
  );
};

export const AlertDialogFooter = ({ children, className }) => {
  return (
    <div className={cn('flex justify-end gap-2 mt-6', className)}>
      {children}
    </div>
  );
};

export const AlertDialogAction = ({ children, className, onClick, disabled }) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'h-10 px-4 py-2',
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export const AlertDialogCancel = ({ children, className, disabled, onClick }) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'h-10 px-4 py-2',
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
