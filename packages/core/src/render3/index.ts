/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {LifecycleHooksFeature, renderComponent, whenRendered} from './component.js';
import {ɵɵdefineComponent, ɵɵdefineDirective, ɵɵdefineNgModule, ɵɵdefinePipe, ɵɵsetComponentScope, ɵɵsetNgModuleScope} from './definition.js';
import {ɵɵCopyDefinitionFeature} from './features/copy_definition_feature.js';
import {ɵɵInheritDefinitionFeature} from './features/inherit_definition_feature.js';
import {ɵɵNgOnChangesFeature} from './features/ng_onchanges_feature.js';
import {ɵɵProvidersFeature} from './features/providers_feature.js';
import {ɵɵStandaloneFeature} from './features/standalone_feature.js';
import {ComponentDef, ComponentTemplate, ComponentType, DirectiveDef, DirectiveType, PipeDef} from './interfaces/definition.js';
import {ɵɵComponentDeclaration, ɵɵDirectiveDeclaration, ɵɵFactoryDeclaration, ɵɵInjectorDeclaration, ɵɵNgModuleDeclaration, ɵɵPipeDeclaration} from './interfaces/public_definitions.js';
import {ComponentDebugMetadata, DirectiveDebugMetadata, getComponent, getDirectiveMetadata, getDirectives, getHostElement, getRenderedText} from './util/discovery_utils.js';

export {NgModuleType} from '../metadata/ng_module_def.js';
export {ComponentFactory, ComponentFactoryResolver, ComponentRef, injectComponentFactoryResolver} from './component_ref.js';
export {ɵɵgetInheritedFactory} from './di.js';
export {getLocaleId, setLocaleId} from './i18n/i18n_locale_id.js';
// clang-format off
export {
  detectChanges,
  markDirty,
  store,
  tick,
  ɵɵadvance,

  ɵɵattribute,
  ɵɵattributeInterpolate1,
  ɵɵattributeInterpolate2,
  ɵɵattributeInterpolate3,
  ɵɵattributeInterpolate4,
  ɵɵattributeInterpolate5,
  ɵɵattributeInterpolate6,
  ɵɵattributeInterpolate7,
  ɵɵattributeInterpolate8,
  ɵɵattributeInterpolateV,

  ɵɵclassMap,
  ɵɵclassMapInterpolate1,
  ɵɵclassMapInterpolate2,
  ɵɵclassMapInterpolate3,
  ɵɵclassMapInterpolate4,
  ɵɵclassMapInterpolate5,
  ɵɵclassMapInterpolate6,
  ɵɵclassMapInterpolate7,
  ɵɵclassMapInterpolate8,
  ɵɵclassMapInterpolateV,

  ɵɵclassProp,

  ɵɵdirectiveInject,

  ɵɵelement,

  ɵɵelementContainer,
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,

  ɵɵgetCurrentView,
  ɵɵhostProperty,
  ɵɵinjectAttribute,
  ɵɵinvalidFactory,

  ɵɵlistener,

  ɵɵnamespaceHTML,
  ɵɵnamespaceMathML,
  ɵɵnamespaceSVG,

  ɵɵnextContext,

  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵproperty,
  ɵɵpropertyInterpolate,
  ɵɵpropertyInterpolate1,
  ɵɵpropertyInterpolate2,
  ɵɵpropertyInterpolate3,
  ɵɵpropertyInterpolate4,
  ɵɵpropertyInterpolate5,
  ɵɵpropertyInterpolate6,
  ɵɵpropertyInterpolate7,
  ɵɵpropertyInterpolate8,
  ɵɵpropertyInterpolateV,

  ɵɵreference,

  ɵɵstyleMap,
  ɵɵstyleMapInterpolate1,
  ɵɵstyleMapInterpolate2,
  ɵɵstyleMapInterpolate3,
  ɵɵstyleMapInterpolate4,
  ɵɵstyleMapInterpolate5,
  ɵɵstyleMapInterpolate6,
  ɵɵstyleMapInterpolate7,
  ɵɵstyleMapInterpolate8,
  ɵɵstyleMapInterpolateV,

  ɵɵstyleProp,
  ɵɵstylePropInterpolate1,
  ɵɵstylePropInterpolate2,
  ɵɵstylePropInterpolate3,
  ɵɵstylePropInterpolate4,
  ɵɵstylePropInterpolate5,
  ɵɵstylePropInterpolate6,
  ɵɵstylePropInterpolate7,
  ɵɵstylePropInterpolate8,
  ɵɵstylePropInterpolateV,

  ɵɵsyntheticHostListener,
  ɵɵsyntheticHostProperty,

  ɵɵtemplate,

  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2,
  ɵɵtextInterpolate3,
  ɵɵtextInterpolate4,
  ɵɵtextInterpolate5,
  ɵɵtextInterpolate6,
  ɵɵtextInterpolate7,
  ɵɵtextInterpolate8,
  ɵɵtextInterpolateV,
} from './instructions/all.js';
export {ɵɵi18n, ɵɵi18nApply, ɵɵi18nAttributes, ɵɵi18nEnd, ɵɵi18nExp,ɵɵi18nPostprocess, ɵɵi18nStart} from './instructions/i18n.js';
export {RenderFlags} from './interfaces/definition.js';
export {
  AttributeMarker
} from './interfaces/node.js';
export {CssSelectorList, ProjectionSlots} from './interfaces/projection.js';
export {
  setClassMetadata,
} from './metadata.js';
export {NgModuleFactory, NgModuleRef, createEnvironmentInjector} from './ng_module_ref.js';
export {
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵpipeBind2,
  ɵɵpipeBind3,
  ɵɵpipeBind4,
  ɵɵpipeBindV,
} from './pipe.js';
export {
  ɵɵpureFunction0,
  ɵɵpureFunction1,
  ɵɵpureFunction2,
  ɵɵpureFunction3,
  ɵɵpureFunction4,
  ɵɵpureFunction5,
  ɵɵpureFunction6,
  ɵɵpureFunction7,
  ɵɵpureFunction8,
  ɵɵpureFunctionV,
} from './pure_function.js';
export {
  ɵɵcontentQuery,
  ɵɵloadQuery,
  ɵɵqueryRefresh,
  ɵɵviewQuery} from './query.js';
