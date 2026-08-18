#!/usr/bin/env python3
"""Chroma-key and export the Nighthaul HD asset pack into public/assets/nh."""
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path("/workspace")
ART = ROOT / "artifacts" / "imagine_images"
PROC = ROOT / ".grok" / "skills" / "generate2dsprite" / "scripts" / "generate2dsprite.py"
EXTRACT = ROOT / ".grok" / "skills" / "generate2dmap" / "scripts" / "extract_prop_pack.py"
SEAMLESS = ROOT / "scripts" / "seamless_tile.py"
WORK = ROOT / "assets" / "nh"
PUB = ROOT / "public" / "assets" / "nh"

SHEETS = [
    # name, src, target, mode, extra
    ("heroes/walk", "32639419-e299-439c-b5a7-c4f367e2449f.jpg", "player", "player_sheet", ["--shared-scale", "--align", "feet"]),
    ("heroes/pistol", "9b4075cd-58c3-442f-bd05-1b29cdec2de6.jpg", "player", "shoot", ["--shared-scale", "--align", "feet"]),
    ("heroes/melee", "f3f69f63-4d9a-4a68-a403-cdecbdab494b.jpg", "player", "attack", ["--shared-scale", "--align", "feet"]),
    ("heroes/mine", "ccc6f15b-da27-4e9a-9084-7d9119e372cf.jpg", "player", "attack", ["--shared-scale", "--align", "feet"]),
    ("heroes/idle", "cc21380d-ad19-4587-944b-e3f7dee86caa.jpg", "asset", "sheet", ["--rows", "1", "--cols", "1", "--align", "feet"]),
    ("npcs/mugger", "f481af18-b34e-41f4-b032-3f34ee1c7f2d.jpg", "npc", "combat", ["--shared-scale", "--align", "feet"]),
    ("npcs/bartender", "a3d227a4-bc7e-4454-861e-58ddd4464c71.jpg", "npc", "idle", ["--shared-scale", "--align", "feet"]),
    ("npcs/merchant", "073c08dc-a010-4b75-acbb-a1aeaeec7eb6.jpg", "npc", "idle", ["--shared-scale", "--align", "feet"]),
    ("npcs/mechanic", "92ce4359-67cd-41be-8817-ac46283b597b.jpg", "npc", "idle", ["--shared-scale", "--align", "feet"]),
    ("ships/nighthaul", "72d92afa-8f86-4941-ad44-247fe06ab51a.jpg", "asset", "sheet", ["--rows", "1", "--cols", "1", "--align", "center"]),
    ("ships/pirate", "3ed0de34-e581-4f9c-8e94-a84f19567279.jpg", "asset", "sheet", ["--rows", "1", "--cols", "1", "--align", "center"]),
    ("ships/pod", "c602559a-1d81-4a38-8268-61b5b144921f.jpg", "asset", "sheet", ["--rows", "1", "--cols", "1", "--align", "center"]),
    ("buildings/bar", "9ff7153d-21f4-483b-acc3-fd4b98d64e74.jpg", "asset", "sheet", ["--rows", "1", "--cols", "1", "--align", "bottom"]),
    ("buildings/bank", "1816eb0e-b2ba-4d80-bec2-63ffc1509129.jpg", "asset", "sheet", ["--rows", "1", "--cols", "1", "--align", "bottom"]),
    ("buildings/exchange", "4ea465bf-7709-4748-82ee-a92c86c28c99.jpg", "asset", "sheet", ["--rows", "1", "--cols", "1", "--align", "bottom"]),
    ("buildings/warehouse", "0480cd19-7b29-4e81-9d49-111602886ee7.jpg", "asset", "sheet", ["--rows", "1", "--cols", "1", "--align", "bottom"]),
    ("buildings/parts", "cbf4d5fe-5a51-4603-a6c2-160463e04a8d.jpg", "asset", "sheet", ["--rows", "1", "--cols", "1", "--align", "bottom"]),
    ("buildings/hotel", "716d74d9-b646-4671-b9ff-02d98f17891f.jpg", "asset", "sheet", ["--rows", "1", "--cols", "1", "--align", "bottom"]),
    ("buildings/guns", "de163871-d874-4a31-9185-bb5b02c0e92c.jpg", "asset", "sheet", ["--rows", "1", "--cols", "1", "--align", "bottom"]),
    ("fx/muzzle", "760f5b54-709e-4706-9333-9eb1cb36cef9.jpg", "asset", "fx", ["--shared-scale", "--align", "center"]),
    ("fx/slash", "ac4da299-6e33-4416-93e9-346f4dfe0fdd.jpg", "asset", "fx", ["--shared-scale", "--align", "center"]),
    ("fx/laser", "6ad2892c-8212-43cd-88b3-50cb812a9272.jpg", "asset", "projectile", ["--shared-scale", "--align", "center"]),
    ("fx/explode", "5167ddfb-b24b-4f2c-bf3e-6ea9c55a0b27.jpg", "asset", "explode", ["--shared-scale", "--align", "center"]),
    ("ui/icons", "fdab34e4-d679-47e9-bd3c-1583b411157f.jpg", "asset", "sheet", ["--rows", "4", "--cols", "4", "--align", "center"]),
]

