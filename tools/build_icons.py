"""Build crisp nearest-neighbor Pixel WebAPK icons. Stdlib only."""
import math
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "icons"

SKY = (36, 28, 84, 255)
SKY_B = (54, 96, 176, 255)
NIGHT = (18, 16, 52, 255)
MOON = (255, 236, 186, 255)
GOLD = (255, 204, 84, 255)
GOLD_D = (214, 132, 42, 255)
STALK = (24, 112, 58, 255)
STALK_L = (118, 196, 86, 255)
LEAF = (52, 168, 74, 255)
LEAF_D = (24, 112, 58, 255)
GRASS = (42, 138, 62, 255)
GRASS_D = (28, 104, 48, 255)
CREAM = (244, 224, 190, 255)
WOOD = (104, 64, 34, 255)
ROOF = (176, 64, 52, 255)
ROOF_D = (128, 42, 40, 255)
BRICK = (132, 58, 48, 255)
WHITE = (248, 246, 255, 255)
INK = (16, 10, 28, 255)
BEAN = (255, 214, 96, 255)
STAR = (255, 244, 210, 255)
PAD = (26, 16, 60, 255)


def blank(w, h, color):
    return [[color for _ in range(w)] for _ in range(h)]


def put(grid, x, y, color):
    if 0 <= y < len(grid) and 0 <= x < len(grid[0]):
        grid[y][x] = color


def rect(grid, x, y, w, h, color):
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            put(grid, xx, yy, color)


def disc(grid, cx, cy, r, color):
    r2 = r * r
    for y in range(cy - r, cy + r + 1):
        for x in range(cx - r, cx + r + 1):
            if (x - cx) ** 2 + (y - cy) ** 2 <= r2:
                put(grid, x, y, color)


