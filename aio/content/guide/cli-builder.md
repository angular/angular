<!--
# Angular CLI builders
-->
# Angular CLI 빌더

<!--
A number of Angular CLI commands run a complex process on your code, such as linting, building, or testing.
The commands use an internal tool called Architect to run *CLI builders*, which apply another tool to accomplish the desired task.

With Angular version 8, the CLI Builder API is stable and available to developers who want to customize the Angular CLI by adding or modifying commands. For example, you could supply a builder to perform an entirely new task, or to change which third-party tool is used by an existing command.

This document explains how CLI builders integrate with the workspace configuration file, and shows how you can create your own builder.
-->
Angular CLI는 프로젝트 코드를 조작하는 명령을 다양하게 제공합니다.
린트(lint)나 빌드, 테스트가 이런 명령에 해당됩니다.
이런 명령은 아키텍트(Architect)라고 하는 내부 툴이 개별 작업 단위로 구성된 *CLI 빌더(builders)*를 실행하는 방식으로 동작합니다.

CLI 빌더 API가 확정된 8버전부터는 개발자가 Angular CLI 명령을 추가하거나 기본제공 명령이 동작하는 방식을 변경할 수 있도록 확장되었습니다.
이제 기존과 완전히 다른 태스크를 추가할 수 있고, 서드 파티 툴을 이용해서 기존 명령을 대체할 수도 있습니다.

이 문서는 CLI 빌더를 다루면서 이 빌더를 워크스페이스 환경설정 파일과 통합하는 내용에 대해서도 다룹니다.
커스텀 빌더를 만드는 방법에 대해서도 알아봅시다.

