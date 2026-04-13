import Link from 'next/link';
import { PROVIDER_TYPES } from '../lib/constants';

export default function ProviderCard({ provider }) {
  const type = PROVIDER_TYPES[provider.providerType] || PROVIDER_TYPES.other;

  return (
    <Link href={`/providers/${provider.id}`} className="block">
      <div className="card-solid hover:shadow-md hover:border-primary/20 transition-all">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-heading font-semibold text-secondary-dark">
              {provider.name}
            </h3>
            <p className="text-sm text-secondary-light">
              {[provider.city, provider.state, provider.country !== 'United States' && provider.country]
                .filter(Boolean)
                .join(', ')}
              {provider.practiceName && (
                <span className="text-muted-foreground"> — {provider.practiceName}</span>
              )}
            </p>
          </div>
        </div>

        {/* Provider type badge */}
        <span className="badge-primary text-xs mb-3 inline-block">
          {type.label}
        </span>

        {/* Key badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {provider.migsFellowshipTraining && (
            <span className="badge-accent text-xs">Fellowship Trained</span>
          )}
          {provider.hasMultidisciplinaryTeam && (
            <span className="badge-accent text-xs">Multidisciplinary Team</span>
          )}
          {provider.telehealth && (
            <span className="badge-accent text-xs">Telehealth</span>
          )}
          {provider.acceptsInsurance && (
            <span className="badge-accent text-xs">Accepts Insurance</span>
          )}
          {provider.acceptingNewPatients && (
            <span className="badge-green text-xs">Accepting Patients</span>
          )}
          {provider.providesOperativePhotos && (
            <span className="badge-accent text-xs">Shares Op Photos</span>
          )}
          {provider.completesFmla && (
            <span className="badge-accent text-xs">FMLA Support</span>
          )}
          {provider.traumaInformed && (
            <span className="badge-accent text-xs">Trauma-Informed</span>
          )}
        </div>

        {/* Wait time if available */}
        {provider.waitTimeMonths != null && (
          <p className="text-xs text-muted-foreground">
            Wait time: ~{provider.waitTimeMonths} month{provider.waitTimeMonths !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </Link>
  );
}
