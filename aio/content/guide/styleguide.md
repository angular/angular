<!--
# Style Guide
-->
# 코딩 스타일 가이드

<!--
Looking for an opinionated guide to Angular syntax, conventions, and application structure?
Step right in!
This style guide presents preferred conventions and, as importantly, explains why.
-->
Angular 문법, 코딩 컨벤션, 애플리케이션 구조에 대한 가이드를 찾고 계신가요?
바로 여기에 있습니다!
이 코딩 스타일 가이드는 많은 개발자들이 선호하는 코딩 스타일을 소개하면서, 그 이유도 함께 소개합니다.


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
**Avoid** indicates something you should almost never do. Code examples to *avoid* have an unmistakeable red header.
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
일부 예제에서는 파일 하나를 언급하거나, 관련된 파일을 함께 언급하는 경우가 있습니다.
예를 들면 `hero.component.ts` 파일을 설명하면서 `hero.component.html` 파일을 설명하는 경우가 있습니다.

<!--
The guideline uses the shortcut `hero.component.ts|html|css|spec` to represent those various files. Using this shortcut makes this guide's file structures easier to read and more terse.
-->
이 문서는 연관된 파일을 간단하게 표시하기 위해 `hero.component.ts|html|css|spec`라는 표현을 사용합니다.
이 표현을 사용하면 파일 구조를 좀 더 이해하기 편할 것입니다.

{@a single-responsibility}


<!--
## Single responsibility
-->
## 단일 책임 (Single responsibility)

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
**왜?** 한 파일에 컴포넌트 하나만 정의되면, 라우터로 지연로딩할 때 기본 export 항목으로 지정할 수 있습니다.

</div>


<!--
The key is to make the code more reusable, easier to read, and less mistake prone.
-->
요점은 코드를 좀 더 재사용성하기 편하게, 읽기 쉽게, 실수를 최대한 방지하게 하는 것입니다.

<!--
The following *negative* example defines the `AppComponent`, bootstraps the app,
defines the `Hero` model object, and loads heroes from the server all in the same file.
*Don't do this*.
-->
다음 예제는 `AppComponent`를 정의하면서 앱을 부트스트랩하고, `Hero` 모델을 정의하고 서버에서 데이터를 받아오는 동작을 모두 한 파일에서 하고 있습니다. *이렇게 작성하지 마세요.*

<code-example path="styleguide/src/01-01/app/heroes/hero.component.avoid.ts" title="app/heroes/hero.component.ts">

</code-example>


<!--
It is a better practice to redistribute the component and its
supporting classes into their own, dedicated files.
-->
이런 코드는 각각의 역할에 맞게 개별 파일로 작성하는 것이 더 좋습니다.

<code-tabs>

  <code-pane title="main.ts" path="styleguide/src/01-01/main.ts">

  </code-pane>

  <code-pane title="app/app.module.ts" path="styleguide/src/01-01/app/app.module.ts">

  </code-pane>

  <code-pane title="app/app.component.ts" path="styleguide/src/01-01/app/app.component.ts">

  </code-pane>

  <code-pane title="app/heroes/heroes.component.ts" path="styleguide/src/01-01/app/heroes/heroes.component.ts">

  </code-pane>

  <code-pane title="app/heroes/shared/hero.service.ts" path="styleguide/src/01-01/app/heroes/shared/hero.service.ts">

  </code-pane>

  <code-pane title="app/heroes/shared/hero.model.ts" path="styleguide/src/01-01/app/heroes/shared/hero.model.ts">

  </code-pane>

  <code-pane title="app/heroes/shared/mock-heroes.ts" path="styleguide/src/01-01/app/heroes/shared/mock-heroes.ts">

  </code-pane>

</code-tabs>


<!--
As the app grows, this rule becomes even more important.
<a href="#toc">Back to top</a>
-->
앱이 복잡해 질수록 이 규칙은 점점 더 중요해집니다.
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
명명 규칙은 앱의 유지보수성이나 가독성 측면에서 아주 중요합니다. 이번 가이드에서는 파일의 이름이나 심볼 이름에 대한 명명 규칙을 제안합니다.


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
**왜?** 명명 규칙은 파일의 내용을 쉽게 파악하는 데에도 도움이 됩니다. 그래서 파일의 이름은 일관된 규칙으로 정해져야 합니다. 프로젝트나 팀에 관련된 일관성이라도 좋습니다. 회사 전체에 일관된 명명 규칙을 사용한다면 더 효율적입니다.

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
**왜?** `.service`와 같이 단어는 축약하지 않는 것이 좋습니다. `.srv`, `.svc`, `.serv`와 같은 단어는 혼란을 줄 수 있습니다.

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
**왜?** Angular 애플리케이션을 시작하는 로직은 실행 환경에 따라 달라질 수 있습니다. 이 로직은 플랫폼에 따라 다르게 구현하기 때문에 분리하는 것이 좋습니다.

</div>



<code-example path="styleguide/src/02-05/main.ts" title="main.ts">

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


**Why?** Keeps the element names consistent with the specification for [Custom Elements](https://www.w3.org/TR/custom-elements/).

</div>



<code-example path="styleguide/src/05-02/app/heroes/shared/hero-button/hero-button.component.avoid.ts" region="example" title="app/heroes/shared/hero-button/hero-button.component.ts">

</code-example>





<code-tabs>

  <code-pane title="app/heroes/shared/hero-button/hero-button.component.ts" path="styleguide/src/05-02/app/heroes/shared/hero-button/hero-button.component.ts" region="example">

  </code-pane>

  <code-pane title="app/app.component.html" path="styleguide/src/05-02/app/app.component.html">

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
**Do** use a hyphenated, lowercase element selector value (e.g. `admin-users`).
-->
컴포넌트 셀렉터는 하이픈(`-`)으로 구분되는 소문자를 **사용하세요.** (예) `admin-users`)

</div>



<div class="s-rule do">


<!--
**Do** use a custom prefix for a component selector.
For example, the prefix `toh` represents from **T**our **o**f **H**eroes and the prefix `admin` represents an admin feature area.
-->
컴포넌트 셀렉터에는 커스텀 접두사를 **사용하세요.**
예를 들어 **T**our **o**f **H**eroes 프로젝트에서는 `toh`를 접두사로 사용할 수 있으며, 관리자용 기능이 구현되어 있는 곳에서는 `admin`을 접두사로 사용할 수 있습니다.

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
**왜?** 다른 앱에서 로드하는 컴포넌트를 구현한다면, 사용하기 편하고 잘 구분되는 이름을 사용하는 것이 좋습니다.

</div>



<div class="s-why-last">


<!--
**Why?** Components are easy to identify in the DOM.
-->
**왜?** DOM에 사용된 컴포넌트는 다른 네이티브 HTML 엘리먼트와 쉽게 구분되어야 합니다.

</div>



<code-example path="styleguide/src/02-07/app/heroes/hero.component.avoid.ts" region="example" title="app/heroes/hero.component.ts">

</code-example>





<code-example path="styleguide/src/02-07/app/users/users.component.avoid.ts" region="example" title="app/users/users.component.ts">

</code-example>





<code-example path="styleguide/src/02-07/app/heroes/hero.component.ts" region="example" title="app/heroes/hero.component.ts">

</code-example>





<code-example path="styleguide/src/02-07/app/users/users.component.ts" region="example" title="app/users/users.component.ts">

</code-example>



<a href="#toc">Back to top</a>

{@a 02-06}

### Directive selectors

#### Style 02-06


<div class="s-rule do">



**Do** Use lower camel case for naming the selectors of directives.


</div>



<div class="s-why">



**Why?** Keeps the names of the properties defined in the directives that are bound to the view consistent with the attribute names.


</div>



<div class="s-why-last">



**Why?** The Angular HTML parser is case sensitive and recognizes lower camel case.


</div>

<a href="#toc">Back to top</a>

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
커스텀 디렉티브의 셀렉터에는 접두사를 **사용하세요.** 예를 들어 **T**our **o**f **H**eroes 라면 `toh`를 접두사로 사용할 수 있습니다.

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



<code-example path="styleguide/src/02-08/app/shared/validate.directive.avoid.ts" region="example" title="app/shared/validate.directive.ts">

</code-example>





<code-example path="styleguide/src/02-08/app/shared/validate.directive.ts" region="example" title="app/shared/validate.directive.ts">

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

<!--
## Coding conventions
-->
## 코딩 컨벤션

<!--
Have a consistent set of coding, naming, and whitespace conventions.
-->
코드, 클래스와 변수 이름, 공백문자에 대한 코딩 컨벤션을 소개합니다.


{@a 03-01}

<!--
### Classes
-->
### 클래스

