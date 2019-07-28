<!--
# Building with Bazel
-->
# Bazel로 빌드하기

<!--
This guide explains how to build and test Angular apps with Bazel. 
-->
이 문서는 Angular 앱을 Bazel로 빌드하고 테스트하는 방법에 대해 다룹니다.


<div class="alert is-helpful">

<!--
This guide assumes you are already familiar with developing and building Angular applications using the [CLI](cli). 

It describes features which are part of Angular Labs, and are not considered a stable, supported API.
-->
이 문서는 독자가 [Angular CLI](cli)로 Angular 애플리케이션을 개발하고 빌드하는 것에 익숙하다는 것으로 가정하고 설명합니다.

이 문서에서 다루는 내용 중 일부는 안정 버전에 포함되지 않고 실험 중인 기능일 수 있습니다.

</div>

<!--
## Using Bazel with the Angular CLI
-->
## Angular CLI로 Bazel 활성화하기

<!--
The `@angular/bazel` package provides a builder that allows Angular CLI to use Bazel as the build tool.

To opt-in an existing application, run
-->
Angular 애플리케이션은 기본 Angular CLI 외에도 `@angular/bazel` 패키지로 제공하는 Bazel 빌더로 빌드할 수 있습니다.

애플리케이션에 Bazel 빌더를 활성화하려면 다음 명령을 실행하면 됩니다:

```sh
ng add @angular/bazel
```

<!--
To use Bazel in a new application, first install `@angular/bazel` globally
-->
새 애플리케이션을 생성하면서 Bazel을 활성화하려면 먼저 다음 명령을 실행해서 전역 범위에 `@angular/bazel` 패키지를 설치해야 합니다:

```sh
npm install -g @angular/bazel
```

<!--
then create the new application with
-->
그리고 다음 명령을 실행해서 새 애플리케이션을 생성하면 됩니다:

```sh
ng new --collection=@angular/bazel
```

<!--
Now when you use Angular CLI build commands such as `ng build` and `ng serve`, 
Bazel is used behind the scenes.
Outputs from Bazel appear in the `dist/bin` folder.

> The command-line output includes extra logging from Bazel.
> We plan to reduce this in the future.
-->
이렇게 만든 프로젝트에서 `ng build`나 `ng serve`와 같은 Angular CLI 명령을 실행하면 Bazel 빌더가 실행됩니다.
Bazel로 빌드된 결과물은 `dist/bin` 폴더에 생성됩니다.

> Bazel로 빌드하면 원래 빌드하던 것보다 로그가 조금 더 많이 출력됩니다.
> 이 로그들은 이후에 줄어들 수 있습니다.

<!--
### Removing Bazel
-->
### Bazel 비활성화하기


<!--
If you need to opt-out from using Bazel, you can restore the backup files:

- `/angular.json.bak` replaces `/angular.json`
- `/tsconfig.json.bak` replaces `/tsconfig.json`
-->
Bazel을 사용하다가 비활성화하려면 Bazel을 활성화할 때 생성된 백업 파일을 복구하면 됩니다:

- `/angular.json.bak` 파일을 `/angular.json` 파일로 복구합니다.
- `/tsconfig.json.bak` 파일을 `/tsconfig.json` 파일로 복구합니다.


<!--
## Advanced configuration
-->
## 고급 설정

<div class="alert is-helpful">

<!--
Editing the Bazel configuration may prevent you opting out of Bazel.
Custom behaviors driven by Bazel won't be available in other Builders.

