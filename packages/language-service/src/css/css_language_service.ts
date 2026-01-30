/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * CSS Language Service Adapter
 *
 * This module provides a wrapper around vscode-css-languageservice that
 * integrates with Angular Language Service for CSS IntelliSense features.
 *
 * Features:
 * - CSS property/value validation using W3C-accurate data (2000+ properties)
 * - Angular-specific pseudo-class support (:host, :host-context, ::ng-deep)
 * - Complete property completions with MDN documentation
 * - Complete value completions for all properties
 * - Color detection and conversion
 * - SCSS/LESS support for component styles
 */

import {
  getCSSLanguageService,
  getSCSSLanguageService,
  getLESSLanguageService,
  newCSSDataProvider,
} from 'vscode-css-languageservice';

import {TextDocument} from 'vscode-languageserver-textdocument';

// CSS-Tree for value validation
// TODO: Replace css-tree value validation when vscode-css-languageservice
// supports value validation natively.
// Track: https://github.com/microsoft/vscode-css-languageservice/issues/457
// Track: https://github.com/microsoft/vscode-css-languageservice/issues/442
import * as cssTree from 'css-tree';

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Converts a kebab-case CSS property name to camelCase.
 * @param kebabCase The kebab-case property name (e.g., 'background-color').
 * @returns The camelCase property name (e.g., 'backgroundColor').
 */