<!--
#### Style 03-01
-->
#### 스타일 03-01

<div class="s-rule do">


<!--
**Do** use upper camel case when naming classes.
-->
클래스 이름에는 대문자 캐멀 케이스를 **사용하세요.**

</div>



<div class="s-why">


<!--
**Why?** Follows conventional thinking for class names.
-->
**왜?** 클래스 이름은 다른 언어에서와 비슷한 방식을 따르는 것이 좋습니다.

</div>



<div class="s-why-last">


<!--
**Why?** Classes can be instantiated and construct an instance.
By convention, upper camel case indicates a constructable asset.
-->
**왜?** 클래스 이름은 인스턴스를 생성할 때 사용됩니다.
인스턴스로 생성되는 객체의 이름은 대문자 캐멀 케이스로 정의하는 것이 일반적입니다.

</div>



<code-example path="styleguide/src/03-01/app/core/exception.service.avoid.ts" region="example" title="app/shared/exception.service.ts">

</code-example>





<code-example path="styleguide/src/03-01/app/core/exception.service.ts" region="example" title="app/shared/exception.service.ts">

</code-example>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>


{@a 03-02}

<!--
### Constants
-->
### 상수

<!--
#### Style 03-02
-->
#### 스타일 03-02

<div class="s-rule do">


<!--
**Do** declare variables with `const` if their values should not change during the application lifetime.
-->
애플리케이션이 실행되는 동안 값이 변하지 않는 변수는 `const`로 **선언하세요.**

</div>



<div class="s-why">


<!--
**Why?** Conveys to readers that the value is invariant.
-->
**왜?** 이렇게 하면 해당 변수의 값이 변하지 않는다는 정보를 제공할 수 있습니다.

</div>



<div class="s-why-last">


<!--
**Why?** TypeScript helps enforce that intent by requiring immediate initialization and by
preventing subsequent re-assignment.
-->
**왜?** 이렇게 하면 TypeScript 컴파일러의 검사 로직이 동작하는데, 변수를 생성하면서 값을 초기화해야 하고 값이 재할당되는 것을 언어 레벨에서 방지할 수 있습니다.

</div>



<div class="s-rule consider">


<!--
**Consider** spelling `const` variables in lower camel case.
-->
상수의 이름은 소문자 캐멀 케이스로 지정하는 것을 **권장합니다.**

</div>



<div class="s-why">


<!--
**Why?** Lower camel case variable names (`heroRoutes`) are easier to read and understand
than the traditional UPPER_SNAKE_CASE names (`HERO_ROUTES`).
-->
**왜?** `heroRoutes`와 같이 소문자 캐멀 케이스로 선언한 변수는 `HERO_ROUTES`와 같은 대문자\_스네이크\_케이스 보다 읽기 편합니다.

</div>



<div class="s-why-last">


<!--
**Why?** The tradition of naming constants in UPPER_SNAKE_CASE reflects
an era before the modern IDEs that quickly reveal the `const` declaration.
TypeScript prevents accidental reassignment.
-->
**왜?** 상수의 이름은 대문자\_스네이크\_케이스 로 정의하는 것이 일반적입니다. 하지만 이 방식은 최신 IDE가 등장하기 이전의 방식이었고, 요즘 IDE에서는 `const` 키워드로 상수를 구별할 수 있습니다.
상수에 값이 재할당되는 것은 TypeScript로 방지할 수 있습니다.

</div>



<div class="s-rule do">


<!--
**Do** tolerate _existing_ `const` variables that are spelled in UPPER_SNAKE_CASE.
-->
이미 대문자\_스네이크\_케이스 로 사용된 `const` 변수는 그대로 **사용하세요.**

</div>



<div class="s-why-last">


<!--
**Why?** The tradition of UPPER_SNAKE_CASE remains popular and pervasive,
especially in third party modules.
It is rarely worth the effort to change them at the risk of breaking existing code and documentation.
-->
**왜?** 대문자\_스네이크\_케이스 는 상수를 선언할 때 널리 사용되는 방법이며, 서드 파티 모듈이라면 더욱 그렇습니다.
굳이 대문자\_스네이크\_케이스 를 소문자 캐멀 케이스로 바꿀 필요는 없으며, 이미 동작하고 있는 코드나 문서에 어긋나는 작업을 할 필요도 없습니다.

</div>



<code-example path="styleguide/src/03-02/app/core/data.service.ts" title="app/shared/data.service.ts">

</code-example>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>


{@a 03-03}

<!--
### Interfaces
-->
### 인터페이스

<!--
#### Style 03-03
-->
#### 스타일 03-03

<div class="s-rule do">


<!--
**Do** name an interface using upper camel case.
-->
인터페이스 이름은 대문자 캐멀 케이스로 **작성하세요.**

</div>



<div class="s-rule consider">


<!--
**Consider** naming an interface without an `I` prefix.
-->
인터페이스에 `I` 접두사는 사용하지 않는 것을 **권장합니다.**

</div>



<div class="s-rule consider">


<!--
**Consider** using a class instead of an interface for services and declarables (components, directives, and pipes).
-->
서비스나 컴포넌트, 디렉티브, 파이프에는 인터페이스 대신 클래스를 사용하는 것을 **권장합니다.**

</div>



<div class="s-rule consider">


<!--
**Consider** using an interface for data models.
-->
인터페이스는 데이터 모델로 사용하는 것을 **권장합니다.**

</div>



<div class="s-why">


<!--
**Why?** <a href="https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines">TypeScript guidelines</a>
discourage the `I` prefix.
-->
**왜?** <a href="https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines">TypeScript 공식 가이드라인</a>에서도 `I` 접두사는 사용하지 않는 것을 권장하고 있습니다.

</div>



<div class="s-why">


<!--
**Why?** A class alone is less code than a _class-plus-interface_.
-->
**왜?** _클래스와 인터페이스를 함께 사용하는 것_ 보다 클래스만 사용하는 것이 더 간단합니다.

</div>



<div class="s-why">


<!--
**Why?** A class can act as an interface (use `implements` instead of `extends`).
-->
**왜?** 클래스는 인터페이스로 사용할 수도 있습니다. (`extends` 대신 `implements`로 사용할 수 있습니다.)

</div>



<div class="s-why-last">


<!--
**Why?** An interface-class can be a provider lookup token in Angular dependency injection.
-->
**왜?** 인터페이스로 사용하는 클래스는 Angular 의존성을 주입할 때 토큰으로 참조할 수도 있습니다.

</div>



<code-example path="styleguide/src/03-03/app/core/hero-collector.service.avoid.ts" region="example" title="app/shared/hero-collector.service.ts">

</code-example>





<code-example path="styleguide/src/03-03/app/core/hero-collector.service.ts" region="example" title="app/shared/hero-collector.service.ts">

</code-example>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 03-04}

<!--
### Properties and methods
-->
### 프로퍼티, 메소드

<!--
#### Style 03-04
-->
#### 스타일 03-04

<div class="s-rule do">


<!--
**Do** use lower camel case to name properties and methods.
-->
프로퍼티와 메소드 이름에는 소문자 캐멀 케이스를 **사용하세요.**

</div>



<div class="s-rule avoid">


<!--
**Avoid** prefixing private properties and methods with an underscore.
-->
private 프로퍼티나 메소드에 밑줄(`_`)을 붙이는 것은 **피하세요.**

</div>



<div class="s-why">


<!--
**Why?** Follows conventional thinking for properties and methods.
-->
**왜?** 프로퍼티나 메소드 이름은 다른 언어에서도 사용하는 방식을 따르는 것이 좋습니다.

</div>



<div class="s-why">


<!--
**Why?** JavaScript lacks a true private property or method.
-->
**왜?** JavaScript에서 정말 private인 것은 없습니다.

</div>



<div class="s-why-last">


<!--
**Why?** TypeScript tooling makes it easy to identify private vs. public properties and methods.
-->
**왜?** private과 public을 구별하는 것은 TypeScript 툴로도 충분합니다.

</div>



<code-example path="styleguide/src/03-04/app/core/toast.service.avoid.ts" region="example" title="app/shared/toast.service.ts">

</code-example>





<code-example path="styleguide/src/03-04/app/core/toast.service.ts" region="example" title="app/shared/toast.service.ts">

</code-example>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 03-06}

<!--
### Import line spacing
-->
### Import 줄의 공백

<!--
#### Style 03-06
-->
#### 스타일 03-06

<div class="s-rule consider">


<!--
**Consider** leaving one empty line between third party imports and application imports.
-->
서드 파티 라이브러리를 로드하는 줄과 애플리케이션 심볼을 로드하는 줄 사이에는 빈 줄을 추가하는 것을 **권장합니다.**

