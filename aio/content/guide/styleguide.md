<!--
# Style Guide
-->
# 코딩 스타일 가이드

{@a toc}

<!--
## Style vocabulary
-->
## 스타일 가이드 용어 정리

<!--
Each guideline describes either a good or bad practice, and all have a consistent presentation.

The wording of each guideline indicates how strong the recommendation is.
-->
각 가이드 라인에서는 권장하는 스타일을 소개하거나 권장하지 않는 스타일을 소개합니다.
이 문서에서 사용하는 용어를 먼저 정리해 봅시다.


<div class="s-rule do">


<!--
**Do** is one that should always be followed.
_Always_ might be a bit too strong of a word.
Guidelines that literally should always be followed are extremely rare.
On the other hand, you need a really unusual case for breaking a *Do* guideline.
-->
**"~하세요"**는 항상 그렇게 작성해야 하는 스타일을 의미합니다.
_항상_ 이라는 단어가 조금 강하게 와닿을 수도 있지만, 이 문서에서 "항상"이라고 언급하는 경우는 그리 많지 않습니다.
하지만 *"~하세요"*라고 설명하는 가이드라인을 벗어나는 경우는 거의 없을 것입니다.

</div>



<div class="s-rule consider">


<!--
**Consider** guidelines should generally be followed.
If you fully understand the meaning behind the guideline and have a good reason to deviate, then do so. Please strive to be consistent.
-->
**"권장합니다"**나 **"~하는 것을 고려해보세요"**는 일반적으로 사용하는 스타일을 의미합니다.
이 어휘가 사용된 가이드라인을 확실하게 이해하고 있지만, 꼭 그렇게 사용하지 않아도 될 이유가 있다면 해당 스타일 가이드를 지키지 않아도 됩니다. 코드의 일관성을 유지하는 것에 더 신경쓰는 것이 좋습니다.

</div>



<div class="s-rule avoid">


<!--
**Avoid** indicates something you should almost never do. Code examples to *avoid* have an unmistakable red header.
-->
**"~하는 것은 피하세요"**는 되도록 피해야 하는 스타일을 의미합니다. 오해를 방지하기 위해 이 스타일은 빨간색 헤더로 표시합니다.

</div>



<div class="s-why">


<!--
**Why?** gives reasons for following the previous recommendations.
-->
**"왜?"**는 해당 스타일 가이드에 대한 이유를 설명합니다.

</div>



<!--
## File structure conventions
-->
## 파일 명명 규칙

<!--
Some code examples display a file that has one or more similarly named companion files.
For example, `hero.component.ts` and `hero.component.html`.
-->
일부 예제에서는 스타일을 설명하면서 하나 이상의 파일을 함께 언급하는 경우가 있습니다.
예를 들면 `hero.component.ts` 파일을 설명하면서 `hero.component.html` 파일을 함께 설명하는 경우가 그렇습니다.

<!--
The guideline uses the shortcut `hero.component.ts|html|css|spec` to represent those various files. Using this shortcut makes this guide's file structures easier to read and more terse.
-->
이 문서는 연관된 파일을 간단하게 표시하기 위해 `hero.component.ts|html|css|spec`라는 표현을 사용합니다.
컴포넌트 구성 파일은 한 폴더에 작성하며 확장자만 다르기 때문에, 이렇게 표현해도 쉽게 이해할 있을 것입니다.

{@a single-responsibility}


<!--
## Single responsibility
-->
## 단일 책임 원칙 (Single responsibility)

<!--
Apply the
<a href="https://wikipedia.org/wiki/Single_responsibility_principle"><i>single responsibility principle</i> (SRP)</a>
to all components, services, and other symbols.
This helps make the app cleaner, easier to read and maintain, and more testable.
-->
모든 컴포넌트와 서비스, 심볼은 <a href="https://wikipedia.org/wiki/Single_responsibility_principle"><i>단일 책임 원칙(SRP)</i></a>을 준수하며 작성하세요.
그러면 애플리케이션이 좀 더 깔끔해지고 유지보수하기도 편하며, 테스트하기도 편해집니다.

{@a 01-01}

<!--
### Rule of One
-->
### 첫번째 규칙

<!--
#### Style 01-01
-->
#### 스타일 01-01

<div class="s-rule do">


<!--
**Do** define one thing, such as a service or component, per file.
-->
한 파일에는 서비스나 컴포넌트와 같은 Angular 구성요소 하나만 정의**하세요.**

</div>



<div class="s-rule consider">


<!--
**Consider** limiting files to 400 lines of code.
-->
한 파일에는 400줄 이하의 코드만 작성하는 것을 **권장합니다.**

</div>



<div class="s-why">


<!--
**Why?** One component per file makes it far easier to read, maintain, and avoid
collisions with teams in source control.
-->
**왜?** 파일 하나에 컴포넌트를 하나만 정의하면 좀 더 읽기 편한 코드를 작성할 수 있고, 유지보수하기도 편하며, 팀 단위로 개발할 때 코드 충돌이 발생하는 것도 피할 수 있습니다.

</div>



<div class="s-why">


<!--
**Why?** One component per file avoids hidden bugs that often arise when combining components in a file where they may share variables, create unwanted closures, or unwanted coupling with dependencies.
-->
**왜?** 한 파일에 컴포넌트를 여러개 정의하면 컴포넌트끼리 연관된 코드나 함께 공유하는 변수, 의도치 않게 사용된 클로저 때문에 버그가 발생할 수도 있습니다.


</div>



<div class="s-why-last">


<!--
**Why?** A single component can be the default export for its file which facilitates lazy loading with the router.
-->
**왜?** 한 파일에 컴포넌트를 하나만 정의하면, 기본 export 항목을 지정해서 라우터로 지연로딩할 때  활용할 수 있습니다.

</div>


<!--
The key is to make the code more reusable, easier to read, and less mistake prone.
-->
요점은 코드를 좀 더 재사용성하기 편하게, 읽기 쉽게, 실수가 발생할 여지를 최대한 줄이는 것입니다.

<!--
The following *negative* example defines the `AppComponent`, bootstraps the app,
defines the `Hero` model object, and loads heroes from the server all in the same file.
*Don't do this*.
-->
다음 예제는 `AppComponent`를 정의하면서 앱을 부트스트랩하고, `Hero` 모델을 정의하고 서버에서 데이터를 받아오는 동작을 모두 한 파일에서 하고 있습니다. *이렇게 작성하지 마세요.*

<code-example path="styleguide/src/01-01/app/heroes/hero.component.avoid.ts" header="app/heroes/hero.component.ts">

</code-example>


<!--
It is a better practice to redistribute the component and its
supporting classes into their own, dedicated files.
-->
이 코드는 각각의 역할에 맞게 개별 파일로 작성하는 것이 더 좋습니다.

<code-tabs>

  <code-pane header="main.ts" path="styleguide/src/01-01/main.ts">

  </code-pane>

  <code-pane header="app/app.module.ts" path="styleguide/src/01-01/app/app.module.ts">

  </code-pane>

  <code-pane header="app/app.component.ts" path="styleguide/src/01-01/app/app.component.ts">

  </code-pane>

  <code-pane header="app/heroes/heroes.component.ts" path="styleguide/src/01-01/app/heroes/heroes.component.ts">

  </code-pane>

  <code-pane header="app/heroes/shared/hero.service.ts" path="styleguide/src/01-01/app/heroes/shared/hero.service.ts">

  </code-pane>

  <code-pane header="app/heroes/shared/hero.model.ts" path="styleguide/src/01-01/app/heroes/shared/hero.model.ts">

  </code-pane>

  <code-pane header="app/heroes/shared/mock-heroes.ts" path="styleguide/src/01-01/app/heroes/shared/mock-heroes.ts">

  </code-pane>

</code-tabs>


<!--
As the app grows, this rule becomes even more important.
<a href="#toc">Back to top</a>
-->
앱이 규모가 커지면서 복잡해 질수록 이 규칙은 점점 더 중요해집니다.

<a href="#toc">맨 위로</a>

{@a 01-02}

<!--
### Small functions
-->
### 함수는 간단하게

<!--
#### Style 01-02
-->
#### 스타일 01-02


<div class="s-rule do">


<!--
**Do** define small functions
-->
함수에는 간단한 기능만 구현**하세요.**


</div>



<div class="s-rule consider">


<!--
**Consider** limiting to no more than 75 lines.
-->
75줄 이하로 작성하는 것을 **권장합니다.**

</div>



<div class="s-why">


<!--
**Why?** Small functions are easier to test, especially when they do one thing and serve one purpose.
-->
**왜?** 함수는 하나의 목적으로 하나의 기능만 구현되어 있을 때 가장 테스트하기 편합니다.

</div>



<div class="s-why">


<!--
**Why?** Small functions promote reuse.
-->
**왜?** 함수의 기능이 간단할수록 재사용하기 편합니다.

</div>



<div class="s-why">


<!--
**Why?** Small functions are easier to read.
-->
**왜?** 함수의 기능이 작을수록 코드를 읽기 쉽습니다.

</div>



<div class="s-why">


<!--
**Why?** Small functions are easier to maintain.
-->
**왜?** 함수의 기능이 작을수록 유지보수하기 편합니다.

</div>



<div class="s-why-last">


<!--
**Why?** Small functions help avoid hidden bugs that come with large functions that share variables with external scope, create unwanted closures, or unwanted coupling with dependencies.
-->
**왜?** 함수의 기능이 작으면 버그가 발생할 가능성을 줄일 수 있습니다. 기능이 복잡한 함수는 변수를 공유하거나, 불필요한 클로저를 만들고 다른 코드와 커플링될 가능성이 더 크기 때문에 버그가 발생할 가능성도 커집니다.

</div>

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>


<!--
## Naming
-->
## 명명 규칙

<!--
Naming conventions are hugely important to maintainability and readability. This guide recommends naming conventions for the file name and the symbol name.
-->
명명 규칙은 앱의 유지보수성이나 가독성 측면에서 아주 중요합니다. 이번 가이드에서는 파일의 이름이나 심볼 이름에 대한 명명 규칙을 소개합니다.


{@a 02-01}

<!--
### General Naming Guidelines
-->
### 일반 명명 규칙

<!--
#### Style 02-01
-->
#### 스타일 02-01

<div class="s-rule do">


<!--
**Do** use consistent names for all symbols.
-->
심볼의 이름은 일관된 규칙으로 사용**하세요.**

</div>



<div class="s-rule do">


<!--
**Do** follow a pattern that describes the symbol's feature then its type. The recommended pattern is `feature.type.ts`.
-->
파일의 이름은 그 파일에 정의된 심볼의 기능과 타입이 드러나도록 작성**하세요.** `기능.타입.ts`와 같은 형식으로 작성하는 것을 권장합니다.

</div>



<div class="s-why">


<!--
**Why?** Naming conventions help provide a consistent way to find content at a glance. Consistency within the project is vital. Consistency with a team is important. Consistency across a company provides tremendous efficiency.
-->
**왜?** 명명 규칙을 명확하게 정하면 파일의 이름만 봐도 내용을 쉽게 파악할 수 있습니다. 그래서 파일의 이름은 일관된 규칙으로 정해져야 하며, 프로젝트나 팀에서 정한 일관성이라도 좋습니다. 회사 전체에 일관된 명명 규칙을 사용한다면 더 효율적입니다.

