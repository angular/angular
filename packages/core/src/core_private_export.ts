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
  type NavigationDestination as ɵNavigationDestination,
  type NavigationHistoryEntry as ɵNavigationHistoryEntry,
  type NavigationInterceptOptions as ɵNavigationInterceptOptions,
  type NavigationNavigateOptions as ɵNavigationNavigateOptions,
  type NavigationOptions as ɵNavigationOptions,
  type NavigationReloadOptions as ɵNavigationReloadOptions,
  type NavigationResult as ɵNavigationResult,
  type NavigationTransition as ɵNavigationTransition,
  type NavigationTypeString as ɵNavigationTypeString,
  type NavigationUpdateCurrentEntryOptions as ɵNavigationUpdateCurrentEntryOptions,
} from '../primitives/dom-navigation';
export {maybeUnwrapDefaultExport as ɵmaybeUnwrapDefaultExport} from './util/default_export';

export {setAlternateWeakRefImpl as ɵsetAlternateWeakRefImpl} from '../primitives/signals';
export {ANIMATIONS_DISABLED as ɵANIMATIONS_DISABLED} from './animation/interfaces';
export {allLeavingAnimations as ɵallLeavingAnimations} from './animation/longest_animation';
export {
  IMAGE_CONFIG as ɵIMAGE_CONFIG,
  IMAGE_CONFIG_DEFAULTS as ɵIMAGE_CONFIG_DEFAULTS,
  ImageConfig as ɵImageConfig,
} from './application/application_tokens';
export {internalCreateApplication as ɵinternalCreateApplication} from './application/create_application';
export {
  TracingAction as ɵTracingAction,
  TracingService as ɵTracingService,
  TracingSnapshot as ɵTracingSnapshot,
} from './application/tracing';
export {type InputSignalNode as ɵInputSignalNode} from './authoring/input/input_signal_node';
export {
  defaultIterableDiffers as ɵdefaultIterableDiffers,
  defaultKeyValueDiffers as ɵdefaultKeyValueDiffers,
} from './change_detection/change_detection';
export {
  internalProvideZoneChangeDetection as ɵinternalProvideZoneChangeDetection,
  PROVIDED_NG_ZONE as ɵPROVIDED_NG_ZONE,
} from './change_detection/scheduling/ng_zone_scheduling';
export {
  ChangeDetectionScheduler as ɵChangeDetectionScheduler,
  NotificationSource as ɵNotificationSource,
  PROVIDED_ZONELESS as ɵPROVIDED_ZONELESS,
  ZONELESS_ENABLED as ɵZONELESS_ENABLED,
} from './change_detection/scheduling/zoneless_scheduling';
export {provideZonelessChangeDetectionInternal as ɵprovideZonelessChangeDetectionInternal} from './change_detection/scheduling/zoneless_scheduling_impl';
export {Console as ɵConsole} from './console';
export {
  DeferBlockDetails as ɵDeferBlockDetails,
  getDeferBlocks as ɵgetDeferBlocks,
} from './defer/discovery';
export {
  DeferBlockBehavior as ɵDeferBlockBehavior,
  DeferBlockConfig as ɵDeferBlockConfig,
  DeferBlockState as ɵDeferBlockState,
} from './defer/interfaces';
export {DEHYDRATED_BLOCK_REGISTRY as ɵDEHYDRATED_BLOCK_REGISTRY} from './defer/registry';
export {renderDeferBlockState as ɵrenderDeferBlockState} from './defer/rendering';
export {TimerScheduler as ɵTimerScheduler} from './defer/timer_scheduler';
export {triggerResourceLoading as ɵtriggerResourceLoading} from './defer/triggering';
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
export {INTERNAL_APPLICATION_ERROR_HANDLER as ɵINTERNAL_APPLICATION_ERROR_HANDLER} from './error_handler';
export {
  formatRuntimeError as ɵformatRuntimeError,
  RuntimeError as ɵRuntimeError,
  RuntimeErrorCode as ɵRuntimeErrorCode,
} from './errors';
export {JSACTION_EVENT_CONTRACT as ɵJSACTION_EVENT_CONTRACT} from './event_delegation_utils';
export {annotateForHydration as ɵannotateForHydration} from './hydration/annotate';
export {
  CLIENT_RENDER_MODE_FLAG as ɵCLIENT_RENDER_MODE_FLAG,
  withDomHydration as ɵwithDomHydration,
  withI18nSupport as ɵwithI18nSupport,
  withIncrementalHydration as ɵwithIncrementalHydration,
} from './hydration/api';
export {CACHE_ACTIVE as ɵCACHE_ACTIVE} from './hydration/cache';
export {withEventReplay as ɵwithEventReplay} from './hydration/event_replay';
export {
  EVENT_REPLAY_QUEUE as ɵEVENT_REPLAY_QUEUE,
  IS_ENABLED_BLOCKING_INITIAL_NAVIGATION as ɵIS_ENABLED_BLOCKING_INITIAL_NAVIGATION,
  IS_HYDRATION_DOM_REUSE_ENABLED as ɵIS_HYDRATION_DOM_REUSE_ENABLED,
  IS_INCREMENTAL_HYDRATION_ENABLED as ɵIS_INCREMENTAL_HYDRATION_ENABLED,
  JSACTION_BLOCK_ELEMENT_MAP as ɵJSACTION_BLOCK_ELEMENT_MAP,
} from './hydration/tokens';
export {
  HydratedNode as ɵHydratedNode,
  HydrationInfo as ɵHydrationInfo,
  HydrationStatus as ɵHydrationStatus,
  readHydrationInfo as ɵreadHydrationInfo,
  resetIncrementalHydrationEnabledWarnedForTests as ɵresetIncrementalHydrationEnabledWarnedForTests,
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
export {getClosestComponentName as ɵgetClosestComponentName} from './internal/get_closest_component_name';
export {
  clearResolutionOfComponentResourcesQueue as ɵclearResolutionOfComponentResourcesQueue,
  isComponentDefPendingResolution as ɵisComponentDefPendingResolution,
  resolveComponentResources as ɵresolveComponentResources,
  restoreComponentResolutionQueue as ɵrestoreComponentResolutionQueue,
} from './metadata/resource_loading';
export {PendingTasksInternal as ɵPendingTasksInternal} from './pending_tasks_internal';
export {ENABLE_ROOT_COMPONENT_BOOTSTRAP as ɵENABLE_ROOT_COMPONENT_BOOTSTRAP} from './platform/bootstrap';
export {
  disableProfiling as ɵdisableProfiling,
  enableProfiling as ɵenableProfiling,
  PERFORMANCE_MARK_PREFIX as ɵPERFORMANCE_MARK_PREFIX,
  startMeasuring as ɵstartMeasuring,
  stopMeasuring as ɵstopMeasuring,
} from './profiler';
export {ReflectionCapabilities as ɵReflectionCapabilities} from './reflection/reflection_capabilities';
export {AnimationRendererType as ɵAnimationRendererType} from './render/api';
export {
  InjectorProfilerContext as ɵInjectorProfilerContext,
  ProviderRecord as ɵProviderRecord,
  setInjectorProfilerContext as ɵsetInjectorProfilerContext,
} from './render3/debug/injector_profiler';
export {getComponentDef as ɵgetComponentDef} from './render3/def_getters';
export {getDocument as ɵgetDocument} from './render3/interfaces/document';
export {
  SHARED_STYLES_HOST as ɵSHARED_STYLES_HOST,
  SharedStylesHost as ɵSharedStylesHost,
} from './render3/interfaces/shared_styles_host';
export {
  chain as ɵchain,
  encapsulateResourceError as ɵencapsulateResourceError,
  ResourceImpl as ɵResourceImpl,
} from './resource/resource';
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
  USE_PENDING_TASKS as ɵUSE_PENDING_TASKS,
} from './testability/testability';
export {ɵassertType} from './type_checking';
export {booleanAttribute, numberAttribute} from './util/coercion';
export {devModeEqual as ɵdevModeEqual} from './util/comparison';
export {global as ɵglobal} from './util/global';
export {isPromise as ɵisPromise, isSubscribable as ɵisSubscribable} from './util/lang';
export {performanceMarkFeature as ɵperformanceMarkFeature} from './util/performance';
export {promiseWithResolvers as ɵpromiseWithResolvers} from './util/promise_with_resolvers';
export {stringify as ɵstringify, truncateMiddle as ɵtruncateMiddle} from './util/stringify';
export {NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR as ɵNOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR} from './view/provider_flags';
