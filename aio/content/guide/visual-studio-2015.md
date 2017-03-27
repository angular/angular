@title
Visual Studio 2015 QuickStart

@intro
Use Visual Studio 2015 with the QuickStart files.

@description
<a id="top"></a>Some developers prefer Visual Studio as their Integrated Development Environment (IDE).

This cookbook describes the steps required to set up and use the
Angular QuickStart files in **Visual Studio 2015 within an ASP.NET 4.x project**.

~~~ {.l-sub-section}

There is no *live example* for this cookbook because it describes Visual Studio, not the application.


~~~


<a id="asp-net-4"></a>## ASP.NET 4.x Project

This cookbook explains how to set up the QuickStart files with an **ASP.NET 4.x project** in
Visual Studio 2015.

~~~ {.l-sub-section}

If you prefer a `File | New Project` experience and are using **ASP.NET Core**, 
then consider the _experimental_
<a href="http://blog.stevensanderson.com/2016/10/04/angular2-template-for-visual-studio/" target="_blank">ASP.NET Core + Angular template for Visual Studio 2015</a>. 
Note that the resulting code does not map to the docs. Adjust accordingly.   


~~~

The steps are as follows:

- [Prerequisite](guide/visual-studio-2015#prereq1): Install Node.js
- [Prerequisite](guide/visual-studio-2015#prereq2): Install Visual Studio 2015 Update 3
- [Prerequisite](guide/visual-studio-2015#prereq3): Configure External Web tools
- [Prerequisite](guide/visual-studio-2015#prereq4): Install TypeScript 2 for Visual Studio 2015
- [Step 1](guide/visual-studio-2015#download): Download the QuickStart files
- [Step 2](guide/visual-studio-2015#create-project): Create the Visual Studio ASP.NET project
- [Step 3](guide/visual-studio-2015#copy): Copy the QuickStart files into the ASP.NET project folder
- [Step 4](guide/visual-studio-2015#restore): Restore required packages
- [Step 5](guide/visual-studio-2015#build-and-run): Build and run the app


<h2 id='prereq1'>
  Prerequisite: Node.js
</h2>

Install **[Node.js® and npm](https://nodejs.org/en/download/)**
if they are not already on your machine.

~~~ {.l-sub-section}

**Verify that you are running node version `4.6.x` or greater, and npm `3.x.x` or greater**
by running `node -v` and `npm -v` in a terminal/console window.
Older versions produce errors.


~~~



<h2 id='prereq2'>
  Prerequisite: Visual Studio 2015 Update 3
</h2>

The minimum requirement for developing Angular applications with Visual Studio is Update 3.
Earlier versions do not follow the best practices for developing applications with TypeScript.
To view your version of Visual Studio 2015, go to `Help | About Visual Studio`.

If you don't have it, install **[Visual Studio 2015 Update 3](https://www.visualstudio.com/en-us/news/releasenotes/vs2015-update3-vs)**.
Or use `Tools | Extensions and Updates` to update to Update 3 directly from Visual Studio 2015.


<h2 id='prereq3'>
  Prerequisite: Configure External Web tools
</h2>

Configure Visual Studio to use the global external web tools instead of the tools that ship with Visual Studio:

  * Open the **Options** dialog with `Tools` | `Options`
  * In the tree on the left, select `Projects and Solutions` | `External Web Tools`.
  * On the right, move the `$(PATH)` entry above the `$(DevEnvDir`) entries. This tells Visual Studio to
    use the external tools (such as npm) found in the global path before using its own version of the external tools.
  * Click OK to close the dialog.
  * Restart Visual Studio for this change to take effect.

Visual Studio will now look first for external tools in the current workspace and 
if not found then look in the global path and if it is not found there, Visual Studio
will use its own versions of the tools.


<h2 id='prereq4'>
  Prerequisite: Install TypeScript 2 for Visual Studio 2015
</h2>

While Visual Studio Update 3 ships with TypeScript support out of the box, it currently doesn’t ship with TypeScript 2, 
which you need to develop Angular applications.

To install TypeScript 2:
 * Download and install **[TypeScript 2.0 for Visual Studio 2015](http://download.microsoft.com/download/6/D/8/6D8381B0-03C1-4BD2-AE65-30FF0A4C62DA/TS2.0.3-TS-release20-nightly-20160921.1/TypeScript_Dev14Full.exe)**
 * OR install it with npm: `npm install -g typescript@2.0`.

You can find out more about TypeScript 2 support in Visual studio **[here](https://blogs.msdn.microsoft.com/typescript/2016/09/22/announcing-typescript-2-0/)**

At this point, Visual Studio is ready. It’s a good idea to close Visual Studio and 
restart it to make sure everything is clean.


<h2 id='download'>
  Step 1: Download the QuickStart files
</h2>

[Download the QuickStart source](https://github.com/angular/quickstart)
from github. If you downloaded as a zip file, extract the files.


<h2 id='create-project'>
  Step 2: Create the Visual Studio ASP.NET project
</h2>

Create the ASP.NET 4.x project in the usual way as follows:

* In Visual Studio, select `File` | `New` | `Project` from the menu.
* In the template tree, select `Templates` | `Visual C#` (or `Visual Basic`) | `Web`.
* Select the `ASP.NET Web Application` template, give the project a name, and click OK.
* Select the desired ASP.NET 4.5.2 template and click OK.


~~~ {.l-sub-section}

In this cookbook we'll select the `Empty` template with no added folders, 
no authentication and no hosting. Pick the template and options appropriate for your project.


~~~



<h2 id='copy'>
  Step 3: Copy the QuickStart files into the ASP.NET project folder
</h2>

Copy the QuickStart files we downloaded from github into the folder containing the `.csproj` file.
Include the files in the Visual Studio project as follows:

* Click the `Show All Files` button in Solution Explorer to reveal all of the hidden files in the project.
* Right-click on each folder/file to be included in the project and select `Include in Project`.
  Minimally, include the following folder/files:
  * app folder (answer *No*  if asked to search for TypeScript Typings)
  * styles.css
  * index.html
  * package.json
  * tsconfig.json
  

<h2 id='restore'>
  Step 4: Restore the required packages
</h2>

Restore the packages required for an Angular application as follows:

* Right-click on the `package.json` file in Solution Explorer and select `Restore Packages`.
  <br>This uses `npm` to install all of the packages defined in the `package.json` file. 
  It may take some time.
* If desired, open the Output window (`View` | `Output`) to watch the npm commands execute.
* Ignore the warnings.
* When the restore is finished, a message should say: `npm command completed with exit code 0`.
* Click the `Refresh` icon in Solution Explorer.
* **Do not** include the `node_modules` folder in the project. Let it be a hidden project folder.


<h2 id='build-and-run'>
  Step 5: Build and run the app
</h2>

First, ensure that `index.html` is set as the start page.
Right-click `index.html` in Solution Explorer and select option `Set As Start Page`.

Build and launch the app with debugger by clicking the **Run** button or press `F5`.

~~~ {.l-sub-section}

It's faster to run without the debugger by pressing `Ctrl-F5`.

~~~

The default browser opens and displays the QuickStart sample application.

Try editing any of the project files. *Save* and refresh the browser to
see the changes. 


<h2 id='routing'>
  Note on Routing Applications
</h2>

If this application used the Angular router, a browser refresh could return a *404 - Page Not Found*.
Look at the address bar. Does it contain a navigation url (a "deep link") ... any path other than `/` or `/index.html`? 

You'll have to configure the server to return `index.html` for these requests.
Until you do, remove the navigation path and refresh again. 