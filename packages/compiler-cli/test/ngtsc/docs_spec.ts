/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DocEntry} from '@angular/compiler-cli/src/ngtsc/docs';
import {ClassEntry, EntryType, MemberTags, MemberType, MethodEntry, PropertyEntry} from '@angular/compiler-cli/src/ngtsc/docs/src/entities';
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
  });
});
