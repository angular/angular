# HTTP

<!--
In this tutorial, you'll add the following data persistence features with help from
Angular's `HttpClient`.

* The `HeroService` gets hero data with HTTP requests.
* Users can add, edit, and delete heroes and save these changes over HTTP.
* Users can search for heroes by name.

When you're done with this page, the app should look like this <live-example></live-example>.
-->
이번 튜토리얼에서는 Angular가 제공하는 `HttpClient`를 사용해서 데이터를 처리하는 기능에 대해 알아봅니다.

* `HeroService`가 HTTP 요청을 보내서 히어로 데이터를 가져올 것입니다.
* 사용자가 추가, 변경, 삭제한 히어로 데이터는 HTTP 요청을 보내서 서버에 저장할 것입니다.
* 사용자가 히어로의 이름으로 검색할 수 있는 기능을 만들어 봅니다.

이번 튜토리얼에서 만들 앱은 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

<!--
## Enable HTTP services
-->
## HTTP 서비스 추가하기

<!--
`HttpClient` is Angular's mechanism for communicating with a remote server over HTTP. 

To make `HttpClient` available everywhere in the app:

* open the root `AppModule` 
* import the `HttpClientModule` symbol from `@angular/common/http`
-->
`HttpClient`는 리모트 서버와 HTTP 통신을 하기 위해 Angular가 제공하는 서비스입니다.

애플리케이션 전역 범위에서 `HttpClient`를 사용하려면 다음과 같이 설정합니다:

* 최상위 모듈인 `AppModule`을 엽니다.
* `@angular/common/http` 패키지에서 `HttpClientModule` 심볼을 로드합니다.

<!--
<code-example
  path="toh-pt6/src/app/app.module.ts"
  region="import-http-client"
  header="src/app/app.module.ts (Http Client import)">
</code-example>
-->
<code-example
  path="toh-pt6/src/app/app.module.ts"
  region="import-http-client"
  header="src/app/app.module.ts (Http Client 로드하기)">
</code-example>

<!--
* add it to the `@NgModule.imports` array
-->
* 이 심볼을 `@NgModule.imports` 배열에 추가합니다.

<!--
## Simulate a data server
-->
## 데이터 서버 흉내내기

