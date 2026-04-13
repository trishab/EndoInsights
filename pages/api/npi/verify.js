import { verifyNPI } from '../../../lib/npi-verify';
import { checkDuplicate } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { npi } = req.body;

  if (!npi) {
    return res.status(400).json({ error: 'NPI number is required' });
  }

  try {
    // Verify NPI with the registry
    const npiResult = await verifyNPI(npi);

    if (!npiResult.valid) {
      return res.status(400).json({ error: npiResult.error });
    }

    // Check for duplicates
    const duplicate = await checkDuplicate({
      npi,
      email: null,
      name: `${npiResult.firstName} ${npiResult.lastName}`,
      city: npiResult.practiceAddress?.city,
    });

    return res.status(200).json({
      ...npiResult,
      duplicate,
    });
  } catch (error) {
    console.error('NPI verification error:', error);
    return res.status(500).json({ error: 'NPI verification failed' });
  }
}
