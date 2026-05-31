"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, Clock, ChevronLeft, ChevronRight, RefreshCw, Eye } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/browser";
import type { Tables } from "@/lib/supabase/types";

type Quotation = Tables<"quotation_requests">;

const BUDGET_DISPLAY: Record<string, string> = {
  "menos-500": "< $500", "500-1000": "$500–$1K", "1000-3000": "$1K–$3K",
  "3000-5000": "$3K–$5K", "mas-5000": "> $5K", "por-definir": "Por definir",
};

export default function CotizacionesPage() {
  const [data,     setData]     = useState<Quotation[]>([]);
  const [count,    setCount]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [filter,   setFilter]   = useState<"all" | "pending" | "reviewed">("all");
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<Quotation | null>(null);

  const LIMIT = 20;
  const totalPages = Math.ceil(count / LIMIT);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const params = new URLSearchParams({ page: String(page) });
      if (filter === "pending")  params.set("reviewed", "false");
      if (filter === "reviewed") params.set("reviewed", "true");

      const res = await fetch(`/api/admin/quotations?${params}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      setData(json.data ?? []);
      setCount(json.count ?? 0);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function toggleReviewed(q: Quotation) {
    const supabase = createBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await fetch("/api/admin/quotations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ id: q.id, reviewed: !q.reviewed }),
    });
    fetchData();
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cotizaciones</h1>
          <p className="text-sm text-gray-500 mt-0.5">{count} solicitudes en total</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filtro */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
            {(["all", "pending", "reviewed"] as const).map((f) => (
              <button key={f} onClick={() => { setFilter(f); setPage(1); }}
                className={`px-3 py-2 transition-colors ${filter === f ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
              >
                {f === "all" ? "Todos" : f === "pending" ? "Pendientes" : "Revisados"}
              </button>
            ))}
          </div>
          <button onClick={fetchData} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors" aria-label="Actualizar">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Clock size={32} strokeWidth={1.5} className="mb-2" />
            <p className="text-sm">No hay cotizaciones{filter !== "all" ? " en este filtro" : ""}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Nombre", "Servicio", "Fecha", "Presupuesto", "Estado", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 truncate max-w-[140px]">{q.name}</p>
                      <p className="text-xs text-gray-400 truncate">{q.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-700 truncate max-w-[160px] block">{q.service_name}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {new Date(q.created_at).toLocaleDateString("es-GT", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {q.budget ? (BUDGET_DISPLAY[q.budget] ?? q.budget) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${q.reviewed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {q.reviewed ? <><CheckCircle size={11} /> Revisado</> : <><Clock size={11} /> Pendiente</>}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelected(q)} className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" aria-label="Ver detalle">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => toggleReviewed(q)}
                          className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors ${q.reviewed ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                        >
                          {q.reviewed ? "Marcar pendiente" : "Marcar revisado"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>Página {page} de {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
              className="p-1.5 rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}
              className="p-1.5 rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal detalle */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Detalle de cotización</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 text-xl leading-none">&times;</button>
            </div>
            <dl className="px-6 py-5 grid grid-cols-2 gap-4 text-sm">
              {[
                ["Nombre",        selected.name],
                ["Correo",        selected.email],
                ["Organización",  selected.organization ?? "—"],
                ["Servicio",      selected.service_name],
                ["Presupuesto",   selected.budget ? (BUDGET_DISPLAY[selected.budget] ?? selected.budget) : "—"],
                ["Archivo",       selected.file_name ?? "Sin adjunto"],
                ["Fecha",         new Date(selected.created_at).toLocaleString("es-GT")],
              ].map(([label, value]) => (
                <div key={label} className="col-span-1">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{label}</dt>
                  <dd className="text-gray-900 break-all">{value}</dd>
                </div>
              ))}
              <div className="col-span-2">
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Descripción</dt>
                <dd className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.description}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
