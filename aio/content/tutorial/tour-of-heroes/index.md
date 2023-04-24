# Tour of Heroes application and tutorial

<div class="callout is-helpful">

<header>Getting Started</header>

In this tutorial, you build your own Angular application from the start.
This is a good way to experience a typical development process as you learn Angular application-design concepts, tools, and terminology.

If you're new to Angular, try the [**Try it now**](start) quick-start application first.
**Try it now** is based on a ready-made  partially completed project.
You can edit the application in StackBlitz and see the results in real time.

**Try it now** covers the same major topics &mdash;components, template syntax, routing, services, and accessing data using HTTP&mdash; in a condensed format, following best practices.

</div>

This *Tour of Heroes* tutorial provides an introduction to the fundamentals of Angular and shows you how to:

* Set up your local Angular development environment.
* Use the [Angular CLI](cli "CLI command reference") to develop an application

The *Tour of Heroes* application that you build helps a staffing agency manage its stable of heroes.
The application has many of the features that you'd expect to find in any data-driven application.

The finished application:

* Gets a list of heroes
* Displays the heroes in a list
* Edits a selected hero's details
* Navigates between different views of heroic data

This tutorial helps you gain confidence that Angular can do whatever you need it to do by showing you how to:

*   Use Angular [directives](guide/glossary#directive "Directives definition") to show and hide elements and display lists of hero data.
*   Create Angular [components](guide/glossary#component "Components definition") to display hero details and show an array of heroes.
*   Use one-way [data binding](guide/glossary#data-binding "Data binding definition") for read-only data.
*   Add editable fields to update a model with two-way data binding.
*   Bind component methods to user events, like keystrokes and clicks.
*   Enable users to select a hero from a list and edit that hero in the details view.
*   Format data with [pipes](guide/glossary#pipe "Pipe definition").
*   Create a shared [service](guide/glossary#service "Service definition") to assemble the heroes.
*   Use [routing](guide/glossary#router "Router definition") to navigate among different views and their components.

<div class="callout is-helpful">

<header>Solution</header>

After you complete all tutorial steps, the final application looks like this example.

<live-example name="toh-pt6"></live-example>.

</div>

## Design your new application

Here's an image of where this tutorial leads, showing the Dashboard view and the most heroic heroes:

<div class="lightbox">

<img alt="Output of heroes dashboard" src="generated/images/guide/toh/heroes-dashboard-1.png">

</div>

You can click the **Dashboard** and **Heroes** links in the dashboard to navigate between the views.

If you click the dashboard hero "Magneta," the router opens a "Hero Details" view where you can change the hero's name.

<div class="lightbox">

<img alt="Details of hero in application" src="generated/images/guide/toh/hero-details-1.png">

</div>

Clicking the "Back" button returns you to the Dashboard.
Links at the top take you to either of the main views.
If you click "Heroes," the application displays the "Heroes" list view.

<div class="lightbox">

<img alt="Output of heroes list application" src="generated/images/guide/toh/heroes-list-2.png">

</div>

When you click a different hero name, the read-only mini detail beneath the list reflects the new choice.

You can click the "View Details" button to drill into the editable details of the selected hero.

The following diagram illustrates the navigation options.

<div class="lightbox">

<img alt="View navigations" src="generated/images/guide/toh/nav-diagram.png">

</div>

Here's the application in action:

<div class="lightbox">

<img alt="Tour of Heroes in Action" src="generated/images/guide/toh/toh-anim.gif">

</div>

@reviewed 2022-05-16
