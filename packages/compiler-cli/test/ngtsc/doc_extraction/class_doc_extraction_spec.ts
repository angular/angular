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

import {NgtscTestEnvironment} from '../env';

const testFiles = loadStandardTestFiles({fakeCore: true, fakeCommon: true});

runInEachFileSystem(os => {
  let env!: NgtscTestEnvironment;

  describe('ngtsc class docs extraction', () => {
    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    it('should extract classes', () => {
      env.write('index.ts', `
        export class UserProfile {}

        export class CustomSlider {}
      `);

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(2);

      const [userProfileEntry, customSliderEntry] = docs as ClassEntry[];

      expect(userProfileEntry.name).toBe('UserProfile');
      expect(userProfileEntry.isAbstract).toBe(false);
      expect(userProfileEntry.entryType).toBe(EntryType.UndecoratedClass);

      expect(customSliderEntry.name).toBe('CustomSlider');
      expect(customSliderEntry.isAbstract).toBe(false);
      expect(customSliderEntry.entryType).toBe(EntryType.UndecoratedClass);
    });

    it('should extract class members', () => {
      env.write('index.ts', `
        export class UserProfile {
          firstName(): string { return 'Morgan'; }
          age: number = 25;
        }
      `);

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.members.length).toBe(2);

      const methodEntry = classEntry.members[0] as MethodEntry;
      expect(methodEntry.memberType).toBe(MemberType.Method);
      expect(methodEntry.name).toBe('firstName');
      expect(methodEntry.returnType).toBe('string');

      const propertyEntry = classEntry.members[1] as PropertyEntry;
      expect(propertyEntry.memberType).toBe(MemberType.Property);
      expect(propertyEntry.name).toBe('age');
      expect(propertyEntry.type).toBe('number');
    });

    it('should extract methods with overloads', () => {
      env.write('index.ts', `
        export class UserProfile {
          ident(value: boolean): boolean
          ident(value: number): number
          ident(value: number|boolean): number|boolean {
            return value;
          }
        }
      `);

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.members.length).toBe(2);

      const [booleanOverloadEntry, numberOverloadEntry] = classEntry.members as MethodEntry[];

      expect(booleanOverloadEntry.name).toBe('ident');
      expect(booleanOverloadEntry.params.length).toBe(1);
      expect(booleanOverloadEntry.params[0].type).toBe('boolean');
      expect(booleanOverloadEntry.returnType).toBe('boolean');

      expect(numberOverloadEntry.name).toBe('ident');
      expect(numberOverloadEntry.params.length).toBe(1);
      expect(numberOverloadEntry.params[0].type).toBe('number');
      expect(numberOverloadEntry.returnType).toBe('number');
    });

    it('should not extract Angular-internal members', () => {
      env.write('index.ts', `
        export class UserProfile {
          ɵfirstName(): string { return 'Morgan'; }
          _age: number = 25;
        }
      `);

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.members.length).toBe(0);
    });

    it('should extract a method with a rest parameter', () => {
      env.write('index.ts', `
        export class UserProfile {            
          getNames(prefix: string, ...ids: string[]): string[] {
            return [];
          }
        }
      `);

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      const classEntry = docs[0] as ClassEntry;
      const methodEntry = classEntry.members[0] as MethodEntry;
      const [prefixParamEntry, idsParamEntry, ] = methodEntry.params;

      expect(prefixParamEntry.name).toBe('prefix');
      expect(prefixParamEntry.type).toBe('string');
      expect(prefixParamEntry.isRestParam).toBe(false);

      expect(idsParamEntry.name).toBe('ids');
      expect(idsParamEntry.type).toBe('string[]');
      expect(idsParamEntry.isRestParam).toBe(true);
    });

    it('should extract class method params', () => {
      env.write('index.ts', `
        export class UserProfile {
          setPhone(num: string, intl: number = 1, area?: string): void {}
        }
      `);

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.members.length).toBe(1);

      const methodEntry = classEntry.members[0] as MethodEntry;
      expect(methodEntry.memberType).toBe(MemberType.Method);
      expect(methodEntry.name).toBe('setPhone');
      expect(methodEntry.params.length).toBe(3);

      const [numParam, intlParam, areaParam] = methodEntry.params;
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

    it('should not extract private class members', () => {
      env.write('index.ts', `
        export class UserProfile {
            private ssn: string;
            private getSsn(): string { return ''; }
            private static printSsn(): void { }
        }
      `);

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.members.length).toBe(0);
    });

    it('should extract member tags', () => {
      // Test both properties and methods with zero, one, and multiple tags.
      env.write('index.ts', `
        export class UserProfile {            
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

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

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
      expect(nameMember.memberTags).toEqual([MemberTags.Protected]);
      expect(ageMember.memberTags).toEqual([MemberTags.Readonly]);
      expect(addressMember.memberTags).toEqual([MemberTags.Optional]);
      expect(countryMember.memberTags).toEqual([MemberTags.Static]);
      expect(birthdayMember.memberTags).toContain(MemberTags.Protected);
      expect(birthdayMember.memberTags).toContain(MemberTags.Readonly);

      // Methods
      expect(getEyeColorMember.memberTags.length).toBe(0);
      expect(getNameMember.memberTags).toEqual([MemberTags.Protected]);
      expect(getAgeMember.memberTags).toEqual([MemberTags.Optional]);
      expect(getCountryMember.memberTags).toEqual([MemberTags.Static]);
      expect(getBirthdayMember.memberTags).toContain(MemberTags.Protected);
      expect(getBirthdayMember.memberTags).toContain(MemberTags.Optional);
    });

    it('should extract getters and setters', () => {
      // Test getter-only, a getter + setter, and setter-only.
      env.write('index.ts', `
        export class UserProfile {            
          get userId(): number { return 123; }
          
          get userName(): string { return 'Morgan'; }
          set userName(value: string) { }
          
          set isAdmin(value: boolean) { }
        }
      `);

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.entryType).toBe(EntryType.UndecoratedClass);

      expect(classEntry.members.length).toBe(4);

      const [userIdGetter, userNameGetter, userNameSetter, isAdminSetter, ] = classEntry.members;

      expect(userIdGetter.name).toBe('userId');
      expect(userIdGetter.memberType).toBe(MemberType.Getter);
      expect(userNameGetter.name).toBe('userName');
      expect(userNameGetter.memberType).toBe(MemberType.Getter);
      expect(userNameSetter.name).toBe('userName');
      expect(userNameSetter.memberType).toBe(MemberType.Setter);
      expect(isAdminSetter.name).toBe('isAdmin');
      expect(isAdminSetter.memberType).toBe(MemberType.Setter);
    });

    it('should extract abstract classes', () => {
      env.write('index.ts', `
        export abstract class UserProfile {
          firstName: string;
          abstract lastName: string;

          save(): void { }
          abstract reset(): void;
        }`);

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.isAbstract).toBe(true);
      expect(classEntry.members.length).toBe(4);

      const [firstNameEntry, latsNameEntry, saveEntry, resetEntry] = classEntry.members;

      expect(firstNameEntry.name).toBe('firstName');
      expect(firstNameEntry.memberTags).not.toContain(MemberTags.Abstract);

      expect(latsNameEntry.name).toBe('lastName');
      expect(latsNameEntry.memberTags).toContain(MemberTags.Abstract);

      expect(saveEntry.name).toBe('save');
      expect(saveEntry.memberTags).not.toContain(MemberTags.Abstract);

      expect(resetEntry.name).toBe('reset');
      expect(resetEntry.memberTags).toContain(MemberTags.Abstract);
    });
  });
});
