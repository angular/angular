/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {html} from '@codemirror/lang-html';
import {angular} from '@codemirror/lang-angular';
import {css} from '@codemirror/lang-css';
import {sass} from '@codemirror/lang-sass';
import {javascript} from '@codemirror/lang-javascript';
import {angularComponent} from '../utils/component-ts-syntax';
export const LANGUAGES = {
  'component.ts': angularComponent(),
  'main.ts': angularComponent(),
  html: angular({base: html()}),
  svg: html(),
  ts: javascript({typescript: true}),
  css: css(),
  sass: sass(),
  scss: sass(),
  json: javascript(),
};
//# sourceMappingURL=code-editor-languages.js.map
