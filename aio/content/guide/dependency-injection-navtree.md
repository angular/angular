<!--
# Navigate the component tree with DI
-->
# 컴포넌트 트리 참조하기

<!--
Application components often need to share information.
You can often use loosely coupled techniques for sharing information,
such as data binding and service sharing, 
but sometimes it makes sense for one component to have a direct reference to another component. 
You need a direct reference, for instance, to access values or call methods on that component.
-->
애플리케이션들은 데이터를 공유하기도 합니다.
이 때 컴포넌트에 데이터를 바인딩하거나 서비스를 공유하면 컴포넌트간 결합도를 높이지 않으면서도 데이터를 공유할 수 있지만, 때로는 필요한 컴포넌트를 직접 값을 참조하거나 이 컴포넌트에 있는 함수를 실행하는 것이 편할 때도 있습니다.

<!--
Obtaining a component reference is a bit tricky in Angular.
Angular components themselves do not have a tree that you can 
inspect or navigate programmatically. The parent-child relationship is indirect,
established through the components' [view objects](guide/glossary#view).
-->
Angular에서 약간의 트릭을 사용하면 컴포넌트를 직접 참조할 수 있습니다.
Angular 컴포넌트에는 트리 정보가 없습니다. 부모-자식은 직접 연결되지 않은 관계이며 컴포넌트의 [뷰 객체](guide/glossary#view)를 통해서만 연결됩니다.

<!--
Each component has a *host view*, and can have additional *embedded views*. 
An embedded view in component A is the
host view of component B, which can in turn have embedded view.
This means that there is a [view hierarchy](guide/glossary#view-hierarchy) for each component,
of which that component's host view is the root.
-->
컴포넌트에는 *호스트 뷰(host view)*가 존재하며, 추가로 *내장 뷰(embedded view)*가 존재할 수도 있습니다.
컴포넌트 A의 내장 뷰는 컴포넌트 B의 호스트 뷰가 될 수 있으며, 컴포넌트 B의 내장 뷰는 또 다른 호스트 뷰가 될 수 있습니다.
다르게 표현하면, 컴포넌트에는 [뷰 계층(view hierarchy)](guide/glossary#view-hierarchy)이 존재하며 컴포넌트 호스트 뷰는 또 다른 컴포넌트의 부모가 될 수 있습니다.

<!--
There is an API for navigating *down* the view hierarchy.
Check out `Query`, `QueryList`, `ViewChildren`, and `ContentChildren`
in the [API Reference](api/).

There is no public API for acquiring a parent reference.
However, because every component instance is added to an injector's container,
you can use Angular dependency injection to reach a parent component.

This section describes some techniques for doing that.
-->
뷰 계층을 *따라 내려가서* 자식 컴포넌트를 참조할 수 있는 API는 몇 개가 있습니다.
[API 문서](api/)에서 `Query`, `QueryList`, `ViewChildren`, `ContentChildren`에 대해 확인해 보세요.

부모 컴포넌트를 참조할 수 있는 API는 없습니다.
하지만 모든 컴포넌트 인스턴스는 인젝터 컨테이너에 등록되기 때문에, Angular 의존성 주입 체계를 활용하면 부모 컴포넌트를 찾을 수 있습니다.

이 문서는 이 테크닉에 대해 소개합니다.

{@a find-parent}
{@a known-parent}

<!--
### Find a parent component of known type
-->
### 타입으로 부모 컴포넌트 찾기

<!--
You use standard class injection to acquire a parent component whose type you know.

In the following example, the parent `AlexComponent` has several children including a `CathyComponent`:
-->
부모 컴포넌트의 타입을 알고 있다면 클래스를 주입하는 일반적인 방법으로 부모 컴포넌트를 참조할 수 있습니다.

아래 예제 코드에서 부모 컴포넌트인 `AlexComponent`에는 `CathyComponent`와 같은 자식 컴포넌트가 몇 개 존재합니다:

{@a alex}


<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="alex-1" header="parent-finder.component.ts (AlexComponent v.1)" linenums="false">

</code-example>


<!--
*Cathy* reports whether or not she has access to *Alex*
after injecting an `AlexComponent` into her constructor:
-->
`AlexComponent`는 생성자를 통해 다음과 같이 주입하며, *Cathy*가 *Alex*를 찾았는지 여부는 템플릿에 다음과 같이 표시합니다:

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="cathy" header="parent-finder.component.ts (CathyComponent)" linenums="false">

</code-example>


<!--
Notice that even though the [@Optional](guide/dependency-injection-in-action#optional) qualifier
is there for safety,
the <live-example name="dependency-injection-in-action"></live-example>
confirms that the `alex` parameter is set.
-->
이 코드에는 비록 [@Optional](guide/dependency-injection-in-action#optional)가 사용되었지만 이와 관계없이 <live-example name="dependency-injection-in-action"></live-example>를 확인해보면 `alex` 인자에 부모 컴포넌트가 제대로 할당되는 것을 확인할 수 있습니다.

{@a base-parent}

<!--
### Unable to find a parent by its base class
-->
### 부모 클래스가 상속받은 클래스로는 참조할 수 없습니다.

<!--
What if you *don't* know the concrete parent component class?

A re-usable component might be a child of multiple components.
Imagine a component for rendering breaking news about a financial instrument.
For business reasons, this news component makes frequent calls
directly into its parent instrument as changing market data streams by.

The app probably defines more than a dozen financial instrument components.
If you're lucky, they all implement the same base class
whose API your `NewsComponent` understands.
-->
부모 컴포넌트의 정확한 클래스를 *몰라도* 가능할까요?

재사용하기 위해 만든 컴포넌트라면 여러 컴포넌트의 자식 컴포넌트로 존재할 수도 있습니다.
금융 앱에서 뉴스를 제공하는 컴포넌트가 있다고 합시다.
이 뉴스 컴포넌트는 부모 컴포넌트를 직접 참조하고 메소드를 실행해서 데이터를 받아오는 구조로 구현되었습니다.

이 앱에는 금융 업무와 관련된 컴포넌트가 아주 많이 정의되어 있을 수도 있습니다.
그리고 이 컴포넌트들이 모두 `NewsComponent`가 이해할 수 있는 어떤 기본 클래스를 상속받아 구현된다고 합시다.

<div class="alert is-helpful">


<!--
Looking for components that implement an interface would be better.
That's not possible because TypeScript interfaces disappear
from the transpiled JavaScript, which doesn't support interfaces.
There's no artifact to look for.
-->
인터페이스를 사용해서 컴포넌트를 찾을 수 있을까 생각해 볼 수도 있습니다.
하지만 인터페이스는 TypeScript에만 존재하며 애플리케이션 코드가 JavaScript로 변환되고 나면 인터페이스의 개념은 사라집니다.
찾아야 할 타입이 없어지는 셈입니다.

</div>


<!--
This isn't necessarily good design.
This example is examining *whether a component can
inject its parent via the parent's base class*.

The sample's `CraigComponent` explores this question. [Looking back](#alex),
you see that the `Alex` component *extends* (*inherits*) from a class named `Base`.
-->
하지만 이런 구조는 좋은 디자인이 아닙니다.
*부모 클래스가 상속받는 클래스를* 생성자에 주입하는 예제를 살펴봅시다.

이번 섹션에 설명한 내용은 `CraigComponent`를 사용해서 확인합니다.
[이전에 본 것과 마찬가지로](#alex) `AlexComponent`는 `Base` 클래스를 상속받아 구현한 클래스입니다.

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="alex-class-signature" header="parent-finder.component.ts (Alex class signature)" linenums="false">

</code-example>


<!--
The `CraigComponent` tries to inject `Base` into its `alex` constructor parameter and reports if it succeeded.
-->
그리고 `CraigComponent`는 `Base` 타입으로 `alex`에 부모 컴포넌트를 주입하려고 하며, 부모 컴포넌트를 찾았는지 여부는 템플릿에 표시합니다.

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="craig" header="parent-finder.component.ts (CraigComponent)" linenums="false">

</code-example>


<!--
Unfortunately, this doesn't work.
The <live-example name="dependency-injection-in-action"></live-example>
confirms that the `alex` parameter is null.
*You cannot inject a parent by its base class.*
-->
하지만 이 코드는 동작하지 않습니다.
<live-example name="dependency-injection-in-action"></live-example>에서도 확인할 수 있듯이 `alex`에 할당되는 값은 `null`입니다.
*부모 객체가 상속하는 클래스 타입* 으로는 부모 컴포넌트를 주입할 수 없습니다.


{@a class-interface-parent}


### Find a parent by its class interface

You can find a parent component with a [class interface](guide/dependency-injection-in-action#class-interface).

The parent must cooperate by providing an *alias* to itself in the name of a class interface token.

Recall that Angular always adds a component instance to its own injector;
that's why you could inject *Alex* into *Cathy* [earlier](#known-parent).

Write an [*alias provider*](guide/dependency-injection-in-action#useexisting)&mdash;a `provide` object literal with a `useExisting`
definition&mdash;that creates an *alternative* way to inject the same component instance
and add that provider to the `providers` array of the `@Component()` metadata for the `AlexComponent`.

{@a alex-providers}


<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="alex-providers" header="parent-finder.component.ts (AlexComponent providers)" linenums="false">

</code-example>


[Parent](#parent-token) is the provider's class interface token.
The [*forwardRef*](guide/dependency-injection-in-action#forwardref) breaks the circular reference you just created by having the `AlexComponent` refer to itself.

*Carol*, the third of *Alex*'s child components, injects the parent into its `parent` parameter,
the same way you've done it before.

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="carol-class" header="parent-finder.component.ts (CarolComponent class)" linenums="false">

</code-example>



Here's *Alex* and family in action.

<figure>
  <img src="generated/images/guide/dependency-injection-in-action/alex.png" alt="Alex in action">
</figure>



{@a parent-tree}


### Find a parent in a tree with _@SkipSelf()_

Imagine one branch of a component hierarchy: *Alice* -> *Barry* -> *Carol*.
Both *Alice* and *Barry* implement the `Parent` class interface.

*Barry* is the problem. He needs to reach his parent, *Alice*, and also be a parent to *Carol*.
That means he must both *inject* the `Parent` class interface to get *Alice* and
*provide* a `Parent` to satisfy *Carol*.

Here's *Barry*.

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="barry" header="parent-finder.component.ts (BarryComponent)" linenums="false">

</code-example>



*Barry*'s `providers` array looks just like [*Alex*'s](#alex-providers).
If you're going to keep writing [*alias providers*](guide/dependency-injection-in-action#useexisting) like this you should create a [helper function](#provideparent).

For now, focus on *Barry*'s constructor.

<code-tabs>

  <code-pane header="Barry's constructor" path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="barry-ctor">

  </code-pane>

  <code-pane header="Carol's constructor" path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="carol-ctor">

  </code-pane>

</code-tabs>


It's identical to *Carol*'s constructor except for the additional `@SkipSelf` decorator.

`@SkipSelf` is essential for two reasons:

1. It tells the injector to start its search for a `Parent` dependency in a component *above* itself,
which *is* what parent means.

2. Angular throws a cyclic dependency error if you omit the `@SkipSelf` decorator.

  `Cannot instantiate cyclic dependency! (BethComponent -> Parent -> BethComponent)`

Here's *Alice*, *Barry*, and family in action.


<figure>
  <img src="generated/images/guide/dependency-injection-in-action/alice.png" alt="Alice in action">
</figure>



{@a parent-token}


###  Parent class interface
You [learned earlier](guide/dependency-injection-in-action#class-interface) that a class interface is an abstract class used as an interface rather than as a base class.

The example defines a `Parent` class interface.

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="parent" header="parent-finder.component.ts (Parent class-interface)" linenums="false">

</code-example>



The `Parent` class interface defines a `name` property with a type declaration but *no implementation*.
The `name` property is the only member of a parent component that a child component can call.
Such a narrow interface helps decouple the child component class from its parent components.

A component that could serve as a parent *should* implement the class interface as the `AliceComponent` does.

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="alice-class-signature" header="parent-finder.component.ts (AliceComponent class signature)" linenums="false">

</code-example>



Doing so adds clarity to the code.  But it's not technically necessary.
Although `AlexComponent` has a `name` property, as required by its `Base` class,
its class signature doesn't mention `Parent`.

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="alex-class-signature" header="parent-finder.component.ts (AlexComponent class signature)" linenums="false">

</code-example>



<div class="alert is-helpful">



`AlexComponent` *should* implement `Parent` as a matter of proper style.
It doesn't in this example *only* to demonstrate that the code will compile and run without the interface.


</div>



{@a provideparent}


### `provideParent()` helper function

Writing variations of the same parent *alias provider* gets old quickly,
especially this awful mouthful with a [*forwardRef*](guide/dependency-injection-in-action#forwardref).

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="alex-providers" header="dependency-injection-in-action/src/app/parent-finder.component.ts" linenums="false">

</code-example>

You can extract that logic into a helper function like the following.

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="provide-the-parent" header="dependency-injection-in-action/src/app/parent-finder.component.ts" linenums="false">

</code-example>

Now you can add a simpler, more meaningful parent provider to your components.

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="alice-providers" header="dependency-injection-in-action/src/app/parent-finder.component.ts" linenums="false">

</code-example>


You can do better. The current version of the helper function can only alias the `Parent` class interface.
The application might have a variety of parent types, each with its own class interface token.

Here's a revised version that defaults to `parent` but also accepts an optional second parameter for a different parent class interface.

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="provide-parent" header="dependency-injection-in-action/src/app/parent-finder.component.ts" linenums="false">

</code-example>


And here's how you could use it with a different parent type.

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="beth-providers" header="dependency-injection-in-action/src/app/parent-finder.component.ts" linenums="false">

</code-example>

