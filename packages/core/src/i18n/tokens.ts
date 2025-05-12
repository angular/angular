/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference path="../../../goog.d.ts" />

import {InjectionToken} from '../di/injection_token';
import {inject} from '../di/injector_compatibility';

import {DEFAULT_LOCALE_ID, USD_CURRENCY_CODE} from './localization';

declare const $localize: {locale?: string};

/**
 * Work out the locale from the potential global properties.
 *
 * * Closure Compiler: use `goog.LOCALE`.
 * * Ivy enabled: use `$localize.locale`
 */
export function getGlobalLocale(): string {
  if (
    typeof ngI18nClosureMode !== 'undefined' &&
    ngI18nClosureMode &&
    typeof goog !== 'undefined' &&
    goog.LOCALE !== 'en'
  ) {
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
 * See the [i18n guide](guide/i18n/locale-id) for more information.
 *
 * @usageNotes
 * ### Example
 * In standalone apps:
 * ```ts
 * import { LOCALE_ID, ApplicationConfig } from '@angular/core';
 * import { AppModule } from './app/app.module';
 *
 * const appConfig: ApplicationConfig = {
 *   providers: [{provide: LOCALE_ID, useValue: 'en-US' }]
 * };
 * ```
 *
 * In module based apps:
 * ```ts
 * import { LOCALE_ID } from '@angular/core';
 * import { platformBrowser } from '@angular/platform-browser';
 * import { AppModule } from './app/app.module';
 *
 * platformBrowser().bootstrapModule(AppModule, {
 *   providers: [{provide: LOCALE_ID, useValue: 'en-US' }]
 * });
 * ```
 *
 * @publicApi
 */
export const LOCALE_ID: InjectionToken<string> = new InjectionToken(ngDevMode ? 'LocaleId' : '', {
  providedIn: 'root',
  factory: () => inject(LOCALE_ID, {optional: true, skipSelf: true}) || getGlobalLocale(),
});

/**
 * Provide this token to set the default currency code your application uses for
 * CurrencyPipe when there is no currency code passed into it. This is only used by
 * CurrencyPipe and has no relation to locale currency. Defaults to USD if not configured.
 *
 * See the [i18n guide](guide/i18n/locale-id) for more information.
 *
 * <div class="docs-alert docs-alert-helpful">
 *
 * The default currency code is currently always `USD`.
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
 * In standalone apps:
 * ```ts
 * import { LOCALE_ID, ApplicationConfig } from '@angular/core';
 * import { AppModule } from './app/app.module';
 *
 * const appConfig: ApplicationConfig = {
 *   providers: [{provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR' }]
 * };
 * ```
 *
 * In module based apps:
 * ```ts
 * import { platformBrowser } from '@angular/platform-browser';
 * import { AppModule } from './app/app.module';
 *
 * platformBrowser().bootstrapModule(AppModule, {
 *   providers: [{provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR' }]
 * });
 * ```
 *
 * @publicApi
 */
export const DEFAULT_CURRENCY_CODE = new InjectionToken<string>(
  ngDevMode ? 'DefaultCurrencyCode' : '',
  {
    providedIn: 'root',
    factory: () => USD_CURRENCY_CODE,
  },
);

/**
 * Use this token at bootstrap to provide the content of your translation file (`xtb`,
 * `xlf` or `xlf2`) when you want to translate your application in another language.
 *
 * See the [i18n guide](guide/i18n/merge) for more information.
 *
 * @usageNotes
 * ### Example
 * In standalone apps:
 * ```ts
 * import { LOCALE_ID, ApplicationConfig } from '@angular/core';
 * import { AppModule } from './app/app.module';
 *
 * const appConfig: ApplicationConfig = {
 *   providers: [{provide: TRANSLATIONS, useValue: translations }]
 * };
 * ```
 *
 * In module based apps:
 * ```ts
 * import { TRANSLATIONS } from '@angular/core';
 * import { platformBrowser } from '@angular/platform-browser';
 * import { AppModule } from './app/app.module';
 *
 * // content of your translation file
 * const translations = '....';
 *
 * platformBrowser().bootstrapModule(AppModule, {
 *   providers: [{provide: TRANSLATIONS, useValue: translations }]
 * });
 * ```
 *
 * @publicApi
 */
export const TRANSLATIONS = new InjectionToken<string>(ngDevMode ? 'Translations' : '');

/**
 * Provide this token at bootstrap to set the format of your {@link TRANSLATIONS}: `xtb`,
 * `xlf` or `xlf2`.
 *
 * See the [i18n guide](guide/i18n/merge) for more information.
 *
 * @usageNotes
 * ### Example
 * In standalone apps:
 * ```ts
 * import { LOCALE_ID, ApplicationConfig } from '@angular/core';
 * import { AppModule } from './app/app.module';
 *
 * const appConfig: ApplicationConfig = {
 *   providers: [{provide: TRANSLATIONS_FORMAT, useValue: 'xlf' }]
 * };
 * ```
 *
 * In module based apps: *
 * ```ts
 * import { TRANSLATIONS_FORMAT } from '@angular/core';
 * import { platformBrowser } from '@angular/platform-browser';
 * import { AppModule } from './app/app.module';
 *
 * platformBrowser().bootstrapModule(AppModule, {
 *   providers: [{provide: TRANSLATIONS_FORMAT, useValue: 'xlf' }]
 * });
 * ```
 *
 * @publicApi
 */
export const TRANSLATIONS_FORMAT = new InjectionToken<string>(
  ngDevMode ? 'TranslationsFormat' : '',
);

/**
 * Use this enum at bootstrap as an option of `bootstrapModule` to define the strategy
 * that the compiler should use in case of missing translations:
 * - Error: throw if you have missing translations.
 * - Warning (default): show a warning in the console and/or shell.
 * - Ignore: do nothing.
 *
 * See the [i18n guide](guide/i18n/merge#report-missing-translations) for more information.
 *
 * @usageNotes
 * ### Example
 * ```ts
 * import { MissingTranslationStrategy } from '@angular/core';
 * import { platformBrowser } from '@angular/platform-browser';
 * import { AppModule } from './app/app.module';
 *
 * platformBrowser().bootstrapModule(AppModule, {
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
