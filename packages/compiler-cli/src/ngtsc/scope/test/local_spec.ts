/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {Reference, ReferenceEmitter} from '../../imports';
import {ScopeData, ScopeDirective, ScopePipe} from '../src/api';
import {DtsModuleScopeResolver} from '../src/dependency';
import {LocalModuleScopeRegistry} from '../src/local';

function registerFakeRefs(registry: LocalModuleScopeRegistry):
    {[name: string]: Reference<ts.ClassDeclaration>} {
  const get = (target: {}, name: string): Reference<ts.ClassDeclaration> => {
    const sf = ts.createSourceFile(
        name + '.ts', `export class ${name} {}`, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const clazz = sf.statements[0] as ts.ClassDeclaration;
    const ref = new Reference(clazz);
    if (name.startsWith('Dir') || name.startsWith('Cmp')) {
      registry.registerDirective(fakeDirective(ref));
    } else if (name.startsWith('Pipe')) {
      registry.registerPipe(fakePipe(ref));
    }
    return ref;
  };
  return new Proxy({}, {get});
}

describe('LocalModuleScopeRegistry', () => {
  const refEmitter = new ReferenceEmitter([]);
  let registry !: LocalModuleScopeRegistry;

  beforeEach(() => {
    registry = new LocalModuleScopeRegistry(new MockDtsModuleScopeResolver(), refEmitter, null);
  });

  it('should produce an accurate LocalModuleScope for a basic NgModule', () => {
    const {Dir1, Dir2, Pipe1, Module} = registerFakeRefs(registry);

    registry.registerNgModule(Module.node, {
      imports: [],
      declarations: [Dir1, Dir2, Pipe1],
      exports: [Dir1, Pipe1],
    });

    const scope = registry.getScopeOfModule(Module.node) !;
    expect(scopeToRefs(scope.compilation)).toEqual([Dir1, Dir2, Pipe1]);
    expect(scopeToRefs(scope.exported)).toEqual([Dir1, Pipe1]);
  });

  it('should produce accurate LocalModuleScopes for a complex module chain', () => {
    const {DirA, DirB, DirCI, DirCE, ModuleA, ModuleB, ModuleC} = registerFakeRefs(registry);

    registry.registerNgModule(
        ModuleA.node, {imports: [ModuleB], declarations: [DirA], exports: []});
    registry.registerNgModule(
        ModuleB.node, {exports: [ModuleC, DirB], declarations: [DirB], imports: []});
    registry.registerNgModule(
        ModuleC.node, {declarations: [DirCI, DirCE], exports: [DirCE], imports: []});

    const scopeA = registry.getScopeOfModule(ModuleA.node) !;
    expect(scopeToRefs(scopeA.compilation)).toEqual([DirA, DirB, DirCE]);
    expect(scopeToRefs(scopeA.exported)).toEqual([]);
  });

  it('should not treat exported modules as imported', () => {
    const {Dir, ModuleA, ModuleB} = registerFakeRefs(registry);

    registry.registerNgModule(ModuleA.node, {exports: [ModuleB], imports: [], declarations: []});
    registry.registerNgModule(ModuleB.node, {declarations: [Dir], exports: [Dir], imports: []});

    const scopeA = registry.getScopeOfModule(ModuleA.node) !;
    expect(scopeToRefs(scopeA.compilation)).toEqual([]);
    expect(scopeToRefs(scopeA.exported)).toEqual([Dir]);
  });

  it('should deduplicate declarations and exports', () => {
    const {DirA, ModuleA, DirB, ModuleB, ModuleC} = registerFakeRefs(registry);

    registry.registerNgModule(ModuleA.node, {
      declarations: [DirA, DirA],
      imports: [ModuleB, ModuleC],
      exports: [DirA, DirA, DirB, ModuleB],
    });
    registry.registerNgModule(ModuleB.node, {declarations: [DirB], imports: [], exports: [DirB]});
    registry.registerNgModule(ModuleC.node, {declarations: [], imports: [], exports: [ModuleB]});

    const scope = registry.getScopeOfModule(ModuleA.node) !;
    expect(scopeToRefs(scope.compilation)).toEqual([DirA, DirB]);
    expect(scopeToRefs(scope.exported)).toEqual([DirA, DirB]);
  });

  it('should preserve reference identities in module metadata', () => {
    const {Dir, Module} = registerFakeRefs(registry);
    const idSf = ts.createSourceFile('id.ts', 'var id;', ts.ScriptTarget.Latest, true);

    // Create a new Reference to Dir, with a special `ts.Identifier`, and register the directive
    // using it. This emulates what happens when an NgModule declares a Directive.
    const idVar = idSf.statements[0] as ts.VariableStatement;
    const id = idVar.declarationList.declarations[0].name as ts.Identifier;
    const DirInModule = new Reference(Dir.node);
    DirInModule.addIdentifier(id);
    registry.registerNgModule(Module.node, {exports: [], imports: [], declarations: [DirInModule]});

    const scope = registry.getScopeOfModule(Module.node) !;
    expect(scope.compilation.directives[0].ref.getIdentityIn(idSf)).toBe(id);
  });

  it('should allow directly exporting a directive that\'s not imported', () => {
    const {Dir, ModuleA, ModuleB} = registerFakeRefs(registry);

    registry.registerNgModule(ModuleA.node, {exports: [Dir], imports: [ModuleB], declarations: []});
    registry.registerNgModule(ModuleB.node, {declarations: [Dir], exports: [Dir], imports: []});

    const scopeA = registry.getScopeOfModule(ModuleA.node) !;
    expect(scopeToRefs(scopeA.exported)).toEqual([Dir]);
  });

  it('should not allow directly exporting a directive that\'s not imported', () => {
    const {Dir, ModuleA, ModuleB} = registerFakeRefs(registry);

    registry.registerNgModule(ModuleA.node, {exports: [Dir], imports: [], declarations: []});
    registry.registerNgModule(ModuleB.node, {declarations: [Dir], exports: [Dir], imports: []});

    expect(registry.getScopeOfModule(ModuleA.node)).toBe(null);

    // ModuleA should have associated diagnostics as it exports `Dir` without declaring it.
    expect(registry.getDiagnosticsOfModule(ModuleA.node)).not.toBeNull();

    // ModuleB should have no diagnostics as it correctly declares `Dir`.
    expect(registry.getDiagnosticsOfModule(ModuleB.node)).toBeNull();
  });
});

function fakeDirective(ref: Reference<ts.ClassDeclaration>): ScopeDirective {
  const name = ref.debugName !;
  return {
    ref,
    name,
    selector: `[${ref.debugName}]`,
    isComponent: name.startsWith('Cmp'),
    inputs: {},
    outputs: {},
    exportAs: null,
    queries: [],
    hasNgTemplateContextGuard: false,
    ngTemplateGuards: [],
  };
}

function fakePipe(ref: Reference<ts.ClassDeclaration>): ScopePipe {
  const name = ref.debugName !;
  return {ref, name};
}

class MockDtsModuleScopeResolver implements DtsModuleScopeResolver {
  resolve(ref: Reference<ts.ClassDeclaration>): null { return null; }
}

function scopeToRefs(scopeData: ScopeData): Reference<ts.Declaration>[] {
  const directives = scopeData.directives.map(dir => dir.ref);
  const pipes = scopeData.pipes.map(pipe => pipe.ref);
  return [...directives, ...pipes].sort((a, b) => a.debugName !.localeCompare(b.debugName !));
}
