/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DocEntry} from '../../../src/ngtsc/docs';
import {
  ClassEntry,
  FunctionEntry,
  FunctionSignatureMetadata,
  MethodEntry,
} from '../../../src/ngtsc/docs/src/entities';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../../src/ngtsc/testing';

import {NgtscTestEnvironment} from '../env';

const testFiles = loadStandardTestFiles({fakeCommon: true});

runInEachFileSystem(() => {
  let env!: NgtscTestEnvironment;

  describe('ngtsc jsdoc extraction', () => {
    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    it('should extract jsdoc from all types of top-level statement', () => {
      env.write(
        'index.ts',
        `
        /** This is a constant. */
        export const PI = 3.14;

        /** This is a class. */
        export class UserProfile { }

        /** This is a function. */
        export function save() { }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(3);

      const [piEntry, userProfileEntry, saveEntry] = docs;
      expect(piEntry.description).toBe('This is a constant.');
      expect(userProfileEntry.description).toBe('This is a class.');
      expect(saveEntry.description).toBe('This is a function.');
    });

    it('should extract raw comment blocks', () => {
      env.write(
        'index.ts',
        `
        /** This is a constant. */
        export const PI = 3.14;

        /**
         * Long comment
         * with multiple lines.
         */
        export class UserProfile { }

        /**
         * This is a long JsDoc block
         * that extends multiple lines.
         *
         * @deprecated in includes multiple tags.
         * @experimental here is another one
         */
        export function save() { }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(3);

      const [piEntry, userProfileEntry, saveEntry] = docs;
      expect(piEntry.rawComment).toBe('/** This is a constant. */');
      expect(userProfileEntry.rawComment).toBe(
        `
        /**
         * Long comment
         * with multiple lines.
         */`.trim(),
      );
      expect(saveEntry.rawComment).toBe(
        `
        /**
         * This is a long JsDoc block
         * that extends multiple lines.
         *
         * @deprecated in includes multiple tags.
         * @experimental here is another one
         */`.trim(),
      );
    });

    it('should extract a description from a single-line jsdoc', () => {
      env.write(
        'index.ts',
        `
        /** Framework version. */
        export const VERSION = '16';
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      expect(docs[0].description).toBe('Framework version.');
      expect(docs[0].jsdocTags.length).toBe(0);
    });

    it('should extract a description from a multi-line jsdoc', () => {
      env.write(
        'index.ts',
        `
        /**
         * This is a really long description that needs
         * to wrap over multiple lines.
         */
        export const LONG_VERSION = '16.0.0';
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      expect(docs[0].description).toBe(
        'This is a really long description that needs\nto wrap over multiple lines.',
      );
      expect(docs[0].jsdocTags.length).toBe(0);
    });

    it('should extract jsdoc with an empty tag', () => {
      env.write(
        'index.ts',
        `
        /**
         * Unsupported version.
         * @deprecated
         */
        export const OLD_VERSION = '1.0.0';
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      expect(docs[0].description).toBe('Unsupported version.');
      expect(docs[0].jsdocTags.length).toBe(1);
      expect(docs[0].jsdocTags[0]).toEqual({name: 'deprecated', comment: ''});
    });

    it('should extract jsdoc with a single-line tag', () => {
      env.write(
        'index.ts',
        `
        /**
         * Unsupported version.
         * @deprecated Use the newer one.
         */
        export const OLD_VERSION = '1.0.0';
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      expect(docs[0].description).toBe('Unsupported version.');
      expect(docs[0].jsdocTags.length).toBe(1);
      expect(docs[0].jsdocTags[0]).toEqual({name: 'deprecated', comment: 'Use the newer one.'});
    });

    it('should extract jsdoc with a multi-line tags', () => {
      env.write(
        'index.ts',
        `
        /**
         * Unsupported version.
         * @deprecated Use the newer one.
         *     Or use something else.
         * @experimental This is another
         *     long comment that wraps.
         */
        export const OLD_VERSION = '1.0.0';
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      expect(docs[0].description).toBe('Unsupported version.');
      expect(docs[0].jsdocTags.length).toBe(2);

      const [deprecatedEntry, experimentalEntry] = docs[0].jsdocTags;
      expect(deprecatedEntry).toEqual({
        name: 'deprecated',
        comment: 'Use the newer one.\nOr use something else.',
      });
      expect(experimentalEntry).toEqual({
        name: 'experimental',
        comment: 'This is another\nlong comment that wraps.',
      });
    });

    it('should extract jsdoc with custom tags', () => {
      env.write(
        'index.ts',
        `
        /**
         * Unsupported version.
         * @ancient Use the newer one.
         *     Or use something else.
         */
        export const OLD_VERSION = '1.0.0';
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      expect(docs[0].description).toBe('Unsupported version.');
      expect(docs[0].jsdocTags.length).toBe(1);
      expect(docs[0].jsdocTags[0]).toEqual({
        name: 'ancient',
        comment: 'Use the newer one.\nOr use something else.',
      });
    });

    it('should extract a @see jsdoc tag', () => {
      // "@see" has special behavior with links, so we have tests
      // specifically for this tag.
      env.write(
        'index.ts',
        `
        import {Component} from '@angular/core';

        /**
         * Future version.
         * @see {@link Component}
         */
        export const NEW_VERSION = '99.0.0';
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      expect(docs[0].description).toBe('Future version.');
      expect(docs[0].jsdocTags.length).toBe(1);
      expect(docs[0].jsdocTags[0]).toEqual({
        name: 'see',
        comment: '{@link Component}',
      });
    });

    it('should extract function parameter descriptions', () => {
      env.write(
        'index.ts',
        `
        /**
         * Save some data.
         * @param data The data to save.
         * @param timing Long description
         *     with multiple lines.
         */
        export function save(data: object, timing: number): void { }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const functionEntry = docs[0] as FunctionEntry;
      expect(functionEntry.description).toBe('Save some data.');

      const [dataEntry, timingEntry] = functionEntry.implementation.params;
      expect(dataEntry.description).toBe('The data to save.');
      expect(timingEntry.description).toBe('Long description\nwith multiple lines.');
    });

    it('should extract class member descriptions', () => {
      env.write(
        'index.ts',
        `
        export class UserProfile {
          /** A user identifier. */
          userId: number = 0;

          /** Name of the user */
          get name(): string { return ''; }

          /** Name of the user */
          set name(value: string) { }

          /**
           * Save the user.
           * @param config Setting for saving.
           * @returns Whether it succeeded
           */
          save(config: object): boolean { return false; }
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);
      const classEntry = docs[0] as ClassEntry;

      expect(classEntry.members.length).toBe(4);
      const [userIdEntry, nameGetterEntry, nameSetterEntry] = classEntry.members;

      expect(userIdEntry.description).toBe('A user identifier.');
      expect(nameGetterEntry.description).toBe('Name of the user');
      expect(nameSetterEntry.description).toBe('Name of the user');

      const saveEntry = classEntry.members[3] as MethodEntry;
      expect(saveEntry.description).toBe('Save the user.');

      expect(saveEntry.implementation.params[0].description).toBe('Setting for saving.');
      expect(saveEntry.jsdocTags.length).toBe(2);
      expect(saveEntry.jsdocTags[1]).toEqual({name: 'returns', comment: 'Whether it succeeded'});
    });

    it('should escape decorator names', () => {
      env.write(
        'index.ts',
        `
        /**
         * Save some data.
         * @Component decorators are cool.
         * @deprecated for some reason
         */
        export type s = string;
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const entry = docs[0];
      expect(entry.description).toBe('Save some data.\n@Component decorators are cool.');
      expect(entry.jsdocTags.length).toBe(1);
      expect(entry.jsdocTags[0].name).toBe('deprecated');
    });
  });
});
