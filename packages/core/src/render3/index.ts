/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {LifecycleHooksFeature} from './component_ref';
import {ɵɵdefineComponent, ɵɵdefineDirective, ɵɵdefineNgModule, ɵɵdefinePipe, ɵɵsetComponentScope, ɵɵsetNgModuleScope} from './definition';
import {ɵɵCopyDefinitionFeature} from './features/copy_definition_feature';
import {ɵɵHostDirectivesFeature} from './features/host_directives_feature';
import {ɵɵInheritDefinitionFeature} from './features/inherit_definition_feature';
import {ɵɵNgOnChangesFeature} from './features/ng_onchanges_feature';
import {ɵɵProvidersFeature} from './features/providers_feature';
import {ɵɵStandaloneFeature} from './features/standalone_feature';
import {ComponentDef, ComponentTemplate, ComponentType, DirectiveDef, DirectiveType, PipeDef} from './interfaces/definition';
import {ɵɵComponentDeclaration, ɵɵDirectiveDeclaration, ɵɵFactoryDeclaration, ɵɵInjectorDeclaration, ɵɵNgModuleDeclaration, ɵɵPipeDeclaration} from './interfaces/public_definitions';
import {ComponentDebugMetadata, DirectiveDebugMetadata, getComponent, getDirectiveMetadata, getDirectives, getHostElement, getRenderedText} from './util/discovery_utils';

export {NgModuleType} from '../metadata/ng_module_def';
export {ComponentFactory, ComponentFactoryResolver, ComponentRef} from './component_ref';
export {ɵɵgetInheritedFactory} from './di';
export {getLocaleId, setLocaleId} from './i18n/i18n_locale_id';
// clang-format off
export {
  detectChanges,
  store,
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
  ɵgetUnknownElementStrictMode,
  ɵsetUnknownElementStrictMode,
  ɵgetUnknownPropertyStrictMode,
  ɵsetUnknownPropertyStrictMode
} from './instructions/all';
export {ɵɵi18n, ɵɵi18nApply, ɵɵi18nAttributes, ɵɵi18nEnd, ɵɵi18nExp,ɵɵi18nPostprocess, ɵɵi18nStart} from './instructions/i18n';
export {RenderFlags} from './interfaces/definition';
export {
  AttributeMarker
} from './interfaces/node';
export {CssSelectorList, ProjectionSlots} from './interfaces/projection';
export {
  setClassMetadata,
} from './metadata';
export {NgModuleFactory, NgModuleRef, createEnvironmentInjector} from './ng_module_ref';
export {
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵpipeBind2,
  ɵɵpipeBind3,
  ɵɵpipeBind4,
  ɵɵpipeBindV,
} from './pipe';
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
} from './pure_function';
export {
  ɵɵcontentQuery,
  ɵɵloadQuery,
  ɵɵqueryRefresh,
  ɵɵviewQuery} from './query';
export {
  ɵɵdisableBindings,

  ɵɵenableBindings,
  ɵɵresetView,
  ɵɵrestoreView,
} from './state';
export {NO_CHANGE} from './tokens';
export { ɵɵresolveBody, ɵɵresolveDocument,ɵɵresolveWindow} from './util/misc_utils';
export { ɵɵtemplateRefExtractor} from './view_engine_compatibility_prebound';
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
  ɵɵComponentDeclaration,
  ɵɵCopyDefinitionFeature,
  ɵɵdefineComponent,
  ɵɵdefineDirective,
  ɵɵdefineNgModule,
  ɵɵdefinePipe,
  ɵɵDirectiveDeclaration,
  ɵɵFactoryDeclaration,
  ɵɵHostDirectivesFeature,
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
