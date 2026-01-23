/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {core, QueryFlags} from '@angular/compiler';

import {
  i18nIcuMsg,
  i18nMsg,
  i18nMsgWithPostprocess,
  Options,
  Placeholder,
  resetMessageIndex,
} from './i18n_helpers';

const EXPECTED_FILE_MACROS: [RegExp, (...args: string[]) => string][] = [
  [
    // E.g. `__i18nMsg__('message string', [ ['placeholder', 'pair']
    // ], {original_code: {'placeholder': '{{ foo }}'}}, {meta: 'properties'})`
    macroFn(/__i18nMsg__/, stringParam(), arrayParam(), objectParam(), objectParam()),
    (_match, message, placeholders, options, meta) =>
      i18nMsg(
        message,
        parsePlaceholders(placeholders),
        parseOptions(options),
        parseMetaProperties(meta),
      ),
  ],
  [
    // E.g. `__i18nMsgWithPostprocess__('message', [ ['placeholder', 'pair'] ], { meta: 'props'})`
    macroFn(
      /__i18nMsgWithPostprocess__/,
      stringParam(),
      arrayParam(),
      objectParam(),
      objectParam(),
      arrayParam(),
    ),
    (_match, message, placeholders, options, meta, postProcessPlaceholders) =>
      i18nMsgWithPostprocess(
        message,
        parsePlaceholders(placeholders),
        parseOptions(options),
        parseMetaProperties(meta),
        parsePlaceholders(postProcessPlaceholders),
      ),
  ],
  [
    // E.g. `__i18nIcuMsg__('message string', [ ['placeholder', 'pair'] ])`
    macroFn(/__i18nIcuMsg__/, stringParam(), arrayParam(), objectParam()),
    (_match, message, placeholders, options) =>
      i18nIcuMsg(message, parsePlaceholders(placeholders), parseOptions(options)),
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
  if (
    !Array.isArray(placeholders) ||
    !placeholders.every(
      (p) =>
        Array.isArray(p) &&
        p.length >= 2 &&
        typeof p[0] === 'string' &&
        typeof p[1] === 'string' &&
        (p.length === 2 || typeof p[2] === 'string'),
    )
  ) {
    throw new Error(
      'Expected an array of Placeholder arrays (`[name: string, identifier: string, associatedId?: string]`) but got ' +
        str,
    );
  }
  return placeholders;
}

function parseOptions(str: string): Options {
  const inputObj = eval(`(${str})`) as unknown;
  if (typeof inputObj !== 'object') {
    throw new Error(`Expected an object of properties but got:\n\n${str}.`);
  }
  const obj = inputObj as Record<string, unknown>;

  // Verify the object does not have any unexpected properties, as this is likely a sign that it was
  // authored incorrectly.
  const unexpectedKeys = Object.keys(obj).filter((key) => key !== 'original_code');
  if (unexpectedKeys.length > 0) {
    throw new Error(
      `Expected an i18n options object with \`original_code\`, but got ${unexpectedKeys.join(
        ', ',
      )}`,
    );
  }

  // Validate `original_code`.
  const original = obj?.['original_code'];
  if (typeof original !== 'undefined' && typeof original !== 'object') {
    throw new Error(
      `Expected an i18n options object with \`original_code\`, as a nested object, but got ${JSON.stringify(
        obj,
        null,
        4,
      )}`,
    );
  }
  for (const [key, value] of Object.entries(original ?? {})) {
    if (typeof value !== 'string') {
      throw new Error(
        `Expected an object whose values are strings, but property ${key} has type ${typeof value}, when parsing:\n\n${str}`,
      );
    }
  }

  return obj;
}

function parseMetaProperties(str: string): Record<string, string> {
  const obj = eval(`(${str})`);
  if (typeof obj !== 'object') {
    throw new Error(`Expected an object of properties but got:\n\n${str}.`);
  }
  for (const key in obj) {
    if (typeof obj[key] !== 'string') {
      throw new Error(
        `Expected an object whose values are strings, but property ${key} has type ${typeof obj[
          key
        ]}, when parsing:\n\n${str}`,
      );
    }
  }
  return obj;
}

const AttributeMarkerMap: Record<string, core.AttributeMarker> = {
  NamespaceURI: core.AttributeMarker.NamespaceURI,
  Classes: core.AttributeMarker.Classes,
  Styles: core.AttributeMarker.Styles,
  Bindings: core.AttributeMarker.Bindings,
  Template: core.AttributeMarker.Template,
  ProjectAs: core.AttributeMarker.ProjectAs,
  I18n: core.AttributeMarker.I18n,
};

function getAttributeMarker(member: string): string {
  const marker = AttributeMarkerMap[member];
  if (typeof marker !== 'number') {
    throw new Error('Unknown AttributeMarker: ' + member);
  }
  return `${marker}`;
}

const SelectorFlagsMap: Record<string, core.SelectorFlags> = {
  NOT: core.SelectorFlags.NOT,
  ATTRIBUTE: core.SelectorFlags.ATTRIBUTE,
  ELEMENT: core.SelectorFlags.ELEMENT,
  CLASS: core.SelectorFlags.CLASS,
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
  // Matches a JavaScript object literal with up to 6 levels of indentation. Regular expressions
  // cannot use recursion so it is impossible to match an arbitrarily deep object. While it looks
  // complicated it is really just the same pattern nested inside itself n times:
  // (?:\{[^{}]*RECURSE_HERE\}[^{}]*)
  //
  // Each nested level uses (?:) for a non-matching group so the whole expression is the only match
  // and avoids generating multiple macro arguments for each nested level.
  return /(\{[^{}]*(?:\{[^{}]*(?:\{[^{}]*(?:\{[^{}]*(?:\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}[^{}]*)*\}[^{}]*)*\}[^{}]*)*\}[^{}]*)*\})/;
}

function macroFn(fnName: RegExp, ...args: RegExp[]): RegExp {
  const ws = /[\s\r\n]*/.source;
  return new RegExp(
    ws + fnName.source + '\\(' + args.map((r) => `${ws}${r.source}${ws}`).join(',') + '\\)' + ws,
    'g',
  );
}

/**
 * Creates a macro to replace a union of flags with its numeric constant value.
 *
 * @param pattern The regex to match a single occurrence of the flag.
 * @param getFlagValue A function to extract the numeric flag value from the pattern.
 */
function flagUnion(
  pattern: RegExp,
  getFlagValue: (...match: string[]) => number,
): (typeof EXPECTED_FILE_MACROS)[number] {
  return [
    // Match at least one occurrence of the pattern, optionally followed by more occurrences
    // separated by a pipe.
    new RegExp(pattern.source + '(?:s*\\|s*' + pattern.source + ')*', 'g'),
    (match: string) => {
      // Replace all matches with the union of the individually matched flags.
      return String(
        match
          .split('|')
          .map((flag) => getFlagValue(...flag.trim().match(pattern)!))
          .reduce((accumulator, flagValue) => accumulator | flagValue, 0),
      );
    },
  ];
}
