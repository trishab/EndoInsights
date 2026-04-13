import { fetchProviders } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, state, search } = req.query;

  try {
    const providers = await fetchProviders({
      providerType: type || undefined,
      state: state || undefined,
      search: search || undefined,
    });

    return res.status(200).json(providers);
  } catch (error) {
    console.error('Error fetching providers:', error);
    return res.status(500).json({ error: 'Failed to fetch providers' });
  }
}
