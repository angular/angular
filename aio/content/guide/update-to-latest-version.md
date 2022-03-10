# Update Angular

This guide contains information to update to Angular version 13.

## Update Angular CLI applications

For step-by-step instructions on how to update to the latest Angular release and leverage the Angular automated migration tools, use the interactive update guide at [update.angular.io][AngularUpdateMain].

## Changes and deprecations in version 13

<div class="alert is-helpful">

For information about the deprecation and removal practices of Angular, see [Angular Release Practices][AioGuideReleasesDeprecationPractices].

</div>

*   **Removal of View Engine**

    Requires all applications and libraries to build using Ivy.
    See the [Upcoming improvements to Angular library distribution][AngularBlog76c02f782aa4] blog.

*   **Modernization of the Angular Package Format \(APF\)**

    Removed older output formats, including View Engine specific metadata.

*   **Removal of IE11 Support**

    Removes all support for Microsoft Internet Explorer 11 \(IE11\).
    See [Issue&nbsp;#41840][GithubAngularAngularIssues41840].

*   **Testbed module teardown**

    Adds the option in `initTestEnvironment` to completely remove test environments from an application.
    See the [Improving Angular tests by enabling Angular testing module teardown][DevThisIsAngularImprovingAngularTestsByEnablingAngularTestingModuleTeardown38kh] article.

*   **`$localize` tagged message strings**

    Adds documentation for the Angular `$localize` API and tagged message strings.

*   **Disk Cache**

    Enables the persistent build cache by default for all applications.
    See [Issue&nbsp;#21545][GithubAngularAngularCliIssues21545].

### Breaking changes in Angular version 13

<a id="breaking-changes"></a>

|                                                     | Details                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|:---                                                 |:---                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| [**PR&nbsp;#43642**][GithubAngularAngularPull43642] | TypeScript versions older than `4.4.2` are no longer supported.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| [**PR&nbsp;#43740**][GithubAngularAngularPull43740] | NodeJS versions older than `v12.20.0` are no longer supported. The Angular packages now use the NodeJS package exports feature with subpath patterns and requires a NodeJS version above `14.15.0` or `16.10.0`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| [PR&nbsp;#31187][GithubAngularAngularPull31187]     | Previously, the default url serializer dropped everything after and including a question mark in query parameters. That is, for a navigation to `/path?q=hello?&other=123`, the query parameters parsed to just `{q: 'hello'}`. This is incorrect, because the URI spec allows for question mark characers in query data. This change now correctly parses the query parameters for `/path?q=hello?&other=123` as `{q: 'hello?', other: '123'}`.                                                                                                                                                                                                                                         |
| [PR&nbsp;#41730][GithubAngularAngularPull41730]     | The behavior of the `SpyLocation` used by the `RouterTestingModule` has changed to match the behavior of browsers. It no longer emits a `popstate` event when `Location.go` is called. In addition, `simulateHashChange` now triggers *both* a `hashchange` event and a `popstate` event. Tests that use `location.go` and expect the changes to be picked up by the `Router` should migrate to `simulateHashChange`. Each test is different in what it attempts to assert, so there is no single change that works for all tests. Each test that uses the `SpyLocation` to simulate changes in the browser URL should be evaluated on a case-by-case basis.                             |
| [PR&nbsp;#42952][GithubAngularAngularPull42952]     | A new type called `FormControlStatus` has been introduced, which is a union of all possible status strings for form controls. `AbstractControl.status` has been narrowed from `string` to `FormControlStatus`, and `statusChanges` has been narrowed from `Observable<any>` to `Observable<FormControlStatus>`. Most applications should consume the new types seamlessly. Any breakage caused by this change is likely due to one of the following two problems: <ol><li>The app is comparing <code>AbstractControl.status</code> against a string which is not a valid status.</li><li>The app is using `statusChanges` events as if they were something other than strings.</li></ol> |
| [PR&nbsp;#43087][GithubAngularAngularPull43087]     | Previously ,`null` and `undefined` inputs for `routerLink` were equivalent to empty string and there was no way to disable the navigation of the link. In addition, the `href` is changed from a property `HostBinding()` to an attribute binding \(`HostBinding('attr.href')`\). The effect of this change is that `DebugElement.properties['href']` now returns the `href` value returned by the native element which is the full URL rather than the internal value of the `RouterLink` `href` property.                                                                                                                                                                              |
| [PR&nbsp;#43496][GithubAngularAngularPull43496]     | The router no longer replaces the browser URL when a new navigation cancels an ongoing navigation. The replacement of the browser URL often caused URL flicker and was only in place to support some AngularJS hybrid applications. Hybrid applications which rely on the presence of `navigationId` on each initial navigation handled by the Angular router should instead subscribe to `NavigationCancel` events and manually perform the `location.replaceState` to add `navigationId` to the Router state.<br />In addition, tests that assert `urlChanges` on the `SpyLocation` should be adjusted to account for the lack of the `replaceState` trigger.                          |
| [PR&nbsp;#43507][GithubAngularAngularPull43507]     | The `WrappedValue` class is no longer imported from `@angular/core`. This change may result in compile errors or failures at runtime, if outdated libraries are used that rely on `WrappedValue`. Dependancy on `WrappedValue` should be removed since no replacement is available.                                                                                                                                                                                                                                                                                                                                                                                                      |
| [PR&nbsp;#43591][GithubAngularAngularPull43591]     | It is no longer possible to use `Route.loadChildren` with a string value. The following supporting classes were removed from `@angular/core`: <ul><li><code>NgModuleFactoryLoader</code></li><li><code>SystemJsNgModuleFactoryLoader</code></li></ul> The `@angular/router` package no longer exports the following symbols: <ul><li><code>SpyNgModuleFactoryLoader</code></li><li><code>DeprecatedLoadChildren</code></li></ul> The signature of the `setupTestingRouter` function from `@angular/core/testing` was changed to drop the `NgModuleFactoryLoader` parameter, since an value for that parameter can not be created.                                                        |
| [PR&nbsp;#43668][GithubAngularAngularPull43668]     | The return type of `SwUpdate#activateUpdate` and `SwUpdate#checkForUpdate` changed to `Promise<boolean>`.<br />Although unlikely, this change may cause TypeScript type-checking to fail in some cases. If necessary, update your types to account for the new return type.                                                                                                                                                                                                                                                                                                                                                                                                              |
| [PR&nbsp;#43791][GithubAngularAngularPull43791]     | When storing and retrieving a `DetachedRouteHandle`, the Router traverses the `Route` children in order to correctly allow storing a parent route when there are several possible child `Route` configs that can be stored. This allows a `RouteReuseStrategy` to store a parent `Route` *and* a child, while preserving the ability to change the child route while restoring the parent. Some implementations of `RouteReuseStrategy` will need to be updated to correctly store and retrieve the `DetachedRouteHandle` of descendants as well as the stored parent `ActivatedRouteSnapshot`. <br /> Previously, the `Router` would only store the parent, making it impossible to change descendant paths when a parent stored was retrieved. See [**Issue&nbsp;#20114**][GithubAngularAngularIssues20114] |
| [Issue&nbsp;#22159][GithubAngularAngularCliIssues22159]     | Scripts that load via dynamic `import()` are now treated as ES modules \(meaning they must be strict mode-compatible\). |

### New deprecations

<a id="deprecations"></a>

| Removed                                                                                                             | Replacement                                                                                             | Details                                                                                                                                                                         |
|:---                                                                                                                 |:---                                                                                                     |:---                                                                                                                                                                             |
| [`getModuleFactory`][AioApiCoreGetmodulefactory]                                                                    | [`getNgModuleById`][AioApiCoreGetngmodulebyid]                                                          |                                                                                                                                                                                 |
| Factory-based signature of [`ApplicationRef.bootstrap`][AioApiCoreApplicationrefBootstrap]                          | Type-based signature of [`ApplicationRef.bootstrap`][AioApiCoreApplicationrefBootstrap]                 | Use the Type-based signature in place of the Factory-based signature.                                                                                                           |
| [`PlatformRef.bootstrapModuleFactory`][AioApiCorePlatformrefBootstrapmodulefactory]                                 | [`PlatformRef.bootstrapModule`][AioApiCorePlatformrefBootstrapmodule]                                   |                                                                                                                                                                                 |
| [`ModuleWithComponentFactories`][AioApiCoreModulewithcomponentfactories]                                            | none                                                                                                    |                                                                                                                                                                                 |
| [`Compiler`][AioApiCoreCompiler]                                                                                    | none                                                                                                    |                                                                                                                                                                                 |
| [`CompilerFactory`][AioApiCoreCompilerfactory]                                                                      | none                                                                                                    |                                                                                                                                                                                 |
| [`NgModuleFactory`][AioApiCoreNgmodulefactory]                                                                      | Non-factory based framework APIs                                                                        | Use the non-factory based framework APIs, such as [`PlatformRef.bootstrapModule`][AioApiCorePlatformrefBootstrapmodule] and [`createNgModuleRef`][AioApiCoreCreatengmoduleref]. |
| Factory-based signature of [`ViewContainerRef.createComponent`][AioApiCoreViewcontainerrefCreatecomponent]          | Type-based signature of [`ViewContainerRef.createComponent`][AioApiCoreViewcontainerrefCreatecomponent] | Use the Type-based signature in place of the Factory-based signature.                                                                                                           |
| `aotSummaries` parameter of the [`TestBed.initTestEnvironment` method][AioApiCoreTestingTestbedInittestenvironment] | none                                                                                                    |                                                                                                                                                                                 |
| `aotSummaries` parameter of the [`TestModuleMetadata` type][AioApiCoreTestingTestmodulemetadata]                    | none                                                                                                    |                                                                                                                                                                                 |
| [`renderModuleFactory`][AioApiPlatformServerRendermodulefactory]                                                    | [`renderModule`][AioApiPlatformServerRendermodule]                                                      |                                                                                                                                                                                 |
| [`SwUpdate#activated`][AioApiServiceWorkerSwupdateActivated]                                                        | [`SwUpdate#activateUpdate()`][AioApiServiceWorkerSwupdateActivateupdate]                                | Use the return value of [`SwUpdate#activateUpdate()`][AioApiServiceWorkerSwupdateActivateupdate].                                                                               |
| [`SwUpdate#available`][AioApiServiceWorkerSwupdateAvailable]                                                        | [`SwUpdate#versionUpdates`][AioApiServiceWorkerSwupdateVersionupdates]                                  |                                                                                                                                                                                 |
| `bind-input="value"`                                                                                                | `[input]="value"`                                                                                       |                                                                                                                                                                                 |
| `bind-animate-trigger="value"`                                                                                      | `[@trigger]="value"`                                                                                    |                                                                                                                                                                                 |
| `on-click="onClick()"`                                                                                              | `(click)="onClick()"`                                                                                   |                                                                                                                                                                                 |
| `bindon-ngModel="value"`                                                                                            | `[(ngModel)]="value"`                                                                                   |                                                                                                                                                                                 |
| `ref-templateRef`                                                                                                   | `#templateRef`                                                                                          |                                                                                                                                                                                 |

<!-- links -->

[AioApiCoreApplicationrefBootstrap]: api/core/ApplicationRef#bootstrap "bootstrap - ApplicationRef | Core - API | Angular"
[AioApiCoreCompiler]: api/core/Compiler "Compiler | Core - API | Angular"
[AioApiCoreCompilerfactory]: api/core/CompilerFactory "CompilerFactory | Core - API | Angular"
[AioApiCoreCreatengmoduleref]: api/core/createNgModuleRef "createNgModuleRef | Core - API | Angular"
[AioApiCoreGetmodulefactory]: api/core/getModuleFactory "getModuleFactory | Core - API | Angular"
[AioApiCoreGetngmodulebyid]: api/core/getNgModuleById "getNgModuleById | Core - API | Angular"
[AioApiCoreModulewithcomponentfactories]: api/core/ModuleWithComponentFactories "ModuleWithComponentFactories | Core - API | Angular"
[AioApiCoreNgmodulefactory]: api/core/NgModuleFactory "NgModuleFactory | Core - API | Angular"
[AioApiCorePlatformrefBootstrapmodulefactory]: api/core/PlatformRef#bootstrapModuleFactory "bootstrapModuleFactory - PlatformRef | Core - API | Angular"
[AioApiCorePlatformrefBootstrapmodule]: api/core/PlatformRef#bootstrapModule "bootstrapModule - PlatformRef | Core - API | Angular"
[AioApiCoreTestingTestbedInittestenvironment]: api/core/testing/TestBed#inittestenvironment "inittestenvironment - TestBed | Testing - Core - API | Angular"
[AioApiCoreTestingTestmodulemetadata]: api/core/testing/TestModuleMetadata "TestModuleMetadata | Testing - Core - API | Angular"
[AioApiCoreViewcontainerrefCreatecomponent]: api/core/ViewContainerRef#createComponent "createComponent - ViewContainerRef | Core - API | Angular"

[AioApiPlatformServerRendermodulefactory]: api/platform-server/renderModuleFactory "renderModuleFactory | Platform server - API | Angular"
[AioApiPlatformServerRendermodule]: api/platform-server/renderModule "renderModule | Platform server - API | Angular"

[AioApiServiceWorkerSwupdateActivated]: api/service-worker/SwUpdate#activated "activated - SwUpdate | Service worker - API | Angular"
[AioApiServiceWorkerSwupdateActivateupdate]: api/service-worker/SwUpdate#activateUpdate "activateUpdate - SwUpdate | Service worker - API | Angular"
[AioApiServiceWorkerSwupdateAvailable]: api/service-worker/SwUpdate#available "available - SwUpdate | Service worker - API | Angular"
[AioApiServiceWorkerSwupdateVersionupdates]: api/service-worker/SwUpdate#versionUpdates "versionUpdates - SwUpdate | Service worker - API | Angular"

[AioGuideReleasesDeprecationPractices]: guide/releases#deprecation-practices "Deprecation practices - Angular versioning and releases | Angular"

<!-- external links -->

[AngularBlog76c02f782aa4]: https://blog.angular.io/76c02f782aa4 "Upcoming improvements to Angular library distribution | Angular Blog"

[AngularUpdateMain]: https://update.angular.io " Angular Update Guide"

[DevThisIsAngularImprovingAngularTestsByEnablingAngularTestingModuleTeardown38kh]: https://dev.to/this-is-angular/improving-angular-tests-by-enabling-angular-testing-module-teardown-38kh "Improving Angular tests by enabling Angular testing module teardown | This is Angular | DEV Community"

[GithubAngularAngularIssues41840]: https://github.com/angular/angular/issues/41840 "RFC: Internet Explorer 11 support deprecation and removal #41840 | angular/angular | GitHub"

[GithubAngularAngularPull31187]: https://github.com/angular/angular/pull/31187 "fix(router): Allow question marks in query param values #31187 | angular/angular | GitHub"
[GithubAngularAngularPull41730]: https://github.com/angular/angular/pull/41730 "fix(common): synchronise location mock behavior with the navigators #41730 | angular/angular | GitHub"
[GithubAngularAngularPull42952]: https://github.com/angular/angular/pull/42952 "feat(forms): Give form statuses a more specific type #42952 | angular/angular | GitHub"
[GithubAngularAngularPull43087]: https://github.com/angular/angular/pull/43087 "fix(router): null/undefined routerLink should disable navigation #43087 | angular/angular | GitHub"
[GithubAngularAngularPull43496]: https://github.com/angular/angular/pull/43496 "fix(router): Prevent URL flicker when new navigations cancel ongoing &hellip; #43496 | angular/angular | GitHub"
[GithubAngularAngularPull43507]: https://github.com/angular/angular/pull/43507 "perf(core): remove support for the deprecated WrappedValue #43507 | angular/angular | GitHub"
[GithubAngularAngularPull43591]: https://github.com/angular/angular/pull/43591 "refactor(router): remove support for loadChildren string syntax #43591 | angular/angular | GitHub"
[GithubAngularAngularPull43642]: https://github.com/angular/angular/pull/43642 "feat(core): drop support for TypeScript 4.2 and 4.3 #43642 | angular/angular | GitHub"
[GithubAngularAngularPull43668]: https://github.com/angular/angular/pull/43668 "feat(service-worker): improve ergonomics of the SwUpdate APIs #43668 | angular/angular | GitHub"
[GithubAngularAngularPull43740]: https://github.com/angular/angular/pull/43740 "feat(bazel): expose esm2020 and es2020 conditions in APF package exports #43740 | angular/angular | GitHub"
[GithubAngularAngularPull43791]: https://github.com/angular/angular/pull/43791 "fix(router): reuse route strategy fix #43791 | angular/angular | GitHub"

[GithubAngularAngularCliIssues21545]: https://github.com/angular/angular-cli/issues/21545 "[RFC] Persistent build cache by default #21545 | angular/angular-cli | GitHub"
[GithubAngularAngularCliIssues22159]: https://github.com/angular/angular-cli/issues/22159 "Script imports are modules by default #22159 | angular/angular-cli | GitHub"
[GithubAngularAngularIssues20114]: https://github.com/angular/angular/issues/20114 "RouteReuseStrategy impossible to store/retrieve siblings AND ALSO a non-sibling #20114 | angular/angular | GitHub"

<!-- end links -->

@reviewed 2022-02-28
