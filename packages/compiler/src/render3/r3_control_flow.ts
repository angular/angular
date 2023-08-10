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

/** Pattern for the expression in a for loop block. */
const FOR_LOOP_EXPRESSION_PATTERN = /^\s*([0-9A-Za-z_$]*)\s+of\s+(.*)/;

/** Pattern for the tracking expression in a for loop block. */
const FOR_LOOP_TRACK_PATTERN = /^track\s+(.*)/;

/** Pattern for the `as` expression in a conditional block. */
const CONDITIONAL_ALIAS_PATTERN = /^as\s+(.*)/;

/** Pattern used to identify an `else if` block. */
const ELSE_IF_PATTERN = /^if\s/;

/** Creates an `if` loop block from an HTML AST node. */
export function createIfBlock(
    ast: html.BlockGroup, visitor: html.Visitor,
    bindingParser: BindingParser): {node: t.IfBlock|null, errors: ParseError[]} {
  const errors: ParseError[] = validateIfBlock(ast);
  const branches: t.IfBlockBranch[] = [];

  if (errors.length > 0) {
    return {node: null, errors};
  }

  // Assumes that the structure is valid since we validated it above.
  for (const block of ast.blocks) {
    const children = html.visitAll(visitor, block.children);

    // `{:else}` block.
    if (block.name === 'else' && block.parameters.length === 0) {
      branches.push(
          new t.IfBlockBranch(null, children, null, block.sourceSpan, block.startSourceSpan));
      continue;
    }

    // Expressions for `{:else if}` blocks start at 2 to skip the `if` from the expression.
    const expressionStart = block.name === 'if' ? 0 : 2;
    const params = parseConditionalBlockParameters(block, errors, bindingParser, expressionStart);

    if (params !== null) {
      branches.push(new t.IfBlockBranch(
          params.expression, children, params.expressionAlias, block.sourceSpan,
          block.startSourceSpan));
    }
  }

  return {
    node: new t.IfBlock(branches, ast.sourceSpan, ast.startSourceSpan, ast.endSourceSpan),
    errors,
  };
}

/** Creates a `for` loop block from an HTML AST node. */
export function createForLoop(
    ast: html.BlockGroup, visitor: html.Visitor,
    bindingParser: BindingParser): {node: t.ForLoopBlock|null, errors: ParseError[]} {
  const [primaryBlock, ...secondaryBlocks] = ast.blocks;
  const errors: ParseError[] = [];
  const params = parseForLoopParameters(primaryBlock, errors, bindingParser);
  let node: t.ForLoopBlock|null = null;
  let empty: t.ForLoopBlockEmpty|null = null;

  for (const block of secondaryBlocks) {
    if (block.name === 'empty') {
      if (empty !== null) {
        errors.push(new ParseError(block.sourceSpan, 'For loop can only have one "empty" block'));
      } else if (block.parameters.length > 0) {
        errors.push(new ParseError(block.sourceSpan, 'Empty block cannot have parameters'));
      } else {
        empty = new t.ForLoopBlockEmpty(
            html.visitAll(visitor, block.children), block.sourceSpan, block.startSourceSpan);
      }
    } else {
      errors.push(new ParseError(block.sourceSpan, `Unrecognized loop block "${block.name}"`));
    }
  }

  if (params !== null) {
    if (params.trackBy === null) {
      errors.push(new ParseError(ast.sourceSpan, 'For loop must have a "track" expression'));
    } else {
      node = new t.ForLoopBlock(
          params.itemName, params.expression, params.trackBy,
          html.visitAll(visitor, primaryBlock.children), empty, ast.sourceSpan, ast.startSourceSpan,
          ast.endSourceSpan);
    }
  }

  return {node, errors};
}

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

/** Parses the parameters of a `for` loop block. */
function parseForLoopParameters(
    block: html.Block, errors: ParseError[], bindingParser: BindingParser) {
  if (block.parameters.length === 0) {
    errors.push(new ParseError(block.sourceSpan, 'For loop does not have an expression'));
    return null;
  }

  const [expressionParam, ...secondaryParams] = block.parameters;
  const match =
      stripOptionalParentheses(expressionParam, errors)?.match(FOR_LOOP_EXPRESSION_PATTERN);

  if (!match || match[2].trim().length === 0) {
    errors.push(new ParseError(
        expressionParam.sourceSpan,
        'Cannot parse expression. For loop expression must match the pattern "<identifier> of <expression>"'));
    return null;
  }

  const [, itemName, rawExpression] = match;
  const result = {
    itemName,
    trackBy: null as string | null,
    expression: bindingParser.parseBinding(
        rawExpression, false, expressionParam.sourceSpan,
        // Note: `lastIndexOf` here should be enough to know the start index of the expression,
        // because we know that it'll be the last matching group. Ideally we could use the `d`
        // flag on the regex and get the index from `match.indices`, but it's unclear if we can
        // use it yet since it's a relatively new feature. See:
        // https://github.com/tc39/proposal-regexp-match-indices
        Math.max(0, expressionParam.expression.lastIndexOf(rawExpression)))
  };

  for (const param of secondaryParams) {
    const trackMatch = param.expression.match(FOR_LOOP_TRACK_PATTERN);

    // For now loops can only have a `track` parameter.
    // We may want to rework this later if we add more.
    if (trackMatch === null) {
      errors.push(
          new ParseError(param.sourceSpan, `Unrecognized loop paramater "${param.expression}"`));
    } else if (result.trackBy !== null) {
      errors.push(
          new ParseError(param.sourceSpan, 'For loop can only have one "track" expression'));
    } else {
      result.trackBy = trackMatch[1].trim();
    }
  }

  return result;
}

