from __future__ import annotations

from typing import Optional
import re
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from pydantic import BaseModel


class ScrapeResult(BaseModel):
    url: str
    title: str
    description: str
    text: str
    headings: list[str]
    links: list[str]
    success: bool
    error: Optional[str] = None

USER_AGENT = (
    "Mozilla/5.0 (compatible; Sightline/1.0; +https://github.com/sightline)"
)


async def scrape_url(url: str) -> ScrapeResult:
    """Fetch and extract text from a public website."""
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"

    try:
        async with httpx.AsyncClient(
            timeout=15.0,
            follow_redirects=True,
            headers={"User-Agent": USER_AGENT},
        ) as client:
            response = await client.get(url)
            response.raise_for_status()
            html = response.text
    except Exception as e:
        return ScrapeResult(
            url=url,
            title="",
            description="",
            text="",
            headings=[],
            links=[],
            success=False,
            error=str(e),
        )

    soup = BeautifulSoup(html, "lxml")

    for tag in soup(["script", "style", "nav", "footer", "noscript"]):
        tag.decompose()

    title = soup.title.string.strip() if soup.title and soup.title.string else ""
    meta_desc = soup.find("meta", attrs={"name": "description"})
    description = meta_desc["content"].strip() if meta_desc and meta_desc.get("content") else ""

    headings = [
        h.get_text(strip=True)
        for h in soup.find_all(["h1", "h2", "h3"])
        if h.get_text(strip=True)
    ][:20]

    links = list(
        {
            href
            for a in soup.find_all("a", href=True)
            if (href := a["href"]).startswith("http")
        }
    )[:30]

    text = re.sub(r"\s+", " ", soup.get_text(separator=" ", strip=True))[:12000]

    return ScrapeResult(
        url=url,
        title=title,
        description=description,
        text=text,
        headings=headings,
        links=links,
        success=True,
    )


def extract_domain_name(url: str) -> str:
    parsed = urlparse(url if "://" in url else f"https://{url}")
    host = parsed.netloc or parsed.path
    host = host.replace("www.", "")
    name = host.split(".")[0]
    return name.replace("-", " ").title()
