<!--
# Entry Components
-->
# 진입 컴포넌트

<!--
#### Prerequisites:
-->
#### 사전 지식

<!--
A basic understanding of the following concepts:
* [Bootstrapping](guide/bootstrapping).
-->
다음 내용을 먼저 이해하고 이 문서를 보는 것이 좋습니다:
* [부트스트랩](guide/bootstrapping)

<hr />

<!--
An entry component is any component that Angular loads imperatively, (which means you’re not referencing it in the template), by type. You specify an entry component by bootstrapping it in an NgModule, or including it in a routing definition.
-->
진입 컴포넌트는 Angular가 로드하도록 명시적으로 지정하는 컴포넌트를 의미합니다. 진입 컴포넌트는 NgModule가 시작되하거나 라우팅되면서 접속 주소가 변경될 때 사용됩니다.

<div class="alert is-helpful">

<!--
To contrast the two types of components, there are components which are included in the template, which are declarative.  Additionally, there are  components which you load imperatively; that is, entry components.
-->
컴포넌트는 용도에 따라 두 종류로 구분할 수 있습니다. 하나는 템플릿에서 셀렉터로 사용하는 컴포넌트이며, 다른 하나는 모듈에서 명시적으로 지정하는 진입 컴포넌트입니다.

</div>

<!--
There are two main kinds of entry components:

* The bootstrapped root component.
* A component you specify in a route definition.
-->
진입 컴포넌트는 두 가지 방식으로 사용됩니다:

* 부트스트랩되는 컴포넌트로 사용되는 경우
* 라우팅 대상 컴포넌트로 사용되는 경우

<!--
## A bootstrapped entry component
-->
## 부트스트랩되는 컴포넌트로 사용되는 경우

<!--
The following is an example of specifying a bootstrapped component,
`AppComponent`, in a basic `app.module.ts`:
-->
다음 예제는 `app.module.ts` 기본 설정에서 `AppComponent`를 부트스트랩하는 예제 코드입니다:

<!--
```typescript
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent] // bootstrapped entry component
})
```
-->
```typescript
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent] // 진입 컴포넌트 지정
})
```

<!--
A bootstrapped component is an entry component
that Angular loads into the DOM during the bootstrap process (application launch).
Other entry components are loaded dynamically by other means, such as with the router.
-->
Angular 애플리케이션이 실행되면서 DOM에 부트스트랩되는 컴포넌트도 진입 컴포넌트입니다.
이 경우를 제외하면 진입 컴포넌트는 모두 라우터에 의해 동적으로 로딩됩니다.

<!--
Angular loads a root `AppComponent` dynamically because it's listed by type in `@NgModule.bootstrap`.
-->
Angular는 최상위 `AppComponent`를 동적으로 로드한다고도 볼 수 있습니다. 이 컴포넌트는 `@NgModule.bootstrap`에서 로드하도록 지정합니다.

<div class="alert is-helpful">

<!--
A component can also be bootstrapped imperatively in the module's `ngDoBootstrap()` method.
The `@NgModule.bootstrap` property tells the compiler that this is an entry component and
it should generate code to bootstrap the application with this component.
-->
컴포넌트는 모듈에서 제공하는 `ngDoBootstrap()` 메소드를 사용하면 명시적으로 부트스트랩할 수도 있습니다. `@NgModule.bootstrap` 프로퍼티는 이 프로퍼티에 지정하는 컴포넌트가 진입 컴포넌트이며, 애플리케이션이 시작될 때 이 컴포넌트를 부트스트랩하도록 지정하는 용도로 사용합니다.

</div>

<!--
A bootstrapped component is necessarily an entry component because bootstrapping is an imperative process, thus it needs to have an entry component.
-->
부트스트랩되는 컴포넌트로 사용되는 경우에는 꼭 진입 컴포넌트로 지정되어야 애플리케이션을 정상적으로 실행할 수 있습니다.

<!--
## A routed entry component
-->
## 라우팅 대상 컴포넌트로 사용되는 경우

<!--
The second kind of entry component occurs in a route definition like
this:
-->
진입 컴포넌트는 다음 코드처럼 라우터에 의해서 사용될 수도 있습니다:

```typescript
const routes: Routes = [
  {
    path: '',
    component: CustomerListComponent
  }
];
```

<!--
A route definition refers to a component by its type with `component: CustomerListComponent`.
-->
라우터에서는 라우팅될 주소에 `component: CustomerListComponent`와 같은 방식으로 컴포넌트를 지정합니다.

