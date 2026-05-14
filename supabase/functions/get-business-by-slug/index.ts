import { createClient } from "npm:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-slug",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });

  try {
    const slug = req.headers.get("x-slug")?.trim();
    if (!slug) return json({ success: false, error: "Missing x-slug header" }, 400);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ success: false, error: "Missing authorization header" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return json({ success: false, error: "Unauthorized" }, 401);

    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .select(
        "id, name, slug, category_id, description, email, phone, website_url, address, city, province, postal_code, logo_url, banner_url, image_urls"
      )
      .eq("slug", slug)
      .eq("owner_id", user.id)
      .single();

    if (bizError || !business) return json({ success: false, error: "Business not found" }, 404);

    const { data: hoursData, error: hoursError } = await supabase
      .from("business_hours")
      .select("day_of_week, is_closed, open_time, close_time")
      .eq("business_id", business.id)
      .order("day_of_week", { ascending: true });

    if (hoursError) return json({ success: false, error: "Failed to fetch business hours" }, 500);

    return json({
      success: true,
      data: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        category_id: business.category_id,
        description: business.description,
        email: business.email,
        phone: business.phone,
        website_url: business.website_url,
        address: business.address,
        city: business.city,
        province: business.province,
        postal_code: business.postal_code,
        logo_url: business.logo_url,
        banner_url: business.banner_url,
        image_urls: business.image_urls ?? [],
        hours: (hoursData ?? []).map((h: any) => ({
          day_of_week: h.day_of_week,
          is_closed: h.is_closed,
          open_time: h.open_time,
          close_time: h.close_time,
        })),
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Something went wrong",
      }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
