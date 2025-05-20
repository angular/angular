/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export enum ApplicationComplexity {
  Basic = 1,
  Medium = 2,
  Advanced = 3,
}

export interface Step {
  step: string;
  action: string;
  possibleIn: number;
  necessaryAsOf: number;
  level: ApplicationComplexity;
  angularCLI?: boolean;
  ngUpgrade?: boolean;
  pwa?: boolean;
  material?: boolean;
  renderedStep?: string;
  windows?: boolean;
}

export const RECOMMENDATIONS: Step[] = [
  {
    possibleIn: 200,
    necessaryAsOf: 400,
    level: ApplicationComplexity.Basic,
    step: 'Extends OnInit',
    action:
      "Ensure you don't use `extends OnInit`, or use `extends` with any lifecycle event. Instead use `implements <lifecycle event>.`",
  },
  {
    possibleIn: 200,
    necessaryAsOf: 400,
    level: ApplicationComplexity.Advanced,
    step: 'Deep Imports',
    action:
      'Stop using deep imports, these symbols are now marked with ɵ and are not part of our public API.',
  },
  {
    possibleIn: 200,
    necessaryAsOf: 400,
    level: ApplicationComplexity.Advanced,
    step: 'invokeElementMethod',
    action:
      'Stop using `Renderer.invokeElementMethod` as this method has been removed. There is not currently a replacement.',
  },
  {
    possibleIn: 400,
    necessaryAsOf: 400,
    level: ApplicationComplexity.Basic,
    step: 'Non Animations Module',
    action:
      'If you use animations in your application, you should import `BrowserAnimationsModule` from `@angular/platform-browser/animations` in your App `NgModule`.',
  },
  {
    possibleIn: 400,
    necessaryAsOf: 400,
    level: ApplicationComplexity.Medium,
    step: 'Native Form Validation',
    action:
      'Angular began adding a `novalidate` attribute to form elements when you include `FormsModule`. To re-enable native forms behaviors, use `ngNoForm` or add `ngNativeValidate`.',
  },
  {
    possibleIn: 400,
    necessaryAsOf: 400,
    level: ApplicationComplexity.Advanced,
    step: 'RootRenderer',
    action: 'Replace `RootRenderer` with `RendererFactoryV2` instead.',
  },
  {
    possibleIn: 400,
    necessaryAsOf: 400,
    level: ApplicationComplexity.Advanced,
    ngUpgrade: true,
    step: 'downgradeInjectable',
    action: 'The return value of `upgrade/static/downgradeInjectable` has changed.',
  },
  {
    possibleIn: 400,
    necessaryAsOf: 400,
    level: ApplicationComplexity.Advanced,
    step: 'Animations Tests',
    action:
      'If you use Animations and tests, add `mods[1].NoopAnimationsModule` to your `TestBed.initTestEnvironment` call.',
  },
  {
    possibleIn: 200,
    necessaryAsOf: 500,
    level: ApplicationComplexity.Advanced,
    step: 'DefaultIterableDiffer',
    action:
      'Stop using `DefaultIterableDiffer`, `KeyValueDiffers#factories`, or `IterableDiffers#factories`',
  },
  {
    possibleIn: 400,
    necessaryAsOf: 500,
    level: ApplicationComplexity.Basic,
    step: 'Template Tag',
    action: 'Rename your `template` tags to `ng-template`',
  },
  {
    possibleIn: 400,
    necessaryAsOf: 500,
    level: ApplicationComplexity.Medium,
    step: 'OpaqueToken',
    action: 'Replace any `OpaqueToken` with `InjectionToken`.',
  },
  {
    possibleIn: 400,
    necessaryAsOf: 500,
    level: ApplicationComplexity.Advanced,
    step: 'DifferFactory',
    action: 'If you call `DifferFactory.create(...)` remove the `ChangeDetectorRef` argument.',
  },
  {
    possibleIn: 400,
    necessaryAsOf: 500,
    level: ApplicationComplexity.Advanced,
    step: 'ErrorHandler Parameter',
    action: 'Stop passing any arguments to the constructor for ErrorHandler',
  },
  {
    possibleIn: 400,
    necessaryAsOf: 500,
    level: ApplicationComplexity.Advanced,
    step: 'ngProbeToken',
    action:
      'If you use ngProbeToken, make sure you import it from @angular/core instead of @angular/platform-browser',
  },
  {
    possibleIn: 400,
    necessaryAsOf: 500,
    level: ApplicationComplexity.Advanced,
    step: 'TrackByFn',
    action: 'If you use TrackByFn, instead use TrackByFunction',
  },
  {
    possibleIn: 500,
    necessaryAsOf: 500,
    level: ApplicationComplexity.Basic,
    step: 'i18n Pipe Change',
    action:
      'If you rely on the date, currency, decimal, or percent pipes, in 5 you will see minor changes to the format. For applications using locales other than en-us you will need to import it and optionally `locale_extended_fr` from `@angular/common/i18n_data/locale_fr` and registerLocaleData(local).',
  },
  {
    possibleIn: 500,
    necessaryAsOf: 500,
    level: ApplicationComplexity.Advanced,
    step: 'gendir',
    action:
      'Do not rely on `gendir`, instead look at using `skipTemplateCodeGen`. <a href=https://github.com/angular/angular/issues/19339#issuecomment-332607471" target="_blank">Read More</a>',
  },
  {
    possibleIn: 220,
    necessaryAsOf: 600,
    level: ApplicationComplexity.Basic,
    ngUpgrade: true,
    step: 'Dynamic ngUpgrade',
    action:
      'Replace `downgradeComponent`, `downgradeInjectable`, `UpgradeComponent`, and `UpgradeModule` imported from `@angular/upgrade`. Instead use the new versions in `@angular/upgrade/static`',
  },
  {
    possibleIn: 400,
    necessaryAsOf: 600,
    level: ApplicationComplexity.Medium,
    step: 'Animations in Core',
    action:
      'If you import any animations services or tools from @angular/core, you should import them from @angular/animations',
  },
  {
    possibleIn: 400,
    necessaryAsOf: 600,
    level: ApplicationComplexity.Advanced,
    step: 'ngOutletContext',
    action: 'Replace `ngOutletContext` with `ngTemplateOutletContext`.',
  },
  {
    possibleIn: 400,
    necessaryAsOf: 600,
    level: ApplicationComplexity.Advanced,
    step: 'collectionChangeRecord',
    action: 'Replace `CollectionChangeRecord` with `IterableChangeRecord`',
  },
  {
    possibleIn: 400,
    necessaryAsOf: 900,
    level: ApplicationComplexity.Advanced,
    step: 'Renderer',
    action: 'Anywhere you use Renderer, now use Renderer2',
  },
  {
    possibleIn: 400,
    necessaryAsOf: 600,
    level: ApplicationComplexity.Advanced,
    step: 'Router Query Params',
    action: 'If you use preserveQueryParams, instead use queryParamsHandling',
  },
  {
    possibleIn: 430,
    necessaryAsOf: 800,
    level: ApplicationComplexity.Basic,
    step: 'Http',
    action:
      "If you use the legacy `HttpModule` and the `Http` service, switch to `HttpClientModule` and the `HttpClient` service. HttpClient simplifies the default ergonomics (you don't need to map to JSON anymore) and now supports typed return values and interceptors. Read more on [angular.dev](https://angular.io/guide/http).",
  },
  {
    possibleIn: 430,
    necessaryAsOf: 600,
    level: ApplicationComplexity.Advanced,
    step: 'DOCUMENT in @angular/platform-browser',
    action:
      'If you use DOCUMENT from @angular/platform-browser, you should start to import this from @angular/common',
  },
  {
    possibleIn: 500,
    necessaryAsOf: 600,
    level: ApplicationComplexity.Advanced,
    step: 'ReflectiveInjector',
    action: 'Anywhere you use ReflectiveInjector, now use StaticInjector',
  },
  {
    possibleIn: 500,
    necessaryAsOf: 550,
    level: ApplicationComplexity.Medium,
    step: 'Whitespace',
    action:
      'Choose a value of `off` for `preserveWhitespaces` in your `tsconfig.json` under the `angularCompilerOptions` key to gain the benefits of this setting, which was set to `off` by default in v6.',
  },
  {
    possibleIn: 600,
    necessaryAsOf: 600,
    level: ApplicationComplexity.Basic,
    step: 'node 8',
    action:
      'Make sure you are using <a href="http://www.hostingadvice.com/how-to/update-node-js-latest-version/" target="_blank">Node 8 or later</a>',
  },
  {
    possibleIn: 600,
    necessaryAsOf: 600,
    level: ApplicationComplexity.Basic,
    windows: false,
    step: 'Update to CLI v6',
    action:
      'Update your Angular CLI, and migrate the configuration to the <a href="https://github.com/angular/angular-cli/wiki/angular-workspace" target="_blank">new angular.json format</a> by running the following:<br/><br/>`NG_DISABLE_VERSION_CHECK=1 npx @angular/cli@6 update @angular/cli@6`<br/>',
  },
  {
    possibleIn: 600,
    necessaryAsOf: 600,
    level: ApplicationComplexity.Basic,
    windows: true,
    step: 'Update to CLI v6',
    action:
      'Update your Angular CLI, and migrate the configuration to the <a href="https://github.com/angular/angular-cli/wiki/angular-workspace" target="_blank">new angular.json format</a> by running the following:<br/><br/>`cmd /C "set "NG_DISABLE_VERSION_CHECK=1" && npx @angular/cli@6 update @angular/cli@6 @angular/core@6"`<br/>',
  },
  {
    possibleIn: 600,
    necessaryAsOf: 600,
    level: ApplicationComplexity.Medium,
    step: 'cli v6 scripts',
    action:
      'Update any `scripts` you may have in your `package.json` to use the latest Angular CLI commands. All CLI commands now use two dashes for flags (eg `ng build --prod --source-map`) to be POSIX compliant.',
  },
  {
    possibleIn: 600,
    necessaryAsOf: 600,
    level: ApplicationComplexity.Basic,
    windows: false,
    step: 'Update to Angular v6',
    action:
      "Update all of your Angular framework packages to v6, and the correct version of RxJS and TypeScript.<br/><br/>`NG_DISABLE_VERSION_CHECK=1 npx @angular/cli@6 update @angular/core@6`<br/><br/>After the update, TypeScript and RxJS will more accurately flow types across your application, which may expose existing errors in your application's typings",
  },
  {
    possibleIn: 600,
    necessaryAsOf: 600,
    level: ApplicationComplexity.Basic,
    windows: true,
    step: 'Update to Angular v6',
    action:
      'Update all of your Angular framework packages to v6, and the correct version of RxJS and TypeScript.<br/><br/>`cmd /C "set "NG_DISABLE_VERSION_CHECK=1" && npx @angular/cli@6 update @angular/cli@6 @angular/core@6"`<br/><br/>After the update, TypeScript and RxJS will more accurately flow types across your application, which may expose existing errors in your application\'s typings',
  },
  {
    possibleIn: 600,
    necessaryAsOf: 600,
    level: ApplicationComplexity.Advanced,
    step: 'forms v6',
    action:
      'In Angular Forms, `AbstractControl#statusChanges` now emits an event of `PENDING` when you call `AbstractControl#markAsPending`. Ensure that if you are filtering or checking events from `statusChanges` that you account for the new event when calling `markAsPending`.',
  },
  {
    possibleIn: 600,
    necessaryAsOf: 600,
    level: ApplicationComplexity.Advanced,
    step: 'animations timing',
    action:
      'If you use totalTime from an `AnimationEvent` within a disabled Zone, it will no longer report a time of 0. To detect if an animation event is reporting a disabled animation then the `event.disabled` property can be used instead.',
  },
  {
    possibleIn: 600,
    necessaryAsOf: 700,
    level: ApplicationComplexity.Advanced,
    step: 'ngModel on form control',
    action:
      'Support for using the ngModel input property and ngModelChange event with reactive form directives has been deprecated in v6 and removed in v7.',
  },
  {
    possibleIn: 600,
    necessaryAsOf: 600,
    level: ApplicationComplexity.Medium,
    step: 'ngModelChange order',
    action:
      'ngModelChange is now emitted after the value/validity is updated on its control instead of before to better match expectations. If you rely on the order of these events, you will need to begin tracking the old value in your component.',
  },
  {
    possibleIn: 600,
    necessaryAsOf: 600,
    level: ApplicationComplexity.Basic,
    windows: false,
    material: true,
    step: 'Update Dependencies for v6',
    action:
      'Update Angular Material to the latest version.<br/><br/>`NG_DISABLE_VERSION_CHECK=1 npx @angular/cli@6 update @angular/material@6`<br/><br/>This will also automatically migrate deprecated APIs.',
  },
  {
    possibleIn: 600,
    necessaryAsOf: 600,
    level: ApplicationComplexity.Basic,
    windows: true,
    material: true,
    step: 'Update Dependencies for v6',
    action:
      'Update Angular Material to the latest version.<br/><br/>`cmd /C "set "NG_DISABLE_VERSION_CHECK=1" && npx @angular/cli@6 update @angular/material@6"`<br/><br/>This will also automatically migrate deprecated APIs.',
  },
  {
    possibleIn: 600,
    necessaryAsOf: 600,
    level: ApplicationComplexity.Medium,
    step: 'strictPropertyInitializer',
    action:
      'If you have TypeScript configured to be strict (if you have set `strict` to `true` in your `tsconfig.json` file), update your `tsconfig.json` to disable `strictPropertyInitialization` or move property initialization from `ngOnInit` to your constructor. You can learn more about this flag on the <a href="https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#strict-class-initialization">TypeScript 2.7 release notes</a>.',
  },
  {
    possibleIn: 600,
    necessaryAsOf: 700,
    level: ApplicationComplexity.Basic,
    step: 'update to RxJS 6',
    action:
      'Remove deprecated RxJS 5 features using <a href="https://github.com/ReactiveX/rxjs-tslint" target="_blank">rxjs-tslint auto update rules</a><br/><br/>For most applications this will mean running the following two commands:<br/><br/>`npx rxjs-tslint`<br/>`rxjs-5-to-6-migrate -p src/tsconfig.app.json`',
  },
  {
    possibleIn: 600,
    necessaryAsOf: 800,
    level: ApplicationComplexity.Medium,
    step: 'remove rxjs-compat',
    action: 'Once you and all of your dependencies have updated to RxJS 6, remove `rxjs-compat`.',
  },
  {
    possibleIn: 610,
    necessaryAsOf: 800,
    level: ApplicationComplexity.Medium,
    step: 'use files instead of versionedFiles',
    action:
      'If you use the Angular Service worker, migrate any `versionedFiles` to the `files` array. The behavior is the same.',
  },
  {
    possibleIn: 700,
    necessaryAsOf: 700,
    level: ApplicationComplexity.Basic,
    step: 'TypeScript 3.1',
    action:
      'Angular now uses TypeScript 3.1, read more about any potential breaking changes: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-1.html',
  },
  {
    possibleIn: 700,
    necessaryAsOf: 700,
    level: ApplicationComplexity.Basic,
    step: 'Node 10',
    action:
      'Angular has now added support for Node 10: https://nodejs.org/en/blog/release/v10.0.0/',
  },
  {
    possibleIn: 700,
    necessaryAsOf: 700,
    level: ApplicationComplexity.Basic,
    windows: false,
    step: 'v7 update',
    action:
      'Update to v7 of the core framework and CLI by running `NG_DISABLE_VERSION_CHECK=1 npx @angular/cli@7 update @angular/cli@7 @angular/core@7` in your terminal.',
  },
  {
    possibleIn: 700,
    necessaryAsOf: 700,
    level: ApplicationComplexity.Basic,
    windows: true,
    step: 'v7 update',
    action:
      'Update to v7 of the core framework and CLI by running `cmd /C "set "NG_DISABLE_VERSION_CHECK=1" && npx @angular/cli@7 update @angular/cli@7 @angular/core@7"` in your terminal.',
  },
  {
    possibleIn: 700,
    necessaryAsOf: 700,
    level: ApplicationComplexity.Basic,
    windows: false,
    material: true,
    step: 'v7 material update',
    action:
      'Update Angular Material to v7 by running `NG_DISABLE_VERSION_CHECK=1 npx @angular/cli@7 update @angular/material@7` in your terminal. You should test your application for sizing and layout changes.',
  },
  {
    possibleIn: 700,
    necessaryAsOf: 700,
    level: ApplicationComplexity.Basic,
    windows: true,
    material: true,
    step: 'v7 material update',
    action:
      'Update Angular Material to v7 by running `cmd /C "set "NG_DISABLE_VERSION_CHECK=1" && npx @angular/cli@7 update @angular/material@7"` in your terminal. You should test your application for sizing and layout changes.',
  },
  {
    possibleIn: 700,
    necessaryAsOf: 700,
    level: ApplicationComplexity.Medium,
    material: true,
    step: 'v7 material changes',
    action:
      "If you use screenshot tests, you'll need to regenerate your screenshot golden files as many minor visual tweaks have landed.",
  },
  {
    possibleIn: 700,
    necessaryAsOf: 800,
    level: ApplicationComplexity.Advanced,
    material: true,
    step: 'v7 material deprecations',
    action:
      'Stop using `matRippleSpeedFactor` and `baseSpeedFactor` for ripples, using Animation config instead.',
  },
  {
    possibleIn: 800,
    necessaryAsOf: 800,
    level: ApplicationComplexity.Basic,
    windows: false,
    step: 'v8 update',
    action:
      'Update to version 8 of the core framework and CLI by running `NG_DISABLE_VERSION_CHECK=1 npx @angular/cli@8 update @angular/cli@8 @angular/core@8` in your terminal and review and commit the changes.',
  },
  {
    possibleIn: 800,
    necessaryAsOf: 800,
    level: ApplicationComplexity.Basic,
    windows: true,
    step: 'v8 update',
    action:
      'Update to version 8 of the core framework and CLI by running `cmd /C "set "NG_DISABLE_VERSION_CHECK=1" && npx @angular/cli@8 update @angular/cli@8 @angular/core@8"` in your terminal and review and commit the changes.',
  },
  {
    possibleIn: 800,
    necessaryAsOf: 800,
    level: ApplicationComplexity.Basic,
    step: 'use ::ng-deep instead of /deep/',
    action:
      'Replace `/deep/` with `::ng-deep` in your styles, [read more about angular component styles and ::ng-deep](https://angular.io/guide/component-styles#deprecated-deep--and-ng-deep). `/deep/` and `::ng-deep` both are deprecated but using `::ng-deep` is preferred until the shadow-piercing descendant combinator is [removed from browsers and tools](https://www.chromestatus.com/features/6750456638341120) completely.',
  },
  {
    possibleIn: 800,
    necessaryAsOf: 800,
    level: ApplicationComplexity.Basic,
    step: 'TypeScript 3.4',
    action:
      'Angular now uses TypeScript 3.4, [read more about errors that might arise from improved type checking](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html).',
  },
  {
    possibleIn: 800,
    necessaryAsOf: 800,
    level: ApplicationComplexity.Basic,
    step: 'node 10',
    action:
      'Make sure you are using <a href="http://www.hostingadvice.com/how-to/update-node-js-latest-version/" target="_blank">Node 10 or later</a>.',
  },
  {
    possibleIn: 800,
    necessaryAsOf: 800,
    level: ApplicationComplexity.Basic,
    step: 'Differential Loading',
    action:
      "The CLI's build command now automatically creates a modern ES2015 build with minimal polyfills and a compatible ES5 build for older browsers, and loads the appropriate file based on the browser.  You may opt-out of this change by setting your `target` back to `es5` in your `tsconfig.json`. Learn more on [angular.io](https://angular.io/guide/deployment#differential-loading).",
  },
  {
    possibleIn: 800,
    necessaryAsOf: 800,
    level: ApplicationComplexity.Basic,
    step: 'CLI Telemetry',
    action:
      'When using new versions of the CLI, you will be asked if you want to opt-in to share your CLI usage data. You can also add your own Google Analytics account. This lets us make better decisions about which CLI features to prioritize, and measure the impact of our improvements. Learn more on [angular.io](https://angular.io/analytics).',
  },
  {
    possibleIn: 800,
    necessaryAsOf: 800,
    level: ApplicationComplexity.Basic,
    step: 'static query timing',
    action:
      "If you use `ViewChild` or `ContentChild`, we're updating the way we resolve these queries to give developers more control. You must now specify that change detection should run before results are set. Example: `@ContentChild('foo', {static: false}) foo !: ElementRef;`. `ng update` will update your queries automatically, but it will err on the side of making your queries `static` for compatibility. Learn more on [angular.io](https://angular.io/guide/static-query-migration).",
  },
  {
    possibleIn: 800,
    necessaryAsOf: 800,
    level: ApplicationComplexity.Basic,
    windows: false,
    material: true,
    step: 'v8 material update',
    action:
      'Update Angular Material to version 8 by running `NG_DISABLE_VERSION_CHECK=1 npx @angular/cli@8 update @angular/material@8` in your terminal.',
  },
  {
    possibleIn: 800,
    necessaryAsOf: 800,
    level: ApplicationComplexity.Basic,
    windows: true,
    material: true,
    step: 'v8 material update',
    action:
      'Update Angular Material to version 8 by running `cmd /C "set "NG_DISABLE_VERSION_CHECK=1" && npx @angular/cli@8 update @angular/material@8"` in your terminal.',
  },
  {
    possibleIn: 800,
    necessaryAsOf: 900,
    level: ApplicationComplexity.Basic,
    material: true,
    step: 'deep imports',
    action:
      'Instead of importing from `@angular/material`, you should import deeply from the specific component. E.g. `@angular/material/button`. `ng update` will do this automatically for you.',
  },
  {
    possibleIn: 800,
    necessaryAsOf: 900,
    level: ApplicationComplexity.Basic,
    step: 'new loadChildren',
    action:
      'For lazy loaded modules via the router, make sure you are [using dynamic imports](https://angular.io/guide/deprecations#loadchildren-string-syntax). Importing via string is removed in v9. `ng update` should take care of this automatically. Learn more on [angular.io](https://angular.io/guide/deprecations#loadchildren-string-syntax).',
  },
  {
    possibleIn: 800,
    necessaryAsOf: 900,
    level: ApplicationComplexity.Advanced,
    step: 'platform deprecated',
    action:
      "We are deprecating support for `@angular/platform-webworker`, as it has been incompatible with the CLI. Running Angular's rendering architecture in a web worker did not meet developer needs. You can still use web workers with Angular. Learn more in our [web worker guide](https://v9.angular.io/guide/web-worker). If you have use cases where you need this, let us know at devrel@angular.io!",
  },
  {
    possibleIn: 800,
    necessaryAsOf: 800,
    level: ApplicationComplexity.Advanced,
    step: 'node-sass',
    action:
      'We have switched from the native Sass compiler to the JavaScript compiler. To switch back to the native version, install it as a devDependency: `npm install node-sass --save-dev`.',
  },
  {
    possibleIn: 800,
    necessaryAsOf: 800,
    level: ApplicationComplexity.Advanced,
    step: 'schematics async',
    action:
      'If you are building your own Schematics, they have previously been *potentially* asynchronous. As of 8.0, all schematics will be asynchronous.',
  },
  {
    possibleIn: 900,
    necessaryAsOf: 900,
    level: ApplicationComplexity.Basic,
    step: 'node 10.13',
    action:
      'Make sure you are using <a href="http://www.hostingadvice.com/how-to/update-node-js-latest-version/" target="_blank">Node 10.13 or later</a>.',
  },
  {
    possibleIn: 900,
    necessaryAsOf: 900,
    level: ApplicationComplexity.Basic,
    windows: false,
    step: 'cli v8 latest',
    action:
      'Run `NG_DISABLE_VERSION_CHECK=1 npx @angular/cli@8 update @angular/core@8 @angular/cli@8` in your workspace directory to update to the latest 8.x version of `@angular/core` and `@angular/cli` and commit these changes.',
  },
  {
    possibleIn: 900,
    necessaryAsOf: 900,
    level: ApplicationComplexity.Basic,
    windows: true,
    step: 'cli v8 latest',
    action:
      'Run `cmd /C "set "NG_DISABLE_VERSION_CHECK=1" && npx @angular/cli@8 update @angular/cli@8 @angular/core@8"` in your workspace directory to update to the latest 8.x version of `@angular/core` and `@angular/cli` and commit these changes.',
  },
  {
    possibleIn: 900,
    necessaryAsOf: 900,
    level: ApplicationComplexity.Medium,
    step: 'create commits',
    action:
      'You can optionally pass the `--create-commits` (or `-C`) flag to [ng update](https://angular.io/cli/update) commands to create a git commit per individual migration.',
  },
  {
    possibleIn: 900,
    necessaryAsOf: 900,
    level: ApplicationComplexity.Basic,
    windows: false,
    step: 'ng update v9',
    action:
      'Run `NG_DISABLE_VERSION_CHECK=1 npx @angular/cli@9 update @angular/core@9 @angular/cli@9` which should bring you to version 9 of Angular.',
  },
  {
    possibleIn: 900,
    necessaryAsOf: 900,
    level: ApplicationComplexity.Basic,
    windows: true,
    step: 'ng update v9',
    action:
      'Run `cmd /C "set "NG_DISABLE_VERSION_CHECK=1" && npx @angular/cli@9 update @angular/cli@9 @angular/core@9"` which should bring you to version 9 of Angular.',
  },
  {
    possibleIn: 900,
    necessaryAsOf: 900,
    level: ApplicationComplexity.Basic,
    step: 'typescript 3.8',
    action:
      'Your project has now been updated to TypeScript 3.8, read more about new compiler checks and errors that might require you to fix issues in your code in the [TypeScript 3.7](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html) or [TypeScript 3.8](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html) announcements.',
  },
  {
    possibleIn: 900,
    necessaryAsOf: 900,
    level: ApplicationComplexity.Basic,
    windows: false,
    material: true,
    step: 'update @angular/material',
    action: 'Run `NG_DISABLE_VERSION_CHECK=1 npx @angular/cli@9 update @angular/material@9`.',
  },
  {
    possibleIn: 900,
    necessaryAsOf: 900,
    level: ApplicationComplexity.Basic,
    windows: true,
    material: true,
    step: 'update @angular/material',
    action:
      'Run `cmd /C "set "NG_DISABLE_VERSION_CHECK=1" && npx @angular/cli@9 update @angular/material@9"`.',
  },
  {
    possibleIn: 900,
    necessaryAsOf: 900,
    level: ApplicationComplexity.Advanced,
    windows: false,
    step: 'update @nguniversal/hapi-engine',
    action:
      'If you use Angular Universal, run `NG_DISABLE_VERSION_CHECK=1 npx @angular/cli@9 update @nguniversal/hapi-engine@9` or `NG_DISABLE_VERSION_CHECK=1 npx @angular/cli@9 update @nguniversal/express-engine@9` depending on the engine you use. This step may require the `--force` flag if any of your third-party dependencies have not updated the Angular version of their peer dependencies.',
  },
  {
    possibleIn: 900,
    necessaryAsOf: 900,
    level: ApplicationComplexity.Advanced,
    windows: true,
    step: 'update @nguniversal/hapi-engine',
    action:
      'If you use Angular Universal, run `cmd /C "set "NG_DISABLE_VERSION_CHECK=1" && npx @angular/cli@9 update @nguniversal/hapi-engine@9"` or `cmd /C "set "NG_DISABLE_VERSION_CHECK=1" && npx @angular/cli@9 update @nguniversal/express-engine@9"` depending on the engine you use. This step may require the `--force` flag if any of your third-party dependencies have not updated the Angular version of their peer dependencies.',
  },
  {
    possibleIn: 900,
    necessaryAsOf: 900,
    level: ApplicationComplexity.Basic,
    step: 'dependencies update',
    action:
      'If your project depends on other Angular libraries, we recommend that you consider updating to their latest version. In some cases this update might be required in order to resolve API incompatibilities. Consult `ng update` or `npm outdated` to learn about your outdated libraries.',
  },
  {
    possibleIn: 900,
    necessaryAsOf: 900,
    level: ApplicationComplexity.Basic,
    step: 'ivy update',
    action:
      'During the update to version 9, your project was transformed as necessary via code migrations in order to remove any incompatible or deprecated API calls from your code base. You can now review these changes, and consult the [Updating to version 9 guide](https://v9.angular.io/guide/updating-to-version-9) to learn more about the changes.',
  },
  {
    possibleIn: 900,
    necessaryAsOf: 900,
    level: ApplicationComplexity.Medium,
    step: 'stylesUpdate',
    action:
      'Bound CSS styles and classes previously were applied with a "last change wins" strategy, but now follow a defined precedence. Learn more about [Styling Precedence](https://angular.io/guide/attribute-binding#styling-precedence).',
  },
  {
    possibleIn: 900,
    necessaryAsOf: 900,
    level: ApplicationComplexity.Advanced,
    step: 'ModuleWithProviders',
    action:
      'If you are a library author and you had a method returning `ModuleWithProviders`  (typically via a method named `forRoot()`), you will need to specify the generic type. Learn more [angular.io](https://v9.angular.io/guide/deprecations#modulewithproviders-type-without-a-generic)',
  },
  {
    possibleIn: 800,
    necessaryAsOf: 900,
    level: ApplicationComplexity.Advanced,
    step: 'wtf',
    action:
      'Support for web tracing framework in Angular was deprecated in version 8. You should stop using any of the `wtf*` APIs. To do performance tracing, we recommend using [browser performance tools](https://developers.google.com/web/tools/lighthouse/audits/user-timing).',
  },
  {
    possibleIn: 800,
    necessaryAsOf: 900,
    level: ApplicationComplexity.Medium,
    step: 'es5browser',
    action:
      'Remove any `es5BrowserSupport` flags in your `angular.json` and set your `target` to `es2015` in your `tsconfig.json`. Angular now uses your browserslist to determine if an ES5 build is needed. `ng update` will migrate you automatically.',
  },
  {
    possibleIn: 900,
    necessaryAsOf: 900,
    level: ApplicationComplexity.Medium,
    step: 'ngForm selector',
    action:
      'If you use `ngForm` element selector to create Angular Forms, you should instead use `ng-form`.',
  },
  {
    possibleIn: 900,
    necessaryAsOf: 900,
    level: ApplicationComplexity.Advanced,
    step: 'typings compilation',
    action:
      'We have updated the `tsconfig.app.json` to limit the files compiled. If you rely on other files being included in the compilation, such as a `typings.d.ts` file, you need to manually add it to the compilation.',
  },
  {
    possibleIn: 900,
    necessaryAsOf: 1000,
    level: ApplicationComplexity.Medium,
    step: 'debug',
    action:
      'With Angular 9 Ivy is now the default rendering engine, for any compatibility problems that might arise, read the [Ivy compatibility guide](https://v9.angular.io/guide/ivy-compatibility).',
  },
  {
    possibleIn: 900,
    necessaryAsOf: 900,
    level: ApplicationComplexity.Advanced,
    step: 'express-universal-server',
    action:
      'If you use Angular Universal with  `@nguniversal/express-engine` or `@nguniversal/hapi-engine`, several backup files will be created. One of them for `server.ts`. If this file defers from the default one, you may need to copy some changes from the `server.ts.bak` to `server.ts` manually.',
  },
  {
    possibleIn: 900,
    necessaryAsOf: 1000,
    level: ApplicationComplexity.Basic,
    step: 'ivy i18n',
    action:
      "Angular 9 introduced a global `$localize()` function that needs to be loaded if you depend on Angular's internationalization (i18n). Run `ng add @angular/localize` to add the necessary packages and code modifications. Consult the [$localize Global Import Migration guide](https://v9.angular.io/guide/migration-localize) to learn more about the changes.",
  },
  {
    possibleIn: 900,
    necessaryAsOf: 1000,
    level: ApplicationComplexity.Medium,
    step: 'entryComponents',
    action:
      'In your application projects, you can remove `entryComponents` NgModules and any uses of `ANALYZE_FOR_ENTRY_COMPONENTS`. They are no longer required with the Ivy compiler and runtime. You may need to keep these if building a library that will be consumed by a View Engine application.',
  },
  {
    possibleIn: 900,
    necessaryAsOf: 1000,
    level: ApplicationComplexity.Medium,
    step: 'testbed-get',
    action:
      'If you use `TestBed.get`, you should instead use `TestBed.inject`. This new method has the same behavior, but is type safe.',
  },
  {
    possibleIn: 900,
    necessaryAsOf: 1000,
    level: ApplicationComplexity.Medium,
    step: '$localize',
    action:
      "If you use [Angular's i18n support](http://angular.io/guide/i18n), you will need to begin using `@angular/localize`. Learn more about the [$localize Global Import Migration](https://v9.angular.io/guide/migration-localize).",
  },

  {
    possibleIn: 1000,
    necessaryAsOf: 1000,
    level: ApplicationComplexity.Basic,
    step: 'v10 NodeJS 12',
    action:
      'Make sure you are using <a href="https://nodejs.org/dist/latest-v12.x/" target="_blank">Node 12 or later</a>.',
  },
  {
    possibleIn: 1000,
    necessaryAsOf: 1000,
    level: ApplicationComplexity.Basic,
    step: 'ng update v10',
    action:
      'Run `npx @angular/cli@10 update @angular/core@10 @angular/cli@10` which should bring you to version 10 of Angular.',
  },
  {
    possibleIn: 1000,
    necessaryAsOf: 1000,
    level: ApplicationComplexity.Basic,
    material: true,
    step: 'update @angular/material',
    action: 'Run `npx @angular/cli@10 update @angular/material@10`.',
  },
  {
    possibleIn: 1000,
    necessaryAsOf: 1000,
    level: ApplicationComplexity.Basic,
    step: 'browserlist',
    action:
      'New projects use the filename `.browserslistrc` instead of `browserslist`. `ng update` will migrate you automatically.',
  },
  {
    possibleIn: 1000,
    necessaryAsOf: 1000,
    level: ApplicationComplexity.Medium,
    step: 'v10-versions',
    action:
      'Angular now requires `tslint` v6, `tslib` v2, and [TypeScript 3.9](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-9.html). `ng update` will migrate you automatically.',
  },
  {
    possibleIn: 1000,
    necessaryAsOf: 1000,
    level: ApplicationComplexity.Advanced,
    step: 'styleext',
    action:
      'Stop using `styleext` or `spec` in your Angular schematics. `ng update` will migrate you automatically.',
  },
  {
    possibleIn: 900,
    necessaryAsOf: 1000,
    level: ApplicationComplexity.Medium,
    step: 'classes-without-decorators',
    action:
      'In version 10, classes that use Angular features and do not have an Angular decorator are no longer supported.  [Read more](https://v10.angular.io/guide/migration-undecorated-classes).  `ng update` will migrate you automatically.',
  },
  {
    possibleIn: 900,
    necessaryAsOf: 1000,
    level: ApplicationComplexity.Medium,
    step: 'injectable-definitions',
    action:
      'As of Angular 9, enforcement of @Injectable decorators for DI is stricter and incomplete provider definitions behave differently. [Read more](https://v9.angular.io/guide/migration-injectable). `ng update` will migrate you automatically.',
  },
  {
    possibleIn: 1000,
    necessaryAsOf: 1000,
    level: ApplicationComplexity.Advanced,
    step: 'closure-jsdoc-comments',
    action:
      "Angular's NPM packages no longer contain jsdoc comments, which are necessary for use with closure compiler (extremely uncommon). This support was experimental and only worked in some use cases. There will be an alternative recommended path announced shortly.",
  },
  {
    possibleIn: 1000,
    necessaryAsOf: 1000,
    level: ApplicationComplexity.Medium,
    step: 'forms-number-input',
    action:
      'If you use Angular forms, inputs of type `number` no longer listen to [change events](https://developer.mozilla.org/docs/Web/API/HTMLElement/change_event) (this events are not necessarily fired for each alteration the value), instead listen for an [input events](https://developer.mozilla.org/docs/Web/API/HTMLElement/input_event). ',
  },
  {
    possibleIn: 1000,
    necessaryAsOf: 1000,
    level: ApplicationComplexity.Medium,
    step: 'forms-length-input',
    action:
      "For Angular forms validation, the `minLength` and `maxLength` validators now verify that the form control's value has a numeric length property, and only validate for length if that's the case.",
  },
  {
    possibleIn: 1000,
    necessaryAsOf: 1000,
    level: ApplicationComplexity.Medium,
    step: 'esm5-bundles',
    action:
      "The [Angular Package Format](https://g.co/ng/apf) has been updated to remove `esm5` and `fesm5` formats. These are no longer distributed in our npm packages. If you don't use the CLI, you may need to downlevel Angular code to ES5 yourself.",
  },
  {
    possibleIn: 1000,
    necessaryAsOf: 1000,
    level: ApplicationComplexity.Medium,
    step: 'console-errors',
    action:
      "Warnings about unknown elements are now logged as errors. This won't break your app, but it may trip up tools that expect nothing to be logged via `console.error`.",
  },
  {
    possibleIn: 1000,
    necessaryAsOf: 1000,
    level: ApplicationComplexity.Advanced,
    step: 'router-resolver-empty',
    action:
      'Any resolver which returns `EMPTY` will cancel navigation. If you want to allow navigation to continue, you will need to update the resolvers to emit some value, (i.e. `defaultIfEmpty(...)`, `of(...)`, etc).',
  },
  {
    possibleIn: 1000,
    necessaryAsOf: 1000,
    level: ApplicationComplexity.Advanced,
    step: 'sw-vary-headers',
    action:
      'If you use the Angular service worker and rely on resources with [Vary](https://developer.mozilla.org/docs/Web/HTTP/Headers/Vary) headers, these headers are now ignored to avoid unpredictable behavior across browsers. To avoid this, [configure](https://angular.io/guide/service-worker-config) your service worker to avoid caching these resources.',
  },
  {
    possibleIn: 1000,
    necessaryAsOf: 1000,
    level: ApplicationComplexity.Medium,
    step: 'expression-changed-after-checked-new',
    action:
      'You may see `ExpressionChangedAfterItHasBeenChecked` errors that were not detected before when using the `async` pipe. The error could previously have gone undetected because two `WrappedValues` are considered "equal" in all cases for the purposes of the check, even if their respective unwrapped values are not. In version 10, `WrappedValue` has been removed.',
  },
  {
    possibleIn: 1000,
    necessaryAsOf: 1000,
    level: ApplicationComplexity.Advanced,
    step: 'property-binding-change-detection',
    action:
      'If you have a property binding such as `[val]=(observable | async).someProperty`, this will no longer trigger change detection if the value of `someProperty` is identical to the previous emit. If you rely on this, either manually subscribe and call `markForCheck` as needed or update the binding to ensure the reference changes.',
  },
  {
    possibleIn: 1000,
    necessaryAsOf: 1000,
    level: ApplicationComplexity.Advanced,
    step: 'day-periods-crossing-midnight',
    action:
      'If you use either `formatDate()` or `DatePipe` and any of the `b` or `B` format codes, the logic has been updated so that it matches times that are within a day period that spans midnight, so it will now render the correct output, such as at `night` in the case of English.',
  },
  {
    possibleIn: 1000,
    necessaryAsOf: 1000,
    level: ApplicationComplexity.Advanced,
    step: 'urlmatcher-null',
    action:
      'If you use the `UrlMatcher`, the type now reflects that it could always return `null`.',
  },
  {
    possibleIn: 1000,
    necessaryAsOf: 1000,
    level: ApplicationComplexity.Basic,
    step: 'v10-more-details',
    action:
      'For more details about deprecations, automated migrations, and changes visit the [guide angular.io](https://v10.angular.io/guide/updating-to-version-10)',
  },
  {
    possibleIn: 1020,
    necessaryAsOf: 1020,
    level: ApplicationComplexity.Medium,
    step: 'universal-baseurl',
    action:
      'For Angular Universal users, if you use `useAbsoluteUrl` to setup `platform-server`, you now need to also specify `baseUrl`.',
  },

  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Basic,
    step: 'v11 ng update',
    action:
      'Run `ng update @angular/core@11 @angular/cli@11` which should bring you to version 11 of Angular.',
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Basic,
    material: true,
    step: 'update @angular/material',
    action: 'Run `ng update @angular/material@11`.',
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Basic,
    step: 'v11 versions',
    action:
      'Angular now requires [TypeScript 4.0](https://devblogs.microsoft.com/typescript/announcing-typescript-4-0/). `ng update` will migrate you automatically.',
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Basic,
    step: 'v11 browser support',
    action:
      'Support for IE9, IE10, and IE mobile has been removed. This was announced in the [v10 update](http://blog.angular.dev/version-10-of-angular-now-available-78960babd41#c357). ',
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Medium,
    step: 'webpack5 optin',
    action:
      'You can now opt-in to use webpack 5 by using Yarn and adding `"resolutions": {"webpack": "^5.0.0"}` to your `package.json`.',
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Medium,
    step: 'ng new strict prompt',
    action:
      'When generating new projects, you will be asked if you want to enable strict mode. This will configure TypeScript and the Angular compiler for stricter type checking, and apply smaller bundle budgets by default. You can use the `--strict=true` or `--strict=false` to skip the prompt.',
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Advanced,
    step: 'v11 router relativeLinkResolution',
    action:
      "If you use the router, the default value of `relativeLinkResolution` has changed from `legacy` to `corrected`. If your application previously used the default by not specifying a value in the `ExtraOptions` and uses relative links when navigating from children of empty path routes, you will need to update your `RouterModule`'s configuration to specifically specify `legacy` for `relativeLinkResolution`. See [the documentation](https://v11.angular.io/api/router/ExtraOptions#relativeLinkResolution) for more details.",
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Advanced,
    step: 'router initialNavigation',
    action:
      'In the Angular Router, the options deprecated in v4 for `initialNavigation` have been removed. If you previously used `enabled` or `true`, now choose `enabledNonBlocking` or `enabledBlocking`. If you previously used `false` or `legacy_disabled`, now use `disabled`.',
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Medium,
    step: 'routerlink preserveQueryParams',
    action:
      'In the Angular Router\'s `routerLink`, `preserveQueryParams` has been removed, use `queryParamsHandling="preserve"` instead.',
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Advanced,
    step: 'routerlink queryParams typing',
    action:
      'If you were accessing the `routerLink` values of `queryParams`, `fragment` or `queryParamsHandling` you might need to relax the typing to also accept `undefined` and `null`.',
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Advanced,
    step: 'viewencapsulation native removed',
    action:
      'The component view encapsulation option `ViewEncapsulation.Native` has been removed. Use `ViewEncapsulation.ShadowDom` instead. `ng update` will migrate you automatically.',
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Advanced,
    step: 'ICU expressions typechecked',
    action:
      'If you use i18n, expressions within International Components for Unicode (ICUs) expressions are now type-checked again. This may cause compilation failures if errors are found in expressions that appear within an ICU. ',
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Advanced,
    step: 'forms validators asyncValidators typing',
    action:
      "Directives in the `@angular/forms` package used to have `any[]` as the type of the expected `validators` and `asyncValidators` arguments in constructors. Now these arguments are properly typed, so if your code relies on form's directive constructor types it may require some updates to improve type safety.",
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Advanced,
    step: 'forms AbstractFormControl',
    action:
      "If you use Angular Forms, the type of `AbstractFormControl.parent` now includes null.  `ng update` will migrate you automatically, but in an unlikely case your code was testing the parent against undefined with strict equality, you'll need to change this to `=== null` instead, since the parent is now explicitly initialized with `null` instead of being left undefined.",
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Advanced,
    step: 'platform-webworker',
    action:
      'The rarely used `@angular/platform-webworker` and `@angular/platform-webworker-dynamic` were deprecated in v8 and have been removed. Running parts of Angular in a web worker was an experiment that never worked well for common use cases. Angular still has great support for [Web Workers](https://angular.io/guide/web-worker). ',
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Advanced,
    step: 'v11 slice pipe typing',
    action:
      'The `slice` pipe now returns null for the undefined input value, which is consistent with the behavior of most pipes.',
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Advanced,
    step: 'v11 keyvalue typing',
    action:
      'The `keyvalue` pipe has been fixed to report that for input objects that have number keys, the result type will contain the string representation of the keys. This was already the case and the code has simply been updated to reflect this. Please update the consumers of the pipe output if they were relying on the incorrect types. Note that this does not affect use cases where the input values are `Map`s, so if you need to preserve `number`s, this is an effective way.',
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Advanced,
    step: 'v11 number pipe typing',
    action:
      'The number pipes (`decimal`, `percent`, `currency`, etc) now explicitly state which types are accepted.',
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Advanced,
    step: 'v11 date pipe typing',
    action: 'The `date` pipe now explicitly states which types are accepted.',
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Advanced,
    step: 'v11 datetime rounding',
    action:
      'When passing a date-time formatted string to the `DatePipe` in a format that contains fractions of a millisecond, the milliseconds will now always be rounded down rather than to the nearest millisecond. Most applications will not be affected by this change. If this is not the desired behaviour then consider pre-processing the string to round the millisecond part before passing it to the `DatePipe`.',
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Advanced,
    step: 'v11 async pipe typing',
    action:
      'The `async` pipe no longer claims to return undefined for an input that was typed as undefined. Note that the code actually returned null on undefined inputs.',
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Medium,
    step: 'v11 case pipe update',
    action:
      'The `uppercase` and `lowercase` pipes no longer let falsy values through. They now map both `null` and `undefined` to `null` and raise an exception on invalid input (`0`, `false`, `NaN`). This matches other Angular pipes.',
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Advanced,
    step: 'v11 router NavigationExtras typing',
    action:
      'If you use the router with `NavigationExtras`, new typings allow a variable of type `NavigationExtras` to be passed in, but they will not allow object literals, as they may only specify known properties. They will also not accept types that do not have properties in common with the ones in the `Pick`. If you are affected by this change, only specify properties from the NavigationExtras which are actually used in the respective function calls or use a type assertion on the object or variable: `as NavigationExtras`.',
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Medium,
    step: 'v11 TestBed.overrideProvider',
    action:
      'In your tests if you call `TestBed.overrideProvider` after TestBed initialization, provider overrides are no longer applied. This behavior is consistent with other override methods (such as `TestBed.overrideDirective`, etc) but they throw an error to indicate that. The check was previously missing in the TestBed.overrideProvider function. If you see this error, you should move `TestBed.overrideProvider` calls before TestBed initialization is completed.',
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Medium,
    step: 'v11 router RouteReuseStrategy',
    action:
      "If you use the Router's RouteReuseStrategy, the argument order has changed. When calling `RouteReuseStrategy#shouldReuseRoute` previously when evaluating child routes, they would be called with the `future` and `current` arguments swapped. If your `RouteReuseStrategy` relies specifically on only the future or current snapshot state, you may need to update the `shouldReuseRoute` implementation's use of `future` and `current` `ActivateRouteSnapshots`.",
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Advanced,
    step: 'v11 locale data readonly',
    action:
      'If you use locale data arrays, this API will now return readonly arrays. If you were mutating them (e.g. calling `sort()`, `push()`, `splice()`, etc) then your code will not longer compile. If you need to mutate the array, you should now take a copy (e.g. by calling `slice()`) and mutate the copy.',
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Advanced,
    step: 'v11 CollectionChangeRecord',
    action:
      'In change detection, `CollectionChangeRecord` has been removed, use `IterableChangeRecord` instead.',
  },
  {
    possibleIn: 1100,
    necessaryAsOf: 1100,
    level: ApplicationComplexity.Medium,
    step: 'v11 forms async validators',
    action:
      'If you use Angular Forms with async validators defined at initialization time on class instances of `FormControl`, `FormGroup` or `FormArray` , the status change event was not previously emitted once async validator completed. This has been changed so that the status event is emitted into the `statusChanges` observable. If your code relies on the old behavior, you can filter/ignore this additional status change event.',
  },

  {
    possibleIn: 1200,
    necessaryAsOf: 1200,
    level: ApplicationComplexity.Basic,
    step: 'v12 ng update',
    action:
      'Run `ng update @angular/core@12 @angular/cli@12` which should bring you to version 12 of Angular.',
  },
  {
    possibleIn: 1200,
    necessaryAsOf: 1200,
    level: ApplicationComplexity.Basic,
    material: true,
    step: 'update @angular/material',
    action: 'Run `ng update @angular/material@12`.',
  },
  {
    possibleIn: 1200,
    necessaryAsOf: 1200,
    level: ApplicationComplexity.Basic,
    step: 'v12 versions',
    action:
      'Angular now requires [TypeScript 4.2](https://devblogs.microsoft.com/typescript/announcing-typescript-4-2/). `ng update` will update you automatically.',
  },
  {
    possibleIn: 1200,
    necessaryAsOf: 1200,
    level: ApplicationComplexity.Basic,
    step: 'v12 browser support',
    action:
      'IE11 support has been deprecated. Find details in the [RFC for IE11 removal](https://github.com/angular/angular/issues/41840).',
  },
  {
    possibleIn: 1200,
    necessaryAsOf: 1200,
    level: ApplicationComplexity.Basic,
    step: 'v12 minimum  Node.js version',
    action: 'You can no longer use Angular with Node.js version 10 or older',
  },
  {
    possibleIn: 1200,
    necessaryAsOf: 1200,
    level: ApplicationComplexity.Medium,
    step: 'v12 `XhrFactory` relocation',
    action: 'Change the import of `XhrFactory` from `@angular/common/http` to `@angular/common`.',
  },
  {
    possibleIn: 1200,
    necessaryAsOf: 1200,
    level: ApplicationComplexity.Medium,
    step: 'v12 i18n message ids',
    action:
      'If you rely on legacy i18n message IDs use the `localize-migrate` tool to [move away from them](https://angular.io/guide/migration-legacy-message-id).',
  },
  {
    possibleIn: 1200,
    necessaryAsOf: 1200,
    level: ApplicationComplexity.Medium,
    step: 'v12 deprecates `emitDistinctChangesOnly`',
    action:
      'If you are using `emitDistinctChangesOnly` to configure `@ContentChildren` and `@ViewChildren` queries, you may need to update its value to `false` to align with its previous behavior. In v12 `emitDistinctChangesOnly` has default value `true`, and in future releases we will remove this configuration option to prevent triggering of unnecessary changes.',
  },
  {
    possibleIn: 1200,
    necessaryAsOf: 1200,
    level: ApplicationComplexity.Medium,
    step: 'v12 prod by default',
    action:
      'You can run the optional migration for enabling production builds by default `ng update @angular/cli@12 --migrate-only production-by-default`.',
  },
  {
    possibleIn: 1200,
    necessaryAsOf: 1200,
    level: ApplicationComplexity.Advanced,
    step: 'v12 min and max form attributes',
    action:
      'If you  use Angular forms, `min` and `max` attributes on `<input type="number">` will now trigger validation logic.',
  },
  {
    possibleIn: 1200,
    necessaryAsOf: 1200,
    level: ApplicationComplexity.Advanced,
    step: 'v12 `emitEvent` in `FormArray` and `FormGroup`',
    action:
      'If your app has custom classes that extend `FormArray` or `FormGroup` classes and override the above-mentioned methods, you may need to update your implementation',
  },
  {
    possibleIn: 1200,
    necessaryAsOf: 1200,
    level: ApplicationComplexity.Advanced,
    step: 'v12 zone.js minimum version',
    action:
      'Update zone.js to version 0.11.4. `ng update` will update this dependency automatically.',
  },
  {
    possibleIn: 1200,
    necessaryAsOf: 1200,
    level: ApplicationComplexity.Advanced,
    step: 'v12 `HttpParams` method params update',
    action:
      'If you extend the `HttpParams` class you may have to update the signature of its method to reflect changes in the parameter types.',
  },
  {
    possibleIn: 1200,
    necessaryAsOf: 1200,
    level: ApplicationComplexity.Advanced,
    step: 'v12 `routerLinkActiveOptions`',
    action:
      '`routerLinkActiveOptions` property of `RouterLinkActive` now has a more specific type. You may need to update code accessing this property to align with the changes.',
  },
  {
    possibleIn: 1200,
    necessaryAsOf: 1200,
    level: ApplicationComplexity.Advanced,
    step: 'v12 `APP_INITIALIZER` callback types',
    action:
      'The initializer callbacks now have more specific return types, which may require update of your code if you are getting an `APP_INITIALIZER` instance via `Injector.get` or `TestBed.inject`.',
  },
  {
    possibleIn: 1200,
    necessaryAsOf: 1200,
    level: ApplicationComplexity.Advanced,
    step: 'v12 fragment typings',
    action:
      'The router fragments now could be `null`. Add `null` checks to avoid TypeScript failing with type errors.',
  },
  {
    possibleIn: 1200,
    necessaryAsOf: 1200,
    level: ApplicationComplexity.Advanced,
    step: 'v12 `ng.getDirectives`',
    action:
      "Make sure you don't rely on `ng.getDirectives` throwing an error if it can't find a directive associated with a particular DOM node.",
  },
  {
    possibleIn: 1200,
    necessaryAsOf: 1200,
    level: ApplicationComplexity.Advanced,
    step: 'v12 `optimization.styles.inlineCritical`',
    action:
      'Check out `optimization.styles.inlineCritical` option in your angular.json file. It now defaults to `true`. Remember that the whole `optimization` option can be set as boolean which will set all the suboptions to defaults.',
  },

  {
    possibleIn: 1300,
    necessaryAsOf: 1300,
    level: ApplicationComplexity.Basic,
    step: 'v13 ng update',
    action:
      'Run `ng update @angular/core@13 @angular/cli@13` which should bring you to version 13 of Angular.',
  },
  {
    possibleIn: 1300,
    necessaryAsOf: 1300,
    level: ApplicationComplexity.Basic,
    material: true,
    step: 'update @angular/material',
    action: 'Run `ng update @angular/material@13`.',
  },
  {
    possibleIn: 1300,
    necessaryAsOf: 1300,
    level: ApplicationComplexity.Basic,
    step: 'TypeScript 4.4',
    action:
      'Angular now uses TypeScript 4.4, read more about any potential breaking changes: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html',
  },
  {
    possibleIn: 1300,
    necessaryAsOf: 1300,
    level: ApplicationComplexity.Basic,
    step: 'v13 node',
    action:
      'Make sure you are using <a href="http://www.hostingadvice.com/how-to/update-node-js-latest-version/" target="_blank">Node 12.20.0 or later</a>',
  },
  {
    possibleIn: 1300,
    necessaryAsOf: 1300,
    level: ApplicationComplexity.Medium,
    step: 'v13 routerLink',
    action:
      'You can now disable the navigation of a `routerLink` by passing `undefined` and `null`. Previously the `routerLink` directive used to accept these two values as equivalent to an empty string.',
  },
  {
    possibleIn: 1300,
    necessaryAsOf: 1300,
    level: ApplicationComplexity.Medium,
    step: 'v13 router loadChildren',
    action:
      'You can no longer specify lazy-loaded routes by setting a string value to `loadChildren`. Make sure you move to dynamic ESM import statements.',
  },
  {
    possibleIn: 1300,
    necessaryAsOf: 1300,
    level: ApplicationComplexity.Medium,
    step: 'v13 service worker activated',
    action:
      'The `activated` observable of `SwUpdate` is now deprecated. To check the activation status of a service worker use the `activatedUpdate` method instead.',
  },
  {
    possibleIn: 1300,
    necessaryAsOf: 1300,
    level: ApplicationComplexity.Medium,
    step: 'v13 service worker available',
    action:
      'The `available` observable of `SwUpdate` is now deprecated. To get the same information use `versionUpdates` and filter only the `VersionReadyEvent` events.',
  },
  {
    possibleIn: 1300,
    necessaryAsOf: 1300,
    level: ApplicationComplexity.Medium,
    step: 'v13 renderModuleFactory',
    action:
      'The `renderModuleFactory` from `@angular/platform-server` is no longer necessary with Ivy. Use `renderModule` instead.',
  },
  {
    possibleIn: 1300,
    necessaryAsOf: 1300,
    level: ApplicationComplexity.Advanced,
    step: 'v13 forms status',
    action:
      'We narrowed the type of `AbstractControl.status` to `FormControlStatus` and `AbstractControl.status` to `Observable<FormControlStatus>`. `FormControlStatus` is the union of all possible status strings for form controls.',
  },
  {
    possibleIn: 1300,
    necessaryAsOf: 1300,
    level: ApplicationComplexity.Advanced,
    step: 'v13 router serializer',
    action:
      'To align with the URI spec, now the URL serializer respects question marks in the query parameters. For example `/path?q=hello?&q2=2` will now be parsed to `{ q: `hello?`, q2: 2 }`',
  },
  {
    possibleIn: 1300,
    necessaryAsOf: 1300,
    level: ApplicationComplexity.Advanced,
    step: 'v13 host binding',
    action:
      "`href` is now an attribute binding. This means that `DebugElement.properties['href']` now returns the `href` value returned by the native element, rather than the internal value of the `href` property of the `routerLink`.",
  },
  {
    possibleIn: 1300,
    necessaryAsOf: 1300,
    level: ApplicationComplexity.Advanced,
    step: 'v13 spy location',
    action:
      '`SpyLocation` no longer emits the `popstate` event when `location.go` is called. In addition, `simulateHashChange` now triggers both `haschange` and `popstate`. Tests that rely on `location.go` most likely need to now use `simulateHashChange` to capture `popstate`.',
  },
  {
    possibleIn: 1300,
    necessaryAsOf: 1300,
    level: ApplicationComplexity.Advanced,
    ngUpgrade: true,
    step: 'v13 router URL replacement',
    action:
      'The router will no longer replace the browser URL when a new navigation cancels an ongoing navigation. Hybrid applications which rely on the `navigationId` being present on initial navigations that were handled by the Angular router should subscribe to `NavigationCancel` events and perform the `location.replaceState` to add `navigationId` to the `Router` state. In addition, tests which assert `urlChanges` on the `SpyLocation` may need to be adjusted to account for the `replaceState` which is no longer triggered.',
  },
  {
    possibleIn: 1300,
    necessaryAsOf: 1300,
    level: ApplicationComplexity.Advanced,
    step: 'v13 removed symbols',
    action:
      'The route package no longer exports `SpyNgModuleFactoryLoader` and `DeprecatedLoadChildren`. In case you use them, make sure you remove their corresponding import statements.',
  },

  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Basic,
    step: 'v14 ng update',
    action:
      'Run `ng update @angular/core@14 @angular/cli@14` which should bring you to version 14 of Angular.',
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Basic,
    material: true,
    step: 'update @angular/material',
    action: 'Run `ng update @angular/material@14`.',
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Basic,
    step: 'TypeScript 4.6',
    action:
      'Angular now uses TypeScript 4.6, read more about any potential breaking changes: https://devblogs.microsoft.com/typescript/announcing-typescript-4-6/',
  },

  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Basic,
    step: 'v14 node',
    action:
      'Make sure you are using <a href="http://www.hostingadvice.com/how-to/update-node-js-latest-version/" target="_blank">Node 14.15.0 or later</a>',
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Medium,
    step: 'v14 strict forms',
    action:
      'Form models now require a generic type parameter. For gradual migration you can opt-out using the untyped version of the form model classes.',
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Medium,
    step: 'v14 aotSummaries',
    action: 'Remove `aotSummaries` from `TestBed` since Angular no longer needs them in Ivy.',
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Medium,
    material: true,
    step: 'v14 MatVertical and Horizontal Stepper',
    action:
      'If you are using `MatVerticalStepper` or `MatHorizontalStepper` make sure you switch to `MatStepper`.',
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Medium,
    step: 'v14 JSONP',
    action:
      'Remove headers from JSONP requests. JSONP does not supports headers and if specified the HTTP module will now throw an error rather than ignoring them.',
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Medium,
    step: 'v14 resolvers',
    action:
      'Resolvers now will take the first emitted value by an observable and after that proceed to navigation to better align with other guards rather than taking the last emitted value.',
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Advanced,
    material: true,
    step: 'v14 deprecate protractor entry',
    action: 'The deprecated `angular/cdk/testing/protractor` entry point is now removed.',
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Advanced,
    material: true,
    step: 'v14 chipInput',
    action: 'Make sure you specify `chipInput` of `MatChipInputEvent` because it is now required.',
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Advanced,
    material: true,
    step: 'v14 mixinErrorState',
    action:
      'You need to implement `stateChanges` class member in abstractions using `mixinErrorState` because the mixin no longer provides it.',
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Advanced,
    material: true,
    step: 'v14 CdkStepper orientation',
    action: 'Use `CdkStepper.orientation` instead of `CdkStepper._orientation`.',
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Advanced,
    material: true,
    step: 'v14 CdkStepper and MatStepper',
    action:
      'If you are extending or using `CdkStepper` or `MatStepper` in the constructor you should no longer pass the `_document` parameter since it is now removed.',
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Advanced,
    material: true,
    step: 'v14 mat-list-item-avatar',
    action: 'Rename the `mat-list-item-avatar` CSS class to `mat-list-item-with-avatar`.',
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Advanced,
    material: true,
    step: 'v14 MatSelectionListChange.option',
    action: 'Use `MatSelectionListChange.options` rather than `MatSelectionListChange.option`.',
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Advanced,
    material: true,
    step: 'v14 getHarnessLoaderForContent',
    action:
      'Use `getChildLoader(MatListItemSection.CONTENT)` rather than `getHarnessLoaderForContent`.',
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Advanced,
    material: true,
    step: 'v14 MatSelectionList',
    action:
      'If you are using `MatSelectionList` make sure you pass `_focusMonitor` in its constructor because it is now required. Additionally, this class no longer has `tabIndex` property and a `tabIndex` constructor parameter.',
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Advanced,
    step: 'v14 initialNavigation',
    action: "Update `initialNavigation: 'enabled'` to `initialNavigation: 'enabledBlocking'`.",
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Advanced,
    step: 'v14 Route.pathMatch',
    action:
      'If you are defining routes with `pathMatch`, you may have to cast it to `Route` or `Routes` explicitly. `Route.pathMatch` is no longer compatible with `string` type.',
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Advanced,
    step: 'v14 stricter LoadChildrenCallback',
    action:
      'The promise returned by `LoadChildrenCallback` now has a stricter type parameter `Type<any>|NgModuleFactory<any>` rather than `any`.',
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Advanced,
    step: 'v14 router scheduling',
    action:
      'The router does no longer schedule redirect navigation within a `setTimeout`. Make sure your tests do not rely on this behavior.',
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Advanced,
    step: 'v14 LocationStrategy',
    action:
      'Implementing the `LocationStrategy` interface now requires definition of `getState()`.',
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Advanced,
    step: 'v14 http queries',
    action:
      'Sending `+` as part of a query no longer requires workarounds since `+` no longer sends a space.',
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Advanced,
    step: 'v14 AnimationDriver.getParentElement',
    action: 'Implementing `AnimationDriver` now requires the `getParentElement` method.',
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Advanced,
    step: 'v14 invalid config',
    action:
      'Invalid route configurations of lazy-loaded modules will now throw an error rather than being ignored.',
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Advanced,
    step: 'v14 router resolver',
    action:
      'Remove the `resolver` from `RouterOutletContract.activateWith` function and the `resolver` from `OutletContext` class since factory resolvers are no longer needed.',
  },
  {
    possibleIn: 1400,
    necessaryAsOf: 1400,
    level: ApplicationComplexity.Advanced,
    step: 'v14 initialUrl',
    action:
      '`Router.initialUrl` accepts only `UrlTree` to prevent a misuse of the API by assigning a `string` value.',
  },

  {
    possibleIn: 1500,
    necessaryAsOf: 1500,
    level: ApplicationComplexity.Basic,
    step: 'v15 node support',
    action:
      'Make sure that you are using a supported version of node.js before you upgrade your application. Angular v15 supports node.js versions: 14.20.x, 16.13.x and 18.10.x. <a href="https://v15.angular.io/guide/update-to-version-15#v15-bc-01" alt="Link to more information about this change">Read further</a>',
  },
  {
    possibleIn: 1500,
    necessaryAsOf: 1500,
    level: ApplicationComplexity.Basic,
    step: 'v15 ts support',
    action:
      'Make sure that you are using a supported version of TypeScript before you upgrade your application. Angular v15 supports TypeScript version 4.8 or later.  <a href="https://v15.angular.io/guide/update-to-version-15#v15-bc-02" alt="Link to more information about this change">Read further</a>',
  },
  {
    possibleIn: 1500,
    necessaryAsOf: 1500,
    level: ApplicationComplexity.Basic,
    step: 'v15 ng update',
    action:
      "In the application's project directory, run `ng update @angular/core@15 @angular/cli@15` to update your application to Angular v15.",
  },
  {
    possibleIn: 1500,
    necessaryAsOf: 1500,
    level: ApplicationComplexity.Basic,
    material: true,
    step: 'V15 update @angular/material',
    action: 'Run `ng update @angular/material@15` to update the Material components.',
  },
  {
    possibleIn: 1500,
    necessaryAsOf: 1500,
    level: ApplicationComplexity.Medium,
    step: 'v15 keyframe',
    action:
      'In v15, the Angular compiler prefixes `@keyframes` in CSS with the component\'s scope. This means that any TypeScript code that relies on `keyframes` names no longer works in v15. Update any such instances to: define keyframes programmatically, use global stylesheets, or change the component\'s view encapsulation. <a href="https://v15.angular.io/guide/update-to-version-15#v15-bc-03" alt="Link to more information about this change">Read further</a>',
  },
  {
    possibleIn: 1500,
    necessaryAsOf: 1500,
    level: ApplicationComplexity.Basic,
    step: 'v15 no-ivy',
    action:
      "In your application's `tsconfig.json` file, remove `enableIvy`. In v15, Ivy is the only rendering engine so `enableIvy` is not required.",
  },
  {
    possibleIn: 1500,
    necessaryAsOf: 1500,
    level: ApplicationComplexity.Medium,
    step: 'v15 base-decorators',
    action:
      'Make sure to use decorators in base classes with child classes that inherit constructors and use dependency injection. Such base classes should be decorated with either `@Injectable` or `@Directive` or the compiler returns an error. <a href="https://v15.angular.io/guide/update-to-version-15#v15-bc-05" alt="Link to more information about this change">Read further</a>',
  },
  {
    possibleIn: 1500,
    necessaryAsOf: 1500,
    level: ApplicationComplexity.Medium,
    step: 'v15 setDisabledState',
    action:
      'In v15, `setDisabledState` is always called when a `ControlValueAccessor` is attached. To opt-out of this behavior, use `FormsModule.withConfig` or `ReactiveFormsModule.withConfig`. <a href="https://v15.angular.io/guide/update-to-version-15#v15-bc-06" alt="Link to more information about this change">Read further</a>',
  },
  {
    possibleIn: 1500,
    necessaryAsOf: 1500,
    level: ApplicationComplexity.Advanced,
    step: 'v15 canParse',
    action:
      'Applications that use `canParse` should use `analyze` from `@angular/localize/tools` instead. In v15, the `canParse` method was removed from all translation parsers in `@angular/localize/tools`.  <a href="https://v15.angular.io/guide/update-to-version-15#v15-bc-07" alt="Link to more information about this change">Read further</a>',
  },
  {
    possibleIn: 1500,
    necessaryAsOf: 1500,
    level: ApplicationComplexity.Basic,
    step: 'v15 ActivatedRoutSnapshot',
    action:
      'Make sure that all `ActivatedRouteSnapshot` objects have a `title` property. In v15, the `title` property is a required property of `ActivatedRouteSnapshot`. <a href="https://v15.angular.io/guide/update-to-version-15#v15-bc-08" alt="Link to more information about this change">Read further</a>',
  },
  {
    possibleIn: 1500,
    necessaryAsOf: 1500,
    level: ApplicationComplexity.Advanced,
    step: 'v15 RouterOutlet',
    action:
      'If your tests with `RouterOutlet` break, make sure they don\'t depend on the instantiation order of the corresponding component relative to change detection. In v15, `RouterOutlet` instantiates the component after change detection. <a href="https://v15.angular.io/guide/update-to-version-15#v15-bc-09" alt="Link to more information about this change">Read further</a>',
  },
  {
    possibleIn: 1500,
    necessaryAsOf: 1500,
    level: ApplicationComplexity.Basic,
    step: 'v15 relativeLinkResolution',
    action:
      'In v15, `relativeLinkResolution` is not configurable in the Router. It was used to opt out of an earlier bug fix that is now standard.  <a href="https://v15.angular.io/guide/update-to-version-15#v15-bc-10" alt="Link to more information about this change">Read further</a>',
  },
  {
    possibleIn: 1500,
    necessaryAsOf: 1500,
    level: ApplicationComplexity.Medium,
    step: 'v15 DATE_PIPE_DEFAULT_OPTIONS',
    action:
      'Change instances of the `DATE_PIPE_DEFAULT_TIMEZONE` token to use `DATE_PIPE_DEFAULT_OPTIONS` to configure time zones.  In v15, the `DATE_PIPE_DEFAULT_TIMEZONE` token is deprecated. <a href="https://v15.angular.io/guide/update-to-version-15#v15-dp-01" alt="Link to more information about this change">Read further</a>',
  },
  {
    possibleIn: 1500,
    necessaryAsOf: 1500,
    level: ApplicationComplexity.Medium,
    step: 'v15 iframe',
    action:
      "Existing `<iframe>` instances might have security-sensitive attributes applied to them as an attribute or property binding. These security-sensitive attributes can occur in a template or in a directive's host bindings. Such occurrences require an update to ensure compliance with the new and stricter rules about `<iframe>` bindings. For more information, see [the error page](https://v15.angular.io/errors/NG0910).",
  },
  {
    possibleIn: 1500,
    necessaryAsOf: 1500,
    level: ApplicationComplexity.Medium,
    step: 'v15 Injector.get',
    action:
      'Update instances of `Injector.get()` that use an `InjectFlags` parameter to use an `InjectOptions` parameter. The `InjectFlags` parameter of `Injector.get()` is deprecated in v15. <a href="https://v15.angular.io/guide/update-to-version-15#v15-dp-02" alt="Link to more information about this change">Read further</a>',
  },
  {
    possibleIn: 1500,
    necessaryAsOf: 1500,
    level: ApplicationComplexity.Basic,
    step: 'v15 TestBed.inject',
    action:
      'Update instances of `TestBed.inject()` that use an `InjectFlags` parameter to use an `InjectOptions` parameter. The `InjectFlags` parameter of `TestBed.inject()` is deprecated in v15. <a href="https://v15.angular.io/guide/update-to-version-15#v15-dp-01" alt="Link to more information about this change">Read further</a>',
  },
  {
    possibleIn: 1500,
    necessaryAsOf: 1500,
    level: ApplicationComplexity.Medium,
    step: 'v15 ngModule in providedIn',
    action:
      'Using `providedIn: ngModule` for an `@Injectable` and `InjectionToken` is deprecated in v15. <a href="https://v15.angular.io/guide/update-to-version-15#v15-dp-04" alt="Link to more information about this change">Read further</a>',
  },
  {
    possibleIn: 1500,
    necessaryAsOf: 1500,
    level: ApplicationComplexity.Basic,
    step: 'v15 providedIn any',
    action:
      'Using `providedIn: \'any\'` for an `@Injectable` or `InjectionToken` is deprecated in v15. <a href="https://v15.angular.io/guide/update-to-version-15#v15-dp-05" alt="Link to more information about this change">Read further</a>',
  },
  {
    possibleIn: 1500,
    necessaryAsOf: 1500,
    level: ApplicationComplexity.Medium,
    step: 'v15 RouterLinkWithHref',
    action:
      'Update instances of the `RouterLinkWithHref`directive to use the `RouterLink` directive. The `RouterLinkWithHref` directive is deprecated in v15. <a href="https://v15.angular.io/guide/update-to-version-15#v15-dp-06" alt="Link to more information about this change">Read further</a>',
  },
  {
    possibleIn: 1500,
    necessaryAsOf: 1500,
    level: ApplicationComplexity.Basic,
    material: true,
    step: 'v15 mat refactor',
    action:
      'In Angular Material v15, many of the components have been refactored to be based on the official Material Design Components for Web (MDC). This change affected the DOM and CSS classes of many components. <a href="https://rc.material.angular.dev/guide/mdc-migration" alt="Link to more information about this change">Read further</a>',
  },
  {
    possibleIn: 1500,
    necessaryAsOf: 1500,
    level: ApplicationComplexity.Basic,
    step: 'v15 visual review',
    action:
      'After you update your application to v15, visually review your application and its interactions to ensure everything is working as it should.',
  },

  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Basic,
    step: 'v16 node support',
    action:
      'Make sure that you are using a supported version of node.js before you upgrade your application. Angular v16 supports node.js versions: v16 and v18.',
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Basic,
    step: 'v16 ts support',
    action:
      'Make sure that you are using a supported version of TypeScript before you upgrade your application. Angular v16 supports TypeScript version 4.9.3 or later.',
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Basic,
    step: 'v16 ng update',
    action:
      "In the application's project directory, run `ng update @angular/core@16 @angular/cli@16` to update your application to Angular v16.",
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Basic,
    material: true,
    step: 'update @angular/material',
    action: 'Run `ng update @angular/material@16`.',
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Basic,
    step: 'v16 zone.js support',
    action:
      'Make sure that you are using a supported version of Zone.js before you upgrade your application. Angular v16 supports Zone.js version 0.13.x or later.',
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Advanced,
    step: 'v16 RouterEvent',
    action:
      "The Event union no longer contains `RouterEvent`, which means that if you're using the Event type you may have to change the type definition from `(e: Event)` to `(e: Event|RouterEvent)`",
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Advanced,
    step: 'v16 routerEvent prop type',
    action:
      'In addition to `NavigationEnd` the `routerEvent` property now also accepts type `NavigationSkipped`',
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Advanced,
    step: 'v16 RendererType2',
    action:
      'Pass only flat arrays to `RendererType2.styles` because it no longer accepts nested arrays',
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Medium,
    step: 'v16 BrowserPlatformLocation',
    action:
      'You may have to update tests that use `BrowserPlatformLocation` because `MockPlatformLocation` is now provided by default in tests. [Read further](https://github.com/angular/angular/blob/main/CHANGELOG.md#common-9).',
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Basic,
    step: 'v16 ngcc',
    action:
      'Due to the removal of the Angular Compatibility Compiler (ngcc) in v16, projects on v16 and later no longer support View Engine libraries.',
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Medium,
    step: 'v16 createUrlTree',
    action:
      'After bug fixes in `Router.createUrlTree` you may have to readjust tests which mock `ActivatedRoute`. [Read further](https://github.com/angular/angular/blob/main/CHANGELOG.md#1600-2023-05-03)',
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Medium,
    step: 'v16 ApplicationConfig imports',
    action: 'Change imports of `ApplicationConfig` to be from `@angular/core`.',
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Advanced,
    step: 'v16 renderModule',
    action:
      'Revise your code to use `renderModule` instead of `renderModuleFactory` because it has been deleted.',
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Medium,
    step: 'v16 XhrFactory',
    action:
      'Revise your code to use `XhrFactory` from `@angular/common` instead of `XhrFactory` export from `@angular/common/http`.',
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Medium,
    step: 'v16 withServerTransition',
    action:
      "If you're running multiple Angular apps on the same page and you're using `BrowserModule.withServerTransition({ appId: 'serverApp' })` make sure you set the `APP_ID` instead since `withServerTransition` is now deprecated. [Read further](https://github.com/angular/angular/blob/main/CHANGELOG.md#platform-browser-4)",
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Advanced,
    step: 'v16 EnvironmentInjector',
    action:
      'Change `EnvironmentInjector.runInContext` to `runInInjectionContext` and pass the environment injector as the first parameter.',
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Advanced,
    step: 'v16 ViewContainerRef.createComponent',
    action:
      'Update your code to use `ViewContainerRef.createComponent` without the factory resolver. `ComponentFactoryResolver` has been removed from Router APIs.',
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Advanced,
    step: 'v16 APP_ID',
    action: 'If you bootstrap multiple apps on the same page, make sure you set unique `APP_IDs`.',
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Advanced,
    step: 'v16 server renderApplication',
    action:
      'Update your code to revise `renderApplication` method as it no longer accepts a root component as first argument, but instead a callback that should bootstrap your app. [Read further](https://github.com/angular/angular/blob/main/CHANGELOG.md#platform-server-3)',
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Advanced,
    step: 'v16 PlatformConfig.baseUrl',
    action:
      'Update your code to remove any reference to `PlatformConfig.baseUrl` and `PlatformConfig.useAbsoluteUrl` platform-server config options as it has been deprecated.',
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Basic,
    step: 'v16 moduleid',
    action:
      'Update your code to remove any reference to `@Directive`/`@Component` `moduleId` property as it does not have any effect and will be removed in v17.',
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Medium,
    step: 'v16 transfer state imports',
    action:
      "Update imports from `import {makeStateKey, StateKey, TransferState} from '@angular/platform-browser'` to `import {makeStateKey, StateKey, TransferState} from '@angular/core'`",
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Advanced,
    step: 'v16 ComponentRef',
    action:
      "If you rely on `ComponentRef.setInput` to set the component input even if it's the same based on `Object.is` equality check, make sure you copy its value.",
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Advanced,
    step: 'v16 ANALYZE_FOR_ENTRY_COMPONENTS',
    action:
      'Update your code to remove any reference to `ANALYZE_FOR_ENTRY_COMPONENTS` injection token as it has been deleted.',
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Basic,
    step: 'v16 entry components',
    action:
      '`entryComponents` is no longer available and any reference to it can be removed from the `@NgModule` and `@Component` public APIs.',
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Medium,
    step: 'v16 ngTemplateOutletContext',
    action:
      'ngTemplateOutletContext has stricter type checking which requires you to declare all the properties in the corresponding object. [Read further](https://github.com/angular/angular/blob/main/CHANGELOG.md#common-1).',
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Medium,
    step: 'v16 APF',
    action:
      'Angular packages no longer include FESM2015 and the distributed ECMScript has been updated from 2020 to 2022.',
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Advanced,
    step: 'v16 EventManager',
    action:
      'The deprecated `EventManager` method `addGlobalEventListener` has been removed as it is not used by Ivy.',
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Medium,
    step: 'v16 BrowserTransferStateModule',
    action:
      '`BrowserTransferStateModule` is no longer available and any reference to it can be removed from your applications.',
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Medium,
    step: 'v16 ReflectiveInjector',
    action:
      'Update your code to use `Injector.create` rather than `ReflectiveInjector` since `ReflectiveInjector` is removed.',
  },
  {
    possibleIn: 1600,
    necessaryAsOf: 1600,
    level: ApplicationComplexity.Basic,
    step: 'v16 QueryList',
    action:
      '`QueryList.filter` now supports type guard functions. Since the type will be narrowed, you may have to update your application code that relies on the old behavior.',
  },

  {
    possibleIn: 1700,
    necessaryAsOf: 1700,
    level: ApplicationComplexity.Basic,
    step: 'v17 node support',
    action:
      'Make sure that you are using a supported version of node.js before you upgrade your application. Angular v17 supports node.js versions: v18.13.0 and newer',
  },
  {
    possibleIn: 1700,
    necessaryAsOf: 1700,
    level: ApplicationComplexity.Basic,
    step: 'v17 ts support',
    action:
      'Make sure that you are using a supported version of TypeScript before you upgrade your application. Angular v17 supports TypeScript version 5.2 or later.',
  },
  {
    possibleIn: 1700,
    necessaryAsOf: 1700,
    level: ApplicationComplexity.Basic,
    step: 'v17 zone.js support',
    action:
      'Make sure that you are using a supported version of Zone.js before you upgrade your application. Angular v17 supports Zone.js version 0.14.x or later.',
  },
  {
    possibleIn: 1700,
    necessaryAsOf: 1700,
    level: ApplicationComplexity.Basic,
    step: 'v17 ng update',
    action:
      "In the application's project directory, run `ng update @angular/core@17 @angular/cli@17` to update your application to Angular v17.",
  },
  {
    possibleIn: 1700,
    necessaryAsOf: 1700,
    level: ApplicationComplexity.Basic,
    material: true,
    step: 'update @angular/material',
    action: 'Run `ng update @angular/material@17`.',
  },
  {
    possibleIn: 1700,
    necessaryAsOf: 1700,
    level: ApplicationComplexity.Medium,
    step: 'v17 style removal',
    action:
      'Angular now automatically removes styles of destroyed components, which may impact your existing apps in cases you rely on leaked styles. To change this update the value of the `REMOVE_STYLES_ON_COMPONENT_DESTROY` provider to `false`.',
  },
  {
    possibleIn: 1700,
    necessaryAsOf: 1700,
    level: ApplicationComplexity.Basic,
    step: 'v17 router removals',
    action:
      "Make sure you configure `setupTestingRouter`, `canceledNavigationResolution`, `paramsInheritanceStrategy`, `titleStrategy`, `urlUpdateStrategy`, `urlHandlingStrategy`, and `malformedUriErrorHandler` in `provideRouter` or `RouterModule.forRoot` since these properties are now not part of the `Router`'s public API",
  },
  {
    possibleIn: 1700,
    necessaryAsOf: 1700,
    level: ApplicationComplexity.Advanced,
    step: 'v17 ngDoCheck dynamic components',
    action:
      'For dynamically instantiated components we now execute `ngDoCheck` during change detection if the component is marked as dirty. You may need to update your tests or logic within `ngDoCheck` for dynamically instantiated components.',
  },
  {
    possibleIn: 1700,
    necessaryAsOf: 1700,
    level: ApplicationComplexity.Medium,
    step: 'v17 malformedUriErrorHandler',
    action:
      "Handle URL parsing errors in the `UrlSerializer.parse` instead of `malformedUriErrorHandler` because it's now part of the public API surface.",
  },
  {
    possibleIn: 1700,
    necessaryAsOf: 1700,
    level: ApplicationComplexity.Medium,
    step: 'v17 zone deep imports',
    action:
      'Change Zone.js deep imports like `zone.js/bundles/zone-testing.js` and `zone.js/dist/zone` to `zone.js` and `zone.js/testing`.',
  },
  {
    possibleIn: 1700,
    necessaryAsOf: 1700,
    level: ApplicationComplexity.Advanced,
    step: 'v17 absolute redirects',
    action:
      'You may need to adjust your router configuration to prevent infinite redirects after absolute redirects. In v17 we no longer prevent additional redirects after absolute redirects.',
  },
  {
    possibleIn: 1700,
    necessaryAsOf: 1700,
    level: ApplicationComplexity.Medium,
    step: 'v17 AnimationDriver',
    action:
      'Change references to `AnimationDriver.NOOP` to use `NoopAnimationDriver` because `AnimationDriver.NOOP` is now deprecated.',
  },
  {
    possibleIn: 1700,
    necessaryAsOf: 1700,
    level: ApplicationComplexity.Basic,
    step: 'v17 switch strictness',
    action:
      "You may need to adjust the equality check for `NgSwitch` because now it defaults to stricter check with `===` instead of `==`. Angular will log a warning message for the usages where you'd need to provide an adjustment.",
  },
  {
    possibleIn: 1700,
    necessaryAsOf: 1700,
    level: ApplicationComplexity.Advanced,
    step: 'v17 mutate in signals',
    action:
      'Use `update` instead of `mutate` in Angular Signals. For example `items.mutate(itemsArray => itemsArray.push(newItem));` will now be `items.update(itemsArray => [itemsArray, …newItem]);`',
  },
  {
    possibleIn: 1700,
    necessaryAsOf: 1700,
    level: ApplicationComplexity.Medium,
    step: 'v17 withNoDomReuse',
    action:
      'To disable hydration use `ngSkipHydration` or remove the `provideClientHydration` call from the provider list since `withNoDomReuse` is no longer part of the public API.',
  },
  {
    possibleIn: 1700,
    necessaryAsOf: 1700,
    level: ApplicationComplexity.Basic,
    step: 'v17 paramsInheritanceStrategy',
    action:
      'If you want the child routes of `loadComponent` routes to inherit data from their parent specify the `paramsInheritanceStrategy` to `always`, which in v17 is now set to `emptyOnly`.',
  },

  {
    possibleIn: 1800,
    necessaryAsOf: 1800,
    level: ApplicationComplexity.Basic,
    step: 'v18 node support',
    action:
      'Make sure that you are using a supported version of node.js before you upgrade your application. Angular v18 supports node.js versions: v18.19.0 and newer',
  },
  {
    possibleIn: 1800,
    necessaryAsOf: 1800,
    level: ApplicationComplexity.Basic,
    step: 'v18 ng update',
    action:
      "In the application's project directory, run `ng update @angular/core@18 @angular/cli@18` to update your application to Angular v18.",
  },
  {
    possibleIn: 1800,
    necessaryAsOf: 1800,
    level: ApplicationComplexity.Basic,
    material: true,
    step: 'update @angular/material',
    action: 'Run `ng update @angular/material@18`.',
  },
  {
    possibleIn: 1800,
    necessaryAsOf: 1800,
    level: ApplicationComplexity.Basic,
    step: '18.0.0 Upgrade TypeScript',
    action: 'Update TypeScript to versions 5.4 or newer.',
  },
  {
    possibleIn: 1800,
    necessaryAsOf: 1800,
    level: ApplicationComplexity.Advanced,
    step: '18.0.0: async has been removed, use `waitForAsync` instead',
    action: 'Replace `async` from `@angular/core` with `waitForAsync`.',
  },
  {
    possibleIn: 1800,
    necessaryAsOf: 1800,
    level: ApplicationComplexity.Advanced,
    step: '18.0.0: Deprecated matchesElement method removed from AnimationDriver',
    action: "Remove calls to `matchesElement` because it's now not part of `AnimationDriver`.",
  },
  {
    possibleIn: 1800,
    necessaryAsOf: 1800,
    level: ApplicationComplexity.Medium,
    step: '18.0.0. Use `@angular/core` StateKey and TransferState',
    action:
      'Import `StateKey` and `TransferState` from `@angular/core` instead of `@angular/platform-browser`.',
  },
  {
    possibleIn: 1800,
    necessaryAsOf: 1800,
    level: ApplicationComplexity.Medium,
    step: '18.0.0. Opt-in of caching for HTTP requests with auth headers',
    action:
      'Use `includeRequestsWithAuthHeaders: true` in `withHttpTransferCache` to opt-in of caching for HTTP requests that require authorization.',
  },
  {
    possibleIn: 1800,
    necessaryAsOf: 1800,
    level: ApplicationComplexity.Advanced,
    step: '18.0.0.REMOVE_OBSOLETE_IS_WORKER',
    action:
      'Update the application to remove `isPlatformWorkerUi` and `isPlatformWorkerApp` since they were part of platform WebWorker which is now not part of Angular.',
  },
  {
    possibleIn: 1800,
    necessaryAsOf: 1800,
    level: ApplicationComplexity.Medium,
    step: '18.0.0.FORCE_ZONE_CHANGE_DETECTION',
    action:
      'Tests may run additional rounds of change detection to fully reflect test state in the DOM. As a last resort, revert to the old behavior by adding `provideZoneChangeDetection({ignoreChangesOutsideZone: true})` to the TestBed providers.',
  },
  {
    possibleIn: 1800,
    necessaryAsOf: 1800,
    level: ApplicationComplexity.Medium,
    step: '18.0.0: Remove two-way binding expressions in writable bindings',
    action: 'Remove expressions that write to properties in templates that use `[(ngModel)]`',
  },
  {
    possibleIn: 1800,
    necessaryAsOf: 1800,
    level: ApplicationComplexity.Advanced,
    step: '18.0.0: Use zones to track pending requests',
    action:
      'Remove calls to `Testability` methods `increasePendingRequestCount`, `decreasePendingRequestCount`, and `getPendingRequestCount`. This information is tracked by ZoneJS.',
  },
  {
    possibleIn: 1800,
    necessaryAsOf: 1800,
    level: ApplicationComplexity.Medium,
    step: '18.0.0: Move shared providers to the routed component',
    action:
      'Move any environment providers that should be available to routed components from the component that defines the `RouterOutlet` to the providers of `bootstrapApplication` or the `Route` config.',
  },
  {
    possibleIn: 1800,
    necessaryAsOf: 1800,
    level: ApplicationComplexity.Advanced,
    step: '18.0.0 Use RedirectCommand or new NavigationBehaviorOptions',
    action:
      'When a guard returns a `UrlTree` as a redirect, the redirecting navigation will now use `replaceUrl` if the initial navigation was also using the `replaceUrl` option. If you prefer the previous behavior, configure the redirect using the new `NavigationBehaviorOptions` by returning a `RedirectCommand` with the desired options instead of `UrlTree`.',
  },
  {
    possibleIn: 1800,
    necessaryAsOf: 1800,
    level: ApplicationComplexity.Advanced,
    step: '18.0.0: Remove deprecated resource cache providers',
    action:
      "Remove dependencies of `RESOURCE_CACHE_PROVIDER` since it's no longer part of the Angular runtime.",
  },
  {
    possibleIn: 1800,
    necessaryAsOf: 1800,
    level: ApplicationComplexity.Advanced,
    step: '18.0.0: Update Node.js URL parsing in `ServerPlatformLocation`',
    action:
      'In `@angular/platform-server` now `pathname` is always suffixed with `/` and the default ports for http: and https: respectively are 80 and 443.',
  },
  {
    possibleIn: 1800,
    necessaryAsOf: 1800,
    level: ApplicationComplexity.Medium,
    step: '18.0.0. Use absolute URLs',
    action:
      'Provide an absolute `url` instead of using `useAbsoluteUrl` and `baseUrl` from `PlatformConfig`.',
  },
  {
    possibleIn: 1800,
    necessaryAsOf: 1800,
    level: ApplicationComplexity.Advanced,
    step: '18.0.0. Switch from `platformDynamicServer` to `platformServer`.',
    action:
      'Replace the usage of `platformDynamicServer` with `platformServer`. Also, add an `import @angular/compiler`.',
  },
  {
    possibleIn: 1800,
    necessaryAsOf: 1800,
    level: ApplicationComplexity.Medium,
    step: '18.0.0. Remove `ServerTransferStateModule` from app imports',
    action:
      'Remove all imports of `ServerTransferStateModule` from your application. It is no longer needed.',
  },
  {
    possibleIn: 1800,
    necessaryAsOf: 1800,
    level: ApplicationComplexity.Advanced,
    step: '18.0.0. Update `Route.redirectTo` to accept functions',
    action:
      '`Route.redirectTo` can now include a function in addition to a string. Any code which reads `Route` objects directly and expects `redirectTo` to be a string may need to update to account for functions as well.',
  },
  {
    possibleIn: 1800,
    necessaryAsOf: 1800,
    level: ApplicationComplexity.Advanced,
    step: '18.0.0: Guards can return `RedirectCommand`',
    action:
      '`Route` guards and resolvers can now return a `RedirectCommand` object in addition to a `UrlTree` and `boolean`. Any code which reads `Route` objects directly and expects only `boolean` or `UrlTree` may need to update to account for `RedirectCommand` as well.',
  },
  {
    possibleIn: 1800,
    necessaryAsOf: 1800,
    level: ApplicationComplexity.Medium,
    step: '18.0.0: Mark `OnPush` views dirty',
    action:
      'For any components using `OnPush` change detection, ensure they are properly marked dirty to enable host binding updates.',
  },
  {
    possibleIn: 1800,
    necessaryAsOf: 1800,
    level: ApplicationComplexity.Advanced,
    step: '18.0.0-Refresh-Newly-Created-Views',
    action:
      'Be aware that newly created views or views marked for check and reattached during change detection are now guaranteed to be refreshed in that same change detection cycle.',
  },
  {
    possibleIn: 1800,
    necessaryAsOf: 1800,
    level: ApplicationComplexity.Advanced,
    step: '18.0.0: `ComponentFixture.whenStable` matches `ApplicationRef.isStable`',
    action:
      'After aligning the semantics of `ComponentFixture.whenStable` and `ApplicationRef.isStable`, your tests may wait longer when using `whenStable`.',
  },
  {
    possibleIn: 1800,
    necessaryAsOf: 1800,
    level: ApplicationComplexity.Advanced,
    step: '18.0.0. `ComponentFixture.autoDetect` behavior more closely matches Application behavior',
    action:
      'You may experience tests failures if you have tests that rely on change detection execution order when using `ComponentFixture.autoDetect` because it now executes change detection for fixtures within `ApplicationRef.tick`. For example, this will cause test fixture to refresh before any dialogs that it creates whereas this may have been the other way around in the past.',
  },
  {
    action:
      "In the application's project directory, run `ng update @angular/core@19 @angular/cli@19` to update your application to Angular v19.",
    level: ApplicationComplexity.Basic,
    necessaryAsOf: 1900,
    possibleIn: 1900,
    step: '19.0.0_ng_update',
  },
  {
    possibleIn: 1900,
    necessaryAsOf: 1900,
    level: ApplicationComplexity.Basic,
    material: true,
    step: 'update @angular/material',
    action: 'Run `ng update @angular/material@19`.',
  },
  {
    action:
      'Angular directives, components and pipes are now standalone by default. Specify "standalone: false" for declarations that are currently declared in an NgModule. The Angular CLI will automatically update your code to reflect that.',
    level: ApplicationComplexity.Basic,
    necessaryAsOf: 1900,
    possibleIn: 1900,
    step: '19.0.0-standalone-declarations',
  },
  {
    action:
      'Remove `this.` prefix when accessing template reference variables. For example, refactor `<div #foo></div>{{ this.foo }}` to `<div #foo></div>{{ foo }}`',
    level: ApplicationComplexity.Medium,
    necessaryAsOf: 1900,
    possibleIn: 1900,
    step: '19.0.0-remove-this',
  },
  {
    action:
      'Replace usages of `BrowserModule.withServerTransition()` with injection of the `APP_ID` token to set the application `id` instead.',
    level: ApplicationComplexity.Basic,
    necessaryAsOf: 1900,
    possibleIn: 1900,
    step: '19.0.0-remove-browser-module-with-server-transition',
  },
  {
    action: 'The `factories` property in `KeyValueDiffers` has been removed.',
    level: ApplicationComplexity.Advanced,
    necessaryAsOf: 1900,
    possibleIn: 1900,
    step: '19.0.0-remove-key-value-differs-factories',
  },
  {
    action:
      'In angular.json, replace the "name" option with "project" for the `@angular/localize` builder.',
    level: ApplicationComplexity.Medium,
    necessaryAsOf: 1900,
    possibleIn: 1900,
    step: '19.0.0_localize_builder_project_option',
  },
  {
    action: 'Rename `ExperimentalPendingTasks` to `PendingTasks`.',
    level: ApplicationComplexity.Advanced,
    necessaryAsOf: 1900,
    possibleIn: 1900,
    step: '19.0.0_rename_experimental_pending_tasks',
  },
  {
    action:
      "Update tests that relied on the `Promise` timing of effects to use `await whenStable()` or call `.detectChanges()` to trigger effects. For effects triggered during change detection, ensure they don't depend on the application being fully rendered or consider using `afterRenderEffect()`. Tests using faked clocks may need to fast-forward/flush the clock.",
    level: ApplicationComplexity.Medium,
    necessaryAsOf: 1900,
    possibleIn: 1900,
    step: '19.0.0.1',
  },
  {
    action: 'Upgrade to TypeScript version 5.5 or later.',
    level: ApplicationComplexity.Basic,
    necessaryAsOf: 1900,
    possibleIn: 1900,
    step: '19.0.0.2',
  },
  {
    action:
      'Update tests using `fakeAsync` that rely on specific timing of zone coalescing and scheduling when a change happens outside the Angular zone (hybrid mode scheduling) as these timers are now affected by `tick` and `flush`.',
    level: ApplicationComplexity.Advanced,
    necessaryAsOf: 1900,
    possibleIn: 1900,
    step: '19.0.0-timers-in-zone',
  },
  {
    action:
      "When using `createComponent` API and not passing content for the first `ng-content`, provide `document.createTextNode('')` as a `projectableNode` to prevent rendering the default fallback content.",
    level: ApplicationComplexity.Medium,
    necessaryAsOf: 1900,
    possibleIn: 1900,
    step: '19.0.0-render-default-fallback',
  },
  {
    action:
      'Update tests that rely on specific timing or ordering of change detection around custom elements, as the timing may have changed due to the switch to the hybrid scheduler.',
    level: ApplicationComplexity.Advanced,
    necessaryAsOf: 1900,
    possibleIn: 1900,
    step: '19.0.0-hybrid-scheduler-timing',
  },
  {
    action:
      'Migrate from using `Router.errorHandler` to `withNavigationErrorHandler` from `provideRouter` or `errorHandler` from `RouterModule.forRoot`.',
    level: ApplicationComplexity.Basic,
    necessaryAsOf: 1900,
    possibleIn: 1900,
    step: '19.0.0-router-error-handler',
  },
  {
    action:
      'Update tests to handle errors thrown during `ApplicationRef.tick` by either triggering change detection synchronously or rejecting outstanding `ComponentFixture.whenStable` promises.',
    level: ApplicationComplexity.Advanced,
    necessaryAsOf: 1900,
    possibleIn: 1900,
    step: '19.0.0-testbed-error-handling',
  },
  {
    action: 'Update usages of `Resolve` interface to include `RedirectCommand` in its return type.',
    level: ApplicationComplexity.Medium,
    necessaryAsOf: 1900,
    possibleIn: 1900,
    step: '19.0.0-update-resolve-interface-return-type',
  },
  {
    action:
      '`fakeAsync` will flush pending timers by default. For tests that require the previous behavior, explicitly pass `{flush: false}` in the options parameter.',
    level: ApplicationComplexity.Advanced,
    necessaryAsOf: 1900,
    possibleIn: 1900,
    step: '19.0.0-update-fakeasync-to-flush-pending-timers',
  },
];
