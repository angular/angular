# Setup for local development

{@a develop-locally}

The <live-example name=quickstart>QuickStart live-coding</live-example> example is an Angular _playground_.
It's not where you'd develop a real application.
You [should develop locally](guide/setup#why-locally "Why develop locally") on your own machine ... and that's also how we think you should learn Angular.

Setting up a new project on your machine is quick and easy with the **QuickStart seed**,
maintained [on github](https://github.com/angular/quickstart "Install the github QuickStart repo").


Make sure you have [node and npm installed](guide/setup#install-prerequisites "What if you don't have node and npm?").

{@a clone}


## Clone

Perform the _clone-to-launch_ steps with these terminal commands.


<code-example language="sh" class="code-shell">
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


<code-example language="sh" class="code-shell">
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

<code-example language="sh" class="code-shell">
  xargs rm -rf &lt; non-essential-files.osx.txt
  rm src/app/*.spec*.ts
  rm non-essential-files.osx.txt

</code-example>



### Windows

<code-example language="sh" class="code-shell">
  for /f %i in (non-essential-files.txt) do del %i /F /S /Q
  rd .git /s /q
  rd e2e /s /q

</code-example>



{@a seed}



## What's in the QuickStart seed?



The **QuickStart seed** contains the same application as the QuickStart playground.
But its true purpose is to provide a solid foundation for _local_ development.
Consequently, there are _many more files_ in the project folder on your machine,
most of which you can [learn about later](guide/setup-systemjs-anatomy "Setup Anatomy").



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

  <code-pane title="src/app/app.component.ts" path="setup/src/app/app.component.ts">

  </code-pane>

  <code-pane title="src/app/app.module.ts" path="setup/src/app/app.module.ts">

  </code-pane>

  <code-pane title="src/main.ts" path="setup/src/main.ts">

  </code-pane>

</code-tabs>



All guides and cookbooks have _at least these core files_.
Each file has a distinct purpose and evolves independently as the application grows.

Files outside `src/` concern building, deploying, and testing your app.
They include configuration files and external dependencies.

Files inside `src/` "belong" to your app.
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
      Right now it declares only the `AppComponent`.
      Soon there will be more components to declare.
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
      it's the only viable choice for a sample running in a _live-coding_ environment like Stackblitz.
      You'll learn about alternative compiling and [deployment](guide/deployment) options later in the documentation.

    </td>

  </tr>

</table>



<div class="l-sub-section">



### Next Step

If you're new to Angular, we recommend you follow the [tutorial](tutorial "Tour of Heroes tutorial").


</div>

<br></br><br></br>

{@a install-prerequisites}



## Appendix: node and npm


Node.js and npm are essential to modern web development with Angular and other platforms.
Node powers client development and build tools.
The _npm_ package manager, itself a _node_ application, installs JavaScript libraries.

<a href="https://docs.npmjs.com/getting-started/installing-node" target="_blank" title="Installing Node.js and updating npm">
Get them now</a> if they're not already installed on your machine.

**Verify that you are running node `v4.x.x` or higher and npm `3.x.x` or higher**
by running the commands `node -v` and `npm -v` in a terminal/console window.
Older versions produce errors.

We recommend [nvm](https://github.com/creationix/nvm) for managing multiple versions of node and npm.
You may need [nvm](https://github.com/creationix/nvm) if you already have projects running on your machine that
use other versions of node and npm.


{@a why-locally}



## Appendix: Why develop locally

<live-example title="QuickStart Seed in Stackblitz">Live coding</live-example> in the browser is a great way to explore Angular.

Links on almost every documentation page open completed samples in the browser.
You can play with the sample code, share your changes with friends, and download and run the code on your own machine.

The [QuickStart](guide/quickstart "Angular QuickStart Playground") shows just the `AppComponent` file.
It creates the equivalent of `app.module.ts` and `main.ts` internally _for the playground only_.
so the reader can discover Angular without distraction.
The other samples are based on the QuickStart seed.

As much fun as this is ...

* you can't ship your app in Stackblitz
* you aren't always online when writing code
* transpiling TypeScript in the browser is slow
* the type support, refactoring, and code completion only work in your local IDE

Use the <live-example title="QuickStart Seed in Stackblitz">live coding</live-example> environment as a _playground_,
a place to try the documentation samples and experiment on your own.
It's the perfect place to reproduce a bug when you want to
<a href="https://github.com/angular/angular/issues/new" title="File a documentation issue">file a documentation issue</a> or
<a href="https://github.com/angular/angular/issues/new" title="File an Angular issue">file an issue with Angular itself</a>.

For real development, we strongly recommend [developing locally](guide/setup#develop-locally).

## Appendix: develop locally with IE

If you develop angular locally with `ng serve`, there will be `websocket` connection being setup automatically between browser and local dev server, so when your code change, browser can automatically refresh.

In windows, by default one application can only have 6 websocket connections, <a href="https://msdn.microsoft.com/library/ee330736%28v=vs.85%29.aspx?f=255&MSPPError=-2147217396#websocket_maxconn" title="MSDN WebSocket settings">MSDN WebSocket Settings</a>.
So if IE was refreshed manunally or automatically by `ng serve`, sometimes, the websocket will not close properly, when websocket connections exceed limitations, `SecurityError` will be thrown, this error will not affect the angular application, you can just restart IE to clear this error, or modify the windows registry to update the limitations.
