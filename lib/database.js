import { eq, and, ilike, inArray, sql } from 'drizzle-orm';
import { db } from './db';
import { doctors, patientPreferences, providerDataVisibility, patientDataRequests } from './schema';

// ============================================================================
// Provider queries
// ============================================================================

/**
 * Fetch all approved/verified providers, optionally filtered.
 */
export async function fetchProviders({ providerType, state, search } = {}) {
  const conditions = [
    eq(doctors.verificationStatus, 'verified'),
  ];

  if (providerType) {
    conditions.push(eq(doctors.providerType, providerType));
  }

  if (state) {
    conditions.push(eq(doctors.state, state));
  }

  const results = await db
    .select()
    .from(doctors)
    .where(and(...conditions));

  if (search) {
    const lower = search.toLowerCase();
    return results.filter(doc =>
      (doc.name || '').toLowerCase().includes(lower) ||
      (doc.city || '').toLowerCase().includes(lower) ||
      (doc.practiceName || '').toLowerCase().includes(lower)
    );
  }

  return results;
}

/**
 * Fetch a single provider by ID.
 */
export async function fetchProviderById(id) {
  const [provider] = await db
    .select()
    .from(doctors)
    .where(eq(doctors.id, id))
    .limit(1);

  return provider || null;
}

/**
 * Fetch visibility settings for a provider.
 */
export async function fetchVisibilitySettings(doctorId) {
  return db
    .select()
    .from(providerDataVisibility)
    .where(eq(providerDataVisibility.doctorId, doctorId));
}

/**
 * Filter provider fields based on visibility settings.
 * Returns provider object with sensitive fields redacted based on visibility.
 */
export function applyVisibility(provider, visibilitySettings, requestedFields = []) {
  const visMap = {};
  for (const v of visibilitySettings) {
    visMap[v.fieldName] = v.visibility;
  }

  const result = { ...provider };

  for (const [field, visibility] of Object.entries(visMap)) {
    if (visibility === 'backend_only') {
      result[field] = undefined;
    } else if (visibility === 'on_request' && !requestedFields.includes(field)) {
      result[field] = undefined;
    }
    // 'public' fields are always visible
  }

  return result;
}

// ============================================================================
// Patient preference queries
// ============================================================================

/**
 * Save patient preferences (insert or update by sessionId).
 */
export async function savePreferences(prefsData) {
  const existing = await db
    .select()
    .from(patientPreferences)
    .where(eq(patientPreferences.sessionId, prefsData.sessionId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(patientPreferences)
      .set({ ...prefsData, updatedAt: new Date() })
      .where(eq(patientPreferences.sessionId, prefsData.sessionId));
    return existing[0].id;
  }

  const [inserted] = await db
    .insert(patientPreferences)
    .values(prefsData)
    .returning({ id: patientPreferences.id });

  return inserted.id;
}

/**
 * Fetch patient preferences by session ID.
 */
export async function fetchPreferences(sessionId) {
  const [prefs] = await db
    .select()
    .from(patientPreferences)
    .where(eq(patientPreferences.sessionId, sessionId))
    .limit(1);

  return prefs || null;
}

/**
 * Delete patient preferences (GDPR right to erasure).
 */
export async function deletePreferences(sessionId) {
  await db
    .delete(patientPreferences)
    .where(eq(patientPreferences.sessionId, sessionId));
}

// ============================================================================
// Patient data requests
// ============================================================================

/**
 * Record a patient's request to see sensitive provider data.
 */
export async function createDataRequest({ sessionId, userId, doctorId, requestedFields }) {
  const [inserted] = await db
    .insert(patientDataRequests)
    .values({ sessionId, userId, doctorId, requestedFields })
    .returning({ id: patientDataRequests.id });

  return inserted.id;
}

/**
 * Fetch data requests for a specific provider (for provider dashboard).
 */
export async function fetchDataRequestsForProvider(doctorId) {
  return db
    .select()
    .from(patientDataRequests)
    .where(eq(patientDataRequests.doctorId, doctorId));
}

// ============================================================================
// Provider visibility management
// ============================================================================

/**
 * Set visibility for a specific field.
 */
export async function setFieldVisibility(doctorId, fieldName, visibility) {
  const existing = await db
    .select()
    .from(providerDataVisibility)
    .where(
      and(
        eq(providerDataVisibility.doctorId, doctorId),
        eq(providerDataVisibility.fieldName, fieldName)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(providerDataVisibility)
      .set({ visibility })
      .where(eq(providerDataVisibility.id, existing[0].id));
  } else {
    await db
      .insert(providerDataVisibility)
      .values({ doctorId, fieldName, visibility });
  }
}

// ============================================================================
// Duplicate detection (for provider registration)
// ============================================================================

/**
 * Check if a provider already exists by NPI, email, or name+city.
 */
export async function checkDuplicate({ npi, email, name, city }) {
  // Check by NPI in multiStateLicenses JSONB
  if (npi) {
    const byNpi = await db
      .select()
      .from(doctors)
      .where(sql`${doctors.multiStateLicenses}::text ILIKE ${'%' + npi + '%'}`)
      .limit(1);

    if (byNpi.length > 0) {
      return { isDuplicate: true, existingDoctorId: byNpi[0].id, matchType: 'npi' };
    }
  }

  // Check by email
  if (email) {
    const byEmail = await db
      .select()
      .from(doctors)
      .where(eq(doctors.email, email))
      .limit(1);

    if (byEmail.length > 0) {
      return { isDuplicate: true, existingDoctorId: byEmail[0].id, matchType: 'email' };
    }
  }

  // Check by name + city
  if (name && city) {
    const byNameCity = await db
      .select()
      .from(doctors)
      .where(
        and(
          ilike(doctors.name, `%${name}%`),
          ilike(doctors.city, `%${city}%`)
        )
      )
      .limit(1);

    if (byNameCity.length > 0) {
      return { isDuplicate: true, existingDoctorId: byNameCity[0].id, matchType: 'name_location' };
    }
  }

  return { isDuplicate: false, existingDoctorId: null, matchType: null };
}
