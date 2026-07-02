import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InventarioApp from "@/components/InventarioApp";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <InventarioApp email={user.email ?? null} />;
}
