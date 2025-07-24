/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {parser as jsParser} from '@lezer/javascript';
import {parseMixed, SyntaxNode, SyntaxNodeRef, Input, NestedParse} from '@lezer/common';

import {LRLanguage} from '@codemirror/language';
import {angularLanguage} from '@codemirror/lang-angular';
import {sassLanguage} from '@codemirror/lang-sass';

export function angularComponent() {
  return LRLanguage.define({
    parser: jsParser.configure({
      dialect: 'ts',
      wrap: parseMixed((node, input) => getAngularComponentMixedParser(node, input)),
    }),
  });
}

/**
 * Use the Angular template parser for inline templates in Angular components
 */
function getAngularComponentMixedParser(node: SyntaxNodeRef, input: Input): NestedParse | null {
  const nodeIsString = ['TemplateString', 'String'].includes(node.name);

  if (!nodeIsString) return null;

  if (isComponentTemplate(node, input)) return {parser: angularLanguage.parser};
  if (isComponentStyles(node, input)) return {parser: sassLanguage.parser};

  return null;
}

function isComponentTemplate(node: SyntaxNodeRef, input: Input): boolean {
  if (!node.node.parent) return false;

  const expectedParents = [
    'Property', // `template:` in `@Component({ template: "..." })`
    'ObjectExpression', // `{` in `@Component({ template: "..." })`
    'ArgList', // the decorator arguments in `@Component({ template: "..." })`
    'CallExpression', // `()` in `@Component({ template: "..." })`
    'Decorator', // `@Component` in `@Component({ template: "..." })`
  ];

  const {node: parentNode} = node.node.parent;

  if (nodeHasExpectedParents(parentNode, expectedParents)) {
    const templateCandidateProperty = input
      .read(parentNode.node.from, parentNode.node.to)
      .toString()
      .trim();

    // is a Component's decorator `template`
    if (templateCandidateProperty.startsWith('template:')) return true;
  }

  return false;
}

function isComponentStyles(node: SyntaxNodeRef, input: Input): boolean {
  if (!node.node.parent || !node.node.parent?.node.parent) return false;

  const expectedParents = [
    'ArrayExpression', // `[` in `@Component({ styles: [``] })`
    'Property', // `styles:` in `@Component({ styles: [``] })`
    'ObjectExpression', // `{` in `@Component({ styles: [``] })`
    'ArgList', // the decorator arguments in `@Component({ styles: [``] })`
    'CallExpression', // `()` in `@Component({ styles: [``] })`
    'Decorator', // `@Component` in `@Component({ styles: [``] })`
  ];

  const {node: parentNode} = node.node.parent;

  if (nodeHasExpectedParents(parentNode, expectedParents)) {
    const propertyNode = node.node.parent.node.parent;

    const stylesCandidateProperty = input
      .read(propertyNode.from, propertyNode.to)
      .toString()
      .trim();

    // is a Component's decorator `styles`
    if (stylesCandidateProperty.startsWith('styles:')) {
      return true;
    }
  }

  return false;
}

/**
 * Utility function to verify if the given SyntaxNode has the expected parents
 */
function nodeHasExpectedParents(
  node: SyntaxNode,
  orderedParentsNames: Array<SyntaxNode['name']>,
): boolean {
  const parentNameToVerify = orderedParentsNames[0];

  if (parentNameToVerify !== node.name) return false;

  // parent was found, remove from the array
  orderedParentsNames.shift();

  // all expected parents were found, node has expected parents
  if (orderedParentsNames.length === 0) return true;

  if (!node.parent) return false;

  return nodeHasExpectedParents(node.parent.node, orderedParentsNames);
}
