import { savePreferences, fetchPreferences, deletePreferences } from '../../lib/database';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const id = await savePreferences(req.body);
      return res.status(200).json({ id });
    } catch (error) {
      console.error('Error saving preferences:', error);
      return res.status(500).json({ error: 'Failed to save preferences' });
    }
  }

  if (req.method === 'GET') {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }
    try {
      const prefs = await fetchPreferences(sessionId);
      return res.status(200).json(prefs);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return res.status(500).json({ error: 'Failed to fetch preferences' });
    }
  }

  if (req.method === 'DELETE') {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }
    try {
      await deletePreferences(sessionId);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting preferences:', error);
      return res.status(500).json({ error: 'Failed to delete preferences' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
