/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../output/output_ast';
import {ParseSourceSpan} from '../../../parse_util';
import {Identifiers} from '../../../render3/r3_identifiers';
import * as ir from '../ir';

// This file contains helpers for generating calls to Ivy instructions. In particular, each
// instruction type is represented as a function, which may select a specific instruction variant
// depending on the exact arguments.

export function element(
  slot: number,
  tag: string,
  constIndex: number | null,
  localRefIndex: number | null,
  sourceSpan: ParseSourceSpan,
): ir.CreateOp {
  return elementOrContainerBase(
    Identifiers.element,
    slot,
    tag,
    constIndex,
    localRefIndex,
    sourceSpan,
  );
}

export function elementStart(
  slot: number,
  tag: string,
  constIndex: number | null,
  localRefIndex: number | null,
  sourceSpan: ParseSourceSpan,
): ir.CreateOp {
  return elementOrContainerBase(
    Identifiers.elementStart,
    slot,
    tag,
    constIndex,
    localRefIndex,
    sourceSpan,
  );
}

function elementOrContainerBase(
  instruction: o.ExternalReference,
  slot: number,
  tag: string | null,
  constIndex: number | null,
  localRefIndex: number | null,
  sourceSpan: ParseSourceSpan,
): ir.CreateOp {
  const args: o.Expression[] = [o.literal(slot)];
  if (tag !== null) {
    args.push(o.literal(tag));
  }
  if (localRefIndex !== null) {
    args.push(
      o.literal(constIndex), // might be null, but that's okay.
      o.literal(localRefIndex),
    );
  } else if (constIndex !== null) {
    args.push(o.literal(constIndex));
  }

  return call(instruction, args, sourceSpan);
}

export function elementEnd(sourceSpan: ParseSourceSpan | null): ir.CreateOp {
  return call(Identifiers.elementEnd, [], sourceSpan);
}

export function elementContainerStart(
  slot: number,
  constIndex: number | null,
  localRefIndex: number | null,
  sourceSpan: ParseSourceSpan,
): ir.CreateOp {
  return elementOrContainerBase(
    Identifiers.elementContainerStart,
    slot,
    /* tag */ null,
    constIndex,
    localRefIndex,
    sourceSpan,
  );
}

export function elementContainer(
  slot: number,
  constIndex: number | null,
  localRefIndex: number | null,
  sourceSpan: ParseSourceSpan,
): ir.CreateOp {
  return elementOrContainerBase(
    Identifiers.elementContainer,
    slot,
    /* tag */ null,
    constIndex,
    localRefIndex,
    sourceSpan,
  );
}

export function elementContainerEnd(): ir.CreateOp {
  return call(Identifiers.elementContainerEnd, [], null);
}

