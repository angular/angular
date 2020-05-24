<!--
# Schematics for libraries
-->
# 라이브러리용 스키매틱

<!--
When you create an Angular library, you can provide and package it with schematics that integrate it with the Angular CLI.
With your schematics, your users can use  `ng add` to install an initial version of your library,
`ng generate` to create artifacts defined in your library, and `ng update` to adjust their project for a new version of your library that introduces breaking changes.

All three types of schematics can be part of a collection that you package with your library.

Download the <live-example downloadOnly>library schematics project</live-example> for a completed example of the steps below.
-->
Angular 라이브러리는 Angular CLI와 통합하기 위해 스키매틱을 함께 제공할 수 있습니다.
이 방법을 활용하면 사용자가 `ng add` 명령을 사용해서 라이브러리를 설치할 수 있고, `ng generate` 명령을 사용해서 라이브러리가 제공하는 Angular 구성요소를 생성할 수 있으며, `ng update`를 사용해서 라이브러리 버전을 업데이트하면서 필요한 수정사항을 자동으로 처리할 수 있습니다.

세 종류의 스키매틱은 컬렉션 하나로 묶어서 라이브러리와 함께 배포할 수 있습니다.

이 문서에서 설명하는 내용은 <live-example downloadOnly>library schematics project</live-example>를 직접 내려받아서 확인해보세요.


<!--
## Creating a schematics collection
-->
## 스키매틱 컬렉션 만들기

<!--
To start a collection, you need to create the schematic files.
The following steps show you how to add initial support without modifying any project files.

1. In your library's root folder, create a `schematics/`  folder.

1. In the `schematics/` folder, create an `ng-add/` folder for your first schematic.

1. At the root level of the `schematics/` folder, create a `collection.json` file.

1. Edit the `collection.json` file to define the initial schema for your collection.

<code-example header="projects/my-lib/schematics/collection.json (Schematics Collection)" path="schematics-for-libraries/projects/my-lib/schematics/collection.1.json">
</code-example>

  * The `$schema` path is relative to the Angular Devkit collection schema.
  * The `schematics` object describes the named schematics that are part of this collection.
  * The first entry is for a schematic named `ng-add`. It contains the description, and points to the factory function that is called when your schematic is executed.

1. In your library project's `package.json` file, add a "schematics" entry with the path to your schema file.
   The Angular CLI uses this entry to find named schematics in your collection when it runs commands.

<code-example header="projects/my-lib/package.json (Schematics Collection Reference)" path="schematics-for-libraries/projects/my-lib/package.json" region="collection">
</code-example>

The initial schema that you have created tells the CLI where to find the schematic that supports the `ng add` command.
Now you are ready to create that schematic.
-->
컬렉션을 만들기 전에 먼저 스키매틱 파일을 만들어야 합니다.
다음 순서대로 진행하면 프로젝트 파일은 건드리지 않으면서 스키매틱을 만들 수 있습니다.

1. 라이브러리 최상위 폴더 아래에 `schematics` 폴더를 생성합니다.

1. `schematics` 폴더에 첫번째 스키매틱으로 사용할 `ng-add` 폴더를 생성합니다.

1. `schematics` 폴더에 `collection.json` 파일을 생성합니다.

1. `collection.json` 파일의 내용을 다음과 같이 작성합니다.

<code-example header="projects/my-lib/schematics/collection.json (스키매틱 컬렉션)" path="schematics-for-libraries/projects/my-lib/schematics/collection.1.json">
</code-example>

  * `$schema`는 Angular Devkit 컬렉션 스키마를 가리키는 상대주소입니다.
  * `schematics` 객체에는 컬렉션에 추가할 스키매틱을 지정합니다.
  * 첫번째로 추가된 스키매틱은 `ng-add` 스키매틱입니다. 이 스키매틱 객체에는 스키매틱에 대한 설명과 스키매틱이 실행될 때 진입점이 될 팩토리 함수를 지정합니다.

1. 라이브러리 프로젝트의 `package.json` 파일에 "schematics"를 추가하고 위에서 작성한 스키마 파일의 경로를 지정합니다.
   그러면 Angular CLI가 이 스키마 파일의 내용을 바탕으로 확장됩니다.

<code-example header="projects/my-lib/package.json (스키매틱 컬렉션 참조)" path="schematics-for-libraries/projects/my-lib/package.json" region="collection">
</code-example>

지금까지 작성한 내용은 이 라이브러리가 `ng add` 지원 스키매틱을 제공한다는 것을 Angular CLI에게 알려주기 위한 것입니다.
이제 스키매틱 로직을 작성해 봅시다.


