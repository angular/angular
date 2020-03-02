<!--
# Getting Started with Angular: Your First App
-->
# Angular 시작하기: 첫번째 앱 만들기

<!--
Welcome to Angular!

This tutorial introduces you to the essentials of Angular by walking you through a simple e-commerce site with a catalog, shopping cart, and check-out form.
To help you get started right away, this guide uses a simple ready-made application that you can examine and play with interactively.
-->
Angular의 세계에 오신 것을 환영합니다!

이 가이드 문서는 상품 목록, 쇼핑 카트, 주문 폼을 구성된 온라인 주문 애플리케이션을 Angular로 간단하게 만들어보면서 Angular의 기본 개념에 대해 소개합니다.
이 애플리케이션이 실제로 어떻게 동작하는지, 미리 만들어 둔 예제 애플리케이션 코드도 함께 확인해 보세요.

<div class="callout is-helpful">
<!--
<header>New to web development?</header>
-->
<header>웹 개발이 처음인가요?</header>


<!--
 There are many resources to complement the Angular docs. Mozilla's MDN docs include both [HTML](https://developer.mozilla.org/en-US/docs/Learn/HTML "Learning HTML: Guides and tutorials") and [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript "JavaScript") introductions. [TypeScript's docs](https://www.typescriptlang.org/docs/home.html "TypeScript documentation") include a 5-minute tutorial. Various online course platforms, such as [Udemy](http://www.udemy.com "Udemy online courses") and [Codecademy](https://www.codecademy.com/ "Codecademy online courses"), also cover web development basics.
-->
 Angular 공식 가이드 문서 외에도 Angular 개발에 도움이 되는 자료는 많습니다. Mozilla MDN에서 [HTML](https://developer.mozilla.org/en-US/docs/Learn/HTML "Learning HTML: Guides and tutorials")과 [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript "JavaScript")에 대한 자료를 찾아볼 수 있으며, [TypeScript 문서](https://www.typescriptlang.org/docs/home.html "TypeScript documentation")에 있는 5분 튜토리얼도 참고할 만 합니다. [Udemy](http://www.udemy.com "Udemy online courses")나 [Codecademy](https://www.codecademy.com/ "Codecademy online courses")와 같은 온라인 교육 플랫폼에서 웹 개발과 관련된 기본 지식도 활용하면 좋습니다.

</div>


{@a new-project}
<!--
## Create a new project
-->
## 프로젝트 생성하기

<h4>
<!--
<live-example name="getting-started-v0" noDownload>Click here to create the ready-made sample project in StackBlitz.</live-example>
-->
<live-example name="getting-started-v0" noDownload>샘플 프로젝트를 생성하려면 StackBlitz 사이트를 활용하세요.</live-example>
</h4>

<div class="lightbox">
  <img src="generated/images/guide/start/new-app-all.gif" alt="Starter online store app">
</div>

<!--
* The preview pane on the right shows the starting state of the sample Angular app.
It defines a frame with a top bar (containing the store name and checkout icon) and the title for a product list (which will be populated and dynamically updated with data from the application).

* The project pane on the left shows the source files that make up the application, including all of the infrastructure and configuration files. The currently selected file shows up in the editor pane in the middle.

Before going into the source structure, the next section shows how to fill out the HTML *template* for the product list, using the provided sample data.
This should give you an idea how easy it is to modify and update the page dynamically.
-->
* 오른쪽에 있는 미리보기 탭을 보면 샘플 Angular 앱이 어떻게 동작하는지 확인할 수 있습니다.
이 앱은 최상단 바에 상점 이름과 주문 아이콘이 있고, 그 아래에는 상품 목록이 표시됩니다. 이 목록은 애플리케이션 로직이 동작하면서 동적으로 표시될 것입니다.

* 왼쪽에 있는 프로젝트 탭에는 애플리케이션을 구성하는 소스 파일들을 확인할 수 있습니다.
프로젝트 환경을 구성하는 파일과 애플리케이션 코드가 이 영역에 표시되며, 파일을 선택하면 가운데에 있는 에디터 탭에 파일의 내용이 표시됩니다.

소스 파일의 구조를 확인하기 전에, 샘플 데이터를 사용해서 HTML *템플릿*에 상품 목록을 어떻게 표시할 수 있는지 알아봅시다.
이 과정을 통해 화면을 수정하고 동적으로 갱신하는 것이 얼마나 편한지 느낄 수 있을 것입니다.

<div class="callout is-helpful">
<!--
<header>StackBlitz tips</header>
-->
<header>StackBlitz 팁</header>

<!--
* Log into StackBlitz so you can save and resume your work.
If you have a GitHub account, you can log into StackBlitz
with that account. In order to save your progress, first
fork the project using the Fork button at the top left,
then you'll be able to save your work to your own StackBlitz
account by clicking the Save button.
* To copy a code example from this tutorial, click the icon
at the top right of the code example box, and then paste the
code snippet from the clipboard into StackBlitz.
* If the StackBlitz preview pane isn't showing what you
expect, save and then click the refresh button.
* StackBlitz is continually improving, so there may be
slight differences in generated code, but the app's
behavior will be the same.
* When you generate the StackBlitz example apps that
accompany the tutorials, StackBlitz creates the starter
files and mock data for you. The files you'll use throughout
the tutorials are in the `src` folder of the StackBlitz
example apps.
-->
* StackBlitz에 로그인하면 작업한 내용을 저장했다가 다시 불러올 수 있습니다.
그리고 이 때 GitHub 계정을 사용해서 로그인 할 수도 있습니다.
최상단 왼쪽의 Fork 버튼을 눌러서 프로젝트를 포크하고 나면, Save 버튼을 눌러서 프로젝트를 저장할 수 있습니다.
* StackBlitz 미리보기 화면에서 확인한 앱 화면이 원하는 대로 나오지 않으면 새로고침 버튼을 눌러보세요.
* StackBlitz는 지속적으로 기능을 업그레이드하고 있습니다. 이 문서에서 설명하는 것과 약간 다른 부분이 있을 수 있지만, 앱 동작에는 문제 없을 것입니다.
* StackBlitz에서 프로젝트를 생성하면 기본 파일과 목 데이터가 함께 구성됩니다. 이 튜토리얼에서 진행하는 내용은 StackBlitz로 만든 프로젝트의 `src` 폴더에서 진행하면 됩니다.

</div>

<div class="alert is-helpful">

<!--
If you go directly to the [StackBlitz online development environment](https://stackblitz.com/) and choose to [start a new Angular workspace](https://stackblitz.com/fork/angular), you get a generic stub application, rather than this [illustrative sample](#new-project). Once you have been introduced to the basic concepts here, this can be helpful for working interactively while you are learning Angular.

In actual development you will typically use the [Angular CLI](guide/glossary#command-line-interface-cli), a powerful command-line tool that lets you generate and modify applications. For more information, see the [CLI Overview](cli).
-->
[StackBlitz 온라인 개발 환경](https://stackblitz.com/)에 직접 들어가서 [start a new Angular workspace](https://stackblitz.com/fork/angular)를 선택하면, 기본 틀이 갖춰진 애플리케이션을 생성할 수 있습니다.
[프로젝트 생성하기](#new-project)에서 설명한 내용을 다 이해하고 Angular 자체를 테스트 해보려면 이 방식을 활용하는 것이 더 좋습니다.

실제 개발 환경에서는 강력한 커맨드 라인 툴인 [Angular CLI](guide/glossary#command-line-interface-cli)를 사용해서 애플리케이션을 생성하고 변경합니다.
자세한 내용은 [CLI 개요](cli) 문서를 참고하세요.

</div>


{@a template-syntax}
<!--
## Template syntax
-->
## 템플릿 문법

<!--
Angular's template syntax extends HTML and JavaScript.
This section introduces template syntax by enhancing the "Products" area.
-->
Angular의 템플릿에 사용하는 문법은 HTML과 JavaScript를 확장한 것입니다.
이 섹션에서는 "Products" 영역을 개발하면서 템플릿 문법에 대해 알아봅시다.

<div class="alert is-helpful">

<!--
To help you get going, the following steps use predefined product data from the `products.ts` file (already created in StackBlitz example) and methods from the `product-list.component.ts` file.
-->
과정을 진행하려면 StackBlitz 예제 앱이 생성한 `products.ts` 파일에 제품 데이터를 준비해야 합니다. 관련 메소드는 `product-list.component.ts` 파일에 정의되어 있습니다.

</div>

<!--
1. In the `product-list` folder, open the template file `product-list.component.html`.

1. Modify the product list template to display a list of product names.

    1. Each product in the list displays the same way, one after another on the page. To iterate over the predefined list of products, put the `*ngFor` directive on a `<div>`, as follows:

      <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.2.html" region="ngfor">
      </code-example>

      With `*ngFor`, the `<div>` repeats for each product in the list.

      <div class="alert is-helpful">

      `*ngFor` is a "structural directive". Structural directives shape or reshape the DOM's structure, typically by adding, removing, and manipulating the elements to which they are attached. Directives with an asterisk, `*`, are structural directives.

      </div>

    1. To display the names of the products, use the interpolation syntax `{{ }}`. Interpolation renders a property's value as text. Inside the `<div>`, add an `<h3>` to display the interpolation of the product's name property:

      <code-example path="getting-started/src/app/product-list/product-list.component.2.html" header="src/app/product-list/product-list.component.html" region="interpolation">
      </code-example>

      The preview pane immediately updates to display the name of each product in the list.
-->
1. `product-list` 폴더에 있는 `product-list.component.html` 파일을 엽니다.

1. 상품의 이름이 화면에 표시되도록 상품 목록 템플릿을 수정합니다.

    1. 목록에 있는 상품은 화면에 쭉 나열하는 방식으로 표시합니다. 상품 목록마다 이 작업을 반복하기 위해 `<div>` 엘리먼트에 `*ngFor` 디렉티브를 다음과 같이 추가합니다:

      <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.2.html" region="ngfor">
      </code-example>

      `*ngFor`를 사용하면 목폭에 있는 상품마다 `<div>`를 반복할 수 있습니다.

      <div class="alert is-helpful">

      `*ngFor`는 "구조 디렉티브(structural directive)"입니다. 구조 디렉티브는 일반적으로 엘리먼트를 DOM에 추가하거나 제거하고, 조작하는 방식으로 동작합니다. 구조 디렉티브는 `*` 문자로 시작합니다.

      </div>

    1. 상품의 이름을 화면에 표시하기 위해 문자열 삽입 문법 `{{ }}`을 사용합니다. 문자열 삽입 문법을 사용하면 프로퍼티 값을 텍스트로 표시할 수 있습니다. `<div>` 엘리먼트 안에 `<h3>` 엘리먼트를 추가하고 이 엘리먼트에 다음과 같이 상품의 이름을 추가합니다:

      <code-example path="getting-started/src/app/product-list/product-list.component.2.html" header="src/app/product-list/product-list.component.html" region="interpolation">
      </code-example>

      그러면 다음과 같이 미리보기 화면에 제품 이름이 표시됩니다:

      <div class="lightbox">
        <img src="generated/images/guide/start/template-syntax-product-names.png" alt="Product names added to list">
      </div>

<!--
1. To make each product name a link to product details, add the `<a>` element and set its title to be the product's name by using the property binding `[ ]` syntax, as follows:

    <code-example path="getting-started/src/app/product-list/product-list.component.2.html" header="src/app/product-list/product-list.component.html">
    </code-example>

    In the preview pane, hold the pointer over a product
    name to see the bound name property value, which is
    the product name plus the word "details".
    Interpolation `{{ }}` lets you render the
    property value as text; property binding `[ ]` lets you
    use the property value in a template expression.
    -->
3. 각 상품 이름마다 상품 상세정보로 이동하는 링크를 연결하기 위해 상품 이름에 `<a>` 엘리먼트를 추가하고 프로퍼티 바인딩 문법 `[]`을 다음과 같이 작성합니다:

    <code-example path="getting-started/src/app/product-list/product-list.component.2.html" header="src/app/product-list/product-list.component.html">
    </code-example>

    미리보기 화면에서 상품 이름 위에 마우스를 올려보면 상품 이름에 "details" 문자열이 붙어서 바인딩 된 것을 확인할 수 있습니다.
    문자열 삽입 문법 `{{ }}`을 사용하면 프로퍼티 값을 텍스트로 렌더링할 수 있으며, 프로퍼티 바인딩 문법 `[ ]`을 사용하면 프로퍼티 값을 템플릿 표현식에 사용할 수 있습니다.

    <div class="lightbox">
      <img src="generated/images/guide/start/template-syntax-product-anchor.png" alt="Product name anchor text is product name property">
    </div>

<!--
4. Add the product descriptions. On the `<p>` element, use an `*ngIf` directive so that Angular only creates the `<p>` element if the current product has a description.
-->
4. 제품 설명을 추가합니다. 이 때 `<p>` 태그에 `*ngIf` 디렉티브를 사용했기 때문에, 실제로 제품 설명이 존재할 때만 `<p>` 태그가 생성됩니다.

    <code-example path="getting-started/src/app/product-list/product-list.component.3.html" header="src/app/product-list/product-list.component.html">
    </code-example>

    <!--
    The app now displays the name and description of each product in the list. Notice that the final product does not have a description paragraph. Because the product's description property is empty, Angular doesn't create the `<p>` element&mdash;including the word "Description".
    -->
    이제 앱은 목록에 있는 상품마다 이름과 간단한 설명을 표시합니다. 다만, 최종 결과물에서는 상품 설명이 표시되지 않습니다. 왜냐하면 상품의 설명이 없는 경우에는 Angular가 "Description"으로 시작하는 `<p>` 엘리먼트 자체를 생성하지 않기 때문입니다.

    <div class="lightbox">
      <img src="generated/images/guide/start/template-syntax-product-description.png" alt="Product descriptions added to list">
    </div>

<!--
5. Add a button so users can share a product with friends. Bind the button's `click` event to the `share()` method (in `product-list.component.ts`). Event binding uses a set of parentheses, `( )`, around the event, as in the following `<button>` element:

    <code-example path="getting-started/src/app/product-list/product-list.component.4.html" header="src/app/product-list/product-list.component.html">
    </code-example>

    Each product now has a "Share" button:

    <div class="lightbox">
      <img src="generated/images/guide/start/template-syntax-product-share-button.png" alt="Share button added for each product">
    </div>

    Test the "Share" button:

    <div class="lightbox">
      <img src="generated/images/guide/start/template-syntax-product-share-alert.png" alt="Alert box indicating product has been shared">
    </div>
-->
5. 사용자가 상품을 다른 사람에게 공유할 수 있는 버튼을 추가해 봅시다. 버튼의 `click` 이벤트를 `product-list.component.ts` 파일에 정의된 `share()` 메소드와 연결하면 됩니다. `<button>` 엘리먼트에서 발생하는 이벤트 중 반응하기를 원하는 이벤트 이름 양쪽에 소괄호 문법 `( )`을 붙이면 이벤트를 바인딩할 수 있습니다:

    <code-example path="getting-started/src/app/product-list/product-list.component.4.html" header="src/app/product-list/product-list.component.html">
    </code-example>

    이제는 각 제품마다 "Share" 버튼이 추가되었습니다:

    <div class="lightbox">
      <img src="generated/images/guide/start/template-syntax-product-share-button.png" alt="Share button added for each product">
    </div>

    "Share" 버튼이 동작하는 것을 확인해 봅시다:

    <div class="lightbox">
      <img src="generated/images/guide/start/template-syntax-product-share-alert.png" alt="Alert box indicating product has been shared">
    </div>

<!--
The app now has a product list and sharing feature.
In the process, you've learned to use five common features of Angular's template syntax:
* `*ngFor`
* `*ngIf`
* Interpolation `{{ }}`
* Property binding `[ ]`
* Event binding `( )`
-->
이제 앱에는 제품 목록이 표시되며 공유할 수 있는 기능도 추가되었습니다.
그리고 이렇게 진행하는 동안 Angular 템플릿 문법 중 자주 사용하는 5가지 기본 기능에 대해 살펴봤습니다:
* `*ngFor`
* `*ngIf`
* 문자열 바인딩(Interpolation) `{{ }}`
* 프로퍼티 바인딩 `[ ]`
* 이벤트 바인딩 `( )`


<div class="alert is-helpful">

<!--
For more information about the full capabilities of Angular's
template syntax, see [Template Syntax](guide/template-syntax "Template Syntax").
-->
Angular의 템플릿 문법은 정말 다양하게 활용할 수 있습니다. [템플릿 문법](guide/template-syntax "Template Syntax") 문서를 참고하세요.

</div>


{@a components}
<!--
## Components
-->
## 컴포넌트(Components)

<!--
*Components* define areas of responsibility in the user interface, or UI,
that let you reuse sets of UI functionality.
You've already built one with the product list component.

A component consists of three things:
* **A component class** that handles data and functionality. In the previous section, the product data and the `share()` method in the component class handle data and functionality, respectively.
* **An HTML template** that determines the UI. In the previous section, the product list's HTML template displays the name, description, and a "Share" button for each product.
* **Component-specific styles** that define the look and feel.
Though product list does not define any styles, this is where component CSS
resides.
-->
*컴포넌트*는 사용자 인터페이스나 UI를 재사용하기 위해 정의한 단위입니다.
이전 섹션에서 만들었던 상품 목록도 컴포넌트입니다.

컴포넌트는 3가지 요소로 구성됩니다:
* **컴포넌트 클래스**는 데이터를 처리하며 로직을 담당합니다. 이전 섹션에서 상품 데이터를 처리하고 `share()` 메소드의 기능을 정의하는 것도 컴포넌트 클래스의 역할입니다.
* **HTML 템플릿**은 UI를 정의합니다. 이전 섹션에서 상품 목록에 있는 상품의 이름과 설명, "Share" 버튼을 표시하는 것은 HTML 템플릿의 역할입니다.
* **컴포넌트 스타일**는 컴포넌트의 모습을 지정합니다. 아직 상품 목록 화면에는 아무 스타일도 지정하지 않았지만, 컴포넌트 CSS를 작성하면 원하는 스타일을 지정할 수 있습니다.

<!--
### Class definition

Let's take a quick look a the product list component's class definition:

1. In the `product-list` directory, open `product-list.component.ts`.

1. Notice the `@Component` decorator. This provides metadata about the component, including its templates, styles, and a selector.

    * The `selector` is used to identify the component. The selector is the name you give the Angular component when it is rendered as an HTML element on the page. By convention, Angular component selectors begin with the prefix such as `app-`, followed by the component name.

    * The template and style filename also are provided here. By convention each of the component's parts is in a separate file, all in the same directory and with the same prefix.

1. The component definition also includes an exported class, which handles functionality for the component. This is where the product list data and `Share()` method are defined.

### Composition
-->

<!--
An Angular application comprises a tree of components, in which each Angular component has a specific purpose and responsibility.

Currently, the example app has three components:
-->
지금까지 작성한 Angular 애플리케이션은 목적에 따라 구별된 3개의 컴포넌트로 구성되어 있습니다.

컴포넌트 구성은 다음과 같습니다:

<div class="lightbox">
  <img src="generated/images/guide/start/app-components.png" alt="Online store with three components">
</div>

<!--
* `app-root` (orange box) is the application shell. This is the first component to load and the parent of all other components. You can think of it as the base page.
* `app-top-bar` (blue background) is the store name and checkout button.
* `app-product-list` (purple box) is the product list that you modified in the previous section.

The next section expands the app's capabilities by adding a new component&mdash;a product alert&mdash;as a child of the product list component.


<div class="alert is-helpful">

For more information about components and how they interact with templates, see [Introduction to Components](guide/architecture-components "Architecture > Introduction to Components").

</div>
-->
* `app-root` (주황색 외곽선)는 애플리케이션 셸입니다. 이 컴포넌트는 처음 로드되는 컴포넌트이며, 모든 컴포넌트의 부모 컴포넌트이기도 합니다. 화면 자체가 이 컴포넌트라고 이해해도 됩니다.
* `app-top-bar` (파란색 배경)에는 온라인 샵의 이름과 주문 버튼이 있습니다.
* `app-product-list` (보라색 외곽선)는 상품의 목록을 표시하기 위해 이전 섹션에서 수정했던 컴포넌트입니다.

다음 섹션에서는 상품 목록 컴포넌트의 자식 컴포넌트로 새로운 컴포넌트를 만들어서 앱 기능을 확장해 봅시다.


<div class="alert is-helpful">

컴포넌트에 대한 내용과 컴포넌트끼리 템플릿에서 상호작용하는 방법에 대해 더 알아보려면 [컴포넌트 소개](guide/architecture-components "Architecture > Introduction to Components") 문서를 참고하세요.

</div>

{@a input}
<!--
## Input
-->
## 입력 프로퍼티

<!--
Currently, the product list displays the name and description of each product.
The product list component also defines a `products` property that contains imported data for each product from the `products` array in `products.ts`.

The next step is to create a new alert feature that takes a product as an input. The alert checks the product's price, and, if the price is greater than $700, displays a "Notify Me" button that lets users sign up for notifications when the product goes on sale.

1. Create a new product alerts component.

    1. Right click on the `app` folder and use the `Angular Generator` to generate a new component named `product-alerts`.

        <div class="lightbox">
          <img src="generated/images/guide/start/generate-component.png" alt="StackBlitz command to generate component">
        </div>

        The generator creates starter files for all three parts of the component:
        * `product-alerts.component.ts`
        * `product-alerts.component.html`
        * `product-alerts.component.css`

1. Open `product-alerts.component.ts`.

    <code-example header="src/app/product-alerts/product-alerts.component.ts" path="getting-started/src/app/product-alerts/product-alerts.component.1.ts" region="as-generated"></code-example>

    1. Notice the `@Component()` decorator. This indicates that the following class is a component. It provides metadata about the component, including its selector, templates, and styles.

        * The `selector` identifies the component. The selector is the name you give the Angular component when it is rendered as an HTML element on the page. By convention, Angular component selectors begin with the prefix `app-`, followed by the component name.

        * The template and style filenames reference the HTML and CSS files that StackBlitz generates.

    1. The component definition also exports the class, `ProductAlertsComponent`, which handles functionality for the component.

1. Set up the new product alerts component to receive a product as input:

    1. Import `Input` from `@angular/core`.

        <code-example path="getting-started/src/app/product-alerts/product-alerts.component.1.ts" region="imports" header="src/app/product-alerts/product-alerts.component.ts"></code-example>

    1. In the `ProductAlertsComponent` class definition, define a property named `product` with an `@Input()` decorator. The `@Input()` decorator indicates that the property value passes in from the component's parent, the product list component.

        <code-example path="getting-started/src/app/product-alerts/product-alerts.component.1.ts" region="input-decorator" header="src/app/product-alerts/product-alerts.component.ts"></code-example>

1. Define the view for the new product alert component.

    1. Open the `product-alerts.component.html` template and replace the placeholder paragraph with a "Notify Me" button that appears if the product price is over $700.

    <code-example header="src/app/product-alerts/product-alerts.component.html" path="getting-started/src/app/product-alerts/product-alerts.component.1.html"></code-example>

1. Display the new product alert component as a child of the product list.

    1. Open `product-list.component.html`.

    1. To include the new component, use its selector, `app-product-alerts`, as you would an HTML element.

    1. Pass the current product as input to the component using property binding.

        <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.5.html" region="app-product-alerts"></code-example>

The new product alert component takes a product as input from the product list. With that input, it shows or hides the "Notify Me" button, based on the price of the product. The Phone XL price is over $700, so the "Notify Me" button appears on that product.
-->
지금까지 작성한 앱에서는 상품 목록에 있는 상품마다 이름과 설명이 화면에 표시됩니다.
그래서 상품 목록 컴포넌트의 `products` 프로퍼티에는 `products.ts` 파일의 `products` 배열에서 가져온 상품 데이터가 저장되어 있습니다.

이제부터는 상품에 대한 알림 기능을 추가해 봅시다.
이 알림 기능은 상품의 가격을 확인하고 상품 가격이 $700 이상이면 "Notify Me" 버튼을 화면에 표시해서, 이 상품을 세일할 때 사용자에게 알리는 방식으로 동작할 것입니다.

1. 상품 알림 컴포넌트를 생성합니다.

    1. `app` 폴더에 마우스 오른쪽 버튼을 클릭하고 `Angular Generator`를 사용해서 새 컴포넌트를 생성합니다. 컴포넌트 이름은 `product-alerts`으로 지정합니다.

        <div class="lightbox">
          <img src="generated/images/guide/start/generate-component.png" alt="StackBlitz command to generate component">
        </div>

        그러면 다음과 같이 3개의 파일이 생성됩니다:
        * `product-alerts.component.ts`
        * `product-alerts.component.html`
        * `product-alerts.component.css`

1. `product-alerts.component.ts` 파일을 엽니다.

    <code-example header="src/app/product-alerts/product-alerts.component.ts" path="getting-started/src/app/product-alerts/product-alerts.component.1.ts" region="as-generated"></code-example>

    1. `@Component()` 데코레이터가 사용된 것을 확인해 보세요. 이 데코레이터가 지정된 클래스는 컴포넌트로 동작합니다. 그래서 이 데코레이터에는 컴포넌트가 동작하는데 필요한 셀렉터나 템플릿, 스타일 파일이 메타데이터로 지정됩니다.

        * `selector`는 컴포넌트를 구분하는 문자열입니다. 셀렉터는 화면에 Angular 컴포넌트를 HTML 엘리먼트처럼 렌더링하기 위해 지정한 이름이며, 일반적으로 `app-` 라는 접두사가 붙습니다. 접두사 뒤에 붙는 것이 실제 컴포넌트 이름입니다.

        * 템플릿과 스타일 파일 이름은 StackBlitz로 프로젝트를 생성할 때 자동으로 지정된 것입니다.

    1. 컴포넌트로 선언된 `ProductAlertsComponent` 클래스는 `export`로 지정되었습니다. 이제 컴포넌트 외부에서도 컴포넌트를 조작할 수 있습니다.

1. 새로 만든 컴포넌트가 상품을 입력 프로퍼티로 받을 수 있도록 작성합니다:

    1. `@angular/core` 패키지에 있는 `Input` 심볼을 로드합니다.

        <code-example path="getting-started/src/app/product-alerts/product-alerts.component.1.ts" region="imports" header="src/app/product-alerts/product-alerts.component.ts"></code-example>

    1. `ProductAlertsComponent` 클래스에 있는 `product` 프로퍼티에 `@Input()` 데코레이터를 추가합니다. `@Input()` 데코레이터를 사용하면 이 프로퍼티의 값이 부모 컴포넌트인 상품 목록 컴포넌트에서 전달된다는 것을 의미합니다.

        <code-example path="getting-started/src/app/product-alerts/product-alerts.component.1.ts" region="input-decorator" header="src/app/product-alerts/product-alerts.component.ts"></code-example>

1. 상품 알림 컴포넌트와 관련된 화면을 정의합니다.

    1. 템플릿 파일 `products-alerts.component.html`을 열고 상품의 가격이 $700 이상일 때만 "Notify Me" 버튼을 표시하도록 `<p>` 엘리먼트를 다음과 같이 수정합니다.

    <code-example header="src/app/product-alerts/product-alerts.component.html" path="getting-started/src/app/product-alerts/product-alerts.component.1.html"></code-example>

1. 상품 목록 컴포넌트의 자식 컴포넌트로 상품 알림 컴포넌트를 추가합니다.

    1. `product-list.component.html` 파일을 엽니다.

    1. 새로 만든 컴포넌트를 추가하기 위해 이 컴포넌트의 셀렉터인 `app-product-alerts`를 템플릿에 추가합니다.

    1. 프로퍼티 바인딩을 사용해서 상품을 이 컴포넌트의 입력 프로퍼티로 연결합니다.

        <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.5.html" region="app-product-alerts"></code-example>

이제 상품 알림 컴포넌트는 상품 목록 컴포넌트가 전달하는 상품 데이터를 입력 프로퍼티로 받고 이 상품 데이터에 따라 "Notify Me" 버튼을 표시합니다. 그래서 Phone XL 상품의 가격은 $700 이상이기 때문에 "Notify Me" 버튼이 표시되는 것을 확인할 수 있습니다.

<div class="lightbox">
  <img src="generated/images/guide/start/product-alert-button.png" alt="Product alert button added to products over $700">
</div>

<div class="alert is-helpful">

<!--
See [Component Interaction](guide/component-interaction "Components & Templates > Component Interaction") for more information about passing data from a parent to child component, intercepting and acting upon a value from the parent, and detecting and acting on changes to input property values.
-->
부모 컴포넌트에서 자식 컴포넌트로 데이터를 전달하는 방법, 이 데이터에 따라 다르게 동작하는 방법, 입력 프로퍼티 값이 변경된 것을 감지하고 반응하는 방법에 대해 더 알아보려면 [컴포넌트 상호작용](guide/component-interaction "Components & Templates > Component Interaction") 문서를 참고하세요.


</div>


{@a output}

<!--
## Output
-->
## 출력 프로퍼티

<!--
To make the "Notify Me" button work, you need to configure two things:

  - the product alert component to emit an event when the user clicks "Notify Me"
  - the product list component to act on that event

1. Open `product-alerts.component.ts`.

1. Import `Output` and `EventEmitter` from `@angular/core`:

    <code-example header="src/app/product-alerts/product-alerts.component.ts" path="getting-started/src/app/product-alerts/product-alerts.component.ts" region="imports"></code-example>

1. In the component class, define a property named `notify` with an `@Output()` decorator and an instance of `EventEmitter()`. This allows the product alert component to emit an event when the value of the notify property changes.

<div class="alert is-helpful">

  When the Angular CLI generates a new component, it includes an empty constructor, the `OnInit` interface, and the `ngOnInit()` method.
  Since the following example isn't using them, they are omitted here for brevity.

</div>

    <code-example path="getting-started/src/app/product-alerts/product-alerts.component.ts" header="src/app/product-alerts/product-alerts.component.ts" region="input-output"></code-example>

1. In the product alert template, `product-alerts.component.html`, update the "Notify Me" button with an event binding to call the `notify.emit()` method.

    <code-example header="src/app/product-alerts/product-alerts.component.html" path="getting-started/src/app/product-alerts/product-alerts.component.html"></code-example>

1. Next, define the behavior that should happen when the user clicks the button. Recall that it's the parent, product list component&mdash;not the product alerts component&mdash;that acts when the child raises the event. In  `product-list.component.ts`, define an `onNotify()` method, similar to the `share()` method:

    <code-example header="src/app/product-list/product-list.component.ts" path="getting-started/src/app/product-list/product-list.component.ts" region="on-notify"></code-example>

1. Finally, update the product list component to receive output from the product alerts component.

    In `product-list.component.html`, bind the `app-product-alerts` component (which is what displays the "Notify Me" button) to the `onNotify()` method of the product list component.

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.6.html" region="on-notify"></code-example>

1. Try the "Notify Me" button:

    <div class="lightbox">
      <img src="generated/images/guide/start/product-alert-notification.png" alt="Product alert notification confirmation dialog">
    </div>
-->
"Notify Me" 버튼이 제대로 동작하려면 다음 두 가지를 설정해야 합니다:

  - 사용자가 "Notify Me" 버튼을 클릭하면 상품 알림 컴포넌트에서 이벤트를 발생시킵니다.
  - 상품 목록 컴포넌트가 이 이벤트를 받아 반응해야 합니다.

1. `product-alerts.component.ts` 파일을 엽니다.

1. `@angular/core` 패키지에 있는 `Output` 심볼과 `EventEmitter` 심볼을 로드합니다:

    <code-example header="src/app/product-alerts/product-alerts.component.ts" path="getting-started/src/app/product-alerts/product-alerts.component.ts" region="imports"></code-example>

1. 컴포넌트 클래스에 `EventEmitter()` 타입으로 `notify` 프로퍼티를 선언하고 이 프로퍼티에 `@Output()` 데코레이터를 지정합니다. 그러면 이 프로퍼티를 통해 컴포넌트 외부로 이벤트를 보낼 수 있습니다.

<div class="alert is-helpful">

  Angular CLI로 컴포넌트를 만들면 이 컴포넌트의 생성자에는 아무 코드도 없으며, 컴포넌트 클래스가 `OnInit` 인터페이스를 확장하기 때문에 `ngOnInit()` 메소드도 기본으로 생성됩니다. 아래 예제에서 이 코드를 활용하지만 않지만, 당장은 무시해도 됩니다.

</div>

    <code-example path="getting-started/src/app/product-alerts/product-alerts.component.ts" header="src/app/product-alerts/product-alerts.component.ts" region="input-output"></code-example>

1. 상품 알림 템플릿 파일 `product-alerts.component.html` 에서 "Notify Me" 버튼을 클릭하면 이벤트를 보낼 수 있도록 `notify.emit()` 메소드를 다음과 같이 작성합니다.

    <code-example header="src/app/product-alerts/product-alerts.component.html" path="getting-started/src/app/product-alerts/product-alerts.component.html"></code-example>

1. 이제 사용자가 버튼을 클릭했을 때 처리할 로직을 추가합니다. 이 로직은 이벤트를 발생시킨 상품 알림 컴포넌트가 아니라 부모 컴포넌트인 상품 목록 컴포넌트에 구현합니다. `product-list.component.ts` 파일에 `onNotify()` 메소드를 다음과 같이 구현합니다. 이전에 작성했던 `share()` 메소드와 비슷합니다:

    <code-example header="src/app/product-list/product-list.component.ts" path="getting-started/src/app/product-list/product-list.component.ts" region="on-notify"></code-example>

1. 마지막으로 상품 알림 컴포넌트에서 보낸 출력 프로퍼티를 상품 목록 컴포넌트가 받을 수 있도록 수정합니다.

    `product-list.component.html` 파일에서 `app-product-alerts` 컴포넌트와 `onNotify()` 메소드를 다음과 같이 바인딩합니다.

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.6.html" region="on-notify"></code-example>

1. 이제 "Notify Me" 버튼을 눌러보세요:

    <div class="lightbox">
      <img src="generated/images/guide/start/product-alert-notification.png" alt="Product alert notification confirmation dialog">
    </div>


<div class="alert is-helpful">

<!--
See [Component Interaction](guide/component-interaction "Components & Templates > Component Interaction") for more information about listening for events from child components, reading child properties or invoking child methods, and using a service for bi-directional communication between components.
-->
자식 컴포넌트에서 발생한 이벤트를 감지하는 방법, 자식 컴포넌트의 프로퍼티를 참조하거나 메소드를 실행하는 방법, 서비스를 사용해서 부모 컴포넌트와 자식 컴포넌트가 양방향으로 연결하는 방법에 대해 더 알아보려면 [컴포넌트 상호작용](guide/component-interaction "Components & Templates > Component Interaction") 문서를 참고하세요.

</div>


{@a next-steps}
<!--
## Next steps
-->
## 다음 단계

<!--
Congratulations! You've completed your first Angular app!

You have a basic online store catalog with a product list, "Share" button, and "Notify Me" button.
You've learned about the foundation of Angular: components and template syntax.
You've also learned how the component class and template interact, and how components communicate with each other.

To continue exploring Angular, choose either of the following options:
* [Continue to the "Routing" section](start/routing "Getting Started: Routing") to create a product details page that can be accessed by clicking a product name and that has its own URL pattern.
* [Skip ahead to the "Deployment" section](start/deployment "Getting Started: Deployment") to move to local development, or deploy your app to Firebase or your own server.
-->
축하합니다! 첫번째 Angular 앱을 완성했습니다!

지금까지 작성한 온라인 쇼핑몰 앱에는 제품 목록 화면, "Share" 버튼, "Notify Me" 버튼이 존재합니다.
그리고 이렇게 작성하는 동안 Angular 앱을 개발하는 기본 지식인 컴포넌트와 템플릿 문법에 대해 알아봤습니다.
컴포넌트 클래스와 템플릿이 상호작용하는 방법, 컴포넌트가 다른 컴포넌트와 상호작용하는 방법도 알아봤습니다.

이제 Angular에 대해 더 알아보기 위해 다음 코스 중 하나를 선택해 보세요:
* 제품 목록 화면에서 제품 이름을 클릭했을 때 표시되는 제품 상세정보 화면을 만들려면 ["라우팅"](start/start-routing "시작하기: 라우팅") 문서를 참고하세요.
* 로컬 개발환경에 대해서 알아보거나 Angular 앱을 Firebase나 리모트 서버에 배포하는 방법에 대해 알아보려면 쭉 건너뛰고 ["배포"](start/start-deployment "시작하기: 배포") 문서를 참고하세요.
