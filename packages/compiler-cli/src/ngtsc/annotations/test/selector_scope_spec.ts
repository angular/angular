/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {AbsoluteModuleStrategy, LocalIdentifierStrategy, LogicalProjectStrategy, Reference, ReferenceEmitter} from '../../imports';
import {LogicalFileSystem} from '../../path';
import {TypeScriptReflectionHost} from '../../reflection';
import {getDeclaration, makeProgram} from '../../testing/in_memory_typescript';
import {getRootDirs} from '../../util/src/typescript';
import {SelectorScopeRegistry} from '../src/selector_scope';

describe('SelectorScopeRegistry', () => {
  it('absolute imports work', () => {
    const {program, options, host} = makeProgram([
      {
        name: 'node_modules/@angular/core/index.d.ts',
        contents: `
        export interface NgComponentDefWithMeta<A, B, C, D, E, F> {}
        export interface NgModuleDef<A, B, C, D> {}
      `
      },
      {
        name: 'node_modules/some_library/index.d.ts',
        contents: `
        import {NgModuleDef} from '@angular/core';
        import * as i0 from './component';
        export {SomeCmp} from './component';
        
        export declare class SomeModule {
          static ngModuleDef: NgModuleDef<SomeModule, [typeof i0.SomeCmp], never, [typeof i0.SomeCmp]>;
        }
      `
      },
      {
        name: 'node_modules/some_library/component.d.ts',
        contents: `
        import {NgComponentDefWithMeta} from '@angular/core';

        export declare class SomeCmp {
          static ngComponentDef: NgComponentDefWithMeta<SomeCmp, 'some-cmp', never, {}, {}, never>;
        }
      `
      },
      {
        name: 'entry.ts',
        contents: `
          export class ProgramCmp {}
          export class ProgramModule {}
      `
      },
    ]);
    const checker = program.getTypeChecker();
    const reflectionHost = new TypeScriptReflectionHost(checker);
    const ProgramModule =
        getDeclaration(program, 'entry.ts', 'ProgramModule', ts.isClassDeclaration);
    const ProgramCmp = getDeclaration(program, 'entry.ts', 'ProgramCmp', ts.isClassDeclaration);
    const SomeModule = getDeclaration(
        program, 'node_modules/some_library/index.d.ts', 'SomeModule', ts.isClassDeclaration);
    expect(ProgramModule).toBeDefined();
    expect(SomeModule).toBeDefined();

    const ProgramCmpRef = new Reference(ProgramCmp);
    const refEmitter = makeReferenceEmitter(program, checker, options, host);
    const registry = new SelectorScopeRegistry(checker, reflectionHost, refEmitter);

    registry.registerModule(ProgramModule, {
      declarations: [new Reference(ProgramCmp)],
      exports: [],
      imports: [new Reference(
          SomeModule,
          {specifier: 'some_library', resolutionContext: '/node_modules/some_library/index.d.ts'})],
    });

    const ref = new Reference(ProgramCmp);
    registry.registerDirective(ProgramCmp, {
      name: 'ProgramCmp',
      ref: ProgramCmpRef,
      directive: ProgramCmpRef,
      selector: 'program-cmp',
      isComponent: true,
      exportAs: null,
      inputs: {},
      outputs: {},
      queries: [],
      hasNgTemplateContextGuard: false,
      ngTemplateGuards: [],
    });

    const scope = registry.lookupCompilationScope(ProgramCmp) !;
    expect(scope).toBeDefined();
    expect(scope.directives).toBeDefined();
    expect(scope.directives.length).toBe(2);
  });

  it('exports of third-party libs work', () => {
    const {program, options, host} = makeProgram([
      {
        name: 'node_modules/@angular/core/index.d.ts',
        contents: `
        export interface NgComponentDefWithMeta<A, B, C, D, E, F> {}
        export interface NgModuleDef<A, B, C, D> {}
      `
      },
      {
        name: 'node_modules/some_library/index.d.ts',
        contents: `
        import {NgComponentDefWithMeta, NgModuleDef} from '@angular/core';
        
        export declare class SomeModule {
          static ngModuleDef: NgModuleDef<SomeModule, [typeof SomeCmp], never, [typeof SomeCmp]>;
        }

        export declare class SomeCmp {
          static ngComponentDef: NgComponentDefWithMeta<SomeCmp, 'some-cmp', never, {}, {}, never>;
        }
      `
      },
      {
        name: 'entry.ts',
        contents: `
          export class ProgramCmp {}
          export class ProgramModule {}
      `
      },
    ]);
    const checker = program.getTypeChecker();
    const reflectionHost = new TypeScriptReflectionHost(checker);
    const ProgramModule =
        getDeclaration(program, 'entry.ts', 'ProgramModule', ts.isClassDeclaration);
    const ProgramCmp = getDeclaration(program, 'entry.ts', 'ProgramCmp', ts.isClassDeclaration);
    const SomeModule = getDeclaration(
        program, 'node_modules/some_library/index.d.ts', 'SomeModule', ts.isClassDeclaration);
    expect(ProgramModule).toBeDefined();
    expect(SomeModule).toBeDefined();

    const ProgramCmpRef = new Reference(ProgramCmp);
    const refEmitter = makeReferenceEmitter(program, checker, options, host);
    const registry = new SelectorScopeRegistry(checker, reflectionHost, refEmitter);

    registry.registerModule(ProgramModule, {
      declarations: [new Reference(ProgramCmp)],
      exports: [new Reference(
          SomeModule,
          {specifier: 'some_library', resolutionContext: '/node_modules/some_library/index.d.ts'})],
      imports: [],
    });

    registry.registerDirective(ProgramCmp, {
      name: 'ProgramCmp',
      ref: ProgramCmpRef,
      directive: ProgramCmpRef,
      selector: 'program-cmp',
      isComponent: true,
      exportAs: null,
      inputs: {},
      outputs: {},
      queries: [],
      hasNgTemplateContextGuard: false,
      ngTemplateGuards: [],
    });

    const scope = registry.lookupCompilationScope(ProgramCmp) !;
    expect(scope).toBeDefined();
    expect(scope.directives).toBeDefined();
    expect(scope.directives.length).toBe(2);
  });
});

function makeReferenceEmitter(
    program: ts.Program, checker: ts.TypeChecker, options: ts.CompilerOptions,
    host: ts.CompilerHost): ReferenceEmitter {
  const rootDirs = getRootDirs(host, options);
  return new ReferenceEmitter([
    new LocalIdentifierStrategy(),
    new AbsoluteModuleStrategy(program, checker, options, host),
    new LogicalProjectStrategy(checker, new LogicalFileSystem(rootDirs)),
  ]);
}
