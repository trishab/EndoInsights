import pandas as pd
import networkx as nx
import matplotlib.pyplot as plt
from utils import parse_medline_file

# File paths to your data files
genetic_mechanisms_file = "/Users/trishablack/genetic_mechanisms_endometriosis_studies.txt"
all_endometriosis_file = "/Users/trishablack/all_endometriosis_studies.txt"


def extract_gene_interactions(records):
    interactions = []
    for record in records:
        if 'RN' in record:
            genes = [term for term in record['RN'] if 'mir-214' in term.lower()]
            if len(genes) > 1:
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

# Debug: Print the extracted interactions to verify
print("Extracted Interactions:", interactions)

# Create an empty graph
G = nx.Graph()

# Add edges (and automatically the corresponding nodes)
G.add_edges_from(interactions)

# Draw the network
plt.figure(figsize=(12, 12))
pos = nx.spring_layout(G, seed=42, k=0.1)  # k controls the distance between nodes
nx.draw_networkx_nodes(G, pos, node_size=100, node_color='skyblue')
nx.draw_networkx_edges(G, pos, width=2, edge_color='gray')
nx.draw_networkx_labels(G, pos, font_size=10, font_color='black')

plt.title('Network Structure of Endometriosis-Related Genes (mir-214)')
plt.show()
