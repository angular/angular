/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ASTWithSource, EmptyExpr} from '../expression_parser/ast';
import * as html from '../ml_parser/ast';
import {ParseError, ParseSourceSpan} from '../parse_util';
import {BindingParser} from '../template_parser/binding_parser';

import * as t from './r3_ast';

/** Pattern for the expression in a for loop block. */
const FOR_LOOP_EXPRESSION_PATTERN = /^\s*([0-9A-Za-z_$]*)\s+of\s+([\S\s]*)/;

/** Pattern for the tracking expression in a for loop block. */
const FOR_LOOP_TRACK_PATTERN = /^track\s+([\S\s]*)/;

/** Pattern for the `as` expression in a conditional block. */
const CONDITIONAL_ALIAS_PATTERN = /^(as\s+)(.*)/;

/** Pattern used to identify an `else if` block. */
const ELSE_IF_PATTERN = /^else[^\S\r\n]+if/;

/** Pattern used to identify a `let` parameter. */
const FOR_LOOP_LET_PATTERN = /^let\s+([\S\s]*)/;

/** Pattern used to validate a JavaScript identifier. */
const IDENTIFIER_PATTERN = /^[$A-Z_][0-9A-Z_$]*$/i;

/**
 * Pattern to group a string into leading whitespace, non whitespace, and trailing whitespace.
 * Useful for getting the variable name span when a span can contain leading and trailing space.
 */
const CHARACTERS_IN_SURROUNDING_WHITESPACE_PATTERN = /(\s*)(\S+)(\s*)/;

/** Names of variables that are allowed to be used in the `let` expression of a `for` loop. */
const ALLOWED_FOR_LOOP_LET_VARIABLES = new Set([
  '$index',
  '$first',
  '$last',
  '$even',
  '$odd',
  '$count',
]);

/**
 * Predicate function that determines if a block with
 * a specific name cam be connected to a `for` block.
 */
export function isConnectedForLoopBlock(name: string): boolean {
  return name === 'empty';
}

/**
 * Predicate function that determines if a block with
 * a specific name cam be connected to an `if` block.
 */
export function isConnectedIfLoopBlock(name: string): boolean {
  return name === 'else' || ELSE_IF_PATTERN.test(name);
}

/** Creates an `if` loop block from an HTML AST node. */
export function createIfBlock(
  ast: html.Block,
  connectedBlocks: html.Block[],
  visitor: html.Visitor,
  bindingParser: BindingParser,
): {node: t.IfBlock | null; errors: ParseError[]} {
  const errors: ParseError[] = validateIfConnectedBlocks(connectedBlocks);
  const branches: t.IfBlockBranch[] = [];
  const mainBlockParams = parseConditionalBlockParameters(ast, errors, bindingParser);

  if (mainBlockParams !== null) {
    branches.push(
      new t.IfBlockBranch(
        mainBlockParams.expression,
        html.visitAll(visitor, ast.children, ast.children),
        mainBlockParams.expressionAlias,
        ast.sourceSpan,
        ast.startSourceSpan,
        ast.endSourceSpan,
        ast.nameSpan,
        ast.i18n,
      ),
    );
  }

  for (const block of connectedBlocks) {
    if (ELSE_IF_PATTERN.test(block.name)) {
      const params = parseConditionalBlockParameters(block, errors, bindingParser);

      if (params !== null) {
        const children = html.visitAll(visitor, block.children, block.children);
        branches.push(
          new t.IfBlockBranch(
            params.expression,
            children,
            params.expressionAlias,
            block.sourceSpan,
            block.startSourceSpan,
            block.endSourceSpan,
            block.nameSpan,
            block.i18n,
          ),
        );
      }
    } else if (block.name === 'else') {
      const children = html.visitAll(visitor, block.children, block.children);
      branches.push(
        new t.IfBlockBranch(
          null,
          children,
          null,
          block.sourceSpan,
          block.startSourceSpan,
          block.endSourceSpan,
          block.nameSpan,
          block.i18n,
        ),
      );
    }
  }

  // The outer IfBlock should have a span that encapsulates all branches.
  const ifBlockStartSourceSpan =
    branches.length > 0 ? branches[0].startSourceSpan : ast.startSourceSpan;
  const ifBlockEndSourceSpan =
    branches.length > 0 ? branches[branches.length - 1].endSourceSpan : ast.endSourceSpan;

  let wholeSourceSpan = ast.sourceSpan;
  const lastBranch = branches[branches.length - 1];
  if (lastBranch !== undefined) {
    wholeSourceSpan = new ParseSourceSpan(ifBlockStartSourceSpan.start, lastBranch.sourceSpan.end);
  }

  return {
    node: new t.IfBlock(
      branches,
      wholeSourceSpan,
      ast.startSourceSpan,
      ifBlockEndSourceSpan,
      ast.nameSpan,
    ),
    errors,
  };
}

