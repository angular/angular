/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {DirectiveMeta, PipeMeta} from '../../../metadata';
import {ClassDeclaration} from '../../../reflection';
import {ComponentScopeReader} from '../../../scope';


export interface ScopeTemplateResult {
  directives: DirectiveMeta[];
  pipes: PipeMeta[];
  diagnostics: ts.Diagnostic[];
  ngModule: ClassDeclaration;
}

export function scopeTemplate(
    scopeReader: ComponentScopeReader, node: ClassDeclaration,
    usePoisonedData: boolean): ScopeTemplateResult|null {
  const context = node.getSourceFile();

  // Check whether this component was registered with an NgModule. If so, it should be compiled
  // under that module's compilation scope.
  const scope = scopeReader.getScopeForComponent(node);

  if (scope === null || (scope.compilation.isPoisoned && !usePoisonedData)) {
    return null;
  }

  return {
    directives: scope.compilation.directives,
    pipes: scope.compilation.pipes,
    diagnostics: [],
    ngModule: scope.ngModule,
  };
}
