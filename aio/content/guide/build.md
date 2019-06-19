<!--
# Building and serving Angular apps
-->
# 프로젝트 빌드/실행 설정

<!--
This page discusses build-specific configuration options for Angular projects.
-->
이 문서는 Angular 프로젝트 옵션 중 빌드/실행 설정과 관련된 내용에 대해 다룹니다.

{@a app-environments}

<!--
## Configuring application environments
-->
## 애플리케이션 개발환경 구성하기

<!--
You can define different named build configurations for your project, such as *stage* and *production*, with different defaults. 

Each named build configuration can have defaults for any of the options that apply to the various build targets, such as `build`, `serve`, and `test`. The [Angular CLI](cli) `build`, `serve`, and `test` commands can then replace files with appropriate versions for your intended target environment.

The following figure shows how a project has multiple build targets, which can be executed using the named configurations that you define.
-->
프로젝트에는 기본환경 설정 외에도 `staging`이나 `production`과 같이 특정 동작환경을 위한 프로젝트 환경설정을 구성할 수 있습니다.

그리고 이 환경설정들은 [Angular CLI](cli)로 `build`, `serve`, `test` 명령을 실행할 때 각각 적용할 수 있는데, Angular CLI 명령을 실행하면서 특정 환경을 지정하면 기본 환경설정 파일 대신 해당 환경설정 파일을 기반으로 CLI 명령이 실행됩니다.

그래서 프로젝트 코드는 여러가지 방식으로 빌드할 수 있으며, 각 빌드 방식에 원하는 환경을 지정할 수도 있습니다. 아래 그림을 보면서 확인해 보세요.

<!--
<figure>
  <img src="generated/images/guide/build/build-config-targets.gif" alt="build configurations and targets">
</figure>
-->
<figure>
  <img src="generated/images/guide/build/build-config-targets.gif" alt="빌드 대상/환경 설정">
</figure>

<!--
### Configure environment-specific defaults
-->
### 환경설정 기본값 지정하기

<!--
A project's `src/environments/` folder contains the base configuration file, `environment.ts`, which provides a default environment. 
You can add override defaults for additional environments, such as production and staging, in target-specific configuration files. 

For example:
-->
프로젝트의 기본 환경설정 파일은 `src/environments/` 폴더에 존재하는 `environment.ts` 파일입니다.
그리고 `production`이나 `staging`과 같은 환경을 위해 설정 파일을 따로 구성한다면, 이 파일을 오버라이드하는 방식으로 새로운 설정 파일을 구성할 수 있습니다.

예를 들면 이런 식입니다:

<!--
```
└──myProject/src/environments/
                   └──environment.ts
                   └──environment.prod.ts
                   └──environment.stage.ts
```
-->
```
└──myProject/src/environments/
     └──environment.ts
     └──environment.prod.ts
     └──environment.stage.ts
```

<!--
The base file `environment.ts`, contains the default environment settings. For example:
-->
기본 환경설정 파일 `environment.ts` 파일에는 환경설정의 기본이 되는 내용들이 존재합니다.
기본 설정은 이렇습니다:

```
export const environment = {
  production: false
};
```

<!--
The `build` command uses this as the build target when no environment is specified. 
You can add further variables, either as additional properties on the environment object, or as separate objects. 
For example, the following adds a default for a variable to the default environment:
-->
빌드 환경을 따로 지정하지 않은 상태로 `build` 명령을 실행하면 `environment.ts` 파일이 기본으로 사용됩니다.
물론 이 파일은 좀 더 많은 설정값을 갖도록 확장할 수도 있고, 필요하다면 다른 객체를 더 선언해서 사용하는 것도 가능합니다.
그래서 기본 환경 설정 객체에 다음과 같이 새로운 프로퍼티를 추가할 수도 있습니다:

```
export const environment = {
  production: false,
  apiUrl: 'http://my-api-url'
};
```

