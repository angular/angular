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
  DirectiveEntry,
  EntryType,
  MemberTags,
  PropertyEntry,
} from '../../../src/ngtsc/docs/src/entities';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../../src/ngtsc/testing';

import {NgtscTestEnvironment} from '../env';

const testFiles = loadStandardTestFiles({fakeCommon: true});

runInEachFileSystem(() => {
  let env!: NgtscTestEnvironment;

  describe('ngtsc directive docs extraction', () => {
    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    it('should extract standalone directive info', () => {
      env.write(
        'index.ts',
        `
        import {Directive} from '@angular/core';
        @Directive({
          standalone: true,
          selector: 'user-profile',
          exportAs: 'userProfile',
        })
        export class UserProfile { }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      expect(docs.length).toBe(1);
      expect(docs[0].entryType).toBe(EntryType.Directive);

      const directiveEntry = docs[0] as DirectiveEntry;
      expect(directiveEntry.isStandalone).toBe(true);
      expect(directiveEntry.selector).toBe('user-profile');
      expect(directiveEntry.exportAs).toEqual(['userProfile']);
    });

    it('should extract standalone component info', () => {
      env.write(
        'index.ts',
        `
        import {Component} from '@angular/core';
        @Component({
          standalone: true,
          selector: 'user-profile',
          exportAs: 'userProfile',
          template: '',
        })
        export class UserProfile { }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      expect(docs.length).toBe(1);
      expect(docs[0].entryType).toBe(EntryType.Component);

      const componentEntry = docs[0] as DirectiveEntry;
      expect(componentEntry.isStandalone).toBe(true);
      expect(componentEntry.selector).toBe('user-profile');
      expect(componentEntry.exportAs).toEqual(['userProfile']);
    });

    it('should extract NgModule directive info', () => {
      env.write(
        'index.ts',
        `
        import {Directive, NgModule} from '@angular/core';

        @NgModule({declarations: [UserProfile]})
        export class ProfileModule { }

        @Directive({
          standalone: false,
          selector: 'user-profile',
          exportAs: 'userProfile',
        })
        export class UserProfile { }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      expect(docs.length).toBe(2);
      expect(docs[1].entryType).toBe(EntryType.Directive);

      const directiveEntry = docs[1] as DirectiveEntry;
      expect(directiveEntry.isStandalone).toBe(false);
      expect(directiveEntry.selector).toBe('user-profile');
      expect(directiveEntry.exportAs).toEqual(['userProfile']);
    });

    it('should extract NgModule component info', () => {
      env.write(
        'index.ts',
        `
        import {Component, NgModule} from '@angular/core';

        @NgModule({declarations: [UserProfile]})
        export class ProfileModule { }

        @Component({
          standalone: false,
          selector: 'user-profile',
          exportAs: 'userProfile',
          template: '',
        })
        export class UserProfile { }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      expect(docs.length).toBe(2);
      expect(docs[1].entryType).toBe(EntryType.Component);

      const componentEntry = docs[1] as DirectiveEntry;
      expect(componentEntry.isStandalone).toBe(false);
      expect(componentEntry.selector).toBe('user-profile');
      expect(componentEntry.exportAs).toEqual(['userProfile']);
    });

    it('should extract input and output info for a directive', () => {
      env.write(
        'index.ts',
        `
        import {Directive, EventEmitter, Input, Output} from '@angular/core';
        @Directive({
          standalone: true,
          selector: 'user-profile',
          exportAs: 'userProfile',
        })
        export class UserProfile {
          @Input() name: string = '';
          @Input('first') firstName = '';
          @Input({required: true}) middleName = '';
          @Output() saved = new EventEmitter();
          @Output('onReset') reset = new EventEmitter();
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      expect(docs.length).toBe(1);
      expect(docs[0].entryType).toBe(EntryType.Directive);

      const directiveEntry = docs[0] as DirectiveEntry;
      expect(directiveEntry.members.length).toBe(5);

      const [nameEntry, firstNameEntry, middleNameEntry, savedEntry, resetEntry] =
        directiveEntry.members as PropertyEntry[];

      expect(nameEntry.memberTags).toEqual([MemberTags.Input]);
      expect(nameEntry.inputAlias).toBe('name');
      expect(nameEntry.isRequiredInput).toBe(false);
      expect(nameEntry.outputAlias).toBeUndefined();

      expect(firstNameEntry.memberTags).toEqual([MemberTags.Input]);
      expect(firstNameEntry.inputAlias).toBe('first');
      expect(firstNameEntry.isRequiredInput).toBe(false);
      expect(firstNameEntry.outputAlias).toBeUndefined();

      expect(middleNameEntry.memberTags).toEqual([MemberTags.Input]);
      expect(middleNameEntry.inputAlias).toBe('middleName');
      expect(middleNameEntry.isRequiredInput).toBe(true);
      expect(middleNameEntry.outputAlias).toBeUndefined();

      expect(savedEntry.memberTags).toEqual([MemberTags.Output]);
      expect(savedEntry.outputAlias).toBe('saved');
      expect(savedEntry.isRequiredInput).toBeFalsy();
      expect(savedEntry.inputAlias).toBeUndefined();

      expect(resetEntry.memberTags).toEqual([MemberTags.Output]);
      expect(resetEntry.outputAlias).toBe('onReset');
      expect(resetEntry.isRequiredInput).toBeFalsy();
      expect(resetEntry.inputAlias).toBeUndefined();
    });

    it('should extract input and output info for a component', () => {
      env.write(
        'index.ts',
        `
        import {Component, EventEmitter, Input, Output} from '@angular/core';
        @Component({
          standalone: true,
          selector: 'user-profile',
          exportAs: 'userProfile',
          template: '',
        })
        export class UserProfile {
          @Input() name: string = '';
          @Input('first') firstName = '';
          @Output() saved = new EventEmitter();
          @Output('onReset') reset = new EventEmitter();
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      expect(docs.length).toBe(1);
      expect(docs[0].entryType).toBe(EntryType.Component);

      const componentEntry = docs[0] as DirectiveEntry;
      expect(componentEntry.members.length).toBe(4);

      const [nameEntry, firstNameEntry, savedEntry, resetEntry] = componentEntry.members;

      expect(nameEntry.memberTags).toEqual([MemberTags.Input]);
      expect((nameEntry as PropertyEntry).inputAlias).toBe('name');
      expect((nameEntry as PropertyEntry).outputAlias).toBeUndefined();

      expect(firstNameEntry.memberTags).toEqual([MemberTags.Input]);
      expect((firstNameEntry as PropertyEntry).inputAlias).toBe('first');
      expect((firstNameEntry as PropertyEntry).outputAlias).toBeUndefined();

      expect(savedEntry.memberTags).toEqual([MemberTags.Output]);
      expect((savedEntry as PropertyEntry).outputAlias).toBe('saved');
      expect((savedEntry as PropertyEntry).inputAlias).toBeUndefined();

      expect(resetEntry.memberTags).toEqual([MemberTags.Output]);
      expect((resetEntry as PropertyEntry).outputAlias).toBe('onReset');
      expect((resetEntry as PropertyEntry).inputAlias).toBeUndefined();
    });

    it('should extract getters and setters as inputs', () => {
      // Test getter-only, a getter + setter, and setter-only.
      env.write(
        'index.ts',
        `
        import {Component, EventEmitter, Input, Output} from '@angular/core';
        @Component({
          standalone: true,
          selector: 'user-profile',
          exportAs: 'userProfile',
          template: '',
        })
        export class UserProfile {
          @Input()
          get userId(): number { return 123; }

          @Input()
          get userName(): string { return 'Morgan'; }
          set userName(value: string) { }

          @Input()
          set isAdmin(value: boolean) { }
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.entryType).toBe(EntryType.Component);

      expect(classEntry.members.length).toBe(4);

      const [userIdGetter, userNameGetter, userNameSetter, isAdminSetter] = classEntry.members;

      expect(userIdGetter.name).toBe('userId');
      expect(userIdGetter.memberTags).toContain(MemberTags.Input);
      expect(userNameGetter.name).toBe('userName');
      expect(userNameGetter.memberTags).toContain(MemberTags.Input);
      expect(userNameSetter.name).toBe('userName');
      expect(userNameSetter.memberTags).toContain(MemberTags.Input);
      expect(isAdminSetter.name).toBe('isAdmin');
      expect(isAdminSetter.memberTags).toContain(MemberTags.Input);
    });
  });
});
