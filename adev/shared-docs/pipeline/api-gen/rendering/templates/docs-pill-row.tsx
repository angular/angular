/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Fragment, h} from 'preact';
import {LinkEntryRenderable} from '../entities/renderables.mjs';

/** Component to render a function or method parameter reference doc fragment. */
export function DocsPillRow(props: {links: LinkEntryRenderable[]}) {
  if (props.links.length === 0) return <></>;

  return (
    <nav class="docs-pill-row">
      {props.links.map((link) => (
        <a class="docs-pill" href={link.url} title={link.title}>
          {link.label}
        </a>
      ))}
    </nav>
  );
}
