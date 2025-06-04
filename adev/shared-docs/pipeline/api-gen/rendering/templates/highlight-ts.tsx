/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h} from 'preact';
import {RawHtml} from './raw-html';
import {codeToHtml} from '../shiki/shiki.mjs';

/** Component to render a header of the CLI page. */
export function HighlightTypeScript(props: {code: string}) {
  const result = codeToHtml(props.code, 'typescript');
  const withScrollTrack = result.replace(/^(<pre class="shiki)/, '$1 docs-mini-scroll-track');

  return <RawHtml value={withScrollTrack} className="docs-code" />;
}