</div>



<div class="s-rule consider">


<!--
**Consider** listing import lines alphabetized by the module.
-->
import 줄들은 로드하는 모듈 알파벳 순서로 정렬하는 것을 **권장합니다.**

</div>



<div class="s-rule consider">


<!--
**Consider** listing destructured imported symbols alphabetically.
-->
모듈 안에서 일부 심볼만 참조할 때, 이 심볼들은 알파벳 순서로 참조하는 것을 **권장합니다.**

</div>



<div class="s-why">


<!--
**Why?** The empty line separates _your_ stuff from _their_ stuff.
-->
**왜?** 서드 파티를 로드하는 줄과 애플리케이션 심볼을 로드하는 줄 사이에 빈 줄을 추가하면, _내가 만든_ 심볼과 _서드 파티에서 불러온_ 심볼을 구분할 수 있습니다.

</div>



<div class="s-why-last">


<!--
**Why?** Alphabetizing makes it easier to read and locate symbols.
-->
**왜?** 심볼을 알파벳 순서로 나열하면, 원하는 심볼을 쉽게 찾을 수 있습니다.

</div>



<code-example path="styleguide/src/03-06/app/heroes/shared/hero.service.avoid.ts" region="example" title="app/heroes/shared/hero.service.ts">

</code-example>





<code-example path="styleguide/src/03-06/app/heroes/shared/hero.service.ts" region="example" title="app/heroes/shared/hero.service.ts">

</code-example>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

<!--
## Application structure and NgModules
-->
## 애플리케이션 구조와 NgModule

<!--
Have a near-term view of implementation and a long-term vision. Start small but keep in mind where the app is heading down the road.
-->
단기적인 구현과 장기적인 계획을 함께 고려하세요. 코딩하는 내용이 적더라도 애플리케이션은 일관된 방향으로 나아가야 합니다.

<!--
All of the app's code goes in a folder named `src`.
All feature areas are in their own folder, with their own NgModule.
-->
애플리케이션의 코드는 모두 `src` 폴더 안에 작성하세요.
그리고 모든 기능은 그 기능을 표현하는 폴더의 NgModule 안에 들어가야 합니다.

<!--
All content is one asset per file. Each component, service, and pipe is in its own file.
All third party vendor scripts are stored in another folder and not in the `src` folder.
You didn't write them and you don't want them cluttering `src`.
Use the naming conventions for files in this guide.
-->
모든 컴포넌트나 서비스, 파이프는 개별 파일에 정의되어야 합니다.
그리고 서드 파티 스크립트들은 `src` 폴더가 아닌 다른 폴더에 보관해야 합니다.
왜냐하면 이 코드들은 수정할 필요가 없으며 `src` 폴더의 내용과 함께 처리할 필요도 없기 때문입니다.
각각의 파일 이름은 이 문서에서 설명하는 가이드를 참고하세요.

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 04-01}

<!--
### _LIFT_
-->
#### _LIST 규칙_

<!--
#### Style 04-01
-->
#### 스타일 04-01

<div class="s-rule do">


<!--
**Do** structure the app such that you can **L**ocate code quickly,
**I**dentify the code at a glance,
keep the **F**lattest structure you can, and
**T**ry to be DRY.
-->
애플리케이션 구조는 _LIST 규칙_ 에 맞게 **마련하세요.**
코드는 빠르게 접근할 수 있는 곳에 위치해야 하며(**L**ocate),
파일 이름만 봐도 무슨 내용인지 확인할 수 있어야 하고(**I**dentify),
최대한 단순한 구조여야 하며(**F**lattest),
불필요하게 반복하는 내용을 줄이세요.(**T**ry to be DRY).

</div>



<div class="s-rule do">


<!--
**Do** define the structure to follow these four basic guidelines, listed in order of importance.
-->
애플리케이션의 기본 구조는 이 라이드라인을 따라 **마련하세요.** 각 항목의 순서가 중요도의 순서입니다.

</div>



<div class="s-why-last">


<!--
**Why?** LIFT Provides a consistent structure that scales well, is modular, and makes it easier to increase developer efficiency by finding code quickly.
To confirm your intuition about a particular structure, ask:
_can I quickly open and start work in all of the related files for this feature_?
-->
**왜?** LIFT 규칙을 준수하면 애플리케이션의 구조를 일관되게 유지할 수 있으며, 애플리케이션의 규모가 커지거나 모듈을 구현하면서 코드를 나눌 때도 원하는 코드를 빠르게 찾을 수 있습니다.
애플리케이션의 구조를 잡을 때 가장 중요한 내용을 생각해 보세요. 비슷한 파일들 중에 원하는 파일을 빠르게 열어서 바로 작업할 수 있는 것이 좋은 애플리케이션 구조입니다.

</div>

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 04-02}

<!--
### Locate
-->
### 위치 (Locate)

<!--
#### Style 04-02
-->
#### 스타일 04-02

<div class="s-rule do">


<!--
**Do** make locating code intuitive, simple and fast.
-->
코드는 직관적으로 와닿는 곳에 **두세요.** 그래야 찾기 쉽습니다.

</div>



<div class="s-why-last">


<!--
**Why?** To work efficiently you must be able to find files quickly,
especially when you do not know (or do not remember) the file _names_.
Keeping related files near each other in an intuitive location saves time.
A descriptive folder structure makes a world of difference to you and the people who come after you.
-->
**왜?** 작업을 효율적으로 하려면 파일의 이름을 모르더라도 원하는 내용을 빠르게 찾을 수 있어야 합니다. 그래서 서로 연관된 파일은 비슷한 위치에 두면 원하는 코드를 찾을때 걸리는 시간을 줄일 수 있습니다. 폴더 구조에 일관성이 없으면 당신은 물론이고 주변 사람들도 모두 피곤하게 만들 수 있습니다.

</div>

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 04-03}

<!--
### Identify
-->
### 파일 이름 짓기 (Identify)

<!--
#### Style 04-03
-->
#### 스타일 04-03

<div class="s-rule do">


<!--
**Do** name the file such that you instantly know what it contains and represents.
-->
파일의 이름은 그 파일의 내용이 무엇인지 바로 알아차릴 수 있는 이름으로 **지정하세요.**

</div>



<div class="s-rule do">


<!--
**Do** be descriptive with file names and keep the contents of the file to exactly one component.
-->
파일의 이름은 그 파일의 내용을 명확하게 표현할 수 **있어야 하며**, 그렇기 때문에 한 파일에는 하나의 컴포넌트만 구현해야 **합니다.**

</div>



<div class="s-rule avoid">


<!--
**Avoid** files with multiple components, multiple services, or a mixture.
-->
한 파일에 컴포넌트나 서비스를 여러개 정의하는 것은 **피하세요.**

</div>



<div class="s-why-last">


<!--
**Why?** Spend less time hunting and pecking for code, and become more efficient.
Longer file names are far better than _short-but-obscure_ abbreviated names.
-->
**왜?** 원하는 코드를 찾느라 들이는 시간은 최대한 줄이고, 그 시간을 좀 더 효율적으로 사용하세요.
_알아볼 수 없게 줄여놓은_ 파일 이름보다, 조금은 길지만 파일을 충분히 설명할 수 있는 이름이 더 좋습니다.

</div>



<div class="alert is-helpful">


<!--
It may be advantageous to deviate from the _one-thing-per-file_ rule when
you have a set of small, closely-related features that are better discovered and understood
in a single file than as multiple files. Be wary of this loophole.
-->
아주 작지만 서로 연관된 기능을 구현한다면 _한 파일에 하나만 구현하는_ 규칙을 지키지 않는 것이 유리할 수도 있습니다. 이 코드들의 분량이 길지 않다면 여러 파일에 흩어져 있는 것보다 편하기 때문입니다. 다만, 이 파일에 너무 많은 내용이 들어가지 않도록 주의하세요.

</div>

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>


{@a 04-04}

<!--
### Flat
-->
### 폴더 구조는 단순하게 (Flat)

<!--
#### Style 04-04
-->
#### 스타일 04-04

<div class="s-rule do">


<!--
**Do** keep a flat folder structure as long as possible.
-->
폴더 구조는 최대한 단순하게 **구성하세요.**

</div>



<div class="s-rule consider">


<!--
**Consider** creating sub-folders when a folder reaches seven or more files.
-->
폴더에 있는 파일이 7개가 넘어갈 때 하위 폴더를 만드는 것을 **권장합니다.**

</div>



<div class="s-rule consider">


<!--
**Consider** configuring the IDE to hide distracting, irrelevant files such as generated `.js` and `.js.map` files.
-->
`.js` 파일이나 `.js.map` 파일같이, IDE가 자동으로 생성하지만 개발 단계에서 필요 없는 파일은 IDE에 표시되지 않도록 설정하는 것을 **권장합니다.**

