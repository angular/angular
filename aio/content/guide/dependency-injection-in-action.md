<!--
# Dependency Injection
-->
# 의존성 주입

<!--
Dependency Injection is a powerful pattern for managing code dependencies.
This cookbook explores many of the features of Dependency Injection (DI) in Angular.
-->
의존성 주입은 코드의 의존성을 관리할 때 아주 유용하게 사용할 수 있는 패턴입니다.
이 문서에서는 Angular에서 활용할 수 있는 여러가지 의존성 주입 패턴을 안내합니다.

{@a toc}

<!--
See the <live-example name="dependency-injection-in-action"></live-example>
of the code in this cookbook.
-->
이 문서에서 다루는 예제는 <live-example name="dependency-injection-in-action"></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

{@a app-wide-dependencies}

<!--
## Application-wide dependencies
-->
## 애플리케이션 전역에 사용되는 의존성

<!--
Register providers for dependencies used throughout the application 
in the `@Injectable()` decorator of the service itself. 
-->
서비스 클래스에 `@Injectable()` 데코레이터를 사용하면 이 서비스를 애플리케이션 전역에 사용되는 의존성으로 등록할 수 있습니다.

<code-example path="dependency-injection/src/app/heroes/hero.service.3.ts" title="src/app/heroes/hero.service.3.ts" linenums="false">
</code-example>

<!--
`providedIn` here tells Angular that the root injector is responsible for creating an instance of the `HeroService`.
Services that are provided this way are automatically made available to the entire 
application and don't need to be listed in any module.
-->
이 코드에 사용된 `providedIn`은 `HeroService`의 인스턴스가 애플리케이션 최상위 인젝터에서 관리된다는 것을 의미합니다.
그리고 이렇게 등록된 서비스는 다른 모듈에 다시 등록되지 않아도 애플리케이션 전역에 사용할 수 있습니다.

<!--
Service classes can act as their own providers which is why defining them in the `@Injectable` decorator
is all the registration you need.
-->
`@Injectable` 데코레이터를 사용하면 서비스 클래스는 그 자체로 서비스 프로바이더의 역할을 합니다.
서비스를 인젝터에 등록하려면 이 데코레이터를 지정하기만 하면 됩니다.

<div class="alert is-helpful">


