<!--
# Authoring schematics
-->
# 스키매틱 만들기

<!--
You can create your own schematics to operate on Angular projects.
Library developers typically package schematics with their libraries in order to integrate them with the Angular CLI.
You can also create stand-alone schematics to manipulate the files and constructs in Angular applications as a way of customizing them for your development environment and making them conform to your standards and constraints.
Schematics can be chained, running other schematics to perform complex operations.

Manipulating the code in an application has the potential to be both very powerful and correspondingly dangerous.
For example, creating a file that already exists would be an error, and if it was applied immediately, it would discard all the other changes applied so far.
The Angular Schematics tooling guards against side effects and errors by creating a virtual file system.
A schematic describes a pipeline of transformations that can be applied to the virtual file system.
When a schematic runs, the transformations are recorded in memory, and only applied in the real file system once they're confirmed to be valid.
-->
Angular 프로젝트에 커스텀 스키매틱을 정의해서 활용할 수 있습니다.
스키매틱은 보통 라이브러리 형태로 제공되어 Angular CLI의 기능을 확장하는 용도로 사용하는 것이 일반적이지만, Angular 애플리케이션에 직접 스키매틱을 구성하는 방식도 가능합니다.
이 방식을 사용하면 코딩 스타일과 패턴을 일관되게 유지하는 데에도 도움이 됩니다.
그리고 스키매틱이 다른 스키매틱을 실행할 수 있기 때문에 복잡한 작업을 처리할 때도 더 편하게 활용할 수 있습니다.

스키매틱이 애플리케이션 코드를 직접 수정한다는 것은 아주 강력한 기능이기도 하지만, 아주 위험한 기능이기도 합니다.
이미 존재하고 있는 파일을 다시 생성하려고 하면 에러가 발생하지만, 이 에러가 발생하기 전에 수정했던 파일의 내용을 다시 돌려놓을 수 없다면 큰 문제가 될 것입니다.
그래서 Angular 스키매틱은 이 과정을 가상 파일 시스템에서 먼저 처리한 후에 문제가 없을 때만 반영하는 방식을 채택했습니다.
이 관점으로 생각해보면 스키매틱은 가상 파일 시스템에서 무언가를 변환하는 파이프 역할을 한다고 볼 수 있습니다.
스키매틱이 변환한 내용은 메모리에서 처리되었다가 모든 변환 작업이 오류없이 실행되었을 때 실제 파일 시스템에 반영됩니다.


<!--
## Schematics concepts
-->
## 스키매틱의 컨셉

<!--
The public API for schematics defines classes that represent the basic concepts.

* The virtual file system is represented by a `Tree`.   The `Tree` data structure contains a *base* (a set of files that already exists) and a *staging area* (a list of changes to be applied to the base).
When making modifications, you don't actually change the base, but add those modifications to the staging area.

* A `Rule` object defines a function that takes a `Tree`, applies transformations, and returns a new `Tree`. The main file for a schematic, `index.ts`, defines a set of rules that implement the schematic's logic.

* A transformation is represented by an `Action`. There are four action types: `Create`, `Rename`, `Overwrite`, and `Delete`.

* Each schematic runs in a context, represented by a `SchematicContext` object.

The context object passed into a rule provides access to utility functions and metadata that the schematic may need to work with, including a logging API to help with debugging.
The context also defines a *merge strategy* that determines how changes are merged from the staged tree into the base tree. A change can be accepted or ignored, or throw an exception.
-->
스키매틱의 퍼블릭 API는 아래와 같은 컨셉을 클래스로 정의한 것입니다.

* 가상 파일 시스템은 `Tree`로 표현합니다. 이 `Tree` 데이터 구조에는 지금 프로젝트에 있는 파일을 의미하는 *베이스(base)*가 있고, 수정된 내용을 모아두는 *스테이징 영역(staging area)*이 있습니다.
스키매틱이 실행될 때 수정하는 것은 베이스가 아닙니다.
수정사항은 스테이징 영역에 누적됩니다.

