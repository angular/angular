<!--
# Display a Heroes List
-->
# 히어로 목록 표시하기

<!--
In this page, you'll expand the Tour of Heroes app to display a list of heroes, and
allow users to select a hero and display the hero's details.
-->

이번 튜토리얼에서는 히어로의 목록을 화면에 표시하고, 이 중에서 히어로 하나를 선택해서 상세 정보를  표시하도록 히어로들의 여행 앱을 수정해 봅시다.

<!--
## Create mock heroes
-->
## 히어로 목(mock) 생성하기

<!--
You'll need some heroes to display.
-->
먼저, 히어로의 목록을 화면에 표시할 때 사용할 히어로 데이터가 필요합니다.

<!--
Eventually you'll get them from a remote data server.
For now, you'll create some _mock heroes_ and pretend they came from the server.
-->
최종적으로는 리모트 데이터 서버에서 데이터를 받아올 것입니다.
하지만 지금은 _히어로 목_ 을 생성하고 이 데이터들을 서버에서 받아온 것으로 간주합시다.

<!--
Create a file called `mock-heroes.ts` in the `src/app/` folder.
Define a `HEROES` constant as an array of ten heroes and export it.
The file should look like this.
-->
`src/app/`에 `mock-heroes.ts`파일을 생성합니다.
이 파일에 `HEROES` 배열을 상수로 선언하고 다른 파일에서 참조할 수 있도록 파일 외부로 공개할 것입니다.
파일의 내용은 다음과 같이 작성합니다.

<code-example path="toh-pt2/src/app/mock-heroes.ts" linenums="false"
header="src/app/mock-heroes.ts">
</code-example>

<!--
## Displaying heroes
-->
## 히어로 표시하기

<!--
You're about to display the list of heroes at the top of the `HeroesComponent`.
-->
이제 `HeroesComponent` 위쪽에 히어로의 목록을 표시해 봅시다.

<!--
Open the `HeroesComponent` class file and import the mock `HEROES`.
-->
`HeroesComponent` 클래스 파일을 열고 `HEROES` 목 데이터를 로드합니다.

<!--
<code-example path="toh-pt2/src/app/heroes/heroes.component.ts" region="import-heroes" header="src/app/heroes/heroes.component.ts (import HEROES)">
-->
<code-example path="toh-pt2/src/app/heroes/heroes.component.ts" region="import-heroes" header="src/app/heroes/heroes.component.ts (HEROES 로드)">
</code-example>

<!--
In the same file (`HeroesComponent` class), define a component property called `heroes` to expose `HEROES` array for binding.
-->
그리고 클래스에 `heroes` 프로퍼티를 선언하고 위에서 로드한 `HEROES` 배열을 바인딩합니다.

<code-example path="toh-pt2/src/app/heroes/heroes.component.ts" region="component">
</code-example>

<!--
### List heroes with _*ngFor_
-->
### _*ngFor_ 로 히어로 목록 표시하기

<!--
Open the `HeroesComponent` template file and make the following changes:
-->
`HeroesComponent` 템플릿 파일을 열고 다음과 같이 수정합니다:

<!--
* Add an `<h2>` at the top, 
* Below it add an HTML unordered list (`<ul>`)
* Insert an `<li>` within the `<ul>` that displays properties of a `hero`.
* Sprinkle some CSS classes for styling (you'll add the CSS styles shortly).
-->

* 제일 위에 `<h2>`를 추가합니다.
* 그 밑에 순서 없는 목록 HTML 태그(`<ul>`)를 추가합니다.
* `<ul>`태그 사이에 `<li>`를 추가해서 `hero`의 프로퍼티를 표시합니다.
* 스타일을 지정하기 위해 CSS 클래스를 추가합니다.(CSS 스타일은 조금 뒤에 추가합니다.)

<!--
Make it look like this:
-->
그러면 다음과 같은 템플릿이 구성됩니다:

<!--
<code-example path="toh-pt2/src/app/heroes/heroes.component.1.html" region="list" header="heroes.component.html (heroes template)" linenums="false">
-->
<code-example path="toh-pt2/src/app/heroes/heroes.component.1.html" region="list" header="heroes.component.html (heroes 템플릿)" linenums="false">
</code-example>

<!--
Now change the `<li>` to this:
-->
그리고 `<li>`태그를 다음 코드처럼 수정합니다.

<code-example path="toh-pt2/src/app/heroes/heroes.component.1.html" region="li">
</code-example>

<!--
The [`*ngFor`](guide/template-syntax#ngFor) is Angular's _repeater_ directive. 
It repeats the host element for each element in a list.
-->
[`*ngFor`](guide/template-syntax#ngFor)는 _항목을 반복하는_ Angular 디렉티브입니다.
이 디렉티브는 목록에 있는 항목마다 호스트 엘리먼트를 반복합니다.

<!--
In this example

* `<li>` is the host element
* `heroes` is the list from the `HeroesComponent` class.
* `hero` holds the current hero object for each iteration through the list. 
-->

이 예제에서
 
* 호스트 엘리먼트는 `<li>`입니다.
* `heroes`는 `HeroesComponent` 클래스에 선언된 목록입니다.
* `hero`는 목록을 순회할 때마다 할당되는 히어로 객체입니다.

<div class="alert is-important">
<!--
Don't forget the asterisk (*) in front of `ngFor`. It's a critical part of the syntax.
-->
`ngFor`앞에 별표(*)가 붙는 것에 주의하세요. 이 문법은 아주 중요합니다.
</div>

<!--
After the browser refreshes, the list of heroes appears.
-->
이제 브라우저가 갱신되면 히어로의 목록이 화면에 표시됩니다.

{@a styles}

<!--
### Style the heroes
-->
### 히어로 꾸미기

<!--
The heroes list should be attractive and should respond visually when users 
hover over and select a hero from the list.
-->
히어로 목록은 보기 좋게 표시하는 것이 좋으며, 사용자가 어떤 항목에 마우스를 올리거나 선택하면 시각적인 반응을 보여주는 것도 좋습니다.

<!--
In the [first tutorial](tutorial/toh-pt0#app-wide-styles), you set the basic styles for the entire application in `styles.css`.
That stylesheet didn't include styles for this list of heroes.
-->
[첫번째 튜토리얼](tutorial/toh-pt0#app-wide-styles)에서는 `styles.css` 파일에 애플리케이션 전역 스타일을 지정했습니다.
하지만 이 스타일시트에는 히어로의 목록을 꾸미는 스타일이 존재하지 않습니다.

<!--
You could add more styles to `styles.css` and keep growing that stylesheet as you add components.
-->
이 때 `styles.css`에 더 많은 스타일을 추가할 수도 있지만, 이렇게 작성하면 컴포넌트를 추가할때마다 스타일시트의 내용이 점점 많아집니다.

<!--
You may prefer instead to define private styles for a specific component and keep everything a component needs&mdash; the code, the HTML,
and the CSS &mdash;together in one place.
-->
이 방식보다는 컴포넌트와 관련된 파일&mdash; 클래스 코드, HTML, CSS &mdash;을 한 곳에서 관리하면서 특정 컴포넌트에만 해당하는 스타일을 따로 정의하는 것이 더 좋습니다.

<!--
This approach makes it easier to re-use the component somewhere else
and deliver the component's intended appearance even if the global styles are different.
-->
이렇게 구현하면 컴포넌트를 재사용하기 편해지며 전역 스타일이 변경되더라도 컴포넌트 스타일은 영향을 받지 않습니다.

<!--
You define private styles either inline in the `@Component.styles` array or
as stylesheet file(s) identified in the `@Component.styleUrls` array.
-->
컴포넌트에 적용되는 스타일은 `@Component.styles` 배열에서 인라인으로 정의하거나, 여러 파일에 작성하고 `@Component.styleUrls` 배열로 지정할 수 있습니다.

<!--
When the CLI generated the `HeroesComponent`, it created an empty `heroes.component.css` stylesheet for the `HeroesComponent`
and pointed to it in `@Component.styleUrls` like this.
-->
Angular CLI로 `HeroesComponent`를 생성하면 이 컴포넌트에 스타일을 지정하는 `heroes.component.css` 파일을 자동으로 생성하고 `@Component.styleUrls` 목록에 추가합니다.

<code-example path="toh-pt2/src/app/heroes/heroes.component.ts" region="metadata"
 header="src/app/heroes/heroes.component.ts (@Component)">
</code-example>

<!--
Open the `heroes.component.css` file and paste in the private CSS styles for the `HeroesComponent`.
You'll find them in the [final code review](#final-code-review) at the bottom of this guide.
-->
그러면 `heroes.component.css` 파일을 열어서 `HeroesComponent`에 적용되는 CSS 스타일을 작성할 수 있습니다.
지금은 이 코드를 생략합니다. 이 파일의 내용은 이 문서의 아래쪽 [최종-코드-리뷰](#final-code-review)에서 확인할 수 있습니다.

<div class="alert is-important">

<!--
Styles and stylesheets identified in `@Component` metadata are scoped to that specific component.
The `heroes.component.css` styles apply only to the `HeroesComponent` and don't affect the outer HTML or the HTML in any other component.
-->
`@Component` 메타데이터에 지정된 스타일과 스타일시트 파일은 이 컴포넌트에만 적용됩니다.
그래서 `heroes.component.css`에 정의된 스타일은 `HeroesComponent`에만 적용되며 이 컴포넌트 밖에 있는 HTML 이나 다른 컴포넌트에 영향을 주지 않습니다.
</div>

<!--
## Master/Detail
-->
## 마스터/디테일

<!--
When the user clicks a hero in the **master** list, 
the component should display the selected hero's **details** at the bottom of the page.
-->

**마스터**목록에서 히어로를 클릭할 경우, 컴포넌트는 선택된 히어로의 **상세화면**을 화면 하단에 표시합니다.

<!--
In this section, you'll listen for the hero item click event
and update the hero detail.
-->
이번 섹션에서는 히어로 항목에서 클릭 이벤트를 수신하여 히어로 상세화면을 업데이트하는 것을 배워보겠습니다.

<!--
### Add a click event binding
-->
### 클릭 이벤트 바인딩하기

<!--
Add a click event binding to the `<li>` like this:
-->
`<li>`태그에 아래와 같이 클릭 이벤트 바인딩을 추가합니다.

<code-example path="toh-pt2/src/app/heroes/heroes.component.1.html" region="selectedHero-click" header="heroes.component.html (template excerpt)" linenums="false">
</code-example>

<!--
This is an example of Angular's [event binding](guide/template-syntax#event-binding) syntax.
-->
위 코드는 Angular의 [이벤트 바인딩](guide/template-syntax#이벤트-바인딩) 문법입니다.

<!--
The parentheses around `click` tell Angular to listen for the `<li>` element's  `click` event.
When the user clicks in the `<li>`, Angular executes the `onSelect(hero)` expression.
-->
`click`주변의 괄호들은 Angular에게 `<li>`엘리먼트의 `click`이벤트를 수신하라고 알려줍니다.
`<li>`을 클릭하면 Angular는 `onSelect(hero)`표현식을 실행합니다.

<!--
`onSelect()` is a `HeroesComponent` method that you're about to write.
Angular calls it with the `hero` object displayed in the clicked `<li>`,
the same `hero` defined previously in the `*ngFor` expression.
-->

`onSelect()`는 앞으로 작성하게 될 `HeroesComponent`의 메소드입니다.
Angular는 선택된 `<li>`에 표시된 `hero` 객체를 파라미터로 하여 이 함수를 호출합니다. 
여기서 `hero`객체는 `*ngFor` 표현식에서 정의되어 있는 것과 같은 객체입니다.

<!--
### Add the click event handler
-->
### 클릭 이벤트 핸들러 추가하기


<!--
Rename the component's `hero` property to `selectedHero` but don't assign it.
There is no _selected hero_ when the application starts.
-->

컴포넌트의 `hero`의 프로퍼티의 이름을 `selectedHero`로 변경하고 할당하지 마세요.
애플리케이션이 실행될 때는 _선택된 히어로_ 는 없습니다.

<!--
Add the following `onSelect()` method, which assigns the clicked hero from the template
to the component's `selectedHero`.
-->

그 다음 `onSelect()`메소드를 추가합니다. 이 메소드는 템플릿에서 선택된 히어로를 컴포넌트의 `selectedHero` 변수에 할당합니다.

<code-example path="toh-pt2/src/app/heroes/heroes.component.ts" region="on-select" header="src/app/heroes/heroes.component.ts (onSelect)" linenums="false">
</code-example>

<!--
### Update the details template
-->
### 상세화면 템플릿 업데이트 하기

<!--
The template still refers to the component's old `hero` property which no longer exists. 
Rename `hero` to `selectedHero`.
-->

템플릿에서는 더이상 존재하지 않는 컴포넌트의 이전 `hero`프로퍼티를 여전히 참조하고 있습니다.
`hero`를 `selectedHero`로 변경합니다.

<code-example path="toh-pt2/src/app/heroes/heroes.component.html" region="selectedHero-details" header="heroes.component.html (selected hero details)" linenums="false">
</code-example>

<!--
### Hide empty details with _*ngIf_
-->
### _*ngIf_ 를 활용하여 비어있는 상세화면 가리기

<!--
After the browser refreshes, the application is broken.
-->
브라우저가 갱신되면 애플리케이션은 더이상 동작하지 않습니다.

<!--
Open the browser developer tools and look in the console for an error message like this:
-->
브라우저의 개발자 도구를 열어 콘솔창에서 아래와 같은 에러 메세지를 확인하세요.

<code-example language="sh" class="code-shell">
  HeroesComponent.html:3 ERROR TypeError: Cannot read property 'name' of undefined
</code-example>

<!--
Now click one of the list items.
The app seems to be working again.
The heroes appear in a list and details about the clicked hero appear at the bottom of the page.
-->

자 이제 목록의 아이템 중 하나를 선택하세요.
앱이 다시 정상적으로 동작하는 것을 확인할 수 있습니다.
히어로들이 목록에 표시되며 선택한 히어로의 상세화면은 페이지의 하단에 표시됩니다.

<!--
#### What happened?
-->
#### 무슨 일이 일어난걸까요?

<!--
When the app starts, the `selectedHero` is `undefined` _by design_.
-->
앱이 시작되고나면 `selectedHero`는 _설계에 따라_ `undefined`입니다.

<!--
Binding expressions in the template that refer to properties of `selectedHero` &mdash; expressions like `{{selectedHero.name}}` &mdash; _must fail_ because there is no selected hero.
-->
&mdash; `{{selectedHero.name}}` 와 같이 &mdash; 템플릿에서 `selectedHero`의 프로퍼티들을 참고하고 있는 바인딩 표현식은 선택된 히어로가 존재하지 않기 때문에 _절대 동작하지 않습니다._

<!--
#### The fix
-->
#### 수정하기

<!--
The component should only display the selected hero details if the `selectedHero` exists.
-->
컴포넌트는 `selectedHero`가 존재할때만 선택된 히어로의 상세화면을 보여줘야 합니다.

<!--
Wrap the hero detail HTML in a `<div>`.
Add Angular's `*ngIf` directive to the `<div>` and set it to `selectedHero`.
-->

히어로 디테일 HTML을 `<div>`로 감쌉니다.
Angular의  `*ㅜngif`디렉티브를 `<div>`에 추가하고 `selectedHero`를 설정합니다. 

<div class="alert is-important">
<!--
Don't forget the asterisk (*) in front of `ngIf`. It's a critical part of the syntax.
-->
`ngIf`앞에 별표(*)를 추가하는 것을 잊지마세요. 이는 문법에서 중요한 요소입니다.
</div>

<code-example path="toh-pt2/src/app/heroes/heroes.component.html" region="ng-if" header="src/app/heroes/heroes.component.html (*ngIf)" linenums="false">
</code-example>

<!--
After the browser refreshes, the list of names reappears.
The details area is blank.
Click a hero and its details appear.
-->

브라우저가 갱신되고 나면, 히어로의 이름 목록이 다시 표시됩니다.
상세화면 영역은 비어있습니다.
히어로 한명을 선택하면 상세화면이 나타납니다.

<!--
#### Why it works
-->
#### 어떻게 동작하는 것일까요?

<!--
When `selectedHero` is undefined, the `ngIf` removes the hero detail from the DOM. There are no `selectedHero` bindings to worry about.
-->

`selectedHero`가 undefined일때, `ngIf`는 히어로의 상세화면을 DOM에서 삭제합니다. 그래서 `selectedHero` 바인딩으로 인한 오류는 더이상 걱정할 필요는 없습니다.

<!--
When the user picks a hero, `selectedHero` has a value and
`ngIf` puts the hero detail into the DOM.
-->

히어로를 선택하면 `selectedHero`변수는 값을 가지고 되고 `ngIf`는 히어로 상세화면을 DOM에 추가합니다.

<!--
### Style the selected hero
-->
### 선택된 히어로 디자인하기

<!--
It's difficult to identify the _selected hero_ in the list when all `<li>` elements look alike.
-->

모든 `<li>`엘리먼트들이 똑같이 생겼다면 _선택된 히어로_ 를 목록에서 구분하기는 힘듭니다.

<!--
If the user clicks "Magneta", that hero should render with a distinctive but subtle background color like this:
-->
만약 "Magenta"를 선택하면, 선택된 히어로는 다음과 같은 독특하지만 미묘한 배경색으로 표시됩니다.

<figure>

  <img src='generated/images/guide/toh/heroes-list-selected.png' alt="Selected hero">

</figure>

<!--
That _selected hero_ coloring is the work of the `.selected` CSS class in the [styles you added earlier](#styles).
You just have to apply the `.selected` class to the `<li>` when the user clicks it.
-->

_선택된 히어로_ 의 색은 [이전에 추가한 스타일](#styles)에 선언된 `.selected` CSS 클래스가 적용된 결과입니다.
`<li>`를 선택하면 `.selected` 클래스가 적용됩니다.

<!--
The Angular [class binding](guide/template-syntax#class-binding) makes it easy to add and remove a CSS class conditionally. 
Just add `[class.some-css-class]="some-condition"` to the element you want to style.
-->

Angular의 [클래스 바인딩](guide/template-syntax#클래스-바인딩)은 CSS 클래스를 조건에 따라 추가하거나 제거하는 것을 도와줍니다.
디자인하고 싶은 엘리먼트에 `[class.some-css-class]="some-condition"`만 추가하면 됩니다.

<!--
Add the following `[class.selected]` binding to  the `<li>` in the `HeroesComponent` template:
-->
아래의 `[class.selected]` 바인딩을 `HeroesComponent` 템플릿에 있는 `<li>`에 추가합니다:

<code-example path="toh-pt2/src/app/heroes/heroes.component.1.html" region="class-selected" header="heroes.component.html (toggle the 'selected' CSS class)" linenums="false">
</code-example>

<!--
When the current row hero is the same as the `selectedHero`, Angular adds the `selected` CSS class. When the two heroes are different, Angular removes the class.
-->

현재 열의 히어로와 `selectedHero`가 같다면, Angular는 `selected` CSS 클래스를 추가합니다. 만약 서로 다르다면 Angular는 해당 클래스를 삭제합니다.

<!--
The finished `<li>` looks like this:
-->
완성된 `<li>`의 모습은 아래와 같습니다.

<code-example path="toh-pt2/src/app/heroes/heroes.component.html" region="li" header="heroes.component.html (list item hero)" linenums="false">

</code-example>

{@a final-code-review}

<!--
## Final code review
-->
## 마지막 코드리뷰

<!--
Your app should look like this <live-example></live-example>. 
-->
완성된 앱의 모습은  <live-example></live-example>와 같습니다.

<!--
Here are the code files discussed on this page, including the `HeroesComponent` styles.
-->
`HeroesComponent` 스타일을 포함하여 이번 페이지에서 다룬 코드는 아래와 같습니다.

<code-tabs>
  <code-pane header="src/app/heroes/heroes.component.ts" path="toh-pt2/src/app/heroes/heroes.component.ts">
  </code-pane>

  <code-pane header="src/app/heroes/heroes.component.html" path="toh-pt2/src/app/heroes/heroes.component.html">
  </code-pane>

  <code-pane header="src/app/heroes/heroes.component.css" path="toh-pt2/src/app/heroes/heroes.component.css">
  </code-pane>

</code-tabs>

<!--
## Summary
-->
## 요약

<!--
* The Tour of Heroes app displays a list of heroes in a Master/Detail view.
* The user can select a hero and see that hero's details.
* You used `*ngFor` to display a list.
* You used `*ngIf` to conditionally include or exclude a block of HTML.
* You can toggle a CSS style class with a `class` binding.
-->

* 히어로들의 여행앱은 마스터/상세 화면에서 히어로의 목록을 표시합니다.
* 한명의 히어로를 선택할 수 있으며 히어로의 상세화면을 볼 수 있습니다.
* 목록을 표시하기 위해서 `*ngFor`를 사용합니다.
* 조건에 따라 HTML 코드 블락을 추가하거나 제외하기 위해서 `*ngIf`를 사용합니다.
* `class` 바인딩을 통해서 CSS 스타일 클래스를 적용하거나 안할 수 있습니다.