</div>



<div class="s-why">


<!--
**Why?** The naming conventions should simply help find desired code faster and make it easier to understand.
-->
**왜?** 적절한 명명 규칙을 사용하면 원하는 코드를 빠르게 찾을 수 있고, 코드를 이해하기도 쉽습니다.

</div>



<div class="s-why-last">


<!--
**Why?** Names of folders and files should clearly convey their intent. For example, `app/heroes/hero-list.component.ts` may contain a component that manages a list of heroes.
-->
**왜?** 폴더나 파일의 이름을 보면 그 안의 내용물이 무엇인지 확실하게 알 수 있어야 합니다. 예를 들어 `app/heroes/hero-list.component.ts`라는 파일을 보면 이 파일이 히어로의 리스트를 처리하는 컴포넌트라고 바로 알 수 있습니다.

</div>

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 02-02}

<!--
### Separate file names with dots and dashes
-->
### 파일 이름을 마침표(`.`)와 대시(`-`)로 구분하기

<!--
#### Style 02-02
-->
#### 스타일 02-02

<div class="s-rule do">


<!--
**Do** use dashes to separate words in the descriptive name.
-->
파일의 이름을 여러 단어로 설명해야 한다면 대시(`-`)로 구분**하세요.**

</div>



<div class="s-rule do">


<!--
**Do** use dots to separate the descriptive name from the type.
-->
파일의 기능을 설명하는 부분과 타입은 마침표(`.`)로 구분**하세요.**

</div>



<div class="s-rule do">


<!--
**Do** use consistent type names for all components following a pattern that describes the component's feature then its type. A recommended pattern is `feature.type.ts`.
-->
컴포넌트 타입의 파일이라면 그 컴포넌트의 기능을 표현하도록 파일의 이름을 작성**하세요.** `기능.component.ts` 형식을 권장합니다.

</div>



<div class="s-rule do">


<!--
**Do** use conventional type names including `.service`, `.component`, `.pipe`, `.module`, and `.directive`.
Invent additional type names if you must but take care not to create too many.
-->
파일의 타입은 `.service`, `.component`, `.pipe`, `.module`, `.directive`로 작성**하세요.**
필요하다면 타입을 추가해도 문제없지만, 너무 많이 추가하는 것은 좋지 않습니다.

</div>



<div class="s-why">


<!--
**Why?** Type names provide a consistent way to quickly identify what is in the file.
-->
**왜?** 타입의 이름을 보면 이 파일이 어떤 역할을 하는지 직관적으로 알 수 있어야 합니다.


</div>



<div class="s-why">


<!--
**Why?** Type names make it easy to find a specific file type using an editor or IDE's fuzzy search techniques.
-->
**왜?** 파일의 타입을 지정하면 IDE에서 특정 종류의 파일을 찾기도 편합니다.

</div>



<div class="s-why">


<!--
**Why?** Unabbreviated type names such as `.service` are descriptive and unambiguous.
Abbreviations such as `.srv`, `.svc`, and `.serv` can be confusing.
-->
**왜?** 타입에 사용하는 단어는 축약하지 않는 것이 좋습니다. `.srv`, `.svc`, `.serv`와 같은 단어는 혼란을 줄 수 있습니다.

</div>



<div class="s-why-last">


<!--
**Why?** Type names provide pattern matching for any automated tasks.
-->
**왜?** 타입 이름은 태스크를 자동화할 때도 패턴으로 활용할 수 있습니다.

</div>

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>


{@a 02-03}

<!--
### Symbols and file names
-->
### 심볼과 파일 이름

<!--
#### Style 02-03
-->
#### 스타일 02-03


<div class="s-rule do">

<!--
**Do** use consistent names for all assets named after what they represent.
-->
애플리케이션에 사용하는 모든 이름은 그 특성을 나타내도록 일관되게 **지으세요.**


</div>



<div class="s-rule do">


<!--
**Do** use upper camel case for class names.
-->
클래스 이름은 대문자 캐멀 케이스를 **사용하세요.**

</div>



<div class="s-rule do">


<!--
**Do** match the name of the symbol to the name of the file.
-->
심볼의 이름과 파일의 이름이 연관되도록 **하세요.**

</div>



<div class="s-rule do">


<!--
**Do** append the symbol name with the conventional suffix (such as `Component`,
`Directive`, `Module`, `Pipe`, or `Service`) for a thing of that type.
-->
심볼 이름 뒤에는 타입을 표현하는 접미사(`Component`,
`Directive`, `Module`, `Pipe`, `Service`)를 **붙이세요.**

</div>



<div class="s-rule do">


<!--
**Do** give the filename the conventional suffix (such as `.component.ts`, `.directive.ts`,
`.module.ts`, `.pipe.ts`, or `.service.ts`) for a file of that type.
-->
파일 이름에도 타입을 표현하는 접미사(`.component.ts`, `.directive.ts`,
`.module.ts`, `.pipe.ts`, `.service.ts`)를 **붙이세요.**

</div>



<div class="s-why">


<!--
**Why?** Consistent conventions make it easy to quickly identify
and reference assets of different types.
-->
**왜?** 심볼과 파일의 이름을 일관되게 지으면 어떤 타입인지 구분하기 편하고, 참조하기도 편합니다.

</div>



<table width="100%">

  <col width="50%">

  </col>

  <col width="50%">

  </col>

  <tr>

    <th>
      <!--
      Symbol Name
      -->
      심볼 이름
    </th>

    <th>
      <!--
      File Name
      -->
      파일 이름
    </th>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @Component({ ... })
        export class AppComponent { }
      </code-example>

    </td>

    <td>


      app.component.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @Component({ ... })
        export class HeroesComponent { }
      </code-example>

    </td>

    <td>


      heroes.component.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @Component({ ... })
        export class HeroListComponent { }
      </code-example>

    </td>

    <td>


      hero-list.component.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @Component({ ... })
        export class HeroDetailComponent { }
      </code-example>

    </td>

    <td>


      hero-detail.component.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @Directive({ ... })
        export class ValidationDirective { }
      </code-example>

    </td>

    <td>


      validation.directive.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @NgModule({ ... })
        export class AppModule
      </code-example>

    </td>

    <td>


      app.module.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @Pipe({ name: 'initCaps' })
        export class InitCapsPipe implements PipeTransform { }
      </code-example>

    </td>

    <td>


      init-caps.pipe.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @Injectable()
        export class UserProfileService { }
      </code-example>

    </td>

    <td>


      user-profile.service.ts
    </td>

  </tr>

</table>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>


{@a 02-04}

<!--
### Service names
-->
### 서비스 이름

<!--
#### Style 02-04
-->
#### 스타일 02-04

<div class="s-rule do">


<!--
**Do** use consistent names for all services named after their feature.
-->
서비스의 이름은 그 서비스가 제공하는 기능을 표현하도록 **정의하세요.**

</div>



<div class="s-rule do">


<!--
**Do** suffix a service class name with `Service`.
For example, something that gets data or heroes
should be called a `DataService` or a `HeroService`.
-->
서비스 클래스 이름 뒤에 `Service`라는 접미사를 **붙이세요.**
데이터를 처리하는 서비스라면 `DataService`로, 히어로를 관리하는 서비스는 `HeroService`로 정의하는 식입니다.

<!--
A few terms are unambiguously services. They typically
indicate agency by ending in "-er". You may prefer to name
a service that logs messages `Logger` rather than `LoggerService`.
Decide if this exception is agreeable in your project.
As always, strive for consistency.
-->
이렇게 작성하면 간단한 단어 하나로도 서비스라는 것이 명확해 집니다.
하지만 개발자에 따라서 "-er" 접미사를 사용하는 것이 더 익숙할 수도 있습니다. 그래서 `LoggerService`라는 이름보다 `Logger`가 더 익숙할 수 있습니다.
프로젝트에 어울린다면 어떤 방식을 사용해도 문제없습니다.
일관성을 유지하기만 하면 됩니다.

</div>



<div class="s-why">


<!--
**Why?** Provides a consistent way to quickly identify and reference services.
-->
**왜?** 이름을 일관되게 정의하면 해당 심볼이 서비스라는 것이 명확해집니다.

</div>



<div class="s-why">


<!--
**Why?** Clear service names such as `Logger` do not require a suffix.
-->
**왜?** `Logger`와 같은 이름을 사용할 때는 클래스에 `Service` 접미사를 붙이지 않는 것이 좋습니다.

</div>



<div class="s-why-last">


<!--
**Why?** Service names such as `Credit` are nouns and require a suffix and should be named with a suffix when it is not obvious if it is a service or something else.
-->
**왜?** `Service`라는 접미사 없이 서비스 이름을 `Credit`라고 정의하면, 이 이름만 보고 이 심볼이 서비스인지 쉽게 알 수 없습니다.

</div>



<table width="100%">

  <col width="50%">

  </col>

  <col width="50%">

  </col>

  <tr>

    <th>
      <!--
      Symbol Name
      -->
      심볼 이름
    </th>

    <th>
      <!--
      File Name
      -->
      파일 이름
    </th>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @Injectable()
        export class HeroDataService { }
      </code-example>

    </td>

    <td>


      hero-data.service.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @Injectable()
        export class CreditService { }
      </code-example>

    </td>

    <td>


      credit.service.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @Injectable()
        export class Logger { }
      </code-example>

    </td>

    <td>


      logger.service.ts
    </td>

  </tr>

</table>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>


{@a 02-05}

<!--
### Bootstrapping
-->
### 부트스트랩

<!--
#### Style 02-05
-->
#### 스타일 02-05


<div class="s-rule do">


<!--
**Do** put bootstrapping and platform logic for the app in a file named `main.ts`.
-->
부트스트랩이나 플랫폼과 관련된 로직은 `main.ts` 파일에 **작성하세요.**

</div>



<div class="s-rule do">


<!--
**Do** include error handling in the bootstrapping logic.
-->
부트스트랩 로직에서 발생할 수 있는 에러를 처리하는 로직도 함께 **작성하세요.**

</div>



<div class="s-rule avoid">


<!--
**Avoid** putting app logic in `main.ts`. Instead, consider placing it in a component or service.
-->
애플리케이션 로직을 `main.ts` 파일에 작성하는 것은 **피하세요.** 이 로직은 컴포넌트나 서비스에 들어가는 것이 좋습니다.

</div>



<div class="s-why">


<!--
**Why?** Follows a consistent convention for the startup logic of an app.
-->
**왜?** `main.ts` 파일에는 애플리케이션을 시작할 때 필요한 로직만 들어가는 것이 좋습니다.

</div>



<div class="s-why-last">


<!--
**Why?** Follows a familiar convention from other technology platforms.
-->
**왜?** 다른 언어나 프레임워크와 비슷한 방식을 사용하는 것이 익숙합니다.

</div>



<code-example path="styleguide/src/02-05/main.ts" header="main.ts">

</code-example>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 05-02}

<!--
### Component selectors
-->
### 컴포넌트 셀렉터

<!--
#### Style 05-02
-->
#### 스타일 05-02

<div class="s-rule do">


<!--
**Do** use _dashed-case_ or _kebab-case_ for naming the element selectors of components.
-->
컴포넌트의 셀렉터 이름은 _대시-케이스_ 나 _케밥-케이스_ 로 **정의하세요.**

</div>



<div class="s-why-last">

