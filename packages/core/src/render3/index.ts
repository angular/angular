/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ɵɵdefineComponent, ɵɵdefineDirective, ɵɵdefineNgModule, ɵɵdefinePipe} from './definition';
import {ɵɵCopyDefinitionFeature} from './features/copy_definition_feature';
import {ɵɵHostDirectivesFeature} from './features/host_directives_feature';
import {ɵɵInheritDefinitionFeature} from './features/inherit_definition_feature';
import {ɵɵNgOnChangesFeature} from './features/ng_onchanges_feature';
import {ɵɵProvidersFeature} from './features/providers_feature';
import {ɵɵExternalStylesFeature} from './features/external_styles_feature';
import {ɵɵAnimationsFeature} from './features/animations_feature';
import {
  ComponentDef,
  ComponentTemplate,
  ComponentType,
  DirectiveDef,
  DirectiveType,
  PipeDef,
} from './interfaces/definition';
import {
  ɵɵComponentDeclaration,
  ɵɵDirectiveDeclaration,
  ɵɵFactoryDeclaration,
  ɵɵInjectorDeclaration,
  ɵɵNgModuleDeclaration,
  ɵɵPipeDeclaration,
} from './interfaces/public_definitions';
import {ɵɵsetComponentScope, ɵɵsetNgModuleScope} from './scope';
import {
  Framework,
  BaseDirectiveDebugMetadata,
  AngularDirectiveDebugMetadata,
  AngularComponentDebugMetadata,
  AcxChangeDetectionStrategy,
  AcxViewEncapsulation,
  AcxDirectiveDebugMetadata,
  AcxComponentDebugMetadata,
  WizComponentDebugMetadata,
  DirectiveDebugMetadata,
  getComponent,
  getDirectiveMetadata,
  getDirectives,
  getHostElement,
  getRenderedText,
} from './util/discovery_utils';

