import React, { useEffect } from 'react';
import { Button, Textarea } from '@heroui/react';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  actionLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
  showReasonInput?: boolean;
  reasonValue?: string;
  onReasonChange?: (value: string) => void;
  reasonPlaceholder?: string;
  isLoading?: boolean;
}

export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  actionLabel,
  onConfirm,
  onCancel,
  isDangerous = false,
  showReasonInput = false,
  reasonValue = '',
  onReasonChange,
  reasonPlaceholder = 'Failure reason (optional)',
  isLoading = false,
}: ConfirmationDialogProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  const getIcon = () => {
    if (isDangerous) return '❌';
    return '⊘';
  };

  const getActionColor = (): 'danger' | 'warning' => {
    return isDangerous ? 'danger' : 'warning';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur"
        onClick={onCancel}
        style={{ display: isOpen ? 'block' : 'none' }}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        style={{ display: isOpen ? 'flex' : 'none' }}
      >
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center gap-3">
            <span className="text-2xl">{getIcon()}</span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
          </div>

          {/* Body */}
          <div className="px-6 py-4 space-y-4">
            <p className="text-gray-700 dark:text-gray-300">{message}</p>
            {showReasonInput && (
              <Textarea
                placeholder={reasonPlaceholder}
                value={reasonValue}
                onChange={(e) => onReasonChange?.(e.target.value)}
                minRows={3}
                maxRows={6}
                variant="bordered"
                className="w-full"
                disabled={isLoading}
              />
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-slate-700 px-6 py-4 flex gap-3 justify-end">
            <Button
              color="default"
              variant="light"
              onPress={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              color={getActionColor()}
              onPress={onConfirm}
              isLoading={isLoading}
            >
              {actionLabel}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
