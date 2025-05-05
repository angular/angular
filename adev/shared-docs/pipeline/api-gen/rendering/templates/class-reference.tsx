/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Fragment, h} from 'preact';
import {PipeEntry} from '../entities';
import {
  ClassEntryRenderable,
  DecoratorEntryRenderable,
  PipeEntryRenderable,
} from '../entities/renderables';
import {codeToHtml} from '../shiki/shiki';
import {
  API_REFERENCE_CONTAINER,
  REFERENCE_MEMBERS,
  SECTION_CONTAINER,
} from '../styling/css-classes';
import {ClassMemberList} from './class-member-list';
import {HeaderApi} from './header-api';
import {RawHtml} from './raw-html';
import {SectionApi} from './section-api';
import {SectionDescription} from './section-description';
import {SectionHeading} from './section-heading';
import {SectionUsageNotes} from './section-usage-notes';

/** Component to render a class API reference document. */
export function ClassReference(
  entry: ClassEntryRenderable | DecoratorEntryRenderable | PipeEntryRenderable,
) {
  return (
    <div className={API_REFERENCE_CONTAINER}>
      <HeaderApi entry={entry} />
      {entry.entryType === 'pipe' ? (
        <>
          <div className={SECTION_CONTAINER + ' docs-reference-api-section'}>
            <SectionHeading name="Pipe usage" />
            <RawHtml value={codeToHtml((entry as PipeEntry).usage, 'angular-html')} />
          </div>
        </>
      ) : (
        ''
      )}
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
