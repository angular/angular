/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LifecycleHooksFeature, getHostElement, getRenderedText, renderComponent, whenRendered} from './component';
import {defineBase, defineComponent, defineDirective, defineNgModule, definePipe} from './definition';
import {InheritDefinitionFeature} from './features/inherit_definition_feature';
import {NgOnChangesFeature} from './features/ng_onchanges_feature';
import {PublicFeature} from './features/public_feature';
import {BaseDef, ComponentDef, ComponentDefInternal, ComponentTemplate, ComponentType, DirectiveDef, DirectiveDefFlags, DirectiveDefInternal, DirectiveType, PipeDef} from './interfaces/definition';

export {ComponentFactory, ComponentFactoryResolver, ComponentRef, WRAP_RENDERER_FACTORY2} from './component_ref';
export {QUERY_READ_CONTAINER_REF, QUERY_READ_ELEMENT_REF, QUERY_READ_FROM_NODE, QUERY_READ_TEMPLATE_REF, directiveInject, getFactoryOf, getInheritedFactory, injectAttribute, injectComponentFactoryResolver, injectRenderer2, templateRefExtractor} from './di';
export {RenderFlags} from './interfaces/definition';
export {CssSelectorList} from './interfaces/projection';

// clang-format off
export {

  NO_CHANGE,

  bind,
  interpolation1,
  interpolation2,
  interpolation3,
  interpolation4,
  interpolation5,
  interpolation6,
  interpolation7,
  interpolation8,
  interpolationV,

  container,
  containerRefreshStart,
  containerRefreshEnd,

  nextContext,

  element,
  elementAttribute,
  elementClassProp,
  elementEnd,
  elementProperty,
  elementStart,

  elementContainerStart,
  elementContainerEnd,

  elementStyling,
  elementStylingMap,
  elementStyleProp,
  elementStylingApply,

  getCurrentView,
  restoreView,

  listener,
  store,
  load,
  loadDirective,

  namespaceHTML,
  namespaceMathML,
  namespaceSVG,

  projection,
  projectionDef,

  text,
  textBinding,
  template,

  reference,

  embeddedViewStart,
  embeddedViewEnd,
  detectChanges,
  markDirty,
  tick,
} from './instructions';

export {
  i18nApply,
  i18nMapping,
  i18nInterpolation1,
  i18nInterpolation2,
  i18nInterpolation3,
  i18nInterpolation4,
  i18nInterpolation5,
  i18nInterpolation6,
  i18nInterpolation7,
  i18nInterpolation8,
  i18nInterpolationV,
  i18nExpMapping,
  I18nInstruction,
  I18nExpInstruction
} from './i18n';

export {NgModuleFactory, NgModuleRef, NgModuleType} from './ng_module_ref';

export {
    AttributeMarker
} from './interfaces/node';

export {
  pipe,
  pipeBind1,
  pipeBind2,
  pipeBind3,
  pipeBind4,
  pipeBindV,
} from './pipe';

export {
  QueryList,
  query,
  queryRefresh,
} from './query';
export  {
  registerContentQuery,
  loadQueryList,
} from './instructions';

export {
  pureFunction0,
  pureFunction1,
  pureFunction2,
  pureFunction3,
  pureFunction4,
  pureFunction5,
  pureFunction6,
  pureFunction7,
  pureFunction8,
  pureFunctionV,
} from './pure_function';


// clang-format on

export {
  BaseDef,
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
  defineBase,
  definePipe,
  getHostElement,
  getRenderedText,
  renderComponent,
  whenRendered,
};
