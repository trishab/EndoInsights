import { TREATMENT_PHILOSOPHIES, FAITH_PREFERENCES } from '../../lib/constants';

const philosophyIcons = {
  conventional: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  ),
  integrative: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
    </svg>
  ),
  holistic: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  ),
  functional: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
    </svg>
  ),
  no_preference: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const philosophyOptions = {
  ...TREATMENT_PHILOSOPHIES,
  no_preference: { label: 'No Preference', description: "I'm open to any approach" },
};

export default function StepPhilosophy({ data, updateData }) {
  const selectedPhilosophy = data.philosophyPreference || '';
  const selectedFaith = data.faithPreference || '';
  const showFaithFollowUp = selectedFaith === 'faith_based_required' || selectedFaith === 'faith_based_preferred';

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="font-heading text-2xl font-bold text-secondary-dark">
          What is your treatment philosophy?
        </h2>
        <p className="text-muted-foreground text-base">
          There is no wrong answer here. This helps match you with a provider who shares your approach.
        </p>
      </div>

      {/* Philosophy cards */}
      <div>
        <h3 className="text-lg font-semibold text-secondary-dark mb-3">Treatment approach</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(philosophyOptions).map(([key, phil]) => {
            const isSelected = selectedPhilosophy === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => updateData({ philosophyPreference: key })}
                className={`
                  flex flex-col items-center text-center gap-2 p-5 rounded-2xl border-2 transition-all
                  ${isSelected
                    ? 'border-primary bg-primary-50 shadow-sm'
                    : 'border-border bg-white hover:border-primary/30 hover:shadow-sm'
                  }
                `}
              >
                <span className={isSelected ? 'text-primary' : 'text-muted-foreground'}>
                  {philosophyIcons[key]}
                </span>
                <span className={`font-semibold ${isSelected ? 'text-primary-800' : 'text-secondary-dark'}`}>
                  {phil.label}
                </span>
                <span className="text-sm text-muted-foreground">
                  {phil.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Faith preferences */}
      <div>
        <h3 className="text-lg font-semibold text-secondary-dark mb-1">Faith and care</h3>
        <p className="text-sm text-muted-foreground mb-3">
          We respect all beliefs and want you to feel comfortable with your provider.
        </p>
        <div className="space-y-2">
          {Object.entries(FAITH_PREFERENCES).map(([key, pref]) => {
            const isSelected = selectedFaith === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() =>
                  updateData({
                    faithPreference: key,
                    ...(!pref.followUp && { faithTradition: '' }),
                  })
                }
                className={`
                  w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all
                  ${isSelected
                    ? 'border-primary bg-primary-50 shadow-sm'
                    : 'border-border bg-white hover:border-primary/30 hover:shadow-sm'
                  }
                `}
              >
                <span
                  className={`
                    flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${isSelected ? 'border-primary' : 'border-gray-300'}
                  `}
                >
                  {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </span>
                <span className={`font-medium ${isSelected ? 'text-primary-800' : 'text-secondary-dark'}`}>
                  {pref.label}
                </span>
              </button>
            );
          })}
        </div>

        {showFaithFollowUp && (
          <div className="mt-4 ml-8">
            <label htmlFor="faithTradition" className="block text-sm font-semibold text-secondary-dark mb-1.5">
              Which faith tradition? <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              id="faithTradition"
              type="text"
              value={data.faithTradition || ''}
              onChange={(e) => updateData({ faithTradition: e.target.value })}
              placeholder="e.g. Christian, Jewish, Muslim, Buddhist"
              className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-secondary-dark
                         placeholder:text-muted-foreground focus:border-primary focus:ring-2
                         focus:ring-primary-200 focus:outline-none transition-colors"
            />
          </div>
        )}
      </div>
    </div>
  );
}
