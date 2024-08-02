/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {MemberEntry, MemberTags, MemberType} from '../entities';

import {isClassMethodEntry} from '../entities/categorization';
import {MemberEntryRenderable} from '../entities/renderables';
import {
  HasMembers,
  HasModuleName,
  HasRenderableMembers,
  HasRenderableMembersGroups,
} from '../entities/traits';

import {
  addHtmlDescription,
  addHtmlJsDocTagComments,
  addHtmlUsageNotes,
  setEntryFlags,
} from './jsdoc-transforms';
import {addModuleName} from './module-name';

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

/** Given an entity with members, gets the entity augmented with renderable members. */
export function addRenderableGroupMembers<T extends HasMembers & HasModuleName>(
  entry: T,
): T & HasRenderableMembersGroups {
  const members = filterLifecycleMethods(entry.members);

  const membersGroups = members.reduce((groups, item) => {
    const member = setEntryFlags(
      addMethodParamsDescription(
        addHtmlDescription(
          addHtmlUsageNotes(addHtmlJsDocTagComments(addModuleName(item, entry.moduleName))),
        ),
      ),
    );
    if (groups.has(member.name)) {
      const group = groups.get(member.name);
      group?.push(member);
    } else {
      groups.set(member.name, [member]);
    }
    return groups;
  }, new Map<string, MemberEntryRenderable[]>());

  return {
    ...entry,
    membersGroups,
  };
}

export function addRenderableMembers<T extends HasMembers & HasModuleName>(
  entry: T,
): T & HasRenderableMembers {
  const members = entry.members.map((member) =>
    setEntryFlags(
      addMethodParamsDescription(
        addHtmlDescription(
          addHtmlUsageNotes(addHtmlJsDocTagComments(addModuleName(member, entry.moduleName))),
        ),
      ),
    ),
  );

  return {
    ...entry,
    members,
  };
}

function addMethodParamsDescription<T extends MemberEntry & HasModuleName>(entry: T): T {
  if (isClassMethodEntry(entry)) {
    return {
      ...entry,
      params: entry.params.map((param) =>
        addHtmlDescription(addModuleName(param, entry.moduleName)),
      ),
    };
  }
  return entry;
}
