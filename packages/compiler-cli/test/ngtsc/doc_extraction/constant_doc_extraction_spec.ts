/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DocEntry} from '../../../src/ngtsc/docs';
import {ConstantEntry, EntryType, EnumEntry} from '../../../src/ngtsc/docs/src/entities';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../../src/ngtsc/testing';

import {NgtscTestEnvironment} from '../env';

const testFiles = loadStandardTestFiles({fakeCommon: true});

runInEachFileSystem(() => {
  let env!: NgtscTestEnvironment;

  describe('ngtsc constant docs extraction', () => {
    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    it('should extract constants', () => {
      env.write(
        'index.ts',
        `
        export const VERSION = '16.0.0';
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const constantEntry = docs[0] as ConstantEntry;
      expect(constantEntry.name).toBe('VERSION');
      expect(constantEntry.entryType).toBe(EntryType.Constant);
      expect(constantEntry.type).toBe('string');
    });

    it('should extract multiple constant declarations in a single statement', () => {
      env.write(
        'index.ts',
        `
        export const PI = 3.14, VERSION = '16.0.0';
      `,
      );

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
      env.write(
        'index.ts',
        `
        import {InjectionToken} from '@angular/core';
        export const SOME_TOKEN = new InjectionToken('something');
        export const TYPED_TOKEN = new InjectionToken<string>();
      `,
      );

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

    it('should extract an object literal marked as an enum', () => {
      env.write(
        'index.ts',
        `
        /**
         * Toppings for your pizza.
         * @object-literal-as-enum
         */
        export const PizzaTopping = {
          /** It is cheese */
          Cheese: 0,

          /** Or "tomato" if you are British */
          Tomato: "tomato",
        };
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      expect(docs.length).toBe(1);
      expect(docs[0].entryType).toBe(EntryType.Enum);
      expect(docs[0].jsdocTags).toEqual([]);

      const enumEntry = docs[0] as EnumEntry;
      expect(enumEntry.name).toBe('PizzaTopping');
      expect(enumEntry.members.length).toBe(2);

      const [cheeseEntry, tomatoEntry] = enumEntry.members;

      expect(cheeseEntry.name).toBe('Cheese');
      expect(cheeseEntry.description).toBe('It is cheese');
      expect(cheeseEntry.value).toBe('0');
      expect(cheeseEntry.type).toBe('PizzaTopping.Cheese');

      expect(tomatoEntry.name).toBe('Tomato');
      expect(tomatoEntry.description).toBe('Or "tomato" if you are British');
      expect(tomatoEntry.value).toBe('"tomato"');
      expect(tomatoEntry.type).toBe('PizzaTopping.Tomato');
    });

    it('should extract an object literal cast to a const and marked as an enum', () => {
      env.write(
        'index.ts',
        `
        /**
         * Toppings for your pizza.
         * @object-literal-as-enum
         */
        export const PizzaTopping = {
          /** It is cheese */
          Cheese: 0,

          /** Or "tomato" if you are British */
          Tomato: "tomato",
        } as const;
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      expect(docs.length).toBe(1);
      expect(docs[0].entryType).toBe(EntryType.Enum);
      expect(docs[0].jsdocTags).toEqual([]);

      const enumEntry = docs[0] as EnumEntry;
      expect(enumEntry.name).toBe('PizzaTopping');
      expect(enumEntry.members.length).toBe(2);

      const [cheeseEntry, tomatoEntry] = enumEntry.members;

      expect(cheeseEntry.name).toBe('Cheese');
      expect(cheeseEntry.description).toBe('It is cheese');
      expect(cheeseEntry.value).toBe('0');
      expect(cheeseEntry.type).toBe('PizzaTopping.Cheese');

      expect(tomatoEntry.name).toBe('Tomato');
      expect(tomatoEntry.description).toBe('Or "tomato" if you are British');
      expect(tomatoEntry.value).toBe('"tomato"');
      expect(tomatoEntry.type).toBe('PizzaTopping.Tomato');
    });
  });
});
