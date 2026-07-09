export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 sm:px-10 lg:px-12">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Lecture Learning Platform
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            LLP GraphQL API
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Backend contract for the public website and admin dashboard. The
            first schema covers courses, lectures, media, users, settings,
            search, and development authentication.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Endpoint", "/api/graphql"],
            ["Dev port", "4000"],
            ["Runtime", "Next.js route handler"],
            ["Status", "Seed API ready"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-2 font-mono text-sm text-cyan-200">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.25fr]">
          <section>
            <h2 className="text-xl font-semibold text-white">Modules</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                "Authentication",
                "Courses",
                "Lectures",
                "Media",
                "Users",
                "Settings",
                "Search",
                "SEO fields",
              ].map((module) => (
                <div key={module} className="rounded-lg border border-slate-800 px-4 py-3 text-slate-200">
                  {module}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Sample Query</h2>
            <pre className="mt-4 overflow-x-auto rounded-lg border border-slate-800 bg-black p-5 text-sm leading-7 text-slate-200">
              {`query {
  courses(status: PUBLISHED) {
    id
    title
    slug
    lectureCount
    lectures(status: PUBLISHED) {
      title
      slug
    }
  }
}`}
            </pre>
          </section>
        </div>
      </section>
    </main>
  );
}
