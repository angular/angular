/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as html from '../ml_parser/ast';
import {ParseError, ParseSourceSpan} from '../parse_util';

import * as t from './r3_ast';
import {IDENTIFIER_PATTERN, LET_PATTERN} from './util';

const TEMPLATE_BLOCK_PATTERN = /^template(?:\s+|$)/;

/** Returns whether an HTML block represents a named `@template` declaration. */
export function isTemplateBlock(name: string): boolean {
  return TEMPLATE_BLOCK_PATTERN.test(name);
}

/** Returns the declared name of a named `@template` block. */
export function getTemplateBlockName(ast: html.Block): string {
  return ast.name.slice('template'.length).trim();
}

/** Creates an `ng-template` AST node from a named `@template` declaration. */
export function createTemplateBlock(
  ast: html.Block,
  visitor: html.Visitor,
): {node: t.Template | null; errors: ParseError[]} {
  const errors: ParseError[] = [];
  const name = getTemplateBlockName(ast);
  const nameSpan = getNameSpan(ast, name);

  if (name.length === 0) {
    errors.push(new ParseError(ast.nameSpan, '@template declaration must have a name'));
    return {node: null, errors};
  }

  if (!IDENTIFIER_PATTERN.test(name)) {
    errors.push(new ParseError(nameSpan, '@template name must be a valid JavaScript identifier'));
    return {node: null, errors};
  }

  const variables = parseTemplateVariables(ast.parameters, errors);
  if (variables === null) {
    return {node: null, errors};
  }

  return {
    node: new t.Template(
      'ng-template',
      [],
      [],
      [],
      [],
      [],
      html.visitAll(visitor, ast.children, ast.children),
      [new t.Reference(name, '', nameSpan, nameSpan, undefined, false, true)],
      variables,
      false,
      ast.sourceSpan,
      ast.startSourceSpan,
      ast.endSourceSpan,
      ast.i18n,
    ),
    errors,
  };
}

/** Creates an `ng-template` AST node for an anonymous inline template. */
export function createInlineTemplate(
  ast: html.InlineTemplate,
  referenceName: string,
  visitor: html.Visitor,
): {node: t.Template | null; errors: ParseError[]} {
  const errors: ParseError[] = [];
  const variables = parseTemplateVariables(ast.parameters, errors);
  if (variables === null) {
    return {node: null, errors};
  }

  return {
    node: new t.Template(
      'ng-template',
      [],
      [],
      [],
      [],
      [],
      html.visitAll(visitor, ast.children, ast.children),
      [
        new t.Reference(
          referenceName,
          '',
          ast.startSourceSpan,
          ast.startSourceSpan,
          undefined,
          true,
        ),
      ],
      variables,
      false,
      ast.sourceSpan,
      ast.startSourceSpan,
      ast.endSourceSpan,
      ast.i18n,
    ),
    errors,
  };
}

function parseTemplateVariables(
  parameters: html.BlockParameter[],
  errors: ParseError[],
): t.Variable[] | null {
  const variables: t.Variable[] = [];

  for (const parameter of parameters) {
    const expression = parameter.expression.trim();
    const letMatch = expression.match(LET_PATTERN);

    if (letMatch === null) {
      errors.push(
        new ParseError(
          parameter.sourceSpan,
          '@template context variables must start with "let", e.g. "let item"',
        ),
      );
      continue;
    }

    const declaration = letMatch[1].trim();
    const equalsIndex = declaration.indexOf('=');
    const name = (equalsIndex === -1 ? declaration : declaration.slice(0, equalsIndex)).trim();
    const value = (equalsIndex === -1 ? '' : declaration.slice(equalsIndex + 1)).trim();
    const nameSpan = getParameterPartSpan(parameter, name);
    const parameterEqualsIndex = parameter.expression.indexOf('=');
    const valueSpan =
      value.length === 0
        ? undefined
        : getParameterValueSpan(parameter, parameterEqualsIndex, value);

    if (!IDENTIFIER_PATTERN.test(name)) {
      errors.push(
        new ParseError(
          nameSpan,
          `Context variable name "${name}" must be a valid JavaScript identifier`,
        ),
      );
      continue;
    }

    if (equalsIndex !== -1 && !IDENTIFIER_PATTERN.test(value)) {
      errors.push(
        new ParseError(
          valueSpan ?? parameter.sourceSpan,
          `Context variable value "${value}" must be a valid JavaScript identifier`,
        ),
      );
      continue;
    }

    if (variables.some((variable) => variable.name === name)) {
      errors.push(
        new ParseError(nameSpan, `Duplicate context variable "${name}" in @template declaration`),
      );
      continue;
    }

    variables.push(new t.Variable(name, value, parameter.sourceSpan, nameSpan, valueSpan));
  }

  return errors.length === 0 ? variables : null;
}

function getNameSpan(ast: html.Block, name: string): ParseSourceSpan {
  const offset = ast.nameSpan.toString().lastIndexOf(name);
  const start = ast.nameSpan.start.moveBy(Math.max(offset, 0));
  return new ParseSourceSpan(start, start.moveBy(name.length));
}

function getParameterPartSpan(parameter: html.BlockParameter, part: string): ParseSourceSpan {
  const offset = parameter.expression.indexOf(part);
  const start = parameter.sourceSpan.start.moveBy(Math.max(offset, 0));
  return new ParseSourceSpan(start, start.moveBy(part.length));
}

function getParameterValueSpan(
  parameter: html.BlockParameter,
  equalsIndex: number,
  value: string,
): ParseSourceSpan {
  const valueOffset = equalsIndex + 1 + parameter.expression.slice(equalsIndex + 1).indexOf(value);
  const start = parameter.sourceSpan.start.moveBy(valueOffset);
  return new ParseSourceSpan(start, start.moveBy(value.length));
}
