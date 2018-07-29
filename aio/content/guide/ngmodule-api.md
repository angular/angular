# NgModule API

<!--
#### Prerequisites
-->
#### 사전지식

<!--
A basic understanding of the following concepts:
* [Bootstrapping](guide/bootstrapping).
* [JavaScript Modules vs. NgModules](guide/ngmodule-vs-jsmodule).
-->
다음 내용을 먼저 이해하고 이 문서를 보는 것이 좋습니다:
* [부트스트랩](guide/bootstrapping)
* [JavaScript 모듈 vs. NgModules](guide/ngmodule-vs-jsmodule)

<hr />

<!--
## Purpose of `@NgModule`
-->
## `@NgModule`의 목적

<!--
At a high level, NgModules are a way to organize Angular apps
and they accomplish this through the metadata in the `@NgModule`
decorator. The metadata falls
into three categories:
-->
NgModule을 사용하면 Angular 애플리케이션의 코드를 효율적으로 구성할 수 있으며, 이 때 `@NgModule` 데코레이터를 사용합니다. 이 데코레이터의 메타데이터는 세종류로 나눠 볼 수 있습니다:

<!--
* **Static:** Compiler configuration which tells the compiler about directive selectors and where in templates the directives should be applied through selector matching. This is configured via the `declarations` array.
* **Runtime:** Injector configuration via the `providers` array.
* **Composability/Grouping:** Bringing NgModules together and making them available via the `imports` and `exports` arrays.
-->
* **정적(static) 설정:** 컴파일러가 모듈을 빌드할 때 알아야 할 디렉티브를 등록합니다. `declarations` 배열이 해당됩니다.
* **런타임(runtime) 설정:** 모듈이 실행될 때 의존성을 주입해야 한다면, `providers` 배열로 인젝터를 설정합니다.
* **그룹화(grouping) 설정:** 다른 NgModule과 조합하기 위해 `imports`, `exports` 배열을 설정합니다.

<!--
```typescript
@NgModule({
  // Static, that is compiler configuration
  declarations: [], // Configure the selectors
  entryComponents: [], // Generate the host factory

  // Runtime, or injector configuration
  providers: [], // Runtime injector configuration

  // Composability / Grouping
  imports: [], // composing NgModules together
  exports: [] // making NgModules available to other parts of the app
})
```
-->
```typescript
@NgModule({
  // 정적 설정. 이 내용은 컴파일러와 관련된 내용입니다.
  declarations: [], // 셀렉터를 설정합니다.
  entryComponents: [], // 진입 컴포넌트를 지정합니다.

  // 런타임 설정, 인젝터 설정
  providers: [], // 모듈이 실행될때 사용하는 인젝터를 설정합니다.

  // 그룹화
  imports: [], // 이 모듈이 사용하는 외부 NgModule을 등록합니다.
  exports: [] // 모듈의 구성요소를 모듈 외부로 공개할 때 사용합니다.
})
```

<!--
## `@NgModule` metadata
-->
## `@NgModule` 메타데이터

