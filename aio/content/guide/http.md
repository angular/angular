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
  header="app/app.module.ts (excerpt)" linenums="false">
</code-example>

<!--
Having imported `HttpClientModule` into the `AppModule`, you can inject the `HttpClient`
into an application class as shown in the following `ConfigService` example.
-->
`AppModule`에 `HttpClientModule`을 불러오고 나면 애플리케이션 클레스에 `HttpClient`를 의존성으로 주입할 수 있습니다. 예를 들어 `ConfigService`에서 사용한다면 다음과 같이 작성합니다.

<code-example 
  path="http/src/app/config/config.service.ts"
  region="proto"
  header="app/config/config.service.ts (excerpt)" linenums="false">
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
서버에서 받는 데이터는 JSON 형식인 경우가 많습니다.
예를 들어 다음과 같은 애플리케이션 설정 파일을 서버에서 `config.json` 파일로 받아온다고 합시다.

<code-example 
  path="http/src/assets/config.json"
  header="assets/config.json" linenums="false">
</code-example>

<!--
The `ConfigService` fetches this file with a `get()` method on `HttpClient`.
-->
그러면 `ConfigService`에서 `HttpClient` 서비스의 `get()` 메소드를 사용해서 이 파일을 받아올 수 있습니다.

<code-example 
  path="http/src/app/config/config.service.ts"
  region="getConfig_1"
  header="app/config/config.service.ts (getConfig v.1)" linenums="false">
</code-example>

<!--
A component, such as `ConfigComponent`, injects the `ConfigService` and calls
the `getConfig` service method.
-->
그리고 `ConfigComponent`와 같은 컴포넌트에서 `ConfigService`를 주입받아서 `getConfig()` 메소드를 실행하면, 서버에서 가져온 설정 파일의 내용을 확인할 수 있습니다.

<code-example 
  path="http/src/app/config/config.component.ts"
  region="v1"
  header="app/config/config.component.ts (showConfig v.1)" linenums="false">
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
그리고 `HttpClient.get()` 함수를 실행할 때, 데이터 타입을 지정합니다:

<code-example 
  path="http/src/app/config/config.service.ts"
  region="getConfig_2" 
  header="app/config/config.service.ts (getConfig v.2)" linenums="false">
</code-example>

<!--
The callback in the updated component method receives a typed data object, which is
easier and safer to consume:
-->
이제 컴포넌트에서는 정확한 타입을 지정할 수 있고, 이 객체를 활용하기도 더 쉬워집니다:

<code-example 
  path="http/src/app/config/config.component.ts"
  region="v2"
  header="app/config/config.component.ts (showConfig v.2)" linenums="false">
</code-example>

<!--
### Reading the full response
-->
## 전체 서버 응답 확인하기

<!--
The response body doesn't return all the data you may need. Sometimes servers return special headers or status codes to indicate certain conditions that are important to the application workflow. 
-->
응답으로 받은 데이터만으로는 충분하지 않은 경우가 있습니다. 어떤 경우에는 헤더에 있는 정보나 HTTP 상태 코드를 확인해서 애플리케이션의 동작을 제어해야 하는 경우도 있습니다.

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
  header="app/config/config.component.ts (showConfigResponse)"
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
  header="app/config/config.component.ts (showConfig v.3 with error handling)"
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
  header="app/config/config.service.ts (handleError)" linenums="false">
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
  header="app/config/config.service.ts (getConfig v.3 with error handler)" linenums="false">
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
  header="app/config/config.service.ts (getConfig with retry)" linenums="false">
</code-example>

{@a rxjs}
<!--
## Observables and operators
-->
## 옵저버블과 연산자

<!--
The previous sections of this guide referred to RxJS `Observables` and operators such as `catchError` and `retry`.
You will encounter more RxJS artifacts as you continue below.
-->
이전 문단에서 설명한 것처럼, Angular 애플리케이션에서 HTTP 요청을 보내거나 데이터를 받아서 처리할 때 RxJS가 제공하는 `Observable`과 연산자를 활용할 수 있습니다.
RxJS에서 제공하는 기능을 좀 더 알아봅시다.