export function kebabToCamelCase(kebabCase: string): string {
  return kebabCase.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converts a camelCase CSS property name to kebab-case.
 * @param camelCase The camelCase property name (e.g., 'backgroundColor').
 * @returns The kebab-case property name (e.g., 'background-color').
 */
export function camelToKebabCase(camelCase: string): string {
  return camelCase.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/**
 * Calculates the Levenshtein distance between two strings.
 * Used for fuzzy matching property names and values.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      );
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Checks if a property name is a vendor-prefixed CSS property.
 * Supports both kebab-case (-webkit-transform) and camelCase (WebkitTransform) formats.
 * @param propertyName The property name to check.
 * @returns True if the property has a vendor prefix.
 */
export function isVendorPrefixedProperty(propertyName: string): boolean {
  // Kebab-case vendor prefixes
  if (
    propertyName.startsWith('-webkit-') ||
    propertyName.startsWith('-moz-') ||
    propertyName.startsWith('-ms-') ||
    propertyName.startsWith('-o-')
  ) {
    return true;
  }

  // CamelCase vendor prefixes
  // Note: ms prefix is typically lowercase in camelCase (msTransform, not MsTransform)
  // but when converting from kebab-case, -ms-flex becomes MsFlex (capital M)
  if (
    propertyName.startsWith('Webkit') ||
    propertyName.startsWith('Moz') ||
    propertyName.startsWith('ms') ||
    propertyName.startsWith('Ms') || // Handle MsFlex from kebab-case conversion
    propertyName.startsWith('O')
  ) {
    // Check that it's not just a property starting with these letters
    // Vendor-prefixed properties have a capital letter after the prefix (except ms)
    // e.g., WebkitTransform, MozAppearance, msFlexAlign, OTransition
    if (propertyName.startsWith('ms')) {
      // ms prefix: msTransform, msFlexAlign (next char should be uppercase)
      return propertyName.length > 2 && propertyName[2] === propertyName[2].toUpperCase();
    } else if (propertyName.startsWith('Ms')) {
      // Ms prefix (from kebab-case conversion): MsFlex, MsTransform
      return propertyName.length > 2 && /^Ms[A-Z]/.test(propertyName);
    } else if (propertyName.startsWith('O')) {
      // O prefix: OTransition (next char should be uppercase)
      return propertyName.length > 1 && propertyName[1] === propertyName[1].toUpperCase();
    } else {
      // Webkit, Moz: WebkitTransform, MozAppearance
      // The prefix itself starts with uppercase and continues with a standard property name
      return propertyName.length > propertyName.match(/^(Webkit|Moz)/)?.[0].length!;
    }
  }

  return false;
}

// Type-only imports (these are re-exported from vscode-languageserver-types)
import type {
  LanguageService,
  Diagnostic,
  CompletionList,
  CompletionItem,
  Hover,
  ColorInformation,
  Position,
  CSSDataV1,
  ICSSDataProvider,
  MarkupContent,
  MarkedString,
} from 'vscode-css-languageservice';

// LSP constants (from vscode-languageserver-types, using values directly to avoid import issues)
// These are stable LSP protocol values that won't change
const DiagnosticSeverity = {
  Error: 1,
  Warning: 2,
  Information: 3,
  Hint: 4,
} as const;

const CompletionItemKind = {
  Text: 1,
  Method: 2,
  Function: 3,
  Constructor: 4,
  Field: 5,
  Variable: 6,
  Class: 7,
  Interface: 8,
  Module: 9,
  Property: 10,
  Unit: 11,
  Value: 12,
  Enum: 13,
  Keyword: 14,
  Snippet: 15,
  Color: 16,
  File: 17,
  Reference: 18,
  Folder: 19,
  EnumMember: 20,
  Constant: 21,
  Struct: 22,
  Event: 23,
  Operator: 24,
  TypeParameter: 25,
} as const;

// =============================================================================
// Angular-Specific CSS Data Provider
// =============================================================================

/**
 * Angular-specific CSS data to extend the default CSS language service
 * with Angular component styling features.
 */
const ANGULAR_CSS_DATA: CSSDataV1 = {
  version: 1.1,
  properties: [],
  atDirectives: [],
  pseudoClasses: [
    {
      name: ':host',
      description:
        "Selects the component's host element. Use to style the element that hosts the component.",
      references: [
        {
          name: 'Angular Documentation',
          url: 'https://angular.dev/guide/components/styling#host-selectors',
        },
        {
          name: 'MDN Web Docs',
          url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/:host',
        },
      ],
    },
    {
      name: ':host()',
      description:
        'Selects the host element only if it matches the selector argument. Example: `:host(.active)`',
      references: [
        {
          name: 'Angular Documentation',
          url: 'https://angular.dev/guide/components/styling#host-selectors',
        },
      ],
    },
    {
      name: ':host-context()',
      description:
        "Applies styles based on conditions outside the component's view. Searches ancestors for matching selector.",
      references: [
        {
          name: 'Angular Documentation',
          url: 'https://angular.dev/guide/components/styling#host-context',
        },
        {
          name: 'MDN Web Docs',
          url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/:host-context',
        },
      ],
    },
  ],
  pseudoElements: [
    {
      name: '::ng-deep',
      status: 'obsolete',
      description:
        '⚠️ DEPRECATED: Forces styles to apply to child components. Use alternative approaches like CSS custom properties.',
      references: [
        {
          name: 'Angular Documentation',
          url: 'https://angular.dev/guide/components/styling#ng-deep',
        },
      ],
    },
  ],
};

// =============================================================================
// Singleton CSS Language Service
// =============================================================================

let cssLanguageService: LanguageService | null = null;
let scssLanguageService: LanguageService | null = null;
let lessLanguageService: LanguageService | null = null;
let angularDataProvider: ICSSDataProvider | null = null;

/**
 * Initialize the CSS language service with Angular-specific extensions.
 * This is lazy-loaded on first use for performance.
 */
function initializeCSSService(): LanguageService {
  if (cssLanguageService === null) {
    angularDataProvider = newCSSDataProvider(ANGULAR_CSS_DATA);
    cssLanguageService = getCSSLanguageService();
    cssLanguageService.setDataProviders(true, [angularDataProvider]);
  }
  return cssLanguageService;
}

/**
 * Get the SCSS language service (lazy-loaded).
 */
function getSCSSService(): LanguageService {
  if (scssLanguageService === null) {
    if (angularDataProvider === null) {
      angularDataProvider = newCSSDataProvider(ANGULAR_CSS_DATA);
    }
    scssLanguageService = getSCSSLanguageService();
    scssLanguageService.setDataProviders(true, [angularDataProvider]);
  }
  return scssLanguageService;
}

/**
 * Get the LESS language service (lazy-loaded).
 */
function getLESSService(): LanguageService {
  if (lessLanguageService === null) {
    if (angularDataProvider === null) {
      angularDataProvider = newCSSDataProvider(ANGULAR_CSS_DATA);
    }
    lessLanguageService = getLESSLanguageService();
    lessLanguageService.setDataProviders(true, [angularDataProvider]);
  }
  return lessLanguageService;
}

/**
 * Get the appropriate service based on language.
 */
export function getServiceForLanguage(language: 'css' | 'scss' | 'less'): LanguageService {
  switch (language) {
    case 'scss':
      return getSCSSService();
    case 'less':
      return getLESSService();
    default:
      return initializeCSSService();
  }
}

// =============================================================================
// CSS Property Validation
// =============================================================================

/**
 * Check if a CSS property name is valid using css-tree's property definitions.
 * This provides accurate, up-to-date validation against W3C/MDN data.
 *
 * Handles:
 * - Standard CSS properties (from css-tree's lexer)
 * - CSS custom properties (--*) which are always valid
 * - Vendor-prefixed properties (-webkit-*, -moz-*, etc.) which are always valid
 *
 * @param propertyName The CSS property name (camelCase or kebab-case).
 * @returns true if the property is valid, false otherwise.
 */
export function isValidCSSPropertyVSCode(propertyName: string): boolean {
  // CSS custom properties are always valid (css-tree has '--*' for all custom props)
  if (propertyName.startsWith('--')) {
    return true;
  }

  // Vendor-prefixed properties are always valid
  if (isVendorPrefixedProperty(propertyName)) {
    return true;
  }

  // css-tree stores properties in kebab-case
  // The properties object is not typed but exists at runtime
  const kebabProperty = camelToKebabCase(propertyName);
  const lexerProps = (cssTree.lexer as unknown as {properties: Record<string, unknown>}).properties;
  return kebabProperty in lexerProps;
}

/**
 * Unit category for CSS values - used to determine which units to suggest.
 */
export type CSSUnitCategory = 'length' | 'time' | 'angle' | 'none';

// Type for css-tree property definition syntax node
interface CssTreeSyntaxNode {
  type?: string;
  name?: string;
  terms?: CssTreeSyntaxNode[];
  term?: CssTreeSyntaxNode;
}

// Type for css-tree property definition
interface CssTreePropertyDef {
  syntax?: CssTreeSyntaxNode;
}

/**
 * Determines what unit category a CSS property accepts based on css-tree's syntax data.
 * This is used to suggest appropriate units for style bindings like [style.width.px].
 *
 * @param propertyName The CSS property name (camelCase or kebab-case).
 * @returns The unit category: 'length' (px, em, rem...), 'time' (s, ms), 'angle' (deg, rad...), or 'none'.
 */
export function getPropertyUnitCategory(propertyName: string): CSSUnitCategory {
  const kebabProperty = camelToKebabCase(propertyName);

  // Access the property definition from css-tree's lexer
  const lexerProps = (cssTree.lexer as unknown as {properties: Record<string, CssTreePropertyDef>})
    .properties;
  const propDef = lexerProps[kebabProperty];

  if (!propDef?.syntax) {
    return 'none';
  }

  // Extract types from the syntax tree
  const types = new Set<string>();

  function visit(node: CssTreeSyntaxNode | undefined): void {
    if (!node) return;
    if (node.type === 'Type' && node.name) {
      types.add(node.name);
    }
    if (node.terms) {
      node.terms.forEach(visit);
    }
    if (node.term) visit(node.term);
  }

  visit(propDef.syntax);

  // Prioritize: time > angle > length (more specific first)
  if (types.has('time')) {
    return 'time';
  }
  if (types.has('angle')) {
    return 'angle';
  }
  if (types.has('length') || types.has('length-percentage') || types.has('percentage')) {
    return 'length';
  }

  return 'none';
}

/**
 * Determines if a CSS property is a unitless numeric property.
 * These properties accept numbers without units (e.g., opacity: 0.5, z-index: 10).
 *
 * Uses css-tree to detect properties that accept 'number', 'integer', or 'alpha-value'
 * types WITHOUT also accepting 'length' types.
 *
 * @param propertyName The CSS property name (camelCase or kebab-case).
 * @returns true if the property accepts unitless numbers.
 */
export function isUnitlessNumericProperty(propertyName: string): boolean {
  const kebabProperty = camelToKebabCase(propertyName);

  // Access the property definition from css-tree's lexer
  const lexerProps = (cssTree.lexer as unknown as {properties: Record<string, CssTreePropertyDef>})
    .properties;
  const propDef = lexerProps[kebabProperty];

  if (!propDef?.syntax) {
    return false;
  }

  // Extract types from the syntax tree
  const types = new Set<string>();

  function visit(node: CssTreeSyntaxNode | undefined): void {
    if (!node) return;
    if (node.type === 'Type' && node.name) {
      types.add(node.name);
    }
    if (node.terms) {
      node.terms.forEach(visit);
    }
    if (node.term) visit(node.term);
  }

  visit(propDef.syntax);

  // Unitless numeric: accepts number/integer/alpha-value but NOT length
  const hasNumericType = types.has('number') || types.has('integer') || types.has('alpha-value');
  const hasLengthType = types.has('length') || types.has('length-percentage');

  return hasNumericType && !hasLengthType;
}

/**
 * Validate a CSS property-value pair using css-tree's grammar-based validation.
 *
 * This uses css-tree's lexer to validate both property names and values against
 * W3C CSS Value Definition Syntax grammar. This provides accurate validation for
 * complex compound values like `border: red solid 1px`.
 *
 * css-tree returns:
 * - SyntaxReferenceError: Unknown property name
 * - SyntaxMatchError: Invalid value for the property
 *
 * @param property The CSS property name (camelCase or kebab-case).
 * @param value The CSS value to validate.
 * @returns Array of validation results (empty if valid).
 */
export function validateCSSValue(property: string, value: string): CSSValidationResult[] {
  const kebabProperty = camelToKebabCase(property);
  const results: CSSValidationResult[] = [];

  // Skip validation for CSS custom properties (variables)
  if (kebabProperty.startsWith('--')) {
    return results;
  }

  // Skip validation for CSS variable references
  if (value.includes('var(')) {
    return results;
  }

  // Use css-tree for both property and value validation
  try {
    const valueAst = cssTree.parse(value, {context: 'value', positions: true});
    const matchResult = cssTree.lexer.matchProperty(kebabProperty, valueAst);

    if (matchResult.error) {
      const errorName = matchResult.error.name;

      if (errorName === 'SyntaxReferenceError') {
        // Unknown property
        results.push({
          message: `Unknown property: '${kebabProperty}'`,
          severity: 'error',
        });
      } else if (errorName === 'SyntaxMatchError') {
        // Invalid value
        const syntaxError = matchResult.error as cssTree.SyntaxMatchError;
        const errorMessage = formatCssTreeError(kebabProperty, value, syntaxError);
        results.push({
          message: errorMessage,
          severity: 'error',
        });
      }
    }
  } catch {
    // Parse errors - let vscode-css-languageservice handle these in document validation
  }

  return results;
}

/**
 * Find similar valid CSS values for a given property.
 * Uses Levenshtein distance for fuzzy matching.
 *
 * @param property The CSS property name.
 * @param invalidValue The invalid value to find suggestions for.
 * @param maxSuggestions Maximum number of suggestions to return.
 * @returns Array of similar valid values, sorted by similarity.
 */
export function findSimilarCSSValues(
  property: string,
  invalidValue: string,
  maxSuggestions: number = 3,
): string[] {
  const validValues = getCSSPropertyValuesVSCode(property);
  if (validValues.length === 0) {
    return [];
  }

  const invalidLower = invalidValue.toLowerCase();

  // Calculate Levenshtein distance for each valid value
  const distances: Array<{value: string; distance: number}> = validValues.map((value) => ({
    value,
    distance: levenshteinDistance(invalidLower, value.toLowerCase()),
  }));

  // Filter to values with reasonable distance and sort by distance
  // Allow higher distance for shorter input strings
  const maxDistance = Math.max(3, Math.floor(invalidValue.length / 2));
  return distances
    .filter((d) => d.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxSuggestions)
    .map((d) => d.value);
}

/**
 * Format a css-tree validation error into a user-friendly message.
 * Includes suggestions for similar valid values.
 *
 * Note: This message is appended to "Invalid CSS value 'X' for property 'Y'."
 * by the diagnostic wrapper, so we don't repeat that part.
 */
function formatCssTreeError(
  property: string,
  value: string,
  error: cssTree.SyntaxMatchError,
): string {
  const mismatchValue =
    error.mismatchLength !== undefined && error.mismatchOffset !== undefined
      ? value.slice(error.mismatchOffset, error.mismatchOffset + error.mismatchLength)
      : value;

  // Find similar valid values for suggestion
  const valueToSuggestFor = mismatchValue || value;
  const suggestions = findSimilarCSSValues(property, valueToSuggestFor, 3);

  // Just return the suggestion part; the diagnostic wrapper handles the "Invalid CSS value" prefix
  if (suggestions.length > 0) {
    return `Did you mean '${suggestions[0]}'?`;
  }

  // If we can identify a specific mismatch within a compound value, mention it
  if (mismatchValue && mismatchValue !== value) {
    return `'${mismatchValue}' is not a valid value.`;
  }

  return `Value is not valid for this property.`;
}

/**
 * Result of CSS validation.
 */
export interface CSSValidationResult {
  message: string;
  severity: 'error' | 'warning' | 'info' | 'hint';
  range?: {
    start: {line: number; character: number};
    end: {line: number; character: number};
  };
}

/**
 * Map vscode-css-languageservice severity to our severity.
 */
function mapSeverity(severity: number | undefined): 'error' | 'warning' | 'info' | 'hint' {
  switch (severity) {
    case DiagnosticSeverity.Error:
      return 'error';
    case DiagnosticSeverity.Warning:
      return 'warning';
    case DiagnosticSeverity.Information:
      return 'info';
    case DiagnosticSeverity.Hint:
      return 'hint';
    default:
      return 'warning';
  }
}

// =============================================================================
// CSS Property Completions
// =============================================================================

/**
 * Cache for property completions.
 */
let cachedPropertyCompletions: CSSPropertyInfo[] | null = null;

/**
 * Information about a CSS property.
 */
export interface CSSPropertyInfo {
  name: string;
  description?: string;
  syntax?: string;
  status?: 'standard' | 'experimental' | 'obsolete';
  browsers?: string;
}

/**
 * Get all CSS property names with metadata from vscode-css-languageservice.
 * This provides comprehensive property information from W3C/MDN data.
 *
 * @returns Array of CSS property information objects.
 */
export function getAllCSSProperties(): CSSPropertyInfo[] {
  if (cachedPropertyCompletions !== null) {
    return cachedPropertyCompletions;
  }

  const service = initializeCSSService();
  const document = TextDocument.create('temp.css', 'css', 1, '.temp {  }');
  const stylesheet = service.parseStylesheet(document);
  const position: Position = {line: 0, character: 7}; // Inside the braces
  const completions = service.doComplete(document, position, stylesheet);

  cachedPropertyCompletions = completions.items
    .filter((item: CompletionItem) => item.kind === CompletionItemKind.Property)
    .map((item: CompletionItem) => ({
      name: kebabToCamelCase(item.label),
      description: getCompletionDocumentation(item),
      syntax: item.detail,
      status: item.tags?.includes(1) // 1 = Deprecated tag
        ? ('obsolete' as const)
        : ('standard' as const),
    }));

  return cachedPropertyCompletions;
}

/**
 * Get CSS property names as a simple string array in camelCase.
 *
 * @returns Array of CSS property names in camelCase.
 */
export function getCSSPropertyNamesVSCode(): string[] {
  return getAllCSSProperties().map((p) => p.name);
}

/**
 * Get a Set of CSS property names for fast lookup.
 *
 * @returns Set of CSS property names in camelCase.
 */
export function getCSSPropertyNameSetVSCode(): Set<string> {
  return new Set(getCSSPropertyNamesVSCode());
}

/**
 * Finds similar CSS property names for a given misspelled property.
 * Uses Levenshtein distance for fuzzy matching.
 * @param typo The misspelled property name.
 * @param maxSuggestions Maximum number of suggestions to return.
 * @returns Array of similar property names, sorted by similarity.
 */
export function findSimilarCSSProperties(typo: string, maxSuggestions: number = 3): string[] {
  const properties = getCSSPropertyNamesVSCode();
  const typoLower = typo.toLowerCase();

  // Calculate Levenshtein distance for each property
  const distances: Array<{name: string; distance: number}> = properties.map((name) => ({
    name,
    distance: levenshteinDistance(typoLower, name.toLowerCase()),
  }));

  // Filter to properties with reasonable distance and sort by distance
  return distances
    .filter((d) => d.distance <= Math.max(3, Math.floor(typo.length / 2)))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxSuggestions)
    .map((d) => d.name);
}

/**
 * Extract documentation from a completion item.
 */
function getCompletionDocumentation(item: CompletionItem): string | undefined {
  if (!item.documentation) {
    return undefined;
  }
  if (typeof item.documentation === 'string') {
    return item.documentation;
  }
  return (item.documentation as MarkupContent).value;
}

// =============================================================================
// CSS Value Completions
// =============================================================================

/**
 * Value completion info with MDN documentation from vscode-css-languageservice.
 */
export interface CSSValueCompletionInfo {
  /** The value name (e.g., "flex", "solid", "red") */
  label: string;
  /** MDN documentation for this value, if available */
  documentation?: string;
}

/**
 * Cache for value completion info per property (names + documentation).
 */
const valueCompletionInfoCache = new Map<string, Map<string, CSSValueCompletionInfo>>();

/**
 * Get all value completions for a property with documentation.
 * Returns a Map from value name to full completion info including MDN docs.
 *
 * @param propertyName The CSS property name (camelCase or kebab-case).
 * @returns Map of value names to completion info.
 */
function getValueCompletionInfoForProperty(
  propertyName: string,
): Map<string, CSSValueCompletionInfo> {
  const kebabProperty = camelToKebabCase(propertyName);

  // Check cache
  if (valueCompletionInfoCache.has(kebabProperty)) {
    return valueCompletionInfoCache.get(kebabProperty)!;
  }

  const service = initializeCSSService();
  const cssContent = `.temp { ${kebabProperty}:  }`;
  const document = TextDocument.create('temp.css', 'css', 1, cssContent);
  const stylesheet = service.parseStylesheet(document);
  // Position after the colon and space
  const position: Position = {line: 0, character: 8 + kebabProperty.length + 2};
  const completions = service.doComplete(document, position, stylesheet);

  const infoMap = new Map<string, CSSValueCompletionInfo>();
  for (const item of completions.items) {
    if (item.kind !== CompletionItemKind.Property) {
      infoMap.set(item.label, {
        label: item.label,
        documentation: getCompletionDocumentation(item),
      });
    }
  }

  valueCompletionInfoCache.set(kebabProperty, infoMap);
  return infoMap;
}

/**
 * Get documentation for a specific CSS value from vscode-css-languageservice.
 *
 * @param propertyName The CSS property name.
 * @param valueName The CSS value to look up.
 * @returns MDN documentation string or undefined if not found.
 */
export function getCSSValueDocumentation(
  propertyName: string,
  valueName: string,
): string | undefined {
  const infoMap = getValueCompletionInfoForProperty(propertyName);
  return infoMap.get(valueName)?.documentation;
}

/**
 * CSS value hover information.
 */
export interface CSSValueHoverInfo {
  /** The CSS property name */
  property: string;
  /** The CSS value */
  value: string;
  /** MDN documentation for this value */
  documentation?: string;
  /** Whether this value is valid for the property */
  isValid: boolean;
}

/**
 * Get hover information for a CSS value from vscode-css-languageservice.
 * Uses the completion API to get MDN documentation for keyword values.
 *
 * @param propertyName The CSS property name (camelCase or kebab-case).
 * @param value The CSS value to get hover info for.
 * @returns Hover info with MDN documentation, or null if not found.
 */
export function getCSSValueHover(propertyName: string, value: string): CSSValueHoverInfo | null {
  const kebabProperty = camelToKebabCase(propertyName);
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return null;
  }

  // Get completion info which has MDN documentation
  const infoMap = getValueCompletionInfoForProperty(propertyName);
  const completionInfo = infoMap.get(trimmedValue);

  // Check if it's a valid value for this property
  const isValid = infoMap.has(trimmedValue);

  return {
    property: kebabProperty,
    value: trimmedValue,
    documentation: completionInfo?.documentation,
    isValid,
  };
}

