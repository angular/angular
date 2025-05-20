/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DocEntry} from '../../../src/ngtsc/docs';
import {DecoratorEntry, DecoratorType, EntryType} from '../../../src/ngtsc/docs/src/entities';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../../src/ngtsc/testing';

import {NgtscTestEnvironment} from '../env';

const testFiles = loadStandardTestFiles({fakeCommon: true});

runInEachFileSystem(() => {
  let env!: NgtscTestEnvironment;

  describe('ngtsc decorator docs extraction', () => {
    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    it('should extract class decorators that define members in an interface', () => {
      env.write(
        'index.ts',
        `
        export interface Component {
          /** The template. */
          template: string;
        }

        export interface ComponentDecorator {
          /** The description. */
          (obj?: Component): any;
        }

        function makeDecorator(): ComponentDecorator { return () => {}; }

        export const Component: ComponentDecorator = makeDecorator();
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const decoratorEntry = docs[0] as DecoratorEntry;
      expect(decoratorEntry.name).toBe('Component');
      expect(decoratorEntry.description).toBe('The description.');
      expect(decoratorEntry.entryType).toBe(EntryType.Decorator);
      expect(decoratorEntry.decoratorType).toBe(DecoratorType.Class);

      expect(decoratorEntry.members.length).toBe(1);
      expect(decoratorEntry.members[0].name).toBe('template');
      expect(decoratorEntry.members[0].type).toBe('string');
      expect(decoratorEntry.members[0].description).toBe('The template.');
    });

    it('should extract property decorators', () => {
      env.write(
        'index.ts',
        `
        export interface Input {
          /** The alias. */
          alias: string;
        }

        export interface InputDecorator {
          /** The description. */
          (alias: string): any;
        }

        function makePropDecorator(): InputDecorator { return () => {}); }

        export const Input: InputDecorator = makePropDecorator();
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const decoratorEntry = docs[0] as DecoratorEntry;
      expect(decoratorEntry.name).toBe('Input');
      expect(decoratorEntry.description).toBe('The description.');
      expect(decoratorEntry.entryType).toBe(EntryType.Decorator);
      expect(decoratorEntry.decoratorType).toBe(DecoratorType.Member);

      expect(decoratorEntry.members.length).toBe(1);
      expect(decoratorEntry.members[0].name).toBe('alias');
      expect(decoratorEntry.members[0].type).toBe('string');
      expect(decoratorEntry.members[0].description).toBe('The alias.');
    });

    it('should extract property decorators with a type alias', () => {
      env.write(
        'index.ts',
        `
        interface Query {
          /** The read. */
          read: string;
        }

        export type ViewChild = Query;

        export interface ViewChildDecorator {
          /** The description. */
          (alias: string): any;
        }

        function makePropDecorator(): ViewChildDecorator { return () => {}); }

        export const ViewChild: ViewChildDecorator = makePropDecorator();
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const decoratorEntry = docs[0] as DecoratorEntry;
      expect(decoratorEntry.name).toBe('ViewChild');
      expect(decoratorEntry.description).toBe('The description.');
      expect(decoratorEntry.entryType).toBe(EntryType.Decorator);
      expect(decoratorEntry.decoratorType).toBe(DecoratorType.Member);

      expect(decoratorEntry.members.length).toBe(1);
      expect(decoratorEntry.members[0].name).toBe('read');
      expect(decoratorEntry.members[0].type).toBe('string');
      expect(decoratorEntry.members[0].description).toBe('The read.');
    });

    it('should extract param decorators', () => {
      env.write(
        'index.ts',
        `
        export interface Inject {
          /** The token. */
          token: string;
        }

        export interface InjectDecorator {
          /** The description. */
          (token: string) => any;
        }

        function makePropDecorator(): InjectDecorator { return () => {}; }

        export const Inject: InjectDecorator = makeParamDecorator();
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const decoratorEntry = docs[0] as DecoratorEntry;
      expect(decoratorEntry.name).toBe('Inject');
      expect(decoratorEntry.description).toBe('The description.');
      expect(decoratorEntry.entryType).toBe(EntryType.Decorator);
      expect(decoratorEntry.decoratorType).toBe(DecoratorType.Parameter);

      expect(decoratorEntry.members.length).toBe(1);
      expect(decoratorEntry.members[0].name).toBe('token');
      expect(decoratorEntry.members[0].type).toBe('string');
      expect(decoratorEntry.members[0].description).toBe('The token.');
    });
  });
});
