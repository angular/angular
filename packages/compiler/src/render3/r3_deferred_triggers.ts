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

/** Pattern for a timing value in a trigger. */
const TIME_PATTERN = /^\d+(ms|s)?$/;

/** Parses a `when` deferred trigger. */
export function parseWhenTrigger(
    {expression, sourceSpan}: html.BlockParameter, bindingParser: BindingParser,
    errors: ParseError[]): t.BoundDeferredTrigger|null {
  // TODO
  return null;
}

/** Parses an `on` trigger */
export function parseOnTrigger(
    {expression, sourceSpan}: html.BlockParameter, errors: ParseError[]): t.DeferredTrigger[] {
  //
  return [];
}

/** Gets the index within an expression at which the trigger parameters start. */
export function getTriggerParametersStart(value: string, startPosition = 0): number {
  let start = value.indexOf(' ', startPosition);

  if (start === -1) {
    return startPosition;
  }

  while (value[start] === ' ') {
    start++;
  }

  return start;
}

/**
 * Parses a time expression from a deferred trigger to
 * milliseconds. Returns null if it cannot be parsed.
 */
export function parseDeferredTime(value: string): number|null {
  const match = value.match(TIME_PATTERN);

  if (!match) {
    return null;
  }

  const [time, units] = match;
  return parseInt(time) * (units === 's' ? 1000 : 1);
}
