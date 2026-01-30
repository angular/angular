/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * ARIA attribute data from WAI-ARIA specification.
 * Uses @vscode/web-custom-data for authoritative data (same source as VS Code).
 *
 * Types:
 * - string: Free-form text value
 * - boolean: true/false
 * - tristate: true/false/mixed
 * - integer: Whole number
 * - number: Decimal number
 * - id: Single ID reference
 * - idlist: Space-separated list of IDs
 * - token: One of a set of allowed values
 * - tokenlist: Space-separated list of allowed values
 */

import {createRequire} from 'module';

// Use createRequire to import JSON in ESM context
const require = createRequire(import.meta.url);
const htmlData = require('@vscode/web-custom-data/data/browsers.html-data.json');

export type AriaAttributeType =
  | 'string'
  | 'boolean'
  | 'tristate'
  | 'integer'
  | 'number'
  | 'id'
  | 'idlist'
  | 'token'
  | 'tokenlist';

export interface AriaAttributeDefinition {
  /** The type of value this attribute accepts */
  type: AriaAttributeType;
  /** For token/tokenlist types, the allowed values */
  values?: readonly string[];
  /** Whether undefined is a valid value */
  allowundefined?: boolean;
  /** Reference URL (WAI-ARIA spec) */
  reference?: string;
  /** Description (markdown) */
  description?: string;
}

interface HtmlDataAttribute {
  name: string;
  valueSet?: string;
  description?: string | {kind: string; value: string};
  references?: Array<{name: string; url: string}>;
}

interface HtmlDataValueSet {
  name: string;
  values: Array<{name: string; description?: string | {kind: string; value: string}}>;
}

/**
 * Map valueSet names to our internal type system.
 */
const VALUE_SET_TO_TYPE: Record<string, AriaAttributeType> = {
  b: 'boolean',
  u: 'boolean', // boolean with undefined
  tristate: 'tristate',
  autocomplete: 'token',
  current: 'token',
  dropeffect: 'tokenlist',
  invalid: 'token',
  live: 'token',
  orientation: 'token',
  relevant: 'tokenlist',
  sort: 'token',
  roles: 'token',
  haspopup: 'token',
};

/**
 * Attributes that allow undefined as a value.
 */
const ALLOWS_UNDEFINED = new Set(['aria-expanded', 'aria-hidden', 'aria-grabbed', 'aria-selected']);

/**
 * Attributes that are ID references.
 */
const ID_ATTRIBUTES = new Set(['aria-activedescendant', 'aria-errormessage', 'aria-details']);

/**
 * Attributes that are ID list references.
 */
const ID_LIST_ATTRIBUTES = new Set([
  'aria-controls',
  'aria-describedby',
  'aria-flowto',
  'aria-labelledby',
  'aria-owns',
]);

/**
 * Attributes that are integers.
 */
const INTEGER_ATTRIBUTES = new Set([
  'aria-colcount',
  'aria-colindex',
  'aria-colspan',
  'aria-level',
  'aria-posinset',
  'aria-rowcount',
  'aria-rowindex',
  'aria-rowspan',
  'aria-setsize',
]);

/**
 * Attributes that are numbers.
 */
const NUMBER_ATTRIBUTES = new Set(['aria-valuemax', 'aria-valuemin', 'aria-valuenow']);

/**
 * Build valueSets lookup from HTML data.
 */
function buildValueSetsMap(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const vs of htmlData.valueSets as HtmlDataValueSet[]) {
    map.set(
      vs.name,
      vs.values.map((v) => v.name),
    );
  }
  return map;
}

const valueSetsMap = buildValueSetsMap();

/**
 * Get description text from HTML data description.
 */
function getDescriptionText(
  desc: string | {kind: string; value: string} | undefined,
): string | undefined {
  if (!desc) return undefined;
  if (typeof desc === 'string') return desc;
  return desc.value;
}

