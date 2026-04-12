import { useToastStore } from '../store/toastStore';

const toastStyles = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
};

export default function Toast() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-3">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => removeToast(toast.id)}
          className={`toast-enter min-w-[260px] rounded-lg shadow-lg px-4 py-3 text-left text-white ${toastStyles[toast.type]}`}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}