<!--
You can add target-specific configuration files, such as `environment.prod.ts`. 
The following sets content sets default values for the production build target:
-->
그리고 `environment.prod.ts` 파일에는 해당 환경에 맞는 설정값을 지정할 수 있습니다.
위에서 살펴본 `environment` 객체를 운영용 환경에 맞게 오버라이드하면 다음과 같이 같이 구성할 수 있습니다:

```
export const environment = {
  production: true,
  apiUrl: 'http://my-prod-url'
};
```

<!--
### Using environment-specific variables in your app
-->
### 애플리케이션 코드에서 환경변수 사용하기

<!--
The following application structure configures build targets for production and staging environments:
-->
`production` 환경과 `staging` 환경을 포함해서 총 3가지 빌드 환경을 구성한다면 다음과 같이 구성할 수 있습니다:

```
└── src
    └── app
        ├── app.component.html
        └── app.component.ts
    └── environments
        ├── environment.prod.ts
        ├── environment.staging.ts
        └── environment.ts
```

<!--
To use the environment configurations you have defined, your components must import the original environments file:
-->
그리고 컴포넌트 코드에서 환경변수를 참조하려면 기본 환경설정 파일인 `environment.ts` 파일을 로드해야 합니다:

```
import { environment } from './../environments/environment';
```

<!--
This ensures that the build and serve commands can find the configurations for specific build targets.

The following code in the component file (`app.component.ts`) uses an environment variable defined in the configuration files.
-->
그러면 `ng build` 명령이나 `ng serve` 명령이 실행될 때 기본 환경설정 파일을 로드하기 때문에, 애플리케이션 코드에서 이 환경설정 파일의 내용을 참조할 수 있습니다.

아래 코드는 컴포넌트 파일(`app.component.ts`)에서 환경변수를 참조하고 이 환경변수 객체에 있느 프로퍼티를 콘솔에 출력하는 코드입니다.

<!--
```
import { Component } from '@angular/core';
import { environment } from './../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor() {
    console.log(environment.production); // Logs false for default environment
  }
  title = 'app works!';
}
```
-->
```
import { Component } from '@angular/core';
import { environment } from './../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor() {
    console.log(environment.production); // 기본 환경설정 파일을 참조했기 때문에 false를 출력합니다.
  }
  title = 'app works!';
}
```

{@a file-replacement}

<!--
## Configure target-specific file replacements
-->
## 빌드 환경에 맞게 환경설정 파일 교체하기

<!--
The main CLI configuration file, `angular.json`, contains a `fileReplacements` section in the configuration for each build target, which allows you to replace any file with a target-specific version of that file. 
This is useful for including target-specific code or variables in a build that targets a specific environment, such as production or staging.

By default no files are replaced. 
You can add file replacements for specific build targets. 
For example:
-->
Angular CLI 환경설정 파일인 `angular.json` 파일에는 각 빌드 환경마다 `fileReplacements` 섹션이 존재하는데, 이 값을 설정하면 해당 빌드 환경에 해당하는 파일로 환경설정 파일을 교체할 수 있습니다.
그래서 `production` 환경이나 `staging` 환경에 해당하는 환경설정을 기본 환경설정 파일과 별개로 구성한 뒤에, Angular CLI 명령을 실행할 때 적절한 환경설정 파일로 교체해서 실행할 수 있습니다.

빌드 환경에 맞게 환경설정 파일을 교체하려면 다음과 같이 작성합니다:

```
"configurations": {
  "production": {
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.prod.ts"
      }
    ],
    ...
```

<!--
This means that when you build your production configuration (using `ng build --prod` or `ng build --configuration=production`), the `src/environments/environment.ts` file is replaced with the target-specific version of the file, `src/environments/environment.prod.ts`.

You can add additional configurations as required. To add a staging environment, create a copy of `src/environments/environment.ts` called `src/environments/environment.staging.ts`, then add a `staging` configuration to `angular.json`:
-->
이렇게 설정하면 프로젝트를 운영용 환경으로 빌드할 때(`ng build --prod` 또는 `ng build --configuration=production`) `src/environments/environment.ts` 파일을 `src/environments/environment.prod.ts` 파일로 교체한 후에 Angular CLI 명령이 실행됩니다.

