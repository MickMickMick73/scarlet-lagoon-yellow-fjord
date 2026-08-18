import {
  BUILDINGS,
  CITIES,
  CONTRACT,
  GOODS,
  MAIL,
  MODULES,
  PLANETS,
  PORTRAITS,
  SYSTEMS,
  type BuildingId,
  type CityId,
} from "@/data/catalog";

export type NighthaulConfig = {
  portrait: (typeof PORTRAITS)[number]["id"];
  name: string;
};

export type GameMode = "city" | "interior" | "ship" | "planet" | "space" | "mine";

export type GameState = {
  mode: GameMode;
  planet: (typeof PLANETS)[number]["id"];
  city: CityId;
  interior: BuildingId | null;
  name: string;
  portrait: string;
  credits: number;
  bank: number;
  hp: number;
  maxHp: number;
  rest: number;
  nourish: number;
  cargo: Record<string, number>;
  stores: Record<string, Record<string, number>>;
  systems: Record<string, number>;
  modules: string[];
  delivered: Record<string, number>;
  hasPistol: boolean;
  hasBaton: boolean;
  fuel: number;
  heading: number;
  speed: number;
  mail: string[];
  cryoTaken: Record<string, boolean>;
};

export type GameApi = {
  destroy: () => void;
  getState: () => GameState;
  buy: (id: string) => string;
  sell: (id: string) => string;
  repair: (id: string) => string;
  fit: (id: string) => string;
  deposit: (n: number) => string;
  withdraw: (n: number) => string;
  sleep: () => string;
  heal: () => string;
  eat: (id: string) => string;
  deliver: () => string;
  store: (id: string) => string;
  retrieve: (id: string) => string;
  warp: (systemId: string) => string;
  takeCryo: () => string;
};

