import pandas as pd
from Bio import Medline
import matplotlib.pyplot as plt

# File paths to your data files
genetic_mechanisms_endo_file = "/Users/trishablack/genetic_mechanisms_endometriosis_studies.txt"
all_endometriosis_file = "/Users/trishablack/all_endometriosis_studies.txt"
genetic_mechanisms_ipf_file = "/Users/trishablack/genetic_mechanisms_IPF_studies.txt"
all_ipf_file = "/Users/trishablack/all_ipf_studies.txt"

def parse_medline_file(file_path):
    with open(file_path, 'r') as handle:
        records = Medline.parse(handle)
        records = list(records)
    return records

def extract_publication_details(records):
    details = []
    for record in records:
        title = record.get('TI', 'No title')
        authors = ', '.join(record.get('AU', ['No authors']))
        year = record.get('DP', 'No date').split(" ")[0]
        details.append({'Title': title, 'Authors': authors, 'Year': year})
    return details

def extract_publication_years(details):
    years = [detail['Year'] for detail in details]
    return years

def count_publications_per_year(years):
    years = pd.Series(years)
    years = pd.to_numeric(years, errors='coerce').dropna().astype(int)
    years = years[years <= 2023]
    year_range = range(years.min(), years.max() + 1)
    year_counts = years.value_counts().reindex(year_range, fill_value=0).sort_index()
    return year_counts

def add_labels(ax, counts, label_interval=20, final_year=2023):
    for year in range(counts.index.min(), final_year + 1, label_interval):
        total = counts.loc[:year].sum()
        ax.text(year, counts.loc[year], f'{total}', fontsize=10, ha='center', va='bottom')
    final_total = counts.loc[:final_year].sum()
    ax.text(final_year, counts.loc[final_year], f'{final_total}', fontsize=10, ha='center', va='bottom')

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