/**
 * Build ARIA_ATTRIBUTES map from @vscode/web-custom-data.
 */
function buildAriaAttributes(): Readonly<Record<string, AriaAttributeDefinition>> {
  const result: Record<string, AriaAttributeDefinition> = {};

  for (const attr of htmlData.globalAttributes as HtmlDataAttribute[]) {
    if (!attr.name.startsWith('aria-')) continue;

    const def: AriaAttributeDefinition = {
      type: 'string', // default
    };

    // Determine type from valueSet or special cases
    if (attr.valueSet && VALUE_SET_TO_TYPE[attr.valueSet]) {
      def.type = VALUE_SET_TO_TYPE[attr.valueSet];

      // Get values from valueSet
      const values = valueSetsMap.get(attr.valueSet);
      if (values) {
        def.values = values;
      }
    } else if (ID_ATTRIBUTES.has(attr.name)) {
      def.type = 'id';
    } else if (ID_LIST_ATTRIBUTES.has(attr.name)) {
      def.type = 'idlist';
    } else if (INTEGER_ATTRIBUTES.has(attr.name)) {
      def.type = 'integer';
    } else if (NUMBER_ATTRIBUTES.has(attr.name)) {
      def.type = 'number';
    }

    // Check for undefined allowance
    if (ALLOWS_UNDEFINED.has(attr.name)) {
      def.allowundefined = true;
    }

    // Get description
    def.description = getDescriptionText(attr.description);

    // Get reference URL
    if (attr.references && attr.references.length > 0) {
      def.reference = attr.references[0].url;
    }

    result[attr.name] = def;
  }

  return result;
}

/**
 * Build ARIA roles from @vscode/web-custom-data.
 */
function buildAriaRoles(): readonly string[] {
  const rolesValueSet = valueSetsMap.get('roles');
  return rolesValueSet ? [...rolesValueSet].sort() : [];
}

/**
 * Complete map of ARIA attributes to their definitions.
 * Data sourced from @vscode/web-custom-data (same as VS Code).
 */
export const ARIA_ATTRIBUTES: Readonly<Record<string, AriaAttributeDefinition>> =
  buildAriaAttributes();

/**
 * Valid ARIA roles based on WAI-ARIA specification.
 * Includes standard roles and document structure roles (doc-*).
 */
export const ARIA_ROLES: readonly string[] = buildAriaRoles();

/**
 * Set of valid ARIA attribute names for quick lookup.
 */
export const VALID_ARIA_ATTRIBUTES = new Set(Object.keys(ARIA_ATTRIBUTES));

/**
 * Set of valid ARIA role names for quick lookup.
 */
export const VALID_ARIA_ROLES = new Set(ARIA_ROLES);

/**
 * Checks if a given attribute name is a valid ARIA attribute.
 */
export function isValidAriaAttribute(name: string): boolean {
  return VALID_ARIA_ATTRIBUTES.has(name);
}

/**
 * Checks if a given role value is a valid ARIA role.
 */
export function isValidAriaRole(role: string): boolean {
  return VALID_ARIA_ROLES.has(role);
}

/**
 * Gets documentation for an ARIA attribute.
 */
export function getAriaAttributeDocumentation(
  name: string,
): {description: string; reference?: string; type: string; values?: readonly string[]} | undefined {
  const attr = ARIA_ATTRIBUTES[name];
  if (!attr) return undefined;

  return {
    description: attr.description ?? `ARIA attribute: ${name}`,
    reference: attr.reference,
    type: attr.type,
    values: attr.values,
  };
}

/**
 * Gets the valid values for an ARIA attribute (for token/tokenlist types).
 */
export function getAriaAttributeValues(name: string): readonly string[] | undefined {
  return ARIA_ATTRIBUTES[name]?.values;
}

/**
 * Gets the type of an ARIA attribute.
 */
export function getAriaAttributeType(name: string): AriaAttributeType | undefined {
  return ARIA_ATTRIBUTES[name]?.type;
}

