import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import TabButton from '../../components/portal/TabButton';
import {
  PROVIDER_TYPES,
  TREATMENT_PHILOSOPHIES,
  HYSTERECTOMY_APPROACHES,
  SURGERY_APPROACHES,
  TVUS_PROTOCOLS,
  US_STATES,
  PRACTICE_SETTINGS,
} from '../../lib/constants';

const TABS = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'surgical', label: 'Surgical Volume' },
  { id: 'team', label: 'Team & Approach' },
  { id: 'imaging', label: 'Imaging & Diagnostics' },
  { id: 'insurance', label: 'Insurance & Cost' },
  { id: 'fmla', label: 'FMLA & Disability' },
  { id: 'outcomes', label: 'Outcomes & Research' },
];

const INPUT_CLASS =
  'w-full px-4 py-2.5 border border-border rounded-xl bg-white text-secondary-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';
const LABEL_CLASS = 'block text-sm font-medium text-secondary-dark mb-1';
const CHECKBOX_WRAPPER = 'flex items-center gap-3';

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      {label && <span className="text-sm text-secondary-dark">{label}</span>}
    </label>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label className={CHECKBOX_WRAPPER + ' cursor-pointer'}>
      <div
        onClick={() => onChange(!checked)}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
          checked
            ? 'bg-primary border-primary'
            : 'bg-white border-border hover:border-primary/50'
        }`}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-sm text-secondary-dark">{label}</span>
    </label>
  );
}

export default function ProfileEditor() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('basic');
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    fetch('/api/portal/profile')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const updateField = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const updateNestedField = (parentKey, childKey, value) => {
    setProfile((prev) => ({
      ...prev,
      [parentKey]: { ...(prev[parentKey] || {}), [childKey]: value },
    }));
  };

  const saveTab = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setSaveMsg('Saved successfully');
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
        <div className="text-secondary-light">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <Head>
        <title>Edit Profile | EndEndo Provider Portal</title>
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
            <Link href="/portal/profile" className="text-primary font-semibold">
              Edit Profile
            </Link>
            <Link href="/portal/visibility" className="hover:text-primary transition-colors">
              Visibility
            </Link>
          </div>
        </nav>
      </header>

      <main className="section-container-wide py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-secondary-dark">Edit Your Profile</h1>
          <p className="text-secondary-light mt-1">
            Keep your information accurate to improve patient matching.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-1 border-b border-border mb-6 -mx-1 px-1">
          {TABS.map((tab) => (
            <TabButton
              key={tab.id}
              label={tab.label}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>

        {/* Tab Content */}
        <div className="card-solid">
          {activeTab === 'basic' && (
            <BasicInfoTab profile={profile} updateField={updateField} />
          )}
          {activeTab === 'certifications' && (
            <CertificationsTab profile={profile} updateField={updateField} />
          )}
          {activeTab === 'surgical' && (
            <SurgicalVolumeTab profile={profile} updateField={updateField} />
          )}
          {activeTab === 'team' && (
            <TeamApproachTab profile={profile} updateField={updateField} />
          )}
          {activeTab === 'imaging' && (
            <ImagingTab profile={profile} updateField={updateField} updateNestedField={updateNestedField} />
          )}
          {activeTab === 'insurance' && (
            <InsuranceCostTab profile={profile} updateField={updateField} />
          )}
          {activeTab === 'fmla' && (
            <FmlaTab profile={profile} updateField={updateField} />
          )}
          {activeTab === 'outcomes' && (
            <OutcomesTab profile={profile} updateField={updateField} />
          )}

          {/* Save button */}
          <div className="mt-8 pt-6 border-t border-border flex items-center gap-4">
            <button
              onClick={saveTab}
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
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

// ============================================================================
// TAB: Basic Info
// ============================================================================
function BasicInfoTab({ profile, updateField }) {
  const LANGUAGE_OPTIONS = [
    'English', 'Spanish', 'French', 'Mandarin', 'Cantonese', 'Hindi', 'Arabic',
    'Portuguese', 'Korean', 'Japanese', 'Vietnamese', 'Tagalog', 'German',
    'Italian', 'Russian', 'ASL',
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-heading font-semibold text-secondary-dark">Basic Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={LABEL_CLASS}>Full Name</label>
          <input
            type="text"
            value={profile.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Practice Name</label>
          <input
            type="text"
            value={profile.practiceName || ''}
            onChange={(e) => updateField('practiceName', e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className={LABEL_CLASS}>City</label>
          <input
            type="text"
            value={profile.city || ''}
            onChange={(e) => updateField('city', e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>State</label>
          <select
            value={profile.state || ''}
            onChange={(e) => updateField('state', e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">Select state</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>Country</label>
          <input
            type="text"
            value={profile.country || ''}
            onChange={(e) => updateField('country', e.target.value)}
            className={INPUT_CLASS}
            placeholder="USA"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={LABEL_CLASS}>Phone</label>
          <input
            type="tel"
            value={profile.phone || ''}
            onChange={(e) => updateField('phone', e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Email</label>
          <input
            type="email"
            value={profile.email || ''}
            onChange={(e) => updateField('email', e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div>
        <label className={LABEL_CLASS}>Website</label>
        <input
          type="url"
          value={profile.website || ''}
          onChange={(e) => updateField('website', e.target.value)}
          className={INPUT_CLASS}
          placeholder="https://"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Bio / About</label>
        <textarea
          value={profile.notes || ''}
          onChange={(e) => updateField('notes', e.target.value)}
          className={INPUT_CLASS + ' min-h-[120px] resize-y'}
          placeholder="Tell patients about your practice, approach, and experience with endometriosis..."
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Provider Type</label>
        <select
          value={profile.providerType || ''}
          onChange={(e) => updateField('providerType', e.target.value)}
          className={INPUT_CLASS}
        >
          <option value="">Select provider type</option>
          {Object.entries(PROVIDER_TYPES).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={LABEL_CLASS}>Gender Identity</label>
        <select
          value={profile.patientGenderPreference || ''}
          onChange={(e) => updateField('patientGenderPreference', e.target.value)}
          className={INPUT_CLASS}
        >
          <option value="">Prefer not to say</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="non-binary">Non-binary</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className={LABEL_CLASS}>Languages Spoken</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-1">
          {LANGUAGE_OPTIONS.map((lang) => (
            <Checkbox
              key={lang}
              label={lang}
              checked={(profile.languages || []).includes(lang)}
              onChange={(checked) => {
                const current = profile.languages || [];
                updateField(
                  'languages',
                  checked ? [...current, lang] : current.filter((l) => l !== lang)
                );
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-8">
        <Toggle
          label="Accepting New Patients"
          checked={profile.acceptingNewPatients ?? true}
          onChange={(val) => updateField('acceptingNewPatients', val)}
        />
        <Toggle
          label="Offers Telehealth"
          checked={profile.telehealth ?? false}
          onChange={(val) => updateField('telehealth', val)}
        />
      </div>
    </div>
  );
}

// ============================================================================
// TAB: Certifications
// ============================================================================
function CertificationsTab({ profile, updateField }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-heading font-semibold text-secondary-dark">Certifications</h2>

      <div className="space-y-4">
        <Toggle
          label="ABOG Board Certified"
          checked={profile.abogCertification ?? false}
          onChange={(val) => updateField('abogCertification', val)}
        />
        {profile.abogCertification && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
            <div>
              <label className={LABEL_CLASS}>ABOG Certification Start Date</label>
              <input
                type="date"
                value={profile.abogCertificationStartDate ? new Date(profile.abogCertificationStartDate).toISOString().split('T')[0] : ''}
                onChange={(e) => updateField('abogCertificationStartDate', e.target.value || null)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Recertification Status Date</label>
              <input
                type="date"
                value={profile.abogRecertificationStatusDate ? new Date(profile.abogRecertificationStatusDate).toISOString().split('T')[0] : ''}
                onChange={(e) => updateField('abogRecertificationStatusDate', e.target.value || null)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>ABOG ID</label>
              <input
                type="text"
                value={profile.abogId || ''}
                onChange={(e) => updateField('abogId', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <Toggle
                label="Continuing Education Current"
                checked={profile.abogContinuingEducationStatus ?? false}
                onChange={(val) => updateField('abogContinuingEducationStatus', val)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Toggle
          label="ABMS Board Certified"
          checked={profile.abmsCertification ?? false}
          onChange={(val) => updateField('abmsCertification', val)}
        />
        {profile.abmsCertification && (
          <div className="ml-8">
            <label className={LABEL_CLASS}>ABMS ID</label>
            <input
              type="text"
              value={profile.abmsId || ''}
              onChange={(e) => updateField('abmsId', e.target.value)}
              className={INPUT_CLASS + ' max-w-md'}
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Toggle
          label="MIGS Fellowship Training"
          checked={profile.migsFellowshipTraining ?? false}
          onChange={(val) => updateField('migsFellowshipTraining', val)}
        />
        {profile.migsFellowshipTraining && (
          <div className="ml-8">
            <label className={LABEL_CLASS}>Training Year End Date</label>
            <input
              type="number"
              value={profile.trainingYearEndDate || ''}
              onChange={(e) => updateField('trainingYearEndDate', parseInt(e.target.value) || null)}
              className={INPUT_CLASS + ' max-w-xs'}
              placeholder="e.g. 2020"
            />
          </div>
        )}
      </div>

      <div>
        <label className={LABEL_CLASS}>Additional Certifications</label>
        <textarea
          value={(profile.additionalCertifications || []).join('\n')}
          onChange={(e) =>
            updateField(
              'additionalCertifications',
              e.target.value.split('\n').filter((s) => s.trim())
            )
          }
          className={INPUT_CLASS + ' min-h-[80px] resize-y'}
          placeholder="One certification per line"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={LABEL_CLASS}>Annual CME (Endo-Related)</label>
          <input
            type="text"
            value={profile.annualCmeEndoRelated || ''}
            onChange={(e) => updateField('annualCmeEndoRelated', e.target.value)}
            className={INPUT_CLASS}
            placeholder="e.g. 40 hours"
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>CME Last Updated (Month/Year)</label>
          <input
            type="text"
            value={profile.annualCmeMonthYear || ''}
            onChange={(e) => updateField('annualCmeMonthYear', e.target.value)}
            className={INPUT_CLASS}
            placeholder="e.g. March 2025"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TAB: Surgical Volume
// ============================================================================
function SurgicalVolumeTab({ profile, updateField }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-heading font-semibold text-secondary-dark">Surgical Volume</h2>

      <div>
        <label className={LABEL_CLASS}>Annual Excision Hours</label>
        <input
          type="number"
          value={profile.surgicalVolumeExcisionHours || ''}
          onChange={(e) => updateField('surgicalVolumeExcisionHours', parseInt(e.target.value) || null)}
          className={INPUT_CLASS + ' max-w-xs'}
          placeholder="e.g. 500"
        />
      </div>

      <Checkbox
        label="200+ excision surgeries performed"
        checked={profile.surgicalVolume200Excisions ?? false}
        onChange={(val) => updateField('surgicalVolume200Excisions', val)}
      />

      <div>
        <label className={LABEL_CLASS}>Documentation / Supporting Evidence</label>
        <textarea
          value={profile.surgicalVolumeDocumentation || ''}
          onChange={(e) => updateField('surgicalVolumeDocumentation', e.target.value)}
          className={INPUT_CLASS + ' min-h-[80px] resize-y'}
          placeholder="Describe how your surgical volume is documented..."
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>
          Major Complication Rate (Clavien-Dindo Grade III+ %)
        </label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={profile.complicationRateMajor ?? ''}
          onChange={(e) => updateField('complicationRateMajor', parseFloat(e.target.value) || null)}
          className={INPUT_CLASS + ' max-w-xs'}
          placeholder="e.g. 2.5"
        />
        <p className="text-xs text-secondary-light mt-1">
          Percentage of cases with Grade III or higher complications.
        </p>
      </div>

      <Toggle
        label="Dedicated Surgical Practice (primarily surgical)"
        checked={profile.dedicatedSurgicalPractice ?? false}
        onChange={(val) => updateField('dedicatedSurgicalPractice', val)}
      />

      <div>
        <label className={LABEL_CLASS}>Practice Setting</label>
        <select
          value={profile.practiceSetting || ''}
          onChange={(e) => updateField('practiceSetting', e.target.value)}
          className={INPUT_CLASS + ' max-w-md'}
        >
          <option value="">Select setting</option>
          {Object.entries(PRACTICE_SETTINGS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ============================================================================
// TAB: Team & Approach
// ============================================================================
function TeamApproachTab({ profile, updateField }) {
  const TEAM_SPECIALTIES_OPTIONS = [
    'Colorectal Surgery', 'Urology', 'Cardiothoracic Surgery', 'Pelvic Floor PT',
    'Pain Management', 'Mental Health', 'Nutrition', 'Fertility/REI',
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-heading font-semibold text-secondary-dark">Team & Approach</h2>

      <Toggle
        label="Has Multidisciplinary Team"
        checked={profile.hasMultidisciplinaryTeam ?? false}
        onChange={(val) => updateField('hasMultidisciplinaryTeam', val)}
      />

      {profile.hasMultidisciplinaryTeam && (
        <div>
          <label className={LABEL_CLASS}>Team Specialties</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
            {TEAM_SPECIALTIES_OPTIONS.map((spec) => (
              <Checkbox
                key={spec}
                label={spec}
                checked={(profile.teamSpecialties || []).includes(spec)}
                onChange={(checked) => {
                  const current = profile.teamSpecialties || [];
                  updateField(
                    'teamSpecialties',
                    checked ? [...current, spec] : current.filter((s) => s !== spec)
                  );
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className={LABEL_CLASS}>Bowel Surgery Approach</label>
          <select
            value={profile.bowelSurgeryApproach || ''}
            onChange={(e) => updateField('bowelSurgeryApproach', e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">Select approach</option>
            {Object.entries(SURGERY_APPROACHES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>Bladder Surgery Approach</label>
          <select
            value={profile.bladderSurgeryApproach || ''}
            onChange={(e) => updateField('bladderSurgeryApproach', e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">Select approach</option>
            {Object.entries(SURGERY_APPROACHES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>Diaphragm Surgery Approach</label>
          <select
            value={profile.diaphragmSurgeryApproach || ''}
            onChange={(e) => updateField('diaphragmSurgeryApproach', e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">Select approach</option>
            {Object.entries(SURGERY_APPROACHES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={LABEL_CLASS}>Treatment Philosophy</label>
        <select
          value={profile.treatmentPhilosophy || ''}
          onChange={(e) => updateField('treatmentPhilosophy', e.target.value)}
          className={INPUT_CLASS + ' max-w-md'}
        >
          <option value="">Select philosophy</option>
          {Object.entries(TREATMENT_PHILOSOPHIES).map(([key, val]) => (
            <option key={key} value={key}>{val.label} -- {val.description}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={LABEL_CLASS}>Uterus Preservation Approach</label>
        <select
          value={profile.uterusPreservation || ''}
          onChange={(e) => updateField('uterusPreservation', e.target.value)}
          className={INPUT_CLASS + ' max-w-md'}
        >
          <option value="">Select approach</option>
          <option value="priority">Uterus preservation is a priority</option>
          <option value="case_by_case">Evaluated case by case</option>
          <option value="not_applicable">Not applicable</option>
        </select>
      </div>

      <Toggle
        label="Fertility Focus"
        checked={profile.fertilityFocus ?? false}
        onChange={(val) => updateField('fertilityFocus', val)}
      />

      <div>
        <label className={LABEL_CLASS}>Approach to Hysterectomy</label>
        <select
          value={profile.approachToHysterectomy || ''}
          onChange={(e) => updateField('approachToHysterectomy', e.target.value)}
          className={INPUT_CLASS + ' max-w-md'}
        >
          <option value="">Select approach</option>
          {Object.entries(HYSTERECTOMY_APPROACHES).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={LABEL_CLASS}>Patient Autonomy</label>
        <select
          value={profile.patientAutonomy || ''}
          onChange={(e) => updateField('patientAutonomy', e.target.value)}
          className={INPUT_CLASS + ' max-w-md'}
        >
          <option value="">Select level</option>
          <option value="high">High -- Patient leads care decisions</option>
          <option value="collaborative">Collaborative -- Decisions made together</option>
          <option value="provider_guided">Provider-guided -- Expert guidance leads</option>
        </select>
      </div>

      <Toggle
        label="Faith-Based Practice"
        checked={profile.faithBased ?? false}
        onChange={(val) => updateField('faithBased', val)}
      />

      <Toggle
        label="Trauma-Informed Care"
        checked={profile.traumaInformed ?? false}
        onChange={(val) => updateField('traumaInformed', val)}
      />
    </div>
  );
}

// ============================================================================
// TAB: Imaging & Diagnostics
// ============================================================================
function ImagingTab({ profile, updateField, updateNestedField }) {
  const imaging = profile.imagingCapabilities || {};
  const tvus = imaging.tvus || {};
  const mri = imaging.mri || {};
  const otherImaging = imaging.otherImaging || {};

  const updateImaging = (section, key, value) => {
    const currentImaging = profile.imagingCapabilities || {};
    const currentSection = currentImaging[section] || {};
    updateField('imagingCapabilities', {
      ...currentImaging,
      [section]: { ...currentSection, [key]: value },
    });
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-heading font-semibold text-secondary-dark">Imaging & Diagnostics</h2>

      {/* TVUS Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-heading font-semibold text-secondary-dark border-b border-border pb-2">
          Transvaginal Ultrasound (TVUS)
        </h3>

        <Toggle
          label="Performs TVUS"
          checked={tvus.performsTvus ?? false}
          onChange={(val) => updateImaging('tvus', 'performsTvus', val)}
        />
        <Toggle
          label="Interprets TVUS"
          checked={tvus.interpretsTvus ?? false}
          onChange={(val) => updateImaging('tvus', 'interpretsTvus', val)}
        />
        <Toggle
          label="TVUS Endo-Trained"
          checked={tvus.tvusEndoTrained ?? false}
          onChange={(val) => updateImaging('tvus', 'tvusEndoTrained', val)}
        />
        <div>
          <label className={LABEL_CLASS}>TVUS Protocol</label>
          <select
            value={tvus.tvusProtocol || ''}
            onChange={(e) => updateImaging('tvus', 'tvusProtocol', e.target.value)}
            className={INPUT_CLASS + ' max-w-md'}
          >
            <option value="">Select protocol</option>
            {Object.entries(TVUS_PROTOCOLS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <Toggle
          label="Refers TVUS to Specialist"
          checked={tvus.refersTvus ?? false}
          onChange={(val) => updateImaging('tvus', 'refersTvus', val)}
        />
      </div>

      {/* MRI Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-heading font-semibold text-secondary-dark border-b border-border pb-2">
          MRI
        </h3>

        <Toggle
          label="Reads MRI Directly"
          checked={mri.readsMriDirectly ?? false}
          onChange={(val) => updateImaging('mri', 'readsMriDirectly', val)}
        />
        <Toggle
          label="Reviews Impression Only"
          checked={mri.reviewsImpressionOnly ?? false}
          onChange={(val) => updateImaging('mri', 'reviewsImpressionOnly', val)}
        />
        <Toggle
          label="Interprets Endo-Specific Findings"
          checked={mri.interpretsEndoFindings ?? false}
          onChange={(val) => updateImaging('mri', 'interpretsEndoFindings', val)}
        />
        <Toggle
          label="Orders Endo-Protocol MRI"
          checked={mri.ordersEndoProtocolMri ?? false}
          onChange={(val) => updateImaging('mri', 'ordersEndoProtocolMri', val)}
        />
        <Toggle
          label="Collaborates with Radiologist"
          checked={mri.collaboratesWithRadiologist ?? false}
          onChange={(val) => updateImaging('mri', 'collaboratesWithRadiologist', val)}
        />
      </div>

      {/* Other Imaging */}
      <div className="space-y-4">
        <h3 className="text-lg font-heading font-semibold text-secondary-dark border-b border-border pb-2">
          Other Diagnostics
        </h3>

        <Toggle
          label="Renal Ultrasound"
          checked={otherImaging.renalUltrasound ?? false}
          onChange={(val) => updateImaging('otherImaging', 'renalUltrasound', val)}
        />
        <Toggle
          label="Colonoscopy"
          checked={otherImaging.colonoscopy ?? false}
          onChange={(val) => updateImaging('otherImaging', 'colonoscopy', val)}
        />
      </div>
    </div>
  );
}

// ============================================================================
// TAB: Insurance & Cost
// ============================================================================
function InsuranceCostTab({ profile, updateField }) {
  const INSURANCE_NETWORKS = [
    'Aetna', 'Anthem/BCBS', 'Cigna', 'Humana', 'Kaiser Permanente',
    'Medicare', 'Medicaid', 'Tricare', 'UnitedHealthcare', 'Other',
  ];

  const PAYMENT_OPTIONS = [
    'Cash', 'Check', 'Credit Card', 'HSA/FSA', 'Payment Plan', 'Sliding Scale',
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-heading font-semibold text-secondary-dark">Insurance & Cost</h2>

      <Toggle
        label="Accepts Insurance"
        checked={profile.acceptsInsurance ?? false}
        onChange={(val) => updateField('acceptsInsurance', val)}
      />

      {profile.acceptsInsurance && (
        <div>
          <label className={LABEL_CLASS}>Insurance Networks</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
            {INSURANCE_NETWORKS.map((network) => (
              <Checkbox
                key={network}
                label={network}
                checked={(profile.insuranceNetworks || []).includes(network)}
                onChange={(checked) => {
                  const current = profile.insuranceNetworks || [];
                  updateField(
                    'insuranceNetworks',
                    checked ? [...current, network] : current.filter((n) => n !== network)
                  );
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <label className={LABEL_CLASS}>Out-of-Pocket Cost Estimate</label>
        <input
          type="text"
          value={profile.outOfPocketCost || ''}
          onChange={(e) => updateField('outOfPocketCost', e.target.value)}
          className={INPUT_CLASS + ' max-w-md'}
          placeholder="e.g. $5,000 - $15,000 for excision surgery"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Cost Breakdown</label>
        <textarea
          value={profile.costBreakdown || ''}
          onChange={(e) => updateField('costBreakdown', e.target.value)}
          className={INPUT_CLASS + ' min-h-[80px] resize-y'}
          placeholder="Break down typical costs: surgeon fee, facility fee, anesthesia, etc."
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Payment Options</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
          {PAYMENT_OPTIONS.map((option) => (
            <Checkbox
              key={option}
              label={option}
              checked={(profile.paymentOptions || []).includes(option)}
              onChange={(checked) => {
                const current = profile.paymentOptions || [];
                updateField(
                  'paymentOptions',
                  checked ? [...current, option] : current.filter((o) => o !== option)
                );
              }}
            />
          ))}
        </div>
      </div>

      <Toggle
        label="Offers Bundled Services"
        checked={profile.bundledServices ?? false}
        onChange={(val) => updateField('bundledServices', val)}
      />
    </div>
  );
}

// ============================================================================
// TAB: FMLA & Disability
// ============================================================================
function FmlaTab({ profile, updateField }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-heading font-semibold text-secondary-dark">FMLA & Disability</h2>

      <div className="medical-disclaimer text-sm">
        <p className="font-semibold mb-1">Why this matters</p>
        <p>
          Many endometriosis patients rely on FMLA and disability documentation for surgical recovery.
          Indicating your willingness to complete this paperwork helps patients plan accordingly.
        </p>
      </div>

      <Toggle
        label="Completes FMLA Paperwork"
        checked={profile.completesFmla ?? false}
        onChange={(val) => updateField('completesFmla', val)}
      />

      <Toggle
        label="Completes Disability Paperwork"
        checked={profile.completesDisabilityPaperwork ?? false}
        onChange={(val) => updateField('completesDisabilityPaperwork', val)}
      />

      <div>
        <label className={LABEL_CLASS}>Typical Response Time (Business Days)</label>
        <input
          type="number"
          min="1"
          value={profile.fmlaResponseTimeDays || ''}
          onChange={(e) => updateField('fmlaResponseTimeDays', parseInt(e.target.value) || null)}
          className={INPUT_CLASS + ' max-w-xs'}
          placeholder="e.g. 5"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Additional Notes</label>
        <textarea
          value={profile.fmlaDisabilityNotes || ''}
          onChange={(e) => updateField('fmlaDisabilityNotes', e.target.value)}
          className={INPUT_CLASS + ' min-h-[80px] resize-y'}
          placeholder="Any specific policies or details about FMLA/disability paperwork handling..."
        />
      </div>
    </div>
  );
}

// ============================================================================
// TAB: Outcomes & Research
// ============================================================================
function OutcomesTab({ profile, updateField }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-heading font-semibold text-secondary-dark">Outcomes & Research</h2>

      <div>
        <label className={LABEL_CLASS}>Publication PIDs (PubMed IDs)</label>
        <textarea
          value={(profile.publicationsPids || []).join('\n')}
          onChange={(e) =>
            updateField(
              'publicationsPids',
              e.target.value.split('\n').filter((s) => s.trim())
            )
          }
          className={INPUT_CLASS + ' min-h-[80px] resize-y'}
          placeholder="One PubMed ID per line, e.g. 12345678"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Clinical Trials NCT Numbers</label>
        <textarea
          value={(profile.clinicalTrialsNctNumbers || []).join('\n')}
          onChange={(e) =>
            updateField(
              'clinicalTrialsNctNumbers',
              e.target.value.split('\n').filter((s) => s.trim())
            )
          }
          className={INPUT_CLASS + ' min-h-[80px] resize-y'}
          placeholder="One NCT number per line, e.g. NCT01234567"
        />
      </div>

      <div>
        <label className={LABEL_CLASS}>Patient Outcome Review Links</label>
        <textarea
          value={(profile.patientOutcomeReviewLinks || []).join('\n')}
          onChange={(e) =>
            updateField(
              'patientOutcomeReviewLinks',
              e.target.value.split('\n').filter((s) => s.trim())
            )
          }
          className={INPUT_CLASS + ' min-h-[80px] resize-y'}
          placeholder="One URL per line"
        />
      </div>

      <Toggle
        label="Tracks Patient Outcomes Systematically"
        checked={profile.tracksOutcomes ?? false}
        onChange={(val) => updateField('tracksOutcomes', val)}
      />

      <div className="space-y-3">
        <h3 className="text-lg font-heading font-semibold text-secondary-dark">Transparency</h3>
        <Toggle
          label="Provides Operative Photos"
          checked={profile.providesOperativePhotos ?? false}
          onChange={(val) => updateField('providesOperativePhotos', val)}
        />
        <Toggle
          label="Provides Operative Reports"
          checked={profile.providesOperativeReports ?? false}
          onChange={(val) => updateField('providesOperativeReports', val)}
        />
        <Toggle
          label="Shares Pathology Results"
          checked={profile.sharesPathologyResults ?? false}
          onChange={(val) => updateField('sharesPathologyResults', val)}
        />
      </div>
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
