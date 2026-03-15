"""
app.py — EndoInsights Streamlit app.

Deploys to Hugging Face Spaces. Reads from data/publication_counts.csv
and renders three interactive Plotly tabs: Publication Trends, Research
Gap Analysis, and Growth Rates.
"""

from pathlib import Path

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

# ---------------------------------------------------------------------------
# Page config
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="EndoInsights",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ---------------------------------------------------------------------------
# Load data
# ---------------------------------------------------------------------------
DATA_FILE = Path(__file__).parent / "data" / "publication_counts.csv"


@st.cache_data
def load_data() -> pd.DataFrame:
    df = pd.read_csv(DATA_FILE)
    df = df.dropna(subset=["year"])
    df["year"] = df["year"].astype(int)
    return df.sort_values("year").reset_index(drop=True)


df_full = load_data()

# ---------------------------------------------------------------------------
# Sidebar
# ---------------------------------------------------------------------------
with st.sidebar:
    st.markdown("### Filters")

    year_min = int(df_full["year"].min())
    year_max = int(df_full["year"].max())

    year_range = st.slider(
        "Year range",
        min_value=year_min,
        max_value=year_max,
        value=(1980, year_max),
        step=1,
    )

    st.markdown("---")
    st.markdown("### Data series")
    show_endo_all     = st.checkbox("All Endometriosis Studies",        value=True)
    show_endo_genetic = st.checkbox("Genetic Mechanisms — Endometriosis", value=True)
    show_ipf_all      = st.checkbox("All IPF Studies",                  value=True)
    show_ipf_genetic  = st.checkbox("Genetic Mechanisms — IPF",         value=True)

    st.markdown("---")
    with st.expander("About this project"):
        st.markdown(
            "This analysis was built to quantify the research gap between "
            "endometriosis and IPF (idiopathic pulmonary fibrosis), two diseases "
            "that share overlapping fibrotic and inflammatory pathways. "
            "It directly informs [EndEndo.io](https://endendo.io), a platform "
            "helping endometriosis patients find vetted excision specialists."
        )

# ---------------------------------------------------------------------------
# Filter data to selected year range
# ---------------------------------------------------------------------------
df = df_full[
    (df_full["year"] >= year_range[0]) & (df_full["year"] <= year_range[1])
].copy()

# ---------------------------------------------------------------------------
# Series visibility map
# ---------------------------------------------------------------------------
SERIES = {
    "endo_all":     ("All Endometriosis Studies",           "#1f77b4", show_endo_all,     "solid"),
    "endo_genetic": ("Genetic Mechanisms — Endometriosis",  "#aec7e8", show_endo_genetic, "dash"),
    "ipf_all":      ("All IPF Studies",                     "#2ca02c", show_ipf_all,      "solid"),
    "ipf_genetic":  ("Genetic Mechanisms — IPF",            "#98df8a", show_ipf_genetic,  "dash"),
}

# ---------------------------------------------------------------------------
# Header
# ---------------------------------------------------------------------------
st.title("The Endometriosis Research Gap")
st.markdown(
    "*An independent replication and extension of Bouaziz et al. (2018) — "
    "analyzing 80+ years of PubMed publication data*"
)
st.warning(
    "Only **2.8%** of endometriosis studies address genetic mechanisms — "
    "compared to **7%** for IPF"
)

st.markdown("---")

# ---------------------------------------------------------------------------
# Tabs
# ---------------------------------------------------------------------------
tab1, tab2, tab3 = st.tabs([
    "📈 Publication Trends",
    "📊 Research Gap Analysis",
    "🚀 Growth Rates",
])

# ── Tab 1: Publication Trends ────────────────────────────────────────────────
with tab1:
    st.subheader("Annual Publication Counts")

    fig1 = go.Figure()
    for col, (label, color, visible, dash) in SERIES.items():
        if visible and col in df.columns:
            fig1.add_trace(go.Scatter(
                x=df["year"],
                y=df[col],
                name=label,
                mode="lines",
                line=dict(color=color, dash=dash, width=2),
                hovertemplate="%{x}: %{y:,}<extra>" + label + "</extra>",
            ))

    fig1.update_layout(
        xaxis_title="Year",
        yaxis_title="Publications per Year",
        hovermode="x unified",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="left", x=0),
        margin=dict(t=60, b=40),
        height=480,
        plot_bgcolor="white",
        paper_bgcolor="white",
    )
    fig1.update_xaxes(showgrid=True, gridcolor="#eeeeee")
    fig1.update_yaxes(showgrid=True, gridcolor="#eeeeee")
    st.plotly_chart(fig1, use_container_width=True)

    # Metrics row
    st.markdown("#### Totals for selected period")
    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Total Endometriosis Studies",      f"{df['endo_all'].sum():,}")
    m2.metric("Genetic Mechanism Studies (Endo)", f"{df['endo_genetic'].sum():,}")
    m3.metric("Total IPF Studies",                f"{df['ipf_all'].sum():,}")
    m4.metric("IPF Genetic Studies",              f"{df['ipf_genetic'].sum():,}")

