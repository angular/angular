/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  EntryType,
  FunctionSignatureMetadata,
  InitializerApiFunctionEntry,
  ParameterEntry,
} from '../../../src/ngtsc/docs/src/entities';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../../src/ngtsc/testing';

import {NgtscTestEnvironment} from '../env';

const inputFixture = `
  export interface InputSignal<T> {}

  export interface InputFunction {
    /** No explicit initial value */
    <T>(): InputSignal<T|undefined>;
    /** With explicit initial value */
    <T>(initialValue: T): InputSignal<T>;

    required: {
      /** Required, no options */
      <T>(): void;
      /** Required, with transform */
      <T, TransformT>(transformFn: (v: TransformT) => T): void;
    }
  }

  /**
   * This describes the overall initializer API
   * function.
   *
   * @initializerApiFunction
   */
  export const input: InputFunction = null!;
`;

const contentChildrenFixture = `\
  export interface Options<ReadT = void> {}

  /** Queries for children with "LocatorT". */
  export function contentChildren<LocatorT>(
      locator: LocatorT, opts?: Options): Signal<LocatorT>;
  /** Queries for children with "LocatorT" and "read" option. */
  export function contentChildren<LocatorT, ReadT>(
      locator: LocatorT, opts: Options<ReadT>): Signal<ReadT>;

  /**
  * Overall description of "contentChildren" API.
  *
  * @initializerApiFunction
  */
  export function contentChildren<LocatorT, ReadT>(
      locator: LocatorT, opts?: Options<ReadT>): Signal<ReadT> {
    return null;
  }
`;

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('ngtsc initializer API docs extraction', () => {
    let env: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    function test(input: string): InitializerApiFunctionEntry | undefined {
      env.write('index.ts', input);
      return env
        .driveDocsExtraction('index.ts')
        .find(
          (f): f is InitializerApiFunctionEntry => f.entryType === EntryType.InitializerApiFunction,
        );
    }

    describe('interface-based', () => {
      it('should extract name', () => {
        expect(test(inputFixture)?.name).toBe('input');
      });

      it('should extract container description', () => {
        expect(test(inputFixture)?.description.replace(/\n/g, ' ')).toBe(
          'This describes the overall initializer API function.',
        );
      });

      it('should extract individual return types', () => {
        expect(test(inputFixture)?.callFunction.signatures[0].returnType).toBe(
          'InputSignal<T | undefined>',
        );
        expect(test(inputFixture)?.callFunction.signatures[1].returnType).toBe('InputSignal<T>');
      });

      it('should extract container tags', () => {
        expect(test(inputFixture)?.jsdocTags).toEqual([
          jasmine.objectContaining({name: 'initializerApiFunction'}),
        ]);
      });

      it('should extract top-level call signatures', () => {
        expect(test(inputFixture)?.callFunction).toEqual({
          name: 'input',
          implementation: null,
          signatures: [
            jasmine.objectContaining<FunctionSignatureMetadata>({
              generics: [{name: 'T', constraint: undefined, default: undefined}],
              returnType: 'InputSignal<T | undefined>',
            }),
            jasmine.objectContaining<FunctionSignatureMetadata>({
              generics: [{name: 'T', constraint: undefined, default: undefined}],
              params: [jasmine.objectContaining<ParameterEntry>({name: 'initialValue', type: 'T'})],
              returnType: 'InputSignal<T>',
            }),
          ],
        });
      });

      it('should extract sub-property call signatures', () => {
        expect(test(inputFixture)?.subFunctions).toEqual([
          {
            name: 'required',
            implementation: null,
            signatures: [
              jasmine.objectContaining<FunctionSignatureMetadata>({
                generics: [{name: 'T', constraint: undefined, default: undefined}],
                returnType: 'void',
              }),
              jasmine.objectContaining<FunctionSignatureMetadata>({
                generics: [
                  {name: 'T', constraint: undefined, default: undefined},
                  {name: 'TransformT', constraint: undefined, default: undefined},
                ],
                params: [
                  jasmine.objectContaining<ParameterEntry>({
                    name: 'transformFn',
                    type: '(v: TransformT) => T',
                  }),
                ],
                returnType: 'void',
              }),
            ],
          },
        ]);
      });
    });

    describe('function-based', () => {
      it('should extract name', () => {
        expect(test(contentChildrenFixture)?.name).toBe('contentChildren');
      });

      it('should extract container description', () => {
        expect(test(contentChildrenFixture)?.description.replace(/\n/g, ' ')).toBe(
          'Overall description of "contentChildren" API.',
        );
      });

      it('should extract container tags', () => {
        expect(test(contentChildrenFixture)?.jsdocTags).toEqual([
          jasmine.objectContaining({name: 'initializerApiFunction'}),
        ]);
      });

      it('should extract top-level call signatures', () => {
        expect(test(contentChildrenFixture)?.callFunction).toEqual({
          name: 'contentChildren',
          implementation: jasmine.objectContaining<FunctionSignatureMetadata>({
            name: 'contentChildren',
            description: jasmine.stringContaining('Overall description of "contentChildren" API'),
          }),
          signatures: [
            jasmine.objectContaining<FunctionSignatureMetadata>({
              generics: [{name: 'LocatorT', constraint: undefined, default: undefined}],
              params: [
                jasmine.objectContaining<ParameterEntry>({name: 'locator', type: 'LocatorT'}),
                jasmine.objectContaining<ParameterEntry>({
                  name: 'opts',
                  isOptional: true,
                  type: 'Options<void> | undefined',
                }),
              ],
              returnType: 'Signal<LocatorT>',
            }),
            jasmine.objectContaining<FunctionSignatureMetadata>({
              generics: [
                {name: 'LocatorT', constraint: undefined, default: undefined},
                {name: 'ReadT', constraint: undefined, default: undefined},
              ],
              params: [
                jasmine.objectContaining<ParameterEntry>({name: 'locator', type: 'LocatorT'}),
                jasmine.objectContaining<ParameterEntry>({
                  name: 'opts',
                  isOptional: false,
                  type: 'Options<ReadT>',
                }),
              ],
              returnType: 'Signal<ReadT>',
            }),
          ],
        });
      });

      it('should have an empty list of sub-properties', () => {
        // Function-based initializer APIs never have sub-properties.
        expect(test(contentChildrenFixture)?.subFunctions).toEqual([]);
      });
    });
  });
});
