<!--
# Deprecated APIs and features
-->
# 지원이 중단된 기능

<!--
Angular strives to balance innovation and stability.
Sometimes, APIs and features become obsolete and need to be removed or replaced so that Angular can stay current with new best practices, changing dependencies, or changes in the (web) platform itself.

To make these transitions as easy as possible, we deprecate APIs and features for a period of time before removing them. This gives you time to update your apps to the latest APIs and best practices.

This guide contains a summary of all Angular APIs and features that are currently deprecated.
-->
Angular는 혁신과 안정성 사이에서 균형을 추구합니다.
그래서 특정 API나 기능이 더이상 필요없다면 이 기능을 제거하거나 다른 기능으로 대체하면서 누구나 Angular를 최선의 방식으로 활용할 수 있도록 관리하고 있습니다. 가끔은 의존성 패키지가 변경되거나 플랫폼과 관련된 기능이 변경되기도 합니다.

이런 변화를 자연스럽게 도입할 수 있도록 지원이 중단되는 기능이나 API는 Angular에서 바로 제거되지 않고 약간 시간 여유를 둔 후에 제거됩니다. 지원이 중단되는 것으로 결정된 기능이 있다면 이 기간을 이용해서 더 나은 방식으로 변경하는 것이 좋습니다.

이 문서는 Angular가 제공하던 기능이나 API 중에서 지금은 지원이 중단된 기능에 대해 안내합니다.

<div class="alert is-helpful">

<!--
Features and APIs that were deprecated in v6 or earlier are candidates for removal in version 9 or any later major version. For information about Angular's deprecation and removal practices, see [Angular Release Practices](guide/releases#deprecation-practices "Angular Release Practices: Deprecation practices").

