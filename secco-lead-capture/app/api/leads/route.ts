/**
 * Server route for lead submission.
 *
 * Responsibility: validate and persist incoming lead data, then forward saved payload to a webhook.
 * Data flow: receives JSON from the client form, normalizes/validates it, inserts into Supabase,
 * and asynchronously posts the inserted row to the external webhook.
 * Lifecycle: handles `POST /api/leads` in the Next.js App Router request pipeline.
 */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const WEBHOOK_URL =
  "https://webhook-receiver-flax.vercel.app/api/lead-webhook";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LeadPayload = {
  firstName: string;
  lastName: string;
  email: string;
  company: string | null;
  source: string;
  message: string | null;
};

type ValidationErrors = Partial<
  Record<"firstName" | "lastName" | "email" | "source", string>
>;

function normalizeBody(body: unknown): LeadPayload {
  // Safely coerce unknown request JSON into the expected payload shape.
  const data = (body ?? {}) as Record<string, unknown>;

  const firstName = typeof data.firstName === "string" ? data.firstName.trim() : "";
  const lastName = typeof data.lastName === "string" ? data.lastName.trim() : "";
  const email =
    typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const companyRaw = typeof data.company === "string" ? data.company.trim() : "";
  const source = typeof data.source === "string" ? data.source.trim() : "";
  const messageRaw = typeof data.message === "string" ? data.message.trim() : "";

  return {
    firstName,
    lastName,
    email,
    company: companyRaw || null,
    source,
    message: messageRaw || null,
  };
}

function validatePayload(payload: LeadPayload): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!payload.firstName) {
    errors.firstName = "First name is required.";
  }

  if (!payload.lastName) {
    errors.lastName = "Last name is required.";
  }

  if (!payload.email) {
    errors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(payload.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!payload.source) {
    errors.source = "Please select an option.";
  }

  return errors;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload = normalizeBody(body);
    const validationErrors = validatePayload(payload);

    // Validation contract: return field-level errors in a 400 response for client mapping.
    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json(
        {
          error: "Please correct the highlighted fields.",
          fieldErrors: validationErrors,
        },
        {
          status: 400,
        }
      );
    }

    const { data, error } = await supabase
      .from("leads")
      .insert({
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
        company: payload.company,
        source: payload.source,
        message: payload.message,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      // `23505` is Postgres unique-violation, used here for duplicate email handling.
      const isDuplicateEmail = error.code === "23505";

      return NextResponse.json(
        {
          error: isDuplicateEmail
            ? "This email was already submitted."
            : "Failed to save lead",
        },
        {
          status: isDuplicateEmail ? 409 : 500,
        }
      );
    }

    try {
      const webhookResponse = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Candidate-Name": "Kira Cibak",
        },
        body: JSON.stringify(data),
      });

      if (!webhookResponse.ok) {
        const responseText = await webhookResponse.text();
        console.error("Webhook failed with non-2xx response:", {
          leadId: data.id,
          status: webhookResponse.status,
          responseBody: responseText.slice(0, 500),
          timestamp: new Date().toISOString(),
        });
      }
    } catch (webhookError) {
      // Webhook is best-effort: lead creation is still treated as success if this step fails.
      console.error("Webhook request failed:", {
        leadId: data.id,
        error: webhookError instanceof Error ? webhookError.message : webhookError,
        timestamp: new Date().toISOString(),
      });
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
    // Final catch-all for malformed JSON and unexpected route-level failures.
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
