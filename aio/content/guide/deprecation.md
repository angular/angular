# Deprecation Summary

<!-- 
<div class="alert is-important">

Author note: The Deprecation Summary is still in progress. This skeleton version has been created so that multiple members of the docs team can work in parallel. The assumption in this document organization is that developers are interested primarily in knowing what is deprecated and how to migrate off those features or APIs. The specific release in which the feature or API was deprecated&mdash;and the specific release in which it is a candidate for removal&mdash;is secondary. Another way to organize is time-based, with section headings by the release in which something is a candidate for removal. That structure helps teams create time-based roadmaps. In the end, however, teams need to migrate off everything here. 

</div>
-->

Angular strives to balance innovation and stability. 
Sometimes, APIs and features become obsolete and need to be removed or replaced so that Angular can stay current with new best practices, changing dependencies, or changes in the (web) platform itself. 

To make these transitions as easy as possible, we deprecate APIs and features for a period of time before removing them. This gives you time to update your apps to the latest APIs and best practices.

This guide contains a summary of all Angular APIs and features that are currently deprecated. 


<div class="alert is-helpful">

For information about Angular's deprecation and removal practices, see [Angular versioning and releases](guide/releases#deprecation-practices "Angular versioning and releases: Deprecation practices").

For step-by-step instructions on how to update to the latest Angular release, use the interactive update guide at [update.angular.io](https://update.angular.io). 

</div>


{@a removed}
## Removed in v8

The following APIs and features were previously announced as deprecated and have been removed starting with version 8.0.0: 

| Package | API or feature | Replacement | Notes |
| ------- | -------------- | ----------- | ----- |
| [@angular/http](https://v7.angular.io/api/http) | All | [@angular/common/http](https://v7.api/common/http) | The entire package has been removed. See [below](#http). |
[@angular/http/testing](https://v7.api/http/testing) | All | [@angular/common/http/testing](https://v7.api/common/http/testing) | See [below](#http). |
| @angular/platform-browser | [DOCUMENT](https://v7.angular.io/api/platform-browser/DOCUMENT) | [`@angular/common`](https://v7.angular.io/api/common/DOCUMENT) |  |

<!-- 
platform-browser/DOCUMENT was marked deprecated as far back as v4 docs. No explanation provided other than to import from @angular/common now. 
-->

{@a http}
### @angular/http

<!-- 
Deprecation announced in version 5 
https://blog.angular.io/version-5-0-0-of-angular-now-available-37e414935ced) 
In version 4.3 we shipped HttpClient in @angular/common as a smaller, easier, and more powerful way to make web requests in Angular. 
To update to HttpClient, replace HttpModule with HttpClientModule from @angular/common/http in each of your modules, inject the HttpClient service, and remove any map(res => res.json()) calls, which are no longer needed. 
To update your app, switch from `HttpModule` and the `Http` service to `HttpClientModule` and the `HttpClient` service. HttpClient simplifies the default ergonomics (You don't need to map to json anymore) and now supports typed return values and interceptors. 
-->


The entire [@angular/http](http://v7.angular.io/api/http) package has been removed. Use [@angular/common/http](api/common/http) instead.  

The new API simplifies the default ergonomics (You don't need to map to `json` anymore.) and supports typed return values and interceptors. 

To update your apps:
* Replace `HttpModule` with `HttpClientModule`
* Replace the `Http` service with the `HttpClient` service
* Remove any map(`res => res.json()`) calls

For more information about using the replacement APIs, see the [HttpClient](guide/http "HTTP Client guide") guide. 


| Removed API | Replacement API |
| ----------- | --------------- |
| BaseRequestOptions |  tbd |
| BaseResponseOptions | tbd |
| BrowserXhr | tbd |
| Connection | tbd |
| ConnectionBackend | tbd |
| CookieXSRFStrategy | tbd |
| Headers | tbd |
| HttpModule | tbd |
| Jsonp | tbd |
| JSONPBackend | tbd |
| JSONPConnection | tbd |
| JsonpModule | tbd |
| QueryEncoder | tbd |
| ReadyState | tbd |
| Request | tbd |
| RequestMethod | tbd |
| RequestOptions | tbd |
| RequestOptionsArgs | tbd |
| Response | tbd |
| ResponseContentType | tbd |
| ResponseOptions | tbd |
| ResponseOptionsArgs | tbd |
| ResponseType | tbd |
| URLSearchParams | tbd |
| XHRBackend | tbd |
| XHRConnection | tbd |
| XSRFStrategy | tbd |
| @http/testing/MockBackend | tbd |
| @http/testing/MockConnection | tbd |


## Deprecated APIs

The following table lists all of the deprecated APIs, with details to help you plan your migration to a replacement. 

<div class="alert is-helpful">

To see a quick summary of all APIs that are deprecated, filter the API list by [**Status: deprecated**](https://angular.io/api?status=deprecated). Deprecated APIs are indicated by ~~strikethrough~~ in the API reference pages. 

</div>

{@a common}
### @angular/common 

| API | Replacement | Deprecation announced | Notes |
| --- | ----------- | --------------------- | ----- |
| [DeprecatedI18NPipesModule](api/common/DeprecatedI18NPipesModule) | [`CommonModule`](https://angular.io/api?query=pipe) | v5 | Pipes that rely the JS Intl API use the deprecated module, while the new `CommonModule` extracts and uses data from CLDR instead. For mappings to assist your update, see [Date Formats](https://docs.google.com/spreadsheets/d/12iygt-_cakNP1VO7MV9g4lq9NsxVWG4tSfc98HpHb0k/edit#gid=0 "Date formats Google sheet"). | 
| [DeprecatedCurrencyPipe](https://angular.io/api/common/DeprecatedCurrencyPipe) | [CurrencyPipe](https://angular.io/api/common/CurrencyPipe) | v5  | none |
| [DeprecatedDatePipe](https://angular.io/api/common/DeprecatedDatePipe) | [DatePipe](https://angular.io/api/common/DatePipe) | v5  | none |
| [DeprecatedDecimalPipe](https://angular.io/api/common/DeprecatedDecimalPipe) | [DecimalPipe](https://angular.io/api/common/DecimalPipe) | v5  | none |
| [DeprecatedPercentPipe](https://angular.io/api/common/DeprecatedPercentPipe) | [PercentPipe](https://angular.io/api/common/PercentPipe) v5  | | none |


<!-- 
DeprecatedI18NPipesModule 
A module that contains the deprecated i18n pipes. From v4 docs: I18N pipes are being changed to move away from using the JS Intl API. The former pipes relying on the Intl API will be moved to this module while the CommonModule will contain the new pipes that do not rely on Intl. As a first step this module is created empty to ease the migration. From the PR: We don't need the intl API anymore, we extract and use data from CLDR instead. How to update from v4 to v5: https://docs.google.com/spreadsheets/d/12iygt-_cakNP1VO7MV9g4lq9NsxVWG4tSfc98HpHb0k/edit#gid=0 
-->

<!-- 
<div class=callout is-important>
<header>Need Clarification</header>

[DeprecatedI18NPipesModule](api/common/DeprecatedI18NPipesModule) was introduced and API marked deprecated in v4 docs. Starting with v5, the text says deprecated in v5. Which version should we use to start the deprecation clock? This affects when it's a candidate for removal. 

The other `Deprecated*` pipe APIs aren't marked deprecated. Should they be?

</div>
-->


### @angular/core 


The following exports from `@angular/care` are deprecated: 

Package | API | Deprecation announced | Removed in | Details | Replacement
------- | --- | --------------------- | ---------- | ------- | -----------
core | animate | v5 or earlier | ? | none | tbd
core | AnimationAnimateMetadata | v5 or earlier | ? | none | tbd
core | AnimationEntryMetadata | v5 or earlier | ? | none | tbd
core | AnimationGroupMetadata | v5 or earlier | ? | none | tbd
core | AnimationKeyframe | v5 or earlier | ? | none | tbd
core | AnimationKeyframesSequenceMetadata | v5 or earlier | ? | none | tbd
core | AnimationMetadata | v5 or earlier | ? | none | tbd
core | AnimationPlayer | v5 or earlier | ? | none | tbd
core | AnimationSequenceMetadata | v5 or earlier | ? | none | tbd
core | AnimationStateMetadata | v5 or earlier | ? | none | tbd
core | AnimationStateTransitionMetadata | v5 or earlier | ? | none | tbd
core | AnimationStyleMetadata | v5 or earlier | ? | none | tbd
core | AnimationStyles | v5 or earlier | ? | none | tbd
core | AnimationTransitionEvent | v5 or earlier | ? | none | tbd
core | AnimationTransitionMetadata | v5 or earlier | ? | none | tbd
core | AnimationTriggerMetadata | v5 or earlier | ? | none | tbd
core | AUTO_STYLE | v5 or earlier | ? | none | tbd
core | [CollectionChangeRecord](https://angular.io/api/core/CollectionChangeRecord) | v4.0.0 | in v7 docs | none | [IterableChangeRecord](https://angular.io/api/core/IterableChangeRecord)
core | [DefaultIterableDiffer](https://angular.io/api/core/DefaultIterableDiffer) | v4.0.0 | in v7 docs | Should not be part of public API. | not applicable 
core | group | v5 or earlier | ? | none | tbd
core | keyframes | v5 or earlier | ? | none | tbd
core | [ReflectiveInjector](https://angular.io/api/core/ReflectiveInjector) | v5 | in v7 docs | Slow and brings in a lot of code. | [Injector.create](https://angular.io/api/core/Injector#create) 
core | [ReflectiveKey](https://angular.io/api/core/ReflectiveKey) | marked in v6, can't check v5 | in v7 docs | No replacement
core | [RenderComponentType](https://angular.io/api/core/RenderComponentType) | marked in v4 docs | in v7 docs | none | [`RendererType2`](https://angular.io/api/core/RendererType2) and [`Renderer2`](https://angular.io/api/core/Renderer2) 
core | [Renderer](https://angular.io/api/core/Renderer) | marked in v4 docs | in v7 docs | none |  [`Renderer2`](https://angular.io/api/core/Renderer2)
core | [RootRenderer](https://angular.io/api/core/RootRenderer) | marked in v4 docs | in v7 docs | none | [`RendererFactory2`](https://angular.io/api/core/RendererFactory2)
core | sequence | v5 or earlier | ? | none | tbd
core | state | v5 or earlier | ? | none | tbd
core | style | v5 or earlier | ? | none | tbd
core | transition | v5 or earlier | ? | none | tbd
core | trigger| v5 or earlier | ? | none | tbd




### @angular/forms


The following exports from `@angular/forms` are deprecated: 


Package | API | Deprecation announced | Removed in | Details | Replacement
------- | --- | --------------------- | ---------- | ------- | -----------
forms | [NgForm](https://angular.io/api/forms/NgForm) | v6 | will be removed in v9 | This has been deprecated to keep selectors consistent with other core Angular selectors, as element selectors are typically written in kebab-case. | See description in [NgForm](https://angular.io/api/forms/NgForm). Now deprecated: `<ngForm #myForm="ngForm">`. Replacement: `<ng-form #myForm="ngForm">`.
forms | [NgFormSelectorWarning](https://angular.io/api/forms/NgFormSelectorWarning) | v6 (page added to API ref in v7 docs) | will be removed in v9 | This directive is solely used to display warnings when the deprecated ngForm selector is used. | not applicable 

Support for using ngForm element selector has been deprecated in Angular v6 and will be removed in Angular v9.

This has been deprecated to keep selectors consistent with other core Angular selectors, as element selectors are typically written in kebab-case.

For details, see https://angular.io/api/forms/NgForm#description



### @angular/platform-browser


The following exports from `@angular/platform-browser` are deprecated: 


Package | API | Deprecation announced | Removed in | Details | Replacement
------- | --- | --------------------- | ---------- | ------- | -----------
platform-browser | [platform-browser/DOCUMENT](https://angular.io/api/platform-browser/DOCUMENT) |  marked deprecated as far back as v4 docs | in v7 docs | none | Import from [`@angular/common`](https://angular.io/api/common/DOCUMENT) 
platform-browser | [NgProbeToken](https://v4.angular.io/api/platform-browser/NgProbeToken) | marked deprecated as far back as API Reference (v2.4.10) docs | not in docs v5+ | none | [Use the one from `@angular/core`](https://angular.io/api/core/NgProbeToken)

### @angular/router

The following exports from `@angular/router` are deprecated: 

Package | API | Deprecation announced | Removed in | Details | Replacement
------- | --- | --------------------- | ---------- | ------- | -----------
router | [RouterLink](https://angular.io/api/router/RouterLink) | v4 | candidate v7 | none | `queryParamsHandling` 


Two older properties are still available. They are less capable than their replacements, discouraged, and may be deprecated in a future Angular version.

* params—An Observable that contains the required and optional parameters specific to the route. Use paramMap instead.

* queryParams—An Observable that contains the query parameters available to all routes. Use queryParamMap instead. 

See https://angular.io/guide/router#activated-route


### @angular/upgrade


The following exports from `@angular/upgrade` are deprecated: 


Package | API | Deprecation announced | Removed in | Details | Replacement
------- | --- | --------------------- | ---------- | ------- | -----------
upgrade | entire [`@angular/upgrade`](https://angular.io/api/upgrade) package | v5? | in nv7 docs | All exports of this entry point are deprecated. Supports the upgrade path from AngularJS to Angular, allowing components from both systems to be used in the same application. All exports of this entry point are deprecated. Use [@angular/upgrade/static](https://angular.io/api/upgrade/static). For more information about upgrading from AngularJS to Angular, see [Upgrading from AngularJS](https://angular.io/guide/upgrade). | none
upgrade | [UpgradeAdapter](https://angular.io/api/upgrade/UpgradeAdapter) | v5 | in v7 docs | none | Use [`upgrade/static`](https://angular.io/api/upgrade/static) instead, which also supports [Ahead-of-Time compilation](guide/aot-compiler)
upgrade | [UpgradeAdapterRef](https://angular.io/api/upgrade/UpgradeAdapterRef) | v5 | in v7 docs | none | Use [`upgrade/static`](https://angular.io/api/upgrade/static) instead, which also supports [Ahead-of-Time compilation](guide/aot-compiler)
upgrade/static | [getAngularLib](https://angular.io/api/upgrade/static/getAngularLib) | marked in v5 docs | in v7 docs | none | Use [`getAngularJSGlobal`](https://angular.io/api/upgrade/static/getAngularJSGlobal) instead
upgrade/static | [setAngularLib](https://angular.io/api/upgrade/static/setAngularLib) | marked in v5 docs | in v7 docs | none | Use [`setAngularJSGlobal`](https://angular.io/api/upgrade/static/setAngularJSGlobal) instead



{@a features}
## Deprecated features


### Component styles

The shadow-piercing descendant combinator is deprecated and support is being removed from major browsers and tools. As such, we plan to drop support in Angular for all 3 of `/deep/`, `>>>` and `::ng-deep`). Until then `::ng-deep` is preferred for broader compatibility with the tools.

For more information, see [/deep/, >>>, and ::ng-deep](guide/component-styles#deprecated-deep--and-ng-deep "Component Styles guide, Deprecated deep and ngdeep")
 in the Component Styles guide]. 


### ngModel with reactive forms

Support for using the `ngModel` input property and `ngModelChange` event with reactive form directives was deprecated in version 6.0.0.

For more information, see the [usage notes of FormControlDirective](api/forms/FormControlDirective#use-with-ngmodel) and [FormControlName](api/forms/FormControlName#use-with-ngmodel). 


<!-- 
## Announced in v6
-->

### Service worker versionedFiles

6.1.0 (2018-07-25) and 6.0.2 (2018-05-15)
service-worker: deprecate versionedFiles in asset-group resources (#23584) (1d378e2)
As of v6 `versionedFiles` and `files` options have the same behavior. Use `files` instead. 

https://angular.io/guide/service-worker-config

As of v6 `versionedFiles` and `files` options have the same behavior. Use `files` instead. 

From update.angular.io 6.1 to 7.0: f you use the Angular Service worker, migrate any `versionedFiles` to the `files` array. The behavior is the same.

<!-- 
## Announced in v5
-->


### ReflectiveInjector replaced with StaticInjector (From blog)
In order to remove even more polyfills, we’ve replaced the ReflectiveInjector with the StaticInjector. This injector no longer requires the Reflect polyfill, reducing application size for most developers.

Before
ReflectiveInjector.resolveAndCreate(providers);

After
Injector.create(providers);

Note: This is marked v4 in the API reference docs. 


{@a i18n-pipes}
### Pipes that use the JS Intl API 
<!-- 
Internationalized number, date, and currency pipes
-->

<!-- 
From https://blog.angular.io/version-5-0-0-of-angular-now-available-37e414935ced
-->

Angular used to rely on the browser to provide number, date, and currency formatting using browser i18n APIs. This practice meant that most apps needed to use a polyfill, users were seeing inconsistent results across browsers, and common formats (such as the currency pipe) didn’t match developer expectations out of the box.

In version 4.3, Angular introduced new number, date, and currency pipes that increase standardization across browsers and eliminate the need for i18n polyfills. These pipes use the CLDR (instead of the JS Intl API) to provide extensive locale support. 

In 5.0.0, Angular updated its pipes to use the CLRD implementation. 
At the same time, it introduced `DeprecatedI18NPipesModule` to provide access to the old behavior. 
[DeprecatedCurrencyPipe](https://angular.io/api/common/DeprecatedCurrencyPipe) 
[DeprecatedDatePipe](https://angular.io/api/common/DeprecatedDatePipe) 
[DeprecatedDecimalPipe](https://angular.io/api/common/DeprecatedDecimalPipe)
[DeprecatedPercentPipe](https://angular.io/api/common/DeprecatedPercentPipe)

All `Deprecated` pipes are deprecated and candidates for removal beginning in version 8.0.0 

<!-- 
https://angular.io/guide/browser-support#optional-browser-features-to-polyfill
--> 

For more information about the mapping of pipe behavior between v4 and v5, see [Date Formats](https://docs.google.com/spreadsheets/d/12iygt-_cakNP1VO7MV9g4lq9NsxVWG4tSfc98HpHb0k/edit#gid=0 "Date Formats Google sheet"). 

Read more about the changes to our i18n pipes in the changelog. https://github.com/angular/angular/blob/master/CHANGELOG.md#i18n-pipes

If you aren’t ready for the new pipes, you can import `DeprecatedI18NPipesModule` to get access to the old behavior.

<!-- 
https://angular.io/guide/browser-support#optional-browser-features-to-polyfill
--> 

If you use the following deprecated i18n pipes: 
* date,
* currency,
* decimal,
* percent

You need the Intl API on all browsers except Chrome, Firefox, Edge, IE11 and Safari 10. 



## Removed in v6

The following APIs were removed in v6.0.0.

* Animations APIs were moved from [`@angular/core/animations`](https://v5.angular.io/api/animations) to [`@angular/animations`](api/animations).
In v6.0.0, [`@angular/core/animations`](https://v5.angular.io/api/animations) was removed.
Imports from `@angular/core` were [announced as deprecated in v4](https://blog.angularjs.org/2017/03/angular-400-now-available.html).
Use imports from the new package import { trigger, state, style, transition, animate } from `@angular/animations`.
If you import any animations services or tools from `@angular/core`, you should import them from `@angular/animations`.

* The `<template>` tag was deprecated in Angular v4 to avoid collisions (such as when using web components). Use `<ng-template`> instead. (`<template> `removed in v6.0.0 (2018-05-03)

https://angular.io/guide/aot-compiler#enablelegacytemplate

enableLegacyTemplate:
Use of the `<template>` element was deprecated starting in Angular 4.0 in favor of using `<ng-template> `to avoid colliding with the DOM's element of the same name. Setting this option to true enables the use of the deprecated `<template> `element. This option is false by default. This option might be required by some third-party Angular libraries.

API or feature | Deprecation announced | Removed in | Details | Replacement
-------------- | --------------------- | ---------- | ------- | -----------
[animate](https://v5.angular.io/api/core/animate) | | v6.0.0 | This symbol has moved | Import from [`@angular/animations`](api/animations) instead

<!-- 
| Removed API | Replacement API |
| ----------- | --------------- |

AnimationAnimateMetadata 
AnimationEntryMetadata 
AnimationGroupMetadata 
AnimationKeyframe 
AnimationKeyframesSequenceMetadata 
AnimationMetadata 
AnimationPlayer 
AnimationSequenceMetadata 
AnimationStateMetadata 
AnimationStateTransitionMetadata 
AnimationStyleMetadata 
AnimationStyles 
AnimationTransitionEvent 
AnimationTransitionMetadata 
AnimationTriggerMetadata 
AUTO_STYLE 
CollectionChangeRecord 
DefaultIterableDiffer 
group 
keyframes 
ReflectiveInjector 
ReflectiveKey 
RenderComponentType 
Renderer 
RootRenderer 
sequence 
state 
style 
transition 
trigger
--> 

## Removed in v5


| API | Replacement | Notes |
| --- | ----------- | ----- |
| [NgFor](https://v4.angular.io/api/common/NgFor) | [`NgForOf`](https://angular.io/api/common/NgForOf) | Deprecated in v4.0.0. Removed in v5.0.0 |


## Other deprecations 
<!-- To incorporate from update.angular.io --> 


<div class="alert is-helpful">

The following changes and deprecations are mentioned in the update instructions at [update.angular.io](http://update.angular.io). 

</div>

### Updating from v5 to v6

* Replace ngOutletContext with ngTemplateOutletContext.
* Replace CollectionChangeRecord with IterableChangeRecord
* Anywhere you use Renderer, now use Renderer2
* If you use preserveQueryParams, instead use queryParamsHandling
* If you use DOCUMENT from @angular/platform-browser, you should start to import this from @angular/common
* Anywhere you use ReflectiveInjector, now use StaticInjector
* Choose a value of off for preserveWhitespaces in your tsconfig.json to gain the benefits of this setting, which was set to off by default in v6.
* Format of angular.json changed. Update your Angular CLI globally and locally, and migrate the configuration to the new angular.json format by following the instructions in update.angular.io.
* Update any scripts you may have in your package.json to use the latest Angular CLI commands. All CLI commands now use two dashes for flags (eg ng build --prod --source-map) to be POSIX compliant.

### Updating v4 to v5

* Stop using DefaultIterableDiffer, KeyValueDiffers#factories, or IterableDiffers#factories
* Rename your template tags to ng-template
* Replace any OpaqueToken with InjectionToken.
* If you call DifferFactory.create(...) remove the ChangeDetectorRef argument.
* Stop passing any arguments to the constructor for ErrorHandler
* If you use ngProbeToken, make sure you import it from @angular/core instead of @angular/platform-browser
* If you use TrackByFn, instead use TrackByFunction
* If you import any animations services or tools from @angular/core, you should import them from @angular/animations
* Replace ngOutletContext with ngTemplateOutletContext.
* Replace CollectionChangeRecord with IterableChangeRecord
* Anywhere you use Renderer, now use Renderer2
* If you use preserveQueryParams, instead use queryParamsHandling
* If you rely on the date, currency, decimal, or percent pipes, in 5 you will see minor changes to the format. For applications using locales other than en-us you will need to import it and optionally locale_extended_fr from @angular/common/i18n_data/locale_fr and registerLocaleData(local).
* Do not rely on gendir, instead look at using skipTemplateCodeGen. Read More https://github.com/angular/angular/issues/19339#issuecomment-332607471%22
* Switch from HttpModule and the Http service to HttpClientModule and the HttpClient service. HttpClient simplifies the default ergonomics (You don't need to map to json anymore) and now supports typed return values and interceptors. Read more on angular.io
* If you use DOCUMENT from @angular/platform-browser, you should start to import this from @angular/common
* Anywhere you use ReflectiveInjector, now use StaticInjector
* Choose a value of off for preserveWhitespaces in your tsconfig.json to gain the benefits of this setting, which was set to off by default in v6.

### Updating v2 to v4

* Ensure you don't use extends OnInit, or use extends with any lifecycle event. Instead use implements <lifecycle event>.
* Stop using deep imports, these symbols are now marked with ɵ and are not part of our public API.
* Stop using Renderer.invokeElementMethod as this method has been removed. There is not currently a replacement.
* Stop using DefaultIterableDiffer, KeyValueDiffers#factories, or IterableDiffers#factories
* If you use animations in your application, you should import BrowserAnimationsModule from @angular/platform-browser/animations in your App NgModule.
* Replace RootRenderer with RendererFactoryV2 instead.
* Rename your template tags to ng-template
* Replace any OpaqueToken with InjectionToken.
* If you call DifferFactory.create(...) remove the ChangeDetectorRef argument.
* Stop passing any arguments to the constructor for ErrorHandler
* If you use ngProbeToken, make sure you import it from @angular/core instead of @angular/platform-browser
* If you use TrackByFn, instead use TrackByFunction
* If you import any animations services or tools from @angular/core, you should import them from @angular/animations
* Replace ngOutletContext with ngTemplateOutletContext.
* Replace CollectionChangeRecord with IterableChangeRecord
* Anywhere you use Renderer, now use Renderer2
* If you use preserveQueryParams, instead use queryParamsHandling



<!--
## Questions and to do

* Scope? Should this include features that were removed in v2-v7? Or just features that are being removed in v8 or are deprecated (newly or still) in v8. 

* Overall org?
    * by removal date (you need to act by this date or version?)
    * by deprecation date (historical log)
    * by package and type names 
    * by feature names and API groups related to that feature change
* Should we include package names? Organize by packages or types?
* Should we include the type after the name? Ex: "`CollectiveChangeRecord` interface" or just "`CollectiveChangeRecord`"
* Phrasing of deprecation: 
    * "Deprecated from v5" 
    * "Deprecated in v5" 
    * "Deprecation announced in v5" 
    * "Deprecated since v5" 
    * "v5"
    * "v5.0.0"
    * "Version 5"
* Include EOL information or refer to Deprecation practices for that? Will there ever be exceptions that require special notes about EOL or can we always rely on the general practice statement?
* When an entire package is deprecated, list just the package or all types in the package?
* See `platform-browser/DOCUMENT`. When the parent package is required to differentiate (from `common/DOCUMENT`) include it as shown above?
* Use code font in column 1?
* Remove all extra words from replacement column? Or do they add value?
* Include APIs and features that have already been removed?

To do:
* Incorporate details from and/or add links to https://github.com/angular/angular/blob/master/CHANGELOG.md
* Add info about viewencapsulation.native https://github.com/angular/angular/pull/26361 . ViewEncapsulation.Native is deprecated as of v6.1.0. 
-->


