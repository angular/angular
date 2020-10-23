<!--
# In-app navigation: routing to views
-->
# 네비게이션: 화면 전환

<!--
In a single-page app, you change what the user sees by showing or hiding portions of the display that correspond to particular components, rather than going out to the server to get a new page.
As users perform application tasks, they need to move between the different [views](guide/glossary#view "Definition of view") that you have defined.

To handle the navigation from one [view](guide/glossary#view) to the next, you use the Angular **`Router`**.
The **`Router`** enables navigation by interpreting a browser URL as an instruction to change the view.

To explore a sample app featuring the router's primary features, see the <live-example></live-example>.
-->
단일 페이지 앱에서는 사용자가 보는 화면을 변경할 때 페이지 전체를 서버에서 새로 받아오는 것이 아니라 특정 영역을 표시하거나 감추는 방식으로 전환합니다.
그래서 사용자가 작업을 수행하다 보면 사전에 정의해둔 [화면](guide/glossary#view "Definition of view")을 자주 전환하게 됩니다.

어떤 [화면](guide/glossary#view)을 다른 화면으로 전환하려면 Angular가 제공하는 **`Router`**를 사용하면 됩니다.
**`Router`**는 브라우저가 접속한 URL을 해석해서 적절한 화면을 표시하는 역할을 합니다.

라우터의 주요 기능이 동작하는 것은 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.


<!--
## Prerequisites
-->
## 사전지식

<!--
Before creating a route, you should be familiar with the following:

* [Basics of components](guide/architecture-components)
* [Basics of templates](guide/glossary#template)
* An Angular app&mdash;you can generate a basic Angular app using the [Angular CLI](cli).

For an introduction to Angular with a ready-made app, see [Getting Started](start).
For a more in-depth experience of building an Angular app, see the [Tour of Heroes](tutorial) tutorial. Both guide you through using component classes and templates.
-->
라우팅 규칙(route)을 정의하기 전에 먼저 이런 내용을 알아두는 것이 좋습니다:

* [컴포넌트 기본 지식](guide/architecture-components)
* [템플릿 기본 지식](guide/glossary#template)
* Angular 앱 &mdash; [Angular CLI](cli)를 활용하면 Angular 앱을 간단하게 생성할 수 있습니다.

사전에 준비된 형태에서 Angular 개발을 시작하려면 [시작하기](start) 문서를 참고하세요.
그리고 [히어로들의 여행](tutorial) 튜토리얼을 진행하면 Angular 앱을 개발하는 방법에 대해 좀 더 자세하게 학습할 수 있습니다.
두 가이드 문서 모두 컴포넌트 클래스와 컴포넌트 템플릿에 대해 다룹니다.

<hr />


{@a basics}

<!--
## Generate an app with routing enabled
-->
## 라우팅 가능한 상태로 앱 생성하기

<!--
The following command uses the Angular CLI to generate a basic Angular app with an app routing module, called `AppRoutingModule`, which is an NgModule where you can configure your routes.
The app name in the following example is `routing-app`.

<code-example language="none" class="code-shell">
  ng new routing-app --routing
</code-example>

When generating a new app, the CLI prompts you to select CSS or a CSS preprocessor.
For this example, accept the default of `CSS`.
-->
Angular CLI로 다음과 같은 명령을 실행하면 Angular 앱을 생성하면서 `AppRoutingModule` 이라고 하는 라우팅 모듈을 함께 생성합니다.
이 모듈은 애플리케이션의 라우팅 규칙을 관리하는 NgModule입니다.
`routing-app` 이라는 이름으로 앱을 생성하는 명령은 이렇습니다.

<code-example language="none" class="code-shell">
  ng new routing-app --routing
</code-example>

애플리케이션을 생성하는 과정에 Angular CLI는 CSS 전처리기를 사용할 것인지 물어봅니다.
이번 예제에서는 기본 `CSS`를 선택합니다.


<!--
### Adding components for routing
-->
### 라우팅할 컴포넌트 생성하기

<!--
To use the Angular router, an app needs to have at least two components so that it can navigate from one to the other. To create a component using the CLI, enter the following at the command line where `first` is the name of your component:

<code-example language="none" class="code-shell">
  ng generate component first
</code-example>

Repeat this step for a second component but give it a different name.
Here, the new name is `second`.

<code-example language="none" class="code-shell">
  ng generate component second
</code-example>

The CLI automatically appends `Component`, so if you were to write `first-component`, your component would be `FirstComponentComponent`.

{@a basics-base-href}

<div class="alert is-helpful">

  #### `<base href>`

  This guide works with a CLI-generated Angular app.
  If you are working manually, make sure that you have `<base href="/">` in the `<head>` of your index.html file.
  This assumes that the `app` folder is the application root, and uses `"/"`.

  </code-example>

</div>
-->
Angular 라우터를 사용해서 화면을 전환하려면 컴포넌트가 적어도 2개는 있어야 합니다.
다음 명령을 실행해서 `first` 라는 이름으로 컴포넌트를 생성합니다:

<code-example language="none" class="code-shell">
  ng generate component first
</code-example>

그리고 다른 이름으로 두 번째 컴포넌트를 생성합니다.
이번에는 `seconds` 라는 이름으로 컴포넌트를 생성해 봅시다.

<code-example language="none" class="code-shell">
  ng generate component second
</code-example>

Angular CLI는 컴포넌트를 생성할 때 자동으로 접미사를 붙이기 때문에, 컴포넌트 이름을 `first-component` 라고 지정하면 실제 컴포넌트 클래스 이름은 `FirstComponentComponent`가 되니 주의하세요.


{@a basics-base-href}

<div class="alert is-helpful">

#### `<base href>`

이 가이드문서는 Angular CLI로 생성한 Angular 앱을 다룹니다.
만약 Angular CLI를 사용하지 않는다면 index.html 파일의 `<head>` 태그에 `<base href="/">` 를 추가해야 합니다.
이 태그를 추가하면 `app` 폴더를 애플리케이션 최상위 주소 `"/"` 와 연결합니다.

</code-example>

</div>


<!--
### Importing your new components
-->
### 컴포넌트 로드하기

<!--
To use your new components, import them into `AppRoutingModule` at the top of the file, as follows:

<code-example header="AppRoutingModule (excerpt)">

import { FirstComponent } from './first/first.component';
import { SecondComponent } from './second/second.component';

</code-example>
-->
새로 만든 컴포넌트를 사용하려면 `AppRoutingModule` 파일 제일 위쪽에서 이 컴포넌트들을 로드해야 합니다:

<code-example header="AppRoutingModule (일부)">

import { FirstComponent } from './first/first.component';
import { SecondComponent } from './second/second.component';

</code-example>


{@a basic-route}

<!--
## Defining a basic route
-->
## 기본 라우팅 규칙 정의하기

<!--
There are three fundamental building blocks to creating a route.

Import the `AppRoutingModule` into `AppModule` and add it to the `imports` array.

The Angular CLI performs this step for you.
However, if you are creating an app manually or working with an existing, non-CLI app, verify that the imports and configuration are correct.
The following is the default `AppModule` using the CLI with the `--routing` flag.

  <code-example path="router/src/app/app.module.8.ts" header="Default CLI AppModule with routing">

  </code-example>

  1. Import `RouterModule` and `Routes` into your routing module.

  The Angular CLI performs this step automatically.
  The CLI also sets up a `Routes` array for your routes and configures the `imports` and `exports` arrays for `@NgModule()`.

  <code-example path="router/src/app/app-routing.module.7.ts" header="CLI app routing module">

  </code-example>

1. Define your routes in your `Routes` array.

  Each route in this array is a JavaScript object that contains two properties.
  The first property, `path`, defines the URL path for the route.
  The second property, `component`, defines the component Angular should use for the corresponding path.

  <code-example path="router/src/app/app-routing.module.8.ts" region="routes" header="AppRoutingModule (excerpt)">

  </code-example>

  1. Add your routes to your application.

  Now that you have defined your routes, you can add them to your application.
  First, add links to the two components.
  Assign the anchor tag that you want to add the route to the `routerLink` attribute.
  Set the value of the attribute to the component to show when a user clicks on each link.
  Next, update your component template to include `<router-outlet>`.
  This element informs Angular to update the application view with the component for the selected route.

  <code-example path="router/src/app/app.component.7.html" header="Template with routerLink and router-outlet"></code-example>
-->
라우팅 규칙은 세가지 요소로 구성됩니다.

`AppModule`이 정의된 파일에 `AppRoutingModule`을 로드하고 이 라우팅 모듈을 `AppModule` `imports` 배열에 추가합니다.

Angular CLI로 앱을 생성했다면 이 과정은 이미 처리되어 있습니다.
하지만 앱을 직접 생성했거나 이미 있는 앱을 기반으로 작업한다면 라우팅 모듈이 제대로 로드 되었는지, `imports` 배열에 추가되었는지 꼭 확인해야 합니다.
아래 코드는 `--routing` 플래그를 붙여서 Angular CLI로 앱을 생성했을 때 자동으로 생성된 `AppModule` 코드입니다.

  <code-example path="router/src/app/app.module.8.ts" header="Angular CLI가 자동으로 생성한 AppModule">
  </code-example>

  1. 라우팅 모듈이 정의된 파일에 `RouterModule`와 `Routes`를 로드합니다.

  이 과정도 Angular CLI가 자동으로 처리했을 것입니다.
  그리고 `Routes` 배열을 함께 생성하며 `@NgModule()`의 `imports` 배열과 `exports` 배열도 자동으로 구성합니다.

  <code-example path="router/src/app/app-routing.module.7.ts" header="Angular CLI가 생성한 라우팅 모듈">
  </code-example>

1. 이제 라우팅 규칙을 `Routes` 배열에 등록합니다.

  이 배열에는 라우팅 규칙(route)은 JavaScript 객체 형태로 등록하며, 이 객체는 프로퍼티가 2개 존재합니다.
  첫번째로 `path` 프로퍼티는 라우팅 규칙에 해당하는 URL 주소를 지정합니다.
  그리고 `component` 프로퍼티는 해당 URL 주소에 연결될 컴포넌트를 지정합니다.

  <code-example path="router/src/app/app-routing.module.8.ts" region="routes" header="AppRoutingModule (일부)">

  </code-example>

  1. 라우팅 규칙을 애플리케이션에 등록합니다.

  라우팅 규칙을 모두 정의했다면 이 규칙을 애플리케이션에 등록해야 합니다.
  먼저 두 컴포넌트와 연결되는 링크를 추가합니다.
  링크는 `<a>` 엘리먼트에 `routerLink` 어트리뷰트를 사용하는 방식으로 구현합니다.
  이 어트리뷰트에는 사용자가 링크를 클릭했을 때 이동할 주소를 지정합니다.
  그리고 컴포넌트 템플릿에 `<router-outlet>`을 추가합니다.
  이 엘리먼트는 Angular가 애플리케이션 화면을 전환할 때 관련 컴포넌트가 표시될 위치를 지정하는 엘리먼트입니다.

  <code-example path="router/src/app/app.component.7.html" header="routerLink와 router-outlet이 추가된 템플릿"></code-example>


{@a route-order}

<!--
### Route order
-->
### 라우팅 규칙 적용 순서

<!--
The order of routes is important because the `Router` uses a first-match wins strategy when matching routes, so more specific routes should be placed above less specific routes.
List routes with a static path first, followed by an empty path route, which matches the default route.
The [wildcard route](guide/router#setting-up-wildcard-routes) comes last because it matches every URL and the `Router`  selects it only if no other routes match first.
-->
Angular `Router`는 라우팅 규칙 중 첫번째로 매칭되는 라우팅 규칙을 적용하기 때문에 라우티 규칙을 등록하는 순서가 중요한데, 구체적인 라우팅 규칙을 가장 먼저 등록하고 덜 구체적인 라우팅 규칙을 나중에 등록하는 것이 좋습니다.
그래서 고정된 주소를 먼저 등록하며, 그 다음에 빈 주소를 등록하고, 마지막으로 기본 라우팅 규칙을 등록합니다.
그리고 브라우저가 접속한 주소에 해당하는 라우팅 규칙이 하나도 없을 때 적용되는 [와일드카드 라우팅 규칙](guide/router#setting-up-wildcard-routes)은 가장 마지막에 작성합니다.


{@a getting-route-information}

<!--
## Getting route information
-->
## 라우팅 규칙으로 전달된 정보 참조하기

<!--
Often, as a user navigates your application, you want to pass information from one component to another.
For example, consider an application that displays a shopping list of grocery items.
Each item in the list has a unique `id`.
To edit an item, users click an Edit button, which opens an `EditGroceryItem` component.
You want that component to retrieve the `id` for the grocery item so it can display the right information to the user.

You can use a route to pass this type of information to your application components.
To do so, you use the [ActivatedRoute](api/router/ActivatedRoute) interface.

To get information from a route:

  1. Import `ActivatedRoute` and `ParamMap` to your component.

    <code-example path="router/src/app/heroes/hero-detail/hero-detail.component.ts" region="imports-route-info" header="In the component class (excerpt)">
    </code-example>

    These `import` statements add several important elements that your component needs.
    To learn more about each, see the following API pages:

      * [`Router`](api/router)
      * [`ActivatedRoute`](api/router/ActivatedRoute)
      * [`ParamMap`](api/router/ParamMap)

  1. Inject an instance of `ActivatedRoute` by adding it to your application's constructor:

    <code-example path="router/src/app/heroes/hero-detail/hero-detail.component.ts" region="activated-route" header="In the component class (excerpt)">
    </code-example>

  1. Update the `ngOnInit()` method to access the `ActivatedRoute` and track the `id` parameter:

      <code-example header="In the component (excerpt)">
        ngOnInit() {
          this.route.queryParams.subscribe(params => {
            this.name = params['name'];
          });
        }
      </code-example>

    Note: The preceding example uses a variable, `name`, and assigns it the value based on the `name` parameter.

{@a wildcard-route-how-to}
-->
때로는 사용자가 화면을 전환할 때 교체되는 컴포넌트 사이에 정보를 전달해야 할 때가 있습니다.
애플리케이션에서 식료품 목록을 보여주고 있다고 합시다.
목록으로 표시된 개별 식료품에는 고유한 `id` 값이 있습니다.
사용자가 식료품 정보를 수정하기 위해 Edit 버튼을 클릭하면 `EditGroceryItem` 컴포넌트가 화면에 표시될 것입니다.
이 때 새로 표시되는 컴포넌트는 사용자가 어떤 식료품을 선택했는지 알기 위해 해당 상품에 대한 `id` 값을 전달받아야 합니다.

이런 데이터는 라우팅 규칙을 통해 전달할 수 있습니다.
[ActivatedRoute](api/router/ActivatedRoute) 인터페이스를 활용하면 됩니다.

라우팅 규칙으로 전달된 데이터를 참조해 봅시다:

  1. 컴포넌트가 정의된 파일에 `ActivatedRoute`와 `ParamMap` 심볼을 로드합니다.

    <code-example path="router/src/app/heroes/hero-detail/hero-detail.component.ts" region="imports-route-info" header="In the component class (일부)">
    </code-example>

    이 `import` 구문으로 로드한 클래스를 활용하면 컴포넌트에 필요한 정보를 참조할 수 있습니다.
    각각에 대해 자세하게 알아보려면 개별 API 문서를 참고하세요:

      * [`Router` API 문서](api/router)
      * [`ActivatedRoute` API 문서](api/router/ActivatedRoute)
      * [`ParamMap` API 문서](api/router/ParamMap)

  1. 생성자에 `ActivatedRoute` 인스턴스를 의존성으로 주입합니다:

    <code-example path="router/src/app/heroes/hero-detail/hero-detail.component.ts" region="activated-route" header="In the component class (일부)">
    </code-example>

  1. `ngOnInit()` 메소드에서 `ActivatedRoute` 객체 안에 있는 `id` 인자를 참조합니다:

      <code-example header="컴포넌트 코드 (일부)">
        ngOnInit() {
          this.route.queryParams.subscribe(params => {
            this.id = params['id'];
          });
        }
      </code-example>


{@a wildcard-route-how-to}
{@a setting-up-wildcard-routes}

<!--
## Setting up wildcard routes
-->
## 와일드카드(`*`) 라우팅 규칙 등록하기

<!--
A well-functioning application should gracefully handle when users attempt to navigate to a part of your application that does not exist.
To add this functionality to your application, you set up a wildcard route.
The Angular router selects this route any time the requested URL doesn't match any router paths.

To set up a wildcard route, add the following code to your `routes` definition.

<code-example header="AppRoutingModule (excerpt)">

{ path: '**', component: <component-name> }

</code-example>


The two asterisks, `**`, indicate to Angular that this `routes` definition is a wildcard route.
For the component property, you can define any component in your application.
Common choices include an application-specific `PageNotFoundComponent`, which you can define to [display a 404 page](guide/router#404-page-how-to) to your users; or a redirect to your application's main component.
A wildcard route is the last route because it matches any URL.
For more detail on why order matters for routes, see [Route order](guide/router#route-order).
-->
완성도 높은 애플리케이션이라면 애플리케이션이 허용하지 않는 주소로 사용자가 접근했을 때도 자연스럽게 처리해야 합니다.
이 기능을 구현하려면 와일드카드 라우팅 규칙을 추가하면 됩니다.
이 규칙을 등록하면 사용자가 등록되지 않은 URL로 화면을 이동하려고 할 때 와일드카드 라우팅 규칙이 적용됩니다.

와일드카드 라우팅 규칙을 설정하려면 `routes` 배열에 다음 코드를 추가하면 됩니다.

<code-example header="AppRoutingModule (일부)">

  { path: '**', component: <component-name> }

</code-example>

별표(`*`, asterisk) 2개가 사용된 `**`는 Angular가 와일드카드 라우팅 규칙을 구분하기 위한 문자열입니다.
그리고 `component`에는 와일드카드 라우팅 규칙이 적용될 때 화면에 표시할 컴포넌트를 지정합니다.
일반적으로는 `PageNotFoundComponent`와 같은 컴포넌트를 만들어서 [404 에러 페이지](guide/router#404-page-how-to)를 표시하거나, 애플리케이션 최상위 주소로 리다이렉션하는 방법을 선택할 수 있습니다.
와일드카드 라우팅 규칙은 모든 URL과 매칭되기 때문에 라우팅 규칙 중 가장 나중에 등록해야 합니다.
라우팅 규칙의 순서에 대해 자세하게 알아보려면 [라우팅 규칙 적용 순서](guide/router#route-order) 문서를 참고하세요.


{@a 404-page-how-to}

<!--
## Displaying a 404 page
-->
## 404 에러 페이지 표시하기

<!--
To display a 404 page, set up a [wildcard route](guide/router#wildcard-route-how-to) with the `component` property set to the component you'd like to use for your 404 page as follows:

<code-example path="router/src/app/app-routing.module.8.ts" region="routes-with-wildcard" header="AppRoutingModule (excerpt)">

</code-example>

The last route with the `path` of `**` is a wildcard route.
The router selects this route if the requested URL doesn't match any of the paths earlier in the list and sends the user to the `PageNotFoundComponent`.
-->
404 에러 페이지를 표시하려면 [와일드카드 라우팅 규칙](guide/router#wildcard-route-how-to)을 등록할 때 `component`에 원하는 컴포넌트를 지정하면 됩니다:

<code-example path="router/src/app/app-routing.module.8.ts" region="routes-with-wildcard" header="AppRoutingModule (일부)">
</code-example>

마지막에 등록된 `path`가 `**`인 라우팅 규칙이 와일드카드 라우팅 규칙입니다.
이제 접속하려는 URL과 매칭되는 라우팅 규칙을 발견하지 못하면 이 라우팅 규칙이 적용되면서 `PageNotFoundComponent`가 화면에 표시됩니다.


<!--
## Setting up redirects
-->
## 리다이렉션 설정하기

<!--
To set up a redirect, configure a route with the `path` you want to redirect from, the `component` you want to redirect to, and a `pathMatch` value that tells the router how to match the URL.

<code-example path="router/src/app/app-routing.module.8.ts" region="redirect" header="AppRoutingModule (excerpt)">

</code-example>

In this example, the third route is a redirect so that the router defaults to the `first-component` route.
Notice that this redirect precedes the wildcard route.
Here, `path: ''` means to use the initial relative URL (`''`).

For more details on `pathMatch` see [Spotlight on `pathMatch`](guide/router-tutorial-toh#pathmatch).
-->
리다이렉션하는 라우팅 규칙을 등록하려면 `path`에 대상이 될 주소를 지정하고 `redirectTo`에 리다이렉션할 주소를 지정한 뒤에 `pathMatch`에 원하는 리다이렉현할 때 적용할 규칙을 지정합니다.

<code-example path="router/src/app/app-routing.module.8.ts" region="redirect" header="AppRoutingModule (일부)">
</code-example>

이 예제에서 세번째 추가된 라우팅 규칙은 기본 주소로 접근했을 때 `first-component` 주소로 이동하도록 작성한 리다이렉션 라우팅 규칙입니다.
이 규칙이 와일드카드 라우팅 앞에 온다는 것도 확인해 보세요.
이 예제에서 작성한 `path: ''`는 애플리케이션을 접속하는 기본 URL(`''`)을 의미합니다.

`pathMatch`에 대해 자세하게 알아보려면 [`pathMatch` 자세하게 알아보기](guide/router-tutorial-toh#pathmatch) 문서를 참고하세요.


{@a nesting-routes}

<!--
## Nesting routes
-->
## 중첩 라우팅 규칙

<!--
As your application grows more complex, you may want to create routes that are relative to a component other than your root component.
These types of nested routes are called child routes.
This means you're adding a second `<router-outlet>` to your app, because it is in addition to the `<router-outlet>` in `AppComponent`.

In this example, there are two additional child components, `child-a`, and `child-b`.
Here, `FirstComponent` has its own `<nav>` and a second `<router-outlet>` in addition to the one in `AppComponent`.

<code-example path="router/src/app/app.component.8.html" region="child-routes" header="In the template">

</code-example>

A child route is like any other route, in that it needs both a `path` and a `component`.
The one difference is that you place child routes in a `children` array within the parent route.

<code-example path="router/src/app/app-routing.module.9.ts" region="child-routes" header="AppRoutingModule (excerpt)">

</code-example>
-->
애플리케이션이 점점 복잡해지다 보면 특정 컴포넌트 안에서 동작하는 라우팅 규칙을 추가하고 싶은 경우도 있습니다.
이렇게 중첩된 라우팅 규칙을 자식 라우팅 규칙(child route)이라고 합니다.
라우팅 규칙을 중첩해서 적용하려면 컴포넌트에 `<router-outlet>`을 더 추가해야 합니다.
왜냐하면 첫번째 계층에서 동작하는 라우팅 규칙은 `AppComponent`의 `<router-outlet>` 안에서 동작하기 때문입니다.

아래 예제 코드에는 자식 컴포넌트가 `child-a`, `child-b` 2개 존재합니다.
그리고 `FirstComponent`에는 `<nav>`가 존재하며 `AppComponent`에 있는 `<router-outlet>` 외에 또다른 `<router-outlet>`이 추가되어 있습니다.

<code-example path="router/src/app/app.component.8.html" region="child-routes" header="In the template">
</code-example>

자식 라우팅 규칙도 일반 라우팅 규칙과 비슷하게 `path`, `component` 프로퍼티로 정의합니다.
자식 라우팅 규칙은 부모 라우팅 규칙이 있고, 부모 라우팅 규칙의 `children` 배열에 정의한다는 점만 다릅니다.

<code-example path="router/src/app/app-routing.module.9.ts" region="child-routes" header="AppRoutingModule (일부)">
</code-example>


{@a using-relative-paths}

<!--
## Using relative paths
-->
## 상대주소 사용하기

<!--
Relative paths allow you to define paths that are relative to the current URL segment.
The following example shows a relative route to another component, `second-component`.
`FirstComponent` and `SecondComponent` are at the same level in the tree, however, the link to `SecondComponent` is situated within the `FirstComponent`, meaning that the router has to go up a level and then into the second directory to find the `SecondComponent`.
Rather than writing out the whole path to get to `SecondComponent`, you can use the `../` notation to go up a level.

<code-example path="router/src/app/app.component.8.html" region="relative-route" header="In the template">

</code-example>

In addition to `../`, you can use `./` or no leading slash to specify the current level.
-->
상대주소를 사용하면 현재 URL에 상대적인 위치로 라우팅할 주소를 지정할 수 있습니다.
아래 예제는 `second-component`로 이동하는 링크에 상대주소를 적용한 예제 코드입니다.
`FirstComponent`와 `SecondComponent`는 라우팅 계층 트리에서 같은 계층에 있지만 이 링크는 `FirstComponent` 안에서 `SecondComponent`로 이동하는 기능을 제공하려고 합니다.
결국 상위 계층으로 한단계 이동한 후에 `SecondComponent`를 찾아야 합니다.
이 때 `SecondComponent`로 이동하는 전체 경로를 사용하는 대신 상대 주소를 가리키는 방식으로 `../` 라는 표현을 사용했습니다.

<code-example path="router/src/app/app.component.8.html" region="relative-route" header="In the template">
</code-example>

`../`와 비슷하게 `./`, `.`를 사용하면 현재 라우팅 계층의 빈 주소를 가리킵니다.


<!--
### Specifying a relative route
-->
### 상대 주소로 이동하기

<!--
To specify a relative route, use the `NavigationExtras` `relativeTo` property.
In the component class, import `NavigationExtras` from the `@angular/router`.

Then use `relativeTo` in your navigation method.
After the link parameters array, which here contains `items`, add an object with the `relativeTo` property set to the `ActivatedRoute`, which is `this.route`.

<code-example path="router/src/app/app.component.4.ts" region="relative-to" header="RelativeTo">

The `navigate()` arguments configure the router to use the current route as a basis upon which to append `items`.

</code-example>

The `goToItems()` method interprets the destination URI as relative to the activated route and navigates to the `items` route.
-->
상대 라우팅 규칙을 지정하려면 `NavigationExtras` 객체의 `relativeTo` 프로퍼티를 사용하면 됩니다.
`NavigationExtras` 객체는 `@angular/router`에 정의되어 있는 객체입니다.

화면을 이동할 때 `relativeTo` 옵션을 사용해 봅시다.
아래 예제에서 `items`로 지정된 링크 인자 배열 뒤에 객체 옵션을 추가하고 이 객체에 `relativeTo` 프로퍼티로 `ActivatedRoute`를 지정합니다.
이 예제의 경우에는 `this.route` 입니다.

<code-example path="router/src/app/app.component.4.ts" region="relative-to" header="RelativeTo">
</code-example>

그러면 `navigate()` 함수가 실행되면서 `items` 주소로 이동할 떄 현재 라우팅 규칙에 대한 상대 주소로 이 주소를 처리합니다.


<!--
## Accessing query parameters and fragments
-->
## 쿼리 인자, URL 조각 참고하기

<!--
Sometimes, a feature of your application requires accessing a part of a route, such as a query parameter or a fragment. The Tour of Heroes app at this stage in the tutorial uses a list view in which you can click on a hero to see details. The router uses an `id` to show the correct hero's details.

First, import the following members in the component you want to navigate from.

<code-example header="Component import statements (excerpt)">

import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

</code-example>

Next inject the activated route service:

<code-example header="Component (excerpt)">
constructor(private route: ActivatedRoute) {}
</code-example>

Configure the class so that you have an observable, `heroes$`, a `selectedId` to hold the `id` number of the hero, and the heroes in the `ngOnInit()`, add the following code to get the `id` of the selected hero.
This code snippet assumes that you have a heroes list, a hero service, a function to get your heroes, and the HTML to render your list and details, just as in the Tour of Heroes example.

<code-example header="Component 1 (excerpt)">
heroes$: Observable<Hero[]>;
selectedId: number;
heroes = HEROES;

ngOnInit() {
  this.heroes$ = this.route.paramMap.pipe(
    switchMap(params => {
      this.selectedId = Number(params.get('id'));
      return this.service.getHeroes();
    })
  );
}

</code-example>


Next, in the component that you want to navigate to, import the following members.

<code-example header="Component 2 (excerpt)">

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';

</code-example>

Inject `ActivatedRoute` and `Router` in the constructor of the component class so they are available to this component:


<code-example header="Component 2 (excerpt)">

  hero$: Observable<Hero>;

  constructor(
    private route: ActivatedRoute,
    private router: Router  ) {}

  ngOnInit() {
    const heroId = this.route.snapshot.paramMap.get('id');
    this.hero$ = this.service.getHero(heroId);
  }

  gotoItems(hero: Hero) {
    const heroId = hero ? hero.id : null;
    // Pass along the hero id if available
    // so that the HeroList component can select that item.
    this.router.navigate(['/heroes', { id: heroId }]);
  }

</code-example>
-->
때로는 쿼리 변수나 URL 조각 같은 라우팅 규칙 관련 정보에 접근해야 할 때가 있습니다.
히어로들의 여행 앱에서도 사용자가 히어로를 클릭하면 상세정보 화면으로 이동하는데, 이 때 히어로의 `id`를 인자로 받아서 화면을 구성합니다.

먼저, 아래 심볼들을 컴포넌트 파일에 로드합니다.

<code-example header="Component import statements (일부)">

import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

</code-example>

그리고 현재 활성화된 라우팅 규칙(`ActivatedRoute`)을 의존성으로 주입합니다:

<code-example header="Component (일부)">
constructor(private route: ActivatedRoute) {}
</code-example>

이제 컴포넌트 클래스 `ngOnInit()` 안에서 현재 활성화 된 라우팅 규칙으로 전달되는 `id` 필드를 컴포넌트 클래스의 옵저버블 프로퍼티 `heroes$`에 할당해 봅시다.
이 때 히어로 목록은 배열로 존재하며, 관련 서비스가 이미 주입되어 있고, 화면을 표시하는 템플릿 코드도 이미 준비되어 있다는 것을 전제로 합니다.

<code-example header="Component 1 (일부)">
heroes$: Observable<Hero[]>;
selectedId: number;
heroes = HEROES;

ngOnInit() {
  this.heroes$ = this.route.paramMap.pipe(
    switchMap(params => {
      this.selectedId = Number(params.get('id'));
      return this.service.getHeroes();
    })
  );
}

</code-example>

다음에는 이동하려는 컴포넌트 파일에 이런 심볼들을 로드합니다:

<code-example header="Component 2 (일부)">

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';

</code-example>

컴포넌트 클래스의 생성자에 `ActivatedRoute`와 `Router`를 의존성으로 주입하면 라우터 관련 정보를 참조할 수 있습니다:

<code-example header="Component 2 (일부)">

  hero$: Observable<Hero>;

  constructor(
    private route: ActivatedRoute,
    private router: Router  ) {}

  ngOnInit() {
    const heroId = this.route.snapshot.paramMap.get('id');
    this.hero$ = this.service.getHero(heroId);
  }

  gotoItems(hero: Hero) {
    const heroId = hero ? hero.id : null;
    // 히어로 객체가 전달되면 id를 가져옵니다.
    // HeroList 컴포넌트로 이동합니다.
    this.router.navigate(['/heroes', { id: heroId }]);
  }

</code-example>


{@a lazy-loading}

<!--
## Lazy loading
-->
## 지연 로딩

<!--
You can configure your routes to lazy load modules, which means that Angular only loads modules as needed, rather than loading all modules when the app launches.
Additionally, you can preload parts of your app in the background to improve the user experience.

For more information on lazy loading and preloading see the dedicated guide [Lazy loading NgModules](guide/lazy-loading-ngmodules).
-->
Angular 앱이 실행되는 시점에 로딩되지 않고 필요한 시점에 따로 로딩되는 모듈을 지연 로딩되는 모듈(lazy load module)이라고 합니다.
모듈을 지연로딩하면 앱 초기 실행시간이 짧아지기 때문에 사용자에게 좀 더 나은 사용성을 제공할 수 있습니다.
라우팅 규칙을 정의할 때 지연 로딩되는 모듈로 향하는 라우팅 규칙을 정의할 수 있습니다.

자세한 내용은 지연 로딩과 사전 로딩에 대해 다루는 [지연 로딩되는 NgModule](guide/lazy-loading-ngmodules) 문서를 참고하세요.


{@a preventing-unauthorized-access}

<!--
## Preventing unauthorized access
-->
## 허가되지 않은 접근 차단하기

<!--
Use route guards to prevent users from navigating to parts of an app without authorization.
The following route guards are available in Angular:

* [`CanActivate`](api/router/CanActivate)
* [`CanActivateChild`](api/router/CanActivateChild)
* [`CanDeactivate`](api/router/CanDeactivate)
* [`Resolve`](api/router/Resolve)
* [`CanLoad`](api/router/CanLoad)

To use route guards, consider using component-less routes as this facilitates guarding child routes.

Create a service for your guard:


<code-example language="none" class="code-shell">
  ng generate guard your-guard
</code-example>

In your guard class, implement the guard you want to use.
The following example uses `CanActivate` to guard the route.

<code-example header="Component (excerpt)">
export class YourGuard implements CanActivate {
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      // your  logic goes here
  }
}
</code-example>

In your routing module, use the appropriate property in your `routes` configuration.
Here, `canActivate` tells the router to mediate navigation to this particular route.

<code-example header="Routing module (excerpt)">
{
  path: '/your-path',
  component: YourComponent,
  canActivate: [YourGuard],
}
</code-example>

For more information with a working example, see the [routing tutorial section on route guards](guide/router-tutorial-toh#milestone-5-route-guards).
-->
라우팅 가드를 사용하면 허가되지 않은 앱 영역으로 사용자가 이동하는 것을 방지할 수 있습니다.
Angular는 다음과 같은 라우팅 가드를 제공합니다:

* [`CanActivate`](api/router/CanActivate)
* [`CanActivateChild`](api/router/CanActivateChild)
* [`CanDeactivate`](api/router/CanDeactivate)
* [`Resolve`](api/router/Resolve)
* [`CanLoad`](api/router/CanLoad)

라우팅 가드를 사용할 때는 컴포넌트가-없는(component-less) 라우팅 규칙을 따로 정의해서 자식 라우팅 규칙을 모두 보호하는 방법도 고려해볼만 합니다.

Angular CLI로 가드를 생성하려면 이런 명령을 실행하면 됩니다:

<code-example language="none" class="code-shell">
  ng generate guard your-guard
</code-example>

가드 클래스는 가드가 동작하는 로직을 작성합니다.
아래 예제는 `CanActivate`를 활용하는 가드 예제 코드입니다.

<code-example header="Component (일부)">
export class YourGuard implements CanActivate {
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      // 인증 로직
  }
}
</code-example>

그리고 라우팅 모듈에서 `routes` 배열에 라우팅 가드가 동작할 프로퍼티를 지정하면 됩니다.
이번 예제에서는 `canActivate` 프로퍼티를 사용해서 해당 라우팅 규칙을 보호하는 방식으로 구현했습니다.

<code-example header="Routing module (일부)">
{
  path: '/your-path',
  component: YourComponent,
  canActivate: [YourGuard],
}
</code-example>

더 자세한 내용은 [라우팅 튜토리얼의 라우팅 가드 섹션](guide/router-tutorial-toh#milestone-5-route-guards)을 참고하세요.


<!--
## Link parameters array
-->
## 링크 변수 배열

A link parameters array holds the following ingredients for router navigation:

* The path of the route to the destination component.
* Required and optional route parameters that go into the route URL.

You can bind the `RouterLink` directive to such an array like this:

<code-example path="router/src/app/app.component.3.ts" header="src/app/app.component.ts (h-anchor)" region="h-anchor"></code-example>

The following is a two-element array when specifying a route parameter:

<code-example path="router/src/app/heroes/hero-list/hero-list.component.1.html" header="src/app/heroes/hero-list/hero-list.component.html (nav-to-detail)" region="nav-to-detail"></code-example>

You can provide optional route parameters in an object, as in `{ foo: 'foo' }`:

<code-example path="router/src/app/app.component.3.ts" header="src/app/app.component.ts (cc-query-params)" region="cc-query-params"></code-example>

These three examples cover the needs of an app with one level of routing.
However, with a child router, such as in the crisis center, you create new link array possibilities.

The following minimal `RouterLink` example builds upon a specified [default child route](guide/router-tutorial-toh#a-crisis-center-with-child-routes) for the crisis center.

<code-example path="router/src/app/app.component.3.ts" header="src/app/app.component.ts (cc-anchor-w-default)" region="cc-anchor-w-default"></code-example>

Note the following:

* The first item in the array identifies the parent route (`/crisis-center`).
* There are no parameters for this parent route.
* There is no default for the child route so you need to pick one.
* You're navigating to the `CrisisListComponent`, whose route path is `/`, but you don't need to explicitly add the slash.

Consider the following router link that navigates from the root of the application down to the Dragon Crisis:

<code-example path="router/src/app/app.component.3.ts" header="src/app/app.component.ts (Dragon-anchor)" region="Dragon-anchor"></code-example>

* The first item in the array identifies the parent route (`/crisis-center`).
* There are no parameters for this parent route.
* The second item identifies the child route details about a particular crisis (`/:id`).
* The details child route requires an `id` route parameter.
* You added the `id` of the Dragon Crisis as the second item in the array (`1`).
* The resulting path is `/crisis-center/1`.

You could also redefine the `AppComponent` template with Crisis Center routes exclusively:

<code-example path="router/src/app/app.component.3.ts" header="src/app/app.component.ts (template)" region="template"></code-example>

In summary, you can write applications with one, two or more levels of routing.
The link parameters array affords the flexibility to represent any routing depth and any legal sequence of route paths, (required) router parameters, and (optional) route parameter objects.

{@a browser-url-styles}

{@a location-strategy}

## `LocationStrategy` and browser URL styles

When the router navigates to a new component view, it updates the browser's location and history with a URL for that view.
As this is a strictly local URL the browser won't send this URL to the server and will not reload the page.

Modern HTML5 browsers support <a href="https://developer.mozilla.org/en-US/docs/Web/API/History_API#Adding_and_modifying_history_entries" title="HTML5 browser history push-state">history.pushState</a>, a technique that changes a browser's location and history without triggering a server page request.
The router can compose a "natural" URL that is indistinguishable from one that would otherwise require a page load.

Here's the Crisis Center URL in this "HTML5 pushState" style:

<code-example format="nocode">
  localhost:3002/crisis-center/

</code-example>

Older browsers send page requests to the server when the location URL changes unless the change occurs after a "#" (called the "hash").
Routers can take advantage of this exception by composing in-application route URLs with hashes.
Here's a "hash URL" that routes to the Crisis Center.

<code-example format="nocode">
  localhost:3002/src/#/crisis-center/

</code-example>

The router supports both styles with two `LocationStrategy` providers:

1. `PathLocationStrategy`&mdash;the default "HTML5 pushState" style.
1. `HashLocationStrategy`&mdash;the "hash URL" style.

The `RouterModule.forRoot()` function sets the `LocationStrategy` to the `PathLocationStrategy`, which makes it the default strategy.
You also have the option of switching to the `HashLocationStrategy` with an override during the bootstrapping process.

<div class="alert is-helpful">

For more information on providers and the bootstrap process, see [Dependency Injection](guide/dependency-injection#bootstrap).

</div>

## Choosing a routing strategy

You must choose a routing strategy early in the development of you project because once the application is in production, visitors to your site use and depend on application URL references.

Almost all Angular projects should use the default HTML5 style.
It produces URLs that are easier for users to understand and it preserves the option to do server-side rendering.

Rendering critical pages on the server is a technique that can greatly improve perceived responsiveness when the app first loads.
An app that would otherwise take ten or more seconds to start could be rendered on the server and delivered to the user's device in less than a second.

This option is only available if application URLs look like normal web URLs without hashes (#) in the middle.

## `<base href>`

The router uses the browser's <a href="https://developer.mozilla.org/en-US/docs/Web/API/History_API#Adding_and_modifying_history_entries" title="HTML5 browser history push-state">history.pushState</a> for navigation.
`pushState` allows you to customize in-app URL paths; for example, `localhost:4200/crisis-center`.
The in-app URLs can be indistinguishable from server URLs.

Modern HTML5 browsers were the first to support `pushState` which is why many people refer to these URLs as "HTML5 style" URLs.

<div class="alert is-helpful">

HTML5 style navigation is the router default.
In the [LocationStrategy and browser URL styles](#browser-url-styles) section, learn why HTML5 style is preferable, how to adjust its behavior, and how to switch to the older hash (#) style, if necessary.

</div>

You must add a <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base" title="base href">&lt;base href&gt; element</a> to the app's `index.html` for `pushState` routing to work.
The browser uses the `<base href>` value to prefix relative URLs when referencing CSS files, scripts, and images.

Add the `<base>` element just after the  `<head>` tag.
If the `app` folder is the application root, as it is for this application,
set the `href` value in `index.html` as shown here.

<code-example path="router/src/index.html" header="src/index.html (base-href)" region="base-href"></code-example>

### HTML5 URLs and the  `<base href>`

The guidelines that follow will refer to different parts of a URL. This diagram outlines what those parts refer to:

```
foo://example.com:8042/over/there?name=ferret#nose
\_/   \______________/\_________/ \_________/ \__/
 |           |            |            |        |
scheme    authority      path        query   fragment
```

While the router uses the <a href="https://developer.mozilla.org/en-US/docs/Web/API/History_API#Adding_and_modifying_history_entries" title="Browser history push-state">HTML5 pushState</a> style by default, you must configure that strategy with a `<base href>`.

The preferred way to configure the strategy is to add a <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base" title="base href">&lt;base href&gt; element</a> tag in the `<head>` of the `index.html`.

<code-example path="router/src/index.html" header="src/index.html (base-href)" region="base-href"></code-example>

Without that tag, the browser may not be able to load resources
(images, CSS, scripts) when "deep linking" into the app.

Some developers may not be able to add the `<base>` element, perhaps because they don't have access to `<head>` or the `index.html`.

Those developers may still use HTML5 URLs by taking the following two steps:

1. Provide the router with an appropriate `APP_BASE_HREF` value.
1. Use root URLs (URLs with an `authority`) for all web resources: CSS, images, scripts, and template HTML files.

* The `<base href>` `path` should end with a "/", as browsers ignore characters in the `path` that follow the right-most "/".
* If the `<base href>` includes a `query` part, the `query` is only used if the `path` of a link in the page is empty and has no `query`.
This means that a `query` in the `<base href>` is only included when using `HashLocationStrategy`.
* If a link in the page is a root URL (has an `authority`), the `<base href>` is not used. In this way, an `APP_BASE_HREF` with an authority will cause all links created by Angular to ignore the `<base href>` value.
* A fragment in the `<base href>` is _never_ persisted.

For more complete information on how `<base href>` is used to construct target URIs, see the [RFC](https://tools.ietf.org/html/rfc3986#section-5.2.2) section on transforming references.

{@a hashlocationstrategy}

### `HashLocationStrategy`

You can use `HashLocationStrategy` by providing the `useHash: true` in an object as the second argument of the `RouterModule.forRoot()` in the `AppModule`.

<code-example path="router/src/app/app.module.6.ts" header="src/app/app.module.ts (hash URL strategy)"></code-example>

## Router Reference

The folllowing sections highlight some core router concepts.

{@a basics-router-imports}

### Router imports

The Angular Router is an optional service that presents a particular component view for a given URL.
It is not part of the Angular core and thus is in its own library package, `@angular/router`.

Import what you need from it as you would from any other Angular package.

<code-example path="router/src/app/app.module.1.ts" header="src/app/app.module.ts (import)" region="import-router"></code-example>


<div class="alert is-helpful">

For more on browser URL styles, see [`LocationStrategy` and browser URL styles](#browser-url-styles).

</div>

{@a basics-config}

### Configuration

A routed Angular application has one singleton instance of the `Router` service.
When the browser's URL changes, that router looks for a corresponding `Route` from which it can determine the component to display.

A router has no routes until you configure it.
The following example creates five route definitions, configures the router via the `RouterModule.forRoot()` method, and adds the result to the `AppModule`'s `imports` array.

<code-example path="router/src/app/app.module.0.ts" header="src/app/app.module.ts (excerpt)"></code-example>

{@a example-config}

The `appRoutes` array of routes describes how to navigate.
Pass it to the `RouterModule.forRoot()` method in the module `imports` to configure the router.

Each `Route` maps a URL `path` to a component.
There are no leading slashes in the path.
The router parses and builds the final URL for you, which allows you to use both relative and absolute paths when navigating between application views.

The `:id` in the second route is a token for a route parameter.
In a URL such as `/hero/42`, "42" is the value of the `id` parameter.
The corresponding `HeroDetailComponent` uses that value to find and present the hero whose `id` is 42.

The `data` property in the third route is a place to store arbitrary data associated with
this specific route.
The data property is accessible within each activated route. Use it to store items such as page titles, breadcrumb text, and other read-only, static data.
You can use the [resolve guard](guide/router-tutorial-toh#resolve-guard) to retrieve dynamic data.

The empty path in the fourth route represents the default path for the application&mdash;the place to go when the path in the URL is empty, as it typically is at the start.
This default route redirects to the route for the `/heroes` URL and, therefore, displays the `HeroesListComponent`.

If you need to see what events are happening during the navigation lifecycle, there is the `enableTracing` option as part of the router's default configuration.
This outputs each router event that took place during each navigation lifecycle to the browser console.
Use `enableTracing` only for debugging purposes.
You set the `enableTracing: true` option in the object passed as the second argument to the `RouterModule.forRoot()` method.

{@a basics-router-outlet}

### Router outlet

The `RouterOutlet` is a directive from the router library that is used like a component.
It acts as a placeholder that marks the spot in the template where the router should
display the components for that outlet.

<code-example language="html">
  &lt;router-outlet>&lt;/router-outlet>
  &lt;!-- Routed components go here -->

</code-example>

Given the configuration above, when the browser URL for this application becomes `/heroes`, the router matches that URL to the route path `/heroes` and displays the `HeroListComponent` as a sibling element to the `RouterOutlet` that you've placed in the host component's template.

{@a basics-router-links}

{@a router-link}

### Router links

To navigate as a result of some user action such as the click of an anchor tag, use `RouterLink`.

Consider the following template:

<code-example path="router/src/app/app.component.1.html" header="src/app/app.component.html"></code-example>

The `RouterLink` directives on the anchor tags give the router control over those elements.
The navigation paths are fixed, so you can assign a string to the `routerLink` (a "one-time" binding).

Had the navigation path been more dynamic, you could have bound to a template expression that returned an array of route link parameters; that is, the [link parameters array](guide/router#link-parameters-array).
The router resolves that array into a complete URL.

{@a router-link-active}

### Active router links

The `RouterLinkActive` directive toggles CSS classes for active `RouterLink` bindings based on the current `RouterState`.

On each anchor tag, you see a [property binding](guide/property-binding) to the `RouterLinkActive` directive that looks like `routerLinkActive="..."`.

The template expression to the right of the equal sign, `=`, contains a space-delimited string of CSS classes that the Router adds when this link is active (and removes when the link is inactive).
You set the `RouterLinkActive` directive to a string of classes such as `[routerLinkActive]="'active fluffy'"` or bind it to a component property that returns such a string.

Active route links cascade down through each level of the route tree, so parent and child router links can be active at the same time.
To override this behavior, you can bind to the `[routerLinkActiveOptions]` input binding with the `{ exact: true }` expression. By using `{ exact: true }`, a given `RouterLink` will only be active if its URL is an exact match to the current URL.

{@a basics-router-state}

### Router state

After the end of each successful navigation lifecycle, the router builds a tree of `ActivatedRoute` objects that make up the current state of the router. You can access the current `RouterState` from anywhere in the application using the `Router` service and the `routerState` property.

Each `ActivatedRoute` in the `RouterState` provides methods to traverse up and down the route tree to get information from parent, child and sibling routes.

{@a activated-route}

### Activated route

The route path and parameters are available through an injected router service called the [ActivatedRoute](api/router/ActivatedRoute).
It has a great deal of useful information including:

<table>
  <tr>
    <th>
      Property
    </th>

    <th>
      Description
    </th>
  </tr>

  <tr>
    <td>
      <code>url</code>
    </td>
    <td>

    An `Observable` of the route path(s), represented as an array of strings for each part of the route path.

    </td>
  </tr>

  <tr>
    <td>
      <code>data</code>
    </td>
    <td>

    An `Observable` that contains the `data` object provided for the route.
    Also contains any resolved values from the [resolve guard](guide/router-tutorial-toh#resolve-guard).

    </td>
  </tr>

  <tr>
    <td>
      <code>paramMap</code>
    </td>
    <td>

    An `Observable` that contains a [map](api/router/ParamMap) of the required and [optional parameters](guide/router-tutorial-toh#optional-route-parameters) specific to the route.
    The map supports retrieving single and multiple values from the same parameter.

    </td>
  </tr>

  <tr>
    <td>
      <code>queryParamMap</code>
    </td>
    <td>

    An `Observable` that contains a [map](api/router/ParamMap) of the [query parameters](guide/router-tutorial-toh#query-parameters) available to all routes.
    The map supports retrieving single and multiple values from the query parameter.

    </td>
  </tr>

  <tr>
    <td>
      <code>fragment</code>
    </td>
    <td>

    An `Observable` of the URL [fragment](guide/router-tutorial-toh#fragment) available to all routes.

    </td>
  </tr>

  <tr>
    <td>
      <code>outlet</code>
    </td>
    <td>

    The name of the `RouterOutlet` used to render the route.
    For an unnamed outlet, the outlet name is primary.

    </td>
  </tr>

  <tr>
    <td>
      <code>routeConfig</code>
    </td>
    <td>

    The route configuration used for the route that contains the origin path.

    </td>
  </tr>

    <tr>
    <td>
      <code>parent</code>
    </td>
    <td>

    The route's parent `ActivatedRoute` when this route is a [child route](guide/router-tutorial-toh#child-routing-component).

    </td>
  </tr>

  <tr>
    <td>
      <code>firstChild</code>
    </td>
    <td>

    Contains the first `ActivatedRoute` in the list of this route's child routes.

    </td>
  </tr>

  <tr>
    <td>
      <code>children</code>
    </td>
    <td>

    Contains all the [child routes](guide/router-tutorial-toh#child-routing-component) activated under the current route.

    </td>
  </tr>
</table>

<div class="alert is-helpful">

Two older properties are still available, however, their replacements are preferable as they may be deprecated in a future Angular version.

* `params`: An `Observable` that contains the required and [optional parameters](guide/router-tutorial-toh#optional-route-parameters) specific to the route. Use `paramMap` instead.

* `queryParams`: An `Observable` that contains the [query parameters](guide/router-tutorial-toh#query-parameters) available to all routes.
Use `queryParamMap` instead.

</div>

### Router events

During each navigation, the `Router` emits navigation events through the `Router.events` property.
These events range from when the navigation starts and ends to many points in between. The full list of navigation events is displayed in the table below.

<table>
  <tr>
    <th>
      Router Event
    </th>

    <th>
      Description
    </th>
  </tr>

  <tr>
    <td>
      <code>NavigationStart</code>
    </td>
    <td>

      An [event](api/router/NavigationStart) triggered when navigation starts.

    </td>
  </tr>

  <tr>
    <td>
      <code>RouteConfigLoadStart</code>
    </td>
    <td>

      An [event](api/router/RouteConfigLoadStart) triggered before the `Router`
      [lazy loads](guide/router-tutorial-toh#asynchronous-routing) a route configuration.

    </td>
  </tr>

  <tr>
    <td>
      <code>RouteConfigLoadEnd</code>
    </td>
    <td>

      An [event](api/router/RouteConfigLoadEnd) triggered after a route has been lazy loaded.

    </td>
  </tr>

  <tr>
    <td>
      <code>RoutesRecognized</code>
    </td>
    <td>

      An [event](api/router/RoutesRecognized) triggered when the Router parses the URL and the routes are recognized.

    </td>
  </tr>

  <tr>
    <td>
      <code>GuardsCheckStart</code>
    </td>
    <td>

      An [event](api/router/GuardsCheckStart) triggered when the Router begins the Guards phase of routing.

    </td>
  </tr>

  <tr>
    <td>
      <code>ChildActivationStart</code>
    </td>
    <td>

      An [event](api/router/ChildActivationStart) triggered when the Router begins activating a route's children.

    </td>
  </tr>

  <tr>
    <td>
      <code>ActivationStart</code>
    </td>
    <td>

      An [event](api/router/ActivationStart) triggered when the Router begins activating a route.

    </td>
  </tr>

  <tr>
    <td>
      <code>GuardsCheckEnd</code>
    </td>
    <td>

      An [event](api/router/GuardsCheckEnd) triggered when the Router finishes the Guards phase of routing successfully.

    </td>
  </tr>

  <tr>
    <td>
      <code>ResolveStart</code>
    </td>
    <td>

      An [event](api/router/ResolveStart) triggered when the Router begins the Resolve phase of routing.

    </td>
  </tr>

  <tr>
    <td>
      <code>ResolveEnd</code>
    </td>
    <td>

      An [event](api/router/ResolveEnd) triggered when the Router finishes the Resolve phase of routing successfuly.

    </td>
  </tr>

  <tr>
    <td>
      <code>ChildActivationEnd</code>
    </td>
    <td>

      An [event](api/router/ChildActivationEnd) triggered when the Router finishes activating a route's children.

    </td>
  </tr>

  <tr>
    <td>
      <code>ActivationEnd</code>
    </td>
    <td>

      An [event](api/router/ActivationStart) triggered when the Router finishes activating a route.

    </td>
  </tr>

  <tr>
    <td>
      <code>NavigationEnd</code>
    </td>
    <td>

      An [event](api/router/NavigationEnd) triggered when navigation ends successfully.

    </td>
  </tr>

  <tr>
    <td>
      <code>NavigationCancel</code>
    </td>
    <td>

      An [event](api/router/NavigationCancel) triggered when navigation is canceled.
      This can happen when a [Route Guard](guide/router-tutorial-toh#guards) returns false during navigation,
      or redirects by returning a `UrlTree`.

    </td>
  </tr>

  <tr>
    <td>
      <code>NavigationError</code>
    </td>
    <td>

      An [event](api/router/NavigationError) triggered when navigation fails due to an unexpected error.

    </td>
  </tr>

  <tr>
    <td>
      <code>Scroll</code>
    </td>
    <td>

      An [event](api/router/Scroll) that represents a scrolling event.

    </td>
  </tr>
</table>

When you enable the `enableTracing` option, Angular logs these events to the console.
For an example of filtering router navigation events, see the [router section](guide/observables-in-angular#router) of the [Observables in Angular](guide/observables-in-angular) guide.

### Router terminology

Here are the key `Router` terms and their meanings:

<table>

  <tr>

    <th>
      Router Part
    </th>

    <th>
      Meaning
    </th>

  </tr>

  <tr>

    <td>
      <code>Router</code>
    </td>

    <td>
      Displays the application component for the active URL.
      Manages navigation from one component to the next.
    </td>

  </tr>

  <tr>

    <td>
      <code>RouterModule</code>
    </td>

    <td>
      A separate NgModule that provides the necessary service providers
      and directives for navigating through application views.
    </td>

  </tr>

  <tr>

    <td>
      <code>Routes</code>
    </td>

    <td>
      Defines an array of Routes, each mapping a URL path to a component.
    </td>

  </tr>

  <tr>

    <td>
      <code>Route</code>
    </td>

    <td>
      Defines how the router should navigate to a component based on a URL pattern.
      Most routes consist of a path and a component type.
    </td>

  </tr>

  <tr>

    <td>
      <code>RouterOutlet</code>
    </td>

    <td>
      The directive (<code>&lt;router-outlet></code>) that marks where the router displays a view.
    </td>

  </tr>

  <tr>

    <td>
      <code>RouterLink</code>
    </td>

    <td>
      The directive for binding a clickable HTML element to a route. Clicking an element with a <code>routerLink</code> directive that is bound to a <i>string</i> or a <i>link parameters array</i> triggers a navigation.
    </td>

  </tr>

  <tr>

    <td>
      <code>RouterLinkActive</code>
    </td>

    <td>
      The directive for adding/removing classes from an HTML element when an associated <code>routerLink</code> contained on or inside the element becomes active/inactive.
    </td>

  </tr>

  <tr>

    <td>
      <code>ActivatedRoute</code>
    </td>

    <td>
      A service that is provided to each route component that contains route specific information such as route parameters, static data, resolve data, global query params, and the global fragment.
    </td>

  </tr>

  <tr>

    <td>
      <code>RouterState</code>
    </td>

    <td>
      The current state of the router including a tree of the currently activated routes together with convenience methods for traversing the route tree.
    </td>

  </tr>

  <tr>

    <td>
      <b><i>Link parameters array</i></b>
    </td>

    <td>
      An array that the router interprets as a routing instruction.
      You can bind that array to a <code>RouterLink</code> or pass the array as an argument to the <code>Router.navigate</code> method.
    </td>

  </tr>

  <tr>

    <td>
      <b><i>Routing component</i></b>
    </td>

    <td>
      An Angular component with a <code>RouterOutlet</code> that displays views based on router navigations.
    </td>

  </tr>

</table>
