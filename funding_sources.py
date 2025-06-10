import argparse
import pandas as pd
from Bio import Medline
import matplotlib.pyplot as plt
from config import FILE_PATHS

# Command line arguments override config defaults
parser = argparse.ArgumentParser(description="Analyze funding sources")
parser.add_argument(
    "--genetic_mechanisms_file",
    default=FILE_PATHS["genetic_mechanisms_file"],
    help="Path to genetic mechanisms endometriosis file",
)
parser.add_argument(
    "--all_endometriosis_file",
    default=FILE_PATHS["all_endometriosis_file"],
    help="Path to all endometriosis studies file",
)
args = parser.parse_args()

genetic_mechanisms_file = args.genetic_mechanisms_file
all_endometriosis_file = args.all_endometriosis_file

# Define the funding categories
funding_categories = {
    'NIH': 'Government',
    'NSF': 'Government',
    'FDA': 'Government',
    'DoD': 'Government',
    'Wellcome Trust': 'Non-Profit',
    'Gates Foundation': 'Non-Profit',
    'Pfizer': 'Private Industry',
    'Merck': 'Private Industry',
    'Novartis': 'Private Industry',
    'University of XYZ': 'Academic',
    'Harvard University': 'Academic',
    'MIT': 'Academic',
    # Add more mappings as needed
}

def parse_medline_file(file_path):
    with open(file_path, 'r') as handle:
        records = Medline.parse(handle)
        records = list(records)
    return records

def extract_funding_info(records):
    funding_data = []
    for record in records:
        year = record.get('DP', 'No date').split(" ")[0]
        funding_sources = record.get('GR', [])
        for source in funding_sources:
            # Categorize the funding source
            category = funding_categories.get(source.split(' ')[0], 'Other')
            funding_data.append({'Year': year, 'Funding Source': category})
    return funding_data

# Parse the data
genetic_records = parse_medline_file(genetic_mechanisms_file)
all_records = parse_medline_file(all_endometriosis_file)

# Extract funding information
genetic_funding = extract_funding_info(genetic_records)
all_funding = extract_funding_info(all_records)

# Convert to DataFrame
funding_df = pd.DataFrame(genetic_funding + all_funding)

# Convert 'Year' to numeric, filter out invalid entries, and drop NaNs
funding_df['Year'] = pd.to_numeric(funding_df['Year'], errors='coerce')
funding_df = funding_df.dropna(subset=['Year'])

# Group by Year and Funding Category, and count occurrences
funding_summary = funding_df.groupby(['Year', 'Funding Source']).size().unstack(fill_value=0)

# Calculate the change in funding categories over time
funding_change = funding_summary.diff().fillna(0)

# Determine if the funding increased or decreased
funding_trend = funding_change.apply(lambda x: x.map(lambda v: 'Increased' if v > 0 else 'Decreased' if v < 0 else 'No Change'))

# Plotting the data
fig, ax = plt.subplots(figsize=(10, 6))

# Plot the funding categories as a stacked bar chart
funding_summary.plot(kind='bar', stacked=True, ax=ax, color=['green', 'red', 'orange', 'blue', 'purple', 'yellow', 'grey'])

# Set a fixed legend location to avoid slow performance
plt.legend(title='Funding Category', loc='upper left', bbox_to_anchor=(1, 1))

plt.xlabel('Year')
plt.ylabel('Number of Publications')
plt.title('Funding Categories Over Time for Endometriosis Research')

# Adjust the layout manually instead of using tight_layout
plt.subplots_adjust(left=0.1, right=0.8, top=0.9, bottom=0.1)
plt.xticks(rotation=45)
plt.show()
