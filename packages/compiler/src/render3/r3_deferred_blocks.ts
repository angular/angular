/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as html from '../ml_parser/ast';
import {ParseError} from '../parse_util';
import {BindingParser} from '../template_parser/binding_parser';

import * as t from './r3_ast';
import {getTriggerParametersStart, parseDeferredTime, parseOnTrigger, parseWhenTrigger} from './r3_deferred_triggers';

/** Pattern to identify a `prefetch when` trigger. */
const PREFETCH_WHEN_PATTERN = /^prefetch\s+when\s/;

/** Pattern to identify a `prefetch on` trigger. */
const PREFETCH_ON_PATTERN = /^prefetch\s+on\s/;

/** Pattern to identify a `minimum` parameter in a block. */
const MINIMUM_PARAMETER_PATTERN = /^minimum\s/;

/** Pattern to identify a `after` parameter in a block. */
const AFTER_PARAMETER_PATTERN = /^after\s/;

/** Pattern to identify a `when` parameter in a block. */
const WHEN_PARAMETER_PATTERN = /^when\s/;

/** Pattern to identify a `on` parameter in a block. */
const ON_PARAMETER_PATTERN = /^on\s/;

/** Possible types of secondary deferred blocks. */
export enum SecondaryDeferredBlockType {
  PLACEHOLDER = 'placeholder',
  LOADING = 'loading',
  ERROR = 'error',
}

/** Creates a deferred block from an HTML AST node. */
export function createDeferredBlock(
    ast: html.BlockGroup, visitor: html.Visitor,
    bindingParser: BindingParser): {node: t.DeferredBlock, errors: ParseError[]} {
  const errors: ParseError[] = [];
  const [primaryBlock, ...secondaryBlocks] = ast.blocks;
  const {triggers, prefetchTriggers} =
      parsePrimaryTriggers(primaryBlock.parameters, bindingParser, errors);
  const {placeholder, loading, error} = parseSecondaryBlocks(secondaryBlocks, errors, visitor);

  return {
    node: new t.DeferredBlock(
        html.visitAll(visitor, primaryBlock.children), triggers, prefetchTriggers, placeholder,
        loading, error, ast.sourceSpan, ast.startSourceSpan, ast.endSourceSpan),
    errors,
  };
}

function parseSecondaryBlocks(blocks: html.Block[], errors: ParseError[], visitor: html.Visitor) {
  let placeholder: t.DeferredBlockPlaceholder|null = null;
  let loading: t.DeferredBlockLoading|null = null;
  let error: t.DeferredBlockError|null = null;

  for (const block of blocks) {
    try {
      switch (block.name) {
        case SecondaryDeferredBlockType.PLACEHOLDER:
          if (placeholder !== null) {
            errors.push(new ParseError(
                block.startSourceSpan,
                `"defer" block can only have one "${
                    SecondaryDeferredBlockType.PLACEHOLDER}" block`));
          } else {
            placeholder = parsePlaceholderBlock(block, visitor);
          }
          break;

        case SecondaryDeferredBlockType.LOADING:
          if (loading !== null) {
            errors.push(new ParseError(
                block.startSourceSpan,
                `"defer" block can only have one "${SecondaryDeferredBlockType.LOADING}" block`));
          } else {
            loading = parseLoadingBlock(block, visitor);
          }
          break;

        case SecondaryDeferredBlockType.ERROR:
          if (error !== null) {
            errors.push(new ParseError(
                block.startSourceSpan,
                `"defer" block can only have one "${SecondaryDeferredBlockType.ERROR}" block`));
          } else {
            error = parseErrorBlock(block, visitor);
          }
          break;

        default:
          errors.push(new ParseError(block.startSourceSpan, `Unrecognized block "${block.name}"`));
          break;
      }
    } catch (e) {
      errors.push(new ParseError(block.startSourceSpan, (e as Error).message));
    }
  }

  return {placeholder, loading, error};
}

function parsePlaceholderBlock(ast: html.Block, visitor: html.Visitor): t.DeferredBlockPlaceholder {
  let minimumTime: number|null = null;

  for (const param of ast.parameters) {
    if (MINIMUM_PARAMETER_PATTERN.test(param.expression)) {
      const parsedTime =
          parseDeferredTime(param.expression.slice(getTriggerParametersStart(param.expression)));

      if (parsedTime === null) {
        throw new Error(`Could not parse time value of parameter "minimum"`);
      }

      minimumTime = parsedTime;
    } else {
      throw new Error(`Unrecognized parameter in "${
          SecondaryDeferredBlockType.PLACEHOLDER}" block: "${param.expression}"`);
    }
  }

  return new t.DeferredBlockPlaceholder(
      html.visitAll(visitor, ast.children), minimumTime, ast.sourceSpan, ast.startSourceSpan,
      ast.endSourceSpan);
}

function parseLoadingBlock(ast: html.Block, visitor: html.Visitor): t.DeferredBlockLoading {
  let afterTime: number|null = null;
  let minimumTime: number|null = null;

  for (const param of ast.parameters) {
    if (AFTER_PARAMETER_PATTERN.test(param.expression)) {
      const parsedTime =
          parseDeferredTime(param.expression.slice(getTriggerParametersStart(param.expression)));

      if (parsedTime === null) {
        throw new Error(`Could not parse time value of parameter "after"`);
      }

      afterTime = parsedTime;
    } else if (MINIMUM_PARAMETER_PATTERN.test(param.expression)) {
      const parsedTime =
          parseDeferredTime(param.expression.slice(getTriggerParametersStart(param.expression)));

      if (parsedTime === null) {
        throw new Error(`Could not parse time value of parameter "minimum"`);
      }

      minimumTime = parsedTime;
    } else {
      throw new Error(`Unrecognized parameter in "${SecondaryDeferredBlockType.LOADING}" block: "${
          param.expression}"`);
    }
  }

  return new t.DeferredBlockLoading(
      html.visitAll(visitor, ast.children), afterTime, minimumTime, ast.sourceSpan,
      ast.startSourceSpan, ast.endSourceSpan);
}


function parseErrorBlock(ast: html.Block, visitor: html.Visitor): t.DeferredBlockError {
  if (ast.parameters.length > 0) {
    throw new Error(`"${SecondaryDeferredBlockType.ERROR}" block cannot have parameters`);
  }

  return new t.DeferredBlockError(
      html.visitAll(visitor, ast.children), ast.sourceSpan, ast.startSourceSpan, ast.endSourceSpan);
}

function parsePrimaryTriggers(
    params: html.BlockParameter[], bindingParser: BindingParser, errors: ParseError[]) {
  const triggers: t.DeferredTrigger[] = [];
  const prefetchTriggers: t.DeferredTrigger[] = [];

  for (const param of params) {
    // The lexer ignores the leading spaces so we can assume
    // that the expression starts with a keyword.
    if (WHEN_PARAMETER_PATTERN.test(param.expression)) {
      const result = parseWhenTrigger(param, bindingParser, errors);
      result !== null && triggers.push(result);
    } else if (ON_PARAMETER_PATTERN.test(param.expression)) {
      triggers.push(...parseOnTrigger(param, errors));
    } else if (PREFETCH_WHEN_PATTERN.test(param.expression)) {
      const result = parseWhenTrigger(param, bindingParser, errors);
      result !== null && prefetchTriggers.push(result);
    } else if (PREFETCH_ON_PATTERN.test(param.expression)) {
      prefetchTriggers.push(...parseOnTrigger(param, errors));
    } else {
      errors.push(new ParseError(param.sourceSpan, 'Unrecognized trigger'));
    }
  }

  return {triggers, prefetchTriggers};
}
