/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// clang-format off
export {
  ΔdefineBase,
  ΔdefineComponent,
  ΔdefineDirective,
  ΔdefinePipe,
  ΔdefineNgModule,
  detectChanges as ɵdetectChanges,
  renderComponent as ɵrenderComponent,
  AttributeMarker as ɵAttributeMarker,
  ComponentType as ɵComponentType,
  ComponentFactory as ɵRender3ComponentFactory,
  ComponentRef as ɵRender3ComponentRef,
  DirectiveType as ɵDirectiveType,
  RenderFlags as ɵRenderFlags,
  ΔdirectiveInject,
  ΔinjectAttribute,
  ΔgetFactoryOf,
  ΔgetInheritedFactory,
  ΔsetComponentScope,
  ΔsetNgModuleScope,
  ΔtemplateRefExtractor,
  ΔProvidersFeature,
  ΔInheritDefinitionFeature,
  ΔNgOnChangesFeature,
  LifecycleHooksFeature as ɵLifecycleHooksFeature,
  NgModuleType as ɵNgModuleType,
  NgModuleRef as ɵRender3NgModuleRef,
  CssSelectorList as ɵCssSelectorList,
  markDirty as ɵmarkDirty,
  NgModuleFactory as ɵNgModuleFactory,
  NO_CHANGE as ɵNO_CHANGE,
  Δcontainer,
  ΔnextContext,
  ΔelementStart,
  ΔnamespaceHTML,
  ΔnamespaceMathML,
  ΔnamespaceSVG,
  Δelement,
  Δlistener,
  Δtext,
  ΔembeddedViewStart,
  Δprojection,
  Δbind,
  Δinterpolation1,
  Δinterpolation2,
  Δinterpolation3,
  Δinterpolation4,
  Δinterpolation5,
  Δinterpolation6,
  Δinterpolation7,
  Δinterpolation8,
  ΔinterpolationV,
  ΔpipeBind1,
  ΔpipeBind2,
  ΔpipeBind3,
  ΔpipeBind4,
  ΔpipeBindV,
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
  ΔgetCurrentView,
  getDirectives as ɵgetDirectives,
  getHostElement as ɵgetHostElement,
  ΔrestoreView,
  ΔcontainerRefreshStart,
  ΔcontainerRefreshEnd,
  ΔqueryRefresh,
  ΔviewQuery,
  ΔstaticViewQuery,
  ΔstaticContentQuery,
  ΔloadViewQuery,
  ΔcontentQuery,
  ΔloadContentQuery,
  ΔelementEnd,
  ΔelementProperty,
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
  ΔcomponentHostSyntheticProperty,
  ΔcomponentHostSyntheticListener,
  ΔprojectionDef,
  Δreference,
  ΔenableBindings,
  ΔdisableBindings,
  ΔallocHostVars,
  ΔelementAttribute,
  ΔelementContainerStart,
  ΔelementContainerEnd,
  Δstyling,
  ΔstyleMap,
  ΔclassMap,
  ΔstyleProp,
  ΔstylingApply,
  ΔclassProp,
  ΔelementHostAttrs,

  Δselect,
  ΔtextBinding,
  Δtemplate,
  ΔembeddedViewEnd,
  store as ɵstore,
  Δload,
  Δpipe,
  ΔBaseDef,
  ComponentDef as ɵComponentDef,
  ΔComponentDefWithMeta,
  DirectiveDef as ɵDirectiveDef,
  ΔDirectiveDefWithMeta,
  PipeDef as ɵPipeDef,
  ΔPipeDefWithMeta,
  whenRendered as ɵwhenRendered,
  Δi18n,
  Δi18nAttributes,
  Δi18nExp,
  Δi18nStart,
  Δi18nEnd,
  Δi18nApply,
  Δi18nPostprocess,
  i18nConfigureLocalize as ɵi18nConfigureLocalize,
  Δi18nLocalize,
  setClassMetadata as ɵsetClassMetadata,
  ΔresolveWindow,
  ΔresolveDocument,
  ΔresolveBody,
} from './render3/index';


export {
  compileComponent as ɵcompileComponent,
  compileDirective as ɵcompileDirective,
} from './render3/jit/directive';
export {
  compileNgModule as ɵcompileNgModule,
  compileNgModuleDefs as ɵcompileNgModuleDefs,
  patchComponentDefWithScope as ɵpatchComponentDefWithScope,
  resetCompiledComponents as ɵresetCompiledComponents,
  flushModuleScopingQueueAsMuchAsPossible as ɵflushModuleScopingQueueAsMuchAsPossible,
  transitiveScopesFor as ɵtransitiveScopesFor,
} from './render3/jit/module';
export {
  compilePipe as ɵcompilePipe,
} from './render3/jit/pipe';

export {
  NgModuleDef as ɵNgModuleDef,
  ΔNgModuleDefWithMeta,
  NgModuleTransitiveScopes as ɵNgModuleTransitiveScopes,
} from './metadata/ng_module';

export {
  ΔsanitizeHtml,
  ΔsanitizeStyle,
  ΔdefaultStyleSanitizer,
  ΔsanitizeScript,
  ΔsanitizeUrl,
  ΔsanitizeResourceUrl,
  ΔsanitizeUrlOrResourceUrl,
} from './sanitization/sanitization';

