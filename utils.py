import pandas as pd
from Bio import Medline


def parse_medline_file(file_path: str):
    """Return MEDLINE records from a text file."""
    with open(file_path, "r") as handle:
        return list(Medline.parse(handle))


def extract_publication_details(records):
    """Return a list of publication detail dicts for the given records."""
    details = []
    for record in records:
        title = record.get("TI", "No title")
        authors = ", ".join(record.get("AU", ["No authors"]))
        year = record.get("DP", "No date").split(" ")[0]
        details.append({"Title": title, "Authors": authors, "Year": year})
    return details


def extract_publication_years(details):
    """Return the publication years extracted from detail dictionaries."""
    return [detail["Year"] for detail in details]


def count_publications_per_year(years):
    """Return counts of publications per year as a pandas Series."""
    years = pd.Series(years)
    years = pd.to_numeric(years, errors="coerce").dropna().astype(int)
    years = years[years <= 2023]
    year_range = range(years.min(), years.max() + 1)
    return years.value_counts().reindex(year_range, fill_value=0).sort_index()


def add_labels(ax, counts, label_interval=20, final_year=2023):
    """Label a matplotlib Axes with cumulative totals at specified intervals."""
    for year in range(counts.index.min(), final_year + 1, label_interval):
        total = counts.loc[:year].sum()
        ax.text(year, counts.loc[year], f"{total}", fontsize=10, ha="center", va="bottom")
    final_total = counts.loc[:final_year].sum()
    ax.text(final_year, counts.loc[final_year], f"{final_total}", fontsize=10, ha="center", va="bottom")
