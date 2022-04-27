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
export * from './private_export.js';
export * from './location/index.js';
export {formatDate} from './i18n/format_date.js';
export {formatCurrency, formatNumber, formatPercent} from './i18n/format_number.js';
export {NgLocaleLocalization, NgLocalization} from './i18n/localization.js';
export {registerLocaleData} from './i18n/locale_data.js';
export {Plural, NumberFormatStyle, FormStyle, Time, TranslationWidth, FormatWidth, NumberSymbol, WeekDay, getNumberOfCurrencyDigits, getCurrencySymbol, getLocaleDayPeriods, getLocaleDayNames, getLocaleMonthNames, getLocaleId, getLocaleEraNames, getLocaleWeekEndRange, getLocaleFirstDayOfWeek, getLocaleDateFormat, getLocaleDateTimeFormat, getLocaleExtraDayPeriodRules, getLocaleExtraDayPeriods, getLocalePluralCase, getLocaleTimeFormat, getLocaleNumberSymbol, getLocaleNumberFormat, getLocaleCurrencyCode, getLocaleCurrencyName, getLocaleCurrencySymbol, getLocaleDirection} from './i18n/locale_data_api.js';
export {parseCookieValue as ɵparseCookieValue} from './cookie.js';
export {CommonModule} from './common_module.js';
export {NgClass, NgForOf, NgForOfContext, NgIf, NgIfContext, NgPlural, NgPluralCase, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet, NgComponentOutlet} from './directives/index.js';
export {DOCUMENT} from './dom_tokens.js';
export {AsyncPipe, DatePipe, DATE_PIPE_DEFAULT_TIMEZONE, I18nPluralPipe, I18nSelectPipe, JsonPipe, LowerCasePipe, CurrencyPipe, DecimalPipe, PercentPipe, SlicePipe, UpperCasePipe, TitleCasePipe, KeyValuePipe, KeyValue} from './pipes/index.js';
export {PLATFORM_BROWSER_ID as ɵPLATFORM_BROWSER_ID, PLATFORM_SERVER_ID as ɵPLATFORM_SERVER_ID, PLATFORM_WORKER_APP_ID as ɵPLATFORM_WORKER_APP_ID, PLATFORM_WORKER_UI_ID as ɵPLATFORM_WORKER_UI_ID, isPlatformBrowser, isPlatformServer, isPlatformWorkerApp, isPlatformWorkerUi} from './platform_id.js';
export {VERSION} from './version.js';
export {ViewportScroller, NullViewportScroller as ɵNullViewportScroller} from './viewport_scroller.js';
export {XhrFactory} from './xhr.js';
