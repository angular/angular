/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {I18nContextKind, Namespace, OpKind} from '../enums';
import {SlotHandle} from '../handle';
import {OpList} from '../operations';
import {TRAIT_CONSUMES_SLOT, TRAIT_CONSUMES_VARS} from '../traits';
import {NEW_OP} from './shared';
/**
 * The set of OpKinds that represent the creation of an element or container
 */
const elementContainerOpKinds = new Set([
  OpKind.Element,
  OpKind.ElementStart,
  OpKind.Container,
  OpKind.ContainerStart,
  OpKind.Template,
  OpKind.RepeaterCreate,
  OpKind.ConditionalCreate,
  OpKind.ConditionalBranchCreate,
]);
/**
 * Checks whether the given operation represents the creation of an element or container.
 */
export function isElementOrContainerOp(op) {
  return elementContainerOpKinds.has(op.kind);
}
/**
 * Create an `ElementStartOp`.
 */
export function createElementStartOp(
  tag,
  xref,
  namespace,
  i18nPlaceholder,
  startSourceSpan,
  wholeSourceSpan,
) {
  return {
    kind: OpKind.ElementStart,
    xref,
    tag,
    handle: new SlotHandle(),
    attributes: null,
    localRefs: [],
    nonBindable: false,
    namespace,
    i18nPlaceholder,
    startSourceSpan,
    wholeSourceSpan,
    ...TRAIT_CONSUMES_SLOT,
    ...NEW_OP,
  };
}
/**
 * Create a `TemplateOp`.
 */
export function createTemplateOp(
  xref,
  templateKind,
  tag,
  functionNameSuffix,
  namespace,
  i18nPlaceholder,
  startSourceSpan,
  wholeSourceSpan,
) {
  return {
    kind: OpKind.Template,
    xref,
    templateKind,
    attributes: null,
    tag,
    handle: new SlotHandle(),
    functionNameSuffix,
    decls: null,
    vars: null,
    localRefs: [],
    nonBindable: false,
    namespace,
    i18nPlaceholder,
    startSourceSpan,
    wholeSourceSpan,
    ...TRAIT_CONSUMES_SLOT,
    ...NEW_OP,
  };
}
export function createConditionalCreateOp(
  xref,
  templateKind,
  tag,
  functionNameSuffix,
  namespace,
  i18nPlaceholder,
  startSourceSpan,
  wholeSourceSpan,
) {
  return {
    kind: OpKind.ConditionalCreate,
    xref,
    templateKind,
    attributes: null,
    tag,
    handle: new SlotHandle(),
    functionNameSuffix,
    decls: null,
    vars: null,
    localRefs: [],
    nonBindable: false,
    namespace,
    i18nPlaceholder,
    startSourceSpan,
    wholeSourceSpan,
    ...TRAIT_CONSUMES_SLOT,
    ...NEW_OP,
  };
}
export function createConditionalBranchCreateOp(
  xref,
  templateKind,
  tag,
  functionNameSuffix,
  namespace,
  i18nPlaceholder,
  startSourceSpan,
  wholeSourceSpan,
) {
  return {
    kind: OpKind.ConditionalBranchCreate,
    xref,
    templateKind,
    attributes: null,
    tag,
    handle: new SlotHandle(),
    functionNameSuffix,
    decls: null,
    vars: null,
    localRefs: [],
    nonBindable: false,
    namespace,
    i18nPlaceholder,
    startSourceSpan,
    wholeSourceSpan,
    ...TRAIT_CONSUMES_SLOT,
    ...NEW_OP,
  };
}
export function createRepeaterCreateOp(
  primaryView,
  emptyView,
  tag,
  track,
  varNames,
  emptyTag,
  i18nPlaceholder,
  emptyI18nPlaceholder,
  startSourceSpan,
  wholeSourceSpan,
) {
  return {
    kind: OpKind.RepeaterCreate,
    attributes: null,
    xref: primaryView,
    handle: new SlotHandle(),
    emptyView,
    track,
    trackByFn: null,
    trackByOps: null,
    tag,
    emptyTag,
    emptyAttributes: null,
    functionNameSuffix: 'For',
    namespace: Namespace.HTML,
    nonBindable: false,
    localRefs: [],
    decls: null,
    vars: null,
    varNames,
    usesComponentInstance: false,
    i18nPlaceholder,
    emptyI18nPlaceholder,
    startSourceSpan,
    wholeSourceSpan,
    ...TRAIT_CONSUMES_SLOT,
    ...NEW_OP,
    ...TRAIT_CONSUMES_VARS,
    numSlotsUsed: emptyView === null ? 2 : 3,
  };
}
/**
 * Create an `ElementEndOp`.
 */