<!--
All router components must be entry components. Because this would require you to add the component in two places (router and `entryComponents`) the Compiler is smart enough to recognize that this is a router definition and automatically add the router component into `entryComponents`.
-->
라우팅 대상 컴포넌트는 모두 진입 컴포넌트입니다. 정석대로라면 이 컴포넌트는 라우터와 `entryComponents` 두 곳에 모두 등록되어야 하지만, Angular 컴파일러는 라우팅 대상으로 등록된 컴포넌트를 `entryComponents`에 자동으로 등록하기 때문에 `entryComponents`쪽에서는 생략할 수 있습니다.

<!--
## The `entryComponents` array
-->
## `entryComponents` 배열

<!--
Though the `@NgModule` decorator has an `entryComponents` array, most of the time
you won't have to explicitly set any entry components because Angular adds components listed in `@NgModule.bootstrap` and those in route definitions to entry components automatically. Though these two mechanisms account for most entry components, if your app happens to bootstrap or dynamically load a component by type imperatively,
you must add it to `entryComponents` explicitly.
-->
`@NgModule` 데코레이터에는 `entryComponents` 배열이 있지만, 이 배열을 직접 수정하는 경우는 많지 않습니다. 왜냐하면 Angular는 `@NgModule.bootstrap`에 지정된 컴포넌트를 자동으로 인식하고 진입 컴포넌트로 등록하기 때문입니다.
대부분의 경우라면 이대로 활용해도 좋지만, 모듈을 동적으로 로딩하는 경우라면 `entryComponents` 배열을 명시적으로 지정해야 합니다.

<!--
### `entryComponents` and the compiler
-->
### `entryComponents` 배열과 컴파일러의 동작

<!--
For production apps you want to load the smallest code possible.
The code should contain only the classes that you actually need and
exclude components that are never used. For this reason, the Angular compiler only generates code for components which are reachable from the `entryComponents`; This means that adding more references to `@NgModule.declarations` does not imply that they will necessarily be included in the final bundle.
-->
애플리케이션을 배포해야 한다면 코드의 크기를 최대한 작게 만드는 것이 중요합니다. 좀 더 자세하게 이야기하면, 최종 코드에는 실제로 사용하는 클래스들만 모아두고, 사용하지 않는 컴포넌트는 모두 제거하는 것이 좋습니다.
Angular 컴파일러는 `entryComponents`에 명시된 컴포넌트부터 참조하면서 실제 사용하는 코드를 인식하고 최종 코드에 추가합니다. `@NgModule.declarations`에 아무리 많은 컴포넌트가 등록되어 있다고 해도 이 컴포넌트들이 최종 코드에 반드시 포함된다는 것을 의미하지는 않습니다.

<!--
In fact, many libraries declare and export components you'll never use.
For example, a material design library will export all components because it doesn’t know which ones you will use. However, it is unlikely that you will use them all.
For the ones you don't reference, the tree shaker drops these components from the final code package.
-->
실제로 라이브러리에 정의된 컴포넌트들이 모두 사용되는 것은 아닙니다.
예를 들면, 매터리얼 디자인 라이브러리가 제공하는 모든 컴포넌트들이 애플리케이션에 모두 사용되는 것은 아닙니다. 하지만 라이브러리의 입장에서는 어떤 컴포넌트를 사용할지 알 수 없기 때문에 모든 컴포넌트를 제공할 수밖에 없습니다.
라이브러리에서 사용하지 않는 컴포넌트는 트리 셰이킹 과정을 거치면서 최종 코드에 포함되지 않습니다.

<!--
If a component isn't an _entry component_ and isn't found in a template,
the tree shaker will throw it away. So, it's best to add only the components that are truly entry components to help keep your app
as trim as possible.
-->
컴포넌트가 _진입 컴포넌트_ 로 진입되지 않았고, 템플릿에서도 사용되지 않았다면 트리 셰이킹되면서 이 컴포넌트는 최종 코드에 포함되지 않습니다. 그래서 `entryComponents` 배열에는 정말 진입 컴포넌트로 사용하는 컴포넌트만 등록하는 것이 좋습니다.

<hr />

<!--
## More on Angular modules
-->
## Angular 모듈에 대해 더 알아보기

<!--
You may also be interested in the following:
* [Types of NgModules](guide/module-types)
* [Lazy Loading Modules with the Angular Router](guide/lazy-loading-ngmodules).
* [Providers](guide/providers).
* [NgModules FAQ](guide/ngmodule-faq).
-->
다음 내용에 대해 더 알아보세요:
* [NgModule의 종류](guide/module-types)
* [Angular 라우터로 모듈을 지연 로딩하는 방법](guide/lazy-loading-ngmodules)
* [프로바이더](guide/providers)
* [NgModules FAQ](guide/ngmodule-faq)
