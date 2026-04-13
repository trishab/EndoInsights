import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import {
  PROVIDER_TYPES, PRACTICE_SETTINGS, SURGERY_APPROACHES,
  TREATMENT_PHILOSOPHIES, HYSTERECTOMY_APPROACHES, TVUS_PROTOCOLS,
  COMORBIDITIES, ENDO_STAGES,
} from '../../lib/constants';

export default function ProviderProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestedDetails, setRequestedDetails] = useState(false);
  const [detailsData, setDetailsData] = useState(null);

  // Fetch provider on mount
  useState(() => {
    if (!id) return;
    fetch(`/api/providers/${id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => { setProvider(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleRequestDetails = async () => {
    const sessionId = localStorage.getItem('endendo_session_id') || 'anonymous';
    try {
      await fetch('/api/providers/request-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, doctorId: provider.id }),
      });
      setRequestedDetails(true);
    } catch {
      // silent fail
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-secondary-dark mb-2">Provider not found</h1>
          <Link href="/providers" className="text-primary hover:underline">Back to directory</Link>
        </div>
      </div>
    );
  }

  const type = PROVIDER_TYPES[provider.providerType] || PROVIDER_TYPES.other;
  const imaging = provider.imagingCapabilities || {};
  const tvus = imaging.tvus || {};
  const mri = imaging.mri || {};

  return (
    <div className="min-h-screen bg-muted">
      <Head>
        <title>{provider.name} | EndEndo</title>
      </Head>

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20">
        <nav className="section-container-wide py-4 flex items-center justify-between">
          <Link href="/">
            <span className="text-2xl font-heading font-bold">
              <span className="text-primary">End</span>
              <span className="text-secondary">Endo</span>
            </span>
          </Link>
          <Link href="/providers" className="text-sm text-secondary-light hover:text-primary transition-colors">
            Back to directory
          </Link>
        </nav>
      </header>

      <main className="section-container py-12">
        {/* Profile header */}
        <div className="card-solid mb-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {provider.profileImageUrl && (
              <img
                src={provider.profileImageUrl}
                alt={provider.name}
                className="w-24 h-24 rounded-2xl object-cover"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-heading font-bold text-secondary-dark">{provider.name}</h1>
              <p className="text-secondary-light mt-1">
                {[provider.city, provider.state, provider.country !== 'United States' && provider.country]
                  .filter(Boolean).join(', ')}
              </p>
              {provider.practiceName && (
                <p className="text-secondary-light">{provider.practiceName}</p>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                <span className="badge-primary">{type.label}</span>
                {provider.acceptingNewPatients && <span className="badge-green">Accepting Patients</span>}
                {provider.verificationStatus === 'approved' && <span className="badge-accent">Verified</span>}
              </div>

              {provider.bio && (
                <p className="text-secondary-light mt-4 leading-relaxed">{provider.bio}</p>
              )}
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-2 text-sm">
              {provider.phone && (
                <a href={`tel:${provider.phone}`} className="text-primary hover:underline">{provider.phone}</a>
              )}
              {provider.website && (
                <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Website
                </a>
              )}
              {provider.telehealth && <span className="badge-accent">Telehealth Available</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Public badges */}
            <div className="card-solid">
              <h2 className="font-heading font-semibold text-secondary-dark mb-4">Qualifications & Approach</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {provider.migsFellowshipTraining && (
                  <InfoItem label="Fellowship Trained" value="MIGS/AAGL" />
                )}
                {provider.practiceSetting && (
                  <InfoItem label="Practice Setting" value={PRACTICE_SETTINGS[provider.practiceSetting] || provider.practiceSetting} />
                )}
                {provider.treatmentPhilosophy && (
                  <InfoItem label="Treatment Philosophy" value={TREATMENT_PHILOSOPHIES[provider.treatmentPhilosophy]?.label || provider.treatmentPhilosophy} />
                )}
                {provider.approachToHysterectomy && (
                  <InfoItem label="Approach to Hysterectomy" value={HYSTERECTOMY_APPROACHES[provider.approachToHysterectomy]?.label || provider.approachToHysterectomy} />
                )}
                {provider.hasMultidisciplinaryTeam && (
                  <InfoItem label="Multidisciplinary Team" value={(provider.teamSpecialties || []).join(', ') || 'Yes'} />
                )}
                {provider.providesOperativePhotos && <InfoItem label="Operative Photos" value="Provided to patients" />}
                {provider.providesOperativeReports && <InfoItem label="Operative Reports" value="Shared with patients" />}
                {provider.sharesPathologyResults && <InfoItem label="Pathology Results" value="Explained to patients" />}
                {provider.traumaInformed && <InfoItem label="Trauma-Informed" value="Yes" />}
                {provider.completesFmla && <InfoItem label="FMLA Paperwork" value="Completed" />}
                {provider.completesDisabilityPaperwork && <InfoItem label="Disability Paperwork" value="Completed" />}
              </div>
            </div>

            {/* Imaging capabilities */}
            {(tvus.performsTvus || mri.readsMriDirectly || mri.collaboratesWithRadiologist) && (
              <div className="card-solid">
                <h2 className="font-heading font-semibold text-secondary-dark mb-4">Imaging & Diagnostics</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {tvus.performsTvus && <InfoItem label="Performs TVUS" value="Yes" />}
                  {tvus.tvusEndoTrained && (
                    <InfoItem label="Endo-Focused TVUS" value={tvus.tvusProtocol ? TVUS_PROTOCOLS[tvus.tvusProtocol] || tvus.tvusProtocol : 'Trained'} />
                  )}
                  {mri.readsMriDirectly && <InfoItem label="Reads MRI Directly" value="Reviews images, not just impression" />}
                  {mri.interpretsEndoFindings && <InfoItem label="MRI Endo Findings" value="Identifies DIE, adenomyosis markers" />}
                  {mri.ordersEndoProtocolMri && <InfoItem label="Endo MRI Protocol" value="Orders specialized protocol" />}
                  {mri.collaboratesWithRadiologist && <InfoItem label="Endo Radiologist" value="Collaborates with specialist" />}
                </div>
              </div>
            )}

            {/* Conditions treated */}
            {(provider.endoStageExpertise?.length > 0 || provider.comorbidityExperience?.length > 0) && (
              <div className="card-solid">
                <h2 className="font-heading font-semibold text-secondary-dark mb-4">Conditions & Expertise</h2>
                {provider.endoStageExpertise?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-secondary-dark uppercase tracking-wide mb-2">Endo Stage Expertise</p>
                    <div className="flex flex-wrap gap-1.5">
                      {provider.endoStageExpertise.map(s => (
                        <span key={s} className="badge-accent text-xs">{ENDO_STAGES[s] || s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {provider.comorbidityExperience?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-secondary-dark uppercase tracking-wide mb-2">Comorbidities</p>
                    <div className="flex flex-wrap gap-1.5">
                      {provider.comorbidityExperience.map(c => (
                        <span key={c} className="badge-accent text-xs">{COMORBIDITIES[c] || c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Request detailed info */}
            <div className="card-solid">
              <h3 className="font-heading font-semibold text-secondary-dark mb-2">
                Want more details?
              </h3>
              <p className="text-sm text-secondary-light mb-4">
                Request information about surgical volume, complication rates, and other
                quality metrics that this provider has shared with us.
              </p>
              {!requestedDetails ? (
                <button onClick={handleRequestDetails} className="btn-primary w-full text-sm">
                  Request Provider Details
                </button>
              ) : (
                <div className="bg-accent rounded-xl p-4 text-sm text-accent-foreground">
                  <p className="font-semibold mb-2">Details shared:</p>
                  {provider.surgicalVolumeExcisionHours && (
                    <p>Surgical volume: {provider.surgicalVolumeExcisionHours} hours/year</p>
                  )}
                  {provider.complicationRateMajor != null && (
                    <p>Major complication rate (Grade III+): {provider.complicationRateMajor}%</p>
                  )}
                  {provider.waitTimeMonths != null && (
                    <p>Wait time: ~{provider.waitTimeMonths} months</p>
                  )}
                  <p className="text-xs text-primary-600 mt-3">
                    Clavien-Dindo Grade III+ means complications requiring surgical, endoscopic, or radiological intervention.
                    Under 3-5% is considered good.
                  </p>
                </div>
              )}
            </div>

            {/* Insurance */}
            {provider.acceptsInsurance && (
              <div className="card-solid">
                <h3 className="font-heading font-semibold text-secondary-dark mb-2">Insurance</h3>
                {provider.insuranceNetworks?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {provider.insuranceNetworks.map(ins => (
                      <span key={ins} className="badge-accent text-xs">{ins}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-secondary-light">
                    Contact the office for insurance details.
                  </p>
                )}
              </div>
            )}

            {/* Wait time */}
            {provider.waitTimeMonths != null && (
              <div className="card-solid">
                <h3 className="font-heading font-semibold text-secondary-dark mb-1">Wait Time</h3>
                <p className="text-2xl font-heading font-bold text-primary">
                  ~{provider.waitTimeMonths} month{provider.waitTimeMonths !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Self-reported. Contact office to confirm.
                </p>
              </div>
            )}

            {/* Languages */}
            {provider.languages?.length > 0 && (
              <div className="card-solid">
                <h3 className="font-heading font-semibold text-secondary-dark mb-2">Languages</h3>
                <div className="flex flex-wrap gap-1.5">
                  {provider.languages.map(l => (
                    <span key={l} className="badge-accent text-xs">{l}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Medical disclaimer */}
        <div className="medical-disclaimer text-center mt-12">
          <p className="font-heading font-semibold">For learning, not for diagnosing</p>
          <p className="text-sm text-primary-700 mt-1">
            Always verify information directly with the provider&apos;s office before making care decisions.
          </p>
        </div>
      </main>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-secondary-dark uppercase tracking-wide">{label}</p>
      <p className="text-secondary-light mt-0.5">{value}</p>
    </div>
  );
}
