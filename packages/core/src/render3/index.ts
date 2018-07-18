/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LifecycleHooksFeature, getHostElement, getRenderedText, renderComponent, whenRendered} from './component';
import {defineComponent, defineDirective, defineNgModule, definePipe} from './definition';
import {InheritDefinitionFeature} from './features/inherit_definition_feature';
import {NgOnChangesFeature} from './features/ng_onchanges_feature';
import {PublicFeature} from './features/public_feature';
import {I18nExpInstruction, I18nInstruction, i18nExpMapping, i18nInterpolation1, i18nInterpolation2, i18nInterpolation3, i18nInterpolation4, i18nInterpolation5, i18nInterpolation6, i18nInterpolation7, i18nInterpolation8, i18nInterpolationV} from './i18n';
import {ComponentDef, ComponentDefInternal, ComponentTemplate, ComponentType, DirectiveDef, DirectiveDefFlags, DirectiveDefInternal, DirectiveType, PipeDef} from './interfaces/definition';

export {ComponentFactory, ComponentFactoryResolver, ComponentRef} from './component_ref';
export {QUERY_READ_CONTAINER_REF, QUERY_READ_ELEMENT_REF, QUERY_READ_FROM_NODE, QUERY_READ_TEMPLATE_REF, directiveInject, injectAttribute, injectChangeDetectorRef, injectComponentFactoryResolver, injectElementRef, injectTemplateRef, injectViewContainerRef} from './di';
export {RenderFlags} from './interfaces/definition';
export {CssSelectorList} from './interfaces/projection';



// Naming scheme:
// - Capital letters are for creating things: T(Text), E(Element), D(Directive), V(View),
// C(Container), L(Listener)
// - lower case letters are for binding: b(bind)
// - lower case letters are for binding target: p(property), a(attribute), k(class), s(style),
// i(input)
// - lower case letters for guarding life cycle hooks: l(lifeCycle)
// - lower case for closing: c(containerEnd), e(elementEnd), v(viewEnd)
// clang-format off
export {

  NO_CHANGE as NC,

  bind as b,
  interpolation1 as i1,
  interpolation2 as i2,
  interpolation3 as i3,
  interpolation4 as i4,
  interpolation5 as i5,
  interpolation6 as i6,
  interpolation7 as i7,
  interpolation8 as i8,
  interpolationV as iV,

  container as C,
  containerRefreshStart as cR,
  containerRefreshEnd as cr,

  element as Ee,
  elementAttribute as a,
  elementClassProp as cp,
  elementEnd as e,
  elementProperty as p,
  elementStart as E,

  elementStyling as s,
  elementStylingMap as sm,
  elementStyleProp as sp,
  elementStylingApply as sa,

  listener as L,
  store as st,
  load as ld,
  loadDirective as d,

  namespaceHTML as NH,
  namespaceMathML as NM,
  namespaceSVG as NS,

  projection as P,
  projectionDef as pD,

  text as T,
  textBinding as t,

  reference as r,

  reserveSlots as rS,

  embeddedViewStart as V,
  embeddedViewEnd as v,
  detectChanges,
  markDirty,
  tick,
} from './instructions';

export {
  i18nApply as iA,
  i18nMapping as iM,
  i18nInterpolation1 as iI1,
  i18nInterpolation2 as iI2,
  i18nInterpolation3 as iI3,
  i18nInterpolation4 as iI4,
  i18nInterpolation5 as iI5,
  i18nInterpolation6 as iI6,
  i18nInterpolation7 as iI7,
  i18nInterpolation8 as iI8,
  i18nInterpolationV as iIV,
  i18nExpMapping as iEM,
  I18nInstruction,
  I18nExpInstruction
} from './i18n';

export {NgModuleFactory, NgModuleRef, NgModuleType} from './ng_module_ref';

export {
    AttributeMarker
} from './interfaces/node';

export {
  pipe as Pp,
  pipeBind1 as pb1,
  pipeBind2 as pb2,
  pipeBind3 as pb3,
  pipeBind4 as pb4,
  pipeBindV as pbV,
} from './pipe';

export {
  QueryList,
  query as Q,
  queryRefresh as qR,
} from './query';
export  {
  registerContentQuery as Qr,
  loadQueryList as ql,
} from './instructions';

export {
  pureFunction0 as f0,
  pureFunction1 as f1,
  pureFunction2 as f2,
  pureFunction3 as f3,
  pureFunction4 as f4,
  pureFunction5 as f5,
  pureFunction6 as f6,
  pureFunction7 as f7,
  pureFunction8 as f8,
  pureFunctionV as fV,
} from './pure_function';


// clang-format on

export {
  ComponentDef,
  ComponentDefInternal,
  ComponentTemplate,
  ComponentType,
  DirectiveDef,
  DirectiveDefFlags,
  DirectiveDefInternal,
  DirectiveType,
  NgOnChangesFeature,
  InheritDefinitionFeature,
  PublicFeature,
  PipeDef,
  LifecycleHooksFeature,
  defineComponent,
  defineDirective,
  defineNgModule,
  definePipe,
  getHostElement,
  getRenderedText,
  renderComponent,
  whenRendered,
};
