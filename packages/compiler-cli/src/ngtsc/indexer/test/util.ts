/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  BoundTarget,
  ClassPropertyMapping,
  CssSelector,
  DirectiveMatcher,
  MatchSource,
  parseTemplate,
  ParseTemplateOptions,
  R3TargetBinder,
  SelectorlessMatcher,
  SelectorMatcher,
} from '@angular/compiler';
import ts from 'typescript';

import {absoluteFrom, AbsoluteFsPath} from '../../file_system';
import {Reference} from '../../imports';
import {ClassDeclaration, DeclarationNode} from '../../reflection';
import {getDeclaration, makeProgram} from '../../testing';
import {ComponentMeta} from '../src/context';
import {AbstractBoundTemplate} from '../src/api';

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
  components: Array<{selector: string | null; declaration: ClassDeclaration}> = [],
): AbstractBoundTemplate<DeclarationNode> {
  const componentsMeta = components.map(({selector, declaration}) => ({
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
    matchSource: MatchSource.Selector,
  }));

  let matcher: DirectiveMatcher<ComponentMeta>;

  if (options.enableSelectorless) {
    const registry = new Map<string, ComponentMeta[]>();

    for (const current of componentsMeta) {
      registry.set(current.name, [current]);
    }

    matcher = new SelectorlessMatcher(registry);
  } else {
    matcher = new SelectorMatcher();

    for (const current of componentsMeta) {
      if (current.selector !== null) {
        matcher.addSelectables(CssSelector.parse(current.selector), [current]);
      }
    }
  }

  const binder = new R3TargetBinder(matcher);

  const boundTemplate = binder.bind({
    template: parseTemplate(template, getTestFilePath(), options).nodes,
  });
  const abstractBoundTemplate: AbstractBoundTemplate<DeclarationNode> = {
    getDirectivesOfNode(node) {
      return boundTemplate.getDirectivesOfNode(node);
    },
    getReferenceTarget(node) {
      return boundTemplate.getReferenceTarget(node);
    },
    getExpressionTarget(ast) {
      return boundTemplate.getExpressionTarget(ast);
    },
    getUsedDirectives() {
      return boundTemplate.getUsedDirectives().map((dir) => ({
        ref: {node: dir.ref.node},
        isComponent: dir.isComponent,
      }));
    },
    getTemplateAst() {
      return boundTemplate.target.template;
    },
  };
  return abstractBoundTemplate;
}

function createAbstractBoundTemplate() {}
