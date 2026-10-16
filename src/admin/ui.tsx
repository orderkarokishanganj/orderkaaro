import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';

// ---------------------------------------------------------------------------
// Toasts: short success / error messages at the bottom of the screen.
// ---------------------------------------------------------------------------
interface Toast {
  id: number;
  kind: 'success' | 'error';
  text: string;
}
const ToastContext = createContext<(kind: Toast['kind'], text: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((kind: Toast['kind'], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list, { id, kind, text }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), kind === 'error' ? 7000 : 3500);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-3 md:bottom-6" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex max-w-md items-start gap-2 rounded-2xl px-4 py-3 shadow-float ${
              t.kind === 'error' ? 'bg-danger-bg text-danger-ink' : 'bg-ink text-white'
            }`}
          >
            {t.kind === 'error' ? <AlertTriangle className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />}
            <span>{t.text}</span>
            <button type="button" onClick={() => setToasts((list) => list.filter((x) => x.id !== t.id))} className="-mr-1 ml-1 rounded-full p-0.5" aria-label="Dismiss">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);

// ---------------------------------------------------------------------------
// Confirm dialog for anything destructive.
// ---------------------------------------------------------------------------
export function ConfirmDialog({ open, title, text, confirmLabel, danger = false, busy = false, onConfirm, onCancel, children }: {
  open: boolean;
  title: string;
  text?: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
      className="w-[min(28rem,calc(100vw-2rem))] rounded-panel bg-white p-0 text-ink backdrop:bg-ink/40"
      aria-labelledby="confirm-title"
    >
      <div className="p-5">
        <h2 id="confirm-title" className="text-xl">{title}</h2>
        {text && <div className="mt-2 text-ink-soft">{text}</div>}
        {children}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" className="btn-quiet" onClick={onCancel} disabled={busy}>Cancel</button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={danger ? 'btn bg-danger-ink text-white hover:bg-clay' : 'btn-primary'}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}

// ---------------------------------------------------------------------------
// Small pieces
// ---------------------------------------------------------------------------
export function Switch({ checked, onChange, label, disabled = false, hideLabel = false }: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
  hideLabel?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={hideLabel ? label : undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="inline-flex min-h-[44px] items-center gap-2 disabled:opacity-50"
    >
      <span className={`relative h-7 w-12 flex-none rounded-full transition-colors ${checked ? 'bg-sage' : 'bg-line'}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-6' : 'left-1'}`} />
      </span>
      {!hideLabel && <span className="text-sm font-medium">{label}</span>}
    </button>
  );
}

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-stone" role="status">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> {label}
    </div>
  );
}

export function AdminField({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-stone">{hint}</p>}
      {error && <p className="mt-1 text-sm font-semibold text-clay">{error}</p>}
    </div>
  );
}
