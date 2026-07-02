/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DocEntry} from '../../../src/ngtsc/docs';
import {ClassEntry, EntryType} from '../../../src/ngtsc/docs/src/entities';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../../src/ngtsc/testing';

import {NgtscTestEnvironment} from '../env';

const testFiles = loadStandardTestFiles({fakeCommon: true});

runInEachFileSystem(() => {
  let env!: NgtscTestEnvironment;

  describe('ngtsc NgModule docs extraction', () => {
    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    it('should extract NgModule info', () => {
      env.write(
        'index.ts',
        `
        import {Directive, NgModule} from '@angular/core';

        @Directive({selector: 'some-tag'})
        export class SomeDirective { }

        @NgModule({declarations: [SomeDirective]})
        export class SomeNgModule { }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      expect(docs.length).toBe(2);
      expect(docs[1].entryType).toBe(EntryType.NgModule);

      const ngModuleEntry = docs[1] as ClassEntry;
      expect(ngModuleEntry.name).toBe('SomeNgModule');
    });
  });
});
