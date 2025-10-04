"use client";

interface AutoSaveIndicatorProps {
  isDirty: boolean;
  isSaving?: boolean;
  className?: string;
}

export function AutoSaveIndicator({ isDirty, isSaving = false, className = '' }: AutoSaveIndicatorProps) {
  if (!isDirty && !isSaving) return null;

  return (
    <div className={`flex items-center gap-2 text-xs text-gray-500 ${className}`}>
      {isSaving ? (
        <>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Saving...</span>
        </>
      ) : (
        <>
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <span>Unsaved changes</span>
        </>
      )}
    </div>
  );
}
