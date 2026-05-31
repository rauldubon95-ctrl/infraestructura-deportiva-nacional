"use client";

import { useState } from "react";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import { siteContent } from "@/config/content";
import { siteConfig } from "@/config/site.config";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";

type Status = "idle" | "loading" | "success" | "error";

export default function Contact() {
  const { contact } = siteContent;
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = {
      name:    (form.elements.namedItem("name")    as HTMLInputElement).value,
      email:   (form.elements.namedItem("email")   as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
      website: (form.elements.namedItem("website") as HTMLInputElement).value, // honeypot
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        setErrorMsg(body.error ?? "Error al enviar el mensaje.");
        setStatus("error");
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setErrorMsg("Error de red. Verifica tu conexión e intenta de nuevo.");
      setStatus("error");
    }
  }

  return (
    <section
      id="contacto"
      className="py-20 bg-white"
      aria-label="Formulario de contacto"
    >
      <div className="container mx-auto px-4">
        <SectionHeader
          eyebrow={contact.eyebrow}
          headline={contact.headline}
          description={contact.description}
        />

        <div className="max-w-2xl mx-auto">
          {status === "success" ? (
            <div className="text-center py-16">
              <CheckCircle
                className="w-16 h-16 text-green-500 mx-auto mb-4"
                aria-hidden="true"
              />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Mensaje enviado!
              </h3>
              <p className="text-gray-600">
                Gracias por contactarnos. Te responderemos a la brevedad.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-6 text-brand-600 hover:text-brand-700 font-medium underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate aria-label="Formulario de contacto">
              {/* Honeypot — invisible para usuarios, trampa para bots */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Nombre completo <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    minLength={2}
                    maxLength={200}
                    placeholder="Tu nombre"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Correo electrónico <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    maxLength={320}
                    placeholder="tu@correo.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Mensaje <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={5}
                    minLength={10}
                    maxLength={5000}
                    placeholder="¿En qué podemos ayudarte?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-shadow resize-y"
                  />
                </div>

                {status === "error" && (
                  <div
                    className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm"
                    role="alert"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  fullWidth
                  disabled={status === "loading"}
                  aria-busy={status === "loading"}
                >
                  {status === "loading" ? (
                    "Enviando…"
                  ) : (
                    <>
                      Enviar mensaje
                      <Send className="w-4 h-4" aria-hidden="true" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-400 text-center">
                  También puedes escribirnos a{" "}
                  <a
                    href={`mailto:${siteConfig.contact.email}`}
                    className="text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded"
                  >
                    {siteConfig.contact.email}
                  </a>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
