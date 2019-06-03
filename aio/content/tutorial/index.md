<h1 class="no-toc">Tour of Heroes App and Tutorial</h1>


<div class="callout is-helpful">
<header>Getting Started Tutorial</header>


If you're new to Angular, see the [**Getting Started tutorial.**](start) 
The Getting Started tutorial covers the same major topics as this Tour of Heroes&mdash;components, template syntax, routing, services, and accessing data via HTTP&mdash;in a condensed format, following the most current best practices. 

**This Tour of Heroes tutorial** is the conceptual basis for many examples in this documentation set. Reading this introduction page provides sufficient context for working with those examples. You do not need to do this tutorial to understand those other examples. The Tour of Heroes tutorial is maintained here for context and continuity. 

</div> 

This _Tour of Heroes_ tutorial provides an introduction to the fundamentals of Angular. 
It shows you how to set up your local development environment and develop an app using the [Angular CLI tool](cli "CLI command reference"). 

In this _Tour of Heroes_ tutorial, you will build an app that helps a staffing agency manage its stable of heroes.

This app has many of the features you'd expect to find in a data-driven application.
It acquires and displays a list of heroes, edits a selected hero's detail, and navigates among different views of heroic data.

By the end of this tutorial you will be able to do the following:

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

<div class="callout is-helpful">
<header>Solution</header>

After completing all tutorial steps, the final app will look like this: <live-example name="toh-pt6"></live-example>.

</div>



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