/**
 * Get valid values for a CSS property using vscode-css-languageservice.
 * This provides complete value completions from W3C/MDN data.
 *
 * @param propertyName The CSS property name (camelCase or kebab-case).
 * @returns Array of valid values for the property.
 */
export function getCSSPropertyValuesVSCode(propertyName: string): string[] {
  // Reuse getValueCompletionInfoForProperty which already caches the completion data
  const infoMap = getValueCompletionInfoForProperty(propertyName);
  return Array.from(infoMap.keys());
}

// =============================================================================
// CSS Hover Information
// =============================================================================

/**
 * Get hover/quick info for a CSS property using vscode-css-languageservice.
 * This provides rich MDN documentation.
 *
 * @param propertyName The CSS property name (camelCase or kebab-case).
 * @returns Hover information or null if not found.
 */
export function getCSSPropertyHover(propertyName: string): CSSHoverInfo | null {
  const service = initializeCSSService();
  const kebabProperty = camelToKebabCase(propertyName);
  const cssContent = `.temp { ${kebabProperty}: initial; }`;
  const document = TextDocument.create('temp.css', 'css', 1, cssContent);
  const stylesheet = service.parseStylesheet(document);
  // Position at the start of the property name
  const position: Position = {line: 0, character: 8};
  const hover = service.doHover(document, position, stylesheet);

  if (!hover || !hover.contents) {
    return null;
  }

  return {
    property: propertyName,
    documentation: extractHoverContent(hover.contents),
    syntax: extractSyntax(hover.contents),
  };
}

