<!--
# Services
-->
# 서비스

<!--
The Tour of Heroes `HeroesComponent` is currently getting and displaying fake data.

After the refactoring in this tutorial, `HeroesComponent` will be lean and focused on supporting the view.
It will also be easier to unit-test with a mock service.
-->
히어로들의 여행이 실행되는 `HeroesComponent`가 표시하는 데이터는 아직 가짜 데이터입니다.

이번 튜토리얼에서는 `HeroesComponent`는 화면을 표시하는 로직에만 집중하도록 가볍게 리팩토링해 봅시다.
이렇게 수정하면 목 서비스를 사용해서 컴포넌트에 유닛 테스트를 적용하기도 쉬워집니다.

<!--
## Why services
-->
## 왜 서비스를 사용할까요?

<!--
Components shouldn't fetch or save data directly and they certainly shouldn't knowingly present fake data.
They should focus on presenting data and delegate data access to a service.

In this tutorial, you'll create a `HeroService` that all application classes can use to get heroes.
Instead of creating that service with `new`, 
you'll rely on Angular [*dependency injection*](guide/dependency-injection) 
to inject it into the `HeroesComponent` constructor.
-->
컴포넌트는 데이터를 직접 가져오거나 직접 저장하도록 요청하지 않는 것이 좋습니다. 그리고 사용하는 데이터가 실제 데이터인지 가짜 데이터인지 알 필요도 없습니다.
컴포넌트는 데이터를 표시하는 것에만 집중하는 것이 좋으며, 데이터를 처리하는 로직은 서비스에게 맡겨두는 것이 좋습니다.

이 튜토리얼에서는 히어로의 데이터를 처리하는 `HeroService`를 만들어 봅니다.
그런데 이 서비스는 `new` 키워드로 인스턴스를 생성하지 않습니다.
이 서비스는 Angular가 제공하는 [*의존성 주입*](guide/dependency-injection) 메커니즘에 따라 `HeroesComponent`의 생성자로 주입될 것입니다.

<!--
Services are a great way to share information among classes that _don't know each other_.
You'll create a `MessageService` and inject it in two places:

1. in `HeroService` which uses the service to send a message.
2. in `MessagesComponent` which displays that message.
-->
여러 클래스에 사용되는 정보를 공유하려면 서비스를 사용하는 방법이 가장 좋습니다.
`MessageService`를 만들고 다음 두 곳에 이 서비스를 주입해서 활용해 봅시다:

1. `HeroService`가 메시지를 보낼 때 사용합니다.
2. 이 메시지는 `MessagesComponent`가 화면에 표시합니다.

<!--
## Create the _HeroService_
-->
## _HeroService_ 생성하기

<!--
Using the Angular CLI, create a service called `hero`.
-->
다음 명령을 실행해서 Angular CLI로 `hero` 서비스를 생성합니다.

<code-example language="sh" class="code-shell">
  ng generate service hero
</code-example>

<!--
The command generates skeleton `HeroService` class in `src/app/hero.service.ts`
The `HeroService` class should look like the following example.
-->
이 명령을 실행하면 `src/app/hero.service.ts` 파일에 `HeroService` 클래스가 생성됩니다.
Angular CLI가 만든 `HeroService` 클래스는 다음과 같습니다.

<!--
<code-example path="toh-pt4/src/app/hero.service.1.ts" region="new"
 header="src/app/hero.service.ts (new service)" linenums="false">
-->
<code-example path="toh-pt4/src/app/hero.service.1.ts" region="new"
 header="src/app/hero.service.ts (새로 만든 서비스)" linenums="false">
</code-example>

<!--
### _@Injectable()_ services
-->
### _@Injectable()_ 서비스

<!--
Notice that the new service imports the Angular `Injectable` symbol and annotates
the class with the `@Injectable()` decorator. This marks the class as one that participates in the _dependency injection system_. The `HeroService` class is going to provide an injectable service, and it can also have its own injected dependencies.
It doesn't have any dependencies yet, but [it will soon](#inject-message-service).

