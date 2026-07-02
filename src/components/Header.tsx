"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Header({ email }: { email: string | null }) {
  const router = useRouter();

  async function cerrarSesion() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="flex h-14 items-center justify-between bg-brand px-5 text-white">
      <span className="font-display text-base font-bold tracking-wide">
        SISTEMA DE GESTIÓN DE INVENTARIO
      </span>
      <div className="flex items-center gap-4 text-sm">
        {email && <span className="hidden text-brand-light sm:inline">{email}</span>}
        <button
          onClick={cerrarSesion}
          className="rounded-lg bg-danger px-3.5 py-1.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
