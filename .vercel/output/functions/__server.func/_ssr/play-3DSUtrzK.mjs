import { o as __toESM } from "../_runtime.mjs";
import { c as PORTRAITS, i as GOODS, l as SYSTEMS, n as BUILDINGS, o as MODULES, r as CONTRACT, s as PLANETS } from "./catalog-DRqLEzIL.mjs";
import { R as require_react, _ as Link, y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/play-3DSUtrzK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PlayPage() {
	const canvasRef = (0, import_react.useRef)(null);
	const api = (0, import_react.useRef)(null);
	const [started, setStarted] = (0, import_react.useState)(false);
	const [portrait, setPortrait] = (0, import_react.useState)("courier");
	const [name, setName] = (0, import_react.useState)("Zed");
	const [status, setStatus] = (0, import_react.useState)("Sign the contract");
	const [shop, setShop] = (0, import_react.useState)(null);
	const [mapOpen, setMapOpen] = (0, import_react.useState)(false);
	const [toast, setToast] = (0, import_react.useState)("");
	const [tick, setTick] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (!started) return;
		const canvas = canvasRef.current;
		if (!canvas) return;
		let stop = false;
		let handle;
		const run = async () => {
			const { mountNighthaul } = await import("./nighthaul-6WRU_MLk.mjs");
			if (stop || !canvas) return;
			return mountNighthaul(canvas, {
				config: {
					portrait,
					name: name.trim() || "Zed"
				},
				onStatus: setStatus,
				onReady: () => {},
				onShop: setShop,
				onMap: setMapOpen
			});
		};
		run().then((h) => {
			if (h) {
				handle = h;
				api.current = h;
			}
		}).catch((err) => setStatus(err instanceof Error ? err.message : "Dock sealed."));
		return () => {
			stop = true;
			handle?.destroy();
			api.current = null;
		};
	}, [
		started,
		portrait,
		name
	]);
	const st = api.current?.getState();
	const bump = (msg) => {
		setToast(msg);
		setTick((n) => n + 1);
		window.setTimeout(() => setToast(""), 1800);
	};
	const stock = shop === "bar" ? ["nutrapack", "stim"] : shop === "parts" ? ["shunt", "coolant"] : shop === "exchange" ? [
		"nutrapack",
		"stim",
		"chip",
		"coolant",
		"copper",
		"crystal"
	] : shop === "warehouse" ? [
		"copper",
		"crystal",
		"chip"
	] : shop === "guns" ? ["pistol", "baton"] : [];
	const shopMeta = BUILDINGS.find((b) => b.id === shop);
	const planet = PLANETS.find((p) => p.id === st?.planet) ?? PLANETS[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative min-h-screen overflow-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "block h-dvh w-full touch-none"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "pointer-events-auto rounded-md border border-line bg-surface/80 px-3 py-2 text-xs text-muted backdrop-blur-sm hover:text-fg",
					children: "Nighthaul"
				}), started && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-[70%] rounded-md border border-line bg-surface/80 px-3 py-2 font-mono text-xs text-muted backdrop-blur-sm",
					children: status
				})]
			}),
			started && st && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "rounded-md border border-line bg-surface/80 px-3 py-2 text-xs text-muted backdrop-blur-sm",
					children: [
						"WASD move · E enter · Space fire · M map",
						st.mode === "space" ? " · A/D yaw · W thrust" : "",
						st.mode === "mine" ? " · W jump · click/S dig" : ""
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-xs tabular-nums text-credit",
					children: [
						"hold ",
						Object.values(st.cargo).reduce((a, b) => a + b, 0),
						" · fuel ",
						Math.floor(st.fuel)
					]
				})]
			}),
			toast ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 rounded-md border border-line bg-surface px-3 py-2 text-sm",
				children: toast
			}) : null,
			!started && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 grid place-items-center overflow-y-auto bg-bg/80 px-5 py-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-2xl rounded-xl border border-line bg-surface p-6 sm:p-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs tracking-[0.24em] text-subtle uppercase",
							children: "A frozen contract"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-4xl font-semibold",
							children: "Sign as the heir"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted",
							children: [
								"Uncle left you a wrecked hauler and a debt to ",
								CONTRACT.colony,
								": chips, nutrapacks, coolant, and three cryogens. Trade the belt, fight in the lane, dig the undercity, keep the ship alive with shunts."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-6 block text-xs tracking-wide text-subtle uppercase",
							children: ["Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: name,
								onChange: (e) => setName(e.target.value),
								className: "mt-2 h-11 w-full rounded-md border border-line bg-raised px-3 text-sm text-fg outline-none focus:border-accent"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-5 text-xs tracking-wide text-subtle uppercase",
							children: "Cast"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 grid grid-cols-3 gap-2",
							children: PORTRAITS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setPortrait(p.id),
								className: portrait === p.id ? "overflow-hidden rounded-lg border border-accent bg-raised" : "overflow-hidden rounded-lg border border-line bg-raised hover:border-accent",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: `/assets/nh/heroes/portrait-${p.id}.png`,
									alt: "",
									className: "aspect-[4/5] w-full object-cover"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block px-2 py-2 text-left",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-sm font-medium",
										children: p.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-xs text-muted",
										children: p.blurb
									})]
								})]
							}, p.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setStarted(true),
							className: "mt-6 w-full rounded-md bg-accent py-3 text-sm font-medium text-accent-fg",
							children: "Take the Nighthaul"
						})
					]
				})
			}),
			shop && st && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 grid place-items-center bg-bg/70 px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-md rounded-xl border border-line bg-surface p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xs tracking-[0.2em] text-subtle uppercase",
								children: planet.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl font-semibold",
								children: shopMeta?.name ?? shop
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "rounded-md border border-line px-3 py-1.5 text-xs text-muted hover:text-fg",
								onClick: () => setShop(null),
								children: "Leave"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 font-mono text-xs tabular-nums text-credit",
							children: [
								st.credits,
								"¢ on hand · ",
								st.bank,
								"¢ in vault"
							]
						}),
						shop === "hotel" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mt-4 w-full rounded-md bg-accent py-2.5 text-sm text-accent-fg",
							onClick: () => bump(api.current?.sleep() ?? ""),
							children: "Sleep · 12¢"
						}),
						shop === "bank" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "rounded-md border border-line py-2 text-sm",
								onClick: () => bump(api.current?.deposit(50) ?? ""),
								children: "Park 50¢"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "rounded-md border border-line py-2 text-sm",
								onClick: () => bump(api.current?.withdraw(50) ?? ""),
								children: "Draw 50¢"
							})]
						}),
						shop === "parts" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "Shunts jump a dead system. Bolts cost extra."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-2 gap-2",
									children: Object.keys(st.systems).map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "rounded-md border border-line px-2 py-2 text-left text-xs",
										onClick: () => bump(api.current?.repair(id) ?? ""),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-fg",
											children: id
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-mono text-subtle",
											children: [Math.floor(st.systems[id]), "%"]
										})]
									}, id))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-2 gap-2",
									children: MODULES.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "rounded-md border border-line px-2 py-2 text-left text-xs",
										onClick: () => bump(api.current?.fit(m.id) ?? ""),
										children: [
											m.name,
											" · ",
											m.cost,
											"¢"
										]
									}, m.id))
								})
							]
						}),
						shop === "warehouse" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "mt-4 w-full rounded-md bg-accent py-2.5 text-sm text-accent-fg",
							onClick: () => bump(api.current?.deliver() ?? ""),
							children: ["Offload for ", CONTRACT.colony]
						}),
						stock.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-4 space-y-2",
							children: stock.map((id) => {
								const g = GOODS.find((x) => x.id === id);
								const price = planet.prices[id] ?? 20;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center justify-between gap-2 rounded-md border border-line px-3 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-sm",
										children: g?.name ?? id
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "block text-xs text-muted",
										children: [
											price,
											"¢ · have ",
											st.cargo[id] ?? 0
										]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "rounded-md bg-accent px-2 py-1 text-xs text-accent-fg",
											onClick: () => bump(api.current?.buy(id) ?? ""),
											children: "Buy"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "rounded-md border border-line px-2 py-1 text-xs",
											onClick: () => bump(api.current?.sell(id) ?? ""),
											children: "Sell"
										})]
									})]
								}, `${id}-${tick}`);
							})
						})
					]
				})
			}),
			mapOpen && st && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 grid place-items-center bg-bg/70 px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-lg rounded-xl border border-line bg-surface p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl font-semibold",
								children: "Star chart"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "rounded-md border border-line px-3 py-1.5 text-xs text-muted",
								onClick: () => setMapOpen(false),
								children: "Close"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted",
							children: "Warp wants a live shunt. Ghost systems have no dock."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "relative mt-4 h-56 overflow-hidden rounded-lg border border-line bg-raised",
							children: SYSTEMS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								style: {
									left: `${s.x}%`,
									top: `${s.y}%`
								},
								className: "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-line bg-surface px-2 py-1 text-xs hover:border-accent",
								onClick: () => bump(api.current?.warp(s.id) ?? ""),
								children: s.name
							}, s.id))
						})
					]
				})
			})
		]
	});
}
//#endregion
export { PlayPage as component };
