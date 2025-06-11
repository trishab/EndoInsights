# EndoInsights

This repository contains scripts for exploring PubMed data related to idiopathic pulmonary fibrosis (IPF), endometriosis, and the microRNA *mir‑214*. The provided text files store PubMed records retrieved in MEDLINE format.

## Data overview

The repository includes several large data files:

- **`all_IPF_studies.txt`** – over one million lines of IPF‑related MEDLINE entries.
- **`genetic_mechanisms_ipf_studies.txt`** – about 89k lines focused on genetic mechanisms in IPF.
- **`all_mir_214.txt`** – roughly 140k lines mentioning the microRNA *mir‑214*, spanning many disease areas.

Endometriosis datasets are referenced in the scripts but are not present in this repository. The difference in available IPF versus endometriosis records highlights the heavy focus on pulmonary fibrosis research compared with the limited data for endometriosis.

## Scripts

Each Python script analyzes the MEDLINE text files in different ways:

| Script | Purpose |
|-------|---------|
| `funding_sources.py` | Categorizes funding sources in endometriosis records and plots their trends. |
| `gene_interactions.py` | Builds a gene interaction network from endometriosis MEDLINE data. |
| `mir-214.py` | Groups PMIDs mentioning *mir‑214* by disease keywords. |
| `mir_214.py` | Visualizes *mir‑214* interactions as a network. |
| `ipf and endo analysis.py` | Compares publication counts over time for IPF and endometriosis. |
| `pubmed_endometriosis_analysis.py` | Generates a publication timeline for both diseases. |
| `pubmed_ipf_analysis` | Plots trends for endometriosis data only (despite the filename). |

Most scripts expect MEDLINE files in the same directory. Update the hard‑coded paths if your files are elsewhere.

## Research disparity

Counting lines in the available text files illustrates the imbalance:

```bash
$ wc -l all_IPF_studies.txt all_mir_214.txt genetic_mechanisms_ipf_studies.txt
1119074 all_IPF_studies.txt
140483  all_mir_214.txt
89388   genetic_mechanisms_ipf_studies.txt
```

No comparable endometriosis files are included, so the IPF datasets vastly outnumber the endometriosis data. This mirrors the broader trend of substantially more published IPF research than work on endometriosis genetics.

## Reference

A related review article (doi:10.1155/2018/6217812) discusses how **microRNA‑214** regulates fibrotic pathways and might serve as a therapeutic target. See [https://doi.org/10.1155/2018/6217812](https://doi.org/10.1155/2018/6217812) for the full text.

## Setup and usage

1. Create a virtual environment and install dependencies:

```bash
python3 -m venv endoenv
source endoenv/bin/activate
pip install -r requirements.txt
```

2. Place the MEDLINE text files in this directory (or adjust the paths in the scripts).

3. Run a script with Python:

```bash
python3 "ipf and endo analysis.py"
```

Plots will appear in a window. Use other scripts similarly to explore funding sources or gene interactions.


## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