</div>



<div class="s-why-last">


<!--
**Why?** No one wants to search for a file through seven levels of folders.
A flat structure is easy to scan.
-->
**왜?** 원하는 파일을 찾기 위해 7겹으로 된 하위 폴더를 여는 것은 아무도 좋아하지 않을 것입니다.
폴더 구조는 단순해야 원하는 파일을 찾기 쉽습니다.

<!--
On the other hand,
<a href="https://en.wikipedia.org/wiki/The_Magical_Number_Seven,_Plus_or_Minus_Two">psychologists believe</a>
that humans start to struggle when the number of adjacent interesting things exceeds nine.
So when a folder has ten or more files, it may be time to create subfolders.
-->
하지만 <a href="https://en.wikipedia.org/wiki/The_Magical_Number_Seven,_Plus_or_Minus_Two">심리학자들의 의견</a>에 따르면, 비슷한 것이 9개 정도 모여있는 것은 사람들이 재미있어한다고 하기도 합니다.
그렇다면 폴더에 있는 파일이 10개를 넘어가면 하위 폴더를 만드는 방법도 있습니다.

<!--
Base your decision on your comfort level.
Use a flatter structure until there is an obvious value to creating a new folder.
-->
폴더 안에 파일을 몇개까지 둘지는 개발자의 선택에 달려있습니다.
새 폴더를 만들기 전까지는 최대한 단순한 폴더 구조를 유지하세요.

</div>

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>


{@a 04-05}

<!--
### _T-DRY_ (Try to be _DRY_)
-->
### 불필요한 반복 피하기 (Try to be _DRY_)

<!--
#### Style 04-05
-->
#### 스타일 04-05

<div class="s-rule do">


<!--
**Do** be DRY (Don't Repeat Yourself).
-->
DRY(Don't Repeat Yourself) 원칙을 최대한 **지키세요.**

</div>



<div class="s-rule avoid">


<!--
**Avoid** being so DRY that you sacrifice readability.
-->
하지만 DRY 원칙 때문에 가독성을 포기하지는 **마세요.**

</div>



<div class="s-why-last">


<!--
**Why?** Being DRY is important, but not crucial if it sacrifices the other elements of LIFT.
That's why it's called _T-DRY_.
For example, it's redundant to name a template `hero-view.component.html` because
with the `.html` extension, it is obviously a view.
But if something is not obvious or departs from a convention, then spell it out.
-->
**왜?** DRY 원칙을 지키도록 노력하는 것은 물론 중요하지만, 이것 때문에 다른 LIFT 원칙을 포기하는 것은 좋지 않습니다.
그래서 DRY 원칙을 _반드시 지키라고_ 하지 않고 _할 수 있는 만큼 하라고_ 하는 것입니다.
예를 들면, 템플릿 파일의 확장자는 `.html`이기 때문에 이 파일의 이름을 `hero-view.component.html`이라고 짓는 것은 불필요한 작업입니다. 파일의 확장자를 보면 이 파일의 역할을 명백하게 구별할 수 있습니다.
하지만 애매한 부분이 있거나 일반적인 방식을 벗어난다면, 확실하게 명시하는 것이 좋습니다.

</div>

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>


{@a 04-06}

<!--
### Overall structural guidelines
-->
### 애플리케이션 전체 구조 가이드라인

<!--
#### Style 04-06
-->
#### 스타일 04-06

<div class="s-rule do">


<!--
**Do** start small but keep in mind where the app is heading down the road.
-->
애플리케이션은 작은 규모부터 시작하지만 최종 결과물이 어떤 방향으로 확장될지 항상 고려해야 **합니다.**

</div>



<div class="s-rule do">


<!--
**Do** have a near term view of implementation and a long term vision.
-->
개발을 할 때 단기적인 계획과 장기적인 계획을 함께 **고려하세요.**

</div>



<div class="s-rule do">


<!--
**Do** put all of the app's code in a folder named `src`.
-->
애플리케이션 코드는 모두 `src` 폴더 아래에 **작성하세요.**

</div>



<div class="s-rule consider">


<!--
**Consider** creating a folder for a component when it has multiple accompanying files (`.ts`, `.html`, `.css` and `.spec`).
-->
컴포넌트를 구성하는 파일이 여러개라면(`.ts`, `.html`, `.css`, `.spec`) 컴포넌트를 표현하는 폴더를 따로 만들고 관련된 파일을 모두 이 폴더에 두는 것을 **권장합니다.**

</div>



<div class="s-why">


<!--
**Why?** Helps keep the app structure small and easy to maintain in the early stages, while being easy to evolve as the app grows.
-->
**왜?** 애플리케이션 구조를 유지보수하기 편하게 구성하면, 애플리케이션의 규모가 커지더라도 좀 더 편하게 확장할 수 있습니다.

</div>



<div class="s-why-last">


<!--
**Why?** Components often have four files (e.g. `*.html`, `*.css`, `*.ts`, and `*.spec.ts`) and can clutter a folder quickly.
-->
**왜?** 컴포넌트는 보통 4개의 파일(`.html`, `*.css`, `.ts`, `.spec.ts`)로 구성되기 때문에 이 파일들은 한 폴더로 모으는 것이 좋습니다.

</div>



{@a file-tree}

<!--
Here is a compliant folder and file structure:
-->
이 가이드라인을 따르면 다음과 같이 폴더와 파일 구조를 작성할 수 있습니다:

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
            core.module.ts
          </div>

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
            text-filter.component.ts|spec.ts
          </div>

          <div class='file'>
            text-filter.service.ts|spec.ts
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


<!--
While components in dedicated folders are widely preferred,
another option for small apps is to keep components flat (not in a dedicated folder).
This adds up to four files to the existing folder, but also reduces the folder nesting.
Whatever you choose, be consistent.
-->
컴포넌트와 관련된 파일은 개별 폴더에 두는 것을 권장하지만, 애플리케이션의 크기가 작다면 `components` 폴더에 하위 폴더 없이 그냥 두는 것도 좋습니다.
그리고 `components` 폴더의 파일이 4개 이상 생기면 그때 하위 폴더를 만드는 것을 고려해 보세요.
어떤 선택을 하던지, 일관성을 유지하기만 하면 됩니다.

</div>

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 04-07}

<!--
### _Folders-by-feature_ structure
-->
### 기능별로 폴더 구성하기

<!--
#### Style 04-07
-->
#### 스타일 04-07

<div class="s-rule do">


<!--
**Do** create folders named for the feature area they represent.
-->
관련된 기능이 있으면 한 폴더로 묶고 해당 기능을 표현하는 이름을 **지정하세요.**

</div>



<div class="s-why">


<!--
**Why?** A developer can locate the code and identify what each file represents
at a glance. The structure is as flat as it can be and there are no repetitive or redundant names.
-->
**왜?** 파일의 이름은 자유롭게 지정해도 됩니다. 하지만 관련된 파일을 폴더로 묶으면 파일 이름에 반복적으로 들어가는 단어를 생략하고 더 간단하게 지정할 수 있습니다.

</div>



<div class="s-why">


<!--
**Why?** The LIFT guidelines are all covered.
-->
**왜?** LIFT 원칙은 이 내용에도 유효합니다.

</div>



<div class="s-why">


<!--
**Why?** Helps reduce the app from becoming cluttered through organizing the
content and keeping them aligned with the LIFT guidelines.
-->
**왜?** 애플리케이션을 구성하는 파일들이 어수선하게 흩어져 있는 것을 방지하고 효율적으로 관리하려면 LIST 원칙을 지키는 것이 좋습니다.

</div>



<div class="s-why">


<!--
**Why?** When there are a lot of files, for example 10+,
locating them is easier with a consistent folder structure
and more difficult in a flat structure.
-->
**왜?** 파일이 10개 이상 있다면 한 폴더에 모두 모아놓는 것보다 관련된 파일끼리 묶어둬야 관리하기 편합니다.

</div>



<div class="s-rule do">


<!--
**Do** create an NgModule for each feature area.
-->
각 기능마다 NgModule을 **작성하세요.**

</div>



<div class="s-why">


<!--
**Why?** NgModules make it easy to lazy load routable features.
-->
**왜?** NgModule을 사용하면 해당 기능을 지연 로딩할 수 있습니다.

</div>



<div class="s-why-last">


<!--
**Why?** NgModules make it easier to isolate, test, and re-use features.
-->
**왜?** NgModule을 구성하면 애플리케이션 코드를 기능별로 분리할 수 있고, 테스트하거나 재사용하기 편해집니다.

</div>



<div class='file-tree-reference'>
  <!--
  <a href="#file-tree">Refer to this _folder and file structure_ example.</a>
  -->
  <a href="#file-tree">여기에 설명한 _폴더와 파일 구조_ 예제를 참고하세요.</a>
</div>

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

</a>


{@a 04-08}

<!--
### App _root module_
-->
### 애플리케이션 _최상위 모듈_

<!--
#### Style 04-08
-->
#### 스타일 04-08

<div class="s-rule do">


<!--
**Do** create an NgModule in the app's root folder,
for example, in `/src/app`.
-->
애플리케이션의 최상위 모듈은 애플리케이션 최상위 폴더에 **생성하세요.**
일반적으로는 `/src/app` 입니다.

</div>



<div class="s-why">


<!--
**Why?** Every app requires at least one root NgModule.
-->
**왜?** 모든 앱에는 최상위 NgModule이 반드시 존재해야 합니다.

</div>



<div class="s-rule consider">


<!--
**Consider** naming the root module `app.module.ts`.
-->
최상위 모듈의 파일 이름은 `app.module.ts`를 권장합니다.

</div>



<div class="s-why-last">


<!--
**Why?** Makes it easier to locate and identify the root module.
-->
**왜?** 애플리케이션 최상위 모듈은 최상위 폴더에 두는 것이 가장 찾기 쉽습니다.

</div>



<code-example path="styleguide/src/04-08/app/app.module.ts" region="example" title="app/app.module.ts">

</code-example>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>


{@a 04-09}

<!--
### Feature modules
-->
### 기능 모듈

<!--
#### Style 04-09
-->
#### 스타일 04-09

<div class="s-rule do">


<!--
**Do** create an NgModule for all distinct features in an application;
for example, a `Heroes` feature.
-->
애플리케이션을 구성하는 기능마다 NgModule을 **만드세요.**
히어로들의 여행 튜토리얼을 예를 들면 `Heroes` 기능을 따로 분리하는 식입니다.

</div>



<div class="s-rule do">


<!--
**Do** place the feature module in the same named folder as the feature area;
for example, in `app/heroes`.
-->
기능 모듈을 구현한 파일은 관련된 기능으로 묶은 폴더 안에 **두세요.**
예를 들면 `app/heroes` 폴더 안에 구현할 수 있습니다.

</div>



<div class="s-rule do">


<!--
**Do** name the feature module file reflecting the name of the feature area
and folder; for example, `app/heroes/heroes.module.ts`.
-->
기능 모듈의 파일 이름은 그 모듈이 담당하는 기능을 충분히 표현할 수 있도록 **지정하세요.**
에를 들면 `app/heroes/heroes.module.ts`과 같이 지정할 수 있습니다.

</div>



<div class="s-rule do">


<!--
**Do** name the feature module symbol reflecting the name of the feature
area, folder, and file; for example, `app/heroes/heroes.module.ts` defines `HeroesModule`.
-->
기능 모듈의 심볼 이름은 그 모듈이 담당하는 기능을 충분히 표현할 수 있도록 **지정하세요.**
예를 들면 `app/heroes/heroes.module.ts` 파일에 `HeroesModule`을 구현할 수 있습니다.

</div>



<div class="s-why">


<!--
**Why?** A feature module can expose or hide its implementation from other modules.
-->
**왜?** 기능 모듈은 원하는 기능을 모듈 밖으로 공개하면서, 원하지 않는 내용은 다른 모듈에서 참조할 수 없도록 감출 수 있습니다.

</div>



<div class="s-why">


<!--
**Why?** A feature module identifies distinct sets of related components that comprise the feature area.
-->
**왜?** 기능 모듈의 이름은 관련된 컴포넌트와 담당하는 기능을 모두 대표하는 이름으로 지정해야 합니다.

</div>



<div class="s-why">


<!--
**Why?** A feature module can easily be routed to both eagerly and lazily.
-->
**왜?** 기능 모듈은 애플리케이션이 시작되면서 바로 로드할 수도 있고, 원하면 지연로딩 할 수도 있습니다.

</div>



<div class="s-why">


<!--
**Why?** A feature module defines clear boundaries between specific functionality and other application features.
-->
**왜?** 기능 모듈은 애플리케이션에서 담당하는 역할로 따져봤을 때 다른 기능 모듈과 명확하게 구분되어야 합니다.

</div>



<div class="s-why">


<!--
**Why?** A feature module helps clarify and make it easier to assign development responsibilities to different teams.
-->
**왜?** 기능 모듈을 명확하게 구분하면 담당 개발자나 팀 단위로 업무를 분배하기에도 좋습니다.

</div>



<div class="s-why-last">


<!--
**Why?** A feature module can easily be isolated for testing.
-->
**왜?** 기능 모듈을 나누면 각 모듈을 따로 테스트하기에도 좋습니다.

</div>

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 04-10}

