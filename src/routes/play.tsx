import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BUILDINGS, CONTRACT, GOODS, MODULES, PLANETS, PORTRAITS, SYSTEMS } from "@/data/catalog";
import type { GameApi, NighthaulConfig } from "@/game/nighthaul";

export const Route = createFileRoute("/play")({ component: PlayPage });

function PlayPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const api = useRef<GameApi | null>(null);
  const [started, setStarted] = useState(false);
  const [portrait, setPortrait] = useState<NighthaulConfig["portrait"]>("courier");
  const [name, setName] = useState("Zed");
  const [status, setStatus] = useState("Sign the contract");
  const [shop, setShop] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!started) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let stop = false;
    let handle: GameApi | undefined;
    const run = async () => {
      const { mountNighthaul } = await import("@/game/nighthaul");
      if (stop || !canvas) return;
      return mountNighthaul(canvas, {
        config: { portrait, name: name.trim() || "Zed" },
        onStatus: setStatus,
        onReady: () => {},
        onShop: setShop,
        onMap: setMapOpen,
      });
    };
    run()
      .then((h) => {
        if (h) {
          handle = h;
          api.current = h;
        }
      })
      .catch((err) => setStatus(err instanceof Error ? err.message : "Dock sealed."));
    return () => {
      stop = true;
      handle?.destroy();
      api.current = null;
    };
  }, [started, portrait, name]);

  const st = api.current?.getState();
  const bump = (msg: string) => {
    setToast(msg);
    setTick((n) => n + 1);
    window.setTimeout(() => setToast(""), 1800);
  };

  const stock =
    shop === "bar"
      ? ["nutrapack", "stim"]
      : shop === "parts"
        ? ["shunt", "coolant"]
        : shop === "exchange"
          ? ["nutrapack", "stim", "chip", "coolant", "copper", "crystal"]
          : shop === "warehouse"
            ? ["copper", "crystal", "chip"]
            : shop === "guns"
              ? ["pistol", "baton"]
              : [];

  const shopMeta = BUILDINGS.find((b) => b.id === shop);
  const planet = PLANETS.find((p) => p.id === st?.planet) ?? PLANETS[0];

  return (
    <main className="relative min-h-screen overflow-hidden bg-bg text-fg">
      <canvas ref={canvasRef} className="block h-dvh w-full touch-none" />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4">
        <Link
          to="/"
          className="pointer-events-auto rounded-md border border-line bg-surface/80 px-3 py-2 text-xs text-muted backdrop-blur-sm hover:text-fg"
        >
          Nighthaul
        </Link>
        {started && (
          <p className="max-w-[70%] rounded-md border border-line bg-surface/80 px-3 py-2 font-mono text-xs text-muted backdrop-blur-sm">
            {status}
          </p>
        )}
      </div>

      {started && st && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
          <p className="rounded-md border border-line bg-surface/80 px-3 py-2 text-xs text-muted backdrop-blur-sm">
            WASD move · E enter · Space fire · M map
            {st.mode === "space" ? " · A/D yaw · W thrust" : ""}
            {st.mode === "mine" ? " · W jump · click/S dig" : ""}
          </p>
          <p className="font-mono text-xs tabular-nums text-credit">
            hold {Object.values(st.cargo).reduce((a, b) => a + b, 0)} · fuel {Math.floor(st.fuel)}
          </p>
        </div>
      )}

      {toast ? (
        <p className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 rounded-md border border-line bg-surface px-3 py-2 text-sm">
          {toast}
        </p>
      ) : null}

      {!started && (
        <div className="absolute inset-0 grid place-items-center overflow-y-auto bg-bg/80 px-5 py-8">
          <div className="w-full max-w-2xl rounded-xl border border-line bg-surface p-6 sm:p-8">
            <p className="font-mono text-xs tracking-[0.24em] text-subtle uppercase">A frozen contract</p>
            <h1 className="mt-2 font-display text-4xl font-semibold">Sign as the heir</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Uncle left you a wrecked hauler and a debt to {CONTRACT.colony}: chips, nutrapacks, coolant, and three
              cryogens. Trade the belt, fight in the lane, dig the undercity, keep the ship alive with shunts.
            </p>
            <label className="mt-6 block text-xs tracking-wide text-subtle uppercase">
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-line bg-raised px-3 text-sm text-fg outline-none focus:border-accent"
              />
            </label>
            <p className="mt-5 text-xs tracking-wide text-subtle uppercase">Cast</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {PORTRAITS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPortrait(p.id)}
                  className={
                    portrait === p.id
                      ? "overflow-hidden rounded-lg border border-accent bg-raised"
                      : "overflow-hidden rounded-lg border border-line bg-raised hover:border-accent"
                  }
                >
                  <img src={`/assets/nh/heroes/portrait-${p.id}.png`} alt="" className="aspect-[4/5] w-full object-cover" />
                  <span className="block px-2 py-2 text-left">
                    <span className="block text-sm font-medium">{p.name}</span>
                    <span className="block text-xs text-muted">{p.blurb}</span>
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStarted(true)}
              className="mt-6 w-full rounded-md bg-accent py-3 text-sm font-medium text-accent-fg"
            >
              Take the Nighthaul
            </button>
          </div>
        </div>
      )}

      {shop && st && (
        <div className="absolute inset-0 grid place-items-center bg-bg/70 px-4">
          <div className="w-full max-w-md rounded-xl border border-line bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs tracking-[0.2em] text-subtle uppercase">{planet.name}</p>
                <h2 className="font-display text-2xl font-semibold">{shopMeta?.name ?? shop}</h2>
              </div>
              <button
                type="button"
                className="rounded-md border border-line px-3 py-1.5 text-xs text-muted hover:text-fg"
                onClick={() => setShop(null)}
              >
                Leave
              </button>
            </div>
            <p className="mt-1 font-mono text-xs tabular-nums text-credit">{st.credits}¢ on hand · {st.bank}¢ in vault</p>

            {shop === "hotel" && (
              <button
                type="button"
                className="mt-4 w-full rounded-md bg-accent py-2.5 text-sm text-accent-fg"
                onClick={() => bump(api.current?.sleep() ?? "")}
              >
                Sleep · 12¢
              </button>
            )}

            {shop === "bank" && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button type="button" className="rounded-md border border-line py-2 text-sm" onClick={() => bump(api.current?.deposit(50) ?? "")}>
                  Park 50¢
                </button>
                <button type="button" className="rounded-md border border-line py-2 text-sm" onClick={() => bump(api.current?.withdraw(50) ?? "")}>
                  Draw 50¢
                </button>
              </div>
            )}

            {shop === "parts" && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-muted">Shunts jump a dead system. Bolts cost extra.</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(st.systems).map((id) => (
                    <button
                      key={id}
                      type="button"
                      className="rounded-md border border-line px-2 py-2 text-left text-xs"
                      onClick={() => bump(api.current?.repair(id) ?? "")}
                    >
                      <span className="block text-fg">{id}</span>
                      <span className="font-mono text-subtle">{Math.floor(st.systems[id])}%</span>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {MODULES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className="rounded-md border border-line px-2 py-2 text-left text-xs"
                      onClick={() => bump(api.current?.fit(m.id) ?? "")}
                    >
                      {m.name} · {m.cost}¢
                    </button>
                  ))}
                </div>
              </div>
            )}

            {shop === "warehouse" && (
              <button
                type="button"
                className="mt-4 w-full rounded-md bg-accent py-2.5 text-sm text-accent-fg"
                onClick={() => bump(api.current?.deliver() ?? "")}
              >
                Offload for {CONTRACT.colony}
              </button>
            )}

            {stock.length > 0 && (
              <ul className="mt-4 space-y-2">
                {stock.map((id) => {
                  const g = GOODS.find((x) => x.id === id);
                  const price = (planet.prices as Record<string, number>)[id] ?? 20;
                  return (
                    <li key={`${id}-${tick}`} className="flex items-center justify-between gap-2 rounded-md border border-line px-3 py-2">
                      <span>
                        <span className="block text-sm">{g?.name ?? id}</span>
                        <span className="block text-xs text-muted">{price}¢ · have {st.cargo[id] ?? 0}</span>
                      </span>
                      <span className="flex gap-1">
                        <button type="button" className="rounded-md bg-accent px-2 py-1 text-xs text-accent-fg" onClick={() => bump(api.current?.buy(id) ?? "")}>
                          Buy
                        </button>
                        <button type="button" className="rounded-md border border-line px-2 py-1 text-xs" onClick={() => bump(api.current?.sell(id) ?? "")}>
                          Sell
                        </button>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {mapOpen && st && (
        <div className="absolute inset-0 grid place-items-center bg-bg/70 px-4">
          <div className="w-full max-w-lg rounded-xl border border-line bg-surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">Star chart</h2>
              <button type="button" className="rounded-md border border-line px-3 py-1.5 text-xs text-muted" onClick={() => setMapOpen(false)}>
                Close
              </button>
            </div>
            <p className="mt-1 text-xs text-muted">Warp wants a live shunt. Ghost systems have no dock.</p>
            <div className="relative mt-4 h-56 overflow-hidden rounded-lg border border-line bg-raised">
              {SYSTEMS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  style={{ left: `${s.x}%`, top: `${s.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-line bg-surface px-2 py-1 text-xs hover:border-accent"
                  onClick={() => bump(api.current?.warp(s.id) ?? "")}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
