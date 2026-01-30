/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {
  ARIA_ATTRIBUTES,
  ARIA_ROLES,
  VALID_ARIA_ATTRIBUTES,
  VALID_ARIA_ROLES,
  getAriaAttributeDocumentation,
  getAriaAttributeValues,
  getAriaAttributeType,
  AriaAttributeDefinition,
} from './aria_data';

/**
 * Priority values for ARIA completions.
 * Lower numbers = higher priority in completion list.
 */
const enum AriaCompletionPriority {
  /** Exact prefix match (e.g., 'lab' matches 'aria-label') */
  PrefixMatch = '0',
  /** Substring match (e.g., 'des' matches 'aria-describedby') */
  SubstringMatch = '1',
  /** Other attributes */
  Default = '2',
}

/**
 * Configuration for ARIA completions.
 */
export interface AriaCompletionsConfig {
  /** Whether ARIA attribute completions are enabled. */
  enabled: boolean;
  /** Whether to show role completions. */
  includeRoles: boolean;
}

/**
 * Default configuration for ARIA completions.
 */
export const DEFAULT_ARIA_COMPLETIONS_CONFIG: AriaCompletionsConfig = {
  enabled: true,
  includeRoles: true,
};

/**
 * Generates TypeScript completion entries for ARIA attribute names.
 * This is used when the cursor is after `[attr.aria-` or `aria-` to provide attribute suggestions.
 *
 * @param prefix The typed prefix to filter completions (e.g., 'lab' for 'aria-label').
 *               Can include 'aria-' prefix or not.
 * @param config Optional configuration for completions.
 * @returns Array of TypeScript completion entries.
 */
export function getAriaAttributeCompletions(
  prefix: string = '',
  config: AriaCompletionsConfig = DEFAULT_ARIA_COMPLETIONS_CONFIG,
): ts.CompletionEntry[] {
  if (!config.enabled) {
    return [];
  }

  // Normalize prefix - remove 'aria-' prefix if present for matching
  let normalizedPrefix = prefix.toLowerCase();
  const hasAriaPrefix = normalizedPrefix.startsWith('aria-');
  if (hasAriaPrefix) {
    normalizedPrefix = normalizedPrefix.substring(5); // Remove 'aria-'
  }

  const entries: ts.CompletionEntry[] = [];

  for (const attrName of VALID_ARIA_ATTRIBUTES) {
    const attr = ARIA_ATTRIBUTES[attrName];
    if (!attr) continue;

    // Match against the part after 'aria-'
    const attrSuffix = attrName.substring(5).toLowerCase(); // Remove 'aria-' for matching
    const isExactPrefix = attrSuffix.startsWith(normalizedPrefix);
    const isSubstring = attrSuffix.includes(normalizedPrefix);

    if (normalizedPrefix && !isExactPrefix && !isSubstring) {
      continue;
    }

    const documentation = getAriaAttributeDocumentation(attrName);
    const typeInfo = getAriaTypeDescription(attr);

    entries.push({
      name: attrName,
      kind: ts.ScriptElementKind.memberVariableElement,
      kindModifiers: '',
      sortText: isExactPrefix
        ? AriaCompletionPriority.PrefixMatch
        : isSubstring
          ? AriaCompletionPriority.SubstringMatch
          : AriaCompletionPriority.Default,
      insertText: attrName,
      labelDetails: {
        description: `ARIA ${typeInfo}`,
      },
    });
  }

  return entries;
}

/**
 * Generates TypeScript completion entries for ARIA role values.
 * This is used when the cursor is in a `role="..."` attribute.
 *
 * @param prefix The typed prefix to filter completions (e.g., 'but' for 'button').
 * @param config Optional configuration for completions.
 * @returns Array of TypeScript completion entries.
 */
