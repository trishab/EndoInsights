from collections import defaultdict
import re

file_path = "/Users/trishablack/PycharmProjects/pythonProject/all_mir_214.txt"

# Keywords for disease areas
disease_keywords = ['cancer', 'ovarian', 'hepatoblastoma', 'pancreas', 'diabetes', 'bone', 'muscle', 'angiogenesis']
disease_keywords_lower = [kw.lower() for kw in disease_keywords]  # Ensure case insensitivity

# Initialize a dictionary to store diseases and corresponding PMIDs
disease_pmids = defaultdict(list)

try:
    # Read and parse the file
    with open(file_path, 'r') as file:
        content = file.read()
        records = content.split("\n---\n")  # Split based on the separator used in the file

        for record in records:
            pmid_match = re.search(r'PMID- (\d+)', record)
            if pmid_match:
                pmid = pmid_match.group(1)
                found = False
                for disease in disease_keywords_lower:
                    if disease in record.lower():
                        disease_pmids[disease].append(pmid)
                        found = True
                        break
                if not found:
                    disease_pmids['other'].append(pmid)

    # Print the results
    for disease, pmids in disease_pmids.items():
        print(f"{disease.capitalize()}:")
        for pmid in pmids:
            print(f"  {pmid}")
        print("\n")

except FileNotFoundError:
    print(f"The file at path {file_path} was not found.")
except Exception as e:
    print(f"An error occurred: {e}")
