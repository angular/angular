<!--
# The Dependency Injection pattern
-->
# 의존성 주입 패턴

<!--
**Dependency injection** is an important application design pattern.
It's used so widely that almost everyone just calls it _DI_.
-->
**의존성 주입(Dependency injection)** 패턴은 애플리케이션 개발에 널리 사용되고 중요한 디자인 패턴이며, 짧게 줄여서 _DI_ 라고도 합니다.

<!--
Angular has its own dependency injection framework, and
you really can't build an Angular application without it.
-->
이 의존성 주입 패턴은 Angular 프레임워크 내부에도 구현되어 있으며, 이 의존성 주입 프레임워크 없이 Angular 애플리케이션을 구현하는 것은 거의 불가능합니다.

<!--
This page covers what DI is and why it's useful.
-->
이 문서에서는 DI가 무엇인지, 왜 DI를 사용하면 어떤 점이 좋은지 설명합니다.

<!--
When you've learned the general pattern, you're ready to turn to
the [Angular Dependency Injection](guide/dependency-injection) guide to see how it works in an Angular app.
-->
DI에 대한 일반적인 내용을 이해하고 나면 Angular 애플리케이션에서는 [의존성 주입](guide/dependency-injection)이 어떤식으로 이루어지는지 확인해보는 것도 좋습니다.

{@a why-di }

<!--
## Why dependency injection?
-->
## 왜 의존성 주입을 사용할까?

<!--
To understand why dependency injection is so important, consider an example without it.
Imagine writing the following code:
-->
의존성 주입이 왜 중요한지 이해하기 위해 의존성 주입을 사용하지 않는 방식을 먼저 확인해 봅시다:

<!--
<code-example path="dependency-injection/src/app/car/car-no-di.ts" region="car" title="src/app/car/car.ts (without DI)">
</code-example>
-->
<code-example path="dependency-injection/src/app/car/car-no-di.ts" region="car" title="src/app/car/car.ts (DI를 사용하지 않는 경우)">
</code-example>

<!--
The `Car` class creates everything it needs inside its constructor.
What's the problem?
The problem is that the `Car` class is brittle, inflexible, and hard to test.
-->
이 코드는 Car 클래스에서 사용하는 인스턴스를 생성자 안에서 모두 초기화합니다.
그러면 어떤 문제가 있을까요?
`Car` 클래스의 구성요소는 코드에 고정되어 있기 때문에 변경하기 어려우며, 테스트하기도 어렵습니다.

<!--
This `Car` needs an engine and tires. Instead of asking for them,
the `Car` constructor instantiates its own copies from
the very specific classes `Engine` and `Tires`.
-->
이 `Car` 클래스에는 엔진과 타이어가 필요한데, 이 인스턴스들을 다른곳에서 가져오지 않고 생성자에서 `Engine` 클래스와 `Tires` 클래스의 인스턴스를 직접 생성하고 있습니다.

<!--
What if the `Engine` class evolves and its constructor requires a parameter?
That would break the `Car` class and it would stay broken until you rewrote it along the lines of
`this.engine = new Engine(theNewParameter)`.
The `Engine` constructor parameters weren't even a consideration when you first wrote `Car`.
You may not anticipate them even now.
But you'll *have* to start caring because
when the definition of `Engine` changes, the `Car` class must change.
That makes `Car` brittle.
-->
그런데 `Engine` 클래스 생성자에 인자가 필요하도록 변경된다면 어떻게 될까요? 그러면 이 코드에 문법 오류가 발생하며, `this.engine = new Engine(hteNewParameter)`와 같이 수정하지 않는다면 코드도 제대로 동작하지 않을 것 입니다.
게다가 `Engine` 생성자에 사용하는 인자는 `Car`의 입장에서는 고려할 필요가 없는 문제일 수 있으며, `Car` 클래스가 생성되는 시점에 정해지지 않을 수도 있습니다.
하지만 지금과 같은 구조라면 `Engine` 클래스가 정의된 것이 변경될 때마다 `Car` 클래스도 반드시 수정되어야 합니다.
따라서 `Car` 클래스의 유연성이 떨어집니다.

