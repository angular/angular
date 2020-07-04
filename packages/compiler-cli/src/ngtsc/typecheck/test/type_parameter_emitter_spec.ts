/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {absoluteFrom} from '../../file_system';
import {runInEachFileSystem, TestFile} from '../../file_system/testing';
import {isNamedClassDeclaration, TypeScriptReflectionHost} from '../../reflection';
import {getDeclaration, makeProgram} from '../../testing';
import {TypeParameterEmitter} from '../src/type_parameter_emitter';

import {angularCoreDts} from './test_utils';


runInEachFileSystem(() => {
  describe('type parameter emitter', () => {
    function createEmitter(source: string, additionalFiles: TestFile[] = []) {
      const files: TestFile[] = [
        angularCoreDts(), {name: absoluteFrom('/main.ts'), contents: source}, ...additionalFiles
      ];
      const {program} = makeProgram(files, undefined, undefined, false);
      const checker = program.getTypeChecker();
      const reflector = new TypeScriptReflectionHost(checker);

      const TestClass =
          getDeclaration(program, absoluteFrom('/main.ts'), 'TestClass', isNamedClassDeclaration);

      return new TypeParameterEmitter(TestClass.typeParameters, reflector);
    }

    function emit(emitter: TypeParameterEmitter) {
      const emitted = emitter.emit(ref => {
        const typeName = ts.createQualifiedName(ts.createIdentifier('test'), ref.debugName!);
        return ts.createTypeReferenceNode(typeName, /* typeArguments */ undefined);
      });

      if (emitted === undefined) {
        return '';
      }

      const printer = ts.createPrinter();
      const sf = ts.createSourceFile('test.ts', '', ts.ScriptTarget.Latest);
      const generics =
          emitted.map(param => printer.printNode(ts.EmitHint.Unspecified, param, sf)).join(', ');

      return `<${generics}>`;
    }

    it('can emit for simple generic types', () => {
      expect(emit(createEmitter(`export class TestClass {}`))).toEqual('');
      expect(emit(createEmitter(`export class TestClass<T> {}`))).toEqual('<T>');
      expect(emit(createEmitter(`export class TestClass<T extends any> {}`)))
          .toEqual('<T extends any>');
      expect(emit(createEmitter(`export class TestClass<T extends unknown> {}`)))
          .toEqual('<T extends unknown>');
      expect(emit(createEmitter(`export class TestClass<T extends string> {}`)))
          .toEqual('<T extends string>');
      expect(emit(createEmitter(`export class TestClass<T extends number> {}`)))
          .toEqual('<T extends number>');
      expect(emit(createEmitter(`export class TestClass<T extends boolean> {}`)))
          .toEqual('<T extends boolean>');
      expect(emit(createEmitter(`export class TestClass<T extends object> {}`)))
          .toEqual('<T extends object>');
      expect(emit(createEmitter(`export class TestClass<T extends null> {}`)))
          .toEqual('<T extends null>');
      expect(emit(createEmitter(`export class TestClass<T extends undefined> {}`)))
          .toEqual('<T extends undefined>');
      expect(emit(createEmitter(`export class TestClass<T extends string[]> {}`)))
          .toEqual('<T extends string[]>');
    });

    it('can emit references into external modules', () => {
      const emitter = createEmitter(`
          import {NgIterable} from '@angular/core';

          export class TestClass<T extends NgIterable<any>> {}`);

      expect(emitter.canEmit()).toBe(true);
      expect(emit(emitter)).toEqual('<T extends test.NgIterable<any>>');
    });

    it('can emit references into external modules using qualified name', () => {
      const emitter = createEmitter(`
          import * as ng from '@angular/core';

          export class TestClass<T extends ng.NgIterable<any>> {}`);

      expect(emitter.canEmit()).toBe(true);
      expect(emit(emitter)).toEqual('<T extends test.NgIterable<any>>');
    });

    it('can emit references to other type parameters', () => {
      const emitter = createEmitter(`
          import {NgIterable} from '@angular/core';

          export class TestClass<T, U extends NgIterable<T>> {}`);

      expect(emitter.canEmit()).toBe(true);
      expect(emit(emitter)).toEqual('<T, U extends test.NgIterable<T>>');
    });

    it('cannot emit references to local declarations', () => {
      const emitter = createEmitter(`
          export class Local {};
          export class TestClass<T extends Local> {}`);

      expect(emitter.canEmit()).toBe(false);
      expect(() => emit(emitter))
          .toThrowError('A type reference to emit must be imported from an absolute module');
    });

    it('cannot emit references to local declarations as nested type arguments', () => {
      const emitter = createEmitter(`
          import {NgIterable} from '@angular/core';

          export class Local {};
          export class TestClass<T extends NgIterable<Local>> {}`);

      expect(emitter.canEmit()).toBe(false);
      expect(() => emit(emitter))
          .toThrowError('A type reference to emit must be imported from an absolute module');
    });

    it('can emit references into external modules within array types', () => {
      const emitter = createEmitter(`
          import {NgIterable} from '@angular/core';

          export class TestClass<T extends NgIterable[]> {}`);

      expect(emitter.canEmit()).toBe(true);
      expect(emit(emitter)).toEqual('<T extends test.NgIterable[]>');
    });

    it('cannot emit references to local declarations within array types', () => {
      const emitter = createEmitter(`
          export class Local {};
          export class TestClass<T extends Local[]> {}`);

      expect(emitter.canEmit()).toBe(false);
      expect(() => emit(emitter))
          .toThrowError('A type reference to emit must be imported from an absolute module');
    });

    it('cannot emit references into relative files', () => {
      const additionalFiles: TestFile[] = [{
        name: absoluteFrom('/internal.ts'),
        contents: `export class Internal {}`,
      }];
      const emitter = createEmitter(
          `
          import {Internal} from './internal';

          export class TestClass<T extends Internal> {}`,
          additionalFiles);

      expect(emitter.canEmit()).toBe(false);
      expect(() => emit(emitter))
          .toThrowError('A type reference to emit must be imported from an absolute module');
    });

    it('can emit references to interfaces', () => {
      const additionalFiles: TestFile[] = [{
        name: absoluteFrom('/node_modules/types/index.d.ts'),
        contents: `export declare interface MyInterface {}`,
      }];
      const emitter = createEmitter(
          `
          import {MyInterface} from 'types';

          export class TestClass<T extends MyInterface> {}`,
          additionalFiles);

      expect(emitter.canEmit()).toBe(true);
      expect(emit(emitter)).toEqual('<T extends test.MyInterface>');
    });

    it('can emit references to enums', () => {
      const additionalFiles: TestFile[] = [{
        name: absoluteFrom('/node_modules/types/index.d.ts'),
        contents: `export declare enum MyEnum {}`,
      }];
      const emitter = createEmitter(
          `
          import {MyEnum} from 'types';

          export class TestClass<T extends MyEnum> {}`,
          additionalFiles);

      expect(emitter.canEmit()).toBe(true);
      expect(emit(emitter)).toEqual('<T extends test.MyEnum>');
    });

    it('can emit references to type aliases', () => {
      const additionalFiles: TestFile[] = [{
        name: absoluteFrom('/node_modules/types/index.d.ts'),
        contents: `export declare type MyType = string;`,
      }];
      const emitter = createEmitter(
          `
          import {MyType} from 'types';

          export class TestClass<T extends MyType> {}`,
          additionalFiles);

      expect(emitter.canEmit()).toBe(true);
      expect(emit(emitter)).toEqual('<T extends test.MyType>');
    });
  });
});
