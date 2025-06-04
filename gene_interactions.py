import pandas as pd
from Bio import Medline
import networkx as nx
import matplotlib.pyplot as plt

# File paths to your data files
genetic_mechanisms_file = "/Users/trishablack/genetic_mechanisms_endometriosis_studies.txt"
all_endometriosis_file = "/Users/trishablack/all_endometriosis_studies.txt"

def parse_medline_file(file_path):
    with open(file_path, 'r') as handle:
        records = Medline.parse(handle)
        records = list(records)
    return records

def extract_gene_interactions(records):
    interactions = []
    for record in records:
        # Example of extracting genes from MeSH terms (MH field), assuming interactions are implied
        if 'MH' in record:
            genes = [term for term in record['MH'] if term.lower().startswith('gene')]
            # Create pairs of genes to simulate interactions
            for i in range(len(genes)):
                for j in range(i + 1, len(genes)):
                    interactions.append((genes[i].strip(), genes[j].strip()))
    return interactions

# Parse the data
genetic_records = parse_medline_file(genetic_mechanisms_file)
all_records = parse_medline_file(all_endometriosis_file)

# Extract gene interactions
genetic_interactions = extract_gene_interactions(genetic_records)
all_interactions = extract_gene_interactions(all_records)

# Combine interactions
interactions = genetic_interactions + all_interactions

# Create an empty graph
G = nx.Graph()

# Add edges (and automatically the corresponding nodes)
G.add_edges_from(interactions)

# Draw the network
plt.figure(figsize=(12, 12))
pos = nx.spring_layout(G, seed=42, k=0.15)  # k controls the distance between nodes
nx.draw_networkx_nodes(G, pos, node_size=50, node_color='skyblue')
nx.draw_networkx_edges(G, pos, width=1, edge_color='gray')
nx.draw_networkx_labels(G, pos, font_size=8, font_color='black')

plt.title('Network Structure of Endometriosis-Related Genes')
plt.show()
