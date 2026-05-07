import re
import feedparser
from datetime import datetime, timezone, timedelta
from typing import List, Dict

RSS_FEEDS = {
    "国内ニュース": [
        "https://www3.nhk.or.jp/rss/news/cat0.xml",
        "https://www3.nhk.or.jp/rss/news/cat1.xml",
    ],
    "テクノロジー": [
        "https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml",
        "https://gigazine.net/news/rss_2.0/",
    ],
    "経済・ビジネス": [
        "https://toyokeizai.net/list/feed/rss",
        "https://diamond.jp/feed/index.rss",
    ],
    "Financial Times": [
        "https://www.ft.com/?format=rss",
    ],
}


def _strip_html(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text or "").strip()


def fetch_news(max_per_category: int = 4) -> List[Dict]:
    articles = []
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)

    for category, feeds in RSS_FEEDS.items():
        count = 0
        for feed_url in feeds:
            if count >= max_per_category:
                break
            try:
                feed = feedparser.parse(feed_url, request_headers={"User-Agent": "Mozilla/5.0"})
                for entry in feed.entries:
                    if count >= max_per_category:
                        break
                    published = getattr(entry, "published_parsed", None)
                    if published:
                        pub_dt = datetime(*published[:6], tzinfo=timezone.utc)
                        if pub_dt < cutoff:
                            continue
                    summary = _strip_html(entry.get("summary", entry.get("description", "")))
                    articles.append({
                        "category": category,
                        "title": _strip_html(entry.get("title", "")),
                        "summary": summary[:500],
                        "link": entry.get("link", ""),
                        "published": entry.get("published", ""),
                    })
                    count += 1
            except Exception as e:
                print(f"Warning: could not fetch {feed_url}: {e}")

    print(f"Fetched {len(articles)} articles total")
    return articles