/** Creates a `for` loop block from an HTML AST node. */
export function createForLoop(
  ast: html.Block,
  connectedBlocks: html.Block[],
  visitor: html.Visitor,
  bindingParser: BindingParser,
): {node: t.ForLoopBlock | null; errors: ParseError[]} {
  const errors: ParseError[] = [];
  const params = parseForLoopParameters(ast, errors, bindingParser);
  let node: t.ForLoopBlock | null = null;
  let empty: t.ForLoopBlockEmpty | null = null;

  for (const block of connectedBlocks) {
    if (block.name === 'empty') {
      if (empty !== null) {
        errors.push(new ParseError(block.sourceSpan, '@for loop can only have one @empty block'));
      } else if (block.parameters.length > 0) {
        errors.push(new ParseError(block.sourceSpan, '@empty block cannot have parameters'));
      } else {
        empty = new t.ForLoopBlockEmpty(
          html.visitAll(visitor, block.children, block.children),
          block.sourceSpan,
          block.startSourceSpan,
          block.endSourceSpan,
          block.nameSpan,
          block.i18n,
        );
      }
    } else {
      errors.push(new ParseError(block.sourceSpan, `Unrecognized @for loop block "${block.name}"`));
    }
  }

  if (params !== null) {
    if (params.trackBy === null) {
      // TODO: We should not fail here, and instead try to produce some AST for the language
      // service.
      errors.push(new ParseError(ast.startSourceSpan, '@for loop must have a "track" expression'));
    } else {
      // The `for` block has a main span that includes the `empty` branch. For only the span of the
      // main `for` body, use `mainSourceSpan`.
      const endSpan = empty?.endSourceSpan ?? ast.endSourceSpan;
      const sourceSpan = new ParseSourceSpan(
        ast.sourceSpan.start,
        endSpan?.end ?? ast.sourceSpan.end,
      );
      node = new t.ForLoopBlock(
        params.itemName,
        params.expression,
        params.trackBy.expression,
        params.trackBy.keywordSpan,
        params.context,
        html.visitAll(visitor, ast.children, ast.children),
        empty,
        sourceSpan,
        ast.sourceSpan,
        ast.startSourceSpan,
        endSpan,
        ast.nameSpan,
        ast.i18n,
      );
    }
  }

  return {node, errors};
}

/** Creates a switch block from an HTML AST node. */
export function createSwitchBlock(
  ast: html.Block,
  visitor: html.Visitor,
  bindingParser: BindingParser,
): {node: t.SwitchBlock | null; errors: ParseError[]} {
  const errors = validateSwitchBlock(ast);
  const primaryExpression =
    ast.parameters.length > 0
      ? parseBlockParameterToBinding(ast.parameters[0], bindingParser)
      : bindingParser.parseBinding('', false, ast.sourceSpan, 0);
  const cases: t.SwitchBlockCase[] = [];
  const unknownBlocks: t.UnknownBlock[] = [];
  let defaultCase: t.SwitchBlockCase | null = null;

  // Here we assume that all the blocks are valid given that we validated them above.
  for (const node of ast.children) {
    if (!(node instanceof html.Block)) {
      continue;
    }

    if ((node.name !== 'case' || node.parameters.length === 0) && node.name !== 'default') {
      unknownBlocks.push(new t.UnknownBlock(node.name, node.sourceSpan, node.nameSpan));
      continue;
    }

    const expression =
      node.name === 'case' ? parseBlockParameterToBinding(node.parameters[0], bindingParser) : null;
    const ast = new t.SwitchBlockCase(
      expression,
      html.visitAll(visitor, node.children, node.children),
      node.sourceSpan,
      node.startSourceSpan,
      node.endSourceSpan,
      node.nameSpan,
      node.i18n,
    );

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
      primaryExpression,
      cases,
      unknownBlocks,
      ast.sourceSpan,
      ast.startSourceSpan,
      ast.endSourceSpan,
      ast.nameSpan,
    ),
    errors,
  };
}

