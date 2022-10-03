# Add an animation

The main Angular modules for animations are `@angular/animations` and `@angular/platform-browser`.
When you create a new project using the Angular framework, these dependencies are automatically added to your project.

To get started with adding Angular animations to your project, import the animation-specific modules along with standard Angular capability.

## Step 1: Enabling the animations module

Import `BrowserAnimationsModule`, which introduces the animation capabilities into your Angular root application module.

<code-example header="src/app/app.module.ts" path="animations/src/app/app.module.1.ts"></code-example>

<div class="alert is-helpful">

**NOTE**: <br />
When you use the Angular framework to create your application, the root application module `app.module.ts` is placed in the `src/app` directory.

</div>

## Step 2: Importing animation functions into component files

If you plan to use specific animation functions in component files, import those functions from `@angular/animations`.

<code-example header="src/app/app.component.ts" path="animations/src/app/app.component.ts" region="imports"></code-example>

<div class="alert is-helpful">

**NOTE**: <br />
See a [summary of available animation functions](guide/animations#animation-api-summary) at the end of this guide.

</div>

## Step 3: Adding the animation metadata property

In the component file, add a metadata property called `animations:` within the `@Component()` decorator.
You put the trigger that defines an animation within the `animations` metadata property.

<code-example header="src/app/app.component.ts" path="animations/src/app/app.component.ts" region="decorator"></code-example>

## What's next

* [Animate a transition](guide/animate-a-transition.md)

@reviewed 2022-10-03
