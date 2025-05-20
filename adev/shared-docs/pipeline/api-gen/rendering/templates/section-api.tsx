/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h} from 'preact';
import {DocEntryRenderable} from '../entities/renderables.mjs';
import {HasRenderableToc} from '../entities/traits.mjs';
import {CodeTableOfContents} from './code-table-of-contents';
import {SECTION_CONTAINER} from '../styling/css-classes.mjs';
import {SectionHeading} from './section-heading';

const API_SECTION_NAME = 'API';

/** Component to render the API section. */
export function SectionApi(props: {entry: DocEntryRenderable & HasRenderableToc}) {
  return (
    <div className={SECTION_CONTAINER + ' docs-reference-api-section'}>
      <SectionHeading name={API_SECTION_NAME} />
      <CodeTableOfContents entry={props.entry} />
    </div>
  );
}
