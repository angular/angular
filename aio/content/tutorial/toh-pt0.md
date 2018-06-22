<h1 class="no-toc">Tutorial: Tour of Heroes</h1>

The _Tour of Heroes_ tutorial covers the fundamentals of Angular.  
In this tutorial you will build an app that helps a staffing agency manage its stable of heroes.

This basic app has many of the features you'd expect to find in a data-driven application.
It acquires and displays a list of heroes, edits a selected hero's detail, and navigates among different views of heroic data.

By the end of the tutorial you will be able to do the following:

* Use built-in Angular directives to show and hide elements and display lists of hero data.
* Create Angular components to display hero details and show an array of heroes.
* Use one-way data binding for read-only data.
* Add editable fields to update a model with two-way data binding.
* Bind component methods to user events, like keystrokes and clicks.
* Enable users to select a hero from a master list and edit that hero in the details view. 
* Format data with pipes.
* Create a shared service to assemble the heroes.
* Use routing to navigate among different views and their components.

You'll learn enough Angular to get started and gain confidence that
Angular can do whatever you need it to do. 

After completing all tutorial steps, the final app will look like this <live-example name="toh-pt6"></live-example>.


## What you'll build

Here's a visual idea of where this tutorial leads, beginning with the "Dashboard"
view and the most heroic heroes:

<figure>
  <img src='generated/images/guide/toh/heroes-dashboard-1.png' alt="Output of heroes dashboard">
</figure>

You can click the two links above the dashboard ("Dashboard" and "Heroes")
to navigate between this Dashboard view and a Heroes view.

If you click the dashboard hero "Magneta," the router opens a "Hero Details" view
where you can change the hero's name.

<figure>
  <img src='generated/images/guide/toh/hero-details-1.png' alt="Details of hero in app">
</figure>

Clicking the "Back" button returns you to the Dashboard.
Links at the top take you to either of the main views.
If you click "Heroes," the app displays the "Heroes" master list view.


<figure>
  <img src='generated/images/guide/toh/heroes-list-2.png' alt="Output of heroes list app">
</figure>

When you click a different hero name, the read-only mini detail beneath the list reflects the new choice.

You can click the "View Details" button to drill into the
editable details of the selected hero.

The following diagram captures all of the navigation options.

<figure>
  <img src='generated/images/guide/toh/nav-diagram.png' alt="View navigations">
</figure>

Here's the app in action:

<figure>
  <img src='generated/images/guide/toh/toh-anim.gif' alt="Tour of Heroes in Action">
</figure>


Now, let us create a basic application structure using the Angular CLI.

## Install the Angular CLI

 Install the [Angular CLI](https://github.com/angular/angular-cli), if you haven't already done so.

<code-example language="sh" class="code-shell">
  npm install -g @angular/cli
</code-example>  

## Create a new application

Create a new project named `angular-tour-of-heroes` with this CLI command.

<code-example language="sh" class="code-shell">
  ng new angular-tour-of-heroes
</code-example> 

The Angular CLI generated a new project with a default application and supporting files. 


<div class="l-sub-section">



You can add pre-packaged functionality to a new project by using the `ng add` command. The `ng add` command transforms a project by applying the schematics in the specified package. 
For more information, see the [Angular CLI documentation.](https://github.com/angular/angular-cli/wiki/add "Angular CLI documentation") 

Angular Material provides schematics for typical app layouts. 
See the [Angular Material documentation](https://material.angular.io/guides "Angular Material documentation") for details.

</div>


## Serve the application

Go to the project directory and launch the application.

<code-example language="sh" class="code-shell">
  cd angular-tour-of-heroes
  ng serve --open
</code-example>
 
<div class="l-sub-section">

The `ng serve` command builds the app, starts the development server,
watches the source files, and rebuilds the app as you make changes to those files.

The `--open` flag  opens a browser to `http://localhost:4200/`.

</div>

You should see the app running in your browser.

## Angular components

The page you see is the _application shell_.
The shell is controlled by an Angular **component** named `AppComponent`.

_Components_ are the fundamental building blocks of Angular applications.
They display data on the screen, listen for user input, and take action based on that input.

## Change the application title

Open the project in your favorite editor or IDE and navigate to the `src/app` folder.

You'll find the implementation of the shell `AppComponent` distributed over three files:

1. `app.component.ts`&mdash; the component class code, written in TypeScript. 
1. `app.component.html`&mdash; the component template, written in HTML.
1. `app.component.css`&mdash; the component's private CSS styles.


Open the component class file (`app.component.ts`) and change the value of the `title` property to 'Tour of Heroes'.

<code-example path="toh-pt0/src/app/app.component.ts" region="set-title" title="app.component.ts (class title property)" linenums="false">
</code-example>

Open the component template file (`app.component.html`) and
delete the default template generated by the Angular CLI.
Replace it with the following line of HTML.

<code-example path="toh-pt0/src/app/app.component.html" 
  title="app.component.html (template)" linenums="false">
</code-example>

The double curly braces are Angular's *interpolation binding* syntax. 
This interpolation binding presents the component's `title` property value 
inside the HTML header tag.

The browser refreshes and displays the new application title.

{@a app-wide-styles}

## Add application styles

Most apps strive for a consistent look across the application.
The CLI generated an empty `styles.css` for this purpose.
Put your application-wide styles there.

Here's an excerpt from the `styles.css` for the _Tour of Heroes_ sample app.

<code-example path="toh-pt0/src/styles.1.css" title="src/styles.css (excerpt)">
</code-example>

## Final code review

The source code for this tutorial and the complete _Tour of Heroes_ global styles 
are available in the <live-example></live-example>. 

Here are the code files discussed on this page. 

<code-tabs>

  <code-pane title="src/app/app.component.ts" path="toh-pt0/src/app/app.component.ts">
  </code-pane>

  <code-pane title="src/app/app.component.html" path="toh-pt0/src/app/app.component.html">
  </code-pane>

  <code-pane 
    title="src/styles.css (excerpt)" 
    path="toh-pt0/src/styles.1.css">
  </code-pane>
</code-tabs>

## Summary

* You created the initial application structure using the Angular CLI.
* You learned that Angular components display data.
* You used the double curly braces of interpolation to display the app title. 
