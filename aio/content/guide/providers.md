<!--
# Providers
-->
# 프로바이더 (Providers)

<!--
#### Prerequisites:
-->
#### 사전지식:
<!--
* A basic understanding of [Bootstrapping](guide/bootstrapping).
* Familiarity with [Frequently Used Modules](guide/frequent-ngmodules).
-->
* [부트스트랩](guide/bootstrapping)
* [자주 사용하는 NgModule](guide/frequent-ngmodules)

<!--
For the final sample app using the provider that this page describes,
see the <live-example></live-example>.
-->
이 가이드에서 다루는 예제의 최종 코드는 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

<hr>

<!--
A provider is an instruction to the DI system on how to obtain a value for a dependency. Most of the time, these dependencies are services that you create and provide.
-->
프로바이더는 의존성 주입에 사용되는 객체를 가져오는 방법을 지정한 것입니다. 이 때 의존성으로 주입되는 객체는 일반적으로 서비스입니다.

<!--
## Providing a service
-->
## 서비스 생성하기

<!--
If you already have an app that was created with the [Angular CLI](cli), you can create a service using the [`ng generate`](cli/generate) CLI command in the root project directory. Replace _User_ with the name of your service.
-->
[Angular CLI](cli)로 프로젝트를 생성했다면, 서비스를 만드는 것도 간단합니다. 프로젝트 최상위 폴더에서 [`ng generate`](cli/generate) 명령을 싱행하는데, 이 때 `Service` 접미사 없이 _User_ 라고 지정합니다.

```sh
ng generate service User
```

<!--
This command creates the following `UserService` skeleton:
-->
그러면 `UserService`가 다음과 같이 생성됩니다:

<code-example path="providers/src/app/user.service.0.ts"  header="src/app/user.service.ts" linenums="false"> </code-example>

<!--
You can now inject `UserService` anywhere in your application.

The service itself is a class that the CLI generated and that's decorated with `@Injectable()`. By default, this decorator has a `providedIn` property, which creates a provider for the service. In this case, `providedIn: 'root'` specifies that Angular should provide the service in the root injector.
-->
이제 이 `UserService`는 애플리케이션 어디에라도 의존성으로 자유롭게 주입할 수 있습니다.

서비스는 단순하게 JavaScript 클래스일 뿐이며, Angular CLI로 서비스를 생성하면 CLI가 `@Injectable` 데코레이터를 자동으로 붙여서 Angular 서비스로 지정합니다. `@Injectable` 데코레이터 안에는 `providedIn` 프로퍼티가 있는데, 이 프로퍼티를 지정하면 서비스 프로바이더의 범위를 지정할 수 있습니다. 이 예제 코드에서 지정된 `providedIn: 'root'`는 이 서비스가 최상위 인젝터에 위치하도록 지정하는 코드입니다.


<!--
## Provider scope
-->
## 프로바이더의 범위

<!--
When you add a service provider to the root application injector, it’s available throughout the app. Additionally, these providers are also available to all the classes in the app as long they have the lookup token.

You should always provide your service in the root injector unless there is a case where you want the service to be available only if the consumer imports a particular `@NgModule`.
-->
애플리케이션의 최상위 인젝터에 서비스 프로바이더를 등록하면, 이 서비스는 앱 전역에서 자유롭게 사용할 수 있습니다.

서비스 프로바이더는 특정 `@NgModule`에 포함되지 않는 이상, 최상위 인젝터에 등록하는 것이 좋습니다.

<!--
## `providedIn` and NgModules
-->
## `providedIn`과 NgModule

<!--
It's also possible to specify that a service should be provided in a particular `@NgModule`. For example, if you don't want `UserService` to be available to applications unless they import a `UserModule` you've created, you can specify that the service should be provided in the module:
-->
특정 `@NgModule`에 포함되도록 서비스를 등록할 수도 있습니다. 예를 들어 `UserModule`을 로드하지 않은 상태에서는 `UserService`를 사용할 수 없도록 하려면, 코드를 다음과 같이 작성하면 됩니다:

