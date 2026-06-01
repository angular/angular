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

/** Creates a content block from an HTML AST node. */
export function createContentBlock(
  ast: html.Block,
  visitor: html.Visitor,
): {node: t.ContentBlock | null; errors: ParseError[]} {
  const errors: ParseError[] = [];
  if (ast.parameters.length < 1 || ast.parameters.length > 2) {
    errors.push(
      new ParseError(
        ast.startSourceSpan,
        '@content block must have one or two parameters, e.g. ' +
          '"@content(header)" or "@content(items; let item, index)"',
      ),
    );
    return {node: null, errors};
  }

  const nameParam = ast.parameters[0];
  const name = nameParam.expression.trim();
  if (name.includes(',')) {
    errors.push(
      new ParseError(ast.startSourceSpan, '@content block must have exactly one name parameter'),
    );
    return {node: null, errors};
  }

  if (!IDENTIFIER_PATTERN.test(name)) {
    errors.push(
      new ParseError(nameParam.sourceSpan, '@content name must be a valid JavaScript identifier'),
    );
    return {node: null, errors};
  }

  const variables = parseContentBlockVariables(ast, errors);
  if (variables === null) {
    return {node: null, errors};
  }

  const node = new t.ContentBlock(
    name,
    variables,
    html.visitAll(visitor, ast.children, ast.children),
    ast.nameSpan,
    ast.sourceSpan,
    ast.startSourceSpan,
    ast.endSourceSpan,
    ast.i18n,
  );
  return {node, errors};
}

/** Parses the variables of a content block. */
function parseContentBlockVariables(ast: html.Block, errors: ParseError[]): t.Variable[] | null {
  const variables: t.Variable[] = [];
  if (ast.parameters.length < 2) {
    return variables;
  }

  const varsParam = ast.parameters[1];
  const varsExpr = varsParam.expression.trim();
  const letMatch = varsExpr.match(LET_PATTERN);
  if (!letMatch) {
    errors.push(
      new ParseError(
        varsParam.sourceSpan,
        '@content block variables must start with "let", e.g. "let item, index"',
      ),
    );
    return null;
  }

  const varNames = letMatch[1].split(',').map((v) => v.trim());
  const variablesRawString = letMatch[1];
  const variablesStartOffset = varsParam.expression.indexOf(variablesRawString);
  const variablesStartLocation = varsParam.sourceSpan.start.moveBy(variablesStartOffset);

  let searchIndex = 0;
  for (let varName of varNames) {
    if (varName === '') {
      errors.push(new ParseError(varsParam.sourceSpan, 'Invalid variable name in @content block'));
      continue;
    }

    let varSpan: ParseSourceSpan;
    const index = variablesRawString.indexOf(varName, searchIndex);
    const varStart = variablesStartLocation.moveBy(index);

    if (varName.includes('=')) {
      const eqIndex = varName.indexOf('=');
      const namePart = varName.substring(0, eqIndex).trim();
      const fullVarSpan = new ParseSourceSpan(varStart, varStart.moveBy(varName.length));

      errors.push(
        new ParseError(fullVarSpan, `@content block variables cannot be assigned a value`),
      );

      varName = namePart;
      varSpan = new ParseSourceSpan(varStart, varStart.moveBy(varName.length));
    } else {
      varSpan = new ParseSourceSpan(varStart, varStart.moveBy(varName.length));
    }

    if (!IDENTIFIER_PATTERN.test(varName)) {
      errors.push(
        new ParseError(varSpan, `Variable name "${varName}" must be a valid JavaScript identifier`),
      );
      searchIndex = index + varName.length;
      continue;
    }

    if (variables.some((v) => v.name === varName)) {
      errors.push(
        new ParseError(varSpan, `Duplicate variable name "${varName}" in @content block`),
      );
      searchIndex = index + varName.length;
      continue;
    }

    // @content block variables cannot be assigned an explicit value in the template
    // (e.g. "let item = value"). Instead, they are assigned an argument of the calling render function
    // based on their positional index. For example if we have a @content block like
    // "@content(items; let item, index)" the render function for that block will be called like
    // "render(items, ctx[0], ctx[1])".
    variables.push(new t.Variable(varName, '', varSpan, varSpan));
    searchIndex = index + varName.length;
  }
  return variables;
}
