/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getDefaultHTMLDataProvider} from 'vscode-html-languageservice';

/**
 * Interface for HTML attribute information returned by hover/completions.
 */
export interface HtmlAttributeInfo {
  name: string;
  description: string;
  /** Reference URL (e.g., MDN) */
  reference?: string;
  /** Value set name for completions (e.g., 'b' for boolean) */
  valueSet?: string;
  /** Browser support info */
  browsers?: string[];
}

/**
 * Interface for HTML tag information.
 */
export interface HtmlTagInfo {
  name: string;
  description: string;
  /** Reference URL (e.g., MDN) */
  reference?: string;
  /** Tag-specific attributes */
  attributes?: HtmlAttributeInfo[];
}

/**
 * Interface for attribute value information.
 */
export interface HtmlAttributeValueInfo {
  name: string;
  description?: string;
}

// Singleton data provider - same as VS Code uses
const htmlDataProvider = getDefaultHTMLDataProvider();

// Cache for attribute lookups
const attributeCache = new Map<string, HtmlAttributeInfo | undefined>();
const tagCache = new Map<string, HtmlTagInfo | undefined>();
const valueCache = new Map<string, HtmlAttributeValueInfo[]>();

/**
 * Get information about an HTML attribute.
 * Works for global attributes (aria-*, class, id, tabindex, etc.)
 * and element-specific attributes (input type, button disabled, etc.).
 *
 * @param attributeName The attribute name (e.g., 'tabindex', 'aria-label', 'type')
 * @param tagName Optional element tag name for element-specific attributes
 * @returns Attribute information or undefined if not found
 */
export function getHtmlAttributeInfo(
  attributeName: string,
  tagName: string = 'div',
): HtmlAttributeInfo | undefined {
  const cacheKey = `${tagName}:${attributeName}`;

  if (attributeCache.has(cacheKey)) {
    return attributeCache.get(cacheKey);
  }

  const attributes = htmlDataProvider.provideAttributes(tagName);
  const attr = attributes.find((a) => a.name === attributeName);

  if (!attr) {
    attributeCache.set(cacheKey, undefined);
    return undefined;
  }

  const result: HtmlAttributeInfo = {
    name: attr.name,
    description: getDescriptionText(attr.description),
    valueSet: attr.valueSet,
  };

  // Extract reference URL if available
  if (attr.references && attr.references.length > 0) {
    result.reference = attr.references[0].url;
  }

  attributeCache.set(cacheKey, result);
  return result;
}

/**
 * Get information about an HTML tag.
 *
 * @param tagName The tag name (e.g., 'button', 'input', 'div')
 * @returns Tag information or undefined if not found
 */
export function getHtmlTagInfo(tagName: string): HtmlTagInfo | undefined {
  if (tagCache.has(tagName)) {
    return tagCache.get(tagName);
  }

  const tags = htmlDataProvider.provideTags();
  const tag = tags.find((t) => t.name === tagName);

  if (!tag) {
    tagCache.set(tagName, undefined);
    return undefined;
  }

  const result: HtmlTagInfo = {
    name: tag.name,
    description: getDescriptionText(tag.description),
  };

  // Extract reference URL if available
  if (tag.references && tag.references.length > 0) {
    result.reference = tag.references[0].url;
  }

  tagCache.set(tagName, result);
  return result;
}

/**
 * Get valid values for an HTML attribute.
 * Useful for completions (e.g., input type values).
 *
 * @param tagName The element tag name
 * @param attributeName The attribute name
 * @returns Array of valid values or empty array if none/unknown
 */
export function getHtmlAttributeValues(
  tagName: string,
  attributeName: string,
): HtmlAttributeValueInfo[] {
  const cacheKey = `${tagName}:${attributeName}`;

  if (valueCache.has(cacheKey)) {
    return valueCache.get(cacheKey)!;
  }

  const values = htmlDataProvider.provideValues(tagName, attributeName);
  const result: HtmlAttributeValueInfo[] = values.map((v) => ({
    name: v.name,
    description: getDescriptionText(v.description),
  }));

  valueCache.set(cacheKey, result);
  return result;
}