* `Rule` 객체는 `Tree` 인자를 받아서 변환작업을 수행하고 다시 `Tree`를 반환하는 함수입니다.
이 문서에서는 `Rule` 객체를 `index.ts` 파일에 정의하는데, 이 객체가 스키매틱 로직의 핵심입니다.

* 변환작업은 `Action`이라고 합니다.
액션 타입은 `Create`, `Rename`, `Overwrite`, `Delete` 이렇게 4종류입니다.

* 스키매틱이 실행되는 컨텍스트는 `SchematicContext` 객체로 표현합니다.

룰은 인자로 컨텍스트 객체를 인자로 받기 때문에 컨텍스트 객체를 활요하면 디버깅용 로그 API 등 스키매틱에 필요한 유틸리티 함수나 메타데이터를 참조할 수 있습니다.
컨텍스트에는 *머지 정책(merge strategy)*도 정의되어 있습니다.
이 정책은 스테이징 트리에서 베이스 트리로 수정사항을 반영할 때 어떤 정책을 따를지 지정하는 것입니다.
스키매틱은 변경사항을 베이스 트리에 반영할 수 있지만, 무시할 수도 있고, 에러를 발생시킬 수도 있습니다.


<!--
### Defining rules and actions
-->
### 룰, 액션 정의하기

