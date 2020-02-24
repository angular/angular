<!--
# Create a feature component
-->
# 기능 컴포넌트 만들기

<!--
At the moment, the `HeroesComponent` displays both the list of heroes and the selected hero's details.
-->
지금까지 작성한 앱은 `HeroesComponent`가 히어로의 목록과 선택된 히어로의 상세정보를 동시에 표시합니다.

<!--
Keeping all features in one component as the application grows will not be maintainable.
You'll want to split up large components into smaller sub-components, each focused on a specific task or workflow.
-->
하지만 모든 기능을 컴포넌트 하나가 담당하면 애플리케이션이 커질수록 이 컴포넌트를 관리하기 점점 힘들어 집니다.
그래서 컴포넌트가 복잡해지면 이 컴포넌트의 역할을 나눠서 일부 역할만 담당하도록 작은 컴포넌트로 나누는 것이 좋습니다.

<!--
In this page, you'll take the first step in that direction by moving the hero details into a separate, reusable `HeroDetailComponent`.

The `HeroesComponent` will only present the list of heroes.
The `HeroDetailComponent` will present details of a selected hero.
-->
이 문서에서는 히어로의 상세정보를 표시하는 부분을 분리해서 `HeroDetailComponent`로 만들어 봅시다.

그러면 `HeroesComponent`는 히어로의 목록만 표시하고 이 목록에서 선택된 히어로는 `HeroDetailComponent`가 표시할 것입니다.

<!--
## Make the `HeroDetailComponent`
-->
## `HeroDetailComponent` 생성하기

<!--
Use the Angular CLI to generate a new component named `hero-detail`.
-->
Angular CLI로 `hero-detail` 컴포넌트를 생성합니다.

<code-example language="sh" class="code-shell">
  ng generate component hero-detail
</code-example>

<!--
The command scaffolds the following:

* Creates a directory `src/app/hero-detail`.

Inside that directory four files are generated:

* A CSS file for the component styles.
* An HTML file for the component template.
* A TypeScript file with a component class named `HeroDetailComponent`.
* A test file for the `HeroDetailComponent` class.

The command also adds the `HeroDetailComponent` as a declaration in the `@NgModule` decorator of the `src/app/app.module.ts` file.
-->
이 명령은 다음 순서로 실행됩니다:

* `src/app/hero-detail` 폴더를 생성합니다.

그리고 이 폴더에 4개의 파일을 생성합니다:

* 컴포넌트 스타일을 지정하는 CSS 파일
* 컴포넌트 템플릿을 정의하는 HTML 파일
* 컴포넌트 클래스 `HeroDetailComponent`가 정의된 TypeScript 파일
* `HeroDetailComponent` 클래스 파일을 테스트하는 파일

이 명령을 실행하면 `HeroDetailComponent`가 자동으로 `src/app/app.module.ts` 파일에 있는 `@NgModule`에 등록됩니다.

<!--
### Write the template
-->
### 템플릿 작성하기

<!--
Cut the HTML for the hero detail from the bottom of the `HeroesComponent` template and paste it over the generated boilerplate in the `HeroDetailComponent` template.

The pasted HTML refers to a `selectedHero`.
The new `HeroDetailComponent` can present _any_ hero, not just a selected hero.
So replace "selectedHero" with "hero" everywhere in the template.

When you're done, the `HeroDetailComponent` template should look like this:
-->
`HeroesComponent` 아래쪽에 히어로의 상세정보를 표시하는 HTML 템플릿을 잘라내서 `HeroDetailComponent` 템플릿에 붙여넣습니다.

이 때 붙여넣은 HTML 에는 `selectedHero`를 참조하는 부분이 있습니다.
그런데 새로 만든 `HeroDetailComponent`는 선택된 히어로가 아니라 히어로 _한 명의_ 상세정보를 표시합니다.
템플릿에 있는 `selectedHero`는 모두 `hero`로 변경합니다.

그러면 `HeroDetailComponent`의 템플릿이 다음과 같이 작성될 것입니다:

<code-example path="toh-pt3/src/app/hero-detail/hero-detail.component.html" header="src/app/hero-detail/hero-detail.component.html"></code-example>

<!--
### Add the `@Input()` hero property
-->
### `@Input()` 히어로 프로퍼티 추가하기

<!--
The `HeroDetailComponent` template binds to the component's `hero` property
which is of type `Hero`.

Open the `HeroDetailComponent` class file and import the `Hero` symbol.
-->
`HeroDetailComponent` 템플릿에 바인딩된 `hero`는 컴포넌트의 `hero` 프로퍼티를 참조해야 합니다.

`HeroDetailComponent` 클래스 파일을 열어서 `Hero` 심볼을 로드합니다.

<!--
<code-example path="toh-pt3/src/app/hero-detail/hero-detail.component.ts"
region="import-hero" header="src/app/hero-detail/hero-detail.component.ts (import Hero)">
-->
<code-example path="toh-pt3/src/app/hero-detail/hero-detail.component.ts"
region="import-hero" header="src/app/hero-detail/hero-detail.component.ts (Hero 로드하기)">
</code-example>

