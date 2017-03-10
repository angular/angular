For help getting started with a new Angular app, check out the [Angular CLI](https://cli.angular.io/).

For existing apps, follow these steps to begin using Angular Material.

## Step 1: Install Angular Material 

```bash
npm install --save @angular/material
```

## Step 2: Import the Module
  
Add MaterialModule as an import in your app's root NgModule.  
  
```ts
import { MaterialModule } from '@angular/material';
 
@NgModule({
  ...
  imports: [MaterialModule],
  ...
})
export class PizzaPartyAppModule { }
```

## Step 3: Include Theming

Including a theme is **required** to apply all of the core and theme styles to your application. 

To get started with a prebuilt theme, include the following in your app's index.html:

```html
<link href="node_modules/@angular/material/core/theming/prebuilt/indigo-pink.css" rel="stylesheet">
```

Note that your app's project structure may have a different relative location for your node_modules.

For more information on theming and instructions on how to create a custom theme, see the [theming guide](./theming.md).

## Step 4: Gesture Support

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

## Step 5 (Optional): Add Material Icons

If you want your `md-icon` components to use [Material Icons](https://material.io/icons/), load the font in your `index.html`.
  
```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

For more information on using Material Icons, check out the [Material Icons Guide](https://google.github.io/material-design-icons/).

Note that `md-icon` has support for any font or svg icons, so using Material Icons is just one option.
       

## Configuring SystemJS

If your project is using SystemJS for module loading, you will need to add `@angular/material` 
to the SystemJS configuration:

```js
System.config({
  // existing configuration options
  map: {
    ...
    '@angular/material': 'npm:@angular/material/bundles/material.umd.js',
    ...
  }
});
```


## Sample Angular Material projects
- [Material Sample App](https://github.com/jelbourn/material2-app)
- [Angular Connect 2016 Demo](https://github.com/kara/leashed-in)
