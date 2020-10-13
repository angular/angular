<!--
# SVG in templates
-->
# SVG를 템플릿으로 사용하기

<!--
It is possible to use SVG as valid templates in Angular. All of the template syntax below is
applicable to both SVG and HTML. Learn more in the SVG [1.1](https://www.w3.org/TR/SVG11/) and
[2.0](https://www.w3.org/TR/SVG2/) specifications.

<div class="alert is-helpful">

See the <live-example name="template-syntax"></live-example> for a working example containing the code snippets in this guide.

</div>

Why would you use SVG as template, instead of simply adding it as image to your application?

When you use an SVG as the template, you are able to use directives and bindings just like with HTML
templates. This means that you will be able to dynamically generate interactive graphics.

Refer to the sample code snippet below for a syntax example:

<code-example path="template-syntax/src/app/svg.component.ts" header="src/app/svg.component.ts"></code-example>

Add the following code to your `svg.component.svg` file:

<code-example path="template-syntax/src/app/svg.component.svg" header="src/app/svg.component.svg"></code-example>

Here you can see the use of a `click()` event binding and the property binding syntax
(`[attr.fill]="fillColor"`).
-->
Angular에서는 SVG를 템플릿으로 사용하는 것도 가능합니다.
SVG에서도 HTML 문서와 마찬가지로 모든 템플릿 문법을 사용할 수 있습니다.
SVG 문법에 대해 자세하게 알아보려면 [1.1](https://www.w3.org/TR/SVG11/) 스펙 문서와 [2.0](https://www.w3.org/TR/SVG2/) 스펙 문서를 참고하세요.

<div class="alert is-helpful">

이 문서에서 다루는 예제는 <live-example name="template-syntax"></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

</div>

SVG 파일을 단순하게 이미지로 사용하지 않고 왜 템플릿으로 사용할까요?

SVG를 템플릿으로 사용하면 HTML 템플릿과 마찬가지로 SVG 엘리먼트에 디렉티브나 바인딩 표현식을 사용할 수 있습니다.
이 말은 화면에 표시되는 이미지 객체를 동적으로 조작할 수 있다는 것을 의미합니다.

이런 컴포넌트가 있다고 합시다:

<code-example path="template-syntax/src/app/svg.component.ts" header="src/app/svg.component.ts"></code-example>

이 컴포넌트의 템플릿으로 사용되는 `svg.component.svg` 파일의 내용은 이렇습니다:

<code-example path="template-syntax/src/app/svg.component.svg" header="src/app/svg.component.svg"></code-example>

이 템플릿 파일을 보면 이벤트 바인딩 문법(`click()`)과 프로퍼티 바인딩 문법(`[attr.fill]="fillColor"`)이 사용된 것을 확인할 수 있습니다.