For step-by-step instructions on how to update to the latest Angular release, use the interactive update guide at [update.angular.io](https://update.angular.io).
-->
Angular 6 버전까지 지원이 중단되기로 계획되었던 기능들은 Angular 9 버전부터 완전히 제거됩니다. 자세한 내용은 [Angular의 릴리즈 정책](guide/releases#deprecation-practices "Angular의 릴리즈 정책: 지원이 중단되는 기능") 문서를 참고하세요.

그리고 지원이 중단되는 기능을 단계별로 수정하는 방법에 대해 알아보려면 [update.angular.io](https://update.angular.io) 가이드를 참고하세요.

</div>

<!--
## Index
-->
## 목차

<!--
To help you future-proof your apps, the following table lists all deprecated APIs and features, organized by the release in which they are candidates for removal. Each item is linked to the section later in this guide that describes the deprecation reason and replacement options.
-->
이 문서에서 설명하는 기능이나 API는 모두 지원이 중단됩니다. 각각의 링크를 클릭해서 해당 기능이 왜 없어지는지, 어떻게 변경되는지 확인해 보세요.

<!--
deprecation -> removal cheat sheet
v4 - v7
v5 - v8
v6 - v9
v7 - v10
v8 - v11
v9 - v12
-->


| Area                          | API or Feature                                                                | May be removed in |
| ----------------------------- | ---------------------------------------------------------------------------   | ----------------- |
| `@angular/common`             | [`ReflectiveInjector`](#reflectiveinjector)                                   | <!--v8--> v10 |
| `@angular/common`             | [`CurrencyPipe` - `DEFAULT_CURRENCY_CODE`](api/common/CurrencyPipe#currency-code-deprecation) | <!--v9--> v11 |
| `@angular/core`               | [`CollectionChangeRecord`](#core)                                             | <!--v7--> v10 |
| `@angular/core`               | [`DefaultIterableDiffer`](#core)                                              | <!--v7--> v10 |
| `@angular/core`               | [`ReflectiveKey`](#core)                                                      | <!--v8--> v10 |
| `@angular/core`               | [`RenderComponentType`](#core)                                                | <!--v7--> v10 |
| `@angular/core`               | [`ViewEncapsulation.Native`](#core)                                           | <!--v6--> v10 |
| `@angular/core`               | [`ModuleWithProviders` without a generic](#moduleWithProviders)               | <!--v9--> v10 |
| `@angular/core`               | [Undecorated base classes that use Angular features](#undecorated-base-classes) | <!--v9--> v10 |
| `@angular/forms`              | [`ngModel` with reactive forms](#ngmodel-reactive)                            | <!--v6--> v10 |
| `@angular/router`             | [`preserveQueryParams`](#router)                                              | <!--v7--> v10 |
| `@angular/upgrade`            | [`@angular/upgrade`](#upgrade)                                                | <!--v8--> v10 |
| `@angular/upgrade`            | [`getAngularLib`](#upgrade-static)                                            | <!--v8--> v10 |
| `@angular/upgrade`            | [`setAngularLib`](#upgrade-static)                                            | <!--v8--> v10 |
| `@angular/platform-webworker` | [All entry points](api/platform-webworker)                                    | <!--v8--> v10 |
| template syntax               | [`<template`>](#template-tag)                                                 | <!--v7--> v10 |
| polyfills                     | [reflect-metadata](#reflect-metadata)                                         | <!--v8--> v10 |
| npm package format            | [`esm5` and `fesm5` entry-points in @angular/* npm packages](guide/deprecations#esm5-fesm5) | <!-- v9 --> v10 |
| `@angular/core`               | [`defineInjectable`](#core)                                                   | <!--v8--> v11 |
| `@angular/core`               | [`entryComponents`](api/core/NgModule#entryComponents)                        | <!--v9--> v11 |
| `@angular/core`               | [`ANALYZE_FOR_ENTRY_COMPONENTS`](api/core/ANALYZE_FOR_ENTRY_COMPONENTS)       | <!--v9--> v11 |
| `@angular/router`             | [`loadChildren` string syntax](#loadChildren)                                 | <!--v9--> v11 |
| `@angular/core/testing`       | [`TestBed.get`](#testing)                                                     | <!--v9--> v12 |
| `@angular/router`             | [`ActivatedRoute` params and `queryParams` properties](#activatedroute-props) | unspecified |
| template syntax               | [`/deep/`, `>>>`, and `::ng-deep`](#deep-component-style-selector)            | <!--v7--> unspecified |




{@a deprecated-apis}
<!--
## Deprecated APIs
-->
## 지원이 중단된 API

<!--
This section contains a complete list all of the currently-deprecated APIs, with details to help you plan your migration to a replacement.
-->
이 섹션에서는 지금까지 지원이 중단된 API에 대해 소개하고, 이 API를 사용하고 있다면 어떻게 수정하면 되는지 안내합니다.


<div class="alert is-helpful">

<!--
Tip: In the [API reference section](api) of this doc site, deprecated APIs are indicated by ~~strikethrough.~~ You can filter the API list by [**Status: deprecated**](api?status=deprecated).
-->
팁: [API 스펙](api) 문서에서 지원이 중단된 API는 ~~취소선~~으로 표시됩니다. 그리고 해당 문서에서 지원이 중단된 기능만 보려면 [**Status: deprecated**](api?status=deprecated)를 선택하면 됩니다.

</div>

{@a common}
### @angular/common

| API                                                                                           | Replacement                                         | Deprecation announced | Notes |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------- | --------------------- | ----- |
| [`CurrencyPipe` - `DEFAULT_CURRENCY_CODE`](api/common/CurrencyPipe#currency-code-deprecation) | `{provide: DEFAULT_CURRENCY_CODE, useValue: 'USD'}` | v9                    | From v11 the default code will be extracted from the locale data given by `LOCAL_ID`, rather than `USD`. |


{@a core}
### @angular/core

| API | Replacement | Deprecation announced | Notes |
| --- | ----------- | --------------------- | ----- |
| [`CollectionChangeRecord`](api/core/CollectionChangeRecord) | [`IterableChangeRecord`](api/core/IterableChangeRecord) | v4 | none |
| [`DefaultIterableDiffer`](api/core/DefaultIterableDiffer) | n/a | v4 | Not part of public API. |
| [`ReflectiveInjector`](api/core/ReflectiveInjector) | [`Injector.create`](api/core/Injector#create)  | v5 | See [`ReflectiveInjector`](#reflectiveinjector) |
| [`ReflectiveKey`](api/core/ReflectiveKey) | none | v5 | none |
| [`ViewEncapsulation.Native`](api/core/ViewEncapsulation#Native) | [`ViewEncapsulation.ShadowDom`](api/core/ViewEncapsulation#ShadowDom) | v6 | Use the native encapsulation mechanism of the renderer. See [view.ts](https://github.com/angular/angular/blob/3e992e18ebf51d6036818f26c3d77b52d3ec48eb/packages/core/src/metadata/view.ts#L32).
| [`defineInjectable`](api/core/defineInjectable) | `ɵɵdefineInjectable` | v8 | Used only in generated code. No source code should depend on this API. |
| [`entryComponents`](api/core/NgModule#entryComponents) | none | v9 | See [`entryComponents`](#entryComponents) |
| [`ANALYZE_FOR_ENTRY_COMPONENTS`](api/core/ANALYZE_FOR_ENTRY_COMPONENTS) | none | v9 | See [`ANALYZE_FOR_ENTRY_COMPONENTS`](#entryComponents) |
| `ModuleWithProviders` without a generic |  `ModuleWithProviders` with a generic             | v9 | See [`ModuleWithProviders` section](#moduleWithProviders) |
| Undecorated base classes that use Angular features | Base classes with `@Directive()` decorator that use Angular features | v9 | See [undecorated base classes section](#undecorated-base-classes) |






{@a testing}
### @angular/core/testing

| API | Replacement | Deprecation announced | Notes |
| --- | ----------- | --------------------- | ----- |
| [`TestBed.get`](api/core/testing/TestBed#get) | [`TestBed.inject`](api/core/testing/TestBed#inject) | v9 | Same behavior, but type safe. |


{@a forms}
### @angular/forms

| API | Replacement | Deprecation announced | Notes |
| --- | ----------- | --------------------- | ----- |
| [`ngModel` with reactive forms](#ngmodel-reactive) | See [FormControlDirective usage notes](api/forms/FormControlDirective#use-with-ngmodel) | v6 | none |

{@a router}
### @angular/router

<!--
| API | Replacement | Deprecation announced | Notes |
| --- | ----------- | --------------------- | ----- |
| [`preserveQueryParams`](api/router/NavigationExtras#preserveQueryParams) | [`queryParamsHandling`](api/router/NavigationExtras#queryParamsHandling) | v4 | none |
-->
| API | 대체 기능 | 지원 중단 발표 | 참고 |
| --- | ----------- | --------------------- | ----- |
| [`preserveQueryParams`](api/router/NavigationExtras#preserveQueryParams) | [`queryParamsHandling`](api/router/NavigationExtras#queryParamsHandling) | v4 | 없음 |

{@a platform-webworker}
### @angular/platform-webworker

<!--
| API | Replacement | Deprecation announced | Notes |
| --- | ----------- | --------------------- | ----- |
| [All entry points](api/platform-webworker) | none | v8 | See [platform-webworker](#webworker-apps). |
-->
| API | 대체 기능 | 지원 중단 발표 | 참고 |
| --- | ----------- | --------------------- | ----- |
| [모든 API](api/platform-webworker) | 없음 | v8 | [platform-webworker](#webworker-apps) 참고 |

{@a platform-webworker-dynamic}
### @angular/platform-webworker-dynamic

<!--
| API | Replacement | Deprecation announced | Notes |
| --- | ----------- | --------------------- | ----- |
| [All entry points](api/platform-webworker-dynamic) | none | v8 | See [platform-webworker](#webworker-apps). |
-->
| API | 대체 긱능 | 지원 중단 발표 | 참고 |
| --- | ----------- | --------------------- | ----- |
| [모든 API](api/platform-webworker-dynamic) | 없음 | v8 | [platform-webworker](#webworker-apps) 참고 |

{@a upgrade}
### @angular/upgrade

<!--
| API | Replacement | Deprecation announced | Notes |
| --- | ----------- | --------------------- | ----- |
| [All entry points](api/upgrade) | [`@angular/upgrade/static`](api/upgrade/static) | v5 | See [Upgrading from AngularJS](guide/upgrade). |
-->
| API | 대체 기능 | 지원 중단 발표 | 참고 |
| --- | ----------- | --------------------- | ----- |
| [모든 API](api/upgrade) | [`@angular/upgrade/static`](api/upgrade/static) | v5 | [AngularJS 앱 업그레이드하기](guide/upgrade) 참고 |

{@a upgrade-static}
### @angular/upgrade/static

<!--
| API | Replacement | Deprecation announced | Notes |
| --- | ----------- | --------------------- | ----- |
| [`getAngularLib`](api/upgrade/static/getAngularLib) | [`getAngularJSGlobal`](api/upgrade/static/getAngularJSGlobal) | v5 | See [Upgrading from AngularJS](guide/upgrade). |
[`setAngularLib`](api/upgrade/static/setAngularLib) | [`setAngularJSGlobal`](api/upgrade/static/setAngularJSGlobal) | v5 | See [Upgrading from AngularJS](guide/upgrade). |
-->
| API | 대체 기능 | 지원 중단 발표 | 참고 |
| --- | ----------- | --------------------- | ----- |
| [`getAngularLib`](api/upgrade/static/getAngularLib) | [`getAngularJSGlobal`](api/upgrade/static/getAngularJSGlobal) | v5 | [AngularJS 앱 업그레이드하기](guide/upgrade) 참고 |
[`setAngularLib`](api/upgrade/static/setAngularLib) | [`setAngularJSGlobal`](api/upgrade/static/setAngularJSGlobal) | v5 | [AngularJS 앱 업그레이드하기](guide/upgrade) 참고 |

{@a deprecated-features}
<!--
## Deprecated features
-->
## 지원이 중단된 기능

<!--
This section lists all of the currently-deprecated features, which includes template syntax, configuration options, and any other deprecations not listed in the [Deprecated APIs](#deprecated-apis) section above. It also includes deprecated API usage scenarios or API combinations, to augment the information above.
-->
이 섹션에서는 템플릿 문법, 환경설정 옵션 등 [지원이 중단된 API](#deprecated-apis)에 다루지 않았던 지원 중단 기능에 대해 안내합니다. 그리고 이 섹션에서는 좀 더 복잡한 시나리오에 사용하는 API나 여러 API를 조합해서 사용하는 API 중 이제는 지원이 중단된 API에 대해서도 설명합니다.


{@a wtf}
<!--
### Web Tracing Framework integration
-->
### 웹 트레이싱 프레임워크 지원

Angular previously has supported an integration with the [Web Tracing Framework (WTF)](https://google.github.io/tracing-framework/) for performance testing of Angular applications. This integration has not been maintained and defunct. As a result, the integration was deprecated in Angular version 8 and due to no evidence of any existing usage removed in version 9.


{@a deep-component-style-selector}
<!--
### `/deep/`, `>>>` and `:ng-deep` component style selectors
-->
### 컴포넌트 스타일 셀렉터: `/deep/`, `>>>`, `:ng-deep`

<!--
The shadow-dom-piercing descendant combinator is deprecated and support is being [removed from major browsers and tools](https://developers.google.com/web/updates/2017/10/remove-shadow-piercing). As such, in v4 we deprecated support in Angular for all 3 of `/deep/`, `>>>` and `::ng-deep`. Until removal, `::ng-deep` is preferred for broader compatibility with the tools.

For more information, see [/deep/, >>>, and ::ng-deep](guide/component-styles#deprecated-deep--and-ng-deep "Component Styles guide, Deprecated deep and ngdeep")
 in the Component Styles guide.
-->
섀도우 DOM 안쪽으로 자식 엘리먼트를 선택하는 셀렉터는 [최신 브라우저에서 지원하지 않기 때문에 제거되었습니다](https://developers.google.com/web/updates/2017/10/remove-shadow-piercing). 이에 따라 Angular 3 버전에 존재하던 `/deep/`과 `>>>`, `::ng-deep`은 모두 Angular 4버전부터 지원이 중단되는 것으로 계획되었습니다. 다만, 지원이 중단되기 전까지 이 기능이 꼭 필요하다면 이 중에서는 `::ng-deep`을 사용하는 것을 권장합니다.

더 자세한 내용은 컴포넌트 스타일 가이드 문서의 [/deep/, >>>, ::ng-deep](guide/component-styles#deprecated-deep--and-ng-deep "Component Styles guide, Deprecated deep and ngdeep") 섹션을 참고하세요.

{@a template-tag}
<!--
### &lt;template&gt; tag
-->
### &lt;template&gt; 태그

The `<template>` tag was deprecated in v4 to avoid colliding with the DOM's element of the same name (such as when using web components). Use `<ng-template>` instead. For more information, see the [Ahead-of-Time Compilation](guide/angular-compiler-options#enablelegacytemplate) guide.



{@a ngmodel-reactive}
<!--
### ngModel with reactive forms
-->
### 반응형 폼에 사용하는 ngModel

<!--
Support for using the `ngModel` input property and `ngModelChange` event with reactive form directives was deprecated in version 6.

For more information, see the usage notes for [`FormControlDirective`](api/forms/FormControlDirective#use-with-ngmodel) and [`FormControlName`](api/forms/FormControlName#use-with-ngmodel).
-->
반응형 폼에서 입력 프로퍼티로 사용하는 `ngModel`과 `ngModelChange` 이벤트는 Angular 6버전부터 더이상 사용하지 않습니다.

자세한 내용은 [`FormControlDirective`](api/forms/FormControlDirective#use-with-ngmodel)와 [`FormControlName`](api/forms/FormControlName#use-with-ngmodel) 문서를 참고하세요.

{@a reflectiveinjector}
### ReflectiveInjector

<!--
In v5, Angular replaced the `ReflectiveInjector` with the `StaticInjector`. The injector no longer requires the Reflect polyfill, reducing application size for most developers.

Before:
-->
Angular 5버전부터 `ReflectiveInjector`가 `StaticInjector`로 변경되었습니다. 그 결과로 이제는 더이상 Reflect 폴리필이 사용되지 않기 때문에 Angular 애플리케이션의 빌드 결과물 크기도 더 작아졌습니다.

이전에는 이렇게 사용했습니다:

```
ReflectiveInjector.resolveAndCreate(providers);
```

<!--
After:
-->
이제는 이렇게 사용합니다:

```
Injector.create({providers});
```

{@a loadChildren}
<!--
### loadChildren string syntax
-->
### loadChildren 문법

<!--
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
-->
Angular에 지연 라우팅이 처음 등장했을 때는 브라우저가 JavaScript 리소스를 추가로, 동적으로 로딩하는 기능이 없었습니다. 그래서 Angular는 이 기능을 구현하기 위해 독자적으로 `loadChildren: './lazy/lazy.module#LazyModule'`와 같은 문법을 만들어냈습니다. 하지만 이제는 ECMAScript의 동적 로딩 기능을 브라우저 계층에서 지원하는 경우가 많아졌습니다. 그래서 Angular도 이전 방식 대신 새로운 방식을 활용하기로 결정했습니다.

Angular 8 버전부터는 이전까지 사용하던 [`loadChildren`](api/router/LoadChildren) 문법을 사용하지 않고, `import()`를 사용합니다.

이전에는 이렇게 사용했습니다:

```
const routes: Routes = [{
  path: 'lazy',
  // loadChildren에 문자열을 사용해서 지연로딩하는 문법은 이제 사용하지 않습니다.
  loadChildren: './lazy/lazy.module#LazyModule'
}];
```

<!--
After:

```
const routes: Routes = [{
  path: 'lazy',
  // The new import() syntax
  loadChildren: () => import('./lazy/lazy.module').then(m => m.LazyModule)
}];
```
-->
이제는 이렇게 사용합니다:

```
const routes: Routes = [{
  path: 'lazy',
  // 이제는 import() 문법을 사용합니다.
  loadChildren: () => import('./lazy/lazy.module').then(m => m.LazyModule)
}];
```


<div class="alert is-helpful">


<!--
**Version 8 update**: When you update to version 8, the [`ng update`](cli/update) command performs the transformation automatically. Prior to version 7, the `import()` syntax only works in JIT mode (with view engine).
-->
**8 버전으로 업데이트하기**: Angular를 8버전으로 올리기 위해 [`ng update`](cli/update) 명령을 실행하면 `loadChildren`으로 지연로딩하던 문법이 자동으로 수정됩니다. 7버전까지는 `import()` 문법이 JIT 모드에서만 동작했습니다.

</div>

<div class="alert is-helpful">

<!--
**Declaration syntax**: It's important to follow the route declaration syntax `loadChildren: () => import('...').then(m => m.ModuleName)` to allow `ngc` to discover the lazy-loaded module and the associated `NgModule`. You can find the complete list of allowed syntax constructs [here](https://github.com/angular/angular-cli/blob/a491b09800b493fe01301387fa9a025f7c7d4808/packages/ngtools/webpack/src/transformers/import_factory.ts#L104-L113). These restrictions will be relaxed with the release of Ivy since it'll no longer use `NgFactories`.
-->
**선언형 문법(declaration syntax)**: `loadChildren` 프로퍼티를 사용해서 모듈을 지연로딩 하려면 `loadChildren: () => import('...').then(m => m.ModuleName)`와 같은 문법을 사용해야 `ngc`가 해당 모듈을 제대로 로드할 수 있습니다. 이 때 사용할 수 있는 문법에 대해서는 [이 문서](https://github.com/angular/angular-cli/blob/a491b09800b493fe01301387fa9a025f7c7d4808/packages/ngtools/webpack/src/transformers/import_factory.ts#L104-L113)를 참고하세요. 문법이 한정되어 있어서 개발자에게는 제약인 것처럼 느낄 수 있지만, 이 방식은 `NgFactories`를 사용하지 않기 때문에 Ivy를 도입하는 측면에서는 더 유리합니다.

</div>



{@a activatedroute-props}
<!--
### ActivatedRoute params and queryParams properties
-->
### ActivatedRoute 객체의 params와 queryParams 프로퍼티

<!--
[ActivatedRoute](api/router/ActivatedRoute) contains two [properties](api/router/ActivatedRoute#properties) that are less capable than their replacements and may be deprecated in a future Angular version.

| Property | Replacement |
| -------- | ----------- |
| `params` | `paramMap` |
| `queryParams` | `queryParamMap` |

For more information see the [Router guide](guide/router#activated-route).
-->
[ActivatedRoute](api/router/ActivatedRoute)에 있던 [프로퍼티](api/router/ActivatedRoute#properties) 중에서 자주 사용되지 않던 프로퍼티가 다른 타입의 프로퍼티로 대체되었습니다.

| 프로퍼티 | 대체 프로퍼티 |
| -------- | ----------- |
| `params` | `paramMap` |
| `queryParams` | `queryParamMap` |

자세한 내용은 [라우터 가이드 문서](guide/router#activated-route)를 참고하세요.


{@a reflect-metadata}
<!--
### Dependency on a reflect-metadata polyfill in JIT mode
-->
### JIT 모드에서 사용하는 reflect-metadata 폴리필

<!--
Angular applications, and specifically applications that relied on the JIT compiler, used to require a polyfill for the [reflect-metadata](https://github.com/rbuckton/reflect-metadata) APIs.

The need for this polyfill was removed in Angular version 8.0 ([see #14473](https://github.com/angular/angular-cli/pull/14473)), rendering the presence of the poylfill in most Angular applications unnecessary. Because the polyfill can be depended on by 3rd-party libraries, instead of removing it from all Angular projects, we are deprecating the requirement for this polyfill as of version 8.0. This should give library authors and application developers sufficient time to evaluate if they need the polyfill, and perform any refactoring necessary to remove the dependency on it.

In a typical Angular project, the polyfill is not used in production builds, so removing it should not impact production applications. The goal behind this removal is overall simplification of the build setup and decrease in the number of external dependencies.
-->
Angular 애플리케이션과 같이 JIT 컴파일러를 사용하는 애플리케이션은 [reflect-metadata](https://github.com/rbuckton/reflect-metadata) API를 사용하기 위해 폴리필이 필요했습니다.

이 폴리필은 Angular 8.0 버전부터 사용하지 않지만([#14473 참고](https://github.com/angular/angular-cli/pull/14473)), 서드파티 패키지에 의존성이 있었기 때문에 제거하지는 않았습니다. 이 버전에서는 단순하게 Angular가 직접 사용하는 reflect-metadata 관련 코드를 제거했을 뿐입니다. 당분간 이 패키지는 그대로 유지되겠지만 애플리케이션 개발자나 서드파티 라이브러리 개발자는 이 폴리필이 정말 필요한지 판단해보고 사용하지 않는 쪽으로 코드를 리팩토링하는 것이 나을 수 있습니다.

Angular 프로젝트를 운영용으로 빌드하더라도 폴리필이 사용되는 경우는 그리 많지 않기 때문에 이 폴리필이 제거되더라도 애플리케이션을 운영하는 데에는 큰 영향이 없습니다. 하지만 빌드 단계를 조금 더 단순하게 줄이고 외부 의존성을 정리하기 위해서는 최종적으로 폴리필을 제거하는 것이 좋습니다.

{@a static-query-resolution}
<!--
### `@ViewChild()` / `@ContentChild()` static resolution as the default
-->
### `@ViewChild()`, `@ContentChild()` 정적 평가

<!--
See the [dedicated migration guide for static queries](guide/static-query-migration).
-->
[정적 쿼리 적용 가이드 문서](guide/static-query-migration)를 참고하세요.

{@a contentchild-input-together}
<!--
### `@ContentChild()` / `@Input()` used together
-->
### `@ContentChild()`와 `@Input()`을 함께쓰는 문법

<!--
The following pattern is deprecated:
-->
다음과 같이 사용하던 패턴은 더이상 사용되지 않습니다:

```ts
@Input() @ContentChild(TemplateRef) tpl !: TemplateRef<any>;
```

<!--
Rather than using this pattern, separate the two decorators into their own
properties and add fallback logic as in the following example:
-->
이 방법보다는 두 데코레이터를 따로 나눠서 다음과 같이 구현하는 것이 좋습니다:

```ts
@Input() tpl !: TemplateRef<any>;
@ContentChild(TemplateRef) inlineTemplate !: TemplateRef<any>;
```
{@a cant-assign-template-vars}
<!--
### Cannot assign to template variables
-->
### 템플릿 변수에 값을 직접 할당할 수 없습니다.

<!--
In the following example, the two-way binding means that `optionName`
should be written when the `valueChange` event fires.
-->
아래와 같이 작성된 코드가 있다면, 이 코드는 `valueChange` 이벤트가 발생했을 때 `optionName`의 값이 변경된다는 양방향 바인딩을 의미합니다.

```html
<option *ngFor="let optionName of options" [(value)]="optionName"></option>
```

<!--
However, in practice, Angular simply ignores two-way bindings to template variables. Starting in version 8, attempting to write to template variables is deprecated. In a future version, we will throw to indicate that the write is not supported.
-->
하지만 Angular는 템플릿 변수가 양방향 바인딩으로 연결되되더라도 템플릿 변수에 값을 할당하는 로직은 처리하지 않습니다. 그리고 이제 Angular 8 버전부터는 템플릿 변수에 값을 할당하는 로직 자체를 작성할 수 없습니다. 이 코드는 다음과 같이 작성되어야 하며, 이 코드를 그대로 남겨둔다면 이후 버전에서는 에러가 발생할 수도 있습니다.

```html
<option *ngFor="let optionName of options" [value]="optionName"></option>
```

{@a undecorated-base-classes}
### Undecorated base classes using Angular features

As of version 9, it's deprecated to have an undecorated base class that:

- uses Angular features
- is extended by a directive or component

Angular lifecycle hooks or any of the following Angular field decorators are considered Angular features:

- `@Input()`
- `@Output()`
- `@HostBinding()`
- `@HostListener()`
- `@ViewChild()` / `@ViewChildren()`
- `@ContentChild()` / `@ContentChildren()`

For example, the following case is deprecated because the base class uses `@Input()` and does not have a class-level decorator:

```ts
class Base {
  @Input()
  foo: string;
}

@Directive(...)
class Dir extends Base {
  ngOnChanges(): void {
    // notified when bindings to [foo] are updated
  }
}
```

In a future version of Angular, this code will start to throw an error.
To fix this example, add a selectorless `@Directive()` decorator to the base class:

```ts
@Directive()
class Base {
  @Input()
  foo: string;
}

@Directive(...)
class Dir extends Base {
  ngOnChanges(): void {
    // notified when bindings to [foo] are updated
  }
}
```

In version 9, the CLI has an automated migration that will update your code for you when `ng update` is run.
See [the dedicated migration guide](guide/migration-undecorated-classes) for more information about the change and more examples.



{@a binding-to-innertext}
<!--
### Binding to `innerText` in `platform-server`
-->
### `platform-server`가 자동으로 변환하던 `innerText` 바인딩

<!--
[Domino](https://github.com/fgnass/domino), which is used in server-side rendering, doesn't support `innerText`, so in platform-server's "domino adapter", there was special code to fall back to `textContent` if you tried to bind to `innerText`.

These two properties have subtle differences, so switching to `textContent` under the hood can be surprising to users. For this reason, we are deprecating this behavior. Going forward, users should explicitly bind to `textContent` when using Domino.
-->
서버 사이드 렌더링에 사용되는 [Domino](https://github.com/fgnass/domino)는 `innerText`를 지원하지 않기 때문에 Domino에 사용된 `innerText`를 자동으로 `textContent`로 변환하는 "domino 어댑터"를 platform-server에서 제공했습니다.

그런데 두 프로퍼티의 동작이 약간 다르기 때문에 `innerText`를 사용한 개발자가 혼란스러울 수 있었습니다. 그래서 앞으로는 Domino에 `innerText`를 사용할 수 없고 명확하게 `textContext`만 사용해서 바인딩하도록 변경되었습니다.

{@a wtf-apis}
<!--
### `wtfStartTimeRange` and all `wtf*` APIs
-->
### `wtfStartTimeRange`와 `wtf`로 시작하는 모든 API

<!--
All of the `wtf*` APIs are deprecated and will be removed in a future version.
-->
`wtf`로 시작하는 모든 API는 앞으로 배포될 버전에 모두 지원이 중단됩니다.

{@a webworker-apps}
<!--
### Running Angular applications in platform-webworker
-->
### Angular 애플리케이션을 platform-webworker로 동작시키기

<!--
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
-->
`@angular/platform-*` 패키지는 Angular 애플리케이션을 다양한 환경에서 실행하기 위해 사용합니다. Angular 앱을 서버에서 실행하려면 `@angular/platform-server` 패키지를 사용하며, Angular 앱을 웹 브라우저에서 실행하려면 `@angular/platform-browser` 패키지를 사용하는 식입니다.

`@angular/platform-webworker`는 Angular 애플리케이션을 [웹 워커](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)로 실행할 때 사용하기 위해 Angular 2 버전부터 도입된 패키지입니다. 그런데 이 실험적인 패키지를 운영해오면서 Angular 팀은 Angular 앱을 통째로 웹 워커로 실행하는 것은 최선의 방법이 아니라는 결론을 내렸습니다.

그래서 이제는 웹 워커를 본연의 목적으로만 사용하기로 결정했습니다. 웹 워커는 CPU 부하가 많이 필요한 로직을 분산하는 역할에 충실하도록 개발 방향을 변경했고, 메모리 탐색이나 이미지 처리와 같이 초기 렌더링에 영향을 주지 않는 용도로만 사용하려고 합니다. 자세한 내용은 [Angular로 웹 워커 활용하기](guide/web-worker) 문서를 참고하세요.

그래서 Angular 8 버전부터는 `platform-webworker` API의 지원이 중단됩니다.
`@angular/platform-webworker`, `@angular/platform-webworker-dynamic` 모두 해당됩니다.
{@a entryComponents}
### `entryComponents` and `ANALYZE_FOR_ENTRY_COMPONENTS` no longer required
Previously, the `entryComponents` array in the `NgModule` definition was used to tell the compiler which components would be created and inserted dynamically. With Ivy, this isn't a requirement anymore and the `entryComponents` array can be removed from existing module declarations. The same applies to the `ANALYZE_FOR_ENTRY_COMPONENTS` injection token.

{@a moduleWithProviders}
### `ModuleWithProviders` type without a generic

Some Angular libraries, such as `@angular/router` and `@ngrx/store`, implement APIs that return a type called `ModuleWithProviders` (typically via a method named `forRoot()`).
This type represents an `NgModule` along with additional providers.
Angular version 9 deprecates use of `ModuleWithProviders` without an explicitly generic type, where the generic type refers to the type of the `NgModule`.
In a future version of Angular, the generic will no longer be optional.


If you're using the CLI, `ng update` should [migrate your code automatically](guide/migration-module-with-providers).
If you're not using the CLI, you can add any missing generic types to your application manually.
For example:

**Before**
```ts
@NgModule({...})
export class MyModule {
  static forRoot(config: SomeConfig): ModuleWithProviders {
    return {
      ngModule: SomeModule,
      providers: [
        {provide: SomeConfig, useValue: config}
      ]
    };
  }
}
```

**After**

```ts
@NgModule({...})
export class MyModule {
  static forRoot(config: SomeConfig): ModuleWithProviders<SomeModule> {
    return {
      ngModule: SomeModule,
      providers: [
        {provide: SomeConfig, useValue: config }
      ]
    };
  }
}
```

{@a esm5-fesm5}
### `esm5` and `fesm5` code formats in @angular/* npm packages

As of Angular v8, the CLI primarily consumes the `fesm2015` variant of the code distributed via `@angular/*` npm packages.
This renders the `esm5` and `fesm5` distributions obsolete and unnecessary, adding bloat to the package size and slowing down npm installations.

The future removal of this distribution will have no impact on CLI users, unless they modified their build configuration to explicitly consume these code distributions.

Any application still relying on the `esm5` and `fesm5` as the input to its build system will need to ensure that the build pipeline is capable of accepting JavaScript code conforming to ECMAScript 2015 (ES2015) language specification.

Note that this change doesn't make existing libraries distributed in this format incompatible with the Angular CLI.
The CLI will fall back and consume libraries in less desirable formats if others are not available.
However, we do recommend that libraries ship their code in ES2015 format in order to make builds faster and build output smaller.

In practical terms, the `package.json` of all `@angular` packages will change in the following way:

**Before**:
```
{
  "name": "@angular/core",
  "version": "9.0.0",
  "main": "./bundles/core.umd.js",
  "module": "./fesm5/core.js",
  "es2015": "./fesm2015/core.js",
  "esm5": "./esm5/core.js",
  "esm2015": "./esm2015/core.js",
  "fesm5": "./fesm5/core.js",
  "fesm2015": "./fesm2015/core.js",
  ...
}
```

**After**:
```
{
  "name": "@angular/core",
  "version": "10.0.0",
  "main": "./bundles/core.umd.js",
  "module": "./fesm2015/core.js",
  "es2015": "./fesm2015/core.js",
  "esm2015": "./esm2015/core.js",
  "fesm2015": "./fesm2015/core.js",
  ...
}
```

For more information about the npm package format, see the [Angular Package Format spec](https://goo.gl/jB3GVv).



{@a removed}
## Removed APIs

The following APIs have been removed starting with version 9.0.0*:

| Package          | API            | Replacement | Notes |
| ---------------- | -------------- | ----------- | ----- |
| `@angular/core`  | [`Renderer`](https://v8.angular.io/api/core/Renderer) | [`Renderer2`](https://angular.io/api/core/Renderer2) | [Migration guide](guide/migration-renderer) |
| `@angular/core`  | [`RootRenderer`](https://v8.angular.io/api/core/RootRenderer) | [`RendererFactory2`](https://angular.io/api/core/RendererFactory2) | none |
| `@angular/core`  | [`RenderComponentType`](https://v8.angular.io/api/core/RenderComponentType) | [`RendererType2`](https://angular.io/api/core/RendererType2) | none |
| `@angular/core`  | [`WtfScopeFn`](https://v8.angular.io/api/core/WtfScopeFn) | none | v8 | See [Web Tracing Framework](#wtf) |
| `@angular/core`  | [`wtfCreateScope`](https://v8.angular.io/api/core/wtfCreateScope) | none | v8 | See [Web Tracing Framework](#wtf) |
| `@angular/core`  | [`wtfStartTimeRange`](https://v8.angular.io/api/core/wtfStartTimeRange) | none | v8 | See [Web Tracing Framework](#wtf) |
| `@angular/core`  | [`wtfEndTimeRange`](https://v8.angular.io/api/core/wtfEndTimeRange) | none | v8 | See [Web Tracing Framework](#wtf) |
| `@angular/core`  | [`wtfLeave`](https://v8.angular.io/api/core/wtfLeave) | none | v8 | See [Web Tracing Framework](#wtf) |
| `@angular/common` | `DeprecatedI18NPipesModule` | [`CommonModule`](api/common/CommonModule#pipes) | none |
| `@angular/common` | `DeprecatedCurrencyPipe` | [`CurrencyPipe`](api/common/CurrencyPipe) | none |
| `@angular/common` | `DeprecatedDatePipe`     | [`DatePipe`](api/common/DatePipe) | none |
| `@angular/common` | `DeprecatedDecimalPipe` | [`DecimalPipe`](api/common/DecimalPipe) | none |
| `@angular/common` | `DeprecatedPercentPipe` | [`PercentPipe`](api/common/PercentPipe) | none |
| `@angular/forms` | [`NgFormSelectorWarning`](https://v8.angular.io/api/forms/NgFormSelectorWarning) | none | none |
| `@angular/forms` | `ngForm` element selector | `ng-form` element selector | none |
| `@angular/service-worker` | `versionedFiles` | `files` | In the service worker configuration file `ngsw-config.json`, replace `versionedFiles` with `files`. See [Service Worker Configuration](guide/service-worker-config#assetgroups). |

*To see APIs removed in version 8, check out this guide on the [version 8 docs site](https://v8.angular.io/guide/deprecations#removed).


<!-- The following anchor is used by redirects from the removed API pages. Do not change or remove. -->
{@a http}
### @angular/http

<!--
Deprecation announced in version 5
https://blog.angular.io/version-5-0-0-of-angular-now-available-37e414935ced)
-->

<!--
The entire [`@angular/http`](http://v7.angular.io/api/http) package has been removed. Use [`@angular/common/http`](api/common/http) instead.

The new API is a smaller, easier, and more powerful way to make HTTP requests in Angular.
The new API simplifies the default ergonomics: There is no need to map by invoking the `.json()` method.
It also supports typed return values and interceptors.

To update your apps:
* Replace `HttpModule` with [`HttpClientModule`](api/common/http/HttpClientModule) (from [`@angular/common/http`](api/common/http)) in each of your modules.
* Replace the `Http` service with the [`HttpClient`](api/common/http/HttpClient) service.
* Remove any `map(res => res.json())` calls. They are no longer needed.

For more information about using `@angular/common/http`, see the [HttpClient guide](guide/http "HTTP Client guide").
-->
[`@angular/http`](http://v7.angular.io/api/http) 패키지는 전부 제거되었습니다. 이제는 이 패키지 대신 [`@angular/common/http`](api/common/http) 패키지를 사용해야 합니다.

새로 도입된 API는 좀 더 간단하고, 사용하기 쉽지만, 좀 더 효율적인 방식으로 HTTP 요청을 처리합니다.
게다가 이제 HTTP 응답으로 받은 데이터를 파싱하기 위해 `.json()`을 직접 호출할 필요가 없습니다.
HTTP 응답이나 인터셉터로 받은 반환값의 타입을 지정할 수도 있습니다.

이 패키지를 적용하려면 다음과 같이 수정하면 됩니다:
* 모듈에 로드하던 `HttpModule` 대신 [`@angular/common/http`](api/common/http) 패키지로 제공되는 [`HttpClientModule`](api/common/http/HttpClientModule)를 로드합니다.
* `Http` 대신 [`HttpClient`](api/common/http/HttpClient)를 의존성으로 주입합니다.
* `map(res => res.json())` 코드를 모두 제거합니다. 이 코드는 더이상 필요없습니다.

`@angular/common/http` 패키지를 사용하는 방법은 [HttpClient](guide/http "HttpClient") 문서를 참고하세요.

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
