/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h, Fragment} from 'preact';
import {EnumEntryRenderable, MemberEntryRenderable} from '../entities/renderables';
import {HeaderApi} from './header-api';
import {TabDescription} from './tab-description';
import {TabApi} from './tab-api';
import {REFERENCE_MEMBERS, REFERENCE_MEMBERS_CONTAINER} from '../styling/css-classes';
import {ClassMember} from './class-member';

/** Component to render a enum API reference document. */
export function EnumReference(entry: EnumEntryRenderable) {
  return (
    <div class="api">
      <HeaderApi entry={entry} />
      <TabApi entry={entry} />
      <TabDescription entry={entry} />
      {
        entry.members.length > 0
          ? (
            <div class={REFERENCE_MEMBERS_CONTAINER}>
              <div class={REFERENCE_MEMBERS}>
                {entry.members.map((member: MemberEntryRenderable) => (<ClassMember member={member}/>))}
              </div>
            </div>
            )
          : (<></>)
      }
    </div>
  );
}
