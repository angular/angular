/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {ALLOW_MULTIPLE_PLATFORMS as ɵALLOW_MULTIPLE_PLATFORMS, internalCreateApplication as ɵinternalCreateApplication} from './application_ref';
export {APP_ID_RANDOM_PROVIDER as ɵAPP_ID_RANDOM_PROVIDER} from './application_tokens';
export {defaultIterableDiffers as ɵdefaultIterableDiffers, defaultKeyValueDiffers as ɵdefaultKeyValueDiffers} from './change_detection/change_detection';
export {ChangeDetectorStatus as ɵChangeDetectorStatus, isDefaultChangeDetectionStrategy as ɵisDefaultChangeDetectionStrategy} from './change_detection/constants';
export {Console as ɵConsole} from './console';
export {getDebugNodeR2 as ɵgetDebugNodeR2} from './debug/debug_node';
export {convertToBitFlags as ɵconvertToBitFlags, setCurrentInjector as ɵsetCurrentInjector} from './di/injector_compatibility';
export {getInjectableDef as ɵgetInjectableDef, ɵɵInjectableDeclaration, ɵɵInjectorDef} from './di/interface/defs';
export {InternalEnvironmentProviders as ɵInternalEnvironmentProviders, isEnvironmentProviders as ɵisEnvironmentProviders} from './di/interface/provider';
export {INJECTOR_SCOPE as ɵINJECTOR_SCOPE} from './di/scope';
export {XSS_SECURITY_URL as ɵXSS_SECURITY_URL} from './error_details_base_url';
export {formatRuntimeError as ɵformatRuntimeError, RuntimeError as ɵRuntimeError} from './errors';
export {CurrencyIndex as ɵCurrencyIndex, ExtraLocaleDataIndex as ɵExtraLocaleDataIndex, findLocaleData as ɵfindLocaleData, getLocaleCurrencyCode as ɵgetLocaleCurrencyCode, getLocalePluralCase as ɵgetLocalePluralCase, LocaleDataIndex as ɵLocaleDataIndex, registerLocaleData as ɵregisterLocaleData, unregisterAllLocaleData as ɵunregisterLocaleData} from './i18n/locale_data_api';
export {DEFAULT_LOCALE_ID as ɵDEFAULT_LOCALE_ID} from './i18n/localization';
export {ComponentFactory as ɵComponentFactory} from './linker/component_factory';
export {clearResolutionOfComponentResourcesQueue as ɵclearResolutionOfComponentResourcesQueue, resolveComponentResources as ɵresolveComponentResources} from './metadata/resource_loading';
export {ReflectionCapabilities as ɵReflectionCapabilities} from './reflection/reflection_capabilities';
export {allowSanitizationBypassAndThrow as ɵallowSanitizationBypassAndThrow, BypassType as ɵBypassType, getSanitizationBypassType as ɵgetSanitizationBypassType, SafeHtml as ɵSafeHtml, SafeResourceUrl as ɵSafeResourceUrl, SafeScript as ɵSafeScript, SafeStyle as ɵSafeStyle, SafeUrl as ɵSafeUrl, SafeValue as ɵSafeValue, unwrapSafeValue as ɵunwrapSafeValue} from './sanitization/bypass';
export {_sanitizeHtml as ɵ_sanitizeHtml} from './sanitization/html_sanitizer';
export {_sanitizeUrl as ɵ_sanitizeUrl} from './sanitization/url_sanitizer';
export {TESTABILITY as ɵTESTABILITY, TESTABILITY_GETTER as ɵTESTABILITY_GETTER} from './testability/testability';
export {escapeTransferStateContent as ɵescapeTransferStateContent, makeStateKey as ɵmakeStateKey, StateKey as ɵStateKey, TransferState as ɵTransferState, unescapeTransferStateContent as ɵunescapeTransferStateContent} from './transfer_state';
export {coerceToBoolean as ɵcoerceToBoolean} from './util/coercion';
export {devModeEqual as ɵdevModeEqual} from './util/comparison';
export {makeDecorator as ɵmakeDecorator} from './util/decorators';
export {global as ɵglobal} from './util/global';
export {isListLikeIterable as ɵisListLikeIterable} from './util/iterable';
export {isObservable as ɵisObservable, isPromise as ɵisPromise, isSubscribable as ɵisSubscribable} from './util/lang';
export {stringify as ɵstringify} from './util/stringify';
export {NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR as ɵNOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR} from './view/provider_flags';

// TODO(alxhub): allows tests to compile, can be removed when tests have been updated.
export const ɵivyEnabled = true;
