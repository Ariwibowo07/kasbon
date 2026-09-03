import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { debtInputSchema, listQuerySchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
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

  const searchParams = request.nextUrl.searchParams;
  const parsedQuery = listQuerySchema.safeParse({
    status: searchParams.get("status") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    dir: searchParams.get("dir") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: "Parameter query tidak valid.", details: parsedQuery.error.flatten() },
      { status: 400 }
    );
  }

  const { status, type, search, sort, dir } = parsedQuery.data;

  let query = supabase.from("debts").select("*").eq("user_id", user.id);

  if (status === "unpaid") query = query.is("settled_at", null);
  if (status === "settled") query = query.not("settled_at", "is", null);
  if (type !== "all") query = query.eq("type", type);
  if (search) query = query.ilike("counterpart_name", `%${search}%`);

  query = query.order(sort, { ascending: dir === "asc" });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data hutang piutang." },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
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

  const parsed = debtInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Input tidak valid.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { type, counterpart_name, amount, due_date, note } = parsed.data;

  const { data, error } = await supabase
    .from("debts")
    .insert({
      user_id: user.id,
      type,
      counterpart_name,
      amount,
      due_date: due_date || null,
      note: note || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Gagal menyimpan catatan baru." },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}
