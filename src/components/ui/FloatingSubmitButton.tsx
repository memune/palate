import { memo } from 'react';

interface FloatingSubmitButtonProps {
  formId: string;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

const FloatingSubmitButton = memo(function FloatingSubmitButton({ 
  formId, 
  loading = false, 
  disabled = false, 
  children 
}: FloatingSubmitButtonProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 shadow-lg">
      <div className="max-w-4xl mx-auto">
        <button
          type="submit"
          form={formId}
          disabled={loading || disabled}
          className="w-full bg-emerald-800 text-white py-4 rounded-lg hover:bg-emerald-900 transition-colors font-medium text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {children}
        </button>
      </div>
    </div>
  );
});

export default FloatingSubmitButton;