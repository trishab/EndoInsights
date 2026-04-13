import Head from 'next/head';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-muted">
      <Head>
        <title>Terms of Service | EndEndo</title>
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
          <h1 className="text-3xl font-heading font-bold text-secondary-dark mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: April 13, 2026</p>

          <div className="prose prose-sm max-w-none text-secondary-light space-y-6">
            <section>
              <h2 className="text-lg font-heading font-semibold text-secondary-dark">About EndEndo</h2>
              <p>EndEndo (endendo.io) is a specialist directory and patient matching platform for endometriosis care. EndEndo is not a healthcare provider, does not provide medical advice, and is not a substitute for professional medical care.</p>
            </section>

            <section>
              <h2 className="text-lg font-heading font-semibold text-secondary-dark">Medical Disclaimer</h2>
              <p>The information on this platform is for educational and informational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions you may have about a medical condition.</p>
              <p>Provider profiles, qualifications, and quality indicators displayed on this platform are self-reported by providers unless otherwise noted. EndEndo does not independently verify all claims. Always verify information directly with the provider before making care decisions.</p>
            </section>

            <section>
              <h2 className="text-lg font-heading font-semibold text-secondary-dark">For Patients</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>The matching system provides suggestions based on your stated preferences, not medical recommendations</li>
                <li>Match quality labels reflect alignment with your preferences, not medical quality assessments</li>
                <li>Always verify provider credentials, insurance acceptance, and availability directly</li>
                <li>EndEndo is not responsible for the quality of care provided by listed specialists</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-heading font-semibold text-secondary-dark">For Providers</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>By registering, you agree that the information you provide may be used to match you with patients seeking care</li>
                <li>You are responsible for the accuracy of information in your profile</li>
                <li>You control which data is publicly visible, shared on request, or kept private</li>
                <li>EndEndo reserves the right to remove profiles that contain inaccurate or misleading information</li>
                <li>Listing on EndEndo does not constitute an endorsement</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-heading font-semibold text-secondary-dark">User Accounts</h2>
              <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information during registration.</p>
            </section>

            <section>
              <h2 className="text-lg font-heading font-semibold text-secondary-dark">Limitation of Liability</h2>
              <p>EndEndo provides this platform on an &ldquo;as is&rdquo; basis. We make no warranties about the accuracy, reliability, or completeness of information provided by third parties (including providers). EndEndo is not liable for any damages arising from your use of the platform or your interactions with listed providers.</p>
            </section>

            <section>
              <h2 className="text-lg font-heading font-semibold text-secondary-dark">Contact</h2>
              <p>Questions about these terms: <a href="mailto:support@endendo.io" className="text-primary hover:underline">support@endendo.io</a></p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
