<!--
# Using published libraries
-->
# 배포된 라이브러리 활용하기

<!--
When building Angular applications you can take advantage of sophisticated first-party libraries, such as [Angular Material](https://material.angular.io/), as well as rich ecosystem of third-party libraries.
See the [Angular Resources](resources) page for links to the most popular ones.
-->
Angular 애플리케이션을 만들 때 [Angular Material](https://material.angular.io/)과 같은 서드 파티 라이브러리를 활용하면 훌륭하지만 직접 구현하기에는 복잡한 기능을 손쉽게 도입할 수 있습니다.
활용할 수 있는 리소스 목록을 확인하려면 [Angular Resources](resources) 문서를 참고하세요.


<!--
## Installing libraries
-->
## 라이브러리 설치하기

<!--
Libraries are published as [npm packages](guide/npm-packages), usually together with schematics that integrate them with the Angular CLI.
To integrate reusable library code into an application, you need to install the package and import the provided functionality where you will use it. For most published Angular libraries, you can use the Angular CLI `ng add <lib_name>` command.

The `ng add` command uses a package manager such as [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) to install the library package, and invokes schematics that are included in the package to other scaffolding within the project code, such as adding import statements, fonts, themes, and so on.

A published library typically provides a README or other documentation on how to add that lib to your app.
For an example, see [Angular Material](https://material.angular.io/) docs.
-->
Angular 라이브러리는 [npm 패키지](guide/npm-packages)처럼 배포되며 Angular CLI 스키매틱을 확장하기도 합니다.
애플리케이션에 라이브러리 기능을 추가하려면 먼저 이 라이브러리 패키지를 설치하고 앱에 로드해야 하는데, Angular 라이브러리라면 Angular CLI를 사용해서 `ng add <라이브러리_이름>` 명령을 실행하면 됩니다.

`ng add` 명령을 실행하면 npm이나 [yarn](https://yarnpkg.com/)이 라이브러리 패키지를 설치하고 스키매틱을 확장하며, 이 라이브러리가 제대로 적용될 수 있도록 `import` 구문을 추가하거나 폰트, 테마를 수정하는 방식으로 프로젝트 코드를 수정합니다.

일반적으로 라이브러리는 활용할 수 있는 방법을 README 파일과 같은 형태의 문서로 제공합니다.
[Angular Material](https://material.angular.io/)은 별도 문서로 사용방법을 제공하고 있습니다.


<!--
### Library typings
-->
### 라이브러리의 타입 정의

<!--
Library packages often include typings in `.d.ts` files; see examples in `node_modules/@angular/material`. If your library's package does not include typings and your IDE complains, you may need to install the library's associated `@types/<lib_name>` package.

For example, suppose you have a library named `d3`:
-->
라이브러리 패키지에는 타입을 정의하는 `.d.ts` 파일이 있을 수 있습니다.
`node_modules/@angular/material` 패키지에도 이 파일이 존재합니다.
그리고 설치한 라이브러리 패키지에 타입 정의 파일이 없어서 IDE에서 타입 관련 기능이 제대로 동작하지 않는다면 `@types/<라이브러리_이름>` 패키지가 별도로 존재하는지 찾아보는 것이 좋습니다.

`d3` 라이브러리는 이 방식으로 타입 정의 파일을 추가할 수 있습니다:

<code-example language="bash">
npm install d3 --save
npm install @types/d3 --save-dev
</code-example>

<!--
Types defined in a `@types/` package for a library installed into the workspace are automatically added to the TypeScript configuration for the project that uses that library.
TypeScript looks for types in the `node_modules/@types` folder by default, so you don't have to add each type package individually.

If a library doesn't have typings available at `@types/`, you can still use it by manually adding typings for it.
To do this:

1. Create a `typings.d.ts` file in your `src/` folder. This file is automatically included as global type definition.

2. Add the following code in `src/typings.d.ts`:

```
declare module 'host' {
  export interface Host {
    protocol?: string;
    hostname?: string;
    pathname?: string;
  }
  export function parse(url: string, queryString?: string): Host;
}
```

3. In the component or file that uses the library, add the following code:

```
import * as host from 'host';
const parsedUrl = host.parse('https://angular.io');
console.log(parsedUrl.hostname);
```

You can define more typings as needed.
-->
`@types/` 패키지로 제공되는 타입 정의 파일들을 워크스페이스에 설치하면 프로젝트 TypeScript 설정에 따라 자동으로 추가됩니다.
타입 정의 패키지가 설치되는 기본 위치는 `node_modules/@types` 입니다.
이 위치에 설치된 패키지는 일일이 추가할 필요가 없습니다.

라이브러리가 타입 정의 파일을 제공하지 않고 `@types/` 패키지도 존재하지 않는다면 직접 타입 정의 파일을 추가하는 방법도 있습니다.
이렇게 하면 됩니다:

1. `src/` 폴더에 `typings.d.ts` 파일을 생성합니다. 이 파일은 전역 타입 정의 파일로 자동 로드 됩니다.

2. `src/typings.d.ts` 파일을 다음과 같이 작성합니다.

```
declare module 'host' {
  export interface Host {
    protocol?: string;
    hostname?: string;
    pathname?: string;
  }
  export function parse(url: string, queryString?: string): Host;
}
```

3. 라이브러리를 사용하는 파일에 다음 코드를 추가합니다.

```
import * as host from 'host';
const parsedUrl = host.parse('https://angular.io');
console.log(parsedUrl.hostname);
```

타입은 원하는 대로 얼마든지 정의할 수 있습니다.


<!--
## Updating libraries
-->
## 라이브러리 업데이트하기

<!--
Libraries can be updated by their publishers, and also have their own dependencies which need to be kept current.
To check for updates to your installed libraries, use the [`ng update` command](cli/update).

Use `ng update <lib_name>` to update individual library versions. The Angular CLI checks the latest published release of the library, and if the latest version is newer than your installed version, downloads it and updates your `package.json` to match the latest version.

When you update Angular to a new version, you need to make sure that any libraries you are using are current. If libraries have interdependencies, you might have to update them in a particular order.
See the [Angular Update Guide](https://update.angular.io/) for help.
-->
라이브러리는 제작자가 업데이트할 수도 있지만 라이브러리와 연결된 다른 라이브러리가 업데이트될 수도 있습니다.
프로젝트에 설치된 라이브러리를 업데이트해야 하는지 확인하려면 [`ng update` 명령](cli/update)을 사용하면 됩니다.

그리고 라이브러리를 하나씩 업데이트 하려면 `ng update <라이브러리_이름>` 명령을 실행하면 됩니다.
이 명령을 실행하면 Angular CLI가 라이브러리 최신 버전을 확인하고 로컬에 설치하며 해당 버전으로 `package.json` 파일을 갱신합니다.

Angular 자체를 업데이트하려면 다른 라이브러리들이 최신버전인지 먼저 확인해야 합니다.
그리고 라이브러리 중에 서로 연관된 것이 있다면 적절한 순서로 업데이트 해야할 수도 있습니다.
자세한 내용은 [Angular 업데이트 가이드](https://update.angular.io/) 사이트를 참고하세요.


<!--
## Adding a library to the runtime global scope
-->
## 전역 컨텍스트에 라이브러리 추가하기

<!--
Legacy JavaScript libraries that are not imported into an app can be added to the runtime global scope and loaded as if they were in a script tag.
Configure the CLI to do this at build time using the "scripts" and "styles" options of the build target in the [CLI configuration file](guide/workspace-config), `angular.json`.

For example, to use the [Bootstrap 4](https://getbootstrap.com/docs/4.0/getting-started/introduction/) library, first install the library and its dependencies using the npm package manager:
-->
`<script>` 태그로 로드해서 전역 컨텍스트에 존재하는 레거시 JavaScript 라이브러리들이 있습니다.
이런 라이브러리들은 이제 [Angular CLI 환경 설정 파일](guide/workspace-config) `angular.json`에서 로드합니다.
설정 파일에서 "scripts" 옵션과 "styles" 옵션에 원하는 라이브러리를 추가하면 앱 빌드 시점에 이 라이브러리들이 함께 빌드되어 빌드 결과물이 만들어 집니다.

예를 들어 봅시다.
[Bootstrap 4](https://getbootstrap.com/docs/4.0/getting-started/introduction/) 라이브러리를 설치하려면 다음과 같이 의존 관계에 있는 패키지도 함께 설치해야 합니다:

<code-example language="bash">
npm install jquery --save
npm install popper.js --save
npm install bootstrap --save
</code-example>

<!--
In the `angular.json` configuration file, add the associated script files to the "scripts" array:
-->
패키지를 다 설치하고 나면 `angular.json` 파일의 "scripts" 배열에 다음과 같은 내용을 추가합니다:

```
"scripts": [
  "node_modules/jquery/dist/jquery.slim.js",
  "node_modules/popper.js/dist/umd/popper.js",
  "node_modules/bootstrap/dist/js/bootstrap.js"
],
```

<!--
Add the Bootstrap CSS file to the "styles" array:
-->
Bootstrap CSS 파일은 "styles" 배열에 추가합니다:

```
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.css",
  "src/styles.css"
],
```

<!--
Run or restart `ng serve` to see Bootstrap 4 working in your app.
-->
이제 `ng serve` 명령을 다시 실행하면 애플리케이션에 Bootstrap 4가 적용된 것을 확인할 수 있습니다.


{@a using-runtime-global-libraries-inside-your-app}
<!--
### Using runtime-global libraries inside your app
-->
### 앱에서 전역 컨텍스트에 있는 라이브러리 사용하기

<!--
Once you import a library using the "scripts" array, you should **not** import it using an import statement in your TypeScript code (such as `import * as $ from 'jquery';`).
If you do, you'll end up with two different copies of the library: one imported as a global library, and one imported as a module.
This is especially bad for libraries with plugins, like JQuery, because each copy will have different plugins.

Instead, download typings for your library (`npm install @types/jquery`) and follow the library installation steps. This gives you access to the global variables exposed by that library.
-->
"scripts" 배열에 라이브러리를 등록했다면 TypeScript 코드에서 `import * as $ from 'jquery';`와 같이 라이브러리를 로드하는 코드를 작성하지 않아도 됩니다.
이렇게 사용하면 결국 전역에 존재하는 라이브러리와 모듈이 로드한 라이브러리, 총 두 벌을 사용하는 형태가 됩니다.
특히 JQuery같이 플러그인이 추가로 존재하는 라이브러리라면 양쪽에서 로드하는 라이브러리가 다른 플러그인을 구성할 수도 있으니 주의해야 합니다.

전역 라이브러리를 제대로 사용하려면 이 라이브러리의 타입 정의 파일을 설치하고(`npm install @types/jquery`) 라이브러리에서 권장하는 방식을 따르는 것이 가장 좋습니다.


<!--
### Defining typings for runtime-global libraries
-->
### 전역 컨텍스트에 있는 라이브러리의 타입 정의하기

<!--
If the global library you need to use does not have global typings, you can declare them manually as `any` in `src/typings.d.ts`. For example:

```
declare var libraryName: any;
```

Some scripts extend other libraries; for instance with JQuery plugins:

```
$('.test').myPlugin();
```

In this case, the installed `@types/jquery` doesn't include `myPlugin`, so you need to add an interface in `src/typings.d.ts`. For example:

```
interface JQuery {
  myPlugin(options?: any): any;
}
```

If you don't add the interface for the script-defined extension, your IDE shows an error:

```
[TS][Error] Property 'myPlugin' does not exist on type 'JQuery'
```
-->
전역 컨텍스트에 사용하지만 타입 정의 파일이 없는 라이브러리라면 `src/typings.d.ts` 파일에서 강제로 `any` 타입을 지정할 수 있습니다.

```
declare var libraryName: any;
```

플러그인 형태로 확장할 수 있는 라이브러리들이 있습니다. JQuery의 경우에는 이렇습니다:

```
$('.test').myPlugin();
```

이런 경우에 `@types/jquery`에는 `myPlugin`이라는 것이 존재하기 때문에 `src/typings.d.ts` 파일을 다음과 같이 수정해야 합니다:

```
interface JQuery {
  myPlugin(options?: any): any;
}
```

라이브러리의 타입을 제대로 지정하지 않으면 IDE에서 다음과 같은 에러가 발생할 수 있습니다:

```
[TS][Error] Property 'myPlugin' does not exist on type 'JQuery'
```