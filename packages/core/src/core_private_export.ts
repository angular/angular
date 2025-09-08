/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export {
  type NavigateEvent as ɵNavigateEvent,
  type Navigation as ɵNavigation,
  type NavigationCurrentEntryChangeEvent as ɵNavigationCurrentEntryChangeEvent,
  type NavigationHistoryEntry as ɵNavigationHistoryEntry,
  type NavigationNavigateOptions as ɵNavigationNavigateOptions,
  type NavigationOptions as ɵNavigationOptions,
  type NavigationReloadOptions as ɵNavigationReloadOptions,
  type NavigationResult as ɵNavigationResult,
  type NavigationTransition as ɵNavigationTransition,
  type NavigationUpdateCurrentEntryOptions as ɵNavigationUpdateCurrentEntryOptions,
  type NavigationTypeString as ɵNavigationTypeString,
  type NavigationInterceptOptions as ɵNavigationInterceptOptions,
  type NavigationDestination as ɵNavigationDestination,
} from '../primitives/dom-navigation';
export {setAlternateWeakRefImpl as ɵsetAlternateWeakRefImpl} from '../primitives/signals';
export {INTERNAL_APPLICATION_ERROR_HANDLER as ɵINTERNAL_APPLICATION_ERROR_HANDLER} from './error_handler';
export {
  IMAGE_CONFIG as ɵIMAGE_CONFIG,
  IMAGE_CONFIG_DEFAULTS as ɵIMAGE_CONFIG_DEFAULTS,
  ImageConfig as ɵImageConfig,
} from './application/application_tokens';
export {
  TracingAction as ɵTracingAction,
  TracingService as ɵTracingService,
  TracingSnapshot as ɵTracingSnapshot,
} from './application/tracing';
export {internalCreateApplication as ɵinternalCreateApplication} from './application/create_application';
export {
  defaultIterableDiffers as ɵdefaultIterableDiffers,
  defaultKeyValueDiffers as ɵdefaultKeyValueDiffers,
} from './change_detection/change_detection';
export {
  internalProvideZoneChangeDetection as ɵinternalProvideZoneChangeDetection,
  PROVIDED_NG_ZONE as ɵPROVIDED_NG_ZONE,
} from './change_detection/scheduling/ng_zone_scheduling';
export {ChangeDetectionSchedulerImpl as ɵChangeDetectionSchedulerImpl} from './change_detection/scheduling/zoneless_scheduling_impl';
export {PROVIDED_ZONELESS as ɵPROVIDED_ZONELESS} from './change_detection/scheduling/zoneless_scheduling';
export {
  ChangeDetectionScheduler as ɵChangeDetectionScheduler,
  NotificationSource as ɵNotificationSource,
  ZONELESS_ENABLED as ɵZONELESS_ENABLED,
} from './change_detection/scheduling/zoneless_scheduling';
export {Console as ɵConsole} from './console';
export {
  DeferBlockDetails as ɵDeferBlockDetails,
  getDeferBlocks as ɵgetDeferBlocks,
} from './defer/discovery';
export {renderDeferBlockState as ɵrenderDeferBlockState} from './defer/rendering';
export {triggerResourceLoading as ɵtriggerResourceLoading} from './defer/triggering';
export {
  DeferBlockBehavior as ɵDeferBlockBehavior,
  DeferBlockConfig as ɵDeferBlockConfig,
  DeferBlockState as ɵDeferBlockState,
} from './defer/interfaces';
export {getDocument as ɵgetDocument} from './render3/interfaces/document';
export {
  convertToBitFlags as ɵconvertToBitFlags,
  setCurrentInjector as ɵsetCurrentInjector,
} from './di/injector_compatibility';
export {
  getInjectableDef as ɵgetInjectableDef,
  ɵɵInjectableDeclaration,
  ɵɵInjectorDef,
} from './di/interface/defs';
export {
  InternalEnvironmentProviders as ɵInternalEnvironmentProviders,
  isEnvironmentProviders as ɵisEnvironmentProviders,
} from './di/interface/provider';
export {INJECTOR_SCOPE as ɵINJECTOR_SCOPE} from './di/scope';
export {XSS_SECURITY_URL as ɵXSS_SECURITY_URL} from './error_details_base_url';
export {
  formatRuntimeError as ɵformatRuntimeError,
  RuntimeError as ɵRuntimeError,
  RuntimeErrorCode as ɵRuntimeErrorCode,
} from './errors';
export {annotateForHydration as ɵannotateForHydration} from './hydration/annotate';
export {
  withDomHydration as ɵwithDomHydration,
  withI18nSupport as ɵwithI18nSupport,
  withIncrementalHydration as ɵwithIncrementalHydration,
  CLIENT_RENDER_MODE_FLAG as ɵCLIENT_RENDER_MODE_FLAG,
} from './hydration/api';
export {withEventReplay as ɵwithEventReplay} from './hydration/event_replay';
export {JSACTION_EVENT_CONTRACT as ɵJSACTION_EVENT_CONTRACT} from './event_delegation_utils';
export {
  IS_HYDRATION_DOM_REUSE_ENABLED as ɵIS_HYDRATION_DOM_REUSE_ENABLED,
  IS_INCREMENTAL_HYDRATION_ENABLED as ɵIS_INCREMENTAL_HYDRATION_ENABLED,
  JSACTION_BLOCK_ELEMENT_MAP as ɵJSACTION_BLOCK_ELEMENT_MAP,
  IS_ENABLED_BLOCKING_INITIAL_NAVIGATION as ɵIS_ENABLED_BLOCKING_INITIAL_NAVIGATION,
} from './hydration/tokens';
export {
  HydrationStatus as ɵHydrationStatus,
  HydratedNode as ɵHydratedNode,
  HydrationInfo as ɵHydrationInfo,
  readHydrationInfo as ɵreadHydrationInfo,
  SSR_CONTENT_INTEGRITY_MARKER as ɵSSR_CONTENT_INTEGRITY_MARKER,
} from './hydration/utils';
export {
  CurrencyIndex as ɵCurrencyIndex,
  ExtraLocaleDataIndex as ɵExtraLocaleDataIndex,
  findLocaleData as ɵfindLocaleData,
  getLocaleCurrencyCode as ɵgetLocaleCurrencyCode,
  getLocalePluralCase as ɵgetLocalePluralCase,
  LocaleDataIndex as ɵLocaleDataIndex,
  registerLocaleData as ɵregisterLocaleData,
  unregisterAllLocaleData as ɵunregisterLocaleData,
} from './i18n/locale_data_api';
export {DEFAULT_LOCALE_ID as ɵDEFAULT_LOCALE_ID} from './i18n/localization';
export {Writable as ɵWritable} from './interface/type';
export {ComponentFactory as ɵComponentFactory} from './linker/component_factory';
export {
  clearResolutionOfComponentResourcesQueue as ɵclearResolutionOfComponentResourcesQueue,
  isComponentDefPendingResolution as ɵisComponentDefPendingResolution,
  resolveComponentResources as ɵresolveComponentResources,
  restoreComponentResolutionQueue as ɵrestoreComponentResolutionQueue,
} from './metadata/resource_loading';
export {PendingTasksInternal as ɵPendingTasksInternal} from './pending_tasks_internal';
export {ENABLE_ROOT_COMPONENT_BOOTSTRAP as ɵENABLE_ROOT_COMPONENT_BOOTSTRAP} from './platform/bootstrap';
export {ReflectionCapabilities as ɵReflectionCapabilities} from './reflection/reflection_capabilities';
export {AnimationRendererType as ɵAnimationRendererType} from './render/api';
export {
  InjectorProfilerContext as ɵInjectorProfilerContext,
  ProviderRecord as ɵProviderRecord,
  setInjectorProfilerContext as ɵsetInjectorProfilerContext,
} from './render3/debug/injector_profiler';
export {
  allowSanitizationBypassAndThrow as ɵallowSanitizationBypassAndThrow,
  BypassType as ɵBypassType,
  getSanitizationBypassType as ɵgetSanitizationBypassType,
  SafeHtml as ɵSafeHtml,
  SafeResourceUrl as ɵSafeResourceUrl,
  SafeScript as ɵSafeScript,
  SafeStyle as ɵSafeStyle,
  SafeUrl as ɵSafeUrl,
  SafeValue as ɵSafeValue,
  unwrapSafeValue as ɵunwrapSafeValue,
} from './sanitization/bypass';
export {_sanitizeHtml as ɵ_sanitizeHtml} from './sanitization/html_sanitizer';
export {_sanitizeUrl as ɵ_sanitizeUrl} from './sanitization/url_sanitizer';
export {
  TESTABILITY as ɵTESTABILITY,
  TESTABILITY_GETTER as ɵTESTABILITY_GETTER,
} from './testability/testability';
export {booleanAttribute, numberAttribute} from './util/coercion';
export {devModeEqual as ɵdevModeEqual} from './util/comparison';
export {global as ɵglobal} from './util/global';
export {isPromise as ɵisPromise, isSubscribable as ɵisSubscribable} from './util/lang';
export {performanceMarkFeature as ɵperformanceMarkFeature} from './util/performance';
export {stringify as ɵstringify, truncateMiddle as ɵtruncateMiddle} from './util/stringify';
export {NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR as ɵNOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR} from './view/provider_flags';
export {type InputSignalNode as ɵInputSignalNode} from './authoring/input/input_signal_node';
export {
  startMeasuring as ɵstartMeasuring,
  stopMeasuring as ɵstopMeasuring,
  PERFORMANCE_MARK_PREFIX as ɵPERFORMANCE_MARK_PREFIX,
  enableProfiling as ɵenableProfiling,
  disableProfiling as ɵdisableProfiling,
} from './profiler';
export {
  ResourceImpl as ɵResourceImpl,
  encapsulateResourceError as ɵencapsulateResourceError,
} from './resource/resource';
export {getClosestComponentName as ɵgetClosestComponentName} from './internal/get_closest_component_name';
export {getComponentDef as ɵgetComponentDef} from './render3/def_getters';
export {DEHYDRATED_BLOCK_REGISTRY as ɵDEHYDRATED_BLOCK_REGISTRY} from './defer/registry';
export {TimerScheduler as ɵTimerScheduler} from './defer/timer_scheduler';
export {ɵassertType} from './type_checking';
export {
  ElementRegistry as ɵElementRegistry,
  AnimationRemovalRegistry as ɵAnimationRemovalRegistry,
} from './animation/element_removal_registry';
export {ANIMATIONS_DISABLED as ɵANIMATIONS_DISABLED} from './animation/interfaces';
