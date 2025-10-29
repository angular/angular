/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Fragment, h} from 'preact';
import {TypeAliasEntryRenderable} from '../entities/renderables.mjs';
import {HeaderApi} from './header-api';
import {SectionDescription} from './section-description';
import {SectionUsageNotes} from './section-usage-notes';
import {SectionApi} from './section-api';
import {API_REFERENCE_CONTAINER, REFERENCE_MEMBERS} from '../styling/css-classes.mjs';
import {DeprecationWarning} from './deprecation-warning';
import {ClassMemberList} from './class-member-list';

/** Component to render a type alias API reference document. */
export function TypeAliasReference(entry: TypeAliasEntryRenderable) {
  return (
    <div className={API_REFERENCE_CONTAINER}>
      <HeaderApi entry={entry} />
      <DeprecationWarning entry={entry} />
      <SectionApi entry={entry} />
      {entry.members && entry.members.length > 0 ? (
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
