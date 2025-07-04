import pandas as pd
import matplotlib.pyplot as plt
from utils import (
    parse_medline_file,
    extract_publication_details,
    extract_publication_years,
    count_publications_per_year,
    add_labels,
)

def main():
    # File paths to your data files
    genetic_mechanisms_file = "/Users/trishablack/genetic_mechanisms_endometriosis_studies.txt"
    all_endometriosis_file = "/Users/trishablack/all_endometriosis_studies.txt"

    # Parse the data
    genetic_records = parse_medline_file(genetic_mechanisms_file)
    all_records = parse_medline_file(all_endometriosis_file)

    # Extract publication details and years
    genetic_details = extract_publication_details(genetic_records)
    all_details = extract_publication_details(all_records)

    genetic_years = extract_publication_years(genetic_details)
    all_years = extract_publication_years(all_details)

    # Count publications per year for both datasets
    genetic_counts = count_publications_per_year(genetic_years)
    all_counts = count_publications_per_year(all_years)

    # Ensure the years align between the datasets
    year_range = range(
        min(genetic_counts.index.min(), all_counts.index.min()),
        max(genetic_counts.index.max(), all_counts.index.max()) + 1,
    )

    genetic_counts = genetic_counts.reindex(year_range, fill_value=0)
    all_counts = all_counts.reindex(year_range, fill_value=0)

    # Plot the data
    plt.figure(figsize=(12, 8))
    plt.plot(
        genetic_counts.index,
        genetic_counts.values,
        label="Genetic Mechanisms of Endometriosis",
    )
    plt.plot(
        all_counts.index,
        all_counts.values,
        label="All Endometriosis Studies",
        linestyle="--",
    )

    # Add labels every 20 years and at 2023
    ax = plt.gca()
    add_labels(ax, all_counts, label_interval=20, final_year=2023)
    add_labels(ax, genetic_counts, label_interval=20, final_year=2023)

    plt.xlabel("Year")
    plt.ylabel("Number of Publications")
    plt.title("PubMed Articles Related to Endometriosis")
    plt.legend()
    plt.grid(True)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    main()
