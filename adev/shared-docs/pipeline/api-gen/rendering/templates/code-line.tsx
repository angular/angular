/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h} from 'preact';
import {CodeLineRenderable} from '../entities/renderables.mjs';

export function CodeLine(props: {line: CodeLineRenderable}) {
  const line = props.line;
  const className = `line ${line.isDeprecated ? `shiki-deprecated` : ''}`;

  // extracting the line that is wrapped by shiki's <span class="line">
  // The captured group is greedy to include all nested elements
  const pattern = /<span[^>]*\bclass=["']line["'][^>]*>(.*)<\/span>/s;
  const match = line.contents.match(pattern);

  // 
  let highlightedContent = match ? match[1] : line.contents;

  if (line.id) {
    return (
      <button
        aria-describedby="jump-msg"
        type="button"
        className={className}
        member-id={line.id}
        dangerouslySetInnerHTML={{__html: highlightedContent}}
      ></button>
    );
  } else {
    return <span class={className} dangerouslySetInnerHTML={{__html: highlightedContent}}></span>;
  }
}
