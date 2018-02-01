/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createComponentRef, detectChanges, getHostElement, markDirty, renderComponent} from './component';
import {NgOnChangesFeature, PublicFeature, defineComponent, defineDirective, definePipe} from './definition';
import {InjectFlags} from './di';
import {ComponentDef, ComponentTemplate, ComponentType, DirectiveDef, DirectiveDefFlags, DirectiveType} from './interfaces/definition';

export {InjectFlags, QUERY_READ_CONTAINER_REF, QUERY_READ_ELEMENT_REF, QUERY_READ_FROM_NODE, QUERY_READ_TEMPLATE_REF, inject, injectElementRef, injectTemplateRef, injectViewContainerRef} from './di';

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

  listener as L,
  memory as m,

  projection as P,
  projectionDef as pD,

  text as T,
  textBinding as t,

  viewStart as V,
  viewEnd as v,
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
  objectLiteral1 as o1,
  objectLiteral2 as o2,
  objectLiteral3 as o3,
  objectLiteral4 as o4,
  objectLiteral5 as o5,
  objectLiteral6 as o6,
  objectLiteral7 as o7,
  objectLiteral8 as o8,
} from './object_literal';


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
};
export {createComponentRef, detectChanges, getHostElement, markDirty, renderComponent};
export {CssSelector} from './interfaces/projection';
