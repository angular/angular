/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h} from 'preact';
import {DeprecatedLabel} from './deprecated-label';

export function DeprecationWarning(props: {
  entry:
    | {deprecated: {version: string | undefined} | undefined}
    | {deprecationMessage: string | null};
}) {
  const entry = props.entry;
  return (
    'deprecationMessage' in entry &&
    entry.deprecationMessage && (
      <div class="docs-alert docs-alert-important">
        <p>Deprecation warning</p>
        <DeprecatedLabel entry={entry} hideLabel={true} />
      </div>
    )
  );
}
