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
  EntryType,
  InterfaceEntry,
  MemberTags,
  MemberType,
  MethodEntry,
  PropertyEntry,
} from '../../../src/ngtsc/docs/src/entities';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../../src/ngtsc/testing';

import {NgtscTestEnvironment} from '../env';

const testFiles = loadStandardTestFiles({fakeCommon: true});

runInEachFileSystem(() => {
  let env!: NgtscTestEnvironment;

  describe('ngtsc interface docs extraction', () => {
    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    it('should extract interfaces', () => {
      env.write(
        'index.ts',
        `
        export interface UserProfile {}

        export interface CustomSlider {}
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(2);
      expect(docs[0].name).toBe('UserProfile');
      expect(docs[0].entryType).toBe(EntryType.Interface);
      expect(docs[1].name).toBe('CustomSlider');
      expect(docs[1].entryType).toBe(EntryType.Interface);
    });

    it('should extract interface members', () => {
      env.write(
        'index.ts',
        `
        export interface UserProfile {
          firstName(): string;
          age: number;
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      const interfaceEntry = docs[0] as InterfaceEntry;
      expect(interfaceEntry.members.length).toBe(2);

      const methodEntry = interfaceEntry.members[0] as MethodEntry;
      expect(methodEntry.memberType).toBe(MemberType.Method);
      expect(methodEntry.name).toBe('firstName');
      expect(methodEntry.implementation.returnType).toBe('string');

      const propertyEntry = interfaceEntry.members[1] as PropertyEntry;
      expect(propertyEntry.memberType).toBe(MemberType.Property);
      expect(propertyEntry.name).toBe('age');
      expect(propertyEntry.type).toBe('number');
    });

    it('should extract call signatures', () => {
      env.write(
        'index.ts',
        `
        export interface UserProfile {
          (name: string): string;
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      const interfaceEntry = docs[0] as InterfaceEntry;
      expect(interfaceEntry.members.length).toBe(1);

      const methodEntry = interfaceEntry.members[0] as MethodEntry;
      expect(methodEntry.memberType).toBe(MemberType.Method);
      expect(methodEntry.name).toBe('');
      expect(methodEntry.implementation.returnType).toBe('string');
    });

    it('should extract a method with a rest parameter', () => {
      env.write(
        'index.ts',
        `
        export interface UserProfile {
          getNames(prefix: string, ...ids: string[]): string[];
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      const interfaceEntry = docs[0] as InterfaceEntry;
      const methodEntry = interfaceEntry.members[0] as MethodEntry;
      const [prefixParamEntry, idsParamEntry] = methodEntry.implementation.params;

      expect(prefixParamEntry.name).toBe('prefix');
      expect(prefixParamEntry.type).toBe('string');
      expect(prefixParamEntry.isRestParam).toBe(false);

      expect(idsParamEntry.name).toBe('ids');
      expect(idsParamEntry.type).toBe('string[]');
      expect(idsParamEntry.isRestParam).toBe(true);
    });

    it('should extract interface method params', () => {
      env.write(
        'index.ts',
        `
        export interface UserProfile {
          setPhone(num: string, area?: string): void;
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      const interfaceEntry = docs[0] as InterfaceEntry;
      expect(interfaceEntry.members.length).toBe(1);

      const methodEntry = interfaceEntry.members[0] as MethodEntry;
      expect(methodEntry.memberType).toBe(MemberType.Method);
      expect(methodEntry.name).toBe('setPhone');
      expect(methodEntry.implementation.params.length).toBe(2);

      const [numParam, areaParam] = methodEntry.implementation.params;
      expect(numParam.name).toBe('num');
      expect(numParam.isOptional).toBe(false);
      expect(numParam.type).toBe('string');

      expect(areaParam.name).toBe('area');
      expect(areaParam.isOptional).toBe(true);
      expect(areaParam.type).toBe('string | undefined');
    });

    it('should not extract private interface members', () => {
      env.write(
        'index.ts',
        `
        export interface UserProfile {
            private ssn: string;
            private getSsn(): string;
            private static printSsn(): void;
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      const interfaceEntry = docs[0] as InterfaceEntry;
      expect(interfaceEntry.members.length).toBe(0);
    });

    it('should extract member tags', () => {
      // Test both properties and methods with zero, one, and multiple tags.
      env.write(
        'index.ts',
        `
        export interface UserProfile {
            eyeColor: string;
            protected name: string;
            readonly age: number;
            address?: string;
            static country: string;
            protected readonly birthday: string;

            getEyeColor(): string;
            protected getName(): string;
            getAge?(): number;
            static getCountry(): string;
            protected getBirthday?(): string;
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      const interfaceEntry = docs[0] as InterfaceEntry;
      expect(interfaceEntry.members.length).toBe(11);

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
      ] = interfaceEntry.members;

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
      env.write(
        'index.ts',
        `
        export interface UserProfile {
          get userId(): number;

          get userName(): string;
          set userName(value: string);

          set isAdmin(value: boolean);
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      const interfaceEntry = docs[0] as InterfaceEntry;
      expect(interfaceEntry.entryType).toBe(EntryType.Interface);

      expect(interfaceEntry.members.length).toBe(4);

      const [userIdGetter, userNameGetter, userNameSetter, isAdminSetter] = interfaceEntry.members;

      expect(userIdGetter.name).toBe('userId');
      expect(userIdGetter.memberType).toBe(MemberType.Getter);
      expect(userNameGetter.name).toBe('userName');
      expect(userNameGetter.memberType).toBe(MemberType.Getter);
      expect(userNameSetter.name).toBe('userName');
      expect(userNameSetter.memberType).toBe(MemberType.Setter);
      expect(isAdminSetter.name).toBe('isAdmin');
      expect(isAdminSetter.memberType).toBe(MemberType.Setter);
    });

    it('should extract inherited members', () => {
      env.write(
        'index.ts',
        `
        interface Ancestor {
          id: string;
          value: string|number;

          save(value: string|number): string|number;
        }

        interface Parent extends Ancestor {
          name: string;
        }

        export interface Child extends Parent {
          age: number;
          value: number;

          save(value: number): number;
          save(value: string|number): string|number;
        }`,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const interfaceEntry = docs[0] as InterfaceEntry;
      expect(interfaceEntry.members.length).toBe(6);

      const [ageEntry, valueEntry, numberSaveEntry, unionSaveEntry, nameEntry, idEntry] =
        interfaceEntry.members;

      expect(ageEntry.name).toBe('age');
      expect(ageEntry.memberType).toBe(MemberType.Property);
      expect((ageEntry as PropertyEntry).type).toBe('number');
      expect(ageEntry.memberTags).not.toContain(MemberTags.Inherited);

      expect(valueEntry.name).toBe('value');
      expect(valueEntry.memberType).toBe(MemberType.Property);
      expect((valueEntry as PropertyEntry).type).toBe('number');
      expect(valueEntry.memberTags).not.toContain(MemberTags.Inherited);

      expect(numberSaveEntry.name).toBe('save');
      expect(numberSaveEntry.memberType).toBe(MemberType.Method);
      expect((numberSaveEntry as MethodEntry).implementation.returnType).toBe('number');
      expect(numberSaveEntry.memberTags).not.toContain(MemberTags.Inherited);

      expect(unionSaveEntry.name).toBe('save');
      expect(unionSaveEntry.memberType).toBe(MemberType.Method);
      expect((unionSaveEntry as MethodEntry).implementation.returnType).toBe('string | number');
      expect(unionSaveEntry.memberTags).not.toContain(MemberTags.Inherited);

      expect(nameEntry.name).toBe('name');
      expect(nameEntry.memberType).toBe(MemberType.Property);
      expect((nameEntry as PropertyEntry).type).toBe('string');
      expect(nameEntry.memberTags).toContain(MemberTags.Inherited);

      expect(idEntry.name).toBe('id');
      expect(idEntry.memberType).toBe(MemberType.Property);
      expect((idEntry as PropertyEntry).type).toBe('string');
      expect(idEntry.memberTags).toContain(MemberTags.Inherited);
    });

    it('should extract inherited getters/setters', () => {
      env.write(
        'index.ts',
        `
        interface Ancestor {
          get name(): string;
          set name(v: string);

          get id(): string;
          set id(v: string);

          get age(): number;
          set age(v: number);
        }

        interface Parent extends Ancestor {
          name: string;
        }

        export interface Child extends Parent {
          get id(): string;
        }`,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const interfaceEntry = docs[0] as InterfaceEntry;
      expect(interfaceEntry.members.length).toBe(4);

      const [idEntry, nameEntry, ageGetterEntry, ageSetterEntry] =
        interfaceEntry.members as PropertyEntry[];

      // When the child interface overrides an accessor pair with another accessor, it overrides
      // *both* the getter and the setter, resulting (in this case) in just a getter.
      expect(idEntry.name).toBe('id');
      expect(idEntry.memberType).toBe(MemberType.Getter);
      expect((idEntry as PropertyEntry).type).toBe('string');
      expect(idEntry.memberTags).not.toContain(MemberTags.Inherited);

      // When the child interface overrides an accessor with a property, the property takes
      // precedence.
      expect(nameEntry.name).toBe('name');
      expect(nameEntry.memberType).toBe(MemberType.Property);
      expect(nameEntry.type).toBe('string');
      expect(nameEntry.memberTags).toContain(MemberTags.Inherited);

      expect(ageGetterEntry.name).toBe('age');
      expect(ageGetterEntry.memberType).toBe(MemberType.Getter);
      expect(ageGetterEntry.type).toBe('number');
      expect(ageGetterEntry.memberTags).toContain(MemberTags.Inherited);

      expect(ageSetterEntry.name).toBe('age');
      expect(ageSetterEntry.memberType).toBe(MemberType.Setter);
      expect(ageSetterEntry.type).toBe('number');
      expect(ageSetterEntry.memberTags).toContain(MemberTags.Inherited);
    });
  });
});
