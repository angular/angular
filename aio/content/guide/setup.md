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
You [should develop locally](#why-locally "Why develop locally") on your own machine ... and that's also how we think you should learn Angular.
</span>

Setting up a new project on your machine is quick and easy with the **QuickStart seed**,
maintained [on github](!{_qsRepo} "Install the github QuickStart repo"). 
Make sure you have [!{_prereq} installed](#install-prerequisites "What if you don't have !{_prereq}?").
Then ...
1. Create a project folder (you can call it `quickstart` and rename it later).
1. [Clone](#clone "Clone it from github") or [download](#download "download it from github") the **QuickStart seed** into your project folder.
1. !{_Install} [!{_npm}](#install-prerequisites "What if you don't have !{_prereq}?") packages.
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
      Defines `AppModule`, the  [root module](appmodule.html "AppModule: the root module") that tells Angular how to assemble the application.      
            Right now it declares only the `AppComponent`.      
            Soon there will be more components to declare.
    </td>


  </tr>


  <tr>

    <td>
      <ngio-ex>main.ts</ngio-ex>
    </td>


    <td>
      Compiles the application with the [JIT compiler](../glossary.html#jit) and      
            [bootstraps](appmodule.html#main "bootstrap the application")       
            the application's main module (`AppModule`) to run in the browser.      
            The JIT compiler is a reasonable choice during the development of most projects and      
            it's the only viable choice for a sample running in a _live-coding_ environment like Plunker.      
            You'll learn about alternative compiling and [deployment](deployment.html) options later in the documentation.      
            
    </td>


  </tr>


</table>


### Next Step

If you're new to Angular, we recommend staying on the [learning path](learning-angular.html "Angular learning path").
<br></br><br></br>

{@a install-prerequisites}

## Appendix: !{_prereq}