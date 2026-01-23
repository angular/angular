/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Fragment, h} from 'preact';
import {DocEntryRenderable} from '../entities/renderables.mjs';
import {RawHtml} from './raw-html';
import {SECTION_CONTAINER} from '../styling/css-classes.mjs';
import {SectionHeading} from './section-heading';

const USAGE_NOTES_SECTION_NAME = 'Usage Notes';

/** Component to render the usage notes section. */
export function SectionUsageNotes(props: {entry: DocEntryRenderable}) {
  if (!props.entry.htmlUsageNotes) {
    return <></>;
  }

  return (
    <div className={SECTION_CONTAINER}>
      <SectionHeading name={USAGE_NOTES_SECTION_NAME} />
      <RawHtml value={props.entry.htmlUsageNotes} />
    </div>
  );
}
