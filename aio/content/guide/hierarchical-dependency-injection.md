<!--
# Hierarchical Dependency Injectors
-->
# 인젝터 계층

<!--
The Angular dependency injection system is _hierarchical_.
There is a tree of injectors that parallels an app's component tree.
You can reconfigure the injectors at any level of that component tree.
-->
Angular의 인젝터는 _계층_ 구조로 구성됩니다.
쉽게 말해서 인젝터는 컴포넌트 구조에 따라 트리 형태로 구성되며 어떤 계층에서는 병렬로 존재하기도 합니다.
컴포넌트 트리에 생성된 인젝터는 개발자가 원하는 대로 다시 설정할 수도 있습니다.

<!--
This guide explores this system and how to use it to your advantage.
It uses examples based on this <live-example></live-example>.
-->
이 문서에서는 Angular의 의존성 주입 시스템을 어떻게 활용할 수 있는지 설명합니다.
이 문서에서 다루는 예제는 <live-example></live-example>에서 직접 실행하거나 다운받아 확인할 수 있습니다.

{@a ngmodule-vs-comp}
{@a where-to-register}

<!--
## Where to configure providers
-->
## 프로바이더는 어디에 등록해야 할까

<!--
You can configure providers for different injectors in the injector hierarchy.
An internal platform-level injector is shared by all running apps.
The `AppModule` injector is the root of an app-wide injector hierarchy, and within
an NgModule, directive-level injectors follow the structure of the component hierarchy.
-->
프로바이더는 인젝터 계층 중 어디에라도 자유롭게 등록할 수 있습니다.
그리고 플랫폼 계층에 생성되는 인젝터는 애플리케이션 전체 범위에 인스턴스를 공유합니다.
`AppModule` 인젝터는 애플리케이션에 생성되는 인젝터 중 최상위에 존재하는 인젝터이며, NgModule이나 컴포넌트 계층에 따라 자식 인젝터가 생성되기도 합니다.

<!--
The choices you make about where to configure providers lead to differences in the final bundle size, service _scope_, and service _lifetime_.
-->
이 때 어떤 인젝터에 프로바이더를 등록하느냐에 따라 최종 번들 결과물의 크기가 달라지며, 서비스의 _스코프_ 도 달라지고, 서비스 인스턴스가 존재하는 시점도 달라집니다.

<!--
When you specify providers in the `@Injectable()` decorator of the service itself (typically at the app root level), optimization tools such as those used by the CLI's production builds can perform *tree shaking*, which removes services that aren't used by your app. Tree shaking results in smaller bundle sizes. 
-->
서비스 클래스에 `@Injectable()` 데코레이터를 직접 사용하면 보통 애플리케이션 최상위 인젝터에 서비스 프로바이더를 등록하게 되는데, 이렇게 등록된 프로바이더는 Angular CLI와 같은 운영용 빌드 툴의 *트리 셰이킹(tree shaking)* 기능의 대상이 됩니다. 트리 셰이킹이 동작하면 실제로 사용되지 않는 서비스를 빌드하지 않기 때문에 번들링 결과물의 크기를 줄일 수 있습니다.