<!--
**Why?** Keeps the element names consistent with the specification for [Custom Elements](https://www.w3.org/TR/custom-elements/).
-->
**왜?** 엘리먼트 이름은 [커스텀 엘리먼트](https://www.w3.org/TR/custom-elements/) 표준을 따르는 것이 좋습니다.

</div>



<code-example path="styleguide/src/05-02/app/heroes/shared/hero-button/hero-button.component.avoid.ts" region="example" header="app/heroes/shared/hero-button/hero-button.component.ts">

</code-example>





<code-tabs>

  <code-pane header="app/heroes/shared/hero-button/hero-button.component.ts" path="styleguide/src/05-02/app/heroes/shared/hero-button/hero-button.component.ts" region="example">

  </code-pane>

  <code-pane header="app/app.component.html" path="styleguide/src/05-02/app/app.component.html">

  </code-pane>

</code-tabs>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 02-07}

<!--
### Component custom prefix
-->
### 커스텀 컴포넌트의 접두사

<!--
#### Style 02-07
-->
#### 스타일 02-07

<div class="s-rule do">

<!--
**Do** use a hyphenated, lowercase element selector value; for example, `admin-users`.
-->
컴포넌트 셀렉터는 하이픈(`-`)으로 구분되는 소문자를 **사용하세요.** `admin-users`와 같이 지정하면 됩니다.

</div>



<div class="s-rule do">


<!--
**Do** use a custom prefix for a component selector.
For example, the prefix `toh` represents from **T**our **o**f **H**eroes and the prefix `admin` represents an admin feature area.
-->
컴포넌트 셀렉터에는 커스텀 접두사를 **사용하세요.**
예를 들어 프로젝트 이름이 **T**our **o**f **H**eroes 라면 `toh`를 접두사로 사용할 수 있으며, 관리자용 기능이 구현되어 있는 곳에서는 `admin`을 접두사로 사용할 수 있습니다.

</div>



<div class="s-rule do">


<!--
**Do** use a prefix that identifies the feature area or the app itself.
-->
접두사는 해당 컴포넌트의 기능이나 앱의 특성을 표현할 수 있도록 **지정하세요.**

</div>



<div class="s-why">


<!--
**Why?** Prevents element name collisions with components in other apps and with native HTML elements.
-->
**왜?** 컴포넌트의 엘리먼트 셀렉터는 다른 앱의 컴포넌트 셀렉터나 네이티브 HTML과 충돌하지 않도록 지정해야 합니다.

</div>



<div class="s-why">


<!--
**Why?** Makes it easier to promote and share the component in other apps.
-->
**왜?** 커스텀 컴포넌트가 다른 애플리케이션에도 활용될 수 있는 경우를 생각해보면, 사용하기 편하고 잘 구분되는 이름을 사용하는 것이 좋습니다.

</div>



<div class="s-why-last">


<!--
**Why?** Components are easy to identify in the DOM.
-->
**왜?** DOM에 사용된 컴포넌트는 다른 네이티브 HTML 엘리먼트와 쉽게 구분되어야 합니다.

</div>



<code-example path="styleguide/src/02-07/app/heroes/hero.component.avoid.ts" region="example" header="app/heroes/hero.component.ts">

</code-example>





<code-example path="styleguide/src/02-07/app/users/users.component.avoid.ts" region="example" header="app/users/users.component.ts">

</code-example>





<code-example path="styleguide/src/02-07/app/heroes/hero.component.ts" region="example" header="app/heroes/hero.component.ts">

</code-example>





<code-example path="styleguide/src/02-07/app/users/users.component.ts" region="example" header="app/users/users.component.ts">

</code-example>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 02-06}

<!--
### Directive selectors
-->
### 디렉티브 셀렉터

<!--
#### Style 02-06
-->
#### 스타일 02-06


<div class="s-rule do">


<!--
**Do** Use lower camel case for naming the selectors of directives.
-->
디렉티브의 셀렉터는 소문자로 시작하는 캐멀 케이스를 **사용하세요.**

</div>



<div class="s-why">


<!--
**Why?** Keeps the names of the properties defined in the directives that are bound to the view consistent with the attribute names.
-->
**왜?** 디렉티브에 정의된 프로퍼티 이름이 뷰에서 어떻게 활용되는지 생각해 보세요. 디렉티브의 셀렉터는 HTML문서에서 어트리뷰트로 사용됩니다.

</div>



<div class="s-why-last">


<!--
**Why?** The Angular HTML parser is case sensitive and recognizes lower camel case.
-->
**왜?** Angular HTML 파서는 대소문자를 구별하기 때문에 소문자 캐멀 케이스도 활용할 수 있습니다.

</div>

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 02-08}

<!--
### Directive custom prefix
-->
### 커스텀 디렉티브의 접두사

<!--
#### Style 02-08
-->
#### 스타일 02-08

<div class="s-rule do">


<!--
**Do** use a custom prefix for the selector of directives (e.g, the prefix `toh` from **T**our **o**f **H**eroes).
-->
커스텀 디렉티브의 셀렉터에는 접두사를 **사용하세요.** 예를 들어 프로젝트 이름이 **T**our **o**f **H**eroes 라면 `toh`를 접두사로 사용할 수 있습니다.

</div>



<div class="s-rule do">


<!--
**Do** spell non-element selectors in lower camel case unless the selector is meant to match a native HTML attribute.
-->
디렉티브 셀렉터는 네이티브 HTML 엘리먼트나 네이티브 어트리뷰트와 겹치지 않는 소문자 캐멀 케이스를 **사용하세요.**

</div>



<div class="s-why">


<!--
**Why?** Prevents name collisions.
-->
**왜?** 디렉티브가 네이티브 HTML과 충돌하면 안됩니다.

</div>



<div class="s-why-last">


<!--
**Why?** Directives are easily identified.
-->
**왜?** 디렉티브는 이름만 보고 쉽게 구분할 수 있어야 합니다.

</div>



<code-example path="styleguide/src/02-08/app/shared/validate.directive.avoid.ts" region="example" header="app/shared/validate.directive.ts">

</code-example>





<code-example path="styleguide/src/02-08/app/shared/validate.directive.ts" region="example" header="app/shared/validate.directive.ts">

</code-example>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>


{@a 02-09}

<!--
### Pipe names
-->
### 파이프 이름

<!--
#### Style 02-09
-->
#### 스타일 02-09

<div class="s-rule do">


<!--
**Do** use consistent names for all pipes, named after their feature.
-->
커스텀 파이프를 구현한 클래스에는 `Pipe` 접미사를 **붙이고,** 이 파일에는 `.pipe` 타입을 **명시하세요.**

</div>



<div class="s-why-last">


<!--
**Why?** Provides a consistent way to quickly identify and reference pipes.
-->
**왜?** 이렇게 하면 파이프를 쉽게 구별할 수 있고, 참조하기도 편합니다.

</div>



<table width="100%">

  <col width="50%">

  </col>

  <col width="50%">

  </col>

  <tr>

    <th>
      <!--
      Symbol Name
      -->
      심볼 이름
    </th>

    <th>
      <!--
      File Name
      -->
      파일 이름
    </th>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @Pipe({ name: 'ellipsis' })
        export class EllipsisPipe implements PipeTransform { }
      </code-example>

    </td>

    <td>


      ellipsis.pipe.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @Pipe({ name: 'initCaps' })
        export class InitCapsPipe implements PipeTransform { }
      </code-example>

    </td>

    <td>


      init-caps.pipe.ts
    </td>

  </tr>

</table>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>


{@a 02-10}

<!--
### Unit test file names
-->
### 유닛 테스트 파일의 이름

<!--
#### Style 02-10
-->
#### 스타일 02-10

<div class="s-rule do">


<!--
**Do** name test specification files the same as the component they test.
-->
유닛 테스트 파일의 이름에 그 파일이 테스트하는 컴포넌트의 이름을 **사용하세요.**

</div>



<div class="s-rule do">


<!--
**Do** name test specification files with a suffix of `.spec`.
-->
유닛 테스트 파일에는 `.spec` 접미사를 **붙이세요.**

</div>



<div class="s-why">


<!--
**Why?** Provides a consistent way to quickly identify tests.
-->
**왜?** 이렇게 하면 테스트 파일을 쉽게 구분할 수 있습니다.

</div>



<div class="s-why-last">


