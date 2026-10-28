import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createAdminClient();

    // 1. Fetch Global Settings
    const { data: settings } = await supabase
      .from("gr_settings")
      .select("*")
      .eq("key", "global")
      .maybeSingle();

    // 2. Fetch Waste Categories
    const { data: rawCategories } = await supabase.from("gr_waste_categories").select("*");
    const categories = (rawCategories || []).sort((a, b) =>
      (a.name_en || a.name || "").localeCompare(b.name_en || b.name || "")
    );

    // 3. Fetch Collection Locations
    const { data: rawLocations } = await supabase.from("gr_collection_locations").select("*");
    const locations = (rawLocations || []).sort((a, b) =>
      (a.name_en || a.name || "").localeCompare(b.name_en || b.name || "")
    );

    // 4. Fetch Rewards Catalog
    const { data: rawRewards } = await supabase.from("gr_rewards").select("*");
    const rewards = (rawRewards || []).sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );

    // 5. Build Master User Contact Lookup Map (Profiles + Auth Users)
    const userLookupMap = new Map<string, { full_name: string; phone_number: string; email: string }>();

    try {
      const { data: userProfiles } = await supabase.from("profiles").select("*");
      (userProfiles || []).forEach((p: any) => {
        if (p.id) {
          userLookupMap.set(p.id, {
            full_name: p.full_name || p.name || p.display_name || "Member",
            phone_number: p.phone_number || p.phone || p.mobile || p.contact_number || "",
            email: p.email || "",
          });
        }
      });
    } catch (e) {
      console.error("Profiles fetch warning:", e);
    }

    try {
      const { data: authData } = await supabase.auth.admin.listUsers();
      (authData?.users || []).forEach((u: any) => {
        const existing = userLookupMap.get(u.id) || { full_name: "", phone_number: "", email: "" };
        userLookupMap.set(u.id, {
          full_name:
            existing.full_name && existing.full_name !== "Member"
              ? existing.full_name
              : u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "Member",
          phone_number:
            existing.phone_number ||
            u.phone ||
            u.user_metadata?.phone_number ||
            u.user_metadata?.phone ||
            u.user_metadata?.mobile ||
            "",
          email: existing.email || u.email || "",
        });
      });
    } catch (e) {
      console.error("Auth admin listUsers warning:", e);
    }

    // 6. Fetch Redemptions
    let redemptionsList: any[] = [];
    const { data: baseRedemptions } = await supabase
      .from("gr_redemptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (baseRedemptions && baseRedemptions.length > 0) {
      const rewardIds = Array.from(new Set(baseRedemptions.map((r) => r.reward_id).filter(Boolean)));
      const { data: rewardItems } = rewardIds.length > 0
        ? await supabase.from("gr_rewards").select("*").in("id", rewardIds)
        : { data: [] };
      const rewardMap = new Map((rewardItems || []).map((rw: any) => [rw.id, rw]));

      redemptionsList = baseRedemptions.map((r) => ({
        ...r,
        user: userLookupMap.get(r.user_id) || null,
        reward: rewardMap.get(r.reward_id) || null,
      }));
    }

    // 7. Fetch Collection Requests (Doorstep Pickups & Self Drop-Offs)
    let pickupsList: any[] = [];
    const { data: basePickups } = await supabase
      .from("gr_collection_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (basePickups && basePickups.length > 0) {
      const addressIds = Array.from(new Set(basePickups.map((p) => p.address_id).filter(Boolean)));
      const locationIds = Array.from(new Set(basePickups.map((p) => p.location_id).filter(Boolean)));

      const [{ data: addresses }, { data: locs }] = await Promise.all([
        addressIds.length > 0 ? supabase.from("gr_addresses").select("*").in("id", addressIds) : Promise.resolve({ data: [] }),
        locationIds.length > 0 ? supabase.from("gr_collection_locations").select("*").in("id", locationIds) : Promise.resolve({ data: [] }),
      ]);

      const addressMap = new Map((addresses || []).map((a: any) => [a.id, a]));
      const locationMap = new Map((locs || []).map((l: any) => [l.id, l]));

      pickupsList = basePickups.map((p) => ({
        ...p,
        user: userLookupMap.get(p.user_id) || null,
        address: addressMap.get(p.address_id) || null,
        location: locationMap.get(p.location_id) || null,
      }));
    }

    // Helper to extract amount from title (e.g., "₹100 Store Voucher", "Rs 50 Off")
    const extractAmountFromTitle = (title: string): number | null => {
      if (!title) return null;
      const match = title.match(/(?:₹|Rs\.?|INR|\$)\s?(\d+(\.\d+)?)/i) || title.match(/(\d+)\s?(?:rupees|rs|inr|off)/i);
      return match ? parseFloat(match[1]) : null;
    };

    // Normalize Redemptions
    const normalizedRedemptions = redemptionsList.map((r) => {
      const lookupUser = userLookupMap.get(r.user_id) || {};
      const rate = settings?.points_to_rupee_rate ? Number(settings.points_to_rupee_rate) : 0.1;
      const pointsUsed = r.points_used ?? r.points_spent ?? 0;
      const calculatedValue = pointsUsed * rate;

      const rewardVal = r.reward?.value_inr ?? r.amount_inr;
      const titleVal = extractAmountFromTitle(r.reward?.title || r.reward_title || "");
      const payoutAmount = rewardVal != null ? Number(rewardVal) : (titleVal ?? calculatedValue);

      const rawName = lookupUser.full_name || r.user?.full_name || r.user_name || "Unknown Member";
      const rawPhone = lookupUser.phone_number || r.user?.phone_number || r.user_phone || "";
      const cleanedPhone = rawPhone.replace(/\D/g, "");
      const whatsappUrl = cleanedPhone
        ? `https://wa.me/${cleanedPhone.startsWith("91") ? cleanedPhone : "91" + cleanedPhone}`
        : null;

      return {
        ...r,
        userName: rawName,
        userPhone: rawPhone || "No phone",
        userEmail: lookupUser.email || r.user?.email || r.user_email || "No email",
        whatsappUrl,
        rewardTitle: r.reward?.title || r.reward_title || "Redemption",
        rewardType: r.reward?.type || r.reward_type || "discount",
        amount_inr: payoutAmount,
        points_spent: pointsUsed,
        isVoucher:
          r.reward?.type === "voucher" ||
          r.reward?.type === "store_discount" ||
          (r.reward?.title && r.reward.title.toLowerCase().includes("voucher")),
      };
    });

    // Normalize Pickups & Drop-offs
    const normalizedPickups = pickupsList.map((p) => {
      const lookupUser = userLookupMap.get(p.user_id) || {};
      const rawName = lookupUser.full_name || p.user?.full_name || p.contact_name || "Unknown Member";
      const rawPhone = lookupUser.phone_number || p.user?.phone_number || p.contact_phone || "";
      const cleanedPhone = rawPhone.replace(/\D/g, "");
      const whatsappUrl = cleanedPhone
        ? `https://wa.me/${cleanedPhone.startsWith("91") ? cleanedPhone : "91" + cleanedPhone}`
        : null;

      // CRITICAL FIX: If location_id is present, it is a Self Drop-Off at Center!
      const isHomePickup = !p.location_id;
      const badgeText = isHomePickup ? "Home Pickup" : "Self Drop-Off at Center";

      const addressStr = p.address
        ? [p.address.address_line1, p.address.address_line2, p.address.landmark, p.address.city, p.address.pincode]
            .filter(Boolean)
            .join(", ")
        : null;

      const locationName = isHomePickup
        ? (addressStr || "Doorstep Home Address")
        : (p.location?.name_en || p.location?.name || "Drop-off Center Hub");

      return {
        ...p,
        request_type: isHomePickup ? "home_pickup" : "dropoff",
        badge: badgeText,
        userName: rawName,
        userPhone: rawPhone || "No phone",
        userEmail: lookupUser.email || p.user?.email || "No email",
        whatsappUrl,
        locationName,
        addressDetails: p.address,
        hubDetails: p.location,
      };
    });

    return NextResponse.json({
      success: true,
      settings: settings || {
        key: "global",
        enable_home_pickup: false,
        points_to_rupee_rate: 0.1,
        min_redemption_points: 100,
        allowed_time_slots: ["09:00 AM - 12:00 PM", "02:00 PM - 05:00 PM"],
      },
      categories,
      locations,
      rewards,
      redemptions: normalizedRedemptions,
      pickups: normalizedPickups,
    });
  } catch (error: any) {
    console.error("Admin Settings GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();

    const action = body.action;
    const id = body.id;
    const payload = body.data || body;

    // --- Action: Save Settings ---
    if (action === "save_settings") {
      const { error } = await supabase.from("gr_settings").upsert(
        {
          key: "global",
          enable_home_pickup: Boolean(payload.enable_home_pickup),
          points_to_rupee_rate: Number(payload.points_to_rupee_rate),
          min_redemption_points: Number(payload.min_redemption_points),
          allowed_time_slots: payload.allowed_time_slots || ["09:00 AM - 12:00 PM", "02:00 PM - 05:00 PM"],
        },
        { onConflict: "key" }
      );
      if (error) throw error;
      return NextResponse.json({ success: true, message: "Settings saved" });
    }

    // --- Action: Update Redemption ---
    if (action === "update_redemption") {
      const { status, voucher_code, notes } = payload;
      const updateData: Record<string, any> = { status, updated_at: new Date().toISOString() };
      if (status === "completed" || status === "fulfilled") updateData.processed_at = new Date().toISOString();
      if (voucher_code !== undefined) updateData.voucher_code = voucher_code;
      if (notes !== undefined) updateData.notes = notes;

      const { error } = await supabase.from("gr_redemptions").update(updateData).eq("id", id || payload.id);
      if (error) throw error;
      return NextResponse.json({ success: true, message: "Redemption updated" });
    }

    // --- Action: Update Pickup / Drop-off Status ---
    if (action === "update_pickup") {
      const { status, admin_notes } = payload;
      const targetId = id || payload.id;
      const { error } = await supabase
        .from("gr_collection_requests")
        .update({ status, admin_notes, updated_at: new Date().toISOString() })
        .eq("id", targetId);
      if (error) throw error;

      // FIXED: Avoid .catch() on PostgREST Builder
      try {
        await supabase.from("gr_collection_status_history").insert([
          {
            request_id: targetId,
            new_status: status,
            comments: admin_notes || `Status updated to ${status} by admin`,
          },
        ]);
      } catch (histErr) {
        console.error("Status history log warning:", histErr);
      }

      return NextResponse.json({ success: true, message: "Pickup status updated" });
    }

    // --- Action: Manage Rewards Catalog ---
    if (action === "save_reward") {
      const rewardPayload = {
        title: payload.title,
        description: payload.description,
        points_required: Number(payload.points_required),
        value_inr: Number(payload.value_inr || 0),
        type: payload.type || "voucher",
        is_active: payload.is_active !== undefined ? Boolean(payload.is_active) : true,
        stock: payload.stock !== undefined ? Number(payload.stock) : null,
        terms: payload.terms || null,
        updated_at: new Date().toISOString(),
      };

      let query;
      if (id || payload.id) {
        query = supabase.from("gr_rewards").update(rewardPayload).eq("id", id || payload.id);
      } else {
        query = supabase.from("gr_rewards").insert([rewardPayload]);
      }
      const { error } = await query;
      if (error) throw error;
      return NextResponse.json({ success: true, message: "Reward saved" });
    }

    if (action === "delete_reward") {
      const { error } = await supabase.from("gr_rewards").delete().eq("id", id || payload.id);
      if (error) throw error;
      return NextResponse.json({ success: true, message: "Reward deleted" });
    }

    // --- Action: Manage Waste Categories ---
    if (action === "save_category" || action === "save_waste_category") {
      const catPayload = {
        name_en: payload.name_en || payload.name,
        name_kn: payload.name_kn || "",
        name: payload.name_en || payload.name,
        points_per_kg: Number(payload.points_per_kg),
        description: payload.description || "",
        icon: payload.icon || "Recycle",
        is_active: payload.is_active !== undefined ? Boolean(payload.is_active) : true,
      };

      let query;
      if (id || payload.id) {
        query = supabase.from("gr_waste_categories").update(catPayload).eq("id", id || payload.id);
      } else {
        query = supabase.from("gr_waste_categories").insert([catPayload]);
      }
      const { error } = await query;
      if (error) throw error;
      return NextResponse.json({ success: true, message: "Category saved" });
    }

    if (action === "delete_waste_category") {
      const { error } = await supabase.from("gr_waste_categories").delete().eq("id", id || payload.id);
      if (error) throw error;
      return NextResponse.json({ success: true, message: "Category deleted" });
    }

    // --- Action: Manage Collection Locations ---
    if (action === "save_location") {
      const locPayload = {
        name_en: payload.name_en || payload.name,
        name_kn: payload.name_kn || "",
        name: payload.name_en || payload.name,
        address_en: payload.address_en || payload.address,
        address_kn: payload.address_kn || "",
        address: payload.address_en || payload.address,
        operating_hours: payload.operating_hours || "09:00 AM - 06:00 PM",
        contact_phone: payload.contact_phone || "",
        is_active: payload.is_active !== undefined ? Boolean(payload.is_active) : true,
      };

      let query;
      if (id || payload.id) {
        query = supabase.from("gr_collection_locations").update(locPayload).eq("id", id || payload.id);
      } else {
        query = supabase.from("gr_collection_locations").insert([locPayload]);
      }
      const { error } = await query;
      if (error) throw error;
      return NextResponse.json({ success: true, message: "Location saved" });
    }

    if (action === "delete_location") {
      const { error } = await supabase.from("gr_collection_locations").delete().eq("id", id || payload.id);
      if (error) throw error;
      return NextResponse.json({ success: true, message: "Location deleted" });
    }

    return NextResponse.json({ success: false, error: "Invalid action type" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin Settings POST error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}