/**
 * CSS hover information.
 */
export interface CSSHoverInfo {
  property: string;
  documentation: string;
  syntax?: string;
}

/**
 * CSS value token information for hover documentation.
 */
export interface CSSValueTokenInfo {
  /** The token text (e.g., "1px", "solid", "red") */
  token: string;
  /** The semantic CSS type (e.g., "length", "line-style", "color") */
  semanticType: string | null;
  /** Token start offset within the value string */
  start: number;
  /** Token end offset within the value string */
  end: number;
  /** Human-readable description of what this token represents */
  description: string;
}

/**
 * Get hover info for a specific position within a CSS value.
 * Uses css-tree to parse the value and determine the semantic type of each token.
 *
 * This provides rich documentation for individual value components, e.g.:
 * - For "border: 1px solid red", hovering over "solid" shows "line-style" info
 * - For "display: flex", hovering over "flex" shows "display-inside" info
 *
 * NOTE: This is a TEMPORARY solution using css-tree until vscode-css-languageservice
 * implements native value hover/documentation.
 * Track: https://github.com/microsoft/vscode-css-languageservice/issues/457
 *
 * @param property The CSS property name (for context).
 * @param value The CSS value string.
 * @param offset Position within the value to get info for.
 * @returns Token information or null if position is not on a token.
 */
