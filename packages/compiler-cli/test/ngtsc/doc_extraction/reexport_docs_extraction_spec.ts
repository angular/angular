/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DocEntry} from '../../../src/ngtsc/docs';
import {EntryType} from '../../../src/ngtsc/docs/src/entities';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../../src/ngtsc/testing';

import {NgtscTestEnvironment} from '../env';

const testFiles = loadStandardTestFiles({fakeCommon: true});

runInEachFileSystem(() => {
  let env!: NgtscTestEnvironment;

  describe('ngtsc re-export docs extraction', () => {
    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    it('should extract info from a named re-export', () => {
      env.write(
        'index.ts',
        `
        export {PI} from './implementation';
      `,
      );

      env.write(
        'implementation.ts',
        `
        export const PI = 3.14;
        export const TAO = 6.28;
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      expect(docs.length).toBe(1);
      expect(docs[0].entryType).toBe(EntryType.Constant);
      expect(docs[0].name).toBe('PI');
    });

    it('should extract info from an aggregate re-export', () => {
      env.write(
        'index.ts',
        `
        export * from './implementation';
      `,
      );

      env.write(
        'implementation.ts',
        `
        export const PI = 3.14;
        export const TAO = 6.28;
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      expect(docs.length).toBe(2);

      const [piEntry, taoEntry] = docs;
      expect(piEntry.entryType).toBe(EntryType.Constant);
      expect(piEntry.name).toBe('PI');
      expect(taoEntry.entryType).toBe(EntryType.Constant);
      expect(taoEntry.name).toBe('TAO');
    });

    it('should extract info from a transitive re-export', () => {
      env.write(
        'index.ts',
        `
        export * from './middle';
      `,
      );

      env.write(
        'middle.ts',
        `
        export * from 'implementation';
      `,
      );

      env.write(
        'implementation.ts',
        `
        export const PI = 3.14;
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      expect(docs.length).toBe(1);
      expect(docs[0].entryType).toBe(EntryType.Constant);
      expect(docs[0].name).toBe('PI');
    });

    it('should extract info from an aliased re-export', () => {
      env.write(
        'index.ts',
        `
        export * from './implementation';
      `,
      );

      env.write(
        'implementation.ts',
        `
        const PI = 3.14;

        export {PI as PI_CONSTANT};
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      expect(docs.length).toBe(1);
      expect(docs[0].entryType).toBe(EntryType.Constant);
      expect(docs[0].name).toBe('PI_CONSTANT');
    });
  });
});