export function template(
  slot: number,
  templateFnRef: o.Expression,
  decls: number,
  vars: number,
  tag: string | null,
  constIndex: number | null,
  localRefs: number | null,
  sourceSpan: ParseSourceSpan,
): ir.CreateOp {
  const args = [
    o.literal(slot),
    templateFnRef,
    o.literal(decls),
    o.literal(vars),
    o.literal(tag),
    o.literal(constIndex),
  ];
  if (localRefs !== null) {
    args.push(o.literal(localRefs));
    args.push(o.importExpr(Identifiers.templateRefExtractor));
  }
  while (args[args.length - 1].isEquivalent(o.NULL_EXPR)) {
    args.pop();
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
  name: string,
  handlerFn: o.Expression,
  eventTargetResolver: o.ExternalReference | null,
  syntheticHost: boolean,
  sourceSpan: ParseSourceSpan,
): ir.CreateOp {
  const args = [o.literal(name), handlerFn];
  if (eventTargetResolver !== null) {
    args.push(o.importExpr(eventTargetResolver));
  }
  return call(
    syntheticHost ? Identifiers.syntheticHostListener : Identifiers.listener,
    args,
    sourceSpan,
  );
}

export function twoWayBindingSet(target: o.Expression, value: o.Expression): o.Expression {
  return o.importExpr(Identifiers.twoWayBindingSet).callFn([target, value]);
}

export function twoWayListener(
  name: string,
  handlerFn: o.Expression,
  sourceSpan: ParseSourceSpan,
): ir.CreateOp {
  return call(Identifiers.twoWayListener, [o.literal(name), handlerFn], sourceSpan);
}

export function pipe(slot: number, name: string): ir.CreateOp {
  return call(Identifiers.pipe, [o.literal(slot), o.literal(name)], null);
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
  return call(Identifiers.advance, delta > 1 ? [o.literal(delta)] : [], sourceSpan);
}

export function reference(slot: number): o.Expression {
  return o.importExpr(Identifiers.reference).callFn([o.literal(slot)]);
}

export function nextContext(steps: number): o.Expression {
  return o.importExpr(Identifiers.nextContext).callFn(steps === 1 ? [] : [o.literal(steps)]);
}

export function getCurrentView(): o.Expression {
  return o.importExpr(Identifiers.getCurrentView).callFn([]);
}

export function restoreView(savedView: o.Expression): o.Expression {
  return o.importExpr(Identifiers.restoreView).callFn([savedView]);
}

export function resetView(returnValue: o.Expression): o.Expression {
  return o.importExpr(Identifiers.resetView).callFn([returnValue]);
}

export function text(
  slot: number,
  initialValue: string,
  sourceSpan: ParseSourceSpan | null,
): ir.CreateOp {
  const args: o.Expression[] = [o.literal(slot, null)];
  if (initialValue !== '') {
    args.push(o.literal(initialValue));
  }
  return call(Identifiers.text, args, sourceSpan);
}

export function defer(
  selfSlot: number,
  primarySlot: number,
  dependencyResolverFn: o.Expression | null,
  loadingSlot: number | null,
  placeholderSlot: number | null,
  errorSlot: number | null,
  loadingConfig: o.Expression | null,
  placeholderConfig: o.Expression | null,
  enableTimerScheduling: boolean,
  sourceSpan: ParseSourceSpan | null,
  flags: ir.TDeferDetailsFlags | null,
): ir.CreateOp {
  const args: Array<o.Expression> = [
    o.literal(selfSlot),
    o.literal(primarySlot),
    dependencyResolverFn ?? o.literal(null),
    o.literal(loadingSlot),
    o.literal(placeholderSlot),
    o.literal(errorSlot),
    loadingConfig ?? o.literal(null),
    placeholderConfig ?? o.literal(null),
    enableTimerScheduling ? o.importExpr(Identifiers.deferEnableTimerScheduling) : o.literal(null),
    o.literal(flags),
  ];

  let expr: o.Expression;
  while (
    (expr = args[args.length - 1]) !== null &&
    expr instanceof o.LiteralExpr &&
    expr.value === null
  ) {
    args.pop();
  }

  return call(Identifiers.defer, args, sourceSpan);
}

const deferTriggerToR3TriggerInstructionsMap = new Map([
  [
    ir.DeferTriggerKind.Idle,
    {
      [ir.DeferOpModifierKind.NONE]: Identifiers.deferOnIdle,
      [ir.DeferOpModifierKind.PREFETCH]: Identifiers.deferPrefetchOnIdle,
      [ir.DeferOpModifierKind.HYDRATE]: Identifiers.deferHydrateOnIdle,
    },
  ],
  [
    ir.DeferTriggerKind.Immediate,
    {
      [ir.DeferOpModifierKind.NONE]: Identifiers.deferOnImmediate,
      [ir.DeferOpModifierKind.PREFETCH]: Identifiers.deferPrefetchOnImmediate,
      [ir.DeferOpModifierKind.HYDRATE]: Identifiers.deferHydrateOnImmediate,
    },
  ],
  [
    ir.DeferTriggerKind.Timer,
    {
      [ir.DeferOpModifierKind.NONE]: Identifiers.deferOnTimer,
      [ir.DeferOpModifierKind.PREFETCH]: Identifiers.deferPrefetchOnTimer,
      [ir.DeferOpModifierKind.HYDRATE]: Identifiers.deferHydrateOnTimer,
    },
  ],
  [
    ir.DeferTriggerKind.Hover,
    {
      [ir.DeferOpModifierKind.NONE]: Identifiers.deferOnHover,
      [ir.DeferOpModifierKind.PREFETCH]: Identifiers.deferPrefetchOnHover,
      [ir.DeferOpModifierKind.HYDRATE]: Identifiers.deferHydrateOnHover,
    },
  ],
  [
    ir.DeferTriggerKind.Interaction,
    {
      [ir.DeferOpModifierKind.NONE]: Identifiers.deferOnInteraction,
      [ir.DeferOpModifierKind.PREFETCH]: Identifiers.deferPrefetchOnInteraction,
      [ir.DeferOpModifierKind.HYDRATE]: Identifiers.deferHydrateOnInteraction,
    },
  ],
  [
    ir.DeferTriggerKind.Viewport,
    {
      [ir.DeferOpModifierKind.NONE]: Identifiers.deferOnViewport,
      [ir.DeferOpModifierKind.PREFETCH]: Identifiers.deferPrefetchOnViewport,
      [ir.DeferOpModifierKind.HYDRATE]: Identifiers.deferHydrateOnViewport,
    },
  ],
  [
    ir.DeferTriggerKind.Never,
    {
      [ir.DeferOpModifierKind.NONE]: Identifiers.deferHydrateNever,
      [ir.DeferOpModifierKind.PREFETCH]: Identifiers.deferHydrateNever,
      [ir.DeferOpModifierKind.HYDRATE]: Identifiers.deferHydrateNever,
    },
  ],
]);

export function deferOn(
  trigger: ir.DeferTriggerKind,
  args: number[],
  modifier: ir.DeferOpModifierKind,
  sourceSpan: ParseSourceSpan | null,
): ir.CreateOp {
  const instructionToCall = deferTriggerToR3TriggerInstructionsMap.get(trigger)?.[modifier];
  if (instructionToCall === undefined) {
    throw new Error(`Unable to determine instruction for trigger ${trigger}`);
  }
  return call(
    instructionToCall,
    args.map((a) => o.literal(a)),
    sourceSpan,
  );
}

export function projectionDef(def: o.Expression | null): ir.CreateOp {
  return call(Identifiers.projectionDef, def ? [def] : [], null);
}

export function projection(
  slot: number,
  projectionSlotIndex: number,
  attributes: o.LiteralArrayExpr | null,
  fallbackFnName: string | null,
  fallbackDecls: number | null,
  fallbackVars: number | null,
  sourceSpan: ParseSourceSpan,
): ir.CreateOp {
  const args: o.Expression[] = [o.literal(slot)];
  if (projectionSlotIndex !== 0 || attributes !== null || fallbackFnName !== null) {
    args.push(o.literal(projectionSlotIndex));
    if (attributes !== null) {
      args.push(attributes);
    }
    if (fallbackFnName !== null) {
      if (attributes === null) {
        args.push(o.literal(null));
      }
      args.push(o.variable(fallbackFnName), o.literal(fallbackDecls), o.literal(fallbackVars));
    }
  }
  return call(Identifiers.projection, args, sourceSpan);
}

export function i18nStart(
  slot: number,
  constIndex: number,
  subTemplateIndex: number,
  sourceSpan: ParseSourceSpan | null,
): ir.CreateOp {
  const args = [o.literal(slot), o.literal(constIndex)];
  if (subTemplateIndex !== null) {
    args.push(o.literal(subTemplateIndex));
  }
  return call(Identifiers.i18nStart, args, sourceSpan);
}

export function conditionalCreate(
  slot: number,
  templateFnRef: o.Expression,
  decls: number,
  vars: number,
  tag: string | null,
  constIndex: number | null,
  localRefs: number | null,
  sourceSpan: ParseSourceSpan,
): ir.CreateOp {
  const args = [
    o.literal(slot),
    templateFnRef,
    o.literal(decls),
    o.literal(vars),
    o.literal(tag),
    o.literal(constIndex),
  ];
  if (localRefs !== null) {
    args.push(o.literal(localRefs));
    args.push(o.importExpr(Identifiers.templateRefExtractor));
  }
  while (args[args.length - 1].isEquivalent(o.NULL_EXPR)) {
    args.pop();
  }
  return call(Identifiers.conditionalCreate, args, sourceSpan);
}

export function conditionalBranchCreate(
  slot: number,
  templateFnRef: o.Expression,
  decls: number,
  vars: number,
  tag: string | null,
  constIndex: number | null,
  localRefs: number | null,
  sourceSpan: ParseSourceSpan,
): ir.CreateOp {
  const args = [
    o.literal(slot),
    templateFnRef,
    o.literal(decls),
    o.literal(vars),
    o.literal(tag),
    o.literal(constIndex),
  ];
  if (localRefs !== null) {
    args.push(o.literal(localRefs));
    args.push(o.importExpr(Identifiers.templateRefExtractor));
  }
  while (args[args.length - 1].isEquivalent(o.NULL_EXPR)) {
    args.pop();
  }
  return call(Identifiers.conditionalBranchCreate, args, sourceSpan);
}

export function repeaterCreate(
  slot: number,
  viewFnName: string,
  decls: number,
  vars: number,
  tag: string | null,
  constIndex: number | null,
  trackByFn: o.Expression,
  trackByUsesComponentInstance: boolean,
  emptyViewFnName: string | null,
  emptyDecls: number | null,
  emptyVars: number | null,
  emptyTag: string | null,
  emptyConstIndex: number | null,
  sourceSpan: ParseSourceSpan | null,
): ir.CreateOp {
  const args = [
    o.literal(slot),
    o.variable(viewFnName),
    o.literal(decls),
    o.literal(vars),
    o.literal(tag),
    o.literal(constIndex),
    trackByFn,
  ];
  if (trackByUsesComponentInstance || emptyViewFnName !== null) {
    args.push(o.literal(trackByUsesComponentInstance));
    if (emptyViewFnName !== null) {
      args.push(o.variable(emptyViewFnName), o.literal(emptyDecls), o.literal(emptyVars));
      if (emptyTag !== null || emptyConstIndex !== null) {
        args.push(o.literal(emptyTag));
      }
      if (emptyConstIndex !== null) {
        args.push(o.literal(emptyConstIndex));
      }
    }
  }
  return call(Identifiers.repeaterCreate, args, sourceSpan);
}

export function repeater(
  collection: o.Expression,
  sourceSpan: ParseSourceSpan | null,
): ir.UpdateOp {
  return call(Identifiers.repeater, [collection], sourceSpan);
}

export function deferWhen(
  modifier: ir.DeferOpModifierKind,
  expr: o.Expression,
  sourceSpan: ParseSourceSpan | null,
): ir.UpdateOp {
  if (modifier === ir.DeferOpModifierKind.PREFETCH) {
    return call(Identifiers.deferPrefetchWhen, [expr], sourceSpan);
  } else if (modifier === ir.DeferOpModifierKind.HYDRATE) {
    return call(Identifiers.deferHydrateWhen, [expr], sourceSpan);
  }
  return call(Identifiers.deferWhen, [expr], sourceSpan);
}

export function declareLet(slot: number, sourceSpan: ParseSourceSpan): ir.CreateOp {
  return call(Identifiers.declareLet, [o.literal(slot)], sourceSpan);
}

export function storeLet(value: o.Expression, sourceSpan: ParseSourceSpan): o.Expression {
  return o.importExpr(Identifiers.storeLet).callFn([value], sourceSpan);
}

export function readContextLet(slot: number): o.Expression {
  return o.importExpr(Identifiers.readContextLet).callFn([o.literal(slot)]);
}

export function i18n(
  slot: number,
  constIndex: number,
  subTemplateIndex: number,
  sourceSpan: ParseSourceSpan | null,
): ir.CreateOp {
  const args = [o.literal(slot), o.literal(constIndex)];
  if (subTemplateIndex) {
    args.push(o.literal(subTemplateIndex));
  }
  return call(Identifiers.i18n, args, sourceSpan);
}

export function i18nEnd(endSourceSpan: ParseSourceSpan | null): ir.CreateOp {
  return call(Identifiers.i18nEnd, [], endSourceSpan);
}

export function i18nAttributes(slot: number, i18nAttributesConfig: number): ir.CreateOp {
  const args = [o.literal(slot), o.literal(i18nAttributesConfig)];
  return call(Identifiers.i18nAttributes, args, null);
}

export function property(
  name: string,
  expression: o.Expression,
  sanitizer: o.Expression | null,
  sourceSpan: ParseSourceSpan,
): ir.UpdateOp {
  const args = [o.literal(name), expression];
  if (sanitizer !== null) {
    args.push(sanitizer);
  }
  return call(Identifiers.property, args, sourceSpan);
}

export function twoWayProperty(
  name: string,
  expression: o.Expression,
  sanitizer: o.Expression | null,
  sourceSpan: ParseSourceSpan,
): ir.UpdateOp {
  const args = [o.literal(name), expression];
  if (sanitizer !== null) {
    args.push(sanitizer);
  }
  return call(Identifiers.twoWayProperty, args, sourceSpan);
}

export function attribute(
  name: string,
  expression: o.Expression,
  sanitizer: o.Expression | null,
  namespace: string | null,
): ir.UpdateOp {
  const args = [o.literal(name), expression];
  if (sanitizer !== null || namespace !== null) {
    args.push(sanitizer ?? o.literal(null));
  }
  if (namespace !== null) {
    args.push(o.literal(namespace));
  }
  return call(Identifiers.attribute, args, null);
}

export function styleProp(
  name: string,
  expression: o.Expression,
  unit: string | null,
  sourceSpan: ParseSourceSpan,
): ir.UpdateOp {
  const args = [o.literal(name), expression];
  if (unit !== null) {
    args.push(o.literal(unit));
  }
  return call(Identifiers.styleProp, args, sourceSpan);
}

export function classProp(
  name: string,
  expression: o.Expression,
  sourceSpan: ParseSourceSpan,
): ir.UpdateOp {
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
  return o.importExpr(instruction).callFn([o.literal(slot), o.literal(varOffset), ...args]);
}

export function pipeBindV(slot: number, varOffset: number, args: o.Expression): o.Expression {
  return o.importExpr(Identifiers.pipeBindV).callFn([o.literal(slot), o.literal(varOffset), args]);
}

export function textInterpolate(
  strings: string[],
  expressions: o.Expression[],
  sourceSpan: ParseSourceSpan,
): ir.UpdateOp {
  const interpolationArgs = collateInterpolationArgs(strings, expressions);

  return callVariadicInstruction(TEXT_INTERPOLATE_CONFIG, [], interpolationArgs, [], sourceSpan);
}

export function i18nExp(expr: o.Expression, sourceSpan: ParseSourceSpan | null): ir.UpdateOp {
  return call(Identifiers.i18nExp, [expr], sourceSpan);
}

export function i18nApply(slot: number, sourceSpan: ParseSourceSpan | null): ir.UpdateOp {
  return call(Identifiers.i18nApply, [o.literal(slot)], sourceSpan);
}

export function propertyInterpolate(
  name: string,
  strings: string[],
  expressions: o.Expression[],
  sanitizer: o.Expression | null,
  sourceSpan: ParseSourceSpan,
): ir.UpdateOp {
  const interpolationArgs = collateInterpolationArgs(strings, expressions);

  const extraArgs = [];
  if (sanitizer !== null) {
    extraArgs.push(sanitizer);
  }

  return callVariadicInstruction(
    PROPERTY_INTERPOLATE_CONFIG,
    [o.literal(name)],
    interpolationArgs,
    extraArgs,
    sourceSpan,
  );
}

export function attributeInterpolate(
  name: string,
  strings: string[],
  expressions: o.Expression[],
  sanitizer: o.Expression | null,
  namespace: string | null,
  sourceSpan: ParseSourceSpan,
): ir.UpdateOp {
  const interpolationArgs = collateInterpolationArgs(strings, expressions);
  const value = callVariadicInstructionExpr(
    VALUE_INTERPOLATE_CONFIG,
    [],
    interpolationArgs,
    [],
    sourceSpan,
  );
  return attribute(name, value, sanitizer, namespace);
}

export function stylePropInterpolate(
  name: string,
  strings: string[],
  expressions: o.Expression[],
  unit: string | null,
  sourceSpan: ParseSourceSpan,
): ir.UpdateOp {
  const interpolationArgs = collateInterpolationArgs(strings, expressions);

  const extraArgs: o.Expression[] = [];
  if (unit !== null) {
    extraArgs.push(o.literal(unit));
  }

  return callVariadicInstruction(
    STYLE_PROP_INTERPOLATE_CONFIG,
    [o.literal(name)],
    interpolationArgs,
    extraArgs,
    sourceSpan,
  );
}

export function styleMapInterpolate(
  strings: string[],
  expressions: o.Expression[],
  sourceSpan: ParseSourceSpan,
): ir.UpdateOp {
  const interpolationArgs = collateInterpolationArgs(strings, expressions);

  return callVariadicInstruction(
    STYLE_MAP_INTERPOLATE_CONFIG,
    [],
    interpolationArgs,
    [],
    sourceSpan,
  );
}

export function classMapInterpolate(
  strings: string[],
  expressions: o.Expression[],
  sourceSpan: ParseSourceSpan,
): ir.UpdateOp {
  const interpolationArgs = collateInterpolationArgs(strings, expressions);

  return callVariadicInstruction(
    CLASS_MAP_INTERPOLATE_CONFIG,
    [],
    interpolationArgs,
    [],
    sourceSpan,
  );
}

export function domProperty(
  name: string,
  expression: o.Expression,
  sanitizer: o.Expression | null,
  sourceSpan: ParseSourceSpan | null,
): ir.UpdateOp {
  const args = [o.literal(name), expression];
  if (sanitizer !== null) {
    args.push(sanitizer);
  }
  return call(Identifiers.domProperty, args, sourceSpan);
}

export function syntheticHostProperty(
  name: string,
  expression: o.Expression,
  sourceSpan: ParseSourceSpan | null,
): ir.UpdateOp {
  return call(Identifiers.syntheticHostProperty, [o.literal(name), expression], sourceSpan);
}

export function pureFunction(
  varOffset: number,
  fn: o.Expression,
  args: o.Expression[],
): o.Expression {
  return callVariadicInstructionExpr(
    PURE_FUNCTION_CONFIG,
    [o.literal(varOffset), fn],
    args,
    [],
    null,
  );
}

export function attachSourceLocation(
  templatePath: string,
  locations: o.LiteralArrayExpr,
): ir.CreateOp {
  return call(Identifiers.attachSourceLocations, [o.literal(templatePath), locations], null);
}

/**
 * Collates the string an expression arguments for an interpolation instruction.
 */
function collateInterpolationArgs(strings: string[], expressions: o.Expression[]): o.Expression[] {
  if (strings.length < 1 || expressions.length !== strings.length - 1) {
    throw new Error(
      `AssertionError: expected specific shape of args for strings/expressions in interpolation`,
    );
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

function call<OpT extends ir.CreateOp | ir.UpdateOp>(
  instruction: o.ExternalReference,
  args: o.Expression[],
  sourceSpan: ParseSourceSpan | null,
): OpT {
  const expr = o.importExpr(instruction).callFn(args, sourceSpan);
  return ir.createStatementOp(new o.ExpressionStatement(expr, sourceSpan)) as OpT;
}

export function conditional(
  condition: o.Expression,
  contextValue: o.Expression | null,
  sourceSpan: ParseSourceSpan | null,
): ir.UpdateOp {
  const args = [condition];
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
  variable: o.ExternalReference | null;
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
  mapping: (n) => {
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
  mapping: (n) => {
    if (n % 2 === 0) {
      throw new Error(`Expected odd number of arguments`);
    }
    return (n - 1) / 2;
  },
};

const VALUE_INTERPOLATE_CONFIG: VariadicInstructionConfig = {
  constant: [
    Identifiers.interpolate,
    Identifiers.interpolate1,
    Identifiers.interpolate2,
    Identifiers.interpolate3,
    Identifiers.interpolate4,
    Identifiers.interpolate5,
    Identifiers.interpolate6,
    Identifiers.interpolate7,
    Identifiers.interpolate8,
  ],
  variable: Identifiers.interpolateV,
  mapping: (n) => {
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
  mapping: (n) => {
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
  mapping: (n) => {
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
  mapping: (n) => {
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
  mapping: (n) => {
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
  mapping: (n) => n,
};

function callVariadicInstructionExpr(
  config: VariadicInstructionConfig,
  baseArgs: o.Expression[],
  interpolationArgs: o.Expression[],
  extraArgs: o.Expression[],
  sourceSpan: ParseSourceSpan | null,
): o.Expression {
  // mapping need to be done before potentially dropping the last interpolation argument
  const n = config.mapping(interpolationArgs.length);

  // In the case the interpolation instruction ends with a empty string we drop it
  // And the runtime will take care of it.
  const lastInterpolationArg = interpolationArgs.at(-1);
  if (
    extraArgs.length === 0 &&
    interpolationArgs.length > 1 &&
    lastInterpolationArg instanceof o.LiteralExpr &&
    lastInterpolationArg.value === ''
  ) {
    interpolationArgs.pop();
  }

  if (n < config.constant.length) {
    // Constant calling pattern.
    return o
      .importExpr(config.constant[n])
      .callFn([...baseArgs, ...interpolationArgs, ...extraArgs], sourceSpan);
  } else if (config.variable !== null) {
    // Variable calling pattern.
    return o
      .importExpr(config.variable)
      .callFn([...baseArgs, o.literalArr(interpolationArgs), ...extraArgs], sourceSpan);
  } else {
    throw new Error(`AssertionError: unable to call variadic function`);
  }
}

function callVariadicInstruction(
  config: VariadicInstructionConfig,
  baseArgs: o.Expression[],
  interpolationArgs: o.Expression[],
  extraArgs: o.Expression[],
  sourceSpan: ParseSourceSpan | null,
): ir.UpdateOp {
  return ir.createStatementOp(
    callVariadicInstructionExpr(
      config,
      baseArgs,
      interpolationArgs,
      extraArgs,
      sourceSpan,
    ).toStmt(),
  );
}
