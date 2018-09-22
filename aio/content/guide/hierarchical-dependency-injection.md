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
쉽게 말하면, 인젝터는 트리로 구성되며 애플리케이션의 컴포넌트 트리 계층에서는 병렬로 존재하기도 합니다.
컴포넌트 트리에 생성된 인젝터는 개발자가 원하는 대로 다시 설정할 수도 있습니다.

<!--
This guide explores this system and how to use it to your advantage.
-->
이번 문서에서는 이 시스템이 구체적으로 어떻게 구성되어 있는지 알아보고, 활용방법도 함께 알아봅시다.

<!--
Try the <live-example></live-example>.
-->
이 문서에서 설명하는 예제는 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.


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
그리고 컴포넌트 인젝터에 프로바이더가 없으면 부모 컴포넌트 인젝터를 찾아 같은 과정을 반복합니다.
즉, 인젝터가 직접 처리할 수 없는 것은 *부모 인젝터*가 처리하도록 넘긴다는 것입니다.
의존성 주입 요청은 원하는 프로바이더를 찾을 때까지 위쪽으로 버블링되며, 애플리케이션 최상위 인젝터도 이 대상에 포함됩니다.
만약 애플리케이션 최상위 인젝터에서도 프로바이더를 찾지 못하면 Angular가 에러를 발생시킵니다.

<div class="alert is-helpful">


<!--
You can cap the bubbling. An intermediate component can declare that it is the "host" component.
The hunt for providers will climb no higher than the injector for that host component.
This is a topic for another day.
-->
이 버블링은 중단시킬 수 있습니다. 중간에 있는 컴포넌트에서 인젝터 버블링을 막도록 설정할 수 있는데, 이 컴포넌트를 "호스트" 컴포넌트라고 합니다. 그러면 인젝터가 프로바이더를 찾는 과정이 호스트 컴포넌트 위쪽으로는 수행되지 않습니다. 이 내용은 이후에 다시 다룹니다.

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
물론 잘 등록되어 있는 서비스 프로바이더를 일부러 재등록할 필요는 없겠지만, *활용할 수 있는 가능성은 열려있습니다*.

<!--
As the resolution logic works upwards, the first provider encountered wins.
Thus, a provider in an intermediate injector intercepts a request for a service from something lower in the tree.
It effectively "reconfigures" and "shadows" a provider at a higher level in the tree.
-->
그리고 인젝터 버블링은 위쪽으로 전파되기 때문에, 이 과정에 먼저 만나는 프로바이더가 사용됩니다.
그래서 인젝터가 요청하는 버블링 과정 중간에 다른 프로바이더가 등록되면, 이 단계에서 서비스 인스턴스가 생성되고 인젝터 버블링이 종료됩니다.
이 과정은 서비스 프로바이더를 "재설정"한다고도 할 수 있으며, 트리의 상위 계층을 "가리는(shadow)" 방법이기도 합니다.

<!--
If you only specify providers at the top level (typically the root `AppModule`), the tree of injectors appears to be flat.
All requests bubble up to the root <code>NgModule</code> injector that you configured with the `bootstrapModule` method.
-->
만약 서비스 프로바이더가 애플리케이션 최상위 모듈인 `AppModule`에만 등록되어 있다면, 인젝터 트리는 아주 단순해질 것입니다.
인젝터 버블링은 애플리케이션 최상위 <code>NgModule</code> 인젝터까지 전달되며, 이 모듈은 `bootstrapModule` 메소드로 지정한 설정의 영향을 받습니다.


<!--
## Component injectors
-->
## 컴포넌트 인젝터

<!--
The ability to configure one or more providers at different levels opens up interesting and useful possibilities.
-->
서비스 프로바이더를 여러 계층에 등록할 수 있다는 것을 활용하면 의존성 주입을 좀 더 다양하게 사용할 수 있습니다.

<!--
### Scenario: service isolation
-->
### 시나리오: 서비스 접근 범위 제한하기

<!--
Architectural reasons may lead you to restrict access to a service to the application domain where it belongs.
-->
아키텍처상 어떤 서비스는 그 서비스가 속한 도메인에서만 동작해야 한다고 합시다.

