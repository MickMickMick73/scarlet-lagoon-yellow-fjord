import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

mkdirSync("/workspace/screenshots", { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

const hold = async (code, ms) => {
  await page.keyboard.down(code);
  await page.waitForTimeout(ms);
  await page.keyboard.up(code);
};

await page.goto("http://127.0.0.1:8080/play", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(400);
await page.screenshot({ path: "/workspace/screenshots/nh-create-sundog.png" });
await page.locator("button:has-text('Take the Nighthaul')").click({ timeout: 5000 });
await page.waitForTimeout(1800);
await page.screenshot({ path: "/workspace/screenshots/nh-city-sundog.png" });
const status1 = await page.locator("p.max-w-\\[70\\%\\]").innerText().catch(() => "");

await hold("KeyD", 2200);
await page.keyboard.press("KeyE");
await page.waitForTimeout(500);
await page.screenshot({ path: "/workspace/screenshots/nh-interior-sundog.png" });
const status2 = await page.locator("p.max-w-\\[70\\%\\]").innerText().catch(() => "");

await hold("KeyD", 800);
await page.keyboard.press("KeyE");
await page.waitForTimeout(400);
await page.screenshot({ path: "/workspace/screenshots/nh-shop-sundog.png" });
const overlay = await page.locator("h2").first().innerText().catch(() => "");
const leave = page.locator("button:has-text('Leave')");
if (await leave.count()) await leave.click({ timeout: 2000 });
await page.waitForTimeout(200);

await page.keyboard.press("KeyE");
await page.waitForTimeout(300);
await hold("KeyA", 2800);
await page.keyboard.press("KeyE");
await page.waitForTimeout(600);
await page.screenshot({ path: "/workspace/screenshots/nh-ship-sundog.png" });
const status3 = await page.locator("p.max-w-\\[70\\%\\]").innerText().catch(() => "");

await hold("KeyD", 2200);
await page.keyboard.press("KeyE");
await page.waitForTimeout(800);
await page.screenshot({ path: "/workspace/screenshots/nh-space-sundog.png" });
const status4 = await page.locator("p.max-w-\\[70\\%\\]").innerText().catch(() => "");

console.log(JSON.stringify({ errors, status1, status2, overlay, status3, status4 }, null, 2));
await browser.close();