<!--
**Why?** Provides pattern matching for [karma](http://karma-runner.github.io/) or other test runners.
-->
**왜?** [karma](http://karma-runner.github.io/)와 같은 테스트 러너는 파일 패턴 매칭도 지원합니다.

</div>





<table width="100%">

  <col width="50%">

  </col>

  <col width="50%">

  </col>

  <tr>

    <th>
      <!--
      Test Type
      -->
      테스트 타입
    </th>

    <th>
      <!--
      File Names
      -->
      파일 이름
    </th>

  </tr>

  <tr style=top>

    <td>

      <!--
      Components
      -->
      컴포넌트
    </td>

    <td>


      heroes.component.spec.ts

      hero-list.component.spec.ts

      hero-detail.component.spec.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <!--
      Services
      -->
      서비스
    </td>

    <td>


      logger.service.spec.ts

      hero.service.spec.ts

      filter-text.service.spec.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <!--
      Pipes
      -->
      파이프
    </td>

    <td>


      ellipsis.pipe.spec.ts

      init-caps.pipe.spec.ts
    </td>

  </tr>

</table>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>


{@a 02-11}

<!--
### _End-to-End_ (E2E) test file names
-->
### _엔드-투-엔드_ (E2E) 테스트 파일의 이름

<!--
#### Style 02-11
-->
#### 스타일 02-11

<div class="s-rule do">


<!--
**Do** name end-to-end test specification files after the feature they test with a suffix of `.e2e-spec`.
-->
엔드-투-엔드 테스트 파일의 이름은 테스트하려는 기능 뒤에 `.e2e-spec` 접미사를 **붙이세요.**

</div>



<div class="s-why">


<!--
**Why?** Provides a consistent way to quickly identify end-to-end tests.
-->
**왜?** 이렇게 하면 엔드-투-엔드 테스트 파일을 쉽게 구분할 수 있습니다.

</div>



<div class="s-why-last">


<!--
**Why?** Provides pattern matching for test runners and build automation.
-->
**왜?** 이렇게 하면 테스트 러너나 빌드 자동화에 패턴 매칭을 사용할 수 잇습니다.

</div>







<table width="100%">

  <col width="50%">

  </col>

  <col width="50%">

  </col>

  <tr>

    <th>
      <!--
      Test Type
      -->
      테스트 타입
    </th>

    <th>
      <!--
      File Names
      -->
      파일 이름
    </th>

  </tr>

  <tr style=top>

    <td>


      <!--
      End-to-End Tests
      -->
      엔드-투-엔드 테스트
    </td>

    <td>


      app.e2e-spec.ts

      heroes.e2e-spec.ts
    </td>

  </tr>

</table>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 02-12}

<!--
### Angular _NgModule_ names
-->
### Angular _NgModule_ 의 이름

<!--
#### Style 02-12
-->
#### 스타일 02-12

<div class="s-rule do">


<!--
**Do** append the symbol name with the suffix `Module`.
-->
_NgModule_ 심볼 이름에는 `Module` 접미사를 **붙이세요.**

</div>



<div class="s-rule do">


<!--
**Do** give the file name the `.module.ts` extension.
-->
모듈을 정의한 파일 이름에는 `.module.ts` 접두사를 **붙이세요.**

</div>



<div class="s-rule do">


<!--
**Do** name the module after the feature and folder it resides in.
-->
모듈의 기능을 표현할 수 있는 폴더 이름을 짓고, 이 파일 안에 모듈을 **작성하세요.**

</div>



<div class="s-why">


<!--
**Why?** Provides a consistent way to quickly identify and reference modules.
-->
**왜?** 이렇게 하면 모듈을 쉽게 구분할 수 있고, 참조하기도 편합니다.

</div>



<div class="s-why">


<!--
**Why?** Upper camel case is conventional for identifying objects that can be instantiated using a constructor.
-->
**왜?** 인스턴스를 생성하는 용도로 사용하는 객체의 이름은 대문자 캐멀 케이스로 정의하는 것이 일반적입니다.

</div>



<div class="s-why-last">


<!--
**Why?** Easily identifies the module as the root of the same named feature.
-->
**왜?** 이렇게 하면 같은 이름을 사용하더라도 최상위 객체인 모듈을 쉽게 구분할 수 있습니다.

</div>



<div class="s-rule do">


<!--
**Do** suffix a _RoutingModule_ class name with `RoutingModule`.
-->
정의하는 모듈이 _라우팅 모듈_ 이라면 `RoutingModule` 접미사를 **붙이세요.**

</div>



<div class="s-rule do">


<!--
**Do** end the filename of a _RoutingModule_ with `-routing.module.ts`.
-->
_라우팅 모듈_ 을 정의한 파일의 이름에는 `-routing.module.ts` 접미사를 **붙이세요.**

</div>



<div class="s-why-last">


<!--
**Why?** A `RoutingModule` is a module dedicated exclusively to configuring the Angular router.
A consistent class and file name convention make these modules easy to spot and verify.
-->
**왜?** _라우팅 모듈_ 은 Angular 라우터에 특화된 기능을 제공하는 모듈입니다.
클래스 이름과 파일 이름을 이렇게 지정하면, 다른 모듈과 라우팅 모듈을 쉽게 구분할 수 있습니다.

</div>



<table width="100%">

  <col width="50%">

  </col>

  <col width="50%">

  </col>

  <tr>

    <th>
      <!--
      Symbol Name
      -->
      심볼 이름
    </th>

    <th>
      <!--
      File Name
      -->
      파일 이름
    </th>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @NgModule({ ... })
        export class AppModule { }
      </code-example>

    </td>

    <td>


      app.module.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @NgModule({ ... })
        export class HeroesModule { }
      </code-example>

    </td>

    <td>


      heroes.module.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @NgModule({ ... })
        export class VillainsModule { }
      </code-example>

    </td>

    <td>


      villains.module.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @NgModule({ ... })
        export class AppRoutingModule { }
      </code-example>

    </td>

    <td>


      app-routing.module.ts
    </td>

  </tr>

  <tr style=top>

    <td>

      <code-example hideCopy class="no-box">
        @NgModule({ ... })
        export class HeroesRoutingModule { }
      </code-example>

    </td>

    <td>


      heroes-routing.module.ts
    </td>

  </tr>

</table>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

## Application structure and NgModules

Have a near-term view of implementation and a long-term vision. Start small but keep in mind where the app is heading down the road.

All of the app's code goes in a folder named `src`.
All feature areas are in their own folder, with their own NgModule.

All content is one asset per file. Each component, service, and pipe is in its own file.
All third party vendor scripts are stored in another folder and not in the `src` folder.
You didn't write them and you don't want them cluttering `src`.
Use the naming conventions for files in this guide.
<a href="#toc">Back to top</a>

{@a 04-01}

### _LIFT_

#### Style 04-01

<div class="s-rule do">


**Do** structure the app such that you can **L**ocate code quickly,
**I**dentify the code at a glance,
keep the **F**lattest structure you can, and
**T**ry to be DRY.

</div>



<div class="s-rule do">

**Do** define the structure to follow these four basic guidelines, listed in order of importance.

</div>



<div class="s-why-last">

**Why?** LIFT Provides a consistent structure that scales well, is modular, and makes it easier to increase developer efficiency by finding code quickly.
To confirm your intuition about a particular structure, ask:
_can I quickly open and start work in all of the related files for this feature_?

</div>

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 04-02}

### Locate

#### Style 04-02


<div class="s-rule do">


**Do** make locating code intuitive, simple and fast.

</div>



<div class="s-why-last">


**Why?** To work efficiently you must be able to find files quickly,
especially when you do not know (or do not remember) the file _names_.
Keeping related files near each other in an intuitive location saves time.
A descriptive folder structure makes a world of difference to you and the people who come after you.

</div>

<a href="#toc">Back to top</a>

{@a 04-03}

### Identify

#### Style 04-03


<div class="s-rule do">


**Do** name the file such that you instantly know what it contains and represents.

</div>



<div class="s-rule do">


**Do** be descriptive with file names and keep the contents of the file to exactly one component.

</div>



<div class="s-rule avoid">


**Avoid** files with multiple components, multiple services, or a mixture.

</div>



<div class="s-why-last">


**Why?** Spend less time hunting and pecking for code, and become more efficient.
Longer file names are far better than _short-but-obscure_ abbreviated names.

</div>



<div class="alert is-helpful">

It may be advantageous to deviate from the _one-thing-per-file_ rule when
you have a set of small, closely-related features that are better discovered and understood
in a single file than as multiple files. Be wary of this loophole.


</div>

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>


{@a 04-04}

<!--
### Flat
-->
### 단순한(flat) 폴더 구조

<!--
#### Style 04-04
-->
#### 스타일 04-04

<div class="s-rule do">


<!--
**Do** keep a flat folder structure as long as possible.
-->
폴더 구조는 최대한 단순하게 **유지하세요.**


</div>



<div class="s-rule consider">


**Consider** creating sub-folders when a folder reaches seven or more files.
파일의 개수가 7개 이상 된다면 하위 폴더를 만들어서 분리하는 것을 **권장합니다.**

</div>



<div class="s-rule consider">


<!--
**Consider** configuring the IDE to hide distracting, irrelevant files such as generated `.js` and `.js.map` files.
-->
`.js` 파일이나 `.js.map` 파일같이 개발 단계에서 직접 사용되지 않는 파일은 IDE에서 보이지 않도록 설정하는 것을 **권장합니다.**

</div>



<div class="s-why-last">



**Why?** No one wants to search for a file through seven levels of folders.
A flat structure is easy to scan.

On the other hand,
<a href="https://en.wikipedia.org/wiki/The_Magical_Number_Seven,_Plus_or_Minus_Two">psychologists believe</a>
that humans start to struggle when the number of adjacent interesting things exceeds nine.
So when a folder has ten or more files, it may be time to create subfolders.

Base your decision on your comfort level.
Use a flatter structure until there is an obvious value to creating a new folder.


</div>

<a href="#toc">Back to top</a>


{@a 04-05}

### _T-DRY_ (Try to be _DRY_)

#### Style 04-05

<div class="s-rule do">


