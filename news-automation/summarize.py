import json
import anthropic
from datetime import datetime
from typing import List, Dict


def summarize_news(articles: List[Dict]) -> Dict:
    client = anthropic.Anthropic()
    today = datetime.now().strftime("%Y年%m月%d日")
    articles_json = json.dumps(articles, ensure_ascii=False, indent=2)

    prompt = f"""あなたはニュース解説動画のナレーターです。
以下のニュース記事から最も重要な5本を選び、YouTube動画用の台本をJSON形式で作成してください。

今日の日付: {today}

ニュース記事一覧:
{articles_json}

必ず以下のJSON形式のみで回答してください（他の文字を含めないこと）:
{{
    "date": "{today}",
    "intro_script": "視聴者へのあいさつと本日5つのトピックの予告（約20秒、自然な話し言葉で）",
    "articles": [
        {{
            "category": "カテゴリ名",
            "title": "ニュースの見出し（30文字以内）",
            "summary_script": "このニュースの解説ナレーション（約30〜40秒、平易な言葉で。Financial Timesの記事は日本語に翻訳して）",
            "key_points": ["端的なポイント（20文字以内）", "端的なポイント（20文字以内）", "端的なポイント（20文字以内）"]
        }}
    ],
    "outro_script": "まとめと締めの言葉、チャンネル登録の呼びかけ（約15秒）"
}}

注意:
- articlesは必ず5件選ぶ
- ナレーションは視聴者に話しかける自然な話し言葉
- 専門用語は平易な言葉に置き換える
- key_pointsは各記事に3つ"""

    response = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    content = response.content[0].text.strip()
    start = content.find("{")
    end = content.rfind("}") + 1
    return json.loads(content[start:end])
