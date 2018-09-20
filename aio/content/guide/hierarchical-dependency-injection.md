<!--
# Hierarchical Dependency Injectors
-->
# 인젝터 계층

<!--
You learned the basics of Angular Dependency injection in the
[Dependency Injection](guide/dependency-injection) guide.
-->
[의존성 주입](guide/dependency-injection) 문서에서는 Angular의 의존성 주입 시스템에 대해 알아봤습니다.

<!--
Angular has a _Hierarchical Dependency Injection_ system.
There is actually a tree of injectors that parallel an application's component tree.
You can reconfigure the injectors at any level of that component tree.
-->
Angular의 인젝터는 _계층_ 체계를 갖추고 있습니다.
쉽게 말하면, 인젝터는 트리로 구성되며, 애플리케이션의 컴포넌트 트리 계층에서는 병렬로 존재하기도 합니다.
컴포넌트 트리에 생성된 인젝터는 개발자가 원하는 대로 다시 설정할 수도 있습니다.

<!--
This guide explores this system and how to use it to your advantage.
-->
이번 문서에서는 이 시스템이 구체적으로 어떻게 구성되어 있는지 알아보고, 활용방법도 함께 알아봅시다.

<!--
Try the <live-example></live-example>.
-->
이 문서에서 설명하는 예제는 <live-example></live-example>에서 다운받아 확인하거나 직접 실행해서 확인할 수 있습니다.


<!--
## The injector tree
-->
## 인젝터 트리

<!--
In the [Dependency Injection](guide/dependency-injection) guide,
you learned how to configure a dependency injector and how to retrieve dependencies where you need them.
-->
[의존성 주입](guide/dependency-injection) 문서에서는 인젝터를 어떻게 설정하는지, 의존성 객체를 어떻게 받아올 수 있는지 설명했었습니다.

<!--
In fact, there is no such thing as ***the*** injector.
An application may have multiple injectors.
An Angular application is a tree of components. Each component instance has its own injector.
The tree of components parallels the tree of injectors.
-->
사실 이 과정은 ***인젝터 하나***로 모두 동작하는 것이 아닙니다.
애플리케이션에는 인젝터가 여러개 존재합니다.
애플리케이션에 컴포넌트 트리가 있듯이, 각각의 컴포넌트 인스턴스에도 인젝터가 존재합니다.
그래서 컴포넌트 트리가 병렬로 있으면 인젝터 트리도 병렬로 구성됩니다.

<div class="alert is-helpful">


<!--
The component's injector may be a _proxy_ for an ancestor injector higher in the component tree.
That's an implementation detail that improves efficiency.
You won't notice the difference and
your mental model should be that every component has its own injector.
-->
컴포넌트 인젝터는 컴포넌트 트리의 부모 인젝터에 대한 _프록시_ 라고 이해할 수도 있습니다.
인젝터는 이렇게 동작하는 것이 효율적이며, 실제로도 이렇게 구현되어 있습니다.
그래서 모든 컴포넌트마다 독자적인 인젝터가 생성되며, 이 잉ㄴ젝터는 부모 계층의 인젝터를 활용한다고 이해하면 간단합니다.

</div>


<!--
Consider this guide's variation on the Tour of Heroes application.
At the top is the `AppComponent` which has some sub-components.
One of them is the `HeroesListComponent`.
The `HeroesListComponent` holds and manages multiple instances of the `HeroTaxReturnComponent`.
The following diagram represents the state of the this guide's three-level component tree when there are three instances of `HeroTaxReturnComponent`
open simultaneously.
-->
이번 문서에서는 히어로들의 여정 애플리케이션을 약간 변형해서 다룹니다.
그래서 이 애플리케이션의 최상위 컴포넌트는 `AppComponent`이며, 이 컴포넌트의 자식으로 여러 컴포넌트가 존재하는데, 그 중 하나가 `HeroesListComponent` 입니다.
`HeroesListComponent`는 여러 개의 `HeroTaxReturnComponent` 인스턴스를 관리합니다.
이 문서에서 다루는 컴포넌트 트리의 구조는 아래 그림을 보며 확인해 보세요.
`HeroTaxReturnComponent`는 동시에 3개 생성될 것입니다.


<figure>
  <img src="generated/images/guide/dependency-injection/component-hierarchy.png" alt="injector tree">
</figure>


<!--
### Injector bubbling
-->
### 인젝터 버블링 (Injector bubbling)