<!--
A *provider* is something that can create or deliver a service.
Angular creates a service instance from a class provider by using `new`.
Read more about providers in the [Dependency Injection](guide/dependency-injection#register-providers-ngmodule)
guide.
-->
*프로바이더* 는 서비스와 같은 객체를 전달하는 무언가를 의미합니다.
그리고 내부적으로도 Angular는 `new` 키워드를 사용해서 클래스 인스턴스를 만들듯이 서비스의 인스턴스를 생성합니다.
프로바이더에 대해서는 [의존성 주입](guide/dependency-injection#register-providers-ngmodule) 문서를 참고하세요.

</div>

<!--
Now that you've registered these services,
Angular can inject them into the constructor of *any* component or service, *anywhere* in the application.
-->
이제 인젝터에 서비스 프로바이더를 등록했기 때문에 Angular는 애플리케이션에 있는 *모든* 컴포넌트나 서비스 생성자를 통해 의존성을 주입할 수 있습니다.

{@a external-module-configuration}

<!--
## External module configuration
-->
## 모듈에 설정하는 경우

<!--
If a provider cannot be configured in the `@Injectable` decorator of the service, then register application-wide providers in the root `AppModule`, not in the `AppComponent`. Generally, register providers in the `NgModule` rather than in the root application component.
-->
애플리케이션 전역에 사용되는 서비스에 `@Injectable` 데코레이터를 사용할 수 없다면, 최상위 `AppModule`에 이 설정을 대신할 수 있습니다. 이 때 주의할 것은 `AppComponent`가 아니라 `AppModule`이라는 것입니다. 일반적으로 서비스 프로바이더는 최상위 컴포넌트가 아니라 최상위 `NgModule`에 등록합니다.

<!--
Do this when users should explicitly opt-in to use a service, or the service should be 
provided in a lazily-loaded context, 
or when you are configuring another application global service _before the application starts_.
-->
이 방법은 서비스를 사용하기 위해 사용자에게 승인을 받아야 하거나, 지연로딩되는 모듈에 서비스가 등록되는 경우, _애플리케이션이 시작되기 전에_ 전역 서비스 설정을 따로 해야하는 경우에 사용합니다.

<!--
Here is an example of the case where the component router configuration includes a non-default
[location strategy](guide/router#location-strategy) by listing its provider
in the `providers` list of the `AppModule`.
-->
다음 코드는 `AppModule`의 `providers`에서 컴포넌트 라우팅에 사용하는 [로케이션 정책](guide/router#location-strategy)을 변경하는 코드입니다.

<code-example path="dependency-injection-in-action/src/app/app.module.ts" region="providers" title="src/app/app.module.ts (providers)" linenums="false">

</code-example>



{@a injectable}


{@a nested-dependencies}


<!--
## _@Injectable()_ and nested service dependencies
-->
## _@Injectable()_ 과 중첩 의존성

<!--
The consumer of an injected service does not know how to create that service.
It shouldn't care.
It's the dependency injection's job to create and cache that service.
-->
의존성으로 주입되는 서비스를 활용하는 쪽에서는 이 서비스가 어떻게 만들어지는지 신경쓰지 않습니다.
신경쓸 필요도 없습니다.
이 서비스의 인스턴스는 의존성 주입 시스템이 생성하고 필요한 곳에 전달하기만 하면 됩니다.

<!--
Sometimes a service depends on other services, which may depend on yet other services.
Resolving these nested dependencies in the correct order is also the framework's job.
At each step, the consumer of dependencies simply declares what it requires in its
constructor and the framework takes over.
-->
어떤 경우에는 서비스가 다른 서비스를 의존성으로 참조하는 경우가 있을 수 있습니다.
하지만 이렇게 의존성이 중첩된 경우에도 의존성이 연결된 순서에 맞게 인스턴스를 생성하는 것은 프레임워크가 해야할 역할입니다.
의존성 객체를 사용하는 쪽에서는 생성자에 어떤 타입의 의존성 객체가 필요한지 선언하기만 하면 프레임워크가 모두 처리할 것입니다.

<!--
The following example shows injecting both the `LoggerService` and the `UserContext` in the `AppComponent`.
-->
다음 코드는 `AppComponent`에 `LoggerService`와 `UserContextService`를 동시에 의존성으로 주입하는 예제 코드입니다.

<code-example path="dependency-injection-in-action/src/app/app.component.ts" region="ctor" title="src/app/app.component.ts" linenums="false">

</code-example>


<!--
The `UserContext` in turn has its own dependencies on both the `LoggerService` and
a `UserService` that gathers information about a particular user.
-->
그리고 `UserContextService`에서 `LoggerService`와 `UserService`를 주입받는다고 합시다.

<code-example path="dependency-injection-in-action/src/app/user-context.service.ts" region="injectables" title="user-context.service.ts (injection)" linenums="false">

</code-example>


<!--
When Angular creates the `AppComponent`, the dependency injection framework creates an instance of the `LoggerService` and
starts to create the `UserContextService`.
The `UserContextService` needs the `LoggerService`, which the framework already has, and the `UserService`, which it has yet to create.
The `UserService` has no dependencies so the dependency injection framework can just
use `new` to instantiate one.
-->
이제 Angular가 `AppComponent`를 생성할 때 의존성 주입 프레임워크가 `LoggerService`의 인스턴스를 생성하며, 그 이후에 `UserContextService` 인스턴스를 생성합니다.
이 때 `UserContextService`에서는 `LoggerService`를 의존성으로 요청하는데, 이 서비스의 인스턴스는 프레임워크가 이미 만들었기 때문에 있던 것을 그대로 활용할 수 있으며, `UserService`는 아직 생성하지 않았기 때문에 이 서비스의 인스턴스를 찾습니다.
그리고 `UserService`는 따로 의존성이 없기 때문에 의존성 주입 프레임워크가 `new` 키워드를 사용해서 새로운 인스턴스를 생성합니다.

<!--
The beauty of dependency injection is that `AppComponent` doesn't care about any of this.
You simply declare what is needed in the constructor (`LoggerService` and `UserContextService`)
and the framework does the rest.
-->
이 과정에서 `AppComponent`는 서비스의 인스턴스가 어떻게 생성되는지 신경쓸 필요가 전혀 없습니다.
단순하게 생성자에서 `LoggerService`와 `UserContextService`가 필요하다고 선언만 하면 프레임워크가 모든 것을 처리합니다.

<!--
Once all the dependencies are in place, the `AppComponent` displays the user information:
-->
의존성 객체가 모두 준비되면 `AppComponent`는 다음과 같이 표시될 것입니다.


<figure>
  <img src="generated/images/guide/dependency-injection-in-action/logged-in-user.png" alt="Logged In User">
</figure>



{@a injectable-1}


### *@Injectable()*

<!--
Notice the `@Injectable()`decorator on the `UserContextService` class.
-->
`UserContextService` 클래스에 사용된 `@Injectable()` 데코레이터를 다시 한 번 봅시다.

<code-example path="dependency-injection-in-action/src/app/user-context.service.ts" region="injectable" title="user-context.service.ts (@Injectable)" linenums="false">

</code-example>

<!--
The `@Injectable` decorator indicates that the Angular DI system is used to create one or more instances of `UserContextService`.
-->
`UserContextService`에 `@Injectable` 데코레이터를 사용하면 이 서비스의 인스턴스가 Angular 의존성 주입 시스템에 의해 생성된다는 것을 지정할 수 있습니다.

{@a service-scope}


<!--
## Limit service scope to a component subtree
-->
## 서비스가 주입되는 범위를 특정 컴포넌트로 제한하기

<!--
All injected service dependencies are singletons meaning that,
for a given dependency injector, there is only one instance of service.
-->
모든 서비스 인스턴스는 인젝터마다 하나씩만 존재하는 싱글턴입니다.

<!--
But an Angular application has multiple dependency injectors, arranged in a tree hierarchy that parallels the component tree.
So a particular service can be *provided* and created at any component level and multiple times
if provided in multiple components.
-->
하지만 Angular 애플리케이션에는 인젝터가 여러개 존재할 수 있으며, 컴포넌트 트리의 모양에 따라서 계층을 이루거나 병렬로 존재할 수도 있습니다.
그래서 서비스 프로바이더는 특정 컴포넌트에 등록할 수도 있으며, 이 때 이 컴포넌트의 인스턴스가 여러개라면 서비스의 인스턴스도 여러개 생성됩니다.

<!--
By default, a service dependency provided in one component is visible to all of its child components and
Angular injects the same service instance into all child components that ask for that service.
-->
기본적으로 컴포넌트에 등록된 서비스는 해당 컴포넌트의 자식 컴포넌트에서도 모두 접근할 수 있으며, 이 때 모두 같은 인스턴스를 공유합니다.

<!--
Accordingly, dependencies provided in the root `AppComponent` can be injected into *any* component *anywhere* in the application.
-->
그래서 `AppComponent`에 등록된 서비스 프로바이더도 애플리케이션 *전역*에 *어떠한* 컴포넌트에도 의존성으로 주입될 수 있습니다.

<!--
That isn't always desirable.
Sometimes you want to restrict service availability to a particular region of the application.
-->
어떤 경우에는 이 방식을 다르게 사용하고 싶을 수도 있습니다.
어떤 서비스는 애플리케이션의 특정 범위 안에서만 사용할 수 있도록 제한하고 싶을 수도 있습니다.

<!--
You can limit the scope of an injected service to a *branch* of the application hierarchy
by providing that service *at the sub-root component for that branch*.
This example shows how similar providing a service to a sub-root component is
to providing a service in the root `AppComponent`. The syntax is the same.
Here, the `HeroService` is available to the `HeroesBaseComponent` because it is in the `providers` array:
-->
서비스가 주입되는 범위는 특정 컴포넌트 트리로 제한할 수 있으며, 결과적으로 애플리케이션의 특정 계층으로 제한할 수 있다는 것을 의미합니다.
다음 예제는 최상위 컴포넌트 `AppComponent`가 아닌 컴포넌트에 특정 서비스 프로바이더를 등록하는 예제 코드입니다. 문법은 기존에 사용하던 방식과 같습니다.
이 코드에서 `HeroService`는 `HeroesBaseComponent`의 `providers`에 등록되었기 때문에 이 컴포넌트 범위에서만 사용할 수 있습니다.

<code-example path="dependency-injection-in-action/src/app/sorted-heroes.component.ts" region="injection" title="src/app/sorted-heroes.component.ts (HeroesBaseComponent excerpt)">

</code-example>


<!--
When Angular creates the `HeroesBaseComponent`, it also creates a new instance of `HeroService`
that is visible only to the component and its children, if any.
-->
이제 Angular가 `HeroesBaseComponent`의 인스턴스를 생성하면 `HeroService`의 인스턴스도 함께 생성하며, 이 서비스의 인스턴스는 `HeroesBaseComponent` 아래 계층에서 공유됩니다.

<!--
You could also provide the `HeroService` to a *different* component elsewhere in the application.
That would result in a *different* instance of the service, living in a *different* injector.
-->
`HeroService`는 물론 *다른* 컴포넌트에 등록해서 사용할 수도 있습니다.
이 경우에는 *다른* 인젝터가 인스턴스를 생성하기 때문에 이전과는 *다른* 인스턴스가 사용됩니다.

<div class="alert is-helpful">


<!--
Examples of such scoped `HeroService` singletons appear throughout the accompanying sample code,
including the `HeroBiosComponent`, `HeroOfTheMonthComponent`, and `HeroesBaseComponent`.
Each of these components has its own `HeroService` instance managing its own independent collection of heroes.
-->
예제 코드에서 `HeroService`는 사용범위가 제한되어 있으며, 이 서비스는 `HeroBiosComponent`, `HeroOfTheMonthComponent`, `HeroesBaseComponent`에서만 사용할 수 있습니다.
그리고 각각의 컴포넌트는 독립적인 `HeroService` 인스턴스를 관리합니다.

</div>




<div class="alert is-helpful">


<!--
### Take a break!
-->
### 잠시 쉬어가세요!

<!--
This much Dependency Injection knowledge may be all that many Angular developers
ever need to build their applications. It doesn't always have to be more complicated.
-->
Angular 애플리케이션을 개발하면서 알아야 하는 의존성 주입에 대한 내용은 이정도면 충분합니다. 의존성 주입을 좀 더 활용할 수 있는 내용을 알아보기 전에 잠시 쉬어가세요.

</div>

{@a multiple-service-instances}

<!--
## Multiple service instances (sandboxing)
-->
## 다중 서비스 인스턴스 (샌드박싱, sandboxing)

<!--
Sometimes you want multiple instances of a service at *the same level of the component hierarchy*.
-->
어떤 경우에는 *같은 계층에 있는 컴포넌트라면* 서로 다른 서비스 인스턴스를 사용해야 할 때가 있습니다.

<!--
A good example is a service that holds state for its companion component instance.
You need a separate instance of the service for each component.
Each service has its own work-state, isolated from the service-and-state of a different component.
This is called *sandboxing* because each service and component instance has its own sandbox to play in.
-->
컴포넌트의 상태를 서비스가 관리하는 경우가 이런 경우에 해당되며, 컴포넌트의 상태를 관리하려면 컴포넌트마다 독립된 서비스 인스턴스가 있어야 합니다.
그러면 각 서비스 인스턴스는 해당 인스턴스에 연결된 컴포넌트에 대해서만 동작하며, 다른 컴포넌트의 영향을 배제할 수 있습니다.
결국 컴포넌트와 서비스는 서로 연결된 인스턴스끼리 상호작용하며, 이런 관계를 *샌드박싱(sandboxing)*이라고 합니다.


{@a hero-bios-component}
<!--
Imagine a `HeroBiosComponent` that presents three instances of the `HeroBioComponent`.
-->
`HeroBioComponent` 인스턴스 3개로 구성된 `HeroBiosComponent`가 있다고 합시다.

<code-example path="dependency-injection-in-action/src/app/hero-bios.component.ts" region="simple" title="ap/hero-bios.component.ts">

</code-example>


<!--
Each `HeroBioComponent` can edit a single hero's biography.
A `HeroBioComponent` relies on a `HeroCacheService` to fetch, cache, and perform other persistence operations on that hero.
-->
개별 `HeroBioComponent`에서는 히어로 한 명의 신상정보를 수정할 수 있습니다.
그리고 이 때 히어로에 대한 정보를 가져오고, 캐싱하는 등의 작업은 `HeroCacheService`를 사용합니다.

<code-example path="dependency-injection-in-action/src/app/hero-cache.service.ts" region="service" title="src/app/hero-cache.service.ts">

</code-example>


<!--
Clearly the three instances of the `HeroBioComponent` can't share the same `HeroCacheService`.
They'd be competing with each other to determine which hero to cache.
-->
그러면 각각의 `HeroBioComponent`는 서로 다른 `HeroCacheService` 인스턴스를 사용합니다.
캐싱하는 정보도 서로 다를 것입니다.

<!--
Each `HeroBioComponent` gets its *own* `HeroCacheService` instance
by listing the `HeroCacheService` in its metadata `providers` array.
-->
`HeroBioComponent`마다 서로 다른 `HeroCacheService` 인스턴스를 사용하려면 컴포넌트 `providers` 배열에 `HeroCacheService`를 등록해야 합니다.

<code-example path="dependency-injection-in-action/src/app/hero-bio.component.ts" region="component" title="src/app/hero-bio.component.ts">

</code-example>


<!--
The parent `HeroBiosComponent` binds a value to the `heroId`.
The `ngOnInit` passes that `id` to the service, which fetches and caches the hero.
The getter for the `hero` property pulls the cached hero from the service.
And the template displays this data-bound property.
-->
부모 컴포넌트인 `HeroBiosComponent`와는 `heroId`로 연결됩니다.
그리고 `HeroBioComponent`의 `ngOnInit`에서 서비스로 이 `id`를 보내서 히어로의 정보를 가져와서 캐싱합니다.
`hero` 프로퍼티에 연결된 게터 함수는 서비스에서 가져온 히어로의 정보를 반환하며, 이 게터 함수는 템플릿과 데이터 바인딩되어 표시됩니다.

<!--
Find this example in <live-example name="dependency-injection-in-action">live code</live-example>
and confirm that the three `HeroBioComponent` instances have their own cached hero data.
-->
`HeroBioComponent`가 히어로 정보를 캐싱하는 예제는 <live-example name="dependency-injection-in-action">live code</live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

<figure>
  <img src="generated/images/guide/dependency-injection-in-action/hero-bios.png" alt="Bios">
</figure>



{@a optional}


{@a qualify-dependency-lookup}


<!--
## Qualify dependency lookup with _@Optional()_ and `@Host()`
-->
## _@Optional()_ 과 `Host()`

<!--
As you now know, dependencies can be registered at any level in the component hierarchy.
-->
이미 알고 있듯이, 프로바이더는 컴포넌트 계층 어디에라도 자유롭게 등록할 수 있습니다.

<!--
When a component requests a dependency, Angular starts with that component's injector and walks up the injector tree
until it finds the first suitable provider.  Angular throws an error if it can't find the dependency during that walk.
-->
컴포넌트에서 의존성 객체를 요구하면 Angular는 해당 컴포넌트의 인젝터부터 상위 인젝터로 올라가면서 의존성 객체에 해당하는 프로바이더를 찾습니다. 그리고 이 과정이 실패하면 에러를 발생시킵니다.

<!--
You *want* this behavior most of the time.
But sometimes you need to limit the search and/or accommodate a missing dependency.
You can modify Angular's search behavior with the `@Host` and `@Optional` qualifying decorators,
used individually or together.
-->
이 과정은 Angular 애플리케이션을 개발하면서 가장 많이 사용하게 될 것입니다.
하지만 때로는 의존성 객체를 찾는 과정을 제어해야 하는 경우가 있습니다.
`@Host`와 `@Optional` 데코레이터는 이 때 사용됩니다. 두 데코레이터는 따로 사용할 수도 있고 함께 사용할 수도 있습니다.

<!--
The `@Optional` decorator tells Angular to continue when it can't find the dependency.
Angular sets the injection parameter to `null` instead.
-->
`@Optional` 데코레이터를 사용하면 Angular가 프로바이더를 찾지 못하더라도 에러를 발생시키지 않습니다.  이 경우에는 의존성 객체 대신 `null` 객체를 주입합니다.

<!--
The `@Host` decorator stops the upward search at the *host component*.
-->
그리고 `@Host` 데코레이터는 *호스트 컴포넌트* 위쪽으로 수행할 의존성 탐색을 중단시킵니다.

<!--
The host component is typically the component requesting the dependency.
But when this component is projected into a *parent* component, that parent component becomes the host.
The next example covers this second case.
-->
호스트 컴포넌트는 보통 의존성 객체를 요구한 컴포넌트입니다.
하지만 컴포넌트가 *부모* 컴포넌트에 표시되기 시작하면, 부모 컴포넌트가 호스트가 됩니다.
예제와 함께 자세하게 알아봅시다.

{@a demonstration}

<!--
### Demonstration
-->
### 데모

<!--
The `HeroBiosAndContactsComponent` is a revision of the `HeroBiosComponent` that you looked at [above](guide/dependency-injection-in-action#hero-bios-component).
-->
`HeroBiosAndContactsComponent`는 [위](guide/dependency-injection-in-action#hero-bios-component)에서 다룬 `HeroBiosComponent`를 조금 수정한 컴포넌트입니다.

<code-example path="dependency-injection-in-action/src/app/hero-bios.component.ts" region="hero-bios-and-contacts" title="src/app/hero-bios.component.ts (HeroBiosAndContactsComponent)">

</code-example>


<!--
Focus on the template:
-->
템플릿을 자세히 봅시다:

<code-example path="dependency-injection-in-action/src/app/hero-bios.component.ts" region="template" title="dependency-injection-in-action/src/app/hero-bios.component.ts" linenums="false">

</code-example>


<!--
Now there is a new `<hero-contact>` element between the `<hero-bio>` tags.
Angular *projects*, or *transcludes*, the corresponding `HeroContactComponent` into the `HeroBioComponent` view,
placing it in the `<ng-content>` slot of the `HeroBioComponent` template:
-->
템플릿을 보면 `<hero-bio>` 태그 안에 `<hero-contact>` 엘리먼트가 추가되었습니다.
그러면 Angular는 `HeroBioComponent` 템플릿에 정의된 `<ng-content>`에 `HeroContactComponent`를 표시하는데, 이것을 *프로젝션(projects)*이라고 하거나 *트랜스클루전(transcludes)*한다고 합니다.

<code-example path="dependency-injection-in-action/src/app/hero-bio.component.ts" region="template" title="src/app/hero-bio.component.ts (template)" linenums="false">

</code-example>


<!--
It looks like this, with the hero's telephone number from `HeroContactComponent` projected above the hero description:
-->
그래서 이 템플릿은 다음과 같이 표시됩니다:

<figure>
  <img src="generated/images/guide/dependency-injection-in-action/hero-bio-and-content.png" alt="bio and contact">
</figure>


<!--
Here's the `HeroContactComponent` which demonstrates the qualifying decorators:
-->
그리고 데코레이터는 `HeroContactComponent`에 이렇게 사용되었습니다:

<code-example path="dependency-injection-in-action/src/app/hero-contact.component.ts" region="component" title="src/app/hero-contact.component.ts">

</code-example>


<!--
Focus on the constructor parameters:
-->
생성자에 사용된 인자를 자세히 봅시다:

<code-example path="dependency-injection-in-action/src/app/hero-contact.component.ts" region="ctor-params" title="src/app/hero-contact.component.ts" linenums="false">

</code-example>


<!--
The `@Host()` function decorating the  `heroCache` property ensures that
you get a reference to the cache service from the parent `HeroBioComponent`.
Angular throws an error if the parent lacks that service, even if a component higher
in the component tree happens to have it.
-->
`@Host()` 함수는 `heroCache` 프로퍼티에 주입되는 서비스의 인스턴스를 찾을 때 사용하는 인젝터의 범위를 `HeroBioComponent`까지로 제한합니다.
그리고 호스트 컴포넌트에서 서비스를 찾지 못하면 에러를 발생시킵니다.
호스트 컴포넌트 위쪽에 서비스 인스턴스가 존재하더라도 이 인스턴스는 사용하지 않습니다.

<!--
A second `@Host()` function decorates the `loggerService` property.
The only `LoggerService` instance in the app is provided at the `AppComponent` level.
The host `HeroBioComponent` doesn't have its own `LoggerService` provider.
-->
두 번째 `@Host()` 함수는 `loggerService` 프로퍼티에 사용되었습니다.
이 예제에서 `LoggerService`는 `AppComponent`에만 등록되어 있으며, `HeroBioComponent`에는 `LoggerService` 프로바이더가 등록되어 있지 않습니다.

<!--
Angular would throw an error if you hadn't also decorated the property with the `@Optional()` function.
Thanks to `@Optional()`, Angular sets the `loggerService` to null and the rest of the component adapts.
-->
그러면 Angular가 의존성을 찾을 수 없기 때문에 에러를 발생시키지만, `@Optional()` 함수를 사용하면 에러가 발생하지 않습니다.
`@Optional()` 데코레이터를 사용하면 Angular가 `LoggerService`를 찾지 못하더라도 에러를 발생시키지 않으며, `loggerService`에 `null` 값을 주입합니다.

<!--
Here's the `HeroBiosAndContactsComponent` in action.
-->
그래서 `HeroBiosAndContactsComponent`는 다음과 같이 동작합니다.

<figure>
  <img src="generated/images/guide/dependency-injection-in-action/hero-bios-and-contacts.png" alt="Bios with contact into">
</figure>


<!--
If you comment out the `@Host()` decorator, Angular now walks up the injector ancestor tree
until it finds the logger at the `AppComponent` level. The logger logic kicks in and the hero display updates
with the gratuitous "!!!", indicating that the logger was found.
-->
`@Host()` 데코레이터를 사용하지 않으면 Angular는 의존성 객체를 찾기 위해 `AppComponent` 계층까지 인젝터를 따라 올라갑니다. 그리고 최종적으로 서비스 인스턴스를 찾을 수 있기 때문에  템플릿에 "!!!"를 표시합니다.

<figure>
  <img src="generated/images/guide/dependency-injection-in-action/hero-bio-contact-no-host.png" alt="Without @Host">
</figure>


<!--
On the other hand, if you restore the `@Host()` decorator and comment out `@Optional`,
the application fails for lack of the required logger at the host component level.
-->
하지만 `@Host()` 데코레이터를 `@Optional` 데코레이터 없이 사용하면 호스트 컴포넌트 계층에서 서비스 인스턴스를 찾지 못하기 때문에 다음과 같은 에러가 발생합니다.
<br>
`EXCEPTION: No provider for LoggerService! (HeroContactComponent -> LoggerService)`


{@a component-element}

<!--
## Inject the component's DOM element
-->
## 컴포넌트 DOM 엘리먼트 주입하기

<!--
On occasion you might need to access a component's corresponding DOM element.
Although developers strive to avoid it, many visual effects and 3rd party tools, such as jQuery,
require DOM access.
-->
때로는 컴포넌트의 DOM 엘리먼트에 접근해야 하는 경우가 있습니다. 개발자들이 원하는 것은 아니지만, 시각 효과를 주거나 jQuery와 같은 서드파티 라이브러리를 사용해야만 하는 때가 있다면 DOM에 접근해야 합니다.

<!--
To illustrate, here's a simplified version of the `HighlightDirective` from
the [Attribute Directives](guide/attribute-directives) page.
-->
이 내용은 [어트리뷰트 디렉티브](guide/attribute-directives) 문서에서 다뤘던 `HighlightDirective` 예제를 변형한 예제와 함께 알아봅시다.

<code-example path="dependency-injection-in-action/src/app/highlight.directive.ts" title="src/app/highlight.directive.ts">

</code-example>


<!--
The directive sets the background to a highlight color when the user mouses over the
DOM element to which it is applied.
-->
이 코드에 정의된 디렉티브는 사용자가 DOM 엘리먼트 위에 마우스를 옮겼을 때 배경에 하이라이트 색상을 표시합니다.

<!--
Angular sets the constructor's `el` parameter to the injected `ElementRef`, which is
a wrapper around that DOM element.
Its `nativeElement` property exposes the DOM element for the directive to manipulate.
-->
그리고 이 디렉티브의 생성자에는 `ElementRef`가 주입되어 `el` 프로퍼티에 할당되는데, 이것은 DOM 엘리먼트를 랩핑한 객체입니다.
이 객체의 `nativeElement` 프로퍼티를 사용하면 디렉티브에서 DOM 엘리먼트를 조작할 수 있습니다.

<!--
The sample code applies the directive's `myHighlight` attribute to two `<div>` tags,
first without a value (yielding the default color) and then with an assigned color value.
-->
아래 예제 코드에서는 `myHighlight`가 지정된 두 개의 `<div>` 태그에 디렉티브가 적용되었습니다. 이 중 첫번째에는 색상을 따로 지정하지 않았기 때문에 기본 색상이 사용되며, 두 번째는 지정된 색상이 사용됩니다.

<code-example path="dependency-injection-in-action/src/app/app.component.html" region="highlight" title="src/app/app.component.html (highlight)" linenums="false">

</code-example>


<!--
The following image shows the effect of mousing over the `<hero-bios-and-contacts>` tag.
-->
이제 `<hero-bios-and-contacts>` 위로 마우스가 이동하면 다음 그림과 같이 표시됩니다.

<figure>
  <img src="generated/images/guide/dependency-injection-in-action/highlight.png" alt="Highlighted bios">
</figure>

{@a providers}

<!--
## Define dependencies with providers
-->
## 프로바이더로 의존성 정의하기

<!--
This section demonstrates how to write providers that deliver dependent services.
-->
이번 섹션에서는 의존성으로 주입될 서비스를 프로바이더로 어떻게 등록하는지 알아봅시다.

<!--
Get a service from a dependency injector by giving it a ***token***.
-->
의존성 객체는 ***토큰***으로 참조합니다.

<!--
You usually let Angular handle this transaction by specifying a constructor parameter and its type.
The parameter type serves as the injector lookup *token*.
Angular passes this token to the injector and assigns the result to the parameter.
Here's a typical example:
-->
좀 더 자세하게 이야기하면, 의존성으로 받을 객체는 생성자 인자에 타입을 지정하면 의존성 객체를 주입받을 수 있습니다.
이 때 생성자에 지정하는 타입이 인젝터가 참조하는 *토큰* 입니다.
Angular는 이 토큰에 해당하는 의존성 객체를 인젝터에서 찾아 반환합니다.
예제와 함께 알아봅시다:

<!--
<code-example path="dependency-injection-in-action/src/app/hero-bios.component.ts" region="ctor" title="src/app/hero-bios.component.ts (component constructor injection)" linenums="false">
-->
<code-example path="dependency-injection-in-action/src/app/hero-bios.component.ts" region="ctor" title="src/app/hero-bios.component.ts (컴포넌트 생성자로 의존성 주입하기)" linenums="false">

</code-example>


<!--
Angular asks the injector for the service associated with the `LoggerService`
and assigns the returned value to the `logger` parameter.
-->
Angular는 인젝터에게 `LoggerService`가 등록되어 있는지 확인하고, 프로바이더를 찾으면 인스턴스를 반환해서 `logger` 프로퍼티에 할당합니다.

<!--
Where did the injector get that value?
It may already have that value in its internal container.
If it doesn't, it may be able to make one with the help of a ***provider***.
A *provider* is a recipe for delivering a service associated with a *token*.
-->
이때 인젝터는 어디에서 인스턴스를 가져올까요?
인스턴스는 이전에 생성되어 이미 인젝터가 갖고 있을 수도 있습니다.
그리고 인스턴스가 아직 없다면 ***프로바이더***를 사용해서 인스턴스를 새로 생성합니다.
그래서 *프로바이더*는 *토큰*으로 구분하는 서비스를 만드는 조립설명서라고 볼 수 있습니다.

<div class="alert is-helpful">


<!--
If the injector doesn't have a provider for the requested *token*, it delegates the request
to its parent injector, where the process repeats until there are no more injectors.
If the search is futile, the injector throws an error&mdash;unless the request was [optional](guide/dependency-injection-in-action#optional).
-->
인젝터에서 *토큰*에 해당하는 프로바이더를 찾지 못하면 의존성 주입 요청은 부모 인젝터에게 전달되며, 이 과정은 애플리케이션 최상위 인젝터까지 반복됩니다.
그리고 [optional](guide/dependency-injection-in-action#optional) 데코레이터가 지정되지 않은 상태로 마지막까지 토큰을 찾지 못하면 에러가 발생합니다.

</div>


<!--
A new injector has no providers.
Angular initializes the injectors it creates with some providers it cares about.
You have to register your _own_ application providers manually,
usually in the `@Injectable` decorator of the service, `providers` array of the `NgModule` or `Directive` metadata:
-->
새로 생성된 인젝터에는 프로바이더가 없으며, 인젝터에 프로바이더를 등록하면 Angular가 인젝터를 생성하면서 프로바이더를 함께 연결합니다.
프로바이더를 등록하려면 서비스에 `@Injectable` 데코레이터를 사용하거나 `NgModule`이나 `Directive`와 같은 메타데이터에 `providers` 배열을 사용하면 됩니다.

<code-example path="dependency-injection-in-action/src/app/app.component.ts" region="providers" title="src/app/app.component.ts (providers)">

</code-example>



{@a defining-providers}


### Defining providers

The simple way of defining providers in the `@Injectable` decorator of the class is recommended.

<code-example path="dependency-injection/src/app/heroes/hero.service.0.ts" title="src/app/heroes/hero.service.0.ts" linenums="false">
</code-example>

Another alternative is to mention the class in the providers array of the `@NgModule` and you're done.

<code-example path="dependency-injection-in-action/src/app/hero-bios.component.ts" region="class-provider" title="src/app/hero-bios.component.ts (class provider)" linenums="false">

</code-example>


It's that simple because the most common injected service is an instance of a class.
But not every dependency can be satisfied by creating a new instance of a class.
You need other ways to deliver dependency values and that means you need other ways to specify a provider.

The `HeroOfTheMonthComponent` example demonstrates many of the alternatives and why you need them.
It's visually simple: a few properties and the logs produced by a logger.

<figure>
  <img src="generated/images/guide/dependency-injection-in-action/hero-of-month.png" alt="Hero of the month">
</figure>



The code behind it gives you plenty to think about.

<code-example path="dependency-injection-in-action/src/app/hero-of-the-month.component.ts" region="hero-of-the-month" title="hero-of-the-month.component.ts">

</code-example>




{@a provide}


#### The *provide* object literal

The `provide` object literal takes a *token* and a *definition object*.
The *token* is usually a class but [it doesn't have to be](guide/dependency-injection-in-action#tokens).

The *definition* object has a required property that specifies how to create the singleton instance of the service. In this case, the property.



{@a usevalue}


#### useValue&mdash;the *value provider*

Set the `useValue` property to a ***fixed value*** that the provider can return as the service instance (AKA, the "dependency object").

Use this technique to provide *runtime configuration constants* such as website base addresses and feature flags.
You can use a *value provider* in a unit test to replace a production service with a fake or mock.

The `HeroOfTheMonthComponent` example has two *value providers*.
The first provides an instance of the `Hero` class;
the second specifies a literal string resource:

<code-example path="dependency-injection-in-action/src/app/hero-of-the-month.component.ts" region="use-value" title="dependency-injection-in-action/src/app/hero-of-the-month.component.ts" linenums="false">

</code-example>



The `Hero` provider token is a class which makes sense because the value is a `Hero`
and the consumer of the injected hero would want the type information.

The `TITLE` provider token is *not a class*.
It's a special kind of provider lookup key called an [InjectionToken](guide/dependency-injection-in-action#injection-token).
You can use an `InjectionToken` for any kind of provider but it's particular
helpful when the dependency is a simple value like a string, a number, or a function.

The value of a *value provider* must be defined *now*. You can't create the value later.
Obviously the title string literal is immediately available.
The `someHero` variable in this example was set earlier in the file:

<code-example path="dependency-injection-in-action/src/app/hero-of-the-month.component.ts" region="some-hero" title="dependency-injection-in-action/src/app/hero-of-the-month.component.ts">

</code-example>



The other providers create their values *lazily* when they're needed for injection.



{@a useclass}


#### useClass&mdash;the *class provider*

The `useClass` provider creates and returns new instance of the specified class.

Use this technique to ***substitute an alternative implementation*** for a common or default class.
The alternative could implement a different strategy, extend the default class,
or fake the behavior of the real class in a test case.

Here are two examples in the `HeroOfTheMonthComponent`:

<code-example path="dependency-injection-in-action/src/app/hero-of-the-month.component.ts" region="use-class" title="dependency-injection-in-action/src/app/hero-of-the-month.component.ts" linenums="false">

</code-example>



The first provider is the *de-sugared*, expanded form of the most typical case in which the
class to be created (`HeroService`) is also the provider's dependency injection token.
It's in this long form to de-mystify the preferred short form.

The second provider substitutes the `DateLoggerService` for the `LoggerService`.
The `LoggerService` is already registered at the `AppComponent` level.
When _this component_ requests the `LoggerService`, it receives the `DateLoggerService` instead.

<div class="alert is-helpful">



This component and its tree of child components receive the `DateLoggerService` instance.
Components outside the tree continue to receive the original `LoggerService` instance.

</div>



The `DateLoggerService` inherits from `LoggerService`; it appends the current date/time to each message:

<code-example path="dependency-injection-in-action/src/app/date-logger.service.ts" region="date-logger-service" title="src/app/date-logger.service.ts" linenums="false">

</code-example>




{@a useexisting}


#### _useExisting_&mdash;the *alias provider*

The `useExisting` provider maps one token to another.
In effect, the first token is an ***alias*** for the service associated with the second token,
creating ***two ways to access the same service object***.

<code-example path="dependency-injection-in-action/src/app/hero-of-the-month.component.ts" region="use-existing" title="dependency-injection-in-action/src/app/hero-of-the-month.component.ts">

</code-example>



Narrowing an API through an aliasing interface is _one_ important use case for this technique.
The following example shows aliasing for that purpose.

Imagine that the `LoggerService` had a large API, much larger than the actual three methods and a property.
You might want to shrink that API surface to just the members you actually need.
Here the `MinimalLogger` [*class-interface*](guide/dependency-injection-in-action#class-interface) reduces the API to two members:


<code-example path="dependency-injection-in-action/src/app/minimal-logger.service.ts" title="src/app/minimal-logger.service.ts" linenums="false">

</code-example>



Now put it to use in a simplified version of the `HeroOfTheMonthComponent`.

<code-example path="dependency-injection-in-action/src/app/hero-of-the-month.component.1.ts" title="src/app/hero-of-the-month.component.ts (minimal version)" linenums="false">

</code-example>



The `HeroOfTheMonthComponent` constructor's `logger` parameter is typed as `MinimalLogger` so only the `logs` and `logInfo` members are visible in a TypeScript-aware editor:

<figure>
  <img src="generated/images/guide/dependency-injection-in-action/minimal-logger-intellisense.png" alt="MinimalLogger restricted API">
</figure>



Behind the scenes, Angular actually sets the `logger` parameter to the full service registered under the `LoggingService` token which happens to be the `DateLoggerService` that was [provided above](guide/dependency-injection-in-action#useclass).


<div class="alert is-helpful">



The following image, which displays the logging date, confirms the point:

<figure>
  <img src="generated/images/guide/dependency-injection-in-action/date-logger-entry.png" alt="DateLoggerService entry">
</figure>



</div>




{@a usefactory}


#### _useFactory_&mdash;the *factory provider*

The `useFactory` provider creates a dependency object by calling a factory function
as in this example.

<code-example path="dependency-injection-in-action/src/app/hero-of-the-month.component.ts" region="use-factory" title="dependency-injection-in-action/src/app/hero-of-the-month.component.ts">

</code-example>



Use this technique to ***create a dependency object***
with a factory function whose inputs are some ***combination of injected services and local state***.

The *dependency object* doesn't have to be a class instance. It could be anything.
In this example, the *dependency object* is a string of the names of the runners-up
to the "Hero of the Month" contest.

The local state is the number `2`, the number of runners-up this component should show.
It executes `runnersUpFactory` immediately with `2`.

The `runnersUpFactory` itself isn't the provider factory function.
The true provider factory function is the function that `runnersUpFactory` returns.


<code-example path="dependency-injection-in-action/src/app/runners-up.ts" region="factory-synopsis" title="runners-up.ts (excerpt)" linenums="false">

</code-example>



That returned function takes a winning `Hero` and a `HeroService` as arguments.

Angular supplies these arguments from injected values identified by
the two *tokens* in the `deps` array.
The two `deps` values are *tokens* that the injector uses
to provide these factory function dependencies.

After some undisclosed work, the function returns the string of names
and Angular injects it into the `runnersUp` parameter of the `HeroOfTheMonthComponent`.


<div class="alert is-helpful">



The function retrieves candidate heroes from the `HeroService`,
takes `2` of them to be the runners-up, and returns their concatenated names.
Look at the <live-example name="dependency-injection-in-action"></live-example>
for the full source code.


</div>



{@a tokens}



## Provider token alternatives: the *class-interface* and *InjectionToken*

Angular dependency injection is easiest when the provider *token* is a class
that is also the type of the returned dependency object, or what you usually call the *service*.

But the token doesn't have to be a class and even when it is a class,
it doesn't have to be the same type as the returned object.
That's the subject of the next section.
{@a class-interface}

### class-interface
The previous *Hero of the Month* example used the `MinimalLogger` class
as the token for a provider of a `LoggerService`.

<code-example path="dependency-injection-in-action/src/app/hero-of-the-month.component.ts" region="use-existing" title="dependency-injection-in-action/src/app/hero-of-the-month.component.ts">

</code-example>



The `MinimalLogger` is an abstract class.

<code-example path="dependency-injection-in-action/src/app/minimal-logger.service.ts" title="dependency-injection-in-action/src/app/minimal-logger.service.ts" linenums="false">

</code-example>



You usually inherit from an abstract class.
But *no class* in this application inherits from `MinimalLogger`.

The `LoggerService` and the `DateLoggerService` _could_ have inherited from `MinimalLogger`.
They could have _implemented_ it instead in the manner of an interface.
But they did neither.
The `MinimalLogger` is used exclusively as a dependency injection token.

When you use a class this way, it's called a ***class-interface***.
The key benefit of a *class-interface* is that you can get the strong-typing of an interface
and you can ***use it as a provider token*** in the way you would a normal class.

A ***class-interface*** should define *only* the members that its consumers are allowed to call.
Such a narrowing interface helps decouple the concrete class from its consumers.


<div class="alert is-helpful">



#### Why *MinimalLogger* is a class and not a TypeScript interface
You can't use an interface as a provider token because
interfaces are not JavaScript objects.
They exist only in the TypeScript design space.
They disappear after the code is transpiled to JavaScript.

A provider token must be a real JavaScript object of some kind:
such as a function, an object, a string, or a class.

Using a class as an interface gives you the characteristics of an interface in a real JavaScript object.

Of course a real object occupies memory. To minimize memory cost, the class should have *no implementation*.
The `MinimalLogger` transpiles to this unoptimized, pre-minified JavaScript for a constructor function:

<code-example path="dependency-injection-in-action/src/app/minimal-logger.service.ts" region="minimal-logger-transpiled" title="dependency-injection-in-action/src/app/minimal-logger.service.ts" linenums="false">

</code-example>



Notice that it doesn't have a single member. It never grows no matter how many members you add to the class *as long as those members are typed but not implemented*. Look again at the TypeScript `MinimalLogger` class to confirm that it has no implementation.


</div>



{@a injection-token}


### _InjectionToken_

Dependency objects can be simple values like dates, numbers and strings, or
shapeless objects like arrays and functions.

Such objects don't have application interfaces and therefore aren't well represented by a class.
They're better represented by a token that is both unique and symbolic,
a JavaScript object that has a friendly name but won't conflict with
another token that happens to have the same name.

The `InjectionToken` has these characteristics.
You encountered them twice in the *Hero of the Month* example,
in the *title* value provider and in the *runnersUp* factory provider.

<code-example path="dependency-injection-in-action/src/app/hero-of-the-month.component.ts" region="provide-injection-token" title="dependency-injection-in-action/src/app/hero-of-the-month.component.ts" linenums="false">

</code-example>



You created the `TITLE` token like this:

<code-example path="dependency-injection-in-action/src/app/hero-of-the-month.component.ts" region="injection-token" title="dependency-injection-in-action/src/app/hero-of-the-month.component.ts" linenums="false">

</code-example>



The type parameter, while optional, conveys the dependency's type to developers and tooling.
The token description is another developer aid.


{@a di-inheritance}



## Inject into a derived class
Take care when writing a component that inherits from another component.
If the base component has injected dependencies,
you must re-provide and re-inject them in the derived class
and then pass them down to the base class through the constructor.

In this contrived example, `SortedHeroesComponent` inherits from `HeroesBaseComponent`
to display a *sorted* list of heroes.


<figure>
  <img src="generated/images/guide/dependency-injection-in-action/sorted-heroes.png" alt="Sorted Heroes">
</figure>



The `HeroesBaseComponent` could stand on its own.
It demands its own instance of the `HeroService` to get heroes
and displays them in the order they arrive from the database.


<code-example path="dependency-injection-in-action/src/app/sorted-heroes.component.ts" region="heroes-base" title="src/app/sorted-heroes.component.ts (HeroesBaseComponent)">

</code-example>



<div class="alert is-helpful">



***Keep constructors simple.*** They should do little more than initialize variables.
This rule makes the component safe to construct under test without fear that it will do something dramatic like talk to the server.
That's why you call the `HeroService` from within the `ngOnInit` rather than the constructor.


</div>



Users want to see the heroes in alphabetical order.
Rather than modify the original component, sub-class it and create a
`SortedHeroesComponent` that sorts the heroes before presenting them.
The `SortedHeroesComponent` lets the base class fetch the heroes.

Unfortunately, Angular cannot inject the `HeroService` directly into the base class.
You must provide the `HeroService` again for *this* component,
then pass it down to the base class inside the constructor.


<code-example path="dependency-injection-in-action/src/app/sorted-heroes.component.ts" region="sorted-heroes" title="src/app/sorted-heroes.component.ts (SortedHeroesComponent)">

</code-example>



Now take note of the `afterGetHeroes()` method.
Your first instinct might have been to create an `ngOnInit` method in `SortedHeroesComponent` and do the sorting there.
But Angular calls the *derived* class's `ngOnInit` *before* calling the base class's `ngOnInit`
so you'd be sorting the heroes array *before they arrived*. That produces a nasty error.

Overriding the base class's `afterGetHeroes()` method solves the problem.

These complications argue for *avoiding component inheritance*.


{@a find-parent}



## Find a parent component by injection

Application components often need to share information.
More loosely coupled techniques such as data binding and service sharing
are preferable. But sometimes it makes sense for one component
to have a direct reference to another component
perhaps to access values or call methods on that component.

Obtaining a component reference is a bit tricky in Angular.
Although an Angular application is a tree of components,
there is no public API for inspecting and traversing that tree.

There is an API for acquiring a child reference.
Check out `Query`, `QueryList`, `ViewChildren`, and `ContentChildren`
in the [API Reference](api/).

There is no public API for acquiring a parent reference.
But because every component instance is added to an injector's container,
you can use Angular dependency injection to reach a parent component.

This section describes some techniques for doing that.


{@a known-parent}


### Find a parent component of known type

You use standard class injection to acquire a parent component whose type you know.

In the following example, the parent `AlexComponent` has several children including a `CathyComponent`:

{@a alex}


<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="alex-1" title="parent-finder.component.ts (AlexComponent v.1)" linenums="false">

</code-example>



*Cathy* reports whether or not she has access to *Alex*
after injecting an `AlexComponent` into her constructor:

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="cathy" title="parent-finder.component.ts (CathyComponent)" linenums="false">

</code-example>



Notice that even though the [@Optional](guide/dependency-injection-in-action#optional) qualifier
is there for safety,
the <live-example name="dependency-injection-in-action"></live-example>
confirms that the `alex` parameter is set.


{@a base-parent}


### Cannot find a parent by its base class

What if you *don't* know the concrete parent component class?

A re-usable component might be a child of multiple components.
Imagine a component for rendering breaking news about a financial instrument.
For business reasons, this news component makes frequent calls
directly into its parent instrument as changing market data streams by.

The app probably defines more than a dozen financial instrument components.
If you're lucky, they all implement the same base class
whose API your `NewsComponent` understands.


<div class="alert is-helpful">



Looking for components that implement an interface would be better.
That's not possible because TypeScript interfaces disappear
from the transpiled JavaScript, which doesn't support interfaces.
There's no artifact to look for.

</div>



This isn't necessarily good design.
This example is examining *whether a component can
inject its parent via the parent's base class*.

The sample's `CraigComponent` explores this question. [Looking back](guide/dependency-injection-in-action#alex),
you see that the `Alex` component *extends* (*inherits*) from a class named `Base`.

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="alex-class-signature" title="parent-finder.component.ts (Alex class signature)" linenums="false">

</code-example>



The `CraigComponent` tries to inject `Base` into its `alex` constructor parameter and reports if it succeeded.

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="craig" title="parent-finder.component.ts (CraigComponent)" linenums="false">

</code-example>



Unfortunately, this does not work.
The <live-example name="dependency-injection-in-action"></live-example>
confirms that the `alex` parameter is null.
*You cannot inject a parent by its base class.*



{@a class-interface-parent}


### Find a parent by its class-interface

You can find a parent component with a [class-interface](guide/dependency-injection-in-action#class-interface).

The parent must cooperate by providing an *alias* to itself in the name of a *class-interface* token.

Recall that Angular always adds a component instance to its own injector;
that's why you could inject *Alex* into *Cathy* [earlier](guide/dependency-injection-in-action#known-parent).

Write an [*alias provider*](guide/dependency-injection-in-action#useexisting)&mdash;a `provide` object literal with a `useExisting`
definition&mdash;that creates an *alternative* way to inject the same component instance
and add that provider to the `providers` array of the `@Component` metadata for the `AlexComponent`:

{@a alex-providers}


<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="alex-providers" title="parent-finder.component.ts (AlexComponent providers)" linenums="false">

</code-example>



[Parent](guide/dependency-injection-in-action#parent-token) is the provider's *class-interface* token.
The [*forwardRef*](guide/dependency-injection-in-action#forwardref) breaks the circular reference you just created by having the `AlexComponent` refer to itself.

*Carol*, the third of *Alex*'s child components, injects the parent into its `parent` parameter,
the same way you've done it before:

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="carol-class" title="parent-finder.component.ts (CarolComponent class)" linenums="false">

</code-example>



Here's *Alex* and family in action:

<figure>
  <img src="generated/images/guide/dependency-injection-in-action/alex.png" alt="Alex in action">
</figure>



{@a parent-tree}


### Find the parent in a tree of parents with _@SkipSelf()_

Imagine one branch of a component hierarchy: *Alice* -> *Barry* -> *Carol*.
Both *Alice* and *Barry* implement the `Parent` *class-interface*.

*Barry* is the problem. He needs to reach his parent, *Alice*, and also be a parent to *Carol*.
That means he must both *inject* the `Parent` *class-interface* to get *Alice* and
*provide* a `Parent` to satisfy *Carol*.

Here's *Barry*:

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="barry" title="parent-finder.component.ts (BarryComponent)" linenums="false">

</code-example>



*Barry*'s `providers` array looks just like [*Alex*'s](guide/dependency-injection-in-action#alex-providers).
If you're going to keep writing [*alias providers*](guide/dependency-injection-in-action#useexisting) like this you should create a [helper function](guide/dependency-injection-in-action#provideparent).

For now, focus on *Barry*'s constructor:

<code-tabs>

  <code-pane title="Barry's constructor" path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="barry-ctor">

  </code-pane>

  <code-pane title="Carol's constructor" path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="carol-ctor">

  </code-pane>

</code-tabs>





It's identical to *Carol*'s constructor except for the additional `@SkipSelf` decorator.

`@SkipSelf` is essential for two reasons:

1. It tells the injector to start its search for a `Parent` dependency in a component *above* itself,
which *is* what parent means.

2. Angular throws a cyclic dependency error if you omit the `@SkipSelf` decorator.

  `Cannot instantiate cyclic dependency! (BethComponent -> Parent -> BethComponent)`

Here's *Alice*, *Barry* and family in action:


<figure>
  <img src="generated/images/guide/dependency-injection-in-action/alice.png" alt="Alice in action">
</figure>



{@a parent-token}


### The *Parent* class-interface
You [learned earlier](guide/dependency-injection-in-action#class-interface) that a *class-interface* is an abstract class used as an interface rather than as a base class.

The example defines a `Parent` *class-interface*.

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="parent" title="parent-finder.component.ts (Parent class-interface)" linenums="false">

</code-example>



The `Parent` *class-interface* defines a `name` property with a type declaration but *no implementation*.
The `name` property is the only member of a parent component that a child component can call.
Such a narrow interface helps decouple the child component class from its parent components.

A component that could serve as a parent *should* implement the *class-interface* as the `AliceComponent` does:

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="alice-class-signature" title="parent-finder.component.ts (AliceComponent class signature)" linenums="false">

</code-example>



Doing so adds clarity to the code.  But it's not technically necessary.
Although the `AlexComponent` has a `name` property, as required by its `Base` class,
its class signature doesn't mention `Parent`:

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="alex-class-signature" title="parent-finder.component.ts (AlexComponent class signature)" linenums="false">

</code-example>



<div class="alert is-helpful">



The `AlexComponent` *should* implement `Parent` as a matter of proper style.
It doesn't in this example *only* to demonstrate that the code will compile and run without the interface


</div>



{@a provideparent}


### A _provideParent()_ helper function

Writing variations of the same parent *alias provider* gets old quickly,
especially this awful mouthful with a [*forwardRef*](guide/dependency-injection-in-action#forwardref):

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="alex-providers" title="dependency-injection-in-action/src/app/parent-finder.component.ts" linenums="false">

</code-example>



You can extract that logic into a helper function like this:

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="provide-the-parent" title="dependency-injection-in-action/src/app/parent-finder.component.ts" linenums="false">

</code-example>



Now you can add a simpler, more meaningful parent provider to your components:

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="alice-providers" title="dependency-injection-in-action/src/app/parent-finder.component.ts" linenums="false">

</code-example>



You can do better. The current version of the helper function can only alias the `Parent` *class-interface*.
The application might have a variety of parent types, each with its own *class-interface* token.

Here's a revised version that defaults to `parent` but also accepts an optional second parameter for a different parent *class-interface*.

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="provide-parent" title="dependency-injection-in-action/src/app/parent-finder.component.ts" linenums="false">

</code-example>



And here's how you could use it with a different parent type:

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="beth-providers" title="dependency-injection-in-action/src/app/parent-finder.component.ts" linenums="false">

</code-example>



{@a forwardref}



## Break circularities with a forward class reference (*forwardRef*)

The order of class declaration matters in TypeScript.
You can't refer directly to a class until it's been defined.

This isn't usually a problem, especially if you adhere to the recommended *one class per file* rule.
But sometimes circular references are unavoidable.
You're in a bind when class 'A' refers to class 'B' and 'B' refers to 'A'.
One of them has to be defined first.

The Angular `forwardRef()` function creates an *indirect* reference that Angular can resolve later.

The *Parent Finder* sample is full of circular class references that are impossible to break.


You face this dilemma when a class makes *a reference to itself*
as does the `AlexComponent` in its `providers` array.
The `providers` array is a property of the `@Component` decorator function which must
appear *above* the class definition.

Break the circularity with `forwardRef`:

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="alex-providers" title="parent-finder.component.ts (AlexComponent providers)" linenums="false">

</code-example>



