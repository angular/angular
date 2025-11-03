/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h} from 'preact';
import {renderToString} from 'preact-render-to-string';
import {HasRenderableToc} from '../entities/traits.mjs';
import {CodeLineGroup} from './code-line-group';

export function CodeTableOfContents(props: {
  entry: HasRenderableToc;
  hideCopyButton?: boolean;
  embedded?: boolean;
}) {
  let html: string;
  // Prefer the formatted code if available
  if (props.entry.formattedCode) {
    html = props.entry.formattedCode;
  } else {
    html = `${props.entry.beforeCodeGroups}
    <code>
      ${Array.from(props.entry.codeLinesGroups)
        .map(([_, group]) => renderToString(<CodeLineGroup lines={group} />))
        .join('')}
    </code>
    ${props.entry.afterCodeGroups}`;
  }

  return (
    <div
      className={
        (props.hideCopyButton ? 'docs-no-copy' : '') +
        (props.embedded ? ' embedded' : '') +
        ' docs-code'
      }
      dangerouslySetInnerHTML={{__html: html}}
    ></div>
  );
}
