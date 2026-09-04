/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AST} from '../expression_parser/ast';
import * as html from '../ml_parser/ast';
import {ParseError, ParseSourceSpan} from '../parse_util';
import {BindingParser} from '../template_parser/binding_parser';

import * as t from './r3_ast';
import {IDENTIFIER_PATTERN, LET_PATTERN, parseLetParameters} from './util';

/** Pattern used to identify a boundary `when` expression. */
const WHEN_PATTERN = /^(when\s+)(.*)/;

export function isConnectedBoundaryErrorBlock(name: string): boolean {
  return name === 'error';
}

export function createBoundaryBlock(
  ast: html.Block,
  connectedBlocks: html.Block[],
  visitor: html.Visitor,
  bindingParser: BindingParser,
): {node: t.BoundaryBlock | null; errors: ParseError[]} {
  const errors: ParseError[] = [];
  const errorBlocks: t.BoundaryErrorBlock[] = [];

  if (ast.parameters.length > 0) {
    errors.push(new ParseError(ast.sourceSpan, '@boundary block cannot have parameters'));
  }

  for (let blockIndex = 0; blockIndex < connectedBlocks.length; blockIndex++) {
    const block = connectedBlocks[blockIndex];
    if (block.name !== 'error') {
      errors.push(
        new ParseError(block.sourceSpan, `Unrecognized @boundary connected block @${block.name}`),
      );
      continue;
    }
    const emptySpan = new ParseSourceSpan(block.startSourceSpan.end, block.startSourceSpan.end);
    const contextVariables: t.Variable[] = [
      new t.Variable('$error', '$error', emptySpan, emptySpan, emptySpan),
      new t.Variable('$reset', '$reset', emptySpan, emptySpan, emptySpan),
    ];
    let expression: AST | null = null;

    for (const param of block.parameters) {
      const letMatch = param.expression.match(LET_PATTERN);
      if (letMatch !== null) {
        const variablesSpan = new ParseSourceSpan(
          param.sourceSpan.start.moveBy(letMatch[0].length - letMatch[1].length),
          param.sourceSpan.end,
        );
        parseLetParameters(
          param.sourceSpan,
          letMatch[1],
          variablesSpan,
          contextVariables,
          errors,
          (name, variableName, sourceSpan) => {
            if (variableName !== '$error' && variableName !== '$reset') {
              errors.push(
                new ParseError(
                  sourceSpan,
                  `Unknown context variable "${variableName}". Only "$error" and "$reset" are allowed`,
                ),
              );
            } else if (contextVariables.some((v) => v.name === name)) {
              errors.push(
                new ParseError(sourceSpan, `Duplicate "let" parameter variable "${name}"`),
              );
            }
          },
          '@error block',
          '$error',
        );
        continue;
      }

      const aliasMatch = param.expression.match(
        /^([$A-Z_][0-9A-Z_$]*)\s*=\s*([$A-Z_][0-9A-Z_$]*)$/i,
      );
      if (aliasMatch) {
        const name = aliasMatch[1];
        const variableName = aliasMatch[2];

        if (variableName !== '$error' && variableName !== '$reset') {
          errors.push(
            new ParseError(
              param.sourceSpan,
              `Unknown context variable "${variableName}". Only "$error" and "$reset" are allowed`,
            ),
          );
        } else if (contextVariables.some((v) => v.name === name)) {
          errors.push(new ParseError(param.sourceSpan, `Duplicate parameter variable "${name}"`));
        } else {
          const nameIndex = param.expression.indexOf(name);
          const keySpan = new ParseSourceSpan(
            param.sourceSpan.start.moveBy(nameIndex),
            param.sourceSpan.start.moveBy(nameIndex + name.length),
          );
          const equalsIndex = param.expression.indexOf('=');
          const valueIndex = param.expression.indexOf(variableName, equalsIndex + 1);
          const valueSpan = new ParseSourceSpan(
            param.sourceSpan.start.moveBy(valueIndex),
            param.sourceSpan.start.moveBy(valueIndex + variableName.length),
          );
          const sourceSpan = new ParseSourceSpan(keySpan.start, valueSpan.end);
          contextVariables.push(new t.Variable(name, variableName, sourceSpan, keySpan, valueSpan));
        }
        continue;
      }

      const whenMatch = param.expression.match(WHEN_PATTERN);
      if (whenMatch) {
        if (expression !== null) {
          errors.push(
            new ParseError(param.sourceSpan, '@error block can only have one "when" expression'),
          );
        } else {
          const start = param.expression.indexOf(whenMatch[2]);
          const end = start + whenMatch[2].length;
          const expressionAST = bindingParser.parseBinding(
            param.expression.slice(start, end),
            false,
            param.sourceSpan,
            param.sourceSpan.start.offset + start,
          );
          expression = expressionAST.ast;
        }
        continue;
      }

      errors.push(
        new ParseError(
          param.sourceSpan,
          `Unrecognized @error block parameter "${param.expression}"`,
        ),
      );
    }

    errorBlocks.push(
      new t.BoundaryErrorBlock(
        html.visitAll(visitor, block.children, block.children),
        contextVariables,
        expression,
        block.nameSpan,
        block.sourceSpan,
        block.startSourceSpan,
        block.endSourceSpan,
        block.i18n,
      ),
    );
  }

  let hasUnconditionalErrorBlock = false;
  for (let i = 0; i < errorBlocks.length; i++) {
    const errorBlock = errorBlocks[i];
    if (errorBlock.expression === null) {
      if (hasUnconditionalErrorBlock) {
        errors.push(
          new ParseError(
            errorBlock.sourceSpan,
            '@boundary block can only have one unconditional @error block',
          ),
        );
      } else if (i !== errorBlocks.length - 1) {
        errors.push(
          new ParseError(
            errorBlock.sourceSpan,
            'Unconditional @error block must be the last @error block in the boundary chain',
          ),
        );
      }
      hasUnconditionalErrorBlock = true;
    }
  }

  let wholeSourceSpan = ast.sourceSpan;
  const lastErrorBlock = errorBlocks[errorBlocks.length - 1];
  if (lastErrorBlock !== undefined) {
    wholeSourceSpan = new ParseSourceSpan(ast.startSourceSpan.start, lastErrorBlock.sourceSpan.end);
  }
  const endSourceSpan =
    errorBlocks.length > 0 ? errorBlocks[errorBlocks.length - 1].endSourceSpan : ast.endSourceSpan;

  const node = new t.BoundaryBlock(
    html.visitAll(visitor, ast.children, ast.children),
    errorBlocks,
    ast.nameSpan,
    wholeSourceSpan,
    ast.sourceSpan,
    ast.startSourceSpan,
    endSourceSpan,
    ast.i18n,
  );

  return {node, errors};
}
