"""
fetch_data.py — Download PubMed MEDLINE records for EndoInsights.

Uses the NCBI E-utilities API to search PubMed and save full MEDLINE records
to the data/ directory. Fetches two datasets:

  - data/all_endometriosis_studies.txt       ('endometriosis AND genes')
  - data/genetic_mechanisms_endometriosis_studies.txt  ('endometriosis AND genetic')

Credentials are loaded automatically from a .env file in the project root.
Copy .env.example to .env and fill in your values — never commit .env.

Usage:
    python fetch_data.py
    python fetch_data.py --email your@email.com   # overrides .env value
    python fetch_data.py --api-key <key>           # overrides .env value
"""

import argparse
import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()  # loads .env into os.environ if present

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
BATCH_SIZE = 500          # records per EFetch request (NCBI recommends ≤ 500)
REQUEST_DELAY = 0.34      # seconds between requests (~3/s without API key)
REQUEST_DELAY_WITH_KEY = 0.11  # ~10/s with API key

QUERIES = [
    {
        "term": "endometriosis AND genes",
        "output": "data/all_endometriosis_studies.txt",
    },
    {
        "term": "endometriosis AND genetic",
        "output": "data/genetic_mechanisms_endometriosis_studies.txt",
    },
]


# ---------------------------------------------------------------------------
# API helpers
# ---------------------------------------------------------------------------
def esearch(term: str, email: str, api_key: str | None) -> tuple[int, str, str]:
    """Run ESearch with usehistory=y. Returns (count, WebEnv, query_key)."""
    params = {
        "db": "pubmed",
        "term": term,
        "usehistory": "y",
        "retmode": "json",
        "email": email,
    }
    if api_key:
        params["api_key"] = api_key

    resp = requests.get(BASE_URL + "esearch.fcgi", params=params, timeout=30)
    resp.raise_for_status()
    data = resp.json()["esearchresult"]

    count = int(data["count"])
    web_env = data["webenv"]
    query_key = data["querykey"]
    return count, web_env, query_key


def efetch_batch(
    web_env: str,
    query_key: str,
    retstart: int,
    retmax: int,
    email: str,
    api_key: str | None,
) -> str:
    """Fetch one batch of MEDLINE records as plain text."""
    params = {
        "db": "pubmed",
        "query_key": query_key,
        "WebEnv": web_env,
        "retstart": retstart,
        "retmax": retmax,
        "rettype": "medline",
        "retmode": "text",
        "email": email,
    }
    if api_key:
        params["api_key"] = api_key

    resp = requests.get(BASE_URL + "efetch.fcgi", params=params, timeout=60)
    resp.raise_for_status()
    return resp.text


# ---------------------------------------------------------------------------
# Main fetch routine
# ---------------------------------------------------------------------------
def fetch_and_save(
    term: str,
    output_path: Path,
    email: str,
    api_key: str | None,
) -> None:
    delay = REQUEST_DELAY_WITH_KEY if api_key else REQUEST_DELAY

    print(f"\nSearching PubMed: '{term}'")
    count, web_env, query_key = esearch(term, email, api_key)
    print(f"  Found {count:,} records → {output_path}")
    time.sleep(delay)

    if count == 0:
        print("  No records found, skipping.")
        output_path.write_text("")
        return

    with output_path.open("w", encoding="utf-8") as fh:
        fetched = 0
        while fetched < count:
            batch_text = efetch_batch(
                web_env, query_key, fetched, BATCH_SIZE, email, api_key
            )
            fh.write(batch_text)
            fetched += BATCH_SIZE
            print(f"  Saved {min(fetched, count):,} / {count:,}", end="\r")
            time.sleep(delay)

    print(f"  Done. Saved {count:,} records to {output_path}          ")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
def main() -> None:
    parser = argparse.ArgumentParser(
        description="Fetch PubMed MEDLINE records for EndoInsights."
    )
    parser.add_argument(
        "--email",
        default=None,
        help="Your email address (NCBI recommends providing one). "
             "Defaults to NCBI_EMAIL in .env.",
    )
    parser.add_argument(
        "--api-key",
        default=None,
        help="NCBI API key (raises rate limit to 10 req/s). "
             "Defaults to NCBI_API_KEY in .env.",
    )
    args = parser.parse_args()

    # Fall back to .env values when CLI flags are not provided
    args.api_key = args.api_key or os.getenv("NCBI_API_KEY") or None
    args.email = args.email or os.getenv("NCBI_EMAIL") or "user@example.com"

    data_dir = Path(__file__).parent / "data"
    data_dir.mkdir(exist_ok=True)

    for query in QUERIES:
        output_path = Path(__file__).parent / query["output"]
        fetch_and_save(query["term"], output_path, args.email, args.api_key)

    print("\nAll done. Data files written to data/")


if __name__ == "__main__":
    main()
