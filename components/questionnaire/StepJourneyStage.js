import { JOURNEY_STAGES } from '../../lib/constants';

const stageIcons = {
  seeking_diagnosis: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  newly_diagnosed: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  exploring_treatment: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
  seeking_surgery: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
    </svg>
  ),
  post_surgery: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h1.5c.621 0 1.125.504 1.125 1.125v12.872M6.75 21a3.75 3.75 0 003.75-3.75V8.25" />
    </svg>
  ),
  chronic_management: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
};

export default function StepJourneyStage({ data, updateData }) {
  const selected = data.painJourneyStage || '';

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-heading text-2xl font-bold text-secondary-dark">
          Where are you in your journey?
        </h2>
        <p className="text-muted-foreground text-base">
          This helps us find providers who specialize in your current needs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(JOURNEY_STAGES).map(([key, stage]) => {
          const isSelected = selected === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => updateData({ painJourneyStage: key })}
              className={`
                flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all
                ${isSelected
                  ? 'border-primary bg-primary-50 shadow-sm'
                  : 'border-border bg-white hover:border-primary/30 hover:shadow-sm'
                }
              `}
            >
              <span className={`mt-0.5 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                {stageIcons[key]}
              </span>
              <div>
                <span className={`block font-semibold ${isSelected ? 'text-primary-800' : 'text-secondary-dark'}`}>
                  {stage.label}
                </span>
                <span className="block text-sm text-muted-foreground mt-0.5">
                  {stage.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
