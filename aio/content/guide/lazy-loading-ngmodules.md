<!--
# Lazy Loading Feature Modules
-->
# 기능모듈 지연로딩 하기

<!--
#### Prerequisites
-->
#### 사전 지식
<!--
A basic understanding of the following:
* [Feature Modules](guide/feature-modules).
* [JavaScript Modules vs. NgModules](guide/ngmodule-vs-jsmodule).
* [Frequently Used Modules](guide/frequent-ngmodules).
* [Types of Feature Modules](guide/module-types).
* [Routing and Navigation](guide/router).
-->
다음 내용을 먼저 이해하고 이 문서를 보는 것이 좋습니다.:
* [기능 모듈](guide/feature-modules)
* [JavaScript 모듈 vs. NgModules](guide/ngmodule-vs-jsmodule)
* [자주 사용하는 NgModule](guide/frequent-ngmodules)
* [기능 모듈의 종류](guide/module-types)
* [라우팅, 네비게이션](guide/router)

<!--
For the final sample app with two lazy loaded modules that this page describes, see the
<live-example></live-example>.
-->
이 문서에서는 지연 로딩되는 모듈 2개를 만들어 봅니다. 이 문서에서 설명하는 예제 코드는 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

<hr>

<!--
## High level view
-->
## 개요

<!--
By default, NgModules are eagerly loaded, which means that as soon as the app loads, so do all the NgModules, whether or not they are immediately necessary. For large apps with lots of routes, consider lazy loading&mdash;a design pattern that loads NgModules as needed. Lazy loading helps keep initial
bundle sizes smaller, which in turn helps decrease load times.

There are three main steps to setting up a lazy loaded feature module:

1. Create the feature module.
1. Create the feature module’s routing module.
1. Configure the routes.
-->
By default, NgModules are eagerly loaded, which means that as soon as the app loads, so do all the NgModules, whether or not they are immediately necessary. For large apps with lots of routes, consider lazy loading&mdash;a design pattern that loads NgModules as needed. Lazy loading helps keep initial
bundle sizes smaller, which in turn helps decrease load times.

기능 모듈을 지연 로딩 하도록 지정하는 것은 세 단계로 구성됩니다.

1. 기능 모듈을 생성합니다.
1. 이 모듈을 연결하는 라우팅 모듈을 생성합니다.
1. 라우터를 설정합니다.

<!--
## Set up an app
-->
## 앱 생성하기

