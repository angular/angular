/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DocEntry} from '../../../src/ngtsc/docs/src/entities';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';

import {NgtscTestEnvironment} from '../env';

runInEachFileSystem(() => {
  describe('ngtsc docs: @docsPrivate tag', () => {
    let env: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup({});
      env.tsconfig();
    });

    function test(input: string): DocEntry[] {
      env.write('index.ts', input);
      return env.driveDocsExtraction('index.ts');
    }

    it('should omit constant annotated with `@docsPrivate`', () => {
      expect(
        test(`
        /** @docsPrivate <reason> */
        export const bla = true;
      `),
      ).toEqual([]);
    });

    it('should omit class annotated with `@docsPrivate`', () => {
      expect(
        test(`
        /** @docsPrivate <reason> */
        export class Bla {}
      `),
      ).toEqual([]);
    });

    it('should omit function annotated with `@docsPrivate`', () => {
      expect(
        test(`
        /** @docsPrivate <reason> */
        export function bla() {};
      `),
      ).toEqual([]);
    });

    it('should omit interface annotated with `@docsPrivate`', () => {
      expect(
        test(`
        /** @docsPrivate <reason> */
        export interface BlaFunction {}
      `),
      ).toEqual([]);
    });

    it('should error if marked as private without reasoning', () => {
      expect(() =>
        test(`
        /** @docsPrivate */
        export interface BlaFunction {}
      `),
      ).toThrowError(/Entry "BlaFunction" is marked as "@docsPrivate" but without reasoning./);
    });
  });
});
