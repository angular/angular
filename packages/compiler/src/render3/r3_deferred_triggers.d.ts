/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as html from '../ml_parser/ast';
import { ParseError } from '../parse_util';
import { BindingParser } from '../template_parser/binding_parser';
import * as t from './r3_ast';
/** Parses a `when` deferred trigger. */
export declare function parseNeverTrigger({ expression, sourceSpan }: html.BlockParameter, triggers: t.DeferredBlockTriggers, errors: ParseError[]): void;
/** Parses a `when` deferred trigger. */
export declare function parseWhenTrigger({ expression, sourceSpan }: html.BlockParameter, bindingParser: BindingParser, triggers: t.DeferredBlockTriggers, errors: ParseError[]): void;
/** Parses an `on` trigger */
export declare function parseOnTrigger({ expression, sourceSpan }: html.BlockParameter, triggers: t.DeferredBlockTriggers, errors: ParseError[], placeholder: t.DeferredBlockPlaceholder | null): void;
/** Gets the index within an expression at which the trigger parameters start. */
export declare function getTriggerParametersStart(value: string, startPosition?: number): number;
/**
 * Parses a time expression from a deferred trigger to
 * milliseconds. Returns null if it cannot be parsed.
 */
export declare function parseDeferredTime(value: string): number | null;
