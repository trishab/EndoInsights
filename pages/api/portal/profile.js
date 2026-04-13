import { getServerSession } from 'next-auth/next';
import { eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { doctors } from '../../../lib/schema';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  // Get the session — need to import authOptions from the NextAuth config
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.isDoctor) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  if (req.method === 'GET') {
    try {
      const [doctor] = await db
        .select()
        .from(doctors)
        .where(eq(doctors.userId, userId))
        .limit(1);

      if (!doctor) {
        return res.status(404).json({ error: 'Doctor profile not found' });
      }

      return res.status(200).json(doctor);
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const updates = req.body;

      // Remove fields that should not be directly updated
      delete updates.id;
      delete updates.userId;
      delete updates.createdAt;
      delete updates.verificationStatus;
      delete updates.verificationDate;
      delete updates.verificationNotes;
      delete updates.rating;
      delete updates.reviewCount;
      delete updates.featuredReviewId;
      delete updates.source;

      // Set updatedAt
      updates.updatedAt = new Date();

      const [updated] = await db
        .update(doctors)
        .set(updates)
        .where(eq(doctors.userId, userId))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: 'Doctor profile not found' });
      }

      return res.status(200).json(updated);
    } catch (error) {
      console.error('Error updating doctor profile:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