**Do** be DRY (Don't Repeat Yourself).

</div>



<div class="s-rule avoid">


**Avoid** being so DRY that you sacrifice readability.

</div>



<div class="s-why-last">



**Why?** Being DRY is important, but not crucial if it sacrifices the other elements of LIFT.
That's why it's called _T-DRY_.
For example, it's redundant to name a template `hero-view.component.html` because
with the `.html` extension, it is obviously a view.
But if something is not obvious or departs from a convention, then spell it out.


</div>

<a href="#toc">Back to top</a>


{@a 04-06}

### Overall structural guidelines

#### Style 04-06

<div class="s-rule do">



**Do** start small but keep in mind where the app is heading down the road.


</div>



<div class="s-rule do">


**Do** have a near term view of implementation and a long term vision.

</div>



<div class="s-rule do">


**Do** put all of the app's code in a folder named `src`.

</div>



<div class="s-rule consider">



**Consider** creating a folder for a component when it has multiple accompanying files (`.ts`, `.html`, `.css` and `.spec`).
</div>



<div class="s-why">



**Why?** Helps keep the app structure small and easy to maintain in the early stages, while being easy to evolve as the app grows.
</div>



<div class="s-why-last">



**Why?** Components often have four files (e.g. `*.html`, `*.css`, `*.ts`, and `*.spec.ts`) and can clutter a folder quickly.
</div>



{@a file-tree}


Here is a compliant folder and file structure:


<div class='filetree'>

  <div class='file'>
    &lt;project root&gt;
  </div>

  <div class='children'>

    <div class='file'>
      src
    </div>

    <div class='children'>

      <div class='file'>
        app
      </div>

      <div class='children'>

        <div class='file'>
          core
        </div>

        <div class='children'>

          <div class='file'>
            exception.service.ts|spec.ts
          </div>

          <div class='file'>
            user-profile.service.ts|spec.ts
          </div>

        </div>

        <div class='file'>
          heroes
        </div>

        <div class='children'>

          <div class='file'>
            hero
          </div>

          <div class='children'>

            <div class='file'>
              hero.component.ts|html|css|spec.ts
            </div>

          </div>

          <div class='file'>
            hero-list
          </div>

          <div class='children'>

            <div class='file'>
              hero-list.component.ts|html|css|spec.ts
            </div>

          </div>

          <div class='file'>
            shared
          </div>

          <div class='children'>

            <div class='file'>
              hero-button.component.ts|html|css|spec.ts
            </div>

            <div class='file'>
              hero.model.ts
            </div>

            <div class='file'>
              hero.service.ts|spec.ts
            </div>

          </div>

          <div class='file'>
            heroes.component.ts|html|css|spec.ts
          </div>

          <div class='file'>
            heroes.module.ts
          </div>

          <div class='file'>
            heroes-routing.module.ts
          </div>

        </div>

        <div class='file'>
          shared
        </div>

        <div class='children'>

          <div class='file'>
            shared.module.ts
          </div>

          <div class='file'>
            init-caps.pipe.ts|spec.ts
          </div>

          <div class='file'>
            filter-text.component.ts|spec.ts
          </div>

          <div class='file'>
            filter-text.service.ts|spec.ts
          </div>

        </div>

        <div class='file'>
          villains
        </div>

        <div class='children'>

          <div class='file'>
            villain
          </div>

          <div class='children'>

            <div class='file'>
              ...
            </div>

          </div>

          <div class='file'>
            villain-list
          </div>

          <div class='children'>

            <div class='file'>
              ...
            </div>

          </div>

          <div class='file'>
            shared
          </div>

          <div class='children'>

            <div class='file'>
              ...
            </div>

          </div>

          <div class='file'>
            villains.component.ts|html|css|spec.ts
          </div>

          <div class='file'>
            villains.module.ts
          </div>

          <div class='file'>
            villains-routing.module.ts
          </div>

        </div>

        <div class='file'>
          app.component.ts|html|css|spec.ts
        </div>

        <div class='file'>
          app.module.ts
        </div>

        <div class='file'>
          app-routing.module.ts
        </div>

      </div>

      <div class='file'>
        main.ts
      </div>

      <div class='file'>
        index.html
      </div>

      <div class='file'>
        ...
      </div>

    </div>

    <div class='file'>
      node_modules/...
    </div>

    <div class='file'>
      ...
    </div>

  </div>

</div>





<div class="alert is-helpful">

While components in dedicated folders are widely preferred,
another option for small apps is to keep components flat (not in a dedicated folder).
This adds up to four files to the existing folder, but also reduces the folder nesting.
Whatever you choose, be consistent.


</div>

<a href="#toc">Back to top</a>

{@a 04-07}

### _Folders-by-feature_ structure

#### Style 04-07


<div class="s-rule do">

**Do** create folders named for the feature area they represent.

</div>

<div class="s-why">

**Why?** A developer can locate the code and identify what each file represents
at a glance. The structure is as flat as it can be and there are no repetitive or redundant names.

</div>

<div class="s-why">

**Why?** The LIFT guidelines are all covered.

</div>

<div class="s-why">

**Why?** Helps reduce the app from becoming cluttered through organizing the
content and keeping them aligned with the LIFT guidelines.

</div>

<div class="s-why">

**Why?** When there are a lot of files, for example 10+,
locating them is easier with a consistent folder structure
and more difficult in a flat structure.

</div>

<div class="s-rule do">

**Do** create an NgModule for each feature area.

</div>

<div class="s-why">

**Why?** NgModules make it easy to lazy load routable features.

</div>

<div class="s-why-last">

**Why?** NgModules make it easier to isolate, test, and reuse features.

</div>

<div>

  For more information, refer to <a href="#file-tree">this folder and file structure example.</a>

</div>

<a href="#toc">Back to top

</a>


{@a 04-08}

### App _root module_

#### Style 04-08

<div class="s-rule do">



**Do** create an NgModule in the app's root folder,
for example, in `/src/app`.
</div>



<div class="s-why">



**Why?** Every app requires at least one root NgModule.
</div>



<div class="s-rule consider">



**Consider** naming the root module `app.module.ts`.
</div>



<div class="s-why-last">



**Why?** Makes it easier to locate and identify the root module.
</div>



<code-example path="styleguide/src/04-08/app/app.module.ts" region="example" header="app/app.module.ts">

</code-example>


<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>


{@a 04-09}

### Feature modules

#### Style 04-09


<div class="s-rule do">



**Do** create an NgModule for all distinct features in an application;
for example, a `Heroes` feature.
</div>



<div class="s-rule do">



**Do** place the feature module in the same named folder as the feature area;
for example, in `app/heroes`.
</div>



<div class="s-rule do">



**Do** name the feature module file reflecting the name of the feature area
and folder; for example, `app/heroes/heroes.module.ts`.


</div>



<div class="s-rule do">



**Do** name the feature module symbol reflecting the name of the feature
area, folder, and file; for example, `app/heroes/heroes.module.ts` defines `HeroesModule`.


</div>



<div class="s-why">



**Why?** A feature module can expose or hide its implementation from other modules.


</div>



<div class="s-why">



**Why?** A feature module identifies distinct sets of related components that comprise the feature area.


</div>



<div class="s-why">


**Why?** A feature module can easily be routed to both eagerly and lazily.


</div>



<div class="s-why">



**Why?** A feature module defines clear boundaries between specific functionality and other application features.


</div>



<div class="s-why">



**Why?** A feature module helps clarify and make it easier to assign development responsibilities to different teams.

</div>



<div class="s-why-last">



**Why?** A feature module can easily be isolated for testing.


</div>

<a href="#toc">Back to top</a>

{@a 04-10}

### Shared feature module

#### Style 04-10


<div class="s-rule do">



**Do** create a feature module named `SharedModule` in a `shared` folder;
for example, `app/shared/shared.module.ts` defines `SharedModule`.


</div>



<div class="s-rule do">



**Do** declare components, directives, and pipes in a shared module when those
items will be re-used and referenced by the components declared in other feature modules.

</div>



<div class="s-rule consider">



**Consider** using the name SharedModule when the contents of a shared
module are referenced across the entire application.

</div>



<div class="s-rule avoid">



**Consider** _not_ providing services in shared modules. Services are usually
singletons that are provided once for the entire application or
in a particular feature module. There are exceptions, however. For example, in the sample code that follows, notice that the `SharedModule` provides `FilterTextService`. This is acceptable here because the service is stateless;that is, the consumers of the service aren't impacted by new instances.

</div>



<div class="s-rule do">



**Do** import all modules required by the assets in the `SharedModule`;
for example, `CommonModule` and `FormsModule`.

</div>



<div class="s-why">



**Why?** `SharedModule` will contain components, directives and pipes
that may need features from another common module; for example,
`ngFor` in `CommonModule`.


</div>



<div class="s-rule do">



**Do** declare all components, directives, and pipes in the `SharedModule`.

</div>



<div class="s-rule do">



**Do** export all symbols from the `SharedModule` that other feature modules need to use.

</div>



<div class="s-why">



**Why?** `SharedModule` exists to make commonly used components, directives and pipes available for use in the templates of components in many other modules.

</div>



<div class="s-rule avoid">



**Avoid** specifying app-wide singleton providers in a `SharedModule`. Intentional singletons are OK. Take care.


</div>



<div class="s-why">



**Why?** A lazy loaded feature module that imports that shared module will make its own copy of the service and likely have undesirable results.


</div>



<div class="s-why-last">



**Why?** You don't want each module to have its own separate instance of singleton services.
Yet there is a real danger of that happening if the `SharedModule` provides a service.


</div>



<div class='filetree'>

  <div class='file'>
    src
  </div>

  <div class='children'>

    <div class='file'>
      app
    </div>

    <div class='children'>

      <div class='file'>
        shared
      </div>

      <div class='children'>

        <div class='file'>
          shared.module.ts
        </div>

        <div class='file'>
          init-caps.pipe.ts|spec.ts
        </div>

        <div class='file'>
          filter-text.component.ts|spec.ts
        </div>

        <div class='file'>
          filter-text.service.ts|spec.ts
        </div>

      </div>

      <div class='file'>
        app.component.ts|html|css|spec.ts
      </div>

      <div class='file'>
        app.module.ts
      </div>

      <div class='file'>
        app-routing.module.ts
      </div>

    </div>

    <div class='file'>
      main.ts
    </div>

    <div class='file'>
      index.html
    </div>

  </div>

  <div class='file'>
    ...
  </div>

</div>





<code-tabs>

  <code-pane header="app/shared/shared.module.ts" path="styleguide/src/04-10/app/shared/shared.module.ts">

  </code-pane>

  <code-pane header="app/shared/init-caps.pipe.ts" path="styleguide/src/04-10/app/shared/init-caps.pipe.ts">

  </code-pane>

  <code-pane header="app/shared/filter-text/filter-text.component.ts" path="styleguide/src/04-10/app/shared/filter-text/filter-text.component.ts">

  </code-pane>

  <code-pane header="app/shared/filter-text/filter-text.service.ts" path="styleguide/src/04-10/app/shared/filter-text/filter-text.service.ts">

  </code-pane>

  <code-pane header="app/heroes/heroes.component.ts" path="styleguide/src/04-10/app/heroes/heroes.component.ts">

  </code-pane>

  <code-pane header="app/heroes/heroes.component.html" path="styleguide/src/04-10/app/heroes/heroes.component.html">

  </code-pane>

</code-tabs>




<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 04-11}

<!--
### Lazy Loaded folders
-->
### 지연 로딩 모듈의 폴더

#### Style 04-11

<!--
A distinct application feature or workflow may be *lazy loaded* or *loaded on demand* rather than when the application starts.
-->
애플리케이션 모듈은 *지연로딩*하거나 흐름상 *필요할 때 로드*할 수 있습니다. 그러면 애플리케이션에는 이 모듈이 제외되면서 초기 실행 속도가 빨라집니다.

<div class="s-rule do">


<!--
**Do** put the contents of lazy loaded features in a *lazy loaded folder*.
A typical *lazy loaded folder* contains a *routing component*, its child components, and their related assets and modules.
-->
지연로딩하는 모듈은 *지연 로딩용 폴더*에 따로 작성하세요.
일반적으로 이 폴더에는 *라우팅 컴포넌트*, 라우팅 컴포넌트의 자식 컴포넌트, 관련 리소스가 위치합니다.

</div>

<div class="s-why-last">


<!--
**Why?** The folder makes it easy to identify and isolate the feature content.
-->
**왜?** 폴더를 따로 나누면 지연로딩하는 모듈을 쉽게 구분할 수 있습니다.

</div>

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 04-12}

<!--
### Never directly import lazy loaded folders
-->
### 지연로딩 모듈을 직접 로드하지 마세요.

<!--
#### Style 04-12
-->
#### 스타일 04-12

<div class="s-rule avoid">


<!--
**Avoid** allowing modules in sibling and parent folders to directly import a module in a *lazy loaded feature*.
-->
이웃 폴더나 부모 폴더에서 *지연로딩 모듈*을 직접 로드하는 것은 피하세요.**

</div>

<div class="s-why-last">


<!--
**Why?** Directly importing and using a module will load it immediately when the intention is to load it on demand.
-->
**왜?** 지연모듈을 직접 로드하면 이 모듈이 사용된다는 것을 의미하며, 지연로딩되지 않고 애플리케이션이 시작될 때 즉시 로드됩니다. 지연로딩의 의미는 없어집니다.

</div>

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>


<!--
## Components
-->
## 컴포넌트

{@a 05-03}

<!--
### Components as elements
-->
### 엘리먼트로 사용하기

<!--
#### Style 05-03
-->
#### 스타일 05-03

<div class="s-rule do">

<!--
**Consider** giving components an _element_ selector, as opposed to _attribute_ or _class_ selectors.
-->
컴포넌트 셀렉터는 _어트리뷰트_ 나 _클래스_ 셀렉터보다 _엘리먼트_ 셀렉터로 사용하는 것을 **권장합니다.**

</div>

<div class="s-why">


<!--
**Why?** Components have templates containing HTML and optional Angular template syntax.
They display content.
Developers place components on the page as they would native HTML elements and web components.
-->
**왜?** 컴포넌트에는 HTML 문법으로 작성된 템플릿이 있으며, Angular에서 제공하는 템플릿 문법이 이 템플릿에 사용되기도 합니다.
컴포넌트의 역할은 컴포넌트의 내용을 화면을 표시하는 것입니다.
따라서 네이티브 HTML 엘리먼트나 웹 컴포넌트와 동일한 계층을 사용해서 엘리먼트 셀렉터로 지정하는 것이 좋습니다.

</div>

<div class="s-why-last">


<!--
**Why?** It is easier to recognize that a symbol is a component by looking at the template's html.
-->
**왜?** 컴포넌트 셀렉터를 엘리먼트로 지정하면, 템플릿을 봤을 때 어떤 것이 컴포넌트인지 쉽게 확인할 수 있습니다.

</div>

<div class="alert is-helpful">

