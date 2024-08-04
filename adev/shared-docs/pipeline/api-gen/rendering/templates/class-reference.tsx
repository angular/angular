/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Fragment, h} from 'preact';
import {ClassEntryRenderable} from '../entities/renderables';
import {ClassMemberList} from './class-member-list';
import {HeaderApi} from './header-api';
import {REFERENCE_MEMBERS_CONTAINER} from '../styling/css-classes';
import {TabDescription} from './tab-description';
import {TabUsageNotes} from './tab-usage-notes';
import {TabApi} from './tab-api';

/** Component to render a class API reference document. */
export function ClassReference(entry: ClassEntryRenderable) {
  return (
    <div class="api">
      <HeaderApi entry={entry} />
      <TabApi entry={entry} />
      <TabDescription entry={entry} />
      <TabUsageNotes entry={entry} />
      {
        entry.members.length > 0
          ? (<div class={REFERENCE_MEMBERS_CONTAINER}>
              <ClassMemberList members={entry.members} />
            </div>)
          : (<></>)
      }
    </div>
  );
}