<!--
The following table summarizes the `@NgModule` metadata properties.
-->
`@NgModule`에서 사용하는 메타데이터를 자세하게 알아봅시다.

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

    <td style="vertical-align: top">
      <code>declarations</code>
    </td>

    <td>

      <!--
      A list of [declarable](guide/ngmodule-faq#q-declarable) classes,
      (*components*, *directives*, and *pipes*) that _belong to this module_.

      <ol>
        <li>When compiling a template, you need to determine a set of selectors which should be used for triggering their corresponding directives.</li>
        <li>
          The template is compiled within the context of an NgModule&mdash;the NgModule within which the template's component is declared&mdash;which determines the set of selectors using the following rules:
          <ul>
            <li>All selectors of directives listed in `declarations`.</li>
            <li>All selectors of directives exported from imported NgModules.</li>
          </ul>
        </li>
      </ol>

      Components, directives, and pipes must belong to _exactly_ one module.
      The compiler emits an error if you try to declare the same class in more than one module.

      Don't re-declare a class imported from another module.
      -->
      _이 모듈에 포함되는_ [*컴포넌트*와 *디렉티브*, *파이프*](guide/ngmodule-faq#q-declarable)를 등록합니다.

      <ol>
        <li>템플릿을 컴파일하려면 이 템플릿에 사용된 셀렉터들을 모듈에 미리 등록해야 합니다.</li>
        <li>
          템플릿이 컴파일되는 컨텍스트는 NgModule 컨텍스트와 같습니다. 그래서 템플릿에 사용되는 컴포넌트는 모듈의 컨텍스트 안에 정의되어야 하며, 사용할 수 있는 컴포넌트의 범위는 다음과 같습니다:
          <ul>
            <li><code>declarations</code> 배열에 등록된 디렉티브의 셀렉터</li>
            <li><code>imports</code> 배열로 불러온 NgModule의 구성 요소 중 모듈 외부로 공개된 디렉티브의 셀렉터</li>
          </ul>
        </li>
      </ol>

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>providers</code>
    </td>

    <td>

      <!--
      A list of dependency-injection providers.

      Angular registers these providers with the NgModule's injector.
      If it is the NgModule used for bootstrapping then it is the root injector.

      These services become available for injection into any component, directive, pipe or service which is a child of this injector.

      A lazy-loaded module has its own injector which
      is typically a child of the application root injector.

      Lazy-loaded services are scoped to the lazy module's injector.
      If a lazy-loaded module also provides the `UserService`,
      any component created within that module's context (such as by router navigation)
      gets the local instance of the service, not the instance in the root application injector.

      Components in external modules continue to receive the instance provided by their injectors.

      For more information on injector hierarchy and scoping, see [Providers](guide/providers).
      -->
      의존성 주입에 사용되는 서비스 프로바이더를 등록합니다.

      이 목록에 지정된 프로바이더는 NgModule의 인젝터에 등록됩니다.
      그리고 이 모듈이 부트스트랩되는 모듈이라면 최상위 인젝터로 등록됩니다.

      그러면 이 프로바이더가 생성하는 서비스를 컴포넌트나 디렉티브, 파이프, 서비스에 의존성으로 주입해서 사용할 수 있습니다.

      지연로딩되는 서비스의 스코프는 지연로딩된 모듈의 인젝터 스코프와 같습니다.
      그래서 지연로딩된 모듈에 `UserService` 프로바이더가 등록되고 있고 이 모듈 안에 있는 컴포넌트가 `UserService`를 사용하면, 이 컴포넌트는 애플리케이션 최상위 인젝터가 생성한 서비스의 인스턴스 대신 모듈 안에서 생성된 인스턴스를 사용합니다.

      이 때 모듈 밖에 있는 컴포넌트는 여전히 애플리케이션 최상위 인젝터를 사용합니다.

      인젝터의 계층과 스코프에 대해 더 알아보려면 [프로바이더](guide/providers) 문서를 참고하세요.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>imports</code>
    </td>

    <td>

      <!--
      A list of modules which should be folded into this module. Folded means it is
      as if all the imported NgModule's exported properties were declared here.

      Specifically, it is as if the list of modules whose exported components, directives, or pipes
      are referenced by the component templates were declared in this module.

      A component template can [reference](guide/ngmodule-faq#q-template-reference) another component, directive, or pipe
      when the reference is declared in this module or if the imported module has exported it.
      For example, a component can use the `NgIf` and `NgFor` directives only if the
      module has imported the Angular `CommonModule` (perhaps indirectly by importing `BrowserModule`).

      You can import many standard directives from the `CommonModule`
      but some familiar directives belong to other modules.
      For example, you can use `[(ngModel)]` only
      after importing the Angular `FormsModule`.
      -->
      이 모듈 안에서 사용하는 외부 모듈을 등록합니다. 그러면 `imports`에 지정된 모듈의 내용이 이 모듈에 있는 것처럼 사용할 수 있습니다.

      좀 더 정확하게 이야기하면, 불러온 모듈에서 모듈 외부로 공개된 컴포넌트나 디렉티브, 파이프만 이 모듈의 컴포넌트 템플릿에 사용할 수 있습니다.

      컴포넌트 템플릿은 다른 컴포넌트나, 디렉티브, 파이프를 [사용](guide/ngmodule-faq#q-template-reference)할 수 있는데, 이 대상이 현재 모듈 안에 선언되어 있거나, 외부에서 불러온 모듈에서 모듈 외부로 공개한 항목이어야 사용할 수 있습니다.
      그래서 Angular의 기본 라이브러리 중 `CommonModule`이나 `BrowserModule`을 로드하는 모듈은 `NgIf`나 `NgFor` 디렉티브를 자유롭게 사용할 수 있습니다.

      `CommonModule`에서 제공하는 기본 디렉티브를 활용하는 것처럼 다른 모듈의 디렉티브도 같은 방식으로 활용할 수 있습니다.
      `FormsModule`을 로드한 후에 `[(ngModel)]`을 사용하는 것도 이와 마찬가지입니다.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>exports</code>
    </td>

    <td>

      <!--
      A list of declarations&mdash;*component*, *directive*, and *pipe* classes&mdash;that
      an importing module can use.

      Exported declarations are the module's _public API_.
      A component in another module can [use](guide/ngmodule-faq#q-template-reference) _this_
      module's `UserComponent` if it imports this module and this module exports `UserComponent`.

      Declarations are private by default.
      If this module does _not_ export `UserComponent`, then only the components within _this_
      module can use `UserComponent`.

      Importing a module does _not_ automatically re-export the imported module's imports.
      Module 'B' can't use `ngIf` just because it imported module 'A' which imported `CommonModule`.
      Module 'B' must import `CommonModule` itself.

      A module can list another module among its `exports`, in which case
      all of that module's public components, directives, and pipes are exported.

      [Re-export](guide/ngmodule-faq#q-reexport) makes module transitivity explicit.
      If Module 'A' re-exports `CommonModule` and Module 'B' imports Module 'A',
      Module 'B' components can use `ngIf` even though 'B' itself didn't import `CommonModule`.
      -->
      이 모듈을 로드하는 다른 모듈에서 사용할 수 있도록, 모듈의 *컴포넌트*나 *디렉티브*, *파이프*를 외부에 공개할 때 사용합니다.

      이렇게 모듈 외부로 공개되는 항목은 모듈의 _public API_ 라고 볼 수도 있습니다.
      만약 이 모듈에서 `UserComponent`를 모듈 밖으로 공개한다고 선언하면, 이 모듈을 로드하는 다른 모듈도 `UserComponent`를 [사용](guide/ngmodule-faq#q-template-reference)할 수 있습니다.

      모듈에 선언되는 컴포넌트나 디렉티브, 파이프는 기본적으로 private입니다.
      그래서 이 모듈이 `UserComponent`를 모듈 외부로 공개하지 않으면, 이 컴포넌트는 _이_ 모듈에서만 사용할 수 있습니다.

      모듈을 불러오는 것만으로는 이 모듈의 내용이 모듈 밖으로 연결되지 않습니다.
      그래서 모듈 A가 `CommonModule`을 로드하면 모듈 A는 `ngIf`를 사용할 수 있지만, 모듈 A를 로드하는 모듈 B는 `CommonModule`을 따로 로드하지 않는 한 `ngIf` 디렉티브를 사용할 수 없습니다.

      모듈의 구성요소를 [다시 외부로 공개(re-export)](guide/ngmodule-faq#q-reexport)하면 모듈을 중개하는 역할로 사용할 수도 있습니다.
      `CommonModule`을 로드하는 모듈 A가 `CommonModule`을 모듈 외부로 다시 공개하면, 모듈 B는 `CommonModule`을 다시 로드하지 않아도 `ngIf`와 같은 `CommonModule`의 디렉티브를 사용할 수 있습니다.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>bootstrap</code>
    </td>

    <td>

      <!--
      A list of components that are automatically bootstrapped.

      Usually there's only one component in this list, the _root component_ of the application.

      Angular can launch with multiple bootstrap components,
      each with its own location in the host web page.

      A bootstrap component is automatically added to `entryComponents`.
      -->
      자동으로 부트스트랩 될 컴포넌트를 지정합니다.

      보통 이 목록에는 컴포넌트 하나만 등록하며, 앱 모듈의 경우에는 애플리케이션의 _최상위 컴포넌트_ 를 여기에 등록합니다.

      호스트 웹 페이지가 여러 개의 컴포넌트로 구성되어 있다면, 부트스트랩되는 컴포넌트를 여러 개 지정할 수도 있습니다.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>entryComponents</code>
    </td>

    <td>

      <!--
      A list of components that can be dynamically loaded into the view.

      By default, an Angular app always has at least one entry component, the root component, `AppComponent`. Its purpose is to serve as a point of entry into the app, that is, you bootstrap it to launch the app.

      Routed components are also _entry components_ because they need to be loaded dynamically.
      The router creates them and drops them into the DOM near a `<router-outlet>`.

      While the bootstrapped and routed components are _entry components_,
      you don't have to add them to a module's `entryComponents` list,
      as they are added implicitly.

      Angular automatically adds components in the module's `bootstrap` and route definitions into the `entryComponents` list.

      That leaves only components bootstrapped using one of the imperative techniques, such as [`ViewComponentRef.createComponent()`](https://angular.io/api/core/ViewContainerRef#createComponent) as undiscoverable.

      Dynamic component loading is not common in most apps beyond the router. If you need to dynamically load components, you must add these components to the `entryComponents` list yourself.

      For more information, see [Entry Components](guide/entry-components).
      -->
      뷰에 동적으로 로드되는 컴포넌트의 목록을 지정합니다.

      보통 Angular 앱은 최상위 컴포넌트 `AppComponent` 하나만 진입 컴포넌트로 지정합니다. 이 컴포넌트는 앱 전체의 진입점으로 사용되며, 애플리케이션이 실행되면서 같이 부트스트랩됩니다.

      라우팅 대상이 되는 컴포넌트는 필요할 때 동적으로 로드되기 때문에 _진입 컴포넌트_ 라고 볼 수 있습니다.
      이 컴포넌트들은 라우터가 생성하고 `<router-outlet>` 근처 DOM에 추가됩니다.

      부트스트랩 대상 컴포넌트와 라우터 대상 컴포넌트는 _진입 컴포넌트_ 이기는 하지만 모듈 메타데이터 중 `entryComponents`에 이 컴포넌트를 다시 추가할 필요는 없습니다.

      모듈에서 부트스트랩 대상으로 지정되거나 라우팅 대상으로 지정된 컴포넌트는 해당 모듈의 `entryComponents` 목록에 자동으로 추가됩니다.

      그러면 이 프로퍼티에는 [`ViewComponentRef.createComponent()`](https://angular.io/api/core/ViewContainerRef#createComponent)와 같이 동적으로 생성되기 때문에 Angular가 자동으로 찾을 수 없는 컴포넌트만 남게 됩니다.

      컴포넌트를 동적로딩하는 것은 특수한 경우이며, 이렇게 동적로딩된 컴포넌트는 `entryComponents` 목록에 직접 추가해야 합니다.

      좀 더 자세한 내용은 [진입 컴포넌트](guide/entry-components) 문서를 참고하세요.
    </td>

  </tr>

</table>


<hr />

<!--
## More on NgModules
-->
## NgModule 더 알아보기

<!--
You may also be interested in the following:
* [Feature Modules](guide/feature-modules).
* [Entry Components](guide/entry-components).
* [Providers](guide/providers).
* [Types of Feature Modules](guide/module-types).
-->
다음 내용에 대해서도 확인해 보세요:
* [기능 모듈](guide/feature-modules)
* [진입 컴포넌트](guide/entry-components)
* [프로바이더](guide/providers)
* [기능 모듈의 종류](guide/module-types)