import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('patient'); // patient or provider

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid username or password');
    } else {
      router.push(activeTab === 'provider' ? '/portal' : '/match');
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4">
      <Head>
        <title>Sign In | EndEndo</title>
      </Head>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="text-3xl font-heading font-bold">
              <span className="text-primary">End</span>
              <span className="text-secondary">Endo</span>
            </span>
          </Link>
        </div>

        <div className="card-solid">
          {/* Tab toggle */}
          <div className="flex rounded-xl bg-muted p-1 mb-6">
            <button
              onClick={() => setActiveTab('patient')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === 'patient'
                  ? 'bg-white text-secondary-dark shadow-sm'
                  : 'text-secondary-light hover:text-secondary-dark'
              }`}
            >
              Patient
            </button>
            <button
              onClick={() => setActiveTab('provider')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === 'provider'
                  ? 'bg-white text-secondary-dark shadow-sm'
                  : 'text-secondary-light hover:text-secondary-dark'
              }`}
            >
              Healthcare Provider
            </button>
          </div>

          <h2 className="text-xl font-heading font-bold text-secondary-dark mb-1">
            {activeTab === 'patient' ? 'Welcome back' : 'Provider sign in'}
          </h2>
          <p className="text-sm text-secondary-light mb-6">
            {activeTab === 'patient'
              ? 'Sign in to access your saved preferences and matches.'
              : 'Sign in to manage your provider profile.'}
          </p>

          {error && (
            <div className="alert-warning mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-white text-secondary-dark
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-white text-secondary-dark
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-secondary-light">
            {activeTab === 'patient' ? (
              <>
                Don&apos;t have an account?{' '}
                <Link href="/match" className="text-primary font-medium hover:underline">
                  Use without an account
                </Link>
                {' or '}
                <Link href="/auth/register" className="text-primary font-medium hover:underline">
                  create one
                </Link>
              </>
            ) : (
              <>
                New provider?{' '}
                <Link href="/auth/provider" className="text-primary font-medium hover:underline">
                  Register with NPI verification
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
