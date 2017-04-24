# Angular Docs

Welcome to the Angular documentation where you'll find guidance for beginners and experts alike.

## What is Angular?

Angular is a platform for building and running web applications on desktop and mobile devices.
It's an architecture, a modular library, and a set of tools to help teams
build amazing web apps that run anywhere at scales large and small.

## Organization

Navigate the docs with the tree-view in the left side panel. Each top level category unfolds into topics that cover Angular from a distinct perspective:

- **Getting Started** is a taste of Angular in under five minutes.

- **Tutorial** is a step-by-step introduction to the essentials of Angular as you build a data-driven application with multi-page navigation.

<div class="alert is-important">

If you're new to Angular, we recommend that you start with these two categories before moving selectively through the others.

</div>

- **Fundamentals** explains each Angular concept and feature in practical terms with loads of examples.

- **Techniques** covers tools and techniques for setting up, testing, securing, and deploying your application.

- **API** is the comprehensive, searchable documentation for every Angular class, interface, and programmable feature.

- **References** include answers to common questions about usage and style.

## Sample code

<style>live-example a {font-weight: 800}</style>

Guide pages are full of code snippets that you can copy and use in your own projects. The snippets are typically drawn from an example app.
Look for the <live-example name="quickstart" noDownload style="font-weight: 800 !important;"></live-example> **link** that launches a browser-based editor where you can see it run, inspect the code, modify it, and save changes.

In most cases you can also <live-example name="quickstart" downloadOnly>download the example,</live-example> 
unzip it, and run locally with these terminal commands:

<code-example language="sh" class="code-shell" linenums="false">
npm install
npm start
</code-example>

## Assumptions

While we strive to keep these pages beginner-friendly, we have to make a few assumptions about your skills and experience in order to stay focused on Angular.  

We assume that you are a seasoned, front-end web developer with a working knowledge of
**HTML, CSS, JavaScript**. The [Mozilla Developer Network](https://developer.mozilla.org/en-US/ "MDN - Mozilla Developer Network") is an excellent resource for reference and general learning.

Effective Angular developers become familiar with two other technologies:

**npm** - Modern web development depends on the [npm package management](https://www.npmjs.com/ "npm") system for distribution and installation of third party libraries. Angular is one such library.

**TypeScript** - [TypeScript](http://www.typescriptlang.org/ "TypeScript") is a _typed_ superset of JavaScript. For the most part it is ES2015 JavaScript with type annotations to improve your design time experience and make it easier for teams to develop sophisticated applications.

You _can_ write Angular applications in [JavaScript without TypeScript](guide/ts-to-js "Writing Angular in JavaScript"). But you should be able to _read_ TypeScript to understand this documentation and participate in conversations within the Angular community. The Angular CLI productivity tool and AOT high performance compiler only apply to TypeScript applications.

You don't have to be an expert in npm or TypeScript to get started with Angular. A little knowledge will get you going and you can pick up what you need along the way.

## Versions

This is the Angular **version 4** documentation. See what's new in the [documentation changelog](guide/change-log). View the [Angular change log](https://github.com/angular/angular/blob/master/CHANGELOG.md) for enhancement and fixes to Angular itself.

The Angular **version 2** documentation has been archived at [v2.angular.io](https://v2.angular.io "Angular v2 Docs").


## Feedback

We welcome feedback!

You can file documentation [issues](https://github.com/angular/angular/issues "Angular Github Issues") and create [pull requests](https://github.com/angular/angular/pulls "Angular Github PRs") on the Angular Github repository.
Please prefix your issue or pull request title with "**docs:**" so that we know it concerns _documentation_ and draws the prompt attention of the appropriate people.

Remember that a respectful, supportive approach produce the best results. Please consult and adhere to our [code of conduct](https://github.com/angular/code-of-conduct/blob/master/CODE_OF_CONDUCT.md "contributor code of conduct") when engaging with the Angular community.