export function getCSSValueHoverAtOffset(
  property: string,
  value: string,
  offset: number,
): CSSValueTokenInfo | null {
  try {
    const valueAst = cssTree.parse(value, {context: 'value', positions: true});
    let result: CSSValueTokenInfo | null = null;

    cssTree.walk(valueAst, (node) => {
      // Check if this node contains the offset
      if (
        node.loc &&
        node.loc.start.offset <= offset &&
        node.loc.end.offset >= offset &&
        node.type !== 'Value' // Skip the root Value node
      ) {
        const tokenInfo = getCssTreeNodeInfo(property, node);
        if (tokenInfo) {
          result = tokenInfo;
        }
      }
    });

    return result;
  } catch {
    return null;
  }
}

/**
 * Get all token information for a CSS value.
 * Useful for syntax highlighting or providing multiple hover targets.
 *
 * @param property The CSS property name.
 * @param value The CSS value string.
 * @returns Array of token information objects.
 */
export function getCSSValueTokens(property: string, value: string): CSSValueTokenInfo[] {
  try {
    const valueAst = cssTree.parse(value, {context: 'value', positions: true});
    const tokens: CSSValueTokenInfo[] = [];

    cssTree.walk(valueAst, (node) => {
      if (node.type !== 'Value' && node.loc) {
        const tokenInfo = getCssTreeNodeInfo(property, node);
        if (tokenInfo) {
          tokens.push(tokenInfo);
        }
      }
    });

    return tokens;
  } catch {
    return [];
  }
}