<!--
### Shared feature module
-->
### 공통 기능 모듈

<!--
#### Style 04-10
-->
#### 스타일 04-10

<div class="s-rule do">


<!--
**Do** create a feature module named `SharedModule` in a `shared` folder;
for example, `app/shared/shared.module.ts` defines `SharedModule`.
-->
공통 기능 모듈이라면 `shared` 폴더 안에 **만드세요.**
예를 들면 `app/shared/shared.module.ts` 파일에 `SharedModule`을 만드는 식입니다.

</div>



<div class="s-rule do">


<!--
**Do** declare components, directives, and pipes in a shared module when those
items will be re-used and referenced by the components declared in other feature modules.
-->
공통 기능 모듈에 구현하는 컴포넌트나 디렉티브, 파이프는 다른 모듈에서도 쉽게 재사용할 수 있도록 **구현하세요.**

</div>



<div class="s-rule consider">


<!--
**Consider** using the name SharedModule when the contents of a shared
module are referenced across the entire application.
-->
애플리케이션 전반에 사용되는 공통 기능 모듈이라면 `SharedModule`이라고 이름 짓는 것을 **권장합니다.**

</div>



<div class="s-rule avoid">



**Consider** _not_ providing services in shared modules. Services are usually
singletons that are provided once for the entire application or
in a particular feature module. There are exceptions, however. For example, in the sample code that follows, notice that the `SharedModule` provides `FilterTextService`. This is acceptable here because the service is stateless;that is, the consumers of the service aren't impacted by new instances.


</div>



<div class="s-rule do">


<!--
**Do** import all modules required by the assets in the `SharedModule`;
for example, `CommonModule` and `FormsModule`.
-->
애플리케이션에 자주 사용하는 모듈은 `SharedModule`에서 로드하고 모듈 외부로 공개하는 것이 좋습니다.
예를 들면 `CommonModule`이나 `FormsModule`이 해당됩니다.

</div>



<div class="s-why">


<!--
**Why?** `SharedModule` will contain components, directives and pipes
that may need features from another common module; for example,
`ngFor` in `CommonModule`.
-->
**왜?** 애플리케이션 공통 기능을 `SharedModule`에 로드하고 모듈 외부로 다시 공개하면 모듈 로딩 구문을 간단하게 작성할 수 있습니다.
이렇게 구현하면 `CommonModule`을 따로 로드하지 않아도 `SharedModule`에서 제공하는 `ngFor` 디렉티브를 자연스럽게 사용할 수 있습니다.

</div>



<div class="s-rule do">


<!--
**Do** declare all components, directives, and pipes in the `SharedModule`.
-->
애플리케이션 전반에 사용되는 컴포넌트, 디렉티브, 파이프는 최대한 `SharedModule`에 **구현하세요.**

</div>



<div class="s-rule do">


<!--
**Do** export all symbols from the `SharedModule` that other feature modules need to use.
-->
다른 모듈에서 사용할 수 있는 심볼은 모두 `SharedModule` 밖으로 **공개(`export`)하세요.**

</div>



<div class="s-why">


<!--
**Why?** `SharedModule` exists to make commonly used components, directives and pipes available for use in the templates of components in many other modules.
-->
**왜?** `SharedModule`을 만드는 목적은 다른 모듈의 컴포넌트 템플릿에 자주 사용하는 컴포넌트, 디렉티브, 파이프를 모아두는 것이기 때문입니다.

</div>



<div class="s-rule avoid">


<!--
**Avoid** specifying app-wide singleton providers in a `SharedModule`. Intentional singletons are OK. Take care.
-->
애플리케이션 전역에 사용되는 싱글턴 프로바이더를 `SharedModule`에 구현하는 것은 **피하세요.**
모듈 내부에만 사용되는 싱글턴이라면 문제 없습니다. 주의하세요.

</div>



<div class="s-why">


