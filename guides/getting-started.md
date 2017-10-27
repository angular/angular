For help getting started with a new Angular app, check out the
[Angular CLI](https://cli.angular.io/).

For existing apps, follow these steps to begin using Angular Material.

### Step 1: Install Angular Material and Angular CDK

```bash
npm install --save @angular/material @angular/cdk
```

#### Alternative: Snapshot Build

A snapshot build with the latest changes from master is also available. Note that this snapshot
build should not be considered stable and may break between releases.

```bash
npm install --save angular/material2-builds angular/cdk-builds
```

### Step 2: Animations

Some Material components depend on the Angular animations module in order to be able to do
more advanced transitions. If you want these animations to work in your app, you have to
install the `@angular/animations` module and include the `BrowserAnimationsModule` in your app.

```bash
npm install --save @angular/animations
```

**Note:** `@angular/animations` uses the WebAnimation API that isn't supported by all browsers yet.
If you want to support Material component animations in these browsers, you'll have to
[include a polyfill](https://github.com/web-animations/web-animations-js).

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

### Step 3: Import the component modules

Import the NgModule for each component you want to use:

```ts
import {MatButtonModule, MatCheckboxModule} from '@angular/material';

@NgModule({
  ...
  imports: [MatButtonModule, MatCheckboxModule],
  ...
})
export class PizzaPartyAppModule { }
```

Alternatively, you can create a separate NgModule that imports all of the
Angular Material components that you will use in your application. You can then
include this module wherever you'd like to use the components.

```ts
import {MatButtonModule, MatCheckboxModule} from '@angular/material';

@NgModule({
  imports: [MatButtonModule, MatCheckboxModule],
  exports: [MatButtonModule, MatCheckboxModule],
})
export class MyOwnCustomMaterialModule { }
```

Whichever approach you use, be sure to import the Angular Material modules _after_ Angular's
`BrowserModule`, as the import order matters for NgModules.

### Step 4: Include a theme

Including a theme is **required** to apply all of the core and theme styles to your application.

To get started with a prebuilt theme, include one of Angular Material's prebuilt themes globally
in your application. If you're using the Angular CLI, you can add this to your `styles.css`:
```css
@import "~@angular/material/prebuilt-themes/indigo-pink.css";
```

If you are not using the Angular CLI, you can include a prebuilt theme via a `<link>` element in
your `index.html`.

For more information on theming and instructions on how to create a custom theme, see the
[theming guide](./theming.md).

### Step 5: Gesture Support

Some components (`mat-slide-toggle`, `mat-slider`, `matTooltip`) rely on
[HammerJS](http://hammerjs.github.io/) for gestures. In order to get the full feature-set of these
components, HammerJS must be loaded into the application.

You can add HammerJS to your application via [npm](https://www.npmjs.com/package/hammerjs), a CDN
(such as the [Google CDN](https://developers.google.com/speed/libraries/#hammerjs)), or served
directly from your app.

To install via npm, use the following command:
```bash
npm install --save hammerjs
```

After installing, import it on your app's entry point (e.g. `src/main.ts`).
```ts
import 'hammerjs';
```

### Step 6 (Optional): Add Material Icons

If you want to use the `mat-icon` component with the official
[Material Design Icons](https://material.io/icons/), load the icon font in your `index.html`.

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

For more information on using Material Icons, check out the
[Material Icons Guide](https://google.github.io/material-design-icons/).

Note that `mat-icon` supports any font or svg icons; using Material Icons is one of many options.


### Appendix: Configuring SystemJS

If your project is using SystemJS for module loading, you will need to add `@angular/material` and
`@angular/cdk` to the SystemJS configuration.

The `@angular/cdk` package is organized of multiple entry-points.
Each of these entry-points must be registered individually with SystemJS.

Here is a example configuration where `@angular/material`, `@angular/cdk/platform` and
`@angular/cdk/a11y` are used:


```js
System.config({
  // Existing configuration options
  map: {
    // ...
    '@angular/material': 'npm:@angular/material/bundles/material.umd.js',

    // CDK individual packages
    '@angular/cdk/platform': 'npm:@angular/cdk/bundles/cdk-platform.umd.js',
    '@angular/cdk/a11y': 'npm:@angular/cdk/bundles/cdk-a11y.umd.js',
    // ...
  }
});
```


### Example Angular Material projects
- [material.angular.io](https://material.angular.io) -
We build our own documentation with Angular Material!
