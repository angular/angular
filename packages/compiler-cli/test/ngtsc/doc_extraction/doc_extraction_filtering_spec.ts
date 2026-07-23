/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DocEntry} from '../../../src/ngtsc/docs';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../../src/ngtsc/testing';

import {NgtscTestEnvironment} from '../env';

const testFiles = loadStandardTestFiles({fakeCommon: true});

runInEachFileSystem(() => {
  let env!: NgtscTestEnvironment;

  describe('ngtsc docs extraction filtering', () => {
    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    it('should not extract Angular-private symbols', () => {
      env.write(
        'index.ts',
        `
        export class ɵUserProfile {}
        export class _SliderWidget {}
        export const ɵPI = 3.14;
        export const _TAO = 6.28;
        export function ɵsave() { }
        export function _reset() { }
        export interface ɵSavable { }
        export interface _Resettable { }
        export type ɵDifferentNumber = number;
        export type _DifferentBoolean = boolean;
        export enum ɵToppings { Tomato, Onion }
        export enum _Sauces { Buffalo, Garlic }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(0);
    });

    it('should extract the type declaration if the value declaration is private', () => {
      env.write(
        'index.ts',
        `
       /**
        * Documented 
        */ 
       export interface FormControl<T> {
          name: string;
       }
       export interface ɵFormControlCtor {
        new (): FormControl<any>;
       }
       export const FormControl: ɵFormControlCtor = class FormControl<TValue = any> {
       
       }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);
      expect(docs[0].name).toBe('FormControl');
      expect(docs[0].rawComment).toMatch(/Documented/);
    });
  });
});
