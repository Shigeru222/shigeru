"""
YouTube OAuth 初回セットアップ（ローカルで一度だけ実行）

1. Google Cloud Console でプロジェクトを作成
2. YouTube Data API v3 を有効化
3. OAuth 2.0 クライアント ID (デスクトップアプリ) を作成
4. client_secrets.json をダウンロードしてこのスクリプトと同じ場所に置く
5. このスクリプトを実行
6. 表示された3つの値を GitHub Secrets に設定

GitHub Secrets に設定するキー:
  ANTHROPIC_API_KEY
  YOUTUBE_CLIENT_ID
  YOUTUBE_CLIENT_SECRET
  YOUTUBE_REFRESH_TOKEN
"""

import os
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

flow = InstalledAppFlow.from_client_secrets_file("client_secrets.json", scopes=SCOPES)
creds = flow.run_local_server(port=0)

print("\n" + "=" * 50)
print("GitHub Secrets に以下を設定してください:")
print("=" * 50)
print(f"YOUTUBE_CLIENT_ID={creds.client_id}")
print(f"YOUTUBE_CLIENT_SECRET={creds.client_secret}")
print(f"YOUTUBE_REFRESH_TOKEN={creds.refresh_token}")
print("=" * 50)