def scene(n=32):
    g = blank(n, n, SKY)
    for y in range(n):
        for x in range(n):
            t = y / (n - 1)
            if t < 0.62:
                if (x + y) % 5 == 0 and t > 0.2:
                    g[y][x] = SKY_B
                elif y < int(n * 0.34):
                    g[y][x] = NIGHT if (x * 3 + y) % 7 == 0 else SKY
                else:
                    g[y][x] = SKY if (x + y) % 2 == 0 else SKY_B
            else:
                g[y][x] = GRASS if (x + y) % 2 == 0 else GRASS_D

    for sx, sy in ((4, 4), (11, 7), (27, 5), (20, 3)):
        if sx < n and sy < n:
            g[sy][sx] = STAR

    disc(g, int(n * 0.75), int(n * 0.20), max(2, n // 10), MOON)
    put(g, int(n * 0.75) - 1, int(n * 0.20) - 1, WHITE)

    ground = int(n * 0.72)
    # Cottage
    cx, cy = int(n * 0.08), ground - int(n * 0.30)
    cw, ch = int(n * 0.30), int(n * 0.30)
    rect(g, cx, cy, cw, ch, CREAM)
    rect(g, cx, cy, cw, 1, WOOD)
    rect(g, cx, cy + ch // 2, cw, 1, WOOD)
    rect(g, cx, cy, 1, ch, WOOD)
    rect(g, cx + cw - 1, cy, 1, ch, WOOD)
    roof_h = max(3, n // 10)
    for i in range(roof_h):
        rect(g, cx - 1 + i, cy - roof_h + i, cw + 2 - i * 2, 1, ROOF if i % 2 == 0 else ROOF_D)
    chim_x = cx + cw - max(3, n // 12)
    rect(g, chim_x, cy - roof_h - max(2, n // 16), max(2, n // 16), roof_h + max(2, n // 16), BRICK)
    rect(g, cx + 2, cy + ch // 3, max(2, n // 14), max(2, n // 16), SKY_B)
    rect(g, cx + cw // 2 - 1, cy + ch // 2, max(2, n // 14), ch // 2, WOOD)

    # Spiraling beanstalk
    base_x = int(n * 0.46)
    top = int(n * 0.08)
    for i, y in enumerate(range(ground, top, -1)):
        wave = int(math.sin(i * 0.45) * (n * 0.10))
        x = base_x + wave
        put(g, x, y, STALK)
        put(g, x + 1, y, STALK_L)
        put(g, x + 2, y, STALK)
        if i % max(4, n // 8) == 0:
            direction = 1 if (i // max(4, n // 8)) % 2 == 0 else -1
            rect(g, x + 2 * direction, y, max(2, n // 14), 2, LEAF)
            put(g, x + 3 * direction, y - 1, LEAF_D)

    # Magic beans
    bx, by = int(n * 0.78), ground - max(3, n // 12)
    for ox in (0, max(3, n // 10)):
        disc(g, bx + ox, by, max(1, n // 18), BEAN)
        put(g, bx + ox, by, GOLD)
        put(g, bx + ox - 1, by, GOLD_D)

    return g


def scale(grid, factor):
    h, w = len(grid), len(grid[0])
    out = blank(w * factor, h * factor, grid[0][0])
    for y in range(h):
        for x in range(w):
            color = grid[y][x]
            for yy in range(factor):
                for xx in range(factor):
                    out[y * factor + yy][x * factor + xx] = color
    return out


def center_on(grid, size, pad_color):
    canvas = blank(size, size, pad_color)
    h, w = len(grid), len(grid[0])
    ox = (size - w) // 2
    oy = (size - h) // 2
    for y in range(h):
        for x in range(w):
            canvas[oy + y][ox + x] = grid[y][x]
    return canvas


def png_bytes(grid):
    h, w = len(grid), len(grid[0])
    raw = bytearray()
    for row in grid:
        raw.append(0)
        for r, g, b, a in row:
            raw.extend((r, g, b, a))

    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + chunk(b"IEND", b"")


def svg_text(grid):
    h, w = len(grid), len(grid[0])
    parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" shape-rendering="crispEdges">',
    ]
    y = 0
    while y < h:
        x = 0
        row = grid[y]
        while x < w:
            color = row[x]
            x2 = x + 1
            while x2 < w and row[x2] == color:
                x2 += 1
            y2 = y + 1
            same = True
            while same and y2 < h:
                for xx in range(x, x2):
                    if grid[y2][xx] != color:
                        same = False
                        break
                if same:
                    y2 += 1
            if color[3] == 0:
                x = x2
                continue
            hex_color = "#{:02X}{:02X}{:02X}".format(color[0], color[1], color[2])
            parts.append(
                f'<rect x="{x}" y="{y}" width="{x2 - x}" height="{y2 - y}" fill="{hex_color}"/>'
            )
            for yy in range(y, y2):
                for xx in range(x, x2):
                    grid[yy][xx] = (0, 0, 0, 0)
            x = x2
        y += 1
    parts.append("</svg>")
    return "\n".join(parts) + "\n"


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    base = scene(32)
    any_192 = scale(base, 6)
    any_512 = scale(base, 16)
    # Maskable keeps the diorama inside the Android safe zone.
    sticker = scale(base, 12)  # 384
    mask_512 = center_on(sticker, 512, PAD)
    mask_192 = center_on(scale(base, 4), 192, PAD)  # 128 art, 32px pad each side
    files = {
        "icon-192.png": any_192,
        "icon-512.png": any_512,
        "icon-maskable-192.png": mask_192,
        "icon-maskable-512.png": mask_512,
    }
    for name, grid in files.items():
        data = png_bytes(grid)
        (OUT / name).write_bytes(data)
        print(f"{name} {len(grid[0])}x{len(grid)} {len(data)} bytes")
    svg = svg_text([row[:] for row in base])
    (OUT / "icon.svg").write_text(svg, encoding="utf-8")
    print(f"icon.svg {len(svg)} chars")


if __name__ == "__main__":
    main()
