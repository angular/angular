<!--
# Bootstrapping
-->
# 부트스트랩

<!--
#### Prerequisites
-->
#### 사전 지식

<!--
A basic understanding of the following:
-->
다음 내용을 이해하고 있는 것이 좋습니다:
* [JavaScript Modules vs. NgModules](guide/ngmodule-vs-jsmodule).

<hr />

<!--
An NgModule describes how the application parts fit together.
Every application has at least one Angular module, the _root_ module
that you bootstrap to launch the application.
By convention, it is usually called `AppModule`.
-->
NgModule은 애플리케이션을 구성하는 단위입니다.
모든 애플리케이션에는 _최상위_ 모듈이 존재하기 때문에 최소한 하나의 모듈을 포함하고 있으며, 애플리케이션은 이 최상위 모듈을 부트스트랩하면서 시작됩니다.
이 최상위 모듈은 보통 `AppModule`이라고 합니다.

<!--
If you use the CLI to generate an app, the default `AppModule` is as follows:
-->
Angular CLI로 프로젝트를 생성했다면 `AppModule`은 다음과 같이 구성됩니다:

<!--
```typescript
/* JavaScript imports */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

/* the AppModule class with the @NgModule decorator */
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

```
-->
```typescript
/* JavaScript 모듈 로드 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

/* AppModule 클래스는 @NgModule 데코레이터로 정의합니다. */
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

```