<div class="alert is-helpful">

   <!--
   You can find the code from the examples used here in [this GitHub repository](https://github.com/mgechev/cli-builders-demo).
   -->
   이 문서에서 다루는 예제 코드는 [GitHub 저장소](https://github.com/mgechev/cli-builders-demo)에서 확인할 수 있습니다.

</div>


<!--
## CLI builders
-->
## CLI 빌더

<!--
The internal Architect tool delegates work to handler functions called [*builders*](guide/glossary#builder).
A builder handler function receives two arguments; a set of input `options` (a JSON object), and a `context` (a `BuilderContext` object).

The separation of concerns here is the same as with [schematics](guide/glossary#schematic), which are used for other CLI commands that touch your code (such as `ng generate`).

* Options are given by the CLI user, context is provided by and provides access to the CLI Builder API, and the developer provides the behavior.

* The `BuilderContext` object provides access to the scheduling method, `BuilderContext.scheduleTarget()`. The scheduler executes the builder handler function with a given [target configuration](guide/glossary#target).

The builder handler function can be synchronous (return a value) or asynchronous (return a Promise), or it can watch and return multiple values (return an Observable).
The return value or values must always be of type `BuilderOutput`.
This object contains a Boolean `success` field and an optional `error` field that can contain an error message.

Angular provides some builders that are used by the CLI for commands such as `ng build`, `ng test`, and `ng lint`.
Default target configurations for these and other built-in CLI builders can be found (and customized) in the "architect" section of the [workspace configuration file](guide/workspace-config), `angular.json`.
You can also extend and customize Angular by creating your own builders, which you can run using the [`ng run` CLI command](cli/run).
-->
아키텍트 툴은 개별 작업을 처리할 때 [*빌더*](guide/glossary#builder)라는 핸들러 함수를 활용합니다.
빌더는 인자를 두 개 받습니다.
첫 번째 옵션값을 정의하는 JSON 객체 `options`이며 두 번째 인자는 컨텍스트를 표현하는 `BuilderContext` 객체 `context`입니다.

CLI 빌더도 [스키매틱](guide/glossary#schematic)과 마찬가지로 역할에 맞게 객체를 구분해서 사용합니다.

* 옵션은 CLI 사용자가 전달하는 값입니다. 그리고 컨텍스트는 CLI 빌더 API를 활용하기 위해 CLI 빌더가 전달하는 객체입니다.

* `BuilderContext` 객체를 사용하면 스케쥴 메소드 `BuilderContext.scheduleTarget()`에 접근할 수 있습니다. 스케쥴러를 활용하면 빌더 함수를 [원하는 빌드 방법으로](guide/glossary#target) 실행할 수 있습니다.

빌더 함수는 직접 값을 반환하는 동기방식으로 실행할 수 있고, 프로미스를 사용해서 비동기방식으로 실행할 수도 있으며, 옵저버블을 사용해서 여러번 값을 반환하는 방식으로 실행할 수도 있습니다.
이 때 반환되는 모든 값은 반드시 `BuilderOutput` 타입이어야 하는데, 이 타입에는 불리언 타입 `success` 필드와 에러 메시지를 표시할 `error` 옵션 필드가 있습니다.

Angular CLI로 실행하는 `ng build`, `ng test`, `ng lint` 명령은 모두 이런 빌더를 활용하는 것입니다.
명령이 실행될 때 사용되는 기본 프로젝트 등 옵션값은 [워크스페이스 환경설정 파일](guide/workspace-config) `angular.json`의 "architect" 섹션에서 지정합니다.
그리고 커스텀 빌더를 구현하면 기존에 있던 동작을 확장하거나 변경할 수 있습니다.
새로 추가한 커스텀 빌더는 [`ng run` CLI 명령](cli/run)으로 실행합니다.


<!--
### Builder project structure
-->
### 빌더 프로젝트 구조

<!--
A builder resides in a "project" folder that is similar in structure to an Angular workspace, with global configuration files at the top level, and more specific configuration in a source folder with the code files that define the behavior.
For example, your `myBuilder` folder could contain the following files.

| FILES    | PURPOSE |
| :----------------------- | :------------------------------------------|
| `src/my-builder.ts`      | Main source file for the builder definition. |
| `src/my-builder.spec.ts` | Source file for tests. |
| `src/schema.json`        | Definition of builder input options. |
| `builders.json`          | Testing configuration. |
| `package.json`           | Dependencies. See https://docs.npmjs.com/files/package.json. |
| `tsconfig.json`          | [TypeScript configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html). |

You can publish the builder to `npm` (see [Publishing your Library](https://angular.io/guide/creating-libraries#publishing-your-library)). If you publish it as `@example/my-builder`, you can install it using the following command.

<code-example language="sh">

npm install @example/my-builder

</code-example>
-->
빌더는 프로젝트 폴더 안에 존재하기 때문에 일반적인 Angular 워크스페이스와 비슷하게 구성됩니다.
전역 환경설정 파일은 워크스페이스 최상위 폴더에 존재하며, 세부 설정일수록 개별 폴더에 존재하는 식입니다.
그래서 `myBuilder`라는 폴더는 다음과 같이 구성할 수 있습니다.

| 파일    | 용도 |
| :----------------------- | :------------------------------------------|
| `src/my-builder.ts`      | 빌더 로직을 정의하는 메인 소스 파일 |
| `src/my-builder.spec.ts` | 테스트 스펙 파일 |
| `src/schema.json`        | 빌더 입력값의 형식을 정의하는 파일 |
| `builders.json`          | 테스트 환경설정 파일 |
| `package.json`           | 의존성 패키지 선언 파일. [npm 스펙 문서](https://docs.npmjs.com/files/package.json)를 참고하세요. |
| `tsconfig.json`          | [TypeScript 환경설정 파일](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) |

빌더는 npm 저장소에 배포할 수 있습니다.
자세한 내용은 [라이브러리 배포하기](https://angular.io/guide/creating-libraries#publishing-your-library) 문서를 참고하세요.
그리고 이렇게 배포한 빌더는 다음과 같은 명령으로 설치할 수 있습니다.

<code-example language="sh">

npm install @example/my-builder

</code-example>


<!--
## Creating a builder
-->
## 빌더 만들기

<!--
As an example, let's create a builder that executes a shell command.
To create a builder, use the `createBuilder()` CLI Builder function, and return a `Promise<BuilderOutput>` object.

<code-example 
  path="cli-builder/src/my-builder.ts" 
  header="src/my-builder.ts (builder skeleton)" 
  region="builder-skeleton">
</code-example>

Now let’s add some logic to it.
The following code retrieves the command and arguments from the user options, spawns the new process, and waits for the process to finish.
If the process is successful (returns a code of 0), it resolves the return value.

<code-example 
  path="cli-builder/src/my-builder.ts" 
  header="src/my-builder.ts (builder)" 
  region="builder">
</code-example>
-->
쉘 명령을 실행하는 빌더를 한 번 만들어 봅시다.
빌더는 `createBuilder()` 함수를 실행했을 때 반환하는 `Promise<BuilderOutput>` 객체를 반환하면 됩니다.

<code-example 
  path="cli-builder/src/my-builder.ts" 
  header="src/my-builder.ts (빌더 기본 코드)" 
  region="builder-skeleton">
</code-example>

이제 이 파일에 로직을 약간 추가해 봅시다.
아래 코드는 빌더를 실행할 때 사용자에게 옵션값을 받고, 새 프로세스를 생성하고, 이 프로세스가 끝나기를 기다리는 코드입니다.
프로세스가 0을 반환하면서 정상 종료되면 최종 결과값을 반환합니다.

<code-example 
  path="cli-builder/src/my-builder.ts" 
  header="src/my-builder.ts (빌더)" 
  region="builder">
</code-example>


<!--
### Handling output
-->
### 로그 처리하기

<!--
By default, the `spawn()` method outputs everything to the process standard output and error.
To make it easier to test and debug, we can forward the output to the CLI Builder logger instead.
This also allows the builder itself to be executed in a separate process, even if the standard output and error are deactivated (as in an [Electron app](https://electronjs.org/)).

We can retrieve a Logger instance from the context.

<code-example 
  path="cli-builder/src/my-builder.ts" 
  header="src/my-builder.ts (handling output)" 
  region="handling-output">
</code-example>
-->
`spawn()` 메소드는 원래 표준 출력 스트림과 표준 에러 스트림으로 에러를 출력합니다.
이 예제에서는 테스트하거나 디버깅하기 편하도록 CLI 빌더 로거(logger)로 출력을 옮겨봅시다.
이 방식을 사용하면 [Electron 앱](https://electronjs.org/)처럼 표준 출력이나 표준 에러 스트림이 활성화 되어있지 않은 환경에서도 별도 프로세스로 로그를 처리할 수 있습니다.

로거 인스턴스는 컨텍스트로 참조해서 받아옵니다.

<code-example 
  path="cli-builder/src/my-builder.ts" 
  header="src/my-builder.ts (로그 처리하기)" 
  region="handling-output">
</code-example>


<!--
### Progress and status reporting
-->
### 진행상황, 상태 알리기

<!--
The CLI Builder API includes progress and status reporting tools, which can provide hints for certain functions and interfaces.

To report progress, use the `BuilderContext.reportProgress()` method, which takes a current value, (optional) total, and status string as arguments.
The total can be any number; for example, if you know how many files you have to process, the total could be the number of files, and current should be the number processed so far.
The status string is unmodified unless you pass in a new string value.

You can see an [example](https://github.com/angular/angular-cli/blob/ba21c855c0c8b778005df01d4851b5a2176edc6f/packages/angular_devkit/build_angular/src/tslint/index.ts#L107) of how the `tslint` builder reports progress.

In our example, the shell command either finishes or is still executing, so there’s no need for a progress report, but we can report status so that a parent builder that called our builder would know what’s going on.
Use the `BuilderContext.reportStatus()` method to generate a status string of any length.
(Note that there’s no guarantee that a long string will be shown entirely; it could be cut to fit the UI that displays it.)
Pass an empty string to remove the status.

<code-example 
  path="cli-builder/src/my-builder.ts" 
  header="src/my-builder.ts (progess reporting)" 
  region="progress-reporting">
</code-example>
-->
CLI 빌더 API를 활용하면 빌더가 지금 어떤 함수를 실행하고 있는지, 어떤 상태인지 사용자에게 자세하게 알려줄 수 있습니다.

진행상황을 알리려면 `BuilderContext.reportProgress()` 메소드를 사용하는데, 이 때 인자로 현재값과 전체값(생략 가능), 현재 상태 메시지를 인자로 전달합니다.
전체값은 아무 숫자나 가능합니다.
빌더가 파일을 처리한다면 처리해야 하는 파일의 전체 개수를 전체값으로 하고 지금까지 처리한 파일의 개수를 현재값으로 사용하는 방식도 가능합니다.
그리고 한 번 보낸 상태 메시지는 새로운 값을 보내기 전까지 변경되지 않습니다.

[`tslint` 빌더가 진행상황을 어떻게 처리하는지](https://github.com/angular/angular-cli/blob/ba21c855c0c8b778005df01d4851b5a2176edc6f/packages/angular_devkit/build_angular/src/tslint/index.ts#L107) 참고하는 것도 좋습니다.

이전 섹션에서 작성한 빌더는 쉘 명령이 실행중이거나 종료된 상태만 존재하기 때문에 따로 진행상황을 알릴 필요는 없지만, 부모 빌더에게 현재 상태를 알려주기 위해 로직을 추가해 봅시다.
`BuilderContext.reportStatus()` 메소드에 사용할 수 있는 문자열 길이는 제한이 없습니다.
하지만 사용자의 디스플레이 상황에 따라 메시지가 잘릴 수 있으니 주의해야 합니다.
상태 메시지를 없애려면 빈 문자열을 보내면 됩니다.

<code-example 
  path="cli-builder/src/my-builder.ts" 
  header="src/my-builder.ts (진행상황 알리기)" 
  region="progress-reporting">
</code-example>


<!--
## Builder input
-->
## 빌더 입력값

<!--
You can invoke a builder indirectly through a CLI command, or directly with the Angular CLI `ng run` command.
In either case, you must provide required inputs, but can allow other inputs to default to values that are pre-configured for a specific [*target*](guide/glossary#target), provide a pre-defined, named override configuration, and provide further override option values on the command line.
-->
빌더는 Angular CLI를 통해 간접적으로 실행할 수 있고 Angular CLI `ng run` 명령으로 직접 실행할 수도 있습니다.
어떤 경우든 빌더를 실행하려면 입력값을 전달해야 하는데, 입력값이 전달되지 않을 때 사용할 [*빌드 방법(target)*](guide/glossary#target)과 옵션을 미리 지정해 둘 수 있습니다.
커맨드라인에서 지정하는 옵션은 환경설정값을 오버라이드합니다.


<!--
### Input validation
-->
### 입력값 유효성 검사

<!--
You define builder inputs in a JSON schema associated with that builder.
The Architect tool collects the resolved input values into an `options` object, and validates their types against the schema before passing them to the builder function.
(The Schematics library does the same kind of validation of user input).

For our example builder, we expect the `options` value to be a `JsonObject` with two keys: a `command` that is a string, and an `args` array of string values.

We can provide the following schema for type validation of these values.
-->
빌더 입력값은 JSON 스키마로 정의합니다.
그러면 아키텍트 툴은 빌더가 실행될 때 전달된 입력값을 `object` 객체로 변환하며, 스키마에 정의된 대로 입력값이 유효한지 검사한 후에 빌더 함수로 전달합니다.
이 과정은 스키매틱 라이브러리와 동일합니다.

이전 섹션에서 만든 예제에서 `JsonObject` 타입 `options` 객체에는 프로퍼티가 2개 존재합니다.
`command`는 문자열이며 `args`는 문자열 배열입니다.

이 내용은 다음과 같은 스키마로 정의할 수 있습니다.

<code-example language="json" header="command/schema.json">
{
  "$schema": "http://json-schema.org/schema",
  "type": "object",
  "properties": {
    "command": {
      "type": "string"
    },
    "args": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  }
}

</code-example>

<div class="alert is-helpful">

<!--
This is a very simple example, but the use of a schema for validation can be very powerful.
For more information, see the [JSON schemas website](http://json-schema.org/).
-->
이 문서에서는 간단하게만 다뤘지만 유효성 검사 스키마는 얼마든지 자유롭게 확장할 수 있습니다.
자세한 내용은 [JSON 스키마 웹사이트](http://json-schema.org/)를 참고하세요.

</div>

<!--
To link our builder implementation with its schema and name, we need to create a *builder definition* file, which we can point to in `package.json`.

Create a file named `builders.json` file that looks like this.
-->
그리고 빌더와 스키마를 연결하려면 *빌더 정의(builder definition)* 파일을 만들고 이 파일을 `package.json` 파일에 추가해야 합니다.

`builders.json` 파일을 만들고 이 파일의 내용을 다음과 같이 작성해 봅시다.

<code-example language="json" header="builders.json">

{
  "builders": {
    "command": {
      "implementation": "./command",
      "schema": "./command/schema.json",
      "description": "Runs any command line in the operating system."
    }
  }
}

</code-example>

<!--
In the `package.json` file, add a `builders` key that tells the Architect tool where to find our builder definition file.
-->
그리고 `package.json` 파일에 `builders` 키를 추가하고 빌더 정의 파일을 지정합니다.

<code-example language="json" header="package.json">

{
  "name": "@example/command-runner",
  "version": "1.0.0",
  "description": "Builder for Command Runner",
  "builders": "builders.json",
  "devDependencies": {
    "@angular-devkit/architect": "^1.0.0"
  }
}

</code-example>

<!--
The official name of our builder is now ` @example/command-runner:command`.
The first part of this is the package name (resolved using node resolution), and the second part is the builder name (resolved using the `builders.json` file).

Using one of our `options` is very straightforward, we did this in the previous section when we accessed `options.command`.
-->
이제 우리가 만든 빌더의 이름은 `@example/command-runner:command`입니다.
이 이름은 패키지 이름과 `builders.json` 파일에서 지정한 빌더의 이름으로 구성됩니다.

`options` 객체는 아주 직관적인 방법으로 프로퍼티를 참조할 수 있습니다.
이전 섹션에서 했던 것처럼 `options.command`라고 참조하면 됩니다.

<!--
<code-example 
  path="cli-builder/src/my-builder.ts" 
  header="src/my-builder.ts (report status)" 
  region="report-status">
</code-example>
-->
<code-example 
  path="cli-builder/src/my-builder.ts" 
  header="src/my-builder.ts (reportStatus())" 
  region="report-status">
</code-example>


<!--
### Target configuration
-->
### 빌드 방법 환경설정

<!--
A builder must have a defined target that associates it with a specific input configuration and [project](guide/glossary#project).

Targets are defined in the `angular.json` [CLI configuration file](guide/workspace-config).
A target specifies the builder to use, its default options configuration, and named alternative configurations.
The Architect tool uses the target definition to resolve input options for a given run.

The  `angular.json` file has a section for each project, and the "architect" section of each project configures targets for builders used by CLI commands such as 'build', 'test', and 'lint'.
By default, for example, the `build` command runs the builder  `@angular-devkit/build-angular:browser` to perform the build task, and passes in default option values as specified for the `build` target in   `angular.json`.
-->
빌더를 사용하려면 [프로젝트](guide/glossary#project)를 빌드할 방법(target)과 입력값을 명확하게 지정해야 합니다.

빌드할 방법은 [CLI 환경설정 파일](guide/workspace-config) `angular.json`에 작성하는데, 이 파일에는 빌드할 방법의 이름과 기본 옵션, 기본 옵션을 대체하는 옵션값을 지정합니다.
그러면 아키텍트 툴이 해당 환경설정을 바탕으로 빌더에 사용할 입력값을 연결합니다.

`angular.json` 파일은 프로젝트 단위로 구성합니다.
그리고 프로젝트의 "architect" 섹션은 'build', 'test', 'lint'와 같이 빌더로 빌드하는 단위로 구성합니다.
기본으로 사용하는 `build`는 `@angular-devkit/build-angular:browser` 빌더로 앱을 빌드할 때 사용합니다.
작업이 실행될 때 사용할 기본 옵션은 `angular.json` 파일의 `build` 섹션에 다음과 같이 구성합니다.

<code-example language="json" header="angular.json">
{
  "myApp": {
    ...
    "architect": {
      "build": {
        "builder": "@angular-devkit/build-angular:browser",
        "options": {
          "outputPath": "dist/myApp",
          "index": "src/index.html",
          ...
        },
        "configurations": {
          "production": {
            "fileReplacements": [
              {
                "replace": "src/environments/environment.ts",
                "with": "src/environments/environment.prod.ts"
              }
            ],
            "optimization": true,
            "outputHashing": "all",
            ...
          }
        }
      },
      ...

</code-example>

<!--
The command passes the builder the set of default options specified in the "options" section.
If you pass the `--configuration=production` flag, it uses the override values specified in the `production` alternative configuration.
You can specify further option overrides individually on the command line.
You might also add more alternative configurations to the `build` target, to define other environments such as `stage` or `qa`.
-->
빌더가 실행될 때 사용될 옵션의 기본값은 "options" 섹션에서 지정합니다.
그리고 빌더를 실행하면서 `--configuration=production` 옵션을 지정하면 `production`으로 지정된 대체 환경이 기본값을 오버라이드하면서 실행됩니다.
물론 커맨드라인에서 특정 값을 직접 오버라이드할 수도 있습니다.
빌드 대상 `build` 에는 개발 환경이나 상황에 따라 `stage`나 `qa` 환경설정을 추가할 수도 있습니다.


<!--
#### Target strings
-->
#### 빌드 방법을 지정하는 문자열

<!--
The generic `ng run` CLI command takes as its first argument a target string of the form *project:target[:configuration]*.

* *project*: The name of the Angular CLI project that the target is associated with.

* *target*: A named builder configuration from the `architect` section of the `angular.json` file.

* *configuration*: (optional) The name of a specific configuration override for the given target, as defined in the `angular.json` file.

If your builder calls another builder, it may need to read a passed target string.
You can parse this string into an object by using the `targetFromTargetString()` utility function from `@angular-devkit/architect`.
-->
`ng run`을 실행할 때는 첫번째 인자로 빌드 대상을 받는데, 이 때 사용하는 형식은 *project:target[:configuration]*입니다.

* *project*: 빌드할 Angular CLI 프로젝트 이름을 지정합니다.

* *target*: 빌드 방법을 지정합니다. `angular.json` 파일의 `architect` 섹션에 작성합니다.

* *configuration*: (생략 가능) 특정 환경으로 빌드할 때 사용합니다. `angular.json` 파일에 작성하면 기본 옵션값을 오버라이드합니다.


어떤 빌더가 또다른 빌더를 실행하는 구조라면 처음 빌더가 실행했을 때 받은 빌드 방법을 전달해야 합니다.
이 때 `@angular-devkit/architect` 패키지에서 제공하는 `targetFromTargetString()` 유틸리티 함수를 사용하면 빌드 대상 문자열을 객체 형태로 파싱할 수 있습니다.


<!--
## Schedule and run
-->
## 스케쥴

<!--
Architect runs builders asynchronously.
To invoke a builder, you schedule a task to be run when all configuration resolution is complete.

The builder function is not executed until the scheduler returns a `BuilderRun` control object.
The CLI typically schedules tasks by calling the `BuilderContext.scheduleTarget()` function, and then resolves input options using the target definition in the `angular.json` file.

Architect resolves input options for a given target by taking the default options object, then overwriting values from the configuration used (if any), then further overwriting values from the overrides object passed to `BuilderContext.scheduleTarget()`.
For the Angular CLI, the overrides object is built from command line arguments.

Architect validates the resulting options values against the schema of the builder.
If inputs are valid, Architect creates the context and executes the builder.

For more information see [Workspace Configuration](guide/workspace-config).
-->
아키텍트는 비동기로 빌더를 실행합니다.
그리고 빌더를 실행하려면 모든 환경설정이 지정된 이후에 작업을 시작하도록 스케쥴을 잡아야 합니다.

빌더 함수는 스케쥴러가 `BuilderRun` 객체를 반환하기 전까지는 실행되지 않습니다.
그리고 Angular CLI가 `BuilderContext.scheduleTarget()` 함수를 실행해서 작업 스케쥴을 잡으면 `angular.json` 파일에 정의된 환경설정을 로드합니다.

아키텍트 툴이 기본 옵션값을 모두 읽고 나면 특정 환경(`--configuration`)이 지정되었을 때 해당 환경에 맞게 옵션값을 오버라이드 합니다.
그리고 `BuilderContext.scheduleTarget()`으로 전달받은 값으로 다시 오버라이드 합니다.
Angular CLI를 사용하면서 옵션값을 지정하면 오버라이드 객체에 해당 옵션값도 반영됩니다.

아키텍트 툴은 빌더 스키마를 기준으로 옵션값의 유효성을 검사합니다.
그리고 옵션값이 유효하면 아키텍트 툴이 컨텍스트를 생성하면서 빌더를 실행합니다.

더 자세한 내용은 [워크스페이스 환경설정](guide/workspace-config) 문서를 참고하세요.


<div class="alert is-helpful">

   <!--
   You can also invoke a builder directly from another builder or test by calling `BuilderContext.scheduleBuilder()`.
   You pass an `options` object directly to the method, and those option values are validated against the schema of the builder without further adjustment.

   Only the  `BuilderContext.scheduleTarget()` method resolves the configuration and overrides through the `angular.json` file.
   -->
   빌더는 다른 빌더가 실행할 수도 있고 `BuilderContext.scheduleBuilder()` 메소드로도 실행할 수 있습니다.
   그런데 이 메소드 인자로 `options` 객체를 직접 지정하면 해당 옵션값도 빌더 스키마를 기준으로 유효성을 검사하며, 이 옵션값은 더이상 변경되지 않습니다.

   `angular.json` 파일에서 읽어온 옵션값을 활용하는 것은 `BuilderContext.scheduleTarget()` 메소드뿐입니다.


</div>

<!--
### Default architect configuration
-->
### 아키텍트 기본 옵션

<!--
Let’s create a simple `angular.json` file that puts target configurations into context.

We can publish the builder to npm (see [Publishing your Library](guide/creating-libraries#publishing-your-library)), and install it using the following command:
-->
`angular.json` 파일을 간단하게 만들어 봅시다.

[라이브러리 배포하기](guide/creating-libraries#publishing-your-library) 문서에서 다룬 것처럼, npm 저장소에 배포한 빌더는 다음과 같은 명령을 실행해서 설치할 수 있습니다:

<code-example language="sh">

npm install @example/command-runner

</code-example>

<!--
If we create a new project with `ng new builder-test`, the generated `angular.json` file looks something like this, with only default builder configurations.
-->
그리고 `ng new builder-test` 명령을 실행해서 새 프로젝트를 만들면 다음과 같은 내용으로 `angular.json` 파일이 생성됩니다.
이 파일에 지정된 옵션값이 아키텍트 툴이 사용하는 기본 옵션값입니다.

<!--
<code-example language="json" header="angular.json">

{
  // ...
  "projects": {
    // ...
    "builder-test": {
      // ...
      "architect": {
        // ...
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            // ... more options...
            "outputPath": "dist/builder-test",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": "src/polyfills.ts",
            "tsConfig": "src/tsconfig.app.json"
          },
          "configurations": {
            "production": {
              // ... more options...
              "optimization": true,
              "aot": true,
              "buildOptimizer": true
            }
          }
        }
      }
    }
  }
  // ...
}

</code-example>
-->
<code-example language="json" header="angular.json">

{
  // ...
  "projects": {
    // ...
    "builder-test": {
      // ...
      "architect": {
        // ...
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            // ... (생략) ...
            "outputPath": "dist/builder-test",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": "src/polyfills.ts",
            "tsConfig": "src/tsconfig.app.json"
          },
          "configurations": {
            "production": {
              // ... (생략) ...
              "optimization": true,
              "aot": true,
              "buildOptimizer": true
            }
          }
        }
      }
    }
  }
  // ...
}

</code-example>


<!--
### Adding a target
-->
### 빌드 방법 추가하기

<!--
Let's add a new target that will run our builder to execute a particular command.
This target will tell the builder to run `touch` on a file, in order to update its modified date.

We need to update the `angular.json` file to add a target for this builder to the "architect" section of our new project.

* We'll add a new target section to the "architect" object for our project.

* The target named "touch" uses our builder, which we published to `@example/command-runner`. (See [Publishing your Library](guide/creating-libraries#publishing-your-library))

* The options object provides default values for the two inputs that we defined; `command`, which is the Unix command to execute, and `args`, an array that contains the file to operate on.

* The configurations key is optional, we'll leave it out for now.
-->
새로운 빌드 방법을 추가해 봅시다.
이 섹션에서는 파일 수정시각을 갱신하는 `touch` 빌드 방법을 추가해 봅니다.

빌드 방법을 추가하려면 `angular.json` 파일을 수정해야 합니다.
프로젝트 "architect" 섹션에 원하는 빌드 방법을 추가해 봅시다.

* 새로운 빌드 방법은 "architect" 객체에 추가합니다.

* "touch" 빌드 방법은 이전에 배포한 `@example/command-runner`를 실행합니다. 이 빌더에 대해 알아보려면 [라이브러리 배포하기](guide/creating-libraries#publishing-your-library) 문서를 참고하세요.

* 이 빌드 방법을 실행할 때 사용할 기본값을 2개 지정합니다. 하나는 실제로 동작하면서 실행할 Unix 커맨드를 `command`로 지정하며, 다른 하나는 작업할 파일 목록을 `args` 필드로 지정했습니다.

* `configurations` 키는 생략할 수 있습니다. 지금은 작성하지 않겠습니다.


<code-example language="json" header="angular.json">

{
  "projects": {
    "builder-test": {
      "architect": {
        "touch": {
          "builder": "@example/command-runner:command",
          "options": {
            "command": "touch",
            "args": [
              "src/main.ts"
            ]
          }
        },
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "outputPath": "dist/builder-test",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": "src/polyfills.ts",
            "tsConfig": "src/tsconfig.app.json"
          },
          "configurations": {
            "production": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ],
              "optimization": true,
              "aot": true,
              "buildOptimizer": true
            }
          }
        }
      }
    }
  }
}

</code-example>

<!--
### Running the builder
-->
### 빌더 실행하기

<!--
To run our builder with the new target's default configuration, use the following CLI command in a Linux shell.

<code-example language="sh">

   ng run builder-test:touch

</code-example>

This will run the `touch` command on the `src/main.ts` file.

You can use command-line arguments to override the configured defaults.
For example, to run with a different `command` value, use the following CLI command.

<code-example language="sh">

ng run builder-test:touch --command=ls

</code-example>

This will call the `ls` command instead of the `touch` command.
Because we did not override the *args* option, it will list information about the `src/main.ts` file (the default value provided for the target).
-->
이렇게 만든 빌드 방법을 실행하려면 Linux 셸에서 다음 명령을 실행하면 됩니다.

<code-example language="sh">

   ng run builder-test:touch

</code-example>

그러면 `src/main.ts` 파일을 대상으로 `touch` 커맨드가 실행됩니다.

기본 옵션값을 오버라이드하려면 커맨드라인에서 인자를 추가하면 됩니다.
그래서 `command` 옵션을 변경하려면 다음과 같이 실행하면 됩니다.

<code-example language="sh">

ng run builder-test:touch --command=ls

</code-example>

이렇게 실행하면 `touch` 대신 `ls` 커맨드가 실행됩니다.
이 때 `args` 옵션은 오버라이드하지 않았기 때문에 `src/main.ts` 파일에 대한 정보가 화면에 표시됩니다.


<!--
## Testing a builder
-->
## 빌더 테스트하기

<!--
Use integration testing for your builder, so that you can use the Architect scheduler to create a context, as in this [example](https://github.com/mgechev/cli-builders-demo).

* In the builder source directory, we have created a new test file `my-builder.spec.ts`. The code creates new instances of `JsonSchemaRegistry` (for schema validation), `TestingArchitectHost` (an in-memory implementation of `ArchitectHost`), and `Architect`.

* We've added a `builders.json` file next to the builder's [`package.json` file](https://github.com/mgechev/cli-builders-demo/blob/master/command-builder/builders.json), and modified the package file to point to it.

Here’s an example of a test that runs the command builder.
The test uses the builder to run the `node --print 'foo'` command, then validates that the `logger` contains an entry for `foo`.
-->
통합 테스트는 빌더를 대상으로 실행할 수 있습니다.
이 때 컨텍스트를 생성하기 위해 아키텍트 스케쥴러를 사용해야 하는데 자세한 내용은 아래 설명과 [예제](https://github.com/mgechev/cli-builders-demo) 코드를 함께 참고하세요.

* 빌더를 정의한 폴더에 `my-builder.spec.ts` 테스트 파일을 생성합니다. 이 코드에서는 스키마 유효성을 검사할 때 사용하는 `JsonSchemaRegistry` 인스턴스와 `ArchitectHost`를 메모리에 생성하는 `TestingArchitectHost` 인스턴스, `Architect` 인스턴스를 활용합니다.

* 이전 예제에서 빌더의 [`package.json` 파일](https://github.com/mgechev/cli-builders-demo/blob/master/command-builder/builders.json)과 같은 위치에 `builders.json` 파일을 생성했습니다.

이제 빌더 실행 커맨드를 테스트해봅시다.
이 테스트 코드는 `node --print 'foo'` 명령으로 빌더를 실행하면서 `logger` 안에 `foo` 값이 제대로 들어있는지 확인하는 코드입니다.


<code-example 
  path="cli-builder/src/my-builder.spec.ts" 
  header="src/my-builder.spec.ts">
</code-example>

<div class="alert is-helpful">

   <!--
   When running this test in your repo, you need the [`ts-node`](https://github.com/TypeStrong/ts-node) package. You can avoid this by renaming `my-builder.spec.ts` to `my-builder.spec.js`.
   -->
   이 테스트를 실행하려면 [`ts-node`](https://github.com/TypeStrong/ts-node) 패키지를 설치해야 합니다.
   하지만 `my-builder.spec.ts` 파일의 이름을 `my-builder.spec.js`로 바꾸면 해당 패키지를 설치하지 않아도 됩니다.

</div>

<!--
### Watch mode
-->
### 워치(watch) 모드

<!--
Architect expects builders to run once (by default) and return.
This behavior is not entirely compatible with a builder that watches for changes (like Webpack, for example).
Architect can support watch mode, but there are some things to look out for.

* To be used with watch mode, a builder handler function should return an Observable. Architect subscribes to the Observable until it completes and might reuse it if the builder is scheduled again with the same arguments.

* The builder should always emit a `BuilderOutput` object after each execution. Once it’s been executed, it can enter a watch mode, to be triggered by an external event. If an event triggers it to restart, the builder should execute the `BuilderContext.reportRunning()` function to tell Architect that it is running again. This prevents Architect from stopping the builder if another run is scheduled.

When your builder calls `BuilderRun.stop()` to exit watch mode, Architect unsubscribes from the builder’s Observable and calls the builder’s teardown logic to clean up.
(This behavior also allows for long running builds to be stopped and cleaned up.)

In general, if your builder is watching an external event, you should separate your run into three phases.

1. **Running**
   For example, webpack compiles. This ends when webpack finishes and your builder emits a `BuilderOutput` object.

1. **Watching**
   Between two runs, watch an external event stream. For example, webpack watches the file system for any changes. This ends when webpack restarts building, and `BuilderContext.reportRunning()` is called. This goes back to step 1.

1. **Completion**
   Either the task is fully completed (for example, webpack was supposed to run a number of times), or the builder run was stopped (using `BuilderRun.stop()`). Your teardown logic is executed, and Architect unsubscribes from your builder’s Observable.
-->
빌더는 보통 한번만 실행되고 값을 반환합니다.
하지만 이런 방식은 Webpack과 같이 워치 모드로 동작하는 빌더와 맞지 않습니다.
워치 모드로 빌더를 실행하려면 아키텍트도 워치모드로 동작해야 합니다.
다음 내용으로 빌더를 실행할 수 있는지 검토해 보세요.

* 워치모드로 동작하려면 빌더의 핸들러 함수도 옵저버블을 반환해야 합니다.
아키텍트는 이 옵저버블이 종료될 때까지 구독해야 하며, 빌더 스케쥴이 다시 시작되면 처음 실행했을 때와 같은 인자로 다시 구독해야 합니다.

* 빌더가 실행될 때마다 `BuilderOutput` 객체를 발행해야 합니다.
그리고 빌더는 한 번 실행되어야 워치모드로 진입할 수 있으며, 그 이후에는 외부 이벤트에 반응해서 다시 실행될 수 있습니다.
이 때 빌더가 다시 실행되었다는 것을 아키텍트에게 알리기 위해 `BuilderContext.reportRunning()` 함수를 실행해야 합니다.
이 함수를 실행하지 않으면 다른 스케쥴이 실행될 때 빌더를 중단시킵니다.

빌더가 `BuilderRun.stop()`을 실행해서 워치모드를 종료하면 아키텍트가 빌더 옵저버블 구독을 해제하면서 빌더의 종료 로직을 실행합니다.
빌더가 실행하기 전에 준비했던 것들은 종료 로직으로 정리할 수 있습니다.

일반적으로 빌더가 워치모드로 동작하면서 외부 이벤트에 반응한다면 이 실행과정을 3단계로 구분해야 합니다.

1. **실행(running)**
   웹팩 컴파일 과정이 이 단계에 해당됩니다. 이 과정은 웹팩 컴파일이 끝나고 빌더가 `BuilderOutput` 객체를 발행할 때 종료됩니다.

1. **워칭(watching)**
   실행 단계 사이마다 외부 이벤트를 기다리는 단계입니다. 웹팩이 파일 시스템 변경을 감지하는 단계가 이 단계에 해당되며, 웹팩 빌드가 다시 시작되고 `BuilderContext.reportRunning()`이 실행될 때 종료됩니다. 이 단계가 종료되면 실행단계로 다시 돌아갑니다.

1. **종료(completion)**
   웹팩 실행횟수가 다 되었거나 빌더에서 `BuilderRun.stop()`을 실행해서 작업이 완전히 종료된 단계입니다. 빌더의 정리 로직이 실행되며 아키텍트가 빌더 옵저버블을 구독해제합니다.


<!--
## Summary
-->
## 정리

<!--
The CLI Builder API provides a new way of changing the behavior of the Angular CLI by using builders to execute custom logic.

* Builders can be synchronous or asynchronous, execute once or watch for external events, and can schedule other builders or targets.

* Builders have option defaults specified in the `angular.json` configuration file, which can be overwritten by an alternate configuration for the target, and further overwritten by command line flags.

* We recommend that you use integration tests to test Architect builders. You can use unit tests to validate the logic that the builder executes.

* If your builder returns an Observable, it should clean up in the teardown logic of that Observable.
-->
Angular CLI 빌더 API를 활용하면 Angular CLI의 빌더 활용방식을 변경할 수 있습니다.

* 빌더는 동기/비동기로 동작할 수 있으며 한 번만 실행되거나 워치모드로 여러번 실행될 수도 있습니다. 다른 빌더에 의해 실행될 수도 있습니다.

* 빌더가 실행될 때 사용되는 옵션의 기본값은 환경설정파일 `angular.json`에 지정합니다. 이 옵션값은 빌드 방법이 다르거나 커맨드라인에서 직접 지정한 경우 오버라이드됩니다.

* 빌더가 제대로 동작하는지 통합테스트로 확인해보는 것을 권장합니다. 유닛테스트도 물론 가능합니다.

* 빌더가 옵저버블을 반환하는 형태라면 이 옵저버블을 정리하는 로직도 필요합니다.