This section assumes you are familiar with [Bazel](https://docs.bazel.build).
-->
Bazel 설정을 변경하면 Bazel이 정상 동작하지 않을 수 있습니다.
그리고 Bazel에 적용된 설정은 Bazel에만 적용되며 다른 빌더에는 적용되지 않습니다.

이 섹션은 독자가 이미 [Bazel](https://docs.bazel.build)에 대해 익숙한 것으로 가정하고 설명합니다.

</div>

<!--
You can manually adjust the Bazel configuration to:

* customize the build steps
* parallellize the build for scale and incrementality

Create the initial Bazel configuration files by running the following command: 
-->
Bazel 환경설정은 다음과 같은 경우에 수동으로 변경합니다:

* 빌드 과정을 커스터마이징 할 때
* 빌드를 병렬로 실행하거나 증분 빌드하려고 할 때

다음 명령을 실행하면 기본 Bazel 환경설정 파일을 생성할 수 있습니다:

```sh
ng build --leaveBazelFilesOnDisk
```

<!--
Now you'll find new files in the Angular workspace:

* `/WORKSPACE` tells Bazel how to download external dependencies.
* `/BUILD.bazel` and `/src/BUILD.bazel` tell Bazel about your source code.

You can find a full-featured example with custom Bazel configurations at http://github.com/angular/angular-bazel-example.

Documentation for using Bazel for frontend projects is linked from https://docs.bazel.build/versions/master/bazel-and-javascript.html.
-->
그리고 명령을 실행한 후에 Angular 워크스페이스를 보면 다음과 같은 파일이 새로 생성된 것을 확인할 수 있습니다:

* `/WORKSPACE`: Bazel에 필요한 외부 의존성 패키지를 어떻게 다운로드 받을지 지정합니다.
* `/BUILD.bazel`, `src/BUILD.bazel`: Bazel이 소스 코드를 어떻게 빌드할지 지정합니다.

Bazel 환경설정 파일을 커스터마이징하는 방법에 대해 더 자세하게 알아보려면 http://github.com/angular/angular-bazel-example 문서를 참고하세요.

그리고 프론트엔드 프로젝트에 적용할 수 있는 Bazel 환경설정은 https://docs.bazel.build/versions/master/bazel-and-javascript.html 에서 확인할 수 있습니다.


<!--
## Running Bazel directly
-->
## Bazel을 직접 실행하기

<!--
In some cases you'll want to bypass the Angular CLI builder, and run the Bazel CLI directly.
The Bazel CLI is in the `@bazel/bazel` npm package.
You can install it globally to get the `bazel` command in your path, or use `$(npm bin)/bazel` in place of bazel below.

The common commands in Bazel are:

* `bazel build [targets]`: Compile the default output artifacts of the given targets.
* `bazel test [targets]`: For whichever `*_test` targets are found in the patterns, run the tests.
* `bazel run [target]`: Compile the program represented by target, and then run it.

To repeat the command any time the inputs change (watch mode), replace `bazel` with `ibazel` in these commands.

The output locations are printed in the output.

Full documentation for the Bazel CLI is at https://docs.bazel.build/versions/master/command-line-reference.html.
-->
필요하다면 Angular CLI 빌더를 생략하고 Bazel CLI를 직접 실행할 수 있습니다.
이 때 Bazel CLI란 `@bazel/bazel`로 제공되는 npm 패키지를 의미합니다.
터미널에서 `bazel` 명령을 자유롭게 실행하려면 이 패키지가 전역 범위에 설치되어 있거나 `$(npm bin)/bazel` 경로에 bazel이 존재해야 합니다.

Bazel 명령은 다음과 같이 사용합니다:

* `bazel build [대상]`: 대상 프로젝트를 컴파일합니다.
* `build test [대상]`: `*_test` 패턴에 해당하는 프로젝트를 대상으로 테스트를 실행합니다.
* `bazel run [대상]`: 대상 프로젝트를 빌드하고 실행합니다.

파일이 변경될 때마다 이 명령이 자동으로 실행되는 워치모드로 실행하려면 `bazel` 대신 `ibazel`을 사용하면 됩니다.

빌드 결과물이 생성되는 위치는 터미널에 출력됩니다.

Bazel CLI에 대해 더 자세하게 알아보려면 https://docs.bazel.build/versions/master/command-line-reference.html 문서를 참고하세요.


<!--
## Querying the build graph
-->
## 빌드 그래프 쿼리하기

<!--
Because Bazel constructs a graph out of your targets, you can find lots of useful information.

Using the graphviz optional dependency, you'll have a program `dot`, which you can use with `bazel query`:
-->
Bazel은 대상 프로젝트를 기반으로 그래프를 생성하기 때문에 이 그래프에서 다양한 정보를 확인할 수 있습니다.

그리고 graphviz와 `dot`과 같은 추가 의존성 패키지를 설치하면 다음과 같이 `bazel query` 명령을 실행할 수 있습니다.


```bash
$ bazel query --output=graph ... | dot -Tpng > graph.png
```

<!--
See https://docs.bazel.build/versions/master/query-how-to.html for more details on `bazel query`.
-->
`bazel query`에 대해 자세하게 알아보려면 https://docs.bazel.build/versions/master/query-how-to.html 문서를 참고하세요.


<!--
## Customizing `BUILD.bazel` files
-->
## `BUILD.bazel` 파일 커스터마이징하기

<!--
"Rules" are like plugins for Bazel. Many rule sets are available. This guide documents the ones maintained by the Angular team at Google.

Rules are used in `BUILD.bazel` files, which are markers for the packages in your workspace. Each `BUILD.bazel` file declares a separate package to Bazel, though you can have more coarse-grained distributions so that the packages you publish (for example, to `npm`) can be made up of many Bazel packages.

In the `BUILD.bazel` file, each rule must first be imported, using the `load` statement. Then the rule is called with some attributes, and the result of calling the rule is that you've declared to Bazel how it can derive some outputs given some inputs and dependencies. Then later, when you run a `bazel` command line, Bazel loads all the rules you've declared to determine an absolute ordering of what needs to be run. Note that only the rules needed to produce the requested output will actually be executed.

A list of common rules for frontend development is documented in the README at https://github.com/bazelbuild/rules_nodejs/. 
-->
룰(Rule)은 Bazel 플러그인과 비슷하다고 볼 수 있습니다. Google의 Angular 팀이 직접 관리하는 이 문서에서 Bazel 룰에 대해 자세하게 알아봅시다.

룰은 `BUILD.bazel` 파일에 사용되며, 워크스페이스에 존재하는 패키지에 어떤 표시를 한 것이라고 이해하면 됩니다. `BUILD.bazel` 파일은 해당 패키지를 Bazel로 빌드할 수 있도록 설정하는 환경설정 파일이며, 이 단위가 `npm`에서 사용하는 패키지 단위와 다르더라도 Bazel 패키지 하나로 구성할 수 있습니다.

`BUILD.bazel` 파일에 사용되는 룰은 `load` 구문으로 반드시 가장 먼저 로드되어야 합니다. 그 이후에 어트리뷰트에서 룰을 호출해야 하며, Bazel이 어떤 것을 입력으로 받고 어떤 패키지를 활용해야 하는지는 이 룰이 결정합니다.
커맨드라인에서 `bazel`을 실행하면 Bazel 빌더는 모든 룰을 로드하고 이 룰을 실행되는 순서에 맞게 정렬합니다. 이 때 실제로 결과물을 생성하는데 필요하지 않은 룰은 실행되지 않고 제외됩니다.

프론트엔드 개발에 사용하는 룰 목록을 확인하려면 https://github.com/bazelbuild/rules_nodejs/ 에서 제공하는 README 문서를 참고하세요.