export function getAriaRoleCompletions(
  prefix: string = '',
  config: AriaCompletionsConfig = DEFAULT_ARIA_COMPLETIONS_CONFIG,
): ts.CompletionEntry[] {
  if (!config.enabled || !config.includeRoles) {
    return [];
  }

  const prefixLower = prefix.toLowerCase();
  const entries: ts.CompletionEntry[] = [];

  for (const role of VALID_ARIA_ROLES) {
    const roleLower = role.toLowerCase();
    const isExactPrefix = roleLower.startsWith(prefixLower);
    const isSubstring = roleLower.includes(prefixLower);

    if (prefixLower && !isExactPrefix && !isSubstring) {
      continue;
    }

    // Categorize the role for display
    const category = getRoleCategory(role);

    entries.push({
      name: role,
      kind: ts.ScriptElementKind.enumMemberElement,
      kindModifiers: '',
      sortText: isExactPrefix
        ? AriaCompletionPriority.PrefixMatch
        : isSubstring
          ? AriaCompletionPriority.SubstringMatch
          : AriaCompletionPriority.Default,
      insertText: role,
      labelDetails: {
        description: `ARIA role (${category})`,
      },
    });
  }

  return entries;
}

/**
 * Generates TypeScript completion entries for ARIA attribute values.
 * This is used when the cursor is in an ARIA attribute value (e.g., `aria-hidden="|"`).
 *
 * @param attrName The ARIA attribute name (e.g., 'aria-hidden').
 * @param prefix The typed prefix to filter completions.
 * @returns Array of TypeScript completion entries.
 */
export function getAriaValueCompletions(
  attrName: string,
  prefix: string = '',
): ts.CompletionEntry[] {
  const attr = ARIA_ATTRIBUTES[attrName];
  if (!attr) {
    return [];
  }

  const prefixLower = prefix.toLowerCase();
  const entries: ts.CompletionEntry[] = [];

  // Get possible values based on type
  let values: readonly (string | boolean)[] = [];

  switch (attr.type) {
    case 'boolean':
      values = ['true', 'false'];
      break;
    case 'tristate':
      values = ['true', 'false', 'mixed'];
      break;
    case 'token':
    case 'tokenlist':
      values = attr.values ?? [];
      break;
    default:
      // No completions for string, id, idlist, integer, number types
      return [];
  }

  for (const value of values) {
    const valueStr = String(value);
    const valueLower = valueStr.toLowerCase();
    const isExactPrefix = valueLower.startsWith(prefixLower);
    const isSubstring = valueLower.includes(prefixLower);

    if (prefixLower && !isExactPrefix && !isSubstring) {
      continue;
    }

    entries.push({
      name: valueStr,
      kind: ts.ScriptElementKind.string,
      kindModifiers: '',
      sortText: isExactPrefix
        ? AriaCompletionPriority.PrefixMatch
        : AriaCompletionPriority.SubstringMatch,
      insertText: valueStr,
    });
  }

  return entries;
}

/**
 * Get quick info/hover documentation for an ARIA attribute.
 *
 * @param attrName The ARIA attribute name (e.g., 'aria-label').
 * @returns Quick info with documentation, or undefined if not found.
 */
export function getAriaAttributeQuickInfo(attrName: string): ts.QuickInfo | undefined {
  const attr = ARIA_ATTRIBUTES[attrName];
  if (!attr) {
    return undefined;
  }

  const documentation = getAriaAttributeDocumentation(attrName);
  const typeInfo = getAriaTypeDescription(attr);
  const valuesInfo =
    attr.values && attr.values.length > 0 ? `\n\nAllowed values: ${attr.values.join(', ')}` : '';

  const displayParts: ts.SymbolDisplayPart[] = [
    {text: attrName, kind: 'aliasName'},
    {text: ': ', kind: 'punctuation'},
    {text: typeInfo, kind: 'keyword'},
  ];

  const documentationParts: ts.SymbolDisplayPart[] = [
    {text: documentation + valuesInfo, kind: 'text'},
  ];

  if (attr.reference) {
    documentationParts.push({text: '\n\n', kind: 'lineBreak'});
    documentationParts.push({text: `[WAI-ARIA Reference](${attr.reference})`, kind: 'text'});
  }

  return {
    kind: ts.ScriptElementKind.memberVariableElement,
    kindModifiers: '',
    textSpan: {start: 0, length: attrName.length},
    displayParts,
    documentation: documentationParts,
  };
}

