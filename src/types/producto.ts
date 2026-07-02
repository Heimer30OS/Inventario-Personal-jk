export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  cantidad: number;
  precio: number;
  activo: boolean;
  created_at?: string;
}

export type ProductoInput = Omit<Producto, "id" | "created_at">;

export function estadoStock(p: Pick<Producto, "activo" | "cantidad">): string {
  if (!p.activo) return "Oculto";
  if (p.cantidad === 0) return "Agotado";
  if (p.cantidad <= 5) return "Stock Bajo";
  return "Disponible";
}

export function estaDisponible(p: Pick<Producto, "activo" | "cantidad">): boolean {
  return p.activo && p.cantidad > 0;
}
