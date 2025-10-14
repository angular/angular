/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {convertSectionNameToId} from '../transforms/reference-section-id.mjs';
import {SECTION_HEADING} from '../styling/css-classes.mjs';
/** Component to render the API section. */
export function SectionHeading(props) {
  const id = convertSectionNameToId(props.name);
  const label = 'Link to ' + props.name + ' section';
  return (
    <h2 id={id} class={SECTION_HEADING}>
      <a href={'#' + id} aria-label={label} tabIndex={-1}>
        {props.name}
      </a>
    </h2>
  );
}
//# sourceMappingURL=section-heading.js.map
