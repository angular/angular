/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {LifecycleHooksFeature, renderComponent, whenRendered} from './component';
import {ΔdefineBase, ΔdefineComponent, ΔdefineDirective, ΔdefineNgModule, ΔdefinePipe, ΔsetComponentScope, ΔsetNgModuleScope} from './definition';
import {ΔInheritDefinitionFeature} from './features/inherit_definition_feature';
import {ΔNgOnChangesFeature} from './features/ng_onchanges_feature';
import {ΔProvidersFeature} from './features/providers_feature';
import {ComponentDef, ComponentTemplate, ComponentType, DirectiveDef, DirectiveDefFlags, DirectiveType, PipeDef, ΔBaseDef, ΔComponentDefWithMeta, ΔDirectiveDefWithMeta, ΔPipeDefWithMeta} from './interfaces/definition';
import {getComponent, getDirectives, getHostElement, getRenderedText} from './util/discovery_utils';

export {ComponentFactory, ComponentFactoryResolver, ComponentRef, injectComponentFactoryResolver} from './component_ref';
export {ΔgetFactoryOf, ΔgetInheritedFactory} from './di';
// clang-format off
export {
  detectChanges,
  markDirty,
  store,
  tick,
  ΔallocHostVars,
  Δbind,
  ΔclassMap,
  ΔclassProp,
  ΔcomponentHostSyntheticListener,
  ΔcomponentHostSyntheticProperty,

  Δcontainer,
  ΔcontainerRefreshEnd,
  ΔcontainerRefreshStart,

  ΔdirectiveInject,

  Δelement,
  ΔelementAttribute,
  ΔelementContainerEnd,

  ΔelementContainerStart,
  ΔelementEnd,

  ΔelementHostAttrs,
  ΔelementProperty,
  ΔelementStart,
  ΔembeddedViewEnd,

  ΔembeddedViewStart,

  ΔgetCurrentView,
  ΔinjectAttribute,

  Δinterpolation1,
  Δinterpolation2,
  Δinterpolation3,
  Δinterpolation4,
  Δinterpolation5,
  Δinterpolation6,
  Δinterpolation7,
  Δinterpolation8,
  ΔinterpolationV,

  Δlistener,
  Δload,

  ΔnamespaceHTML,
  ΔnamespaceMathML,
  ΔnamespaceSVG,

  ΔnextContext,

  Δprojection,
  ΔprojectionDef,
  Δproperty,
  ΔpropertyInterpolate,
  ΔpropertyInterpolate1,
  ΔpropertyInterpolate2,
  ΔpropertyInterpolate3,
  ΔpropertyInterpolate4,
  ΔpropertyInterpolate5,
  ΔpropertyInterpolate6,
  ΔpropertyInterpolate7,
  ΔpropertyInterpolate8,
  ΔpropertyInterpolateV,

  Δreference,

  Δselect,
  ΔstyleMap,
  ΔstyleProp,
  Δstyling,
  ΔstylingApply,
  Δtemplate,

  Δtext,
  ΔtextBinding} from './instructions/all';
export {RenderFlags} from './interfaces/definition';
export {CssSelectorList} from './interfaces/projection';

export {
  ΔrestoreView,

  ΔenableBindings,
  ΔdisableBindings,
} from './state';

export {
  Δi18n,
  Δi18nAttributes,
  Δi18nExp,
  Δi18nStart,
  Δi18nEnd,
  Δi18nApply,
  Δi18nPostprocess,
  i18nConfigureLocalize,
  Δi18nLocalize,
} from './i18n';

export {NgModuleFactory, NgModuleRef, NgModuleType} from './ng_module_ref';

export {
  AttributeMarker
} from './interfaces/node';

export {
  setClassMetadata,
} from './metadata';

export {
  Δpipe,
  ΔpipeBind1,
  ΔpipeBind2,
  ΔpipeBind3,
  ΔpipeBind4,
  ΔpipeBindV,
} from './pipe';

export {
  ΔqueryRefresh,
  ΔviewQuery,
  ΔstaticViewQuery,
  ΔloadViewQuery,
  ΔcontentQuery,
  ΔloadContentQuery,
  ΔstaticContentQuery
} from './query';

export {
  ΔpureFunction0,
  ΔpureFunction1,
  ΔpureFunction2,
  ΔpureFunction3,
  ΔpureFunction4,
  ΔpureFunction5,
  ΔpureFunction6,
  ΔpureFunction7,
  ΔpureFunction8,
  ΔpureFunctionV,
} from './pure_function';

export {ΔtemplateRefExtractor} from './view_engine_compatibility_prebound';

export {ΔresolveWindow, ΔresolveDocument, ΔresolveBody} from './util/misc_utils';

// clang-format on

export {
  ΔBaseDef,
  ComponentDef,
  ΔComponentDefWithMeta,
  ComponentTemplate,
  ComponentType,
  DirectiveDef,
  DirectiveDefFlags,
  ΔDirectiveDefWithMeta,
  DirectiveType,
  ΔNgOnChangesFeature,
  ΔInheritDefinitionFeature,
  ΔProvidersFeature,
  PipeDef,
  ΔPipeDefWithMeta,
  LifecycleHooksFeature,
  ΔdefineComponent,
  ΔdefineDirective,
  ΔdefineNgModule,
  ΔdefineBase,
  ΔdefinePipe,
  getHostElement,
  getComponent,
  getDirectives,
  getRenderedText,
  renderComponent,
  ΔsetComponentScope,
  ΔsetNgModuleScope,
  whenRendered,
};

export {NO_CHANGE} from './tokens';
