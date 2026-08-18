#!/usr/bin/env python3
"""Mesh-warp a still 4x4 courier sheet into a looping walk with arm + leg swing."""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageFilter

SRC = Path("/workspace/assets/nh/heroes/walk/raw-sheet-clean.png")
OUT_DIR = Path("/workspace/assets/nh/heroes/walk2")
PUB = Path("/workspace/public/assets/nh/heroes/walk.png")
CELL = 168


def cells_of(sheet: Image.Image) -> list[list[Image.Image]]:
    w, h = sheet.size
    cw, ch = w // 4, h // 4
    return [
        [sheet.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch)) for c in range(4)]
        for r in range(4)
    ]


def opaque_score(im: Image.Image) -> int:
    hist = im.split()[-1].histogram()
    return sum(hist[40:])


def fit(im: Image.Image, size: int) -> Image.Image:
    a = im.split()[-1]
    bbox = a.point(lambda p: 255 if p > 16 else 0).getbbox()
    if bbox:
        im = im.crop(bbox)
    pad = 20
    side = max(im.size) + pad * 2
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(im, ((side - im.width) // 2, side - im.height - pad // 2), im)
    return canvas.resize((size, size), Image.Resampling.LANCZOS)


def mesh_walk(im: Image.Image, phase: float, kind: str) -> Image.Image:
    w, h = im.size
    ang = phase * math.tau
    swing = math.sin(ang)
    bob = abs(math.cos(ang))

    cols, rows = 6, 10
    mesh = []
    for j in range(rows):
        for i in range(cols):
            x0 = int(i * w / cols)
            y0 = int(j * h / rows)
            x1 = int((i + 1) * w / cols)
            y1 = int((j + 1) * h / rows)
            fy = (j + 0.5) / rows
            fx = (i + 0.5) / cols
            sdx = 0.0
            sdy = bob * h * 0.028
            if kind in ("left", "right"):
                if fy > 0.52:
                    sdx = swing * w * 0.16 * ((fy - 0.52) / 0.48)
                elif fy > 0.30:
                    sdx = -swing * w * 0.13 * ((0.52 - fy) / 0.22)
            else:
                # toward / away: left and right halves oppose
                side = 1.0 if fx < 0.5 else -1.0
                if fy > 0.52:
                    sdx = side * swing * w * 0.08 * ((fy - 0.52) / 0.48)
                    sdy += -abs(swing) * h * 0.03 * (1 if side * swing > 0 else 0)
                elif fy > 0.30:
                    sdx = -side * swing * w * 0.10 * ((0.52 - fy) / 0.22)
            # sample from shifted source
            src = (
                x0 + sdx,
                y0 + sdy,
                x1 + sdx,
                y0 + sdy,
                x1 + sdx,
                y1 + sdy,
                x0 + sdx,
                y1 + sdy,
            )
            mesh.append(((x0, y0, x1, y1), src))
    return im.transform(im.size, Image.Transform.MESH, mesh, Image.Resampling.BILINEAR)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    sheet = Image.open(SRC).convert("RGBA")
    grid = cells_of(sheet)
    names = ["down", "left", "right", "up"]
    phases = [0.0, 0.25, 0.5, 0.75]
    atlas = Image.new("RGBA", (CELL * 4, CELL * 4), (0, 0, 0, 0))
    right_gif = []

    for r, name in enumerate(names):
        still = fit(max(grid[r], key=opaque_score), CELL)
        for c, ph in enumerate(phases):
            fr = mesh_walk(still, ph, name)
            atlas.paste(fr, (c * CELL, r * CELL), fr)
            if name == "right":
                right_gif.append(fr)

    atlas.save(OUT_DIR / "walk-4x4.png")
    atlas.save(PUB)
    preview = []
    for im in right_gif:
        bg = Image.new("RGB", im.size, (255, 0, 255))
        bg.paste(im, mask=im.split()[-1])
        preview.append(bg.convert("P", palette=Image.Palette.ADAPTIVE))
    preview[0].save(
        OUT_DIR / "right-preview.gif",
        save_all=True,
        append_images=preview[1:],
        duration=110,
        loop=0,
        disposal=2,
    )
    print("wrote", PUB, atlas.size)


if __name__ == "__main__":
    main()
