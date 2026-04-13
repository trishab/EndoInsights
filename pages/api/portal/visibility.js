import { getServerSession } from 'next-auth/next';
import { eq, and } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { doctors, providerDataVisibility } from '../../../lib/schema';
import { authOptions } from '../auth/[...nextauth]';
import { VISIBILITY_CONTROLLED_FIELDS } from '../../../lib/constants';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.isDoctor) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  // Look up the doctor record for this user
  const [doctor] = await db
    .select()
    .from(doctors)
    .where(eq(doctors.userId, userId))
    .limit(1);

  if (!doctor) {
    return res.status(404).json({ error: 'Doctor profile not found' });
  }

  const doctorId = doctor.id;

  if (req.method === 'GET') {
    try {
      const visibilityRows = await db
        .select()
        .from(providerDataVisibility)
        .where(eq(providerDataVisibility.doctorId, doctorId));

      // Build a map of field -> visibility, falling back to defaults
      const visibilityMap = {};
      for (const field of VISIBILITY_CONTROLLED_FIELDS) {
        const row = visibilityRows.find((r) => r.fieldName === field.field);
        visibilityMap[field.field] = row ? row.visibility : field.defaultVisibility;
      }

      return res.status(200).json(visibilityMap);
    } catch (error) {
      console.error('Error fetching visibility settings:', error);
      return res.status(500).json({ error: 'Failed to fetch visibility settings' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const updates = req.body; // { fieldName: visibility, ... }

      // Validate fields
      const validFields = VISIBILITY_CONTROLLED_FIELDS.map((f) => f.field);
      const validVisibilities = ['public', 'on_request', 'backend_only'];

      for (const [fieldName, visibility] of Object.entries(updates)) {
        if (!validFields.includes(fieldName)) continue;
        if (!validVisibilities.includes(visibility)) continue;

        // Check if row exists
        const [existing] = await db
          .select()
          .from(providerDataVisibility)
          .where(
            and(
              eq(providerDataVisibility.doctorId, doctorId),
              eq(providerDataVisibility.fieldName, fieldName)
            )
          )
          .limit(1);

        if (existing) {
          await db
            .update(providerDataVisibility)
            .set({ visibility })
            .where(eq(providerDataVisibility.id, existing.id));
        } else {
          await db.insert(providerDataVisibility).values({
            doctorId,
            fieldName,
            visibility,
          });
        }
      }

      // Return updated map
      const visibilityRows = await db
        .select()
        .from(providerDataVisibility)
        .where(eq(providerDataVisibility.doctorId, doctorId));

      const visibilityMap = {};
      for (const field of VISIBILITY_CONTROLLED_FIELDS) {
        const row = visibilityRows.find((r) => r.fieldName === field.field);
        visibilityMap[field.field] = row ? row.visibility : field.defaultVisibility;
      }

      return res.status(200).json(visibilityMap);
    } catch (error) {
      console.error('Error updating visibility settings:', error);
      return res.status(500).json({ error: 'Failed to update visibility settings' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
