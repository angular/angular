
<!--
# Types of Feature Modules
-->
# 기능 모듈의 종류

<!--
#### Prerequisites
-->
#### 사전지식

<!--
A basic understanding of the following concepts:
* [Feature Modules](guide/feature-modules).
* [JavaScript Modules vs. NgModules](guide/ngmodule-vs-jsmodule).
* [Frequently Used Modules](guide/frequent-ngmodules).
-->
다음 내용을 먼저 이해하고 이 문서를 보는 것이 좋습니다:
* [기능 모듈](guide/feature-modules).
* [JavaScript 모듈 vs. NgModules](guide/ngmodule-vs-jsmodule).
* [자주 사용하는 NgModule](guide/frequent-ngmodules).

<hr>

<!--
There are five general categories of feature modules which
tend to fall into the following groups:
-->
일반적으로 기능 모듈은 다음 5가지 종류로 구분할 수 있습니다:

<!--
* Domain feature modules.
* Routed feature modules.
* Routing modules.
* Service feature modules.
* Widget feature modules.
-->
* 도메인 모듈 (Domain feature modules)
* 라우팅 대상 모듈 (Routed feature modules)
* 라우팅 모듈 (Routing modules)
* 서비스 모듈 (Service feature modules)
* 위젯 모듈 (Widget feature modules)

<!--
While the following guidelines describe the use of each type and their
typical characteristics, in real world apps, you may see hybrids.
-->
이 분류가 어떤 기준으로 나뉘어 지는지, 각각은 어떤 역할을 하며, 실제 애플리케이션에서는 어떻게 활용되는지 자세하게 알아봅시다.

