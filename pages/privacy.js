import Head from 'next/head';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-muted">
      <Head>
        <title>Privacy Policy | EndEndo</title>
      </Head>

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20">
        <nav className="section-container-wide py-4 flex items-center justify-between">
          <Link href="/">
            <span className="text-2xl font-heading font-bold">
              <span className="text-primary">End</span>
              <span className="text-secondary">Endo</span>
            </span>
          </Link>
        </nav>
      </header>

      <main className="section-container py-12">
        <div className="card-solid max-w-3xl mx-auto">
          <h1 className="text-3xl font-heading font-bold text-secondary-dark mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: April 13, 2026</p>

          <div className="prose prose-sm max-w-none text-secondary-light space-y-6">
            <section>
              <h2 className="text-lg font-heading font-semibold text-secondary-dark">What We Collect</h2>
              <p><strong>Patient Preferences:</strong> When you use the questionnaire, we store your care preferences (treatment philosophy, provider type, location, etc.) to match you with specialists. This is <em>not</em> medical data or protected health information (PHI). You can use the questionnaire anonymously without creating an account.</p>
              <p><strong>Provider Information:</strong> Healthcare providers who register share professional information (credentials, practice details, certifications) to be listed in our directory. Providers control which data is publicly visible, shared on patient request, or kept private.</p>
              <p><strong>Account Data:</strong> If you create an account, we store your email, username, and encrypted password. We never store passwords in plain text.</p>
            </section>

            <section>
              <h2 className="text-lg font-heading font-semibold text-secondary-dark">How We Use Your Data</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Patient preferences are used solely to match you with relevant providers</li>
                <li>Provider data is displayed in the directory according to their visibility settings</li>
                <li>Aggregate, anonymized preference data may be used to understand patient needs and improve the platform</li>
                <li>We do not sell your personal data to third parties</li>
                <li>We do not use your data for advertising</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-heading font-semibold text-secondary-dark">Data Storage & Security</h2>
              <p>Your data is stored in encrypted databases. All connections use HTTPS/TLS encryption. We do not store patient medical records, diagnoses, or treatment histories.</p>
            </section>

            <section>
              <h2 className="text-lg font-heading font-semibold text-secondary-dark">Your Rights</h2>
              <p><strong>Right to Access:</strong> You can request a copy of all data we store about you.</p>
              <p><strong>Right to Deletion:</strong> You can delete your preferences, account, or any data we hold at any time. Anonymous session data can be deleted from your browser by clearing localStorage.</p>
              <p><strong>Right to Correction:</strong> You can update your preferences or provider profile at any time.</p>
              <p><strong>Right to Data Portability:</strong> You can export your data in a standard format upon request.</p>
              <p>To exercise any of these rights, contact <a href="mailto:support@endendo.io" className="text-primary hover:underline">support@endendo.io</a>.</p>
            </section>

            <section>
              <h2 className="text-lg font-heading font-semibold text-secondary-dark">Cookies</h2>
              <p>We use essential cookies for authentication sessions. We use Google Analytics (GA4) for aggregate usage statistics. You can opt out of analytics tracking. We do not use advertising cookies or trackers.</p>
            </section>

            <section>
              <h2 className="text-lg font-heading font-semibold text-secondary-dark">HIPAA Notice</h2>
              <p>EndEndo is a provider directory and matching service, not a healthcare provider. We do not collect, store, or transmit protected health information (PHI). Patient preferences describe what you are looking for in a provider, not your medical history or conditions. We are not a covered entity under HIPAA.</p>
            </section>

            <section>
              <h2 className="text-lg font-heading font-semibold text-secondary-dark">International Users (GDPR)</h2>
              <p>If you are located in the European Union or United Kingdom, you have additional rights under GDPR including the right to restrict processing and the right to object. Our lawful basis for processing is legitimate interest (matching patients with providers) and consent (when you voluntarily submit preferences).</p>
            </section>

            <section>
              <h2 className="text-lg font-heading font-semibold text-secondary-dark">Contact</h2>
              <p>For privacy inquiries: <a href="mailto:support@endendo.io" className="text-primary hover:underline">support@endendo.io</a></p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
