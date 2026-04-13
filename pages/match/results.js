import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { rankProviders } from '../../lib/matching';
import { PROVIDER_TYPES, MATCH_LABELS } from '../../lib/constants';

export default function MatchResults() {
  const router = useRouter();
  const [preferences, setPreferences] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('endendo_preferences');
    if (!saved) {
      router.push('/match');
      return;
    }

    const prefs = JSON.parse(saved);
    setPreferences(prefs);

    // Fetch providers and score them
    const fetchAndScore = async () => {
      try {
        const res = await fetch('/api/providers');
        if (res.ok) {
          const providers = await res.json();
          const ranked = rankProviders(providers, prefs);
          setResults(ranked);
        }
      } catch {
        // If API fails, show empty state
      }
      setLoading(false);
    };

    fetchAndScore();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-secondary-light">Finding your matches...</p>
        </div>
      </div>
    );
  }

  const excellent = results.filter(r => r.totalScore >= MATCH_LABELS.excellent.minScore);
  const strong = results.filter(r => r.totalScore >= MATCH_LABELS.strong.minScore && r.totalScore < MATCH_LABELS.excellent.minScore);
  const good = results.filter(r => r.totalScore >= MATCH_LABELS.good.minScore && r.totalScore < MATCH_LABELS.strong.minScore);
  const possible = results.filter(r => r.totalScore < MATCH_LABELS.good.minScore);

  return (
    <div className="min-h-screen bg-muted">
      <Head>
        <title>Your Specialist Report | EndEndo</title>
      </Head>

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20">
        <nav className="section-container-wide py-4 flex items-center justify-between">
          <Link href="/">
            <span className="text-2xl font-heading font-bold">
              <span className="text-primary">End</span>
              <span className="text-secondary">Endo</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/match" className="text-sm text-secondary-light hover:text-primary transition-colors">
              Update preferences
            </Link>
            <Link href="/providers" className="text-sm text-secondary-light hover:text-primary transition-colors">
              Browse all
            </Link>
          </div>
        </nav>
      </header>

      <main className="py-12 px-4">
        <div className="section-container">
          {/* Section 1: Your Specialist Report */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-heading font-bold text-secondary-dark">
              Your Specialist Report
            </h1>
            <p className="text-secondary-light mt-2">
              {results.length > 0
                ? `We found ${results.length} specialists based on your preferences.`
                : "We're building our directory. Here's how you can find the right provider."}
            </p>
          </div>

          {results.length > 0 ? (
            <div className="space-y-8">
              {/* Excellent matches */}
              {excellent.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="match-excellent">Excellent Match</span>
                    <span className="text-sm text-secondary-light">{excellent.length} specialist{excellent.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {excellent.map(({ provider, totalScore, breakdown, matchLabel }) => (
                      <ProviderResultCard
                        key={provider.id}
                        provider={provider}
                        score={totalScore}
                        matchLabel={matchLabel}
                        breakdown={breakdown}
                        preferences={preferences}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Strong matches */}
              {strong.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="match-strong">Strong Match</span>
                    <span className="text-sm text-secondary-light">{strong.length} specialist{strong.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {strong.map(({ provider, totalScore, breakdown, matchLabel }) => (
                      <ProviderResultCard
                        key={provider.id}
                        provider={provider}
                        score={totalScore}
                        matchLabel={matchLabel}
                        breakdown={breakdown}
                        preferences={preferences}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Good matches */}
              {good.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="match-good">Good Match</span>
                    <span className="text-sm text-secondary-light">{good.length} specialist{good.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {good.map(({ provider, totalScore, breakdown, matchLabel }) => (
                      <ProviderResultCard
                        key={provider.id}
                        provider={provider}
                        score={totalScore}
                        matchLabel={matchLabel}
                        breakdown={breakdown}
                        preferences={preferences}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Section 3: No matches — advocacy toolkit */
            <NoMatchesSection preferences={preferences} />
          )}

          {/* Section 2: Guideline suggestions — always shown */}
          <div className="mt-12">
            <GuidelineSuggestions preferences={preferences} />
          </div>

          {/* Section 3: Self-advocacy toolkit */}
          <div className="mt-12">
            <AdvocacyToolkit preferences={preferences} />
          </div>
        </div>
      </main>
    </div>
  );
}

function ProviderResultCard({ provider, score, matchLabel, breakdown, preferences }) {
  const [expanded, setExpanded] = useState(false);
  const providerType = PROVIDER_TYPES[provider.providerType] || PROVIDER_TYPES.other;

  // Determine match reasons from breakdown
  const matchReasons = [];
  if (breakdown.faith?.score >= 0.7) matchReasons.push('Faith alignment');
  if (breakdown.philosophy?.score >= 0.7) matchReasons.push('Treatment philosophy match');
  if (breakdown.uterusFertility?.score >= 0.7) matchReasons.push('Aligns with your uterus/fertility goals');
  if (breakdown.hormoneFree?.score >= 0.7) matchReasons.push('Offers hormone-free options');
  if (breakdown.autonomy?.score >= 0.7) matchReasons.push('Matches your care style preference');
  if (breakdown.traumaInformed?.score >= 0.7) matchReasons.push('Trauma-informed approach');
  if (breakdown.comorbidity?.score >= 0.7) matchReasons.push('Experienced with your conditions');
  if (breakdown.fmla?.score >= 0.7) matchReasons.push('Handles FMLA/disability paperwork');

  return (
    <div className="card-solid hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-heading font-semibold text-secondary-dark">{provider.name}</h3>
          <p className="text-sm text-secondary-light">
            {provider.city}, {provider.state}
            {provider.practiceName && ` — ${provider.practiceName}`}
          </p>
        </div>
        <span className={matchLabel.className}>{matchLabel.label}</span>
      </div>

      {/* Provider type badge */}
      <span className="badge-primary text-xs mb-3 inline-block">{providerType.label}</span>

      {/* Public badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {provider.migsFellowshipTraining && <span className="badge-accent text-xs">Fellowship Trained</span>}
        {provider.hasMultidisciplinaryTeam && <span className="badge-accent text-xs">Multidisciplinary Team</span>}
        {provider.providesOperativePhotos && <span className="badge-accent text-xs">Shares Operative Photos</span>}
        {provider.telehealth && <span className="badge-accent text-xs">Telehealth</span>}
        {provider.completesFmla && <span className="badge-accent text-xs">Completes FMLA</span>}
        {provider.acceptsInsurance && <span className="badge-accent text-xs">Accepts Insurance</span>}
      </div>

      {/* Match reasons */}
      {matchReasons.length > 0 && (
        <div className="text-xs text-primary-700 space-y-0.5 mb-3">
          {matchReasons.slice(0, 3).map((reason) => (
            <p key={reason}>+ {reason}</p>
          ))}
        </div>
      )}

      {/* Expand for details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-primary font-medium hover:underline"
      >
        {expanded ? 'Hide details' : 'Show match details'}
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-border text-xs space-y-1">
          {Object.entries(breakdown).map(([key, val]) => {
            if (!val || val.score === undefined) return null;
            const pct = Math.round(val.score * 100);
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="text-secondary-light w-32 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <div className="flex-1 bg-muted rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-secondary-light w-8 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-border">
        <Link href={`/providers/${provider.id}`} className="text-sm text-primary font-medium hover:underline">
          View full profile
        </Link>
      </div>
    </div>
  );
}

function GuidelineSuggestions({ preferences }) {
  if (!preferences) return null;

  const suggestions = [];

  if (preferences.painJourneyStage === 'seeking_diagnosis' && !preferences.diagnosticCapabilityImportant) {
    suggestions.push({
      message: 'Medical guidelines recommend starting with endo-focused TVUS or MRI before surgery. You may want to add "diagnostic imaging capability" to your priorities.',
      source: 'ESHRE 2022',
    });
  }

  if (preferences.uterusGoal === 'preserve_uterus' && preferences.fertilityImportance !== 'critical') {
    suggestions.push({
      message: 'If fertility may be relevant to you in the future, you may want to consider providers who also focus on fertility preservation.',
      source: 'ACOG Practice Bulletin',
    });
  }

  if (preferences.philosophyPreference === 'holistic' && preferences.seekingProviderTypes?.includes('excision_surgeon')) {
    suggestions.push({
      message: 'Excision surgery is the gold standard for surgical treatment. Consider providers who combine surgical expertise with integrative approaches.',
      source: 'AAGL Practice Guidelines',
    });
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="card-solid">
      <h2 className="text-lg font-heading font-semibold text-secondary-dark mb-4">
        What medical guidelines suggest
      </h2>
      <div className="space-y-4">
        {suggestions.map((s, i) => (
          <div key={i} className="bg-accent rounded-xl p-4">
            <p className="text-sm text-accent-foreground">{s.message}</p>
            <p className="text-xs text-primary-600 mt-2">Source: {s.source}</p>
            <button
              onClick={() => {/* TODO: navigate to relevant step */}}
              className="text-xs text-primary font-medium mt-2 hover:underline"
            >
              Update my preferences
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdvocacyToolkit({ preferences }) {
  const questions = [];

  if (preferences?.uterusGoal === 'preserve_uterus') {
    questions.push({
      question: 'What is your approach to hysterectomy? Under what circumstances would you recommend it?',
      why: 'Preserving your uterus is important to you',
      idealAnswer: 'The provider discusses alternatives first and treats hysterectomy as a last option',
    });
  }

  if (preferences?.seekingProviderTypes?.includes('excision_surgeon')) {
    questions.push({
      question: 'How many excision surgeries do you perform per year?',
      why: 'High surgical volume correlates with better outcomes',
      idealAnswer: '200+ cases/year or operating at least 2 days/week',
    });
    questions.push({
      question: 'What is your major complication rate?',
      why: 'Willingness to share this is itself a trust signal',
      idealAnswer: 'Clavien-Dindo Grade III+ under 3-5%',
    });
    questions.push({
      question: 'For bowel or bladder involvement, do you operate yourself or work with a colorectal surgeon/urologist?',
      why: 'Multidisciplinary teams have better outcomes for complex cases',
      idealAnswer: 'Works with a colorectal surgeon and/or urologist for those areas',
    });
  }

  if (preferences?.needsFmla) {
    questions.push({
      question: 'Does your office complete FMLA paperwork? Is there a fee?',
      why: 'You indicated you need FMLA support',
      idealAnswer: 'Yes, handled by the office staff at no additional charge',
    });
  }

  return (
    <div className="card-solid">
      <h2 className="text-lg font-heading font-semibold text-secondary-dark mb-2">
        Questions to ask any provider
      </h2>
      <p className="text-sm text-secondary-light mb-4">
        Based on your preferences, here are personalized questions to help you advocate for your care.
      </p>

      {questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={i} className="border border-border rounded-xl p-4">
              <p className="font-medium text-secondary-dark text-sm">&ldquo;{q.question}&rdquo;</p>
              <p className="text-xs text-secondary-light mt-1">Why: {q.why}</p>
              <p className="text-xs text-primary-700 mt-1">Good answer looks like: {q.idealAnswer}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-secondary-light">Complete the questionnaire to get personalized questions.</p>
      )}

      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-sm text-secondary-light">
          Know a specialist who should be listed?{' '}
          <Link href="/submit" className="text-primary font-medium hover:underline">
            Submit their information
          </Link>
        </p>
      </div>
    </div>
  );
}

function NoMatchesSection({ preferences }) {
  return (
    <div className="card-solid text-center py-12">
      <h2 className="text-xl font-heading font-semibold text-secondary-dark mb-3">
        We&apos;re growing our directory
      </h2>
      <p className="text-secondary-light max-w-md mx-auto mb-6">
        We don&apos;t yet have specialists that match all your preferences, but we&apos;re adding new providers regularly.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/providers" className="btn-primary">
          Browse All Specialists
        </Link>
        <Link href="/submit" className="btn-outline">
          Suggest a Provider
        </Link>
      </div>
    </div>
  );
}
