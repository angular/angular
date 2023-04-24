/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// clang-format off
// we reexport these symbols just so that they are retained during the dead code elimination
// performed by rollup while it's creating fesm files.
//
// no code actually imports these symbols from the @angular/core entry point
export {
  compileNgModuleFactory as ɵcompileNgModuleFactory,
  isBoundToModule as ɵisBoundToModule
} from './application_ref';
export {
  injectChangeDetectorRef as ɵinjectChangeDetectorRef,
} from './change_detection/change_detector_ref';
export {
  getDebugNode as ɵgetDebugNode,
} from './debug/debug_node';
export {
  NG_INJ_DEF as ɵNG_INJ_DEF,
  NG_PROV_DEF as ɵNG_PROV_DEF,
  isInjectable as ɵisInjectable,
} from './di/interface/defs';
export {createInjector as ɵcreateInjector} from './di/create_injector';
export {
  registerNgModuleType as ɵɵregisterNgModuleType,
  setAllowDuplicateNgModuleIdsForTest as ɵsetAllowDuplicateNgModuleIdsForTest,
} from './linker/ng_module_registration';
export {
  NgModuleDef as ɵNgModuleDef,
  NgModuleTransitiveScopes as ɵNgModuleTransitiveScopes,
} from './metadata/ng_module_def';
export {
  getLContext as ɵgetLContext
} from './render3/context_discovery';
export {
  NG_COMP_DEF as ɵNG_COMP_DEF,
  NG_DIR_DEF as ɵNG_DIR_DEF,
  NG_ELEMENT_ID as ɵNG_ELEMENT_ID,
  NG_MOD_DEF as ɵNG_MOD_DEF,
  NG_PIPE_DEF as ɵNG_PIPE_DEF,
} from './render3/fields';
export {
  AttributeMarker as ɵAttributeMarker,
  ComponentDef as ɵComponentDef,
  ComponentFactory as ɵRender3ComponentFactory,
  ComponentRef as ɵRender3ComponentRef,
  ComponentType as ɵComponentType,
  CssSelectorList as ɵCssSelectorList,
  detectChanges as ɵdetectChanges,
  DirectiveDef as ɵDirectiveDef,
  DirectiveType as ɵDirectiveType,
  getDirectives as ɵgetDirectives,
  getHostElement as ɵgetHostElement,
  LifecycleHooksFeature as ɵLifecycleHooksFeature,
  NgModuleFactory as ɵNgModuleFactory,
  NgModuleRef as ɵRender3NgModuleRef,
  NgModuleType as ɵNgModuleType,
  NO_CHANGE as ɵNO_CHANGE,
  PipeDef as ɵPipeDef,
  RenderFlags as ɵRenderFlags,
  setClassMetadata as ɵsetClassMetadata,
  setLocaleId as ɵsetLocaleId,
  store as ɵstore,
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
  ɵɵComponentDeclaration,
  ɵɵcontentQuery,
  ɵɵCopyDefinitionFeature,
  ɵɵdefineComponent,
  ɵɵdefineDirective,
  ɵɵdefineNgModule,
  ɵɵdefinePipe,
  ɵɵDirectiveDeclaration,
  ɵɵdirectiveInject,
  ɵɵdisableBindings,
  ɵɵelement,
  ɵɵelementContainer,
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵenableBindings,
  ɵɵFactoryDeclaration,
  ɵɵgetCurrentView,
  ɵɵgetInheritedFactory,
  ɵɵhostProperty,
  ɵɵi18n,
  ɵɵi18nApply,
  ɵɵi18nAttributes,
  ɵɵi18nEnd,
  ɵɵi18nExp,
  ɵɵi18nPostprocess,
  ɵɵi18nStart,
  ɵɵInheritDefinitionFeature,
  ɵɵinjectAttribute,
  ɵɵInjectorDeclaration,
  ɵɵinvalidFactory,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnamespaceHTML,
  ɵɵnamespaceMathML,
  ɵɵnamespaceSVG,
  ɵɵnextContext,
  ɵɵNgModuleDeclaration,
  ɵɵNgOnChangesFeature,
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵpipeBind2,
  ɵɵpipeBind3,
  ɵɵpipeBind4,
  ɵɵpipeBindV,
  ɵɵPipeDeclaration,
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
  ɵɵProvidersFeature,
  ɵɵHostDirectivesFeature,
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
  ɵɵqueryRefresh,
  ɵɵreference,
  ɵɵresetView,
  ɵɵresolveBody,
  ɵɵresolveDocument,
  ɵɵresolveWindow,
  ɵɵrestoreView,

  ɵɵsetComponentScope,
  ɵɵsetNgModuleScope,
  ɵɵStandaloneFeature,
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
  ɵɵtemplateRefExtractor,
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
  ɵɵviewQuery,
  ɵgetUnknownElementStrictMode,
  ɵsetUnknownElementStrictMode,
  ɵgetUnknownPropertyStrictMode,
  ɵsetUnknownPropertyStrictMode
} from './render3/index';
export {
  LContext as ɵLContext,
} from './render3/interfaces/context';
export {
  setDocument as ɵsetDocument
} from './render3/interfaces/document';
export {
  compileComponent as ɵcompileComponent,
  compileDirective as ɵcompileDirective,
} from './render3/jit/directive';
export {
  resetJitOptions as ɵresetJitOptions,
} from './render3/jit/jit_options';
export {
  compileNgModule as ɵcompileNgModule,
  compileNgModuleDefs as ɵcompileNgModuleDefs,
  flushModuleScopingQueueAsMuchAsPossible as ɵflushModuleScopingQueueAsMuchAsPossible,
  patchComponentDefWithScope as ɵpatchComponentDefWithScope,
  resetCompiledComponents as ɵresetCompiledComponents,
  transitiveScopesFor as ɵtransitiveScopesFor,
} from './render3/jit/module';
export {
  FactoryTarget as ɵɵFactoryTarget,
  ɵɵngDeclareClassMetadata,
  ɵɵngDeclareComponent,
  ɵɵngDeclareDirective,
  ɵɵngDeclareFactory,
  ɵɵngDeclareInjectable,
  ɵɵngDeclareInjector,
  ɵɵngDeclareNgModule,
  ɵɵngDeclarePipe,
} from './render3/jit/partial';
export {
  compilePipe as ɵcompilePipe,
} from './render3/jit/pipe';
export {
  isNgModule as ɵisNgModule
} from './render3/jit/util';
export { Profiler as ɵProfiler, ProfilerEvent as ɵProfilerEvent } from './render3/profiler';
export {
  publishDefaultGlobalUtils as ɵpublishDefaultGlobalUtils
,
  publishGlobalUtil as ɵpublishGlobalUtil} from './render3/util/global_utils';
export {ViewRef as ɵViewRef} from './render3/view_ref';
export {
  bypassSanitizationTrustHtml as ɵbypassSanitizationTrustHtml,
  bypassSanitizationTrustResourceUrl as ɵbypassSanitizationTrustResourceUrl,
  bypassSanitizationTrustScript as ɵbypassSanitizationTrustScript,
  bypassSanitizationTrustStyle as ɵbypassSanitizationTrustStyle,
  bypassSanitizationTrustUrl as ɵbypassSanitizationTrustUrl,
} from './sanitization/bypass';
export {
  ɵɵsanitizeHtml,
  ɵɵsanitizeResourceUrl,
  ɵɵsanitizeScript,
  ɵɵsanitizeStyle,
  ɵɵsanitizeUrl,
  ɵɵsanitizeUrlOrResourceUrl,
  ɵɵtrustConstantHtml,
  ɵɵtrustConstantResourceUrl,
} from './sanitization/sanitization';
export {
  ɵɵvalidateIframeAttribute,
} from './sanitization/iframe_attrs_validation';
export {
  noSideEffects as ɵnoSideEffects,
} from './util/closure';


// clang-format on
