# HttpClient

<!--
Most front-end applications communicate with backend services over the HTTP protocol. Modern browsers support two different APIs for making HTTP requests: the `XMLHttpRequest` interface and the `fetch()` API.
-->
프론트엔드 애플리케이션은 대부분 HTTP 프로토콜을 사용해서 백엔드 서비스와 통신을 합니다. 그리고 최신 브라우저들은 이 HTTP 요청을 처리하는 API를 두 종류로 제공하는데, 하나는 `XMLHttpRequest` 인터페이스이고 다른 하나는 `fetch()` API 입니다.

<!--
The `HttpClient` in `@angular/common/http` offers a simplified client HTTP API for Angular applications
that rests on the `XMLHttpRequest` interface exposed by browsers.
Additional benefits of `HttpClient` include testability features, typed request and response objects, request and response interception, `Observable` apis, and streamlined error handling.
-->
`@angular/common/http` 라이브러리에서 제공하는 `HttpClient`는 Angular 애플리케이션에서 HTTP 요청을 간단하게 보낼 수 있도록 API를 제공하는데, 이 때 브라우저의 `XMLHttpRequest` 인터페이스를 활용합니다.
그리고 `XMLHttpRequest` 기능 외에 테스트 지원 기능, HTTP 요청과 응답에 대한 객체 정보, HTTP 요청과 응답을 가로채는 인터셉트 기능, `Observable` API, 스트림라인 에러 처리 로직을 추가로 제공합니다.

<!--
You can run the <live-example></live-example> that accompanies this guide.
-->
이 문서에서 다루는 예제는 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

<div class="alert is-helpful">

