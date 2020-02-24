<!--
# Lazy-loading feature modules
-->
# 기능모듈 지연로딩 하기

<!--
## High level view
-->
## 개요

<!--
By default, NgModules are eagerly loaded, which means that as soon as the app loads, so do all the NgModules, whether or not they are immediately necessary. For large apps with lots of routes, consider lazy loading&mdash;a design pattern that loads NgModules as needed. Lazy loading helps keep initial
bundle sizes smaller, which in turn helps decrease load times.

For the final sample app with two lazy-loaded modules that this page describes, see the
<live-example></live-example>.

There are two main steps to setting up a lazy-loaded feature module:

1. Create the feature module with the CLI, using the `--route` flag.
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
create one with the CLI. If you already have an app, skip to
[Configure the routes](#config-routes). Enter the following command
where `customer-app` is the name of your app:
-->
아직 프로젝트를 만들지 않았다면 Angular CLI를 사용해서 새로운 애플리케이션을 생성합니다. 이미 있는 앱을 활용하려면 [라우터 설정하기](#config-routes) 부분으로 넘어가세요.
애플리케이션은 다음 명령을 실행해서 생성합니다:

<code-example language="bash">
ng new customer-app --routing
</code-example>

<!--
This creates an app called `customer-app` and the `--routing` flag
generates a file called `app-routing.module.ts`, which is one of
the files you need for setting up lazy loading for your feature module.
Navigate into the project by issuing the command `cd customer-app`.
-->
이 명령을 실행하면 `customer-app` 이라는 이름으로 애플리케이션이 생성되는데, 이 때 옵션으로 `--routing` 플래그를 설정했기 때문에 `app-routing.module.ts` 파일이 함께 생성됩니다. 이 파일은 기능 모듈을 지연 로딩하도록 설정할 때 사용합니다.
애플리케이션이 생성되고 나면 `cd customer-app` 명령을 실행해서 프로젝트 폴더로 이동합니다.

<div class="alert is-helpful">

The `--routing` option requires Angular/CLI version 8.1 or higher.
See [Keeping Up to Date](guide/updating).

</div>

## Create a feature module with routing

Next, you’ll need a feature module with a component to route to.
To make one, enter the following command in the terminal, where `customers` is the name of the feature module. The path for loading the `customers` feature modules is also `customers` because it is specified with the `--route` option:

<code-example language="bash">
ng generate module customers --route customers --module app.module
</code-example>

This creates a `customers` folder with the new lazy-loadable module `CustomersModule` defined in the `customers.module.ts` file. The command automatically declares the `CustomersComponent` inside the new feature module.

Because the new module is meant to be lazy-loaded, the command does NOT add a reference to the new feature module in the application's root module file, `app.module.ts`.
Instead, it adds the declared route, `customers` to the `routes` array declared in the module provided as the `--module` option.

<code-example
  header="src/app/app-routing.module.ts"
  path="lazy-loading-ngmodules/src/app/app-routing.module.ts"
  region="routes-customers">
</code-example>

Notice that the lazy-loading syntax uses `loadChildren` followed by a function that uses the browser's built-in `import('...')` syntax for dynamic imports.
The import path is the relative path to the module.

<!--
### Add another feature module
-->
## 기능 모듈 하나 더 생성하기

Use the same command to create a second lazy-loaded feature module with routing, along with its stub component.

<code-example language="bash">
ng generate module orders --route orders --module app.module
</code-example>

This creates a new folder called `orders` containing the `OrdersModule` and `OrdersRoutingModule`, along with the new `OrdersComponent` source files.
The `orders` route, specified with the `--route` option, is added to the `routes` array inside the `app-routing.module.ts` file, using the lazy-loading syntax.

<code-example
  header="src/app/app-routing.module.ts"
  path="lazy-loading-ngmodules/src/app/app-routing.module.ts"
  region="routes-customers-orders">
</code-example>

<!--
## Set up the UI
-->
## 화면 구성하기

Though you can type the URL into the address bar, a navigation UI is easier for the user and more common.
Replace the default placeholder markup in `app.component.html` with a custom nav
so you can easily navigate to your modules in the browser:


<code-example path="lazy-loading-ngmodules/src/app/app.component.html" header="app.component.html" region="app-component-template" header="src/app/app.component.html"></code-example>

<!--
To see your app in the browser so far, enter the following command in the terminal window:
-->
그리고 애플리케이션을 브라우저에 실행하기 위해 다음 명령을 실행합니다:

<code-example language="bash">
ng serve
</code-example>

Then go to `localhost:4200` where you should see “customer-app” and three buttons.

<div class="lightbox">
  <img src="generated/images/guide/lazy-loading-ngmodules/three-buttons.png" width="300" alt="three buttons in the browser">
</div>

These buttons work, because the CLI automatically added the routes to the feature modules to the `routes` array in `app.module.ts`.

{@a config-routes}

## Imports and route configuration

The CLI automatically added each feature module to the routes map at the application level.
Finish this off by adding the default route. In the `app-routing.module.ts` file, update the `routes` array with the following:

<code-example path="lazy-loading-ngmodules/src/app/app-routing.module.ts" id="app-routing.module.ts" region="const-routes" header="src/app/app-routing.module.ts"></code-example>

The first two paths are the routes to the `CustomersModule` and the `OrdersModule`.
The final entry defines a default route. The empty path matches everything that doesn't match an earlier path.


<!--
### Inside the feature module
-->
## 기능 모듈의 라우팅

Next, take a look at the `customers.module.ts` file. If you’re using the CLI and following the steps outlined in this page, you don’t have to do anything here.

<code-example path="lazy-loading-ngmodules/src/app/customers/customers.module.ts" id="customers.module.ts" region="customers-module" header="src/app/customers/customers.module.ts"></code-example>

The `customers.module.ts` file imports the `customers-routing.module.ts` and `customers.component.ts` files. `CustomersRoutingModule` is listed in the `@NgModule` `imports` array giving `CustomersModule` access to its own routing module. `CustomersComponent` is in the `declarations` array, which means `CustomersComponent` belongs to the `CustomersModule`.


The `app-routing.module.ts` then imports the feature module, `customers.module.ts` using JavaScript's dynamic import.

The feature-specific route definition file `customers-routing.module.ts` imports its own feature component defined in the `customers.component.ts` file, along with the other JavaScript import statements. It then maps the empty path to the `CustomersComponent`.

<code-example path="lazy-loading-ngmodules/src/app/customers/customers-routing.module.ts" id="customers-routing.module.ts" region="customers-routing-module" header="src/app/customers/customers-routing.module.ts"></code-example>

The `path` here is set to an empty string because the path in `AppRoutingModule` is already set to `customers`, so this route in the `CustomersRoutingModule`, is already within the `customers` context. Every route in this routing module is a child route.

The other feature module's routing module is configured similarly.

<code-example path="lazy-loading-ngmodules/src/app/orders/orders-routing.module.ts" id="orders-routing.module.ts" region="orders-routing-module-detail" header="src/app/orders/orders-routing.module.ts (excerpt)"></code-example>

<!--
## Confirm it’s working
-->
## 동작 확인하기

<!--
You can check to see that a module is indeed being lazy loaded with the Chrome developer tools. In Chrome, open the dev tools by pressing `Cmd+Option+i` on a Mac or `Ctrl+Shift+j` on a PC and go to the Network Tab.
-->
Chrome 개발자 도구를 활용하면 모듈이 정말 지연 로딩되었는지 확인할 수 있습니다. Chrome 브라우저에서 개발자 도구를 열고 네트워크 탭으로 이동합니다. Mac에서는 `Cmd+Option+i`, Windows에서는 `Ctrl+Shift+j`를 누르면 됩니다.

<div class="lightbox">
  <img src="generated/images/guide/lazy-loading-ngmodules/network-tab.png" width="600" alt="lazy loaded modules diagram">
</div>

<!--
Click on the Orders or Customers button. If you see a chunk appear, everything is wired up properly and the feature module is being lazy loaded. A chunk should appear for Orders and for Customers but will only appear once for each.
-->
그리고 이제 Orders나 Customers 버튼을 클릭해 봅시다. 그러면 애플리케이션 패키지 파일과 별개의 청크(chunk) 파일로 패키징된 지연 로딩 모듈이 로드되는 것을 확인할 수 있습니다. 이 파일은 `OrdersModule`이나 `CustomersModule`에 접근할 때 한 번씩만 로드됩니다.

<div class="lightbox">
  <img src="generated/images/guide/lazy-loading-ngmodules/chunk-arrow.png" width="600" alt="lazy loaded modules diagram">
</div>

<!--
To see it again, or to test after working in the project, clear everything out by clicking the circle with a line through it in the upper left of the Network Tab:
-->
이 과정을 다시 확인하려면 브라우저에 애플리케이션을 다시 실행해야 합니다. 먼저, 네트워크 탭에서 Clear 버튼을 눌러서 네트워크 기록을 초기화합니다:

<div class="lightbox">
  <img src="generated/images/guide/lazy-loading-ngmodules/clear.gif" width="200" alt="lazy loaded modules diagram">
</div>

<!--
Then reload with `Cmd+r` or `Ctrl+r`, depending on your platform.
-->
그리고 페이지를 새로고침하면 애플리케이션이 다시 실행될 것입니다.

<!--
## `forRoot()` and `forChild()`
-->
## `forRoot()`와 `forChild()`

<!--
You might have noticed that the CLI adds `RouterModule.forRoot(routes)` to the `AppRoutingModule` `imports` array.
This lets Angular know that the `AppRoutingModule` is a routing module and `forRoot()` specifies that this is the root routing module.
It configures all the routes you pass to it, gives you access to the router directives, and registers the `Router` service.
Use `forRoot()` only once in the application, inside the `AppRoutingModule`.

The CLI also adds `RouterModule.forChild(routes)` to feature routing modules.
This way, Angular knows that the route list is only responsible for providing additional routes and is intended for feature modules.
You can use `forChild()` in multiple modules.

The `forRoot()` method takes care of the *global* injector configuration for the Router.
The `forChild()` method has no injector configuration. It uses directives such as `RouterOutlet` and `RouterLink`.
For more information, see the [`forRoot()` pattern](guide/singleton-services#forRoot) section of the [Singleton Services](guide/singleton-services) guide.
-->
Angular CLI로 생성한 `app-routing.module.ts` 파일을 보면, `imports` 배열에 라우팅 모듈을 등록할 때 `RouterModule.forRoot(routes)`로 지정한 것을 확인할 수 있습니다.
`forRoot()` 메소드를 사용하면 이 라우팅 모듈이 최상위 라우팅 모듈이라는 것을 의미합니다.
그러면 이 애플리케이션에서 라우팅할 때는 모두 이 라우팅 모듈을 거치게 될 것이며, 이 라우팅 모듈의 설정이 모든 라우팅에 적용됩니다.
그래서 `forRoot()`는 애플리케이션의 최상위 계층에서 한 번만 사용해야 합니다.

The CLI also adds `RouterModule.forChild(routes)` to feature routing modules.
This way, Angular knows that the route list is only responsible for providing additional routes and is intended for feature modules.
You can use `forChild()` in multiple modules.

The `forRoot()` method takes care of the *global* injector configuration for the Router.
The `forChild()` method has no injector configuration. It uses directives such as `RouterOutlet` and `RouterLink`.
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
* [Route-level code-splitting in Angular](https://web.dev/route-level-code-splitting-in-angular/)
* [Route preloading strategies in Angular](https://web.dev/route-preloading-in-angular/)
-->
다음 내용에 대해서도 더 확인해 보세요:
* [라우팅, 네비게이션](guide/router)
* [프로바이더](guide/providers)
* [기능 모듈의 종류](guide/module-types)
* [Route-level code-splitting in Angular](https://web.dev/route-level-code-splitting-in-angular/)
* [Route preloading strategies in Angular](https://web.dev/route-preloading-in-angular/)
