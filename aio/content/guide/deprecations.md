# Deprecated APIs and Features

Angular strives to balance innovation and stability.
Sometimes, APIs and features become obsolete and need to be removed or replaced so that Angular can stay current with new best practices, changing dependencies, or changes in the (web) platform itself.

To make these transitions as easy as possible, we deprecate APIs and features for a period of time before removing them. This gives you time to update your apps to the latest APIs and best practices.

This guide contains a summary of all Angular APIs and features that are currently deprecated.


<div class="alert is-helpful">


Features and APIs that were deprecated in v6 or earlier are candidates for removal in version 9 or any later major version. For information about Angular's deprecation and removal practices, see [Angular Release Practices](guide/releases#deprecation-practices "Angular Release Practices: Deprecation practices").

For step-by-step instructions on how to update to the latest Angular release, use the interactive update guide at [update.angular.io](https://update.angular.io).

</div>


## Index

To help you future-proof your apps, the following table lists all deprecated APIs and features, organized by the release in which they are candidates for removal. Each item is linked to the section later in this guide that describes the deprecation reason and replacement options.

<!--
deprecation -> removal cheat sheet
v4 - v7
v5 - v8
v6 - v9
v7 - v10
v8 - v11
-->


| Area | API or Feature | May be removed in |
| ---- | -------------- | ----------------- |
| `@angular/common` | [Pipes using Intl API](#i18n-pipes) | <!--v8--> v9 |
| `@angular/common` | [`ReflectiveInjector`](#reflectiveinjector) | <!--v8--> v9 |
| `@angular/core` | [`CollectionChangeRecord`](#core) | <!--v7--> v9 |
| `@angular/core` | [`DefaultIterableDiffer`](#core) | <!--v7--> v9 |
| `@angular/core` | [`ReflectiveKey`](#core) | <!--v8--> v9 |
| `@angular/core` | [`RenderComponentType`](#core) | <!--v7--> v9 |
| `@angular/core` | [`Renderer`](#core) | <!--v7--> v9 |
| `@angular/core` | [`RootRenderer`](#core) | <!--v7--> v9 |
| `@angular/core` | [`ViewEncapsulation.Native`](#core) | v9 |
| `@angular/forms` | [`ngForm` element selector](#ngform) | v9 |
| `@angular/forms` | [`NgFormSelectorWarning`](#forms) | v9 |
| `@angular/forms` | [`ngModel` with reactive forms](#ngmodel-reactive) | v9 |
| `@angular/router` | [`preserveQueryParams`](#router) | <!--v7--> v9 |
| `@angular/upgrade` | [`@angular/upgrade`](#upgrade) | <!--v8--> v9 |
| `@angular/upgrade` | [`getAngularLib`](#upgrade-static) | <!--v8--> v9 |
| `@angular/upgrade` | [`setAngularLib`](#upgrade-static) | <!--v8--> v9 |
| template syntax | [`/deep/`, `>>>`, and `::ng-deep`](#deep-component-style-selector) | <!--v7--> unspecified |
| template syntax | [`<template`>](#template-tag) | <!--v7--> v9 |
| service worker | [`versionedFiles` setting](#sw-versionedfiles)| v9 |
| polyfills | [reflect-metadata](#reflect-metadata) | <!--v8--> v9 |
| `@angular/core` | [`defineInjectable`](#core) | v11 |
| `@angular/router` | [`loadChildren` string syntax](#loadChildren) | v11 |
| `@angular/router` | [`ActivatedRoute` params and `queryParams` properties](#activatedroute-props) | unspecified |




## Deprecated APIs

This section contains a complete list all of the currently-deprecated APIs, with details to help you plan your migration to a replacement.


<div class="alert is-helpful">

Tip: In the [API reference section](api) of this doc site, deprecated APIs are indicated by ~~strikethrough.~~ You can filter the API list by [**Status: deprecated**](api?status=deprecated).

</div>



{@a common}
### @angular/common


| API | Replacement | Deprecation announced | Notes |
| --- | ----------- | --------------------- | ----- |
| [`DeprecatedI18NPipesModule`](api/common/DeprecatedI18NPipesModule) | [`CommonModule`](api/common/CommonModule#pipes) | v5 | See [Pipes](#i18n-pipes) |
 | [`DeprecatedCurrencyPipe`](api/common/DeprecatedCurrencyPipe) | [`CurrencyPipe`](api/common/CurrencyPipe) | v5  | See [Pipes](#i18n-pipes) |
 | [`DeprecatedDatePipe`](api/common/DeprecatedDatePipe) | [`DatePipe`](api/common/DatePipe) | v5  | See [Pipes](#i18n-pipes) |
 | [`DeprecatedDecimalPipe`](api/common/DeprecatedDecimalPipe) | [`DecimalPipe`](api/common/DecimalPipe) | v5  | See [Pipes](#i18n-pipes) |
 | [`DeprecatedPercentPipe`](api/common/DeprecatedPercentPipe) | [`PercentPipe`](api/common/PercentPipe) | v5 | See [Pipes](#i18n-pipes) |


{@a core}
### @angular/core

| API | Replacement | Deprecation announced | Notes |
| --- | ----------- | --------------------- | ----- |
| [`CollectionChangeRecord`](api/core/CollectionChangeRecord) | [`IterableChangeRecord`](api/core/IterableChangeRecord) | v4 | none |
| [`DefaultIterableDiffer`](api/core/DefaultIterableDiffer) | n/a | v4 | Not part of public API. |
| [`defineInjectable`](api/core/defineInjectable) | `ɵɵdefineInjectable` | v8 | Used only in generated code. No source code should depend on this API. |
| [`ReflectiveInjector`](api/core/ReflectiveInjector) | [`Injector.create`](api/core/Injector#create)  | v5 | See [`ReflectiveInjector`](#reflectiveinjector) |
| [`ReflectiveKey`](api/core/ReflectiveKey) | none | v5 | none |
| [`RenderComponentType`](api/core/RenderComponentType) | [`RendererType2`](api/core/RendererType2) and  [`Renderer2`](api/core/Renderer2) | v4 | none |
| [`Renderer`](api/core/Renderer) | [`Renderer2`](api/core/Renderer2) | v4 | none |
| [`RootRenderer`](api/core/RootRenderer) | [`RendererFactory2`](api/core/RendererFactory2) | v4 | none |
| [`ViewEncapsulation.Native`](api/core/ViewEncapsulation#Native) | [`ViewEncapsulation.ShadowDom`](api/core/ViewEncapsulation#ShadowDom) | v6 | Use the native encapsulation mechanism of the renderer. See [view.ts](https://github.com/angular/angular/blob/3e992e18ebf51d6036818f26c3d77b52d3ec48eb/packages/core/src/metadata/view.ts#L32).
| [`WtfScopeFn`](api/core/WtfScopeFn) | none | v8 | See [Web Tracing Framework](#wtf) |
| [`wtfCreateScope`](api/core/wtfCreateScope) | none | v8 | See [Web Tracing Framework](#wtf) |
| [`wtfStartTimeRange`](api/core/wtfStartTimeRange) | none | v8 | See [Web Tracing Framework](#wtf) |
| [`wtfEndTimeRange`](api/core/wtfEndTimeRange) | none | v8 | See [Web Tracing Framework](#wtf) |
| [`wtfLeave`](api/core/wtfLeave) | none | v8 | See [Web Tracing Framework](#wtf) |


{@a forms}
### @angular/forms

| API | Replacement | Deprecation announced | Notes |
| --- | ----------- | --------------------- | ----- |
| [`NgFormSelectorWarning`](api/forms/NgFormSelectorWarning) | n/a | v6 | See [ngForm](#ngform). |

{@a router}
### @angular/router

| API | Replacement | Deprecation announced | Notes |
| --- | ----------- | --------------------- | ----- |
| [`preserveQueryParams`](api/router/NavigationExtras#preserveQueryParams) | [`queryParamsHandling`](api/router/NavigationExtras#queryParamsHandling) | v4 | none |

{@a platform-webworker}
### @angular/platform-webworker

| API | Replacement | Deprecation announced | Notes |
| --- | ----------- | --------------------- | ----- |
| [All entry points](api/platform-webworker) | none | v8 | See [platform-webworker](#webworker-apps). |

{@a platform-webworker-dynamic}
### @angular/platform-webworker-dynamic

| API | Replacement | Deprecation announced | Notes |
| --- | ----------- | --------------------- | ----- |
| [All entry points](api/platform-webworker-dynamic) | none | v8 | See [platform-webworker](#webworker-apps). |

{@a upgrade}
### @angular/upgrade

| API | Replacement | Deprecation announced | Notes |
| --- | ----------- | --------------------- | ----- |
| [All entry points](api/upgrade) | [`@angular/upgrade/static`](api/upgrade/static) | v5 | See [Upgrading from AngularJS](guide/upgrade). |

{@a upgrade-static}
### @angular/upgrade/static

| API | Replacement | Deprecation announced | Notes |
| --- | ----------- | --------------------- | ----- |
| [`getAngularLib`](api/upgrade/static/getAngularLib) | [`getAngularJSGlobal`](api/upgrade/static/getAngularJSGlobal) | v5 | See [Upgrading from AngularJS](guide/upgrade). |
[`setAngularLib`](api/upgrade/static/setAngularLib) | [`setAngularJSGlobal`](api/upgrade/static/setAngularJSGlobal) | v5 | See [Upgrading from AngularJS](guide/upgrade). |



{@a deprecated-features}
## Deprecated features

This section lists all of the currently-deprecated features, which includes template syntax, configuration options, and any other deprecations not listed in the [Deprecated APIs](#deprecated-apis) section above. It also includes deprecated API usage scenarios or API combinations, to augment the information above.



{@a wtf}
### Web Tracing Framework integration

Angular previously has supported an integration with the Web Tracing Framework (WTF) for performance testing of Angular applications. This integration has not been maintained and likely does not work for the majority of Angular applications today. As a result, we are deprecating the integration in Angular version 8.


{@a deep-component-style-selector}
### `/deep/`, `>>>` and `:ng-deep` component style selectors

The shadow-dom-piercing descendant combinator is deprecated and support is being [removed from major browsers and tools](https://developers.google.com/web/updates/2017/10/remove-shadow-piercing). As such, in v4 we deprecated support in Angular for all 3 of `/deep/`, `>>>` and `::ng-deep`. Until removal, `::ng-deep` is preferred for broader compatibility with the tools.

For more information, see [/deep/, >>>, and ::ng-deep](guide/component-styles#deprecated-deep--and-ng-deep "Component Styles guide, Deprecated deep and ngdeep")
 in the Component Styles guide.


{@a template-tag}
### &lt;template&gt; tag

The `<template>` tag was deprecated in v4 to avoid colliding with the DOM's element of the same name (such as when using web components). Use `<ng-template>` instead. For more information, see the [Ahead-of-Time Compilation](guide/aot-compiler#enablelegacytemplate) guide.



{@a ngform}
### ngForm element selector

Support for using `ngForm` element selector was deprecated in v6.
It has been deprecated to be consistent with other core Angular selectors, which are typically written in kebab-case.

Deprecated:

```
<ngForm #myForm="ngForm">
```

Replacement:

```
<ng-form #myForm="ngForm">
```

The [`NgFormSelectorWarning`](api/forms/NgFormSelectorWarning) directive is solely used to display warnings when the deprecated `ngForm` selector is used.


{@a ngmodel-reactive}
### ngModel with reactive forms

Support for using the `ngModel` input property and `ngModelChange` event with reactive form directives was deprecated in version 6.

For more information, see the usage notes for [`FormControlDirective`](api/forms/FormControlDirective#use-with-ngmodel) and [`FormControlName`](api/forms/FormControlName#use-with-ngmodel).


{@a sw-versionedfiles}
### Service worker versionedFiles

In the service worker configuration file `ngsw-config.json`, `versionedFiles` and `files` have the same behavior. As of v6, `versionedFiles` is deprecated; use `files` instead.

For more information, see [Service Worker Configuration](guide/service-worker-config#assetgroups).


{@a reflectiveinjector}
### ReflectiveInjector

In v5, Angular replaced the `ReflectiveInjector` with the `StaticInjector`. The injector no longer requires the Reflect polyfill, reducing application size for most developers.

Before:

```
ReflectiveInjector.resolveAndCreate(providers);
```

After:

```
Injector.create({providers});
```

{@a i18n-pipes}
### Pipes using Intl API

<!--
From https://blog.angular.io/version-5-0-0-of-angular-now-available-37e414935ced
-->

Angular used to rely on the browser to provide number, date, and currency formatting using browser i18n APIs. This practice meant that most apps needed to use a polyfill, users were seeing inconsistent results across browsers, and common formats (such as the currency pipe) didn’t match developer expectations out of the box.

In version 4.3, Angular introduced new number, date, and currency pipes that increase standardization across browsers and eliminate the need for i18n polyfills. These pipes use the Unicode Common Locale Data Repository (CLDR) instead of the JS Intl API to provide extensive locale support.

In version 5.0.0, Angular updated its standard pipes to use the CLRD implementation.
At that time, Angular also added [`DeprecatedI18NPipesModule`](api/common/DeprecatedI18NPipesModule) and related APIs to provide limited-time access to the old behavior. If you need to use these `Deprecated*` pipes, see [Angular change log](https://github.com/angular/angular/blob/master/CHANGELOG.md#i18n-pipes) and the [Date Formats mappings](https://docs.google.com/spreadsheets/d/12iygt-_cakNP1VO7MV9g4lq9NsxVWG4tSfc98HpHb0k/edit#gid=0 "Date Formats Google sheet").

Reminder: If you use these `Deprecated*` pipes, you should migrate to the current APIs listed above as soon as possible. These deprecated APIs are candidates for removal in version 9.


{@a loadChildren}
### loadChildren string syntax

When Angular first introduced lazy routes, there wasn't browser support for dynamically loading additional JavaScript. Angular created our own scheme using the syntax `loadChildren: './lazy/lazy.module#LazyModule'` and built tooling to support it. Now that ECMAScript dynamic import is supported in many browsers, Angular is moving toward this new syntax.

In version 8, the string syntax for the [`loadChildren`](api/router/LoadChildren) route specification was deprecated, in favor of new syntax that uses `import()` syntax.

Before:

```
const routes: Routes = [{
  path: 'lazy',
  // The following string syntax for loadChildren is deprecated
  loadChildren: './lazy/lazy.module#LazyModule'
}];
```

After:

```
const routes: Routes = [{
  path: 'lazy',
  // The new import() syntax
  loadChildren: () => import('./lazy/lazy.module').then(m => m.LazyModule)
}];
```


<div class="alert is-helpful">


**Version 8 update**: When you update to version 8, the [`ng update`](cli/update) command performs the transformation automatically. Prior to version 7, the `import()` syntax only works in JIT mode (with view engine).


</div>

<div class="alert is-helpful">

**Declaration syntax**: It's important to follow the route declaration syntax `loadChildren: () => import('...').then(m => m.ModuleName)` to allow `ngc` to discover the lazy-loaded module and the associated `NgModule`. You can find the complete list of allowed syntax constructs [here](https://github.com/angular/angular-cli/blob/a491b09800b493fe01301387fa9a025f7c7d4808/packages/ngtools/webpack/src/transformers/import_factory.ts#L104-L113). These restrictions will be relaxed with the release of Ivy since it'll no longer use `NgFactories`.

</div>



{@a activatedroute-props}
### ActivatedRoute params and queryParams properties

[ActivatedRoute](api/router/ActivatedRoute) contains two [properties](api/router/ActivatedRoute#properties) that are less capable than their replacements and may be deprecated in a future Angular version.

| Property | Replacement |
| -------- | ----------- |
| `params` | `paramMap` |
| `queryParams` | `queryParamMap` |

For more information see the [Router guide](guide/router#activated-route).


{@a reflect-metadata}
### Dependency on a reflect-metadata polyfill in JIT mode
Angular applications, and specifically applications that relied on the JIT compiler, used to require a polyfill for the [reflect-metadata](https://github.com/rbuckton/reflect-metadata) APIs.

The need for this polyfill was removed in Angular version 8.0 ([see #14473](https://github.com/angular/angular-cli/pull/14473)), rendering the presence of the poylfill in most Angular applications unnecessary. Because the polyfill can be depended on by 3rd-party libraries, instead of removing it from all Angular projects, we are deprecating the requirement for this polyfill as of version 8.0. This should give library authors and application developers sufficient time to evaluate if they need the polyfill, and perform any refactoring necessary to remove the dependency on it.

In a typical Angular project, the polyfill is not used in production builds, so removing it should not impact production applications. The goal behind this removal is overall simplification of the build setup and decrease in the number of external dependencies.

{@a static-query-resolution}
### `@ViewChild()` / `@ContentChild()` static resolution as the default

See our [dedicated migration guide for static queries](guide/static-query-migration).

{@a contentchild-input-together}
### `@ContentChild()` / `@Input()` used together

The following pattern is deprecated:

```ts
@Input() @ContentChild(TemplateRef) tpl !: TemplateRef<any>;
```

Rather than using this pattern, separate the two decorators into their own
properties and add fallback logic as in the following example:

```ts
@Input() tpl !: TemplateRef<any>;
@ContentChild(TemplateRef) inlineTemplate !: TemplateRef<any>;
```
{@a cant-assign-template-vars}
### Cannot assign to template variables

In the following example, the two-way binding means that `optionName`
should be written when the `valueChange` event fires.

```html
<option *ngFor="let optionName of options" [(value)]="optionName"></option>
```

However, in practice, Angular simply ignores two-way bindings to template variables. Starting in version 8, attempting to write to template variables is deprecated. In a future version, we will throw to indicate that the write is not supported.

```html
<option *ngFor="let optionName of options" [value]="optionName"></option>
```

{@a binding-to-innertext}
### Binding to `innerText` in `platform-server`

[Domino](https://github.com/fgnass/domino), which is used in server-side rendering, doesn't support `innerText`, so in platform-server's "domino adapter", there was special code to fall back to `textContent` if you tried to bind to `innerText`.

These two properties have subtle differences, so switching to `textContent` under the hood can be surprising to users. For this reason, we are deprecating this behavior. Going forward, users should explicitly bind to `textContent` when using Domino.

{@a wtf-apis}
### `wtfStartTimeRange` and all `wtf*` APIs

All of the `wtf*` APIs are deprecated and will be removed in a future version.

{@a webworker-apps}
### Running Angular applications in platform-webworker

The `@angular/platform-*` packages enable Angular to be run in different contexts. For examples,
`@angular/platform-server` enables Angular to be run on the server, and `@angular/platform-browser`
enables Angular to be run in a web browser.

`@angular/platform-webworker` was introduced in Angular version 2 as an experiment in leveraging
Angular's rendering architecture to run an entire web application in a
[web worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API). We've learned a lot
from this experiment and have come to the conclusion that running the entire application in a web
worker is not the best strategy for most applications.

Going forward, we will focus our efforts related to web workers around their primary use case of
offloading CPU-intensive, non-critical work needed for initial rendering (such as in-memory search
and image processing). Learn more in the
[guide to Using Web Workers with the Angular CLI](guide/web-worker).

As of Angular version 8, all  `platform-webworker` APIs are deprecated.
This includes both packages: `@angular/platform-webworker` and
`@angular/platform-webworker-dynamic`.

{@a removed}
## Removed APIs

The following APIs have been removed starting with version 8.0.0:

| Package | API            | Replacement | Notes |
| ------- | -------------- | ----------- | ----- |
| [`@angular/http`](https://v7.angular.io/api/http) | All exports | [`@angular/common/http`](https://v7.angular.io/api/common/http) | See [below](#http). |
[`@angular/http/testing`](https://v7.angular.io/api/http/testing) | All exports | [`@angular/common/http/testing`](https://v7.angular.io/api/common/http/testing) | See [below](#http). |
| `@angular/platform-browser` | [`DOCUMENT`](https://v7.angular.io/api/platform-browser/DOCUMENT) | [`DOCUMENT` in `@angular/common`](https://v7.angular.io/api/common/DOCUMENT) | Updating to version 8 with [`ng update`](cli/update) changes this automatically.  |
| `@angular/core/testing` | [`TestBed.deprecatedOverrideProvider()`](https://v7.angular.io/api/core/testing/TestBed#deprecatedoverrideprovider) | [`TestBed.overrideProvider()`] (api/core/testing/TestBed#overrideprovider) | none |
| `@angular/core/testing` | [`TestBedStatic.deprecatedOverrideProvider()`](https://v7.angular.io/api/core/testing/TestBedStatic#deprecatedoverrideprovider) | [`TestBedStatic.overrideProvider()`](api/core/testing/TestBedStatic#overrideprovider) | none |



<!-- The following anchor is used by redirects from the removed API pages. Do not change or remove. -->
{@a http}
### @angular/http

<!--
Deprecation announced in version 5
https://blog.angular.io/version-5-0-0-of-angular-now-available-37e414935ced)
-->


The entire [`@angular/http`](http://v7.angular.io/api/http) package has been removed. Use [`@angular/common/http`](api/common/http) instead.

The new API is a smaller, easier, and more powerful way to make HTTP requests in Angular.
The new API simplifies the default ergonomics: There is no need to map by invoking the `.json()` method.
It also supports typed return values and interceptors.

To update your apps:
* Replace `HttpModule` with [`HttpClientModule`](api/common/http/HttpClientModule) (from [`@angular/common/http`](api/common/http)) in each of your modules.
* Replace the `Http` service with the [`HttpClient`](api/common/http/HttpClient) service.
* Remove any `map(res => res.json())` calls. They are no longer needed.

For more information about using `@angular/common/http`, see the [HttpClient guide](guide/http "HTTP Client guide").


| `@angular/http` | Closest replacement in `@angular/common/http` |
| ------------- | ------------------------------------------- |
| `BaseRequestOptions` |  [`HttpRequest`](/api/common/http/HttpRequest) |
| `BaseResponseOptions` | [`HttpResponse`](/api/common/http/HttpResponse) |
| `BrowserXhr` |  |
| `Connection` | [`HttpBackend`](/api/common/http/HttpBackend) |
| `ConnectionBackend` | [`HttpBackend`](/api/common/http/HttpBackend) |
| `CookieXSRFStrategy` | [`HttpClientXsrfModule`](/api/common/http/HttpClientXsrfModule) |
| `Headers` | [`HttpHeaders`](/api/common/http/HttpHeaders) |
| `Http` | [`HttpClient`](/api/common/http/HttpClient) |
| `HttpModule` | [`HttpClientModule`](/api/common/http/HttpClientModule) |
| `Jsonp` | [`HttpClient`](/api/common/http/HttpClient) |
| `JSONPBackend` | [`JsonpClientBackend`](/api/common/http/JsonpClientBackend) |
| `JSONPConnection` | [`JsonpClientBackend`](/api/common/http/JsonpClientBackend) |
| `JsonpModule` | [`HttpClientJsonpModule`](/api/common/http/HttpClientJsonpModule) |
| `QueryEncoder` | [`HttpUrlEncodingCodec`](/api/common/http/HttpUrlEncodingCodec) |
| `ReadyState` | [`HttpBackend`](/api/common/http/HttpBackend) |
| `Request` | [`HttpRequest`](/api/common/http/HttpRequest) |
| `RequestMethod` | [`HttpClient`](/api/common/http/HttpClient) |
| `RequestOptions` | [`HttpRequest`](/api/common/http/HttpRequest) |
| `RequestOptionsArgs` | [`HttpRequest`](/api/common/http/HttpRequest) |
| `Response` | [`HttpResponse`](/api/common/http/HttpResponse) |
| `ResponseContentType` | [`HttpClient`](/api/common/http/HttpClient) |
| `ResponseOptions` | [`HttpResponse`](/api/common/http/HttpResponse) |
| `ResponseOptionsArgs` | [`HttpResponse`](/api/common/http/HttpResponse) |
| `ResponseType` | [`HttpClient`](/api/common/http/HttpClient) |
| `URLSearchParams` | [`HttpParams`](/api/common/http/HttpParams) |
| `XHRBackend` | [`HttpXhrBackend`](/api/common/http/HttpXhrBackend) |
| `XHRConnection` | [`HttpXhrBackend`](/api/common/http/HttpXhrBackend) |
| `XSRFStrategy` | [`HttpClientXsrfModule`](/api/common/http/HttpClientXsrfModule) |


| `@angular/http/testing` | Closest replacement in `@angular/common/http/testing` |
| --------------------- | ------------------------------------------- |
| `MockBackend` | [`HttpTestingController`](/api/common/http/testing/HttpTestingController) |
| `MockConnection` | [`HttpTestingController`](/api/common/http/testing/HttpTestingController) |

## Renderer to Renderer2 migration

### Migration Overview

The `Renderer` class has been marked as deprecated since Angular version 4. This section provides guidance on migrating from this deprecated API to the newer `Renderer2` API and what it means for your app.

### Why should I migrate to Renderer2?

The deprecated `Renderer` class has been removed in version 9 of Angular, so it's necessary to migrate to a supported API.  Using `Renderer2` is the recommended strategy because it supports a similar set of functionality to `Renderer`. The API surface is quite large (with 19 methods), but the schematic should simplify this process for your applications.

### Is there action required on my end?

No. The schematic should handle most cases with the exception of `Renderer.animate()` and `Renderer.setDebugInfo()`, which already aren’t supported.

### What are the `__ngRendererX` methods? Why are they necessary?

Some methods either don't have exact equivalents in `Renderer2`, or they correspond to more than one expression. For example, both renderers have a `createElement()` method, but they're not equal because a call such as `renderer.createElement(parentNode, namespaceAndName)` in the `Renderer` corresponds to the following block of code in `Renderer2`:

```ts
const [namespace, name] = splitNamespace(namespaceAndName);
const el = renderer.createElement(name, namespace);
if (parentNode) {
  renderer.appendChild(parentNode, el);
}
return el;
```

Migration has to guarantee that the return values of functions and types of variables stay the same. To handle the majority of cases safely, the schematic declares helper functions at the bottom of the user's file. These helpers encapsulate your own logic and keep the replacements inside your code down to a single function call. Here's an example of how the `createElement()` migration looks:


**Before:**

```ts
public createAndAppendElement() {
  const el = this.renderer.createElement('span');
  el.textContent = 'hello world';
  return el;
}
```

**After:**

<code-example>

public createAndAppendElement() {
  const el = __ngRendererCreateElement(this.renderer, this.element, 'span');
  el.textContent = 'hello world';
  return el;
}
// Generated code at the bottom of the file
__ngRendererCreateElement(renderer: any, parentNode: any, nameAndNamespace: any) {
  const [namespace, name] = __ngRendererSplitNamespace(namespaceAndName);
  const el = renderer.createElement(name, namespace);
  if (parentNode) {
    renderer.appendChild(parentNode, el);
  }
  return el;
}
__ngRendererSplitNamespace(nameAndNamespace: any) {
  // returns the split name and namespace
}

</code-example>

When implementing these helper functions, the schematic ensures that they're only declared once per file and that their names are unique enough that there's a small chance of colliding with pre-existing functions in your code. The schematic also keeps their parameter types as `any` so that it doesn't have to insert extra logic that ensures that their values have the correct type.

### I’m a library author. Should I run this migration?

**Library authors should definitely use this migration to move away from the `Renderer`. Otherwise, the libraries won't work with applications built with version 9.**


### Full list of method migrations

The following table shows all methods that the migration maps from `Renderer` to `Renderer2`.

|Renderer|Renderer2|
|---|---|
|`listen(renderElement, name, callback)`|`listen(renderElement, name, callback)`|
|`setElementProperty(renderElement, propertyName, propertyValue)`|`setProperty(renderElement, propertyName, propertyValue)`|
|`setText(renderNode, text)`|`setValue(renderNode, text)`|
|`listenGlobal(target, name, callback)`|`listen(target, name, callback)`|
|`selectRootElement(selectorOrNode, debugInfo?)`|`selectRootElement(selectorOrNode)`|
|`createElement(parentElement, name, debugInfo?)`|`appendChild(parentElement, createElement(name))`|
|`setElementStyle(el, style, value?)`|`value == null ? removeStyle(el, style) : setStyle(el, style, value)`
|`setElementAttribute(el, name, value?)`|`attributeValue == null ? removeAttribute(el, name) : setAttribute(el, name, value)`
|`createText(parentElement, value, debugInfo?)`|`appendChild(parentElement, createText(value))`|
|`createTemplateAnchor(parentElement)`|`appendChild(parentElement, createComment(''))`|
|`setElementClass(renderElement, className, isAdd)`|`isAdd ? addClass(renderElement, className) : removeClass(renderElement, className)`|
|`projectNodes(parentElement, nodes)`|`for (let i = 0; i < nodes.length; i<ins></ins>) { appendChild(parentElement, nodes<i>); }`|
|`attachViewAfter(node, viewRootNodes)`|`const parentElement = parentNode(node); const nextSibling = nextSibling(node); for (let i = 0; i < viewRootNodes.length; i<ins></ins>) { insertBefore(parentElement, viewRootNodes<i>, nextSibling);}`|
|`detachView(viewRootNodes)`|`for (let i = 0; i < viewRootNodes.length; i<ins></ins>) {const node = viewRootNodes<i>; const parentElement = parentNode(node); removeChild(parentElement, node);}`|
|`destroyView(hostElement, viewAllNodes)`|`for (let i = 0; i < viewAllNodes.length; i<ins></ins>) { destroyNode(viewAllNodes<i>); }`|
|`setBindingDebugInfo()`|This function is a noop in `Renderer2`.|
|`createViewRoot(hostElement)`|Should be replaced with a reference to `hostElement`|
|`invokeElementMethod(renderElement, methodName, args?)`|`(renderElement as any)<methodName>.apply(renderElement, args);`|
|`animate(element, startingStyles, keyframes, duration, delay, easing, previousPlayers?)`|Throws an error (same behavior as `Renderer.animate()`)|