<!--
What if you want to put a different brand of tires on your `Car`? Too bad.
You're locked into whatever brand the `Tires` class creates. That makes the
`Car` class inflexible.
-->
`Car` 클래스에서 사용하는 타이어가 여러 종류라면 어떻게 될까요? 맙소사. 그러면 다양한 종류의 `Tires` 클래스를 어떻게 구현하는지 모두 알아야 합니다. 이것도 `Car` 클래스의 유연성을 떨어뜨리는 문제점입니다.

<!--
Right now each new car gets its own `engine`. It can't share an `engine` with other cars.
While that makes sense for an automobile engine,
surely you can think of other dependencies that should be shared, such as the onboard
wireless connection to the manufacturer's service center. This `Car` lacks the flexibility
to share services that have been created previously for other consumers.
-->
지금 코드에서는 개별 차마다 `engine` 프로퍼티가 존재하며, 이 프로퍼티를 다른 인스턴스와 공유하지 않습니다. 실제 자동차를 생각해봐도 엔진을 공유하는 일은 없기 때문에 이 구현이 잘못된 것은 아닙니다. 하지만 자동차 정비소에서 엔진을 점검할 때를 대비해서 `Engine` 클래스를 생성하면서 어떤 서비스를 주입하고, 이 서비스를 공유해야 한다면 어떨까요? 지금 구현한 `Car` 클래스는 이 기능이 없습니다. `Car` 클래스에서 `Engine`을 생성하는 코드는 고정되어 있기 때문에 추가 인자를 전달할 수도 없습니다. 이 문제도 `Car` 클래스의 유연성을 떨어뜨립니다.

<!--
When you write tests for `Car` you're at the mercy of its hidden dependencies.
Is it even possible to create a new `Engine` in a test environment?
What does `Engine` depend upon? What does that dependency depend on?
Will a new instance of `Engine` make an asynchronous call to the server?
You certainly don't want that going on during tests.
-->
`Car` 클래스를 테스트할 때는 이 클래스의 감춰진 의존성들도 모두 준비할 수 밖에 없습니다. 하지만 테스트 환경에서 `Engine` 인스턴스를 생성할 수 있도록 준비하는 것이 꼭 필요할까요? `Engine` 인스턴스를 생성하기 위해 필요한 것이 어떤 것인지 알아야 할까요? `Engine` 클래스는 또 어떤 클래스에 의존성이 있을까요? 혹시 `Engine` 인스턴스를 생성할 때 비동기 서버 통신이 필요한 것은 아닐까요? `Car` 클래스를 테스트하면서 `Car` 클래스 이외의 부분도 고려해야 하는 것은 너무 머리 아픈 일입니다.

<!--
What if the `Car` should flash a warning signal when tire pressure is low?
How do you confirm that it actually does flash a warning
if you can't swap in low-pressure tires during the test?
-->
`Car` 클래스를 테스트하던 도중에 타이어 저압 경고등이 켜진다면 어떻게 해야할까요? 테스트 중에는 이 경고 메시지가 문제되지 않으니 그냥 진행해도 될까요?

<!--
You have no control over the car's hidden dependencies.
When you can't control the dependencies, a class becomes difficult to test.
-->
게다가 이 코드에서는 `Car` 클래스의 감춰진 의존성에 접근할 수도 없습니다. 의존성 클래스에 접근할 수 있도록 코드를 수정한다면 테스트하기 더 힘들어 질 뿐입니다.

<!--
How can you make `Car` more robust, flexible, and testable?
-->
`Car` 클래스를 좀 더 유연하게, 테스트하기 편하게 만들려면 어떻게 해야 할까요?

{@a ctor-injection}
<!--
That's super easy. Change the `Car` constructor to a version with DI:
-->
해결 방법은 아주 간단합니다. `Car` 생성자에 의존성 주입 패턴을 도입하면 됩니다:

