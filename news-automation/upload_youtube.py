import os
from typing import Dict

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload


def upload_to_youtube(video_path: str, script: Dict) -> str:
    creds = Credentials(
        token=None,
        refresh_token=os.environ["YOUTUBE_REFRESH_TOKEN"],
        client_id=os.environ["YOUTUBE_CLIENT_ID"],
        client_secret=os.environ["YOUTUBE_CLIENT_SECRET"],
        token_uri="https://oauth2.googleapis.com/token",
        scopes=["https://www.googleapis.com/auth/youtube.upload"],
    )
    creds.refresh(Request())

    youtube = build("youtube", "v3", credentials=creds)

    date = script["date"]
    title = f"【毎日ニュース】{date}の重要ニュース5選"

    desc_lines = [f"📰 {date}の重要ニュース5選\n"]
    for i, article in enumerate(script["articles"], 1):
        desc_lines.append(f"{i}. 【{article['category']}】{article['title']}")
    desc_lines.append(
        "\n毎日7時頃に公開。AI（Claude）が厳選した国内・テクノロジー・経済・海外の最新ニュースを分かりやすく解説します。\n"
        "\n#ニュース #ニュース要約 #最新ニュース #テクノロジー #経済 #毎日更新"
    )

    media = MediaFileUpload(video_path, mimetype="video/mp4", chunksize=10 * 1024 * 1024, resumable=True)

    request = youtube.videos().insert(
        part="snippet,status",
        body={
            "snippet": {
                "title": title,
                "description": "\n".join(desc_lines),
                "tags": ["ニュース", "ニュース要約", "最新ニュース", "テクノロジー", "経済", "毎日更新", "AI"],
                "categoryId": "25",
                "defaultLanguage": "ja",
                "defaultAudioLanguage": "ja",
            },
            "status": {
                "privacyStatus": "public",
                "selfDeclaredMadeForKids": False,
            },
        },
        media_body=media,
    )

    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            pct = int(status.progress() * 100)
            print(f"  Upload progress: {pct}%")

    video_id = response["id"]
    print(f"  Uploaded: https://www.youtube.com/watch?v={video_id}")
    return video_id
