/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ɵɵdefineComponent, ɵɵdefineDirective, ɵɵdefineNgModule, ɵɵdefinePipe} from './definition';
import {ɵɵControlFeature} from './features/control_feature';
import {ɵɵExternalStylesFeature} from './features/external_styles_feature';
import {ɵɵHostDirectivesFeature} from './features/host_directives_feature';
import {ɵɵInheritDefinitionFeature} from './features/inherit_definition_feature';
import {ɵɵNgOnChangesFeature} from './features/ng_onchanges_feature';
import {ɵɵProvidersFeature} from './features/providers_feature';
import {ControlDirectiveHost} from './interfaces/control';
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
  AcxChangeDetectionStrategy,
  AcxComponentDebugMetadata,
  AcxDirectiveDebugMetadata,
  AcxViewEncapsulation,
  AngularComponentDebugMetadata,
  AngularDirectiveDebugMetadata,
  BaseDirectiveDebugMetadata,
  DirectiveDebugMetadata,
  getComponent,
  getDirectiveMetadata,
  getDirectives,
  getHostElement,
  getRenderedText,
  WizComponentDebugMetadata,
} from './util/discovery_utils';

export {DeferBlockDependencyInterceptor as ɵDeferBlockDependencyInterceptor} from '../defer/interfaces';
export {
  DEFER_BLOCK_CONFIG as ɵDEFER_BLOCK_CONFIG,
  DEFER_BLOCK_DEPENDENCY_INTERCEPTOR as ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR,
  ɵɵdeferEnableTimerScheduling,
} from '../defer/rendering';
export {NgModuleType} from '../metadata/ng_module_def';
export {ComponentFactory, ComponentFactoryResolver, ComponentRef} from './component_ref';
export {ɵsetClassDebugInfo} from './debug/set_debug_info';
export {ɵɵgetInheritedFactory} from './di';
export {ɵɵgetReplaceMetadataURL, ɵɵreplaceMetadata} from './hmr';
export {getLocaleId, setLocaleId} from './i18n/i18n_locale_id';
export {
  ɵgetUnknownElementStrictMode,
  ɵgetUnknownPropertyStrictMode,
  ɵsetUnknownElementStrictMode,
  ɵsetUnknownPropertyStrictMode,
  ɵɵadvance,
  ɵɵanimateEnter,
  ɵɵanimateEnterListener,
  ɵɵanimateLeave,
  ɵɵanimateLeaveListener,
  ɵɵariaProperty,
  ɵɵarrowFunction,
  ɵɵattachSourceLocations,
  ɵɵattribute,
  ɵɵclassMap,
  ɵɵclassProp,
  ɵɵcomponentInstance,
  ɵɵconditional,
  ɵɵconditionalBranchCreate,
  ɵɵconditionalCreate,
  ɵɵcontentQuery,
  ɵɵcontentQuerySignal,
  ɵɵcontrol,
  ɵɵcontrolCreate,
  ɵɵdebounce,
  ɵɵdeclareLet,
  ɵɵdefer,
  ɵɵdeferHydrateNever,
  ɵɵdeferHydrateOnHover,
  ɵɵdeferHydrateOnIdle,
  ɵɵdeferHydrateOnImmediate,
  ɵɵdeferHydrateOnInteraction,
  ɵɵdeferHydrateOnTimer,
  ɵɵdeferHydrateOnViewport,
  ɵɵdeferHydrateWhen,
  ɵɵdeferOnHover,
  ɵɵdeferOnIdle,
  ɵɵdeferOnImmediate,
  ɵɵdeferOnInteraction,
  ɵɵdeferOnTimer,
  ɵɵdeferOnViewport,
  ɵɵdeferPrefetchOnHover,
  ɵɵdeferPrefetchOnIdle,
  ɵɵdeferPrefetchOnImmediate,
  ɵɵdeferPrefetchOnInteraction,
  ɵɵdeferPrefetchOnTimer,
  ɵɵdeferPrefetchOnViewport,
  ɵɵdeferPrefetchWhen,
  ɵɵdeferWhen,
  ɵɵdirectiveInject,
  ɵɵdomElement,
  ɵɵdomElementContainer,
  ɵɵdomElementContainerEnd,
  ɵɵdomElementContainerStart,
  ɵɵdomElementEnd,
  ɵɵdomElementStart,
  ɵɵdomListener,
  ɵɵdomProperty,
  ɵɵdomTemplate,
  ɵɵelement,
  ɵɵelementContainer,
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵinjectAttribute,
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
  ɵɵinvalidFactory,
  ɵɵkey,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnamespaceHTML,
  ɵɵnamespaceMathML,
  ɵɵnamespaceSVG,
  ɵɵnextContext,
  ɵɵprevent,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵproperty,
  ɵɵqueryAdvance,
  ɵɵqueryRefresh,
  ɵɵreadContextLet,
  ɵɵreference,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIdentity,
  ɵɵrepeaterTrackByIndex,
  ɵɵstop,
  ɵɵstoreLet,
  ɵɵstyleMap,
  ɵɵstyleProp,
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
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty,
  ɵɵviewQuery,
  ɵɵviewQuerySignal,
} from './instructions/all';
export {
  ɵɵi18n,
  ɵɵi18nApply,
  ɵɵi18nAttributes,
  ɵɵi18nEnd,
  ɵɵi18nExp,
  ɵɵi18nPostprocess,
  ɵɵi18nStart,
} from './instructions/i18n';
export {AttributeMarker} from './interfaces/attribute_marker';
export {RenderFlags} from './interfaces/definition';
export {CssSelectorList, ProjectionSlots} from './interfaces/projection';
export {ɵɵgetComponentDepsFactory} from './local_compilation';
export {setClassMetadata, setClassMetadataAsync} from './metadata';
export {createEnvironmentInjector, NgModuleFactory, NgModuleRef} from './ng_module_ref';
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

export {store} from './util/view_utils';

export {
  AcxChangeDetectionStrategy,
  AcxComponentDebugMetadata,
  AcxDirectiveDebugMetadata,
  AcxViewEncapsulation,
  AngularComponentDebugMetadata,
  AngularDirectiveDebugMetadata,
  BaseDirectiveDebugMetadata,
  ComponentDef,
  ComponentTemplate,
  ComponentType,
  ControlDirectiveHost,
  DirectiveDebugMetadata,
  DirectiveDef,
  DirectiveType,
  getComponent,
  getDirectiveMetadata,
  getDirectives,
  getHostElement,
  getRenderedText,
  PipeDef,
  WizComponentDebugMetadata,
  ɵɵComponentDeclaration,
  ɵɵControlFeature,
  ɵɵdefineComponent,
  ɵɵdefineDirective,
  ɵɵdefineNgModule,
  ɵɵdefinePipe,
  ɵɵDirectiveDeclaration,
  ɵɵExternalStylesFeature,
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
};
