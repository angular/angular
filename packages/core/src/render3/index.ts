/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createComponentRef, detectChanges, getHostElement, getRenderedText, markDirty, renderComponent, whenRendered} from './component';
import {NgOnChangesFeature, PublicFeature, defineComponent, defineDirective, definePipe} from './definition';
import {InjectFlags} from './di';
import {ComponentDef, ComponentTemplate, ComponentType, DirectiveDef, DirectiveDefFlags, DirectiveType} from './interfaces/definition';

export {InjectFlags, QUERY_READ_CONTAINER_REF, QUERY_READ_ELEMENT_REF, QUERY_READ_FROM_NODE, QUERY_READ_TEMPLATE_REF, inject, injectElementRef, injectTemplateRef, injectViewContainerRef} from './di';
export {CssSelector} from './interfaces/projection';


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

  directiveRefresh as r,

  container as C,
  containerRefreshStart as cR,
  containerRefreshEnd as cr,

  elementAttribute as a,
  elementClass as k,
  elementEnd as e,
  elementProperty as p,
  elementStart as E,
  elementStyle as s,

  listener as L,
  store as st,
  load as ld,

  projection as P,
  projectionDef as pD,

  text as T,
  textBinding as t,

  embeddedViewStart as V,
  embeddedViewEnd as v,
} from './instructions';

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
  ComponentTemplate,
  ComponentType,
  DirectiveDef,
  DirectiveDefFlags,
  DirectiveType,
  NgOnChangesFeature,
  PublicFeature,
  defineComponent,
  defineDirective,
  definePipe,
  detectChanges,
  createComponentRef,
  getHostElement,
  getRenderedText,
  markDirty,
  renderComponent,
  whenRendered,
};
