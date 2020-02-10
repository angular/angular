<<<<<<< HEAD
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
=======
# Angular Ivy

Ivy is the code name for Angular's [next-generation compilation and rendering pipeline](https://blog.angular.io/a-plan-for-version-8-0-and-ivy-b3318dfc19f7).
With the version 9 release of Angular, the new compiler and runtime instructions are used by default instead of the older compiler and runtime, known as View Engine.

<div class="alert is-helpful">

Learn more about the [Compiler](https://www.youtube.com/watch?v=anphffaCZrQ) and [Runtime](https://www.youtube.com/watch?v=S0o-4yc2n-8) in these videos from our team.

>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

</div>

<<<<<<< HEAD
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
=======
{@a aot-and-ivy}
## AOT and Ivy

AOT compilation with Ivy is faster and should be used by default.
In the `angular.json` workspace configuration file, set the default build options for your project to always use AOT compilation.
When using application internationalization (i18n) with Ivy, [translation merging](guide/i18n#merge) also requires the use of AOT compilation.

<code-example language="json" header="angular.json">
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

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
</code-example>

## Ivy and libraries

Ivy applications can be built with libraries that were created with the View Engine compiler.
This compatibility is provided by a tool known as the Angular compatibility compiler (`ngcc`).
CLI commands run `ngcc` as needed when performing an Angular build.

For more information on how to publish libraries see [Publishing your Library](guide/creating-libraries#publishing-your-library).

{@a speeding-up-ngcc-compilation}
### Speeding up ngcc compilation

The standalone `ngcc` program can run in parallel over your third party modules, making it more efficient than letting Angular CLI run it as needed.

You can run `ngcc` after each installation of node_modules by adding a `postinstall` [npm script](https://docs.npmjs.com/misc/scripts):

<code-example language="json" header="package.json">
{
  "scripts": {
    "postinstall": "ngcc --properties es2015 browser module main --first-only --create-ivy-entry-points"
  }
}
</code-example>

<div class="alert is-important">

The `postinstall` script will run on every installation of `node_modules`, including those performed by `ng update` and `ng add`.

If you perform multiple installs in a row, this can end up being slower than letting Angular CLI run `ngcc` on builds.

</div>

{@a maintaining-library-compatibility}
### Maintaining library compatibility

If you are a library author, you should keep using the View Engine compiler as of version 9.
By having all libraries continue to use View Engine, you will maintain compatibility with default v9 applications that use Ivy, as well as with applications that have opted to continue using View Engine.

See the [Creating Libraries](guide/creating-libraries) guide for more on how to compile or bundle your Angular library.
When you use the tools integrated into the Angular CLI or `ng-packagr`, your library will always be built the right way automatically.

{@a ivy-and-universal-app-shell}
## Ivy and Universal/App shell
In version 9, the server builder which is used for [App shell](guide/app-shell) and [Angular Universal](guide/universal) has the `bundleDependencies` option enabled by default.
If you opt-out of bundling dependencies you will need to run the standalone Angular compatibility compiler (`ngcc`). This is needed because otherwise Node will be unable to resolve the Ivy version of the packages.

You can run `ngcc` after each installation of node_modules by adding a `postinstall` [npm script](https://docs.npmjs.com/misc/scripts):

<code-example language="json" header="package.json">
{
  "scripts": {
    "postinstall": "ngcc"
  }
}
</code-example>

<div class="alert is-important">

Don't use `--create-ivy-entry-points` as this will cause Node not to resolve the Ivy version of the packages correctly.

</div>

{@a opting-out-of-angular-ivy}
## Opting out of Ivy in version 9

In version 9, Ivy is the default.
For compatibility with current workflows during the update process, you can choose to opt out of Ivy and continue using the previous compiler, View Engine.

<div class="alert is-helpful">

Before disabling Ivy, check out the debugging recommendations in the [Ivy Compatibility Guide](guide/ivy-compatibility#debugging).

</div>

To opt out of Ivy, change the `angularCompilerOptions` in your project's TypeScript configuration, most commonly located at `tsconfig.app.json` at the root of the workspace.

The value of the `enableIvy` flag is set to `true` by default, as of version 9.

The following example shows how to set the `enableIvy` option to `false` in order to opt out of Ivy.

<code-example language="json" header="tsconfig.app.json">
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": []
  },
  "files": [
    "src/main.ts",
    "src/polyfills.ts"
  ],
  "include": [
    "src/**/*.d.ts"
  ],
  "angularCompilerOptions": {
    "enableIvy": false
  }
}
</code-example>

<div class="alert is-important">

If you disable Ivy, you might also want to reconsider whether to make AOT compilation the default for your application development, as described [above](#aot-and-ivy).

To revert the compiler default, set the build option `aot: false` in the `angular.json` configuration file.

</div>

If you disable Ivy and the project uses internationalization, you can also remove the `@angular/localize` runtime component from the project's polyfills file located be default at `src/polyfills.ts`.

To remove, delete the `import '@angular/localize/init';` line from the polyfills file.

<code-example language="typescript" header="polyfills.ts">
/***************************************************************************************************
 * Load `$localize` onto the global scope - used if i18n tags appear in Angular templates.
 */
import '@angular/localize/init';
</code-example>

{@a using-ssr-without-angular-ivy}
### Using SSR without Ivy

If you opt out of Ivy and your application uses  [Angular Universal](guide/universal) to render Angular applications on the server, you must also change the way the server performs bootstrapping.

The following example shows how you modify the `server.ts` file to provide the `AppServerModuleNgFactory` as the bootstrap module.

* Import `AppServerModuleNgFactory` from the `app.server.module.ngfactory` virtual file.
* Set `bootstrap: AppServerModuleNgFactory` in the `ngExpressEngine` call.

<code-example language="typescript" header="server.ts">
import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';

import { APP_BASE_HREF } from '@angular/common';

import { AppServerModuleNgFactory } from './src/app/app.server.module.ngfactory';

// The Express app is exported so that it can be used by serverless Functions.
export function app() {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/ivy-test/browser');

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModuleNgFactory,
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Example Express Rest API endpoints
  // app.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render('index', { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });

  return server;
}

function run() {
  const port = process.env.PORT || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
if (mainModule && mainModule.filename === __filename) {
  run();
}

<<<<<<< HEAD
<!--
To stop using the Ivy compiler, set `enableIvy` to `false` in `tsconfig.app.json`, or remove it completely. Also remove `"aot": true` from your default build options if you didn't have it there before.
-->
이후에 Ivy 컴파일러를 사용하지 않으려면 `tsconfig.app.json` 파일에 설정한 `enableIvy` 옵션을 `false`로 설정하거나 이 옵션 자체를 제거하면 됩니다. 그리고 이전에는 AOT 컴파일러를 사용하지 않았지만 Ivy를 도입하면서 `"aot": true` 옵션을 추가했다면 이 옵션도 제거하는 것이 좋습니다.
=======
export * from './src/main.server';
</code-example>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
