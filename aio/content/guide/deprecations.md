# Deprecated APIs and features

Angular strives to balance innovation and stability.
Sometimes, APIs and features become obsolete and need to be removed or replaced so that Angular can stay current with new best practices, changing dependencies, or changes in the \(web\) platform itself.

To make these transitions as easy as possible, APIs and features are deprecated for a period of time before they are removed.
This gives you time to update your applications to the latest APIs and best practices.

This guide contains a summary of all Angular APIs and features that are currently deprecated.

<div class="alert is-helpful">

Features and APIs that were deprecated in v6 or earlier are candidates for removal in version 9 or any later major version.
For information about Angular's deprecation and removal practices, see [Angular Release Practices](guide/releases#deprecation-practices "Angular Release Practices: Deprecation practices").

For step-by-step instructions on how to update to the latest Angular release, use the interactive update guide at [update.angular.io](https://update.angular.io).

</div>

## Index

To help you future-proof your projects, the following table lists all deprecated APIs and features, organized by the release in which they are candidates for removal.
Each item is linked to the section later in this guide that describes the deprecation reason and replacement options.

<!--
deprecation -> removal cheat sheet
v4 - v7
v5 - v8
v6 - v9
v7 - v10
v8 - v11
v9 - v12
v10 - v13
v11 - v14
v12 - v15
v13 - v16
v14 - v17
v15 - v18
v16 - v19
-->

### Deprecated features that can be removed in v11 or later

| Area                                | API or Feature                                                                                             | Deprecated in | May be removed in |
|:---                                 |:---                                                                                                        |:---           |:---               |
| `@angular/core`                     | [`DefaultIterableDiffer`](#core)                                                                           |  v7           | v11         |
| `@angular/core`                     | [`defineInjectable`](#core)                                                                                |  v8           | v11         |
| `@angular/core`                     | [`entryComponents`](api/core/NgModule)                                                                     |  v9           | v11         |
| `@angular/core`                     | [`ANALYZE_FOR_ENTRY_COMPONENTS`](#core)                                                                    |  v9           | v11         |
| `@angular/forms`                    | [`ngModel` with reactive forms](#ngmodel-reactive)                                                         |  v6           | v11         |
| `@angular/upgrade`                  | [`@angular/upgrade`](#upgrade)                                                                             |  v8           | v11         |
| `@angular/upgrade`                  | [`getAngularLib`](#upgrade-static)                                                                         |  v8           | v11         |
| `@angular/upgrade`                  | [`setAngularLib`](#upgrade-static)                                                                         |  v8           | v11         |
| polyfills                           | [reflect-metadata](#reflect-metadata)                                                                      |  v8           | v11         |
| template syntax                     | [`<template>`](#template-tag)                                                                              |  v7           | v11         |

### Deprecated features that can be removed in v12 or later

| Area                                | API or Feature                                                                                             | Deprecated in | May be removed in |
|:---                                 |:---                                                                                                        |:---           |:---               |
| `@angular/core/testing`             | [`TestBed.get`](#testing)                                                                                  |  v9           | v12         |
| `@angular/core/testing`             | [`async`](#testing)                                                                                        |  v9           | v12         |

### Deprecated features that can be removed in v14 or later

| Area                                | API or Feature                                                                                             | Deprecated in | May be removed in |
|:---                                 |:---                                                                                                        |:---           |:---               |
| `@angular/forms`                    | [`FormBuilder.group` legacy options parameter](api/forms/FormBuilder#group)                                | v11           | v14         |

### Deprecated features that can be removed in v15 or later

| Area                                | API or Feature                                                                                             | Deprecated in | May be removed in |
|:---                                 |:---                                                                                                        |:---           |:---               |
| `@angular/compiler-cli`             | [Input setter coercion](#input-setter-coercion)                                                            | v13           | v15         |
| `@angular/compiler-cli`             | [`fullTemplateTypeCheck`](#full-template-type-check)                                                       | v13           | v15         |
| `@angular/core`                     | [Factory-based signature of `ApplicationRef.bootstrap`](#core)                                             | v13           | v15         |
| `@angular/core`                     | [`PlatformRef.bootstrapModuleFactory`](#core)                                                              | v13           | v15         |
| `@angular/core`                     | [Factory-based signature of `ViewContainerRef.createComponent`](api/core/ViewContainerRef#createComponent) | v13           | v15         |
| `@angular/upgrade`                  | [Factory-based signature of `downgradeModule`](#upgrade-static)                                            | v13           | v15         |
| template syntax                     | [`bind-`, `on-`, `bindon-`, and `ref-`](#bind-syntax)                                                      | v13           | v15         |

### Deprecated features that can be removed in v16 or later

| Area                                | API or Feature                                                                                             | Deprecated in | May be removed in |
|:---                                 |:---                                                                                                        |:---           |:---               |
| `@angular/common/http/testing`      | [`TestRequest` accepting `ErrorEvent` for error simulation](#testrequest-errorevent)                       | v13           | v16         |
| `@angular/core`                     | [`getModuleFactory`](#core)                                                                                | v13           | v16         |
| `@angular/core`                     | [`ModuleWithComponentFactories`](#core)                                                                    | v13           | v16         |
| `@angular/core`                     | [`Compiler`](#core)                                                                                        | v13           | v16         |
| `@angular/core`                     | [`CompilerFactory`](#core)                                                                                 | v13           | v16         |
| `@angular/core`                     | [`NgModuleFactory`](#core)                                                                                 | v13           | v16         |
| `@angular/core`                     | [`ComponentFactory`](#core)                                                                                | v13           | v16         |
| `@angular/core`                     | [`ComponentFactoryResolver`](#core)                                                                        | v13           | v16         |
| `@angular/core`                     | [`CompilerOptions.useJit and CompilerOptions.missingTranslation config options`](#core)                    | v13           | v16         |
| `@angular/platform-browser-dynamic` | [`JitCompilerFactory`](#platform-browser-dynamic)                                                          | v13           | v16         |
| `@angular/platform-browser-dynamic` | [`RESOURCE_CACHE_PROVIDER`](#platform-browser-dynamic)                                                     | v13           | v16         |
| `@angular/platform-server`          | [`ServerTransferStateModule`](#platform-server)                                                            | v14           | v16         |
| `@angular/service-worker`           | [`SwUpdate#activated`](api/service-worker/SwUpdate#activated)                                              | v13           | v16         |
| `@angular/service-worker`           | [`SwUpdate#available`](api/service-worker/SwUpdate#available)                                              | v13           | v16         |

### Deprecated features that can be removed in v17 or later

| Area                                | API or Feature                                                                                             | Deprecated in | May be removed in |
|:---                                 |:---                                                                                                        |:---           |:---               |
| `@angular/common`                   | [`NgComponentOutlet.ngComponentOutletNgModuleFactory`](#common)                                            | v14           | v17         |
| `@angular/common`                   | [`DatePipe` - `DATE_PIPE_DEFAULT_TIMEZONE`](api/common/DATE_PIPE_DEFAULT_TIMEZONE)                         | v15           | v17         |
| `@angular/core`                     | NgModule and `'any'` options for [`providedIn`](#core)                                                     | v15           | v17         |
| `@angular/core`                     | [`@Component.moduleId`](api/core/Component#moduleId) | v16 | v17 |
| `@angular/router`                   | [`RouterLinkWithHref` directive](#router)                                                                  | v15           | v17         |
| `@angular/router`                   | [Router writeable properties](#router-writable-properties)                                                 | v15.1         | v17         |
| `@angular/router`                   | [Router CanLoad guards](#router-can-load)                                                 | v15.1         | v17         |
| `@angular/router`                   | [class and `InjectionToken` guards and resolvers](#router-class-and-injection-token-guards)                | v15.2         | v17         |

### Deprecated features that can be removed in v18 or later

| Area                                | API or Feature                                                                                             | Deprecated in | May be removed in |
|:---                                 |:---                                                                                                        |:---           |:---               |
| `@angular/core` | `EnvironmentInjector.runInContext` | v16 | v18 |
| `@angular/platform-server`          | [`PlatformConfig.baseUrl` and `PlatformConfig.useAbsoluteUrl` config options](api/platform-server/PlatformConfig) | v16           | v18               |
| `@angular/platform-browser`         | [`BrowserModule.withServerTransition`](api/platform-browser/BrowserModule#withservertransition)            | v16           | v18         |
| `@angular/platform-browser`         | [`makeStateKey`, `StateKey` and `TransferState`](#platform-browser), symbols were moved to `@angular/core`                                        | v16           | v18         |

### Deprecated features with no planned removal version

| Area                                | API or Feature                                                                                             | Deprecated in | May be removed in |
|:---                                 |:---                                                                                                        |:---           |:---               |
| template syntax                     | [`/deep/`, `>>>`, and `::ng-deep`](#deep-component-style-selector)                                         |  v7           | unspecified |

For information about Angular Component Development Kit (CDK) and Angular Material deprecations, see the [changelog](https://github.com/angular/components/blob/main/CHANGELOG.md).

## Deprecated APIs

This section contains a complete list all deprecated APIs, with details to help you plan your migration to a replacement.

<div class="alert is-helpful">

**TIP**: <br />
In the [API reference section](api) of this site, deprecated APIs are indicated by ~~strikethrough.~~ You can filter the API list by [Status: deprecated](api?status=deprecated).

</div>

<a id="common"></a>

### &commat;angular/common

| API                                                                                           | Replacement                                         | Deprecation announced | Details |
|:---                                                                                           |:---                                                 |:---                   |:---     |
| [`NgComponentOutlet.ngComponentOutletNgModuleFactory`](api/common/NgComponentOutlet)          | `NgComponentOutlet.ngComponentOutletNgModule`       | v14                   | Use the `ngComponentOutletNgModule` input instead. This input doesn't require resolving NgModule factory. |
| [`DatePipe` - `DATE_PIPE_DEFAULT_TIMEZONE`](api/common/DATE_PIPE_DEFAULT_TIMEZONE) |`{ provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: { timezone: '-1200' }` | v15                    | Use the `DATE_PIPE_DEFAULT_OPTIONS` injection token, which can configure multiple settings at once instead. |

<a id="core"></a>

### &commat;angular/core

| API                                                                                                        | Replacement                                                                                                                                                       | Deprecation announced | Details |
|:---                                                                                                        |:---                                                                                                                                                               |:---                   |:---     |
| [`DefaultIterableDiffer`](api/core/DefaultIterableDiffer)                                                  | n/a                                                                                                                                                               | v4                    | Not part of public API.                                                                                                                                                                                                                                            |                                                                                                                                                                                                                                                            |
| [`defineInjectable`](api/core/defineInjectable)                                                            | `ɵɵdefineInjectable`                                                                                                                                              | v8                    | Used only in generated code. No source code should depend on this API.                                                                                                                                                                                             |
| [`entryComponents`](api/core/NgModule)                                                     | none                                                                                                                                                              | v9                    | See [`entryComponents`](#entryComponents)                                                                                                                                                                                                                          |
| `ANALYZE_FOR_ENTRY_COMPONENTS`                                   | none                                                                                                                                                              | v9                    | See [`ANALYZE_FOR_ENTRY_COMPONENTS`](#entryComponents)                                                                                                                                                                                                             |
| [`async`](api/core/testing/async)                                                                          | [`waitForAsync`](api/core/testing/waitForAsync)                                                                                                                   | v11                   | The [`async`](api/core/testing/async) function from `@angular/core/testing` has been renamed to `waitForAsync` in order to avoid confusion with the native JavaScript `async` syntax. The existing function is deprecated and can be removed in a future version. |
| [`getModuleFactory`](api/core/getModuleFactory)                                                            | [`getNgModuleById`](api/core/getNgModuleById)                                                                                                                     | v13                   | Ivy allows working with NgModule classes directly, without retrieving corresponding factories.                                                                                                                                                                     |
| `ViewChildren.emitDistinctChangesOnly` / `ContentChildren.emitDistinctChangesOnly`                         | none \(was part of [issue #40091](https://github.com/angular/angular/issues/40091)\)                                                                              |                       | This is a temporary flag introduced as part of bug fix of [issue #40091](https://github.com/angular/angular/issues/40091) and will be removed.                                                                                                                      |
| Factory-based signature of [`ApplicationRef.bootstrap`](api/core/ApplicationRef#bootstrap)                 | Type-based signature of [`ApplicationRef.bootstrap`](api/core/ApplicationRef#bootstrap)                                                                           | v13                   | With Ivy, there is no need to resolve Component factory and Component Type can be provided directly.                                                                                                                                                               |
| [`PlatformRef.bootstrapModuleFactory`](api/core/PlatformRef#bootstrapModuleFactory)                        | [`PlatformRef.bootstrapModule`](api/core/PlatformRef#bootstrapModule)                                                                                             | v13                   | With Ivy, there is no need to resolve NgModule factory and NgModule Type can be provided directly.                                                                                                                                                                 |
| [`ModuleWithComponentFactories`](api/core/ModuleWithComponentFactories)                                    | none                                                                                                                                                              | v13                   | Ivy JIT mode doesn't require accessing this symbol. See [JIT API changes due to ViewEngine deprecation](#jit-api-changes) for additional context.                                                                                                                  |
| [`Compiler`](api/core/Compiler)                                                                            | none                                                                                                                                                              | v13                   | Ivy JIT mode doesn't require accessing this symbol. See [JIT API changes due to ViewEngine deprecation](#jit-api-changes) for additional context.                                                                                                                  |
| [`CompilerFactory`](api/core/CompilerFactory)                                                              | none                                                                                                                                                              | v13                   | Ivy JIT mode doesn't require accessing this symbol. See [JIT API changes due to ViewEngine deprecation](#jit-api-changes) for additional context.                                                                                                                  |
| [`NgModuleFactory`](api/core/NgModuleFactory)                                                              | Use non-factory based framework APIs like [PlatformRef.bootstrapModule](api/core/PlatformRef#bootstrapModule) and [createNgModule](api/core/createNgModule) | v13                   | Ivy JIT mode doesn't require accessing this symbol. See [JIT API changes due to ViewEngine deprecation](#jit-api-changes) for additional context.                                                                                                                  |
| [Factory-based signature of `ViewContainerRef.createComponent`](api/core/ViewContainerRef#createComponent) | [Type-based signature of `ViewContainerRef.createComponent`](api/core/ViewContainerRef#createComponent)                                                           | v13                   | Angular no longer requires component factories to dynamically create components. Use different signature of the `createComponent` method, which allows passing Component class directly.                                                                           |
| [`ComponentFactory`](api/core/ComponentFactory)                                                            | Use non-factory based framework APIs.                                                                                                                             | v13                   | Since Ivy, Component factories are not required. Angular provides other APIs where Component classes can be used directly.                                                                                                                                         |
| [`ComponentFactoryResolver`](api/core/ComponentFactoryResolver)                                            | Use non-factory based framework APIs.                                                                                                                             | v13                   | Since Ivy, Component factories are not required, thus there is no need to resolve them.                                                                                                                                                                            |
| [`CompilerOptions.useJit and CompilerOptions.missingTranslation config options`](api/core/CompilerOptions) | none                                                                                                                                                              | v13                   | Since Ivy, those config options are unused, passing them has no effect.                                                                                                                                                                                            |
| [`providedIn`](api/core/Injectable#providedIn) with NgModule | Prefer `'root'` providers, or use NgModule `providers` if scoping to an NgModule is necessary | v15 | none |
| [`providedIn: 'any'`](api/core/Injectable#providedIn) | none | v15 | This option has confusing semantics and nearly zero usage. |
| [`EnvironmentInjector.runInContext`](api/core/EnvironmentInjector#runInContext) | `runInInjectionContext`  | v16 | `runInInjectionContext` is a more flexible operation which supports element injectors as well |
| [`@Component.moduleId`](api/core/Component#moduleId) | none | v16 |


<a id="testing"></a>

### &commat;angular/core/testing

| API                                                                                                      | Replacement                                         | Deprecation announced | Details |
|:---                                                                                                      |:---                                                 |:---                   |:---     |
| [`TestBed.get`](api/core/testing/TestBed#get)                                                            | [`TestBed.inject`](api/core/testing/TestBed#inject) | v9                    | Same behavior, but type safe.                 |
| [`async`](api/core/testing/async)                                                                        | [`waitForAsync`](api/core/testing/waitForAsync)     | v10                   | Same behavior, but rename to avoid confusion. |

<a id="router"></a>

### &commat;angular/router

| API                                        | Replacement                       | Deprecation announced | Details |
|:---                                        |:---                               |:---                   |:---     |
| [`RouterLinkWithHref` directive](api/router/RouterLinkWithHref) | Use `RouterLink` instead. | v15                   | The `RouterLinkWithHref` directive code was merged into `RouterLink`. Now the `RouterLink` directive can be used for all elements that have `routerLink` attribute. |
| [`provideRoutes` function](api/router/provideRoutes) | Use `ROUTES` `InjectionToken` instead. | v15                   | The `provideRoutes` helper function is minimally useful and can be unintentionally used instead of `provideRouter` due to similar spelling. |
| [`setupTestingRouter` function](api/router/testing/setupTestingRouter) | Use `provideRouter` or `RouterModule` instead. | v15.1                   | The `setupTestingRouter` function is not necessary. The `Router` is initialized based on the DI configuration in tests as it would be in production. |
| [class and `InjectionToken` guards and resolvers](api/router/DeprecatedGuard) | Use plain JavaScript functions instead. | v15.2                   | Functional guards are simpler and more powerful than class and token-based guards. |


<a id="platform-browser"></a>

### &commat;angular/platform-browser

| API                                                              | Replacement                                        | Deprecation announced | Details |
|:---                                                              |:---                                                |:---                   |:---     |
| [`BrowserModule.withServerTransition`](api/platform-browser/BrowserModule#withservertransition) | No replacement needed.  | v16.0                   | The `APP_ID`token should be used instead to set the application ID. |
| `makeStateKey`, `StateKey` and `TransferState` | Import from `@angular/core`.  | v16.0                   | Same behavior, but exported from a different package. |
<a id="platform-browser-dynamic"></a>

### &commat;angular/platform-browser-dynamic

| API                                                                               | Replacement | Deprecation announced | Details |
|:---                                                                               |:---         |:---                   |:---     |
| [`JitCompilerFactory`](api/platform-browser-dynamic/JitCompilerFactory)           | none        | v13                   | This symbol is no longer necessary. See [JIT API changes due to ViewEngine deprecation](#jit-api-changes) for additional context. |
| [`RESOURCE_CACHE_PROVIDER`](api/platform-browser-dynamic/RESOURCE_CACHE_PROVIDER) | none        | v13                   | This was previously necessary in some cases to test AOT-compiled components with View Engine, but is no longer since Ivy.         |

<a id="platform-server"></a>

### &commat;angular/platform-server

| API                                                              | Replacement                                        | Deprecation announced | Details |
|:---                                                              |:---                                                |:---                   |:---     |
| [`ServerTransferStateModule`](api/platform-server/ServerTransferStateModule) | No replacement needed.  | v14.1                   | The `TransferState` class is available for injection without importing additional modules during server side rendering, when `ServerModule` is imported or `renderApplication` function is used for bootstrap. |
| [`PlatformConfig.baseUrl` and `PlatformConfig.useAbsoluteUrl` config options](api/platform-server/PlatformConfig) | none                    | v16                   | This was previously unused.                   |
<a id="forms"></a>

### &commat;angular/forms

| API                                                                         | Replacement                                                                  | Deprecation announced | Details |
|:---                                                                         |:---                                                                          |:---                   |:---     |
| [`ngModel` with reactive forms](#ngmodel-reactive)                          | [`FormControlDirective`](api/forms/FormControlDirective)                     | v6                    | none    |
| [`FormBuilder.group` legacy options parameter](api/forms/FormBuilder#group) | [`AbstractControlOptions` parameter value](api/forms/AbstractControlOptions) | v11                   | none    |

<a id="service-worker"></a>

### &commat;angular/service-worker

| API                                                           | Replacement                                                                            | Deprecation announced | Details |
|:---                                                           |:---                                                                                    |:---                   |:---     |
| [`SwUpdate#activated`](api/service-worker/SwUpdate#activated) | [`SwUpdate#activateUpdate()` return value](api/service-worker/SwUpdate#activateUpdate) | v13                   | The return value of `SwUpdate#activateUpdate()` indicates whether an update was successfully activated.                                                                    |
| [`SwUpdate#available`](api/service-worker/SwUpdate#available) | [`SwUpdate#versionUpdates`](api/service-worker/SwUpdate#versionUpdates)                | v13                   | The behavior of `SwUpdate#available` can be rebuilt by filtering for `VersionReadyEvent` events on [`SwUpdate#versionUpdates`](api/service-worker/SwUpdate#versionUpdates) |

<a id="upgrade"></a>

### &commat;angular/upgrade

| API                             | Replacement                                     | Deprecation announced | Details |
|:---                             |:---                                             |:---                   |:---     |
| [All entry points](api/upgrade) | [`@angular/upgrade/static`](api/upgrade/static) | v5                    | See [Upgrading from AngularJS](guide/upgrade). |

<a id="upgrade-static"></a>

### &commat;angular/upgrade/static

| API                                                                                | Replacement                                                                         | Deprecation announced | Details |
|:---                                                                                |:---                                                                                 |:---                   |:---     |
| [`getAngularLib`](api/upgrade/static/getAngularLib)                                | [`getAngularJSGlobal`](api/upgrade/static/getAngularJSGlobal)                       | v5                    | See [Upgrading from AngularJS](guide/upgrade).                                                          |
| [`setAngularLib`](api/upgrade/static/setAngularLib)                                | [`setAngularJSGlobal`](api/upgrade/static/setAngularJSGlobal)                       | v5                    | See [Upgrading from AngularJS](guide/upgrade).                                                          |
| [Factory-based signature of `downgradeModule`](api/upgrade/static/downgradeModule) | [NgModule-based signature of `downgradeModule`](api/upgrade/static/downgradeModule) | v13                   | The `downgradeModule` supports more ergonomic NgModule-based API \(versus NgModule factory based API\). |

<a id="deprecated-features"></a>

## Deprecated features

This section lists all deprecated features, which includes template syntax, configuration options, and any other deprecations not listed in the [Deprecated APIs](#deprecated-apis) section.
It also includes deprecated API usage scenarios or API combinations, to augment the information above.

<a id="wtf"></a>

### Web Tracing Framework integration

Angular previously supported an integration with the [Web Tracing Framework (WTF)](https://google.github.io/tracing-framework) for performance testing of Angular applications.
This integration has not been maintained and is now defunct.
As a result, the integration was deprecated in Angular version 8, and due to no evidence of any existing usage, removed in version 9.

<a id="deep-component-style-selector"></a>

### `/deep/`, `>>>`, and `::ng-deep` component style selectors

The shadow-dom-piercing descendant combinator is deprecated and support is being [removed from major browsers and tools](https://developers.google.com/web/updates/2017/10/remove-shadow-piercing).
As such, in v4, Angular's support for `/deep/`, `>>>`, and `::ng-deep` was deprecated.
Until removal, `::ng-deep` is preferred for broader compatibility with the tools.

For more information, see [/deep/, >>>, and ::ng-deep](guide/component-styles#deprecated-deep--and-ng-deep "Component Styles guide, Deprecated deep and ngdeep") in the Component Styles guide.

<a id="bind-syntax"></a>

### `bind-`, `on-`, `bindon-`, and `ref-` prefixes

The template prefixes `bind-`, `on-`, `bindon-`, and `ref-` have been deprecated in v13.
Templates should use the more widely documented syntaxes for binding and references:

*   `[input]="value"` instead of `bind-input="value"`
*   `[@trigger]="value"` instead of `bind-animate-trigger="value"`
*   `(click)="onClick()"` instead of `on-click="onClick()"`
*   `[(ngModel)]="value"` instead of `bindon-ngModel="value"`
*   `#templateRef` instead of `ref-templateRef`

<a id="template-tag"></a>

### `<template>` tag

The `<template>` tag was deprecated in v4 to avoid colliding with a DOM element of the same name \(such as when using web components\).
Use `<ng-template>` instead.
For more information, see the [Ahead-of-Time Compilation](guide/aot-compiler) guide.

<a id="ngmodel-reactive"></a>

### `ngModel` with reactive forms

Support for using the `ngModel` input property and `ngModelChange` event with reactive form directives has been deprecated in Angular v6 and can be removed in a future version of Angular.

Now deprecated:

<code-example path="deprecation-guide/src/app/app.component.html" region="deprecated-example"></code-example>

<code-example path="deprecation-guide/src/app/app.component.ts" region="deprecated-example"></code-example>

This support was deprecated for several reasons.
First, developers found this pattern confusing.
It seems like the actual `ngModel` directive is being used, but in fact it's an input/output property named `ngModel` on the reactive form directive that approximates some, but not all, of the directive's behavior.
It allows getting and setting a value and intercepting value events, but some  `ngModel` features, such as delaying updates with`ngModelOptions` or exporting the directive, don't work.

In addition, this pattern mixes template-driven and reactive forms strategies, which prevents taking advantage of the full benefits of either strategy.
Setting the value in the template violates the template-agnostic principles behind reactive forms, whereas adding a `FormControl`/`FormGroup` layer in the class removes the convenience of defining forms in the template.

To update your code before support is removed, decide whether to stick with reactive form directives \(and get/set values using reactive forms patterns\) or switch to template-driven directives.

**After** \(choice 1 - use reactive forms\):

<code-example path="deprecation-guide/src/app/app.component.html" region="reactive-form-example"></code-example>

<code-example path="deprecation-guide/src/app/app.component.ts" region="reactive-form-example"></code-example>

**After** \(choice 2 - use template-driven forms\):

<code-example path="deprecation-guide/src/app/app.component.html" region="template-driven-form-example"></code-example>

<code-example path="deprecation-guide/src/app/app.component.ts" region="template-driven-form-example"></code-example>

By default, when you use this pattern, you get a deprecation warning once in dev mode.
You can choose to silence this warning by configuring `ReactiveFormsModule` at import time:

<code-example path="deprecation-guide/src/app/app.module.ts" region="reactive-form-no-warning"></code-example>

Alternatively, you can choose to surface a separate warning for each instance of this pattern with a configuration value of `"always"`.
This may help to track down where in the code the pattern is being used as the code is being updated.


<a id="router-class-and-injection-token-guards"></a>

### Router class and InjectionToken guards and resolvers

Class and injection token guards and resolvers are deprecated. Instead, `Route`
objects should use functional-style guards and resolvers. Class-based guards can
be converted to functions by instead using `inject` to get dependencies.

For testing a function `canActivate` guard, using `TestBed` and `TestBed.runInInjectionContext` is recommended.
Test mocks and stubs can be provided through DI with `{provide: X, useValue: StubX}`.
Functional guards can also be written in a way that's either testable with
`runInInjectionContext` or by passing mock implementations of dependencies.
For example:

```
export function myGuardWithMockableDeps(
  dep1 = inject(MyService),
  dep2 = inject(MyService2),
  dep3 = inject(MyService3),
) { }

const route = {
  path: 'admin',
  canActivate: [myGuardWithMockableDeps]
}
```

This deprecation only affects the support for class and
`InjectionToken` guards at the `Route` definition. `Injectable` classes
and `InjectionToken` providers are _not_ deprecated in the general
sense. That said, the interfaces like `CanActivate`,
`CanDeactivate`, etc.  will be deleted in a future release of Angular. Simply removing the
`implements CanActivate` from the injectable class and updating the route definition
to be a function like `canActivate: [() => inject(MyGuard).canActivate()]` is sufficient
to get rid of the deprecation warning.

Functional guards are robust enough to even support the existing
class-based guards through a transform:

```
import {CanMatchFn} from '@angular/router';

function mapToCanMatch(providers: Array<Type<{canMatch: CanMatchFn}>>): CanMatchFn[] {
  return providers.map(provider => (...params) => inject(provider).canMatch(...params));
}
const route = {
  path: 'admin',
  canMatch: mapToCanMatch([AdminGuard]),
};
```

That is to say that guards can continue to be implemented as classes and then converted
to functions at the route definition.

<a id="router-writable-properties"></a>

### Public `Router` properties

None of the public properties of the `Router` are meant to be writeable.
They should all be configured using other methods, all of which have been
documented.

The following strategies are meant to be configured by registering the
application strategy in DI via the `providers` in the root `NgModule` or
`bootstrapApplication`:
* `routeReuseStrategy`
* `titleStrategy`
* `urlHandlingStrategy`

The following options are meant to be configured using the options
available in `RouterModule.forRoot` or `provideRouter` and `withRouterConfig`.
* `onSameUrlNavigation`
* `paramsInheritanceStrategy`
* `urlUpdateStrategy`
* `canceledNavigationResolution`
* `errorHandler`

The following options are deprecated in entirely:
* `malformedUriErrorHandler` - URI parsing errors should be handled in the `UrlSerializer` instead.
* `errorHandler` - Subscribe to the `Router` events and filter for `NavigationError` instead.

<a id="router-can-load"></a>

### `CanLoad` guards

`CanLoad` guards in the Router are deprecated in favor of `CanMatch`. These guards execute at the same time
in the lifecycle of a navigation. A `CanMatch` guard which returns false will prevent the `Route` from being
matched at all and also prevent loading the children of the `Route`. `CanMatch` guards can accomplish the same
goals as `CanLoad` but with the addition of allowing the navigation to match other routes when they reject
(such as a wildcard route). There is no need to have both types of guards in the API surface.

<a id="loadChildren"></a>

### `loadChildren` string syntax

When Angular first introduced lazy routes, there wasn't browser support for dynamically loading additional JavaScript.
Angular created its own scheme using the syntax `loadChildren: './lazy/lazy.module#LazyModule'` and built tooling to support it.
Now that ECMAScript dynamic import is supported in many browsers, Angular is moving toward this new syntax.

In version 8, the string syntax for the [`loadChildren`](api/router/LoadChildren) route specification was deprecated, in favor of new syntax that uses `import()` syntax.

**Before**:

<code-example path="deprecation-guide/src/app/app.module.ts" language="typescript" region="lazyload-deprecated-syntax"></code-example>

**After**:

<code-example path="deprecation-guide/src/app/app.module.ts" language="typescript" region="lazyload-syntax"></code-example>

<div class="alert is-helpful">

**Version 8 update**: When you update to version 8, the [`ng update`](cli/update) command performs the transformation automatically.
Prior to version 7, the `import()` syntax only works in JIT mode \(with view engine\).

</div>

<div class="alert is-helpful">

**Declaration syntax**: <br />
It's important to follow the route declaration syntax `loadChildren: () => import('...').then(m => m.ModuleName)` to allow `ngc` to discover the lazy-loaded module and the associated `NgModule`.
You can find the complete list of allowed syntax constructs [here](https://github.com/angular/angular-cli/blob/a491b09800b493fe01301387fa9a025f7c7d4808/packages/ngtools/webpack/src/transformers/import_factory.ts#L104-L113).
These restrictions will be relaxed with the release of Ivy since it'll no longer use `NgFactories`.

</div>

<a id="reflect-metadata"></a>

### Dependency on a reflect-metadata polyfill in JIT mode

Angular applications, and specifically applications that relied on the JIT compiler, used to require a polyfill for the [reflect-metadata](https://github.com/rbuckton/reflect-metadata) APIs.

The need for this polyfill was removed in Angular version 8.0 \([see #14473](https://github.com/angular/angular-cli/pull/14473)\), rendering the presence of the polyfill in most Angular applications unnecessary.
Because the polyfill can be depended on by third-party libraries, instead of removing it from all Angular projects, we are deprecating the requirement for this polyfill as of version 8.0.
This should give library authors and application developers sufficient time to evaluate if they need the polyfill, and perform any refactoring necessary to remove the dependency on it.

In a typical Angular project, the polyfill is not used in production builds, so removing it should not impact production applications.
The goal behind this removal is overall simplification of the build setup and decrease in the number of external dependencies.

<a id="static-query-resolution"></a>

### `@ViewChild()` / `@ContentChild()` static resolution as the default

See the [dedicated migration guide for static queries](guide/static-query-migration).

<a id="contentchild-input-together"></a>

### `@ContentChild()` / `@Input()` used together

The following pattern is deprecated:

<code-example path="deprecation-guide/src/app/app.component.ts" language="typescript" region="template-with-input-deprecated"></code-example>

Rather than using this pattern, separate the two decorators into their own
properties and add fallback logic as in the following example:

<code-example path="deprecation-guide/src/app/app.component.ts" language="typescript" region="template-with-input"></code-example>

<a id="cant-assign-template-vars"></a>

### Cannot assign to template variables

In the following example, the two-way binding means that `optionName`
should be written when the `valueChange` event fires.

<code-example path="deprecation-guide/src/app/app.component.1.html" region="two-way-template-deprecated"></code-example>

However, in practice, Angular ignores two-way bindings to template variables.
Starting in version 8, attempting to write to template variables is deprecated.
In a future version, we will throw to indicate that the write is not supported.

<code-example path="deprecation-guide/src/app/app.component.html" region="valid-template-bind"></code-example>

<a id="binding-to-innertext"></a>

### Binding to `innerText` in `platform-server`

[Domino](https://github.com/fgnass/domino), which is used in server-side rendering, doesn't support `innerText`, so in platform-server's *domino adapter*, there was special code to fall back to `textContent` if you tried to bind to `innerText`.

These two properties have subtle differences, so switching to `textContent` under the hood can be surprising to users.
For this reason, we are deprecating this behavior.
Going forward, users should explicitly bind to `textContent` when using Domino.

<a id="wtf-apis"></a>

### `wtfStartTimeRange` and all `wtf*` APIs

All of the `wtf*` APIs are deprecated and will be removed in a future version.

<a id="entryComponents"></a>

### `entryComponents` and `ANALYZE_FOR_ENTRY_COMPONENTS` no longer required

Previously, the `entryComponents` array in the `NgModule` definition was used to tell the compiler which components would be created and inserted dynamically.
With Ivy, this isn't a requirement anymore and the `entryComponents` array can be removed from existing module declarations.
The same applies to the `ANALYZE_FOR_ENTRY_COMPONENTS` injection token.

<div class="alert is-helpful">

**NOTE**: <br />
You may still need to keep these if building a library that will be consumed by a View Engine application.

</div>

<a id="moduleWithProviders"></a>

### `ModuleWithProviders` type without a generic

Some Angular libraries, such as `@angular/router` and `@ngrx/store`, implement APIs that return a type called `ModuleWithProviders` \(typically using a method named `forRoot()`\).
This type represents an `NgModule` along with additional providers.
Angular version 9 deprecates use of `ModuleWithProviders` without an explicitly generic type, where the generic type refers to the type of the `NgModule`.
In a future version of Angular, the generic will no longer be optional.

If you're using the CLI, `ng update` should [migrate your code automatically](guide/migration-module-with-providers).
If you're not using the CLI, you can add any missing generic types to your application manually.
For example:

**Before**:

<code-example path="deprecation-guide/src/app/app.module.ts" language="typescript" region="ModuleWithProvidersNonGeneric"></code-example>

**After**:

<code-example path="deprecation-guide/src/app/app.module.ts" language="typescript" region="ModuleWithProvidersGeneric"></code-example>

<!--

### Internet Explorer 11

Angular support for Microsoft's Internet Explorer 11 \(IE11\) is deprecated and will be removed in Angular v13.
Ending IE11 support allows Angular to take advantage of web platform APIs present only in evergreen browsers, resulting in better APIs for developers and more capabilities for application users.
An additional motivation behind this removal is the drop in global usage of IE11 to just ~1% \(as of March 2021\).
For full rationale and discussion behind this deprecation, see [RFC: Internet Explorer 11 support deprecation and removal](https://github.com/angular/angular/issues/41840).

<div class="alert is-helpful">

**NOTE**: <br />
IE11 will be supported in Angular v12 LTS releases through November 2022.

</div>

-->

<a id="input-setter-coercion"></a>

### Input setter coercion

Since the `strictTemplates` flag has been introduced in Angular, the compiler has been able to type-check input bindings to the declared input type of the corresponding directive.
When a getter/setter pair is used for the input, the setter might need to accept more types than the getter returns, such as when the setter first converts the input value.
However, until TypeScript 4.3 a getter/setter pair was required to have identical types so this pattern could not be accurately declared.

To mitigate this limitation, it was made possible to declare [input setter coercion fields](guide/template-typecheck#input-setter-coercion) in directives that are used when type-checking input bindings.
However, since [TypeScript 4.3](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-3.html#separate-write-types-on-properties) the limitation has been removed; setters can now accept a wider type than what is returned by the getter.
This means that input coercion fields are no longer needed, as their effects can be achieved by widening the type of the setter.

For example, the following directive:

<code-example path="deprecation-guide/src/app/submit-button/submit-button.component.ts" language="typescript" region="submitButtonNarrow"></code-example>

can be refactored as follows:

<code-example path="deprecation-guide/src/app/submit-button/submit-button.component.ts" language="typescript" region="submitButton"></code-example>

<a id="full-template-type-check"></a>

### `fullTemplateTypeCheck`

When compiling your application using the AOT compiler, your templates are type-checked according to a certain strictness level.
Before Angular 9 there existed only two strictness levels of template type checking as determined by [the `fullTemplateTypeCheck` compiler option](guide/angular-compiler-options).
In version 9 the `strictTemplates` family of compiler options has been introduced as a more fine-grained approach to configuring how strict your templates are being type-checked.

The `fullTemplateTypeCheck` flag is being deprecated in favor of the new `strictTemplates` option and its related compiler options.
Projects that currently have `fullTemplateTypeCheck: true` configured can migrate to the following set of compiler options to achieve the same level of type-checking:

<code-example language="json" header="tsconfig.app.json">

{
  "angularCompilerOptions": {
    &hellip;
    "strictTemplates": true,
    "strictInputTypes": false,
    "strictNullInputTypes": false,
    "strictAttributeTypes": false,
    "strictOutputEventTypes": false,
    "strictDomEventTypes": false,
    "strictDomLocalRefTypes": false,
    "strictSafeNavigationTypes": false,
    "strictContextGenerics": false,
    &hellip;
  }
}

</code-example>

<a id="jit-api-changes"></a>

## JIT API changes due to ViewEngine deprecation

In ViewEngine, [JIT compilation](https://angular.io/guide/glossary#jit) required special providers \(such as `Compiler` or `CompilerFactory`\) to be injected in the app and corresponding methods to be invoked.
With Ivy, JIT compilation takes place implicitly if the Component, NgModule, etc. have not already been [AOT compiled](https://angular.io/guide/glossary#aot).
Those special providers were made available in Ivy for backwards-compatibility with ViewEngine to make the transition to Ivy smoother.
Since ViewEngine is deprecated and will soon be removed, those symbols are now deprecated as well.

<div class="alert is-important">

**IMPORTANT**: <br />
this deprecation doesn't affect JIT mode in Ivy \(JIT remains available with Ivy, however we are exploring a possibility of deprecating it in the future.
See [RFC: Exploration of use-cases for Angular JIT compilation mode](https://github.com/angular/angular/issues/43133)\).

</div>

<a id="testrequest-errorevent"></a>

### `TestRequest` accepting `ErrorEvent`

Angular provides utilities for testing `HttpClient`.
The `TestRequest` class from `@angular/common/http/testing` mocks HTTP request objects for use with `HttpTestingController`.

`TestRequest` provides an API for simulating an HTTP response with an error.
In earlier versions of Angular, this API accepted objects of type `ErrorEvent`, which does not match the type of error event that browsers return natively.
If you use `ErrorEvent` with `TestRequest`, you should switch to `ProgressEvent`.

Here is an example using a `ProgressEvent`:

<code-example format="typescript" language="typescript">

const mockError = new ProgressEvent('error');
const mockRequest = httpTestingController.expectOne(..);

mockRequest.error(mockError);

</code-example>

<a id="deprecated-cli-flags"></a>

## Deprecated CLI APIs and Options

This section contains a complete list all of the currently deprecated CLI flags.

### &commat;angular-devkit/build-angular

| API/Option                 | May be removed in | Details |
|:---                        |:---               |:---     |
| `deployUrl`                | <!--v13--> v15    | Use `baseHref` option, `APP_BASE_HREF` DI token or a combination of both instead. For more information, see [the deploy url](guide/deployment#the-deploy-url). |
| Protractor builder         | <!--v12--> v14    | Deprecate as part of the Protractor deprecation.                                                                                                               |

<a id="removed"></a>

## Removed APIs

The following APIs have been removed starting with version 11.0.0&ast;:

| Package           | API                   | Replacement                                                                | Details |
|:---               |:---                   |:---                                                                        |:---     |
| `@angular/router` | `preserveQueryParams` | [`queryParamsHandling`](api/router/UrlCreationOptions#queryParamsHandling) |         |

&ast; To see APIs removed in version 10, check out this guide on the [version 10 docs site](https://v10.angular.io/guide/deprecations#removed).

<a id="style-sanitization"></a>

### Style Sanitization for `[style]` and `[style.prop]` bindings

Angular used to sanitize `[style]` and `[style.prop]` bindings to prevent malicious code from being inserted through `javascript:` expressions in CSS `url()` entries.
However, most modern browsers no longer support the usage of these expressions, so sanitization was only maintained for the sake of IE 6 and 7.
Given that Angular does not support either IE 6 or 7 and sanitization has a performance cost, we will no longer sanitize style bindings as of version 10 of Angular.

### `loadChildren` string syntax in `@angular/router`

It is no longer possible to use the `loadChildren` string syntax to configure lazy routes.
The string syntax has been replaced with dynamic import statements.
The `DeprecatedLoadChildren` type was removed from `@angular/router`.
Find more information about the replacement in the [`LoadChildrenCallback` documentation](api/router/LoadChildrenCallback).

The supporting classes `NgModuleFactoryLoader`, `SystemJsNgModuleLoader`, and `SystemJsNgModuleLoaderConfig` were removed from `@angular/core`, as well as `SpyNgModuleFactoryLoader` from `@angular/router`.

### `WrappedValue`

The purpose of `WrappedValue` was to allow the same object instance to be treated as different for the purposes of change detection.
It was commonly used with the `async` pipe in the case where the `Observable` produces the same instance of the value.

Given that this use case is relatively rare and special handling impacted application performance, the `WrappedValue` API has been removed in Angular 13.

If you rely on the behavior that the same object instance should cause change detection, you have two options:

*   Clone the resulting value so that it has a new identity
*   Explicitly call [`ChangeDetectorRef.detectChanges()`](api/core/ChangeDetectorRef#detectchanges) to force the update

<!-- links -->

[AioGuideI18nCommonMergeDefineLocalesInTheBuildConfiguration]: guide/i18n-common-merge#define-locales-in-the-build-configuration "Define locales in the build configuration - Common Internationalization task #6: Merge translations into the application | Angular"

<!-- end links -->

@reviewed 2022-02-28