<!--
There are a few cases where you give a component an attribute, such as when you want to augment a built-in element. For example, [Material Design](https://material.angular.io/components/button/overview) uses this technique with `<button mat-button>`. However, you wouldn't use this technique on a custom element.
-->
기본 엘리먼트에 추가 기능을 덧붙이는 아주 특이한 경우라면 어트리뷰트 셀렉터를 컴포넌트 셀렉터로 활용할 수도 있습니다. [Material Design](https://material.angular.io/components/button/overview)이 이 방식을 활용하고 있는데, 이 라이브러리는 버튼을 매터리얼 디자인으로 전환하기 위해 `<button mat-button>`과 같은 표현 방식을 사용합니다. 물론 어트리뷰트 셀렉터를 사용하는 대신 커스텀 엘리먼트로 구현해도 됩니다.

</div>

<code-example path="styleguide/src/05-03/app/heroes/shared/hero-button/hero-button.component.avoid.ts" region="example" header="app/heroes/hero-button/hero-button.component.ts">

</code-example>

<code-example path="styleguide/src/05-03/app/app.component.avoid.html" header="app/app.component.html">

</code-example>

<code-tabs>

  <code-pane header="app/heroes/shared/hero-button/hero-button.component.ts" path="styleguide/src/05-03/app/heroes/shared/hero-button/hero-button.component.ts" region="example">

  </code-pane>

  <code-pane header="app/app.component.html" path="styleguide/src/05-03/app/app.component.html">

  </code-pane>

</code-tabs>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 05-04}

<!--
### Extract templates and styles to their own files
-->
### 템플릿과 스타일은 개별 파일로 분리하기

<!--
#### Style 05-04
-->
#### 스타일 05-04

<div class="s-rule do">


<!--
**Do** extract templates and styles into a separate file, when more than 3 lines.
-->
템플릿과 스타일을 지정하는 코드가 3줄 이상 된다면 개별 파일로 **분리하세요.**

</div>



<div class="s-rule do">


<!--
**Do** name the template file `[component-name].component.html`, where [component-name] is the component name.
-->
템플릿 파일의 이름은 `[컴포넌트 이름].component.html`으로 **지정하세요.**

</div>

<div class="s-rule do">


<!--
**Do** name the style file `[component-name].component.css`, where [component-name] is the component name.
-->
스타일 파일의 이름은 `[컴포넌트 이름].component.css`로 **지정하세요.**

</div>



<div class="s-rule do">


<!--
**Do** specify _component-relative_ URLs, prefixed with `./`.
-->
컴포넌트 클래스에서는 `./`로 시작하는 _상대 주소_ 로 **참조하세요.**

</div>



<div class="s-why">


<!--
**Why?** Large, inline templates and styles obscure the component's purpose and implementation, reducing readability and maintainability.
-->
**왜?** 템플릿과 스타일을 컴포넌트 클래스 파일 안에 길게 작성하면 가독성이 떨어지고 유지보수하기도 어려워 집니다.

</div>



<div class="s-why">


<!--
**Why?** In most editors, syntax hints and code snippets aren't available when developing inline templates and styles.
The Angular TypeScript Language Service (forthcoming) promises to overcome this deficiency for HTML templates
in those editors that support it; it won't help with CSS styles.
-->
**왜?** 최근에 사용되는 에디터 중 일부는 인라인 템플릿이나 인라인 스타일에 적용되는 코드 하이라이팅 기능과 자동완성 기능이 충분하지 않은 경우가 있습니다.
Angular는 앞으로 HTML 템플릿에도 이 기능을 지원할 수 있도록 노력할 예정이지만, 아직 CSS에 대해서는 정해지지 않았습니다.
다행히, 이 기능을 지원하는 IDE는 점점 늘어나고 있습니다.

</div>



<div class="s-why">


<!--
**Why?** A _component relative_ URL requires no change when you move the component files, as long as the files stay together.
-->
**왜?** 컴포넌트 템플릿 파일과 스타일 파일을 _상대 주소_ 로 지정하면, 컴포넌트 파일을 다른 곳으로 옮기더라도 함께 움직이기 때문에 참조하는 주소를 수정할 필요가 없습니다.

</div>



<div class="s-why-last">


<!--
**Why?** The `./` prefix is standard syntax for relative URLs; don't depend on Angular's current ability to do without that prefix.
-->
**왜?** `./` 접미사는 상대주소를 표현하는 표준 문법입니다. Angular와는 관련이 없습니다.


</div>



<code-example path="styleguide/src/05-04/app/heroes/heroes.component.avoid.ts" region="example" header="app/heroes/heroes.component.ts">

</code-example>





<code-tabs>

  <code-pane header="app/heroes/heroes.component.ts" path="styleguide/src/05-04/app/heroes/heroes.component.ts" region="example">

  </code-pane>

  <code-pane header="app/heroes/heroes.component.html" path="styleguide/src/05-04/app/heroes/heroes.component.html">

  </code-pane>

  <code-pane header="app/heroes/heroes.component.css" path="styleguide/src/05-04/app/heroes/heroes.component.css">

  </code-pane>

</code-tabs>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 05-12}

<!--
### Decorate _input_ and _output_ properties
-->
### _입력_ 프로퍼티와 _출력_ 프로퍼티 지정하기

<!--
#### Style 05-12
-->
#### 스타일 05-12

<div class="s-rule do">


<!--
**Do** use the `@Input()` and `@Output()` class decorators instead of the `inputs` and `outputs` properties of the
`@Directive` and `@Component` metadata:
-->
컴포넌트의 입출력 프로퍼티는 `@Directive`나 `@Component` 메타데이터의 `inputs`, `outputs`로 지정하지 말고 `@Input()`, `@Output()` 데코레이터로 **지정하세요**

</div>



<div class="s-rule consider">


<!--
**Consider** placing `@Input()` or `@Output()` on the same line as the property it decorates.
-->
`@Input()`, `@Output()` 데코레이터는 프로퍼티 이름과 같은 줄에 놓는 것을 **권장합니다.**

</div>



<div class="s-why">


<!--
**Why?** It is easier and more readable to identify which properties in a class are inputs or outputs.
-->
**왜?** 입출력 데코레이터를 사용하면 클래스 프로퍼티 중 어떤 것이 입력 프로퍼티이고 어떤 것이 출력 프로퍼티인지 쉽게 구분할 수 있습니다.

</div>



<div class="s-why">


<!--
**Why?** If you ever need to rename the property or event name associated with
`@Input` or `@Output`, you can modify it in a single place.
-->
**왜?** 클래스 프로퍼티에 입출력 데코레이터를 지정하면, 이 프로퍼티 이름을 다른 이름으로 바인딩 받거나 이벤트 이름을 다르게 지정할 때도 관련된 내용을 한 곳에서 모두 수정할 수 있습니다.

</div>



<div class="s-why">


<!--
**Why?** The metadata declaration attached to the directive is shorter and thus more readable.
-->
**왜?** 메타데이터 선언은 짧을수록 가독성이 좋아집니다.

</div>



<div class="s-why-last">


<!--
**Why?** Placing the decorator on the same line _usually_ makes for shorter code and still easily identifies the property as an input or output.
Put it on the line above when doing so is clearly more readable.
-->
**왜?** 데코레이터를 프로퍼티 이름 바로 앞에 같은 줄로 두면 전체 코드 라인을 많이 늘리지 않으며, 어떤 프로퍼티가 입력 프로퍼티이고 출력 프로퍼티인지 쉽게 알아볼 수 있습니다.
다른 줄로 분리할 때 가독성이 좋아지는 것이 명확할 때만 데코레이터를 프로퍼티 선언과 다른 줄로 분리하세요.

</div>



<code-example path="styleguide/src/05-12/app/heroes/shared/hero-button/hero-button.component.avoid.ts" region="example" header="app/heroes/shared/hero-button/hero-button.component.ts">

</code-example>





<code-example path="styleguide/src/05-12/app/heroes/shared/hero-button/hero-button.component.ts" region="example" header="app/heroes/shared/hero-button/hero-button.component.ts">

</code-example>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>


{@a 05-13}

<!--
### Avoid aliasing _inputs_ and _outputs_
-->
### 입력 프로퍼티와 출력 프로퍼티에 별칭(alias) 사용하지 않기

<!--
#### Style 05-13
-->
#### 스타일 05-13

<div class="s-rule avoid">


<!--
**Avoid** _input_ and _output_ aliases except when it serves an important purpose.
-->
꼭 사용해야 하는 경우가 아니라면 입력 프로퍼티와 출력 프로퍼티에 별칭을 지정하지 **마세요.**

</div>



<div class="s-why">


<!--
**Why?** Two names for the same property (one private, one public) is inherently confusing.
-->
**왜?** 컴포넌트 외부에서 사용하는 프로퍼티 이름과 내부에서 사용하는 프로퍼티 이름이 다르다면, 당연히 헷갈릴 수 밖에 없습니다.

</div>



<div class="s-why-last">


<!--
**Why?** You should use an alias when the directive name is also an _input_ property,
and the directive name doesn't describe the property.
-->
**왜?** 별칭은 디렉티브 이름이 _입력_ 프로퍼티와 같을 때, 디렉티브 이름으로는 프로퍼티를 확인하기 어려울 때만 사용하는 것이 좋습니다.

</div>



<code-example path="styleguide/src/05-13/app/heroes/shared/hero-button/hero-button.component.avoid.ts" region="example" header="app/heroes/shared/hero-button/hero-button.component.ts">

</code-example>





<code-example path="styleguide/src/05-13/app/app.component.avoid.html" header="app/app.component.html">

</code-example>





<code-tabs>

  <code-pane header="app/heroes/shared/hero-button/hero-button.component.ts" path="styleguide/src/05-13/app/heroes/shared/hero-button/hero-button.component.ts" region="example">

  </code-pane>

  <code-pane header="app/heroes/shared/hero-button/hero-highlight.directive.ts" path="styleguide/src/05-13/app/heroes/shared/hero-highlight.directive.ts">

  </code-pane>

  <code-pane header="app/app.component.html" path="styleguide/src/05-13/app/app.component.html">

  </code-pane>

</code-tabs>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 05-14}

<!--
### Member sequence
-->
### 클래스 멤버의 순서

<!--
#### Style 05-14
-->
#### 스타일 05-14

<div class="s-rule do">


<!--
**Do** place properties up top followed by methods.
-->
메소드보다 프로퍼티를 먼저 **선언하세요.**

</div>



<div class="s-rule do">


<!--
**Do** place private members after public members, alphabetized.
-->
private 멤버보다 public 멤버를 먼저, 이들끼리는 알파벳 순서로 **선언하세요.**

</div>



<div class="s-why-last">


<!--
**Why?** Placing members in a consistent sequence makes it easy to read and
helps instantly identify which members of the component serve which purpose.
-->
**왜?** 클래스 멤버를 일관된 순서로 선언하면 코드의 가독성이 좋아지며, 이 컴포넌트가 어떤 역할을 하는지 정보를 제공할 수도 있습니다.

</div>



<code-example path="styleguide/src/05-14/app/shared/toast/toast.component.avoid.ts" region="example" header="app/shared/toast/toast.component.ts">

</code-example>





<code-example path="styleguide/src/05-14/app/shared/toast/toast.component.ts" region="example" header="app/shared/toast/toast.component.ts">

</code-example>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 05-15}

<!--
### Delegate complex component logic to services
-->
### 복잡한 컴포넌트 로직은 서비스로 옮기기

<!--
#### Style 05-15
-->
#### 스타일 05-15

<div class="s-rule do">


<!--
**Do** limit logic in a component to only that required for the view. All other logic should be delegated to services.
-->
컴포넌트에 작성하는 로직은 뷰와 관련된 로직으로만 **제한하세요.** 뷰와 관계없는 로직은 모두 서비스로 옮기는 것이 좋습니다.

</div>



<div class="s-rule do">


