# Create a new project

Use the `ng new` command to start creating your **Tour of Heroes** application.

This tutorial:

1.  Sets up your environment.
2.  Creates a new workspace and initial application project.
3.  Serves the application.
4.  Makes changes to the new application.

<div class="alert is-helpful">

To view the application's code, see the <live-example></live-example>.

</div>

## Set up your environment

To set up your development environment, follow the instructions in [Local Environment Setup](guide/setup-local "Setting up for Local Development").

## Create a new workspace and an initial application

You develop applications in the context of an Angular [workspace](guide/glossary#workspace).
A *workspace* contains the files for one or more [projects](guide/glossary#project).
A *project* is the set of files that make up an application or a library.

To create a new workspace and an initial project:

1.  Ensure that you aren't already in an Angular workspace directory.
    For example, if you're in the Getting Started workspace from an earlier exercise, navigate to its parent.

2.  Run `ng new` followed by the application name as shown here:

    <code-example format="shell" language="shell">

    ng new angular-tour-of-heroes

    </code-example>

3.  `ng new` prompts you for information about features to include in the initial project.
    Accept the defaults by pressing the Enter or Return key.

`ng new` installs the necessary `npm` packages and other dependencies that Angular requires.
This can take a few minutes.

`ng new` also creates the following workspace and starter project files:

*   A new workspace, with a root directory named `angular-tour-of-heroes`
*   An initial skeleton application project in the `src/app` subdirectory
*   Related configuration files

The initial application project contains a simple application that's ready to run.

## Serve the application

Go to the workspace directory and launch the application.

<code-example format="shell" language="shell">

cd angular-tour-of-heroes
ng serve --open

</code-example>

<div class="alert is-helpful">

The `ng serve` command:

* Builds the application
* Starts the development server
* Watches the source files
* Rebuilds the application as you make changes

The `--open` flag opens a browser to `http://localhost:4200`.

</div>

You should see the application running in your browser.

## Angular components

The page you see is the *application shell*.
The shell is controlled by an Angular **component** named `AppComponent`.

*Components* are the fundamental building blocks of Angular applications.
They display data on the screen, listen for user input, and take action based on that input.

## Make changes to the application

Open the project in your favorite editor or IDE. Navigate to the `src/app` directory to edit the starter application.
In the IDE, locate these files, which make up the `AppComponent` that you just created:

| Files                | Details |
|:---                  |:---     |
| `app.component.ts`   | The component class code, written in TypeScript. |
| `app.component.html` | The component template, written in HTML.         |
| `app.component.css`  | The component's private CSS styles.              |

<div class="alert is-important">

When you ran `ng new`, Angular created test specifications for your new application.
Unfortunately, making these changes breaks your newly created specifications.

That won't be a problem because Angular testing is outside the scope of this tutorial and won't be used.

To learn more about testing with Angular, see [Testing](guide/testing).

</div>

### Change the application title

Open the `app.component.ts` and change the `title` property value to 'Tour of Heroes'.

<code-example header="app.component.ts (class title property)" path="toh-pt0/src/app/app.component.ts" region="set-title"></code-example>

Open `app.component.html` and delete the default template that `ng new` created.
Replace it with the following line of HTML.

<code-example header="app.component.html (template)" path="toh-pt0/src/app/app.component.html"></code-example>

The double curly braces are Angular's *interpolation binding* syntax.
This interpolation binding presents the component's `title` property value inside the HTML header tag.

The browser refreshes and displays the new application title.

<a id="app-wide-styles"></a>

### Add application styles

Most apps strive for a consistent look across the application.
`ng new` created an empty `styles.css` for this purpose.
Put your application-wide styles there.

Open `src/styles.css` and add the code below to the file.

<code-example header="src/styles.css (excerpt)" path="toh-pt0/src/styles.1.css"></code-example>

## Final code review

Here are the code files discussed on this page.

<code-tabs>
    <code-pane header="src/app/app.component.ts" path="toh-pt0/src/app/app.component.ts"></code-pane>
    <code-pane header="src/app/app.component.html" path="toh-pt0/src/app/app.component.html"></code-pane>
    <code-pane header="src/styles.css (excerpt)" path="toh-pt0/src/styles.1.css"></code-pane>
</code-tabs>

## Summary

*   You created the initial application structure using `ng new`.
*   You learned that Angular components display data
*   You used the double curly braces of interpolation to display the application title

@reviewed 2022-02-28
