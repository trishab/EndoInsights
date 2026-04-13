import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { PROVIDER_TYPES, US_STATES, INTL_REGISTRATION_TYPES } from '../../lib/constants';

const STEPS = ['npi', 'details', 'account'];

export default function ProviderRegistration() {
  const router = useRouter();
  const [step, setStep] = useState('npi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isInternational, setIsInternational] = useState(false);

  // NPI verification state
  const [npi, setNpi] = useState('');
  const [npiResult, setNpiResult] = useState(null);
  const [duplicate, setDuplicate] = useState(null);

  // Account creation state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    providerType: '',
    city: '',
    state: '',
    country: 'United States',
    countryRegistrationNumber: '',
    countryRegistrationType: '',
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Step 1: Verify NPI
  const handleNpiVerify = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/npi/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ npi }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setNpiResult(data);
      setDuplicate(data.duplicate);

      // Auto-populate fields from NPI
      setFormData(prev => ({
        ...prev,
        firstName: data.firstName || prev.firstName,
        lastName: data.lastName || prev.lastName,
        providerType: data.suggestedProviderType || prev.providerType,
        city: data.practiceAddress?.city || prev.city,
        state: data.practiceAddress?.state || prev.state,
        email: prev.email,
      }));

      if (data.duplicate?.isDuplicate) {
        // Don't advance — show duplicate message
      } else {
        setStep('details');
      }
    } catch {
      setLoading(false);
      setError('Failed to verify NPI. Please try again.');
    }
  };

  // Step 3: Create account
  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          isDoctor: true,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error);
        return;
      }

      // Registration successful — redirect to login
      router.push('/auth/login?registered=true');
    } catch {
      setLoading(false);
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-muted py-12 px-4">
      <Head>
        <title>Provider Registration | EndEndo</title>
      </Head>

      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="text-3xl font-heading font-bold">
              <span className="text-primary">End</span>
              <span className="text-secondary">Endo</span>
            </span>
          </Link>
          <h1 className="text-2xl font-heading font-bold text-secondary-dark mt-4">
            Provider Registration
          </h1>
          <p className="text-secondary-light mt-2">
            Join the EndEndo directory and connect with patients seeking your expertise.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${step === s ? 'bg-primary text-white' : STEPS.indexOf(step) > i ? 'bg-primary-100 text-primary-700' : 'bg-muted text-secondary-light'}`}>
                {i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-12 h-0.5 ${STEPS.indexOf(step) > i ? 'bg-primary-200' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="alert-warning mb-6 text-sm">{error}</div>
        )}

        {/* Step 1: NPI Verification */}
        {step === 'npi' && (
          <div className="card-solid">
            <h2 className="text-lg font-heading font-semibold text-secondary-dark mb-2">
              Verify Your Credentials
            </h2>

            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setIsInternational(false)}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                  !isInternational ? 'bg-primary-100 text-primary-700' : 'text-secondary-light hover:bg-muted'
                }`}
              >
                US Provider (NPI)
              </button>
              <button
                onClick={() => setIsInternational(true)}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                  isInternational ? 'bg-primary-100 text-primary-700' : 'text-secondary-light hover:bg-muted'
                }`}
              >
                International Provider
              </button>
            </div>

            {!isInternational ? (
              <div className="space-y-4">
                <p className="text-sm text-secondary-light">
                  Enter your NPI number. We&apos;ll verify it with the NPPES registry and auto-populate your profile.
                </p>
                <div>
                  <label className="block text-sm font-medium text-secondary-dark mb-1">
                    NPI Number
                  </label>
                  <input
                    type="text"
                    value={npi}
                    onChange={(e) => setNpi(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit NPI number"
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-white
                               focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    maxLength={10}
                  />
                </div>

                {npiResult && !duplicate?.isDuplicate && (
                  <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 text-sm">
                    <p className="font-semibold text-primary-800">Verified: {npiResult.providerName}</p>
                    <p className="text-primary-700 mt-1">{npiResult.primaryTaxonomyDescription}</p>
                    <p className="text-primary-700">
                      {npiResult.practiceAddress?.city}, {npiResult.practiceAddress?.state}
                    </p>
                  </div>
                )}

                {duplicate?.isDuplicate && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
                    <p className="font-semibold text-amber-800">
                      It looks like you may already be in our directory.
                    </p>
                    <p className="text-amber-700 mt-1">
                      We found a matching profile ({duplicate.matchType === 'npi' ? 'same NPI' : 'similar name and location'}).
                      Would you like to claim and update your existing profile instead?
                    </p>
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={() => router.push(`/portal?claim=${duplicate.existingDoctorId}`)}
                        className="btn-primary text-sm py-2"
                      >
                        Claim Existing Profile
                      </button>
                      <button
                        onClick={() => { setDuplicate(null); setStep('details'); }}
                        className="btn-ghost text-sm"
                      >
                        This isn&apos;t me — continue
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleNpiVerify}
                  disabled={npi.length !== 10 || loading}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify NPI'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-secondary-light">
                  Select your country&apos;s registration system and enter your registration number.
                </p>
                <div>
                  <label className="block text-sm font-medium text-secondary-dark mb-1">
                    Registration System
                  </label>
                  <select
                    value={formData.countryRegistrationType}
                    onChange={(e) => updateField('countryRegistrationType', e.target.value)}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-white
                               focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  >
                    <option value="">Select your country&apos;s system</option>
                    {Object.entries(INTL_REGISTRATION_TYPES).map(([key, val]) => (
                      <option key={key} value={key}>{val.label} — {val.country}</option>
                    ))}
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-dark mb-1">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={formData.countryRegistrationNumber}
                    onChange={(e) => updateField('countryRegistrationNumber', e.target.value)}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-white
                               focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <p className="text-xs text-secondary-light">
                  International registrations require manual verification by our team. You&apos;ll receive an email once your profile is approved.
                </p>
                <button
                  onClick={() => setStep('details')}
                  disabled={!formData.countryRegistrationNumber || !formData.countryRegistrationType}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Profile Details */}
        {step === 'details' && (
          <div className="card-solid">
            <h2 className="text-lg font-heading font-semibold text-secondary-dark mb-4">
              Confirm Your Details
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-dark mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-white
                               focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-dark mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-white
                               focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-dark mb-1">Provider Type</label>
                <select
                  value={formData.providerType}
                  onChange={(e) => updateField('providerType', e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-white
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="">Select your specialty</option>
                  {Object.entries(PROVIDER_TYPES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
                {npiResult?.suggestedProviderType && (
                  <p className="text-xs text-primary-600 mt-1">
                    Auto-detected from your NPI taxonomy. Change if needed.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-dark mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-white
                               focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-dark mb-1">
                    {formData.country === 'United States' ? 'State' : 'Region / Province'}
                  </label>
                  {formData.country === 'United States' ? (
                    <select
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      className="w-full px-4 py-2.5 border border-border rounded-xl bg-white
                                 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    >
                      <option value="">Select</option>
                      {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      className="w-full px-4 py-2.5 border border-border rounded-xl bg-white
                                 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep('npi')} className="btn-ghost">
                  Back
                </button>
                <button
                  onClick={() => setStep('account')}
                  disabled={!formData.firstName || !formData.lastName || !formData.providerType}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Account Creation */}
        {step === 'account' && (
          <div className="card-solid">
            <h2 className="text-lg font-heading font-semibold text-secondary-dark mb-4">
              Create Your Account
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-dark mb-1">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => updateField('username', e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-white
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-dark mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-white
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-dark mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-white
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-dark mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-white
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  minLength={8}
                />
              </div>

              <div className="bg-accent rounded-xl p-4 text-sm text-accent-foreground">
                <p className="font-semibold">By registering, you agree that:</p>
                <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
                  <li>The information you provide may be used to match you with patients seeking care</li>
                  <li>You control which data is publicly visible, shared on request, or kept private</li>
                  <li>Your profile will be reviewed before appearing in the directory</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep('details')} className="btn-ghost">
                  Back
                </button>
                <button
                  onClick={handleRegister}
                  disabled={loading || !formData.username || !formData.email || !formData.password}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-secondary-light mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
