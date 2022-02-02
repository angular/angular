/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {DirectiveMeta, MetadataReader, PipeMeta} from '../../../metadata';
import {ClassDeclaration} from '../../../reflection';
import {ComponentScopeReader, DtsModuleScopeResolver, ExportScope, LocalModuleScopeRegistry, makeNotStandaloneDiagnostic} from '../../../scope';

import {ComponentAnalysisData} from './metadata';


export interface ScopeTemplateResult {
  directives: DirectiveMeta[];
  pipes: PipeMeta[];
  diagnostics: ts.Diagnostic[];
  ngModule: ClassDeclaration|null;
}

export function scopeTemplate(
    scopeReader: ComponentScopeReader, dtsScopeReader: DtsModuleScopeResolver,
    scopeRegistry: LocalModuleScopeRegistry, metaReader: MetadataReader, node: ClassDeclaration,
    analysis: Readonly<ComponentAnalysisData>, usePoisonedData: boolean): ScopeTemplateResult|null {
  // Check whether this component was registered with an NgModule.
  const scope = scopeReader.getScopeForComponent(node);

  if (analysis.meta.isStandalone && scope !== null) {
    // Error: component is both standalone and declared in an NgModule. This is an error
    // on the NgModule side (we highlight the declaration as invalid since the component
    // is marked as standalone). Since we have conflicting scopes for the template, we forgo
    // using either scope here.
    return null;
  } else if (scope !== null && scope.compilation.isPoisoned && !usePoisonedData) {
    // The compilation scope of this component is poisoned, so don't use it.
    return null;
  }

  if (scope !== null) {
    // This is an NgModule-ful component, so use scope information coming from the NgModule.
    return {
      directives: scope.compilation.directives,
      pipes: scope.compilation.pipes,
      ngModule: scope.ngModule,
      diagnostics: [],
    };
  } else if (analysis.meta.isStandalone) {
    // This is a standalone component, and carries its scope information via `imports`.
    if (analysis.imports === null) {
      // Early exit for standalone components that don't declare imports (empty scope).
      return {
        directives: [],
        pipes: [],
        ngModule: null,
        diagnostics: [],
      };
    }

    const diagnostics: ts.Diagnostic[] = [];

    // We need to deduplicate directives/pipes in `imports`, as any given directive/pipe may be
    // present in the export scope of more than one NgModule (or just listed more than once).
    const directives = new Map<ClassDeclaration, DirectiveMeta>();
    const pipes = new Map<ClassDeclaration, PipeMeta>();

    for (const ref of analysis.imports.resolved) {
      // Determine if this import is a component/directive/pipe/NgModule.
      const dirMeta = metaReader.getDirectiveMetadata(ref);
      if (dirMeta !== null) {
        if (!dirMeta.isStandalone) {
          // Directly importing a directive that's not standalone is an error.
          diagnostics.push(makeNotStandaloneDiagnostic(
              scopeReader, ref, analysis.imports.raw,
              dirMeta.isComponent ? 'component' : 'directive'));
          continue;
        }

        if (!directives.has(ref.node)) {
          directives.set(ref.node, dirMeta);
        }
        continue;
      }

      const pipeMeta = metaReader.getPipeMetadata(ref);
      if (pipeMeta !== null) {
        if (!pipeMeta.isStandalone) {
          // Directly importing a pipe that's not standalone is an error.
          diagnostics.push(
              makeNotStandaloneDiagnostic(scopeReader, ref, analysis.imports.raw, 'pipe'));
          continue;
        }
      }

      const ngModuleMeta = metaReader.getNgModuleMetadata(ref);
      if (ngModuleMeta !== null) {
        let scope: ExportScope|null;
        if (ref.node.getSourceFile().isDeclarationFile) {
          scope = dtsScopeReader.resolve(ref);
        } else {
          scope = scopeRegistry.getScopeOfModule(ref.node);
        }

        if (scope === null) {
          // Strange, not sure what's going on here.
          continue;
        }

        if (scope.exported.isPoisoned && !usePoisonedData) {
          // The imported scope is poisoned, so treat our scope as poisoned.
          return null;
        }

        for (const dir of scope.exported.directives) {
          if (!directives.has(dir.ref.node)) {
            directives.set(dir.ref.node, dir);
          }
        }

        for (const pipe of scope.exported.pipes) {
          if (!pipes.has(pipe.ref.node)) {
            pipes.set(pipe.ref.node, pipe);
          }
        }
      }
    }

    return {
      directives: Array.from(directives.values()),
      pipes: Array.from(pipes.values()),
      diagnostics,
      ngModule: null,
    };
  } else {
    // This is a "free" component, and is neither standalone nor declared in an NgModule.
    // This should probably be an error now that we have standalone components, but that would be a
    // breaking change. For now, preserve the old behavior (treat is as having an empty scope).
    return {
      directives: [],
      pipes: [],
      ngModule: null,
      diagnostics: [],
    };
  }
}
