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

/** Pattern used to identify a boundary `let` parameter. */
const LET_PATTERN = /^(let\s+)(.*)/;

/** Pattern used to identify a boundary `when` expression. */
const WHEN_PATTERN = /^(when\s+)(.*)/;

/** Pattern used to validate a JavaScript identifier. */
const IDENTIFIER_PATTERN = /^[$A-Z_][0-9A-Z_$]*$/i;

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

  for (let blockIndex = 0; blockIndex < connectedBlocks.length; blockIndex++) {
    const block = connectedBlocks[blockIndex];
    if (block.name === 'error') {
      const emptySpan = new ParseSourceSpan(block.startSourceSpan.end, block.startSourceSpan.end);
      const contextVariables: t.Variable[] = [
        new t.Variable('$error', '$error', emptySpan, emptySpan, emptySpan),
        new t.Variable('$retry', '$retry', emptySpan, emptySpan, emptySpan),
      ];
      let expression: AST | null = null;

      for (const param of block.parameters) {
        const letMatch = param.expression.match(LET_PATTERN);
        if (letMatch) {
          const variablesExpression = letMatch[2];
          const parts = variablesExpression.split(',');
          let currentOffset = 0;

          for (const part of parts) {
            const partIndex = variablesExpression.indexOf(part, currentOffset);
            const partAbsoluteOffset = letMatch[1].length + partIndex;

            const expressionParts = part.split('=');
            const nameRaw = expressionParts[0];
            const name = nameRaw.trim();
            const nameIndex = nameRaw.indexOf(name);
            const nameAbsoluteOffset = partAbsoluteOffset + nameIndex;

            const keySpan = new ParseSourceSpan(
              param.sourceSpan.start.moveBy(nameAbsoluteOffset),
              param.sourceSpan.start.moveBy(nameAbsoluteOffset + name.length),
            );

            let valueSpan: ParseSourceSpan | undefined = undefined;
            const variableName =
              expressionParts.length === 2 ? expressionParts[1].trim() : '$error';

            if (expressionParts.length === 2) {
              const valueRaw = expressionParts[1];
              const valueIndex = valueRaw.indexOf(variableName);
              const valueAbsoluteOffset =
                partAbsoluteOffset + expressionParts[0].length + 1 + valueIndex;
              valueSpan = new ParseSourceSpan(
                param.sourceSpan.start.moveBy(valueAbsoluteOffset),
                param.sourceSpan.start.moveBy(valueAbsoluteOffset + variableName.length),
              );
            }

            const sourceSpan = new ParseSourceSpan(keySpan.start, valueSpan?.end ?? keySpan.end);

            if (name.length === 0) {
              errors.push(
                new ParseError(
                  param.sourceSpan,
                  `Invalid @error block "let" parameter. Variable name cannot be empty`,
                ),
              );
            } else if (!IDENTIFIER_PATTERN.test(name)) {
              errors.push(
                new ParseError(
                  param.sourceSpan,
                  `"let" parameter must be a valid JavaScript identifier`,
                ),
              );
            } else if (variableName !== '$error' && variableName !== '$retry') {
              errors.push(
                new ParseError(
                  param.sourceSpan,
                  `Unknown context variable "${variableName}". Only "$error" and "$retry" are allowed`,
                ),
              );
            } else if (contextVariables.some((v) => v.name === name)) {
              errors.push(
                new ParseError(param.sourceSpan, `Duplicate "let" parameter variable "${name}"`),
              );
            } else {
              contextVariables.push(
                new t.Variable(name, variableName, sourceSpan, keySpan, valueSpan),
              );
            }
            currentOffset = partIndex + part.length + 1;
          }
          continue;
        }

        const aliasMatch = param.expression.match(
          /^([$A-Z_][0-9A-Z_$]*)\s*=\s*([$A-Z_][0-9A-Z_$]*)$/i,
        );
        if (aliasMatch) {
          const name = aliasMatch[1];
          const variableName = aliasMatch[2];

          if (variableName !== '$error' && variableName !== '$retry') {
            errors.push(
              new ParseError(
                param.sourceSpan,
                `Unknown context variable "${variableName}". Only "$error" and "$retry" are allowed`,
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
            contextVariables.push(
              new t.Variable(name, variableName, sourceSpan, keySpan, valueSpan),
            );
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
    } else {
      errors.push(
        new ParseError(block.sourceSpan, `Unrecognized @boundary connected block @${block.name}`),
      );
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