<code-example path="providers/src/app/user.service.1.ts"  header="src/app/user.service.ts" linenums="false">  </code-example>

<!--
The example above shows the preferred way to provide a service in a module. This method is preferred because it enables tree-shaking of the service if nothing injects it. If it's not possible to specify in the service which module should provide it, you can also declare a provider for the service within the module:
-->
이 방법을 사용하면 실제로 사용되지 않는 서비스는 트리 셰이킹으로 제거되기 때문에 애플리케이션을 배포할 때도 좋습니다. 서비스가 포함될 모듈을 지정하는 방법을 사용할 수 없다면, 반대로 모듈 안에 서비스 프로바이더를 등록하는 방법도 있습니다:

<code-example path="providers/src/app/user.module.ts"  header="src/app/user.module.ts" linenums="false">  </code-example>

<!--
## Limiting provider scope by lazy loading modules
-->
## 프로바이더 범위 제한하기 : 지연 로딩되는 모듈

<!--
In the basic CLI-generated app, modules are eagerly loaded which means that they are all loaded when the app launches. Angular uses an injector system to make things available between modules. In an eagerly loaded app, the root application injector makes all of the providers in all of the modules available throughout the app.
-->
Angular CLI를 사용해서 생성한 앱은 애플리케이션이 실행되면서 모든 모듈이 즉시 로드됩니다. 애플리케이션의 최상위 인젝터는 애플리케이션이 실행된 직후에 모듈 안에 등로된 프로바이더에 접근해서 의존성 객체를 생성할 준비를 합니다.

<!--
This behavior necessarily changes when you use lazy loading. Lazy loading is when you load modules only when you need them; for example, when routing. They aren’t loaded right away like with eagerly loaded modules. This means that any services listed in their provider arrays aren’t available because the root injector doesn’t know about these modules.
-->
하지만 지연 로딩 되는 모듈에서는 좀 다릅니다. 지연 로딩 되도록 설정된 모듈은 애플리케이션이 실행된 직후에 바로 로드되지 않고, 라우팅 이동 등 해당 모듈을 사용하는 시점에 로드됩니다. 따라서 지연 로딩되는 모듈에 지정된 서비스 프로바이더는 최상위 인젝터에서 인식할 수 없기 때문에 이 모듈 밖에서는 사용할 수도 없습니다.

<!-- KW--Make diagram here -->
<!-- KW--per Misko: not clear if the lazy modules are siblings or grand-children. They are both depending on router structure. -->
<!--
When the Angular router lazy-loads a module, it creates a new injector. This injector is a child of the root application injector. Imagine a tree of injectors; there is a single root injector and then a child injector for each lazy loaded module. The router adds all of the providers from the root injector to the child injector. When the router creates a component within the lazy-loaded context, Angular prefers service instances created from these providers to the service instances of the application root injector.
-->
Angular 라우터가 모듈을 지연 로딩하면, 이 때 새로운 인젝터를 생성합니다. 이 인젝터는 애플리케이션의 최상위 인젝터의 자식 인젝터인데, 인젝트도 모듈 트리와 비슷하게 트리 구조로 구성됩니다. 지연 로딩되는 모듈에 생성된 인젝터가 등록하는 모든 프로바이더는 최상위 인젝터에도 등록되며, 지연 로딩되는 모듈에 있는 컴포넌트가 사용될 때는 애플리케이션의 최상위 인젝터 대신 이 모듈의 인젝터가 서비스 인스턴스를 생성합니다.

<!--
Any component created within a lazy loaded module’s context, such as by router navigation, gets the local instance of the service, not the instance in the root application injector. Components in external modules continue to receive the instance created for the application root.
-->
지연 로딩되는 모듈이 로딩되고 나면, 지연 로딩되는 모듈이 아니라면 애플리케이션의 최상위 인젝터를 계속 사용하지만 지연 로딩되는 모듈 안에서는 최상위 인젝터 대신 모듈의 인젝터를 사용합니다.

