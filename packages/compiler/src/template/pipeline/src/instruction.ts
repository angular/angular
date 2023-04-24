/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../output/output_ast';
import {Identifiers} from '../../../render3/r3_identifiers';
import * as ir from '../ir';

// This file contains helpers for generating calls to Ivy instructions. In particular, each
// instruction type is represented as a function, which may select a specific instruction variant
// depending on the exact arguments.

export function element(
    slot: number, tag: string, constIndex: number|null, localRefIndex: number|null): ir.CreateOp {
  return elementStartBase(Identifiers.element, slot, tag, constIndex, localRefIndex);
}


export function elementStart(
    slot: number, tag: string, constIndex: number|null, localRefIndex: number|null): ir.CreateOp {
  return elementStartBase(Identifiers.elementStart, slot, tag, constIndex, localRefIndex);
}

function elementStartBase(
    instruction: o.ExternalReference, slot: number, tag: string, constIndex: number|null,
    localRefIndex: number|null): ir.CreateOp {
  const args: o.Expression[] = [
    o.literal(slot),
    o.literal(tag),
  ];
  if (localRefIndex !== null) {
    args.push(
        o.literal(constIndex),  // might be null, but that's okay.
        o.literal(localRefIndex),
    );
  } else if (constIndex !== null) {
    args.push(o.literal(constIndex));
  }

  return call(instruction, args);
}

export function elementEnd(): ir.CreateOp {
  return call(Identifiers.elementEnd, []);
}

export function template(
    slot: number, templateFnRef: o.Expression, decls: number, vars: number, tag: string,
    constIndex: number): ir.CreateOp {
  return call(Identifiers.templateCreate, [
    o.literal(slot),
    templateFnRef,
    o.literal(decls),
    o.literal(vars),
    o.literal(tag),
    o.literal(constIndex),
  ]);
}

export function listener(name: string, handlerFn: o.Expression): ir.CreateOp {
  return call(Identifiers.listener, [
    o.literal(name),
    handlerFn,
  ]);
}

export function advance(delta: number): ir.UpdateOp {
  return call(Identifiers.advance, [
    o.literal(delta),
  ]);
}

export function reference(slot: number): o.Expression {
  return o.importExpr(Identifiers.reference).callFn([
    o.literal(slot),
  ]);
}

export function nextContext(steps: number): o.Expression {
  return o.importExpr(Identifiers.nextContext).callFn(steps === 1 ? [] : [o.literal(steps)]);
}


export function getCurrentView(): o.Expression {
  return o.importExpr(Identifiers.getCurrentView).callFn([]);
}


export function restoreView(savedView: o.Expression): o.Expression {
  return o.importExpr(Identifiers.restoreView).callFn([
    savedView,
  ]);
}


export function resetView(returnValue: o.Expression): o.Expression {
  return o.importExpr(Identifiers.resetView).callFn([
    returnValue,
  ]);
}

export function text(slot: number, initialValue: string): ir.CreateOp {
  const args: o.Expression[] = [o.literal(slot)];
  if (initialValue !== '') {
    args.push(o.literal(initialValue));
  }
  return call(Identifiers.text, args);
}

export function property(name: string, expression: o.Expression): ir.UpdateOp {
  return call(Identifiers.property, [
    o.literal(name),
    expression,
  ]);
}

export function textInterpolate(strings: string[], expressions: o.Expression[]): ir.UpdateOp {
  if (strings.length < 1 || expressions.length !== strings.length - 1) {
    throw new Error(
        `AssertionError: expected specific shape of args for strings/expressions in interpolation`);
  }
  const interpolationArgs: o.Expression[] = [];

  if (expressions.length === 1 && strings[0] === '' && strings[1] === '') {
    interpolationArgs.push(expressions[0]);
  } else {
    let idx: number;
    for (idx = 0; idx < expressions.length; idx++) {
      interpolationArgs.push(o.literal(strings[idx]), expressions[idx]);
    }
    // idx points at the last string.
    interpolationArgs.push(o.literal(strings[idx]));
  }

  return callInterpolation(TEXT_INTERPOLATE_CONFIG, [], interpolationArgs);
}



function call<OpT extends ir.CreateOp|ir.UpdateOp>(
    instruction: o.ExternalReference, args: o.Expression[]): OpT {
  return ir.createStatementOp(o.importExpr(instruction).callFn(args).toStmt()) as OpT;
}

/**
 * Describes a specific flavor of instruction used to represent interpolations, which have some
 * number of variants for specific argument counts.
 */
interface InterpolationConfig {
  constant: o.ExternalReference[];
  variable: o.ExternalReference;
}

/**
 * `InterpolationConfig` for the `textInterpolate` instruction.
 */
const TEXT_INTERPOLATE_CONFIG: InterpolationConfig = {
  constant: [
    Identifiers.textInterpolate,
    Identifiers.textInterpolate1,
    Identifiers.textInterpolate2,
    Identifiers.textInterpolate3,
    Identifiers.textInterpolate4,
    Identifiers.textInterpolate5,
    Identifiers.textInterpolate6,
    Identifiers.textInterpolate7,
    Identifiers.textInterpolate8,
  ],
  variable: Identifiers.textInterpolateV,
};

function callInterpolation(
    config: InterpolationConfig, baseArgs: o.Expression[],
    interpolationArgs: o.Expression[]): ir.UpdateOp {
  if (interpolationArgs.length % 2 === 0) {
    throw new Error(`Expected odd number of interpolation arguments`);
  }
  const n = (interpolationArgs.length - 1) / 2;
  if (n < config.constant.length) {
    // Constant calling pattern.
    return call(config.constant[n], [...baseArgs, ...interpolationArgs]);
  } else {
    // Variable calling pattern.
    return call(config.variable, [...baseArgs, o.literalArr(interpolationArgs)]);
  }
}
