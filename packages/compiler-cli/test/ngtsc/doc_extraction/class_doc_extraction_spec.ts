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

  describe('ngtsc class docs extraction', () => {
    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    it('should extract classes', () => {
      env.write(
        'index.ts',
        `
        export class UserProfile {}

        export class CustomSlider {}
      `,
      );

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

    it('should extract class constructor', () => {
      env.write(
        'index.ts',
        `
        export class UserProfile {
          constructor(foo: number) {}
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.members.length).toBe(1);

      const methodEntry = classEntry.members[0] as MethodEntry;
      expect(methodEntry.memberType).toBe(MemberType.Method);
      expect(methodEntry.name).toBe('constructor');
      expect(methodEntry.implementation.params.length).toBe(1);
      expect(methodEntry.implementation.params[0].name).toBe('foo');
      expect(methodEntry.implementation.params[0].type).toBe('number');
    });

    it('should extract class constructor with overloads', () => {
      env.write(
        'index.ts',
        `
        export class UserProfile {
            constructor(value: boolean);
            constructor(value: number);
            constructor(value: number | boolean | string) { }
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.members.length).toBe(1);

      const constructorEntry = classEntry.members[0] as MethodEntry;

      expect(constructorEntry.signatures.length).toBe(2);

      const [booleanOverloadEntry, numberOverloadEntry] = constructorEntry.signatures;

      expect(booleanOverloadEntry.name).toBe('constructor');
      expect(booleanOverloadEntry.params.length).toBe(1);
      expect(booleanOverloadEntry.params[0].type).toBe('boolean');
      expect(booleanOverloadEntry.returnType).toBe('UserProfile');

      expect(numberOverloadEntry.name).toBe('constructor');
      expect(numberOverloadEntry.params.length).toBe(1);
      expect(numberOverloadEntry.params[0].type).toBe('number');
      expect(numberOverloadEntry.returnType).toBe('UserProfile');
    });

    it('should extract class members', () => {
      env.write(
        'index.ts',
        `
        export class UserProfile {
          firstName(): string { return 'Morgan'; }
          age: number = 25;
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.members.length).toBe(2);

      const methodEntry = classEntry.members[0] as MethodEntry;
      expect(methodEntry.memberType).toBe(MemberType.Method);
      expect(methodEntry.name).toBe('firstName');
      expect(methodEntry.implementation.returnType).toBe('string');
      expect(methodEntry.signatures[0].returnType).toBe('string');

      const propertyEntry = classEntry.members[1] as PropertyEntry;
      expect(propertyEntry.memberType).toBe(MemberType.Property);
      expect(propertyEntry.name).toBe('age');
      expect(propertyEntry.type).toBe('number');
    });

    it('should extract methods with overloads', () => {
      env.write(
        'index.ts',
        `
        export class UserProfile {
          ident(value: boolean): boolean
          ident(value: number): number
          ident(value: number|boolean|string): number|boolean {
            return 0;
          }
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.members.length).toBe(1);

      const [booleanOverloadEntry, numberOverloadEntry] = (classEntry.members[0] as MethodEntry)
        .signatures;

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
      env.write(
        'index.ts',
        `
        export class UserProfile {
          ɵfirstName(): string { return 'Morgan'; }
          _age: number = 25;
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.members.length).toBe(0);
    });

    it('should extract a method with a rest parameter', () => {
      env.write(
        'index.ts',
        `
        export class UserProfile {
          getNames(prefix: string, ...ids: string[]): string[] {
            return [];
          }
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      const classEntry = docs[0] as ClassEntry;
      const methodEntry = classEntry.members[0] as MethodEntry;
      const [prefixParamEntry, idsParamEntry] = methodEntry.implementation.params;

      expect(prefixParamEntry.name).toBe('prefix');
      expect(prefixParamEntry.type).toBe('string');
      expect(prefixParamEntry.isRestParam).toBe(false);

      expect(idsParamEntry.name).toBe('ids');
      expect(idsParamEntry.type).toBe('string[]');
      expect(idsParamEntry.isRestParam).toBe(true);
    });

    it('should extract class method params', () => {
      env.write(
        'index.ts',
        `
        export class UserProfile {
          setPhone(num: string, intl: number = 1, area?: string): void {}
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.members.length).toBe(1);

      const methodEntry = classEntry.members[0] as MethodEntry;
      expect(methodEntry.memberType).toBe(MemberType.Method);
      expect(methodEntry.name).toBe('setPhone');
      expect(methodEntry.implementation.params.length).toBe(3);

      const [numParam, intlParam, areaParam] = methodEntry.implementation.params;
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
      env.write(
        'index.ts',
        `
        export class UserProfile {
            private ssn: string;
            private getSsn(): string { return ''; }
            private static printSsn(): void { }
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.members.length).toBe(0);
    });

    it('should extract member tags', () => {
      // Test both properties and methods with zero, one, and multiple tags.
      env.write(
        'index.ts',
        `
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
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.members.length).toBe(11);

      const [
        eyeColorMember,
        nameMember,
        ageMember,
        addressMember,
        birthdayMember,
        getEyeColorMember,
        getNameMember,
        getAgeMember,
        getBirthdayMember,
        countryMember,
        getCountryMember,
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

    it('should extract member tags', () => {
      // Test both properties and methods with zero, one, and multiple tags.
      env.write(
        'index.ts',
        `
        export class UserProfile {
            eyeColor = 'brown';

            /** @internal */
            uuid: string;

            // @internal
            foreignId: string;

            /** @internal */
            _doSomething() {}

            // @internal
            _doSomethingElse() {}
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');

      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.members.length).toBe(1);

      const [eyeColorMember] = classEntry.members;

      // Properties
      expect(eyeColorMember.memberTags.length).toBe(0);
    });

    it('should extract getters and setters', () => {
      // Test getter-only, a getter + setter, and setter-only.
      env.write(
        'index.ts',
        `
        export class UserProfile {
          get userId(): number { return 123; }

          get userName(): string { return 'Morgan'; }
          set userName(value: string) { }

          set isAdmin(value: boolean) { }
        }
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.entryType).toBe(EntryType.UndecoratedClass);

      expect(classEntry.members.length).toBe(4);

      const [userIdGetter, userNameGetter, userNameSetter, isAdminSetter] = classEntry.members;

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
      env.write(
        'index.ts',
        `
        export abstract class UserProfile {
          firstName: string;
          abstract lastName: string;

          save(): void { }
          abstract reset(): void;
        }`,
      );

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

    it('should extract only once, when discovering abstract methods with overloads ', () => {
      env.write(
        'index.ts',
        `
        export abstract class UserProfile {
          firstName: string;

          abstract get(key: string): string;
          abstract get(key: string|undefined): string|undefined;
          abstract get(key: undefined): undefined;

          save(): void { }
          abstract reset(): void;
        }`,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.isAbstract).toBe(true);
      expect(classEntry.members.length).toBe(4);

      const [firstNameEntry, getEntry, saveEntry, resetEntry] = classEntry.members;

      expect(firstNameEntry.name).toBe('firstName');
      expect(firstNameEntry.memberTags).not.toContain(MemberTags.Abstract);

      expect(getEntry.name).toBe('get');
      expect(getEntry.memberTags).toContain(MemberTags.Abstract);

      expect(saveEntry.name).toBe('save');
      expect(saveEntry.memberTags).not.toContain(MemberTags.Abstract);

      expect(resetEntry.name).toBe('reset');
      expect(resetEntry.memberTags).toContain(MemberTags.Abstract);
    });

    it('should extract class generic parameters', () => {
      env.write(
        'index.ts',
        `
        export class UserProfile<T> {
          constructor(public name: T) { }
        }

        export class TwinProfile<U, V> {
          constructor(public name: U, age: V) { }
        }

        export class AdminProfile<X extends String> {
          constructor(public name: X) { }
        }

        export class BotProfile<Q = string> {
          constructor(public name: Q) { }
        }

        export class ExecProfile<W extends String = string> {
          constructor(public name: W) { }
        }`,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(5);

      const [
        userProfileEntry,
        twinProfileEntry,
        adminProfileEntry,
        botProfileEntry,
        execProfileEntry,
      ] = docs as ClassEntry[];

      expect(userProfileEntry.generics.length).toBe(1);
      expect(twinProfileEntry.generics.length).toBe(2);
      expect(adminProfileEntry.generics.length).toBe(1);
      expect(botProfileEntry.generics.length).toBe(1);
      expect(execProfileEntry.generics.length).toBe(1);

      const [userProfileGenericEntry] = userProfileEntry.generics;
      expect(userProfileGenericEntry.name).toBe('T');
      expect(userProfileGenericEntry.constraint).toBeUndefined();
      expect(userProfileGenericEntry.default).toBeUndefined();

      const [nameGenericEntry, ageGenericEntry] = twinProfileEntry.generics;
      expect(nameGenericEntry.name).toBe('U');
      expect(nameGenericEntry.constraint).toBeUndefined();
      expect(nameGenericEntry.default).toBeUndefined();
      expect(ageGenericEntry.name).toBe('V');
      expect(ageGenericEntry.constraint).toBeUndefined();
      expect(ageGenericEntry.default).toBeUndefined();

      const [adminProfileGenericEntry] = adminProfileEntry.generics;
      expect(adminProfileGenericEntry.name).toBe('X');
      expect(adminProfileGenericEntry.constraint).toBe('String');
      expect(adminProfileGenericEntry.default).toBeUndefined();

      const [botProfileGenericEntry] = botProfileEntry.generics;
      expect(botProfileGenericEntry.name).toBe('Q');
      expect(botProfileGenericEntry.constraint).toBeUndefined();
      expect(botProfileGenericEntry.default).toBe('string');

      const [execProfileGenericEntry] = execProfileEntry.generics;
      expect(execProfileGenericEntry.name).toBe('W');
      expect(execProfileGenericEntry.constraint).toBe('String');
      expect(execProfileGenericEntry.default).toBe('string');
    });

    it('should extract method generic parameters', () => {
      env.write(
        'index.ts',
        `
        export class UserProfile {
          save<T>(data: T): void { }
        }`,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const classEntry = docs[0] as ClassEntry;
      const [genericEntry] = (classEntry.members[0] as MethodEntry).implementation.generics;

      expect(genericEntry.name).toBe('T');
      expect(genericEntry.constraint).toBeUndefined();
      expect(genericEntry.default).toBeUndefined();
    });

    it('should extract inheritence/interface conformance', () => {
      env.write(
        'index.ts',
        `
          interface Foo {}
          interface Bar {}

          class Parent extends Ancestor {}

          export class Child extends Parent implements Foo, Bar {}
        `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.extends).toBe('Parent');
      expect(classEntry.implements).toEqual(['Foo', 'Bar']);
    });

    it('should extract inherited members', () => {
      env.write(
        'index.ts',
        `
        class Ancestor {
          id: string;
          value: string|number;

          save(value: string|number): string|number { return 0; }
        }

        class Parent extends Ancestor {
          name: string;
        }

        export class Child extends Parent {
          age: number;
          value: number;

          save(value: number): number;
          save(value: string|number): string|number { return 0; }
        }`,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.members.length).toBe(5);

      const [ageEntry, valueEntry, childSaveEntry, nameEntry, idEntry] = classEntry.members;

      expect(ageEntry.name).toBe('age');
      expect(ageEntry.memberType).toBe(MemberType.Property);
      expect((ageEntry as PropertyEntry).type).toBe('number');
      expect(ageEntry.memberTags).not.toContain(MemberTags.Inherited);

      expect(valueEntry.name).toBe('value');
      expect(valueEntry.memberType).toBe(MemberType.Property);
      expect((valueEntry as PropertyEntry).type).toBe('number');
      expect(valueEntry.memberTags).not.toContain(MemberTags.Inherited);

      expect(childSaveEntry.name).toBe('save');
      expect(childSaveEntry.memberType).toBe(MemberType.Method);
      expect((childSaveEntry as MethodEntry).implementation.returnType).toBe('string | number');
      expect(childSaveEntry.memberTags).not.toContain(MemberTags.Inherited);

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
        class Ancestor {
          get name(): string { return ''; }
          set name(v: string) { }

          get id(): string { return ''; }
          set id(v: string) { }

          get age(): number { return 0; }
          set age(v: number) { }
        }

        class Parent extends Ancestor {
          name: string;
        }

        export class Child extends Parent {
          get id(): string { return ''; }
        }`,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.members.length).toBe(4);

      const [idEntry, nameEntry, ageGetterEntry, ageSetterEntry] =
        classEntry.members as PropertyEntry[];

      // When the child class overrides an accessor pair with another accessor, it overrides
      // *both* the getter and the setter, resulting (in this case) in just a getter.
      expect(idEntry.name).toBe('id');
      expect(idEntry.memberType).toBe(MemberType.Getter);
      expect((idEntry as PropertyEntry).type).toBe('string');
      expect(idEntry.memberTags).not.toContain(MemberTags.Inherited);

      // When the child class overrides an accessor with a property, the property takes precedence.
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

    it('should extract public constructor parameters', () => {
      env.write(
        'index.ts',
        `
        export class MyClass {
          myProp: string;

          constructor(public foo: string, private: bar: string, protected: baz: string) {}
        }`,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);

      const classEntry = docs[0] as ClassEntry;

      // constructor, myProp, foo (others are non-public)
      expect(classEntry.members.length).toBe(3);

      const [constructorEntry, myPropEntry, fooEntry] = classEntry.members as PropertyEntry[];

      expect(constructorEntry.name).toBe('constructor');
      expect(constructorEntry.memberType).toBe(MemberType.Method);

      expect(myPropEntry.name).toBe('myProp');
      expect(myPropEntry.memberType).toBe(MemberType.Property);
      expect((myPropEntry as PropertyEntry).type).toBe('string');

      expect(fooEntry.name).toBe('foo');
      expect(fooEntry.memberType).toBe(MemberType.Property);
      expect((fooEntry as PropertyEntry).type).toBe('string');
    });

    it('should not extract a constructor without parameters', () => {
      env.write(
        'index.ts',
        `
        export class MyClass {
          constructor() {}

          foo: string;
        }`,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(1);
      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.members.length).toBe(1); // only foo, no constructor
      const [fooEntry] = classEntry.members as PropertyEntry[];
      expect(fooEntry.name).toBe('foo');
    });

    it('should extract members of a class from .d.ts', () => {
      env.write(
        'index.d.ts',
        `
        export declare class UserProfile {
          firstName: string;
          save(): void;
        }`,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.d.ts');
      expect(docs.length).toBe(1);

      const classEntry = docs[0] as ClassEntry;
      expect(classEntry.members.length).toBe(2);

      const [firstNameEntry, saveEntry] = classEntry.members;

      expect(firstNameEntry.name).toBe('firstName');
      expect(saveEntry.name).toBe('save');
    });
  });
});
