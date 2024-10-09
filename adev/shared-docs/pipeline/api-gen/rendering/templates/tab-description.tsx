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
import {CodeSymbol} from './code-symbols';

const DESCRIPTION_TAB_NAME = 'Description';

/** Component to render the description tab. */
export function TabDescription(props: {entry: DocEntryRenderable}) {
  const exportedBy = props.entry.jsdocTags.filter((t) => t.name === 'ngModule');
  if (
    (!props.entry.htmlDescription ||
      props.entry.htmlDescription === props.entry.shortHtmlDescription) &&
    !exportedBy.length
  ) {
    return <></>;
  }

  return (
    <div data-tab={DESCRIPTION_TAB_NAME} data-tab-url={normalizeTabUrl(DESCRIPTION_TAB_NAME)}>
      <RawHtml value={props.entry.htmlDescription} />

      {exportedBy.length ? (
        <>
          <hr />
          <h2>Exported by</h2>

          <ul>
            {exportedBy.map((tag) => (
              <li>
                <CodeSymbol code={tag.comment} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