TILES = [
    ("tiles/street.png", "68571581-e72d-44c3-ae24-79d875c739b3.jpg"),
    ("tiles/deck.png", "8aeba400-6cac-455b-a810-b511968bff54.jpg"),
    ("mine/dirt.png", "293b0656-b573-476f-9ed4-a2b57c7f7142.jpg"),
    ("mine/stone.png", "d484c1ee-e3bc-447b-bbbf-1932d1640497.jpg"),
    ("mine/copper.png", "a9739b45-ecb7-4c54-843d-4ccfdcbaa45a.jpg"),
    ("mine/crystal.png", "375fb2ca-0cab-4582-a8fe-21ae9afdce61.jpg"),
]

PORTRAITS = [
    ("heroes/portrait-courier.png", "3bf7367a-aa3d-4173-983c-8a2534c9c790.jpg"),
    ("heroes/portrait-bruiser.png", "c6bdf78c-eafd-4c09-bf14-b79e81d3c8cd.jpg"),
    ("heroes/portrait-fixer.png", "ab35d655-b4d4-462d-9697-184733427032.jpg"),
]

SCENES = [
    ("parallax/space.jpg", "1cbe8322-1d50-46e1-b3cb-3cf4e899fd29.jpg"),
    ("parallax/kessler-far.jpg", "d2948088-af88-4ca0-8e78-52f7595459a7.jpg"),
    ("parallax/slag-far.jpg", "6cbb6fbe-24ab-4b5c-8565-564b24ea6973.jpg"),
    ("parallax/vesper-far.jpg", "5406d932-359a-48b8-926e-6cf1ffce3da8.jpg"),
    ("parallax/mine-far.jpg", "5ae3f899-4d29-4d59-8847-634b35b886fd.jpg"),
    ("interiors/ship.jpg", "02925071-2d11-41e3-9197-90eabd453ed2.jpg"),
    ("interiors/bar.jpg", "65b95ba3-8149-4e8c-8376-79bc535de603.jpg"),
]


def run(cmd: list[str]) -> None:
    print("+", " ".join(cmd), flush=True)
    subprocess.check_call(cmd)


def chroma_single(src: Path, dst: Path) -> None:
    im = Image.open(src).convert("RGBA")
    px = im.load()
    w, h = im.size
    # sample corners for key
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r > 170 and b > 170 and g < 110:
                px[x, y] = (r, g, b, 0)
            elif r > 140 and b > 140 and g < 140:
                # despill
                g2 = min(255, g + 40)
                px[x, y] = (min(r, g2), g2, min(b, g2), a)
    im.save(dst, "PNG")


def copy_sheet(name: str) -> None:
    src_dir = WORK / name
    transparent = src_dir / "sheet-transparent.png"
    # singles may emit frame-1.png
    frames = sorted(src_dir.glob("frame-1.png")) + sorted(src_dir.glob("idle-1.png"))
    pub_png = PUB / f"{name}.png"
    pub_png.parent.mkdir(parents=True, exist_ok=True)
    if transparent.exists():
        shutil.copy2(transparent, pub_png)
        print("copied", transparent, "->", pub_png)
    elif frames:
        shutil.copy2(frames[0], pub_png)
        print("copied", frames[0], "->", pub_png)
    else:
        # fallback chroma
        raw = src_dir / "raw.jpg"
        if raw.exists():
            chroma_single(raw, pub_png)
            print("chroma fallback", pub_png)
        else:
            print("MISSING", name, file=sys.stderr)


