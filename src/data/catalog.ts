export type AssetKind =
  | "Cast"
  | "Streets"
  | "Ships"
  | "Interiors"
  | "Items"
  | "Mine"
  | "FX";

export type AssetEntry = {
  id: string;
  name: string;
  kind: AssetKind;
  src: string;
  sheet?: { cols: number; rows: number; fps: number };
};

export const PORTRAITS = [
  { id: "courier", name: "Rook", blurb: "Even hands. Walks light.", vigour: 6, brawl: 2, guns: 3, luck: 3, pilot: 3 },
  { id: "bruiser", name: "Hale", blurb: "Takes a hit. Gives two.", vigour: 8, brawl: 4, guns: 1, luck: 2, pilot: 2 },
  { id: "fixer", name: "Nyx", blurb: "Reads a room. Flies dirty.", vigour: 5, brawl: 1, guns: 3, luck: 4, pilot: 4 },
] as const;

export const PLANETS = [
  {
    id: "kessler",
    name: "Kessler Prime",
    blurb: "Rain capital. Parts cheap, ore dear.",
    far: "/assets/nh/parallax/kessler-far.jpg",
    sky: "/assets/nh/parallax/kessler-sky.jpg",
    near: "/assets/nh/parallax/kessler-near.jpg",
    prices: {
      stim: 12, nutrapack: 9, chip: 22, coolant: 14, copper: 18, crystal: 28, shunt: 36,
      pistol: 28, baton: 14, plastics: 11, droids: 42, solar: 19, grain: 8,
    },
  },
  {
    id: "slag",
    name: "Slagreach",
    blurb: "Refinery world. Ore cheap, food dear.",
    far: "/assets/nh/parallax/slag-far.jpg",
    sky: "/assets/nh/parallax/kessler-sky.jpg",
    near: "/assets/nh/parallax/kessler-near.jpg",
    prices: {
      stim: 16, nutrapack: 15, chip: 20, coolant: 11, copper: 8, crystal: 16, shunt: 42,
      pistol: 32, baton: 16, plastics: 9, droids: 38, solar: 14, grain: 18,
    },
  },
  {
    id: "vesper",
    name: "Vesper-9",
    blurb: "Ice hold. Cryogens sleep in the sheds. Colony waits.",
    far: "/assets/nh/parallax/vesper-far.jpg",
    sky: "/assets/nh/parallax/kessler-sky.jpg",
    near: "/assets/nh/parallax/kessler-near.jpg",
    prices: {
      stim: 14, nutrapack: 11, chip: 18, coolant: 20, copper: 14, crystal: 22, shunt: 40,
      pistol: 30, baton: 15, plastics: 16, droids: 48, solar: 24, grain: 10,
    },
  },
] as const;

export const BUILDINGS = [
  { id: "parts", name: "Parts bay", kind: "parts" as const, src: "/assets/nh/buildings/parts.png" },
  { id: "bar", name: "Low Orbit", kind: "bar" as const, src: "/assets/nh/buildings/bar.png" },
  { id: "bank", name: "Uniteller", kind: "bank" as const, src: "/assets/nh/buildings/bank.png" },
  { id: "exchange", name: "Exchange", kind: "exchange" as const, src: "/assets/nh/buildings/exchange.png" },
  { id: "warehouse", name: "Bonded shed", kind: "warehouse" as const, src: "/assets/nh/buildings/warehouse.png" },
  { id: "hotel", name: "Flophouse", kind: "hotel" as const, src: "/assets/nh/buildings/hotel.png" },
  { id: "guns", name: "Holdout", kind: "guns" as const, src: "/assets/nh/buildings/guns.png" },
  { id: "hospital", name: "Clinic", kind: "hospital" as const, src: "/assets/nh/buildings/hospital.png" },
] as const;

export type BuildingId = (typeof BUILDINGS)[number]["id"];

export const CITIES = [
  {
    id: "rainspire",
    name: "Rainspire",
    planet: "kessler" as const,
    starport: true,
    cryo: false,
    colony: false,
    buildings: ["parts", "bar", "bank", "exchange", "warehouse", "hotel", "guns", "hospital"] as BuildingId[],
  },
  {
    id: "dockwell",
    name: "Dockwell",
    planet: "kessler" as const,
    starport: false,
    cryo: true,
    colony: false,
    buildings: ["bar", "exchange", "warehouse", "hotel", "guns"] as BuildingId[],
  },
  {
    id: "lowwatt",
    name: "Lowwatt",
    planet: "kessler" as const,
    starport: false,
    cryo: false,
    colony: false,
    buildings: ["bar", "parts", "hotel", "hospital"] as BuildingId[],
  },
  {
    id: "cinderport",
    name: "Cinderport",
    planet: "slag" as const,
    starport: true,
    cryo: false,
    colony: false,
    buildings: ["parts", "bar", "bank", "exchange", "warehouse", "hotel", "guns", "hospital"] as BuildingId[],
  },
  {
    id: "heap",
    name: "Heap",
    planet: "slag" as const,
    starport: false,
    cryo: true,
    colony: false,
    buildings: ["bar", "exchange", "warehouse", "guns"] as BuildingId[],
  },
  {
    id: "banville",
    name: "Banville Hold",
    planet: "vesper" as const,
    starport: true,
    cryo: false,
    colony: true,
    buildings: ["exchange", "warehouse", "bar", "hotel", "hospital", "parts"] as BuildingId[],
  },
  {
    id: "frostshed",
    name: "Frostshed",
    planet: "vesper" as const,
    starport: false,
    cryo: true,
    colony: false,
    buildings: ["bar", "warehouse", "hotel", "parts"] as BuildingId[],
  },
] as const;

