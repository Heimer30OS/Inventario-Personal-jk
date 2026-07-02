"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Producto } from "@/types/producto";
import { estadoStock, estaDisponible } from "@/types/producto";

const COLORES_ESTADO: Record<string, string> = {
  Disponible: "#e5f7ef",
  "Stock Bajo": "#fdf1e2",
  Agotado: "#fbeae8",
  Oculto: "#f5f7fa",
};

const BARRAS = ["#3498db", "#2ecc71", "#e74c3c", "#9b59b6", "#e67e22", "#1abc9c"];

export default function PanelExistencias({
  productos,
}: {
  productos: Producto[];
}) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  const resumen = useMemo(() => {
    let disponibles = 0,
      stockBajo = 0,
      agotadosOcultos = 0,
      valor = 0;
    for (const p of productos) {
      const est = estadoStock(p);
      if (est === "Disponible") disponibles++;
      else if (est === "Stock Bajo") stockBajo++;
      else agotadosOcultos++;
      if (p.activo) valor += p.cantidad * p.precio;
    }
    return {
      total: productos.length,
      disponibles,
      stockBajo,
      agotadosOcultos,
      valor,
    };
  }, [productos]);

  const filtrados = useMemo(() => {
    const f = busqueda.toLowerCase().trim();
    return productos.filter((p) => {
      const matchTexto =
        !f ||
        p.nombre.toLowerCase().includes(f) ||
        p.categoria.toLowerCase().includes(f);
      const matchEstado =
        filtroEstado === "Todos" || filtroEstado === estadoStock(p);
      return matchTexto && matchEstado;
    });
  }, [busqueda, filtroEstado, productos]);

  const datosGrafico = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const p of productos) {
      if (!p.activo) continue;
      mapa.set(p.categoria, (mapa.get(p.categoria) ?? 0) + p.cantidad);
    }
    return Array.from(mapa.entries()).map(([categoria, cantidad]) => ({
      categoria,
      cantidad,
    }));
  }, [productos]);

  return (
    <div className="space-y-5">
      <h2 className="font-display text-lg font-bold text-brand">
        Existencias del Inventario
      </h2>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Tarjeta titulo="Total productos" valor={resumen.total} color="#34495e" />
        <Tarjeta titulo="Disponibles" valor={resumen.disponibles} color="#1f9d6b" />
        <Tarjeta titulo="Stock bajo" valor={resumen.stockBajo} color="#e08a2c" />
        <Tarjeta
          titulo="Agotados / ocultos"
          valor={resumen.agotadosOcultos}
          color="#c0392b"
        />
        <Tarjeta
          titulo="Valor del stock"
          valor={`Q ${resumen.valor.toFixed(2)}`}
          color="#1e4ea8"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o categoría..."
          className="w-56 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
        />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
        >
          {["Todos", "Disponible", "Stock Bajo", "Agotado", "Oculto"].map(
            (opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            )
          )}
        </select>
      </div>

      {/* Tabla de existencias */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="max-h-[360px] overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-brand text-white">
              <tr>
                <th className="px-3 py-2.5 font-semibold">Nombre</th>
                <th className="px-3 py-2.5 font-semibold">Categoría</th>
                <th className="px-3 py-2.5 font-semibold">Cantidad</th>
                <th className="px-3 py-2.5 font-semibold">Precio Unit.</th>
                <th className="px-3 py-2.5 font-semibold">Valor Total</th>
                <th className="px-3 py-2.5 font-semibold">Disponible</th>
                <th className="px-3 py-2.5 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => {
                const estado = estadoStock(p);
                const disponible = estaDisponible(p);
                return (
                  <tr
                    key={p.id}
                    style={{ backgroundColor: COLORES_ESTADO[estado] }}
                    className="border-t border-border"
                  >
                    <td className="px-3 py-2.5">{p.nombre}</td>
                    <td className="px-3 py-2.5">{p.categoria}</td>
                    <td className="px-3 py-2.5">{p.cantidad}</td>
                    <td className="px-3 py-2.5">Q {p.precio.toFixed(2)}</td>
                    <td className="px-3 py-2.5">
                      Q {(p.cantidad * p.precio).toFixed(2)}
                    </td>
                    <td
                      className={`px-3 py-2.5 font-semibold ${
                        disponible ? "text-success" : "text-danger"
                      }`}
                    >
                      {disponible ? "Sí" : "No"}
                    </td>
                    <td className="px-3 py-2.5">{estado}</td>
                  </tr>
                );
              })}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-muted">
                    No hay productos que coincidan con el filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfico por categoría */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-3 font-display text-base font-bold text-brand">
          Distribución por Categoría
        </h3>
        {datosGrafico.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">Sin datos</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={datosGrafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dde3ec" />
              <XAxis dataKey="categoria" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                {datosGrafico.map((_, i) => (
                  <Cell key={i} fill={BARRAS[i % BARRAS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function Tarjeta({
  titulo,
  valor,
  color,
}: {
  titulo: string;
  valor: string | number;
  color: string;
}) {
  return (
    <div
      className="rounded-xl border border-border bg-surface p-4"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <p className="text-xs text-muted">{titulo}</p>
      <p className="mt-1 font-display text-xl font-bold" style={{ color }}>
        {valor}
      </p>
    </div>
  );
}
