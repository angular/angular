/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {setAlternateWeakRefImpl as ɵsetAlternateWeakRefImpl} from '../primitives/signals';
export {
  detectChangesInViewIfRequired as ɵdetectChangesInViewIfRequired,
  whenStable as ɵwhenStable,
} from './application/application_ref';
export {
  IMAGE_CONFIG as ɵIMAGE_CONFIG,
  IMAGE_CONFIG_DEFAULTS as ɵIMAGE_CONFIG_DEFAULTS,
  ImageConfig as ɵImageConfig,
} from './application/application_tokens';
export {internalCreateApplication as ɵinternalCreateApplication} from './application/create_application';
export {
  defaultIterableDiffers as ɵdefaultIterableDiffers,
  defaultKeyValueDiffers as ɵdefaultKeyValueDiffers,
} from './change_detection/change_detection';
export {internalProvideZoneChangeDetection as ɵinternalProvideZoneChangeDetection} from './change_detection/scheduling/ng_zone_scheduling';
export {ChangeDetectionSchedulerImpl as ɵChangeDetectionSchedulerImpl} from './change_detection/scheduling/zoneless_scheduling_impl';
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
export {
  renderDeferBlockState as ɵrenderDeferBlockState,
  triggerResourceLoading as ɵtriggerResourceLoading,
} from './defer/instructions';
export {
  DeferBlockBehavior as ɵDeferBlockBehavior,
  DeferBlockConfig as ɵDeferBlockConfig,
  DeferBlockState as ɵDeferBlockState,
} from './defer/interfaces';
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
} from './hydration/api';
export {withEventReplay as ɵwithEventReplay} from './hydration/event_replay';
export {IS_HYDRATION_DOM_REUSE_ENABLED as ɵIS_HYDRATION_DOM_REUSE_ENABLED} from './hydration/tokens';
export {
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
export {
  usePluralIntlImplementation as ɵusePluralIntlImplementation,
  usePluralLegacyImplementation as ɵusePluralLegacyImplementation,
} from './i18n/implementation';
export {DEFAULT_LOCALE_ID as ɵDEFAULT_LOCALE_ID} from './i18n/localization';
export {Writable as ɵWritable} from './interface/type';
export {ComponentFactory as ɵComponentFactory} from './linker/component_factory';
export {
  clearResolutionOfComponentResourcesQueue as ɵclearResolutionOfComponentResourcesQueue,
  isComponentDefPendingResolution as ɵisComponentDefPendingResolution,
  resolveComponentResources as ɵresolveComponentResources,
  restoreComponentResolutionQueue as ɵrestoreComponentResolutionQueue,
} from './metadata/resource_loading';
export {PendingTasks as ɵPendingTasks} from './pending_tasks';
export {ALLOW_MULTIPLE_PLATFORMS as ɵALLOW_MULTIPLE_PLATFORMS} from './platform/platform';
export {ReflectionCapabilities as ɵReflectionCapabilities} from './reflection/reflection_capabilities';
export {AnimationRendererType as ɵAnimationRendererType} from './render/api';
export {
  InjectorProfilerContext as ɵInjectorProfilerContext,
  ProviderRecord as ɵProviderRecord,
  setInjectorProfilerContext as ɵsetInjectorProfilerContext,
} from './render3/debug/injector_profiler';
export {queueStateUpdate as ɵqueueStateUpdate} from './render3/queue_state_update';
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
