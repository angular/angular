<!--
# The RxJS library
-->
# RxJS 라이브러리

<!--
Reactive programming is an asynchronous programming paradigm concerned with data streams and the propagation of change ([Wikipedia](https://en.wikipedia.org/wiki/Reactive_programming)). RxJS (Reactive Extensions for JavaScript) is a library for reactive programming using observables that makes it easier to compose asynchronous or callback-based code ([RxJS Docs](http://reactivex.io/rxjs/)).
-->
반응형 프로그래밍은 비동기 프로그래밍 패러다임중 하나로, 데이터 스트림과 데이터의 변화를 감지하는 것에 집중하는  패러다임입니다 ([Wikipedia](https://en.wikipedia.org/wiki/Reactive_programming)).
RxJS(Reactive Extensions for JavaScript)는 옵저버블을 활용해서 이 패러다임을 구현할 수 있도록 돕는 JavaScript 라이브러리입니다 ([RxJS Docs](http://reactivex.io/rxjs/)).

<!--
RxJS provides an implementation of the `Observable` type, which is needed until the type becomes part of the language and until browsers support it. The library also provides utility functions for creating and working with observables. These utility functions can be used for:
-->
아직까지 JavaScript와 브라우저는 옵저버블을 정식으로 지원하지 않습니다. 그래서 RxJS는 `Observable` 타입의 구현체를 라이브러리로 제공하며, 옵저버블을 생성하거나 활용하는 함수들도 함께 제공합니다.
이 함수들은 다음과 같은 용도로 사용합니다:

<!--
* Converting existing code for async operations into observables
* Iterating through the values in a stream
* Mapping values to different types
* Filtering streams
* Composing multiple streams
-->
* 비동기 코드를 옵저버블로 변환할 때
* 이터러블 객체를 순회하면서 스트림으로 변환할 때
* 데이터를 다른 타입으로 변환할 때
* 스트림 일부만 필터링할 때
* 여러 스트림을 하나로 합쳐서 처리할 때

<!--
## Observable creation functions
-->
## 옵저버블 생성 함수

<!--
RxJS offers a number of functions that can be used to create new observables. These functions can simplify the process of creating observables from things such as events, timers, promises, and so on. For example:
-->
RxJS는 옵저버블을 생성하는 함수를 다양하게 제공합니다. 이 함수를 사용하면 이벤트나 타이머, Promise 등 다양한 타입의 옵저버블을 생성할 수 있습니다.

<!--
<code-example path="rx-library/src/simple-creation.ts" region="promise" title="Create an observable from a promise"></code-example>
-->
<code-example path="rx-library/src/simple-creation.ts" region="promise" title="Promise를 옵저버블로 변환하기"></code-example>

<!--
<code-example path="rx-library/src/simple-creation.ts" region="interval" title="Create an observable from a counter"></code-example>
-->
<code-example path="rx-library/src/simple-creation.ts" region="interval" title="카운터를 옵저버블로 변환하기"></code-example>

<!--
<code-example path="rx-library/src/simple-creation.ts" region="event" title="Create an observable from an event"></code-example>
-->
<code-example path="rx-library/src/simple-creation.ts" region="event" title="이벤트를 옵저버블로 변환하기"></code-example>

<!--
<code-example path="rx-library/src/simple-creation.ts" region="ajax" title="Create an observable that creates an AJAX request"></code-example>
-->
<code-example path="rx-library/src/simple-creation.ts" region="ajax" title="AJAX 요청을 옵저버블로 변환하기"></code-example>

<!--
## Operators
-->
## 연산자 (Operators)

<!--
Operators are functions that build on the observables foundation to enable sophisticated manipulation of collections. For example, RxJS defines operators such as `map()`, `filter()`, `concat()`, and `flatMap()`.
-->
RxJS에서 제공하는 연산자는 옵저버블의 기본 철학을 그대로 유지하면서 옵저버블을 다른 형태로 변환하는 함수입니다. RxJS는 `map()`나 `filter()`, `concat()`, `flatMap()`과 같은 연산자를 제공합니다.

<!--
Operators take configuration options, and they return a function that takes a source observable. When executing this returned function, the operator observes the source observable’s emitted values, transforms them, and returns a new observable of those transformed values. Here is a simple example:
-->
연산자를 사용할 때는 옵저버블을 어떻게 변환할지 정의하는 함수를 함께 전달합니다. 이 함수는 옵저버블에서 데이터가 전달될 때마다 실행되고, 원래 옵저버블 데이터를 변환하며, 변환된 값을 새로운 옵저버블로 전달합니다. 간단한 예제를 봅시다:

<!--
<code-example path="rx-library/src/operators.ts" title="Map operator"></code-example>
-->
<code-example path="rx-library/src/operators.ts" title="Map 연산자"></code-example>

<!--
You can use _pipes_ to link operators together. Pipes let you combine multiple functions into a single function. The `pipe()` function takes as its arguments the functions you want to combine, and returns a new function that, when executed, runs the composed functions in sequence.
-->
연산자는 _파이프_ 를 사용해서 조합할 수도 있습니다. 이 때 파이프는 함수 여러개를 함수 하나인 것처럼 변환하는 함수입니다. 그래서 `pipe()` 함수는 인자로 조합할 함수를 받아서 이 함수들을 조합한 새로운 함수를 생성하고, 옵저버블에서 데이터가 전달될 때 순서대로 실행합니다.

<!--
A set of operators applied to an observable is a recipe&mdash;that is, a set of instructions for producing the values you’re interested in. By itself, the recipe doesn’t do anything. You need to call `subscribe()` to produce a result through the recipe.
-->
옵저버블에서 제공하는 연산자는 자유롭게 조합할 수 있지만, 이 연산자 그 자체로는 아무것도 하지 않습니다. 조합된 함수를 실행하려면 `subscribe()`를 실행해서 구독해야 합니다.

<!--
Here’s an example:
-->
예제를 봅시다:

<!--
<code-example path="rx-library/src/operators.1.ts" title="Standalone pipe function"></code-example>
-->
<code-example path="rx-library/src/operators.1.ts" title="함수로 제공되는 파이프"></code-example>

<!--
The `pipe()` function is also a method on the RxJS `Observable`, so you use this shorter form to define the same operation:
-->
그리고 `pipe()` 함수는 RxJS `Observable` 클래스의 메소드로도 제공됩니다. 그래서 위 코드와 같은 동작을 다음과 같이 간단하게 구현할 수도 있습니다:

<!--
<code-example path="rx-library/src/operators.2.ts" title="Observable.pipe function"></code-example>
-->
<code-example path="rx-library/src/operators.2.ts" title="Observable.pipe 함수"></code-example>

<!--
### Common operators
-->
### 공통 연산자

<!--
RxJS provides many operators (over 150 of them), but only a handful are used frequently. Here is a list of common operators; for usage examples, see  [RxJS 5 Operators By Example](https://github.com/btroncone/learn-rxjs/blob/master/operators/complete.md) in RxJS documentation.
-->
RxJS는 간단하게 사용할 수 있는 연산자를 150개 이상 제공합니다. 이 중 자주 사용하는 연산자를 몇 가지 알아봅시다. 사용 방법은 RxJS 사이트에서 [RxJS 5 Operators By Example](https://github.com/btroncone/learn-rxjs/blob/master/operators/complete.md) 문서를 참고하세요.

<div class="l-sub-section">
  <!--
  Note that, for Angular apps, we prefer combining operators with pipes, rather than chaining. Chaining is used in many RxJS examples.
  -->
  RxJS에서 제공하는 예제는 체이닝 방식을 많이 사용합니다. 하지만 Angular 앱에서 연산자를 사용할 때는 체이닝 대신 파이프를 사용하는 것을 권장합니다.
</div>

<!--
| Area | Operators |
| :------------| :----------|
| Creation |  `from`, `fromPromise`,`fromEvent`, `of` |
| Combination | `combineLatest`, `concat`, `merge`, `startWith` , `withLatestFrom`, `zip` |
| Filtering | `debounceTime`, `distinctUntilChanged`, `filter`, `take`, `takeUntil` |
| Transformation | `bufferTime`, `concatMap`, `map`, `mergeMap`, `scan`, `switchMap` |
| Utility | `tap` |
| Multicasting | `share` |
-->
| 용도 | 연산자 |
| :------------| :----------|
| 생성 |  `from`, `fromPromise`,`fromEvent`, `of` |
| 조합 | `combineLatest`, `concat`, `merge`, `startWith` , `withLatestFrom`, `zip` |
| 필터링 | `debounceTime`, `distinctUntilChanged`, `filter`, `take`, `takeUntil` |
| 변환 | `bufferTime`, `concatMap`, `map`, `mergeMap`, `scan`, `switchMap` |
| 유틸 | `tap` |
| 멀티캐스팅 | `share` |

<!--
## Error handling
-->
## 에러 처리

<!--
In addition to the `error()` handler that you provide on subscription, RxJS provides the `catchError` operator that lets you handle known errors in the observable recipe.
-->
옵저버블을 생성할 때 지정하는 `error` 핸들러와 비슷하게, RxJS에서 제공하는 `catchError` 연산자를 사용해서 에러를 처리할 수도 있습니다.

<!--
For instance, suppose you have an observable that makes an API request and maps to the response from the server. If the server returns an error or the value doesn’t exist, an error is produced. If you catch this error and supply a default value, your stream continues to process values rather than erroring out.
-->
예를 들어, 서버로 API 요청을 보내고 서버에서 온 응답을 원하는 형태로 변환하는 옵저버블이 있다고 합시다. 그리고 서버에서 에러를 반환하거나 서버가 반환한 값이 없을 때 에러가 발생한다고 합시다. 이런 경우에 에러 대신 사용할 기본값을 지정하면 옵저버블이 에러로 중단되는 상황을 방지하면서 처리 로직을 계속 실행할 수 있습니다.

<!--
Here's an example of using the `catchError` operator to do this:
-->
`catchError` 연산자는 다음과 같이 사용합니다:

<!--
<code-example path="rx-library/src/error-handling.ts" title="catchError operator"></code-example>
-->
<code-example path="rx-library/src/error-handling.ts" title="catchError 연산자"></code-example>

<!--
### Retry failed observable
-->
### 실패한 옵저버블 재시도하기

<!--
Where the `catchError` operator provides a simple path of recovery, the `retry` operator lets you retry a failed request.
-->
`catchError` 연산자는 에러가 발생한 옵저버블을 복구할 때 간단하게 사용할 수 있으며, 이번에 알아볼 `retry` 연산자는 실패한 요청을 다시 시도합니다.

<!--
Use the `retry` operator before the `catchError` operator. It resubscribes to the original source observable, which can then re-run the full sequence of actions that resulted in the error. If this includes an HTTP request, it will retry that HTTP request.
-->
`retry` 연산자는 `catchError` 를 실행하기 전에 먼저 지정합니다. 그러면 `retry` 연산자는 원래 옵저버블이 실패했을 때 옵저버블 생성을 다시 시도합니다.

<!--
The following converts the previous example to retry the request before catching the error:
-->
아래 예제는 에러를 처리하기 전에 재시도하도록 수정한 예제 코드입니다:

<!--
<code-example path="rx-library/src/retry-on-error.ts" title="retry operator"></code-example>
-->
<code-example path="rx-library/src/retry-on-error.ts" title="retry 연산자"></code-example>

<div class="l-sub-section">

   <!--
   Do not retry **authentication** requests, since these should only be initiated by user action. We don't want to lock out user accounts with repeated login requests that the user has not initiated.
   -->
   **사용자 인증이 필요한** 요청은 재시도하지 마세요. 이 동작은 사용자에 의해서만 수행되어야 합니다. 사용자가 요청하지 않은 상태에서 계속 로그인 시도가 된다면 비정상적인 공격 시도로 처리될 수 잇습니다.

</div>

<!--
## Naming conventions for observables
-->
## 옵저버블 변수 명명 규칙

<!--
Because Angular applications are mostly written in TypeScript, you will typically know when a variable is an observable. Although the Angular framework does not enforce a naming convention for observables, you will often see observables named with a trailing “$” sign.
-->
Angular 애플리케이션은 TypeScript로 작성하기 때문에 어떤 변수가 옵저버블인지는 쉽게 구분할 수 있습니다. 이런 옵저버블 변수의 이름을 지을 때 특별한 규칙을 강요하지는 않지만, 옵저버블 변수는 이름 뒤에 "$"를 붙이는 것이 좋습니다.

<!--
This can be useful when scanning through code and looking for observable values. Also, if you want a property to store the most recent value from an observable, it can be convenient to simply use the same name with or without the “$”.
-->
변수 이름을 이렇게 지으면 코드를 보면서 어떤 것이 옵저버블인지 좀 더 확실하게 확인할 수 있습니다. 그리고 옵저버블에서 받은 데이터 중에 자주 사용하는 것이 있으면 "$"를 뺀 프로퍼티를 따로 선언하는 것이 사용하기 편합니다.

<!--
For example:
-->
예제 코드를 봅시다:

<code-example path="rx-library/src/naming-convention.ts" title="Naming observables"></code-example>