/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {WrappedNodeExpr} from '@angular/compiler';
import * as ts from 'typescript';
import {ErrorCode, FatalDiagnosticError, ngErrorCode} from '../../diagnostics';
import {absoluteFrom} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {InjectableClassRegistry} from '../../metadata';
import {NOOP_PERF_RECORDER} from '../../perf';
import {isNamedClassDeclaration, TypeScriptReflectionHost} from '../../reflection';
import {getDeclaration, makeProgram} from '../../testing';
import {InjectableDecoratorHandler} from '../src/injectable';

runInEachFileSystem(() => {
  describe('InjectableDecoratorHandler', () => {
    describe('compile()', () => {
      it('should produce a diagnostic when injectable already has a static ɵprov property (with errorOnDuplicateProv true)',
         () => {
           const {handler, TestClass, ɵprov, analysis} =
               setupHandler(/* errorOnDuplicateProv */ true);
           try {
             handler.compileFull(TestClass, analysis);
             return fail('Compilation should have failed');
           } catch (err) {
             if (!(err instanceof FatalDiagnosticError)) {
               return fail('Error should be a FatalDiagnosticError');
             }
             const diag = err.toDiagnostic();
             expect(diag.code).toEqual(ngErrorCode(ErrorCode.INJECTABLE_DUPLICATE_PROV));
             expect(diag.file.fileName.endsWith('entry.ts')).toBe(true);
             expect(diag.start).toBe(ɵprov.nameNode!.getStart());
           }
         });

      it('should not add new ɵprov property when injectable already has one (with errorOnDuplicateProv false)',
         () => {
           const {handler, TestClass, ɵprov, analysis} =
               setupHandler(/* errorOnDuplicateProv */ false);
           const res = handler.compileFull(TestClass, analysis);
           expect(res).not.toContain(jasmine.objectContaining({name: 'ɵprov'}));
         });
    });

    describe('fix', () => {
      it('should compile dep without Array in @Injectable', () => {
        const {handler, TestClass, reflectionHost} =
            fixHandler(`export const Injectable: any; export const Self: any;`, `
               import { Injectable,Self } from '@angular/core';
               declare const someToken;
               @Injectable({
                 providedIn: 'any',
                 useFactory: (token) => new TestClass(token),
                 deps: [[Self, 'stringToken'], [new Self(), someToken], [1]]
               })
               export class TestClass {
                 constructor(token){}
               }`);
        let detected =
            handler.detect(TestClass, reflectionHost.getDecoratorsOfDeclaration(TestClass));
        if (detected === undefined) {
          throw new Error('Failed to recognize TestClass');
        }
        let {analysis} = handler.analyze(TestClass, detected.metadata);
        if (analysis === undefined) {
          throw new Error('Failed to analyze TestClass');
        }
        if (analysis.meta.deps === undefined) {
          throw new Error('Failed to have deps');
        }
        analysis.meta.deps.forEach((item) => {
          let nodeExpr =
              item.token! as WrappedNodeExpr<ts.Identifier|ts.StringLiteral|ts.NumericLiteral>;
          if (ts.isArrayLiteralExpression(nodeExpr.node)) {
            throw new Error('dep can not be ArrayLiteralExpression!');
          }
          expect(
              ts.isStringLiteral(nodeExpr.node) || ts.isIdentifier(nodeExpr.node) ||
              ts.isNumericLiteral(nodeExpr.node))
              .toBe(true);
        });
      });
    });
  });
});

function setupHandler(errorOnDuplicateProv: boolean) {
  const ENTRY_FILE = absoluteFrom('/entry.ts');
  const ANGULAR_CORE = absoluteFrom('/node_modules/@angular/core/index.d.ts');
  const {program} = makeProgram([
    {
      name: ANGULAR_CORE,
      contents: 'export const Injectable: any; export const ɵɵdefineInjectable: any',
    },
    {
      name: ENTRY_FILE,
      contents: `
        import {Injectable, ɵɵdefineInjectable} from '@angular/core';
        export const TestClassToken = 'TestClassToken';
        @Injectable({providedIn: 'module'})
        export class TestClass {
          static ɵprov = ɵɵdefineInjectable({ factory: () => {}, token: TestClassToken, providedIn: "module" });
        }`
    },
  ]);
  const checker = program.getTypeChecker();
  const reflectionHost = new TypeScriptReflectionHost(checker);
  const injectableRegistry = new InjectableClassRegistry(reflectionHost);
  const handler = new InjectableDecoratorHandler(
      reflectionHost, /* isCore */ false,
      /* strictCtorDeps */ false, injectableRegistry, NOOP_PERF_RECORDER, errorOnDuplicateProv);
  const TestClass = getDeclaration(program, ENTRY_FILE, 'TestClass', isNamedClassDeclaration);
  const ɵprov = reflectionHost.getMembersOfClass(TestClass).find(member => member.name === 'ɵprov');
  if (ɵprov === undefined) {
    throw new Error('TestClass did not contain a `ɵprov` member');
  }
  const detected = handler.detect(TestClass, reflectionHost.getDecoratorsOfDeclaration(TestClass));
  if (detected === undefined) {
    throw new Error('Failed to recognize TestClass');
  }
  const {analysis} = handler.analyze(TestClass, detected.metadata);
  if (analysis === undefined) {
    throw new Error('Failed to analyze TestClass');
  }
  return {handler, TestClass, ɵprov, analysis};
}

function fixHandler(angularCoreContent: string, entryFileContent: string) {
  const ENTRY_FILE = absoluteFrom('/entry.ts');
  const ANGULAR_CORE = absoluteFrom('/node_modules/@angular/core/index.d.ts');
  const {program} = makeProgram([
    {
      name: ANGULAR_CORE,
      contents: angularCoreContent,
    },
    {name: ENTRY_FILE, contents: entryFileContent},
  ]);
  const checker = program.getTypeChecker();
  const reflectionHost = new TypeScriptReflectionHost(checker);
  const injectableRegistry = new InjectableClassRegistry(reflectionHost);
  const handler = new InjectableDecoratorHandler(
      reflectionHost, false, false, injectableRegistry, NOOP_PERF_RECORDER, false);
  const TestClass = getDeclaration(program, ENTRY_FILE, 'TestClass', isNamedClassDeclaration);

  return {TestClass, reflectionHost, handler};
}