/**
 * Finds similar ARIA attribute names for typo suggestions.
 * Uses Levenshtein distance for fuzzy matching.
 */
export function findSimilarAriaAttributes(input: string, maxDistance: number = 3): string[] {
  const candidates: Array<{name: string; distance: number}> = [];

  for (const name of VALID_ARIA_ATTRIBUTES) {
    const distance = levenshteinDistance(input, name);
    if (distance <= maxDistance) {
      candidates.push({name, distance});
    }
  }

  return candidates.sort((a, b) => a.distance - b.distance).map((c) => c.name);
}

/**
 * Finds similar ARIA role names for typo suggestions.
 */
export function findSimilarAriaRoles(input: string, maxDistance: number = 3): string[] {
  const candidates: Array<{role: string; distance: number}> = [];

  for (const role of VALID_ARIA_ROLES) {
    const distance = levenshteinDistance(input, role);
    if (distance <= maxDistance) {
      candidates.push({role, distance});
    }
  }

  return candidates.sort((a, b) => a.distance - b.distance).map((c) => c.role);
}

/**
 * Validates an ARIA attribute value against its type definition.
 */
export function validateAriaValue(
  attrName: string,
  value: string,
): {valid: boolean; message?: string; suggestions?: readonly string[]} {
  const attr = ARIA_ATTRIBUTES[attrName];
  if (!attr) {
    return {valid: false, message: `Unknown ARIA attribute: ${attrName}`};
  }

  // Handle empty values
  if (value === '') {
    return {valid: true}; // Empty is generally valid (equivalent to undefined)
  }

  switch (attr.type) {
    case 'boolean':
      if (value !== 'true' && value !== 'false') {
        return {
          valid: false,
          message: `Invalid boolean value for ${attrName}. Expected 'true' or 'false'.`,
          suggestions: ['true', 'false'],
        };
      }
      return {valid: true};

    case 'tristate':
      if (value !== 'true' && value !== 'false' && value !== 'mixed') {
        return {
          valid: false,
          message: `Invalid tristate value for ${attrName}. Expected 'true', 'false', or 'mixed'.`,
          suggestions: ['true', 'false', 'mixed'],
        };
      }
      return {valid: true};

    case 'integer':
      if (!/^-?\d+$/.test(value)) {
        return {
          valid: false,
          message: `Invalid integer value for ${attrName}. Expected a whole number.`,
        };
      }
      return {valid: true};

    case 'number':
      if (!/^-?\d+(\.\d+)?$/.test(value)) {
        return {
          valid: false,
          message: `Invalid number value for ${attrName}. Expected a numeric value.`,
        };
      }
      return {valid: true};

    case 'token':
      if (attr.values) {
        const normalizedValue = value.toLowerCase();
        const lowerValues = attr.values.map((v) => v.toLowerCase());
        if (!lowerValues.includes(normalizedValue)) {
          return {
            valid: false,
            message: `Invalid value '${value}' for ${attrName}. Expected one of: ${attr.values.join(', ')}.`,
            suggestions: attr.values,
          };
        }
      }
      return {valid: true};

    case 'tokenlist':
      if (attr.values) {
        const tokens = value.split(/\s+/).filter((t) => t.length > 0);
        const lowerValues = new Set(attr.values.map((v) => v.toLowerCase()));
        const invalid = tokens.filter((t) => !lowerValues.has(t.toLowerCase()));
        if (invalid.length > 0) {
          return {
            valid: false,
            message: `Invalid value(s) '${invalid.join(', ')}' for ${attrName}. Allowed values: ${attr.values.join(', ')}.`,
            suggestions: attr.values,
          };
        }
      }
      return {valid: true};

    case 'id':
    case 'idlist':
    case 'string':
      // String, id, and idlist values are generally free-form
      return {valid: true};

    default:
      return {valid: true};
  }
}

/**
 * Levenshtein distance calculation for fuzzy matching.
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