<!--
**Do** move reusable logic to services and keep components simple and focused on their intended purpose.
-->
다른 컴포넌트에서 재사용할 수 있는 로직도 서비스로 옮기세요. 컴포넌트에는 그 역할에 맞는 기능만 간결하게 작성해야 합니다.

</div>



<div class="s-why">


<!--
**Why?** Logic may be reused by multiple components when placed within a service and exposed via a function.
-->
**왜?** 다른 컴포넌트에도 재사용할 수 있는 로직을 서비스 안에 함수로 작성하면 필요한 곳에 자유롭게 활용할 수 있습니다.

</div>



<div class="s-why">


<!--
**Why?** Logic in a service can more easily be isolated in a unit test, while the calling logic in the component can be easily mocked.
-->
**왜?** 컴포넌트에서 사용하는 서비스 로직은 목업 로직으로 쉽게 대체할 수 있기 때문에 유닛 테스트에도 유리합니다.


</div>



<div class="s-why">


<!--
**Why?** Removes dependencies and hides implementation details from the component.
-->
**왜?** 컴포넌트의 로직을 서비스로 옮기면 컴포넌트에 주입하는 의존성을 줄일 수 있으며, 컴포넌트에 꼭 필요한 로직만 작성하기 쉬워집니다.

</div>



<div class="s-why-last">


<!--
**Why?** Keeps the component slim, trim, and focused.
-->
**왜?** 컴포넌트 코드는 짧게, 간결하게, 꼭 필요한 로직만 작성하세요.

</div>



<code-example path="styleguide/src/05-15/app/heroes/hero-list/hero-list.component.avoid.ts" header="app/heroes/hero-list/hero-list.component.ts">

</code-example>





<code-example path="styleguide/src/05-15/app/heroes/hero-list/hero-list.component.ts" region="example" header="app/heroes/hero-list/hero-list.component.ts">

</code-example>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 05-16}

<!--
### Don't prefix _output_ properties
-->
### _출력_ 프로퍼티에 접두사를 붙이지 마세요.

<!--
#### Style 05-16
-->
#### 스타일 05-16

<div class="s-rule do">


<!--
**Do** name events without the prefix `on`.
-->
출력 프로퍼티로 이벤트를 보낼 때 이 이벤트 이름에 `on`을 **붙이지 마세요.**

</div>



<div class="s-rule do">


<!--
**Do** name event handler methods with the prefix `on` followed by the event name.
-->
`on` 접두사는 해당 이벤트를 받는 이벤트 핸들러 메소드 이름에 **붙이세요.**

</div>



<div class="s-why">


<!--
**Why?** This is consistent with built-in events such as button clicks.
-->
**왜?** 버튼 클릭과 같은 내장 이벤트를 처리할 때도 이 방식을 사용합니다.

</div>



<div class="s-why-last">


<!--
**Why?** Angular allows for an [alternative syntax](guide/template-syntax#binding-syntax) `on-*`. If the event itself was prefixed with `on` this would result in an `on-onEvent` binding expression.
-->
**왜?** Angular에서 제공하는 문법 중 `on-*`을 붙이는 문법은 [이벤트 바인딩을 사용하는 방법](guide/template-syntax#바인딩-문법) 중 하나입니다. 그래서 이벤트 이름에 `on`을 붙이면, 이 이벤트를 바인딩할 때 `on-onEvent`와 같은 표현을 사용해야 합니다.

</div>



<code-example path="styleguide/src/05-16/app/heroes/hero.component.avoid.ts" region="example" header="app/heroes/hero.component.ts">

</code-example>





<code-example path="styleguide/src/05-16/app/app.component.avoid.html" header="app/app.component.html">

</code-example>





<code-tabs>

  <code-pane header="app/heroes/hero.component.ts" path="styleguide/src/05-16/app/heroes/hero.component.ts" region="example">

  </code-pane>

  <code-pane header="app/app.component.html" path="styleguide/src/05-16/app/app.component.html">

  </code-pane>

</code-tabs>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 05-17}

<!--
### Put presentation logic in the component class
-->
### 뷰에 사용하는 로직은 컴포넌트 클래스에 작성하기

<!--
#### Style 05-17
-->
#### 스타일 05-17

<div class="s-rule do">


<!--
**Do** put presentation logic in the component class, and not in the template.
-->
뷰에 사용하는 로직은 템플릿이 아니라 컴포넌트 클래스에 **작성하세요.**

</div>



<div class="s-why">


<!--
**Why?** Logic will be contained in one place (the component class) instead of being spread in two places.
-->
**왜?** 컴포넌트를 처리하는 로직은 템플릿과 클래스에 나눠서 작성하는 것보다 컴포넌트 클래스 한 곳에 작성하는 것이 좋습니다.

</div>



<div class="s-why-last">


<!--
**Why?** Keeping the component's presentation logic in the class instead of the template improves testability, maintainability, and reusability.
-->
**왜?** 뷰와 관련된 로직을 템플릿에 두지 않고 클래스에 두면 컴포넌트를 테스트하기 편하며, 유지보수하기도 편하고 재사용하기에도 유리합니다.

</div>



<code-example path="styleguide/src/05-17/app/heroes/hero-list/hero-list.component.avoid.ts" region="example" header="app/heroes/hero-list/hero-list.component.ts">

</code-example>





<code-example path="styleguide/src/05-17/app/heroes/hero-list/hero-list.component.ts" region="example" header="app/heroes/hero-list/hero-list.component.ts">

</code-example>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

<!--
## Directives
-->
## 디렉티브

{@a 06-01}

<!--
### Use directives to enhance an element
-->
### 디렉티브는 엘리먼트를 확장하는 용도로 사용하세요.

<!--
#### Style 06-01
-->
#### 스타일 06-01

<div class="s-rule do">


<!--
**Do** use attribute directives when you have presentation logic without a template.
-->
어트리뷰트 디렉티브는 템플릿에 필요한 로직을 구현할 때 **사용하세요.**

</div>



<div class="s-why">


<!--
**Why?** Attribute directives don't have an associated template.
-->
**왜?** 어트리뷰트 디렉티브에는 템플릿이 없습니다.

</div>



<div class="s-why-last">


<!--
**Why?** An element may have more than one attribute directive applied.
-->
**왜?** 엘리먼트 하나에는 여러 개의 어트리뷰트 디렉티브가 적용될 수도 있습니다.

</div>



<code-example path="styleguide/src/06-01/app/shared/highlight.directive.ts" region="example" header="app/shared/highlight.directive.ts">

</code-example>





<code-example path="styleguide/src/06-01/app/app.component.html" header="app/app.component.html">

</code-example>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 06-03}

<!--
### _HostListener_/_HostBinding_ decorators versus _host_ metadata
-->
### _HostListener_/_HostBinding_ 데코레이터 vs. _host_ 메타데이터

<!--
#### Style 06-03
-->
#### 스타일 06-03

<div class="s-rule consider">


<!--
**Consider** preferring the `@HostListener` and `@HostBinding` to the
`host` property of the `@Directive` and `@Component` decorators.
-->
`@Directive`나 `@Component` 데코레이터의 `host` 프로퍼티를 활용할 수 있는 로직은 `@HostListener`와 `@HostBinding`으로 사용하는 것을 권장합니다.

</div>



<div class="s-rule do">


<!--
**Do** be consistent in your choice.
-->
코드의 일관성을 **유지하세요.**

</div>



<div class="s-why-last">


<!--
**Why?** The property associated with `@HostBinding` or the method associated with `@HostListener`
can be modified only in a single place&mdash;in the directive's class.
If you use the `host` metadata property, you must modify both the property/method declaration in the
directive's class and the metadata in the decorator associated with the directive.
-->
**왜?** `@HostBinding`과 연결된 프로퍼티나 `@HostListener`에 연결된 메소드는 이 데코레이터가 지정된 디렉티브 클래스 안 어디에나 선언하기만 하면 됩니다.
하지만 `host` 메타데이터 프로퍼티를 사용하면, 이렇게 프로퍼티나 메소드를 데코레이터와 클래스 모드 양쪽에 선언해야 합니다.

</div>



<code-example path="styleguide/src/06-03/app/shared/validator.directive.ts" header="app/shared/validator.directive.ts">

</code-example>


<!--
Compare with the less preferred `host` metadata alternative.
-->
권장하지 않는 `host` 메타데이터를 사용하면 같은 내용을 어떻게 구현할 수 있는지 확인해 보세요.

<div class="s-why-last">


<!--
**Why?** The `host` metadata is only one term to remember and doesn't require extra ES imports.
-->
**왜?** `host` 메타데이터를 사용하는 것도 이벤트를 바인딩하는 방법 중 하나지만, 더 효율적인 방법을 선택하는 것이 좋습니다.

</div>



<code-example path="styleguide/src/06-03/app/shared/validator2.directive.ts" header="app/shared/validator2.directive.ts">

</code-example>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

<!--
## Services
-->
## 서비스

{@a 07-01}

<!--
### Services are singletons
-->
### 서비스는 싱글턴이어야 합니다.

<!--
#### Style 07-01
-->
#### 스타일 07-01

<div class="s-rule do">


<!--
**Do** use services as singletons within the same injector. Use them for sharing data and functionality.
-->
서비스는 같은 인젝터를 사용해서 싱글턴으로 **사용하세요.** 서비스는 데이터와 함수를 공유하는 방식으로 사용해야 합니다.

</div>



<div class="s-why">


<!--
**Why?** Services are ideal for sharing methods across a feature area or an app.
-->
**왜?** 서비스는 여러 컴포넌트에 사용되는 기능을 한 곳에 모아두기 위해 만드는 것입니다.

</div>



<div class="s-why-last">


<!--
**Why?** Services are ideal for sharing stateful in-memory data.
-->
**왜?** 서비스는 인-메모리 데이터를 공유하는 방식으로 사용하는 것이 가장 좋습니다.

</div>



<code-example path="styleguide/src/07-01/app/heroes/shared/hero.service.ts" region="example" header="app/heroes/shared/hero.service.ts">

</code-example>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 07-02}

<!--
### Single responsibility
-->
### 단일 책임 원칙

<!--
#### Style 07-02
-->
#### 스타일 07-02

<div class="s-rule do">


<!--
**Do** create services with a single responsibility that is encapsulated by its context.
-->
서비스에는 그 서비스를 구현하는 목적에 해당하는 기능만 **구현하세요.**

</div>



<div class="s-rule do">


<!--
**Do** create a new service once the service begins to exceed that singular purpose.
-->
기존에 있는 서비스의 범위에 벗어나는 기능이 필요할 때 새로운 서비스를 **만드세요.**

</div>



<div class="s-why">


<!--
**Why?** When a service has multiple responsibilities, it becomes difficult to test.
-->
**왜?** 서비스에 여러 용도의 기능을 구현하면 테스트하기 힘들어 집니다.

</div>



<div class="s-why-last">


<!--
**Why?** When a service has multiple responsibilities, every component or service that injects it now carries the weight of them all.
-->
**왜?** 서비스에 여러 용도의 기능을 구현하면, 컴포넌트나 다른 서비스에 이 서비스를 의존성으로 주입할 때 모든 기능을 한 번에 가지고 다녀야 합니다.

</div>

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 07-03}

<!--
### Providing a service
-->
### 서비스 프로바이더

<!--
#### Style 07-03
-->
#### 스타일 07-03

<div class="s-rule do">