<table>

 <tr>
   <th style="vertical-align: top;width:16%;">
     <!--
     Feature Module
     -->
     기능 모듈
   </th>

   <th style="vertical-align: top">
     <!--
     Guidelines
     -->
     설명
   </th>
 </tr>

 <tr>
   <!--
   <td>Domain</td>
   -->
   <td>도메인 모듈</td>
   <td>
     <!--
     Domain feature modules deliver a user experience dedicated to a particular application domain like editing a customer or placing an order.

     They typically have a top component that acts as the feature root and private, supporting sub-components descend from it.

     Domain feature modules consist mostly of declarations. Only the top component is exported.

     Domain feature modules rarely have providers. When they do, the lifetime of the provided services should be the same as the lifetime of the module.

     Domain feature modules are typically imported exactly once by a larger feature module.

     They might be imported by the root `AppModule` of a small application that lacks routing.
     -->
     도메인 기능 모듈은 애플리케이션을 사용하는 사용자에게 필요한 기능을 제공하는 모듈입니다. 고객 정보를 수정하거나 상품을 주문하는 것이 이런 기능에 해당됩니다.

     이 모듈은 보통 최상위 private 컴포넌트 하나로 시작해서 복잡한 자식 컴포넌트들로 구성됩니다.

     그리고 도메인 기능 모듈에는 모듈에 포함된다고 등록하는 컴포넌트나 디렉티브, 파이프가 가장 많으며, 이 중 최상위 컴포넌트만 모듈 외부로 공개하는 방식으로 사용됩니다.

     도메인 기능 모듈에는 프로바이더를 거의 지정하지 않습니다. 만약 이 모듈에 프로바이더가 지정되면, 이 프로바이더를 사용해서 만든 서비스는 모듈이 종료되면서 함께 종료됩니다.

     도메인 기능 모듈은 좀 더 큰 기능 모듈에 로드되기도 합니다.

     개발하는 애플리케이션의 규모가 작다면, 도메인 기능 모듈은 라우팅 없이 최상위 `AppModule`에 직접 로드되기도 합니다.
   </td>
 </tr>
 <tr>
   <!--
   <td>Routed</td>
   -->
   <td>라우팅 대상 모듈</td>
   <td>
     <!--
     Routed feature modules are domain feature modules whose top components are the targets of router navigation routes.

     All lazy-loaded modules are routed feature modules by definition.

     Routed feature modules don’t export anything because their components never appear in the template of an external component.

     A lazy-loaded routed feature module should not be imported by any module. Doing so would trigger an eager load, defeating the purpose of lazy loading.That means you won’t see them mentioned among the `AppModule` imports. An eager loaded routed feature module must be imported by another module so that the compiler learns about its components.

     Routed feature modules rarely have providers for reasons explained in [Lazy Loading Feature Modules](/guide/lazy-loading-ngmodules). When they do, the lifetime of the provided services should be the same as the lifetime of the module. Don't provide application-wide singleton services in a routed feature module or in a module that the routed module imports.
     -->
     모듈의 최상위 컴포넌트가 라우터 네비게이션의 대상인 모듈이며, 도메인 기능 모듈에 해당한다고 볼 수도 있습니다.

     지연 로딩되는 모듈은 모두 이 분류에 해당됩니다.

     이 모듈에 포함되는 컴포넌트는 외부 컴포넌트의 템플릿에 사용되는 경우가 절대 없기 때문에, 이 모듈은 아무것도 모듈 외부로 공개하지 않습니다.

     이 모듈이 지연 로딩된다면 다른 모듈에서는 이 모듈을 로드하는 일이 없어야 합니다. 왜냐하면 다른 모듈에서 이 모듈을 로드하면 그 모듈이 로드될 때 이 모듈도 즉시 로드 되면서, 지연 로딩 모듈로 지정한 의미가 없어지기 때문입니다. 따라서 이 모듈은 지연 로딩되지 않을 때만 `AppModule`이나 다른 모듈의 `imports` 배열에 지정되어야 합니다. 

     [지연 로딩되는 기능 모듈](/guide/lazy-loading-ngmodules)에서 설명하는 이유 때문에, 라우팅 대상 모듈에는 서비스 프로바이더를 지정하는 경우가 가끔 있습니다. 이렇게 되면 이 프로바이더로 생성하는 서비스의 생명주기는 모듈의 생명주기와 동일합니다. 따라서 애플리케이션 전역에 사용되는 싱글턴 서비스는 라우팅 대상 모듈에 추가되면 안됩니다.
   </td>
 </tr>

 <tr>
   <!--
   <td>Routing</td>
   -->
   <td>라우팅 모듈</td>
   <td>

     <!--
     A routing module provides routing configuration for another module and separates routing concerns from its companion module.

     A routing module typically does the following:

     <ul>
     <li>Defines routes.</li>
     <li>Adds router configuration to the module's imports.</li>
     <li>Adds guard and resolver service providers to the module's providers.</li>
     <li>The name of the routing module should parallel the name of its companion module, using the suffix "Routing". For example, <code>FooModule</code> in <code>foo.module.ts</code> has a routing module named <code>FooRoutingModule</code> in <code>foo-routing.module.ts</code>. If the companion module is the root <code>AppModule</code>, the <code>AppRoutingModule</code> adds router configuration to its imports with <code>RouterModule.forRoot(routes)</code>. All other routing modules are children that import <code>RouterModule.forChild(routes)</code>.</li>
     <li>A routing module re-exports the <code>RouterModule</code> as a convenience so that components of the companion module have access to router directives such as <code>RouterLink</code> and <code>RouterOutlet</code>.</li>
     <li>A routing module does not have its own declarations. Components, directives, and pipes are the responsibility of the feature module, not the routing module.</li>
     </ul>

     A routing module should only be imported by its companion module.
     -->
     라우팅 모듈은 모듈끼리 연결할 때 필요한 라우터 설정을 따로 모아서 라우터 설정 기능만 한번에 제공하는 모듈입니다.

     라우팅 모듈은 다음과 같은 역할을 합니다:
     <ul>
     <li>라우팅 규칙을 정의합니다.</li>
     <li>라우팅 규칙을 모듈에 로드합니다.</li>
     <li>라우팅 가드(guard)나 라우팅 리졸버(resolver)를 서비스 프로바이더 목록에 등록합니다.</li>
     <li>라우팅 모듈의 이름은 관련 모듈 이름 뒤에 "Routing" 접미사를 붙이는 것이 좋습니다. 예를 들면,  <code>FooModule</code>이 <code>foo.module.ts</code> 파일에 정의되어 있다면, 라우팅 모듈은 <code>foo-routing.module.ts</code> 파일에 <code>FooRoutingModule</code>이라고 선언하는 방식입니다. 이때 라우팅하는 모듈이 <code>AppModule</code>이라면, 라우팅 모듈의 이름은 <code>AppRoutingModule</code>라고 하고 <code>RouterModule.forRoot(routes)</code>에 라우팅 규칙을 등록하면 됩니다. 앱모듈이 아닌 라우팅 모듈에서는 <code>RouterModule.forChild(routes)</code>를 대신 사용합니다.</li>
     <li>라우팅 모듈은 <code>RouterModule</code>을 모듈 외부로 공개하는데, 이렇게 하면 관련 모듈의 컴포넌트에서 <code>RouterLink</code>나 <code>RouterOutlet</code>와 같은 라우터 디렉티브를 자유롭게 사용할 수 있습니다.</li>
     <li>라우팅 모듈에는 이 모듈에 포함되는 컴포넌트나 디렉티브, 파이프를 등록하지 않습니다. 이 구성요소들은 기능 모듈의 역할에 해당되며, 라우팅 모듈과는 관련이 없습니다.</li>
     </ul>

     라우팅 모듈은 라우팅하는 담당하는 모듈에만 로드되어야 합니다.

   </td>
 </tr>

 <tr>
   <!--
   <td>Service</td>
   -->
   <td>서비스 모듈</td>
   <td>

     <!--
     Service modules provide utility services such as data access and messaging. Ideally, they consist entirely of providers and have no declarations. Angular's `HttpClientModule` is a good example of a service module.

     The root `AppModule` is the only module that should import service modules.
     -->
     서비스 모듈은 서버에 데이터를 요청하거나 메시지를 보내는 등의 유틸리티 기능을 제공하는 모듈입니다. 그리고 이 모듈은 컴포넌트나 디렉티브, 파이프 없이 서비스에 대한 프라바이더만 등록되어 있는 것이 이상적입니다. Angular 기본 모듈 중 `HttpClientModule`이 서비스 모듈에 해당됩니다.

     서비스 모듈은 최상위 `AppModule`에만 로드되어야 합니다.

   </td>
 </tr>

 <tr>
   <!--
   <td>Widget</td>
   -->
   <td>위젯 모듈</td>
   <td>

     <!--
     A widget module makes components, directives, and pipes available to external modules. Many third-party UI component libraries are widget modules.

     A widget module should consist entirely of declarations, most of them exported.

     A widget module should rarely have providers.

     Import widget modules in any module whose component templates need the widgets.
     -->
     위젯 모듈은 다른 모듈에서 사용하는 컴포넌트, 디렉티브, 파이프로 구성됩니다.
     대다수의 서드파티 UI 컴포넌트 라이브러리도 위젯 모듈이라고 볼 수 있습니다.

     위젯 모듈은 대부분 컴포넌트나 디렉티브, 파이프를 등록하는 것으로 구성되며, 이렇게 등록된 구성요소는 대부분 모듈 외부로 공개됩니다.

     위젯 모듈에 서비스 프로바이더를 지정하는 경우는 거의 없습니다.

     위젯 모듈은 이 모듈의 구성요소를 사용하려는 모듈 어디에라도 로드해서 사용할 수 있습니다.

   </td>
 </tr>