/** Parses the parameters of a `for` loop block. */
function parseForLoopParameters(
  block: html.Block,
  errors: ParseError[],
  bindingParser: BindingParser,
) {
  if (block.parameters.length === 0) {
    errors.push(new ParseError(block.startSourceSpan, '@for loop does not have an expression'));
    return null;
  }

  const [expressionParam, ...secondaryParams] = block.parameters;
  const match = stripOptionalParentheses(expressionParam, errors)?.match(
    FOR_LOOP_EXPRESSION_PATTERN,
  );

  if (!match || match[2].trim().length === 0) {
    errors.push(
      new ParseError(
        expressionParam.sourceSpan,
        'Cannot parse expression. @for loop expression must match the pattern "<identifier> of <expression>"',
      ),
    );
    return null;
  }

  const [, itemName, rawExpression] = match;
  if (ALLOWED_FOR_LOOP_LET_VARIABLES.has(itemName)) {
    errors.push(
      new ParseError(
        expressionParam.sourceSpan,
        `@for loop item name cannot be one of ${Array.from(ALLOWED_FOR_LOOP_LET_VARIABLES).join(
          ', ',
        )}.`,
      ),
    );
  }

  // `expressionParam.expression` contains the variable declaration and the expression of the
  // for...of statement, i.e. 'user of users' The variable of a ForOfStatement is _only_ the "const
  // user" part and does not include "of x".
  const variableName = expressionParam.expression.split(' ')[0];
  const variableSpan = new ParseSourceSpan(
    expressionParam.sourceSpan.start,
    expressionParam.sourceSpan.start.moveBy(variableName.length),
  );
  const result = {
    itemName: new t.Variable(itemName, '$implicit', variableSpan, variableSpan),
    trackBy: null as {expression: ASTWithSource; keywordSpan: ParseSourceSpan} | null,
    expression: parseBlockParameterToBinding(expressionParam, bindingParser, rawExpression),
    context: Array.from(ALLOWED_FOR_LOOP_LET_VARIABLES, (variableName) => {
      // Give ambiently-available context variables empty spans at the end of
      // the start of the `for` block, since they are not explicitly defined.
      const emptySpanAfterForBlockStart = new ParseSourceSpan(
        block.startSourceSpan.end,
        block.startSourceSpan.end,
      );
      return new t.Variable(
        variableName,
        variableName,
        emptySpanAfterForBlockStart,
        emptySpanAfterForBlockStart,
      );
    }),
  };

  for (const param of secondaryParams) {
    const letMatch = param.expression.match(FOR_LOOP_LET_PATTERN);

    if (letMatch !== null) {
      const variablesSpan = new ParseSourceSpan(
        param.sourceSpan.start.moveBy(letMatch[0].length - letMatch[1].length),
        param.sourceSpan.end,
      );
      parseLetParameter(
        param.sourceSpan,
        letMatch[1],
        variablesSpan,
        itemName,
        result.context,
        errors,
      );
      continue;
    }

    const trackMatch = param.expression.match(FOR_LOOP_TRACK_PATTERN);

    if (trackMatch !== null) {
      if (result.trackBy !== null) {
        errors.push(
          new ParseError(param.sourceSpan, '@for loop can only have one "track" expression'),
        );
      } else {
        const expression = parseBlockParameterToBinding(param, bindingParser, trackMatch[1]);
        if (expression.ast instanceof EmptyExpr) {
          errors.push(
            new ParseError(block.startSourceSpan, '@for loop must have a "track" expression'),
          );
        }
        const keywordSpan = new ParseSourceSpan(
          param.sourceSpan.start,
          param.sourceSpan.start.moveBy('track'.length),
        );
        result.trackBy = {expression, keywordSpan};
      }
      continue;
    }

    errors.push(
      new ParseError(param.sourceSpan, `Unrecognized @for loop parameter "${param.expression}"`),
    );
  }

  return result;
}

