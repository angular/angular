# Tour of Heroes: Hello Angular

This tutorial introduces you to the basics of creating an Angular application. You'll create a starter application and test out Angular text interpolation feature.

## Prerequisites

To get the most out of this tutorial you should already have a basic understanding of the following.

* [HTML](https://developer.mozilla.org/en-US/docs/Learn/HTML "Learning HTML: Guides and tutorials")
* [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript "JavaScript")
* [TypeScript](https://www.typescriptlang.org/ "The TypeScript language")

## Objectives

In this tutorial, you'll do the following:

1. Create a new Angular project, using [Stackblitz][stackblitz].
1. Display the application title using [text interpolation](guide/interpolation).
1. Explore some of the key files that are part of any Angular application.

## Create the sample project

To create the sample project:

1. Open the <live-example name="toh-pt0" noDownload>starter project</live-example>  in StackBlitz.
1. Log into Stackblitz using your GitHub account.
1. Fork the project.

For more information on Angular's directory structure, see [Workspace and project file structure](guide/file-structure).

## Update the application title

One of Angular's basic features is text interpolation. You'll use this feature to update the title of your new application.

To update the application title:

1. Open the component class file `app.component.ts`.
1. Set the value of the `title` property to `Hello Angular!`.

<code-example path="toh-pt0/src/app/app.component.1.ts" header="app.component.ts" region="text-interpolation"></code-example>

The browser refreshes and displays the new application title.

## What's next

You now have a basic Angular application and are ready to explore more of Angular's features and capabilities.

To continue the Tour of Heroes tutorial, see [Tour of Heroes: Templates](tutorial/toh-templates).
