import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ASSETS, type AssetKind } from "@/data/catalog";

export const Route = createFileRoute("/kit")({ component: KitPage });

const TABS: Array<"All" | AssetKind> = ["All", "Cast", "Streets", "Ships", "Interiors", "Items", "Mine", "FX"];

function KitPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return ASSETS.filter((t) => {
      if (tab !== "All" && t.kind !== tab) return false;
      if (q && !`${t.name} ${t.id}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [tab, q]);

  return (
    <main className="min-h-screen bg-bg text-fg">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link to="/" className="font-display text-2xl font-semibold">
            Nighthaul
          </Link>
          <div className="flex gap-4 text-sm">
            <Link to="/" className="text-muted hover:text-fg">
              Home
            </Link>
            <Link to="/play" className="text-muted hover:text-fg">
              Launch
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="font-display text-4xl font-semibold">Parts bay</h1>
        <p className="mt-2 max-w-xl text-muted">
          {ASSETS.length} engine-ready pieces for the frozen contract. Sheets shown whole.
        </p>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search assets"
            className="h-11 w-full rounded-md border border-line bg-surface px-3 text-sm text-fg outline-none placeholder:text-subtle focus:border-accent lg:max-w-xs"
          />
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={
                  t === tab
                    ? "rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg"
                    : "rounded-full border border-line px-3 py-1.5 text-xs text-muted hover:text-fg"
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 font-mono text-xs text-subtle">{filtered.length} shown</p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((asset) => (
            <article key={`${asset.kind}-${asset.id}`} className="overflow-hidden rounded-lg border border-line bg-surface">
              <div className="relative aspect-square bg-raised p-3">
                <img src={asset.src} alt={asset.name} className="h-full w-full object-contain" />
              </div>
              <div className="border-t border-line px-3 py-2">
                <p className="truncate text-sm text-fg">{asset.name}</p>
                <p className="font-mono text-xs tracking-wide text-subtle uppercase">
                  {asset.kind}
                  {asset.sheet ? ` · ${asset.sheet.cols}×${asset.sheet.rows}` : ""}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