export {NgModuleType} from '../metadata/ng_module_def';
export {ComponentFactory, ComponentFactoryResolver, ComponentRef} from './component_ref';
export {ɵɵgetInheritedFactory} from './di';
export {getLocaleId, setLocaleId} from './i18n/i18n_locale_id';
export {
  ɵɵadvance,
  ɵɵariaProperty,
  ɵɵattribute,
  ɵɵinterpolate,
  ɵɵinterpolate1,
  ɵɵinterpolate2,
  ɵɵinterpolate3,
  ɵɵinterpolate4,
  ɵɵinterpolate5,
  ɵɵinterpolate6,
  ɵɵinterpolate7,
  ɵɵinterpolate8,
  ɵɵinterpolateV,
  ɵɵclassMap,
  ɵɵclassProp,
  ɵɵcomponentInstance,
  ɵɵdirectiveInject,
  ɵɵdomElement,
  ɵɵdomElementStart,
  ɵɵdomElementEnd,
  ɵɵdomElementContainer,
  ɵɵdomElementContainerStart,
  ɵɵdomElementContainerEnd,
  ɵɵdomTemplate,
  ɵɵdomListener,
  ɵɵelement,
  ɵɵelementContainer,
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵdomProperty,
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
  ɵɵcontentQuery,
  ɵɵcontentQuerySignal,
  ɵɵloadQuery,
  ɵɵqueryRefresh,
  ɵɵqueryAdvance,
  ɵɵviewQuery,
  ɵɵviewQuerySignal,
  ɵɵreference,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIdentity,
  ɵɵrepeaterTrackByIndex,
  ɵɵstyleMap,
  ɵɵstyleProp,
  ɵɵsyntheticHostListener,
  ɵɵsyntheticHostProperty,
  ɵɵtemplate,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵconditionalBranchCreate,
  ɵɵdefer,
  ɵɵdeferWhen,
  ɵɵdeferOnIdle,
  ɵɵdeferOnImmediate,
  ɵɵdeferOnTimer,
  ɵɵdeferOnHover,
  ɵɵdeferOnInteraction,
  ɵɵdeferOnViewport,
  ɵɵdeferPrefetchWhen,
  ɵɵdeferPrefetchOnIdle,
  ɵɵdeferPrefetchOnImmediate,
  ɵɵdeferPrefetchOnTimer,
  ɵɵdeferPrefetchOnHover,
  ɵɵdeferPrefetchOnInteraction,
  ɵɵdeferPrefetchOnViewport,
  ɵɵdeferHydrateWhen,
  ɵɵdeferHydrateNever,
  ɵɵdeferHydrateOnIdle,
  ɵɵdeferHydrateOnImmediate,
  ɵɵdeferHydrateOnTimer,
  ɵɵdeferHydrateOnHover,
  ɵɵdeferHydrateOnInteraction,
  ɵɵdeferHydrateOnViewport,
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
  ɵɵtwoWayProperty,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵgetUnknownElementStrictMode,
  ɵsetUnknownElementStrictMode,
  ɵgetUnknownPropertyStrictMode,
  ɵsetUnknownPropertyStrictMode,
  ɵɵdeclareLet,
  ɵɵstoreLet,
  ɵɵreadContextLet,
  ɵɵattachSourceLocations,
  ɵɵanimateEnter,
  ɵɵanimateEnterListener,
  ɵɵanimateLeave,
  ɵɵanimateLeaveListener,
} from './instructions/all';
export {
  ɵɵdeferEnableTimerScheduling,
  DEFER_BLOCK_DEPENDENCY_INTERCEPTOR as ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR,
  DEFER_BLOCK_CONFIG as ɵDEFER_BLOCK_CONFIG,
} from '../defer/rendering';
export {DeferBlockDependencyInterceptor as ɵDeferBlockDependencyInterceptor} from '../defer/interfaces';
export {
  ɵɵi18n,
  ɵɵi18nApply,
  ɵɵi18nAttributes,
  ɵɵi18nEnd,
  ɵɵi18nExp,
  ɵɵi18nPostprocess,
  ɵɵi18nStart,
} from './instructions/i18n';
export {RenderFlags} from './interfaces/definition';
export {AttributeMarker} from './interfaces/attribute_marker';
export {CssSelectorList, ProjectionSlots} from './interfaces/projection';
export {setClassMetadata, setClassMetadataAsync} from './metadata';
export {NgModuleFactory, NgModuleRef, createEnvironmentInjector} from './ng_module_ref';
export {ɵɵpipe, ɵɵpipeBind1, ɵɵpipeBind2, ɵɵpipeBind3, ɵɵpipeBind4, ɵɵpipeBindV} from './pipe';
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
export {ɵɵdisableBindings, ɵɵenableBindings, ɵɵresetView, ɵɵrestoreView} from './state';
export {NO_CHANGE} from './tokens';
export {ɵɵresolveBody, ɵɵresolveDocument, ɵɵresolveWindow} from './util/misc_utils';
export {ɵɵtemplateRefExtractor} from './view_engine_compatibility_prebound';
export {ɵɵgetComponentDepsFactory} from './local_compilation';
export {ɵsetClassDebugInfo} from './debug/set_debug_info';
export {ɵɵreplaceMetadata, ɵɵgetReplaceMetadataURL} from './hmr';

export {store} from './util/view_utils';

export {
  ComponentDef,
  ComponentTemplate,
  ComponentType,
  Framework,
  BaseDirectiveDebugMetadata,
  AngularDirectiveDebugMetadata,
  AngularComponentDebugMetadata,
  AcxChangeDetectionStrategy,
  AcxViewEncapsulation,
  AcxDirectiveDebugMetadata,
  AcxComponentDebugMetadata,
  WizComponentDebugMetadata,
  DirectiveDebugMetadata,
  DirectiveDef,
  DirectiveType,
  getComponent,
  getDirectiveMetadata,
  getDirectives,
  getHostElement,
  getRenderedText,
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
  ɵɵExternalStylesFeature,
  ɵɵAnimationsFeature,
};
