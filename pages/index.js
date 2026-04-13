import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Head>
        <title>EndEndo | Endometriosis Specialist Directory</title>
        <meta name="description" content="Find endometriosis specialists matched to your care preferences. Excision surgeons, pelvic floor PTs, functional medicine, and more." />
      </Head>

      {/* Header — glassmorphic nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20">
        <nav className="section-container-wide py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-heading font-bold">
              <span className="text-primary">End</span>
              <span className="text-secondary">Endo</span>
            </span>
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium text-secondary-light">
            <Link href="/providers" className="hover:text-primary transition-colors">
              Browse Specialists
            </Link>
            <Link href="/match" className="hover:text-primary transition-colors">
              Find Your Match
            </Link>
            <Link href="/submit" className="hover:text-primary transition-colors">
              For Providers
            </Link>
            <Link href="/about" className="hover:text-primary transition-colors">
              About
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero — organic gradient background */}
      <section className="relative py-24 overflow-hidden">
        {/* Organic background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-accent rounded-full blur-3xl" />

        <div className="relative section-container text-center">
          <h1 className="text-5xl md:text-6xl font-heading font-extrabold tracking-tight text-secondary-dark mb-6">
            Find the right specialist for{' '}
            <span className="text-primary">your</span> journey
          </h1>
          <p className="text-xl text-secondary-light mb-10 max-w-2xl mx-auto leading-relaxed">
            A directory of endometriosis specialists matched to what matters most to you.
            Excision surgeons, pelvic floor therapists, functional medicine providers, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/match" className="btn-primary text-lg">
              Share Your Preferences
            </Link>
            <Link href="/providers" className="btn-outline text-lg">
              Browse All Specialists
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="section-container-wide">
          <h2 className="text-3xl font-heading font-bold text-center text-secondary-dark mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-700 font-bold text-lg">1</span>
              </div>
              <h3 className="text-lg font-heading font-semibold text-secondary-dark mb-2">
                Share what matters to you
              </h3>
              <p className="text-secondary-light text-sm leading-relaxed">
                Tell us about your journey, your preferences, and what you need from a provider.
                No account required.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-accent-foreground font-bold text-lg">2</span>
              </div>
              <h3 className="text-lg font-heading font-semibold text-secondary-dark mb-2">
                Get matched specialists
              </h3>
              <p className="text-secondary-light text-sm leading-relaxed">
                We match you with providers based on your priorities — not ours. You control
                what matters most.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-700 font-bold text-lg">3</span>
              </div>
              <h3 className="text-lg font-heading font-semibold text-secondary-dark mb-2">
                Advocate for your care
              </h3>
              <p className="text-secondary-light text-sm leading-relaxed">
                Get personalized questions to ask providers, understand your FMLA rights,
                and take charge of your health journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Provider Types */}
      <section className="py-20 bg-muted">
        <div className="section-container-wide">
          <h2 className="text-3xl font-heading font-bold text-center text-secondary-dark mb-4">
            More than just surgeons
          </h2>
          <p className="text-secondary-light text-center mb-12 max-w-2xl mx-auto">
            Endometriosis care often requires a team. We list specialists across disciplines.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: 'Excision Surgeons', desc: 'Laparoscopic excision specialists' },
              { name: 'Pelvic Floor PT', desc: 'Rehabilitation & pain management' },
              { name: 'Functional Medicine', desc: 'Root cause & integrative care' },
              { name: 'Gastroenterology', desc: 'Bowel endometriosis' },
              { name: 'Interventional Radiology', desc: 'UAE & minimally invasive procedures' },
              { name: 'Pain Management', desc: 'Chronic pelvic pain specialists' },
              { name: 'Mental Health', desc: 'Chronic pain & endo-aware therapy' },
              { name: 'Urology', desc: 'Bladder & urinary involvement' },
            ].map((type) => (
              <div key={type.name} className="card-solid hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                <h3 className="font-heading font-semibold text-sm text-primary-700">{type.name}</h3>
                <p className="text-xs text-secondary-light mt-1">{type.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Medical Disclaimer */}
      <section className="py-12 bg-white">
        <div className="section-container">
          <div className="medical-disclaimer text-center">
            <p className="font-heading font-semibold text-lg mb-2">For learning, not for diagnosing</p>
            <p className="text-sm text-primary-700">
              This directory helps you find specialists, but it is not a substitute for professional medical advice.
              Always consult with a qualified healthcare provider about your specific situation.
            </p>
          </div>
        </div>
      </section>

      {/* For Providers CTA */}
      <section className="py-16 bg-primary">
        <div className="section-container text-center">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">Are you a specialist?</h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            Join our directory and connect with patients who are looking for your expertise.
            You control what information is shared.
          </p>
          <Link href="/submit" className="inline-block bg-white text-primary px-8 py-3 rounded-2xl font-semibold hover:bg-primary-50 transition-colors">
            Submit Your Profile
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-12">
        <div className="section-container-wide">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <span className="text-xl font-heading font-bold">
                <span className="text-primary">End</span>
                <span className="text-secondary">Endo</span>
              </span>
              <p className="text-sm text-secondary-light mt-1">Endometriosis Specialist Directory</p>
            </div>
            <div className="flex gap-6 text-sm text-secondary-light">
              <Link href="/about" className="hover:text-primary transition-colors">About</Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            <p>#anotsosilentdisease</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
