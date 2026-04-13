import { IMPORTANCE_LEVELS } from '../../lib/constants';

const DIMENSIONS = [
  {
    key: 'weightFaith',
    label: 'Faith-based care',
    dataKey: 'faithPreference',
    noPreferenceValue: 'no_preference',
  },
  {
    key: 'weightPhilosophy',
    label: 'Treatment philosophy',
    dataKey: 'philosophyPreference',
    noPreferenceValue: 'no_preference',
  },
  {
    key: 'weightUterus',
    label: 'Uterus / fertility goals',
    dataKey: 'uterusGoal',
    noPreferenceValue: 'not_applicable',
  },
  {
    key: 'weightHormoneFree',
    label: 'Hormone-free preference',
    dataKey: 'hormoneFreePreference',
    noPreferenceValue: 'no_preference',
  },
  {
    key: 'weightAutonomy',
    label: 'Decision-making style',
    dataKey: 'autonomyPreference',
    noPreferenceValue: 'no_preference',
  },
  {
    key: 'weightComorbidity',
    label: 'Related conditions experience',
    dataKey: 'comorbidities',
    noPreferenceValue: [],
    isArray: true,
  },
  {
    key: 'weightTraumaInformed',
    label: 'Trauma-informed care',
    dataKey: 'traumaInformedCare',
    noPreferenceValue: false,
    isBool: true,
  },
  {
    key: 'weightFmla',
    label: 'FMLA paperwork',
    dataKey: 'needsFmla',
    noPreferenceValue: false,
    isBool: true,
  },
  {
    key: 'weightDiagnosticCapability',
    label: 'Pre-surgical imaging diagnosis',
    dataKey: 'diagnosticCapability',
    noPreferenceValue: false,
    isBool: true,
  },
];

function isActive(data, dim) {
  const val = data[dim.dataKey];
  if (dim.isArray) {
    return Array.isArray(val) && val.length > 0;
  }
  if (dim.isBool) {
    return val === true;
  }
  return val && val !== dim.noPreferenceValue;
}

const levelKeys = Object.keys(IMPORTANCE_LEVELS);

export default function StepImportance({ data, updateData }) {
  const activeDimensions = DIMENSIONS.filter((dim) => isActive(data, dim));

  if (activeDimensions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-heading text-2xl font-bold text-secondary-dark">
            How important are your preferences?
          </h2>
          <p className="text-muted-foreground text-base">
            It looks like you haven&apos;t set specific preferences in earlier steps.
            Go back and select some preferences to customize how important each one is to you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-heading text-2xl font-bold text-secondary-dark">
          How important are your preferences?
        </h2>
        <p className="text-muted-foreground text-base">
          Help us understand which preferences matter most. This fine-tunes your matches.
        </p>
      </div>

      <div className="space-y-4">
        {activeDimensions.map((dim) => {
          const current = data[dim.key] || 'important';
          return (
            <div key={dim.key} className="card-solid">
              <p className="font-semibold text-secondary-dark mb-3">{dim.label}</p>
              <div className="flex gap-2">
                {levelKeys.map((levelKey) => {
                  const level = IMPORTANCE_LEVELS[levelKey];
                  const isSelected = current === levelKey;
                  return (
                    <button
                      key={levelKey}
                      type="button"
                      onClick={() => updateData({ [dim.key]: levelKey })}
                      className={`
                        flex-1 px-3 py-2.5 rounded-xl border-2 text-center transition-all
                        ${isSelected
                          ? levelKey === 'critical'
                            ? 'border-primary bg-primary text-white font-semibold'
                            : levelKey === 'important'
                              ? 'border-primary bg-primary-50 text-primary-800 font-semibold'
                              : 'border-primary/50 bg-primary-50/50 text-primary-700 font-semibold'
                          : 'border-border bg-white text-muted-foreground hover:border-primary/30'
                        }
                      `}
                    >
                      <span className="block text-sm font-semibold">{level.label}</span>
                      <span className={`block text-xs mt-0.5 ${isSelected ? 'opacity-90' : 'opacity-70'}`}>
                        {level.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