<!--
**Why?** A lazy loaded feature module that imports that shared module will make its own copy of the service and likely have undesirable results.
-->
**왜?** 지연로딩되는 모듈이 공통 모듈을 로드하면 서비스 인스턴스가 새로 만들어집니다.

</div>



<div class="s-why-last">


<!--
**Why?** You don't want each module to have its own separate instance of singleton services.
Yet there is a real danger of that happening if the `SharedModule` provides a service.
-->
**왜?** 싱글턴 서비스를 모듈마다 생성하면 이 서비스는 더이상 싱글턴 인스턴스가 아닙니다.
그래서 `SharedModule`이 서비스 프로바이더를 제공하면 애플리케이션이 예상한 대로 동작하지 않을 수 있습니다.

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
          text-filter.component.ts|spec.ts
        </div>

        <div class='file'>
          text-filter.service.ts|spec.ts
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

  <code-pane title="app/shared/shared.module.ts" path="styleguide/src/04-10/app/shared/shared.module.ts">

  </code-pane>

  <code-pane title="app/shared/init-caps.pipe.ts" path="styleguide/src/04-10/app/shared/init-caps.pipe.ts">

  </code-pane>

  <code-pane title="app/shared/filter-text/filter-text.component.ts" path="styleguide/src/04-10/app/shared/filter-text/filter-text.component.ts">

  </code-pane>

  <code-pane title="app/shared/filter-text/filter-text.service.ts" path="styleguide/src/04-10/app/shared/filter-text/filter-text.service.ts">

  </code-pane>

  <code-pane title="app/heroes/heroes.component.ts" path="styleguide/src/04-10/app/heroes/heroes.component.ts">

  </code-pane>

  <code-pane title="app/heroes/heroes.component.html" path="styleguide/src/04-10/app/heroes/heroes.component.html">

  </code-pane>

</code-tabs>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 04-11}

<!--
### Core feature module
-->
### 코어 기능 모듈

<!--
#### Style 04-11
-->
#### 스타일 04-11

<div class="s-rule consider">


<!--
**Consider** collecting numerous, auxiliary, single-use classes inside a core module
to simplify the apparent structure of a feature module.
-->
기능 모듈의 구조를 간단하게 하기 위해 보조 역할을 하는 클래스, 한 번만 사용하는 클래스는 코어 모듈에 모아두는 것을 **권장합니다.**

</div>



<div class="s-rule consider">


<!--
**Consider** calling the application-wide core module, `CoreModule`.
Importing `CoreModule` into the root `AppModule` reduces its complexity
and emphasizes its role as orchestrator of the application as a whole.
-->
애플리케이션 전역에 사용하는 코어 모듈은 `CoreModule`이라는 이름을 사용할 것을 **권장합니다.**
코어 모듈의 이름을 이렇게 정의하면 `AppModule`에서 `CoreModule`을 로드하는 의미가 더욱 명확해집니다.

</div>



<div class="s-rule do">


<!--
**Do** create a feature module named `CoreModule` in a `core` folder (e.g. `app/core/core.module.ts` defines `CoreModule`).
-->
`CoreModule`은 `core` 폴더에 **구현하세요.**
예를 들면 `app/core/core.module.ts` 파일에 `CoreModule`을 구현하는 식입니다.

</div>



<div class="s-rule do">


<!--
**Do** put a singleton service whose instance will be shared throughout the application in the `CoreModule` (e.g. `ExceptionService` and `LoggerService`).
-->
애플리케이션 전역에서 싱글턴으로 사용되는 서비스 프로바이더는 `CoreModule`에 **정의하세요.**
`ExceptionService`나 `LoggerService`가 대상이 될 수 있습니다.

</div>



<div class="s-rule do">


<!--
**Do** import all modules required by the assets in the `CoreModule` (e.g. `CommonModule` and `FormsModule`).
-->
애플리케이션 전역에서 자주 사용하는 모듈은 `CoreModule`에 로드하고 모듈 외부로 다시 **공개하세요.**
`CommonModule`이나 `FormsModule`이 대상이 될 수 있습니다.

</div>



<div class="s-why">


<!--
**Why?** `CoreModule` provides one or more singleton services. Angular registers the providers with the app root injector, making a singleton instance of each service available to any component that needs them, whether that component is eagerly or lazily loaded.
-->
**왜?** `CoreModule`은 싱글턴 서비스를 하나 이상 제공할 수 있습니다.
최상위 모듈에서 생성한 싱글턴 서비스는 애플리케이션 최상위 인젝터에 등록되며, 이 서비스를 의존성으로 주입받는 컴포넌트들에서 의존성 주입을 요청할 때마다 인젝터에 등록된 프로바이더를 통해 인스턴스를 주입합니다.
이 때 컴포넌트는 애플리케이션이 실행되면서 즉시 로드되던지, 지연 로딩되는 것과 상관없이 인스턴스를 주입받을 수 있습니다.

</div>



<div class="s-why">


<!--
**Why?** `CoreModule` will contain singleton services. When a lazy loaded module imports these, it will get a new instance and not the intended app-wide singleton.
-->
**왜?** `CoreModule`에 등록된 서비스 프로바이더는 의존성 주입에 사용되는 서비스의 인스턴스를 생성합니다. 다만, 지연되는 모듈에서 코어 모듈을 로드한다면 애플리케이션이 시작될 때 생성된 서비스 인스턴스와 다른 서비스 인스턴스를 새로 생성합니다.

</div>



<div class="s-rule do">


<!--
**Do** gather application-wide, single use components in the `CoreModule`.
Import it once (in the `AppModule`) when the app starts and never import it anywhere else. (e.g. `NavComponent` and `SpinnerComponent`).
-->
애플리케이션 전역에 사용하는 컴포넌트는 `CoreModule`에 **모으세요.**
그리고 `AppModule`에서 코어 모듈을 로드하면 애플리케이션이 시작되면서 이 컴포넌트들을 모두 로드하기 때문에, 다른 모듈에서 따로 로드하지 않아도 이 컴포넌트들을 자유롭게 사용할 수 있습니다.

</div>



<div class="s-why">


<!--
**Why?** Real world apps can have several single-use components (e.g., spinners, message toasts, and modal dialogs) that appear only in the `AppComponent` template.
They are not imported elsewhere so they're not shared in that sense.
Yet they're too big and messy to leave loose in the root folder.
-->
**왜?** 실제로 배포되는 애플리케이션들에는 `AppComponent`의 템플릿에서만 사용되는 컴포넌트들이 있습니다. 로딩 이미지나 메시지 토스트, 모달 팝업이 이런 종류에 해당되며, 이 컴포넌트들은 `AppComponent`에서만 사용되기 때문에 공유 모듈에 들어갈 필요가 없습니다.
이런 컴포넌트들이 너무 많아진다면 하위 폴더로 옮기는 것도 고려해 볼 만 합니다.

</div>



<div class="s-rule avoid">


<!--
**Avoid** importing the `CoreModule` anywhere except in the `AppModule`.
-->
`CoreModule`을 `AppModule`이 아닌 모듈에서 로드하는 것은 **피하세요.**

</div>



<div class="s-why">


<!--
**Why?** A lazily loaded feature module that directly imports the `CoreModule` will make its own copy of services and likely have undesirable results.
-->
**왜?** 지연로딩되는 모듈에서 `CoreModule`을 다시 로드하면, `CoreModule`에 정의된 서비스들의 인스턴스가 새로 만들어지며, 예상치 못한 동작을 할 수도 있습니다.

</div>



<div class="s-why">


<!--
**Why?** An eagerly loaded feature module already has access to the `AppModule`'s injector, and thus the `CoreModule`'s services.
-->
**왜?** 애플리케이션이 시작되면서 즉시 로딩되는 기능 모듈은 `AppModule`의 인젝터에 자연스럽게 접근할 수 있으며, `CoreModule`에 생성된 서비스 인스턴스를 함께 사용합니다.

</div>



<div class="s-rule do">


<!--
**Do** export all symbols from the `CoreModule` that the `AppModule` will import and make available for other feature modules to use.
-->
`CoreModule`에 정의된 심볼은 `AppModule`이나 다른 기능 모듈에서 사용할 수 있도록 모두 모듈 외부로 **공개하세요.**

</div>



<div class="s-why">


<!--
**Why?** `CoreModule` exists to make commonly used singleton services available for use in the many other modules.
-->
**왜?** `CoreModule`은 다른 모듈에서 사용하는 싱글턴 서비스를 모아두기 위해 만드는 모듈입니다.

</div>



<div class="s-why-last">