/**
 * Get the semantic type for a CSS value using css-tree's grammar matching.
 * This extracts the first relevant type from the match result.
 *
 * @param property The CSS property name.
 * @param value The CSS value string.
 * @returns The semantic type string, or null if not found.
 */
function getSemanticTypeFromCssTree(property: string, value: string): string | null {
  try {
    const ast = cssTree.parse(value, {context: 'value'});
    const match = cssTree.lexer.matchProperty(property, ast) as {
      error: unknown;
      matched?: unknown;
    };

    if (match.error || !match.matched) return null;

    // Extract types from the match tree
    const types: string[] = [];
    function traverse(node: unknown): void {
      const n = node as {syntax?: {type?: string; name?: string}; match?: unknown[]};
      if (n.syntax && n.syntax.type === 'Type' && n.syntax.name) {
        types.push(n.syntax.name);
      }
      if (n.match && Array.isArray(n.match)) {
        for (const child of n.match) {
          traverse(child);
        }
      }
    }
    traverse(match.matched);

    // Return the most specific (first) type found
    return types.length > 0 ? types[0] : null;
  } catch {
    return null;
  }
}

/**
 * Extract token information from a css-tree AST node.
 * Uses css-tree for token text and semantic type, vscode-css-languageservice for documentation.
 *
 * @param property The CSS property name (used to look up value documentation).
 * @param node The css-tree AST node to extract info from.
 */
