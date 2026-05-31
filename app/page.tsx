import { activeSections } from "@/config/sections.config";

// Orquestador de secciones — solo composición, cero lógica de presentación.
// Para agregar/quitar secciones, editar config/sections.config.ts.
export default function Home() {
  return (
    <>
      {activeSections.map(({ key, Component }) => (
        <Component key={key} />
      ))}
    </>
  );
}
