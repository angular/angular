/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * ARIA Intellisense Module
 *
 * This module provides ARIA attribute and role validation, completions, and quick info
 * for Angular templates.
 *
 * Features:
 * - ARIA attribute name validation (aria-label, aria-hidden, etc.)
 * - ARIA attribute value validation (boolean, token, integer types)
 * - ARIA role validation (button, dialog, navigation, etc.)
 * - Typo suggestions using Levenshtein distance
 * - Support for WAI-ARIA 1.2 specification
 * - Support for DPUB-ARIA roles (doc-*)
 * - Support for Graphics ARIA roles (graphics-*)
 *
 * Diagnostic Codes:
 * - 99201: Unknown ARIA attribute
 * - 99202: Invalid ARIA attribute value
 * - 99203: Unknown ARIA role
 * - 99204: Deprecated ARIA attribute
 * - 99205: Invalid ARIA role value
 */

// ARIA data and utilities
export {
  ARIA_ATTRIBUTES,
  ARIA_ROLES,
  VALID_ARIA_ATTRIBUTES,
  VALID_ARIA_ROLES,
  isValidAriaAttribute,
  isValidAriaRole,
  getAriaAttributeDocumentation,
  getAriaAttributeValues,
  getAriaAttributeType,
  findSimilarAriaAttributes,
  findSimilarAriaRoles,
  validateAriaValue,
  type AriaAttributeDefinition,
  type AriaAttributeType,
} from './aria_data';

// ARIA diagnostics
export {
  getAriaDiagnostics,
  getAllAriaAttributes,
  getAllAriaRoles,
  AriaDiagnosticCode,
  DEFAULT_ARIA_DIAGNOSTICS_CONFIG,
  type AriaDiagnosticsConfig,
} from './aria_diagnostics';

// ARIA completions
export {
  getAriaAttributeCompletions,
  getAriaRoleCompletions,
  getAriaValueCompletions,
  getAriaAttributeQuickInfo,
  getAriaRoleQuickInfo,
  DEFAULT_ARIA_COMPLETIONS_CONFIG,
  type AriaCompletionsConfig,
} from './aria_completions';
