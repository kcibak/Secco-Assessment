/**
 * Client-side lead capture page.
 *
 * Responsibility: render and manage the lead form UX.
 * Data flow: collects input, validates locally, posts normalized payload to `POST /api/leads`,
 * then renders success/error feedback returned by the API.
 * Lifecycle: this is a client component in the App Router render tree.
 */
"use client";

import { useState } from "react";

type LeadFormData = {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  source: string;
  message: string;
};

type FormErrors = Partial<Record<keyof LeadFormData, string>>;
type SubmitResponse = {
  error?: string;
  fieldErrors?: FormErrors;
};

const initialFormData: LeadFormData = {
  firstName: "",
  lastName: "",
  email: "",
  company: "",
  source: "",
  message: "",
};

export default function Home() {
  // State is split by concern so each UI state transition can be updated independently.
  const [formData, setFormData] = useState<LeadFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [submitMessage, setSubmitMessage] = useState("");

  function validateForm() {
    // Build a keyed error map so each field can render its own validation message.
    const nextErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }

    if (!formData.lastName.trim()) {
      nextErrors.lastName = "Last name is required.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!formData.source) {
      nextErrors.source = "Please select an option.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleChange(
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    // Clear only the edited field error to keep remaining validation feedback visible.
    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setSubmitStatus("idle");
    setSubmitMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Phase 1: client-side gate to prevent avoidable API calls.
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setSubmitMessage("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Trim and normalize optional fields to `null` so the API receives clean payloads.
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          company: formData.company.trim() || null,
          source: formData.source,
          message: formData.message.trim() || null,
        }),
      });

      const result = (await response.json()) as SubmitResponse;

      if (!response.ok) {
        if (response.status === 400 && result.fieldErrors) {
          // Reconcile server-side field validation with the local error map.
          setErrors((current) => ({
            ...current,
            ...result.fieldErrors,
          }));
          return;
        }

        throw new Error(result.error || "Something went wrong.");
      }

      // Phase 2 success path: clear form and show confirmation feedback.
      setSubmitStatus("success");
      setSubmitMessage("Thanks! Your information has been submitted.");
      setFormData(initialFormData);
      setErrors({});
    } catch (error) {
      // Phase 3 failure path: preserve form input and surface a human-readable message.
      setSubmitStatus("error");
      setSubmitMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-5 py-10 text-slate-950 sm:px-6">
      <section className="w-full max-w-2xl">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                First name *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full rounded-lg border bg-white px-3.5 py-3 outline-none transition focus:ring-3 ${
                  errors.firstName
                    ? "border-red-500 focus:ring-red-100"
                    : "border-slate-300 focus:border-slate-950 focus:ring-slate-100"
                }`}
              />
              {errors.firstName && (
                <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Last name *
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full rounded-lg border bg-white px-3.5 py-3 outline-none transition focus:ring-3 ${
                  errors.lastName
                    ? "border-red-500 focus:ring-red-100"
                    : "border-slate-300 focus:border-slate-950 focus:ring-slate-100"
                }`}
              />
              {errors.lastName && (
                <p className="mt-2 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-lg border bg-white px-3.5 py-3 outline-none transition focus:ring-3 ${
                errors.email
                  ? "border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-slate-950 focus:ring-slate-100"
              }`}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="mt-5">
            <label
              htmlFor="company"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Company
            </label>
            <input
              id="company"
              name="company"
              type="text"
              value={formData.company}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 outline-none transition focus:border-slate-950 focus:ring-3 focus:ring-slate-100"
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="source"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              How did you hear about us? *
            </label>
            <select
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              className={`w-full rounded-lg border bg-white px-3.5 py-3 outline-none transition focus:ring-3 ${
                errors.source
                  ? "border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-slate-950 focus:ring-slate-100"
              }`}
            >
              <option value="">Select an option</option>
              <option value="Google">Google</option>
              <option value="Referral">Referral</option>
              <option value="Social">Social</option>
              <option value="Other">Other</option>
            </select>
            {errors.source && (
              <p className="mt-2 text-sm text-red-600">{errors.source}</p>
            )}
          </div>

          <div className="mt-5">
            <label
              htmlFor="message"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3.5 py-3 outline-none transition focus:border-slate-950 focus:ring-3 focus:ring-slate-100"
            />
          </div>

          {submitMessage && (
            <div
              className={`mt-5 rounded-lg px-3.5 py-3 text-sm ${
                submitStatus === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {submitMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-lg bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-3 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </section>
    </main>
  );
}
