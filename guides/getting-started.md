For help getting started with a new Angular app, check out the
[Angular CLI](https://cli.angular.io/).

For existing apps, follow these steps to begin using Angular Material.

## Step 1: Install Angular Material

```bash
npm install --save @angular/material
```

## Step 2: Animations

Some Material components depend on the Angular animations module in order to be able to do
more advanced transitions. If you want these animations to work in your app, you have to
install the `@angular/animations` module and include the `BrowserAnimationsModule` in your app.

```bash
npm install --save @angular/animations
```

```ts
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
  ...
  imports: [BrowserAnimationsModule],
  ...
})
export class PizzaPartyAppModule { }
```

If you don't want to add another dependency to your project, you can use the `NoopAnimationsModule`.

```ts
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
  ...
  imports: [NoopAnimationsModule],
  ...
})
export class PizzaPartyAppModule { }
```

## Step 3: Import the component modules

Import the NgModule for each component you want to use: 

```ts
import {MdButtonModule, MdCheckboxModule} from '@angular/material';

@NgModule({
  ...
  imports: [MdButtonModule, MdCheckboxModule],
  ...
})
export class PizzaPartyAppModule { }
```

Alternatively, you can create a separate NgModule that imports all of the 
Angular Material components that you will use in your application. You can then
include this module wherever you'd like to use the components.

```ts
import {MdButtonModule, MdCheckboxModule} from '@angular/material';

@NgModule({
  imports: [MdButtonModule, MdCheckboxModule],
  exports: [MdButtonModule, MdCheckboxModule],
})
export class MyOwnCustomMaterialModule { }
```

Whichever approach you use, be sure to import the Angular Material modules _after_ Angular's 
`BrowserModule`, as the import order matters for NgModules.

## Step 4: Include a theme

Including a theme is **required** to apply all of the core and theme styles to your application.

To get started with a prebuilt theme, include the following in your app's index.html:

```html
<link href="../node_modules/@angular/material/prebuilt-themes/indigo-pink.css" rel="stylesheet">
```

Note that your app's project structure may have a different relative location for your node_modules.

For more information on theming and instructions on how to create a custom theme, see the
[theming guide](./theming.md).

## Step 5: Gesture Support

Some components (`md-slide-toggle`, `md-slider`, `mdTooltip`) rely on
[HammerJS](http://hammerjs.github.io/) for gestures. In order to get the full feature-set of these
components, HammerJS must be loaded into the application.

You can add HammerJS to your application via [npm](https://www.npmjs.com/package/hammerjs), a CDN
(such as the [Google CDN](https://developers.google.com/speed/libraries/#hammerjs)), or served
directly from your app.

To install via npm, use the following command:
```bash
npm install --save hammerjs
```

After installing, import it on your app's root module.
```ts
import 'hammerjs';
```

## Step 6 (Optional): Add Material Icons

If you want to use the `md-icon` component with the official 
[Material Design Icons](https://material.io/icons/), load the icon font in your `index.html`.

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

For more information on using Material Icons, check out the
[Material Icons Guide](https://google.github.io/material-design-icons/).

Note that `md-icon` supports any font or svg icons; using Material Icons is one of many options.


## Appendix: Configuring SystemJS

If your project is using SystemJS for module loading, you will need to add `@angular/material`
to the SystemJS configuration:

```js
System.config({
  // existing configuration options
  map: {
    // ...
    '@angular/material': 'npm:@angular/material/bundles/material.umd.js',
    // ...
  }
});
```


## Sample Angular Material projects
- [Material Sample App](https://github.com/jelbourn/material2-app)
- [Angular Connect 2016 Demo](https://github.com/kara/leashed-in)
