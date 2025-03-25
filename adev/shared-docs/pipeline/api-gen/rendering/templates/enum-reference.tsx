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
import {SectionDescription} from './section-description';
import {SectionApi} from './section-api';
import {API_REFERENCE_CONTAINER, REFERENCE_MEMBERS} from '../styling/css-classes';
import {ClassMember} from './class-member';

/** Component to render a enum API reference document. */
export function EnumReference(entry: EnumEntryRenderable) {
  return (
    <div className={API_REFERENCE_CONTAINER}>
      <HeaderApi entry={entry} />
      <SectionApi entry={entry} />
      {entry.members.length > 0 ? (
        <div class={REFERENCE_MEMBERS}>
          {entry.members.map((member: MemberEntryRenderable) => (
            <ClassMember member={member} />
          ))}
        </div>
      ) : (
        <></>
      )}
      <SectionDescription entry={entry} />
    </div>
  );
}
