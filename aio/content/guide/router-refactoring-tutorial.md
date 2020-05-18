# Refactoring routes in Angular

This tutorial demonstrates how you can refactor your Angular routes to make them easier to maintain.

Most introductions to Angular routing, such as [Using Angular routes in a single-page application](/guide/router-tutorial), show you how to add routes to the `imports` array in your application's `app.module.ts` file.
This pattern works well for simple applications.
As your application grows in scope, it is recommended that you structure your routes so that they are easier to maintain.
This tutorial describes two ways to restructure your routes: a dedicated routes array or a separate routing module.

## Objectives

* Refactor an existing application to use a dedicated routes array
* Refactor an existing application to use a separate routing module

## Prerequisites

To complete this tutorial, you should have a basic understanding of the following concepts:

* JavaScript
* HTML
* CSS
* [Angular CLI](/cli)

This tutorial builds on the application from the [Using Angular routes in a single-page application](/guide/router-tutorial) tutorial.
You can view or download the code from this tutorial: <live-example name="router-tutorial"></live-example>.

## Move routes into a separate array

Currently, your application defines routes inside the `imports` array in the `app.module.ts` file.

<code-example header="src/app/app.module.ts" path="router-tutorial/src/app/app.module.ts" region="import-wildcard"></code-example>

This `imports` array can contain a lot of information about your application.
While a basic application might contain only a couple of routes, more complicated applications could contain much more.
Moving those routes out of the `imports` array can make your `app.module.ts` file easier to read.

To move your routes to a separate array:

1. On the line preceding the `@NgModule` statement, create a new array, `appRoutes`.

1. Copy your existing routes to the new array.

   <code-example header="src/app/app.module.ts" path="router-refactor-tutorial/src/app/app.module.ts" region="routes-array"></code-example>

1. Update the `imports` array in the `@NgModule` statement.

   <code-example header="src/app/app.module.ts" path="router-refactor-tutorial/src/app/app.module.ts" region="imports"></code-example>

View your application in a browser window. You should see that your application runs as expected, and all of your routes work without errors.
To your users, your application remains unchanged.

## Create a dedicated routing module

As your application grows in scope, you might find it easier to have all of your routes in a separate file.
You can accomplish this task by creating a routing module.

To create a routing module:

1. Open a terminal window, and navigate to your project directory: `angular-router-sample`.

1. Run the `ng generate module` command with the following parameters.

   <code-example lang="sh">
   ng generate module app-routing --flat --module=app
   </code-example>

   This command creates a new module, `app-routing`. The additional flags perform these tasks:

   * `--flat` puts the file in src/app instead of its own folder.
   * `--module=app` tells the CLI to register it in the imports array of the AppModule.

## Import application components

Now that you have a routing module, you need to import your application components so the module knows about them.

To import your application components into the `app-routing.module.ts` file:

1. Open the `app-routing.module.ts` file.

1. Add the following import statements to the top of the file.

   <code-example header="src/app/app.module.ts" path="router-refactor-tutorial-with-module/src/app/app-routing.module.ts" region="imports"></code-example>

## Move the array of routes

Next, copy the `appRoutes` array from your `app.module.ts` file and paste it in the `app-routing.module.ts` file.

<code-example header="src/app/app.module.ts" path="router-refactor-tutorial-with-module/src/app/app-routing.module.ts" region="approutes"></code-example>

## Update `@NgModule` import array

In your `app-routing.module.ts` file, update the `@NgModule` import array. This code is the same as what is currently in your `app.module.ts` file.

<code-example header="src/app/app.module.ts" path="router-refactor-tutorial-with-module/src/app/app-routing.module.ts" region="ngmodule-imports"></code-example>

## Add an export statement

You next need to make the routes defined in the `app-routing.module.ts` file available to your `app.module.ts` file.
To accomplish this task, you need to an `export` statement your routes.

<code-example header="src/app/app.module.ts" path="router-refactor-tutorial-with-module/src/app/app-routing.module.ts" region="export"></code-example>

This line of code allows the `app.module.ts` file to access the routes you defined.

## Configure your application to use the routing module

At this point, you are now ready to add to configure your application to use your routing module.

1. Open the `app.module.ts` file.

1. Import the `approutingmodule`.

   <code-example header="src/app/app.module.ts" path="router-refactor-tutorial-with-module/src/app/app.module.ts" region="approutingmodule-import"></code-example>

1. In the `imports` array of the `@NgModule` statement, replace `RouterModule.forRoot(appRoutes)` with `AppRoutingModule`.

   <code-example header="src/app/app.module.ts" path="router-refactor-tutorial-with-module/src/app/app.module.ts" region="imports"></code-example>

1. Delete `RouterModule` from your list of import statements at the top of the file. Your new `app.module.ts` file should appear as follows:

   <code-example header="src/app/app.module.ts" path="router-refactor-tutorial-with-module/src/app/app.module.ts"></code-example>

View your application in a browser window. Again, you should see that your application's behavior remains unchanged. However, you now have configured your application's routes in a way that is easy to maintain as your application grows in scope and complexity.

## Next steps

You have now explored two ways of managing your application's routes: by creating an array within your `app.module.ts` file, and by creating a dedicating routing module. Both methods can make it easier for your to manage your application's routes as you continue to add new features and functionality.

For more information about routing, see the following topics:

* [In-app Routing and Navigation](/guide/router)
* [Router API](/api/router)