export {
  ɵɵdisableBindings,

  ɵɵenableBindings,
  ɵɵresetView,
  ɵɵrestoreView,
} from './state.js';
export {NO_CHANGE} from './tokens.js';
export { ɵɵresolveBody, ɵɵresolveDocument,ɵɵresolveWindow} from './util/misc_utils.js';
export { ɵɵtemplateRefExtractor} from './view_engine_compatibility_prebound.js';
// clang-format on

export {
  ComponentDebugMetadata,
  ComponentDef,
  ComponentTemplate,
  ComponentType,
  DirectiveDebugMetadata,
  DirectiveDef,
  DirectiveType,
  getComponent,
  getDirectiveMetadata,
  getDirectives,
  getHostElement,
  getRenderedText,
  LifecycleHooksFeature,
  PipeDef,
  renderComponent,
  whenRendered,
  ɵɵComponentDeclaration,
  ɵɵCopyDefinitionFeature,
  ɵɵdefineComponent,
  ɵɵdefineDirective,
  ɵɵdefineNgModule,
  ɵɵdefinePipe,
  ɵɵDirectiveDeclaration,
  ɵɵFactoryDeclaration,
  ɵɵInheritDefinitionFeature,
  ɵɵInjectorDeclaration,
  ɵɵNgModuleDeclaration,
  ɵɵNgOnChangesFeature,
  ɵɵPipeDeclaration,
  ɵɵProvidersFeature,
  ɵɵsetComponentScope,
  ɵɵsetNgModuleScope,
  ɵɵStandaloneFeature,
};
