/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Fragment, h} from 'preact';
import {DocEntryRenderable} from '../entities/renderables';
import {normalizeTabUrl} from '../transforms/url-transforms';
import {RawHtml} from './raw-html';

const USAGE_NOTES_TAB_NAME = 'Usage Notes';

/** Component to render the usage notes tab. */
export function TabUsageNotes(props: {entry: DocEntryRenderable}) {
  if (!props.entry.htmlUsageNotes) {
    return (<></>);
  }

  return (
    <div data-tab={USAGE_NOTES_TAB_NAME} data-tab-url={normalizeTabUrl(USAGE_NOTES_TAB_NAME)}>
      <RawHtml value={props.entry.htmlUsageNotes} />
    </div>
  );
}
