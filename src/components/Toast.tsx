"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Close } from "./icons/Close";

export type ToastStatus = "success" | "warning" | "error";

type ToastOptions = {
  status: ToastStatus;
  message: string;
  duration?: number;
};

type ToastItem = Required<ToastOptions> & { id: string };

const DEFAULT_DURATION = 5000;

const statusStyles: Record<ToastStatus, string> = {
  success: "border-l-success",
  warning: "border-l-warning",
  error: "border-l-error",
};

export const Toast = ({
  status,
  message,
  duration = DEFAULT_DURATION,
  onClose,
}: ToastOptions & { onClose: () => void }) => {
  useEffect(() => {
    const timeout = setTimeout(onClose, duration);
    return () => clearTimeout(timeout);
  }, [duration, onClose]);

  return (
    <div
      role={status === "error" ? "alert" : "status"}
      className={`flex w-80 items-start gap-3 rounded-lg border border-l-4 border-gray-200 bg-white p-4 shadow-md ${statusStyles[status]}`}
    >
      <p className="flex-1 text-sm text-gray-800">{message}</p>
      <button
        type="button"
        aria-label="Fechar notificação"
        onClick={onClose}
        className="cursor-pointer rounded-md p-0.5 text-gray-500 transition hover:bg-gray-200 hover:text-gray-800"
      >
        <Close className="size-4" />
      </button>
    </div>
  );
};

const ToastContext = createContext<((options: ToastOptions) => void) | null>(
  null,
);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((options: ToastOptions) => {
    setToasts((current) => [
      ...current,
      { duration: DEFAULT_DURATION, ...options, id: crypto.randomUUID() },
    ]);
  }, []);

  const closeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastEntry key={toast.id} toast={toast} onClose={closeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastEntry = ({
  toast,
  onClose,
}: {
  toast: ToastItem;
  onClose: (id: string) => void;
}) => {
  const { id, ...options } = toast;
  const handleClose = useCallback(() => onClose(id), [id, onClose]);
  return <Toast {...options} onClose={handleClose} />;
};

export const useToast = () => {
  const showToast = useContext(ToastContext);
  if (!showToast) {
    throw new Error("useToast deve ser usado dentro de um ToastProvider");
  }
  return showToast;
};
