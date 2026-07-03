"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "@/components/Header";
import PanelProductos from "@/components/PanelProductos";
import PanelExistencias from "@/components/PanelExistencias";
import { listarProductos } from "@/lib/productos";
import type { Producto } from "@/types/producto";

export default function InventarioApp({ email }: { email: string | null }) {
  const [tab, setTab] = useState<"productos" | "existencias">("productos");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      const data = await listarProductos();
      setProductos(data);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo conectar con la base de datos."
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header email={email} />

      <div className="border-b border-border bg-surface px-5">
        <nav className="flex gap-6">
          {(
            [
              ["productos", "Productos"],
              ["existencias", "Existencias"],
            ] as const
          ).map(([valor, etiqueta]) => (
            <button
              key={valor}
              onClick={() => setTab(valor)}
              className={`border-b-2 px-1 py-3 text-sm font-semibold transition ${
                tab === valor
                  ? "border-brand text-brand"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {etiqueta}
            </button>
          ))}
        </nav>
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6">
        {cargando ? (
          <p className="py-16 text-center text-sm text-muted">
            Cargando inventario...
          </p>
        ) : error ? (
          <div className="rounded-lg border border-danger/20 bg-danger-light px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : tab === "productos" ? (
          <PanelProductos productos={productos} onCambio={cargar} />
        ) : (
          <PanelExistencias productos={productos} />
        )}
      </main>

      <footer className="flex items-center justify-between border-t border-border bg-surface-muted px-5 py-2.5 text-xs text-muted">
        <span>Gestión de Inventario · Datos en la nube Jk ♥</span>
        <span className="italic">
          Importar Formato en TXT: NOMBRE|DESCRIPCION|CATEGORIA|CANTIDAD|PRECIO
        </span>
      </footer>
    </div>
  );
}