export type CityId = (typeof CITIES)[number]["id"];

export const GOODS = [
  { id: "nutrapack", name: "Nutrapack", desc: "Stops the shakes. Eaten at a bar." },
  { id: "stim", name: "Stim vial", desc: "A short second wind." },
  { id: "chip", name: "Chip wafer", desc: "Colony wants these." },
  { id: "coolant", name: "Coolant", desc: "Keeps warp from cooking." },
  { id: "copper", name: "Copper ore", desc: "Dug, not bought." },
  { id: "crystal", name: "Neon crystal", desc: "Teal ore from the undercity." },
  { id: "shunt", name: "Shunt", desc: "Jury-rig a dead system." },
  { id: "pistol", name: "Holdout pistol", desc: "Street argument." },
  { id: "baton", name: "Baton", desc: "Close work." },
  { id: "plastics", name: "Bulk plastics", desc: "Prefab sheets. Always moving." },
  { id: "droids", name: "Labor droids", desc: "Colony muscle in a crate." },
  { id: "solar", name: "Solar cells", desc: "Cheap power for new towns." },
  { id: "grain", name: "Grain crate", desc: "Staple. Heavy. Pays." },
  { id: "cryopod", name: "Cryopod", desc: "A sleeper. Not for sale." },
  { id: "credits", name: "Credit chit", desc: "Dock scrip." },
] as const;

export const SYSTEMS = [
  { id: "kessler", name: "Kessler", planet: "kessler" as const, x: 18, y: 42 },
  { id: "slag", name: "Slagreach", planet: "slag" as const, x: 48, y: 28 },
  { id: "vesper", name: "Vesper", planet: "vesper" as const, x: 72, y: 58 },
  { id: "woremed", name: "Woremed", planet: null, x: 38, y: 70 },
  { id: "jondd", name: "Jondd Ghost", planet: null, x: 82, y: 22 },
] as const;

export const MODULES = [
  { id: "engine", name: "Ion drive", cost: 80 },
  { id: "shields", name: "Screen lattice", cost: 90 },
  { id: "lasers", name: "Pulse banks", cost: 70 },
  { id: "hold", name: "Deep hold", cost: 60 },
  { id: "warp", name: "Warp shunt", cost: 120 },
] as const;

export const CONTRACT = {
  colony: "Banville Hold",
  city: "banville" as CityId,
  need: { chip: 6, nutrapack: 8, coolant: 4, grain: 4, cryopod: 3 },
} as const;

export const MAIL = [
  {
    id: "will",
    from: "Spinner, Crest & Tatutha",
    title: "The wreck is yours",
    body: "Your uncle died in warp. The Nighthaul is liened to you. Banville Hold on Vesper-9 is owed chips, nutrapacks, coolant, grain, and three cryogens. Wake the colony or lose the ship.",
  },
  {
    id: "dockwell",
    from: "CompTech Bob",
    title: "Sleeper on Kessler",
    body: "Corrupted dump says a cryopod is sitting in Dockwell's bonded shed. Rainspire is the starport. Drive the pod east along the highway.",
  },
  {
    id: "heap",
    from: "CompTech Bob",
    title: "Sleeper on Slagreach",
    body: "Second cryo ping: Heap, the slag town past Cinderport. Warehouse, back cage. Watch the muggers.",
  },
  {
    id: "frostshed",
    from: "CompTech Bob",
    title: "Sleeper on Vesper",
    body: "Last known sleeper is in Frostshed's shed, ice side of Banville. Deliver all three to the colony exchange.",
  },
  {
    id: "banville",
    from: "Ranor Hutton",
    title: "The frozen contract",
    body: "Banville Hold is awake enough to receive. Bring chips, food, coolant, grain, and the sleepers. We will sign the ship to you when the list is paid.",
  },
] as const;