<code-tabs>

  <!--
  <code-pane title="src/app/car/car.ts (excerpt with DI)" path="dependency-injection/src/app/car/car.ts" region="car-ctor">
  -->
  <code-pane title="src/app/car/car.ts (DI를 사용하는 경우)" path="dependency-injection/src/app/car/car.ts" region="car-ctor">
  </code-pane>

  <!--
  <code-pane title="src/app/car/car.ts (excerpt without DI)" path="dependency-injection/src/app/car/car-no-di.ts" region="car-ctor">
  -->
  <code-pane title="src/app/car/car.ts (DI를 사용하지 않는 경우)" path="dependency-injection/src/app/car/car-no-di.ts" region="car-ctor">
  </code-pane>

</code-tabs>

<!--
See what happened? The definition of the dependencies are
now in the constructor.
The `Car` class no longer creates an `engine` or `tires`.
It just consumes them.
-->
어떤 점이 달라졌을까요? 의존성 객체를 생성하던 코드는 이제 생성자의 인자로 옮겨졌습니다. `Car` 클래스는 더이상 `engine`과 `tires` 프로퍼티를 직접 초기화하지 않습니다. 단지 이용하기만 할 뿐입니다.

<div class="alert is-helpful">

<!--
This example leverages TypeScript's constructor syntax for declaring
parameters and properties simultaneously.
-->
생성자로 인자를 받으면서 클래스 프로퍼티로 선언하는 코드는 TypeScript 문법입니다.

</div>

<!--
Now you can create a car by passing the engine and tires to the constructor.
-->
그러면 이제 `Car` 클래스는 다음과 같이 생성할 수 있습니다. `Engine`과 `Tires` 클래스는 `Car` 클래스와 별개로 생성되며 `Car` 클래스의 생성자로 전달될 뿐 입니다.

<code-example path="dependency-injection/src/app/car/car-creations.ts" region="car-ctor-instantiation" linenums="false">
</code-example>

<!--
How cool is that?
The definition of the `engine` and `tire` dependencies are
decoupled from the `Car` class.
You can pass in any kind of `engine` or `tires` you like, as long as they
conform to the general API requirements of an `engine` or `tires`.
-->
훨씬 낫지 않나요? 이제 `Engine` 클래스와 `Tires` 클래스를 정의하는 코드는 `Car` 클래스와 분리되었습니다. 이제 `Engine` 클래스와 `Tires` 클래스의 API와 호환되기만 한다면 `Car` 클래스의 인스턴스를 생성할 때 자유롭게 사용할 수 있습니다.

<!--
Now, if someone extends the `Engine` class, that is not `Car`'s problem.
-->
이제 누군가가 `Engine` 클래스를 확장한다고 해도, `Car` 클래스가 신경쓸 필요는 없습니다.

<div class="alert is-helpful">

<!--
The _consumer_ of `Car` has the problem. The consumer must update the car creation code to
something like this:
-->
`Car` 클래스의 인스턴스를 _생성하는 쪽_ 에서는 이 부분을 처리해야 합니다. `Car` 클래스의 `engine`에 해당하는 내용이 변경되면 코드를 다음과 같은 방식으로 수정해야 합니다:

<code-example path="dependency-injection/src/app/car/car-creations.ts" region="car-ctor-instantiation-with-param" linenums="false">

</code-example>

<!--
The critical point is this: the `Car` class did not have to change.
You'll take care of the consumer's problem shortly.
-->
이렇게 수정하더라도 `Car` 클래스의 코드는 변경되지 않는다는 것이 요점입니다.

</div>

<!--
The `Car` class is much easier to test now because you are in complete control
of its dependencies.
You can pass mocks to the constructor that do exactly what you want them to do
during each test:
-->
그리고 `Car` 클래스의 의존성은 모두 외부에서 컨트롤할 수 있기 때문에 테스트하기도 편해졌습니다. 이제는 테스트에 필요한 내용만 구현한 목 인스턴스를 사용할 수도 있습니다:

<code-example path="dependency-injection/src/app/car/car-creations.ts" region="car-ctor-instantiation-with-mocks" linenums="false">
</code-example>

<!--
**You just learned what dependency injection is**.
-->
**지금까지 다룬 내용이 의존성 주입 패턴입니다**.

<!--
It's a coding pattern in which a class receives its dependencies from external
sources rather than creating them itself.
-->
의존성 주입 패턴은 클래스에 필요한 의존성들을 클래스 안쪽에서 직접 생성하지 않고 외부에서 받아서 사용하는 방식입니다.

