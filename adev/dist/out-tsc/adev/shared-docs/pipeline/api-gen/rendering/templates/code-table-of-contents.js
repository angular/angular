/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {renderToString} from 'preact-render-to-string';
import {CodeLineGroup} from './code-line-group';
export function CodeTableOfContents(props) {
  let html;
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
  return <div class="docs-code" dangerouslySetInnerHTML={{__html: html}}></div>;
}
//# sourceMappingURL=code-table-of-contents.js.map
