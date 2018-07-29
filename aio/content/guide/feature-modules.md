<!--
# Feature Modules
-->
# 기능 모듈

<!--
Feature modules are NgModules for the purpose of  organizing code.
-->
기능 모듈은 애플리케이션의 코드를 용도에 맞게 구분한 NgModule 단위입니다.

<!--
#### Prerequisites
A basic understanding of the following:
* [Bootstrapping](guide/bootstrapping).
* [JavaScript Modules vs. NgModules](guide/ngmodule-vs-jsmodule).
* [Frequently Used Modules](guide/frequent-ngmodules).
-->
#### 사전 지식

다음 내용을 먼저 이해하고 이 문서를 보는 것이 좋습니다:
* [부트스트랩](guide/bootstrapping)
* [JavaScript 모듈 vs. NgModules](guide/ngmodule-vs-jsmodule)
* [자주 사용하는 NgModule](guide/frequent-ngmodules)

<!--
For the final sample app with a feature module that this page describes,
see the <live-example></live-example>.
-->
이 문서에서 설명하는 예제의 최종 코드는 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

<hr>

<!--
As your app grows, you can organize code relevant for a specific feature.
This helps apply clear boundaries for features. With feature modules,
you can keep code related to a specific functionality or feature
separate from other code. Delineating areas of your
app helps with collaboration between developers and teams, separating
directives, and managing the size of the root module.
-->
애플리케이션이 점점 커지면 코드를 기능별로 묶어서 구성하는 것이 관리하기에 좋습니다.
코드를 기능 단위로 나누면 각 모듈이 담당하는 범위를 명확하게 구분할 수 있기 때문입니다.
모듈의 범위를 명확하게 나누면 다른 개발자나 다른 팀과 협업할 때도 좀 더 편하고, 모듈안에 속하는 디렉티브를 효율적으로 구성할 수 있으며, 최상위 모듈의 크기를 작게 유지하는 측면에서도 좋습니다.

<!--
## Feature modules vs. root modules
-->
## 기능 모듈 vs. 앱 모듈

<!--
A feature module is an organizational best practice, as opposed to a concept of the core Angular API. A feature module delivers a cohesive set of functionality focused on a
specific application need such as a user workflow, routing, or forms.
While you can do everything within the root module, feature modules
help you partition the app into focused areas. A feature module
collaborates with the root module and with other modules through
the services it provides and the components, directives, and
pipes that it shares.
-->
기능 모듈은 사용자의 작업 흐름이나 라우팅 흐름, 폼 구성과 같이 특정 애플리케이션에서 사용하는 기능을 기준으로 구성하기 때문에, 관련된 기능을 묶어 기능 모듈로 구성하면  코드를 효율적으로 관리할 수 있습니다.
하지만 기능 모듈을 따로 나눌 필요가 없는 경우에는 앱 모듈만으로도 모든 것을 처리할 수 있으며, 컴포넌트, 디렉티브, 파이프도 앱 모듈에 등록하고 사용할 수 있습니다.

<!--
## How to make a feature module
-->
## 기능 모듈을 만드는 방법

<!--
Assuming you already have a CLI generated app, create a feature
module using the CLI by entering the following command in the
root project directory. Replace `CustomerDashboard` with the
name of your module. You can omit the "Module" suffix from the name because the CLI appends it:
-->
Angular CLI로 애플리케이션을 생성했다면 기능 모듈을 생성하는 것도 간단합니다.
프로젝트 폴더에서 CLI 명령을 실행하면 되는데, 이 때 모듈 이름을 `CustomerDashboard`로 지정해야 합니다.
Angular CLI로 모듈을 생성하면 "Module" 접미사가 자동으로 붙습니다:

```sh
ng generate module CustomerDashboard

```

