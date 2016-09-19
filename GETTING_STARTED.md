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

## Install Angular Material 2 components 

Angular Material 2 components are set up in separate modules. This allows you to only pull into your app what you need, reducing the size of your app. Components are installed individually. You can see our [list of published packages here](https://www.npmjs.com/~angular2-material).

Note that only packages published under the `@latest` npm tag are officially released.

```bash
npm install --save @angular2-material/core @angular2-material/button @angular2-material/card
```

> The core module is required as a peer dependency of other components

## Add components to your app module
Now you should be able to import the components normally wherever you'd like to use them. Import the components in your application module:
  
**src/app/app.module.ts**
```ts
import { MdButtonModule } from '@angular2-material/button';
import { MdCardModule } from '@angular2-material/card';
// other imports 
@NgModule({
  imports: [MdButtonModule.forRoot(), MdCardModule.forRoot()],
  ...
})
```

### Sample Angular Material 2 project
- [Material 2 Sample App](https://github.com/jelbourn/material2-app)


### Additional setup for `md-menu` and `md-tooltip`:
For alpha.7, you need to include the overlay styles in your app via a `link` element. This will
look something like
```html
<link href="vendor/@angular2-material/core/overlay/overlay.css" rel="stylesheet">
```

In future releases, all of the core styles will be combined into a single distributed css file.

### Additional setup for `md-slide-toggle` and `md-slider`:
The slide-toggle and slider components have a dependency on [HammerJS](http://hammerjs.github.io/).
1) Add HammerJS to your application via [npm](https://www.npmjs.com/package/hammerjs), a CDN 
   (such as the [Google CDN](https://developers.google.com/speed/libraries/#hammerjs)), 
   or served directly from your app.
2) Include the typings for HammerJS in your typescript build ([more info on @types](https://blogs.msdn.microsoft.com/typescript/2016/06/15/the-future-of-declaration-files))


### Additional setup for `md-icon`:

- If you want to use Material Design icons, load the Material Design font in your `index.html`.  
`md-icon` supports any font icons or svg icons, so this is only one potential option.
       
**src/index.html**
```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```
