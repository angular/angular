/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {CodeTableOfContents} from './code-table-of-contents';
import {SECTION_CONTAINER} from '../styling/css-classes.mjs';
import {SectionHeading} from './section-heading';
const API_SECTION_NAME = 'API';
/** Component to render the API section. */
export function SectionApi(props) {
  return (
    <div className={SECTION_CONTAINER + ' docs-reference-api-section'}>
      <SectionHeading name={API_SECTION_NAME} />
      <CodeTableOfContents entry={props.entry} />
    </div>
  );
}
//# sourceMappingURL=section-api.js.map
