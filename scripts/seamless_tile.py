#!/usr/bin/env python3
"""Offset-blend a generated texture into a 512px seamless tile."""
from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image


def seamlessize(src: Path, dst: Path, size: int = 512, band: int = 48) -> None:
    im = Image.open(src).convert("RGB").resize((size, size), Image.Resampling.LANCZOS)
    arr = np.asarray(im).astype(np.float32)
    half = size // 2
    arr = np.roll(np.roll(arr, half, axis=0), half, axis=1)

    # Soft-blend the offset cross so the original seams disappear.
    yy = np.arange(size)
    xx = np.arange(size)
    wy = np.ones(size, dtype=np.float32)
    wx = np.ones(size, dtype=np.float32)
    for i in range(band):
        t = (i + 1) / band
        fade = 0.5 - 0.5 * np.cos(np.pi * t)
        wy[half - band + i] = fade
        wy[half + band - 1 - i] = fade
        wx[half - band + i] = fade
        wx[half + band - 1 - i] = fade
    # Rebuild from mirrored neighbors across the cross.
    out = arr.copy()
    for y in range(half - band, half + band):
        t = wy[y]
        src_y = (2 * half - y) % size
        out[y] = arr[y] * t + arr[src_y] * (1 - t)
    for x in range(half - band, half + band):
        t = wx[x]
        src_x = (2 * half - x) % size
        out[:, x] = out[:, x] * t + out[:, src_x] * (1 - t)

    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(dst, "PNG")


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--input", required=True)
    p.add_argument("--output", required=True)
    p.add_argument("--size", type=int, default=512)
    args = p.parse_args()
    dst = Path(args.output)
    dst.parent.mkdir(parents=True, exist_ok=True)
    seamlessize(Path(args.input), dst, size=args.size)


if __name__ == "__main__":
    main()