export const ASSETS: AssetEntry[] = [
  { id: "walk", name: "Courier walk", kind: "Cast", src: "/assets/nh/heroes/walk.png", sheet: { cols: 4, rows: 4, fps: 8 } },
  { id: "pistol-anim", name: "Courier pistol", kind: "Cast", src: "/assets/nh/heroes/pistol.png", sheet: { cols: 2, rows: 2, fps: 10 } },
  { id: "melee", name: "Courier melee", kind: "Cast", src: "/assets/nh/heroes/melee.png", sheet: { cols: 2, rows: 2, fps: 10 } },
  { id: "mine-anim", name: "Courier mine", kind: "Cast", src: "/assets/nh/heroes/mine.png", sheet: { cols: 2, rows: 2, fps: 8 } },
  { id: "mugger", name: "Street mugger", kind: "Cast", src: "/assets/nh/npcs/mugger.png", sheet: { cols: 2, rows: 2, fps: 6 } },
  { id: "merchant", name: "Dock merchant", kind: "Cast", src: "/assets/nh/npcs/merchant.png", sheet: { cols: 2, rows: 2, fps: 5 } },
  { id: "bartender", name: "Barkeep", kind: "Cast", src: "/assets/nh/npcs/bartender.png", sheet: { cols: 2, rows: 2, fps: 5 } },
  { id: "mechanic", name: "Yard mechanic", kind: "Cast", src: "/assets/nh/npcs/mechanic.png", sheet: { cols: 2, rows: 2, fps: 5 } },
  ...PORTRAITS.map((p) => ({
    id: `portrait-${p.id}`,
    name: `${p.name} bust`,
    kind: "Cast" as const,
    src: `/assets/nh/heroes/portrait-${p.id}.png`,
  })),
  { id: "kessler-sky", name: "Kessler sky", kind: "Streets", src: "/assets/nh/parallax/kessler-sky.jpg" },
  { id: "kessler-far", name: "Kessler far", kind: "Streets", src: "/assets/nh/parallax/kessler-far.jpg" },
  { id: "kessler-near", name: "Kessler rain", kind: "Streets", src: "/assets/nh/parallax/kessler-near.jpg" },
  { id: "slag-far", name: "Slagreach far", kind: "Streets", src: "/assets/nh/parallax/slag-far.jpg" },
  { id: "vesper-far", name: "Vesper far", kind: "Streets", src: "/assets/nh/parallax/vesper-far.jpg" },
  { id: "street", name: "Wet asphalt", kind: "Streets", src: "/assets/nh/tiles/street.png" },
  { id: "highway", name: "Planet highway", kind: "Streets", src: "/assets/nh/tiles/highway.png" },
  ...BUILDINGS.map((b) => ({ id: b.id, name: b.name, kind: "Streets" as const, src: b.src })),
  { id: "nighthaul", name: "Nighthaul", kind: "Ships", src: "/assets/nh/ships/nighthaul.png" },
  { id: "pod", name: "Cargo pod", kind: "Ships", src: "/assets/nh/ships/pod.png" },
  { id: "fighter", name: "Courier fighter", kind: "Ships", src: "/assets/nh/ships/fighter.png" },
  { id: "pirate", name: "Pirate interceptor", kind: "Ships", src: "/assets/nh/ships/pirate.png" },
  { id: "space", name: "Warp lane", kind: "Ships", src: "/assets/nh/parallax/space.jpg" },
  { id: "ship-hold", name: "Ship hold", kind: "Interiors", src: "/assets/nh/interiors/ship.jpg" },
  ...BUILDINGS.map((b) => ({
    id: `in-${b.id}`,
    name: `${b.name} inside`,
    kind: "Interiors" as const,
    src: `/assets/nh/interiors/${b.id}.jpg`,
  })),
  ...GOODS.map((g) => ({
    id: g.id,
    name: g.name,
    kind: "Items" as const,
    src: `/assets/nh/items/${g.id}/prop.png`,
  })),
  { id: "dirt", name: "Fill dirt", kind: "Mine", src: "/assets/nh/mine/dirt.png" },
  { id: "stone", name: "Undercity stone", kind: "Mine", src: "/assets/nh/mine/stone.png" },
  { id: "copper-tile", name: "Copper vein", kind: "Mine", src: "/assets/nh/mine/copper.png" },
  { id: "crystal-tile", name: "Crystal vein", kind: "Mine", src: "/assets/nh/mine/crystal.png" },
  { id: "mine-far", name: "Undercity dark", kind: "Mine", src: "/assets/nh/parallax/mine-far.jpg" },
  { id: "deck", name: "Ship deck", kind: "Mine", src: "/assets/nh/tiles/deck.png" },
  { id: "muzzle", name: "Muzzle flash", kind: "FX", src: "/assets/nh/fx/muzzle.png", sheet: { cols: 2, rows: 2, fps: 12 } },
  { id: "slash", name: "Baton slash", kind: "FX", src: "/assets/nh/fx/slash.png" },
  { id: "laser", name: "Pulse laser", kind: "FX", src: "/assets/nh/fx/laser.png" },
  { id: "explode", name: "Burst", kind: "FX", src: "/assets/nh/fx/explode.png" },
];

export const KIT_COUNTS = {
  cast: ASSETS.filter((a) => a.kind === "Cast").length,
  streets: ASSETS.filter((a) => a.kind === "Streets").length,
  ships: ASSETS.filter((a) => a.kind === "Ships").length,
  interiors: ASSETS.filter((a) => a.kind === "Interiors").length,
  items: ASSETS.filter((a) => a.kind === "Items").length,
  mine: ASSETS.filter((a) => a.kind === "Mine").length,
  fx: ASSETS.filter((a) => a.kind === "FX").length,
} as const;
