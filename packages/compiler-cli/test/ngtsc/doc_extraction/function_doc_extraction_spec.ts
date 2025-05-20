/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DocEntry} from '../../../src/ngtsc/docs';
import {EntryType, FunctionEntry} from '../../../src/ngtsc/docs/src/entities';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../../src/ngtsc/testing';

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
      env.write(
        'index.ts',
        `
        export function getInjector() { }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const functionEntry = docs[0] as FunctionEntry;
      expect(functionEntry.name).toBe('getInjector');
      expect(functionEntry.entryType).toBe(EntryType.Function);
      expect(functionEntry.implementation.params.length).toBe(0);
      expect(functionEntry.implementation.returnType).toBe('void');
    });

    it('should extract function with parameters', () => {
      env.write(
        'index.ts',
        `
        export function go(num: string, intl = 1, area?: string): boolean {
          return false;
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const functionEntry = docs[0] as FunctionEntry;
      expect(functionEntry.entryType).toBe(EntryType.Function);
      expect(functionEntry.implementation.returnType).toBe('boolean');

      expect(functionEntry.implementation.params.length).toBe(3);

      const [numParam, intlParam, areaParam] = functionEntry.implementation.params;
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
      env.write(
        'index.ts',
        `
        export function getNames(prefix: string, ...ids: string[]): string[] {
          return [];
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      const functionEntry = docs[0] as FunctionEntry;
      const [prefixParamEntry, idsParamEntry] = functionEntry.implementation.params;

      expect(prefixParamEntry.name).toBe('prefix');
      expect(prefixParamEntry.type).toBe('string');
      expect(prefixParamEntry.isRestParam).toBe(false);

      expect(idsParamEntry.name).toBe('ids');
      expect(idsParamEntry.type).toBe('string[]');
      expect(idsParamEntry.isRestParam).toBe(true);
    });

    it('should extract overloaded functions', () => {
      env.write(
        'index.ts',
        `
        export function ident(value: boolean): boolean
        export function ident(value: number): number
        export function ident(value: number|boolean): number|boolean {
          return value;
        }
      `,
      );

      const docs = env.driveDocsExtraction('index.ts') as FunctionEntry[];
      expect(docs[0].signatures?.length).toBe(2);

      const [booleanOverloadEntry, numberOverloadEntry] = docs[0].signatures!;

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
      env.write(
        'index.ts',
        `
        export function save<T>(data: T) { }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const [functionEntry] = docs as FunctionEntry[];
      expect(functionEntry.signatures.length).toBe(1);

      const [genericEntry] = functionEntry.implementation.generics;
      expect(genericEntry.name).toBe('T');
      expect(genericEntry.constraint).toBeUndefined();
      expect(genericEntry.default).toBeUndefined();
    });

    it('should extract type predicates as return type of type guards', () => {
      env.write(
        'index.ts',
        `export function isSignal(value: unknown): value is Signal<unknown> {}`,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const [functionEntry] = docs as FunctionEntry[];
      expect(functionEntry.implementation.returnType).toBe('value is Signal<unknown>');
      expect(functionEntry.signatures[0].returnType).toBe('value is Signal<unknown>');
    });
  });
});