<!--
The guide sample includes a `VillainsListComponent` that displays a list of villains.
It gets those villains from a `VillainsService`.
-->
이번 섹션에서 살펴볼 `VillainsListComponent`는 빌런들의 목록을 화면에 표시하는데, 이 목록은 `VillainsService`에서 가져오려고 합니다.

<!--
While you _could_ provide `VillainsService` in the root `AppModule` (that's where you'll find the `HeroesService`),
that would make the `VillainsService` available everywhere in the application, including the _Hero_ workflows.
-->
하지만 `VillainsService`를 최상위 모듈인 `AppModule`에 등록하면 이 서비스는 애플리케이션 전역에서 자유롭게 접근할 수 있으며, _히어로와 관련된_ 로직과도 섞일 수 있습니다.

<!--
If you later modified the `VillainsService`, you could break something in a hero component somewhere.
That's not supposed to happen but providing the service in the root `AppModule` creates that risk.
-->
그래서 나중에 `VillainsService`를 수정할 때 히어로와 관련된 컴포넌트 어딘가에서 문제가 생길 수도 있습니다.
물론 코드를 작성하면서 충분히 주의할 수는 있겠지만 서비스를 `AppModule`에 등록하는 것은 문제가 생길 가능성을 열어두는 것과 같습니다.

<!--
Instead, provide the `VillainsService` in the `providers` metadata of the `VillainsListComponent` like this:
-->
이런 상황을 방지하려면 `VillainsService`를 `VillainsListComponent`의 `providers` 메타데이터를 다음과 같이 지정하면 됩니다.

<code-example path="hierarchical-dependency-injection/src/app/villains-list.component.ts" linenums="false" title="src/app/villains-list.component.ts (metadata)" region="metadata">

</code-example>


<!--
By providing `VillainsService` in the `VillainsListComponent` metadata and nowhere else,
the service becomes available only in the `VillainsListComponent` and its sub-component tree.
It's still a singleton, but it's a singleton that exist solely in the _villain_ domain.
-->
이제는 `VillainsService`가 `VillainsListComponent`에만 등록되었기 때문에, 이 서비스는 `VillainsListComponent`와 그 하위 컴포넌트 트리에서만 사용할 수 있습니다.
그리고 이 서비스는 여전히 싱글턴으로 존재하지만, _빌런_ 과 관련된 도메인에서만 싱글턴으로 존재합니다.

<!--
Now you know that a hero component can't access it. You've reduced your exposure to error.
-->
이제 히어로와 관련된 컴포넌트에서는 이 서비스에 접근할 수 없습니다. 그리고 양쪽의 로직이 섞여서 에러가 발생하는 것도 걱정할 필요가 없습니다.

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
이 컴포넌트는 히어로마다 독립적이며, 서로 다른 요청을 동시에 처리할 수 있어야 합니다.

<!--
Each tax return component has the following characteristics:
-->
정리하자면, 자식 컴포넌트는 다음 조건을 만족해야 합니다.

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
One might suppose that the `HeroTaxReturnComponent` has logic to manage and restore changes.
That would be a pretty easy task for a simple hero tax return.
In the real world, with a rich tax return data model, the change management would be tricky.
You might delegate that management to a helper service, as this example does.
-->
이 시나리오를 만족시키기 위해, `HeroTaxReturnComponent`에 변경사항을 저장했다가 필요할 때마다 복원하는 로직을 작성할 수도 있습니다.
로직이 간단하다면 이 방식이 가장 쉬울 수도 있습니다.
하지만 실제로 사용되는 애플리케이션에서는 데이터 모델이 훨씬 복잡하기 때문에 이런 로직을 작성하는 것이 그렇게 쉽지는 않습니다.
그래서 이 경우에는 헬퍼 서비스를 사용하는 것이 좋습니다.

<!--
Here is the `HeroTaxReturnService`.
It caches a single `HeroTaxReturn`, tracks changes to that return, and can save or restore it.
It also delegates to the application-wide singleton `HeroService`, which it gets by injection.
-->
이 예제에서는 `HeroTaxReturnService`가 이 역할을 합니다.
이 서비스는 `HeroTaxReturn` 객체를 캐싱해뒀다가 이 객체의 값을 새로운 내용으로 변경하거나 컴포넌트의 내용을 원복할 때 사용합니다.
그리고 저장된 값을 반영할 때는 애플리케이션 전역에 있는 `HeroService` 싱글턴 서비스를 사용합니다.