<!--
Though you can provide services by lazy loading modules, not all services can be lazy loaded. For instance, some modules only work in the root module, such as the Router. The Router works with the global location object in the browser.
-->
하지만 모듈이 지연 로딩된다고 해서 모든 서비스가 지연로딩 되는 것은 아닙니다. 예를 들면, Router와 같은 모듈은 앱 모듈에만 등록되었지만 이 모듈은 브라우저 전체를 대상으로 동작합니다.

<!--
## Limiting provider scope with components
-->
## 프로바이더 범위 제한하기 : 컴포넌트

<!--
Another way to limit provider scope is by adding the service you want to limit to the component’s
`providers` array. Component providers and NgModule providers are independent of each other. This
method is helpful for when you want to eagerly load a module that needs a service all to itself.
Providing a service in the component limits the service only to that component (other components in
the same module can’t access it.)
-->
프로바이더의 범위는 컴포넌트 안으로 제한할 수도 있는데, 이 때 컴포넌트 메타데이터의 `providers` 배열을 사용합니다. 그러면 NgModule의 프로바이더와는 별개로 컴포넌트 프로바이더가 의존성 객체를 생성합니다. 이 방법은 컴포넌트마다 서비스 인스턴스를 별개로 사용하는 경우에 활용하면 좋습니다. 서비스의 인스턴스가 각각 생성되면 컴포넌트에서 이 서비스를 사용해 어떤 동작을 하더라도 다른 컴포넌트는 영향을 받지 않습니다.

<code-example path="providers/src/app/app.component.ts" region="component-providers" header="src/app/app.component.ts" linenums="false">
</code-example>

<!--
## Providing services in modules vs. components
-->
## 프로바이더의 범위 : 모듈 vs. 컴포넌트

<!--
Generally, provide services the whole app needs in the root module and scope services by providing them in lazy loaded modules.
-->
일반적으로 서비스는 최상위 모듈 전역을 대상으로 제공되며 지연 로딩되는 모듈의 서비스는 그 모듈의 범위로 제한됩니다.

<!--
The router works at the root level so if you put providers in a component, even `AppComponent`, lazy loaded modules, which rely on the router, can’t see them.
-->
그리고 라우터는 최상위 계층에서 동작하기 때문에 `AppComponent`를 포함한 모든 컴포넌트에서 서비스를 자유롭게 주입받을 수 있지만, 지연 로딩 모듈은 모듈이 로딩되기 전까지 사용할 수 없습니다.

<!-- KW--Make a diagram here -->
<!--
Register a provider with a component when you must limit a service instance to a component and its component tree, that is, its child components. For example, a user editing component, `UserEditorComponent`, that needs a private copy of a caching `UserService` should register the `UserService` with the `UserEditorComponent`. Then each new instance of the `UserEditorComponent` gets its own cached service instance.
-->
프로바이더를 컴포넌트에 지정하면 서비스 인스턴스의 범위도 해당 컴포넌트로 제한되며, 컴포넌트가 생성될 때마다 서비스 인스턴스가 생성됩니다. 예를 들면 `UserEditorComponent`에서 `UserService`를 사용하는데 이 서비스가 컴포넌트마다 다른 값을 캐싱하는 용도로 사용할 수 있으며, 새로운 `UserEditorComponent`가 생성되면 `UserService`의 인스턴스도 새롭게 생성됩니다.

<hr>

<!--
## More on NgModules
-->
## NgModule 더 알아보기

<!--
You may also be interested in:
* [Singleton Services](guide/singleton-services), which elaborates on the concepts covered on this page.
* [Lazy Loading Modules](guide/lazy-loading-ngmodules).
* [Tree-shakable Providers](guide/dependency-injection-providers#tree-shakable-providers).
* [NgModule FAQ](guide/ngmodule-faq).
-->
다음 내용에 대해서도 알아보세요.
* [싱글턴 서비스](guide/singleton-services)
* [모듈 지연 로딩](guide/lazy-loading-ngmodules)
* [트리 셰이킹 프로바이더](guide/dependency-injection-providers#트리-셰이킹-대상이-되는-프로바이더)
* [NgModule FAQ](guide/ngmodule-faq)
