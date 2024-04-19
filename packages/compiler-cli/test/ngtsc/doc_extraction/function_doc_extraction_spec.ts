/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DocEntry} from '@angular/compiler-cli/src/ngtsc/docs';
import {EntryType, FunctionEntry} from '@angular/compiler-cli/src/ngtsc/docs/src/entities';
import {runInEachFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '@angular/compiler-cli/src/ngtsc/testing';

import {NgtscTestEnvironment} from '../env';

const testFiles = loadStandardTestFiles({fakeCommon: true});

runInEachFileSystem(() => {
  let env!: NgtscTestEnvironment;

  describe('ngtsc function docs extraction', () => {
    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    it('should extract functions', () => {
      env.write('index.ts', `
        export function getInjector() { }
      `);

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const functionEntry = docs[0] as FunctionEntry;
      expect(functionEntry.name).toBe('getInjector');
      expect(functionEntry.entryType).toBe(EntryType.Function);
      expect(functionEntry.params.length).toBe(0);
      expect(functionEntry.returnType).toBe('void');
    });

    it('should extract function with parameters', () => {
      env.write('index.ts', `
        export function go(num: string, intl = 1, area?: string): boolean {
          return false;
        }
      `);

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const functionEntry = docs[0] as FunctionEntry;
      expect(functionEntry.entryType).toBe(EntryType.Function);
      expect(functionEntry.returnType).toBe('boolean');

      expect(functionEntry.params.length).toBe(3);

      const [numParam, intlParam, areaParam] = functionEntry.params;
      expect(numParam.name).toBe('num');
      expect(numParam.isOptional).toBe(false);
      expect(numParam.type).toBe('string');

      expect(intlParam.name).toBe('intl');
      expect(intlParam.isOptional).toBe(true);
      expect(intlParam.type).toBe('number');

      expect(areaParam.name).toBe('area');
      expect(areaParam.isOptional).toBe(true);
      expect(areaParam.type).toBe('string | undefined');
    });

    it('should extract a function with a rest parameter', () => {
      env.write('index.ts', `
        export function getNames(prefix: string, ...ids: string[]): string[] {
          return [];
        }
      `);

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      const functionEntry = docs[0] as FunctionEntry;
      const [prefixParamEntry, idsParamEntry] = functionEntry.params;

      expect(prefixParamEntry.name).toBe('prefix');
      expect(prefixParamEntry.type).toBe('string');
      expect(prefixParamEntry.isRestParam).toBe(false);

      expect(idsParamEntry.name).toBe('ids');
      expect(idsParamEntry.type).toBe('string[]');
      expect(idsParamEntry.isRestParam).toBe(true);
    });

    it('should extract overloaded functions', () => {
      env.write('index.ts', `
        export function ident(value: boolean): boolean
        export function ident(value: number): number
        export function ident(value: number|boolean): number|boolean {
          return value;
        }
      `);

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(2);

      const [booleanOverloadEntry, numberOverloadEntry] = docs as FunctionEntry[];

      expect(booleanOverloadEntry.name).toBe('ident');
      expect(booleanOverloadEntry.params.length).toBe(1);
      expect(booleanOverloadEntry.params[0].type).toBe('boolean');
      expect(booleanOverloadEntry.returnType).toBe('boolean');

      expect(numberOverloadEntry.name).toBe('ident');
      expect(numberOverloadEntry.params.length).toBe(1);
      expect(numberOverloadEntry.params[0].type).toBe('number');
      expect(numberOverloadEntry.returnType).toBe('number');
    });

    it('should extract function generics', () => {
      env.write('index.ts', `
        export function save<T>(data: T) { }
      `);

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const [functionEntry] = docs as FunctionEntry[];
      expect(functionEntry.generics.length).toBe(1);

      const [genericEntry] = functionEntry.generics;
      expect(genericEntry.name).toBe('T');
      expect(genericEntry.constraint).toBeUndefined();
      expect(genericEntry.default).toBeUndefined();
    });
  });
});
