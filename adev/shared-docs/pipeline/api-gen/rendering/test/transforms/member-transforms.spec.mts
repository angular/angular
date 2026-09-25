/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {mergeDuplicateMembers} from '../../transforms/member-transforms.mjs';

// The entity types live in a package this test cannot depend on, so describe just the shape the
// transforms read. The member type values match the `MemberType` enum.
type TestMember = {
  name: string;
  memberType: string;
  description: string;
  jsdocTags: unknown[];
  memberTags: unknown[];
  implementation?: {name: string; params: {name: string}[]};
  signatures?: {name: string; params: {name: string}[]}[];
};

function member(partial: Partial<TestMember> & {name: string; memberType: string}): TestMember {
  return {description: '', jsdocTags: [], memberTags: [], ...partial};
}

function method(name: string, parameterName: string): TestMember {
  return member({
    name,
    memberType: 'method',
    implementation: {name, params: [{name: parameterName}]},
    signatures: [],
  });
}

function transform(members: TestMember[]): TestMember[] {
  // The transforms are typed against the real entities, which this test approximates.
  return mergeDuplicateMembers(members as never) as unknown as TestMember[];
}

describe('member transforms', () => {
  describe('mergeDuplicateMembers', () => {
    it('should merge overloads of the same method into a single entry', () => {
      const merged = transform([method('inject', 'token'), method('inject', 'tokens')]);

      expect(merged.length).toBe(1);
      expect(merged[0].signatures?.length).toBe(2);
      expect(merged[0].signatures?.map((signature) => signature.params[0].name)).toEqual([
        'token',
        'tokens',
      ]);
    });

    it('should not repeat identical signatures', () => {
      const merged = transform([method('click', 'event'), method('click', 'event')]);

      expect(merged.length).toBe(1);
      expect(merged[0].signatures?.length).toBe(0);
    });

    it('should keep distinct members and their order', () => {
      const merged = transform([
        method('first', 'a'),
        member({name: 'second', memberType: 'property'}),
        method('third', 'b'),
      ]);

      expect(merged.map((entry) => entry.name)).toEqual(['first', 'second', 'third']);
    });
  });
});
