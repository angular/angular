/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DocEntry} from '../../../src/ngtsc/docs';
import {EntryType, PipeEntry} from '../../../src/ngtsc/docs/src/entities';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../../src/ngtsc/testing';

import {NgtscTestEnvironment} from '../env';

const testFiles = loadStandardTestFiles({fakeCommon: true});

runInEachFileSystem(() => {
  let env!: NgtscTestEnvironment;

  describe('ngtsc pipe docs extraction', () => {
    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    it('should extract standalone pipe info', () => {
      env.write(
        'index.ts',
        `
        import {Pipe} from '@angular/core';
        @Pipe({
          standalone: true,
          name: 'shorten',
        })
        export class ShortenPipe {
          transform(value: string): string { return ''; }
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      expect(docs.length).toBe(1);
      expect(docs[0].entryType).toBe(EntryType.Pipe);

      const directiveEntry = docs[0] as PipeEntry;
      expect(directiveEntry.isStandalone).toBe(true);
      expect(directiveEntry.name).toBe('ShortenPipe');
      expect(directiveEntry.pipeName).toBe('shorten');
    });

    it('should extract NgModule pipe info', () => {
      env.write(
        'index.ts',
        `
        import {Pipe, NgModule} from '@angular/core';
        @Pipe({
          name: 'shorten',
          standalone: false, 
        })
        export class ShortenPipe {
          transform(value: string): string { return ''; }
        }

        @NgModule({declarations: [ShortenPipe]})
        export class PipeModule { }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      expect(docs.length).toBe(2);
      expect(docs[0].entryType).toBe(EntryType.Pipe);

      const directiveEntry = docs[0] as PipeEntry;
      expect(directiveEntry.isStandalone).toBe(false);
      expect(directiveEntry.name).toBe('ShortenPipe');
      expect(directiveEntry.pipeName).toBe('shorten');
    });
  });
});
