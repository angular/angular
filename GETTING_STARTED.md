This guide will take you through building your first project with Angular Material 2.  We'll be using 
the Angular CLI, but you can also accomplish this with other build tools like Webpack or Gulp.

### Globally install the CLI
 
 ```bash
 npm install -g angular-cli
 ```
 
### Create a new project
 
 ```bash
 ng new my-project
 ```
 
This will create a starter repo under the name you specified with the files and folders 
you'd need for any Angular 2 app: a root component, a main.ts to bootstrap your root component, an 
index.html, etc.  It also sets up build rules to transpile your Typescript into Javascript and sets 
some initial config for the SystemJS module loader.  
 
### Install Angular Material 2 components 

Now that your project has been created, you can install any Angular Material 2 components you'd like 
to use through npm. You can see our [list of published packages here](https://www.npmjs.com/~angular2-material).  

```bash
npm install --save @angular2-material/{core,button,card}
```
Note: the core module is required as a peer dependency of other components.

### Add components to vendor bundle

Next, you'll need to build the `@angular2-material` folder out of `node_modules` and into 
`dist/vendor`, so that it's served with the rest of the vendor files. You can easily configure this by 
editing the `angular-cli-build.js` file in the root of your project.  Simply add a glob for all 
@angular2-material files to the end of the existing `vendorNpmFiles` array.

**angular-cli-build.js**
```js
module.exports = function(defaults) {
  return new Angular2App(defaults, {
    vendorNpmFiles: [
      'systemjs/dist/system-polyfills.js',
      'systemjs/dist/system.src.js',
      'zone.js/dist/**/*.+(js|js.map)',
      'es6-shim/es6-shim.js',
      'reflect-metadata/**/*.+(js|js.map)',
      'rxjs/**/*.+(js|js.map)',
      '@angular/**/*.+(js|js.map)',
      '@angular2-material/**/*'
    ]
  });
};
```

You can see an example `angular-cli-build.js` file [here](https://github.com/kara/puppy-love/blob/master/angular-cli-build.js).

### Configure SystemJS

First, you need to let SystemJS know where to look when you import `@angular2-material`. You can do 
this by adding the path to the Material folder to the `maps` object. 

**src/system-config.ts**
```ts
const map: any = {
  '@angular2-material': 'vendor/@angular2-material'
};
```

This says something like "when you look for an @angular2-material import, look inside the vendor 
folder" (the base folder will already be `dist`).

Next, you need to let SystemJS know how to process the new modules.  Specifically, you need to point 
to the main files of each of the packages. You can also set the format to `cjs` and the 
defaultExtension to `js`, but it's not required.

**src/system-config.ts**
```ts
const packages:any = {};

// put the names of any of your Material components here
const materialPkgs:string[] = [
  'core',
  'button',
  'card',
];

materialPkgs.forEach((pkg) => {
  packages[`@angular2-material/${pkg}`] = {main: `${pkg}.js`};
});
```

You can see an example `system-config.ts` [here](https://github.com/kara/puppy-love-io/blob/master/src/system-config.ts).

### Import and use the components

Now you should be able to import the components normally wherever you'd like to use them.
  
**src/app/my-project.component.ts**
```ts
import { MD_CARD_DIRECTIVES } from '@angular2-material/card';
import { MD_BUTTON_DIRECTIVES } from '@angular2-material/button';
```

And don't forget to add the directives to your directives array:

**src/app/my-project.component.ts**
```ts
directives: [MD_CARD_DIRECTIVES, MD_BUTTON_DIRECTIVES]
```

### Sample Angular Material 2 projects

- [Puppy Love (ng-conf 2016)](https://github.com/kara/puppy-love) - see live demo [here](https://youtu.be/rRiV_b3WsoY?t=4m20s) 
- [Puppy Love Mobile (Google IO 2016)](https://github.com/kara/puppy-love-io)
- [Material 2 Sample App](https://github.com/jelbourn/material2-app)

### Additional steps for `md-icon` setup:

- If you want to use Material Design icons, load the Material Design font in your `index.html`.  `md-icon` supports any font icons or svg icons,
 so this is only one potential option.
       
**src/index.html**
```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```
       
- Include http providers in your `main.ts`: 
    
**src/main.ts**
```ts
import { HTTP_PROVIDERS } from '@angular/http';
...
bootstrap(MyAppComponent, [
    HTTP_PROVIDERS
]);       
```
    
- Provide the icon registry at or above the component where you're using the icon:

**src/app/my-project.component.ts**
 ```ts
    import {MdIcon, MdIconRegistry} from '@angular2-material/icon';
    ...
    directives: [MD_CARD_DIRECTIVES, MD_BUTTON_DIRECTIVES, MdIcon],
    providers: [MdIconRegistry]
 ```
    
    
    
    

