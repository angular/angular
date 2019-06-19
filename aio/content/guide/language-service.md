<!--
# Angular Language Service
-->
# Angular 언어 지원 서비스

<!--
The Angular Language Service is a way to get completions, errors,
hints, and navigation inside your Angular templates whether they
are external in an HTML file or embedded in annotations/decorators
in a string. The Angular Language Service autodetects that you are
opening an Angular file, reads your `tsconfig.json` file, finds all the
templates you have in your application, and then provides language
services for any templates that you open.
-->
Angular 언어 지원 서비스(Angular Language Service)는 코드 자동완성 기능을 지원할 뿐 아니라 문법 오류 체크, 코드에 대한 힌트를 제공하며, 외부 템플릿 파일에 사용된 Angular 심볼 추적 기능을 제공하고 문자열 안에(embedded) 사용된 어노테이션과 데코레이터에 대한 정보도 제공합니다.
Angular 프로젝트 안에 있는 파일을 하나 열면 Angular 언어 지원 서비스가 `tsconfig.json` 파일을 읽어서 Angular 애플리케이션 안에 있는 템플릿 파일을 모두 찾아서 분석합니다.
그리고 이 과정이 끝난 후에는 템플릿 파일을 열자마자 언어 지원 서비스를 바로 사용할 수 있습니다.

<!--
## Autocompletion
-->
## 코드 자동완성

<!--
Autocompletion can speed up your development time by providing you with
contextual possibilities and hints as you type. This example shows
autocomplete in an interpolation. As you type it out,
you can hit tab to complete.
-->
코드 자동완성 기능을 활용하면 해당 컨텍스트에 사용할 수 있는 힌트를 제공받을 수 있기 때문에 개발 속도를 크게 향상시킬수 있습니다.
이 기능은 문자열 바인딩에서도 제공됩니다.
코드 자동완성 기능이 제공하는 항목 중에서 원하는 것을 선택하고 탭키를 누르기만 하면 됩니다.

<figure>
  <img src="generated/images/guide/language-service/language-completion.gif" alt="autocompletion">
</figure>

<!--
There are also completions within
elements. Any elements you have as a component selector will
show up in the completion list.
-->
자동완성 기능은 엘리먼트 안에서도 제공됩니다.
컴포넌트 셀렉터로 사용된 엘리먼트 태그는 템플릿에 추가할 수 있는 엘리먼트 목록에 함께 제공됩니다.

<!--
## Error checking
-->
## 문법 오류 체크

<!--
The Angular Language Service can also forewarn you of mistakes in your code.
In this example, Angular doesn't know what `orders` is or where it comes from.
-->
Angular 언어 지원 서비스를 사용하면 코드를 작성할 때 발생하는 오타를 방지할 수 있습니다.
그래서 템플릿에 `orders`라는 항목을 추가했는데 이 항목이 Angular 구성요소 중 어느것에도 해당되지 않는다면 다음과 같이 표시됩니다.

<figure>
  <img src="generated/images/guide/language-service/language-error.gif" alt="error checking">
</figure>

<!--
## Navigation
-->
## 네비게이션

<!--
Navigation allows you to hover to
see where a component, directive, module, etc. is from and then
click and press F12 to go directly to its definition.
-->
Angular 템플릿에 컴포넌트나 디렉티브, 모듈 등이 사용되면 이 항목으로 이동할 수 있는 기능이 제공됩니다.
해당 항목을 클릭하고 F12를 누르면 됩니다.

<figure>
  <img src="generated/images/guide/language-service/language-navigation.gif" alt="navigation">
</figure>


<!--
## Angular Language Service in your editor
-->
## 에디터에서 Angular 언어 지원 서비스 활용하기

