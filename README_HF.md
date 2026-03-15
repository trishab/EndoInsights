---
title: EndoInsights
emoji: 🔬
colorFrom: purple
colorTo: pink
sdk: docker
pinned: false
---

# EndoInsights — The Endometriosis Research Gap

An interactive analysis of 80+ years of PubMed publication data, independently replicating and extending Bouaziz et al. (2018). This app quantifies the growing gap between endometriosis and IPF (idiopathic pulmonary fibrosis) genetic research — two diseases that share overlapping fibrotic and inflammatory pathways.

## What the app shows

- **Publication Trends** — Annual PubMed counts for all four categories (all endometriosis studies, genetic mechanisms of endometriosis, all IPF studies, genetic mechanisms of IPF) with interactive hover, filtered by a year range slider
- **Research Gap Analysis** — Decade-by-decade average publication counts as a grouped bar chart, plus a CAGR table from 2000 to the most recent year
- **Growth Rates** — Year-over-year percentage growth lines for all four categories with a 0% reference line to distinguish acceleration from deceleration

## How to use it

1. Use the **year range slider** in the sidebar to focus on any time period
2. Use the **checkboxes** to show or hide individual data series
3. Hover over any chart point to see exact values
4. Switch between tabs to explore different views of the same dataset

## Data source

PubMed E-utilities API, fetched via `fetch_data.py`. Canonical search terms established March 2026:

| Series | Query |
|---|---|
| All Endometriosis Studies | `endometriosis` |
| Genetic Mechanisms — Endometriosis | `endometriosis AND (genes OR genetic)` |
| All IPF Studies | `idiopathic pulmonary fibrosis` |
| Genetic Mechanisms — IPF | `idiopathic pulmonary fibrosis AND (genes OR genetic)` |

Cumulative totals (1930–2026): endo_all = 43,755 · endo_genetic = 6,815 · ipf_all = 20,742 · ipf_genetic = 4,599

## Background

In November 2023 I was diagnosed with endometriosis — largely asymptomatic, which meant the standard symptom-based screening had missed me entirely. This app is part of an independent research effort to quantify the endometriosis genetic research gap and make the case for a biological diagnostic marker. It directly informs [EndEndo.io](https://endendo.io), a platform helping endometriosis patients find vetted excision specialists.

**Citation:** Bouaziz et al. (2018) doi:10.1155/2018/6217812
**Built by:** Trisha Black — [GitHub](https://github.com/trishablack) · [LinkedIn](https://linkedin.com/in/trishablack)
