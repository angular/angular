/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AttributeMarker, SelectorFlags} from '@angular/compiler/src/core';
import {QueryFlags} from '@angular/compiler/src/render3/view/compiler';
import {i18nIcuMsg, i18nMsg, i18nMsgWithPostprocess, Placeholder, resetMessageIndex} from './i18n_helpers';

const EXPECTED_FILE_MACROS: [RegExp, (...args: string[]) => string][] = [
  [
    // E.g. `__i18nMsg__('message string', [ ['placeholder', 'pair'] ], { meta: 'properties'})`
    macroFn(/__i18nMsg__/, stringParam(), arrayParam(), objectParam()),
    (_match, message, placeholders, meta) =>
        i18nMsg(message, parsePlaceholders(placeholders), parseMetaProperties(meta)),
  ],
  [
    // E.g. `__i18nMsgWithPostprocess__('message', [ ['placeholder', 'pair'] ], { meta: 'props'})`
    macroFn(/__i18nMsgWithPostprocess__/, stringParam(), arrayParam(), objectParam(), arrayParam()),
    (_match, message, placeholders, meta, postProcessPlaceholders) => i18nMsgWithPostprocess(
        message, parsePlaceholders(placeholders), parseMetaProperties(meta),
        parsePlaceholders(postProcessPlaceholders)),
  ],
  [
    // E.g. `__i18nIcuMsg__('message string', [ ['placeholder', 'pair'] ])`
    macroFn(/__i18nIcuMsg__/, stringParam(), arrayParam()),
    (_match, message, placeholders) => i18nIcuMsg(message, parsePlaceholders(placeholders)),
  ],
  [
    // E.g. `__AttributeMarker.Bindings__`
    /__AttributeMarker\.([^_]+)__/g,
    (_match, member) => getAttributeMarker(member),
  ],

  // E.g. `__SelectorFlags.ELEMENT__`
  flagUnion(/__SelectorFlags\.([^_]+)__/, (_match, member) => getSelectorFlag(member)),

  // E.g. `__QueryFlags.ELEMENT__`
  flagUnion(/__QueryFlags\.([^_]+)__/, (_match, member) => getQueryFlag(member)),
];

/**
 * Replace any known macros in the expected content with the result of evaluating the macro.
 *
 * @param expectedContent The content to process.
 */
export function replaceMacros(expectedContent: string): string {
  resetMessageIndex();

  for (const [regex, replacer] of EXPECTED_FILE_MACROS) {
    expectedContent = expectedContent.replace(regex, replacer);
  }
  return expectedContent;
}

function parsePlaceholders(str: string): Placeholder[] {
  const placeholders = eval(`(${str})`);
  if (!Array.isArray(placeholders) ||
      !placeholders.every(
          p => Array.isArray(p) && p.length === 2 && typeof p[0] === 'string' &&
              typeof p[1] === 'string')) {
    throw new Error('Expected an array of Placeholder arrays (`[string, string]`) but got ' + str);
  }
  return placeholders;
}

function parseMetaProperties(str: string): Record<string, string> {
  const obj = eval(`(${str})`);
  if (typeof obj !== 'object') {
    throw new Error(`Expected an object of properties but got:\n\n${str}.`);
  }
  for (const key in obj) {
    if (typeof obj[key] !== 'string') {
      throw new Error(`Expected an object whose values are strings, but property ${key} has type ${
          typeof obj[key]}, when parsing:\n\n${str}`);
    }
  }
  return obj;
}

const AttributeMarkerMap: Record<string, AttributeMarker> = {
  NamespaceURI: AttributeMarker.NamespaceURI,
  Classes: AttributeMarker.Classes,
  Styles: AttributeMarker.Styles,
  Bindings: AttributeMarker.Bindings,
  Template: AttributeMarker.Template,
  ProjectAs: AttributeMarker.ProjectAs,
  I18n: AttributeMarker.I18n,
};

function getAttributeMarker(member: string): string {
  const marker = AttributeMarkerMap[member];
  if (typeof marker !== 'number') {
    throw new Error('Unknown AttributeMarker: ' + member);
  }
  return `${marker}`;
}

const SelectorFlagsMap: Record<string, SelectorFlags> = {
  NOT: SelectorFlags.NOT,
  ATTRIBUTE: SelectorFlags.ATTRIBUTE,
  ELEMENT: SelectorFlags.ELEMENT,
  CLASS: SelectorFlags.CLASS,
};

function getSelectorFlag(member: string): number {
  const marker = SelectorFlagsMap[member];
  if (typeof marker !== 'number') {
    throw new Error('Unknown SelectorFlag: ' + member);
  }
  return marker;
}

const QueryFlagsMap: Record<string, QueryFlags> = {
  none: QueryFlags.none,
  descendants: QueryFlags.descendants,
  isStatic: QueryFlags.isStatic,
  emitDistinctChangesOnly: QueryFlags.emitDistinctChangesOnly,
};

function getQueryFlag(member: string): number {
  const marker = QueryFlagsMap[member];
  if (typeof marker !== 'number') {
    throw new Error('Unknown SelectorFlag: ' + member);
  }
  return marker;
}

function stringParam() {
  return /'([^']*?[^\\])'/;
}
function arrayParam() {
  return /(\[.*?\])/;
}
function objectParam() {
  return /(\{[^}]*\})/;
}

function macroFn(fnName: RegExp, ...args: RegExp[]): RegExp {
  const ws = /[\s\r\n]*/.source;
  return new RegExp(
      ws + fnName.source + '\\(' + args.map(r => `${ws}${r.source}${ws}`).join(',') + '\\)' + ws,
      'g');
}

/**
 * Creates a macro to replace a union of flags with its numeric constant value.
 *
 * @param pattern The regex to match a single occurrence of the flag.
 * @param getFlagValue A function to extract the numeric flag value from the pattern.
 */
function flagUnion(pattern: RegExp, getFlagValue: (...match: string[]) => number):
    typeof EXPECTED_FILE_MACROS[number] {
  return [
    // Match at least one occurrence of the pattern, optionally followed by more occurrences
    // separated by a pipe.
    new RegExp(pattern.source + '(?:\s*\\\|\s*' + pattern.source + ')*', 'g'),
    (match: string) => {
      // Replace all matches with the union of the individually matched flags.
      return String(match.split('|')
                        .map(flag => getFlagValue(...flag.trim().match(pattern)!))
                        .reduce((accumulator, flagValue) => accumulator | flagValue, 0));
    },
  ];
}
