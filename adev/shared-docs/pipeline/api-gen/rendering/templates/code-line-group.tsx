/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h} from 'preact';
import {CodeLineRenderable} from '../entities/renderables.mjs';
import {CodeLine} from './code-line';

export function CodeLineGroup(props: {lines: CodeLineRenderable[]}) {
  if (props.lines.length > 1) {
    return (<div class="shiki-ln-group">
        {
          props.lines.map(line =>
            <CodeLine line={line} />
          )
        }
      </div>);
  } else {
    return <CodeLine line={props.lines[0]} />;
  }
}
