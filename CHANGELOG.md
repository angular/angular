<a name="16.0.0-rc.2"></a>
# 16.0.0-rc.2 (2023-04-19)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [49fe974501](https://github.com/angular/angular/commit/49fe974501b6f446eaedf2490f2d456a5967318f) | perf | optimize NgModule emit for standalone components ([#49837](https://github.com/angular/angular/pull/49837)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [fd9dcd36cd](https://github.com/angular/angular/commit/fd9dcd36cdf9ad92f404567f6c8c0914544b6e0d) | fix | Ensure effects can be created when Zone is not defined ([#49890](https://github.com/angular/angular/pull/49890)) |
| [2650f1afc1](https://github.com/angular/angular/commit/2650f1afc1cf53423b433c2ee1782aae9d6117e4) | fix | execute input setters in non-reactive context ([#49906](https://github.com/angular/angular/pull/49906)) |
| [f8b95b9da6](https://github.com/angular/angular/commit/f8b95b9da62d0c8719a38d230f389db5268c0b01) | fix | execute query setters in non-reactive context ([#49906](https://github.com/angular/angular/pull/49906)) |
| [ef91a2e0fe](https://github.com/angular/angular/commit/ef91a2e0fe66378635d0787bd6d953eb8d31d881) | fix | execute template creation in non-reactive context ([#49883](https://github.com/angular/angular/pull/49883)) |
| [a3c3ab757c](https://github.com/angular/angular/commit/a3c3ab757cf232c232c91e26d3dbc9b2aa04f296) | fix | handle invalid classes in class array bindings ([#49924](https://github.com/angular/angular/pull/49924)) |
| [fedc75624c](https://github.com/angular/angular/commit/fedc75624c5dcfaaa2b5ef901e7e700309770a26) | fix | include inner ViewContainerRef anchor nodes into ViewRef.rootNodes output ([#49867](https://github.com/angular/angular/pull/49867)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [98223c11ca](https://github.com/angular/angular/commit/98223c11caab3f4fefa8530b72dcd680280afe71) | fix | canceledNavigationResolution: 'computed' with redirects to the current URL ([#49793](https://github.com/angular/angular/pull/49793)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.2.8"></a>
# 15.2.8 (2023-04-19)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [2fff8fadbe](https://github.com/angular/angular/commit/2fff8fadbeff9df3bc09b8847dbf08febbe3b5f8) | fix | handle invalid classes in class array bindings ([#49924](https://github.com/angular/angular/pull/49924)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [05a0225deb](https://github.com/angular/angular/commit/05a0225deb126849f3798e828f6dbef7c221ec57) | fix | prevent headers from throwing an error when initializing numerical values ([#49379](https://github.com/angular/angular/pull/49379)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [09a42d988e](https://github.com/angular/angular/commit/09a42d988e654825648205c8df90f7ca4d034c74) | fix | canceledNavigationResolution: 'computed' with redirects to the current URL ([#49793](https://github.com/angular/angular/pull/49793)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.0.0-rc.1"></a>
# 16.0.0-rc.1 (2023-04-14)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [4721c48a24](https://github.com/angular/angular/commit/4721c48a24bf4e72fd4742097ec8505a08f87579) | fix | error if document body is null ([#49818](https://github.com/angular/angular/pull/49818)) |
| [87549af73c](https://github.com/angular/angular/commit/87549af73c675d33b2c87d083e05a82b18332bf0) | fix | Fix capitalization of toObservableOptions ([#49832](https://github.com/angular/angular/pull/49832)) |
| [c34d7e0822](https://github.com/angular/angular/commit/c34d7e0822c21f7b6e7dfd46d3e12cd6ebb7390e) | fix | onDestroy should be registered only on valid DestroyRef ([#49804](https://github.com/angular/angular/pull/49804)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [2a580b6f0b](https://github.com/angular/angular/commit/2a580b6f0b05d917dc220c4b7b69a8b3f59e6e98) | fix | HTTP cache was being disabled prematurely ([#49826](https://github.com/angular/angular/pull/49826)) |
| [95bc7e2c03](https://github.com/angular/angular/commit/95bc7e2c03b60c41c8dbe431a3759d2b63405753) | fix | prevent headers from throwing an error when initializing numerical values ([#49379](https://github.com/angular/angular/pull/49379)) |
## Special Thanks
Alan Agius, Andrew Kushnir, Andrew Scott, Danilo Bassi, Kristiyan Kostadinov, Matthieu Riegler, Pawel Kozlowski and Payam Valadkhan

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.0.0-rc.0"></a>
# 16.0.0-rc.0 (2023-04-12)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [9de1e9da8f](https://github.com/angular/angular/commit/9de1e9da8fc7d102f74389d9a270c4608bf0dd64) | fix | incorrectly matching directives on attribute bindings ([#49713](https://github.com/angular/angular/pull/49713)) |
| [6623810e4d](https://github.com/angular/angular/commit/6623810e4d3347edaccbbb214fa883ab6a669936) | fix | Produce diagnositc if directive used in host binding is not exported ([#49527](https://github.com/angular/angular/pull/49527)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [ed817e32fe](https://github.com/angular/angular/commit/ed817e32fe0239c0f08ce342c7ad224055d56f84) | fix | Catch FatalDiagnosticError during template type checking ([#49527](https://github.com/angular/angular/pull/49527)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [f8e25864e8](https://github.com/angular/angular/commit/f8e25864e8e35214a321b1c48a926d370f725e13) | fix | allow async functions in effects ([#49783](https://github.com/angular/angular/pull/49783)) |
| [84216dabfc](https://github.com/angular/angular/commit/84216dabfcfc6e082f6042a0658fb0cb7a323525) | fix | catch errors from source signals outside of .next ([#49769](https://github.com/angular/angular/pull/49769)) |
| [2f2ef14f9e](https://github.com/angular/angular/commit/2f2ef14f9e6b64445f76cb9e3f5958abe2439157) | fix | resolve `InitialRenderPendingTasks` promise on complete ([#49784](https://github.com/angular/angular/pull/49784)) |
| [c7d8d3ee37](https://github.com/angular/angular/commit/c7d8d3ee3757c2540baf739001b0fc13c096a4a4) | fix | toObservable should allow writes to signals in the effect ([#49769](https://github.com/angular/angular/pull/49769)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [15c91a53ae](https://github.com/angular/angular/commit/15c91a53ae2cc1f34e05b158be69e10e9f43043b) | fix | delay accessing `pendingTasks.whenAllTasksComplete` ([#49784](https://github.com/angular/angular/pull/49784)) |
| [9f0c6d1ed1](https://github.com/angular/angular/commit/9f0c6d1ed1d30eb5596fc68d8bd30ab132998ae6) | fix | ensure new cache state is returned on each request ([#49749](https://github.com/angular/angular/pull/49749)) |
| [2eb9b8b402](https://github.com/angular/angular/commit/2eb9b8b402807aec817d0a58137f7d359c46d055) | fix | wait for all XHR requests to finish before stabilizing application ([#49776](https://github.com/angular/angular/pull/49776)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [6193a3d406](https://github.com/angular/angular/commit/6193a3d40619c34127ec011a895e8fde3c5d8c48) | fix | fix = not parsed in router segment name ([#47332](https://github.com/angular/angular/pull/47332)) |
## Special Thanks
Alan Agius, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Brandon Roberts, De Wildt, Jessica Janiuk, Joey Perrott, Kristiyan Kostadinov, Matthieu Riegler, Nikola Kološnjaji, Paul Gschwendtner, Pawel Kozlowski and dewildt

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.2.7"></a>
# 15.2.7 (2023-04-12)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [b0c1a90f55](https://github.com/angular/angular/commit/b0c1a90f55ecfafb4fd5c22cdd1b4a5f12573f22) | fix | Produce diagnositc if directive used in host binding is not exported ([#49792](https://github.com/angular/angular/pull/49792)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [a40529af2e](https://github.com/angular/angular/commit/a40529af2e2923f1dbdae8898a0e94e9e63a3fcf) | fix | Catch FatalDiagnosticError during template type checking ([#49792](https://github.com/angular/angular/pull/49792)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [702ec90110](https://github.com/angular/angular/commit/702ec901100b2d84efdf0b16d8347f8b28b94d5d) | fix | When using setInput, mark view dirty in same way as `markForCheck` ([#49747](https://github.com/angular/angular/pull/49747)) |
## Special Thanks
Alan Agius, Andrew Kushnir, Andrew Scott, Kristiyan Kostadinov, Matthieu Riegler and Nikola Kološnjaji

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.4.0"></a>
# 13.4.0 (2023-04-06)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [ae34dbca1b](https://github.com/angular/angular/commit/ae34dbca1be10b0245a751bb0596599e95d7b4aa) | feat | Backport NgOptimizedImage to v13 |
## Special Thanks
Alex Castle and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.0.0-next.7"></a>
# 16.0.0-next.7 (2023-04-05)
## Breaking Changes
### core
- QueryList.filter now supports type guard functions, which will result in type narrowing. Previously if you used type guard functions, it resulted in no changes to the return type. Now the type would be narrowed, which might require updates to the application code that relied on the old behavior.
- The `ReflectiveInjector` and related symbols were removed. Please update the code to avoid references to the `ReflectiveInjector` symbol. Use `Injector.create` as a replacement to create an injector instead.
### platform-browser
- The deprecated `BrowserTransferStateModule` was removed, since it's no longer needed. The `TransferState` class can be injected without providing the module. The `BrowserTransferStateModule` was empty starting from v14 and you can just remove the reference to that module from your applications.
### core
| Commit | Type | Description |
| -- | -- | -- |
| [b2327f4df1](https://github.com/angular/angular/commit/b2327f4df12ca91d7cdbc3dc5c0f5cb3ab88a30e) | feat | Allow typeguards on QueryList.filter ([#48042](https://github.com/angular/angular/pull/48042)) |
| [b35fa73968](https://github.com/angular/angular/commit/b35fa739687a357108edaa0a57dcd033ecfcb9f2) | feat | change the URL sanitization to only block javascript: URLs ([#49659](https://github.com/angular/angular/pull/49659)) |
| [061f3d1086](https://github.com/angular/angular/commit/061f3d1086421b921403f7d358c02f84927b699b) | feat | Drop public `factories` property for `IterableDiffers` : Breaking change ([#49598](https://github.com/angular/angular/pull/49598)) |
| [a5f1737d1c](https://github.com/angular/angular/commit/a5f1737d1c2435b1476c1277bdc9a6827377465f) | feat | expose onDestroy on ApplicationRef ([#49677](https://github.com/angular/angular/pull/49677)) |
| [aad05ebeb4](https://github.com/angular/angular/commit/aad05ebeb44afad29fd989019638590344ba61eb) | feat | support usage of non-experimental decorators with TypeScript 5.0 ([#49492](https://github.com/angular/angular/pull/49492)) |
| [df1dfc4c17](https://github.com/angular/angular/commit/df1dfc4c17abc6799f2e8f3f5f8604a7bf3d173a) | fix | make sure that lifecycle hooks are not tracked ([#49701](https://github.com/angular/angular/pull/49701)) |
| [a4e749ffca](https://github.com/angular/angular/commit/a4e749ffca5b1f726c365cecaf0f5c4f13eec8d9) | fix | When using setInput, mark view dirty in same was as `markForCheck` ([#49711](https://github.com/angular/angular/pull/49711)) |
| [3b863ddc1e](https://github.com/angular/angular/commit/3b863ddc1e67a2fa7627ad78e172c839781e81b6) | refactor | Remove `ReflectiveInjector` symbol ([#48103](https://github.com/angular/angular/pull/48103)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [aff1512950](https://github.com/angular/angular/commit/aff15129501511569bbb4ff6dfcb16ad1c01890d) | feat | allow `HttpClient` to cache requests ([#49509](https://github.com/angular/angular/pull/49509)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [761e02d912](https://github.com/angular/angular/commit/761e02d912e4f910f9e5e915c019dc1fef0d0839) | feat | add a public API function to enable non-destructive hydration ([#49666](https://github.com/angular/angular/pull/49666)) |
| [81e7d15ef6](https://github.com/angular/angular/commit/81e7d15ef65b70c9734ebfd2c865e70d743263dc) | feat | enable HTTP request caching when using `provideClientHydration` ([#49699](https://github.com/angular/angular/pull/49699)) |
| [9bd9a11f4e](https://github.com/angular/angular/commit/9bd9a11f4e21e5a7cc9da18f150f6dd520e7cd1e) | refactor | remove deprecated `BrowserTransferStateModule` symbol ([#49718](https://github.com/angular/angular/pull/49718)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [7870fb07fe](https://github.com/angular/angular/commit/7870fb07fe6b25f5ebb22497bff3a03b7b5fc646) | feat | rename `provideServerSupport` to `provideServerRendering` ([#49678](https://github.com/angular/angular/pull/49678)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [b203e4c19d](https://github.com/angular/angular/commit/b203e4c19d4ccec09b9d1910dbc6f314070c1428) | fix | create correct URL relative to path with empty child ([#49691](https://github.com/angular/angular/pull/49691)) |
## Special Thanks
Alan Agius, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Charles Lyding, Dylan Hunn, Guillaume Weghsteen, Jessica Janiuk, JoostK, Matthieu Riegler, Pawel Kozlowski, Robin Richtsfeld, Sandra Limacher and vikram menon

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.2.6"></a>
# 15.2.6 (2023-04-05)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [d9efa1b0d7](https://github.com/angular/angular/commit/d9efa1b0d742217de1164f7904c202b2697348d9) | feat | change the URL sanitization to only block javascript: URLs ([#49659](https://github.com/angular/angular/pull/49659)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [cad7274ef9](https://github.com/angular/angular/commit/cad7274ef90914f0c24d071473a6cbae0e5b8250) | fix | create correct URL relative to path with empty child ([#49691](https://github.com/angular/angular/pull/49691)) |
| [9b61379096](https://github.com/angular/angular/commit/9b6137909690d6cbfdd8cbef502e9e2ac0d28c4a) | fix | Ensure initial navigation clears current navigation when blocking ([#49572](https://github.com/angular/angular/pull/49572)) |
## Special Thanks
Andrew Scott, Guillaume Weghsteen, John Manners, Johnny Gérard, Matthieu Riegler, Robin Richtsfeld, Sandra Limacher, Sarthak Thakkar, Vinit Neogi and vikram menon

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.0.0-next.6"></a>
# 16.0.0-next.6 (2023-04-03)
## Breaking Changes
### 
- Deprecated `EventManager` method `addGlobalEventListener` has been removed as it is not used by Ivy.
### 
| Commit | Type | Description |
| -- | -- | -- |
| [2703fd6260](https://github.com/angular/angular/commit/2703fd626040c5e65401ebd776404a3b9e284724) | refactor | remove deprecated `EventManager` method `addGlobalEventListener` ([#49645](https://github.com/angular/angular/pull/49645)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [d7d6514add](https://github.com/angular/angular/commit/d7d6514add2912a18c50f190aaa8afafa313bc9e) | feat | Add ability to configure `NgZone` in `bootstrapApplication` ([#49557](https://github.com/angular/angular/pull/49557)) |
| [e883198460](https://github.com/angular/angular/commit/e8831984601da631afc29f9fd72d36f57696f936) | feat | implement `takeUntilDestroyed` in rxjs-interop ([#49154](https://github.com/angular/angular/pull/49154)) |
| [8997bdc03b](https://github.com/angular/angular/commit/8997bdc03bd3ef0dc1ac68c913bf7d09340cee0d) | feat | prototype implementation of @angular/core/rxjs-interop ([#49154](https://github.com/angular/angular/pull/49154)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [07a1aa3004](https://github.com/angular/angular/commit/07a1aa300404969155ed1eb3cd02f4a766e07963) | feat | Improve typings form (async)Validators ([#48679](https://github.com/angular/angular/pull/48679)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [f982a3f965](https://github.com/angular/angular/commit/f982a3f965995c4883780b0d48cb5d1411ebad0f) | feat | Opt-in for binding `Router` information to component inputs ([#49633](https://github.com/angular/angular/pull/49633)) |
| [fa3909e8b4](https://github.com/angular/angular/commit/fa3909e8b4b982423357a6e3d6c1d719ea6fa378) | fix | Ensure initial navigation clears current navigation when blocking ([#49572](https://github.com/angular/angular/pull/49572)) |
## Special Thanks
Alan Agius, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, John Manners, Johnny Gérard, Kristiyan Kostadinov, Matthieu Riegler, Pawel Kozlowski, Sarthak Thakkar and Vinit Neogi

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.0.0-next.5"></a>
# 16.0.0-next.5 (2023-03-29)
## Breaking Changes
### bazel
- Several changes to the Angular Package Format (APF)
  - Removal of FESM2015
  - Replacing ES2020 with ES2022
  - Replacing FESM2020 with FESM2022
- Several changes to the Angular Package Format (APF)
  - Removal of FESM2015
  - Replacing ES2020 with ES2022
  - Replacing FESM2020 with FESM2022
### common
-  If the 'ngTemplateOutletContext' is different from the context, it will result in a compile-time error.
  
  Before the change, the following template was compiling:
  
  ```typescript
  interface MyContext {
    $implicit: string;
  }
  
  @Component({
    standalone: true,
    imports: [NgTemplateOutlet],
    selector: 'person',
    template: `
      <ng-container
        *ngTemplateOutlet="
          myTemplateRef;
          context: { $implicit: 'test', xxx: 'xxx' }
        "></ng-container>
    `,
  })
  export class PersonComponent {
    myTemplateRef!: TemplateRef<MyContext>;
  }
  ```
  However, it does not compile now because the 'xxx' property does not exist in 'MyContext', resulting in the error: 'Type '{ $implicit: string; xxx: string; }' is not assignable to type 'MyContext'.'
  
  The solution is either:
  - add the 'xxx' property to 'MyContext' with the correct type or
  - add '$any(...)' inside the template to make the error disappear. However, adding '$any(...)' does not correct the error but only preserves the previous behavior of the code.
### core
- * `entryComponents` has been deleted from the `@NgModule` and `@Component` public APIs. Any usages can be removed since they weren't doing anyting.
  * `ANALYZE_FOR_ENTRY_COMPONENTS` injection token has been deleted. Any references can be removed.
- ComponentRef.setInput will only set the input on the
  component if it is different from the previous value (based on `Object.is`
  equality). If code relies on the input always being set, it should be
  updated to copy objects or wrap primitives in order to ensure the input
  value differs from the previous call to `setInput`.
## Deprecations
### core
-  `makeStateKey`, `StateKey` and  `TransferState` exports have been moved from `@angular/platform-browser` to `@angular/core`. Please update the imports.
  
  ```diff
  - import {makeStateKey, StateKey, TransferState} from '@angular/platform-browser';
  + import {makeStateKey, StateKey, TransferState} from '@angular/core';
  ```
- The `@Directive`/`@Component` `moduleId` property is now
  deprecated. It did not have any effect for multiple major versions and
  will be removed in v17.
### platform-server
- `PlatformConfig.baseUrl` and `PlatformConfig.useAbsoluteUrl` platform-server config options  are deprecated as these were not used.
### common
| Commit | Type | Description |
| -- | -- | -- |
| [6499f5ae28](https://github.com/angular/angular/commit/6499f5ae28fbd02147e8fe4bc7f4487bad1f0198) | fix | invalid ImageKit transformation ([#49201](https://github.com/angular/angular/pull/49201)) |
| [d47fef72cb](https://github.com/angular/angular/commit/d47fef72cb497db555e67db50997b3b1cc3ee590) | fix | strict type checking for ngtemplateoutlet ([#48374](https://github.com/angular/angular/pull/48374)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [1829542aea](https://github.com/angular/angular/commit/1829542aeabd0e4d5dfb1790872a00d248cd52fd) | fix | do not unquote CSS values ([#49460](https://github.com/angular/angular/pull/49460)) |
| [73d2f3c866](https://github.com/angular/angular/commit/73d2f3c8666f6456c7db9735e1e20af8c4ed328c) | fix | handle trailing comma in object literal ([#49535](https://github.com/angular/angular/pull/49535)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [03d1d00ad9](https://github.com/angular/angular/commit/03d1d00ad9f88a2c449cceab64c1328787576162) | feat | Add an extended diagnostic for `nSkipHydration` ([#49512](https://github.com/angular/angular/pull/49512)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [89d291c367](https://github.com/angular/angular/commit/89d291c367e6b1b4618999c4044dcafcc1953109) | feat | add `assertInInjectionContext` ([#49529](https://github.com/angular/angular/pull/49529)) |
| [605c536420](https://github.com/angular/angular/commit/605c5364208d9ab60041121e2ebbcfb2a1a52c1a) | feat | add migration to remove `moduleId` references ([#49496](https://github.com/angular/angular/pull/49496)) |
| [9c5fd50de4](https://github.com/angular/angular/commit/9c5fd50de4489d98b40668f7d9885c18d9a43c73) | feat | effects can optionally return a cleanup function ([#49625](https://github.com/angular/angular/pull/49625)) |
| [c024574f46](https://github.com/angular/angular/commit/c024574f46f18c42c1e5b02afa6c1e3e4219d25b) | feat | expose `makeStateKey`, `StateKey` and  `TransferState` ([#49563](https://github.com/angular/angular/pull/49563)) |
| [9b65b84cb9](https://github.com/angular/angular/commit/9b65b84cb9a0392d8aef5b52b34d35c7c5b9f566) | feat | Mark components for check if they read a signal ([#49153](https://github.com/angular/angular/pull/49153)) |
| [585e34bf6c](https://github.com/angular/angular/commit/585e34bf6c86f7b056b0aafaaca056baedaedae3) | feat | remove entryComponents ([#49484](https://github.com/angular/angular/pull/49484)) |
| [be23b7ce65](https://github.com/angular/angular/commit/be23b7ce650634c95f6709a879c89bbad45c4701) | fix | ComponentRef.setInput only sets input when not equal to previous ([#49607](https://github.com/angular/angular/pull/49607)) |
| [316c91b1a4](https://github.com/angular/angular/commit/316c91b1a47f1fb574045553288acca5fcb6e354) | fix | deprecate `moduleId` `@Component` property ([#49496](https://github.com/angular/angular/pull/49496)) |
| [fdafdb78dc](https://github.com/angular/angular/commit/fdafdb78dce89d550426fbdbccad1dd1320cad01) | fix | set style property value to empty string instead of an invalid value ([#49460](https://github.com/angular/angular/pull/49460)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [45a6ac09fd](https://github.com/angular/angular/commit/45a6ac09fdd2228fa4bbf5188ba8e67298754e7e) | fix | force macro task creation during HTTP request ([#49546](https://github.com/angular/angular/pull/49546)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [5e5dac278d](https://github.com/angular/angular/commit/5e5dac278d57d29277f0847f025e7dfa850bec45) | feat | Migration to remove `Router` guard and resolver interfaces ([#49337](https://github.com/angular/angular/pull/49337)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [e8e36811d5](https://github.com/angular/angular/commit/e8e36811d5700d23a6d853c78e6314b19d937e5e) | fix | set nonce attribute in a platform compatible way ([#49624](https://github.com/angular/angular/pull/49624)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [e99460865e](https://github.com/angular/angular/commit/e99460865e6a038be08a3436422ad129901aec8c) | refactor | deprecate `useAbsoluteUrl` and `baseUrl` ([#49546](https://github.com/angular/angular/pull/49546)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [2dbf3e0023](https://github.com/angular/angular/commit/2dbf3e0023304b0e80c274c3fb79b70a45b7b317) | fix | Ensure Router preloading works with lazy component and static children ([#49571](https://github.com/angular/angular/pull/49571)) |
| [d3018c0ee7](https://github.com/angular/angular/commit/d3018c0ee71eab2ab35aff20d95e9fa882944d14) | fix | fix [#49457](https://github.com/angular/angular/pull/49457) outlet activating with old info ([#49459](https://github.com/angular/angular/pull/49459)) |
| [1600687fe5](https://github.com/angular/angular/commit/1600687fe518e67adcc629c78857720a5118d489) | fix | Route matching should only happen once when navigating ([#49163](https://github.com/angular/angular/pull/49163)) |
## Special Thanks
Alan Agius, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Asaf Malin, Jan Cabadaj, Jessica Janiuk, JiaLiPassion, Kristiyan Kostadinov, Matthieu Riegler, Paul Gschwendtner, Pawel Kozlowski, Sid, Tano Abeleyra and tomalaforge

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.2.5"></a>
# 15.2.5 (2023-03-29)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [ca5acadb78](https://github.com/angular/angular/commit/ca5acadb78c33bf896001a5810cb4be15ff7bc86) | fix | invalid ImageKit transformation ([#49201](https://github.com/angular/angular/pull/49201)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [077f6b4674](https://github.com/angular/angular/commit/077f6b4674c01bfed083e73a17d848e226e543b4) | fix | do not unquote CSS values ([#49460](https://github.com/angular/angular/pull/49460)) |
| [c3cff35869](https://github.com/angular/angular/commit/c3cff35869648fdf70c9707c3d87bcfdcc84d903) | fix | handle trailing comma in object literal ([#49535](https://github.com/angular/angular/pull/49535)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [d201fc2dec](https://github.com/angular/angular/commit/d201fc2dec1a3a9cc6952ebb46cb672200a78236) | fix | set style property value to empty string instead of an invalid value ([#49460](https://github.com/angular/angular/pull/49460)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [978d37f324](https://github.com/angular/angular/commit/978d37f324ce4a1fe9b57f3d9430d7c28ecf6131) | fix | Ensure Router preloading works with lazy component and static children ([#49571](https://github.com/angular/angular/pull/49571)) |
| [a844435514](https://github.com/angular/angular/commit/a844435514962c52f4fb480bcfab7ee6519a59cc) | fix | fix [#49457](https://github.com/angular/angular/pull/49457) outlet activating with old info ([#49459](https://github.com/angular/angular/pull/49459)) |
## Special Thanks
Alan Agius, Andrew Scott, Asaf Malin, Jan Cabadaj, Kristiyan Kostadinov, Matthieu Riegler, Paul Gschwendtner, Sid and Tano Abeleyra

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.0.0-next.4"></a>
# 16.0.0-next.4 (2023-03-22)
## Breaking Changes
### platform-server
- `renderApplication` method no longer accepts a root component as first argument. Instead, provide a bootstrapping function that returns a `Promise<ApplicationRef>`.
  
  Before
  ```ts
  const output: string = await renderApplication(RootComponent, options);
  ```
  
  Now
  ```ts
  const bootstrap = () => bootstrapApplication(RootComponent, appConfig);
  const output: string = await renderApplication(bootstrap, options);
  ```
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [13dd614cd1](https://github.com/angular/angular/commit/13dd614cd1da65eee947fd6971b7d6e1d6def207) | feat | add support for compile-time required inputs ([#49453](https://github.com/angular/angular/pull/49453)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [17e9862653](https://github.com/angular/angular/commit/17e9862653758ebdbd29771cd4ec8a59436497d6) | feat | add API to provide CSP nonce for inline stylesheets ([#49444](https://github.com/angular/angular/pull/49444)) |
| [d1617c449d](https://github.com/angular/angular/commit/d1617c449d23c6573803cce36391134e8d0103a3) | feat | allow removal of previously registered DestroyRef callbacks ([#49493](https://github.com/angular/angular/pull/49493)) |
| [230345876c](https://github.com/angular/angular/commit/230345876c2a2ff6289ca44c5a00fc6421c8d8eb) | fix | Allow `TestBed.configureTestingModule` to work with recursive cycle of standalone components. ([#49473](https://github.com/angular/angular/pull/49473)) |
| [e655e8a603](https://github.com/angular/angular/commit/e655e8a603d923de3a6ff27edab8bae1796a71a0) | fix | more accurate matching of classes during content projection ([#48888](https://github.com/angular/angular/pull/48888)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [546b285ec1](https://github.com/angular/angular/commit/546b285ec1fb6c5af210549825c0ee6d9a99261e) | fix | preserve trailing commas in code generated by standalone migration ([#49533](https://github.com/angular/angular/pull/49533)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [c934a8e72b](https://github.com/angular/angular/commit/c934a8e72bec9f96ccf1a1de1a3384d40dfd2731) | fix | only add `ng-app-id` to style on server side ([#49465](https://github.com/angular/angular/pull/49465)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [41f27ad086](https://github.com/angular/angular/commit/41f27ad08643839d09daf4588069a3f8fe627070) | refactor | remove `renderApplication` overload that accepts a component ([#49463](https://github.com/angular/angular/pull/49463)) |
## Special Thanks
Aditya Srinivasan, Alan Agius, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Jessica Janiuk, Kristiyan Kostadinov, Masaoki Kobayashi, Matthieu Riegler, Paul Gschwendtner, Pawel Kozlowski, Peter Götz, Thomas Pischke, Virginia Dooley and avmaxim

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.2.4"></a>
# 15.2.4 (2023-03-22)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [bae6b5ceb1](https://github.com/angular/angular/commit/bae6b5ceb16bd87c8146aa29564a8d29135a6f95) | fix | Allow `TestBed.configureTestingModule` to work with recursive cycle of standalone components. ([#49473](https://github.com/angular/angular/pull/49473)) |
| [087f4412af](https://github.com/angular/angular/commit/087f4412afe9ccdefe7d63012af749b79f3e84d0) | fix | more accurate matching of classes during content projection ([#48888](https://github.com/angular/angular/pull/48888)) |
## Special Thanks
Aditya Srinivasan, Alex Rickabaugh, Andrew Scott, Kristiyan Kostadinov, Masaoki Kobayashi, Matthieu Riegler, Paul Gschwendtner, Peter Götz, Thomas Pischke, Virginia Dooley and avmaxim

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.0.0-next.3"></a>
# 16.0.0-next.3 (2023-03-16)
## Breaking Changes
### core
- The `APP_ID` token value is no longer randomly generated. If you are bootstrapping multiple application on the same page you will need to set to provide the `APP_ID` yourself.
  
  ```ts
  bootstrapApplication(ComponentA, {
    providers: [
     { provide: APP_ID, useValue: 'app-a' },
     // ... other providers ...
    ]
  });
  ```
### router
- `ComponentFactoryResolver` has been removed from Router APIs.
  Component factories are not required to create an instance of a component
  dynamically. Passing a factory resolver via resolver argument is no longer needed
  and code can instead use `ViewContainerRef.createComponent` without the
  factory resolver.
## Deprecations
### core
- `EnvironmentInjector.runInContext` is now deprecated, with
  `runInInjectionContext` functioning as a direct replacement:
  
  ```typescript
  // Previous method version (deprecated):
  envInjector.runInContext(fn);
  // New standalone function:
  runInInjectionContext(envInjector, fn);
  ```
### platform-browser
- `BrowserModule.withServerTransition` has been deprecated. `APP_ID` should be used instead to set the application ID.
  NB: Unless, you render multiple Angular applications on the same page, setting an application ID is not necessary.
  
  Before:
  ```ts
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    ...
  ]
  ```
  
  After:
  ```ts
  imports: [
    BrowserModule,
    { provide: APP_ID, useValue: 'serverApp' },
    ...
  ],
  ```
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [1a6ca68154](https://github.com/angular/angular/commit/1a6ca68154dd73bac4b8d2e094d97952f60b3e30) | feat | add support for compile-time required inputs ([#49304](https://github.com/angular/angular/pull/49304)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [0814f20594](https://github.com/angular/angular/commit/0814f2059406dff9cefdd8b210756b6fdcba15b1) | feat | introduce `runInInjectionContext` and deprecate prior version ([#49396](https://github.com/angular/angular/pull/49396)) |
| [0e5f9ba6f4](https://github.com/angular/angular/commit/0e5f9ba6f427a79a0b741c1780cd2ff72cc3100a) | fix | generate consistent component IDs ([#48253](https://github.com/angular/angular/pull/48253)) |
| [82d6fbb109](https://github.com/angular/angular/commit/82d6fbb109491607bd2e4feaa35c3dace79e4576) | refactor | generate a static application ID ([#49422](https://github.com/angular/angular/pull/49422)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [630af63fae](https://github.com/angular/angular/commit/630af63fae2e279e88805aecf01db58be6dfbafb) | feat | deprecate `withServerTransition` call ([#49422](https://github.com/angular/angular/pull/49422)) |
| [9165ff2517](https://github.com/angular/angular/commit/9165ff2517448b43bb910001816108702088e93e) | fix | reuse server generated component styles ([#48253](https://github.com/angular/angular/pull/48253)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [056d68002f](https://github.com/angular/angular/commit/056d68002fbe6024b486bb7220bc77f8f9a07707) | feat | add `provideServerSupport` function to provide server capabilities to an application ([#49380](https://github.com/angular/angular/pull/49380)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [c0b1b7becf](https://github.com/angular/angular/commit/c0b1b7becf65d5f21018a1794aafe9bbfbd5ce05) | fix | Remove deprecated ComponentFactoryResolver from APIs ([#49239](https://github.com/angular/angular/pull/49239)) |
### service-worker
| Commit | Type | Description |
| -- | -- | -- |
| [5e7fc259ea](https://github.com/angular/angular/commit/5e7fc259ead62ee9b4f8a9a77a455065b6a8e2d8) | feat | add function to provide service worker ([#48247](https://github.com/angular/angular/pull/48247)) |
## Special Thanks
Alan Agius, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Esteban Gehring, Jessica Janiuk, JiaLiPassion, Julien Saguet, Kristiyan Kostadinov, Matthieu Riegler, Paul Gschwendtner and Virginia Dooley

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.2.3"></a>
# 15.2.3 (2023-03-16)
## Special Thanks
Alan Agius, Esteban Gehring, Matthieu Riegler and Virginia Dooley

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.3.0"></a>
# 14.3.0 (2023-03-13)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [37bbc61cfe](https://github.com/angular/angular/commit/37bbc61cfeca1531a80393636c096ce452a67d27) | feat | Backport NgOptimizedImage to Angular 14. |
## Special Thanks
Alex Castle, Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.0.0-next.2"></a>
# 16.0.0-next.2 (2023-03-08)
## Breaking Changes
### common
- Deprecated `XhrFactory` export from `@angular/common/http` has been removed. Use `XhrFactory` from `@angular/common` instead.
### core
- `zone.js` versions `0.11.x` and `0.12.x` are not longer supported.
### platform-server
- `renderModuleFactory` has been removed. Use `renderModule` instead.
## Deprecations
### platform-browser
- `ApplicationConfig` has moved, please import `ApplicationConfig` from `@angular/core` instead.
### common
| Commit | Type | Description |
| -- | -- | -- |
| [c41a21658c](https://github.com/angular/angular/commit/c41a21658c9a56044b5d7f62cab4fcad5a5732c7) | refactor | remove deprecated `XhrFactory` export from `http` entrypoint ([#49251](https://github.com/angular/angular/pull/49251)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [1407a9aeaf](https://github.com/angular/angular/commit/1407a9aeaf5edf33dfb9b52d7b2baaebef9b80ed) | feat | support multiple configuration files in `extends` ([#49125](https://github.com/angular/angular/pull/49125)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [4e9531f777](https://github.com/angular/angular/commit/4e9531f7773e7bf0d3034a36c62f34f914e4a451) | feat | add `mergeApplicationConfig` method ([#49253](https://github.com/angular/angular/pull/49253)) |
| [fdf61974d1](https://github.com/angular/angular/commit/fdf61974d1155b771d7d53c7bbc3bd2b0f6681cb) | feat | drop support for `zone.js` versions `<=0.12.0` ([#49331](https://github.com/angular/angular/pull/49331)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [2fbaee3cbe](https://github.com/angular/angular/commit/2fbaee3cbe0dd24fc9c03a4c3d0e0117c26acb53) | fix | add protractor support if protractor imports are detected ([#49274](https://github.com/angular/angular/pull/49274)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [3aa85a8087](https://github.com/angular/angular/commit/3aa85a8087643ce79da6d1aeae7b925bb76315a5) | refactor | move `ApplicationConfig` to core ([#49253](https://github.com/angular/angular/pull/49253)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [b5278cc115](https://github.com/angular/angular/commit/b5278cc115ee6383a20783967b9e7da3f6184dcd) | feat | `renderApplication` now accepts a bootstrapping method ([#49248](https://github.com/angular/angular/pull/49248)) |
| [17abe6dc96](https://github.com/angular/angular/commit/17abe6dc96a443de0c2f9575bb160042a031fed1) | refactor | remove deprecated `renderModuleFactory` ([#49247](https://github.com/angular/angular/pull/49247)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [ea32c3289a](https://github.com/angular/angular/commit/ea32c3289ad773a821b3432fb8d4c36d0d9fbd9d) | feat | Expose information about the last successful `Navigation` ([#49235](https://github.com/angular/angular/pull/49235)) |
## Special Thanks
Alan Agius, Andrew Kushnir, Andrew Scott, Dylan Hunn, Jessica Janiuk, JiaLiPassion, Kristiyan Kostadinov, Matthieu Riegler, Paul Gschwendtner, Sai Kartheek Bommisetty and Vinit Neogi

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.2.2"></a>
# 15.2.2 (2023-03-08)
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [6207d6f1f0](https://github.com/angular/angular/commit/6207d6f1f0771ff3b74379367e65af665ef0e51c) | fix | add protractor support if protractor imports are detected ([#49274](https://github.com/angular/angular/pull/49274)) |
## Special Thanks
Alan Agius, Andrew Kushnir, Andrew Scott, Kristiyan Kostadinov, Matthieu Riegler, Paul Gschwendtner, Sai Kartheek Bommisetty and Vinit Neogi

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.0.0-next.1"></a>
# 16.0.0-next.1 (2023-03-01)
## Breaking Changes
### compiler
- * TypeScript 4.8 is no longer supported.
### core
- Node.js v14 support has been removed
  
  Node.js v14 is planned to be End-of-Life on 2023-04-30. Angular will stop supporting Node.js v14 in Angular v16. Angular v16 will continue to officially support Node.js versions v16 and v18.
### router
- Tests which mock `ActivatedRoute` instances may need to be adjusted
  because Router.createUrlTree now does the right thing in more
  scenarios. This means that tests with invalid/incomplete ActivatedRoute mocks
  may behave differently than before. Additionally, tests may now navigate
  to a real URL where before they would navigate to the root. Ensure that
  tests provide expected routes to match.
  There is rarely production impact, but it has been found that relative
  navigations when using an `ActivatedRoute` that does not appear in the
  current router state were effectively ignored in the past. By creating
  the correct URLs, this sometimes resulted in different navigation
  behavior in the application. Most often, this happens when attempting to
  create a navigation that only updates query params using an empty
  command array, for example `router.navigate([], {relativeTo: route,
  queryParams: newQueryParams})`. In this case, the `relativeTo` property
  should be removed.
### common
| Commit | Type | Description |
| -- | -- | -- |
| [3c9d49a4d7](https://github.com/angular/angular/commit/3c9d49a4d7304202d60eeed97b2bb00686c079d0) | fix | make Location.normalize() return the correct path when the base path contains characters that interfere with regex syntax. ([#49181](https://github.com/angular/angular/pull/49181)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [79cdfeb392](https://github.com/angular/angular/commit/79cdfeb3921687dfbc8fea8d9f7ba4dbb14a7193) | feat | drop support for TypeScript 4.8 ([#49155](https://github.com/angular/angular/pull/49155)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [b6c6dfd278](https://github.com/angular/angular/commit/b6c6dfd2781864de51bdf4bc45636aae68ea8828) | fix | do not persist component analysis if template/styles are missing ([#49184](https://github.com/angular/angular/pull/49184)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [99d874fe3b](https://github.com/angular/angular/commit/99d874fe3b486f3669b0e8f1910e31c4fa278308) | feat | add support for TypeScript 5.0 ([#49126](https://github.com/angular/angular/pull/49126)) |
| [0f5c8003cc](https://github.com/angular/angular/commit/0f5c8003ccd1a75516d6a0e31cdb752d031ec430) | feat | introduce concept of DestroyRef ([#49158](https://github.com/angular/angular/pull/49158)) |
| [e9edea363c](https://github.com/angular/angular/commit/e9edea363cd2da6560c3c3ec2522d1048084461b) | fix | update zone.js peerDependencies ranges ([#49244](https://github.com/angular/angular/pull/49244)) |
| [f594725951](https://github.com/angular/angular/commit/f594725951fafde475ee99ffccf1175c13c48288) | refactor | remove Node.js v14 support ([#49255](https://github.com/angular/angular/pull/49255)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [87affadb87](https://github.com/angular/angular/commit/87affadb8710bbe0f23314115065fe9cc58306da) | fix | avoid migrating the same class multiple times in standalone migration ([#49245](https://github.com/angular/angular/pull/49245)) |
| [7dd19570e8](https://github.com/angular/angular/commit/7dd19570e8452fbdafe50636dcd18809ccea97ae) | fix | delete barrel exports in standalone migration ([#49176](https://github.com/angular/angular/pull/49176)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [a08a8ff108](https://github.com/angular/angular/commit/a08a8ff108bba88ba4bd7f30a6a8c1bcadb13db7) | fix | bundle @angular/domino in via esbuild ([#49229](https://github.com/angular/angular/pull/49229)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [455c728525](https://github.com/angular/angular/commit/455c7285257a8def53ae6c9d14e9848d72ae2613) | feat | helper functions to convert class guards to functional ([#48709](https://github.com/angular/angular/pull/48709)) |
| [7e35a917c5](https://github.com/angular/angular/commit/7e35a917c56e746cadfcd115c559853d3e632a1e) | fix | add error message when using loadComponent with a NgModule ([#49164](https://github.com/angular/angular/pull/49164)) |
| [31f210bf2c](https://github.com/angular/angular/commit/31f210bf2cd8a5cc8245c05a30ae3b8f8b9d826a) | fix | Router.createUrlTree should work with any ActivatedRoute ([#48508](https://github.com/angular/angular/pull/48508)) |
## Special Thanks
Alan Agius, Andrew Kushnir, Andrew Scott, Aristeidis Bampakos, Craig Spence, Doug Parker, Iván Navarro, Jessica Janiuk, JiaLiPassion, Joey Perrott, Kristiyan Kostadinov, Matthieu Riegler, Michael Ziluck, Paul Gschwendtner, Pawel Kozlowski, Stephanie Tuerk, Vincent and Virginia Dooley

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.2.1"></a>
# 15.2.1 (2023-03-01)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [f0e926074d](https://github.com/angular/angular/commit/f0e926074df189b3e3ca361a6a3bcd852c05e010) | fix | make Location.normalize() return the correct path when the base path contains characters that interfere with regex syntax. ([#49181](https://github.com/angular/angular/pull/49181)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [04d8b6c61a](https://github.com/angular/angular/commit/04d8b6c61a0d0a2d61b9202d09774f3ab347e82f) | fix | do not persist component analysis if template/styles are missing ([#49184](https://github.com/angular/angular/pull/49184)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [d60ea6ab5a](https://github.com/angular/angular/commit/d60ea6ab5a22cb4f3677e34d0d7f6be0c3fe23fe) | fix | update zone.js peerDependencies ranges ([#49244](https://github.com/angular/angular/pull/49244)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [44d095a61c](https://github.com/angular/angular/commit/44d095a61cb340ea1f5e0a19370ea839378b02c3) | fix | avoid migrating the same class multiple times in standalone migration ([#49245](https://github.com/angular/angular/pull/49245)) |
| [92b0bda9e4](https://github.com/angular/angular/commit/92b0bda9e4e7117552f929bf86acfc0ae65779a1) | fix | delete barrel exports in standalone migration ([#49176](https://github.com/angular/angular/pull/49176)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [3062442728](https://github.com/angular/angular/commit/30624427289ad65bdbabd865d028146753c3a97a) | fix | add error message when using loadComponent with a NgModule ([#49164](https://github.com/angular/angular/pull/49164)) |
## Special Thanks
Alan Agius, Andrew Kushnir, Aristeidis Bampakos, Craig Spence, Doug Parker, Iván Navarro, Joey Perrott, Kristiyan Kostadinov, Matthieu Riegler, Michael Ziluck, Paul Gschwendtner, Stephanie Tuerk, Vincent and Virginia Dooley

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.0.0-next.0"></a>
# 16.0.0-next.0 (2023-02-22)
## Breaking Changes
### compiler
- Angular Compatibility Compiler (ngcc) has been removed. As a result, Angular View Engine libraries can no longer be used in v16+. Such libraries were not officially supported, but this is a hard break in compatibility.
### common
- `MockPlatformLocation` is now provided by default in tests.
  Existing tests may have behaviors which rely on
  `BrowserPlatformLocation` instead. For example, direct access to the
  `window.history` in either the test or the component rather than going
  through the Angular APIs (`Location.getState()`). The quickest fix is to
  update the providers in the test suite to override the provider again
  `TestBed.configureTestingModule({providers: [{provide: PlatformLocation, useClass: BrowserPlatformLocation}]})`.
  The ideal fix would be to update the code to instead be compatible with
  `MockPlatformLocation` instead.
### core
- `RendererType2.styles` no longer accepts a nested arrays.
### router
- The `Scroll` event's `routerEvent` property may also be
  a `NavigationSkipped` event. Previously, it was only a `NavigationEnd`
  event.
- The `RouterEvent` type is no longer present in the `Event` union type representing all router event types. If you have code using something like `filter((e: Event): e is RouterEvent => e instanceof RouterEvent)`, you'll need to update it to `filter((e: Event|RouterEvent): e is RouterEvent => e instanceof RouterEvent)`.
### 
| Commit | Type | Description |
| -- | -- | -- |
| [48aa96ea13](https://github.com/angular/angular/commit/48aa96ea13ebfadf2f6b13516c7702dae740a7be) | refactor | remove Angular Compatibility Compiler (ngcc) ([#49101](https://github.com/angular/angular/pull/49101)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [5dce2a5a3a](https://github.com/angular/angular/commit/5dce2a5a3a00693d835a57934b9abacce5a33dfa) | feat | Provide MockPlatformLocation by default in BrowserTestingModule ([#49137](https://github.com/angular/angular/pull/49137)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [bc5ddabdcb](https://github.com/angular/angular/commit/bc5ddabdcb39e6ebbe2da03dc8ec49bbe26c677d) | feat | add Angular Signals to the public API ([#49150](https://github.com/angular/angular/pull/49150)) |
| [9b9c818f99](https://github.com/angular/angular/commit/9b9c818f99c44473e915bedd157146c88e44989a) | perf | change `RendererType2.styles` to accept a only a flat array ([#49072](https://github.com/angular/angular/pull/49072)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [1f055b90b6](https://github.com/angular/angular/commit/1f055b90b65cce2d0d063ed44cb0f8fbecb9b1f6) | fix | Ensure anchor scrolling happens on ignored same URL navigations ([#48025](https://github.com/angular/angular/pull/48025)) |
| [1e32709e0e](https://github.com/angular/angular/commit/1e32709e0e16f553ed3e7778705c9a0c5641d0af) | fix | remove RouterEvent from Event union type ([#46061](https://github.com/angular/angular/pull/46061)) |
## Special Thanks
Alan Agius, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Cédric Exbrayat, Joey Perrott, Mladen Jakovljević and Pawel Kozlowski

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.2.0"></a>
# 15.2.0 (2023-02-22)
## Deprecations
### 
- Class and `InjectionToken` guards and resolvers are
  deprecated. Instead, write guards as plain JavaScript functions and
  inject dependencies with `inject` from `@angular/core`.
### 
| Commit | Type | Description |
| -- | -- | -- |
| [926c35f4ac](https://github.com/angular/angular/commit/926c35f4ac70f5e4d142e545d6d056dd67aac97b) | docs | Deprecate class and InjectionToken and resolvers ([#47924](https://github.com/angular/angular/pull/47924)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [54b24eb40f](https://github.com/angular/angular/commit/54b24eb40fed13c926305ad475202a5608d41c6b) | feat | Add loaderParams attribute to NgOptimizedImage ([#48907](https://github.com/angular/angular/pull/48907)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [0cf11167f1](https://github.com/angular/angular/commit/0cf11167f13108992ec781e88ab2a7d1fc7f5a0d) | fix | incorrectly detecting forward refs when symbol already exists in file ([#48988](https://github.com/angular/angular/pull/48988)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [a154db8a81](https://github.com/angular/angular/commit/a154db8a81cbdfed8c3d0db1e2a5bf43aa3e0bbf) | feat | add ng generate schematic to convert declarations to standalone ([#48790](https://github.com/angular/angular/pull/48790)) |
| [345e737daa](https://github.com/angular/angular/commit/345e737daa7b9f635a4c2923358e5e765f716434) | feat | add ng generate schematic to convert to standalone bootstrapping APIs ([#48848](https://github.com/angular/angular/pull/48848)) |
| [e7318fc758](https://github.com/angular/angular/commit/e7318fc758d9e64d1a7f60a2c7071a769b73e7d8) | feat | add ng generate schematic to remove unnecessary modules ([#48832](https://github.com/angular/angular/pull/48832)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [4ae384fd61](https://github.com/angular/angular/commit/4ae384fd619a13eaadf737d08a97f07e1f6b273c) | feat | Allow auto-imports of a pipe via quick fix when its selector is used, both directly and via reexports. ([#48354](https://github.com/angular/angular/pull/48354)) |
| [141333411e](https://github.com/angular/angular/commit/141333411e67769d752c7162e4cb03376022f5e1) | feat | Introduce a new NgModuleIndex, and use it to suggest re-exports. ([#48354](https://github.com/angular/angular/pull/48354)) |
| [d0145033bd](https://github.com/angular/angular/commit/d0145033bd11eccd16fa8b61ba9170037d0c62b3) | fix | generate forwardRef for same file imports ([#48898](https://github.com/angular/angular/pull/48898)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [2796230e95](https://github.com/angular/angular/commit/2796230e953eb8c29d6227a1a3858f5f08a8f200) | fix | add `enum` in `mode` option in `standalone` schema ([#48851](https://github.com/angular/angular/pull/48851)) |
| [816e76a578](https://github.com/angular/angular/commit/816e76a5789b041fee78ddd278c0e0d19b9a617a) | fix | automatically prune root module after bootstrap step ([#49030](https://github.com/angular/angular/pull/49030)) |
| [bdbf21d04b](https://github.com/angular/angular/commit/bdbf21d04ba74a6f73469242076d6ce697c57edf) | fix | avoid generating imports with forward slashes ([#48993](https://github.com/angular/angular/pull/48993)) |
| [32cf4e5cb9](https://github.com/angular/angular/commit/32cf4e5cb989f365296d519dddf72fb38ca47c40) | fix | avoid internal modules when generating imports ([#48958](https://github.com/angular/angular/pull/48958)) |
| [521ccfbe6c](https://github.com/angular/angular/commit/521ccfbe6ce9af1a7ddd6ab5e70151b7198f82ef) | fix | avoid interrupting the migration if language service lookup fails ([#49010](https://github.com/angular/angular/pull/49010)) |
| [a40cd47aa7](https://github.com/angular/angular/commit/a40cd47aa7ebccfbeeb26e397e03f1372aa10a55) | fix | avoid modifying testing modules without declarations ([#48921](https://github.com/angular/angular/pull/48921)) |
| [1afa6ed322](https://github.com/angular/angular/commit/1afa6ed3227e784e3fe2b4b31443961589cb6332) | fix | don't add ModuleWithProviders to standalone test components ([#48987](https://github.com/angular/angular/pull/48987)) |
| [c98c6a8452](https://github.com/angular/angular/commit/c98c6a845286b9b89daf275a9c4a2bdbc7ad77a7) | fix | don't copy animations modules into the imports of test components ([#49147](https://github.com/angular/angular/pull/49147)) |
| [8389557848](https://github.com/angular/angular/commit/83895578488bd35c7e47609f092907eb0f53f435) | fix | don't copy unmigrated declarations into imports array ([#48882](https://github.com/angular/angular/pull/48882)) |
| [f82bdc4b01](https://github.com/angular/angular/commit/f82bdc4b01f93a7103870449d37da61cc4c4f179) | fix | don't delete classes that may provide dependencies transitively ([#48866](https://github.com/angular/angular/pull/48866)) |
| [759db12e0b](https://github.com/angular/angular/commit/759db12e0b618fcb51f4cb141adeb49bfa495a60) | fix | duplicated comments on migrated classes ([#48966](https://github.com/angular/angular/pull/48966)) |
| [ba38178d19](https://github.com/angular/angular/commit/ba38178d1918d413f9c2260c40eb6542eadfddba) | fix | generate forwardRef for same file imports ([#48898](https://github.com/angular/angular/pull/48898)) |
| [03fcb36cfd](https://github.com/angular/angular/commit/03fcb36cfd36731028bf288f156e16cb8ac4c758) | fix | migrate HttpClientModule to provideHttpClient() ([#48949](https://github.com/angular/angular/pull/48949)) |
| [2de6dae16d](https://github.com/angular/angular/commit/2de6dae16d4b0b83f0517a3033cda44ba44154ed) | fix | migrate RouterModule.forRoot with a config object to use features ([#48935](https://github.com/angular/angular/pull/48935)) |
| [770191cf1f](https://github.com/angular/angular/commit/770191cf1f1254546625dfa7a882b716c3f0aab3) | fix | migrate tests when switching to standalone bootstrap API ([#48987](https://github.com/angular/angular/pull/48987)) |
| [c7926b5773](https://github.com/angular/angular/commit/c7926b57730c23f765a00d3dd9f92079c95e87e0) | fix | move standalone migrations into imports ([#48987](https://github.com/angular/angular/pull/48987)) |
| [65c74ed93e](https://github.com/angular/angular/commit/65c74ed93e04cb560c27838d440c6aa7a9859a4e) | fix | normalize paths to posix ([#48850](https://github.com/angular/angular/pull/48850)) |
| [6377487b1a](https://github.com/angular/angular/commit/6377487b1ab7679cef9a44f88440fe5e8eb97480) | fix | only exclude bootstrapped declarations from initial standalone migration ([#48987](https://github.com/angular/angular/pull/48987)) |
| [e9e4449a43](https://github.com/angular/angular/commit/e9e4449a43430e026e61b0f05ebd32dd830fa916) | fix | preserve tsconfig in standalone migration ([#48987](https://github.com/angular/angular/pull/48987)) |
| [ffad1b49d9](https://github.com/angular/angular/commit/ffad1b49d95ab90637e7184f92cb5136d490d865) | fix | reduce number of files that need to be checked ([#48987](https://github.com/angular/angular/pull/48987)) |
| [ba7a757cc5](https://github.com/angular/angular/commit/ba7a757cc5a2f3f942adcbabdcd5b7aef33ea493) | fix | return correct alias when conflicting import exists ([#49139](https://github.com/angular/angular/pull/49139)) |
| [49a7c9f94a](https://github.com/angular/angular/commit/49a7c9f94ae8f89907da8b3620242e62f87ec5a4) | fix | standalone migration incorrectly throwing path error for multi app projects ([#48958](https://github.com/angular/angular/pull/48958)) |
| [584976e6c8](https://github.com/angular/angular/commit/584976e6c8a783d40578ab191132673300394a52) | fix | support --defaults in standalone migration ([#48921](https://github.com/angular/angular/pull/48921)) |
| [03f47ac901](https://github.com/angular/angular/commit/03f47ac9019eddbcb373b50c41bc6f523293ece1) | fix | use consistent quotes in generated imports ([#48876](https://github.com/angular/angular/pull/48876)) |
| [ebae506d89](https://github.com/angular/angular/commit/ebae506d894a90c38e0f2dd1e948acabdb0fdf2e) | fix | use import remapper in root component ([#49046](https://github.com/angular/angular/pull/49046)) |
| [40c976c909](https://github.com/angular/angular/commit/40c976c90975878852a87b7722076eb78944098b) | fix | use NgForOf instead of NgFor ([#49022](https://github.com/angular/angular/pull/49022)) |
| [4ac25b2aff](https://github.com/angular/angular/commit/4ac25b2affab4f959ad8c111f1e429a05b435422) | perf | avoid re-traversing nodes when resolving bootstrap call dependencies ([#49010](https://github.com/angular/angular/pull/49010)) |
| [26cb7ab2e6](https://github.com/angular/angular/commit/26cb7ab2e6ac9b61904361a8a544467b69eef3f3) | perf | speed up language service lookups ([#49010](https://github.com/angular/angular/pull/49010)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [bf4ad38117](https://github.com/angular/angular/commit/bf4ad3811762d9ba43d18c3360d014a9ceb06b4d) | fix | remove styles from DOM of destroyed components ([#48298](https://github.com/angular/angular/pull/48298)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [25e220a23a](https://github.com/angular/angular/commit/25e220a23ab90520efc65f05cd9b7a22db582b87) | fix | avoid duplicate TransferState info after renderApplication call ([#49094](https://github.com/angular/angular/pull/49094)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [31b94c762f](https://github.com/angular/angular/commit/31b94c762fc91ab6cabe08ea6812780fdcf92a64) | feat | Add a withNavigationErrorHandler feature to provideRouter ([#48551](https://github.com/angular/angular/pull/48551)) |
| [dedac8d3f7](https://github.com/angular/angular/commit/dedac8d3f73ebf4f05b773454e2a22ab5fa4bf7c) | feat | Add test helper for trigger navigations in tests ([#48552](https://github.com/angular/angular/pull/48552)) |
## Special Thanks
Alan Agius, Alex Castle, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Dylan Hunn, Ikko Eltociear Ashimine, Ilyass, Jessica Janiuk, Joey Perrott, John Manners, Kalbarczyk, Kristiyan Kostadinov, Matthieu Riegler, Paul Gschwendtner, Pawel Kozlowski, Virginia Dooley, Walid Bouguima, cexbrayat and mgechev

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.1.5"></a>
# 15.1.5 (2023-02-15)
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [5f2a3edcf2](https://github.com/angular/angular/commit/5f2a3edcf27cfe6ffc6ae4d67ca2b47953f26336) | fix | Make radio buttons respect `[attr.disabled]` ([#48864](https://github.com/angular/angular/pull/48864)) |
## Special Thanks
AleksanderBodurri, Alvaro Junqueira, Dylan Hunn, Joey Perrott, Matthieu Riegler, PaloMiklo and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.1.4"></a>
# 15.1.4 (2023-02-08)
## Special Thanks
Jessica Janiuk, Kian Yang Lee, Matthieu Riegler, Redouane Bekkouche and Simona Cotin

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.1.3"></a>
# 15.1.3 (2023-02-02)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [d36dfd4b62](https://github.com/angular/angular/commit/d36dfd4b626ff4c5894ca67136f71dd1f7f56e3e) | fix | fix non-animatable warnings for easing ([#48583](https://github.com/angular/angular/pull/48583)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [a334e4efbe](https://github.com/angular/angular/commit/a334e4efbe9380776e574f745390901552df771e) | fix | warn if using ngSrcset without a configured image loader ([#48804](https://github.com/angular/angular/pull/48804)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [171b4d4640](https://github.com/angular/angular/commit/171b4d46407e7c2860fdce4a5196fd6a34b455f0) | fix | incorrect code when non-null assertion is used after a safe access ([#48801](https://github.com/angular/angular/pull/48801)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [9e86dd231b](https://github.com/angular/angular/commit/9e86dd231bd0fb818da537191bbe197f15efc44d) | fix | Fixed file format issue with lint ([#48859](https://github.com/angular/angular/pull/48859)) |
| [af31f98b00](https://github.com/angular/angular/commit/af31f98b00a5d3decbb39df1f998346b3002b89e) | fix | migration host incorrectly reading empty files ([#48849](https://github.com/angular/angular/pull/48849)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [73972c684e](https://github.com/angular/angular/commit/73972c684e214bc0e7c88338e001ff99a14dbcdc) | fix | insert transfer state `script` before other `script` tags ([#48868](https://github.com/angular/angular/pull/48868)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [d5b2c249a3](https://github.com/angular/angular/commit/d5b2c249a3b220d0a47413c6e1054fd49d9d8cd8) | fix | Handle routerLink directive on svg anchors. ([#48857](https://github.com/angular/angular/pull/48857)) |
## Special Thanks
Alan Agius, Besim Gürbüz, Brecht Billiet, Dario Piotrowicz, Dylan Hunn, Iván Navarro, Jessica Janiuk, Kristiyan Kostadinov, Matthieu Riegler, Onkar Ruikar, Payam Valadkhan, Santosh Yadav, Virginia Dooley and Walid Bouguima

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.1.2"></a>
# 15.1.2 (2023-01-25)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [98ccb57117](https://github.com/angular/angular/commit/98ccb571176632cf4d434e9e54b086bb63601148) | fix | handle css selectors with space after an escaped character. ([#48558](https://github.com/angular/angular/pull/48558)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [145f848a10](https://github.com/angular/angular/commit/145f848a10b4dc791cbf42b803983357735d5f86) | fix | resolve deprecation warning ([#48812](https://github.com/angular/angular/pull/48812)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [a6b10f6e59](https://github.com/angular/angular/commit/a6b10f6e597e666a55ef1cd2aecdf3a309cebad8) | fix | 'createUrlTreeFromSnapshot' with empty paths and named outlets ([#48734](https://github.com/angular/angular/pull/48734)) |
## Special Thanks
Alan Agius, AleksanderBodurri, Andrew Kushnir, Andrew Scott, Charles Lyding, Dylan Hunn, JoostK, Matthieu Riegler, Paul Gschwendtner, Payam Valadkhan, Virginia Dooley, Yann Thomas LE MOIGNE and dario-piotrowicz

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.1.1"></a>
# 15.1.1 (2023-01-18)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [68ce4f6ab4](https://github.com/angular/angular/commit/68ce4f6ab495f78858281b902e6433fe90ed6dbf) | fix | Update `Location` to get a normalized URL valid in case a represented URL starts with the substring equals `APP_BASE_HREF` ([#48489](https://github.com/angular/angular/pull/48489)) |
| [032b2bd689](https://github.com/angular/angular/commit/032b2bd689e24ece61e23bfe9a39a11676958b8d) | perf | avoid excessive DOM mutation in NgClass ([#48433](https://github.com/angular/angular/pull/48433)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [dd54f6bd96](https://github.com/angular/angular/commit/dd54f6bd963f859d18af90d5b3834c443ec073f9) | fix | makeEnvironmentProviders should accept EnvironmentProviders ([#48720](https://github.com/angular/angular/pull/48720)) |
## Special Thanks
Alan Agius, Alex Rickabaugh, Andrew Scott, Aristeidis Bampakos, Bob Watson, Jens, Konstantin Kharitonov, Kristiyan Kostadinov, Matthieu Riegler, Paul Gschwendtner, Pawel Kozlowski, Vladyslav Slipchenko, ced, dario-piotrowicz, mgechev and ノウラ

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.1.0"></a>
# 15.1.0 (2023-01-10)
## Deprecations
### router
- CanLoad guards in the Router are deprecated. Use CanMatch
  instead.
- router writable properties
  
  The following strategies are meant to be configured by registering the
  application strategy in DI via the `providers` in the root `NgModule` or
  `bootstrapApplication`:
  * `routeReuseStrategy`
  * `titleStrategy`
  * `urlHandlingStrategy`
  
  The following options are meant to be configured using the options
  available in `RouterModule.forRoot` or `provideRouter`.
  * `onSameUrlNavigation`
  * `paramsInheritanceStrategy`
  * `urlUpdateStrategy`
  * `canceledNavigationResolution`
  
  The following options are available in `RouterModule.forRoot` but not
  available in `provideRouter`:
  * `malformedUriErrorHandler` - This was found to not be used anywhere
    internally.
  * `errorHandler` - Developers can instead subscribe to `Router.events`
    and filter for `NavigationError`.
### common
| Commit | Type | Description |
| -- | -- | -- |
| [fe50813664](https://github.com/angular/angular/commit/fe50813664809a1177132a77bd2a316ad0858b9e) | feat | Add BrowserPlatformLocation to the public API ([#48488](https://github.com/angular/angular/pull/48488)) |
| [2f4f0638c7](https://github.com/angular/angular/commit/2f4f0638c74dccfc2d0522f67ab226d3227c0566) | fix | Add data attribtue to NgOptimizedImage ([#48497](https://github.com/angular/angular/pull/48497)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [a532d71975](https://github.com/angular/angular/commit/a532d71975bef463223fd5d8322e3140760c9134) | feat | allow self-closing tags on custom elements ([#48535](https://github.com/angular/angular/pull/48535)) |
| [caf7228f8a](https://github.com/angular/angular/commit/caf7228f8ac7e45e3fafeaee0576ae96738a047f) | fix | resolve deprecation warning ([#48652](https://github.com/angular/angular/pull/48652)) |
| [33f35b04ef](https://github.com/angular/angular/commit/33f35b04ef0f32f25624a6be59f8635675e3e131) | fix | type-only symbols incorrectly retained when downlevelling custom decorators ([#48638](https://github.com/angular/angular/pull/48638)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [caedef0f5b](https://github.com/angular/angular/commit/caedef0f5b37ac6530885223b26879c39c36c1bd) | fix | update `@babel/core` dependency and lock version ([#48634](https://github.com/angular/angular/pull/48634)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [6acae1477a](https://github.com/angular/angular/commit/6acae1477a212bbd85d0670913c2925fa3bc0c24) | feat | Add `TestBed.runInInjectionContext` to help test functions which use `inject` ([#47955](https://github.com/angular/angular/pull/47955)) |
| [38421578a2](https://github.com/angular/angular/commit/38421578a2573bcbc86c927ed4015e20fc39f04a) | feat | Make the `isStandalone()` function available in public API ([#48114](https://github.com/angular/angular/pull/48114)) |
| [dd42974b07](https://github.com/angular/angular/commit/dd42974b070b068135c1bc34072486ae440e45e0) | feat | support TypeScript 4.9 ([#48005](https://github.com/angular/angular/pull/48005)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [8aa8b4b77c](https://github.com/angular/angular/commit/8aa8b4b77cefcdd400ec9767b946b295ef42a066) | fix | Form provider FormsModule.withConfig return a FormsModule ([#48526](https://github.com/angular/angular/pull/48526)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [5f0b53c735](https://github.com/angular/angular/commit/5f0b53c7352f19480185c6b5c769e5012a2d2faa) | feat | Allow auto-imports to suggest multiple possible imports. ([#47787](https://github.com/angular/angular/pull/47787)) |
| [6a8ea29a04](https://github.com/angular/angular/commit/6a8ea29a04c35071d807bd2809e7fcbadd49f048) | fix | expose `package.json` for vscode extension resolution ([#48678](https://github.com/angular/angular/pull/48678)) |
| [ce8160ecb2](https://github.com/angular/angular/commit/ce8160ecb28d6765d438eb65035835984eb956ec) | fix | Prevent crashes on unemitable references ([#47938](https://github.com/angular/angular/pull/47938)) |
| [e615b598ba](https://github.com/angular/angular/commit/e615b598bab9c67bc34a44e39ef1d7066f9bf052) | fix | ship `/api` entry-point ([#48670](https://github.com/angular/angular/pull/48670)) |
| [6ce7d76a0e](https://github.com/angular/angular/commit/6ce7d76a0ea9cfc1591bee408719fa6da069344f) | fix | update packages/language-service/build.sh script to work with vscode-ng-language-service's new Bazel build ([#48663](https://github.com/angular/angular/pull/48663)) |
### localize
| Commit | Type | Description |
| -- | -- | -- |
| [a1a8e91eca](https://github.com/angular/angular/commit/a1a8e91ecaded6a2e4d700109a26d3117ad77c9c) | fix | add triple slash type reference on `@angular/localize` on `ng  add ([#48502](https://github.com/angular/angular/pull/48502)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [cc284afbbc](https://github.com/angular/angular/commit/cc284afbbc33b91884882204c5958a44a5d11392) | fix | combine newly-added imports in import manager ([#48620](https://github.com/angular/angular/pull/48620)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [228e992db7](https://github.com/angular/angular/commit/228e992db75bd7a2213b4596e6e2a8696578aa19) | docs | Deprecate canLoad guards in favor of canMatch ([#48180](https://github.com/angular/angular/pull/48180)) |
| [0a8b8a66cd](https://github.com/angular/angular/commit/0a8b8a66cdfb86586811c79bec938b3ab7215e8f) | docs | Deprecate public members of Router that are meant to be configured elsewhere ([#48006](https://github.com/angular/angular/pull/48006)) |
| [332461bd0c](https://github.com/angular/angular/commit/332461bd0c5f5734a9d7f051f0f4c6c173dd87c9) | feat | Add ability to override `onSameUrlNavigation` default per-navigation ([#48050](https://github.com/angular/angular/pull/48050)) |
| [f58ad86e51](https://github.com/angular/angular/commit/f58ad86e51817f83ff18db790a347528262b850b) | feat | Add feature provider for enabling hash navigation ([#48301](https://github.com/angular/angular/pull/48301)) |
| [73f03ad2d2](https://github.com/angular/angular/commit/73f03ad2d29811dda2ee03c5f18c79ebc9519c0b) | feat | Add new NavigationSkipped event for ignored navigations ([#48024](https://github.com/angular/angular/pull/48024)) |
| [3fe75710d9](https://github.com/angular/angular/commit/3fe75710d97a0f3224b2b09c45d9b8a9ad6efe91) | fix | page refresh should not destroy history state ([#48540](https://github.com/angular/angular/pull/48540)) |
## Special Thanks
Alan Agius, Alex Castle, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Bob Watson, Charles Lyding, Derek Cormier, Doug Parker, Dylan Hunn, George Kalpakas, Greg Magolan, Jessica Janiuk, JiaLiPassion, Joey Perrott, Kristiyan Kostadinov, Matthieu Riegler, Paul Gschwendtner, Pawel Kozlowski, Renan Ferro, Tim Gates, Vadim, Virginia Dooley, ced, mgechev, piyush132000, robertIsaac and sr5434

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.0.4"></a>
# 15.0.4 (2022-12-14)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [6c1064c72f](https://github.com/angular/angular/commit/6c1064c72f7d5b9a455813046939ab0161c143bf) | fix | fix incorrect handling of camel-case css properties ([#48436](https://github.com/angular/angular/pull/48436)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [f30d18a942](https://github.com/angular/angular/commit/f30d18a9424afacbd47d70f91e233e286bb94b0d) | fix | Fix TestBed.overrideProvider type to include multi ([#48424](https://github.com/angular/angular/pull/48424)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [b55d2dab5d](https://github.com/angular/angular/commit/b55d2dab5d76ffa809ac1feb78392a75c3081dec) | fix | evaluate const tuple types statically ([#48091](https://github.com/angular/angular/pull/48091)) |
## Special Thanks
Alan Agius, Andrew Kushnir, Andrew Scott, Aristeidis Bampakos, Bob Watson, BrowserPerson, Jens, Jessica Janiuk, Joey Perrott, JoostK, Konstantin Kharitonov, Lukas Matta, Piotr Kowalski, Virginia Dooley, Yannick Baron, dario-piotrowicz, lsst25, piyush132000 and why520crazy

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.0.3"></a>
# 15.0.3 (2022-12-07)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [50b1c2bf52](https://github.com/angular/angular/commit/50b1c2bf520e88828eadefcb2d0acaf151f8118e) | fix | Don't generate srcsets with very large sources ([#47997](https://github.com/angular/angular/pull/47997)) |
| [bf44dc234a](https://github.com/angular/angular/commit/bf44dc234a32069cb297ef7d3a87c2004cad8b00) | fix | Update `Location` to support base href containing `origin` ([#48327](https://github.com/angular/angular/pull/48327)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [9a5d84249a](https://github.com/angular/angular/commit/9a5d84249a0fd6b5c2a77c7ab6cbf72d90c45ee3) | fix | make sure selectors inside container queries are correctly scoped ([#48353](https://github.com/angular/angular/pull/48353)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [167bc0d163](https://github.com/angular/angular/commit/167bc0d1638ffd6fe91bcb40f96c2ab90f3e01cb) | fix | Produce diagnostic rather than crash when using invalid hostDirective ([#48314](https://github.com/angular/angular/pull/48314)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [e4dcaa513e](https://github.com/angular/angular/commit/e4dcaa513e7d5ccd3a63edf6132792873f01f7c1) | fix | unable to inject ChangeDetectorRef inside host directives ([#48355](https://github.com/angular/angular/pull/48355)) |
## Special Thanks
Alan Agius, Alex Castle, Andrew Kushnir, Andrew Scott, Bob Watson, Derek Cormier, Joey Perrott, Konstantin Kharitonov, Kristiyan Kostadinov, Paul Gschwendtner, Pawel Kozlowski, dario-piotrowicz and piyush132000

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.0.2"></a>
# 15.0.2 (2022-11-30)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [86a21f5569](https://github.com/angular/angular/commit/86a21f5569bc4b8060a882bd3d542a6c002438c7) | fix | accept inheriting the constructor from a class in a library ([#48156](https://github.com/angular/angular/pull/48156)) |
## Special Thanks
Alan Agius, Andrew Scott, Aristeidis Bampakos, Bob Watson, Derek Cormier, JoostK, Kristiyan Kostadinov, Matthieu Riegler, Paul Gschwendtner, Pawel Kozlowski, Rokas Brazdžionis, mgechev and piyush132000

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.0.1"></a>
# 15.0.1 (2022-11-22)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [930af9dd26](https://github.com/angular/angular/commit/930af9dd2607754e778922a4bb31055123229e24) | fix | Fix MockPlatformLocation events and missing onPopState implementation ([#48113](https://github.com/angular/angular/pull/48113)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [b342e55509](https://github.com/angular/angular/commit/b342e5550928c14ddfb33861189f67b39e163d05) | fix | don't mutate validators array ([#47830](https://github.com/angular/angular/pull/47830)) |
| [a12a120272](https://github.com/angular/angular/commit/a12a120272024e49bd3d80d9ed1ae30dcf8622f8) | fix | FormBuilder.group return right type with shorthand parameters. ([#48084](https://github.com/angular/angular/pull/48084)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [cc8b76ef7c](https://github.com/angular/angular/commit/cc8b76ef7cb908d2c95229f39bf82a13ca59570b) | fix | correctly handle host directive inputs/outputs ([#48147](https://github.com/angular/angular/pull/48147)) |
| [a8c33bf931](https://github.com/angular/angular/commit/a8c33bf93132425a617381e4aa9a6f0e8e0ddf5b) | fix | update packages/language-service/build.sh script to work with vscode-ng-language-service's new Bazel build ([#48120](https://github.com/angular/angular/pull/48120)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [e4309d57d8](https://github.com/angular/angular/commit/e4309d57d893e111bda3744a61630d1888ddbc02) | fix | correct type of nextState parameter in canDeactivate ([#48038](https://github.com/angular/angular/pull/48038)) |
| [9baefd085f](https://github.com/angular/angular/commit/9baefd085fb079c312c4c03d79775a0fcff933b9) | fix | Ensure renavigating in component init works with enabledBlocking ([#48063](https://github.com/angular/angular/pull/48063)) |
| [fa5528fb5f](https://github.com/angular/angular/commit/fa5528fb5f0fe6e4e6ea85d39e43262018520c43) | fix | restore 'history.state' on popstate even if navigationId missing ([#48033](https://github.com/angular/angular/pull/48033)) |
## Special Thanks
Alan Agius, Andrew Scott, Bjarki, Bob Watson, Brooke, Derek Cormier, Dylan Hunn, George Kalpakas, Greg Magolan, Ikko Ashimine, Ivan Rodriguez, Jessica Janiuk, Joe Roxbury, Joey Perrott, Kristiyan Kostadinov, Matthieu Riegler, Mikhail Savchuk, Nebojsa Cvetkovic, Pawel Kozlowski, Volodymyr and Wooshaah

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.2.17"></a>
# 12.2.17 (2022-11-22)
## Breaking Changes
### core
- Existing iframe usages may have security-sensitive attributes applied as an attribute or property binding in a template or via host bindings in a directive. Such usages would require an update to ensure compliance with the new stricter rules around iframe bindings.
### core
| Commit | Type | Description |
| -- | -- | -- |
| [b871db57da](https://github.com/angular/angular/commit/b871db57daab10ef6d4d92041177458f19fd3ebd) | fix | hardening attribute and property binding rules for <iframe> elements ([#48059](https://github.com/angular/angular/pull/48059)) |
## Special Thanks
Andrew Kushnir, Andrew Scott, George Looshch, Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.3.12"></a>
# 13.3.12 (2022-11-21)
## Breaking Changes
### core
- Existing iframe usages may have security-sensitive attributes applied as an attribute or property binding in a template or via host bindings in a directive. Such usages would require an update to ensure compliance with the new stricter rules around iframe bindings.
### core
| Commit | Type | Description |
| -- | -- | -- |
| [b1d7b79ff4](https://github.com/angular/angular/commit/b1d7b79ff4619d6e7967455d7cda72754f5dab9a) | fix | hardening attribute and property binding rules for <iframe> elements ([#48029](https://github.com/angular/angular/pull/48029)) |
## Special Thanks
Andrew Kushnir, Andrew Scott, George Looshch, Joey Perrott and Paul Gschwendtner

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.12"></a>
# 14.2.12 (2022-11-21)
## Breaking Changes
### core
- Existing iframe usages may have security-sensitive attributes applied as an attribute or property binding in a template or via host bindings in a directive. Such usages would require an update to ensure compliance with the new stricter rules around iframe bindings.
### core
| Commit | Type | Description |
| -- | -- | -- |
| [54814c8e9b](https://github.com/angular/angular/commit/54814c8e9ba6b82a7f4748ef2b2f47507efd758b) | fix | hardening attribute and property binding rules for <iframe> elements ([#48028](https://github.com/angular/angular/pull/48028)) |
## Special Thanks
Andrew Kushnir

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.0.0"></a>
# 15.0.0 (2022-11-16)

[Blog post "Angular v15 is now available"](http://goo.gle/angular-v15).

## Breaking Changes
### compiler
- Keyframes names are now prefixed with the component's "scope name".
  For example, the following keyframes rule in a component definition,
  whose "scope name" is host-my-cmp:
  
     @keyframes foo { ... }
  
  will become:
  
     @keyframes host-my-cmp_foo { ... }
  
  Any TypeScript/JavaScript code which relied on the names of keyframes rules
  will no longer match.
  
  The recommended solutions in this case are to either:
  - change the component's view encapsulation to the `None` or `ShadowDom`
  - define keyframes rules in global stylesheets (e.g styles.css)
  - define keyframes rules programmatically in code.
### compiler-cli
- Invalid constructors for DI may now report compilation errors
  
  When a class inherits its constructor from a base class, the compiler may now
  report an error when that constructor cannot be used for DI purposes. This may
  either be because the base class is missing an Angular decorator such as
  `@Injectable()` or `@Directive()`, or because the constructor contains parameters
  which do not have an associated token (such as primitive types like `string`).
  These situations used to behave unexpectedly at runtime, where the class may be
  constructed without any of its constructor parameters, so this is now reported
  as an error during compilation.
  
  Any new errors that may be reported because of this change can be resolved either
  by decorating the base class from which the constructor is inherited, or by adding
  an explicit constructor to the class for which the error is reported.
- Angular compiler option `enableIvy` has been removed as Ivy is the only rendering engine.
### core
- Angular no longer supports Node.js versions `14.[15-19].x` and `16.[10-12].x`. Current supported versions of Node.js are `14.20.x`, `16.13.x` and `18.10.x`.
- TypeScript versions older than 4.8 are no longer supported.
- Existing iframe usages may have security-sensitive attributes applied as an attribute or property binding in a template or via host bindings in a directive. Such usages would require an update to ensure compliance with the new stricter rules around iframe bindings.
- Existing iframe usages may have `src` or `srcdoc` preceding other attributes. Such usages may need to be updated to ensure compliance with the new stricter rules around iframe bindings.
### forms
- setDisabledState will always be called when a `ControlValueAccessor` is attached. You can opt-out with `FormsModule.withConfig` or `ReactiveFormsModule.withConfig`.
### localize
- - `canParse` method has been removed from all translation parsers in `@angular/localize/tools`. `analyze` should be used instead.
  -  the `hint` parameter in the`parse` methods is now mandatory.
### router
- Previously, the `RouterOutlet` would immediately
  instantiate the component being activated during navigation. Now the
  component is not instantiated until the change detection runs. This
  could affect tests which do not trigger change detection after a router
  navigation. In rarer cases, this can affect production code that relies
  on the exact timing of component availability.
- The title property is now required on ActivatedRouteSnapshot
- `relativeLinkResolution` is no longer configurable in
  the Router. This option was used as a means to opt out of a bug fix.
## Deprecations
### common
- The `DATE_PIPE_DEFAULT_TIMEZONE` token is now deprecated in favor
  of the `DATE_PIPE_DEFAULT_OPTIONS` token, which accepts an object
  as a value and the timezone can be defined as a field (called `timezone`)
  on that object.
### core
- - The ability to pass an `NgModule` to the `providedIn` option for
  `@Injectable` and `InjectionToken` is now deprecated.
  
  `providedIn: NgModule` was intended to be a tree-shakable alternative to
  NgModule providers. It does not have wide usage, and in most cases is used
  incorrectly, in circumstances where `providedIn: 'root'` should be
  preferred. If providers should truly be scoped to a specific NgModule, use
  `NgModule.providers` instead.
  
  - The ability to set `providedIn: 'any'` for an `@Injectable` or
  `InjectionToken` is now deprecated.
  
  `providedIn: 'any'` is an option with confusing semantics and is almost
  never used apart from a handful of esoteric cases internal to the framework.
- The bit field signature of `Injector.get()` has been deprecated, in favor of the new options object.
- The bit field signature of `TestBed.inject()` has been deprecated, in favor of the new options object.
### router
- The `RouterLinkWithHref` directive is deprecated, use the `RouterLink` directive instead. The `RouterLink` contains the code from the `RouterLinkWithHref` to handle elements with `href` attributes.
### common
| Commit | Type | Description |
| -- | -- | -- |
| [c0c7efaf7c](https://github.com/angular/angular/commit/c0c7efaf7c8a53c1a6f137aac960757cc804f263) | feat | add `provideLocationMocks()` function to provide Location mocks ([#47674](https://github.com/angular/angular/pull/47674)) |
| [75e6297f09](https://github.com/angular/angular/commit/75e6297f0901cc98aea1626a138a820e68d026ec) | feat | add <link> preload tag on server for priority img ([#47343](https://github.com/angular/angular/pull/47343)) |
| [4fde292bb5](https://github.com/angular/angular/commit/4fde292bb58f5d5bc3cf6e634f7cff9eb0d13d84) | feat | Add automatic srcset generation to ngOptimizedImage ([#47547](https://github.com/angular/angular/pull/47547)) |
| [9483343ebf](https://github.com/angular/angular/commit/9483343ebf958297ebcb81ef313d356296a41f41) | feat | Add fill mode to NgOptimizedImage ([#47738](https://github.com/angular/angular/pull/47738)) |
| [bdb5371033](https://github.com/angular/angular/commit/bdb5371033d8e9a110619861323e8383a32d5900) | feat | add injection token for default DatePipe configuration ([#47157](https://github.com/angular/angular/pull/47157)) |
| [449d29b701](https://github.com/angular/angular/commit/449d29b701ee5a50e7279d44f4c3888a5d6f7e96) | fix | Add fetchpriority to ngOptimizedImage preloads ([#48010](https://github.com/angular/angular/pull/48010)) |
| [4f52d4e474](https://github.com/angular/angular/commit/4f52d4e47416494b4054e43a0d96383bde7813ca) | fix | don't generate srcset if noopImageLoader is used ([#47804](https://github.com/angular/angular/pull/47804)) |
| [3a18398d83](https://github.com/angular/angular/commit/3a18398d8303fb4ae1923b3a182e6abb92e3117b) | fix | Don't warn about image distortion is fill mode is enabled ([#47824](https://github.com/angular/angular/pull/47824)) |
| [edea15f2c6](https://github.com/angular/angular/commit/edea15f2c63675e86248a25649008a10e1384334) | fix | export the IMAGE_CONFIG token ([#48051](https://github.com/angular/angular/pull/48051)) |
| [8abf1c844c](https://github.com/angular/angular/commit/8abf1c844c656b41a604098889db76e8c63da720) | fix | fix formatting on oversized image error ([#47188](https://github.com/angular/angular/pull/47188)) |
| [ca7bf65933](https://github.com/angular/angular/commit/ca7bf6593380fa760891d29fba5c9f61c6e9bf8b) | fix | rename `rawSrc` -> `ngSrc` in NgOptimizedImage directive ([#47362](https://github.com/angular/angular/pull/47362)) |
| [b3879dbf14](https://github.com/angular/angular/commit/b3879dbf1470ab4f31e676f1f8909cd50d963844) | fix | support density descriptors with 2+ decimals ([#47197](https://github.com/angular/angular/pull/47197)) |
| [fa4798095e](https://github.com/angular/angular/commit/fa4798095e3820087c4a3bccc9638c5e979315da) | fix | update size error to mention 'fill' mode ([#47797](https://github.com/angular/angular/pull/47797)) |
| [23f210c0ab](https://github.com/angular/angular/commit/23f210c0abfb6104f4aa2f39d0efd096c2b7574d) | fix | warn if using supported CDN but not built-in loader ([#47330](https://github.com/angular/angular/pull/47330)) |
| [945432e3fa](https://github.com/angular/angular/commit/945432e3fa2cb22ff911eda2a8ad3302a8adba5a) | fix | Warn on fill ngOptimizedImage without height ([#48036](https://github.com/angular/angular/pull/48036)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [051f75648d](https://github.com/angular/angular/commit/051f75648d6065949796ac1c7ea67e71e31b011e) | fix | scope css keyframes in emulated view encapsulation ([#42608](https://github.com/angular/angular/pull/42608)) |
| [39b72e208b](https://github.com/angular/angular/commit/39b72e208b46d80f1d9a802cebf043c2ccf3c5f2) | fix | update element schema ([#47552](https://github.com/angular/angular/pull/47552)) |
| [48b354a83e](https://github.com/angular/angular/commit/48b354a83e6d94735a03eebb3a52c5698e7a0f44) | fix | update element schema ([#47552](https://github.com/angular/angular/pull/47552)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [bc54687c7b](https://github.com/angular/angular/commit/bc54687c7b91efe451aa744d2d3a15ca3524231e) | fix | exclude abstract classes from `strictInjectionParameters` requirement ([#44615](https://github.com/angular/angular/pull/44615)) |
| [309b2cde51](https://github.com/angular/angular/commit/309b2cde51d1577d6561e826be01e2b5fce43c49) | fix | implement more host directive validations as diagnostics ([#47768](https://github.com/angular/angular/pull/47768)) |
| [2e1dddec45](https://github.com/angular/angular/commit/2e1dddec45fef8291b1f3abce2a937e28bb75a87) | fix | support hasInvalidatedResolutions. ([#47585](https://github.com/angular/angular/pull/47585)) |
| [19ad4987f9](https://github.com/angular/angular/commit/19ad4987f9070222bb2fb8bd07a43ed7995f602a) | fix | use @ts-ignore. ([#47636](https://github.com/angular/angular/pull/47636)) |
| [8fcadaad48](https://github.com/angular/angular/commit/8fcadaad48b2b1328f47b7603b230445a26f95a8) | perf | cache source file for reporting type-checking diagnostics ([#47471](https://github.com/angular/angular/pull/47471)) |
| [16f96eeabf](https://github.com/angular/angular/commit/16f96eeabf77964092b4b6a830e29f2761ffaeec) | refactor | remove `enableIvy` options ([#47346](https://github.com/angular/angular/pull/47346)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [e3cef4a784](https://github.com/angular/angular/commit/e3cef4a7843d22fd004f1e27afcc42d0fbbef74a) | docs | deprecate `providedIn: NgModule` and `providedIn: 'any'` ([#47616](https://github.com/angular/angular/pull/47616)) |
| [1b9fd46d14](https://github.com/angular/angular/commit/1b9fd46d14ed46f78b6d761b3917ded1f0d51e0d) | feat | add support for Node.js version 18 ([#47730](https://github.com/angular/angular/pull/47730)) |
| [ed11a13c3c](https://github.com/angular/angular/commit/ed11a13c3c5cccb0094c1a4ff9c60ea741a42067) | feat | drop support for TypeScript 4.6 and 4.7 ([#47690](https://github.com/angular/angular/pull/47690)) |
| [db28badfe6](https://github.com/angular/angular/commit/db28badfe67f404e81dacd7c3131af105feb3412) | feat | enable the new directive composition API ([#47642](https://github.com/angular/angular/pull/47642)) |
| [7de1469be6](https://github.com/angular/angular/commit/7de1469be62b08037681ee9e75614fb800700ef8) | feat | introduce EnvironmentProviders wrapper type ([#47669](https://github.com/angular/angular/pull/47669)) |
| [841c8e5138](https://github.com/angular/angular/commit/841c8e51386645d7fd26642f41952ed8f0a2dbe5) | feat | support object-based DI flags in Injector.get() ([#46761](https://github.com/angular/angular/pull/46761)) |
| [120555a626](https://github.com/angular/angular/commit/120555a626d66523e46ce01681b11a0f38e3a40a) | feat | support object-based DI flags in TestBed.inject() ([#46761](https://github.com/angular/angular/pull/46761)) |
| [96c0e42e61](https://github.com/angular/angular/commit/96c0e42e61b8a4fced1354da0162c06e7b029cf3) | fix | allow readonly arrays for standalone imports ([#47851](https://github.com/angular/angular/pull/47851)) |
| [28f289b825](https://github.com/angular/angular/commit/28f289b825be7f4bf6dc5db69197741867b8ea23) | fix | hardening attribute and property binding rules for <iframe> elements ([#47964](https://github.com/angular/angular/pull/47964)) |
| [d4b3c0b47c](https://github.com/angular/angular/commit/d4b3c0b47c32a9a664d3073164d04c0385058008) | fix | hardening rules related to the attribute order on iframe elements ([#47935](https://github.com/angular/angular/pull/47935)) |
| [85330f3fd9](https://github.com/angular/angular/commit/85330f3fd9ac6381ce3aa18479ed8195d2ac215e) | fix | update `isDevMode` to rely on `ngDevMode` ([#47475](https://github.com/angular/angular/pull/47475)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [a8569e3802](https://github.com/angular/angular/commit/a8569e38029724a7d77935bccce99117a7e1aefa) | feat | export forms utility functions: isFormArray, isFormGroup… ([#47718](https://github.com/angular/angular/pull/47718)) |
| [96b7fe93af](https://github.com/angular/angular/commit/96b7fe93af361a1cf2ea5477970f64ba6f3d8cd5) | fix | call `setDisabledState` on `ControlValueAcessor` when control is enabled ([#47576](https://github.com/angular/angular/pull/47576)) |
| [a99d9d67f3](https://github.com/angular/angular/commit/a99d9d67f382c18b46c4c1c6765bbda445ca0b8c) | fix | don't mutate validators array ([#47830](https://github.com/angular/angular/pull/47830)) |
| [2625dc1312](https://github.com/angular/angular/commit/2625dc13127da9f8d5fa79f1b32ad132d6656c63) | fix | Improve a very commonly viewed error message by adding a guide. ([#47969](https://github.com/angular/angular/pull/47969)) |
| [ae29f98c20](https://github.com/angular/angular/commit/ae29f98c20390abbf84d2df312ee5e8766195d60) | fix | Runtime error pages must begin with leading zero ([#47991](https://github.com/angular/angular/pull/47991)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [3ba99e286a](https://github.com/angular/angular/commit/3ba99e286a166d122fb334171b6a9a1e6461a724) | feat | allow for child `HttpClient`s to request via parents ([#47502](https://github.com/angular/angular/pull/47502)) |
| [84d0d33c35](https://github.com/angular/angular/commit/84d0d33c3537f0da927e0ce449ede78ef9bebc6b) | feat | introduce `provideHttpClientTesting` provider function ([#47502](https://github.com/angular/angular/pull/47502)) |
| [62c7a7a16e](https://github.com/angular/angular/commit/62c7a7a16e035c3a5346270dc4c5c6de85bf9137) | feat | introduce functional interceptors ([#47502](https://github.com/angular/angular/pull/47502)) |
| [e47b129070](https://github.com/angular/angular/commit/e47b129070655f2e9eeac58bc2d0ea5648f41045) | feat | introduce the `provideHttpClient()` API ([#47502](https://github.com/angular/angular/pull/47502)) |
| [ea16a98dfe](https://github.com/angular/angular/commit/ea16a98dfef0de33c192e328f151cca39749a488) | fix | better handle unexpected `undefined` XSRF tokens ([#47683](https://github.com/angular/angular/pull/47683)) |
| [e7b48da713](https://github.com/angular/angular/commit/e7b48da713f32c02c096f1342ab8b0d7ec696ca5) | fix | rename `withLegacyInterceptors` to `withInterceptorsFromDi` ([#47901](https://github.com/angular/angular/pull/47901)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [bebef5fb43](https://github.com/angular/angular/commit/bebef5fb43dcf54a109499d0d9dd701786c33f60) | feat | Quick fix to import a component when its selector is used ([#47088](https://github.com/angular/angular/pull/47088)) |
| [e7ee53c541](https://github.com/angular/angular/commit/e7ee53c541da0a1f85c217354ec9901010ae0de9) | feat | support to fix invalid banana in box ([#47393](https://github.com/angular/angular/pull/47393)) |
### localize
| Commit | Type | Description |
| -- | -- | -- |
| [400a6b5e37](https://github.com/angular/angular/commit/400a6b5e3707f3939d84c659a115b75ef15d2c09) | fix | add polyfill in polyfills array instead of polyfills.ts ([#47569](https://github.com/angular/angular/pull/47569)) |
| [b6fd814542](https://github.com/angular/angular/commit/b6fd81454207bd256a48d5726f3bd7e6ce6a489b) | fix | update ng add schematic to support Angular CLI version 15 ([#47763](https://github.com/angular/angular/pull/47763)) |
| [d36fd3d9e4](https://github.com/angular/angular/commit/d36fd3d9e41984818af5e1aad5e3004574d837bb) | refactor | remove deprecated `canParse` method from TranslationParsers ([#47275](https://github.com/angular/angular/pull/47275)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [2908eba59c](https://github.com/angular/angular/commit/2908eba59c25e9a1fc5aa257b4a8a247db82079e) | fix | align server renderer interface with base renderer ([#47868](https://github.com/angular/angular/pull/47868)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [7bee28d037](https://github.com/angular/angular/commit/7bee28d037a8a21a7440293b3e8c118cc93ec8c1) | feat | add a migration to remove `relativeLinkResolution` usages ([#47604](https://github.com/angular/angular/pull/47604)) |
| [5163e3d876](https://github.com/angular/angular/commit/5163e3d876cdfd6d309d7e35aefa6f07ef62715e) | feat | Add UrlTree constructor to public API ([#47186](https://github.com/angular/angular/pull/47186)) |
| [da58801f95](https://github.com/angular/angular/commit/da58801f95c66c201e332189af25702bdd722f3f) | feat | auto-unwrap default exports when lazy loading ([#47586](https://github.com/angular/angular/pull/47586)) |
| [c3f857975d](https://github.com/angular/angular/commit/c3f857975d56cac6ad3939d64f76a51455159c23) | feat | make RouterOutlet name an Input so it can be set dynamically ([#46569](https://github.com/angular/angular/pull/46569)) |
| [f73ef21442](https://github.com/angular/angular/commit/f73ef2144279b6b26902510f90ca1fccb8e166b2) | feat | merge `RouterLinkWithHref` into `RouterLink` ([#47630](https://github.com/angular/angular/pull/47630)) |
| [16c8f55663](https://github.com/angular/angular/commit/16c8f55663c30270fcd647b1a8a20ddbc8923349) | feat | migrate `RouterLinkWithHref` references to `RouterLink` ([#47599](https://github.com/angular/angular/pull/47599)) |
| [07017a7bd3](https://github.com/angular/angular/commit/07017a7bd30c6bb7bd1b94a9fd1b112ee68c9ced) | feat | prevent `provideRouter()` from usage in @Component ([#47669](https://github.com/angular/angular/pull/47669)) |
| [79e9e8ab77](https://github.com/angular/angular/commit/79e9e8ab779d230f6a1df25c4ccff94b13129305) | fix | Delay router scroll event until navigated components have rendered ([#47563](https://github.com/angular/angular/pull/47563)) |
| [6a88bad019](https://github.com/angular/angular/commit/6a88bad0192516f26a5a008c0634b73456b9447c) | fix | Ensure ActivatedRouteSnapshot#title has correct value ([#47481](https://github.com/angular/angular/pull/47481)) |
| [7b89d95c0e](https://github.com/angular/angular/commit/7b89d95c0e7370d33f006aba8e67bafb53a2fd4f) | fix | Remove deprecated relativeLinkResolution ([#47623](https://github.com/angular/angular/pull/47623)) |
## Special Thanks
Alan Agius, AleksanderBodurri, Alex Castle, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Charles Lyding, Dylan Hunn, Ferdinand Malcher, George Kalpakas, Jeremy Elbourn, Jessica Janiuk, JiaLiPassion, Joey Perrott, JoostK, Kara Erickson, Kristiyan Kostadinov, Martin Probst, Matthias Weiß, Matthieu Riegler, Paul Gschwendtner, Pawel Kozlowski, Sabareesh Kappagantu, WD Snoeijer, angular-robot[bot], arturovt, ced, dario-piotrowicz, ivanwonder and jaybell

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.11"></a>
# 14.2.11 (2022-11-16)
### router
| Commit | Type | Description |
| -- | -- | -- |
| [aef353c143](https://github.com/angular/angular/commit/aef353c143ea4e31d76f00ae91efe49eecc3a321) | fix | Ensure renavigating in component init works with enabledBlocking ([#48066](https://github.com/angular/angular/pull/48066)) |
## Special Thanks
Alan Agius, Andrew Scott and Mujo Osmanovic

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.10"></a>
# 14.2.10 (2022-11-09)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [a4312e1be5](https://github.com/angular/angular/commit/a4312e1be55f0677a77c9015688dbd4cf8163c69) | fix | add` zone.js` version `0.12.x` as a valid peer dependency ([#48002](https://github.com/angular/angular/pull/48002)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [db867fee77](https://github.com/angular/angular/commit/db867fee77bc62f367fc5d484fc3951d72d998c8) | fix | fix redirectTo on named outlets - resolves [#33783](https://github.com/angular/angular/pull/33783) ([#47927](https://github.com/angular/angular/pull/47927)) |
## Special Thanks
Alan Agius, Albert Szekely, Andrew Scott, Doug Parker, Kristiyan Kostadinov, Markus Eckstein, Peter Scriven and abergquist

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.9"></a>
# 14.2.9 (2022-11-03)
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [92d28bdd99](https://github.com/angular/angular/commit/92d28bdd99d3e18f42f6ed8494344b72b15d0104) | perf | resolve memory leak when using animations with shadow DOM ([#47903](https://github.com/angular/angular/pull/47903)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [d2d9bbf5ce](https://github.com/angular/angular/commit/d2d9bbf5ce5a2f5e95e7c836fbca67d90db62371) | fix | call `onSerialize` when state is empty ([#47888](https://github.com/angular/angular/pull/47888)) |
## Special Thanks
Alan Agius, Kristiyan Kostadinov, Virginia Dooley and mgechev

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.8"></a>
# 14.2.8 (2022-10-26)
## Special Thanks
Andrew Scott, Balaji, Paul Gschwendtner, WD Snoeijer, onrails and vyom1611

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.7"></a>
# 14.2.7 (2022-10-19)
## Special Thanks
Bob Watson, Charles Barnes, Joey Perrott, Virginia Dooley, WD Snoeijer, abergquist and urugator

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.6"></a>
# 14.2.6 (2022-10-12)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [3fd176a905](https://github.com/angular/angular/commit/3fd176a9054bea6f6c4cd22e8ff3b8f63b86b637) | fix | add missing period to error message ([#47744](https://github.com/angular/angular/pull/47744)) |
| [c3821f5ab5](https://github.com/angular/angular/commit/c3821f5ab5bf54b2c9d7868da79a742d4e4b7667) | perf | minimize filesystem calls when generating shims ([#47682](https://github.com/angular/angular/pull/47682)) |
## Special Thanks
Alan Agius, Andrew Kushnir, Andrew Scott, Aristeidis Bampakos, Bob Watson, Charles Lyding, Joey Perrott, Joshua Morony, Mathew Berg, Paul Gschwendtner, Peter Dickten, Renan Ferro, Sri Ram, WD Snoeijer, markostanimirovic and Álvaro Martínez

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.5"></a>
# 14.2.5 (2022-10-05)

This release contains various API docs improvements.

## Special Thanks
Alexander Wiebe, Ciprian Sauliuc, Dmytro Mezhenskyi, George Kalpakas, Joe Martin (Crowdstaffing), Jordan, Ole M, Paul Gschwendtner, Pawel Kozlowski and mgechev

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.4"></a>
# 14.2.4 (2022-09-28)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [a4b66fe1e5](https://github.com/angular/angular/commit/a4b66fe1e5acaf148069933720499652f21a7bce) | perf | cache source file for reporting type-checking diagnostics ([#47508](https://github.com/angular/angular/pull/47508)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [2c46b5ab24](https://github.com/angular/angular/commit/2c46b5ab24e209381bca70d875bf0e98a2846ef5) | fix | correctly check for `typeof` of undefined in `ngDevMode` check ([#47480](https://github.com/angular/angular/pull/47480)) |
## Special Thanks
Alan Agius, Ashley Hunter, Doug Parker, Jessica Janiuk, JoostK, Kristiyan Kostadinov, Rokas Brazdžionis and Simona Cotin

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.3"></a>
# 14.2.3 (2022-09-21)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [bba2dae812](https://github.com/angular/angular/commit/bba2dae81263d07c55cd059eb8ef51baa7774055) | fix | make sure that the useAnimation function delay is applied ([#47468](https://github.com/angular/angular/pull/47468)) |
## Special Thanks
AleksanderBodurri, Andrew Kushnir, Andrew Scott, Bob Watson, George Kalpakas, Joey Perrott, Mauro Mattos, dario-piotrowicz, fabioemoutinho and famzila

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.2"></a>
# 14.2.2 (2022-09-14)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [937e6c5b3d](https://github.com/angular/angular/commit/937e6c5b3d4c4bfc6ba202ee6692bc2fd8a35b89) | fix | make sure that the animation function delay is applied ([#47285](https://github.com/angular/angular/pull/47285)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [c9bdf9bab1](https://github.com/angular/angular/commit/c9bdf9bab1bc4cc4da207f6bfc8ebc75eb605486) | fix | rename `rawSrc` -> `ngSrc` in NgOptimizedImage directive ([#47362](https://github.com/angular/angular/pull/47362)) ([#47396](https://github.com/angular/angular/pull/47396)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [a3e1303f04](https://github.com/angular/angular/commit/a3e1303f04d4afe456f3728939b3aa54e29f9fb3) | fix | imply @Optional flag when a default value is provided ([#47242](https://github.com/angular/angular/pull/47242)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [80c66a1e57](https://github.com/angular/angular/commit/80c66a1e57af33342ed851a0de886fc17b53f7a3) | fix | don't prevent default behavior for forms with method="dialog" ([#47308](https://github.com/angular/angular/pull/47308)) |
## Special Thanks
Abhishek Rawat, Andrew Kushnir, Benjamin Chanudet, Bob Watson, George Kalpakas, Ikko Ashimine, Kristiyan Kostadinov, Marc Wrobel, Mariia Subkov, Pawel Kozlowski, Sebastian, abergquist, dario-piotrowicz, onrails and vyom1611

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.1"></a>
# 14.2.1 (2022-09-07)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [c0d7ac9ec2](https://github.com/angular/angular/commit/c0d7ac9ec2df9af36d80382bc70c4580720f35a3) | fix | improve formatting of image warnings ([#47299](https://github.com/angular/angular/pull/47299)) |
| [1875ce520a](https://github.com/angular/angular/commit/1875ce520afe7b5c55680b8c6a938a2331dda599) | fix | use DOCUMENT token to query for preconnect links ([#47353](https://github.com/angular/angular/pull/47353)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [0e35829580](https://github.com/angular/angular/commit/0e3582958079f798a75240873aebf3c4f5e3df5b) | fix | avoid errors for inputs with Object-builtin names ([#47220](https://github.com/angular/angular/pull/47220)) |
### service-worker
| Commit | Type | Description |
| -- | -- | -- |
| [6091786696](https://github.com/angular/angular/commit/60917866961b7ab80ec9637c72300f2707aadd09) | fix | include headers in requests for assets ([#47260](https://github.com/angular/angular/pull/47260)) |
| [28d33505fd](https://github.com/angular/angular/commit/28d33505fd4be00eaf4bf417cd27e20733ddfb80) | fix | only consider GET requests as navigation requests ([#47263](https://github.com/angular/angular/pull/47263)) |
## Special Thanks
Aristeidis Bampakos, Asaf M, Bingo's Code, Bob Watson, Daniel Ostrovsky, George Kalpakas, Giovanni Alberto Rivas, Jeremy Elbourn, Jobayer Hossain, Joe Martin (Crowdstaffing), Joey Perrott, JoostK, Kara Erickson, Kristiyan Kostadinov, Maina Wycliffe, Sabareesh Kappagantu, Simona Cotin, Sonu Sindhu, Yann Provoost, abergquist, jaybell and vyom1611

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.2.0"></a>
# 14.2.0 (2022-08-25)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [b96e571897](https://github.com/angular/angular/commit/b96e571897e815ff509188f15b60c66b1bafa358) | fix | fix stagger timing not handling params ([#47208](https://github.com/angular/angular/pull/47208)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [b380fdd59e](https://github.com/angular/angular/commit/b380fdd59e368e89908ea915f150cdc9f5a87a7f) | feat | add a density cap for image srcsets ([#47082](https://github.com/angular/angular/pull/47082)) |
| [7ce497e5bc](https://github.com/angular/angular/commit/7ce497e5bc6502bed8099d2592888f3164cdcf1f) | feat | add built-in Imgix loader ([#47082](https://github.com/angular/angular/pull/47082)) |
| [bff870db61](https://github.com/angular/angular/commit/bff870db6146850248597889550f676d81a85c90) | feat | add cloudflare loader ([#47082](https://github.com/angular/angular/pull/47082)) |
| [86e77a5d55](https://github.com/angular/angular/commit/86e77a5d559eddb285e74cc34c0db73de5645022) | feat | add Image directive skeleton ([#45627](https://github.com/angular/angular/pull/45627)) ([#47082](https://github.com/angular/angular/pull/47082)) |
| [0566205a02](https://github.com/angular/angular/commit/0566205a02c5dc87a01a0aa40cb5cdf147c81f11) | feat | Add image lazy loading and fetchpriority ([#47082](https://github.com/angular/angular/pull/47082)) |
| [4e952ba216](https://github.com/angular/angular/commit/4e952ba216297eb60fb3bae797b73f5b72c7660b) | feat | add loaders for cloudinary & imagekit ([#47082](https://github.com/angular/angular/pull/47082)) |
| [e854a8cdde](https://github.com/angular/angular/commit/e854a8cdde0f2fd00e67c0a841c8f6f0abcea18b) | feat | add loading attr to NgOptimizedImage ([#47082](https://github.com/angular/angular/pull/47082)) |
| [8d3701cb4c](https://github.com/angular/angular/commit/8d3701cb4c167fb8b2153359a71e4f222d3d5657) | feat | add warnings re: image distortion ([#47082](https://github.com/angular/angular/pull/47082)) |
| [d5f7da2120](https://github.com/angular/angular/commit/d5f7da21207f7808dffb3932fa61d22614e6bd57) | feat | define public API surface for NgOptimizedImage directive ([#47082](https://github.com/angular/angular/pull/47082)) |
| [d3c3426aa4](https://github.com/angular/angular/commit/d3c3426aa41bd4092da3a9dd6951cab63f217db4) | feat | detect LCP images in `NgOptimizedImage` and assert if `priority` is set ([#47082](https://github.com/angular/angular/pull/47082)) |
| [451b85ca17](https://github.com/angular/angular/commit/451b85ca176e0aeae6358016e2695ea133d9ec56) | feat | explain why width/height is required ([#47082](https://github.com/angular/angular/pull/47082)) |
| [586274fe65](https://github.com/angular/angular/commit/586274fe65c5184b633e0e5ac12ca91979f138b2) | feat | provide an ability to exclude origins from preconnect checks in NgOptimizedImage ([#47082](https://github.com/angular/angular/pull/47082)) |
| [57f3386e5b](https://github.com/angular/angular/commit/57f3386e5b5a3d6edc9e6d8c60b442b16e5c4a20) | feat | support custom srcset attributes in NgOptimizedImage ([#47082](https://github.com/angular/angular/pull/47082)) |
| [7baf9a46cd](https://github.com/angular/angular/commit/7baf9a46cde2eb2d923c6b2d5e6afb51de9e3f2b) | feat | verify that priority images have preconnect links ([#47082](https://github.com/angular/angular/pull/47082)) |
| [f81765b333](https://github.com/angular/angular/commit/f81765b333881bd156383d81be62c06ff00380c1) | feat | warn if rendered size is much smaller than intrinsic ([#47082](https://github.com/angular/angular/pull/47082)) |
| [e2ab99b95e](https://github.com/angular/angular/commit/e2ab99b95efd893c49d15c02cccd72ef82ea1cae) | fix | allow null/undefined to be passed to ngClass input ([#39280](https://github.com/angular/angular/pull/39280)) ([#46906](https://github.com/angular/angular/pull/46906)) |
| [bedf537951](https://github.com/angular/angular/commit/bedf537951e64c55dde9b38936e451daa4a4bde9) | fix | allow null/undefined to be passed to ngStyle input ([#47069](https://github.com/angular/angular/pull/47069)) |
| [f9511bf6e8](https://github.com/angular/angular/commit/f9511bf6e8322f292421bcc0fa7851535aeaac85) | fix | avoid interacting with a destroyed injector ([#47243](https://github.com/angular/angular/pull/47243)) |
| [dc29e21b14](https://github.com/angular/angular/commit/dc29e21b141574247b5f9f859c019b4ad4be9742) | fix | consider density descriptors with multiple digits as valid ([#47230](https://github.com/angular/angular/pull/47230)) |
| [801daf82d1](https://github.com/angular/angular/commit/801daf82d119a39f21d26812b28c8551c58d841b) | fix | detect `data:` and `blob:` inputs in `NgOptimizedImage` directive ([#47082](https://github.com/angular/angular/pull/47082)) |
| [fff8056e7f](https://github.com/angular/angular/commit/fff8056e7f5fffd6d54315ca3897505ad5da725f) | fix | fix formatting on oversized image error ([#47188](https://github.com/angular/angular/pull/47188)) ([#47232](https://github.com/angular/angular/pull/47232)) |
| [1ca2ce19ab](https://github.com/angular/angular/commit/1ca2ce19ab871c76bee3ad67ee9c610284ca9281) | fix | remove default for image width ([#47082](https://github.com/angular/angular/pull/47082)) |
| [c5db867ddc](https://github.com/angular/angular/commit/c5db867ddcac10720a23487461994bbf682898e9) | fix | remove duplicate deepForEach ([#47189](https://github.com/angular/angular/pull/47189)) |
| [1cf43deb18](https://github.com/angular/angular/commit/1cf43deb1899440c0bd468f8bf31390d4f23d678) | fix | sanitize `rawSrc` and `rawSrcset` values in NgOptimizedImage directive ([#47082](https://github.com/angular/angular/pull/47082)) |
| [d71dfe931f](https://github.com/angular/angular/commit/d71dfe931f71bff71e4e7af96aebd59f31cd4079) | fix | set bound width and height onto host element ([#47082](https://github.com/angular/angular/pull/47082)) |
| [32caa8b669](https://github.com/angular/angular/commit/32caa8b66908097522658360e5907c5004c13eeb) | fix | support density descriptors with 2+ decimals ([#47197](https://github.com/angular/angular/pull/47197)) ([#47232](https://github.com/angular/angular/pull/47232)) |
| [ae4405f0bf](https://github.com/angular/angular/commit/ae4405f0bf1c94fe86d9e9a62360834e80cef8e7) | fix | throw if srcset is used with rawSrc ([#47082](https://github.com/angular/angular/pull/47082)) |
| [0c8eb8bc82](https://github.com/angular/angular/commit/0c8eb8bc82c26596092d4774fcdac255aecdec90) | perf | monitor LCP only for images without `priority` attribute ([#47082](https://github.com/angular/angular/pull/47082)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [ea89677c12](https://github.com/angular/angular/commit/ea89677c125c16654e3e521998b575687c2bd20c) | feat | support more recent version of `tsickle` ([#47018](https://github.com/angular/angular/pull/47018)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [d1e83e1b30](https://github.com/angular/angular/commit/d1e83e1b30f2cea9f2ed16bff2d3b969335072ab) | feat | add `createComponent` function ([#46685](https://github.com/angular/angular/pull/46685)) |
| [10becab70e](https://github.com/angular/angular/commit/10becab70e0f2afee29da7b3358eedcc22f655a2) | feat | add `reflectComponentType` function ([#46685](https://github.com/angular/angular/pull/46685)) |
| [4b377d3a6d](https://github.com/angular/angular/commit/4b377d3a6d069da23ec577f8deca761b01d4e2f5) | feat | introduce createApplication API ([#46475](https://github.com/angular/angular/pull/46475)) |
| [31429eaccc](https://github.com/angular/angular/commit/31429eaccc973672efb4ed98a628cf9842e24b02) | feat | support TypeScript 4.8 ([#47038](https://github.com/angular/angular/pull/47038)) |
| [796840209c](https://github.com/angular/angular/commit/796840209cd38aacc5061a31701efe7eda1f6587) | fix | align TestBed interfaces and implementation ([#46635](https://github.com/angular/angular/pull/46635)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [426af91a42](https://github.com/angular/angular/commit/426af91a42104d6ce227ab52c8c4db3e218f5e03) | feat | add `FormBuilder.record()` method ([#46485](https://github.com/angular/angular/pull/46485)) |
| [b302797de4](https://github.com/angular/angular/commit/b302797de47409b988ad77e87f766a5f18374ded) | fix | Correctly infer `FormBuilder` types involving `[value, validators]` shorthand in more cases. ([#47034](https://github.com/angular/angular/pull/47034)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [598b72bd05](https://github.com/angular/angular/commit/598b72bd05ea33468c70ac35b8ea5286439f41d9) | feat | support fix the component missing member ([#46764](https://github.com/angular/angular/pull/46764)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [07606e3181](https://github.com/angular/angular/commit/07606e3181fc7aa9f9185eb771fc9c44f01fe344) | feat | add `isEmpty` method to the `TransferState` class ([#46915](https://github.com/angular/angular/pull/46915)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [2b4d7f6733](https://github.com/angular/angular/commit/2b4d7f6733e10e45e3ca8a448307bbc2834fc4a1) | feat | support document reference in render functions ([#47032](https://github.com/angular/angular/pull/47032)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [0abb67af59](https://github.com/angular/angular/commit/0abb67af59a92a2b29082a259aa9f4ea3fbaab7d) | feat | allow guards and resolvers to be plain functions ([#46684](https://github.com/angular/angular/pull/46684)) |
| [75df404467](https://github.com/angular/angular/commit/75df4044675c61d2b646437cfe64fe828a39b3a0) | feat | Create APIs for using Router without RouterModule ([#47010](https://github.com/angular/angular/pull/47010)) |
| [10289f1f6e](https://github.com/angular/angular/commit/10289f1f6e3d5935304a38d4300d4dadfea66150) | feat | expose resolved route title ([#46826](https://github.com/angular/angular/pull/46826)) |
| [8600732b09](https://github.com/angular/angular/commit/8600732b090a4c253eb89ffde6db3858e4a2021c) | feat | Expose the default matcher for `Routes` used by the `Router` ([#46913](https://github.com/angular/angular/pull/46913)) |
| [422323cee0](https://github.com/angular/angular/commit/422323cee00192239d1ab279e6a7c3a808098169) | feat | improve typings for RouterLink boolean inputs ([#47101](https://github.com/angular/angular/pull/47101)) |
| [26ea97688c](https://github.com/angular/angular/commit/26ea97688cba5850588d8da83abaf8b539577241) | feat | Make router directives standalone ([#46758](https://github.com/angular/angular/pull/46758)) |
| [2a43beec15](https://github.com/angular/angular/commit/2a43beec159990b8c4bafc7f189e2bd85002dc7a) | fix | Fix route recognition behavior with some versions of rxjs ([#47098](https://github.com/angular/angular/pull/47098)) |
### service-worker
| Commit | Type | Description |
| -- | -- | -- |
| [383090858c](https://github.com/angular/angular/commit/383090858caf04c27ee8b320cceca2da0ae54bb3) | feat | support `sendRequest` as a `notificationclick` action ([#46912](https://github.com/angular/angular/pull/46912)) |
| [3f548610dd](https://github.com/angular/angular/commit/3f548610dd05f484cd33fa2cee4e3693ed731126) | fix | export NoNewVersionDetectedEvent ([#47044](https://github.com/angular/angular/pull/47044)) |
| [482b6119c2](https://github.com/angular/angular/commit/482b6119c2f3fff5ec0623e101d308a49c416b42) | fix | update golden `index.md` ([#47044](https://github.com/angular/angular/pull/47044)) |
## Special Thanks
Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Bob Watson, Cédric Exbrayat, Dylan Hunn, Emmanuel Roux, FatalMerlin, George Kalpakas, Ilia Mirkin, Jan Kuehle, Jeremy Elbourn, Jessica Janiuk, JiaLiPassion, Kalbarczyk, Kara Erickson, Katie Hempenius, Kristiyan Kostadinov, Merlin, Paul Gschwendtner, Pawel Kozlowski, Tristan Sprößer, Victor Porof, angular-robot[bot], dario-piotrowicz, ivanwonder and vyom

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.1.3"></a>
# 14.1.3 (2022-08-17)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [0583227708](https://github.com/angular/angular/commit/05832277089f9df9cde424d62033661620826592) | fix | infinite loop in parser assignment expression with invalid left-hand expression ([#47151](https://github.com/angular/angular/pull/47151)) |
## Special Thanks
AlirezaEbrahimkhani, Alma Eyre, Andrew Scott, Bob Watson, George Kalpakas, Kalbarczyk, Kristiyan Kostadinov, Leosvel Pérez Espinosa, Roman Matusevich and Sonu Kapoor

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.1.2"></a>
# 14.1.2 (2022-08-10)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [5ff715c549](https://github.com/angular/angular/commit/5ff715c5497fcbcbb33eb93770470fff5a816cd5) | fix | check if transplanted views are attached to change detector ([#46974](https://github.com/angular/angular/pull/46974)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [439d77e852](https://github.com/angular/angular/commit/439d77e852c2e08d384c420a2c3a962a804c60f1) | fix | Fix route recognition behavior with some versions of rxjs ([#47098](https://github.com/angular/angular/pull/47098)) ([#47112](https://github.com/angular/angular/pull/47112)) |
## Special Thanks
4javier, Andrew Kushnir, Andrew Scott, AntonioCardenas, Bob Watson, Bruno Barbosa, Eduardo Speroni, Edward, George Kalpakas, Jan Melcher, Kristiyan Kostadinov, Mladen Jakovljević, Paul Gschwendtner, Pawel Kozlowski, Roman Matusevich, Vovch, ashide2729, ileil and onrails

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.1.1"></a>
# 14.1.1 (2022-08-03)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [3606917732](https://github.com/angular/angular/commit/3606917732e5ad887426c1cbccf6e375eff905d6) | fix | improve the missing control flow directive message ([#46903](https://github.com/angular/angular/pull/46903)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [79825d3f10](https://github.com/angular/angular/commit/79825d3f1078c9b91eeb5e4699718ccde6c458b5) | fix | Do not call preload method when not necessary ([#47007](https://github.com/angular/angular/pull/47007)) |
| [05f3f7445a](https://github.com/angular/angular/commit/05f3f7445a0bbe3c7ffed3aec308ca8888e77d99) | fix | Use correct return type for provideRoutes function ([#46941](https://github.com/angular/angular/pull/46941)) |
## Special Thanks
Alan Agius, Andrew Kushnir, Andrew Quinn, Andrew Scott, Aristeidis Bampakos, Asaf M, Bob Watson, Cédric Exbrayat, Durairaj Subramaniam, George Kalpakas, Ivaylo Kirov, J Rob Gant, Kristiyan Kostadinov, Marek Hám, Paul Gschwendtner, Roman Matusevich and Simona Cotin

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.1.0"></a>
# 14.1.0 (2022-07-20)
## Deprecations
### core
- The `createNgModuleRef` is deprecated in favor of newly added `createNgModule` one.
- The bit field signature of `inject()` has been deprecated, in favor of the
  new options object. Correspondingly, `InjectFlags` is deprecated as well.
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [55308f2df5](https://github.com/angular/angular/commit/55308f2df5b0f6e8e40e3c4085c463a5b83c5ed1) | feat | add `provideAnimations()` and `provideNoopAnimations()` functions ([#46793](https://github.com/angular/angular/pull/46793)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [4a2e7335b1](https://github.com/angular/angular/commit/4a2e7335b180190800cf2c5db8ed1c8841dbf473) | feat | make the `CommonModule` pipes standalone ([#46401](https://github.com/angular/angular/pull/46401)) |
| [a7597dd080](https://github.com/angular/angular/commit/a7597dd08026a4071758323d54ccbfb382e0c780) | feat | make the CommonModule directives standalone ([#46469](https://github.com/angular/angular/pull/46469)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [33ce3883a5](https://github.com/angular/angular/commit/33ce3883a5d962adf5ee7feffd3426feefe0c0b5) | feat | Add extended diagnostic to warn when missing let on ngForOf ([#46683](https://github.com/angular/angular/pull/46683)) |
| [6f11a58040](https://github.com/angular/angular/commit/6f11a580406877e440c43df31fae3d5f120cafed) | feat | Add extended diagnostic to warn when text attributes are intended to be bindings ([#46161](https://github.com/angular/angular/pull/46161)) |
| [9e836c232f](https://github.com/angular/angular/commit/9e836c232ff66043bc101b905dae4c8bde18bc58) | feat | warn when style suffixes are used with attribute bindings ([#46651](https://github.com/angular/angular/pull/46651)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [93c65e7b14](https://github.com/angular/angular/commit/93c65e7b1468bb0c696dec1bc3362422a2ca5170) | feat | add extended diagnostic for non-nullable optional chains ([#46686](https://github.com/angular/angular/pull/46686)) |
| [131d029da1](https://github.com/angular/angular/commit/131d029da16b7d486cdc200f00160b9a11871fb2) | feat | detect missing control flow directive imports in standalone components ([#46146](https://github.com/angular/angular/pull/46146)) |
| [6b8e60c06a](https://github.com/angular/angular/commit/6b8e60c06a4f9a5fdbce9e7971d403ccb2bc6e8e) | fix | improve the missingControlFlowDirective message ([#46846](https://github.com/angular/angular/pull/46846)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [e8e8e5f171](https://github.com/angular/angular/commit/e8e8e5f1718f605c62a671b0ff15fa4dff7d8229) | feat | add `createComponent` function |
| [b5153814af](https://github.com/angular/angular/commit/b5153814af3e6b1ec8550ddf39584efd7cca36be) | feat | add `reflectComponentType` function |
| [96c6139c9a](https://github.com/angular/angular/commit/96c6139c9ab35aa6ab2330a5a79a5906d5c2e8be) | feat | add ability to set inputs on ComponentRef ([#46641](https://github.com/angular/angular/pull/46641)) |
| [a6d5fe202c](https://github.com/angular/angular/commit/a6d5fe202cafb419f3beb8d09711132124b6aa9a) | feat | alias `createNgModuleRef` as `createNgModule` ([#46789](https://github.com/angular/angular/pull/46789)) |
| [71e606d3c3](https://github.com/angular/angular/commit/71e606d3c3cfdcf93a6e40f84fd69aa75c5cca42) | feat | expose EnvironmentInjector on ApplicationRef ([#46665](https://github.com/angular/angular/pull/46665)) |
| [19e6d9ccd3](https://github.com/angular/angular/commit/19e6d9ccd36c7776fcee7de541bba413fd6dcabf) | feat | import AsyncStackTaggingZone if available ([#46693](https://github.com/angular/angular/pull/46693)) |
| [a7a14df5f8](https://github.com/angular/angular/commit/a7a14df5f8ff2d1e6a4dba3ac53f4479a6646810) | feat | introduce `EnvironmentInjector.runInContext` API ([#46653](https://github.com/angular/angular/pull/46653)) |
| [fa52b6e906](https://github.com/angular/angular/commit/fa52b6e906e549e1c6b4a4f4428596d093fb0549) | feat | options object to supersede bit flags for `inject()` ([#46649](https://github.com/angular/angular/pull/46649)) |
| [af20112222](https://github.com/angular/angular/commit/af20112222fcfa961ff9a2dee4050dd59aa4156e) | feat | support the descendants option for ContentChild queries ([#46638](https://github.com/angular/angular/pull/46638)) |
| [945a3ad359](https://github.com/angular/angular/commit/945a3ad359cd2fe3456f635b0fe36effbfe8d5c2) | fix | Fix `runInContext` for `NgModuleRef` injector ([#46877](https://github.com/angular/angular/pull/46877)) |
| [bb7c80477b](https://github.com/angular/angular/commit/bb7c80477b1258f48971b67b2eade6a4b41337f2) | fix | make parent injector argument required in `createEnvironmentInjector` ([#46397](https://github.com/angular/angular/pull/46397)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [82acbf919b](https://github.com/angular/angular/commit/82acbf919bae2ddb6a46f41239aa2a101901f089) | feat | improve error message for nullish header ([#46059](https://github.com/angular/angular/pull/46059)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [53ca936366](https://github.com/angular/angular/commit/53ca936366fb908278571bae5fcc7fa08b19a5a0) | feat | Add ability to create `UrlTree` from any `ActivatedRouteSnapshot` ([#45877](https://github.com/angular/angular/pull/45877)) |
| [de058bba99](https://github.com/angular/angular/commit/de058bba9979f68de2320118b537e6be4dbb888d) | feat | Add CanMatch guard to control whether a Route should match ([#46021](https://github.com/angular/angular/pull/46021)) |
| [6c1357dd7d](https://github.com/angular/angular/commit/6c1357dd7d5f466575398ebc32c581068d9bf2df) | feat | Add stable cancelation code to `NavigationCancel` event ([#46675](https://github.com/angular/angular/pull/46675)) |
| [a4ce273e50](https://github.com/angular/angular/commit/a4ce273e50551e6c6bc8f3a86591b04760de7ba4) | feat | Add the target `RouterStateSnapshot` to `NavigationError` ([#46731](https://github.com/angular/angular/pull/46731)) |
| [abe3759e24](https://github.com/angular/angular/commit/abe3759e2417c0396d75e226edcef2fae99e363b) | fix | allow to return `UrlTree` from `CanMatchFn` ([#46455](https://github.com/angular/angular/pull/46455)) |
| [e8c7dd10e9](https://github.com/angular/angular/commit/e8c7dd10e93d338456131e11d600bf758ee48634) | fix | Ensure `APP_INITIALIZER` of `enabledBlocking` option completes ([#46026](https://github.com/angular/angular/pull/46026)) |
| [ce20ed067f](https://github.com/angular/angular/commit/ce20ed067f12714ee6488ffe07f1a1c18bb60a15) | fix | Ensure Route injector is created before running CanMatch guards ([#46394](https://github.com/angular/angular/pull/46394)) |
| [6a7b818d94](https://github.com/angular/angular/commit/6a7b818d94fdd13d81a01285e3e4be953a29cc06) | fix | Ensure target `RouterStateSnapshot` is defined in `NavigationError` ([#46842](https://github.com/angular/angular/pull/46842)) |
| [f94c6f433d](https://github.com/angular/angular/commit/f94c6f433dba3924b79f137cfcc49d2dfd4d679c) | fix | Expose CanMatchFn as public API ([#46394](https://github.com/angular/angular/pull/46394)) |
| [e8ae0fe3e9](https://github.com/angular/angular/commit/e8ae0fe3e91e2e805146fad0d2f0976b1f886112) | fix | Fix cancelation code for canLoad rejections ([#46752](https://github.com/angular/angular/pull/46752)) |
### upgrade
| Commit | Type | Description |
| -- | -- | -- |
| [e9cb0454dc](https://github.com/angular/angular/commit/e9cb0454dce2113cfd5ba11deeca6cdcf47d47f0) | feat | more closely align `UpgradeModule#bootstrap()` with `angular.bootstrap()` ([#46214](https://github.com/angular/angular/pull/46214)) |
## Special Thanks
AleksanderBodurri, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Cédric Exbrayat, Dmitrij Kuba, Dylan Hunn, George Kalpakas, Jessica Janiuk, JiaLiPassion, Joey Perrott, John Vandenberg, JoostK, Keith Li, Or'el Ben-Ya'ir, Paul Gschwendtner, Pawel Kozlowski, SyedAhm3r, arturovt, mariu, markostanimirovic and mgechev

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.0.7"></a>
# 14.0.7 (2022-07-20)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [5bdbb6285b](https://github.com/angular/angular/commit/5bdbb6285b77f070347a5878bbd8218f6e01b5e8) | fix | make sure falsy values are added to _globalTimelineStyles ([#46863](https://github.com/angular/angular/pull/46863)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [41253f9c46](https://github.com/angular/angular/commit/41253f9c467aa9742ef0b69ddd063043fe0300e2) | fix | inputs/outputs incorrectly parsed in jit mode ([#46813](https://github.com/angular/angular/pull/46813)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [4e77c7fbf3](https://github.com/angular/angular/commit/4e77c7fbf38f27741617303165068e1cb1ef6354) | fix | do not invoke jasmine `done` callback multiple times with `waitForAsync` |
## Special Thanks
Andrew Kushnir, Andrew Scott, Bob Watson, Cédric Exbrayat, Doug Parker, George Kalpakas, Jessica Janiuk, Kristiyan Kostadinov, Paul Gschwendtner, acvi, dario-piotrowicz, jnizet and piyush132000

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.0.6"></a>
# 14.0.6 (2022-07-13)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [99697dae66](https://github.com/angular/angular/commit/99697dae668d8df07a5c46caf08a071371131e56) | fix | only consider used pipes for inline type-check requirement ([#46807](https://github.com/angular/angular/pull/46807)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [4f469cbef3](https://github.com/angular/angular/commit/4f469cbef3664746750338d167964c247151de01) | fix | expose ControlConfig in public API ([#46594](https://github.com/angular/angular/pull/46594)) |
| [e8c8b695f2](https://github.com/angular/angular/commit/e8c8b695f20174a520ca1ba88164458c31e5b024) | fix | Move all remaining errors in Forms to use RuntimeErrorCode. ([#46654](https://github.com/angular/angular/pull/46654)) |
### localize
| Commit | Type | Description |
| -- | -- | -- |
| [14863acb1a](https://github.com/angular/angular/commit/14863acb1a642e9f6d36ea5d10d64f26d84ad475) | fix | add `--project` option to `ng-add` schematic ([#46664](https://github.com/angular/angular/pull/46664)) |
## Special Thanks
Alan Agius, Andrew Scott, Bob Watson, Dylan Hunn, George Kalpakas, Ivaylo Kirov, Jessica Janiuk, JoostK, Joshua VanAllen, Lukas Matta, Marcin Wosinek, Nicolas Molina Monroy, Paul Gschwendtner, SoulsMark, Uday Sony, dario-piotrowicz, markostanimirovic and zhysky

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.0.5"></a>
# 14.0.5 (2022-07-06)
### router
| Commit | Type | Description |
| -- | -- | -- |
| [a3bd65e2b8](https://github.com/angular/angular/commit/a3bd65e2b87a2b5676c920778598fa6afd2cda9f) | fix | Ensure `APP_INITIALIZER` of `enabledBlocking` option completes ([#46634](https://github.com/angular/angular/pull/46634)) |
## Special Thanks
Alan Agius, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Aristeidis Bampakos, Bob Watson, George Kalpakas, Paul Gschwendtner and Pawel Kozlowski

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.0.4"></a>
# 14.0.4 (2022-06-29)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [51be9bbe29](https://github.com/angular/angular/commit/51be9bbe29e12ae0e8d4777cdac5c7466c8b6184) | fix | cleanup DOM elements when the root view is removed ([#45143](https://github.com/angular/angular/pull/45143)) |
| [999aca86c8](https://github.com/angular/angular/commit/999aca86c89030b6a9023cd2835636ee487334f2) | fix | enable shadowElements to leave when their parent does ([#46459](https://github.com/angular/angular/pull/46459)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [42aed6b13e](https://github.com/angular/angular/commit/42aed6b13efef59c1c33472adc4f2df5d52d4c20) | fix | handle CSS custom properties in NgStyle ([#46451](https://github.com/angular/angular/pull/46451)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [1e7f22f00a](https://github.com/angular/angular/commit/1e7f22f00ab10a6ae01729e3355871e51bc8bf4d) | fix | trigger `ApplicationRef.destroy` when Platform is destroyed ([#46497](https://github.com/angular/angular/pull/46497)) |
| [8bde2dbc71](https://github.com/angular/angular/commit/8bde2dbc714a0d9f7cda80c7893ab213d1e3f931) | fix | Update ngfor error code to be negative ([#46555](https://github.com/angular/angular/pull/46555)) |
| [57e8fc00eb](https://github.com/angular/angular/commit/57e8fc00eba92618c2cf063589ba1a88d3b30055) | fix | Updates error to use RuntimeError code ([#46526](https://github.com/angular/angular/pull/46526)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [74a26d870e](https://github.com/angular/angular/commit/74a26d870e2437f779c8c70f0b811f1d0bf8d4ee) | fix | Convert existing reactive errors to use RuntimeErrorCode. ([#46560](https://github.com/angular/angular/pull/46560)) |
| [747872212d](https://github.com/angular/angular/commit/747872212d12660eee59024202840e7d3ebfc866) | fix | Update a Forms validator error to use RuntimeError ([#46537](https://github.com/angular/angular/pull/46537)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [d6fac9e914](https://github.com/angular/angular/commit/d6fac9e914ad13f1ed63ea6a3738c245e547eaae) | fix | Ensure that new `RouterOutlet` instances work after old ones are destroyed ([#46554](https://github.com/angular/angular/pull/46554)) |
## Special Thanks
Alan Agius, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Bezael, Chad Ramos, Chellappan, Cédric Exbrayat, Dylan Hunn, George Kalpakas, Jeremy Meiss, Jessica Janiuk, Joey Perrott, KMathy, Kristiyan Kostadinov, Paul Gschwendtner, Pawel Kozlowski, Ramesh Thiruchelvam, Vaibhav Kumar, arturovt, dario-piotrowicz and renovate[bot]

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.0.3"></a>
# 14.0.3 (2022-06-22)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [3dd7bb3f8f](https://github.com/angular/angular/commit/3dd7bb3f8fa009e245bfc91aa06a485d0cb27586) | fix | reset the start and done fns on player reset ([#46364](https://github.com/angular/angular/pull/46364)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [c086653655](https://github.com/angular/angular/commit/c0866536558fa5abb91e1ba51fa84ea0321e6864) | fix | deduplicate imports of standalone components in JIT compiler ([#46439](https://github.com/angular/angular/pull/46439)) |
| [5d3b97e1f8](https://github.com/angular/angular/commit/5d3b97e1f8d5d004621df1004e00f128064d73cd) | fix | handle NgModules with standalone pipes in TestBed correctly ([#46407](https://github.com/angular/angular/pull/46407)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [6ad7b40a6f](https://github.com/angular/angular/commit/6ad7b40a6fe1b447173a44e7750f2b9abcb6fc0a) | fix | invalid style attribute being generated for null values ([#46433](https://github.com/angular/angular/pull/46433)) |
## Special Thanks
4javier, Aakash, Alan Agius, Andrew Kushnir, Aristeidis Bampakos, Dany Paredes, Derek Cormier, JoostK, Kristiyan Kostadinov, Paul Gschwendtner, Ramesh Thiruchelvam, behrooz bozorg chami, dario-piotrowicz, markostanimirovic, renovate[bot] and web-dave

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.0.2"></a>
# 14.0.2 (2022-06-15)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [ef5cba3df7](https://github.com/angular/angular/commit/ef5cba3df783691433fe918f8f3c05878784c0f8) | fix | allow null in ngComponentOutlet ([#46280](https://github.com/angular/angular/pull/46280)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [8ecfd71fd7](https://github.com/angular/angular/commit/8ecfd71fd7a44628500668fbb59fdc08de8b8140) | fix | don't emit empty providers array ([#46301](https://github.com/angular/angular/pull/46301)) |
| [b92c1a6ada](https://github.com/angular/angular/commit/b92c1a6adada5923b1fd69e24560ae5bfd67dd5a) | fix | use inline type-check blocks for components outside `rootDir` ([#46096](https://github.com/angular/angular/pull/46096)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [3fd8948b4a](https://github.com/angular/angular/commit/3fd8948b4a04dc504be3d4dd751a5554673423bb) | fix | Resolve forwardRef declarations for jit ([#46334](https://github.com/angular/angular/pull/46334)) |
## Special Thanks
Alex Rickabaugh, Andrew Scott, Badawi7, Daniel Schmitz, Derek Cormier, JoostK, Kevin Davila, Kristiyan Kostadinov, Paul Draper, Paul Gschwendtner, Tom Eustace, Totati, Younes Jaaidi, alefra, dario-piotrowicz, markostanimirovic, mgechev, piyush132000, sten-bone and vivekkoya

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.0.1"></a>
# 14.0.1 (2022-06-08)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [b00d237c0e](https://github.com/angular/angular/commit/b00d237c0ef726bdc262d81bcc3a3cb33181dbd9) | fix | update API extractor version ([#46259](https://github.com/angular/angular/pull/46259)) |
| [9a0a7bac21](https://github.com/angular/angular/commit/9a0a7bac21decae7662a8a2ec9488f60daa97e10) | perf | reduce input files for `ng_package` rollup and type bundle actions ([#46187](https://github.com/angular/angular/pull/46187)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [dde0b7f4b3](https://github.com/angular/angular/commit/dde0b7f4b3bc658b67a97644c8655252803be663) | fix | allow FormBuilder.group(...) to accept optional fields. ([#46253](https://github.com/angular/angular/pull/46253)) |
## Special Thanks
Adrien Crivelli, Alan Agius, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Dylan Hunn, Fabrizio Fallico, George Kalpakas, Jelle Bruisten, JoostK, Kristiyan Kostadinov, Krzysztof Platis, Paul Gschwendtner, Phalgun Vaddepalli, San Leen, dario-piotrowicz, mgechev and wellWINeo

<!-- CHANGELOG SPLIT MARKER -->

<a name="14.0.0"></a>
# 14.0.0 (2022-06-02)

[Blog post "Angular v14 is now available"](http://goo.gle/angular-v14).

## Breaking Changes
### animations
- The `AnimationDriver.getParentElement` method has become required, so any
  implementors of this interface are now required to provide an implementation
  for this method. This breakage is unlikely to affect application developers,
  as `AnimationDriver` is not expected to be implemented in user code.
### common
- Adds new required class member that any implementors of the LocationStrategy will need to satisfy.
  Location does not depend on PlatformLocation anymore.
### compiler
- Keyframes names are now prefixed with the component's "scope name".
  For example, the following keyframes rule in a component definition,
  whose "scope name" is host-my-cmp:
  
     @keyframes foo { ... }
  
  will become:
  
     @keyframes host-my-cmp_foo { ... }
  
  Any TypeScript/JavaScript code which relied on the names of keyframes rules
  will no longer match.
  
  The recommended solutions in this case are to either:
  - change the component's view encapsulation to the `None` or `ShadowDom`
  - define keyframes rules in global stylesheets (e.g styles.css)
  - define keyframes rules programmatically in code.

### core
- Support for Node.js v12 has been removed as it will become EOL on 2022-04-30. Please use Node.js v14.15 or later.
- TypeScript versions older than 4.6 are no longer supported.
- Forms [email] input coercion
  
  Forms [email] input value will be considered as true if it is defined with any value rather
  than false and 'false'.
- Since Ivy, TestBed doesn't use AOT summaries. The `aotSummaries` fields in TestBed APIs were present, but unused. The fields were deprecated in previous major version and in v14 those fields are removed. The `aotSummaries` fields were completely unused, so you can just drop them from the TestBed APIs usage.
### forms
- Forms classes accept a generic.
  
  Forms model classes now accept a generic type parameter. Untyped versions of these classes are available to opt-out of the new, stricter behavior.
- objects with a length key set to zero will no longer validate as empty.
  
  This is technically a breaking change, since objects with a key `length` and value `0` will no longer validate as empty. This is a very minor change, and any reliance on this behavior is probably a bug anyway.
### http
- Queries including + will now actually query for + instead of space.
  Most workarounds involving custom codecs will be unaffected.
  Possible server-side workarounds will need to be undone.
- JSONP will throw an error when headers are set on a reques
  
  JSONP does not support headers being set on requests. Before when
  a request was sent to a JSONP backend that had headers set the headers
  were ignored. The JSONP backend will now throw an error if it
  receives a request that has any headers set. Any uses of JSONP
  on requests with headers set will need to remove the headers
  to avoid the error.
### platform-browser
- This change may cause a breaking change in unit tests that are implicitly depending on a specific
  number and sequence of change detections in order for their assertions to pass.
- This may break invalid calls to `TransferState` methods.
  
  This tightens parameter types of `TransferState` usage, and is a minor breaking change which may reveal existing problematic calls.
### router
- The type of `Route.pathMatch` is now stricter. Places that use
  `pathMatch` will likely need to be updated to have an explicit
  `Route`/`Routes` type so that TypeScript does not infer the type as
  `string`.
- When returning a `Promise` from the
  `LoadChildrenCallback`, the possible type is now restricted to
  `Type<any>|NgModuleFactory<any>` rather than `any`.
- `initialNavigation: 'enabled'` was deprecated in v11 and is replaced by
  `initialNavigation: 'enabledBlocking'`.
- The type of `component` on `ActivatedRoute` and `ActivatedRouteSnapshot`
  includes `string`. In reality, this is not the case. The component
  cannot be anything other than a component class.
- * The type of `initialUrl` is set to `string|UrlTree` but in reality,
    the `Router` only sets it to a value that will always be `UrlTree`
  * `initialUrl` is documented as "The target URL passed into the
    `Router#navigateByUrl()` call before navigation" but the value
    actually gets set to something completely different. It's set to the
    current internal `UrlTree` of the Router at the time navigation
    occurs.
  
  With this change, there is no exact replacement for the old value of
  `initialUrl` because it was never intended to be exposed.
  `Router.url` is likely the best replacement for this.
  In more specific use-cases, tracking the `finalUrl` between successful
  navigations can also be used as a replacement.
- Lazy loaded configs are now also validated once loaded like the
  initial set of routes are. Lazy loaded modules which have invalid Route
  configs will now error. Note that this is only done in dev mode so
  there is no production impact of this change.
- When a guard returns a `UrlTree`, the router would previously schedule
  the redirect navigation within a `setTimeout`. This timeout is now removed,
  which can result in test failures due to incorrectly written tests.
  Tests which perform navigations should ensure that all timeouts are
  flushed before making assertions. Tests should ensure they are capable
  of handling all redirects from the original navigation.
- Previously, resolvers were waiting to be completed
  before proceeding with the navigation and the Router would take the last
  value emitted from the resolver.
  The router now takes only the first emitted value by the resolvers
  and then proceeds with navigation. This is now consistent with `Observables`
  returned by other guards: only the first value is used.
### zone.js
- in TaskTrackingZoneSpec track a periodic task until it is cancelled
  
  The breaking change is scoped only to the plugin
  `zone.js/plugins/task-tracking`. If you used `TaskTrackingZoneSpec` and
  checked the pending macroTasks e.g. using `(this.ngZone as any)._inner
  ._parent._properties.TaskTrackingZone.getTasksFor('macroTask')`, then
  its behavior slightly changed for periodic macrotasks. For example,
  previously the `setInterval` macrotask was no longer tracked after its
  callback was executed for the first time. Now it's tracked until
  the task is explicitly cancelled, e.g  with `clearInterval(id)`.
  
## Deprecations
### common
- The `ngModuleFactory` input of the `NgComponentOutlet` directive is deprecated in favor of a newly added `ngModule` input. The `ngModule` input accepts references to the NgModule class directly, without the need to resolve module factory first.
### forms
- The `initialValueIsDefault` option has been deprecated and replaced with the otherwise-identical `nonNullable` option, for the sake of naming consistency.
- It is now deprecated to provide *both* `AbstractControlOption`s and an async validators argument to a FormControl. Previously, the async validators would just be silently dropped, resulting in a probably buggy forms. Now, the constructor call is deprecated, and Angular will print a warning in devmode.
### router
- The `resolver` argument of the `RouterOutletContract.activateWith` function and the `resolver` field of the `OutletContext` class are deprecated. Passing component factory resolvers are no longer needed. The `ComponentFactoryResolver`-related symbols were deprecated in `@angular/core` package since v13.
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [a6fa37bc6e](https://github.com/angular/angular/commit/a6fa37bc6e705fee48f555d4b8022915094e8b16) | feat | make validateStyleProperty check dev-mode only ([#45570](https://github.com/angular/angular/pull/45570)) |
| [79d334b138](https://github.com/angular/angular/commit/79d334b1385685d0fd1451534df2ed3cbaefa0b6) | feat | provide warnings for non-animatable CSS properties ([#45212](https://github.com/angular/angular/pull/45212)) |
| [f8dc660605](https://github.com/angular/angular/commit/f8dc66060591e1ce42265a7862c3df16e40b05e1) | fix | allow animations with unsupported CSS properties ([#44729](https://github.com/angular/angular/pull/44729)) |
| [2a75754ee8](https://github.com/angular/angular/commit/2a75754ee823032e651bc596887a2186dc6846ae) | fix | apply default params when resolved value is null or undefined ([#45339](https://github.com/angular/angular/pull/45339)) |
| [e46b379204](https://github.com/angular/angular/commit/e46b37920438d84bff895498c0a102dd1ffba178) | fix | implement missing transition delay ([#44799](https://github.com/angular/angular/pull/44799)) |
| [5c7c56bc85](https://github.com/angular/angular/commit/5c7c56bc859b195bf6710f6c1479d9e18dde35b1) | perf | improve algorithm to balance animation namespaces ([#45057](https://github.com/angular/angular/pull/45057)) |
| [4c778cdb28](https://github.com/angular/angular/commit/4c778cdb28de128c6ddecd2fd6cb6257d675500b) | perf | made errors in the animations package tree shakeable ([#45004](https://github.com/angular/angular/pull/45004)) |
| [7a81481fb2](https://github.com/angular/angular/commit/7a81481fb29e94b550db7ad68270eccf26bb2743) | perf | Remove generic objects in favor of Maps ([#44482](https://github.com/angular/angular/pull/44482)) |
| [6642e3c8fd](https://github.com/angular/angular/commit/6642e3c8fd7d3b5ed22710667b2c41a46f14eda8) | perf | remove no longer needed CssKeyframes classes ([#44903](https://github.com/angular/angular/pull/44903)) |
| [59559fdbac](https://github.com/angular/angular/commit/59559fdbacc00bee380b1e88c79d08b6e856ebbe) | refactor | make `AnimationDriver.getParentElement` required ([#45114](https://github.com/angular/angular/pull/45114)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [31d7c3bd71](https://github.com/angular/angular/commit/31d7c3bd71fdab3fef1b4615ecb8124fe6c165bd) | feat | add getState method to LocationStrategy interface ([#45648](https://github.com/angular/angular/pull/45648)) |
| [c89cf63059](https://github.com/angular/angular/commit/c89cf63059370bba43717483e3d9627499dfe815) | feat | support NgModule as an input to the NgComponentOutlet ([#44815](https://github.com/angular/angular/pull/44815)) |
| [38c03a2035](https://github.com/angular/angular/commit/38c03a20358db3f8621c023b98e627cd385731c0) | feat | support years greater than 9999 ([#43622](https://github.com/angular/angular/pull/43622)) |
| [bedb257afc](https://github.com/angular/angular/commit/bedb257afc1ca12eb221536ea44ade960e62cda0) | fix | cleanup URL change listeners when the root view is removed ([#44901](https://github.com/angular/angular/pull/44901)) |
| [10691c626b](https://github.com/angular/angular/commit/10691c626bf381bedfa278e9d50ab922b4b656cd) | fix | properly cast http param values to strings ([#42643](https://github.com/angular/angular/pull/42643)) |
| [05d50b849b](https://github.com/angular/angular/commit/05d50b849bb891c37c3eefab81a45099057dfd78) | perf | make `NgLocalization` token tree-shakable ([#45118](https://github.com/angular/angular/pull/45118)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [bb8d7091c6](https://github.com/angular/angular/commit/bb8d7091c64a785758ae347b1a9bcdeeed95897c) | fix | exclude empty styles from emitted metadata ([#45459](https://github.com/angular/angular/pull/45459)) |
| [4d6a1d6722](https://github.com/angular/angular/commit/4d6a1d672210219328b33f4f96210870563066ee) | fix | scope css keyframes in emulated view encapsulation ([#42608](https://github.com/angular/angular/pull/42608)) |
| [f03e313f24](https://github.com/angular/angular/commit/f03e313f24465cbe9ce99aa5f9f482a6c6b5485f) | fix | scope css keyframes in emulated view encapsulation ([#42608](https://github.com/angular/angular/pull/42608)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [9cf14ff03d](https://github.com/angular/angular/commit/9cf14ff03dc7a848413b323dfb943fcd26f1217e) | feat | exclude abstract classes from `strictInjectionParameters` requirement ([#44615](https://github.com/angular/angular/pull/44615)) |
| [0072eb48ba](https://github.com/angular/angular/commit/0072eb48ba1c6f549703988b7fd7ba3e09058048) | feat | initial implementation of standalone components ([#44812](https://github.com/angular/angular/pull/44812)) |
| [2142ffd295](https://github.com/angular/angular/commit/2142ffd295de491eb8582c2eb1712b5b48044f24) | feat | propagate `standalone` flag to runtime ([#44973](https://github.com/angular/angular/pull/44973)) |
| [6f653e05f9](https://github.com/angular/angular/commit/6f653e05f985141ae4d2d90af78b2bc001595661) | feat | standalone types imported into NgModule scopes ([#44973](https://github.com/angular/angular/pull/44973)) |
| [752ddbc165](https://github.com/angular/angular/commit/752ddbc165359c2ff987c24f715d0a36fd604ec0) | feat | Support template binding to protected component members ([#45823](https://github.com/angular/angular/pull/45823)) |
| [3d13343975](https://github.com/angular/angular/commit/3d133439754cbf5d5a20bb3c714c8673c848e465) | fix | better error messages for NgModule structural issues ([#44973](https://github.com/angular/angular/pull/44973)) |
| [046dad1a8d](https://github.com/angular/angular/commit/046dad1a8d878ea537a6e2ef5f5ef24a85a2cf02) | fix | fix issue with incremental tracking of APIs for pipes ([#45672](https://github.com/angular/angular/pull/45672)) |
| [27b4af7240](https://github.com/angular/angular/commit/27b4af7240ea964d1e4d51b83118f10321163627) | fix | full side-effectful registration of NgModules with ids ([#45024](https://github.com/angular/angular/pull/45024)) |
| [32c625d027](https://github.com/angular/angular/commit/32c625d0279d9fd55178ced47c45969da533eedc) | fix | handle forwardRef in imports of standalone component ([#45869](https://github.com/angular/angular/pull/45869)) |
| [06050ac2b4](https://github.com/angular/angular/commit/06050ac2b4937836096fb331ec71bacb5a1fc231) | fix | handle inline type-check blocks in nullish coalescing extended check ([#45454](https://github.com/angular/angular/pull/45454)) |
| [a524a50361](https://github.com/angular/angular/commit/a524a50361bb408cf8baf8ff209378a1db967545) | fix | handle standalone components with cycles ([#46029](https://github.com/angular/angular/pull/46029)) |
| [724e88e042](https://github.com/angular/angular/commit/724e88e042b1a89691d48879673b5e1b161c3d9a) | fix | preserve `forwardRef` for component scopes ([#46139](https://github.com/angular/angular/pull/46139)) |
| [9cfea3d522](https://github.com/angular/angular/commit/9cfea3d522c0e4a34bb3a5d0fa9d04f64de39b49) | fix | report invalid imports in standalone components during resolve phase ([#45827](https://github.com/angular/angular/pull/45827)) |
| [c0778b4dfc](https://github.com/angular/angular/commit/c0778b4dfc1c107543b3db6f1958814a0812c7df) | fix | Support resolve animation name from the DTS ([#45107](https://github.com/angular/angular/pull/45107)) |
| [f2e5234e07](https://github.com/angular/angular/commit/f2e5234e078b6d4771d07e8b28b8098f1faeb176) | fix | update unknown tag error for aot standalone components ([#45919](https://github.com/angular/angular/pull/45919)) |
| [35f20afcac](https://github.com/angular/angular/commit/35f20afcac4877963e4a3e5d85b67ed8cb000af9) | fix | use existing imports for standalone dependencies ([#46029](https://github.com/angular/angular/pull/46029)) |
| [8155428ba6](https://github.com/angular/angular/commit/8155428ba65c38c0c15f2666727202a7b360c1bd) | perf | ignore the module.id anti-pattern for NgModule ids ([#45024](https://github.com/angular/angular/pull/45024)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [174ce7dd13](https://github.com/angular/angular/commit/174ce7dd13f6d8f941d3aa0b843559614cb68b0c) | feat | add `ApplicationRef.destroy` method ([#45624](https://github.com/angular/angular/pull/45624)) |
| [5771b18a98](https://github.com/angular/angular/commit/5771b18a989c3c75d713ffb75cd7c047c63e4090) | feat | add the `bootstrapApplication` function ([#45674](https://github.com/angular/angular/pull/45674)) |
| [69018c9f42](https://github.com/angular/angular/commit/69018c9f42d14c1c7aa8271b406d6d247de1c564) | feat | allow for injector to be specified when creating an embedded view ([#45156](https://github.com/angular/angular/pull/45156)) |
| [94c949a60a](https://github.com/angular/angular/commit/94c949a60ad0de1f5385ec97f2c1933cb1d55f22) | feat | allow for injector to be specified when creating an embedded view ([#45156](https://github.com/angular/angular/pull/45156)) |
| [e702cafcf2](https://github.com/angular/angular/commit/e702cafcf2fef53968ef52ce17cb343f3a12bb53) | feat | allow to throw on unknown elements in tests ([#45479](https://github.com/angular/angular/pull/45479)) |
| [6662a97c61](https://github.com/angular/angular/commit/6662a97c61f133a14f2d117f71e4d2b8f4a83c32) | feat | allow to throw on unknown elements in tests ([#45479](https://github.com/angular/angular/pull/45479)) |
| [a6675925b0](https://github.com/angular/angular/commit/a6675925b0b6f313d4932a753bd4aa4cb473b5f3) | feat | allow to throw on unknown properties in tests ([#45853](https://github.com/angular/angular/pull/45853)) |
| [6eaaefd22e](https://github.com/angular/angular/commit/6eaaefd22ebb95ee896a62237832ff2f2defdee0) | feat | drop support for Node.js 12 ([#45286](https://github.com/angular/angular/pull/45286)) |
| [c9d566ce4b](https://github.com/angular/angular/commit/c9d566ce4b6e9097d9eceb7ac3964a0b25c404ad) | feat | drop support for TypeScript 4.4 and 4.5 ([#45394](https://github.com/angular/angular/pull/45394)) |
| [b568a5e708](https://github.com/angular/angular/commit/b568a5e708579f5035f40c7218fbba39ad6b3065) | feat | implement `importProvidersFrom` function ([#45626](https://github.com/angular/angular/pull/45626)) |
| [d5a6cd1111](https://github.com/angular/angular/commit/d5a6cd11110c78762a8e6115a718f5851508dbf2) | feat | implement EnvironmentInjector with adapter to NgModuleRef ([#45626](https://github.com/angular/angular/pull/45626)) |
| [5a10fc4f82](https://github.com/angular/angular/commit/5a10fc4f8287d448c88ce2f6c97c48307af34af1) | feat | implement standalone directives, components, and pipes ([#45687](https://github.com/angular/angular/pull/45687)) |
| [e461f716d4](https://github.com/angular/angular/commit/e461f716d4b736829d53de26ba6dddb58f476746) | feat | move ANIMATION_MODULE_TYPE injection token into core ([#44970](https://github.com/angular/angular/pull/44970)) |
| [94bba76a4a](https://github.com/angular/angular/commit/94bba76a4a9594a5eb90e581f407f1b70697e715) | feat | support TypeScript 4.6 ([#45190](https://github.com/angular/angular/pull/45190)) |
| [29039fcdbc](https://github.com/angular/angular/commit/29039fcdbcb8cab040d88dabe2dcb1abae34cb4e) | feat | support TypeScript 4.7 ([#45749](https://github.com/angular/angular/pull/45749)) |
| [225e4f2dbe](https://github.com/angular/angular/commit/225e4f2dbeac5982982fb94eac65ea931c44247a) | feat | triggerEventHandler accept optional eventObj ([#45279](https://github.com/angular/angular/pull/45279)) |
| [401dec46eb](https://github.com/angular/angular/commit/401dec46eb71e33ae3ef185b8f92ed2b3b7661fd) | feat | update TestBed to recognize Standalone Components ([#45809](https://github.com/angular/angular/pull/45809)) |
| [35653ce337](https://github.com/angular/angular/commit/35653ce337b59336ebb06f07dfed027e5037ed06) | fix | add more details to the MISSING_INJECTION_CONTEXT error ([#46166](https://github.com/angular/angular/pull/46166)) |
| [d36fa111eb](https://github.com/angular/angular/commit/d36fa111eb677d504a9952d8b4ca53560cadd04d) | fix | avoid Closure Compiler error in restoreView ([#45445](https://github.com/angular/angular/pull/45445)) |
| [0bc77f4cab](https://github.com/angular/angular/commit/0bc77f4cabb3fe76accb120f7aba57ebfee9262b) | fix | better error message when unknown property is present ([#46147](https://github.com/angular/angular/pull/46147)) |
| [f3eb7d9ecb](https://github.com/angular/angular/commit/f3eb7d9ecb9a82e7396cca658e3250e47c853153) | fix | Ensure the `StandaloneService` is retained after closure minification ([#45783](https://github.com/angular/angular/pull/45783)) |
| [701405fa71](https://github.com/angular/angular/commit/701405fa710177ed1c963f61686ebb910e5ec74e) | fix | handle AOT-compiled standalone components in TestBed correctly ([#46052](https://github.com/angular/angular/pull/46052)) |
| [ddce357d1d](https://github.com/angular/angular/commit/ddce357d1db9694bc69c114deb96e26d2651fb8b) | fix | improve TestBed declarations standalone error message ([#45999](https://github.com/angular/angular/pull/45999)) |
| [ba9f30c9a6](https://github.com/angular/angular/commit/ba9f30c9a6af19b34d13962303ec96997c7c3d56) | fix | include component name into unknown element/property error message ([#46160](https://github.com/angular/angular/pull/46160)) |
| [9fa6f5a552](https://github.com/angular/angular/commit/9fa6f5a552b7780ce32aa5a60273d4008a7b6afb) | fix | incorrectly inserting elements inside `<template>` element ([#43429](https://github.com/angular/angular/pull/43429)) |
| [d5719c2e0f](https://github.com/angular/angular/commit/d5719c2e0fb237be71d658444bbfe2410e05086a) | fix | input coercion ([#42803](https://github.com/angular/angular/pull/42803)) |
| [be161bef79](https://github.com/angular/angular/commit/be161bef798ac5309df8390e3c2bba2cf84cb530) | fix | memory leak in event listeners inside embedded views ([#43075](https://github.com/angular/angular/pull/43075)) |
| [fa755b2a54](https://github.com/angular/angular/commit/fa755b2a541274336541e8870852e73718ad62d4) | fix | prevent `BrowserModule` providers from being loaded twice ([#45826](https://github.com/angular/angular/pull/45826)) |
| [3172b4cc99](https://github.com/angular/angular/commit/3172b4cc9972a7d347b3078484c9adcb15cf270c) | fix | produce proper error message for unknown props on `<ng-template>`s ([#46068](https://github.com/angular/angular/pull/46068)) |
| [4f1a813596](https://github.com/angular/angular/commit/4f1a813596a40f7885d369eb8917aedcce9dd795) | fix | restore NgModule state correctly after TestBed overrides ([#46049](https://github.com/angular/angular/pull/46049)) |
| [3f7ecec59b](https://github.com/angular/angular/commit/3f7ecec59b894d2a92f4b5643d2a23891938bde8) | fix | set correct context for inject() for component ctors ([#45991](https://github.com/angular/angular/pull/45991)) |
| [4e413d9240](https://github.com/angular/angular/commit/4e413d9240259fca1b1e548c5c405e646f8e68c8) | fix | support nested arrays of providers in `EnvironmentInjector` ([#45789](https://github.com/angular/angular/pull/45789)) |
| [fde4942cdf](https://github.com/angular/angular/commit/fde4942cdf5133119b13ed26ee2f6976b787d84c) | fix | throw if standalone components are present in `@NgModule.bootstrap` ([#45825](https://github.com/angular/angular/pull/45825)) |
| [560188bf12](https://github.com/angular/angular/commit/560188bf126f259328477773cabb367587a257d5) | fix | update unknown property error to account for standalone components in AOT ([#46159](https://github.com/angular/angular/pull/46159)) |
| [df339d8abf](https://github.com/angular/angular/commit/df339d8abf979c715c35db813c5a80252a92eba7) | fix | update unknown tag error for jit standalone components ([#45920](https://github.com/angular/angular/pull/45920)) |
| [aafac7228f](https://github.com/angular/angular/commit/aafac7228f3d18bb720e85d2b889df446122f4c7) | fix | verify standalone component imports in JiT ([#45777](https://github.com/angular/angular/pull/45777)) |
| [e9317aee71](https://github.com/angular/angular/commit/e9317aee71f64f4aadea0529601e589b37f6b46f) | perf | allow `checkNoChanges` mode to be tree-shaken in production ([#45913](https://github.com/angular/angular/pull/45913)) |
| [071c8af8ba](https://github.com/angular/angular/commit/071c8af8ba89163270f17657c0c7f1c944f186f7) | perf | avoid storing LView in `__ngContext__` ([#45051](https://github.com/angular/angular/pull/45051)) |
| [a96c4827c4](https://github.com/angular/angular/commit/a96c4827c4f62e1d665d8544a3e66c51d2644c88) | perf | make `Compiler`, `ApplicationRef` and `ApplicationInitStatus` tree-shakable ([#45102](https://github.com/angular/angular/pull/45102)) |
| [45d98e7ca5](https://github.com/angular/angular/commit/45d98e7ca5accf918e2602cbc17805e11e18896b) | perf | make `IterableDiffers` and `KeyValueDiffers` tree-shakable ([#45094](https://github.com/angular/angular/pull/45094)) |
| [1e60fe0a3e](https://github.com/angular/angular/commit/1e60fe0a3eeb6bd46997f7eeb4825351cfbe3c44) | perf | make `LOCALE_ID` and other tokens from `ApplicationModule` tree-shakable ([#45102](https://github.com/angular/angular/pull/45102)) |
| [88f1168506](https://github.com/angular/angular/commit/88f1168506befd0665125da1fca2a719cb27dbb5) | perf | only track LViews that are referenced in `__ngContext__` ([#45172](https://github.com/angular/angular/pull/45172)) |
| [9add714b13](https://github.com/angular/angular/commit/9add714b13740db621eb2b200d72be74cc7eb630) | refactor | remove deprecated `aotSummaries` fields in TestBed config ([#45487](https://github.com/angular/angular/pull/45487)) |
### devtools tabs
| Commit | Type | Description |
| -- | -- | -- |
| [6c284ef32e](https://github.com/angular/angular/commit/6c284ef32e53a8dabbc368b9cf69f1b6f1a377b7) | fix | stop scroll occuring at tabs level |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [2dbdebc646](https://github.com/angular/angular/commit/2dbdebc6467074c7005c09ef5c229029f8d3607c) | feat | Add `FormBuilder.nonNullable`. ([#45852](https://github.com/angular/angular/pull/45852)) |
| [e0a2248b32](https://github.com/angular/angular/commit/e0a2248b3233b5d384f33859ef6207613cad909d) | feat | Add a FormRecord type. ([#45607](https://github.com/angular/angular/pull/45607)) |
| [7ee121f595](https://github.com/angular/angular/commit/7ee121f595a47338b31098ae51a6f91d80c8fdce) | feat | Add untyped versions of the model classes for use in migration. ([#45205](https://github.com/angular/angular/pull/45205)) |
| [89d299105a](https://github.com/angular/angular/commit/89d299105a4ae11985fb809f42cd0e34511207c9) | feat | Implement strict types for the Angular Forms package. ([#43834](https://github.com/angular/angular/pull/43834)) |
| [f490c2de4e](https://github.com/angular/angular/commit/f490c2de4e1ada26e62e35c0d70cb90e55297658) | feat | support negative indices in FormArray methods. ([#44848](https://github.com/angular/angular/pull/44848)) |
| [39be06037d](https://github.com/angular/angular/commit/39be06037daf65ae9298b5bdb4cd50785c16332f) | fix | Add a `nonNullable` option to `FormControl` for consistency. |
| [4332897baa](https://github.com/angular/angular/commit/4332897baa2226ef246ee054fdd5254e3c129109) | fix | Add UntypedFormBuilder ([#45268](https://github.com/angular/angular/pull/45268)) |
| [5d13e58aed](https://github.com/angular/angular/commit/5d13e58aed8b7641f0b2d4f0c9015cb90ff4edb5) | fix | Allow NonNullableFormBuilder to be injected. ([#45904](https://github.com/angular/angular/pull/45904)) |
| [8dd3f82f94](https://github.com/angular/angular/commit/8dd3f82f946bae86dc6c678d8694ab73d915bbfa) | fix | Correct empty validator to handle objects with a property `length: 0`. ([#33729](https://github.com/angular/angular/pull/33729)) |
| [ff3f5a8d12](https://github.com/angular/angular/commit/ff3f5a8d12e3243620e311b690a050e26493e539) | fix | Fix a typing bug in FormBuilder. ([#45684](https://github.com/angular/angular/pull/45684)) |
| [fe0e42a996](https://github.com/angular/angular/commit/fe0e42a996d5b70f4c0923cb6570c9a8032b1298) | fix | Make UntypedFormBuilder assignable to FormBuilder, and vice versa. ([#45421](https://github.com/angular/angular/pull/45421)) |
| [b36dec6b5b](https://github.com/angular/angular/commit/b36dec6b5b05de0d40581726c59db9f962a97124) | fix | not picking up disabled state if group is swapped out and disabled ([#43499](https://github.com/angular/angular/pull/43499)) |
| [9f6fa5b746](https://github.com/angular/angular/commit/9f6fa5b746cbdd4a71f67728ff6b663ad26c6a29) | fix | Prevent FormBuilder from distributing unions to control types. ([#45942](https://github.com/angular/angular/pull/45942)) |
| [aa7b857be8](https://github.com/angular/angular/commit/aa7b857be89a62e6dcfe62c418acf0823525d265) | fix | Property renaming safe code ([#45271](https://github.com/angular/angular/pull/45271)) |
| [cae1e44608](https://github.com/angular/angular/commit/cae1e44608227ac80682401190c6d28ef39b3269) | fix | Update the typed forms migration to use `FormArray<T>` instead of `FormArray<T[]>`. ([#44933](https://github.com/angular/angular/pull/44933)) |
| [d336ba96d9](https://github.com/angular/angular/commit/d336ba96d922363235688f54d8af108ef7ab01f0) | fix | Update the typed forms migration. ([#45281](https://github.com/angular/angular/pull/45281)) |
| [018550ed50](https://github.com/angular/angular/commit/018550ed5025de9737794b683eb7c0697d83d430) | fix | Value and RawValue should be part of the public API. ([#45978](https://github.com/angular/angular/pull/45978)) |
| [2e96cede3e](https://github.com/angular/angular/commit/2e96cede3e2d9ac399c10d3bfe25259b92a5276e) | fix | Warn on FormControls that are constructed with both options and asyncValidators. |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [76a9a24cdc](https://github.com/angular/angular/commit/76a9a24cdcb87e36868e2e29d1831af2dec3a818) | fix | encode + signs in query params as %2B (angular[#11058](https://github.com/angular/angular/pull/11058)) ([#45111](https://github.com/angular/angular/pull/45111)) |
| [d43c0e973f](https://github.com/angular/angular/commit/d43c0e973f4389c74eb19a7f6b667bd2e1d380fe) | fix | Throw error when headers are supplied in JSONP request ([#45210](https://github.com/angular/angular/pull/45210)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [9d4af65e34](https://github.com/angular/angular/commit/9d4af65e343e41b48cb9afd12c2b61d8ca61a9ac) | feat | Provide plugin to delegate rename requests to Angular ([#44696](https://github.com/angular/angular/pull/44696)) |
| [3ae133c69e](https://github.com/angular/angular/commit/3ae133c69e1c78d5ddf772cacf222f909faccd70) | fix | Fix detection of Angular for v14+ projects ([#45998](https://github.com/angular/angular/pull/45998)) |
### localize
| Commit | Type | Description |
| -- | -- | -- |
| [a50e2da64a](https://github.com/angular/angular/commit/a50e2da64a4297d1bc994a267203c2097da2efaf) | fix | ensure transitively loaded compiler code is tree-shakable ([#45405](https://github.com/angular/angular/pull/45405)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [d56a537196](https://github.com/angular/angular/commit/d56a537196d2ab0f3f48821889020d2f5bc621ba) | feat | Add migration to add explicit `Route`/`Routes` type ([#45084](https://github.com/angular/angular/pull/45084)) |
### ngcc
| Commit | Type | Description |
| -- | -- | -- |
| [74a2e2e2ec](https://github.com/angular/angular/commit/74a2e2e2ecb81a31c7fbec42d7770937b09e33a4) | fix | cope with packages following APF v14+ ([#45833](https://github.com/angular/angular/pull/45833)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [a01bcb8e7e](https://github.com/angular/angular/commit/a01bcb8e7eaf63ac9466a78dd4d15228241da900) | fix | do not run change detection when loading Hammer ([#44921](https://github.com/angular/angular/pull/44921)) |
| [b32647dc68](https://github.com/angular/angular/commit/b32647dc68b055da0c49c86d6e7e2a7d2ec5954a) | fix | Make transfer state key typesafe. ([#23020](https://github.com/angular/angular/pull/23020)) |
| [c7bf75dd5e](https://github.com/angular/angular/commit/c7bf75dd5e7f3f80a3c2afb8586ae46f7258f349) | fix | remove obsolete shim for Map comparison in Jasmine ([#45521](https://github.com/angular/angular/pull/45521)) |
| [23c4c9601e](https://github.com/angular/angular/commit/23c4c9601e1bdd8bd2e37d9e0468440a44971b95) | perf | avoid including Testability by default in `bootstrapApplication` ([#45885](https://github.com/angular/angular/pull/45885)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [dff5586d52](https://github.com/angular/angular/commit/dff5586d5243f914b9054b5ab7ac71d57edfa973) | feat | implement `renderApplication` function ([#45785](https://github.com/angular/angular/pull/45785)) |
| [22c71be94c](https://github.com/angular/angular/commit/22c71be94c3a695ca0cd0316065d807abb46355f) | fix | update `renderApplication` to move `appId` to options ([#45844](https://github.com/angular/angular/pull/45844)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [f4fd1a8262](https://github.com/angular/angular/commit/f4fd1a82620b5b3899c5e8c89fa06b084ee5792e) | feat | Add `EnvironmentInjector` to `RouterOutlet.activateWith` ([#45597](https://github.com/angular/angular/pull/45597)) |
| [910de8bc33](https://github.com/angular/angular/commit/910de8bc3379b1452c0bc23a866b5108d6d94e55) | feat | Add `Route.title` with a configurable `TitleStrategy` ([#43307](https://github.com/angular/angular/pull/43307)) |
| [4e0957a4e1](https://github.com/angular/angular/commit/4e0957a4e10d1ae188faa843043a2314c9873c52) | feat | Add ability to specify providers on a Route ([#45673](https://github.com/angular/angular/pull/45673)) |
| [dea8c86cd5](https://github.com/angular/angular/commit/dea8c86cd57f8e1720634928805f9ea0ba8f0baa) | feat | add ariaCurrentWhenActive input to RouterLinkActive directive ([#45167](https://github.com/angular/angular/pull/45167)) |
| [41e2a68e30](https://github.com/angular/angular/commit/41e2a68e30c12e5ad3e26047c3a4032e9aa1a6e1) | feat | add type properties to all router events ([#44189](https://github.com/angular/angular/pull/44189)) |
| [4962a4a332](https://github.com/angular/angular/commit/4962a4a3324d5972f364d768b38b21a33fdb7d7c) | feat | Allow `loadChildren` to return a `Route` array ([#45700](https://github.com/angular/angular/pull/45700)) |
| [791bd31424](https://github.com/angular/angular/commit/791bd3142432ed7caf14a68a6e434b27004e634b) | feat | set stricter type for Route.title ([#44939](https://github.com/angular/angular/pull/44939)) |
| [50004c143b](https://github.com/angular/angular/commit/50004c143ba9b1e041c7b30caf98f6582d3d26d4) | feat | Support lazy loading standalone components with `loadComponent` ([#45705](https://github.com/angular/angular/pull/45705)) |
| [7fd416d060](https://github.com/angular/angular/commit/7fd416d060bd873bc88dffed41946c51aa649ec1) | fix | Fix type of Route.pathMatch to be more accurate ([#45176](https://github.com/angular/angular/pull/45176)) |
| [1c11a57155](https://github.com/angular/angular/commit/1c11a5715576632a4fb7170202395cf95dfbce09) | fix | merge interited resolved data and static data ([#45276](https://github.com/angular/angular/pull/45276)) |
| [f8f3ab377b](https://github.com/angular/angular/commit/f8f3ab377b8842c2bae0f215a0e90aaa3a1e070a) | fix | Remove `any` from `LoadChildrenCallback` type ([#45524](https://github.com/angular/angular/pull/45524)) |
| [d4fc12fa19](https://github.com/angular/angular/commit/d4fc12fa19dbe5e89189bb52c37e5d37a00a663c) | fix | Remove deprecated initialNavigation option ([#45729](https://github.com/angular/angular/pull/45729)) |
| [989e840cce](https://github.com/angular/angular/commit/989e840cce7ebe94311ae898786e09b1b41ce7f6) | fix | Remove unused string type for ActivatedRoute.component ([#45625](https://github.com/angular/angular/pull/45625)) |
| [64f837d2c0](https://github.com/angular/angular/commit/64f837d2c0fbcf722d32b35a87e87220bfe61f65) | fix | Update `Navigation#initialUrl` to match documentation and reality ([#43863](https://github.com/angular/angular/pull/43863)) |
| [96fd29c6d2](https://github.com/angular/angular/commit/96fd29c6d2d2abc5afee4d21a3e964a79aa39844) | fix | validate lazy loaded configs ([#45526](https://github.com/angular/angular/pull/45526)) |
| [f13295f3a3](https://github.com/angular/angular/commit/f13295f3a3a1d622d15cf8339360d53feba824b5) | perf | cancel the navigation instantly if at least one resolver doesn't emit any value ([#45621](https://github.com/angular/angular/pull/45621)) |
| [1d2f5c1101](https://github.com/angular/angular/commit/1d2f5c1101ccd182f5b528de52583a1b98dd6789) | refactor | deprecate no longer needed resolver fields ([#45597](https://github.com/angular/angular/pull/45597)) |
| [7b367d9d90](https://github.com/angular/angular/commit/7b367d9d908e15222645a45e2ba133b9d9da76b7) | refactor | Remove unnecessary setTimeout in UrlTree redirects ([#45735](https://github.com/angular/angular/pull/45735)) |
| [c9679760b2](https://github.com/angular/angular/commit/c9679760b2bf5c607c957c20482b9cea7a21702b) | refactor | take only the first emitted value of every resolver to make it consistent with guards ([#44573](https://github.com/angular/angular/pull/44573)) |
### service-worker
| Commit | Type | Description |
| -- | -- | -- |
| [ec0a0e0669](https://github.com/angular/angular/commit/ec0a0e0669ef5d2f524fbf9a540eb2b306b2e24a) | feat | add `cacheOpaqueResponses` option for data-groups ([#44723](https://github.com/angular/angular/pull/44723)) |
| [bd04fbc05b](https://github.com/angular/angular/commit/bd04fbc05b0397de966a493a863e1054203c86d9) | feat | emit a notification when the service worker is already up-to-date after check ([#45216](https://github.com/angular/angular/pull/45216)) |
## Special Thanks
Adrian Kunz, Alan Agius, AleksanderBodurri, Alex Rickabaugh, AlirezaEbrahimkhani, Amir Rustamzadeh, Andrew Kushnir, Andrew Scott, Chabbey François, Charles Lyding, Cédric Exbrayat, Daan De Smedt, David Schmidt, Derek Cormier, Dmitrij Kuba, Doug Parker, Dylan Hunn, Emma Twersky, George Kalpakas, George Looshch, Jan Kuehle, Jessica Janiuk, JiaLiPassion, JimMorrison723, Joe Martin (Crowdstaffing), Joey Perrott, JoostK, Kristiyan Kostadinov, Krzysztof Platis, Leosvel Pérez Espinosa, Maddie Klein, Mark Whitfeld, Martin Sikora, Michael-Doner, Michal Materowski, Minko Gechev, Paul Gschwendtner, Pawel Kozlowski, Payam Shahidi, Pusztai Tibor, Ricardo Mattiazzi Baumgartner, Roy Dorombozi, Ruslan Lekhman, Samuel Littley, Sergej Grilborzer, Sumit Arora, Tobias Speicher, Virginia Dooley, Zack Elliott, alirezaghey, ananyahs96, arturovt, cexbrayat, dario-piotrowicz, ivanwonder, kamikopi, markostanimirovic, markwhitfeld, mgechev, renovate[bot], twerske and zverbeta

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.3.11"></a>
# 13.3.11 (2022-05-31)
## Special Thanks
Andrew Scott, Billy Lando, George Kalpakas, Ian Gregory, Matt Shaffer, Rune Andersen Hartvig, dario-piotrowicz and mgechev

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.3.10"></a>
# 13.3.10 (2022-05-25)
## Special Thanks
A. J. Javier, Aristeidis Bampakos, J Rob Gant, Jerome Kruse, Joey Perrott, Nathan Nontell, Paul Gschwendtner, Roopesh Chinnakampalli, Thomas Mair, Tom Raithel, dario-piotrowicz and mgechev

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.3.9"></a>
# 13.3.9 (2022-05-18)

This release contains API docs improvements.

## Special Thanks
4javier, Bob Watson, Evan Lee, George Kalpakas, Joey Perrott, Pavan Kumar Jadda, celinetunc and mariu

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.3.8"></a>
# 13.3.8 (2022-05-12)
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [b4eb9ed884](https://github.com/angular/angular/commit/b4eb9ed884a82ba741abb503c974df7ec0d0048a) | fix | Prevent TSServer from removing templates from project ([#45965](https://github.com/angular/angular/pull/45965)) |
## Special Thanks
Andrew Scott, George Kalpakas and Joey Perrott

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.3.7"></a>
# 13.3.7 (2022-05-11)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [73bbee2c0d](https://github.com/angular/angular/commit/73bbee2c0d3fbc27d66306c017a67754fa5954c0) | perf | allow `checkNoChanges` mode to be tree-shaken in production ([#45936](https://github.com/angular/angular/pull/45936)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [5ca3bcf4f8](https://github.com/angular/angular/commit/5ca3bcf4f8f6be648ebc4891adec5d45de7ead2d) | fix | Add resource files as roots to their associated projects ([#45601](https://github.com/angular/angular/pull/45601)) |
## Special Thanks
Andrew Kushnir, Andrew Scott, George Kalpakas, JayMartMedia, JoostK, Paul Gschwendtner, Ted.chang, Thomas Mair, Will 保哥, dario-piotrowicz, mgechev and ᚷᛁᛟᚱᚷᛁ ᛒᚨᛚᚨᚲᚻᚨᛞᛉᛖ

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.3.6"></a>
# 13.3.6 (2022-05-04)
## Special Thanks
Andrew Kushnir, Andrew Scott, George Kalpakas, Paul Gschwendtner, Pawel Kozlowski, Ryan Day and dario-piotrowicz

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.3.5"></a>
# 13.3.5 (2022-04-27)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [63398e0eb4](https://github.com/angular/angular/commit/63398e0eb4d386eb43cf562e1350887d40489f0a) | fix | add this_is_bazel marker ([#45728](https://github.com/angular/angular/pull/45728)) |
## Special Thanks
Andrew Kushnir, George Kalpakas, Joey Perrott and dario-piotrowicz

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.3.4"></a>
# 13.3.4 (2022-04-20)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [9317f513d5](https://github.com/angular/angular/commit/9317f513d573916c43e1a43b361d1929765f24c7) | fix | better error message when directive extends a component ([#45658](https://github.com/angular/angular/pull/45658)) |
| [4766817f02](https://github.com/angular/angular/commit/4766817f0214619e7c3d74448897e0e0469051bb) | fix | improve multiple components match error ([#45645](https://github.com/angular/angular/pull/45645)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [d68333e508](https://github.com/angular/angular/commit/d68333e508272e57cc62165e847e068a503c9747) | fix | two-way binding completion should not remove the trailing quote ([#45582](https://github.com/angular/angular/pull/45582)) |
## Special Thanks
Andrew Kushnir, Andrew Scott, George Kalpakas, Ilya Marchik, Jeremy Elbourn, Kristiyan Kostadinov, Louis Gombert, Mangalraj, Marko Kaznovac, Paul Gschwendtner, Saurabh Kamble, dario-piotrowicz and ivanwonder

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.3.3"></a>
# 13.3.3 (2022-04-13)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [e50fd9ee87](https://github.com/angular/angular/commit/e50fd9ee8730aa0946bdc7b3b1975d3f8d893057) | fix | avoid errors with extremely long instruction chains ([#45574](https://github.com/angular/angular/pull/45574)) |
## Special Thanks
4javier, Andrew Kushnir, Cédric Exbrayat, Dylan Hunn, George Kalpakas, Hossein Mousavi, Jason Hendee, Joe Martin (Crowdstaffing), Kristiyan Kostadinov, Michael-Doner, Michal Materowski and Virginia Dooley

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.3.2"></a>
# 13.3.2 (2022-04-06)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [b46b25c562](https://github.com/angular/angular/commit/b46b25c562d6f9a76a462b23f5b8f44b5adab98b) | fix | handle structured AnimateTimings ([#31107](https://github.com/angular/angular/pull/31107)) |
## Special Thanks
Alan Agius, Andrew Kushnir, Christoph Guttandin, Cédric Exbrayat, mgechev and piyush132000

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.3.1"></a>
# 13.3.1 (2022-03-30)
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [960e42b2ac](https://github.com/angular/angular/commit/960e42b2ac1ad01b4930f107afbdc731d8daa9ec) | fix | ng module compilation workers are subject to linker race-conditions ([#45393](https://github.com/angular/angular/pull/45393)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [3714305f84](https://github.com/angular/angular/commit/3714305f84da8ec74ef7d8f5090344b47d0f5dbe) | fix | scope css rules within `@layer` blocks ([#45396](https://github.com/angular/angular/pull/45396)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [7f53c0f4ac](https://github.com/angular/angular/commit/7f53c0f4acfac4c50e3a8ba210e7879dd87d4720) | fix | handle inline type-check blocks in nullish coalescing extended check ([#45478](https://github.com/angular/angular/pull/45478)) |
## Special Thanks
AlirezaEbrahimkhani, Andrew Kushnir, Andrew Scott, Ben Brook, Dylan Hunn, George Kalpakas, JiaLiPassion, Joey Perrott, JoostK, Mike, Paul Gschwendtner, Willian Corrêa, arturovt, dario-piotrowicz, khai and mgechev

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.3.0"></a>
# 13.3.0-rc.0 (2022-03-16)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [b5bb614c74](https://github.com/angular/angular/commit/61a316c68fd27bc2375b1b3043afd8b5bb614c74) | feat | support TypeScript 4.6 ([#45190](https://github.com/angular/angular/pull/45190)) |
## Special Thanks
Alistair Kane, Andrew Scott and Kristiyan Kostadinov

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.2.7"></a>
# 13.2.7 (2022-03-16)
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [eac94f0945](https://github.com/angular/angular/commit/eac94f094500b8b2d73b2f1fd621adb6f2d990a0) | fix | improve error message for invalid value accessors ([#45192](https://github.com/angular/angular/pull/45192)) |
## Special Thanks
Alistair Kane, Amer Yousuf, Andrew Scott, Jessica Janiuk, Lee Cooper, alirezaghey and why520crazy

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.3.0-rc.0"></a>
# 13.3.0-rc.0 (2022-03-10)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [b5bb614c74](https://github.com/angular/angular/commit/61a316c68fd27bc2375b1b3043afd8b5bb614c74) | feat | support TypeScript 4.6 ([#45190](https://github.com/angular/angular/pull/45190)) |
## Special Thanks
Alistair Kane, Andrew Scott and Kristiyan Kostadinov

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.2.6"></a>
# 13.2.6 (2022-03-09)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [6efa366e2c](https://github.com/angular/angular/commit/6efa366e2c8a6f8d0ee9d20b8ebd2351254b6455) | fix | compute correct offsets when interpolations have HTML entities ([#44811](https://github.com/angular/angular/pull/44811)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [9bce9ce89e](https://github.com/angular/angular/commit/9bce9ce89ea9a12fa9d9b880c5a2d60436e46f99) | fix | Prioritize Angular-specific completions over DOM completions ([#45293](https://github.com/angular/angular/pull/45293)) |
### service-worker
| Commit | Type | Description |
| -- | -- | -- |
| [cff1c5622f](https://github.com/angular/angular/commit/cff1c5622f6630fd8050d5ce993265c884963a17) | fix | file system hash in batch of 500 elements ([#45262](https://github.com/angular/angular/pull/45262)) |
## Special Thanks
Andrew Scott, Anner Visser, Aristeidis Bampakos, JiaLiPassion, Joey Perrott, Kristiyan Kostadinov, Luca, Mladen Jakovljević, Paul Gschwendtner, Srikanth Kolli and nanda18

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.2.5"></a>
# 13.2.5 (2022-03-02)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [6c61d20476](https://github.com/angular/angular/commit/6c61d20476bf214176994dff4e46d6452bd821cf) | fix | allow animations with unsupported CSS properties ([#45185](https://github.com/angular/angular/pull/45185)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [64da1daa78](https://github.com/angular/angular/commit/64da1daa7827ca99c6d0b3992ac10b1ea0ec5b4a) | fix | canceled JSONP requests won't throw console error with missing callback function ([#36807](https://github.com/angular/angular/pull/36807)) |
| [56ca7d385b](https://github.com/angular/angular/commit/56ca7d385b263411cf231808fd54ec67ff643b58) | perf | make `NgLocalization` token tree-shakable ([#45118](https://github.com/angular/angular/pull/45118)) ([#45226](https://github.com/angular/angular/pull/45226)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [6c906a5bb9](https://github.com/angular/angular/commit/6c906a5bb9f7d7c86122bfc36275d6e6b81a0631) | fix | Support resolve animation name from the DTS ([#45169](https://github.com/angular/angular/pull/45169)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [e8fd452bd2](https://github.com/angular/angular/commit/e8fd452bd24985f23ab6316690bb9431bbbe8ed8) | fix | remove individual commands for updating gold files ([#45198](https://github.com/angular/angular/pull/45198)) |
| [82d772857c](https://github.com/angular/angular/commit/82d772857ce2d6f07af4c99380676b6bf2cf7912) | perf | make `Compiler`, `ApplicationRef` and `ApplicationInitStatus` tree-shakable ([#45102](https://github.com/angular/angular/pull/45102)) ([#45222](https://github.com/angular/angular/pull/45222)) |
| [71ff12c1cc](https://github.com/angular/angular/commit/71ff12c1cc009e50977b77f1cba1fe03c2f81946) | perf | make `LOCALE_ID` and other tokens from `ApplicationModule` tree-shakable ([#45102](https://github.com/angular/angular/pull/45102)) ([#45222](https://github.com/angular/angular/pull/45222)) |
### localize
| Commit | Type | Description |
| -- | -- | -- |
| [d388522745](https://github.com/angular/angular/commit/d388522745835b8e30b66597560254f0e821c040) | fix | avoid imports into `compiler-cli` package ([#45180](https://github.com/angular/angular/pull/45180)) |
## Special Thanks
Andrew Kushnir, Andrew Scott, Charles Lyding, Guillaume Bonnet, Jessica Janiuk, JoostK, Martin Sikora, Paul Gschwendtner, Theodore Brown, dario-piotrowicz and ivanwonder

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.2.4"></a>
# 13.2.4 (2022-02-23)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [1a4b489692](https://github.com/angular/angular/commit/1a4b489692aebd185a96af78996d13c47caf4478) | perf | improve algorithm to balance animation namespaces ([#45113](https://github.com/angular/angular/pull/45113)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [cbd23ee0de](https://github.com/angular/angular/commit/cbd23ee0def8e79b185d59d0713e5eeb97b20e1f) | perf | make `IterableDiffers` and `KeyValueDiffers` tree-shakable ([#45094](https://github.com/angular/angular/pull/45094)) ([#45115](https://github.com/angular/angular/pull/45115)) |
## Special Thanks
Alan Cohen, AlirezaEbrahimkhani, Andrew Kushnir, Daniele Maltese, David Wolf, JoostK, Paul Gschwendtner, dario-piotrowicz and manuelkroiss

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.2.3"></a>
# 13.2.3 (2022-02-16)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [0050b01b62](https://github.com/angular/angular/commit/0050b01b62adf8e0021c1878edb696c339c5e1bc) | perf | made errors in the animations package tree shakeable ([#45079](https://github.com/angular/angular/pull/45079)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [09f0254bdd](https://github.com/angular/angular/commit/09f0254bddbe10bb9e265c8aee7d3c911e479e0e) | perf | chain element start/end instructions ([#44994](https://github.com/angular/angular/pull/44994)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [92cf9fbebe](https://github.com/angular/angular/commit/92cf9fbebed75ddc0eb598e57556b4fbe8c24009) | fix | `ViewContainerRef.createComponent` should consult module injector when custom one is provided ([#44966](https://github.com/angular/angular/pull/44966)) |
## Special Thanks
AlirezaEbrahimkhani, Amer Yousuf, Andrew Kushnir, Aristeidis Bampakos, Dario Piotrowicz, Esteban Gehring, Jessica Janiuk, JiaLiPassion, Kristiyan Kostadinov, Mina Hosseini Moghadam, Patrick Cameron, Srdjan Milic, Yousaf Nawaz, dario-piotrowicz, markostanimirovic, mgechev and zuckjet

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.2.2"></a>
# 13.2.2 (2022-02-08)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [37af6abb49](https://github.com/angular/angular/commit/37af6abb495a351052389cb095bfbea0260f46c5) | fix | allow banana-in-a-box bindings to end with non-null assertion ([#37809](https://github.com/angular/angular/pull/37809)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [b75e90f809](https://github.com/angular/angular/commit/b75e90f8096394eeef85fa7e667889b7b59a35ed) | fix | incorrectly keeping track of ngModel with ngFor inside a form ([#40459](https://github.com/angular/angular/pull/40459)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [3fae6637e7](https://github.com/angular/angular/commit/3fae6637e7d379a9dd1862555ec7e586f80be4c9) | perf | remove IE special status handling ([#44354](https://github.com/angular/angular/pull/44354)) |
### upgrade
| Commit | Type | Description |
| -- | -- | -- |
| [b9aab0c87b](https://github.com/angular/angular/commit/b9aab0c87bcccb61167e92c1e910630afad67648) | fix | Do not trigger duplicate navigation events from Angular Router ([#43441](https://github.com/angular/angular/pull/43441)) |
## Special Thanks
Alan Agius, Alan Cohen, Andrew Kushnir, Andrew Scott, Daniel Díaz, Dario Piotrowicz, Doug Parker, Jayson Acosta, Joey Perrott, JoostK, Kristiyan Kostadinov, Olivier Capuozzo, Ramzan, Shai Reznik, TANMAY SRIVASTAVA, dario-piotrowicz, iRealNirmal, jhonyeduardo, mgechev and zuckjet

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.2.1"></a>
# 13.2.1 (2022-02-02)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [4644886aaf](https://github.com/angular/angular/commit/4644886aaf96c9da513cc7a2c2568254a11c8a4b) | perf | remove no longer needed CssKeyframes classes ([#44903](https://github.com/angular/angular/pull/44903)) ([#44919](https://github.com/angular/angular/pull/44919)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [b4e4617807](https://github.com/angular/angular/commit/b4e4617807a8ef97b6423e6debfe504f86aa506c) | fix | include query parameters for open HTTP requests in `verify` ([#44917](https://github.com/angular/angular/pull/44917)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [0778e6f7d7](https://github.com/angular/angular/commit/0778e6f7d79080124c240122acd9ff5ffffc74f5) | fix | accept nullish coalescing operator for any and unknown types ([#44862](https://github.com/angular/angular/pull/44862)) |
| [07185f4ed1](https://github.com/angular/angular/commit/07185f4ed1ac7071af62a65d8a5391ca28b03205) | fix | enable nullish coalescing check only with `strictNullChecks` ([#44862](https://github.com/angular/angular/pull/44862)) |
| [4a5ad1793f](https://github.com/angular/angular/commit/4a5ad1793f91ef5375146b4ead9929c8a939746e) | fix | ensure casing of logical paths is preserved ([#44798](https://github.com/angular/angular/pull/44798)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [7ec482d9c2](https://github.com/angular/angular/commit/7ec482d9c2292d6370f7a2da9addf2abb8bb21bb) | fix | Add back support for namespace URIs in createElement of dom renderer ([#44914](https://github.com/angular/angular/pull/44914)) |
| [250dc40a46](https://github.com/angular/angular/commit/250dc40a46797446bf3328a58b9b1a4d8057b1d6) | fix | flush delayed scoping queue while setting up TestBed ([#44814](https://github.com/angular/angular/pull/44814)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [1aebbf8714](https://github.com/angular/angular/commit/1aebbf8714b9cd3c3b5844065c5b64240c05b37d) | fix | ensure OnPush ancestors are marked dirty when the promise resolves ([#44886](https://github.com/angular/angular/pull/44886)) |
| [6b7fffcbeb](https://github.com/angular/angular/commit/6b7fffcbeb08ce77aef1d83de354ca7266600c6f) | fix | Update the typed forms migration schematic to find all files. ([#44881](https://github.com/angular/angular/pull/44881)) |
## Special Thanks
Alan, Andrew Kushnir, Andrew Scott, Aristeidis Bampakos, Arjen, Daniel Díaz, David Shevitz, Doug Parker, Dylan Hunn, Esteban Gehring, George Kalpakas, Jessica Janiuk, JoostK, Juri Strumpflohner, Lee Robinson, Maarten Tibau, Paul Gschwendtner, Theodore Brown, arturovt, dario-piotrowicz, fru2, markostanimirovic and mgechev

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.2.0"></a>
# 13.2.0 (2022-01-26)
## Deprecations
### 
- The `CachedResourceLoader` and `RESOURCE_CACHE_PROVIDER` symbols were previously necessary in some cases to test AOT-compiled components with View Engine, but they are no longer needed since Ivy.

- The `ComponentFactory` and `ComponentFactoryResolver` classes are deprecated. Since Ivy, there is no need to resolve Component factories. Please use other APIs where you Component classes can be used directly (without resolving their factories).

- Since Ivy, the `CompilerOptions.useJit` and `CompilerOptions.missingTranslation` config options are unused, passing them has no effect.
### 
| Commit | Type | Description |
| -- | -- | -- |
| [9c11183e74](https://github.com/angular/angular/commit/9c11183e74980b12c3c5712df174e90af6f19027) | docs | deprecate `CachedResourceLoader` and `RESOURCE_CACHE_PROVIDER` symbols ([#44749](https://github.com/angular/angular/pull/44749)) |
| [9f12e7fea4](https://github.com/angular/angular/commit/9f12e7fea434c6d33e1155994e2c228d51520744) | docs | deprecate `ComponentFactory` and `ComponentFactoryResolver` symbols ([#44749](https://github.com/angular/angular/pull/44749)) |
| [4e95a316ce](https://github.com/angular/angular/commit/4e95a316cef35a771cd8168e3a744eb6bd7f1615) | docs | deprecate unused config options from the `CompilerOptions` interface ([#44749](https://github.com/angular/angular/pull/44749)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [a4ab6d6b72](https://github.com/angular/angular/commit/a4ab6d6b72fe891f232d2446f8b7c454a82a5ba0) | feat | add support for safe calls in templates ([#44580](https://github.com/angular/angular/pull/44580)) |
| [abd1bc8039](https://github.com/angular/angular/commit/abd1bc8039ade4324f91fd616c82e52f05bdbb70) | fix | correct spans when parsing bindings with comments ([#44785](https://github.com/angular/angular/pull/44785)) |
| [ed67a074ce](https://github.com/angular/angular/commit/ed67a074ceed6440bf7f638512a20bbd3be8cbd4) | fix | properly compile DI factories when coverage reporting is enabled ([#44732](https://github.com/angular/angular/pull/44732)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [fa835b5a29](https://github.com/angular/angular/commit/fa835b5a297087087eac2750b662096ed5492cb6) | feat | enable extended diagnostics by default ([#44712](https://github.com/angular/angular/pull/44712)) |
| [73424def13](https://github.com/angular/angular/commit/73424def130ae1d72036142f6f2d7bce63858c9e) | feat | provide the animations for `DirectiveMeta` ([#44630](https://github.com/angular/angular/pull/44630)) |
| [fe3e4d6865](https://github.com/angular/angular/commit/fe3e4d6865c1e760be0511cfd757b4574a67fa5b) | fix | Handle `ng-template` with structural directive in indexer ([#44788](https://github.com/angular/angular/pull/44788)) |
| [7316e72ec5](https://github.com/angular/angular/commit/7316e72ec5ccc475e610bf26b5da451b8ffa50a2) | fix | properly index <svg> elements when on a template ([#44785](https://github.com/angular/angular/pull/44785)) |
| [100091ebf0](https://github.com/angular/angular/commit/100091ebf0ad480e94b5db4f183f9bfcfe8b8274) | fix | remove leftover `_extendedTemplateDiagnostics` requirements ([#44777](https://github.com/angular/angular/pull/44777)) |
| [d2ae96f742](https://github.com/angular/angular/commit/d2ae96f742c82daa6c4d4b8afd3b0959fb9b89d1) | fix | skip `ExtendedTemplateCheckerImpl` construction if there were configuration errors ([#44778](https://github.com/angular/angular/pull/44778)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [5626b34264](https://github.com/angular/angular/commit/5626b34264d8893fece74d30db4920a685f3b17f) | fix | consistently use namespace short name rather than URI ([#44766](https://github.com/angular/angular/pull/44766)) |
| [94bfcdd9de](https://github.com/angular/angular/commit/94bfcdd9de234f7189daaa06a6c179d9697bef8d) | fix | error if NgZone.isInAngularZone is called with a noop zone ([#44800](https://github.com/angular/angular/pull/44800)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [72092ebd26](https://github.com/angular/angular/commit/72092ebd26d6670a7dd02f6db5515d2afd27c4d6) | feat | Allow a FormControl to use initial value as default. ([#44434](https://github.com/angular/angular/pull/44434)) |
| [f7aa937cac](https://github.com/angular/angular/commit/f7aa937cac0ad315e1012770aa1da97476aced54) | fix | Make some minor fixups for forward-compatibility with typed forms. ([#44540](https://github.com/angular/angular/pull/44540)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [5a4ddfd4f5](https://github.com/angular/angular/commit/5a4ddfd4f5e17bb4209528cefc3f0674298ab6e8) | feat | Allow symbol keys for `Route` `data` and `resolve` properties ([#44519](https://github.com/angular/angular/pull/44519)) |
## Special Thanks
Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Dario Piotrowicz, Derek Cormier, Doug Parker, Douglas Parker, Dylan Hunn, George Kalpakas, Jessica Janiuk, JoostK, Kristiyan Kostadinov, Martin Probst, Oleg Postoev, Stephanie Tuerk, Tim Bowersox, Wiley Marques, Yousaf Nawaz, dario-piotrowicz, iRealNirmal, ivanwonder and shejialuo

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.1.3"></a>
# 13.1.3 (2022-01-19)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [af0a152a2c](https://github.com/angular/angular/commit/af0a152a2cd5fc5c9d8d8581bde811be102b210a) | fix | apply setStyles to only rootTimelines ([#44515](https://github.com/angular/angular/pull/44515)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [626f3f230b](https://github.com/angular/angular/commit/626f3f230ba7e272ee324ed3a1c5650e156d1d6f) | perf | reduce analysis work during incremental rebuilds ([#44731](https://github.com/angular/angular/pull/44731)) |
### ngcc
| Commit | Type | Description |
| -- | -- | -- |
| [f9ca4d8499](https://github.com/angular/angular/commit/f9ca4d849950b2d1e8a7629deab520a0e6db2dac) | fix | support element accesses for export declarations ([#44669](https://github.com/angular/angular/pull/44669)) |
## Special Thanks
Alan Agius, Andrew Kushnir, AnkitSharma-007, Daniel Díaz, Dmytro Mezhenskyi, Jessica Janiuk, Joey Perrott, JoostK, Ramesh Thiruchelvam, dario-piotrowicz, iRealNirmal and Łukasz Holeczek

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.1.2"></a>
# 13.1.2 (2022-01-12)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [abc217b28e](https://github.com/angular/angular/commit/abc217b28e43431e730c448235ab2e9801133768) | fix | retain triggers values for moved tracked list items ([#44578](https://github.com/angular/angular/pull/44578)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [59eef29a6c](https://github.com/angular/angular/commit/59eef29a6c5d568ca80595cd7018e21ad406c85d) | fix | correct spans when parsing bindings with comments ([#44678](https://github.com/angular/angular/pull/44678)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [08049fa23f](https://github.com/angular/angular/commit/08049fa23f1fb751137a54b7460e90662abec476) | fix | enable narrowing of using type guard methods ([#44447](https://github.com/angular/angular/pull/44447)) |
| [a26afce68c](https://github.com/angular/angular/commit/a26afce68c8270b66afa93567f952930523ebc7b) | fix | fix crash during type-checking of library builds ([#44587](https://github.com/angular/angular/pull/44587)) |
| [1e918b6f31](https://github.com/angular/angular/commit/1e918b6f312e7c99f0eef02d5d093164d2e1e7ed) | fix | handle property reads of `ThisReceiver` in the indexer ([#44678](https://github.com/angular/angular/pull/44678)) |
| [63c8e56a3a](https://github.com/angular/angular/commit/63c8e56a3a2566eca1b00751e0f05d188db95e34) | fix | incorrectly interpreting $any calls with a property read ([#44657](https://github.com/angular/angular/pull/44657)) |
| [60fb27f12d](https://github.com/angular/angular/commit/60fb27f12ddf3e3cea1faa685c34ad98535340d0) | fix | properly index <svg> elements ([#44678](https://github.com/angular/angular/pull/44678)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [f5addee488](https://github.com/angular/angular/commit/f5addee4889d992e96ab31a2e4439f5085e6f5eb) | fix | revert the test files for Ivy ([#44528](https://github.com/angular/angular/pull/44528)) |
## Special Thanks
Abdurrahman Abu-Hijleh, Adam Plumer, Alex Rickabaugh, AlirezaEbrahimkhani, Andrew Kushnir, Andrew Scott, Borja Paz Rodríguez, Chihab Otmani, Chris Mancini, Dario Piotrowicz, Doug Parker, George Kalpakas, Joey Perrott, JoostK, Kristiyan Kostadinov, Kyoz, Patrick Prakash, Paul Gschwendtner, Serhey Dolgushev, Yousaf Nawaz, Yuchao Wu, alkavats1, dario-piotrowicz, huangqing, ivanwonder, shejialuo, twerske, wszgrcy and zuckjet

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.1.1"></a>
# 13.1.1 (2021-12-15)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [bb1d4ff315](https://github.com/angular/angular/commit/bb1d4ff31592836b5268f1b42fc05823aff212aa) | fix | don't consume instructions for animateChild ([#44357](https://github.com/angular/angular/pull/44357)) |
| [d8b6adb7bc](https://github.com/angular/angular/commit/d8b6adb7bcf1ed6edc01c61406d30c86b2385284) | fix | should not invoke disabled child animations ([#37724](https://github.com/angular/angular/pull/37724)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [bce108ab49](https://github.com/angular/angular/commit/bce108ab49f9a136faf5f80ffb95c76d7712437a) | fix | `_reduceValue` arrow function now has correct types. ([#44483](https://github.com/angular/angular/pull/44483)) |
| [998c1e63fe](https://github.com/angular/angular/commit/998c1e63fee1029badaf43f39a4353043dc5edf8) | fix | I indroduced a minor error in a previous PR: pendingValue is a value not a boolean flag. ([#44450](https://github.com/angular/angular/pull/44450)) |
## Special Thanks
Aristeidis Bampakos, Dylan Hunn, George Kalpakas, JoostK, Kristiyan Kostadinov, Paul Gschwendtner, Spej, Yousaf Nawaz, dario-piotrowicz, faso-dev, jaybell and zuckjet

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.1.0"></a>
# 13.1.0 (2021-12-09)
## Deprecations
### 
- The `downgradeModule` function calls with NgModule factories are deprecated. Please use NgModule class based `downgradeModule` calls instead.
### common
- `TestRequest` from `@angular/common/http/testing` no longer
accepts `ErrorEvent` when simulating XHR errors. Instead, instances of
`ProgressEvent` should be passed, matching with the native browser behavior.
### 
| Commit | Type | Description |
| -- | -- | -- |
| [dbc46d68b9](https://github.com/angular/angular/commit/dbc46d68b99f5516209991ee3421292fc8261bec) | docs | deprecate factory-based signature of the `downgradeModule` function ([#44090](https://github.com/angular/angular/pull/44090)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [489cf42cd0](https://github.com/angular/angular/commit/489cf42cd07ac2b549ea958127590b30f1b3d28f) | fix | incorrect error type for XHR errors in `TestRequest` ([#36082](https://github.com/angular/angular/pull/36082)) |
| [13362972bb](https://github.com/angular/angular/commit/13362972bb5dae606889c06ff7718502057b6b9c) | perf | code size reduction of `ngFor` directive ([#44315](https://github.com/angular/angular/pull/44315)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [c85bcb0c63](https://github.com/angular/angular/commit/c85bcb0c636d65706541d44be62694720f12ad9e) | feat | reference ICU message IDs from their placeholders ([#43534](https://github.com/angular/angular/pull/43534)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [5dff077d50](https://github.com/angular/angular/commit/5dff077d505da60ddead9f2ff2ddaaaea6feeb4a) | feat | add migration to remove entryComponents ([#44308](https://github.com/angular/angular/pull/44308)) |
| [e65a245a0b](https://github.com/angular/angular/commit/e65a245a0b67c67f08a29f8c3ac2e3e7e824a029) | feat | add migration to remove entryComponents ([#44322](https://github.com/angular/angular/pull/44322)) |
| [d56e3f43a1](https://github.com/angular/angular/commit/d56e3f43a1f3ca5004d2c5413167737cff7d936f) | feat | support TypeScript 4.5 ([#44164](https://github.com/angular/angular/pull/44164)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [d452b388bd](https://github.com/angular/angular/commit/d452b388bdc0d661f41ab382f5e7ac998b0f9915) | feat | add `has()` method to `HttpContext` class ([#43887](https://github.com/angular/angular/pull/43887)) |
### localize
| Commit | Type | Description |
| -- | -- | -- |
| [d3cf222a81](https://github.com/angular/angular/commit/d3cf222a8193bc7ccd9e7ce886846d1f79131627) | feat | support "associated message ids" for placeholders ([#43534](https://github.com/angular/angular/pull/43534)) |
### ngcc
| Commit | Type | Description |
| -- | -- | -- |
| [41265919aa](https://github.com/angular/angular/commit/41265919aa90415911169057ef016e2f9b78aafd) | fix | correctly resolve UMD dependencies ([#44381](https://github.com/angular/angular/pull/44381)) |
### upgrade
| Commit | Type | Description |
| -- | -- | -- |
| [34f990986c](https://github.com/angular/angular/commit/34f990986cade3ce6b355354d1e2f6e5ec2f18ec) | feat | support NgModule class as an argument of the `downgradeModule` function ([#43973](https://github.com/angular/angular/pull/43973)) |
## Special Thanks
Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Doug Parker, Dustin M. Eastway, Dylan Hunn, George Kalpakas, HyperLife1119, Jelle Bruisten, Jessica Janiuk, Joey Perrott, JoostK, Kristiyan Kostadinov, Markus Doggweiler, Paul Gschwendtner, Pei Wang, Pete Bacon Darwin and dario-piotrowicz

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.0.3"></a>
# 13.0.3 (2021-12-01)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [6cdbfdbe6e](https://github.com/angular/angular/commit/6cdbfdbe6e54b0b5757907c6d0cda65b37995570) | fix | downlevel transform incorrectly extracting constructor parameters for nested classes ([#44281](https://github.com/angular/angular/pull/44281)) |
| [305b76b45f](https://github.com/angular/angular/commit/305b76b45f20ac84f2c6e30a76eb66b17b31a122) | fix | interpret string concat calls ([#44167](https://github.com/angular/angular/pull/44167)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [0ca5c5bd09](https://github.com/angular/angular/commit/0ca5c5bd09cc5d40f1b0a259561b05d30f2d2e3e) | fix | add missing info about a component in the "pipe could not be found" error message ([#44081](https://github.com/angular/angular/pull/44081)) |
| [907da3977a](https://github.com/angular/angular/commit/907da3977a38ab62ca7be9d388ff123e463d3581) | fix | destroy hooks not set up for `useClass` provider using `forwardRef` ([#44281](https://github.com/angular/angular/pull/44281)) |
| [bcd3b4959b](https://github.com/angular/angular/commit/bcd3b4959bd40255079167088ff2e2f37dc905af) | fix | support cyclic metadata in TestBed overrides ([#44215](https://github.com/angular/angular/pull/44215)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [96fedd249e](https://github.com/angular/angular/commit/96fedd249e5b5669937b693fea406342adbac50d) | fix | make the `FormControlStatus` available as a public API ([#44183](https://github.com/angular/angular/pull/44183)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [cabc1786de](https://github.com/angular/angular/commit/cabc1786de7635018a46ffd82734f4d6719c356e) | fix | Correctly parse inputs and selectors with dollar signs ([#44268](https://github.com/angular/angular/pull/44268)) |
### ngcc
| Commit | Type | Description |
| -- | -- | -- |
| [b68994d20a](https://github.com/angular/angular/commit/b68994d20acd7d27416d87b0cb55fa19ce064259) | fix | correctly report error when collecting dependencies of UMD module ([#44245](https://github.com/angular/angular/pull/44245)) |
| [6f5c0c1515](https://github.com/angular/angular/commit/6f5c0c15157d594073405c45714f1a7a25404f2f) | fix | ensure that ngcc does not write a lock-file into node_modules package directories ([#44228](https://github.com/angular/angular/pull/44228)) |
| [bf5f734e9c](https://github.com/angular/angular/commit/bf5f734e9c38bfcc43688410e70d741ff19b9acb) | fix | support the UMD wrapper function format emitted by Webpack ([#44245](https://github.com/angular/angular/pull/44245)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [d265d0d241](https://github.com/angular/angular/commit/d265d0d2415ac45f0eaae0c375ab3ca2a4055975) | fix | prevent componentless routes from being detached ([#44240](https://github.com/angular/angular/pull/44240)) |
## Special Thanks
Alan Agius, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Artur, Christian-E, David Shevitz, Doug Parker, Douglas Parker, Dylan Hunn, George Kalpakas, Jessica Janiuk, Joey Perrott, JoostK, Kristiyan Kostadinov, Marc Redemske, Paul Gschwendtner, Pei Wang, Pete Bacon Darwin, Ramesh Thiruchelvam, Ravi Chandra, Rohan Pednekar, Ruslan Usmanov, dario-piotrowicz, profanis and unknown

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.0.2"></a>
# 13.0.2 (2021-11-17)

This release contains various API docs improvements.

## Special Thanks
Andrew Kushnir, Armen Vardanyan, Dylan Hunn, Joey Perrott, Martin von Gagern, Paul Gschwendtner, Pete Bacon Darwin, Ramesh Thiruchelvam, dario-piotrowicz and fusho-takahashi

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.0.1"></a>
# 13.0.1 (2021-11-10)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [ee2031d9f4](https://github.com/angular/angular/commit/ee2031d9f498e9b6db90f34538376c2955378914) | fix | ensure that partially compiled queries can handle forward references ([#44113](https://github.com/angular/angular/pull/44113)) |
| [e5a960b159](https://github.com/angular/angular/commit/e5a960b15964e0ae9140437846f3ffb7e95d3dc4) | fix | generate correct code for safe method calls ([#44088](https://github.com/angular/angular/pull/44088)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [dede29e4f3](https://github.com/angular/angular/commit/dede29e4f31a7f3931eb3894260747d7b772e6c2) | fix | ensure literal types are retained when `strictNullInputTypes` is disabled ([#38305](https://github.com/angular/angular/pull/38305)) |
| [04df3a0b92](https://github.com/angular/angular/commit/04df3a0b92a839686df974ed5d7df7febbbc1b27) | fix | handle pre-release versions when checking version ([#44109](https://github.com/angular/angular/pull/44109)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [4c700b6244](https://github.com/angular/angular/commit/4c700b6244a6df9c185bcc0913f68e3b3654812a) | fix | do not use Function constructors in development mode to avoid CSP violations ([#43587](https://github.com/angular/angular/pull/43587)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [30a27adf9a](https://github.com/angular/angular/commit/30a27adf9af634fc4ce10d643362a727bf908825) | fix | use correct parent in animation removeChild callback ([#44033](https://github.com/angular/angular/pull/44033)) |
## Special Thanks
A. Singh, Alan Agius, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Aristeidis Bampakos, George Kalpakas, Joe Martin (Crowdstaffing), Joel Lefkowitz, Joey Perrott, JoostK, Kristiyan Kostadinov, Michael Urban, Paul Gschwendtner, Pavan Kumar Jadda, Pei Wang, Pete Bacon Darwin, Roman Frołow, dario-piotrowicz, iRealNirmal, ileil, kreuzerk, mgechev, profanis and raman

<!-- CHANGELOG SPLIT MARKER -->

<a name="13.1.0-next.0"></a>
# 13.1.0-next.0 (2021-11-03)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [c85bcb0c63](https://github.com/angular/angular/commit/c85bcb0c636d65706541d44be62694720f12ad9e) | feat | reference ICU message IDs from their placeholders ([#43534](https://github.com/angular/angular/pull/43534)) |
### localize
| Commit | Type | Description |
| -- | -- | -- |
| [d3cf222a81](https://github.com/angular/angular/commit/d3cf222a8193bc7ccd9e7ce886846d1f79131627) | feat | support "associated message ids" for placeholders ([#43534](https://github.com/angular/angular/pull/43534)) |
## Special Thanks
Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Doug Parker, Dylan Hunn, George Kalpakas, Jessica Janiuk, Joey Perrott, Paul Gschwendtner and Pete Bacon Darwin


<a name="13.0.0"></a>
# 13.0.0 (2021-11-03)

[Blog post "Angular v13 is now available"](http://goo.gle/angular-v13).

## Breaking Changes
### common
- The behavior of the `SpyLocation` used by the `RouterTestingModule` has changed
to match the behavior of browsers. It no longer emits a 'popstate' event
when `Location.go` is called. In addition, `simulateHashChange` now
triggers _both_ a `hashchange` and a `popstate` event.
Tests which use `location.go` and expect the changes to be picked up by
the `Router` should likely change to `simulateHashChange` instead.
Each test is different in what it attempts to assert so there is no
single change that works for all tests. Each test using the `SpyLocation` to
simulate browser URL changes should be evaluated on a case-by-case basis.
### core
- TypeScript versions older than 4.4.2 are no longer supported.

- NodeJS versions older than `v12.20.0` are no longer
supported due to the Angular packages using the NodeJS package exports
feature with subpath patterns.

- The `WrappedValue` class can no longer be imported from `@angular/core`,
which may result in compile errors or failures at runtime if outdated
libraries are used that are still using `WrappedValue`. The usage of
`WrappedValue` should be removed as no replacement is available.
### forms
- A new type called `FormControlStatus` has been introduced, which is a union of all possible status strings for form controls. `AbstractControl.status` has been narrowed from `string` to `FormControlStatus`, and `statusChanges` has been narrowed from `Observable<any>` to `Observable<FormControlStatus>`. Most applications should consume the new types seamlessly. Any breakage caused by this change is likely due to one of the following two problems: (1) the app is comparing `AbstractControl.status` against a string which is not a valid status; or, (2) the app is using `statusChanges` events as if they were something other than strings.
### router
- The default url serializer would previously drop
everything after and including a question mark in query parameters. That
is, for a navigation to `/path?q=hello?&other=123`, the query
params would be parsed to just `{q: 'hello'}`. This is
incorrect because the URI spec allows for question mark characers in
query data. This change will now correctly parse the params for the
above example to be `{v: 'hello?', other: '123'}`.

- Previously `null` and `undefined` inputs for `routerLink` were
equivalent to empty string and there was no way to disable the link's
navigation.
In addition, the `href` is changed from a property `HostBinding()` to an
attribute binding (`HostBinding('attr.href')`). The effect of this
change is that `DebugElement.properties['href']` will now return the
`href` value returned by the native element which will be the full URL
rather than the internal value of the `RouterLink` `href` property.

- When storing and retrieving a `DetachedRouteHandle`, the Router traverses 
the `Route` children in order to correctly allow storing a parent route when 
there are several possible child `Route` configs that can be stored. This allows
a `RouteReuseStrategy` to store a parent `Route` _and_ a child, while preserving
the ability to change the child route while restoring the parent. Some 
implementations of `RouteReuseStrategy` will need to be updated to correctly 
store and retrieve the `DetachedRouteHandle` of descendants as well as the stored
parent `ActivatedRouteSnapshot`. Previously, the `Router` would only store
the parent, making it impossible to change descendant paths when a stored parent 
was retrieved. See #20114.

- The router will no longer replace the browser URL when a new navigation
cancels an ongoing navigation. This often causes URL flicker and was
only in place to support some AngularJS hybrid applications. Hybrid
applications which rely on the `navigationId` being present on initial
navigations that were handled by the Angular router should instead
subscribe to `NavigationCancel` events and perform the
`location.replaceState` themselves to add `navigationId` to the Router
state.
In addition, tests which assert `urlChanges` on the `SpyLocation` may
need to be adjusted to account for the `replaceState` which is no longer
triggered.

- It is no longer possible to use `Route.loadChildren` using a string
value. The following supporting classes were removed from
`@angular/core`:

- `NgModuleFactoryLoader`
- `SystemJsNgModuleFactoryLoader`

The `@angular/router` package no longer exports these symbols:

- `SpyNgModuleFactoryLoader`
- `DeprecatedLoadChildren`

The signature of the `setupTestingRouter` function from
`@angular/core/testing` has been changed to drop its `NgModuleFactoryLoader`
parameter, as an argument for that parameter can no longer be created.
### service-worker
- The return type of `SwUpdate#activateUpdate` and `SwUpdate#checkForUpdate` changed to `Promise<boolean>`.

Although unlikely, it is possible that this change will cause TypeScript type-checking to fail in
some cases. If necessary, update your types to account for the new
return type.
## Deprecations
### core
- Angular no longer requires component factories to dynamically create components. The factory-based signature of the `ViewContainerRef.createComponent` function is deprecated in favor of a different signature that allows passing component classes instead.

- The `getModuleFactory` function is deprecated in favor of the `getNgModuleById` one. With Ivy, it's possible to work with NgModule classes directly, without retrieving corresponding factories, so the `getNgModuleById` should be used instead.

- Ivy made it possible to avoid the need to resolve Component and NgModule factories. Framework APIs allow to use Component and NgModule Types directly. As a result, the `PlatformRef.bootstrapModuleFactory` and a factory-based signature of the `ApplicationRef.bootstrap` method are now obsolete and are now deprecated. The `PlatformRef.bootstrapModuleFactory` calls can be replaced with `PlatformRef.bootstrapModule` ones. The `ApplicationRef.bootstrap` method allows to provide Component Type, so this can be used a replacement for the factory-based calls.

- In ViewEngine, [JIT compilation](https://angular.io/guide/glossary#jit) required special providers (like `Compiler`, `CompilerFactory`, etc) to be injected in the app and corresponding methods to be invoked. With Ivy, JIT compilation takes place implicitly if the Component, NgModule, etc. have not already been [AOT compiled](https://angular.io/guide/glossary#aot). Those special providers were made available in Ivy for backwards-compatibility with ViewEngine to make the transition to Ivy smoother. Since ViewEngine is deprecated and will soon be removed, those symbols are now deprecated as well:

- `ModuleWithComponentFactories`
- `Compiler`
- `CompilerFactory`
- `JitCompilerFactory`
- `NgModuleFactory`

Important note: this deprecation doesn't affect JIT mode in Ivy (JIT remains available with Ivy).

- In Ivy, AOT summary files are unused in TestBed. Passing AOT summary files in TestBed has no effect, so the `aotSummaries` usage in TestBed is deprecated and will be removed in a future version of Angular.
### platform-server
- The `renderModuleFactory` symbol in `@angular/platform-server` is no longer necessary as of Angular v13.

The `renderModuleFactory` calls can be replaced with `renderModule`.
### service-worker
- The `SwUpdate#activated` observable is deprecated.

The `SwUpdate#activated` observable only emits values as a direct response to calling
`SwUpdate#activateUpdate()` and was only useful for determining whether the call resulted in an
update or not. Now, the return value of `SwUpdate#activateUpdate()` can be used to determine the
outcome of the operation and therefore using `SwUpdate#activated` does not offer any benefit.

- The `SwUpdate#availalbe` observable is deprecated.

The new `SwUpdate#versionUpdates` observable provides the same information and more. Therefore, it
is possible to rebuild the same behavior as `SwUpdate#availalbe` using the events emitted by
`SwUpdate#versionUpdates` and filtering for `VersionReadyEvent` events.
As a result, the `SwUpdate#availalbe` observable is now redundant.
###
| Commit | Type | Description |
| -- | -- | -- |
| [747553dd68](https://github.com/angular/angular/commit/747553dd68209fe25a9704fe7094b4b3fb38bf06) | docs | deprecate ViewEngine-based `renderModuleFactory` ([#43757](https://github.com/angular/angular/pull/43757)) |
### bazel
| Commit | Type | Description |
| -- | -- | -- |
| [62d7005a52](https://github.com/angular/angular/commit/62d7005a52304f41a48f878f176f40e90437a555) | feat | add `strict_templates` and `experimental_extended_template_diagnostics` to `ng_module()` rule ([#43582](https://github.com/angular/angular/pull/43582)) |
| [d977701a43](https://github.com/angular/angular/commit/d977701a43866e9f9fae9f83f224e4b6980a8bd4) | feat | allow for custom conditions to be set in `ng_package` targets ([#43764](https://github.com/angular/angular/pull/43764)) |
| [4886585875](https://github.com/angular/angular/commit/48865858750bc1607f20db9b6bf9f913870742bc) | feat | create transition for enabling partial compilation ([#43431](https://github.com/angular/angular/pull/43431)) |
| [cd1b52483e](https://github.com/angular/angular/commit/cd1b52483e886f6e2ad6cde23ff8a2225cafa219) | feat | expose `esm2020` and `es2020` conditions in APF package exports ([#43740](https://github.com/angular/angular/pull/43740)) |
| [49b82ae561](https://github.com/angular/angular/commit/49b82ae56112c1e0d58ac28bcab1705e1f678ab1) | feat | implement partial compilation APF v13 for `ng_package` rule ([#43431](https://github.com/angular/angular/pull/43431)) |
| [274cb38e0b](https://github.com/angular/angular/commit/274cb38e0bb9a8bff4a48d1d15f4e16e59ec6f88) | feat | switch prodmode output to ES2020 ([#43431](https://github.com/angular/angular/pull/43431)) |
| [73ac50c447](https://github.com/angular/angular/commit/73ac50c44759c5d3048f11d6f98b98a5e625df58) | feat | wire up partial compilation build setting in `ng_module` ([#43431](https://github.com/angular/angular/pull/43431)) |
| [e0a72857cc](https://github.com/angular/angular/commit/e0a72857ccda2b21a91875ee714fef608b54c083) | fix | construct a manifest file even when warnings are emitted ([#43582](https://github.com/angular/angular/pull/43582)) |
| [dbe656d1e0](https://github.com/angular/angular/commit/dbe656d1e0569304c7001296ec90cf2e9cc8c91f) | fix | ngc-wrapped should not rely on linker for external workspaces ([#43690](https://github.com/angular/angular/pull/43690)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [adf4481211](https://github.com/angular/angular/commit/adf4481211ac0a2eabf560f42ef5193ca550ec98) | feat | add injection token for default date pipe timezone ([#43611](https://github.com/angular/angular/pull/43611)) |
| [c6a93001eb](https://github.com/angular/angular/commit/c6a93001eb74374b0fbc6aea1286fe1183d21382) | fix | synchronise location mock behavior with the navigators ([#41730](https://github.com/angular/angular/pull/41730)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [14b492df26](https://github.com/angular/angular/commit/14b492df26fcb3f2218f67878a382e8f7dff2c05) | fix | do not error if $any is used inside a listener ([#43866](https://github.com/angular/angular/pull/43866)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [bed121c34f](https://github.com/angular/angular/commit/bed121c34f9c4ec4741a4690693423bb7ed66982) | feat | inline resources when generating class metadata calls ([#43178](https://github.com/angular/angular/pull/43178)) |
| [263feba5c2](https://github.com/angular/angular/commit/263feba5c2d56e8433068718d1fdcbc3b2ae144c) | fix | handle nullable expressions correctly in the nullish coalescing extended template diagnostic ([#43572](https://github.com/angular/angular/pull/43572)) |
| [8f7fdc59af](https://github.com/angular/angular/commit/8f7fdc59af7f1b0a51b07e69044368c223b9f186) | fix | not evaluating new signature for __spreadArray ([#43618](https://github.com/angular/angular/pull/43618)) |
| [426a3ecae7](https://github.com/angular/angular/commit/426a3ecae7288c2cb3e8928d7fe56b0b4552d821) | fix | updates `ngc` to pass the build when only warnings are emitted ([#43673](https://github.com/angular/angular/pull/43673)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [a3960846da](https://github.com/angular/angular/commit/a3960846da1f73282306560302daa3a4ddeca0f7) | feat | add `createNgModuleRef` function to create `NgModuleRef` based on NgModule class ([#43580](https://github.com/angular/angular/pull/43580)) |
| [fe1f6421d2](https://github.com/angular/angular/commit/fe1f6421d2b647adb706e65f69ec2e40e604fac3) | feat | add `getNgModuleById` function to retrieve loaded NgModules by id ([#43580](https://github.com/angular/angular/pull/43580)) |
| [81c7eb813c](https://github.com/angular/angular/commit/81c7eb813c27f08d2d640f34e165a1b5e487bac2) | feat | add migration to opt out existing apps from new test module teardown behavior ([#43353](https://github.com/angular/angular/pull/43353)) |
| [e57691c9c5](https://github.com/angular/angular/commit/e57691c9c5f8456f7dc75180aa1e80330da560fe) | feat | Add migration to update empty routerLinks in templates ([#43176](https://github.com/angular/angular/pull/43176)) |
| [7dccbdd27b](https://github.com/angular/angular/commit/7dccbdd27be13eb7287f535f482b1de2c13fca74) | feat | add support for Types in ViewContainerRef.createComponent ([#43022](https://github.com/angular/angular/pull/43022)) |
| [c14085e434](https://github.com/angular/angular/commit/c14085e43493f0a1eaea1df949cbf6f3b13b72a0) | feat | drop support for TypeScript 4.2 and 4.3 ([#43642](https://github.com/angular/angular/pull/43642)) |
| [94ba59bc9d](https://github.com/angular/angular/commit/94ba59bc9db81ae04f20e8147b5133a0d3d45510) | feat | enable test module teardown by default ([#43353](https://github.com/angular/angular/pull/43353)) |
| [ea61ec2562](https://github.com/angular/angular/commit/ea61ec25628206d18a424906f685c0d0fd6aa714) | feat | support TypeScript 4.4 ([#43281](https://github.com/angular/angular/pull/43281)) |
| [e0a0d05d45](https://github.com/angular/angular/commit/e0a0d05d45bcb93448a8c2fd03f9e1783146cf00) | feat | update node version support range to support v16 ([#43740](https://github.com/angular/angular/pull/43740)) |
| [7396021e4b](https://github.com/angular/angular/commit/7396021e4b22faca47b7fc0bab188c838090f3e7) | fix | avoid duplicating comments in TestBed teardown migration ([#43776](https://github.com/angular/angular/pull/43776)) |
| [7fd0428aae](https://github.com/angular/angular/commit/7fd0428aae3a7d94bfc8fee764ac24f5fe3fbb41) | fix | don't rethrow errors if test teardown has been disabled ([#43635](https://github.com/angular/angular/pull/43635)) |
| [66fb311d20](https://github.com/angular/angular/commit/66fb311d205e51647e2c1f84a6e3adf5ef3cfd64) | fix | incorrect signature for initTestEnvironment ([#43615](https://github.com/angular/angular/pull/43615)) |
| [8ae99821d6](https://github.com/angular/angular/commit/8ae99821d657ba940df998f6abec425f8a1f4cb1) | fix | support `InjectFlags` argument in `NodeInjector.get()` ([#41592](https://github.com/angular/angular/pull/41592)) |
| [8878183521](https://github.com/angular/angular/commit/88781835212354d7058a3674a04c2a1dd4b8f9c3) | perf | remove support for the deprecated `WrappedValue` ([#43507](https://github.com/angular/angular/pull/43507)) |
### elements
| Commit | Type | Description |
| -- | -- | -- |
| [a468213f34](https://github.com/angular/angular/commit/a468213f34943b7ddf234e6f9fd406431173d6a0) | fix | remove `ng-add` schematic ([#43975](https://github.com/angular/angular/pull/43975)) |
| [f544a53f5f](https://github.com/angular/angular/commit/f544a53f5f3667b4c557537543a9b74a122d5f24) | fix | remove incorrect `@angular/platform-browser` peer dependency ([#43975](https://github.com/angular/angular/pull/43975)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [d9d8f950e9](https://github.com/angular/angular/commit/d9d8f950e90567c79b43eb156b81810a9f3d5c93) | feat | allow disabling min/max validators dynamically (by setting the value to `null`) ([#42978](https://github.com/angular/angular/pull/42978)) |
| [e49fc96ed3](https://github.com/angular/angular/commit/e49fc96ed33c26434a14b80487dd912d8c76cace) | feat | Make Form Statuses use stricter types. ([#42952](https://github.com/angular/angular/pull/42952)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [b10d90bef6](https://github.com/angular/angular/commit/b10d90bef6a3d1b721d087268aa7377985dd4c4f) | feat | Add method for retrieving the component template at the cursor location ([#43208](https://github.com/angular/angular/pull/43208)) |
| [d5f9890c92](https://github.com/angular/angular/commit/d5f9890c9205b4a121275ace84b26776aedd0478) | feat | auto-apply optional chaining on nullable symbol ([#42995](https://github.com/angular/angular/pull/42995)) |
| [69957f72e2](https://github.com/angular/angular/commit/69957f72e240e516fe65146c314014fadc43dd1f) | feat | provide snippets for attribute ([#43590](https://github.com/angular/angular/pull/43590)) |
| [fc3b50e427](https://github.com/angular/angular/commit/fc3b50e4275c84a1cd3f75e4b52ee2dc4b65c35c) | fix | exclude the `SafePropertyRead` when applying the optional chaining ([#43321](https://github.com/angular/angular/pull/43321)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [95a68c5dc3](https://github.com/angular/angular/commit/95a68c5dc3b72c0fe275e5025445befec3d9dc1e) | fix | account for CRLF characters in template migrations ([#44013](https://github.com/angular/angular/pull/44013)) |
| [77bd2538cb](https://github.com/angular/angular/commit/77bd2538cb8fe114a326209791d7ec043d65ea9e) | fix | apply individual expression edits to preserve newline characters ([#43519](https://github.com/angular/angular/pull/43519)) |
| [d849350c7b](https://github.com/angular/angular/commit/d849350c7bf19117bbf85e2d854b5be4d5eb4b25) | fix | Ensure routerLink migration doesn't update unrelated files ([#43519](https://github.com/angular/angular/pull/43519)) |
| [2efc18e675](https://github.com/angular/angular/commit/2efc18e6757157589004e23d8d22b7967de4387d) | fix | migration failed finding tsconfig file ([#43343](https://github.com/angular/angular/pull/43343)) |
| [b6f2a55147](https://github.com/angular/angular/commit/b6f2a551475126893c4ceff1241314067e14d0b6) | fix | prevent migrations from updating external templates multiple times ([#44013](https://github.com/angular/angular/pull/44013)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [4f3beffdbf](https://github.com/angular/angular/commit/4f3beffdbfa974b380b2225f163d363dd17e10bd) | feat | emit activate/deactivate events when an outlet gets attached/detached ([#43333](https://github.com/angular/angular/pull/43333)) |
| [faf9f5a3bc](https://github.com/angular/angular/commit/faf9f5a3bc444bb6cbf75916c8022f60e0742bca) | feat | new output that would notify when link is activated ([#43280](https://github.com/angular/angular/pull/43280)) |
| [3c6b653089](https://github.com/angular/angular/commit/3c6b653089837459809a370ebcaf8911c3bab9ed) | feat | Option to correctly restore history on failed navigation ([#43289](https://github.com/angular/angular/pull/43289)) |
| [784671597e](https://github.com/angular/angular/commit/784671597e0b28d9696bdc325b426a6c7be0cd8e) | fix | Allow question marks in query param values ([#31187](https://github.com/angular/angular/pull/31187)) |
| [796da641f0](https://github.com/angular/angular/commit/796da641f0a29e9f5f5de115c456da37426e971c) | fix | Do not modify parts of URL excluded from with 'eager' updates ([#43421](https://github.com/angular/angular/pull/43421)) |
| [772e08d14e](https://github.com/angular/angular/commit/772e08d14e534f20e4376109e81604965e189abf) | fix | fix Router's public API for canceledNavigationResolution ([#43842](https://github.com/angular/angular/pull/43842)) |
| [ccb09b4558](https://github.com/angular/angular/commit/ccb09b4558a3864fb5b2fe2214d08f1c1fe2758f) | fix | null/undefined routerLink should disable navigation ([#43087](https://github.com/angular/angular/pull/43087)) |
| [9e039ca68b](https://github.com/angular/angular/commit/9e039ca68bfae5328f3fc1f16fabd7673c466a25) | fix | Only trigger router navigation on `popstate` events from `Location` subscription ([#43328](https://github.com/angular/angular/pull/43328)) |
| [c5d0bd4966](https://github.com/angular/angular/commit/c5d0bd4966a4fc595d57f75569754b4d224ef2ba) | fix | Prevent URL flicker when new navigations cancel ongoing ones ([#43496](https://github.com/angular/angular/pull/43496)) |
| [adc68b100b](https://github.com/angular/angular/commit/adc68b100b98aef171ee298cc23bd5291b106526) | fix | reuse route strategy fix ([#43791](https://github.com/angular/angular/pull/43791)) |
| [361273fad5](https://github.com/angular/angular/commit/361273fad5030c900c83d333a779f6edbe20c688) | refactor | remove support for `loadChildren` string syntax ([#43591](https://github.com/angular/angular/pull/43591)) |
### service-worker
| Commit | Type | Description |
| -- | -- | -- |
| [59225f5586](https://github.com/angular/angular/commit/59225f5586f1319a47768cef2e3325d7ab6940af) | feat | `SwUpdate#activeUpdate` and `SwUpdate#checkForUpdate` should have a meaningful outcome ([#43668](https://github.com/angular/angular/pull/43668)) |
| [0dc45446fe](https://github.com/angular/angular/commit/0dc45446fe487febaefaf68a928c5a249880f2f3) | feat | expose more version update events ([#43668](https://github.com/angular/angular/pull/43668)) |
## Special Thanks
Ahmed Ayed, Alan Agius, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, Bjarki, Charles Lyding, Dmitrij Kuba, Doug Parker, Dylan Hunn, George Kalpakas, Jessica Janiuk, Jochen Kraushaar, Joe Martin (Crowdstaffing), Joey Perrott, Jon Rimmer, JoostK, Kristiyan Kostadinov, Maximilian Köller, Paul Gschwendtner, Pei Wang, Pete Bacon Darwin, Tomasz Domański, Willy Schott, anandtiwary, dario-piotrowicz, iRealNirmal, ivanwonder, krzysztof-grzybek, mgechev and vthinkxie

<a name="12.2.15"></a>
# 12.2.15 (2021-12-08)
### ngcc
| Commit | Type | Description |
| -- | -- | -- |
| [b6554d75cd](https://github.com/angular/angular/commit/b6554d75cd3ac8a904820f7cd051d926c74460bf) | fix | correctly resolve UMD dependencies ([#44382](https://github.com/angular/angular/pull/44382)) |
## Special Thanks
George Kalpakas

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.2.14"></a>
# 12.2.14 (2021-12-01)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [e3db0385b6](https://github.com/angular/angular/commit/e3db0385b6ae18f35b16d5a7fcbfac49ef729330) | fix | ensure that partially compiled queries can handle forward references ([#44124](https://github.com/angular/angular/pull/44124)) |
### ngcc
| Commit | Type | Description |
| -- | -- | -- |
| [a8be244113](https://github.com/angular/angular/commit/a8be244113d68865da9ec732291d7b79e26a0f1f) | fix | correctly report error when collecting dependencies of UMD module ([#44245](https://github.com/angular/angular/pull/44245)) |
| [fc072935ee](https://github.com/angular/angular/commit/fc072935ee0bcfc5b228ee81ba4261ee8f7b1756) | fix | support the UMD wrapper function format emitted by Webpack ([#44245](https://github.com/angular/angular/pull/44245)) |
## Special Thanks
George Kalpakas, Pete Bacon Darwin and iRealNirmal

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.2.13"></a>
# 12.2.13 (2021-11-03)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [9a89db790f](https://github.com/angular/angular/commit/9a89db790f2453c11df6778c3c8639114797ae28) | fix | avoid broken references in .d.ts files due to @internal markers ([#43965](https://github.com/angular/angular/pull/43965)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [8f402c9d06](https://github.com/angular/angular/commit/8f402c9d06f4e6f16759f73df44438f2ba725a30) | fix | support `InjectFlags` argument in `NodeInjector.get()` ([#41592](https://github.com/angular/angular/pull/41592)) |
## Special Thanks
Alan Agius, George Kalpakas, Jochen Kraushaar, Joe Martin (Crowdstaffing), JoostK and vthinkxie

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.2.12"></a>
# 12.2.12 (2021-10-27)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [112557497c](https://github.com/angular/angular/commit/112557497cf75b5e41e0f490df921a243ace1aeb) | fix | avoid broken references in .d.ts files due to @internal markers ([#43527](https://github.com/angular/angular/pull/43527)) |
### ngcc
| Commit | Type | Description |
| -- | -- | -- |
| [067ae54d46](https://github.com/angular/angular/commit/067ae54d46ce7480d2dccd4aa3fd4206737c02d1) | fix | support alternate UMD layout when adding new imports ([#43931](https://github.com/angular/angular/pull/43931)) |
## Special Thanks
Alan Agius, Andrew Kushnir, George Kalpakas, Jessica Janiuk, Joey Perrott, JoostK, Mladen Jakovljević, Virginia Dooley, amayer42, dirk diebel and ericcheng2005

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.2.11"></a>
# 12.2.11 (2021-10-20)
### ngcc
| Commit | Type | Description |
| -- | -- | -- |
| [cab21cea7a](https://github.com/angular/angular/commit/cab21cea7ae0c99603333e563d6c29d6a7787cc8) | fix | support alternate wrapper function layout for UMD ([#43879](https://github.com/angular/angular/pull/43879)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [58c11865ac](https://github.com/angular/angular/commit/58c11865ac08d9112735f31d4222d794f0dd0054) | fix | Do not clear currentNavigation if already set to next one ([#43852](https://github.com/angular/angular/pull/43852)) |
## Special Thanks
Alan Agius, Andrew Kushnir, Andrew Scott, David Shevitz, George Kalpakas, Joe Martin (Crowdstaffing), Natalia Venditto, Pete Bacon Darwin, Younes Jaaidi and dario-piotrowicz

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.2.10"></a>
# 12.2.10 (2021-10-13)
## Special Thanks
Alan Agius, Daniel Díaz, David Shevitz, Doug Parker, George Kalpakas, Joe Martin (Crowdstaffing), Tanguy Nodet, Thomas Turrell-Croft, dario-piotrowicz, hchiam, markostanimirovic and mgechev

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.2.9"></a>
# 12.2.9 (2021-10-06)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [b4b441077a](https://github.com/angular/angular/commit/b4b441077ad3a2991e7c04beb288bee1945a83bd) | fix | handle invalid constructor parameters in partial factory declarations ([#43619](https://github.com/angular/angular/pull/43619)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [7f6050587d](https://github.com/angular/angular/commit/7f6050587deb4796b6a0cc93445fab9e6b7ff826) | fix | unset attachRef when router-outlet is destroyed to avoid mounting a destroyed component ([#43697](https://github.com/angular/angular/pull/43697)) |
### service-worker
| Commit | Type | Description |
| -- | -- | -- |
| [c4ecc07838](https://github.com/angular/angular/commit/c4ecc07838de5149a360b11de1c8c4ef18b1fe77) | fix | make `ngsw.json` generation deterministic and correct ([#43679](https://github.com/angular/angular/pull/43679)) |
## Special Thanks
Alan Agius, Daniel Díaz, George Kalpakas, JoostK, Kristiyan Kostadinov, Pete Bacon Darwin, Wey-Han Liaw, dario-piotrowicz, iRealNirmal, little-pinecone, mgechev, ultrasonicsoft and xiaohanxu-nick

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.2.8"></a>
# 12.2.8 (2021-09-30)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [c1338bf837](https://github.com/angular/angular/commit/c1338bf837c7fe2bfb10974bd08d1ad013aaebbc) | fix | correctly interpret token arrays in @Injectable `deps` ([#43226](https://github.com/angular/angular/pull/43226)) |
### language-service
| Commit | Type | Description |
| -- | -- | -- |
| [c8f8d7d3b1](https://github.com/angular/angular/commit/c8f8d7d3b12598eef6f2439ff85a56cdcf1cbf92) | fix | provide dom event completions ([#43299](https://github.com/angular/angular/pull/43299)) |
### ngcc
| Commit | Type | Description |
| -- | -- | -- |
| [69299f7d4d](https://github.com/angular/angular/commit/69299f7d4d595141dae7a63e4faa35691a2d8887) | fix | do not fail for packages which correspond with `Object` members ([#43589](https://github.com/angular/angular/pull/43589)) |
### service-worker
| Commit | Type | Description |
| -- | -- | -- |
| [3cf41354ae](https://github.com/angular/angular/commit/3cf41354ae6bf988a9477379e0b28afaa6d7ce5b) | fix | do not unassign clients from a broken version ([#43518](https://github.com/angular/angular/pull/43518)) |
## Special Thanks
Adrien Crivelli, Alex Rickabaugh, Andrew Scott, Bobby Galli, Chris, Daniel Díaz, Dario Piotrowicz, George Kalpakas, Joe Martin (Crowdstaffing), JoostK, Pete Bacon Darwin, Rafael Santana, Raj Sekhar, Ricardo Chavarria, Teri Glover, Virginia Dooley, dario-piotrowicz, enisfr and wszgrcy

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.2.7"></a>
# 12.2.7 (2021-09-22)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [2bb4bf1468](https://github.com/angular/angular/commit/2bb4bf1468935a49a3d478d0cc13e7eb7fd1b98a) | fix | titlecase pipe incorrectly handling numbers ([#43476](https://github.com/angular/angular/pull/43476)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [9c8a1f8a71](https://github.com/angular/angular/commit/9c8a1f8a71be9b8380afbdc61ee7ee60f24488b4) | fix | include leading whitespace in source-spans of i18n messages ([#43132](https://github.com/angular/angular/pull/43132)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [defb02f11e](https://github.com/angular/angular/commit/defb02f11e2bd75452e8722e1474bb230d189864) | fix | handle directives that refer to a namespaced class in a type parameter bound ([#43511](https://github.com/angular/angular/pull/43511)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [adc7c56ede](https://github.com/angular/angular/commit/adc7c56ede7ad34a90f5ef1b878e261836b25c45) | fix | improve error message for missing animation trigger ([#41356](https://github.com/angular/angular/pull/41356)) |
## Special Thanks
Andrew Scott, Daniel Díaz, George Kalpakas, JoostK, Kristiyan Kostadinov, Mwiku, Pete Bacon Darwin, Teri Glover, Virginia Dooley, Xiaohanxu1996, dario-piotrowicz and kirjs

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.2.6"></a>
# 12.2.6 (2021-09-15)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [141fde1632](https://github.com/angular/angular/commit/141fde1632b4834449cfd48dcebfc8b1b7d58e09) | fix | emit pure annotations to static property initializers ([#43344](https://github.com/angular/angular/pull/43344)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [ca510c87c5](https://github.com/angular/angular/commit/ca510c87c5a890c4b22fd364c58667adef90a1e0) | fix | emit pure annotations to static property initializers ([#43344](https://github.com/angular/angular/pull/43344)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [4034f252c9](https://github.com/angular/angular/commit/4034f252c9707dabd01386843f7c278f3d2e4302) | fix | Allow renavigating to failed URLs ([#43424](https://github.com/angular/angular/pull/43424)) |
### service-worker
| Commit | Type | Description |
| -- | -- | -- |
| [a102b27641](https://github.com/angular/angular/commit/a102b27641e3ad00401dd6d2635b9ddcf1151251) | fix | clear service worker cache in safety worker ([#43324](https://github.com/angular/angular/pull/43324)) |
## Special Thanks
Alan Agius, Amadou Sall, Andrew Kushnir, Andrew Scott, Aristeidis Bampakos, Bjarki, David Shevitz, George Kalpakas, Joe Martin (Crowdstaffing), Michele Stieven, Naveed Ahmed, dario-piotrowicz, mezhik91 and mgechev

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.2.5"></a>
# 12.2.5 (2021-09-08)
### router
| Commit | Description |
| -- | -- |
| [a0bd6e90f9](https://github.com/angular/angular/commit/a0bd6e90f987377320b3b337d8c3a33235658e9a) | fix: add more context to `Unhandled Navigation Error` ([#43291](https://github.com/angular/angular/pull/43291)) |
## Special Thanks:
Alan Agius, Charles Barnes, Enea Jahollari, George Kalpakas, Ikko Ashimine, Paul Gschwendtner, Pete Bacon Darwin, William Sedlacek and dario-piotrowicz

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.2.4"></a>
# 12.2.4 (2021-09-01)
### compiler-cli
| Commit | Description |
| -- | -- |
| [8233906be2](https://github.com/angular/angular/commit/8233906be25e19da6d8115094616d3e4b5e36fea) | fix: Emit type annotations for synthesized decorator fields ([#43021](https://github.com/angular/angular/pull/43021)) |
## Special Thanks:
Andrew Scott, Daniel Trevino, George Kalpakas, Joey Perrott, Kristiyan Kostadinov, nickreid and segunb

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.2.3"></a>
# 12.2.3 (2021-08-25)
### service-worker
| Commit | Description |
| -- | -- |
| [fc7f92159d](https://github.com/angular/angular/commit/fc7f92159df16e894d9909cfc8969ed4b7d9924a) | fix: NPE if onActionClick is undefined ([#43210](https://github.com/angular/angular/pull/43210)) |
## Special Thanks:
Daniel Trevino, Erik Slack, George Kalpakas, dario-piotrowicz and shlasouski

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.2.2"></a>
# 12.2.2 (2021-08-18)
### animations
| Commit | Description |
| -- | -- |
| [bb6555979d](https://github.com/angular/angular/commit/bb6555979dd02e706f7e98022b9c37a4f54db1ba) | fix: add pure annotations to static property initializers ([#43064](https://github.com/angular/angular/pull/43064)) |
### core
| Commit | Description |
| -- | -- |
| [738b23347e](https://github.com/angular/angular/commit/738b23347e5eeadfa0321d1429537837dba5e4c1) | fix: add pure annotations to static property initializers ([#43064](https://github.com/angular/angular/pull/43064)) |
### platform-browser
| Commit | Description |
| -- | -- |
| [535837e617](https://github.com/angular/angular/commit/535837e617a0434f8e7bd9071cc4d8c27fd9f373) | perf: avoid intermediate arrays in server transition ([#43145](https://github.com/angular/angular/pull/43145)) |
### router
| Commit | Description |
| -- | -- |
| [6449590ec8](https://github.com/angular/angular/commit/6449590ec81eff0873af911fb65679b5a77db27b) | fix: eagerly update internal state on browser-triggered navigations ([#43102](https://github.com/angular/angular/pull/43102)) |
## Special Thanks:
Andrew Scott, Aristeidis Bampakos, Charles Lyding, Edoardo Dusi, George Kalpakas, Joe Martin (Crowdstaffing), Joey Perrott, Kirk Larkin, Kristiyan Kostadinov, Pete Bacon Darwin, TIffany Davis, Theoklitos Bampouris, ali, dario-piotrowicz and pichuser

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.2.1"></a>
# 12.2.1 (2021-08-11)
### router
| Commit | Description |
| -- | -- |
| [dd3abdb9d9](https://github.com/angular/angular/commit/dd3abdb9d9b2c4363fb1f468a05bf449b55f55a5) | fix(router): ensure check for match options is compatible with property renaming ([#43086](https://github.com/angular/angular/pull/43086)) |
## Special Thanks:
Amadou Sall, Andrew Kushnir, Andrew Scott, Daniel Trevino, Erik Slack, Fabien BERNARD, George Kalpakas, Jeroen van Warmerdam, Joey Perrott, Tim Gates and Vugar_Abdullayev

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.2.0"></a>
# 12.2.0 (2021-08-04)
### core
| Commit | Description |
| -- | -- |
| [bd7f0d8b70](https://github.com/angular/angular/commit/bd7f0d8b70150a7e4e7550f4380a2e731cf2b942) | fix(core): incorrect error reported when trying to re-create view which had an error during creation ([#43005](https://github.com/angular/angular/pull/43005)) |
### language-service
| Commit | Description |
| -- | -- |
| [aace1e71d8](https://github.com/angular/angular/commit/aace1e71d8fb5e1e52fcd86e2a26892d1016c43e) | fix(language-service): global autocomplete doesn't work when the user tries to modify the symbol ([#42923](https://github.com/angular/angular/pull/42923)) |
## Special Thanks:
Alex Rickabaugh, Joe Martin, Joey Perrott, Kristiyan Kostadinov, Nichola Alkhouri, Paul Gschwendtner, Pete Bacon Darwin, atscott, dario-piotrowicz and ivanwonder

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.1.5"></a>
# 12.1.5 (2021-08-04)
This release contains various API docs improvements.

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.2.0-rc.0"></a>
# 12.2.0-rc.0 (2021-07-28)
### compiler-cli
| Commit | Description |
| -- | -- |
| [ed9cfb674f](https://github.com/angular/angular/commit/ed9cfb674f8e52b416ccdaf9aa9c46955b8448f5) | fix(compiler-cli): use correct module resolution context for absolute imports in .d.ts files ([#42879](https://github.com/angular/angular/pull/42879)) |
| [5fb23eccea](https://github.com/angular/angular/commit/5fb23ecceaccf0629308dd50210b65f67d51f024) | perf(compiler-cli): skip analysis in incremental builds for files without Angular behavior ([#42562](https://github.com/angular/angular/pull/42562)) |
### core
| Commit | Description |
| -- | -- |
| [eefe1682e8](https://github.com/angular/angular/commit/eefe1682e8099b73b6e50bb227b5a7f63105c63d) | fix(core): correctly handle `null` or `undefined` in `ErrorHandler#handleError()` ([#42881](https://github.com/angular/angular/pull/42881)) |
### forms
| Commit | Description |
| -- | -- |
| [1d9d02696e](https://github.com/angular/angular/commit/1d9d02696eadbee2c2f719e432efca22f1e494e9) | feat(forms): add hasValidators, addValidators, and removeValidators methods (for both sync and async) ([#42838](https://github.com/angular/angular/pull/42838)) |
| [a502279592](https://github.com/angular/angular/commit/a50227959222f39884aac284544d1626aee5ca64) | feat(forms): allow minLength/maxLength validator to be bound to `null` ([#42565](https://github.com/angular/angular/pull/42565)) |
### language-service
| Commit | Description |
| -- | -- |
| [7c35ca0e00](https://github.com/angular/angular/commit/7c35ca0e0030f2ded12ddca9092e31f510cebeb1) | feat(language-service): support autocomplete string literal union types in templates ([#42729](https://github.com/angular/angular/pull/42729)) |
### router
| Commit | Description |
| -- | -- |
| [0d81b007e4](https://github.com/angular/angular/commit/0d81b007e48a0ac801d2614601fb8180a3517865) | fix(router): add missing outlet events to RouterOutletContract ([#42431](https://github.com/angular/angular/pull/42431)) |
| [dbae00195e](https://github.com/angular/angular/commit/dbae00195e114ac8b967201283962a7e2c0581b4) | feat(router): ability to provide custom route reuse strategy via DI for `RouterTestingModule` ([#42434](https://github.com/angular/angular/pull/42434)) |
## Special Thanks:
Andrew Scott, Daniel Trevino, Dmitrij Kuba, Dylan Hunn, George Kalpakas, Joey Perrott, JoostK, Paul Gschwendtner, Pete Bacon Darwin, Steven Masala, Teri Glover, Vladyslav, Yuvaraj, codebriefcase, iRealNirmal and ivanwonder

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.1.4"></a>
# 12.1.4 (2021-07-28)
### compiler-cli
| Commit | Description |
| -- | -- |
| [77ae4459d3](https://github.com/angular/angular/commit/77ae4459d34515493ddf62c7ecdf237260176809) | fix(compiler-cli): use correct module resolution context for absolute imports in .d.ts files ([#42879](https://github.com/angular/angular/pull/42879)) |
| [f589b01672](https://github.com/angular/angular/commit/f589b01672d13c1a174b880437d00a910899f29d) | perf(compiler-cli): skip analysis in incremental builds for files without Angular behavior ([#42562](https://github.com/angular/angular/pull/42562)) |
### core
| Commit | Description |
| -- | -- |
| [a779a1029b](https://github.com/angular/angular/commit/a779a1029b90039ea39d579ecbc98812c301080a) | fix(core): correctly handle `null` or `undefined` in `ErrorHandler#handleError()` ([#42881](https://github.com/angular/angular/pull/42881)) |
## Special Thanks:
Andrew Scott, Daniel Trevino, Dylan Hunn, George Kalpakas, Joey Perrott, JoostK, Paul Gschwendtner, Pete Bacon Darwin, Teri Glover, Vladyslav, Yuvaraj and codebriefcase

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.2.0-next.3"></a>
# 12.2.0-next.3 (2021-07-21)
### animations
| Commit | Description |
| -- | -- |
| [f12c53342c](https://github.com/angular/angular/commit/f12c53342c433eb8ef5650c78f0115f82f5b1567) | fix(animations): normalize final styles in buildStyles ([#42763](https://github.com/angular/angular/pull/42763)) |
### compiler-cli
| Commit | Description |
| -- | -- |
| [70c3461be3](https://github.com/angular/angular/commit/70c3461be38765efedac1e4c5dd1156023a29690) | fix(compiler-cli): use correct module import for types behind a `forwardRef` ([#42887](https://github.com/angular/angular/pull/42887)) |
| [07d7e6034f](https://github.com/angular/angular/commit/07d7e6034f2a9adae643b3a8e64e2cc794596c8c) | perf(compiler-cli): optimize cycle detection using a persistent cache ([#41271](https://github.com/angular/angular/pull/41271)) |
### core
| Commit | Description |
| -- | -- |
| [307dac67bc](https://github.com/angular/angular/commit/307dac67bc933ab3b017333b3085af8fba8193dc) | fix(core): use correct injector when resolving DI tokens from within a directive provider factory ([#42886](https://github.com/angular/angular/pull/42886)) |
## Special Thanks:
Alan Agius, Alex Rickabaugh, David Shevitz, George Kalpakas, Joey Perrott, JoostK, Krzysztof Kotowicz, Minko Gechev, Paul Gschwendtner and dario-piotrowicz

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.1.3"></a>
# 12.1.3 (2021-07-21)
### animations
| Commit | Description |
| -- | -- |
| [3cddc3d6bc](https://github.com/angular/angular/commit/3cddc3d6bc1045b76980ba3e866350d58deb0718) | fix(animations): normalize final styles in buildStyles ([#42763](https://github.com/angular/angular/pull/42763)) |
### compiler-cli
| Commit | Description |
| -- | -- |
| [d207ea06d1](https://github.com/angular/angular/commit/d207ea06d1bb554e822bab2eadcf12ef50117bd4) | fix(compiler-cli): use correct module import for types behind a `forwardRef` ([#42887](https://github.com/angular/angular/pull/42887)) |
| [e6d520f3d9](https://github.com/angular/angular/commit/e6d520f3d9104c63129b94fbf5fe54b392715fc5) | perf(compiler-cli): optimize cycle detection using a persistent cache ([#41271](https://github.com/angular/angular/pull/41271)) |
### core
| Commit | Description |
| -- | -- |
| [a6db152c78](https://github.com/angular/angular/commit/a6db152c78bc82ef39e529ab5ea55f810b17fa2e) | fix(core): use correct injector when resolving DI tokens from within a directive provider factory ([#42886](https://github.com/angular/angular/pull/42886)) |
## Special Thanks:
Alan Agius, David Shevitz, George Kalpakas, Joey Perrott, JoostK, Krzysztof Kotowicz, Minko Gechev, Paul Gschwendtner and dario-piotrowicz

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.2.0-next.2"></a>
# 12.2.0-next.2 (2021-07-14)
### bazel
| Commit | Description |
| -- | -- |
| [7e04116d15](https://github.com/angular/angular/commit/7e04116d1572b5b2b7862ba037f90ab6142a927f) | fix(bazel): enable dts bundling for Ivy packages ([#42728](https://github.com/angular/angular/pull/42728)) |
### common
| Commit | Description |
| -- | -- |
| [e42aa6c13b](https://github.com/angular/angular/commit/e42aa6c13b9f1f8f5b2e8c27e97380bf574db873) | fix(common): re-sort output of `KeyValuePipe` when `compareFn` changes ([#42821](https://github.com/angular/angular/pull/42821)) |
### compiler
| Commit | Description |
| -- | -- |
| [b33665ab2c](https://github.com/angular/angular/commit/b33665ab2c7c8c5536b5dc4f488a457100524dc3) | fix(compiler): add mappings for all HTML entities ([#42818](https://github.com/angular/angular/pull/42818)) |
| [404c8d0d88](https://github.com/angular/angular/commit/404c8d0d88b88ae3ab5a80609d508fb2ecdf0d27) | fix(compiler): incorrect context object being referenced from listener instructions inside embedded views ([#42755](https://github.com/angular/angular/pull/42755)) |
### compiler-cli
| Commit | Description |
| -- | -- |
| [81dce5c664](https://github.com/angular/angular/commit/81dce5c6649ddc56903a37ef6a26dcd3ee37df96) | fix(compiler-cli): check split two way binding ([#42601](https://github.com/angular/angular/pull/42601)) |
| [4c482bf3f1](https://github.com/angular/angular/commit/4c482bf3f1768a18b35e0648c91029504a8d8649) | fix(compiler-cli): properly emit literal types when recreating type parameters in a different file ([#42761](https://github.com/angular/angular/pull/42761)) |
| [30c82cd177](https://github.com/angular/angular/commit/30c82cd17757f41d56afe71f69a90ac812a3201f) | fix(compiler-cli): inline type checking instructions no longer prevent incremental reuse ([#42759](https://github.com/angular/angular/pull/42759)) |
| [4c78984ad2](https://github.com/angular/angular/commit/4c78984ad26825851d78d6f0339d8e4cb7bf1e54) | fix(compiler-cli): support reflecting namespace declarations ([#42728](https://github.com/angular/angular/pull/42728)) |
| [74350a5cf1](https://github.com/angular/angular/commit/74350a5cf1035f0d33640dce845a1f78aa33f009) | fix(compiler-cli): return directives for an element on a microsyntax template ([#42640](https://github.com/angular/angular/pull/42640)) |
### core
| Commit | Description |
| -- | -- |
| [cd2d82a91a](https://github.com/angular/angular/commit/cd2d82a91a5f547ae4c3d369f7f777245324c9e5) | fix(core): associate the NgModule scope for an overridden component ([#42817](https://github.com/angular/angular/pull/42817)) |
| [51156f3f07](https://github.com/angular/angular/commit/51156f3f0798fe5bc6f69cf38ba2f2947aab89aa) | fix(core): allow proper type inference when `ngFor` is used with a `trackBy` function ([#42692](https://github.com/angular/angular/pull/42692)) |
| [0f23f7343e](https://github.com/angular/angular/commit/0f23f7343ec9bdcd2d40f6f474d2a4f5e38e2627) | fix(core): error in TestBed if module is reset mid-compilation in ViewEngine ([#42669](https://github.com/angular/angular/pull/42669)) |
### language-service
| Commit | Description |
| -- | -- |
| [ffeea63f43](https://github.com/angular/angular/commit/ffeea63f43e6a7fd46be4a8cd5a5d254c98dea08) | fix(language-service): Do not override TS LS methods not supported by VE NgLS ([#42727](https://github.com/angular/angular/pull/42727)) |
### service-worker
| Commit | Description |
| -- | -- |
| [cb2ca9a66e](https://github.com/angular/angular/commit/cb2ca9a66ef54d9f1b3df5ac14962dc3810b4cc1) | fix(service-worker): correctly handle unrecoverable state when a client no longer exists ([#42736](https://github.com/angular/angular/pull/42736)) |
| [f592a12005](https://github.com/angular/angular/commit/f592a120057c3787ad6b7385b6f8e10928627e9e) | fix(service-worker): avoid storing redundant metadata for hashed assets ([#42606](https://github.com/angular/angular/pull/42606)) |
## Special Thanks:
Alan Agius, Andrew Kushnir, Andrew Scott, Arthur Ming, Bastian, Borislav Ivanov, Daniel Trevino, David Gilson, David Shevitz, Gabriele Franchitto, George Kalpakas, Joey Perrott, JoostK, Kristiyan Kostadinov, Mark Goho, Meir Blumenfeld, Paul Gschwendtner, Pete Bacon Darwin, Ryan Andersen, Theoklitos Bampouris, behrooz bozorg chami, dario-piotrowicz, ivanwonder and mgechev

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.1.2"></a>
# 12.1.2 (2021-07-14)
### bazel
| Commit | Description |
| -- | -- |
| [4a8ab4f149](https://github.com/angular/angular/commit/4a8ab4f1499a560bb4373b088785e43f26384e1c) | fix(bazel): enable dts bundling for Ivy packages ([#42728](https://github.com/angular/angular/pull/42728)) |
### common
| Commit | Description |
| -- | -- |
| [d654c7933a](https://github.com/angular/angular/commit/d654c7933a732c23dc1e68b17766457d2d11a4d8) | fix(common): re-sort output of `KeyValuePipe` when `compareFn` changes ([#42821](https://github.com/angular/angular/pull/42821)) |
### compiler
| Commit | Description |
| -- | -- |
| [2566cbb48c](https://github.com/angular/angular/commit/2566cbb48cddd23c4b29d01ad557bc71ac716700) | fix(compiler): add mappings for all HTML entities ([#42818](https://github.com/angular/angular/pull/42818)) |
| [65330f03a9](https://github.com/angular/angular/commit/65330f03a92f2743719d0e0d4cedcaadbb8c5b21) | fix(compiler): incorrect context object being referenced from listener instructions inside embedded views ([#42755](https://github.com/angular/angular/pull/42755)) |
### compiler-cli
| Commit | Description |
| -- | -- |
| [17d3de25da](https://github.com/angular/angular/commit/17d3de25daf339612c267001f0c2237533d7c789) | fix(compiler-cli): properly emit literal types when recreating type parameters in a different file ([#42761](https://github.com/angular/angular/pull/42761)) |
| [0a17e98ae2](https://github.com/angular/angular/commit/0a17e98ae2813338f03e3e01bb7cfa6024f4632b) | fix(compiler-cli): inline type checking instructions no longer prevent incremental reuse ([#42759](https://github.com/angular/angular/pull/42759)) |
| [45116097c1](https://github.com/angular/angular/commit/45116097c1dafd902014e0f680e0d50023467883) | fix(compiler-cli): support reflecting namespace declarations ([#42728](https://github.com/angular/angular/pull/42728)) |
| [df5cc1fbbf](https://github.com/angular/angular/commit/df5cc1fbbf1b1f02f1f45603552a2530bb59688d) | fix(compiler-cli): return directives for an element on a microsyntax template ([#42640](https://github.com/angular/angular/pull/42640)) |
### core
| Commit | Description |
| -- | -- |
| [63013546e1](https://github.com/angular/angular/commit/63013546e130d823db26ad96e1d4cb346e633a03) | fix(core): associate the NgModule scope for an overridden component ([#42817](https://github.com/angular/angular/pull/42817)) |
| [9ebd41e39c](https://github.com/angular/angular/commit/9ebd41e39c597ef6df2de2fb63d6458337e2757d) | fix(core): allow proper type inference when `ngFor` is used with a `trackBy` function ([#42692](https://github.com/angular/angular/pull/42692)) |
| [41c6877c01](https://github.com/angular/angular/commit/41c6877c013ba84ba5e46309b2310c097ad9e354) | fix(core): error in TestBed if module is reset mid-compilation in ViewEngine ([#42669](https://github.com/angular/angular/pull/42669)) |
### language-service
| Commit | Description |
| -- | -- |
| [97c18f4527](https://github.com/angular/angular/commit/97c18f4527187206db8b0f5730b80d2220027f9f) | fix(language-service): Do not override TS LS methods not supported by VE NgLS ([#42727](https://github.com/angular/angular/pull/42727)) |
### service-worker
| Commit | Description |
| -- | -- |
| [d87917542a](https://github.com/angular/angular/commit/d87917542a00ed6f58c7b95e3eba6aeddc5eee01) | fix(service-worker): correctly handle unrecoverable state when a client no longer exists ([#42736](https://github.com/angular/angular/pull/42736)) |
| [f2523a8fef](https://github.com/angular/angular/commit/f2523a8fef549fab6ec480ecfc966c9d938a5423) | fix(service-worker): avoid storing redundant metadata for hashed assets ([#42606](https://github.com/angular/angular/pull/42606)) |
## Special Thanks:
Alan Agius, Andrew Kushnir, Andrew Scott, Arthur Ming, Bastian, Borislav Ivanov, David Gilson, David Shevitz, Gabriele Franchitto, George Kalpakas, Joey Perrott, JoostK, Kristiyan Kostadinov, Mark Goho, Meir Blumenfeld, Paul Gschwendtner, Pete Bacon Darwin, Ryan Andersen, Theoklitos Bampouris, behrooz bozorg chami, dario-piotrowicz, ivanwonder and mgechev

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.2.0-next.1"></a>
# 12.2.0-next.1 (2021-06-30)
### compiler
| Commit | Description |
| -- | -- |
| [9f5cc7c808](https://github.com/angular/angular/commit/9f5cc7c808458f312543c7c044fe7a361cdc7798) | feat(compiler): support number separators in templates ([#42672](https://github.com/angular/angular/pull/42672)) |
### compiler-cli
| Commit | Description |
| -- | -- |
| [37a740c659](https://github.com/angular/angular/commit/37a740c6590b7725053f8578d39e53ecba4f5727) | fix(compiler-cli): add support for partially evaluating types ([#41661](https://github.com/angular/angular/pull/41661)) |
### platform-browser
| Commit | Description |
| -- | -- |
| [234b5edcc7](https://github.com/angular/angular/commit/234b5edcc7d24cfe5d418f93181844cdf12e5ec8) | fix(platform-browser): in `Meta.addTag()` do not add duplicate meta tags ([#42703](https://github.com/angular/angular/pull/42703)) |
## Special Thanks:
Alan Agius, Alex Rickabaugh, Dario Piotrowicz, George Kalpakas, George Looshch, Joey Perrott, Kristiyan Kostadinov, Lars Gyrup Brink Nielsen, Paul Gschwendtner, Pete Bacon Darwin, Zach Arend, codebriefcase, dario-piotrowicz, marvinbeckert, mgechev and pavlenko

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.1.1"></a>
# 12.1.1 (2021-06-30)
### compiler-cli
| Commit | Description |
| -- | -- |
| [f6b828e292](https://github.com/angular/angular/commit/f6b828e292fe29108abcf8aa63c61f5677c2ef70) | fix(compiler-cli): add support for partially evaluating types ([#41661](https://github.com/angular/angular/pull/41661)) |
### platform-browser
| Commit | Description |
| -- | -- |
| [d19ddd1a87](https://github.com/angular/angular/commit/d19ddd1a87127c3eaa6f5a832af3db2eb52793cd) | fix(platform-browser): in `Meta.addTag()` do not add duplicate meta tags ([#42703](https://github.com/angular/angular/pull/42703)) |
## Special Thanks:
Alan Agius, Dario Piotrowicz, George Kalpakas, George Looshch, Lars Gyrup Brink Nielsen, Paul Gschwendtner, Pete Bacon Darwin, Zach Arend, codebriefcase, dario-piotrowicz, marvinbeckert, mgechev and pavlenko

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.2.0-next.0"></a>
# 12.2.0-next.0 (2021-06-24)

This release contains the same set of changes as 12.1.0.

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.1.0"></a>
# 12.1.0 (2021-06-24)
### compiler
| Commit | Description |
| -- | -- |
| [9de65dbdce](https://github.com/angular/angular/commit/9de65dbdceac3077881fbc49717f33d0f379e21d) | fix(compiler): should not break a text token on a non-valid start tag ([#42605](https://github.com/angular/angular/pull/42605)) |
| [c873440ad2](https://github.com/angular/angular/commit/c873440ad285279edafff65645a73f5da8e5bafe) | fix(compiler): do not allow unterminated interpolation to leak into later tokens ([#42605](https://github.com/angular/angular/pull/42605)) |
| [cc672f05bf](https://github.com/angular/angular/commit/cc672f05bf4e2f03fa415ebd2d69514594c9bc9d) | feat(compiler): add support for shorthand property declarations in templates ([#42421](https://github.com/angular/angular/pull/42421)) |
| [f52df99fe3](https://github.com/angular/angular/commit/f52df99fe369854c4ee49e3c01afa29cf2ae7126) | fix(compiler): generate view restoration for keyed write inside template listener ([#42603](https://github.com/angular/angular/pull/42603)) |
### compiler-cli
| Commit | Description |
| -- | -- |
| [874de59d35](https://github.com/angular/angular/commit/874de59d35e03114867611abe41e662e7bc9b138) | fix(compiler-cli): change default ngcc  hash algorithm to be FIPS compliant ([#42582](https://github.com/angular/angular/pull/42582)) |
| [729eea5716](https://github.com/angular/angular/commit/729eea57165f8931f3d2ea7b7c09d6c094968ad4) | fix(compiler-cli): transform type references in generic type parameter default ([#42492](https://github.com/angular/angular/pull/42492)) |
### core
| Commit | Description |
| -- | -- |
| [873229f24b](https://github.com/angular/angular/commit/873229f24be292ac9e909993e28c2ae2cef4033a) | feat(core): add opt-in test module teardown configuration ([#42566](https://github.com/angular/angular/pull/42566)) |
### router
| Commit | Description |
| -- | -- |
| [07c1ddc487](https://github.com/angular/angular/commit/07c1ddc48775967190b9c50530bae20c97140c0f) | fix(router): error if module is destroyed before location is initialized ([#42560](https://github.com/angular/angular/pull/42560)) |
### service-worker
| Commit | Description |
| -- | -- |
| [cc30dc0713](https://github.com/angular/angular/commit/cc30dc0713d6976426114968caa1be3e782df0d4) | fix(service-worker): ensure obsolete caches are always cleaned up ([#42622](https://github.com/angular/angular/pull/42622)) |
| [01128f5b5d](https://github.com/angular/angular/commit/01128f5b5d7e6cbca8f4844672b51565c19ba8e7) | fix(service-worker): ensure caches are cleaned up when failing to load state ([#42622](https://github.com/angular/angular/pull/42622)) |
| [73b0275dc2](https://github.com/angular/angular/commit/73b0275dc2dd64bbb39be3a8079b418a40e89cfd) | fix(service-worker): improve ServiceWorker cache names ([#42622](https://github.com/angular/angular/pull/42622)) |
| [7507ed2e54](https://github.com/angular/angular/commit/7507ed2e54b0d33aeec32e63126e3212dd2d911a) | fix(service-worker): use correct names when listing `CacheDatabase` tables ([#42622](https://github.com/angular/angular/pull/42622)) |
| [53fe557da7](https://github.com/angular/angular/commit/53fe557da743992943f520c860d2f093eecc429e) | feat(service-worker): include ServiceWorker version in debug info ([#42622](https://github.com/angular/angular/pull/42622)) |
| [d546501ab5](https://github.com/angular/angular/commit/d546501ab5df6d738bede85ea949053513e02849) | feat(service-worker): add `openWindow`, `focusLastFocusedOrOpen` and `navigateLastFocusedOrOpen` ([#42520](https://github.com/angular/angular/pull/42520)) |
| [9498da1038](https://github.com/angular/angular/commit/9498da1038ffa854effa672fac3a898039853375) | fix(service-worker): correctly determine client ID on navigation requests ([#42607](https://github.com/angular/angular/pull/42607)) |
## Special Thanks:
Alex Rickabaugh, Dale Harris, George Kalpakas, Joey Perrott, JoostK, Kristiyan Kostadinov, Németh Tamás, Paul Gschwendtner, Pete Bacon Darwin, Renovate Bot, Umair Hafeez, codingnuclei and mgechev

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.1.0-next.6"></a>
# 12.1.0-next.6 (2021-06-16)
### compiler
| Commit | Description |
| -- | -- |
| [8c1e0e6ad0](https://github.com/angular/angular/commit/8c1e0e6ad0eba7ece827d899311cf7d25f64db1a) | fix(compiler): always match close tag to the nearest open element ([#42554](https://github.com/angular/angular/pull/42554)) |
### compiler-cli
| Commit | Description |
| -- | -- |
| [22bda2226b](https://github.com/angular/angular/commit/22bda2226bd42d081b7314c1b11144ad79ad1c44) | fix(compiler-cli): prevent prior compilations from being retained in watch builds ([#42537](https://github.com/angular/angular/pull/42537)) |
### core
| Commit | Description |
| -- | -- |
| [3961b3c360](https://github.com/angular/angular/commit/3961b3c3606bb835e539c66d5ac8d91d2a9b0f80) | fix(core): ensure that autoRegisterModuleById registration in ɵɵdefineNgModule is not DCE-ed by closure ([#42529](https://github.com/angular/angular/pull/42529)) |
### forms
| Commit | Description |
| -- | -- |
| [7180ec9e7c](https://github.com/angular/angular/commit/7180ec9e7c3e33c1acfba1f40190d2de804c062e) | fix(forms): changes to status not always being emitted to statusChanges observable for async validators. ([#42553](https://github.com/angular/angular/pull/42553)) |
### language-service
| Commit | Description |
| -- | -- |
| [4001e9d808](https://github.com/angular/angular/commit/4001e9d80852101a30b1adb1e501438b5846c463) | fix(language-service): 'go to defininition' for objects defined in template ([#42559](https://github.com/angular/angular/pull/42559)) |
| [228beeabd1](https://github.com/angular/angular/commit/228beeabd1542941cbfff46ad78d52c1df3d283a) | fix(language-service): Use last child end span for parent without close tag ([#42554](https://github.com/angular/angular/pull/42554)) |
## Special Thanks:
Ahmed Ayed, Alan Agius, Alex Rickabaugh, Andrew Scott, Ankit Choudhary, Aristeidis Bampakos, Daniel Trevino, Dario Piotrowicz, Dylan Hunn, George Kalpakas, Igor Minar, JiaLiPassion, JoostK, Kapunahele Wong, Kristiyan Kostadinov, Marius Bethge, Mladen Jakovljević, Paul Gschwendtner, Pete Bacon Darwin, Pham Huu Hien, Renovate Bot, dario-piotrowicz and gobika21f

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.0.5"></a>
# 12.0.5 (2021-06-16)
### compiler
| Commit | Description |
| -- | -- |
| [89fc131ef8](https://github.com/angular/angular/commit/89fc131ef87ef0dca4c95960e2b5e3d7cf77070c) | fix(compiler): always match close tag to the nearest open element ([#42554](https://github.com/angular/angular/pull/42554)) |
### compiler-cli
| Commit | Description |
| -- | -- |
| [60dbf017fb](https://github.com/angular/angular/commit/60dbf017fbca5de55f9e5e95044d780740a0e4b8) | fix(compiler-cli): prevent prior compilations from being retained in watch builds ([#42537](https://github.com/angular/angular/pull/42537)) |
### core
| Commit | Description |
| -- | -- |
| [785da0f1bf](https://github.com/angular/angular/commit/785da0f1bfa163b232009b4c9123b26b545a09dc) | fix(core): ensure that autoRegisterModuleById registration in ɵɵdefineNgModule is not DCE-ed by closure ([#42529](https://github.com/angular/angular/pull/42529)) |
### forms
| Commit | Description |
| -- | -- |
| [6f1b907b79](https://github.com/angular/angular/commit/6f1b907b79eaf386f63affc16791bf92a7fea1ab) | fix(forms): changes to status not always being emitted to statusChanges observable for async validators. ([#42553](https://github.com/angular/angular/pull/42553)) |
### language-service
| Commit | Description |
| -- | -- |
| [8192f1e1c2](https://github.com/angular/angular/commit/8192f1e1c2283e2bd07759a6d507c0c79685a4eb) | fix(language-service): 'go to defininition' for objects defined in template ([#42559](https://github.com/angular/angular/pull/42559)) |
| [11e0f53352](https://github.com/angular/angular/commit/11e0f533527ef89dc825a0dd73b652a4ccbdf58b) | fix(language-service): Use last child end span for parent without close tag ([#42554](https://github.com/angular/angular/pull/42554)) |
## Special Thanks:
Ahmed Ayed, Alan Agius, Andrew Scott, Ankit Choudhary, Aristeidis Bampakos, Daniel Trevino, Dario Piotrowicz, Dylan Hunn, George Kalpakas, Igor Minar, JiaLiPassion, JoostK, Kapunahele Wong, Kristiyan Kostadinov, Marius Bethge, Pete Bacon Darwin, Pham Huu Hien, dario-piotrowicz and gobika21

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.1.0-next.5"></a>
# 12.1.0-next.5 (2021-06-09)
### common
| Commit | Description |
| -- | -- |
| [85c7f7691e](https://github.com/angular/angular/commit/85c7f7691e7d4358acff2c0ab5e26cda415a8483) | fix(common): infer correct type when `trackBy` is used in `ngFor` ([#41995](https://github.com/angular/angular/pull/41995)) |
| [374fa2c26f](https://github.com/angular/angular/commit/374fa2c26f56cd7c82b3e62a079fa785f11ac624) | fix(common): initialize currencyCode in currencyPipe ([#40505](https://github.com/angular/angular/pull/40505)) |
### compiler
| Commit | Description |
| -- | -- |
| [afd68e5674](https://github.com/angular/angular/commit/afd68e5674e99a64fe5acc40e08cc8386dc6a454) | feat(compiler): emit diagnostic for shadow dom components with an invalid selector ([#42245](https://github.com/angular/angular/pull/42245)) |
| [ba084857ea](https://github.com/angular/angular/commit/ba084857ea018a4a77cfc855f0276dcaa2a0c2fa) | feat(compiler): support safe keyed read expressions ([#41911](https://github.com/angular/angular/pull/41911)) |
### compiler-cli
| Commit | Description |
| -- | -- |
| [bd1836b999](https://github.com/angular/angular/commit/bd1836b999938fdec98dd6cbfa407d3bcf828e3c) | fix(compiler-cli): exclude type-only imports from cycle analysis ([#42453](https://github.com/angular/angular/pull/42453)) |
### core
| Commit | Description |
| -- | -- |
| [25f763cff8](https://github.com/angular/angular/commit/25f763cff86b4b0ef49eb0105c2093c97c58b6fe) | feat(core): support TypeScript 4.3 ([#42022](https://github.com/angular/angular/pull/42022)) |
### forms
| Commit | Description |
| -- | -- |
| [47270d9e63](https://github.com/angular/angular/commit/47270d9e638260a08c0b11f9ac8cbcd02a49ac86) | feat(forms): add `ng-submitted` class to forms that have been submitted. ([#42132](https://github.com/angular/angular/pull/42132)) |
| [751cd83ae3](https://github.com/angular/angular/commit/751cd83ae3ee5c971f2d4b72af1aaa691305a866) | fix(forms): the `min` and `max` validators should work correctly with `0` as a value ([#42412](https://github.com/angular/angular/pull/42412)) |
### language-service
| Commit | Description |
| -- | -- |
| [a493ea9bcb](https://github.com/angular/angular/commit/a493ea9bcb2a1d94481d30e41db8b0bdf235ab42) | fix(language-service): fix autocomplete info display for some cases ([#42472](https://github.com/angular/angular/pull/42472)) |
| [fe22c2b0b6](https://github.com/angular/angular/commit/fe22c2b0b6852a4808d8f5477ec84df2c29a5103) | fix(language-service): Correct rename info for pipe name expressions ([#41974](https://github.com/angular/angular/pull/41974)) |
### router
| Commit | Description |
| -- | -- |
| [c44ab4f6da](https://github.com/angular/angular/commit/c44ab4f6dad7c326df73f8f1c780810e776ad671) | fix(router): fix `serializeQueryParams` logic ([#42481](https://github.com/angular/angular/pull/42481)) |
## Special Thanks:
Alex, Alex Inkin, Andrew Kushnir, Andrew Scott, Chris, David Shevitz, Dylan Hunn, George Kalpakas, Gourav102, Igor Minar, Jessica Janiuk, Joey Perrott, JoostK, Kapunahele Wong, Kristiyan Kostadinov, MarsiBarsi, MrJithil, Paul Gschwendtner, Pete Bacon Darwin, Renovate Bot, Sam Severance, Santosh Yadav, Teri Glover, Tiago Temporin, Vahid Mohammadi, anups1, cindygk, iRealNirmal, kuncevic and mgechev

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.0.4"></a>
# 12.0.4 (2021-06-09)
### common
| Commit | Description |
| -- | -- |
| [200cc31df4](https://github.com/angular/angular/commit/200cc31df4a194221694bd853265a05e870a246a) | fix(common): infer correct type when `trackBy` is used in `ngFor` ([#41995](https://github.com/angular/angular/pull/41995)) |
| [0dad375de7](https://github.com/angular/angular/commit/0dad375de77f56991a65ace9a9aad70fa814b29f) | fix(common): initialize currencyCode in currencyPipe ([#40505](https://github.com/angular/angular/pull/40505)) |
### compiler-cli
| Commit | Description |
| -- | -- |
| [b6d6a34eef](https://github.com/angular/angular/commit/b6d6a34eef9bd3c8434cde8dcee9dcbd47e753b6) | fix(compiler-cli): exclude type-only imports from cycle analysis ([#42453](https://github.com/angular/angular/pull/42453)) |
### forms
| Commit | Description |
| -- | -- |
| [50c87e86b6](https://github.com/angular/angular/commit/50c87e86b618b0f71dbd2ec4938415beb383f08b) | fix(forms): the `min` and `max` validators should work correctly with `0` as a value ([#42412](https://github.com/angular/angular/pull/42412)) |
### language-service
| Commit | Description |
| -- | -- |
| [34dd3c360b](https://github.com/angular/angular/commit/34dd3c360b9d585fd0286a5c766456470fe19dca) | fix(language-service): fix autocomplete info display for some cases ([#42472](https://github.com/angular/angular/pull/42472)) |
### router
| Commit | Description |
| -- | -- |
| [a77ec5bcab](https://github.com/angular/angular/commit/a77ec5bcab5307d426abc436714ea673a5880b3f) | fix(router): fix `serializeQueryParams` logic ([#42481](https://github.com/angular/angular/pull/42481)) |
## Special Thanks:
Alex, Alex Inkin, Andrew Kushnir, Andrew Scott, Chris, David Shevitz, George Kalpakas, Gourav102, Igor Minar, Joey Perrott, JoostK, Kapunahele Wong, Kristiyan Kostadinov, MarsiBarsi, MrJithil, Paul Gschwendtner, Pete Bacon Darwin, Sam Severance, Santosh Yadav, Teri Glover, Tiago Temporin, Vahid Mohammadi, anups1, cindygk, iRealNirmal, kuncevic and mgechev

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.1.0-next.4"></a>
# 12.1.0-next.4 (2021-06-02)
### compiler-cli
| Commit | Description |
| -- | -- |
| [e039075a28](https://github.com/angular/angular/commit/e039075a2837b0decf17cfbd5382d675c331bbeb) | fix(compiler-cli): better detect classes that are indirectly exported ([#42207](https://github.com/angular/angular/pull/42207)) |
## Special Thanks:
AleksanderBodurri, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, David Pfeiffer, David Shevitz, Doug Parker, Dylan Hunn, George Kalpakas, Igor Minar, Joey Perrott, JoostK, Kristiyan Kostadinov, Renovate Bot, Sam Severance, Serguei Cambour, Suguru Inatomi, Teri Glover, Wagner Maciel, Zach Arend, mgechev and 不肖・高橋

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.0.3"></a>
# 12.0.3 (2021-06-02)
### compiler-cli
| Commit | Description |
| -- | -- |
| [8bdcca1e08](https://github.com/angular/angular/commit/8bdcca1e08eaeb031a940f95e8afe91081cd2482) | fix(compiler-cli): better detect classes that are indirectly exported ([#42207](https://github.com/angular/angular/pull/42207)) |
## Special Thanks:
AleksanderBodurri, Alex Rickabaugh, Andrew Kushnir, Andrew Scott, David Pfeiffer, David Shevitz, Doug Parker, Dylan Hunn, George Kalpakas, Igor Minar, Joey Perrott, JoostK, Kristiyan Kostadinov, Sam Severance, Serguei Cambour, Suguru Inatomi, Teri Glover, Wagner Maciel, Zach Arend, mgechev and 不肖・高橋

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.0.2"></a>
# 12.0.2 (2021-05-26)
### forms
| Commit | Description |
| -- | -- |
| [19d7bf4162](https://github.com/angular/angular/commit/19d7bf4162fa111a35d0fd556c464521968881ea) | fix(forms): Add float number support for min and max validator ([#42223](https://github.com/angular/angular/pull/42223)) |
### migrations
| Commit | Description |
| -- | -- |
| [11c7bec065](https://github.com/angular/angular/commit/11c7bec065f505894e99a54031e3d82b6d84b9f8) | fix(migrations): add migration to replace `/deep/` with `::ng-deep` ([#42214](https://github.com/angular/angular/pull/42214)) |
### platform-browser
| Commit | Description |
| -- | -- |
| [84ab81c286](https://github.com/angular/angular/commit/84ab81c2863d3b2a3a0037913748a13011eeddc1) | fix(platform-browser): update started state on reset ([#41608](https://github.com/angular/angular/pull/41608)) |
## Special Thanks:
Alan Agius, Andrew Scott, David Shevitz, George Kalpakas, Igor Minar, Joey Perrott, Kapunahele Wong, Madleina Scheidegger, Paul Gschwendtner, Pete Bacon Darwin, Sam Severance, Teri Glover, Zach Arend, chenyunhsin, iRealNirmal, mgechev and twerske

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.1.0-next.3"></a>
# 12.1.0-next.3 (2021-05-26)
### forms
| Commit | Description |
| -- | -- |
| [3d9062dad7](https://github.com/angular/angular/commit/3d9062dad74c28e7c5b7849ae35dcb2e85ee7921) | fix(forms): Add float number support for min and max validator ([#42223](https://github.com/angular/angular/pull/42223)) |
### migrations
| Commit | Description |
| -- | -- |
| [7f6213a2f4](https://github.com/angular/angular/commit/7f6213a2f48caca4207b820d355bf9feb5d4e05c) | fix(migrations): add migration to replace `/deep/` with `::ng-deep` ([#42214](https://github.com/angular/angular/pull/42214)) |
### platform-browser
| Commit | Description |
| -- | -- |
| [3a6af8e629](https://github.com/angular/angular/commit/3a6af8e629ba03d1202053a0ee9150372bbeda49) | fix(platform-browser): update started state on reset ([#41608](https://github.com/angular/angular/pull/41608)) |
## Special Thanks:
Alan Agius, Andrew Scott, David Shevitz, George Kalpakas, Igor Minar, Joey Perrott, Kapunahele Wong, Madleina Scheidegger, Paul Gschwendtner, Pete Bacon Darwin, Renovate Bot, Sam Severance, Teri Glover, Zach Arend, chenyunhsin, iRealNirmal, mgechev and twerske

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.1.0-next.2"></a>
# 12.1.0-next.2 (2021-05-19)
### common
| Commit | Description |
| -- | -- |
| [4bc3cf216d](https://github.com/angular/angular/commit/4bc3cf216d0a4053e114157f3522c3b666788644) | feat(common): add URLSearchParams to request body ([#37852](https://github.com/angular/angular/pull/37852)) |
### language-service
| Commit | Description |
| -- | -- |
| [1be5d659a5](https://github.com/angular/angular/commit/1be5d659a51d10b05bee50bd5d7cd06070198c4c) | fix(language-service): fully de-duplicate reference and rename results ([#40523](https://github.com/angular/angular/pull/40523)) |
| [a86ca4fe04](https://github.com/angular/angular/commit/a86ca4fe049e68710b612a8e3323c256115a805e) | feat(language-service): Enable renaming of pipes ([#40523](https://github.com/angular/angular/pull/40523)) |
## Special Thanks:
Ajit Singh, Alan Agius, Alan Cohen, Alex Rickabaugh, Amadou Sall, Andrew J Asche, Andrew Kushnir, Andrew Scott, Aristeidis Bampakos, Ben Lesh, Bendik Skarpnes, Benjamin Kindle, Charles Lyding, Chau Tran, Cosmin Ababei, Daniel Díaz, David Shevitz, Dharmen Shah, Dmitrij Kuba, Dylan Hunn, Eduard Bondarenko, Emily Wenberg, Front-end developer, George Kalpakas, Georgii Dolzhykov, Gopal Jayaraman, Gourav102, Gérôme Grignon, Hugo Mejia, Igor Minar, Jesse Palmer, Jessica Janiuk, JiaLiPassion, Joey Perrott, JoostK, Julien Marcou, Kapunahele Wong, Keen Yee Liau, Kirk Larkin, Kristiyan Kostadinov, Lars Gyrup Brink Nielsen, Martin Sikora, Mathias Schäfer, Michael Hladky, Mikhail, Misko Hevery, MrJithil, Nishu Goel, Oluwole Majiyagbe, Paul Gschwendtner, Paul Muriel Biya-Bi, Pete Bacon Darwin, Pierre Portejoie, Richard Sithole, Sagar Pandita, Sam Severance, Sumit Arora, Talha Azhar, Teri Glover, Wojciech Okoński, Zach Arend, Zack DeRose, aschaap, cexbrayat, iRealNirmal, iron, jeripeierSBB, mgechev, nirmal bhagwani, pavlenko, profanis, rachid Oussanaa, sovtara, unknown, va-stefanek and wagnermaciel

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.0.1"></a>
# 12.0.1 (2021-05-19)
### benchpress
| Commit | Description |
| -- | -- |
| [28ee9864a4](https://github.com/angular/angular/commit/28ee9864a4e2f46fc95d4e2d7469b28f0cce0686) | fix(benchpress): update the check for start and end events ([#42085](https://github.com/angular/angular/pull/42085)) |
### compiler
| Commit | Description |
| -- | -- |
| [52c07e403e](https://github.com/angular/angular/commit/52c07e403ed49ac8fcedcd23fd0c4b385b614672) | fix(compiler): unclear lexer error when using private identifier in expressions ([#42027](https://github.com/angular/angular/pull/42027)) |
### core
| Commit | Description |
| -- | -- |
| [3a46ad96ea](https://github.com/angular/angular/commit/3a46ad96ea337e8b498e29d8364706e667089fde) | fix(core): global listeners not being bound on non-node host elements ([#42014](https://github.com/angular/angular/pull/42014)) |
### forms
| Commit | Description |
| -- | -- |
| [9b90c03a9f](https://github.com/angular/angular/commit/9b90c03a9f6931390d65c26a11d3cea94a9ce9d6) | fix(forms): registerOnValidatorChange should be called for ngModelGroup. ([#41971](https://github.com/angular/angular/pull/41971)) |
## Special Thanks:
Alex Rickabaugh, Daniel Díaz, David Shevitz, Dylan Hunn, Front-end developer, George Kalpakas, Joey Perrott, Kristiyan Kostadinov, Lars Gyrup Brink Nielsen, MrJithil, Paul Gschwendtner, Renovate Bot, Sam Severance, Sumit Arora, iRealNirmal, iron, mgechev, rachid Oussanaa and wagnermaciel

<!-- CHANGELOG SPLIT MARKER -->

<a name="12.0.0"></a>
# 12.0.0 (2021-05-12)

[Blog post "Angular v12 is now available"](https://blog.angular.io/angular-v12-is-now-available-32ed51fbfd49).


### Bug Fixes

* **animations:** ensure consistent transition namespace ordering ([#19854](https://github.com/angular/angular/issues/19854)) ([01cc995](https://github.com/angular/angular/commit/01cc99589bc449eaf3b1de2c94636de878843fba))
* **animations:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([e918250](https://github.com/angular/angular/commit/e918250a0624cff9bbbbdb016a069303a99fb8cc))
* **animations:** cleanup DOM elements when the root view is removed ([#41059](https://github.com/angular/angular/issues/41059)) ([c49b280](https://github.com/angular/angular/commit/c49b28013a6c017c9afc73bbc00bb4fdcf15c70e))
* **animations:** allow animations on elements in the shadow DOM ([#40134](https://github.com/angular/angular/issues/40134)) ([dad42c8](https://github.com/angular/angular/commit/dad42c8cd669357f9c862023abc5f4695863040d)), closes [#25672](https://github.com/angular/angular/issues/25672)
* **animations:** cleanup DOM elements when the root view is removed ([#41001](https://github.com/angular/angular/issues/41001)) ([a31da48](https://github.com/angular/angular/commit/a31da4850788800ba9735d617e7e3bb621a79c93))
* **bazel:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([8503246](https://github.com/angular/angular/commit/85032460f133162cc712ab3b9f04d42ff3b6d6d9))
* **bazel:** update build tooling for latest changes in rules_nodejs ([#40710](https://github.com/angular/angular/issues/40710)) ([696f7bc](https://github.com/angular/angular/commit/696f7bc))
* **bazel:** update integration test to use rules_nodejs@3.1.0 ([#40710](https://github.com/angular/angular/issues/40710)) ([34de89a](https://github.com/angular/angular/commit/34de89a))
* **bazel:** update type castings for JSON.parse usage ([#40710](https://github.com/angular/angular/issues/40710)) ([2c90391](https://github.com/angular/angular/commit/2c90391))
* **benchpress:** update type castings for JSON.parse usage ([#40710](https://github.com/angular/angular/issues/40710)) ([e721a5d](https://github.com/angular/angular/commit/e721a5d))
* **common:** add  right ContentType for boolean values with HttpClient request body([#38924](https://github.com/angular/angular/issues/38924)) ([#41885](https://github.com/angular/angular/issues/41885)) ([922a602](https://github.com/angular/angular/commit/922a60283183c47a268fd084302b2bc87267a73e))
* **common:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([f2b6fd8](https://github.com/angular/angular/commit/f2b6fd87056cf3159e8ecc275ce654e47fdfa6f0))
* **common:** viewport scroller not finding elements inside the shadow DOM ([#41644](https://github.com/angular/angular/issues/41644)) ([c0f5ba3](https://github.com/angular/angular/commit/c0f5ba3d36b2509a71d09c436d247211a58ee80d)), closes [#41470](https://github.com/angular/angular/issues/41470)
* **common:** temporarily re-export and deprecate `XhrFactory` ([#41393](https://github.com/angular/angular/issues/41393)) ([7dfa446](https://github.com/angular/angular/commit/7dfa446c4ace99f4b64069cf672dcaa3665a1f5b))
* **common:** cleanup location change listeners when the root view is removed ([#40867](https://github.com/angular/angular/issues/40867)) ([38524c4](https://github.com/angular/angular/commit/38524c4d29290d3339ad2d7335a0ea84f5701d26)), closes [#31546](https://github.com/angular/angular/issues/31546)
* **common:** allow number or boolean as http params ([#40663](https://github.com/angular/angular/issues/40663)) ([91cdc11](https://github.com/angular/angular/commit/91cdc11aa0347d1b71f2f732e00af9c3ff8078fc)), closes [#23856](https://github.com/angular/angular/issues/23856)
* **common:** avoid mutating context object in NgTemplateOutlet ([#40360](https://github.com/angular/angular/issues/40360)) ([d3705b3](https://github.com/angular/angular/commit/d3705b3284113f752ee05e9f0d2f6e75c723ea5b)), closes [#24515](https://github.com/angular/angular/issues/24515)
* **compiler:** preserve @page rules in encapsulated styles ([#41915](https://github.com/angular/angular/issues/41915)) ([3e365ba](https://github.com/angular/angular/commit/3e365ba81e313ee31af7a8e9042e33fc046067e0)), closes [#26269](https://github.com/angular/angular/issues/26269)
* **compiler:** strip scoped selectors from `@font-face` rules ([#41815](https://github.com/angular/angular/issues/41815)) ([2a11cda](https://github.com/angular/angular/commit/2a11cdab51a2d8d7f644ceca744568a1617f5242)), closes [#41751](https://github.com/angular/angular/issues/41751)
* **compiler:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([bae8126](https://github.com/angular/angular/commit/bae81269c7461063821be7beb66b516e5a8995ce))
* **compiler:** non-literal inline templates incorrectly processed in partial compilation ([#41583](https://github.com/angular/angular/issues/41583)) ([ab257b3](https://github.com/angular/angular/commit/ab257b370127dce70bd3ee7ad6d64d3a9ad5ae95))
* **compiler:** not generating update instructions for ng-template inside alternate namespaces ([#41669](https://github.com/angular/angular/issues/41669)) ([2bcbbda](https://github.com/angular/angular/commit/2bcbbda78913be014534fde72318ab09795350f9)), closes [#41308](https://github.com/angular/angular/issues/41308)
* **compiler:** avoid parsing EmptyExpr with a backwards span ([#41581](https://github.com/angular/angular/issues/41581)) ([e1a2930](https://github.com/angular/angular/commit/e1a29308933e99ee3e0d92aae42b33834f20f50a))
* **compiler:** handle case-sensitive CSS custom properties ([#41380](https://github.com/angular/angular/issues/41380)) ([e112e32](https://github.com/angular/angular/commit/e112e320bf6c2b60e8ecea46f80bcaec593c65b7)), closes [#41364](https://github.com/angular/angular/issues/41364)
* **compiler:** include used components during JIT compilation of partial component declaration ([#41353](https://github.com/angular/angular/issues/41353)) ([ff9470b](https://github.com/angular/angular/commit/ff9470b0a0196a3638f19028bba15e002cb0ff27)), closes [#41104](https://github.com/angular/angular/issues/41104) [#41318](https://github.com/angular/angular/issues/41318)
* **compiler:** support multiple `:host-context()` selectors ([#40494](https://github.com/angular/angular/issues/40494)) ([07b7af3](https://github.com/angular/angular/commit/07b7af3)), closes [#19199](https://github.com/angular/angular/issues/19199)
* **compiler:** update type castings for JSON.parse usage ([#40710](https://github.com/angular/angular/issues/40710)) ([f728490](https://github.com/angular/angular/commit/f728490))
* **compiler-cli:** use '' for the source map URL of indirect templates ([#41973](https://github.com/angular/angular/issues/41973)) ([7a4d980](https://github.com/angular/angular/commit/7a4d9805ea73d1b6a7659987da77d266d5e01b88)), closes [#40854](https://github.com/angular/angular/issues/40854)
* **compiler-cli:** expose the linker as a Babel plugin ([#41918](https://github.com/angular/angular/issues/41918)) ([8fdac8f](https://github.com/angular/angular/commit/8fdac8f4361fd4ac0f20c21c98289c19e8864347))
* **compiler-cli:** prefer non-aliased exports in reference emitters ([#41866](https://github.com/angular/angular/issues/41866)) ([75bb931](https://github.com/angular/angular/commit/75bb931889b946c243161a6ce0503bc7d08a6565)), closes [#41443](https://github.com/angular/angular/issues/41443) [#41277](https://github.com/angular/angular/issues/41277)
* **compiler-cli:** allow linker to process minified booleans ([#41747](https://github.com/angular/angular/issues/41747)) ([1fb6724](https://github.com/angular/angular/commit/1fb6724b1f66c4681ddb201bc9b5441d20f5b920)), closes [#41655](https://github.com/angular/angular/issues/41655)
* **compiler-cli:** match string indexed partial declarations ([#41747](https://github.com/angular/angular/issues/41747)) ([f885750](https://github.com/angular/angular/commit/f8857507642f5d12eebf4ef1ca68b63cc51f4f81)), closes [#41655](https://github.com/angular/angular/issues/41655)
* **compiler-cli:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([5b463f4](https://github.com/angular/angular/commit/5b463f4541946c795835c9d9cfd7a21e7b0caffc))
* **compiler-cli:** autocomplete literal types in templates. ([#41456](https://github.com/angular/angular/issues/41456)) ([#41645](https://github.com/angular/angular/issues/41645)) ([8b2b5ef](https://github.com/angular/angular/commit/8b2b5ef903a21b599dfc4bfe8b0c64f7c136c3a9))
* **compiler-cli:** do not error with prepocessing if component has no inline styles ([#41602](https://github.com/angular/angular/issues/41602)) ([a5fe8b9](https://github.com/angular/angular/commit/a5fe8b95893798467c4eea2b3d38d49f6d0ce1b3))
* **compiler-cli:** ensure the compiler tracks `ts.Program`s correctly ([#41291](https://github.com/angular/angular/issues/41291)) ([deacc74](https://github.com/angular/angular/commit/deacc741e0ee41666292d2e2c07812a78daf5d6f))
* **compiler-cli:** prevent eliding default imports in incremental recompilations ([#41557](https://github.com/angular/angular/issues/41557)) ([7f16515](https://github.com/angular/angular/commit/7f1651574ee95eaaa5f636fc37be7b07d1a808e5)), closes [#41377](https://github.com/angular/angular/issues/41377)
* **compiler-cli:** resolve `rootDirs` to absolute ([#41359](https://github.com/angular/angular/issues/41359)) ([3e0fda9](https://github.com/angular/angular/commit/3e0fda96b827e577cc300f46e8497cb6c810ad61)), closes [#36290](https://github.com/angular/angular/issues/36290)
* **compiler-cli:** add `useInlining` option to type check config ([#41043](https://github.com/angular/angular/issues/41043)) ([09aefd2](https://github.com/angular/angular/commit/09aefd29045db77689f4dc16a6abae09a79cfb81)), closes [#40963](https://github.com/angular/angular/issues/40963)
* **compiler-cli:** `readConfiguration` existing options should override options in tsconfig ([#40694](https://github.com/angular/angular/issues/40694)) ([b7c4d07](https://github.com/angular/angular/commit/b7c4d07e81277f7aed566e443d1d4e1395c5a2f4))
* **compiler-cli:** extend `angularCompilerOptions` in tsconfig from node ([#40694](https://github.com/angular/angular/issues/40694)) ([5eb1954](https://github.com/angular/angular/commit/5eb195416bf73f2fa59de52531724d8d19392975)), closes [#36715](https://github.com/angular/angular/issues/36715)
* **compiler-cli:** update ngcc integration tests for latest changes in rules_nodejs ([#40710](https://github.com/angular/angular/issues/40710)) ([d7f5755](https://github.com/angular/angular/commit/d7f5755))
* **compiler-cli:** update type castings for JSON.parse usage ([#40710](https://github.com/angular/angular/issues/40710)) ([b75d7cb](https://github.com/angular/angular/commit/b75d7cb))
* **core:** do not retain dynamically compiled components and modules ([#42003](https://github.com/angular/angular/issues/42003)) ([1449c5c](https://github.com/angular/angular/commit/1449c5c8ff3bf706c501130fe261627effe5d212)), closes [#19997](https://github.com/angular/angular/issues/19997)
* **core:** invoke profiler around ngOnDestroy lifecycle hooks ([#41969](https://github.com/angular/angular/issues/41969)) ([e9ddc57](https://github.com/angular/angular/commit/e9ddc57f948f0cb18e3e334aeb3084d1b49689b1))
* **core:** AsyncPipe now compatible with RxJS 7 ([#41590](https://github.com/angular/angular/issues/41590)) ([9759bca](https://github.com/angular/angular/commit/9759bca339b44ed78ec6aafab0336d531d285f90))
* **core:** handle multiple i18n attributes with expression bindings ([#41882](https://github.com/angular/angular/issues/41882)) ([73c6c64](https://github.com/angular/angular/commit/73c6c64f82d45c34203d4d18d759ad0c33a6b221)), closes [#41869](https://github.com/angular/angular/issues/41869)
* **core:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([f9c1f08](https://github.com/angular/angular/commit/f9c1f089573e0158eb5e4443658cfd25aeeeb091))
* **core:** detect synthesized constructors that have been downleveled using TS 4.2 ([#41305](https://github.com/angular/angular/issues/41305)) ([274dc15](https://github.com/angular/angular/commit/274dc15452739e4fab2f647804a64d5b797cfed5)), closes [#41298](https://github.com/angular/angular/issues/41298)
* **core:** Switch `emitDistinctChangesOnlyDefaultValue` to true ([#41121](https://github.com/angular/angular/issues/41121)) ([7096246](https://github.com/angular/angular/commit/70962465b5795f0a192f745016b1c461e7c8790b))
* **core:** remove duplicated EMPTY_OBJ constant ([#41066](https://github.com/angular/angular/issues/41066)) ([bf158e7](https://github.com/angular/angular/commit/bf158e7ff0715aabeae3c2c1ac923bf8cc7e4cfd))
* **core:** remove duplicated EMPTY_ARRAY constant ([#40991](https://github.com/angular/angular/issues/40991)) ([e12d9de](https://github.com/angular/angular/commit/e12d9dec64bc3d02e58f8f85a65a939394fb9531))
* **core:** allow EmbeddedViewRef context to be updated ([#40360](https://github.com/angular/angular/issues/40360)) ([a3e1719](https://github.com/angular/angular/commit/a3e17190e7e7e0329ed3643299c24d5fd510b7d6)), closes [#24515](https://github.com/angular/angular/issues/24515)
* **core:** make DefaultIterableDiffer keep the order of duplicates ([#23941](https://github.com/angular/angular/issues/23941)) ([a826926](https://github.com/angular/angular/commit/a826926)), closes [#23815](https://github.com/angular/angular/issues/23815)
* **core:** NgZone coaleascing options should trigger onStable correctly ([#40540](https://github.com/angular/angular/issues/40540)) ([22f9e45](https://github.com/angular/angular/commit/22f9e45))
* **elements:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([4f5d094](https://github.com/angular/angular/commit/4f5d094f3a385cdc6d93c7676457484e3d8b6b09))
* **elements:** update type castings for JSON.parse usage ([#40710](https://github.com/angular/angular/issues/40710)) ([efd4149](https://github.com/angular/angular/commit/efd4149))
* **forms:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([dc975ba](https://github.com/angular/angular/commit/dc975bac93a8087d1f31a31db60ef313147e589f))
* **http:** complete the request on timeout ([#39807](https://github.com/angular/angular/issues/39807)) ([61a0b6d](https://github.com/angular/angular/commit/61a0b6d)), closes [#26453](https://github.com/angular/angular/issues/26453)
* **http:** emit error on XMLHttpRequest abort event ([#40767](https://github.com/angular/angular/issues/40767)) ([3897265](https://github.com/angular/angular/commit/3897265)), closes [#22324](https://github.com/angular/angular/issues/22324)
* **language-service:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([9b6198c](https://github.com/angular/angular/commit/9b6198c16f122dd934ac6a66d2ada21df26839b5))
* **language-service:** use script versions for incremental compilations ([#41475](https://github.com/angular/angular/issues/41475)) ([78236bf](https://github.com/angular/angular/commit/78236bfdcaeb66c5846eb0435d727942bb88f7c5))
* **language-service:** Only provide Angular property completions in templates ([#41278](https://github.com/angular/angular/issues/41278)) ([0226a11](https://github.com/angular/angular/commit/0226a11c185da2d1e6f7833972d3f12205a6ae59))
* **language-service:** Add plugin option to force strictTemplates ([#41062](https://github.com/angular/angular/issues/41062)) ([e9e7c33](https://github.com/angular/angular/commit/e9e7c33f3c170648ec8c86d859980c7fe78fba39))
* **language-service:** use single entry point for Ivy and View Engine ([#40967](https://github.com/angular/angular/issues/40967)) ([e986a97](https://github.com/angular/angular/commit/e986a9787b7787c3cffef69d06a2e7e1228e3f40))
* **localize:** relax error to warning for missing target ([#41944](https://github.com/angular/angular/issues/41944)) ([35ceed2](https://github.com/angular/angular/commit/35ceed2061a890a70576dc7afa0b779f3779ae7b)), closes [#21690](https://github.com/angular/angular/issues/21690)
* **localize:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([658ed1f](https://github.com/angular/angular/commit/658ed1f904ef0013c3b08e2b2182cf246ef55b2b))
* **localize:** update type castings for JSON.parse usage ([#40710](https://github.com/angular/angular/issues/40710)) ([4b469c9](https://github.com/angular/angular/commit/4b469c9))
* **ngcc:** detect synthesized constructors that have been downleveled using TS 4.2 ([#41305](https://github.com/angular/angular/issues/41305)) ([8d3da56](https://github.com/angular/angular/commit/8d3da56eda12070df1fb473c8609f3a94d77bfd6)), closes [#41298](https://github.com/angular/angular/issues/41298)
* **platform-browser:** prevent memory leak of style nodes if shadow DOM encapsulation is used ([#42005](https://github.com/angular/angular/issues/42005)) ([d555555](https://github.com/angular/angular/commit/d5555558d00774520dbda40d48721bda2cb9dd1a)), closes [#36655](https://github.com/angular/angular/issues/36655)
* **platform-browser:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([ea05cfd](https://github.com/angular/angular/commit/ea05cfd0c5a99840f4522b604c33a5b2f7f25f7d))
* **platform-browser:** configure `XhrFactory` to use `BrowserXhr` ([#41313](https://github.com/angular/angular/issues/41313)) ([e0028e5](https://github.com/angular/angular/commit/e0028e57410281e190caa74e0986320f6591d27b)), closes [#41311](https://github.com/angular/angular/issues/41311)
* **platform-browser:** update type castings for JSON.parse usage ([#40710](https://github.com/angular/angular/issues/40710)) ([7ecfd2d](https://github.com/angular/angular/commit/7ecfd2d))
* **platform-browser-dynamic:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([bc45029](https://github.com/angular/angular/commit/bc45029a5437bcea45fa00549241685a1a3f32d0))
* **platform-server:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([4b9d4fa](https://github.com/angular/angular/commit/4b9d4fa3e729a3af13fb5b50de3e5c73c1d6923f))
* **router:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([0067edd](https://github.com/angular/angular/commit/0067edd1469a428c11bbe6358fd5650e79abf774))
* **router:** Only retrieve stored route when reuse strategy indicates it should reattach ([#30263](https://github.com/angular/angular/issues/30263)) ([a4ff071](https://github.com/angular/angular/commit/a4ff071e3f08e3de6d4d3f97c747c2f42b827c49)), closes [#23162](https://github.com/angular/angular/issues/23162)
* **router:** recursively merge empty path matches ([#41584](https://github.com/angular/angular/issues/41584)) ([1179dc8](https://github.com/angular/angular/commit/1179dc8cb32c9fc451d2af9215c4740af9d2e291)), closes [#41481](https://github.com/angular/angular/issues/41481)
* **router:** fragment can be null ([#37336](https://github.com/angular/angular/issues/37336)) ([b555160](https://github.com/angular/angular/commit/b5551609fe02787641bdfdb0a6edfded413a3b52)), closes [#23894](https://github.com/angular/angular/issues/23894) [#34197](https://github.com/angular/angular/issues/34197)
* **router:** update type castings for JSON.parse usage ([#40710](https://github.com/angular/angular/issues/40710)) ([350dada](https://github.com/angular/angular/commit/350dada))
* **service-worker:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([6b823d7](https://github.com/angular/angular/commit/6b823d7071d59234ab52bdf7eaa248df6b7d9faa))
* **service-worker:** update type castings for JSON.parse usage ([#40710](https://github.com/angular/angular/issues/40710)) ([4f7ff96](https://github.com/angular/angular/commit/4f7ff96))
* **upgrade:** preserve $interval flush when ngMocks is being used ([#30229](https://github.com/angular/angular/issues/30229)) ([87dc851](https://github.com/angular/angular/commit/87dc8511ccb9c75d78866ebd2c250ea96fc91bd0))
* **upgrade:** update supported range of node versions to only include LTS versions ([#41822](https://github.com/angular/angular/issues/41822)) ([10c4523](https://github.com/angular/angular/commit/10c45239a68e82ea52c1601fae09953aa7843351))


### Build System

* `ng_package` no longer generate minified UMDs ([#41425](https://github.com/angular/angular/issues/41425)) ([5a8bc1b](https://github.com/angular/angular/commit/5a8bc1bfe1c809705dfaa7e4723dd055308cd468))


### Features

* **animations:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([547363a](https://github.com/angular/angular/commit/547363a851567f66e9aee6c80f9e98c739889969))
* **animations:** add support for disabling animations through BrowserAnimationsModule.withConfig ([#40731](https://github.com/angular/angular/issues/40731)) ([29d8a0a](https://github.com/angular/angular/commit/29d8a0ab09a13600405343037079d151c3a04095))
* **bazel:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([d583d92](https://github.com/angular/angular/commit/d583d926db537cc74f9235cad51189dbe83fbb44))
* **common:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([e0250e5](https://github.com/angular/angular/commit/e0250e567ae47ed7b77e9d88a3289727c056a6f1))
* **common:** add `historyGo` method to `Location` service ([#38890](https://github.com/angular/angular/issues/38890)) ([e05a6f3](https://github.com/angular/angular/commit/e05a6f3bb3048e9a94a4b154526221dea290312d))
* **common:** support ICU standard "stand-alone day of week" with `DatePipe` ([#40766](https://github.com/angular/angular/issues/40766)) ([c56ecab](https://github.com/angular/angular/commit/c56ecab515c28d2ad45c630080bfbf549675528a)), closes [#26922](https://github.com/angular/angular/issues/26922)
* **common:** implement `appendAll()` method on `HttpParams` ([#20930](https://github.com/angular/angular/issues/20930)) ([575a2d1](https://github.com/angular/angular/commit/575a2d1)), closes [#20798](https://github.com/angular/angular/issues/20798)
* **compiler:** support nullish coalescing in templates ([#41437](https://github.com/angular/angular/issues/41437)) ([ec27bd4](https://github.com/angular/angular/commit/ec27bd4ed1cc086d76d8142fadf87354b38aa61a)), closes [#36528](https://github.com/angular/angular/issues/36528)
* **compiler:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([75cc813](https://github.com/angular/angular/commit/75cc8133ad8efd6453694f222e2cc6789c4de7b2))
* **compiler:** emit @__PURE__ or [@pure](https://github.com/pure)OrBreakMyCode annotations in the generated code ([#41096](https://github.com/angular/angular/issues/41096)) ([9c21028](https://github.com/angular/angular/commit/9c210281d4073289ff4633a866e395ca34e97ef9))
* **compiler-cli:** mark ability to use partial compilation mode as stable ([#41518](https://github.com/angular/angular/issues/41518)) ([6ba67c6](https://github.com/angular/angular/commit/6ba67c6fff52d5da443f36fa1bfe1cc1f0919c51)), closes [#41496](https://github.com/angular/angular/issues/41496)
* **compiler-cli:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([b7bd238](https://github.com/angular/angular/commit/b7bd23817ed81c7359c0559e825ca385975fcafd))
* **compiler-cli:** support transforming component style resources ([#41307](https://github.com/angular/angular/issues/41307)) ([1de04b1](https://github.com/angular/angular/commit/1de04b124e1e92ea21a070c9d928664f193d220c))
* **compiler-cli:** support producing Closure-specific PURE annotations ([#41021](https://github.com/angular/angular/issues/41021)) ([fbc9df1](https://github.com/angular/angular/commit/fbc9df181ea50527cb755382b54b8b45d0f9ef39))
* **core:** introduce getDirectiveMetadata global debugging utility ([#41525](https://github.com/angular/angular/issues/41525)) ([a07f303](https://github.com/angular/angular/commit/a07f30370848ecd051649a4862de39cf5bc2b541))
* **core:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([e66a5fb](https://github.com/angular/angular/commit/e66a5fbca687464421bf5e892ba16aa31448c2b9))
* **core:** support `forwardRef` in `providedIn` of `Injectable` declaration ([#41426](https://github.com/angular/angular/issues/41426)) ([f7c294e](https://github.com/angular/angular/commit/f7c294ee0f4131dae83d4b6a7fa4e497df84aa57)), closes [#41205](https://github.com/angular/angular/issues/41205)
* **core:** add migration for  `XhrFactory` import ([#41313](https://github.com/angular/angular/issues/41313)) ([95ff5ec](https://github.com/angular/angular/commit/95ff5ecb239d55a239113b0a2e1f7620f6e34676))
* **core:** drop support for TypeScript 4.0 and 4.1 ([#41158](https://github.com/angular/angular/issues/41158)) ([fa04894](https://github.com/angular/angular/commit/fa048948be75c30dafebda69efbeb81776460500))
* **core:** support TypeScript 4.2 ([#41158](https://github.com/angular/angular/issues/41158)) ([59ef409](https://github.com/angular/angular/commit/59ef40988e94f3173134368bc7d4e2726cdd8455))
* **core:** manually annotate de-sugarred core tree-shakable providers with [@pure](https://github.com/pure)OrBreakMyCode ([#41096](https://github.com/angular/angular/issues/41096)) ([03d47d5](https://github.com/angular/angular/commit/03d47d570167a5a70b17552ca2c8d531683d900f))
* **core:** more precise type for `APP_INITIALIZER` token ([#40986](https://github.com/angular/angular/issues/40986)) ([ca721c2](https://github.com/angular/angular/commit/ca721c2972f44d903a0e12fae3397ab62769e649)), closes [#40729](https://github.com/angular/angular/issues/40729)
* **core:** drop support for zone.js 0.10.x ([#40823](https://github.com/angular/angular/issues/40823)) ([aaf9b31](https://github.com/angular/angular/commit/aaf9b31fb472826c279a720cc875007987f9aa6f)), closes [angular/angular-cli#20034](https://github.com/angular/angular-cli/issues/20034)
* **core:** support APP_INITIALIZER work with observable ([#33222](https://github.com/angular/angular/issues/33222)) ([ca17ac5](https://github.com/angular/angular/commit/ca17ac523cc2ed8046931c86a2c12d97fb6796ca)), closes [#15088](https://github.com/angular/angular/issues/15088)
* **elements:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([12fc08b](https://github.com/angular/angular/commit/12fc08bf9c07f14fce1790e751bd3f6779ed55dd))
* **forms:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([a0006a6](https://github.com/angular/angular/commit/a0006a6bfb78e09d355baca63065958458b5d8cd))
* **forms:** add `emitEvent` option for AbstractControl-based class methods ([#31031](https://github.com/angular/angular/issues/31031)) ([4ec045e](https://github.com/angular/angular/commit/4ec045e12b7614b901d4ef643988b86f09dfeee5)), closes [#29662](https://github.com/angular/angular/issues/29662)
* **forms:** introduce min and max validators ([#39063](https://github.com/angular/angular/issues/39063)) ([8fb83ea](https://github.com/angular/angular/commit/8fb83ea)), closes [#16352](https://github.com/angular/angular/issues/16352)
* **http:** introduce HttpContext request context ([#25751](https://github.com/angular/angular/issues/25751)) ([1644d64](https://github.com/angular/angular/commit/1644d64398491d4a324a5eee492d1fd37df52a01))
* **http:** expose a list of human-readable http status codes ([#23548](https://github.com/angular/angular/issues/23548)) ([6fe3a1d](https://github.com/angular/angular/commit/6fe3a1d)), closes [#23543](https://github.com/angular/angular/issues/23543)
* **language-service:** implement signature help ([#41581](https://github.com/angular/angular/issues/41581)) ([c7f9516](https://github.com/angular/angular/commit/c7f9516ab920baee755d61ce0deea502e88a58ba))
* **language-service:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([86621be](https://github.com/angular/angular/commit/86621bec580f3234c39169606ef9853e7bca1f4b))
* **language-service:** add perf tracing to LanguageService ([#41319](https://github.com/angular/angular/issues/41319)) ([90f85da](https://github.com/angular/angular/commit/90f85da2de72f320653e6292968f70c87876bada))
* **language-service:** add command for getting components for a template file ([#40655](https://github.com/angular/angular/issues/40655)) ([5cde4ad](https://github.com/angular/angular/commit/5cde4ad))
* **language-service:** Add diagnostics to suggest turning on strict mode ([#40423](https://github.com/angular/angular/issues/40423)) ([ecae75f](https://github.com/angular/angular/commit/ecae75f))
* **language-service:** Implement `getRenameInfo` ([#40439](https://github.com/angular/angular/issues/40439)) ([4e8198d](https://github.com/angular/angular/commit/4e8198d))
* **language-service:** initial implementation for `findRenameLocations` ([#40140](https://github.com/angular/angular/issues/40140)) ([9a5ac47](https://github.com/angular/angular/commit/9a5ac47))
* **language-service:** view template typecheck block ([#39974](https://github.com/angular/angular/issues/39974)) ([d482f5c](https://github.com/angular/angular/commit/d482f5c))
* **localize:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([590d4dd](https://github.com/angular/angular/commit/590d4dd5789788a8bd073d495df13e27725c4488))
* **localize:** add scripts to migrate away from legacy message IDs ([#41026](https://github.com/angular/angular/issues/41026)) ([1735430](https://github.com/angular/angular/commit/17354304768f3c2b272c4c5d5636b5709287276f))
* **ngcc:** support `__read` helper as used by TypeScript 4.2 ([#41201](https://github.com/angular/angular/issues/41201)) ([66e9970](https://github.com/angular/angular/commit/66e997069102a12c607d830c7edf91cb202e5902))
* **ngcc:** support `__spreadArray` helper as used by TypeScript 4.2 ([#41201](https://github.com/angular/angular/issues/41201)) ([7b1214e](https://github.com/angular/angular/commit/7b1214eca2dd2f09e723a46bed857fcb7d40bc0b)) [#40394](https://github.com/angular/angular/issues/40394)
* **platform-browser:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([ef0d1c3](https://github.com/angular/angular/commit/ef0d1c354534f027837f95860955abd81f6c2bd7))
* **platform-browser-dynamic:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([b714f7b](https://github.com/angular/angular/commit/b714f7b93137ab9a064d5d93e4986025c08447db))
* **platform-server:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([c901b4d](https://github.com/angular/angular/commit/c901b4d11f9892b98d5df82d6f9cc0da54ae847f))
* **platform-server:** allow shimming the global env sooner ([#40559](https://github.com/angular/angular/issues/40559)) ([43ecf8a](https://github.com/angular/angular/commit/43ecf8a77bc7e92d3c635b450de904732e938e64)), closes [#24551](https://github.com/angular/angular/issues/24551) [#39950](https://github.com/angular/angular/issues/39950) [#39950](https://github.com/angular/angular/issues/39950)
* **router:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([c30b171](https://github.com/angular/angular/commit/c30b171d20474d29323beb7cc99dc69c22d0f7fd))
* **router:** add migration for ActivatedRouteSnapshot.fragment ([#41092](https://github.com/angular/angular/issues/41092)) ([190fa07](https://github.com/angular/angular/commit/190fa07b9a416defb581d2bf76d1deef7baefce6)), closes [#37336](https://github.com/angular/angular/issues/37336)
* **router:** Add more fine-tuned control in `routerLinkActiveOptions` ([#40303](https://github.com/angular/angular/issues/40303)) ([6c05c80](https://github.com/angular/angular/commit/6c05c80f19bc84189cc1d2f2e029f6f13d60dc18)), closes [#13205](https://github.com/angular/angular/issues/13205)
* **router:** Allow for custom router outlet implementations ([#40827](https://github.com/angular/angular/issues/40827)) ([a82fddf](https://github.com/angular/angular/commit/a82fddf1ce6166e0f697e429370eade114094670))
* **service-worker:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([fc597f1](https://github.com/angular/angular/commit/fc597f1db5d1774278803c24ecdd2bca387bf69b))
* **upgrade:** update supported range of node versions ([#41544](https://github.com/angular/angular/issues/41544)) ([beafa22](https://github.com/angular/angular/commit/beafa22de9aceadf0e6ba63d0124a2dab66ae6dd))


### Performance Improvements

* **common:** remove unused methods from DomAdapter ([#41102](https://github.com/angular/angular/issues/41102)) ([3c66b10](https://github.com/angular/angular/commit/3c66b100dd6f05f53740f596c5eadb999c27c9c4))
* **compiler:** reduce amount of generated code for safe accesses and nullish coalescing ([#41563](https://github.com/angular/angular/issues/41563)) ([9a3b82f](https://github.com/angular/angular/commit/9a3b82f19d26819c95c340d702c1c32787f2931e)), closes [#41437](https://github.com/angular/angular/issues/41437) [#41491](https://github.com/angular/angular/issues/41491)
* **compiler-cli:** allow incremental compilation in the presence of redirected source files ([#41448](https://github.com/angular/angular/issues/41448)) ([ffea31f](https://github.com/angular/angular/commit/ffea31f433c1f71b78a2245d52d2969503db1784))
* **compiler-cli:** cache results of `absoluteFromSourceFile` ([#41475](https://github.com/angular/angular/issues/41475)) ([fab1a64](https://github.com/angular/angular/commit/fab1a6468e53ab6c59e2c3aebb3ed1ecd1a6e5e8))
* **core:** minor improvements to listener instructions ([#41807](https://github.com/angular/angular/issues/41807)) ([9346d61](https://github.com/angular/angular/commit/9346d61d92c722175ca7673efe475e838546fef7))
* **core:** avoid storing LView in __ngContext__ ([#41358](https://github.com/angular/angular/issues/41358)) ([990067a](https://github.com/angular/angular/commit/990067a0c6df8e97c5bbffec00a76f13c4d4c903)), closes [#41047](https://github.com/angular/angular/issues/41047)
* **core:** optimize getDirectives ([#41525](https://github.com/angular/angular/issues/41525)) ([f7e391a](https://github.com/angular/angular/commit/f7e391a912153d1ce43f9d0cf06d23121d1d49cd))


### BREAKING CHANGES

* Minified UMD bundles are no longer included in the distributed NPM packages.
* **animations:** DOM elements are now correctly removed when the root view is removed.
If you are using SSR and use the app's HTML for rendering, you will need
to ensure that you save the HTML to a variable before destorying the
app.
It is also possible that tests could be accidentally relying on the old behavior by
trying to find an element that was not removed in a previous test. If
this is the case, the failing tests should be updated to ensure they
have proper setup code which initializes elements they rely on.
* **common:** Methods of the `PlatformLocation` class, namely `onPopState` and `onHashChange`,
used to return `void`. Now those methods return functions that can be called
to remove event handlers.
* **common:** The methods of the `HttpParams` class now accept `string | number | boolean`
instead of `string` for the value of a parameter.
If you extended this class in your application,
you'll have to update the signatures of your methods to reflect these changes.
* **compiler-cli:** Linked libraries no longer generate legacy i18n message ids. Any downstream
application that provides translations for these messages, will need to
migrate their message ids using the `localize-migrate` command line tool.
* **core:** Angular no longer maintains support for node v10
* **core:** Previously the `ng.getDirectives` function threw an error in case a
given DOM node had no Angular context associated with it (for example
if a function was called for a DOM element outside an Angular app).
This behavior was inconsistent with other debugging utilities under `ng`
namespace, which handled this situation without raising an exception.
Now calling the `ng.getDirectives` function for such DOM nodes would
result in an empty array returned from that function.
* **core:** Switching default of `emitDistinctChangesOnlyDefaultValue`
which changes the default behavior and may cause some applications which
rely on the incorrect behavior to fail.

`emitDistinctChangesOnly` flag has also been deprecated and will be
removed in a future major release.

The previous implementation would fire changes `QueryList.changes.subscribe`
whenever the `QueryList` was recomputed. This resulted in an artificially
high number of change notifications, as it is possible that recomputing
`QueryList` results in the same list. When the `QueryList` gets recomputed
is an implementation detail, and it should not be the thing that determines
how often change event should fire.

Unfortunately, fixing the behavior outright caused too many existing
applications to fail. For this reason, Angular considers this fix a
breaking fix and has introduced a flag in `@ContentChildren` and
`@ViewChildren`, that controls the behavior.

```
export class QueryCompWithStrictChangeEmitParent {
  @ContentChildren('foo', {
    // This option is the new default with this change.
    emitDistinctChangesOnly: true,
  })
  foos!: QueryList<any>;
}
```
For backward compatibility before v12
`emitDistinctChangesOnlyDefaultValue` was set to `false`. This change the default to `true`.
* **core:** The type of the `APP_INITIALIZER` token has been changed to more accurately
reflect the types of return values that are handled by Angular. Previously,
each initializer callback was typed to return `any`, this is now
`Promise<unknown> | Observable<unknown> | void`. In the unlikely event that
your application uses the `Injector.get` or `TestBed.inject` API to inject
the `APP_INITIALIZER` token, you may need to update the code to account for
the stricter type.

Additionally, TypeScript may report the TS2742 error if the `APP_INITIALIZER`
token is used in an expression of which its inferred type has to be emitted
into a .d.ts file. To work around this, an explicit type annotation is needed,
which would typically be `Provider` or `Provider[]`.
* **core:** Minimum supported `zone.js` version is `0.11.4`
* **forms:** The `emitEvent` option was added to the following `FormArray` and `FormGroup` methods:

* FormGroup.addControl
* FormGroup.removeControl
* FormGroup.setControl
* FormArray.push
* FormArray.insert
* FormArray.removeAt
* FormArray.setControl
* FormArray.clear

If your app has custom classes that extend `FormArray` or `FormGroup` classes and override the
above-mentioned methods, you may need to update your implementation to take the new options into
account and make sure that overrides are compatible from a types perspective.
* **forms:** Previously `min` and `max` attributes defined on the `<input type="number">`
were ignored by Forms module. Now presence of these attributes would
trigger min/max validation logic (in case `formControl`, `formControlName`
or `ngModel` directives are also present on a given input) and
corresponding form control status would reflect that.
* **platform-browser:** `XhrFactory` has been moved from `@angular/common/http` to `@angular/common`.

**Before**
```ts
import {XhrFactory} from '@angular/common/http';
```

**After**
```ts
import {XhrFactory} from '@angular/common';
```

* **router:** Strict null checks will report on fragment potentially being null.
Migration path: add null check.
* **router:** The type of the `RouterLinkActive.routerLinkActiveOptions` input was
expanded to allow more fine-tuned control. Code that previously read
this property may need to be updated to account for the new type.

<!-- CHANGELOG SPLIT MARKER -->

<a name="11.2.14"></a>
# 11.2.14 (2021-05-12)
### core
| Commit | Description |
| -- | -- |
| 5bb7c0ef3a | fix(core): do not retain dynamically compiled components and modules (#42003) |
| 40cc29aa6e | fix(core): invoke profiler around ngOnDestroy lifecycle hooks (#41969) |
### platform-browser
| Commit | Description |
| -- | -- |
| f66c9ae749 | fix(platform-browser): prevent memory leak of style nodes if shadow DOM encapsulation is used (#42005) |
## Special Thanks:
Alex Rickabaugh, Andrew J Asche, Georgii Dolzhykov, Joey Perrott, Joost Koehoorn, Julien Marcou, Kapunahele Wong, Pete Bacon Darwin, Richard Sithole, Teri Glover, iRealNirmal, Minko Gechev, profanis and va-stefanek



# 12.1.0-next.1 (2021-05-05)


### Bug Fixes

* **common:** add body as an optional property on the options of HttpClient.delete ([#19438](https://github.com/angular/angular/issues/19438)) ([#41723](https://github.com/angular/angular/issues/41723)) ([6b8baad](https://github.com/angular/angular/commit/6b8baad94096225837dddc6ccf0826c59582d467))
* **compiler-cli:** expose the linker as a Babel plugin ([#41918](https://github.com/angular/angular/issues/41918)) ([6eafaa7](https://github.com/angular/angular/commit/6eafaa7b5e2b85e53b4213f9f7756474609a0fa3))
* **compiler-cli:** prefer non-aliased exports in reference emitters ([#41866](https://github.com/angular/angular/issues/41866)) ([35450c7](https://github.com/angular/angular/commit/35450c78f7908d43c1d7d8598c915a8c86a28d2e)), closes [#41443](https://github.com/angular/angular/issues/41443) [#41277](https://github.com/angular/angular/issues/41277)
* **core:** handle multiple i18n attributes with expression bindings ([#41882](https://github.com/angular/angular/issues/41882)) ([9b4b281](https://github.com/angular/angular/commit/9b4b281c5223084834019664fbe5248521caadae)), closes [#41869](https://github.com/angular/angular/issues/41869)


### Features

* **compiler:** support directive selectors with attributes containing `$` ([#41567](https://github.com/angular/angular/issues/41567)) ([1758d02](https://github.com/angular/angular/commit/1758d0297267a8d46042d2f926eebb2263a345e5)), closes [#41244](https://github.com/angular/angular/issues/41244) [#41500](https://github.com/angular/angular/issues/41500) [#41500](https://github.com/angular/angular/issues/41500)


### Performance Improvements

* **core:** minor improvements to listener instructions ([#41807](https://github.com/angular/angular/issues/41807)) ([6581a1b](https://github.com/angular/angular/commit/6581a1b48dc6a3ddb6d371d26d765aaa0f0b04c1))


### BREAKING CHANGES

* Minified UMD bundles are no longer included in the distributed NPM packages.
* **core:** Angular no longer maintains support for node v10
* **core:** Previously the `ng.getDirectives` function threw an error in case a
given DOM node had no Angular context associated with it (for example
if a function was called for a DOM element outside an Angular app).
This behavior was inconsistent with other debugging utilities under `ng`
namespace, which handled this situation without raising an exception.
Now calling the `ng.getDirectives` function for such DOM nodes would
result in an empty array returned from that function.
* **compiler-cli:** Linked libraries no longer generate legacy i18n message ids. Any downstream
application that provides translations for these messages, will need to
migrate their message ids using the `localize-migrate` command line tool.



## 11.2.13 (2021-05-05)


### Bug Fixes

* **animations:** ensure consistent transition namespace ordering ([#19854](https://github.com/angular/angular/issues/19854)) ([a58562a](https://github.com/angular/angular/commit/a58562a515492f827e5215bca184a332a68fb538))
* **common:** add  right ContentType for boolean values with HttpClient request body([#38924](https://github.com/angular/angular/issues/38924)) ([#41885](https://github.com/angular/angular/issues/41885)) ([ae0fa08](https://github.com/angular/angular/commit/ae0fa0885eb0dd91b3ce77d2a7d948aa64ca41f0))
* **core:** AsyncPipe now compatible with RxJS 7 ([#41590](https://github.com/angular/angular/issues/41590)) ([7a86ebf](https://github.com/angular/angular/commit/7a86ebfcf6d0a2beb66ae628e58ef0741d624e11))
* **core:** handle multiple i18n attributes with expression bindings ([#41912](https://github.com/angular/angular/issues/41912)) ([345f5c4](https://github.com/angular/angular/commit/345f5c487aad26551cd510f13223a71ceae3f634)), closes [#41869](https://github.com/angular/angular/issues/41869)
* **localize:** relax error to warning for missing target ([#41944](https://github.com/angular/angular/issues/41944)) ([3150f9f](https://github.com/angular/angular/commit/3150f9f66db3d3bd81425341dd5921c6f42324e6)), closes [#21690](https://github.com/angular/angular/issues/21690)



## 11.2.12 (2021-04-28)


### Bug Fixes

* **compiler:** strip scoped selectors from `[@font-face](https://github.com/font-face)` rules ([#41815](https://github.com/angular/angular/issues/41815)) ([de39b49](https://github.com/angular/angular/commit/de39b49c6d8f95ab96feeecc7b8867cf3b4c0ea4)), closes [#41751](https://github.com/angular/angular/issues/41751)
* **upgrade:** preserve $interval.flush when ngMocks is being used ([#30229](https://github.com/angular/angular/issues/30229)) ([dd46b87](https://github.com/angular/angular/commit/dd46b87bc7c2bb47ef1c57f0de2598cdd6f537e6))



## 11.2.11 (2021-04-21)


### Bug Fixes

* **common:** viewport scroller not finding elements inside the shadow DOM ([#41644](https://github.com/angular/angular/issues/41644)) ([3aa9235](https://github.com/angular/angular/commit/3aa92355ef730e19d8c7b555a35c3e68b76e37ba)), closes [#41470](https://github.com/angular/angular/issues/41470)
* **compiler-cli:** autocomplete literal types in templates ([296f887](https://github.com/angular/angular/commit/296f8873832a369f3c512fcba3215a6fcdb71e66))
* **router:** Only retrieve stored route when reuse strategy indicates it should reattach ([#30263](https://github.com/angular/angular/issues/30263)) ([f4376fc](https://github.com/angular/angular/commit/f4376fc0d45f1658555c5ac29c3dee93bdfb43fc)), closes  [#23162](https://github.com/angular/angular/issues/23162)
* **router:** recursively merge empty path matches ([#41584](https://github.com/angular/angular/issues/41584)) ([8d62813](https://github.com/angular/angular/commit/8d6281311c8c21d4f113fdfdd8e5736e297ec184)), closes [#41481](https://github.com/angular/angular/issues/41481)



## 11.2.10 (2021-04-14)


### Bug Fixes

* **compiler-cli:** prevent eliding default imports in incremental recompilations ([#41586](https://github.com/angular/angular/issues/41586)) ([43050a1](https://github.com/angular/angular/commit/43050a16de1dfcf8090461d9bc8d9804a98d3403)), closes [#41377](https://github.com/angular/angular/issues/41377)
* **compiler-cli:** show a more specific error for Ivy NgModules ([#41534](https://github.com/angular/angular/issues/41534)) ([09eb125](https://github.com/angular/angular/commit/09eb1257d86061a26551d11efc042ba864b343d3))
* **core:** error if DebugRenderer2.destroyNode is called twice in a row ([#41565](https://github.com/angular/angular/issues/41565)) ([419c189](https://github.com/angular/angular/commit/419c189ad3620cbe02e1927875ca7fa72a46627f))
* **language-service:** bound attributes should not break directive matching ([#41597](https://github.com/angular/angular/issues/41597)) ([3dbcc7f](https://github.com/angular/angular/commit/3dbcc7f7a1f011f007c6b5abc2aff228bffba9b6)), closes [/github.com/angular/angular/blob/cdf1ea1951fb7187b1f6c9bb8a847c859c41e0b8/packages/compiler/src/render3/view/util.ts#L174-L206](https://github.com//github.com/angular/angular/blob/cdf1ea1951fb7187b1f6c9bb8a847c859c41e0b8/packages/compiler/src/render3/view/util.ts/issues/L174-L206)
* **language-service:** resolve to the pre-compiled style when compiled css url is provided ([#41538](https://github.com/angular/angular/issues/41538)) ([3d54980](https://github.com/angular/angular/commit/3d549809c3c8659197f323fc78a9fb3756e9969e)), closes [angular/vscode-ng-language-service#1263](https://github.com/angular/vscode-ng-language-service/issues/1263)
* **language-service:** use 'any' instead of failing for inline TCBs ([#41513](https://github.com/angular/angular/issues/41513)) ([f76873e](https://github.com/angular/angular/commit/f76873e4d5aefe9276873ee0270c331561329d9c)), closes [#41395](https://github.com/angular/angular/issues/41395)
* **router:** handle new navigations from a NavigationEnd event ([#41262](https://github.com/angular/angular/issues/41262)) ([#41511](https://github.com/angular/angular/issues/41511)) ([e34299a](https://github.com/angular/angular/commit/e34299af256326366ef2176bd905d9a64158f2df)), closes [#37460](https://github.com/angular/angular/issues/37460)
* **router:** Remove information about attached component when deactivating route ([#41381](https://github.com/angular/angular/issues/41381)) ([646f4a1](https://github.com/angular/angular/commit/646f4a1fe6057b0c70d61a20f3aecf28e71654da)), closes [#41379](https://github.com/angular/angular/issues/41379)


### Performance Improvements

* **compiler-cli:** allow incremental compilation in the presence of redirected source files ([#41587](https://github.com/angular/angular/issues/41587)) ([616145e](https://github.com/angular/angular/commit/616145e1a7aa594a26345ac0af909ecbacbe7b70))



## 11.2.9 (2021-04-07)


### Bug Fixes

* **bazel:** add missing dependency on `tslib` ([#41480](https://github.com/angular/angular/issues/41480)) ([8d005e5](https://github.com/angular/angular/commit/8d005e51322b68bb66ff311fc78fa34dd440b123)), closes [11.2.8/src/api-extractor/index.js#L20](https://github.com/11.2.8/src/api-extractor/index.js/issues/L20)
* **compiler-cli:** Allow analysis to continue with invalid style url ([#41403](https://github.com/angular/angular/issues/41403)) ([#41489](https://github.com/angular/angular/issues/41489)) ([07131fa](https://github.com/angular/angular/commit/07131fa8ef9f9e6930cf297c27e450c15fb4f10b))
* **compiler-cli:** fix extending angularCompilerOptions from non relative extension less TypeScript configuration files ([#41349](https://github.com/angular/angular/issues/41349)) ([e0165fd](https://github.com/angular/angular/commit/e0165fd7f8374694c1f9d74ecdea5af4f8bba4c7)), closes [#41343](https://github.com/angular/angular/issues/41343)


### Features

* **bazel:** allow setting `compilationMode` in `ng_module` rule ([#41418](https://github.com/angular/angular/issues/41418)) ([e6da38a](https://github.com/angular/angular/commit/e6da38a5e017bbb2e52857472363b5ab2cd84281))


### Performance Improvements

* **core:** add private hooks around user code executed by the runtime ([#41421](https://github.com/angular/angular/issues/41421)) ([94af9d9](https://github.com/angular/angular/commit/94af9d95bbde5d068e89d6697d87851dc246a88f))
* **language-service:** add perf tracing to LanguageService ([#41401](https://github.com/angular/angular/issues/41401)) ([7b0a800](https://github.com/angular/angular/commit/7b0a800b69170c6d32cc49dbc8961b2e2821fe40))



## 11.2.8 (2021-04-01)


### Bug Fixes

* **compiler:** handle case-sensitive CSS custom properties ([#41380](https://github.com/angular/angular/issues/41380)) ([f9da272](https://github.com/angular/angular/commit/f9da27214b74d60d398cf46493767711e710635c)), closes [#41364](https://github.com/angular/angular/issues/41364)



## 11.2.7 (2021-03-24)


### Bug Fixes

* **compiler:** correctly process multiple rules containing `:host` selectors ([#41261](https://github.com/angular/angular/issues/41261)) ([f358d6b](https://github.com/angular/angular/commit/f358d6b113e1a8215fcb50dbc3c5db8799699901)), closes [#41237](https://github.com/angular/angular/issues/41237)
* **compiler-cli:** add `useInlining` option to type check config ([#41268](https://github.com/angular/angular/issues/41268)) ([57644e9](https://github.com/angular/angular/commit/57644e95aadbfe9c8f336be77a22f7a5e1859758)), closes [#40963](https://github.com/angular/angular/issues/40963)
* **core:** remove obsolete check for [class] and [className] presence ([#41254](https://github.com/angular/angular/issues/41254)) ([8a53b54](https://github.com/angular/angular/commit/8a53b5454eea7b4db09498d9018687aa0b0ca7f3))
* **language-service:** show suggestion when type inference is suboptimal ([#41072](https://github.com/angular/angular/issues/41072)) ([18cd7a0](https://github.com/angular/angular/commit/18cd7a0c6921983556fe1fffbff93d42ae138007)), closes [angular/vscode-ng-language-service#1155](https://github.com/angular/vscode-ng-language-service/issues/1155) [#41042](https://github.com/angular/angular/issues/41042)



## 11.2.6 (2021-03-17)


### Bug Fixes

* **core:** remove duplicated EMPTY_OBJ constant ([#41153](https://github.com/angular/angular/issues/41153)) ([fa97166](https://github.com/angular/angular/commit/fa97166361b17802f8d1771e18b47ac55a117a53))
* **forms:** properly handle the change to the FormGroup shape ([#40829](https://github.com/angular/angular/issues/40829)) ([60ac964](https://github.com/angular/angular/commit/60ac9643334b83b6b720afd1b7d7fadf02c4e7fc)), closes [#13788](https://github.com/angular/angular/issues/13788)
* **localize:** render correct closing tag placeholder names in XLIFF 2 ([#41152](https://github.com/angular/angular/issues/41152)) ([7dbb550](https://github.com/angular/angular/commit/7dbb550946031d212b334b9e805e198232bc933b)), closes [#41142](https://github.com/angular/angular/issues/41142)
* **localize:** trim extracted `equiv-text` values ([#41180](https://github.com/angular/angular/issues/41180)) ([ed6c09a](https://github.com/angular/angular/commit/ed6c09ae45faa598b505c68bd68fe0d1ba3300c4)), closes [#41176](https://github.com/angular/angular/issues/41176)
* **ngcc:** do not compile JavaScript sources if typings-only processing is repeated ([#41209](https://github.com/angular/angular/issues/41209)) ([be050b2](https://github.com/angular/angular/commit/be050b2582eed2ad036fb4dd679926a146e17264)), closes [#41198](https://github.com/angular/angular/issues/41198)


### Performance Improvements

* **forms:** avoid direct references to the `Validators` class ([#41189](https://github.com/angular/angular/issues/41189)) ([#41220](https://github.com/angular/angular/issues/41220)) ([804b6b6](https://github.com/angular/angular/commit/804b6b66853aa53f446b3e9c3cb921ae8cb794c2))
* **forms:** make `FormBuilder` class tree-shakable ([#41126](https://github.com/angular/angular/issues/41126)) ([ffc93e0](https://github.com/angular/angular/commit/ffc93e0946dc7c5a2a64a25a97dbae551b3ffbec))
* **forms:** make `RadioControlRegistry` class tree-shakable ([#41126](https://github.com/angular/angular/issues/41126)) ([6414590](https://github.com/angular/angular/commit/6414590f8d09d5d33a9022b023e025fc1452f5b5))
* **forms:** make built-in ControlValueAccessors more tree-shakable ([#41146](https://github.com/angular/angular/issues/41146)) ([#41197](https://github.com/angular/angular/issues/41197)) ([5908eda](https://github.com/angular/angular/commit/5908eda7c11ebff169d07598e54f62d7e35f6580))



## 11.2.5 (2021-03-10)


### Bug Fixes

* **bazel:** fix incorrect rollup plugin method signature ([#41101](https://github.com/angular/angular/issues/41101)) ([925746b](https://github.com/angular/angular/commit/925746b6d8a84ce7281e9044f88bb1146dc1cd44))
* **language-service:** Only provide dom completions for inline templates ([#41078](https://github.com/angular/angular/issues/41078)) ([a05eb13](https://github.com/angular/angular/commit/a05eb13caa546e23caa2dee37435e549059d17c3))


### Performance Improvements

* **compiler-cli:** avoid module resolution in cycle analysis ([#40948](https://github.com/angular/angular/issues/40948)) ([532ae73](https://github.com/angular/angular/commit/532ae73738ded1764209072c4c1b17553d18f009))
* **compiler-cli:** detect semantic changes and their effect on an incremental rebuild ([#40947](https://github.com/angular/angular/issues/40947)) ([e35ecea](https://github.com/angular/angular/commit/e35eceabac6aef10a0505bcb08572ab0bafa70da)), closes [#34867](https://github.com/angular/angular/issues/34867) [#40635](https://github.com/angular/angular/issues/40635) [#40728](https://github.com/angular/angular/issues/40728)
* **compiler-cli:** ensure module resolution cache is reused for type-check program ([#39693](https://github.com/angular/angular/issues/39693)) ([16f90ca](https://github.com/angular/angular/commit/16f90cac4b78d8a9207ecbbcf515518bc01cb7b2))
* **compiler-cli:** use bound symbol in import graph in favor of module resolution ([#40948](https://github.com/angular/angular/issues/40948)) ([2035b15](https://github.com/angular/angular/commit/2035b15d7a35418ead6347c4e2cc0d9816a643d9))



## 11.2.4 (2021-03-03)


### Bug Fixes

* **compiler:** allow binding to autocomplete property on select and textarea elements ([#40928](https://github.com/angular/angular/issues/40928)) ([20fb638](https://github.com/angular/angular/commit/20fb63812ce4d750fe5d71fe7aa70ed5ac9b07c7)), closes [#39490](https://github.com/angular/angular/issues/39490)
* **compiler:** ensure JIT compilation of ɵɵngDeclarePipe() works ([#40929](https://github.com/angular/angular/issues/40929)) ([55eb7b5](https://github.com/angular/angular/commit/55eb7b5681ef4ef921dc690a2a1f0621aaf56e4e))
* **compiler:** recover from an incomplete open tag at the end of a file ([#41054](https://github.com/angular/angular/issues/41054)) ([c675acd](https://github.com/angular/angular/commit/c675acda7f42dba4709d1a7a898313f86ae7ad8e))
* **compiler-cli:** `readConfiguration` existing options should override options in tsconfig ([#40694](https://github.com/angular/angular/issues/40694)) ([#41036](https://github.com/angular/angular/issues/41036)) ([2f3e2df](https://github.com/angular/angular/commit/2f3e2dff33c298cf5824372fe85c1de781c6f1af))
* **compiler-cli:** ensure ngcc can handle wildcard base-paths ([#41033](https://github.com/angular/angular/issues/41033)) ([27d55f6](https://github.com/angular/angular/commit/27d55f6730b923f789798639f8def7f3ce8ad5f4)), closes [#41014](https://github.com/angular/angular/issues/41014)
* **compiler-cli:** extend `angularCompilerOptions` in tsconfig from node ([#40694](https://github.com/angular/angular/issues/40694)) ([#41036](https://github.com/angular/angular/issues/41036)) ([e3ccd56](https://github.com/angular/angular/commit/e3ccd56567fdc7ca00f3a0c7c7e5033b2bece865)), closes [/github.com/microsoft/TypeScript/blob/b346f5764e4d500ebdeff7086e43690ea533a305/src/compiler/commandLineParser.ts#L2603-L2628](https://github.com//github.com/microsoft/TypeScript/blob/b346f5764e4d500ebdeff7086e43690ea533a305/src/compiler/commandLineParser.ts/issues/L2603-L2628) [#36715](https://github.com/angular/angular/issues/36715)
* **language-service:** Add plugin option to force strictTemplates ([#41063](https://github.com/angular/angular/issues/41063)) ([95f748c](https://github.com/angular/angular/commit/95f748c238490edb983df80c8fd2b67f0c6ef24f))
* **language-service:** Always attempt HTML AST to template AST conversion for LS ([#41068](https://github.com/angular/angular/issues/41068)) ([6dd5497](https://github.com/angular/angular/commit/6dd54972d4efa968b84ecf71ac2b306d500a2ed7)), closes [angular/vscode-ng-language-service#1140](https://github.com/angular/vscode-ng-language-service/issues/1140)
* **language-service:** can't provide the Input and Output custom binding property name ([#41005](https://github.com/angular/angular/issues/41005)) ([1b1b65e](https://github.com/angular/angular/commit/1b1b65e1ea4c0b2cde6a267db2ef070395cc09d8))
* **language-service:** don't show external template diagnostics in ts files ([#41070](https://github.com/angular/angular/issues/41070)) ([9322e6a](https://github.com/angular/angular/commit/9322e6a076228cc5ea212f3cbe3bbdb6bb8cea82)), closes [#41032](https://github.com/angular/angular/issues/41032)
* **language-service:** only provide template results on reference requests ([#41041](https://github.com/angular/angular/issues/41041)) ([ef87953](https://github.com/angular/angular/commit/ef87953bc62d43254e3a532b2fe8f16e186f2612))
* **language-service:** provide element completions after open tag < ([#41068](https://github.com/angular/angular/issues/41068)) ([f09e7ab](https://github.com/angular/angular/commit/f09e7abdf0625a565bd890b5aa38274b59d58161)), closes [angular/vscode-ng-language-service#1140](https://github.com/angular/vscode-ng-language-service/issues/1140)
* **ngcc:** do not fail hard when a format-path points to a non-existing or empty file ([#40985](https://github.com/angular/angular/issues/40985)) ([06ff277](https://github.com/angular/angular/commit/06ff277b605760fc0c43346f4997fc5fdfa2ee24)), closes [/github.com/angular/angular/blob/3077c9a1f89c5bd75fb96c16e/packages/compiler-cli/ngcc/src/main.ts#L124](https://github.com//github.com/angular/angular/blob/3077c9a1f89c5bd75fb96c16e/packages/compiler-cli/ngcc/src/main.ts/issues/L124) [#40965](https://github.com/angular/angular/issues/40965)



## 11.2.3 (2021-02-24)


### Performance Improvements

* **language-service:** Skip Angular analysis when quick info requested outside a template ([#40956](https://github.com/angular/angular/issues/40956)) ([0dd1fac](https://github.com/angular/angular/commit/0dd1facc3292aec6b0ca6fd65fc73efae2c194fc))



## 11.2.2 (2021-02-22)


### Bug Fixes

* **animations:** error when setting position before starting animation ([#28255](https://github.com/angular/angular/issues/28255)) ([f1c64b3](https://github.com/angular/angular/commit/f1c64b3f38ed38c2d0c7369f6ee5dea5bbc24cf3))
* **http:** emit error on XMLHttpRequest abort event ([#40786](https://github.com/angular/angular/issues/40786)) ([4a32579](https://github.com/angular/angular/commit/4a32579a4d660b774c380314033e15787dfe4631)), closes [#22324](https://github.com/angular/angular/issues/22324)
* **http:** ignore question mark when params are parsed ([#40610](https://github.com/angular/angular/issues/40610)) ([3b884ed](https://github.com/angular/angular/commit/3b884ed1fc1b1c89c1da9aa6ee0e6b21ff4aa024)), closes [#28722](https://github.com/angular/angular/issues/28722)
* **platform-browser:** ensure that Hammer loader is called only once ([#40911](https://github.com/angular/angular/issues/40911)) ([f8055f6](https://github.com/angular/angular/commit/f8055f6fb839e5817a83c484d96afb77bae0aed5)), closes [#25995](https://github.com/angular/angular/issues/25995)


### Performance Improvements

* **core:** use `ngDevMode` to tree-shake warning ([#40876](https://github.com/angular/angular/issues/40876)) ([c8a2e3a](https://github.com/angular/angular/commit/c8a2e3ae1c12cadd505cdd5a12e26a7231682415))
* **language-service:** short-circuit LS operations when we know there is no Angular information to provide ([#40946](https://github.com/angular/angular/issues/40946)) ([73a3ff1](https://github.com/angular/angular/commit/73a3ff11cbca21ec0a64e064c7968c93c0bd8e0a))

<!-- CHANGELOG SPLIT MARKER -->

<a name="11.2.1"></a>
## 11.2.1 (2021-02-17)


### Bug Fixes

* **compiler:** handle `:host-context` and `:host` in the same selector ([#40494](https://github.com/angular/angular/issues/40494)) ([ab8ea87](https://github.com/angular/angular/commit/ab8ea8707842b98b8154f5cbe942b4b24724b6ca)), closes [#14349](https://github.com/angular/angular/issues/14349)
* **compiler:** support multiple `:host-context()` selectors ([#40494](https://github.com/angular/angular/issues/40494)) ([c20e304](https://github.com/angular/angular/commit/c20e3047a58ce2404551c0b51d539e77687e7283)), closes [#19199](https://github.com/angular/angular/issues/19199)
* **compiler:** support multiple selectors in `:host-context()` ([#40494](https://github.com/angular/angular/issues/40494)) ([fb0ce21](https://github.com/angular/angular/commit/fb0ce2178add49f204486c41ef94936f0f178086))
* **compiler-cli:** set TS original node on imported namespace identifiers ([#40711](https://github.com/angular/angular/issues/40711)) ([87ac052](https://github.com/angular/angular/commit/87ac05290ac12ccca10580d10d092d747dae9b40))
* **core:** address Trusted Types bug in Chrome 83 ([#40815](https://github.com/angular/angular/issues/40815)) ([b5f2070](https://github.com/angular/angular/commit/b5f20700c2b9c5edebbfeac8c656f290e4d5d7ea))
* **http:** complete the request on timeout ([#40771](https://github.com/angular/angular/issues/40771)) ([a2a5b4a](https://github.com/angular/angular/commit/a2a5b4add5e68cebe89a4d2b6eff2d75e4cd23c7))
* **router:** fix load interaction of navigation and preload strategies ([#40389](https://github.com/angular/angular/issues/40389)) ([4906bf6](https://github.com/angular/angular/commit/4906bf6a50f307fb69080d276c3b91a60ba7fbae)), closes [#26557](https://github.com/angular/angular/issues/26557) [#22842](https://github.com/angular/angular/issues/22842) [#26557](https://github.com/angular/angular/issues/26557) [#26557](https://github.com/angular/angular/issues/26557) [#22842](https://github.com/angular/angular/issues/22842) [#26557](https://github.com/angular/angular/issues/26557)
* **router:** fix load interaction of navigation and preload strategies ([#40389](https://github.com/angular/angular/issues/40389)) ([bba1981](https://github.com/angular/angular/commit/bba1981c6e1963e5cd1f2c704bb656ca8fcec531)), closes [#26557](https://github.com/angular/angular/issues/26557) [#22842](https://github.com/angular/angular/issues/22842) [#26557](https://github.com/angular/angular/issues/26557) [#26557](https://github.com/angular/angular/issues/26557) [#22842](https://github.com/angular/angular/issues/22842) [#26557](https://github.com/angular/angular/issues/26557)

<!-- CHANGELOG SPLIT MARKER -->

<a name="11.2.0"></a>
# 11.2.0 (2021-02-10)


### Bug Fixes

* **animations:** properly track listeners for a removed element ([#40712](https://github.com/angular/angular/issues/40712)) ([74cb759](https://github.com/angular/angular/commit/74cb759))
* **common:** date is not correctly formatted when year is between 0 and 99 ([#40448](https://github.com/angular/angular/issues/40448)) ([bf85f04](https://github.com/angular/angular/commit/bf85f04)), closes [#40377](https://github.com/angular/angular/issues/40377)
* **compiler:** include parenthesis in expression source spans ([#40740](https://github.com/angular/angular/issues/40740)) ([e99c4e2](https://github.com/angular/angular/commit/e99c4e2)), closes [#40721](https://github.com/angular/angular/issues/40721)
* **compiler:** throw error for duplicate template references ([#40538](https://github.com/angular/angular/issues/40538)) ([7e0ff8c](https://github.com/angular/angular/commit/7e0ff8c)), closes [#40536](https://github.com/angular/angular/issues/40536)
* **compiler-cli:** don't crash when we can't resolve a resource ([#40660](https://github.com/angular/angular/issues/40660)) ([95446fb](https://github.com/angular/angular/commit/95446fb)), closes [angular/vscode-ng-language-service#1079](https://github.com/angular/vscode-ng-language-service/issues/1079)
* **core:** properly move embedded views of dynamic component's projectable nodes ([#37167](https://github.com/angular/angular/issues/37167)) ([9ae21ee](https://github.com/angular/angular/commit/9ae21ee)), closes [#37120](https://github.com/angular/angular/issues/37120)
* **localize:** improve invalid syntax in extraction error message ([#40724](https://github.com/angular/angular/issues/40724)) ([24600ff](https://github.com/angular/angular/commit/24600ff))
* **localize:** support downleveled inlined helper localize calls ([#40754](https://github.com/angular/angular/issues/40754)) ([415ad8d](https://github.com/angular/angular/commit/415ad8d)), closes [#40702](https://github.com/angular/angular/issues/40702)
* **router:** stop emitting to event observable on destroy ([#40638](https://github.com/angular/angular/issues/40638)) ([737bc7a](https://github.com/angular/angular/commit/737bc7a)), closes [#40502](https://github.com/angular/angular/issues/40502)

<!-- CHANGELOG SPLIT MARKER -->

<a name="11.2.0-rc.0"></a>
# 11.2.0-rc.0 (2021-02-03)

This release contains the same set the of changes as 11.2.0-next.1.

<!-- CHANGELOG SPLIT MARKER -->

<a name="11.2.0-next.1"></a>
# 11.2.0-next.1 (2021-02-03)


### Bug Fixes

* **common:** parse `YYYY-MM` strings as UTC dates ([#40620](https://github.com/angular/angular/issues/40620)) ([4c5f18d](https://github.com/angular/angular/commit/4c5f18d)), closes [#33944](https://github.com/angular/angular/issues/33944)
* **common:** parse `YYYY` strings as UTC dates ([#40629](https://github.com/angular/angular/issues/40629)) ([46d4326](https://github.com/angular/angular/commit/46d4326)), closes [#33944](https://github.com/angular/angular/issues/33944) [#40620](https://github.com/angular/angular/issues/40620)
* **compiler:** Don't set expression text to synthetic `$implicit` when empty ([#40583](https://github.com/angular/angular/issues/40583)) ([9d396f8](https://github.com/angular/angular/commit/9d396f8))
* **compiler:** exclude trailing whitespace from element source spans ([#40513](https://github.com/angular/angular/issues/40513)) ([7a6d1e2](https://github.com/angular/angular/commit/7a6d1e2)), closes [#39148](https://github.com/angular/angular/issues/39148)
* **compiler-cli:** preserve user line endings in diagnostic template parse ([#40597](https://github.com/angular/angular/issues/40597)) ([caafac2](https://github.com/angular/angular/commit/caafac2))
* **core:** ensure the type `T` of `EventEmitter<T>` can be inferred ([#40644](https://github.com/angular/angular/issues/40644)) ([5c54767](https://github.com/angular/angular/commit/5c54767)), closes [#40637](https://github.com/angular/angular/issues/40637)
* **core:** remove duplicated EMPTY_ARRAY constant ([#40587](https://github.com/angular/angular/issues/40587)) ([cabe8be](https://github.com/angular/angular/commit/cabe8be))


### Performance Improvements

* **language-service:** update NgCompiler via resource-only path when able ([#40585](https://github.com/angular/angular/issues/40585)) ([07a3d7a](https://github.com/angular/angular/commit/07a3d7a))

<!-- CHANGELOG SPLIT MARKER -->

<a name="11.1.2"></a>
## 11.1.2 (2021-02-03)


### Bug Fixes

* **common:** parse `YYYY-MM` strings as UTC dates ([#40620](https://github.com/angular/angular/issues/40620)) ([cafd4f5](https://github.com/angular/angular/commit/cafd4f5)), closes [#33944](https://github.com/angular/angular/issues/33944)
* **common:** parse `YYYY` strings as UTC dates ([#40629](https://github.com/angular/angular/issues/40629)) ([b823049](https://github.com/angular/angular/commit/b823049)), closes [#33944](https://github.com/angular/angular/issues/33944) [#40620](https://github.com/angular/angular/issues/40620)
* **compiler:** Don't set expression text to synthetic `$implicit` when empty ([#40583](https://github.com/angular/angular/issues/40583)) ([5dab521](https://github.com/angular/angular/commit/5dab521))
* **compiler:** exclude trailing whitespace from element source spans ([#40513](https://github.com/angular/angular/issues/40513)) ([726ec88](https://github.com/angular/angular/commit/726ec88)), closes [#39148](https://github.com/angular/angular/issues/39148)
* **compiler-cli:** preserve user line endings in diagnostic template parse ([#40597](https://github.com/angular/angular/issues/40597)) ([00eeebf](https://github.com/angular/angular/commit/00eeebf))
* **core:** ensure the type `T` of `EventEmitter<T>` can be inferred ([#40644](https://github.com/angular/angular/issues/40644)) ([8f9ba8e](https://github.com/angular/angular/commit/8f9ba8e)), closes [#40637](https://github.com/angular/angular/issues/40637)
* **core:** remove duplicated EMPTY_ARRAY constant ([#40587](https://github.com/angular/angular/issues/40587)) ([abdf25c](https://github.com/angular/angular/commit/abdf25c))


### Performance Improvements

* **language-service:** update NgCompiler via resource-only path when able ([#40680](https://github.com/angular/angular/issues/40680)) ([0047eb3](https://github.com/angular/angular/commit/0047eb3))

<!-- CHANGELOG SPLIT MARKER -->

<a name="11.1.1"></a>
## 11.1.1 (2021-01-27)


### Bug Fixes

* **compiler-cli:** handle pseudo cycles in inline source-maps ([#40435](https://github.com/angular/angular/issues/40435)) ([566206b](https://github.com/angular/angular/commit/566206b)), closes [#40408](https://github.com/angular/angular/issues/40408)
* **compiler-cli:** use `Map` rather than `object` for map of partial linkers ([#40563](https://github.com/angular/angular/issues/40563)) ([33e0f2b](https://github.com/angular/angular/commit/33e0f2b))
* **core:** fix possible XSS attack in development through SSR ([#40525](https://github.com/angular/angular/issues/40525)) ([97ec6e4](https://github.com/angular/angular/commit/97ec6e4))
* **core:** improve injector debug information in `ngDevMode` ([#40476](https://github.com/angular/angular/issues/40476)) ([4bb38c9](https://github.com/angular/angular/commit/4bb38c9))
* **forms:** allow `patchValue()` method of `FormGroup` and `FormArray` classes to skip `null` values ([#40534](https://github.com/angular/angular/issues/40534)) ([2fab148](https://github.com/angular/angular/commit/2fab148)), closes [#36672](https://github.com/angular/angular/issues/36672) [#21021](https://github.com/angular/angular/issues/21021)
* **forms:** properly cleanup in cases when FormControlName has no CVA ([#40526](https://github.com/angular/angular/issues/40526)) ([72fc6aa](https://github.com/angular/angular/commit/72fc6aa)), closes [#39235](https://github.com/angular/angular/issues/39235) [#40521](https://github.com/angular/angular/issues/40521)
* **language-service:** implement realpath to resolve symlinks ([#40593](https://github.com/angular/angular/issues/40593)) ([77efc27](https://github.com/angular/angular/commit/77efc27))
* **language-service:** recognize incomplete pipe bindings with whitespace ([#40346](https://github.com/angular/angular/issues/40346)) ([d88f18e](https://github.com/angular/angular/commit/d88f18e))
* **localize:** include meaning in generated ARB files ([#40546](https://github.com/angular/angular/issues/40546)) ([5661298](https://github.com/angular/angular/commit/5661298)), closes [#40506](https://github.com/angular/angular/issues/40506)
* **router:** always stringify matrix parameters ([#25095](https://github.com/angular/angular/issues/25095)) ([a8a27ef](https://github.com/angular/angular/commit/a8a27ef)), closes [#23165](https://github.com/angular/angular/issues/23165)
* **router:** Fix occasional error when creating url tree in IE 11 and Edge ([#40488](https://github.com/angular/angular/issues/40488)) ([69fd942](https://github.com/angular/angular/commit/69fd942))
* **service-worker:** handle error with console.error ([#40236](https://github.com/angular/angular/issues/40236)) ([37710b9](https://github.com/angular/angular/commit/37710b9))


### Features

* **language-service:** Add diagnostics to suggest turning on strict mode ([#40568](https://github.com/angular/angular/issues/40568)) ([defa627](https://github.com/angular/angular/commit/defa627))


### Performance Improvements

* **compiler-cli:** introduce fast path for resource-only updates ([#40561](https://github.com/angular/angular/issues/40561)) ([156103c](https://github.com/angular/angular/commit/156103c))
* **core:** simplify bloom bucket computation ([#40489](https://github.com/angular/angular/issues/40489)) ([106734a](https://github.com/angular/angular/commit/106734a))

<!-- CHANGELOG SPLIT MARKER -->

<a name="11.1.0"></a>
# 11.1.0 (2021-01-20)


### Bug Fixes

* **animations:** getAnimationStyle causes exceptions in older browsers ([#29709](https://github.com/angular/angular/issues/29709)) ([66d863f](https://github.com/angular/angular/commit/66d863f))
* **animations:** replace copy of query selector node-list from "spread" to "for" ([#39646](https://github.com/angular/angular/issues/39646)) ([bfa197f](https://github.com/angular/angular/commit/bfa197f)), closes [#38551](https://github.com/angular/angular/issues/38551)
* **common:** add `HttpParamsOptions` to the public api ([#35829](https://github.com/angular/angular/issues/35829)) ([b33b89d](https://github.com/angular/angular/commit/b33b89d)), closes [#20276](https://github.com/angular/angular/issues/20276)
* **common:** Prefer to use pageXOffset / pageYOffset instance of scrollX / scrollY ([#28262](https://github.com/angular/angular/issues/28262)) ([b1d300d](https://github.com/angular/angular/commit/b1d300d))
* **compiler:** correct the `KeySpan` for animation events and properties ([#40347](https://github.com/angular/angular/issues/40347)) ([524415e](https://github.com/angular/angular/commit/524415e))
* **compiler:** incorrectly interpreting some HostBinding names ([#40233](https://github.com/angular/angular/issues/40233)) ([1045465](https://github.com/angular/angular/commit/1045465)), closes [#40220](https://github.com/angular/angular/issues/40220) [#40230](https://github.com/angular/angular/issues/40230) [#18698](https://github.com/angular/angular/issues/18698)
* **compiler:** recover event parse when animation event name is empty ([#39925](https://github.com/angular/angular/issues/39925)) ([15b15be](https://github.com/angular/angular/commit/15b15be))
* **compiler:** avoid duplicate i18n blocks for i18n attrs on elements with structural directives ([#40077](https://github.com/angular/angular/issues/40077)) ([caa4666](https://github.com/angular/angular/commit/caa4666)), closes [#39942](https://github.com/angular/angular/issues/39942)
* **compiler:** handle strings inside bindings that contain binding characters ([#39826](https://github.com/angular/angular/issues/39826)) ([dc6d40e](https://github.com/angular/angular/commit/dc6d40e)), closes [#39601](https://github.com/angular/angular/issues/39601)
* **compiler:** disallow i18n of security-sensitive attributes ([#39554](https://github.com/angular/angular/issues/39554)) ([c8a99ef](https://github.com/angular/angular/commit/c8a99ef))
* **compiler:** ensure that placeholders have the correct sourceSpan ([#39717](https://github.com/angular/angular/issues/39717)) ([0462a61](https://github.com/angular/angular/commit/0462a61)), closes [#39671](https://github.com/angular/angular/issues/39671)
* **compiler:** only promote Trusted Types to constants when necessary ([#39554](https://github.com/angular/angular/issues/39554)) ([4916870](https://github.com/angular/angular/commit/4916870))
* **compiler:** report better error on interpolation in an expression ([#30300](https://github.com/angular/angular/issues/30300)) ([94e790d](https://github.com/angular/angular/commit/94e790d))
* **compiler-cli:** do not duplicate repeated source-files in rendered source-maps ([#40237](https://github.com/angular/angular/issues/40237)) ([3158858](https://github.com/angular/angular/commit/3158858))
* **compiler-cli:** remove classes in .d.ts files from provider checks ([#40118](https://github.com/angular/angular/issues/40118)) ([973bb40](https://github.com/angular/angular/commit/973bb40))
* **animations:** implement getPosition in browser animation builder ([#39983](https://github.com/angular/angular/issues/39983)) ([ca08625](https://github.com/angular/angular/commit/ca08625))
* **compiler-cli:** correct incremental behavior even with broken imports ([#39923](https://github.com/angular/angular/issues/39923)) ([c7c5b2f](https://github.com/angular/angular/commit/c7c5b2f))
* **compiler-cli:** remove the concept of an errored trait ([#39923](https://github.com/angular/angular/issues/39923)) ([6d42954](https://github.com/angular/angular/commit/6d42954))
* **compiler-cli:** track poisoned scopes with a flag ([#39923](https://github.com/angular/angular/issues/39923)) ([0823622](https://github.com/angular/angular/commit/0823622))
* **compiler-cli:** report error when a reference target is missing instead of crashing ([#39805](https://github.com/angular/angular/issues/39805)) ([453b32f](https://github.com/angular/angular/commit/453b32f)), closes [#38618](https://github.com/angular/angular/issues/38618) [#39744](https://github.com/angular/angular/issues/39744)
* **core:** fix possible XSS attack in development through SSR. ([#40136](https://github.com/angular/angular/issues/40136)) ([47d9b6d](https://github.com/angular/angular/commit/47d9b6d))
* **core:** set `ngDevMode` to `false` when calling `enableProdMode()` ([#40124](https://github.com/angular/angular/issues/40124)) ([70b4816](https://github.com/angular/angular/commit/70b4816))
* **core:** Allow passing AbstractType to the inject function ([#37958](https://github.com/angular/angular/issues/37958)) ([a1b6ad0](https://github.com/angular/angular/commit/a1b6ad0))
* **core:** Ensure OnPush ancestors are marked dirty when events occur ([#39833](https://github.com/angular/angular/issues/39833)) ([68d4a74](https://github.com/angular/angular/commit/68d4a74)), closes [#39832](https://github.com/angular/angular/issues/39832)
* **core:** meta addTag() adds incorrect attribute for httpEquiv ([#32531](https://github.com/angular/angular/issues/32531)) ([ff0a90e](https://github.com/angular/angular/commit/ff0a90e))
* **core:** migration error if program contains files outside the project ([#39790](https://github.com/angular/angular/issues/39790)) ([1a26f6d](https://github.com/angular/angular/commit/1a26f6d)), closes [#39778](https://github.com/angular/angular/issues/39778)
* **core:** not invoking object's toString when rendering to the DOM ([#39843](https://github.com/angular/angular/issues/39843)) ([11cd37f](https://github.com/angular/angular/commit/11cd37f)), closes [#38839](https://github.com/angular/angular/issues/38839)
* **core:** remove duplicated noop function ([#39761](https://github.com/angular/angular/issues/39761)) ([066126a](https://github.com/angular/angular/commit/066126a))
* **core:** support `Attribute` DI decorator in `deps` section of a token ([#37085](https://github.com/angular/angular/issues/37085)) ([f5cbf0b](https://github.com/angular/angular/commit/f5cbf0b)), closes [#36479](https://github.com/angular/angular/issues/36479)
* **core:** remove application from the testability registry when the root view is removed ([#39876](https://github.com/angular/angular/issues/39876)) ([df27027](https://github.com/angular/angular/commit/df27027)), closes [#22106](https://github.com/angular/angular/issues/22106)
* **core:** Support extending differs from root `NgModule` ([#39981](https://github.com/angular/angular/issues/39981)) ([5fc4508](https://github.com/angular/angular/commit/5fc4508)), closes [#25015](https://github.com/angular/angular/issues/25015) [#11309](https://github.com/angular/angular/issues/11309) [#18554](https://github.com/angular/angular/issues/18554)
* **core:** unsubscribe from the `onError` when the root view is removed ([#39940](https://github.com/angular/angular/issues/39940)) ([5a3a154](https://github.com/angular/angular/commit/5a3a154))
* **core:** `QueryList` should not fire changes if the underlying list did not change. ([#40091](https://github.com/angular/angular/issues/40091)) ([76f3633](https://github.com/angular/angular/commit/76f3633))
* **core:** fix fakeAsync() error messages ([#40442](https://github.com/angular/angular/issues/40442)) ([ad2b50b](https://github.com/angular/angular/commit/ad2b50b))
* **forms:** error if control is removed as a result of another one being reset ([#40462](https://github.com/angular/angular/issues/40462)) ([2c5ad5c](https://github.com/angular/angular/commit/2c5ad5c)), closes [#33401](https://github.com/angular/angular/issues/33401)
* **forms:** clean up connection between FormControl/FormGroup and corresponding directive instances ([#39235](https://github.com/angular/angular/issues/39235)) ([a384961](https://github.com/angular/angular/commit/a384961)), closes [#20007](https://github.com/angular/angular/issues/20007) [#37431](https://github.com/angular/angular/issues/37431) [#39590](https://github.com/angular/angular/issues/39590)
* **language-service:** fix go to definition for template variables and references ([#40455](https://github.com/angular/angular/issues/40455)) ([#40491](https://github.com/angular/angular/issues/40491)) ([3e134e4](https://github.com/angular/angular/commit/3e134e4))
* **language-service:** Paths on Windows should be normalized ([#40492](https://github.com/angular/angular/issues/40492)) ([b8e47e2](https://github.com/angular/angular/commit/b8e47e2)), closes [/github.com/angular/vscode-ng-language-service/blob/9fca9c66510974c26d5c21b31adb9fa39ac0a38a/server/src/session.ts#L594](https://github.com//github.com/angular/vscode-ng-language-service/blob/9fca9c66510974c26d5c21b31adb9fa39ac0a38a/server/src/session.ts/issues/L594)
* **language-service:** report non-template diagnostics ([#40331](https://github.com/angular/angular/issues/40331)) ([4db89f4](https://github.com/angular/angular/commit/4db89f4))
* **language-service:** diagnostic and definition should work for absolute url ([#40406](https://github.com/angular/angular/issues/40406)) ([625d2c2](https://github.com/angular/angular/commit/625d2c2))
* **language-service:** reinstate overridden compiler option after change ([#40364](https://github.com/angular/angular/issues/40364)) ([811cacc](https://github.com/angular/angular/commit/811cacc))
* **language-service:** Support 'find references' for two-way bindings ([#40185](https://github.com/angular/angular/issues/40185)) ([ebb7ac5](https://github.com/angular/angular/commit/ebb7ac5))
* **language-service:** Support 'go to definition' for two-way bindings ([#40185](https://github.com/angular/angular/issues/40185)) ([a9d8c22](https://github.com/angular/angular/commit/a9d8c22))
* **language-service:** Support completions of two-way bindings ([#40185](https://github.com/angular/angular/issues/40185)) ([7d74853](https://github.com/angular/angular/commit/7d74853))
* **language-service:** Do not include $event parameter in reference results ([#40158](https://github.com/angular/angular/issues/40158)) ([d466db8](https://github.com/angular/angular/commit/d466db8)), closes [#40157](https://github.com/angular/angular/issues/40157)
* **language-service:** include compilerOptions.rootDir in rootDirs ([#40243](https://github.com/angular/angular/issues/40243)) ([a62416c](https://github.com/angular/angular/commit/a62416c)), closes [angular/vscode-ng-language-service#1039](https://github.com/angular/vscode-ng-language-service/issues/1039)
* **language-service:** LSParseConfigHost.resolve should not concat abs paths ([#40242](https://github.com/angular/angular/issues/40242)) ([0264f76](https://github.com/angular/angular/commit/0264f76))
* **language-service:** return all typecheck files via getExternalFiles ([#40162](https://github.com/angular/angular/issues/40162)) ([183fb7e](https://github.com/angular/angular/commit/183fb7e))
* **language-service:** shorthand syntax with variables ([#40239](https://github.com/angular/angular/issues/40239)) ([12cb39c](https://github.com/angular/angular/commit/12cb39c))
* **language-service:** force compileNonExportedClasses: false in LS ([#40092](https://github.com/angular/angular/issues/40092)) ([028e4f7](https://github.com/angular/angular/commit/028e4f7))
* **language-service:** Prevent matching nodes after finding a keySpan ([#40047](https://github.com/angular/angular/issues/40047)) ([1bf1b68](https://github.com/angular/angular/commit/1bf1b68))
* **language-service:** do not return external template that does not exist ([#39898](https://github.com/angular/angular/issues/39898)) ([2b84882](https://github.com/angular/angular/commit/2b84882))
* **language-service:** do not treat file URIs as general URLs ([#39917](https://github.com/angular/angular/issues/39917)) ([3b70098](https://github.com/angular/angular/commit/3b70098))
* **localize:** ensure extracted messages are serialized in a consistent order ([#40192](https://github.com/angular/angular/issues/40192)) ([212245f](https://github.com/angular/angular/commit/212245f)), closes [#39262](https://github.com/angular/angular/issues/39262)
* **ngcc:** copy (and update) source-maps for unmodified source files ([#40429](https://github.com/angular/angular/issues/40429)) ([e2e3862](https://github.com/angular/angular/commit/e2e3862)), closes [#40358](https://github.com/angular/angular/issues/40358)
* **service-worker:** handle error with ErrorHandler ([#39990](https://github.com/angular/angular/issues/39990)) ([74e42cf](https://github.com/angular/angular/commit/74e42cf)), closes [#39913](https://github.com/angular/angular/issues/39913)
* **router:** correctly handle string command in outlets ([#39728](https://github.com/angular/angular/issues/39728)) ([c33a823](https://github.com/angular/angular/commit/c33a823)), closes [#18928](https://github.com/angular/angular/issues/18928)
* **router:** lazy loaded modules without RouterModule.forChild() won't cause an infinite loop ([#36605](https://github.com/angular/angular/issues/36605)) ([6675b6f](https://github.com/angular/angular/commit/6675b6f)), closes [#29164](https://github.com/angular/angular/issues/29164)
* **router:** remove duplicated getOutlet function ([#39764](https://github.com/angular/angular/issues/39764)) ([5fa7673](https://github.com/angular/angular/commit/5fa7673))
* **service-worker:** correctly handle failed cache-busted request ([#39786](https://github.com/angular/angular/issues/39786)) ([6046419](https://github.com/angular/angular/commit/6046419)), closes [#39775](https://github.com/angular/angular/issues/39775) [#39775](https://github.com/angular/angular/issues/39775)
* **upgrade:** avoid memory leak when removing downgraded components ([#39965](https://github.com/angular/angular/issues/39965)) ([6dc43a4](https://github.com/angular/angular/commit/6dc43a4)), closes [#26209](https://github.com/angular/angular/issues/26209) [#39911](https://github.com/angular/angular/issues/39911) [#39921](https://github.com/angular/angular/issues/39921)
* **upgrade:** fix HMR for hybrid applications ([#40045](https://github.com/angular/angular/issues/40045)) ([b4b21bd](https://github.com/angular/angular/commit/b4b21bd)), closes [#39935](https://github.com/angular/angular/issues/39935)


### Performance Improvements

* **animations:** use `ngDevMode` to tree-shake warning ([#39964](https://github.com/angular/angular/issues/39964)) ([9ebe423](https://github.com/angular/angular/commit/9ebe423))
* **common:** use `ngDevMode` to tree-shake warnings ([#39964](https://github.com/angular/angular/issues/39964)) ([f022efa](https://github.com/angular/angular/commit/f022efa))
* **core:** use `ngDevMode` to tree-shake `checkNoChanges` ([#39964](https://github.com/angular/angular/issues/39964)) ([e1fe9ec](https://github.com/angular/angular/commit/e1fe9ec))
* **core:** use `ngDevMode` to tree-shake warnings ([#39959](https://github.com/angular/angular/issues/39959)) ([8b0cccc](https://github.com/angular/angular/commit/8b0cccc))
* **core:** make DI decorators tree-shakable when used for `useFactory` deps config ([#40145](https://github.com/angular/angular/issues/40145)) ([0664d75](https://github.com/angular/angular/commit/0664d75)), closes [#40143](https://github.com/angular/angular/issues/40143)
* **forms:** use `ngDevMode` to tree-shake `_ngModelWarning` ([#39964](https://github.com/angular/angular/issues/39964)) ([7954c8d](https://github.com/angular/angular/commit/7954c8d))
* **ngcc:** do not copy files that have been processed ([#40429](https://github.com/angular/angular/issues/40429)) ([798aae4](https://github.com/angular/angular/commit/798aae4))


### Features

* **common:** allow any Subscribable in async pipe ([#39627](https://github.com/angular/angular/issues/39627)) ([c7f4abf](https://github.com/angular/angular/commit/c7f4abf))
* **compiler:** recover expression parsing in more malformed pipe cases ([#39437](https://github.com/angular/angular/issues/39437)) ([e336572](https://github.com/angular/angular/commit/e336572))
* **compiler:** support recovery of malformed property writes ([#39103](https://github.com/angular/angular/issues/39103)) ([e44e10b](https://github.com/angular/angular/commit/e44e10b))
* **compiler:** add schema for Trusted Types sinks ([#39554](https://github.com/angular/angular/issues/39554)) ([358c50e](https://github.com/angular/angular/commit/358c50e))
* **compiler:** support error reporting in I18nMetaVisitor ([#39554](https://github.com/angular/angular/issues/39554)) ([bb70a9b](https://github.com/angular/angular/commit/bb70a9b))
* **compiler:** support tagged template literals in code generator ([#39122](https://github.com/angular/angular/issues/39122)) ([ef89274](https://github.com/angular/angular/commit/ef89274))
* **compiler:** allow trailing comma in array literal ([#22277](https://github.com/angular/angular/issues/22277)) ([8d613c1](https://github.com/angular/angular/commit/8d613c1)), closes [#20773](https://github.com/angular/angular/issues/20773)
* **compiler-cli:** implement partial directive declaration linking ([#39518](https://github.com/angular/angular/issues/39518)) ([87e9cd6](https://github.com/angular/angular/commit/87e9cd6))
* **compiler-cli:** partial compilation of directives ([#39518](https://github.com/angular/angular/issues/39518)) ([8c0a92b](https://github.com/angular/angular/commit/8c0a92b))
* **compiler-cli:** add support for using TypeScript 4.1 ([#39571](https://github.com/angular/angular/issues/39571)) ([a7e7c21](https://github.com/angular/angular/commit/a7e7c21))
* **compiler-cli:** support for partial compilation of components ([#39707](https://github.com/angular/angular/issues/39707)) ([e75244e](https://github.com/angular/angular/commit/e75244e))
* **compiler-cli:** expose function to allow short-circuiting of linking ([#40137](https://github.com/angular/angular/issues/40137)) ([7dcf286](https://github.com/angular/angular/commit/7dcf286))
* **compiler-cli:** JIT compilation of component declarations ([#40127](https://github.com/angular/angular/issues/40127)) ([d4327d5](https://github.com/angular/angular/commit/d4327d5))
* **compiler-cli:** JIT compilation of directive declarations ([#40101](https://github.com/angular/angular/issues/40101)) ([9186f1f](https://github.com/angular/angular/commit/9186f1f))
* **core:** add shouldCoalesceRunChangeDetection option to coalesce change detections in the same event loop. ([#39422](https://github.com/angular/angular/issues/39422)) ([5e92d64](https://github.com/angular/angular/commit/5e92d64)), closes [#39348](https://github.com/angular/angular/issues/39348) [#39348](https://github.com/angular/angular/issues/39348)
* **core:** adds get method to QueryList ([#36907](https://github.com/angular/angular/issues/36907)) ([a965589](https://github.com/angular/angular/commit/a965589)), closes [#29467](https://github.com/angular/angular/issues/29467)
* **core:** Add schematic to fix invalid `Route` configs ([#40067](https://github.com/angular/angular/issues/40067)) ([805b4f9](https://github.com/angular/angular/commit/805b4f9))
* **language-service:** log Angular compiler options ([#40364](https://github.com/angular/angular/issues/40364)) ([6a9e328](https://github.com/angular/angular/commit/6a9e328))
* **language-service:** autocomplete pipe binding expressions ([#40032](https://github.com/angular/angular/issues/40032)) ([cbb6eae](https://github.com/angular/angular/commit/cbb6eae))
* **language-service:** autocompletion of element tags ([#40032](https://github.com/angular/angular/issues/40032)) ([e42250f](https://github.com/angular/angular/commit/e42250f))
* **language-service:** autocompletion within expression contexts ([#39727](https://github.com/angular/angular/issues/39727)) ([93a8326](https://github.com/angular/angular/commit/93a8326))
* **language-service:** complete attributes on elements ([#40032](https://github.com/angular/angular/issues/40032)) ([66378ed](https://github.com/angular/angular/commit/66378ed))
* **language-service:** completions for structural directives ([#40032](https://github.com/angular/angular/issues/40032)) ([2a74431](https://github.com/angular/angular/commit/2a74431))
* **language-service:** enable get references for directive and component from template ([#40054](https://github.com/angular/angular/issues/40054)) ([973f797](https://github.com/angular/angular/commit/973f797))
* **language-service:** Add "find references" capability to Ivy integrated LS ([#39768](https://github.com/angular/angular/issues/39768)) ([06a782a](https://github.com/angular/angular/commit/06a782a))
* **language-service:** implement autocompletion for global properties (Ivy) ([#39250](https://github.com/angular/angular/issues/39250)) ([28a0bcb](https://github.com/angular/angular/commit/28a0bcb))
* **language-service:** Implement go to definition for style and template urls ([#39202](https://github.com/angular/angular/issues/39202)) ([563fb6c](https://github.com/angular/angular/commit/563fb6c))
* **localize:** support Application Resource Bundle (ARB) translation file format ([#36795](https://github.com/angular/angular/issues/36795)) ([5684ac5](https://github.com/angular/angular/commit/5684ac5))
* **platform-browser:** add doubletap HammerJS support ([#26362](https://github.com/angular/angular/issues/26362)) ([b5c0f9d](https://github.com/angular/angular/commit/b5c0f9d)), closes [#23954](https://github.com/angular/angular/issues/23954)
* **router:** add `relativeTo` as an input to `routerLink` ([#39720](https://github.com/angular/angular/issues/39720)) ([112324a](https://github.com/angular/angular/commit/112324a)), closes [#13523](https://github.com/angular/angular/issues/13523)

<!-- CHANGELOG SPLIT MARKER -->

<a name="11.0.9"></a>
## 11.0.9 (2021-01-13)


### Bug Fixes

* **compiler:** incorrectly inferring content type of SVG-specific title tag ([#40259](https://github.com/angular/angular/issues/40259)) ([642c45b](https://github.com/angular/angular/commit/642c45b)), closes [#31503](https://github.com/angular/angular/issues/31503)
* **compiler-cli:** prevent stack overflow in decorator transform for large number of files ([#40374](https://github.com/angular/angular/issues/40374)) ([ff36485](https://github.com/angular/angular/commit/ff36485)), closes [#40276](https://github.com/angular/angular/issues/40276)
* **ngcc:** compute the correct package paths for target entry-points ([#40376](https://github.com/angular/angular/issues/40376)) ([584b78a](https://github.com/angular/angular/commit/584b78a)), closes [#40352](https://github.com/angular/angular/issues/40352) [#40357](https://github.com/angular/angular/issues/40357)
* **router:** better ngZone checking for warning ([#25839](https://github.com/angular/angular/issues/25839)) ([adf42da](https://github.com/angular/angular/commit/adf42da)), closes [#25837](https://github.com/angular/angular/issues/25837)
* **service-worker:** allow checking for updates when constantly polling the server ([#40234](https://github.com/angular/angular/issues/40234)) ([a7befd5](https://github.com/angular/angular/commit/a7befd5)), closes [#40207](https://github.com/angular/angular/issues/40207)
* **service-worker:** ensure SW stays alive while notifying clients about unrecoverable state ([#40234](https://github.com/angular/angular/issues/40234)) ([c01b5ea](https://github.com/angular/angular/commit/c01b5ea))

<!-- CHANGELOG SPLIT MARKER -->

<a name="11.0.8"></a>
## 11.0.8 (2021-01-11)


### Bug Fixes

* **core:** memory leak if view container host view is destroyed while view ref is not ([#40219](https://github.com/angular/angular/issues/40219)) ([f691e85](https://github.com/angular/angular/commit/f691e85)), closes [#38648](https://github.com/angular/angular/issues/38648)
* **forms:** handle standalone `<form>` tag correctly in `NgControlStatusGroup` directive ([#40344](https://github.com/angular/angular/issues/40344)) ([b3f322f](https://github.com/angular/angular/commit/b3f322f)), closes [#38391](https://github.com/angular/angular/issues/38391)
* **router:** Remove usage of `Object.values` to avoid the need for a polyfill ([#40370](https://github.com/angular/angular/issues/40370)) ([c44dd84](https://github.com/angular/angular/commit/c44dd84))

<!-- CHANGELOG SPLIT MARKER -->

<a name="11.0.7"></a>
## 11.0.7 (2021-01-07)


### Bug Fixes

* **router:** correctly deactivate children with componentless parent ([#40196](https://github.com/angular/angular/issues/40196)) ([7060ae2](https://github.com/angular/angular/commit/7060ae2)), closes [/github.com/angular/angular/blob/362f45c4bf1bb49a90b014d2053f4c4474d132c0/packages/router/src/operators/activate_routes.ts#L151-L158](https://github.com//github.com/angular/angular/blob/362f45c4bf1bb49a90b014d2053f4c4474d132c0/packages/router/src/operators/activate_routes.ts/issues/L151-L158) [#20694](https://github.com/angular/angular/issues/20694)
* **router:** Remove usage of `Object.entries` to avoid the need for a polyfill ([#40340](https://github.com/angular/angular/issues/40340)) ([6429be1](https://github.com/angular/angular/commit/6429be1))

<!-- CHANGELOG SPLIT MARKER -->

<a name="11.0.6"></a>
## 11.0.6 (2021-01-06)


### Bug Fixes

* **compiler:** don't report parse error for interpolation inside string in property binding ([#40267](https://github.com/angular/angular/issues/40267)) ([7977509](https://github.com/angular/angular/commit/7977509)), closes [#39826](https://github.com/angular/angular/issues/39826) [#39601](https://github.com/angular/angular/issues/39601)
* **compiler:** incorrectly encapsulating selectors with escape sequences ([#40264](https://github.com/angular/angular/issues/40264)) ([1bfbfaa](https://github.com/angular/angular/commit/1bfbfaa)), closes [#31844](https://github.com/angular/angular/issues/31844)
* **compiler-cli:** handle `\r\n` line-endings correctly in source-mapping ([#40187](https://github.com/angular/angular/issues/40187)) ([b865b32](https://github.com/angular/angular/commit/b865b32)), closes [#40169](https://github.com/angular/angular/issues/40169) [#39654](https://github.com/angular/angular/issues/39654)
* **compiler-cli:** ngcc - remove outdated link ([#40285](https://github.com/angular/angular/issues/40285)) ([0b00d65](https://github.com/angular/angular/commit/0b00d65)), closes [#39837](https://github.com/angular/angular/issues/39837)
* **core:** Call `onDestroy` in production mode as well ([#40120](https://github.com/angular/angular/issues/40120)) ([632fe60](https://github.com/angular/angular/commit/632fe60)), closes [#39876](https://github.com/angular/angular/issues/39876) [#40105](https://github.com/angular/angular/issues/40105)
* **core:** ensure sanitizer works if DOMParser return null body ([#40107](https://github.com/angular/angular/issues/40107)) ([add7cbb](https://github.com/angular/angular/commit/add7cbb)), closes [#39834](https://github.com/angular/angular/issues/39834)
* **core:** error if detectChanges is called at the wrong time under specific circumstances ([#40206](https://github.com/angular/angular/issues/40206)) ([ef13e83](https://github.com/angular/angular/commit/ef13e83)), closes [#38611](https://github.com/angular/angular/issues/38611)
* **core:** take @Host into account while processing `useFactory` arguments ([#40122](https://github.com/angular/angular/issues/40122)) ([#40313](https://github.com/angular/angular/issues/40313)) ([45838c0](https://github.com/angular/angular/commit/45838c0))
* **router:** apply redirects should match named outlets with empty path parents ([#40029](https://github.com/angular/angular/issues/40029)) ([#40315](https://github.com/angular/angular/issues/40315)) ([f542e4e](https://github.com/angular/angular/commit/f542e4e)), closes [#38379](https://github.com/angular/angular/issues/38379) [#38379](https://github.com/angular/angular/issues/38379) [#39952](https://github.com/angular/angular/issues/39952) [#10726](https://github.com/angular/angular/issues/10726) [#30410](https://github.com/angular/angular/issues/30410)
* **router:** Ensure named outlets with empty path parents are recognized ([#40029](https://github.com/angular/angular/issues/40029)) ([#40315](https://github.com/angular/angular/issues/40315)) ([c722c43](https://github.com/angular/angular/commit/c722c43))
* **router:** Router should focus element after scrolling ([#40241](https://github.com/angular/angular/issues/40241)) ([a1dcfc5](https://github.com/angular/angular/commit/a1dcfc5)), closes [#30067](https://github.com/angular/angular/issues/30067)

<!-- CHANGELOG SPLIT MARKER -->

<a name="11.0.5"></a>
## 11.0.5 (2020-12-16)


### Bug Fixes

* **compiler:** handle strings inside bindings that contain binding characters ([#39826](https://github.com/angular/angular/issues/39826)) ([f5aab2b](https://github.com/angular/angular/commit/f5aab2b)), closes [#39601](https://github.com/angular/angular/issues/39601)
* **core:** fix possible XSS attack in development through SSR. ([#40136](https://github.com/angular/angular/issues/40136)) ([0aa220b](https://github.com/angular/angular/commit/0aa220b))
* **core:** set `ngDevMode` to `false` when calling `enableProdMode()` ([#40124](https://github.com/angular/angular/issues/40124)) ([922f492](https://github.com/angular/angular/commit/922f492))
* **upgrade:** fix HMR for hybrid applications ([#40045](https://github.com/angular/angular/issues/40045)) ([c4c7509](https://github.com/angular/angular/commit/c4c7509)), closes [#39935](https://github.com/angular/angular/issues/39935)

<!-- CHANGELOG SPLIT MARKER -->

<a name="11.0.4"></a>
## 11.0.4 (2020-12-09)


### Bug Fixes

* **animations:** implement getPosition in browser animation builder ([#39983](https://github.com/angular/angular/issues/39983)) ([5a765f0](https://github.com/angular/angular/commit/5a765f0))
* **compiler-cli:** correct incremental behavior even with broken imports ([#39967](https://github.com/angular/angular/issues/39967)) ([adeeb84](https://github.com/angular/angular/commit/adeeb84))
* **compiler-cli:** remove the concept of an errored trait ([#39967](https://github.com/angular/angular/issues/39967)) ([0aa35ec](https://github.com/angular/angular/commit/0aa35ec))
* **compiler-cli:** track poisoned scopes with a flag ([#39967](https://github.com/angular/angular/issues/39967)) ([178cc51](https://github.com/angular/angular/commit/178cc51))
* **core:** remove application from the testability registry when the root view is removed ([#39876](https://github.com/angular/angular/issues/39876)) ([3680ad1](https://github.com/angular/angular/commit/3680ad1)), closes [#22106](https://github.com/angular/angular/issues/22106)
* **core:** unsubscribe from the `onError` when the root view is removed ([#39940](https://github.com/angular/angular/issues/39940)) ([35309bb](https://github.com/angular/angular/commit/35309bb))
* **language-service:** do not return external template that does not exist ([#39898](https://github.com/angular/angular/issues/39898)) ([6b6fcd7](https://github.com/angular/angular/commit/6b6fcd7))
* **language-service:** do not treat file URIs as general URLs ([#39917](https://github.com/angular/angular/issues/39917)) ([829988b](https://github.com/angular/angular/commit/829988b))
* **service-worker:** handle error with ErrorHandler ([#39990](https://github.com/angular/angular/issues/39990)) ([588dbd3](https://github.com/angular/angular/commit/588dbd3)), closes [#39913](https://github.com/angular/angular/issues/39913)
* **upgrade:** avoid memory leak when removing downgraded components ([#39965](https://github.com/angular/angular/issues/39965)) ([97310d3](https://github.com/angular/angular/commit/97310d3)), closes [#26209](https://github.com/angular/angular/issues/26209) [#39911](https://github.com/angular/angular/issues/39911) [#39921](https://github.com/angular/angular/issues/39921)


### Performance Improvements

* **animations:** use `ngDevMode` to tree-shake warning ([#39964](https://github.com/angular/angular/issues/39964)) ([72aad32](https://github.com/angular/angular/commit/72aad32))
* **common:** use `ngDevMode` to tree-shake warnings ([#39964](https://github.com/angular/angular/issues/39964)) ([bf3de9b](https://github.com/angular/angular/commit/bf3de9b))
* **core:** use `ngDevMode` to tree-shake `checkNoChanges` ([#39964](https://github.com/angular/angular/issues/39964)) ([2fbb684](https://github.com/angular/angular/commit/2fbb684))
* **core:** use `ngDevMode` to tree-shake warnings ([#39959](https://github.com/angular/angular/issues/39959)) ([1e3534f](https://github.com/angular/angular/commit/1e3534f))
* **forms:** use `ngDevMode` to tree-shake `_ngModelWarning` ([#39964](https://github.com/angular/angular/issues/39964)) ([735556d](https://github.com/angular/angular/commit/735556d))

<!-- CHANGELOG SPLIT MARKER -->

<a name="11.0.3"></a>
## 11.0.3 (2020-12-02)


### Bug Fixes

* **animations:** getAnimationStyle causes exceptions in older browsers ([#29709](https://github.com/angular/angular/issues/29709)) ([cb1d77a](https://github.com/angular/angular/commit/cb1d77a))
* **animations:** replace copy of query selector node-list from "spread" to "for" ([#39646](https://github.com/angular/angular/issues/39646)) ([e95cd2a](https://github.com/angular/angular/commit/e95cd2a)), closes [#38551](https://github.com/angular/angular/issues/38551)
* **common:** Prefer to use pageXOffset / pageYOffset instance of scrollX / scrollY ([#28262](https://github.com/angular/angular/issues/28262)) ([5692607](https://github.com/angular/angular/commit/5692607))
* **compiler:** ensure that placeholders have the correct sourceSpan ([#39717](https://github.com/angular/angular/issues/39717)) ([8ec7156](https://github.com/angular/angular/commit/8ec7156)), closes [#39671](https://github.com/angular/angular/issues/39671)
* **compiler:** report better error on interpolation in an expression ([#30300](https://github.com/angular/angular/issues/30300)) ([6dc74fd](https://github.com/angular/angular/commit/6dc74fd))
* **compiler-cli:** report error when a reference target is missing instead of crashing ([#39805](https://github.com/angular/angular/issues/39805)) ([8634611](https://github.com/angular/angular/commit/8634611)), closes [#38618](https://github.com/angular/angular/issues/38618) [#39744](https://github.com/angular/angular/issues/39744)
* **core:** Ensure OnPush ancestors are marked dirty when events occur ([#39833](https://github.com/angular/angular/issues/39833)) ([01c1bfd](https://github.com/angular/angular/commit/01c1bfd)), closes [#39832](https://github.com/angular/angular/issues/39832)
* **core:** meta addTag() adds incorrect attribute for httpEquiv ([#32531](https://github.com/angular/angular/issues/32531)) ([3114b0a](https://github.com/angular/angular/commit/3114b0a))
* **core:** migration error if program contains files outside the project ([#39790](https://github.com/angular/angular/issues/39790)) ([7dcc212](https://github.com/angular/angular/commit/7dcc212)), closes [#39778](https://github.com/angular/angular/issues/39778)
* **core:** not invoking object's toString when rendering to the DOM ([#39843](https://github.com/angular/angular/issues/39843)) ([75e22ab](https://github.com/angular/angular/commit/75e22ab)), closes [#38839](https://github.com/angular/angular/issues/38839)
* **core:** remove duplicated noop function ([#39761](https://github.com/angular/angular/issues/39761)) ([26a1337](https://github.com/angular/angular/commit/26a1337))
* **core:** support `Attribute` DI decorator in `deps` section of a token ([#37085](https://github.com/angular/angular/issues/37085)) ([aaa3111](https://github.com/angular/angular/commit/aaa3111)), closes [#36479](https://github.com/angular/angular/issues/36479)
* **router:** correctly handle string command in outlets ([#39728](https://github.com/angular/angular/issues/39728)) ([50c19a2](https://github.com/angular/angular/commit/50c19a2)), closes [#18928](https://github.com/angular/angular/issues/18928)
* **router:** remove duplicated getOutlet function ([#39764](https://github.com/angular/angular/issues/39764)) ([df231ad](https://github.com/angular/angular/commit/df231ad))
* **service-worker:** correctly handle failed cache-busted request ([#39786](https://github.com/angular/angular/issues/39786)) ([7bf73d7](https://github.com/angular/angular/commit/7bf73d7)), closes [#39775](https://github.com/angular/angular/issues/39775) [#39775](https://github.com/angular/angular/issues/39775)

### DEPRECATIONS

* **forms:** Mark the {[key: string]: any} type for the options property of the FormBuilder.group method as deprecated. Using AbstractControlOptions gives the same functionality and is type-safe.

<!-- CHANGELOG SPLIT MARKER -->

<a name="11.0.2"></a>
## 11.0.2 (2020-11-19)


### Bug Fixes

* **router:** migration incorrectly replacing deprecated key ([#39763](https://github.com/angular/angular/issues/39763)) ([0237845](https://github.com/angular/angular/commit/0237845)), closes [#38762](https://github.com/angular/angular/issues/38762) [#39755](https://github.com/angular/angular/issues/39755)

<!-- CHANGELOG SPLIT MARKER -->

<a name="11.0.1"></a>
## 11.0.1 (2020-11-18)


### Bug Fixes

* **compiler-cli:** incorrectly type checking calls to implicit template variables ([#39686](https://github.com/angular/angular/issues/39686)) ([e05cfdd](https://github.com/angular/angular/commit/e05cfdd)), closes [#39634](https://github.com/angular/angular/issues/39634)       * **compiler-cli:** setComponentScope should only list used components/pipes ([#39662](https://github.com/angular/angular/issues/39662)) ([8d317df](https://github.com/angular/angular/commit/8d317df))                                                                               * **core:** handle !important in style property value ([#39603](https://github.com/angular/angular/issues/39603)) ([978f081](https://github.com/angular/angular/commit/978f081)), closes [#35323](https://github.com/angular/angular/issues/35323)                                    * **core:** not inserting ViewContainerRef nodes when inside root of a component ([#39599](https://github.com/angular/angular/issues/39599)) ([20db90a](https://github.com/angular/angular/commit/20db90a)), closes [#39556](https://github.com/angular/angular/issues/39556)         * **core:** remove deprecated wtfZoneSpec from NgZone ([#37864](https://github.com/angular/angular/issues/37864)) ([e02bea8](https://github.com/angular/angular/commit/e02bea8)), closes [#33949](https://github.com/angular/angular/issues/33949)
* **forms:** more precise control cleanup ([#39623](https://github.com/angular/angular/issues/39623)) ([050cea9](https://github.com/angular/angular/commit/050cea9))
* **http:** queue jsonp <script> tag onLoad event handler in microtask ([#39512](https://github.com/angular/angular/issues/39512)) ([10e4ac0](https://github.com/angular/angular/commit/10e4ac0)), closes [#39496](https://github.com/angular/angular/issues/39496)

### Performance Improvements

* **compiler:** optimize computation of i18n message ids ([#39694](https://github.com/angular/angular/issues/39694)) ([1891455](https://github.com/angular/angular/commit/1891455))
* **compiler:** use raw bytes to represent utf-8 encoded strings ([#39694](https://github.com/angular/angular/issues/39694)) ([882ff8f](https://github.com/angular/angular/commit/882ff8f))
* **compiler-cli:** reduce filesystem hits during resource resolution ([#39604](https://github.com/angular/angular/issues/39604)) ([a7adcbd](https://github.com/angular/angular/commit/a7adcbd))

<!-- CHANGELOG SPLIT MARKER -->

<a name="11.0.0"></a>
# 11.0.0 (2020-11-11)

[Blog post "Version 11 of Angular Now Available"](https://blog.angular.io/version-11-of-angular-now-available-74721b7952f7).


### Bug Fixes

* **bazel:** only providing stamping information if the `--stamp` flag is used ([#39392](https://github.com/angular/angular/issues/39392)) ([84e09a0](https://github.com/angular/angular/commit/84e09a0))
* **common:** do not round up fractions of a millisecond in `DatePipe` ([#38009](https://github.com/angular/angular/issues/38009)) ([26f2820](https://github.com/angular/angular/commit/26f2820)), closes [#37989](https://github.com/angular/angular/issues/37989)
* **common:** mark locale data arrays as readonly ([#30397](https://github.com/angular/angular/issues/30397)) ([6acea54](https://github.com/angular/angular/commit/6acea54)), closes [#27003](https://github.com/angular/angular/issues/27003)
* **common:** add `params` and `reportProgress` options to `HttpClient.put()` overload ([#37873](https://github.com/angular/angular/issues/37873)) ([dd8d8c8](https://github.com/angular/angular/commit/dd8d8c8)), closes [#23600](https://github.com/angular/angular/issues/23600)
* **common:** correct and simplify typing of `KeyValuePipe` ([#37447](https://github.com/angular/angular/issues/37447)) ([4dfe0fa](https://github.com/angular/angular/commit/4dfe0fa))
* **common:** correct and simplify typing of `AsyncPipe` ([#37447](https://github.com/angular/angular/issues/37447)) ([5f815c0](https://github.com/angular/angular/commit/5f815c0))
* **common:** correct and simplify typing of `I18nPluralPipe` ([#37447](https://github.com/angular/angular/issues/37447)) ([3b919ef](https://github.com/angular/angular/commit/3b919ef))
* **common:** correct typing and implementation of `SlicePipe` ([#37447](https://github.com/angular/angular/issues/37447)) ([4744c22](https://github.com/angular/angular/commit/4744c22))
* **common:** let case conversion pipes accept type unions with `null` ([#37447](https://github.com/angular/angular/issues/37447)) ([c7d5555](https://github.com/angular/angular/commit/c7d5555)), closes [#36259](https://github.com/angular/angular/issues/36259)
* **common:** add boolean to valid json for testing ([#37893](https://github.com/angular/angular/issues/37893)) ([3c474ec](https://github.com/angular/angular/commit/3c474ec)), closes [#20690](https://github.com/angular/angular/issues/20690)
* **common:** update locales using new CLDR data ([#39343](https://github.com/angular/angular/issues/39343)) ([3738233](https://github.com/angular/angular/commit/3738233))
* **common:** change the week-numbering year format from `r` -> `Y` ([#39495](https://github.com/angular/angular/issues/39495)) ([feda78e](https://github.com/angular/angular/commit/feda78e))
* **compiler:** source span for microsyntax text att should be key span ([#38766](https://github.com/angular/angular/issues/38766)) ([8f349b2](https://github.com/angular/angular/commit/8f349b2))
* **compiler:** promote constants in templates to Trusted Types ([#39211](https://github.com/angular/angular/issues/39211)) ([6e18d2d](https://github.com/angular/angular/commit/6e18d2d))
* **compiler:** do not throw away render3 AST on errors ([#39413](https://github.com/angular/angular/issues/39413)) ([d76beda](https://github.com/angular/angular/commit/d76beda))
* **compiler:** treat i18n attributes with no bindings as static attributes ([#39408](https://github.com/angular/angular/issues/39408)) ([bf1caa7](https://github.com/angular/angular/commit/bf1caa7)), closes [#38231](https://github.com/angular/angular/issues/38231)
* **compiler:** preserve `this.$event` and `this.$any` accesses in expressions ([#39323](https://github.com/angular/angular/issues/39323)) ([a8e0db7](https://github.com/angular/angular/commit/a8e0db7)), closes [#30278](https://github.com/angular/angular/issues/30278)
* **compiler:** ensure that i18n message-parts have the correct source-span ([#39486](https://github.com/angular/angular/issues/39486)) ([63f9e16](https://github.com/angular/angular/commit/63f9e16))
* **compiler:** skipping leading whitespace should not break placeholder source-spans ([#39486](https://github.com/angular/angular/issues/39486)) ([b8e9b3d](https://github.com/angular/angular/commit/b8e9b3d)), closes [#39195](https://github.com/angular/angular/issues/39195)
* **compiler-cli:** compute source-mappings for localized strings ([#38645](https://github.com/angular/angular/issues/38645)) ([7e0b3fd](https://github.com/angular/angular/commit/7e0b3fd))
* **compiler-cli:** generate `let` statements in ES2015+ mode ([#38775](https://github.com/angular/angular/issues/38775)) ([123bff7](https://github.com/angular/angular/commit/123bff7))
* **compiler-cli:** perform DOM schema checks even in basic mode in g3 ([#38943](https://github.com/angular/angular/issues/38943)) ([40975e0](https://github.com/angular/angular/commit/40975e0))
* **compiler-cli:** type checking of expressions within ICUs ([#39072](https://github.com/angular/angular/issues/39072)) ([0a16e60](https://github.com/angular/angular/commit/0a16e60)), closes [#39064](https://github.com/angular/angular/issues/39064)
* **compiler-cli:** generating invalid `setClassMetadata` call in ES5 for class with custom decorator ([#39527](https://github.com/angular/angular/issues/39527)) ([b0bbc1f](https://github.com/angular/angular/commit/b0bbc1f)), closes [#39509](https://github.com/angular/angular/issues/39509)
* **compiler-cli:** report missing pipes when `fullTemplateTypeCheck` is disabled ([#39320](https://github.com/angular/angular/issues/39320)) ([67ea7b6](https://github.com/angular/angular/commit/67ea7b6)), closes [#38195](https://github.com/angular/angular/issues/38195)
* **compiler-cli:** avoid duplicate diagnostics about unknown pipes ([#39517](https://github.com/angular/angular/issues/39517)) ([c68ca49](https://github.com/angular/angular/commit/c68ca49))
* **compiler-cli:** do not drop non-Angular decorators when downleveling ([#39577](https://github.com/angular/angular/issues/39577)) ([f51cf29](https://github.com/angular/angular/commit/f51cf29)), closes [#39574](https://github.com/angular/angular/issues/39574)
* **core:** remove `CollectionChangeRecord` symbol ([#38668](https://github.com/angular/angular/issues/38668)) ([fdea180](https://github.com/angular/angular/commit/fdea180))
* **core:** ensure `TestBed` is not instantiated before override provider ([#38717](https://github.com/angular/angular/issues/38717)) ([c8f056b](https://github.com/angular/angular/commit/c8f056b))
* **core:** use single quotes for relative link resolution migration to align with style guide ([#39070](https://github.com/angular/angular/issues/39070)) ([8894706](https://github.com/angular/angular/commit/8894706))
* **core:** migrate relative link resolution with single quotes ([#39102](https://github.com/angular/angular/issues/39102)) ([049b453](https://github.com/angular/angular/commit/049b453))
* **core:** use Trusted Types policy in inert DOM builder ([#39208](https://github.com/angular/angular/issues/39208)) ([7d49299](https://github.com/angular/angular/commit/7d49299))
* **core:** use Trusted Types policy in `createNamedArrayType()` ([#39209](https://github.com/angular/angular/issues/39209)) ([f6d5cdf](https://github.com/angular/angular/commit/f6d5cdf))
* **core:** guard reading of global `ngDevMode` for undefined. ([#36055](https://github.com/angular/angular/issues/36055)) ([f541e5f](https://github.com/angular/angular/commit/f541e5f))
* **core:** do not error when `ngDevMode` is undeclared ([#39415](https://github.com/angular/angular/issues/39415)) ([cc32932](https://github.com/angular/angular/commit/cc32932))
* **core:** store ICU state in `LView` rather than in `TView` ([#39233](https://github.com/angular/angular/issues/39233)) ([0992b67](https://github.com/angular/angular/commit/0992b67)), closes [#37021](https://github.com/angular/angular/issues/37021) [#38144](https://github.com/angular/angular/issues/38144) [#38073](https://github.com/angular/angular/issues/38073)
* **core:** `markDirty()` should only mark flags when really scheduling tick. ([#39316](https://github.com/angular/angular/issues/39316)) ([3b6497b](https://github.com/angular/angular/commit/3b6497b)), closes [#39296](https://github.com/angular/angular/issues/39296)
* **core:** access injected parent values using `SkipSelf` ([#39464](https://github.com/angular/angular/issues/39464)) ([7cb9e19](https://github.com/angular/angular/commit/7cb9e19))
* **elements:** update the view of an `OnPush` component when inputs change ([#39452](https://github.com/angular/angular/issues/39452)) ([dd28855](https://github.com/angular/angular/commit/dd28855)), closes [#38948](https://github.com/angular/angular/issues/38948)
* **forms:** ensure to emit `statusChanges` on subsequent value update/validations ([#38354](https://github.com/angular/angular/issues/38354)) ([d9fea85](https://github.com/angular/angular/commit/d9fea85)), closes [#20424](https://github.com/angular/angular/issues/20424) [#14542](https://github.com/angular/angular/issues/14542)
* **forms:** type `NG_VALUE_ACCESSOR` injection token as array ([#29723](https://github.com/angular/angular/issues/29723)) ([2b1b718](https://github.com/angular/angular/commit/2b1b718)), closes [#29351](https://github.com/angular/angular/issues/29351)
* **forms:** improve types of directive constructor arguments ([#38944](https://github.com/angular/angular/issues/38944)) ([246de9a](https://github.com/angular/angular/commit/246de9a))
* **forms:** include `null` in `.parent` of abstract control ([#32671](https://github.com/angular/angular/issues/32671)) ([f4f1bcc](https://github.com/angular/angular/commit/f4f1bcc)), closes [#16999](https://github.com/angular/angular/issues/16999)
* **forms:** remove validators while cleaning up a control ([#39234](https://github.com/angular/angular/issues/39234)) ([43b4940](https://github.com/angular/angular/commit/43b4940))
* **language-service:** hybrid visitor returns parent node of `BoundAttribute` ([#38995](https://github.com/angular/angular/issues/38995)) ([323be39](https://github.com/angular/angular/commit/323be39))
* **language-service:** [Ivy] hybrid visitor should not locate let keyword ([#39061](https://github.com/angular/angular/issues/39061)) ([70e13dc](https://github.com/angular/angular/commit/70e13dc))
* **language-service:** [Ivy] create compiler only when program changes ([#39231](https://github.com/angular/angular/issues/39231)) ([8f1317f](https://github.com/angular/angular/commit/8f1317f))
* **localize:** render placeholder types in extracted XLIFF files ([#39398](https://github.com/angular/angular/issues/39398)) ([32163ef](https://github.com/angular/angular/commit/32163ef)), closes [#38791](https://github.com/angular/angular/issues/38791)
* **localize:** serialize all the message locations to XLIFF ([#39411](https://github.com/angular/angular/issues/39411)) ([f5710c6](https://github.com/angular/angular/commit/f5710c6)), closes [#39330](https://github.com/angular/angular/issues/39330)
* **ngcc:** ensure that "inline exports" can be interpreted correctly ([#39267](https://github.com/angular/angular/issues/39267)) ([822b838](https://github.com/angular/angular/commit/822b838))
* **ngcc:** capture UMD/CommonJS inner class implementation node correctly ([#39346](https://github.com/angular/angular/issues/39346)) ([fc2e3cc](https://github.com/angular/angular/commit/fc2e3cc))
* **platform-server:** resolve absolute URL from `baseUrl` ([#39334](https://github.com/angular/angular/issues/39334)) ([b4e8399](https://github.com/angular/angular/commit/b4e8399))
* **platform-webworker:** remove @angular/platform-webworker and @angular/platform-webworker-dynamic ([#38846](https://github.com/angular/angular/issues/38846)) ([93c3d8f](https://github.com/angular/angular/commit/93c3d8f))
* **router:** fix arguments order for call to `shouldReuseRoute` ([#26949](https://github.com/angular/angular/issues/26949)) ([3817e5f](https://github.com/angular/angular/commit/3817e5f)), closes [#16192](https://github.com/angular/angular/issues/16192)
* **router:** support lazy loading for empty path named outlets ([#38379](https://github.com/angular/angular/issues/38379)) ([926ffcd](https://github.com/angular/angular/commit/926ffcd)), closes [#12842](https://github.com/angular/angular/issues/12842)
* **router:** set `relativeLinkResolution` to `corrected` by default ([#25609](https://github.com/angular/angular/issues/25609)) ([837889f](https://github.com/angular/angular/commit/837889f))
* **router:** properly assign `ExtraOptions` to `Router` in `RouterTestingModule` ([#39096](https://github.com/angular/angular/issues/39096)) ([d8c0534](https://github.com/angular/angular/commit/d8c0534)), closes [#23347](https://github.com/angular/angular/issues/23347)
* **router:** allow undefined inputs on `routerLink` ([#39151](https://github.com/angular/angular/issues/39151)) ([b0b4953](https://github.com/angular/angular/commit/b0b4953))
* **router:** create schematic for `preserveQueryParams` ([#38762](https://github.com/angular/angular/issues/38762)) ([93ee05d](https://github.com/angular/angular/commit/93ee05d))
* **router:** remove `preserveQueryParams` symbol ([#38762](https://github.com/angular/angular/issues/38762)) ([783a5bd](https://github.com/angular/angular/commit/783a5bd))
* **router:** fix incorrect type signature for `createUrlTree` ([#39347](https://github.com/angular/angular/issues/39347)) ([161b278](https://github.com/angular/angular/commit/161b278))
* **router:** ensure all outlets are used when commands have a prefix ([#39456](https://github.com/angular/angular/issues/39456)) ([b2f3952](https://github.com/angular/angular/commit/b2f3952))
* **service-worker:** fix condition to check for a cache-busted request ([#36847](https://github.com/angular/angular/issues/36847)) ([5be4edf](https://github.com/angular/angular/commit/5be4edf))


### Features

* **common:** add ISO week-numbering year formats support to `formatDate` ([#38828](https://github.com/angular/angular/issues/38828)) ([984ed39](https://github.com/angular/angular/commit/984ed39))
* **common:** stricter types for `DatePipe` ([#37447](https://github.com/angular/angular/issues/37447)) ([daf8b7f](https://github.com/angular/angular/commit/daf8b7f))
* **common:** stricter types for number pipes ([#37447](https://github.com/angular/angular/issues/37447)) ([7b2aac9](https://github.com/angular/angular/commit/7b2aac9))
* **compiler:** parse and recover on incomplete opening HTML tags ([#38681](https://github.com/angular/angular/issues/38681)) ([6ae3b68](https://github.com/angular/angular/commit/6ae3b68)), closes [#38596](https://github.com/angular/angular/issues/38596)
* **compiler:** add `keySpan` to `Variable` node ([#38965](https://github.com/angular/angular/issues/38965)) ([239968d](https://github.com/angular/angular/commit/239968d))
* **compiler-cli:** `TemplateTypeChecker` operation to get `Symbol` from a template node ([#38618](https://github.com/angular/angular/issues/38618)) ([c4556db](https://github.com/angular/angular/commit/c4556db))
* **compiler-cli:** add ability to get `Symbol` of `Template`s and `Element`s in component template ([#38618](https://github.com/angular/angular/issues/38618)) ([cf2e8b9](https://github.com/angular/angular/commit/cf2e8b9))
* **compiler-cli:** add ability to get `Symbol` of AST expression in component template ([#38618](https://github.com/angular/angular/issues/38618)) ([f56ece4](https://github.com/angular/angular/commit/f56ece4))
* **compiler-cli:** add ability to get symbol of reference or variable ([#38618](https://github.com/angular/angular/issues/38618)) ([19598b4](https://github.com/angular/angular/commit/19598b4))
* **compiler-cli:** define interfaces to be used for `TemplateTypeChecker` ([#38618](https://github.com/angular/angular/issues/38618)) ([9e77bd3](https://github.com/angular/angular/commit/9e77bd3))
* **compiler-cli:** support getting resource dependencies for a source file ([#38048](https://github.com/angular/angular/issues/38048)) ([5dbf357](https://github.com/angular/angular/commit/5dbf357))
* **core:** add automated migration to replace `async` with `waitForAsync` ([#39212](https://github.com/angular/angular/issues/39212)) ([5ce71e0](https://github.com/angular/angular/commit/5ce71e0))
* **core:** add automated migration to replace `ViewEncapsulation.Native` ([#38882](https://github.com/angular/angular/issues/38882)) ([0e733f3](https://github.com/angular/angular/commit/0e733f3))
* **core:** add `initialNavigation` schematic ([#36926](https://github.com/angular/angular/issues/36926)) ([0ec7043](https://github.com/angular/angular/commit/0ec7043))
* **core:** add Trusted Types workaround for `Function` constructor ([#39209](https://github.com/angular/angular/issues/39209)) ([5913e5c](https://github.com/angular/angular/commit/5913e5c))
* **core:** create internal Trusted Types module ([#39207](https://github.com/angular/angular/issues/39207)) ([0875fd2](https://github.com/angular/angular/commit/0875fd2))
* **core:** depend on type definitions for Trusted Types ([#39207](https://github.com/angular/angular/issues/39207)) ([c4266fb](https://github.com/angular/angular/commit/c4266fb))
* **core:** remove `ViewEncapsulation.Native` ([#38882](https://github.com/angular/angular/issues/38882)) ([4a1c12c](https://github.com/angular/angular/commit/4a1c12c))
* **forms:** add migration for `AbstractControl.parent` accesses ([#39009](https://github.com/angular/angular/issues/39009)) ([aeec223](https://github.com/angular/angular/commit/aeec223)), closes [#32671](https://github.com/angular/angular/issues/32671)
* **language-service:** add `getDefinitionAndBoundSpan` (go to definition) ([#39101](https://github.com/angular/angular/issues/39101)) ([3975dd9](https://github.com/angular/angular/commit/3975dd9))
* **language-service:** add quick info for inline templates in ivy ([#39060](https://github.com/angular/angular/issues/39060)) ([904adb7](https://github.com/angular/angular/commit/904adb7))
* **language-service:** [Ivy] `getSemanticDiagnostics` for external templates ([#39065](https://github.com/angular/angular/issues/39065)) ([63624a2](https://github.com/angular/angular/commit/63624a2))
* **language-service:** add `getTypeDefinitionAtPosition` (go to type definition) ([#39145](https://github.com/angular/angular/issues/39145)) ([a84976f](https://github.com/angular/angular/commit/a84976f))
* **language-service:** add module name to directive quick info ([#39121](https://github.com/angular/angular/issues/39121)) ([4604fe9](https://github.com/angular/angular/commit/4604fe9))
* **router:** add migration to update calls to `navigateByUrl` and `createUrlTree` with invalid parameters ([#38825](https://github.com/angular/angular/issues/38825)) ([7849fdd](https://github.com/angular/angular/commit/7849fdd))
* **router:** add `relativeLinkResolution` migration to update default value ([#38698](https://github.com/angular/angular/issues/38698)) ([15ea811](https://github.com/angular/angular/commit/15ea811))
* **router:** add new `initialNavigation` options to replace legacy ([#37480](https://github.com/angular/angular/issues/37480)) ([c4becca](https://github.com/angular/angular/commit/c4becca))
* **service-worker:** add `UnrecoverableStateError` ([#36847](https://github.com/angular/angular/issues/36847)) ([036a2fa](https://github.com/angular/angular/commit/036a2fa)), closes [#36539](https://github.com/angular/angular/issues/36539)
* **service-worker:** add the option to prefer network for navigation requests ([#38565](https://github.com/angular/angular/issues/38565)) ([a206852](https://github.com/angular/angular/commit/a206852)), closes [#38194](https://github.com/angular/angular/issues/38194)


### Performance Improvements

* **compiler-cli:** only emit directive/pipe references that are used ([#38539](https://github.com/angular/angular/issues/38539)) ([077f516](https://github.com/angular/angular/commit/077f516))
* **compiler-cli:** optimize computation of type-check scope information ([#38539](https://github.com/angular/angular/issues/38539)) ([297c060](https://github.com/angular/angular/commit/297c060))
* **compiler-cli:** only generate template context declaration when used ([#39321](https://github.com/angular/angular/issues/39321)) ([1ac0500](https://github.com/angular/angular/commit/1ac0500))
* **core:** do not recurse into modules that have already been registered ([#39514](https://github.com/angular/angular/issues/39514)) ([5c13c67](https://github.com/angular/angular/commit/5c13c67)), closes [#39487](https://github.com/angular/angular/issues/39487)
* **router:** use `ngDevMode` to tree-shake error messages in router ([#38674](https://github.com/angular/angular/issues/38674)) ([db21c4f](https://github.com/angular/angular/commit/db21c4f))


### BREAKING CHANGES

* **common:**
  - **[6acea54](https://github.com/angular/angular/commit/6acea54f62fe7e62e9b36458b30d98501277236f):**
    The locale data API has been marked as returning readonly arrays, rather than mutable arrays, since these arrays are shared across calls to the API.
    If you were mutating them (e.g. calling `sort()`, `push()`, `splice()`, etc.) then your code will no longer compile.
    If you need to mutate the array, you should now make a copy (e.g. by calling `slice()`) and mutate the copy.
  - **[26f2820](https://github.com/angular/angular/commit/26f28200bf3a909024184c61111f4cd20ac41edd):**
    When passing a date-time formatted string to the `DatePipe` in a format that contains fractions of a millisecond, the milliseconds will now always be rounded down rather than to the nearest millisecond.
    Most applications will not be affected by this change.
    If this is not the desired behaviour then consider pre-processing the string to round the millisecond part before passing it to the `DatePipe`.
  - **[4744c22](https://github.com/angular/angular/commit/4744c229dbd372746a38ebbcdae2245f945ebcc4):**
    The `slice` pipe now returns `null` for the `undefined` input value, which is consistent with the behavior of most pipes.
    If you rely on `undefined` being the result in that case, you now need to check for it explicitly.
  - **[4dfe0fa](https://github.com/angular/angular/commit/4dfe0fa068007c28ca3b4a1476ed4ba1d2d86064):**
    The typing of the `keyvalue` pipe has been fixed to report that for input objects that have `number` keys, the result will contain the string representation of the keys.
    This was already the case and the types have simply been updated to reflect this.
    Please update the consumers of the pipe output if they were relying on the incorrect types.
    Note that this does not affect use cases where the input values are `Map`s, so if you need to preserve `number`s, this is an effective way.
  - **[7b2aac9](https://github.com/angular/angular/commit/7b2aac97df63717fd2dfbb81903d12221ae29ba1):**
    The signatures of the number pipes now explicitly state which types are accepted.
    This should only cause issues in corner cases, as any other values would result in runtime exceptions.
  - **[daf8b7f](https://github.com/angular/angular/commit/daf8b7f10038c7ecf7ea78bc6fe39766c85224a6):**
    The signature of the `date` pipe now explicitly states which types are accepted.
    This should only cause issues in corner cases, as any other values would result in runtime exceptions.
  - **[5f815c0](https://github.com/angular/angular/commit/5f815c05650c15e414fe72cddaa2b690a7962273):**
    The `async` pipe no longer claims to return `undefined` for an input that was typed as `undefined`.
    Note that the code actually returned `null` on `undefined` inputs.
    In the unlikely case you were relying on this, please fix the typing of the consumers of the pipe output.
  - **[c7d5555](https://github.com/angular/angular/commit/c7d5555dfb14f5deca4a2d947fe82a68453e5f09):**
    The case conversion pipes no longer let falsy values through.
    They now map both `null` and `undefined` to `null` and raise an exception on invalid input (`0`, `false`, `NaN`) just like most "common pipes".
    If your code required falsy values to pass through, you need to handle them explicitly.
* **compiler:**
  - **[736e064](https://github.com/angular/angular/commit/736e0644b02bc4606a7ae0c974d1b06e993708f6):**
    TypeScript 3.9 is no longer supported, please upgrade to TypeScript 4.0.
* **compiler-cli:**
  - **[0a16e60](https://github.com/angular/angular/commit/0a16e60afae27c7af023cf617de05297dddf5135):**
    Expressions within ICUs are now type-checked again, fixing a regression in Ivy.
    This may cause compilation failures if errors are found in expressions that appear within an ICU.
    Please correct these expressions to resolve the type-check errors.
* **core:**
  - **[fdea180](https://github.com/angular/angular/commit/fdea1804d6d46d33c71640972ff45a8d5cc82f8b):**
    `CollectionChangeRecord` has been removed, use `IterableChangeRecord` instead.
  - **[c8f056b](https://github.com/angular/angular/commit/c8f056beb696d176530ee4e86f64964c3b834c9a):**
    If you call `TestBed.overrideProvider` after TestBed initialization, provider overrides are not applied.
    This behavior is consistent with other override methods (such as `TestBed.overrideDirective`, etc.) but they throw an error to indicate that, when the check was missing in the `TestBed.overrideProvider` function.
    Now calling `TestBed.overrideProvider` after `TestBed` initialization also triggers an error, thus there is a chance that some tests (where `TestBed.overrideProvider` is called after `TestBed` initialization) will start to fail and require updates to move `TestBed.overrideProvider` calls before `TestBed` initialization is completed.
  - **[4ca1c73](https://github.com/angular/angular/commit/4ca1c736bb020de166b6a1fbfb9fe264602ccd5c):**
    In v10, IE 9, 10, and IE mobile support was deprecated.
    In v11, Angular framework removes IE 9, 10, and IE mobile support completely.
    Supporting outdated browsers like these increases bundle size, code complexity, and test load, and also requires time and effort that could be spent on improvements to the framework.
    For example, fixing issues can be more difficult, as a straightforward fix for modern browsers could break old ones that have quirks due to not receiving updates from vendors.
  - **[4a1c12c](https://github.com/angular/angular/commit/4a1c12c773f14dbfc5db61087f415d56f60127cf):**
    `ViewEncapsulation.Native` has been removed. Use `ViewEncapsulation.ShadowDom` instead.
    Existing usages will be updated automatically by `ng update`.
* **forms:**
  - **[d9fea85](https://github.com/angular/angular/commit/d9fea857db0638149f200ca86c7852c01c9787f4):**
    Previously if `FormControl`, `FormGroup` and `FormArray` class instances had async validators defined at initialization time, the status change event was not emitted once async validators completed.
    After this change the status event is emitted into the `statusChanges` observable.
    If your code relies on the old behavior, you can filter/ignore this additional status change event.
  - **[246de9a](https://github.com/angular/angular/commit/246de9aaad2a85c39f4e624ba25e444d716fe486):**
    Directives in the `@angular/forms` package used to have `any[]` as a type of `validators` and `asyncValidators` arguments in constructors.
    Now these arguments are properly typed, so if your code relies on directive constructor types it may require some updates to improve type safety.
  - **[f4f1bcc](https://github.com/angular/angular/commit/f4f1bcc99711be277205dcd8ef6fc5a1873cb227):**
    Type of `AbstractFormControl.parent` now includes `null`.
    `null` is now included in the types of `.parent`.
    If you don't already have a check for this case, the TypeScript compiler might complain.
    A v11 migration exists which adds the non-null assertion operator where necessary.
    In an unlikely case your code was testing the parent against `undefined` with strict equality, you'll need to change this to `=== null` instead, since the parent is now explicitly initialized with `null` instead of being left `undefined`.
* **platform-server:**
  - **[b4e8399](https://github.com/angular/angular/commit/b4e8399144ae4b6d4f0da9ff2a8e1fa73643f766):**
    If you use `useAbsoluteUrl` to set up `platform-server`, you now need to also specify `baseUrl`.
    We are intentionally making this a breaking change in a minor release, because if `useAbsoluteUrl` is set to `true` then the behavior of the application could be unpredictable, resulting in issues that are hard to discover but could be affecting production environments.
* **platform-webworker:**
  - **[93c3d8f](https://github.com/angular/angular/commit/93c3d8f9fd79014bf700a1447503f5ee6f170bf9):**
    @angular/platform-webworker and @angular/platform-webworker-dynamic have been removed as they were deprecated in v8.
* **router:**
  - **[3817e5f](https://github.com/angular/angular/commit/3817e5f1dfeb9de26fa2ea4068a37565f435214f):**
    This change corrects the argument order when calling `RouteReuseStrategy#shouldReuseRoute`.
    Previously, when evaluating child routes, they would be called with the future and current arguments would be swapped.
    If your `RouteReuseStrategy` relies specifically on only the future or current snapshot state, you may need to update the `shouldReuseRoute` implementation's use of "future" and "current" `ActivatedRouteSnapshot`s.
  - **[e4f4d18](https://github.com/angular/angular/commit/e4f4d18e7e73a7c755d3b79cf599e0e04270000d):**
    While the new parameter types allow a variable of type `NavigationExtras` to be passed in, they will not allow object literals, as they may only specify known properties.
    They will also not accept types that do not have properties in common with the ones in the `Pick`.
    To fix this error, only specify properties from the `NavigationExtras` which are actually used in the respective function calls or use a type assertion on the object or variable: `as NavigationExtras`.
  - **[837889f](https://github.com/angular/angular/commit/837889f0a47521d3de5c445ac3ffeedfe47fc109):**
    This commit changes the default value of `relativeLinkResolution` from `'legacy'` to `'default'`.
    If your application previously used the default by not specifying a value in the `ExtraOptions` and uses relative links when navigating from children of empty path routes, you will need to update your `RouterModule` to specifically specify `'legacy'` for `relativeLinkResolution`.
    See https://angular.io/api/router/ExtraOptions#relativeLinkResolution for more details.
  - **[c4becca](https://github.com/angular/angular/commit/c4becca0e4238640461c43567a6d3e16b8c5d3f3):**
    The `initialNavigation` property for the options in `RouterModule.forRoot` no longer supports `legacy_disabled`, `legacy_enabled`, `true`, or `false` as valid values.
    `legacy_enabled` (the old default) is instead `enabledNonBlocking`.
  - **[c4becca](https://github.com/angular/angular/commit/c4becca0e4238640461c43567a6d3e16b8c5d3f3):**
    `enabled` is deprecated as a valid value for the `RouterModule.forRoot` `initialNavigation` option.
    `enabledBlocking` has been introduced to replace it.
  - **[783a5bd](https://github.com/angular/angular/commit/783a5bd7bbae35562e21aaa27771c54091fb9812):**
    `preserveQueryParams` has been removed, use `queryParamsHandling: "preserve"` instead.
  - **[b0b4953](https://github.com/angular/angular/commit/b0b4953fd654aeda2f358b0af1ab32d20b368930):**
    If you were accessing the `RouterLink` values of `queryParams`, `fragment` or `queryParamsHandling` you might need to relax the typing to also accept `undefined` and `null`.


### Code Refactoring

* **compiler:** remove support for TypeScript 3.9 ([#39313](https://github.com/angular/angular/issues/39313)) ([736e064](https://github.com/angular/angular/commit/736e0644b02bc4606a7ae0c974d1b06e993708f6))
* **router:** adjust type of parameter in `navigateByUrl` and `createUrlTree` to be more accurate ([#38227](https://github.com/angular/angular/issues/38227)) ([e4f4d18](https://github.com/angular/angular/commit/e4f4d18)), closes [#18798](https://github.com/angular/angular/issues/18798)