<!--
* Learn more about [tree-shakable providers](guide/dependency-injection-providers#tree-shakable-providers).
-->
* 더 자세한 내용은 [트리셰이킹 대상이 되는 프로바이더](guide/dependency-injection-providers#tree-shakable-providers) 문서를 참고하세요.

<!--
You're likely to inject `UserService` in many places throughout the app and will want to inject the same service instance every time. Providing `UserService` through the `root` injector is a good choice, and is the default that the [Angular CLI](cli) uses when you generate a service for your app.
-->
`UserService`와 같은 서비스는 애플리케이션 전역에서 빈번하게 사용될 수 있으며, 이 인스턴스는 모두 같은 인스턴스로 주입되어야 할 수도 있습니다. 그렇다면 `UserService`는 `root` 인젝터에 등록하는 것이 좋습니다. [Angular CLI](cli)로 서비스를 생성하면 기본으로 `root` 인젝터에 등록됩니다.

<div class="alert is-helpful">
<!--
<header>Platform injector</header>
-->
<header>플랫폼 인젝터 (Platform injector)</header>

<!--
When you use `providedIn:'root'`, you are configuring the root injector for the _app_, which is the injector for `AppModule`.
The actual root of the entire injector hierarchy is a _platform injector_ that is the parent of app-root injectors. 
This allows multiple apps to share a platform configuration. For example, a browser has only one URL bar, no matter how many apps you have running.
-->
서비스 프로바이더를 등록할 때 `providedIn:'root'`라고 지정하면 이 서비스를 _애플리케이션_ 의 최상위 인젝터인 `AppModule`의 인젝터에 등록한다는 것을 의미합니다.
하지만 실제로 인젝터 계층의 최상위에 존재하는 것은 애플리케이션의 최상위 인젝터의 부모인 _플랫폼 인젝터_ 입니다.

<!--
The platform injector is used internally during bootstrap, to configure platform-specific dependencies. You can configure additional platform-specific providers at the platform level by supplying `extraProviders` using the `platformBrowser()` function. 
-->
플랫폼 인젝터는 부트스트랩되는 과정에 플랫폼과 관련된 의존성을 처리하는 용도로 사용됩니다. 플랫폼 계층에서 플랫폼과 관련된 프로바이더를 설정하려면 `platformBrowser()` 함수에 `extraProviders` 옵션을 사용하면 됩니다.

<!--
Learn more about dependency resolution through the injector hierarchy: 
[What you always wanted to know about Angular Dependency Injection tree](https://blog.angularindepth.com/angular-dependency-injection-and-tree-shakeable-tokens-4588a8f70d5d)
-->
인젝터 계층에 대해서 자세하게 알아보려면 [What you always wanted to know about Angular Dependency Injection tree](https://blog.angularindepth.com/angular-dependency-injection-and-tree-shakeable-tokens-4588a8f70d5d) 문서를 참고하세요.

</div>

<!--
*NgModule-level* providers can be specified with `@NgModule()` `providers` metadata option, or in the `@Injectable()` `providedIn` option (with some module other than the root `AppModule`).
-->
`@NgModule()` 데코레이터의 `providers` 메타데이터 옵션에 프로바이더를 등록하거나 `@Injectable()` 데코레이터의 `providedIn` 옵션에 `AppModule`이 아닌 다른 모듈을 지정하면 *NgModule 계층에* 프로바이더를 등록할 수 있습니다.

<!--
Use the `@NgModule()` `providers` option if a module is [lazy loaded](guide/lazy-loading-ngmodules). The module's own injector is configured with the provider when that module is loaded, and Angular can inject the corresponding services in any class it creates in that module. If you use the `@Injectable()` option `providedIn: MyLazyloadModule`, the provider could be shaken out at compile time, if it is not used anywhere else in the app. 
-->
[지연 로딩되는 모듈](guide/lazy-loading-ngmodules)에서도 `@NgModule()`의 `providers` 옵션을 사용할 수 있습니다. 그러면 모듈이 로드될 때 인젝터가 새로 생성되는데, 지연로딩되는 모듈에 필요산 서비스가 추가로 있다면 이 인젝터에 등록해서 사용할 수 있습니다. 하지만 `@Injectable()` 데코레이터에서 `providedIn: MyLazyloadModule`과 같이 지정하면 이 프로바이더는 컴파일되면서 트리셰이킹으로 제거되기 때문에 애플리케이션이 정상적으로 동작하지 않을 수 있습니다.

<!--
* Learn more about [tree-shakable providers](guide/dependency-injection-providers#tree-shakable-providers).
-->
* 트리셰이킹 대상이 되는 프로바이더에 대해 더 알아보려면 [이 문서](guide/dependency-injection-providers#tree-shakable-providers)를 참고하세요.

<!--
For both root-level and module-level injectors, a service instance lives for the life of the app or module, and Angular injects this one service instance in every class that needs it.
-->
최상위 인젝터가 관리하는 서비스 인스턴스는 앱이 종료될 때까지 유지되며 모듈 계층의 인젝터에서 관리하는 서비스 인스턴스는 모듈이 종료될 때까지 유지됩니다. 

<!--
*Component-level* providers configure each component instance's own injector. 
Angular can only inject the corresponding services in that component instance or one of its descendant component instances. 
Angular can't inject the same service instance anywhere else. 
-->
*컴포넌트 계층에* 프로바이더를 등록하면 각 컴포넌트의 인스턴스마다 인젝터가 생성됩니다.
그리고 컴포넌트에 등록된 서비스는 해당 컴포넌트와 이 컴포넌트의 자식 컴포넌트에 의존성으로 주입할 수 있습니다.
이 때 컴포넌트마다 서로 다른 서비스 인스턴스를 주입받습니다.

<!--
A component-provided service may have a limited lifetime. 
Each new instance of the component gets its own instance of the service. 
When the component instance is destroyed, so is that service instance.
-->
컴포넌트에 등록한 서비스의 수명은 모듈에 등록된 서비스와 비교할 때 좀 더 짧습니다.
컴포넌트에 등록된 서비스의 인스턴스는 컴포넌트 인스턴스가 생성될 때 함께 생성되며, 컴포넌트 인스턴스가 종료되면 함께 종료됩니다.

<!--
In our sample app, `HeroComponent` is created when the application starts 
and is never destroyed,
so the `HeroService` instance created for `HeroComponent` lives for the life of the app. 
If you want to restrict `HeroService` access to `HeroComponent` and its nested 
`HeroListComponent`, provide `HeroService` at the component level, in `HeroComponent` metadata.
-->
예제로 살펴본 애플리케이션에서 `HeroComponent`는 애플리케이션이 시작되면서 생성되고 따로 종료되지 않기 때문에, `HeroComponent`가 생성한 `HeroService`의 인스턴스도 애플리케이션이 실행하는 동안 계속 유지됩니다.
만약 `HeroService`의 인스턴스를 `HeroComponent`와 이 컴포넌트의 자식 컴포넌트인 `HeroListComponent`에서만 접근할 수 있도록 제한하려면 `HeroComponent` 메타데이터에 `HeroService`의 프로바이더를 등록하면 됩니다.

<!--
* See more [examples of component-level injection](#component-injectors) below.
-->
* 자세한 내용은 아래에서 설명하는 [컴포넌트 계층의 의존성 주입 예제](#component-injectors)를 참고하세요.


{@a register-providers-injectable}

<!--
### @Injectable-level configuration 
-->
### @Injectable 설정

<!--
The `@Injectable()` decorator identifies every service class. The `providedIn` metadata option for a service class configures a specific injector (typically `root`)
to use the decorated class as a provider of the service. 
When an injectable class provides its own service to the `root` injector, the service is available anywhere the class is imported. 
-->
`@Injectable()` 데코레이터는 서비스 클래스에서 프로바이더를 직접 등록할 때 사용합니다. 그리고 `@Injectable()` 데코레이터의 `providedIn` 메타데이터 옵션을 사용하면 이 서비스 프로바이더가 어떤 인젝터에 등록될지 지정할 수 있는데, 일반적으로 `root`를 지정합니다.
서비스를 `root` 인젝터에 등록하면 애플리케이션 전체 범위에서 이 서비스를 자유롭게 주입할 수 있습니다.

<!--
The following example configures a provider for `HeroService` using the `@Injectable()` decorator on the class.
-->
다음 예제는 `HeroService` 클래스에 `@Injectable()` 데코레이터를 사용해서 프로바이더로 등록하는 예제입니다.

<code-example path="dependency-injection/src/app/heroes/hero.service.0.ts"  header="src/app/heroes/heroes.service.ts" linenums="false"> </code-example> 

<!--
This configuration tells Angular that the app's root injector is responsible for creating an 
instance of `HeroService` by invoking its constructor,
and for making that instance available across the application. 
-->
이렇게 설정하면 애플리케이션 최상위 인젝터가 `HeroService`의 인스턴스를 생성하고 관리하며, 이 서비스를 의존성으로 주입할 때도 항상 같은 인스턴스를 사용합니다.

<!--
Providing a service with the app's root injector is a typical case,
and the CLI sets up this kind of a provider automatically for you
when generating a new service. 
However, you might not always want to provide your service at the root level.
You might, for instance, want users to explicitly opt-in to using the service.
-->
일반적으로 서비스 프로바이더는 애플리케이션의 최상위 인젝터에 등록하며, Angular CLI로 서비스를 생성해도 기본적으로 이렇게 등록하도록 코드가 생성됩니다.
하지만 서비스를 언제나 최상위 계층에만 등록해야 하는 것은 아닙니다.
어떤 경우에는 특정 모듈에서만 서비스를 사용하도록 설정해야 할 수도 있습니다.

<!--
Instead of specifying the `root` injector, you can set `providedIn` to a specific NgModule. 
-->
서비스 프로바이더는 `root` 인젝터 뿐 아니라 특정 NgModule에 등록할 수도 있습니다.

<!--
For example, in the following excerpt, the `@Injectable()` decorator configures a provider
that is available in any injector that includes the `HeroModule`.
-->
아래 코드는 `HeroModule`에서만 서비스를 사용하도록 `@Injectable()` 데코레이터를 설정하는 예제 코드입니다.

<code-example path="dependency-injection/src/app/heroes/hero.service.4.ts"  header="src/app/heroes/hero.service.ts" linenums="false"> </code-example>

<!--
This is generally no different from configuring the injector of the NgModule itself,
except that the service is tree-shakable if the NgModule doesn't use it.
It can be useful for a library that offers a particular service that some
components *might* want to inject optionally,
and leave it up to the app whether to provide the service.
-->
서비스 프로바이더를 이렇게 등록하면 `@NgModule()` 데코레이터에서 직접 등록하는 것과 거의 같지만, 이 경우에는 `providedIn`으로 지정한 NgModule이 실제로 사용되지 않으면 이 서비스도 트리셰이킹 대상이 됩니다.
이 방식은 의존성 객체를 생략해도 되는 컴포넌트가 있는 경우에 사용됩니다.

<!--
* Learn more about [tree-shakable providers](guide/dependency-injection-providers#tree-shakable-providers).
-->
* [트리셰이킹 대상이 되는 프로바이더](guide/dependency-injection-providers#tree-shakable-providers) 문서도 확인해 보세요.


<!--
### @NgModule-level injectors
-->
### @NgModule 계층의 인젝터

<!--
You can configure a provider at the module level using the `providers` metadata option for a non-root NgModule, in order to limit the scope of the provider to that module.
This is the equivalent of specifying the non-root module in the `@Injectable()` metadata, except that the service provided via `providers` is not tree-shakable.
-->
`@Injectable()` 데코레이터의 `providers` 메타데이터 옵션을 사용하면 애플리케이션 최상위 NgModule이 아닌 모듈에도 서비스 프로바이더를 등록할 수 있는데, 이렇게 설정하면 서비스 프로바이더를 해당 모듈에서만 접근할 수 있도록 제한할 수 있습니다.
물론 `@NgModule()` 데코레이터의 `providers`에 서비스 프로바이더를 등록해도 같은 효과를 낼 수 있지만, 위에서 설명한 것처럼 `@NgModule()`에 등록한 서비스 프로바이더는 트리셰이킹의 대상이 되지 않습니다.

<!--
You generally don't need to specify `AppModule` with `providedIn`, because the app's `root` injector is the `AppModule` injector. 
However, if you configure a app-wide provider in the `@NgModule()` metadata for `AppModule`,
it overrides one configured for `root` in the `@Injectable()` metadata. 
You can do this to configure a non-default provider of a service that is shared with multiple apps. 
-->
`providedIn`에 `AppModule`을 명시적으로 지정할 필요는 없습니다. 왜냐하면 애플리케이션의 `root` 인젝터가 `AppModule` 인젝터이기 때문입니다.
하지만 `AppModule`의 `@NgModule()` 메타데이터에 서비스 프로바이더를 명시적으로 등록하면 이 서비스의 `@Injectable()` 메타데이터에 설정된 `root`를 오버라이드합니다.
이 방식은 여러 애플리케이션이 함께 사용하는 서비스를 일부 범위에서 다른 서비스로 대체할 때 사용됩니다.

<!--
Here is an example of the case where the component router configuration includes
a non-default [location strategy](guide/router#location-strategy) by listing its provider
in the `providers` list of the `AppModule`.
-->
그래서 애플리케이션의 [로케이션 정책(location strategy)](guide/router#location-strategy)을 기본값에서 다른 값으로 변경하고 싶다면 `AppModule`의 `providers`에 프로바이더를 다음과 같이 등록하면 됩니다.

<code-example path="dependency-injection-in-action/src/app/app.module.ts" region="providers" header="src/app/app.module.ts (providers)" linenums="false">

</code-example>


{@a register-providers-component}

<!--
### @Component-level injectors
-->
### @Component 계층의 인젝터

<!--
Individual components within an NgModule have their own injectors.
You can limit the scope of a provider to a component and its children
by configuring the provider at the component level using the `@Component` metadata.
-->
NgModule 안에 있는 개별 컴포넌트에도 인젝터가 존재합니다.
컴포넌트를 선언하는 `@Component` 메타데이터에 옵션을 지정하면 컴포넌트 계층에 서비스 프로바이더를 등록할 수 있으며, 이렇게 등록하면 이 서비스는 해당 컴포넌트와 해당 컴포넌트의 자식 컴포넌트에서만 사용할 수 있습니다.

<!--
The following example is a revised `HeroesComponent` that specifies `HeroService` in its `providers` array. `HeroService` can provide heroes to instances of this component, or to any child component instances. 
-->
아래 예제는 `HeroesComponent`의 `providers` 배열에 `HeroService`를 등록하는 예제입니다. `HeroService`는 이 서비스가 등록된 컴포넌트와 그 자식 컴포넌트에만 주입될 수 있습니다.

<code-example path="dependency-injection/src/app/heroes/heroes.component.1.ts" header="src/app/heroes/heroes.component.ts" linenums="false">
</code-example>

<!--
### Element injectors
-->
### 엘리먼트 인젝터

<!--
An injector does not actually belong to a component, but rather to the component instance's anchor element in the DOM. A different component instance on a different DOM element uses a different injector.
-->
엄밀히 말하면 인젝터는 컴포넌트에 속하는 것이 아니라 DOM에 추가된 컴포넌트 인스턴스의 앵커(anchor) 엘리먼트에 존재하는 것입니다. 그래서 서로 다른 DOM 엘리먼트에 각각의 컴포넌트 인스턴스가 있고, 이 컴포넌트 인스턴스와 연결된 인젝터가 존재한다고 할 수 있습니다.

<!--
Components are a special type of directive, and the `providers` property of
`@Component()` is inherited from `@Directive()`. 
Directives can also have dependencies, and you can configure providers
in their `@Directive()` metadata. 
When you configure a provider for a component or directive using the `providers` property, that provider belongs to the injector for the anchor DOM element. Components and directives on the same element share an injector.
-->
컴포넌트는 디렉티브의 한 종류이며 `@Component()` 데코레이터의 `providers` 프로퍼티도 `@Directive()`에 있던 것을 다시 한 번 가져온 것입니다.
그래서 디렉티브에도 의존성 객체가 필요한 경우에도 `@Directive()` 메타데이터에 프로바이더를 등록할 수 있습니다.
컴포넌트나 디렉티브의 `providers`에 프로바이더를 등록하면 이 프로바이더도 앵커 DOM 엘리먼트의 인젝터가 관리합니다. 그리고 같은 엘리먼트에 존재하는 컴포넌트와 디렉티브는 인젝터를 함께 공유합니다.

<!--- TBD with examples
* For an example of how this works, see [Element-level providers](guide/dependency-injection-in-action#directive-level-providers).
--->

<!--
* Learn more about [Element Injectors in Angular](https://blog.angularindepth.com/a-curios-case-of-the-host-decorator-and-element-injectors-in-angular-582562abcf0a).
-->
* 엘리먼트 인젝터에 대해 자세하게 알아보려면 [이 블로그](https://blog.angularindepth.com/a-curios-case-of-the-host-decorator-and-element-injectors-in-angular-582562abcf0a)를 참고하세요.


<!--
## Injector bubbling
-->
## 인젝터 버블링 (Injector bubbling)

<!--
Consider this guide's variation on the Tour of Heroes application.
At the top is the `AppComponent` which has some subcomponents, such as the `HeroesListComponent`.
The `HeroesListComponent` holds and manages multiple instances of the `HeroTaxReturnComponent`.
The following diagram represents the state of this three-level component tree when there are three instances of `HeroTaxReturnComponent` open simultaneously.
-->
이 문서에서 다뤘던 히어로들의 여행 애플리케이션을 자세하게 살펴봅시다.
이 애플리케이션의 최상위 컴포넌트는 `AppComponent`이며, 그 아래로 `HeroesListComponent`와 같은 자식 컴포넌트들이 존재합니다.
그리고 `HeroesListComponent`에는 `HeroTaxReturnComponent`의 인스턴스가 여러개 존재할 수 있습니다.
그래서 `HeroTaxReturnComponent`가 동시에 3개 생성되어 있는 상황이라면 다음과 같이 표현할 수 있습니다.

<figure>
  <img src="generated/images/guide/dependency-injection/component-hierarchy.png" alt="injector tree">
</figure>

<!--
When a component requests a dependency, Angular tries to satisfy that dependency with a provider registered in that component's own injector.
If the component's injector lacks the provider, it passes the request up to its parent component's injector.
If that injector can't satisfy the request, it passes the request along to the next parent injector up the tree.
The requests keep bubbling up until Angular finds an injector that can handle the request or runs out of ancestor injectors.
If it runs out of ancestors, Angular throws an error. 
-->
컴포넌트에 주입해야 하는 의존성이 있으면 Angular는 먼저 그 컴포넌트의 인젝터에 의존성 객체가 등록되었는지 확인합니다.
그리고 컴포넌트 인젝터에 해당 프로바이더가 등록되어 있지 않으면 이 요청은 부모 컴포넌트 인젝터에게 전달됩니다.
이 과정은 컴포넌트 트리를 따라 올라가며 부모 인젝터마다 계속 반복되는데, 의존성 객체를 찾거나 애플리케이션 최상위 인젝터에 도달할 때까지 이 요청이 버블링됩니다.
그리고 나서도 프로바이더를 찾지 못하면 Angular가 에러를 발생시킵니다.

<!--
If you have registered a provider for the same DI token at different levels, the first one Angular encounters is the one it uses to provide the dependency. If, for example, a provider is registered locally in the component that needs a service, Angular doesn't look for another provider of the same service.  
-->
같은 의존성 주입 토큰으로 다른 계층에 등록된 프로바이더가 있다면 Angular가 의존성 객체를 찾다가 처음 만나는 프로바이더를 사용합니다. 그래서 주입해야 하는 서비스의 프로바이더가 컴포넌트에 바로 등록되어 있다면 Angular는 항상 이 인젝터에서 의존성 객체를 가져오며 다른 인젝터는 탐색하지 않습니다.

<div class="alert is-helpful">

<!--
You can cap the bubbling by adding the `@Host()` parameter decorator on the dependant-service parameter
in a component's constructor. 
The hunt for providers stops at the injector for the host element of the component. 
-->
컴포넌트의 생성자 인자 타입에 `@Host()` 데코레이터를 사용하면 상위 계층으로 진행되는 버블링을 제한할 수 있습니다.
이렇게 설정하면 프로바이더를 찾는 과정이 호스트 엘리먼트의 인젝터까지만 동작합니다.

<!--
* See an [example](guide/dependency-injection-in-action#qualify-dependency-lookup) of using `@Host` together with `@Optional`, another parameter decorator that lets you handle the null case if no provider is found.
-->
* `@Host`와 `@Optional`을 함께 쓰는 [예제](guide/dependency-injection-in-action#qualify-dependency-lookup)를 확인해 보세요. 이렇게 사용했을 때 의존성 객체를 찾지 못하면 `null`을 주입합니다.

<!--
* Learn more about the [`@Host` decorator and Element Injectors](https://blog.angularindepth.com/a-curios-case-of-the-host-decorator-and-element-injectors-in-angular-582562abcf0a).
-->
* [`@Host` 데코레이터와 엘리먼트 인젝터](https://blog.angularindepth.com/a-curios-case-of-the-host-decorator-and-element-injectors-in-angular-582562abcf0a)에 대해서도 자세하게 알아보세요.

</div>

<!--
If you only register providers with the root injector at the top level (typically the root `AppModule`), the tree of injectors appears to be flat.
All requests bubble up to the root injector, whether you configured it with the `bootstrapModule` method, or registered all providers with `root` in their own services.
-->
모든 프로바이더를 애플리케이션 최상위 인젝터(`AppModule`의 인젝터)에 등록하면 인젝터 트리는 아주 단순해집니다.
그리고 의존성 객체를 요청하는 버블링은 언제나 최상위 인젝터까지 전달됩니다.
프로바이더를 애플리케이션 최상위 인젝터에 등록하려면 `bootstrapModule` 메소드에 프로바이더를 등록하거나 서비스에 사용하는 `@Injectable()` 데코레이터에서 `providedIn: root`를 지정하면 됩니다.

{@a component-injectors}

<!--
## Component injectors
-->
## 컴포넌트 인젝터

<!--
The ability to configure one or more providers at different levels opens up interesting and useful possibilities.
The guide sample offers some scenarios where you might want to do so.
-->
서비스 프로바이더를 여러 계층에 등록할 수 있다는 것을 활용하면 의존성 주입을 좀 더 다양하게 사용할 수 있습니다.
이번에는 의존성 주입을 활용할 수 있는 방법에 대해 더 알아봅시다.

<!--
### Scenario: service isolation
-->
### 시나리오: 서비스 접근 범위 제한하기

<!--
Architectural reasons may lead you to restrict access to a service to the application domain where it belongs. 
For example, the guide sample includes a `VillainsListComponent` that displays a list of villains.
It gets those villains from a `VillainsService`.
-->
아키텍처상 어떤 서비스는 그 서비스가 속한 도메인에서만 동작해야 한다고 합시다.
이번 섹션에서 살펴볼 `VillainsListComponent`는 빌런들의 목록을 화면에 표시하는데, 이 목록은 `VillainsService`에서 가져오려고 합니다.

<!--
If you provide `VillainsService` in the root `AppModule` (where you registered the `HeroesService`),
that would make the `VillainsService` available everywhere in the application, including the _Hero_ workflows. If you later modified the `VillainsService`, you could break something in a hero component somewhere. Providing the service in the root `AppModule` creates that risk.
-->
그런데 `VillainsService`를 애플리케이션 최상위 모듈인 `AppModule`에 등록하면 애플리케이션 전역에서 `VillainsService`를 사용할 수 있는데, 이 말은 _히어로_ 를 다루는 도메인에서도 이 서비스를 사용할 수 있다는 것을 의미합니다.
그래서 이후에 `VillainsService`를 변경하게 되면 히어로와 관련된 컴포넌트에 영향을 줄 수도 있습니다. 서비스를 `AppModule`에 등록하는 것이 언제나 정답인 것은 아닙니다.

<!--
Instead, you can provide the `VillainsService` in the `providers` metadata of the `VillainsListComponent` like this:
-->
이런 경우에는 `VillainsService`를 `VillainsListComponent`의 `providers` 메타데이터에 다음과 같이 등록하는 것이 나을 수 있습니다:

<code-example path="hierarchical-dependency-injection/src/app/villains-list.component.ts" linenums="false" header="src/app/villains-list.component.ts (metadata)" region="metadata">

</code-example>

<!--
By providing `VillainsService` in the `VillainsListComponent` metadata and nowhere else,
the service becomes available only in the `VillainsListComponent` and its sub-component tree.
It's still a singleton, but it's a singleton that exist solely in the _villain_ domain.
-->
이제는 `VillainsService`가 `VillainsListComponent`에만 등록되었기 때문에, 이 서비스는 `VillainsListComponent`와 그 하위 컴포넌트 트리에서만 사용할 수 있습니다.
그리고 이 서비스는 _빌런_ 과 관련된 도메인에서만 싱글턴으로 존재합니다.

<!--
Now you know that a hero component can't access it. You've reduced your exposure to error.
-->
이제 히어로와 관련된 컴포넌트에서는 이 서비스에 접근할 수 없습니다. 양쪽의 로직이 섞여서 에러가 발생하는 것을 걱정할 필요도 없습니다.

<!--
### Scenario: multiple edit sessions
-->
### 시나리오: 다중 세션

<!--
Many applications allow users to work on several open tasks at the same time.
For example, in a tax preparation application, the preparer could be working on several tax returns,
switching from one to the other throughout the day.
-->
애플리케이션은 보통 동시에 여러 작업을 처리할 수 있는 UX를 제공합니다.
예를 들어 세금 환급 애플리케이션이 있다면 이 애플리케이션은 여러 환급건을 동시에 처리할 수 있어야 사용자가 편할 것입니다.

<!--
This guide demonstrates that scenario with an example in the Tour of Heroes theme.
Imagine an outer `HeroListComponent` that displays a list of super heroes.
-->
이번에는 이 시나리오를 어떻게 처리할 수 있는지 알아봅시다.
먼저, 히어로의 목록을 표시하는 `HeroListComponent`가 있다고 합시다.

<!--
To open a hero's tax return, the preparer clicks on a hero name, which opens a component for editing that return.
Each selected hero tax return opens in its own component and multiple returns can be open at the same time.
-->
이 화면에서 히어로의 이름을 클릭하면 히어로마다 세금을 환급할 수 있는 다른 컴포넌트가 표시될 것입니다.
그리고 이 컴포넌트는 히어로마다 독립적이며 서로 다른 요청을 동시에 처리할 수 있어야 합니다.

<!--
Each tax return component has the following characteristics:
-->
정리하자면 자식 컴포넌트는 다음 조건을 만족해야 합니다.

<!--
* Is its own tax return editing session.
* Can change a tax return without affecting a return in another component.
* Has the ability to save the changes to its tax return or cancel them.
-->
* 컴포넌트마다 폼이 있어야 합니다.
* 컴포넌트에 있는 폼이 다른 컴포넌트의 영향을 받지 않아야 합니다.
* 개별 폼마다 세금을 수정해서 저장하거나 취소할 수 있어야 합니다.

<figure>
  <img src="generated/images/guide/dependency-injection/hid-heroes-anim.gif" alt="Heroes in action">
</figure>

<!--
Suppose that the `HeroTaxReturnComponent` has logic to manage and restore changes.
That would be a pretty easy task for a simple hero tax return.
In the real world, with a rich tax return data model, the change management would be tricky.
You could delegate that management to a helper service, as this example does.
-->
원하는 로직이 모두 `HeroTaxReturnComponent`에 있다고 합시다.
지금 당장은 로직이 복잡하지 않기 때문에 이렇게 처리하는 것이 편할 수 있습니다.
하지만 실제 운영되는 애플리케이션이라면 세금과 관련된 데이터 모델이 복잡할 수 있기 때문에 이 로직을 컴포넌트에서 관리하기 부담스러운 경우가 많습니다.
이런 경우에 로직을 전담해서 처리하는 헬퍼 서비스를 도입하는 것이 나을 수 있습니다.

<!--
Here is the `HeroTaxReturnService`.
It caches a single `HeroTaxReturn`, tracks changes to that return, and can save or restore it.
It also delegates to the application-wide singleton `HeroService`, which it gets by injection.
-->
이 예제에서는 `HeroTaxReturnService`가 이 역할을 합니다.
이 서비스는 `HeroTaxReturn` 객체를 캐싱해뒀다가 이 객체의 값을 새로운 내용으로 변경하거나 컴포넌트의 내용을 원복할 때 사용합니다.
그리고 저장된 값을 반영할 때는 애플리케이션 전역에 있는 `HeroService` 싱글턴 서비스를 사용합니다.

<code-example path="hierarchical-dependency-injection/src/app/hero-tax-return.service.ts" header="src/app/hero-tax-return.service.ts">

</code-example>

<!--
Here is the `HeroTaxReturnComponent` that makes use of it.
-->
이 서비스를 사용하는 `HeroTaxReturnComponent`는 다음과 같이 작성합니다.


<code-example path="hierarchical-dependency-injection/src/app/hero-tax-return.component.ts" header="src/app/hero-tax-return.component.ts">

</code-example>


<!--
The _tax-return-to-edit_ arrives via the input property which is implemented with getters and setters.
The setter initializes the component's own instance of the `HeroTaxReturnService` with the incoming return.
The getter always returns what that service says is the current state of the hero.
The component also asks the service to save and restore this tax return.
-->
컴포넌트에 입력되는 `HeroTaxReturn` 객체를 서비스에 저장하기 위해 게터와 세터 함수를 사용했습니다.
세터 함수는 컴포넌트와 연결된 `HeroTaxReturnService`에 값을 저장합니다.
그리고 게터 함수는 서비스에 있는 값을 가져와서 반환합니다.
`HeroTaxReturn` 객체를 저장하거나 원복할 때도 서비스 인스턴스를 사용합니다.

<!--
This won't work if the service is an application-wide singleton.
Every component would share the same service instance, and each component would overwrite the tax return that belonged to another hero.
-->
만약 서비스가 애플리케이션 전역에 싱글턴으로 존재한다면 이 로직은 동작하지 않을 것입니다.
왜냐하면 이런 경우에는 모든 컴포넌트가 같은 서비스 인스턴스를 공유하면서 한 컴포넌트에서 작업한 내용을 다른 컴포넌트가 덮어쓸 수 있기 때문입니다.

<!--
To prevent this, we configure the component-level injector of `HeroTaxReturnComponent` to provide the service, using the  `providers` property in the component metadata.
-->
이 에러를 방지하려면 컴포넌트 메타데이터의 `providers` 프로퍼티를 사용해서 `HeroTaxReturnComponent` 컴포넌트 계층의 인젝터에 서비스 프로바이더를 등록해야 합니다.

<code-example path="hierarchical-dependency-injection/src/app/hero-tax-return.component.ts" linenums="false" header="src/app/hero-tax-return.component.ts (providers)" region="providers">

</code-example>

<!--
The `HeroTaxReturnComponent` has its own provider of the `HeroTaxReturnService`.
Recall that every component _instance_ has its own injector.
Providing the service at the component level ensures that _every_ instance of the component gets its own, private instance of the service, and no tax return gets overwritten.
-->
`HeroTaxReturnComponent`에는 `HeroTaxReturnService`의 프로바이더가 등록되어 있습니다.
그리고 모든 컴포넌트 _인스턴스_ 마다 독자적인 인젝터가 존재한다는 것을 떠올려 봅시다.
서비스 프로바이더를 컴포넌트 계층에 등록하면 _모든_ 컴포넌트 인스턴스마다 독립적인 서비스 인스턴스가 생성됩니다.
다른 컴포넌트와 섞일 일도 없습니다.

<div class="alert is-helpful">


<!--
The rest of the scenario code relies on other Angular features and techniques that you can learn about elsewhere in the documentation.
You can review it and download it from the <live-example></live-example>.
-->
다음 시나리오는 Angular 가이드의 다른 문서에서도 소개했던 내용입니다.
이 예제는 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

</div>


<!--
### Scenario: specialized providers
-->
### 시나리오: 프로바이더 대체하기

<!--
Another reason to re-provide a service at another level is to substitute a _more specialized_ implementation of that service, deeper in the component tree.
-->
컴포넌트 트리를 따라 깊이 내려간 경우에, 어떤 서비스의 로직을 좀 더 확장해야 하는 경우에도 서비스 프로바이더를 다른 계층에 다시 등록하는 방법을 사용할 수 있습니다.

<!--
Consider a Car component that depends on several services.
Suppose you configured the root injector (marked as A) with _generic_ providers for
`CarService`, `EngineService` and `TiresService`.
-->
자동차 컴포넌트에서 사용하는 서비스가 몇 개 있다고 합시다.
그리고 이 컴포넌트의 인젝터에는 `CarService`, `EngineService`, `TiresService`의 프로바이더가 등록되어 있습니다.

<!--
You create a car component (A) that displays a car constructed from these three generic services.
-->
자동차 컴포넌트(A)에서는 이렇게 등록된 서비스를 사용해서 자동차를 만듭니다.

<!--
Then you create a child component (B) that defines its own, _specialized_ providers for `CarService` and `EngineService`
that have special capabilities suitable for whatever is going on in component (B).
-->
그런데 자식 컴포넌트인 B에서는 `CarService`와 `EngineService`를 컴포넌트 B에 맞게 사용하기 위해 _또 다른_ 서비스 프로바이더를 등록하고 있습니다.

<!--
Component (B) is the parent of another component (C) that defines its own, even _more specialized_ provider for `CarService`.
-->
그리고 컴포넌트 B는 또 다른 컴포넌트 C를 자식으로 갖고 있으며, 컴포넌트 C는 또 다른 `CarService` 프로바이더를 등록해서 사용합니다.


<figure>
  <!--
  <img src="generated/images/guide/dependency-injection/car-components.png" alt="car components">
  -->
  <img src="generated/images/guide/dependency-injection/car-components.png" alt="자동차 컴포넌트">
</figure>

<!--
Behind the scenes, each component sets up its own injector with zero, one, or more providers defined for that component itself.
-->
이 예제처럼 컴포넌트에는 서비스 프로바이더를 자유롭게 등록해서 사용할 수 있습니다.

<!--
When you resolve an instance of `Car` at the deepest component (C),
its injector produces an instance of `Car` resolved by injector (C) with an `Engine` resolved by injector (B) and
`Tires` resolved by the root injector (A).
-->
이제 컴포넌트 C를 사용해서 인스턴스를 만들게 되면, 인젝터 C에 등록된 `CarService3`과 인젝터 B에 등록된 `EngineService2`, 인젝터 A에 등록된 `TiresService`를 사용해서 컴포넌트 인스턴스를 생성합니다.


<figure>
  <!--
  <img src="generated/images/guide/dependency-injection/injector-tree.png" alt="car injector tree">
  -->
  <img src="generated/images/guide/dependency-injection/injector-tree.png" alt="자동차 인젝터 트리">
</figure>



<div class="alert is-helpful">


<!--
The code for this _cars_ scenario is in the `car.components.ts` and `car.services.ts` files of the sample
which you can review and download from the <live-example></live-example>.
-->
이 시나리오에서 설명한 코드는 <live-example></live-example>에서 받은 코드의 `car.components.ts` 파일과 `car.services.ts` 파일에 구현되어 있습니다.

</div>