이 설정은 원하는 대로 추가할 수 있습니다.
`staging` 환경을 추가로 구성해야 한다면 `src/environments/environment.ts` 파일을 복사해서 `src/environments/environment.staging.ts` 파일을 만들고, `staging` 환경에 대한 설정을 `angular.json` 파일에 다음과 같이 추가하면 됩니다:

```
"configurations": {
  "production": { ... },
  "staging": {
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.staging.ts"
      }
    ]
  }
}
```

<!--
You can add more configuration options to this target environment as well. 
Any option that your build supports can be overridden in a build target configuration.

To build using the staging configuration, run the following command:
-->
빌드 환경은 얼마든지 추가할 수 있기 때문에, 빌드 환경에 어울리는 설정값을 자유롭게 지정할 수 있습니다.

이제 `staging` 환경으로 애플리케이션을 빌드하려면 다음 명령을 실행하면 됩니다:

<code-example language="sh" class="code-shell">
 ng build --configuration=staging
</code-example>

<!--
You can also configure the `serve` command to use the targeted build configuration if you add it to the "serve:configurations" section of `angular.json`:
-->
그리고 새로 추가한 환경으로 `ng serve` 명령을 실행하려면 `angular.json` 파일의 "serve:configurations" 섹션 내용을 다음과 같이 수정하면 됩니다:

```
"serve": {
  "builder": "@angular-devkit/build-angular:dev-server",
  "options": {
    "browserTarget": "your-project-name:build"
  },
  "configurations": {
    "production": {
      "browserTarget": "your-project-name:build:production"
    },
    "staging": {
      "browserTarget": "your-project-name:build:staging"
    }
  }
},
```

{@a size-budgets}

<!--
## Configure size budgets
-->
## 빌드 결과물 용량 제한하기

<!--
As applications grow in functionality, they also grow in size. 
The CLI allows you to set size thresholds in your configuration to ensure that parts of your application stay within size boundaries that you define.

