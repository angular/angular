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
이 내용을 자세하게 살펴보기 위해, `RouterModule`을 예로 들어봅시다. `RouterModule`에는 `Router` 서비스 프로바이더를 등록하며, 이 모듈에는 `RouterOutlet` 디렉티브도 정의되어 있습니다. 이 모듈은 최상위 앱 모듈에 로드되고, 애플리케이션은 `Router`와 `RouterOutlet`을 사용합니다. 그리고 이 모듈은 다른 모듈에도 로드되며, 서브 라우팅 템플릿을 표시하는 `RouterOutlet` 디렉티브도 제공합니다.

<!--
If the `RouterModule` didn’t have `forRoot()` then each route component would instantiate a new `Router` instance, which would break the application as there can only be one `Router`. For this reason, the `RouterModule` has the `RouterOutlet` declaration so that it is available everywhere, but the `Router` provider is only in the `forRoot()`. The result is that the root application module imports `RouterModule.forRoot(...)` and gets a `Router`, whereas all route components import `RouterModule` which does not include the `Router`.
-->
만약 `RouterModule`에 `forRoot()` 메소드가 없다면, 네비게이션을 할 때마다 새로운 `Router` 인스턴스가 만들어지고, 라우팅 컴포넌트도 계속 생성될 것입니다. 그러면 애플리케이션이 제대로 동작할 수 없기 때문에 `Router` 인스턴스는 하나만 존재해야 합니다. 그래서 `RouterModule`은 `RouterOutlet`과 같은 디렉티브는 모듈 안쪽 어디에서라도 자유롭게 사용할 수 있도록 허용하지만, `Router`의 프로바이더는 `forRoot()` 안에서만 허용합니다. 그래서 애플리케이션 최상위 모듈에서는 `RouterModule.forRoot()`를 로드해서 `Router`가 포함된 모듈을 가져오고, 하위 모듈에서는 `RouterModule`을 로드해서 `Router`가 없는 모듈을 가져옵니다.

<!--
If you have a module which provides both providers and declarations, use this pattern to separate them out.
-->
만약 프로바이더와 컴포넌트 등록을 함께 하고 있는 모듈이 있다면, 이 패턴을 사용해서 용도에 맞게 분리할 수 있는지 검토해 보세요.

<!--
A module that adds providers to the application can offer a
facility for configuring those providers as well through the
`forRoot()` method.
-->
애플리케이션에 등록할 프로바이더를 제공하는 모듈이라면, 이 프로바이더를 `forRoot()` 메소드를 통해 제공하는 것이 좋습니다.

<!--
`forRoot()` takes a service configuration object and returns a
[ModuleWithProviders](api/core/ModuleWithProviders), which is
a simple object with the following properties:
-->
`forRoot()` 함수는 서비스 설정 객체를 인자로 받아서 [ModuleWithProviders](api/core/ModuleWithProviders)를 반환하는데, 이 모듈에는 다음과 같은 프로퍼티가 있습니다:

<!--
* `ngModule`: in this example, the `CoreModule` class.
* `providers`: the configured providers.
-->
* `ngModule` : 이 예제에서는 `CoreModule` 클래스를 의미합니다.
* `providers` : 인자로 받은 객체로 설정된 프로바이더를 의미합니다.

<!--
In the <live-example name="ngmodules">live example</live-example>
the root `AppModule` imports the `CoreModule` and adds the
`providers` to the `AppModule` providers. Specifically,
Angular accumulates all imported providers
before appending the items listed in `@NgModule.providers`.
This sequence ensures that whatever you add explicitly to
the `AppModule` providers takes precedence over the providers
of imported modules.
-->
이 문서와 관련된 예제를 <live-example name="ngmodules">live example</live-example>에서 열어보면, `AppModule`이 `CoreModule`을 로드하고, `CoreModule`에서 제공하는 서비스 프로바이더도 `Appmodule`에 로드합니다. 좀 더 정확하게 설명하면, `AppModule`의 `providers` 목록은 아무것도 없지만, 모듈의 `imports`로 불러오는 다른 모듈에 서비스 프로바이더가 존재하면 이 서비스 프로바이더를 현재 모듈의 `@NgModule.providers`보다 먼저 등록합니다. 그래서 현재 모듈이 다른 모듈의 서비스를 의존성으로 주입받을 때, 이 의존성은 현재 모듈의 프로바이더보다 먼저 등록되었기 때문에 문제없이 사용할 수 있습니다.

<!--
Import `CoreModule` and use its `forRoot()` method one time, in `AppModule`, because it registers services and you only want to register those services one time in your app. If you were to register them more than once, you could end up with multiple instances of the service and a runtime error.
-->
`CoreModule`은 `AppModule`에 딱 한 번만, `forRoot()` 메소드를 사용해서 로드해야 합니다. 왜냐하면 `forRoot()`를 사용해야 싱글턴 서비스 프로바이더를 등록할 수 있는데, 이 서비스 프로바이더들은 앱 전체에서 한 번만 등록되어야 하기 때문입니다. 싱글턴 서비스 프로바이더를 여러번 등록하면 이 서비스가 여러번 생성되면서 런타임 에러가 발생할 수 있습니다.

<!--
You can also add a `forRoot()` method in the `CoreModule` that configures
the core `UserService`.
-->
`CoreModule`의 `forRoot()` 메소드는 코어 서비스인 `UserService`를 설정하는 용도로도 사용할 수 있습니다.

<!--
In the following example, the optional, injected `UserServiceConfig`
extends the core `UserService`. If a `UserServiceConfig` exists, the `UserService` sets the user name from that config.
-->
아래 예제에서 `@Optional`로 주입되는 `UserServiceConfig` 객체는 `UserService`의 환경을 설정하는 용도로 사용됩니다. 그래서 `UserServiceConfig` 객체가 존재하면 이 객체로 전달받은 사용자의 이름으로 `UserService`를 설정할 수 있습니다.

<!--
<code-example path="ngmodules/src/app/core/user.service.ts" region="ctor" title="src/app/core/user.service.ts (constructor)" linenums="false">
-->
<code-example path="ngmodules/src/app/core/user.service.ts" region="ctor" title="src/app/core/user.service.ts (생성자)" linenums="false">

</code-example>

<!--
Here's `forRoot()` that takes a `UserServiceConfig` object:
-->
그리고 `UserServiceConfig` 객체를 활용하는 `forRoot()` 함수는 다음과 같이 정의합니다.

<code-example path="ngmodules/src/app/core/core.module.ts" region="for-root" title="src/app/core/core.module.ts (forRoot)" linenums="false">

</code-example>

<!--
Lastly, call it within the `imports` list of the `AppModule`.
-->
이제 이 `forRoot()` 메소드는 `AppModule`의 `imports`에 다음과 같이 사용합니다.

<code-example path="ngmodules/src/app/app.module.ts" region="import-for-root" title="src/app/app.module.ts (imports)" linenums="false">

</code-example>

<!--
The app displays "Miss Marple" as the user instead of the default "Sherlock Holmes".
-->
이제 이 애플리케이션은 기본값인 "Sherlock Holmes" 대신 "Miss Marple"을 화면에 표시합니다.

<!--
Remember to _import_ `CoreModule` as a Javascript import at the top of the file; don't add it to more than one `@NgModule` `imports` list.
-->
`CoreModule`은 파일의 가장 위쪽에 JavaScript `import` 키워드로 로드하며, `@NgModule`의 `imports`에 딱 한 번만 등록한다는 것을 잊지 마세요.

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
