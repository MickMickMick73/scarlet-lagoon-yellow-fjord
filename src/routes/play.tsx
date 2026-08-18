import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BUILDINGS, CITIES, CONTRACT, GOODS, MAIL, MODULES, PLANETS, PORTRAITS, SYSTEMS } from "@/data/catalog";
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
        onReady: () => setTick((n) => n + 1),
        onShop: setShop,
        onMap: setMapOpen,
      });
    };
    run()
      .then((h) => {
        if (h) {
          handle = h;
          api.current = h;
          setTick((n) => n + 1);
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

  const tradeStock =
    shop === "bar"
      ? []
      : shop === "parts"
        ? ["shunt", "coolant"]
        : shop === "exchange"
          ? ["nutrapack", "stim", "chip", "coolant", "copper", "crystal", "plastics", "droids", "solar", "grain"]
          : shop === "guns"
            ? ["pistol", "baton"]
            : [];

  const shopMeta = BUILDINGS.find((b) => b.id === shop);
  const planet = PLANETS.find((p) => p.id === st?.planet) ?? PLANETS[0];
  const city = CITIES.find((c) => c.id === st?.city);
  const vigor = st ? Math.round(Math.min((st.hp / st.maxHp) * 100, st.rest, st.nourish)) : 0;
  const shed = st?.stores[st.city] ?? {};
  const shopTitle =
    shop === "cargo" ? "Hold" : shop === "cryo" ? "Cryo bay" : shop === "mail" ? "Ship computer" : (shopMeta?.name ?? shop);

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
            WASD move · E enter · Space fire · M map · C hold
            {st.mode === "space" ? " · A/D yaw · W thrust · E land" : ""}
            {st.mode === "planet" ? " · A/D drive pod · E city" : ""}
            {st.mode === "mine" ? " · W jump · click/S dig" : ""}
          </p>
          <div className="rounded-md border border-line bg-surface/80 px-3 py-2 font-mono text-xs tabular-nums text-muted backdrop-blur-sm">
            <span className="text-accent">V{vigor}</span>
            <span className="mx-2 text-subtle">rest {Math.floor(st.rest)}</span>
            <span className="text-subtle">food {Math.floor(st.nourish)}</span>
            <span className="ml-2 text-credit">
              {st.credits}¢ · hold {Object.values(st.cargo).reduce((a, b) => a + b, 0)} · fuel {Math.floor(st.fuel)}
            </span>
          </div>
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
              Uncle left you a wrecked hauler and a debt to {CONTRACT.colony}: chips, nutrapacks, coolant, grain, and
              three cryogens. Walk the streets, step inside, drive the pod between cities, fight the lane, dig the
              undercity.
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
          <div className="max-h-[86vh] w-full max-w-md overflow-y-auto rounded-xl border border-line bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs tracking-[0.2em] text-subtle uppercase">
                  {city?.name ?? planet.name}
                </p>
                <h2 className="font-display text-2xl font-semibold">{shopTitle}</h2>
              </div>
              <button
                type="button"
                className="rounded-md border border-line px-3 py-1.5 text-xs text-muted hover:text-fg"
                onClick={() => setShop(null)}
              >
                Leave
              </button>
            </div>
            <p className="mt-1 font-mono text-xs tabular-nums text-credit">
              {st.credits}¢ on hand · {st.bank}¢ in vault
            </p>

            {shop === "hotel" && (
              <button
                type="button"
                className="mt-4 w-full rounded-md bg-accent py-2.5 text-sm text-accent-fg"
                onClick={() => bump(api.current?.sleep() ?? "")}
              >
                Sleep · 12¢
              </button>
            )}

            {shop === "hospital" && (
              <button
                type="button"
                className="mt-4 w-full rounded-md bg-accent py-2.5 text-sm text-accent-fg"
                onClick={() => bump(api.current?.heal() ?? "")}
              >
                Patch up · 28¢
              </button>
            )}

            {shop === "bar" && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button type="button" className="rounded-md border border-line py-2 text-sm" onClick={() => bump(api.current?.eat("nutrapack") ?? "")}>
                  Eat nutrapack · {planet.prices.nutrapack}¢
                </button>
                <button type="button" className="rounded-md border border-line py-2 text-sm" onClick={() => bump(api.current?.eat("stim") ?? "")}>
                  Stim · {planet.prices.stim}¢
                </button>
              </div>
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
              <div className="mt-4 space-y-3">
                {city?.colony && (
                  <button
                    type="button"
                    className="w-full rounded-md bg-accent py-2.5 text-sm text-accent-fg"
                    onClick={() => bump(api.current?.deliver() ?? "")}
                  >
                    Offload for {CONTRACT.colony}
                  </button>
                )}
                {city?.cryo && !st.cryoTaken[st.city] && (
                  <button
                    type="button"
                    className="w-full rounded-md border border-accent py-2.5 text-sm text-accent"
                    onClick={() => bump(api.current?.takeCryo() ?? "")}
                  >
                    Lift the cryopod
                  </button>
                )}
                <p className="text-xs text-muted">Stash cargo here. It stays in {city?.name}.</p>
                <ul className="space-y-2">
                  {GOODS.filter((g) => g.id !== "credits" && ((st.cargo[g.id] ?? 0) > 0 || (shed[g.id] ?? 0) > 0)).map((g) => (
                    <li key={g.id} className="flex items-center justify-between gap-2 rounded-md border border-line px-3 py-2">
                      <span className="text-sm">
                        {g.name}
                        <span className="ml-2 font-mono text-xs text-subtle">
                          hold {st.cargo[g.id] ?? 0} · shed {shed[g.id] ?? 0}
                        </span>
                      </span>
                      <span className="flex gap-1">
                        <button type="button" className="rounded-md bg-accent px-2 py-1 text-xs text-accent-fg" onClick={() => bump(api.current?.store(g.id) ?? "")}>
                          Store
                        </button>
                        <button type="button" className="rounded-md border border-line px-2 py-1 text-xs" onClick={() => bump(api.current?.retrieve(g.id) ?? "")}>
                          Take
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {shop === "cargo" && (
              <ul className="mt-4 space-y-2">
                {Object.keys(st.cargo).length === 0 && <li className="text-sm text-muted">Hold is empty.</li>}
                {Object.entries(st.cargo).map(([id, n]) => (
                  <li key={id} className="flex justify-between rounded-md border border-line px-3 py-2 text-sm">
                    <span>{GOODS.find((g) => g.id === id)?.name ?? id}</span>
                    <span className="font-mono text-subtle">{n}</span>
                  </li>
                ))}
              </ul>
            )}

            {shop === "cryo" && (
              <div className="mt-4 space-y-2 text-sm text-muted">
                <p>Sleepers in the hold: {st.cargo.cryopod ?? 0} / {CONTRACT.need.cryopod}</p>
                <p>Delivered to Banville: {st.delivered.cryopod ?? 0}</p>
                <p className="text-xs">Hints live on the ship computer. Walk the hatch cities — Dockwell, Heap, Frostshed.</p>
                <button type="button" className="w-full rounded-md border border-line py-2 text-sm" onClick={() => setShop("mail")}>
                  Open computer
                </button>
              </div>
            )}

            {shop === "mail" && (
              <ul className="mt-4 space-y-3">
                {st.mail.map((id) => {
                  const m = MAIL.find((x) => x.id === id);
                  if (!m) return null;
                  return (
                    <li key={id} className="rounded-md border border-line px-3 py-3">
                      <p className="font-mono text-xs text-subtle">{m.from}</p>
                      <p className="text-sm font-medium">{m.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted">{m.body}</p>
                    </li>
                  );
                })}
              </ul>
            )}

            {tradeStock.length > 0 && (
              <ul className="mt-4 space-y-2">
                {tradeStock.map((id) => {
                  const g = GOODS.find((x) => x.id === id);
                  const price = (planet.prices as Record<string, number>)[id] ?? 20;
                  return (
                    <li key={`${id}-${tick}`} className="flex items-center justify-between gap-2 rounded-md border border-line px-3 py-2">
                      <span>
                        <span className="block text-sm">{g?.name ?? id}</span>
                        <span className="block text-xs text-muted">
                          {price}¢ · have {st.cargo[id] ?? 0}
                        </span>
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
            <p className="mt-1 text-xs text-muted">Warp from helm or space. Then E to land the starport.</p>
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
            <p className="mt-3 text-xs text-muted">
              Cities on {planet.name}: {CITIES.filter((c) => c.planet === planet.id).map((c) => c.name).join(" · ")}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