<!--
The `hero` property
[must be an _Input_ property](guide/template-syntax#inputs-outputs "Input and Output properties"),
annotated with the `@Input()` decorator,
because the _external_ `HeroesComponent` [will bind to it](#heroes-component-template) like this.
-->
이 때 `hero` 프로퍼티의 값은 _외부_ 컴포넌트인 `HeroesComponent`에서 [바인딩되어](#heroes-component-template) 전달됩니다. 따라서 `hero` 프로퍼티는 `@Input()` 데코레이터를 사용해서 [_입력_ 프로퍼티](guide/template-syntax#inputs-outputs "Input and Output properties")로 선언해야 합니다.

<code-example path="toh-pt3/src/app/heroes/heroes.component.html" region="hero-detail-binding">
</code-example>

<!--
Amend the `@angular/core` import statement to include the `Input` symbol.
-->
`@angular/core` 패키지에서 `Input` 심볼을 로드합니다.

<!--
<code-example path="toh-pt3/src/app/hero-detail/hero-detail.component.ts" region="import-input" header="src/app/hero-detail/hero-detail.component.ts (import Input)"></code-example>
-->
<code-example path="toh-pt3/src/app/hero-detail/hero-detail.component.ts" region="import-input" header="src/app/hero-detail/hero-detail.component.ts (Input 로드하기)"></code-example>

<!--
Add a `hero` property, preceded by the `@Input()` decorator.
-->
그리고 `@Input()` 데코레이터와 함께 `hero` 프로퍼티를 선언합니다.

<code-example path="toh-pt3/src/app/hero-detail/hero-detail.component.ts" header="src/app/hero-detail/hero-detail.component.ts" region="input-hero"></code-example>

<!--
That's the only change you should make to the `HeroDetailComponent` class.
There are no more properties. There's no presentation logic.
This component simply receives a hero object through its `hero` property and displays it.
-->
`HeroDetailComponent` 클래스는 여기까지 수정하면 됩니다.
더 추가할 프로퍼티는 없으며 클래스에 추가할 로직도 없습니다.
이 컴포넌트는 단순하게 히어로 객체를 받아서 `hero` 프로퍼티에 할당하고, 템플릿에 이 히어로의 상세정보를 표시할 뿐입니다.

<!--
## Show the `HeroDetailComponent`
-->
## `HeroDetailComponent` 표시하기

<!--
The `HeroesComponent` is still a master/detail view.

It used to display the hero details on its own, before you cut that portion of the template. Now it will delegate to the `HeroDetailComponent`.
-->
`HeroesComponent`는 이전과 동일하게 목록/상세정보를 표시해야 합니다.

그런데 히어로의 상세정보를 표시하는 부분은 이제 템플릿에 존재하지 않습니다. 이 부분은 `HeroDetailComponent`로 옮겨졌습니다.

<!--
The two components will have a parent/child relationship.
The parent `HeroesComponent` will control the child `HeroDetailComponent`
by sending it a new hero to display whenever
the user selects a hero from the list.

You won't change the `HeroesComponent` _class_ but you will change its _template_.
-->
이제 `HeroesComponent`와 `HeroDetailComponent`는 부모/자식 관계가 되었습니다.
부모 컴포넌트인 `HeroesComponent`는 자식 컴포넌트인 `HeroDetailComponent`를 관리합니다. 부모 컴포넌트의 히어로 목록에서 히어로를 선택하면 이 히어로의 정보를 `HeroDetailComponent`로 보내서 히어로의 정보를 표시하게 할 것입니다.

{@a heroes-component-template}

<!--
### Update the `HeroesComponent` template
-->
### `HeroesComponent` 템플릿 수정하기

<!--
The `HeroDetailComponent` selector is `'app-hero-detail'`.
Add an `<app-hero-detail>` element near the bottom of the `HeroesComponent` template, where the hero detail view used to be.

Bind the `HeroesComponent.selectedHero` to the element's `hero` property like this.
-->
`HeroDetailComponent`의 셀렉터는 `'app-hero-detail'` 입니다.
원래 히어로의 상세정보를 표시하던 `HeroesComponent` 템플릿 아래쪽에 `<app-hero-detail>` 엘리먼트를 추가합니다.

그리고 `HeroesComponent.selectedHero` 프로퍼티를 이 엘리먼트의 `hero` 프로퍼티에 다음과 같이 바인딩합니다.

<!--
<code-example path="toh-pt3/src/app/heroes/heroes.component.html" region="hero-detail-binding" header="heroes.component.html (HeroDetail binding)">
-->
<code-example path="toh-pt3/src/app/heroes/heroes.component.html" region="hero-detail-binding" header="heroes.component.html (HeroDetail 바인딩)">

</code-example>

<!--
`[hero]="selectedHero"` is an Angular [property binding](guide/template-syntax#property-binding).
-->
`[hero]="selectedHero"`는 Angular가 제공하는 [프로퍼티 바인딩](guide/template-syntax#프로퍼티-바인딩) 문법입니다.

<!--
It's a _one way_ data binding from
the `selectedHero` property of the `HeroesComponent` to the `hero` property of the target element, which maps to the `hero` property of the `HeroDetailComponent`.
-->
이렇게 작성하면 `HeroesComponent`의 `selectedHero` 프로퍼티가 `HeroDetailComponent`의 `hero` 프로퍼티로 _단방향_ 데이터 바인딩됩니다.

<!--
Now when the user clicks a hero in the list, the `selectedHero` changes.
When the `selectedHero` changes, the _property binding_ updates `hero`
and the `HeroDetailComponent` displays the new hero.

The revised `HeroesComponent` template should look like this:
-->
이제 사용자가 목록에서 선택하면 `selectedHero`의 값이 변경됩니다.
그리고 `selectedHero` 값이 변경되면 _프로퍼티 바인딩 된_ `HeroDetailComponent`의 `hero` 프로퍼티도 변경되면서 선택된 히어로의 상세정보가 화면에 표시됩니다.

이렇게 수정하고 나면 `HeroesComponent` 템플릿 코드는 다음과 같이 변경됩니다:

<code-example path="toh-pt3/src/app/heroes/heroes.component.html"
  header="heroes.component.html"></code-example>

<!--
The browser refreshes and the app starts working again as it did before.
-->
브라우저가 갱신되고 나면 애플리케이션이 실행되면서 이전과 동일하게 동작합니다.

<!--
## What changed?
-->
## 어떤 것이 변경되었을까요?

<!--
As [before](tutorial/toh-pt2), whenever a user clicks on a hero name,
the hero detail appears below the hero list.
Now the `HeroDetailComponent` is presenting those details instead of the `HeroesComponent`.
-->
이 앱은 [이전](tutorial/toh-pt2)과 동일하게 사용자가 히어로의 이름을 클릭하면 히어로 목록 아래에 히어로의 상세정보를 표시합니다.
하지만 이제는 히어로의 상세정보를 `HeroesComponent` 대신 `HeroDetailComponent`가 표시합니다.

<!--
Refactoring the original `HeroesComponent` into two components yields benefits, both now and in the future:

1. You simplified the `HeroesComponent` by reducing its responsibilities.

1. You can evolve the `HeroDetailComponent` into a rich hero editor
without touching the parent `HeroesComponent`.

1. You can evolve the `HeroesComponent` without touching the hero detail view.

1. You can re-use the `HeroDetailComponent` in the template of some future component.
-->
이번 가이드에서는 `HeroesComponent`를 좀 더 효율적으로 관리하기 위해 컴포넌트 두 개로 분리했습니다:

1. `HeroesComponent`의 코드가 좀 더 간단해졌습니다.

1. `HeroDetailComponent`는 좀 더 다양한 기능으로 확장할 수 있지만, 이 때 부모 컴포넌트인 `HeroesComponent`는 신경쓰지 않아도 됩니다.

1. `HeroesComponent`를 수정할 때도 상세정보 화면은 신경쓰지 않아도 됩니다.

1. `HeroDetailComponent`는 다른 컴포넌트에서도 재사용할 수 있습니다.

<!--
## Final code review
-->
## 최종코드 리뷰

<!--
Here are the code files discussed on this page and your app should look like this <live-example></live-example>.
-->
이 문서에서 다룬 코드는 다음과 같습니다. 이 코드는 <live-example></live-example> 에서 직접 확인하거나 다운받아 확인할 수 있습니다.

<code-tabs>

  <code-pane header="src/app/hero-detail/hero-detail.component.ts" path="toh-pt3/src/app/hero-detail/hero-detail.component.ts">
  </code-pane>

  <code-pane header="src/app/hero-detail/hero-detail.component.html" path="toh-pt3/src/app/hero-detail/hero-detail.component.html">
  </code-pane>

  <code-pane header="src/app/heroes/heroes.component.html" path="toh-pt3/src/app/heroes/heroes.component.html">
  </code-pane>

  <code-pane header="src/app/app.module.ts" path="toh-pt3/src/app/app.module.ts">
  </code-pane>

</code-tabs>

<!--
## Summary
-->
## 정리

<!--
* You created a separate, reusable `HeroDetailComponent`.

* You used a [property binding](guide/template-syntax#property-binding) to give the parent `HeroesComponent` control over the child `HeroDetailComponent`.

* You used the [`@Input` decorator](guide/template-syntax#inputs-outputs)
to make the `hero` property available for binding
by the external `HeroesComponent`.
-->
* 기존 컴포넌트의 일부를 분리해서 `HeroDetailComponent`를 만들었습니다. 이 컴포넌트는 다른 곳에 재사용할 수 있습니다.

* 부모 컴포넌트 `HeroesComponent`에서 자식 컴포넌트 `HeroDetailComponent`로 데이터를 전달하기 위해 [프로퍼티 바인딩](guide/template-syntax#프로퍼티-바인딩)을 사용했습니다.

* `HeroDetailComponent`의 `hero` 프로퍼티 값을 컴포넌트 외부인 `HeroesComponent`에서 가져오기 위해 [`@Input` 데코레이터](guide/template-syntax#inputs-outputs)를 사용했습니다.

