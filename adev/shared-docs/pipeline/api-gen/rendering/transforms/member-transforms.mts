/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {MemberEntry, MemberTags, MemberType} from '../entities.mjs';
import {isHiddenEntry} from '../entities/categorization.mjs';

import {HasMembers, HasModuleName, HasRenderableMembers, HasRepo} from '../entities/traits.mjs';

import {
  addHtmlDescription,
  addHtmlJsDocTagComments,
  addHtmlUsageNotes,
  setEntryFlags,
} from './jsdoc-transforms.mjs';
import {addModuleName} from './module-name.mjs';
import {addRepo} from './repo.mjs';

const lifecycleMethods = [
  'ngAfterContentChecked',
  'ngAfterContentChecked',
  'ngAfterContentInit',
  'ngAfterViewChecked',
  'ngAfterViewChecked',
  'ngAfterViewInit',
  'ngDoCheck',
  'ngDoCheck',
  'ngOnChanges',
  'ngOnDestroy',
  'ngOnInit',
];

/** Gets a list of members with Angular lifecycle methods removed. */
export function filterLifecycleMethods(members: MemberEntry[]): MemberEntry[] {
  return members.filter((m) => !lifecycleMethods.includes(m.name));
}

/** Merges getter and setter entries with the same name into a single entry. */
export function mergeGettersAndSetters(members: MemberEntry[]): MemberEntry[] {
  const getters = new Set<string>();
  const setters = new Set<string>();

  // Note all getter and setter names for the class.
  for (const member of members) {
    if (member.memberType === MemberType.Getter) getters.add(member.name);
    if (member.memberType === MemberType.Setter) setters.add(member.name);
  }

  // Mark getter-only members as `readonly`.
  for (const member of members) {
    if (member.memberType === MemberType.Getter && !setters.has(member.name)) {
      member.memberType = MemberType.Property;
      member.memberTags.push(MemberTags.Readonly);
    }
  }

  // Filter out setters that have a corresponding getter.
  return members.filter(
    (member) => member.memberType !== MemberType.Setter || !getters.has(member.name),
  );
}

export function addRenderableMembers<T extends HasMembers & HasModuleName & HasRepo>(
  entry: T,
): T & HasRenderableMembers {
  const members = entry.members
    .filter((member) => !isHiddenEntry(member))
    .map((member) =>
      setEntryFlags(
        addHtmlDescription(
          addHtmlUsageNotes(
            addHtmlJsDocTagComments(addRepo(addModuleName(member, entry.moduleName), entry.repo)),
          ),
        ),
      ),
    );

  return {
    ...entry,
    members,
  };
}
