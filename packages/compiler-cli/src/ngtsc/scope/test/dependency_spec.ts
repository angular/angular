/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {Reference} from '../../imports';
import {TypeScriptReflectionHost} from '../../reflection';
import {makeProgram} from '../../testing/in_memory_typescript';

import {ExportScope} from '../src/api';
import {MetadataDtsModuleScopeResolver} from '../src/dependency';

const MODULE_FROM_NODE_MODULES_PATH = /.*node_modules\/(\w+)\/index\.d\.ts$/;

/**
 * Simple metadata types are added to the top of each testing file, for convenience.
 */
const PROLOG = `
export declare type ModuleMeta<A, B, C, D> = never;
export declare type ComponentMeta<A, B, C, D, E, F> = never;
export declare type DirectiveMeta<A, B, C, D, E, F> = never;
export declare type PipeMeta<A, B> = never;
`;

/**
 * Construct the testing environment with a given set of absolute modules and their contents.
 *
 * This returns both the `MetadataDtsModuleScopeResolver` and a `refs` object which can be
 * destructured to retrieve references to specific declared classes.
 */
function makeTestEnv(modules: {[module: string]: string}): {
  refs: {[name: string]: Reference<ts.ClassDeclaration>},
  resolver: MetadataDtsModuleScopeResolver,
} {
  // Map the modules object to an array of files for `makeProgram`.
  const files = Object.keys(modules).map(moduleName => {
    return {
      name: `node_modules/${moduleName}/index.d.ts`,
      contents: PROLOG + (modules as any)[moduleName],
    };
  });
  const {program} = makeProgram(files);
  const checker = program.getTypeChecker();
  const resolver =
      new MetadataDtsModuleScopeResolver(checker, new TypeScriptReflectionHost(checker));

  // Resolver for the refs object.
  const get = (target: {}, name: string): Reference<ts.ClassDeclaration> => {
    for (const sf of program.getSourceFiles()) {
      const symbol = checker.getSymbolAtLocation(sf) !;
      const exportedSymbol = symbol.exports !.get(name as ts.__String);
      if (exportedSymbol !== undefined) {
        const decl = exportedSymbol.valueDeclaration as ts.ClassDeclaration;
        const specifier = MODULE_FROM_NODE_MODULES_PATH.exec(sf.fileName) ![1];
        return new Reference(decl, {specifier, resolutionContext: sf.fileName});
      }
    }
    throw new Error('Class not found: ' + name);
  };

  return {
    resolver,
    refs: new Proxy({}, {get}),
  };
}

describe('MetadataDtsModuleScopeResolver', () => {
  it('should produce an accurate scope for a basic NgModule', () => {
    const {resolver, refs} = makeTestEnv({
      'test': `
        export declare class Dir {
          static ngDirectiveDef: DirectiveMeta<Dir, '[dir]', ['exportAs'], {'input': 'input2'},
            {'output': 'output2'}, ['query']>;
        }

        export declare class Module {
          static ngModuleDef: ModuleMeta<Module, [typeof Dir], never, [typeof Dir]>;
        }
      `
    });
    const {Dir, Module} = refs;
    const scope = resolver.resolve(Module) !;
    expect(scopeToRefs(scope)).toEqual([Dir]);
  });

  it('should produce an accurate scope when a module is exported', () => {
    const {resolver, refs} = makeTestEnv({
      'test': `
        export declare class Dir {
          static ngDirectiveDef: DirectiveMeta<Dir, '[dir]', never, never, never, never>;
        }

        export declare class ModuleA {
          static ngModuleDef: ModuleMeta<ModuleA, [typeof Dir], never, [typeof Dir]>;
        }

        export declare class ModuleB {
          static ngModuleDef: ModuleMeta<ModuleB, never, never, [typeof ModuleA]>;
        }
      `
    });
    const {Dir, ModuleB} = refs;
    const scope = resolver.resolve(ModuleB) !;
    expect(scopeToRefs(scope)).toEqual([Dir]);
  });

  it('should resolve correctly across modules', () => {
    const {resolver, refs} = makeTestEnv({
      'declaration': `
          export declare class Dir {
            static ngDirectiveDef: DirectiveMeta<Dir, '[dir]', never, never, never, never>;
          }
  
          export declare class ModuleA {
            static ngModuleDef: ModuleMeta<ModuleA, [typeof Dir], never, [typeof Dir]>;
          }
        `,
      'exported': `
          import * as d from 'declaration';

          export declare class ModuleB {
            static ngModuleDef: ModuleMeta<ModuleB, never, never, [typeof d.ModuleA]>;
          }
        `
    });
    const {Dir, ModuleB} = refs;
    const scope = resolver.resolve(ModuleB) !;
    expect(scopeToRefs(scope)).toEqual([Dir]);

    // Explicitly verify that the directive has the correct owning module.
    expect(scope.exported.directives[0].ref.ownedByModuleGuess).toBe('declaration');
  });
});

function scopeToRefs(scope: ExportScope): Reference<ts.Declaration>[] {
  const directives = scope.exported.directives.map(dir => dir.ref);
  const pipes = scope.exported.pipes.map(pipe => pipe.ref);
  return [...directives, ...pipes].sort((a, b) => a.debugName !.localeCompare(b.debugName !));
}
