import { createFileRoute, Link } from "@tanstack/react-router";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { CONTRACT, KIT_COUNTS, PLANETS } from "@/data/catalog";

export const Route = createFileRoute("/")({ component: Home });

function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-raised" />;
  }
  return user ? (
    <UserButton />
  ) : (
    <Link
      to="/login"
      className="rounded-md border border-line px-3 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-fg"
    >
      Sign in
    </Link>
  );
}

function Home() {
  return (
    <main className="min-h-screen bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link to="/" className="font-display text-2xl font-semibold tracking-tight">
            Nighthaul
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/kit" className="rounded-md px-3 py-2 text-muted hover:text-fg">
              Bay
            </Link>
            <Link to="/play" className="rounded-md px-3 py-2 text-muted hover:text-fg">
              Launch
            </Link>
            <SignedOut>
              <AuthSlot />
            </SignedOut>
            <SignedIn>
              <AuthSlot />
            </SignedIn>
          </nav>
        </div>
      </header>

      <section className="relative mx-auto max-w-6xl overflow-hidden px-5 pt-16 pb-10">
        <img
          src="/assets/nh/parallax/kessler-far.jpg"
          alt=""
          className="pointer-events-none absolute inset-x-0 top-0 h-80 w-full object-cover opacity-40"
        />
        <div className="relative">
          <p className="font-mono text-xs tracking-[0.28em] text-subtle uppercase">A frozen contract</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[0.95] font-semibold tracking-tight sm:text-7xl">
            Inherit the wreck. Wake the colony.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Cyberpunk spiritual successor to SunDog. Walk rain cities, step into bars and exchanges, drive a pod
            between towns, bolt shunts into a dying hauler, dogfight the warp lane, and dig the undercity.{" "}
            {CONTRACT.colony} wants chips, food, coolant, grain, and three sleepers.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/play" className="rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-fg">
              Take the ship
            </Link>
            <Link to="/kit" className="rounded-md border border-line px-5 py-3 text-sm text-fg hover:border-accent">
              Browse the bay
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-5 pb-12 sm:grid-cols-4 lg:grid-cols-7">
        {Object.entries(KIT_COUNTS).map(([key, n]) => (
          <div key={key} className="rounded-lg border border-line bg-surface px-4 py-4">
            <p className="font-mono text-2xl tabular-nums text-fg">{n}</p>
            <p className="mt-1 text-xs tracking-wide text-muted uppercase">{key}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <h2 className="font-display text-3xl font-semibold">Three docks. One debt.</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Kessler sells parts. Slagreach dumps ore. Vesper keeps the cryogens — and Banville Hold.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {PLANETS.map((p) => (
            <article key={p.id} className="overflow-hidden rounded-lg border border-line bg-surface">
              <div className="aspect-video bg-raised">
                <img src={p.far} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="px-4 py-4">
                <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm leading-snug text-muted">{p.blurb}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
