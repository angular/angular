/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../output/output_ast';
import {ParseSourceSpan} from '../../../parse_util';
import {Identifiers} from '../../../render3/r3_identifiers';
import * as ir from '../ir';

// This file contains helpers for generating calls to Ivy instructions. In particular, each
// instruction type is represented as a function, which may select a specific instruction variant
// depending on the exact arguments.

export function element(
    slot: number, tag: string, constIndex: number|null, localRefIndex: number|null,
    sourceSpan: ParseSourceSpan): ir.CreateOp {
  return elementOrContainerBase(
      Identifiers.element, slot, tag, constIndex, localRefIndex, sourceSpan);
}

export function elementStart(
    slot: number, tag: string, constIndex: number|null, localRefIndex: number|null,
    sourceSpan: ParseSourceSpan): ir.CreateOp {
  return elementOrContainerBase(
      Identifiers.elementStart, slot, tag, constIndex, localRefIndex, sourceSpan);
}

function elementOrContainerBase(
    instruction: o.ExternalReference, slot: number, tag: string|null, constIndex: number|null,
    localRefIndex: number|null, sourceSpan: ParseSourceSpan): ir.CreateOp {
  const args: o.Expression[] = [o.literal(slot)];
  if (tag !== null) {
    args.push(o.literal(tag));
  }
  if (localRefIndex !== null) {
    args.push(
        o.literal(constIndex),  // might be null, but that's okay.
        o.literal(localRefIndex),
    );
  } else if (constIndex !== null) {
    args.push(o.literal(constIndex));
  }

  return call(instruction, args, sourceSpan);
}

export function elementEnd(sourceSpan: ParseSourceSpan|null): ir.CreateOp {
  return call(Identifiers.elementEnd, [], sourceSpan);
}

export function elementContainerStart(
    slot: number, constIndex: number|null, localRefIndex: number|null,
    sourceSpan: ParseSourceSpan): ir.CreateOp {
  return elementOrContainerBase(
      Identifiers.elementContainerStart, slot, /* tag */ null, constIndex, localRefIndex,
      sourceSpan);
}

export function elementContainer(
    slot: number, constIndex: number|null, localRefIndex: number|null,
    sourceSpan: ParseSourceSpan): ir.CreateOp {
  return elementOrContainerBase(
      Identifiers.elementContainer, slot, /* tag */ null, constIndex, localRefIndex, sourceSpan);
}

export function elementContainerEnd(): ir.CreateOp {
  return call(Identifiers.elementContainerEnd, [], null);
}

export function template(
    slot: number, templateFnRef: o.Expression, decls: number, vars: number, tag: string|null,
    constIndex: number|null, sourceSpan: ParseSourceSpan): ir.CreateOp {
  const args = [o.literal(slot), templateFnRef, o.literal(decls), o.literal(vars)];
  if (tag !== null) {
    args.push(o.literal(tag));
    if (constIndex !== null) {
      args.push(o.literal(constIndex));
    }
  }
  return call(Identifiers.templateCreate, args, sourceSpan);
}

export function disableBindings(): ir.CreateOp {
  return call(Identifiers.disableBindings, [], null);
}

export function enableBindings(): ir.CreateOp {
  return call(Identifiers.enableBindings, [], null);
}

export function listener(
    name: string, handlerFn: o.Expression, sourceSpan: ParseSourceSpan): ir.CreateOp {
  return call(
      Identifiers.listener,
      [
        o.literal(name),
        handlerFn,
      ],
      sourceSpan);
}

export function syntheticHostListener(
    name: string, handlerFn: o.Expression, sourceSpan: ParseSourceSpan): ir.CreateOp {
  return call(
      Identifiers.syntheticHostListener,
      [
        o.literal(name),
        handlerFn,
      ],
      sourceSpan);
}

export function pipe(slot: number, name: string): ir.CreateOp {
  return call(
      Identifiers.pipe,
      [
        o.literal(slot),
        o.literal(name),
      ],
      null);
}

export function namespaceHTML(): ir.CreateOp {
  return call(Identifiers.namespaceHTML, [], null);
}

