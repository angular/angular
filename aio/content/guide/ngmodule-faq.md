# NgModule FAQs

<!--
#### Prerequisites:
-->
#### 사전지식
<!--
A basic understanding of the following concepts:
* [NgModules](guide/ngmodules).
-->
다음 내용을 먼저 이해하고 이 문서를 보는 것이 좋습니다:
* [NgModule](guide/ngmodules)

<hr />

<!--
NgModules help organize an application into cohesive blocks of functionality.

This page answers the questions many developers ask about NgModule design and implementation.
-->
NgModule은 애플리케이션 코드를 기능별로 분리해서 효율적으로 구성할 수 있는 단위입니다.

이 문서는 NgModule의 개발 의도와 구현방법에 대해 많은 개발자들이 물어본 내용을 소개합니다.

<!--
## What classes should I add to the `declarations` array?
-->
## `declarations` 배열에는 어떤 클래스를 추가해야 하나요?

<!--
Add [declarable](guide/bootstrapping#the-declarations-array) classes&mdash;components, directives, and pipes&mdash;to a `declarations` list.

Declare these classes in _exactly one_ module of the application.
Declare them in a module if they belong to that particular module.
-->
이 배열에는 모듈에 포함되는 컴포넌트나 디렉티브, 파이프를 등록하며, 이 Angular 구성요소들을 [declarable](guide/bootstrapping#declarations-배열)이라고도 합니다.
대상 클래스는 _딱 하나의_ 모듈에만 등록해야 합니다.

<hr/>

{@a q-declarable}

<!--
## What is a _declarable_?
-->
## _declarable_ 이 뭔가요?

<!--
Declarables are the class types&mdash;components, directives, and pipes&mdash;that
you can add to a module's `declarations` list.
They're the only classes that you can add to `declarations`.
-->
Declarable은 컴포넌트나 디렉티브, 파이프와 같이 모듈의 `declarations` 배열에 등록하는 클래스입니다.
Declarable은 Angular 구성요소이면서, JavaScript 클래스이기도 합니다.

<hr/>

<!--
## What classes should I _not_ add to `declarations`?
-->
## `declarations` 배열에 추가하지 _말아야_ 할 클래스는 어떤 것이 있나요?

<!--
Add only [declarable](guide/bootstrapping#the-declarations-array) classes to an NgModule's `declarations` list.
-->
NgModule의 `declarations` 배열에는 [declarable](guide/bootstrapping#declarations-배열) 클래스만 추가해야 합니다.

<!--
Do *not* declare the following:

* A class that's already declared in another module, whether an app module, @NgModule, or third-party module.
* An array of directives imported from another module.
For example, don't declare `FORMS_DIRECTIVES` from `@angular/forms` because the `FormsModule` already declares it.

* Module classes.
* Service classes.
* Non-Angular classes and objects, such as
strings, numbers, functions, entity models, configurations, business logic, and helper classes.
-->
그래서 다음과 같은 항목은 추가하면 *안됩니다*:

* 다른 모듈, 서드파티 모듈에 이미 추가된 클래스
* 다른 모듈에서 가져온 디렉티브.
예를 들어 `@angular/forms` 라이브러리에서 `FormsModule` 모듈을 로드했다면, 이 모듈에 있는 `FORMS_DIRECTIVES`는 추가하면 안됩니다.

* 모듈 클래스
* 서비스 클래스
* Angular 구성요소가 아닌 클래스나 객체 : 문자열, 숫자, 함수, 데이터 모델, config 설정, 업무 로직 클래스, 헬퍼 클래스

<hr/>

<!--
## Why list the same component in multiple `NgModule` properties?
-->
## `NgModule` 프로퍼티에 컴포넌트가 여러번 사용되는 경우도 있나요?

<!--
`AppComponent` is often listed in both `declarations` and `bootstrap`.
You might see the same component listed in `declarations`, `exports`, and `entryComponents`.

While that seems redundant, these properties have different functions.
Membership in one list doesn't imply membership in another list.
-->
`AppComponent`는 `declarations` 배열에 추가되기도 하지만 `bootstrap` 배열에 추가되기도 합니다.
어떤 경우에는 `declarations`, `exports`, `entryComponents`에 모두 등록되어 있는 컴포넌트도 있습니다.

이런 문법은 조금 귀찮을 수 있지만 각각의 프로퍼티는 다른 역할을 하기 때문에 프로퍼티마다 따로 등록하는 작업이 필요합니다.
프로퍼티는 서로 다른 프로퍼티에 영향을 주지 않습니다.

<!--
* `AppComponent` could be declared in this module but not bootstrapped.
* `AppComponent` could be bootstrapped in this module but declared in a different feature module.
* A component could be imported from another app module (so you can't declare it) and re-exported by this module.
* A component could be exported for inclusion in an external component's template
as well as dynamically loaded in a pop-up dialog.
-->
* `AppComponent`는 모듈에 등록되어 있지만 부트스트랩되지 않을 수도 있습니다.
* 다른 기능 모듈에서 불러온 `AppComponent`가 부트스트랩 될 수도 있습니다.
* 다른 앱 모듈에서 가져온 컴포넌트를 `exports`로 다시 추가하는 경우도 있습니다.
* 팝업과 같이 동적으로 로딩되는 컴포넌트가 있을 수도 있습니다.

<hr/>

<!--
## What does "Can't bind to 'x' since it isn't a known property of 'y'" mean?
-->
## "Can't bind to 'x' since it isn't a known property of 'y'" 에러가 발생하는 이유는 뭔가요?

<!--
This error often means that you haven't declared the directive "x"
or haven't imported the NgModule to which "x" belongs.
-->
이 에러는 디렉티브 "x"를 모듈에 등록하지 않았거나 디렉티브 "x"가 등록된 모듈을 로드하지 않았을 때 발생합니다.

<div class="alert is-helpful">

<!--
Perhaps you declared "x" in an application sub-module but forgot to export it.
The "x" class isn't visible to other modules until you add it to the `exports` list.
-->
어쩌면 어딘가에 디렉티브 "x"를 등록했지만 모듈 외부로 공개하지 않은 경우일 수도 있습니다.
모듈의 `exports` 배열에 등록되지 않은 Angular 구성요소는 다른 모듈에서 참조할 수 없습니다.

</div>

<hr/>

<!--
## What should I import?
-->
## 어떤 모듈을 로드(import)해야 하나요?

<!--
Import NgModules whose public (exported) [declarable classes](guide/bootstrapping#the-declarations-array)
you need to reference in this module's component templates.
-->
이 모듈의 컴포넌트 템플릿에서 사용하려는 [Angular 구성요소의 클래스](guide/bootstrapping#declarations-배열)를 제공하는 NgModule을 로드하면 됩니다.

<!--
This always means importing `CommonModule` from `@angular/common` for access to
the Angular directives such as `NgIf` and `NgFor`.
You can import it directly or from another NgModule that [re-exports](guide/ngmodule-faq#q-reexport) it.
-->
그래서 `NgIf`나 `NgFor`와 같은 Angular 기본 디렉티브를 사용하려면 `@angular/common` 라이브러리에서 `CommonModule`을 불러오면 됩니다.
이 때 디렉티브가 선언된 모듈을 불러와도 되고, 다른 모듈이 불러 와서 [다시 모듈 외부로 공개](guide/ngmodule-faq#q-reexport)하는 모듈을 불러와도 됩니다.

<!--
Import `FormsModule` from `@angular/forms`
if your components have `[(ngModel)]` two-way binding expressions.
-->
컴포넌트에서 `[(ngModel)]`로 양방향 바인딩하려면 `@angular/forms` 라이브러리에서 `FormsModule`을 불러오면 됩니다.

<!--
Import _shared_ and _feature_ modules when this module's components incorporate their
components, directives, and pipes.
-->
그리고 현재 모듈에 등록된 컴포넌트나 디렉티브, 파이프가 다른 모듈과 연관되어 있다면 그 모듈을 로드하는 것이 좋습니다.

<!--
Import [BrowserModule](guide/ngmodule-faq#q-browser-vs-common-module) only in the root `AppModule`.
-->
[BrowserModule](guide/ngmodule-faq#q-browser-vs-common-module)은 애플리케이션의 최상위 `AppModule`에서만 로드합니다.

<hr/>

{@a q-browser-vs-common-module}

<!--
## Should I import `BrowserModule` or `CommonModule`?
-->
## `BrowserModule`을 로드해야 하나요, `CommonModule`을 로드해야 하나요?

<!--
The root application module, `AppModule`, of almost every browser application
should import `BrowserModule` from `@angular/platform-browser`.

`BrowserModule` provides services that are essential to launch and run a browser app.

`BrowserModule` also re-exports `CommonModule` from `@angular/common`,
which means that components in the `AppModule` module also have access to
the Angular directives every app needs, such as `NgIf` and `NgFor`.

Do not import `BrowserModule` in any other module.
*Feature modules* and *lazy-loaded modules* should import `CommonModule` instead.
They need the common directives. They don't need to re-install the app-wide providers.

Importing `CommonModule` also frees feature modules for use on _any_ target platform, not just browsers.
-->
브라우저에서 실행되는 애플리케이션의 최상위 모듈인 `AppModule`은 `@angular/platform-browser`에서 제공하는 `BrowserModule`을 로드해야 하는데, `BrowserModule`에는 브라우저에서 앱을 실행하는 데 필요한 서비스들이 정의되어 있습니다.

`BrowserModule`은 `@angular/commoon`에서 제공하는 `CommonModule`을 확장하는 모듈이기도 한데, 이것은 `AppModule` 안에 있는 모든 컴포넌트에서 `NgIf`나 `NgFor`와 같은 Angular 기본 디렉티브를 사용할 수 있다는 것을 의미하기도 합니다.

하지만 앱 모듈이 아닌 모듈에서 `BrowserModule`을 로드하면 안됩니다.
*기능 모듈*이나 *지연 로딩되는 모듈*은 `BrowserModule` 대신 `CommonModule`을 로드해야 합니다.
앱 모듈이 아닌 경우에도 Angular 기본 디렉티브는 사용할 수 있지만, 앱 전역에 설정되는 프로바이더를 다시 초기화할 필요는 없습니다.

브라우저에서 동작하지 않는 Angular 애플리케이션이라면 `BrowserModule` 없이 `CommonModule`을 사용하는 경우도 있습니다.

<hr/>

{@a q-reimport}

<!--
## What if I import the same module twice?
-->
## 모듈을 두 번 로드하면 어떻게 되나요?

<!--
That's not a problem. When three modules all import Module 'A',
Angular evaluates Module 'A' once, the first time it encounters it, and doesn't do so again.
-->
문제가 되지 않습니다. 만약 3개의 모듈에서 모듈 'A'를 각각 로드한다고 해도 Angular는 모듈 'A'를 한 번만 초기화합니다. 

<!--
That's true at whatever level `A` appears in a hierarchy of imported NgModules.
When Module 'B' imports Module 'A', Module 'C' imports 'B', and Module 'D' imports `[C, B, A]`,
then 'D' triggers the evaluation of 'C', which triggers the evaluation of 'B', which evaluates 'A'.
When Angular gets to the 'B' and 'A' in 'D', they're already cached and ready to go.
-->
이 때 모듈이 초기화되는 순서는 모듈이 로드되는 순서에 따라 달라집니다.
만약 모듈 'B'가 모듈 'A'를 로드하고, 모듈 'C'가 모듈 'B'를 참조하고, 마지막으로 모듈 'D'가 모듈 `[C, B, A]`를 로드한다고 합시다. 그러면 모듈 'D'가 로드될 때 모듈 'C'를 초기화하는데, 이 때 모듈 'C'에서 참조하는 모듈 'B'가 먼저 초기화되고, 모듈 'B'에서 참조하는 모듈 'A'가 가장 먼저 초기화됩니다.
그리고 모듈 'D'에서 모듈 'B'와 'A'를 참조할 때는 캐시된 객체를 사용합니다.

<!--
Angular doesn't like NgModules with circular references, so don't let Module 'A' import Module 'B', which imports Module 'A'.
-->
Angular는 순환 참조를 지원하지 않습니다. 모듈 'A'가 모듈 'B'를 참조하는 상태에서 모듈 'B'가 모듈 'A'를 다시 참조하면 안됩니다.

<hr/>

{@a q-reexport}

<!--
## What should I export?
-->
## 무엇을 모듈 외부로 공개해야 하나요?

<!--
Export [declarable](guide/bootstrapping#the-declarations-array) classes that components in _other_ NgModules
are able to reference in their templates. These are your _public_ classes.
If you don't export a declarable class, it stays _private_, visible only to other components
declared in this NgModule.
-->
다른 모듈의 템플릿에서 사용되어야 할 [컴포넌트나 디렉티브, 파이프](guide/bootstrapping#declarations-배열) 클래스를 모듈 외부로 공개해야 합니다.
이렇게 지정하는 클래스들이 이 모듈의 _public_ 클래스입니다.
모듈 외부로 지정하지 않은 Angular 구성요소는 기본적으로 _private_ 이며, 해당 모듈 안에서만 사용할 수 있습니다.

<!--
You _can_ export any declarable class&mdash;components, directives, and pipes&mdash;whether
it's declared in this NgModule or in an imported NgModule.
-->
이 때 `exports` 배열로 지정하는 클래스는 해당 모듈의 `declarations` 배열에 추가된 클래스이거나 다른 모듈에서 가져온 클래스일 수 있습니다.

<!--
You _can_ re-export entire imported NgModules, which effectively re-exports all of their exported classes.
An NgModule can even export a module that it doesn't import.
-->
불러온 모듈에 등록된 Angular 구성요소 전체를 다시 공개할 수도 있고, 아무것도 추가하지 않고 그대로 다시 공개할 수도 있습니다.

<hr/>

<!--
## What should I *not* export?
-->
## 모듈 외부로 공개하지 *말아야* 하는 것은 어떤 것이 있나요?

<!--
Don't export the following:

* Private components, directives, and pipes that you need only within components declared in this NgModule.
If you don't want another NgModule to see it, don't export it.
* Non-declarable objects such as services, functions, configurations, and entity models.
* Components that are only loaded dynamically by the router or by bootstrapping.
Such [entry components](guide/ngmodule-faq#q-entry-component-defined) can never be selected in another component's template.
While there's no harm in exporting them, there's also no benefit.
* Pure service modules that don't have public (exported) declarations.
For example, there's no point in re-exporting `HttpClientModule` because it doesn't export anything.
Its only purpose is to add http service providers to the application as a whole.
-->
다음 항목은 모듈 외부로 공개하면 안됩니다:

* 해당 모듈에서만 사용하는 private 컴포넌트, 디렉티브, 파이프
다른 모듈에 사용되는 것을 원하지 않는다면 모듈 외부로 공개하지 않으면 됩니다.
* 컴포넌트, 디렉티브, 파이프가 아닌 객체 : 서비스, 함수, config 설정, 데이터 모델
* 라우터나 부트스트랩 대상으로 지정되어 동적으로 로딩되는 컴포넌트.
[진입 컴포넌트](guide/ngmodule-faq#q-entry-component-defined)는 다른 컴포넌트 템플릿에 사용될 필요가 없습니다.
진입 컴포넌트를 모듈 외부로 공개해도 별 문제는 없지만, 아무 이득없이 모듈 외부로 공개할 필요도 없습니다.
* public `declarations` 배열이 없는 서비스 모듈.
`HttpClientModule`과 같은 모듈은 불러와서 다시 공개할 이유가 없습니다. 왜냐하면 이 모듈은 아무것도 모듈 외부로 공개하지 않으며, 앱 전역에서 사용하는 http 서비스 프로바이더만 제공하기 때문입니다.

<hr/>


<!--
## Can I re-export classes and modules?
-->
## 다른 곳에서 불러온 클래스나 모듈을 다시 `exports`로 지정해도 되나요?

<!--
Absolutely.
-->
물론 가능합니다.

<!--
NgModules are a great way to selectively aggregate classes from other NgModules and
re-export them in a consolidated, convenience module.
-->
그리고 다른 모듈에 있는 클래스를 조합해서 새로운 모듈로 만드는 것도 가능합니다.

<!--
An NgModule can re-export entire NgModules, which effectively re-exports all of their exported classes.
Angular's own `BrowserModule` exports a couple of NgModules like this:
-->
이 때 `exports` 배열에 모듈을 지정하면 해당 모듈에서 모듈 외부로 공개하도록 지정된 모든 구성요소를 다시 공개하는 선언이 됩니다.
Angular 라이브러리 중 `BrowserModule`을 보면 다음과 같이 사용된 부분이 있습니다:

```typescript
  exports: [CommonModule, ApplicationModule]
```

<!--
An NgModule can export a combination of its own declarations, selected imported classes, and imported NgModules.
-->
모듈은 모듈 안에 선언된 컴포넌트나 디렉티브, 파이프는 물론이고 다른 모듈에서 불러온 구성요소를 조합해서 모듈 외부로 공개할 수도 있습니다.

<!--
Don't bother re-exporting pure service modules.
Pure service modules don't export [declarable](guide/bootstrapping#the-declarations-array) classes that another NgModule could use.
For example, there's no point in re-exporting `HttpClientModule` because it doesn't export anything.
Its only purpose is to add http service providers to the application as a whole.
-->
다만 서비스 모듈은 모듈 외부로 다시 공개하면 안됩니다.
왜냐하면 서비스 모듈에는 모듈 외부로 공개된 [declarable](guide/bootstrapping#declarations-배열) 클래스가 없기 때문에 이 모듈을 다시 `exports`로 지정하는 것은 의미가 없습니다.
예를 들어 `HttpClientModule`은 아무것도 모듈 외부로 공개하지 않습니다.
이 모듈의 목적은 앱 전역에 http 서비스 프로바이더를 제공하는 것 뿐입니다.

<hr/>

<!--
## What is the `forRoot()` method?
-->
## `forRoot()` 메소드가 뭔가요?

<!--
The `forRoot()` static method is a convention that makes it easy for developers to configure services and providers that are intended to be singletons. A good example of `forRoot()` is the `RouterModule.forRoot()` method.
-->
정적 메소드 `forRoot()`는 싱글턴으로 사용하는 서비스와 프로바이더를 좀 더 쉽게 사용할 수 있도록 제공하는 함수입니다. `forRoot()` 메소드는 많은 모듈에서 제공하며, `RouterModule.forRoot()` 메소드도 이 중 하나입니다.

<!--
Apps pass a `Routes` object to `RouterModule.forRoot()` in order to configure the app-wide `Router` service with routes.
`RouterModule.forRoot()` returns a [ModuleWithProviders](api/core/ModuleWithProviders).
You add that result to the `imports` list of the root `AppModule`.
-->
`RouterModule.forRoot()`에 `Routes` 객체를 전달하면 앱 전역에서 사용할 수 있는 `Router` 서비스를 설정하고 [ModuleWithProviders](api/core/ModuleWithProviders) 객체를 반환합니다.
그리고 이 모듈을 `AppModule`의 `imports` 배열에 추가하면 라우터를 사용할 수 있습니다.

<!--
Only call and import a `forRoot()` result in the root application module, `AppModule`.
Avoid importing it in any other module, particularly in a lazy-loaded module. For more
information on `forRoot()` see [the `forRoot()` pattern](guide/singleton-services#the-forroot-pattern) section of the [Singleton Services](guide/singleton-services) guide.

For a service, instead of using `forRoot()`,  specify `providedIn: 'root'` on the service's `@Injectable()` decorator, which
makes the service automatically available to the whole application and thus singleton by default.
-->
`forRoot()` 메소드는 애플리케이션의 최상위 모듈인 `AppModule`에서만 사용해야 합니다.
앱 모듈이 아닌 기능 모듈, 특히 지연로딩 되는 다른 모듈에서 이 함수를 사용하면 런타임 에러가 발생할 수 있습니다.
`forRoot()` 함수에 대해 더 알아보려면 [싱글턴 서비스](guide/singleton-services) 가이드 문서의 [`forRoot()` 패턴](guide/singleton-services#the-forroot-pattern) 섹션을 참고하세요.

서비스를 싱글턴으로 만드는 것이라면 `forRoot()` 메소드 대신 `@Injectable()` 데코레이터 안에 `providedIn: 'root'`를 지정해도 됩니다. 이렇게 지정된 서비스는 앱 전역으로 사용할 수 있는 싱글턴 서비스로 생성됩니다.

<!--
`RouterModule` also offers a `forChild()` static method for configuring the routes of lazy-loaded modules.
-->
정적 모듈에서 `RouterModule`을 사용하려면 `forRoot()` 메소드 대신 `forChild()` 메소드를 사용해야 합니다.

<!--
`forRoot()` and `forChild()` are conventional names for methods that
configure services in root and feature modules respectively.
-->
`forRoot()` 메소드와 `forChild()` 메소드는 모두 앱 모듈이나 기능 모듈에 서비스를 편하게 등록하기 위한 용도로 제공되는 함수입니다.

<!--
Follow this convention when you write similar modules with configurable service providers.
-->
서비스 프로바이더의 설정을 외부에서 지정하는 모듈이라면 이 패턴을 도입할 수 있는지 검토해 보세요.

<hr/>

<!--
## Why is a service provided in a feature module visible everywhere?
-->
## 기능 모듈에 등록된 서비스는 왜 외부에서도 접근할 수 있나요?

<!--
Providers listed in the `@NgModule.providers` of a bootstrapped module have application scope.
Adding a service provider to `@NgModule.providers` effectively publishes the service to the entire application.
-->
부트스트랩되는 모듈의 `@NgModule.providers`에 선언된 프로바이더 목록은 애플리케이션 전체 범위에 유효합니다. 그리고 이 목록에 등록된 프로바이더로 생성하는 서비스도 앱 전체 범위에서 접근할 수 있습니다.

<!--
When you import an NgModule,
Angular adds the module's service providers (the contents of its `providers` list)
to the application root injector.
-->
모듈이 로드되면 이 모듈에 등록된 서비스 프로바이더가 애플리케이션 최상위 인젝터에도 등록됩니다.

<!--
This makes the provider visible to every class in the application that knows the provider's lookup token, or name.
-->
그래서 프로바이더의 토큰이나 이름을 알면 애플리케이션의 모든 클래스에 자유롭게 사용할 수 있습니다.

<!--
This is by design.
Extensibility through NgModule imports is a primary goal of the NgModule system.
Merging NgModule providers into the application injector
makes it easy for a module library to enrich the entire application with new services.
By adding the `HttpClientModule` once, every application component can make HTTP requests.
-->
이것은 Angular가 의도한 디자인입니다.
NgModule 체계에서 가장 중요한 것은 확장성입니다.
그리고 앱 모듈에 NgModule을 추가로 로드할 때마다 인젝터가 합쳐지는 것은 애플리케이션 전체에 새로운 기능을 추가하기 위한 것입니다.
`HttpClientModule`을 로드한 이후로는 애플리케이션 전체에서 HTTP 요청을 보낼 수 있는 것을 생각해 보세요.

<!--
However, this might feel like an unwelcome surprise if you expect the module's services
to be visible only to the components declared by that feature module.
If the `HeroModule` provides the `HeroService` and the root `AppModule` imports `HeroModule`,
any class that knows the `HeroService` _type_ can inject that service,
not just the classes declared in the `HeroModule`.
-->
하지만 기능 모듈 밖으로 서비스가 노출되지 않는 것이 좋다고 생각하는 관점에서는 이 방식이 어색할 수 있습니다.
확실하게 이해해야 하는 것은, `HeroModule`에 `heroService`가 등록되어 있고 `AppModule`이 `HeroModule`을 로드한다면 `HeroModule` 안에서만이 아니라 앱 전체에서 `HeroService`를 주입받아 사용할 수 있습니다.

<!--
To limit access to a service, consider lazy loading the NgModule that provides that service. See [How do I restrict service scope to a module?](guide/ngmodule-faq#service-scope) for more information.
-->
서비스에 접근하는 것을 제한하려면 이 서비스가 등록된 NgModule을 지연로딩하는 것도 검토해볼 수 있습니다. 좀 더 자세한 내용을 확인하려면 [서비스를 모듈 범위로 제한하고 싶으면 어떻게 하면 되나요?](guide/ngmodule-faq#service-scope) 섹션을 참고하세요.

<hr/>

{@a q-lazy-loaded-module-provider-visibility}

<!--
## Why is a service provided in a lazy-loaded module visible only to that module?
-->
## 지연로딩 되는 모듈에 등록된 서비스는 왜 그 모듈에서만 접근할 수 있나요?

<!--
Unlike providers of the modules loaded at launch,
providers of lazy-loaded modules are *module-scoped*.
-->
애플리케이션이 실행될 때 모두 로드되는 프로바이더와는 다르게, 지연로딩 되는 모듈에 등록된 프로바이더는 그 *모듈 범위 안에서만 유효*합니다.

<!--
When the Angular router lazy-loads a module, it creates a new execution context.
That [context has its own injector](guide/ngmodule-faq#q-why-child-injector "Why Angular creates a child injector"),
which is a direct child of the application injector.
-->
Angular 라우터가 모듈을 지연로딩하면, 이 모듈은 새로운 실행 컨텍스트에서 동작합니다.
그리고 애플리케이션 인젝터와는 독립적인 [인젝터](guide/ngmodule-faq#q-why-child-injector "Why Angular creates a child injector")를 구성합니다.

<!--
The router adds the lazy module's providers and the providers of its imported NgModules to this child injector.
-->
이 인젝터는 상위 모듈의 자식 인젝터이며, 지연로딩된 모듈과 이 모듈의 자식 모듈에 등록된 프로바이더는 모두 이 인젝터에 등록됩니다.

<!--
These providers are insulated from changes to application providers with the same lookup token.
When the router creates a component within the lazy-loaded context,
Angular prefers service instances created from these providers to the service instances of the application root injector.
-->
하지만 이 때 등록되는 프로바이더의 토큰이 같더라도 모두 상위 모듈의 프로바이더와는 분리됩니다.
그래서 지연로딩되는 컴포넌트로 라우팅 될 때도 애플리케이션 전역에 있는 인젝터 대신 해당 모듈에 등록된 서비스 프로바이더로 서비스 인스턴스가 생성됩니다.

<hr/>

<!--
## What if two modules provide the same service?
-->
## 같은 서비스가 다른 모듈로 두 번 등록되면 어떻게 되나요?

<!--
When two imported modules, loaded at the same time, list a provider with the same token,
the second module's provider "wins". That's because both providers are added to the same injector.
-->
동시에 로드되는 모듈에 같은 프로바이더 토큰이 동시에 로드되면, 두 번째 실행되는 모듈의 프로바이더가 앞쪽 토큰을 덮어씁니다. 왜냐하면 두 번 모두 같은 인젝터를 사용하기 때문입니다.

<!--
When Angular looks to inject a service for that token,
it creates and delivers the instance created by the second provider.
-->
Angular는 주입하는 서비스를 찾을 때 토큰으로 구분하기 때문에, 서비스 인스턴스를 찾거나 생성할 때도 두 번째 등록된 프로바이더를 사용합니다.

<!--
_Every_ class that injects this service gets the instance created by the second provider.
Even classes declared within the first module get the instance created by the second provider.
-->
그래서 의존성으로 주입되는 서비스의 인스턴스도 모두 두 번째 등록하는 프로바이더에서 만든 인스턴스입니다.
심지어 첫 번째 모듈에서도 두 번째 등록한 프로바이더가 사용됩니다.

<!--
If NgModule A provides a service for token 'X' and imports an NgModule B
that also provides a service for token 'X', then NgModule A's service definition "wins".
-->
만약 모듈 B에 서비스 토큰 'X'에 대한 프로바이더를 등록되어 있는데 모듈 A가 모듈 B 로드하면서 이 서비스 프로바이더를 다시 등록하면, 이 때도 모듈 A 프로바이더가 우선됩니다.

<!--
The service provided by the root `AppModule` takes precedence over services provided by imported NgModules.
The `AppModule` always wins.
-->
하지만, 최상위 `AppModule`에 등록된 서비스 프로바이더는 모든 NgModule에 등록된 서비스 프로바이더보다 우선 처리됩니다.
토큰이 중복되는 상황이라면 `AppModule`에 지정된 서비스 프로바이더가 최우선으로 동작합니다.

<hr/>

{@a service-scope}
<!--
## How do I restrict service scope to a module?
-->
## 서비스를 모듈 범위로 제한하고 싶으면 어떻게 하면 되나요?

<!--
When a module is loaded at application launch,
its `@NgModule.providers` have *application-wide scope*;
that is, they are available for injection throughout the application.
-->
모듈은 애플리케이션이 실행될 때 로드되고, 이 때 `@NgModule.providers`에 등록된 프로바이더들은 *애플리케이션 전역 스코프*를 갖습니다. 그래서 의존성으로 주입하는 객체는 이 프로바이더 목록 중에 찾게 됩니다.

<!--
Imported providers are easily replaced by providers from another imported NgModule.
Such replacement might be by design. It could be unintentional and have adverse consequences.
-->
그리고 모듈이 추가로 로드되면 이 모듈에 등록된 프로바이더가 이전 프로바이더를 대체합니다.
이것은 새로 추가된 모듈이 새로운 프로바이더를 사용하게 하려는 Angular의 디자인 컨셉입니다.

<!--
As a general rule, import modules with providers _exactly once_, preferably in the application's _root module_.
That's also usually the best place to configure, wrap, and override them.
-->
일반적으로 모듈은 애플리케이션의 _최상위 모듈_ 에 _한 번만_ 로드되는 것이 좋습니다.
모듈이 다른 모듈로 랩핑(wrap)되거나 오버라이드 되더라도 일반적으로는 그렇습니다.

<!--
Suppose a module requires a customized `HttpBackend` that adds a special header for all Http requests.
If another module elsewhere in the application also customizes `HttpBackend`
or merely imports the `HttpClientModule`, it could override this module's `HttpBackend` provider,
losing the special header. The server will reject http requests from this module.
-->
모든 Http 요청에 대해 헤더를 추가하기 위해 `HttpBackend`를 커스터마이징하는 모듈이 있다고 합시다.
그런데 다른 모듈에서 `HttpBackend`를 커스터마이징하거나 `HttpClientModule`을 직접 불러와서 사용하는 모듈이 이 모듈의 프로바이더를 덮어쓸 수도 있습니다. 그러면 커스터마이징 한 헤더가 추가되지 않으니, 이 모듈에서 서버로 보낸 요청은 모두 실패할 것입니다.

<!--
To avoid this problem, import the `HttpClientModule` only in the `AppModule`, the application _root module_.
-->
이 문제를 해결하려면 `HttpClientModule`을 애플리케이션의 _최상위 모듈_ 인 `AppModule`에서 딱 한 번만 로드해야 합니다.

<!--
If you must guard against this kind of "provider corruption", *don't rely on a launch-time module's `providers`.*
-->
그리고 프로바이더가 바뀌는 것을 방지하려면 런타임에 로드되는 모듈의 프로바이더도 신경을 써야 합니다.

<!--
Load the module lazily if you can.
Angular gives a [lazy-loaded module](guide/ngmodule-faq#q-lazy-loaded-module-provider-visibility) its own child injector.
The module's providers are visible only within the component tree created with this injector.
-->
가능하다면 모듈을 지연로딩하는 것이 좋습니다.
Angular가 [모듈을 지연로딩하면](guide/ngmodule-faq#q-lazy-loaded-module-provider-visibility) 모듈에 자식 인젝터가 생성되면서, 모듈 안에 있는 프로바이더는 그 모듈 안에서만 사용할 수 있기 때문입니다.

<!--
If you must load the module eagerly, when the application starts,
*provide the service in a component instead.*
-->
하지만 모듈을 지연로딩할 수 없다면 *컴포넌트 안에 서비스 프로바이더를 등록하는 방법도 있습니다.*

<!--
Continuing with the same example, suppose the components of a module truly require a private, custom `HttpBackend`.
-->
위에서 언급한 예제를 다시 한 번 생각해봅시다.

<!--
Create a "top component" that acts as the root for all of the module's components.
Add the custom `HttpBackend` provider to the top component's `providers` list rather than the module's `providers`.
Recall that Angular creates a child injector for each component instance and populates the injector
with the component's own providers.
-->
모듈 안에 있는 모든 컴포넌트의 최상위 역할을 하는 _최상위 컴포넌트_ 를 만듭니다.
그리고 `HttpBackend` 커스텀 프로바이더를 모듈의 `providers`에 등록하지 않고 컴포넌트에 `providers`에 등록합니다.
컴포넌트에 프로바이더가 등록되어 있으면, 이 컴포넌트의 자식 인젝터들은 모두 이 프로바이더를 사용한다는 것을 생각하면 됩니다.

<!--
When a child of this component asks for the `HttpBackend` service,
Angular provides the local `HttpBackend` service,
not the version provided in the application root injector.
Child components make proper HTTP requests no matter what other modules do to `HttpBackend`.
-->
실제로 이 컴포넌트의 자식 컴포넌트에서 `HttpBackend` 서비스를 의존성으로 주입받으면, 애플리케이션 최상위 인젝터가 제공하는 인스턴스가 아니라 컴포넌트에 정의된 프로바이더에서 인스턴스를 찾습니다.
이제 모듈 안에서 `HttpBackend`로 보내는 HTTP 요청은 의도한 대로 동작합니다.

<!--
Be sure to create module components as children of this module's top component.
-->
이 컴포넌트는 물론 모듈의 최상위 컴포넌트로 지정해야 하는 것을 잊지 마세요.

<!--
You can embed the child components in the top component's template.
Alternatively, make the top component a routing host by giving it a `<router-outlet>`.
Define child routes and let the router load module components into that outlet.
-->
자식 컴포넌트는 일반적으로 최상위 컴포넌트의 템플릿 안에 사용될 것입니다.
아니면 `<router-outlet>`으로 라우팅되는 컴포넌트를 활용할 수도 있습니다.
모듈에 자식 라우터를 설정하면 라우팅 영역 안에 컴포넌트가 표시될 것입니다.

<!--
Though you can limit access to a service by providing it in a lazy loaded module or providing it in a component, providing services in a component can lead to multiple instances of those services. Thus, the lazy loading is preferable.
-->
서비스에 접근할 수 있는 범위를 제한할 때는 서비스가 등록된 모듈을 지연로딩하거나 서비스를 컴포넌트에 등록하는 방법을 사용할 수 있습니다. 하지만 서비스를 컴포넌트에 등록하면 컴포넌트의 인스턴스마다 새로운 서비스 인스턴스가 계속 생성되기 때문에, 서비스가 등록된 모듈을 지연로딩하는 방법이 더 효율적입니다.

<hr/>

{@a q-root-component-or-module}


<!--
## Should I add application-wide providers to the root `AppModule` or the root `AppComponent`?
-->
## 애플리케이션 전역에 사용하는 프로바이더는 `AppModule`이나 `AppComponent`에 등록해야 하나요?

<!--
 Define application-wide providers by specifying `providedIn: 'root'` on its `@Injectable()` decorator (in the case of services) or at `InjectionToken` construction (in the case where tokens are provided). Providers that are created this way automatically are made available to the entire application and don't need to be listed in any module.
-->
애플리케이션 전역에 등록되는 프로바이더는 `@Injectable()`에 `providedIn: 'root'`를 지정하거나 `InjectionToken`를 사용해서 정의할 수 있습니다. 이 때 전자는 서비스에 대한 프로바이더이며, 후자는 토큰에 대한 프로바이더입니다. 이렇게 등록된 프로바이더는 자동으로 애플리케이션 전역에 등록되며, 모듈에서 따로 로드하지 않아도 자유롭게 사용할 수 있습니다.

<!--
If a provider cannot be configured in this way (perhaps because it has no sensible default value), then register application-wide providers in the root `AppModule`, not in the `AppComponent`.
-->
이전에 사용하는 프로바이더와 충돌이 걱정되어 이 방법을 사용할 수 없다면, `AppComponent`에 프로바이더를 등록하지 않고 `AppModule`에 프로바이더를 등록하는 방법도 있습니다.

<!--
Lazy-loaded modules and their components can inject `AppModule` services;
they can't inject `AppComponent` services.
-->
그러면 이 프로바이더들은 `AppModule`에는 등록되지만 `AppComponent`에는 등록되지 않습니다.

<!--
Register a service in `AppComponent` providers _only_ if the service must be hidden
from components outside the `AppComponent` tree. This is a rare use case.
-->
서비스 프로바이더를 `AppComponent`에 등록하는 것은 이 서비스가 반드시 `AppComponent` 트리 안에서만 사용하도록 지정할 때 사용합니다. 자주 사용하는 방식은 아닙니다.

<!--
More generally, [prefer registering providers in NgModules](guide/ngmodule-faq#q-component-or-module) to registering in components.
-->
이보다 좀 더 일반적인 경우에는, [프로바이더는 모듈에 등록](guide/ngmodule-faq#q-component-or-module)하는 것이 좋습니다. 이렇게 사용하면 모듈 안에 있는 컴포넌트들은 등록된 프로바이더를 사용할 수 있습니다.

<!--
<h3 class="no-toc">Discussion</h3>
-->
<h3 class="no-toc">주의</h3>

<!--
Angular registers all startup module providers with the application root injector.
The services that root injector providers create have application scope, which
means they are available to the entire application.
-->
Angular는 애플리케이션이 시작될 때 로드되는 모듈에 있는 모든 프로바이더를 애플리케이션 최상위 인젝터에 등록합니다.
그러면 이 인젝터로 참조하는 프로바이더는 애플리케이션 전체 범위에 유효합니다.

<!--
Certain services, such as the `Router`, only work when you register them in the application root injector.
-->
하지만 `Router`와 같이 애플리케이션 최상위 인젝터에 등록해야만 동작하는 서비스도 있습니다.

<!--
By contrast, Angular registers `AppComponent` providers with the `AppComponent`'s own injector.
`AppComponent` services are available only to that component and its component tree.
They have component scope.
-->
이와는 다르게, `AppComponent`에 등록하는 프로바이더는 `AppComponent`에 존재하는 인젝터에만 등록됩니다.
그래서 `AppComponent`에 등록된 서비스는 컴포넌트 범위로 제한되며, 이 컴포넌트의 하위 트리에서만 사용할 수 있습니다.

<!--
The `AppComponent`'s injector is a child of the root injector, one down in the injector hierarchy.
For applications that don't use the router, that's almost the entire application.
But in routed applications, routing operates at the root level
where `AppComponent` services don't exist.
This means that lazy-loaded modules can't reach them.
-->
`AppComponent`에 존재하는 인젝터는 최상위 인젝터의 자식 인젝터이며, 라우터를 사용하지 않는 애플리케이션이라면 `AppComponent`의 범위는 애플리케이션 전체 범위와 비슷할 수도 있습니다.
하지만 라우터를 사용하는 애플리케이션이라면 `AppComponent`보다 상위 계층에서 라우팅이 동작합니다.
따라서 지연로딩되는 모듈은 `AppComponent`의 인젝터에 접근할 수 없습니다.

<hr/>

{@a q-component-or-module}

<!--
## Should I add other providers to a module or a component?
-->
## 프로바이더는 모듈이나 컴포넌트에 꼭 등록해야 하나요?

<!--
Providers should be configured using `@Injectable` syntax. If possible, they should be provided in the application root (`providedIn: 'root'`). Services that are configured this way are lazily loaded if they are only used from a lazily loaded context.
-->
프로바이더는 `@Injectable` 문법으로 등록되어야 하며, 가능하다면 애플리케이션 최상위 계층에 존재하도록 `providedIn: 'root'`을 지정해야 합니다. 지연로딩되는 모듈에 등록된 프로바이더는 모듈과 함께 필요할 때 로딩됩니다.

<!--
If it's the consumer's decision whether a provider is available application-wide or not,
then register providers in modules (`@NgModule.providers`) instead of registering in components (`@Component.providers`).
-->
그리고 이 프로바이더가 애플리케이션 전역에 사용되는지 일부 범위에만 사용되는지에 따라 달라지지만, 프로바이더는 되도록 컴포넌트(`@Component.providers`)에 등록하는 것보다 모듈(`@NgModule.providers`)에 등록하는 것이 좋습니다.

<!--
Register a provider with a component when you _must_ limit the scope of a service instance
to that component and its component tree.
Apply the same reasoning to registering a provider with a directive.
-->
프로바이더를 컴포넌트에 등록하는 것은 이 프로바이더의 범위가 특정 컴포넌트 트리 안쪽으로 _제한되어야만 할 때만_ 사용합니다.
프로바이더를 디렉티브에 등록하는 것도 마찬가지입니다.

<!--
For example, an editing component that needs a private copy of a caching service should register
the service with the component.
Then each new instance of the component gets its own cached service instance.
The changes that editor makes in its service don't touch the instances elsewhere in the application.
-->
예를 들어, 어떤 에디터 컴포넌트는 외부와 분리된 캐시를 유지하기 위해 컴포넌트에 프로바이더를 등록해서 사용한다고 합시다.
그러면 이 컴포넌트가 생성될 때마다 독립적인 서비스 인스턴스가 계속 생성됩니다.
그리고 이 컴포넌트에서 서비스에 접근해서 작업하는 모든 내용은 컴포넌트 밖에 아무 영향도 미치지 않을 것입니다.

<!--
[Always register _application-wide_ services with the root `AppModule`](guide/ngmodule-faq#q-root-component-or-module),
not the root `AppComponent`.
-->
[_애플리케이션 전역에 동작하는 서비스_ 는](guide/ngmodule-faq#q-root-component-or-module) 최상위 컴포넌트 `AppComponent`가 아니라 최상위 모듈 `AppModule`에 등록하는 것이 좋다는 것도 꼭 기억하세요.

<hr/>

{@a q-why-bad}

<!--
## Why is it bad if a shared module provides a service to a lazy-loaded module?
-->
## 지연로딩 모듈에서 공유모듈에 있는 프로바이더를 사용하는 것은 안 좋은가요?

<!--
### The eagerly loaded scenario
When an eagerly loaded module provides a service, for example a `UserService`, that service is available application-wide. If the root module provides `UserService` and
imports another module that provides the same `UserService`, Angular registers one of
them in the root app injector (see [What if I import the same module twice?](guide/ngmodule-faq#q-reimport)).

Then, when some component injects `UserService`, Angular finds it in the app root injector,
and delivers the app-wide singleton service. No problem.
-->
### 즉시 로드되는 모듈의 경우

애플리케이션이 시작되면서 즉시 로드되는 모듈에서 제공하는 서비스, 예를 들어 `UserService`가 있다면 이 서비스는 애플리케이션 전역에 자유롭게 사용할 수 있습니다.
그리고 최상위 모듈에 `UserService`가 등록되어 있는데 다른 모듈에서 `UserService`가 한 번 더 등록한다고 해도 이 프로바이더는 중복 등록되지 않습니다. [모듈을 두 번 로드하면 어떻게 되나요?](guide/ngmodule-faq#q-reimport) 문단을 참고하세요.

그래서 어떤 컴포넌트가 `UserService`를 의존성으로 주입받는다고 할 때, Angular는 이 서비스의 프로바이더를 애플리케이션 최상위 인젝터에서 찾으며, 앱 전역에 사용하는 싱글턴 서비스 인스턴스를 주입합니다. 문제될 것은 전혀 없습니다.

<!--
### The lazy loaded scenario

Now consider a lazy loaded module that also provides a service called `UserService`.

When the router lazy loads a module, it creates a child injector and registers the `UserService`
provider with that child injector. The child injector is _not_ the root injector.

When Angular creates a lazy component for that module and injects `UserService`,
it finds a `UserService` provider in the lazy module's _child injector_
and creates a _new_ instance of the `UserService`.
This is an entirely different `UserService` instance
than the app-wide singleton version that Angular injected in one of the eagerly loaded components.

This scenario causes your app to create a new instance every time, instead of using the singleton.
-->
<!--KW--What does this cause? I wasn't able to get the suggestion of this to work from
the current FAQ:
To demonstrate, run the <live-example name="ngmodule">live example</live-example>.
Modify the `SharedModule` so that it provides the `UserService` rather than the `CoreModule`.
Then toggle between the "Contact" and "Heroes" links a few times.
The username goes bonkers as the Angular creates a new `UserService` instance each time.
I'd like to see the error so I can include it.-->

### 지연로딩되는 모듈의 경우

이번에는 지연로딩되는 모듈에서 `UserService`를 사용하는 경우를 생각해 봅시다.

라우터가 모듈을 지연로딩하면 이 모듈에 생성한 자식 인젝터에 `UserService` 프로바이더를 등록합니다. 이 때 생성되는 자식 인젝터는 애플리케이션 최상위 인젝터와는 _다릅니다_.

그리고 이 모듈에 있는 컴포넌트에서 `UserService`를 주입하려고 하면, 지연로딩된 모듈에 생성된 _자식 인젝터_ 에서 `UserService` 인스턴스를 찾고, 인스턴스가 없으면 새로운 인스턴스를 생성합니다.
하지만 이 인스턴스는 애플리케이션 전역에 만든 싱글턴 서비스의 인스턴스와는 다릅니다.

모듈이 지연로딩될 때마다 서비스의 인스턴스는 계속 생성되며, 애플리케이션 전역에 싱글턴으로 사용하기 위해 프로바이더를 등록했던 의도와는 달라집니다.


<hr/>

{@a q-why-child-injector}

<!--
## Why does lazy loading create a child injector?
-->
## 지연로딩되는 모듈은 왜 자식 인젝터를 만드나요?

<!--
Angular adds `@NgModule.providers` to the application root injector, unless the NgModule is lazy-loaded.
For a lazy-loaded NgModule, Angular creates a _child injector_ and adds the module's providers to the child injector.
-->
Angular는 즉시 로딩되는 모듈의 `@NgModule.providers`에 등록된 프로바이더를 애플리케이션 최상위 인젝터에 모두 등록합니다.
그리고 지연로딩 되는 모듈에는 _자식 인젝터_ 를 생성하며, 이 모듈에 등록된 프로바이더는 이 자식 인젝터에 등록합니다.

<!--
This means that an NgModule behaves differently depending on whether it's loaded during application start
or lazy-loaded later. Neglecting that difference can lead to [adverse consequences](guide/ngmodule-faq#q-why-bad).
-->
따라서 즉시 로딩되는 모듈과 지연로딩되는 모듈의 동작은 다릅니다. 자세한 설명은 [위에서 언급한 내용](guide/ngmodule-faq#q-why-bad)을 참고하세요.

<!--
Why doesn't Angular add lazy-loaded providers to the app root injector as it does for eagerly loaded NgModules?
-->
그러면 왜 지연로딩된 모듈에 등록된 프로바이더는 애플리케이션 최상위 인젝터에 등록되지 않을까요?

<!--
The answer is grounded in a fundamental characteristic of the Angular dependency-injection system.
An injector can add providers _until it's first used_.
Once an injector starts creating and delivering services, its provider list is frozen; no new providers are allowed.
-->
그 이유는 Angular 의존성 주입 방식 때문입니다.
인젝터는 _처음 사용되기 전에_ 프로바이더 목록을 준비합니다.
그리고 인젝터가 생성되고 프로바이더가 모두 준비되면 프로바이더 목록을 더이상 수정할 수 없으며, 새로운 프로바이더도 등록할 수 없습니다.

<!--
When an applications starts, Angular first configures the root injector with the providers of all eagerly loaded NgModules
_before_ creating its first component and injecting any of the provided services.
Once the application begins, the app root injector is closed to new providers.
-->
애플리케이션이 시작되면 Angular는 먼저 최상위 인젝터를 생성하면서 즉시 로딩되는 모듈에 있는 모든 프로바이더를 준비합니다. 그리고 이 준비가 모두 끝난 후에야 첫 컴포넌트를 생성하고 의존성을 주입합니다.
애플리케이션이 한 번 시작된 후에는 최상위 인젝터가 관리하는 프로바이더 목록이 변경되지 않으며, 새로운 프로바이더도 추가할 수 없습니다.

<!--
Time passes and application logic triggers lazy loading of an NgModule.
Angular must add the lazy-loaded module's providers to an injector somewhere.
It can't add them to the app root injector because that injector is closed to new providers.
So Angular creates a new child injector for the lazy-loaded module context.
-->
애플리케이션이 동작하다가 모듈을 지연로딩하는 경우를 생각해 봅시다.
그러면 지연로딩되는 모듈에 있는 프로바이더는 어딘가의 인젝터에 등록되어야 사용할 수 있습니다.
하지만 애플리케이션의 최상위 인젝터는 이미 닫혔고 새로운 프로바이더도 추가할 수 없기 때문에, 지연로딩된 모듈 컨텍스트에 새로운 자식 인젝터를 생성합니다.

<hr/>

{@a q-is-it-loaded}

<!--
## How can I tell if an NgModule or service was previously loaded?
-->
## 모듈이나 서비스가 로드되었는지 어떻게 확인하나요?

<!--
Some NgModules and their services should be loaded only once by the root `AppModule`.
Importing the module a second time by lazy loading a module could [produce errant behavior](guide/ngmodule-faq#q-why-bad)
that may be difficult to detect and diagnose.
-->
모듈과 서비스는 최상위 `AppModule`에 한 번은 로딩되어야 사용할 수 있습니다.
지연로딩되는 경우와 같이 모듈이 여러번 로딩되면 [비정상적인 동작](guide/ngmodule-faq#q-why-bad)을 할 수도 있지만, 이런 에러는 발견하기 힘들고 수정하기는 더 힘듭니다.

<!--
To prevent this issue, write a constructor that attempts to inject the module or service
from the root app injector. If the injection succeeds, the class has been loaded a second time.
You can throw an error or take other remedial action.
-->
이 문제를 피하기 위해 Angular에서는 생성자에서 의존성을 주입받으며, 이렇게 지정된 의존성 객체는 애플리케이션 최상위 인젝터가 인식합니다. 그리고 의존성 주입이 성공한 이후에 클래스가 로딩됩니다.
에러가 발생하면 생성자에서 에러를 확인하고 처리할 수 있습니다.

<!--
Certain NgModules, such as `BrowserModule`, implement such a guard.
Here is a custom constructor for an NgModule called `GreetingModule`.
-->
그리고 `BrowserModule`과 같은 모듈은 이 문제를 방지하는 로직을 따로 마련하기도 했습니다.
`BrowserModule`이 로드되기 전에 `GreetingModule`이 이미 로드되었다면, 이 모듈은 다음과 같은 로직으로 에러를 발생시킵니다.

<code-example path="ngmodules/src/app/greeting/greeting.module.ts" region="ctor" header="src/app/greeting/greeting.module.ts (Constructor)" linenums="false">
</code-example>

<hr/>

{@a q-entry-component-defined}

<!--
## What is an `entry component`?
-->
## 진입 컴포넌트(entry component)가 뭔가요?

<!--
An entry component is any component that Angular loads _imperatively_ by type.
-->
진입 컴포넌트는 Angular가 _직접_ 로드하는 컴포넌트입니다.

<!--
A component loaded _declaratively_ via its selector is _not_ an entry component.
-->
반대로 일반 컴포넌트는 템플릿에 셀렉터를 사용되었을 때 로드됩니다.

<!--
Angular loads a component declaratively when
using the component's selector to locate the element in the template.
Angular then creates the HTML representation of the component and inserts it into the DOM at the selected element. These aren't entry components.
-->
템플릿에 컴포넌트의 셀렉터가 사용되면 Angular가 컴포넌트를 로드합니다.
그리고 컴포넌트의 템플릿을 생성하고 DOM에 추가합니다.
이런 컴포넌트는 진입 컴포넌트가 아닙니다.

<!--
The bootstrapped root `AppComponent` is an _entry component_.
True, its selector matches an element tag in `index.html`.
But `index.html` isn't a component template and the `AppComponent`
selector doesn't match an element in any component template.
-->
애플리케이션이 부트스트랩될 때 로드되는 `AppComponent`는 _진입 컴포넌트_ 입니다.
사실 `index.html`에는 `AppComponent` 셀렉터가 지정되어 있긴 하지만, `index.html` 파일은 컴포넌트의 템플릿이 아니며, `AppComponent`의 셀렉터는 컴포넌트 템플릿 어디에도 사용되지 않습니다.

<!--
Components in route definitions are also _entry components_.
A route definition refers to a component by its _type_.
The router ignores a routed component's selector, if it even has one, and
loads the component dynamically into a `RouterOutlet`.
-->
라우팅 대상이 되는 컴포넌트도 _진입 컴포넌트_ 입니다.
라우팅 룰을 정의할 때 주소에 해당하는 컴포넌트를 지정하는데, 이렇게 사용되는 컴포넌트는 셀렉터가 지정되어 있다고 해도 무시되며, 지정된 주소로 이동할 때 `RouterOutlet`에 동적으로 로드됩니다.

<!--
For more information, see [Entry Components](guide/entry-components).
-->
좀 더 자세한 내용을 확인하려면 [진입 컴포넌트](guide/entry-components) 문서를 참고하세요.

<hr/>

<!--
## What's the difference between a _bootstrap_ component and an _entry component_?
-->
## _부트스트랩_ 컴포넌트와 _진입 컴포넌트_ 의 차이는 뭔가요?

<!--
A bootstrapped component _is_ an [entry component](guide/ngmodule-faq#q-entry-component-defined)
that Angular loads into the DOM during the bootstrap process (application launch).
Other entry components are loaded dynamically by other means, such as with the router.
-->
부트스트랩 컴포넌트는 Angular가 애플리케이션을 시작하면서 부트스트랩 단계에서 DOM에 추가하기 때문에 [진입 컴포넌트](guide/ngmodule-faq#q-entry-component-defined)의 하나라고 볼 수 있습니다.
일반적으로 진입 컴포넌트는 라우터에 의해 동적으로 로드되는 컴포넌트를 의미합니다.

<!--
The `@NgModule.bootstrap` property tells the compiler that this is an entry component _and_
it should generate code to bootstrap the application with this component.
-->
`@NgModule.bootstrap` 프로퍼티를 지정하면 어떤 컴포넌트가 부트스트랩 컴포넌트인지 컴파일러가 알도록 지정할 수 있으며, 이 컴포넌트는 애플리케이션이 부트스트랩될 때 같이 로드됩니다.

<!--
There's no need to list a component in both the `bootstrap` and `entryComponents` lists,
although doing so is harmless.
-->
하지만 컴포넌트를 `bootstrap` 배열과 `entryComponents` 배열에 동시에 추가할 필요는 없습니다. 이렇게 지정해도 문제가 발생하지는 않지만, 지정하는 의미도 없습니다.

<!--
For more information, see [Entry Components](guide/entry-components).
-->
좀 더 자세한 내용을 확인하려면 [진입 컴포넌트](guide/entry-components) 문서를 참고하세요.

<hr/>

<!--
## When do I add components to _entryComponents_?
-->
## 어떤 컴포넌트를 _entryComponents_ 에 등록해야 하나요?

<!--
Most application developers won't need to add components to the `entryComponents`.
-->
대부분의 경우에 `entryComponents` 배열을 직접 지정할 필요는 없습니다.

<!--
Angular adds certain components to _entry components_ automatically.
Components listed in `@NgModule.bootstrap` are added automatically.
Components referenced in router configuration are added automatically.
These two mechanisms account for almost all entry components.
-->
_진입 컴포넌트_ 로 지정할 필요가 있는 컴포넌트는 Angular가 자동으로 판단하고 진입 컴포넌트 목록에 추가합니다.
`@NgModule.bootstrap` 배열에 있는 컴포넌트도 마찬가지입니다.
라우팅 규칙에 정의된 컴포넌트들도 자동으로 진입 컴포넌트로 추가됩니다.
이 두 가지 경우라면 진입 컴포넌트로 지정되어야 할 컴포넌트를 모두 처리할 수 있습니다.

<!--
If your app happens to bootstrap or dynamically load a component _by type_ in some other manner,
you must add it to `entryComponents` explicitly.
-->
하지만 컴포넌트를 동적으로 로드하는 경우라면 `entryCompoennts`를 명시적으로 지정해야 합니다.

<!--
Although it's harmless to add components to this list,
it's best to add only the components that are truly _entry components_.
Don't include components that [are referenced](guide/ngmodule-faq#q-template-reference)
in the templates of other components.
-->
`entryComponents` 배열에 컴포넌트를 아무것이나 추가해도 별 문제는 없지만, 이 배열에는 진짜 _진입 컴포넌트_ 만 추가하는 것이 가장 좋습니다.
[템플릿에 셀렉터로 사용되는 컴포넌트](guide/ngmodule-faq#q-template-reference)라면 진입 컴포넌트로 지정하면 안됩니다.

<!--
For more information, see [Entry Components](guide/entry-components).
-->
좀 더 자세한 내용을 확인하려면 [진입 컴포넌트](guide/entry-components) 문서를 참고하세요.

<hr/>

<!--
## Why does Angular need _entryComponents_?
-->
## 진입 컴포넌트는 왜 필요하죠?

<!--
The reason is _tree shaking_. For production apps you want to load the smallest, fastest code possible. The code should contain only the classes that you actually need.
It should exclude a component that's never used, whether or not that component is declared.
-->
진입 컴포넌트는 _트리 셰이킹_ 때문에 필요합니다. 배포되는 앱 코드는 최대한 작고 빠르게 동작하는 것이 중요합니다. 그래서 배포되는 코드에도 실제로 사용되는 클래스만 포함되는 것이 좋으며, 사용되지 않는 컴포넌트는 최종 코드에서 빠지는 것이 좋습니다.

<!--
In fact, many libraries declare and export components you'll never use.
If you don't reference them, the tree shaker drops these components from the final code package.
-->
사실 라이브러리에서 제공하는 많은 코드 중에 실제로 사용되는 것은 많지 않습니다.
그래서 사용되지 않는 코드들은 트리 셰이킹 과정을 거치면 최종 코드에서 모두 제거됩니다.

<!--
If the [Angular compiler](guide/ngmodule-faq#q-angular-compiler) generated code for every declared component, it would defeat the purpose of the tree shaker.
-->
컴포넌트가 정의되었다고 해서 [Angular 컴파일러](guide/ngmodule-faq#q-angular-compiler)가 이 코드를 모두 생성하면, 이것은 트리 셰이킹의 목적과 어울리지 않습닌다.

<!--
Instead, the compiler adopts a recursive strategy that generates code only for the components you use.
-->
그래서 컴파일러는 실제로 사용하는 컴포넌트를 찾기 위해 재귀적으로 탐색하는 방식을 사용합니다.

<!--
The compiler starts with the entry components,
then it generates code for the declared components it [finds](guide/ngmodule-faq#q-template-reference) in an entry component's template,
then for the declared components it discovers in the templates of previously compiled components,
and so on. At the end of the process, the compiler has generated code for every entry component
and every component reachable from an entry component.
-->
실제로 사용하는 컴포넌트는 진입 컴포넌트를 기준으로 찾기 시작하며, 템플릿에 사용된 컴포넌트를 [찾으면](guide/ngmodule-faq#q-template-reference) 이 컴포넌트도 사용되는 것으로 판단합니다.
이 과정을 모두 마치고 나면, 최종 코드에는 진입 컴포넌트부터 시작해서 접근할 수 있는 모든 컴포넌트에 대한 코드만 생성됩니다.

<!--
If a component isn't an _entry component_ or wasn't found in a template,
the compiler omits it.
-->
컴포넌트가 _진입 컴포넌트_ 가 아니고, 템플릿에도 사용되지 않으면 이 컴포넌트는 컴파일러가 처리하지 않습니다.

<hr/>

<!--
## What kinds of modules should I have and how should I use them?
-->
## 모듈의 종류는 어떤 것이 있으며, 어떻게 사용해야 하나요?

<!--
Every app is different. Developers have various levels of experience and comfort with the available choices.
Some suggestions and guidelines appear to have wide appeal.
-->
앱은 모두 다릅니다. 앱을 개발하는 개발자의 경험도 모두 다르고, 정책을 정하는 기준도 다릅니다.
이 문단에서는 모듈에 대한 대략적인 가이드를 안내합니다.

### 공유 모듈 (`SharedModule`)
<!--
`SharedModule` is a conventional name for an `NgModule` with the components, directives, and pipes that you use
everywhere in your app. This module should consist entirely of `declarations`,
most of them exported.
-->
공유 모듈은 앱 전역에서 자유롭게 사용하는 컴포넌트와 디렉티브, 파이프를 정의하는 모듈을 의미합니다. 이 모듈은 `declarations` 구성이 가장 중요하며, 모듈에 정의된 Angular 구성요소 대부분을 모듈 외부로 공개합니다.

<!--
The `SharedModule` may re-export other widget modules, such as `CommonModule`,
`FormsModule`, and NgModules with the UI controls that you use most widely.
-->
이 모듈은 `CommonModule`이나 `FormsModule` 등 모듈의 UI 컨트롤에 필요한 다른 모듈을 가져와서 다시 모듈 외부로 공개하기도 합니다.

<!--
The `SharedModule` should not have `providers` for reasons [explained previously](guide/ngmodule-faq#q-why-bad).
Nor should any of its imported or re-exported modules have `providers`.
-->
그리고 이 모듈은 [위에서 설명한 이유](guide/ngmodule-faq#q-why-bad) 때문에 `providers`를 지정하지 않는 것이 좋습니다.
그리고 같은 이유로 다른 모듈에 있는 `providers`를 모듈 외부로 다시 공개하지 않는 것이 좋습니다.

<!--
Import the `SharedModule` in your _feature_ modules,
both those loaded when the app starts and those you lazy load later.
-->
공유 모듈은 기능 모듈이 로드해서 사용합니다. 이 때 기능 모듈은 앱이 실행되면서 즉시 로드되는 모듈이던지, 지연 로딩되는 모듈이던지 상관없습니다.


<!--
### Feature Modules
-->
### 기능 모듈 (Feature Modules)

<!--
Feature modules are modules you create around specific application business domains, user workflows, and utility collections. They support your app by containing a particular feature,
such as routes, services, widgets, etc. To conceptualize what a feature module might be in your
app, consider that if you would put the files related to a certain functionality, like a search,
in one folder, that the contents of that folder would be a feature module that you might call
your `SearchModule`. It would contain all of the components, routing, and templates that
would make up the search functionality.
-->
기능 모듈은 애플리케이션의 업무 로직과 관련된 모듈을 의미하며, 사용자의 동작 흐름이나 도메인에 필요한 기능을 담당합니다. 이 모듈은 라우팅이나 서비스, 위젯 등 애플리케이션에 필요한 기능을 제공합니다. 기능 모듈에 대한 개념을 확실하게 잡으려면 특정 기능을 담당하는 파일을 모두 모은 폴더를 생각하면 되는데, 예를 들어 검색 기능을 담당하는 폴더라면 이 모듈을 `SearchModule`이라고 생각할 수 있습니다. 검색 기능에 필요한 컴포넌트와 라우팅, 템플릿은 모두 이 폴더 안에 포함됩니다.

<!--
For more information, see [Feature Modules](guide/feature-modules) and
[Module Types](guide/module-types)
-->
좀 더 자세한 내용은 [기능 모듈](guide/feature-modules)과 [모듈의 종류](guide/module-types) 문서를 참고하세요.


<!--
## What's the difference between NgModules and JavaScript Modules?
-->
## NgModule과 JavaScript 모듈은 어떻게 다른가요?

<!--
In an Angular app, NgModules and JavaScript modules work together.
-->
Angular 앱에서는 NgModule과 JavaScript 모듈을 함께 사용합니다.

<!--
In modern JavaScript, every file is a module
(see the [Modules](http://exploringjs.com/es6/ch_modules.html) page of the Exploring ES6 website).
Within each file you write an `export` statement to make parts of the module public.
-->
ES6를 사용하는 최근 JavaScript는 각각의 파일을 모듈로 볼 수 있습니다. ([모듈](http://exploringjs.com/es6/ch_modules.html) 문서를 참고하세요.)
그리고 각각의 파일에서 `export` 키워드로 지정한 객체가 모듈 외부로 공개됩니다.

<!--
An Angular NgModule is a class with the `@NgModule` decorator&mdash;JavaScript modules
don't have to have the `@NgModule` decorator. Angular's `NgModule` has `imports` and `exports` and they serve a similar purpose.
-->
Angular의 모듈은 `@NgModule` 데코레이터가 지정된 JavaScript 클래스입니다. NgModule에서 모듈을 조합할 때는 JavaScript와 비슷하게 `imports` 프로퍼티와 `exports` 프로퍼티를 사용합니다.

<!--
You _import_ other NgModules so you can use their exported classes in component templates.
You _export_ this NgModule's classes so they can be imported and used by components of _other_ NgModules.
-->
NgModule을 로드하면 이 모듈이 모듈 외부로 공개한 클래스들을 컴포넌트 템플릿에 사용할 수 있습니다. 그리고 모듈에 정의된 클래스들은 다른 모듈에 사용할 수 있도록 모듈 외부로 공개할 수도 있습니다.

<!--
For more information, see [JavaScript Modules vs. NgModules](guide/ngmodule-vs-jsmodule).
-->
좀 더 자세한 내용은 [JavaScript 모듈 vs. NgModules](guide/ngmodule-vs-jsmodule) 문서를 참고하세요.

<hr/>

{@a q-template-reference}

<!--
## How does Angular find components, directives, and pipes in a template?<br>What is a <i><b>template reference</b></i>?
-->
## Angular는 템플릿에 사용된 컴포넌트나 디렉티브, 파이프를 어떻게 찾나요?

<!--
The [Angular compiler](guide/ngmodule-faq#q-angular-compiler) looks inside component templates
for other components, directives, and pipes. When it finds one, that's a template reference.
-->
[Angular 컴파일러](guide/ngmodule-faq#q-angular-compiler)는 컴포넌트 템플릿에 다른 컴포넌트나 디렉티브, 파이프가 사용된 것을 감지할 수 있습니다.

<!--
The Angular compiler finds a component or directive in a template when it can match the *selector* of that component or directive to some HTML in that template.
-->
템플릿에 사용된 컴포넌트나 디렉티브를 Angular 컴파일러가 확인하면, 이 컴포넌트가 어떤 컴포넌트인지 컴포넌트의 *셀렉터* 로 구분합니다.

<!--
The compiler finds a pipe if the pipe's *name* appears within the pipe syntax of the template HTML.
-->
그리고 템플릿에 사용된 파이프는 파이프의 *이름* 을 기준으로 구분합니다.

<!--
Angular only matches selectors and pipe names for classes that are declared by this module
or exported by a module that this module imports.
-->
이 때 적용되는 컴포넌트 셀렉터와 파이프 이름은 현재 모듈에 정의된 클래스이거나, 다른 모듈에서 가져온 클래스만 유효합니다.

<hr/>

{@a q-angular-compiler}

<!--
## What is the Angular compiler?
-->
## Angular 컴파일러가 뭔가요?

<!--
The Angular compiler converts the application code you write into highly performant JavaScript code.
The `@NgModule` metadata plays an important role in guiding the compilation process.
-->
Angular 컴파일러는 애플리케이션 코드를 JavaScript 코드로 변환하는 툴입니다.
그리고 이 컴파일 과정에는 `@NgModule` 메타데이터의 내용이 중요합니다.

<!--
The code you write isn't immediately executable. For example, components have templates that contain custom elements, attribute directives, Angular binding declarations,
and some peculiar syntax that clearly isn't native HTML.
-->
TypeScript로 작성한 Angular 코드는 그 자체로 실행할 수 없습니다. 컴포넌트를 생각해봐도 컴포넌트에는 커스텀 엘리먼트와 어트리뷰트 디렉티브, Angular 바인딩 문법 등 네이티브 HTML에는 없는 문법이 많이 사용됩니다.

<!--
The Angular compiler reads the template markup,
combines it with the corresponding component class code, and emits _component factories_.
-->
Angular 컴파일러는 이 템플릿을 읽고 관련된 컴포넌트를 연결하며 _컴포넌트 팩토리(component factories)_ 를 생성합니다.

<!--
A component factory creates a pure, 100% JavaScript representation
of the component that incorporates everything described in its `@Component` metadata:
the HTML, the binding instructions, the attached styles.
-->
컴포넌트 팩토리는 컴포넌트를 표현하는 100% JavaScript 코드를 생성하는데, 이 때 컴포넌트의 `@Component` 메타데이터에 지정하는 내용으로 HTML 템플릿과 바인딩 방식, 스타일을 연결합니다.

<!--
Because directives and pipes appear in component templates,
the Angular compiler incorporates them into compiled component code too.
-->
그리고 컴포넌트 템플릿에 사용된 디렉티브와 파이프도 Angular 컴파일러가 컴포넌트 코드에 연결합니다.

<!--
`@NgModule` metadata tells the Angular compiler what components to compile for this module and
how to link this module with other modules.
-->
Angular 컴파일러가 컴파일 할 컴포넌트를 지정하고, 이 모듈이 다른 모듈과 어떻게 연결되는지를 설정하는 것은 `@NgModule` 설정에 따라 달라집니다.