</table>

<!--
The following table summarizes the key characteristics of each feature module group.
-->
각 기능 모듈의 특징을 요약해보면 다음과 같이 정리할 수 있습니다.

<table>
 <tr>
   <th style="vertical-align: top">
     <!--
     Feature Module
     -->
     기능 모듈
   </th>

   <th style="vertical-align: top">
     <!--
     Declarations
     -->
     컴포넌트, 디렉티브, 파이프 등록
   </th>

   <th style="vertical-align: top">
     <!--
     Providers
     -->
     프로바이더 등록
   </th>

   <th style="vertical-align: top">
     <!--
     Exports
     -->
     모듈 외부로 공개하는 요소
   </th>

   <th style="vertical-align: top">
     <!--
     Imported by
     -->
     사용하는 모듈
   </th>
 </tr>

 <tr>
   <!--
   <td>Domain</td>
   <td>Yes</td>
   <td>Rare</td>
   <td>Top component</td>
   <td>Feature, AppModule</td>
   -->
   <td>도메인 모듈</td>
   <td>O</td>
   <td>거의 없음</td>
   <td>최상위 컴포넌트</td>
   <td>앱 모듈, 기능 모듈</td>
 </tr>

 <tr>
   <!--
   <td>Routed</td>
   <td>Yes</td>
   <td>Rare</td>
   <td>No</td>
   <td>None</td>
   -->
   <td>라우팅 대상 모듈</td>
   <td>O</td>
   <td>거의 없음</td>
   <td>X</td>
   <td>X</td>
 </tr>

 <tr>
   <!--
   <td>Routing</td>
   <td>No</td>
   <td>Yes (Guards)</td>
   <td>RouterModule</td>
   <td>Feature (for routing)</td>
   -->
   <td>라우팅 모듈</td>
   <td>X</td>
   <td>O (라우터 가드)</td>
   <td>라우터 모듈 자체</td>
   <td>기능 모듈 (라우팅하는 모듈)</td>
 </tr>

 <tr>
   <!--
   <td>Service</td>
   <td>No</td>
   <td>Yes</td>
   <td>No</td>
   <td>AppModule</td>
   -->
   <td>서비스 모듈</td>
   <td>X</td>
   <td>O</td>
   <td>X</td>
   <td>앱 모듈</td>
 </tr>

 <tr>
   <!--
   <td>Widget</td>
   <td>Yes</td>
   <td>Rare</td>
   <td>Yes</td>
   <td>Feature</td>
   -->
   <td>위젯 모듈</td>
   <td>O</td>
   <td>거의 없음</td>
   <td>O</td>
   <td>기능 모듈</td>
 </tr>
</table>

<hr />

<!--
## More on NgModules
-->
## NgModule 더 알아보기

<!--
You may also be interested in the following:
* [Lazy Loading Modules with the Angular Router](guide/lazy-loading-ngmodules).
* [Providers](guide/providers).
-->
다음 내용을 더 확인해 보세요:
* [Angular 라우터로 모듈 지연로딩하기](guide/lazy-loading-ngmodules).
* [프로바이더](guide/providers).
