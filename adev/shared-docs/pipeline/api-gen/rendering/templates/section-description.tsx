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
import {CodeSymbol} from './code-symbols';
import {SECTION_CONTAINER} from '../styling/css-classes.mjs';
import {SectionHeading} from './section-heading';

const DESCRIPTION_SECTION_NAME = 'Description';

/** Component to render the description section. */
export function SectionDescription(props: {entry: DocEntryRenderable}) {
  const exportedBy = props.entry.jsdocTags.filter((t) => t.name === 'ngModule');
  if (
    (!props.entry.htmlDescription ||
      props.entry.htmlDescription === props.entry.shortHtmlDescription) &&
    !exportedBy.length
  ) {
    return <></>;
  }

  return (
    <div className={SECTION_CONTAINER}>
      <SectionHeading name={DESCRIPTION_SECTION_NAME} />
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
