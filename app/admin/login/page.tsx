"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    const password = (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError((json as Record<string, string>).error ?? "Contraseña incorrecta.");
        return;
      }

      router.push("/admin/cotizaciones");
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl mb-4 shadow-lg">
            <Shield className="text-white" size={26} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Panel Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Asociación Deportes Sin Fronteras</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password" name="password" type="password" required autoComplete="current-password"
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm" role="alert">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Acceso restringido a usuarios autorizados.
        </p>
      </div>
    </div>
  );
}
