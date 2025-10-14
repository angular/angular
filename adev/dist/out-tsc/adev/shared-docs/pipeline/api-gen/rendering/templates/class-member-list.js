/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ClassMember} from './class-member';
export function ClassMemberList(props) {
  return (
    <div class="docs-reference-members">
      {props.members.map((member) => (
        <ClassMember member={member} />
      ))}
    </div>
  );
}
//# sourceMappingURL=class-member-list.js.map