/** Parses the `let` parameter of a `for` loop block. */
function parseLetParameter(
  sourceSpan: ParseSourceSpan,
  expression: string,
  span: ParseSourceSpan,
  loopItemName: string,
  context: t.Variable[],
  errors: ParseError[],
): void {
  const parts = expression.split(',');
  let startSpan = span.start;
  for (const part of parts) {
    const expressionParts = part.split('=');
    const name = expressionParts.length === 2 ? expressionParts[0].trim() : '';
    const variableName = expressionParts.length === 2 ? expressionParts[1].trim() : '';

    if (name.length === 0 || variableName.length === 0) {
      errors.push(
        new ParseError(
          sourceSpan,
          `Invalid @for loop "let" parameter. Parameter should match the pattern "<name> = <variable name>"`,
        ),
      );
    } else if (!ALLOWED_FOR_LOOP_LET_VARIABLES.has(variableName)) {
      errors.push(
        new ParseError(
          sourceSpan,
          `Unknown "let" parameter variable "${variableName}". The allowed variables are: ${Array.from(
            ALLOWED_FOR_LOOP_LET_VARIABLES,
          ).join(', ')}`,
        ),
      );
    } else if (name === loopItemName) {
      errors.push(
        new ParseError(
          sourceSpan,
          `Invalid @for loop "let" parameter. Variable cannot be called "${loopItemName}"`,
        ),
      );
    } else if (context.some((v) => v.name === name)) {
      errors.push(
        new ParseError(sourceSpan, `Duplicate "let" parameter variable "${variableName}"`),
      );
    } else {
      const [, keyLeadingWhitespace, keyName] =
        expressionParts[0].match(CHARACTERS_IN_SURROUNDING_WHITESPACE_PATTERN) ?? [];
      const keySpan =
        keyLeadingWhitespace !== undefined && expressionParts.length === 2
          ? new ParseSourceSpan(
              /* strip leading spaces */
              startSpan.moveBy(keyLeadingWhitespace.length),
              /* advance to end of the variable name */
              startSpan.moveBy(keyLeadingWhitespace.length + keyName.length),
            )
          : span;

      let valueSpan: ParseSourceSpan | undefined = undefined;
      if (expressionParts.length === 2) {
        const [, valueLeadingWhitespace, implicit] =
          expressionParts[1].match(CHARACTERS_IN_SURROUNDING_WHITESPACE_PATTERN) ?? [];
        valueSpan =
          valueLeadingWhitespace !== undefined
            ? new ParseSourceSpan(
                startSpan.moveBy(expressionParts[0].length + 1 + valueLeadingWhitespace.length),
                startSpan.moveBy(
                  expressionParts[0].length + 1 + valueLeadingWhitespace.length + implicit.length,
                ),
              )
            : undefined;
      }
      const sourceSpan = new ParseSourceSpan(keySpan.start, valueSpan?.end ?? keySpan.end);
      context.push(new t.Variable(name, variableName, sourceSpan, keySpan, valueSpan));
    }
    startSpan = startSpan.moveBy(part.length + 1 /* add 1 to move past the comma */);
  }
}

/**
 * Checks that the shape of the blocks connected to an
 * `@if` block is correct. Returns an array of errors.
 */
function validateIfConnectedBlocks(connectedBlocks: html.Block[]): ParseError[] {
  const errors: ParseError[] = [];
  let hasElse = false;

  for (let i = 0; i < connectedBlocks.length; i++) {
    const block = connectedBlocks[i];

    if (block.name === 'else') {
      if (hasElse) {
        errors.push(
          new ParseError(block.startSourceSpan, 'Conditional can only have one @else block'),
        );
      } else if (connectedBlocks.length > 1 && i < connectedBlocks.length - 1) {
        errors.push(
          new ParseError(block.startSourceSpan, '@else block must be last inside the conditional'),
        );
      } else if (block.parameters.length > 0) {
        errors.push(new ParseError(block.startSourceSpan, '@else block cannot have parameters'));
      }
      hasElse = true;
    } else if (!ELSE_IF_PATTERN.test(block.name)) {
      errors.push(
        new ParseError(block.startSourceSpan, `Unrecognized conditional block @${block.name}`),
      );
    }
  }

  return errors;
}