Define your size boundaries in the CLI configuration file, `angular.json`, in a `budgets` section for each [configured environment](#app-environments). 
-->
애플리케이션에 기능이 많아지면 용량도 자연스럽게 커집니다.
이 때 이 애플리케이션이 빌드된 결과물의 크기를 일정 수준으로 정해놓고, 기준 용량을 넘어가면 경고를 표시하거나 에러를 표시하게 할 수 있습니다.

이 기준값은 Angular CLI 설정파일인 `angular.json` 파일의 각 [환경 설정](#app-environments) 안에 `budgets` 섹션으로 지정합니다.

```
{
  ...
  "configurations": {
    "production": {
      ...
      budgets: []
    }
  }
}
```

<!--
You can specify size budgets for the entire app, and for particular parts. 
Each budget entry configures a budget of a given type. 
Specify size values in the following formats:

* 123 or 123b: Size in bytes

* 123kb: Size in kilobytes

* 123mb: Size in megabytes

* 12%: Percentage of size relative to baseline. (Not valid for baseline values.)

When you configure a budget, the build system warns or reports an error when a given part of the app reaches or exceeds a boundary size that you set.

Each budget entry is a JSON object with the following properties:
-->
기준 용량은 앱 전체에 지정할 수도 있고 일부에만 지정할 수도 있는데, 이 기준은 `type` 프로퍼티로 설정합니다.
그리고 기준 용량은 다음과 같은 형식으로 지정합니다:

* 123 이나 123b: 바이트(byte) 단위

* 123kb: 킬로바이트(KB) 단위

* 123mb: 메가바이트(MB) 단위

* 12%: 기준값의 비율에 해당하는 크기. (기준값에는 지정할 수 없습니다.)

`budgets` 배열에는 JSON 객체를 지정하는데, 이 객체에 사용할 수 있는 프로퍼티는 다음과 같습니다:

<!--
<table>
  <tr>
    <th>Property</th>
    <th>Value</th>
  </tr>

  <tr>
    <td>type</td>
    <td>The type of budget. One of:

        * bundle - The size of a specific bundle.
        * initial - The initial size of the app.
        * allScript - The size of all scripts.
        * all - The size of the entire app.
        * anyScript - The size of any one script.
        * any - The size of any file.
        
    </td>
  </tr>
   <tr>
    <td>name</td>
    <td>
    
    The name of the bundle (for `type=bundle`).
    
    </td>
  </tr>
  <tr>
    <td>baseline</td>
    <td>The baseline size for comparison.</td>
  </tr>
  <tr>
    <td>maximumWarning</td>
    <td>The maximum threshold for warning relative to the baseline.</td>
  </tr>
  <tr>
    <td>maximumError</td>
    <td>The maximum threshold for error relative to the baseline.</td>
  </tr>
  <tr>
    <td>minimumWarning</td>
    <td>The minimum threshold for warning relative to the baseline.</td>
  </tr>
  <tr>
    <td>minimumError</td>
    <td>The minimum threshold for error relative to the baseline.</td>
  </tr>
  <tr>
    <td>warning</td>
    <td>The threshold for warning relative to the baseline (min & max).</td>
  </tr>
  <tr>
    <td>error</td>
    <td>The threshold for error relative to the baseline (min & max).</td>
  </tr>

 </table>
-->
<table>
  <tr>
    <th>프로퍼티</th>
    <th>값</th>
  </tr>

  <tr>
    <td>type</td>
    <td>
      용량을 제한하는 방식을 지정하며, 다음 항목 중 하나를 사용합니다:

      * bundle - 특정 번들 파일을 기준으로 합니다.

      * initial - 애플리케이션이 처음 실행될 때 필요한 용량을 기준으로 합니다.

      * allScript - 스크립트 파일 전체를 기준으로 합니다.

      * all - 애플리케이션 전체 용량을 기준으로 합니다.

      * anyScript - 개별 스크립트 파일을 기준으로 합니다.

      * any - 개별 파일을 기준으로 합니다.

    </td>
  </tr>
  <tr>
    <td>name</td>
    <td>번들 파일의 이름을 지정합니다. (`type=bundle`일 때 사용합니다.)</td>
  </tr>
  <tr>
    <td>baseline</td>
    <td>기준값으로 사용할 용량을 지정합니다.</td>
  </tr>
  <tr>
    <td>maximumWarning</td>
    <td>기준값보다 이 용량 이상으로 크면 경고 메시지를 출력합니다.</td>
  </tr>
  <tr>
    <td>maximumError</td>
    <td>기준값보다 이 용량 이상으로 크면 에러 메시지를 표시합니다.</td>
  </tr>
  <tr>
    <td>minimumWarning</td>
    <td>기준값보다 이 용량 이상으로 작으면 경고 메시지를 표시합니다.</td>
  </tr>
  <tr>
    <td>minimumError</td>
    <td>기준값보다 이 용량 이상으로 작으면 에러 메시지를 표시합니다.</td>
  </tr>
  <tr>
    <td>warning</td>
    <td>기준값보다 이 용량 이상으로 작거나 크면 경고 메시지를 표시합니다.</td>
  </tr>
  <tr>
    <td>error</td>
    <td>기준값보다 이 용량 이상으로 작거나 크면 에러 메시지를 표시합니다.</td>
  </tr>
</table>


{@a browser-compat}

<!--
## Configuring browser compatibility
-->
## 브라우저 호환성 설정하기

<!--
The CLI uses [Autoprefixer](https://github.com/postcss/autoprefixer) to ensure compatibility with different browser and browser versions. 
You may find it necessary to target specific browsers or exclude certain browser versions from your build.

Internally, Autoprefixer relies on a library called [Browserslist](https://github.com/browserslist/browserslist) to figure out which browsers to support with prefixing. 
Browserlist looks for configuration options in a `browserslist` property of the package configuration file, or in a configuration file named `.browserslistrc`. 
Autoprefixer looks for the `browserslist` configuration when it prefixes your CSS. 

* You can tell Autoprefixer what browsers to target by adding a browserslist property to the package configuration file, `package.json`:
-->
Angular CLI는 브라우저 종류와 버전에 대한 호환성을 보장하기 위해 [Autoprefixer](https://github.com/postcss/autoprefixer)를 사용합니다.
그래서 특정 브라우저에서 동작하기를 원하거나 특정 브라우저 버전을 배제하는 내용으로 빌드 옵션으로 설정할 수 있습니다.

Autoprefixer는 지원하는 브라우저를 지정할 때 내부적으로 [Browserslist](https://github.com/browserslist/browserslist)를 사용합니다.
그리고 Browserlist는 프로젝트 패키지 설정 파일에 있는 `browserlist` 프로퍼티를 참조하거나 `.browserlistrc` 파일을 참조해서 지원할 브라우저 목록을 가져옵니다.
최종적으로 Autoprefixer는 Browserlist가 구성한 목록으로 CSS 파일에 이 내용을 반영합니다.

* Autoprefixer가 지원할 브라우저 목록을 지정하려면 `package.json` 파일에 `browserlist` 프로퍼티를 다음과 같이 지정하면 됩니다:

```
 "browserslist": [
   "> 1%",
   "last 2 versions"
 ]
```

<!--
* Alternatively, you can add a new file, `.browserslistrc`, to the project directory, that specifies browsers you want to support:
-->
* 아니면 프로젝트 폴더에 `.browserlistrc` 파일을 만들고 이 파일에 다음과 같이 지정할 수도 있습니다:

<!--
```
 ### Supported Browsers
 > 1%
 last 2 versions
```
-->
```
 ### 지원 브라우저
 > 1%
 last 2 versions
```

<!--
See the [browserslist repo](https://github.com/browserslist/browserslist) for more examples of how to target specific browsers and versions.
-->
지원할 브라우저와 브라우저 버전을 지정하는 방법은 [browserslist GitHub 레파지토리](https://github.com/browserslist/browserslist)를 참고하세요.

<div class="alert is-helpful">
<!--
Backward compatibility

If you want to produce a progressive web app and are using [Lighthouse](https://developers.google.com/web/tools/lighthouse/) to grade the project, add the following browserslist entry to your `package.json` file, in order to eliminate the [old flexbox](https://developers.google.com/web/tools/lighthouse/audits/old-flexbox) prefixes:
-->
Lighthouse 호환성 설정

PWA 앱을 대상으로 [Lighthouse](https://developers.google.com/web/tools/lighthouse/)를 사용해서 프로젝트를 점검하려면 `package.json` 파일에 다음 내용을 추가해야 합니다.
이 설정은 [이전 버전의 CSS Flexbox](https://developers.google.com/web/tools/lighthouse/audits/old-flexbox)를 지원하지 않겠다는 것을 의미합니다.

```
"browserslist": [
  "last 2 versions",
  "not ie <= 10",
  "not ie_mob <= 10"
]
```

</div>

{@a proxy}

<!--
## Proxying to a backend server
-->
## 백엔드 서버 프록시 설정하기

<!--
You can use the [proxying support](https://webpack.js.org/configuration/dev-server/#devserver-proxy) in the `webpack` dev server to divert certain URLs to a backend server, by passing a file to the `--proxy-config` build option.
For example, to divert all calls for `http://localhost:4200/api` to a server running on `http://localhost:3000/api`, take the following steps.
-->
Angular CLI가 제공하는 개발 서버는 `webpack` 개발 서버를 사용하기 때문에 특정 백엔드 주소로 향하는 HTTP 요청에 대해 프록시를 설정할 수 있습니다.
이 프록시 설정은 빌드할 때 `--proxy-config` 옵션을 사용하거나 `angular.json` 파일에 지정해 두는 방식으로 사용합니다.
예를 들어 `http://localhost:4200/api`로 요청하는 모든 HTTP 요청을 `http://localhost:3000/api`로 보내려면 다음과 같이 설정합니다.

<!--
1. Create a file `proxy.conf.json` in the projects `src/` folder, in the same directory as `package.json`.

1. Add the following content to the new proxy file:
-->
1. `package.json` 파일이 존재하는 `src/` 폴더에 `proxy.conf.json` 파일을 만듭니다.

1. `proxy.conf.json` 파일의 내용을 다음과 같이 작성합니다:

    ```
    {
      "/api": {
        "target": "http://localhost:3000",
        "secure": false
      }
    }
    ```

1. Angular CLI 환경설정 파일인 `angular.json` 파일의 빌드 대상 중 `serve`에 `proxyConfig` 옵션을 추가하고 다음과 같이 작성합니다:

    ```
    ...
    "architect": {
      "serve": {
        "builder": "@angular-devkit/build-angular:dev-server",
        "options": {
          "browserTarget": "your-application-name:build",
          "proxyConfig": "src/proxy.conf.json"
        },
    ...
    ```

1. `ng serve` 명령을 실행해서 이 프록시 설정으로 개발 서버를 실행합니다.

<!--
You can edit the proxy configuration file to add configuration options; some examples are given below. 
For a description of all options, see [webpack DevServer documentation](https://webpack.js.org/configuration/dev-server/#devserver-proxy).

Note that if you edit the proxy configuration file, you must relaunch the `ng serve` process to make your changes effective.
-->
프록시 설정 파일에는 더 구체적인 규칙을 지정할 수도 있으며, 이 문서에서는 자주 사용하는 옵션에 대해서만 설명합니다.
프록시 설정에 활용할 수 있는 옵션은 [webpack DevServer 문서](https://webpack.js.org/configuration/dev-server/#devserver-proxy)를 참고하세요.

프록시 설정 파일의 내용을 변경하면 이 내용을 반영하기 위해 `ng serve` 명령을 다시 실행해야 합니다.

<!--
### Rewrite the URL path
-->
### 요청하는 URL 주소 변경하기

<!--
The `pathRewrite` proxy configuration option lets you rewrite the URL path at run time. 
For example, you can specify the following `pathRewrite` value to the proxy configuration to remove "api" from the end of a path.
-->
프록시 설정 옵션 중 `pathRewrite` 옵션을 사용하면 애플리케이션이 실행되면서 요청하는 URL 주소를 다른 주소로 변경할 수 있습니다.
예를 들어 다음과 같이 설정하면 요청하는 주소 마지막에 붙는 "api" 문자열을 제거합니다.

```
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "pathRewrite": {
      "^/api": ""
    }
  }
}
```

<!--
If you need to access a backend that is not on `localhost`, set the `changeOrigin` option as well. For example:
-->
그리고 백엔드 서버의 주소가 `localhost`가 아니라면 `changeOrigin` 옵션을 사용해서 다음과 같이 설정할 수 있습니다:

```
{
  "/api": {
    "target": "http://npmjs.org",
    "secure": false,
    "pathRewrite": {
      "^/api": ""
    },
    "changeOrigin": true
  }
}
```

<!--
To help determine whether your proxy is working as intended, set the `logLevel` option. For example:
-->
프록시 설정이 제대로 동작하는지 확인하려면 `logLevel` 옵션을 사용합니다:

```
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "pathRewrite": {
      "^/api": ""
    },
    "logLevel": "debug"
  }
}
```

<!--
Proxy log levels are `info` (the default), `debug`, `warn`, `error`, and `silent`.
-->
프록시 설정의 기본 로그 레벨은 `info`이며, `debug`, `warn`, `error`, `silent` 레벨을 사용할 수 있습니다.

<!--
### Proxy multiple entries
-->
### 특정 주소에 대해 프록시 설정하기

<!--
You can  proxy multiple entries to the same target by defining the configuration in JavaScript.

Set the proxy configuration file to `proxy.conf.js` (instead of `proxy.conf.json`), and specify configuration files as in the following example.
-->
JavaScript 파일을 사용하면 원하는 주소에 해당하는 요청에만 프록시 설정을 적용할 수 있습니다.

이 방법을 사용하려면 `proxy.conf.json` 파일 대신 `proxy.conf.js` 파일에 프록시를 설정합니다.
이 내용은 다음과 같이 작성합니다.

```
const PROXY_CONFIG = [
    {
        context: [
            "/my",
            "/many",
            "/endpoints",
            "/i",
            "/need",
            "/to",
            "/proxy"
        ],
        target: "http://localhost:3000",
        secure: false
    }
]

module.exports = PROXY_CONFIG;
```

<!--
In the CLI configuration file, `angular.json`, point to the JavaScript proxy configuration file:
-->
이 파일로 프록시를 설정하려면 Angular CLI 설정 파일 `angular.json` 파일에 이 파일을 지정하면 됩니다:

```
...
"architect": {
  "serve": {
    "builder": "@angular-devkit/build-angular:dev-server",
    "options": {
      "browserTarget": "your-application-name:build",
      "proxyConfig": "src/proxy.conf.js"
    },
...
```

<!--
### Bypass the proxy
-->
### 프록시 설정 회피하기

<!--
If you need to optionally bypass the proxy, or dynamically change the request before it's sent, add the bypass option, as shown in this JavaScript example.
-->
프록시 설정을 회피해야 하는 경우나 HTTP 요청을 동적으로 변경해야 하는 경우에는 JavaScript 프록시 설정 파일에 `bypass` 옵션을 사용할 수 있습니다.

```
const PROXY_CONFIG = {
    "/api/proxy": {
        "target": "http://localhost:3000",
        "secure": false,
        "bypass": function (req, res, proxyOptions) {
            if (req.headers.accept.indexOf("html") !== -1) {
                console.log("Skipping proxy for browser request.");
                return "/index.html";
            }
            req.headers["X-Custom-Header"] = "yes";
        }
    }
}

module.exports = PROXY_CONFIG;
```

<!--
### Using corporate proxy
-->
### 사내 프록시 활용하기

<!--
If you work behind a corporate proxy, the cannot directly proxy calls to any URL outside your local network. 
In this case, you can configure the backend proxy to redirect calls through your corporate proxy using an agent:
-->
개발환경에 사내용 프록시를 사용한다면 로컬 네트워크에서 회사 외부 URL로 직접 프록시 요청을 보낼 수 없습니다.
이 경우에는 사내 프록시를 통과해서 리다이렉트 요청을 보내야 합니다.

다음 명령을 실행해서 프록시 에이전트 패키지를 설치합니다:

<code-example language="none" class="code-shell">
npm install --save-dev https-proxy-agent
</code-example>

<!--
When you define an environment variable `http_proxy` or `HTTP_PROXY`, an agent is automatically added to pass calls through your corporate proxy when running `npm start`.

Use the following content in the JavaScript configuration file.
-->
이제 환경변수 객체에 `http_proxy`나 `HTTP_PROXY` 프로퍼티를 선언하면 위에서 설치한 에이전트가 HTTP 요청을 사내 프록시를 통과하도록 재요청합니다.

JavaScript 프록시 설정 파일은 다음과 같이 작성합니다.

```
var HttpsProxyAgent = require('https-proxy-agent');
var proxyConfig = [{
  context: '/api',
  target: 'http://your-remote-server.com:3000',
  secure: false
}];

function setupForCorporateProxy(proxyConfig) {
  var proxyServer = process.env.http_proxy || process.env.HTTP_PROXY;
  if (proxyServer) {
    var agent = new HttpsProxyAgent(proxyServer);
    console.log('Using corporate proxy server: ' + proxyServer);
    proxyConfig.forEach(function(entry) {
      entry.agent = agent;
    });
  }
  return proxyConfig;
}

module.exports = setupForCorporateProxy(proxyConfig);
```