export function createElementEndOp(xref, sourceSpan) {
  return {
    kind: OpKind.ElementEnd,
    xref,
    sourceSpan,
    ...NEW_OP,
  };
}
export function createDisableBindingsOp(xref) {
  return {
    kind: OpKind.DisableBindings,
    xref,
    ...NEW_OP,
  };
}
export function createEnableBindingsOp(xref) {
  return {
    kind: OpKind.EnableBindings,
    xref,
    ...NEW_OP,
  };
}
/**
 * Create a `TextOp`.
 */
export function createTextOp(xref, initialValue, icuPlaceholder, sourceSpan) {
  return {
    kind: OpKind.Text,
    xref,
    handle: new SlotHandle(),
    initialValue,
    icuPlaceholder,
    sourceSpan,
    ...TRAIT_CONSUMES_SLOT,
    ...NEW_OP,
  };
}
/**
 * Create an `AnimationOp`.
 */
export function createAnimationStringOp(
  name,
  target,
  animationKind,
  expression,
  securityContext,
  sourceSpan,
) {
  return {
    kind: OpKind.AnimationString,
    name,
    target,
    animationKind,
    expression,
    i18nMessage: null,
    securityContext,
    sanitizer: null,
    sourceSpan,
    ...NEW_OP,
  };
}
/**
 * Create an `AnimationOp`.
 */
export function createAnimationOp(
  name,
  target,
  animationKind,
  callbackOps,
  securityContext,
  sourceSpan,
) {
  const handlerOps = new OpList();
  handlerOps.push(callbackOps);
  return {
    kind: OpKind.Animation,
    name,
    target,
    animationKind,
    handlerOps,
    handlerFnName: null,
    i18nMessage: null,
    securityContext,
    sanitizer: null,
    sourceSpan,
    ...NEW_OP,
  };
}
/**
 * Create a `ListenerOp`. Host bindings reuse all the listener logic.
 */
export function createListenerOp(
  target,
  targetSlot,
  name,
  tag,
  handlerOps,
  legacyAnimationPhase,
  eventTarget,
  hostListener,
  sourceSpan,
) {
  const handlerList = new OpList();
  handlerList.push(handlerOps);
  return {
    kind: OpKind.Listener,
    target,
    targetSlot,
    tag,
    hostListener,
    name,
    handlerOps: handlerList,
    handlerFnName: null,
    consumesDollarEvent: false,
    isLegacyAnimationListener: legacyAnimationPhase !== null,
    legacyAnimationPhase: legacyAnimationPhase,
    eventTarget,
    sourceSpan,
    ...NEW_OP,
  };
}
/**
 * Create a `ListenerOp`. Host bindings reuse all the listener logic.
 */
export function createAnimationListenerOp(
  target,
  targetSlot,
  name,
  tag,
  handlerOps,
  animationKind,
  eventTarget,
  hostListener,
  sourceSpan,
) {
  const handlerList = new OpList();
  handlerList.push(handlerOps);
  return {
    kind: OpKind.AnimationListener,
    target,
    targetSlot,
    tag,
    hostListener,
    name,
    animationKind,
    handlerOps: handlerList,
    handlerFnName: null,
    consumesDollarEvent: false,
    eventTarget,
    sourceSpan,
    ...NEW_OP,
  };
}
/**
 * Create a `TwoWayListenerOp`.
 */
export function createTwoWayListenerOp(target, targetSlot, name, tag, handlerOps, sourceSpan) {
  const handlerList = new OpList();
  handlerList.push(handlerOps);
  return {
    kind: OpKind.TwoWayListener,
    target,
    targetSlot,
    tag,
    name,
    handlerOps: handlerList,
    handlerFnName: null,
    sourceSpan,
    ...NEW_OP,
  };
}
export function createPipeOp(xref, slot, name) {
  return {
    kind: OpKind.Pipe,
    xref,
    handle: slot,
    name,
    ...NEW_OP,
    ...TRAIT_CONSUMES_SLOT,
  };
}
export function createNamespaceOp(namespace) {
  return {
    kind: OpKind.Namespace,
    active: namespace,
    ...NEW_OP,
  };
}
export function createProjectionDefOp(def) {
  return {
    kind: OpKind.ProjectionDef,
    def,
    ...NEW_OP,
  };
}
export function createProjectionOp(xref, selector, i18nPlaceholder, fallbackView, sourceSpan) {
  return {
    kind: OpKind.Projection,
    xref,
    handle: new SlotHandle(),
    selector,
    i18nPlaceholder,
    fallbackView,
    projectionSlotIndex: 0,
    attributes: null,
    localRefs: [],
    sourceSpan,
    ...NEW_OP,
    ...TRAIT_CONSUMES_SLOT,
    numSlotsUsed: fallbackView === null ? 1 : 2,
  };
}
/**
 * Create an `ExtractedAttributeOp`.
 */