<!--
## Providing installation support
-->
## 라이브러리 설치 로직 작성하기

<!--
A schematic for the `ng add` command can enhance the initial installation process for your users.
The following steps will define this type of schematic.

1. Go to the <lib-root>/schematics/ng-add/ folder.

1. Create the main file, `index.ts`.

1. Open `index.ts` and add the source code for your schematic factory function.

<code-example header="projects/my-lib/schematics/ng-add/index.ts (ng-add Rule Factory)" path="schematics-for-libraries/projects/my-lib/schematics/ng-add/index.ts">
</code-example>

The only step needed to provide initial `ng add` support is to trigger an installation task using the `SchematicContext`.
The task uses the user's preferred package manager to add the library to the project's `package.json` configuration file, and install it in the project’s `node_modules` directory.

In this example, the function receives the current `Tree` and returns it without any modifications.
If you need to, you can do additional setup when your package is installed, such as generating files, updating configuration, or any other initial setup your library requires.
-->
`ng add` 스키매틱을 정의하면 라이브러리 설치 과정을 확장할 수 있습니다.
다음 순서로 진행해 봅시다.

1. &lt;라이브러리-최상위-폴더&gt;/schematics/ng-add/ 폴더로 이동합니다.

1. 메인 파일 `index.ts`를 만듭니다.

1. `index.ts` 파일을 열고 다음 내용으로 스키매틱 팩토리 함수를 정의합니다.

<code-example header="projects/my-lib/schematics/ng-add/index.ts (ng-add 룰 팩토리)" path="schematics-for-libraries/projects/my-lib/schematics/ng-add/index.ts">
</code-example>

`ng add` 스키매틱에 필요한 것은 `SchematicContext`를 활용해서 설치 작업을 시작하는 것 뿐입니다.
그러면 사용자가 설정한 기본 패키지 매니저로 `node_modules` 폴더에 라이브러리를 설치하며, 프로젝트에 있는 `package.json` 설정 파일을 수정합니다.

위에서 작성한 예제 코드는 `Tree` 객체를 받지만 이 객체를 수정하지 않고 그대로 반환합니다.
필요하다면 라이브러리 패키지를 설치한 이후에 어떤 파일을 생성한다던지, 환경설정 파일을 수정한다던지, 라이브러리 초기화 작업을 실행할 수 있습니다.


<!--
## Building your schematics
-->
## 스키매틱 빌드하기

<!--
To bundle your schematics together with your library, you must configure the library to build the schematics separately, then add them to the bundle.
You must build your schematics *after* you build your library, so they are placed in the correct directory.

* Your library needs a custom Typescript configuration file with instructions on how to compile your schematics into your distributed library.

* To add the schematics to the library bundle, add scripts to the library's `package.json` file.

Assume you have a library project `my-lib` in your Angular workspace.
To tell the library how to build the schematics, add a `tsconfig.schematics.json` file next to the generated `tsconfig.lib.json` file that configures the library build.

1. Edit the `tsconfig.schematics.json` file to add the following content.

<code-example header="projects/my-lib/tsconfig.schematics.json (TypeScript Config)" path="schematics-for-libraries/projects/my-lib/tsconfig.schematics.json">
</code-example>

  * The `rootDir` specifies that your `schematics/` folder contains the input files to be compiled.

  * The `outDir` maps to the library's output folder. By default, this is the `dist/my-lib` folder at the root of your workspace.

1. To make sure your schematics source files get compiled into the library bundle, add the following scripts to the `package.json` file in your library project's root folder (`projects/my-lib`).

<code-example header="projects/my-lib/package.json (Build Scripts)" path="schematics-for-libraries/projects/my-lib/package.json">
</code-example>

  * The `build` script compiles your schematic using the custom `tsconfig.schematics.json` file.
  * The `copy:*` statements copy compiled schematic files into the proper locations in the library output folder in order to preserve the file structure.
  * The `postbuild` script copies the schematic files after the `build` script completes.
-->
스키매틱을 라이브러리와 함께 빌드하려면 기존 빌드 설정에 스키매틱 빌드 과정을 추가해야 합니다.
이 때 스키매틱은 라이브러리를 빌드한 *후에* 빌드해야 원하는 위치에 제대로 생성할 수 있습니다.

* 스키매틱을 라이브러리 안으로 통합하려면 스키매틱을 어떻게 컴파일해야 하는지 지정하는 TypeScript 설정이 필요합니다.

* 라이브러리 `package.json` 파일에 스키매틱을 추가하는 스크립트를 작성해야 합니다.

