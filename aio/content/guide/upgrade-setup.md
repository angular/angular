# Setup for upgrading from AngularJS

<!--
Question: Can we remove this file and instead direct readers to https://github.com/angular/quickstart/blob/master/README.md
-->

<div class="alert is-critical">

**Audience:** Use this guide **only** in the context of  [Upgrading from AngularJS](guide/upgrade "Upgrading from AngularJS to Angular") or [Upgrading for Performance](guide/upgrade-performance "Upgrading for Performance").
Those Upgrade guides refer to this Setup guide for information about using the [deprecated QuickStart GitHub repository](https://github.com/angular/quickstart "Deprecated Angular QuickStart GitHub repository"), which was created prior to the current Angular [CLI](cli "CLI Overview").

**For all other scenarios,** see the current instructions in [Setting up the Local Environment and Workspace](guide/setup-local "Setting up for Local Development").


</div>

<!--
The <live-example name=quickstart>QuickStart live-coding</live-example> example is an Angular _playground_.
There are also some differences from a local app, to simplify that live-coding experience.
In particular, the QuickStart live-coding example shows just the AppComponent file; it creates the equivalent of app.module.ts and main.ts internally for the playground only.
-->

This guide describes how to develop locally on your own machine.
Setting up a new project on your machine is quick and easy with the [QuickStart seed on github](https://github.com/angular/quickstart "Install the github QuickStart repo").

**Prerequisite:** Make sure you have [Node.js® and npm installed](guide/setup-local#prerequisites "Angular prerequisites").


{@a clone}
## Clone

Perform the _clone-to-launch_ steps with these terminal commands.

<code-example language="sh">
  git clone https://github.com/angular/quickstart.git quickstart
  cd quickstart
  npm install
  npm start

</code-example>



<div class="alert is-important">



`npm start` fails in _Bash for Windows_ in versions earlier than the Creator's Update (April 2017).


</div>



{@a download}


## Download
<a href="https://github.com/angular/quickstart/archive/master.zip" title="Download the QuickStart seed repository">Download the QuickStart seed</a>
and unzip it into your project folder. Then perform the remaining steps with these terminal commands.

<code-example language="sh">
  cd quickstart
  npm install
  npm start

</code-example>



<div class="alert is-important">



`npm start` fails in _Bash for Windows_ in versions earlier than the Creator's Update (April 2017).


</div>



{@a non-essential}



## Delete _non-essential_ files (optional)

You can quickly delete the _non-essential_ files that concern testing and QuickStart repository maintenance
(***including all git-related artifacts*** such as the `.git` folder and `.gitignore`!).


<div class="alert is-important">



Do this only in the beginning to avoid accidentally deleting your own tests and git setup!


</div>



Open a terminal window in the project folder and enter the following commands for your environment:

### OS/X (bash)

<code-example language="sh">
  xargs rm -rf &lt; non-essential-files.osx.txt
  rm src/app/*.spec*.ts
  rm non-essential-files.osx.txt

</code-example>



### Windows

<code-example language="sh">
  for /f %i in (non-essential-files.txt) do del %i /F /S /Q
  rd .git /s /q
  rd e2e /s /q

</code-example>



{@a seed}



## What's in the QuickStart seed?



The **QuickStart seed** provides a basic QuickStart playground application and other files necessary for local development.
Consequently, there are many files in the project folder on your machine,
most of which you can [learn about later](guide/file-structure).


<div class="alert is-helpful">

**Reminder:** The "QuickStart seed" example was created prior to the Angular CLI, so there are some differences between what is described here and an Angular CLI application.

</div>

{@a app-files}


Focus on the following three TypeScript (`.ts`) files in the **`/src`** folder.


<div class='filetree'>

  <div class='file'>
    src
  </div>

  <div class='children'>

    <div class='file'>
      app
    </div>

    <div class='children'>

      <div class='file'>
        app.component.ts
      </div>

      <div class='file'>
        app.module.ts
      </div>

    </div>

    <div class='file'>
      main.ts
    </div>

  </div>

</div>



<code-tabs>

  <code-pane header="src/app/app.component.ts" path="setup/src/app/app.component.ts">

  </code-pane>

  <code-pane header="src/app/app.module.ts" path="setup/src/app/app.module.ts">

  </code-pane>

  <code-pane header="src/main.ts" path="setup/src/main.ts">

  </code-pane>

</code-tabs>



All guides and cookbooks have _at least these core files_.
Each file has a distinct purpose and evolves independently as the application grows.

Files outside `src/` concern building, deploying, and testing your application.
They include configuration files and external dependencies.

Files inside `src/` "belong" to your application.
Add new Typescript, HTML and CSS files inside the `src/` directory, most of them inside `src/app`,
unless told to do otherwise.

The following are all in `src/`


<style>
  td, th {vertical-align: top}
</style>



<table width="100%">

  <col width="20%">

  </col>

  <col width="80%">

  </col>

  <tr>

    <th>
      File
    </th>

    <th>
      Purpose
    </th>

  </tr>

  <tr>

    <td>
      <code>app/app.component.ts</code>
    </td>

    <td>


      Defines the same `AppComponent` as the one in the QuickStart playground.
      It is the **root** component of what will become a tree of nested components
      as the application evolves.
    </td>

  </tr>

  <tr>

    <td>
      <code>app/app.module.ts</code>
    </td>

    <td>


      Defines `AppModule`, the  [root module](guide/bootstrapping "AppModule: the root module") that tells Angular how to assemble the application.
      When initially created, it declares only the `AppComponent`.
      Over time, you add more components to declare.
    </td>

  </tr>

  <tr>

    <td>
      <code>main.ts</code>
    </td>

    <td>


      Compiles the application with the [JIT compiler](guide/glossary#jit) and
      [bootstraps](guide/bootstrapping)
      the application's main module (`AppModule`) to run in the browser.
      The JIT compiler is a reasonable choice during the development of most projects and
      it's the only viable choice for a sample running in a _live-coding_ environment such as Stackblitz.
      Alternative [compilation](guide/aot-compiler), [build](guide/build), and [deployment](guide/deployment) options are available.

    </td>

  </tr>

</table>


## Appendix: Develop locally with IE

If you develop Angular locally with `ng serve`, a `websocket` connection is set up automatically between browser and local development server, so when your code changes, the browser can automatically refresh.

In Windows, by default, one application can only have 6 websocket connections, <a href="https://msdn.microsoft.com/library/ee330736%28v=vs.85%29.aspx?f=255&MSPPError=-2147217396#websocket_maxconn" title="MSDN WebSocket settings">MSDN WebSocket Settings</a>.
So when IE is refreshed (manually or automatically by `ng serve`), sometimes the websocket does not close properly. When websocket connections exceed the limitations, a `SecurityError` will be thrown. This error will not affect the Angular application, you can restart IE to clear this error, or modify the windows registry to update the limitations.

## Appendix: Test using `fakeAsync()/waitForAsync()`

If you use the `fakeAsync()/waitForAsync()` helper functions to run unit tests (for details, read the [Testing guide](guide/testing-components-scenarios#fake-async)), you need to import `zone.js/testing` in your test setup file.

<div class="alert is-important">
If you create project with `Angular/CLI`, it is already imported in `src/test.ts`.
</div>

And in the earlier versions of `Angular`, the following files were imported or added in your html file:

```
import 'zone.js/plugins/long-stack-trace-zone';
import 'zone.js/plugins/proxy';
import 'zone.js/plugins/sync-test';
import 'zone.js/plugins/jasmine-patch';
import 'zone.js/plugins/async-test';
import 'zone.js/plugins/fake-async-test';
```

You can still load those files separately, but the order is important, you must import `proxy` before `sync-test`, `async-test`, `fake-async-test` and `jasmine-patch`. And you also need to import `sync-test` before `jasmine-patch`, so it is recommended to just import `zone-testing` instead of loading those separated files.
