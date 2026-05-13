/**
 * Server-rendered leads table page.
 *
 * Responsibility: fetch and render submitted leads in a simple table.
 * Data flow: queries Supabase server-side with the service role key.
 * Lifecycle: server component in the App Router, rendered per request.
 */
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type LeadRow = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
  source: string | null;
  created_at: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function LeadsPage() {
  // Fetch most recent leads first for a quick review view.
  const { data, error } = await supabase
    .from("leads")
    .select(
      "id, first_name, last_name, email, company, source, created_at"
    )
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto w-full max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Leads
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Submitted leads</h1>
          <p className="mt-3 text-base text-slate-300">
            Server-rendered view of all lead submissions.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-5 py-4 text-sm text-red-200">
            Failed to load leads. Please check the server logs.
          </div>
        ) : data && data.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white text-slate-900 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.map((lead: LeadRow) => {
                    const fullName = `${lead.first_name} ${lead.last_name}`.trim();
                    const submitted = new Date(lead.created_at);

                    return (
                      <tr key={lead.id} className="text-slate-700">
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {fullName || "-"}
                        </td>
                        <td className="px-4 py-3">{lead.email}</td>
                        <td className="px-4 py-3">{lead.company || "-"}</td>
                        <td className="px-4 py-3">{lead.source || "-"}</td>
                        <td className="px-4 py-3">
                          {submitted.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-200">
            No leads submitted yet.
          </div>
        )}
      </section>
    </main>
  );
}
