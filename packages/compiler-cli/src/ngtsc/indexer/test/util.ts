/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BoundTarget, CssSelector, R3TargetBinder, SelectorMatcher, TmplAstNode, parseTemplate} from '@angular/compiler/src/compiler';
import * as ts from 'typescript';
import {Reference} from '../../imports';
import {DirectiveMeta} from '../../metadata';
import {ClassDeclaration} from '../../reflection';
import {getDeclaration, makeProgram} from '../../testing/in_memory_typescript';

/** Dummy file URL */
export const TESTFILE = './TESTFILE.ts';

/**
 * Creates a class declaration from a component source code.
 */
export function getComponentDeclaration(componentStr: string, className: string): ClassDeclaration {
  const program = makeProgram([{name: TESTFILE, contents: componentStr}]);

  return getDeclaration(
      program.program, TESTFILE, className,
      (value: ts.Declaration): value is ClassDeclaration => ts.isClassDeclaration(value));
}

/**
 * Parses a template source code.
 */
export function getParsedTemplate(template: string): TmplAstNode[] {
  return parseTemplate(template, TESTFILE).nodes;
}

/**
 * Binds information about a component on a template (a target). The BoundTarget
 * describes the scope of the template and can be queried for directives the
 * template uses.
 */
export function bindTemplate(
    template: string, components: Array<{selector: string, declaration: ClassDeclaration}>):
    BoundTarget<DirectiveMeta> {
  const matcher = new SelectorMatcher<DirectiveMeta>();
  components.forEach(({selector, declaration}) => {
    matcher.addSelectables(CssSelector.parse(selector), {
      ref: new Reference(declaration),
      selector,
      queries: [],
      ngTemplateGuards: [],
      hasNgTemplateContextGuard: false,
      baseClass: null,
      name: declaration.name.getText(),
      isComponent: true,
      inputs: {},
      outputs: {},
      exportAs: null,
    });
  });
  const binder = new R3TargetBinder(matcher);

  return binder.bind({template: getParsedTemplate(template)});
}
