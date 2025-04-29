# Hello world

This first lesson serves as the starting point from which each lesson in this tutorial adds new features to build a complete Angular app. In this lesson, we'll update the application to display the famous text, "Hello World".

<docs-video src="https://www.youtube.com/embed/UnOwDuliqZA?si=uML-cDRbrxmYdD_9"/>

## What you'll learn

The updated app you have after this lesson confirms that you and your IDE are ready to begin creating an Angular app.

NOTE: If you are working with the embedded editor, skip to [step three](#create-%60hello-world%60).
When working in the browser playground, you do not need to `ng serve` to run the app. Other commands like `ng generate` can be done in the console window to your right.

<docs-workflow>

<docs-step title="Download the default app">
Start by clicking the "Download" icon in the top right pan of the code editor. This will download a `.zip` file containing the source code for this tutorial. Open this in your local Terminal and IDE then move on to testing the default app.

At any step in the tutorial, you can click this icon to download the step's source code and start from there.
</docs-step>

<docs-step title="Test the default app">
In this step, after you download the default starting app, you build the default Angular app.
This confirms that your development environment has what you need to continue the tutorial.

In the **Terminal** pane of your IDE:

1. In your project directory, navigate to the `first-app` directory.
1. Run this command to install the dependencies needed to run the app.

    <docs-code language="shell">
    npm install
    </docs-code>

1. Run this command to build and serve the default app.

    <docs-code language="shell">
    ng serve
    </docs-code>

    The app should build without errors.

1. In a web browser on your development computer, open `http://localhost:4200`.
1. Confirm that the default web site appears in the browser.
1. You can leave `ng serve` running as you complete the next steps.
</docs-step>

<docs-step title="Review the files in the project">
In this step, you get to know the files that make up a default Angular app.

In the **Explorer** pane of your IDE:

1. In your project directory, navigate to the `first-app` directory.
1. Open the `src` directory to see these files.
    1. In the file explorer, find the Angular app files (`/src`).
        1. `index.html` is the app's top level HTML template.
        1. `styles.css` is the app's top level style sheet.
        1. `main.ts` is where the app starts running.
        1. `favicon.ico` is the app's icon, just as you would find in any web site.
    1. In the file explorer, find the Angular app's component files (`/app`).
        1. `app.component.ts` is the source file that describes the `app-root` component.
            This is the top-level Angular component in the app. A component is the basic building block of an Angular application.
            The component description includes the component's code, HTML template, and styles, which can be described in this file, or in separate files.

            In this app, the styles are in a separate file while the component's code and HTML template are in this file.
        1. `app.component.css` is the style sheet for this component.
        1. New components are added to this directory.
    1. In the file explorer, find the image directory (`/assets`) that contains images used by the app.
    1. In the file explorer, find the files and directories that an Angular app needs to build and run, but they are not files that you normally interact with.
        1. `.angular` has files required to build the Angular app.
        1. `.e2e` has files used to test the app.
        1. `.node_modules` has the node.js packages that the app uses.
        1. `angular.json` describes the Angular app to the app building tools.
        1. `package.json` is used by `npm` (the node package manager) to run the finished app.
        1. `tsconfig.*` are the files that describe the app's configuration to the TypeScript compiler.

After you have reviewed the files that make up an Angular app project, continue to the next step.
</docs-step>

<docs-step title="Create `Hello World`">
In this step, you update the Angular project files to change the displayed content.

In your IDE:

1. Open `first-app/src/index.html`.
    NOTE: This step and the next are only for your local environment!

1. In `index.html`, replace the `<title>` element with this code to update the title of the app.

    <docs-code header="Replace in src/index.html" path="adev/src/content/tutorials/first-app/steps/02-HomeComponent/src/index.html" visibleLines="[5]"/>

    Then, save the changes you just made to `index.html`.

1. Next, open  `first-app/src/app/app.component.ts`.
1. In `app.component.ts`, in the `@Component` definition, replace the `template` line with this code to change the text in the app component.

    <docs-code header="Replace in src/app/app.component.ts" path="adev/src/content/tutorials/first-app/steps/02-HomeComponent/src/app/app.component.ts" visibleLines="[6,8]"/>

1. In `app.component.ts`, in the `AppComponent` class definition, replace the `title` line with this code to change the component title.

    <docs-code header="Replace in src/app/app.component.ts" path="adev/src/content/tutorials/first-app/steps/02-HomeComponent/src/app/app.component.ts" visibleLines="[11,13]"/>

    Then, save the changes you made to `app.component.ts`.

1. If you stopped the `ng serve` command from step 1, in the **Terminal** window of your IDE, run `ng serve` again.
1. Open your browser and navigate to `localhost:4200` and confirm that the app builds without error and displays *Hello world* in the title and body of your app:
    <img alt="browser frame of page displaying the text 'Hello World'" src="assets/images/tutorials/first-app/homes-app-lesson-01-browser.png">
</docs-step>

</docs-workflow>

SUMMARY: In this lesson, you updated a default Angular app to display *Hello world*.
In the process, you learned about the `ng serve` command to serve your app locally for testing.

For more information about the topics covered in this lesson, visit:

<docs-pill-row>
  <docs-pill href="guide/components" title="Angular Components"/>
  <docs-pill href="tools/cli" title="Creating applications with the Angular CLI"/>
</docs-pill-row>