<!--
This tutorial sample _mimics_ communication with a remote data server by using the
[_In-memory Web API_](https://github.com/angular/in-memory-web-api "In-memory Web API") module.

After installing the module, the app will make requests to and receive responses from the `HttpClient`
without knowing that the *In-memory Web API* is intercepting those requests,
applying them to an in-memory data store, and returning simulated responses.

This facility is a great convenience for the tutorial.
You won't have to set up a server to learn about `HttpClient`.

It may also be convenient in the early stages of your own app development when
the server's web api is ill-defined or not yet implemented.
-->
이 튜토리얼에서는 [_인-메모리 Web API_](https://github.com/angular/in-memory-web-api "In-memory Web API") 모듈을 사용해서 리모트 데이터 서버의 동작을 흉내내는 방식으로 진행합니다.

이 모듈을 사용해도 애플리케이션이 `HttpClient`를 사용해서 요청을 보내고 받는 것은 동일하지만, 이 요청을 *인-메모리 Web API*가 가로채서 실제 HTTP 요청을 보내지 않고 인-메모리 데이터 스토어로 이 내용을 처리합니다.

이 모듈을 사용하면 이번 튜토리얼에 필요한 로직을 굉장히 편하게 구현할 수 있습니다.
실제 HTTP 요청으로 동작하는 서버를 준비하지 않아도 됩니다.

개발 초기에 서버가 준비되지 않았을 때 이 모듈을 사용하는 것도 좋습니다.

<div class="alert is-important">

<!--
**Important:** the *In-memory Web API* module has nothing to do with HTTP in Angular.

If you're just _reading_ this tutorial to learn about `HttpClient`, you can [skip over](#import-heroes) this step.
If you're _coding along_ with this tutorial, stay here and add the *In-memory Web API* now.
-->
**중요:** *인-메모리 Web API* 모듈은 사실 Angular가 제공하는 HTTP와 큰 관련이 없습니다.

그래서 이 튜토리얼의 핵심 내용인 `HttpClient`에 대해 알아보려면 이 단계를 건너뛰고 [여기로](#import-heroes) 넘어가는 것이 좋습니다.
이 튜토리얼을 단계별로 따라가면서 직접 _코딩하고 있는 경우에만_ *인-메모리 웹 API* 설정을 진행하세요.

</div>

<!--
Install the *In-memory Web API* package from _npm_
-->
_npm_ 으로 *인-메모리 웹 API* 패키지를 설치합니다.

<code-example language="sh" class="code-shell">
  npm install angular-in-memory-web-api --save
</code-example>

<!--
Import the `HttpClientInMemoryWebApiModule` and the `InMemoryDataService` class, 
which you will create in a moment.
-->
그리고 이 패키지에서 `HttpClientInMemoryWebApiModule`을 로드하고, 앞으로 만들 서비스에서 제공할 `InMemoryDataService` 클래스를 로드합니다.

<!--
<code-example 
  path="toh-pt6/src/app/app.module.ts" 
  region="import-in-mem-stuff" 
  header="src/app/app.module.ts (In-memory Web API imports)">
</code-example>
-->
<code-example 
  path="toh-pt6/src/app/app.module.ts" 
  region="import-in-mem-stuff" 
  header="src/app/app.module.ts (In-memory Web API 로드하기)">
</code-example>

<!--
Add the `HttpClientInMemoryWebApiModule` to the `@NgModule.imports` array&mdash;
_after importing the `HttpClientModule`_,
&mdash;while configuring it with the `InMemoryDataService`.
-->
그 다음에는 `HttpClientInMemoryWebApiModule`을 `@NgModule.imports` 배열에 추가하는데, _`HttpClientModule` 뒤에_ 추가합니다.
이 때 `InMemoryDataService`를 인자로 전달합니다.

<code-example   
  path="toh-pt6/src/app/app.module.ts" 
  region="in-mem-web-api-imports">
</code-example>

<!--
The `forRoot()` configuration method takes an `InMemoryDataService` class
that primes the in-memory database.

The _Tour of Heroes_ sample creates such a class 
`src/app/in-memory-data.service.ts` which has the following content:
-->
그러면 `forRoot()` 메소드가 `InMemoryDataService` 클래스를 사용해서 인-메모리 데이터베이스를 구성합니다.

`InMemoDataService` 클래스는 `src/ap/in-memory-data.service.ts` 파일에 다음과 같이 구현합니다:

<code-example path="toh-pt6/src/app/in-memory-data.service.ts" region="init" header="src/app/in-memory-data.service.ts" linenums="false"></code-example>

<!--
This file replaces `mock-heroes.ts`, which is now safe to delete.

When your server is ready, detach the *In-memory Web API*, and the app's requests will go through to the server.

Now back to the `HttpClient` story.
-->
이 파일을 사용하면 이제 `mock-heroes.ts` 파일을 사용하지 않기 때문데 삭제해도 돕니다.

그리고 서버가 준비되면 *인-메모리 Web API* 를 제거해서 애플리케이션이 보내는 요청을 실제 서버로 전달하면 됩니다.

다시 `HttpClient`에 대해 이야기해 봅시다.

{@a import-heroes}
<!--
## Heroes and HTTP
-->
## 히어로 데이터와 HTTP

<!--
Import some HTTP symbols that you'll need:
-->
먼저 HTTP 요청을 보내기 위해 필요한 심볼을 로드합니다:

<!--
<code-example
  path="toh-pt6/src/app/hero.service.ts" 
  region="import-httpclient" 
  header="src/app/hero.service.ts (import HTTP symbols)">
</code-example>
-->
<code-example
  path="toh-pt6/src/app/hero.service.ts" 
  region="import-httpclient" 
  header="src/app/hero.service.ts (HTTP 심볼 로드하기)">
</code-example>

<!--
Inject `HttpClient` into the constructor in a private property called `http`.
-->
그리고 `HttpClient`를 `HeroService`의 생성자에 의존성으로 주입하면서 이 인스턴스를 `private http` 프로퍼티에 할당합니다.

<code-example 
  path="toh-pt6/src/app/hero.service.ts" 
  region="ctor" >
</code-example>

<!--
Keep injecting the `MessageService`. You'll call it so frequently that
you'll wrap it in private `log` method.
-->
이 서비스에는 `MessageService`도 주입합니다.
`MessageService`는 자주 사용하기 때문에 `MessageService.add()` 메소드는 `private log` 메소드로 한 번 랩핑합니다.

<code-example 
  path="toh-pt6/src/app/hero.service.ts" 
  region="log" >
</code-example>

<!--
Define the `heroesUrl` of the form `:base/:collectionName` with the address of the heroes resource on the server.
 Here `base` is the resource to which requests are made,
 and `collectionName` is the heroes data object in the `in-memory-data-service.ts`.
-->
서버에 요청할 `heroesUrl`을 `:base/:collectionName`와 같이 정의합니다.
이 문자열에서 `base`는 요청으로 보내는 주소의 기본 위치를 의미하며, `collectionName`은 `in-memory-data-service.ts`에 있는 히어로 데이터가 저장되는 위치를 가리킵니다.

<code-example 
  path="toh-pt6/src/app/hero.service.ts" 
  region="heroesUrl" >
</code-example>

<!--
### Get heroes with _HttpClient_
-->
### _HttpClient_ 로 히어로 목록 가져오기

<!--
The current `HeroService.getHeroes()` 
uses the RxJS `of()` function to return an array of mock heroes
as an `Observable<Hero[]>`.
-->
지금까지 작성한 `HeroService.getHeroes()` 함수는 RxJS `of()` 함수를 사용해서 `Observable<Hero[]>` 타입의 목 히어로 데이터를 반환합니다.

<!--
<code-example 
  path="toh-pt4/src/app/hero.service.ts" 
  region="getHeroes-1" 
  header="src/app/hero.service.ts (getHeroes with RxJs 'of()')">
</code-example>
-->
<code-example 
  path="toh-pt4/src/app/hero.service.ts" 
  region="getHeroes-1" 
  header="src/app/hero.service.ts (RxJs 'of()'를 사용하는 getHeroes)">
</code-example>

<!--
Convert that method to use `HttpClient`
-->
이 함수가 `HttpClient`를 사용하도록 변경합니다.

<code-example 
  path="toh-pt6/src/app/hero.service.ts" 
  region="getHeroes-1">
</code-example>

<!--
Refresh the browser. The hero data should successfully load from the
mock server.

You've swapped `of` for `http.get` and the app keeps working without any other changes
because both functions return an `Observable<Hero[]>`.
-->
브라우저가 갱신되면 이제 히어로 데이터는 목 서버에서 받아옵니다.

`of` 함수를 `http.get`으로 변경했지만 이 서비스 외의 다른 부분은 변경하지 않아도 됩니다.
두 함수는 모두 `Observable<Hero[]>` 타입을 반환합니다.

<!--
### Http methods return one value
-->
### Http 메소드는 데이터를 하나만 반환합니다.

<!--
All `HttpClient` methods return an RxJS `Observable` of something.

HTTP is a request/response protocol. 
You make a request, it returns a single response.

In general, an observable _can_ return multiple values over time.
An observable from `HttpClient` always emits a single value and then completes, never to emit again.

This particular `HttpClient.get` call returns an `Observable<Hero[]>`, literally "_an observable of hero arrays_". In practice, it will only return a single hero array.
-->
`HttpClient`가 제공하는 모든 메소드는 RxJS `Observable` 타입으로 무언가를 반환합니다.

HTTP는 요청을 보내고 응답을 받는 프로토콜입니다.
이 때 요청이 한 번 있었다면 응답도 한 번입니다.

일반적으로 옵저버블은 여러 번에 걸쳐 데이터를 여러개 반환합니다.
하지만 `HttpClient`가 반환하는 옵저버블은 데이터를 하나만 반환하고 종료되며, 데이터를 추가로 보내지 않습니다.

그래서 `HttpClient.get` 함수는 히어로 데이터를 배열로 묶어서 `Observable<Hero[]>` 타입으로 반환합니다.


<!--
### _HttpClient.get_ returns response data
-->
### _HttpClient.get_ 함수는 응답으로 받은 데이터를 반환합니다.

<!--
`HttpClient.get` returns the _body_ of the response as an untyped JSON object by default.
Applying the optional type specifier, `<Hero[]>` , gives you a typed result object.

The shape of the JSON data is determined by the server's data API.
The _Tour of Heroes_ data API returns the hero data as an array.
-->
`HttpClient.get` 함수는 HTTP 응답으로 받은 _몸체(body)_ 를 반환하는데, 이 객체는 타입이 지정되지 않은 JSON 객체로 처리됩니다.
그래서 이 객체에 타입을 지정하려면 `<Hero[]>`와 같이 제네릭을 지정하면 됩니다.

JSON 데이터의 형식은 서버에 정의된 데이터 API에 따라 달라집니다.
_히어로들의 여행_ 에서 사용하는 데이터 API는 모두 히어로 데이터를 배열로 반환합니다.

<div class="alert is-helpful">

<!--
Other APIs may bury the data that you want within an object.
You might have to dig that data out by processing the `Observable` result
with the RxJS `map` operator.

Although not discussed here, there's an example of `map` in the `getHeroNo404()`
method included in the sample source code.
-->
데이터는 어떤 객체 안에 깊숙히 들어있을 수도 있습니다.
그러면 이 객체에서 원하는 데이터를 추출하기 위해 RxJS `map` 연산자를 사용해야 할 수도 있습니다.

이 내용은 이 문서에서 다루지 않지만 예제 코드에 구현된 `getHeroNo404()` 메소드를 보면 `map` 연산자를 사용하는 코드를 확인할 수 있습니다.

</div>

<!--
### Error handling
-->
### 에러 처리하기

<!--
Things go wrong, especially when you're getting data from a remote server.
The `HeroService.getHeroes()` method should catch errors and do something appropriate.

To catch errors, you **"pipe" the observable** result from `http.get()` through an RxJS `catchError()` operator.

Import the `catchError` symbol from `rxjs/operators`, along with some other operators you'll need later.
-->
리모트 서버에서 데이터를 가져오는 과정은 얼마든지 잘못될 수 있습니다.
그래서 `HeroService.getHeroes()` 메소드에는 에러가 발생했을 때 처리하는 로직이 필요합니다.

에러를 처리하려면 `http.get()`으로 받은 옵저버블에 **"pipe"를 사용해서** `catchError()` 연산자를 연결하면 됩니다.

`rxjs/operators`에서 `catchError` 심볼을 로드합니다.
이 때 앞으로 사용할 연산자 몇 개도 함께 로드했습니다.

<code-example 
  path="toh-pt6/src/app/hero.service.ts" 
  region="import-rxjs-operators">
</code-example>

<!--
Now extend the observable result with the `.pipe()` method and
give it a `catchError()` operator.
-->
이제 옵저버블로 받은 데이터를 `.pipe()` 메소드로 확장하고 이 파이프에 `catchError()` 연산자를 연결합니다.

<code-example 
  path="toh-pt6/src/app/hero.service.ts" 
  region="getHeroes-2" >
</code-example>

<!--
The `catchError()` operator intercepts an **`Observable` that failed**.
It passes the error an _error handler_ that can do what it wants with the error.

The following `handleError()` method reports the error and then returns an
innocuous result so that the application keeps working.
-->
`catchError()` 연산자는 **`Observable`이 실패했을 때** 실행되는 연산자입니다.
이 연산자에는 에러가 발생했을 때 실행할 _에러 핸들러 함수_ 를 인자로 전달합니다.

아래에서 구현할 `handleError()` 메소드는 에러를 콘솔에 출력한 뒤에 빈 배열을 반환합니다.
그래서 서버에 보낸 요청이 실패하는 에러가 발생하더라도 애플리케이션은 계속 동작할 수 있습니다.

#### _handleError_

The following `handleError()` will be shared by many `HeroService` methods
so it's generalized to meet their different needs.

Instead of handling the error directly, it returns an _error handler_ function to `catchError` that it 
has configured with both the name of the operation that failed and a safe return value.

<code-example 
  path="toh-pt6/src/app/hero.service.ts" 
  region="handleError">
</code-example>

After reporting the error to console, the handler constructs
a user friendly message and returns a safe value to the app so it can keep working.

Because each service method returns a different kind of `Observable` result,
`handleError()` takes a type parameter so it can return the safe value as the type that the app expects.

### Tap into the _Observable_

The `HeroService` methods will **tap** into the flow of observable values
and send a message (via `log()`) to the message area at the bottom of the page.

They'll do that with the RxJS `tap` operator,
which _looks_ at the observable values, does _something_ with those values,
and passes them along.
The `tap` call back doesn't touch the values themselves.

Here is the final version of `getHeroes` with the `tap` that logs the operation.

<code-example 
  path="toh-pt6/src/app/hero.service.ts" 
  region="getHeroes" >
</code-example>

### Get hero by id

Most web APIs support a _get by id_ request in the form `:baseURL/:id`.

Here, the _base URL_ is the `heroesURL` defined in the [Heroes and HTTP](http://localhost:4800/tutorial/toh-pt6#heroes-and-http) section (`api/heroes`) and _id_ is
the number of the hero that you want to retrieve. For example, `api/heroes/11`.

Add a `HeroService.getHero()` method to make that request:

<code-example path="toh-pt6/src/app/hero.service.ts" region="getHero" header="src/app/hero.service.ts"></code-example>

There are three significant differences from  `getHeroes()`.

* it constructs a request URL with the desired hero's id.
* the server should respond with a single hero rather than an array of heroes.
* therefore, `getHero` returns an `Observable<Hero>` ("_an observable of Hero objects_")
 rather than an observable of hero _arrays_ .

## Update heroes

Edit a hero's name in the _hero detail_ view.
As you type, the hero name updates the heading at the top of the page.
But when you click the "go back button", the changes are lost.

If you want changes to persist, you must write them back to
the server.

At the end of the hero detail template, add a save button with a `click` event
binding that invokes a new component method named `save()`.

<code-example path="toh-pt6/src/app/hero-detail/hero-detail.component.html" region="save" header="src/app/hero-detail/hero-detail.component.html (save)"></code-example>

Add the following `save()` method, which persists hero name changes using the hero service
`updateHero()` method and then navigates back to the previous view.

<code-example path="toh-pt6/src/app/hero-detail/hero-detail.component.ts" region="save" header="src/app/hero-detail/hero-detail.component.ts (save)"></code-example>

#### Add _HeroService.updateHero()_

The overall structure of the `updateHero()` method is similar to that of
`getHeroes()`, but it uses `http.put()` to persist the changed hero
on the server.

<code-example 
  path="toh-pt6/src/app/hero.service.ts" 
  region="updateHero" 
  header="src/app/hero.service.ts (update)">
</code-example>

The `HttpClient.put()` method takes three parameters
* the URL
* the data to update (the modified hero in this case)
* options

The URL is unchanged. The heroes web API knows which hero to update by looking at the hero's `id`.

The heroes web API expects a special header in HTTP save requests.
That header is in the `httpOptions` constant defined in the `HeroService`.

<code-example 
  path="toh-pt6/src/app/hero.service.ts" 
  region="http-options"
  header="src/app/hero.service.ts">
</code-example>

Refresh the browser, change a hero name and save your change. Navigating to the previous view is implemented in the `save()` method defined in `HeroDetailComponent`.
The hero now appears in the list with the changed name.

## Add a new hero

To add a hero, this app only needs the hero's name. You can use an `input`
element paired with an add button.

Insert the following into the `HeroesComponent` template, just after
the heading:

<code-example path="toh-pt6/src/app/heroes/heroes.component.html" region="add" header="src/app/heroes/heroes.component.html (add)"></code-example>

In response to a click event, call the component's click handler and then
clear the input field so that it's ready for another name.

<code-example path="toh-pt6/src/app/heroes/heroes.component.ts" region="add" header="src/app/heroes/heroes.component.ts (add)"></code-example>

When the given name is non-blank, the handler creates a `Hero`-like object
from the name (it's only missing the `id`) and passes it to the services `addHero()` method.

When `addHero` saves successfully, the `subscribe` callback
receives the new hero and pushes it into to the `heroes` list for display.

You'll write `HeroService.addHero` in the next section.

#### Add _HeroService.addHero()_

Add the following `addHero()` method to the `HeroService` class.

<code-example path="toh-pt6/src/app/hero.service.ts" region="addHero" header="src/app/hero.service.ts (addHero)"></code-example>

`HeroService.addHero()` differs from `updateHero` in two ways.

* it calls `HttpClient.post()` instead of `put()`.
* it expects the server to generates an id for the new hero, 
which it returns in the `Observable<Hero>` to the caller.

Refresh the browser and add some heroes.

## Delete a hero

Each hero in the heroes list should have a delete button.

Add the following button element to the `HeroesComponent` template, after the hero
name in the repeated `<li>` element.

<code-example path="toh-pt6/src/app/heroes/heroes.component.html" region="delete"></code-example>

The HTML for the list of heroes should look like this:

<code-example path="toh-pt6/src/app/heroes/heroes.component.html" region="list" header="src/app/heroes/heroes.component.html (list of heroes)"></code-example>

To position the delete button at the far right of the hero entry,
add some CSS to the `heroes.component.css`.  You'll find that CSS
in the [final review code](#heroescomponent) below.

Add the `delete()` handler to the component.

<code-example path="toh-pt6/src/app/heroes/heroes.component.ts" region="delete" header="src/app/heroes/heroes.component.ts (delete)"></code-example>

Although the component delegates hero deletion to the `HeroService`,
it remains responsible for updating its own list of heroes.
The component's `delete()` method immediately removes the _hero-to-delete_ from that list,
anticipating that the `HeroService` will succeed on the server.

There's really nothing for the component to do with the `Observable` returned by
`heroService.delete()`. **It must subscribe anyway**.

<div class="alert is-important">

  If you neglect to `subscribe()`, the service will not send the delete request to the server!
  As a rule, an `Observable` _does nothing_ until something subscribes!
  
  Confirm this for yourself by temporarily removing the `subscribe()`,
  clicking "Dashboard", then clicking "Heroes".
  You'll see the full list of heroes again.

</div>

#### Add _HeroService.deleteHero()_

Add a `deleteHero()` method to `HeroService` like this.

<code-example path="toh-pt6/src/app/hero.service.ts" region="deleteHero" header="src/app/hero.service.ts (delete)"></code-example>

Note that

* it calls `HttpClient.delete`.
* the URL is the heroes resource URL plus the `id` of the hero to delete
* you don't send data as you did with `put` and `post`.
* you still send the `httpOptions`.

Refresh the browser and try the new delete functionality.

## Search by name

In this last exercise, you learn to chain `Observable` operators together
so you can minimize the number of similar HTTP requests
and consume network bandwidth economically.

You will add a *heroes search* feature to the *Dashboard*.
As the user types a name into a search box, 
you'll make repeated HTTP requests for heroes filtered by that name.
Your goal is to issue only as many requests as necessary.

#### _HeroService.searchHeroes_

Start by adding a `searchHeroes` method to the `HeroService`.

<code-example 
  path="toh-pt6/src/app/hero.service.ts" 
  region="searchHeroes"
  header="src/app/hero.service.ts">
</code-example>

The method returns immediately with an empty array if there is no search term.
The rest of it closely resembles `getHeroes()`.
The only significant difference is the URL, 
which includes a query string with the search term.

### Add search to the Dashboard

Open the `DashboardComponent` _template_ and
Add the hero search element, `<app-hero-search>`, to the bottom of the `DashboardComponent` template.

<code-example 
  path="toh-pt6/src/app/dashboard/dashboard.component.html" header="src/app/dashboard/dashboard.component.html" linenums="false">
</code-example>

This template looks a lot like the `*ngFor` repeater in the `HeroesComponent` template.

Unfortunately, adding this element breaks the app.
Angular can't find a component with a selector that matches `<app-hero-search>`.

The `HeroSearchComponent` doesn't exist yet. Fix that.

### Create _HeroSearchComponent_

Create a `HeroSearchComponent` with the CLI.

<code-example language="sh" class="code-shell">
  ng generate component hero-search
</code-example>

The CLI generates the three `HeroSearchComponent` files and adds the component to the `AppModule` declarations

Replace the generated `HeroSearchComponent` _template_ with a text box and a list of matching search results like this.

<code-example path="toh-pt6/src/app/hero-search/hero-search.component.html" header="src/app/hero-search/hero-search.component.html"></code-example>

Add private CSS styles to `hero-search.component.css`
as listed in the [final code review](#herosearchcomponent) below.

As the user types in the search box, a *keyup* event binding calls the component's `search()`
method with the new search box value.

{@a asyncpipe}

### _AsyncPipe_

As expected, the `*ngFor` repeats hero objects.

Look closely and you'll see that the `*ngFor` iterates over a list called `heroes$`, not `heroes`.

<code-example path="toh-pt6/src/app/hero-search/hero-search.component.html" region="async"></code-example>

The `$` is a convention that indicates `heroes$` is an `Observable`, not an array.

The `*ngFor` can't do anything with an `Observable`.
But there's also a pipe character (`|`) followed by `async`,
which identifies Angular's `AsyncPipe`.

The `AsyncPipe` subscribes to an `Observable` automatically so you won't have to
do so in the component class.

### Fix the _HeroSearchComponent_ class

Replace the generated `HeroSearchComponent` class and metadata as follows.

<code-example path="toh-pt6/src/app/hero-search/hero-search.component.ts" header="src/app/hero-search/hero-search.component.ts"></code-example>

Notice the declaration of `heroes$` as an `Observable`
<code-example 
  path="toh-pt6/src/app/hero-search/hero-search.component.ts" 
  region="heroes-stream">
</code-example>

You'll set it in [`ngOnInit()`](#search-pipe). 
Before you do, focus on the definition of `searchTerms`.

### The _searchTerms_ RxJS subject

The `searchTerms` property is declared as an RxJS `Subject`.

<code-example path="toh-pt6/src/app/hero-search/hero-search.component.ts" region="searchTerms"></code-example>

A `Subject` is both a source of _observable_ values and an `Observable` itself.
You can subscribe to a `Subject` as you would any `Observable`.

You can also push values into that `Observable` by calling its `next(value)` method
as the `search()` method does.

The `search()` method is called via an _event binding_ to the
textbox's `keystroke` event.

<code-example path="toh-pt6/src/app/hero-search/hero-search.component.html" region="input"></code-example>

Every time the user types in the textbox, the binding calls `search()` with the textbox value, a "search term". 
The `searchTerms` becomes an `Observable` emitting a steady stream of search terms.

{@a search-pipe}

### Chaining RxJS operators

Passing a new search term directly to the `searchHeroes()` after every user keystroke would create an excessive amount of HTTP requests,
taxing server resources and burning through the cellular network data plan.

Instead, the `ngOnInit()` method pipes the `searchTerms` observable through a sequence of RxJS operators that reduce the number of calls to the `searchHeroes()`,
ultimately returning an observable of timely hero search results (each a `Hero[]`).

Here's the code.

<code-example 
  path="toh-pt6/src/app/hero-search/hero-search.component.ts" 
  region="search">
</code-example>



* `debounceTime(300)` waits until the flow of new string events pauses for 300 milliseconds
before passing along the latest string. You'll never make requests more frequently than 300ms.


* `distinctUntilChanged()` ensures that a request is sent only if the filter text changed.


* `switchMap()` calls the search service for each search term that makes it through `debounce` and `distinctUntilChanged`.
It cancels and discards previous search observables, returning only the latest search service observable.


<div class="alert is-helpful">

  With the [switchMap operator](http://www.learnrxjs.io/operators/transformation/switchmap.html),
  every qualifying key event can trigger an `HttpClient.get()` method call.
  Even with a 300ms pause between requests, you could have multiple HTTP requests in flight
  and they may not return in the order sent.

  `switchMap()` preserves the original request order while returning only the observable from the most recent HTTP method call.
  Results from prior calls are canceled and discarded.

  Note that _canceling_ a previous `searchHeroes()` _Observable_
  doesn't actually abort a pending HTTP request.
  Unwanted results are simply discarded before they reach your application code.

</div>

Remember that the component _class_ does not subscribe to the `heroes$` _observable_.
That's the job of the [`AsyncPipe`](#asyncpipe) in the template.

#### Try it

Run the app again. In the *Dashboard*, enter some text in the search box.
If you enter characters that match any existing hero names, you'll see something like this.

<figure>
  <img src='generated/images/guide/toh/toh-hero-search.png' alt="Hero Search Component">
</figure>

## Final code review

Your app should look like this <live-example></live-example>.

Here are the code files discussed on this page (all in the `src/app/` folder).

{@a heroservice}
{@a inmemorydataservice}
{@a appmodule}
#### _HeroService_, _InMemoryDataService_, _AppModule_

<code-tabs>
  <code-pane 
    header="hero.service.ts" 
    path="toh-pt6/src/app/hero.service.ts">
  </code-pane>
  <code-pane 
    header="in-memory-data.service.ts"
    path="toh-pt6/src/app/in-memory-data.service.ts">
  </code-pane>
  <code-pane 
    header="app.module.ts" 
    path="toh-pt6/src/app/app.module.ts">
  </code-pane>
</code-tabs>

{@a heroescomponent}
#### _HeroesComponent_

<code-tabs>
  <code-pane 
    header="heroes/heroes.component.html" 
    path="toh-pt6/src/app/heroes/heroes.component.html">
  </code-pane>
  <code-pane 
    header="heroes/heroes.component.ts" 
    path="toh-pt6/src/app/heroes/heroes.component.ts">
  </code-pane>
  <code-pane 
    header="heroes/heroes.component.css" 
    path="toh-pt6/src/app/heroes/heroes.component.css">
  </code-pane>
</code-tabs>

{@a herodetailcomponent}
#### _HeroDetailComponent_

<code-tabs>
  <code-pane 
    header="hero-detail/hero-detail.component.html"
    path="toh-pt6/src/app/hero-detail/hero-detail.component.html">
  </code-pane>
  <code-pane 
    header="hero-detail/hero-detail.component.ts" 
    path="toh-pt6/src/app/hero-detail/hero-detail.component.ts">
  </code-pane>
</code-tabs>

{@a dashboardcomponent}
#### _DashboardComponent_

<code-tabs>
  <code-pane 
    header="src/app/dashboard/dashboard.component.html"
    path="toh-pt6/src/app/dashboard/dashboard.component.html">
  </code-pane>
</code-tabs>

{@a herosearchcomponent}
#### _HeroSearchComponent_

<code-tabs>
  <code-pane 
    header="hero-search/hero-search.component.html"
    path="toh-pt6/src/app/hero-search/hero-search.component.html">
  </code-pane>
  <code-pane 
    header="hero-search/hero-search.component.ts"
    path="toh-pt6/src/app/hero-search/hero-search.component.ts">
  </code-pane>
  <code-pane 
    header="hero-search/hero-search.component.css"
    path="toh-pt6/src/app/hero-search/hero-search.component.css">
  </code-pane>
</code-tabs>

## Summary

You're at the end of your journey, and you've accomplished a lot.
* You added the necessary dependencies to use HTTP in the app.
* You refactored `HeroService` to load heroes from a web API.
* You extended `HeroService` to support `post()`, `put()`, and `delete()` methods.
* You updated the components to allow adding, editing, and deleting of heroes.
* You configured an in-memory web API.
* You learned how to use observables.

This concludes the "Tour of Heroes" tutorial.
You're ready to learn more about Angular development in the fundamentals section,
starting with the [Architecture](guide/architecture "Architecture") guide.