Angular 워크스페이스에 `my-lib` 라이브러리 프로젝트가 있다고 합시다.
그러면 스키매틱을 빌드하기 위해 라이브러리 빌드 설정 파일인 `tsconfig.lib.json` 파일과 같은 위치에 `tsconfig.schematics.json` 파일을 추가해야 합니다.

1. `tsconfig.schematics.json` 파일의 내용을 다음과 같이 작성합니다.

<code-example header="projects/my-lib/tsconfig.schematics.json (TypeScript 환경 설정)" path="schematics-for-libraries/projects/my-lib/tsconfig.schematics.json">
</code-example>

  * 스키매틱에 있는 파일을 모두 컴파일해야 하기 때문에 `rootDir`은 `schematics` 폴더로 지정합니다.

  * `outDir`은 라이브러리가 빌드되는 폴더로 지정합니다. 기본값은 워크스페이스 최상위 폴더를 기준으로 `dist/my-lib`입니다.

1. 그리고 스키매틱 소스 파일을 라이브러리 번들 결과물에 포함하기 위해 라이브러리 프로젝트의 최상위 폴더 `projects/my-lib`에 있는 `package.json` 파일에 다음 스크립트를 추가합니다.

<code-example header="projects/my-lib/package.json (빌드 스크립트)" path="schematics-for-libraries/projects/my-lib/package.json">
</code-example>

  * `build` 스크립트는 `tsconfig.schematics.json` 파일을 사용해서 스키매틱을 빌드하는 스크립트입니다.
  * `copy:*` 스크립트는 컴파일된 스키매틱 파일을 라이브러리가 빌드된 폴더로 복사하는 스크립트입니다.
  * `postbuild` 스크립트는 `build` 스크립트를 실행한 후에 빌드된 스키매틱 파일을 복사하는 스크립트입니다.


<!--
## Providing generation support
-->
## 생성(generation) 기능 제공하기

<!--
You can add a named schematic to your collection that lets your users use the `ng generate` command to create an artifact that is defined in your library.

We'll assume that your library defines a service, `my-service`, that requires some setup. You want your users to be able to generate it using the following CLI command.

<code-example language="bash">
ng generate my-lib:my-service
</code-example>

To begin, create a new subfolder, `my-service`, in the `schematics` folder.
-->
`ng generate` 스키매틱을 정의하면 라이브러리가 제공하는 컴포넌트나 서비스를 간단하게 생성할 수 있습니다.

라이브러리가 `my-service`라는 서비스를 제공하는데 이 서비스에 필요한 설정이 몇가지 필요하다고 합시다.
이런 경우에 생성 과정을 간단하게 처리하기 위해 Angular CLI 명령으로 다음과 같이 사용하려고 합니다.

<code-example language="bash">
ng generate my-lib:my-service
</code-example>

`schematics` 폴더에 `my-service` 폴더를 만드는 것부터 시작해 봅시다.


<!--
### Configure the new schematic
-->
### 스키매틱 추가하기

<!--
When you add a schematic to the collection, you have to point to it in the collection's schema, and provide configuration files to define options that a user can pass to the command.

1. Edit the `schematics/collection.json` file to point to the new schematic subfolder, and include a pointer to a schema file that will specify inputs for the new schematic.

<code-example header="projects/my-lib/schematics/collection.json (Schematics Collection)" path="schematics-for-libraries/projects/my-lib/schematics/collection.json">
</code-example>

1. Go to the `<lib-root>/schematics/my-service/` folder.

1. Create a `schema.json` file and define the available options for the schematic.

<code-example header="projects/my-lib/schematics/my-service/schema.json (Schematic JSON Schema)" path="schematics-for-libraries/projects/my-lib/schematics/my-service/schema.json">
</code-example>

  * *id* : A unique id for the schema in the collection.
  * *title* : A human-readable description of the schema.
  * *type* : A descriptor for the type provided by the properties.
  * *properties* : An object that defines the available options for the schematic.

  Each option associates key with a type, description, and optional alias.
  The type defines the shape of the value you expect, and the description is displayed when the user requests usage help for your schematic.

  See the workspace schema for additional customizations for schematic options.

1. Create a `schema.ts` file and define an interface that stores the values of the options defined in the `schema.json` file.

<code-example header="projects/my-lib/schematics/my-service/schema.ts (Schematic Interface)" path="schematics-for-libraries/projects/my-lib/schematics/my-service/schema.ts">
</code-example>

  * *name* : The name you want to provide for the created service.
  * *path* : Overrides the path provided to the schematic. The default path value is based on the current working directory.
  * *project* : Provides a specific project to run the schematic on. In the schematic, you can provide a default if the option is not provided by the user.
