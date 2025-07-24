# Build your first Angular app

This tutorial consists of lessons that introduce the Angular concepts you need to know to start coding in Angular.

You can do as many or as few as you would like and you can do them in any order.

HELPFUL: Prefer video? We also have a full [YouTube course](https://youtube.com/playlist?list=PL1w1q3fL4pmj9k1FrJ3Pe91EPub2_h4jF&si=1q9889ulHp8VZ0e7) for this tutorial!

<docs-video src="https://www.youtube.com/embed/xAT0lHYhHMY?si=cKUW_MGn3MesFT7o"/>

## Before you start

For the best experience with this tutorial, review these requirements to make sure you have what you need to be successful.

### Your experience

The lessons in this tutorial assume that you have experience with the following:

1. Created an HTML web page by editing the HTML directly.
1. Programmed web site content in JavaScript.
1. Read Cascading Style Sheet (CSS) content and understand how selectors are used.
1. Used command-line instructions to perform tasks on your computer.

### Your equipment

These lessons can be completed using a local installation of the Angular tools or in our embedded editor. Local Angular development can be completed on Windows, MacOS or Linux based systems.

NOTE: Look for alerts like this one, which call out steps that may only be for your local editor.

## Conceptual preview of your first Angular app

The lessons in this tutorial create an Angular app that lists houses for rent and shows the details of individual houses.
This app uses features that are common to many Angular apps.

<img alt="Output of homes landing page" src="assets/images/tutorials/first-app/homes-app-landing-page.png">

## Local development environment

NOTE: This step is only for your local environment!

Perform these steps in a command-line tool on the computer you want to use for this tutorial.

<docs-workflow>

<docs-step title="Identify the version of `node.js` that Angular requires">
Angular requires an active LTS or maintenance LTS version of Node. Let's confirm your version of `node.js`. For information about specific version requirements, see the engines property in the [package.json file](https://unpkg.com/browse/@angular/core@15.1.5/package.json).

From a **Terminal** window:

1. Run the following command: `node --version`
1. Confirm that the version number displayed meets the requirements.
</docs-step>

<docs-step title="Install the correct version of `node.js` for Angular">
If you do not have a version of `node.js` installed, please follow the [directions for installation on nodejs.org](https://nodejs.org/en/download/)
</docs-step>

<docs-step title="Install the latest version of Angular">
With `node.js` and `npm` installed, the next step is to install the [Angular CLI](tools/cli) which provides tooling for effective Angular development.

From a **Terminal** window run the following command: `npm install -g @angular/cli`.
</docs-step>

<docs-step title="Install integrated development environment (IDE)">
You are free to use any tool you prefer to build apps with Angular. We recommend the following:

1. [Visual Studio Code](https://code.visualstudio.com/)
2. As an optional, but recommended step you can further improve your developer experience by installing the [Angular Language Service](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template)
3. [WebStorm](https://www.jetbrains.com/webstorm/)
</docs-step>

<docs-step title="Optional: set-up your AI powered IDE">

In case you're following this tutorial in your preferred AI powered IDE, [check out Angular prompt rules and best practices](/ai/develop-with-ai).

</docs-step>

</docs-workflow>

For more information about the topics covered in this lesson, visit:

<docs-pill-row>
  <docs-pill href="/overview" title="What is Angular"/>
  <docs-pill href="/tools/cli/setup-local" title="Setting up the local environment and workspace"/>
  <docs-pill href="/cli" title="Angular CLI Reference"/>
</docs-pill-row>
