/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DocEntry} from '../../../src/ngtsc/docs';
import {EntryType, EnumEntry} from '../../../src/ngtsc/docs/src/entities';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../../src/ngtsc/testing';

import {NgtscTestEnvironment} from '../env';

const testFiles = loadStandardTestFiles({fakeCommon: true});

runInEachFileSystem(() => {
  let env!: NgtscTestEnvironment;

  describe('ngtsc enum docs extraction', () => {
    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    it('should extract enum info without explicit values', () => {
      env.write(
        'index.ts',
        `
        export enum PizzaTopping {
          /** It is cheese */
          Cheese,

          /** Or "tomato" if you are British */
          Tomato,
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      expect(docs.length).toBe(1);
      expect(docs[0].entryType).toBe(EntryType.Enum);

      const enumEntry = docs[0] as EnumEntry;
      expect(enumEntry.name).toBe('PizzaTopping');
      expect(enumEntry.members.length).toBe(2);

      const [cheeseEntry, tomatoEntry] = enumEntry.members;

      expect(cheeseEntry.name).toBe('Cheese');
      expect(cheeseEntry.description).toBe('It is cheese');
      expect(cheeseEntry.value).toBe('');

      expect(tomatoEntry.name).toBe('Tomato');
      expect(tomatoEntry.description).toBe('Or "tomato" if you are British');
      expect(tomatoEntry.value).toBe('');
    });

    it('should extract enum info with explicit values', () => {
      env.write(
        'index.ts',
        `
        export enum PizzaTopping {
          /** It is cheese */
          Cheese = 0,

          /** Or "tomato" if you are British */
          Tomato = "tomato",
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      expect(docs.length).toBe(1);
      expect(docs[0].entryType).toBe(EntryType.Enum);

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
