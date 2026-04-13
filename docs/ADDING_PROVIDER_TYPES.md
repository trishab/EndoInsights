# Adding a New Provider Type

This guide walks through every step required to add a new provider type to the EndEndo Specialist Directory. Follow the steps in order. Each step references the specific file and location where changes are needed.

---

## Prerequisites

Before adding a new type, confirm the following:

- There are enough providers of this type (or anticipated demand) to justify a dedicated category rather than using the `other` type.
- The type is clinically relevant to endometriosis care.
- You have a clear understanding of what fields are specific to this provider type versus shared across all types.

---

## Step 1: Add the enum to PROVIDER_TYPES

**File:** `lib/constants.js`

Add a new entry to the `PROVIDER_TYPES` object. The key is the snake_case identifier that will be stored in the database. Provide a label, short label, description, and a color for UI display.

```js
// In PROVIDER_TYPES object:
new_type_key: {
  label: 'Full Display Name',
  shortLabel: 'Short',
  description: 'One-sentence description of what this provider does in the context of endo care',
  color: 'cyan', // Pick a Tailwind color not already in use
},
```

The key must be a valid JavaScript identifier using snake_case. It will be stored directly in the `doctors.providerType` column.

---

## Step 2: Add NPI taxonomy mappings

**File:** `lib/constants.js`

Add entries to `NPI_TAXONOMY_MAP` that map relevant NPI taxonomy codes to the new provider type key. Look up applicable codes in the NUCC Health Care Provider Taxonomy Code Set (https://taxonomy.nucc.org/).

```js
// In NPI_TAXONOMY_MAP object:
'XXXXXXXXXX': 'new_type_key',  // Taxonomy description
'YYYYYYYYYY': 'new_type_key',  // Another relevant taxonomy
```

If the provider type does not have NPI taxonomy codes (for example, non-licensed wellness practitioners), skip this step but add a comment in the map noting the absence.

---

## Step 3: Define type-specific fields

Decide whether the new type needs its own columns on the `doctors` table or whether the `typeSpecificData` JSONB column is sufficient.

**Guideline:** Use `typeSpecificData` for fields that are only relevant to this single provider type. Add dedicated columns only for fields that are shared across multiple types or that need to be indexed/queried independently.

### Option A: typeSpecificData (preferred for most types)

Document the expected JSONB shape. Create a clear specification with field names, types, and descriptions. Add this documentation to `docs/PROVIDER_TYPES.md` in a new section for the type.

Example:

```json
{
  "fieldOne": true,
  "fieldTwo": "some_enum_value",
  "caseVolume": 100,
  "collaboratesWithExcisionSurgeon": true
}
```

No schema migration is needed for JSONB fields. Validation should be handled in application code.

### Option B: New columns on the doctors table

**File:** `lib/schema.js`

Add new columns within the doctors table definition. Place them in the appropriate section (near existing related fields or in a new clearly-commented block).

```js
// In the doctors pgTable definition:
newFieldName: text('new_field_name'),
newFieldBoolean: boolean('new_field_boolean').default(false),
```

After modifying the schema, run a Drizzle migration to update the database:

```
npx drizzle-kit generate
npx drizzle-kit push
```

---

## Step 4: Update the provider submission form

Locate the provider registration or profile edit form component. Add form fields for the new type's specific data. These fields should be conditionally rendered -- they only appear when the selected `providerType` matches the new type key.

The form should:

- Show the type-specific fields when `providerType === 'new_type_key'`.
- Serialize the values into the `typeSpecificData` JSONB field (or into the dedicated columns if you added them in Step 3B).
- Include appropriate validation for required fields within the type.

---

## Step 5: Update the provider profile display

Locate the provider profile page or card component. Add a display section for the new type that renders the type-specific data in a patient-friendly format.

Considerations:

- Use the provider type's `label` from `PROVIDER_TYPES` for headings.
- Translate boolean fields into human-readable labels (e.g., `collaboratesWithExcisionSurgeon: true` becomes "Collaborates with excision surgeons").
- Respect `providerDataVisibility` settings if any type-specific fields are added to `VISIBILITY_CONTROLLED_FIELDS`.

---

## Step 6: Update the matching algorithm (if needed)

**File:** `lib/matching.js`

Evaluate whether the new provider type requires changes to the matching algorithm:

### No changes needed if:

- The existing nine preference dimensions adequately cover the new type's matching criteria.
- The new type does not have quality dimensions analogous to the surgeon's surgical quality scoring.

In this case, the new type will be matched using whichever preference dimensions the patient has set, just like all non-surgeon types.

### Add a scoring dimension if:

The new type introduces a patient preference dimension that does not exist yet. To add one:

1. Write a new scoring function that takes `(provider, preferences)` and returns a score from 0.0 to 1.0, or null if not applicable.

```js
export function scoreNewDimension(provider, preferences) {
  // Return null to exclude this dimension from scoring
  if (!preferences.newPreferenceField) return null;
  // Score logic...
  return score;
}
```

2. Add the dimension to the `PREFERENCE_DIMENSIONS` array:

```js
{ key: 'newDimension', weightField: 'weightNewDimension', scoreFn: scoreNewDimension },
```

3. Add a corresponding weight field to the `patientPreferences` table in `lib/schema.js`:

```js
weightNewDimension: text('weight_new_dimension').default('important'),
```

4. Add the weight to the importance slider step of the questionnaire (Step 7).

### Add type-specific quality dimensions if:

The new type warrants always-applied quality scoring similar to the surgeon's five surgical quality dimensions. This is unusual and should only be done for types where objective quality metrics exist and are meaningful. Follow the pattern in `SURGICAL_QUALITY_DIMENSIONS` and adjust the weight fraction accordingly.

---

## Step 7: Update the questionnaire provider type step

The questionnaire's Step 2 (Provider Type Selection) lists available types for patients to choose from. Add the new type to this list.

Ensure the new entry includes:

- The type key matching the `PROVIDER_TYPES` entry.
- The label and description from `PROVIDER_TYPES`.
- The color indicator.

The `other` type is intentionally excluded from the questionnaire. All other types should be listed.

---

## Step 8: Add documentation to PROVIDER_TYPES.md

**File:** `docs/PROVIDER_TYPES.md`

Add a new section following the established pattern. Include:

- Provider type key and label.
- Description of what the provider does and how they relate to endometriosis care.
- The `typeSpecificData` JSONB structure (or new column definitions).
- Which matching dimensions are relevant.
- Any special scoring considerations.

Update the "Matching Dimension Applicability Summary" table at the bottom of the document to include the new type.

---

## Checklist

Use this checklist to verify that all changes are complete:

- [ ] `PROVIDER_TYPES` entry added in `lib/constants.js`
- [ ] NPI taxonomy codes mapped in `NPI_TAXONOMY_MAP` (or documented as not applicable)
- [ ] Type-specific fields defined (in `typeSpecificData` JSONB or as new columns)
- [ ] Database migration run if new columns were added
- [ ] Provider submission form updated with conditional fields
- [ ] Provider profile display updated for the new type
- [ ] Matching algorithm reviewed; new scoring dimensions added if needed
- [ ] Patient questionnaire Step 2 updated to include the new type
- [ ] `docs/PROVIDER_TYPES.md` updated with the new type's full specification
- [ ] Matching dimension applicability table updated