/** Checks that the shape of a `switch` block is valid. Returns an array of errors. */
function validateSwitchBlock(ast: html.Block): ParseError[] {
  const errors: ParseError[] = [];
  let hasDefault = false;

  if (ast.parameters.length !== 1) {
    errors.push(
      new ParseError(ast.startSourceSpan, '@switch block must have exactly one parameter'),
    );
    return errors;
  }

  for (const node of ast.children) {
    // Skip over comments and empty text nodes inside the switch block.
    // Empty text nodes can be used for formatting while comments don't affect the runtime.
    if (
      node instanceof html.Comment ||
      (node instanceof html.Text && node.value.trim().length === 0)
    ) {
      continue;
    }

    if (!(node instanceof html.Block) || (node.name !== 'case' && node.name !== 'default')) {
      errors.push(
        new ParseError(node.sourceSpan, '@switch block can only contain @case and @default blocks'),
      );
      continue;
    }

    if (node.name === 'default') {
      if (hasDefault) {
        errors.push(
          new ParseError(node.startSourceSpan, '@switch block can only have one @default block'),
        );
      } else if (node.parameters.length > 0) {
        errors.push(new ParseError(node.startSourceSpan, '@default block cannot have parameters'));
      }
      hasDefault = true;
    } else if (node.name === 'case' && node.parameters.length !== 1) {
      errors.push(
        new ParseError(node.startSourceSpan, '@case block must have exactly one parameter'),
      );
    }
  }

  return errors;
}

/**
 * Parses a block parameter into a binding AST.
 * @param ast Block parameter that should be parsed.
 * @param bindingParser Parser that the expression should be parsed with.
 * @param part Specific part of the expression that should be parsed.
 */
function parseBlockParameterToBinding(
  ast: html.BlockParameter,
  bindingParser: BindingParser,
  part?: string,
): ASTWithSource {
  let start: number;
  let end: number;

  if (typeof part === 'string') {
    // Note: `lastIndexOf` here should be enough to know the start index of the expression,
    // because we know that it'll be at the end of the param. Ideally we could use the `d`
    // flag when matching via regex and get the index from `match.indices`, but it's unclear
    // if we can use it yet since it's a relatively new feature. See:
    // https://github.com/tc39/proposal-regexp-match-indices
    start = Math.max(0, ast.expression.lastIndexOf(part));
    end = start + part.length;
  } else {
    start = 0;
    end = ast.expression.length;
  }

  return bindingParser.parseBinding(
    ast.expression.slice(start, end),
    false,
    ast.sourceSpan,
    ast.sourceSpan.start.offset + start,
  );
}

/** Parses the parameter of a conditional block (`if` or `else if`). */
function parseConditionalBlockParameters(
  block: html.Block,
  errors: ParseError[],
  bindingParser: BindingParser,
) {
  if (block.parameters.length === 0) {
    errors.push(
      new ParseError(block.startSourceSpan, 'Conditional block does not have an expression'),
    );
    return null;
  }

  const expression = parseBlockParameterToBinding(block.parameters[0], bindingParser);
  let expressionAlias: t.Variable | null = null;

  // Start from 1 since we processed the first parameter already.
  for (let i = 1; i < block.parameters.length; i++) {
    const param = block.parameters[i];
    const aliasMatch = param.expression.match(CONDITIONAL_ALIAS_PATTERN);

    // For now conditionals can only have an `as` parameter.
    // We may want to rework this later if we add more.
    if (aliasMatch === null) {
      errors.push(
        new ParseError(
          param.sourceSpan,
          `Unrecognized conditional parameter "${param.expression}"`,
        ),
      );
    } else if (block.name !== 'if' && !ELSE_IF_PATTERN.test(block.name)) {
      errors.push(
        new ParseError(
          param.sourceSpan,
          '"as" expression is only allowed on `@if` and `@else if` blocks',
        ),
      );
    } else if (expressionAlias !== null) {
      errors.push(
        new ParseError(param.sourceSpan, 'Conditional can only have one "as" expression'),
      );
    } else {
      const name = aliasMatch[2].trim();

      if (IDENTIFIER_PATTERN.test(name)) {
        const variableStart = param.sourceSpan.start.moveBy(aliasMatch[1].length);
        const variableSpan = new ParseSourceSpan(variableStart, variableStart.moveBy(name.length));
        expressionAlias = new t.Variable(name, name, variableSpan, variableSpan);
      } else {
        errors.push(
          new ParseError(param.sourceSpan, '"as" expression must be a valid JavaScript identifier'),
        );
      }
    }
  }

  return {expression, expressionAlias};
}

/** Strips optional parentheses around from a control from expression parameter. */
function stripOptionalParentheses(param: html.BlockParameter, errors: ParseError[]): string | null {
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
