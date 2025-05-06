/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h} from 'preact';
import {MemberEntryRenderable} from '../entities/renderables.mjs';
import {ClassMember} from './class-member';

export function ClassMemberList(props: {members: MemberEntryRenderable[]}) {
  return (
    <div class="docs-reference-members">
      {props.members.map((member) => (
        <ClassMember member={member} />
      ))}
    </div>
  );
}
