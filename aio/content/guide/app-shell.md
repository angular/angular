<!--
# App shell
-->
# 애플리케이션 기본 틀

<!--
App shell is a way to render a portion of your application via a route at build time.
It can improve the user experience by quickly launching a static rendered page (a skeleton common to all pages) while the browser downloads the full client version and switches to it automatically after the code loads.

This gives users a meaningful first paint of your application that appears quickly because the browser can simply render the HTML and CSS without the need to initialize any JavaScript.

Learn more in [The App Shell Model](https://developers.google.com/web/fundamentals/architecture/app-shell).
-->
Angular 애플리케이션을 빌드할 때 애플리케이션 자체의 렌더링을 담당하는 부분을 애플리케이션의 기본 틀(App Shell)이라고 합니다.
이 기본 틀은 페이지에서 필요한 내용을 브라우저가 다운로드받기 전에 페이지의 기본 구조를 정적으로 먼저 렌더링하는 용도로 사용하는데, 이렇게 구현하면 사용자가 느끼는 사용성이 좀 더 향상됩니다.

그래서 애플리케이션의 기본 틀은 JavaScript 실행 없이 HTML과 CSS로만 구현하는 것이 좋으며, 이렇게 구현해야 "사용자가 의미있다고 판단하는 첫 화면(meaningful first paint of application)"을 빠르게 띄울 수 있습니다.

자세한 내용은 [앱 기본 틀 모델](https://developers.google.com/web/fundamentals/architecture/app-shell) 문서를 참고하세요.

<!--
## Step 1: Prepare the application
-->
## 1단계: 애플리케이션 생성하기

<!--
You can do this with the following CLI command:
-->
Angular CLI로 다음 명령을 실행하면 애플리케이션을 생성할 수 있습니다:

<code-example format="." language="bash" linenums="false">
ng new my-app --routing
</code-example>

<!--
For an existing application, you have to manually add the `RouterModule` and defining a `<router-outlet>` within your application.
-->
이미 애플리케이션이 있다면, 애플리케이션에 `RouterModule`을 추가하고 템플릿에 `<router-outlet>`을 추가하면 됩니다.

<!--
## Step 2: Create the app shell
-->
## 2단계: 애플리케이션 기본 틀 생성하기

<!--
Use the CLI to automatically create the app shell.
-->
다음 명령을 실행하면 애플리케이션의 기본 틀이 생성합니다.

<code-example format="." language="bash" linenums="false">
ng generate app-shell --client-project my-app --universal-project server-app
</code-example>

<!--
* `my-app` takes the name of your client application.
* `server-app` takes the name of the Universal (or server) application.

After running this command you will notice that the `angular.json` configuration file has been updated to add two new targets, with a few other changes.
-->
* `my-app`은 클라이언트 애플리케이션의 이름을 의미합니다.
* `server-app`은 Universal 앱(서버 사이드 앱)의 이름을 의미합니다.

<code-example format="." language="none" linenums="false">
"server": {
  "builder": "@angular-devkit/build-angular:server",
  "options": {
    "outputPath": "dist/my-app-server",
    "main": "src/main.server.ts",
    "tsConfig": "tsconfig.server.json"
  }
},
"app-shell": {
  "builder": "@angular-devkit/build-angular:app-shell",
  "options": {
    "browserTarget": "my-app:build",
    "serverTarget": "my-app:server",
    "route": "shell"
  }
}
</code-example>

<!--
## Step 3: Verify the app is built with the shell content
-->
## 3단계: 빌드 확인하기

<!--
Use the CLI to build the `app-shell` target.
-->
이제 다음 명령을 실행해서 `app-shell`이 제대로 빌드되는지 확인해 봅시다.

<code-example format="." language="bash" linenums="false">
ng run my-app:app-shell
</code-example>

<!--
To verify the build output, open `dist/my-app/index.html`. Look for default text `app-shell works!` to show that the app shell route was rendered as part of the output.
-->
빌드 결과물은 `dist/my-app/index.html` 파일로 확인하면 됩니다. 애플리케이션이 제대로 실행된다면 화면에 `app-shell works!`라는 문구가 표시될 것입니다.
