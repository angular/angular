/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Fragment, h} from 'preact';
import {ClassEntryRenderable, DecoratorEntryRenderable} from '../entities/renderables';
import {ClassMemberList} from './class-member-list';
import {HeaderApi} from './header-api';
import {API_REFERENCE_CONTAINER, REFERENCE_MEMBERS} from '../styling/css-classes';
import {SectionDescription} from './section-description';
import {SectionUsageNotes} from './section-usage-notes';
import {SectionApi} from './section-api';

/** Component to render a class API reference document. */
export function ClassReference(entry: ClassEntryRenderable | DecoratorEntryRenderable) {
  return (
    <div className={API_REFERENCE_CONTAINER}>
      <HeaderApi entry={entry} />
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