export {
  bypassSanitizationTrustHtml as ɵbypassSanitizationTrustHtml,
  bypassSanitizationTrustStyle as ɵbypassSanitizationTrustStyle,
  bypassSanitizationTrustScript as ɵbypassSanitizationTrustScript,
  bypassSanitizationTrustUrl as ɵbypassSanitizationTrustUrl,
  bypassSanitizationTrustResourceUrl as ɵbypassSanitizationTrustResourceUrl,
} from './sanitization/bypass';

export {
  getLContext as ɵgetLContext
} from './render3/context_discovery';

export {
  NG_ELEMENT_ID as ɵNG_ELEMENT_ID,
  NG_COMPONENT_DEF as ɵNG_COMPONENT_DEF,
  NG_DIRECTIVE_DEF as ɵNG_DIRECTIVE_DEF,
  NG_PIPE_DEF as ɵNG_PIPE_DEF,
  NG_MODULE_DEF as ɵNG_MODULE_DEF,
  NG_BASE_DEF as ɵNG_BASE_DEF
} from './render3/fields';

export {
  NG_INJECTABLE_DEF as ɵNG_INJECTABLE_DEF,
  NG_INJECTOR_DEF as ɵNG_INJECTOR_DEF,
} from './di/interface/defs';

export {
  Player as ɵPlayer,
  PlayerFactory as ɵPlayerFactory,
  PlayState as ɵPlayState,
  PlayerHandler as ɵPlayerHandler,
} from './render3/interfaces/player';

export {
  LContext as ɵLContext,
} from './render3/interfaces/context';

export {
  bindPlayerFactory as ɵbindPlayerFactory,
} from './render3/styling/player_factory';

export {
  addPlayer as ɵaddPlayer,
  getPlayers as ɵgetPlayers,
} from './render3/players';

// we reexport these symbols just so that they are retained during the dead code elimination
// performed by rollup while it's creating fesm files.
//
// no code actually imports these symbols from the @angular/core entry point
export {
  compileNgModuleFactory__POST_R3__ as ɵcompileNgModuleFactory__POST_R3__,
  isBoundToModule__POST_R3__ as ɵisBoundToModule__POST_R3__
} from './application_ref';
export {
  SWITCH_COMPILE_COMPONENT__POST_R3__ as ɵSWITCH_COMPILE_COMPONENT__POST_R3__,
  SWITCH_COMPILE_DIRECTIVE__POST_R3__ as ɵSWITCH_COMPILE_DIRECTIVE__POST_R3__,
  SWITCH_COMPILE_PIPE__POST_R3__ as ɵSWITCH_COMPILE_PIPE__POST_R3__,
} from './metadata/directives';
export {
  SWITCH_COMPILE_NGMODULE__POST_R3__ as ɵSWITCH_COMPILE_NGMODULE__POST_R3__,
} from './metadata/ng_module';
export {
  getDebugNode__POST_R3__ as ɵgetDebugNode__POST_R3__,
} from './debug/debug_node';
export {
  SWITCH_COMPILE_INJECTABLE__POST_R3__ as ɵSWITCH_COMPILE_INJECTABLE__POST_R3__,
} from './di/injectable';
export {
  SWITCH_IVY_ENABLED__POST_R3__ as ɵSWITCH_IVY_ENABLED__POST_R3__,
} from './ivy_switch';
export {
  SWITCH_CHANGE_DETECTOR_REF_FACTORY__POST_R3__ as ɵSWITCH_CHANGE_DETECTOR_REF_FACTORY__POST_R3__,
} from './change_detection/change_detector_ref';
export {
  Compiler_compileModuleSync__POST_R3__ as ɵCompiler_compileModuleSync__POST_R3__,
  Compiler_compileModuleAsync__POST_R3__ as ɵCompiler_compileModuleAsync__POST_R3__,
  Compiler_compileModuleAndAllComponentsSync__POST_R3__ as ɵCompiler_compileModuleAndAllComponentsSync__POST_R3__,
  Compiler_compileModuleAndAllComponentsAsync__POST_R3__ as ɵCompiler_compileModuleAndAllComponentsAsync__POST_R3__,
} from './linker/compiler';
export {
  SWITCH_ELEMENT_REF_FACTORY__POST_R3__ as ɵSWITCH_ELEMENT_REF_FACTORY__POST_R3__,
} from './linker/element_ref';
export {
  SWITCH_TEMPLATE_REF_FACTORY__POST_R3__ as ɵSWITCH_TEMPLATE_REF_FACTORY__POST_R3__,
} from './linker/template_ref';
export {
  SWITCH_VIEW_CONTAINER_REF_FACTORY__POST_R3__ as ɵSWITCH_VIEW_CONTAINER_REF_FACTORY__POST_R3__,
} from './linker/view_container_ref';
export {
  SWITCH_RENDERER2_FACTORY__POST_R3__ as ɵSWITCH_RENDERER2_FACTORY__POST_R3__,
} from './render/api';

export { getModuleFactory__POST_R3__ as ɵgetModuleFactory__POST_R3__ } from './linker/ng_module_factory_loader';

export { registerNgModuleType as ɵregisterNgModuleType } from './linker/ng_module_factory_registration';

export {
  publishGlobalUtil as ɵpublishGlobalUtil,
  publishDefaultGlobalUtils as ɵpublishDefaultGlobalUtils
} from './render3/util/global_utils';

export {createInjector as ɵcreateInjector} from './di/r3_injector';

export {INJECTOR_IMPL__POST_R3__ as ɵINJECTOR_IMPL__POST_R3__} from './di/injector';

// clang-format on
