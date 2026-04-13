import { UTERUS_GOALS, HORMONE_PREFERENCES } from '../../lib/constants';

export default function StepTreatmentGoals({ data, updateData }) {
  const selectedUterus = data.uterusGoal || '';
  const selectedHormone = data.hormoneFreePreference || '';

  function RadioGroup({ options, selected, onChange, name }) {
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

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="font-heading text-2xl font-bold text-secondary-dark">
          Your treatment goals
        </h2>
        <p className="text-muted-foreground text-base">
          Your goals matter. These help us match you with providers who will respect your choices.
        </p>
      </div>

      {/* Uterus / Fertility Goals */}
      <div>
        <h3 className="text-lg font-semibold text-secondary-dark mb-1">Uterus and fertility</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Every choice is valid. We want to match you with a provider who supports yours.
        </p>
        <RadioGroup
          options={UTERUS_GOALS}
          selected={selectedUterus}
          onChange={(val) => updateData({ uterusGoal: val })}
          name="uterusGoal"
        />
      </div>

      {/* Hormone Preferences */}
      <div>
        <h3 className="text-lg font-semibold text-secondary-dark mb-1">Hormonal treatment</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Some patients prefer hormone-free approaches, others are open to all options.
        </p>
        <RadioGroup
          options={HORMONE_PREFERENCES}
          selected={selectedHormone}
          onChange={(val) => updateData({ hormoneFreePreference: val })}
          name="hormoneFreePreference"
        />
      </div>
    </div>
  );
}
