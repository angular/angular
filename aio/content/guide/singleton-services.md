<!--
# Singleton services
-->
# 싱글턴 서비스 (Singleton services)

<!--
#### Prerequisites:
-->
#### 사전지식

<!--
* A basic understanding of [Bootstrapping](guide/bootstrapping).
* Familiarity with [Providers](guide/providers).
-->
다음 내용을 먼저 이해하고 이 문서를 보는 것이 좋습니다.
* [부트스트랩](guide/bootstrapping)
* [프로바이더](guide/providers)

<!--
For a sample app using the app-wide singleton service that this page describes, see the
<live-example name="ngmodules"></live-example> showcasing all the documented features of NgModules.
-->
이 문서에서는 앱 전역에서 싱글턴으로 동작하는 서비스를 만들어봅니다. 이 문서에서 다루는 모든 예제 코드는 <live-example name="ngmodules"></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

<hr />

<!--
## Providing a singleton service
-->
## 싱글턴 서비스 생성하기

<!--
There are two ways to make a service a singleton in Angular:
-->
Angular에서 서비스를 싱글턴으로 사용하는 방법은 두 가지가 있습니다:

<!--
* Declare `root` for the value of the `@Injectable()` `providedIn` property
* Include the service in the `AppModule` or in a module that is only imported by the `AppModule`
-->
* `@Injectable()` `providedIn` 프로퍼티에 `root`를 지정해서 서비스 프로바이더를 애플리케이션 루트에 등록하는 방법
* 서비스를 `AppModule`에 선언하고 다른 모듈에서 `AppModule`만 로드하는 방법


{@a providedIn}

### Using `providedIn`

Beginning with Angular 6.0, the preferred way to create a singleton service is to set `providedIn` to `root` on the service's `@Injectable()` decorator. This tells Angular
to provide the service in the application root.

<code-example path="providers/src/app/user.service.0.ts"  header="src/app/user.service.ts" linenums="false"> </code-example>

For more detailed information on services, see the [Services](tutorial/toh-pt4) chapter of the
[Tour of Heroes tutorial](tutorial).

### NgModule `providers` array

In apps built with Angular versions prior to 6.0, services are registered NgModule `providers` arrays as follows:

```ts
@NgModule({
  ...
  providers: [UserService],
  ...
})

```

If this NgModule were the root `AppModule`, the `UserService` would be a singleton and available
throughout the app. Though you may see it coded this way, using the `providedIn` property of the `@Injectable()` decorator on the service itself is preferable as of Angular 6.0 as it makes your services tree-shakable.

{@a forRoot}

## The `forRoot()` pattern

Generally, you'll only need `providedIn` for providing services and `forRoot()`/`forChild()` for routing. However, understanding how `forRoot()` works to make sure a service is a singleton will inform your development at a deeper level.

If a module defines both providers and declarations (components, directives, pipes),
then loading the module in multiple feature modules would duplicate the registration of the service. This could result in multiple service instances and the service would no longer behave as a singleton.

There are multiple ways to prevent this:

* Use the [`providedIn` syntax](guide/singleton-services#providedIn) instead of registering the service in the module.
* Separate your services into their own module.
* Define `forRoot()` and `forChild()` methods in the module.

<div class="alert is-helpful">

**Note:** There are two example apps where you can see this scenario; the more advanced <live-example noDownload>NgModules live example</live-example>, which contains `forRoot()` and `forChild()` in the routing modules and the `GreetingModule`, and the simpler <live-example name="lazy-loading-ngmodules" noDownload>Lazy Loading live example</live-example>. For an introductory explanation see the [Lazy Loading Feature Modules](guide/lazy-loading-ngmodules) guide.

</div>


Use `forRoot()` to
separate providers from a module so you can import that module into the root module
with `providers` and child modules without `providers`.

1. Create a static method `forRoot()` on the module.
2. Place the providers into the `forRoot()` method.

<code-example path="ngmodules/src/app/greeting/greeting.module.ts" region="for-root" header="src/app/greeting/greeting.module.ts" linenums="false"> </code-example>


{@a forRoot-router}

### `forRoot()` and the `Router`

`RouterModule` provides the `Router` service, as well as router directives, such as `RouterOutlet` and `routerLink`. The root application module imports `RouterModule` so that the application has a `Router` and the root application components can access the router directives. Any feature modules must also import `RouterModule` so that their components can place router directives into their templates.

If the `RouterModule` didn’t have `forRoot()` then each feature module would instantiate a new `Router` instance, which would break the application as there can only be one `Router`. By using the `forRoot()` method, the root application module imports `RouterModule.forRoot(...)` and gets a `Router`, and all feature modules import `RouterModule.forChild(...)` which does not instantiate another `Router`.

<div class="alert is-helpful">

**Note:** If you have a module which has both providers and declarations,
you _can_ use this
technique to separate them out and you may see this pattern in legacy apps.
However, since Angular 6.0, the best practice for providing services is with the
`@Injectable()` `providedIn` property.

</div>

### How `forRoot()` works

<!--
`forRoot()` takes a service configuration object and returns a
[ModuleWithProviders](api/core/ModuleWithProviders), which is
a simple object with the following properties:
-->
`forRoot()` 함수는 서비스 설정 객체를 인자로 받아서 [ModuleWithProviders](api/core/ModuleWithProviders)를 반환하는데, 이 모듈에는 다음과 같은 프로퍼티가 있습니다:

<!--
* `ngModule`: in this example, the `GreetingModule` class
* `providers`: the configured providers
-->
* `ngModule` : 이 예제에서는 `GreetingModule` 클래스를 의미합니다.
* `providers` : 인자로 받은 객체로 설정된 프로바이더를 의미합니다.

<!--
In the <live-example name="ngmodules">live example</live-example>
the root `AppModule` imports the `GreetingModule` and adds the
`providers` to the `AppModule` providers. Specifically,
Angular accumulates all imported providers
before appending the items listed in `@NgModule.providers`.
This sequence ensures that whatever you add explicitly to
the `AppModule` providers takes precedence over the providers
of imported modules.
-->
이 문서와 관련된 예제를 <live-example name="ngmodules">live example</live-example>에서 열어보면, `AppModule`이 `GreetingModule`을 로드하고, `GreetingModule`에서 제공하는 서비스 프로바이더도 `Appmodule`에 로드합니다. 좀 더 정확하게 설명하면, `AppModule`의 `providers` 목록은 아무것도 없지만, 모듈의 `imports`로 불러오는 다른 모듈에 서비스 프로바이더가 존재하면 이 서비스 프로바이더를 현재 모듈의 `@NgModule.providers`보다 먼저 등록합니다. 그래서 현재 모듈이 다른 모듈의 서비스를 의존성으로 주입받을 때, 이 의존성은 현재 모듈의 프로바이더보다 먼저 등록되었기 때문에 문제없이 사용할 수 있습니다.

<!--
The sample app imports `GreetingModule` and uses its `forRoot()` method one time, in `AppModule`. Registering it once like this prevents multiple instances.

You can also add a `forRoot()` method in the `GreetingModule` that configures
the greeting `UserService`.
-->
`GreetingModule`은 `forRoot()` 메소드를 사용해서 `AppModule`에 딱 한 번만 로드되며, 이렇게 로드하면 인스턴스가 중복 생성되는 것을 방지할 수 있습니다.

`GreetingModule`의 `forRoot()` 메소드는 `UserService` 서비스를 설정하는 용도로도 사용할 수 있습니다.

<!--
In the following example, the optional, injected `UserServiceConfig`
extends the greeting `UserService`. If a `UserServiceConfig` exists, the `UserService` sets the user name from that config.
-->
아래 예제에서 `@Optional`로 주입되는 `UserServiceConfig` 객체는 `UserService`의 환경을 설정하는 용도로 사용됩니다. 그래서 `UserServiceConfig` 객체가 존재하면 이 객체로 전달받은 사용자의 이름으로 `UserService`를 설정할 수 있습니다.

<!--
<code-example path="ngmodules/src/app/greeting/user.service.ts" region="ctor" header="src/app/greeting/user.service.ts (constructor)" linenums="false">
-->
<code-example path="ngmodules/src/app/greeting/user.service.ts" region="ctor" header="src/app/greeting/user.service.ts (생성자)" linenums="false">

</code-example>

<!--
Here's `forRoot()` that takes a `UserServiceConfig` object:
-->
그리고 `UserServiceConfig` 객체를 활용하는 `forRoot()` 함수는 다음과 같이 정의합니다.

<code-example path="ngmodules/src/app/greeting/greeting.module.ts" region="for-root" header="src/app/greeting/greeting.module.ts (forRoot)" linenums="false">

</code-example>

<!--
Lastly, call it within the `imports` list of the `AppModule`. In the following
snippet, other parts of the file are left out. For the complete file, see the <live-example name="ngmodules"></live-example>, or continue to the next section of this document.
-->
이제 이 `forRoot()` 메소드는 `AppModule`의 `imports`에 다음과 같이 사용합니다.
Lastly, call it within the `imports` list of the `AppModule`.
In the following snippet, other parts of the file are left out. For the complete file, see the <live-example name="ngmodules"></live-example>, or continue to the next section of this document.

<code-example path="ngmodules/src/app/app.module.ts" region="import-for-root" header="src/app/app.module.ts (imports)" linenums="false">

</code-example>

<!--
The app displays "Miss Marple" as the user instead of the default "Sherlock Holmes".
-->
이제 이 애플리케이션은 기본값인 "Sherlock Holmes" 대신 "Miss Marple"을 화면에 표시합니다.

<!--
Remember to import `GreetingModule` as a Javascript import at the top of the file and don't add it to more than one `@NgModule` `imports` list.
-->
`GreetingModule`은 파일의 가장 위쪽에 JavaScript `import` 키워드로 로드하며, `@NgModule`의 `imports`에 딱 한 번만 등록한다는 것을 잊지 마세요.

<!-- KW--Does this mean that if we need it elsewhere we only import it at the top? I thought the services would all be available since we were importing it into `AppModule` in `providers`. -->

<!--
## Prevent reimport of the `GreetingModule`
-->
## `GreetingModule` 중복로드 방지하기

<!--
Only the root `AppModule` should import the `GreetingModule`. If a
lazy-loaded module imports it too, the app can generate
[multiple instances](guide/ngmodule-faq#q-why-bad) of a service.
-->
`GreetingModule`은 최상위 `AppModule`에서만 로드해야 합니다. 만약 지연로딩하는 모듈에서도 `GreetingModule`을 로드하게 되면 [싱글턴 서비스의 인스턴스가 여러개 생성](guide/ngmodule-faq#q-why-bad)됩니다.

<!--
To guard against a lazy loaded module re-importing `GreetingModule`, add the following `GreetingModule` constructor.
-->
그래서 지연로딩하는 모듈이 `GreetingModule`을 중복로드하는 것을 방지하려면 `GreetingModule` 생성자를 다음과 같이 작성하면 됩니다.

<code-example path="ngmodules/src/app/greeting/greeting.module.ts" region="ctor" header="src/app/greeting/greeting.module.ts" linenums="false">

</code-example>

<!--
The constructor tells Angular to inject the `GreetingModule` into itself.
The injection would be circular if Angular looked for
`GreetingModule` in the _current_ injector, but the `@SkipSelf()`
decorator means "look for `GreetingModule` in an ancestor
injector, above me in the injector hierarchy."
-->
이 생성자는 `GreetingModule` 자신을 의존성으로 주입하라고 요청합니다. 이 의존성 주입이 _현재_ 인젝터 계층에서 이루어지면 순환 참조를 발생시킬 수 있습니다. 그래서 `@SkipSelf()` 데코레이터를 사용해서 현재 인젝터 계층보다 상위 계층에서 의존성 객체를 찾도록 지정합니다.

<!--
By default, the injector throws an error when it can't
find a requested provider.
The `@Optional()` decorator means not finding the service is OK.
The injector returns `null`, the `parentModule` parameter is null,
and the constructor concludes uneventfully.
-->
기본적으로 인젝터가 의존성 객체를 찾지 못하면 에러가 발생합니다. 하지만 이 경우는 의존성으로 주입하지 않는 것이 정상 시나리오이기 때문에 `@Optional` 데코레이터를 붙여서 의존성 주입에 실패해도 에러가 아니라는 것을 지정했습니다. 그래서 인젝터가 주입하는 객체는 `null`이 되고, `parentModule` 프로퍼티에 할당되는 값도 `null`이 되며, 에러는 발생하지 않고 생성자는 종료됩니다.

<!--
It's a different story if you improperly import `GreetingModule` into a lazy loaded module such as `CustomersModule`.

Angular creates a lazy loaded module with its own injector,
a child of the root injector.
`@SkipSelf()` causes Angular to look for a `GreetingModule` in the parent injector, which this time is the root injector.
Of course it finds the instance imported by the root `AppModule`.
Now `parentModule` exists and the constructor throws the error.
-->
하지만 `CustomersModule`과 같이 지연로딩되는 모듈에서 `GreetingModule`을 로드하는 경우에는 상황이 조금 다릅니다.

지연로딩되는 모듈에는 인젝터가 따로 생성되는데, 이 인젝터는 최상위 인젝터의 자식 인젝터입니다. 그리고 `@SkipSelf()` 데코레이터가 사용되었기 때문에 부모 인젝터 계층에서 `GreetingModule`을 찾기 시작하는데, 이 경우에는 최상위 인젝터에서 의존성 객체를 찾습니다.
이번에는 당연하게도 `AppModule`에 있는 `GreetingModule` 인스턴스를 찾게 됩니다.
그래서 `parentModule` 프로퍼티에 객체가 할당되기 때문에 생성자는 에러를 발생시킵니다.

<!--
Here are the two files in their entirety for reference:
-->
설명한 내용을 코드로 확인해 보세요.

<code-tabs linenums="false">
 <code-pane header="app.module.ts" path="ngmodules/src/app/app.module.ts">
 </code-pane>
 <code-pane header="greeting.module.ts" region="whole-greeting-module" path="ngmodules/src/app/greeting/greeting.module.ts">
 </code-pane>
</code-tabs>

<hr />

<!--
## More on NgModules
-->
## NgModule 더 알아보기

<!--
You may also be interested in:
* [Sharing Modules](guide/sharing-ngmodules), which elaborates on the concepts covered on this page.
* [Lazy Loading Modules](guide/lazy-loading-ngmodules).
* [NgModule FAQ](guide/ngmodule-faq).
-->
다음 내용에 대해서도 확인해 보세요.
* [모듈 공유하기](guide/sharing-ngmodules)
* [기능모듈 지연로딩](guide/lazy-loading-ngmodules)
* [NgModule FAQ](guide/ngmodule-faq)