def qc_tile(path: Path) -> None:
    im = Image.open(path)
    w, h = im.size
    canvas = Image.new("RGB", (w * 2, h * 2))
    for y in range(2):
        for x in range(2):
            canvas.paste(im, (x * w, y * h))
    out = path.with_name(path.stem + "-2x2.png")
    canvas.save(out)
    print("tile qc", out, canvas.size)


def main() -> None:
    WORK.mkdir(parents=True, exist_ok=True)
    PUB.mkdir(parents=True, exist_ok=True)

    for name, src, target, mode, extra in SHEETS:
        raw_src = ART / src
        out_dir = WORK / name
        out_dir.mkdir(parents=True, exist_ok=True)
        raw = out_dir / "raw.jpg"
        shutil.copy2(raw_src, raw)
        cmd = [
            "python3",
            str(PROC),
            "process",
            "--input",
            str(raw),
            "--target",
            target,
            "--mode",
            mode,
            "--output-dir",
            str(out_dir),
            *extra,
        ]
        try:
            run(cmd)
        except subprocess.CalledProcessError as e:
            print("process failed", name, e, file=sys.stderr)
            chroma_single(raw, out_dir / "sheet-transparent.png")
        copy_sheet(name)

    # items 3x3
    items_raw = WORK / "items"
    items_raw.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ART / "cf67de53-e616-4570-91f5-8138e72b0f64.jpg", items_raw / "raw-sheet.jpg")
    run(
        [
            "python3",
            str(EXTRACT),
            "--input",
            str(items_raw / "raw-sheet.jpg"),
            "--rows",
            "3",
            "--cols",
            "3",
            "--labels",
            "nutrapack,stim,chip,coolant,copper,crystal,shunt,pistol,baton",
            "--output-dir",
            str(items_raw),
            "--manifest",
            str(items_raw / "pack.json"),
            "--component-mode",
            "largest",
        ]
    )
    extra_dir = WORK / "items-extra"
    extra_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ART / "8a88bc5e-5bb3-4a5f-b804-9bb2003aa70d.jpg", extra_dir / "raw-sheet.jpg")
    run(
        [
            "python3",
            str(EXTRACT),
            "--input",
            str(extra_dir / "raw-sheet.jpg"),
            "--rows",
            "2",
            "--cols",
            "2",
            "--labels",
            "cryopod,credits,crate,pickaxe",
            "--output-dir",
            str(items_raw),
            "--manifest",
            str(items_raw / "extra.json"),
            "--component-mode",
            "largest",
        ]
    )
    for d in items_raw.iterdir():
        if d.is_dir() and (d / "prop.png").exists():
            dest = PUB / "items" / d.name / "prop.png"
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(d / "prop.png", dest)

    for dest, src in TILES:
        raw = ART / src
        out = PUB / dest
        out.parent.mkdir(parents=True, exist_ok=True)
        tmp = WORK / dest
        tmp.parent.mkdir(parents=True, exist_ok=True)
        run(["python3", str(SEAMLESS), "--input", str(raw), "--output", str(tmp), "--size", "256"])
        shutil.copy2(tmp, out)
        qc_tile(out)

    for dest, src in PORTRAITS:
        im = Image.open(ART / src).convert("RGB")
        out = PUB / dest
        out.parent.mkdir(parents=True, exist_ok=True)
        im.save(out, "PNG")
        print("portrait", out)

    for dest, src in SCENES:
        out = PUB / dest
        out.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ART / src, out)
        print("scene", out)

    # sky from kessler far, darkened crop of top
    sky = Image.open(ART / "d2948088-af88-4ca0-8e78-52f7595459a7.jpg").convert("RGB")
    sky = sky.crop((0, 0, sky.width, int(sky.height * 0.55))).resize((1920, 640))
    sky_path = PUB / "parallax" / "kessler-sky.jpg"
    sky.save(sky_path, "JPEG", quality=90)

    print("done")


if __name__ == "__main__":
    main()