<!--
**Why?** You want the entire app to use the one, singleton instance.
You don't want each module to have its own separate instance of singleton services.
Yet there is a real danger of that happening accidentally if the `CoreModule` provides a service.
-->
**왜?** 애플리케이션에서 사용하는 싱글턴 서비스는 인스턴스를 딱 하나만 생성해야 합니다.
싱글턴 서비스의 인스턴스가 모듈마다 생성되는 것은 싱글턴 서비스의 목적에 벗어나는 것이며, 원하는 대로 동작하지도 않을 것입니다.

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
        core
      </div>

      <div class='children'>

        <div class='file'>
          core.module.ts
        </div>

        <div class='file'>
          logger.service.ts|spec.ts
        </div>

        <div class='file'>
          nav
        </div>

        <div class='children'>

          <div class='file'>
            nav.component.ts|html|css|spec.ts
          </div>

        </div>

        <div class='file'>
          spinner
        </div>

        <div class='children'>

          <div class='file'>
            spinner.component.ts|html|css|spec.ts
          </div>

          <div class='file'>
            spinner.service.ts|spec.ts
          </div>

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

  <code-pane title="app/app.module.ts" path="styleguide/src/04-11/app/app.module.ts" region="example">

  </code-pane>

  <code-pane title="app/core/core.module.ts" path="styleguide/src/04-11/app/core/core.module.ts">

  </code-pane>

  <code-pane title="app/core/logger.service.ts" path="styleguide/src/04-11/app/core/logger.service.ts">

  </code-pane>

  <code-pane title="app/core/nav/nav.component.ts" path="styleguide/src/04-11/app/core/nav/nav.component.ts">

  </code-pane>

  <code-pane title="app/core/nav/nav.component.html" path="styleguide/src/04-11/app/core/nav/nav.component.html">

  </code-pane>

  <code-pane title="app/core/spinner/spinner.component.ts" path="styleguide/src/04-11/app/core/spinner/spinner.component.ts">

  </code-pane>

  <code-pane title="app/core/spinner/spinner.component.html" path="styleguide/src/04-11/app/core/spinner/spinner.component.html">

  </code-pane>

  <code-pane title="app/core/spinner/spinner.service.ts" path="styleguide/src/04-11/app/core/spinner/spinner.service.ts">

  </code-pane>

</code-tabs>





<div class="alert is-helpful">


<!--
`AppModule` is a little smaller because many app/root classes have moved to other modules.
`AppModule` is stable because you will add future components and providers to other modules, not this one.
`AppModule` delegates to imported modules rather than doing work.
`AppModule` is focused on its main task, orchestrating the app as a whole.
-->
일관된 규칙으로 모듈을 나누면 `AppModule`의 크기는 다른 모듈보다 많이 작아집니다.
그리고 새로 추가되는 컴포넌트나 서비스 프로바이더도 해당 역할을 하는 모듈에 구현할 것이기 때문에 `AppModule`의 코드가 바뀌는 일은 그리 많지 않습니다.
`AppModule`은 모듈을 로드하는 방법으로 애플리케이션의 모듈을 조합하며, 애플리케이션의 동작과 관련된 로직은 작성하지 않는 것이 좋습니다.
`AppModule`의 역할은 애플리케이션 전체 모듈을 구성하는 것으로만 제한하는 것이 좋습니다.

</div>

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 04-12}

<!--
### Prevent re-import of the core module
-->
### 코어 모듈을 다시 로드하지 말기

<!--
#### Style 04-12
-->
#### 스타일 04-12

<!--
Only the root `AppModule` should import the `CoreModule`.
-->
`CoreModule`은 `AppModule`에서만 로드해야 합니다.

<div class="s-rule do">


<!--
**Do** guard against reimporting of `CoreModule` and fail fast by adding guard logic.
-->
`CoreModule`이 두 번 이상 로드되면 에러를 발생하도록 방어 로직을 **작성하세요.**

</div>



<div class="s-why">


<!--
**Why?** Guards against reimporting of the `CoreModule`.
-->
**왜?** 방어 로직을 작성하면 `CoreModule`이 여러번 로드되는 것을 방지할 수 있습니다.

</div>



<div class="s-why-last">


<!--
**Why?** Guards against creating multiple instances of assets intended to be singletons.
-->
**왜?** `CoreModule`은 싱글턴 서비스를 제공하기 때문에, 싱글턴 서비스의 인스턴스를 하나로 제한하는 방어 로직을 작성하는 것이 좋습니다.

</div>



<code-tabs>

  <code-pane title="app/core/module-import-guard.ts" path="styleguide/src/04-12/app/core/module-import-guard.ts">

  </code-pane>

  <code-pane title="app/core/core.module.ts" path="styleguide/src/04-12/app/core/core.module.ts">

  </code-pane>

</code-tabs>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 04-13}

<!--
### Lazy Loaded folders
-->
### 지연 로딩 모듈의 폴더

<!--
#### Style 04-13
-->
#### 스타일 04-13

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

{@a 04-14}

<!--
### Never directly import lazy loaded folders
-->
### 지연로딩 모듈을 직접 로드하지 마세요.

<!--
#### Style 04-14
-->
#### 스타일 04-14

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



**Why?** components have templates containing HTML and optional Angular template syntax.
They display content.
Developers place components on the page as they would native HTML elements and web components.


</div>



<div class="s-why-last">



**Why?** It is easier to recognize that a symbol is a component by looking at the template's html.


</div>

<div class="alert is-helpful">

There are a few cases where you give a component an attribute, such as when you want to augment a built-in element. For example, [Material Design](https://material.angular.io/components/button/overview) uses this technique with `<button mat-button>`. However, you wouldn't use this technique on a custom element.

</div>

<code-example path="styleguide/src/05-03/app/heroes/shared/hero-button/hero-button.component.avoid.ts" region="example" title="app/heroes/hero-button/hero-button.component.ts">

</code-example>





<code-example path="styleguide/src/05-03/app/app.component.avoid.html" title="app/app.component.html">

</code-example>



<code-tabs>

  <code-pane title="app/heroes/shared/hero-button/hero-button.component.ts" path="styleguide/src/05-03/app/heroes/shared/hero-button/hero-button.component.ts" region="example">

  </code-pane>

  <code-pane title="app/app.component.html" path="styleguide/src/05-03/app/app.component.html">

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



<code-example path="styleguide/src/05-04/app/heroes/heroes.component.avoid.ts" region="example" title="app/heroes/heroes.component.ts">

</code-example>





<code-tabs>

  <code-pane title="app/heroes/heroes.component.ts" path="styleguide/src/05-04/app/heroes/heroes.component.ts" region="example">

  </code-pane>

  <code-pane title="app/heroes/heroes.component.html" path="styleguide/src/05-04/app/heroes/heroes.component.html">

  </code-pane>

  <code-pane title="app/heroes/heroes.component.css" path="styleguide/src/05-04/app/heroes/heroes.component.css">

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



<code-example path="styleguide/src/05-12/app/heroes/shared/hero-button/hero-button.component.avoid.ts" region="example" title="app/heroes/shared/hero-button/hero-button.component.ts">

</code-example>





<code-example path="styleguide/src/05-12/app/heroes/shared/hero-button/hero-button.component.ts" region="example" title="app/heroes/shared/hero-button/hero-button.component.ts">

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



<code-example path="styleguide/src/05-13/app/heroes/shared/hero-button/hero-button.component.avoid.ts" region="example" title="app/heroes/shared/hero-button/hero-button.component.ts">

</code-example>





<code-example path="styleguide/src/05-13/app/app.component.avoid.html" title="app/app.component.html">

</code-example>





<code-tabs>

  <code-pane title="app/heroes/shared/hero-button/hero-button.component.ts" path="styleguide/src/05-13/app/heroes/shared/hero-button/hero-button.component.ts" region="example">

  </code-pane>

  <code-pane title="app/heroes/shared/hero-button/hero-highlight.directive.ts" path="styleguide/src/05-13/app/heroes/shared/hero-highlight.directive.ts">

  </code-pane>

  <code-pane title="app/app.component.html" path="styleguide/src/05-13/app/app.component.html">

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



<code-example path="styleguide/src/05-14/app/shared/toast/toast.component.avoid.ts" region="example" title="app/shared/toast/toast.component.ts">

</code-example>





<code-example path="styleguide/src/05-14/app/shared/toast/toast.component.ts" region="example" title="app/shared/toast/toast.component.ts">

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



<code-example path="styleguide/src/05-15/app/heroes/hero-list/hero-list.component.avoid.ts" title="app/heroes/hero-list/hero-list.component.ts">

</code-example>





<code-example path="styleguide/src/05-15/app/heroes/hero-list/hero-list.component.ts" region="example" title="app/heroes/hero-list/hero-list.component.ts">

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



<code-example path="styleguide/src/05-16/app/heroes/hero.component.avoid.ts" region="example" title="app/heroes/hero.component.ts">

</code-example>





<code-example path="styleguide/src/05-16/app/app.component.avoid.html" title="app/app.component.html">

</code-example>





<code-tabs>

  <code-pane title="app/heroes/hero.component.ts" path="styleguide/src/05-16/app/heroes/hero.component.ts" region="example">

  </code-pane>

  <code-pane title="app/app.component.html" path="styleguide/src/05-16/app/app.component.html">

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



<code-example path="styleguide/src/05-17/app/heroes/hero-list/hero-list.component.avoid.ts" region="example" title="app/heroes/hero-list/hero-list.component.ts">

</code-example>





<code-example path="styleguide/src/05-17/app/heroes/hero-list/hero-list.component.ts" region="example" title="app/heroes/hero-list/hero-list.component.ts">

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



<code-example path="styleguide/src/06-01/app/shared/highlight.directive.ts" region="example" title="app/shared/highlight.directive.ts">

</code-example>





<code-example path="styleguide/src/06-01/app/app.component.html" title="app/app.component.html">

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
`@Directive`나 `@Component` 데코레이터의 `host` 프로퍼티를 활용할 수 있는 로직은 `@HostListener`와 `@HostBinding`을 사용하는 것을 권장합니다.

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



<code-example path="styleguide/src/06-03/app/shared/validator.directive.ts" title="app/shared/validator.directive.ts">

</code-example>


<!--
Compare with the less preferred `host` metadata alternative.
-->
권장하지 않는 `host` 메타데이터를 사용하면 같은 내용을 어떻게 구현할 수 있는지 확인해 보세요.

<div class="s-why-last">


<!--
**Why?** The `host` metadata is only one term to remember and doesn't require extra ES imports.
-->
**왜?** `host` 메타데이터를 사용하는 것도 이벤트를 바인딩하는 방법 중 하나지만, 효율적인 방법을 선택하는 것이 좋습니다.

</div>



<code-example path="styleguide/src/06-03/app/shared/validator2.directive.ts" title="app/shared/validator2.directive.ts">

</code-example>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>


## Services

{@a 07-01}

### Services are singletons

<!--
#### Style 07-01
-->
#### 스타일 07-01

<div class="s-rule do">



**Do** use services as singletons within the same injector. Use them for sharing data and functionality.


</div>



<div class="s-why">



**Why?** Services are ideal for sharing methods across a feature area or an app.


</div>



<div class="s-why-last">



**Why?** Services are ideal for sharing stateful in-memory data.


</div>



<code-example path="styleguide/src/07-01/app/heroes/shared/hero.service.ts" region="example" title="app/heroes/shared/hero.service.ts">

</code-example>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 07-02}

