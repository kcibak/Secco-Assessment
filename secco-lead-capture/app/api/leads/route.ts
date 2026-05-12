import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const WEBHOOK_URL =
  "https://webhook-receiver-flax.vercel.app/api/lead-webhook";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { data, error } = await supabase
      .from("leads")
      .insert({
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email,
        company: body.company,
        source: body.source,
        message: body.message,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);

      return NextResponse.json(
        {
          error: "Failed to save lead",
        },
        {
          status: 500,
        }
      );
    }

    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Candidate-Name": "Kira Cibak",
        },
        body: JSON.stringify(data),
      });
    } catch (webhookError) {
      console.error("Webhook failed:", webhookError);
    }

    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("API route error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}