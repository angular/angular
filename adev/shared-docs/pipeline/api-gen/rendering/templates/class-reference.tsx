/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Fragment, h} from 'preact';
import {PipeEntry} from '../entities.mjs';
import {ClassEntryRenderable, PipeEntryRenderable} from '../entities/renderables.mjs';
import {ClassMemberList} from './class-member-list';
import {HeaderApi} from './header-api';
import {
  API_REFERENCE_CONTAINER,
  REFERENCE_MEMBERS,
  SECTION_CONTAINER,
} from '../styling/css-classes.mjs';
import {SectionDescription} from './section-description';
import {SectionUsageNotes} from './section-usage-notes';
import {SectionApi} from './section-api';
import {SectionHeading} from './section-heading';
import {RawHtml} from './raw-html';
import {DeprecationWarning} from './deprecation-warning';
import {codeToHtml} from '../../../shared/shiki.mjs';
import {getHighlighterInstance} from '../shiki/shiki.mjs';

/** Component to render a class API reference document. */
export function ClassReference(entry: ClassEntryRenderable | PipeEntryRenderable) {
  return (
    <div className={API_REFERENCE_CONTAINER}>
      <HeaderApi entry={entry} />
      {entry.entryType === 'pipe' ? (
        <>
          <div className={SECTION_CONTAINER + ' docs-reference-api-section'}>
            <SectionHeading name="Pipe usage" />
            <RawHtml
              value={codeToHtml(
                getHighlighterInstance(),
                (entry as PipeEntry).usage,
                'angular-html',
              )}
            />
          </div>
        </>
      ) : (
        ''
      )}
      <DeprecationWarning entry={entry} />
      <SectionApi entry={entry} />
      {entry.members.length > 0 ? (
        <div class={REFERENCE_MEMBERS}>
          <ClassMemberList members={entry.members} />
        </div>
      ) : (
        <></>
      )}
      <SectionDescription entry={entry} />
      <SectionUsageNotes entry={entry} />
    </div>
  );
}
