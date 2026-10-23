/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as html from '../ml_parser/ast';
import {ParseError, ParseSourceSpan} from '../parse_util';
import {BindingParser} from '../template_parser/binding_parser';

import * as t from './r3_ast';
import {
  getTriggerParametersStart,
  parseDeferredTime,
  parseNeverTrigger,
  parseOnTrigger,
  parseWhenTrigger,
} from './r3_deferred_triggers';
import {LET_PATTERN, parseLetParameters} from './util';

/** Pattern to identify a `prefetch when` trigger. */
const PREFETCH_WHEN_PATTERN = /^prefetch\s+when\s/;

/** Pattern to identify a `prefetch on` trigger. */
const PREFETCH_ON_PATTERN = /^prefetch\s+on\s/;

/** Pattern to identify a `hydrate when` trigger. */
const HYDRATE_WHEN_PATTERN = /^hydrate\s+when\s/;

/** Pattern to identify a `hydrate on` trigger. */
const HYDRATE_ON_PATTERN = /^hydrate\s+on\s/;

/** Pattern to identify a `hydrate never` trigger. */
const HYDRATE_NEVER_PATTERN = /^hydrate\s+never(\s*)$/;

/** Pattern to identify a `minimum` parameter in a block. */
const MINIMUM_PARAMETER_PATTERN = /^minimum\s/;

/** Pattern to identify a `after` parameter in a block. */
const AFTER_PARAMETER_PATTERN = /^after\s/;

/** Pattern to identify a `when` parameter in a block. */
const WHEN_PARAMETER_PATTERN = /^when\s/;

/** Pattern to identify a `on` parameter in a block. */
const ON_PARAMETER_PATTERN = /^on\s/;

/** Pattern to identify a `name` parameter in a block. */
const NAME_PARAMETER_PATTERN = /^name\s+/;

/** Pattern to identify a `retry` parameter in a block. */
const RETRY_PARAMETER_PATTERN = /^retry(\s|$)/;

/** Pattern to identify an alias without `let`, e.g. `retry = $retry`. */
const ALIAS_PARAMETER_PATTERN = /^\s*[$A-Z_][0-9A-Z_$]*\s*=/i;

/**
 * Predicate function that determines if a block with
 * a specific name cam be connected to a `defer` block.
 */
export function isConnectedDeferLoopBlock(name: string): boolean {
  return name === 'placeholder' || name === 'loading' || name === 'error';
}

/** Creates a deferred block from an HTML AST node. */
export function createDeferredBlock(
  ast: html.Block,
  connectedBlocks: html.Block[],
  visitor: html.Visitor,
  bindingParser: BindingParser,
): {node: t.DeferredBlock; errors: ParseError[]} {
  const errors: ParseError[] = [];
  const {placeholder, loading, error} = parseConnectedBlocks(connectedBlocks, errors, visitor);
  const {triggers, prefetchTriggers, hydrateTriggers, definedName} = parsePrimaryTriggers(
    ast,
    bindingParser,
    errors,
    placeholder,
  );

  // The `defer` block has a main span encompassing all of the connected branches as well.
  let lastEndSourceSpan = ast.endSourceSpan;
  let endOfLastSourceSpan = ast.sourceSpan.end;
  if (connectedBlocks.length > 0) {
    const lastConnectedBlock = connectedBlocks[connectedBlocks.length - 1];
    lastEndSourceSpan = lastConnectedBlock.endSourceSpan;
    endOfLastSourceSpan = lastConnectedBlock.sourceSpan.end;
  }

  const sourceSpanWithConnectedBlocks = new ParseSourceSpan(
    ast.sourceSpan.start,
    endOfLastSourceSpan,
  );

  const node = new t.DeferredBlock(
    html.visitAll(visitor, ast.children, ast.children),
    triggers,
    prefetchTriggers,
    hydrateTriggers,
    placeholder,
    loading,
    error,
    ast.nameSpan,
    sourceSpanWithConnectedBlocks,
    ast.sourceSpan,
    ast.startSourceSpan,
    lastEndSourceSpan,
    definedName,
    ast.i18n,
  );

  return {node, errors};
}

