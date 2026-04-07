/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Fragment, h} from 'preact';
import {PARAM_KEYWORD_CLASS_NAME} from '../styling/css-classes.mjs';

export function DeprecatedLabel(props: {
  entry:
    | {deprecated: {version: string | undefined} | undefined}
    | {deprecationMessage: string | null};
  hideLabel?: true;
}) {
  const entry = props.entry;

  if ('deprecationMessage' in entry && entry.deprecationMessage !== null) {
    return (
      <div className={'docs-deprecation-message'}>
        {!props.hideLabel && (
          <span className={`${PARAM_KEYWORD_CLASS_NAME} docs-deprecated`}>@deprecated</span>
        )}
        <span dangerouslySetInnerHTML={{__html: entry.deprecationMessage}}></span>
      </div>
    );
  } else if ('isDeprecated' in entry && entry.isDeprecated) {
    return <span className={`${PARAM_KEYWORD_CLASS_NAME} docs-deprecated`}>@deprecated</span>;
  }

  return <></>;
}
