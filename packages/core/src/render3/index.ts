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
import {ProvidersFeature} from './features/providers_feature';
import {BaseDef, ComponentDef, ComponentDefWithMeta, ComponentTemplate, ComponentType, DirectiveDef, DirectiveDefFlags, DirectiveDefWithMeta, DirectiveType, PipeDef, PipeDefWithMeta} from './interfaces/definition';

export {ComponentFactory, ComponentFactoryResolver, ComponentRef, WRAP_RENDERER_FACTORY2, injectComponentFactoryResolver} from './component_ref';
export {getFactoryOf, getInheritedFactory} from './di';
export {RenderFlags} from './interfaces/definition';
export {CssSelectorList} from './interfaces/projection';

// clang-format off
export {
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

  listener,
  store,
  load,

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

  directiveInject,
  injectAttribute,
} from './instructions';

export {
  getCurrentView,
  restoreView,

  enableBindings,
  disableBindings,
} from './state';

export {
  i18nAttributes,
  i18nExp,
  i18nStart,
  i18nEnd,
  i18nApply,
  i18nIcuReplaceVars,
} from './i18n';

export {NgModuleFactory, NgModuleRef, NgModuleType} from './ng_module_ref';

export {
    AttributeMarker
} from './interfaces/node';

export {
  setClassMetadata,
} from './metadata';

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

export {templateRefExtractor} from './view_engine_compatibility_prebound';


// clang-format on

export {
  BaseDef,
  ComponentDef,
  ComponentDefWithMeta,
  ComponentTemplate,
  ComponentType,
  DirectiveDef,
  DirectiveDefFlags,
  DirectiveDefWithMeta,
  DirectiveType,
  NgOnChangesFeature,
  InheritDefinitionFeature,
  ProvidersFeature,
  PipeDef,
  PipeDefWithMeta,
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

export {NO_CHANGE} from './tokens';