function getCssTreeNodeInfo(property: string, node: cssTree.CssNode): CSSValueTokenInfo | null {
  if (!node.loc) return null;

  const start = node.loc.start.offset;
  const end = node.loc.end.offset;

  // Skip operators (commas, etc.) - not useful for hover
  if (node.type === 'Operator') {
    return null;
  }

  // Get the token text using css-tree's generator
  const token = cssTree.generate(node);

  // Get semantic type from css-tree's grammar
  const semanticType = getSemanticTypeFromCssTree(property, token) ?? node.type.toLowerCase();

  // Get description from vscode-css-languageservice (MDN documentation)
  // For functions, look up the function name with ()
  const lookupValue = node.type === 'Function' ? (node as cssTree.FunctionNode).name + '()' : token;
  const vsCodeDoc = getCSSValueDocumentation(property, lookupValue);
  const description = vsCodeDoc ?? `A CSS ${semanticType} value.`;

  return {token, semanticType, start, end, description};
}

/**
 * Extract text content from hover contents.
 */
function extractHoverContent(contents: MarkupContent | MarkedString | MarkedString[]): string {
  if (typeof contents === 'string') {
    return contents;
  }
  if ('value' in contents) {
    return contents.value;
  }
  if (Array.isArray(contents)) {
    return contents
      .map((c) => (typeof c === 'string' ? c : (c as {language: string; value: string}).value))
      .join('\n\n');
  }
  return '';
}

/**
 * Extract syntax information from hover contents.
 */
