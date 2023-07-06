<a name="16.1.4"></a>
# 16.1.4 (2023-07-06)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [4ba5850ba6](https://github.com/angular/angular/commit/4ba5850ba6b1748cf02b94649ab1ec359b4540ad) | fix | use `setTimeout` when coalescing tasks in Node.js ([#50820](https://github.com/angular/angular/pull/50820)) |
### upgrade
| Commit | Type | Description |
| -- | -- | -- |
| [a4348355ce](https://github.com/angular/angular/commit/a4348355ce630273f762099fe6887a90ef799119) | fix | allow for downgraded components to work with component-router ([#50871](https://github.com/angular/angular/pull/50871)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.2.0-next.1"></a>
# 16.2.0-next.1 (2023-06-28)
### benchpress
| Commit | Type | Description |
| -- | -- | -- |
| [dd850b2ab7](https://github.com/angular/angular/commit/dd850b2ab781f24065550f8a948ced498e0f1e99) | fix | correctly report GC memory amounts ([#50760](https://github.com/angular/angular/pull/50760)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [29340a0678](https://github.com/angular/angular/commit/29340a06789652e359e61b32f1814dcd20d9bd26) | fix | expose input transform function on ComponentFactory and ComponentMirror ([#50713](https://github.com/angular/angular/pull/50713)) |
### elements
| Commit | Type | Description |
| -- | -- | -- |
| [d64864e95e](https://github.com/angular/angular/commit/d64864e95e193e46180aeaf0d634152327650871) | fix | support input transform functions ([#50713](https://github.com/angular/angular/pull/50713)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [2b55103e94](https://github.com/angular/angular/commit/2b55103e94578ab1cb765147077e82e1228b0dbb) | fix | wait until animation completion before destroying renderer ([#50677](https://github.com/angular/angular/pull/50677)) |
| [0380564f85](https://github.com/angular/angular/commit/0380564f8562f5971cff671319439ad0f2b40a7e) | fix | wait until animation completion before destroying renderer ([#50860](https://github.com/angular/angular/pull/50860)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.1.3"></a>
# 16.1.3 (2023-06-28)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [dd6fc5785f](https://github.com/angular/angular/commit/dd6fc5785fcf10b88db8b87d726af604668bc143) | fix | expose input transform function on ComponentFactory and ComponentMirror ([#50713](https://github.com/angular/angular/pull/50713)) |
### elements
| Commit | Type | Description |
| -- | -- | -- |
| [e1bbe47c23](https://github.com/angular/angular/commit/e1bbe47c234a495766cc07a9741a194954a6b9b4) | fix | support input transform functions ([#50713](https://github.com/angular/angular/pull/50713)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [79dd6a847a](https://github.com/angular/angular/commit/79dd6a847a742ccf69597b122026758ad2b0b629) | fix | wait until animation completion before destroying renderer ([#50677](https://github.com/angular/angular/pull/50677)) |
| [a797f41d1b](https://github.com/angular/angular/commit/a797f41d1bcf11945673ef6d0474f33ad4614602) | fix | wait until animation completion before destroying renderer ([#50860](https://github.com/angular/angular/pull/50860)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.2.0-next.0"></a>
# 16.2.0-next.0 (2023-06-21)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [12bad6576d](https://github.com/angular/angular/commit/12bad6576d2ffe4667118b214d9c7598ed3d8edb) | fix | libraries compiled with v16.1+ breaking with Angular framework v16.0.x ([#50714](https://github.com/angular/angular/pull/50714)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [0b14e4ef74](https://github.com/angular/angular/commit/0b14e4ef742b1c0f73d873e2c337683b60f46845) | feat | exposes the `fixture` of the `RouterTestingHarness` ([#50280](https://github.com/angular/angular/pull/50280)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.1.2"></a>
# 16.1.2 (2023-06-21)
### http
| Commit | Type | Description |
| -- | -- | -- |
| [9488a3fd46](https://github.com/angular/angular/commit/9488a3fd4640b902243f441cf54776160da1a0fe) | fix | Send query params on fetch request ([#50740](https://github.com/angular/angular/pull/50740)) |
| [5ae001829c](https://github.com/angular/angular/commit/5ae001829c3f3594e3c10f30e0b89ea1eb2b84fb) | fix | use serializeBody to support JSON payload in FetchBackend ([#50776](https://github.com/angular/angular/pull/50776)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.1.1"></a>
# 16.1.1 (2023-06-14)
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [71360b3a3e](https://github.com/angular/angular/commit/71360b3a3e7cb3419176c89f8c78ebd2e14ff880) | fix | libraries compiled with v16.1+ breaking with Angular framework v16.0.x ([#50715](https://github.com/angular/angular/pull/50715)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [d9bed48eb5](https://github.com/angular/angular/commit/d9bed48eb590bc4a45769835bccc206d418f620c) | fix | extend toSignal to accept any Subscribable ([#50162](https://github.com/angular/angular/pull/50162)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [5e1d8444ae](https://github.com/angular/angular/commit/5e1d8444ae2952b4e9e5d7089200e7a3ac700e0d) | fix | Prevent a component from importing itself. ([#50554](https://github.com/angular/angular/pull/50554)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.1.0"></a>
# 16.1.0 (2023-06-13)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [4e663297c5](https://github.com/angular/angular/commit/4e663297c564078c8185c6a73e2baa844406a315) | fix | error when reading compiled input transforms metadata in JIT mode ([#50600](https://github.com/angular/angular/pull/50600)) |
| [721bc72649](https://github.com/angular/angular/commit/721bc72649b7d73f730298e04a4606a8bfd53011) | fix | resolve deprecation warning with TypeScript 5.1 ([#50460](https://github.com/angular/angular/pull/50460)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [68017d4e75](https://github.com/angular/angular/commit/68017d4e75abed78b378dce54f860cfa0d0fa42f) | feat | add ability to transform input values ([#50420](https://github.com/angular/angular/pull/50420)) |
| [69dadd2502](https://github.com/angular/angular/commit/69dadd25020ee84364466c0740f695984dd8c84d) | feat | support TypeScript 5.1 ([#50156](https://github.com/angular/angular/pull/50156)) |
| [c0ebe34cbd](https://github.com/angular/angular/commit/c0ebe34cbd235dc0b5e56fbe37429b77c0d91170) | fix | add additional component metadata to component ID generation ([#50336](https://github.com/angular/angular/pull/50336)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [85c5427582](https://github.com/angular/angular/commit/85c54275825a57fd3c7055a99e58bb211e085af9) | feat | Introduction of the `fetch` Backend for the `HttpClient` ([#50247](https://github.com/angular/angular/pull/50247)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.0.6"></a>
# 16.0.6 (2023-06-13)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [05ac0868c9](https://github.com/angular/angular/commit/05ac0868c9149fafcb0a0b815b31a65119090838) | fix | avoid duplicated content during hydration while processing a component with i18n ([#50644](https://github.com/angular/angular/pull/50644)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.0.5"></a>
# 16.0.5 (2023-06-08)
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [703b8fcac1](https://github.com/angular/angular/commit/703b8fcac1c9051bf2f342e5502b3cf28dbcab2c) | fix | do not remove comments in component styles ([#50346](https://github.com/angular/angular/pull/50346)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [2b6da93e19](https://github.com/angular/angular/commit/2b6da93e191a4250dfc81a7bd54c86e45909ea2d) | fix | incorrectly throwing error for self-referencing component ([#50559](https://github.com/angular/angular/pull/50559)) |
| [c992109d6c](https://github.com/angular/angular/commit/c992109d6c385a2b471f08eaa56701dfd513f219) | fix | wait for HTTP in `ngOnInit` correctly before server render ([#50573](https://github.com/angular/angular/pull/50573)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [c0d4086c6e](https://github.com/angular/angular/commit/c0d4086c6eb7685571366b65cd68a51de186f1a3) | fix | surface errors during rendering ([#50587](https://github.com/angular/angular/pull/50587)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.0.4"></a>
# 16.0.4 (2023-06-01)
### animations
| Commit | Type | Description |
| -- | -- | -- |
| [df65c4fc8f](https://github.com/angular/angular/commit/df65c4fc8f71ab9bf59ec4e5e820d136b12fb570) | fix | Trigger leave animation when ViewContainerRef is injected ([#48705](https://github.com/angular/angular/pull/48705)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [7e1bc513de](https://github.com/angular/angular/commit/7e1bc513dead7d809f5ba2e6edc45b85af12f828) | fix | untrack subscription and unsubscription in async pipe ([#50522](https://github.com/angular/angular/pull/50522)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [9970b29ace](https://github.com/angular/angular/commit/9970b29acef11f1dfedd2640520b4bca4b996f81) | fix | update `ApplicationRef.isStable` to account for rendering pending tasks ([#50425](https://github.com/angular/angular/pull/50425)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.0.3"></a>
# 16.0.3 (2023-05-24)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [c11041e372](https://github.com/angular/angular/commit/c11041e37260ac658e96e98fde5dea6d85b24aae) | fix | adds missing symbols for animation standalone bundling test ([#50434](https://github.com/angular/angular/pull/50434)) |
| [98e8fdf40e](https://github.com/angular/angular/commit/98e8fdf40e598f2c2a4d0c11de302ea13e586a1a) | fix | fix `Self` flag inside embedded views with custom injectors ([#50270](https://github.com/angular/angular/pull/50270)) |
| [199ff4fe7f](https://github.com/angular/angular/commit/199ff4fe7f2cd4b561703e8520c2d6ccc1e2afb7) | fix | host directives incorrectly validating aliased bindings ([#50364](https://github.com/angular/angular/pull/50364)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [080bbd2137](https://github.com/angular/angular/commit/080bbd21377d099c91aa0c6ea8ca634423cd8125) | fix | create macrotask during request handling instead of load start ([#50406](https://github.com/angular/angular/pull/50406)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.0.2"></a>
# 16.0.2 (2023-05-17)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [c1016d4e57](https://github.com/angular/angular/commit/c1016d4e578152dcdfe7c4a4673f27e12bfabf8d) | fix | add additional component metadata to component ID generation ([#50340](https://github.com/angular/angular/pull/50340)) |
| [cc41758b59](https://github.com/angular/angular/commit/cc41758b595da46a3fd14a58b3832c77b251b940) | fix | allow onDestroy unregistration while destroying ([#50237](https://github.com/angular/angular/pull/50237)) |
| [7d679bdb59](https://github.com/angular/angular/commit/7d679bdb59815e7e816337532d069d68cf45a6d8) | fix | allow passing value of any type to `isSignal` function ([#50035](https://github.com/angular/angular/pull/50035)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.0.1"></a>
# 16.0.1 (2023-05-10)
### core
| Commit | Type | Description |
| -- | -- | -- |
| [52c74d3b4a](https://github.com/angular/angular/commit/52c74d3b4a8d60b60c9e572541b6ccae0d704754) | fix | add additional component metadata to component ID generation ([#50203](https://github.com/angular/angular/pull/50203)) |
| [048b6b1e0d](https://github.com/angular/angular/commit/048b6b1e0d9d93d63e6fde2c16a9c3e2b221b581) | fix | bootstrapApplication call not rejected when error is thrown in importProvidersFrom module ([#50120](https://github.com/angular/angular/pull/50120)) |
| [d68796782f](https://github.com/angular/angular/commit/d68796782ff4ce1f389f14dcff31d393ddaa195d) | fix | handle hydration of root components with injected ViewContainerRef ([#50136](https://github.com/angular/angular/pull/50136)) |
| [f751ce6445](https://github.com/angular/angular/commit/f751ce64453f6ccede13b7bfd02b817eda0b40f7) | fix | handle projection of hydrated containters into components that skip hydration ([#50199](https://github.com/angular/angular/pull/50199)) |
| [346ab73dd9](https://github.com/angular/angular/commit/346ab73dd95fd2adfd8cb4064b9f12a6171e51d5) | fix | only try to retrieve transferred state on the browser ([#50144](https://github.com/angular/angular/pull/50144)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="16.0.0"></a>
# 16.0.0 (2023-05-03)

[Blog post "Angular v16 is now available"](https://goo.gle/angular-v16).

## Breaking Changes
### 
- Angular Compatibility Compiler (ngcc) has been removed and as a result Angular View Engine libraries will no longer work
- Deprecated `EventManager` method `addGlobalEventListener` has been removed as it is not used by Ivy.
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
- `MockPlatformLocation` is now provided by default in tests.
  Existing tests may have behaviors which rely on
  `BrowserPlatformLocation` instead. For example, direct access to the
  `window.history` in either the test or the component rather than going
  through the Angular APIs (`Location.getState()`). The quickest fix is to
  update the providers in the test suite to override the provider again
  `TestBed.configureTestingModule({providers: [{provide: PlatformLocation, useClass: BrowserPlatformLocation}]})`.
  The ideal fix would be to update the code to instead be compatible with
  `MockPlatformLocation` instead.
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
- Deprecated `XhrFactory` export from `@angular/common/http` has been removed. Use `XhrFactory` from `@angular/common` instead.
### compiler
- * TypeScript 4.8 is no longer supported.
### core
- QueryList.filter now supports type guard functions, which will result in type narrowing. Previously if you used type guard functions, it resulted in no changes to the return type. Now the type would be narrowed, which might require updates to the application code that relied on the old behavior.
- `zone.js` versions `0.11.x` and `0.12.x` are not longer supported.
- * `entryComponents` has been deleted from the `@NgModule` and `@Component` public APIs. Any usages can be removed since they weren't doing anyting.
  * `ANALYZE_FOR_ENTRY_COMPONENTS` injection token has been deleted. Any references can be removed.
- ComponentRef.setInput will only set the input on the
  component if it is different from the previous value (based on `Object.is`
  equality). If code relies on the input always being set, it should be
  updated to copy objects or wrap primitives in order to ensure the input
  value differs from the previous call to `setInput`.
- `RendererType2.styles` no longer accepts a nested arrays.
- The `APP_ID` token value is no longer randomly generated. If you are bootstrapping multiple application on the same page you will need to set to provide the `APP_ID` yourself.
  
  ```ts
  bootstrapApplication(ComponentA, {
    providers: [
     { provide: APP_ID, useValue: 'app-a' },
     // ... other providers ...
    ]
  });
  ```
- The `ReflectiveInjector` and related symbols were removed. Please update the code to avoid references to the `ReflectiveInjector` symbol. Use `Injector.create` as a replacement to create an injector instead.
- Node.js v14 support has been removed
  
  Node.js v14 is planned to be End-of-Life on 2023-04-30. Angular will stop supporting Node.js v14 in Angular v16. Angular v16 will continue to officially support Node.js versions v16 and v18.
### platform-browser
- The deprecated `BrowserTransferStateModule` was removed, since it's no longer needed. The `TransferState` class can be injected without providing the module. The `BrowserTransferStateModule` was empty starting from v14 and you can just remove the reference to that module from your applications.
### platform-server
- Users that are using SSR with JIT mode will now need to add  `import to @angular/compiler` before bootstrapping the application.
  
  **NOTE:** this does not effect users using the Angular CLI.
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
- `renderModuleFactory` has been removed. Use `renderModule` instead.
### router
- The `Scroll` event's `routerEvent` property may also be
  a `NavigationSkipped` event. Previously, it was only a `NavigationEnd`
  event.
- `ComponentFactoryResolver` has been removed from Router APIs.
  Component factories are not required to create an instance of a component
  dynamically. Passing a factory resolver via resolver argument is no longer needed
  and code can instead use `ViewContainerRef.createComponent` without the
  factory resolver.
- The `RouterEvent` type is no longer present in the `Event` union type representing all router event types. If you have code using something like `filter((e: Event): e is RouterEvent => e instanceof RouterEvent)`, you'll need to update it to `filter((e: Event|RouterEvent): e is RouterEvent => e instanceof RouterEvent)`.
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
## Deprecations
### core
-  `makeStateKey`, `StateKey` and  `TransferState` exports have been moved from `@angular/platform-browser` to `@angular/core`. Please update the imports.
  
  ```diff
  - import {makeStateKey, StateKey, TransferState} from '@angular/platform-browser';
  + import {makeStateKey, StateKey, TransferState} from '@angular/core';
  ```
- `EnvironmentInjector.runInContext` is now deprecated, with
  `runInInjectionContext` functioning as a direct replacement:
  
  ```typescript
  // Previous method version (deprecated):
  envInjector.runInContext(fn);
  // New standalone function:
  runInInjectionContext(envInjector, fn);
  ```
- The `@Directive`/`@Component` `moduleId` property is now
  deprecated. It did not have any effect for multiple major versions and
  will be removed in v17.
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
- `ApplicationConfig` has moved, please import `ApplicationConfig` from `@angular/core` instead.
### platform-server
- `PlatformConfig.baseUrl` and `PlatformConfig.useAbsoluteUrl` platform-server config options  are deprecated as these were not used.
### 
| Commit | Type | Description |
| -- | -- | -- |
| [48aa96ea13](https://github.com/angular/angular/commit/48aa96ea13ebfadf2f6b13516c7702dae740a7be) | refactor | remove Angular Compatibility Compiler (ngcc) ([#49101](https://github.com/angular/angular/pull/49101)) |
| [2703fd6260](https://github.com/angular/angular/commit/2703fd626040c5e65401ebd776404a3b9e284724) | refactor | remove deprecated `EventManager` method `addGlobalEventListener` ([#49645](https://github.com/angular/angular/pull/49645)) |
### common
| Commit | Type | Description |
| -- | -- | -- |
| [5dce2a5a3a](https://github.com/angular/angular/commit/5dce2a5a3a00693d835a57934b9abacce5a33dfa) | feat | Provide MockPlatformLocation by default in BrowserTestingModule ([#49137](https://github.com/angular/angular/pull/49137)) |
| [d47fef72cb](https://github.com/angular/angular/commit/d47fef72cb497db555e67db50997b3b1cc3ee590) | fix | strict type checking for ngtemplateoutlet ([#48374](https://github.com/angular/angular/pull/48374)) |
| [c41a21658c](https://github.com/angular/angular/commit/c41a21658c9a56044b5d7f62cab4fcad5a5732c7) | refactor | remove deprecated `XhrFactory` export from `http` entrypoint ([#49251](https://github.com/angular/angular/pull/49251)) |
### compiler
| Commit | Type | Description |
| -- | -- | -- |
| [1a6ca68154](https://github.com/angular/angular/commit/1a6ca68154dd73bac4b8d2e094d97952f60b3e30) | feat | add support for compile-time required inputs ([#49304](https://github.com/angular/angular/pull/49304)) |
| [13dd614cd1](https://github.com/angular/angular/commit/13dd614cd1da65eee947fd6971b7d6e1d6def207) | feat | add support for compile-time required inputs ([#49453](https://github.com/angular/angular/pull/49453)) |
| [8f539c11f4](https://github.com/angular/angular/commit/8f539c11f40be12207ab42bdf1f87a154a5a2d04) | feat | add support for compile-time required inputs ([#49468](https://github.com/angular/angular/pull/49468)) |
| [79cdfeb392](https://github.com/angular/angular/commit/79cdfeb3921687dfbc8fea8d9f7ba4dbb14a7193) | feat | drop support for TypeScript 4.8 ([#49155](https://github.com/angular/angular/pull/49155)) |
| [1407a9aeaf](https://github.com/angular/angular/commit/1407a9aeaf5edf33dfb9b52d7b2baaebef9b80ed) | feat | support multiple configuration files in `extends` ([#49125](https://github.com/angular/angular/pull/49125)) |
| [9de1e9da8f](https://github.com/angular/angular/commit/9de1e9da8fc7d102f74389d9a270c4608bf0dd64) | fix | incorrectly matching directives on attribute bindings ([#49713](https://github.com/angular/angular/pull/49713)) |
| [6623810e4d](https://github.com/angular/angular/commit/6623810e4d3347edaccbbb214fa883ab6a669936) | fix | Produce diagnositc if directive used in host binding is not exported ([#49527](https://github.com/angular/angular/pull/49527)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [03d1d00ad9](https://github.com/angular/angular/commit/03d1d00ad9f88a2c449cceab64c1328787576162) | feat | Add an extended diagnostic for `nSkipHydration` ([#49512](https://github.com/angular/angular/pull/49512)) |
| [ed817e32fe](https://github.com/angular/angular/commit/ed817e32fe0239c0f08ce342c7ad224055d56f84) | fix | Catch FatalDiagnosticError during template type checking ([#49527](https://github.com/angular/angular/pull/49527)) |
| [49fe974501](https://github.com/angular/angular/commit/49fe974501b6f446eaedf2490f2d456a5967318f) | perf | optimize NgModule emit for standalone components ([#49837](https://github.com/angular/angular/pull/49837)) |
### core
| Commit | Type | Description |
| -- | -- | -- |
| [89d291c367](https://github.com/angular/angular/commit/89d291c367e6b1b4618999c4044dcafcc1953109) | feat | add `assertInInjectionContext` ([#49529](https://github.com/angular/angular/pull/49529)) |
| [4e9531f777](https://github.com/angular/angular/commit/4e9531f7773e7bf0d3034a36c62f34f914e4a451) | feat | add `mergeApplicationConfig` method ([#49253](https://github.com/angular/angular/pull/49253)) |
| [d7d6514add](https://github.com/angular/angular/commit/d7d6514add2912a18c50f190aaa8afafa313bc9e) | feat | Add ability to configure `NgZone` in `bootstrapApplication` ([#49557](https://github.com/angular/angular/pull/49557)) |
| [bc5ddabdcb](https://github.com/angular/angular/commit/bc5ddabdcb39e6ebbe2da03dc8ec49bbe26c677d) | feat | add Angular Signals to the public API ([#49150](https://github.com/angular/angular/pull/49150)) |
| [17e9862653](https://github.com/angular/angular/commit/17e9862653758ebdbd29771cd4ec8a59436497d6) | feat | add API to provide CSP nonce for inline stylesheets ([#49444](https://github.com/angular/angular/pull/49444)) |
| [605c536420](https://github.com/angular/angular/commit/605c5364208d9ab60041121e2ebbcfb2a1a52c1a) | feat | add migration to remove `moduleId` references ([#49496](https://github.com/angular/angular/pull/49496)) |
| [99d874fe3b](https://github.com/angular/angular/commit/99d874fe3b486f3669b0e8f1910e31c4fa278308) | feat | add support for TypeScript 5.0 ([#49126](https://github.com/angular/angular/pull/49126)) |
| [d1617c449d](https://github.com/angular/angular/commit/d1617c449d23c6573803cce36391134e8d0103a3) | feat | allow removal of previously registered DestroyRef callbacks ([#49493](https://github.com/angular/angular/pull/49493)) |
| [b2327f4df1](https://github.com/angular/angular/commit/b2327f4df12ca91d7cdbc3dc5c0f5cb3ab88a30e) | feat | Allow typeguards on QueryList.filter ([#48042](https://github.com/angular/angular/pull/48042)) |
| [061f3d1086](https://github.com/angular/angular/commit/061f3d1086421b921403f7d358c02f84927b699b) | feat | Drop public `factories` property for `IterableDiffers` : Breaking change ([#49598](https://github.com/angular/angular/pull/49598)) |
| [fdf61974d1](https://github.com/angular/angular/commit/fdf61974d1155b771d7d53c7bbc3bd2b0f6681cb) | feat | drop support for `zone.js` versions `<=0.12.0` ([#49331](https://github.com/angular/angular/pull/49331)) |
| [9c5fd50de4](https://github.com/angular/angular/commit/9c5fd50de4489d98b40668f7d9885c18d9a43c73) | feat | effects can optionally return a cleanup function ([#49625](https://github.com/angular/angular/pull/49625)) |
| [c024574f46](https://github.com/angular/angular/commit/c024574f46f18c42c1e5b02afa6c1e3e4219d25b) | feat | expose `makeStateKey`, `StateKey` and  `TransferState` ([#49563](https://github.com/angular/angular/pull/49563)) |
| [a5f1737d1c](https://github.com/angular/angular/commit/a5f1737d1c2435b1476c1277bdc9a6827377465f) | feat | expose onDestroy on ApplicationRef ([#49677](https://github.com/angular/angular/pull/49677)) |
| [e883198460](https://github.com/angular/angular/commit/e8831984601da631afc29f9fd72d36f57696f936) | feat | implement `takeUntilDestroyed` in rxjs-interop ([#49154](https://github.com/angular/angular/pull/49154)) |
| [0814f20594](https://github.com/angular/angular/commit/0814f2059406dff9cefdd8b210756b6fdcba15b1) | feat | introduce `runInInjectionContext` and deprecate prior version ([#49396](https://github.com/angular/angular/pull/49396)) |
| [0f5c8003cc](https://github.com/angular/angular/commit/0f5c8003ccd1a75516d6a0e31cdb752d031ec430) | feat | introduce concept of DestroyRef ([#49158](https://github.com/angular/angular/pull/49158)) |
| [9b65b84cb9](https://github.com/angular/angular/commit/9b65b84cb9a0392d8aef5b52b34d35c7c5b9f566) | feat | Mark components for check if they read a signal ([#49153](https://github.com/angular/angular/pull/49153)) |
| [8997bdc03b](https://github.com/angular/angular/commit/8997bdc03bd3ef0dc1ac68c913bf7d09340cee0d) | feat | prototype implementation of @angular/core/rxjs-interop ([#49154](https://github.com/angular/angular/pull/49154)) |
| [585e34bf6c](https://github.com/angular/angular/commit/585e34bf6c86f7b056b0aafaaca056baedaedae3) | feat | remove entryComponents ([#49484](https://github.com/angular/angular/pull/49484)) |
| [aad05ebeb4](https://github.com/angular/angular/commit/aad05ebeb44afad29fd989019638590344ba61eb) | feat | support usage of non-experimental decorators with TypeScript 5.0 ([#49492](https://github.com/angular/angular/pull/49492)) |
| [6d7be42da7](https://github.com/angular/angular/commit/6d7be42da7b77632290b935e1db7f20983bdd07b) | fix | add newline to hydration mismatch error ([#49965](https://github.com/angular/angular/pull/49965)) |
| [f8e25864e8](https://github.com/angular/angular/commit/f8e25864e8e35214a321b1c48a926d370f725e13) | fix | allow async functions in effects ([#49783](https://github.com/angular/angular/pull/49783)) |
| [84216dabfc](https://github.com/angular/angular/commit/84216dabfcfc6e082f6042a0658fb0cb7a323525) | fix | catch errors from source signals outside of .next ([#49769](https://github.com/angular/angular/pull/49769)) |
| [be23b7ce65](https://github.com/angular/angular/commit/be23b7ce650634c95f6709a879c89bbad45c4701) | fix | ComponentRef.setInput only sets input when not equal to previous ([#49607](https://github.com/angular/angular/pull/49607)) |
| [316c91b1a4](https://github.com/angular/angular/commit/316c91b1a47f1fb574045553288acca5fcb6e354) | fix | deprecate `moduleId` `@Component` property ([#49496](https://github.com/angular/angular/pull/49496)) |
| [fd9dcd36cd](https://github.com/angular/angular/commit/fd9dcd36cdf9ad92f404567f6c8c0914544b6e0d) | fix | Ensure effects can be created when Zone is not defined ([#49890](https://github.com/angular/angular/pull/49890)) |
| [9180f98f0e](https://github.com/angular/angular/commit/9180f98f0ec1707455786430d8ad022f3a1386fa) | fix | ensure takeUntilDestroyed unregisters onDestroy listener on unsubscribe ([#49901](https://github.com/angular/angular/pull/49901)) |
| [4721c48a24](https://github.com/angular/angular/commit/4721c48a24bf4e72fd4742097ec8505a08f87579) | fix | error if document body is null ([#49818](https://github.com/angular/angular/pull/49818)) |
| [2650f1afc1](https://github.com/angular/angular/commit/2650f1afc1cf53423b433c2ee1782aae9d6117e4) | fix | execute input setters in non-reactive context ([#49906](https://github.com/angular/angular/pull/49906)) |
| [f8b95b9da6](https://github.com/angular/angular/commit/f8b95b9da62d0c8719a38d230f389db5268c0b01) | fix | execute query setters in non-reactive context ([#49906](https://github.com/angular/angular/pull/49906)) |
| [ef91a2e0fe](https://github.com/angular/angular/commit/ef91a2e0fe66378635d0787bd6d953eb8d31d881) | fix | execute template creation in non-reactive context ([#49883](https://github.com/angular/angular/pull/49883)) |
| [87549af73c](https://github.com/angular/angular/commit/87549af73c675d33b2c87d083e05a82b18332bf0) | fix | Fix capitalization of toObservableOptions ([#49832](https://github.com/angular/angular/pull/49832)) |
| [0e5f9ba6f4](https://github.com/angular/angular/commit/0e5f9ba6f427a79a0b741c1780cd2ff72cc3100a) | fix | generate consistent component IDs ([#48253](https://github.com/angular/angular/pull/48253)) |
| [fedc75624c](https://github.com/angular/angular/commit/fedc75624c5dcfaaa2b5ef901e7e700309770a26) | fix | include inner ViewContainerRef anchor nodes into ViewRef.rootNodes output ([#49867](https://github.com/angular/angular/pull/49867)) |
| [df1dfc4c17](https://github.com/angular/angular/commit/df1dfc4c17abc6799f2e8f3f5f8604a7bf3d173a) | fix | make sure that lifecycle hooks are not tracked ([#49701](https://github.com/angular/angular/pull/49701)) |
| [c34d7e0822](https://github.com/angular/angular/commit/c34d7e0822c21f7b6e7dfd46d3e12cd6ebb7390e) | fix | onDestroy should be registered only on valid DestroyRef ([#49804](https://github.com/angular/angular/pull/49804)) |
| [2f2ef14f9e](https://github.com/angular/angular/commit/2f2ef14f9e6b64445f76cb9e3f5958abe2439157) | fix | resolve `InitialRenderPendingTasks` promise on complete ([#49784](https://github.com/angular/angular/pull/49784)) |
| [c7d8d3ee37](https://github.com/angular/angular/commit/c7d8d3ee3757c2540baf739001b0fc13c096a4a4) | fix | toObservable should allow writes to signals in the effect ([#49769](https://github.com/angular/angular/pull/49769)) |
| [b4531f1d82](https://github.com/angular/angular/commit/b4531f1d82dc37d00487ff862f058e2574cec318) | fix | typing of TestBed Common token. ([#49997](https://github.com/angular/angular/pull/49997)) |
| [a4e749ffca](https://github.com/angular/angular/commit/a4e749ffca5b1f726c365cecaf0f5c4f13eec8d9) | fix | When using setInput, mark view dirty in same was as `markForCheck` ([#49711](https://github.com/angular/angular/pull/49711)) |
| [9b9c818f99](https://github.com/angular/angular/commit/9b9c818f99c44473e915bedd157146c88e44989a) | perf | change `RendererType2.styles` to accept a only a flat array ([#49072](https://github.com/angular/angular/pull/49072)) |
| [82d6fbb109](https://github.com/angular/angular/commit/82d6fbb109491607bd2e4feaa35c3dace79e4576) | refactor | generate a static application ID ([#49422](https://github.com/angular/angular/pull/49422)) |
| [3b863ddc1e](https://github.com/angular/angular/commit/3b863ddc1e67a2fa7627ad78e172c839781e81b6) | refactor | Remove `ReflectiveInjector` symbol ([#48103](https://github.com/angular/angular/pull/48103)) |
| [f594725951](https://github.com/angular/angular/commit/f594725951fafde475ee99ffccf1175c13c48288) | refactor | remove Node.js v14 support ([#49255](https://github.com/angular/angular/pull/49255)) |
### forms
| Commit | Type | Description |
| -- | -- | -- |
| [07a1aa3004](https://github.com/angular/angular/commit/07a1aa300404969155ed1eb3cd02f4a766e07963) | feat | Improve typings form (async)Validators ([#48679](https://github.com/angular/angular/pull/48679)) |
### http
| Commit | Type | Description |
| -- | -- | -- |
| [aff1512950](https://github.com/angular/angular/commit/aff15129501511569bbb4ff6dfcb16ad1c01890d) | feat | allow `HttpClient` to cache requests ([#49509](https://github.com/angular/angular/pull/49509)) |
| [15c91a53ae](https://github.com/angular/angular/commit/15c91a53ae2cc1f34e05b158be69e10e9f43043b) | fix | delay accessing `pendingTasks.whenAllTasksComplete` ([#49784](https://github.com/angular/angular/pull/49784)) |
| [9f0c6d1ed1](https://github.com/angular/angular/commit/9f0c6d1ed1d30eb5596fc68d8bd30ab132998ae6) | fix | ensure new cache state is returned on each request ([#49749](https://github.com/angular/angular/pull/49749)) |
| [45a6ac09fd](https://github.com/angular/angular/commit/45a6ac09fdd2228fa4bbf5188ba8e67298754e7e) | fix | force macro task creation during HTTP request ([#49546](https://github.com/angular/angular/pull/49546)) |
| [2a580b6f0b](https://github.com/angular/angular/commit/2a580b6f0b05d917dc220c4b7b69a8b3f59e6e98) | fix | HTTP cache was being disabled prematurely ([#49826](https://github.com/angular/angular/pull/49826)) |
| [2eb9b8b402](https://github.com/angular/angular/commit/2eb9b8b402807aec817d0a58137f7d359c46d055) | fix | wait for all XHR requests to finish before stabilizing application ([#49776](https://github.com/angular/angular/pull/49776)) |
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [5e5dac278d](https://github.com/angular/angular/commit/5e5dac278d57d29277f0847f025e7dfa850bec45) | feat | Migration to remove `Router` guard and resolver interfaces ([#49337](https://github.com/angular/angular/pull/49337)) |
### platform-browser
| Commit | Type | Description |
| -- | -- | -- |
| [761e02d912](https://github.com/angular/angular/commit/761e02d912e4f910f9e5e915c019dc1fef0d0839) | feat | add a public API function to enable non-destructive hydration ([#49666](https://github.com/angular/angular/pull/49666)) |
| [630af63fae](https://github.com/angular/angular/commit/630af63fae2e279e88805aecf01db58be6dfbafb) | feat | deprecate `withServerTransition` call ([#49422](https://github.com/angular/angular/pull/49422)) |
| [81e7d15ef6](https://github.com/angular/angular/commit/81e7d15ef65b70c9734ebfd2c865e70d743263dc) | feat | enable HTTP request caching when using `provideClientHydration` ([#49699](https://github.com/angular/angular/pull/49699)) |
| [74c925c19c](https://github.com/angular/angular/commit/74c925c19c5a8f4823fa929700f6599970cd61d3) | fix | export deprecated `TransferState` as type ([#50015](https://github.com/angular/angular/pull/50015)) |
| [2312eb53ef](https://github.com/angular/angular/commit/2312eb53ef5862e0866c29d11dec2a9b7b6a064c) | fix | KeyEventsPlugin should keep the same behavior ([#49330](https://github.com/angular/angular/pull/49330)) |
| [c934a8e72b](https://github.com/angular/angular/commit/c934a8e72bec9f96ccf1a1de1a3384d40dfd2731) | fix | only add `ng-app-id` to style on server side ([#49465](https://github.com/angular/angular/pull/49465)) |
| [9165ff2517](https://github.com/angular/angular/commit/9165ff2517448b43bb910001816108702088e93e) | fix | reuse server generated component styles ([#48253](https://github.com/angular/angular/pull/48253)) |
| [e8e36811d5](https://github.com/angular/angular/commit/e8e36811d5700d23a6d853c78e6314b19d937e5e) | fix | set nonce attribute in a platform compatible way ([#49624](https://github.com/angular/angular/pull/49624)) |
| [3aa85a8087](https://github.com/angular/angular/commit/3aa85a8087643ce79da6d1aeae7b925bb76315a5) | refactor | move `ApplicationConfig` to core ([#49253](https://github.com/angular/angular/pull/49253)) |
| [9bd9a11f4e](https://github.com/angular/angular/commit/9bd9a11f4e21e5a7cc9da18f150f6dd520e7cd1e) | refactor | remove deprecated `BrowserTransferStateModule` symbol ([#49718](https://github.com/angular/angular/pull/49718)) |
### platform-server
| Commit | Type | Description |
| -- | -- | -- |
| [b5278cc115](https://github.com/angular/angular/commit/b5278cc115ee6383a20783967b9e7da3f6184dcd) | feat | `renderApplication` now accepts a bootstrapping method ([#49248](https://github.com/angular/angular/pull/49248)) |
| [056d68002f](https://github.com/angular/angular/commit/056d68002fbe6024b486bb7220bc77f8f9a07707) | feat | add `provideServerSupport` function to provide server capabilities to an application ([#49380](https://github.com/angular/angular/pull/49380)) |
| [7870fb07fe](https://github.com/angular/angular/commit/7870fb07fe6b25f5ebb22497bff3a03b7b5fc646) | feat | rename `provideServerSupport` to `provideServerRendering` ([#49678](https://github.com/angular/angular/pull/49678)) |
| [a08a8ff108](https://github.com/angular/angular/commit/a08a8ff108bba88ba4bd7f30a6a8c1bcadb13db7) | fix | bundle @angular/domino in via esbuild ([#49229](https://github.com/angular/angular/pull/49229)) |
| [5ea624f313](https://github.com/angular/angular/commit/5ea624f3135c71316c36eb94445d818f9157d988) | fix | remove dependency on `@angular/platform-browser-dynamic` ([#50064](https://github.com/angular/angular/pull/50064)) |
| [e99460865e](https://github.com/angular/angular/commit/e99460865e6a038be08a3436422ad129901aec8c) | refactor | deprecate `useAbsoluteUrl` and `baseUrl` ([#49546](https://github.com/angular/angular/pull/49546)) |
| [41f27ad086](https://github.com/angular/angular/commit/41f27ad08643839d09daf4588069a3f8fe627070) | refactor | remove `renderApplication` overload that accepts a component ([#49463](https://github.com/angular/angular/pull/49463)) |
| [17abe6dc96](https://github.com/angular/angular/commit/17abe6dc96a443de0c2f9575bb160042a031fed1) | refactor | remove deprecated `renderModuleFactory` ([#49247](https://github.com/angular/angular/pull/49247)) |
### router
| Commit | Type | Description |
| -- | -- | -- |
| [ea32c3289a](https://github.com/angular/angular/commit/ea32c3289ad773a821b3432fb8d4c36d0d9fbd9d) | feat | Expose information about the last successful `Navigation` ([#49235](https://github.com/angular/angular/pull/49235)) |
| [455c728525](https://github.com/angular/angular/commit/455c7285257a8def53ae6c9d14e9848d72ae2613) | feat | helper functions to convert class guards to functional ([#48709](https://github.com/angular/angular/pull/48709)) |
| [f982a3f965](https://github.com/angular/angular/commit/f982a3f965995c4883780b0d48cb5d1411ebad0f) | feat | Opt-in for binding `Router` information to component inputs ([#49633](https://github.com/angular/angular/pull/49633)) |
| [1f055b90b6](https://github.com/angular/angular/commit/1f055b90b65cce2d0d063ed44cb0f8fbecb9b1f6) | fix | Ensure anchor scrolling happens on ignored same URL navigations ([#48025](https://github.com/angular/angular/pull/48025)) |
| [6193a3d406](https://github.com/angular/angular/commit/6193a3d40619c34127ec011a895e8fde3c5d8c48) | fix | fix = not parsed in router segment name ([#47332](https://github.com/angular/angular/pull/47332)) |
| [c0b1b7becf](https://github.com/angular/angular/commit/c0b1b7becf65d5f21018a1794aafe9bbfbd5ce05) | fix | Remove deprecated ComponentFactoryResolver from APIs ([#49239](https://github.com/angular/angular/pull/49239)) |
| [1e32709e0e](https://github.com/angular/angular/commit/1e32709e0e16f553ed3e7778705c9a0c5641d0af) | fix | remove RouterEvent from Event union type ([#46061](https://github.com/angular/angular/pull/46061)) |
| [3c7e637374](https://github.com/angular/angular/commit/3c7e63737407287986c65136efd1f53d1215a53e) | fix | Route matching should only happen once when navigating ([#49163](https://github.com/angular/angular/pull/49163)) |
| [1600687fe5](https://github.com/angular/angular/commit/1600687fe518e67adcc629c78857720a5118d489) | fix | Route matching should only happen once when navigating ([#49163](https://github.com/angular/angular/pull/49163)) |
| [31f210bf2c](https://github.com/angular/angular/commit/31f210bf2cd8a5cc8245c05a30ae3b8f8b9d826a) | fix | Router.createUrlTree should work with any ActivatedRoute ([#48508](https://github.com/angular/angular/pull/48508)) |
### service-worker
| Commit | Type | Description |
| -- | -- | -- |
| [5e7fc259ea](https://github.com/angular/angular/commit/5e7fc259ead62ee9b4f8a9a77a455065b6a8e2d8) | feat | add function to provide service worker ([#48247](https://github.com/angular/angular/pull/48247)) |

<!-- CHANGELOG SPLIT MARKER -->

<a name="15.2.9"></a>
# 15.2.9 (2023-05-03)
### common
| Commit | Type | Description |
| -- | -- | -- |
| [9107e931ca](https://github.com/angular/angular/commit/9107e931cad6c7543f717796a75648cefee2fd12) | fix | fix incorrectly reported distortion for padded images ([#49889](https://github.com/angular/angular/pull/49889)) |
### compiler-cli
| Commit | Type | Description |
| -- | -- | -- |
| [7c58885797](https://github.com/angular/angular/commit/7c58885797af407d8399206340e79fe3d2beffb8) | fix | catch fatal diagnostic when getting diagnostics for components ([#50046](https://github.com/angular/angular/pull/50046)) |

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

<a name="15.2.2"></a>
# 15.2.2 (2023-03-08)
### migrations
| Commit | Type | Description |
| -- | -- | -- |
| [6207d6f1f0](https://github.com/angular/angular/commit/6207d6f1f0771ff3b74379367e65af665ef0e51c) | fix | add protractor support if protractor imports are detected ([#49274](https://github.com/angular/angular/pull/49274)) |
## Special Thanks
Alan Agius, Andrew Kushnir, Andrew Scott, Kristiyan Kostadinov, Matthieu Riegler, Paul Gschwendtner, Sai Kartheek Bommisetty and Vinit Neogi

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

[Blog post "Angular v15 is now available"](https://goo.gle/angular-v15).

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

[Blog post "Angular v14 is now available"](https://goo.gle/angular-v14).

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



Earlier changelog entries can be found in CHANGELOG_ARCHIVE.md file.