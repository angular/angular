<!--
# AngularJS to Angular concepts: Quick reference
-->
# AngularJS와 Angular 컨셉 비교


{@a top}


<!--
_Angular_ is the name for the Angular of today and tomorrow.
_AngularJS_ is the name for all v1.x versions of Angular.

This guide helps you transition from AngularJS to Angular
by mapping AngularJS syntax to the equivalent Angular syntax.


**See the Angular syntax in this <live-example name="ajs-quick-reference"></live-example>**.
-->
<div class="alert is-helpful">

Angular 프로젝트의 정식 명칭은 _Angular_ 입니다.

_AngularJS_ 는 Angular 1.x 버전을 의미하는 이름입니다.

</div>

이 문서는 AngularJS 앱을 Angular로 바꿀 때 각 프레임워크의 구성요소가 어떤 관계인지 설명합니다.


**Angular 문법을 테스트해보려면 <live-example name="ajs-quick-reference"></live-example>를 활용해 보세요.**


<!--
## Template basics
-->
## 템플릿

<!--
Templates are the user-facing part of an Angular application and are written in HTML.
The following table lists some of the key AngularJS template features with their equivalent Angular template syntax.
-->
템플릿은 Angular 애플리케이션에서 사용자가 눈으로 확인할 수 있는 부분이며 보통 HTML로 작성합니다.
아래 표를 보면서 AngularJS 템플릿에 활용하는 기능과 Angular 템플릿에 활용하는 기능의 관계에 대해 확인해 보세요.