function extractSyntax(
  contents: MarkupContent | MarkedString | MarkedString[],
): string | undefined {
  const text = extractHoverContent(contents);
  const syntaxMatch = text.match(/Syntax:\s*`([^`]+)`/);
  return syntaxMatch?.[1];
}

// =============================================================================
// Document Validation
// =============================================================================

/**
 * Validate a complete CSS document using vscode-css-languageservice.
 *
 * @param cssContent The CSS content to validate.
 * @param language The stylesheet language ('css', 'scss', 'less').
 * @returns Array of validation diagnostics.
 */
export function validateCSSDocument(
  cssContent: string,
  language: 'css' | 'scss' | 'less' = 'css',
): CSSValidationResult[] {
  const service = getServiceForLanguage(language);
  const document = TextDocument.create(`temp.${language}`, language, 1, cssContent);
  const stylesheet = service.parseStylesheet(document);
  const diagnostics = service.doValidation(document, stylesheet);

  return diagnostics.map((d: Diagnostic) => ({
    message: d.message,
    severity: mapSeverity(d.severity),
    range: d.range,
  }));
}

// =============================================================================
// Color Detection
// =============================================================================

/**
 * Find all colors in CSS content using vscode-css-languageservice.
 * Supports all CSS color formats including: hex, rgb(), hsl(), hwb(),
 * lab(), lch(), oklab(), oklch(), and named colors.
 *
 * Note: All colors are returned as sRGB (red, green, blue, alpha in 0-1 range)
 * because the LSP Color interface only supports sRGB. Wide-gamut colors from
 * formats like oklab() and oklch() are approximated when converted to sRGB.
 *
 * @param cssContent The CSS content to search.
 * @returns Array of color information with sRGB values.
 */
export function findCSSColors(cssContent: string): CSSColorInfo[] {
  const service = initializeCSSService();
  const document = TextDocument.create('temp.css', 'css', 1, cssContent);
  const stylesheet = service.parseStylesheet(document);
  const colors = service.findDocumentColors(document, stylesheet);

  return colors.map((c: ColorInformation) => ({
    color: {
      red: c.color.red,
      green: c.color.green,
      blue: c.color.blue,
      alpha: c.color.alpha,
    },
    range: c.range,
  }));
}

/**
 * CSS color information.
 */
export interface CSSColorInfo {
  color: {
    red: number;
    green: number;
    blue: number;
    alpha: number;
  };
  range: {
    start: {line: number; character: number};
    end: {line: number; character: number};
  };
}

// =============================================================================
// Obsolete Property Detection
// =============================================================================

/**
 * Check if a CSS property is obsolete/deprecated using vscode-css-languageservice data.
 *
 * @param propertyName The CSS property name (camelCase).
 * @returns true if the property is obsolete/deprecated.
 */
export function isObsoleteCSSPropertyVSCode(propertyName: string): boolean {
  const properties = getAllCSSProperties();
  const prop = properties.find((p) => p.name === propertyName);
  return prop?.status === 'obsolete';
}

// =============================================================================
// Color Detection for Style Bindings
// =============================================================================

/**
 * Parse a color string value and return its RGBA components.
 * Uses vscode-css-languageservice which supports all CSS color formats:
 * hex (#rgb, #rrggbb, #rgba, #rrggbbaa), rgb(), rgba(), hsl(), hsla(),
 * hwb(), lab(), lch(), oklab(), oklch(), and named colors.
 *
 * @param colorValue The color string to parse.
 * @returns Color object with RGBA values (0-1 range) or null if not a valid color.
 */
export function parseColorValue(colorValue: string): CSSColorInfo['color'] | null {
  // Use vscode-css-languageservice to parse the color
  const service = initializeCSSService();
  const cssContent = `.temp { color: ${colorValue}; }`;
  const document = TextDocument.create('temp.css', 'css', 1, cssContent);
  const stylesheet = service.parseStylesheet(document);
  const colors = service.findDocumentColors(document, stylesheet);

  if (colors.length > 0) {
    const c = colors[0];
    return {
      red: c.color.red,
      green: c.color.green,
      blue: c.color.blue,
      alpha: c.color.alpha,
    };
  }

  return null;
}

/**
 * Check if a CSS property accepts color values.
 * Uses css-tree's grammar to check if a named color is valid for the property.
 *
 * @param propertyName The CSS property name (camelCase or kebab-case).
 * @returns true if the property accepts color values.
 */
export function isColorProperty(propertyName: string): boolean {
  const kebabCase = camelToKebabCase(propertyName);

  // Use css-tree to check if a named color is valid for this property
  // This dynamically detects color properties using the CSS grammar
  const match = cssTree.lexer.matchProperty(kebabCase, 'red');
  return match.error === null;
}

/**
 * Get color presentations (different formats) for a given color.
 * Returns formats from vscode-css-languageservice including all modern color spaces:
 * rgb(), #hex, hsl(), hwb(), lab(), lch(), oklab(), oklch()
 *
 * Note: The input color is in sRGB (red, green, blue, alpha in 0-1 range).
 * Wide-gamut colors are approximated when converted to sRGB.
 *
 * @param color The color to get presentations for (sRGB values 0-1).
 * @returns Array of color presentation strings in all supported formats.
 */
export function getColorPresentations(color: CSSColorInfo['color']): string[] {
  const service = initializeCSSService();

  // Create a minimal CSS document for the service
  const cssContent = `.temp { color: red; }`;
  const document = TextDocument.create('temp.css', 'css', 1, cssContent);
  const stylesheet = service.parseStylesheet(document);

  // Get presentations using vscode-css-languageservice
  // The range points to 'red' which will be replaced by the color presentations
  const range = {start: {line: 0, character: 15}, end: {line: 0, character: 18}};
  const presentations = service.getColorPresentations(document, stylesheet, color, range);

  return presentations.map((p) => p.label);
}