<!--
This causes the CLI to create a folder called `customer-dashboard` with a file inside called `customer-dashboard.module.ts` with the following contents:
-->
명령을 실행하면 `customer-dashboard` 폴더가 생성되고 이 폴더 안에 다음 내용으로 `customer-dashboard.module.ts` 파일이 생성됩니다:

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
export class CustomerDashboardModule { }
```

<!--
The structure of an NgModule is the same whether it is a root module or a feature module. In the CLI generated feature module, there are two JavaScript import statements at the top of the file: the first imports `NgModule`, which, like the root module, lets you use the `@NgModule` decorator; the second imports `CommonModule`, which contributes many common directives such as `ngIf` and `ngFor`. Feature modules import `CommonModule` instead of `BrowserModule`, which is only imported once in the root module. `CommonModule` only contains information for common directives such as `ngIf` and `ngFor` which are needed in most templates, whereas `BrowserModule` configures the Angular app for the browser which needs to be done only once.
-->
NgModule의 구조는 앱 모듈이나 기능 모듈이나 크게 다르지 않습니다. Angular CLI로 생성된 기능 모듈을 보면, 맨 위에 JavaScript `import` 구문이 있습니다. 이 구문에서 처음 불러온 것은 `@NgModule` 데코레이터 심볼이며, 두 번째는 `ngIf`나 `ngFor`와 같은 기본 디렉티브를 제공하는 `CommonModule` 입니다.
이 때 기능 모듈에서는 `BrowserModule` 대신 `CommonModule`을 로드해야 합니다. `CommonModule`은 `ngIf`나 `ngFor`와 같은 기본 디렉티브를 템플릿에서 사용할 수 있도록 하지만, `BrowserModule`은 `CommonModule`의 기능에 Angular 애플리케이션을 브라우저에서 실행하기 위한 설정을 추가합니다. 그래서 `BrowserModule`은 최상위 앱 모듈에서 딱 한 번만 로드해야 합니다.

<!--
The `declarations` array is available for you to add declarables, which
are components, directives, and pipes that belong exclusively to this particular module. To add a component, enter the following command at the command line where `customer-dashboard` is the directory where the CLI generated the feature module and `CustomerDashboard` is the name of the component:
-->
`declarations` 배열에는 해당 모듈에 포함되는 컴포넌트나 디렉티브, 파이프를 등록합니다. Angular CLI로 컴포넌트를 생성할 때 특정 모듈 안에 포함되게 하려면 이전에 만들었던 기능 모듈의 폴더 위치를 지정하면 됩니다. 그래서 `CustomDashboardModule`에 포함되는 `CustomDashboardComponent`를 생성하려면 다음 명령을 실행합니다:

```sh
ng generate component customer-dashboard/CustomerDashboard