/** Checks that the shape of a `if` block is valid. Returns an array of errors. */
function validateIfBlock(ast: html.BlockGroup): ParseError[] {
  const errors: ParseError[] = [];
  let hasElse = false;

  for (let i = 0; i < ast.blocks.length; i++) {
    const block = ast.blocks[i];

    // Conditional blocks only allow `if`, `else if` and `else` blocks.
    if ((block.name !== 'if' || i > 0) && block.name !== 'else') {
      errors.push(
          new ParseError(block.sourceSpan, `Unrecognized conditional block "${block.name}"`));
      continue;
    }

    if (block.name === 'if') {
      continue;
    }

    if (block.parameters.length === 0) {
      if (hasElse) {
        errors.push(new ParseError(block.sourceSpan, 'Conditional can only have one "else" block'));
      } else if (ast.blocks.length > 1 && i < ast.blocks.length - 1) {
        errors.push(
            new ParseError(block.sourceSpan, 'Else block must be last inside the conditional'));
      }
      hasElse = true;

      // `else if` is an edge case, because it has a space after the block name
      // which means that the `if` is captured as a part of the parameters.
    } else if (
        block.parameters.length > 0 && !ELSE_IF_PATTERN.test(block.parameters[0].expression)) {
      errors.push(new ParseError(block.sourceSpan, 'Else block cannot have parameters'));
    }
  }

  return errors;
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
    ast: html.BlockParameter, bindingParser: BindingParser, start = 0): ASTWithSource {
  return bindingParser.parseBinding(
      ast.expression.slice(start), false, ast.sourceSpan, ast.sourceSpan.start.offset + start);
}

/** Parses the parameter of a conditional block (`if` or `else if`). */
function parseConditionalBlockParameters(
    block: html.Block, errors: ParseError[], bindingParser: BindingParser,
    primaryExpressionStart: number) {
  if (block.parameters.length === 0) {
    errors.push(new ParseError(block.sourceSpan, 'Conditional block does not have an expression'));
    return null;
  }

  const expression =
      parseBlockParameterToBinding(block.parameters[0], bindingParser, primaryExpressionStart);
  let expressionAlias: string|null = null;

  // Start from 1 since we processed the first parameter already.
  for (let i = 1; i < block.parameters.length; i++) {
    const param = block.parameters[i];
    const aliasMatch = param.expression.match(CONDITIONAL_ALIAS_PATTERN);

    // For now conditionals can only have an `as` parameter.
    // We may want to rework this later if we add more.
    if (aliasMatch === null) {
      errors.push(new ParseError(
          param.sourceSpan, `Unrecognized conditional paramater "${param.expression}"`));
    } else if (expressionAlias !== null) {
      errors.push(
          new ParseError(param.sourceSpan, 'Conditional can only have one "as" expression'));
    } else {
      expressionAlias = aliasMatch[1].trim();
    }
  }

  return {expression, expressionAlias};
}

/** Strips optional parentheses around from a control from expression parameter. */
function stripOptionalParentheses(param: html.BlockParameter, errors: ParseError[]): string|null {
  const expression = param.expression;
  const spaceRegex = /^\s$/;
  let openParens = 0;
  let start = 0;
  let end = expression.length - 1;

  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];

    if (char === '(') {
      start = i + 1;
      openParens++;
    } else if (spaceRegex.test(char)) {
      continue;
    } else {
      break;
    }
  }

  if (openParens === 0) {
    return expression;
  }

  for (let i = expression.length - 1; i > -1; i--) {
    const char = expression[i];

    if (char === ')') {
      end = i;
      openParens--;
      if (openParens === 0) {
        break;
      }
    } else if (spaceRegex.test(char)) {
      continue;
    } else {
      break;
    }
  }

  if (openParens !== 0) {
    errors.push(new ParseError(param.sourceSpan, 'Unclosed parentheses in expression'));
    return null;
  }

  return expression.slice(start, end);
}
