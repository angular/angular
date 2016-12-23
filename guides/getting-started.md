Get started with Angular Material 2 using the Angular CLI.

## Install the CLI
 
 ```bash
 npm install -g angular-cli
 ```
 
## Create a new project
 
 ```bash
 ng new my-project
 ```

The new command creates a project with a build system for your Angular app.

## Install Angular Material components 

```bash
npm install --save @angular/material
```

## Import the Angular Material NgModule
  
**src/app/app.module.ts**
```ts
import { MaterialModule } from '@angular/material';
// other imports 
@NgModule({
  imports: [MaterialModule.forRoot()],
  ...
})
export class PizzaPartyAppModule { }
```

## Include the core and theme styles:
This is **required** to apply all of the core and theme styles to your application. You can either
use a pre-built theme, or define your own custom theme.

:trident:  See the [theming guide](guides/theming.md) for instructions.

### Additional setup for gestures
Some components ()`md-slide-toggle`, `md-slider`, `mdTooltip`) rely on 
[HammerJS](http://hammerjs.github.io/) for gestures. In order to get the full feature-set of these
components, HammerJS must be loaded into the application.

You can add HammerJS to your application via [npm](https://www.npmjs.com/package/hammerjs), a CDN 
(such as the [Google CDN](https://developers.google.com/speed/libraries/#hammerjs)), or served 
directly from your app.

#### If you want to include HammerJS from npm, you can install it:

```bash
npm install --save hammerjs 
```

After installing, import HammerJS on your app's module.
**src/app/app.module.ts**
```ts
import 'hammerjs';
```

## Configuring SystemJS
If your project is using SystemJS for module loading, you will need to add `@angular/material` 
to the SystemJS configuration:

```js
System.config({
  // existing configuration options
  map: {
    ...,
    '@angular/material': 'npm:@angular/material/bundles/material.umd.js'
  }
});
```

### [Optional] Using Material Design icons with `md-icon`:

- If you want to use Material Design icons in addition to Angular Material components, 
load the Material Design font in your `index.html`.  
`md-icon` supports any font icons or svg icons, so this is only one option for an icon source.
       
**src/index.html**
```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

## Sample Angular Material 2 projects
- [Material 2 Sample App](https://github.com/jelbourn/material2-app)
- [Angular Connect 2016 Demo](https://github.com/kara/leashed-in)
