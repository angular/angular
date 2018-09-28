# Workspace and project file structure

An Angular CLI project is the foundation for both quick experiments and enterprise solutions. The CLI command `ng new` creates an Angular workspace in your file system that is the root for new projects, which can be apps and libraries.

## Workspaces and project files

Angular 6 introduced the [workspace](guide/glossary#workspace) directory structure for Angular [projects](guide/glossary#project).  A project can be a standalone *application* or a *library*, and a workspace can contain multiple applications, as well as libraries that can be used in any of the apps. 

The CLI command `ng new my-workspace` creates a workspace folder and generates a new app skeleton in an `app` folder  within that workspace.  
Within the `app/` folder, a `src/` subfolder contains the logic, data, and assets.
A newly generated `app/` folder contains the source files for a root module, with a root component and template. 

The `app/` folder also contains project-specific configuration files, end-to-end tests, and the Angular system modules.

```
 my-workspace/
   app/
      e2e/
        src/
      node_modules/
      src/  
``` 

When this workspace file structure is in place, you can use the `ng generate` command on the command line to add functionality and data to the initial app.

<div class="alert-is-helpful>

 Besides using the CLI on the command line, You can also use an interactive development environment like [Angular Console](https://angular.console.com), or manipulate files directly in the app's source folder and configuration files.

</div>

{@a global-config}

## Global workspace configuration

A workspace can contain additional apps and libraries, each with its own root folder under `projects/`.

```
 my-workspace/
  app/
  projects/
    my-app/
    helpful-library/
    my-other-app/
  angular.json
  
```
At the top level of the workspace, the CLI configuration file, `angular.json`, let you set defaults for all projects in the workspace. You can configure a workspace, for example, such that all projects in it have global access to libraries, scripts, and CSS styles. (For more in this, see [Configuring global access](#global-access).)

You can also use `ng generate app` to create new Angular apps in the workspace, and use the `ng add` command to add libraries. 
If you add libraries or generate more apps within a workspace, a `projects/` folder is created to contain the new libraries or apps. 
Additional apps and library subfolders have the same file structure as the initial app.

All of the projects within a workspace share a CLI configuration context, controlled by the `angular.json` configuration file at the root level of the workspace. 

| GLOBAL CONFIG FILES | PURPOSE |
| :------------- | :------------------------------------------|
| `angular.json` | Sets defaults for the CLI and configuration options for build, serve, and test tools that the CLI uses, such as [Karma](https://karma-runner.github.io/) and [Protractor](http://www.protractortest.org/). For complete details, see *CLI Reference (link TBD)*. |

## App source folder

The app-root source folder contains your app's logic and data. Angular components, templates, styles, images, and anything else your app needs go here. Files outside of the source folder support testing and building your app.

```
   src/
    app/
        app.component.css
        app.component.html
        app.component.spec.ts
        app.component.ts
        app.module.ts
        assets/...
    favicon.ico
    index.html
    main.ts
    test.ts
```

| APP SOURCE FILES | PURPOSE |
| :----------------------------- | :------------------------------------------|
| `app/app.component.ts`         | Defines the logic for the app's root component, named AppComponent. The view associated with this root component becomes the root of the [view hierarchy](guide/glossary#view-hierarchy) as you add components and services to your app. |
| `app/app.component.html`       | Defines the HTML template associated with the root AppComponent. |
| `app/app.component.css`        | Defines the base CSS stylesheet for the root AppComponent. |
| `app/app.component.spec.ts`    | Defines a unit test for the root AppComponent. |
| `app/app.module.ts`            | Defines the root module, named AppModule, that tells Angular how to assemble the application. Initially declares only the AppComponent. As you add more components to the app, they must be declared here. |
| `assets/*`                     | Contains image files and other asset files to be copied as-is when you build your application. |

| PROJECT-LEVEL FILES        | PURPOSE |
| :------------------------  | :------------------------------------------|
| `favicon.ico`              | An icon to use for this app in the bookmark bar. |
| `index.html`               | The main HTML page that is served when someone visits your site. The CLI automatically adds all JavaScript and CSS files when building your app, so you typically don't need to add any `<script>` or` <link>` tags here manually. |
| `main.ts`                  | The main entry point for your app. Compiles the application with the [JIT compiler](https://angular.io/guide/glossary#jit) and bootstraps the application's root module (AppModule) to run in the browser. You can also use the [AOT compiler](https://angular.io/guide/aot-compiler) without changing any code by appending the `--aot` flag to the CLI `build` and `serve` commands. |
| `test.ts`                   | The main entry point for your unit tests, with some Angular-specific configuration. You don't typically need to edit this file. |

## App support file structure

Additional files in a project's root folder help you build, test, maintain, document, and deploy the app. These files go in the app root folder next to `src/`.

```
workspace_root/
  my-app/
   e2e/
     src/
       app.e2e-spec.ts
       app.po.ts
       tsconfig.e2e.json
       protractor.conf.js
   node_modules/...
   src/...
```

| FOLDERS | PURPOSE |
| :---------------- | :-------------------------------------------- |
| `e2e/`            | This folder contains end-to-end tests for the app. This is a separate app that tests your main app. The folder and its contents are generated automatically when you create a new app with the CLI `new` or `generate` command. |
| `node_modules/`   | Node.js creates this folder and puts all third party modules listed in `package.json` in it. *when? doesn't ng new create it?* |

### Project-level configuration

Each project uses the CLI configuration at the workspace root-level `angular.json` file.
Additional project-specific configuration files are found at the project root level of each app or library. 

```
 my-workspace/
  app/
    .editorconfig
    .gitignore
    package.json
    README.md
    tsconfig.json
    tsconfig.test.json
    tslint.json
  projects/
    helpful-library/
    my-other-app/
      .editorconfig
      .gitignore
      package.json
      README.md
      tsconfig.json
      tsconfig.test.json
      tslint.json
  angular.json
```

| CONFIGURATION FILES | PURPOSE |
| :------------------ | :-------------------------------------------- |
| `.editorconfig`     | Simple configuration for your editor to make sure everyone who uses your project has the same basic configuration. Supported by most editors. See http://editorconfig.org for more information. |
| `.gitignore`        | Git configuration to make sure autogenerated files are not committed to source control. |
| `package.json`       | Configures the `npm` package manager, listing the third party packages your project uses. You can also add your own custom scripts here. |
| `README.md`          | Basic documentation for your project, pre-filled with CLI command information. We recommend that you keep this updated so that anyone checking out the repo can build your app. |
| `tsconfig.json`      | TypeScript compiler configuration, that an IDE such as [Visual Studio Code](https://code.visualstudio.com/) uses to give you helpful tooling. |
| `tslint.json`        | Linting configuration for [TSLint](https://palantir.github.io/tslint/) together with [Codelyzer](http://codelyzer.com/), used when running the CLI `lint` command. Linting helps keep your code style consistent. |

{@a global-access}

## Configuring global access

The CLI configuration scope is global for a workspace. 
You can make scripts, libraries, and styles available to all projects in the workspace by setting options in the `angular.json` file in the root workspace folder. 
 

### Adding global scripts

You can configure your project to add JavaScript files to the global scope. 
This is especially useful for legacy libraries or analytic snippets. 

In the CLI configuration file, `angular.json`, add the associated script files to the `scripts` array. 
The scripts are loaded exactly as if you had added them in a `<script>` tag inside `index.html`. 
For example:

```
"architect": {
  "build": {
    "builder": "@angular-devkit/build-angular:browser",
    "options": {
      "scripts": [
        "src/global-script.js",
      ],
```

You can also rename the output from a script and lazy load it by using the object format in the "scripts" entry. 
For example:

```
"scripts": [
  "src/global-script.js",
  { "input": "src/lazy-script.js", "lazy": true },
  { "input": "src/pre-rename-script.js", "bundleName": "renamed-script" },
],
```

If you need to add scripts for unit tests, specify them the same way in the "test" target.

{@a add-lib}
### Adding a global library

Some JavaScript libraries need to be added to the global scope and loaded as if they were in a script tag. 
Configure the CLI to do this using the "scripts" and "styles" options of the build target in the CLI configuration file, `angular.json`.

For example, to use the [Bootstrap 4](https://getbootstrap.com/docs/4.0/getting-started/introduction/) 
library, first install the library and its dependencies using the `npm` package manager:

```
npm install jquery --save
npm install popper.js --save
npm install bootstrap --save
```

In the `angular.json` configuration file, add the associated script files to the "scripts" array:

```
"scripts": [
  "node_modules/jquery/dist/jquery.slim.js",
  "node_modules/popper.js/dist/umd/popper.js",
  "node_modules/bootstrap/dist/js/bootstrap.js"
],
```

Add the Bootstrap CSS file to the "styles" array:

```
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.css",
  "src/styles.css"
],
```

Run or restart `ng serve` to see Bootstrap 4 working in your app.

#### Using global libraries inside your app

Once you import a library using the "scripts" array in the configuration file, 
you should *not* import it using an `import` statement in your TypeScript code 
(such as `import * as $ from 'jquery';`). 
If you do, you'll end up with two different copies of the library: 
one imported as a global library, and one imported as a module. 
This is especially bad for libraries with plugins, like JQuery, 
because each copy will have different plugins.

Instead, download typings for your library (`npm install @types/jquery`) and follow the installation steps
given above in [Adding a global library](#add-lib). 
This gives you access to the global variables exposed by that library.

{@a define-types}
#### Defining typings for global libraries

If the global library you need to use does not have global typings, 
you can declare them manually as `any` in `src/typings.d.ts`. For example:

```
declare var libraryName: any;
```

Some scripts extend other libraries; for instance with JQuery plugins:

```
$('.test').myPlugin();
```

In this case, the installed `@types/jquery` doesn't include `myPlugin`, 
so you need to add an *interface* in `src/typings.d.ts`. 
For example:

```
interface JQuery {
  myPlugin(options?: any): any;
}
```

If you fail to add the interface for the script-defined extension, your IDE shows an error:

```
[TS][Error] Property 'myPlugin' does not exist on type 'JQuery' 
```

### Adding global styles and style preprocessors

Angular CLI supports CSS imports and all major CSS preprocessors:

* [Sass/Scss](http://sass-lang.com/)
* [Less](http://lesscss.org/)
* [Stylus](http://stylus-lang.com/)

Angular assumes CSS styles by default, but when you create a project with the 
CLI `new` command, you can specify the `--style` option to use SASS or STYL styles. 

```
> ng new sassyproject --style=sass
> ng new scss-project --style=scss
> ng new less-project --style=less
> ng new styl-project --style=styl
```

You can also set the default style for an existing project by configuring `@schematics/angular`, 
the default schematic for the Angular CLI:

```
> ng config schematics.@schematics/angular:component.styleext scss
```

#### Style configuration 

By default, the `styles.css` configuration file lists CSS files that supply global styles for a project. 
If you are using another style type, there is a similar configuration file for global style files of that type, 
with the extension for that style type, such as `styles.sass`.

You can add more global styles by configuring the build options in the `angular.json` configuration file. 
List the style files in the "styles" section in your project's "build" target  
The files are loaded exactly as if you had added them in a `<link>` tag inside `index.html`.

```
"architect": {
  "build": {
    "builder": "@angular-devkit/build-angular:browser",
    "options": {
      "styles": [
        "src/styles.css",
        "src/more-styles.css",
      ],
      ...
```

If you need the styles in your unit tests, add them to the "styles" option in the "test" target configuration as well.

You can specify styles in an object format to rename the output and lazy load it:

```
"styles": [
  "src/styles.css",
  "src/more-styles.css",
  { "input": "src/lazy-style.scss", "lazy": true },
  { "input": "src/pre-rename-style.scss", "bundleName": "renamed-style" },
],
```

In Sass and Stylus you can make use of the `includePaths` functionality for both component and global styles, 
which allows you to add extra base paths to be checked for imports.
To add paths, use the `stylePreprocessorOptions` build-target option:

```
"stylePreprocessorOptions": {
  "includePaths": [
    "src/style-paths"
  ]
},
```

You can then import files in the given folder (such as `src/style-paths/_variables.scss`) 
anywhere in your project without the need for a relative path:

```
// src/app/app.component.scss
// A relative path works
@import '../style-paths/variables';
// But now this works as well
@import 'variables';
```

#### CSS preprocessor integration

To use a supported CSS preprocessor, add the URL for the preprocessor 
to your component's `styleUrls` in the `@Component()` metadata. 
For example:

```
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app works!';
}
```

<div class="alert-is-helpful>

Style strings added directly to the `@Component() styles array must be written in CSS. 
The CLI cannot apply a pre-processor to inline styles.

</div>

