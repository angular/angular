/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DocEntry} from '@angular/compiler-cli/src/ngtsc/docs';
import {ClassEntry, DirectiveEntry, EntryType, MemberTags, MemberType, MethodEntry, PropertyEntry} from '@angular/compiler-cli/src/ngtsc/docs/src/entities';
import {runInEachFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '@angular/compiler-cli/src/ngtsc/testing';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles({fakeCore: true, fakeCommon: true});

runInEachFileSystem(os => {
  let env!: NgtscTestEnvironment;

  describe('ngtsc docs extraction', () => {
    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    it('should extract classes', () => {
      env.write('test.ts', `
        class UserProfile {}

        class CustomSlider {}
      `);

      const docs: DocEntry[] = env.driveDocsExtraction();
      expect(docs.length).toBe(2);
      expect(docs[0].name).toBe('UserProfile');
      expect(docs[0].entryType).toBe(EntryType.undecorated_class);
      expect(docs[1].name).toBe('CustomSlider');
      expect(docs[1].entryType).toBe(EntryType.undecorated_class);
    });

    it('should extract class members', () => {
      env.write('test.ts', `
        class UserProfile {
          firstName(): string { return 'Morgan'; }          
          age: number = 25;
        }
      `);

      const docs: DocEntry[] = env.driveDocsExtraction();
      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.members.length).toBe(2);

      const methodEntry = classEntry.members[0] as MethodEntry;
      expect(methodEntry.memberType).toBe(MemberType.method);
      expect(methodEntry.name).toBe('firstName');

      const propertyEntry = classEntry.members[1] as PropertyEntry;
      expect(propertyEntry.memberType).toBe(MemberType.property);
      expect(propertyEntry.name).toBe('age');
    });

    it('should extract class method params', () => {
      env.write('test.ts', `
        class UserProfile {
          setPhone(num: string, intl: string = '1', area?: string): void {}
        }
      `);

      const docs: DocEntry[] = env.driveDocsExtraction();

      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.members.length).toBe(1);

      const methodEntry = classEntry.members[0] as MethodEntry;
      expect(methodEntry.memberType).toBe(MemberType.method);
      expect(methodEntry.name).toBe('setPhone');
      expect(methodEntry.params.length).toBe(3);

      const [numParam, intlParam, areaParam] = methodEntry.params;
      expect(numParam.name).toBe('num');
      expect(numParam.isOptional).toBe(false);
      expect(intlParam.name).toBe('intl');
      expect(intlParam.isOptional).toBe(true);
      expect(areaParam.name).toBe('area');
      expect(areaParam.isOptional).toBe(true);
    });

    it('should not extract private class members', () => {
      env.write('test.ts', `
        class UserProfile {
            private ssn: string;
            private getSsn(): string { return ''; }
            private static printSsn(): void { }
        }
      `);

      const docs: DocEntry[] = env.driveDocsExtraction();

      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.members.length).toBe(0);
    });

    it('should extract member tags', () => {
      // Test both properties and methods with zero, one, and multiple tags.
      env.write('test.ts', `
        class UserProfile {            
            eyeColor = 'brown';
            protected name: string;
            readonly age = 25;
            address?: string;
            static country = 'USA';
            protected readonly birthday = '1/1/2000';
            
            getEyeColor(): string { return 'brown'; }
            protected getName(): string { return 'Morgan'; }
            getAge?(): number { return 25; }
            static getCountry(): string { return 'USA'; }
            protected getBirthday?(): string { return '1/1/2000'; }
        }
      `);

      const docs: DocEntry[] = env.driveDocsExtraction();

      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.members.length).toBe(11);

      const [
        eyeColorMember,
        nameMember,
        ageMember,
        addressMember,
        countryMember,
        birthdayMember,
        getEyeColorMember,
        getNameMember,
        getAgeMember,
        getCountryMember,
        getBirthdayMember,
      ] = classEntry.members;

      // Properties
      expect(eyeColorMember.memberTags.length).toBe(0);
      expect(nameMember.memberTags).toEqual([MemberTags.protected]);
      expect(ageMember.memberTags).toEqual([MemberTags.readonly]);
      expect(addressMember.memberTags).toEqual([MemberTags.optional]);
      expect(countryMember.memberTags).toEqual([MemberTags.static]);
      expect(birthdayMember.memberTags).toContain(MemberTags.protected);
      expect(birthdayMember.memberTags).toContain(MemberTags.readonly);

      // Methods
      expect(getEyeColorMember.memberTags.length).toBe(0);
      expect(getNameMember.memberTags).toEqual([MemberTags.protected]);
      expect(getAgeMember.memberTags).toEqual([MemberTags.optional]);
      expect(getCountryMember.memberTags).toEqual([MemberTags.static]);
      expect(getBirthdayMember.memberTags).toContain(MemberTags.protected);
      expect(getBirthdayMember.memberTags).toContain(MemberTags.optional);
    });

    it('should extract standalone directive info', () => {
      env.write('test.ts', `
        import {Directive} from '@angular/core';
        @Directive({
          standalone: true,
          selector: 'user-profile',
          exportAs: 'userProfile',
        })
        export class UserProfile { }
      `);

      const docs: DocEntry[] = env.driveDocsExtraction();

      expect(docs.length).toBe(1);
      expect(docs[0].entryType).toBe(EntryType.directive);

      const directiveEntry = docs[0] as DirectiveEntry;
      expect(directiveEntry.isStandalone).toBe(true);
      expect(directiveEntry.selector).toBe('user-profile');
      expect(directiveEntry.exportAs).toEqual(['userProfile']);
    });

    it('should extract standalone component info', () => {
      env.write('test.ts', `
        import {Component} from '@angular/core';
        @Component({
          standalone: true,
          selector: 'user-profile',
          exportAs: 'userProfile',
          template: '',
        })
        export class UserProfile { }
      `);

      const docs: DocEntry[] = env.driveDocsExtraction();

      expect(docs.length).toBe(1);
      expect(docs[0].entryType).toBe(EntryType.component);

      const componentEntry = docs[0] as DirectiveEntry;
      expect(componentEntry.isStandalone).toBe(true);
      expect(componentEntry.selector).toBe('user-profile');
      expect(componentEntry.exportAs).toEqual(['userProfile']);
    });

    it('should extract NgModule directive info', () => {
      env.write('test.ts', `
        import {Directive, NgModule} from '@angular/core';
        
        @NgModule({declarations: [UserProfile]})
        export class ProfileModule { }
        
        @Directive({
          standalone: false,
          selector: 'user-profile',
          exportAs: 'userProfile',
        })
        export class UserProfile { }
      `);

      const docs: DocEntry[] = env.driveDocsExtraction();

      expect(docs.length).toBe(2);
      expect(docs[1].entryType).toBe(EntryType.directive);

      const directiveEntry = docs[1] as DirectiveEntry;
      expect(directiveEntry.isStandalone).toBe(false);
      expect(directiveEntry.selector).toBe('user-profile');
      expect(directiveEntry.exportAs).toEqual(['userProfile']);
    });

    it('should extract NgModule component info', () => {
      env.write('test.ts', `
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
      `);

      const docs: DocEntry[] = env.driveDocsExtraction();

      expect(docs.length).toBe(2);
      expect(docs[1].entryType).toBe(EntryType.component);

      const componentEntry = docs[1] as DirectiveEntry;
      expect(componentEntry.isStandalone).toBe(false);
      expect(componentEntry.selector).toBe('user-profile');
      expect(componentEntry.exportAs).toEqual(['userProfile']);
    });

    it('should extract input and output info for a directive', () => {
      env.write('test.ts', `
        import {Directive, EventEmitter, Input, Output} from '@angular/core';
        @Directive({
          standalone: true,
          selector: 'user-profile',
          exportAs: 'userProfile',
        })
        export class UserProfile { 
          @Input() name: string = '';
          @Input('first') firstName = '';
          @Output() saved = new EventEmitter();
          @Output('onReset') reset = new EventEmitter();
        }
      `);

      const docs: DocEntry[] = env.driveDocsExtraction();

      expect(docs.length).toBe(1);
      expect(docs[0].entryType).toBe(EntryType.directive);

      const directiveEntry = docs[0] as DirectiveEntry;
      expect(directiveEntry.members.length).toBe(4);

      const [nameEntry, firstNameEntry, savedEntry, resetEntry, ] = directiveEntry.members;

      expect(nameEntry.memberTags).toEqual([MemberTags.input]);
      expect((nameEntry as PropertyEntry).inputAlias).toBe('name');
      expect((nameEntry as PropertyEntry).outputAlias).toBeUndefined();

      expect(firstNameEntry.memberTags).toEqual([MemberTags.input]);
      expect((firstNameEntry as PropertyEntry).inputAlias).toBe('first');
      expect((firstNameEntry as PropertyEntry).outputAlias).toBeUndefined();

      expect(savedEntry.memberTags).toEqual([MemberTags.output]);
      expect((savedEntry as PropertyEntry).outputAlias).toBe('saved');
      expect((savedEntry as PropertyEntry).inputAlias).toBeUndefined();

      expect(resetEntry.memberTags).toEqual([MemberTags.output]);
      expect((resetEntry as PropertyEntry).outputAlias).toBe('onReset');
      expect((resetEntry as PropertyEntry).inputAlias).toBeUndefined();
    });

    it('should extract input and output info for a component', () => {
      env.write('test.ts', `
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
      `);

      const docs: DocEntry[] = env.driveDocsExtraction();

      expect(docs.length).toBe(1);
      expect(docs[0].entryType).toBe(EntryType.component);

      const componentEntry = docs[0] as DirectiveEntry;
      expect(componentEntry.members.length).toBe(4);

      const [nameEntry, firstNameEntry, savedEntry, resetEntry, ] = componentEntry.members;

      expect(nameEntry.memberTags).toEqual([MemberTags.input]);
      expect((nameEntry as PropertyEntry).inputAlias).toBe('name');
      expect((nameEntry as PropertyEntry).outputAlias).toBeUndefined();

      expect(firstNameEntry.memberTags).toEqual([MemberTags.input]);
      expect((firstNameEntry as PropertyEntry).inputAlias).toBe('first');
      expect((firstNameEntry as PropertyEntry).outputAlias).toBeUndefined();

      expect(savedEntry.memberTags).toEqual([MemberTags.output]);
      expect((savedEntry as PropertyEntry).outputAlias).toBe('saved');
      expect((savedEntry as PropertyEntry).inputAlias).toBeUndefined();

      expect(resetEntry.memberTags).toEqual([MemberTags.output]);
      expect((resetEntry as PropertyEntry).outputAlias).toBe('onReset');
      expect((resetEntry as PropertyEntry).inputAlias).toBeUndefined();
    });
  });
});
