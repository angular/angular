/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {PullApproveGroup} from './group';
import {getGroupsFromYaml} from './parse-yaml';

describe('group parsing', () => {
  it('gets group name', () => {
    const groupName = 'fw-migrations';
    const groups = getGroupsFromYaml(`
      groups:
        ${groupName}:
          type: optional
      `);
    expect(groups[0].groupName).toBe(groupName);
  });

  it('gets correct number of groups', () => {
    const groups = getGroupsFromYaml(`
      groups:
        fw-migrations:
          type: optional
        fw-core:
          type: optional
      `);
    expect(groups.length).toBe(2);
  });

  it('gets preceding groups', () => {
    const groups = getGroupsFromYaml(`
      groups:
        fw-migrations:
          type: optional
        fw-core:
          type: optional
        dev-infra:
          type: optional
      `);
    const fwMigrations = getGroupByName(groups, 'fw-migrations')!;
    const fwCore = getGroupByName(groups, 'fw-core')!;
    const devInfra = getGroupByName(groups, 'dev-infra')!;
    expect(getGroupNames(fwMigrations.precedingGroups)).toEqual([]);
    expect(getGroupNames(fwCore.precedingGroups)).toEqual([fwMigrations.groupName]);
    expect(getGroupNames(devInfra.precedingGroups)).toEqual([
      fwMigrations.groupName, fwCore.groupName
    ]);
  });

  it('matches file conditions', () => {
    const groups = getGroupsFromYaml(`
      groups:
        fw-core:
          conditions:
            - contains_any_globs(files, ['packages/core/**'])
      `);
    const fwCore = getGroupByName(groups, 'fw-core')!;
    expect(fwCore.testFile('packages/core/test.ts')).toBe(true);
    expect(fwCore.testFile('some/other/location/test.ts')).toBe(false);
  });

  it('allows conditions based on groups', () => {
    const groups = getGroupsFromYaml(`
      groups:
        fw-migrations:
          conditions:
            - len(groups) > 0
        fw-core:
          conditions:
            - len(groups.active) > 0
      `);
    const fwMigrations = getGroupByName(groups, 'fw-migrations')!;
    expect(() => fwMigrations.testFile('any')).not.toThrow();
    const fwCore = getGroupByName(groups, 'fw-core')!;
    expect(() => fwCore.testFile('any')).not.toThrow();
  });
});

function getGroupByName(groups: PullApproveGroup[], name: string): PullApproveGroup|undefined {
  return groups.find(g => g.groupName === name);
}

function getGroupNames(groups: PullApproveGroup[]) {
  return groups.map(g => g.groupName);
}
