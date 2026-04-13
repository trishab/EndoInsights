import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ProviderCard from '../../components/ProviderCard';
import { PROVIDER_TYPES, US_STATES } from '../../lib/constants';

export default function ProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await fetch('/api/providers');
        if (res.ok) {
          const data = await res.json();
          setProviders(data);
          setFiltered(data);
        }
      } catch {
        // handle error
      }
      setLoading(false);
    };
    fetchProviders();
  }, []);

  useEffect(() => {
    let result = providers;

    if (typeFilter) {
      result = result.filter(p => p.providerType === typeFilter);
    }

    if (stateFilter) {
      result = result.filter(p => p.state === stateFilter);
    }

    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(p =>
        (p.name || '').toLowerCase().includes(lower) ||
        (p.city || '').toLowerCase().includes(lower) ||
        (p.practiceName || '').toLowerCase().includes(lower)
      );
    }

    setFiltered(result);
  }, [providers, typeFilter, stateFilter, search]);

  // Count providers by type
  const typeCounts = {};
  providers.forEach(p => {
    const t = p.providerType || 'other';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });

  // Active filter chips
  const activeFilters = [];
  if (typeFilter) activeFilters.push({ label: PROVIDER_TYPES[typeFilter]?.label || typeFilter, clear: () => setTypeFilter('') });
  if (stateFilter) activeFilters.push({ label: stateFilter, clear: () => setStateFilter('') });

  return (
    <div className="min-h-screen bg-muted">
      <Head>
        <title>Browse Specialists | EndEndo</title>
      </Head>

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20">
        <nav className="section-container-wide py-4 flex items-center justify-between">
          <Link href="/">
            <span className="text-2xl font-heading font-bold">
              <span className="text-primary">End</span>
              <span className="text-secondary">Endo</span>
            </span>
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium text-secondary-light">
            <Link href="/match" className="hover:text-primary transition-colors">
              Find Your Match
            </Link>
            <Link href="/submit" className="hover:text-primary transition-colors">
              For Providers
            </Link>
          </div>
        </nav>
      </header>

      <main className="section-container-wide py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="card-solid sticky top-24">
              <h2 className="font-heading font-semibold text-secondary-dark mb-4">Filters</h2>

              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or city..."
                  className="w-full px-3 py-2 border border-border rounded-xl bg-white text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              {/* Provider type */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-secondary-dark mb-2 uppercase tracking-wide">
                  Specialty
                </label>
                <div className="space-y-1">
                  <button
                    onClick={() => setTypeFilter('')}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                      !typeFilter ? 'bg-primary-100 text-primary-700 font-medium' : 'text-secondary-light hover:bg-muted'
                    }`}
                  >
                    All ({providers.length})
                  </button>
                  {Object.entries(PROVIDER_TYPES).filter(([k]) => k !== 'other').map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setTypeFilter(key)}
                      className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                        typeFilter === key ? 'bg-primary-100 text-primary-700 font-medium' : 'text-secondary-light hover:bg-muted'
                      }`}
                    >
                      {val.shortLabel} ({typeCounts[key] || 0})
                    </button>
                  ))}
                </div>
              </div>

              {/* State filter */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-secondary-dark mb-2 uppercase tracking-wide">
                  State
                </label>
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-xl bg-white text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="">All states</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* CTA */}
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">
                  Want personalized results?
                </p>
                <Link href="/match" className="btn-primary text-sm w-full text-center block">
                  Take the Questionnaire
                </Link>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {/* Active filters */}
            {activeFilters.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-secondary-light">Active filters:</span>
                {activeFilters.map((f) => (
                  <button
                    key={f.label}
                    onClick={f.clear}
                    className="badge-primary text-xs flex items-center gap-1"
                  >
                    {f.label}
                    <span className="text-primary-400 ml-1">&times;</span>
                  </button>
                ))}
                <button
                  onClick={() => { setTypeFilter(''); setStateFilter(''); setSearch(''); }}
                  className="text-xs text-primary hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-heading font-bold text-secondary-dark">
                Specialists Directory
              </h1>
              <span className="text-sm text-muted-foreground">
                {filtered.length} provider{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-secondary-light">Loading specialists...</p>
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 card-solid">
                <h3 className="font-heading font-semibold text-secondary-dark mb-2">
                  No specialists found
                </h3>
                <p className="text-secondary-light text-sm mb-4">
                  Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={() => { setTypeFilter(''); setStateFilter(''); setSearch(''); }}
                  className="btn-outline text-sm"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