-->
컬렉션에 스키매틱을 추가하고 나면 컬렉션 스키마에 이 스키매틱을 추가해야 합니다.
그리고나서 사용자가 사용할 수 있는 입력값을 스키마 파일로 정의해야 합니다.

1. `schematics/collection.json` 파일을 열고 새로 만든 스키매틱 폴더를 지정합니다. 이 때 스키매틱 입력값을 정의하는 스키마 파일도 함께 지정합니다.

<code-example header="projects/my-lib/schematics/collection.json (스키매틱 컬렉션)" path="schematics-for-libraries/projects/my-lib/schematics/collection.json">
</code-example>

1. `<lib-root>/schematics/my-service` 폴더로 이동합니다.

1. `shcema.json` 파일을 열고 스키매틱 입력값을 정의합니다.

<code-example header="projects/my-lib/schematics/my-service/schema.json (스키매틱 JSON 스키마)" path="schematics-for-libraries/projects/my-lib/schematics/my-service/schema.json">
</code-example>

  * *id* : 콜렉션 안에서 스키마를 구분하는 ID입니다.
  * *title* : 스키마를 설명하는 문구를 작성합니다.
  * *type* : 프로퍼티 타입을 지정합니다.
  * *properties* : 스키매틱 입력값의 형식을 객체 형태로 정의합니다.

  개별 입력값은 각각 `type`, `description`, `alias`(생략 가능)로 구성합니다.
  이 때 `type`은 입력값의 형식을 의미하며, `description`은 사용자가 스키매틱을 실행할 때 확인하는 문구입니다.

  더 자세한 내용은 워크스페이스 스키마를 참고하세요.

1. `schema.ts` 파일을 만들고 이 파일에 `schema.json`에서 정의한 내용을 인터페이스 형태로 정의합니다.

<code-example header="projects/my-lib/schematics/my-service/schema.ts (스키매틱 인터페이스)" path="schematics-for-libraries/projects/my-lib/schematics/my-service/schema.ts">
</code-example>

  * *name* : 서비스 이름으로 사용할 문자열
  * *path* : 서비스를 생성할 위치를 지정할 때 사용합니다. 기본값은 현재 위치한 폴더입니다.
  * *project* : 스키매틱 실행에 기준이 될 프로젝트를 지정합니다. 사용자가 입력값을 입력하지 않았을 때 기본값을 지정하기 위해 사용합니다.


### Add template files

To add artifacts to a project, your schematic needs its own template files.
Schematic templates support special syntax to execute code and variable substitution.

1. Create a `files/` folder inside the `schematics/my-service/` folder.

1. Create a file named `__name@dasherize__.service.ts.template` that defines a template you can use for generating files. This template will generate a service that already has Angular's `HttpClient` injected into its constructor.

<code-example lang="ts" header="projects/my-lib/schematics/my-service/files/__name@dasherize__.service.ts.template (Schematic Template)">

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class <%= classify(name) %>Service {
  constructor(private http: HttpClient) { }
}

</code-example>

* The `classify` and `dasherize` methods are utility functions that your schematic will use to transform your source template and filename.

* The `name` is provided as a property from your factory function. It is the same `name` you defined in the schema.

### Add the factory function

Now that you have the infrastructure in place, you can define the main function that performs the modifications you need in the user's project.

The Schematics framework provides a file templating system, which supports both path and content templates.
The system operates on placeholders defined inside files or paths that loaded in the input `Tree`.
It fills these in using values passed into the `Rule`.