function parseConnectedBlocks(
  connectedBlocks: html.Block[],
  errors: ParseError[],
  visitor: html.Visitor,
) {
  let placeholder: t.DeferredBlockPlaceholder | null = null;
  let loading: t.DeferredBlockLoading | null = null;
  let error: t.DeferredBlockError | null = null;

  for (const block of connectedBlocks) {
    try {
      if (!isConnectedDeferLoopBlock(block.name)) {
        errors.push(new ParseError(block.startSourceSpan, `Unrecognized block "@${block.name}"`));
        break;
      }

      switch (block.name) {
        case 'placeholder':
          if (placeholder !== null) {
            errors.push(
              new ParseError(
                block.startSourceSpan,
                `@defer block can only have one @placeholder block`,
              ),
            );
          } else {
            placeholder = parsePlaceholderBlock(block, visitor);
          }
          break;

        case 'loading':
          if (loading !== null) {
            errors.push(
              new ParseError(
                block.startSourceSpan,
                `@defer block can only have one @loading block`,
              ),
            );
          } else {
            loading = parseLoadingBlock(block, visitor);
          }
          break;

        case 'error':
          if (error !== null) {
            errors.push(
              new ParseError(block.startSourceSpan, `@defer block can only have one @error block`),
            );
          } else {
            error = parseErrorBlock(block, visitor, errors);
          }
          break;
      }
    } catch (e) {
      errors.push(new ParseError(block.startSourceSpan, (e as Error).message));
    }
  }

  return {placeholder, loading, error};
}

function parsePlaceholderBlock(ast: html.Block, visitor: html.Visitor): t.DeferredBlockPlaceholder {
  let minimumTime: number | null = null;

  for (const param of ast.parameters) {
    if (MINIMUM_PARAMETER_PATTERN.test(param.expression)) {
      if (minimumTime != null) {
        throw new Error(`@placeholder block can only have one "minimum" parameter`);
      }

      const parsedTime = parseDeferredTime(
        param.expression.slice(getTriggerParametersStart(param.expression)),
      );

      if (parsedTime === null) {
        throw new Error(`Could not parse time value of parameter "minimum"`);
      }

      minimumTime = parsedTime;
    } else {
      throw new Error(`Unrecognized parameter in @placeholder block: "${param.expression}"`);
    }
  }

  return new t.DeferredBlockPlaceholder(
    html.visitAll(visitor, ast.children, ast.children),
    minimumTime,
    ast.nameSpan,
    ast.sourceSpan,
    ast.startSourceSpan,
    ast.endSourceSpan,
    ast.i18n,
  );
}

function parseLoadingBlock(ast: html.Block, visitor: html.Visitor): t.DeferredBlockLoading {
  let afterTime: number | null = null;
  let minimumTime: number | null = null;

  for (const param of ast.parameters) {
    if (AFTER_PARAMETER_PATTERN.test(param.expression)) {
      if (afterTime != null) {
        throw new Error(`@loading block can only have one "after" parameter`);
      }

      const parsedTime = parseDeferredTime(
        param.expression.slice(getTriggerParametersStart(param.expression)),
      );

      if (parsedTime === null) {
        throw new Error(`Could not parse time value of parameter "after"`);
      }

      afterTime = parsedTime;
    } else if (MINIMUM_PARAMETER_PATTERN.test(param.expression)) {
      if (minimumTime != null) {
        throw new Error(`@loading block can only have one "minimum" parameter`);
      }

      const parsedTime = parseDeferredTime(
        param.expression.slice(getTriggerParametersStart(param.expression)),
      );

      if (parsedTime === null) {
        throw new Error(`Could not parse time value of parameter "minimum"`);
      }

      minimumTime = parsedTime;
    } else {
      throw new Error(`Unrecognized parameter in @loading block: "${param.expression}"`);
    }
  }

  return new t.DeferredBlockLoading(
    html.visitAll(visitor, ast.children, ast.children),
    afterTime,
    minimumTime,
    ast.nameSpan,
    ast.sourceSpan,
    ast.startSourceSpan,
    ast.endSourceSpan,
    ast.i18n,
  );
}