```

<!--
This generates a folder for the new component within the customer-dashboard folder and updates the feature module with the `CustomerDashboardComponent` info:
-->
그러면 customer-dashboard 모듈 폴더 안에 새 컴포넌트 폴더가 생성되고, `CustomDashboardComponent`가 해당 모듈에 자동으로 추가됩니다:

<code-example path="feature-modules/src/app/customer-dashboard/customer-dashboard.module.ts" region="customer-dashboard-component" title="src/app/customer-dashboard/customer-dashboard.module.ts" linenums="false">
</code-example>


<!--
The `CustomerDashboardComponent` is now in the JavaScript import list at the top and added to the `declarations` array, which lets Angular know to associate this new component with this feature module.
-->
`CustomerDashboardComponent`는 모듈에서 JavaScript `import` 구문으로 로드되고 `declarations` 배열에도 추가되었습니다. 이제 이 컴포넌트는 기능 모듈에 포함됩니다.

<!--
## Importing a feature module
-->
## 기능 모듈 로드하기

<!--
To incorporate the feature module into your app, you have to let the root module, `app.module.ts`, know about it. Notice the `CustomerDashboardModule` export at the bottom of `customer-dashboard.module.ts`. This exposes it so that other modules can get to it. To import it into the `AppModule`, add it to the imports in `app.module.ts` and to the `imports` array:
-->
애플리케이션에서 기능 모듈을 사용하려면, 이 기능 모듈을 앱 모듈인 `app.module.ts`에 추가해야 합니다. `customer-dashboard.module.ts` 파일을 다시 보면 가장 아래에 `CustomerDashboardModule` 클래스를 `export` 로 지정한 것을 확인할 수 있습니다. 이제 이 클래스는 다른 모듈에서 참조할 수 있으며, `AppModule`의 `imports` 배열에 이 모듈을 추가하면 됩니다:

<code-example path="feature-modules/src/app/app.module.ts" region="app-module" title="src/app/app.module.ts" linenums="false">
</code-example>

<!--
Now the `AppModule` knows about the feature module. If you were to add any service providers to the feature module, `AppModule` would know about those too, as would any other feature modules. However, NgModules don’t expose their components.
-->
이제 `AppModule`은 이렇게 등록된 기능 모듈을 사용할 수 있습니다. 기능 모듈에 서비스 프로바이더가 등록되었다면 `AppModule`도 이 서비스 프로바이더를 사용하며, 기능 모듈에서 모듈 밖으로 공개하지 않은 컴포넌트는 사용할 수 없습니다.

<!--
## Rendering a feature module’s component template
-->
## 기능 모듈의 컴포넌트 템플릿 렌더링하기

<!--
When the CLI generated the `CustomerDashboardComponent` for the feature module, it included a template, `customer-dashboard.component.html`, with the following markup:
-->
Angular CLI로 만든  `CustomerDashboardComponent`의 템플릿 파일인 `customer-dashboard.component.html`에는 다음과 같이 마크업이 구성되어 있습니다:

<code-example path="feature-modules/src/app/customer-dashboard/customer-dashboard/customer-dashboard.component.html" region="feature-template" title="src/app/customer-dashboard/customer-dashboard/customer-dashboard.component.html" linenums="false">
</code-example>


<!--
To see this HTML in the `AppComponent`, you first have to export the `CustomerDashboardComponent` in the `CustomerDashboardModule`. In `customer-dashboard.module.ts`, just beneath the `declarations` array, add an `exports` array containing `CustomerDashboardModule`:
-->
이 컴포넌트를 `AppComponent`의 템플릿에 추가하려면, 먼저 `CustomerDashboardComponent`를 모듈 외부로 공개해야 합니다.
`customer-dashboard.module.ts` 파일의 `declarations` 배열 밑에 `exports` 배열을 추가하고 이 배열에 `CustomerDashboardComponent`를 추가합니다:

<code-example path="feature-modules/src/app/customer-dashboard/customer-dashboard.module.ts" region="component-exports" title="src/app/customer-dashboard/customer-dashboard.module.ts" linenums="false">
</code-example>


<!--
Next, in the `AppComponent`, `app.component.html`, add the tag `<app-customer-dashboard>`:
-->
그리고 `AppComponent`의 템플릿인 `app.component.html` 파일에 `<app-customer-dashboard>` 태그를 추가합니다:

<code-example path="feature-modules/src/app/app.component.html" region="app-component-template" title="src/app/app.component.html" linenums="false">
</code-example>

<!--
Now, in addition to the title that renders by default, the `CustomerDashboardComponent` template renders too:
-->
이제 애플리케이션을 실행해보면 `CustomerDashboardComponent`가 렌더링되는 것을 확인할 수 있습니다:

<figure>
 <img src="generated/images/guide/feature-modules/feature-module.png" alt="feature module component">
</figure>

<hr />

<!--
## More on NgModules
-->
## NgModule 더 알아보기

<!--
You may also be interested in the following:
* [Lazy Loading Modules with the Angular Router](guide/lazy-loading-ngmodules).
* [Providers](guide/providers).
* [Types of Feature Modules](guide/module-types).
-->
다음 내용에 대해 더 알아보세요:
* [Angular 라우터로 모듈을 지연 로딩하는 방법](guide/lazy-loading-ngmodules)
* [프로바이더](guide/providers).
* [기능 모듈의 종류](guide/module-types).