# First Angular app lesson 1 - Hello world

This first lesson serves as the starting point from which each lesson in this tutorial adds new features to build a complete Angular app. In this lesson, we'll update the application to display the famous text, "Hello World".

**Time required:** expect to spend about 15 minutes to complete this lesson.

## Before you start

This lesson starts from a pre-built app that will serve as a baseline for the application you'll be building in this tutorial. We've provided starter code so you can:

*   Start with the code example for the beginning of this lesson. Choose from the <live-example name="first-app-lesson-00"></live-example> to:
    *   Use the *live example* in StackBlitz, where the StackBlitz interface is your IDE.
    *   Use the *download example* and unzip it into a directory named: `first-app`. Open that directory in your IDE.

If you haven't reviewed the introduction, visit the [tutorial overview page](tutorial/first-app) to make sure you have everything you need to complete this lesson.

If you have any trouble during this lesson, you can review the completed code for this lesson, in the <live-example></live-example> for this lesson.

## After you finish

* The updated app you have after this lesson confirms that you and your IDE are ready to begin creating an Angular app.

## Lesson steps

Perform these steps on the app code in your chosen IDE (locally or using the StackBlitz).

### Step 1 - Test the default app

In this step, after you download the default starting app, you build the default Angular app.
This confirms that your development environment has what you need to continue the tutorial.

In the **Terminal** pane of your IDE:

1.  In your project directory, navigate to the `first-app` directory.
1.  Run this command to install the dependencies needed to run the app.
    
    <code-example format="shell" language="shell">

    npm install

    </code-example>

1.  Run this command to build and serve the default app.

    <code-example format="shell" language="shell">

    ng serve

    </code-example>

    The app should build without errors.

1.  In a web browser on your development computer, open `http://localhost:4200`.
1.  Confirm that the default web site appears in the browser.
1.  You can leave `ng serve` running for as you complete the next steps.

### Step 2 - Review the files in the project

In this step, you get to know the files that make up a default Angular app.

In the **Explorer** pane of your IDE:

1.  In your project directory, navigate to the `first-app` directory.
1.  Open the `src` directory to see these files.
    1.  In the file explorer, find the Angular app files (`/src`).
        1.  `index.html` is the app's top level HTML template.
        1.  `style.css` is the app's top level style sheet.
        1.  `main.ts` is where the app start running.
        1.  `favicon.ico` is the app's icon, just as you would find in web site.
    1.  In the file explorer, find the Angular app's component files (`/app`).
        1.  `app.component.ts` is the source file that describes the `app-root` component.
            This is the top-level Angular component in the app. A component is the basic building block of an Angular application.
            The component description includes the component's code, HTML template, and styles, which can be described in this file, or in separate files.

            In this app, the styles are in a separate file while the component's code and HTML template are in this file.
        1.  `app.component.css` is the style sheet for this component.
        1.  New components are added to this directory.
    1.  In the file explorer, find the image directory (`/assets`) contains images used by the app.
    1.  In the file explorer, find the support files are files and directories that an Angular app needs to build and run, but they are not files that you normally interact with.
        1.  `.angular` has files required to build the Angular app.
        1.  `.e2e` has files used to test the app.
        1.  `.node_modules` has the node.js packages that the app uses.
        1.  `angular.json` describes the Angular app to the app building tools.
        1.  `package.json` is used by `npm` (the node package manager) to run the finished app.
        1.  `tsconfig.*` are the files that describe the app's configuration to the TypeScript compiler.

After you have reviewed the files that make up an Angular app project, continue to the next step.

### Step 3 - Create `Hello World`

In this step, you update the Angular project files to change the displayed content.

In your IDE:

1.  Open `first-app/src/index.html`.
1.  In `index.html`, replace the `<title>` element with this code to update the title of the app.

    <code-example header="Replace in src/index.html" path="first-app-lesson-01/src/index.html" region="app-title"></code-example>

    Then, save the changes you just made to `index.html`.

1.  Next, open  `first-app/src/app/app.component.ts`.
1.  In `app.component.ts`, in the `@Component` definition, replace the `template` line with this code to change the text in the app component.

    <code-example header="Replace in src/app/app.component.ts" path="first-app-lesson-01/src/app/app.component.ts" region="app-comp-template"></code-example>

1.  In `app.component.ts`, in the `AppComponent` class definition, replace the `title` line with this code to change the component title.

    <code-example header="Replace in src/app/app.component.ts" path="first-app-lesson-01/src/app/app.component.ts" region="app-comp-title"></code-example>

    Then, save the changes you made to `app.component.ts`.

1.  If you stopped the `ng serve` command from step 1, in the **Terminal** window of your IDE, run `ng serve` again.
1.  Open your browser and navigate to `localhost:4200` and confirm that the app builds without error and displays *Hello world* in the title and body of your app:
<section class="lightbox">
<img alt="browser frame of page displaying the text 'Hello World'" src="generated/images/guide/faa/homes-app-lesson-01-browser.png">
</section>
## Lesson review

In this lesson, you updated a default Angular app to display *Hello world*.
In the process, you learned about the `ng serve` command to serve your app locally for testing.

If have any trouble with this lesson, review the completed code for it in the <live-example></live-example>.

## Next steps

[First Angular app lesson 2 - Creating Components](tutorial/first-app/first-app-lesson-02)

## More information

For more information about the topics covered in this lesson, visit:

* [Angular Components](/guide/component-overview)
* [Creating applications with the Angular CLI](/cli)