<table width="100%">

  <col width="50%">

  </col>

  <col width="50%">

  </col>

  <tr>

    <th>
      AngularJS
    </th>

    <th>
      Angular
    </th>

  </tr>

  <tr style=top>

    <td>


      <!--
      ### Bindings/interpolation

      <code-example hideCopy>
        Your favorite hero is: {{vm.favoriteHero}}
      </code-example>


      In AngularJS, an expression in curly braces denotes one-way binding.
      This binds the value of the element to a property in the controller
      associated with this template.

      When using the `controller as` syntax,
      the binding is prefixed with the controller alias (`vm` or `$ctrl`) because you
      have to be specific about the source of the binding.
      -->
      ### 바인딩/문자열 바인딩

      <code-example hideCopy>
        Your favorite hero is: {{vm.favoriteHero}}
      </code-example>

      AngularJS에서 이중 중괄호 안에 표현식을 작성하는 문법은 단방향 바인딩을 의미합니다.
      그리고 이 바인딩은 컨트롤러 프로퍼티 값을 템플릿 엘리먼트로 연결하는 방향입니다.

      바인딩하는 대상을 정확하게 지정하려면 `vm`이나 `$ctrl`과 같이 컨트롤러를 명시해야 합니다.

    </td>

    <td>


      <!--
      ### Bindings/interpolation

      <code-example hideCopy path="ajs-quick-reference/src/app/movie-list.component.html" region="interpolation"></code-example>


      In Angular, a template expression in curly braces still denotes one-way binding.
      This binds the value of the element to a property of the component.
      The context of the binding is implied and is always the
      associated component, so it needs no reference variable.

      For more information, see the [Interpolation](guide/template-syntax#interpolation)
      section of the [Template Syntax](guide/template-syntax) page.
      -->
      ### 바인딩/문자열 바인딩

      <code-example hideCopy path="ajs-quick-reference/src/app/movie-list.component.html" region="interpolation"></code-example>

      Angular에서도 이중 중괄호 안에 템플릿 표현식을 사용하는 문법은 단방향 바인딩을 의미합니다.
      그리고 이 바인딩은 컴포넌트 프로퍼티 값을 템플릿 엘리먼트로 연결하는 방향입니다.
      바인딩할 수 있는 컨텍스트는 언제나 컴포넌트와 관련되어 있으며 컴포넌트 자체를 따로 지정할 필요는 없습니다.

      자세한 내용은 [템플릿 문법](guide/template-syntax) 문서의 [문자열 바인딩](guide/template-syntax#interpolation) 섹션을 참고하세요.
    </td>

  </tr>

  <tr style=top>

    <td>

      <!--
      ### Filters

      <code-example hideCopy>
        &lt;td>{{movie.title | uppercase}}&lt;/td>
      </code-example>


      To filter output in AngularJS templates, use the pipe character (|) and one or more filters.

      This example filters the `title` property to uppercase.
      -->
      ### 필터(Filters)

      <code-example hideCopy>
        &lt;td>{{movie.title | uppercase}}&lt;/td>
      </code-example>

      AngularJS 템플릿에 필터를 사용하려면 파이프 문자(|)를 사용하면 됩니다.

      위 예제에 사용한 필터는 `title` 문자열을 대문자로 변환하는 필터입니다.

    </td>

    <td>


      <!--
      ### Pipes

      <code-example hideCopy path="ajs-quick-reference/src/app/app.component.html" region="uppercase"></code-example>


      In Angular you use similar syntax with the pipe (|) character to filter output, but now you call them **pipes**.
      Many (but not all) of the built-in filters from AngularJS are
      built-in pipes in Angular.

      For more information, see [Filters/pipes](guide/ajs-quick-reference#filters-pipes) below.
      -->
      ### 파이프(Pipes)

      <code-example hideCopy path="ajs-quick-reference/src/app/app.component.html" region="uppercase"></code-example>

      Angular에도 파이프 문자(|)를 사용해서 문자열을 변환하는 문법이 있지만 이 문법은 필터가 아니라 **파이프**라고 합니다.
      AngularJS에서 제공하던 기본 필터는 Angular에도 있지만, 모두 있는 것은 아닙니다.

      자세한 내용은 [Filters/pipes](guide/ajs-quick-reference#filters-pipes) 문서를 참고하세요.

    </td>

  </tr>

  <tr style=top>

    <td>


      <!--
      ### Local variables
      -->
      ### 지역 변수(Local variables)

      <code-example hideCopy format="">
        &lt;tr ng-repeat="movie in vm.movies">
          &lt;td>{{movie.title}}&lt;/td>
        &lt;/tr>
      </code-example>


      <!--
      Here, `movie` is a user-defined local variable.
      -->
      위 코드에서 `movie`는 개발자가 정의한 지역 변수입니다.
    </td>

    <td>


      <!--
      ### Input variables
      -->
      ### 입력 변수(Input variables)

      <code-example hideCopy path="ajs-quick-reference/src/app/app.component.html" region="local"></code-example>


      <!--
      Angular has true template input variables that are explicitly defined using the `let` keyword.

      For more information, see the [ngFor micro-syntax](guide/template-syntax#microsyntax)
      section of the [Template Syntax](guide/template-syntax) page.
      -->
      Angular 템플릿에서는 `let` 키워드를 사용해서 입력 변수를 정의할 수 있습니다.

      더 자세한 내용은 [템플릿 문법](guide/template-syntax) 문서의 [ngFor 세부 문법](guide/template-syntax#microsyntax) 섹션을 참고하세요.

    </td>

  </tr>

</table>


<!--
## Template directives
-->
## 템플릿 디렉티브

<!--
AngularJS provides more than seventy built-in directives for templates.
Many of them aren't needed in Angular because of its more capable and expressive binding system.
The following are some of the key AngularJS built-in directives and their equivalents in Angular.
-->
ANgularJS에서는 템플릿에 사용할 수 있는 디렉티브를 70개 이상 제공합니다.
하지만 이 중 대부분은 크게 유용하지 않기 때문에 Angular로 오면서 많이 제거되었습니다.
아래 표를 보면서 AngularJS와 Angular 양쪽에 존재하는 디렉티브에 대해 확인해 보세요.

<table width="100%">

  <col width="50%">

  </col>

  <col width="50%">

  </col>

  <tr>

    <th>
      AngularJS
    </th>

    <th>
      Angular
    </th>

  </tr>

  <tr style=top>

    <td>


      ### ng-app

      <code-example hideCopy>
        &lt;body ng-app="movieHunter">
      </code-example>


      <!--
      The application startup process is called **bootstrapping**.

      Although you can bootstrap an AngularJS app in code,
      many applications bootstrap declaratively with the `ng-app` directive,
      giving it the name of the application's module (`movieHunter`).
      -->
      애플리케이션이 시작되는 과정을 **부트스트랩(bootstrapping)**이라고 합니다.

      AngularJS 앱은 JavaScript 코드에서 부트스트랩할 수도 있지만 템플릿에 `ng-app` 디렉티브를 사용해서 부트스트랩하는 방법이 더 일반적입니다.
      이 디렉티브에는 애플리케이션 모듈의 이름(`movieHunter`)를 지정합니다.
    </td>

    <td>


      <!--
      ### Bootstrapping
      -->
      ### 부트스트랩(Bootstrapping)

      <code-example hideCopy path="ajs-quick-reference/src/main.ts" header="main.ts"></code-example>
      <br>

      <code-example hideCopy path="ajs-quick-reference/src/app/app.module.1.ts" header="app.module.ts"></code-example>


      <!--
      Angular doesn't have a bootstrap directive.
      To launch the app in code, explicitly bootstrap the application's root module (`AppModule`)
      in `main.ts`
      and the application's root component (`AppComponent`) in `app.module.ts`.
      -->
      Angular에는 부트스트랩을 하는 디렉티브가 존재하지 않습니다.
      애플리케이션은 `main.ts` 파일에서 애플리케이션 최상위 모듈(`AppModule`)을 직접 지정하는 방식으로 시작합니다.
      그리고 `app.module.ts` 파일에 존재하는 최상위 컴포넌트(`AppComponent`)가 애플리케이션 최상위 컴포넌트가 됩니다.
    </td>

  </tr>

  <tr style=top>

    <td>


      ### ng-class

      <code-example hideCopy format="">
        &lt;div ng-class="{active: isActive}">
        &lt;div ng-class="{active: isActive,
                           shazam: isImportant}">
      </code-example>


      <!--
      In AngularJS, the `ng-class` directive includes/excludes CSS classes
      based on an expression. That expression is often a key-value control object with each
      key of the object defined as a CSS class name, and each value defined as a template expression
      that evaluates to a Boolean value.

      In the first example, the `active` class is applied to the element if `isActive` is true.

      You can specify multiple classes, as shown in the second example.
      -->
      `ng-class`는 표현식의 결과에 따라 CSS 클래스를 추가하거나 제거하는 디렉티브입니다.
      이 표현식은 보통 CSS 클래스 이름을 키(key)로, 이 클래스가 적용되는지 여부를 불리언값으로 구성한 객체 형식을 반환합니다.

      첫번째 예제 코드는 컨트롤러의 `isActive`의 값이 `true` 일때 `active` 클래스를 엘리먼트에 추가하는 코드입니다.
      그리고 두번째 예제 코드에서 볼 수 있듯이, 한 번에 여러 클래스를 조작할 수도 있습니다.
    </td>

    <td>


      ### ngClass

      <code-example hideCopy path="ajs-quick-reference/src/app/app.component.html" region="ngClass"></code-example>


      <!--
      In Angular, the `ngClass` directive works similarly.
      It includes/excludes CSS classes based on an expression.

      In the first example, the `active` class is applied to the element if `isActive` is true.

      You can specify multiple classes, as shown in the second example.

      Angular also has **class binding**, which is a good way to add or remove a single class,
      as shown in the third example.

      For more information see the [Attribute, class, and style bindings](guide/template-syntax#other-bindings)
      section of the [Template Syntax](guide/template-syntax) page.
      -->
      `ngClass`도 비슷하게 동작합니다.
      이 디렉티브도 표현식이 반환하는 결과에 따라 엘리먼트의 CSS 클래스를 추가하거나 제거합니다.

      첫번째 예제 코드는 컴포넌트의 `isActive` 프로퍼티값이 `true`일 때 `active` 클래스를 엘리먼트에 추가하는 코드입니다.

      그리고 두번째 예제 코드에서 볼 수 있듯이, 한 번에 여러 클래스를 조작할 수도 있습니다.

      세번째 예제 코드에 사용한 것은 **클래스 바인딩** 문법입니다. 조작하려는 클래스가 하나라면 이 방법을 사용하는 것도 좋습니다.

      더 자세한 내용은 [템플릿 문법](guide/template-syntax) 문서의 [어트리뷰트, 클래스, 스타일 바인딩](guide/template-syntax#other-bindings) 섹션을 참고하세요.

    </td>

  </tr>

  <tr style=top>

    <td>


      ### ng-click

      <code-example hideCopy format="">
        &lt;button ng-click="vm.toggleImage()">
        &lt;button ng-click="vm.toggleImage($event)">
      </code-example>

      <!--
      In AngularJS, the `ng-click` directive allows you to specify custom behavior when an element is clicked.

      In the first example, when the user clicks the button, the `toggleImage()` method in the controller referenced by the `vm` `controller as` alias is executed.

      The second example demonstrates passing in the `$event` object, which provides details about the event
      to the controller.
      -->
      `ng-click`을 활용하면 사용자가 엘리먼트를 클릭했을 때 특정 로직을 실행할 수 있습니다.

      첫번째 예제 코드는 사용자가 버튼을 클릭했을 때 컨트롤러의 `toggleImage()` 메소드를 실행하는 코드입니다. `controller as` 문법을 사용했기 때문에 `vm`을 정확하게 지정했습니다.

      두번째 예제 코드는 컨트롤러에서 좀 더 복잡한 로직을 실행하기 위해 `$event` 객체를 컨트롤러 메소드로 전달하는 코드입니다.

    </td>

    <td>


      <!--
      ### Bind to the `click` event

      <code-example hideCopy path="ajs-quick-reference/src/app/app.component.html" region="event-binding"></code-example>


      AngularJS event-based directives do not exist in Angular.
      Rather, define one-way binding from the template view to the component using **event binding**.

      For event binding, define the name of the target event within parenthesis and
      specify a template statement, in quotes, to the right of the equals. Angular then
      sets up an event handler for the target event. When the event is raised, the handler
      executes the template statement.

      In the first example, when a user clicks the button, the `toggleImage()` method in the associated component is executed.

      The second example demonstrates passing in the `$event` object, which provides details about the event
      to the component.

      For a list of DOM events, see: https://developer.mozilla.org/en-US/docs/Web/Events.

      For more information, see the [Event binding](guide/template-syntax#event-binding)
      section of the [Template Syntax](guide/template-syntax) page.
      -->
      ### `click` 이벤트 바인딩
      
      <code-example hideCopy path="ajs-quick-reference/src/app/app.component.html" region="event-binding"></code-example>

      Angular에는 AngularJS에서처럼 이벤트를 기반으로 동작하는 디렉티브가 존재하지 않습니다.
      이 방식 대신 Angular는 템플릿 뷰에서 컴포넌트 방향으로 연결하는 **이벤트 바인딩**을 제공합니다.

      이벤트를 바인딩하려면 엘리먼트에서 발생하는 이벤트를 소괄호(`(`, `)`)로 감싸고 등호(`=`)를 붙인 다음 템플릿 실행문을 작성하면 됩니다.
      이렇게 작성하면 Angular가 템플릿 실행문을 이벤트의 이벤트 핸들러로 등록합니다.
      그리고 이후에 이벤트가 발생하면 이벤트 핸들러가 템플릿 실행문을 실행합니다.

      첫번째 예제 코드는 사용자가 버튼을 클릭했을 때 컴포넌트에 있는 `toggleImage()` 메소드를 실행하는 코드입니다.

      그리고 두번째 예제 코드는 컴포넌트에서 좀 더 복잡한 로직을 실행하기 위해 `$event` 객체를 컴포넌트 메소드로 전달하는 코드입니다.

      DOM에서 발생하는 이벤트 목록은 https://developer.mozilla.org/en-US/docs/Web/Events 를 참고하세요.

      그리고 이벤트 바인딩에 대해 자세하게 알아보려면 [템플릿 문법](guide/template-syntax) 문서의 [이벤트 바인딩](guide/template-syntax#event-binding) 섹션을 참고하세요.

    </td>

  </tr>

  <tr style=top>

    <td>


      ### ng-controller

      <code-example hideCopy format="">
        &lt;div ng-controller="MovieListCtrl as vm">
      </code-example>


      <!--
      In AngularJS, the `ng-controller` directive attaches a controller to the view.
      Using the `ng-controller` (or defining the controller as part of the routing) ties the
      view to the controller code associated with that view.
      -->
      `ng-controller`는 뷰에 컨트롤러를 연결할 때 사용합니다.
      특정 뷰 영역에서 동작하는 컨트롤러를 연결하거나 라우팅하는 용도로 사용할 수 있습니다.
    </td>

    <td>


      <!--
      ### Component decorator

      <code-example hideCopy path="ajs-quick-reference/src/app/movie-list.component.ts" region="component"></code-example>


      In Angular, the template no longer specifies its associated controller.
      Rather, the component specifies its associated template as part of the component class decorator.

      For more information, see [Architecture Overview](guide/architecture#components).
      -->
      ### 컴포넌트 데코레이터

      <code-example hideCopy path="ajs-quick-reference/src/app/movie-list.component.ts" region="component"></code-example>

      Angular에서는 템플릿에서 컨트롤러를 지정하지 않습니다.
      Angular는 컴포넌트의 구성요소로 템플릿을 지정하며 컴포넌트 클래스에는 컴포넌트 데코레이터를 붙입니다.

      더 자세한 내용은 [아키텍처 개요](guide/architecture#components) 문서를 참고하세요.

    </td>

  </tr>

  <tr style=top>

    <td>


      ### ng-hide

      <!--
      In AngularJS, the `ng-hide` directive shows or hides the associated HTML element based on
      an expression. For more information, see [ng-show](guide/ajs-quick-reference#ng-show).
      -->
      `ng-hide`는 표현식의 결과에 따라 HTML 엘리먼트를 화면에 표시하거나 화면에서 감추는 용도로 사용합니다.
      자세한 내용은 [ng-show](guide/ajs-quick-reference#ng-show) 섹션을 참고하세요.

    </td>

    <td>


      <!--
      ### Bind to the `hidden` property
      In Angular, you use property binding; there is no built-in *hide* directive.
      For more information, see [ng-show](guide/ajs-quick-reference#ng-show).
      -->
      ### `hidden` 프로퍼티 바인딩

      Angular는 *hide* 디렉티브를 제공하지 않습니다. 이 방식 대신 프로퍼티 바인딩을 사용합니다.

      자세한 내용은 [ng-show](guide/ajs-quick-reference#ng-show) 섹션을 참고하세요.

    </td>

  </tr>

  <tr style=top>

    <td>


      ### ng-href

      <code-example hideCopy format="">
        &lt;a ng-href="{{ angularDocsUrl }}">Angular Docs&lt;/a>
      </code-example>


      <!--
      The `ng-href` directive allows AngularJS to preprocess the `href` property so that it
      can replace the binding expression with the appropriate URL before the browser
      fetches from that URL.

      In AngularJS, the `ng-href` is often used to activate a route as part of navigation.
      -->
      `ng-href`는 브라우저가 링크를 처리하기 전에 AngularJS가 먼저 받아서 `href` 프로퍼티를 조작할 때 사용하는 디렉티브입니다.

      이 디렉티브는 네비게이션에 사용되기도 합니다.

      <code-example hideCopy format="">
        &lt;a ng-href="#{{ moviesHash }}">Movies&lt;/a>
      </code-example>


      <!--
      Routing is handled differently in Angular.
      -->
      Angular에서는 라우팅이 다른 방식으로 동작합니다.
    </td>

    <td>


      <!--
      ### Bind to the `href` property

      <code-example hideCopy path="ajs-quick-reference/src/app/app.component.html" region="href"></code-example>


      Angular uses property binding; there is no built-in *href* directive.
      Place the element's `href` property in square brackets and set it to a quoted template expression.

      For more information see the [Property binding](guide/template-syntax#property-binding)
      section of the [Template Syntax](guide/template-syntax) page.

      In Angular, `href` is no longer used for routing. Routing uses `routerLink`, as shown in the following example.

      <code-example hideCopy path="ajs-quick-reference/src/app/app.component.html" region="router-link"></code-example>


      For more information on routing, see the [RouterLink binding](guide/router#router-link)
      section of the [Routing & Navigation](guide/router) page.
      -->
      ### `href` 프로퍼티 바인딩

      <code-example hideCopy path="ajs-quick-reference/src/app/app.component.html" region="href"></code-example>

      Angular는 *href* 디렉티브를 제공하지 않습니다. 이 방식 대신 프로퍼티 바인딩을 사용합니다.
      엘리먼트의 `href` 프로퍼티를 대괄호(`[`, `]`)로 감싸고 등호 오른쪽에 템플릿 표현식을 작성하면 됩니다.

      더 자세한 내용은 [템플릿 문법](guide/template-syntax) 문서의 [프로퍼티 바인딩](guide/template-syntax#property-binding) 섹션을 참고하세요.

      Angular에서 라우팅을 한다면 `href`는 더이상 사용하지 않습니다.
      이 프로퍼티 대신 아래 예제처럼 `routerLink`를 활용합니다.

      <code-example hideCopy path="ajs-quick-reference/src/app/app.component.html" region="router-link"></code-example>

      더 자세한 내용은 [라우팅 & 네비게이션](guide/router) 문서의 [RouterLink 바인딩](guide/router#router-link) 섹션을 참고하세요.

    </td>

  </tr>

  <tr style=top>

    <td>


      ### ng-if

      <code-example hideCopy format="">
        &lt;table ng-if="movies.length">
      </code-example>


      <!--
      In AngularJS, the `ng-if` directive removes or recreates a portion of the DOM,
      based on an expression. If the expression is false, the element is removed from the DOM.

      In this example, the `<table>` element is removed from the DOM unless the `movies` array has a length greater than zero.
      -->
      `ng-if`는 표현식의 결과에 따라 HTML 조각을 DOM에 추가하거나 DOM에서 제거하는 디렉티브입니다.

      예제 코드에서 `movies` 배열의 길이가 0이면 `<table>` 엘리먼트가 DOM에서 제거됩니다.
    </td>

    <td>


      ### *ngIf

      <code-example hideCopy path="ajs-quick-reference/src/app/movie-list.component.html" region="ngIf"></code-example>


      <!--
      The `*ngIf` directive in Angular works the same as the `ng-if` directive in AngularJS. It removes
      or recreates a portion of the DOM based on an expression.

      In this example, the `<table>` element is removed from the DOM unless the `movies` array has a length.

      The (*) before `ngIf` is required in this example.
      For more information, see [Structural Directives](guide/structural-directives).
      -->
      `*ngIf`는 AngularJS의 `ng-if`와 동일한 동작을 하는 디렉티브입니다.
      이 디렉티브도 표현식의 결과에 따라 HTML 조각을 DOM에 추가하거나 DOM에서 제거합니다.

      예제 코드에서 `movies` 배열의 길이가 0이면 `<table>` 엘리먼트가 DOM에서 제거됩니다.
    </td>

  </tr>

  <tr style=top>

    <td>


      ### ng-model

      <code-example hideCopy format="">
        &lt;input ng-model="vm.favoriteHero"/>
      </code-example>


      <!--
      In AngularJS, the `ng-model` directive binds a form control to a property in the controller associated with the template.
      This provides **two-way binding**, whereby any change made to the value in the view is synchronized with the model, and any change to the model is synchronized with the value in the view.
      -->
      `ng-model`은 폼 컨트롤과 템플릿의 컨트롤러 프로퍼티를 바인딩하는 디렉티브입니다.
      이 때 연결되는 방식은 **양방향 바인딩** 입니다. 컨트롤러에서 모델값이 변경되면 화면에서 이 값이 반영되며, 화면에서 값이 변경되어도 컨트롤러 모델에 이 값이 반영됩니다.
    </td>

    <td>


      ### ngModel

      <code-example hideCopy path="ajs-quick-reference/src/app/movie-list.component.html" region="ngModel"></code-example>


      <!--
      In Angular, **two-way binding** is denoted by `[()]`, descriptively referred to as a "banana in a box". This syntax is a shortcut for defining both property binding (from the component to the view)
      and event binding (from the view to the component), thereby providing two-way binding.

      For more information on two-way binding with `ngModel`, see the [NgModel&mdash;Two-way binding to
      form elements with `[(ngModel)]`](../guide/template-syntax.html#ngModel)
      section of the [Template Syntax](guide/template-syntax) page.
      -->
      Angular에서는 `[()]`라는 문법으로 **양방향 바인딩**을 사용할 수 있습니다. 괄호 순서를 헷갈리지 않게 "상자에 든 바나나" 라고도 합니다.
      그런데 이 문법은 사실 프로퍼티 바인딩(컴포넌트에서 화면으로)과 이벤트 바인딩(화면에서 컴포넌트로)을 함께 엮어 양방향 바인딩시키는 문법을 간략화한 것입니다.

      `ngModel`을 사용해서 양방향 바인딩을 활용하는 방법에 대해 자세하게 알아보려면 [템플릿 문법](guide/template-syntax) 문서의 [`[(NgModel)]: 양방향 바인딩](guide/template-syntax#ngModel) 섹션을 참고하세요.
    </td>

  </tr>

  <tr style=top>

    <td>


      ### ng-repeat

      <code-example hideCopy format="">
        &lt;tr ng-repeat="movie in vm.movies">
      </code-example>


      <!--
      In AngularJS, the `ng-repeat` directive repeats the associated DOM element
      for each item in the specified collection.

      In this example, the table row (`<tr>`) element repeats for each movie object in the collection of movies.
      -->
      `ng-repeat`은 DOM 엘리먼트를 반복할 때 사용하는 디렉티브입니다.

      예제 코드에서 테이블의 행(`<tr>`)은 `movies` 항목마다 반복됩니다.
    </td>

    <td>


      ### *ngFor

      <code-example hideCopy path="ajs-quick-reference/src/app/movie-list.component.html" region="ngFor"></code-example>


      <!--
      The `*ngFor` directive in Angular is similar to the `ng-repeat` directive in AngularJS. It repeats
      the associated DOM element for each item in the specified collection.
      More accurately, it turns the defined element (`<tr>` in this example) and its contents into a template and
      uses that template to instantiate a view for each item in the list.

      Notice the other syntax differences:
      The (*) before `ngFor` is required;
      the `let` keyword identifies `movie` as an input variable;
      the list preposition is `of`, not `in`.

      For more information, see [Structural Directives](guide/structural-directives).
      -->
      `*ngFor`는 `ng-repeat`과 비슷하게 DOM 엘리먼트를 반복할 때 사용합니다.
      좀 더 정확하게 설명하면, `*ngFor` 디렉티브는 디렉티브가 지정된 엘리먼트(예제에서는 `<tr>`)와 목록에 있는 개별 항목을 조합해서 새로운 템플릿 인스턴스를 생성합니다.

      이 디렉티브를 사용할 때는 문법에 주의해야 합니다: `ngFor` 앞에는 별표(`*`)가 꼭 필요하며 입력 변수를 선언하기 위해 `let` 키워드가 필요합니다. 그리고 목록을 지정할 때는 `in`이 아니라 `of`를 사용해야 합니다.

      더 자세한 내용은 [구조 디렉티브](guide/structural-directives) 문서를 참고하세요.
    </td>

  </tr>

  <tr style=top>

    <td>


      ### ng-show

      <code-example hideCopy format="">
        &lt;h3 ng-show="vm.favoriteHero">
          Your favorite hero is: {{vm.favoriteHero}}
        &lt;/h3>
      </code-example>


      <!--
      In AngularJS, the `ng-show` directive shows or hides the associated DOM element, based on
      an expression.

      In this example, the `<div>` element is shown if the `favoriteHero` variable is truthy.
      -->
      `ng-show`는 표현식의 결과에 따라 DOM 엘리먼트를 화면에 표시하거나 감추는 엘리먼트입니다.

      위 예제 코드에서 `<div>` 엘리먼트는 `favoriteHero` 변수의 값이 참으로 평가될 때 화면에 표시됩니다.
    </td>

    <td>


      <!--
      ### Bind to the `hidden` property

      <code-example hideCopy path="ajs-quick-reference/src/app/movie-list.component.html" region="hidden"></code-example>


      Angular uses property binding; there is no built-in *show* directive.
      For hiding and showing elements, bind to the HTML `hidden` property.

      To conditionally display an element, place the element's `hidden` property in square brackets and
      set it to a quoted template expression that evaluates to the *opposite* of *show*.

      In this example, the `<div>` element is hidden if the `favoriteHero` variable is not truthy.

      For more information on property binding, see the [Property binding](guide/template-syntax#property-binding)
      section of the [Template Syntax](guide/template-syntax) page.
      -->
      ### `hidden` 프로퍼티 바인딩

      <code-example hideCopy path="ajs-quick-reference/src/app/movie-list.component.html" region="hidden"></code-example>

      Angular는 *show* 디렉티브를 제공하지 않습니다. 이 방식 대신 프로퍼티 바인딩을 사용합니다.
      
      엘리먼트를 조건에 따라 화면에 표시하려면 HTML `hidden` 프로퍼티를 대괄호(`[`, `]`)로 감싸고 등호(`=`)로 템플릿 표현식을 연결하면 됩니다.

      위 예제 코드에서 `<div>` 엘리먼트는 `favoriteHero` 변수의 값이 거짓으로 평가되면 화면에 표시되지 않습니다.

      프로퍼티 바인딩에 대해 더 자세하게 알아보려면 [템플릿 문법](guide/template-syntax) 문서의 [프로퍼티 바인딩](guide/template-syntax#property-binding) 섹션을 참고하세요.


    </td>

  </tr>

  <tr style=top>

    <td>


      ### ng-src

      <code-example hideCopy format="">
        &lt;img ng-src="{{movie.imageurl}}">
      </code-example>


      <!--
      The `ng-src` directive allows AngularJS to preprocess the `src` property so that it
      can replace the binding expression with the appropriate URL before the browser
      fetches from that URL.
      -->
      `ng-src`는 `src` 프로퍼티를 브라우저가 처리하기 전에 AngulaJS 바인딩 표현식으로 교체할 때 사용하는 디렉티브입니다.
    </td>

    <td>


      <!--
      ### Bind to the `src` property

      <code-example hideCopy path="ajs-quick-reference/src/app/app.component.html" region="src"></code-example>


      Angular uses property binding; there is no built-in *src* directive.
      Place the `src` property in square brackets and set it to a quoted template expression.

      For more information on property binding, see the [Property binding](guide/template-syntax#property-binding)
      section of the [Template Syntax](guide/template-syntax) page.
      -->
      ### `src` 프로퍼티 바인딩

      <code-example hideCopy path="ajs-quick-reference/src/app/app.component.html" region="src"></code-example>

      Angular는 `src` 디렉티브를 제공하지 않습니다. 이 방식 대신 프로퍼티 바인딩을 사용합니다.
      Angular에서는 `src` 프로퍼티를 대괄호(`[`, `]`)로 감싸고 템플릿 표현식을 연결하면 됩니다.

      프로퍼티 바인딩에 대해 더 자세하게 알아보려면 [템플릿 문법](guide/template-syntax) 문서의 [프로퍼티 바인딩](guide/template-syntax#property-binding) 섹션을 참고하세요.
    </td>

  </tr>

  <tr style=top>

    <td>


      ### ng-style

      <code-example hideCopy format="">
        &lt;div ng-style="{color: colorPreference}">
      </code-example>


      <!--
      In AngularJS, the `ng-style` directive sets a CSS style on an HTML element
      based on an expression. That expression is often a key-value control object with each
      key of the object defined as a CSS property, and each value defined as an expression
      that evaluates to a value appropriate for the style.

      In the example, the `color` style is set to the current value of the `colorPreference` variable.
      -->
      `ng-style`은 HTML 엘리먼트에 적용되는 CSS 스타일을 표현식으로 설정할 때 사용하는 디렉티브입니다.
      이 표현식은 보통 적용하려는 CSS 프로퍼티를 키(key)로 두고 프로퍼티의 값을 지정하는 객체 형식을 반환합니다.
    </td>

    <td>


      ### ngStyle

      <code-example hideCopy path="ajs-quick-reference/src/app/app.component.html" region="ngStyle"></code-example>


      <!--
      In Angular, the `ngStyle` directive works similarly. It sets a CSS style on an HTML element based on an expression.

      In the first example, the `color` style is set to the current value of the `colorPreference` variable.

      Angular also has **style binding**, which is good way to set a single style. This is shown in the second example.

      For more information on style binding, see the [Style binding](guide/template-syntax#style-binding) section of the
      [Template Syntax](guide/template-syntax) page.

      For more information on the `ngStyle` directive, see [NgStyle](guide/template-syntax#ngStyle)
      section of the [Template Syntax](guide/template-syntax) page.
      -->
      Angular에서는 `ngStyle`가 비슷한 동작을 합니다.
      이 디렉티브도 템플릿 표현식의 결과에 따라 HTML 엘리먼트에 CSS 스타일을 적용합니다.

      첫번째 예제에서 `color` 스타일은 `colorPreference` 값으로 지정됩니다.

      그리고 Angular는 두번째 예제 코드처럼 사용하는 **스타일 바인딩** 문법도 제공합니다.

      스타일 바인딩에 대해 더 자세하게 알아보려면 [템플릿 문법](guide/template-syntax) 문서의 [스타일 바인딩](guide/template-syntax#style-binding) 섹션을 참고하세요.

      그리고 `ngStyle` 디렉티브에 대해 알아보려면 [템플릿 문법](guide/template-syntax) 문서의 [NgStyle](guide/template-syntax#ngStyle) 섹션을 참고하세요.
    </td>

  </tr>

  <tr style=top>

    <td>


      ### ng-switch

      <code-example hideCopy format="">
        &lt;div ng-switch="vm.favoriteHero &&
                        vm.checkMovieHero(vm.favoriteHero)">
            &lt;div ng-switch-when="true">
              Excellent choice!
            &lt;/div>
            &lt;div ng-switch-when="false">
              No movie, sorry!
            &lt;/div>
            &lt;div ng-switch-default>
              Please enter your favorite hero.
            &lt;/div>
        &lt;/div>
      </code-example>


      <!--
      In AngularJS, the `ng-switch` directive swaps the contents of
      an element by selecting one of the templates based on the current value of an expression.

      In this example, if `favoriteHero` is not set, the template displays "Please enter ...".
      If `favoriteHero` is set, it checks the movie hero by calling a controller method.
      If that method returns `true`, the template displays "Excellent choice!".
      If that methods returns `false`, the template displays "No movie, sorry!".
      -->
      `ng-switch` 는 표현식의 결과에 따라 템플릿 중 하나를 화면에 표시하는 디렉티브입니다.

      위 예제 코드에서 `favoriteHero` 값이 할당되지 않으면 화면에는 "Please enter ..."가 표시됩니다.
      그리고 `favoriteHero` 값이 할당되고 나면 컨트롤러 메소드가 반환하는 값에 따라 표시될 템플릿이 결정됩니다.
      메소드가 `true`를 반환하면 화면에는 "Excellent choice!"가 표시됩니다.
      그리고 메소드가 `false`를 반환하면 화면에는 "No movie, sorry!"가 표시됩니다.
    </td>

    <td>


      ### ngSwitch

      <code-example hideCopy path="ajs-quick-reference/src/app/movie-list.component.html" region="ngSwitch"></code-example>


      <!--
      In Angular, the `ngSwitch` directive works similarly.
      It displays an element whose `*ngSwitchCase` matches the current `ngSwitch` expression value.

      In this example, if `favoriteHero` is not set, the `ngSwitch` value is `null`
      and `*ngSwitchDefault` displays, "Please enter ...".
      If `favoriteHero` is set, the app checks the movie hero by calling a component method.
      If that method returns `true`, the app selects `*ngSwitchCase="true"` and displays: "Excellent choice!"
      If that methods returns `false`, the app selects `*ngSwitchCase="false"` and displays: "No movie, sorry!"

      The (*) before `ngSwitchCase` and `ngSwitchDefault` is required in this example.

      For more information, see [The NgSwitch directives](guide/template-syntax#ngSwitch)
      section of the [Template Syntax](guide/template-syntax) page.
      -->
      Angular의 `ngSwitch` 디렉티브도 비슷하게 동작합니다.
      이 디렉티브는 `ngSwitch`과 바인딩된 표현식의 결과에 맞는 `*ngSwitchCase`를 찾아서 화면에 표시합니다.

      위 예제 코드에서 `favoriteHero` 값이 할당되지 않으면 `*ngSwitchDefault`에 해당하는 "Please enter ..."가 화면에 표시됩니다.
      그리고 `favoriteHero` 값이 할당되고 나면 컴포넌트 메소드가 반환하는 값에 따라 표시될 템플릿이 결정됩니다.
      메소드가 `true`를 반환하면 `*ngSwitchCase="true"`에 해당하는 "Excellent choice!"가 표시됩니다.
      그리고 메소드가 `false`를 반환하면 `*ngSwitchCase="false"`에 해당하는 "No movie, sorry!"가 표시됩니다.

      `ngSwitchCase`와 `ngSwitchDefault` 앞에는 별표(`*`)가 붙는다는 것에 주의하세요.

      더 자세한 내용을 알아보려면 [템플릿 문법](guide/template-syntax) 문서의 [NgSwitch 디렉티브](guide/template-syntax#ngSwitch) 섹션을 참고하세요.
    </td>

  </tr>

</table>


{@a filters-pipes}



## Filters/pipes
Angular **pipes** provide formatting and transformation for data in the template, similar to AngularJS **filters**.
Many of the built-in filters in AngularJS have corresponding pipes in Angular.
For more information on pipes, see [Pipes](guide/pipes).


<table width="100%">

  <col width="50%">

  </col>

  <col width="50%">

  </col>

  <tr>

    <th>
      AngularJS
    </th>

    <th>
      Angular
    </th>

  </tr>

  <tr style=top>

    <td>


      ### currency

      <code-example hideCopy>
        &lt;td>{{movie.price | currency}}&lt;/td>
      </code-example>


      Formats a number as currency.
    </td>

    <td>


      ### currency

      <code-example hideCopy path="ajs-quick-reference/src/app/app.component.html" region="currency"></code-example>


      The Angular `currency` pipe is similar although some of the parameters have changed.
    </td>

  </tr>

  <tr style=top>

    <td>


      ### date

      <code-example hideCopy>
        &lt;td>{{movie.releaseDate | date}}&lt;/td>
      </code-example>


      Formats a date to a string based on the requested format.
    </td>

    <td>


      ### date

      <code-example hideCopy path="ajs-quick-reference/src/app/app.component.html" region="date"></code-example>


      The Angular `date` pipe is similar.

    </td>

  </tr>

  <tr style=top>

    <td>


      ### filter

      <code-example hideCopy>
        &lt;tr ng-repeat="movie in movieList | filter: {title:listFilter}">
      </code-example>


      Selects a subset of items from the defined collection, based on the filter criteria.
    </td>

    <td>


      ### none
      For performance reasons, no comparable pipe exists in Angular. Do all your filtering in the component. If you need the same filtering code in several templates, consider building a custom pipe.

    </td>

  </tr>

  <tr style=top>

    <td>


      ### json

      <code-example hideCopy>
        &lt;pre>{{movie | json}}&lt;/pre>
      </code-example>


      Converts a JavaScript object into a JSON string. This is useful for debugging.
    </td>

    <td>


      ### json

      <code-example hideCopy path="ajs-quick-reference/src/app/app.component.html" region="json"></code-example>


      The Angular `json` pipe does the same thing.
    </td>

  </tr>

  <tr style=top>

    <td>


      ### limitTo

      <code-example hideCopy>
        &lt;tr ng-repeat="movie in movieList | limitTo:2:0">
      </code-example>


      Selects up to the first parameter (2) number of items from the collection
      starting (optionally) at the beginning index (0).
    </td>

    <td>


      ### slice

      <code-example hideCopy path="ajs-quick-reference/src/app/app.component.html" region="slice"></code-example>


      The `SlicePipe` does the same thing but the *order of the parameters is reversed*, in keeping
      with the JavaScript `Slice` method.
      The first parameter is the starting index; the second is the limit.
      As in AngularJS, coding this operation within the component instead could improve performance.
    </td>

  </tr>

  <tr style=top>

    <td>


      ### lowercase

      <code-example hideCopy>
        &lt;td>{{movie.title | lowercase}}&lt;/td>
      </code-example>


      Converts the string to lowercase.
    </td>

    <td>


      ### lowercase

      <code-example hideCopy path="ajs-quick-reference/src/app/app.component.html" region="lowercase"></code-example>


      The Angular `lowercase` pipe does the same thing.
    </td>

  </tr>

  <tr style=top>

    <td>


      ### number

      <code-example hideCopy>
        &lt;td>{{movie.starRating | number}}&lt;/td>
      </code-example>


      Formats a number as text.
    </td>

    <td>


      ### number

      <code-example hideCopy path="ajs-quick-reference/src/app/app.component.html" region="number"></code-example>


      The Angular `number` pipe is similar.
      It provides more functionality when defining
      the decimal places, as shown in the second example above.

      Angular also has a `percent` pipe, which formats a number as a local percentage
      as shown in the third example.
    </td>

  </tr>

  <tr style=top>

    <td>


      ### orderBy

      <code-example hideCopy>
        &lt;tr ng-repeat="movie in movieList | orderBy : 'title'">
      </code-example>


      Displays the collection in the order specified by the expression.
      In this example, the movie title orders the `movieList`.
    </td>

    <td>


      ### none
      For performance reasons, no comparable pipe exists in Angular.
      Instead, use component code to order or sort results. If you need the same ordering or sorting code in several templates, consider building a custom pipe.

    </td>

  </tr>

</table>



{@a controllers-components}



## Modules/controllers/components
In both AngularJS and Angular, modules help you organize your application into cohesive blocks of functionality.

In AngularJS, you write the code that provides the model and the methods for the view in a **controller**.
In Angular, you build a **component**.

Because much AngularJS code is in JavaScript, JavaScript code is shown in the AngularJS column.
The Angular code is shown using TypeScript.


<table width="100%">

  <col width="50%">

  </col>

  <col width="50%">

  </col>

  <tr>

    <th>
      AngularJS
    </th>

    <th>
      Angular
    </th>

  </tr>

  <tr style=top>

    <td>


      ### IIFE

      <code-example hideCopy>
        (function () {
          ...
        }());
      </code-example>


      In AngularJS, an immediately invoked function expression (or IIFE) around controller code
      keeps it out of the global namespace.

    </td>

    <td>


      ### none
      This is a nonissue in Angular because ES 2015 modules
      handle the namespacing for you.

      For more information on modules, see the [Modules](guide/architecture#modules) section of the
      [Architecture Overview](guide/architecture).
    </td>

  </tr>

  <tr style=top>

    <td>


      ### Angular modules

      <code-example hideCopy>
        angular.module("movieHunter", ["ngRoute"]);
      </code-example>


      In AngularJS, an Angular module keeps track of controllers, services, and other code.
      The second argument defines the list of other modules that this module depends upon.
    </td>

    <td>


      ### NgModules

      <code-example hideCopy path="ajs-quick-reference/src/app/app.module.1.ts"></code-example>


      NgModules, defined with the `NgModule` decorator, serve the same purpose:

      * `imports`: specifies the list of other modules that this module depends upon
      * `declaration`: keeps track of your components, pipes, and directives.

      For more information on modules, see [NgModules](guide/ngmodules).
    </td>

  </tr>

  <tr style=top>

    <td>


      ### Controller registration

      <code-example hideCopy>
        angular
          .module("movieHunter")
          .controller("MovieListCtrl",
                      ["movieService",
                       MovieListCtrl]);
      </code-example>


      AngularJS has code in each controller that looks up an appropriate Angular module
      and registers the controller with that module.

      The first argument is the controller name. The second argument defines the string names of
      all dependencies injected into this controller, and a reference to the controller function.
    </td>

    <td>


      ### Component decorator

      <code-example hideCopy path="ajs-quick-reference/src/app/movie-list.component.ts" region="component"></code-example>


      Angular adds a decorator to the component class to provide any required metadata.
      The `@Component` decorator declares that the class is a component and provides metadata about
      that component such as its selector (or tag) and its template.

      This is how you associate a template with logic, which is defined in the component class.

      For more information, see the [Components](guide/architecture#components)
      section of the [Architecture Overview](guide/architecture) page.
    </td>

  </tr>

  <tr style=top>

    <td>


      ### Controller function

      <code-example hideCopy>
        function MovieListCtrl(movieService) {
        }
      </code-example>


      In AngularJS, you write the code for the model and methods in a controller function.
    </td>

    <td>


      ### Component class

      <code-example hideCopy path="ajs-quick-reference/src/app/movie-list.component.ts" region="class"></code-example>


      In Angular, you create a component class to contain the data model and control methods. Use the TypeScript <code>export</code> keyword to export the class so that the functionality can be imported into NgModules.

      For more information, see the [Components](guide/architecture#components)
      section of the [Architecture Overview](guide/architecture) page.
    </td>

  </tr>

  <tr style=top>

    <td>


      ### Dependency injection

      <code-example hideCopy>
        MovieListCtrl.$inject = ['MovieService'];
        function MovieListCtrl(movieService) {
        }
      </code-example>


      In AngularJS, you pass in any dependencies as controller function arguments.
      This example injects a `MovieService`.

      To guard against minification problems, tell Angular explicitly
      that it should inject an instance of the `MovieService` in the first parameter.
    </td>

    <td>


      ### Dependency injection

      <code-example hideCopy path="ajs-quick-reference/src/app/movie-list.component.ts" region="di"></code-example>


      In Angular, you pass in dependencies as arguments to the component class constructor.
      This example injects a `MovieService`.
      The first parameter's TypeScript type tells Angular what to inject, even after minification.

      For more information, see the [Dependency injection](guide/architecture#dependency-injection)
      section of the [Architecture Overview](guide/architecture).
    </td>

  </tr>

</table>

{@a style-sheets}



## Style sheets
Style sheets give your application a nice look.
In AngularJS, you specify the style sheets for your entire application.
As the application grows over time, the styles for the many parts of the application
merge, which can cause unexpected results.
In Angular, you can still define style sheets for your entire application. But now you can
also encapsulate a style sheet within a specific component.

<table width="100%">

  <col width="50%">

  </col>

  <col width="50%">

  </col>

  <tr>

    <th>
      AngularJS
    </th>

    <th>
      Angular
    </th>

  </tr>

  <tr style=top>

    <td>


      ### Link tag

      <code-example hideCopy>
        &lt;link href="styles.css" rel="stylesheet" />
      </code-example>


      AngularJS, uses a `link` tag in the head section of the `index.html` file
      to define the styles for the application.
    </td>

    <td>



      ### Styles configuration
      <code-example hideCopy path="ajs-quick-reference/.angular-cli.1.json" region="styles"></code-example>

      With the Angular CLI, you can configure your global styles in the `angular.json` file.
      You can rename the extension to `.scss` to use sass.

      ### StyleUrls
      In Angular, you can use the `styles` or `styleUrls` property of the `@Component` metadata to define
      a style sheet for a particular component.

      <code-example hideCopy path="ajs-quick-reference/src/app/movie-list.component.ts" region="style-url"></code-example>


      This allows you to set appropriate styles for individual components that won’t leak into
      other parts of the application.
    </td>

  </tr>

</table>
