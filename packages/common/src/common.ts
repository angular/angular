/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
export {PlatformNavigation} from './navigation/platform_navigation';
export {
  Plural,
  NumberFormatStyle,
  FormStyle,
  Time,
  TranslationWidth,
  FormatWidth,
  NumberSymbol,
  WeekDay,
  getNumberOfCurrencyDigits,
  getCurrencySymbol,
  getLocaleDayPeriods,
  getLocaleDayNames,
  getLocaleMonthNames,
  getLocaleId,
  getLocaleEraNames,
  getLocaleWeekEndRange,
  getLocaleFirstDayOfWeek,
  getLocaleDateFormat,
  getLocaleDateTimeFormat,
  getLocaleExtraDayPeriodRules,
  getLocaleExtraDayPeriods,
  getLocalePluralCase,
  getLocaleTimeFormat,
  getLocaleNumberSymbol,
  getLocaleNumberFormat,
  getLocaleCurrencyCode,
  getLocaleCurrencyName,
  getLocaleCurrencySymbol,
  getLocaleDirection,
} from './i18n/locale_data_api';
export {parseCookieValue as ɵparseCookieValue} from './cookie';
export {CommonModule} from './common_module';
export {
  NgClass,
  NgFor,
  NgForOf,
  NgForOfContext,
  NgIf,
  NgIfContext,
  NgPlural,
  NgPluralCase,
  NgStyle,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
  NgTemplateOutlet,
  NgComponentOutlet,
} from './directives/index';
export {
  AsyncPipe,
  DatePipe,
  DatePipeConfig,
  DATE_PIPE_DEFAULT_TIMEZONE,
  DATE_PIPE_DEFAULT_OPTIONS,
  I18nPluralPipe,
  I18nSelectPipe,
  JsonPipe,
  LowerCasePipe,
  CurrencyPipe,
  DecimalPipe,
  PercentPipe,
  SlicePipe,
  UpperCasePipe,
  TitleCasePipe,
  KeyValuePipe,
  KeyValue,
} from './pipes/index';
export {
  PLATFORM_BROWSER_ID as ɵPLATFORM_BROWSER_ID,
  PLATFORM_SERVER_ID as ɵPLATFORM_SERVER_ID,
  isPlatformBrowser,
  isPlatformServer,
} from './platform_id';
export {VERSION} from './version';
export {ViewportScroller, NullViewportScroller as ɵNullViewportScroller} from './viewport_scroller';
export {XhrFactory} from './xhr';
export {
  IMAGE_CONFIG,
  ImageConfig,
  IMAGE_LOADER,
  ImageLoader,
  ImageLoaderConfig,
  NgOptimizedImage,
  ImagePlaceholderConfig,
  PRECONNECT_CHECK_BLOCKLIST,
  provideCloudflareLoader,
  provideCloudinaryLoader,
  provideImageKitLoader,
  provideImgixLoader,
  provideNetlifyLoader,
} from './directives/ng_optimized_image';
export {normalizeQueryParams as ɵnormalizeQueryParams} from './location/util';

// Backwards compatibility re-export.
export {DOCUMENT} from '@angular/core';
