import { createClient } from "@/lib/supabase/client";
import type { Producto, ProductoInput } from "@/types/producto";

const TABLA = "productos";

export async function listarProductos(): Promise<Producto[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(TABLA)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Producto[];
}

export async function crearProducto(input: ProductoInput): Promise<Producto> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from(TABLA)
    .insert([{ ...input, created_by: user?.id }])
    .select()
    .single();

  if (error) throw error;
  return data as Producto;
}

export async function actualizarProducto(
  id: string,
  input: Partial<ProductoInput>
): Promise<Producto> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(TABLA)
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Producto;
}

export async function alternarActivo(
  id: string,
  activo: boolean
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from(TABLA)
    .update({ activo })
    .eq("id", id);

  if (error) throw error;
}