function parseErrorBlock(
  ast: html.Block,
  visitor: html.Visitor,
  errors: ParseError[],
): t.DeferredBlockError {
  let retryCount: number | null = null;
  const emptySpan = new ParseSourceSpan(ast.startSourceSpan.end, ast.startSourceSpan.end);
  const contextVariables: t.Variable[] = [
    new t.Variable('$error', '$error', emptySpan, emptySpan, emptySpan),
    new t.Variable('$retry', '$retry', emptySpan, emptySpan, emptySpan),
  ];

  for (const param of ast.parameters) {
    const letMatch = param.expression.match(LET_PATTERN);

    // Check aliases first, since `retry = $retry` also matches the `retry` parameter.
    if (letMatch !== null || ALIAS_PARAMETER_PATTERN.test(param.expression)) {
      const expressionToParse = letMatch !== null ? letMatch[1] : param.expression;
      const variablesSpan =
        letMatch !== null
          ? new ParseSourceSpan(
              param.sourceSpan.start.moveBy(letMatch[0].length - letMatch[1].length),
              param.sourceSpan.end,
            )
          : param.sourceSpan;

      parseLetParameters(
        param.sourceSpan,
        expressionToParse,
        variablesSpan,
        contextVariables,
        errors,
        (name, variableName, sourceSpan) => {
          if (variableName !== '$error' && variableName !== '$retry') {
            errors.push(
              new ParseError(
                sourceSpan,
                `Unknown context variable "${variableName}". Only "$error" and "$retry" are allowed`,
              ),
            );
          } else if (contextVariables.some((v) => v.name === name)) {
            errors.push(new ParseError(sourceSpan, `Duplicate "let" parameter variable "${name}"`));
          }
        },
        '@error block',
        '$error',
      );
    } else if (RETRY_PARAMETER_PATTERN.test(param.expression)) {
      if (retryCount != null) {
        errors.push(
          new ParseError(param.sourceSpan, `@error block can only have one "retry" parameter`),
        );
        continue;
      }

      const valueStart = getTriggerParametersStart(param.expression);
      const rawValue = valueStart === -1 ? '' : param.expression.slice(valueStart).trim();

      if (rawValue === '') {
        errors.push(
          new ParseError(
            param.sourceSpan,
            `The "retry" parameter requires a value, e.g. "retry 2"`,
          ),
        );
        continue;
      }

      const parsed = parseRetryCount(rawValue);

      if (parsed === null) {
        errors.push(
          new ParseError(
            param.sourceSpan,
            `Could not parse value of "retry" parameter: expected a non-negative integer ` +
              `within JavaScript's safe integer range, got "${rawValue}"`,
          ),
        );
        continue;
      }

      retryCount = parsed;
    } else {
      errors.push(
        new ParseError(
          param.sourceSpan,
          `Unrecognized parameter in @error block: "${param.expression}"`,
        ),
      );
    }
  }

  return new t.DeferredBlockError(
    html.visitAll(visitor, ast.children, ast.children),
    ast.nameSpan,
    ast.sourceSpan,
    ast.startSourceSpan,
    ast.endSourceSpan,
    ast.i18n,
    retryCount,
    contextVariables,
  );
}

function parseRetryCount(value: string): number | null {
  if (!/^\d+$/.test(value)) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

function parsePrimaryTriggers(
  ast: html.Block,
  bindingParser: BindingParser,
  errors: ParseError[],
  placeholder: t.DeferredBlockPlaceholder | null,
) {
  const triggers: t.DeferredBlockTriggers = {};
  const prefetchTriggers: t.DeferredBlockTriggers = {};
  const hydrateTriggers: t.DeferredBlockTriggers = {};
  let definedName: string | null = null;

  for (const param of ast.parameters) {
    // The lexer ignores the leading spaces so we can assume
    // that the expression starts with a keyword.
    if (WHEN_PARAMETER_PATTERN.test(param.expression)) {
      parseWhenTrigger(param, bindingParser, triggers, errors);
    } else if (ON_PARAMETER_PATTERN.test(param.expression)) {
      parseOnTrigger(param, bindingParser, triggers, errors, placeholder);
    } else if (PREFETCH_WHEN_PATTERN.test(param.expression)) {
      parseWhenTrigger(param, bindingParser, prefetchTriggers, errors);
    } else if (PREFETCH_ON_PATTERN.test(param.expression)) {
      parseOnTrigger(param, bindingParser, prefetchTriggers, errors, placeholder);
    } else if (HYDRATE_WHEN_PATTERN.test(param.expression)) {
      parseWhenTrigger(param, bindingParser, hydrateTriggers, errors);
    } else if (HYDRATE_ON_PATTERN.test(param.expression)) {
      parseOnTrigger(param, bindingParser, hydrateTriggers, errors, placeholder);
    } else if (HYDRATE_NEVER_PATTERN.test(param.expression)) {
      parseNeverTrigger(param, hydrateTriggers, errors);
    } else if (NAME_PARAMETER_PATTERN.test(param.expression)) {
      if (definedName !== null) {
        errors.push(new ParseError(param.sourceSpan, 'Cannot specify multiple name parameters'));
      } else {
        const name = param.expression.slice(5).trim();
        if (
          name.startsWith("'") ||
          name.startsWith('"') ||
          name.endsWith("'") ||
          name.endsWith('"')
        ) {
          errors.push(
            new ParseError(param.sourceSpan, 'Block names cannot be quoted in @defer blocks'),
          );
        } else if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
          errors.push(new ParseError(param.sourceSpan, `Invalid block name "${name}"`));
        } else {
          definedName = name;
        }
      }
    } else {
      errors.push(new ParseError(param.sourceSpan, 'Unrecognized trigger'));
    }
  }

  if (hydrateTriggers.never && Object.keys(hydrateTriggers).length > 1) {
    errors.push(
      new ParseError(
        ast.startSourceSpan,
        'Cannot specify additional `hydrate` triggers if `hydrate never` is present',
      ),
    );
  }

  return {triggers, prefetchTriggers, hydrateTriggers, definedName};
}
