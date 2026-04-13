import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { PROVIDER_TYPES } from '../../lib/constants';

// Fields that contribute to profile completeness
const PROFILE_FIELDS = [
  { key: 'name', label: 'Full Name' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'country', label: 'Country' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'website', label: 'Website' },
  { key: 'practiceName', label: 'Practice Name' },
  { key: 'notes', label: 'Bio / About' },
  { key: 'providerType', label: 'Provider Type' },
  { key: 'languages', label: 'Languages' },
  { key: 'telehealth', label: 'Telehealth' },
  { key: 'abogCertification', label: 'ABOG Certification' },
  { key: 'migsFellowshipTraining', label: 'MIGS Fellowship' },
  { key: 'surgicalVolumeExcisionHours', label: 'Surgical Volume (Hours)' },
  { key: 'hasMultidisciplinaryTeam', label: 'Multidisciplinary Team' },
  { key: 'treatmentPhilosophy', label: 'Treatment Philosophy' },
  { key: 'imagingCapabilities', label: 'Imaging Capabilities' },
  { key: 'acceptsInsurance', label: 'Insurance Information' },
  { key: 'completesFmla', label: 'FMLA Support' },
];

function isFieldFilled(profile, key) {
  const val = profile[key];
  if (val === null || val === undefined || val === '') return false;
  if (Array.isArray(val) && val.length === 0) return false;
  if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0) return false;
  return true;
}

export default function ProviderDashboard() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.isDoctor) {
      fetch('/api/portal/profile')
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) setProfile(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [session, status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-secondary-light">Loading...</div>
      </div>
    );
  }

  const filledFields = profile
    ? PROFILE_FIELDS.filter((f) => isFieldFilled(profile, f.key))
    : [];
  const emptyFields = profile
    ? PROFILE_FIELDS.filter((f) => !isFieldFilled(profile, f.key))
    : PROFILE_FIELDS;
  const completionPct = profile
    ? Math.round((filledFields.length / PROFILE_FIELDS.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-muted">
      <Head>
        <title>Provider Dashboard | EndEndo</title>
      </Head>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20">
        <nav className="section-container-wide py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-heading font-bold">
              <span className="text-primary">End</span>
              <span className="text-secondary">Endo</span>
            </span>
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium text-secondary-light">
            <Link href="/portal" className="text-primary font-semibold">
              Dashboard
            </Link>
            <Link href="/portal/profile" className="hover:text-primary transition-colors">
              Edit Profile
            </Link>
            <Link href="/portal/visibility" className="hover:text-primary transition-colors">
              Visibility
            </Link>
            <Link href="/api/auth/signout" className="hover:text-primary transition-colors">
              Sign Out
            </Link>
          </div>
        </nav>
      </header>

      <main className="section-container-wide py-10">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-secondary-dark">
            Welcome back{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-secondary-light mt-1">
            Manage your EndEndo provider profile and control your visibility settings.
          </p>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Profile Completion Card */}
          <div className="card-solid">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-secondary-dark">Profile Completion</h3>
              <span className="text-2xl font-bold text-primary">{completionPct}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <p className="text-xs text-secondary-light">
              {filledFields.length} of {PROFILE_FIELDS.length} fields completed
            </p>
          </div>

          {/* Provider Type */}
          <div className="card-solid">
            <h3 className="font-heading font-semibold text-secondary-dark mb-2">Provider Type</h3>
            <p className="text-primary font-medium">
              {profile?.providerType
                ? PROVIDER_TYPES[profile.providerType]?.label || profile.providerType
                : 'Not set'}
            </p>
            <p className="text-xs text-secondary-light mt-1">
              {profile?.city && profile?.state
                ? `${profile.city}, ${profile.state}`
                : 'Location not set'}
            </p>
          </div>

          {/* Verification Status */}
          <div className="card-solid">
            <h3 className="font-heading font-semibold text-secondary-dark mb-2">Verification</h3>
            <span
              className={`badge ${
                profile?.verificationStatus === 'verified'
                  ? 'badge-green'
                  : profile?.verificationStatus === 'pending'
                  ? 'badge-amber'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {profile?.verificationStatus
                ? profile.verificationStatus.charAt(0).toUpperCase() +
                  profile.verificationStatus.slice(1)
                : 'Unverified'}
            </span>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/portal/profile" className="card-solid hover:shadow-md hover:border-primary/30 transition-all group">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="font-heading font-semibold text-secondary-dark group-hover:text-primary transition-colors">
              Edit Profile
            </h3>
            <p className="text-sm text-secondary-light mt-1">
              Update your credentials, specialties, surgical volume, and more.
            </p>
          </Link>

          <Link href="/portal/visibility" className="card-solid hover:shadow-md hover:border-primary/30 transition-all group">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="font-heading font-semibold text-secondary-dark group-hover:text-primary transition-colors">
              Visibility Settings
            </h3>
            <p className="text-sm text-secondary-light mt-1">
              Control which fields are public, on-request, or backend only.
            </p>
          </Link>

          <a
            href={profile ? `/providers/${profile.id}` : '#'}
            className="card-solid hover:shadow-md hover:border-primary/30 transition-all group"
          >
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <h3 className="font-heading font-semibold text-secondary-dark group-hover:text-primary transition-colors">
              View Public Profile
            </h3>
            <p className="text-sm text-secondary-light mt-1">
              See how patients see your profile in the directory.
            </p>
          </a>
        </div>

        {/* Empty Fields to Fill */}
        {emptyFields.length > 0 && (
          <div className="card-solid">
            <h3 className="font-heading font-semibold text-secondary-dark mb-1">
              Improve your matching
            </h3>
            <p className="text-sm text-secondary-light mb-4">
              Fill in these fields to help patients find and match with you more accurately.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {emptyFields.map((f) => (
                <Link
                  key={f.key}
                  href="/portal/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary-50/50 transition-all"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                  <span className="text-sm text-secondary-dark">{f.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session || !session.user?.isDoctor) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }

  return { props: {} };
}