For details of these data structure and syntax, see the [Schematics README](https://github.com/angular/angular-cli/blob/master/packages/angular_devkit/schematics/README.md).


1. Create the main file, `index.ts` and add the source code for your schematic factory function.

1. First, import the schematics definitions you will need. The Schematics framework offers many utility functions to create and use rules when running a schematic.

<code-example header="projects/my-lib/schematics/my-service/index.ts (Imports)" path="schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="schematics-imports">
</code-example>

1. Import the defined schema interface that provides the type information for your schematic's options.

<code-example header="projects/my-lib/schematics/my-service/index.ts (Schema Import)" path="schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="schema-imports">
</code-example>

1. To build up the generation schematic, start with an empty rule factory.

<code-example header="projects/my-lib/schematics/my-service/index.ts (Initial Rule)" path="schematics-for-libraries/projects/my-lib/schematics/my-service/index.1.ts" region="factory">
</code-example>

This simple rule factory returns the tree without modification.
The options are the option values passed through from the `ng generate` command.

## Define a generation rule

We now have the framework in place for creating the code that actually modifies the user's application to set it up for the service defined in your library.

The Angular workspace where the user has installed your library contains multiple projects (applications and libraries).
The user can specify the project on the command line, or allow it to default.
In either case, your code needs to identify the specific project to which this schematic is being applied, so that you can retrieve information from the project configuration.

You can do this using the `Tree` object that is passed in to the factory function.
The `Tree` methods give you access to the complete file tree in your workspace, allowing you to read and write files during the execution of the schematic.

### Get the project configuration

1. To determine the destination project, use the `Tree.read()` method to read the contents of the workspace configuration file, `angular.json`, at the root of the workspace.
   Add the following code to your factory function.

<code-example header="projects/my-lib/schematics/my-service/index.ts (Schema Import)" path="schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="workspace">
</code-example>

  * Be sure to check that the context exists and throw the appropriate error.

  * After reading the contents into a string, parse the configuration into a JSON object, typed to the `WorkspaceSchema`.

1. The `WorkspaceSchema` contains all the properties of the workspace configuration, including a `defaultProject` value for determining which project to use if not provided.
   We will use that value as a fallback, if no project is explicitly specified in the `ng generate` command.

<code-example header="projects/my-lib/schematics/my-service/index.ts (Default Project)" path="schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="project-fallback">
</code-example>

1. Now that you have the project name, use it to retrieve the project-specific configuration information.

<code-example header="projects/my-lib/schematics/my-service/index.ts (Project)" path="schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="project-info">
</code-example>

   The `workspace projects` object contains all the project-specific configuration information.

1. The `options.path` determines where the schematic template files are moved to once the schematic is applied.

   The `path` option in the schematic's schema is substituted by default with the current working directory.
   If the `path` is not defined, use the `sourceRoot` from the project configuration along with the `projectType`.

<code-example header="projects/my-lib/schematics/my-service/index.ts (Project Info)" path="schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="path">
</code-example>

### Define the rule

A `Rule` can use external template files, transform them, and return another `Rule` object with the transformed template. You can use the templating to generate any custom files required for your schematic.

1. Add the following code to your factory function.

<code-example header="projects/my-lib/schematics/my-service/index.ts (Template transform)" path="schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="template">
</code-example>

  * The `apply()` method applies multiple rules to a source and returns the transformed source. It takes 2 arguments, a source and an array of rules.
  * The `url()` method reads source files from your filesystem, relative to the schematic.
  * The `applyTemplates()` method receives an argument of methods and properties you want make available to the schematic template and the schematic filenames. It returns a `Rule`. This is where you define the `classify()` and `dasherize()` methods, and the `name` property.
  * The `classify()` method takes a value and returns the value in title case. For example, if the provided name is `my service`, it is returned as `MyService`
  * The `dasherize()` method takes a value and returns the value in dashed and lowercase. For example, if the provided name is MyService, it is returned as `my-service.
  * The `move` method moves the provided source files to their destination when the schematic is applied.

1. Finally, the rule factory must return a rule.

<code-example header="projects/my-lib/schematics/my-service/index.ts (Chain Rule)" path="schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts" region="chain">
</code-example>

  The `chain()` method allows you to combine multiple rules into a single rule, so that you can perform multiple operations in a single schematic.
  Here you are only merging the template rules with any code executed by the schematic.

See a complete exampled of the schematic rule function.

<code-example header="projects/my-lib/schematics/my-service/index.ts" path="schematics-for-libraries/projects/my-lib/schematics/my-service/index.ts">
</code-example>

For more information about rules and utility methods, see [Provided Rules](https://github.com/angular/angular-cli/tree/master/packages/angular_devkit/schematics#provided-rules).

## Running your library schematic

After you build your library and schematics, you can install the schematics collection to run against your project. The steps below show you how to generate a service using the schematic you created above.


### Build your library and schematics

From the root of your workspace, run the `ng build` command for your library.

<code-example language="bash">

  ng build my-lib

</code-example>

Then, you change into your library directory to build the schematic

<code-example language="bash">

  cd projects/my-lib
  npm run build

</code-example>

### Link the library

Your library and schematics are packaged and placed in the `dist/my-lib` folder at the root of your workspace. For running the schematic, you need to link the library into your `node_modules` folder. From the root of your workspace, run the `npm link` command with the path to your distributable library.

<code-example language="bash">

npm link dist/my-lib

</code-example>

### Run the schematic

Now that your library is installed, you can run the schematic using the `ng generate` command.

<code-example language="bash">

ng generate my-lib:my-service --name my-data

</code-example>

In the console, you will see that the schematic was run and the `my-data.service.ts` file was created in your app folder.

<code-example language="bash" hideCopy="true">

CREATE src/app/my-data.service.ts (208 bytes)

</code-example>
