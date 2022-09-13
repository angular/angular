# Getting Started with Angular Material

This guide explains how to set up your Angular project to begin using Angular Material. It includes
information on prerequisites, installing Angular Material, and optionally displaying a sample
Material component in your application to verify your setup.

*Angular Resources*

If you are new to Angular or getting started with a new Angular application, see
[Angular's full Getting Started Guide](https://angular.io/start) and
[Setting up your environment](https://angular.io/guide/setup-local).

For existing applications, follow the steps below to begin using Angular Material.

## Install Angular Material

Use the Angular CLI's installation [schematic](https://material.angular.io/guide/schematics) to set
up your Angular Material project by running the following command:

```bash
ng add @angular/material
```

The `ng add` command will install Angular Material, the
[Component Dev Kit (CDK)](https://material.angular.io/cdk/categories),
[Angular Animations](https://angular.io/guide/animations) and ask you the following questions to
determine which features to include:

1. Choose a prebuilt theme name, or "custom" for a custom theme:

   You can choose from [prebuilt material design themes](https://material.angular.io/guide/theming#using-a-pre-built-theme) or set up an extensible [custom theme](https://material.angular.io/guide/theming#defining-a-theme).

2. Set up global Angular Material typography styles:

   Whether to apply the global [typography](https://material.angular.io/guide/typography) styles to your application.

3. Set up browser animations for Angular Material:

   Importing the [`BrowserAnimationsModule`](https://angular.io/api/platform-browser/animations/BrowserAnimationsModule) into your application enables Angular's [animation system](https://angular.io/guide/animations). Declining this will disable most of Angular Material's animations.

The `ng add` command will additionally perform the following actions:

* Add project dependencies to `package.json`
* Add the Roboto font to your `index.html`
* Add the Material Design icon font to your `index.html`
* Add a few global CSS styles to:
  * Remove margins from `body`
  * Set `height: 100%` on `html` and `body`
  * Set Roboto as the default application font

You're done! Angular Material is now configured to be used in your application.


### Display a component

Let's display a slide toggle component in your app and verify that everything works.

You need to import the `MatSlideToggleModule` that you want to display by adding the following lines to
your `app.module.ts` file.

```ts
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule ({
  imports: [
    MatSlideToggleModule,
  ]
})
class AppModule {}
```

Add the `<mat-slide-toggle>` tag to the `app.component.html` like so:

```html
<mat-slide-toggle>Toggle me!</mat-slide-toggle>
```

Run your local dev server:

```bash
ng serve
```

Then point your browser to [http://localhost:4200](http://localhost:4200)

You should see the Material slide toggle component on the page.

In addition to the installation schematic, Angular Material comes with
[several other schematics](https://material.angular.io/guide/schematics) (like nav, table,
address-form, etc.) that can be used to easily generate pre-built components in your application.
