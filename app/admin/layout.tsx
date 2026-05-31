"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Inbox, MessageSquare, Settings, LogOut, Shield, Menu, X } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/browser";

const NAV = [
  { href: "/admin/cotizaciones", label: "Cotizaciones", icon: MessageSquare },
  { href: "/admin/mensajes",     label: "Mensajes",     icon: Inbox },
  { href: "/admin/servicios",    label: "Servicios",    icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [ready,    setReady]    = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [email,    setEmail]    = useState("");

  // Verificar sesión al cargar
  useEffect(() => {
    async function checkAuth() {
      if (pathname === "/admin/login") { setReady(true); return; }

      try {
        const supabase = createBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.replace("/admin/login");
          return;
        }

        // Verificar autorización contra la API
        const res = await fetch("/api/admin/quotations?page=1", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (res.status === 401 || res.status === 403) {
          await supabase.auth.signOut();
          router.replace("/admin/login");
          return;
        }

        setEmail(session.user.email ?? "");
        setReady(true);
      } catch {
        router.replace("/admin/login");
      }
    }
    checkAuth();
  }, [pathname, router]);

  async function handleSignOut() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  // Login page: no aplica layout
  if (pathname === "/admin/login") return <>{children}</>;

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Sidebar desktop ──────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-56 flex-col bg-white border-r border-gray-100 fixed inset-y-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="text-white" size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">Admin DSF</p>
            <p className="text-[10px] text-gray-400 truncate">{email}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1" aria-label="Navegación admin">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${pathname.startsWith(href)
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
              `}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Sign out */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={17} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Mobile topbar ────────────────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 bg-white border-b border-gray-100 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <Shield className="text-white" size={14} />
          </div>
          <span className="text-sm font-bold text-gray-900">Admin DSF</span>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-20 bg-gray-950/40" onClick={() => setMenuOpen(false)}>
          <div className="absolute top-14 inset-x-0 bg-white border-b border-gray-100 p-4 space-y-1" onClick={(e) => e.stopPropagation()}>
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${pathname.startsWith(href) ? "bg-brand-50 text-brand-700" : "text-gray-600"}`}
              >
                <Icon size={17} />{label}
              </Link>
            ))}
            <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600">
              <LogOut size={17} />Cerrar sesión
            </button>
          </div>
        </div>
      )}

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 lg:ml-56 pt-14 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
