<!--
# Server-side Rendering (SSR): An intro to Angular Universal
# Angular Universal: server-side rendering
-->
# 서버 사이드 렌더링 (Server-side Rendering, SSR): Angular Universal 소개

<!--
This guide describes **Angular Universal**, a technology that renders Angular applications on the server.

A normal Angular application executes in the _browser_, rendering pages in the DOM in response to user actions. 
Angular Universal executes on the _server_, generating _static_ application pages that later get bootstrapped on
the client. This means that the application generally renders more quickly, giving users a chance to view the application
layout before it becomes fully interactive.

For a more detailed look at different techniques and concepts surrounding SSR, please check out this 
[article](https://developers.google.com/web/updates/2019/02/rendering-on-the-web).

You can easily prepare an app for server-side rendering using the [Angular CLI](guide/glossary#cli). 
The CLI schematic `@nguniversal/express-engine` performs the required steps, as described below.
-->
이 문서는 **Angular Universal**에 대해 소개합니다. Angular Universal은 Angular 애플리케이션을 서버에서 실행하는 테크닉입니다.

일반적으로 Angular 애플리케이션은 _브라우저_ 에서 실행됩니다. DOM에 페이지가 렌더링되고 사용자의 동작에 반응하는 것도 모두 브라우저에서 이루어집니다.
하지만 이와 다르게 Angular Universal은 _서버_ 에 미리 _정적_ 으로 생성해둔 애플리케이션을 클라이언트가 실행하고, 그 이후에 클라이언트에서 앱을 다시 부트스트랩하는 테크닉입니다.
이 방식을 사용하면 애플리케이션을 좀 더 빠르게 실행할 수 있기 때문에 사용자가 보는 애플리케이션 화면도 빠르게 띄울 수 있습니다.

For a more detailed look at different techniques and concepts surrounding SSR, please check out this 
[article](https://developers.google.com/web/updates/2019/02/rendering-on-the-web).

You can easily prepare an app for server-side rendering using the [Angular CLI](guide/glossary#cli). 
The CLI schematic `@nguniversal/express-engine` performs the required steps, as described below.
<div class="alert is-helpful">

  <!--
  **Note:** [Download the finished sample code](generated/zips/universal/universal.zip),
  which runs in a [Node.js® Express](https://expressjs.com/) server.
  -->
  **참고:** [완성된 샘플 코드를 다운받아서](generated/zips/universal/universal.zip) [Node.js® Express](https://expressjs.com/) 서버에 직접 실행해볼 수 있습니다.

</div>

{@a the-example}
## Universal tutorial 

The [Tour of Heroes tutorial](tutorial) is the foundation for this walkthrough. 

In this example, the Angular CLI compiles and bundles the Universal version of the app with the
[Ahead-of-Time (AoT) compiler](guide/aot-compiler).
A Node Express web server compiles HTML pages with Universal based on client requests.

To create the server-side app module, `app.server.module.ts`, run the following CLI command.

<code-example format="." language="bash">

ng add @nguniversal/express-engine --clientProject angular.io-example

</code-example>

The command creates the following folder structure.

<code-example format="." language="none" linenums="false">
src/
  index.html                 <i>app web page</i>
  main.ts                    <i>bootstrapper for client app</i>
  main.server.ts             <i>* bootstrapper for server app</i>
  style.css                  <i>styles for the app</i>
  app/ ...                   <i>application code</i>
    app.server.module.ts     <i>* server-side application module</i>
server.ts                    <i>* express web server</i>
tsconfig.json                <i>TypeScript client configuration</i>
tsconfig.app.json            <i>TypeScript client configuration</i>
tsconfig.server.json         <i>* TypeScript server configuration</i>
tsconfig.spec.json           <i>TypeScript spec configuration</i>
package.json                 <i>npm configuration</i>
webpack.server.config.js     <i>* webpack server configuration</i>
</code-example>

The files marked with `*` are new and not in the original tutorial sample.

### Universal in action

To start rendering your app with Universal on your local system, use the following command.

<code-example format="." language="bash" linenums="false">
npm run build:ssr && npm run serve:ssr
</code-example>

Open a browser and navigate to http://localhost:4000/.
You should see the familiar Tour of Heroes dashboard page.

Navigation via `routerLinks` works correctly because they use the native anchor (`<a>`) tags.
You can go from the Dashboard to the Heroes page and back.
You can click a hero on the Dashboard page to display its Details page.

If you throttle your network speed so that the client-side scripts take longer to download (instructions below), 
you'll notice:
* Clicking a hero on the Heroes page does nothing.
* You can't add or delete a hero.
* The search box on the Dashboard page is ignored.
* The *Back* and *Save* buttons on the Details page don't work.

User events other than `routerLink` clicks aren't supported.
You must wait for the full client app to bootstrap and run, or buffer the events using libraries like 
[preboot](https://github.com/angular/preboot), which allow you to replay these events once the client-side scripts load.

The transition from the server-rendered app to the client app happens quickly on a development machine, but you should
always test your apps in real-world scenarios.

You can simulate a slower network to see the transition more clearly as follows:

1. Open the Chrome Dev Tools and go to the Network tab.
1. Find the [Network Throttling](https://developers.google.com/web/tools/chrome-devtools/network-performance/reference#throttling) 
dropdown on the far right of the menu bar.
1. Try one of the "3G" speeds.

The server-rendered app still launches quickly but the full client app may take seconds to load.

{@a why-do-it}
<!--
## Why use server-side rendering?
-->
## 서버 사이드 렌더링은 왜 필요한가요?

<!--
There are three main reasons to create a Universal version of your app.

1. Facilitate web crawlers through [search engine optimization (SEO)](https://static.googleusercontent.com/media/www.google.com/en//webmasters/docs/search-engine-optimization-starter-guide.pdf)
1. Improve performance on mobile and low-powered devices

1. Show the first page quickly with a [first-contentful paint (FCP)](https://developers.google.com/web/tools/lighthouse/audits/first-contentful-paint)
-->
1. [검색 엔진 최적화(SEO)](https://static.googleusercontent.com/media/www.google.com/en//webmasters/docs/search-engine-optimization-starter-guide.pdf)를 통해 웹 크롤러에 대응하기 위해
1. 모바일 장비와 저사양 장비에서 동작하는 성능을 끌어올리기 위해
1. [사용자에게 유효한 첫 페이지](https://developers.google.com/web/tools/lighthouse/audits/first-contentful-paint)를 빠르게 표시하기 위해


{@a seo}
{@a web-crawlers}
<!--
### Facilitate web crawlers (SEO)
-->
### 웹 크롤러 대응하기 (SEO)

<!--
Google, Bing, Facebook, Twitter, and other social media sites rely on web crawlers to index your application content and 
make that content searchable on the web.
These web crawlers may be unable to navigate and index your highly interactive Angular application as a human user could do.

Angular Universal can generate a static version of your app that is easily searchable, linkable, and navigable without JavaScript.
Universal also makes a site preview available since each URL returns a fully rendered page.

Enabling web crawlers is often referred to as
[search engine optimization (SEO)](https://static.googleusercontent.com/media/www.google.com/en//webmasters/docs/search-engine-optimization-starter-guide.pdf).
-->
Google, Bing, Facebook, Twitter와 같은 소셜 미디어 사이트는 웹 애플리케이션 컨텐츠를 수집하고 검색에 활용하기 위해 웹 크롤러를 사용합니다.
그런데 이런 웹 크롤러는 진짜 사람이 하는 것처럼 애플리케이션 페이지를 효율적으로 이동하면서 원하는 내용을 수집하지는 못합니다.

Angular Universal은 이런 경우에 사용합니다. Angular Universal을 적용하면 애플리케이션을 정적으로 빌드해둘 수 있기 때문에 컨텐츠를 검색하기 쉽고, 링크를 연결할 수 있으며, JavaScript를 사용하지 않아도 페이지를 전환할 수 있습니다.
그리고 Universal을 적용하면 완전히 렌더링된 페이지를 서버에 준비하기 때문에 웹사이트의 미리보기 화면을 제공할 수도 있습니다.

웹 크롤러에 대응하는 과정은 [검색 엔진 최적화(search engine optimization, SEO)](https://static.googleusercontent.com/media/www.google.com/en//webmasters/docs/search-engine-optimization-starter-guide.pdf)라고도 합니다.

{@a no-javascript}

<!--
### Improve performance on mobile and low-powered devices
-->
### 모바일 장비와 저사양 장비에서 동작하는 성능 끌어올리기

<!--
Some devices don't support JavaScript or execute JavaScript so poorly that the user experience is unacceptable.
For these cases, you may require a server-rendered, no-JavaScript version of the app.
This version, however limited, may be the only practical alternative for
people who otherwise couldn't use the app at all.
-->
JavaScript를 지원하지 않는 디바이스가 존재하기도 하고 JavaScript를 실행하는 것이 오히려 사용자의 UX를 해치는 디바이스도 존재합니다.
이런 경우에는 클라이언트에서 JavaScript를 실행하지 말고 서버에서 미리 렌더링된 앱을 보내서 간단하게 실행하는 것이 더 좋습니다.
앱을 이렇게 제공하면 원래 사용자에게 제공하려던 기능을 모두 제공할 수는 없겠지만, 앱을 전혀 사용할 수 없는 상황은 피할 수 있습니다.

{@a startup-performance}

<!--
### Show the first page quickly
-->
### 첫 페이지를 빠르게 표시하기

<!--
Displaying the first page quickly can be critical for user engagement.
[53 percent of mobile site visits are abandoned](https://www.thinkwithgoogle.com/marketing-resources/data-measurement/mobile-page-speed-new-industry-benchmarks/) 
if pages take longer than 3 seconds to load.
Your app may have to launch faster to engage these users before they decide to do something else.

With Angular Universal, you can generate landing pages for the app that look like the complete app.
The pages are pure HTML, and can display even if JavaScript is disabled.
The pages don't handle browser events, but they _do_ support navigation through the site using [`routerLink`](guide/router#router-link).

In practice, you'll serve a static version of the landing page to hold the user's attention.
At the same time, you'll load the full Angular app behind it. 
The user perceives near-instant performance from the landing page
and gets the full interactive experience after the full app loads.
-->
사용자의 재방문을 유도하려면 첫 페이지를 빠르게 표시하는 것이 무엇보다 중요합니다.
심지어 첫 페이지가 3초 안에 표시되지 않는다면 [53%의 모바일 사용자가 재방문하지 않는다는 통계](https://www.thinkwithgoogle.com/marketing-resources/data-measurement/mobile-page-speed-new-industry-benchmarks/)도 있습니다.
사이트를 방문한 사용자가 다른 곳으로 발길을 돌리는 것을 원하지 않는다면 앱을 최대한 빠르게 실행하는 것이 좋습니다.

이 때 Angular Universal을 사용하면 온전한 앱과 거의 비슷하게 동작하는 랜딩 페이지를 생성할 수 있습니다.
페이지는 HTML만으로 구성되기 때문에 JavaScript가 비활성화되어도 화면을 제대로 표시할 수 있습니다.
다만, JavaScript가 실행되지 않으면 브라우저 이벤트를 처리할 수 없기 때문에 네비게이션은 [`routerLink`](guide/router#router-link)를 사용하는 방식으로 구현되어야 합니다.

운영환경에서도 첫 페이지를 빠르게 표시하기 위해 페이지를 정적으로 렌더링해서 제공하는 경우가 많습니다.
그 이후에 온전한 버전의 Angular 앱을 로드하는 방법을 사용하기도 합니다.
그러면 애플리케이션 첫 페이지를 빠르게 표시하면서도 앱에 구현한 기능을 온전히 사용자에게 제공할 수 있습니다.


{@a how-does-it-work}

<!--
## Universal web servers
-->
## Universal 웹 서버

<!--
A Universal web server responds to application page requests with static HTML rendered by the [Universal template engine](#universal-engine). 
The server receives and responds to HTTP requests from clients (usually browsers), and serves static assets such as scripts, CSS, and images.
It may respond to data requests, either directly or as a proxy to a separate data server.

The sample web server for this guide is based on the popular [Express](https://expressjs.com/) framework.
-->
Universal 웹 서버는 애플리케이션 페이지 요청을 받았을 때 [Universal 템플릿 엔진](#universal-engine)으로 렌더링한 정적 HTML을 제공하는 역할을 담당합니다.
이 서버는 일반적으로 브라우저에서 HTTP 요청을 받고 HTTP 응답을 내려주는데, 스크립트 파일이나 CSS, 이미지 파일과 같은 정적 애셋들도 함께 제공합니다.
이 외에도 API로 통하는 데이터 요청은 Universal 웹 서버가 직접 처리하거나 프록시 역할을 하면서 다른 데이터 서버를 중개할 수도 있을 것입니다.

이 문서에서는 널리 사용되는 [Express](https://expressjs.com/) 프레임워크를 사용해서 샘플 웹 서버를 구현해 봅니다.

<div class="alert is-helpful">

  <!--
  **Note:** _Any_ web server technology can serve a Universal app as long as it can call Universal's `renderModuleFactory()` function.
  The principles and decision points discussed here apply to any web server technology.
  -->
  **참고:** Angular Universal이 제공하는 `renderModuleFactory()` 함수를 실행할수만 있다면 _아무_ 웹 서버를 사용해도 Universal 앱을 제공할 수 있습니다.
  이 섹션에서는 웹 서버를 결정하는 기준에 대해서 조금 더 자세하게 알아봅시다.

</div>

<!--

Universal applications use the Angular `platform-server` package (as opposed to `platform-browser`), which provides 
server implementations of the DOM, `XMLHttpRequest`, and other low-level features that don't rely on a browser.

The server ([Node Express](https://expressjs.com/) in this guide's example)
passes client requests for application pages to the NgUniversal `ngExpressEngine`. Under the hood, this
calls Universal's `renderModuleFactory()` function, while providing caching and other helpful utilities.

The `renderModuleFactory()` function takes as inputs a *template* HTML page (usually `index.html`),
an Angular *module* containing components,
and a *route* that determines which components to display.
The route comes from the client's request to the server.

Each request results in the appropriate view for the requested route.
The `renderModuleFactory()` function renders the view within the `<app>` tag of the template, 
creating a finished HTML page for the client. 

Finally, the server returns the rendered page to the client.
-->
Universal 애플리케이션은 (`platform-browser` 대신) Angular가 제공하는 `platform-server` 패키지를 사용합니다.
이 패키지는 서버에서 DOM에 접근할 수 있는 기능이나 `XMLHttpRequest` 와 같이 브라우저의 기능이 필요한 로직에 사용됩니다.

이 문서에서 다루는 것처럼 [Node Express](https://expressjs.com/)를 사용하는 서버라면 클라이언트에서 보내는 애플리케이션 페이지 요청을 NgUniversal이 제공하는 `ngExpressEngine` 으로 전달합니다.
그러면 Universal의 `renderModuleFactory()` 함수가 실행되면서 페이지를 구성합니다.

`renderModuleFactory()` 함수는 HTML *템플릿* 페이지(일반적으로 `index.html`)를 바탕으로 Angular 컴포넌트로 구성된 *모듈*을 생성하며, *라우팅 규칙*에 맞게 컴포넌트를 화면에 표시합니다.
이 때 라우팅 규칙은 클라이언트가 서버로 보낸 것이 사용됩니다.

클라이언트가 보낸 요청의 결과는 해당 라우팅 규칙과 연결된 애플리케이션 페이지가 됩니다.
그래서 `renderModuleFactory()` 함수는 템플릿의 `<app>` 태그에 뷰를 렌더링하며, 결과적으로 온전하게 HTML로 구성된 페이지가 생성됩니다.

이제 렌더링된 페이지를 클라이언트가 받으면 브라우저에 이 페이지가 표시됩니다.


<!--
### Working around the browser APIs
-->
### 브라우저 API 활용하기

<!--
Because a Universal app doesn't execute in the browser, some of the browser APIs and capabilities may be missing on the server.

For example, server-side applications can't reference browser-only global objects such as `window`, `document`, `navigator`, or `location`. 

Angular provides some injectable abstractions over these objects, such as [`Location`](api/common/Location) 
or [`DOCUMENT`](api/common/DOCUMENT); it may substitute adequately for these APIs.
If Angular doesn't provide it, it's possible to write new abstractions that delegate to the browser APIs while in the browser 
and to an alternative implementation while on the server (aka shimming).

Similarly, without mouse or keyboard events, a server-side app can't rely on a user clicking a button to show a component.
The app must determine what to render based solely on the incoming client request.
This is a good argument for making the app [routable](guide/router).

Because the user of a server-rendered page can't do much more than click links,
you should swap in the real client app as quickly as possible for a proper interactive experience.
-->
Universal `platform-server` 앱은 브라우저에서 실행되지 않기 때문에 브라우저 API를 직접 활용할 수 없습니다.

그래서 서버 사이드 페이지는 브라우저에만 존재하는 `window`나 `document`, `navigator`, `location`과 같은 전역 객체를 참조할 수 없습니다.

Angular는 이런 객체를 참조해야 하는 상황을 대비해서 [`Localtion`](api/common/Location)이나 [`DOCUMENT`](api/common/DOCUMENT) 과 같은 추상 클래스를 제공하기 때문에, 필요한 곳에 의존성으로 주입받아 사용하면 됩니다.
그리고 Angular가 제공하는 추상 클래스로 해결할 수 없다면 개발자가 직접 이 추상 클래스를 정의해야 합니다.

이와 비슷하게, 마우스 이벤트나 키보드 이벤트도 서버 사이드 앱에는 존재하지 않습니다. 서버에서 페이지를 렌더링하는데 컴포넌트를 표시하는 버튼을 누를 사용자가 없기 때문입니다.
그렇다면 서버 사이드 앱은 클라이언트의 요청만으로 온전히 렌더링할 수 있는 로직으로 작성해야 합니다.
이 방식은 앱을 [라우팅할 수 있도록](guide/router) 구현한다는 측면에서도 활용할 수 있습니다.

결국 서버에서 렌더링된 페이지에서는 사용자가 링크를 클릭한다는 방식을 활용할 수 없기 때문에, 이와 유사한 UX를 제공할 수 있도록 구현방식을 수정해야 할 수도 있습니다.

{@a http-urls}
### Using absolute URLs for server requests

The tutorial's `HeroService` and `HeroSearchService` delegate to the Angular `HttpClient` module to fetch application data.
These services send requests to _relative_ URLs such as `api/heroes`.
In a Universal app, HTTP URLs must be _absolute_ (for example, `https://my-server.com/api/heroes`).
This means you need to change your services to make requests with absolute URLs when running on the server and with relative 
URLs when running in the browser.

One solution is to provide the full URL to your application on the server, and write an interceptor that can retrieve this
value and prepend it to the request URL. If you're using the `ngExpressEngine`, as shown in the example in this guide, half
the work is already done. We'll assume this is the case, but it's trivial to provide the same functionality.

Start by creating an [HttpInterceptor](api/common/http/HttpInterceptor):


<code-example format="." language="typescript">

import {Injectable, Inject, Optional} from '@angular/core';
import {HttpInterceptor, HttpHandler, HttpRequest, HttpHeaders} from '@angular/common/http';
import {Request} from 'express';
import {REQUEST} from '@nguniversal/express-engine/tokens';

@Injectable()
export class UniversalInterceptor implements HttpInterceptor {

  constructor(@Optional() @Inject(REQUEST) protected request: Request) {}


  intercept(req: HttpRequest<any>, next: HttpHandler) {
    let serverReq: HttpRequest<any> = req;
    if (this.request) {
      let newUrl = `${this.request.protocol}://${this.request.get('host')}`;
      if (!req.url.startsWith('/')) {
        newUrl += '/';
      }
      newUrl += req.url;
      serverReq = req.clone({url: newUrl});
    }
    return next.handle(serverReq);
  }
}

</code-example>

Next, provide the interceptor in the providers for the server `AppModule` (app.server.module.ts):

<code-example format="." language="typescript">

import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {UniversalInterceptor} from './universal-interceptor';

@NgModule({
  ...
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: UniversalInterceptor,
    multi: true
  }],
})
export class AppServerModule {}

</code-example>
-->
<code-example path="universal/src/app/hero.service.ts" region="ctor" header="src/app/hero.service.ts (옵션 인자 origin을 추가한 생성자)">
</code-example>


Now, on every HTTP request made on the server, this interceptor will fire and replace the request URL with the absolute
URL provided in the Express `Request` object.

{@a universal-engine}
<!--
### Universal template engine
-->
### Universal 템플릿 엔진

<!--
The important bit in the `server.ts` file is the `ngExpressEngine()` function.
-->
`server.ts` 파일에서는 `ngExpressEngine()` 함수가 중요합니다.

<code-example path="universal/server.ts" header="server.ts" region="ngExpressEngine">
</code-example>

<!--
The `ngExpressEngine()` function is a wrapper around Universal's `renderModuleFactory()` function which turns a client's 
requests into server-rendered HTML pages.


* The first parameter is `AppServerModule`.
It's the bridge between the Universal server-side renderer and the Angular application.

* The second parameter, `extraProviders`, is optional. It lets you specify dependency providers that apply only when 
running on this server.
You can do this when your app needs information that can only be determined by the currently running server instance. 
One example could be the running server's *origin*, which could be used to [calculate absolute HTTP URLs](#http-urls) if
not using the `Request` token as shown above.

The `ngExpressEngine()` function returns a `Promise` callback that resolves to the rendered page. 
It's up to the engine to decide what to do with that page.
This engine's `Promise` callback returns the rendered page to the web server,
which then forwards it to the client in the HTTP response.
-->
`ngExpressEngine()` 함수는 Universal이 제공하는 `renderModuleFactory()` 함수를 랩핑한 함수이며, `renderModuleFactory()` 함수는 클라이언트의 요청을 서버가 렌더링한 HTML 페이지로 변경해서 요청하는 함수입니다.

* 첫번째 인자는 `AppServerModule` 입니다.
이 모듈은 Universal 서버 사이드 렌더러와 Angular 애플리케이션을 이어주는 역할을 합니다.

* 두번째 인자 `extraProviders`는 생략할 수 있습니다. 이 인자에는 서버에만 필요한 의존성 객체의 프로바이더를 지정합니다.
이 인자는 서버 인스턴스와 관련된 정보를 앱에 사용해야 할 때 지정합니다.
그래서 이 예제에서처럼 서버 사이드 앱이 [HTTP URL을 절대 주소로](#http-urls) 요청해야 할 때 서버의 절대 주소를 `Request` 토큰으로 주입하는 방식으로 사용할 수 있습니다.

`ngExpressEngine()` 함수는 렌더링된 페이지를 `Promise` 콜백 형태로 반환합니다.
그리고 이 페이지를 어떻게 활용할 것인지는 서버에서 사용하는 엔진에 따라 달라집니다.
단순하게 구현하면, `Promise` 콜백 형태로 전달된 페이지를 웹 서버로 반환하고 웹 서버가 HTTP 응답으로 클라이언트에 전달하면 됩니다.

<div class="alert is-helpful">

  <!--
  **Note:**  These wrappers help hide the complexity of the `renderModuleFactory()` function. There are more wrappers 
  for different backend technologies at the [Universal repository](https://github.com/angular/universal).

  -->
  **참고:** `renderModuleFactory()` 함수를 직접 사용하는 것보다는 `ngExpressEngine()` 랩핑 헬퍼를 사용하는 것이 편합니다. 이와 비슷한 방식으로 제공되는 랩퍼 함수들을 알아보려면 [Universal 레파지토리](https://github.com/angular/universal)를 참고하세요.

</div>

<!--
### Filtering request URLs
-->
### 요청으로 보내는 URL 필터링하기

<!--
NOTE: the basic behavior described below is handled automatically when using the NgUniversal Express schematic, this
is helpful when trying to understand the underlying behavior or replicate it without using the schematic.

The web server must distinguish _app page requests_ from other kinds of requests.

It's not as simple as intercepting a request to the root address `/`.
The browser could ask for one of the application routes such as `/dashboard`, `/heroes`, or `/detail:12`.
In fact, if the app were only rendered by the server, _every_ app link clicked would arrive at the server
as a navigation URL intended for the router.

Fortunately, application routes have something in common: their URLs lack file extensions. 
(Data requests also lack extensions but they're easy to recognize because they always begin with `/api`.)
All static asset requests have a file extension (such as `main.js` or `/node_modules/zone.js/dist/zone.js`).

Because we use routing, we can easily recognize the three types of requests and handle them differently.

1. **Data request**: request URL that begins `/api`.
1. **App navigation**: request URL with no file extension.
1. **Static asset**: all other requests.

A Node Express server is a pipeline of middleware that filters and processes requests one after the other. 
You configure the Node Express server pipeline with calls to `app.get()` like this one for data requests.
-->
NOTE: the basic behavior described below is handled automatically when using the NgUniversal Express schematic, this
is helpful when trying to understand the underlying behavior or replicate it without using the schematic.

웹 서버는 _앱 페이지를 요청하는 것_ 과 데이터를 요청하는 것을 구별할 수 있어야 합니다.

하지만 최상위 주소 `/` 이외에는 이 요청이 어떤 용도로 사용되는 것인지 구분하기 어렵습니다.
브라우저가 사용하는 라우팅 경로가 `/dashboard`나 `heroes`, `/detail:12`와 같은 형식으로 존재할 수 있기 때문입니다.
그런데 앱이 서버에서 모두 렌더링되어 서비스된다고 하면, 사용자가 클릭할 수 있는 _모든_ 앱 링크는 페이지를 전환하는 URL에 해당하며 Angular 라우터가 모두 처리해야 한다고 간주할 수 있습니다.

다행히 애플리케이션 라우팅이 공통으로 활용할 수 있는 규칙이 있습니다: 파일 확장자가 없는 URL을 모두 라우팅 경로로 간주하는 방법입니다.
(데이터 요청도 확장자가 없지만, 이 경우에는 URL이 `/api`로 시작하기 때문에 쉽게 구분할 수 있습니다.)
앱에 필요한 정적 애셋(static asset)들은 모두 확장자가 존재합니다. (ex. `main.js`, `/node_modules/zone.js/dist/zone.js`)

Angular 앱은 라우터를 사용하기 때문에 다음과 같은 3가지 요청을 쉽게 구분하고 적절한 방법으로 처리할 수 있습니다.

1. **데이터 요청** - URL이 `/api`로 시작하는 경우
2. **앱 네비게이션** - 파일 확장자가 없는 경우
3. **정적 애셋** - 두 경우를 제외한 모든 경우

Node Express 서버는 미들웨어 파이프라인을 연결하는 방식으로 동작하기 때문에 클라이언트가 보낸 요청을 처리할 때 URL을 활용할 수 있습니다.
그래서 데이터 요청 URL을 처리하는 Node Express 서버의 파이프라인을 정의한다면 Express가 제공하는 `app.get()` 함수를 사용해서 다음과 같이 정의할 수 있습니다.

<!--
<code-example path="universal/server.ts" header="server.ts (data URL)" region="data-request" linenums="false">
</code-example>
-->
<code-example path="universal/server.ts" header="server.ts (데이터 URL)" region="data-request" linenums="false">
</code-example>

<div class="alert is-helpful">

  <!--
  **Note:** This sample server doesn't handle data requests.

  The tutorial's "in-memory web API" module, a demo and development tool, intercepts all HTTP calls and
  simulates the behavior of a remote data server.
  In practice, you would remove that module and register your web API middleware on the server here.
  -->
  **참고:** 튜토리얼 설정으로는 데이터 요청을 처리하지 않습니다.

  지금 살펴보고 있는 튜토리얼은 "인-메모리 웹 API" 모듈을 사용하기 때문에, 서버로 보내야 하는 모든 HTTP 요청을 가로채서 메모리 안에서 처리합니다.
  리모트 데이터 서버로 실제 요청을 보내려면 이 모듈을 제거하고 서버에 웹 API 미들웨어를 설정해야 합니다.

</div>

<!--
The following code filters for request URLs with no extensions and treats them as navigation requests.
-->
다음 코드는 URL에 확장자가 없을 때 이 요청을 네비게이션 요청으로 처리하는 코드입니다.

<!--
<code-example path="universal/server.ts" header="server.ts (navigation)" region="navigation-request" linenums="false">
</code-example>
-->
<code-example path="universal/server.ts" header="server.ts (네비게이션)" region="navigation-request" linenums="false">
</code-example>

<!--
### Serving static files safely
-->
### 정적 파일 안전하게 제공하기

<!--
A single `app.use()` treats all other URLs as requests for static assets
such as JavaScript, image, and style files.

To ensure that clients can only download the files that they are permitted to see, put all client-facing asset files in 
the `/dist` folder and only honor requests for files from the `/dist` folder.

The following Node Express code routes all remaining requests to `/dist`, and returns a `404 - NOT FOUND` error if the 
file isn't found.
-->
JavaScript 파일이나 이미지 파일, 스타일 파일과 같은 정적 애셋은 `app.use()` 하나로 간단하게 처리할 수 있습니다.

그리고 클라이언트가 이 파일들을 다운로드 받을 수 있는 권한을 지정하기 위해, 애셋 파일은 모두 `/dist` 폴더에 두는 것이 좋습니다.

아래 코드는 정적 애셋을 요청받았을 때 실행되는 Node Express 코드입니다. 요청받은 파일은 `/dist` 폴더에서 찾아 보내는데, 이 파일이 존재하지 않으면 `404 - NOT FOUND`를 반환합니다.

<!--
<code-example path="universal/server.ts" header="server.ts (static files)" region="static" linenums="false">
</code-example>

