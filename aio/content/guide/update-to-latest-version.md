# Update Angular

This guide contains information to update to Angular version 14.

## Update Angular CLI applications

For step-by-step instructions on how to update to the latest Angular release and leverage the Angular automated migration tools, use the interactive update guide at [update.angular.io](https://update.angular.io).

## Changes and deprecations in version 14

<div class="alert is-helpful">

For information about the deprecation and removal practices of Angular, see [Angular Release Practices](guide/releases#deprecation-practices).

</div>

*   **Strictly Typed Reactive Forms**

    The Reactive Forms types `AbstractControl`, `FormControl`, `FormGroup`, and `FormArray` now support a generic parameter which allows for strict typing of the controls. An automatic migration will convert existing usages of these types to special `Untyped` aliases which preserve the existing behavior.

    The `initialValueIsDefault` option for `FormControl` construction has been deprecated in favor of the `nonNullable` option (which has identical behavior). This renaming aligns the `FormControl` constructor with other strictly typed APIs related to nullability.

*   **`ComponentFactory` and `NgModuleFactory` cleanup**

    Many APIs which use either `ComponentFactory` or `NgModuleFactory` have been deprecated and replaced with new APIs that use component or NgModule classes directly.

### Breaking changes in Angular version 14

<a id="breaking-changes"></a>

| | Details |
|:--- |:--- |
| [**PR&nbsp;#45729**](https://github.com/angular/angular/pull/45729) | `initialNavigation: 'enabled'` was deprecated in v11 and is replaced by `initialNavigation: 'enabledBlocking'.`. |
| [**PR&nbsp;#42803**](https://github.com/angular/angular/pull/42803) | Forms `email` input coercion: forms `email` input value will be considered as true if it is defined with any value rather than false and 'false'. |
| [**PR&nbsp;#33729**](https://github.com/angular/angular/pull/33729) | Objects with a length key set to zero will no longer validate as empty. This is technically a breaking change, since objects with a key `length` and value `0` will no longer validate as empty. This is a very minor change, and any reliance on this behavior is probably a bug anyway. |
| [**PR&nbsp;#44921**](https://github.com/angular/angular/pull/44921) | Do not run change detection when loading Hammer. This change may cause unit tests that are implicitly asserting on the specific number or the ordering of change detections to fail. |
| [**PR&nbsp;#23020**](https://github.com/angular/angular/pull/23020) | Parameter types of `TransferState` usage have increased type safety, and this may reveal existing problematic calls. |
| [**PR&nbsp;#43863**](https://github.com/angular/angular/pull/43863) | The type of `Navigation#initialUrl` has been narrowed to `UrlTree` to reflect reality. Additionally, the value for `initialUrl` now matches its documentation: "The target URL passed into the Router#navigateByUrl() call before navigation". Previously, this was incorrectly set to the current internal `UrlTree` of the Router at the time navigation occurs. |
| [**PR&nbsp;#45114**](https://github.com/angular/angular/pull/45114) | The `AnimationDriver.getParentElement` method has become required, so any implementors of this interface are now required to provide an implementation for this method. |
| [**PR&nbsp;#45176**](https://github.com/angular/angular/pull/45176) | The type of `Route.pathMatch` is now more strict. Places that use `pathMatch` will likely need to be updated to have an explicit `Route`/`Routes` type so that TypeScript does not infer the type as `string`. |
| [**PR&nbsp;#44573**](https://github.com/angular/angular/pull/44573) | The router now takes only the first emitted value by the resolvers and then proceeds with navigation. This is now consistent with `Observables` returned by other guards: only the first value is used.|
| [**PR&nbsp;#45394**](https://github.com/angular/angular/pull/45394) | TypeScript versions older than `4.6.0` are no longer supported. |
| [**PR&nbsp;#45210**](https://github.com/angular/angular/pull/45210) | `HttpClient` will throw an error when headers are set on a JSONP request. |
| [**PR&nbsp;#43834**](https://github.com/angular/angular/pull/43834) | Reactive form types such as `FormControl` and `FormGroup` now have generic type parameters and infer stricter types. A migration will convert existing usages to new `Untyped`-prefixed aliases which preserve the existing behavior. |
| [**PR&nbsp;#45487**](https://github.com/angular/angular/pull/45487) | The deprecated `aotSummaries` field in the `TestBed` configuration has been removed. |
| [**PR&nbsp;#45648**](https://github.com/angular/angular/pull/45648) | A new required class member `LocationStrategy#getState` has been added, that any implementers of this interface will need to provide. |
| [**PR&nbsp;#45735**](https://github.com/angular/angular/pull/45735) | When a guard returns a `UrlTree`, the router would previously schedule the redirect navigation within a `setTimeout`. This timeout is now removed, which can result in test failures due to incorrectly written tests. |

### New deprecations

<a id="deprecations"></a>

| Removed | Replacement | Details |
| :--- | :--- |:--- |
| [`FormControlOptions#initialValueIsDefault`](api/forms/FormControlOptions#initialValueIsDefault) | [`FormControlOptions#nonNullable`](api/forms/FormControlOptions#nonNullable) | The `initialValueIsDefault` option for `FormControl` construction has been deprecated in favor of the `nonNullable` option (which has identical behavior). This renaming aligns the `FormControl` constructor with other strictly typed APIs related to nullability. |
| `ErrorEvent`s passed to [`TestRequest#error`](api/common/http/testing/TestRequest#error] | `ProgressEvent` | Http requests never emit an `ErrorEvent`. Use a `ProgressEvent` instead. |
| [`getModuleFactory`](api/core/getModuleFactory) | `getNgModuleById` | `NgModuleFactory` itself is deprecated. |
| [`ModuleWithComponentFactories`](api/core/ModuleWithComponentFactories) | n/a | Ivy JIT mode doesn't require accessing this symbol. See [JIT API changes due to ViewEngine deprecation](guide/deprecations#jit-api-changes) for additional context. |
| [`Compiler`](api/core/Compiler) | n/a | Ivy JIT mode doesn't require accessing this symbol. See [JIT API changes due to ViewEngine deprecation](guide/deprecations#jit-api-changes) for additional context. |
| [`CompilerFactory`](api/core/CompilerFactory) | n/a | Ivy JIT mode doesn't require accessing this symbol. See [JIT API changes due to ViewEngine deprecation](guide/deprecations#jit-api-changes) for additional context. |
| [`NgModuleFactory`](api/core/NgModuleFactory) | n/a | This class was mostly used as a part of ViewEngine-based JIT API and is no longer needed in Ivy JIT mode. See [JIT API changes due to ViewEngine deprecation](guide/deprecations#jit-api-changes) for additional context. Angular provides APIs that accept NgModule classes directly (such as [`PlatformRef.bootstrapModule`](api/core/PlatformRef#bootstrapModule) and [`createNgModuleRef`](api/core/createNgModuleRef)), consider switching to those APIs instead of using factory-based ones. |
| [`ComponentFactory`](api/core/ComponentFactory) | n/a | Angular no longer requires `ComponentFactory`s. Other APIs allow Component classes to be used directly. |
| [`ComponentFactoryResolver`](api/core/ComponentFactoryResolver) | n/a | Angular no longer requires `ComponentFactory`s. Other APIs allow Component classes to be used directly. |
| `useJit` and `missingTranslation` in [`CompilerOptions`](api/core/CompilerOptions) | n/a | Ivy JIT mode does not support these options. See [JIT API changes due to ViewEngine deprecation](guide/deprecations#jit-api-changes) for additional context. |
| [`JitCompilerFactory`](api/platform-browser-dynamic/JitCompilerFactory) | n/a | Ivy JIT mode doesn't require accessing this symbol. See [JIT API changes due to ViewEngine deprecation](guide/deprecations#jit-api-changes) for additional context. |
| [`RESOURCE_CACHE_PROVIDER`](api/platform-browser-dynamic/RESOURCE_CACHE_PROVIDER) | n/a | This was previously necessary in some cases to test AOT-compiled components with View Engine, but is no longer since Ivy. |
| `relativeLinkResolution` in the Router [`ExtraOptions`](api/router/ExtraOptions) | Switch to the default of `'corrected'` link resolution | This option was introduced to fix a bug with link resolution in a backwards compatible way. Existing apps which still depend on the buggy legacy behavior should switch to the new corrected behavior and stop passing this flag. |
| `resolver` argument in [`RouterOutletContract.activateWith`](api/router/RouterOutletContract#activateWith) | n/a | `ComponentFactory` and `ComponentFactoryResolver` afre deprecated, and passing an argument for a resolver to retrieve a `ComponentFactory` is no longer required. |
| [`OutletContext#resolver](api/router/OutletContext#resolver) | n/a | `ComponentFactory` and `ComponentFactoryResolver` are deprecated, and using a resolver to retrieve a `ComponentFactory` is no longer required. |
| [`SwUpdate#activated`](api/service-worker/SwUpdate#activated) | Return value of [`SwUpdate#activateUpdate`](api/service-worker/SwUpdate#activateUpdate) | The `activated` property is deprecated. Existing usages can migrate to [`SwUpdate#activateUpdate`](api/service-worker/SwUpdate#activateUpdate). |
| [`SwUpdate#available`](api/service-worker/SwUpdate#available) | [`SwUpdate#versionUpdates`](api/service-worker/SwUpdate#versionUpdates) | The behavior of [`SwUpdate#available`](api/service-worker/SwUpdate#available) can be achieved by filtering for the [`VersionReadyEvent`](api/service-worker/VersionReadyEvent) from [`SwUpdate#versionUpdates`](api/service-worker/SwUpdate#versionUpdates)

<!-- links -->

[AioApiCoreApplicationrefBootstrap]: api/core/ApplicationRef#bootstrap

<!-- "bootstrap - ApplicationRef | Core - API | Angular" -->

[AioApiCoreCompiler]: api/core/Compiler

<!-- "Compiler | Core - API | Angular" -->

[AioApiCoreCompilerfactory]: api/core/CompilerFactory

<!-- "CompilerFactory | Core - API | Angular" -->

[AioApiCoreCreatengmoduleref]: api/core/createNgModuleRef

<!-- "createNgModuleRef | Core - API | Angular" -->

[AioApiCoreGetmodulefactory]: api/core/getModuleFactory

<!-- "getModuleFactory | Core - API | Angular" -->

[AioApiCoreGetngmodulebyid]: api/core/getNgModuleById

<!-- "getNgModuleById | Core - API | Angular" -->

[AioApiCoreModulewithcomponentfactories]: api/core/ModuleWithComponentFactories

<!-- "ModuleWithComponentFactories | Core - API | Angular" -->

[AioApiCoreNgmodulefactory]: api/core/NgModuleFactory

<!-- "NgModuleFactory | Core - API | Angular" -->

[AioApiCorePlatformrefBootstrapmodulefactory]: api/core/PlatformRef#bootstrapModuleFactory

<!-- "bootstrapModuleFactory - PlatformRef | Core - API | Angular" -->

[AioApiCorePlatformrefBootstrapmodule]: api/core/PlatformRef#bootstrapModule

<!-- "bootstrapModule - PlatformRef | Core - API | Angular" -->

[AioApiCoreTestingTestbedInittestenvironment]: api/core/testing/TestBed#inittestenvironment

<!-- "inittestenvironment - TestBed | Testing - Core - API | Angular" -->

[AioApiCoreTestingTestmodulemetadata]: api/core/testing/TestModuleMetadata

<!-- "TestModuleMetadata | Testing - Core - API | Angular" -->

[AioApiCoreViewcontainerrefCreatecomponent]: api/core/ViewContainerRef#createComponent

<!-- "createComponent - ViewContainerRef | Core - API | Angular" -->

[AioApiPlatformServerRendermodulefactory]: api/platform-server/renderModuleFactory

<!-- "renderModuleFactory | Platform server - API | Angular" -->

[AioApiPlatformServerRendermodule]: api/platform-server/renderModule

<!-- "renderModule | Platform server - API | Angular" -->

[AioApiServiceWorkerSwupdateActivated]: api/service-worker/SwUpdate#activated

<!-- "activated - SwUpdate | Service worker - API | Angular" -->

[AioApiServiceWorkerSwupdateActivateupdate]: api/service-worker/SwUpdate#activateUpdate

<!-- "activateUpdate - SwUpdate | Service worker - API | Angular" -->

[AioApiServiceWorkerSwupdateAvailable]: api/service-worker/SwUpdate#available

<!-- "available - SwUpdate | Service worker - API | Angular" -->

[AioApiServiceWorkerSwupdateVersionupdates]: api/service-worker/SwUpdate#versionUpdates

<!-- "versionUpdates - SwUpdate | Service worker - API | Angular" -->

[AioGuideReleasesDeprecationPractices]: guide/releases#deprecation-practices

<!-- "Deprecation practices - Angular versioning and releases | Angular" -->

<!-- external links -->

[AngularBlog76c02f782aa4]: https://blog.angular.io/76c02f782aa4

<!-- "Upcoming improvements to Angular library distribution | Angular Blog" -->

[AngularUpdateMain]: https://update.angular.io

<!-- " Angular Update Guide" -->

[DevThisIsAngularImprovingAngularTestsByEnablingAngularTestingModuleTeardown38kh]: https://dev.to/this-is-angular/improving-angular-tests-by-enabling-angular-testing-module-teardown-38kh

<!-- "Improving Angular tests by enabling Angular testing module teardown | This is Angular | DEV Community" -->

[GithubAngularAngularIssues41840]: https://github.com/angular/angular/issues/41840

<!-- "RFC: Internet Explorer 11 support deprecation and removal #41840 | angular/angular | GitHub" -->

[GithubAngularAngularPull31187]: https://github.com/angular/angular/pull/31187

<!-- "fix(router): Allow question marks in query param values #31187 | angular/angular | GitHub" -->

[GithubAngularAngularPull41730]: https://github.com/angular/angular/pull/41730

<!-- "fix(common): synchronise location mock behavior with the navigators #41730 | angular/angular | GitHub" -->

[GithubAngularAngularPull42952]: https://github.com/angular/angular/pull/42952

<!-- "feat(forms): Give form statuses a more specific type #42952 | angular/angular | GitHub" -->

[GithubAngularAngularPull43087]: https://github.com/angular/angular/pull/43087

<!-- "fix(router): null/undefined routerLink should disable navigation #43087 | angular/angular | GitHub" -->

[GithubAngularAngularPull43496]: https://github.com/angular/angular/pull/43496

<!-- "fix(router): Prevent URL flicker when new navigations cancel ongoing &hellip; #43496 | angular/angular | GitHub" -->

[GithubAngularAngularPull43507]: https://github.com/angular/angular/pull/43507

<!-- "perf(core): remove support for the deprecated WrappedValue #43507 | angular/angular | GitHub" -->

[GithubAngularAngularPull43591]: https://github.com/angular/angular/pull/43591

<!-- "refactor(router): remove support for loadChildren string syntax #43591 | angular/angular | GitHub" -->

[GithubAngularAngularPull43642]: https://github.com/angular/angular/pull/43642

<!-- "feat(core): drop support for TypeScript 4.2 and 4.3 #43642 | angular/angular | GitHub" -->

[GithubAngularAngularPull43668]: https://github.com/angular/angular/pull/43668

<!-- "feat(service-worker): improve ergonomics of the SwUpdate APIs #43668 | angular/angular | GitHub" -->

[GithubAngularAngularPull43740]: https://github.com/angular/angular/pull/43740

<!-- "feat(bazel): expose esm2020 and es2020 conditions in APF package exports #43740 | angular/angular | GitHub" -->

[GithubAngularAngularPull43791]: https://github.com/angular/angular/pull/43791

<!-- "fix(router): reuse route strategy fix #43791 | angular/angular | GitHub" -->

[GithubAngularAngularCliIssues21545]: https://github.com/angular/angular-cli/issues/21545

<!-- "[RFC] Persistent build cache by default #21545 | angular/angular-cli | GitHub" -->

[GithubAngularAngularCliIssues22159]: https://github.com/angular/angular-cli/issues/22159

<!-- "Script imports are modules by default #22159 | angular/angular-cli | GitHub" -->

[GithubAngularAngularIssues20114]: https://github.com/angular/angular/issues/20114

<!-- "RouteReuseStrategy impossible to store/retrieve siblings AND ALSO a non-sibling #20114 | angular/angular | GitHub" -->

<!-- end links -->

@reviewed 2022-05-31