<!--
Angular Language Service is currently available for [Visual Studio Code](https://code.visualstudio.com/) and
[WebStorm](https://www.jetbrains.com/webstorm).
-->
Angular 언어 지원 서비스는 현재 [Visual Studio Code](https://code.visualstudio.com/)와
[WebStorm](https://www.jetbrains.com/webstorm)에서 활용할 수 있습니다.

### Visual Studio Code

<!--
In Visual Studio Code, install Angular Language Service from the store,
which is accessible from the bottom icon on the left menu pane.
You can also use the VS Quick Open (⌘+P on Mac, CTRL+P on Windows) to search for the extension. When you've opened it,
enter the following command:
-->
Visual Studio Code에서 Angular 언어 지원 서비스를 활성화하려면 왼쪽 메뉴 패널 아래에 있는 store 아이콘을 클릭하거나, VS Quick Open (⌘+P) 기능을 활용해서 이 확장 기능을 설치하면 됩니다.
VS Quick Open을 활용하는 경우에는 다음 명령을 입력하면 됩니다:


```sh
ext install Angular.ng-template
```

<!--
Then click the install button to install the Angular Language Service.
-->
그리고 설치 버튼을 클릭하면 Angular 언어 지원 서비스가 설치됩니다.


### WebStorm

<!--
In webstorm, you have to install the language service as a dev dependency.
When Angular sees this dev dependency, it provides the
language service inside of WebStorm. Webstorm then gives you
colorization inside the template and autocomplete in addition to the Angular Language Service.

Here's the dev dependency
you need to have in `package.json`:
-->
WebStorm에서는 Angular 언어 지원 서비스를 개발용 패키지로 설치해야 하며, Angular가 이 패키지가 설치된 것을 확인하면 자동으로 WebStorm에서 이 기능을 활용할 수 있습니다.
Angular 언어 지원 서비스가 활성화되면 WebStorm으로 작업하는 템플릿과 클래스 코드에 코드 하이라이트 기능도 활성화 됩니다.

개발용 패키지를 설치하려면 먼저 `package.json`에 다음 항목을 추가합니다:

```json
devDependencies {
  "@angular/language-service": "^6.0.0"
}
```

<!--
Then in the terminal window at the root of your project,
install the `devDependencies` with `npm` or `yarn`:
-->
그리고 나서 프로젝트 최상위 폴더에서 터미널 창을 열고 `npm`이나 `yarn`으로 `devDependencies` 항목을 설치하면 됩니다.

```sh
npm install
```
<!--
*OR*
-->
*또는*

```sh
yarn
```

<!--
*OR*
-->
*또는*

```sh
yarn install
```


### Sublime Text

<!--
In [Sublime Text](https://www.sublimetext.com/), you first need an extension to allow Typescript.
Install the latest version of typescript in a local `node_modules` directory:
-->
[Sublime Text](https://www.sublimetext.com/)에서는 먼저 TypeScript 확장 패키지를 설치해야 합니다.
먼저 로컬 `node_modules` 폴더에 최신 TypeScript를 설치합니다:

```sh
npm install --save-dev typescript
```

<!--
Then install the Angular Language Service in the same location:
-->
그리고 같은 위치에 Angular 언어 지원 서비스를 설치합니다.
```sh
npm install --save-dev @angular/language-service
```

<!--
Starting with TypeScript 2.3, TypeScript has a language service plugin model that the language service can use.

Next, in your user preferences (`Cmd+,` or `Ctrl+,`), add:
-->
TypeScript 2.3부터는 TypeScript가 다른 언어 지원 서비스를 자동으로 로드할 수 있도록 플러그인 모델 형태를 제공합니다.

환경 설정 메뉴(`Cmd+,` or `Ctrl+,`)를 열고 다음 항목을 추가하세요:

```json
"typescript-tsdk": "<path to your folder>/node_modules/typescript/lib"
```

<!--
## Installing in your project
-->
## 프로젝트에 언어 지원 서비스 설치하기

<!--
You can also install Angular Language Service in your project with the
following `npm` command:
-->
Angular 언어 지원 서비스는 `npm` 명령을 실행해서 프로젝트에 설치할 수 있습니다.

```sh
npm install --save-dev @angular/language-service
```
<!--
Additionally, add the following to the `"compilerOptions"` section of
your project's `tsconfig.json`.
-->
이 패키지를 설치하고 나면 프로젝트 `tsconfig.json` 파일의 `"compilerOptions"` 섹션에 다음 내용을 추가합니다.

```json
  "plugins": [
      {"name": "@angular/language-service"}
  ]
```
<!--
Note that this only provides diagnostics and completions in `.ts`
files. You need a custom sublime plugin (or modifications to the current plugin)
for completions in HTML files.
-->
하지만 Sublime Text에서는 `.ts` 파일에서만 언어 지원 서비스가 동작하기 때문에 코드 자동완성 기능도 `.ts` 파일에서만 동작합니다.
HTML 파일에서도 코드 자동완성 기능을 활용하려면 커스텀 플러그인을 설치해야 합니다.


<!--
## How the Language Service works
-->
## 언어 지원 서비스는 어떻게 동작할까?

<!--
When you use an editor with a language service, there's an
editor process which starts a separate language process/service
to which it speaks through an [RPC](https://en.wikipedia.org/wiki/Remote_procedure_call).
Any time you type inside of the editor, it sends information to the other process to
track the state of your project. When you trigger a completion list within a template, the editor process first parses the template into an HTML AST, or [abstract syntax tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree). Then the Angular compiler interprets
what module the template is part of, the scope you're in, and the component selector. Then it figures out where in the template AST your cursor is. When it determines the
context, it can then determine what the children can be.

It's a little more involved if you are in an interpolation. If you have an interpolation of `{{data.---}}` inside a `div` and need the completion list after `data.---`, the compiler can't use the HTML AST to find the answer. The HTML AST can only tell the compiler that there is some text with the characters "`{{data.---}}`". That's when the template parser produces an expression AST, which resides within the template AST. The Angular Language Services then looks at `data.---` within its context and asks the TypeScript Language Service what the members of data are. TypeScript then returns the list of possibilities.


For more in-depth information, see the
[Angular Language Service API](https://github.com/angular/angular/blob/master/packages/language-service/src/types.ts)
-->
언어 지원 서비스를 지원하는 에디터는 이 언어 지원 서비스를 [RPC](https://en.wikipedia.org/wiki/Remote_procedure_call) 방식으로 연결합니다.
그래서 에디터에 무엇인가 입력했을 때 에디터는 해당 코드에 대한 정보를 언어 지원 서비스로 보내고, 해당 컨텍스트에 활용할 수 있는 정보를 언어 지원 서비스로부터 받아오는 방식으로 동작합니다.
템플릿에서 코드 자동완성 기능을 요청하면 에디터는 먼저 템플릿을 HTML AST나 [추상 문법 트리(abstract syntax tree)](https://en.wikipedia.org/wiki/Abstract_syntax_tree)로 변환합니다.
그러면 Angular 컴파일러가 이 정보를 받아서 현재 템플릿이 어떤 모듈에 있는 템플릿이며, 어떤 스코프(scope) 안에 있고, 어떤 컴포넌트 셀렉터에 해당하는지 분석한 후에, 현재 커서가 위치한 곳이 템플릿의 어떤 위치인지 확인합니다.
컨텍스트가 확인되고 나면 해당 컨텍스트에 어떤 항목을 작성할 수 있는지 판단합니다.

문자열 바인딩 안에서는 조금 더 복잡합니다.
`div` 엘리먼트 안에서 `{{data.---}}`라고 입력한 후에 `data.---`에는 어떤 항목이 올 수 있는지 코드 자동완성 기능을 요청하는 상황에서는 Angular 컴파일러가 HTML AST에서 이 답을 찾을 수 없습니다.
HTML AST는 Angular 컴파일러에게 단지 "`{{data.---}}`"라는 문자열이 있다고만 알려줄 뿐입니다.
이런 경우에는 템플릿 파서가 템플릿 AST 안에 표현식(expression) AST를 생성합니다.
그러면 이제 Angular 언어 지원 서비스가 표현식 AST 컨텍스트 안에서 `data.---`에 해당하는 자동완성 목록을 TypeScript 언어 지원 서비스에 요청합니다.
자동완성 목록은 TypeScript 언어지원 서비스가 준비해서 반환합니다.


더 자세한 내용은 [Angular Language Service API](https://github.com/angular/angular/blob/master/packages/language-service/src/types.ts) 문서를 참고하세요.





<hr>

<!--
## More on Information
-->
## 참고할만한 내용

<!--
For more information, see [Chuck Jazdzewski's presentation](https://www.youtube.com/watch?v=ez3R0Gi4z5A&t=368s) on the Angular Language
Service from [ng-conf](https://www.ng-conf.org/) 2017.
-->
Chuck Jazdzewski가 [ng-conf](https://www.ng-conf.org/) 2017에서 [Angular 언어 지원 서비스에 대해 발표한 내용](https://www.youtube.com/watch?v=ez3R0Gi4z5A&t=368s)도 확인해 보세요.

