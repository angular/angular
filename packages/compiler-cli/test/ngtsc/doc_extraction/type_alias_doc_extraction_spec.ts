/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DocEntry} from '@angular/compiler-cli/src/ngtsc/docs';
import {EntryType, TypeAliasEntry} from '@angular/compiler-cli/src/ngtsc/docs/src/entities';
import {runInEachFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '@angular/compiler-cli/src/ngtsc/testing';

import {NgtscTestEnvironment} from '../env';

const testFiles = loadStandardTestFiles({fakeCommon: true});

runInEachFileSystem(() => {
  let env!: NgtscTestEnvironment;

  describe('ngtsc type alias docs extraction', () => {
    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    it('should extract type aliases based on primitives', () => {
      env.write(
        'index.ts',
        `
        export type SuperNumber = number | string;
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const typeAliasEntry = docs[0] as TypeAliasEntry;
      expect(typeAliasEntry.name).toBe('SuperNumber');
      expect(typeAliasEntry.entryType).toBe(EntryType.TypeAlias);
      expect(typeAliasEntry.type).toBe('number | string');
    });

    it('should extract type aliases for objects', () => {
      env.write(
        'index.ts',
        `
        export type UserProfile = {
          name: string;
          age: number;
        };
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const typeAliasEntry = docs[0] as TypeAliasEntry;
      expect(typeAliasEntry.name).toBe('UserProfile');
      expect(typeAliasEntry.entryType).toBe(EntryType.TypeAlias);
      expect(typeAliasEntry.type).toBe(`{
          name: string;
          age: number;
        }`);
    });
  });
});
