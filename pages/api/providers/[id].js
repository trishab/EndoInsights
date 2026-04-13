import { fetchProviderById } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const provider = await fetchProviderById(Number(id));

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    return res.status(200).json(provider);
  } catch (error) {
    console.error('Error fetching provider:', error);
    return res.status(500).json({ error: 'Failed to fetch provider' });
  }
}
