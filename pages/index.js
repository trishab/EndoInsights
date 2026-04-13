import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Head>
        <title>EndEndo | Endometriosis Specialist Directory</title>
        <meta name="description" content="Find endometriosis specialists matched to your care preferences. Excision surgeons, pelvic floor PTs, functional medicine, and more." />
      </Head>

      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              <span className="text-endo-purple-600">End</span>
              <span className="text-endo-teal-500">Endo</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/providers" className="hover:text-endo-purple-600 transition-colors">
              Browse Specialists
            </Link>
            <Link href="/match" className="hover:text-endo-purple-600 transition-colors">
              Find Your Match
            </Link>
            <Link href="/submit" className="hover:text-endo-purple-600 transition-colors">
              For Providers
            </Link>
            <Link href="/about" className="hover:text-endo-purple-600 transition-colors">
              About
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-endo-purple-50 via-white to-endo-teal-50 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
            Find the right specialist for{' '}
            <span className="text-endo-purple-600">your</span> journey
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
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
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-12 h-12 bg-endo-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-endo-purple-600 font-bold text-lg">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Share what matters to you</h3>
              <p className="text-gray-600 text-sm">
                Tell us about your journey, your preferences, and what you need from a provider.
                No account required.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-endo-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-endo-teal-600 font-bold text-lg">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Get matched specialists</h3>
              <p className="text-gray-600 text-sm">
                We match you with providers based on your priorities — not ours. You control
                what matters most.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-endo-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-endo-purple-600 font-bold text-lg">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Advocate for your care</h3>
              <p className="text-gray-600 text-sm">
                Get personalized questions to ask providers, understand your FMLA rights,
                and take charge of your health journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Provider Types */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">More than just surgeons</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
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
              <div key={type.name} className="card hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-sm text-endo-purple-700">{type.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{type.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Providers CTA */}
      <section className="py-16 bg-endo-purple-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Are you a specialist?</h2>
          <p className="text-endo-purple-100 mb-8 max-w-xl mx-auto">
            Join our directory and connect with patients who are looking for your expertise.
            You control what information is shared.
          </p>
          <Link href="/submit" className="inline-block bg-white text-endo-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-endo-purple-50 transition-colors">
            Submit Your Profile
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <span className="text-xl font-bold">
                <span className="text-endo-purple-600">End</span>
                <span className="text-endo-teal-500">Endo</span>
              </span>
              <p className="text-sm text-gray-500 mt-1">Endometriosis Specialist Directory</p>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/about" className="hover:text-gray-700">About</Link>
              <Link href="/privacy" className="hover:text-gray-700">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-700">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
