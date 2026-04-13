import { US_STATES } from '../../lib/constants';

const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
  NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina',
  ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee',
  TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
};

const TRAVEL_DISTANCES = [
  { value: 50, label: '50 miles' },
  { value: 100, label: '100 miles' },
  { value: 250, label: '250 miles' },
  { value: 500, label: '500+ miles' },
];

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 w-full text-left"
    >
      <div
        className={`
          relative w-11 h-6 rounded-full transition-colors flex-shrink-0
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
      <span className="font-medium text-secondary-dark">{label}</span>
    </button>
  );
}

export default function StepLocation({ data, updateData }) {
  const willingToTravel = data.willingToTravel || false;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-heading text-2xl font-bold text-secondary-dark">
          Where are you located?
        </h2>
        <p className="text-muted-foreground text-base">
          We will find providers near you, or wherever you are willing to travel.
        </p>
      </div>

      <div className="space-y-5">
        {/* State dropdown */}
        <div>
          <label htmlFor="state" className="block text-sm font-semibold text-secondary-dark mb-1.5">
            State
          </label>
          <select
            id="state"
            value={data.state || ''}
            onChange={(e) => updateData({ state: e.target.value })}
            className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-secondary-dark
                       focus:border-primary focus:ring-2 focus:ring-primary-200 focus:outline-none transition-colors"
          >
            <option value="">Select your state</option>
            {US_STATES.map((abbr) => (
              <option key={abbr} value={abbr}>
                {STATE_NAMES[abbr] || abbr}
              </option>
            ))}
          </select>
        </div>

        {/* City input */}
        <div>
          <label htmlFor="city" className="block text-sm font-semibold text-secondary-dark mb-1.5">
            City <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            id="city"
            type="text"
            value={data.city || ''}
            onChange={(e) => updateData({ city: e.target.value })}
            placeholder="e.g. Austin, Portland, Chicago"
            className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-secondary-dark
                       placeholder:text-muted-foreground focus:border-primary focus:ring-2
                       focus:ring-primary-200 focus:outline-none transition-colors"
          />
        </div>

        {/* Travel toggle */}
        <div className="card-solid space-y-4">
          <Toggle
            checked={willingToTravel}
            onChange={(val) => {
              updateData({
                willingToTravel: val,
                ...(!val && { maxTravelMiles: null }),
              });
            }}
            label="I'm willing to travel for the right provider"
          />

          {willingToTravel && (
            <div className="pl-14">
              <p className="text-sm font-semibold text-secondary-dark mb-2">
                How far are you willing to travel?
              </p>
              <div className="flex flex-wrap gap-2">
                {TRAVEL_DISTANCES.map((dist) => {
                  const isSelected = data.maxTravelMiles === dist.value;
                  return (
                    <button
                      key={dist.value}
                      type="button"
                      onClick={() => updateData({ maxTravelMiles: dist.value })}
                      className={`
                        px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all
                        ${isSelected
                          ? 'border-primary bg-primary-50 text-primary-800'
                          : 'border-border bg-white text-secondary-light hover:border-primary/30'
                        }
                      `}
                    >
                      {dist.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