<!--
[RxJS](http://reactivex.io/rxjs/) is a library for composing asynchronous and callback-based code
in a _functional, reactive style_.
Many Angular APIs, including `HttpClient`, produce and consume RxJS `Observables`. 
-->
[RxJS](http://reactivex.io/rxjs/)는 비동기 로직과 콜백 코드를 _반응형(reactive)_ 스타일로 구현할 때 사용하는 라이브러리 입니다.
Angular는 `HttpClient`외에도 많은 곳에서 RxJS의 `Observable`을 사용합니다.

<!--
RxJS itself is out-of-scope for this guide. You will find many learning resources on the web.
While you can get by with a minimum of RxJS knowledge, you'll want to grow your RxJS skills over time in order to use `HttpClient` effectively.
-->
RxJS 자체는 이 문서에서 다루는 범위가 아닙니다. RxJS 사용방법은 웹에서 쉽게 찾아볼 수 있으며, 이 문서에서는 `HttpClient`를 효율적으로 사용할 수 있을 정도로만 RxJS를 알아봅시다.

<!--
If you're following along with these code snippets, note that you must import the RxJS observable and operator symbols that appear in those snippets. These `ConfigService` imports are typical.
-->
예제 코드를 작성할 때는 RxJS를 사용하는 코드에 RxJS 옵저버블과 연산자 심볼을 로드해야 합니다. 예를 들어 `ConfigService`라면 다음과 같이 작성합니다.

<code-example 
  path="http/src/app/config/config.service.ts"
  region="rxjs-imports" 
  header="app/config/config.service.ts (RxJS imports)" linenums="false">
</code-example>

<!--
## Requesting non-JSON data
-->
## JSON 형식이 아닌 데이터 요청하기

<!--
Not all APIs return JSON data. In this next example,
a `DownloaderService` method reads a text file from the server
and logs the file contents, before returning those contents to the caller
as an `Observable<string>`. 
-->
모든 API가 JSON 데이터를 반환하는 것은 아닙니다. 이번에 살펴볼 `DownloaderService`에 정의된 메소드는 서버에서 받아온 텍스트 파일의 내용을 로그에 출력하고 `Observable<string>` 타입으로 반환합니다.

<code-example 
  path="http/src/app/downloader/downloader.service.ts"
  region="getTextFile" 
  header="app/downloader/downloader.service.ts (getTextFile)" linenums="false">
</code-example>

<!--
`HttpClient.get()` returns a string rather than the default JSON because of the `responseType` option.
-->
이제 `HttpClient.get()` 메소드는 `responseType`을 지정했기 때문에 JSON 타입 대신 문자열 타입을 반환합니다.

<!--
The RxJS `tap` operator (as in "wiretap") lets the code inspect good and error values passing through the observable without disturbing them. 
-->
그리고 이 때 옵저버블이 실행되는 흐름을 방해하지 않으면서 코드를 실행할 때 RxJS `tap` 연산자를 사용합니다.

<!--
A `download()` method in the `DownloaderComponent` initiates the request by subscribing to the service method.
-->
서비스의 코드는 `DownloaderComponent`에 정의된 `download()` 메소드에서 구독을 시작할 때 실행되며, 이 때 HTTP 요청도 시작됩니다.

<code-example 
  path="http/src/app/downloader/downloader.component.ts"
  region="download" 
  header="app/downloader/downloader.component.ts (download)" linenums="false">
</code-example>

<!--
## Sending data to the server
-->
## 서버에 데이터 보내기

<!--
In addition to fetching data from the server, `HttpClient` supports mutating requests, that is, sending data to the server with other HTTP methods such as PUT, POST, and DELETE.
-->
`HttpClient`로 서버에 데이터를 요청할 때 사용하는 HTTP 메소드가 PUT, POST, DELETE라면 서버로 추가 데이터를 보낼 수 있습니다.

<!--
The sample app for this guide includes a simplified version of the "Tour of Heroes" example
that fetches heroes and enables users to add, delete, and update them.
-->
이번 문단에서는 "히어로들의 여행" 튜토리얼에서 히어로의 목록을 가져오고 추가, 삭제, 수정했던 예제를 간단하게 다시 구현해 봅니다.

<!--
The following sections excerpt methods of the sample's `HeroesService`.
-->
예제에서 다루는 코드는 `HeroesService`만 해당됩니다.

<!--
### Adding headers
-->
### 헤더 추가하기

<!--
Many servers require extra headers for save operations.
For example, they may require a "Content-Type" header to explicitly declare 
the MIME type of the request body.
Or perhaps the server requires an authorization token.
-->
데이터를 저장하는 HTTP 요청이라면 헤더에 추가 내용을 보내야 하는 경우가 많습니다.
보내는 데이터의 MIME 타입이 어떤 것인지 지정하는 "Content-Type" 헤더도 이 중 하나입니다.
아니면 클라이언트의 인증 정보에 대한 헤더를 요청할 수도 있습니다.

<!--
The `HeroesService` defines such headers in an `httpOptions` object that will be passed
to every `HttpClient` save method.
-->
`HeroesService`가 저장과 관련된 HTTP 요청에 사용할 옵션을 `httpOptions` 객체로 정의합시다. 이 옵션에 헤더를 지정하려면 다음과 같이 작성합니다.

<code-example 
  path="http/src/app/heroes/heroes.service.ts"
  region="http-options" 
  header="app/heroes/heroes.service.ts (httpOptions)" linenums="false">
</code-example>

<!--
### Making a POST request
-->
### POST 요청 보내기

<!--
Apps often POST data to a server. They POST when submitting a form. 
In the following example, the `HeroesService` posts when adding a hero to the database.
-->
데이터는 POST 방식으로 보낼 수도 있습니다. 일반적으로 POST 메소드는 폼을 제출할 때도 사용하며, 우리가 살펴보고 있는 `HeroesService`에서는 히어로를 DB에 추가할 때 사용합니다.

<code-example 
  path="http/src/app/heroes/heroes.service.ts"
  region="addHero" 
  header="app/heroes/heroes.service.ts (addHero)" linenums="false">
</code-example>

<!--
The `HttpClient.post()` method is similar to `get()` in that it has a type parameter
(you're expecting the server to return the new hero)
and it takes a resource URL.
-->
`HttpClient.post()` 메소드는 `get()`메소드와 비슷합니다. 서버로부터 받아올 데이터의 타입을 제네릭으로 지정하고, 첫번째 인자로 서버 API의 URL을 받는 것도 같습니다.

<!--
It takes two more parameters:

1. `hero` - the data to POST in the body of the request.
1. `httpOptions` - the method options which, in this case, [specify required headers](#adding-headers).
-->
여기에 인자를 두 개 더 추가합니다.

1. `hero` - POST 메소드일 때 요청으로 보낼 body 데이터를 지정합니다.
1. `httpOptions` - HTTP 요청에 대한 옵션을 지정합니다. [헤더 추가하기](#헤더-추가하기)에서 지정한 옵션입니다.

<!--
Of course it catches errors in much the same manner [described above](#error-details).
-->
그리고 에러를 처리하는 방식도 [위에서 설명한 내용](#error-details)과 같습니다.

<!--
The `HeroesComponent` initiates the actual POST operation by subscribing to 
the `Observable` returned by this service method.
-->
이제 `HeroesComponent`가 옵저버블을 구독하면 POST 요청이 발생하며, 서버의 응답으로 받은 내용은 `Observable` 타입으로 전달됩니다.

<code-example 
  path="http/src/app/heroes/heroes.component.ts"
  region="add-hero-subscribe" 
  header="app/heroes/heroes.component.ts (addHero)" linenums="false">
</code-example>

<!--
When the server responds successfully with the newly added hero, the component adds
that hero to the displayed `heroes` list.
-->
그러면 새로운 히어로가 정상적으로 추가되었다는 것을 컴포넌트가 알 수 있고, `heroes` 배열에 이 히어로를 추가해서 새로운 목록으로 화면에 표시할 수 있습니다.

<!--
### Making a DELETE request
-->
### DELETE 요청 보내기

<!--
This application deletes a hero with the `HttpClient.delete` method by passing the hero's id
in the request URL.
-->
이 서비스는 히어로를 삭제할 때 `HttpClient.delete` 메소드를 활용하며, 삭제하려는 히어로의 ID는 url에 포함시켜 보냅니다.

<code-example 
  path="http/src/app/heroes/heroes.service.ts"
  region="deleteHero" 
  header="app/heroes/heroes.service.ts (deleteHero)" linenums="false">
</code-example>

<!--
The `HeroesComponent` initiates the actual DELETE operation by subscribing to 
the `Observable` returned by this service method.
-->
이 메소드도 `HeroesComponent`가 구독할 때 실행되기 시작하며, 메소드가 실행되면서 DELETE 요청도 시작됩니다. 그리고 메소드 실행결과는 `Observable` 타입으로 반환됩니다.

<code-example 
  path="http/src/app/heroes/heroes.component.ts"
  region="delete-hero-subscribe" 
  header="app/heroes/heroes.component.ts (deleteHero)" linenums="false">
</code-example>

<!--
The component isn't expecting a result from the delete operation, so it subscribes without a callback. Even though you are not using the result, you still have to subscribe. Calling the `subscribe()` method _executes_ the observable, which is what initiates the DELETE request. 
-->
컴포넌트는 삭제 동작의 결과값을 활용하지 않기 때문에 콜백함수 없이 구독을 시작했습니다. 옵저버블 구독은 이렇게 옵저버를 지정하지 않으면서 시작할 수도 있습니다. `subscribe()` 메소드가 실행되면 옵저버블이 실행되고, DELETE 요청도 시작됩니다.

<div class="alert is-important">

<!--
You must call _subscribe()_ or nothing happens. Just calling `HeroesService.deleteHero()` **does not initiate the DELETE request.**
-->
옵저버블은 _subscribe()_ 함수를 실행해야 시작됩니다. `HeroesService.deleteHero()`를 호출하는 것만으로는 **DELETE 요청이 시작되지 않습니다.**

</div>


<code-example 
  path="http/src/app/heroes/heroes.component.ts"
  region="delete-hero-no-subscribe" linenums="false">
</code-example>

{@a always-subscribe}
<!--
**Always _subscribe_!**
-->
**_subscribe()_ 가 꼭 있어야 합니다!**

<!--
An `HttpClient` method does not begin its HTTP request until you call `subscribe()` on the observable returned by that method. This is true for _all_ `HttpClient` _methods_.
-->
`HttpClient`에서 제공하는 모든 메소드는 `subscribe()` 없이 HTTP 요청이 시작되지 않습니다.

<div class="alert is-helpful">

<!--
The [`AsyncPipe`](api/common/AsyncPipe) subscribes (and unsubscribes) for you automatically.
-->
템플릿에서 [`AsyncPipe`](api/common/AsyncPipe)를 사용하면 옵저버블을 자동으로 구독하고 해지합니다.

</div>

<!--
All observables returned from `HttpClient` methods are _cold_ by design.
Execution of the HTTP request is _deferred_, allowing you to extend the
observable with additional operations such as  `tap` and `catchError` before anything actually happens.
-->
`HttpClient` 메소드가 반환하는 옵저버블은 모두 _콜드 옵저버블(cold observable)_ 입니다.
옵저버블을 구독하는 객체가 없으면 HTTP 요청이 시작되지 않으며, `tap`이나 `catchError`와 같은 RxJS 연산자를 연결해도 구독 전에는 아무것도 실행되지 않습니다.

<!--
Calling `subscribe(...)` triggers execution of the observable and causes
`HttpClient` to compose and send the HTTP request to the server.
-->
그리고 `subscribe(...)`를 실행해야 옵저버블이 시작되고 HTTP 요청도 발생합니다.

<!--
You can think of these observables as _blueprints_ for actual HTTP requests.
-->
옵저버블은 실제 HTTP 요청을 표현한다고 이해할 수도 있습니다.

<div class="alert is-helpful">

<!--
In fact, each `subscribe()` initiates a separate, independent execution of the observable.
Subscribing twice results in two HTTP requests.
-->
`subscribe()` 함수는 실행될 때마다 새로운 옵저버블을 구성합니다.
그래서 이 함수가 두 번 실행되면 HTTP 요청도 두 번 발생합니다.

<!--
```javascript
const req = http.get<Heroes>('/api/heroes');
// 0 requests made - .subscribe() not called.
req.subscribe();
// 1 request made.
req.subscribe();
// 2 requests made.
```
-->
```javascript
const req = http.get<Heroes>('/api/heroes');
// 요청 횟수 0 - .subscribe() 는 아직 실행되지 않았습니다.
req.subscribe();
// 요청 횟수 1
req.subscribe();
// 요청 횟수 2
```
</div>

<!--
### Making a PUT request
-->
### PUT 요청 보내기

<!--
An app will send a PUT request to completely replace a resource with updated data.
The following `HeroesService` example is just like the POST example.
-->
데이터를 교체하는 경우라면 PUT 메소드를 활용할 수 있습니다.
`HeroesService` 에서 PUT 메소드를 사용하는 코드는 POST에서 살펴봤던 것과 비슷합니다.

<code-example 
  path="http/src/app/heroes/heroes.service.ts"
  region="updateHero" 
  header="app/heroes/heroes.service.ts (updateHero)" linenums="false">
</code-example>

<!--
For the reasons [explained above](#always-subscribe), the caller (`HeroesComponent.update()` in this case) must `subscribe()` to the observable returned from the `HttpClient.put()`
in order to initiate the request.
-->
[위에서 설명했던 것처럼](#always-subscribe), 이 메소드도 옵저버블의 `subscribe()`가 실행되어야 HTTP 요청이 시작됩니다.

<!--
## Advanced usage
-->
## 더 활용하기

<!--
We have discussed the basic HTTP functionality in `@angular/common/http`, but sometimes you need to do more than make simple requests and get data back.
-->
지금까지 `@angular/common/http`에서 제공하는 기본 HTTP 기능을 살펴봤습니다. 이제부터는 HttpClient를 실제 상황에 맞게 좀 더 활용하는 방법에 대해 알아봅시다.

<!--
### Configuring the request
-->
### HTTP 요청 설정하기

<!--
Other aspects of an outgoing request can be configured via the options object
passed as the last argument to the `HttpClient` method.
-->
HTTP 요청을 보낼 때 활용하는 `HttpClient` 메소드에 마지막 인자를 지정하면 요청에 대한 옵션을 지정할 수 있습니다.

<!--
You [saw earlier](#adding-headers) that the `HeroesService` sets the default headers by
passing an options object (`httpOptions`) to its save methods.
You can do more.
-->
[이미 이전에 봤던 것처럼](#헤더-추가하기) `HeroesService`는 `httpOptions` 객체를 사용해서 헤더를 지정하고 있습니다.
헤더 외에 다른 옵션을 더 지정해 봅시다.

<!--
#### Update headers
-->
#### 헤더 수정하기

<!--
You can't directly modify the existing headers within the previous options
object because instances of the `HttpHeaders` class are immutable.
-->
이전에 헤어를 지정하면서 만든 Httpheaders 객체의 프로퍼티는 직접 수정할 수 없습니다. 왜냐하면 `HttpHeaders` 클래스는 이뮤터블(immutable)이기 때문입니다.

<!--
Use the `set()` method instead. 
It returns a clone of the current instance with the new changes applied.
-->
대신 `set()` 메소드를 활용합니다. 이 메소드를 실행하면 새로운 값이 적용된 인스턴스를 반환합니다.

<!--
Here's how you might update the authorization header (after the old token expired) 
before making the next request.
-->
이전에 발급받은 인증 토큰이 만료되었다고 가정하고, 새로운 요청을 위해 헤더의 `Authorization` 필드를 수정하는 코드는 다음과 같이 작성합니다.

<code-example 
  path="http/src/app/heroes/heroes.service.ts"
  region="update-headers" linenums="false">
</code-example>

<!--
#### URL Parameters
-->
#### URL 인자

<!--
Adding URL search parameters works a similar way.
Here is a `searchHeroes` method that queries for heroes whose names contain the search term.
-->
URL을 활용하면 검색어와 같은 인자를 추가로 전달할 수 있습니다.
다음 살펴보는 `searchHeroes` 메소드는 입력된 단어가 이름에 포함된 히어로를 찾는 함수입니다.

<code-example 
  path="http/src/app/heroes/heroes.service.ts"
  region="searchHeroes" linenums="false">
</code-example>

<!--
If there is a search term, the code constructs an options object with an HTML URL-encoded search parameter. If the term were "foo", the GET request URL would be `api/heroes/?name=foo`.
-->
이 함수가 인자를 받으면 HTML URL 방식으로 인코딩 된 객체를 생성합니다. 만약 "foo"라는 인자가 전달되면, 이 인자를 포함해서 요청하는 GET 주소는 `api/heroes/?name=foo`가 될 것입니다.

<!--
The `HttpParams` are immutable so you'll have to use the `set()` method to update the options.
-->
`HttpParams`도 이뮤터블 클래스이기 때문에, 값을 수정하려면 `set()` 메소드를 사용해야 합니다.

<!--
### Debouncing requests
-->
### 연속된 요청 처리하기 (debouncing request)

<!--
The sample includes an _npm package search_ feature.
-->
이번에는 _npm 패키지를 검색하는 기능_ 을 구현해 봅시다.

<!--
When the user enters a name in a search-box, the `PackageSearchComponent` sends
a search request for a package with that name to the NPM web API.
-->
사용자가 `PackageSearchComponent`에 있는 검색 필드에 텍스트를 입력하면, 이 값을 NPM 웹 API로 보내서 해당 패키지가 있는지 검색하려고 합니다.

<!--
Here's a pertinent excerpt from the template:
-->
먼저, 템플릿은 이렇게 구성합니다:

<code-example 
  path="http/src/app/package-search/package-search.component.html"
  region="search" 
  header="app/package-search/package-search.component.html (search)">
</code-example>

<!--
The `(keyup)` event binding sends every keystroke to the component's `search()` method.
-->
그러면 `(keyup)` 이벤트가 바인딩 되었기 떄문에, 키 입력이 발생할 때마다 컴포넌트의 `search()` 메소드가 실행됩니다.

<!---
Sending a request for every keystroke could be expensive.
It's better to wait until the user stops typing and then send a request.
That's easy to implement with RxJS operators, as shown in this excerpt.
-->
하지만 키입력이 있을 때마다 HTTP 요청을 보내는 것은 효율적이지 않습니다.
이런 경우는 사용자가 입력을 멈추기를 기다렸다가 요청을 보내는 것이 더 좋습니다.
이 동작은 RxJS 연산자를 활용하면 쉽게 구현할 수 있습니다.

<code-example 
  path="http/src/app/package-search/package-search.component.ts"
  region="debounce" 
  header="app/package-search/package-search.component.ts (excerpt)">
</code-example>

<!--
The `searchText$` is the sequence of search-box values coming from the user.
It's defined as an RxJS `Subject`, which means it is a multicasting `Observable`
that can also produce values for itself by calling `next(value)`,
as happens in the `search()` method.
-->
`searchText$`는 검색 필드에서 사용자가 입력하는 문자열을 표현합니다.
이 프로퍼티는 RxJS `Subject` 타입으로 정의되었는데, 이 객체는 `Observable`을 상속받아 만든 객체이며, `next(값)` 메소드를 실행하면 다음 값을 직접 보낼 수 있도록 확장된 객체입니다. 이 코드에서는 `next()`가 실행될 때마다 `search()` 메소드가 실행됩니다.

<!--
Rather than forward every `searchText` value directly to the injected `PackageSearchService`,
the code in `ngOnInit()` _pipes_ search values through three operators:
-->
모든 입력값을 `PackageSearchService`로 보내는 대신, 이 코드에서는 `ngOnInit()` 메소드에 _파이프_ 를 사용해서 연산자 3개를 연결합니다:

<!--
1. `debounceTime(500)` - wait for the user to stop typing (1/2 second in this case).
1. `distinctUntilChanged()` - wait until the search text changes.
1. `switchMap()` - send the search request to the service.
-->
1. `debounceTime(500)` - 사용자의 입력이 멈추는 것을 기다립니다. 이 코드의 경우는 500ms 기다립니다.
1. `distinctUntilChanged()` - 입력 필드의 값이 실제로 변경되는 것을 기다립니다.
1. `switchMap()` - 서비스로 요청을 보냅니다.

<!--
The code sets `packages$` to this re-composed `Observable` of search results.
The template subscribes to `packages$` with the [AsyncPipe](api/common/AsyncPipe)
and displays search results as they arrive.
-->
위 코드에서 `packages$`는 검색 결과로 받는 `Observable`을 표현합니다.
그리고 이 프로퍼티는 템플릿에서 [AsyncPipe](api/common/AsyncPipe)를 사용해서 구독하기 때문에, 응답이 올때 자동으로 템플릿도 갱신됩니다.

<!--
A search value reaches the service only if it's a new value and the user has stopped typing.
-->
이렇게 작성하면 사용자가 멈췄을 때, 새로운 값일 때만 서비스로 검색어가 전달됩니다.

<div class="alert is-helpful">

<!--
The `withRefresh` option is explained [below](#cache-refresh).
-->
`withRefresh` 옵션은 [아래](#cache-refresh)에서 다시 알아봅니다.

</div>

#### _switchMap()_

<!--
The `switchMap()` operator has three important characteristics.
-->
`switchMap()` 연산자에는 중요한 특징이 3가지 있습니다.

<!--
1. It takes a function argument that returns an `Observable`.
`PackageSearchService.search` returns an `Observable`, as other data service methods do.
-->
1. 이 연산자는 인자로 `Observable`을 반환하는 함수를 받습니다.
`PackageSearchService.search` 함수도 옵저버블을 반환하기 때문에 이 코드에 사용했습니다.

<!--
2. If a previous search request is still _in-flight_ (as when the connection is poor),
it cancels that request and sends a new one.
-->
2. 이전에 시작한 검색 요청이 _아직 완료되지 않았으면_ 이전 요청을 취소하고 새로운 요청을 보냅니다. 

<!--
3. It returns service responses in their original request order, even if the
server returns them out of order. 
-->
3. 이 연산자는 연산자에 전달된 스트림 순서로 결과를 반환합니다. 서버에서 어떤 순서로 반환하는지는 관계없습니다.


<div class="alert is-helpful">

<!--
If you think you'll reuse this debouncing logic,
consider moving it to a utility function or into the `PackageSearchService` itself.
-->
이 로직을 재활용하려면 이 로직의 위치를 컴포넌트 대신 `PackageSearchService`로 옮기는 것이 좋습니다.

</div>

{@a intercepting-requests-and-responses}

<!--
### Intercepting requests and responses
-->
### HTTP 요청/응답 가로채기

<!--
_HTTP Interception_ is a major feature of `@angular/common/http`. 
With interception, you declare _interceptors_ that inspect and transform HTTP requests from your application to the server.
The same interceptors may also inspect and transform the server's responses on their way back to the application.
Multiple interceptors form a _forward-and-backward_ chain of request/response handlers.
-->
_HTTP 요청과 응답을 가로채는 동작_ 은 `@angular/common/http`에서 제공하는 주요 기능 중 하나입니다.
HTTP 요청을 가로채려면, 먼저 애플리케이션에서 서버로 보내는 HTTP 요청을 확인하고 조작할 수 있는 _인터셉터(interceptor)_ 를 정의해야 합니다.
그리고 이렇게 구현한 인터셉터로 서버에서 애플리케이션으로 향하는 HTTP 응답도 확인하고 조작할 수 있습니다.
인터셉터는 여러 개가 순서대로 실행되도록 체이닝할 수도 있습니다.

<!--
Interceptors can perform a variety of  _implicit_ tasks, from authentication to logging, in a routine, standard way, for every HTTP request/response. 
-->
인터셉터는 다양한 기능을 수행할 수 있습니다. 일반적으로는 HTTP 요청/응답에 대해 사용자 인증 정보를 확인하고 로그를 출력하기 위해 사용합니다.

<!--
Without interception, developers would have to implement these tasks _explicitly_ 
for each `HttpClient` method call.
-->
만약 인터셉터를 사용하지 않는다면, 모든 `HttpClient` 메소드가 실행될 때마다 필요한 작업을 _직접_ 처리해야 합니다.

<!--
#### Write an interceptor
-->
#### 인터셉터 구현하기

<!--
To implement an interceptor, declare a class that implements the `intercept()` method of the `HttpInterceptor` interface.
-->
인터셉터를 구현하려면, `HttpInterceptor` 인터페이스를 사용하는 클래스를 정의하고 이 클래스 안에 `intercept()` 메소드를 정의하면 됩니다.

<!--
 Here is a do-nothing _noop_ interceptor that simply passes the request through without touching it:
-->
다음 코드는 기존 HTTP 요청을 변형하지 않고 그대로 통과시키는 인터셉터 기본 코드입니다:

<code-example 
  path="http/src/app/http-interceptors/noop-interceptor.ts"
  header="app/http-interceptors/noop-interceptor.ts"
  linenums="false">
</code-example>

<!--
The `intercept` method transforms a request into an `Observable` that eventually returns the HTTP response. 
In this sense, each interceptor is fully capable of handling the request entirely by itself.
-->
`intercept` 메소드는 `Observable` 타입으로 HTTP 요청을 받아서 HTTP 응답을 반환합니다.
이것만 봐도, 각각의 인터셉터는 HTTP 요청에 대해 모든 것을 조작할 수 있습니다.

<!--
Most interceptors inspect the request on the way in and forward the (perhaps altered) request to the `handle()` method of the `next` object which implements the [`HttpHandler`](api/common/http/HttpHandler) interface.
-->
일반적으로 인터셉터는 요청을 보내거나 응답을 받는 방향을 그대로 유지하기 위해, [`HttpHandler`](api/common/http/HttpHandler) 인터페이스로 받은 `next` 인자의 `handle()` 메소드를 호출합니다.

```javascript
export abstract class HttpHandler {
  abstract handle(req: HttpRequest<any>): Observable<HttpEvent<any>>;
}
```

<!--
Like `intercept()`, the `handle()` method transforms an HTTP request into an `Observable` of [`HttpEvents`](#httpevents) which ultimately include the server's response. The `intercept()` method could inspect that observable and alter it before returning it to the caller.
-->
`intercept()`와 비슷하게, `handle()` 메소드도 HTTP 요청으로 받은 옵저버블을 [`HttpEvents`](#httpevents) 타입의 옵저버블로 변환하며, 이 타입이 서버의 최종 응답을 표현하는 타입입니다. `intercept()` 메소드는 이렇게 받은 서버의 응답을 확인할 수 있으며, HTTP 요청을 시작한 컨텍스트로 돌아가기 전까지 옵저버블의 내용을 조작할 수 있습니다.

<!--
This _no-op_ interceptor simply calls `next.handle()` with the original request and returns the observable without doing a thing.
-->
원래 HTTP 요청이나 응답을 조작하지 않고 그대로 통과시키려면 단순하게 `next.handle()`을 실행하면 됩니다.

<!--
#### The _next_ object
-->
#### _next_ 객체

<!--
The `next` object represents the next interceptor in the chain of interceptors. 
The final `next` in the chain is the `HttpClient` backend handler that sends the request to the server and receives the server's response.
-->
`next` 객체는 체이닝되는 인터셉터 중 다음으로 실행될 인터셉터를 의미합니다.
그리고 인터셉터 체인 중 마지막 인터셉터가 받는 `next` 객체는 `HttpClient` 백엔드 핸들러이며, 이 핸들러가 실제로 HTTP 요청을 보내고 서버의 응답을 첫번째로 받는 핸들러입니다.

<!--
Most interceptors call `next.handle()` so that the request flows through to the next interceptor and, eventually, the backend handler.
An interceptor _could_ skip calling `next.handle()`, short-circuit the chain, and [return its own `Observable`](#caching) with an artificial server response. 
-->
인터셉터는 대부분 HTTP 요청이 진행되는 흐름을 그대로 유지하기 위해 `next.handle()`를 실행하며, 최종적으로는 백엔드 핸들러가 실행됩니다.
하지만 서버의 응답을 시뮬레이션하는 경우라면 `next.handle()`을 실행하지 않고 [바로 `Observable`](#캐싱)을 반환하면서 인터셉터 체인을 멈출 수도 있습니다.

<!--
This is a common middleware pattern found in frameworks such as Express.js.
-->
이 방식은 Express.js와 같은 프레임워크에서 미들웨어 패턴으로 자주 사용하는 방식입니다.

<!--
#### Provide the interceptor
-->
#### 인터셉터 적용하기

<!--
The `NoopInterceptor` is a service managed by Angular's [dependency injection (DI)](guide/dependency-injection) system. 
Like other services, you must provide the interceptor class before the app can use it.
-->
이렇게 정의한 `NoopInterceptor`는 Angular [의존성 주입 (DI)](guide/dependency-injection) 체계에서 관리되는 Angular 서비스 입니다.
그래서 다른 서비스와 비슷하게, 애플리케이션에 사용하기 위해 프로바이더를 등록해야 합니다.

<!--
Because interceptors are (optional) dependencies of the `HttpClient` service, 
you must provide them in the same injector (or a parent of the injector) that provides `HttpClient`. 
Interceptors provided _after_ DI creates the `HttpClient` are ignored.
-->
인터셉터는 `HttpClient` 서비스에 의존적이기 때문에, `HttpClient`가 존재하는 인젝터나 이 인젝터의 상위 인젝터에 등록되어야 합니다.
`HttpClient`가 이미 생성된 _이후에_ 등록되는 인터셉터는 동작하지 않습니다.

<!--
This app provides `HttpClient` in the app's root injector, as a side-effect of importing the `HttpClientModule` in `AppModule`.
You should provide interceptors in `AppModule` as well.
-->
예제에서 다루는 앱은 `AppModule`에 `HttpClientModule`을 로드하고 있기 때문에 애플리케이션의 최상위 인젝터에 `HttpClient`가 로드 됩니다. 따라서, 이 경우라면 `AppModule`에 인터셉터를 등록해야 합니다.

<!--
After importing the `HTTP_INTERCEPTORS` injection token from `@angular/common/http`,
write the `NoopInterceptor` provider like this:
-->
인터셉터를 등록하려면 `@angular/common/http`에서 `HTTP_INTERCEPTORS` 의존성 주입 토큰을 불러와서 다음과 같이 작성합니다:

<code-example 
  path="http/src/app/http-interceptors/index.ts"
  region="noop-provider" linenums="false">
</code-example>

<!--
Note the `multi: true` option. 
This required setting tells Angular that `HTTP_INTERCEPTORS` is a token for a _multiprovider_ 
that injects an array of values, rather than a single value.
-->
이 때 `multi: true` 옵션을 지정했습니다.
이 옵션을 지정하면 `HTTP_INTERCEPTORS` 토큰으로 적용되는 인터셉터가 하나만 있는 것이 아니라, _여러 개_ 있다는 것을 의미합니다.

<!--
You _could_ add this provider directly to the providers array of the `AppModule`.
However, it's rather verbose and there's a good chance that 
you'll create more interceptors and provide them in the same way.
You must also pay [close attention to the order](#interceptor-order) 
in which you provide these interceptors.
-->
이 프로바이더 설정은 `AppModule`의 프로바이더 배열에 바로 추가할 수 있습니다.
하지만 인터셉터가 여러개 있다면, 이 프로바이더 설정을 한 번에 묶어서 사용하는 방법도 좋습니다.
이렇게 인터셉터 여러 개를 동시에 적용한다면, [인터셉터가 실행되는 순서](#인터셉터-실행-순서)에 주의해야 합니다.

<!--
Consider creating a "barrel" file that gathers all the interceptor providers into an `httpInterceptorProviders` array, starting with this first one, the `NoopInterceptor`.
-->
인터셉터 프로바이더를 모두 파일 하나로 모으고, `httpInterceptorProviders` 배열로 관리해 봅시다. 먼저, 위에서 만든 `NoopInterceptor`를 다음과 같이 추가합니다.

<code-example 
  path="http/src/app/http-interceptors/index.ts"
  region="interceptor-providers"
  header="app/http-interceptors/index.ts" linenums="false">
</code-example>

<!--
Then import and add it to the `AppModule` _providers array_ like this:
-->
그리고 `AppModule`에 작성했던 _프로바이더 배열_ 을 다음과 같이 수정합니다:

<code-example 
  path="http/src/app/app.module.ts"
  region="interceptor-providers"
  header="app/app.module.ts (interceptor providers)" linenums="false">
</code-example>

<!--
As you create new interceptors, add them to the `httpInterceptorProviders` array and
you won't have to revisit the `AppModule`.
-->
이제 새로운 인터셉터를 추가했을 때 `httpInterceptorProviders`에 등록하기만 하면, `AppModule`은 따로 수정하지 않아도 됩니다.

<div class="alert is-helpful">

<!--
There are many more interceptors in the complete sample code.
-->
이 문서의 최종 예제 코드에는 더 많은 인터셉터가 사용되었습니다.

</div>

<!--
#### Interceptor order
-->
#### 인터셉터 실행 순서

<!--
Angular applies interceptors in the order that you provide them.
If you provide interceptors _A_, then _B_, then _C_,  requests will flow in _A->B->C_ and
responses will flow out _C->B->A_.
-->
인터셉터는 등록한 순서대로 적용됩니다.
그래서 인터셉터 _A_, _B_, _C_ 순서대로 지정하면, HTTP 요청이 _A->B->C_ 순서로 처리되고 HTTP 응답은 _C->B->A_ 순서로 처리됩니다.

<!--
You cannot change the order or remove interceptors later.
If you need to enable and disable an interceptor dynamically, you'll have to build that capability into the interceptor itself.
-->
인터셉터를 등록한 이후에 실행 순서를 변경하거나 특정 인터셉터를 건너뛸 수는 없습니다.
인터셉터를 적용할지 건너뛰어야 할지 지정하려면 인터셉터 안에 동적으로 로직을 작성해야 합니다.

#### _HttpEvents_

<!--
You may have expected the `intercept()` and `handle()` methods to return observables of `HttpResponse<any>` as most `HttpClient` methods do.
-->
`intercept()`나 `handle()` 메소드는 `HttpClient`에서 제공하는 다른 메소드들처럼 `HttpResponse<any>` 타입의 옵저버블을 반환할 것이라고 생각할 수 있습니다.

<!--
Instead they return observables of `HttpEvent<any>`.
-->
하지만 이 예상과 다르게, 인터셉터에서 사용하는 함수들은 `HttpEvent<any>` 타입의 옵저버블을 반환합니다.

<!--
That's because interceptors work at a lower level than those `HttpClient` methods. A single HTTP request can generate multiple _events_, including upload and download progress events. The `HttpResponse` class itself is actually an event, whose type is `HttpEventType.HttpResponseEvent`.
-->
반환형식이 다른 이유는 인터셉터가 `HttpClient`에서 제공하는 메소드들보다 더 낮은 레벨에서 동작하기 때문입니다. HTTP 요청이 한 번 실행되는 동안 _이벤트_ 는 여러번 발생할 수 있는데, 업로드 진행률이나 다운로드 진행률에 대한 이벤트도 이런 이벤트에 포함됩니다. `HttpResponse` 클래스도 이런 이벤트 중 하나를 의미하며, 실제로도 `HttpEventType.HttpResponseEvent`으로 정의되어 있습니다.

<!--
Many interceptors are only concerned with the outgoing request and simply return the event stream from `next.handle()` without modifying it.
-->
한 인터셉터에서 그 단계에서 필요한 로직을 끝내고 나면 마지막으로 대부분 `next.handle()` 함수를 실행합니다.

<!--
But interceptors that examine and modify the response from `next.handle()` 
will see all of these events. 
Your interceptor should return _every event untouched_ unless it has a _compelling reason to do otherwise_.
-->
하지만 `next.handle()` 에서 처리되는 내용을 이벤트로 간주하고 이 내용을 직접 확인하고 조작할 수도 있습니다.
물론 _특별한 이유가 없다면_ HTTP 요청을 보내고 응답으로 받는 흐름을 유지하기 위해 _기존 흐름을 유지하는 것_ 이 좋습니다.

<!--
#### Immutability
-->
{@a 불변성}
#### 불변성 (Immutability)

<!--
Although interceptors are capable of mutating requests and responses,
the `HttpRequest` and `HttpResponse` instance properties are `readonly`,
rendering them largely immutable.
-->
인터셉터는 HTTP 요청과 응답을 조작할 수 있지만, `HttpRequest`와 `HttpResponse` 인스턴스의 프로퍼티들은 대부분 `readonly`로 지정되어 있으며, 이 프로퍼티 자체는 모두 이뮤터블입니다.

<!--
They are immutable for a good reason: the app may retry a request several times before it succeeds, which means that the interceptor chain may re-process the same request multiple times.
If an interceptor could modify the original request object, the re-tried operation would start from the modified request rather than the original. Immutability ensures that interceptors see the same request for each try.
-->
프로퍼티들이 이뮤터블로 지정된 이유가 있습니다. 애플리케이션에서 보내는 HTTP 요청은 성공하기까지 몇차례 재시도될 수 있는데, 이 말은 동일한 HTTP 요청과 인터셉터 체이닝이 몇차례 반복된다는 것을 의미합니다.
만약 인터셉터가 처음 요청된 객체를 바꿔버린다면, 재시도했을 때 보내는 요청은 처음과 달라진다는 말이 됩니다. HTTP 요청이 재시도 되더라도 같은 조건에서 실행되기 위해 인터셉터에 전달되는 객체는 불변성이 보장되어야 합니다.

<!--
TypeScript will prevent you from setting `HttpRequest` readonly properties. 
-->
그래서 다음과 같이 읽기 전용으로 지정된 `HttpRequest`의 프로퍼티로 변경하는 것은 TypeScript에서도 유효하지 않습니다.

<!--
```javascript
  // Typescript disallows the following assignment because req.url is readonly
  req.url = req.url.replace('http://', 'https://');
```
-->
```javascript
  // req.url은 읽기 전용 프로퍼티이기 때문에 다음과 같은 문법은 TypeScript에서 유효하지 않습니다.
  req.url = req.url.replace('http://', 'https://');
```

<!--
To alter the request, clone it first and modify the clone before passing it to `next.handle()`. 
You can clone and modify the request in a single step as in this example.
-->
그래서 요청으로 보내는 객체를 수정하려면, 이 객체의 인스턴스를 복사한 후에 `next.handle()` 메소드로 전달해야 합니다.
위에서 실패한 문법은 다음과 같이 수정할 수 있습니다.

<code-example 
  path="http/src/app/http-interceptors/ensure-https-interceptor.ts"
  region="excerpt" 
  header="app/http-interceptors/ensure-https-interceptor.ts (excerpt)" linenums="false">
</code-example>

<!--
The `clone()` method's hash argument allows you to mutate specific properties of the request while copying the others.
-->
`clone()` 메소드를 사용하면 특정 프로퍼티의 값을 원하는 값으로 수정한 인스턴스를 생성할 수 있고, 다음 실행되는 핸들러에 새로운 인스턴스를 전달할 수 있습니다.

<!--
##### The request body
-->
#### HTTP 요청 바디

<!--
The `readonly` assignment guard can't prevent deep updates and, in particular, 
it can't prevent you from modifying a property of a request body object.
-->
`readonly`로 지정된 프로퍼티 값은 직접 수정할 수 없습니다. 그래서 다음과 같이 HTTP 요청 바디를 직접 수정하는 구문도 유효하지 않습니다.

<!--
```javascript
  req.body.name = req.body.name.trim(); // bad idea!
```
-->
```javascript
  req.body.name = req.body.name.trim(); // 오류가 발생합니다!
```

<!--
If you must mutate the request body, copy it first, change the copy, 
`clone()` the request, and set the clone's body with the new body, as in the following example.
-->
그래서 HTTP 바디를 수정하려면, 이 인스턴스를 수정해서 복제한 인스턴스를 사용해야 합니다.
이 때 `clone()` 메소드를 다음과 같이 사용합니다.

<code-example 
  path="http/src/app/http-interceptors/trim-name-interceptor.ts"
  region="excerpt" 
  header="app/http-interceptors/trim-name-interceptor.ts (excerpt)" linenums="false">
</code-example>

<!--
##### Clearing the request body
-->
##### HTTP 요청 바디 비우기

<!--
Sometimes you need to clear the request body rather than replace it.
If you set the cloned request body to `undefined`, Angular assumes you intend to leave the body as is.
That is not what you want.
If you set the cloned request body to `null`, Angular knows you intend to clear the request body.
-->
어떤 경우에는 HTTP 요청 바디를 수정하지 않고 모두 비우는 로직이 필요할 수도 있습니다.
하지만 이전처럼 HTTP 요청을 복제하면서 바디의 내용을 `undefined`로 설정하면, Angular는 바디를 수정하지 않습니다.
원하던 것은 이게 아니죠.
이 때 HTTP 요청을 복제할 때 `undefined` 대신 `null`을 지정하면 Angular가 HTTP 요청 바디를 모두 비웁니다.

<!--
```javascript
  newReq = req.clone({ ... }); // body not mentioned => preserve original body
  newReq = req.clone({ body: undefined }); // preserve original body
  newReq = req.clone({ body: null }); // clear the body
```
-->
```javascript
  newReq = req.clone({ ... }); // 바디는 언급되지 않았습니다 => 기존 바디를 유지합니다.
  newReq = req.clone({ body: undefined }); // 기존 바디가 유지됩니다.
  newReq = req.clone({ body: null }); // 바디를 모두 비웁니다.
```

<!--
#### Set default headers
-->
#### 기본 헤더 설정하기

<!--
Apps often use an interceptor to set default headers on outgoing requests. 
-->
인터셉터는 애플리케이션에서 보내는 HTTP 요청에 기본 헤더를 설정하는 용도로도 자주 사용합니다.

<!--
The sample app has an `AuthService` that produces an authorization token.
Here is its `AuthInterceptor` that injects that service to get the token and
adds an authorization header with that token to every outgoing request:
-->
이번에 다루는 앱에는 인증 토큰을 생성하는 `AuthService`가 있습니다.
그리고 `AuthInterceptor`는 이 서비스를 주입받아 토큰을 받아오고, 애플리케이션에서 보내는 모든 HTTP 요청에 인증 헤더를 추가합니다:

<code-example 
  path="http/src/app/http-interceptors/auth-interceptor.ts"
  header="app/http-interceptors/auth-interceptor.ts">
</code-example>

<!--
The practice of cloning a request to set new headers is so common that 
there's a `setHeaders` shortcut for it:
-->
이 때 헤더를 설정하기 위해 HTTP 요청을 복제하는 것은 자주 사용되는 로직이기 때문에, `setHeaders` 옵션을 사용할 수도 있습니다.

<code-example 
  path="http/src/app/http-interceptors/auth-interceptor.ts"
  region="set-header-shortcut">
</code-example>

<!--
An interceptor that alters headers can be used for a number of different operations, including:

* Authentication/authorization
* Caching behavior; for example, `If-Modified-Since`
* XSRF protection
-->
인터셉터가 헤더를 수정하는 동작은 다음과 같은 경우에도 다양하게 적용할 수 있습니다:

* 인증 발급/확인
* `If-Modified-Since`을 활용한 캐싱
* XSRF 보안

<!--
#### Logging
-->
#### 로그

<!--
Because interceptors can process the request and response _together_, they can do things like time and log 
an entire HTTP operation. 
-->
인터셉터는 HTTP 요청과 응답에 _모두_ 관여하기 때문에, HTTP 응답 시간이나 HTTP 동작에 대한 내용을 모두 확인할 수 있습니다.

<!--
Consider the following `LoggingInterceptor`, which captures the time of the request,
the time of the response, and logs the outcome with the elapsed time
with the injected `MessageService`.
-->
HTTP 요청이 발생한 시간과 응답이 도착한 시간을 확인하고, 최종 HTTP 통신에 걸린 시간을 `MessageService`로 출력하는 인터셉터를 구현해 봅시다. 이 인터셉터는 `LoggingInterceptor`라는 이름으로 구현합니다.

<code-example 
  path="http/src/app/http-interceptors/logging-interceptor.ts"
  region="excerpt" 
  header="app/http-interceptors/logging-interceptor.ts)">
</code-example>

<!--
The RxJS `tap` operator captures whether the request succeeded or failed.
The RxJS `finalize` operator is called when the response observable either errors or completes (which it must),
and reports the outcome to the `MessageService`.
-->
RxJS가 제공하는 `tap` 연산자와 `finalize`는 HTTP 요청이 성공하거나 실패하는 것에 관계없이 모든 응답에 대해 실행됩니다.
이 코드에서는 `finalize`가 실행될 때 `MessageService`로 로그를 보냅니다.

<!--
Neither `tap` nor `finalize` touch the values of the observable stream returned to the caller.
-->
`tap` 연산자와 `finalize` 연산자 모두 옵저버블의 값을 확인하기만 하고, 옵저버블의 내용은 변경하지 않습니다.

<!--
#### Caching
-->
#### 캐싱

<!--
Interceptors can handle requests by themselves, without forwarding to `next.handle()`.

For example, you might decide to cache certain requests and responses to improve performance.
You can delegate caching to an interceptor without disturbing your existing data services. 

The `CachingInterceptor` demonstrates this approach.
-->
인터셉터는 `next.handle()`을 사용하지 않고 그 단계에서 바로 응답을 보낼 수도 있습니다.

이 동작은 HTTP 요청에 대한 성능을 향상시키기 위해 특정 요청을 캐싱하는 용도로 사용할 수 있습니다.
그러면 기존에 있던 서비스 로직을 수정하지 않고도 인터셉터에 캐싱 기능을 구현할 수 있습니다.

`CachingInterceptor`는 다음과 같이 구현합니다.

<code-example 
  path="http/src/app/http-interceptors/caching-interceptor.ts"
  region="v1" 
  header="app/http-interceptors/caching-interceptor.ts)" linenums="false">
</code-example>

<!--
The `isCachable()` function determines if the request is cachable.
In this sample, only GET requests to the npm package search api are cachable.
-->
`isCachable()` 함수는 이 요청이 캐싱 대상인지 판단합니다.
이 예제에서는 npm 패키지를 GET 방식으로 검색하는 요청이 캐싱 대상입니다.

<!--
If the request is not cachable, the interceptor simply forwards the request 
to the next handler in the chain.
-->
HTTP 요청이 캐싱 대상이 아니면, 인터셉터는 이 요청을 다음 핸들러로 그냥 통과시킵니다.

<!--
If a cachable request is found in the cache, the interceptor returns an `of()` _observable_ with
the cached response, by-passing the `next` handler (and all other interceptors downstream).
-->
그리고 HTTP 요청이 캐싱 대상이고 이 응답이 캐싱되어 있으면, 인터셉터가 `of()` 연산자를 사용해서 캐싱된 응답을 바로 반환하면서 `next` 핸들러를 실행하지 않습니다.

<!--
If a cachable request is not in cache, the code calls `sendRequest`.
-->
캐싱 대상인 HTTP 요청이 캐싱되어 있지 않으면 `sendRequest` 함수를 실행해서 HTTP 요청을 보냅니다.

{@a send-request}
<code-example 
  path="http/src/app/http-interceptors/caching-interceptor.ts"
  region="send-request">
</code-example>

<!--
The `sendRequest` function creates a [request clone](#immutability) without headers
because the npm api forbids them.
-->
npm에서 제공하는 API는 헤더를 사용하지 않기 때문에 `sendRequest` 함수에서 [HTTP 요청을 복제한 인스턴스](#불변성)를 생성할 때 헤더를 모두 비웁니다.

<!--
It forwards that request to `next.handle()` which ultimately calls the server and
returns the server's response.
-->
그리고 `next.handle()`을 실행하면 서버로 HTTP 요청을 보고 응답을 받습니다.

<!--
Note how `sendRequest` _intercepts the response_ on its way back to the application.
It _pipes_ the response through the `tap()` operator,
whose callback adds the response to the cache.
-->
`sendRequest`가 응답을 어떻게 반환하는지 확인해 보세요.
이 함수는 서버에서 받은 응답을 체이닝하는데, 이 때 `tap()` 연산자를 사용해서 서버의 응답을 캐싱합니다.

<!--
The original response continues untouched back up through the chain of interceptors
to the application caller. 
-->
서버에서 받은 원래 응답은 수정되지 않은 채로 HTTP 요청을 시작한 컨텍스트로 반환됩니다.

<!--
Data services, such as `PackageSearchService`, are unaware that 
some of their `HttpClient` requests actually return cached responses.
-->
이 예제에서는 `PackageSearchService`가 서버의 응답을 받으며, 이 때 받은 응답이 실제 HTTP 요청으로 받은 것인지 캐싱된 것을 받은 것인지는 신경쓰지 않아도 됩니다.

{@a cache-refresh}
<!--
#### Return a multi-valued _Observable_
-->
#### 옵저버블 여러번 활용하기

<!--
The `HttpClient.get()` method normally returns an _observable_ 
that either emits the data or an error. 
Some folks describe it as a "_one and done_" observable.
-->
`HttpClient.get()` 메소드는 일반적으로 서버에서 받은 데이터나 에러를 _옵저버블_ 하나로 반환합니다.
그래서 이 옵저버블은 "_한 번 사용하면 끝나는_" 옵저버블이라고도 합니다.

<!--
But an interceptor can change this to an _observable_ that emits more than once.
-->
인터셉터는 이 옵저버블을 여러번 활용할 수도 있습니다.

<!--
A revised version of the `CachingInterceptor` optionally returns an _observable_ that
immediately emits the cached response, sends the request to the NPM web API anyway,
and emits again later with the updated search results.
-->
이번에는 캐싱된 서버 응답을 한 번 반환하고 끝내는 대신, NPM 웹 API로 요청을 한 번 더 보내고 이렇게 받은 서버의 응답을 다시 한 번 보내는 방식으로 `CachingInterceptor`를 수정해 봅시다.

<code-example 
  path="http/src/app/http-interceptors/caching-interceptor.ts"
  region="intercept-refresh">
</code-example>

<!--
The _cache-then-refresh_ option is triggered by the presence of a **custom `x-refresh` header**.
-->
이 때 업데이트 방식으로 동작하는지는 **`x-refresh`라는 커스텀 헤더**로 설정합니다.

<div class="alert is-helpful">

<!--
A checkbox on the `PackageSearchComponent` toggles a `withRefresh` flag,
which is one of the arguments to `PackageSearchService.search()`.
That `search()` method creates the custom `x-refresh` header
and adds it to the request before calling `HttpClient.get()`.
-->
그리고 `PackageSearchComponent` 컴포넌트에는 `withRefresh` 플래그와 연결된 체크박스를 추가합니다. 이 체크박스의 값이 true이면 `PackageSearchService.search()`에서 `HttpClient.get()` 함수를 실행하기 전에 `x-refresh` 헤더를 추가합니다.

</div>

<!--
The revised `CachingInterceptor` sets up a server request 
whether there's a cached value or not, 
using the same `sendRequest()` method described [above](#send-request).
The `results$` observable will make the request when subscribed.
-->
이렇게 수정한 `CachingInterceptor`는 캐싱된 서버 응답이 있는 것과 관계없이 `sendRequest()` 메소드로 서버 요청을 보냅니다.
그리고 서버에서 받은 응답은 `results$` 옵저버블로 처리합니다.

<!--
If there's no cached value, the interceptor returns `results$`.
-->
캐싱된 서버 응답이 없으면 인터셉터는 `results$`를 바로 반환합니다.

<!--
If there is a cached value, the code _pipes_ the cached response onto
`results$`, producing a recomposed observable that emits twice,
the cached response first (and immediately), followed later
by the response from the server.
Subscribers see a sequence of _two_ responses.
-->
그리고 캐싱된 서버 응답이 있는 경우에는 캐싱된 서버 응답을 _파이프_ 로 연결해서 `results$`와 합치는데, 이 때 캐싱된 서버 응답이 즉시 반환되고, 서버에서 응답이 왔을 때 추가 응답이 다음으로 반환됩니다.
HTTP 요청을 시작한 쪽에서는 서버 응답을 _두 번_ 받게 됩니다.

<!--
### Listening to progress events
-->
### 진행률 이벤트 확인하기

<!--
Sometimes applications transfer large amounts of data and those transfers can take a long time.
File uploads are a typical example. 
Give the users a better experience by providing feedback on the progress of such transfers.
-->
애플리케이션이 대용량 데이터를 보내거나 받는 경우에는 HTTP 통신 시간이 오래 걸릴 수 있으며,
파일을 업로드하는 경우에 흔히 발생하는 현상입니다.
이 때 사용자에게 진행상황에 대한 정보를 알려주면 더 나은 UX를 제공할 수 있습니다.

<!--
To make a request with progress events enabled, you can create an instance of `HttpRequest` 
with the `reportProgress` option set true to enable tracking of progress events.
-->
요청을 보내면서 진행률 이벤트를 활성화 하려면 `HttpRequest` 인스턴스를 생성할 때 `reportProgress` 옵션을 `true`로 설정하면 됩니다.

<code-example 
  path="http/src/app/uploader/uploader.service.ts"
  region="upload-request" 
  header="app/uploader/uploader.service.ts (upload request)">
</code-example>

<div class="alert is-important">

<!--
Every progress event triggers change detection, so only turn them on if you truly intend to report progress in the UI.
-->
진행률 이벤트가 발생할 때마다 변화 감지 싸이클이 동작하기 때문에, 실제로 UI에서 활용할 필요가 있을 때만 이 옵션을 사용하세요.

When using [`HttpClient#request()`](api/common/http/HttpClient#request) with an HTTP method, configure with
[`observe: 'events'`](api/common/http/HttpClient#request) to see all events, including the progress of transfers.

</div>

<!--
Next, pass this request object to the `HttpClient.request()` method, which
returns an `Observable` of `HttpEvents`, the same events processed by interceptors:
-->
그리고 이 인스턴스를 `HttpClient.request()` 메소드로 전달합니다. 그러면 `HttpEvents` 타입의 `Observable`이 반환되며, 인터셉터를 사용하는 것과 비슷한 방식으로 처리하면 됩니다:

<code-example 
  path="http/src/app/uploader/uploader.service.ts"
  region="upload-body" 
  header="app/uploader/uploader.service.ts (upload body)" linenums="false">
</code-example>

<!--
The `getEventMessage` method interprets each type of `HttpEvent` in the event stream.
-->
이 코드에서 사용한 `getEventMessage` 메소드는 이벤트 스트림에서 발생한 `HttpEvent`를 처리합니다.

<code-example 
  path="http/src/app/uploader/uploader.service.ts"
  region="getEventMessage" 
  header="app/uploader/uploader.service.ts (getEventMessage)" linenums="false">
</code-example>

<div class="alert is-helpful">

<!--
The sample app for this guide doesn't have a server that accepts uploaded files.
The `UploadInterceptor` in `app/http-interceptors/upload-interceptor.ts` 
intercepts and short-circuits upload requests
by returning an observable of simulated events.
-->
예제에서 다룬 앱은 업로드한 파일을 처리하는 실제 서버가 없습니다.
그래서 `app/http-interceptors/upload-interceptor.ts`에 정의한 `UploadInterceptor`가 이 요청을 가로채서 서버가 동작하는 것을 흉내냅니다.

</div>

<!--
## Security: XSRF Protection
-->
## 보안 : XSRF 방어

<!--
[Cross-Site Request Forgery (XSRF)](https://en.wikipedia.org/wiki/Cross-site_request_forgery) is an attack technique by which the attacker can trick an authenticated user into unknowingly executing actions on your website. `HttpClient` supports a [common mechanism](https://en.wikipedia.org/wiki/Cross-site_request_forgery#Cookie-to-Header_Token) used to prevent XSRF attacks. When performing HTTP requests, an interceptor reads a token from a cookie, by default `XSRF-TOKEN`, and sets it as an HTTP header, `X-XSRF-TOKEN`. Since only code that runs on your domain could read the cookie, the backend can be certain that the HTTP request came from your client application and not an attacker.
-->
[사이트간 요청 위조 (Cross-Site Request Forgery (XSRF))](https://en.wikipedia.org/wiki/Cross-site_request_forgery)는 인증받지 않은 사용자가 웹사이트를 공격하는 방법 중 하나입니다.
Angular에서 제공하는 `HttpClient`는 [XSRF 공격을 방어하는 기능](https://en.wikipedia.org/wiki/Cross-site_request_forgery#Cookie-to-Header_Token)을 탑재하고 있습니다.
그래서 HTTP 요청이 발생했을 때 쿠키에서 토큰을 읽는 인터셉터가 자동으로 동작하며, `XSRF-TOKEN`으로 설정된 HTTP 헤더를 `X-XSRF-TOKEN`으로 변경합니다.
결국 현재 도메인에 유효한 쿠키만 읽을 수 있으며, 백엔드가 HTTP 요청을 좀 더 안전하게 처리할 수 있습니다.

<!--
By default, an interceptor sends this cookie on all mutating requests (POST, etc.)
to relative URLs but not on GET/HEAD requests or
on requests with an absolute URL.
-->
기본적으로 이 인터셉터는 상대주소로 요청되는 모든 요청에 적용되며, 절대 주소로 요청되는 GET/HEAD 요청에는 적용되지 않습니다.

<!--
To take advantage of this, your server needs to set a token in a JavaScript readable session cookie called `XSRF-TOKEN` on either the page load or the first GET request. On subsequent requests the server can verify that the cookie matches the `X-XSRF-TOKEN` HTTP header, and therefore be sure that only code running on your domain could have sent the request. The token must be unique for each user and must be verifiable by the server; this prevents the client from making up its own tokens. Set the token to a digest of your site's authentication
cookie with a salt for added security.
-->
그래서 모든 요청에 사이트간 위조된 요청을 방어하려면, 페이지가 로드되거나 처음 발생하는 GET 요청에 대해서 쿠키에 `XSRF-TOKEN`이 있는지 확인해야 합니다.
그리고 이후에 발생한 요청의 헤더에 `X-XSRF-TOKEN`이 있으면 요청이 유효한 것으로 판단하며, 유효한 도메인에서 제대로 보내진 요청이라는 것으로 최종 판단할 수 있습니다.
이 때 사용하는 토큰은 사용자마다 달라야 하며, 서버에서 반드시 인증되어야 합니다.
그래야 클라이언트에서 토큰을 위조하는 것도 방어할 수 있습니다.
서버에서 토큰을 생성할 때 인증키를 활용하면 좀 더 확실합니다.

<!--
In order to prevent collisions in environments where multiple Angular apps share the same domain or subdomain, give each application a unique cookie name.
-->
만약 도메인과 서브 도메인을 공유하면서 서로 다른 환경으로 Angular 애플리케이션을 사용하면 충돌이 발생할 수도 있습니다. 각각의 환경에 유일한 쿠키 이름을 사용하세요.

<div class="alert is-important">

<!--
*Note that `HttpClient` supports only the client half of the XSRF protection scheme.* 
Your backend service must be configured to set the cookie for your page, and to verify that 
the header is present on all eligible requests. 
If not, Angular's default protection will be ineffective.
-->
*`HttpClient`에서 제공하는 XSRF 방어 동작은 클라이언트에만 적용되는 내용입니다.*
백엔드에서도 페이지에 쿠키를 설정해야 하며, 클라이언트에서 발생하는 모든 요청이 유효한지 확인해야 합니다.
백엔드에서 이 과정을 처리하지 않으면 Angular가 제공하는 기본 방어 로직도 제대로 동작하지 않을 수 있습니다.

</div>

<!--
### Configuring custom cookie/header names
-->
### 커스텀 쿠키/헤더 이름 지정하기

<!--
If your backend service uses different names for the XSRF token cookie or header, 
use `HttpClientXsrfModule.withOptions()` to override the defaults.
-->
백엔드에서 XSRF 토큰 쿠키나 헤더를 다른 이름으로 사용하고 있다면 `HttpClientXsrfModule.withOptions()` 를 사용해서 이름을 변경할 수 있습니다.

<code-example 
  path="http/src/app/app.module.ts"
  region="xsrf" 
  linenums="false">
</code-example>

<!--
## Testing HTTP requests
-->
## HTTP 요청 테스트하기

<!--
Like any external dependency, the HTTP backend needs to be mocked
so your tests can simulate interaction with a remote server. 
The `@angular/common/http/testing` library makes 
setting up such mocking straightforward.
-->
다른 외부 의존성 객체와 마찬가지로, HTTP 요청을 테스트하려면 외부 서버의 동작을 흉내내는 HTTP 백엔드의 목업이 필요합니다.
이 목업은 `@angular/common/http/testing` 라이브러리를 활용해서 구성할 수 있습니다.

<!--
### Mocking philosophy
-->
### 목업 라이브러리 활용 방법

<!--
Angular's HTTP testing library is designed for a pattern of testing wherein 
the app executes code and makes requests first.
-->
Angular의 HTTP 테스팅 라이브러리를 활용하면 목업으로 만든 애플리케이션이 실행 환경에서 HTTP 코드가 동작하는지 확인할 수 있으며, HTTP 요청도 실제로 발생합니다.

<!--
Then a test expects that certain requests have or have not been made, 
performs assertions against those requests, 
and finally provide responses by "flushing" each expected request.
-->
각 테스트 케이스에서는 특정 요청이 발생해야 하는지, 발생하지 않아야 하는지 검사할 수 있으며, 검사를 끝내고 난 후에는 이 요청들을 모두 비워야(flushing) 합니다.

<!--
At the end, tests may verify that the app has made no unexpected requests.
-->
그리고 나면 마지막으로 의도하지 않은 요청이 발생했는지 검사합니다.

<div class="alert is-helpful">

<!--
You can run <live-example stackblitz="specs">these sample tests</live-example> 
in a live coding environment.

The tests described in this guide are in `src/testing/http-client.spec.ts`.
There are also tests of an application data service that call `HttpClient` in
`src/app/heroes/heroes.service.spec.ts`.
-->
이 문단에서 다루는 내용은 <live-example stackblitz="specs">샘플 테스트</live-example>를 직접 실행해서 결과를 확인할 수 있습니다.

이 테스트들은 `src/testing/http-client.spec.ts` 파일에 작성되어 있으며, `HttpClient`를 사용하는 서비스를 테스트하는 코드는 `src/app/heroes/heroes.service.spec.ts` 파일에 작성되어 잇습니다.

</div>

<!--
### Setup
-->
### 환경설정

<!--
To begin testing calls to `HttpClient`, 
import the `HttpClientTestingModule` and the mocking controller, `HttpTestingController`,
along with the other symbols your tests require.
-->
`HttpClient`를 테스트하려면 먼저 테스트용 모듈인 `HttpClientTestingModule`과 목업 환경을 구성하는 `HttpTestingController`를 로드해야 합니다.

<code-example 
  path="http/src/testing/http-client.spec.ts"
  region="imports" 
  header="app/testing/http-client.spec.ts (imports)" linenums="false">
</code-example>

<!--
Then add the `HttpClientTestingModule` to the `TestBed` and continue with
the setup of the _service-under-test_.
-->
그리고 나면 `TestBed`에 `HttpClientTestingModule`를 추가하면서 테스트 환경을 구성합니다.

<code-example 
  path="http/src/testing/http-client.spec.ts"
  region="setup" 
  header="app/testing/http-client.spec.ts(setup)" linenums="false">
</code-example>

<!--
Now requests made in the course of your tests will hit the testing backend instead of the normal backend.
-->
이제 테스트 케이스에서 HTTP 요청이 발생하면 실제 백엔드가 아니라 테스팅 백엔드로 전달됩니다.

<!--
This setup also calls `TestBed.get()` to inject the `HttpClient` service and the mocking controller
so they can be referenced during the tests.
-->
이 코드에서는 `HttpClient` 서비스와 목업 컨트롤러를 테스트 케이스마다 동적으로 주입하기 위해 `TestBed.get()`을 사용했습니다.

<!--
### Expecting and answering requests
-->
### 요청 확인하기, 요청에 응답하기

<!--
Now you can write a test that expects a GET Request to occur and provides a mock response. 
-->
이제 GET 요청이 발생하는지 확인하고 목업 응답을 보내는 테스트 케이스를 작성해 봅시다.

<code-example 
  path="http/src/testing/http-client.spec.ts"
  region="get-test" 
  header="app/testing/http-client.spec.ts(httpClient.get)" linenums="false">
</code-example>

<!--
The last step, verifying that no requests remain outstanding, is common enough for you to move it into an `afterEach()` step:
-->
모든 응답이 처리되었는지 마지막으로 검사하는 로직은 `afterEach()`로 옮겨도 됩니다:

<code-example 
  path="http/src/testing/http-client.spec.ts"
  region="afterEach" 
  linenums="false">
</code-example>

<!--
#### Custom request expectations
-->
#### HTTP 요청 객체 검사하기

<!--
If matching by URL isn't sufficient, it's possible to implement your own matching function. 
For example, you could look for an outgoing request that has an authorization header:
-->
지정된 URL로 HTTP 요청이 왔는지 검사하는 것만으로는 충분하지 않다면, 검사 로직을 직접 작성할 수도 있습니다.
예를 들어 HTTP 요청 헤더에 인증 토큰이 있는지 검사하는 로직은 다음과 같이 구현할 수 있습니다:

<code-example 
  path="http/src/testing/http-client.spec.ts"
  region="predicate" 
  linenums="false">
</code-example>

<!--
As with the previous `expectOne()`, 
the test will fail if 0 or 2+ requests satisfy this predicate.
-->
그러면 이전에 살펴본 `expectOne()`과 마찬가지로, HTTP 요청이 발생하지 않거나 2번 이상 발생한 경우에도 마찬가지로 에러를 발생시킵니다.

<!--
#### Handling more than one request
-->
#### 여러번 요청되는 HTTP 테스트하기

<!--
If you need to respond to duplicate requests in your test, use the `match()` API instead of `expectOne()`.
It takes the same arguments but returns an array of matching requests. 
Once returned, these requests are removed from future matching and 
you are responsible for flushing and verifying them.
-->
테스트 케이스가 실행되는 중에 HTTP 요청이 같은 주소로 여러번 발생한다면, `expectOne()` 대신 `match()` API를 사용할 수도 있습니다.
이 함수는 `expectOne()`를 사용하는 방법과 같지만, 주소와 매칭되는 HTTP 요청을 배열로 반환합니다.
그러면 이 배열을 한 번에 테스트할 수도 있고, 배열의 항목을 각각 테스트할 수도 있습니다.

<code-example 
  path="http/src/testing/http-client.spec.ts"
  region="multi-request" 
  linenums="false">
</code-example>

<!--
### Testing for errors
-->
### 에러 테스트하기

<!--
You should test the app's defenses against HTTP requests that fail.
-->
HTTP 요청이 실패한 경우에 애플리케이션의 방어 로직이 제대로 동작하는지도 테스트해야 합니다.

<!--
Call `request.flush()` with an error message, as seen in the following example.
-->
이 때 `request.flush()`에 에러 객체를 보내면 HTTP 통신에 실패한 상황을 테스트할 수 있습니다.

<!--
<code-example 
  path="http/src/testing/http-client.spec.ts"
  region="404"
  linenums="false">
</code-example>
-->
<code-example 
  path="http/src/testing/http-client.spec.ts"
  region="404"
  linenums="false">
</code-example>

<!--
Alternatively, you can call `request.error()` with an `ErrorEvent`.
-->
그리고 이 방식은 `ErrorEvent` 객체를 `request.error()` 함수에 전달하는 방식으로도 구현할 수 있습니다.

<code-example
  path="http/src/testing/http-client.spec.ts"
  region="network-error"
  linenums="false">
</code-example>
