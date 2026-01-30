/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import * as cssTree from 'css-tree';

import {
  getCSSPropertyNamesVSCode,
  getCSSPropertyValuesVSCode,
  isValidCSSPropertyVSCode,
  findSimilarCSSProperties,
  getPropertyUnitCategory,
  CSSUnitCategory,
} from './css_language_service';
import {getCSSUnitSuffixes, analyzeStyleBinding, StyleBindingAnalysis} from './css_properties';

/**
 * Get units from css-tree's lexer for a specific category.
 * This provides comprehensive, W3C-accurate unit lists.
 */
const cssTreeUnits = (cssTree.lexer as unknown as {units: Record<string, string[]>}).units;

/**
 * Priority values for CSS completions.
 * Lower numbers = higher priority in completion list.
 */
const enum CSSCompletionPriority {
  /** Exact prefix match (e.g., 'back' matches 'backgroundColor') */
  PrefixMatch = '0',
  /** Substring match (e.g., 'color' matches 'backgroundColor') */
  SubstringMatch = '1',
  /** Other properties */
  Default = '2',
}

/**
 * Configuration for CSS completions.
 */
export interface CSSCompletionsConfig {
  /** Whether CSS property completions are enabled. */
  enabled: boolean;
  /** Whether to include vendor-prefixed properties. */
  includeVendorProperties: boolean;
  /** Whether to show kebab-case alternatives. */
  showKebabCaseHints: boolean;
}

/**
 * Default configuration for CSS completions.
 */
export const DEFAULT_CSS_COMPLETIONS_CONFIG: CSSCompletionsConfig = {
  enabled: true,
  includeVendorProperties: false,
  showKebabCaseHints: true,
};

/**
 * Generates TypeScript completion entries for CSS property names.
 * This is used when the cursor is after `[style.` to provide property name suggestions.
 *
 * @param prefix The typed prefix to filter completions (e.g., 'back' for 'backgroundColor').
 * @param config Optional configuration for completions.
 * @returns Array of TypeScript completion entries.
 */
export function getCSSPropertyCompletions(
  prefix: string = '',
  config: CSSCompletionsConfig = DEFAULT_CSS_COMPLETIONS_CONFIG,
): ts.CompletionEntry[] {
  if (!config.enabled) {
    return [];
  }

  const properties = getCSSPropertyNamesVSCode();
  const prefixLower = prefix.toLowerCase();

  return properties
    .filter((prop) => {
      const propLower = prop.toLowerCase();
      // Include if prefix matches start or is contained anywhere
      return propLower.startsWith(prefixLower) || propLower.includes(prefixLower);
    })
    .map((prop) => {
      const propLower = prop.toLowerCase();
      const isExactPrefix = propLower.startsWith(prefixLower);

      return {
        name: prop,
        kind: ts.ScriptElementKind.memberVariableElement,
        kindModifiers: '',
        sortText: isExactPrefix
          ? CSSCompletionPriority.PrefixMatch
          : CSSCompletionPriority.SubstringMatch,
        insertText: prop,
        labelDetails: {
          description: 'CSS property',
        },
      };
    });
}

/**
 * Generates TypeScript completion entries for CSS unit suffixes.
 * This is used when the cursor is after a property name (e.g., `[style.width.|`).
 *
 * @param propertyName The CSS property name.
 * @returns Array of TypeScript completion entries for unit suffixes.
 */
export function getCSSUnitCompletions(propertyName: string): ts.CompletionEntry[] {
  const units = getCSSUnitSuffixes();

  // Only provide units for properties that can have length/time values
  // This is a simplification - most properties can use units
  return units.map((unit) => ({
    name: unit,
    kind: ts.ScriptElementKind.keyword,
    kindModifiers: '',
    sortText: '0',
    insertText: unit,
    labelDetails: {
      description: `CSS unit (binding expects number)`,
    },
  }));
}

/**
 * Generates TypeScript completion entries for CSS property values.
 * This is used when completing the value of a style binding.
 *
 * @param propertyName The CSS property name.
 * @returns Array of TypeScript completion entries for valid values.
 */
export function getCSSValueCompletions(propertyName: string): ts.CompletionEntry[] {
  const values = getCSSPropertyValuesVSCode(propertyName);

  return values.map((value, index) => ({
    name: value,
    kind: ts.ScriptElementKind.string,
    kindModifiers: '',
    sortText: String(index).padStart(3, '0'),
    insertText: `'${value}'`,
    labelDetails: {
      description: `${propertyName} value`,
    },
  }));
}

/**
 * Common CSS length units in order of typical usage frequency.
 * Prioritized list for better UX - most common units first.
 */
const COMMON_LENGTH_UNITS = ['px', 'em', 'rem', '%', 'vh', 'vw', 'vmin', 'vmax'] as const;

/**
 * Gets the appropriate unit list for a CSS unit category.
 * Uses css-tree's W3C-accurate unit data with common units prioritized.
 */
function getUnitsForCategory(category: CSSUnitCategory): readonly string[] {
  switch (category) {
    case 'time':
      return cssTreeUnits['time'] || ['s', 'ms'];
    case 'angle':
      return cssTreeUnits['angle'] || ['deg', 'rad', 'turn', 'grad'];
    case 'length':
      // Return common units first for better UX, then other css-tree units
      return COMMON_LENGTH_UNITS;
    default:
      return COMMON_LENGTH_UNITS;
  }
}

