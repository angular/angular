<!--
# Routing & Navigation
-->
# 라우팅 & 네비게이션

<!--
The Angular **`Router`** enables navigation from one [view](guide/glossary#view) to the next
as users perform application tasks.
-->
Angular가 제공하는 **라우터(`Router)`**를 사용하면 사용자의 동작에 반응하며 [뷰](guide/glossary#view)를 전환할 수 있습니다.

<!--
This guide covers the router's primary features, illustrating them through the evolution
of a small application that you can <live-example>run live in the browser</live-example>.
-->
이 문서는 작은 애플리케이션을 점점 확장해 가면서 라우터의 사용방법에 대해 알아봅니다.
이 문서에서 다루는 예제는 <live-example></live-example>에서 직접 확인하거나 다운받아 실행할 수 있습니다.

<!-- style for all tables on this page -->
<style>
  td, th {vertical-align: top}
</style>

<!--
## Overview
-->
## 개요

<!--
The browser is a familiar model of application navigation:

* Enter a URL in the address bar and the browser navigates to a corresponding page.
* Click links on the page and the browser navigates to a new page.
* Click the browser's back and forward buttons and the browser navigates
  backward and forward through the history of pages you've seen.
-->
브라우저가 제공하는 네비게이션 모델은 이렇습니다.

* 주소표시줄에 URL을 입력하면 특정 페이지로 이동합니다.
* 페이지에 있는 링크를 클릭하면 새로운 페이지로 이동합니다.
* 브라우저의 뒤로 가기/앞으로 가기 버튼을 누르면 사용자가 방문한 페이지 히스토리에 따라 뒤로/앞으로 페이지를 이동합니다.

<!--
The Angular `Router` ("the router") borrows from this model.
It can interpret a browser URL as an instruction to navigate to a client-generated view.
It can pass optional parameters along to the supporting view component that help it decide what specific content to present.
You can bind the router to links on a page and it will navigate to
the appropriate application view when the user clicks a link.
You can navigate imperatively when the user clicks a button, selects from a drop box,
or in response to some other stimulus from any source. And the router logs activity
in the browser's history journal so the back and forward buttons work as well.
-->
Angular가 제공하는 `Router`도 이 모델을 따릅니다.
브라우저에서 접근하는 URL에 해당하는 뷰를 생성해서 사용자가 볼 수 있도록 화면에 표시하며, 이 때 컴포넌트에 추가 정보를 제공하기 위해 라우팅 변수를 사용할 수도 있습니다.
그리고 라우터를 직접 사용해서 페이지를 이동해도 사용자가 링크를 클릭했을 때 페이지를 이동하는 것과 동일하게 처리합니다.
이 특징을 활용하면 사용자가 버튼을 클릭했을 때, 드롭 박스에서 항목을 선택했을 때, 비동기 소스로부터 어떤 이벤트를 받았을 때 등 다양한 경우에 페이지를 전환할 수 있습니다.
라우터는 브라우저의 히스토리 기록도 지원하기 때문에, 라우터로 이동한 페이지는 브라우저의 뒤로 가기/앞으로 가기 버튼으로 이동할 수도 있습니다.

{@a basics}


<!--
## The Basics
-->
## 라우터 기본

<!--
This guide proceeds in phases, marked by milestones, starting from a simple two-pager
and building toward a modular, multi-view design with child routes.

An introduction to a few core router concepts will help orient you to the details that follow.
-->
이 문서에서는 단순하게 페이지를 전환하는 라우터부터 모듈로 구성하는 라우터, 자식 라우터를 활용한 멀티 뷰 디자인 구현 방법에 대해 차례로 알아봅니다.

먼저 라우터의 기본 개념부터 알아봅시다.

{@a basics-base-href}


### *&lt;base href>*

<!--
Most routing applications should add a `<base>` element to the `index.html` as the first child in the  `<head>` tag
to tell the router how to compose navigation URLs.

If the `app` folder is the application root, as it is for the sample application,
set the `href` value *exactly* as shown here.
-->
라우터를 사용하는 애플리케이션은 `index.html`파일의 `<head>` 태그 가장 처음에 라우터가 이동하는 URL의 기준점을 지정해야 하는데, 이 때 `<base>` 엘리먼트를 사용합니다.

만약 Angular CLI로 생성한 프로젝트이고, `app` 폴더가 애플리케이션 최상위 폴더라면 다음과 같이 지정되어 있을 것입니다.

<code-example path="router/src/index.html" linenums="false" header="src/index.html (base-href)" region="base-href">

</code-example>



{@a basics-router-imports}

<!--
### Router imports
-->
### 라우터 로드하기

<!--
The Angular Router is an optional service that presents a particular component view for a given URL.
It is not part of the Angular core. It is in its own library package, `@angular/router`.
Import what you need from it as you would from any other Angular package.
-->
라우터는 URL과 컴포넌트를 연결하는 서비스지만, Angular 애플리케이션을 구현하면서 꼭 사용해야 하는 서비스는 아닙니다.
그래서 라우터는 Angular 코어에서 제외되었으며, `@angular/router` 라이브러리 패키지로 제공됩니다.
라우터를 사용하려면 다른 Angular 패키지와 마찬가지로 다음과 같이 로드합니다.

<code-example path="router/src/app/app.module.1.ts" linenums="false" header="src/app/app.module.ts (import)" region="import-router">

</code-example>



<div class="alert is-helpful">


<!--
You'll learn about more options in the [details below](#browser-url-styles).
-->
라우터 옵션에 대해서는 [아래](#browser-url-styles)에서 자세하게 다룹니다.

</div>



{@a basics-config}

<!--
### Configuration
-->
### 라우터 설정

<!--
A routed Angular application has one singleton instance of the *`Router`* service.
When the browser's URL changes, that router looks for a corresponding `Route`
from which it can determine the component to display.

A router has no routes until you configure it.
The following example creates five route definitions, configures the router via the `RouterModule.forRoot()` method,
and adds the result to the `AppModule`'s `imports` array.
-->
라우터를 사용하는 Angular 애플리케이션이라면 *`Router`* 서비스 인스턴스가 싱글턴으로 존재합니다.
그래서 브라우저의 URL이 변경되면 이 라우터가 이 변경사항과 관련된 라우팅 규칙(routes)을 찾아서 어떤 컴포넌트를 표시해야 하는지 판단합니다.

개발자가 설정하기 전에는 아무 라우팅 규칙도 없습니다.
다음 예제는 라우팅 규칙을 각각 다른 4가지 방식으로 정의한 예제 코드입니다.
이 라우팅 규칙들은 라우터 모듈의 `RouterModule.forRoot()` 메소드를 사용해서 `AppModule`의 `imports` 배열에 등록되었습니다.

<!--
<code-example path="router/src/app/app.module.0.ts" linenums="false" header="src/app/app.module.ts (excerpt)">
-->
<code-example path="router/src/app/app.module.0.ts" linenums="false" header="src/app/app.module.ts (일부)">

</code-example>



{@a example-config}

<!--
The `appRoutes` array of *routes* describes how to navigate.
Pass it to the `RouterModule.forRoot()` method in the module `imports` to configure the router.
-->
`appRoutes` 배열에는 네비게이션을 수행하는 *라우팅 규칙(routes)*을 정의합니다.
그러면 라우팅 규칙들이 모듈의 `imports` 항목에 사용된 `RouterModule.forRoot()` 메소드의 인자로 전달되어 애플리케이션에 등록됩니다.

<!--
Each `Route` maps a URL `path` to a component.
There are _no leading slashes_ in the _path_.
The router parses and builds the final URL for you,
allowing you to use both relative and absolute paths when navigating between application views.
-->
각각의 라우팅 규칙은 URL `path`와 컴포넌트를 맵핑합니다.
이 때 _path_ 가 _슬래시(`/`)_ 로 시작하면 안되며, 이렇게 지정된 경로는 상대주소와 절대주소 방식으로 모두 동작할 수 있도록 라우터가 파싱해서 등록합니다.

<!--
The `:id` in the second route is a token for a route parameter. In a URL such as `/hero/42`, "42"
is the value of the `id` parameter. The corresponding `HeroDetailComponent`
will use that value to find and present the hero whose `id` is 42.
You'll learn more about route parameters later in this guide.
-->
두 번째 라우팅 규칙에 사용된 `:id`는 라우팅 변수에 사용하는 토큰인데, 이 코드의 경우에는 `/hero/42` 경로로 접속했을 때 "42"가 `id` 변수의 값에 할당됩니다.
그러면 이 경로와 연결된 `HeroDetailComponent`에서 `id`가 42인 히어로를 찾아 화면에 표시하는 용도로 사용할 수 있습니다.
라우팅 변수에 대한 내용은 이 문서의 후반부에 자세하게 알아봅니다.

<!--
The `data` property in the third route is a place to store arbitrary data associated with
this specific route. The data property is accessible within each activated route. Use it to store
items such as page titles, breadcrumb text, and other read-only, _static_ data.
You'll use the [resolve guard](#resolve-guard) to retrieve _dynamic_ data later in the guide.
-->
세 번째 라우팅 규칙에 사용된 `data` 프로퍼티는 라우팅 규칙에 데이터를 전달할 때 사용하는 프로퍼티입니다.
이렇게 전달한 데이터 프로퍼티는 라우터를 통해 참조할 수 있으며, 페이지 제목이나 간단한 텍스트, 읽기 전용 데이터, 정적 데이터를 저장하는 용도로 활용할 수 있습니다.
[라우터 가드(resolve guard)](#resolve-guard)를 사용해서 _동적_ 데이터를 전달하는 방법은 이 문서의 후반부에 다룹니다.

<!--
The **empty path** in the fourth route represents the default path for the application,
the place to go when the path in the URL is empty, as it typically is at the start.
This default route redirects to the route for the `/heroes` URL and, therefore, will display the `HeroesListComponent`.
-->
네 번째 라우팅 규칙에 사용된 **빈 주소**는 하위 URL 주소가 없을 때 사용되는 애플리케이션의 기본 주소인데, 보통 애플리케이션의 시작 주소로 사용합니다.
이 예제에서는 빈 주소로 접속했을 때 `/heroes` URL로 리다이렉트 하며, 이 동작으로 인해 `HeroesListComponent`가 화면에 표시될 것입니다.

<!--
The `**` path in the last route is a **wildcard**. The router will select this route
if the requested URL doesn't match any paths for routes defined earlier in the configuration.
This is useful for displaying a "404 - Not Found" page or redirecting to another route.
-->
마지막 라우팅 규칙에 사용된 `**`는 **와일드카드(wildcard)**입니다.
이 라우팅 규칙은 사용자가 요청한 URL에 해당하는 규칙이 없을 때 적용되며, 이 규칙을 사용하면 "404 - Not Found" 페이지를 표시하거나 다른 주소로 라우팅하는 용도로 활용할 수 있습니다.

<!--
**The order of the routes in the configuration matters** and this is by design. The router uses a **first-match wins**
strategy when matching routes, so more specific routes should be placed above less specific routes.
In the configuration above, routes with a static path are listed first, followed by an empty path route,
that matches the default route.
The wildcard route comes last because it matches _every URL_ and should be selected _only_ if no other routes are matched first.
-->
Angular 라우터는 **라우팅 규칙이 선언된 순서대로 적용되도록** 설계되었습니다.
그래서 사용자가 요청한 URL이 라우팅 규칙 여러개와 매칭되더라도 **제일 먼저 매칭된 항목이 동작**하기 때문에, 일반적인 라우팅 규칙보다 세부적인 라우팅 규칙이 먼저 정의되어야 합니다.
이 코드에서 설정한 것을 보면, 고정된 주소로 지정된 URL이 처음 매칭되며, 라우팅 변수를 사용한 라우팅 규칙이 그 다음으로 매칭되고, 빈 주소에 해당하는 라우팅 규칙, 기본 라우팅 규칙이 순서대로 매칭됩니다.
와일드카드 라우팅 규칙은 _모든 URL_ 에 매칭되기 때문에 이 규칙은 가장 마지막에 정의되어야 합니다.

<!--
If you need to see what events are happening during the navigation lifecycle, there is the **enableTracing** option as part of the router's default configuration. This outputs each router event that took place during each navigation lifecycle to the browser console. This should only be used for _debugging_ purposes. You set the `enableTracing: true` option in the object passed as the second argument to the `RouterModule.forRoot()` method.
-->
네비게이션 라이프싸이클이 실행되는 동안 어떤 이벤트가 발생하는지 확인하려면, 라우터를 설정할 때 **enableTracing** 옵션을 사용하면 됩니다.
이 옵션이 설정되면 각 네비게이션 라이프싸이클이 실행될 때마다 브라우저에 로그가 출력됩니다.
이 옵션은 `RouterModule.forRoot()` 메소드의 두 번째 인자로 `enableTracing: true` 를 지정하면 되며,  _디버깅_ 용도로만 사용하는 것이 좋습니다.

{@a basics-router-outlet}

<!--
### Router outlet
-->
### 라우팅 영역 (Router outlet)

<!--
The `RouterOutlet` is a directive from the router library that is used like a component.
It acts as a placeholder that marks the spot in the template where the router should
display the components for that outlet.
-->
`RouterOutlet`은 라우터가 제공하는 디렉티브이며, 일반 컴포넌트처럼 사용합니다.
이 디렉티브는 라우터에 의해 표시되는 컴포넌트가 화면의 어느 위치에 표시될지 지정하는 용도로 사용합니다.

<!--
<code-example language="html">
  &lt;router-outlet>&lt;/router-outlet>
  &lt;!-- Routed components go here --&gt;

</code-example>
-->
<code-example language="html">
  &lt;router-outlet>&lt;/router-outlet>
  &lt;!-- 라우팅 대상이 된 컴포넌트는 여기에 추가됩니다. --&gt;

</code-example>

<!--
Given the configuration above, when the browser URL for this application becomes `/heroes`,
the router matches that URL to the route path `/heroes` and displays the `HeroListComponent`
as a sibling element to the `RouterOutlet` that you've placed in the host component's template.
-->
이제 브라우저의 URL이 `/heroes`가 되면 이 주소에 매칭되는 컴포넌트인 `HeroListComponent`가 화면에 표시되는데, 이 컴포넌트는 호스트 컴포넌트 템플릿의 `RouterOutlet` 엘리먼트 바로 뒤에 표시됩니다.

{@a basics-router-links}
{@a router-link}

<!--
### Router links
-->
### 라우터 링크

<!--
Now you have routes configured and a place to render them, but
how do you navigate? The URL could arrive directly from the browser address bar.
But most of the time you navigate as a result of some user action such as the click of
an anchor tag.
-->
이제 라우터도 설정했고 주소에 연결된 컴포넌트가 어디에 표시되는지도 알았습니다. 그런데 이 주소로 어떻게 이동할 수 있을까요?
물론 브라우저 주소 표시줄에 원하는 주소를 바로 입력해서 이동할 수도 있습니다.
하지만 대부분의 경우는 사용자가 앵커 태그를 클릭하는 것과 같은 사용자 동작에 의해 네비게이션이 이루어집니다.

<!--
Consider the following template:
-->
다음과 같은 템플릿을 봅시다:


<code-example path="router/src/app/app.component.1.html" linenums="false" header="src/app/app.component.html">

</code-example>

<!--
The `RouterLink` directives on the anchor tags give the router control over those elements.
The navigation paths are fixed, so you can assign a string to the `routerLink` (a "one-time" binding).
-->
앵커 태그에 사용된 `RouterLink` 디렉티브는 이 앵커 태그의 동작을 라우터에게 위임하는 디렉티브입니다.
그래서 고정된 주소로 이동하는 경우라면 `routerLink`에 문자열을 할당해도 됩니다. (한 번만 바인딩하는 문법입니다.)

<!--
Had the navigation path been more dynamic, you could have bound to a template expression that
returned an array of route link parameters (the _link parameters array_).
The router resolves that array into a complete URL.
-->
네비게이션 경로가 동적으로 할당되는 경우라면, 라우터 링크 변수를 템플릿 표현식으로 바인딩할 수도 있습니다.
이 때 라우터 링크 변수는 배열로 지정하며, 이 배열은 라우터가 완전한 URL로 변환해서 적용합니다.


{@a router-link-active}

<!--
### Active router links
-->
### 활성화된 라우터 링크 (Active router links)

<!--
The `RouterLinkActive` directive toggles css classes for active `RouterLink` bindings based on the current `RouterState`.
-->
`RouterLinkActive` 디렉티브는 현재 `RouterState`에 해당하는 `RouterLink`에 css 클래스를 지정합니다.

<!--
On each anchor tag, you see a [property binding](guide/template-syntax#property-binding) to the `RouterLinkActive` directive that look like `routerLinkActive="..."`.
-->
각 앵커 태그에는 `routerLinkActive="..."`와 같이 [프로퍼티 바인딩](guide/template-syntax#프로퍼티-바인딩)된 `RouterLinkActive` 디렉티브가 존재합니다.

<!--
The template expression to the right of the equals (=) contains a space-delimited string of CSS classes
that the Router will add when this link is active (and remove when the link is inactive). You set the `RouterLinkActive`
directive to a string of classes such as `[routerLinkActive]="'active fluffy'"` or bind it to a component
property that returns such a string.
-->
이 템플릿 표현식의 등호(=) 오른쪽에는 공백으로 구분하는 CSS 클래스를 지정하는데, 이 링크가 활성화되면 해당 클래스가 지정되고 링크가 비활성화되면 해당 클래스가 제거됩니다.
그래서 `RouterLinkActive` 디렉티브에는 `[routerLinkActive]="'active fluffy'"`와 같은 문자열을 지정하거나 컴포넌트 클래스에서 문자열을 반환하는 프로퍼티나 메소드를 지정할 수 있습니다.

<!--
Active route links cascade down through each level of the route tree, so parent and child router links can be active at the same time. To override this behavior, you can bind to the `[routerLinkActiveOptions]` input binding with the `{ exact: true }` expression. By using `{ exact: true }`, a given `RouterLink` will only be active if its URL is an exact match to the current URL.
-->
라우팅 규칙은 트리 구조로 구성되기 때문에 부모 컴포넌트의 라우터 링크와 자식 컴포넌트의 라우터 링크가 동시에 활성화될 수도 있습니다. 이 동작을 변경하려면 `[routerLinkActiveOptions]`에 `{ exact: true }`를 바인딩하면 됩니다. 그러면 현재 URL과 정확히 매칭되는 `RouterLink`만 활성화 됩니다.

{@a basics-router-state}

<!--
### Router state
-->
### 라우터 스테이트 (Router state)

<!--
After the end of each successful navigation lifecycle, the router builds a tree of `ActivatedRoute` objects
that make up the current state of the router. You can access the current `RouterState` from anywhere in the
application using the `Router` service and the `routerState` property.
-->
각각의 네비게이션 라이프싸이클이 끝나면 라우터는 현재 라우터 스테이트를 표현하는 `ActivatedRoute` 트리를 객체 타입으로 생성합니다. 그러면 애플리케이션에서 이 라우터 스테이트를 활용해서 로직을 작성할 수 있습니다.

<!--
Each `ActivatedRoute` in the `RouterState` provides methods to traverse up and down the route tree
to get information from parent, child and sibling routes.
-->
`RouteState`에서 제공하는 `ActivatedRoute`는 라우트 트리에 따라 구성되기 때문에, 부모 라우터와 자식 라우터, 이웃 라우터에 대한 정보도 참조할 수 있습니다.

{@a activated-route}

<!--
### Activated route
-->
### 활성화된 라우팅 규칙 (Activated route)

<!--
The route path and parameters are available through an injected router service called the
[ActivatedRoute](api/router/ActivatedRoute).
It has a great deal of useful information including:
-->
라우팅 주소와 라우팅 인자는 [ActivatedRoute](api/router/ActivatedRoute)라는 라우터 서비스 내부 객체를 사용해서 참조할 수 있습니다.
이 객체는 다음 프로퍼티들을 자주 활용합니다:

<table>
  <tr>
    <th>
      <!--
      Property
      -->
      프로퍼티
    </th>
    <th>
      <!--
      Description
      -->
      설명
    </th>
  </tr>

  <tr>
    <td>
      <code>url</code>
    </td>
    <td>

    <!--
    An `Observable` of the route path(s), represented as an array of strings for each part of the route path.
    -->
    라우팅 경로를 `Observable` 타입으로 표현합니다. 이 프로퍼티를 참조하면 라우팅 경로를 구성하는 각 문자열을 배열 형태로 확인할 수 있습니다.

    </td>
  </tr>

  <tr>
    <td>
      <code>data</code>
    </td>
    <td>

    <!--
    An `Observable` that contains the `data` object provided for the route. Also contains any resolved values from the [resolve guard](#resolve-guard).
    -->
    라우팅 규칙에 `data` 객체가 지정되었을 때 이 데이터를 `Observable` 타입으로 표현합니다. 이 객체에는 [라우터 가드](#resolve-guard)에서 처리된 내용이 포함될 수도 있습니다.

    </td>
  </tr>

  <tr>
    <td>
      <code>paramMap</code>
    </td>
    <td>

    <!--
    An `Observable` that contains a [map](api/router/ParamMap) of the required and [optional parameters](#optional-route-parameters) specific to the route. The map supports retrieving single and multiple values from the same parameter.
    -->
    라우팅 규칙에 정의된 [라우팅 변수](#optional-route-parameters)를 [map](api/router/ParamMap) 타입의 `Observable`로 표현합니다. 맵을 사용하면 라우팅 규칙에 포함된 라우팅 인자를 한 번에 모두 가져올 수도 있습니다.

    </td>
  </tr>

  <tr>
    <td>
      <code>queryParamMap</code>
    </td>
    <td>

      <!--
    An `Observable` that contains a [map](api/router/ParamMap) of the [query parameters](#query-parameters) available to all routes.
    The map supports retrieving single and multiple values from the query parameter.
    -->
    라우팅 규칙에서 접근할 수 있는 모든 [쿼리 변수](#query-parameters)를 [map](api/router/ParamMap) 타입의 `Observable`로 표현합니다.
    맵을 사용하면 라우팅 규칙에 포함된 쿼리 변수를 한 번에 모두 가져올 수도 있습니다.

    </td>
  </tr>

  <tr>
    <td>
      <code>fragment</code>
    </td>
    <td>

    <!--
    An `Observable` of the URL [fragment](#fragment) available to all routes.
    -->
    모든 라우팅 규칙에 포함된 URL [조각](#fragment)을 `Observable` 형태로 표현합니다.

    </td>
  </tr>

  <tr>
    <td>
      <code>outlet</code>
    </td>
    <td>

    <!--
    The name of the `RouterOutlet` used to render the route. For an unnamed outlet, the outlet name is _primary_.
    -->
    라우팅 영역으로 사용되는 `RouterOutlet`을 지정할 때 사용합니다. 라우팅 영역에 이름을 지정하지 않으면 _primary_ 가 기본 이름으로 지정됩니다.

    </td>
  </tr>

  <tr>
    <td>
      <code>routeConfig</code>
    </td>
    <td>

    <!--
    The route configuration used for the route that contains the origin path.
    -->
    현재 사용된 라우팅 규칙의 설정을 표현합니다. 이 객체에는 URL 주소에 대한 정보도 포함됩니다.

    </td>
  </tr>

    <tr>
    <td>
      <code>parent</code>
    </td>
    <td>

    <!--
    The route's parent `ActivatedRoute` when this route is a [child route](#child-routing-component).
    -->
    현재 라우팅된 것이 [자식 라우팅 규칙](#child-routing-component)이라면, 이 라우팅 규칙의 부모 `ActivatedRoute`를 표현합니다.

    </td>
  </tr>

  <tr>
    <td>
      <code>firstChild</code>
    </td>
    <td>

    <!--
    Contains the first `ActivatedRoute` in the list of this route's child routes.
    -->
    현재 라우팅 규칙의 자식 라우팅 규칙 중 첫 번째 `ActivatedRoute`를 표현합니다.

    </td>
  </tr>

  <tr>
    <td>
      <code>children</code>
    </td>
    <td>

    <!--
    Contains all the [child routes](#child-routing-component) activated under the current route.
    -->
    현재 활성화된 라우팅 규칙에 있는 모든 [자식 라우팅 규칙](#child-routing-component)을 표현합니다.

    </td>
  </tr>
</table>

<div class="alert is-helpful">

<!--
Two older properties are still available. They are less capable than their replacements, discouraged, and may be deprecated in a future Angular version.
-->
예전에 사용하던 두 가지 프로퍼티도 아직 사용할 수 있습니다. 다음 프로퍼티들은 좀 더 많은 기능을 갖도록 변경되었으며, 이후 Angular 버전에서는 사라질 수도 있습니다.

<!--
**`params`**&mdash;An `Observable` that contains the required and [optional parameters](#optional-route-parameters) specific to the route. Use `paramMap` instead.
-->
**`params`**&mdash;라우팅 규칙에 [라우팅 변수](#optional-route-parameters)가 있는 경우에 이 라우팅 변수의 값을 `Observable`로 표현합니다. 이 프로퍼티는 `paramMap`으로 대체되었습니다.

<!--
**`queryParams`**&mdash;An `Observable` that contains the [query parameters](#query-parameters) available to all routes.
Use `queryParamMap` instead.
-->
**`queryParams`**&mdash;모든 라우팅 규칙에 있는 [쿼리 변수](#query-parameters)를 `Observable`로 표현합니다. 이 프로퍼티는 `queryParamMap`으로 대체되었습니다.

</div>

<!--
### Router events
-->
### 라우터 이벤트

<!--
During each navigation, the `Router` emits navigation events through the `Router.events` property. These events range from when the navigation starts and ends to many points in between. The full list of navigation events is displayed in the table below.
-->
`Router`는 네비게이션이 동작할 때마다 `Router.events` 프로퍼티를 통해 네비게이션 이벤트를 보냅니다. 이 이벤트는 네비게이션이 시작할 때부터 끝날때까지 각 단계를 표현합니다.

<table>
  <tr>
    <th>
      <!--
      Router Event
      -->
      라우터 이벤트
    </th>

    <th>
      <!--
      Description
      -->
      설명
    </th>
  </tr>

  <tr>
    <td>
      <code>NavigationStart</code>
    </td>
    <td>

      <!--
      An [event](api/router/NavigationStart) triggered when navigation starts.
      -->
      네비게이션 동작을 시작할 때 발생하는 [이벤트](api/router/NavigationStart)입니다.

    </td>
  </tr>

  <tr>
    <td>
      <code>RouteConfigLoadStart</code>
    </td>
    <td>

      <!--
      An [event](api/router/RouteConfigLoadStart) triggered before the `Router`
      [lazy loads](#asynchronous-routing) a route configuration.
      -->
      라우터가 라우팅 규칙을 [지연 로딩](#asynchronous-routing)하기 전에 발생하는 [이벤트](api/router/RouteConfigLoadStart)입니다.

    </td>
  </tr>

  <tr>
    <td>
      <code>RouteConfigLoadEnd</code>
    </td>
    <td>

      <!--
      An [event](api/router/RouteConfigLoadEnd) triggered after a route has been lazy loaded.
      -->
      지연 로딩되는 라우팅 규칙이 모두 로딩된 후에 발생하는 [이벤트](api/router/RouteConfigLoadEnd)입니다.

    </td>
  </tr>

  <tr>
    <td>
      <code>RoutesRecognized</code>
    </td>
    <td>

      <!--
      An [event](api/router/RoutesRecognized) triggered when the Router parses the URL and the routes are recognized.
      -->
      라우터가 URL을 파싱하고 해당하는 라우팅 규칙을 찾았을 때 발생하는 [이벤트](api/router/RoutesRecognized)입니다.

    </td>
  </tr>

  <tr>
    <td>
      <code>GuardsCheckStart</code>
    </td>
    <td>

      <!--
      An [event](api/router/GuardsCheckStart) triggered when the Router begins the Guards phase of routing.
      -->
      라우터 가드가 실행되기 전에 발생하는 [이벤트](api/router/GuardsCheckStart)입니다.

    </td>
  </tr>

  <tr>
    <td>
      <code>ChildActivationStart</code>
    </td>
    <td>

      <!--
      An [event](api/router/ChildActivationStart) triggered when the Router begins activating a route's children.
      -->
      라우터가 자식 라우팅 규칙을 활성화하기 전에 발생하는 [이벤트](api/router/ChildActivationStart)입니다.

    </td>
  </tr>

  <tr>
    <td>
      <code>ActivationStart</code>
    </td>
    <td>

      <!--
      An [event](api/router/ActivationStart) triggered when the Router begins activating a route.
      -->
      라우터가 라우팅 규칙을 활성화하기 전에 발생하는 [이벤트](api/router/ActivationStart)입니다.

    </td>
  </tr>

  <tr>
    <td>
      <code>GuardsCheckEnd</code>
    </td>
    <td>

      <!--
      An [event](api/router/GuardsCheckEnd) triggered when the Router finishes the Guards phase of routing successfully.
      -->
      라우터 가드가 실행되고 라우팅이 실제로 동작하려고 할 때 발생하는 [이벤트](api/router/GuardsCheckEnd) 입니다.

    </td>
  </tr>

  <tr>
    <td>
      <code>ResolveStart</code>
    </td>
    <td>

      <!--
      An [event](api/router/ResolveStart) triggered when the Router begins the Resolve phase of routing.
      -->
      라우터가 라우팅 규칙을 분석하기 시작할 때 발생하는 [이벤트](api/router/ResolveStart)입니다.

    </td>
  </tr>

  <tr>
    <td>
      <code>ResolveEnd</code>
    </td>
    <td>

      <!--
      An [event](api/router/ResolveEnd) triggered when the Router finishes the Resolve phase of routing successfuly.
      -->
      라우터가 라우팅 규칙을 분석하고 난 후에 발생하는 [이벤트](api/router/ResolveEnd)입니다.

    </td>
  </tr>

  <tr>
    <td>
      <code>ChildActivationEnd</code>
    </td>
    <td>

      <!--
      An [event](api/router/ChildActivationEnd) triggered when the Router finishes activating a route's children.
      -->
      라우터가 자식 라우팅 규칙을 활성화 한 후에 발생하는 [이벤트](api/router/ChildActivationEnd)입니다.

    </td>
  </tr>

  <tr>
    <td>
      <code>ActivationEnd</code>
    </td>
    <td>

      <!--
      An [event](api/router/ActivationStart) triggered when the Router finishes activating a route.
      -->
      라우터가 라우팅 규칙을 활성화한 후에 발생하는 [이벤트](api/router/ActivationStart)입니다.

    </td>
  </tr>

  <tr>
    <td>
      <code>NavigationEnd</code>
    </td>
    <td>

      <!--
      An [event](api/router/NavigationEnd) triggered when navigation ends successfully.
      -->
      네비게이션 동작이 성공적으로 끝났을 때 발생하는 [이벤트](api/router/NavigationEnd)입니다.

    </td>
  </tr>

  <tr>
    <td>
      <code>NavigationCancel</code>
    </td>
    <td>

      <!--
      An [event](api/router/NavigationCancel) triggered when navigation is canceled.
      This is due to a [Route Guard](#guards) returning false during navigation.
      -->
      네비게이션 동작이 중간에 취소되었을 때 발생하는 [이벤트](api/router/NavigationCancel)입니다.
      이 이벤트는 [라우터 가드](#guards)가 `false` 값을 반환하는 경우에 발생합니다.

    </td>
  </tr>

  <tr>
    <td>
      <code>NavigationError</code>
    </td>
    <td>

      <!--
      An [event](api/router/NavigationError) triggered when navigation fails due to an unexpected error.
      -->
      네비게이션 동작 중에 에러가 발생해서 네비게이션이 실패했을 때 발생하는 [이벤트](api/router/NavigationError)입니다.

    </td>
  </tr>

  <tr>
    <td>
      <code>Scroll</code>
    </td>
    <td>

      <!--
      An [event](api/router/Scroll) that represents a scrolling event.
      -->
      스크롤 이벤트가 발생했을 때 발생하는 [이벤트](api/router/Scroll)입니다.

    </td>
  </tr>
</table>

<!--
These events are logged to the console when the `enableTracing` option is enabled also. For an example of filtering router navigation events, visit the [router section](guide/observables-in-angular#router) of the [Observables in Angular](guide/observables-in-angular) guide.
-->
라우팅 규칙을 설정할 때 `enableTracing` 옵션을 활성화하면 이 이벤트들이 발생하는 것을 콘솔로 확인할 수 있습니다. 원하는 네비게이션 이벤트만 확인하려면 [Angular에서 옵저버블 활용하기](guide/observables-in-angular) 문서의 [Router](guide/observables-in-angular#router) 섹션을 참고하세요.

{@a basics-summary}

<!--
### Summary
-->
### 용어 정리

<!--
The application has a configured router.
The shell component has a `RouterOutlet` where it can display views produced by the router.
It has `RouterLink`s that users can click to navigate via the router.
-->
애플리케이션에서 라우터를 활용할 때 뷰를 표시하는 영역은 `RouterOutlet`으로 지정할 수 있습니다.
그리고 사용자가 링크를 클릭했을 때 네비게이션을 시작하려면 `RouterLink`를 사용하면 됩니다.

<!--
Here are the key `Router` terms and their meanings:
-->
`Router`에서 사용하는 용어와 의미는 다음과 같이 정리할 수 있습니다:

<table>

  <tr>

    <th>
      <!--
      Router Part
      -->
      용어
    </th>

    <th>
      <!-
      Meaning
      -->
      의미
    </th>

  </tr>

  <tr>

    <td>
      <code>Router</code>
    </td>

    <td>
      <!--
      Displays the application component for the active URL.
      Manages navigation from one component to the next.
      -->
      주소에 해당하는 애플리케이션 컴포넌트를 화면에 표시하는 서비스입니다.
      주소가 변경될 때마다 표시하는 컴포넌트도 변경합니다.

    </td>

  </tr>

  <tr>

    <td>
      <code>RouterModule</code>
    </td>

    <td>
      <!--
      A separate NgModule that provides the necessary service providers
      and directives for navigating through application views.
      -->
      네비게이션 동작에 필요한 서비스 프로바이더나 디렉티브를 제공하는 NgModule입니다.
    </td>

  </tr>

  <tr>

    <td>
      전체 라우팅 규칙 (<code>Routes</code>)
    </td>

    <td>
      <!--
      Defines an array of Routes, each mapping a URL path to a component.
      -->
      URL과 컴포넌트가 매칭되는 라우팅 규칙을 정의하는 배열입니다.
    </td>

  </tr>

  <tr>

    <td>
      라우팅 규칙 (<code>Route</code>)
    </td>

    <td>
      <!--
      Defines how the router should navigate to a component based on a URL pattern.
      Most routes consist of a path and a component type.
      -->
      라우터가 네비게이션하면서 표시할 컴포넌트를 매칭하는 URL 패턴을 지정합니다.
      라우팅 규칙은 URL 주소와 컴포넌트 타입으로 구성됩니다.

    </td>

  </tr>

  <tr>

    <td>
      <code>RouterOutlet</code>
    </td>

    <td>
      <!--
      The directive (<code>&lt;router-outlet></code>) that marks where the router displays a view.
      -->
      라우터가 표시하는 뷰 영역의 위치를 지정하는 디렉티브입니다. <code>&lt;router-outlet></code>과 같이 사용합니다.
    </td>

  </tr>

  <tr>

    <td>
      <code>RouterLink</code>
    </td>

    <td>
      <!--
      The directive for binding a clickable HTML element to
      a route. Clicking an element with a <code>routerLink</code> directive
      that is bound to a <i>string</i> or a <i>link parameters array</i> triggers a navigation.
      -->
      클릭에 반응하는 HTML 엘리먼트를 라우터와 연결하는 디렉티브입니다. <code>routerLink</code>가 사용된 엘리먼트를 클릭하면, 이 디렉티브에 바인딩된 <i>문자열</i>이나 <i>링크 변수 배열</i>을 사용해서 네비게이션을 시작합니다.
    </td>

  </tr>

  <tr>

    <td>
      <code>RouterLinkActive</code>
    </td>

    <td>
      <!--
      The directive for adding/removing classes from an HTML element when an associated
      <code>routerLink</code> contained on or inside the element becomes active/inactive.
      -->
      <code>routerLink</code>가 지정된 HTML 엘리먼트에 활성/비활성 클래스를 지정할 때 사용하는 디렉티브입니다. 이 디렉티브를 활용하면 스타일 지정을 좀 더 편하게 할 수 있습니다.
    </td>

  </tr>

  <tr>

    <td>
      <code>ActivatedRoute</code>
    </td>

    <td>
      <!--
      A service that is provided to each route component that contains route specific
      information such as route parameters, static data, resolve data, global query params, and the global fragment.
      -->
      현재 라우팅 서비스에 사용된 변수, 정적 데이터, 전역 쿼리 변수, URL 등 라우터와 관련된 정보를 제공하는 서비스입니다
    </td>

  </tr>

  <tr>

    <td>
      <code>RouterState</code>
    </td>

    <td>
      <!--
      The current state of the router including a tree of the currently activated
      routes together with convenience methods for traversing the route tree.
      -->
      현재 활성화된 라우터를 포함해서 상위 라우팅 트리에 대한 정보를 제공합니다.
    </td>

  </tr>

  <tr>

    <td>
      <!--
      <b><i>Link parameters array</i></b>
      -->
      <b><i>링크 변수 배열 (Link parameters array)</i></b>
    </td>

    <td>
      <!--
      An array that the router interprets as a routing instruction.
      You can bind that array to a <code>RouterLink</code> or pass the array as an argument to
      the <code>Router.navigate</code> method.
      -->
      라우팅 동작에 사용할 때 라우터가 처리하는 배열입니다.
      이 배열은 <code>RouterLink</code>에 바인딩하거나, <code>Router.navigate</code> 메소드의 인자로 전달하는 방식으로 사용할 수 있습니다.
    </td>

  </tr>

  <tr>

    <td>
      <!--
      <b><i>Routing component</i></b>
      -->
      <b><i>라우팅 컴포넌트</i></b>
    </td>

    <td>
      <!--
      An Angular component with a <code>RouterOutlet</code> that displays views based on router navigations.
      -->
      라우터 네비게이션 동작에 의해 <code>RouterOutlet</code>에 표시되는 Angular 컴포넌트를 의미합니다.
    </td>

  </tr>

</table>




{@a sample-app-intro}

<!--
## The sample application
-->
## 예제 애플리케이션

<!--
This guide describes development of a multi-page routed sample application.
Along the way, it highlights design decisions and describes key features of the router such as:
-->
이 문서에서는 라우터로 페이지를 전환하는 애플리케이션을 예제로 만들어 봅니다.
이 애플리케이션을 만드는 동안 다음과 같은 내용에 대해 알아볼 것입니다:

<!--
* Organizing the application features into modules.
* Navigating to a component (*Heroes* link to "Heroes List").
* Including a route parameter (passing the Hero `id` while routing to the "Hero Detail").
* Child routes (the *Crisis Center* has its own routes).
* The `CanActivate` guard (checking route access).
* The `CanActivateChild` guard (checking child route access).
* The `CanDeactivate` guard (ask permission to discard unsaved changes).
* The `Resolve` guard (pre-fetching route data).
* Lazy loading feature modules.
* The `CanLoad` guard (check before loading feature module assets).
-->
* 애플리케이션을 모듈 단위로 구성하는 방법
* 네비게이션하면서 컴포넌트를 화면에 표시하는 방법
* 라우팅 변수 사용하기 ("히어로 상세정보" 페이지로 이동할 때 히어로의 `id`를 라우터로 전달해 봅니다.)
* 자식 라우팅 규칙
* `CanActivate` 가드 (라우팅을 허용할지 판단합니다.)
* `CanActivateChild` 가드 (자식 라우팅을 허용할지 판단합니다.)
* `CanDeactivate` 가드 (저장되지 않은 변경사항을 폐기할지 사용자에게 물어봅니다.)
* `Resolve` 가드 (라우팅 데이터를 미리 받아옵니다.)
* 기능모듈 지연로딩하기
* `CanLoad` 가드 (기능모듈을 로드할지 확인합니다.)

<!--
The guide proceeds as a sequence of milestones as if you were building the app step-by-step.
But, it is not a tutorial and it glosses over details of Angular application construction
that are more thoroughly covered elsewhere in the documentation.
-->
이 문서는 실제 애플리케이션을 구현하는 것처럼 한 단계씩 순서대로 진행합니다.
하지만 이 문서에 해당하는 내용 외에도 애플리케이션의 기본 구조 등 다른 문서에서 언급하는 Angular의 기능들도 함께 살펴봅니다.

<!--
The full source for the final version of the app can be seen and downloaded from the <live-example></live-example>.
-->
이 문서에서 다루는 예제 코드의 최종 버전은 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

<!--
### The sample application in action
-->
### 개요

<!--
Imagine an application that helps the _Hero Employment Agency_ run its business.
Heroes need work and the agency finds crises for them to solve.
-->
_히어로 관리 회사_ 에서 업무용으로 사용하는 애플리케이션을 만든다고 합시다.
히어로는 일자리가 필요하기 때문에 회사에서는 히어로가 해결해야 할 위기를 찾아야 합니다.

<!--
The application has three main feature areas:

1. A *Crisis Center* for maintaining the list of crises for assignment to heroes.
1. A *Heroes* area for maintaining the list of heroes employed by the agency.
1. An *Admin* area to manage the list of crises and heroes.
-->
그래서 이 애플리케이션은 3가지 기능을 중심으로 개발합니다:
1. 히어로에게 할당하는 위기를 관리하는 *위기대응센터* 기능
1. 회사가 고용하는 히어로를 관리하는 *히어로 관리* 기능
1. 히어로와 위기를 관리하는 *관리자* 기능

<!--
Try it by clicking on this <live-example title="Hero Employment Agency Live Example">live example link</live-example>.
-->
<live-example title="Hero Employment Agency Live Example">예제 애플리케이션</live-example>을 클릭해서 동작을 확인해 보세요.

<!--
Once the app warms up, you'll see a row of navigation buttons
and the *Heroes* view with its list of heroes.
-->
애플리케이션을 실행하고 나면 내비게이션에 사용되는 버튼들과 히어로의 목록을 화면에서 확인할 수 있습니다.

<figure>
  <img src='generated/images/guide/router/hero-list.png' alt="Hero List">
</figure>


<!--
Select one hero and the app takes you to a hero editing screen.
-->
이 중에 히어로를 한 명 선택하면 히어로의 정보를 수정할 수 있는 화면으로 이동합니다.

<figure>
  <img src='generated/images/guide/router/hero-detail.png' alt="Crisis Center Detail">
</figure>


<!--
Alter the name.
Click the "Back" button and the app returns to the heroes list which displays the changed hero name.
Notice that the name change took effect immediately.
-->
히어로의 이름을 변경해 봅시다.
그리고 "Back" 버튼을 누르면 히어로의 이름이 수정된 채로 화면에 표시됩니다.
이 때 히어로의 이름은 "Back" 버튼을 눌렀을 때 수정된 값이 반영된 것입니다.

<!--
Had you clicked the browser's back button instead of the "Back" button,
the app would have returned you to the heroes list as well.
Angular app navigation updates the browser history as normal web navigation does.
-->
"Back" 버튼 대신 브라우저의 "뒤로 가기" 버튼을 클릭해도 히어로의 목록은 동일하게 처리됩니다.
일반적인 페이지 이동과 마찬가지로, Angular 애플리케이션의 네비게이션도 브라우저 히스토리를 활용합니다.

<!--
Now click the *Crisis Center* link for a list of ongoing crises.
-->
그리고 *위기대응센터* 링크를 클릭하면 위기 목록이 화면에 표시됩니다.

<figure>
  <img src='generated/images/guide/router/crisis-center-list.png' alt="Crisis Center List">
</figure>


<!--
Select a crisis and the application takes you to a crisis editing screen.
The _Crisis Detail_ appears in a child component on the same page, beneath the list.
-->
이 화면에서 위기 목록 중 하나를 선택하면 위기 정보를 수정할 수 있는 화면으로 이동합니다.
이 때 _위기 상세정보_ 화면은 같은 페이지에 자식 컴포넌트로 표시됩니다.

<!--
Alter the name of a crisis.
Notice that the corresponding name in the crisis list does _not_ change.
-->
위기의 이름을 수정해 봅시다.
이 때 목록에 표시된 위기의 이름은 바로 변경되지 _않습니다._

<figure>
  <img src='generated/images/guide/router/crisis-center-detail.png' alt="Crisis Center Detail">
</figure>


<!--
Unlike *Hero Detail*, which updates as you type,
*Crisis Detail* changes are temporary until you either save or discard them by pressing the "Save" or "Cancel" buttons.
Both buttons navigate back to the *Crisis Center* and its list of crises.
-->
*히어로 상세정보* 화면에서는 사용자가 입력한 내용이 바로 반영되지만, *위기 상세정보* 화면에서는 "Save" 버튼을 눌러서 저장하거나 "Cancel" 버튼을 눌러서 수정사항을 반영하지 않는 방식으로 동작합니다.
두 버튼은 모두 *위기대응센터* 화면으로 이동합니다.

<!--
***Do not click either button yet***.
Click the browser back button or the "Heroes" link instead.
-->
***하지만 이 버튼은 아직 클릭하지 마세요***.
지금은 브라우저의 뒤로가기 버튼이나 "Heroes" 링크를 클릭해 봅시다.

<!--
Up pops a dialog box.
-->
그러면 다음과 같은 대화상자가 표시됩니다.

<figure>
  <img src='generated/images/guide/router/confirm-dialog.png' alt="Confirm Dialog">
</figure>

<!--
You can say "OK" and lose your changes or click "Cancel" and continue editing.
-->
이 화면에서 "OK" 버튼을 누르면 변경한 내용을 반영하지 않고, "Cancel" 버튼을 누르면 편집을 계속할 수 있습니다.

<!--
Behind this behavior is the router's `CanDeactivate` guard.
The guard gives you a chance to clean-up or ask the user's permission before navigating away from the current view.
-->
이 동작은 라우터의 `CanDeactivate` 가드를 사용해서 구현한 것입니다. 이 가드는 현재 화면을 벗어나는 네비게이션이 시작될 때 사용자에게 정말 라우팅을 수행할 것인지 한 번 더 물어보는 용도로 사용할 수 있습니다.

<!--
The `Admin` and `Login` buttons illustrate other router capabilities to be covered later in the guide.
This short introduction will do for now.
-->
`Admin` 버튼과 `Login` 버튼은 이후에 설명할 내용이 적용되는 버튼입니다.
애플리케이션 소개를 간단하게 하기 위해 이 부분은 지금 설명하지 않겠습니다.

<!--
Proceed to the first application milestone.
-->
이제 애플리케이션 개발을 시작해 봅시다.

{@a getting-started}

<!--
## Milestone 1: Getting started
-->
## 1단계 : 시작하기

<!--
Begin with a simple version of the app that navigates between two empty views.
-->
처음에는 간단하게 두 화면을 전환하는 네비게이션을 구현해 봅시다.


<figure>
  <img src='generated/images/guide/router/router-1-anim.gif' alt="App in action">
</figure>

{@a import}

<!--
Generate a sample application to follow the walkthrough.
-->
다음 명령을 실행해서 새로운 애플리케이션을 생성합니다.

<code-example language="none" class="code-shell">
  ng new angular-router-sample
</code-example>

<!--
### Define Routes
-->
### 라우팅 규칙 정의하기

<!--
A router must be configured with a list of route definitions.
-->
라우터를 사용하려면 라우팅 규칙을 먼저 정의해야 합니다.

<!--
Each definition translates to a [Route](api/router/Route) object which has two things: a
`path`, the URL path segment for this route; and a
`component`, the component associated with this route.
-->
라우팅 규칙에는 URL 경로를 지정하는 `path`와 이 경로에 매칭될 컴포넌트를 지정하는 `component` 프로퍼티가 지정되며, 각 라우팅 규칙은 [Route](api/router/Route) 객체로 변환됩니다.

<!--
The router draws upon its registry of definitions when the browser URL changes
or when application code tells the router to navigate along a route path.
-->
이 라우팅 규칙은 라우터 안에 등록된 이후에 브라우저 URL이 변경되거나 애플리케이션 코드가 네비게이션을 시작할 때 사용됩니다.

<!--
In simpler terms, you might say this of the first route:
-->
라우팅 규칙의 역할을 간단하게 설명하면 다음과 같습니다.

<!--
* When the browser's location URL changes to match the path segment `/crisis-center`, then
the router activates an instance of the `CrisisListComponent` and displays its view.
-->
* 브라우저 URL이 `/crisis-center`로 변경되면 라우터가 `CrisisListComponent` 인스턴스를 활성화하고 화면에 표시합니다.

<!--
* When the application requests navigation to the path `/crisis-center`, the router
activates an instance of `CrisisListComponent`, displays its view, and updates the
browser's address location and history with the URL for that path.
-->
* 애플리케이션에서 `/crisis-center`로 네비게이션하는 코드가 실행되면 라우터가 `CrisisListComponent` 인스턴스를 활성화하고 화면에 표시하며, 브라우저의 주소 표시줄을 새로운 주소로 변경하고, 히스토리 방문 기록에도 추가합니다.

<!--
The first configuration defines an array of two routes with simple paths leading to the
`CrisisListComponent` and `HeroListComponent`. Generate the `CrisisList` and `HeroList` components.
-->
이렇게 설정하려면 어떤 주소에 `CrisisListComponent`나 `HeroListComponent`를 연결하는 라우팅 규칙을 정의해야 합니다. 먼저 `CrisisList` 컴포넌트와 `HeroList` 컴포넌트를 생성합니다.

<code-example language="none" class="code-shell">
  ng generate component crisis-list
</code-example>

<code-example language="none" class="code-shell">
  ng generate component hero-list
</code-example>

<!--
Replace the contents of each component with the sample HTML below.
-->
그리고 각 컴포넌트 템플릿의 내용을 다음과 같이 수정합니다.

<code-tabs>

  <code-pane header="src/app/crisis-list/crisis-list.component.html" path="router/src/app/crisis-list/crisis-list.component.1.html">

  </code-pane>

  <code-pane header="src/app/hero-list/hero-list.component.html" path="router/src/app/hero-list/hero-list.component.1.html" region="template">

  </code-pane>

</code-tabs>

<!--
### Register Router and Routes
-->
### 라우터와 라우팅 규칙 등록하기

<!--
In order to use the Router, you must first register the `RouterModule` from the `@angular/router` package. Define an array of routes, `appRoutes`, and pass them to the `RouterModule.forRoot()` method. It returns a module, containing the configured `Router` service provider, plus other providers that the routing library requires. Once the application is bootstrapped, the `Router` performs the initial navigation based on the current browser URL.
-->
라우터를 사용하려면 먼저 `@angular/router` 패키지에 있는 `RouterModule`을 등록해야 합니다. `RouterModule.forRoot()` 메소드에 라우팅 규칙을 정의한 배열을 전달하면 이 라우팅 규칙이 적용된 `Router` 서비스 프로바이더와 라우팅에 필요한 프로바이더가 모두 포함된 모듈이 반환됩니다. 그리고 애플리케이션이 부트스트랩되고 나면 `Router`가 현재 브라우저 URL에 해당하는 주소로 초기 네비게이션을 실행합니다.

<div class="alert is-important">

  <!--
  **Note:** The `RouterModule.forRoot` method is a pattern used to register application-wide providers. Read more about application-wide providers in the [Singleton services](guide/singleton-services#forRoot-router) guide.
  -->
  **참고:** `RouterModule.forRoot()` 메소드는 애플리케이션 전역에 사용하는 프로바이더를 등록하는 함수입니다. 애플리케이션 전역 프로바이더에 대해서 더 알아보려면 [싱글턴 서비스](guide/singleton-services#forRoot-router) 문서를 참고하세요.

</div>

<!--
<code-example path="router/src/app/app.module.1.ts" linenums="false" header="src/app/app.module.ts (first-config)" region="first-config">
-->
<code-example path="router/src/app/app.module.1.ts" linenums="false" header="src/app/app.module.ts (첫번째 설정)" region="first-config">

</code-example>

<div class="alert is-helpful">

<!--
Adding the configured `RouterModule` to the `AppModule` is sufficient for simple route configurations. As the application grows, you'll want to [refactor the routing configuration](#refactor-the-routing-configuration-into-a-routing-module) into a separate file and create a **[Routing Module](#routing-module)**, a special type of `Service Module` dedicated to the purpose of routing in feature modules.
-->
이렇게 설정된 `RouterModule`을 `AppModule`에 로드하면 간단한 네비게이션 설정은 끝납니다. 애플리케이션이 점점 복잡해질수록 라우팅 규칙이 많아지기 때문에 이 규칙들은 **[라우팅 모듈 (Routing module)](#routing-module)**로 [리팩토링](#라우터-설정을-라우팅-모듈-로-옮기기)해야 할 수도 있습니다. 라우팅 모듈은 기능 모듈에서 라우팅을 담당하는 코드를 따로 모아 만든 서비스 모듈을 의미합니다.

</div>

<!--
Registering the `RouterModule.forRoot()` in the `AppModule` imports makes the `Router` service available everywhere in the application.
-->
`Appmodule`에 `RouterModule.forRoot()`를 등록하면 애플리케이션 전역에서 `Router` 서비스를 사용할 수 있습니다.

{@a shell}

<!--
### Add the Router Outlet
-->
### 라우팅 영역 추가하기

<!--
The root `AppComponent` is the application shell. It has a title, a navigation bar with two links, and a router outlet where the router swaps components on and off the page. Here's what you get:
-->
애플리케이션 가장 밖에 있는 껍데기는 `AppComponent` 입니다. 이 컴포넌트에는 애플리케이션 이름과 네비게이션 바, 라우팅 영역이 존재하며, 브라우저 주소가 변경되면서 표시되는 컴포넌트는 이 라우팅 영역에 표시됩니다. 다음 그림에서 빨간 사각형으로 표시된 영역이 라우팅 영역입니다:

<figure>
  <img src='generated/images/guide/router/shell-and-outlet.png' alt="Shell">
</figure>

<!--
The router outlet serves as a placeholder when the routed components will be rendered below it.
-->
라우팅 영역은 라우팅 대상이 되는 컴포넌트가 표시될 위치를 지정하는 용도로 사용합니다. 라우팅 대상 컴포넌트는 라우팅 영역 바로 아래 추가됩니다.

{@a shell-template}

<!--
The corresponding component template looks like this:
-->
지금까지 설명한 대로 템플릿을 구성하면 다음과 같이 구현할 수 있습니다:

<code-example path="router/src/app/app.component.1.html" linenums="false" header="src/app/app.component.html">

</code-example>

{@a wildcard}

<!--
### Define a Wildcard route
-->
### 와일드카드 라우팅 규칙

<!--
You've created two routes in the app so far, one to `/crisis-center` and the other to `/heroes`. Any other URL causes the router to throw an error and crash the app.
-->
지금까지 작성한 앱에는 라우팅 규칙이 두 개 정의되어 있습니다. 하나는 `/crisis-center`에 해당하는 라우팅 규칙이며, 다른 하나는 `/heroes`에 해당하는 라우팅 규칙입니다.
하지만 이렇게 정의하면 매칭되지 않은 URL로 접속했을 때 라우터에서 에러가 발생하고 앱이 중단됩니다.

<!--
Add a **wildcard** route to intercept invalid URLs and handle them gracefully.
A _wildcard_ route has a path consisting of two asterisks. It matches _every_ URL.
The router will select _this_ route if it can't match a route earlier in the configuration.
A wildcard route can navigate to a custom "404 Not Found" component or [redirect](#redirect) to an existing route.
-->
이 에러를 방지하기 위해 잘못된 URL을 매칭하는 **와일드카드** 라우팅 규칙을 추가해 봅시다.
_와일드카드_ 라우팅 규칙은 아스테리스크 2개(`**`)를 주소로 지정하는데, 이 규칙은 _모든_ URL과 매칭됩니다.
그래서 라우터가 이 라우팅 규칙을 만나기 전까지 URL에 매칭되는 라우팅 규칙을 찾지 못하면 _이_ 라우팅 규칙을 매칭시킵니다.
와일드카드 라우팅 규칙은 "404 Not Found" 컴포넌트를 표시하거나 다른 페이지로 [리다이렉트](#redirect)하는 로직을 구현할 때 사용합니다.

<div class="alert is-helpful">

<!--
The router selects the route with a [_first match wins_](#example-config) strategy.
Wildcard routes are the least specific routes in the route configuration.
Be sure it is the _last_ route in the configuration.
-->
라우터는 앱에 등록된 라우팅 규칙 중 [첫 번째 매칭되는](#example-config) 라우팅 규칙을 처리합니다.
와일드카드 라우팅 규칙은 모든 URL고가 매칭되기 때문에 반드시 _마지막_ 라우팅 규칙으로 등록되어야 합니다.

</div>

<!--
To test this feature, add a button with a `RouterLink` to the `HeroListComponent` template and set the link to `"/sidekicks"`.
-->
동작을 테스트하기 위해 `HeroListComponent` 템플릿에 `RouterLink`를 사용하는 버튼을 하나 추가하고, 이 버튼의 링크를 `"/sidekicks"`로 지정합니다.

<!--
<code-example path="router/src/app/hero-list/hero-list.component.1.html" linenums="false" header="src/app/hero-list/hero-list.component.html (excerpt)">
-->
<code-example path="router/src/app/hero-list/hero-list.component.1.html" linenums="false" header="src/app/hero-list/hero-list.component.html (일부)">

</code-example>

<!--
The application will fail if the user clicks that button because you haven't defined a `"/sidekicks"` route yet.
-->
애플리케이션을 실행하고 이 버튼을 클릭하면, 아직 `"/sidekicks"`에 대한 라우팅 규칙이 정의되어 있지 않기 때문에 애플리케이션이 에러로 종료됩니다.

<!--
Instead of adding the `"/sidekicks"` route, define a `wildcard` route instead and have it navigate to a simple `PageNotFoundComponent`.
-->
그러면 `"/sidekicks"` 라우팅 규칙을 추가하는 대신 와일드카드 라우팅 규칙을 추가하고, 이 라우팅 규칙을 `PageNotFoundComponent`와 연결합시다.

<code-example path="router/src/app/app.module.1.ts" linenums="false" header="src/app/app.module.ts (wildcard)" region="wildcard">

</code-example>

<!--
Create the `PageNotFoundComponent` to display when users visit invalid URLs.
-->
그리고 `PageNotFoundComponent`를 다음과 같이 정의합니다.

<code-example language="none" class="code-shell">
  ng generate component page-not-found
</code-example>

<code-example path="router/src/app/page-not-found/page-not-found.component.html" linenums="false" header="src/app/page-not-found.component.html (404 component)">

</code-example>

<!--
Now when the user visits `/sidekicks`, or any other invalid URL, the browser displays "Page not found".
The browser address bar continues to point to the invalid URL.
-->
이제 사용자가 `/sidekicks`와 같이 등록되지 않은 주소에 접근하면 "Page not found" 화면이 표시됩니다.
이 때 브라우저 주소표시줄의 URL은 변경되지 않고 그대로 표시됩니다.

{@a redirect}

<!--
### Set up redirects
-->
### 리다이렉트 설정하기

<!--
When the application launches, the initial URL in the browser bar is something like:
-->
애플리케이션이 실행되면 브라우저의 주소 표시줄은 다음과 같이 시작합니다:

<code-example>
  localhost:4200
</code-example>

<!--
That doesn't match any of the concrete configured routes which means
the router falls through to the wildcard route and displays the `PageNotFoundComponent`.
-->
하지만 이 주소는 지금까지 설정된 라우팅 규칙 중 아무 것에도 해당되지 않기 때문에 마지막 라우팅 규칙으로 넘어가며 화면에 `PageNotFoundComponent`가 표시됩니다.

<!--
The application needs a **default route** to a valid page.
The default page for this app is the list of heroes.
The app should navigate there as if the user clicked the "Heroes" link or pasted `localhost:4200/heroes` into the address bar.
-->
이 동작 대신 애플리케이션에 **기본 페이지로 가는** 라우팅 규칙을 추가하려고 합니다.
그리고 애플리케이션의 기본 페이지는 히어로의 목록을 표시하는 화면으로 하려고 합니다.
기본 라우팅 규칙은 사용자가 화면에서 "Heroes" 링크를 클릭하거나 주소표시줄에 `localhost:4200/heroes`를 입력한 것과 같은 동작을 합니다.

<!--
The preferred solution is to add a `redirect` route that translates the initial relative URL (`''`)
to the desired default path (`/heroes`). The browser address bar shows `.../heroes` as if you'd navigated there directly.
-->
가장 좋은 방법은 애플리케이션의 최상위 URL(`''`)로 접속할 때 기본 주소(`/heroes`)로 이동하도록 `redirect` 라우팅 규칙을 추가하는 것입니다. 이 라우팅 규칙을 적용하면 사용자가 직접 `.../heroes`로 이동한 것과 같은 동작을 합니다.

<!--
Add the default route somewhere _above_ the wildcard route.
It's just above the wildcard route in the following excerpt showing the complete `appRoutes` for this milestone.
-->
기본 라우팅 규칙은 와일드카드 라우팅 규칙보다 _위쪽에_ 추가해야 합니다.
그래서 아래 예제에서는 와일드카드 라우팅 규칙 바로 위에 기본 라우팅 규칙을 추가했습니다.

<code-example path="router/src/app/app-routing.module.1.ts" linenums="false" header="src/app/app-routing.module.ts (appRoutes)" region="appRoutes">
</code-example>

<!--
A redirect route requires a `pathMatch` property to tell the router how to match a URL to the path of a route.
The router throws an error if you don't.
In this app, the router should select the route to the `HeroListComponent` only when the *entire URL* matches `''`,
so set the `pathMatch` value to `'full'`.
-->
리다이렉트 라우팅 규칙을 사용하려면 브라우저의 URL이 라우팅 규칙과 매칭되는 방법을 지정하기 위해 `pathMatch` 프로퍼티를 함께 사용해야 하는데, 이 프로퍼티가 지정되지 않으면 에러가 발생합니다.
이 예제에서는 *전체 URL*이 정확하게 `''`일 때만 `HeroListComponent`로 라우팅하기 위해 `pathMatch`의 값을 `'full'`로 지정했습니다.

<div class="alert is-helpful">

<!--
Technically, `pathMatch = 'full'` results in a route hit when the *remaining*, unmatched segments of the URL match `''`.
In this example, the redirect is in a top level route so the *remaining* URL and the *entire* URL are the same thing.
-->
좀 더 자세하게 설명하면, `pathMatch = 'full'`를 지정하면 해당 라우팅 계층의 URL 세그먼트가 `''`에 해당하는 라우팅 규칙이 추가되는 것입니다.
그리고 이 예제에서 리다이렉트 라우팅 규칙이 적용된 것은 최상위 계층이기 때문에 *전체* URL과 해당 계층의 URL 세그먼트는 `''`로 같습니다.

<!--
The other possible `pathMatch` value is `'prefix'` which tells the router
to match the redirect route when the *remaining* URL ***begins*** with the redirect route's _prefix_ path.
-->
`pathMatch`에는 다른 값을 지정할 수도 있습니다. 해당 라우팅 계층에서 ***특정 문자열로 시작하는*** 주소일 때 리다이렉트하도록 `'prefix'` 옵션을 설정할 수도 있습니다.

<!--
Don't do that here.
If the `pathMatch` value were `'prefix'`, _every_ URL would match `''`.
-->
이 예제에서는 이 방법을 사용하지 않았습니다.
이 예제에서 `pathMatch`에 `'prefix'`를 사용하면 _모든_ URL이 `''`와 매칭됩니다.

<!--
Try setting it to `'prefix'` then click the `Go to sidekicks` button.
Remember that's a bad URL and you should see the "Page not found" page.
Instead, you're still on the "Heroes" page.
Enter a bad URL in the browser address bar.
You're instantly re-routed to `/heroes`.
_Every_ URL, good or bad, that falls through to _this_ route definition
will be a match.
-->
`Go to sidekicks` 버튼을 눌렀을 때 `'prefix'`를 사용하도록 수정해 보세요.
지금까지 설정한 라우팅 규칙에서 어떤 주소에 해당하는 라우팅 규칙이 없으면  "Page not found" 페이지가 표시됩니다.
하지만 `'prefix'`를 사용한 코드에서 해당 버튼을 클릭해도 여전히 "Heroes" 페이지가 표시됩니다.
그리고 브라우저 주소표시줄에 유효하지 않은 URL을 입력해보세요.
이 경우에도 `/heroes` 페이지로 이동합니다.
유효하거나 유효하지 않은 것과 관계없이 _모든_ URL은 이 라우팅 규칙에 매칭됩니다.

<!--
The default route should redirect to the `HeroListComponent` _only_ when the _entire_ url is  `''`.
Remember to restore the redirect to `pathMatch = 'full'`.

Learn more in Victor Savkin's
[post on redirects](http://vsavkin.tumblr.com/post/146722301646/angular-router-empty-paths-componentless-routes).
-->
그래서 기본 라우팅 규칙은 _반드시_ _전체_ URL이 `''`일 때만 적용되어야 합니다.
코드를 `pathMatch = 'full'`로 다시 수정하는 것을 잊지 마세요.

리다이렉트에 대한 내용은 Victor Savkin이 작성한 [블로그 글](http://vsavkin.tumblr.com/post/146722301646/angular-router-empty-paths-componentless-routes)에서 자세하게 확인할 수 있습니다.

</div>

<!--
### Basics wrap up
-->
### 기본내용 정리

<!--
You've got a very basic navigating app, one that can switch between two views
when the user clicks a link.
-->
지금까지 애플리케이션에 네비게이션을 적용하는 방법 중 기본 내용에 대해 알아봤습니다. 이제 사용자가 링크를 클릭하면 서로 다른 뷰를 전환할 수 있습니다.

<!--
You've learned how to do the following:

* Load the router library.
* Add a nav bar to the shell template with anchor tags, `routerLink`  and `routerLinkActive` directives.
* Add a `router-outlet` to the shell template where views will be displayed.
* Configure the router module with `RouterModule.forRoot()`.
* Set the router to compose HTML5 browser URLs.
* handle invalid routes with a `wildcard` route.
* navigate to the default route when the app launches with an empty path.
-->
지금까지 이런 내용에 대해 알아봤습니다:

* 라우터 라이브러리를 로드하는 방법
* 앱 컴포넌트 템플릿에 앵커 태그를 추가하고 `routerLink`와 `routerLinkActive` 디렉티브를 적용하는 방법
* 라우팅 대상 컴포넌트를 화면에 표시하기 위해 `router-outlet`을 추가하는 방법
* `RouterModule.forRoot()` 메소드로 라우팅 모듈을 등록하는 방법
* HTML5 브라우저 URL 형식으로 라우터를 정의하는 방법
* `wildcard` 라우팅 규칙으로 유효하지 않은 주소를 처리하는 방법
* 애플리케이션이 처음 실행되고 주소표시줄이 비어있을 때 기본 페이지로 이동하는 라우팅 규칙을 정의하는 방법

<!--
The starter app's structure looks like this:
-->
이 상태에서 애플리케이션 구조는 다음과 같습니다:

<div class='filetree'>

  <div class='file'>
    angular-router-sample
  </div>

  <div class='children'>

    <div class='file'>
      src
    </div>

    <div class='children'>

      <div class='file'>
        app
      </div>

      <div class='children'>

        <div class='file'>
          crisis-list
        </div>

        <div class='children'>

          <div class='file'>

            crisis-list.component.css

          </div>

          <div class='file'>

            crisis-list.component.html

          </div>

          <div class='file'>

            crisis-list.component.ts

          </div>

        </div>

        <div class='file'>
          hero-list
        </div>

        <div class='children'>

          <div class='file'>

            hero-list.component.css

          </div>

          <div class='file'>

            hero-list.component.html

          </div>

          <div class='file'>

            hero-list.component.ts

          </div>

        </div>

        <div class='file'>
          page-not-found
        </div>

        <div class='children'>

          <div class='file'>

            page-not-found.component.css

          </div>

          <div class='file'>

            page-not-found.component.html

          </div>

          <div class='file'>

            page-not-found.component.ts

          </div>

        </div>

        <div class='file'>
          app.component.css
        </div>

        <div class='file'>
          app.component.html
        </div>

        <div class='file'>
          app.component.ts
        </div>

        <div class='file'>
          app.module.ts
        </div>

      </div>

      <div class='file'>
        main.ts
      </div>

      <div class='file'>
        index.html
      </div>

      <div class='file'>
        styles.css
      </div>

      <div class='file'>
        tsconfig.json
      </div>

    </div>

    <div class='file'>
      node_modules ...
    </div>

    <div class='file'>
      package.json
    </div>

  </div>

</div>


<!--
Here are the files discussed in this milestone.
-->
그리고 이 섹션에서 다뤘던 파일들의 내용은 이렇습니다.


<code-tabs>

  <code-pane header="app.component.html" path="router/src/app/app.component.1.html">

  </code-pane>

  <code-pane header="app.module.ts" path="router/src/app/app.module.1.ts">

  </code-pane>

  <code-pane header="hero-list/hero-list.component.html" path="router/src/app/hero-list/hero-list.component.1.html">

  </code-pane>

  <code-pane header="crisis-list/crisis-list.component.html" path="router/src/app/crisis-list/crisis-list.component.1.html">

  </code-pane>

  <code-pane header="page-not-found/page-not-found.component.html" path="router/src/app/page-not-found/page-not-found.component.html">

  </code-pane>

  <code-pane header="index.html" path="router/src/index.html">

  </code-pane>

</code-tabs>


{@a routing-module}

<!--
## Milestone 2: *Routing module*
-->
## 2단계: *라우팅 모듈 (Routing module)*

<!--
In the initial route configuration, you provided a simple setup with two routes used
to configure the application for routing. This is perfectly fine for simple routing.
As the application grows and you make use of more `Router` features, such as guards,
resolvers, and child routing, you'll naturally want to refactor the routing configuration into its own file.
We recommend moving the routing information into a special-purpose module called a *Routing Module*.
-->
초기 버전의 라우터 설정에는 간단한 라우팅 규칙 2개가 정의되어 있습니다. 라우팅 규칙이 간단하다면 이런 방식으로 정의해도 아무 문제 없습니다. 하지만 애플리케이션이 점점 커지면 `Router`의 기능을 좀 더 많이 사용하게 되고, 가드나 리졸버, 자식 라우팅과 같은 기능을 도입하게 되면 라우팅 설정을 개별 파일로 리팩토링하는 것이 더 편할 수 있습니다.
Angular 코어 팀은 라우팅과 관련된 설정을 따로 모아 *라우팅 모듈* 로 정의하는 것을 권장합니다.

<!--
The **Routing Module** has several characteristics:

* Separates routing concerns from other application concerns.
* Provides a module to replace or remove when testing the application.
* Provides a well-known location for routing service providers including guards and resolvers.
* Does **not** declare components.
-->
**라우팅 모듈**은 다음과 같은 특징이 있습니다:

* 애플리케이션 로직과 라우팅 로직을 분리하기 위해 존재합니다.
* 애플리케이션을 테스트할 때 라우팅 모듈을 다른 설정으로 대체하거나 제거한 채로 실행할 수 있습니다.
* 라우터 가드나 리졸버에 대한 프로바이더를 제공합니다.
* 라우팅 모듈에는 컴포넌트를 등록하지 **않습니다**.

{@a integrate-routing}

<!--
### Integrate routing with your app
-->
### 라우팅 규칙 정리하기

<!--
The sample routing application does not include routing by default.
When you use the [Angular CLI](cli) to create a project that will use routing, set the `--routing` option for the project or app, and for each NgModule.
When you create or initialize a new project (using the CLI [`ng new`](cli/new) command) or a new app (using the [`ng generate app`](cli/generate) command), specify the `--routing` option.  This tells the CLI to include the `@angular/router` npm package and create a file named `app-routing.module.ts`.
You can then use routing in any NgModule that you add to the project or app.
-->
애플리케이션을 새로 만들면 라우팅 설정이 존재하지 않습니다.
그런데 애플리케이션을 [Angular CLI](cli)로 생성하면서 `--routing` 옵션을 사용하면 라우팅 모듈을 함께 생성할 수 있습니다.
이 옵션은 [`ng new`](cli/new) 명령으로 새로운 프로젝트를 생성하거나 [`ng generate app`](cli/generate)로 새로운 애플리케이션을 생성할 때 사용할 수 있습니다. 그러면 Angular CLI가 `@angular/router` npm 패키지를 로드하는 `app-routing.module.ts` 파일을 자동으로 생성합니다.
라우팅 모듈은 프로젝트와 애플리케이션에 존재하는 모든 NgModule에 적용할 수 있습니다.

<!--
For example, the following command generates an NgModule that can use routing.

```sh
ng generate module my-module --routing
```

This creates a separate file named `my-module-routing.module.ts` to store the NgModule's routes.
The file includes an empty `Routes` object that you can fill with routes to different components and NgModules.
-->
NgModule을 만들면서 라우팅 모듈을 함께 생성하려면 다음 명령을 실행하면 됩니다.

```sh
ng generate module my-module --routing
```

그러면 NgModule이 생성되면서 이 모듈의 라우팅 설정을 담당하는 `my-module-routing.module.ts` 파일이 생성됩니다.
이 파일에는 비어있는 `Routes` 객체가 정의되어 있기 때문에, 이 객체에 라우팅 규칙을 등록하면 됩니다.

{@a routing-refactor}

<!--
### Refactor the routing configuration into a _routing module_
-->
### 라우터 설정을 _라우팅 모듈_ 로 옮기기

<!--
Create an `AppRouting` module in the `/app` folder to contain the routing configuration.
-->
`/app` 폴더에 `AppRouting` 모듈을 생성하려면 다음 명령을 실행하면 됩니다.

<code-example language="none" class="code-shell">
  ng generate module app-routing --module app --flat
</code-example>

<!--
Import the `CrisisListComponent`, `HeroListComponent`, and `PageNotFoundComponent` symbols
just like you did in the `app.module.ts`. Then move the `Router` imports
and routing configuration, including `RouterModule.forRoot()`, into this routing module.

Re-export the Angular `RouterModule` by adding it to the module `exports` array.
By re-exporting the `RouterModule` here the components declared in `AppModule` will have access to router directives such as `RouterLink` and `RouterOutlet`.

After these steps, the file should look like this.
-->
그리고 나면 `app.module.ts` 파일에 작성했던 것처럼 `CrisisListComponent`, `HeroListComponent`, `PageNotFoundComponent` 심볼을 로드해서 라우팅 규칙을 등록하면 됩니다. `app.module.ts` 파일에 설정했던 `Router` 설정이 라우팅 모듈로 옮겨가기 때문에 `RouterModule.forRoot()` 메소드를 사용하는 부분도 라우팅 모듈로 옮기면 됩니다.

라우팅 모듈은 Angular에서 제공하는 `RouterModule`을 모듈의 `exports` 배열에 등록해서 모듈 외부로 공개해야 합니다.
그래야 `AppModule` 범위에서도 `RouterLink`나 `RouterOutlet`과 같은 라우터 관련 디렉티브를 사용할 수 있습니다.

이 과정을 마치고 나면 라우팅 모듈이 다음과 같이 구성될 것입니다.

<code-example path="router/src/app/app-routing.module.1.ts" header="src/app/app-routing.module.ts">

</code-example>

<!--
Next, update the `app.module.ts` file, removing `RouterModule.forRoot` in
the `imports` array.
-->
그 다음에는 `app.module.ts` 파일에서 이전에 `imports` 배열에 등록했던 `RouterModule.forRoot`를 제거하고 라우팅 모듈을 로드합니다.

<code-example path="router/src/app/app.module.2.ts" header="src/app/app.module.ts">

</code-example>



<div class="alert is-helpful">


<!--
Later in this guide you will create [multiple routing modules](#heroes-functionality) and discover that
you must import those routing modules [in the correct order](#routing-module-order).
-->
이 가이드 문서를 따라가다보면 [라우팅 모듈을 여러개](#heroes-functionality) 만들게 될 것입니다. 라우팅 모듈은 모두 [올바른 순서로](#routing-module-order) 로드되어야 합니다.

</div>


<!--
The application continues to work just the same, and you can use `AppRoutingModule` as
the central place to maintain future routing configuration.
-->
이렇게 수정해도 애플리케이션은 이전과 똑같이 동작하며, 이렇게 만든 `AppRoutingModule`은 애플리케이션 전체 라우팅 설정 중에서도 가장 기초적인 부분을 담당할 것입니다.


{@a why-routing-module}

<!--
### Do you need a _Routing Module_?
-->
### _라우팅 모듈_ 이 꼭 필요한가요?

<!--
The _Routing Module_ *replaces* the routing configuration in the root or feature module.
_Either_ configure routes in the Routing Module _or_ within the module itself but not in both.
-->
_라우팅 모듈_ 은 애플리케이션 최상위 모듈이나 기능 모듈에 있는 라우팅 설정을 *대체하는* 용도로 사용합니다.
사실 라우팅 규칙은 라우팅 모듈에 있거나 기능 모듈 안에 있어도 상관없으며, 양쪽 모두에 있는 경우만 피하는 것이 좋습니다.

<!--
The Routing Module is a design choice whose value is most obvious when the configuration is complex
and includes specialized guard and resolver services.
It can seem like overkill when the actual configuration is dead simple.
-->
라우팅 규칙에 가드와 리졸버와 같은 기능이 추가되면서 규칙 전체가 복잡해졌을 때 라우터 구성을 따로 분리해서 모듈을 단순하게 유지하는 것이 라우팅 모듈을 사용하는 이유입니다.
그래서 라우팅 규칙이 복잡하지 않다면 굳이 라우팅 모듈을 사용할 필요는 없습니다.

<!--
Some developers skip the Routing Module (for example, `AppRoutingModule`) when the configuration is simple and
merge the routing configuration directly into the companion module (for example, `AppModule`).

Choose one pattern or the other and follow that pattern consistently.
-->
어떤 개발자들은 라우팅 규칙이 그리 복잡하지 않을 때 라우팅 모듈(ex. `AppRoutingModule`)을 생략하고 관련 모듈(ex. `AppModule`)에 라우팅 규칙을 바로 선언하는 것을 선호하기도 합니다.

라우팅 모듈을 사용하거나 사용하지 않는 것 자체는 중요하지 않습니다. 일관된 패턴으로 코드를 작성하는 것이 중요합니다.

<!--
Most developers should always implement a Routing Module for the sake of consistency.
It keeps the code clean when configuration becomes complex.
It makes testing the feature module easier.
Its existence calls attention to the fact that a module is routed.
It is where developers expect to find and expand routing configuration.
-->
그런데 라우팅 모듈을 도입하는 방식으로 코드의 일관성을 유지하는 개발자들이 더 많은 것으로 보입니다. 그리고 라우팅 모듈을 도입했을 때 얻는 장점도 많습니다.
라우팅 모듈을 도입하면 라우팅 설정의 복잡도와 관계없이 모듈의 코드는 간결하게 유지할 수 있습니다.
기능 모듈을 테스트하기도 더 편해집니다.
모듈에서는 라우팅 된 이후의 로직만 신경쓰면 됩니다.
라우팅 규칙이 정의된 파일을 쉽게 찾을 수 있으며, 확장하기도 편합니다.

{@a heroes-feature}

<!--
## Milestone 3: Heroes feature
-->
## 3단계: 히어로 기능 모듈

<!--
You've seen how to navigate using the `RouterLink` directive.
Now you'll learn the following:

* Organize the app and routes into *feature areas* using modules.
* Navigate imperatively from one component to another.
* Pass required and optional information in route parameters.
-->
지금까지 `RouterLink` 디렉티브를 사용해서 네비게이션하는 방법에 대해 알아봤습니다.
이번에는 다음 내용에 대해 알아봅시다:

* 애플리케이션 로직과 라우팅 규칙을 *기능 단위*의 모듈로 재구축합니다.
* 화면에 표시된 컴포넌트를 전환할 수 있는 방법에 대해 알아봅니다.
* 라우팅 인자에 필수 항목과 옵션 항목을 전달하는 방법에 대해 알아봅니다.

<!--
This example recreates the heroes feature in the "Services" episode of the
[Tour of Heroes tutorial](tutorial/toh-pt4 "Tour of Heroes: Services"),
and you'll be copying much of the code
from the <live-example name="toh-pt4" title="Tour of Heroes: Services example code"></live-example>.

Here's how the user will experience this version of the app:
-->
지금부터 살펴볼 예제 프로젝트는 [히어로들의 여정](tutorial/toh-pt4 "Tour of Heroes: Services") 튜토리얼 중 "서비스" 에피소드에서 다뤘던 예제입니다.
코드를 직접 작성해보려면 <live-example name="toh-pt4" title="Tour of Heroes: Services example code"></live-example>에서 코드를 다운받으세요.

이 섹션에서 다루는 앱은 다음과 같이 동작합니다:


<figure>
  <img src='generated/images/guide/router/router-2-anim.gif' alt="App in action">
</figure>


<!--
A typical application has multiple *feature areas*,
each dedicated to a particular business purpose.

While you could continue to add files to the `src/app/` folder,
that is unrealistic and ultimately not maintainable.
Most developers prefer to put each feature area in its own folder.

You are about to break up the app into different *feature modules*, each with its own concerns.
Then you'll import into the main module and navigate among them.
-->
일반적으로 애플리케이션에는 여러 *기능 단위*가 존재하며, 각각은 용도에 맞게 사용됩니다.

그런데 단순하게 `src/app/` 폴더에 파일을 하나씩 추가하는 것은 실제 운영할 애플리케이션에 어울리지 않는 방식이고, 유지보수를 어렵게 만드는 일이기도 합니다.
그래서 대다수의 개발자들은 새로 추가되는 기능이 그 기능과 관련된 것들과 함께 있는 것을 선호합니다.

이제 이 관점에 맞게 애플리케이션을 쪼개서 여러 *기능 모듈*로 나눌 것입니다.
그리고 이 기능 모듈들을 메인 모듈에 로드하고 브라우저에서 네비게이션하는 방식으로 활용할 것입니다.

{@a heroes-functionality}

<!--
### Add heroes functionality
-->
### 히어로 모듈 추가하기

<!--
Follow these steps:
-->
다음 순서대로 진행합니다:

<!--
* Create a `HeroesModule` with routing in the heroes folder and register it with the root `AppModule`. This is where you'll be implementing the *hero management*.
-->
* `HeroesModule`을 라우팅 모듈과 함께 `heroes` 폴더에 생성하고 이 모듈을 `AppModule`에 등록합니다. *히어로 관리 기능*은 이 모듈에 구현할 것입니다.

<code-example language="none" class="code-shell">
  ng generate module heroes/heroes --module app --flat --routing
</code-example>

<!--
* Move the placeholder `hero-list` folder that's in the `app` into the `heroes` folder.
* Copy the contents of the `heroes/heroes.component.html` from
  the <live-example name="toh-pt4" title="Tour of Heroes: Services example code">"Services" tutorial</live-example> into the `hero-list.component.html` template.

  * Relabel the `<h2>` to `<h2>HEROES</h2>`.
  * Delete the `<app-hero-detail>` component at the bottom of the template.
-->
* `app` 폴더에 있는 `hero-list` 폴더를 `heroes` 폴더 안으로 옮깁니다.
* <live-example name="toh-pt4" title="Tour of Heroes: Services example code">"Services" 튜토리얼</live-example>의 `heroes/heroes.component.html` 파일에 있는 내용을 `hero-list.component.html` 템플릿 안으로 복사합니다.
  * `<h2>` 태그의 내용을 `<h2>HEROES</h2>`로 수정합니다.
  * 템플릿 아래쪽에 있는 `<app-hero-detail>` 컴포넌트를 제거합니다.

<!--
* Copy the contents of the `heroes/heroes.component.css` from the live example into the `hero-list.component.css` file.
* Copy the contents of the `heroes/heroes.component.ts` from the live example into the `hero-list.component.ts` file.

  * Change the component class name to `HeroListComponent`.
  * Change the `selector` to `app-hero-list`.
-->
* `hero-list.component.css` 파일에 있는 내용을 `heroes/heroes.component.css`로 복사합니다.
* `hero-list.component.ts` 파일에 있는 내용을 `heroes/heroes.component.ts`로 복사합니다.

  * 컴포넌트 클래스 이름을 `HeroListComponent`로 변경합니다.
  * 컴포넌트 `selector`를 `app-hero-list`로 변경합니다.
  
<div class="alert is-helpful">

   <!--
   Selectors are **not required** for _routed components_ due to the components are dynamically inserted when the page is rendered, but are useful for identifying and targeting them in your HTML element tree.
   -->
   _라우팅 대상이 될 컴포넌트_ 는 페이지에 동적으로 렌더링되기 때문에 셀렉터를 **지정하지 않아도 됩니다.** 하지만 HTML 엘리먼트 트리에서 이 컴포넌트를 쉽게 찾으려면 셀렉터를 지정하는 것이 좋습니다.

</div>

<!--
* Copy the `hero-detail` folder, the `hero.ts`, `hero.service.ts`,  and `mock-heroes.ts` files into the `heroes` subfolder.
* Copy the `message.service.ts` into the `src/app` folder.
* Update the relative path import to the `message.service` in the `hero.service.ts` file.
-->
* `hero-detail` 폴더에 있는 `hero.ts`, `hero.service.ts`, `mock-heroes.ts` 파일을 `heroes` 폴더로 옮깁니다.
* `message.service.ts` 파일을 `src/app` 폴더로 옮깁니다.
* `hero.service.ts` 파일에서 `message.service`를 로드하던 경로를 수정합니다.

<!--
Next, you'll update the `HeroesModule` metadata.

  * Import and add the `HeroDetailComponent` and `HeroListComponent` to the `declarations` array in the `HeroesModule`.
-->
그 다음에는 `HeroesModule` 메타데이터를 수정합니다.

  * `HeroesModule`의 `declarations` 배열에 `HeroDetailComponent`와 `HeroListComponent`를 추가합니다.


<code-example path="router/src/app/heroes/heroes.module.ts" header="src/app/heroes/heroes.module.ts">

</code-example>


<!--
When you're done, you'll have these *hero management* files:
-->
여기까지 하고 나면 이 모듈은 다음과 같이 구성됩니다.


<div class='filetree'>

  <div class='file'>
    src/app/heroes
  </div>

  <div class='children'>

    <div class='file'>
      hero-detail
    </div>

      <div class='children'>

        <div class='file'>
          hero-detail.component.css
        </div>

        <div class='file'>
          hero-detail.component.html
        </div>

        <div class='file'>
          hero-detail.component.ts
        </div>

      </div>

    <div class='file'>
      hero-list
    </div>

      <div class='children'>

        <div class='file'>
          hero-list.component.css
        </div>

        <div class='file'>
          hero-list.component.html
        </div>

        <div class='file'>
          hero-list.component.ts
        </div>

      </div>

    <div class='file'>
      hero.service.ts
    </div>

    <div class='file'>
      hero.ts
    </div>

    <div class='file'>
      heroes-routing.module.ts
    </div>

    <div class='file'>
      heroes.module.ts
    </div>

    <div class='file'>
      mock-heroes.ts
    </div>

    </div>




  </div>

</div>



{@a hero-routing-requirements}

<!--
#### *Hero* feature routing requirements
-->
#### *히어로* 모듈 라우팅

<!--
The heroes feature has two interacting components, the hero list and the hero detail.
The list view is self-sufficient; you navigate to it, it gets a list of heroes and displays them.

The detail view is different. It displays a particular hero. It can't know which hero to show on its own.
That information must come from outside.

When the user selects a hero from the list, the app should navigate to the detail view
and show that hero.
You tell the detail view which hero to display by including the selected hero's id in the route URL.

Import the hero components from their new locations in the `src/app/heroes/` folder, define the two hero routes.

Now that you have routes for the `Heroes` module, register them with the `Router` via the
`RouterModule` _almost_ as you did in the `AppRoutingModule`.

There is a small but critical difference.
In the `AppRoutingModule`, you used the static **`RouterModule.forRoot()`** method to register the routes and application level service providers.
In a feature module you use the static **`forChild`** method.
-->
히어로 모듈은 히어로의 목록을 표시하는 컴포넌트와 히어로의 상세 정보를 표시하는 컴포넌트로 구성됩니다.
리스트를 표시하는 컴포넌트는 별다른 것이 없습니다. 사용자가 이 컴포넌트에 해당하는 주소로 이동하면 컴포넌트가 히어로의 목록을 가져와서 화면에 표시할 것입니다.

하지만 상세정보를 표시하는 컴포넌트는 좀 다릅니다. 이 컴포넌트는 히어로 한 명의 정보를 화면에 표시하는데, 이 컴포넌트는 어떤 히어로를 표시해야 하는지 스스로 알지 못합니다.
그래서 이 정보는 외부에서 전달해야 합니다.

사용자가 히어로 목록에서 히어로를 한 명 선택하면 애플리케이션은 상세정보 화면으로 이동하면서 이 히어로의 정보를 표시해야 합니다.
이 때 히어로의 id를 라우팅 URL에 포함시키면 네비게이션할 때 이 정보를 활용할 수 있습니다.

새로 만든 `src/app/heroes/` 폴더로 옮긴 컴포넌트를 대상으로 라우팅 규칙을 정의해 봅시다.

이 단계가 `Heroes` 모듈에 라우팅 규칙을 등록하는 단계입니다. 라우팅 규칙은 `AppRoutingModule`에서 살펴봤던 것처럼 `RouterModule`을 사용해서 `Router`에 등록합니다.

그런데 이 때 꼭 짚고 넘어가야 할 다른 점이 하나 있습니다.
`AppRoutingModule`에서는 애플리케이션 계층에 필요한 라우팅 규칙과 서비스 프로바이더를 등록하기 위해 **`RouterModule.forRoot()`** 메소드를 사용했습니다.
하지만 기능 모듈에서는 **`forChild`** 메소드를 사용해야 합니다.

<<<<<<< HEAD
<div class="alert is-helpful">


<!--
Only call `RouterModule.forRoot()` in the root `AppRoutingModule`
(or the `AppModule` if that's where you register top level application routes).
In any other module, you must call the **`RouterModule.forChild`** method to register additional routes.
-->
`RouterModule.forRoot()` 메소드는 애플리케이션 최상위 라우팅 모듈인 `AppRoutingModule` (라우팅 모듈이 따로 없다면 `AppModule`)에서만 사용합니다.
다른 모듈에서는 서비스 프로바이더를 생략하고 라우팅 규칙만 등록하기 위해 **`RouterModule.forChild`** 메소드를 사용합니다.

</div>

<!--
The updated `HeroesRoutingModule` looks like this:
-->
이제 `HeroesRoutingModule`은 다음과 같이 변경되었습니다.


<code-example path="router/src/app/heroes/heroes-routing.module.1.ts" header="src/app/heroes/heroes-routing.module.ts">

</code-example>



<div class="alert is-helpful">

<!--
Consider giving each feature module its own route configuration file.
It may seem like overkill early when the feature routes are simple.
But routes have a tendency to grow more complex and consistency in patterns pays off over time.
-->
기능모듈마다 각각 라우팅 설정 파일을 두는 것을 권장합니다.
기능모듈에서 관리하는 라우팅 규칙이 복잡하지 않은 개발 초기에는 이 방식이 번거로워 보일 수도 있지만, 애플리케이션이 점점 복잡해질수록 이렇게 관리하는 방식이 더 편합니다.

</div>


{@a remove-duplicate-hero-routes}

<!--
#### Remove duplicate hero routes
-->
#### 중복된 라우팅 규칙 제거하기

<!--
The hero routes are currently defined in _two_ places: in the `HeroesRoutingModule`,
by way of the `HeroesModule`, and in the `AppRoutingModule`.

Routes provided by feature modules are combined together into their imported module's routes by the router.
This allows you to continue defining the feature module routes without modifying the main route configuration.

Remove the `HeroListComponent` import and the `/heroes` route from the `app-routing.module.ts`.

**Leave the default and the wildcard routes!**
These are concerns at the top level of the application itself.
-->
이제 히어로 모듈과 관련된 라우팅 규칙은 `HeroesModule`에서 라우팅을 담당하는 `HeroesRoutingModule`과 `AppRoutingModule` 두 군데에 존재합니다.

모듈의 라우팅 규칙은 해당 모듈이 로드하는 기능 모듈의 모든 라우팅 규칙이 조합되어 구성됩니다.
그래서 라우팅 규칙은 한 모듈에 모두 정의하는 것이 아니라 자식 모듈에 각각 구현해도 됩니다.

이제 `/heroes`와 관련된 라우팅 규칙은 `app-routing.module.ts` 파일에서 제거합니다.

**기본 라우팅 규칙과 와일드카드 라우팅 규칙은 그대로 두세요!**
이 라우팅 규칙들은 애플리케이션 최상위 계층에서 처리해야 하는 규칙입니다.

<code-example path="router/src/app/app-routing.module.2.ts" linenums="false" header="src/app/app-routing.module.ts (v2)">

</code-example>



{@a merge-hero-routes}

<!--
#### Remove heroes declarations
-->
#### 히어로 컴포넌트 선언 제거하기

<!--
Remove the `HeroListComponent` from the `AppModule`'s `declarations` because it's now provided by the `HeroesModule`. You can evolve the hero feature with more components and different routes. That's a key benefit of creating a separate module for each feature area.

After these steps, the `AppModule` should look like this:
-->
이제 `AppModule`의 `declarations` 목록에서 `HeroListComponent`를 제거합니다. 이 컴포넌트는 `HeroesModule`에 등록하는 방식으로 사용할 것입니다. 그리고 히어로와 관련된 컴포넌트나 라우팅 규칙이 추가되는 것도 모두 히어로 모듈에 추가할 것입니다. 기능 모듈을 각각 나눠서 정의하는 것은 Angular 구성요소를 효율적으로 관리하기 위한 것입니다.

여기까지 수정하고 나면 `AppModule`은 다음과 같습니다:


<code-example path="router/src/app/app.module.3.ts" header="src/app/app.module.ts">

</code-example>



{@a routing-module-order}

<!--
### Module import order matters
-->
### 모듈 로드순서 정리하기

<!--
Look at the module `imports` array. Notice that the `AppRoutingModule` is _last_.
Most importantly, it comes _after_ the `HeroesModule`.
-->
모듈에 선언한 `imports` 배열을 봅시다. 이 모듈 설정을 보면 `AppRoutingModule`이 _가장 마지막에_ 로드되는 것을 확인할 수 있습니다. `AppRoutingModule`은 반드시 `HeroesModule`보다 _나중에_ 로드되어야 합니다.

<code-example path="router/src/app/app.module.3.ts" region="module-imports" header="src/app/app.module.ts (module-imports)" linenums="false">

</code-example>


<!--
The order of route configuration matters.
The router accepts the first route that matches a navigation request path.

When all routes were in one `AppRoutingModule`,
you put the default and [wildcard](#wildcard) routes last, after the `/heroes` route,
so that the router had a chance to match a URL to the `/heroes` route _before_
hitting the wildcard route and navigating to "Page not found".

The routes are no longer in one file.
They are distributed across two modules, `AppRoutingModule` and `HeroesRoutingModule`.

Each routing module augments the route configuration _in the order of import_.
If you list `AppRoutingModule` first, the wildcard route will be registered
_before_ the hero routes.
The wildcard route&mdash;which matches _every_ URL&mdash;will intercept the attempt to navigate to a hero route.
-->
라우팅 규칙은 올바른 순서로 등록되어야 합니다.
라우터는 라우팅 규칙 중 가장 먼저 매칭된 규칙에 따라 네비게이션 동작을 실행합니다.

그래서 모든 라우팅 규칙을 `AppRoutingModule`에 정의했을 처럼 "Page not found"로 라우팅하는 와일드카드 라우팅 규칙이 적용되기 _전에_ `/heroes` 라우팅이 적용되어야 하기 때문에 `/heroes` 라우팅 규칙 뒤에 [와일드카드](#wildcard) 라우팅 규칙을 등록했습니다.

지금 수정한 예제에서 라우팅 규칙은 한 파일에만 정의되어 있지 않습니다.
라우팅 규칙은 `AppRoutingModule`과 `HeroesRoutingModule`에 나뉘어 정의되어 있습니다.

애플리케이션 전체 라우팅 규칙이 조합되는 것은 _라우팅 모듈을 로드하는 순서에 영향을 받습니다_ .
그래서 `AppRoutingModule`을 먼저 로드하면 와일드카드 라우팅 규칙이 히어로 모듈의 라우팅 규칙보다 _먼저_ 등록됩니다.
그리고 와일드카드 라우팅 규칙은 _모든_ URL과 매칭되기 때문에 히어로 모듈에 정의한 라우팅 규칙은 동작하지 않습니다.

<div class="alert is-helpful">


<!--
Reverse the routing modules and see for yourself that
a click of the heroes link results in "Page not found".
Learn about inspecting the runtime router configuration
[below](#inspect-config "Inspect the router config").
-->
라우팅 모듈을 로드하는 순서를 바꾸고 히어로 모듈로 이동하는 링크를 클릭하면 "Page not found" 페이지가 표시됩니다.
애플리케이션이 실행될 때 동작하는 라우터 설정을 확인하는 방법은 [아래](#inspect-config "Inspect the router config") 섹션을 참고하세요.

</div>

<!--
### Route Parameters
-->
### 라우팅 변수

{@a route-def-with-parameter}

<!--
#### Route definition with a parameter
-->
#### 라우팅 규칙에 변수 활용하기

<!--
Return to the `HeroesRoutingModule` and look at the route definitions again.
The route to `HeroDetailComponent` has a twist.
-->
`HeroesRoutingModule`로 돌아가서 라우팅 규칙을 다시 한 번 봅시다.
`HeroDetailComponent`로 라우팅하는 라우팅 규칙은 다음과 같이 정의되어 있습니다.

<!--
<code-example path="router/src/app/heroes/heroes-routing.module.1.ts" linenums="false" header="src/app/heroes/heroes-routing.module.ts (excerpt)" region="hero-detail-route">
-->
<code-example path="router/src/app/heroes/heroes-routing.module.1.ts" linenums="false" header="src/app/heroes/heroes-routing.module.ts (일부)" region="hero-detail-route">

</code-example>


<!--
Notice the `:id` token in the path. That creates a slot in the path for a **Route Parameter**.
In this case, the router will insert the `id` of a hero into that slot.

If you tell the router to navigate to the detail component and display "Magneta",
you expect a hero id to appear in the browser URL like this:
-->
URL 경로에 `:id` 토큰이 사용된 것을 확인해 보세요. 라우팅 경로를 이렇게 지정하면 **라우팅 변수**를 사용한다는 것을 의미합니다.
라우터는 이 라우팅 규칙의 `id` 부분에 사용자가 선택한 히어로의 ID를 할당합니다.

그래서 "Magneta"에 해당하는 히어로의 상세 정보화면으로 이동한다면 브라우저의 URL은 다음과 같이 표시될 것입니다:

<code-example format="nocode">
  localhost:4200/hero/15

</code-example>


<!--
If a user enters that URL into the browser address bar, the router should recognize the
pattern and go to the same "Magneta" detail view.
-->
사용자가 브라우저 주소표시줄에 이 URL을 직접 입력해도 라우터는 라우팅 규칙에 등록된 패턴에 따라 "Magneta" 히어로의 상세 정보 화면을 표시합니다.

<div class="callout is-helpful">



<header>
  <!--
  Route parameter: Required or optional?
  -->
  라우팅 변수: 필수일까? 생략해도 될까?
</header>


<!--
Embedding the route parameter token, `:id`,
in the route definition path is a good choice for this scenario
because the `id` is *required* by the `HeroDetailComponent` and because
the value `15` in the path clearly distinguishes the route to "Magneta" from
a route for some other hero.
-->
이 예제에서 라우팅 변수의 값이 `15`이면 `HeroDetailComponent`는 "Magneta"의 상세 정보를 화면에 표시합니다. 따라서 라우팅 변수 토큰 `:id`는 사용자가 선택한 히어로를 정확하게 지정해야 하기 때문에 *필수 항목*입니다.

</div>


{@a route-parameters}

<!--
#### Setting the route parameters in the list view
-->
#### 리스트 화면에서 라우팅 변수 설정하기

<!--
After navigating to the `HeroDetailComponent`, you expect to see the details of the selected hero.
You need *two* pieces of information: the routing path to the component and the hero's `id`.

Accordingly, the _link parameters array_ has *two* items:  the routing _path_ and a _route parameter_ that specifies the
`id` of the selected hero.
-->
`HeroDetailComponent`로 이동하고 나면 사용자가 선택한 히어로의 정보가 화면에 표시되어야 합니다.
그러면 이 정보를 컴포넌트에 전달하기 위해 사용자가 선택한 히어로의 `id`가 컴포넌트로 이동하는 라우팅 경로에 전달되어야 합니다.

<!--
<code-example path="router/src/app/heroes/hero-list/hero-list.component.1.html" linenums="false" header="src/app/heroes/hero-list/hero-list.component.html (link-parameters-array)" region="link-parameters-array">
-->
<code-example path="router/src/app/heroes/hero-list/hero-list.component.1.html" linenums="false" header="src/app/heroes/hero-list/hero-list.component.html (링크에 사용된 배열 형태의 인자)" region="link-parameters-array">

</code-example>


<!--
The router composes the destination URL from the array like this:
`localhost:4200/hero/15`.
-->
라우터는 배열 형태로 전달된 이 주소를 `localhost:4200/hero/15`로 조합합니다.

<div class="alert is-helpful">


<!--
How does the target `HeroDetailComponent` learn about that `id`?
Don't analyze the URL. Let the router do it.

The router extracts the route parameter (`id:15`) from the URL and supplies it to
the `HeroDetailComponent` via the `ActivatedRoute` service.
-->
`HeroDetailComponent`는 선택된 히어로의 `id`를 어떻게 알 수 있을까요?
이 때 URL을 직접 참조하는 방법보다 라우터를 활용하는 방법이 더 좋습니다.

URL에 사용된 라우팅 변수 (`id:15`)는 라우터가 파싱하며, 이렇게 파싱된 라우팅 변수는 `ActivatedRoute` 서비스를 통해 `HeroDetailComponent`에서 확인할 수 있습니다.

</div>

{@a activated-route}

<!--
### _Activated Route_ in action
-->
### _활성화된 라우팅 규칙 (Activated Route)_ 활용하기

<!--
Import the `Router`, `ActivatedRoute`, and `ParamMap` tokens from the router package.
-->
라우터 패키지에서 `Router`, `ActivatedRoute`, `ParamMap` 토큰을 로드합니다.

<!--
<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.1.ts" linenums="false" header="src/app/heroes/hero-detail/hero-detail.component.ts (activated route)" region="imports">
-->
<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.1.ts" linenums="false" header="src/app/heroes/hero-detail/hero-detail.component.ts (활성화된 라우팅 규칙)" region="imports">

</code-example>


<!--
Import the `switchMap` operator because you need it later to process the `Observable` route parameters.
-->
그리고 `Observable` 형태로 제공되는 라우팅 인자를 활용하기 위해 `switchMap` 연산자도 로드합니다.

<!--
<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.3.ts" linenums="false" header="src/app/heroes/hero-detail/hero-detail.component.ts (switchMap operator import)" region="rxjs-operator-import">
-->
<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.3.ts" linenums="false" header="src/app/heroes/hero-detail/hero-detail.component.ts (switchMap 연산자 로드)" region="rxjs-operator-import">

</code-example>



{@a hero-detail-ctor}

<!--
As usual, you write a constructor that asks Angular to inject services
that the component requires and reference them as private variables.
-->
일반적으로 컴포넌트에 서비스를 의존성으로 주입하는 로직은 컴포넌트 클래스의 생성자에 작성하며, 이렇게 주입받은 의존성 객체는 `private` 프로퍼티로 선언합니다.

<!--
<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.3.ts" linenums="false" header="src/app/heroes/hero-detail/hero-detail.component.ts (constructor)" region="ctor">
-->
<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.3.ts" linenums="false" header="src/app/heroes/hero-detail/hero-detail.component.ts (생성자)" region="ctor">

</code-example>

<!--
Later, in the `ngOnInit` method, you use the `ActivatedRoute` service to retrieve the parameters for the route,
pull the hero `id` from the parameters and retrieve the hero to display.
-->
그리고 생성자 다음에 실행되는 `ngOnInit` 메소드에는 `ActivatedRoute` 서비스를 사용해서 라우팅 변수를 참조하는 로직을 작성하는데, 화면에 표시할 히어로를 구분하기 위해 라우팅 변수들 중에 `id`를 조회합니다.

<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.3.ts" linenums="false" header="src/app/heroes/hero-detail/hero-detail.component.ts (ngOnInit)" region="ngOnInit">

</code-example>

<!--
The `paramMap` processing is a bit tricky. When the map changes, you `get()`
the `id` parameter from the changed parameters.

Then you tell the `HeroService` to fetch the hero with that `id` and return the result of the `HeroService` request.

You might think to use the RxJS `map` operator.
But the `HeroService` returns an `Observable<Hero>`.
So you flatten the `Observable` with the `switchMap` operator instead.

The `switchMap` operator also cancels previous in-flight requests. If the user re-navigates to this route
with a new `id` while the `HeroService` is still retrieving the old `id`, `switchMap` discards that old request and returns the hero for the new `id`.

The observable `Subscription` will be handled by the `AsyncPipe` and the component's `hero` property will be (re)set with the retrieved hero.
-->
`paramMap`을 활용하는 방식이 중요합니다. 이 예제가 실행되면 라우팅 변수 맵이 변경될 때마다 변경된 맵을 대상으로 `get()` 메소드를 실행하고 `id` 변수의 값을 참조합니다.

그러면 이렇게 참조한 `id`를 `HeroService`에 전달해서 이 `id`에 해당되는 히어로의 정보를 서버에서 받아옵니다.

이 과정에 RxJS `map` 연산자를 사용하는 것이 맞지 않을까 하는 생각이 들 수도 있습니다.
하지만 `HeroService`가 반환하는 것은 `Observable<Hero>`이기 때문에 이 `Observable`을 처리하려면 `switchMap` 연산자를 사용해야 합니다.

`switchMap` 연산자는 이전에 발생한 요청을 취소하는 역할도 합니다. 서버의 응답을 받기 전에 사용자가 다른 히어로를 선택해서 새로운 `id`가 `HeroService`에 전달되면, `switchMap` 연산자는 이전에 발생한 요청을 취소하고 새로운 `id`에 해당하는 요청을 생성합니다.

그리고 이 옵저버블은 컴포넌트의 `hero` 프로퍼티 값을 할당하거나 재할당하는데, 컴포넌트 템플릿에 사용된 `AsyncPipe`에 의해 구독이 시작됩니다.

#### _ParamMap_ API

<!--
The `ParamMap` API is inspired by the [URLSearchParams interface](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams). It provides methods
to handle parameter access for both route parameters (`paramMap`) and query parameters (`queryParamMap`).
-->
`ParamMap` API는 [URLSearchParams 인터페이스](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)를 기반으로 만들어진 것입니다. 이 인터페이스는 라우팅 변수를 참조할 수 있는 `paramMap`과 쿼리 인자를 참조할 수 있는 `queryParamMap`을 제공합니다.

<table>
  <tr>
    <th style="width:6rem;">
      <!--
      Member
      -->
      메소드
    </th>

    <th>
      <!--
      Description
      -->
      설명
    </th>
  </tr>

  <tr>
    <td>
      <!--
      <code>has(name)</code>
      -->
      <code>has(이름)</code>
    </td>
    <td>

    <!--
    Returns `true` if the parameter name is in the map of parameters.
    -->
    인자로 전달된 이름에 해당하는 변수가 있으면 `true`를 반환합니다.

    </td>
  </tr>

  <tr>
    <td>
      <!--
      <code>get(name)</code>
      -->
      <code>get(이름)</code>
    </td>
    <td>

    <!--
    Returns the parameter name value (a `string`) if present, or `null` if the parameter name is not in the map. Returns the _first_ element if the parameter value is actually an array of values.
    -->
    인자로 전달된 이름에 해당하는 변수가 맵에 있으면 그 변수를 `string` 타입으로 반환하고, 변수가 존재하지 않으면 `null`을 반환합니다. 해당 변수가 배열 타입이면 _첫번째_ 엘리먼트를 반환합니다.

    </td>
  </tr>

  <tr>
    <td>
      <!--
      <code>getAll(name)</code>
      -->
      <code>getAll(이름)</code>
    </td>
    <td>

    <!--
    Returns a `string array` of the parameter name value if found, or an empty `array` if the parameter name value is not in the map. Use `getAll` when a single parameter could have multiple values.
    -->
    인자로 전달된 이름에 해당하는 변수가 맵에 있으면 `string` 배열 타입으로 반환하고, 변수가 존재하지 않으면 빈 배열을 반환합니다. 이 메소드는 하나의 변수가 여러번 사용될 때 사용합니다.

    </td>
  </tr>

  <tr>
    <td>
      <code>keys</code>
    </td>
    <td>

    <!--
    Returns a `string array` of all parameter names in the map.
    -->
    라우팅 변수 맵에 존재하는 모든 인자를 `string` 배열 타입으로 반환합니다.

    </td>
  </tr>
</table>

{@a reuse}

<!--
#### Observable <i>paramMap</i> and component reuse
-->
#### <i>paramMap</i> 옵저버블과 컴포넌트 재사용

<!--
In this example, you retrieve the route parameter map from an `Observable`.
That implies that the route parameter map can change during the lifetime of this component.

They might. By default, the router re-uses a component instance when it re-navigates to the same component type
without visiting a different component first. The route parameters could change each time.

Suppose a parent component navigation bar had "forward" and "back" buttons
that scrolled through the list of heroes.
Each click navigated imperatively to the `HeroDetailComponent` with the next or previous `id`.

You don't want the router to remove the current `HeroDetailComponent` instance from the DOM only to re-create it for the next `id`.
That could be visibly jarring.
Better to simply re-use the same component instance and update the parameter.

Unfortunately, `ngOnInit` is only called once per component instantiation.
You need a way to detect when the route parameters change from _within the same instance_.
The observable `paramMap` property handles that beautifully.
-->
이 예제에서 라우팅 변수 맵은 `Observable` 타입으입니다.
그래서 이 맵은 컴포넌트가 동작하는 동안 현재 상태에 따라 계속 갱신됩니다.

그래서 라우터는 이 컴포넌트 인스턴스를 사용하는 동안 변경되는 라우팅 변수를 추적하면서 재사용할 수 있습니다. 브라우저가 접근하는 URL이 변경되면 라우팅 변수도 상황에 맞게 변경됩니다.

부모 컴포넌트에 히어로의 리스트를 탐색하는 "앞으로", "뒤로" 버튼이 있다고 합시다.
그러면 이 버튼이 클릭될 때마다 `HeroDetailComponent`에 전달되는 `id`도 변경될 것입니다.

이 때 `id`가 변경되는 것에 반응하기 위해 DOM에서 `HeroDetailComponent`를 제거했다가 다시 추가할 필요는 없습니다. 이렇게 구현하면 화면이 깜빡이는 불편함만 더해질 뿐 입니다.
그래서 이 경우에는 컴포넌트 인스턴스를 그대로 사용하면서 라우팅 변수가 변경되는 것에만 반응하는 것이 더 좋습니다.

하지만 `ngOnInit` 함수는 컴포넌트의 인스턴스가 생성될 때 딱 한 번만 실행됩니다.
그래서 _컴포넌트 인스턴스를 유지하면서_ 라우팅 인자가 변경되는 것을 감지하는 방법이 필요합니다.
`paramMap` 프로퍼티가 옵저버블로 제공되는 것은 이런 상황을 위한 것입니다.

<div class="alert is-helpful">


<!--
When subscribing to an observable in a component, you almost always arrange to unsubscribe when the component is destroyed.

There are a few exceptional observables where this is not necessary.
The `ActivatedRoute` observables are among the exceptions.

The `ActivatedRoute` and its observables are insulated from the `Router` itself.
The `Router` destroys a routed component when it is no longer needed and the injected `ActivatedRoute` dies with it.

Feel free to unsubscribe anyway. It is harmless and never a bad practice.
-->
컴포넌트에서 옵저버블을 구독하면 이 컴포넌트가 종료될 때 구독했던 옵저버블을 해지하는 것이 좋다고 알고 있을 것입니다.

하지만 이런 로직이 필요하지 않은 경우가 있습니다.
`ActivatedRoute` 옵저버블을 사용하는 경우도 이런 예외에 해당됩니다.

`ActivatedRoute`와 이 서비스가 제공하는 옵저버블은 모두 `Router`가 직접 관리합니다.
그래서 `Router`가 라우팅 대상 컴포넌트를 종료하면 이 컴포넌트에 주입되었던 `ActivatedRoute`도 함께 종료됩니다.

옵저버블을 해제하지 않았다고 걱정하지 마세요. 프레임워크가 알아서 처리할 것입니다.

</div>



{@a snapshot}

{@a snapshot-the-no-observable-alternative}

<!--
#### _Snapshot_: the _no-observable_ alternative
-->
#### _스냅샷_: 옵저버블 대신 사용하기

<!--
_This_ application won't re-use the `HeroDetailComponent`.
The user always returns to the hero list to select another hero to view.
There's no way to navigate from one hero detail to another hero detail
without visiting the list component in between.
Therefore, the router creates a new `HeroDetailComponent` instance every time.

When you know for certain that a `HeroDetailComponent` instance will *never, never, ever*
be re-used, you can simplify the code with the *snapshot*.

The `route.snapshot` provides the initial value of the route parameter map.
You can access the parameters directly without subscribing or adding observable operators.
It's much simpler to write and read:
-->
지금까지 작성한 애플리케이션은 `HeroDetailComponent` 인스턴스를 재사용하지 않습니다.
사용자는 히어로 목록에서 히어로를 한 명 선택해서 상세 정보를 확인하고, 다시 목록 화면으로 돌아가는 것을 반복할 뿐입니다.
지금까지 구현된 시나리오에서 어떤 히어로의 상세정보를 보다가 다른 히어로의 상세정보로 바로 넘어가는 경우는 없습니다.
그래서 `HeroDetailComponent`의 인스턴스는 해당 주소에 접근할 때마다 새로 생성됩니다.

`HeroDetailComponent`의 인스턴스가 *절대로* 재사용되지 않는다면 *스냅샷(snapshot)*을 사용하는 것이 더 간단합니다.


`route.snapshot`은 라우팅 변수 맵의 초기 값을 제공합니다.
그래서 이 변수를 참조하면 옵저버블을 구독하거나 옵저버블 연산자를 사용하지 않아도 라우팅 변수를 확인할 수 있습니다.
코드는 이 방식이 더 간단합니다.

<!--
<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.2.ts" linenums="false" header="src/app/heroes/hero-detail/hero-detail.component.ts (ngOnInit snapshot)" region="snapshot">
-->
<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.2.ts" linenums="false" header="src/app/heroes/hero-detail/hero-detail.component.ts (ngOnInit 스냅샷)" region="snapshot">

</code-example>



<div class="alert is-helpful">


<!--
**Remember:** you only get the _initial_ value of the parameter map with this technique.
Stick with the observable `paramMap` approach if there's even a chance that the router
could re-use the component.
This sample stays with the observable `paramMap` strategy just in case.
-->
**기억하세요:** 스냅샷을 참조하면 라우팅 변수들의 _초기값_ 만 참조할 수 있습니다.
그래서 라우터가 컴포넌트를 재사용하는 방식으로 구현하는 경우에는 `paramMap` 옵저버블을 사용해야 합니다.
이 예제에서는 `paramMap` 옵저버블을 사용하는 방식으로 계속 설명합니다.

</div>



{@a nav-to-list}

<!--
### Navigating back to the list component
-->
### 히어로 목록을 표시하는 컴포넌트로 돌아가기

<!--
The `HeroDetailComponent` has a "Back" button wired to its `gotoHeroes` method that navigates imperatively
back to the `HeroListComponent`.

The router `navigate` method takes the same one-item _link parameters array_
that you can bind to a `[routerLink]` directive.
It holds the _path to the `HeroListComponent`_:
-->
`HeroDetailComponent`에는 `HeroListComponent`로 돌아가기 위해 `gotoHeroes` 메소드를 실행하는 "Back" 버튼이 있습니다.

이 때 라우터가 제공하는 `navigate` 메소드에 _링크 변수 배열 (link parameters array)_ 을 전달합니다.
이 배열에는 _`HeroListComponent`로 돌아가는 경로_ 가 지정되어 있습니다:

<!--
<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.1.ts" linenums="false" header="src/app/heroes/hero-detail/hero-detail.component.ts (excerpt)" region="gotoHeroes">
-->
<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.1.ts" linenums="false" header="src/app/heroes/hero-detail/hero-detail.component.ts (일부)" region="gotoHeroes">

</code-example>


{@a optional-route-parameters}

<!--
#### Route Parameters: Required or optional?
-->
#### 라우팅 변수: 필수일까? 생략해도 될까?

<!--
Use [*route parameters*](#route-parameters) to specify a *required* parameter value *within* the route URL
as you do when navigating to the `HeroDetailComponent` in order to view the hero with *id* 15:
-->
`HeroDetailComponent`를 화면에 표시하면서 특정 히어로를 지정하기 위해 *id* 15에 해당하는 [*라우팅 변수*](#route-parameters)를 지정해야 했기 때문에 이 라우팅 변수는 필수 항목입니다.

<code-example format="nocode">
  localhost:4200/hero/15

</code-example>


<!--
You can also add *optional* information to a route request.
For example, when returning to the hero-detail.component.ts list from the hero detail view,
it would be nice if the viewed hero was preselected in the list.
-->
그런데 *추가* 정보를 제공하기 위해 옵션 라우팅 변수를 사용할 수도 있습니다.
예를 들면 히어로의 상세정보 화면에서 히어로 목록 화면으로 돌아가면서 이전에 선택되었던 히어로 항목이 어떤 것인지 표시하는 용도로 사용하는 식입니다.

<figure>
  <img src='generated/images/guide/router/selected-hero.png' alt="Selected hero">
</figure>


<!--
You'll implement this feature in a moment by including the viewed hero's `id`
in the URL as an optional parameter when returning from the `HeroDetailComponent`.

Optional information takes other forms. Search criteria are often loosely structured, e.g., `name='wind*'`.
Multiple values are common&mdash;`after='12/31/2015' & before='1/1/2017'`&mdash;in no
particular order&mdash;`before='1/1/2017' & after='12/31/2015'`&mdash; in a
variety of formats&mdash;`during='currentYear'`.

These kinds of parameters don't fit easily in a URL *path*. Even if you could define a suitable URL token scheme,
doing so greatly complicates the pattern matching required to translate an incoming URL to a named route.

Optional parameters are the ideal vehicle for conveying arbitrarily complex information during navigation.
Optional parameters aren't involved in pattern matching and afford flexibility of expression.

The router supports navigation with optional parameters as well as required route parameters.
Define _optional_ parameters in a separate object _after_ you define the required route parameters.

In general, prefer a *required route parameter* when
the value is mandatory (for example, if necessary to distinguish one route path from another);
prefer an *optional parameter* when the value is optional, complex, and/or multivariate.
-->
이런 방식은 `HeroDetailComponent` 화면에서 봤던 히어로의 `id`를 히어로 목록에 돌아온 후에도 활용하려고 할 때 사용합니다.

그런데 추가 정보는 필수 라우팅 변수와 다른 형태가 될 수도 있습니다. 컴포넌트의 결합도를 낮추려고 한다면 `name='wind*'`와 같이 사용할 수도 있습니다.
`after='12/31/2015' & before='1/1/2017'`와 같이 여러 값을 한 번에 전달할 수도 있으며, 이렇게 사용할 때 인자의 순서는 중요하지 않습니다. `before='1/1/2017' & after='12/31/2015'`라고 사용해도 되고 `during='currentYear'`라고 사용해도 됩니다.

하지만 이런 형태가 되면 기존에 라우팅 규칙으로 정의했던 URL *경로* 와는 매칭되지 않을 수 있습니다. 이런 형식의 URL과 매칭되는 라우팅 규칙을 정의하려면 아주 복잡한 패턴 매칭 방법을 구현해야 할 수도 있습니다.

옵션 라우팅 변수는 애플리케이션을 네비게이션하는 과정에 필요한 정보를 전달하기 위해 사용합니다.
그리고 이 과정에 라우팅 규칙의 패턴 매칭과 긴밀하게 연결될 필요는 없습니다.

그래서 라우터는 옵션 라우팅 변수를 일반 라우팅 변수를 사용하는 것처럼 쉽게 사용할 수 있는 문법을 제공합니다.
일반적으로 라우팅하는 선언 _뒤에_ 객체 형태로 옵션 라우팅 변수를 전달하면 됩니다.

라우팅 변수가 꼭 필요하다면 *필수 라우팅 변수*를 사용하는 방식으로 구현하는 것이 좋습니다. 그리고 라우팅 변수를 생략할 수 있거나 이 변수의 형태가 복잡하다면 *옵션 라우팅 변수*를 사용하는 것이 좋습니다.

{@a optionally-selecting}

<!--
#### Heroes list: optionally selecting a hero
-->
#### 히어로 목록: 옵션 라우팅 변수로 히어로 선택하기

<!--
When navigating to the `HeroDetailComponent` you specified the _required_ `id` of the hero-to-edit in the
*route parameter* and made it the second item of the [_link parameters array_](#link-parameters-array).
-->
`HeroDetailComponent`로 네비게이션하는 경우에는 원하는 히어로를 구분하기 위해 `id` 라우팅 변수가 _필수 항목_ 입니다. 그래서 네비게이션할 때 [_링크 변수 배열_](#link-parameters-array)을 다음과 같이 지정했습니다.

<!--
<code-example path="router/src/app/heroes/hero-list/hero-list.component.1.html" linenums="false" header="src/app/heroes/hero-list/hero-list.component.html (link-parameters-array)" region="link-parameters-array">
-->
<code-example path="router/src/app/heroes/hero-list/hero-list.component.1.html" linenums="false" header="src/app/heroes/hero-list/hero-list.component.html (링크 변수 배열)" region="link-parameters-array">

</code-example>


<!--
The router embedded the `id` value in the navigation URL because you had defined it
as a route parameter with an `:id` placeholder token in the route `path`:
-->
그러면 이미 라우팅 규칙에 `:id` 토큰이 선언되었기 때문에 라우터는 `id` 값으로 URL을 조합합니다.

<!--
<code-example path="router/src/app/heroes/heroes-routing.module.1.ts" linenums="false" header="src/app/heroes/heroes-routing.module.ts (hero-detail-route)" region="hero-detail-route">
-->
<code-example path="router/src/app/heroes/heroes-routing.module.1.ts" linenums="false" header="src/app/heroes/heroes-routing.module.ts (히어로 상세정보로 라우팅하는 규칙)" region="hero-detail-route">

</code-example>


<!--
When the user clicks the back button, the `HeroDetailComponent` constructs another _link parameters array_
which it uses to navigate back to the `HeroListComponent`.
-->
그리고 `HeroDetailComponent`에서 사용자가 뒤로가기 버튼을 누르면 화면이 `HeroListComponent`로 전환되면서 새로운 _링크 변수 배열_ 을 생성합니다.

<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.1.ts" linenums="false" header="src/app/heroes/hero-detail/hero-detail.component.ts (gotoHeroes)" region="gotoHeroes">

</code-example>


<!--
This array lacks a route parameter because you had no reason to send information to the `HeroListComponent`.

Now you have a reason. You'd like to send the id of the current hero with the navigation request so that the
`HeroListComponent` can highlight that hero in its list.
This is a _nice-to-have_ feature; the list will display perfectly well without it.

Send the `id` with an object that contains an _optional_ `id` parameter.
For demonstration purposes, there's an extra junk parameter (`foo`) in the object that the `HeroListComponent` should ignore.
Here's the revised navigation statement:
-->
지금까지는 `HeroDetailComponent`는 `HeroListComponent`로 정보를 전달할 필요가 없기 때문에 라우팅 변수를 사용하지 않았습니다.

이제 정보를 전달해 봅시다. 이제부터는 `HeroDetailComponent`에 표시하던 히어로의 `id`를 `HeroListComponent`로 전달하고, `HeroListComponent`는 이 `id`에 해당하는 히어로를 목록에서 찾아 다른 배경색으로 표시하려고 합니다.
이 기능은 _있으면 좋은_ 기능일 뿐입니다. 이 기능이 없어도 히어로의 목록을 표시하는 기능에는 문제가 없습니다.

`HeroDetailComponent`는 `id` 프로퍼티가 있는 _옵션_ 라우팅 변수를 사용합니다.
그리고 지금 예제에서는 설명을 위해 실제로 사용하지 않는 라우팅 변수(`foo`)도 객체에 선언했습니다. `HeroListComponent`는 이 변수를 사용하지 않습니다.
그러면 히어로의 목록을 표시하는 화면으로 이동하는 로직을 다음과 같이 구현할 수 있습니다:

<!--
<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.3.ts" linenums="false" header="src/app/heroes/hero-detail/hero-detail.component.ts (go to heroes)" region="gotoHeroes">
-->
<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.3.ts" linenums="false" header="src/app/heroes/hero-detail/hero-detail.component.ts (히어로 목록 화면으로 이동하기)" region="gotoHeroes">

</code-example>


<!--
The application still works. Clicking "back" returns to the hero list view.

Look at the browser address bar.


It should look something like this, depending on where you run it:
-->
애플리케이션은 이전과 마찬가지로 동작합니다. 그리고 `HeroDetailComponent`에서 "back" 버튼을 누르면 히어로의 목록을 표시하는 화면으로 이동합니다.

브라우저의 주소표시줄이 어떻게 변경되는지 확인해 보세요.


주소 표시줄은 다음과 같이 표시될 것입니다:

<code-example language="bash">
  localhost:4200/heroes;id=15;foo=foo

</code-example>


<!--
The `id` value appears in the URL as (`;id=15;foo=foo`), not in the URL path.
The path for the "Heroes" route doesn't have an `:id` token.

The optional route parameters are not separated by "?" and "&" as they would be in the URL query string.
They are **separated by semicolons ";"**
This is *matrix URL* notation&mdash;something you may not have seen before.
-->
이 URL에 포함된 `id` 값은 라우팅 규칙의 URL과 매칭되지 않습니다.
왜냐하면 히어로의 목록을 표시하는 라우팅 규칙에 `:id` 토큰이 없기 때문입니다.

그런데 옵션 라우팅 변수는 일반적인 URL 쿼리 스트링에 사용하는 "?"나 "&"로 항목을 구분하지 않습니다.
옵션 라우팅 변수에서 각 항목은 **세미콜론 ";"**으로 구분됩니다.
이 방식은 *매트릭스 URL (matrix URL)* 표시법입니다.

<div class="alert is-helpful">


<!--
*Matrix URL* notation is an idea first introduced
in a [1996 proposal](http://www.w3.org/DesignIssues/MatrixURIs.html) by the founder of the web, Tim Berners-Lee.

Although matrix notation never made it into the HTML standard, it is legal and
it became popular among browser routing systems as a way to isolate parameters
belonging to parent and child routes. The Router is such a system and provides
support for the matrix notation across browsers.

The syntax may seem strange to you but users are unlikely to notice or care
as long as the URL can be emailed and pasted into a browser address bar
as this one can.
-->
*매트릭스 URL* 표기법은 웹을 만든 Tim Berners-Lee가 [1996](http://www.w3.org/DesignIssues/MatrixURIs.html)년에 처음 제안한 표기법입니다.

이 표기법은 HTML 표준이 되지는 못했지만 아직 유효하며, 부모 라우팅과 자식 라우팅에 사용되는 변수를 구분하는 용도로 많이 사용되고 있습니다.
이 때 라우터는 매트릭스 표기법을 직접 처리하기도 하지만 브라우저에 매트릭스 표기법을 지원하는 용도로도 사용됩니다.

이 표기법이 낯설어 보일 수도 있지만 사용자가 이 표기법을 꼭 이해해야 하는 것은 아닙니다. 이 표기법을 사용해도 이메일을 보낼 때나 브라우저 주소표시줄에 붙여넣을 때 아무 제약없이 사용할 수 있습니다.

</div>



{@a route-parameters-activated-route}

<!--
### Route parameters in the *ActivatedRoute* service
-->
### *ActivatedRoute* 서비스에서 라우팅 변수 참조하기

<!--
The list of heroes is unchanged. No hero row is highlighted.
-->
아직 히어로의 목록을 표시하는 컴포넌트는 수정하지 않았습니다. 목록에서 배경색이 변경된 항목도 없습니다.

<div class="alert is-helpful">


<!--
The <live-example></live-example> *does* highlight the selected
row because it demonstrates the final state of the application which includes the steps you're *about* to cover.
At the moment this guide is describing the state of affairs *prior* to those steps.
-->
<live-example></live-example>에서 확인하면 히어로의 상세 정보를 확인하고 돌아왔을 때 그 히어로가 목록에서 하이라이트 표시되는 것을 확인할 수 있습니다. 왜냐하면 이 예제에 구현된 코드는 이 단계에서 다루는 내용을 모두 적용한 코드이기 때문입니다.
이번 섹션에서는 이렇게 구현하는 방법을 설명합니다.

</div>


<!--
The `HeroListComponent` isn't expecting any parameters at all and wouldn't know what to do with them.
You can change that.

Previously, when navigating from the `HeroListComponent` to the `HeroDetailComponent`,
you subscribed to the route parameter map `Observable` and made it available to the `HeroDetailComponent`
in the `ActivatedRoute` service.
You injected that service in the constructor of the `HeroDetailComponent`.

This time you'll be navigating in the opposite direction, from the `HeroDetailComponent` to the `HeroListComponent`.

First you extend the router import statement to include the `ActivatedRoute` service symbol:
-->
`HeroListComponent`는 아직 라우팅 변수를 받을 준비가 되어있지 않으며 변수를 받아도 어떤 동작을 해야할지 모릅니다.
이 내용을 구현해 봅시다.

이전에는 `HeroListComponent`에서 `HeroDetailComponent`로 네비게이션할 때 이 컴포넌트에 주입된 `ActivatedRoute` 서비스에서 제공하는 라우팅 변수 맵 `Observable`을 구독했었습니다.

그리고 이번에는 `HeroDetailComponent`에서 `HeroListComponent`로 네비게이션하는 경우를 생각해 봅시다.

먼저 `@angular/router` 패키지에서 `ActivatedRoute` 서비스 심볼을 로드합니다:

<code-example path="router/src/app/heroes/hero-list/hero-list.component.ts" linenums="false" header="src/app/heroes/hero-list/hero-list.component.ts (import)" region="import-router">

</code-example>


<!--
Import the `switchMap` operator to perform an operation on the `Observable` of route parameter map.
-->
그리고 `switchMap` 연산자와 `Observable` 심볼도 로드합니다.


<!--
<code-example path="router/src/app/heroes/hero-list/hero-list.component.ts" linenums="false" header="src/app/heroes/hero-list/hero-list.component.ts (rxjs imports)" region="rxjs-imports">
-->
<code-example path="router/src/app/heroes/hero-list/hero-list.component.ts" linenums="false" header="src/app/heroes/hero-list/hero-list.component.ts (rxjs 로드)" region="rxjs-imports">

</code-example>


<!--
Then you inject the `ActivatedRoute` in the `HeroListComponent` constructor.
-->
그리고 나면 `HeroListComponent` 생성자로 `ActivatedRoute`를 주입합니다.


<!--
<code-example path="router/src/app/heroes/hero-list/hero-list.component.ts" linenums="false" header="src/app/heroes/hero-list/hero-list.component.ts (constructor and ngOnInit)" region="ctor">
-->
<code-example path="router/src/app/heroes/hero-list/hero-list.component.ts" linenums="false" header="src/app/heroes/hero-list/hero-list.component.ts (생성자와 ngOnInit)" region="ctor">

</code-example>


<!--
The `ActivatedRoute.paramMap` property is an `Observable` map of route parameters. The `paramMap` emits a new map of values that includes `id`
when the user navigates to the component. In `ngOnInit` you subscribe to those values, set the `selectedId`, and get the heroes.
-->
`ActivatedRoute.paramMap` 프로퍼티는 라우팅 변수를 제공하는 `Observable` 맵입니다. 이 프로퍼티는 사용자가 이 컴포넌트로 네비게이션 할 때마다 `id`가 포함된 맵을 새로 생성합니다. 그래서 `ngOnInit` 메소드에서 이 옵저버블을 구독하면 히어로 한 명의 정보를 가져올 때 활용할 수 있습니다.


<!--
Update the template with a [class binding](guide/template-syntax#class-binding).
The binding adds the `selected` CSS class when the comparison returns `true` and removes it when `false`.
Look for it within the repeated `<li>` tag as shown here:
-->
템플릿에 [CSS 클래스 바인딩](guide/template-syntax#클래스-바인딩)을 적용해 봅시다.
라우팅 변수로 받아온 히어로의 `id`에 해당하는 엘리먼트에는 `selected` CSS 클래스를 지정하고, 이 `id`에 해당하지 않는 엘리먼트에는 `selected` CSS 클래스를 제거하려고 합니다.
이 로직은 템플릿에서 반복되는 `<li>` 태그에 사용되었습니다:


<code-example path="router/src/app/heroes/hero-list/hero-list.component.html" linenums="false" header="src/app/heroes/hero-list/hero-list.component.html">

</code-example>

<!--
Add some styles to apply when the list item is selected.
-->
그리고 리스트 항목에 적용되는 스타일을 다음과 같이 정의합니다.

<code-example path="router/src/app/heroes/hero-list/hero-list.component.css" linenums="false" region="selected" header="src/app/heroes/hero-list/hero-list.component.css">

</code-example>


<!--
When the user navigates from the heroes list to the "Magneta" hero and back, "Magneta" appears selected:
-->
이제 사용자가 히어로 목록에서 "Magneta"를 선택했다가 돌아오면 "Magneta" 항목이 다음과 같이 표시될 것입니다:

<figure>
  <img src='generated/images/guide/router/selected-hero.png' alt="Selected List">
</figure>


<!--
The optional `foo` route parameter is harmless and continues to be ignored.
-->
`foo` 옵션 라우팅 변수는 아무 역할도 하지 않습니다.

<!--
### Adding routable animations
-->
### 라우팅 애니메이션 적용하기

{@a route-animation}


<!--
#### Adding animations to the routed component
-->
#### 컴포넌트를 라우팅하면서 애니메이션 적용하기

<!--
The heroes feature module is almost complete, but what is a feature without some smooth transitions?

This section shows you how to add some [animations](guide/animations) to the `HeroDetailComponent`.

First import the `BrowserAnimationsModule` and add it to the `imports` array:
-->
이제 히어로 기능 모듈은 거의 끝났습니다. 그런데 컴포넌트를 좀 더 자연스럽게 전환하는 방법이 있을까요?

이번에는 `HeroDetailComponent`로 화면을 전환하면서 [애니메이션](guide/animations)을 적용하는 방법에 대해 알아봅시다.

먼저 `AppModule` `imports` 배열에 `BrowserAnimationsModule`을 로드합니다.

<!--
<code-example path="router/src/app/app.module.ts" linenums="false" header="src/app/app.module.ts (animations-module)" region="animations-module">
-->
<code-example path="router/src/app/app.module.ts" linenums="false" header="src/app/app.module.ts (애니메이션 모듈)" region="animations-module">

</code-example>

<!--
Next, add a `data` object to the routes for `HeroListComponent` and `HeroDetailComponent`. Transitions are based on `states` and you'll use the `animation` data from the route to provide a named animation `state` for the transitions.
-->
그리고 `HeroListComponent`와 `HeroDetailComponent`에 해당하는 라우팅 규칙에 `data` 객체를 추가합니다. 이 객체에 `animation` 데이터를 추가하는데, 전환효과는 이 때 지정된 `states`를 기반으로 동작할 것입니다.

<!--
<code-example path="router/src/app/heroes/heroes-routing.module.2.ts" header="src/app/heroes/heroes-routing.module.ts (animation data)">
-->
<code-example path="router/src/app/heroes/heroes-routing.module.2.ts" header="src/app/heroes/heroes-routing.module.ts (애니메이션 데이터)">

</code-example>

<!--
Create an `animations.ts` file in the root `src/app/` folder. The contents look like this:
-->
애플리케이션 최상위 폴더인 `src/app/`에 `animations.ts` 파일을 생성합니다. 그리고 이 파일의 내용을 다음과 같이 작성합니다:

<!--
<code-example path="router/src/app/animations.ts" linenums="false" header="src/app/animations.ts (excerpt)">
-->
<code-example path="router/src/app/animations.ts" linenums="false" header="src/app/animations.ts (일부)">

</code-example>

<!--
This file does the following:

* Imports the animation symbols that build the animation triggers, control state, and manage transitions between states.

* Exports a constant named `slideInAnimation` set to an animation trigger named *`routeAnimation`*;

* Defines one *transition* when switching back and forth from the `heroes` and `hero` routes to ease the component in from the left of the screen as it enters the application view (`:enter`), the other to animate the component to the right as it leaves the application view (`:leave`).

You could also create more transitions for other routes. This trigger is sufficient for the current milestone.

Back in the `AppComponent`, import the `RouterOutlet` token from the `@angular/router` package and the `slideInAnimation` from
`'./animations.ts`.

Add an `animations` array to the `@Component` metadata's that contains the `slideInAnimation`.
-->
이 파일의 내용은 이렇습니다:

* 애니메이션 트리거, 상태 컨트롤, 상태가 변경될 때 적용될 트랜지션을 정의하기 위한 심볼을 로드합니다.

* *`routeAnimation`*라는 이름으로 만든 애니메이션 트리거가 할당된 상수 `slideInAnimation`를 파일 외부로 공개합니다.

* 이 애니메이션에 정의된 *트랜지션*은 라우팅 규칙의 상태가 `heroes`와 `hero`로 변경될 때마다 새로 들어오는 애플리케이션 뷰(`:enter`)가 화면 왼쪽에서 나타나고, 이전에 있던 애플리케이션 뷰(`:leave`)가 화면 오른쪽으로 사라지는 것을 정의한 것입니다.

물론 라우팅 규칙에는 더 많은 트랜지션을 정의할 수도 있습니다. 이 예제에서는 이정도 트리거만 적용해 봅시다.

`AppComponent`로 돌아가서 `@angular/router` 패키지에 있는 `RouterOutlet` 토큰과 `./animations.ts` 파일에 정의한 `slideInDownAnimation`을 로드합니다.

그리고 `@Component` 메타데이터의 `animations` 배열에 다음과 같이 `slideInAnimation`을 적용합니다.

<code-example path="router/src/app/app.component.2.ts" linenums="false" header="src/app/app.component.ts (animations)" region="animation-imports">

</code-example>

<!--
In order to use the routable animations, you'll need to wrap the `RouterOutlet` inside an element. You'll
use the `@routeAnimation` trigger and bind it to the element.

For the `@routeAnimation` transitions to key off states, you'll need to provide it with the `data` from the `ActivatedRoute`. The `RouterOutlet` is exposed as an `outlet` template variable, so you bind a reference to the router outlet. A variable of `routerOutlet` is an ideal choice.
-->
컴포넌트를 라우팅 할 때 애니메이션을 적용하려면 `RouterOutlet`을 `<div>` 엘리먼트로 한 번 감싸고 이 엘리먼트에 `@routeAnimation` 트리거를 바인딩하면 됩니다.

`@routeAnimation` 트랜지션을 특정 상태로 설정하려면 `ActivatedRoute`를 사용해서 `data`를 전달하면 됩니다. `RouterOutlet`은 컴포넌트 클래스의 메소드에서 참조하기 위해 `outlet`이라는 템플릿 변수로 지정했습니다.

<!--
<code-example path="router/src/app/app.component.2.html" linenums="false" header="src/app/app.component.html (router outlet)">
-->
<code-example path="router/src/app/app.component.2.html" linenums="false" header="src/app/app.component.html (라우팅 영역)">

</code-example>

<!--
The `@routeAnimation` property is bound to the `getAnimationData` with the provided `routerOutlet` reference, so you'll need to define that function in the `AppComponent`. The `getAnimationData` function returns the animation property from the `data` provided through the `ActivatedRoute`. The `animation` property matches the `transition` names you used in the `slideInAnimation` defined in `animations.ts`.
-->
그리고 `@routerAnimation` 프로퍼티에 `routerOutlet` 객체를 전달하기 위해 `AppComponent`에 `getAnimationData` 함수를 정의합니다. `getAnimationData` 함수는 `ActivatedRoute`로 전달된 `data`에서 애니메이션 프로퍼티 값을 반환합니다. 이렇게 반환된 `animation` 프로퍼티 값은 `animations.ts` 파일의 `slideInAnimation`에 정의된 `transition` 이름과 매칭되면서 애니메이션이 동작합니다.

<!--
<code-example path="router/src/app/app.component.2.ts" linenums="false" header="src/app/app.component.ts (router outlet)" region="function-binding">
-->
<code-example path="router/src/app/app.component.2.ts" linenums="false" header="src/app/app.component.ts (라우팅 영역)" region="function-binding">

</code-example>

<!--
When switching between the two routes, the `HeroDetailComponent` and `HeroListComponent` will ease in from the left when routed to and will slide to the right when navigating away.
-->
이제 `HeroDetailComponent`와 `HeroListComponent`를 전환하면서 두 라우팅 규칙이 적용되면 네비게이션이 동작할 때마다 화면이 왼쪽으로, 오른쪽으로 전환되는 애니메이션이 동작합니다.


{@a milestone-3-wrap-up}

<!--
### Milestone 3 wrap up
-->
### 3단계 정리

<!--
You've learned how to do the following:

* Organize the app into *feature areas*.
* Navigate imperatively from one component to another.
* Pass information along in route parameters and subscribe to them in the component.
* Import the feature area NgModule into the `AppModule`.
* Applying routable animations based on the page.

After these changes, the folder structure looks like this:
-->
이번 단계에서는 이런 내용에 대해 알아봤습니다:

* 애플리케이션을 *기능 단위*로 구조화하는 방법
* 컴포넌트에서 다른 컴포넌트로 전환하는 방법
* 라우팅 변수로 어떤 정보를 전달하고, 이 정보를 컴포넌트에서 받는 방법
* 기능 단위로 나눈 NgModule을 `AppModule`에 로드하는 방법
* 라우팅 될 때 컴포넌트에 애니메이션을 적용하는 방법

그리고 지금까지 내용을 적용하고 난 후의 폴더 구조는 다음과 같습니다:

<div class='filetree'>

  <div class='file'>
    angular-router-sample
  </div>

  <div class='children'>

    <div class='file'>
      src
    </div>

    <div class='children'>

      <div class='file'>
        app
      </div>

      <div class='children'>

        <div class='file'>
          crisis-list
        </div>

          <div class='children'>

            <div class='file'>
              crisis-list.component.css
            </div>

            <div class='file'>
              crisis-list.component.html
            </div>

            <div class='file'>
              crisis-list.component.ts
            </div>

          </div>

        <div class='file'>
          heroes
        </div>

        <div class='children'>

          <div class='file'>
            hero-detail
          </div>

            <div class='children'>

              <div class='file'>
                hero-detail.component.css
              </div>

              <div class='file'>
                hero-detail.component.html
              </div>

              <div class='file'>
                hero-detail.component.ts
              </div>

            </div>

          <div class='file'>
            hero-list
          </div>

            <div class='children'>

              <div class='file'>
                hero-list.component.css
              </div>

              <div class='file'>
                hero-list.component.html
              </div>

              <div class='file'>
                hero-list.component.ts
              </div>

            </div>

          <div class='file'>
            hero.service.ts
          </div>

          <div class='file'>
            hero.ts
          </div>

          <div class='file'>
            heroes-routing.module.ts
          </div>

          <div class='file'>
            heroes.module.ts
          </div>

          <div class='file'>
            mock-heroes.ts
          </div>

        </div>

        <div class='file'>
          page-not-found
        </div>

        <div class='children'>

          <div class='file'>

            page-not-found.component.css

          </div>

          <div class='file'>

            page-not-found.component.html

          </div>

          <div class='file'>

            page-not-found.component.ts

          </div>

        </div>

      </div>

      <div class='file'>
        animations.ts
      </div>

      <div class='file'>
        app.component.css
      </div>

      <div class='file'>
        app.component.html
      </div>

      <div class='file'>
        app.component.ts
      </div>

      <div class='file'>
        app.module.ts
      </div>

      <div class='file'>
        app-routing.module.ts
      </div>

      <div class='file'>
        main.ts
      </div>

      <div class='file'>
        message.service.ts
      </div>

      <div class='file'>
        index.html
      </div>

      <div class='file'>
        styles.css
      </div>

      <div class='file'>
        tsconfig.json
      </div>

    </div>

    <div class='file'>
      node_modules ...
    </div>

    <div class='file'>
      package.json
    </div>

  </div>

</div>

<!--
Here are the relevant files for this version of the sample application.
-->
이번 예제와 관련된 파일의 내용도 확인해 보세요.

<code-tabs>

  <code-pane header="animations.ts" path="router/src/app/animations.ts">

  </code-pane>

  <code-pane header="app.component.html" path="router/src/app/app.component.2.html">

  </code-pane>

  <code-pane header="app.component.ts" path="router/src/app/app.component.2.ts">

  </code-pane>

  <code-pane header="app.module.ts" path="router/src/app/app.module.3.ts">

  </code-pane>

  <code-pane header="app-routing.module.ts" path="router/src/app/app-routing.module.2.ts" region="milestone3">

  </code-pane>

  <code-pane header="hero-list.component.css" path="router/src/app/heroes/hero-list/hero-list.component.css">

  </code-pane>

  <code-pane header="hero-list.component.html" path="router/src/app/heroes/hero-list/hero-list.component.html">

  </code-pane>

  <code-pane header="hero-list.component.ts" path="router/src/app/heroes/hero-list/hero-list.component.ts">

  </code-pane>

  <code-pane header="hero-detail.component.html" path="router/src/app/heroes/hero-detail/hero-detail.component.html">

  </code-pane>

  <code-pane header="hero-detail.component.ts" path="router/src/app/heroes/hero-detail/hero-detail.component.3.ts">

  </code-pane>

  <code-pane header="hero.service.ts" path="router/src/app/heroes/hero.service.ts">

  </code-pane>

  <code-pane header="heroes.module.ts" path="router/src/app/heroes/heroes.module.ts">

  </code-pane>

  <code-pane header="heroes-routing.module.ts" path="router/src/app/heroes/heroes-routing.module.2.ts">

  </code-pane>

  <code-pane header="message.service.ts" path="router/src/app/message.service.ts">

  </code-pane>

</code-tabs>



{@a milestone-4}


<!--
## Milestone 4: Crisis center feature
-->
## 4단계: 위기대응센터 기능모듈

<!--
It's time to add real features to the app's current placeholder crisis center.

Begin by imitating the heroes feature:

* Create a `crisis-center` subfolder in the `src/app` folder.
* Copy the files and folders from `app/heroes` into the new `crisis-center` folder.
* In the new files, change every mention of "hero" to "crisis", and "heroes" to "crises".
* Rename the NgModule files to `crisis-center.module.ts` and `crisis-center-routing.module.ts`.

You'll use mock crises instead of mock heroes:
-->
이번에는 애플리케이션에 위기대응센터 기능 모듈을 추가해 봅시다.

이 모듈은 히어로 기능 모듈을 구현했던 방식과 비슷하게 구현합니다.

* `src/app` 폴더에 `crisis-center` 폴더를 생성합니다.
* `app/heroes` 폴더에 있는 파일들을 `crisis-center` 폴더에 복사합니다.
* 복사한 파일에서 "hero" 키워드를 "crisis"로, "heroes" 키워드를 "crises"로 변경합니다.
* NgModule이 정의된 파일들의 이름을 `crisis-center.module.ts`와 `crisis-center-routing.module.ts`로 변경합니다.

그리고 히어로 모킹 목록 대신 다음과 같은 모킹 목록을 사용합니다:

<code-example path="router/src/app/crisis-center/mock-crises.ts" header="src/app/crisis-center/mock-crises.ts">

</code-example>

<!--
The resulting crisis center is a foundation for introducing a new concept&mdash;**child routing**.
You can leave *Heroes* in its current state as a contrast with the *Crisis Center*
and decide later if the differences are worthwhile.
-->
이제부터 위기대응센터를 만들면서 **자식 라우팅**에 대한 컨셉을 알아봅시다.
이전에 구현했던 *히어로* 기능 모듈은 새로 만드는 *위기대응센터* 기능 모듈과 비교해보기 위해 그대로 둔 채 작업합니다.

<div class="alert is-helpful">


<!--
In keeping with the
<a href="https://blog.8thlight.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html" title="Separation of Concerns">*Separation of Concerns* principle</a>,
changes to the *Crisis Center* won't affect the `AppModule` or
any other feature's component.
-->
<a href="https://blog.8thlight.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html" title="Separation of Concerns">*관심의 분리 (Separation of Concerns)* 원칙</a>에 따라 *위기대응센터*에 대한 코드를 수정하는 것은 `AppModule`과 다른 기능 모듈의 컴포넌트에 영향을 주지 않는 것으로 간주합니다.

</div>



{@a crisis-child-routes}

<!--
### A crisis center with child routes
-->
### 위기대응센터와 자식 라우팅 규칙

<!--
This section shows you how to organize the crisis center
to conform to the following recommended pattern for Angular applications:

* Each feature area resides in its own folder.
* Each feature has its own Angular feature module.
* Each area has its own area root component.
* Each area root component has its own router outlet and child routes.
* Feature area routes rarely (if ever) cross with routes of other features.

If your app had many feature areas, the app component trees might look like this:
-->
이번 섹션에서는 Angular가 권장하는 방식으로 위기관리센터 기능모듈을 개발해 봅시다:

* 특정 업무 도메인과 관련된 항목들은 모두 한 폴더에 둡니다.
* 특정 업무 도메인은 Angular 기능 모듈로 표현합니다.
* 각 기능 모듈에는 최상위 컴포넌트가 존재합니다.
* 각 기능 모듈의 최상위 컴포넌트에는 라우팅 영역이 존재하며, 자식 라우팅 규칙도 존재합니다.
* 특정 기능 모듈의 라우팅 규칙은 다른 기능 모듈로 이동하는 라우팅 규칙을 최대한 사용하지 않는 것이 좋습니다.

그래서 애플리케이션에 많은 기능이 추가된다면 컴포넌트 트리가 다음과 같은 모습이 될 것입니다:

<figure>
  <img src='generated/images/guide/router/component-tree.png' alt="Component Tree">
</figure>



{@a child-routing-component}

<!--
### Child routing component
-->
### 자식 라우팅 컴포넌트

<!--
Generate a `CrisisCenter` component in the `crisis-center` folder:
-->
다음 명령을 실행해서 `crisis-center` 폴더에 `CrisisCenter` 컴포넌트를 생성합니다:

<code-example language="none" class="code-shell">
  ng generate component crisis-center/crisis-center
</code-example>

<!--
Update the component template to look like this:
-->
그리고 이 컴포넌트의 템플릿을 다음과 같이 작성합니다:

<code-example path="router/src/app/crisis-center/crisis-center/crisis-center.component.html" linenums="false" header="src/app/crisis-center/crisis-center/crisis-center.component.html">
</code-example>

<!--
The `CrisisCenterComponent` has the following in common with the `AppComponent`:

* It is the *root* of the crisis center area,
just as `AppComponent` is the root of the entire application.
* It is a *shell* for the crisis management feature area,
just as the `AppComponent` is a shell to manage the high-level workflow.

Like most shells, the `CrisisCenterComponent` class is very simple, simpler even than `AppComponent`:
it has no business logic, and its template has no links, just a title and
`<router-outlet>` for the crisis center child component.
-->
`CrisisCenterComponent`는 다음과 같은 점에서 `AppComponent`와 비슷합니다:

* 애플리케이션 전체 영역에서 `AppComponent`가 최상위 컴포넌트인 것처럼, 이 컴포넌트는 위기대응센터와 관련된 기능모듈의 *최상위* 컴포넌트입니다.
* 애플리케이션이 동작하는 영역이 `AppComponent`인 것처럼, 이 컴포넌트는 위기대응센터와 관련된 기능이 동작하는 영역입니다.

영역만 정의하는 컴포넌트의 역할에 맞게, `CrisisCenterComponent` 클래스는 아주 간단하게 작성합니다. 이 클래스에는 비즈니스 로직이 없고 템플릿에 링크도 없으며, 단지 이 기능의 이름과 자식 컴포넌트가 표시될 `<router-outlet>`만 존재합니다. `AppComponent`보다도 간단합니다.

{@a child-route-config}


<!--
### Child route configuration
-->
### 자식 라우팅 규칙

<!--
As a host page for the "Crisis Center" feature, generate a `CrisisCenterHome` component in the `crisis-center` folder.
-->
"위기대응센터" 기능 모듈의 첫 페이지는 `crisis-center` 폴더의 `CrisisCenterHome` 컴포넌트가 담당합니다. 다음 명령을 실행해서 이 컴포넌트를 생성합니다.

<code-example language="none" class="code-shell">
  ng generate component crisis-center/crisis-center-home
</code-example>

<!--
Update the template with a welcome message to the `Crisis Center`.
-->
그리고 이 컴포넌트의 템플릿을 다음과 같이 수정합니다.

<code-example path="router/src/app/crisis-center/crisis-center-home/crisis-center-home.component.html" linenums="false" header="src/app/crisis-center/crisis-center-home/crisis-center-home.component.html">
</code-example>

<!--
Update the `crisis-center-routing.module.ts` you renamed after copying it from `heroes-routing.module.ts` file.
This time, you define **child routes** *within* the parent `crisis-center` route.
-->
`heroes-routing.module.ts` 파일을 복사해서 가져온 `crisis-center-routing.module.ts` 파일의 내용을 수정합시다.
이 예제에서 정의하는 **자식 라우팅 규칙**은 모두 `crisis-center` 주소의 하위 주소로 구성됩니다.

<code-example path="router/src/app/crisis-center/crisis-center-routing.module.1.ts" linenums="false" header="src/app/crisis-center/crisis-center-routing.module.ts (Routes)" region="routes">
</code-example>

<!--
Notice that the parent `crisis-center` route has a `children` property
with a single route containing the `CrisisListComponent`. The `CrisisListComponent` route
also has a `children` array with two routes.

These two routes navigate to the crisis center child components,
`CrisisCenterHomeComponent` and `CrisisDetailComponent`, respectively.
-->
`crisis-center` 주소에 해당하는 라우팅 규칙에는 `CrisisListComponent` 컴포넌트가 연결되어 있으며, `children` 프로퍼티도 존재합니다. `CrisisListComponent` 라우팅 규칙은 `children` 배열에 정의된 라우팅 규칙 두 개를 처리합니다.

그리고 `CrisisListComponent` 라우팅 규칙의 자식 라우팅 규칙은 `CrisisCenterHomeComponent`와 `CrisisDetailComponent`와 연결됩니다.

<!--
There are *important differences* in the way the router treats these _child routes_.

The router displays the components of these routes in the `RouterOutlet`
of the `CrisisCenterComponent`, not in the `RouterOutlet` of the `AppComponent` shell.

The `CrisisListComponent` contains the crisis list and a `RouterOutlet` to
display the `Crisis Center Home` and `Crisis Detail` route components.

The `Crisis Detail` route is a child of the `Crisis List`. The router [reuses components](#reuse)
by default, so the `Crisis Detail` component will be re-used as you select different crises.
In contrast, back in the `Hero Detail` route, [the component was recreated](#snapshot-the-no-observable-alternative) each time you selected a different hero from the list of heroes.
-->
이 때 _자식 라우팅 규칙_ 을 처리하면서 `AppComponent`에서 했던 것과 *다른 점*이 있습니다.

자식 라우팅으로 정의된 컴포넌트는 `AppComponent`의 `RouterOutlet`이 아니라 `CrisisCenterComponent`의 `RouterOutlet`에 표시됩니다.

`CrisisListComponent`는 발생한 위기들의 목록을 표시하면서 `RouterOutlet`에 `위기대응센터 홈` 컴포넌트나 `위기 상세정보` 컴포넌트를 표시할 것입니다.

`위기 상세정보`에 연결된 라우팅 규칙은 `위기 목록`의 자식 라우팅 규칙입니다. 기본적으로 `위기 상세정보` 라우팅 규칙은 [재사용되는 컴포넌트](#reuse)이며, 사용자가 위기 목록에서 특정 위기를 선택할 때마다 재사용될 것입니다.
하지만 이와 다르게 `Hero Detail` 라우팅 규칙은 사용자가 히어로 목록에서 특정 히어로를 선택할 때마다 [인스턴스가 다시 생성됩니다](#snapshot-the-no-observable-alternative).

<!--
At the top level, paths that begin with `/` refer to the root of the application.
But child routes *extend* the path of the parent route.
With each step down the route tree,
you add a slash followed by the route path, unless the path is _empty_.

Apply that logic to navigation within the crisis center for which the parent path is `/crisis-center`.

* To navigate to the `CrisisCenterHomeComponent`, the full URL is `/crisis-center` (`/crisis-center` + `''` + `''`).

* To navigate to the `CrisisDetailComponent` for a crisis with `id=2`, the full URL is
`/crisis-center/2` (`/crisis-center` + `''` +  `'/2'`).

The absolute URL for the latter example, including the `localhost` origin, is
-->
애플리케이션 최상위 계층의 URL은 `/`로 시작합니다.
하지만 자식 라우팅 규칙은 부모 라우팅 규칙을 *확장*하는 개념이기 때문에 `/`로 시작하지 않습니다.
자식 라우팅 규칙의 단계를 따라가면서 _빈 주소가 지정되어도_ 이 경로들은 슬래시(`/`)로 조합됩니다.

이 개념을 적용하면 위기대응센터 기능모듈이 시작되는 주소를 `/crisis-center`로 지정할 수 있습니다.

* `CrisisCenterHomeComponent`가 표시되는 페이지로 이동하는 전체 URL은 `/crisis-center` (`/crisis-center` + `''` + `''`) 입니다.

* `id=2`인 `CrisisDetailComponent`가 표시되는 페이지로 이동하는 전체 URL은 `/crisis-center/2` (`/crisis-center` + `''` +  `'/2'`) 입니다.

그리고 절대 URL은 `localhost`와 같은 도메인을 포함해야 하기 때문에 다음과 같습니다.

<code-example>
  localhost:4200/crisis-center/2

</code-example>


<!--
Here's the complete `crisis-center-routing.module.ts` file with its imports.
-->
이 내용이 모두 구성된 `crisis-center-routing.module.ts` 파일의 내용은 다음과 같습니다.

<!--
<code-example path="router/src/app/crisis-center/crisis-center-routing.module.1.ts" linenums="false" header="src/app/crisis-center/crisis-center-routing.module.ts (excerpt)">
-->
<code-example path="router/src/app/crisis-center/crisis-center-routing.module.1.ts" linenums="false" header="src/app/crisis-center/crisis-center-routing.module.ts (일부)">

</code-example>



{@a import-crisis-module}

<!--
### Import crisis center module into the *AppModule* routes
-->
### *AppModule* 라우팅 규칙에 위기대응센터 모듈 로드하기

<!--
As with the `HeroesModule`, you must add the `CrisisCenterModule` to the `imports` array of the `AppModule`
_before_ the `AppRoutingModule`:
-->
`HeroesModule`과 마찬가지로 `CrisisCenterModule`도 `AppModule`의 `imports` 배열에 로드해야 하는데, 이 때 `AppRoutingModule`보다 _먼저_ 로드해야 합니다:

<code-tabs>

  <code-pane path="router/src/app/crisis-center/crisis-center.module.ts"header="src/app/crisis-center/crisis-center.module.ts">

  </code-pane>

  <!--
  <code-pane path="router/src/app/app.module.4.ts" linenums="false" header="src/app/app.module.ts (import CrisisCenterModule)" region="crisis-center-module">
  -->
  <code-pane path="router/src/app/app.module.4.ts" linenums="false" header="src/app/app.module.ts (CrisisCenterModule 로드)" region="crisis-center-module">

  </code-pane>

</code-tabs>

<!--
Remove the initial crisis center route from the `app-routing.module.ts`.
The feature routes are now provided by the `HeroesModule` and the `CrisisCenter` modules.

The `app-routing.module.ts` file retains the top-level application routes such as the default and wildcard routes.
-->
그리고 `app-routing.module.ts`에 정의했던 `crisis-center` 라우팅 규칙을 제거합니다.
이제 기능 모듈과 관련된 라우팅 규칙은 `HeroesModule`과 `CrisisCenterModule`이 담당합니다.

`app-routing.module.ts` 파일에는 이제 애플리케이션 최상위 계층에 해당하는 기본 라우팅 규칙과 와일드카드 라우팅 규칙만 남게 됩니다.

<code-example path="router/src/app/app-routing.module.3.ts" linenums="false" header="src/app/app-routing.module.ts (v3)" region="v3">

</code-example>




{@a relative-navigation}

<!--
### Relative navigation
-->
### 상대주소로 이동하기

<!--
While building out the crisis center feature, you navigated to the
crisis detail route using an **absolute path** that begins with a _slash_.

The router matches such _absolute_ paths to routes starting from the top of the route configuration.

You could continue to use absolute paths like this to navigate inside the *Crisis Center*
feature, but that pins the links to the parent routing structure.
If you changed the parent `/crisis-center` path, you would have to change the link parameters array.

You can free the links from this dependency by defining paths that are **relative** to the current URL segment.
Navigation _within_ the feature area remains intact even if you change the parent route path to the feature.

Here's an example:
-->
위기대응센터 기능모듈을 구현하기 전에는 라우팅 규칙에 _슬래시(`/`)_ 로 시작하는 **절대 주소**를 사용했습니다.

이렇게 구현하면 라우터는 애플리케이션 최상위 URL부터 시작하는 _절대_ 주소를 연결합니다.

물론 *위기대응센터* 모듈 안에서 네비게이션할 때도 절대주소를 사용할 수 있지만, 이 방식은 `/crisis-center` 주소부터 시작되는 라우팅 전체 구조를 이 모듈이 알아야 합니다.
그리고 `/crisis-center` 주소를 다른 주소로 변경하면 이 주소와 관련된 모든 주소를 변경해야 합니다.

그래서 특정 모듈에서 정의하는 라우팅 규칙이 상위 라우팅 규칙과 의존성을 갖는 것을 피하려면 **상대** 주소로 지정하는 것이 좋습니다.
그러면 해당 모듈 안에서 정의하는 모든 라우팅 주소는 상위 라우팅 규칙과 독립적으로 구성할 수 있습니다.

상대 주소를 사용하면 다음과 같이 구현합니다:

<div class="alert is-helpful">


<!--
The router supports directory-like syntax in a _link parameters list_ to help guide route name lookup:

`./` or `no leading slash` is relative to the current level.

`../` to go up one level in the route path.

You can combine relative navigation syntax with an ancestor path.
If you must navigate to a sibling route, you could use the `../<sibling>` convention to go up
one level, then over and down the sibling route path.
-->
라우터는 폴더 구조에 사용하는 것과 비슷한 문법을 지원합니다.

`./`나 `슬래시 없이` 사용하면 현재 계층을 가리킵니다.

`../`는 한단계 위 계층의 주소를 가리킵니다.

이 주소들은 문자열과 조합해서 사용할 수도 있습니다.
그래서 이웃한 라우팅 주소로 이동하려면 한단계 위 계층에서 이웃한 라우팅 주소를 가리키는 의미로 `../<이웃>` 이라고 사용할 수 있습니다.

</div>


<!--
To navigate a relative path with the `Router.navigate` method, you must supply the `ActivatedRoute`
to give the router knowledge of where you are in the current route tree.

After the _link parameters array_, add an object with a `relativeTo` property set to the `ActivatedRoute`.
The router then calculates the target URL based on the active route's location.
-->
`Router.navigate` 함수에 상대주소를 사용하려면 라우팅 트리에서 현재 위치를 알아내기 위해 `ActivatedRoute`를 참고해야 합니다.

그리고 이렇게 찾아온 라우팅 규칙을 `navigate` 함수에 인자로 전달하는 _링크 인자 배열_ 뒤에 객체 형태로 전달하는데, `relativeTo` 프로퍼티에 이 라우팅 규칙을 전달하면, 라우터가 현재 활성화된 라우팅 규칙을 기준으로 상대 주소를 계산합니다.

<div class="alert is-helpful">


<!--
**Always** specify the complete _absolute_ path when calling router's `navigateByUrl` method.
-->
라우터가 제공하는 `navigateByUrl` 메소드는 **언제나** _절대_ 주소를 기준으로 이동합니다.

</div>



{@a nav-to-crisis}

<!--
### Navigate to crisis list with a relative URL
-->
### 상대주소를 사용해서 목록 화면으로 이동하기

<!--
You've already injected the `ActivatedRoute` that you need to compose the relative navigation path.

When using a `RouterLink` to navigate instead of the `Router` service, you'd use the _same_
link parameters array, but you wouldn't provide the object with the `relativeTo` property.
The `ActivatedRoute` is implicit in a `RouterLink` directive.


Update the `gotoCrises` method of the `CrisisDetailComponent` to navigate back to the *Crisis Center* list using relative path navigation.
-->
이전 코드에서는 상대주소로 이동하기 위해 `ActivatedRoute`를 컴포넌트에 의존성으로 주입했습니다.

그리고 `Router` 서비스 대신 `RouterLink`를 사용해도 이전과 _같은_ 링크 인자 배열을 전달하는데, 이번에는 이전에 사용하지 않았던 `relativeTo` 프로퍼티를 함께 사용합니다.
이 시점에 존재하는 `ActivatedRoute`는 `RouterLink` 디렉티브의 동작에 영향을 미칩니다.

`CrisisDetailComponent`에 정의된 `gotoCrises` 메소드를 수정해서 상대주소를 사용하는 방법으로 *위기대응센터* 화면으로 이동해 봅시다.

<!--
<code-example path="router/src/app/crisis-center/crisis-detail/crisis-detail.component.ts" linenums="false" header="src/app/crisis-center/crisis-detail/crisis-detail.component.ts (relative navigation)" region="gotoCrises-navigate">
-->
<code-example path="router/src/app/crisis-center/crisis-detail/crisis-detail.component.ts" linenums="false" header="src/app/crisis-center/crisis-detail/crisis-detail.component.ts (상대 주소로 이동)" region="gotoCrises-navigate">

</code-example>

<!--
Notice that the path goes up a level using the `../` syntax.
If the current crisis `id` is `3`, the resulting path back to the crisis list is  `/crisis-center/;id=3;foo=foo`.
-->
이`../`을 사용했기 때문에 주소는 한단계 위 계층부터 시작된다는 것을 잊지 마세요.
`id`가 `3`이라면 최종 경로는 `/crisis-center/;id=3;foo=foo`가 됩니다.

{@a named-outlets}


<!--
### Displaying multiple routes in named outlets
-->
### 이름을 지정해서 라우팅 영역 여러개 표시하기

<!--
You decide to give users a way to contact the crisis center.
When a user clicks a "Contact" button, you want to display a message in a popup view.

The popup should stay open, even when switching between pages in the application, until the user closes it
by sending the message or canceling.
Clearly you can't put the popup in the same outlet as the other pages.

Until now, you've defined a single outlet and you've nested child routes
under that outlet to group routes together.
The router only supports one primary _unnamed_ outlet per template.

A template can also have any number of _named_ outlets.
Each named outlet has its own set of routes with their own components.
Multiple outlets can be displaying different content, determined by different routes, all at the same time.

Add an outlet named "popup" in the `AppComponent`, directly below the unnamed outlet.
-->
이번에는 위기대응센터에 직접 연락할 수 있는 기능을 구현해 봅시다.
사용자가 "Contact" 버튼을 클릭하면 팝업을 띄워서 위기대응센터로 보낼 메시지를 입력하게 하려고 합니다.

그런데 이 팝업은 사용자가 메시지를 보내거나 취소해서 닫지 않는 한 다른 페이지로 이동해도 계속 떠있게 하려고 합니다.
그래서 이 팝업은 페이지를 표시하는 라우팅 영역에 함께 넣을 수 없습니다.

하지만 지금까지는 라우팅 영역을 하나만 두는 방법이나, 이 라우팅 영역 아래 자식 라우팅 규칙을 적용하는 방법만 다뤘습니다.
기본적으로 라우팅 영역에 _이름을 지정하지 않으면_ 템플릿에 있는 라우팅 영역 중 하나만 동작합니다.

라우팅 영역에 _이름을 지정하면_ 템플릿에 있는 여러 라우팅 영역을 동시에 조작할 수 있습니다.
이 방식을 활용하면 각각의 라우팅 영역에 서로 다른 라우팅 규칙을 적용해서 여러 컴포넌트를 동시에 표시할 수 있습니다.

`AppComponent`에 있는 이름없는 라우팅 영역 바로 아래 "popup"이라는 이름으로 라우팅 영역을 추가해 봅시다.

<code-example path="router/src/app/app.component.4.html" linenums="false" header="src/app/app.component.html (outlets)" region="outlets">

</code-example>


<!--
That's where a popup will go, once you learn how to route a popup component to it.
-->
팝업은 이 라우팅 영역에 들어갈 것입니다. 이제부터 팝업 컴포넌트를 표시하기 위해 라우팅 규칙을 어떻게 활용해야 하는지 알아봅시다.

{@a secondary-routes}


<!--
#### Secondary routes
-->
#### 서브 라우팅 규칙 (Secondary routes)

<!--
Named outlets are the targets of  _secondary routes_.

Secondary routes look like primary routes and you configure them the same way.
They differ in a few key respects.

* They are independent of each other.
* They work in combination with other routes.
* They are displayed in named outlets.

Generate a new component to compose the message.
-->
방금 이름을 지정해서 만든 라우팅 영역은 _서브 라우팅 규칙_ 의 타겟이 될 것입니다.

서브 라우팅 규칙은 기본 라우팅 규칙을 사용하는 것과 거의 비슷합니다.
그러나 다른 점도 있습니다.

* 서브 라우팅 규칙은 다른 라우팅 규칙과 독립적으로 동작합니다.
* 다른 라우팅 규칙과 조합할 수 있습니다.
* 서브 라우팅 규칙에 연결된 컴포넌트는 이름을 지정한 라우팅 영역에 표시됩니다.

다음 명령을 실행해서 메시지를 입력받을 컴포넌트를 생성합니다.

<code-example language="none" class="code-shell">
  ng generate component compose-message
</code-example>

<!--
It displays a simple form with a header, an input box for the message,
and two buttons, "Send" and "Cancel".
-->
이 컴포넌트에는 간단한 헤더와 메시지를 입력받을 입력 필드, "Send" 버튼과 "Cancel" 버튼이 존재합니다.

<figure>
  <img src='generated/images/guide/router/contact-popup.png' alt="Contact popup">
</figure>


<!--
Here's the component, its template and styles:
-->
이 컴포넌트 템플릿과 스타일은 다음과 같이 작성합니다.

<code-tabs>

  <code-pane header="src/app/compose-message/compose-message.component.css" path="router/src/app/compose-message/compose-message.component.css">

  </code-pane>

  <code-pane header="src/app/compose-message/compose-message.component.html" path="router/src/app/compose-message/compose-message.component.html">

  </code-pane>

  <code-pane header="src/app/compose-message/compose-message.component.ts" path="router/src/app/compose-message/compose-message.component.ts">

  </code-pane>

</code-tabs>


<!--
It looks about the same as any other component you've seen in this guide.
There are two noteworthy differences.

Note that the `send()` method simulates latency by waiting a second before "sending" the message and closing the popup.

The `closePopup()` method closes the popup view by navigating to the popup outlet with a `null`.
That's a peculiarity covered [below](#clear-secondary-routes).
-->
이 컴포넌트의 내용은 지금까지 봤던 다른 컴포넌트와 거의 비슷하며, 두가지 정도가 다릅니다.

`send()` 메소드는 서버와 통신하는 것을 흉내내기 위해 시간을 약간 지연한 후에 팝업을 닫습니다.

`closePopup()` 메소드는 팝업 라우팅 영역의 값을 `null`로 할당하면서 팝업을 닫습니다.
이 내용은 약간 이상해 보이지만 [아래](#clear-secondary-routes)에서 자세하게 다룹니다.

{@a add-secondary-route}

<!--
#### Add a secondary route
-->
#### 서브 라우팅 규칙 추가하기

<!--
Open the `AppRoutingModule` and add a new `compose` route to the `appRoutes`.
-->
`AppRoutingModule`을 열고 `appRoutes`에 `compose` 라우팅 규칙을 추가합니다.

<!--
<code-example path="router/src/app/app-routing.module.3.ts" linenums="false" header="src/app/app-routing.module.ts (compose route)" region="compose">
-->
<code-example path="router/src/app/app-routing.module.3.ts" linenums="false" header="src/app/app-routing.module.ts (compose 라우팅 규칙)" region="compose">

</code-example>


<!--
The `path` and `component` properties should be familiar.
There's a new property, `outlet`, set to `'popup'`.
This route now targets the popup outlet and the `ComposeMessageComponent` will display there.

The user needs a way to open the popup.
Open the `AppComponent` and add a "Contact" link.
-->
`path`와 `component` 프로퍼티는 이제 익숙할 것입니다.
그런데 이 라우팅 규칙에는 `outlet` 프로퍼티에 `'popup'`이 할당되어 있습니다.
이제 이 라우팅 규칙은 팝업 라우팅 영역을 대상으로 동작하며 `ComposeMessageComponent`도 팝업 라우팅 영역에 표시됩니다.

사용자가 팝업을 열 방법이 필요합니다.
`AppComponent`를 열고 다음과 같이 "Contact" 링크를 추가합니다.

<!--
<code-example path="router/src/app/app.component.4.html" linenums="false" header="src/app/app.component.html (contact-link)" region="contact-link">
-->
<code-example path="router/src/app/app.component.4.html" linenums="false" header="src/app/app.component.html (contact 링크)" region="contact-link">

</code-example>


<!--
Although the `compose` route is pinned to the "popup" outlet, that's not sufficient for wiring the route to a `RouterLink` directive.
You have to specify the named outlet in a _link parameters array_ and bind it to the `RouterLink` with a property binding.

The _link parameters array_ contains an object with a single `outlets` property whose value
is another object keyed by one (or more) outlet names.
In this case there is only the "popup" outlet property and its value is another _link parameters array_ that specifies the `compose` route.

You are in effect saying, _when the user clicks this link, display the component associated with the `compose` route in the `popup` outlet_.
-->
그런데 `compose` 라우팅 규칙에 "popup" 라우팅 영역을 연결한 것만으로는 충분하지 않습니다. 이 라우팅 규칙을 `RouterLink` 디렉티브와 연결하려면 _링크 인자 배열_ 을 지정하면서 `outlets` 프로퍼티를 한 번 더 지정해야 합니다.

이 예제에 사용된 _링크 인자 배열_ 에는 `compose` 주소에 해당하는 컴포넌트가 표시될 라우팅 영역을 지정하기 위해 `outlets` 프로퍼티가 있는 객체를 사용했습니다.
이 코드에서 라우팅 영역은 "popup" 라우팅 영역만 지정되었지만, `compose` 라우팅 규칙에 따라 또 다른 _링크 인자 배열_ 이 전달될 수도 있습니다.

이제 이 코드는 _사용자가 이 링크를 클릭하면 `compose` 라우팅 규칙에 해당하는 컴포넌트를 `popup` 라우팅 영역에 표시하라_ 는 것을 의미합니다.


<div class="alert is-helpful">


<!--
This `outlets` object within an outer object was completely unnecessary
when there was only one route and one _unnamed_ outlet to think about.

The router assumed that your route specification targeted the _unnamed_ primary outlet
and created these objects for you.

Routing to a named outlet has revealed a previously hidden router truth:
you can target multiple outlets with multiple routes in the same `RouterLink` directive.

You're not actually doing that here.
But to target a named outlet, you must use the richer, more verbose syntax.
-->
만약 템플릿에 라우팅 영역이 하나만 있고 이 라우팅 영역에 _이름이 지정되지 않았다면_ `outlets` 객체는 필요없습니다.

왜냐하면 라우터는 기본적으로 _이름이 지정되지 않은_ 기본 라우팅 영역을 대상으로 동작하기 때문에 `outlets` 객체가 라우터 내부적으로 생성되기 때문입니다.

라우팅 영역에 이름을 지정하는 것을 활용하면 라우터를 다른 방식으로 활용할 수도 있습니다:
이 방식을 활용하면 `RouterLink` 디렉티브 하나로 여러 라우팅 영역에 서로 다른 라우팅 규칙을 적용할 수 있습니다.

물론 당장 이렇게 구현할 필요는 없습니다.
하지만 라우팅 영역에 이름을 지정하는 방식을 활용하면 Angular 라우터 문법을 좀 더 다양하게 활용할 수 있습니다.

</div>



{@a secondary-route-navigation}

<!--
#### Secondary route navigation: merging routes during navigation
-->
#### 서브 라우팅 규칙 활용하기: 라우팅 규칙 머지하기

<!--
Navigate to the _Crisis Center_ and click "Contact".
you should see something like the following URL in the browser address bar.
-->
_위기대응센터_ 로 이동해서 "Contact" 버튼을 클릭해 봅시다.
그러면 브라우저의 주소표시줄에 다음과 같은 URL이 적용되는 것을 확인할 수 있습니다.

<code-example>
  http://.../crisis-center(popup:compose)

</code-example>


<!--
The interesting part of the URL follows the `...`:

* The `crisis-center` is the primary navigation.
* Parentheses surround the secondary route.
* The secondary route consists of an outlet name (`popup`), a `colon` separator, and the secondary route path (`compose`).

Click the _Heroes_ link and look at the URL again.
-->
여기에서 `...` 뒤에 붙는 주소가 중요합니다:

* `crisis-center`는 기본 라우팅 주소입니다.
* 서브 라우팅 규칙은 괄호(`(`, `)`)로 묶입니다.
* 서브 라우팅 규칙은 라우팅 영역의 이름(`popup`)과 구분자(`:`), 서브 라우팅 규칙의 주소(`compose`)로 구성됩니다.

그리고 `Heroes` 링크를 클릭하면 URL이 다음과 같이 변경됩니다.

<code-example>
  http://.../heroes(popup:compose)
</code-example>


<!--
The primary navigation part has changed; the secondary route is the same.

The router is keeping track of two separate branches in a navigation tree and generating a representation of that tree in the URL.

You can add many more outlets and routes, at the top level and in nested levels, creating a navigation tree with many branches.
The router will generate the URL to go with it.

You can tell the router to navigate an entire tree at once by filling out the `outlets` object mentioned above.
Then pass that object inside a _link parameters array_  to the `router.navigate` method.

Experiment with these possibilities at your leisure.
-->
기본 라우팅 주소는 변경되었지만 서브 라우팅 주소는 변경되지 않았습니다.

이 때 라우터는 네비게이션 트리를 이중으로 관리하면서 기본 라우팅 규칙과 서브 라우팅 규칙에 해당하는 URL을 자동으로 조합해서 표현합니다.

원한다면 좀 더 많은 라우팅 영역에 각각 라우팅 규칙을 적용할 수 있는데, 이 때 라우팅 규칙의 어떤 계층에 이 내용이 정의되는지는 중요하지 않습니다. 라우팅 규칙은 자유롭게 구성할 수 있으며, 라우터는 이 관계를 모두 조합해서 URL을 구성할 것입니다.

그리고 위에서 언급한 것처럼 `outlets` 객체를 활용하면 모든 라우팅 영역을 한 번에 바꿀 수도 있습니다.
이 내용에 해당되는 _링크 인자 배열_ 을 `router.navigate` 메소드에 전달하면 됩니다.

어떻게 활용할 수 있는지 직접 코드를 작성하며 확인해 보세요.


{@a clear-secondary-routes}

<!--
#### Clearing secondary routes
-->
#### 서브 라우팅 규칙 해제하기

<!--
As you've learned, a component in an outlet persists until you navigate away to a new component.
Secondary outlets are no different in this regard.

Each secondary outlet has its own navigation, independent of the navigation driving the primary outlet.
Changing a current route that displays in the primary outlet has no effect on the popup outlet.
That's why the popup stays visible as you navigate among the crises and heroes.

Clicking the "send" or "cancel" buttons _does_ clear the popup view.
To see how, look at the `closePopup()` method again:
-->
지금까지 알아본 것처럼 라우팅 영역에 표시되는 컴포넌트는 다른 주소로 이동하지 않는 이상 계속 남아있습니다.
이 점은 서브 라우팅 영역도 마찬가지입니다.

서브 라우팅 영역은 기본 라우팅 영역과도 독립적인 네비게이션 로직으로 동작합니다.
그래서 기본 라우팅 영역의 주소를 변경해도 팝업 라우팅 영역은 영향을 받지 않습니다.
결국 위기대응센터 페이지와 히어로 페이지를 왔다갔다 해도 팝업은 계속 화면에 표시될 것입니다.

팝업에 있는 "send" 버튼이나 "cancel" 버튼을 누르면 팝업 뷰를 비웁니다.
`closePopup()` 메소드를 다시 한 번 봅시다:

<code-example path="router/src/app/compose-message/compose-message.component.ts" linenums="false" header="src/app/compose-message/compose-message.component.ts (closePopup)" region="closePopup">

</code-example>


<!--
It navigates imperatively with the `Router.navigate()` method, passing in a [link parameters array](#link-parameters-array).

Like the array bound to the _Contact_ `RouterLink` in the `AppComponent`,
this one includes an object with an `outlets` property.
The `outlets` property value is another object with outlet names for keys.
The only named outlet is `'popup'`.

This time, the value of `'popup'` is `null`. That's not a route, but it is a legitimate value.
Setting the popup `RouterOutlet` to `null` clears the outlet and removes
the secondary popup route from the current URL.
-->
`Router.navigate()` 메소드를 사용하려면 반드시 [링크 변수 배열](#link-parameters-array)을 전달해야 합니다.

그리고 `AppComponent`에 있는 _Contact_ `RouterLink`에 바인딩했던 것처럼, 링크 변수 배열에 `outlets` 프로퍼티가 있는 객체를 전달해야 합니다.
`outlets` 프로퍼티는 라우팅 영역의 이름이 키인 객체입니다.
그리고 지금까지 작성한 예제에는 `'popup'`이라는 라우팅 영역 하나만 존재합니다.

위 코드에서 `'popup'`에 할당된 값은 `null`입니다. 이 값이 라우팅 규칙은 아니지만 라우팅 영역을 설정할 때는 유효한 값입니다.
팝업 `RouterOutlet`의 값을 `null`로 할당하면 이 라우팅 영역을 비우기 때문에 브라우저 주소표시줄의 URL에서 서브 라우팅 규칙도 제거됩니다.

{@a guards}

<!--
## Milestone 5: Route guards
-->
## 5단계: 라우팅 가드 (Route guards)

<!--
At the moment, *any* user can navigate *anywhere* in the application *anytime*.
That's not always the right thing to do.

* Perhaps the user is not authorized to navigate to the target component.
* Maybe the user must login (*authenticate*) first.
* Maybe you should fetch some data before you display the target component.
* You might want to save pending changes before leaving a component.
* You might ask the user if it's OK to discard pending changes rather than save them.

You add _guards_ to the route configuration to handle these scenarios.

A guard's return value controls the router's behavior:

* If it returns `true`, the navigation process continues.
* If it returns `false`, the navigation process stops and the user stays put.
* If it returns a `UrlTree`, the current navigation cancels and a new navigation is initiated to the `UrlTree` returned.
-->
지금까지 작성한 애플리케이션은 *아무* 사용자가 애플리케이션의 *모든 페이지에* *아무때나* 접근할 수 있습니다.
하지만 이 방법이 언제나 괜찮은 것은 아닙니다.

* 어떤 컴포넌트는 인증받지 않은 사용자가 접근할 수 없어야 합니다.
* 어쩌면 사용자가 로그인을 먼저 해야할 수도 있습니다.
* 컴포넌트가 표시되기 전에 서버에서 데이터를 가져와야 할 수도 있습니다.
* 컴포넌트를 떠나기 전에 변경된 내용을 저장해야 하는 경우도 있습니다.
* 변경된 내용을 저장하지 않는다면 이 내용을 폐기할지 사용자에게 물어봐야 할 수도 있습니다.

이런 경우에 _라우팅 가드_ 를 사용하면 라우팅 동작을 제어할 수 있습니다.

라우팅 가드는 `boolean` 값을 반환해서 라우터의 동작을 제어합니다:

* `true`를 반환하면 네비게이션 동작을 계속합니다.
* `false`를 반환하면 네비게이션 동작을 멈춥니다.
* If it returns a `UrlTree`, the current navigation cancels and a new navigation is initiated to the `UrlTree` returned.

<div class="alert is-helpful">

**Note:** The guard can also tell the router to navigate elsewhere, effectively canceling the current navigation. When
doing so inside a guard, the guard should return `false`;
<!--
**Note:** The guard can also tell the router to navigate elsewhere, effectively canceling the current navigation.
-->
**참고:** 라우팅 가드를 사용하면 지금 동작하는 네비게이션을 취소하고 다른 곳으로 이동하게 할 수 있습니다.
이 경우에는 현재 실행되는 라우팅 가드가 `false`를 반환해야 합니다.

</div>

<!--
The guard *might* return its boolean answer synchronously.
But in many cases, the guard can't produce an answer synchronously.
The guard could ask the user a question, save changes to the server, or fetch fresh data.
These are all asynchronous operations.

Accordingly, a routing guard can return an `Observable<boolean>` or a `Promise<boolean>` and the
router will wait for the observable to resolve to `true` or `false`.
-->
라우팅 가드는 불리언 값을 동기 방식(synchronously)으로 반환할 수도 있습니다.
하지만 라우팅 가드는 동기 방식으로 값을 반환할 수 없는 경우가 더 많습니다.
사용자에게 어떤 것을 물어봐야 하거나, 서버에 변경사항을 저장하는 경우, 새로운 데이터를 가져와야 하는 경우가 그렇습니다.
이런 동작은 모두 비동기로 실행됩니다.

그래서 라우팅 가드는 `Observable<boolean>` 타입이나 `Promise<boolean>` 타입을 반환할 수 있으며, 이 타입을 사용하면 라우팅 가드의 내부 로직이 완료될 때까지 라우터의 동작이 중단됩니다.

<div class="alert is-critical">

<!--
**Note:** The observable provided to the Router _must_ also complete. If the observable does not complete, the navigation will not continue.
-->
**참고:** 라우팅 가드 내부 로직에 사용되는 옵저버블은 _반드시_ 종료되어야 합니다. 옵저버블이 종료되지 않으면 네비게이션도 진행되지 않습니다.

</div>

<!--
The router supports multiple guard interfaces:

* [`CanActivate`](api/router/CanActivate) to mediate navigation *to* a route.

* [`CanActivateChild`](api/router/CanActivateChild) to mediate navigation *to* a child route.

* [`CanDeactivate`](api/router/CanDeactivate) to mediate navigation *away* from the current route.

* [`Resolve`](api/router/Resolve) to perform route data retrieval *before* route activation.

* [`CanLoad`](api/router/CanLoad) to mediate navigation *to* a feature module loaded _asynchronously_.
-->
라우터는 몇 가지 라우팅 가드 인터페이스를 제공합니다:

* 라우팅 규칙을 *적용하는 동작*은 [`CanActivate`](api/router/CanActivate)로 제어할 수 있습니다.

* 자식 라우팅 규칙을 *적용하는 동작*은 [`CanActivateChild`](api/router/CanActivateChild)로 제어할 수 있습니다.

* 현재 라우팅 규칙에서 *벗어나는 동작*은 [`CanDeactivate`](api/router/CanDeactivate)로 제어할 수 있습니다.

* 라우팅 규칙이 *적용되기 전에* 라우팅 데이터를 받아오는 동작은 [`Resolve`](api/router/Resolve)로 제어할 수 있습니다.

* 기능 모듈을 _비동기로_ 로드하는 동작은 [`CanLoad`](api/router/CanLoad)로 제어할 수 있습니다.

<!--
You can have multiple guards at every level of a routing hierarchy.
The router checks the `CanDeactivate` and `CanActivateChild` guards first, from the deepest child route to the top.
Then it checks the `CanActivate` guards from the top down to the deepest child route. If the feature module
is loaded asynchronously, the `CanLoad` guard is checked before the module is loaded.
If _any_ guard returns false, pending guards that have not completed will be canceled,
and the entire navigation is canceled.

There are several examples over the next few sections.
-->
라우팅 가드는 라우팅 계층 어디에라도 몇개씩 자유롭게 적용할 수 있습니다.
라우터는 가장 안쪽의 자식 라우팅 규칙부터 상위 라우팅 계층을 향해 `CanDeactivate`와 `CanActivateChild` 가드를 제일 먼저 실행합니다.
그리고 최상위 라우팅 계층부터 가장 안쪽의 자식 라우팅 규칙까지 `CanActivate` 가드를 실행하는데, 이 과정에 기능 모듈이 비동기로 로드되면 이 모듈이 로드되기 전에 `CanLoad` 가드가 실행됩니다.
이 과정이 수행되면서 _어떤_ 가드에서 `false`를 반환하면 아직 실행되지 않은 라우팅 가드는 실행이 취소되며 모든 네비게이션 동작도 취소됩니다.

이 시나리오를 예제와 함께 확인해 봅시다.

{@a can-activate-guard}


<!--
### _CanActivate_: requiring authentication
-->
### _CanActivate_: 사용자 인증이 필요한 경우

<!--
Applications often restrict access to a feature area based on who the user is.
You could permit access only to authenticated users or to users with a specific role.
You might block or limit access until the user's account is activated.

The `CanActivate` guard is the tool to manage these navigation business rules.
-->
애플리케이션은 보통 특정 기능에 접근할 수 있는 사용자를 제한하는 경우가 많습니다.
그래서 사용자가 로그인을 하거나 특정 권한이 있어야 접근할 수 있도록 설정할 수 있습니다.
조건에 맞지 않으면 접근을 제한할 것입니다.

이런 네비게이션 동작은 `CanActivate` 가드를 사용해서 제어할 수 있습니다.

<!--
#### Add an admin feature module
-->
#### 관리자 기능 모듈 추가하기

<!--
In this next section, you'll extend the crisis center with some new *administrative* features.
Those features aren't defined yet.
But you can start by adding a new feature module named `AdminModule`.

Generate an `admin` folder with a feature module file and a routing configuration file.
-->
이번 섹션에서는 위기대응센터에 *관리자* 기능을 추가해 봅시다.
관리자 기능 모듈은 아직 정의되지 않았습니다.
그래서 `AdminModule`이라는 기능모듈을 생성하는 것부터 시작합니다.

다음 명령을 실행해서 `admin` 폴더와 `AdminModule`을 생성하고 이 때 라우팅 설정 파일도 함께 생성합니다.

<code-example language="none" class="code-shell">
  ng generate module admin --routing
</code-example>

<!--
Next, generate the supporting components.
-->
그리고 관련 컴포넌트들을 생성합니다.

<code-example language="none" class="code-shell">
  ng generate component admin/admin-dashboard
</code-example>

<code-example language="none" class="code-shell">
  ng generate component admin/admin
</code-example>

<code-example language="none" class="code-shell">
  ng generate component admin/manage-crises
</code-example>

<code-example language="none" class="code-shell">
  ng generate component admin/manage-heroes
</code-example>

<!--
The admin feature file structure looks like this:
-->
그러면 다음과 같이 관리자 모듈이 구성될 것입니다:

<div class='filetree'>

  <div class='file'>
    src/app/admin
  </div>

  <div class='children'>

    <div class='file'>
      admin
    </div>

      <div class='children'>

        <div class='file'>
          admin.component.css
        </div>

        <div class='file'>
          admin.component.html
        </div>

        <div class='file'>
          admin.component.ts
        </div>

      </div>

    <div class='file'>
      admin-dashboard
    </div>

      <div class='children'>

        <div class='file'>
          admin-dashboard.component.css
        </div>

        <div class='file'>
          admin-dashboard.component.html
        </div>

        <div class='file'>
          admin-dashboard.component.ts
        </div>

      </div>

    <div class='file'>
      manage-crises
    </div>

      <div class='children'>

        <div class='file'>
          manage-crises.component.css
        </div>

        <div class='file'>
          manage-crises.component.html
        </div>

        <div class='file'>
          manage-crises.component.ts
        </div>

      </div>

    <div class='file'>
      manage-heroes
    </div>

      <div class='children'>

        <div class='file'>
          manage-heroes.component.css
        </div>

        <div class='file'>
          manage-heroes.component.html
        </div>

        <div class='file'>
          manage-heroes.component.ts
        </div>

      </div>

    <div class='file'>
      admin.module.ts
    </div>

    <div class='file'>
      admin-routing.module.ts
    </div>

  </div>

</div>


<!--
The admin feature module contains the `AdminComponent` used for routing within the
feature module, a dashboard route and two unfinished components to manage crises and heroes.
-->
관리자 모듈의 진입점은 `AdminComponent`입니다. 그리고 이 모듈에는 대시보드 컴포넌트와 위기를 관리하는 컴포넌트, 히어로를 관리하는 컴포넌트가 존재합니다.

<code-tabs>

  <code-pane header="src/app/admin/admin/admin.component.html" linenums="false"  path="router/src/app/admin/admin/admin.component.html">

  </code-pane>

  <code-pane header="src/app/admin/admin-dashboard/admin-dashboard.component.html" linenums="false" path="router/src/app/admin/admin-dashboard/admin-dashboard.component.1.html">

  </code-pane>

  <code-pane header="src/app/admin/admin.module.ts" path="router/src/app/admin/admin.module.ts">

  </code-pane>

  <code-pane header="src/app/admin/manage-crises/manage-crises.component.html" linenums="false" path="router/src/app/admin/manage-crises/manage-crises.component.html">

  </code-pane>

  <code-pane header="src/app/admin/manage-heroes/manage-heroes.component.html" linenums="false"  path="router/src/app/admin/manage-heroes/manage-heroes.component.html">

  </code-pane>

</code-tabs>



<div class="alert is-helpful">


<!--
Although the admin dashboard `RouterLink` only contains a relative slash without an additional URL segment, it
is considered a match to any route within the admin feature area. You only want the `Dashboard` link to be active when the user visits that route. Adding an additional binding to the `Dashboard` routerLink,`[routerLinkActiveOptions]="{ exact: true }"`, marks the `./` link as active when the user navigates to the `/admin` URL and not when navigating to any of the child routes.
-->
대시보드로 이동하는 `RouterLink`에는 추가 URL 없이 현재 위치를 가리키는 상대주소가 지정되었는데, 이 주소는 관리자 기능 모듈의 진입 주소인 `/admin`을 가리킵니다.
사용자가 이 링크를 클릭하면 `Dashboard`가 화면에 표시될 것입니다.
이 동작을 위해 `Dashboard`로 이동하는 라우터 링크에는 `[routerLinkActiveOptions]="{ exact: true }"` 옵션이 사용되었습니다. 이제 사용자가 자식 라우팅 주소로 이동하지 않고 `/admin` URL로 이동하면 대시보드가 화면에 표시됩니다.

</div>


{@a component-less-route}

<!--
##### Component-less route: grouping routes without a component
-->
##### 컴포넌트가 없는 라우팅 규칙: 라우팅 규칙을 그룹으로 묶기

<!--
The initial admin routing configuration:
-->
관리자 모듈의 초기 라우팅 설정은 다음과 같습니다:

<!--
<code-example path="router/src/app/admin/admin-routing.module.1.ts" linenums="false" header="src/app/admin/admin-routing.module.ts (admin routing)" region="admin-routes">
-->
<code-example path="router/src/app/admin/admin-routing.module.1.ts" linenums="false" header="src/app/admin/admin-routing.module.ts (관리자 모듈의 라우팅 규칙)" region="admin-routes">

</code-example>

<!--
Looking at the child route under the `AdminComponent`, there is a `path` and a `children`
property but it's not using a `component`.
You haven't made a mistake in the configuration.
You've defined a _component-less_ route.

The goal is to group the `Crisis Center` management routes under the `admin` path.
You don't need a component to do it.
A _component-less_ route makes it easier to [guard child routes](#can-activate-child-guard).


Next, import the `AdminModule` into `app.module.ts` and add it to the `imports` array
to register the admin routes.
-->
`AdminComponent`의 자식 라우팅 규칙 중에는 `path`와 `children` 프로퍼티가 있지만 `component`가 없는 라우팅 규칙이 있습니다.
이 라우팅 규칙은 잘못 작성한 것이 아니라 _컴포넌트가 없는_ 라우팅 규칙을 정의한 것입니다.

이 라우팅 규칙을 사용한 목적은 `위기대응센터`과 관리하는 모든 라우팅 규칙을 `admin` 주소 안으로 묶기 위한 것입니다.
이런 용도로 사용할 때 이 라우팅 규칙에  컴포넌트를 지정할 필요는 없습니다.
_컴포넌트가 없는_ 라우팅 규칙은 [자식 라우팅 규칙에 적용하는 라우팅 가드](#can-activate-child-guard)를 좀 더 편하게 지정하기 위해 사용합니다.

<!--
<code-example path="router/src/app/app.module.4.ts" linenums="false" header="src/app/app.module.ts (admin module)" region="admin-module">
-->
<code-example path="router/src/app/app.module.4.ts" linenums="false" header="src/app/app.module.ts (관리자 모듈)" region="admin-module">

</code-example>


<!--
Add an "Admin" link to the `AppComponent` shell so that users can get to this feature.
-->
이제 사용자가 관리자 기능에 접근할 수 있도록 `AppComponent`에 "Admin" 링크를 추가합니다.

<!--
<code-example path="router/src/app/app.component.5.html" linenums="false" header="src/app/app.component.html (template)">
-->
<code-example path="router/src/app/app.component.5.html" linenums="false" header="src/app/app.component.html (템플릿)">

</code-example>



{@a guard-admin-feature}

<!--
#### Guard the admin feature
-->
#### 관리자 모듈로 접근하는 동작 제한하기

<!--
Currently every route within the *Crisis Center* is open to everyone.
The new *admin* feature should be accessible only to authenticated users.

You could hide the link until the user logs in. But that's tricky and difficult to maintain.

Instead you'll write a `canActivate()` guard method to redirect anonymous users to the
login page when they try to enter the admin area.

This is a general purpose guard&mdash;you can imagine other features
that require authenticated users&mdash;so you generate an
`AuthGuard` in the `auth` folder.
-->
지금까지 작성한 애플리케이션은 모든 사용자가 "위기대응센터"에 접근할 수 있습니다.
하지만 새로 추가한 *관리자* 모듈은 미리 인증된 사용자만 접근할 수 있도록 하려고 합니다.

사용자가 로그인하지 않으면 링크를 감출 수도 있지만 이 방법은 간단한 트릭일 뿐 완벽한 방법이 아닙니다.

이 방법보다는 로그인하지 않은 사용자가 관리자 페이지에 접근할 때 `canActivate()` 가드를 사용해서 로그인 페이지로 대신 이동하게 하는 것이 더 좋습니다.

라우팅 가드는 보통 페이지에 접근하는 권한을 제어하는 용도로 사용합니다.
다음 명령을 실행해서 `auth` 폴더에 `AuthGuard`를 생성합니다.

<code-example language="none" class="code-shell">
  ng generate guard auth/auth
</code-example>

<!--
At the moment you're interested in seeing how guards work so the first version does nothing useful.
It simply logs to console and `returns` true immediately, allowing navigation to proceed:
-->
이렇게 만든 라우팅 가드는 아직 별다른 동작을 하지 않습니다.
이 가드는 단순하게 콘솔에 로그를 출력하고 `true`를 바로 반환합니다. 따라서 네비게이션 동작도 그대로 진행됩니다:

<!--
<code-example path="router/src/app/auth/auth.guard.1.ts" linenums="false" header="src/app/auth/auth.guard.ts (excerpt)">
-->
<code-example path="router/src/app/auth/auth.guard.1.ts" linenums="false" header="src/app/auth/auth.guard.ts (일부)">

</code-example>


<!--
Next, open `admin-routing.module.ts `, import the `AuthGuard` class, and
update the admin route with a `canActivate` guard property that references it:
-->
이제 `admin-routing.module.ts` 파일을 열고 `AuthGuard` 클래스를 로드한 후에 관리자 페이지에 연결된 라우팅 규칙에 `canActivate` 가드를 다음과 같이 적용합니다:

<!--
<code-example path="router/src/app/admin/admin-routing.module.2.ts" linenums="false" header="src/app/admin/admin-routing.module.ts (guarded admin route)" region="admin-route">
-->
<code-example path="router/src/app/admin/admin-routing.module.2.ts" linenums="false" header="src/app/admin/admin-routing.module.ts (관리자 페이지에 라우팅 가드 적용하기)" region="admin-route">

</code-example>


<!--
The admin feature is now protected by the guard, albeit protected poorly.
-->
아직 라우팅 가드가 실제로 동작하지는 않지만 관리자 모듈이 라우팅 가드로 보호되었습니다.

{@a teach-auth}

<!--
#### Teach *AuthGuard* to authenticate
-->
#### *AuthGuard* 구현하기

<!--
Make the `AuthGuard` at least pretend to authenticate.

The `AuthGuard` should call an application service that can login a user and retain information about the current user. Generate a new `AuthService` in the `auth` folder:
-->
이제 인증기능을 수행하는 `AuthGuard`를 구현해 봅시다.

`AuthGuard`는 애플리케이션에 있는 서비스를 사용해서 사용자가 로그인한 정보를 가져와야 합니다. 다음 명령을 실행해서 `admin` 폴더에 `AuthService`를 생성합니다:

<code-example language="none" class="code-shell">
  ng generate service auth/auth
</code-example>

<!--
Update the `AuthService` to log in the user:
-->
그리고 `AuthService`를 사용해서 사용자가 로그인했는지 확인할 수 있도록 다음과 같이 코드를 작성합니다:

<!--
<code-example path="router/src/app/auth/auth.service.ts" linenums="false" header="src/app/auth/auth.service.ts (excerpt)">
-->
<code-example path="router/src/app/auth/auth.service.ts" linenums="false" header="src/app/auth/auth.service.ts (일부)">

</code-example>


<!--
Although it doesn't actually log in, it has what you need for this discussion.
It has an `isLoggedIn` flag to tell you whether the user is authenticated.
Its `login` method simulates an API call to an external service by returning an
observable that resolves successfully after a short pause.
The `redirectUrl` property will store the attempted URL so you can navigate to it after authenticating.

Revise the `AuthGuard` to call it.
-->
이 코드에 로그인 기능을 실제로 구현한 것은 아니지만, 이 문서에서 다루는 내용을 설명하기에는 이 정도면 충분합니다.
사용자가 로그인을 했으면 `isLoggedIn` 플래그에 `true`를 할당합니다.
`login` 메소드는 서버로 통신한 것을 흉내내기 위해 시간을 약간 지연시킨 후에 `Observable`을 반환합니다.
그리고 `redirectUrl` 프로퍼티에는 사용자가 로그인 한 후에 리다이렉트할 URL을 저장해 둡니다.

실제로 사용할 수 있는 수준으로 코드를 작성하면 `AuthGuard`는 다음과 같이 구현할 수 있습니다.

<code-example path="router/src/app/auth/auth.guard.2.ts" linenums="false" header="src/app/auth/auth.guard.ts (v2)">

</code-example>


<!--
Notice that you *inject* the `AuthService` and the `Router` in the constructor.
You haven't provided the `AuthService` yet but it's good to know that you can inject helpful services into routing guards.

This guard returns a synchronous boolean result.
If the user is logged in, it returns true and the navigation continues.

The `ActivatedRouteSnapshot` contains the _future_ route that will be activated and the `RouterStateSnapshot`
contains the _future_ `RouterState` of the application, should you pass through the guard check.

If the user is not logged in, you store the attempted URL the user came from using the `RouterStateSnapshot.url` and
tell the router to navigate to a login page&mdash;a page you haven't created yet.
This secondary navigation automatically cancels the current navigation; `checkLogin()` returns
`false` just to be clear about that.
-->
생성자로 `AuthService`와 `Router`가 *의존성으로 주입*되는 것을 확인해 보세요.
아직 `AuthService`는 구현하지 않았지만, 라우팅 가드에 필요한 서비스는 이런 방식으로 주입할 수 있습니다.

이 라우팅 가드는 불리언 값을 동기 방식으로 반환합니다.
그리고 사용자가 로그인했다면 `true`를 반환하기 때문에 원래 실행하던 네비게이션 로직을 그대로 실행합니다.

`ActivatedRouteSnapshot`에는 로그인 상태를 확인한 _이후에_ 활성화될 라우팅 규칙이 전달되며, `RouterStateSnapshot`에는 이 시점에 사용될 `RouterState`이 전달됩니다. 그래서 라우팅 가드가 제대로 동작하려면 이 정보들이 전달되어야 합니다.

사용자가 로그인하지 않았으면 원래 네비게이션 하려던 URL을 `RouterStateSnapshot.url`에서 참조해서 프로퍼티로 저장한 후에 로그인 페이지로 이동합니다. (아직 로그인 페이지는 구현되지 않았습니다.)
그리고 `checkLogin()` 메소드가 `false`를 반환하기 때문에 현재 실행되고 있는 네비게이션 동작을 중단합니다.

{@a add-login-component}

<!--
#### Add the *LoginComponent*
-->
#### `LoginComponent` 구현하기

<!--
You need a `LoginComponent` for the user to log in to the app. After logging in, you'll redirect
to the stored URL if available, or use the default URL.
There is nothing new about this component or the way you wire it into the router configuration.
-->
이제 사용자가 애플리케이션에 로그인하려면 `LoginComponent`가 필요합니다.
이 컴포넌트에서 사용자가 로그인하고 나면 원래 이동하려던 페이지로 이동하며, 대상 페이지가 저장되지 않았다면 기본 URL로 이동할 것입니다.
이 컴포넌트는 라우팅 설정에 활용된다는 것을 제외하면 이전에 다뤘던 컴포넌트와 거의 비슷합니다.

<code-example language="none" class="code-shell">
  ng generate component auth/login
</code-example>

<!--
Register a `/login` route in the `auth/auth-routing.module.ts`. In `app.module.ts`, import and add the `AuthModule` to the `AppModule` imports.
-->
`auth/auth-routing.module.ts` 파일에 `/login` 라우팅 규칙을 추가합니다.
그리고 `app.module.ts` 파일에 정의된 `AppModule`에 `AuthModule`을 로드합니다.

<code-tabs>

  <code-pane header="src/app/app.module.ts" path="router/src/app/app.module.ts" region="auth">

  </code-pane>

  <code-pane header="src/app/auth/login/login.component.html" path="router/src/app/auth/login/login.component.html">

  </code-pane>

  <code-pane header="src/app/auth/login/login.component.ts" path="router/src/app/auth/login/login.component.1.ts">

  </code-pane>

  <code-pane header="src/app/auth/auth.module.ts" path="router/src/app/auth/auth.module.ts">

  </code-pane>

</code-tabs>


{@a can-activate-child-guard}

<!--
### _CanActivateChild_: guarding child routes
-->
### _CanActivateChild_: 자식 라우팅 제어하기

<!--
You can also protect child routes with the `CanActivateChild` guard.
The `CanActivateChild` guard is similar to the `CanActivate` guard.
The key difference is that it runs _before_  any child route is activated.

You protected the admin feature module from unauthorized access.
You should also protect child routes _within_ the feature module.

Extend the `AuthGuard` to protect when navigating between the `admin` routes.
Open `auth.guard.ts` and add the `CanActivateChild` interface to the imported tokens from the router package.

Next, implement the `canActivateChild()` method which takes the same arguments as the `canActivate()` method:
an `ActivatedRouteSnapshot` and `RouterStateSnapshot`.
The `canActivateChild()` method can return an `Observable<boolean>` or `Promise<boolean>` for
async checks and a `boolean` for sync checks.
This one returns a `boolean`:
-->
`CanActivateChild` 라우팅 가드를 사용하면 자식 라우팅을 제어할 수 있습니다.
`CanActivateChild`는 자식 라우팅 규칙이 활성화되기 _전에_ 실행된다는 점만 빼면 `CanActivate` 가드와 비슷합니다.

지금까지는 허가받지 않은 사용자가 관리자 기능 모듈에 접근하는 것을 제한했었습니다.
그런데 이 로직이 제대로 동작하려면 기능 모듈 _안쪽에서_ 자식 라우팅 규칙이 활성화되는 것도 검사해야 합니다.

이번에는 `AuthGuard`를 수정해서 `admin` 주소 안쪽에서 페이지가 전환되는 것을 제어해 봅시다.
`auth.guard.ts` 파일을 열고 라우터 패키지에서 `CanActivateChild` 인터페이스를 로드합니다.

그리고 `canActivate()` 메소드를 구현했던 것처럼 `canActivateChild()` 메소드를 구현합니다. 이 때 이 함수에는 `ActivatedRouteSnapshot`과 `RouterStateSnapshot`이 인자로 전달됩니다.
`canActivateChild()` 메소드를 비동기로 실행하려면 `Observable<boolean>`이나 `Promise<boolean>`을 반환하고, 동기 방식으로 실행하려면 `boolean` 타입을 반환하면 됩니다.
이 예제에서는 `boolean` 타입을 반환합니다:

<!--
<code-example path="router/src/app/auth/auth.guard.3.ts" linenums="false" header="src/app/auth/auth.guard.ts (excerpt)" region="can-activate-child">
-->
<code-example path="router/src/app/auth/auth.guard.3.ts" linenums="false" header="src/app/auth/auth.guard.ts (일부)" region="can-activate-child">

</code-example>


<!--
Add the same `AuthGuard` to the `component-less` admin route to protect all other child routes at one time
instead of adding the `AuthGuard` to each route individually.
-->
이제 컴포넌트 없이 선언한 관리자 라우팅 규칙의 자식 라우팅 규칙에 다음과 같이 `AuthGuard`를 적용합니다. 이제 이 컴포넌트의 자식 라우팅 규칙은 모두 라우팅 가드로 보호됩니다.

<!--
<code-example path="router/src/app/admin/admin-routing.module.3.ts" linenums="false" header="src/app/admin/admin-routing.module.ts (excerpt)" region="can-activate-child">
-->
<code-example path="router/src/app/admin/admin-routing.module.3.ts" linenums="false" header="src/app/admin/admin-routing.module.ts (일부)" region="can-activate-child">

</code-example>



{@a can-deactivate-guard}

<!--
### _CanDeactivate_: handling unsaved changes
-->
### _CanDeactivate_: 저장되지 않은 변경사항 체크하기

<!--
Back in the "Heroes" workflow, the app accepts every change to a hero immediately without hesitation or validation.
-->
"Heroes"가 동작하던 것을 다시 생각해보면, 이 앱은 히어로의 정보가 변경된 것을 검사하지 않고 바로 저장합니다.

<!--
In the real world, you might have to accumulate the users changes.
You might have to validate across fields.
You might have to validate on the server.
You might have to hold changes in a pending state until the user confirms them *as a group* or
cancels and reverts all changes.
-->
하지만 실제 운영환경에서는 사용자가 변경한 내용을 추적해야 하는 경우가 많습니다.
필드를 검사해야 할 수도 있고, 서버로 전달된 데이터를 검사해야 할 수도 있으며, *여러개를 수정했을 때* 이 내용을 모두 반영할 것인지, 아니면 모두 취소할 것인지 정해지기 전까지는 상태를 유지해야 할 수도 있습니다.

<!--
What do you do about unapproved, unsaved changes when the user navigates away?
You can't just leave and risk losing the user's changes; that would be a terrible experience.
-->
사용자가 화면에 있는 내용을 변경했는데 이 내용을 저장하지 않고 다른 페이지로 이동하려고 한다면 어떻게 해야 할까요?
이 때 다른 페이지로 바로 이동하면 사용자가 변경한 내용이 모두 사라집니다. 사용자의 입장에서는 굉장히 불편할 수 있습니다.

<!--
It's better to pause and let the user decide what to do.
If the user cancels, you'll stay put and allow more changes.
If the user approves, the app can save.
-->
이것보다는 사용자가 결정을 내릴때까지 페이지 이동을 잠시 멈추는 것이 더 좋습니다.
사용자가 페이지 이동을 취소하면 현재 페이지의 내용을 그대로 유지할 수 있으며, 사용자가 저장하기로 결정하면 변경사항을 모두 서버로 전달할 수도 있습니다.

<!--
You still might delay navigation until the save succeeds.
If you let the user move to the next screen immediately and
the save were to fail (perhaps the data are ruled invalid), you would lose the context of the error.
-->
그리고 사용자가 변경사항을 저장하기로 하면 서버로 보낸 요청이 완료될 때까지 잠시 네비게이션을 미룰 수도 있습니다.
서버로 보낸 데이터나 형식이 잘못된 것을 무시하고 다음 화면으로 바로 넘어가면, 데이터를 저장하면서 발생한 에러를 처리할 수 없습니다.

<!--
You can't block while waiting for the server&mdash;that's not possible in a browser.
You need to stop the navigation while you wait, asynchronously, for the server
to return with its answer.
-->
브라우저 자체 기능만으로는 서버의 응답이 올 때까지 페이지 이동을 보류해둘 수 없습니다.
그래서 서버의 응답이 올 때까지 네비게이션을 멈춰두는 기능이 필요합니다.

<!--
You need the `CanDeactivate` guard.
-->
`CanDeactivate` 라우팅 가드는 이런 경우에 사용합니다.

{@a cancel-save}


<!--
#### Cancel and save
-->
#### 페이지 이동을 취소하고 저장하기

<!--
The sample application doesn't talk to a server.
Fortunately, you have another way to demonstrate an asynchronous router hook.

Users update crisis information in the `CrisisDetailComponent`.
Unlike the `HeroDetailComponent`, the user changes do not update the crisis entity immediately.
Instead, the app updates the entity when the user presses the *Save* button and
discards the changes when the user presses the *Cancel* button.

Both buttons navigate back to the crisis list after save or cancel.
-->
이 문서에서 다루는 애플리케이션은 서버와 통신을 하지 않습니다.
하지만 라우터 후킹 함수를 사용하면 이 시나리오를 흉내낼 수 있습니다.

사용자가 `CrisisDetailComponent`에서 위기사항에 대한 정보를 수정했다고 합시다.
이 때 `HeroDetailComponent`와는 다르게, 사용자가 변경한 내용을 바로 저장하지 않으려고 합니다.
이 컴포넌트에서는 사용자가 *Save* 버튼을 클릭했을 때 변경내용을 저장하고, 사용자가 *Cancel* 버튼을 클릭하면 변경사항을 폐기합니다.

그리고 두 버튼을 클릭하면 모두 이전 페이지인 위기 목록 페이지로 이동합니다.


<!--
<code-example path="router/src/app/crisis-center/crisis-detail/crisis-detail.component.ts" linenums="false" header="src/app/crisis-center/crisis-detail/crisis-detail.component.ts (cancel and save methods)" region="cancel-save">
-->
<code-example path="router/src/app/crisis-center/crisis-detail/crisis-detail.component.ts" linenums="false" header="src/app/crisis-center/crisis-detail/crisis-detail.component.ts (cancel, save 메소드)" region="cancel-save">

</code-example>


<!--
What if the user tries to navigate away without saving or canceling?
The user could push the browser back button or click the heroes link.
Both actions trigger a navigation.
Should the app save or cancel automatically?

This demo does neither. Instead, it asks the user to make that choice explicitly
in a confirmation dialog box that *waits asynchronously for the user's
answer*.
-->
사용자가 변경사항을 저장하거나 취소하지 않고 다른 페이지로 이동하려고 하는 상황은 어떤 상황일까요?
이런 상황은 브라우저의 뒤로 가기 버튼을 클릭하거나 목록으로 이동하는 링크를 클릭했을 때 발생할 수 있습니다.
두가지 경우 모두 네비게이션이 실행됩니다.
그러면 앱에서 자동으로 변경사항을 저장하거나 취소해야 할까요?

저장하거나 취소하는 것을 임의로 간주하고 이렇게 로직을 구현할 수도 있습니다. 하지만 이 예제에서는 팝업을 띄워서 사용자가 명시적으로 선택하도록 구현해 봅시다. 사용자가 응답할 때까지 페이지를 전환하는 동작은 *비동기적으로 중단*됩니다.

<div class="alert is-helpful">


<!--
You could wait for the user's answer with synchronous, blocking code.
The app will be more responsive&mdash;and can do other work&mdash;by
waiting for the user's answer asynchronously. Waiting for the user asynchronously
is like waiting for the server asynchronously.
-->
사용자의 응답을 기다리는 것을 동기 방식으로 할 수도 있습니다.
하지만 이런 경우에는 앱이 다른 작업을 하지 못하고 사용자의 응답이 있을 때까지 대기해야 합니다.
사용자의 응답을 기다리는 것도 서버의 응답을 기다리는 것처럼 비동기로 하는 것이 좋습니다.

</div>


<!--
Generate a `Dialog` service to handle user confirmation.
-->
사용자의 입력을 받기 위해 `Dialog` 서비스를 구현합니다.

<code-example language="none" class="code-shell">
  ng generate service dialog
</code-example>

<!--
Add a `confirm()` method to the `DialogService` to prompt the user to confirm their intent. The `window.confirm` is a _blocking_ action that displays a modal dialog and waits for user interaction.
-->
그리고 사용자의 응답을 받기 위해 `DialogService`에 `confirm()` 메소드를 추가합니다.
`window.confirm` 메소드는 사용자가 응답할 때까지 화면에서 발생할 수 있는 동작을 _멈춥니다_.

<code-example path="router/src/app/dialog.service.ts" header="src/app/dialog.service.ts">

</code-example>

<!--
It returns an `Observable` that *resolves* when the user eventually decides what to do: either
to discard changes and navigate away (`true`) or to preserve the pending changes and stay in the crisis editor (`false`).
-->
이 함수는 사용자의 응답을 `Observable` 타입으로 반환합니다. 사용자가 `true`를 선택하면 변경사항을 버리고 다른 페이지로 이동하며, 사용자가 `false`를 선택하면 네비게이션을 멈추고 현재 페이지에 머물러 있을 것입니다.

{@a CanDeactivate}

<!--
Generate a _guard_ that checks for the presence of a `canDeactivate()` method in a component&mdash;any component.
-->
다음 명령을 실행해서 _라우팅 가드_ 를 생성합니다. 이 가드는 컴포넌트에 있는 `canDeactivate()` 메소드를 실행하는 역할을 합니다.

<code-example language="none" class="code-shell">
  ng generate guard can-deactivate
</code-example>

<!--
The `CrisisDetailComponent` will have this method.
But the guard doesn't have to know that.
The guard shouldn't know the details of any component's deactivation method.
It need only detect that the component has a `canDeactivate()` method and call it.
This approach makes the guard reusable.
-->
`CrisisDetailComponent`에는 이미 `canDeactivate()` 메소드가 구현되어 있습니다.
하지만 이 라우팅 가드가 컴포넌트의 `canDeactivate()` 메소드의 로직을 알아야 할 필요는 없습니다.
이 라우팅 가드는 단순하게 컴포넌트에 `canDeactivate()` 메소드가 정의되어 있는지 확인하고, 정의되어 있다면 이 메소드를 실행하기만 할 뿐입니다.
이렇게 구현하면 이 라우팅 가드를 다른 컴포넌트를 대상으로도 재사용할 수 있습니다.

<code-example path="router/src/app/can-deactivate.guard.ts" header="src/app/can-deactivate.guard.ts">

</code-example>


<!--
Alternatively, you could make a component-specific `CanDeactivate` guard for the `CrisisDetailComponent`.
The `canDeactivate()` method provides you with the current
instance of the `component`, the current `ActivatedRoute`,
and `RouterStateSnapshot` in case you needed to access
some external information. This would be useful if you only
wanted to use this guard for this component and needed to get
the component's properties or confirm whether the router should allow navigation away from it.
-->
이 방식 대신 `CrisisDetailComponent`에만 적용되는 `CanDeactivate` 가드를 구현할 수도 있습니다.
그러면 이 라우팅 가드의 `canDeactivate()` 메소드는 현재 컴포넌트의 인스턴스와 현재 `ActivatedRoute`, `RouterStateSnapshot`, 필요하다면 더 많은 정보에 접근해야 합니다.
이 라우팅 가드가 딱 이 컴포넌트에만 사용된다면 이렇게 구현할 수도 있습니다.

<!--
<code-example path="router/src/app/can-deactivate.guard.1.ts" linenums="false" header="src/app/can-deactivate.guard.ts (component-specific)">
-->
<code-example path="router/src/app/can-deactivate.guard.1.ts" linenums="false" header="src/app/can-deactivate.guard.ts (특정 컴포넌트를 위한 라우팅 가드)">

</code-example>


<!--
Looking back at the `CrisisDetailComponent`, it implements the confirmation workflow for unsaved changes.
-->
다시 `CrisisDetailComponent`를 보면, 변경되지 않은 내용을 확인하는 로직은 다음과 같이 구현되어 있습니다.

<!--
<code-example path="router/src/app/crisis-center/crisis-detail/crisis-detail.component.ts" linenums="false" header="src/app/crisis-center/crisis-detail/crisis-detail.component.ts (excerpt)" region="canDeactivate">
-->
<code-example path="router/src/app/crisis-center/crisis-detail/crisis-detail.component.ts" linenums="false" header="src/app/crisis-center/crisis-detail/crisis-detail.component.ts (일부)" region="canDeactivate">

</code-example>


<!--
Notice that the `canDeactivate()` method *can* return synchronously;
it returns `true` immediately if there is no crisis or there are no pending changes.
But it can also return a `Promise` or an `Observable` and the router will wait for that
to resolve to truthy (navigate) or falsy (stay put).
-->
`canDeactivate()` 메소드는 값을 *동기 방식으로* 반환할 수도 있습니다.
만약 위기 목록이 없거나 변경된 내용이 없으면 이 메소드는 `true`를 즉시 반환합니다.
하지만 이 메소드가 `Promise`나 `Observable` 타입을 반환한다면 이 객체들이 처리될 때까지 라우터는 동작하지 않고 멈춥니다.

<!--
Add the `Guard` to the crisis detail route in `crisis-center-routing.module.ts` using the `canDeactivate` array property.
-->
이제 이 라우팅 가드를 `crisis-center-routing.module.ts`에 다음과 같이 추가합니다.

<code-example path="router/src/app/crisis-center/crisis-center-routing.module.3.ts" linenums="false" header="src/app/crisis-center/crisis-center-routing.module.ts (can deactivate guard)">

</code-example>

<!--
Now you have given the user a safeguard against unsaved changes.
-->
이제 사용자가 저장하지 않고 놓친 변경사항은 라우팅 가드로 한 번 더 확인하게 할 수 있습니다.

{@a Resolve}

{@a resolve-guard}

<!--
### _Resolve_: pre-fetching component data
-->
### _Resolve_: 컴포넌트에 필요한 데이터 미리 가져오기

<!--
In the `Hero Detail` and `Crisis Detail`, the app waited until the route was activated to fetch the respective hero or crisis.

This worked well, but there's a better way.
If you were using a real world API, there might be some delay before the data to display is returned from the server.
You don't want to display a blank component while waiting for the data.
-->
`Hero Detail`과 `Crisis Detail` 화면은 히어로의 목록이나 위기목록을 서버에서 받아오기 전까지는 라우팅 규칙이 활성화되지 않습니다.

이렇게 구현해도 문제는 없지만, 더 좋은 방법이 있습니다.
그리고 실제 운영환경에서는 데이터를 가져올 때 시간이 걸리기 때문에 화면에 데이터가 표시되는 것도 약간 지연됩니다.
이 때 컴포넌트는 빈 화면으로 표시되는데, 이렇게 동작하는 것을 좀 더 개선하는 방법에 대해 알아봅시다.

<!--
It's preferable to pre-fetch data from the server so it's ready the
moment the route is activated. This also allows you to handle errors before routing to the component.
There's no point in navigating to a crisis detail for an `id` that doesn't have a record.
It'd be better to send the user back to the `Crisis List` that shows only valid crisis centers.

In summary, you want to delay rendering the routed component until all necessary data have been fetched.

You need a *resolver*.
-->
컴포넌트를 전환하면서 라우팅 규칙이 활성화되기 전에 서버에서 데이터를 먼저 받아올 수 있는데, 이 방법을 사용하면 서버와 통신할 때 발생할 수 있는 에러를 컴포넌트가 전환되기 전에 처리할 수 있습니다.
그리고 좀 더 사용방법을 고민해 보면 위기 상세정보 화면으로 이동했지만 `id`에 해당하는 데이터가 없을 때에도 활용할 수 있습니다.
해당하는 데이터가 없다면 다시 위기목록 화면으로 전환할 수도 있습니다.

요약하자면, 컴포넌트에 필요한 데이터가 모두 준비될 때까지 라우팅 동작을 지연시킬 수 있습니다.

이 동작은 *리졸버(resolver)*로 처리합니다.

{@a fetch-before-navigating}


<!--
#### Fetch data before navigating
-->
#### 페이지를 이동하기 전에 데이터 먼저 받아오기

<!--
At the moment, the `CrisisDetailComponent` retrieves the selected crisis.
If the crisis is not found, it navigates back to the crisis list view.

The experience might be better if all of this were handled first, before the route is activated.
A `CrisisDetailResolver` service could retrieve a `Crisis` or navigate away if the `Crisis` does not exist
_before_ activating the route and creating the `CrisisDetailComponent`.

Generate a `CrisisDetailResolver` service file within the `Crisis Center` feature area.
-->
지금까지 작성한 예제에서 `CrisisDetailComponent`는 이전 화면에서 선택한 위기의 상세정보를 받아옵니다.
그리고 해당 위기가 존재하지 않으면 위기 목록 화면으로 다시 돌아갑니다.

하지만 이 과정이 네비게이션을 하기 전에 모두 끝난다면 사용자가 경험하는 UX는 좀 더 나아질 것입니다.
지금부터 구현할 `CrisisDetailResolver` 서비스는 `CrisisDetailComponent`로 페이지를 전환하기 _전에_ 미리 `Crisis`를 받아오는데, 해당 데이터가 없으면 다른 페이지로 이동하도록 구현할 것입니다.

다음 명령을 실행해서 `Crisis Center` 모듈에 `CrisisDetailResolver` 서비스를 생성합니다.

<code-example language="none" class="code-shell">
  ng generate service crisis-center/crisis-detail-resolver
</code-example>


<code-example path="router/src/app/crisis-center/crisis-detail-resolver.service.1.ts" header="src/app/crisis-center/crisis-detail-resolver.service.ts (generated)">

</code-example>


<!--
Take the relevant parts of the crisis retrieval logic in `CrisisDetailComponent.ngOnInit`
and move them into the `CrisisDetailResolverService`.
Import the `Crisis` model, `CrisisService`, and the `Router`
so you can navigate elsewhere if you can't fetch the crisis.
-->
그리고 이제부터 라우팅 가드에서 담당할 로직을 `CrisisDetailComponent.ngOnInit`에서 `CrisisDetailResolverService`로 옮깁니다.
이 때 `Crisis` 모델과 `CrisisService`, `Router` 객체가 의존성으로 필요하며, 해당 데이터를 가져오기 못하면 다른 곳으로 이동하게 할 것입니다.

<!--
Be explicit. Implement the `Resolve` interface with a type of `Crisis`.

Inject the `CrisisService` and `Router` and implement the `resolve()` method.
That method could return a `Promise`, an `Observable`, or a synchronous return value.
-->
타입은 명확하게 지정합니다. 이 클래스는 `Resolve` 인터페이스를 바탕으로 구현하며, 처리하는 객체의 타입은 `Crisis`입니다.

`CrisisService`와 `Router` 객체는 `resolve()` 메소드에 주입합니다.
이 메소드는 `Promise`나 `observable`, 동기방식으로 결과를 반환할 수 있습니다.

<!--
The `CrisisService.getCrisis` method returns an observable, in order to prevent the route from loading until the data is fetched.
The `Router` guards require an observable to `complete`, meaning it has emitted all
of its values. You use the `take` operator with an argument of `1` to ensure that the
Observable completes after retrieving the first value from the Observable returned by the
`getCrisis` method.
-->
`CrisisService.getCrisis` 메소드는 옵저버블을 반환하는데, 이 메소드가 옵저버블을 반환하기 전까지 라우팅 규칙은 활성화되지 않습니다.
그리고 이 라우팅 가드는 옵저버블이 완료되어야 종료됩니다.
그래서 `take` 연산자에 `1` 인자를 전달해서 이 옵저버블이 `getCrisis` 메소드로부터 데이터를 하나 받으면 옵저버블 자체를 종료하도록 구현했습니다.

<!--
If it doesn't return a valid `Crisis`, return an empty `Observable`, canceling the previous in-flight navigation to the `CrisisDetailComponent` and navigate the user back to the `CrisisListComponent`. The update resolver service looks like this:
-->
만약 해당되는 `Crisis` 객체를 반환하지 못해서 `Observable`이 빈 값을 반환하게 되면 `CrisisDetailComponent`로 이동하던 네비게이션 로직이 취소되며 다시 `CrisisListComponent`로 이동합니다. 리졸버 서비스를 이런 로직으로 구현하면 다음과 같이 구현할 수 있습니다:

<code-example path="router/src/app/crisis-center/crisis-detail-resolver.service.ts" header="src/app/crisis-center/crisis-detail-resolver.service.ts">

</code-example>

<!--
Import this resolver in the `crisis-center-routing.module.ts`
and add a `resolve` object to the `CrisisDetailComponent` route configuration.
-->
이 리졸버를 `crisis-center-routing.module.ts`에 로드하고 `CrisisDetailComponent` 라우팅 규칙에 `resolve` 객체로 추가합니다.

<!--
<code-example path="router/src/app/crisis-center/crisis-center-routing.module.4.ts" linenums="false" header="src/app/crisis-center/crisis-center-routing.module.ts (resolver)">
-->
<code-example path="router/src/app/crisis-center/crisis-center-routing.module.4.ts" linenums="false" header="src/app/crisis-center/crisis-center-routing.module.ts (리졸버)">

</code-example>


<!--
The `CrisisDetailComponent` should no longer fetch the crisis.
Update the `CrisisDetailComponent` to get the crisis from the  `ActivatedRoute.data.crisis` property instead;
that's where you said it should be when you re-configured the route.
It will be there when the `CrisisDetailComponent` ask for it.
-->
`CrisisDetailComponent`는 이제 위기에 대한 상세정보를 직접 서버에서 가져오지 않습니다.
`CrisisDetailComponent`는 `ActivatedRoute.data.crisis` 프로퍼티로 이 데이터를 참조합니다.
이 데이터는 위에서 수정한 라우팅 규칙에 의해 전달됩니다.

<code-example path="router/src/app/crisis-center/crisis-detail/crisis-detail.component.ts" linenums="false" header="src/app/crisis-center/crisis-detail/crisis-detail.component.ts (ngOnInit v2)" region="ngOnInit">

</code-example>


<!--
**Two critical points**
-->
**2가지 중요한 내용**

<!--
1. The router's `Resolve` interface is optional.
The `CrisisDetailResolverService` doesn't inherit from a base class.
The router looks for that method and calls it if found.
-->
1. 라우터가 제공하는 `Resolve` 인터페이스를 꼭 사용해야 하는 것은 아닙니다.
그리고 `CrisisDetailResolverService`는 베이스 클래스를 바탕으로 상속한 것도 아닙니다.
라우터는 단순하게 관련된 메소드가 있는지 검사하고 실행할 뿐입니다.

<!--
1. Rely on the router to call the resolver.
Don't worry about all the ways that the user  could navigate away.
That's the router's job. Write this class and let the router take it from there.

The relevant *Crisis Center* code for this milestone follows.
-->
2. 리졸버를 실행하는 것은 라우터입니다.
더이상 사용자가 다른 페이지로 마음대로 이동하는 것을 걱정하지 않아도 됩니다.
구현한 클래스를 라우터에 전달하기만 하면 이 동작을 라우터가 직접 관리합니다.

지금까지 작성한 *위기대응센터*의 코드는 다음과 같습니다.

<code-tabs>

  <code-pane header="app.component.html" path="router/src/app/app.component.html">

  </code-pane>

  <code-pane header="crisis-center-home.component.html" path="router/src/app/crisis-center/crisis-center-home/crisis-center-home.component.html">

  </code-pane>

  <code-pane header="crisis-center.component.html" path="router/src/app/crisis-center/crisis-center/crisis-center.component.html">

  </code-pane>

  <code-pane header="crisis-center-routing.module.ts" path="router/src/app/crisis-center/crisis-center-routing.module.4.ts">

  </code-pane>

  <code-pane header="crisis-list.component.html" path="router/src/app/crisis-center/crisis-list/crisis-list.component.html">

  </code-pane>

  <code-pane header="crisis-list.component.ts" path="router/src/app/crisis-center/crisis-list/crisis-list.component.ts">

  </code-pane>

  <code-pane header="crisis-detail.component.html" path="router/src/app/crisis-center/crisis-detail/crisis-detail.component.html">

  </code-pane>

  <code-pane header="crisis-detail.component.ts" path="router/src/app/crisis-center/crisis-detail/crisis-detail.component.ts">

  </code-pane>

  <code-pane header="crisis-detail-resolver.service.ts" path="router/src/app/crisis-center/crisis-detail-resolver.service.ts">

  </code-pane>

  <code-pane header="crisis.service.ts" path="router/src/app/crisis-center/crisis.service.ts">

  </code-pane>

  <code-pane header="dialog.service.ts" path="router/src/app/dialog.service.ts">

  </code-pane>

</code-tabs>

라우팅 가드

<code-tabs>

  <code-pane header="auth.guard.ts" path="router/src/app/auth/auth.guard.3.ts">

  </code-pane>

  <code-pane header="can-deactivate.guard.ts" path="router/src/app/can-deactivate.guard.ts">

  </code-pane>

</code-tabs>



{@a query-parameters}


{@a fragment}

<!--
### Query parameters and fragments
-->
### 쿼리 파라미터(Query parameters)와 프래그먼트(Fragments) 활용하기

<!--
In the [route parameters](#optional-route-parameters) example, you only dealt with parameters specific to
the route, but what if you wanted optional parameters available to all routes?
This is where query parameters come into play.
-->
[라우팅 변수](#optional-route-parameters) 예제에서 다뤘던 것처럼, 라우팅 규칙에는 변수를 할당할 수 있습니다. 그런데 라우팅 변수가 항상 존재하지 않고 생략될 수도 있는 상황이라면 어떻게 해야 할까요?
이 섹션에서는 쿼리 파라미터를 사용하는 방법에 대해 알아봅시다.

<!--
[Fragments](https://en.wikipedia.org/wiki/Fragment_identifier) refer to certain elements on the page
identified with an `id` attribute.
-->
[프래그먼트(fragments)](https://en.wikipedia.org/wiki/Fragment_identifier)은 현재 페이지에 존재하는 엘리먼트 중에서 특정 `id` 어트리뷰트에 해당하는 엘리먼트를 의미합니다.

<!--
Update the `AuthGuard` to provide a `session_id` query that will remain after navigating to another route.

Add an `anchor` element so you can jump to a certain point on the page.

Add the `NavigationExtras` object to the `router.navigate()` method that navigates you to the `/login` route.
-->
`AuthGuard`가 다음번에 적용될 라우팅 규칙에 `session_id`를 제공할 수 있도록 수정해 봅시다.

이 데이터는 `anchor` 엘리먼트에 적용되어 특정 페이지로 이동하는 용도로 사용할 것입니다.

이렇게 구현하려면 `/login` 페이지로 이동하기 위해 `router.navigate()` 메소드를 실행할 때 인자로 `NavigationExtras` 객체를 전달하면 됩니다.

<code-example path="router/src/app/auth/auth.guard.4.ts" linenums="false" header="src/app/auth/auth.guard.ts (v3)">

</code-example>


<!--
You can also preserve query parameters and fragments across navigations without having to provide them
again when navigating. In the `LoginComponent`, you'll add an *object* as the
second argument in the `router.navigateUrl()` function
and provide the `queryParamsHandling` and `preserveFragment` to pass along the current query parameters
and fragment to the next route.
-->
쿼리 파라미터와 프래그먼트는 보통 네비게이션 과정 중에 활용하지만, 네비게이션이 실행된 이후에 사용할 수 있도록 보관해 둘 수도 있습니다.
`LoginComponent`에서 `router.navigateUrl()` 함수에 `NavigationExtras` 객체를 전달할 때 객체에 `queryParamsHandling` 프로퍼티와 `preserveFragment` 프로퍼티를 지정하면 됩니다.
그러면 다음에 적용될 라우팅 규칙에 이 데이터를 활용할 수 있습니다.

<code-example path="router/src/app/auth/login/login.component.ts" linenums="false" header="src/app/auth/login/login.component.ts (preserve)" region="preserve">

</code-example>

<div class="alert is-helpful">


<!--
The `queryParamsHandling` feature also provides a `merge` option, which will preserve and combine the current query parameters with any provided query parameters
when navigating.
-->
`queryParamsHandling`에는 `merge` 옵션을 사용할 수도 있습니다. 이 옵션을 사용하면 현재 시점에 존재하는 쿼리 파라미터와 새로 추가되는 쿼리 파라미터를 조합합니다.

</div>


<!--
As you'll be navigating to the *Admin Dashboard* route after logging in, you'll update it to handle the
query parameters and fragment.
-->
이제 사용자가 로그인한 후에 *관리자 대시보드*로 이동하면 이 쿼리 파라미터와 프래그먼트를 참조할 수 있습니다.

<code-example path="router/src/app/admin/admin-dashboard/admin-dashboard.component.1.ts" linenums="false" header="src/app/admin/admin-dashboard/admin-dashboard.component.ts (v2)">

</code-example>


<!--
*Query parameters* and *fragments* are also available through the `ActivatedRoute` service.
Just like *route parameters*, the query parameters and fragments are provided as an `Observable`.
The updated *Crisis Admin* component feeds the `Observable` directly into the template using the `AsyncPipe`.
-->
*쿼리 파라미터*와 *프래그먼트*는 `ActivatedRoute` 서비스를 참조하는 방식으로 사용할 수도 있습니다.
이 때 일반적인 *라우팅 변수*와 마찬가지로, 쿼리 파라미터와 프래그먼트도 `Observable` 타입으로 제공됩니다.
그리고 컴포넌트에서는 `Observable` 타입의 데이터를 템플릿에서 `AsyncPipe`로 참조합니다.

<!--
Now, you can click on the *Admin* button, which takes you to the *Login*
page with the provided `queryParamMap` and `fragment`. After you click the login button, notice that
you have been redirected to the `Admin Dashboard` page with the query parameters and fragment still intact in the address bar.
-->
이제 사용자가 *Admin* 버튼을 클릭하면 *Login* 페이지로 이동하면서 `queryparamMap`과 `fragment`가 지정됩니다. 그리고 로그인 버튼을 클릭하면 관리자 대시보드 페이지로 리다이렉트 되는데, 이 때 쿼리 파라미터와 프래그먼트가 그대로 보존되는 것을 주소표시줄에서 확인할 수 있습니다.

<!--
You can use these persistent bits of information for things that need to be provided across pages like
authentication tokens or session ids.
-->
이 방식은 페이지를 전환하는 동안 인증 토큰이나 세션 ID를 그대로 유지해야 할 때 활용할 수 있습니다.

<div class="alert is-helpful">


<!--
The `query params` and `fragment` can also be preserved using a `RouterLink` with
the `queryParamsHandling` and `preserveFragment` bindings respectively.
-->
`RouterLink`에 `queryParamsHandling`과 `preserveFragment`를 입력값으로 바인딩하는 방식으로도 사용할 수 있습니다.

</div>


{@a asynchronous-routing}

<!--
## Milestone 6: Asynchronous routing
-->
## 6단계: 비동기 라우팅

<!--
As you've worked through the milestones, the application has naturally gotten larger.
As you continue to build out feature areas, the overall application size will continue to grow.
At some point you'll reach a tipping point where the application takes a long time to load.
-->
지금까지 진행하는 동안 애플리케이션은 점점 복잡해졌습니다.
게다가 앞으로 새로운 기능을 추가할 때마다 애플리케이션의 용량도 점점 커질 것입니다.
그러면 언젠가 애플리케이션이 시작되는 것이 느리다고 느껴지는 때가 찾아옵니다.

<!--
How do you combat this problem?  With asynchronous routing, which loads feature modules _lazily_, on request.
Lazy loading has multiple benefits.

* You can load feature areas only when requested by the user.
* You can speed up load time for users that only visit certain areas of the application.
* You can continue expanding lazy loaded feature areas without increasing the size of the initial load bundle.
-->
이 문제는 어떻게 해결할 수 있을까요? 비동기 라우팅을 활용하면 기능 모듈이 필요할 때까지 _기다렸다가_ 필요할 때 비동기로 로드할 수 있습니다.

* 사용자에게 필요한 기능 모듈만 로드할 수 있습니다.
* 특정 페이지에 직접 접근한다면 애플리케이션이 실행되는 속도를 빠르게 할 수 있습니다.
* 애플리케이션 실행에 꼭 필요한 용량은 그대로 둔 채로 기능 모듈을 붙이는 방식으로 확장할 수 있습니다.

<!--
You're already part of the way there.
By organizing the application into modules&mdash;`AppModule`,
`HeroesModule`, `AdminModule` and `CrisisCenterModule`&mdash;you
have natural candidates for lazy loading.

Some modules, like `AppModule`, must be loaded from the start.
But others can and should be lazy loaded.
The `AdminModule`, for example, is needed by a few authorized users, so
you should only load it when requested by the right people.
-->
비동기 라우팅은 이미 적용할 준비가 되어 있습니다.
애플리케이션을 `AppModule`, `HeroesModule`, `AdminModule`, `CrisisCenterModule`과 같은 모듈 단위로 구축하는 과정은 모듈을 지연로딩할 수 있는 준비를 한 것이기도 합니다.

`AppModule`은 애플리케이션이 실행되기 전에 반드시 로드되어야 합니다.
하지만 다른 모듈은 모두 지연로딩할 수 있습니다.
`AdminModule`을 생각해 보면, 이 모듈은 아주 일부의 사용자만 사용하기 때문에 해당 기능이 필요한 사용자만 이 모듈을 로드하는 것이 좋습니다.

{@a lazy-loading-route-config}


<!--
### Lazy Loading route configuration
-->
#### 지연로딩 라우팅 규칙 설정

<!--
Change the `admin` **path** in the `admin-routing.module.ts` from `'admin'` to an empty string, `''`, the _empty path_.
-->
`admin-routing.module.ts` 파일에서 `admin`에 해당하는 라우팅 규칙의 주소를 `admin`이 아니라 `''` 빈 문자열로 변경합니다.

<!--
The `Router` supports  *empty path* routes;
use them to group routes together without adding any additional path segments to the URL.
Users will still visit `/admin` and the `AdminComponent` still serves as the *Routing Component* containing child routes.
-->
`Router`는 *빈 주소* 를 사용하는 라우팅 규칙을 지원합니다. 이 방식을 사용하면 현재 URL을 변경하지 않으면서 여러 라우팅 경로를 그룹으로 묶을 수 있습니다.
이 기능을 사용하는 사용자는 여전히 `/admin`으로 접속할 것이며 자식 라우팅 규칙에 해당하는 *라우팅 컴포넌트* 도 여전히 `AdminComponent`로 제공됩니다.

<!--
Open the `AppRoutingModule` and add a new `admin` route to its `appRoutes` array.

Give it a `loadChildren` property instead of a `children` property.
The `loadChildren` property takes a function that returns a promise using the browser's built-in syntax for lazy loading code using dynamic imports `import('...')`.
The path is the location of the `AdminModule` (relative to the app root).
After the code is requested and loaded, the `Promise` resolves an object that contains the `NgModule`, in this case the `AdminModule`.
-->
`AppRoutingModule`을 열고 `appRoutes` 배열에 새로운 `admin` 라우팅을 추가합니다.

Give it a `loadChildren` property instead of a `children` property.
The `loadChildren` property takes a function that returns a promise using the browser's built-in syntax for lazy loading code using dynamic imports `import('...')`.
The path is the location of the `AdminModule` (relative to the app root).
After the code is requested and loaded, the `Promise` resolves an object that contains the `NgModule`, in this case the `AdminModule`.

<!--
<code-example path="router/src/app/app-routing.module.5.ts" region="admin-1" header="app-routing.module.ts (load children)">
-->
<code-example path="router/src/app/app-routing.module.5.ts" region="admin-1" header="app-routing.module.ts (loadChildren)">

</code-example>

<div class="alert is-important">

<!--
*Note*: When using absolute paths, the `NgModule` file location must begin with `src/app` in order to resolve correctly. For custom [path mapping with absolute paths](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping), the `baseUrl` and `paths` properties in the project `tsconfig.json` must be configured.
-->
*참고*: 만약 `NgModule`의 경로를 절대주소로 참조하려면 이 주소는 `src/app`로 시작해야 합니다.
이 주소는 TypeScript에서 [절대 주소를 맵핑](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)하는 설정의 영향을 받기 때문에 `tsconfig.json` 파일의 `baseUrl`과 `paths` 프로퍼티를 설정해야 합니다.

</div>

<!--
When the router navigates to this route, it uses the `loadChildren` string to dynamically load the `AdminModule`.
Then it adds the `AdminModule` routes to its current route configuration.
Finally, it loads the requested route to the destination admin component.

The lazy loading and re-configuration happen just once, when the route is _first_ requested;
the module and routes are available immediately for subsequent requests.
-->
이제 라우터가 이 라우팅 규칙을 만나면 `loadChildren` 문자열에 설정된 값으로 `AdminModule`을 로드합니다.
그리고 `AdminModule`에 정의된 라우팅 규칙은 애플리케이션 전체 라우팅 규칙과 조합됩니다.
결국 기존에 사용하던 대로 `admin` 주소로 접근하면 `AdminComponent`가 화면에 표시됩니다.

모듈 지연로딩은 이 라우팅 규칙이 _처음_ 요청받았을 때 한 번만 실행됩니다.
이후에 이 주소로 라우팅하면 이미 로드된 모듈과 조합된 라우팅 규칙을 그대로 사용합니다.

<div class="alert is-helpful">


<!--
Angular provides a built-in module loader that supports SystemJS to load modules asynchronously. If you were
using another bundling tool, such as Webpack, you would use the Webpack mechanism for asynchronously loading modules.
-->
Angular는 모듈을 지연로딩 할 때 SystemJS 모듈 로더를 사용합니다.
Webpack과 같은 다른 번들링 툴을 직접 사용한다면 Webpack에서 제공하는 비동기 모듈 로딩 메커니즘을 사용해야 합니다.

</div>


<!--
Take the final step and detach the admin feature set from the main application.
The root `AppModule` must neither load nor reference the `AdminModule` or its files.

In `app.module.ts`, remove the `AdminModule` import statement from the top of the file
and remove the `AdminModule` from the NgModule's `imports` array.
-->
마지막 단계는 관리자 기능모듈을 애플리케이션의 다른 모듈과 분리하는 것입니다.
`AdminModule`을 지연로딩하려면 `AppModule`은 `AdminModule`이나 이 모듈 내부의 파일들을 직접 로드하거나 참조하면 안됩니다.

`app.module.ts` 파일 제일 위쪽에서 `AdminModule`을 로드하는 구문을 제거하고, `AppModule`의 `imports` 배열에서도 `AdminModule`을 제거합니다.

{@a can-load-guard}


<!--
### _CanLoad_ Guard: guarding unauthorized loading of feature modules
-->
### _CanLoad_ 가드: 로그인하지 않은 사용자의 모듈 로딩 방지하기

<!--
You're already protecting the `AdminModule` with a `CanActivate` guard that prevents unauthorized users from
accessing the admin feature area.
It redirects to the  login page if the user is not authorized.

But the router is still loading the `AdminModule` even if the user can't visit any of its components.
Ideally, you'd only load the `AdminModule` if the user is logged in.
-->
지금도 `AdminModule`은 `CanActivate` 라우팅 가드에 의해 보호받고 있기 때문에 로그인하지 않은 사용자가 이 모듈에 접근하는 것은 제한할 수 있습니다.
로그인하지 않은 사용자가 이 모듈에 접근하면 로그인 페이지로 리다이렉트 됩니다.

하지만 이 경우에 사용자가 `AdminModule`의 컴포넌트 중 아무것도 화면에서 확인하지 못했지만 `AdminModule` 자체는 로딩이 완료됩니다.
이 모듈은 사용자가 로그인한 후에 실제로 활용할 때만 로딩하는 것이 이상적입니다.

<!--
Add a **`CanLoad`** guard that only loads the `AdminModule` once the user is logged in _and_ attempts to access the admin feature area.

The existing `AuthGuard` already has the essential logic in
its `checkLogin()` method to support the `CanLoad` guard.

Open `auth.guard.ts`.
Import the `CanLoad` interface from `@angular/router`.
Add it to the `AuthGuard` class's `implements` list.
Then implement `canLoad()` as follows:
-->
**`CanLoad`** 라우팅 가드는 로그인 한 사용자가 `AdminModule` 모듈에 해당하는 주소에 접근했을 때만 `AdminModule`을 지연로딩하도록 제어할 때 사용합니다.

이전에 만든 `AuthGuard`에 있는 `checkLogin()` 메소드는 `CanLoad` 라우팅 가드에서도 그대로 활용할 수 있습니다.

구현방법은 이렇습니다.
먼저 `auth.guard.ts` 파일을 엽니다.
그리고 `@angular/router` 패키지에서 `CanLoad` 인터페이스를 로드합니다.
`AuthGuard` 클래스의 `implements` 목록에 이 인터페이스를 추가합니다.
`canLoad()` 메소드는 다음과 같이 구현합니다:

<!--
<code-example path="router/src/app/auth/auth.guard.ts" linenums="false" header="src/app/auth/auth.guard.ts (CanLoad guard)" region="canLoad">
-->
<code-example path="router/src/app/auth/auth.guard.ts" linenums="false" header="src/app/auth/auth.guard.ts (CanLoad 라우팅 가드)" region="canLoad">

</code-example>


<!--
The router sets the `canLoad()` method's `route` parameter to the intended destination URL.
The `checkLogin()` method redirects to that URL once the user has logged in.

Now import the `AuthGuard` into the `AppRoutingModule` and add the `AuthGuard` to the `canLoad`
array property for the `admin` route.
The completed admin route looks like this:
-->
 `canLoad()` 메소드는 이동하려는 URL을 `route` 인자로 받습니다.
 그리고 `checkLogin()` 메소드가 실행되는데, 사용자가 로그인했다면 지금 이동하려던 주소로 그대로 리다이렉트 합니다.

 이제 `AppRoutingModule`에 `AuthGuard`를 로드하고 이 라우팅 가드를 `admin` 라우팅 규칙의 `canLoad` 배열 프로퍼티에 다음과 같이 추가합니다.

<!--
<code-example path="router/src/app/app-routing.module.5.ts" region="admin" header="app-routing.module.ts (lazy admin route)">
-->
<code-example path="router/src/app/app-routing.module.5.ts" region="admin" header="app-routing.module.ts (지연로딩하는 admin 라우팅 규칙)">

</code-example>



{@a preloading}

<!--
### Preloading: background loading of feature areas
-->
### 사전로딩(Preloading): 기능 모듈을 백그라운드에서 로딩하기

<!--
You've learned how to load modules on-demand.
You can also load modules asynchronously with _preloading_.

This may seem like what the app has been doing all along. Not quite.
The `AppModule` is loaded when the application starts; that's _eager_ loading.
Now the `AdminModule` loads only when the user clicks on a link; that's _lazy_ loading.
-->
지금까지 모듈을 필요할 때만 로딩하는 방법에 대해 알아봤습니다.
그런데 모듈은 필요한 경우를 대비해서 _미리_ 비동기로 로딩할 수도 있습니다.

이제까지 만들었던 앱을 생각해봅시다.
`AppModule`은 애플리케이션이 시작될 때 _즉시_ 로딩됩니다.
그리고 `AdminModule`은 사용자가 링크를 클릭 했을 때 _지연_ 로딩됩니다.

<!--
_Preloading_ is something in between.
Consider the _Crisis Center_.
It isn't the first view that a user sees.
By default, the _Heroes_ are the first view.
For the smallest initial payload and fastest launch time,
you should eagerly load the `AppModule` and the `HeroesModule`.
-->
_사전로딩(preloading)_ 은 두 방식의 중간 정도 되는 개념입니다.
_위기대응센터_ 를 생각해 봅시다.
이 모듈은 사용자가 처음 애플리케이션을 실행했을 때 보는 화면이 아닙니다.
기본적으로 이 애플리케이션의 첫 화면은 _히어로_ 화면입니다.
그래서 애플리케이션의 실행 속도를 빠르게 하려면 `AppModule`과 `HeroesModule`은 즉시 로딩하는 것이 좋습니다.

<!--
You could lazy load the _Crisis Center_.
But you're almost certain that the user will visit the _Crisis Center_ within minutes of launching the app.
Ideally, the app would launch with just the `AppModule` and the `HeroesModule` loaded
and then, almost immediately, load the `CrisisCenterModule` in the background.
By the time the user navigates to the _Crisis Center_, its module will have been loaded and ready to go.

That's _preloading_.
-->
_위기대응센터_ 는 물론 지연로딩 할 수도 있습니다.
하지만 대부분의 사용자가 _위기대응센터_ 에 접속한다고 합시다.
이 경우에 이상적인 경우를 생각해보면, 애플리케이션이 실행될 때는 `AppModule`과 `HeroesModule`을 즉시 로드한 채로 실행하지만, 그 이후에 바로 `CrisisCenterModule`을 백그라운드에서 로드하는 것이 좋을 것입니다.
이렇게 구현하면 사용자가 _위기대응센터_ 로 이동했을 때 이미 로드된 모듈을 바로 사용할 수 있습니다.

이것이 _사전로딩_ 입니다.

{@a how-preloading}


<!--
#### How preloading works
-->
#### 사전로딩이 동작하는 방식

<!--
After each _successful_ navigation, the router looks in its configuration for an unloaded module that it can preload.
Whether it preloads a module, and which modules it preloads, depends upon the *preload strategy*.
-->
네비게이션이 _성공적으로_ 실행되고 나면 라우터는 라우터 설정에서 사전로딩할 수 있는 모듈 중에 로드되지 않은 것을 찾습니다.
이 때 모듈을 사전로딩 할지 판단하는데, 이 동작은 *사전로딩 정책(preload strategy)*에 따라 달라집니다.

<!--
The `Router` offers two preloading strategies out of the box:

* No preloading at all which is the default. Lazy loaded feature areas are still loaded on demand.
* Preloading of all lazy loaded feature areas.
-->
`Router`는 두 가지 방식의 사전로딩 정책을 제공합니다:

* 기본값은 모듈을 사전로딩하지 않는 것입니다. 지연로딩은 원래 의도대로 지연 로딩 됩니다.
* 지연로딩되는 모든 모듈을 사전로딩합니다.

<!--
Out of the box, the router either never preloads, or preloads every lazy load module.
The `Router` also supports [custom preloading strategies](#custom-preloading) for
fine control over which modules to preload and when.

In this next section, you'll update the `CrisisCenterModule` to load lazily
by default and use the `PreloadAllModules` strategy
to load it (and _all other_ lazy loaded modules) as soon as possible.
-->
라우터는 모든 모듈을 사전로딩하지 않거나, 모든 모듈을 사전로딩합니다.
그리고 특정 모듈만 사전로딩하려면 [커스텀 사전로딩 정책](#custom-preloading)을 정의해서 사용할 수도 있습니다.

이제부터 `CrisisCenterModule`은 지금과 마찬가지로 지연로딩하고, 다른 모듈은 모두 `PreloadAllModules` 정책을 사용해서 사전로딩하는 방법에 대해 알아봅시다.

{@a lazy-load-crisis-center}


<!--
#### Lazy load the _crisis center_
-->
#### _위기대응센터_ 지연로딩하기

<!--
Update the route configuration to lazy load the `CrisisCenterModule`.
Take the same steps you used to configure `AdminModule` for lazy load.

1. Change the `crisis-center` path in the `CrisisCenterRoutingModule` to an empty string.

1. Add a `crisis-center` route to the `AppRoutingModule`.

1. Set the `loadChildren` string to load the `CrisisCenterModule`.

1. Remove all mention of the `CrisisCenterModule` from `app.module.ts`.


Here are the updated modules _before enabling preload_:
-->
`CrisisCenterModule`을 지연로딩할 수 있도록 라우팅 규칙을 수정합니다.
이 과정은 `AdminModule`에 지연로딩을 적용했던 과정과 같습니다.

1. `CrisisCenterRoutingModule`에서 `crisis-center`에 해당되는 주소를 빈 문자열로 수정합니다.

1. `crisis-center` 라우팅 규칙을 `AppRoutingModule`에 추가합니다.

1. `loadChildren`을 사용해서 `CrisisCenterModule`을 지연로딩 합니다.

1. `app.module.ts` 파일에서 `CrisisCenterModule`과 관련된 코드를 모두 제거합니다.


그러면 애플리케이션 코드는 다음과 같이 변경될 것입니다:

<code-tabs>

  <code-pane header="app.module.ts" path="router/src/app/app.module.ts" region="preload">

  </code-pane>

  <code-pane header="app-routing.module.ts" path="router/src/app/app-routing.module.6.ts" region="preload-v1">

  </code-pane>

  <code-pane header="crisis-center-routing.module.ts" path="router/src/app/crisis-center/crisis-center-routing.module.ts">

  </code-pane>

</code-tabs>


<!--
You could try this now and confirm that the  `CrisisCenterModule` loads after you click the "Crisis Center" button.

To enable preloading of all lazy loaded modules, import the `PreloadAllModules` token from the Angular router package.

The second argument in the `RouterModule.forRoot()` method takes an object for additional configuration options.
The `preloadingStrategy` is one of those options.
Add the `PreloadAllModules` token to the `forRoot()` call:
-->
이렇게 구현한 후에 사용자가 "Crisis Center" 버튼을 클릭하면 `CrisisCenterModule`이 로드되는 것을 확인할 수 있습니다.

그리고 지연로딩되는 모듈을 모두 사전로딩하려면 라우터 패키지에서 `PreloadAllModules`를 로드해서 적용하면 됩니다.

`RouterModule.forRoot` 메소드는 두 번째 인자로 라우터 설정 옵션을 받을 수 있는데, `preloadingStrategy`가 여기에 적용할 수 있는 옵션 중 하나입니다.
`forRoot()` 메소드에 다음과 같이 `PreloadAllModules` 토큰을 추가합니다.

<!--
<code-example path="router/src/app/app-routing.module.6.ts" linenums="false" header="src/app/app-routing.module.ts (preload all)" region="forRoot">
-->
<code-example path="router/src/app/app-routing.module.6.ts" linenums="false" header="src/app/app-routing.module.ts (모두 사전로딩)" region="forRoot">

</code-example>


<!--
This tells the `Router` preloader to immediately load _all_ lazy loaded routes (routes with a `loadChildren` property).

When you visit `http://localhost:4200`, the `/heroes` route loads immediately upon launch
and the router starts loading the `CrisisCenterModule` right after the `HeroesModule` loads.

Surprisingly, the `AdminModule` does _not_ preload. Something is blocking it.
-->
이렇게 구현하면 `Router`는 지연로딩이 적용된 라우팅 규칙(`loadChildren` 프로퍼티가 있는 라우팅 규칙)을 _모두_ 사전로딩합니다.

그래서 `http://localhost:4200`에 접속하면 `/heroes` 주소로 자동으로 이동하는데, 이 때 `HeroesModule`이 로드된 직후에 `CrisisCenterModule`이 바로 로딩되기 시작합니다.

그리고 `AdminModule`은 사전로딩되지 _않습니다_. 이 모듈은 라우팅 가드로 보호되기 때문입니다.

{@a preload-canload}

<!--
#### CanLoad blocks preload
-->
#### CanLoad는 사전로딩을 막습니다.

<!--
The `PreloadAllModules` strategy does not load feature areas protected by a [CanLoad](#can-load-guard) guard.
This is by design.
-->
`PreloadAllModules` 정책을 사용해도 [CanLoad](#can-load-guard)로 보호되는 기능 모듈은 로드되지 않습니다.
이것은 Angular가 의도한 디자인입니다.

<!--
You added a `CanLoad` guard to the route in the `AdminModule` a few steps back
to block loading of that module until the user is authorized.
That `CanLoad` guard takes precedence over the preload strategy.
-->
이전 단계에서 `AdminModule`에 해당하는 라우팅 규칙에 `CanLoad` 라우팅 가드를 적용했습니다. 이 라우팅 가드는 허용되지 않은 사용자가 모듈을 로드하는 것을 방지합니다.
그래서 `CanLoad` 가드는 사전로딩 정책보다 우선 순위가 높습니다.

<!--
If you want to preload a module _and_ guard against unauthorized access,
drop the `canLoad()` guard method and rely on the [canActivate()](#can-activate-guard) guard alone.
-->
만약 모듈을 사전로딩하면서 허용되지 않은 사용자가 모듈에 접근하는 것 동시에 제한하려고 한다면 `canLoad()` 가드를 제거하고 [canActivate()](#can-activate-guard)만 단독으로 사용해야 합니다.

{@a custom-preloading}

<!--
### Custom Preloading Strategy
-->
### 커스텀 사전로딩 정책

<!--
Preloading every lazy loaded modules works well in many situations,
but it isn't always the right choice, especially on mobile devices and over low bandwidth connections.
You may choose to preload only certain feature modules, based on user metrics and other business and technical factors.
-->
지연로딩되는 모듈을 사전로딩하는 것은 대부분의 경우에 문제없이 활용할 수 있지만 이 방식이 항상 최선인 것은 아닙니다. 대역폭이 상대적으로 작은 모바일 장치의 경우가 특히 그렇습니다.
이런 경우에는 개발자의 의도나 애플리케이션의 필요에 따라, 기술적인 이슈를 고려하며 특정 기능모듈만 선택적으로 사전로딩하는 것이 나을 수 있습니다.

<!--
You can control what and how the router preloads with a custom preloading strategy.

In this section, you'll add a custom strategy that _only_ preloads routes whose `data.preload` flag is set to `true`.
Recall that you can add anything to the `data` property of a route.

Set the `data.preload` flag in the `crisis-center` route in the `AppRoutingModule`.
-->
커스텀 사전로딩 정책을 작성하면 라우터의 사전로딩 동작을 더 구체적으로 제어할 수 있습니다.

이번 섹션에서는 커스텀 사전로딩 정책을 작성해서 라우팅 규칙의 `data.preload` 플래그가 `true`인 모듈만 사전로딩하도록 구현해 봅시다.
이전에 살펴봤던 것처럼 라우팅 규칙에는 `data` 프로퍼티를 사용해서 인자를 전달할 수 있습니다.

`AppRoutingModule`에 정의된 `crisis-center` 라우팅 규칙에 `data.preload` 플래그를 다음과 같이 설정합니다.

<!--
<code-example path="router/src/app/app-routing.module.ts" linenums="false" header="src/app/app-routing.module.ts (route data preload)" region="preload-v2">
-->
<code-example path="router/src/app/app-routing.module.ts" linenums="false" header="src/app/app-routing.module.ts (사전로딩 설정)" region="preload-v2">

</code-example>

<!--
Generate a new `SelectivePreloadingStrategy` service.
-->
그리고 다음 명령을 실행해서 `SelectivePreloadingStrategy` 서비스를 생성합니다.

<code-example language="none" class="code-shell">
  ng generate service selective-preloading-strategy
</code-example>


<!--
<code-example path="router/src/app/selective-preloading-strategy.service.ts" linenums="false" header="src/app/selective-preloading-strategy.service.ts (excerpt)">
-->
<code-example path="router/src/app/selective-preloading-strategy.service.ts" linenums="false" header="src/app/selective-preloading-strategy.service.ts (일부)">

</code-example>


<!--
`SelectivePreloadingStrategyService` implements the `PreloadingStrategy`, which has one method, `preload`.

The router calls the `preload` method with two arguments:

1. The route to consider.
1. A loader function that can load the routed module asynchronously.
-->
`SelectivePreloadingStrategyService`는 `PreloadingStrategy` 인터페이스를 기반으로 구현하기 때문에 `preload` 메소드를 작성해야 합니다.

그러면 라우터가 이 `preload` 메소드를 실행할 때 두 개의 인자를 함께 전달합니다:

1. 판단 대상이 되는 라우팅 규칙
1. 모듈을 비동기로 로드하는 함수

<!--
An implementation of `preload` must return an `Observable`.
If the route should preload, it returns the observable returned by calling the loader function.
If the route should _not_ preload, it returns an `Observable` of `null`.
-->
`preload` 메소드는 반드시 `Observable`을 반환해야 합니다.
그리고 라우팅 규칙을 사전로딩하려면 로더 함수를 실행한 결과를 반환하면 됩니다.
라우팅 규칙을 사전로딩하지 _않으려면_ `null`을 `Observable` 타입으로 반환하면 됩니다.

<!--
In this sample, the  `preload` method loads the route if the route's `data.preload` flag is truthy.

It also has a side-effect.
`SelectivePreloadingStrategyService` logs the `path` of a selected route in its public `preloadedModules` array.

Shortly, you'll extend the `AdminDashboardComponent` to inject this service and display its `preloadedModules` array.
-->
이 예제에서는 `data.preload` 플래그 값에 따라 `preload` 메소드가 라우팅 규칙을 로드한 결과를 반환하거나 `null` 값을 반환합니다.

그리고 이 함수는 또 다른 동작을 하나 합니다.
`SelectivePreloadingStrategyService`는 처리되고 있는 라우팅 규칙을 콘솔에 출력하면서 이 서비스 인스턴스의 `preloadedModules` 배열에 이 라우팅 규칙을 추가합니다.

그래서 `AdminDashboardComponent`에서 이 서비스를 의존성으로 주입받으면서 `preloadedModules` 배열에 있는 내용을 확인하는 용도로 확장할 수도 있습니다.

<!--
But first, make a few changes to the `AppRoutingModule`.

1. Import `SelectivePreloadingStrategyService` into `AppRoutingModule`.
1. Replace the `PreloadAllModules` strategy in the call to `forRoot()` with this `SelectivePreloadingStrategyService`.
1. Add the `SelectivePreloadingStrategyService` strategy to the `AppRoutingModule` providers array so it can be injected
elsewhere in the app.
-->
그러기 위해서는 먼저 `AppRoutingModule`을 조금 수정해야 합니다.

1. `AppRoutingModule`에 `SelectivePreloadingStrategyService`를 로드합니다.
1. `forRoot()`에 적용했던 `PreloadAllModules` 정책을 `SelectivePreloadingStrategyService`로 변경합니다.
1. 애플리케이션 전역에 사용할 수 있도록 `SelectivePreloadingStrategyService` 정책을 `AppRoutingModule` 프로바이더 배열에 추가합니다.

<!--
Now edit the `AdminDashboardComponent` to display the log of preloaded routes.

1. Import the `SelectivePreloadingStrategyService`.
1. Inject it into the dashboard's constructor.
1. Update the template to display the strategy service's `preloadedModules` array.

When you're done it looks like this.
-->
그리고 이제 사전로딩되는 라우팅 규칙을 확인하기 위해 `AdminDashboardComponent`를 수정합니다.

1. `SelectivePreloadingStrategyService`를 로드합니다.
1. 컴포넌트의 생성자에 이 서비스를 주입합니다.
1. 서비스의 `preloadedModules` 배열을 화면에 표시하도록 템플릿을 수정합니다.

이렇게 작성하면 다음과 같은 코드가 됩니다.

<!--
<code-example path="router/src/app/admin/admin-dashboard/admin-dashboard.component.ts" linenums="false" header="src/app/admin/admin-dashboard/admin-dashboard.component.ts (preloaded modules)">
-->
<code-example path="router/src/app/admin/admin-dashboard/admin-dashboard.component.ts" linenums="false" header="src/app/admin/admin-dashboard/admin-dashboard.component.ts (사전로딩하는 모듈 확인하기)">

</code-example>


<!--
Once the application loads the initial route, the `CrisisCenterModule` is preloaded.
Verify this by logging in to the `Admin` feature area and noting that the `crisis-center` is listed in the `Preloaded Modules`.
It's also logged to the browser's console.
-->
이제 애플리케이션이 실행되고 초기 라우팅 동작이 끝나고 나면 `CrisisCenterModule`이 사전로딩됩니다.
이 동작은 `Admin` 기능 모듈에서 화면에 표시하는 내용으로 확인할 수 있으며, `crisis-center` 라우팅 규칙은 이 목록에 표함되지 않는 것도 확인할 수 있습니다.
이 내용은 브라우저 콘솔에도 동일하게 표시됩니다.

{@a redirect-advanced}

<!--
## Migrating URLs with Redirects
-->
## 리다이렉트로 URL 마이그레이션 하기

<!--
You've setup the routes for navigating around your application. You've used navigation imperatively and declaratively to many different routes. But like any application, requirements change over time. You've setup links and navigation to `/heroes` and `/hero/:id` from the `HeroListComponent` and `HeroDetailComponent` components. If there was a requirement that links to `heroes` become `superheroes`, you still want the previous URLs to navigate correctly. You also don't want to go and update every link in your application, so redirects makes refactoring routes trivial.
-->
라우팅 규칙은 애플리케이션에서 네비게이션 동작을 실행하기 위해 작성합니다.
이 때 명시적으로 네비게이션을 실행하기 위해 여러가지 라우팅 규칙을 작성해보기도 했습니다.
하지만 애플리케이션을 개발하면서 요구사항은 언제나 바뀔 수 있습니다.
지금까지는 `HeroListComponent`와 `HeroDetailComponent`로 네비게이션하기 위해 `/heroes`와 `/hero/:id` 라우팅 규칙을 정의했습니다.
그런데 요구사항이 변경되어 `heroes` 주소가 `superheroes`로 변경해야 하지만, 이전에 제공하던 URL도 그대로 제공해야 한다고 합시다.
개발자의 입장에서도 애플리케이션에 존재하는 모든 링크를 수정하는 것은 반가운 일이 아닙니다. 그래서 이전 주소를 새로운 주소로 리다이렉트하는 방식으로 리팩토링하는 방법에 대해 알아봅시다.

{@a url-refactor}

<!--
### Changing /heroes to /superheroes
-->
### /heroes를 /superheroes로 변경하기

<!--
Let's take the `Hero` routes and migrate them to new URLs. The `Router` checks for redirects in your configuration before navigating, so each redirect is triggered when needed. To support this change, you'll add redirects from the old routes to the new routes in the `heroes-routing.module`.
-->
`Hero`와 관련된 라우팅 규칙을 모두 새로운 URL로 마이그레이션 해봅시다.
`Router`는 네비게이션 동작을 실행하기 전에 해당 라우팅 규칙에 리다이렉트 설정이 있는지 확인하며, 리다이렉트 설정이 있으면 해당 주소로 이동합니다.
그래서 `heroes-routing.module`에서 원래 사용하던 주소는 새로운 주소로 리다이렉트하는 설정을 추가해야 합니다.

<!--
<code-example path="router/src/app/heroes/heroes-routing.module.ts" linenums="false" header="src/app/heroes/heroes-routing.module.ts (heroes redirects)">
-->
<code-example path="router/src/app/heroes/heroes-routing.module.ts" linenums="false" header="src/app/heroes/heroes-routing.module.ts (heroes 리다이렉트)">

</code-example>

<!--
You'll notice two different types of redirects. The first change is from  `/heroes` to `/superheroes` without any parameters. This is a straightforward redirect, unlike the change from `/hero/:id` to `/superhero/:id`, which includes the `:id` route parameter. Router redirects also use powerful pattern matching, so the `Router` inspects the URL and replaces route parameters in the `path` with their appropriate destination. Previously, you navigated to a URL such as `/hero/15` with a route parameter `id` of `15`.
-->
이 코드에서 두가지 종류의 리다이렉트를 확인할 수 있습니다.
첫번째는 라우팅 변수 없이 `/heroes`에서 `/superheroes`로 리다이렉트하는 라우팅 규칙입니다.
이 방식은 `/hero/:id`를 `/superhero/:id`로 리다이렉트할 때 라우팅 변수 `:id`를 사용하는 것과 비교했을 때 좀 더 간단합니다.
그리고 라우터는 훌륭한 패턴 매칭 시스젬을 제공하기 때문에 네비게이션하는 주소에 존재하는 라우팅 변수를 추출할 수 있습니다.
위에서 살펴본 것처럼 `/hero/15` 라는 주소로 이동할 때 라우터가 추출하는 라우팅 변수 `id`의 값은 `15`입니다.

<div class="alert is-helpful">

<!--
The `Router` also supports [query parameters](#query-parameters) and the [fragment](#fragment) when using redirects.

* When using absolute redirects, the `Router` will use the query parameters and the fragment from the redirectTo in the route config.
* When using relative redirects, the `Router` use the query params and the fragment from the source URL.
-->
`Router`에서 리다이렉트를 할 때도 [쿼리 파라미터](#query-parameters)와 [프래그먼트](#fragment)를 사용할 수 있습니다.

* 절대 주소로 리다이렉트 하면 `Router`는 라우팅 규칙의 `reditercTo`에 해당하는 쿼리 파라미터와 프래그먼트를 활용합니다.
* 상대 주소로 리다이렉트 하면 `Router`는 해당 URL에 해당하는 쿼리 파라미터와 프래그먼트를 활용합니다.

</div>

<!--
Before updating the `app-routing.module.ts`, you'll need to consider an important rule. Currently, our empty path route redirects to `/heroes`, which redirects to `/superheroes`. This _won't_ work and is by design as the `Router` handles redirects once at each level of routing configuration. This prevents chaining of redirects, which can lead to endless redirect loops.

So instead, you'll update the empty path route in `app-routing.module.ts` to redirect to `/superheroes`.
-->
그런데 `app-routing.module.ts` 파일을 수정하기 전에 중요하게 짚고 넘어가야 할 것이 있습니다.
애플리케이션이 처음 실행되면 빈 문자열 라우팅 규칙이 적용되기 때문에 `/heroes`로 리다이렉트하는데, `/heroes` 주소는 `/superheroes`로 다시 리다이렉트 될것이라 생각할 수 있습니다.
하지만 라우터는 한 번에 라우팅 규칙 하나만 처리하기 때문에 이런 리다이렉션은 동작하지 않습니다.
이 방식은 리다이렉션 체이닝 때문에 발생할 수 있는 무한루프를 방지하기 위한 것이기도 합니다.

<!--
<code-example path="router/src/app/app-routing.module.ts" linenums="false" header="src/app/app-routing.module.ts (superheroes redirect)">
-->
<code-example path="router/src/app/app-routing.module.ts" linenums="false" header="src/app/app-routing.module.ts (superheroes 리다이렉트)">

</code-example>

<!--
`RouterLink`s aren't tied to route configuration, so you'll need to update the associated router links so they remain active when the new route is active. You'll update the `app.component.ts` template for the `/heroes` routerLink.
-->
`RouterLink`는 라우팅 규칙 설정과 직접적으로 연결되지 않기 때문에 변경된 주소로 이동할 수 있도록 라우터 링크의 설정을 수정해야 합니다.
`app.component.ts` 템플릿에 있는 라우터 링크 중 `/heroes`로 이동하던 라우터 링크를 다음과 같이 변경합니다.

<!--
<code-example path="router/src/app/app.component.html" linenums="false" header="src/app/app.component.html (superheroes active routerLink)">
-->
<code-example path="router/src/app/app.component.html" linenums="false" header="src/app/app.component.html (superheroes 라우터 링크)">

</code-example>

<!--
Update the `goToHeroes()` method in the `hero-detail.component.ts` to navigate back to `/superheroes` with the optional route parameters.
-->
그리고 `hero-detail.component.ts` 파일에 있는 `goToHeroes()` 메소드에서도 `/superheroes`로 이동하도록 수정합니다.

<code-example path="router/src/app/heroes/hero-detail/hero-detail.component.ts" linenums="false" region="redirect" header="src/app/heroes/hero-detail/hero-detail.component.ts (goToHeroes)">

</code-example>

<!--
With the redirects setup, all previous routes now point to their new destinations and both URLs still function as intended.
-->
여기까지 수정하고 나면 기존에 동작하던 라우팅 규칙은 모두 새로운 주소로 연결됩니다.


{@a inspect-config}


<!--
## Inspect the router's configuration
-->
## 라우터 설정 확인하기

<!--
You put a lot of effort into configuring the router in several routing module files
and were careful to list them [in the proper order](#routing-module-order).
Are routes actually evaluated as you planned?
How is the router really configured?

You can inspect the router's current configuration any time by injecting it and
examining its `config` property.
For example, update the `AppModule` as follows and look in the browser console window
to see the finished route configuration.
-->
라우팅 규칙은 여러 모듈에 분산되어 작성될 수 있기 때문에 이 라우팅 규칙들은 [올바른 순서로](#routing-module-order) 등록되어야 합니다.
라우팅 규칙이 최종적으로 어떻게 조합되었는지 확인하는 방법이 있을까요?
라우터는 실제로 어떻게 설정되었을까요?

라우터의 설정값은 `config` 프로퍼티를 참조하면 확인할 수 있습니다.
간단하게 `AppModule`을 다음과 같이 수정하고 브라우저 콘솔을 확인하면, 브라우저 콘솔로 라우터 설정을 확인할 수 있습니다.

<code-example path="router/src/app/app.module.7.ts" linenums="false" header="src/app/app.module.ts (inspect the router config)" region="inspect-config">

</code-example>


{@a final-app}

<!--
## Wrap up and final app
-->
## 정리하기

<!--
You've covered a lot of ground in this guide and the application is too big to reprint here.
Please visit the <live-example title="Router Sample in Stackblitz"></live-example>
where you can download the final source code.
-->
이 가이드에서는 라우터와 네비게이션에 대한 내용을 방대하게 살펴봤기 때문에 애플리케이션 코드를 여기에 모두 나열하기에는 너무 내용이 많습니다.
예제로 다룬 코드의 최종 버전은 <live-example title="Router Sample in Stackblitz"></live-example>에서 확인하거나 다운받아 확인하는 것을 권장합니다.

{@a appendices}


<!--
## Appendices
-->
## 부록

<!--
The balance of this guide is a set of appendices that
elaborate some of the points you covered quickly above.

The appendix material isn't essential. Continued reading is for the curious.
-->
지금까지 설명한 내용중 간단하게 짚고 넘어갔던 부분은 부록으로 제공합니다.

부록에서 설명하는 내용을 꼭 알아야 하는 것은 아닙니다. 참고삼아 읽어보세요.

{@a link-parameters-array}


<!--
### Appendix: link parameters array
-->
### 부록: 링크 파라미터 배열 (link parameters array)

<!--
A link parameters array holds the following ingredients for router navigation:

* The *path* of the route to the destination component.
* Required and optional route parameters that go into the route URL.

You can bind the `RouterLink` directive to such an array like this:
-->
링크 파라미터 배열은 라우터가 네비게이션할 때 필요한 정보를 지정하는 용도로 사용합니다:

* 화면에 표시할 컴포넌트에 해당하는 *주소*를 지정할 수 있습니다.
* 목적지로 이동할 때 사용하는 필수 라우팅 변수나 옵션 라우팅 변수를 지정할 수 있습니다.

그래서 `RouterLink` 디렉티브는 다음과 같이 사용하는 것이 일반적입니다:


<code-example path="router/src/app/app.component.3.ts" linenums="false" header="src/app/app.component.ts (h-anchor)" region="h-anchor">

</code-example>


<!--
You've written a two element array when specifying a route parameter like this:
-->
라우팅 변수를 지정하려면 다음과 같이 엘리먼트가 2개인 배열을 사용할 수 있습니다:

<code-example path="router/src/app/heroes/hero-list/hero-list.component.1.html" linenums="false" header="src/app/heroes/hero-list/hero-list.component.html (nav-to-detail)" region="nav-to-detail">

</code-example>


<!--
You can provide optional route parameters in an object like this:
-->
옵션 인자는 다음과 같이 객체 형태로 전달할 수도 있습니다:

<code-example path="router/src/app/app.component.3.ts" linenums="false" header="src/app/app.component.ts (cc-query-params)" region="cc-query-params">

</code-example>


<!--
These three examples cover the need for an app with one level routing.
The moment you add a child router, such as the crisis center, you create new link array possibilities.

Recall that you specified a default child route for the crisis center so this simple `RouterLink` is fine.
-->
이 3가지 예제로도 애플리케이션에 필요한 기본 라우팅은 모두 처리할 수 있습니다.
그리고 위기대응센터와 같은 자식 라우터를 활용한다면 이 배열을 좀 더 확장해서 사용할 수도 있습니다.

기본 자식 라우팅 규칙을 지정했다면 다음과 같이 간단하게 사용할 수 있습니다.

<code-example path="router/src/app/app.component.3.ts" linenums="false" header="src/app/app.component.ts (cc-anchor-w-default)" region="cc-anchor-w-default">

</code-example>


<!--
Parse it out.

* The first item in the array identifies the parent route (`/crisis-center`).
* There are no parameters for this parent route so you're done with it.
* There is no default for the child route so you need to pick one.
* You're navigating to the `CrisisListComponent`, whose route path is `/`, but you don't need to explicitly add the slash.
* Voilà! `['/crisis-center']`.

Take it a step further. Consider the following router link that
navigates from the root of the application down to the *Dragon Crisis*:
-->
이 코드는 다음과 같이 해석할 수 있습니다.

* 배열의 첫번째 항목은 새로 적용될 부모 라우팅 규칙(`/crisis-center`)을 의미합니다.
* 부모 라우팅 규칙에 사용되는 라우팅 변수는 없습니다.
* 자식 라우터의 기본 라우팅 규칙은 지정되지 않았기 때문에 하나를 골라야 합니다.
* 이동하려는 컴포넌트는 `CrisisListComponent`이며 이 라우팅 규칙의 주소는 '/'로 지정되어 있지만, 슬래시는 생략해도 됩니다.
* 배열의 최종 형태는 `['/crisis-center']`가 됩니다.

<code-example path="router/src/app/app.component.3.ts" linenums="false" header="src/app/app.component.ts (Dragon-anchor)" region="Dragon-anchor">

</code-example>


<!--
* The first item in the array identifies the parent route (`/crisis-center`).
* There are no parameters for this parent route so you're done with it.
* The second item identifies the child route details about a particular crisis (`/:id`).
* The details child route requires an `id` route parameter.
* You added the `id` of the *Dragon Crisis* as the second item in the array (`1`).
* The resulting path is `/crisis-center/1`.


If you wanted to, you could redefine the `AppComponent` template with *Crisis Center* routes exclusively:
-->
* 배열의 첫번째 항목은 새로 적용될 부모 라우팅 규칙(`/crisis-center`)을 의미합니다.
* 부모 라우팅 규칙에 사용되는 라우팅 변수는 없습니다.
* 배열의 두번째 아이템은 자식 라우팅 규칙에서 표시할 특정 위기의 `id`를 의미합니다. 이 변수는 `/:id`와 맵핑됩니다.
* 세부정보를 표시하는 자식 라우팅 규칙에는 `id` 라우팅 변수가 필요합니다.
* *용 출현 위기*에 해당하는 `id`를 지정하기 위해 배열의 두 번째 아이템에는 `1`을 지정합니다.
* 최종 주소는 `/crisis-center/1`이 됩니다.

<!--
<code-example path="router/src/app/app.component.3.ts" linenums="false" header="src/app/app.component.ts (template)" region="template">
-->
<code-example path="router/src/app/app.component.3.ts" linenums="false" header="src/app/app.component.ts (템플릿)" region="template">

</code-example>


<!--
In sum, you can write applications with one, two or more levels of routing.
The link parameters array affords the flexibility to represent any routing depth and
any legal sequence of route paths, (required) router parameters, and (optional) route parameter objects.
-->
라우팅 규칙은 여러개를 한 번에 적용할 수 있습니다.
링크 파라미터 배열은 자유로운 라우팅을 위해 유연하게 설계되었으며, 필수 라우팅 변수나 옵션 라우팅 변수도, 객체 형태의 라우팅 변수도 모두 처리할 수 있습니다.

{@a browser-url-styles}


{@a location-strategy}

{@a appendix-locationstrategy-and-browser-url-styles}


<!--
### Appendix: *LocationStrategy* and browser URL styles
-->
### 부록: *LocationStrategy*와 브라우저 URL 스타일

<!--
When the router navigates to a new component view, it updates the browser's location and history
with a URL for that view.
This is a strictly local URL. The browser shouldn't send this URL to the server
and should not reload the page.
-->
라우터는 새로운 컴포넌트를 화면에 띄울 때 이 컴포넌트에 해당하는 주소를 브라우저의 현재 위치에 반영하고 히스토리에도 추가합니다.
이 때 사용하는 주소는 온전히 로컬 URL입니다. 브라우저는 이 URL을 서버로 보내거나 새로운 주소로 다시 접속하지 않습니다.

<!--
Modern HTML5 browsers support
<a href="https://developer.mozilla.org/en-US/docs/Web/API/History_API#Adding_and_modifying_history_entries" title="HTML5 browser history push-state">history.pushState</a>,
a technique that changes a browser's location and history without triggering a server page request.
The router can compose a "natural" URL that is indistinguishable from
one that would otherwise require a page load.
-->
최신 HTML5를 지원하는 브라우저는 현재 주소를 바꾸면서 서버로 추가 요청을 보내지 않을 때 사용하는 <a href="https://developer.mozilla.org/en-US/docs/Web/API/History_API#Adding_and_modifying_history_entries" title="HTML5 browser history push-state">history.pushState</a>를 제공합니다.
그래서 Angular 라우터도 페이지를 새로 로드하지 않으면서 URL을 "자연스럽게" 변경할 수 있습니다.

<!--
Here's the *Crisis Center* URL in this "HTML5 pushState" style:
-->
*위기대응센터*에 해당하는 URL을 "HTML5 pushState" 스타일로 표현하면 다음과 같습니다:

<code-example format="nocode">
  localhost:3002/crisis-center/

</code-example>


<!--
Older browsers send page requests to the server when the location URL changes
_unless_ the change occurs after a "#" (called the "hash").
Routers can take advantage of this exception by composing in-application route
URLs with hashes.  Here's a "hash URL" that routes to the *Crisis Center*.
-->
하지만 최신 스펙을 제공하지 않는 브라우저는 URL이 변경될 때마다 서버로 새로운 페이지 요청을 보내는데, 이 동작은 해시("#") 이후의 주소가 바뀔 때도 마찬가지입니다.
그래서 라우터는 이렇게 주소가 바뀌는 동작은 애플리케이션 안에서 라우팅할 수 있도록 예외로 처리합니다.
*위기대응센터*에 해당하는 URL을 "해시방식의 URL" 스타일로 표현하면 다음과 같습니다:

<code-example format="nocode">
  localhost:3002/src/#/crisis-center/

</code-example>


<!--
The router supports both styles with two `LocationStrategy` providers:

1. `PathLocationStrategy`&mdash;the default "HTML5 pushState" style.
1. `HashLocationStrategy`&mdash;the "hash URL" style.

The `RouterModule.forRoot()` function sets the `LocationStrategy` to the `PathLocationStrategy`,
making it the default strategy.
You can switch to the `HashLocationStrategy` with an override during the bootstrapping process if you prefer it.
-->
`LocationStrategy` 프로바이더를 사용하면 이 두 동작 중 어떤 방식을 사용할지 선택할 수 있습니다.

1. `PathLocationStrategy`&mdash;기본값이며 "HTML5 pushState" 스타일을 사용합니다.
1. `HashLocationStrategy`&mdash;"해시방식의 URL" 스타일을 사용합니다.

이 옵션은 `RouterModule.forRoot()` 함수에 지정합니다.
그래서 `HashLocationStrategy` 방식을 사용하려면 부트스트랩 과정에 이 옵션을 적용하면 됩니다.

<div class="alert is-helpful">


<!--
Learn about providers and the bootstrap process in the
[Dependency Injection guide](guide/dependency-injection#bootstrap).
-->
부트스트랩 단계에서 프로바이더를 등록하는 방법을 더 알아보려면 [의존성 주입 가이드](guide/dependency-injection#bootstrap) 문서를 참고하세요.

</div>


<!--
#### Which strategy is best?
-->
#### 어떤 방식이 제일 좋은가요?

<!--
You must choose a strategy and you need to make the right call early in the project.
It won't be easy to change later once the application is in production
and there are lots of application URL references in the wild.
-->
브라우저에서 URL을 표시하는 정책은 프로젝트 초반에 결정해야 합니다.
왜냐하면 URL을 사용하는 부분이 이미 많은 곳에 적용되어 운영중인 애플리케이션에서 이 정책을 변경하는 것은 매우 어렵기 때문입니다.

<!--
Almost all Angular projects should use the default HTML5 style.
It produces URLs that are easier for users to understand.
And it preserves the option to do _server-side rendering_ later.
-->
대부분의 Angular 프로젝트는 HTML5 스타일을 그대로 사용하는 것이 좋습니다.
HTML5 스타일을 사용하는 것이 사용자가 더 이해하기 쉽기도 합니다.
그리고 이 정책을 사용하면 이후에 _서버사이드 렌더링_ 을 적용하기도 쉽습니다.

<!--
Rendering critical pages on the server is a technique that can greatly improve
perceived responsiveness when the app first loads.
An app that would otherwise take ten or more seconds to start
could be rendered on the server and delivered to the user's device
in less than a second.
-->
페이지를 서버에서 렌더링하는 것은 앱 실행 속도를 비약적으로 향상시킬 수 있는 테크닉입니다.
실행하는 데에 10초 이상 걸리는 앱을 서버에서 렌더링하면 사용자의 디바이스에서 1초 안에 실행되게 할 수 있습니다. 

<!--
This option is only available if application URLs look like normal web URLs
without hashes (#) in the middle.
-->
하지만 이 방식은 애플리케이션의 URL이 해시(#) 없이 일반적으로 사용하는 웹 URL 형식일 때만 유효합니다.

<!--
Stick with the default unless you have a compelling reason to
resort to hash routes.
-->
해시 라우팅을 반드시 사용해야 하는 경우가 아니라면 기본 방식을 사용하는 것이 좋습니다.

<!--
#### The *&lt;base href>*
-->
#### *&lt;base href>*

<!--
The router uses the browser's
<a href="https://developer.mozilla.org/en-US/docs/Web/API/History_API#Adding_and_modifying_history_entries" title="HTML5 browser history push-state">history.pushState</a>
for navigation. Thanks to `pushState`, you can make in-app URL paths look the way you want them to
look, e.g. `localhost:4200/crisis-center`. The in-app URLs can be indistinguishable from server URLs.
-->
라우터는 네비게이션 동작을 실행할 때 브라우저가 제공하는 <a href="https://developer.mozilla.org/en-US/docs/Web/API/History_API#Adding_and_modifying_history_entries" title="HTML5 browser history push-state">history.pushState</a> API를 사용합니다.
애플리케이션에서 동작하는 URL을 이해하기 쉽게 `localhost:4200/crisis-center`와 같은 형식으로 표시할 수 있도 `pushState` 덕분입니다.
애플리케이션 안에서 사용하는 URL은 서버에 요청하는 URL과 같은 형식이기 때문에 이질감없이 사용할 수 있습니다.

<!--
Modern HTML5 browsers were the first to support `pushState` which is why many people refer to these URLs as
"HTML5 style" URLs.
-->
많은 개발자들이 이런 URL 방식을 선호하기 때문에 최근 HTML5 스펙을 지원하는 브라우저는 모두 `pushState`를 지원하고 있습니다.
 
<div class="alert is-helpful">


<!--
HTML5 style navigation is the router default.
In the [LocationStrategy and browser URL styles](#browser-url-styles) Appendix,
learn why HTML5 style is preferred, how to adjust its behavior, and how to switch to the
older hash (#) style, if necessary.
-->
라우터를 기본 설정으로 사용하면 HTML5 스타일로 네비게이션합니다.
왜 HTML5 스타일이 더 인기가 있는지, 두 방식의 동작이 어떻게 다른지, 이전 방식인 해시(#) 스타일로 바꾸는지 알아보려면 부록 [LocationStrategy와 브라우저 URL 스타일](#browser-url-styles)을 참고하세요.

</div>


<!--
You must **add a
<a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base" title="base href">&lt;base href&gt; element</a>**
to the app's `index.html` for `pushState` routing to work.
The browser uses the `<base href>` value to prefix *relative* URLs when referencing
CSS files, scripts, and images.

Add the `<base>` element just after the  `<head>` tag.
If the `app` folder is the application root, as it is for this application,
set the `href` value in **`index.html`** *exactly* as shown here.
-->
`pushState`를 사용하는 라우팅이 제대로 동작하려면 애플리케이션의 `index.html` 파일에 **<a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base" title="base href">&lt;base href&gt; 엘리먼트</a>**를 추가해야 합니다.
그러면 브라우저는 `<base href>`에 지정된 주소를 기준으로 CSS 파일과 스크립트, 이미지 파일에 대한 *상대* 주소를 참조합니다.

`<base>` 엘리먼트는 `<head>` 태그 바로 아래에 추가하는 것이 좋습니다.
이 예제에서 살펴본 것처럼 애플리케이션의 최상위 폴더가 `app` 폴더라면 **`index.html`**에 지정하는 `href` 값을 다음과 같이 지정하면 됩니다.

<code-example path="router/src/index.html" linenums="false" header="src/index.html (base-href)" region="base-href">

</code-example>

<!--
#### HTML5 URLs and the  *&lt;base href>*
-->
#### HTML5 방식의 URL과 *&lt;base href>*

<!--
While the router uses the
<a href="https://developer.mozilla.org/en-US/docs/Web/API/History_API#Adding_and_modifying_history_entries" title="Browser history push-state">HTML5 pushState</a>
style by default, you *must* configure that strategy with a **base href**.

The preferred way to configure the strategy is to add a
<a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base" title="base href">&lt;base href&gt; element</a>
tag in the `<head>` of the `index.html`.
-->
라우터가 <a href="https://developer.mozilla.org/en-US/docs/Web/API/History_API#Adding_and_modifying_history_entries" title="Browser history push-state">HTML5 pushState</a> 스타일을 기본 옵션으로 사용한다고 해도 **base href**는 *반드시* 설정해야 합니다.

그리고 <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base" title="base href">&lt;base href&gt; 엘리먼트</a>를 가장 간단하게 설정하는 방법은 `index.html` 파일의 `<head>` 태그 안에 이 엘리먼트를 추가하는 것입니다.

<code-example path="router/src/index.html" linenums="false" header="src/index.html (base-href)" region="base-href">

</code-example>


<!--
Without that tag, the browser may not be able to load resources
(images, CSS, scripts) when "deep linking" into the app.
Bad things could happen when someone pastes an application link into the
browser's address bar or clicks such a link in an email.
-->
이 태그가 없으면 애플리케이션의 "딥 링크 (deep linking)" 기능으로 참조하는 이미지 파일이나 CSS, 스크립트 파일을 로드할 수 없습니다.
그리고 애플리케이션이 동작하던 주소를 브라우저 주소표시줄에 그대로 붙여넣거나 이메일에 있던 링크를 클릭해도 애플리케이션은 제대로 동작하지 않습니다.

<!--
Some developers may not be able to add the `<base>` element, perhaps because they don't have
access to `<head>` or the `index.html`.
-->
`index.html` 파일이나 `<head>` 태그를 직접 수정할 수 없는 이유가 있어서 `<base>` 엘리먼트를 적용할 수 없을 수도 있습니다.

<!--
Those developers may still use HTML5 URLs by taking two remedial steps:

1. Provide the router with an appropriate [APP_BASE_HREF][] value.
1. Use _root URLs_ for all web resources: CSS, images, scripts, and template HTML files.
-->
이 경우에는 다음과 같이 우회하는 방법으로 HTML5 방식의 URL을 사용할 수 있습니다.

1. 라우터에 [APP_BASE_HREF][] 값을 직접 설정합니다.
1. CSS 파일이나 이미지 파일, 스크립트 파일, 템플릿 HTML 파일을 모두 _루트 URL_ 부터 시작하도록 작성합니다.

{@a hashlocationstrategy}

#### *HashLocationStrategy*

<!--
You can go old-school with the `HashLocationStrategy` by
providing the `useHash: true` in an object as the second argument of the `RouterModule.forRoot()`
in the `AppModule`.
-->
`AppModule`에 등록하는 `RouterModule.forRoot` 메소드에는 두 번째 인자로 옵션을 지정할 수 있는데, 이 객체에 `useHash: true`를 지정하면 `HashLocationStrategy` 방식을 사용할 수 있습니다.

<!--
<code-example path="router/src/app/app.module.6.ts" linenums="false" header="src/app/app.module.ts (hash URL strategy)">
-->
<code-example path="router/src/app/app.module.6.ts" linenums="false" header="src/app/app.module.ts (해시 URL 정책)">

</code-example>
