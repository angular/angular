# Setup for upgrading from AngularJS

<!--todo: Question: Can we remove this file and instead direct readers to https://github.com/angular/quickstart/blob/master/README.md -->

<div class="alert is-critical">

**AUDIENCE**: <br />
Use this guide **only** in the context of  [Upgrading from AngularJS](guide/upgrade "Upgrading from AngularJS to Angular") or [Upgrading for Performance](guide/upgrade-performance "Upgrading for Performance").
Those Upgrade guides refer to this Setup guide for information about using the [deprecated QuickStart GitHub repository](https://github.com/angular/quickstart "Deprecated Angular QuickStart GitHub repository"), which was created prior to the current Angular [CLI](cli "CLI Overview").

**For all other scenarios**, see the current instructions in [Setting up the Local Environment and Workspace](guide/setup-local "Setting up for Local Development").

</div>

<!--
The <live-example name=quickstart>QuickStart live-coding</live-example> example is an Angular *playground*.
There are also some differences from a local app, to simplify that live-coding experience.
In particular, the QuickStart live-coding example shows just the AppComponent file; it creates the equivalent of app.module.ts and main.ts internally for the playground only.
-->

This guide describes how to develop locally on your own machine.
Setting up a new project on your machine is quick and easy with the [QuickStart seed on GitHub](https://github.com/angular/quickstart "Install the github QuickStart repo").

## Prerequisites

Make sure you have [Node.js&reg; and npm installed](guide/setup-local#prerequisites "Angular prerequisites").

<a id="clone"></a>

## Clone

Perform the *clone-to-launch* steps with these terminal commands.

<code-example format="shell" language="shell">

git clone https://github.com/angular/quickstart.git quickstart
cd quickstart
npm install

</code-example>

<a id="download"></a>

## Download

[Download the QuickStart seed](https://github.com/angular/quickstart/archive/master.zip "Download the QuickStart seed repository") and unzip it into your project folder.
Then perform the remaining steps with these terminal commands.

<code-example format="shell" language="shell">

cd quickstart
npm install

</code-example>

<a id="non-essential"></a>

## Delete *non-essential* files (optional)

You can quickly delete the *non-essential* files that concern testing and QuickStart repository maintenance \(***including all git-related artifacts*** such as the `.git` folder and `.gitignore`\).

<div class="alert is-important">

Do this only in the beginning to avoid accidentally deleting your own tests and git setup.

</div>

Open a terminal window in the project folder and enter the following commands for your environment:

### macOS / Mac OS X (bash)

<code-example format="shell" language="shell">

xargs rm -rf &lt; non-essential-files.osx.txt
rm src/app/*.spec*.ts
rm non-essential-files.osx.txt

</code-example>

### Windows

<code-example format="shell" language="shell">

for /f %i in (non-essential-files.txt) do del %i /F /S /Q
rd .git /s /q
rd e2e /s /q

</code-example>

## Update dependency versions

Since the quickstart repository is deprecated, it is no longer updated and you need some additional steps to use the latest Angular.

1.  Remove the obsolete `@angular/http` package \(both from `package.json > dependencies` and `src/systemjs.config.js > SystemJS.config() > map`\).
1.  Install the latest versions of the Angular framework packages by running:

    <code-example format="shell" language="shell">

    npm install --save &commat;angular/common&commat;latest &commat;angular/compiler&commat;latest &commat;angular/core&commat;latest &commat;angular/forms&commat;latest &commat;angular/platform-browser&commat;latest &commat;angular/platform-browser-dynamic&commat;latest &commat;angular/router&commat;latest

    </code-example>

1.  Install the latest versions of other packages used by Angular \(RxJS, TypeScript, Zone.js\) by running:

    <code-example format="shell" language="shell">

    npm install --save rxjs&commat;latest zone.js&commat;latest
    npm install --save-dev typescript&commat;latest

    </code-example>

1.  Install the `systemjs-plugin-babel` package.
    This will later be used to load the Angular framework files, which are in ES2015 format, using SystemJS.

    <code-example format="shell" language="shell">

    npm install --save systemjs-plugin-babel&commat;latest

    </code-example>

1.  In order to be able to load the latest Angular framework packages \(in ES2015 format\) correctly, replace the relevant entries in `src/systemjs.config.js`:

    <code-examples format="javascript" language="javascript" path="upgrade-phonecat-2-hybrid/systemjs.config.1.js" region="angular-paths"></code-example>

1.  In order to be able to load the latest RxJS package correctly, replace the relevant entries in `src/systemjs.config.js`:

    <code-examples format="javascript" language="javascript" path="upgrade-phonecat-2-hybrid/systemjs.config.1.js" region="rxjs-paths"></code-example>

1.  In order to be able to load the `tslib` package \(which is required for files transpiled by TypeScript\), add the following entry to `src/systemjs.config.js`:

    <code-examples format="javascript" language="javascript" path="upgrade-phonecat-2-hybrid/systemjs.config.1.js" region="tslib-paths"></code-example>

1.  In order for SystemJS to be able to load the ES2015 Angular files correctly, add the following entries to `src/systemjs.config.js`:

    <code-examples format="javascript" language="javascript" path="upgrade-phonecat-2-hybrid/systemjs.config.1.js" region="plugin-babel"></code-example>

1.  Finally, in order to prevent TypeScript typecheck errors for dependencies, add the following entry to `src/tsconfig.json`:

    <code-example format="json" language="json">

    {
      "compilerOptions": {
        "skipLibCheck": true,
        // &hellip;
      }
    }

    </code-example>

With that, you can now run `npm start` and have the application built and served.
Once built, the application will be automatically opened in a new browser tab and it will be automatically reloaded when you make changes to the source code.

<a id="seed"></a>

## What's in the QuickStart seed?

The **QuickStart seed** provides a basic QuickStart playground application and other files necessary for local development.
Consequently, there are many files in the project folder on your machine, most of which you can [learn about later](guide/file-structure).

<div class="alert is-helpful">

**Reminder:** The "QuickStart seed" example was created prior to the Angular CLI, so there are some differences between what is described here and an Angular CLI application.

</div>

<a id="app-files"></a>

Focus on the following three TypeScript \(`.ts`\) files in the `/src` folder.

<div class="filetree">
  <div class="file">
    src
  </div>
  <div class="children">
    <div class="file">
      app
    </div>
    <div class="children">
      <div class="file">
        app.component.ts
      </div>
      <div class="file">
        app.module.ts
      </div>
    </div>
    <div class="file">
      main.ts
    </div>
  </div>
</div>

<code-tabs>
    <code-pane header="src/app/app.component.ts" path="setup/src/app/app.component.ts"></code-pane>
    <code-pane header="src/app/app.module.ts" path="setup/src/app/app.module.ts"></code-pane>
    <code-pane header="src/main.ts" path="setup/src/main.ts"></code-pane>
</code-tabs>

All guides and cookbooks have *at least these core files*.
Each file has a distinct purpose and evolves independently as the application grows.

Files outside `src/` concern building, deploying, and testing your application.
They include configuration files and external dependencies.

Files inside `src/` "belong" to your application.
Add new Typescript, HTML and CSS files inside the `src/` directory, most of them inside `src/app`, unless told to do otherwise.

The following are all in `src/`

| File                 | Purpose |
|:---                  |:---     |
| app/app.component.ts | Defines the same `AppComponent` as the one in the QuickStart playground. It is the **root** component of what will become a tree of nested components as the application evolves.                                                                                                                                                                                                                                                                                                                      |
| app/app.module.ts    | Defines `AppModule`, the  [root module](guide/bootstrapping "AppModule: the root module") that tells Angular how to assemble the application. When initially created, it declares only the `AppComponent`. Over time, you add more components to declare.                                                                                                                                                                                                                                              |
| main.ts              | Compiles the application with the [JIT compiler](guide/glossary#jit) and [bootstraps](guide/bootstrapping) the application's main module \(`AppModule`\) to run in the browser. The JIT compiler is a reasonable choice during the development of most projects and it's the only viable choice for a sample running in a *live-coding* environment such as Stackblitz. Alternative [compilation](guide/aot-compiler), [build](guide/build), and [deployment](guide/deployment) options are available. |

## Appendix: Test using `fakeAsync()/waitForAsync()`

If you use the `fakeAsync()` or `waitForAsync()` helper functions to run unit tests \(for details, read the [Testing guide](guide/testing-components-scenarios#fake-async)\), you need to import `zone.js/testing` in your test setup file.

<div class="alert is-important">

If you create project with `Angular/CLI`, it is already imported in `src/test.ts`.

</div>

And in the earlier versions of `Angular`, the following files were imported or added in your html file:

<code-example format="html" language="html">

import 'zone.js/plugins/long-stack-trace-zone';
import 'zone.js/plugins/proxy';
import 'zone.js/plugins/sync-test';
import 'zone.js/plugins/jasmine-patch';
import 'zone.js/plugins/async-test';
import 'zone.js/plugins/fake-async-test';

</code-example>

You can still load those files separately, but the order is important, you must import `proxy` before `sync-test`, `async-test`, `fake-async-test` and `jasmine-patch`.
And you also need to import `sync-test` before `jasmine-patch`, so it is recommended to just import `zone-testing` instead of loading those separated files.

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
