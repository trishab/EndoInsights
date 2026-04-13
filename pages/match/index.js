import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import QuestionnaireWizard from '../../components/questionnaire/QuestionnaireWizard';

// Import step components (these will be created by the agent)
import StepJourneyStage from '../../components/questionnaire/StepJourneyStage';
import StepProviderType from '../../components/questionnaire/StepProviderType';
import StepLocation from '../../components/questionnaire/StepLocation';
import StepPhilosophy from '../../components/questionnaire/StepPhilosophy';
import StepTreatmentGoals from '../../components/questionnaire/StepTreatmentGoals';
import StepCarePreferences from '../../components/questionnaire/StepCarePreferences';
import StepImportance from '../../components/questionnaire/StepImportance';
import StepReview from '../../components/questionnaire/StepReview';

const STEPS = [
  StepJourneyStage,
  StepProviderType,
  StepLocation,
  StepPhilosophy,
  StepTreatmentGoals,
  StepCarePreferences,
  StepImportance,
  StepReview,
];

export default function MatchPage() {
  const router = useRouter();

  const handleComplete = async (preferences) => {
    // Save preferences to localStorage for the results page
    localStorage.setItem('endendo_preferences', JSON.stringify(preferences));

    // Optionally save to database
    try {
      await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
    } catch {
      // Non-blocking — preferences are already in localStorage
    }

    router.push('/match/results');
  };

  return (
    <div className="min-h-screen bg-muted">
      <Head>
        <title>Find Your Match | EndEndo</title>
      </Head>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20">
        <nav className="section-container-wide py-4 flex items-center justify-between">
          <Link href="/">
            <span className="text-2xl font-heading font-bold">
              <span className="text-primary">End</span>
              <span className="text-secondary">Endo</span>
            </span>
          </Link>
          <Link href="/" className="text-sm text-secondary-light hover:text-primary transition-colors">
            Exit questionnaire
          </Link>
        </nav>
      </header>

      <main className="py-12 px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-heading font-bold text-secondary-dark">
            Share your preferences
          </h1>
          <p className="text-secondary-light mt-2 max-w-lg mx-auto">
            Tell us what matters to you, and we&apos;ll match you with specialists who fit.
            No account needed — your answers stay in your browser.
          </p>
        </div>

        <QuestionnaireWizard steps={STEPS} onComplete={handleComplete} />
      </main>
    </div>
  );
}
