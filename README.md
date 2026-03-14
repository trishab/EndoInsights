# EndoInsights

This repository contains scripts for exploring PubMed data related to idiopathic pulmonary fibrosis (IPF) and endometriosis. The provided text files store PubMed records retrieved in MEDLINE format.

## Data overview

The repository includes several large data files:

- **`all_IPF_studies.txt`** – over one million lines of IPF‑related MEDLINE entries.
- **`genetic_mechanisms_ipf_studies.txt`** – about 89k lines focused on genetic mechanisms in IPF.

Endometriosis datasets are not included in this repository due to file size, but can be reproduced by running `fetch_data.py` (see Setup below). The difference in available IPF versus endometriosis records highlights the heavy focus on pulmonary fibrosis research compared with the limited data for endometriosis.

## Scripts

Each Python script analyzes the MEDLINE text files in different ways:

| Script | Purpose |
|-------|---------|
| `fetch_data.py` | Downloads endometriosis MEDLINE records from PubMed into `data/`. |
| `funding_sources.py` | Categorizes funding sources in endometriosis records and plots their trends. |
| `gene_interactions.py` | Builds a gene interaction network from endometriosis MEDLINE data. |
| `ipf_endo_analysis.py` | Compares publication counts over time for IPF and endometriosis. |
| `pubmed_endometriosis_analysis.py` | Generates a publication timeline for both diseases. |
| `pubmed_ipf_analysis.py` | Plots trends for endometriosis data only (despite the filename). |

## Research disparity

Counting lines in the available text files illustrates the imbalance:

```bash
$ wc -l all_IPF_studies.txt genetic_mechanisms_ipf_studies.txt
1119074 all_IPF_studies.txt
89388   genetic_mechanisms_ipf_studies.txt
```

No comparable endometriosis files are included in the repository, so the IPF datasets vastly outnumber the endometriosis data. This mirrors the broader trend of substantially more published IPF research than work on endometriosis genetics.

## Notes on prior analyses

**mir-214 co-occurrence analysis** was attempted to explore the role of microRNA‑214 across disease areas. The analysis was removed because the dataset (`all_mir_214.txt`) was too sparse for meaningful results — only a single article was retrieved, and no co-occurrence pairs were found in the endometriosis MEDLINE files.

## Setup and usage

1. Create a virtual environment and install dependencies:

```bash
python3 -m venv endoenv
source endoenv/bin/activate
pip install -r requirements.txt
```

2. Fetch the endometriosis data (requires a free [NCBI API key](https://www.ncbi.nlm.nih.gov/account/)). Copy `.env.example` to `.env`, fill in your credentials, then run:

```bash
python3 fetch_data.py
```

This saves MEDLINE records to `data/all_endometriosis_studies.txt` and `data/genetic_mechanisms_endometriosis_studies.txt`.

3. Run a script with Python:

```bash
python3 ipf_endo_analysis.py
```

Plots will appear in a window. Use other scripts similarly to explore funding sources or gene interactions.


## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