/**
 * Check if an attribute is a valid global HTML attribute.
 * Global attributes can be used on any element.
 *
 * @param attributeName The attribute name
 * @returns true if it's a valid global attribute
 */
export function isValidHtmlGlobalAttribute(attributeName: string): boolean {
  const info = getHtmlAttributeInfo(attributeName, 'div');
  return info !== undefined;
}

/**
 * Check if an attribute is valid for a specific element.
 *
 * @param attributeName The attribute name
 * @param tagName The element tag name
 * @returns true if the attribute is valid for the element
 */
export function isValidHtmlAttribute(attributeName: string, tagName: string): boolean {
  const info = getHtmlAttributeInfo(attributeName, tagName);
  return info !== undefined;
}

/**
 * Get all global HTML attributes.
 * This includes ARIA attributes, event handlers, and standard global attributes.
 *
 * @returns Array of all global attributes
 */
export function getAllGlobalAttributes(): HtmlAttributeInfo[] {
  const attributes = htmlDataProvider.provideAttributes('div');
  return attributes.map((attr) => ({
    name: attr.name,
    description: getDescriptionText(attr.description),
    valueSet: attr.valueSet,
    reference: attr.references && attr.references.length > 0 ? attr.references[0].url : undefined,
  }));
}

/**
 * Get all HTML tags.
 *
 * @returns Array of all HTML tags
 */
export function getAllHtmlTags(): HtmlTagInfo[] {
  const tags = htmlDataProvider.provideTags();
  return tags.map((tag) => ({
    name: tag.name,
    description: getDescriptionText(tag.description),
    reference: tag.references && tag.references.length > 0 ? tag.references[0].url : undefined,
  }));
}

/**
 * Extract text from a description that may be string or MarkupContent.
 */
function getDescriptionText(description: unknown): string {
  if (!description) {
    return '';
  }
  if (typeof description === 'string') {
    return description;
  }
  if (typeof description === 'object' && 'value' in description) {
    return (description as {value: string}).value;
  }
  return '';
}

/**
 * Convert a DOM property name to its HTML attribute equivalent.
 * E.g., 'tabIndex' -> 'tabindex', 'className' -> 'class'
 *
 * Note: This uses the compiler's _PROP_TO_ATTR mapping logic.
 */
export function domPropertyToHtmlAttribute(propertyName: string): string {
  // Common property -> attribute mappings
  const propToAttr: Record<string, string> = {
    className: 'class',
    htmlFor: 'for',
    formAction: 'formaction',
    innerHTML: 'innerHtml',
    readOnly: 'readonly',
    tabIndex: 'tabindex',
    // ARIA properties follow pattern: ariaFoo -> aria-foo
  };

  if (propToAttr[propertyName]) {
    return propToAttr[propertyName];
  }

  // Handle ARIA properties: ariaLabel -> aria-label
  if (propertyName.startsWith('aria') && propertyName.length > 4) {
    const ariaRest = propertyName.slice(4);
    return 'aria-' + ariaRest.toLowerCase();
  }

  // Default: convert camelCase to kebab-case
  return propertyName.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Convert an HTML attribute name to its DOM property equivalent.
 * E.g., 'tabindex' -> 'tabIndex', 'class' -> 'className'
 */
export function htmlAttributeToDomProperty(attributeName: string): string {
  // Common attribute -> property mappings
  const attrToProp: Record<string, string> = {
    class: 'className',
    for: 'htmlFor',
    formaction: 'formAction',
    innerhtml: 'innerHTML',
    readonly: 'readOnly',
    tabindex: 'tabIndex',
  };

  const lower = attributeName.toLowerCase();
  if (attrToProp[lower]) {
    return attrToProp[lower];
  }

  // Handle aria-* attributes: aria-label -> ariaLabel
  if (lower.startsWith('aria-')) {
    const ariaRest = lower.slice(5);
    return 'aria' + ariaRest.charAt(0).toUpperCase() + ariaRest.slice(1);
  }

  // Default: return as-is (most attributes === properties in lowercase)
  return attributeName;
}
