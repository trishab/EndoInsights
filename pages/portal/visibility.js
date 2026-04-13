import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { VISIBILITY_CONTROLLED_FIELDS } from '../../lib/constants';

const VISIBILITY_OPTIONS = [
  {
    value: 'public',
    label: 'Public',
    description: 'Visible to everyone browsing the directory',
    color: 'bg-primary-100 text-primary-700 border-primary-200',
  },
  {
    value: 'on_request',
    label: 'On Request',
    description: 'Shown only when a patient specifically requests this data',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  {
    value: 'backend_only',
    label: 'Backend Only',
    description: 'Used for matching algorithms but never shown to patients',
    color: 'bg-gray-100 text-gray-600 border-gray-200',
  },
];

function VisibilityToggle({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {VISIBILITY_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
            value === opt.value
              ? opt.color + ' ring-2 ring-offset-1 ring-current/20'
              : 'bg-white text-secondary-light border-border hover:border-secondary-light'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function VisibilitySettings() {
  const { data: session } = useSession();
  const [visibility, setVisibility] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    fetch('/api/portal/visibility')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setVisibility(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const updateVisibility = (field, value) => {
    setVisibility((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/portal/visibility', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visibility),
      });
      if (res.ok) {
        const data = await res.json();
        setVisibility(data);
        setSaveMsg('Visibility settings saved');
      } else {
        setSaveMsg('Error saving. Please try again.');
      }
    } catch {
      setSaveMsg('Error saving. Please try again.');
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-secondary-light">Loading visibility settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <Head>
        <title>Visibility Settings | EndEndo Provider Portal</title>
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
            <Link href="/portal" className="hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/portal/profile" className="hover:text-primary transition-colors">
              Edit Profile
            </Link>
            <Link href="/portal/visibility" className="text-primary font-semibold">
              Visibility
            </Link>
          </div>
        </nav>
      </header>

      <main className="section-container py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-secondary-dark">Visibility Settings</h1>
          <p className="text-secondary-light mt-1">
            Control how your information appears to patients in the directory.
          </p>
        </div>

        {/* Legend */}
        <div className="card-solid mb-6">
          <h3 className="font-heading font-semibold text-secondary-dark mb-3">Visibility Levels</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {VISIBILITY_OPTIONS.map((opt) => (
              <div key={opt.value} className="flex gap-3">
                <span className={`badge ${opt.color} flex-shrink-0`}>{opt.label}</span>
                <p className="text-sm text-secondary-light">{opt.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Field Controls */}
        <div className="card-solid">
          <div className="space-y-1">
            {VISIBILITY_CONTROLLED_FIELDS.map((field, idx) => (
              <div
                key={field.field}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 ${
                  idx < VISIBILITY_CONTROLLED_FIELDS.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-secondary-dark">{field.label}</p>
                  <p className="text-xs text-secondary-light">
                    Default: {field.defaultVisibility === 'public' ? 'Public' : field.defaultVisibility === 'on_request' ? 'On Request' : 'Backend Only'}
                  </p>
                </div>
                <VisibilityToggle
                  value={visibility[field.field] || field.defaultVisibility}
                  onChange={(val) => updateVisibility(field.field, val)}
                />
              </div>
            ))}
          </div>

          {/* Save */}
          <div className="mt-8 pt-6 border-t border-border flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Visibility Settings'}
            </button>
            {saveMsg && (
              <span
                className={`text-sm font-medium ${
                  saveMsg.includes('Error') ? 'text-red-600' : 'text-primary'
                }`}
              >
                {saveMsg}
              </span>
            )}
          </div>
        </div>
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
