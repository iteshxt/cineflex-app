"""Rasterise the Cineflex mark (same geometry as src/app/icon.svg) into PNG/ICO icons.

Run: python3 scripts/generate-icons.py
"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
ACCENT = (242, 184, 75, 255)
INK = (9, 9, 11, 255)
BG = (9, 9, 11, 255)


def _rounded_triangle(d, pts, r, fill):
    d.polygon(pts, fill=fill)
    d.line(pts + [pts[0]], fill=fill, width=round(r * 2), joint="curve")
    for x, y in pts:
        d.ellipse([x - r, y - r, x + r, y + r], fill=fill)


def mark(size: int, *, maskable: bool = False) -> Image.Image:
    """Draw at 8x then downsample. Same geometry as src/app/icon.svg: a dark tile with a
    play triangle and a faded echo behind it, separated by a gap. Maskable icons are
    full-bleed with the glyph inside the 80% safe zone."""
    s = size * 8
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if maskable:
        d.rectangle([0, 0, s, s], fill=BG)
        scale, off = s / 32 * 0.72, s * 0.14
    else:
        d.rounded_rectangle([0, 0, s - 1, s - 1], radius=s * 8 / 32, fill=BG)
        scale, off = s / 32, 0

    def tri(x0, grow=0.0):
        p = lambda x, y: (off + x * scale, off + y * scale)
        return [p(x0 - grow, 9 - grow), p(x0 - grow, 23 + grow), p(x0 + 12.2 + grow * 0.8, 16)]

    r = 1.6 * scale
    back = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    _rounded_triangle(ImageDraw.Draw(back), tri(6.15), r, ACCENT[:3] + (110,))
    gap = Image.new("L", (s, s), 0)
    _rounded_triangle(ImageDraw.Draw(gap), tri(13.65, 1.6), r, 255)
    back.putalpha(Image.composite(Image.new("L", (s, s), 0), back.getchannel("A"), gap))
    img.alpha_composite(back)
    front = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    _rounded_triangle(ImageDraw.Draw(front), tri(13.65), r, ACCENT)
    img.alpha_composite(front)
    return img.resize((size, size), Image.LANCZOS)


def main():
    app, public = ROOT / "src/app", ROOT / "public"
    mark(180).save(app / "apple-icon.png")
    mark(192).save(public / "icon-192.png")
    mark(512).save(public / "icon-512.png")
    mark(512, maskable=True).save(public / "icon-maskable-512.png")
    mark(48).save(app / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    print("icons written")


if __name__ == "__main__":
    main()
