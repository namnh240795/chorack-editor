import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/AlertDialog';

export type AlertDialogOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  onConfirm?: () => void;
};

export function showAlert({
  title,
  description,
  confirmText = 'OK',
  onConfirm,
}: AlertDialogOptions) {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);

  const handleConfirm = () => {
    onConfirm?.();
    closeAlert();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeAlert();
    }
  };

  const closeAlert = () => {
    root.unmount();
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  };

  root.render(
    <React.StrictMode>
      <AlertDialog open={true} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            {description && (
              <AlertDialogDescription>{description}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleConfirm}>
              {confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </React.StrictMode>
  );
}
