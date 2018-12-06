/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {TypeScriptReflectionHost} from '../../metadata';
import {AbsoluteReference, NodeReference, ResolvedReference} from '../../metadata/src/resolver';
import {getDeclaration, makeProgram} from '../../testing/in_memory_typescript';
import {SelectorScopeRegistry} from '../src/selector_scope';

describe('SelectorScopeRegistry', () => {
  it('absolute imports work', () => {
    const {program} = makeProgram([
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
    const host = new TypeScriptReflectionHost(checker);
    const ProgramModule =
        getDeclaration(program, 'entry.ts', 'ProgramModule', ts.isClassDeclaration);
    const ProgramCmp = getDeclaration(program, 'entry.ts', 'ProgramCmp', ts.isClassDeclaration);
    const SomeModule = getDeclaration(
        program, 'node_modules/some_library/index.d.ts', 'SomeModule', ts.isClassDeclaration);
    expect(ProgramModule).toBeDefined();
    expect(SomeModule).toBeDefined();

    const ProgramCmpRef = new ResolvedReference(ProgramCmp, ProgramCmp.name !);

    const registry = new SelectorScopeRegistry(checker, host);

    registry.registerModule(ProgramModule, {
      declarations: [new ResolvedReference(ProgramCmp, ProgramCmp.name !)],
      exports: [],
      imports: [new AbsoluteReference(SomeModule, SomeModule.name !, 'some_library', 'SomeModule')],
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
      deps: [],
      hasNgTemplateContextGuard: false,
      ngTemplateGuards: [],
    });

    const scope = registry.lookupCompilationScope(ProgramCmp) !;
    expect(scope).toBeDefined();
    expect(scope.directives).toBeDefined();
    expect(scope.directives.length).toBe(2);
  });

  it('exports of third-party libs work', () => {
    const {program} = makeProgram([
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
    const host = new TypeScriptReflectionHost(checker);
    const ProgramModule =
        getDeclaration(program, 'entry.ts', 'ProgramModule', ts.isClassDeclaration);
    const ProgramCmp = getDeclaration(program, 'entry.ts', 'ProgramCmp', ts.isClassDeclaration);
    const SomeModule = getDeclaration(
        program, 'node_modules/some_library/index.d.ts', 'SomeModule', ts.isClassDeclaration);
    expect(ProgramModule).toBeDefined();
    expect(SomeModule).toBeDefined();

    const ProgramCmpRef = new ResolvedReference(ProgramCmp, ProgramCmp.name !);

    const registry = new SelectorScopeRegistry(checker, host);

    registry.registerModule(ProgramModule, {
      declarations: [new ResolvedReference(ProgramCmp, ProgramCmp.name !)],
      exports: [new AbsoluteReference(SomeModule, SomeModule.name !, 'some_library', 'SomeModule')],
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
      deps: [],
      hasNgTemplateContextGuard: false,
      ngTemplateGuards: [],
    });

    const scope = registry.lookupCompilationScope(ProgramCmp) !;
    expect(scope).toBeDefined();
    expect(scope.directives).toBeDefined();
    expect(scope.directives.length).toBe(2);
  });

  it('local dependencies', () => {
    const {program} = makeProgram([
      {
        name: 'node_modules/@angular/core/index.ts',
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
      {
        name: 'local.ts',
        contents: `
          export class Dir {}
          export class Pipe {}
      `
      },
    ]);
    const checker = program.getTypeChecker();
    const host = new TypeScriptReflectionHost(checker);
    const ProgramModule =
        getDeclaration(program, 'entry.ts', 'ProgramModule', ts.isClassDeclaration);
    const ProgramCmp = getDeclaration(program, 'entry.ts', 'ProgramCmp', ts.isClassDeclaration);
    const Dir = getDeclaration(program, 'local.ts', 'Dir', ts.isClassDeclaration);
    const Pipe = getDeclaration(program, 'local.ts', 'Pipe', ts.isClassDeclaration);
    const SomeModule = getDeclaration(
        program, 'node_modules/some_library/index.d.ts', 'SomeModule', ts.isClassDeclaration);

    expect(ProgramModule).toBeDefined();
    expect(SomeModule).toBeDefined();

    const ProgramCmpRef = new ResolvedReference(ProgramCmp, ProgramCmp.name !);
    const DirRef = new ResolvedReference(Dir, Dir.name !);

    const registry = new SelectorScopeRegistry(checker, host);

    registry.registerModule(ProgramModule, {
      declarations: [new ResolvedReference(ProgramCmp, ProgramCmp.name !)],
      exports: [],
      imports: [new AbsoluteReference(SomeModule, SomeModule.name !, 'some_library', 'SomeModule')],
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
      deps: [
        new AbsoluteReference(Dir, Dir.name !, 'local.ts', 'Dir'),
        new AbsoluteReference(Pipe, Pipe.name !, 'local.ts', 'Pipe')
      ],
      hasNgTemplateContextGuard: false,
      ngTemplateGuards: [],
    });

    registry.registerDirective(Dir, {
      name: 'Dir',
      ref: DirRef,
      directive: DirRef,
      selector: '[dir]',
      isComponent: false,
      exportAs: null,
      inputs: {},
      outputs: {},
      queries: [],
      deps: [],
      hasNgTemplateContextGuard: false,
      ngTemplateGuards: [],
    });

    registry.registerPipe(Pipe, 'pipe');

    const scope = registry.lookupCompilationScope(ProgramCmp) !;
    expect(scope).toBeDefined();
    expect(scope.directives).toBeDefined();
    expect(scope.directives.length).toBe(3);
    expect(scope.pipes).toBeDefined();
    expect(scope.pipes.size).toBe(1);
  });
});