type MountOpts = {
  config: NighthaulConfig;
  onStatus: (s: string) => void;
  onReady: () => void;
  onShop: (id: string | null) => void;
  onMap: (open: boolean) => void;
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

const GROUND = 560;
const MINE_T = 36;
const MINE_C = 56;
const MINE_R = 32;
const PLANET_W = 5200;
const SAVE_KEY = "nighthaul-v2";

type Spot =
  | { kind: "ship"; x: number }
  | { kind: "gate"; x: number }
  | { kind: "mine"; x: number }
  | { kind: "building"; id: BuildingId; x: number };

function layoutFor(city: (typeof CITIES)[number]): { spots: Spot[]; width: number } {
  const spots: Spot[] = [];
  let x = 260;
  if (city.starport) {
    spots.push({ kind: "ship", x: 220 });
    x = 560;
  } else {
    spots.push({ kind: "gate", x: 180 });
    x = 500;
  }
  for (const b of city.buildings) {
    spots.push({ kind: "building", id: b, x });
    x += 400;
  }
  if (city.starport) spots.push({ kind: "gate", x: x + 20 });
  if (city.id === "lowwatt" || city.id === "heap" || city.id === "frostshed") {
    spots.push({ kind: "mine", x: x + 260 });
    x += 260;
  }
  return { spots, width: Math.max(2200, x + 380) };
}

function citiesOn(planet: string) {
  return CITIES.filter((c) => c.planet === planet);
}

function planetX(cityId: string, planet: string) {
  const list = citiesOn(planet);
  const i = list.findIndex((c) => c.id === cityId);
  return 720 + Math.max(0, i) * 1600;
}

type Body = { x: number; y: number; hp: number; facing: 0 | 1 | 2 | 3; frame: number; hurt: number };
type Shot = { x: number; y: number; vx: number; vy: number; life: number; from: "player" | "foe" };

function cargoCount(c: Record<string, number>) {
  return Object.values(c).reduce((a, b) => a + b, 0);
}

function priceOf(planet: (typeof PLANETS)[number], id: string) {
  return (planet.prices as Record<string, number>)[id] ?? 20;
}

function cityById(id: string) {
  return CITIES.find((c) => c.id === id) ?? CITIES[0];
}

export async function mountNighthaul(canvas: HTMLCanvasElement, opts: MountOpts): Promise<GameApi> {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas context");

  const portrait = PORTRAITS.find((p) => p.id === opts.config.portrait) ?? PORTRAITS[0];
  const maxHp = 8 + portrait.vigour;

  const st: GameState = {
    mode: "city",
    planet: "kessler",
    city: "rainspire",
    interior: null,
    name: opts.config.name,
    portrait: portrait.id,
    credits: 420,
    bank: 0,
    hp: maxHp,
    maxHp,
    rest: 82,
    nourish: 70,
    cargo: {},
    stores: {},
    systems: { engine: 55, shields: 40, lasers: 70, hold: 80, warp: 18 },
    modules: ["engine", "lasers"],
    delivered: { chip: 0, nutrapack: 0, coolant: 0, grain: 0, cryopod: 0 },
    hasPistol: portrait.guns >= 3,
    hasBaton: true,
    fuel: 40,
    heading: -Math.PI / 2,
    speed: 0,
    mail: ["will", "dockwell"],
    cryoTaken: {},
  };

  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<GameState>;
      if (saved && saved.name === st.name) {
        const { mode: _m, interior: _i, ...rest } = saved;
        Object.assign(st, rest, { name: st.name, portrait: st.portrait, mode: "city", interior: null });
      }
    }
  } catch {
    /* ignore */
  }

  const holdCap = () => 8 + (st.modules.includes("hold") ? 8 : 0);
  const vigor = () => Math.round(Math.min((st.hp / st.maxHp) * 100, st.rest, st.nourish));

  const player: Body = { x: 420, y: GROUND + 48, hp: st.hp, facing: 2, frame: 0, hurt: 0 };
  let muggers: Array<Body & { vx: number }> = [];
  let pirates: Array<{ x: number; y: number; heading: number; hp: number; hurt: number; cd: number }> = [];
  let shots: Shot[] = [];
  let fx: Array<{ x: number; y: number; life: number; kind: "muzzle" | "slash" | "explode" }> = [];
  let atkCd = 0;
  let interactLock = 0;
  let animT = 0;
  let shopId: string | null = null;
  let cam = { x: 0, y: 0 };
  let mine: Uint8Array | null = null;
  let minePx = 4;
  let minePy = 4;
  let mineVy = 0;
  let onGround = false;
  let testSteer: number | null = null;
  let hint = "";
  let drain = 0;

  const spawnMuggers = () => {
    const city = cityById(st.city);
    const n = city.colony ? 0 : city.id === "heap" || city.id === "dockwell" ? 3 : 2;
    const lay = layoutFor(city);
    muggers = Array.from({ length: n }, (_, i) => ({
      x: 700 + i * 520,
      y: GROUND + 48,
      hp: 4 + i,
      facing: 2 as const,
      frame: 0,
      hurt: 0,
      vx: i % 2 ? 48 : -42,
    }));
    if (lay.width) {
      /* keep in bounds later */
    }
  };
  spawnMuggers();

  const keys = new Set<string>();
  const just = new Set<string>();
  const GAME_KEYS = new Set([
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "KeyW", "KeyA", "KeyS", "KeyD", "KeyE", "KeyM", "KeyF", "KeyC",
  ]);
  let doInteract = () => {};
  const onKey = (e: KeyboardEvent, down: boolean) => {
    if (GAME_KEYS.has(e.code)) e.preventDefault();
    if (down) {
      if (!keys.has(e.code)) just.add(e.code);
      keys.add(e.code);
      if (e.code === "KeyE" || e.code === "KeyF") doInteract();
      if (e.code === "KeyM") opts.onMap(true);
      if (e.code === "KeyC") {
        opts.onShop("cargo");
        shopId = "cargo";
      }
    } else keys.delete(e.code);
  };
  const kd = (e: KeyboardEvent) => onKey(e, true);
  const ku = (e: KeyboardEvent) => onKey(e, false);
  const blur = () => keys.clear();
  window.addEventListener("keydown", kd);
  window.addEventListener("keyup", ku);
  window.addEventListener("blur", blur);
  document.addEventListener("visibilitychange", blur);

  let pointer = { x: 0, y: 0, down: false };
  let stick = { active: false, ox: 0, oy: 0, mx: 0, my: 0 };
  const toLocal = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * canvas.clientWidth,
      y: ((e.clientY - r.top) / r.height) * canvas.clientHeight,
    };
  };
  const pd = (e: PointerEvent) => {
    const p = toLocal(e);
    pointer = { x: p.x, y: p.y, down: true };
    if (p.x < canvas.clientWidth * 0.42 && p.y > canvas.clientHeight * 0.45) {
      stick = { active: true, ox: p.x, oy: p.y, mx: 0, my: 0 };
    }
  };
  const pu = () => {
    pointer.down = false;
    stick.active = false;
    stick.mx = 0;
    stick.my = 0;
  };
  const pm = (e: PointerEvent) => {
    const p = toLocal(e);
    pointer.x = p.x;
    pointer.y = p.y;
    if (stick.active) {
      const dx = p.x - stick.ox;
      const dy = p.y - stick.oy;
      const len = Math.hypot(dx, dy) || 1;
      const mag = Math.min(1, len / 46);
      stick.mx = (dx / len) * mag;
      stick.my = (dy / len) * mag;
    }
  };
  canvas.addEventListener("pointerdown", pd);
  canvas.addEventListener("pointerup", pu);
  canvas.addEventListener("pointercancel", pu);
  canvas.addEventListener("pointermove", pm);

  const img = (src: string) => loadImage(src);
  const [
    walk, pistol, melee, mineAnim, muggerImg, merchantImg, bartenderImg, mechanicImg,
    street, deck, sky, near, spaceBg, shipIn, haul, pirateImg, fighter, pod,
    muzzle, slash, laser, explode, dirt, stone, copper, crystal, mineFar,
  ] = await Promise.all([
    img("/assets/nh/heroes/walk.png"),
    img("/assets/nh/heroes/pistol.png"),
    img("/assets/nh/heroes/melee.png"),
    img("/assets/nh/heroes/mine.png"),
    img("/assets/nh/npcs/mugger.png"),
    img("/assets/nh/npcs/merchant.png"),
    img("/assets/nh/npcs/bartender.png"),
    img("/assets/nh/npcs/mechanic.png"),
    img("/assets/nh/tiles/street.png"),
    img("/assets/nh/tiles/deck.png"),
    img("/assets/nh/parallax/kessler-sky.jpg"),
    img("/assets/nh/parallax/kessler-near.jpg"),
    img("/assets/nh/parallax/space.jpg"),
    img("/assets/nh/interiors/ship.jpg"),
    img("/assets/nh/ships/nighthaul.png"),
    img("/assets/nh/ships/pirate.png"),
    img("/assets/nh/ships/fighter.png"),
    img("/assets/nh/ships/pod.png"),
    img("/assets/nh/fx/muzzle.png"),
    img("/assets/nh/fx/slash.png"),
    img("/assets/nh/fx/laser.png"),
    img("/assets/nh/fx/explode.png"),
    img("/assets/nh/mine/dirt.png"),
    img("/assets/nh/mine/stone.png"),
    img("/assets/nh/mine/copper.png"),
    img("/assets/nh/mine/crystal.png"),
    img("/assets/nh/parallax/mine-far.jpg"),
  ]);

  const farImgs: Record<string, HTMLImageElement | null> = {};
  const bldImgs: Record<string, HTMLImageElement | null> = {};
  const inImgs: Record<string, HTMLImageElement | null> = {};
  await Promise.all([
    ...PLANETS.map(async (p) => {
      farImgs[p.id] = await img(p.far);
    }),
    ...BUILDINGS.map(async (b) => {
      bldImgs[b.id] = await img(b.src);
      inImgs[b.id] = await img(`/assets/nh/interiors/${b.id}.jpg`);
    }),
  ]);

  const planet = () => PLANETS.find((p) => p.id === st.planet) ?? PLANETS[0];
  const city = () => cityById(st.city);
  const persist = () => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(st));
    } catch {
      /* ignore */
    }
  };

  const status = () => {
    const p = planet();
    const need = CONTRACT.need;
    const left = (Object.keys(need) as Array<keyof typeof need>).reduce(
      (n, k) => n + Math.max(0, need[k] - (st.delivered[k] ?? 0)),
      0,
    );
    const loc =
      st.mode === "city"
        ? city().name
        : st.mode === "interior"
          ? `${BUILDINGS.find((b) => b.id === st.interior)?.name ?? "Inside"} · ${city().name}`
          : st.mode === "ship"
            ? "Nighthaul"
            : st.mode === "planet"
              ? `${p.name} highway`
              : st.mode === "space"
                ? "Warp lane"
                : "Undercity";
    opts.onStatus(`${st.name} · ${loc} · V${vigor()} · ${st.hp}/${st.maxHp} · ${st.credits}¢ · contract ${Math.max(0, left)} left`);
  };

  const addCargo = (id: string, n: number) => {
    if (n > 0 && cargoCount(st.cargo) + n > holdCap()) return false;
    st.cargo[id] = (st.cargo[id] ?? 0) + n;
    if (st.cargo[id] <= 0) delete st.cargo[id];
    return true;
  };

  const carveMine = () => {
    mine = new Uint8Array(MINE_C * MINE_R);
    for (let y = 0; y < MINE_R; y++) {
      for (let x = 0; x < MINE_C; x++) {
        let t = 0;
        if (y > 6) t = 1;
        if (y > 10) t = Math.random() < 0.55 ? 2 : 1;
        if (y > 8 && Math.random() < 0.08) t = 3;
        if (y > 12 && Math.random() < 0.05) t = 4;
        if (y <= 6 && (x < 2 || x > MINE_C - 3)) t = 2;
        mine[y * MINE_C + x] = t;
      }
    }
    for (let x = 0; x < 6; x++) mine[6 * MINE_C + x] = 0;
    minePx = 3;
    minePy = 5;
    mineVy = 0;
  };

  const enterShip = () => {
    st.mode = "ship";
    st.interior = null;
    player.x = 280;
    player.y = 430;
    opts.onShop(null);
    shopId = null;
    status();
    persist();
  };
  const enterCity = (id: CityId, at: "ship" | "gate" | "stay") => {
    st.mode = "city";
    st.city = id;
    st.planet = cityById(id).planet;
    st.interior = null;
    const lay = layoutFor(cityById(id));
    if (at === "ship") {
      const s = lay.spots.find((x) => x.kind === "ship");
      player.x = s ? s.x + 80 : 280;
    } else if (at === "gate") {
      const g = lay.spots.find((x) => x.kind === "gate");
      player.x = g ? g.x + 40 : 280;
    }
    player.y = GROUND + 40;
    spawnMuggers();
    opts.onShop(null);
    shopId = null;
    status();
    persist();
  };
  const enterInterior = (id: BuildingId) => {
    st.mode = "interior";
    st.interior = id;
    player.x = 180;
    player.y = GROUND + 20;
    opts.onShop(null);
    shopId = null;
    status();
  };
  const enterPlanet = (fromCity: string) => {
    st.mode = "planet";
    st.interior = null;
    player.x = planetX(fromCity, st.planet);
    player.y = GROUND + 36;
    opts.onShop(null);
    shopId = null;
    status();
  };
  const launch = () => {
    if (st.systems.engine < 20) {
      opts.onStatus("Engine is dead. Fit a shunt.");
      return;
    }
    st.mode = "space";
    player.x = 640;
    player.y = 400;
    st.heading = -Math.PI / 2;
    st.speed = 80;
    st.fuel = Math.max(st.fuel, 24);
    pirates = [
      { x: 1100, y: 280, heading: Math.PI, hp: 6, hurt: 0, cd: 0.6 },
      { x: 1600, y: 620, heading: 0.4, hp: 6, hurt: 0, cd: 1.1 },
    ];
    shots = [];
    opts.onShop(null);
    if (!st.mail.includes("heap")) st.mail.push("heap");
    status();
  };
  const land = () => {
    const star = citiesOn(st.planet).find((c) => c.starport) ?? citiesOn(st.planet)[0];
    pirates = [];
    shots = [];
    opts.onMap(false);
    enterCity(star.id as CityId, "ship");
  };

  const nearSpot = (max = 120) => {
    const lay = layoutFor(city());
    return lay.spots.find((s) => Math.abs(player.x - s.x) < max) ?? null;
  };

  const interact = () => {
    if (interactLock > 0) return;
    interactLock = 0.4;
    if (st.mode === "city") {
      const s = nearSpot();
      if (!s) return;
      if (s.kind === "ship") enterShip();
      else if (s.kind === "gate") enterPlanet(st.city);
      else if (s.kind === "mine") {
        st.mode = "mine";
        carveMine();
        status();
      } else enterInterior(s.id);
    } else if (st.mode === "interior") {
      if (player.x < 160) {
        const interiorId = st.interior;
        enterCity(st.city, "stay");
        const lay = layoutFor(city());
        const b = lay.spots.find((s) => s.kind === "building" && s.id === interiorId);
        player.x = b ? b.x : 400;
        player.y = GROUND + 40;
        return;
      }
      if (player.x > 360) {
        shopId = st.interior;
        opts.onShop(st.interior);
      }
    } else if (st.mode === "ship") {
      const stations: Array<{ x: number; act: () => void; hint: string }> = [
        { x: 200, hint: "E  hatch", act: () => {
          const c = city();
          if (c.starport) enterCity(st.city, "ship");
          else enterPlanet(st.city);
        } },
        { x: 320, hint: "E  cargo", act: () => { opts.onShop("cargo"); shopId = "cargo"; } },
        { x: 450, hint: "E  cryo bay", act: () => { opts.onShop("cryo"); shopId = "cryo"; } },
        { x: 590, hint: "E  pod bay", act: () => enterPlanet(st.city) },
        { x: 740, hint: "E  helm · launch", act: () => launch() },
      ];
      let best = stations[0];
      let bestD = 9999;
      for (const s of stations) {
        const d = Math.abs(player.x - s.x);
        if (d < bestD) {
          bestD = d;
          best = s;
        }
      }
      if (bestD < 110) best.act();
    } else if (st.mode === "planet") {
      const list = citiesOn(st.planet);
      const hit = list.find((c) => Math.abs(player.x - planetX(c.id, st.planet)) < 140);
      if (hit) {
        enterCity(hit.id as CityId, "gate");
        return;
      }
      if (Math.abs(player.x - 1400) < 100 || Math.abs(player.x - 3000) < 100) {
        st.mode = "mine";
        carveMine();
        status();
      }
    } else if (st.mode === "space") {
      land();
    } else if (st.mode === "mine") {
      if (minePx < 5 && minePy < 8) {
        st.mode = "city";
        const lay = layoutFor(city());
        const m = lay.spots.find((s) => s.kind === "mine");
        player.x = m ? m.x : lay.width - 260;
        player.y = GROUND + 40;
        mine = null;
        status();
      }
    }
  };
  doInteract = interact;

  const fireFoot = () => {
    if (atkCd > 0) return;
    const dir = facingVec(player.facing);
    if (st.hasPistol) {
      atkCd = 0.28;
      shots.push({
        x: player.x + dir.x * 28,
        y: player.y - 18 + dir.y * 10,
        vx: dir.x * 520,
        vy: dir.y * 520,
        life: 0.7,
        from: "player",
      });
      fx.push({ x: player.x + dir.x * 22, y: player.y - 22, life: 0.12, kind: "muzzle" });
    } else {
      atkCd = 0.38;
      fx.push({ x: player.x + dir.x * 24, y: player.y - 10, life: 0.16, kind: "slash" });
      for (const m of muggers) {
        if (m.hp <= 0) continue;
        if (Math.hypot(m.x - player.x, m.y - player.y) < 58) {
          m.hp -= 2 + portrait.brawl * 0.4;
          m.hurt = 0.2;
        }
      }
    }
  };

  const fireSpace = () => {
    if (atkCd > 0 || st.systems.lasers < 10) return;
    atkCd = st.modules.includes("lasers") ? 0.18 : 0.32;
    const fxv = -Math.sin(st.heading);
    const fy = -Math.cos(st.heading);
    shots.push({
      x: player.x + fxv * 36,
      y: player.y + fy * 36,
      vx: fxv * 680,
      vy: fy * 680,
      life: 1.1,
      from: "player",
    });
    fx.push({ x: player.x + fxv * 30, y: player.y + fy * 30, life: 0.1, kind: "muzzle" });
  };

  function facingVec(f: 0 | 1 | 2 | 3) {
    if (f === 0) return { x: 0, y: 1 };
    if (f === 1) return { x: -1, y: 0 };
    if (f === 2) return { x: 1, y: 0 };
    return { x: 0, y: -1 };
  }

  const drawSheet = (
    image: HTMLImageElement | null,
    cols: number,
    rows: number,
    col: number,
    row: number,
    x: number,
    y: number,
    h: number,
    flip = false,
  ) => {
    if (!image) return;
    const cw = image.width / cols;
    const ch = image.height / rows;
    const w = (cw / ch) * h;
    ctx.save();
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(image, col * cw, row * ch, cw, ch, -w / 2, -h, w, h);
    ctx.restore();
  };

  const drawLimb = (len: number, thick: number, ang: number, color: string) => {
    ctx.save();
    ctx.rotate(ang);
    ctx.fillStyle = color;
    const r = Math.max(2, thick / 2);
    ctx.beginPath();
    ctx.roundRect(-r, 0, thick, len, r);
    ctx.fill();
    ctx.restore();
  };

  const drawWalker = (
    image: HTMLImageElement | null,
    facing: 0 | 1 | 2 | 3,
    frame: number,
    x: number,
    y: number,
    h: number,
    moving: boolean,
  ) => {
    if (!image) return;
    const side = facing === 1 || facing === 2;
    const t = frame * Math.PI;
    const swing = moving ? Math.sin(t) : 0;
    const bob = moving ? Math.abs(Math.cos(t)) * h * 0.028 : 0;
    const cw = image.width / 4;
    const ch = image.height / 4;
    const w = (cw / ch) * h;
    ctx.save();
    ctx.translate(x, y - bob);
    if (facing === 1) ctx.scale(-1, 1);
    const row = facing === 1 ? 2 : facing;
    const coat = "#2a3038";
    const boot = "#14161c";
    const hipY = -h * 0.4;
    const shY = -h * 0.66;
    const legLen = h * 0.4;
    const armLen = h * 0.3;
    const legAng = swing * (side ? 0.55 : 0.28);
    const armAng = -swing * (side ? 0.7 : 0.4);
    if (moving) {
      ctx.save();
      ctx.translate(side ? -w * 0.04 : -w * 0.12, hipY);
      drawLimb(legLen, h * 0.075, -legAng, boot);
      ctx.restore();
      ctx.save();
      ctx.translate(side ? -w * 0.08 : -w * 0.16, shY);
      drawLimb(armLen, h * 0.055, -armAng, coat);
      ctx.restore();
      const srcH = ch * 0.58;
      const dstH = h * 0.58;
      ctx.drawImage(image, 0, row * ch, cw, srcH, -w / 2, -h, w, dstH);
      ctx.save();
      ctx.translate(side ? w * 0.05 : w * 0.12, hipY);
      drawLimb(legLen, h * 0.08, legAng, boot);
      ctx.restore();
      ctx.save();
      ctx.translate(side ? w * 0.1 : w * 0.16, shY);
      drawLimb(armLen, h * 0.06, armAng, coat);
      ctx.restore();
    } else {
      ctx.drawImage(image, 0, row * ch, cw, ch, -w / 2, -h, w, h);
    }
    ctx.restore();
  };

  const tileFill = (image: HTMLImageElement | null, x: number, y: number, w: number, h: number, s: number) => {
    if (!image) {
      ctx.fillStyle = "#1a222c";
      ctx.fillRect(x, y, w, h);
      return;
    }
    const ox = ((x % s) + s) % s;
    const oy = ((y % s) + s) % s;
    for (let yy = y - oy; yy < y + h; yy += s) {
      for (let xx = x - ox; xx < x + w; xx += s) {
        ctx.drawImage(image, xx, yy, s, s);
      }
    }
  };

  const resize = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  let last = performance.now();
  let raf = 0;
  let dead = false;
  let won = false;

  const walkFoot = (dt: number, mx: number, my: number, xmin: number, xmax: number, ymin: number, ymax: number, spd: number) => {
    player.x = clamp(player.x + mx * spd * dt, xmin, xmax);
    player.y = clamp(player.y + my * spd * dt, ymin, ymax);
    if (Math.abs(mx) > 0.1 || Math.abs(my) > 0.1) {
      player.facing = Math.abs(mx) > Math.abs(my) ? (mx < 0 ? 1 : 2) : my > 0 ? 0 : 3;
      player.frame += dt * 11;
    }
  };

  const tickMuggers = (dt: number, xmin: number, xmax: number) => {
    for (const m of muggers) {
      if (m.hp <= 0) continue;
      m.hurt = Math.max(0, m.hurt - dt);
      m.x += m.vx * dt;
      if (m.x < xmin || m.x > xmax) m.vx *= -1;
      m.facing = m.vx < 0 ? 1 : 2;
      m.frame += dt * 6;
      if (Math.hypot(m.x - player.x, m.y - player.y) < 42 && m.hurt <= 0) {
        player.hp -= 1;
        player.hurt = 0.35;
        m.hurt = 0.6;
      }
    }
    for (const s of shots) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      for (const m of muggers) {
        if (m.hp <= 0) continue;
        if (Math.hypot(m.x - s.x, m.y - 20 - s.y) < 28) {
          m.hp -= 2 + portrait.guns * 0.5;
          m.hurt = 0.2;
          s.life = 0;
          if (m.hp <= 0) {
            st.credits += 18 + Math.floor(Math.random() * 12);
            fx.push({ x: m.x, y: m.y - 20, life: 0.35, kind: "explode" });
          }
        }
      }
    }
  };

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    st.hp = player.hp;
    atkCd = Math.max(0, atkCd - dt);
    interactLock = Math.max(0, interactLock - dt);
    animT += dt;
    player.hurt = Math.max(0, player.hurt - dt);
    drain += dt;
    if (drain > 8) {
      drain = 0;
      st.rest = Math.max(0, st.rest - 1);
      st.nourish = Math.max(0, st.nourish - 1);
      if (st.rest <= 0 || st.nourish <= 0) player.hp = Math.max(1, player.hp - 1);
    }
    if (just.has("KeyE") || just.has("KeyF")) interact();
    if (just.has("KeyM")) opts.onMap(true);
    if (just.has("KeyC")) {
      opts.onShop("cargo");
      shopId = "cargo";
    }
    just.clear();

    const mx = (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0) - (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0) + stick.mx;
    const my = (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0) - (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0) + stick.my;
    const attack = keys.has("Space") || (pointer.down && !stick.active);
    hint = "";

    if (st.mode === "city") {
      const lay = layoutFor(city());
      const spd = 165 + portrait.luck * 4;
      walkFoot(dt, mx, my, 80, lay.width - 80, GROUND + 8, GROUND + 110, spd);
      if (attack) fireFoot();
      tickMuggers(dt, 400, lay.width - 300);
      const s = nearSpot();
      if (s?.kind === "ship") hint = "E  board Nighthaul";
      else if (s?.kind === "gate") hint = "E  take the pod";
      else if (s?.kind === "mine") hint = "E  undercity";
      else if (s?.kind === "building") hint = `E  ${BUILDINGS.find((b) => b.id === s.id)?.name ?? s.id}`;
      cam.x = clamp(player.x - canvas.clientWidth * 0.38, 0, Math.max(0, lay.width - canvas.clientWidth));
      cam.y = 0;
    } else if (st.mode === "interior") {
      walkFoot(dt, mx, my, 80, Math.max(720, canvas.clientWidth - 80), GROUND - 40, GROUND + 80, 150);
      if (player.x < 160) hint = "E  street";
      else if (player.x > 360) hint = `E  ${BUILDINGS.find((b) => b.id === st.interior)?.name ?? "counter"}`;
      cam.x = 0;
      cam.y = 0;
    } else if (st.mode === "ship") {
      walkFoot(dt, mx, my, 140, 860, 360, 500, 150);
      const marks = [
        [200, "E  hatch"],
        [320, "E  cargo"],
        [450, "E  cryo bay"],
        [590, "E  pod bay"],
        [740, "E  helm · launch"],
      ] as const;
      let bestH = marks[0][1];
      let bestD = 9999;
      for (const [x, h] of marks) {
        const d = Math.abs(player.x - x);
        if (d < bestD) {
          bestD = d;
          bestH = h;
        }
      }
      if (bestD < 110) hint = bestH;
      cam.x = 0;
      cam.y = 0;
    } else if (st.mode === "planet") {
      const spd = 280;
      player.x = clamp(player.x + mx * spd * dt, 80, PLANET_W - 80);
      player.y = GROUND + 36;
      if (Math.abs(mx) > 0.1) {
        player.facing = mx < 0 ? 1 : 2;
        player.frame += dt * 8;
      }
      const list = citiesOn(st.planet);
      const hit = list.find((c) => Math.abs(player.x - planetX(c.id, st.planet)) < 140);
      if (hit) hint = `E  ${hit.name}`;
      else if (Math.abs(player.x - 1400) < 100 || Math.abs(player.x - 3000) < 100) hint = "E  mine shaft";
      cam.x = clamp(player.x - canvas.clientWidth * 0.42, 0, PLANET_W - canvas.clientWidth);
      cam.y = 0;
    } else if (st.mode === "space") {
      let steer = 0;
      if (testSteer !== null) steer = testSteer;
      else {
        if (keys.has("KeyA") || keys.has("ArrowLeft") || stick.mx < -0.2) steer += 1;
        if (keys.has("KeyD") || keys.has("ArrowRight") || stick.mx > 0.2) steer -= 1;
      }
      const thrust = keys.has("KeyW") || keys.has("ArrowUp") || stick.my < -0.25 ? 1 : 0;
      const brake = keys.has("KeyS") || keys.has("ArrowDown") || stick.my > 0.35 ? 1 : 0;
      const turn = (st.modules.includes("engine") ? 2.4 : 1.7) * (0.35 + Math.min(1, Math.abs(st.speed) / 220));
      st.heading = wrap(st.heading + steer * turn * dt);
      const fxx = -Math.sin(st.heading);
      const fyy = -Math.cos(st.heading);
      if (thrust) st.speed = clamp(st.speed + (220 + portrait.pilot * 12) * dt, -80, 340);
      if (brake) st.speed = clamp(st.speed - 280 * dt, -40, 340);
      st.speed *= Math.pow(0.32, dt);
      player.x += fxx * st.speed * dt;
      player.y += fyy * st.speed * dt;
      if (attack) fireSpace();
      hint = "E  land starport · M  star chart";
      for (const p of pirates) {
        if (p.hp <= 0) continue;
        p.hurt = Math.max(0, p.hurt - dt);
        p.cd -= dt;
        const dx = player.x - p.x;
        const dy = player.y - p.y;
        const want = Math.atan2(-dx, -dy);
        p.heading = wrap(p.heading + wrap(want - p.heading) * 1.6 * dt);
        const pfx = -Math.sin(p.heading);
        const pfy = -Math.cos(p.heading);
        p.x += pfx * 140 * dt;
        p.y += pfy * 140 * dt;
        if (p.cd <= 0 && Math.hypot(dx, dy) < 520) {
          p.cd = 0.9;
          shots.push({ x: p.x + pfx * 24, y: p.y + pfy * 24, vx: pfx * 420, vy: pfy * 420, life: 1, from: "foe" });
        }
      }
      for (const s of shots) {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= dt;
        if (s.from === "player") {
          for (const p of pirates) {
            if (p.hp <= 0) continue;
            if (Math.hypot(p.x - s.x, p.y - s.y) < 34) {
              p.hp -= 2;
              p.hurt = 0.15;
              s.life = 0;
              if (p.hp <= 0) {
                st.credits += 40;
                fx.push({ x: p.x, y: p.y, life: 0.4, kind: "explode" });
              }
            }
          }
        } else if (Math.hypot(s.x - player.x, s.y - player.y) < 28) {
          const soak = st.modules.includes("shields") && st.systems.shields > 20 ? 0.45 : 1;
          player.hp -= soak;
          st.systems.shields = Math.max(0, st.systems.shields - 6);
          s.life = 0;
          player.hurt = 0.2;
        }
      }
      const follow = 90;
      cam.x = player.x - fxx * follow - canvas.clientWidth / 2;
      cam.y = player.y - fyy * follow - canvas.clientHeight / 2;
    } else if (st.mode === "mine" && mine) {
      const ax = mx;
      minePx += ax * 5.2 * dt;
      mineVy += 18 * dt;
      if ((keys.has("KeyW") || keys.has("Space") || stick.my < -0.5) && onGround) mineVy = -7.2;
      minePy += mineVy * dt;
      const solid = (cx: number, cy: number) => {
        const ix = Math.floor(cx);
        const iy = Math.floor(cy);
        if (iy < 0) return false;
        if (ix < 0 || ix >= MINE_C || iy >= MINE_R) return true;
        return mine![iy * MINE_C + ix] > 0;
      };
      onGround = solid(minePx, minePy + 0.55);
      if (onGround && mineVy > 0) {
        minePy = Math.floor(minePy + 0.55) - 0.55;
        mineVy = 0;
      }
      if (solid(minePx, minePy - 0.4) && mineVy < 0) {
        mineVy = 0;
        minePy += 0.1;
      }
      if (solid(minePx + 0.3, minePy)) minePx -= 4 * dt;
      if (solid(minePx - 0.3, minePy)) minePx += 4 * dt;
      minePx = clamp(minePx, 0.4, MINE_C - 0.4);
      player.facing = ax < -0.1 ? 1 : ax > 0.1 ? 2 : player.facing;
      player.frame += dt * 8;
      const dig = attack || keys.has("KeyS");
      if (dig && atkCd <= 0) {
        atkCd = 0.16;
        const dirx = player.facing === 1 ? -1 : player.facing === 2 ? 1 : 0;
        const diry = keys.has("KeyS") || stick.my > 0.3 ? 1 : player.facing === 0 ? 1 : player.facing === 3 ? -1 : 1;
        const tx = Math.floor(minePx + dirx * 0.8);
        const ty = Math.floor(minePy + diry * 0.9);
        if (tx >= 0 && ty >= 0 && tx < MINE_C && ty < MINE_R) {
          const t = mine[ty * MINE_C + tx];
          if (t > 0) {
            mine[ty * MINE_C + tx] = 0;
            if (t === 3) addCargo("copper", 1);
            if (t === 4) addCargo("crystal", 1);
            fx.push({ x: (tx + 0.5) * MINE_T, y: (ty + 0.5) * MINE_T, life: 0.2, kind: "slash" });
          }
        }
      }
      hint = minePx < 5 && minePy < 8 ? "E  ladder" : "S / click dig";
      cam.x = minePx * MINE_T - canvas.clientWidth / 2;
      cam.y = minePy * MINE_T - canvas.clientHeight / 2;
    }

    shots = shots.filter((s) => s.life > 0);
    fx = fx.filter((f) => {
      f.life -= dt;
      return f.life > 0;
    });
    if (player.hp <= 0 && !dead) {
      dead = true;
      player.hp = 0;
      opts.onStatus("Down. The contract goes cold.");
    }
    const need = CONTRACT.need;
    if (
      !won &&
      st.delivered.chip >= need.chip &&
      st.delivered.nutrapack >= need.nutrapack &&
      st.delivered.coolant >= need.coolant &&
      st.delivered.grain >= need.grain &&
      st.delivered.cryopod >= need.cryopod
    ) {
      won = true;
      opts.onStatus("Banville Hold is awake. The frozen contract is paid.");
    }

    draw(mx, attack);
    if (import.meta.env.DEV || new URLSearchParams(location.search).has("qa")) {
      window.__controlsTest = {
        getYaw: () => st.heading,
        getSpeed: () => st.speed,
        setSteer: (v: number) => {
          testSteer = v;
        },
        setKeys: (codes: string[]) => {
          keys.clear();
          for (const c of codes) keys.add(c);
        },
      };
    }
  };

  const drawParallax = (w: number, h: number) => {
    const far = farImgs[st.planet] ?? sky;
    if (sky) ctx.drawImage(sky, 0, 0, w, h * 0.62);
    else {
      ctx.fillStyle = "#07080c";
      ctx.fillRect(0, 0, w, h);
    }
    if (far) {
      const px = -((cam.x * 0.25) % far.width);
      ctx.globalAlpha = 0.92;
      ctx.drawImage(far, px, h * 0.08, far.width, h * 0.7);
      ctx.drawImage(far, px + far.width, h * 0.08, far.width, h * 0.7);
      ctx.globalAlpha = 1;
    }
    if (near) {
      const px = -((cam.x * 0.55) % near.width);
      ctx.globalAlpha = 0.35;
      ctx.drawImage(near, px, h * 0.2, near.width, h * 0.7);
      ctx.drawImage(near, px + near.width, h * 0.2, near.width, h * 0.7);
      ctx.globalAlpha = 1;
    }
  };

  const drawPlayer = (mx: number, attacking: boolean, h = 176) => {
    const moving = Math.abs(mx) > 0.08;
    const atkImg = st.hasPistol ? pistol : melee;
    ctx.globalAlpha = player.hurt > 0 ? 0.6 : 1;
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(player.x, player.y - 6, 22, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    if (attacking && atkCd > 0.02 && st.mode !== "planet") {
      drawSheet(atkImg, 2, 2, Math.floor(animT * 10) % 2, Math.floor(animT * 5) % 2, player.x, player.y, h, player.facing === 1);
    } else {
      drawWalker(walk, player.facing, player.frame, player.x, player.y, h, moving);
    }
    ctx.globalAlpha = 1;
  };

  const label = (x: number, y: number, text: string) => {
    ctx.fillStyle = "rgba(7,8,12,0.7)";
    ctx.fillRect(x - 52, y, 104, 16);
    ctx.fillStyle = "#5eead4";
    ctx.font = "11px IBM Plex Sans, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(text, x, y + 12);
  };

  const draw = (mx: number, attacking: boolean) => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.fillStyle = "#07080c";
    ctx.fillRect(0, 0, w, h);

    if (st.mode === "city") {
      const lay = layoutFor(city());
      drawParallax(w, h);
      ctx.save();
      ctx.translate(-cam.x, 0);
      tileFill(street, 0, GROUND + 20, lay.width, h - GROUND, 96);
      ctx.fillStyle = "rgba(7,8,12,0.35)";
      ctx.fillRect(0, GROUND + 20, lay.width, 8);
      for (const s of lay.spots) {
        if (s.kind === "ship" && haul) {
          const hh = 210;
          const hw = (haul.width / haul.height) * hh;
          ctx.drawImage(haul, s.x - 40, GROUND + 28 - hh, hw, hh);
          label(s.x, GROUND + 28, "Nighthaul");
        } else if (s.kind === "gate") {
          ctx.fillStyle = "rgba(94,234,212,0.18)";
          ctx.fillRect(s.x - 36, GROUND - 90, 72, 118);
          ctx.strokeStyle = "#5eead4";
          ctx.strokeRect(s.x - 36, GROUND - 90, 72, 118);
          if (pod) ctx.drawImage(pod, s.x - 70, GROUND - 20, 140, 78);
          label(s.x, GROUND + 28, "Pod gate");
        } else if (s.kind === "mine") {
          ctx.fillStyle = "#14161c";
          ctx.fillRect(s.x - 40, GROUND - 30, 80, 50);
          label(s.x, GROUND + 28, "Undercity");
        } else if (s.kind === "building") {
          const im = bldImgs[s.id];
          const bh = 200;
          if (im) {
            const bw = Math.min(220, (im.width / im.height) * bh);
            ctx.drawImage(im, s.x - bw / 2, GROUND + 24 - bh, bw, bh);
          }
          if (s.id === "hospital") {
            ctx.fillStyle = "#5eead4";
            ctx.fillRect(s.x - 8, GROUND - 150, 16, 40);
            ctx.fillRect(s.x - 20, GROUND - 138, 40, 16);
          }
          label(s.x, GROUND + 28, BUILDINGS.find((x) => x.id === s.id)?.name ?? s.id);
        }
      }
      drawSheet(mechanicImg, 2, 2, Math.floor(animT * 5) % 2, 0, (lay.spots.find((s) => s.kind === "building" && s.id === "parts")?.x ?? 560), GROUND + 58, 118);
      drawSheet(bartenderImg, 2, 2, Math.floor(animT * 5) % 2, 0, (lay.spots.find((s) => s.kind === "building" && s.id === "bar")?.x ?? 920), GROUND + 58, 114);
      drawSheet(merchantImg, 2, 2, Math.floor(animT * 4) % 2, 0, (lay.spots.find((s) => s.kind === "building" && s.id === "exchange")?.x ?? 1620), GROUND + 58, 118);
      for (const m of muggers) {
        if (m.hp <= 0) continue;
        ctx.globalAlpha = m.hurt > 0 ? 0.55 : 1;
        drawSheet(muggerImg, 2, 2, Math.floor(m.frame) % 2, Math.floor(m.frame / 2) % 2, m.x, m.y, 124, m.facing === 1);
        ctx.globalAlpha = 1;
      }
      drawPlayer(mx, attacking);
      ctx.restore();
    } else if (st.mode === "interior") {
      const inn = st.interior ? inImgs[st.interior] : null;
      if (inn) ctx.drawImage(inn, 0, 0, w, h);
      else if (shipIn) ctx.drawImage(shipIn, 0, 0, w, h);
      ctx.fillStyle = "rgba(7,8,12,0.28)";
      ctx.fillRect(0, GROUND - 10, w, h - GROUND + 10);
      tileFill(street, 0, GROUND + 16, w, 80, 96);
      ctx.fillStyle = "rgba(7,8,12,0.55)";
      ctx.fillRect(24, 24, 320, 56);
      ctx.fillStyle = "#e8eef4";
      ctx.font = "16px Syne, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(BUILDINGS.find((b) => b.id === st.interior)?.name ?? "Inside", 40, 48);
      ctx.fillStyle = "#8b96a5";
      ctx.font = "12px IBM Plex Sans, sans-serif";
      ctx.fillText("E west door · E counter", 40, 68);
      const npc = st.interior === "bar" ? bartenderImg : st.interior === "parts" ? mechanicImg : merchantImg;
      drawSheet(npc, 2, 2, Math.floor(animT * 5) % 2, 0, 520, GROUND + 40, 128);
      drawPlayer(mx, false, 160);
    } else if (st.mode === "ship") {
      if (shipIn) ctx.drawImage(shipIn, 0, 0, w, h);
      tileFill(deck, 80, 380, w - 160, 160, 72);
      const stations = [
        [200, "Hatch"],
        [320, "Cargo"],
        [450, "Cryo"],
        [590, "Pod"],
        [740, "Helm"],
      ] as const;
      for (const [x, name] of stations) {
        ctx.fillStyle = Math.abs(player.x - x) < 70 ? "rgba(94,234,212,0.28)" : "rgba(7,8,12,0.45)";
        ctx.fillRect(x - 48, 348, 96, 22);
        ctx.fillStyle = "#5eead4";
        ctx.font = "11px IBM Plex Sans, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(name, x, 363);
      }
      ctx.fillStyle = "rgba(7,8,12,0.55)";
      ctx.fillRect(40, 24, 300, 64);
      ctx.fillStyle = "#e8eef4";
      ctx.font = "16px Syne, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("NIGHTHAUL", 56, 50);
      ctx.fillStyle = "#8b96a5";
      ctx.font = "12px IBM Plex Sans, sans-serif";
      ctx.fillText("Stations along the deck · M star map", 56, 72);
      if (pod) ctx.drawImage(pod, 520, 300, 180, 100);
      drawWalker(walk, player.facing, player.frame, player.x, player.y, 140, Math.abs(mx) > 0.08);
    } else if (st.mode === "planet") {
      drawParallax(w, h);
      ctx.save();
      ctx.translate(-cam.x, 0);
      tileFill(street, 0, GROUND + 24, PLANET_W, h - GROUND, 96);
      for (const c of citiesOn(st.planet)) {
        const x = planetX(c.id, st.planet);
        const b0 = c.buildings[0];
        const im = bldImgs[b0] ?? bldImgs.bar;
        if (im) ctx.drawImage(im, x - 70, GROUND - 160, 140, 190);
        if (c.starport && haul) ctx.drawImage(haul, x - 210, GROUND - 170, 110, 200);
        label(x, GROUND + 32, c.name);
      }
      ctx.fillStyle = "#14161c";
      ctx.fillRect(1360, GROUND - 10, 80, 40);
      ctx.fillRect(2960, GROUND - 10, 80, 40);
      label(1400, GROUND + 32, "Mine");
      label(3000, GROUND + 32, "Mine");
      if (pod) {
        const pw = 220;
        const ph = 120;
        ctx.save();
        if (player.facing === 1) {
          ctx.translate(player.x, player.y);
          ctx.scale(-1, 1);
          ctx.drawImage(pod, -pw / 2, -ph + 16, pw, ph);
        } else {
          ctx.drawImage(pod, player.x - pw / 2, player.y - ph + 16, pw, ph);
        }
        ctx.restore();
      }
      drawPlayer(mx, false, 110);
      ctx.restore();
    } else if (st.mode === "space") {
      if (spaceBg) {
        const px = -((cam.x * 0.08) % spaceBg.width);
        const py = -((cam.y * 0.08) % spaceBg.height);
        ctx.drawImage(spaceBg, px - spaceBg.width, py - spaceBg.height, spaceBg.width * 3, spaceBg.height * 3);
      }
      ctx.save();
      ctx.translate(-cam.x, -cam.y);
      const drawCraft = (image: HTMLImageElement | null, x: number, y: number, heading: number, size: number, hurt: boolean) => {
        if (!image) return;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-heading);
        if (hurt) ctx.globalAlpha = 0.5;
        const hh = size;
        const hw = (image.width / image.height) * hh;
        ctx.drawImage(image, -hw / 2, -hh / 2, hw, hh);
        ctx.restore();
      };
      drawCraft(haul, player.x, player.y, st.heading, 280, player.hurt > 0);
      for (const p of pirates) {
        if (p.hp <= 0) continue;
        drawCraft(pirateImg, p.x, p.y, p.heading, 210, p.hurt > 0);
      }
      for (const s of shots) {
        if (laser) {
          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.rotate(Math.atan2(s.vy, s.vx));
          ctx.drawImage(laser, -28, -8, 40, 16);
          ctx.restore();
        } else {
          ctx.fillStyle = s.from === "player" ? "#5eead4" : "#e85d4c";
          ctx.fillRect(s.x - 4, s.y - 2, 8, 4);
        }
      }
      ctx.restore();
    } else if (st.mode === "mine" && mine) {
      if (mineFar) ctx.drawImage(mineFar, 0, 0, w, h);
      ctx.save();
      ctx.translate(-cam.x, -cam.y);
      for (let y = 0; y < MINE_R; y++) {
        for (let x = 0; x < MINE_C; x++) {
          const t = mine[y * MINE_C + x];
          if (!t) continue;
          const im = t === 4 ? crystal : t === 3 ? copper : t === 2 ? stone : dirt;
          if (im) ctx.drawImage(im, x * MINE_T, y * MINE_T, MINE_T, MINE_T);
        }
      }
      const moving = Math.abs(mx) > 0.08;
      if (attacking) {
        drawSheet(mineAnim, 2, 2, Math.floor(animT * 8) % 2, 0, minePx * MINE_T, minePy * MINE_T + 18, 52, player.facing === 1);
      } else {
        drawWalker(walk, player.facing === 1 ? 1 : 2, player.frame, minePx * MINE_T, minePy * MINE_T + 18, 52, moving);
      }
      ctx.fillStyle = "#5eead4";
      ctx.font = "12px IBM Plex Sans, sans-serif";
      ctx.fillText("ladder", 24, 6 * MINE_T - 8);
      ctx.restore();
    }

    for (const f of fx) {
      const im = f.kind === "muzzle" ? muzzle : f.kind === "slash" ? slash : explode;
      if (!im) continue;
      ctx.save();
      ctx.globalAlpha = clamp(f.life * 4, 0, 1);
      const sx = f.x - cam.x;
      const sy = st.mode === "city" || st.mode === "planet" || st.mode === "interior" || st.mode === "ship" ? f.y : f.y - cam.y;
      ctx.drawImage(im, sx - 24, sy - 24, 48, 48);
      ctx.restore();
    }

    if (hint) {
      ctx.fillStyle = "rgba(7,8,12,0.72)";
      ctx.fillRect(w / 2 - 140, h - 92, 280, 28);
      ctx.fillStyle = "#5eead4";
      ctx.font = "13px IBM Plex Sans, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(hint, w / 2, h - 73);
    }

    if (stick.active) {
      ctx.strokeStyle = "rgba(232,238,244,0.35)";
      ctx.beginPath();
      ctx.arc(stick.ox, stick.oy, 46, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(94,234,212,0.8)";
      ctx.beginPath();
      ctx.arc(stick.ox + stick.mx * 28, stick.oy + stick.my * 28, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    if (dead) {
      ctx.fillStyle = "rgba(7,8,12,0.72)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e8eef4";
      ctx.font = "32px Syne, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("You went down", w / 2, h / 2);
    }
    if (won) {
      ctx.fillStyle = "rgba(7,8,12,0.45)";
      ctx.fillRect(0, 0, w, 90);
      ctx.fillStyle = "#5eead4";
      ctx.font = "22px Syne, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("The frozen contract is paid.", w / 2, 48);
    }
  };

  status();
  opts.onReady();
  canvas.tabIndex = 0;
  canvas.focus();
  raf = requestAnimationFrame(tick);

  const api: GameApi = {
    destroy: () => {
      persist();
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.removeEventListener("blur", blur);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", blur);
      canvas.removeEventListener("pointerdown", pd);
      canvas.removeEventListener("pointerup", pu);
      canvas.removeEventListener("pointercancel", pu);
      canvas.removeEventListener("pointermove", pm);
      delete window.__controlsTest;
    },
    getState: () => st,
    buy: (id) => {
      const p = planet();
      if (id === "pistol") {
        if (st.credits < p.prices.pistol) return "Not enough scrip.";
        st.credits -= p.prices.pistol;
        st.hasPistol = true;
        persist();
        return "Holdout seated.";
      }
      if (id === "baton") {
        if (st.credits < p.prices.baton) return "Not enough scrip.";
        st.credits -= p.prices.baton;
        st.hasBaton = true;
        persist();
        return "Baton on the belt.";
      }
      const cost = priceOf(p, id);
      if (st.credits < cost) return "Not enough scrip.";
      if (!addCargo(id, 1)) return "Hold is full.";
      st.credits -= cost;
      status();
      persist();
      return `Bought ${GOODS.find((g) => g.id === id)?.name ?? id}.`;
    },
    sell: (id) => {
      if (!st.cargo[id]) return "You are not carrying that.";
      const cost = priceOf(planet(), id);
      addCargo(id, -1);
      st.credits += Math.floor(cost * 0.72);
      status();
      persist();
      return `Sold ${id}.`;
    },
    repair: (id) => {
      if ((st.cargo.shunt ?? 0) < 1) return "Need a shunt.";
      if (!(id in st.systems)) return "No such system.";
      addCargo("shunt", -1);
      st.systems[id] = Math.min(100, st.systems[id] + 45);
      status();
      persist();
      return `${id} jumped.`;
    },
    fit: (id) => {
      const mod = MODULES.find((m) => m.id === id);
      if (!mod) return "No such part.";
      if (st.modules.includes(id)) return "Already fitted.";
      if (st.credits < mod.cost) return "Not enough scrip.";
      st.credits -= mod.cost;
      st.modules.push(id);
      st.systems[id] = Math.max(st.systems[id] ?? 0, 80);
      status();
      persist();
      return `${mod.name} bolted in.`;
    },
    deposit: (n) => {
      const amt = Math.min(n, st.credits);
      st.credits -= amt;
      st.bank += amt;
      status();
      persist();
      return `Parked ${amt}¢.`;
    },
    withdraw: (n) => {
      const amt = Math.min(n, st.bank);
      st.bank -= amt;
      st.credits += amt;
      status();
      persist();
      return `Drew ${amt}¢.`;
    },
    sleep: () => {
      if (st.credits < 12) return "The flophouse wants 12¢.";
      st.credits -= 12;
      player.hp = st.maxHp;
      st.hp = st.maxHp;
      st.rest = 100;
      status();
      persist();
      return "A bad mattress. Rest full.";
    },
    heal: () => {
      if (st.credits < 28) return "Clinic wants 28¢.";
      st.credits -= 28;
      player.hp = st.maxHp;
      st.hp = st.maxHp;
      status();
      persist();
      return "Patched. Stay out of the rain.";
    },
    eat: (id) => {
      const cost = priceOf(planet(), id);
      if (st.credits < cost) return "Not enough scrip.";
      st.credits -= cost;
      if (id === "nutrapack" || id === "grain") st.nourish = Math.min(100, st.nourish + 35);
      if (id === "stim") {
        st.rest = Math.min(100, st.rest + 18);
        player.hp = Math.min(st.maxHp, player.hp + 1);
      }
      status();
      persist();
      return id === "stim" ? "Hands stop shaking." : "Nourish up.";
    },
    deliver: () => {
      if (st.city !== CONTRACT.city) return `Colony is ${CONTRACT.colony}. Drive or warp to Vesper.`;
      let n = 0;
      for (const k of Object.keys(CONTRACT.need) as Array<keyof typeof CONTRACT.need>) {
        const have = st.cargo[k] ?? 0;
        const need = CONTRACT.need[k] - (st.delivered[k] ?? 0);
        const give = Math.min(have, Math.max(0, need));
        if (give) {
          addCargo(k, -give);
          st.delivered[k] = (st.delivered[k] ?? 0) + give;
          n += give;
        }
      }
      if (!st.mail.includes("banville")) st.mail.push("banville");
      status();
      persist();
      return n ? `Offloaded ${n} for Banville.` : "Nothing the colony still needs.";
    },
    store: (id) => {
      if (!st.cargo[id]) return "Not carrying that.";
      addCargo(id, -1);
      const bag = (st.stores[st.city] ??= {});
      bag[id] = (bag[id] ?? 0) + 1;
      persist();
      return `Stashed ${id} in ${city().name}.`;
    },
    retrieve: (id) => {
      const bag = st.stores[st.city] ?? {};
      if (!bag[id]) return "Nothing in this shed.";
      if (!addCargo(id, 1)) return "Hold is full.";
      bag[id] -= 1;
      if (bag[id] <= 0) delete bag[id];
      persist();
      return `Pulled ${id}.`;
    },
    takeCryo: () => {
      const c = city();
      if (!c.cryo) return "No sleeper logged here.";
      if (st.cryoTaken[c.id]) return "Already took that pod.";
      if (!addCargo("cryopod", 1)) return "Hold is full.";
      st.cryoTaken[c.id] = true;
      if (c.id === "dockwell" && !st.mail.includes("frostshed")) st.mail.push("frostshed");
      status();
      persist();
      return "Cryopod humming in the hold.";
    },
    warp: (systemId) => {
      const sys = SYSTEMS.find((s) => s.id === systemId);
      if (!sys) return "Dead chart.";
      if (!sys.planet) return "Ghost system. No air, no dock.";
      if (st.systems.warp < 25) return "Warp is cold. Fit a shunt.";
      if (st.mode !== "space" && st.mode !== "ship") return "Launch first.";
      st.planet = sys.planet;
      const star = citiesOn(sys.planet).find((c) => c.starport);
      if (star) st.city = star.id as CityId;
      st.fuel = Math.max(0, st.fuel - 8);
      st.systems.warp = Math.max(0, st.systems.warp - 6);
      if (sys.planet === "vesper" && !st.mail.includes("banville")) st.mail.push("banville");
      if (sys.planet === "slag" && !st.mail.includes("heap")) st.mail.push("heap");
      launch();
      opts.onMap(false);
      status();
      persist();
      return `Fell into ${sys.name}. E to land.`;
    },
  };

  void fighter;
  void shopId;
  return api;
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      setSteer: (v: number) => void;
      setKeys: (codes: string[]) => void;
    };
  }
}
