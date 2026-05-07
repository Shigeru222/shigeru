import asyncio
import os
import edge_tts
from typing import Dict

VOICE = "ja-JP-NanamiNeural"
RATE = "+5%"


async def _tts(text: str, path: str) -> None:
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
    await communicate.save(path)


async def generate_all_audio(script: Dict, output_dir: str) -> Dict[str, str]:
    os.makedirs(output_dir, exist_ok=True)
    audio_files: Dict[str, str] = {}

    tasks = []

    intro_path = os.path.join(output_dir, "intro.mp3")
    tasks.append(("intro", intro_path, script["intro_script"]))

    for i, article in enumerate(script["articles"]):
        path = os.path.join(output_dir, f"article_{i}.mp3")
        tasks.append((f"article_{i}", path, article["summary_script"]))

    outro_path = os.path.join(output_dir, "outro.mp3")
    tasks.append(("outro", outro_path, script["outro_script"]))

    await asyncio.gather(*[_tts(text, path) for _, path, text in tasks])

    for key, path, _ in tasks:
        audio_files[key] = path

    return audio_files