# ── Tab 2: Research Gap Analysis ─────────────────────────────────────────────
with tab2:
    st.subheader("Decade-by-Decade Average Annual Publications")

    df_decade = df.copy()
    df_decade["decade"] = (df_decade["year"] // 10 * 10).astype(str) + "s"

    decade_avg = (
        df_decade.groupby("decade")[["endo_all", "endo_genetic", "ipf_all", "ipf_genetic"]]
        .mean()
        .round(1)
        .reset_index()
    )

    # Melt for grouped bar chart — only include visible series
    visible_cols = [col for col, (_, _, vis, _) in SERIES.items() if vis]
    label_map    = {col: SERIES[col][0] for col in visible_cols}
    color_map    = {SERIES[col][0]: SERIES[col][1] for col in visible_cols}

    if visible_cols:
        decade_melt = decade_avg.melt(
            id_vars="decade",
            value_vars=visible_cols,
            var_name="series",
            value_name="avg_publications",
        )
        decade_melt["series"] = decade_melt["series"].map(label_map)

        fig2 = px.bar(
            decade_melt,
            x="decade",
            y="avg_publications",
            color="series",
            barmode="group",
            labels={"avg_publications": "Avg Publications / Year", "decade": "Decade"},
            color_discrete_map=color_map,
            height=440,
        )
        fig2.update_layout(
            legend_title_text="",
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="left", x=0),
            margin=dict(t=60, b=40),
            plot_bgcolor="white",
            paper_bgcolor="white",
        )
        fig2.update_xaxes(showgrid=False)
        fig2.update_yaxes(showgrid=True, gridcolor="#eeeeee")
        st.plotly_chart(fig2, use_container_width=True)
    else:
        st.info("Select at least one data series in the sidebar.")

    # CAGR table
    st.markdown("#### Compound Annual Growth Rate (2000 → most recent year)")

    base_year = 2000
    end_year  = int(df["year"].max())
    n_years   = end_year - base_year

    cagr_rows = []
    df_base = df_full[df_full["year"] == base_year]
    df_end  = df_full[df_full["year"] == end_year]

    if not df_base.empty and not df_end.empty:
        for col, (label, _, _, _) in SERIES.items():
            v0 = df_base[col].values[0]
            vn = df_end[col].values[0]
            if v0 > 0 and vn > 0 and n_years > 0:
                cagr = ((vn / v0) ** (1 / n_years) - 1) * 100
                cagr_rows.append({
                    "Category": label,
                    f"Publications ({base_year})": f"{int(v0):,}",
                    f"Publications ({end_year})": f"{int(vn):,}",
                    "CAGR": f"{cagr:.1f}%",
                })
            else:
                cagr_rows.append({
                    "Category": label,
                    f"Publications ({base_year})": f"{int(v0):,}",
                    f"Publications ({end_year})": f"{int(vn):,}",
                    "CAGR": "N/A",
                })

    if cagr_rows:
        st.dataframe(pd.DataFrame(cagr_rows), use_container_width=True, hide_index=True)

# ── Tab 3: Growth Rates ───────────────────────────────────────────────────────
with tab3:
    st.subheader("Year-over-Year Growth Rate (%)")

    fig3 = go.Figure()

    for col, (label, color, visible, dash) in SERIES.items():
        if visible and col in df.columns:
            yoy = df[col].pct_change() * 100
            fig3.add_trace(go.Scatter(
                x=df["year"],
                y=yoy.round(1),
                name=label,
                mode="lines",
                line=dict(color=color, dash=dash, width=2),
                hovertemplate="%{x}: %{y:.1f}%<extra>" + label + "</extra>",
            ))

    # Reference line at 0%
    fig3.add_hline(
        y=0,
        line_dash="dot",
        line_color="gray",
        line_width=1,
        annotation_text="0% growth",
        annotation_position="bottom right",
    )

    fig3.update_layout(
        xaxis_title="Year",
        yaxis_title="YoY Growth (%)",
        hovermode="x unified",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="left", x=0),
        margin=dict(t=60, b=40),
        height=480,
        plot_bgcolor="white",
        paper_bgcolor="white",
    )
    fig3.update_xaxes(showgrid=True, gridcolor="#eeeeee")
    fig3.update_yaxes(showgrid=True, gridcolor="#eeeeee", zeroline=False)
    st.plotly_chart(fig3, use_container_width=True)

    st.caption(
        "Year-over-year growth is calculated as the percentage change from the "
        "prior year. The first year in the selected range will not have a value."
    )

# ---------------------------------------------------------------------------
# Footer
# ---------------------------------------------------------------------------
st.markdown("---")
st.markdown(
    "Data source: PubMed E-utilities API. &nbsp;"
    "Methodology: Bouaziz et al. (2018) doi:10.1155/2018/6217812. &nbsp;"
    "Built by Trisha Black — "
    "connect on [GitHub](https://github.com/trishablack) "
    "and [LinkedIn](https://linkedin.com/in/trishablack).",
    unsafe_allow_html=True,
)
