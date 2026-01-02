// app/dashboard/requests/loading.tsx
export default function LoadingMyRequests() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-7 w-40 rounded-lg bg-neutral-800/60" />
        <div className="mt-2 h-4 w-72 rounded-lg bg-neutral-800/40" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5"
          >
            <div className="h-4 w-56 rounded bg-neutral-800/60" />
            <div className="mt-3 h-4 w-full rounded bg-neutral-800/40" />
            <div className="mt-2 h-4 w-3/4 rounded bg-neutral-800/40" />
            <div className="mt-4 h-4 w-48 rounded bg-neutral-800/30" />
          </div>
        ))}
      </div>
    </div>
  );
}
