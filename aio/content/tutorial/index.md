<h1 class="no-toc">Tour of Heroes app and tutorial</h1>

<div class="callout is-helpful">
<header>Getting Started</header>

In this tutorial, you build your own application from the ground up, providing experience with the typical development process, as well as an introduction to basic app-design concepts, tools, and terminology.

If you're completely new to Angular, you might want to try the [**Try it now**](start) quick-start application first.
It is based on a ready-made  partially-completed project, which you can examine and modify in the StackBlitz interactive development environment, where you can see the results in real time.

The "Try it" tutorial covers the same major topics&mdash;components, template syntax, routing, services, and accessing data using HTTP&mdash;in a condensed format, following the most current best practices.

</div>

This _Tour of Heroes_ tutorial shows you how to set up your local development environment and develop an application using the [Angular CLI tool](cli "CLI command reference"), and provides an introduction to the fundamentals of Angular.

The _Tour of Heroes_ application that you build helps a staffing agency manage its stable of heroes.
The application has many of the features you'd expect to find in any data-driven application.
The finished application acquires and displays a list of heroes, edits a selected hero's detail, and navigates among different views of heroic data.

You will find references to and expansions of this application domain in many of the examples used throughout the Angular documentation, but you don't necessarily need to work through this tutorial to understand those examples.

By the end of this tutorial you will be able to do the following:

* Use built-in Angular [directives](guide/glossary#directive "Directives definition") to show and hide elements and display lists of hero data.
* Create Angular [components](guide/glossary#component "Components definition") to display hero details and show an array of heroes.
* Use one-way [data binding](guide/glossary#data-binding "Data binding definition") for read-only data.
* Add editable fields to update a model with two-way data binding.
* Bind component methods to user events, like keystrokes and clicks.
* Enable users to select a hero from a master list and edit that hero in the details view.
* Format data with [pipes](guide/glossary#pipe "Pipe definition").
* Create a shared [service](guide/glossary#service "Service definition") to assemble the heroes.
* Use [routing](guide/glossary#router "Router definition") to navigate among different views and their components.

You'll learn enough Angular to get started and gain confidence that
Angular can do whatever you need it to do.

<div class="callout is-helpful">
<header>Solution</header>

After completing all tutorial steps, the final application will look like this: <live-example name="toh-pt6"></live-example>.

</div>

## What you'll build

Here's a visual idea of where this tutorial leads, beginning with the "Dashboard"
view and the most heroic heroes:

<div class="lightbox">
  <img src='generated/images/guide/toh/heroes-dashboard-1.png' alt="Output of heroes dashboard">
</div>

You can click the two links above the dashboard ("Dashboard" and "Heroes")
to navigate between this Dashboard view and a Heroes view.

If you click the dashboard hero "Magneta," the router opens a "Hero Details" view
where you can change the hero's name.

<div class="lightbox">
  <img src='generated/images/guide/toh/hero-details-1.png' alt="Details of hero in app">
</div>

Clicking the "Back" button returns you to the Dashboard.
Links at the top take you to either of the main views.
If you click "Heroes," the application displays the "Heroes" master list view.


<div class="lightbox">
  <img src='generated/images/guide/toh/heroes-list-2.png' alt="Output of heroes list app">
</div>

When you click a different hero name, the read-only mini detail beneath the list reflects the new choice.

You can click the "View Details" button to drill into the
editable details of the selected hero.

The following diagram captures all of the navigation options.

<div class="lightbox">
  <img src='generated/images/guide/toh/nav-diagram.png' alt="View navigations">
</div>

Here's the application in action:

<div class="lightbox">
  <img src='generated/images/guide/toh/toh-anim.gif' alt="Tour of Heroes in Action">
</div>
