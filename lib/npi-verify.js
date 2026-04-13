import { NPI_TAXONOMY_MAP } from './constants';

const NPI_API_BASE = 'https://npiregistry.cms.hhs.gov/api';

/**
 * Verify an NPI number against the NPPES registry.
 * Returns provider details if valid, null if invalid.
 */
export async function verifyNPI(npiNumber) {
  if (!npiNumber || !/^\d{10}$/.test(npiNumber)) {
    return { valid: false, error: 'NPI must be a 10-digit number' };
  }

  try {
    const url = `${NPI_API_BASE}/?number=${npiNumber}&version=2.1`;
    const response = await fetch(url);

    if (!response.ok) {
      return { valid: false, error: 'NPI Registry API request failed' };
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return { valid: false, error: 'NPI number not found in registry' };
    }

    const result = data.results[0];
    const basic = result.basic || {};
    const taxonomies = result.taxonomies || [];
    const addresses = result.addresses || [];

    // Find the primary taxonomy
    const primaryTaxonomy = taxonomies.find(t => t.primary) || taxonomies[0] || {};

    // Map taxonomy to our provider type
    const suggestedProviderType = mapTaxonomyToProviderType(taxonomies);

    // Extract practice address (type 2 = practice location)
    const practiceAddress = addresses.find(a => a.address_purpose === 'LOCATION') || addresses[0] || {};

    return {
      valid: true,
      providerName: formatProviderName(basic),
      credential: basic.credential || '',
      firstName: basic.first_name || '',
      lastName: basic.last_name || '',
      gender: basic.gender || '',
      taxonomies: taxonomies.map(t => ({
        code: t.code,
        description: t.desc,
        primary: t.primary,
      })),
      addresses: addresses.map(a => ({
        address: `${a.address_1 || ''} ${a.address_2 || ''}`.trim(),
        city: a.city || '',
        state: a.state || '',
        zip: a.postal_code || '',
        country: a.country_code || 'US',
        phone: a.telephone_number || '',
      })),
      practiceAddress: {
        city: practiceAddress.city || '',
        state: practiceAddress.state || '',
        zip: practiceAddress.postal_code || '',
        phone: practiceAddress.telephone_number || '',
      },
      suggestedProviderType,
      primaryTaxonomyCode: primaryTaxonomy.code || '',
      primaryTaxonomyDescription: primaryTaxonomy.desc || '',
    };
  } catch (error) {
    return { valid: false, error: `NPI verification failed: ${error.message}` };
  }
}

/**
 * Map NPI taxonomy codes to our provider type classification.
 * Checks all taxonomies, prioritizing the primary one.
 */
function mapTaxonomyToProviderType(taxonomies) {
  // Check primary taxonomy first
  const primary = taxonomies.find(t => t.primary);
  if (primary && NPI_TAXONOMY_MAP[primary.code]) {
    return NPI_TAXONOMY_MAP[primary.code];
  }

  // Check all taxonomies
  for (const tax of taxonomies) {
    if (NPI_TAXONOMY_MAP[tax.code]) {
      return NPI_TAXONOMY_MAP[tax.code];
    }

    // Partial match — check prefix (some taxonomies have subtypes)
    const prefix = tax.code?.substring(0, 10);
    for (const [code, type] of Object.entries(NPI_TAXONOMY_MAP)) {
      if (code.startsWith(prefix) || prefix.startsWith(code.substring(0, 3))) {
        return type;
      }
    }
  }

  return 'other';
}

/**
 * Format provider name from NPI basic info.
 */
function formatProviderName(basic) {
  const parts = [];

  if (basic.name_prefix) parts.push(basic.name_prefix);
  if (basic.first_name) parts.push(basic.first_name);
  if (basic.middle_name) parts.push(basic.middle_name);
  if (basic.last_name) parts.push(basic.last_name);
  if (basic.name_suffix) parts.push(basic.name_suffix);

  let name = parts.join(' ');

  if (basic.credential) {
    name += `, ${basic.credential}`;
  }

  return name;
}

/**
 * Search NPI registry by name and state (for finding providers).
 */
export async function searchNPI({ firstName, lastName, state, taxonomyDescription }) {
  const params = new URLSearchParams({ version: '2.1' });

  if (firstName) params.set('first_name', firstName);
  if (lastName) params.set('last_name', lastName);
  if (state) params.set('state', state);
  if (taxonomyDescription) params.set('taxonomy_description', taxonomyDescription);

  try {
    const url = `${NPI_API_BASE}/?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) return [];

    const data = await response.json();
    return (data.results || []).map(result => ({
      npi: result.number,
      name: formatProviderName(result.basic || {}),
      state: (result.addresses?.[0]?.state) || '',
      taxonomy: result.taxonomies?.[0]?.desc || '',
    }));
  } catch {
    return [];
  }
}
