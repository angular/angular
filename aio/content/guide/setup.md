@title
Setup for local development

@intro
Install the Angular QuickStart seed for faster, more efficient development on your machine.

@description



{@a develop-locally}
## Setup a local development environment

<span if-docs="ts">
The <live-example name=quickstart>QuickStart live-coding</live-example> example is an Angular _playground_.
It's not where you'd develop a real application. 
You [should develop locally](guide/setup#why-locally "Why develop locally") on your own machine ... and that's also how we think you should learn Angular.
</span>

Setting up a new project on your machine is quick and easy with the **QuickStart seed**,
maintained [on github](guide/!{_qsRepo} "Install the github QuickStart repo"). 
Make sure you have [!{_prereq} installed](guide/setup#install-prerequisites "What if you don't have !{_prereq}?").
Then ...
1. Create a project folder (you can call it `quickstart` and rename it later).
1. [Clone](guide/setup#clone "Clone it from github") or [download](guide/setup#download "download it from github") the **QuickStart seed** into your project folder.
1. !{_Install} [!{_npm}](guide/setup#install-prerequisites "What if you don't have !{_prereq}?") packages.
1. Run `!{_npm} !{_start}` to launch the sample application.


{@a clone}
### Clone

Perform the _clone-to-launch_ steps with these terminal commands.

<code-example language="sh" class="code-shell">
  git clone   .git quickstart  
    cd quickstart  
       
       
    
</code-example>



~~~ {.alert.is-important}

`npm start` fails in _Bash for Windows_ which does not support networking to servers as of January, 2017.


~~~



{@a download}
### Download
<a href="!{_qsRepoZip}" title="Download the QuickStart seed repository">Download the QuickStart seed</a>
and unzip it into your project folder. Then perform the remaining steps with these terminal commands.

<code-example language="sh" class="code-shell">
  cd quickstart  
       
       
    
</code-example>



~~~ {.alert.is-important}

`npm start` fails in _Bash for Windows_ which does not support networking to servers as of January, 2017.


~~~



{@a non-essential}

## Delete _non-essential_ files (optional)

You can quickly delete the _non-essential_ files that concern testing and QuickStart repository maintenance
(***including all git-related artifacts*** such as the `.git` folder and `.gitignore`!).


~~~ {.alert.is-important}

Do this only in the beginning to avoid accidentally deleting your own tests and git setup!


~~~

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
most of which you can [learn about later](guide/setup-systemjs-anatomy).



{@a app-files}
Focus on the following three TypeScript (`.ts`) files in the **`/src`** folder.

<aio-filetree>

  <aio-folder>
    src
    <aio-folder>
      app
      <aio-file>
        app.component.ts
      </aio-file>


      <aio-file>
        app.module.ts
      </aio-file>


    </aio-folder>


    <aio-file>
      main.ts
    </aio-file>


  </aio-folder>


</aio-filetree>



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
      <ngio-ex>app/app.component.ts</ngio-ex>
    </td>


    <td>
      Defines the same `AppComponent` as the one in the QuickStart !{_playground}.      
            It is the **root** component of what will become a tree of nested components      
            as the application evolves. 
    </td>


  </tr>


  <tr if-docs="ts">

    <td>
      <code>app/app.module.ts</code>
    </td>


    <td>
      Defines `AppModule`, the  [root module](guide/appmodule) that tells Angular how to assemble the application.      
            Right now it declares only the `AppComponent`.      
            Soon there will be more components to declare.
    </td>


  </tr>


  <tr>

    <td>
      <ngio-ex>main.ts</ngio-ex>
    </td>


    <td>
      Compiles the application with the [JIT compiler](glossary) and      
            [bootstraps](guide/appmodule)       
            the application's main module (`AppModule`) to run in the browser.      
            The JIT compiler is a reasonable choice during the development of most projects and      
            it's the only viable choice for a sample running in a _live-coding_ environment like Plunker.      
            You'll learn about alternative compiling and [deployment](guide/deployment) options later in the documentation.      
            
    </td>


  </tr>


</table>



~~~ {.l-sub-section}

### Next Step

If you're new to Angular, we recommend staying on the [learning path](guide/learning-angular).


~~~

<br></br><br></br>

{@a install-prerequisites}

## Appendix: !{_prereq}
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
