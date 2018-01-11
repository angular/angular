/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createComponentRef, detectChanges, getHostElement, markDirty, renderComponent} from './component';
import {NgOnChangesFeature, PublicFeature, defineComponent, defineDirective} from './definition';
import {ComponentDef, ComponentTemplate, ComponentType, DirectiveDef, DirectiveDefFlags, DirectiveType} from './interfaces/definition';

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
  inject, injectElementRef, injectTemplateRef, injectViewContainerRef,

  LifecycleHook,

  NO_CHANGE as NC,

  bind as b,
  bind1 as b1,
  bind2 as b2,
  bind3 as b3,
  bind4 as b4,
  bind5 as b5,
  bind6 as b6,
  bind7 as b7,
  bind8 as b8,
  bindV as bV,

  componentRefresh as r,

  container as C,
  containerRefreshStart as cR,
  containerRefreshEnd as cr,

  elementAttribute as a,
  elementClass as k,
  elementEnd as e,
  elementProperty as p,
  elementStart as E,
  elementStyle as s,

  lifecycle as l,
  listener as L,
  memory as m,

  projection as P,
  projectionDef as pD,

  query as Q,
  queryRefresh as qR,

  text as T,
  textBinding as t,

  viewStart as V,
  viewEnd as v,
} from './instructions';
// clang-format on
export {QueryList} from './query';
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
};
export {createComponentRef, detectChanges, getHostElement, markDirty, renderComponent};
export {InjectFlags} from './di';
