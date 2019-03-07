/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {ALLOW_MULTIPLE_PLATFORMS as ɵALLOW_MULTIPLE_PLATFORMS} from './application_ref';
export {APP_ID_RANDOM_PROVIDER as ɵAPP_ID_RANDOM_PROVIDER} from './application_tokens';
export {defaultIterableDiffers as ɵdefaultIterableDiffers, defaultKeyValueDiffers as ɵdefaultKeyValueDiffers} from './change_detection/change_detection';
export {devModeEqual as ɵdevModeEqual} from './change_detection/change_detection_util';
export {isListLikeIterable as ɵisListLikeIterable} from './change_detection/change_detection_util';
export {ChangeDetectorStatus as ɵChangeDetectorStatus, isDefaultChangeDetectionStrategy as ɵisDefaultChangeDetectionStrategy} from './change_detection/constants';
export {Console as ɵConsole} from './console';
export {inject as ɵinject, setCurrentInjector as ɵsetCurrentInjector} from './di/injector_compatibility';
export {InjectableDef as ɵInjectableDef, InjectorDef as ɵInjectorDef, getInjectableDef as ɵgetInjectableDef} from './di/interface/defs';
export {APP_ROOT as ɵAPP_ROOT} from './di/scope';
export {ivyEnabled as ɵivyEnabled} from './ivy_switch';
export {ComponentFactory as ɵComponentFactory} from './linker/component_factory';
export {CodegenComponentFactoryResolver as ɵCodegenComponentFactoryResolver} from './linker/component_factory_resolver';
export {clearResolutionOfComponentResourcesQueue as ɵclearResolutionOfComponentResourcesQueue, resolveComponentResources as ɵresolveComponentResources} from './metadata/resource_loading';
export {ReflectionCapabilities as ɵReflectionCapabilities} from './reflection/reflection_capabilities';
export {GetterFn as ɵGetterFn, MethodFn as ɵMethodFn, SetterFn as ɵSetterFn} from './reflection/types';
export {DirectRenderer as ɵDirectRenderer, RenderDebugInfo as ɵRenderDebugInfo} from './render/api';
export {_sanitizeHtml as ɵ_sanitizeHtml} from './sanitization/html_sanitizer';
export {_sanitizeStyle as ɵ_sanitizeStyle} from './sanitization/style_sanitizer';
export {_sanitizeUrl as ɵ_sanitizeUrl} from './sanitization/url_sanitizer';
export {global as ɵglobal} from './util/global';
export {looseIdentical as ɵlooseIdentical,} from './util/comparison';
export {stringify as ɵstringify} from './util/stringify';
export {makeDecorator as ɵmakeDecorator} from './util/decorators';
export {isObservable as ɵisObservable, isPromise as ɵisPromise} from './util/lang';
export {clearOverrides as ɵclearOverrides, initServicesIfNeeded as ɵinitServicesIfNeeded, overrideComponentView as ɵoverrideComponentView, overrideProvider as ɵoverrideProvider} from './view/index';
export {NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR as ɵNOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR} from './view/provider';

/** Temporary exports until we create the i18n package */
export {Time as ɵTime, getLocaleDayNames as ɵgetLocaleDayNames, NumberFormatStyle as ɵNumberFormatStyle, WeekDay as ɵWeekDay, NumberSymbol as ɵNumberSymbol, FormatWidth as ɵFormatWidth, TranslationWidth as ɵTranslationWidth, FormStyle as ɵFormStyle, Plural as ɵPlural, findLocaleData as ɵfindLocaleData, getCurrencySymbol as ɵgetCurrencySymbol, getLocaleCurrencyName as ɵgetLocaleCurrencyName, getLocaleCurrencySymbol as ɵgetLocaleCurrencySymbol, getLocaleDateFormat as ɵgetLocaleDateFormat, getLocaleDateTimeFormat as ɵgetLocaleDateTimeFormat, getLocaleDayPeriods as ɵgetLocaleDayPeriods, getLocaleEraNames as ɵgetLocaleEraNames, getLocaleExtraDayPeriodRules as ɵgetLocaleExtraDayPeriodRules, getLocaleExtraDayPeriods as ɵgetLocaleExtraDayPeriods, getLocaleFirstDayOfWeek as ɵgetLocaleFirstDayOfWeek, getLocaleId as ɵgetLocaleId, getLocaleMonthNames as ɵgetLocaleMonthNames, getLocaleNumberFormat as ɵgetLocaleNumberFormat, getLocaleNumberSymbol as ɵgetLocaleNumberSymbol, getLocalePluralCase as ɵgetLocalePluralCase, getLocaleTimeFormat as ɵgetLocaleTimeFormat, getLocaleWeekEndRange as ɵgetLocaleWeekEndRange, getNumberOfCurrencyDigits as ɵgetNumberOfCurrencyDigits} from './i18n/locale_data_api';
export {LOCALE_DATA as ɵLOCALE_DATA, CurrencyIndex as ɵCurrencyIndex, ExtraLocaleDataIndex as ɵExtraLocaleDataIndex, LocaleDataIndex as ɵLocaleDataIndex, registerLocaleData as ɵregisterLocaleData} from './i18n/locale_data';
export {getPluralCase as ɵgetPluralCase} from './i18n/localization';
