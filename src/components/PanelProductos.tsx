"use client";

import { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import type { Producto, ProductoInput } from "@/types/producto";
import { estadoStock } from "@/types/producto";
import {
  actualizarProducto,
  alternarActivo,
  crearProducto,
} from "@/lib/productos";

const FORM_VACIO: ProductoInput = {
  nombre: "",
  descripcion: "",
  categoria: "",
  cantidad: 0,
  precio: 0,
  activo: true,
};

const ESTADO_ESTILO: Record<string, string> = {
  Disponible: "bg-success-light text-success",
  "Stock Bajo": "bg-warning-light text-warning",
  Agotado: "bg-danger-light text-danger",
  Oculto: "bg-surface-muted text-muted",
};

export default function PanelProductos({
  productos,
  onCambio,
}: {
  productos: Producto[];
  onCambio: () => void | Promise<void>;
}) {
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState<ProductoInput>(FORM_VACIO);
  const [idEditando, setIdEditando] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtrados = useMemo(() => {
    const f = busqueda.toLowerCase().trim();
    if (!f) return productos;
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(f) ||
        p.categoria.toLowerCase().includes(f)
    );
  }, [busqueda, productos]);

  function limpiarFormulario() {
    setForm(FORM_VACIO);
    setIdEditando(null);
    setError(null);
  }

  function cargarEnFormulario(p: Producto) {
    setIdEditando(p.id);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion,
      categoria: p.categoria,
      cantidad: p.cantidad,
      precio: p.precio,
      activo: p.activo,
    });
    setMensaje(null);
    setError(null);
  }

  async function guardarProducto() {
    setError(null);
    if (!form.nombre.trim() || !form.categoria.trim()) {
      setError("Completa los campos obligatorios: nombre y categoría.");
      return;
    }
    if (form.cantidad < 0 || form.precio < 0) {
      setError("Cantidad y precio deben ser números mayores o iguales a 0.");
      return;
    }

    setGuardando(true);
    try {
      if (idEditando) {
        await actualizarProducto(idEditando, form);
        setMensaje("Producto actualizado correctamente.");
      } else {
        await crearProducto(form);
        setMensaje("Producto insertado correctamente.");
      }
      limpiarFormulario();
      await onCambio();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar el producto.");
    } finally {
      setGuardando(false);
    }
  }

  async function ocultarMostrar(p: Producto) {
    const accion = p.activo ? "ocultar" : "mostrar";
    if (!confirm(`¿Deseas ${accion} este producto? Seguirá existiendo en la base de datos.`)) {
      return;
    }
    try {
      await alternarActivo(p.id, !p.activo);
      await onCambio();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al actualizar el producto.");
    }
  }

  function exportarExcel() {
    const filas = productos.map((p) => ({
      ID: p.id,
      Nombre: p.nombre,
      Descripción: p.descripcion,
      Categoría: p.categoria,
      Cantidad: p.cantidad,
      Precio: p.precio,
      Estado: estadoStock(p),
    }));
    const hoja = XLSX.utils.json_to_sheet(filas);
    hoja["!cols"] = [
      { wch: 36 },
      { wch: 26 },
      { wch: 34 },
      { wch: 18 },
      { wch: 10 },
      { wch: 10 },
      { wch: 14 },
    ];
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Inventario");
    const fecha = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    XLSX.writeFile(libro, `Inventario_${fecha}.xlsx`);
  }

  async function importarTXT(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    const texto = await archivo.text();
    const lineas = texto.split(/\r?\n/);

    const nuevos: ProductoInput[] = [];
    for (const lineaRaw of lineas) {
      const linea = lineaRaw.trim();
      if (!linea || linea.startsWith("#")) continue;
      const partes = linea.split("|");
      if (partes.length < 5) continue;
      const cantidad = parseInt(partes[3].trim(), 10);
      const precio = parseFloat(partes[4].trim().replace(",", "."));
      if (Number.isNaN(cantidad) || Number.isNaN(precio)) continue;
      nuevos.push({
        nombre: partes[0].trim(),
        descripcion: partes[1].trim(),
        categoria: partes[2].trim(),
        cantidad,
        precio,
        activo: true,
      });
    }

    if (nuevos.length === 0) {
      alert(
        "No se encontraron productos válidos.\n\nFormato esperado por línea:\nNOMBRE|DESCRIPCION|CATEGORIA|CANTIDAD|PRECIO"
      );
    } else {
      try {
        for (const n of nuevos) {
          await crearProducto(n);
        }
        setMensaje(`Se importaron ${nuevos.length} productos correctamente.`);
        await onCambio();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al importar.");
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="space-y-5">
      {/* Barra superior */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-lg font-bold text-brand">
          Gestión de Productos
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o categoría..."
            className="w-56 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
          />
          <button
            onClick={exportarExcel}
            className="rounded-lg bg-success px-3.5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Exportar Excel
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg bg-slate-500 px-3.5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Importar TXT
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            className="hidden"
            onChange={importarTXT}
          />
        </div>
      </div>

      {mensaje && (
        <div className="rounded-lg border border-success/20 bg-success-light px-3 py-2 text-sm text-success">
          {mensaje}
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="max-h-[420px] overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-brand text-white">
              <tr>
                <th className="px-3 py-2.5 font-semibold">Nombre</th>
                <th className="px-3 py-2.5 font-semibold">Categoría</th>
                <th className="px-3 py-2.5 font-semibold">Cantidad</th>
                <th className="px-3 py-2.5 font-semibold">Precio</th>
                <th className="px-3 py-2.5 font-semibold">Estado</th>
                <th className="px-3 py-2.5 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => {
                const estado = estadoStock(p);
                return (
                  <tr
                    key={p.id}
                    className="border-t border-border hover:bg-surface-muted"
                  >
                    <td className="px-3 py-2.5">{p.nombre}</td>
                    <td className="px-3 py-2.5">{p.categoria}</td>
                    <td className="px-3 py-2.5">{p.cantidad}</td>
                    <td className="px-3 py-2.5">Q {p.precio.toFixed(2)}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ESTADO_ESTILO[estado]}`}
                      >
                        {estado}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        onClick={() => cargarEnFormulario(p)}
                        className="mr-2 text-sm font-medium text-brand hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => ocultarMostrar(p)}
                        className="text-sm font-medium text-danger hover:underline"
                      >
                        {p.activo ? "Ocultar" : "Mostrar"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted">
                    No hay productos que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formulario */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-brand">
            Formulario de Producto
          </h3>
          <span className="text-xs italic text-muted">
            {idEditando ? `Editando producto` : "Nuevo producto"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
          <div className="sm:col-span-6">
            <label className="mb-1 block text-xs font-semibold text-foreground">
              Nombre *
            </label>
            <input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-foreground">
              Categoría *
            </label>
            <input
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-foreground">
              Cantidad *
            </label>
            <input
              type="number"
              min={0}
              value={form.cantidad}
              onChange={(e) =>
                setForm({ ...form, cantidad: Number(e.target.value) })
              }
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-foreground">
              Precio (Q) *
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.precio}
              onChange={(e) =>
                setForm({ ...form, precio: Number(e.target.value) })
              }
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
            />
          </div>

          <div className="sm:col-span-6">
            <label className="mb-1 block text-xs font-semibold text-foreground">
              Descripción
            </label>
            <textarea
              rows={3}
              value={form.descripcion}
              onChange={(e) =>
                setForm({ ...form, descripcion: e.target.value })
              }
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-danger/20 bg-danger-light px-3 py-2 text-sm text-danger">
            {error}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={limpiarFormulario}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-muted"
          >
            Limpiar
          </button>
          <button
            onClick={guardarProducto}
            disabled={guardando}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      <p className="text-xs italic text-muted">
        Doble clic (o &quot;Editar&quot;) en una fila para modificarla · Formato TXT:
        NOMBRE|DESCRIPCION|CATEGORIA|CANTIDAD|PRECIO
      </p>
    </div>
  );
}