<!--
When a component requests a dependency, Angular tries to satisfy that dependency with a provider registered in that component's own injector.
If the component's injector lacks the provider, it passes the request up to its parent component's injector.
If that injector can't satisfy the request, it passes it along to *its* parent injector.
The requests keep bubbling up until Angular finds an injector that can handle the request or runs out of ancestor injectors.
If it runs out of ancestors, Angular throws an error.
-->
어떤 컴포넌트가 의존성 객체를 주입해달라고 Angular에 요청하면, Angular는 먼저 그 컴포넌트에 있는 인젝터에 프로바이더가 등록되어 있는지 확인합니다.
그리고 컴포넌트 인젝터에 프로바이더가 없으면, 부모 컴포넌트 인젝터를 찾아 같은 과정을 반복합니다.
즉, 인젝터가 직접 처리할 수 없는 것은 *부모 인젝터*가 처리하도록 넘긴다는 것입니다.
의존성 주입 요청은 원하는 프로바이더를 찾을 때까지 위쪽으로 버블링되며, 애플리케이션 최상위 인젝터도 이 대상에 포함됩니다.
만약 애플리케이션 최상위 인젝터에서도 프로바이더를 찾지 못하면 Angular가 에러를 발생시킵니다.

<div class="alert is-helpful">


<!--
You can cap the bubbling. An intermediate component can declare that it is the "host" component.
The hunt for providers will climb no higher than the injector for that host component.
This is a topic for another day.
-->
이 버블링은 중단시킬 수 있습니다. 중간에 있는 컴포넌트에서 버블링을 막도록 설정하면, 이 컴포넌트를 "호스트" 컴포넌트라고 합니다. 그러면 인젝터가 프로바이더를 찾는 과정이 호스트 컴포넌트 위쪽으로는 수행되지 않습니다. 이 내용은 이후에 다시 다룹니다.

</div>


<!--
### Re-providing a service at different levels
-->
### 다른 계층에 서비스 프로바이더 재등록하기

<!--
You can re-register a provider for a particular dependency token at multiple levels of the injector tree.
You don't *have* to re-register providers. You shouldn't do so unless you have a good reason.
But you *can*.
-->
서비스 프로바이더는 서로 다른 의존성 토큰을 사용해서 인젝터 트리의 여러 계층에 등록할 수도 있습니다.
물론 잘 등록되어 있는 서비스 프로바이더를 일부러 재등록할 필요는 없겠지만, 일단은 *할 수 있습니다*.

<!--
As the resolution logic works upwards, the first provider encountered wins.
Thus, a provider in an intermediate injector intercepts a request for a service from something lower in the tree.
It effectively "reconfigures" and "shadows" a provider at a higher level in the tree.
-->
그리고 인젝터 버블링은 위쪽으로 전파되기 때문에, 이 과정에 먼저 만나는 프로바이더가 사용됩니다.
그래서 인젝터가 요청하는 버블링 과정 중간에 다른 프로바이더가 등록되면, 인젝터 버블링은 이 단계에서 끝나고 서비스 인스턴스가 생성됩니다.
이 방법은 서비스 프로바이더를 "재설정"하는 방법이며, 트리의 상위 계층을 "가리는(shadow)" 방법이기도 합니다.

<!--
If you only specify providers at the top level (typically the root `AppModule`), the tree of injectors appears to be flat.
All requests bubble up to the root <code>NgModule</code> injector that you configured with the `bootstrapModule` method.
-->
만약 서비스 프로바이더가 애플리케이션 최상위 모듈인 `AppModule`에만 등록되어 있다면, 인젝터 트리는 아주 단순해질 것입니다.
인젝터 버블링은 애플리케이션 최상위 <code>NgModule</code> 인젝터까지 전달되며, 이 모듈은 `bootstrapModule` 메소드로 지정한 설정의 영향을 받습니다.


## Component injectors

The ability to configure one or more providers at different levels opens up interesting and useful possibilities.

### Scenario: service isolation

Architectural reasons may lead you to restrict access to a service to the application domain where it belongs.

The guide sample includes a `VillainsListComponent` that displays a list of villains.
It gets those villains from a `VillainsService`.

While you _could_ provide `VillainsService` in the root `AppModule` (that's where you'll find the `HeroesService`),
that would make the `VillainsService` available everywhere in the application, including the _Hero_ workflows.

If you later modified the `VillainsService`, you could break something in a hero component somewhere.
That's not supposed to happen but providing the service in the root `AppModule` creates that risk.

Instead, provide the `VillainsService` in the `providers` metadata of the `VillainsListComponent` like this:


<code-example path="hierarchical-dependency-injection/src/app/villains-list.component.ts" linenums="false" title="src/app/villains-list.component.ts (metadata)" region="metadata">