<!--
If you don’t already have an app, you can follow the steps below to
create one with the CLI. If you do already have an app, skip to
[Configure the routes](#config-routes). Enter the following command
where `customer-app` is the name of your app:
-->
아직 프로젝트를 만들지 않았다면 Angular CLI를 사용해서 새로운 애플리케이션을 생성합니다. 이미 있는 앱을 활용하려면 [라우터 설정하기](#config-routes) 부분으로 넘어가세요.
애플리케이션은 다음 명령을 실행해서 생성합니다:

```sh
ng new customer-app --routing
```

<!--
This creates an app called `customer-app` and the `--routing` flag
generates a file called `app-routing.module.ts`, which is one of
the files you need for setting up lazy loading for your feature module.
Navigate into the project by issuing the command `cd customer-app`.
-->
이 명령을 실행하면 `customer-app` 이라는 이름으로 애플리케이션이 생성되는데, 이 때 옵션으로 `--routing` 플래그를 설정했기 때문에 `app-routing.module.ts` 파일이 함께 생성됩니다. 이 파일은 기능 모듈을 지연 로딩하도록 설정할 때 사용합니다.
애플리케이션이 생성되고 나면 `cd customer-app` 명령을 실행해서 프로젝트 폴더로 이동합니다.

<!--
## Create a feature module with routing
-->
## 기능 모듈, 라우팅 모듈 생성하기

<!--
Next, you’ll need a feature module to route to. To make one, enter
the following command at the terminal window prompt where `customers` is the name of the module:
-->
이제 라우터로 연결할 기능 모듈이 필요합니다. 터미널 창에서 다음 명령을 실행해서 `customers` 모듈을 생성합니다:

```sh
ng generate module customers --routing
```

<!--
This creates a customers folder with two files inside; `CustomersModule`
and `CustomersRoutingModule`. `CustomersModule` will act as the gatekeeper
for anything that concerns customers. `CustomersRoutingModule` will handle
any customer-related routing. This keeps the app’s structure organized as
the app grows and allows you to reuse this module while easily keeping its routing intact.
-->
이 명령을 실행하면 `customers` 폴더에 `CustomersModule`과 `CustomersRoutingModule`에 해당하는 파일이 생성됩니다. `CustomersModule`은 고객에 관련된 기능을 전담하는 용도로 사용할 것입니다.
그리고 `CustomersRoutingModule`은 `CustomersModule` 안에서 라우팅 하는 용도로 사용합니다.
이렇게 구성하면 이 모듈의 라우팅 설정은 애플리케이션의 라우팅 설정과 분리되기 때문에 모듈 외부의 영향을 받지 않으며, 이 모듈만 떼서 다른 애플리케이션에 재사용하기도 좋습니다.

<!--
The CLI imports the `CustomersRoutingModule` into the `CustomersModule` by
adding a JavaScript import statement at the top of the file and adding
`CustomersRoutingModule` to the `@NgModule` `imports` array.
-->
Angular CLI로 모듈을 생성하면 `CustomersModule`의 `import` 구문에 자동으로 `CustomersRoutingModule`가 추가되고, `@NgModule` 데코레이터의 `imports` 배열에도 자동으로 추가됩니다.

<!--
## Add a component to the feature module
-->
## 기능 모듈에 컴포넌트 추가하기

<!--
In order to see the module being lazy loaded in the browser, create a component to render some HTML when the app loads `CustomersModule`. At the command line, enter the following:
-->
브라우저에서 모듈이 지연 로딩 되는 것을 확인하려면 `CustomersModule`이 로드되었을 때 화면에 표시할 컴포넌트가 필요합니다. 다음 명령을 실행해서 컴포넌트를 생성합니다:

```sh
ng generate component customers/customer-list
```

<!--
This creates a folder inside of `customers` called `customer-list`
with the four files that make up the component.
-->
이 명령을 실행하면 `customers` 폴더 안에 `customer-list` 폴더가 생성되며, 컴포넌트를 구성하는 4개 파일이 생성됩니다.

<!-- For more information
about components, see [Components](). -->

<!--
Just like with the routing module, the CLI imports the
`CustomerListComponent` into the `CustomersModule`.
-->
모듈을 생성할 때와 마찬가지로, Angular CLI로 컴포넌트를 생성하면 이 컴포넌트는 해당 모듈에 자동으로 추가됩니다.

<!--
## Add another feature module
-->
## 기능 모듈 하나 더 생성하기

<!--
For another place to route to, create a second feature module with routing:
-->
라우팅 동작을 위해 모듈을 하나 더 만듭니다:

```sh
ng generate module orders --routing
```

<!--
This makes a new folder called `orders` containing an `OrdersModule` and an `OrdersRoutingModule`.
-->
이 명령을 실행하면 `orders` 폴더가 생성되고, 이 폴더 안에 `OrdersModule`과 `OrdersRoutingModule`에 해당하는 모듈이 생성됩니다.

<!--
Now, just like with the `CustomersModule`, give it some content:
-->
그리고 `CustomersModule`과 마찬가지로, 이 모듈에도 화면에 표시할 컴포넌트를 생성합니다:

```sh
ng generate component orders/order-list
```

<!--
## Set up the UI
-->
## 화면 구성하기

<!--
Though you can type the URL into the address bar, a nav
is easier for the user and more common. Replace the default
placeholder markup in `app.component.html` with a custom nav
so you can easily navigate to your modules in the browser:
-->
주소표시줄에 URL을 입력해도 원하는 모듈로 이동할 수 있지만, 좀 더 편하게 사용하기 위해 `app.component.html` 파일에 버튼을 추가해 봅시다. 이 파일의 내용을 다음과 같이 작성합니다:

<code-example path="lazy-loading-ngmodules/src/app/app.component.html" region="app-component-template" header="src/app/app.component.html" linenums="false">

</code-example>


<!--
To see your app in the browser so far, enter the following command in the terminal window:
-->
그리고 애플리케이션을 브라우저에 실행하기 위해 다음 명령을 실행합니다:

```sh
ng serve
```

<!--
Then go to `localhost:4200` where you should see “app works!” and three buttons.
-->
이제 브라우저를 실행하고 `localhost:4200`으로 이동하면 "app works!" 메시지와 함께 버튼이 3개 표시되는 것을 확인할 수 있습니다.

<figure>
 <img src="generated/images/guide/lazy-loading-ngmodules/three-buttons.png" width="300" alt="three buttons in the browser">
</figure>

<!--
To make the buttons work, you need to configure the routing modules.
-->
이제 버튼을 동작시키기 위해 라우터 모듈을 설정해 봅시다.

{@a config-routes}

<!--
## Configure the routes
-->
## 라우터 설정하기

<!--
The two feature modules, `OrdersModule` and `CustomersModule`, have to be
wired up to the `AppRoutingModule` so the router knows about them. The structure is as follows:
-->
`OrdersModule`과 `CustomersModule`을 `AppRoutingModule`를 통해 연결하려고 합니다. 이 구조를 그림으로 표현하면 다음과 같습니다:

<figure>
 <img src="generated/images/guide/lazy-loading-ngmodules/lazy-load-relationship.jpg" width="400" alt="lazy loaded modules diagram">
</figure>

<!--
Each feature module acts as a doorway via the router. In the `AppRoutingModule`, you configure the routes to the feature modules, in this case `OrdersModule` and `CustomersModule`. This way, the router knows to go to the feature module. The feature module then connects the `AppRoutingModule` to the `CustomersRoutingModule` or the `OrdersRoutingModule`. Those routing modules tell the router where to go to load relevant components.
-->
라우터가 각 기능 모듈의 진입점까지만 연결하면 모듈 안쪽은 모듈에 있는 라우터가 처리할 것입니다. 이 문서에서 작성하는 예제로 보면, `AppRoutingModule`이 `OrdersModule`과 `CustomersModule`을 연결하면, 이 라우팅 동작은 각각 `CustomersRoutingModule`과 `OrdersRoutingModule`로 연결됩니다. 그러면 기능 모듈 안에 있는 라우터가 주소에 지정된 컴포넌트를 화면에 표시합니다.

<!--
### Routes at the app level
-->
### 애플리케이션 계층의 라우팅

<!--
In `AppRoutingModule`, update the `routes` array with the following:
-->
`AppRoutingModule`의 `routes` 배열을 다음과 같이 수정합니다:

<code-example path="lazy-loading-ngmodules/src/app/app-routing.module.ts" region="const-routes" header="src/app/app-routing.module.ts" linenums="false">

</code-example>

<!--
The import statements stay the same. The first two paths are the routes to the `CustomersModule` and the `OrdersModule` respectively. Notice that the lazy loading syntax uses `loadChildren` followed by a function that uses the browser's built-in `import('...')` syntax for dynamic imports. The import path is the relative path to the module.
-->
이 파일의 다른 부분은 그대로 둡니다. 라우터 설정을 지정한 것을 보면, 배열의 첫번째 항목은 `CustomersModule`로 라우팅하도록 지정했고, 두번째 항목은 `OrdersModule`로 라우팅하도록 지정했습니다. 이 때 지연 로딩하는 모듈은 `loadChildren` 프로퍼티로 지정하며, 브라우저의 빌트인 `import('...')` 문법으로 동적로딩 합니다. 이 때 모듈은 상대주소로 지정합니다.

<!--
### Inside the feature module
-->
## 기능 모듈의 라우팅

<!--
Next, take a look at `customers.module.ts`. If you’re using the CLI and following the steps outlined in this page, you don’t have to do anything here. The feature module is like a connector between the `AppRoutingModule` and the feature routing module. The `AppRoutingModule` imports the feature module, `CustomersModule`, and `CustomersModule` in turn imports the `CustomersRoutingModule`.
-->
다음으로 `customers.module.ts` 파일을 확인하는데, 지금까지 단계를 Angular CLI를 활용하면서 그대로 따라왔다면 추가로 수정할 내용은 없습니다. 기능 모듈 자체는 `AppRoutingModule`과 기능 모듈 안에 있는 라우팅 모듈을 연결하는 역할만 합니다. 그래서 `AppRoutingModule`이 기능 모듈인 `CustomersModule`을 로드하면, `CustomersModule`이 다시 `CustomerRoutingModule`을 로드합니다.

<code-example path="lazy-loading-ngmodules/src/app/customers/customers.module.ts" region="customers-module" header="src/app/customers/customers.module.ts" linenums="false">

</code-example>


<!--
The `customers.module.ts` file imports the `CustomersRoutingModule` and `CustomerListComponent` so the `CustomersModule` class can have access to them. `CustomersRoutingModule` is then listed in the `@NgModule` `imports` array giving `CustomersModule` access to its own routing module, and `CustomerListComponent` is in the `declarations` array, which means `CustomerListComponent` belongs to the `CustomersModule`.
-->
`customers.module.ts` 파일에 정의된 `CustomersModule`은 `CustomersRoutingModule`을 로드하기 때문에 이 라우팅 모듈에 접근할 수 있습니다. 이 라우팅 모듈을 `@NgModule`의 `imports` 프로퍼티에 등록하면 `CustomersModule`의 라우팅을 담당하는 모듈로 동작하며, `CustomerListComponent`도 `CustomersModule`에 포함되도록 `declarations` 프로퍼티에 등록했습니다.

<!--
### Configure the feature module’s routes
-->
### 기능 모듈의 라우팅 설정하기

<!--
The next step is in `customers-routing.module.ts`. First, import the component at the top of the file with the other JavaScript import statements. Then, add the route to `CustomerListComponent`.
-->
다음으로 볼 파일은 `customers-routing.module.ts` 파일입니다. 먼저, 파일 제일 위쪽에 라우팅과 관련된 심볼을 로드하고, 그 다음에는 라우팅에 사용할 `CustomerListComponent`를 로드합니다.

<code-example path="lazy-loading-ngmodules/src/app/customers/customers-routing.module.ts" region="customers-routing-module" header="src/app/customers/customers-routing.module.ts" linenums="false">

</code-example>

<!--
Notice that the `path` is set to an empty string. This is because the path in `AppRoutingModule` is already set to `customers`, so this route in the `CustomersRoutingModule`, is already within the `customers` context. Every route in this routing module is a child route.
-->
이 때 라우팅 설정에서 `path`에는 빈 주소를 지정했습니다. 이렇게 사용한 이유는 `AppRoutingModule`에서 주소를 지정할 때 이미 `customers`로 지정했기 때문이며, 이제 `CustomersRoutingModule`이 라우팅하는 주소는 `customers` 주소가 기준점이 됩니다.

<!--
Repeat this last step of importing the `OrdersListComponent` and configuring the Routes array for the `orders-routing.module.ts`:
-->
이 내용은 `orders-routing.module.ts` 파일에서 `OrdersListComponent`에 대한 라우팅 설정을 할 때도 마찬가지입니다:

<code-example path="lazy-loading-ngmodules/src/app/orders/orders-routing.module.ts" region="orders-routing-module-detail" header="src/app/orders/orders-routing.module.ts (excerpt)" linenums="false">

</code-example>

<!--
Now, if you view the app in the browser, the three buttons take you to each module.
-->
이제 브라우저에서 앱을 실행해보면 이전에 만들었던 버튼 3개가 모두 동작하는 것을 확인할 수 있습니다.

<!--
## Confirm it’s working
-->
## 동작 확인하기

<!--
You can check to see that a module is indeed being lazy loaded with the Chrome developer tools. In Chrome, open the dev tools by pressing `Cmd+Option+i` on a Mac or `Ctrl+Shift+j` on a PC and go to the Network Tab.
-->
Chrome 개발자 도구를 활용하면 모듈이 정말 지연 로딩되었는지 확인할 수 있습니다. Chrome 브라우저에서 개발자 도구를 열고 네트워크 탭으로 이동합니다. Mac에서는 `Cmd+Option+i`, Windows에서는 `Ctrl+Shift+j`를 누르면 됩니다.

<figure>
 <img src="generated/images/guide/lazy-loading-ngmodules/network-tab.png" width="600" alt="lazy loaded modules diagram">
</figure>

<!--
Click on the Orders or Customers button. If you see a chunk appear, you’ve wired everything up properly and the feature module is being lazy loaded. A chunk should appear for Orders and for Customers but will only appear once for each.
-->
그리고 이제 Orders나 Customers 버튼을 클릭해 봅시다. 그러면 애플리케이션 패키지 파일과 별개의 청크(chunk) 파일로 패키징된 지연 로딩 모듈이 로드되는 것을 확인할 수 있습니다. 이 파일은 `OrdersModule`이나 `CustomersModule`에 접근할 때 한 번씩만 로드됩니다.

<figure>
 <img src="generated/images/guide/lazy-loading-ngmodules/chunk-arrow.png" width="600" alt="lazy loaded modules diagram">
</figure>

<!--
To see it again, or to test after working in the project, clear everything out by clicking the circle with a line through it in the upper left of the Network Tab:
-->
이 과정을 다시 확인하려면 브라우저에 애플리케이션을 다시 실행해야 합니다. 먼저, 네트워크 탭에서 Clear 버튼을 눌러서 네트워크 기록을 초기화합니다:

<figure>
 <img src="generated/images/guide/lazy-loading-ngmodules/clear.gif" width="200" alt="lazy loaded modules diagram">
</figure>

<!--
Then reload with `Cmd+r` or `Ctrl+r`, depending on your platform.
-->
그리고 페이지를 새로고침하면 애플리케이션이 다시 실행될 것입니다.

<!--
## `forRoot()` and `forChild()`
-->
## `forRoot()`와 `forChild()`

<!--
You might have noticed that the CLI adds `RouterModule.forRoot(routes)` to the `app-routing.module.ts` `imports` array. This lets Angular know that this module,
`AppRoutingModule`, is a routing module and `forRoot()` specifies that this is the root
routing module. It configures all the
routes you pass to it, gives you access to the router directives, and registers the `RouterService`.
Use `forRoot()` in the `AppRoutingModule`&mdash;that is, one time in the app at the root level.
-->
Angular CLI로 생성한 `app-routing.module.ts` 파일을 보면, `imports` 배열에 라우팅 모듈을 등록할 때 `RouterModule.forRoot(routes)`로 지정한 것을 확인할 수 있습니다. `forRoot()` 메소드를 사용하면 이 라우팅 모듈이 최상위 라우팅 모듈이라는 것을 의미합니다. 그러면 이 애플리케이션에서 라우팅할 때는 모두 이 라우팅 모듈을 거치게 될 것이며, 이 라우팅 모듈의 설정이 모든 라우팅에 적용됩니다. 그래서 `forRoot()`는 애플리케이션의 최상위 계층에서 한 번만 사용해야 합니다.

<!--
The CLI also adds `RouterModule.forChild(routes)` to feature routing modules. This way, Angular
knows that the route list is only responsible for providing additional routes and is intended for feature modules. You can use `forChild()` in multiple modules.
-->
이와 다르게, 기능 모듈에 만든 라우팅 모듈은 `RouterModule.forChild(routes)`로 지정되어 있습니다. `forChild()` 함수를 사용하면 이 라우팅 모듈이 최상위 모듈의 자식 라우터로 동작한다는 것을 의미하며, 동시에 어떤 기능 모듈 안에 포함된다는 것으로 판단합니다. `forChild()` 함수는 여러번 사용해도 문제 없습니다.

<!--
For more information, see the [`forRoot()` pattern](guide/singleton-services#forRoot) section of the [Singleton Services](guide/singleton-services) guide.
-->
더 자세한 내용은 [싱글턴 서비스](guide/singleton-services) 가이드 문서의 [`forRoot()` 패턴](guide/singleton-services#forRoot) 섹션을 참고하세요.

<hr>

<!--
## More on NgModules and routing
-->
## NgModule과 라우팅 더 알아보기

<!--
You may also be interested in the following:
* [Routing and Navigation](guide/router).
* [Providers](guide/providers).
* [Types of Feature Modules](guide/module-types).
-->
다음 내용에 대해서도 더 확인해 보세요:
* [라우팅, 네비게이션](guide/router)
* [프로바이더](guide/providers)
* [기능 모듈의 종류](guide/module-types)