<!--
After the import statements is a class with the
**`@NgModule`** [decorator](guide/glossary#decorator '"Decorator" explained').
-->
Angular 모듈은 JavaScript 모듈 로드 구문 뒤에 **`@NgModule`** [데코레이터](guide/glossary#decorator '"Decorator" explained')를 붙여 정의합니다.

<!--
The `@NgModule` decorator identifies `AppModule` as an `NgModule` class.
`@NgModule` takes a metadata object that tells Angular how to compile and launch the application.
-->
이 때 `AppModule`에 사용하는 `@NgModule` 데코레이터의 메타데이터를 지정하면 이 모듈을 어떻게 컴파일할지, 어떻게 실행할지 지정할 수 있습니다.

<!--
* **_declarations_**&mdash;this application's lone component.
* **_imports_**&mdash;import `BrowserModule` to have browser specific services such as DOM rendering, sanitization, and location.
* **_providers_**&mdash;the service providers.
* **_bootstrap_**&mdash;the _root_ component that Angular creates and inserts
into the `index.html` host web page.
-->
* **_declarations_**&mdash;이 모듈에 속하는 컴포넌트를 등록합니다. 아직은 컴포넌트 하나밖에 없습니다.
* **_imports_**&mdash;DOM 렌더링, 위험 코드 처리, location 등 브라우저 지원이 필요한 기능을 사용하기 위해 `BrowserModule`을 로드합니다.
* **_providers_**&mdash;서비스 프로바이더를 등록합니다.
* **_bootstrap_**&mdash;`index.html` 페이지에 생성되고 실행될 _최상위_ 컴포넌트를 지정합니다.

<!--
The default CLI application only has one component, `AppComponent`, so it
is in both the `declarations` and the `bootstrap` arrays.
-->
Angular CLI로 만든 프로젝트에는 컴포넌트가 `AppComponent` 하나만 있습니다. 그리고 `declarations`와 `bootstrap`은 배열로 지정되어 있습니다.

{@a declarations}
{@a the-declarations-array}

<!--
## The `declarations` array
-->
## `declarations` 배열

<!--
The module's `declarations` array tells Angular which components belong to that module.
As you create more components, add them to `declarations`.
-->
`declarations` 배열에는 이 모듈에 어떤 컴포넌트가 포함되는지 지정합니다.
그래서 모듈에 새로운 컴포넌트를 추가할 때마다 `declarations` 배열에도 추가해야 합니다.

<!--
You must declare every component in exactly one `NgModule` class.
If you use a component without declaring it, Angular returns an
error message.
-->
컴포넌트는 `NgModule` 한 곳에 꼭 등록해야 합니다.
만약 아무 모듈에도 등록하지 않으면, Angular가 에러를 발생시킵니다.

<!--
The `declarations` array only takes declarables. Declarables
are components, [directives](guide/attribute-directives) and [pipes](guide/pipes).
All of a module's declarables must be in the `declarations` array.
Declarables must belong to exactly one module. The compiler emits
an error if you try to declare the same class in more than one module.
-->
`declarations` 배열에는 Angular 구성요소 중 컴포넌트나 [디렉티브](guide/attribute-directives), [파이프](guide/pipes)를 등록합니다.
이렇게 등록된 구성요소는 해당 모듈에 포함되도록 등록되며, 한 번 등록된 구성요소를 다른 모듈에도 등록하면 컴파일할 때 에러가 발생합니다.

<!--
These declared classes are visible within the module but invisible
to components in a different module unless they are exported from
this module and the other module imports this one.
-->
모듈에 등록된 구성요소는 모듈 안에서 자유롭게 사용할 수 있으며, 다른 모듈에서는 모듈 외부로 공개하지 않은 클래스를 사용할 수 없습니다.

<!--
An example of what goes into a declarations array follows:
-->
애플리케이션을 계속 개발하다 보면 이 배열은 다음과 같은 모습이 될 것입니다:

```typescript
  declarations: [
    YourComponent,
    YourPipe,
    YourDirective
  ],
```

<!--
A declarable can only belong to one module, so only declare it in
one `@NgModule`. When you need it elsewhere,
import the module that has the declarable you need in it.
-->
이렇게 등록된 구성요소는 한 모듈에만 포함되며, 다른 모듈에서 이 구성요소를 사용하려면 구성요소가 등록된 모듈을 로드해야 합니다.

<!--
**Only `@NgModule` references** go in the `imports` array.
-->
그리고 Angular 모듈을 로드하는 `imports` 배열에는 **`@NgModule`만** 등록할 수 있습니다.

<!--
### Using directives with `@NgModule`
-->
### `@NgModule`에 디렉티브 등록하기

<!--
Use the `declarations` array for directives.
To use a directive, component, or pipe in a module, you must do a few things:
-->
`declarations` 배열에 디렉티브를 등록해 봅시다.
모듈에 디렉티브나 컴포넌트, 파이프를 등록하려면 다음 순서로 진행합니다:

<!--
1. Export it from the file where you wrote it.
2. Import it into the appropriate module.
3. Declare it in the `@NgModule` `declarations` array.
-->
1. 디렉티브를 작성한 파일에서 클래스에 `export` 키워드를 사용해서 파일 외부로 공개합니다.
1. 모듈을 정의하는 파일에 이 디렉티브를 로드합니다.
1. `@NgModule`의 `declarations` 배열에 이 디렉티브를 등록합니다.

<!--
Those three steps look like the following. In the file where you create your directive, export it.
The following example, named `ItemDirective` is the default directive structure that the CLI generates in its own file, `item.directive.ts`:
-->
이 내용을 순서대로 살펴봅시다. 디렉티브를 정의하고 나면, 이 디렉티브를 파일 외부로 공개해야 합니다.
`item.directive.ts` 파일에 `ItemDirective`를 정의해 봅시다.
Angular CLI로 디렉티브를 생성하면 디렉티브의 기본 구조가 다음과 같이 구성됩니다:

<code-example path="bootstrapping/src/app/item.directive.ts" region="directive" title="src/app/item.directive.ts" linenums="false">
</code-example>

<!--
The key point here is that you have to export it so you can import it elsewhere. Next, import it
into the NgModule, in this example `app.module.ts`, with a JavaScript import statement:
-->
이 파일에서 중요한 점은, 이 클래스가 `export` 키워드로 지정되었기 때문에 다른 모듈이 이 클래스를 참조할 수 있다는 것입니다.
따라서, 앱 모듈을 정의하는 `app.module.ts` 파일에서는 다음과 같이 로드할 수 있습니다:

<code-example path="bootstrapping/src/app/app.module.ts" region="directive-import" title="src/app/app.module.ts" linenums="false">
</code-example>

<!--
And in the same file, add it to the `@NgModule` `declarations` array:
-->
이렇게 불러온 디렉티브를 `@NgModule`의 `declarations` 배열에 추가합니다:

<code-example path="bootstrapping/src/app/app.module.ts" region="declarations" title="src/app/app.module.ts" linenums="false">
</code-example>

<!--
Now you could use your `ItemDirective` in a component. This example uses `AppModule`, but you'd do it the same way for a feature module. For more about directives, see [Attribute Directives](guide/attribute-directives) and [Structural Directives](guide/structural-directives). You'd also use the same technique for [pipes](guide/pipes) and components.
-->
이제 컴포넌트에서 `ItemDirective`를 자유롭게 사용할 수 있습니다. 그리고 이 예제에서는 `AppModule`에 디렉티브를 등록했지만, 앱 모듈 대신 기능 모듈에 디렉티브를 등록할 수도 있습니다. 디렉티브에 대해 좀 더 알아보려면 [어트리뷰트 디렉티브](guide/attribute-directives)나 [구조 디렉티브](guide/structural-directives) 문서를 참고하세요. 이 과정은 [파이프](guide/pipes)나 컴포넌트를 등록할 때도 동일합니다.

<!--
Remember, components, directives, and pipes belong to one module only. You only need to declare them once in your app because you share them by importing the necessary modules. This saves you time and helps keep your app lean.
-->
컴포넌트, 디렉티브, 파이프는 언제나 모듈 하나에만 포함된다는 것을 꼭 기억하세요.
이 구성요소들은 어떤 모듈이던지 한 곳에만 등록하면 되며, 다른 곳에서는 등록된 모듈을 불러와서 사용하기만 하면 됩니다.
이 구조는 앱을 구성하는 모듈의 결합도를 최대한 낮추기 위한 구조입니다.


{@a imports}

<!--
## The `imports` array
-->
## `imports` 배열

<!--
The module's `imports` array appears exclusively in the `@NgModule` metadata object.
It tells Angular about other NgModules that this particular module needs to function properly.
-->
`@NgModule`의 메타데이터 중 `imports` 배열은 이 모듈에서 필요한 기능을 다른 모듈에서 로드할 때 사용합니다.

<!--
This list of modules are those that export components, directives, or pipes
that the component templates in this module reference. In this case, the component is
`AppComponent`, which references components, directives, or pipes in `BrowserModule`,
`FormsModule`, or  `HttpModule`.
A component template can reference another component, directive,
or pipe when the referenced class is declared in this module or
the class was imported from another module.
-->
그리고 이렇게 불러온 모듈 안에서 `export` 키워드로 지정된 컴포넌트나 디렉티브, 파이프는 `imports` 배열을 지정한 현재 모듈안에서 자유롭게 사용할 수 있습니다. Angular CLI로 생성했던 `NgModule` 모듈로 설명하면, 모듈에 포함된다고 등록한 `AppComponent`에서는 앱 모듈에서 불러온 `BrowserModule`, `FormsModule`, `HttpModule` 안에 있는 컴포넌트, 디렉티브, 파이프 중 모듈 외부로 공개된 구성요소는 자유롭게 사용할 수 있습니다.

<!--
You don't have any services to provide yet.
But you will create some before long and you may chose to provide many of them here.
-->
아직 서비스 프로바이더는 아무것도 등록되지 않았습니다.
이후에 서비스 클래스가 추가된다면 다음 배열에 등록합니다.

{@a bootstrap-array}

<!--
## The `providers` array
-->
## `providers` 배열

<!--
The providers array is where you list the services the app needs. When
you list services here, they are available app-wide. You can scope
them when using feature modules and lazy loading. For more information, see
[Providers](guide/providers).
-->
`providers` 배열에는 앱에서 사용하는 서비스를 등록합니다. 이 배열에 서비스 프로바이더를 등록하면 하위 모듈에서 모두 이 서비스를 의존성으로 주입받을 수 있으며, 이 때 지연 로딩하는 모듈을 따로 구분할 수도 있습니다. 더 자세한 내용은 [프로바이더](guide/providers) 문서를 참고하세요.

<!--
## The `bootstrap` array
-->
## `bootstrap` 배열

<!--
The application launches by bootstrapping the root `AppModule`, which is
also referred to as an `entryComponent`.
Among other things, the bootstrapping process creates the component(s) listed in the `bootstrap` array
and inserts each one into the browser DOM.
-->
Angular 애플리케이션은 최상위 모듈인 `AppModule`에서 시작되며, 이 때 모듈에 정의된 `entryComponent` 배열을 참조합니다.
Angular 모듈의 다른 메타데이터와는 다르게, `bootstrap` 배열에 등록된 컴포넌트는 부트스트랩 단계에서 바로 생성되어 브라우저 DOM에 추가됩니다.

<!--
Each bootstrapped component is the base of its own tree of components.
Inserting a bootstrapped component usually triggers a cascade of
component creations that fill out that tree.
-->
이 때 각각의 컴포넌트는 트리를 구성하는 최상위 컴포넌트의 역할을 합니다.
그래서 이 컴포넌트들이 DOM에 추가된 이후에는 자식 컴포넌트들이 순차적으로 생성됩니다.

<!--
While you can put more than one component tree on a host web page,
most applications have only one component tree and bootstrap a single root component.
-->
애플리케이션은 보통 하나의 컴포넌트 트리를 구성하고 이 컴포넌트를 부트스트랩하는 방식으로 작성하지만, 웹 페이지에 컴포넌트 트리를 여러개 구성하는 것도 물론 가능합니다.

<!--
This one root component is usually called `AppComponent` and is in the
root module's `bootstrap` array.
-->
컴포넌트 트리가 하나만 있다면 이 컴포넌트 트리의 최상위 컴포넌트를 보통 `AppComponent`라고 하고, Angular 모듈의 `bootstrap` 배열에는 컴포넌트 하나만 등록합니다.


<!--
## More about Angular Modules
-->
## Angular 모듈 더 알아보기

<!--
For more on NgModules you're likely to see frequently in apps,
see [Frequently Used Modules](guide/frequent-ngmodules).
-->
애플리케이션을 개발하면서 자주 사용하는 NgModule에 대해 더 알아보려면 [자주 사용하는 NgModule](guide/frequent-ngmodules) 문서를 참고하세요.
