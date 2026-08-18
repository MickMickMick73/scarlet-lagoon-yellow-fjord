import { o as __toESM } from "../_runtime.mjs";
import { t as ASSETS } from "./catalog-DRqLEzIL.mjs";
import { R as require_react, _ as Link, y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/kit-DlhlNBeP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TABS = [
	"All",
	"Cast",
	"Streets",
	"Ships",
	"Interiors",
	"Items",
	"Mine",
	"FX"
];
function KitPage() {
	const [tab, setTab] = (0, import_react.useState)("All");
	const [q, setQ] = (0, import_react.useState)("");
	const filtered = (0, import_react.useMemo)(() => {
		return ASSETS.filter((t) => {
			if (tab !== "All" && t.kind !== tab) return false;
			if (q && !`${t.name} ${t.id}`.toLowerCase().includes(q.toLowerCase())) return false;
			return true;
		});
	}, [tab, q]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "border-b border-line",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "font-display text-2xl font-semibold",
					children: "Nighthaul"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-4 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "text-muted hover:text-fg",
						children: "Home"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/play",
						className: "text-muted hover:text-fg",
						children: "Launch"
					})]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl px-5 py-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl font-semibold",
					children: "Parts bay"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 max-w-xl text-muted",
					children: [ASSETS.length, " engine-ready pieces for the frozen contract. Sheets shown whole."]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-4 lg:flex-row lg:items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Search assets",
						className: "h-11 w-full rounded-md border border-line bg-surface px-3 text-sm text-fg outline-none placeholder:text-subtle focus:border-accent lg:max-w-xs"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setTab(t),
							className: t === tab ? "rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg" : "rounded-full border border-line px-3 py-1.5 text-xs text-muted hover:text-fg",
							children: t
						}, t))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 font-mono text-xs text-subtle",
					children: [filtered.length, " shown"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
					children: filtered.map((asset) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "overflow-hidden rounded-lg border border-line bg-surface",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "relative aspect-square bg-raised p-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: asset.src,
								alt: asset.name,
								className: "h-full w-full object-contain"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-t border-line px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm text-fg",
								children: asset.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-xs tracking-wide text-subtle uppercase",
								children: [asset.kind, asset.sheet ? ` · ${asset.sheet.cols}×${asset.sheet.rows}` : ""]
							})]
						})]
					}, `${asset.kind}-${asset.id}`))
				})
			]
		})]
	});
}
//#endregion
export { KitPage as component };