<!--
When you create a new blank schematic with the [Schematics CLI](#cli), the generated entry function is a *rule factory*.
A `RuleFactory` object defines a higher-order function that creates a `Rule`.

<code-example language="TypeScript" header="index.ts">
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

// You don't have to export the function as default.
// You can also have more than one rule factory per file.
export function helloWorld(_options: any): Rule {
 return (tree: Tree, _context: SchematicContext) => {
   return tree;
 };
}
</code-example>

Your rules can make changes to your projects by calling external tools and implementing logic.
You need a rule, for example, to define how a template in the schematic is to be merged into the hosting project.

Rules can make use of utilities provided with the `@schematics/angular` package. Look for helper functions for working with modules, dependencies, TypeScript, AST, JSON, Angular CLI workspaces and projects, and more.

<code-example language="TypeScript" header="index.ts">

import {
  JsonAstObject,
  JsonObject,
  JsonValue,
  Path,
  normalize,
  parseJsonAst,
  strings,
} from '&#64;angular-devkit/core';

</code-example>
-->
[스키매틱 CLI](#cli)로 스키매틱을 새로 만들 때 이 스키매틱의 진입 점은 *룰 팩토리* 입니다.
`RuleFactory` 객체는 말 그대로 `Rule`을 반환하는 상위 함수입니다.

<code-example language="TypeScript" header="index.ts">
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

// 이 함수를 export로 지정하지 않아도 됩니다.
// 그리고 파일 하나에 룰 팩토리를 여러개 정의해도 됩니다.
export function helloWorld(_options: any): Rule {
 return (tree: Tree, _context: SchematicContext) => {
   return tree;
 };
}
</code-example>

룰은 자체 로직이나 외부 툴을 사용해서 프로젝트를 수정할 수 있습니다.
결국 스키매틱이 프로젝트에 어떻게 반영될지 정의하는 것은 룰이기 때문에 룰을 잘 정의하는 것이 중요합니다.

룰은 `@schematics/angular` 패키지처럼 유틸리티로 활용될 수도 있습니다.
모듈, 의존성 패키지, TypeScript, AST(Abstract Syntax Tree), JSON, Angular CLI 워크스페이스, 프로젝트 등에 다양하게 활용할 수 있는 헬퍼 함수에 대해서도 확인해 보세요.

<code-example language="TypeScript" header="index.ts">

import {
  JsonAstObject,
  JsonObject,
  JsonValue,
  Path,
  normalize,
  parseJsonAst,
  strings,
} from '&#64;angular-devkit/core';

</code-example>


<!--
### Defining input options with a schema and interfaces
-->
### 스키마, 인터페이스로 입력값 정의하기

<!--
Rules can collect option values from the caller and inject them into templates.
The options available to your rules, with their allowed values and defaults, are defined in the schematic's JSON schema file, `<schematic>/schema.json`.
You can define variable or enumerated data types for the schema using TypeScript interfaces.

The schema defines the types and default values of variables used in the schematic.
For example, the hypothetical "Hello World" schematic might have the following schema.
-->
룰은 실행하는 시점이나 템플릿에서 활용될 때 입력값을 추가로 받을 수 있습니다.
이 때 사용하는 입력값의 종류, 기본값, 사용할 수 있는 값은 스키매틱의 JSON 스키마 파일인 `<스키매틱>/schema.json` 파일에 정의합니다.
그리고 TypeScript 인터페이스를 사용해서 이 스키마에 사용할 수 있는 enum 데이터 타입을 더 지정할 수도 있습니다.

아래 스키마 파일은 "Hello World" 스키매틱에 사용되는 값의 종류와 기본값을 정의하는 파일입니다.

<code-example language="json" header="src/hello-world/schema.json">

{
    "properties": {
        "name": {
            "type": "string",
            "minLength": 1,
            "default": "world"
        },
        "useColor": {
            "type": "boolean"
        }
    }
}
</code-example>


<!--
You can see examples of schema files for the Angular CLI command schematics in [`@schematics/angular`](https://github.com/angular/angular-cli/blob/7.0.x/packages/schematics/angular/application/schema.json).
-->
스키마 파일에 대해 더 알아보려면 Angular CLI 명령 스키마가 정의되어 있는 [`@schematics/angular` 파일](https://github.com/angular/angular-cli/blob/7.0.x/packages/schematics/angular/application/schema.json)을 확인해보는 것도 좋습니다.


<!--
### Schematic prompts
-->
### 스키매틱 프롬프트

<!--
Schematic *prompts* introduce user interaction into schematic execution.
You can configure schematic options to display a customizable question to the user.
The prompts are displayed before the execution of the schematic, which then uses the response as the value for the option.
This allows users to direct the operation of the schematic without requiring in-depth knowledge of the full spectrum of available options.

The "Hello World" schematic might, for example, ask the user for their name, and display that name in place of the default name "world". To define such a prompt, add an `x-prompt` property to the schema for the `name` variable.

Similarly, you can add a prompt to allow the user to decide whether the schematic will use color when executing its hello action. The schema with both prompts would be as follows.
-->
스키매틱에 *프롬프트(prompt)*를 추가하면 스키매틱을 실행하면서 사용자와 직접 상호작용하면서 스키매틱 설정값을 사용자에게 받을 수도 있습니다.
프롬프트는 보통 스키매틱 로직을 실행하기 전에 입력값에 대한 정보를 제공하는 용도로 사용합니다.
물론 사용자가 스키매틱 사용법에 익숙하다면 이 과정 없이 스키매틱을 바로 실행할 수도 있습니다.

위에서 살펴본 "Hellow World" 스키매틱을 조금 수정해 봅시다.
아래 코드처럼 정의한 스키매틱은 사용자의 이름을 물어보는데 기본값은 "world"로 미리 정해두었습니다.
그리고 `x-prompt` 프로퍼티를 사용해서 `name`에 해당하는 값을 프롬프트로 입력받습니다.

이 방식과 비슷하게 액션에 사용할 색상을 입력받는 것도 물론 가능합니다.
스키마에는 프롬프트를 여러개 정의할 수 있습니다.


<code-example language="json" header="src/hello-world/schema.json">

{
    "properties": {
        "name": {
            "type": "string",
            "minLength": 1,
            "default": "world",
            "x-prompt": "What is your name?"
        },
        "useColor": {
            "type": "boolean",
            "x-prompt": "Would you like the response in color?"
        }
    }
}
</code-example>


<!--
#### Prompt short-form syntax
-->
#### 간단한(short-form) 문법

<!--
These examples use a shorthand form of the prompt syntax, supplying only the text of the question.
In most cases, this is all that is required.
Notice however, that the two prompts expect different types of input.
When using the shorthand form, the most appropriate type is automatically selected based on the property's schema.
In the example, the `name` prompt uses the `input` type because it it is a string property.
The `useColor` prompt uses a `confirmation` type because it is a Boolean property.
In this case, "yes" corresponds to `true` and "no" corresponds to `false`.

There are three supported input types.

| Input type | Description |
| :----------- | :-------------------|
| confirmation | A yes or no question; ideal for Boolean options. |
| input | Textual input; ideal for string or number options. |
| list | A predefined set of allowed values. |

In the short form, the type is inferred from the property's type and constraints.

| Property Schema |	Prompt Type |
| :--------------- | :------------- |
| "type": "boolean" |	confirmation ("yes"=`true`, "no"=`false`) |
| "type": "string"  |	input |
| "type": "number"  |	input (only valid numbers accepted) |
| "type": "integer" |	input (only valid numbers accepted) |
| "enum": [...]   	| list 	(enum members become list selections) |

In the following example, the property takes an enumerated value, so the schematic automatically chooses the list type, and creates a menu from the possible values.
-->
지금까지는 질문에 대한 답을 간단하게 선택하는 방식으로 프롬프트를 구현해봤습니다.
대부분의 경우에 여기까지만 구현해도 충분합니다.
그런데 이 예제를 잘 보면 입력으로 받는 두 값이 서로 다른 타입인 것을 확인할 수 있습니다.
이 때 방금 다뤘던 예제처럼 간단한 문법을 사용하면 프로퍼티 스키마에 따라 적절한 타입이 자동으로 사용됩니다.
그래서 `name` 프롬프트는 문자열 프로퍼티를 받기 때문에 `input` 타입으로 동작하고, `useColor` 프롬프트는 불리언 프로퍼티를 받기 때문에 `confirmation` 타입으로 동작합니다.
`confirmation` 타입에서 "Yes"를 선택하면 `true`를 반환하고 "no"를 선택하면 `false`를 반환합니다.

입력 타입으로는 아래와 같이 3가지 종류를 사용할 수 있습니다.

| 입력 타입 | 설명 |
| :----------- | :-------------------|
| confirmation | 예/아니오 - 불리언 타입일 때 사용합니다. |
| input | 텍스트 입력 - 문자열이나 숫자 타입일 때 사용합니다. |
| list | 미리 정해진 목록에서 선택할 때 사용합니다. |

간단한 문법을 사용하면 프로퍼티 타입에 따라 다음과 같이 입력 타입이 추론되어 동작합니다.

| 프로퍼티 프키마 | 프롬프트 타입 Type |
| :--------------- | :------------- |
| "type": "boolean" | confirmation ("yes"=`true`, "no"=`false`) |
| "type": "string"  | input |
| "type": "number"  | input (형식에 맞을 때만 유효함) |
| "type": "integer" | input (형식에 맞을 때만 유효함) |
| "enum": [...]     | list  (enum으로 작성한 항목 중 선택) |

그래서 아래와 같이 `enum` 배열로 스키마를 정의하면 프롬프트를 실행할 때 `list` 타입으로 동작합니다.

<code-example language="json" header="schema.json">

    "style": {
      "description": "The file extension or preprocessor to use for style files.",
      "type": "string",
      "default": "css",
      "enum": [
        "css",
        "scss",
        "sass",
        "less",
        "styl"
      ],
      "x-prompt": "Which stylesheet format would you like to use?"
    }

</code-example>

<!--
The prompt runtime automatically validates the provided response against the constraints provided in the JSON schema.
If the value is not acceptable, the user is prompted for a new value.
This ensures that any values passed to the schematic meet the expectations of the schematic's implementation, so that you do not need to add additional checks within the schematic's code.
-->
프로퍼티에 값을 입력하면 JSON 스키마에 정의된 규칙에 따라 입력값이 유효한지 자동으로 검사하며, 입력값이 유효하지 않으면 새로운 값을 다시 받습니다.
그렇기 때문에 스키매틱이 받는 값은 이미 유효한 것으로 간주할 수 있습니다.
스키매틱 구현 로직에 유효성 검사 로직을 따로 구현할 필요가 없습니다.


<!--
#### Prompt long-form syntax
-->
#### 확장(long-form) 문법

<!--
The `x-prompt` field syntax supports a long form for cases where you require additional customization and control over the prompt.
In this form, the `x-prompt` field value is a JSON object with subfields that customize the behavior of the prompt.

| Field |	Data Value |
| :----------- | :------ |
| type    | `confirmation`, `input`, or `list` (selected automatically in short form) |
| message |	string (required) |
| items   |	string and/or label/value object pair (only valid with type `list`) |

The following example of the long form is from the JSON schema for the schematic that the CLI uses to [generate applications](https://github.com/angular/angular-cli/blob/ba8a6ea59983bb52a6f1e66d105c5a77517f062e/packages/schematics/angular/application/schema.json#L56).
It defines the prompt that allows users to choose which style preprocessor they want to use for the application being created.
By using the long form, the schematic can provide more explicit formatting of the menu choices.
-->
프롬프트로 값을 받을 때 커스터마이징을 더 하려면 확장 문법을 사용할 수 있습니다.
이 방식은 `x-prompt` 필드에 문자열 대신 JSON 객체를 사용해서 프롬프트의 세부 사항을 지정하는 방식입니다.

| 필드 | 데이터 값 |
| :----------- | :------ |
| type    | `confirmation`, `input`, `list` (간단한 문법에서는 자동으로 선택됨) |
| message | 문자열 (필수) |
| items   | 문자열, label/value 객체 (타입이 `list`인 경우만) |


<code-example language="json" header="package/schematics/angular/application/schema.json">

    "style": {
      "description": "The file extension or preprocessor to use for style files.",
      "type": "string",
      "default": "css",
      "enum": [
        "css",
        "scss",
        "sass",
        "less",
        "styl"
      ],
      "x-prompt": {
        "message": "Which stylesheet format would you like to use?",
        "type": "list",
        "items": [
          { "value": "css",  "label": "CSS" },
          { "value": "scss", "label": "SCSS   [ https://sass-lang.com/documentation/syntax#scss                ]" },
          { "value": "sass", "label": "Sass   [ https://sass-lang.com/documentation/syntax#the-indented-syntax ]" },
          { "value": "less", "label": "Less   [ http://lesscss.org                                             ]" },
          { "value": "styl", "label": "Stylus [ http://stylus-lang.com                                         ]" }
        ]
      },
    },
</code-example>

<!--
#### x-prompt schema
-->
#### x-prompt 스키마

<!--
The JSON schema that defines a schematic's options supports extensions to allow the declarative definition of prompts and their respective behavior.
No additional logic or changes are required to the code of a schematic to support the prompts.
The following JSON schema is a complete description of the long-form syntax for the `x-prompt` field.
-->
확장 문법으로 프롬프트를 정의하는 문법은 모두 JSON 스키마로 정의되어 있습니다.
그리고 스키매틱에 프롬프트를 자세하게 추가한다고 해도 스키매틱의 로직 자체를 수정할 필요는 없습니다.
아래 JSON 스키마는 `x-prompt` 필드에 사용할 수 있는 확장 문법을 정의한 것입니다.

<code-example language="json" header="x-prompt schema">

{
    "oneOf": [
        { "type": "string" },
        {
            "type": "object",
            "properties": {
                "type": { "type": "string" },
                "message": { "type": "string" },
                "items": {
                    "type": "array",
                    "items": {
                        "oneOf": [
                            { "type": "string" },
                            {
                                "type": "object",
                                "properties": {
                                    "label": { "type": "string" },
                                    "value": { }
                                },
                                "required": [ "value" ]
                            }
                        ]
                    }
                }
            },
            "required": [ "message" ]
        }
    ]
}

</code-example>


{@a cli}

<!--
## Schematics CLI
-->
## 스키매틱 CLI

<!--
Schematics come with their own command-line tool.
Using Node 6.9 or above, install the Schematics command line tool globally:
-->
스키매틱은 자체 커맨드라인 툴을 제공합니다.
그래서 Node 6.9 이상 버전에서 다음 명령을 실행하면 스키매틱 커맨드라인 툴을 전역에 설치할 수 있습니다:

<code-example language="bash">
npm install -g @angular-devkit/schematics-cli
</code-example>

<!--
This installs the `schematics` executable, which you can use to create a new schematics collection in its own project folder, add a new schematic to an existing collection, or extend an existing schematic.

In the following sections, we will create a new schematics collection using the CLI in order to introduce the files and file structure, and some of the basic concepts.

The most common use of schematics, however, is to integrate an Angular library with the Angular CLI.
You can do this by creating the schematic files directly within the library project in an Angular workspace, without using the Schematics CLI.
See [Schematics for Libraries](guide/schematics-for-libraries).
-->
그러면 `schematics` 실행파일이 설치됩니다.
이 파일을 사용하면 새로운 스키매틱 컬렉션을 생성할 수 있고, 이미 존재하는 컬렉션에 새 스키매틱을 추가할 수 있으며, 스키매틱 자체를 확장할 수도 있습니다.

이제부터는 스키매틱 CLI를 사용해서 새로운 스키매틱 컬렉션을 생성하는 방법에 대해 알아봅시다.
그리고 이렇게 만든 컬렉션이 어떻게 구성되는지, 기본 컨셉에 대해서도 알아봅시다.

스키매틱은 보통 Angular 라이브러리를 Angular CLI와 통합하는 용도로 사용합니다.
그래서 Angular 워크스페이스에 있는 라이브러리 프로젝트에 스키매틱 파일을 생성할 때 스키매틱 CLI를 사용하는 것이 좋습니다.
자세한 내용은 [라이브러리용 스키매틱](guide/schematics-for-libraries) 문서를 참고하세요.


<!--
### Creating a schematics collection
-->
### 스키매틱 컬렉션 생성하기

<!--
The following command creates a new schematic named `hello-world` in a new project folder of the same name.

<code-example language="bash">
schematics blank --name=hello-world
</code-example>

The `blank` schematic is provided by the Schematics CLI. The command creates a new project folder (the root folder for the collection) and an initial named schematic in the collection.

Go to the collection folder, install your npm dependencies, and open your new collection in your favorite editor to see the generated files. For example, if you are using VSCode:

<code-example language="bash">
cd hello-world
npm install
npm run build
code .
</code-example>

The initial schematic gets the same name as the project folder, and is generated in `src/hello-world`.
You can add related schematics to this collection, and modify the generated skeleton code to define your schematic's functionality.
Each schematic name must be unique within the collection.
-->
다음 명령을 실행하면 `hello-world` 프로젝트가 생성되고 이 프로젝트 폴더 안에 `hello-world` 스키매틱이 생성됩니다.

<code-example language="bash">
schematics blank --name=hello-world
</code-example>

`blank` 스키매틱은 스키매틱 CLI가 제공하는 스키매틱입니다.
이 스키매틱을 사용하면 스키매틱 컬렉션의 최상위 폴더를 만들면서 이 컬렉션에 `--name`에 지정된 이름으로 새로운 스키매틱을 생성합니다.

이제 컬렉션 폴더로 이동해서 npm 패키지들을 설치하고 맘에 드는 에디터로 이 폴더를 열어봅시다.
VSCode를 사용하려면 이런 순서로 진행합니다:

<code-example language="bash">
cd hello-world
npm install
npm run build
code .
</code-example>

처음 스키매틱을 생성할 때 지정한 이름으로 프로젝트 폴더가 생성되었고 스키매틱은 `src/hello-world`에 생성되었습니다.
이렇게 생성된 기본 스키매틱 코드는 필요한 대로 자유롭게 수정할 수 있으며 컬렉션에 새로운 스키매틱을 더 추가할 수도 있습니다.
스키매틱 이름은 컬렉션 안에서 중복되면 안됩니다.


<!--
### Running a schematic
-->
### 스키매틱 실행하기

<!--
Use the `schematics` command to run a named schematic.
Provide the path to the project folder, the schematic name, and any mandatory options, in the following format.

<code-example language="bash">
schematics &lt;path-to-schematics-project&gt;:&lt;schematics-name&gt; --&lt;required-option&gt;=&lt;value&gt;
</code-example>

The path can be absolute or relative to the current working directory where the command is executed.
For example, to run the schematic we just generated (which has no required options), use the following command.

<code-example language="bash">
schematics .:hello-world
</code-example>
-->
`schematics` 명령은 스키매틱을 실행할 때도 사용합니다.
다음과 같이 실행하면 됩니다:

<code-example language="bash">
schematics &lt;스키매틱-프로젝트-경로&gt;:&lt;스키매틱-이름&gt; --&lt;필수-옵션&gt;=&lt;값&gt;
</code-example>

이 때 경로는 절대경로로 지정하거나 현재 폴더의 상대경로 모두 가능합니다.
그래서 이전에 만든 스키매틱을 단순하게 실행하려면 다음 명령을 실행하면 됩니다.
(이 스키매틱에는 필수 옵션이 없습니다.)

<code-example language="bash">
schematics .:hello-world
</code-example>


<!--
### Adding a schematic to a collection
-->
### 컬렉션에 스키매틱 추가하기

<!--
To add a schematic to an existing collection, use the same command you use to start a new schematics project, but run the command inside the project folder.

<code-example language="bash">
cd hello-world
schematics blank --name=goodbye-world
</code-example>

The command generates the new named schematic inside your collection, with a main `index.ts` file and its associated test spec.
It also adds the name, description, and factory function for the new schematic to the collection's schema in the `collection.json` file.
-->
컬렉션에 스키매틱을 추가하려면 스키매틱 프로젝트를 생성한 것과 같은 명령을 실행하면 됩니다.
하지만 이 경우에는 프로젝트 폴더 안에서 실행한다는 점이 다릅니다.

<code-example language="bash">
cd hello-world
schematics blank --name=goodbye-world
</code-example>

이 명령을 실행하면 컬렉션 안에 `goodbye-world`라는 이름으로 스키매틱이 생성되면서, 스키매틱 로직을 작성하는 `index.ts` 파일과 스펙 파일이 생성됩니다.
그리고 새로 만든 스키매틱의 이름과 설명, 팩토리 함수도 컬렉션 스키마 파일 `collection.json` 파일에 추가됩니다.


<!--
## Collection contents
-->
## 컬렉션의 내용

<!--
The top level of the root project folder for a collection contains configuration files, a `node_modules` folder, and a `src/` folder.
The `src/` folder contains subfolders for named schematics in the collection, and a schema, `collection.json`, which describes the collected schematics.
Each schematic is created with a name, description, and factory function.

<code-example language="none">
{
  "$schema":
     "../node_modules/@angular-devkit/schematics/collection-schema.json",
  "schematics": {
    "hello-world": {
      "description": "A blank schematic.",
      "factory": "./hello-world/index#helloWorld"
    }
  }
}
</code-example>

* The `$schema` property specifies the schema that the CLI uses for validation.
* The `schematics` property lists named schematics that belong to this collection.
   Each schematic has a plain-text description, and points to the generated entry function in the main file.
* The `factory` property points to the generated entry function. In this example, you invoke the `hello-world` schematic by calling the `helloWorld()` factory function.
* The optional  `schema` property points to a JSON schema file that defines the command-line options available to the schematic.
* The optional `aliases` array specifies one or more strings that can be used to invoke the schematic.
   For example, the schematic for the Angular CLI “generate” command has an alias “g”, allowing you to use the command `ng g`.
-->
컬렉션을 구성하는 프로젝트 폴더의 최상위 경로에는 컬렉션 설정 파일과 `node_modules` 폴더, `src/` 폴더가 존재합니다.
이 중 `src/` 폴더 안에는 컬렉션에 포함되는 스키매틱들이 각각의 이름으로 존재하며, 이 스키매틱들은 `collection.json` 스키마에 모두 등록되어 있습니다.
이 스키마 파일에는 스키마의 이름, 설명, 팩토리 함수가 각각 지정되어 있습니다.

<code-example language="none">
{
  "$schema":
     "../node_modules/@angular-devkit/schematics/collection-schema.json",
  "schematics": {
    "hello-world": {
      "description": "A blank schematic.",
      "factory": "./hello-world/index#helloWorld"
    }
  }
}
</code-example>

* `$schema` 프로퍼티는 CLI로 유효성을 검사할 때 필요한 기준 스키마를 지정합니다.
* `schematics` 프로퍼티는 컬렉션 안에 존재하는 스키매틱을 나열합니다.
   그리고 각 스키매틱에는 스키매틱 설명과 진입 함수가 정의된 메인 파일을 지정합니다.
* `factory` 프로퍼티는 진입 함수의 위치를 지정합니다. 이 예제에서 보면 `hello-world` 스키매틱은 `hellowWorld()`를 진입 함수로 지정했습니다.
* `schema` 프로퍼티는 생략할 수 있습니다. 이 프로퍼티는 스키매틱에 사용할 수 있는 옵션을 정의한 JSON 스키마 파일을 지정합니다.
* `aliases` 프로퍼티는 생략할 수 있습니다. 이 프로퍼티는 스키매틱을 활용할 수 있는 또 다른 방법을 제공할 때 사용합니다.
   예를 들어 Angular CLI `generate` 커맨드는 `g` 라는 별칭으로도 사용할 수 있습니다. `ng g`와 `ng generate`는 같은 동작을 합니다.


<!--
### Named schematics
-->
### 스키매틱 구성

<!--
When you use the Schematics CLI to create a blank schematics project, the new blank schematic is the first member of the collection, and has the same name as the collection.
When you add a new named schematic to this collection, it is automatically added to the  `collection.json`  schema.

In addition to the name and description, each schematic has a `factory` property that identifies the schematic’s entry point.
In the example, you invoke the schematic's defined functionality by calling the `helloWorld()` function in the main file,  `hello-world/index.ts`.

<div class="lightbox">
  <img src="generated/images/guide/schematics/collection-files.gif" alt="overview">
</div>

Each named schematic in the collection has the following main parts.

| | |
| :------------- | :-------------------------------------------|
| `index.ts`     | Code that defines the transformation logic for a named schematic.  |
| `schema.json`  | Schematic variable definition. |
| `schema.d.ts`  | Schematic variables.  |
| `files/`       | Optional component/template files to replicate. |

It is possible for a schematic to provide all of its logic in the `index.ts` file, without additional templates.
You can create dynamic schematics for Angular, however, by providing components and templates in the `files/` folder, like those in standalone Angular projects.
The logic in the index file configures these templates by defining rules that inject data and modify variables.
-->
스키매틱 CLI를 사용해서 빈 스키매틱 프로젝트를 생성하면 이 컬렉션에 생성되는 빈 스키매틱이 컬렉션의 첫번째 멤버가 됩니다.
그리고 이 컬렉션에 새로운 스키매틱을 생성하면 그때마다 `collection.json` 스키마가 자동으로 갱신됩니다.

새로 추가되는 스키매틱의 이름과 설명 외에도 각 스키매틱은 진입접을 지정하는 `factory` 프로퍼티를 지정해야 합니다.
그래서 스키매틱의 진입점이 메인파일에 존재하는 `helloWorld()` 함수라면 다음과 같이 구조가 됩니다.

<div class="lightbox">
  <img src="generated/images/guide/schematics/collection-files.gif" alt="overview">
</div>

컬렉션에 존재하는 스키매틱은 다음과 같이 구성됩니다.

| | |
| :------------- | :-------------------------------------------|
| `index.ts`     | 변환작업을 실행하는 코드를 작성합니다.  |
| `schema.json`  | 스키매틱에 사용하는 입력값을 정의합니다. |
| `schema.d.ts`  | 타입 정의 파일  |
| `files/`       | 추가 컴포넌트/템플릿 파일 |

스키매틱 로직은 추가 템플릿 없이 `index.ts` 파일에 모두 작성할 수도 있습니다.
하지만 Angular처럼 동적으로 구성되는 스키매틱을 제공하려면 `files/` 폴더에 컴포넌트와 템플릿을 추가하는 구성방법도 있습니다.
이 경우에도 인덱스 파일은 룰과 데이터를 사용해서 변환작업을 실행하지만, 추가 템플릿을 사용해서 스키매틱의 활용도를 다양하게 확장할 수 있습니다.