import {
  AUTONOMY_PREFERENCES,
  TELEHEALTH_PREFERENCES,
  COMORBIDITIES,
} from '../../lib/constants';

function Toggle({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-start gap-3 w-full text-left"
    >
      <div
        className={`
          relative w-11 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5
          ${checked ? 'bg-primary' : 'bg-gray-200'}
        `}
      >
        <div
          className={`
            absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
            ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}
          `}
        />
      </div>
      <div>
        <span className="font-medium text-secondary-dark">{label}</span>
        {description && (
          <span className="block text-sm text-muted-foreground mt-0.5">{description}</span>
        )}
      </div>
    </button>
  );
}

function RadioGroup({ options, selected, onChange }) {
  return (
    <div className="space-y-2">
      {Object.entries(options).map(([key, opt]) => {
        const isSelected = selected === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`
              w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all
              ${isSelected
                ? 'border-primary bg-primary-50 shadow-sm'
                : 'border-border bg-white hover:border-primary/30 hover:shadow-sm'
              }
            `}
          >
            <span
              className={`
                mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${isSelected ? 'border-primary' : 'border-gray-300'}
              `}
            >
              {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
            </span>
            <div>
              <span className={`block font-medium ${isSelected ? 'text-primary-800' : 'text-secondary-dark'}`}>
                {opt.label}
              </span>
              {opt.description && (
                <span className="block text-sm text-muted-foreground mt-0.5">
                  {opt.description}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

const GENDER_OPTIONS = {
  female: { label: 'Female provider', description: '' },
  male: { label: 'Male provider', description: '' },
  no_preference: { label: 'No preference', description: '' },
};

export default function StepCarePreferences({ data, updateData }) {
  const comorbidities = data.comorbidities || [];

  function toggleComorbidity(key) {
    const next = comorbidities.includes(key)
      ? comorbidities.filter((k) => k !== key)
      : [...comorbidities, key];
    updateData({ comorbidities: next });
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="font-heading text-2xl font-bold text-secondary-dark">
          Your care preferences
        </h2>
        <p className="text-muted-foreground text-base">
          These details help us find a provider who fits your needs and communication style.
        </p>
      </div>

      {/* Autonomy */}
      <div>
        <h3 className="text-lg font-semibold text-secondary-dark mb-3">
          Decision-making style
        </h3>
        <RadioGroup
          options={AUTONOMY_PREFERENCES}
          selected={data.autonomyPreference || ''}
          onChange={(val) => updateData({ autonomyPreference: val })}
        />
      </div>

      {/* Gender preference */}
      <div>
        <h3 className="text-lg font-semibold text-secondary-dark mb-3">
          Provider gender preference
        </h3>
        <RadioGroup
          options={GENDER_OPTIONS}
          selected={data.genderPreference || ''}
          onChange={(val) => updateData({ genderPreference: val })}
        />
      </div>

      {/* Telehealth */}
      <div>
        <h3 className="text-lg font-semibold text-secondary-dark mb-3">
          Telehealth preference
        </h3>
        <RadioGroup
          options={TELEHEALTH_PREFERENCES}
          selected={data.telehealthPreference || ''}
          onChange={(val) => updateData({ telehealthPreference: val })}
        />
      </div>

      {/* Toggles */}
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-secondary-dark">Additional preferences</h3>

        <div className="card-solid space-y-5">
          <Toggle
            checked={data.traumaInformedCare || false}
            onChange={(val) => updateData({ traumaInformedCare: val })}
            label="Trauma-informed care is important to me"
            description="I want a provider trained in trauma-sensitive approaches"
          />

          <Toggle
            checked={data.diagnosticCapability || false}
            onChange={(val) => updateData({ diagnosticCapability: val })}
            label="I want a provider who can diagnose endo through imaging before surgery"
            description="Skilled ultrasound or MRI-based diagnosis (e.g., IDEA protocol)"
          />

          <Toggle
            checked={data.needsFmla || false}
            onChange={(val) => updateData({ needsFmla: val })}
            label="I will need FMLA paperwork"
            description="Family and Medical Leave Act documentation for time off work"
          />

          <Toggle
            checked={data.needsDisability || false}
            onChange={(val) => updateData({ needsDisability: val })}
            label="I will need short-term disability paperwork"
            description="Documentation for disability benefits during recovery"
          />
        </div>
      </div>

      {/* Comorbidities */}
      <div>
        <h3 className="text-lg font-semibold text-secondary-dark mb-1">Related conditions</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Do you have any of these related conditions? This helps us find providers with relevant experience.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(COMORBIDITIES).map(([key, label]) => {
            const isSelected = comorbidities.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleComorbidity(key)}
                className={`
                  flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all
                  ${isSelected
                    ? 'border-primary bg-primary-50'
                    : 'border-border bg-white hover:border-primary/30'
                  }
                `}
              >
                <span
                  className={`
                    flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
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
                <span className={`text-sm font-medium ${isSelected ? 'text-primary-800' : 'text-secondary-dark'}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