</code-example>



By providing `VillainsService` in the `VillainsListComponent` metadata and nowhere else,
the service becomes available only in the `VillainsListComponent` and its sub-component tree.
It's still a singleton, but it's a singleton that exist solely in the _villain_ domain.

Now you know that a hero component can't access it. You've reduced your exposure to error.

### Scenario: multiple edit sessions

Many applications allow users to work on several open tasks at the same time.
For example, in a tax preparation application, the preparer could be working on several tax returns,
switching from one to the other throughout the day.

This guide demonstrates that scenario with an example in the Tour of Heroes theme.
Imagine an outer `HeroListComponent` that displays a list of super heroes.

To open a hero's tax return, the preparer clicks on a hero name, which opens a component for editing that return.
Each selected hero tax return opens in its own component and multiple returns can be open at the same time.

Each tax return component has the following characteristics:

* Is its own tax return editing session.
* Can change a tax return without affecting a return in another component.
* Has the ability to save the changes to its tax return or cancel them.


<figure>
  <img src="generated/images/guide/dependency-injection/hid-heroes-anim.gif" alt="Heroes in action">
</figure>



One might suppose that the `HeroTaxReturnComponent` has logic to manage and restore changes.
That would be a pretty easy task for a simple hero tax return.
In the real world, with a rich tax return data model, the change management would be tricky.
You might delegate that management to a helper service, as this example does.

Here is the `HeroTaxReturnService`.
It caches a single `HeroTaxReturn`, tracks changes to that return, and can save or restore it.
It also delegates to the application-wide singleton `HeroService`, which it gets by injection.


<code-example path="hierarchical-dependency-injection/src/app/hero-tax-return.service.ts" title="src/app/hero-tax-return.service.ts">

</code-example>



Here is the `HeroTaxReturnComponent` that makes use of it.


<code-example path="hierarchical-dependency-injection/src/app/hero-tax-return.component.ts" title="src/app/hero-tax-return.component.ts">

</code-example>



The _tax-return-to-edit_ arrives via the input property which is implemented with getters and setters.
The setter initializes the component's own instance of the `HeroTaxReturnService` with the incoming return.
The getter always returns what that service says is the current state of the hero.
The component also asks the service to save and restore this tax return.

There'd be big trouble if _this_ service were an application-wide singleton.
Every component would share the same service instance.
Each component would overwrite the tax return that belonged to another hero.
What a mess!

Look closely at the metadata for the `HeroTaxReturnComponent`. Notice the `providers` property.


<code-example path="hierarchical-dependency-injection/src/app/hero-tax-return.component.ts" linenums="false" title="src/app/hero-tax-return.component.ts (providers)" region="providers">

</code-example>



The `HeroTaxReturnComponent` has its own provider of the `HeroTaxReturnService`.
Recall that every component _instance_ has its own injector.
Providing the service at the component level ensures that _every_ instance of the component gets its own, private instance of the service.
No tax return overwriting. No mess.


<div class="alert is-helpful">



The rest of the scenario code relies on other Angular features and techniques that you can learn about elsewhere in the documentation.
You can review it and download it from the <live-example></live-example>.


</div>



### Scenario: specialized providers

Another reason to re-provide a service is to substitute a _more specialized_ implementation of that service,
deeper in the component tree.

Consider again the Car example from the [Dependency Injection](guide/dependency-injection) guide.
Suppose you configured the root injector (marked as A) with _generic_ providers for
`CarService`, `EngineService` and `TiresService`.

You create a car component (A) that displays a car constructed from these three generic services.

Then you create a child component (B) that defines its own, _specialized_ providers for `CarService` and `EngineService`
that have special capabilities suitable for whatever is going on in component (B).

Component (B) is the parent of another component (C) that defines its own, even _more specialized_ provider for `CarService`.


<figure>
  <img src="generated/images/guide/dependency-injection/car-components.png" alt="car components">
</figure>



Behind the scenes, each component sets up its own injector with zero, one, or more providers defined for that component itself.

When you resolve an instance of `Car` at the deepest component (C),
its injector produces an instance of `Car` resolved by injector (C) with an `Engine` resolved by injector (B) and
`Tires` resolved by the root injector (A).


<figure>
  <img src="generated/images/guide/dependency-injection/injector-tree.png" alt="car injector tree">
</figure>



<div class="alert is-helpful">



The code for this _cars_ scenario is in the `car.components.ts` and `car.services.ts` files of the sample
which you can review and download from the <live-example></live-example>.

</div>

