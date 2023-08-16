# Add an animation

The main Angular modules for animations are `@angular/animations` and `@angular/platform-browser`.

To get started with adding Angular animations to your project, import the animation-specific modules along with standard Angular capability.

## Step 1: Enabling the animations module

Import `provideAnimations` from `@angular/platform-browser/animations` and add it to the providers list in the `bootstrapApplication` function call.

```ts
bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
  ]
});
```

For `NgModule` based applications import `BrowserAnimationsModule`, which introduces the animation capabilities into your Angular root application module.

<code-example header="src/app/app.module.ts" path="animations/src/app/app.module.1.ts"></code-example>

## Step 2: Importing animation functions into component files

If you plan to use specific animation functions in component files, import those functions from `@angular/animations`.

<code-example header="src/app/app.component.ts" path="animations/src/app/app.component.ts" region="imports"></code-example>

## Step 3: Adding the animation metadata property

In the component file, add a metadata property called `animations:` within the `@Component()` decorator.
You put the trigger that defines an animation within the `animations` metadata property.

<code-example header="src/app/app.component.ts" path="animations/src/app/app.component.ts" region="decorator"></code-example>

@reviewed 2023-08-15
