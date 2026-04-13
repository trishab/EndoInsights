import { PROVIDER_TYPES } from '../../lib/constants';

const providerKeys = [
  'excision_surgeon',
  'pelvic_floor_pt',
  'functional_medicine',
  'gastroenterologist',
  'interventional_radiologist',
  'pain_management',
  'mental_health',
  'urologist',
  'nutritionist',
];

export default function StepProviderType({ data, updateData }) {
  const selected = data.seekingProviderTypes || [];

  function toggle(key) {
    const next = selected.includes(key)
      ? selected.filter((k) => k !== key)
      : [...selected, key];
    updateData({ seekingProviderTypes: next });
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-heading text-2xl font-bold text-secondary-dark">
          What kind of provider are you looking for?
        </h2>
        <p className="text-muted-foreground text-base">
          Select all that apply. Building a care team often means multiple specialists.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {providerKeys.map((key) => {
          const provider = PROVIDER_TYPES[key];
          if (!provider) return null;
          const isSelected = selected.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              className={`
                flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all
                ${isSelected
                  ? 'border-primary bg-primary-50 shadow-sm'
                  : 'border-border bg-white hover:border-primary/30 hover:shadow-sm'
                }
              `}
            >
              <span
                className={`
                  mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                  ${isSelected
                    ? 'bg-primary border-primary text-white'
                    : 'border-gray-300 bg-white'
                  }
                `}
              >
                {isSelected && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <div>
                <span className={`block font-semibold ${isSelected ? 'text-primary-800' : 'text-secondary-dark'}`}>
                  {provider.label}
                </span>
                <span className="block text-sm text-muted-foreground mt-0.5">
                  {provider.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