/**
 * Get quick info/hover documentation for an ARIA role.
 *
 * @param role The ARIA role name (e.g., 'button').
 * @returns Quick info with documentation, or undefined if not found.
 */
export function getAriaRoleQuickInfo(role: string): ts.QuickInfo | undefined {
  if (!VALID_ARIA_ROLES.has(role)) {
    return undefined;
  }

  const category = getRoleCategory(role);

  const displayParts: ts.SymbolDisplayPart[] = [
    {text: 'role', kind: 'keyword'},
    {text: '=', kind: 'punctuation'},
    {text: `"${role}"`, kind: 'stringLiteral'},
  ];

  const documentationParts: ts.SymbolDisplayPart[] = [
    {text: `ARIA role: ${role}`, kind: 'text'},
    {text: '\n', kind: 'lineBreak'},
    {text: `Category: ${category}`, kind: 'text'},
  ];

  return {
    kind: ts.ScriptElementKind.enumMemberElement,
    kindModifiers: '',
    textSpan: {start: 0, length: role.length},
    displayParts,
    documentation: documentationParts,
  };
}

/**
 * Gets a human-readable type description for an ARIA attribute.
 */
function getAriaTypeDescription(attr: AriaAttributeDefinition): string {
  switch (attr.type) {
    case 'boolean':
      return 'boolean';
    case 'tristate':
      return 'true | false | mixed';
    case 'integer':
      return 'integer';
    case 'number':
      return 'number';
    case 'string':
      return 'string';
    case 'id':
      return 'ID reference';
    case 'idlist':
      return 'ID reference list';
    case 'token':
      return attr.values ? attr.values.join(' | ') : 'token';
    case 'tokenlist':
      return attr.values ? `(${attr.values.join(' | ')})*` : 'token list';
    default:
      return 'string';
  }
}

/**
 * Categorizes an ARIA role for display purposes.
 */
function getRoleCategory(role: string): string {
  // Widget roles
  const widgetRoles = new Set([
    'alert',
    'alertdialog',
    'button',
    'checkbox',
    'combobox',
    'dialog',
    'gridcell',
    'link',
    'listbox',
    'log',
    'marquee',
    'menu',
    'menubar',
    'menuitem',
    'menuitemcheckbox',
    'menuitemradio',
    'option',
    'progressbar',
    'radio',
    'radiogroup',
    'scrollbar',
    'searchbox',
    'slider',
    'spinbutton',
    'status',
    'switch',
    'tab',
    'tablist',
    'tabpanel',
    'textbox',
    'timer',
    'tooltip',
    'tree',
    'treegrid',
    'treeitem',
  ]);

  // Landmark roles
  const landmarkRoles = new Set([
    'banner',
    'complementary',
    'contentinfo',
    'form',
    'main',
    'navigation',
    'region',
    'search',
  ]);

  // Document structure roles
  const structureRoles = new Set([
    'application',
    'article',
    'blockquote',
    'caption',
    'cell',
    'code',
    'columnheader',
    'definition',
    'deletion',
    'directory',
    'document',
    'emphasis',
    'feed',
    'figure',
    'generic',
    'grid',
    'group',
    'heading',
    'img',
    'insertion',
    'list',
    'listitem',
    'math',
    'meter',
    'none',
    'note',
    'paragraph',
    'presentation',
    'row',
    'rowgroup',
    'rowheader',
    'separator',
    'strong',
    'subscript',
    'superscript',
    'table',
    'term',
    'time',
    'toolbar',
  ]);

  // DPUB roles
  if (role.startsWith('doc-')) {
    return 'DPUB-ARIA';
  }

  // Graphics roles
  if (role.startsWith('graphics-')) {
    return 'Graphics-ARIA';
  }

  if (widgetRoles.has(role)) {
    return 'widget';
  }
  if (landmarkRoles.has(role)) {
    return 'landmark';
  }
  if (structureRoles.has(role)) {
    return 'structure';
  }

  return 'role';
}