<!--
Cool! But what about that poor consumer?
Anyone who wants a `Car` must now
create all three parts: the `Car`, `Engine`, and `Tires`.
The `Car` class shed its problems at the consumer's expense.
You need something that takes care of assembling these parts.
-->
좋네요! 하지만 `Car` 클래스를 사용하는 쪽에서는 어떨까요? `Car` 인스턴스를 생성하는 쪽에서는 `Car`와 `Engine`, `Tires` 클래스 인스턴스를 모두 생성해야 합니다. 따라서 `Car` 클래스가 갖고 있던 부담은 `Car` 클래스를 생성하는 쪽으로 옮겨가며, `Car` 인스턴스를 조합하는 방식에 대해서도 알아야 합니다.

<!--
You _could_ write a giant class to do that:
-->
그렇다면 이런 코드를 생각해 볼수도 있습니다:

<code-example path="dependency-injection/src/app/car/car-factory.ts" title="src/app/car/car-factory.ts">
</code-example>

<!--
It's not so bad now with only three creation methods.
But maintaining it will be hairy as the application grows.
This factory is going to become a huge spiderweb of
interdependent factory methods!
-->
아직까지는 인스턴스 생성과 관련된 메소드 3개만 있기 때문에 크게 나빠보이지 않습니다. 하지만 애플리케이션이 커지면 이 클래스의 내용은 급격하게 복잡해질 것이고, 의존성이 추가될 때마다 새로운 메소드를 계속 정의해야 합니다!

<!--
Wouldn't it be nice if you could simply list the things you want to build without
having to define which dependency gets injected into what?
-->
의존성 객체가 무엇이든, 외부에서 전달하는 인스턴스를 그대로 받아서 사용하는 것이 좀 더 간단하지 않을까요?

<!--
This is where the dependency injection framework comes into play.
Imagine the framework had something called an _injector_.
You register some classes with this injector, and it figures out how to create them.
-->
그래서 의존성 주입 프레임워크가 등장하게 되었습니다. 지금까지 설명했던 내용은 이제 _인젝터(Injector)_ 라고 하는 객체가 대신 수행합니다. 이제는 인젝터에 어떤 클래스가 의존성으로 사용되고, 이 클래스 인스턴스를 어떻게 생성하는지만 알려주면 됩니다.

<!--
When you need a `Car`, you simply ask the injector to get it for you and you're good to go.
-->
그래서 `Car` 클래스의 인스턴스가 필요하다면 인젝터에게 다음과 같이 요청하기만 하면 됩니다.

<code-example path="dependency-injection/src/app/car/car-injector.ts" region="injector-call" title="src/app/car/car-injector.ts" linenums="false">
</code-example>

<!--
Everyone wins. The `Car` knows nothing about creating an `Engine` or `Tires`.
The consumer knows nothing about creating a `Car`.
You don't have a gigantic factory class to maintain.
Both `Car` and consumer simply ask for what they need and the injector delivers.
-->
모두 것이 편해졌습니다. `Car` 클래스는 이제 `Engine`과 `Tires` 인스턴스를 어떻게 생성해야 하는지 알 필요가 없습니다. 그리고 `Car` 클래스를 생성하는 쪽도 `Car` 인스턴스를 어떻게 생성해야 하는지 알 필요 없습니다. 유지보수하기 힘든 팩토리 클래스도 필요 없습니다. 클래스 인스턴스가 필요한 쪽에서 인젝터에게 요청하기만 하면 됩니다.

<!--
This is what a **dependency injection framework** is all about.
-->
**의존성 주입 프레임워크**가 하는 역할은 이것이 전부입니다.

<!--
Now that you know what dependency injection is and appreciate its benefits,
turn to the [Angular Dependency Injection](guide/dependency-injection) guide to see how it is implemented in Angular.
-->
이제는 의존성 주입이 무엇인지 알았으니, 의존성 주입 프레임워크를 어떻게 활용하면 되는 지만 알면 됩니다. 이 내용은 [Angular의 의존성 주입](guide/dependency-injection) 문서에서 계속 설명합니다.