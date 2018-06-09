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
* Declare that the service should be provided in the application root.
* Include the service in the `AppModule` or in a module that is only imported by the `AppModule`.
-->
* 서비스 프로바이더를 애플리케이션 루트에 선언하는 방법
* 서비스를 `AppModule`에 선언하고 다른 모듈에서 `AppModule`만 로드하는 방법

<!--
Beginning with Angular 6.0, the preferred way to create a singleton services is to specify on the service that it should be provided in the application root. This is done by setting `providedIn` to `root` on the service's `@Injectable` decorator:
-->
Angular 6.0부터는 싱글턴 서비스를 만들 때 서비스 프로바이더를 애플리케이션 루트에 등록하도록 명시적으로 정의하는 방법을 권장합니다. 이 방법은 `@Injectable` 데코레이터 중 `providedIn` 프로퍼티를 `root`로 지정하면 됩니다:

<code-example path="providers/src/app/user.service.0.ts"  title="src/app/user.service.0.ts" linenums="false"> </code-example>

<!--
For more detailed information on services, see the [Services](tutorial/toh-pt4) chapter of the
[Tour of Heroes tutorial](tutorial).
-->
서비스에 대한 더 자세한 정보는 [히어로들의 여행 튜토리얼](tutorial)의 [서비스](tutorial/toh-pt4) 문서를 확인하세요.

## `forRoot()`

<!--
If a module provides both providers and declarations (components, directives, pipes) then loading it in a child injector such as a route, would duplicate the provider instances. The duplication of providers would cause issues as they would shadow the root instances, which are probably meant to be singletons. For this reason Angular provides a way to separate providers out of the module so that same module can be imported into the root module with `providers` and child modules without `providers`.
-->
모듈의 인젝터와 모듈 내부의 구성요소(컴포넌트, 디렉티브, 파이프)에 같은 프로바이더가 정의되어 있는 경우가 생길 수 있습니다. 이 경우에는 자식 트리에서 생성한 인스턴스가 최상위 인스턴스를 가리기 때문에 문제가 될 수 있으며, 싱글턴 서비스를 사용해서 이 문제를 방지해야 합니다. 이 때 Angular가 제공하는 방법을 사용하면 자식 모듈에 지정했던 `providers`를 모듈 외부로 옮기고, 최상위 앱 모듈에서만 이 프로바이더를 사용하도록 지정할 수 있습니다.

<!--
1. Create a static method `forRoot()` (by convention) on the module.
2. Place the providers into the `forRoot` method as follows.
-->
1. (사용하기 편하도록) 모듈에 정적 메소드 `forRoot()`를 정의합니다.
1. 프로바이더를 이 함수 안에 등록합니다.

<!-- MH: show a simple example how to do that without going to deep into it. -->
<!--
To make this more concrete, consider the `RouterModule` as an example. `RouterModule` needs to provide the `Router` service, as well as the `RouterOutlet` directive. `RouterModule` has to be imported by the root application module so that the application has a `Router` and the application has at least one `RouterOutlet`. It also must be imported by the individual route components so that they can place `RouterOutlet` directives into their template for sub-routes.
-->
이 내용을 자세하게 살펴보기 위해, `RouterModule`을 예로 들어봅시다. `RouterModule`에는 `Router` 서비스 프로바이더를 등록하며, 이 모듈에는 `RouterOutlet` 디렉티브도 정의되어 있습니다. 이 모듈은 최상위 앱 모듈에 로드되고, 애플리케이션은 `Router`와 `RouterOutlet`을 사용합니다. 그리고 이 모듈은 다른 모듈에도 로드되며, 서브 라우팅 템플릿을 표시하는 `RouterOutlet`에 들어갈 컴포넌트도 포함하고 있습니다.

If the `RouterModule` didn’t have `forRoot()` then each route component would instantiate a new `Router` instance, which would break the application as there can only be one `Router`. For this reason, the `RouterModule` has the `RouterOutlet` declaration so that it is available everywhere, but the `Router` provider is only in the `forRoot()`. The result is that the root application module imports `RouterModule.forRoot(...)` and gets a `Router`, whereas all route components import `RouterModule` which does not include the `Router`.

If you have a module which provides both providers and declarations, use this pattern to separate them out.