/**
 * Generates completion entries for numeric values with unit suffixes.
 * When the user types a number (e.g., '100'), suggests '100px', '100em', etc.
 *
 * Uses css-tree's syntax data to determine which units are appropriate for the property.
 *
 * @param numericValue The numeric value to add units to.
 * @param propertyName The CSS property name to determine appropriate units.
 * @param partialUnit Optional partial unit already typed (e.g., 'p' for 'px').
 * @returns Array of TypeScript completion entries for numeric + unit values.
 */
export function getNumericUnitCompletions(
  numericValue: string,
  propertyName: string,
  partialUnit: string = '',
): ts.CompletionEntry[] {
  const completions: ts.CompletionEntry[] = [];

  // Use css-tree to determine the unit category for this property
  const category = getPropertyUnitCategory(propertyName);
  const units = getUnitsForCategory(category);

  const partialUnitLower = partialUnit.toLowerCase();

  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    // Filter by partial unit if provided
    if (partialUnit && !unit.toLowerCase().startsWith(partialUnitLower)) {
      continue;
    }

    const valueWithUnit = `${numericValue}${unit}`;
    completions.push({
      name: valueWithUnit,
      kind: ts.ScriptElementKind.string,
      kindModifiers: '',
      sortText: `0${i.toString().padStart(2, '0')}`,
      insertText: `'${valueWithUnit}'`,
      labelDetails: {
        description: `${numericValue} ${unit}`,
      },
    });
  }

  return completions;
}

/**
 * Creates a diagnostic for an invalid CSS property name.
 *
 * @param propertyName The invalid property name.
 * @param span The span where the error occurred.
 * @param fileName The file name.
 * @returns A TypeScript diagnostic, or null if the property is valid.
 */
export function createCSSPropertyDiagnostic(
  propertyName: string,
  span: {start: number; length: number},
  fileName: string,
): ts.Diagnostic | null {
  // Skip validation for CSS custom properties
  if (propertyName.startsWith('--')) {
    return null;
  }

  if (isValidCSSPropertyVSCode(propertyName)) {
    return null;
  }

  const suggestions = findSimilarCSSProperties(propertyName);
  let messageText = `Unknown CSS property '${propertyName}'.`;

  if (suggestions.length > 0) {
    messageText += ` Did you mean '${suggestions[0]}'?`;
    if (suggestions.length > 1) {
      messageText += ` Other suggestions: ${suggestions.slice(1).join(', ')}`;
    }
  }

  return {
    file: undefined, // Will be set by caller
    start: span.start,
    length: span.length,
    messageText,
    category: ts.DiagnosticCategory.Warning,
    code: 100001, // Custom Angular LS error code for CSS properties
    source: 'angular',
  };
}

/**
 * Provides quick info (hover information) for a CSS property in a style binding.
 *
 * @param propertyName The CSS property name.
 * @param hasUnit Whether the binding includes a unit suffix.
 * @returns Quick info display parts, or null if not applicable.
 */
export function getCSSPropertyQuickInfo(
  propertyName: string,
  hasUnit: boolean,
): ts.QuickInfo | null {
  if (!isValidCSSPropertyVSCode(propertyName)) {
    return null;
  }

  const analysis = analyzeStyleBinding(propertyName + (hasUnit ? '.px' : ''));
  const values = getCSSPropertyValuesVSCode(propertyName);

  const displayParts: ts.SymbolDisplayPart[] = [
    {kind: 'keyword', text: 'style'},
    {kind: 'punctuation', text: '.'},
    {kind: 'propertyName', text: propertyName},
  ];

  if (hasUnit) {
    displayParts.push({kind: 'punctuation', text: '.'}, {kind: 'keyword', text: 'unit'});
  }

  displayParts.push(
    {kind: 'punctuation', text: ': '},
    {kind: 'keyword', text: analysis.expectedType},
  );

  let documentation = `CSS property binding.\n\nExpected type: ${analysis.expectedType}`;

  if (values.length > 0) {
    documentation += `\n\nValid values: ${values.slice(0, 10).join(', ')}`;
    if (values.length > 10) {
      documentation += ` (and ${values.length - 10} more)`;
    }
  }

  return {
    kind: ts.ScriptElementKind.memberVariableElement,
    kindModifiers: '',
    textSpan: {start: 0, length: propertyName.length},
    displayParts,
    documentation: [{kind: 'text', text: documentation}],
  };
}

/**
 * Creates a code fix for an invalid CSS property name.
 *
 * @param propertyName The invalid property name.
 * @param span The span to replace.
 * @param fileName The file name.
 * @returns Array of code fix actions.
 */
export function getCSSPropertyCodeFixes(
  propertyName: string,
  span: {start: number; length: number},
  fileName: string,
): ts.CodeFixAction[] {
  if (propertyName.startsWith('--')) {
    return [];
  }

  const suggestions = findSimilarCSSProperties(propertyName);

  return suggestions.map((suggestion, index) => ({
    fixName: `cssPropertyFix_${index}`,
    description: `Change to '${suggestion}'`,
    changes: [
      {
        fileName,
        textChanges: [
          {
            span: {start: span.start, length: span.length},
            newText: suggestion,
          },
        ],
      },
    ],
  }));
}

/**
 * Re-export analyzeStyleBinding for use in other modules.
 */
export {analyzeStyleBinding, StyleBindingAnalysis};
