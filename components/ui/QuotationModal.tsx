"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { X, CheckCircle, AlertCircle, Upload, Loader2 } from "lucide-react";
import type { ServiceItem } from "@/config/services.config";
import { BUDGET_LABELS } from "@/lib/validation";

interface Props {
  service: ServiceItem | null;
  onClose: () => void;
}

type FormState = "idle" | "loading" | "success" | "error";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTS = [".pdf", ".docx", ".xlsx", ".xls", ".jpg", ".jpeg", ".png"];

export default function QuotationModal({ service, onClose }: Props) {
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Cerrar con Escape; bloquear scroll del body
  useEffect(() => {
    if (!service) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstInputRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [service, onClose]);

  if (!service) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) { setFileName(null); return; }
    if (file.size > MAX_FILE_BYTES) {
      setErrorMsg("El archivo supera el límite de 10 MB.");
      e.target.value = "";
      setFileName(null);
      return;
    }
    const ext = "." + file.name.split(".").pop()!.toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      setErrorMsg("Tipo de archivo no permitido. Usa PDF, DOCX, XLSX o imagen.");
      e.target.value = "";
      setFileName(null);
      return;
    }
    setErrorMsg("");
    setFileName(file.name);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "loading") return;

    setState("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot check client-side (refuerzo visual, la verificación real es server-side)
    if (data.get("website")) {
      setState("success");
      return;
    }

    try {
      const res = await fetch("/api/quotation", {
        method: "POST",
        body: data,
      });

      if (res.status === 429) {
        setState("error");
        setErrorMsg("Demasiadas solicitudes. Espera unos minutos e intenta de nuevo.");
        return;
      }

      const json = await res.json();

      if (!res.ok) {
        setState("error");
        setErrorMsg(json.error ?? "Error al enviar la solicitud.");
        return;
      }

      setState("success");
      form.reset();
      setFileName(null);
    } catch {
      setState("error");
      setErrorMsg("Error de red. Verifica tu conexión e intenta de nuevo.");
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Solicitar cotización: ${service.name}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between gap-4 rounded-t-2xl z-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-0.5">
              Solicitud de cotización
            </p>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">
              {service.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {state === "success" ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <CheckCircle className="text-green-500" size={52} strokeWidth={1.5} />
              <h3 className="text-xl font-semibold text-gray-900">
                ¡Solicitud enviada!
              </h3>
              <p className="text-gray-500 text-sm max-w-xs">
                Hemos recibido tu solicitud. Nos pondremos en contacto en las próximas 24–48 horas hábiles.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              {/* Honeypot invisible */}
              <input type="text" name="website" tabIndex={-1} aria-hidden="true"
                className="absolute opacity-0 w-0 h-0 overflow-hidden pointer-events-none"
                autoComplete="off"
              />
              {/* Campos hidden */}
              <input type="hidden" name="serviceSlug" value={service.id} />
              <input type="hidden" name="serviceName" value={service.name} />

              {/* Nombre */}
              <div className="flex flex-col gap-1">
                <label htmlFor="q-name" className="text-sm font-medium text-gray-700">
                  Nombre completo <span className="text-brand-600">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  id="q-name" name="name" type="text" required
                  minLength={2} maxLength={200}
                  placeholder="Tu nombre"
                  className="input-field"
                />
              </div>

              {/* Correo */}
              <div className="flex flex-col gap-1">
                <label htmlFor="q-email" className="text-sm font-medium text-gray-700">
                  Correo electrónico <span className="text-brand-600">*</span>
                </label>
                <input
                  id="q-email" name="email" type="email" required
                  maxLength={320}
                  placeholder="correo@ejemplo.com"
                  className="input-field"
                />
              </div>

              {/* Organización */}
              <div className="flex flex-col gap-1">
                <label htmlFor="q-org" className="text-sm font-medium text-gray-700">
                  Organización / Institución
                </label>
                <input
                  id="q-org" name="organization" type="text"
                  maxLength={200}
                  placeholder="Nombre de tu organización (opcional)"
                  className="input-field"
                />
              </div>

              {/* Descripción del proyecto */}
              <div className="flex flex-col gap-1">
                <label htmlFor="q-desc" className="text-sm font-medium text-gray-700">
                  Descripción del proyecto <span className="text-brand-600">*</span>
                </label>
                <textarea
                  id="q-desc" name="description" required
                  minLength={20} maxLength={5000} rows={4}
                  placeholder="Describe brevemente tu proyecto, necesidades y expectativas..."
                  className="input-field resize-none"
                />
              </div>

              {/* Presupuesto estimado */}
              <div className="flex flex-col gap-1">
                <label htmlFor="q-budget" className="text-sm font-medium text-gray-700">
                  Presupuesto estimado
                </label>
                <select id="q-budget" name="budget" className="input-field bg-white">
                  <option value="">Seleccionar rango (opcional)</option>
                  {Object.entries(BUDGET_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Archivo adjunto */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Archivo adjunto (opcional)
                </label>
                <label
                  htmlFor="q-file"
                  className="
                    flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-200
                    rounded-lg cursor-pointer hover:border-brand-400 hover:bg-orange-50/50
                    transition-colors text-sm text-gray-500
                  "
                >
                  <Upload size={18} className="flex-shrink-0 text-gray-400" />
                  <span className="truncate">
                    {fileName ?? "PDF, DOCX, XLSX, imagen — máx. 10 MB"}
                  </span>
                  <input
                    id="q-file" name="file" type="file"
                    className="sr-only"
                    accept=".pdf,.docx,.xlsx,.xls,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {/* Error */}
              {(state === "error" || errorMsg) && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm" role="alert">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{errorMsg || "Error al enviar. Intenta de nuevo."}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={state === "loading"}
                className="
                  w-full py-3 px-6 bg-brand-600 hover:bg-brand-700
                  disabled:opacity-60 disabled:cursor-not-allowed
                  text-white font-semibold rounded-lg text-sm
                  flex items-center justify-center gap-2
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2
                  transition-colors
                "
              >
                {state === "loading" && <Loader2 size={16} className="animate-spin" />}
                {state === "loading" ? "Enviando..." : "Enviar solicitud"}
              </button>

              <p className="text-xs text-gray-400 text-center">
                Tu información es tratada con confidencialidad.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
