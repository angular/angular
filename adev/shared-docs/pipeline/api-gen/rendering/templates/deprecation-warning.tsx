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
      <div className="docs-alert docs-alert-important docs-deprecation-warning">
        <div className="docs-deprecation-warning__body">
          <p>Deprecation warning</p>
          <DeprecatedLabel entry={entry} hideLabel={true} />
        </div>
        <img
          src="assets/images/angie/orthos-back.svg"
          className="docs-deprecation-angie"
          aria-hidden="true"
        />
      </div>
    )
  );
}