<code-example path="hierarchical-dependency-injection/src/app/hero-tax-return.service.ts" title="src/app/hero-tax-return.service.ts">

</code-example>


<!--
Here is the `HeroTaxReturnComponent` that makes use of it.
-->
이 서비스를 사용하는 `HeroTaxReturnComponent`는 다음과 같이 작성합니다.


<code-example path="hierarchical-dependency-injection/src/app/hero-tax-return.component.ts" title="src/app/hero-tax-return.component.ts">

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
There'd be big trouble if _this_ service were an application-wide singleton.
Every component would share the same service instance.
Each component would overwrite the tax return that belonged to another hero.
What a mess!
-->
이 서비스가 애플리케이션 전역에 싱글턴으로 존재한다면 큰 문제가 발생할 것입니다.
왜냐하면 이 경우에는 모든 컴포넌트가 같은 서비스 인스턴스를 공유하기 때문입니다.
각 컴포넌트는 다른 히어로의 세금을 환급받게 될 것입니다.
그러면 안되죠!

<!--
Look closely at the metadata for the `HeroTaxReturnComponent`. Notice the `providers` property.
-->
`HeroTaxReturnComponent`에 지정된 `providers` 프로퍼티를 확인해 봅시다.

<code-example path="hierarchical-dependency-injection/src/app/hero-tax-return.component.ts" linenums="false" title="src/app/hero-tax-return.component.ts (providers)" region="providers">

</code-example>


<!--
The `HeroTaxReturnComponent` has its own provider of the `HeroTaxReturnService`.
Recall that every component _instance_ has its own injector.
Providing the service at the component level ensures that _every_ instance of the component gets its own, private instance of the service.
No tax return overwriting. No mess.
-->
`HeroTaxReturnComponent`에는 `HeroTaxReturnService`의 프로바이더가 등록되어 있습니다.
그리고 모든 컴포넌트 _인스턴스_ 마다 독자적인 인젝터가 존재한다는 것을 떠올려 봅시다.
서비스 프로바이더를 컴포넌트 계층에 등록하면 _모든_ 컴포넌트 인스턴스마다 독립적인 서비스 인스턴스가 생성됩니다.
다른 컴포넌트와 섞일 일도 없습니다. 아무 문제 없죠.

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
###시나리오: 프로바이더 대체하기

<!--
Another reason to re-provide a service is to substitute a _more specialized_ implementation of that service,
deeper in the component tree.
-->
어떤 컴포넌트 트리에 _특별한_ 서비스를 적용하는 경우에도 서비스 프로바이더를 다시 등록하는 방법을 활용할 수 있습니다.

<!--
Consider again the Car example from the [Dependency Injection](guide/dependency-injection) guide.
Suppose you configured the root injector (marked as A) with _generic_ providers for
`CarService`, `EngineService` and `TiresService`.
-->
[의존성 주입](guide/dependency-injection) 문서에서 살펴봤던 자동차 예제를 떠올려 봅시다.
이 예제에서는 최상위 인젝터(A)에 `CarService`와 `EngineService`, `TiresService`에 대한 서비스 프로바이더를 등록해두었습니다.

<!--
You create a car component (A) that displays a car constructed from these three generic services.
-->
그리고 자동차 컴포넌트(A)에서는 이렇게 등록된 서비스를 사용해서 자동차를 만듭니다.

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
이 예제에서 보듯이, 각각의 컴포넌트에는 서비스 프로바이더를 자유롭게 등록해서 사용할 수 있습니다.

<!--
When you resolve an instance of `Car` at the deepest component (C),
its injector produces an instance of `Car` resolved by injector (C) with an `Engine` resolved by injector (B) and
`Tires` resolved by the root injector (A).
-->
이제 컴포넌트 C를 사용해서 인스턴스를 만들게 되면, 인젝터 C에 등록된 `Car`와 인젝터 B에 등록된 `Engine`과 인젝터 A에 등록된 `Tires`를 사용합니다.


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
이 시나리오에서 설명한 코드는 <live-example></live-example>에서 받은 코드의 `car.components.ts` 파일과 `car.services.ts` 파일에 정의되어 있습니다.

</div>

