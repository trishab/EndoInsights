import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path
from utils import (
    parse_medline_file,
    extract_publication_details,
    extract_publication_years,
    count_publications_per_year,
    add_labels,
)


def data_path(filename: str) -> Path:
    """Return the path to a data file located next to this script."""
    return Path(__file__).resolve().parent / filename

# File paths to your data files (relative to this script)
genetic_mechanisms_endo_file = data_path("genetic_mechanisms_endometriosis_studies.txt")
all_endometriosis_file = data_path("all_endometriosis_studies.txt")
genetic_mechanisms_ipf_file = data_path("genetic_mechanisms_ipf_studies.txt")
all_ipf_file = data_path("all_IPF_studies.txt")


# Parse the data
genetic_endo_records = parse_medline_file(genetic_mechanisms_endo_file)
all_endo_records = parse_medline_file(all_endometriosis_file)
genetic_ipf_records = parse_medline_file(genetic_mechanisms_ipf_file)
all_ipf_records = parse_medline_file(all_ipf_file)

# Extract publication details and years
genetic_endo_details = extract_publication_details(genetic_endo_records)
all_endo_details = extract_publication_details(all_endo_records)
genetic_ipf_details = extract_publication_details(genetic_ipf_records)
all_ipf_details = extract_publication_details(all_ipf_records)

genetic_endo_years = extract_publication_years(genetic_endo_details)
all_endo_years = extract_publication_years(all_endo_details)
genetic_ipf_years = extract_publication_years(genetic_ipf_details)
all_ipf_years = extract_publication_years(all_ipf_details)

# Count publications per year for all datasets
genetic_endo_counts = count_publications_per_year(genetic_endo_years)
all_endo_counts = count_publications_per_year(all_endo_years)
genetic_ipf_counts = count_publications_per_year(genetic_ipf_years)
all_ipf_counts = count_publications_per_year(all_ipf_years)

# Ensure the years align between the datasets
year_range = range(
    min(genetic_endo_counts.index.min(), all_endo_counts.index.min(), genetic_ipf_counts.index.min(), all_ipf_counts.index.min()),
    max(genetic_endo_counts.index.max(), all_endo_counts.index.max(), genetic_ipf_counts.index.max(), all_ipf_counts.index.max()) + 1
)

genetic_endo_counts = genetic_endo_counts.reindex(year_range, fill_value=0)
all_endo_counts = all_endo_counts.reindex(year_range, fill_value=0)
genetic_ipf_counts = genetic_ipf_counts.reindex(year_range, fill_value=0)
all_ipf_counts = all_ipf_counts.reindex(year_range, fill_value=0)

# Plot the data
plt.figure(figsize=(12, 8))
plt.plot(genetic_endo_counts.index, genetic_endo_counts.values, label='Genetic Mechanisms of Endometriosis')
plt.plot(all_endo_counts.index, all_endo_counts.values, label='All Endometriosis Studies', linestyle='--')
plt.plot(genetic_ipf_counts.index, genetic_ipf_counts.values, label='Genetic Mechanisms of IPF')
plt.plot(all_ipf_counts.index, all_ipf_counts.values, label='All IPF Studies', linestyle='--')

# Add labels every 20 years and at 2023
ax = plt.gca()
add_labels(ax, all_endo_counts, label_interval=20, final_year=2023)
add_labels(ax, genetic_endo_counts, label_interval=20, final_year=2023)
add_labels(ax, all_ipf_counts, label_interval=20, final_year=2023)
add_labels(ax, genetic_ipf_counts, label_interval=20, final_year=2023)

plt.xlabel('Year')
plt.ylabel('Number of Publications')
plt.title('PubMed Articles Related to Endometriosis and IPF')
plt.legend()
plt.grid(True)
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()
