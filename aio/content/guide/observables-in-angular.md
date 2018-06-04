<!--
# Observables in Angular
-->
# Angular에서 옵저버블 활용하기

<!--
Angular makes use of observables as an interface to handle a variety of common asynchronous operations. For example:
-->
Angular는 비동기 로직을 처리할 때 옵저버블을 다양하게 사용합니다. 몇 가지 예를 들면 다음과 같은 경우에 옵저버블을 사용합니다:

<!--
* The `EventEmitter` class extends `Observable`.
* The HTTP module uses observables to handle AJAX requests and responses.
* The Router and Forms modules use observables to listen for and respond to user-input events.
-->
* `Observable` 클래스를 상속해서 `EventEmitter` 클래스를 제공합니다.
* HTTP 모듈이 AJAX 요청을 보내거나 응답을 받아 처리할 때 옵저버블을 사용합니다.
* 라우터와 폼 모듈이 사용자 입력 이벤트를 감지할 때 옵저버블을 사용합니다. 

<!--
## Event emitter
-->
## 이벤트 이미터 (Event Emitter)

<!--
Angular provides an `EventEmitter` class that is used when publishing values from a component through the `@Output()` decorator. `EventEmitter` extends `Observable`, adding an `emit()` method so it can send arbitrary values. When you call `emit()`, it passes the emitted value to the `next()` method of any subscribed observer.
-->
`EventEmitter` 클래스는 컴포넌트에서 `@Output` 데코레이터로 지정된 프로퍼티가 컴포넌트 외부로 데이터를 보낼 때 사용합니다. 이 클래스는 `Observable` 클래스를 상속받아 구현되었으며, 데이터를 보내는 함수로 `emit()` 메소드를 제공합니다. `emit()`을 실행하면서 전달한 인자는 옵저버블의 `next()` 메소드로 전달됩니다.

<!--
A good example of usage can be found on the [EventEmitter](https://angular.io/api/core/EventEmitter) documentation. Here is the example component that listens for open and close events:
-->
`EventEmitter` 클래스를 사용하는 방법은 [EventEmitter](https://angular.io/api/core/EventEmitter) 문서에서 확인할 수 있습니다. 이 예제는 컴포넌트의 `open` 이벤트와 `close` 이벤트를 감지합니다.

`<zippy (open)="onOpen($event)" (close)="onClose($event)"></zippy>`

<!--
Here is the component definition:
-->
그리고 이벤트를 보내는 컴포넌트는 다음과 같이 정의되어 있습니다:

<code-example path="observables-in-angular/src/main.ts" title="EventEmitter" region="eventemitter"></code-example>

## HTTP

<!--
Angular’s `HttpClient` returns observables from HTTP method calls. For instance, `http.get(‘/api’)` returns an observable. This provides several advantages over promise-based HTTP APIs:
-->
Angular에서 제공하는 `HttpClient`는 HTTP 요청 결과를 옵저버블로 반환합니다. 그래서 `http.get(‘/api’)`를 실행한 결과도 옵저버블입니다. 옵저버블을 사용하는 방식은 Promise를 사용하는 방식과 비교했을 때 더 좋은 점이 몇가지 있습니다:

<!--
* Observables do not mutate the server response (as can occur through chained `.then()` calls on promises). Instead, you can use a series of operators to transform values as needed.
* HTTP requests are cancellable through the `unsubscribe()` method.
* Requests can be configured to get progress event updates.
* Failed requests can be retried easily.
-->
* 옵저버블은 서버에서 받은 응답을 다른 객체로 변환하지 않습니다. Promise를 사용하면 `.then()`으로 체이닝 할때마다 새로운 객체가 생성되던 것과는 다릅니다. 대신, 옵저버블은 연산자를 사용해서 옵저버블의 모양을 조작합니다.
* `unsubscribe()` 메소드를 실행하면 아직 완료되지 않은 HTTP 요청을 취소할 수 있습니다.
* 서버의 응답 진행률을 확인할 수 있습니다.
* 실패한 요청을 재시도하는 것도 간단합니다.

<!--
## Async pipe
-->
## Async 파이프

<!--
The [AsyncPipe](https://angular.io/api/common/AsyncPipe) subscribes to an observable or promise and returns the latest value it has emitted. When a new value is emitted, the pipe marks the component to be checked for changes.
-->
[AsyncPipe](https://angular.io/api/common/AsyncPipe)는 옵저버블이나 Promise를 구독하고, 이 객체가 담고 있는 마지막 값을 반환합니다. 그리고 새로운 값이 전달되면 컴포넌트가 변화를 감지하도록 알립니다.

<!--
The following example binds the `time` observable to the component's view. The observable continuously updates the view with the current time.
-->
아래 예제는 컴포넌트의 뷰에서 옵저버블 타입인 `time` 프로퍼티를 바인딩하는 예제입니다. 이 옵저버블은 컴포넌트에서 새로운 스트림을 생성할 때마다 계속 갱신됩니다.

<code-example path="observables-in-angular/src/main.ts" title="Using async pipe" region="pipe"></code-example>

## Router

<!--
[`Router.events`](https://angular.io/api/router/Router#events) provides events as observables. You can use the `filter()` operator from RxJS to look for events of interest, and subscribe to them in order to make decisions based on the sequence of events in the navigation process. Here's an example:
-->
[`Router.events`](https://angular.io/api/router/Router#events)는 라우팅 이벤트를 옵저버블로 전달합니다. 이 중 필요한 이벤트만 처리하려면 RxJS에서 제공하는 `filter()` 연산자를 사용할 수 있으며, 이 프로퍼티를 구독하면 네비게이션 진행상황에 맞게 이벤트를 처리할 수 있습니다.

<code-example path="observables-in-angular/src/main.ts" title="Router events" region="router"></code-example>

<!--
The [ActivatedRoute](https://angular.io/api/router/ActivatedRoute) is an injected router service that makes use of observables to get information about a route path and parameters. For example, `ActivateRoute.url` contains an observable that reports the route path or paths. Here's an example:
-->
[ActivatedRoute](https://angular.io/api/router/ActivatedRoute)도 현재 라우팅 경로나 라우팅 인자를 옵저버블로 제공합니다. 그래서 이 서비스의 프로퍼티 중 `ActivateRoute.url`를 구독해도 현재 라우팅 경로를 확인할 수 있습니다.  예제를 봅시다:

<code-example path="observables-in-angular/src/main.ts" title="ActivatedRoute" region="activated_route"></code-example>

<!--
## Reactive forms
-->
## 반응형 폼

<!--
Reactive forms have properties that use observables to monitor form control values. The [`FormControl`](https://angular.io/api/forms/FormControl) properties `valueChanges` and `statusChanges` contain observables that raise change events. Subscribing to an observable form-control property is a way of triggering application logic within the component class. For example:
-->
반응형 폼에서 폼 컨트롤의 값을 추적할 때도 옵저버블을 사용할 수 있습니다. 예를 들면 [`FormControl`](https://angular.io/api/forms/FormControl)의 프로퍼티 중 `valueChanges`와 `statusChanges`를 구독하면 폼 컨트롤의 값과 상태가 변하는 것을 확인할 수 있습니다. 폼 컨트롤의 옵저버블 프로퍼티를 구독하면 컴포넌트 클래스에서 애플리케이션 로직을 자유롭게 작성할 수 있습니다.
예제 코드를 봅시다:

<code-example path="observables-in-angular/src/main.ts" title="Reactive forms" region="forms"></code-example>
