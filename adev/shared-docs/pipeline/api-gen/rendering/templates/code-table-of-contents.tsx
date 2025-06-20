/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h} from 'preact';
import {renderToString} from 'preact-render-to-string';
import {CodeLineGroup} from './code-line-group';
import {HasRenderableToc} from '../entities/traits.mjs';

export function CodeTableOfContents(props: {entry: HasRenderableToc}) {
  const html = `${props.entry.beforeCodeGroups}
  <code>
    ${Array.from(props.entry.codeLinesGroups)
      .map(([_, group]) => renderToString(<CodeLineGroup lines={group} />))
      .join('')}
  </code>
  ${props.entry.afterCodeGroups}`;

  return <div class="docs-code" dangerouslySetInnerHTML={{__html: html}}></div>;
}
