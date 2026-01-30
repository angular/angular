/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * CSS Intellisense Module
 *
 * This module provides CSS property completions, validation, and quick fixes
 * for Angular's style bindings like `[style.propertyName]`.
 *
 * Features:
 * - CSS property name completions with fuzzy matching
 * - CSS property value completions for enumerated properties
 * - CSS unit suffix completions (.px, .em, .rem, etc.)
 * - Invalid property name diagnostics with suggestions
 * - Code fixes to correct typos
 * - Quick info (hover) for CSS properties
 *
 * Implementation:
 * - Uses vscode-css-languageservice for W3C-accurate CSS data (2000+ properties)
 * - Angular-specific pseudo-class support (:host, :host-context, ::ng-deep)
 * - SCSS/LESS support for component styles
 */

// Angular-specific style binding utilities
export {
  // Unit suffix utilities (Angular-specific)
  getCSSUnitSuffixes,
  isValidCSSUnit,
  CSS_UNIT_SUFFIXES,
  type CSSUnitSuffix,
  // Style binding analysis (Angular-specific)
  analyzeStyleBinding,
  type StyleBindingAnalysis,
  // Obsolete property utilities (has replacement info not in vscode-css-languageservice)
  isObsoleteCSSProperty,
  getObsoleteCSSPropertyInfo,
  type ObsoleteCSSProperty,
  // Shorthand property utilities (for conflict detection)
  getShorthandLonghands,
  isShorthandProperty,
  getShorthandForLonghand,
  CSS_SHORTHAND_LONGHANDS,
} from './css_properties';

export {
  // CSS Completions
  getCSSPropertyCompletions,
  getCSSUnitCompletions,
  getCSSValueCompletions,
  getNumericUnitCompletions,
  createCSSPropertyDiagnostic,
  getCSSPropertyQuickInfo,
  getCSSPropertyCodeFixes,
  DEFAULT_CSS_COMPLETIONS_CONFIG,
  type CSSCompletionsConfig,
} from './css_completions';

export {
  // CSS Diagnostics
  getCssDiagnostics,
  DEFAULT_CSS_DIAGNOSTICS_CONFIG,
  CssDiagnosticCode,
  type CssDiagnosticsConfig,
} from './css_diagnostics';

// vscode-css-languageservice integration (core CSS functionality)
export {
  // Utility functions
  kebabToCamelCase,
  camelToKebabCase,
  levenshteinDistance,
  isVendorPrefixedProperty,
  // Property validation
  isValidCSSPropertyVSCode,
  validateCSSValue,
  validateCSSDocument,
  // Property data
  getAllCSSProperties,
  getCSSPropertyNamesVSCode,
  getCSSPropertyNameSetVSCode,
  getCSSPropertyValuesVSCode,
  getPropertyUnitCategory,
  isUnitlessNumericProperty,
  // Fuzzy matching
  findSimilarCSSProperties,
  findSimilarCSSValues,
  // Hover/Quick Info
  getCSSPropertyHover,
  getCSSValueHover,
  getCSSValueDocumentation,
  getCSSValueHoverAtOffset,
  getCSSValueTokens,
  // Color detection and presentation
  findCSSColors,
  parseColorValue,
  isColorProperty,
  getColorPresentations,
  // Obsolete detection
  isObsoleteCSSPropertyVSCode,
  // Service access for advanced use
  getServiceForLanguage,
  // Types
  type CSSPropertyInfo,
  type CSSValidationResult,
  type CSSHoverInfo,
  type CSSValueHoverInfo,
  type CSSValueTokenInfo,
  type CSSUnitCategory,
  type CSSValueCompletionInfo,
  type CSSColorInfo,
} from './css_language_service';
