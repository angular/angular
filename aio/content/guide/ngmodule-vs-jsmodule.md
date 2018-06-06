<!--
# JavaScript Modules vs. NgModules
-->
# JavaScript 모듈 vs. NgModules

<!--
#### Prerequisites
-->
#### 사전지식

<!--
A basic understanding of [JavaScript/ECMAScript modules](https://hacks.mozilla.org/2015/08/es6-in-depth-modules/).
-->
[JavaScript/ECMAScript의 모듈](https://hacks.mozilla.org/2015/08/es6-in-depth-modules/)에 대해 먼저 이해하고 이 문서를 보는 것이 좋습니다.

<hr>

<!--
JavaScript and Angular use modules to organize code, and
though they organize it differently, Angular apps rely on both.
-->
JavaScript와 Angular는 코드를 효율적으로 관리하기 위해 모듈 체계를 사용하지만, 두 영역의 모듈 체계는 서로 다릅니다. Angular 애플리케이션에서는 두 모듈 체계를 모두 사용합니다.

<!--
## JavaScript modules
-->
## JavaScript 모듈

<!--
In JavaScript, modules are individual files with JavaScript code in them. To make what’s in them available, you write an export statement, usually after the relevant code, like this:
-->
JavaScript에서는 JavaScript 코드가 작성된 개별 파일을 모듈로 구분합니다. 그리고 이 파일 안에 있는 내용을 외부로 공개하려면 다음과 같이 `export` 키워드를 지정하면 됩니다.

```typescript
export class AppComponent { ... }
```
<!--
Then, when you need that file’s code in another file, you import it like this:
-->
그러면 다른 파일에서 이 객체를 불러와서 사용할 수 있습니다:

```typescript
import { AppComponent } from './app.component';
```

<!--
JavaScript modules help you namespace, preventing accidental global variables.
-->
JavaScript 모듈은 네임스페이스를 지원하기 때문에, 전역 변수와 충돌하는 것을 방지하는 용도로도 사용합니다.

## NgModules

<!-- KW-- perMisko: let's discuss. This does not answer the question why it is different. Also, last sentence is confusing.-->
<!--
NgModules are classes decorated with `@NgModule`. The `@NgModule` decorator’s `imports` array tells Angular what other NgModules the current module needs. The modules in the `imports` array are different than JavaScript modules because they are NgModules rather than regular JavaScript modules. Classes with an `@NgModule` decorator are by convention kept in their own files, but what makes them an `NgModule` isn’t being in their own file, like JavaScript modules; it’s the presence of `@NgModule` and its metadata.
-->
NgModule은 `@NgModule` 데코레이터가 지정된 클래스입니다. 이 데코레이터의 `imports` 배열에는 현재 모듈에 필요한 Angular 모듈이 어떤 것이 있는지 나열하는데, 이때 지정하는 모듈은 JavaScript 모듈이 아니라 Angular 모듈입니다. Angular 모듈을 어떻게 구성하는지는 개별 파일을 어떻게 구성하느냐에 따라 달라집니다.

<!--
The `AppModule` generated from the Angular CLI demonstrates both kinds of modules in action:
-->
Angular CLI로 생성된 기본 `AppModule`은 다음과 같이 구성됩니다:

<!--
```typescript
/* These are JavaScript import statements. Angular doesn’t know anything about these. */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

/* The @NgModule decorator lets Angular know that this is an NgModule. */
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [     /* These are NgModule imports. */
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```
-->
```typescript
/* 가장 처음에는 JavaScript import 구문을 작성합니다. 이 부분은 Angular와 관련된 코드는 아닙니다. */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

/* @NgModule 데코레이터를 지정하면 이 클래스가 Angular의 NgModule이라는 것을 나타냅니다.  */
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [     /* 이 부분에 NgModule을 로드합니다. */
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

<!--
The NgModule classes differ from JavaScript module in the following key ways:
-->
NgModule 클래스는 JavaScript 모듈과 비교했을 때 이런 점들이 다릅니다:

<!--
* An NgModule bounds [declarable classes](guide/ngmodule-faq#q-declarable) only.
Declarables are the only classes that matter to the [Angular compiler](guide/ngmodule-faq#q-angular-compiler).
* Instead of defining all member classes in one giant file as in a JavaScript module,
you list the module's classes in the `@NgModule.declarations` list.
* An NgModule can only export the [declarable classes](guide/ngmodule-faq#q-declarable)
it owns or imports from other modules. It doesn't declare or export any other kind of class.
* Unlike JavaScript modules, an NgModule can extend the _entire_ application with services
by adding providers to the `@NgModule.providers` list.
-->
* NgModule의 범위는 이 모듈의 [구성요소로 선언한 클래스(declarable classes)](guide/ngmodule-faq#q-declarable)들로 제한됩니다. 이 부분은 [Angular 컴파일러](guide/ngmodule-faq#q-angular-compiler)와도 관계가 있습니다.
* JavaScript 모듈처럼 클래스의 모든 멤버를 한 파일에 작성하는 대신, 모듈에서 사용하는 클래스들은 `@NgModule.declarations` 배열을 사용해서 여러 파일로 나눌 수 있습니다.
* NgModule에서는 이 모듈의 [구성요소로 선언한 클래스](guide/ngmodule-faq#q-declarable)만 모듈 외부로 공개할 수 있고, 이렇게 모듈 외부로 공개된 클래스만 다른 모듈에서 로드할 수 있습니다. 일반 클래스를 `export` 키워드로 지정했다고 해서 모듈에서 참조할 수 있는 것은 아닙니다.
* JavaScript 모듈과는 다르게, NgModule은 `@NgModule.providers` 배열에서 지정하는 서비스와 서비스 프로바이더를 사용해서 애플리케이션 _전체_ 를 확장할 수 있습니다.

<hr />

<!--
## More on NgModules
-->
## NgModule 더 알아보기

<!--
For more information on NgModules, see:
* [Bootstrapping](guide/bootstrapping).
* [Frequently used modules](guide/frequent-ngmodules).
* [Providers](guide/providers).
-->
다음 내용을 더 확인해 보세요:
* [부트스트랩](guide/bootstrapping).
* [자주 사용하는 NgModule](guide/frequent-ngmodules).
* [프로바이더](guide/providers).
