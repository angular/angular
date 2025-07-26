/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HtmlParser, ParseTreeResult, visitAll, RecursiveVisitor, Element} from '@angular/compiler';

export function migrateNgClassBindings(template: string): {
  replacementCount: number;
  migrated: string;
  changed: boolean;
} {
  const parsed = parseHtmlTemplate(template);
  if (!parsed.tree || !parsed.tree.rootNodes.length) {
    return {migrated: template, changed: false, replacementCount: 0};
  }

  const visitor = new NgClassCollector(template);
  visitAll(visitor, parsed.tree.rootNodes);

  let newTemplate = template;
  let changedOffset = 0;
  let replacementCount = 0;

  for (const {start, end, replacement} of visitor.replacements) {
    const currentLength = newTemplate.length;

    newTemplate = replaceTemplate(newTemplate, replacement, start, end, changedOffset);
    changedOffset += newTemplate.length - currentLength;
    replacementCount++;
  }

  return {migrated: newTemplate, changed: changedOffset !== 0, replacementCount};
}

function parseHtmlTemplate(template: string): {tree: ParseTreeResult | undefined; errors: any[]} {
  let parsed: ParseTreeResult;
  try {
    parsed = new HtmlParser().parse(template, '', {
      tokenizeExpansionForms: true,
      tokenizeBlocks: true,
      preserveLineEndings: true,
    });

    if (parsed.errors && parsed.errors.length > 0) {
      const errors = parsed.errors.map((e) => ({type: 'parse', error: e}));
      return {tree: undefined, errors};
    }
  } catch (e: any) {
    return {tree: undefined, errors: [{type: 'parse', error: e}]};
  }
  return {tree: parsed, errors: []};
}

function replaceTemplate(
  template: string,
  replaceValue: string,
  start: number,
  end: number,
  offset: number,
) {
  return template.slice(0, start + offset) + replaceValue + template.slice(end + offset);
}

/**
 * Visitor class that scans Angular templates and collects replacements
 * for [ngClass] bindings that use static object literals.
 *
 * Converts:
 *   <div [ngClass]="{foo: isFoo, bar: isBar}">
 * Into:
 *   <div [class.foo]="isFoo" [class.bar]="isBar">
 */
export class NgClassCollector extends RecursiveVisitor {
  // Stores the set of transformations to apply to the template
  readonly replacements: {start: number; end: number; replacement: string}[] = [];
  private originalTemplate: string;

  constructor(template: string) {
    super();
    this.originalTemplate = template;
  }

  override visitElement(element: Element, context: any) {
    for (const attr of element.attrs) {
      // Check for [ngClass] attribute with a bound expression
      if (attr.name === '[ngClass]' && attr.valueSpan) {
        // Extract the full text of the binding expression
        const expr = this.originalTemplate.slice(
          attr.valueSpan.start.offset,
          attr.valueSpan.end.offset,
        );

        // Attempt to statically parse the expression as an object literal
        const staticMatch = tryParseStaticObjectLiteral(expr);

        // Only continue if we got a valid, non-empty set of class conditions
        if (staticMatch && staticMatch.length > 0) {
          // Convert each key-value pair into an individual [class.className] binding
          const replacement = staticMatch
            .map(({key, value}) => `[class.${key}]="${value}"`)
            .join(' ');

          // Save the replacement operation for this attribute span
          this.replacements.push({
            start: attr.sourceSpan.start.offset,
            end: attr.sourceSpan.end.offset,
            replacement,
          });
        }
      }
    }

    // Continue traversing child elements
    return super.visitElement(element, context);
  }
}

/**
 * Attempts to parse a [ngClass] expression string that uses a static object literal.
 *
 * Example:
 *   Input:  "{ foo: isFoo, 'bar baz': condition }"
 *   Output: [
 *     { key: 'foo', value: 'isFoo' },
 *     { key: 'bar', value: 'condition' },
 *     { key: 'baz', value: 'condition' }
 *   ]
 *
 * Returns null if:
 *   - The expression isn't an object literal
 *   - Any entry is missing a key or value
 *   - The format is invalid
 */
function tryParseStaticObjectLiteral(expr: string): {key: string; value: string}[] | null {
  // Basic object literal regex: matches `{ key: value, ... }`
  const objectLiteralRegex = /^\s*\{\s*([^}]*)\s*\}\s*$/;
  const match = expr.match(objectLiteralRegex);
  if (!match) return null;

  const innerContent = match[1].trim();
  if (innerContent === '') return [];

  const props = innerContent
    .split(',')
    .map((pair) => pair.trim())
    .filter(Boolean);

  const result: {key: string; value: string}[] = [];

  for (const prop of props) {
    // Split on the first colon only
    const [keyRaw, ...valueParts] = prop.split(':');
    if (!keyRaw || valueParts.length === 0) return null;

    // Remove wrapping quotes from the key, if any
    const rawKey = keyRaw.trim().replace(/^['"]|['"]$/g, '');
    const value = valueParts.join(':').trim();

    if (!rawKey || !value) return null;

    // Split class names if key has multiple (e.g., 'foo bar')
    const classNames = rawKey.split(/\s+/).filter(Boolean);

    for (const className of classNames) {
      result.push({key: className, value});
    }
  }

  return result;
}
