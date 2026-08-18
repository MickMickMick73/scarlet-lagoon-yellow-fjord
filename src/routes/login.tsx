import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-screen place-items-center bg-bg px-6">
      <div className="w-full max-w-sm rounded-xl border border-line bg-surface p-8">
        <p className="font-mono text-xs tracking-[0.2em] text-subtle uppercase">Nighthaul</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-fg">Sign in</h1>
        <p className="mt-2 text-sm text-muted">Keep a ledger of the frozen contract.</p>
        <div className="mt-8 space-y-3">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <button
                key={p.providerId}
                type="button"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                className="w-full rounded-md border border-line bg-raised px-4 py-3 text-sm font-medium text-fg transition-colors hover:bg-accent hover:text-accent-fg"
              >
                Continue with {p.label}
              </button>
            ))
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled.</p>
          )}
        </div>
        <Link to="/" className="mt-6 inline-block text-sm text-muted hover:text-fg">
          Back to dock
        </Link>
      </div>
    </main>
  );
}
