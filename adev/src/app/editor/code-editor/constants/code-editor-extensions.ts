/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EditorState, Extension} from '@codemirror/state';

import {
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
  keymap,
  EditorView,
} from '@codemirror/view';
export {EditorView} from '@codemirror/view';
import {
  foldGutter,
  indentOnInput,
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
  foldKeymap,
  HighlightStyle,
} from '@codemirror/language';
import {history, defaultKeymap, historyKeymap, indentWithTab} from '@codemirror/commands';
import {highlightSelectionMatches, searchKeymap} from '@codemirror/search';
import {
  closeBrackets,
  autocompletion,
  closeBracketsKeymap,
  completionKeymap,
  startCompletion,
} from '@codemirror/autocomplete';
import {lintKeymap} from '@codemirror/lint';
import {SYNTAX_STYLES} from './syntax-styles';
import {CODE_EDITOR_THEME_STYLES} from './theme-styles';

export const CODE_EDITOR_EXTENSIONS: Extension[] = [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  foldGutter(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  highlightSelectionMatches(),

  syntaxHighlighting(defaultHighlightStyle, {fallback: true}),
  syntaxHighlighting(HighlightStyle.define(SYNTAX_STYLES)),
  EditorView.lineWrapping,

  EditorView.theme(
    CODE_EDITOR_THEME_STYLES,
    // TODO: get from global theme, reconfigure on change: https://discuss.codemirror.net/t/dynamic-light-mode-dark-mode-how/4709
    {dark: true},
  ),

  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap,
    indentWithTab,
    {
      key: 'Ctrl-.',
      run: startCompletion,
      mac: 'Mod-.',
    },
  ]),
];