export function namespaceSVG(): ir.CreateOp {
  return call(Identifiers.namespaceSVG, [], null);
}

export function namespaceMath(): ir.CreateOp {
  return call(Identifiers.namespaceMathML, [], null);
}

export function advance(delta: number, sourceSpan: ParseSourceSpan): ir.UpdateOp {
  return call(
      Identifiers.advance,
      [
        o.literal(delta),
      ],
      sourceSpan);
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

export function text(
    slot: number, initialValue: string, sourceSpan: ParseSourceSpan|null): ir.CreateOp {
  const args: o.Expression[] = [o.literal(slot, null)];
  if (initialValue !== '') {
    args.push(o.literal(initialValue));
  }
  return call(Identifiers.text, args, sourceSpan);
}

export function defer(
    selfSlot: number, primarySlot: number, dependencyResolverFn: null, loadingSlot: number|null,
    placeholderSlot: number|null, errorSlot: number|null, loadingConfigIndex: number|null,
    placeholderConfigIndex: number|null, sourceSpan: ParseSourceSpan|null): ir.CreateOp {
  const args = [
    o.literal(selfSlot),
    o.literal(primarySlot),
    o.literal(dependencyResolverFn),
    o.literal(loadingSlot),
    o.literal(placeholderSlot),
    o.literal(errorSlot),
    o.literal(loadingConfigIndex),
    o.literal(placeholderConfigIndex),
  ];

  while (args[args.length - 1].value === null) {
    args.pop();
  }

  return call(Identifiers.defer, args, sourceSpan);
}

export function deferOn(sourceSpan: ParseSourceSpan|null): ir.CreateOp {
  return call(Identifiers.deferOnIdle, [], sourceSpan);
}

export function projectionDef(def: o.Expression|null): ir.CreateOp {
  return call(Identifiers.projectionDef, def ? [def] : [], null);
}

export function projection(
    slot: number, projectionSlotIndex: number, attributes: number|null): ir.CreateOp {
  const args = [o.literal(slot)];
  if (projectionSlotIndex !== 0 || attributes !== null) {
    args.push(o.literal(projectionSlotIndex));
    if (attributes != null) {
      args.push(o.literal(attributes));
    }
  }
  return call(Identifiers.projection, args, null);
}

export function i18nStart(slot: number, constIndex: number): ir.CreateOp {
  return call(Identifiers.i18nStart, [o.literal(slot), o.literal(constIndex)], null);
}

export function i18n(slot: number, constIndex: number): ir.CreateOp {
  return call(Identifiers.i18n, [o.literal(slot), o.literal(constIndex)], null);
}

export function i18nEnd(): ir.CreateOp {
  return call(Identifiers.i18nEnd, [], null);
}

export function property(
    name: string, expression: o.Expression, sanitizer: o.Expression|null,
    sourceSpan: ParseSourceSpan): ir.UpdateOp {
  const args = [o.literal(name), expression];
  if (sanitizer !== null) {
    args.push(sanitizer);
  }
  return call(Identifiers.property, args, sourceSpan);
}

export function attribute(
    name: string, expression: o.Expression, sanitizer: o.Expression|null): ir.UpdateOp {
  const args = [o.literal(name), expression];
  if (sanitizer !== null) {
    args.push(sanitizer);
  }
  return call(Identifiers.attribute, args, null);
}

export function styleProp(
    name: string, expression: o.Expression, unit: string|null,
    sourceSpan: ParseSourceSpan): ir.UpdateOp {
  const args = [o.literal(name), expression];
  if (unit !== null) {
    args.push(o.literal(unit));
  }
  return call(Identifiers.styleProp, args, sourceSpan);
}

export function classProp(
    name: string, expression: o.Expression, sourceSpan: ParseSourceSpan): ir.UpdateOp {
  return call(Identifiers.classProp, [o.literal(name), expression], sourceSpan);
}

export function styleMap(expression: o.Expression, sourceSpan: ParseSourceSpan): ir.UpdateOp {
  return call(Identifiers.styleMap, [expression], sourceSpan);
}

export function classMap(expression: o.Expression, sourceSpan: ParseSourceSpan): ir.UpdateOp {
  return call(Identifiers.classMap, [expression], sourceSpan);
}

const PIPE_BINDINGS: o.ExternalReference[] = [
  Identifiers.pipeBind1,
  Identifiers.pipeBind2,
  Identifiers.pipeBind3,
  Identifiers.pipeBind4,
];

export function pipeBind(slot: number, varOffset: number, args: o.Expression[]): o.Expression {
  if (args.length < 1 || args.length > PIPE_BINDINGS.length) {
    throw new Error(`pipeBind() argument count out of bounds`);
  }

  const instruction = PIPE_BINDINGS[args.length - 1];
  return o.importExpr(instruction).callFn([
    o.literal(slot),
    o.literal(varOffset),
    ...args,
  ]);
}

export function pipeBindV(slot: number, varOffset: number, args: o.Expression): o.Expression {
  return o.importExpr(Identifiers.pipeBindV).callFn([
    o.literal(slot),
    o.literal(varOffset),
    args,
  ]);
}

export function textInterpolate(
    strings: string[], expressions: o.Expression[], sourceSpan: ParseSourceSpan): ir.UpdateOp {
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

  return callVariadicInstruction(TEXT_INTERPOLATE_CONFIG, [], interpolationArgs, [], sourceSpan);
}

export function i18nExp(expr: o.Expression, sourceSpan: ParseSourceSpan|null): ir.UpdateOp {
  return call(Identifiers.i18nExp, [expr], sourceSpan);
}

export function i18nApply(slot: number, sourceSpan: ParseSourceSpan|null): ir.UpdateOp {
  return call(Identifiers.i18nApply, [o.literal(slot)], sourceSpan);
}

export function propertyInterpolate(
    name: string, strings: string[], expressions: o.Expression[], sanitizer: o.Expression|null,
    sourceSpan: ParseSourceSpan): ir.UpdateOp {
  const interpolationArgs = collateInterpolationArgs(strings, expressions);
  const extraArgs = [];
  if (sanitizer !== null) {
    extraArgs.push(sanitizer);
  }

  return callVariadicInstruction(
      PROPERTY_INTERPOLATE_CONFIG, [o.literal(name)], interpolationArgs, extraArgs, sourceSpan);
}

export function attributeInterpolate(
    name: string, strings: string[], expressions: o.Expression[], sanitizer: o.Expression|null,
    sourceSpan: ParseSourceSpan): ir.UpdateOp {
  const interpolationArgs = collateInterpolationArgs(strings, expressions);
  const extraArgs = [];
  if (sanitizer !== null) {
    extraArgs.push(sanitizer);
  }

  return callVariadicInstruction(
      ATTRIBUTE_INTERPOLATE_CONFIG, [o.literal(name)], interpolationArgs, extraArgs, sourceSpan);
}

export function stylePropInterpolate(
    name: string, strings: string[], expressions: o.Expression[], unit: string|null,
    sourceSpan: ParseSourceSpan): ir.UpdateOp {
  const interpolationArgs = collateInterpolationArgs(strings, expressions);
  const extraArgs: o.Expression[] = [];
  if (unit !== null) {
    extraArgs.push(o.literal(unit));
  }

  return callVariadicInstruction(
      STYLE_PROP_INTERPOLATE_CONFIG, [o.literal(name)], interpolationArgs, extraArgs, sourceSpan);
}

export function styleMapInterpolate(
    strings: string[], expressions: o.Expression[], sourceSpan: ParseSourceSpan): ir.UpdateOp {
  const interpolationArgs = collateInterpolationArgs(strings, expressions);

  return callVariadicInstruction(
      STYLE_MAP_INTERPOLATE_CONFIG, [], interpolationArgs, [], sourceSpan);
}

export function classMapInterpolate(
    strings: string[], expressions: o.Expression[], sourceSpan: ParseSourceSpan): ir.UpdateOp {
  const interpolationArgs = collateInterpolationArgs(strings, expressions);

  return callVariadicInstruction(
      CLASS_MAP_INTERPOLATE_CONFIG, [], interpolationArgs, [], sourceSpan);
}

export function hostProperty(
    name: string, expression: o.Expression, sourceSpan: ParseSourceSpan|null): ir.UpdateOp {
  return call(Identifiers.hostProperty, [o.literal(name), expression], sourceSpan);
}

export function syntheticHostProperty(
    name: string, expression: o.Expression, sourceSpan: ParseSourceSpan|null): ir.UpdateOp {
  return call(Identifiers.syntheticHostProperty, [o.literal(name), expression], sourceSpan);
}

export function pureFunction(
    varOffset: number, fn: o.Expression, args: o.Expression[]): o.Expression {
  return callVariadicInstructionExpr(
      PURE_FUNCTION_CONFIG,
      [
        o.literal(varOffset),
        fn,
      ],
      args,
      [],
      null,
  );
}

/**
 * Collates the string an expression arguments for an interpolation instruction.
 */
function collateInterpolationArgs(strings: string[], expressions: o.Expression[]): o.Expression[] {
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

  return interpolationArgs;
}

function call<OpT extends ir.CreateOp|ir.UpdateOp>(
    instruction: o.ExternalReference, args: o.Expression[], sourceSpan: ParseSourceSpan|null): OpT {
  const expr = o.importExpr(instruction).callFn(args, sourceSpan);
  return ir.createStatementOp(new o.ExpressionStatement(expr, sourceSpan)) as OpT;
}

export function conditional(
    slot: number, condition: o.Expression, contextValue: o.Expression|null,
    sourceSpan: ParseSourceSpan|null): ir.UpdateOp {
  const args = [o.literal(slot), condition];
  if (contextValue !== null) {
    args.push(contextValue);
  }
  return call(Identifiers.conditional, args, sourceSpan);
}

/**
 * Describes a specific flavor of instruction used to represent variadic instructions, which
 * have some number of variants for specific argument counts.
 */
interface VariadicInstructionConfig {
  constant: o.ExternalReference[];
  variable: o.ExternalReference|null;
  mapping: (argCount: number) => number;
}

/**
 * `InterpolationConfig` for the `textInterpolate` instruction.
 */
const TEXT_INTERPOLATE_CONFIG: VariadicInstructionConfig = {
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
  mapping: n => {
    if (n % 2 === 0) {
      throw new Error(`Expected odd number of arguments`);
    }
    return (n - 1) / 2;
  },
};


/**
 * `InterpolationConfig` for the `propertyInterpolate` instruction.
 */
const PROPERTY_INTERPOLATE_CONFIG: VariadicInstructionConfig = {
  constant: [
    Identifiers.propertyInterpolate,
    Identifiers.propertyInterpolate1,
    Identifiers.propertyInterpolate2,
    Identifiers.propertyInterpolate3,
    Identifiers.propertyInterpolate4,
    Identifiers.propertyInterpolate5,
    Identifiers.propertyInterpolate6,
    Identifiers.propertyInterpolate7,
    Identifiers.propertyInterpolate8,
  ],
  variable: Identifiers.propertyInterpolateV,
  mapping: n => {
    if (n % 2 === 0) {
      throw new Error(`Expected odd number of arguments`);
    }
    return (n - 1) / 2;
  },
};

/**
 * `InterpolationConfig` for the `stylePropInterpolate` instruction.
 */
const STYLE_PROP_INTERPOLATE_CONFIG: VariadicInstructionConfig = {
  constant: [
    Identifiers.styleProp,
    Identifiers.stylePropInterpolate1,
    Identifiers.stylePropInterpolate2,
    Identifiers.stylePropInterpolate3,
    Identifiers.stylePropInterpolate4,
    Identifiers.stylePropInterpolate5,
    Identifiers.stylePropInterpolate6,
    Identifiers.stylePropInterpolate7,
    Identifiers.stylePropInterpolate8,
  ],
  variable: Identifiers.stylePropInterpolateV,
  mapping: n => {
    if (n % 2 === 0) {
      throw new Error(`Expected odd number of arguments`);
    }
    return (n - 1) / 2;
  },
};

/**
 * `InterpolationConfig` for the `attributeInterpolate` instruction.
 */
const ATTRIBUTE_INTERPOLATE_CONFIG: VariadicInstructionConfig = {
  constant: [
    Identifiers.attribute,
    Identifiers.attributeInterpolate1,
    Identifiers.attributeInterpolate2,
    Identifiers.attributeInterpolate3,
    Identifiers.attributeInterpolate4,
    Identifiers.attributeInterpolate5,
    Identifiers.attributeInterpolate6,
    Identifiers.attributeInterpolate7,
    Identifiers.attributeInterpolate8,
  ],
  variable: Identifiers.attributeInterpolateV,
  mapping: n => {
    if (n % 2 === 0) {
      throw new Error(`Expected odd number of arguments`);
    }
    return (n - 1) / 2;
  },
};

/**
 * `InterpolationConfig` for the `styleMapInterpolate` instruction.
 */
const STYLE_MAP_INTERPOLATE_CONFIG: VariadicInstructionConfig = {
  constant: [
    Identifiers.styleMap,
    Identifiers.styleMapInterpolate1,
    Identifiers.styleMapInterpolate2,
    Identifiers.styleMapInterpolate3,
    Identifiers.styleMapInterpolate4,
    Identifiers.styleMapInterpolate5,
    Identifiers.styleMapInterpolate6,
    Identifiers.styleMapInterpolate7,
    Identifiers.styleMapInterpolate8,
  ],
  variable: Identifiers.styleMapInterpolateV,
  mapping: n => {
    if (n % 2 === 0) {
      throw new Error(`Expected odd number of arguments`);
    }
    return (n - 1) / 2;
  },
};

/**
 * `InterpolationConfig` for the `classMapInterpolate` instruction.
 */
const CLASS_MAP_INTERPOLATE_CONFIG: VariadicInstructionConfig = {
  constant: [
    Identifiers.classMap,
    Identifiers.classMapInterpolate1,
    Identifiers.classMapInterpolate2,
    Identifiers.classMapInterpolate3,
    Identifiers.classMapInterpolate4,
    Identifiers.classMapInterpolate5,
    Identifiers.classMapInterpolate6,
    Identifiers.classMapInterpolate7,
    Identifiers.classMapInterpolate8,
  ],
  variable: Identifiers.classMapInterpolateV,
  mapping: n => {
    if (n % 2 === 0) {
      throw new Error(`Expected odd number of arguments`);
    }
    return (n - 1) / 2;
  },
};

const PURE_FUNCTION_CONFIG: VariadicInstructionConfig = {
  constant: [
    Identifiers.pureFunction0,
    Identifiers.pureFunction1,
    Identifiers.pureFunction2,
    Identifiers.pureFunction3,
    Identifiers.pureFunction4,
    Identifiers.pureFunction5,
    Identifiers.pureFunction6,
    Identifiers.pureFunction7,
    Identifiers.pureFunction8,
  ],
  variable: Identifiers.pureFunctionV,
  mapping: n => n,
};

function callVariadicInstructionExpr(
    config: VariadicInstructionConfig, baseArgs: o.Expression[], interpolationArgs: o.Expression[],
    extraArgs: o.Expression[], sourceSpan: ParseSourceSpan|null): o.Expression {
  const n = config.mapping(interpolationArgs.length);
  if (n < config.constant.length) {
    // Constant calling pattern.
    return o.importExpr(config.constant[n])
        .callFn([...baseArgs, ...interpolationArgs, ...extraArgs], sourceSpan);
  } else if (config.variable !== null) {
    // Variable calling pattern.
    return o.importExpr(config.variable)
        .callFn([...baseArgs, o.literalArr(interpolationArgs), ...extraArgs], sourceSpan);
  } else {
    throw new Error(`AssertionError: unable to call variadic function`);
  }
}

function callVariadicInstruction(
    config: VariadicInstructionConfig, baseArgs: o.Expression[], interpolationArgs: o.Expression[],
    extraArgs: o.Expression[], sourceSpan: ParseSourceSpan|null): ir.UpdateOp {
  return ir.createStatementOp(
      callVariadicInstructionExpr(config, baseArgs, interpolationArgs, extraArgs, sourceSpan)
          .toStmt());
}
