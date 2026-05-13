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
  const [formData, setFormData] = useState<LeadFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [submitMessage, setSubmitMessage] = useState("");

  function validateForm() {
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

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setSubmitStatus("idle");
    setSubmitMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
          setErrors((current) => ({
            ...current,
            ...result.fieldErrors,
          }));
          return;
        }

        throw new Error(result.error || "Something went wrong.");
      }

      setSubmitStatus("success");
      setSubmitMessage("Thanks! Your information has been submitted.");
      setFormData(initialFormData);
      setErrors({});
    } catch (error) {
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
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_480px] lg:items-center">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Lead Capture
          </p>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Let&apos;s start the conversation.
          </h1>

          <p className="max-w-xl text-lg leading-8 text-slate-300">
            Submit your information and our team will review your message. This
            demo saves the lead to Supabase and forwards it to the required
            webhook from the server.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white p-6 text-slate-950 shadow-2xl sm:p-8"
          noValidate
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Contact us</h2>
            <p className="mt-2 text-sm text-slate-600">
              Fields marked with an asterisk are required.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-medium text-slate-800"
              >
                First name *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
                  errors.firstName
                    ? "border-red-500 focus:ring-red-200"
                    : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
                }`}
              />
              {errors.firstName && (
                <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-medium text-slate-800"
              >
                Last name *
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
                  errors.lastName
                    ? "border-red-500 focus:ring-red-200"
                    : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
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
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-200"
                  : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
              }`}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="mt-5">
            <label
              htmlFor="company"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Company
            </label>
            <input
              id="company"
              name="company"
              type="text"
              value={formData.company}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="source"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              How did you hear about us? *
            </label>
            <select
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
                errors.source
                  ? "border-red-500 focus:ring-red-200"
                  : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
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
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {submitMessage && (
            <div
              className={`mt-5 rounded-xl px-4 py-3 text-sm ${
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
            className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </section>
    </main>
  );
}