The `@Injectable()` decorator accepts a metadata object for the service, the same way the `@Component()` decorator did for your component classes. 
-->
Angular CLI로 만든 서비스는 `Injectable` 심볼을 로드해서 서비스 클래스 위에 `@Injectable()` 데코레이터로 사용되었습니다.
이 구문은 이 클래스가 _의존성 주입 시스템_ 에 포함되는 클래스라는 것을 선언하는 것입니다.
그래서 `HeroService` 클래스는 의존성으로 주입될 수 있으며 이 클래스도 의존성을 주입받을 수 있습니다.
아직까지는 이 클래스에 주입되는 의존성 객체가 없지만 [곧](#inject-message-service) 추가될 것입니다.

`@Injectable()` 데코레이터는 서비스를 정의하는 메타데이터 객체를 인자로 받습니다.
`@Component()` 데코레이터에 메타데이터를 사용했던 것과 같은 방식입니다.

<!--
### Get hero data
-->
### 히어로 데이터 가져오기

<!--
The `HeroService` could get hero data from anywhere&mdash;a web service, local storage, or a mock data source. 

Removing data access from components means you can change your mind about the implementation anytime, without touching any components.
They don't know how the service works.

The implementation in _this_ tutorial will continue to deliver _mock heroes_.

Import the `Hero` and `HEROES`.
-->
`HeroService`는 &mdash;웹 서비스나 로컬 스토리지, 목 데이터 소스&mdash; 어디에서든 히어로 데이터를 가져올 수 있습니다.

컴포넌트에서 데이터에 접근하는 로직을 제거하면 컴포넌트는 데이터를 표시하는 목적에만 집중할 수 있으며, 데이터를 가져오는 곳이 변경되더라도 컴포넌트가 이 내용을 신경쓰지 않아도 됩니다.

이 문서에서는 이전과 마찬가지로 _목 데이터_ 를 가져오도록 구현해 봅시다.

`Hero`와 `HEROES`를 로드합니다.

<code-example path="toh-pt4/src/app/hero.service.ts" region="import-heroes">
</code-example>

<!--
Add a `getHeroes` method to return the _mock heroes_.
-->
그리고 _목 히어로 데이터_ 를 반환하는 `getHeroes` 메소드를 추가합니다.

<code-example path="toh-pt4/src/app/hero.service.1.ts" region="getHeroes">
</code-example>

{@a provide}
<!--
## Provide the `HeroService`
-->
## `HeroService` 등록하기

<!--
You must make the `HeroService` available to the dependency injection system 
before Angular can _inject_ it into the `HeroesComponent`, 
as you will do [below](#inject). You do this by registering a _provider_. A provider is something that can create or deliver a service; in this case, it instantiates the `HeroService` class to provide the service.

Now, you need to make sure that the `HeroService` is registered as the provider of this service. 
You are registering it with an _injector_, which is the object that is responsible for choosing and injecting the provider where it is required. 
-->
`HeroService`를 의존성 주입 시스템에 사용하려면 Angular가 이 서비스를 `HeroesComponent`에 [_주입_](#inject) 할 수 있어야 합니다.
그래서 이 때 서비스에 대한 _프로바이더 (provider)_ 를 등록해야 합니다.
프로바이더는 서비스의 인스턴스를 생성하거나 어딘가에서 가져오는 역할을 합니다.
이 예제에서는 프로바이더가 `HeroService` 클래스의 인스턴스를 생성합니다.

그래서 `HeroService`는 프로바이더를 사용해서 등록해야 합니다.
프로바이더는 서비스를 _인젝터_ 에 등록하는데, 인젝터는 요청받은 객체를 확인하고 요청받은 곳에 의존성으로 주입하는 객체입니다.

<!--
By default, the Angular CLI command `ng generate service` registers a provider with the _root injector_ for your service by including provider metadata in the `@Injectable` decorator. 

If you look at the `@Injectable()` statement right before the `HeroService` class definition, you can see that the `providedIn` metadata value is 'root':    
-->
기본적으로 Angular CLI `ng generate service` 명령을 실행하면 새로 만드는 서비스를 _최상위 인젝터_ 에 등록하도록 `@Injectable()` 데코레이터가 생성됩니다.

그래서 방금 전에 만들었던 `HeroService` 클래스에 사용된 `@Injectable()` 구문을 살펴보면 `providedIn` 메타데이터의 값이 `root`로 지정된 것을 확인할 수 있습니다:

```
@Injectable({
  providedIn: 'root',
})
```

<!--
When you provide the service at the root level, Angular creates a single, shared instance of `HeroService` and injects into any class that asks for it. 
Registering the provider in the `@Injectable` metadata also allows Angular to optimize an app by removing the service if it turns out not to be used after all. 
-->
서비스가 최상위 인젝터에 등록되면 Angular는 `HeroService`의 인스턴스를 하나만 생성하며, 이 클래스가 주입되는 모든 곳에서 같은 인스턴스를 공유합니다.
그리고 `@Injectable()` 데코레이터는 이 데코레이터가 등록된 클래스가 실제로 사용되지 않으면 이 클래스를 최종 빌드 결과물에서 제거하는 대상으로 등록하는 역할도 합니다.

<div class="alert is-helpful">

<!--
To learn more about providers, see the [Providers section](guide/providers).
To learn more about injectors, see the [Dependency Injection guide](guide/dependency-injection).
-->
프로바이더에 대해 자세하게 알아보려면 [프로바이더](guide/providers) 문서를 참고하세요.
인젝터에 대해 자세하게 알아보려면 [Angular의 의존성 주입](guide/dependency-injection) 문서를 참고하세요.

</div>

<!--
The `HeroService` is now ready to plug into the `HeroesComponent`.
-->
`HeroService`는 이제 `HeroesComponent`에 주입할 준비가 되었습니다.

<div class="alert is-important">

<!--
This is an interim code sample that will allow you to provide and use the `HeroService`.  At this point, the code will differ from the `HeroService` in the ["final code review"](#final-code-review).
-->
지금까지 작성한 코드는 `HeroService`를 프로바이더로 등록하기 위한 임시 코드입니다.
[최종코드 리뷰](#final-code-review)와는 조금 다릅니다.

</div>

<!--
## Update `HeroesComponent`
-->
## `HeroesComponent` 수정하기

<!--
Open the `HeroesComponent` class file.

Delete the `HEROES` import, because you won't need that anymore.
Import the `HeroService` instead.
-->
`HeroesComponent` 클래스 파일을 엽니다.

이 파일에서 `HEROES`를 로드했던 부분을 삭제하고 `HeroService`를 로드합니다.

<!--
<code-example path="toh-pt4/src/app/heroes/heroes.component.ts" header="src/app/heroes/heroes.component.ts (import HeroService)" region="hero-service-import">
-->
<code-example path="toh-pt4/src/app/heroes/heroes.component.ts" header="src/app/heroes/heroes.component.ts (HeroService 로드하기)" region="hero-service-import">
</code-example>

<!--
Replace the definition of the `heroes` property with a simple declaration.
-->
그리고 `heroes` 프로퍼티 값을 할당하는 부분을 다음과 같이 수정합니다.

<code-example path="toh-pt4/src/app/heroes/heroes.component.ts" region="heroes">
</code-example>

{@a inject}

<!--
### Inject the `HeroService`
-->
### `HeroService` 주입하기

<!--
Add a private `heroService` parameter of type `HeroService` to the constructor.
-->
생성자에 `HeroService` 타입의 `heroService` 인자를 선언하고 이 인자를 `private`으로 지정합니다.

<code-example path="toh-pt4/src/app/heroes/heroes.component.ts" region="ctor">
</code-example>

<!--
The parameter simultaneously defines a private `heroService` property and identifies it as a `HeroService` injection site.

When Angular creates a `HeroesComponent`, the [Dependency Injection](guide/dependency-injection) system
sets the `heroService` parameter to the singleton instance of `HeroService`. 
-->
이렇게 작성하면 `heroService` 인자를 클래스 프로퍼티로 선언하면서 `HeroService` 타입의 의존성 객체가 주입되기를 요청한다는 것을 의미합니다.

그리고 Angular가 `HeroesComponent`를 생성할 때 [의존성 주입](guide/dependency-injection) 시스템이 `HeroService`의 인스턴스를 찾아서 `heroService` 라는 인자로 전달합니다.

<!--
### Add _getHeroes()_
-->
### _getHeroes()_ 추가하기

<!--
Create a function to retrieve the heroes from the service.
-->
이제 서비스에서 히어로 데이터를 전달하는 함수를 정의해 봅시다.

<code-example path="toh-pt4/src/app/heroes/heroes.component.1.ts" region="getHeroes">
</code-example>

{@a oninit}

<!--
### Call it in `ngOnInit`
-->
### `ngOnInit`에서 서비스 호출하기

<!--
While you could call `getHeroes()` in the constructor, that's not the best practice.

Reserve the constructor for simple initialization such as wiring constructor parameters to properties.
The constructor shouldn't _do anything_.
It certainly shouldn't call a function that makes HTTP requests to a remote server as a _real_ data service would.

Instead, call `getHeroes()` inside the [*ngOnInit lifecycle hook*](guide/lifecycle-hooks) and
let Angular call `ngOnInit` at an appropriate time _after_ constructing a `HeroesComponent` instance.
-->
서비스에 구현한 `getHeroes()` 함수는 컴포넌트 클래스에서도 호출할 수 있지만, 이 방법은 외선이 아닙니다.

컴포넌트의 생성자는 생성자로 받은 인자를 클래스 프로퍼티로 연결하는 정도로 간단하게 유지하는 것이 좋습니다.
생성자에는 이 외의 로직이 _들어가지 않는 것이 좋습니다_.
리모트 서버로 HTTP 요청을 보내는 로직도 물론 들어가지 않는 것이 좋습니다.

`getHeroes()` 함수는 [*ngOnInit 라이프싸이클 후킹 함수*](guide/lifecycle-hooks)에서 실행하는 것이 좋습니다.
`ngOnInit` 함수는 Angular가 `HeroesComponent`의 인스턴스를 생성한 _직후에_ 실행되는 함수입니다.

<code-example path="toh-pt4/src/app/heroes/heroes.component.ts" region="ng-on-init">
</code-example>

<!--
### See it run
-->
### 동작 확인하기

<!--
After the browser refreshes, the app should run as before, 
showing a list of heroes and a hero detail view when you click on a hero name.
-->
브라우저가 갱신되고 나면 앱이 이전과 같이 동작할 것입니다.
화면에 히어로의 목록이 표시되고, 사용자가 히어로 중 하나의 이름을 클릭하면 해당 히어로의 상세정보도 화면에 표시됩니다.

## Observable data

The `HeroService.getHeroes()` method has a _synchronous signature_,
which implies that the `HeroService` can fetch heroes synchronously.
The `HeroesComponent` consumes the `getHeroes()` result 
as if heroes could be fetched synchronously.

<code-example path="toh-pt4/src/app/heroes/heroes.component.1.ts" region="get-heroes">
</code-example>

This will not work in a real app.
You're getting away with it now because the service currently returns _mock heroes_.
But soon the app will fetch heroes from a remote server, 
which is an inherently _asynchronous_ operation.

The `HeroService` must wait for the server to respond,
`getHeroes()` cannot return immediately with hero data,
and the browser will not block while the service waits.

`HeroService.getHeroes()` must have an _asynchronous signature_ of some kind.

It can take a callback. It could return a `Promise`. It could return an `Observable`.

In this tutorial, `HeroService.getHeroes()` will return an `Observable`
in part because it will eventually use the Angular `HttpClient.get` method to fetch the heroes
and [`HttpClient.get()` returns an `Observable`](guide/http).

### Observable _HeroService_

`Observable` is one of the key classes in the [RxJS library](http://reactivex.io/rxjs/).

In a [later tutorial on HTTP](tutorial/toh-pt6), you'll learn that Angular's `HttpClient` methods return RxJS `Observable`s.
In this tutorial, you'll simulate getting data from the server with the RxJS `of()` function.

Open the `HeroService` file and import the `Observable` and `of` symbols from RxJS.

<code-example path="toh-pt4/src/app/hero.service.ts" 
header="src/app/hero.service.ts (Observable imports)" region="import-observable">
</code-example>

Replace the `getHeroes` method with this one.

<code-example path="toh-pt4/src/app/hero.service.ts" region="getHeroes-1"></code-example>

`of(HEROES)` returns an `Observable<Hero[]>` that emits  _a single value_, the array of mock heroes.

<div class="alert is-helpful">

In the [HTTP tutorial](tutorial/toh-pt6), you'll call `HttpClient.get<Hero[]>()` which also returns an `Observable<Hero[]>` that emits  _a single value_, an array of heroes from the body of the HTTP response.

</div>

### Subscribe in _HeroesComponent_

The `HeroService.getHeroes` method used to return a `Hero[]`.
Now it returns an `Observable<Hero[]>`.

You'll have to adjust to that difference in `HeroesComponent`.

Find the `getHeroes` method and replace it with the following code
(shown side-by-side with the previous version for comparison)

<code-tabs>

  <code-pane header="heroes.component.ts (Observable)" 
    path="toh-pt4/src/app/heroes/heroes.component.ts" region="getHeroes">
  </code-pane>

  <code-pane header="heroes.component.ts (Original)" 
    path="toh-pt4/src/app/heroes/heroes.component.1.ts" region="getHeroes">
  </code-pane>

</code-tabs>

`Observable.subscribe()` is the critical difference.

The previous version assigns an array of heroes to the component's `heroes` property.
The assignment occurs _synchronously_, as if the server could return heroes instantly
or the browser could freeze the UI while it waited for the server's response.

That _won't work_ when the `HeroService` is actually making requests of a remote server.

The new version waits for the `Observable` to emit the array of heroes&mdash; 
which could happen now or several minutes from now.
Then `subscribe` passes the emitted array to the callback,
which sets the component's `heroes` property.

This asynchronous approach _will work_ when
the `HeroService` requests heroes from the server.

## Show messages

In this section you will 

* add a `MessagesComponent` that displays app messages at the bottom of the screen.
* create an injectable, app-wide `MessageService` for sending messages to be displayed
* inject `MessageService` into the `HeroService`
* display a message when `HeroService` fetches heroes successfully.

### Create _MessagesComponent_

Use the CLI to create the `MessagesComponent`.

<code-example language="sh" class="code-shell">
  ng generate component messages
</code-example>

The CLI creates the component files in the `src/app/messages` folder and declare `MessagesComponent` in `AppModule`.

Modify the `AppComponent` template to display the generated `MessagesComponent`

<code-example
  header = "/src/app/app.component.html"
  path="toh-pt4/src/app/app.component.html">
</code-example>

You should see the default paragraph from `MessagesComponent` at the bottom of the page.

### Create the _MessageService_

Use the CLI to create the `MessageService` in `src/app`. 

<code-example language="sh" class="code-shell">
  ng generate service message
</code-example>

Open `MessageService` and replace its contents with the following.

<code-example
  header = "/src/app/message.service.ts"
  path="toh-pt4/src/app/message.service.ts">
</code-example>

The service exposes its cache of `messages` and two methods: one to `add()` a message to the cache and another to `clear()` the cache.

{@a inject-message-service}
### Inject it into the `HeroService`

Re-open the `HeroService` and import the `MessageService`.

<code-example
  header = "/src/app/hero.service.ts (import MessageService)"
  path="toh-pt4/src/app/hero.service.ts" region="import-message-service">
</code-example>

Modify the constructor with a parameter that declares a private `messageService` property.
Angular will inject the singleton `MessageService` into that property 
when it creates the `HeroService`.

<code-example
  path="toh-pt4/src/app/hero.service.ts" region="ctor">
</code-example>

<div class="alert is-helpful">

This is a typical "*service-in-service*" scenario:
you inject the `MessageService` into the `HeroService` which is injected into the `HeroesComponent`.

</div>

### Send a message from `HeroService`

Modify the `getHeroes` method to send a message when the heroes are fetched.

<code-example path="toh-pt4/src/app/hero.service.ts" region="getHeroes">
</code-example>

### Display the message from `HeroService`

The `MessagesComponent` should display all messages, 
including the message sent by the `HeroService` when it fetches heroes.

Open `MessagesComponent` and import the `MessageService`.

<code-example
  header = "/src/app/messages/messages.component.ts (import MessageService)"
  path="toh-pt4/src/app/messages/messages.component.ts" region="import-message-service">
</code-example>

Modify the constructor with a parameter that declares a **public** `messageService` property.
Angular will inject the singleton `MessageService` into that property 
when it creates the `MessagesComponent`.

<code-example
  path="toh-pt4/src/app/messages/messages.component.ts" region="ctor">
</code-example>

The `messageService` property **must be public** because you're about to bind to it in the template.

<div class="alert is-important">

Angular only binds to _public_ component properties.

</div>

### Bind to the _MessageService_

Replace the CLI-generated `MessagesComponent` template with the following.

<code-example
  header = "src/app/messages/messages.component.html"
  path="toh-pt4/src/app/messages/messages.component.html">
</code-example>

This template binds directly to the component's `messageService`.

* The `*ngIf` only displays the messages area if there are messages to show.


* An `*ngFor` presents the list of messages in repeated `<div>` elements.


<!--
* An Angular [event binding](guide/template-syntax#event-binding) binds the button's click event
to `MessageService.clear()`.
-->
* An Angular [이벤트 바인딩](guide/template-syntax#이벤트-바인딩) binds the button's click event
to `MessageService.clear()`.

The messages will look better when you add the private CSS styles to `messages.component.css`
as listed in one of the ["final code review"](#final-code-review) tabs below.

The browser refreshes and the page displays the list of heroes.
Scroll to the bottom to see the message from the `HeroService` in the message area.
Click the "clear" button and the message area disappears.

{@a final-code-review}

## Final code review

Here are the code files discussed on this page and your app should look like this <live-example></live-example>.

<code-tabs>

  <code-pane header="src/app/hero.service.ts" 
  path="toh-pt4/src/app/hero.service.ts">
  </code-pane>

  <code-pane header="src/app/message.service.ts" 
  path="toh-pt4/src/app/message.service.ts">
  </code-pane>

  <code-pane header="src/app/heroes/heroes.component.ts"
  path="toh-pt4/src/app/heroes/heroes.component.ts">
  </code-pane>

  <code-pane header="src/app/messages/messages.component.ts"
  path="toh-pt4/src/app/messages/messages.component.ts">
  </code-pane>

  <code-pane header="src/app/messages/messages.component.html"
  path="toh-pt4/src/app/messages/messages.component.html">
  </code-pane>

  <code-pane header="src/app/messages/messages.component.css"
  path="toh-pt4/src/app/messages/messages.component.css">
  </code-pane>

  <code-pane header="src/app/app.module.ts"
  path="toh-pt4/src/app/app.module.ts">
  </code-pane>

  <code-pane header="src/app/app.component.html"
  path="toh-pt4/src/app/app.component.html">
  </code-pane>

</code-tabs>

## Summary

* You refactored data access to the `HeroService` class.
* You registered the `HeroService` as the _provider_ of its service at the root level so that it can be injected anywhere in the app.
* You used [Angular Dependency Injection](guide/dependency-injection) to inject it into a component.
* You gave the `HeroService` _get data_ method an asynchronous signature.
* You discovered `Observable` and the RxJS _Observable_ library.
* You used RxJS `of()` to return an observable of mock heroes (`Observable<Hero[]>`).
* The component's `ngOnInit` lifecycle hook calls the `HeroService` method, not the constructor.
* You created a `MessageService` for loosely-coupled communication between classes.
* The `HeroService` injected into a component is created with another injected service,
 `MessageService`.
