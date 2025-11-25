/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SIGNAL} from './graph';

// Only a subset of HTML tags are allowed in the custom formatter JsonML format.
// See https://firefox-source-docs.mozilla.org/devtools-user/custom_formatters/index.html#html-template-format
type AllowedTags = 'span' | 'div' | 'ol' | 'ul' | 'li' | 'table' | 'tr' | 'td';

type JsonMLText = string;
type JsonMLAttrs = Record<string, string>;
type JsonMLElement =
  | [tagName: AllowedTags, ...children: (JsonMLNode | JsonMLChild)[]]
  | [tagName: AllowedTags, attrs: JsonMLAttrs, ...children: (JsonMLNode | JsonMLChild)[]];
type JsonMLNode = JsonMLText | JsonMLElement;
type JsonMLChild = ['object', {object: unknown; config?: unknown}];
type JsonML = JsonMLNode;

type FormatterConfig = unknown & {ngSkipFormatting?: boolean};

declare global {
  // We need to use `var` here to be able to declare a global variable.
  // `let` and `const` will be locally scoped to the file.
  // tslint:disable-next-line:no-unused-variable
  var devtoolsFormatters: any[];
}

/**
 * A custom formatter which renders signals in an easy-to-read format.
 *
 * @see https://firefox-source-docs.mozilla.org/devtools-user/custom_formatters/index.html
 */

const formatter = {
  /**
   *  If the function returns `null`, the formatter is not used for this reference
   */
  header: (sig: any, config: FormatterConfig): JsonML | null => {
    if (!isSignal(sig) || config?.ngSkipFormatting) return null;

    let value: unknown;
    try {
      value = sig();
    } catch (e: any) {
      // In case the signal throws, we don't want to break the formatting.
      return ['span', `Signal(⚠️ Error)${e.message ? `: ${e.message}` : ''}`];
    }

    const kind = 'computation' in (sig[SIGNAL] as any) ? 'Computed' : 'Signal';

    const isPrimitive = value === null || (!Array.isArray(value) && typeof value !== 'object');

    return [
      'span',
      {},
      ['span', {}, `${kind}(`],
      (() => {
        if (isSignal(value)) {
          // Recursively call formatter. Could return an `object` to call the formatter through DevTools,
          // but then recursive signals will render multiple expando arrows which is an awkward UX.
          return formatter.header(value, config)!;
        } else if (isPrimitive && value !== undefined && typeof value !== 'function') {
          // Use built-in rendering for primitives which applies standard syntax highlighting / theming.
          // Can't do this for `undefined` however, as the browser thinks we forgot to provide an object.
          // Also don't want to do this for functions which render nested expando arrows.
          return ['object', {object: value}];
        } else {
          return prettifyPreview(value as Record<string | number | symbol, unknown>);
        }
      })(),
      ['span', {}, `)`],
    ];
  },

  hasBody: (sig: any, config: FormatterConfig) => {
    if (!isSignal(sig)) return false;

    try {
      sig();
    } catch {
      return false;
    }
    return !config?.ngSkipFormatting;
  },

  body: (sig: any, config: any): JsonML => {
    // We can use sys colors to fit the current DevTools theme.
    // Those are unfortunately only available on Chromium-based browsers.
    // On Firefow we fall back to the default color
    const color = 'var(--sys-color-primary)';

    return [
      'div',
      {style: `background: #FFFFFF10; padding-left: 4px; padding-top: 2px; padding-bottom: 2px;`},
      ['div', {style: `color: ${color}`}, 'Signal value: '],
      ['div', {style: `padding-left: .5rem;`}, ['object', {object: sig(), config}]],
      ['div', {style: `color: ${color}`}, 'Signal function: '],
      [
        'div',
        {style: `padding-left: .5rem;`},
        ['object', {object: sig, config: {...config, ngSkipFormatting: true}}],
      ],
    ];
  },
};

function prettifyPreview(
  value: Record<string | number | symbol, unknown> | Array<unknown> | undefined,
): string | JsonMLChild {
  if (value === null) return 'null';
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (value instanceof Element) return `<${value.tagName.toLowerCase()}>`;
  if (value instanceof URL) return `URL`;

  switch (typeof value) {
    case 'undefined': {
      return 'undefined';
    }
    case 'function': {
      if ('prototype' in value) {
        // This is what Chrome renders, can't use `object` though because it creates a nested expando arrow.
        return 'class';
      } else {
        return '() => {…}';
      }
    }
    case 'object': {
      if (value.constructor.name === 'Object') {
        return '{…}';
      } else {
        return `${value.constructor.name} {}`;
      }
    }
    default: {
      return ['object', {object: value, config: {ngSkipFormatting: true}}];
    }
  }
}

function isSignal(value: any): boolean {
  return value[SIGNAL] !== undefined;
}

/**
 * Installs the custom formatter into custom formatting on Signals in the devtools.
 *
 * Supported by both Chrome and Firefox.
 *
 * @see https://firefox-source-docs.mozilla.org/devtools-user/custom_formatters/index.html
 */
export function installDevToolsSignalFormatter() {
  globalThis.devtoolsFormatters ??= [];
  if (!globalThis.devtoolsFormatters.some((f: any) => f === formatter)) {
    globalThis.devtoolsFormatters.push(formatter);
  }
}
