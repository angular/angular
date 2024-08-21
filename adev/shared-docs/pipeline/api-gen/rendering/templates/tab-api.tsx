/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h} from 'preact';
import {DocEntryRenderable} from '../entities/renderables';
import {HasRenderableToc} from '../entities/traits';
import {normalizeTabUrl} from '../transforms/url-transforms';
import {CodeTableOfContents} from './code-table-of-contents';

const API_TAB_NAME = 'API';

/** Component to render the API tab. */
export function TabApi(props: {entry: DocEntryRenderable & HasRenderableToc}) {
  return (
    <div data-tab={API_TAB_NAME} data-tab-url={normalizeTabUrl(API_TAB_NAME)}>
      <div class={'docs-reference-api-tab'}>
        <CodeTableOfContents entry={props.entry} />
      </div>
    </div>
  );
}
