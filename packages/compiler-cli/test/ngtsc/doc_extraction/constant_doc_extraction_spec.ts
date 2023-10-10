/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DocEntry} from '@angular/compiler-cli/src/ngtsc/docs';
import {ConstantEntry, EntryType} from '@angular/compiler-cli/src/ngtsc/docs/src/entities';
import {runInEachFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '@angular/compiler-cli/src/ngtsc/testing';

import {NgtscTestEnvironment} from '../env';

const testFiles = loadStandardTestFiles({fakeCore: true, fakeCommon: true});

runInEachFileSystem(os => {
  let env!: NgtscTestEnvironment;

  describe('ngtsc constant docs extraction', () => {
    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    it('should extract constants', () => {
      env.write('index.ts', `
        export const VERSION = '16.0.0';
      `);

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const constantEntry = docs[0] as ConstantEntry;
      expect(constantEntry.name).toBe('VERSION');
      expect(constantEntry.entryType).toBe(EntryType.Constant);
      expect(constantEntry.type).toBe('string');
    });

    it('should extract multiple constant declarations in a single statement', () => {
      env.write('index.ts', `
        export const PI = 3.14, VERSION = '16.0.0';
      `);

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(2);

      const [pi, version] = docs as ConstantEntry[];

      expect(pi.name).toBe('PI');
      expect(pi.entryType).toBe(EntryType.Constant);
      expect(pi.type).toBe('number');

      expect(version.name).toBe('VERSION');
      expect(version.entryType).toBe(EntryType.Constant);
      expect(version.type).toBe('string');
    });

    it('should extract non-primitive constants', () => {
      env.write('index.ts', `
        import {InjectionToken} from '@angular/core';
        export const SOME_TOKEN = new InjectionToken('something');
        export const TYPED_TOKEN = new InjectionToken<string>();
      `);

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(2);

      const [someToken, typedToken] = docs as ConstantEntry[];

      expect(someToken.name).toBe('SOME_TOKEN');
      expect(someToken.entryType).toBe(EntryType.Constant);
      expect(someToken.type).toBe('InjectionToken<unknown>');

      expect(typedToken.name).toBe('TYPED_TOKEN');
      expect(typedToken.entryType).toBe(EntryType.Constant);
      expect(typedToken.type).toBe('InjectionToken<string>');
    });
  });
});