### Single responsibility

<!--
#### Style 07-02
-->
#### 스타일 07-02

<div class="s-rule do">



**Do** create services with a single responsibility that is encapsulated by its context.


</div>



<div class="s-rule do">



**Do** create a new service once the service begins to exceed that singular purpose.


</div>



<div class="s-why">



**Why?** When a service has multiple responsibilities, it becomes difficult to test.


</div>



<div class="s-why-last">



**Why?** When a service has multiple responsibilities, every component or service that injects it now carries the weight of them all.


</div>

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 07-03}

### Providing a service

<!--
#### Style 07-03
-->
#### 스타일 07-03

<div class="s-rule do">



**Do** provide a service with the app root injector in the `@Injectable` decorator of the service.


</div>



<div class="s-why">



**Why?** The Angular injector is hierarchical.


</div>



<div class="s-why">



**Why?** When you provide the service to a root injector, that instance of the service is shared and available in every class that needs the service. This is ideal when a service is sharing methods or state.



</div>



<div class="s-why">



**Why?** When you register a service in the `@Injectable` decorator of the service, optimization tools such as those used by the CLI's production builds can perform tree shaking and remove services that aren't used by your app.

</div>



<div class="s-why-last">



**Why?** This is not ideal when two different components need different instances of a service. In this scenario it would be better to provide the service at the component level that needs the new and separate instance.


</div>

<code-example path="dependency-injection/src/app/tree-shaking/service.ts" title="src/app/treeshaking/service.ts" linenums="false"> </code-example> 




<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 07-04}

### Use the @Injectable() class decorator

<!--
#### Style 07-04
-->
#### 스타일 07-04

<div class="s-rule do">



**Do** use the `@Injectable()` class decorator instead of the `@Inject` parameter decorator when using types as tokens for the dependencies of a service.


</div>



<div class="s-why">



**Why?** The Angular Dependency Injection (DI) mechanism resolves a service's own
dependencies based on the declared types of that service's constructor parameters.


</div>



<div class="s-why-last">



**Why?** When a service accepts only dependencies associated with type tokens, the `@Injectable()` syntax is much less verbose compared to using `@Inject()` on each individual constructor parameter.


</div>



<code-example path="styleguide/src/07-04/app/heroes/shared/hero-arena.service.avoid.ts" region="example" title="app/heroes/shared/hero-arena.service.ts">

</code-example>





<code-example path="styleguide/src/07-04/app/heroes/shared/hero-arena.service.ts" region="example" title="app/heroes/shared/hero-arena.service.ts">

</code-example>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>


## Data Services

{@a 08-01}

### Talk to the server through a service

<!--
#### Style 08-01
-->
#### 스타일 08-01

<div class="s-rule do">



**Do** refactor logic for making data operations and interacting with data to a service.


</div>



<div class="s-rule do">



**Do** make data services responsible for XHR calls, local storage, stashing in memory, or any other data operations.


</div>



<div class="s-why">



**Why?** The component's responsibility is for the presentation and gathering of information for the view. It should not care how it gets the data, just that it knows who to ask for it. Separating the data services moves the logic on how to get it to the data service, and lets the component be simpler and more focused on the view.


</div>



<div class="s-why">



**Why?** This makes it easier to test (mock or real) the data calls when testing a component that uses a data service.


</div>



<div class="s-why-last">



**Why?** The details of data management, such as headers, HTTP methods,
caching, error handling, and retry logic, are irrelevant to components
and other data consumers.

A data service encapsulates these details. It's easier to evolve these
details inside the service without affecting its consumers. And it's
easier to test the consumers with mock service implementations.


</div>

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>


## Lifecycle hooks

Use Lifecycle hooks to tap into important events exposed by Angular.

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a 09-01}

### Implement lifecycle hook interfaces

<!--
#### Style 09-01
-->
#### 스타일 09-01

<div class="s-rule do">



**Do** implement the lifecycle hook interfaces.


</div>



<div class="s-why-last">



**Why?** Lifecycle interfaces prescribe typed method
signatures. use those signatures to flag spelling and syntax mistakes.


</div>



<code-example path="styleguide/src/09-01/app/heroes/shared/hero-button/hero-button.component.avoid.ts" region="example" title="app/heroes/shared/hero-button/hero-button.component.ts">

</code-example>





<code-example path="styleguide/src/09-01/app/heroes/shared/hero-button/hero-button.component.ts" region="example" title="app/heroes/shared/hero-button/hero-button.component.ts">

</code-example>



<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>


## Appendix

Useful tools and tips for Angular.

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a A-01}

### Codelyzer

#### Style A-01


<div class="s-rule do">



**Do** use [codelyzer](https://www.npmjs.com/package/codelyzer) to follow this guide.


</div>



<div class="s-rule consider">



**Consider** adjusting the rules in codelyzer to suit your needs.


</div>

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>

{@a A-02}

### File templates and snippets

#### Style A-02


<div class="s-rule do">



**Do** use file templates or snippets to help follow consistent styles and patterns. Here are templates and/or snippets for some of the web development editors and IDEs.


</div>



<div class="s-rule consider">



**Consider** using [snippets](https://marketplace.visualstudio.com/items?itemName=johnpapa.Angular2) for [Visual Studio Code](https://code.visualstudio.com/) that follow these styles and guidelines.

<a href="https://marketplace.visualstudio.com/items?itemName=johnpapa.Angular2">
  <img src="generated/images/guide/styleguide/use-extension.gif" alt="Use Extension">
</a>

**Consider** using [snippets](https://atom.io/packages/angular-2-typescript-snippets) for [Atom](https://atom.io/) that follow these styles and guidelines.

**Consider** using [snippets](https://github.com/orizens/sublime-angular2-snippets) for [Sublime Text](http://www.sublimetext.com/) that follow these styles and guidelines.

**Consider** using [snippets](https://github.com/mhartington/vim-angular2-snippets) for [Vim](http://www.vim.org/) that follow these styles and guidelines.


</div>

<!--
<a href="#toc">Back to top</a>
-->
<a href="#toc">맨 위로</a>
