/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '../di/injection_token';
import {inject} from '../di/injector_compatibility';
import {InjectFlags} from '../di/interface/injector';

import {DEFAULT_LOCALE_ID, USD_CURRENCY_CODE} from './localization';

declare const $localize: {locale?: string};

/**
 * Work out the locale from the potential global properties.
 *
 * * Closure Compiler: use `goog.LOCALE`.
 * * Ivy enabled: use `$localize.locale`
 */
export function getGlobalLocale(): string {
  if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode &&
      typeof goog !== 'undefined' && goog.LOCALE !== 'en') {
    // * The default `goog.LOCALE` value is `en`, while Angular used `en-US`.
    // * In order to preserve backwards compatibility, we use Angular default value over
    //   Closure Compiler's one.
    return goog.LOCALE;
  } else {
    // KEEP `typeof $localize !== 'undefined' && $localize.locale` IN SYNC WITH THE LOCALIZE
    // COMPILE-TIME INLINER.
    //
    // * During compile time inlining of translations the expression will be replaced
    //   with a string literal that is the current locale. Other forms of this expression are not
    //   guaranteed to be replaced.
    //
    // * During runtime translation evaluation, the developer is required to set `$localize.locale`
    //   if required, or just to provide their own `LOCALE_ID` provider.
    return (typeof $localize !== 'undefined' && $localize.locale) || DEFAULT_LOCALE_ID;
  }
}

/**
 * Provide this token to set the locale of your application.
 * It is used for i18n extraction, by i18n pipes (DatePipe, I18nPluralPipe, CurrencyPipe,
 * DecimalPipe and PercentPipe) and by ICU expressions.
 *
 * See the [i18n guide](guide/i18n-common-locale-id) for more information.
 *
 * @usageNotes
 * ### Example
 *
 * ```typescript
 * import { LOCALE_ID } from '@angular/core';
 * import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
 * import { AppModule } from './app/app.module';
 *
 * platformBrowserDynamic().bootstrapModule(AppModule, {
 *   providers: [{provide: LOCALE_ID, useValue: 'en-US' }]
 * });
 * ```
 *
 * @publicApi
 */
export const LOCALE_ID: InjectionToken<string> = new InjectionToken('LocaleId', {
  providedIn: 'root',
  factory: () =>
      inject(LOCALE_ID, InjectFlags.Optional | InjectFlags.SkipSelf) || getGlobalLocale(),
});

/**
 * Provide this token to set the default currency code your application uses for
 * CurrencyPipe when there is no currency code passed into it. This is only used by
 * CurrencyPipe and has no relation to locale currency. Defaults to USD if not configured.
 *
 * See the [i18n guide](guide/i18n-common-locale-id) for more information.
 *
 * <div class="alert is-helpful">
 *
 * **Deprecation notice:**
 *
 * The default currency code is currently always `USD` but this is deprecated from v9.
 *
 * **In v10 the default currency code will be taken from the current locale.**
 *
 * If you need the previous behavior then set it by creating a `DEFAULT_CURRENCY_CODE` provider in
 * your application `NgModule`:
 *
 * ```ts
 * {provide: DEFAULT_CURRENCY_CODE, useValue: 'USD'}
 * ```
 *
 * </div>
 *
 * @usageNotes
 * ### Example
 *
 * ```typescript
 * import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
 * import { AppModule } from './app/app.module';
 *
 * platformBrowserDynamic().bootstrapModule(AppModule, {
 *   providers: [{provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR' }]
 * });
 * ```
 *
 * @publicApi
 */
export const DEFAULT_CURRENCY_CODE = new InjectionToken<string>('DefaultCurrencyCode', {
  providedIn: 'root',
  factory: () => USD_CURRENCY_CODE,
});

/**
 * Use this token at bootstrap to provide the content of your translation file (`xtb`,
 * `xlf` or `xlf2`) when you want to translate your application in another language.
 *
 * See the [i18n guide](guide/i18n-common-merge) for more information.
 *
 * @usageNotes
 * ### Example
 *
 * ```typescript
 * import { TRANSLATIONS } from '@angular/core';
 * import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
 * import { AppModule } from './app/app.module';
 *
 * // content of your translation file
 * const translations = '....';
 *
 * platformBrowserDynamic().bootstrapModule(AppModule, {
 *   providers: [{provide: TRANSLATIONS, useValue: translations }]
 * });
 * ```
 *
 * @publicApi
 */
export const TRANSLATIONS = new InjectionToken<string>('Translations');

/**
 * Provide this token at bootstrap to set the format of your {@link TRANSLATIONS}: `xtb`,
 * `xlf` or `xlf2`.
 *
 * See the [i18n guide](guide/i18n-common-merge) for more information.
 *
 * @usageNotes
 * ### Example
 *
 * ```typescript
 * import { TRANSLATIONS_FORMAT } from '@angular/core';
 * import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
 * import { AppModule } from './app/app.module';
 *
 * platformBrowserDynamic().bootstrapModule(AppModule, {
 *   providers: [{provide: TRANSLATIONS_FORMAT, useValue: 'xlf' }]
 * });
 * ```
 *
 * @publicApi
 */
export const TRANSLATIONS_FORMAT = new InjectionToken<string>('TranslationsFormat');

/**
 * Use this enum at bootstrap as an option of `bootstrapModule` to define the strategy
 * that the compiler should use in case of missing translations:
 * - Error: throw if you have missing translations.
 * - Warning (default): show a warning in the console and/or shell.
 * - Ignore: do nothing.
 *
 * See the [i18n guide](guide/i18n-common-merge#report-missing-translations) for more information.
 *
 * @usageNotes
 * ### Example
 * ```typescript
 * import { MissingTranslationStrategy } from '@angular/core';
 * import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
 * import { AppModule } from './app/app.module';
 *
 * platformBrowserDynamic().bootstrapModule(AppModule, {
 *   missingTranslation: MissingTranslationStrategy.Error
 * });
 * ```
 *
 * @publicApi
 */
export enum MissingTranslationStrategy {
  Error = 0,
  Warning = 1,
  Ignore = 2,
}
