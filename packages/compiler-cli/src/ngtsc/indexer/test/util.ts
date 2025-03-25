/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  BoundTarget,
  CssSelector,
  parseTemplate,
  ParseTemplateOptions,
  R3TargetBinder,
  SelectorMatcher,
} from '@angular/compiler';
import ts from 'typescript';

import {absoluteFrom, AbsoluteFsPath} from '../../file_system';
import {Reference} from '../../imports';
import {ClassPropertyMapping} from '../../metadata';
import {ClassDeclaration} from '../../reflection';
import {getDeclaration, makeProgram} from '../../testing';
import {ComponentMeta} from '../src/context';

/** Dummy file URL */
function getTestFilePath(): AbsoluteFsPath {
  return absoluteFrom('/TEST_FILE.ts');
}

/**
 * Creates a class declaration from a component source code.
 */
export function getComponentDeclaration(componentStr: string, className: string): ClassDeclaration {
  const program = makeProgram([{name: getTestFilePath(), contents: componentStr}]);

  return getDeclaration(
    program.program,
    getTestFilePath(),
    className,
    (value: ts.Node): value is ClassDeclaration => ts.isClassDeclaration(value),
  );
}

/**
 * Parses a template source code and returns a template-bound target, optionally with information
 * about used components.
 *
 * @param template template to parse
 * @param options extra template parsing options
 * @param components components to bind to the template target
 */
export function getBoundTemplate(
  template: string,
  options: ParseTemplateOptions = {},
  components: Array<{selector: string; declaration: ClassDeclaration}> = [],
): BoundTarget<ComponentMeta> {
  const matcher = new SelectorMatcher<ComponentMeta[]>();
  components.forEach(({selector, declaration}) => {
    matcher.addSelectables(CssSelector.parse(selector), [
      {
        ref: new Reference(declaration),
        selector,
        name: declaration.name.getText(),
        isComponent: true,
        inputs: ClassPropertyMapping.fromMappedObject({}),
        outputs: ClassPropertyMapping.fromMappedObject({}),
        exportAs: null,
        isStructural: false,
        animationTriggerNames: null,
        ngContentSelectors: null,
        preserveWhitespaces: false,
      },
    ]);
  });
  const binder = new R3TargetBinder(matcher);

  return binder.bind({template: parseTemplate(template, getTestFilePath(), options).nodes});
}
