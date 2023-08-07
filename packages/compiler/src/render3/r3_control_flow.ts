/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ASTWithSource} from '../expression_parser/ast';
import * as html from '../ml_parser/ast';
import {ParseError} from '../parse_util';
import {BindingParser} from '../template_parser/binding_parser';

import * as t from './r3_ast';


/** Creates a switch block from an HTML AST node. */
export function createSwitchBlock(
    ast: html.BlockGroup, visitor: html.Visitor,
    bindingParser: BindingParser): {node: t.SwitchBlock|null, errors: ParseError[]} {
  const [primaryBlock, ...secondaryBlocks] = ast.blocks;
  const errors = validateSwitchBlock(ast);

  if (errors.length > 0) {
    return {node: null, errors};
  }

  const primaryExpression = parseBlockParameterToBinding(primaryBlock.parameters[0], bindingParser);
  const cases: t.SwitchBlockCase[] = [];
  let defaultCase: t.SwitchBlockCase|null = null;

  // Here we assume that all the blocks are valid given that we validated them above.
  for (const block of secondaryBlocks) {
    const expression = block.name === 'case' ?
        parseBlockParameterToBinding(block.parameters[0], bindingParser) :
        null;
    const ast = new t.SwitchBlockCase(
        expression, html.visitAll(visitor, block.children), block.sourceSpan,
        block.startSourceSpan);

    if (expression === null) {
      defaultCase = ast;
    } else {
      cases.push(ast);
    }
  }

  // Ensure that the default case is last in the array.
  if (defaultCase !== null) {
    cases.push(defaultCase);
  }

  return {
    node: new t.SwitchBlock(
        primaryExpression, cases, ast.sourceSpan, ast.startSourceSpan, ast.endSourceSpan),
    errors
  };
}

/** Checks that the shape of a `switch` block is valid. Returns an array of errors. */
function validateSwitchBlock(ast: html.BlockGroup): ParseError[] {
  const [primaryBlock, ...secondaryBlocks] = ast.blocks;
  const errors: ParseError[] = [];
  let hasDefault = false;

  if (primaryBlock.children.length > 0) {
    errors.push(new ParseError(
        primaryBlock.sourceSpan, 'Switch block can only contain "case" and "default" blocks'));
  }

  if (primaryBlock.parameters.length !== 1) {
    errors.push(
        new ParseError(primaryBlock.sourceSpan, 'Switch block must have exactly one parameter'));
  }

  for (const block of secondaryBlocks) {
    if (block.name === 'case') {
      if (block.parameters.length !== 1) {
        errors.push(new ParseError(block.sourceSpan, 'Case block must have exactly one parameter'));
      }
    } else if (block.name === 'default') {
      if (hasDefault) {
        errors.push(
            new ParseError(block.sourceSpan, 'Switch block can only have one "default" block'));
      } else if (block.parameters.length > 0) {
        errors.push(new ParseError(block.sourceSpan, 'Default block cannot have parameters'));
      }
      hasDefault = true;
    } else {
      errors.push(new ParseError(
          block.sourceSpan, 'Switch block can only contain "case" and "default" blocks'));
    }
  }

  return errors;
}

/** Parses a block parameter into a binding AST. */
function parseBlockParameterToBinding(
    ast: html.BlockParameter, bindingParser: BindingParser): ASTWithSource {
  return bindingParser.parseBinding(
      ast.expression, false, ast.sourceSpan, ast.sourceSpan.start.offset);
}
