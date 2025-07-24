/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h} from 'preact';
import {CliCommandRenderable} from '../entities/renderables.mjs';
import {HEADER_CLASS_NAME, HEADER_ENTRY_CATEGORY, HEADER_ENTRY_LABEL, HEADER_ENTRY_TITLE} from '../styling/css-classes.mjs';

/** Component to render a header of the CLI page. */
export function HeaderCli(props: {command: CliCommandRenderable}) {
  const command = props.command;

  return (
    <header className={HEADER_CLASS_NAME}>
      <span className={HEADER_ENTRY_CATEGORY}>CLI</span>

      <div className={HEADER_ENTRY_TITLE}>
        <div>
          <h1>{command.parentCommand?.name} {command.name}</h1>
          <div className={`${HEADER_ENTRY_LABEL} type-command full`}>{'Command'}</div>
        </div>
      </div>
    </header>
  );
}
