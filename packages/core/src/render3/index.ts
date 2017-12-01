/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createComponentRef, detectChanges, getHostElement, markDirty, renderComponent} from './component';
import {inject, injectElementRef, injectTemplateRef, injectViewContainerRef} from './di';
import {ComponentDef, ComponentTemplate, ComponentType, DirectiveDef, DirectiveDefFlags, NgOnChangesFeature, PublicFeature, defineComponent, defineDirective} from './public_interfaces';

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
  LifeCycleGuard,

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

  containerCreate as C,
  containerEnd as c,
  contentProjection as P,

  directiveCreate as D,
  directiveLifeCycle as l,
  distributeProjectedNodes as dP,

  elementAttribute as a,
  elementClass as k,
  elementCreate as E,
  elementEnd as e,
  elementProperty as p,
  elementStyle as s,

  listenerCreate as L,
  memory as m,
  queryCreate as Q,

  refreshComponent as r,
  refreshContainer as rC,
  refreshContainerEnd as rc,
  refreshQuery as rQ,
  textCreate as T,
  textCreateBound as t,

  viewCreate as V,
  viewEnd as v,
} from './instructions';
// clang-format on
export {QueryList} from './query';
export {inject, injectElementRef, injectTemplateRef, injectViewContainerRef};
export {
  ComponentDef,
  ComponentTemplate,
  ComponentType,
  DirectiveDef,
  DirectiveDefFlags,
  NgOnChangesFeature,
  PublicFeature,
  defineComponent,
  defineDirective,
};
export {createComponentRef, detectChanges, getHostElement, markDirty, renderComponent};
