# Getting Started with Angular Material

This guide explains how to setup your Angular project to begin using Angular Material. It includes information on prerequisites, installing Angular Material, and optionally displaying a sample material component in your application to verify your setup.

*Angular Resources*

If you are new to Angular or getting started with a new Angular application, see [Angular's full Getting Started Guide](https://angular.io/start) and [Setting up your environment](https://angular.io/guide/setup-local).

For existing applications, follow the steps below to begin using Angular Material.

### Install Angular Material

Use the Angular CLI's install [schematic](https://material.angular.io/guide/schematics) to set up your Angular Material project by running the following command:

```bash
ng add @angular/material
```

The `ng add` command will install Angular Material, the [Component Dev Kit (CDK)](https://material.angular.io/cdk/categories), [Angular Animations](https://angular.io/guide/animations) and ask you the following questions to determine which features to include:

1. Choose a prebuilt theme name, or "custom" for a custom theme: 

   You can choose from [prebuilt material design themes](https://material.angular.io/guide/theming#using-a-pre-built-theme) or set up an extensible [custom theme](https://material.angular.io/guide/theming#defining-a-custom-theme).

2. Set up HammerJS for gesture recognition:

   [HammerJS](http://hammerjs.github.io/) provides gesture recognition capabilities required by some components (`mat-slide-toggle`, `mat-slider`, `matToolTip`).

   Please note, if you choose not to install HammerJS it can be installed later
   (see [Appendix](#installing-hammerjs)).

3. Set up browser animations for Angular Material:

   Importing the [`BrowserAnimationsModule`](https://angular.io/api/platform-browser/animations/BrowserAnimationsModule) into your application enables Angular's [animation system](https://angular.io/guide/animations). Declining this will disable most of Angular Material's animations.

The `ng add` command will additionally perform the following configurations:

* Add project dependencies to `package.json`
* Add the Roboto font to your `index.html`
* Add the Material Design icon font to your `index.html`
* Add a few global CSS styles to:
  * Remove margins from `body`
  * Set `height: 100%` on `html` and `body`
  * Set Roboto as the default application font

You're done! Angular Material is now configured to be used in your application.


### Display a component

Let's display a slider component in your app and verify that everything works.

You need to import the `MatSliderModule` that you want to display by adding the following lines to your app.module.ts file.

```ts
import { MatSliderModule } from '@angular/material/slider';
…
@NgModule ({....
  imports: [...,
  MatSliderModule,
…]
})
```

Add the `<mat-slider>` tag to the `app.component.html` like so:

```html
<mat-slider min="1" max="100" step="1" value="1"></mat-slider>
```

Run your local dev server:

```bash
ng serve
```

and point your browser to [http://localhost:4200](http://localhost:4200)

You should see the material slider component on the page.

In addition to the install schematic, Angular Material comes with [several schematics](https://material.angular.io/guide/schematics) (like nav, table, address-form, etc.) that can be used to easily generate pre-built components in your application.


### Appendix

#### Installing HammerJS

[HammerJS](http://hammerjs.github.io/) can be installed using the following npm command:

   ```bash
   npm install --save hammerjs
   ```

   After installing, import it on your app's entry point (e.g. `src/main.ts`).

   ```ts
   import 'hammerjs';
   ```
