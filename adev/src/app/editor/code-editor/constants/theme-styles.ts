/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export const CODE_EDITOR_THEME_STYLES = {
  '&': {
    position: 'relative',
    width: '100%',
    height: '100%',
    'background-color': 'var(--code-editor-background)',
    color: 'var(--code-editor-text-base-color)',
  },
  '.cm-gutters': {
    border: 'none',
  },
  '.cm-gutter': {
    'background-color': 'var(--code-editor-background)',
    color: 'var(--code-editor-code-base-color)',
  },
  '.cm-line.cm-activeLine': {
    'background-color': 'var(--code-editor-active-line-background)',
  },
  '.cm-activeLineGutter': {
    'background-color': 'var(--code-editor-active-line-background)',
  },
  '&.cm-focused .cm-selectionBackground': {
    'background-color': 'var(--code-editor-focused-selection-background) !important',
  },
  '.cm-selectionBackground': {
    'background-color': 'var(--code-editor-selection-background) !important',
  },
  '.cm-cursor': {
    'border-color': 'var(--code-editor-cursor-color)',
  },
  '.cm-tooltip': {
    color: 'var(--code-editor-tooltip-color)',
    border: 'var(--code-editor-tooltip-border)',
    'border-radius': 'var(--code-editor-tooltip-border-radius)',
    background: 'var(--code-editor-tooltip-background)',
    'overflow-y': 'scroll',
    'max-height': '70%',
    'max-width': '100%',
  },
  '.cm-tooltip.cm-tooltip-autocomplete > ul': {
    background: 'var(--code-editor-autocomplete-background)',
  },
  '.cm-tooltip .keyword': {
    color: 'var(--code-module-keyword)',
  },
  '.cm-tooltip .aliasName': {
    color: 'var(--code-variable-name)',
  },
  '.cm-tooltip .localName': {
    color: 'var(--code-variable-name)',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    background: 'var(--code-editor-autocomplete-item-background)',
    color: 'var(--code-editor-autocomplete-item-color)',
  },
  '.cm-tooltip-lint': {
    background: 'var(--code-editor-lint-tooltip-background)',
    color: 'var(--code-editor-lint-tooltip-color)',
  },
  '.cm-panels': {
    background: 'var(--code-editor-panels-background)',
    color: 'var(--code-editor-panels-color)',
  },
  '.cm-foldPlaceholder': {
    background: 'var(--code-editor-fold-placeholder-background)',
  },
};
