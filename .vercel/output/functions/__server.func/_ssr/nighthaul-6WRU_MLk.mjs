import { c as PORTRAITS, i as GOODS, l as SYSTEMS, n as BUILDINGS, o as MODULES, r as CONTRACT, s as PLANETS } from "./catalog-DRqLEzIL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/nighthaul-6WRU_MLk.js
var loadImage = (src) => new Promise((resolve) => {
	const img = new Image();
	img.crossOrigin = "anonymous";
	img.onload = () => resolve(img);
	img.onerror = () => resolve(null);
	img.src = src;
});
var clamp = (n, a, b) => Math.max(a, Math.min(b, n));
var wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
var CITY_W = 3400;
var GROUND = 560;
var MINE_T = 36;
var MINE_C = 56;
var MINE_R = 32;
var LAYOUT = [
	{
		id: "parts",
		x: 560
	},
	{
		id: "bar",
		x: 920
	},
	{
		id: "bank",
		x: 1260
	},
	{
		id: "exchange",
		x: 1620
	},
	{
		id: "warehouse",
		x: 1980
	},
	{
		id: "hotel",
		x: 2320
	},
	{
		id: "guns",
		x: 2660
	}
];
function cargoCount(c) {
	return Object.values(c).reduce((a, b) => a + b, 0);
}
function priceOf(planet, id) {
	return planet.prices[id] ?? 20;
}
async function mountNighthaul(canvas, opts) {
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("No canvas context");
	const portrait = PORTRAITS.find((p) => p.id === opts.config.portrait) ?? PORTRAITS[0];
	const maxHp = 8 + portrait.vigour;
	const st = {
		mode: "city",
		planet: "kessler",
		name: opts.config.name,
		portrait: portrait.id,
		credits: 420,
		bank: 0,
		hp: maxHp,
		maxHp,
		cargo: {},
		warehouse: {},
		systems: {
			engine: 55,
			shields: 40,
			lasers: 70,
			hold: 80,
			warp: 18
		},
		modules: ["engine", "lasers"],
		delivered: {
			chip: 0,
			nutrapack: 0,
			coolant: 0,
			cryopod: 0
		},
		hasPistol: portrait.guns >= 3,
		hasBaton: true,
		fuel: 40,
		heading: -Math.PI / 2,
		speed: 0
	};
	const holdCap = () => 8 + (st.modules.includes("hold") ? 8 : 0);
	const player = {
		x: 420,
		y: 608,
		hp: st.hp,
		facing: 2,
		frame: 0,
		hurt: 0
	};
	const muggers = [
		{
			x: 780,
			y: 608,
			hp: 4,
			facing: 1,
			frame: 0,
			hurt: 0,
			vx: -40
		},
		{
			x: 1480,
			y: 612,
			hp: 5,
			facing: 2,
			frame: 0,
			hurt: 0,
			vx: 50
		},
		{
			x: 2400,
			y: 606,
			hp: 4,
			facing: 1,
			frame: 0,
			hurt: 0,
			vx: -30
		}
	];
	let pirates = [];
	let shots = [];
	let fx = [];
	let atkCd = 0;
	let interactLock = 0;
	let animT = 0;
	let cam = {
		x: 0,
		y: 0
	};
	let mine = null;
	let minePx = 4;
	let minePy = 4;
	let mineVy = 0;
	let onGround = false;
	const cryoTaken = {};
	let testSteer = null;
	const keys = /* @__PURE__ */ new Set();
	const just = /* @__PURE__ */ new Set();
	const GAME_KEYS = /* @__PURE__ */ new Set([
		"ArrowUp",
		"ArrowDown",
		"ArrowLeft",
		"ArrowRight",
		"Space",
		"KeyW",
		"KeyA",
		"KeyS",
		"KeyD",
		"KeyE",
		"KeyM",
		"KeyF"
	]);
	const onKey = (e, down) => {
		if (GAME_KEYS.has(e.code)) e.preventDefault();
		if (down) {
			if (!keys.has(e.code)) just.add(e.code);
			keys.add(e.code);
		} else keys.delete(e.code);
	};
	const kd = (e) => onKey(e, true);
	const ku = (e) => onKey(e, false);
	const blur = () => keys.clear();
	window.addEventListener("keydown", kd);
	window.addEventListener("keyup", ku);
	window.addEventListener("blur", blur);
	document.addEventListener("visibilitychange", blur);
	let pointer = {
		x: 0,
		y: 0,
		down: false
	};
	let stick = {
		active: false,
		ox: 0,
		oy: 0,
		mx: 0,
		my: 0
	};
	const toLocal = (e) => {
		const r = canvas.getBoundingClientRect();
		return {
			x: (e.clientX - r.left) / r.width * canvas.clientWidth,
			y: (e.clientY - r.top) / r.height * canvas.clientHeight
		};
	};
	const pd = (e) => {
		const p = toLocal(e);
		pointer = {
			x: p.x,
			y: p.y,
			down: true
		};
		if (p.x < canvas.clientWidth * .42 && p.y > canvas.clientHeight * .45) stick = {
			active: true,
			ox: p.x,
			oy: p.y,
			mx: 0,
			my: 0
		};
	};
	const pu = () => {
		pointer.down = false;
		stick.active = false;
		stick.mx = 0;
		stick.my = 0;
	};
	const pm = (e) => {
		const p = toLocal(e);
		pointer.x = p.x;
		pointer.y = p.y;
		if (stick.active) {
			const dx = p.x - stick.ox;
			const dy = p.y - stick.oy;
			const len = Math.hypot(dx, dy) || 1;
			const mag = Math.min(1, len / 46);
			stick.mx = dx / len * mag;
			stick.my = dy / len * mag;
		}
	};
	canvas.addEventListener("pointerdown", pd);
	canvas.addEventListener("pointerup", pu);
	canvas.addEventListener("pointercancel", pu);
	canvas.addEventListener("pointermove", pm);
	const img = (src) => loadImage(src);
	const [walk, pistol, melee, mineAnim, muggerImg, merchantImg, bartenderImg, mechanicImg, street, deck, sky, near, spaceBg, shipIn, barIn, haul, pirateImg, fighter, pod, muzzle, slash, laser, explode, dirt, stone, copper, crystal, mineFar] = await Promise.all([
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
		img("/assets/nh/interiors/bar.jpg"),
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
		img("/assets/nh/parallax/mine-far.jpg")
	]);
	const farImgs = {};
	const bldImgs = {};
	await Promise.all([...PLANETS.map(async (p) => {
		farImgs[p.id] = await img(p.far);
	}), ...BUILDINGS.map(async (b) => {
		bldImgs[b.id] = await img(b.src);
	})]);
	const planet = () => PLANETS.find((p) => p.id === st.planet) ?? PLANETS[0];
	const status = () => {
		const p = planet();
		const need = CONTRACT.need;
		const left = need.chip - st.delivered.chip + (need.nutrapack - st.delivered.nutrapack) + (need.coolant - st.delivered.coolant) + (need.cryopod - st.delivered.cryopod);
		const loc = st.mode === "city" ? p.name : st.mode === "ship" ? "Nighthaul hold" : st.mode === "space" ? "Warp lane" : "Undercity";
		opts.onStatus(`${st.name} · ${loc} · ${st.hp}/${st.maxHp} · ${st.credits}¢ · contract ${Math.max(0, left)} left`);
	};
	const addCargo = (id, n) => {
		if (n > 0 && cargoCount(st.cargo) + n > holdCap()) return false;
		st.cargo[id] = (st.cargo[id] ?? 0) + n;
		if (st.cargo[id] <= 0) delete st.cargo[id];
		return true;
	};
	const carveMine = () => {
		mine = /* @__PURE__ */ new Uint8Array(1792);
		for (let y = 0; y < MINE_R; y++) for (let x = 0; x < MINE_C; x++) {
			let t = 0;
			if (y > 6) t = 1;
			if (y > 10) t = Math.random() < .55 ? 2 : 1;
			if (y > 8 && Math.random() < .08) t = 3;
			if (y > 12 && Math.random() < .05) t = 4;
			if (y <= 6 && (x < 2 || x > 53)) t = 2;
			mine[y * MINE_C + x] = t;
		}
		for (let x = 0; x < 6; x++) mine[336 + x] = 0;
		minePx = 3;
		minePy = 5;
		mineVy = 0;
	};
	const enterShip = () => {
		st.mode = "ship";
		player.x = 420;
		player.y = 430;
		opts.onShop(null);
		status();
	};
	const enterCity = (atShip) => {
		st.mode = "city";
		player.x = atShip ? 280 : player.x;
		player.y = 600;
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
		pirates = [{
			x: 1100,
			y: 280,
			heading: Math.PI,
			hp: 6,
			hurt: 0,
			cd: .6
		}, {
			x: 1600,
			y: 620,
			heading: .4,
			hp: 6,
			hurt: 0,
			cd: 1.1
		}];
		shots = [];
		opts.onShop(null);
		status();
	};
	const land = () => {
		st.mode = "city";
		player.x = 280;
		player.y = 600;
		pirates = [];
		shots = [];
		opts.onMap(false);
		status();
	};
	const interact = () => {
		if (interactLock > 0) return;
		interactLock = .25;
		if (st.mode === "city") {
			if (Math.abs(player.x - 220) < 90) {
				enterShip();
				return;
			}
			if (player.x > 3120) {
				st.mode = "mine";
				carveMine();
				status();
				return;
			}
			const nearB = LAYOUT.find((b) => Math.abs(player.x - b.x) < 90);
			if (nearB) {
				nearB.id;
				opts.onShop(nearB.id);
				return;
			}
		} else if (st.mode === "ship") {
			if (player.x < 260) {
				enterCity(true);
				return;
			}
			if (player.x > 620) {
				launch();
				return;
			}
			opts.onMap(true);
		} else if (st.mode === "space") opts.onMap(true);
		else if (st.mode === "mine") {
			if (minePx < 5 && minePy < 8) {
				st.mode = "city";
				player.x = 3140;
				player.y = 600;
				mine = null;
				status();
			}
		}
	};
	const fireFoot = () => {
		if (atkCd > 0) return;
		const dir = facingVec(player.facing);
		if (st.hasPistol) {
			atkCd = .28;
			shots.push({
				x: player.x + dir.x * 28,
				y: player.y - 18 + dir.y * 10,
				vx: dir.x * 520,
				vy: dir.y * 520,
				life: .7,
				from: "player"
			});
			fx.push({
				x: player.x + dir.x * 22,
				y: player.y - 22,
				life: .12,
				kind: "muzzle"
			});
		} else {
			atkCd = .38;
			fx.push({
				x: player.x + dir.x * 24,
				y: player.y - 10,
				life: .16,
				kind: "slash"
			});
			for (const m of muggers) {
				if (m.hp <= 0) continue;
				if (Math.hypot(m.x - player.x, m.y - player.y) < 58) {
					m.hp -= 2 + portrait.brawl * .4;
					m.hurt = .2;
				}
			}
		}
	};
	const fireSpace = () => {
		if (atkCd > 0 || st.systems.lasers < 10) return;
		atkCd = st.modules.includes("lasers") ? .18 : .32;
		const fxv = -Math.sin(st.heading);
		const fy = -Math.cos(st.heading);
		shots.push({
			x: player.x + fxv * 36,
			y: player.y + fy * 36,
			vx: fxv * 680,
			vy: fy * 680,
			life: 1.1,
			from: "player"
		});
		fx.push({
			x: player.x + fxv * 30,
			y: player.y + fy * 30,
			life: .1,
			kind: "muzzle"
		});
	};
	function facingVec(f) {
		if (f === 0) return {
			x: 0,
			y: 1
		};
		if (f === 1) return {
			x: -1,
			y: 0
		};
		if (f === 2) return {
			x: 1,
			y: 0
		};
		return {
			x: 0,
			y: -1
		};
	}
	const drawSheet = (image, cols, rows, col, row, x, y, h, flip = false) => {
		if (!image) return;
		const cw = image.width / cols;
		const ch = image.height / rows;
		const w = cw / ch * h;
		ctx.save();
		ctx.translate(x, y);
		if (flip) ctx.scale(-1, 1);
		ctx.drawImage(image, col * cw, row * ch, cw, ch, -w / 2, -h, w, h);
		ctx.restore();
	};
	const tileFill = (image, x, y, w, h, s) => {
		if (!image) {
			ctx.fillStyle = "#1a222c";
			ctx.fillRect(x, y, w, h);
			return;
		}
		const ox = (x % s + s) % s;
		const oy = (y % s + s) % s;
		for (let yy = y - oy; yy < y + h; yy += s) for (let xx = x - ox; xx < x + w; xx += s) ctx.drawImage(image, xx, yy, s, s);
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
	const tick = (now) => {
		raf = requestAnimationFrame(tick);
		const dt = Math.min(.05, (now - last) / 1e3);
		last = now;
		st.hp = player.hp;
		atkCd = Math.max(0, atkCd - dt);
		interactLock = Math.max(0, interactLock - dt);
		animT += dt;
		player.hurt = Math.max(0, player.hurt - dt);
		if (just.has("KeyE")) interact();
		if (just.has("KeyM")) opts.onMap(true);
		just.clear();
		const mx = (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0) - (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0) + stick.mx;
		const my = (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0) - (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0) + stick.my;
		const attack = keys.has("Space") || pointer.down && !stick.active;
		if (st.mode === "city") {
			const spd = 165 + portrait.luck * 4;
			player.x = clamp(player.x + mx * spd * dt, 80, 3320);
			player.y = clamp(player.y + my * spd * dt, 568, 670);
			if (Math.abs(mx) > .1 || Math.abs(my) > .1) {
				player.facing = Math.abs(mx) > Math.abs(my) ? mx < 0 ? 1 : 2 : my > 0 ? 0 : 3;
				player.frame += dt * 8;
			}
			if (attack) fireFoot();
			for (const m of muggers) {
				if (m.hp <= 0) continue;
				m.hurt = Math.max(0, m.hurt - dt);
				m.x += m.vx * dt;
				if (m.x < 500 || m.x > 3e3) m.vx *= -1;
				m.facing = m.vx < 0 ? 1 : 2;
				m.frame += dt * 6;
				if (Math.hypot(m.x - player.x, m.y - player.y) < 42 && m.hurt <= 0) {
					player.hp -= 1;
					player.hurt = .35;
					m.hurt = .6;
				}
			}
			for (const s of shots) {
				s.x += s.vx * dt;
				s.y += s.vy * dt;
				s.life -= dt;
				for (const m of muggers) {
					if (m.hp <= 0) continue;
					if (Math.hypot(m.x - s.x, m.y - 20 - s.y) < 28) {
						m.hp -= 2 + portrait.guns * .5;
						m.hurt = .2;
						s.life = 0;
						if (m.hp <= 0) {
							st.credits += 18 + Math.floor(Math.random() * 12);
							fx.push({
								x: m.x,
								y: m.y - 20,
								life: .35,
								kind: "explode"
							});
						}
					}
				}
			}
			cam.x = clamp(player.x - canvas.clientWidth * .38, 0, CITY_W - canvas.clientWidth);
			cam.y = 0;
		} else if (st.mode === "ship") {
			const spd = 150;
			player.x = clamp(player.x + mx * spd * dt, 140, 780);
			player.y = clamp(player.y + my * spd * dt, 360, 500);
			if (Math.abs(mx) > .1) player.facing = mx < 0 ? 1 : 2;
			player.frame += dt * 7;
			cam.x = 0;
			cam.y = 0;
		} else if (st.mode === "space") {
			let steer = 0;
			if (testSteer !== null) steer = testSteer;
			else {
				if (keys.has("KeyA") || keys.has("ArrowLeft") || stick.mx < -.2) steer += 1;
				if (keys.has("KeyD") || keys.has("ArrowRight") || stick.mx > .2) steer -= 1;
			}
			const thrust = keys.has("KeyW") || keys.has("ArrowUp") || stick.my < -.25 ? 1 : 0;
			const brake = keys.has("KeyS") || keys.has("ArrowDown") || stick.my > .35 ? 1 : 0;
			const turn = (st.modules.includes("engine") ? 2.4 : 1.7) * (.35 + Math.min(1, Math.abs(st.speed) / 220));
			st.heading = wrap(st.heading + steer * turn * dt);
			const fxx = -Math.sin(st.heading);
			const fyy = -Math.cos(st.heading);
			if (thrust) st.speed = clamp(st.speed + (220 + portrait.pilot * 12) * dt, -80, 340);
			if (brake) st.speed = clamp(st.speed - 280 * dt, -40, 340);
			st.speed *= Math.pow(.32, dt);
			player.x += fxx * st.speed * dt;
			player.y += fyy * st.speed * dt;
			if (attack) fireSpace();
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
					p.cd = .9;
					shots.push({
						x: p.x + pfx * 24,
						y: p.y + pfy * 24,
						vx: pfx * 420,
						vy: pfy * 420,
						life: 1,
						from: "foe"
					});
				}
			}
			for (const s of shots) {
				s.x += s.vx * dt;
				s.y += s.vy * dt;
				s.life -= dt;
				if (s.from === "player") for (const p of pirates) {
					if (p.hp <= 0) continue;
					if (Math.hypot(p.x - s.x, p.y - s.y) < 34) {
						p.hp -= 2;
						p.hurt = .15;
						s.life = 0;
						if (p.hp <= 0) {
							st.credits += 40;
							fx.push({
								x: p.x,
								y: p.y,
								life: .4,
								kind: "explode"
							});
						}
					}
				}
				else if (Math.hypot(s.x - player.x, s.y - player.y) < 28) {
					const soak = st.modules.includes("shields") && st.systems.shields > 20 ? .45 : 1;
					player.hp -= soak;
					st.systems.shields = Math.max(0, st.systems.shields - 6);
					s.life = 0;
					player.hurt = .2;
				}
			}
			const follow = 90;
			cam.x = player.x - fxx * follow - canvas.clientWidth / 2;
			cam.y = player.y - fyy * follow - canvas.clientHeight / 2;
		} else if (st.mode === "mine" && mine) {
			const ax = mx;
			minePx += ax * 5.2 * dt;
			mineVy += 18 * dt;
			if ((keys.has("KeyW") || keys.has("Space") || stick.my < -.5) && onGround) mineVy = -7.2;
			minePy += mineVy * dt;
			const solid = (cx, cy) => {
				const ix = Math.floor(cx);
				const iy = Math.floor(cy);
				if (iy < 0) return false;
				if (ix < 0 || ix >= MINE_C || iy >= MINE_R) return true;
				return mine[iy * MINE_C + ix] > 0;
			};
			onGround = solid(minePx, minePy + .55);
			if (onGround && mineVy > 0) {
				minePy = Math.floor(minePy + .55) - .55;
				mineVy = 0;
			}
			if (solid(minePx, minePy - .4) && mineVy < 0) {
				mineVy = 0;
				minePy += .1;
			}
			if (solid(minePx + .3, minePy)) minePx -= 4 * dt;
			if (solid(minePx - .3, minePy)) minePx += 4 * dt;
			minePx = clamp(minePx, .4, 55.6);
			player.facing = ax < -.1 ? 1 : ax > .1 ? 2 : player.facing;
			player.frame += dt * 8;
			if ((attack || keys.has("KeyS")) && atkCd <= 0) {
				atkCd = .16;
				const dirx = player.facing === 1 ? -1 : player.facing === 2 ? 1 : 0;
				const diry = keys.has("KeyS") || stick.my > .3 ? 1 : player.facing === 0 ? 1 : player.facing === 3 ? -1 : 1;
				const tx = Math.floor(minePx + dirx * .8);
				const ty = Math.floor(minePy + diry * .9);
				if (tx >= 0 && ty >= 0 && tx < MINE_C && ty < MINE_R) {
					const t = mine[ty * MINE_C + tx];
					if (t > 0) {
						mine[ty * MINE_C + tx] = 0;
						if (t === 3) addCargo("copper", 1);
						if (t === 4) addCargo("crystal", 1);
						fx.push({
							x: (tx + .5) * MINE_T,
							y: (ty + .5) * MINE_T,
							life: .2,
							kind: "slash"
						});
					}
				}
			}
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
		if (!won && st.delivered.chip >= need.chip && st.delivered.nutrapack >= need.nutrapack && st.delivered.coolant >= need.coolant && st.delivered.cryopod >= need.cryopod) {
			won = true;
			opts.onStatus("Banville Hold is awake. The frozen contract is paid.");
		}
		draw(mx, attack);
		if (new URLSearchParams(location.search).has("qa")) window.__controlsTest = {
			getYaw: () => st.heading,
			getSpeed: () => st.speed,
			setSteer: (v) => {
				testSteer = v;
			},
			setKeys: (codes) => {
				keys.clear();
				for (const c of codes) keys.add(c);
			}
		};
	};
	const drawParallax = (w, h) => {
		const far = farImgs[st.planet] ?? sky;
		if (sky) ctx.drawImage(sky, 0, 0, w, h * .62);
		else {
			ctx.fillStyle = "#07080c";
			ctx.fillRect(0, 0, w, h);
		}
		if (far) {
			const px = -(cam.x * .25 % far.width);
			ctx.globalAlpha = .92;
			ctx.drawImage(far, px, h * .08, far.width, h * .7);
			ctx.drawImage(far, px + far.width, h * .08, far.width, h * .7);
			ctx.globalAlpha = 1;
		}
		if (near) {
			const px = -(cam.x * .55 % near.width);
			ctx.globalAlpha = .35;
			ctx.drawImage(near, px, h * .2, near.width, h * .7);
			ctx.drawImage(near, px + near.width, h * .2, near.width, h * .7);
			ctx.globalAlpha = 1;
		}
	};
	const draw = (mx, attacking) => {
		const w = canvas.clientWidth;
		const h = canvas.clientHeight;
		ctx.fillStyle = "#07080c";
		ctx.fillRect(0, 0, w, h);
		if (st.mode === "city") {
			drawParallax(w, h);
			ctx.save();
			ctx.translate(-cam.x, 0);
			tileFill(street, 0, 580, CITY_W, h - GROUND, 96);
			ctx.fillStyle = "rgba(7,8,12,0.35)";
			ctx.fillRect(0, 580, CITY_W, 8);
			if (haul) {
				const hh = 210;
				const hw = haul.width / haul.height * hh;
				ctx.drawImage(haul, 120, 378, hw, hh);
			}
			for (const b of LAYOUT) {
				const im = bldImgs[b.id];
				const bh = 200;
				if (im) {
					const bw = Math.min(220, im.width / im.height * bh);
					ctx.drawImage(im, b.x - bw / 2, 384, bw, bh);
				}
				ctx.fillStyle = "rgba(7,8,12,0.7)";
				ctx.fillRect(b.x - 46, 588, 92, 16);
				ctx.fillStyle = "#5eead4";
				ctx.font = "11px IBM Plex Sans, sans-serif";
				ctx.textAlign = "center";
				ctx.fillText(BUILDINGS.find((x) => x.id === b.id)?.name ?? b.id, b.x, 600);
			}
			drawSheet(mechanicImg, 2, 2, Math.floor(animT * 5) % 2, 0, 560, 618, 118);
			drawSheet(bartenderImg, 2, 2, Math.floor(animT * 5) % 2, 0, 920, 618, 114);
			drawSheet(merchantImg, 2, 2, Math.floor(animT * 4) % 2, 0, 1620, 618, 118);
			for (const m of muggers) {
				if (m.hp <= 0) continue;
				ctx.globalAlpha = m.hurt > 0 ? .55 : 1;
				drawSheet(muggerImg, 2, 2, Math.floor(m.frame) % 2, Math.floor(m.frame / 2) % 2, m.x, m.y, 124, m.facing === 1);
				ctx.globalAlpha = 1;
			}
			const moving = Math.abs(mx) > .08;
			const row = player.facing;
			const col = moving ? Math.floor(player.frame) % 4 : 0;
			const atkImg = st.hasPistol ? pistol : melee;
			ctx.globalAlpha = player.hurt > 0 ? .6 : 1;
			ctx.fillStyle = "rgba(0,0,0,0.35)";
			ctx.beginPath();
			ctx.ellipse(player.x, player.y - 6, 22, 8, 0, 0, Math.PI * 2);
			ctx.fill();
			if (attacking && atkCd > .02) drawSheet(atkImg, 2, 2, Math.floor(animT * 10) % 2, Math.floor(animT * 5) % 2, player.x, player.y, 176, player.facing === 1);
			else drawSheet(walk, 4, 4, col, row, player.x, player.y, 176);
			ctx.globalAlpha = 1;
			ctx.fillStyle = "rgba(94,234,212,0.85)";
			ctx.font = "12px IBM Plex Sans, sans-serif";
			ctx.textAlign = "center";
			ctx.fillText("E  ship", 220, 552);
			ctx.fillText("E  undercity", 3200, 552);
			ctx.restore();
		} else if (st.mode === "ship") {
			if (shipIn) ctx.drawImage(shipIn, 0, 0, w, h);
			tileFill(deck, 80, 380, w - 160, 160, 72);
			ctx.fillStyle = "rgba(7,8,12,0.55)";
			ctx.fillRect(40, 24, 280, 64);
			ctx.fillStyle = "#e8eef4";
			ctx.font = "16px Syne, sans-serif";
			ctx.textAlign = "left";
			ctx.fillText("NIGHTHAUL  ·  hold", 56, 50);
			ctx.fillStyle = "#8b96a5";
			ctx.font = "12px IBM Plex Sans, sans-serif";
			ctx.fillText("E west hatch · E east helm · M star map", 56, 72);
			drawSheet(walk, 4, 4, Math.floor(player.frame) % 4, player.facing, player.x, player.y, 140);
			if (pod) ctx.drawImage(pod, 520, 300, 180, 100);
		} else if (st.mode === "space") {
			if (spaceBg) {
				const px = -(cam.x * .08 % spaceBg.width);
				const py = -(cam.y * .08 % spaceBg.height);
				ctx.drawImage(spaceBg, px - spaceBg.width, py - spaceBg.height, spaceBg.width * 3, spaceBg.height * 3);
			}
			ctx.save();
			ctx.translate(-cam.x, -cam.y);
			const drawCraft = (image, x, y, heading, size, hurt) => {
				if (!image) return;
				ctx.save();
				ctx.translate(x, y);
				ctx.rotate(-heading);
				if (hurt) ctx.globalAlpha = .5;
				const hh = size;
				const hw = image.width / image.height * hh;
				ctx.drawImage(image, -hw / 2, -hh / 2, hw, hh);
				ctx.restore();
			};
			drawCraft(haul, player.x, player.y, st.heading, 280, player.hurt > 0);
			for (const p of pirates) {
				if (p.hp <= 0) continue;
				drawCraft(pirateImg, p.x, p.y, p.heading, 210, p.hurt > 0);
			}
			for (const s of shots) if (laser) {
				ctx.save();
				ctx.translate(s.x, s.y);
				ctx.rotate(Math.atan2(s.vy, s.vx));
				ctx.drawImage(laser, -28, -8, 40, 16);
				ctx.restore();
			} else {
				ctx.fillStyle = s.from === "player" ? "#5eead4" : "#e85d4c";
				ctx.fillRect(s.x - 4, s.y - 2, 8, 4);
			}
			ctx.restore();
		} else if (st.mode === "mine" && mine) {
			if (mineFar) ctx.drawImage(mineFar, 0, 0, w, h);
			ctx.save();
			ctx.translate(-cam.x, -cam.y);
			for (let y = 0; y < MINE_R; y++) for (let x = 0; x < MINE_C; x++) {
				const t = mine[y * MINE_C + x];
				if (!t) continue;
				const im = t === 4 ? crystal : t === 3 ? copper : t === 2 ? stone : dirt;
				if (im) ctx.drawImage(im, x * MINE_T, y * MINE_T, MINE_T, MINE_T);
			}
			drawSheet(attacking ? mineAnim : walk, attacking ? 2 : 4, attacking ? 2 : 4, attacking ? Math.floor(animT * 8) % 2 : Math.abs(mx) > .08 ? Math.floor(player.frame) % 4 : 0, attacking ? 0 : player.facing === 1 ? 1 : 2, minePx * MINE_T, minePy * MINE_T + 18, 52, player.facing === 1);
			ctx.fillStyle = "#5eead4";
			ctx.font = "12px IBM Plex Sans, sans-serif";
			ctx.fillText("ladder", 24, 208);
			ctx.restore();
		}
		for (const f of fx) {
			const im = f.kind === "muzzle" ? muzzle : f.kind === "slash" ? slash : explode;
			if (!im) continue;
			ctx.save();
			ctx.globalAlpha = clamp(f.life * 4, 0, 1);
			const sx = st.mode === "city" ? f.x - cam.x : st.mode === "space" ? f.x - cam.x : f.x - cam.x;
			const sy = st.mode === "city" ? f.y : f.y - cam.y;
			ctx.drawImage(im, sx - 24, sy - 24, 48, 48);
			ctx.restore();
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
	raf = requestAnimationFrame(tick);
	return {
		destroy: () => {
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
				return "Holdout seated.";
			}
			if (id === "baton") {
				if (st.credits < p.prices.baton) return "Not enough scrip.";
				st.credits -= p.prices.baton;
				st.hasBaton = true;
				return "Baton on the belt.";
			}
			const cost = priceOf(p, id);
			if (st.credits < cost) return "Not enough scrip.";
			if (!addCargo(id, 1)) return "Hold is full.";
			st.credits -= cost;
			status();
			return `Bought ${GOODS.find((g) => g.id === id)?.name ?? id}.`;
		},
		sell: (id) => {
			if (!st.cargo[id]) return "You are not carrying that.";
			const cost = priceOf(planet(), id);
			addCargo(id, -1);
			st.credits += Math.floor(cost * .72);
			status();
			return `Sold ${id}.`;
		},
		repair: (id) => {
			if ((st.cargo.shunt ?? 0) < 1) return "Need a shunt.";
			if (!(id in st.systems)) return "No such system.";
			addCargo("shunt", -1);
			st.systems[id] = Math.min(100, st.systems[id] + 45);
			status();
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
			return `${mod.name} bolted in.`;
		},
		deposit: (n) => {
			const amt = Math.min(n, st.credits);
			st.credits -= amt;
			st.bank += amt;
			status();
			return `Parked ${amt}¢.`;
		},
		withdraw: (n) => {
			const amt = Math.min(n, st.bank);
			st.bank -= amt;
			st.credits += amt;
			status();
			return `Drew ${amt}¢.`;
		},
		sleep: () => {
			if (st.credits < 12) return "The flophouse wants 12¢.";
			st.credits -= 12;
			player.hp = st.maxHp;
			st.hp = st.maxHp;
			status();
			return "A bad mattress. Full vigour.";
		},
		deliver: () => {
			if (st.planet !== "vesper") return "Colony is on Vesper-9.";
			let n = 0;
			for (const k of Object.keys(CONTRACT.need)) {
				const have = st.cargo[k] ?? 0;
				const need = CONTRACT.need[k] - (st.delivered[k] ?? 0);
				const give = Math.min(have, Math.max(0, need));
				if (give) {
					addCargo(k, -give);
					st.delivered[k] = (st.delivered[k] ?? 0) + give;
					n += give;
				}
			}
			if (st.planet === "vesper" && !cryoTaken.vesper) {
				cryoTaken.vesper = true;
				addCargo("cryopod", 1);
			}
			status();
			return n ? `Offloaded ${n} for Banville.` : "Nothing the colony still needs.";
		},
		warp: (systemId) => {
			const sys = SYSTEMS.find((s) => s.id === systemId);
			if (!sys) return "Dead chart.";
			if (!sys.planet) return "Ghost system. No air, no dock.";
			if (st.systems.warp < 25) return "Warp is cold. Fit a shunt.";
			if (st.mode !== "space" && st.mode !== "ship") return "Launch first.";
			st.planet = sys.planet;
			st.fuel = Math.max(0, st.fuel - 8);
			st.systems.warp = Math.max(0, st.systems.warp - 6);
			land();
			if (sys.planet !== "vesper" && !cryoTaken[sys.planet] && Math.random() < .65) {}
			if (!cryoTaken[sys.planet]) cryoTaken[sys.planet] = false;
			opts.onMap(false);
			status();
			return `Fell into ${sys.name}.`;
		}
	};
}
//#endregion
export { mountNighthaul };
