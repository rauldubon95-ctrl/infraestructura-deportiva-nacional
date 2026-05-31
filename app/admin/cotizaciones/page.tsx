"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, Clock, ChevronLeft, ChevronRight, RefreshCw, Eye, Mail, MailCheck } from "lucide-react";
import type { Tables } from "@/lib/supabase/types";

type Quotation = Tables<"quotation_requests"> & {
  replied_at?: string | null;
  reply_text?:  string | null;
};

const BUDGET_DISPLAY: Record<string, string> = {
  "menos-500": "< $500", "500-1000": "$500–$1K", "1000-3000": "$1K–$3K",
  "3000-5000": "$3K–$5K", "mas-5000": "> $5K", "por-definir": "Por definir",
};

function buildDefaultBody(q: Quotation): string {
  return `Estimado/a ${q.name},

Gracias por su interés en nuestros servicios. Hemos recibido su solicitud relacionada con "${q.service_name}" y con gusto le atenderemos.

[Escriba aquí su respuesta personalizada...]

Quedamos a su disposición para cualquier consulta adicional.

Atentamente,
Equipo Deportes Sin Fronteras`;
}

export default function CotizacionesPage() {
  const [data,     setData]     = useState<Quotation[]>([]);
  const [count,    setCount]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [filter,   setFilter]   = useState<"all" | "pending" | "reviewed">("all");
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<Quotation | null>(null);
  const [replying, setReplying] = useState<Quotation | null>(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyBody,    setReplyBody]    = useState("");
  const [sendStatus,   setSendStatus]   = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [sendError,    setSendError]    = useState("");

  const LIMIT = 20;
  const totalPages = Math.ceil(count / LIMIT);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (filter === "pending")  params.set("reviewed", "false");
      if (filter === "reviewed") params.set("reviewed", "true");

      const res  = await fetch(`/api/admin/quotations?${params}`);
      const json = await res.json();
      setData(json.data ?? []);
      setCount(json.count ?? 0);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function toggleReviewed(q: Quotation) {
    await fetch("/api/admin/quotations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: q.id, reviewed: !q.reviewed }),
    });
    fetchData();
  }

  function openReply(q: Quotation) {
    setReplying(q);
    setReplySubject(`Re: Cotización de servicio — ${q.service_name}`);
    setReplyBody(buildDefaultBody(q));
    setSendStatus("idle");
    setSendError("");
  }

  async function sendReply() {
    if (!replying) return;
    setSendStatus("sending");
    setSendError("");
    try {
      const res = await fetch("/api/admin/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id:             replying.id,
          type:           "quotation",
          recipientName:  replying.name,
          recipientEmail: replying.email,
          subject:        replySubject,
          body:           replyBody,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setSendStatus("error"); setSendError(json.error ?? "Error desconocido"); return; }
      setSendStatus("ok");
      fetchData();
    } catch {
      setSendStatus("error");
      setSendError("Error de red. Intenta de nuevo.");
    }
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
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium w-fit ${q.reviewed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {q.reviewed ? <><CheckCircle size={11} /> Revisado</> : <><Clock size={11} /> Pendiente</>}
                        </span>
                        {q.replied_at && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-700 w-fit">
                            <MailCheck size={11} /> Respondido
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelected(q)} className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" aria-label="Ver detalle">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => openReply(q)} disabled={!!q.replied_at}
                          className={`p-1.5 rounded-md transition-colors ${q.replied_at ? "text-blue-400 cursor-default" : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"}`}
                          aria-label={q.replied_at ? "Ya respondido" : "Responder por email"}>
                          {q.replied_at ? <MailCheck size={14} /> : <Mail size={14} />}
                        </button>
                        <button onClick={() => toggleReviewed(q)}
                          className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors ${q.reviewed ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                        >
                          {q.reviewed ? "Pendiente" : "Revisado"}
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

      {/* Modal — Detalle */}
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
                ["Respondido",    selected.replied_at ? new Date(selected.replied_at).toLocaleString("es-GT") : "No"],
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
              {selected.reply_text && (
                <div className="col-span-2">
                  <dt className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Respuesta enviada</dt>
                  <dd className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-blue-50 rounded-lg p-3 text-sm">{selected.reply_text}</dd>
                </div>
              )}
            </dl>
            <div className="px-6 pb-5 flex justify-end gap-3">
              {!selected.replied_at && (
                <button onClick={() => { setSelected(null); openReply(selected); }}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
                  <Mail size={15} /> Responder
                </button>
              )}
              <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal — Responder */}
      {replying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="font-bold text-gray-900">Responder cotización</h2>
                <p className="text-xs text-gray-400 mt-0.5">Para: {replying.name} &lt;{replying.email}&gt;</p>
              </div>
              <button onClick={() => setReplying(null)} className="text-gray-400 hover:text-gray-700 text-xl leading-none">&times;</button>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Asunto</label>
                <input value={replySubject} onChange={(e) => setReplySubject(e.target.value)}
                  className="input-field" maxLength={200} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Mensaje</label>
                <textarea value={replyBody} onChange={(e) => setReplyBody(e.target.value)}
                  rows={14} maxLength={10000}
                  className="input-field resize-none font-mono text-xs leading-relaxed" />
              </div>
              {sendStatus === "error" && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{sendError}</p>
              )}
              {sendStatus === "ok" && (
                <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 flex items-center gap-2">
                  <MailCheck size={15} /> Respuesta enviada correctamente.
                </p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
              <button onClick={() => setReplying(null)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={sendReply} disabled={sendStatus === "sending" || sendStatus === "ok"}
                className="flex items-center gap-2 px-5 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-60">
                {sendStatus === "sending" ? (
                  <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enviando…</>
                ) : (
                  <><Mail size={15} /> Enviar respuesta</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
