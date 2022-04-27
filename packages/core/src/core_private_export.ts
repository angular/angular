/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {ALLOW_MULTIPLE_PLATFORMS as ɵALLOW_MULTIPLE_PLATFORMS, bootstrapApplication as ɵbootstrapApplication} from './application_ref.js';
export {APP_ID_RANDOM_PROVIDER as ɵAPP_ID_RANDOM_PROVIDER} from './application_tokens.js';
export {defaultIterableDiffers as ɵdefaultIterableDiffers, defaultKeyValueDiffers as ɵdefaultKeyValueDiffers} from './change_detection/change_detection.js';
export {ChangeDetectorStatus as ɵChangeDetectorStatus, isDefaultChangeDetectionStrategy as ɵisDefaultChangeDetectionStrategy} from './change_detection/constants.js';
export {Console as ɵConsole} from './console.js';
export {getDebugNodeR2 as ɵgetDebugNodeR2} from './debug/debug_node.js';
export {setCurrentInjector as ɵsetCurrentInjector} from './di/injector_compatibility.js';
export {getInjectableDef as ɵgetInjectableDef, ɵɵInjectableDeclaration, ɵɵInjectorDef} from './di/interface/defs.js';
export {INJECTOR_SCOPE as ɵINJECTOR_SCOPE} from './di/scope.js';
export {RuntimeError as ɵRuntimeError} from './errors.js';
export {CurrencyIndex as ɵCurrencyIndex, ExtraLocaleDataIndex as ɵExtraLocaleDataIndex, findLocaleData as ɵfindLocaleData, getLocaleCurrencyCode as ɵgetLocaleCurrencyCode, getLocalePluralCase as ɵgetLocalePluralCase, LocaleDataIndex as ɵLocaleDataIndex, registerLocaleData as ɵregisterLocaleData, unregisterAllLocaleData as ɵunregisterLocaleData} from './i18n/locale_data_api.js';
export {DEFAULT_LOCALE_ID as ɵDEFAULT_LOCALE_ID} from './i18n/localization.js';
export {ComponentFactory as ɵComponentFactory} from './linker/component_factory.js';
export {clearResolutionOfComponentResourcesQueue as ɵclearResolutionOfComponentResourcesQueue, resolveComponentResources as ɵresolveComponentResources} from './metadata/resource_loading.js';
export {ReflectionCapabilities as ɵReflectionCapabilities} from './reflection/reflection_capabilities.js';
export {allowSanitizationBypassAndThrow as ɵallowSanitizationBypassAndThrow, BypassType as ɵBypassType, getSanitizationBypassType as ɵgetSanitizationBypassType, SafeHtml as ɵSafeHtml, SafeResourceUrl as ɵSafeResourceUrl, SafeScript as ɵSafeScript, SafeStyle as ɵSafeStyle, SafeUrl as ɵSafeUrl, SafeValue as ɵSafeValue, unwrapSafeValue as ɵunwrapSafeValue} from './sanitization/bypass.js';
export {_sanitizeHtml as ɵ_sanitizeHtml} from './sanitization/html_sanitizer.js';
export {_sanitizeUrl as ɵ_sanitizeUrl} from './sanitization/url_sanitizer.js';
export {coerceToBoolean as ɵcoerceToBoolean} from './util/coercion.js';
export {devModeEqual as ɵdevModeEqual} from './util/comparison.js';
export {makeDecorator as ɵmakeDecorator} from './util/decorators.js';
export {global as ɵglobal} from './util/global.js';
export {isListLikeIterable as ɵisListLikeIterable} from './util/iterable.js';
export {isObservable as ɵisObservable, isPromise as ɵisPromise, isSubscribable as ɵisSubscribable} from './util/lang.js';
export {stringify as ɵstringify} from './util/stringify.js';
export {NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR as ɵNOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR} from './view/provider_flags.js';

// TODO(alxhub): allows tests to compile, can be removed when tests have been updated.
export const ɵivyEnabled = true;
