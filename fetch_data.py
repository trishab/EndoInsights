"""
fetch_data.py — Fetch annual PubMed publication counts for EndoInsights.

Uses the NCBI ESearch API to retrieve per-year article counts for four
queries, then saves the results as a CSV. Fast (seconds, not minutes)
because it retrieves counts only — not full MEDLINE records.

Output: data/publication_counts.csv
Columns: year, endo_all, endo_genetic, ipf_all, ipf_genetic

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CANONICAL SEARCH TERMS — established March 2026
These are the exact, documented queries used to build the dataset.
Do not change them without updating this header, the README, and
both analysis scripts so future researchers can reproduce the data.

  endo_all:     'endometriosis'
  endo_genetic: 'endometriosis AND (genes OR genetic)'
  ipf_all:      'idiopathic pulmonary fibrosis'
  ipf_genetic:  'idiopathic pulmonary fibrosis AND (genes OR genetic)'

Baseline cumulative totals fetched March 2026 (1930–2024):
  endo_all     = 40,289    endo_genetic = 6,127
  ipf_all      = 18,768    ipf_genetic  = 4,020
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Credentials are loaded automatically from a .env file in the project root.
Copy .env.example to .env and fill in your values — never commit .env.

Usage:
    python fetch_data.py                           # full range (1930–2024)
    python fetch_data.py --start 2020 --end 2024   # test with a small range
    python fetch_data.py --email your@email.com --api-key <key>
"""

import argparse
import csv
import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
REQUEST_DELAY = 0.34        # ~3 req/s without API key
REQUEST_DELAY_WITH_KEY = 0.11   # ~10 req/s with API key

DEFAULT_START = 1930
DEFAULT_END   = 2024

QUERIES = {
    "endo_all":     "endometriosis",
    "endo_genetic": "endometriosis AND (genes OR genetic)",
    "ipf_all":      "idiopathic pulmonary fibrosis",
    "ipf_genetic":  "idiopathic pulmonary fibrosis AND (genes OR genetic)",
}

OUTPUT_FILE = Path(__file__).parent / "data" / "publication_counts.csv"


# ---------------------------------------------------------------------------
# API helper
# ---------------------------------------------------------------------------
def get_count(term: str, year: int, email: str, api_key: str | None) -> int:
    """Return the number of PubMed articles matching term in the given year."""
    params = {
        "db": "pubmed",
        "term": term,
        "datetype": "pdat",
        "mindate": str(year),
        "maxdate": str(year),
        "retmode": "json",
        "retmax": 0,
        "email": email,
    }
    if api_key:
        params["api_key"] = api_key

    resp = requests.get(BASE_URL, params=params, timeout=30)
    resp.raise_for_status()
    return int(resp.json()["esearchresult"]["count"])


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
def main() -> None:
    parser = argparse.ArgumentParser(
        description="Fetch annual PubMed publication counts for EndoInsights."
    )
    parser.add_argument("--start", type=int, default=DEFAULT_START,
                        help=f"First year to fetch (default: {DEFAULT_START}).")
    parser.add_argument("--end",   type=int, default=DEFAULT_END,
                        help=f"Last year to fetch (default: {DEFAULT_END}).")
    parser.add_argument("--email",   default=None)
    parser.add_argument("--api-key", default=None)
    args = parser.parse_args()

    api_key = args.api_key or os.getenv("NCBI_API_KEY") or None
    email   = args.email   or os.getenv("NCBI_EMAIL")   or "user@example.com"
    delay   = REQUEST_DELAY_WITH_KEY if api_key else REQUEST_DELAY

    OUTPUT_FILE.parent.mkdir(exist_ok=True)
    years = list(range(args.start, args.end + 1))
    total_steps = len(years) * len(QUERIES)
    step = 0

    print(f"Fetching counts for {len(years)} years ({args.start}–{args.end}) × {len(QUERIES)} queries")
    print(f"Queries:")
    for col, term in QUERIES.items():
        print(f"  {col}: '{term}'")
    print()

    rows = []
    skipped = []

    for year in years:
        row = {"year": year}
        year_ok = True

        for col, term in QUERIES.items():
            step += 1
            pct = step / total_steps * 100
            print(f"  [{pct:5.1f}%] {year} / {col} ...", end="\r")

            try:
                count = get_count(term, year, email, api_key)
                row[col] = count
            except Exception as e:
                print(f"\n  WARNING: {year}/{col} failed ({e}) — recording 0 and continuing.")
                row[col] = 0
                year_ok = False

            time.sleep(delay)

        rows.append(row)
        status = "" if year_ok else " (partial)"
        print(f"  {year}{status}: endo_all={row['endo_all']:>5,}  "
              f"endo_genetic={row['endo_genetic']:>4,}  "
              f"ipf_all={row['ipf_all']:>5,}  "
              f"ipf_genetic={row['ipf_genetic']:>4,}")

        if not year_ok:
            skipped.append(year)

    # Write CSV
    fieldnames = ["year", "endo_all", "endo_genetic", "ipf_all", "ipf_genetic"]
    with OUTPUT_FILE.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    # Summary
    print(f"\n{'='*60}")
    print(f"Saved {len(rows)} rows to {OUTPUT_FILE}")
    if skipped:
        print(f"Years with partial data (errors): {skipped}")

    # Cumulative totals for verification
    print(f"\nCumulative totals ({args.start}–{args.end}):")
    for col in fieldnames[1:]:
        total = sum(r[col] for r in rows)
        print(f"  {col:20s}: {total:,}")


if __name__ == "__main__":
    main()
