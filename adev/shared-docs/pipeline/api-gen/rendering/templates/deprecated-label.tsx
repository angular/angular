/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Fragment, h} from 'preact';
import {PARAM_KEYWORD_CLASS_NAME} from '../styling/css-classes.mjs';
import {DeprecationInfo} from '../entities/renderables.mjs';

export function DeprecatedLabel(props: {entry: DeprecationInfo | undefined}) {
  const entry = props.entry;

  if (entry?.htmlMessage) {
    return (
      <div className={'docs-deprecation-message'}>
        <span className={`${PARAM_KEYWORD_CLASS_NAME} docs-deprecated`}>@deprecated</span>
        <span dangerouslySetInnerHTML={{__html: entry.htmlMessage}}></span>
      </div>
    );
  } else if (entry) {
    return <span className={`${PARAM_KEYWORD_CLASS_NAME} docs-deprecated`}>@deprecated</span>;
  }

  return <></>;
}