A module that adds providers to the application can offer a
facility for configuring those providers as well through the
`forRoot()` method.

`forRoot()` takes a service configuration object and returns a
[ModuleWithProviders](api/core/ModuleWithProviders), which is
a simple object with the following properties:

* `ngModule`: in this example, the `CoreModule` class.
* `providers`: the configured providers.

In the <live-example name="ngmodules">live example</live-example>
the root `AppModule` imports the `CoreModule` and adds the
`providers` to the `AppModule` providers. Specifically,
Angular accumulates all imported providers
before appending the items listed in `@NgModule.providers`.
This sequence ensures that whatever you add explicitly to
the `AppModule` providers takes precedence over the providers
of imported modules.

Import `CoreModule` and use its `forRoot()` method one time, in `AppModule`, because it registers services and you only want to register those services one time in your app. If you were to register them more than once, you could end up with multiple instances of the service and a runtime error.

You can also add a `forRoot()` method in the `CoreModule` that configures
the core `UserService`.

In the following example, the optional, injected `UserServiceConfig`
extends the core `UserService`. If a `UserServiceConfig` exists, the `UserService` sets the user name from that config.

<code-example path="ngmodules/src/app/core/user.service.ts" region="ctor" title="src/app/core/user.service.ts (constructor)" linenums="false">

</code-example>

Here's `forRoot()` that takes a `UserServiceConfig` object:

<code-example path="ngmodules/src/app/core/core.module.ts" region="for-root" title="src/app/core/core.module.ts (forRoot)" linenums="false">

</code-example>

Lastly, call it within the `imports` list of the `AppModule`.

<code-example path="ngmodules/src/app/app.module.ts" region="import-for-root" title="src/app/app.module.ts (imports)" linenums="false">

</code-example>

The app displays "Miss Marple" as the user instead of the default "Sherlock Holmes".

Remember to _import_ `CoreModule` as a Javascript import at the top of the file; don't add it to more than one `@NgModule` `imports` list.

<!-- KW--Does this mean that if we need it elsewhere we only import it at the top? I thought the services would all be available since we were importing it into `AppModule` in `providers`. -->

## Prevent reimport of the `CoreModule`

Only the root `AppModule` should import the `CoreModule`. If a
lazy-loaded module imports it too, the app can generate
[multiple instances](guide/ngmodule-faq#q-why-bad) of a service.

To guard against a lazy-loaded module re-importing `CoreModule`, add the following `CoreModule` constructor.

<code-example path="ngmodules/src/app/core/core.module.ts" region="ctor" title="src/app/core/core.module.ts" linenums="false">

</code-example>

The constructor tells Angular to inject the `CoreModule` into itself.
The injection would be circular if Angular looked for
`CoreModule` in the _current_ injector. The `@SkipSelf`
decorator means "look for `CoreModule` in an ancestor
injector, above me in the injector hierarchy."

If the constructor executes as intended in the `AppModule`,
there would be no ancestor injector that could provide an instance of `CoreModule` and the injector should give up.

By default, the injector throws an error when it can't
find a requested provider.
The `@Optional` decorator means not finding the service is OK.
The injector returns `null`, the `parentModule` parameter is null,
and the constructor concludes uneventfully.

It's a different story if you improperly import `CoreModule` into a lazy-loaded module such as `CustomersModule`.

Angular creates a lazy-loaded module with its own injector,
a _child_ of the root injector.
`@SkipSelf` causes Angular to look for a `CoreModule` in the parent injector, which this time is the root injector.
Of course it finds the instance imported by the root `AppModule`.
Now `parentModule` exists and the constructor throws the error.

Here are the two files in their entirety for reference:

<code-tabs linenums="false">
 <code-pane
   title="app.module.ts"
   path="ngmodules/src/app/app.module.ts">
 </code-pane>
 <code-pane
   title="core.module.ts"
   region="whole-core-module"
   path="ngmodules/src/app/core/core.module.ts">
 </code-pane>
</code-tabs>


<hr>

## More on NgModules

You may also be interested in:
* [Sharing Modules](guide/sharing-ngmodules), which elaborates on the concepts covered on this page.
* [Lazy Loading Modules](guide/lazy-loading-ngmodules).
* [NgModule FAQ](guide/ngmodule-faq).