export function createExtractedAttributeOp(
  target,
  bindingKind,
  namespace,
  name,
  expression,
  i18nContext,
  i18nMessage,
  securityContext,
) {
  return {
    kind: OpKind.ExtractedAttribute,
    target,
    bindingKind,
    namespace,
    name,
    expression,
    i18nContext,
    i18nMessage,
    securityContext,
    trustedValueFn: null,
    ...NEW_OP,
  };
}
export function createDeferOp(xref, main, mainSlot, ownResolverFn, resolverFn, sourceSpan) {
  return {
    kind: OpKind.Defer,
    xref,
    handle: new SlotHandle(),
    mainView: main,
    mainSlot,
    loadingView: null,
    loadingSlot: null,
    loadingConfig: null,
    loadingMinimumTime: null,
    loadingAfterTime: null,
    placeholderView: null,
    placeholderSlot: null,
    placeholderConfig: null,
    placeholderMinimumTime: null,
    errorView: null,
    errorSlot: null,
    ownResolverFn,
    resolverFn,
    flags: null,
    sourceSpan,
    ...NEW_OP,
    ...TRAIT_CONSUMES_SLOT,
    numSlotsUsed: 2,
  };
}
export function createDeferOnOp(defer, trigger, modifier, sourceSpan) {
  return {
    kind: OpKind.DeferOn,
    defer,
    trigger,
    modifier,
    sourceSpan,
    ...NEW_OP,
  };
}
/**
 * Creates a `DeclareLetOp`.
 */
export function createDeclareLetOp(xref, declaredName, sourceSpan) {
  return {
    kind: OpKind.DeclareLet,
    xref,
    declaredName,
    sourceSpan,
    handle: new SlotHandle(),
    ...TRAIT_CONSUMES_SLOT,
    ...NEW_OP,
  };
}
/**
 * Create an `ExtractedMessageOp`.
 */
export function createI18nMessageOp(
  xref,
  i18nContext,
  i18nBlock,
  message,
  messagePlaceholder,
  params,
  postprocessingParams,
  needsPostprocessing,
) {
  return {
    kind: OpKind.I18nMessage,
    xref,
    i18nContext,
    i18nBlock,
    message,
    messagePlaceholder,
    params,
    postprocessingParams,
    needsPostprocessing,
    subMessages: [],
    ...NEW_OP,
  };
}
/**
 * Create an `I18nStartOp`.
 */
export function createI18nStartOp(xref, message, root, sourceSpan) {
  return {
    kind: OpKind.I18nStart,
    xref,
    handle: new SlotHandle(),
    root: root ?? xref,
    message,
    messageIndex: null,
    subTemplateIndex: null,
    context: null,
    sourceSpan,
    ...NEW_OP,
    ...TRAIT_CONSUMES_SLOT,
  };
}
/**
 * Create an `I18nEndOp`.
 */
export function createI18nEndOp(xref, sourceSpan) {
  return {
    kind: OpKind.I18nEnd,
    xref,
    sourceSpan,
    ...NEW_OP,
  };
}
/**
 * Creates an ICU start op.
 */
export function createIcuStartOp(xref, message, messagePlaceholder, sourceSpan) {
  return {
    kind: OpKind.IcuStart,
    xref,
    message,
    messagePlaceholder,
    context: null,
    sourceSpan,
    ...NEW_OP,
  };
}
/**
 * Creates an ICU end op.
 */
export function createIcuEndOp(xref) {
  return {
    kind: OpKind.IcuEnd,
    xref,
    ...NEW_OP,
  };
}
/**
 * Creates an ICU placeholder op.
 */
export function createIcuPlaceholderOp(xref, name, strings) {
  return {
    kind: OpKind.IcuPlaceholder,
    xref,
    name,
    strings,
    expressionPlaceholders: [],
    ...NEW_OP,
  };
}
export function createI18nContextOp(contextKind, xref, i18nBlock, message, sourceSpan) {
  if (i18nBlock === null && contextKind !== I18nContextKind.Attr) {
    throw new Error('AssertionError: i18nBlock must be provided for non-attribute contexts.');
  }
  return {
    kind: OpKind.I18nContext,
    contextKind,
    xref,
    i18nBlock,
    message,
    sourceSpan,
    params: new Map(),
    postprocessingParams: new Map(),
    ...NEW_OP,
  };
}
export function createI18nAttributesOp(xref, handle, target) {
  return {
    kind: OpKind.I18nAttributes,
    xref,
    handle,
    target,
    i18nAttributesConfig: null,
    ...NEW_OP,
    ...TRAIT_CONSUMES_SLOT,
  };
}
/** Create a `SourceLocationOp`. */
export function createSourceLocationOp(templatePath, locations) {
  return {
    kind: OpKind.SourceLocation,
    templatePath,
    locations,
    ...NEW_OP,
  };
}
//# sourceMappingURL=create.js.map
