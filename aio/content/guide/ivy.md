<!--
# Opting into Angular Ivy
-->
# Angular Ivy 도입하기

<!--
Ivy is the code name for Angular's [next-generation compilation and rendering pipeline](https://blog.angular.io/a-plan-for-version-8-0-and-ivy-b3318dfc19f7). Starting with Angular version 8, you can choose to opt in to start using a preview version of Ivy and help in its continuing development and tuning.
-->
Ivy는 [Angular의 차세대 컴파일 파이프라인이자 렌더링 파이프라인](https://blog.angular.io/a-plan-for-version-8-0-and-ivy-b3318dfc19f7)을 의미하는 코드명입니다. Angular 8 버전부터는 이 Ivy의 시험판을 Angular 프로젝트에 적용해볼 수 있습니다.

<div class="alert is-helpful">

   <!--
   To preview Ivy, use `@angular/core@next` version of Angular (8.1.x), rather than `@angular/core@latest` (8.0.x), as it contains all the latest bug fixes and improvements.
   -->
   Ivy를 사용하려면 `@angular/core@latest` (8.0.x) 버전이 아니라 `@angular/core@next` (8.1.x) 버전을 사용해야 합니다. `@next` 버전은 `@latest` 버전에서 발견된 버그를 모두 수정한 버전입니다.

</div>


<!--
## Using Ivy in a new project
-->
## Ivy를 사용하는 프로젝트 생성하기

<!--
To start a new project with Ivy enabled, use the `--enable-ivy` flag with the [`ng new`](cli/new) command:
-->
Ivy를 활성화한 채로 새 프로젝트를 생성하려면 [`ng new`](cli/new) 명령을 실행할 때 `--enable-ivy` 플래그를 함께 사용하면 됩니다:

```sh
ng new shiny-ivy-app --enable-ivy
```

<!--
The new project is automatically configured for Ivy. Specifically, the enableIvy option is set to `true` in the project's `tsconfig.app.json` file.
-->
이 명령을 실행하면 Ivy를 사용할 수 있는 설정이 완료된 채로 프로젝트가 생성됩니다. 좀 더 정확하게 이야기하면, 프로젝트에 있는 `tsconfig.app.json` 파일의 `enableIvy` 옵션 값이 `true`로 설정됩니다.


<!--
## Using Ivy in an existing project
-->
## 프로젝트에 Ivy 도입하기

<!--
To update an existing project to use Ivy, set the `enableIvy` option in the `angularCompilerOptions` in your project's `tsconfig.app.json`.
-->
이미 생성된 프로젝트에 Ivy를 도입하려면 프로젝트의 `tsconfig.app.json` 파일에 있는 `angularCompileOptions`에 `enableIvy` 옵션을 지정하면 됩니다.

```json
{
  "compilerOptions": { ... },
  "angularCompilerOptions": {
    "enableIvy": true
  }
}
```

<!--
AOT compilation with Ivy is faster and should be used by default. In the `angular.json` workspace configuration file, set the default build options for your project to always use AOT compilation.
-->
Ivy를 사용하면 AOT 컴파일 속도도 빨라지기 때문에 앱을 빌드할 때 AOT 컴파일러를 기본 컴파일러로 사용하는 것이 좋습니다. 워크스페이스 환경 설정 파일 `angular.json` 파일을 열고 항상 AOT 컴파일러를 사용하도록 다음과 같이 설정합니다.

```json
{
  "projects": {
    "my-existing-project": {
      "architect": {
        "build": {
          "options": {
            ...
            "aot": true,
          }
        }
      }
    }
  }
}
```

<!--
To stop using the Ivy compiler, set `enableIvy` to `false` in `tsconfig.app.json`, or remove it completely. Also remove `"aot": true` from your default build options if you didn't have it there before.
-->
이후에 Ivy 컴파일러를 사용하지 않으려면 `tsconfig.app.json` 파일에 설정한 `enableIvy` 옵션을 `false`로 설정하거나 이 옵션 자체를 제거하면 됩니다. 그리고 이전에는 AOT 컴파일러를 사용하지 않았지만 Ivy를 도입하면서 `"aot": true` 옵션을 추가했다면 이 옵션도 제거하는 것이 좋습니다.
