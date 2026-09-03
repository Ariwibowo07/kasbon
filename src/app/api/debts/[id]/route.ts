import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { debtUpdateSchema } from "@/lib/validation";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Kamu harus login dulu." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body request bukan JSON yang valid." },
      { status: 400 }
    );
  }

  const parsed = debtUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Input tidak valid.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { settled, ...fields } = parsed.data;

  const updatePayload: Record<string, unknown> = { ...fields };
  if (typeof settled === "boolean") {
    updatePayload.settled_at = settled ? new Date().toISOString() : null;
  }

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json(
      { error: "Tidak ada field yang diupdate." },
      { status: 400 }
    );
  }

  // RLS (user_id = auth.uid()) memastikan user cuma bisa update row miliknya
  // sendiri. .eq("user_id", user.id) di sini sebagai defense-in-depth, bukan
  // satu-satunya proteksi.
  const { data, error } = await supabase
    .from("debts")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Catatan tidak ditemukan atau gagal diupdate." },
      { status: 404 }
    );
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Kamu harus login dulu." },
      { status: 401 }
    );
  }

  const { error, count } = await supabase
    .from("debts")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "Gagal menghapus catatan." },
      { status: 500 }
    );
  }

  if (!count) {
    return NextResponse.json(
      { error: "Catatan tidak ditemukan." },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: { id } });
}
