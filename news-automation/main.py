"""
毎日ニュース要約動画の生成・アップロード

Usage:
    python main.py              # generate and upload
    python main.py --no-upload  # generate only (save video to ./output/)
"""

import asyncio
import os
import shutil
import sys
import tempfile
from datetime import datetime

from fetch_news import fetch_news
from summarize import summarize_news
from generate_audio import generate_all_audio
from create_video import create_video
from upload_youtube import upload_to_youtube


async def run(upload: bool) -> None:
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Starting pipeline")

    # 1. Fetch
    print("\n[1/5] Fetching news from RSS feeds...")
    articles = fetch_news()
    if not articles:
        raise RuntimeError("No articles fetched. Check RSS feeds.")

    # 2. Summarize
    print("\n[2/5] Summarizing with Claude...")
    script = summarize_news(articles)
    print(f"  Selected {len(script['articles'])} articles for {script['date']}")

    with tempfile.TemporaryDirectory() as tmpdir:
        # 3. Audio
        print("\n[3/5] Generating audio narration...")
        audio_dir = os.path.join(tmpdir, "audio")
        audio_files = await generate_all_audio(script, audio_dir)
        print(f"  Generated {len(audio_files)} audio clips")

        # 4. Video
        print("\n[4/5] Compositing video...")
        video_path = create_video(script, audio_files, tmpdir)

        if not upload:
            os.makedirs("output", exist_ok=True)
            dest = os.path.join("output", "news_video.mp4")
            shutil.copy(video_path, dest)
            print(f"\n[5/5] Upload skipped. Video saved to: {dest}")
            return

        # 5. Upload
        print("\n[5/5] Uploading to YouTube...")
        video_id = upload_to_youtube(video_path, script)

    print(f"\nDone! https://www.youtube.com/watch?v={video_id}")


if __name__ == "__main__":
    no_upload = "--no-upload" in sys.argv
    asyncio.run(run(upload=not no_upload))
