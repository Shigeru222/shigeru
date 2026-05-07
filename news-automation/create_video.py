import os
import subprocess
from PIL import Image, ImageDraw, ImageFont
from typing import Dict, List, Tuple

WIDTH, HEIGHT = 1920, 1080

BG_DARK = (12, 18, 38)
BG_CARD = (20, 28, 55)
WHITE = (255, 255, 255)
LIGHT_BLUE = (180, 210, 255)
GRAY = (120, 140, 180)

CATEGORY_COLORS: Dict[str, Tuple[int, int, int]] = {
    "国内ニュース": (220, 60, 60),
    "テクノロジー": (50, 140, 220),
    "経済・ビジネス": (50, 190, 110),
    "Financial Times": (210, 165, 20),
}
DEFAULT_CAT_COLOR = (130, 100, 200)

FONT_CANDIDATES = [
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/noto-cjk/NotoSansCJKjp-Regular.otf",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
    "/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc",
]


def _font(size: int) -> ImageFont.FreeTypeFont:
    for path in FONT_CANDIDATES:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


def _wrap_text(text: str, max_chars: int) -> List[str]:
    """Wrap text for CJK (no space boundaries)."""
    lines = []
    while len(text) > max_chars:
        lines.append(text[:max_chars])
        text = text[max_chars:]
    if text:
        lines.append(text)
    return lines


def _draw_background(draw: ImageDraw.ImageDraw) -> None:
    for y in range(HEIGHT):
        ratio = y / HEIGHT
        r = int(BG_DARK[0] + ratio * 8)
        g = int(BG_DARK[1] + ratio * 8)
        b = int(BG_DARK[2] + ratio * 15)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))


def create_title_card(date: str, output_path: str) -> None:
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_DARK)
    draw = ImageDraw.Draw(img)
    _draw_background(draw)

    # Center band
    band_h = 200
    band_y = HEIGHT // 2 - band_h // 2
    draw.rectangle([0, band_y, WIDTH, band_y + band_h], fill=(30, 50, 110))

    # Accent lines
    draw.rectangle([0, band_y, WIDTH, band_y + 4], fill=(60, 120, 255))
    draw.rectangle([0, band_y + band_h - 4, WIDTH, band_y + band_h], fill=(60, 120, 255))

    f_title = _font(88)
    f_date = _font(52)

    title = "今日のニュース要約"
    bbox = draw.textbbox((0, 0), title, font=f_title)
    tw = bbox[2] - bbox[0]
    draw.text(((WIDTH - tw) // 2, band_y + 20), title, font=f_title, fill=WHITE)

    bbox = draw.textbbox((0, 0), date, font=f_date)
    dw = bbox[2] - bbox[0]
    draw.text(((WIDTH - dw) // 2, band_y + 120), date, font=f_date, fill=LIGHT_BLUE)

    # Bottom tagline
    f_small = _font(36)
    tag = "AI が厳選する毎日5本のニュース"
    bbox = draw.textbbox((0, 0), tag, font=f_small)
    tw = bbox[2] - bbox[0]
    draw.text(((WIDTH - tw) // 2, HEIGHT - 80), tag, font=f_small, fill=GRAY)

    img.save(output_path, quality=95)


def create_article_card(
    title: str,
    category: str,
    key_points: List[str],
    index: int,
    total: int,
    output_path: str,
) -> None:
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_DARK)
    draw = ImageDraw.Draw(img)
    _draw_background(draw)

    cat_color = CATEGORY_COLORS.get(category, DEFAULT_CAT_COLOR)

    # Top category bar
    draw.rectangle([0, 0, WIDTH, 100], fill=cat_color)

    f_cat = _font(42)
    f_index = _font(38)
    f_title = _font(64)
    f_point = _font(46)
    f_label = _font(36)

    draw.text((40, 28), f"  {category}", font=f_cat, fill=WHITE)
    idx_text = f"{index} / {total}"
    bbox = draw.textbbox((0, 0), idx_text, font=f_index)
    draw.text((WIDTH - bbox[2] - bbox[0] - 50, 32), idx_text, font=f_index, fill=WHITE)

    # Title section
    y = 130
    for line in _wrap_text(title, 26)[:2]:
        draw.text((60, y), line, font=f_title, fill=WHITE)
        y += 80

    # Separator
    y += 20
    draw.rectangle([60, y, WIDTH - 60, y + 3], fill=(*cat_color, 180))
    y += 30

    # Key points
    draw.text((60, y), "▼ ポイント", font=f_label, fill=GRAY)
    y += 50

    for point in key_points[:3]:
        bullet = f"◆  {point}"
        for line in _wrap_text(bullet, 36)[:2]:
            draw.text((80, y), line, font=f_point, fill=LIGHT_BLUE)
            y += 58
        y += 8

    # Bottom bar
    draw.rectangle([0, HEIGHT - 56, WIDTH, HEIGHT], fill=(10, 14, 28))
    draw.text((40, HEIGHT - 44), "チャンネル登録よろしくお願いします！  |  毎日更新", font=f_label, fill=GRAY)

    img.save(output_path, quality=95)


def _audio_duration(audio_path: str) -> float:
    result = subprocess.run(
        [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            audio_path,
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    return float(result.stdout.strip())


def _make_segment(img_path: str, audio_path: str, out_path: str) -> None:
    subprocess.run(
        [
            "ffmpeg", "-y",
            "-loop", "1", "-i", img_path,
            "-i", audio_path,
            "-c:v", "libx264", "-tune", "stillimage", "-preset", "fast",
            "-crf", "20", "-profile:v", "high",
            "-c:a", "aac", "-b:a", "128k",
            "-pix_fmt", "yuv420p",
            "-shortest",
            out_path,
        ],
        check=True,
        capture_output=True,
    )


def create_video(script: Dict, audio_files: Dict[str, str], output_dir: str) -> str:
    images_dir = os.path.join(output_dir, "images")
    os.makedirs(images_dir, exist_ok=True)

    date = script["date"]
    articles = script["articles"]
    total = len(articles)

    # Create still images
    title_img = os.path.join(images_dir, "title.png")
    create_title_card(date, title_img)
    print("  Created title card")

    for i, article in enumerate(articles):
        card_img = os.path.join(images_dir, f"article_{i}.png")
        create_article_card(
            article["title"],
            article["category"],
            article["key_points"],
            i + 1,
            total,
            card_img,
        )
    print(f"  Created {total} article cards")

    # Build segment list: (image, audio)
    segments = [
        (title_img, audio_files["intro"]),
        *[(os.path.join(images_dir, f"article_{i}.png"), audio_files[f"article_{i}"]) for i in range(total)],
        (title_img, audio_files["outro"]),
    ]

    # Render each segment to a temp video
    seg_videos: List[str] = []
    for i, (img_path, audio_path) in enumerate(segments):
        seg_out = os.path.join(output_dir, f"seg_{i}.mp4")
        _make_segment(img_path, audio_path, seg_out)
        seg_videos.append(seg_out)
    print(f"  Rendered {len(seg_videos)} segments")

    # Concatenate
    concat_list = os.path.join(output_dir, "concat.txt")
    with open(concat_list, "w") as f:
        for path in seg_videos:
            f.write(f"file '{path}'\n")

    output_video = os.path.join(output_dir, "news_video.mp4")
    subprocess.run(
        ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_list, "-c", "copy", output_video],
        check=True,
        capture_output=True,
    )
    print(f"  Final video: {output_video}")
    return output_video