<!--
The sample app does not require a data server.
It relies on the 
[Angular _in-memory-web-api_](https://github.com/angular/in-memory-web-api/blob/master/README.md),
which replaces the _HttpClient_ module's `HttpBackend`.
The replacement service simulates the behavior of a REST-like backend.

Look at the `AppModule` _imports_ to see how it is configured.
-->
이 문서에서 다루는 예제는 데이터 서버가 따로 필요하지 않습니다.
이 문서의 예제는 _HttpClient_ 모듈에서 제공하는 `HttpBackend`를 활용해서, 데이터 서버 대신 [Angular _인 메모리 웹 API(in-memory-web-api)_](https://github.com/angular/in-memory-web-api/blob/master/README.md)를 사용할 것입니다.
이 방식은 REST API 백엔드의 동작을 대신하기에 충분합니다.

이 서비스 설정은 `AppModule` 파일에서 하며, 이 문서에서는 따로 설명하지 않습니다.

</div>

<!--
## Setup
-->
## 환경설정

<!--
Before you can use the `HttpClient`, you need to import the Angular `HttpClientModule`. 
Most apps do so in the root `AppModule`.
-->
`HttpClient`를 사용하기 전에, `HttpClientModule`을 로드해야 합니다.
특별한 경우가 아니라면 이 모듈은 `AppModule`에서 불러옵니다.

<code-example 
  path="http/src/app/app.module.ts"
  region="sketch"
  title="app/app.module.ts (excerpt)" linenums="false">
</code-example>

<!--
Having imported `HttpClientModule` into the `AppModule`, you can inject the `HttpClient`
into an application class as shown in the following `ConfigService` example.
-->
`AppModule`에 `HttpClientModule`을 불러오고 나면 애플리케이션 클레스에 `HttpClient`를 의존성으로 주입할 수 있습니다. 예를 들어 `ConfigService`에서 사용한다면 다음과 같이 작성합니다.

<code-example 
  path="http/src/app/config/config.service.ts"
  region="proto"
  title="app/config/config.service.ts (excerpt)" linenums="false">
</code-example>

<!--
## Getting JSON data
-->
## JSON 데이터 받기

<!--
Applications often request JSON data from the server. 
For example, the app might need a configuration file on the server, `config.json`, 
that specifies resource URLs.
-->
애플리케이션은 서버에서 JSON 데이터를 받는 경우가 자주 있습니다.
예를 들어 다음과 같은 애플리케이션 설정 파일을 서버에서 `config.json` 파일로 받아온다고 합시다.

<code-example 
  path="http/src/assets/config.json"
  title="assets/config.json" linenums="false">
</code-example>

<!--
The `ConfigService` fetches this file with a `get()` method on `HttpClient`.
-->
그러면 `HttpClient` 객체의 `get()` 메소드를 `ConfigService`에 다음과 같이 연결합니다.

<code-example 
  path="http/src/app/config/config.service.ts"
  region="getConfig_1"
  title="app/config/config.service.ts (getConfig v.1)" linenums="false">
</code-example>

<!--
A component, such as `ConfigComponent`, injects the `ConfigService` and calls
the `getConfig` service method.
-->
그리고 `ConfigComponent`와 같은 컴포넌트에서 `ConfigService`를 주입받아서 `getConfig()` 메소드를 실행하면, 서버에서 가져온 설정 파일의 내용을 확인할 수 있습니다.

<code-example 
  path="http/src/app/config/config.component.ts"
  region="v1"
  title="app/config/config.component.ts (showConfig v.1)" linenums="false">
</code-example>

<!--
Because the service method returns an `Observable` of configuration data,
the component **subscribes** to the method's return value.
The subscription callback copies the data fields into the component's `config` object,
which is data-bound in the component template for display.
-->
서비스에 정의한 메소드는 데이터를 `Observable` 객체로 반환하기 때문에, 컴포넌트에서는 이 메소드를 구독해야 반환값을 확인할 수 있습니다.
컴포넌트의 구독 함수에서는 이렇게 가져온 데이터로 컴포넌트의 `config` 객체를 설정하기 때문에, 템플릿에서 이 객체의 데이터를 확인할 수 있습니다.

<!--
### Why write a service
-->
### 왜 서비스를 한 번 거치나요?

<!--
This example is so simple that it is tempting to write the `Http.get()` inside the
component itself and skip the service.
-->
이렇게 살펴본 예제는 아주 간단하기 때문에, 서비스를 생략하고 컴포넌트에 `HttpClient`를 주입하고 바로 `get()` 메소드를 사용하는 것이 낫지 않을까 하는 생각이 들 수도 있습니다.

<!--
However, data access rarely stays this simple.
You typically post-process the data, add error handling, and maybe some retry logic to
cope with intermittent connectivity.
-->
하지만 서버에서 데이터를 가져오는 과정은 이렇게 간단하지 않습니다.
일반적으로 데이터를 가져오면 가공해야 하고, 에러를 처리해야 하며, 연결이 실패한 경우에는 재시도하는 로직도 필요합니다.

<!--
The component quickly becomes cluttered with data access minutia.
The component becomes harder to understand, harder to test, and the data access logic can't be re-used or standardized.
-->
그러면 데이터를 처리하는 로직만으로도 컴포넌트는 빠르게 복잡해질 것입니다.
컴포넌트 코드는 점점 이해하기 힘들어 질 것이고, 테스트하기도 어려워지며, 데이터를 가져오는 로직은 재활용하기도 어려워집니다.

<!--
That's why it is a best practice to separate presentation of data from data access by
encapsulating data access in a separate service and delegating to that service in
the component, even in simple cases like this one.
-->
그래서 서버에서 가져온 데이터를 처리하는 로직은 서비스에 작성해서 컴포넌트와 분리하고, 컴포넌트에서는 이 데이터를 받아서 활용하는 로직만 작성하는 것이 좋습니다.

<!--
### Type-checking the response
-->
### 응답으로 받은 객체에 타입 지정하기

<!--
The subscribe callback above requires bracket notation to extract the data values.
-->
데이터의 타입을 확실하게 지정하기 위해 구독 함수에 다음과 같이 타입을 지정해 봅시다.

<code-example 
  path="http/src/app/config/config.component.ts"
  region="v1_callback" linenums="false">
</code-example>

<!--
You can't write `data.heroesUrl` because TypeScript correctly complains that the `data` object from the service does not have a `heroesUrl` property. 
-->
하지만 지금은 `data.heroesUrl`과 같이 사용할 수 없습니다. 왜냐하면 서비스에서 받은 `data` 객체에 `heroesUrl` 프로퍼티가 있는지 TypeScript가 알 수 없기 때문입니다.

<!--
The `HttpClient.get()` method parsed the JSON server response into the anonymous `Object` type. It doesn't know what the shape of that object is.
-->
`HttpClient.get()` 메소드는 서버에서 받은 JSON 데이터를 그냥 `Object` 타입으로 변환합니다. 이 객체에 어떤 데이터가 있는지는 알지 못합니다.

<!--
You can tell `HttpClient` the type of the response to make consuming the output easier and more obvious.
-->
이 때 `HttpClient`가 가져올 데이터의 타입을 지정할 수 있습니다. 서버에서 받아온 데이터의 타입을 명확하게 지정하면 이 데이터를 활용하기도 편해집니다.

<!--
First, define an interface with the correct shape:
-->
먼저, 데이터를 표현하는 인터페이스를 다음과 같이 정의합니다:

<code-example 
  path="http/src/app/config/config.service.ts"
  region="config-interface" linenums="false">
</code-example>

<!--
Then, specify that interface as the `HttpClient.get()` call's type parameter in the service:
-->
그리고 `HttpClient.get()` 함수를 호출할 때, 데이터 타입을 지정합니다:

<code-example 
  path="http/src/app/config/config.service.ts"
  region="getConfig_2" 
  title="app/config/config.service.ts (getConfig v.2)" linenums="false">
</code-example>

<!--
The callback in the updated component method receives a typed data object, which is
easier and safer to consume:
-->
이제 컴포넌트에서는 정확한 타입을 지정할 수 있고, 이 객체를 활용하기도 더 쉬워집니다:

<code-example 
  path="http/src/app/config/config.component.ts"
  region="v2"
  title="app/config/config.component.ts (showConfig v.2)" linenums="false">
</code-example>

<!--
### Reading the full response
-->
## 전체 서버 응답 확인하기

<!--
The response body doesn't return all the data you may need. Sometimes servers return special headers or status codes to indicate certain conditions that are important to the application workflow. 
-->
응답으로 받은 데이터만으로는 충분하지 않을 수 있습니다. 어떤 경우에는 헤더에 있는 정보나 HTTP 상태 코드를 확인해서 애플리케이션의 동작을 제어해야 하는 경우도 있습니다.

<!--
Tell `HttpClient` that you want the full response with the `observe` option:
-->
이 때 `HttpClient`가 서버에서 가져오는 데이터 전체를 확인하려면 `observe` 옵션을 사용합니다:

<code-example 
  path="http/src/app/config/config.service.ts"
  region="getConfigResponse" linenums="false">
</code-example>

<!--
Now `HttpClient.get()` returns an `Observable` of typed `HttpResponse` rather than just the JSON data.
-->
그러면 `HttpClient.get()` 메소드는 지정된 타입의 JSON 데이터 대신 `HttpResponse` 타입 객체를 `Observable`로 전달합니다.

<!--
The component's `showConfigResponse()` method displays the response headers as well as the configuration:
-->
그리고 컴포넌트에서 `showConfigResponse()` 메소드를 다음처럼 작성하면 HTTP 통신에서 받은 응답의 헤더를 확인할 수 있습니다:

<code-example 
  path="http/src/app/config/config.component.ts"
  region="showConfigResponse" 
  title="app/config/config.component.ts (showConfigResponse)"
  linenums="false">
</code-example>

<!--
As you can see, the response object has a `body` property of the correct type.
-->
이 때 `HttpResponse` 객체의 `body` 프로퍼티는 이전에 지정했던 타입과 같습니다.

<!--
## Error handling
-->
## 에러 처리

<!--
What happens if the request fails on the server, or if a poor network connection prevents it from even reaching the server? `HttpClient` will return an _error_ object instead of a successful response.
-->
서버에 문제가 있어서 HTTP 요청이 실패하거나, 네트워크 연결이 끊어져서 서버에 접근할 수 없다면 어떻게 될까요? 이런 오류가 발생하면 `HttpClient`는 정상적인 응답 대신 _에러_ 객체를 반환합니다.

<!--
You _could_ handle in the component by adding a second callback to the `.subscribe()`:
-->
그리고 이 에러 객체는 `.subscribe()` 함수에 지정하는 두 번째 콜백 함수로 처리할 수 있습니다.

<code-example 
  path="http/src/app/config/config.component.ts"
  region="v3" 
  title="app/config/config.component.ts (showConfig v.3 with error handling)"
  linenums="false">
</code-example>

<!--
It's certainly a good idea to give the user some kind of feedback when data access fails.
But displaying the raw error object returned by `HttpClient` is far from the best way to do it.
-->
데이터 통신이 실패하면 사용자에게 어떤 방식으로든 알리는 것이 좋습니다.
하지만 이 때 `HttpClient`에서 받은 에러 객체를 그대로 노출하는 것이 최선은 아닙니다.

{@a error-details}
<!--
### Getting error details
-->
### 에러 분석하기

<!--
Detecting that an error occurred is one thing.
Interpreting that error and composing a user-friendly response is a bit more involved.
-->
에러가 발생한 것을 확인하는 것만으로는 에러 처리를 했다고 할 수 없습니다.
이 에러는 사용자가 알아볼 수 있는 형태로 변형되어야 합니다.

<!--
Two types of errors can occur. The server backend might reject the request, returning an HTTP response with a status code such as 404 or 500. These are error _responses_.
-->
에러는 두 가지 이유로 발생할 수 있습니다. 하나는 서버에서 요청을 거부하거나, HTTP 응답 코드를 404나 500으로 보낸 경우입니다. 이런 경우를 _에러 응답(error response)_ 이라고 합니다.

<!--
Or something could go wrong on the client-side such as a network error that prevents the request from completing successfully or an exception thrown in an RxJS operator. These errors produce JavaScript `ErrorEvent` objects.
-->
또 다른 경우는 클라이언트에서 발생하는 네트워크 에러 때문에 요청이 완료되지 못했거나, RxJS 연산자에서 예외가 발생해서 발생하는 에러가 있습니다. 이런 에러는 JavaScript `ErrorEvent` 객체를 생성합니다.

<!--
The `HttpClient` captures both kinds of errors in its `HttpErrorResponse` and you can inspect that response to figure out what really happened.
-->
`HttpClient`는 두 종류의 에러를 모두 `HttpErrorResponse` 타입으로 받을 수 있으며, 이 객체를 확인하면 HTTP 요청이 어떤 이유로 잘못되었는지 확인할 수 있습니다.

<!--
Error inspection, interpretation, and resolution is something you want to do in the _service_, 
not in the _component_.  
-->
에러를 분석하고 변환한 후에 해결하는 것은 _서비스_ 안에서 해야 합니다. _컴포넌트_ 가 아닙니다.

<!--
You might first devise an error handler like this one:
-->
에러 처리 프로토타입은 다음과 같이 작성할 수 있습니다:

<code-example 
  path="http/src/app/config/config.service.ts"
  region="handleError" 
  title="app/config/config.service.ts (handleError)" linenums="false">
</code-example>

<!--
Notice that this handler returns an RxJS [`ErrorObservable`](#rxjs) with a user-friendly error message.
Consumers of the service expect service methods to return an `Observable` of some kind,
even a "bad" one.
-->
이 함수는 사용자에게 표시할 메시지를 RxJS [`ErrorObservable`](#rxjs) 타입으로 반환합니다.
그래서 이 서비스에서 에러를 반환하더라도 서비스를 사용하는 쪽에서는 결국 `Observable`을 받을 수 있게 됩니다.

<!--
Now you take the `Observables` returned by the `HttpClient` methods
and _pipe them through_ to the error handler.
-->
이제 컴포넌트에서 `HttpClient`의 결과를 받을 때 _파이프를 사용하면_ 에러를 처리할 수 있습니다.

<code-example 
  path="http/src/app/config/config.service.ts"
  region="getConfig_3" 
  title="app/config/config.service.ts (getConfig v.3 with error handler)" linenums="false">
</code-example>

### `retry()`

<!--
Sometimes the error is transient and will go away automatically if you try again.
For example, network interruptions are common in mobile scenarios, and trying again
may produce a successful result.
-->
어떤 경우에는 에러를 일시적인 것으로 판단하고 자동으로 재시도해야 하는 경우가 있습니다.
특히 모바일 디바이스인 경우에는 연결이 잠시 끊어지는 경우가 자주 발생하며, 실패한 요청을 다시 보냈을 때 바로 성공하는 경우도 자주 있습니다.

<!--
The [RxJS library](#rxjs) offers several _retry_ operators that are worth exploring.
The simplest is called `retry()` and it automatically re-subscribes to a failed `Observable` a specified number of times. _Re-subscribing_ to the result of an `HttpClient` method call has the effect of reissuing the HTTP request.
-->
[RxJS library](#rxjs)에서 이런 경우에 활용할 수 있는 _재시도_ 연산자를 여러가지로 제공합니다.
그 중 가장 간단한 것은 `retry()` 연산자이며, 이 연산자는 `Observable`이 실패했을 때 지정된 횟수만큼 자동으로 다시 구독합니다. 그리고 이 구독이 다시 시작되면 HTTP 요청이 다시 실행됩니다.

<!--
_Pipe_ it onto the `HttpClient` method result just before the error handler.
-->
에러 처리 파이프는 다음과 같이 작성합니다:

<code-example 
  path="http/src/app/config/config.service.ts"
  region="getConfig" 
  title="app/config/config.service.ts (getConfig with retry)" linenums="false">
</code-example>

{@a rxjs}
## Observables and operators

The previous sections of this guide referred to RxJS `Observables` and operators such as `catchError` and `retry`.
You will encounter more RxJS artifacts as you continue below.

[RxJS](http://reactivex.io/rxjs/) is a library for composing asynchronous and callback-based code
in a _functional, reactive style_.
Many Angular APIs, including `HttpClient`, produce and consume RxJS `Observables`. 

RxJS itself is out-of-scope for this guide. You will find many learning resources on the web.
While you can get by with a minimum of RxJS knowledge, you'll want to grow your RxJS skills over time in order to use `HttpClient` effectively.

If you're following along with these code snippets, note that you must import the RxJS observable and operator symbols that appear in those snippets. These `ConfigService` imports are typical.

<code-example 
  path="http/src/app/config/config.service.ts"
  region="rxjs-imports" 
  title="app/config/config.service.ts (RxJS imports)" linenums="false">
</code-example>

## Requesting non-JSON data

Not all APIs return JSON data. In this next example,
a `DownloaderService` method reads a text file from the server
and logs the file contents, before returning those contents to the caller
as an `Observable<string>`. 

<code-example 
  path="http/src/app/downloader/downloader.service.ts"
  region="getTextFile" 
  title="app/downloader/downloader.service.ts (getTextFile)" linenums="false">
</code-example>

`HttpClient.get()` returns a string rather than the default JSON because of the `responseType` option.

The RxJS `tap` operator (as in "wiretap") lets the code inspect good and error values passing through the observable without disturbing them. 

A `download()` method in the `DownloaderComponent` initiates the request by subscribing to the service method.

<code-example 
  path="http/src/app/downloader/downloader.component.ts"
  region="download" 
  title="app/downloader/downloader.component.ts (download)" linenums="false">
</code-example>

## Sending data to the server

In addition to fetching data from the server, `HttpClient` supports mutating requests, that is, sending data to the server with other HTTP methods such as PUT, POST, and DELETE.

The sample app for this guide includes a simplified version of the "Tour of Heroes" example
that fetches heroes and enables users to add, delete, and update them.

The following sections excerpt methods of the sample's `HeroesService`.

### Adding headers

Many servers require extra headers for save operations.
For example, they may require a "Content-Type" header to explicitly declare 
the MIME type of the request body.
Or perhaps the server requires an authorization token.

The `HeroesService` defines such headers in an `httpOptions` object that will be passed
to every `HttpClient` save method.

<code-example 
  path="http/src/app/heroes/heroes.service.ts"
  region="http-options" 
  title="app/heroes/heroes.service.ts (httpOptions)" linenums="false">
</code-example>

### Making a POST request

Apps often POST data to a server. They POST when submitting a form. 
In the following example, the `HeroesService` posts when adding a hero to the database.

<code-example 
  path="http/src/app/heroes/heroes.service.ts"
  region="addHero" 
  title="app/heroes/heroes.service.ts (addHero)" linenums="false">
</code-example>

The `HttpClient.post()` method is similar to `get()` in that it has a type parameter
(you're expecting the server to return the new hero)
and it takes a resource URL.

It takes two more parameters:

1. `hero` - the data to POST in the body of the request.
1. `httpOptions` - the method options which, in this case, [specify required headers](#adding-headers).

Of course it catches errors in much the same manner [described above](#error-details).

The `HeroesComponent` initiates the actual POST operation by subscribing to 
the `Observable` returned by this service method.

<code-example 
  path="http/src/app/heroes/heroes.component.ts"
  region="add-hero-subscribe" 
  title="app/heroes/heroes.component.ts (addHero)" linenums="false">
</code-example>

When the server responds successfully with the newly added hero, the component adds
that hero to the displayed `heroes` list.

### Making a DELETE request

This application deletes a hero with the `HttpClient.delete` method by passing the hero's id
in the request URL.

<code-example 
  path="http/src/app/heroes/heroes.service.ts"
  region="deleteHero" 
  title="app/heroes/heroes.service.ts (deleteHero)" linenums="false">
</code-example>

The `HeroesComponent` initiates the actual DELETE operation by subscribing to 
the `Observable` returned by this service method.

<code-example 
  path="http/src/app/heroes/heroes.component.ts"
  region="delete-hero-subscribe" 
  title="app/heroes/heroes.component.ts (deleteHero)" linenums="false">
</code-example>

The component isn't expecting a result from the delete operation, so it subscribes without a callback. Even though you are not using the result, you still have to subscribe. Calling the `subscribe()` method _executes_ the observable, which is what initiates the DELETE request. 

<div class="alert is-important">

You must call _subscribe()_ or nothing happens. Just calling `HeroesService.deleteHero()` **does not initiate the DELETE request.**

</div>


<code-example 
  path="http/src/app/heroes/heroes.component.ts"
  region="delete-hero-no-subscribe" linenums="false">
</code-example>

{@a always-subscribe}
**Always _subscribe_!**

An `HttpClient` method does not begin its HTTP request until you call `subscribe()` on the observable returned by that method. This is true for _all_ `HttpClient` _methods_.

<div class="alert is-helpful">

The [`AsyncPipe`](api/common/AsyncPipe) subscribes (and unsubscribes) for you automatically.

</div>

All observables returned from `HttpClient` methods are _cold_ by design.
Execution of the HTTP request is _deferred_, allowing you to extend the
observable with additional operations such as  `tap` and `catchError` before anything actually happens.

Calling `subscribe(...)` triggers execution of the observable and causes
`HttpClient` to compose and send the HTTP request to the server.

You can think of these observables as _blueprints_ for actual HTTP requests.

<div class="alert is-helpful">

In fact, each `subscribe()` initiates a separate, independent execution of the observable.
Subscribing twice results in two HTTP requests.

```javascript
const req = http.get<Heroes>('/api/heroes');
// 0 requests made - .subscribe() not called.
req.subscribe();
// 1 request made.
req.subscribe();
// 2 requests made.
```
</div>

### Making a PUT request

An app will send a PUT request to completely replace a resource with updated data.
The following `HeroesService` example is just like the POST example.

<code-example 
  path="http/src/app/heroes/heroes.service.ts"
  region="updateHero" 
  title="app/heroes/heroes.service.ts (updateHero)" linenums="false">
</code-example>

For the reasons [explained above](#always-subscribe), the caller (`HeroesComponent.update()` in this case) must `subscribe()` to the observable returned from the `HttpClient.put()`
in order to initiate the request.

## Advanced usage

We have discussed the basic HTTP functionality in `@angular/common/http`, but sometimes you need to do more than make simple requests and get data back.

### Configuring the request

Other aspects of an outgoing request can be configured via the options object
passed as the last argument to the `HttpClient` method.

You [saw earlier](#adding-headers) that the `HeroesService` sets the default headers by
passing an options object (`httpOptions`) to its save methods.
You can do more.

#### Update headers

You can't directly modify the existing headers within the previous options
object because instances of the `HttpHeaders` class are immutable.

Use the `set()` method instead. 
It returns a clone of the current instance with the new changes applied.

Here's how you might update the authorization header (after the old token expired) 
before making the next request.

<code-example 
  path="http/src/app/heroes/heroes.service.ts"
  region="update-headers" linenums="false">
</code-example>

#### URL Parameters

Adding URL search parameters works a similar way.
Here is a `searchHeroes` method that queries for heroes whose names contain the search term.

<code-example 
  path="http/src/app/heroes/heroes.service.ts"
  region="searchHeroes" linenums="false">
</code-example>

If there is a search term, the code constructs an options object with an HTML URL-encoded search parameter. If the term were "foo", the GET request URL would be `api/heroes/?name=foo`.

The `HttpParams` are immutable so you'll have to use the `set()` method to update the options.

### Debouncing requests

The sample includes an _npm package search_ feature.

When the user enters a name in a search-box, the `PackageSearchComponent` sends
a search request for a package with that name to the NPM web API.

Here's a pertinent excerpt from the template:

<code-example 
  path="http/src/app/package-search/package-search.component.html"
  region="search" 
  title="app/package-search/package-search.component.html (search)">
</code-example>

The `(keyup)` event binding sends every keystroke to the component's `search()` method.

Sending a request for every keystroke could be expensive.
It's better to wait until the user stops typing and then send a request.
That's easy to implement with RxJS operators, as shown in this excerpt.

<code-example 
  path="http/src/app/package-search/package-search.component.ts"
  region="debounce" 
  title="app/package-search/package-search.component.ts (excerpt))">
</code-example>

The `searchText$` is the sequence of search-box values coming from the user.
It's defined as an RxJS `Subject`, which means it is a multicasting `Observable`
that can also produce values for itself by calling `next(value)`,
as happens in the `search()` method.

Rather than forward every `searchText` value directly to the injected `PackageSearchService`,
the code in `ngOnInit()` _pipes_ search values through three operators:

1. `debounceTime(500)` - wait for the user to stop typing (1/2 second in this case).
1. `distinctUntilChanged()` - wait until the search text changes.
1. `switchMap()` - send the search request to the service.

The code sets `packages$` to this re-composed `Observable` of search results.
The template subscribes to `packages$` with the [AsyncPipe](api/common/AsyncPipe)
and displays search results as they arrive.

A search value reaches the service only if it's a new value and the user has stopped typing.

<div class="l-sub-section">

The `withRefresh` option is explained [below](#cache-refresh).

</div>

#### _switchMap()_

The `switchMap()` operator has three important characteristics.

1. It takes a function argument that returns an `Observable`.
`PackageSearchService.search` returns an `Observable`, as other data service methods do.

2. If a previous search request is still _in-flight_ (as when the connection is poor),
it cancels that request and sends a new one.

3. It returns service responses in their original request order, even if the
server returns them out of order. 


<div class="l-sub-section">

If you think you'll reuse this debouncing logic,
consider moving it to a utility function or into the `PackageSearchService` itself.

</div>

### Intercepting requests and responses

_HTTP Interception_ is a major feature of `@angular/common/http`. 
With interception, you declare _interceptors_ that inspect and transform HTTP requests from your application to the server.
The same interceptors may also inspect and transform the server's responses on their way back to the application.
Multiple interceptors form a _forward-and-backward_ chain of request/response handlers.

Interceptors can perform a variety of  _implicit_ tasks, from authentication to logging, in a routine, standard way, for every HTTP request/response. 

Without interception, developers would have to implement these tasks _explicitly_ 
for each `HttpClient` method call.

#### Write an interceptor

To implement an interceptor, declare a class that implements the `intercept()` method of the `HttpInterceptor` interface.

 Here is a do-nothing _noop_ interceptor that simply passes the request through without touching it:
<code-example 
  path="http/src/app/http-interceptors/noop-interceptor.ts"
  title="app/http-interceptors/noop-interceptor.ts"
  linenums="false">
</code-example>

The `intercept` method transforms a request into an `Observable` that eventually returns the HTTP response. 
In this sense, each interceptor is fully capable of handling the request entirely by itself.

Most interceptors inspect the request on the way in and forward the (perhaps altered) request to the `handle()` method of the `next` object which implements the [`HttpHandler`](api/common/http/HttpHandler) interface.

```javascript
export abstract class HttpHandler {
  abstract handle(req: HttpRequest<any>): Observable<HttpEvent<any>>;
}
```

Like `intercept()`, the `handle()` method transforms an HTTP request into an `Observable` of [`HttpEvents`](#httpevents) which ultimately include the server's response. The `intercept()` method could inspect that observable and alter it before returning it to the caller.

This _no-op_ interceptor simply calls `next.handle()` with the original request and returns the observable without doing a thing.

#### The _next_ object

The `next` object represents the next interceptor in the chain of interceptors. 
The final `next` in the chain is the `HttpClient` backend handler that sends the request to the server and receives the server's response.


Most interceptors call `next.handle()` so that the request flows through to the next interceptor and, eventually, the backend handler.
An interceptor _could_ skip calling `next.handle()`, short-circuit the chain, and [return its own `Observable`](#caching) with an artificial server response. 

This is a common middleware pattern found in frameworks such as Express.js.

#### Provide the interceptor

The `NoopInterceptor` is a service managed by Angular's [dependency injection (DI)](guide/dependency-injection) system. 
Like other services, you must provide the interceptor class before the app can use it.

Because interceptors are (optional) dependencies of the `HttpClient` service, 
you must provide them in the same injector (or a parent of the injector) that provides `HttpClient`. 
Interceptors provided _after_ DI creates the `HttpClient` are ignored.

This app provides `HttpClient` in the app's root injector, as a side-effect of importing the `HttpClientModule` in `AppModule`.
You should provide interceptors in `AppModule` as well.

After importing the `HTTP_INTERCEPTORS` injection token from `@angular/common/http`,
write the `NoopInterceptor` provider like this:

<code-example 
  path="http/src/app/http-interceptors/index.ts"
  region="noop-provider" linenums="false">
</code-example>

Note the `multi: true` option. 
This required setting tells Angular that `HTTP_INTERCEPTORS` is a token for a _multiprovider_ 
that injects an array of values, rather than a single value.

You _could_ add this provider directly to the providers array of the `AppModule`.
However, it's rather verbose and there's a good chance that 
you'll create more interceptors and provide them in the same way.
You must also pay [close attention to the order](#interceptor-order) 
in which you provide these interceptors.

Consider creating a "barrel" file that gathers all the interceptor providers into an `httpInterceptorProviders` array, starting with this first one, the `NoopInterceptor`.

<code-example 
  path="http/src/app/http-interceptors/index.ts"
  region="interceptor-providers"
  title="app/http-interceptors/index.ts" linenums="false">
</code-example>

Then import and add it to the `AppModule` _providers array_ like this:

<code-example 
  path="http/src/app/app.module.ts"
  region="interceptor-providers"
  title="app/app.module.ts (interceptor providers)" linenums="false">
</code-example>

As you create new interceptors, add them to the `httpInterceptorProviders` array and
you won't have to revisit the `AppModule`.

<div class="l-sub-section">

There are many more interceptors in the complete sample code.

</div>

#### Interceptor order

Angular applies interceptors in the order that you provide them.
If you provide interceptors _A_, then _B_, then _C_,  requests will flow in _A->B->C_ and
responses will flow out _C->B->A_.

You cannot change the order or remove interceptors later.
If you need to enable and disable an interceptor dynamically, you'll have to build that capability into the interceptor itself.

#### _HttpEvents_

You may have expected the `intercept()` and `handle()` methods to return observables of `HttpResponse<any>` as most `HttpClient` methods do.

Instead they return observables of `HttpEvent<any>`.

That's because interceptors work at a lower level than those `HttpClient` methods. A single HTTP request can generate multiple _events_, including upload and download progress events. The `HttpResponse` class itself is actually an event, whose type is `HttpEventType.HttpResponseEvent`.

Many interceptors are only concerned with the outgoing request and simply return the event stream from `next.handle()` without modifying it.

But interceptors that examine and modify the response from `next.handle()` 
will see all of these events. 
Your interceptor should return _every event untouched_ unless it has a _compelling reason to do otherwise_.

#### Immutability

Although interceptors are capable of mutating requests and responses,
the `HttpRequest` and `HttpResponse` instance properties are `readonly`,
rendering them largely immutable.

They are immutable for a good reason: the app may retry a request several times before it succeeds, which means that the interceptor chain may re-process the same request multiple times.
If an interceptor could modify the original request object, the re-tried operation would start from the modified request rather than the original. Immutability ensures that interceptors see the same request for each try.

TypeScript will prevent you from setting `HttpRequest` readonly properties. 

```javascript
  // Typescript disallows the following assignment because req.url is readonly
  req.url = req.url.replace('http://', 'https://');
```
To alter the request, clone it first and modify the clone before passing it to `next.handle()`. 
You can clone and modify the request in a single step as in this example.

<code-example 
  path="http/src/app/http-interceptors/ensure-https-interceptor.ts"
  region="excerpt" 
  title="app/http-interceptors/ensure-https-interceptor.ts (excerpt)" linenums="false">
</code-example>

The `clone()` method's hash argument allows you to mutate specific properties of the request while copying the others.

##### The request body

The `readonly` assignment guard can't prevent deep updates and, in particular, 
it can't prevent you from modifying a property of a request body object.

```javascript
  req.body.name = req.body.name.trim(); // bad idea!
```

If you must mutate the request body, copy it first, change the copy, 
`clone()` the request, and set the clone's body with the new body, as in the following example.

<code-example 
  path="http/src/app/http-interceptors/trim-name-interceptor.ts"
  region="excerpt" 
  title="app/http-interceptors/trim-name-interceptor.ts (excerpt)" linenums="false">
</code-example>

##### Clearing the request body

Sometimes you need to clear the request body rather than replace it.
If you set the cloned request body to `undefined`, Angular assumes you intend to leave the body as is.
That is not what you want.
If you set the cloned request body to `null`, Angular knows you intend to clear the request body.

```javascript
  newReq = req.clone({ ... }); // body not mentioned => preserve original body
  newReq = req.clone({ body: undefined }); // preserve original body
  newReq = req.clone({ body: null }); // clear the body
```

#### Set default headers

Apps often use an interceptor to set default headers on outgoing requests. 

The sample app has an `AuthService` that produces an authorization token.
Here is its `AuthInterceptor` that injects that service to get the token and
adds an authorization header with that token to every outgoing request:

<code-example 
  path="http/src/app/http-interceptors/auth-interceptor.ts"
  title="app/http-interceptors/auth-interceptor.ts">
</code-example>

The practice of cloning a request to set new headers is so common that 
there's a `setHeaders` shortcut for it:

<code-example 
  path="http/src/app/http-interceptors/auth-interceptor.ts"
  region="set-header-shortcut">
</code-example>

An interceptor that alters headers can be used for a number of different operations, including:

* Authentication/authorization
* Caching behavior; for example, `If-Modified-Since`
* XSRF protection

#### Logging

Because interceptors can process the request and response _together_, they can do things like time and log 
an entire HTTP operation. 

Consider the following `LoggingInterceptor`, which captures the time of the request,
the time of the response, and logs the outcome with the elapsed time
with the injected `MessageService`.

<code-example 
  path="http/src/app/http-interceptors/logging-interceptor.ts"
  region="excerpt" 
  title="app/http-interceptors/logging-interceptor.ts)">
</code-example>

The RxJS `tap` operator captures whether the request succeed or failed.
The RxJS `finalize` operator is called when the response observable either errors or completes (which it must),
and reports the outcome to the `MessageService`.

Neither `tap` nor `finalize` touch the values of the observable stream returned to the caller.

#### Caching

Interceptors can handle requests by themselves, without forwarding to `next.handle()`.

For example, you might decide to cache certain requests and responses to improve performance.
You can delegate caching to an interceptor without disturbing your existing data services. 

The `CachingInterceptor` demonstrates this approach.

<code-example 
  path="http/src/app/http-interceptors/caching-interceptor.ts"
  region="v1" 
  title="app/http-interceptors/caching-interceptor.ts)" linenums="false">
</code-example>

The `isCachable()` function determines if the request is cachable.
In this sample, only GET requests to the npm package search api are cachable.

If the request is not cachable, the interceptor simply forwards the request 
to the next handler in the chain.

If a cachable request is found in the cache, the interceptor returns an `of()` _observable_ with
the cached response, by-passing the `next` handler (and all other interceptors downstream).

If a cachable request is not in cache, the code calls `sendRequest`.

{@a send-request}
<code-example 
  path="http/src/app/http-interceptors/caching-interceptor.ts"
  region="send-request">
</code-example>

The `sendRequest` function creates a [request clone](#immutability) without headers
because the npm api forbids them.

It forwards that request to `next.handle()` which ultimately calls the server and
returns the server's response.

Note how `sendRequest` _intercepts the response_ on its way back to the application.
It _pipes_ the response through the `tap()` operator,
whose callback adds the response to the cache.

The original response continues untouched back up through the chain of interceptors
to the application caller. 

Data services, such as `PackageSearchService`, are unaware that 
some of their `HttpClient` requests actually return cached responses.

{@a cache-refresh}
#### Return a multi-valued _Observable_

The `HttpClient.get()` method normally returns an _observable_ 
that either emits the data or an error. 
Some folks describe it as a "_one and done_" observable.

But an interceptor can change this to an _observable_ that emits more than once.

A revised version of the `CachingInterceptor` optionally returns an _observable_ that
immediately emits the cached response, sends the request to the NPM web API anyway,
and emits again later with the updated search results.

<code-example 
  path="http/src/app/http-interceptors/caching-interceptor.ts"
  region="intercept-refresh">
</code-example>

The _cache-then-refresh_ option is triggered by the presence of a **custom `x-refresh` header**.

<div class="l-sub-section">

A checkbox on the `PackageSearchComponent` toggles a `withRefresh` flag,
which is one of the arguments to `PackageSearchService.search()`.
That `search()` method creates the custom `x-refresh` header
and adds it to the request before calling `HttpClient.get()`.

</div>

The revised `CachingInterceptor` sets up a server request 
whether there's a cached value or not, 
using the same `sendRequest()` method described [above](#send-request).
The `results$` observable will make the request when subscribed.

If there's no cached value, the interceptor returns `results$`.

If there is a cached value, the code _pipes_ the cached response onto
`results$`, producing a recomposed observable that emits twice,
the cached response first (and immediately), followed later
by the response from the server.
Subscribers see a sequence of _two_ responses.

### Listening to progress events

Sometimes applications transfer large amounts of data and those transfers can take a long time.
File uploads are a typical example. 
Give the users a better experience by providing feedback on the progress of such transfers.

To make a request with progress events enabled, you can create an instance of `HttpRequest` 
with the `reportProgress` option set true to enable tracking of progress events.

<code-example 
  path="http/src/app/uploader/uploader.service.ts"
  region="upload-request" 
  title="app/uploader/uploader.service.ts (upload request)">
</code-example>

<div class="alert is-important">

Every progress event triggers change detection, so only turn them on if you truly intend to report progress in the UI.

</div>

Next, pass this request object to the `HttpClient.request()` method, which
returns an `Observable` of `HttpEvents`, the same events processed by interceptors:

<code-example 
  path="http/src/app/uploader/uploader.service.ts"
  region="upload-body" 
  title="app/uploader/uploader.service.ts (upload body)" linenums="false">
</code-example>

The `getEventMessage` method interprets each type of `HttpEvent` in the event stream.

<code-example 
  path="http/src/app/uploader/uploader.service.ts"
  region="getEventMessage" 
  title="app/uploader/uploader.service.ts (getEventMessage)" linenums="false">
</code-example>

<div class="alert is-helpful">

The sample app for this guide doesn't have a server that accepts uploaded files.
The `UploadInterceptor` in `app/http-interceptors/upload-interceptor.ts` 
intercepts and short-circuits upload requests
by returning an observable of simulated events.

</div>

## Security: XSRF Protection

[Cross-Site Request Forgery (XSRF)](https://en.wikipedia.org/wiki/Cross-site_request_forgery) is an attack technique by which the attacker can trick an authenticated user into unknowingly executing actions on your website. `HttpClient` supports a [common mechanism](https://en.wikipedia.org/wiki/Cross-site_request_forgery#Cookie-to-Header_Token) used to prevent XSRF attacks. When performing HTTP requests, an interceptor reads a token from a cookie, by default `XSRF-TOKEN`, and sets it as an HTTP header, `X-XSRF-TOKEN`. Since only code that runs on your domain could read the cookie, the backend can be certain that the HTTP request came from your client application and not an attacker.

By default, an interceptor sends this cookie on all mutating requests (POST, etc.)
to relative URLs but not on GET/HEAD requests or
on requests with an absolute URL.

To take advantage of this, your server needs to set a token in a JavaScript readable session cookie called `XSRF-TOKEN` on either the page load or the first GET request. On subsequent requests the server can verify that the cookie matches the `X-XSRF-TOKEN` HTTP header, and therefore be sure that only code running on your domain could have sent the request. The token must be unique for each user and must be verifiable by the server; this prevents the client from making up its own tokens. Set the token to a digest of your site's authentication
cookie with a salt for added security.

In order to prevent collisions in environments where multiple Angular apps share the same domain or subdomain, give each application a unique cookie name.

<div class="alert is-important">

*Note that `HttpClient` supports only the client half of the XSRF protection scheme.* 
Your backend service must be configured to set the cookie for your page, and to verify that 
the header is present on all eligible requests. 
If not, Angular's default protection will be ineffective.

</div>

### Configuring custom cookie/header names

If your backend service uses different names for the XSRF token cookie or header, 
use `HttpClientXsrfModule.withOptions()` to override the defaults.

<code-example 
  path="http/src/app/app.module.ts"
  region="xsrf" 
  linenums="false">
</code-example>

## Testing HTTP requests

Like any external dependency, the HTTP backend needs to be mocked
so your tests can simulate interaction with a remote server. 
The `@angular/common/http/testing` library makes 
setting up such mocking straightforward.

### Mocking philosophy

Angular's HTTP testing library is designed for a pattern of testing wherein 
the the app executes code and makes requests first.

Then a test expects that certain requests have or have not been made, 
performs assertions against those requests, 
and finally provide responses by "flushing" each expected request.
 
At the end, tests may verify that the app has made no unexpected requests.

<div class="alert is-helpful">

You can run <live-example stackblitz="specs">these sample tests</live-example> 
in a live coding environment.

The tests described in this guide are in `src/testing/http-client.spec.ts`.
There are also tests of an application data service that call `HttpClient` in
`src/app/heroes/heroes.service.spec.ts`.

</div>

### Setup

To begin testing calls to `HttpClient`, 
import the `HttpClientTestingModule` and the mocking controller, `HttpTestingController`,
along with the other symbols your tests require.

<code-example 
  path="http/src/testing/http-client.spec.ts"
  region="imports" 
  title="app/testing/http-client.spec.ts (imports)" linenums="false">
</code-example>

Then add the `HttpClientTestingModule` to the `TestBed` and continue with
the setup of the _service-under-test_.

<code-example 
  path="http/src/testing/http-client.spec.ts"
  region="setup" 
  title="app/testing/http-client.spec.ts(setup)" linenums="false">
</code-example>

Now requests made in the course of your tests will hit the testing backend instead of the normal backend.

This setup also calls `TestBed.get()` to inject the `HttpClient` service and the mocking controller
so they can be referenced during the tests.

### Expecting and answering requests

Now you can write a test that expects a GET Request to occur and provides a mock response. 

<code-example 
  path="http/src/testing/http-client.spec.ts"
  region="get-test" 
  title="app/testing/http-client.spec.ts(httpClient.get)" linenums="false">
</code-example>

The last step, verifying that no requests remain outstanding, is common enough for you to move it into an `afterEach()` step:

<code-example 
  path="http/src/testing/http-client.spec.ts"
  region="afterEach" 
  linenums="false">
</code-example>

#### Custom request expectations

If matching by URL isn't sufficient, it's possible to implement your own matching function. 
For example, you could look for an outgoing request that has an authorization header:

<code-example 
  path="http/src/testing/http-client.spec.ts"
  region="predicate" 
  linenums="false">
</code-example>

As with the previous `expectOne()`, 
the test will fail if 0 or 2+ requests satisfy this predicate.

#### Handling more than one request

If you need to respond to duplicate requests in your test, use the `match()` API instead of `expectOne()`.
It takes the same arguments but returns an array of matching requests. 
Once returned, these requests are removed from future matching and 
you are responsible for flushing and verifying them.

<code-example 
  path="http/src/testing/http-client.spec.ts"
  region="multi-request" 
  linenums="false">
</code-example>

### Testing for errors

You should test the app's defenses against HTTP requests that fail.

Call `request.flush()` with an error message, as seen in the following example.

<code-example 
  path="http/src/testing/http-client.spec.ts"
  region="network-error"
  linenums="false">
</code-example>

Alternatively, you can call `request.error()` with an `ErrorEvent`.

<code-example
  path="http/src/testing/http-client.spec.ts"
  region="network-error"
  linenums="false">
</code-example>