<!--
**Do** provide a service with the app root injector in the `@Injectable` decorator of the service.
-->
서비스는 `@Injectable` 데코레이터를 사용해서 애플리케이션 최상위 인젝터에 **등록하세요.**

</div>



<div class="s-why">


<!--
**Why?** The Angular injector is hierarchical.
-->
**왜?** Angular 인젝터는 계층에 따라 구성됩니다.

</div>



<div class="s-why">


<!--
**Why?** When you provide the service to a root injector, that instance of the service is shared and available in every class that needs the service. This is ideal when a service is sharing methods or state.
-->
**왜?** 애플리케이션 최상위 인젝터에 서비스 프로바이더를 등록하면, 이 서비스의 인스턴스는 모든 클래스에 공유되며, 서비스의 스테이트나 메소드를 함께 활용할 수 있습니다. 서비스는 이런 방식으로 사용하는 것이 가장 좋습니다.

</div>



<div class="s-why">


<!--
**Why?** When you register a service in the `@Injectable` decorator of the service, optimization tools such as those used by the [Angular CLI's](cli) production builds can perform tree shaking and remove services that aren't used by your app.
-->
**왜?** `@Injectable` 데코레이터를 사용해서 서비스를 등록하면, [Angular CLI's](cli)와 같은 툴로 빌드할 때 앱에서 실제로 사용하지 않는 서비스를 트리 셰이킹으로 모두 제거할 수 있습니다.

</div>



<div class="s-why-last">


<!--
**Why?** This is not ideal when two different components need different instances of a service. In this scenario it would be better to provide the service at the component level that needs the new and separate instance.
-->
**왜?** 같은 서비스를 의존성으로 주입받는 두 컴포넌트가 서로 다른 인스턴스를 사용하는 것은 서비스를 구현의도에 맞게 사용하는 방법이 아닙니다. 이 방식은 두 컴포넌트가 사용하는 서비스의 인스턴스를 명확하게 분리할 필요가 있을 때만 사용하는 방식입니다.

</div>

<code-example path="dependency-injection/src/app/tree-shaking/service.ts" header="src/app/treeshaking/service.ts" linenums="false"> </code-example>




<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 07-04}

<!--
### Use the @Injectable() class decorator
-->
### @Injectable() 클래스 데코레이터를 사용하세요.

<!--
#### Style 07-04
-->
#### 스타일 07-04

<div class="s-rule do">


<!--
**Do** use the `@Injectable()` class decorator instead of the `@Inject` parameter decorator when using types as tokens for the dependencies of a service.
-->
서비스를 토큰으로 참조할 때 `@Inject` 파라미터 데코레이터 대신 `@Injectable()` 클래스 데코레이터를 **사용하세요.**

</div>



<div class="s-why">


<!--
**Why?** The Angular Dependency Injection (DI) mechanism resolves a service's own
dependencies based on the declared types of that service's constructor parameters.
-->
**왜?** 서비스에도 의존성으로 주입하는 객체가 있을 수 있습니다. 이 때 Angular 의존성 주입 메커니즘에 따라 올바른 의존성 객체를 주입하려면, 서비스 생성자에 의존성 객체의 타입을 명시해야 합니다.

</div>



<div class="s-why-last">


<!--
**Why?** When a service accepts only dependencies associated with type tokens, the `@Injectable()` syntax is much less verbose compared to using `@Inject()` on each individual constructor parameter.
-->
**왜?** 서비스를 토큰으로 주입하는 경우를 생각해보면, 생성자의 인자마다 `@Inject()`를 지정하는 것보다 `@Injectable()`로 서비스를 등록하고 토큰으로 바로 지정하는 것이 훨씬 간단합니다.

</div>



<code-example path="styleguide/src/07-04/app/heroes/shared/hero-arena.service.avoid.ts" region="example" header="app/heroes/shared/hero-arena.service.ts">

</code-example>





<code-example path="styleguide/src/07-04/app/heroes/shared/hero-arena.service.ts" region="example" header="app/heroes/shared/hero-arena.service.ts">

</code-example>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

<!--
## Data Services
-->
## 데이터 서비스

{@a 08-01}

<!--
### Talk to the server through a service
-->
### 서버와 통신할 때는 서비스를 사용하세요.

<!--
#### Style 08-01
-->
#### 스타일 08-01

<div class="s-rule do">


<!--
**Do** refactor logic for making data operations and interacting with data to a service.
-->
데이터를 가져오거나 변형하는 로직은 서비스에 **작성하세요.**

</div>



<div class="s-rule do">


<!--
**Do** make data services responsible for XHR calls, local storage, stashing in memory, or any other data operations.
-->
XHR 통신으로 데이터를 가져오거나 로컬 스토리지, 메모리에 데이터를 저장하는 로직은 서비스에 **작성하세요.**

</div>



<div class="s-why">


<!--
**Why?** The component's responsibility is for the presentation and gathering of information for the view. It should not care how it gets the data, just that it knows who to ask for it. Separating the data services moves the logic on how to get it to the data service, and lets the component be simpler and more focused on the view.
-->
**왜?** 컴포넌트는 화면을 담당하며, 화면에 표시된 정보를 모으는 것까지만 컴포넌트의 역할입니다. 어딘가에서 데이터를 가져오는 로직은 컴포넌트가 담당하는 것이 아니며, 이 역할을 담당하는 무언가를 활용하기만 할 뿐입니다. 데이터를 처리하는 로직은 모두 서비스로 옮기고, 컴포넌트는 화면을 담당하는 역할에 집중하도록 하세요.

</div>



<div class="s-why">


<!--
**Why?** This makes it easier to test (mock or real) the data calls when testing a component that uses a data service.
-->
**왜?** 데이터를 가져오는 로직을 컴포넌트에서 제거하면 목업 서비스를 활용할 수 있기 때문에 테스트하기 더 편합니다.

</div>



<div class="s-why-last">


<!--
**Why?** The details of data management, such as headers, HTTP methods,
caching, error handling, and retry logic, are irrelevant to components
and other data consumers.
-->
**왜?** 헤더를 지정하거나 HTTP 메소드를 선택하는 로직, 캐싱, 에러 처리, 실패했을 때 재시도하는 로직 등 데이터를 처리하는 로직은 컴포넌트와 직접적인 연관이 없습니다.

<!--
A data service encapsulates these details. It's easier to evolve these
details inside the service without affecting its consumers. And it's
easier to test the consumers with mock service implementations.
-->
이 로직들은 데이터 서비스 안쪽에 구현하는 것이 좋습니다. 그러면 데이터를 사용하는 쪽과 관계없이 로직을 수정하거나 확장할 수 있으며, 컴포넌트에 목업 서비스를 주입해서 테스트하기도 편해집니다.

</div>

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

<!--
## Lifecycle hooks
-->
## 라이프싸이클 후킹

<!--
Use Lifecycle hooks to tap into important events exposed by Angular.
-->
Angular 컴포넌트가 실행되는 각 이벤트 시점을 활용하려면 라이프싸이클 후킹 함수를 사용하세요.

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 09-01}

<!--
### Implement lifecycle hook interfaces
-->
### 라이프싸이클 후킹 인터페이스 구현

<!--
#### Style 09-01
-->
#### 스타일 09-01

<div class="s-rule do">


<!--
**Do** implement the lifecycle hook interfaces.
-->
라이프싸이클 후킹 인터페이스를 **구현하세요.**

</div>



<div class="s-why-last">


<!--
**Why?** Lifecycle interfaces prescribe typed method
signatures. Use those signatures to flag spelling and syntax mistakes.
-->
**왜?** 라이프싸이클 인터페이스는 Angular 컴포넌트의 이벤트 시점을 활용할 수 있는 메소드를 미리 정의해 둔 것입니다. 이 메소드를 그대로 활용하면 오타를 내거나 문법을 잘못 사용하는 실수를 방지할 수 있습니다.

</div>



<code-example path="styleguide/src/09-01/app/heroes/shared/hero-button/hero-button.component.avoid.ts" region="example" header="app/heroes/shared/hero-button/hero-button.component.ts">

</code-example>





<code-example path="styleguide/src/09-01/app/heroes/shared/hero-button/hero-button.component.ts" region="example" header="app/heroes/shared/hero-button/hero-button.component.ts">

</code-example>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

<!--
## Appendix
-->
## 부록

<!--
Useful tools and tips for Angular.
-->
Angular 애플리케이션을 개발할 때 활용할 수 있는 툴과 팁을 알아봅시다.

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a A-01}

### Codelyzer

<!--
#### Style A-01
-->
#### 스타일 A-01


<div class="s-rule do">


<!--
**Do** use [codelyzer](https://www.npmjs.com/package/codelyzer) to follow this guide.
-->
이 가이드 문서를 활용할 때 [codelyzer](https://www.npmjs.com/package/codelyzer)를 **활용하세요.**

</div>



<div class="s-rule consider">


<!--
**Consider** adjusting the rules in codelyzer to suit your needs.
-->
codelyzer 룰은 필요한대로 수정해서 사용하는 것을 **권장합니다.**

</div>

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a A-02}

<!--
### File templates and snippets
-->
### 파일 템플릿과 자동 완성 플러그인(snippet)

<!--
#### Style A-02
-->
#### 스타일 A-02

<div class="s-rule do">


<!--
**Do** use file templates or snippets to help follow consistent styles and patterns. Here are templates and/or snippets for some of the web development editors and IDEs.
-->
코딩 스타일을 일관되게 유지하려면 파일 템플릿이나 자동완성 기능을 활용하세요. 템플릿, 코드 자동 완성 툴이나 IDE는 다음과 같은 것이 있습니다.

</div>



<div class="s-rule consider">


<!--
**Consider** using [snippets](https://marketplace.visualstudio.com/items?itemName=johnpapa.Angular2) for [Visual Studio Code](https://code.visualstudio.com/) that follow these styles and guidelines.
-->
[Visual Studio Code](https://code.visualstudio.com/)을 사용한다면 [이 기능](https://marketplace.visualstudio.com/items?itemName=johnpapa.Angular2)을 사용하는 것을 **권장합니다.**

<a href="https://marketplace.visualstudio.com/items?itemName=johnpapa.Angular2">
  <img src="generated/images/guide/styleguide/use-extension.gif" alt="Use Extension">
</a>

<!--
**Consider** using [snippets](https://atom.io/packages/angular-2-typescript-snippets) for [Atom](https://atom.io/) that follow these styles and guidelines.
-->
[Atom](https://atom.io/)을 사용한다면 [이 기능](https://atom.io/packages/angular-2-typescript-snippets)을 사용하는 것을 **권장합니다.**

<!--
**Consider** using [snippets](https://github.com/orizens/sublime-angular2-snippets) for [Sublime Text](http://www.sublimetext.com/) that follow these styles and guidelines.
-->
[Sublime Text](http://www.sublimetext.com/)를 사용한다면 [이 기능](https://github.com/orizens/sublime-angular2-snippets)을 사용하는 것을 **권장합니다.**

<!--
**Consider** using [snippets](https://github.com/mhartington/vim-angular2-snippets) for [Vim](http://www.vim.org/) that follow these styles and guidelines.
-->
[Vim](http://www.vim.org/)을 사용한다면 [이 기능](https://github.com/mhartington/vim-angular2-snippets)을 사용하는 것을 **권장합니다.**

</div>

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>
