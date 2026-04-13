import { createDataRequest } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId, doctorId } = req.body;

  if (!sessionId || !doctorId) {
    return res.status(400).json({ error: 'sessionId and doctorId are required' });
  }

  try {
    const id = await createDataRequest({
      sessionId,
      userId: null,
      doctorId: Number(doctorId),
      requestedFields: ['surgicalVolumeExcisionHours', 'complicationRateMajor', 'waitTimeMonths', 'bowelSurgeryApproach', 'bladderSurgeryApproach'],
    });

    return res.status(200).json({ id });
  } catch (error) {
    console.error('Error creating data request:', error);
    return res.status(500).json({ error: 'Failed to create data request' });
  }
}
