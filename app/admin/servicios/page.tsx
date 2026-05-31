"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { Plus, Edit2, Eye, EyeOff, Loader2, X, CheckCircle } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/browser";
import { categoryMeta, CATEGORIES_ORDER, type ServiceCategory } from "@/config/services.config";
import type { Tables } from "@/lib/supabase/types";

type ServiceRow = Tables<"services">;

const ICONS = [
  "FilePlus2","GitBranch","LayoutGrid","Activity","Target","ClipboardList","MonitorCheck","Building2",
  "LayoutDashboard","BarChart2","PieChart","TrendingUp","DatabaseZap","Zap","LineChart","Database",
  "FileBarChart","Search","BookOpen","GraduationCap","Users","PenTool","FileCheck","FileText",
];

const emptyForm = {
  id: "", slug: "", name: "", description: "", category: "formulacion" as ServiceCategory,
  icon_name: "FileText", featured: false, active: true, sort_order: 0,
};

export default function ServiciosAdminPage() {
  const [services, setServices]     = useState<ServiceRow[]>([]);
  const [loading,  setLoading]      = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [formData, setFormData]     = useState(emptyForm);
  const [saving,   setSaving]       = useState(false);
  const [saveOk,   setSaveOk]       = useState(false);
  const [saveErr,  setSaveErr]      = useState("");

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/admin/services", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      setServices(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  function openNew() {
    setFormData(emptyForm);
    setSaveOk(false); setSaveErr("");
    setShowForm(true);
  }

  function openEdit(s: ServiceRow) {
    setFormData({
      id: s.id, slug: s.slug, name: s.name, description: s.description,
      category: s.category as ServiceCategory, icon_name: s.icon_name,
      featured: s.featured, active: s.active, sort_order: s.sort_order,
    });
    setSaveOk(false); setSaveErr("");
    setShowForm(true);
  }

  async function toggleActive(s: ServiceRow) {
    const supabase = createBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ id: s.id, slug: s.slug, name: s.name, description: s.description,
        category: s.category, icon_name: s.icon_name, featured: s.featured, active: !s.active, sort_order: s.sort_order }),
    });
    fetchServices();
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    setSaving(true); setSaveErr(""); setSaveOk(false);

    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const payload = { ...formData, id: formData.id || undefined };

      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) { setSaveErr(json.error ?? "Error al guardar."); return; }

      setSaveOk(true);
      fetchServices();
      setTimeout(() => { setShowForm(false); setSaveOk(false); }, 800);
    } catch {
      setSaveErr("Error de red.");
    } finally {
      setSaving(false);
    }
  }

  const byCategory = CATEGORIES_ORDER.map((cat) => ({
    cat, label: categoryMeta[cat].label,
    items: services.filter((s) => s.category === cat),
  }));

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Servicios</h1>
          <p className="text-sm text-gray-500 mt-0.5">{services.length} servicios registrados</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors">
          <Plus size={16} /> Nuevo servicio
        </button>
      </div>

      {/* Lista por categoría */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {byCategory.map(({ cat, label, items }) => {
            const meta = categoryMeta[cat];
            return (
              <div key={cat}>
                <h2 className={`text-xs font-bold uppercase tracking-widest mb-3 ${meta.textClass}`}>{label}</h2>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                  {items.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-400">Sin servicios en esta categoría.</p>
                  ) : items.map((s) => (
                    <div key={s.id} className={`flex items-center gap-4 px-4 py-3 ${!s.active ? "opacity-50" : ""}`}>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.active ? "bg-green-400" : "bg-gray-300"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                        <p className="text-xs text-gray-400 truncate">{s.description}</p>
                      </div>
                      {s.featured && <span className="text-[10px] font-bold uppercase text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">Destacado</span>}
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" aria-label="Editar">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => toggleActive(s)} className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          aria-label={s.active ? "Ocultar" : "Mostrar"}>
                          {s.active ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="font-bold text-gray-900">{formData.id ? "Editar servicio" : "Nuevo servicio"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 flex flex-col gap-4">
              {[
                { id: "s-name",  label: "Nombre",      name: "name",  type: "text",   required: true,  max: 120 },
                { id: "s-slug",  label: "Slug (ID)",   name: "slug",  type: "text",   required: true,  max: 80, pattern: "[a-z0-9-]+" },
              ].map(({ id, label, name, ...rest }) => (
                <div key={id} className="flex flex-col gap-1">
                  <label htmlFor={id} className="text-sm font-medium text-gray-700">{label} {rest.required && <span className="text-brand-600">*</span>}</label>
                  <input id={id} name={name} value={(formData as Record<string, unknown>)[name] as string}
                    onChange={(e) => setFormData((f) => ({ ...f, [name]: e.target.value }))}
                    className="input-field" {...rest} />
                </div>
              ))}

              <div className="flex flex-col gap-1">
                <label htmlFor="s-desc" className="text-sm font-medium text-gray-700">Descripción <span className="text-brand-600">*</span></label>
                <textarea id="s-desc" required rows={3} maxLength={600}
                  value={formData.description}
                  onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                  className="input-field resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="s-cat" className="text-sm font-medium text-gray-700">Categoría</label>
                  <select id="s-cat" value={formData.category}
                    onChange={(e) => setFormData((f) => ({ ...f, category: e.target.value as ServiceCategory }))}
                    className="input-field bg-white">
                    {CATEGORIES_ORDER.map((c) => (
                      <option key={c} value={c}>{categoryMeta[c].label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="s-icon" className="text-sm font-medium text-gray-700">Icono</label>
                  <select id="s-icon" value={formData.icon_name}
                    onChange={(e) => setFormData((f) => ({ ...f, icon_name: e.target.value }))}
                    className="input-field bg-white">
                    {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="s-order" className="text-sm font-medium text-gray-700">Orden</label>
                  <input id="s-order" type="number" min={0} max={9999}
                    value={formData.sort_order}
                    onChange={(e) => setFormData((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                    className="input-field" />
                </div>
                <div className="flex flex-col gap-3 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input type="checkbox" checked={formData.featured}
                      onChange={(e) => setFormData((f) => ({ ...f, featured: e.target.checked }))}
                      className="rounded" />
                    Destacado
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input type="checkbox" checked={formData.active}
                      onChange={(e) => setFormData((f) => ({ ...f, active: e.target.checked }))}
                      className="rounded" />
                    Activo
                  </label>
                </div>
              </div>

              {saveErr && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{saveErr}</p>}
              {saveOk  && <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg flex items-center gap-2"><CheckCircle size={14} /> Guardado correctamente.</p>}

              <button type="submit" disabled={saving}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
