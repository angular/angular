/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @module
 * @description
 * Entry point for all public APIs of the common package.
 */
export * from './private_export';
export * from './location/index';
export {formatDate} from './i18n/format_date';
export {formatCurrency, formatNumber, formatPercent} from './i18n/format_number';
export {NgLocaleLocalization, NgLocalization} from './i18n/localization';
export {registerLocaleData} from './i18n/locale_data';
export {Plural, NumberFormatStyle, FormStyle, Time, TranslationWidth, FormatWidth, NumberSymbol, WeekDay, getNumberOfCurrencyDigits, getCurrencySymbol, getLocaleDayPeriods, getLocaleDayNames, getLocaleMonthNames, getLocaleId, getLocaleEraNames, getLocaleWeekEndRange, getLocaleFirstDayOfWeek, getLocaleDateFormat, getLocaleDateTimeFormat, getLocaleExtraDayPeriodRules, getLocaleExtraDayPeriods, getLocalePluralCase, getLocaleTimeFormat, getLocaleNumberSymbol, getLocaleNumberFormat, getLocaleCurrencyCode, getLocaleCurrencyName, getLocaleCurrencySymbol, getLocaleDirection} from './i18n/locale_data_api';
export {parseCookieValue as ɵparseCookieValue} from './cookie';
export {CommonModule} from './common_module';
export {NgClass, NgForOf, NgForOfContext, NgIf, NgIfContext, NgPlural, NgPluralCase, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet, NgComponentOutlet} from './directives/index';
export {DOCUMENT} from './dom_tokens';
export {AsyncPipe, DatePipe, I18nPluralPipe, I18nSelectPipe, JsonPipe, LowerCasePipe, CurrencyPipe, DecimalPipe, PercentPipe, SlicePipe, UpperCasePipe, TitleCasePipe, KeyValuePipe, KeyValue} from './pipes/index';
export {PLATFORM_BROWSER_ID as ɵPLATFORM_BROWSER_ID, PLATFORM_SERVER_ID as ɵPLATFORM_SERVER_ID, PLATFORM_WORKER_APP_ID as ɵPLATFORM_WORKER_APP_ID, PLATFORM_WORKER_UI_ID as ɵPLATFORM_WORKER_UI_ID, isPlatformBrowser, isPlatformServer, isPlatformWorkerApp, isPlatformWorkerUi} from './platform_id';
export {VERSION} from './version';
export {ViewportScroller, NullViewportScroller as ɵNullViewportScroller} from './viewport_scroller';
export {XhrFactory} from './xhr';
