# How to update the CLI project 

The Angular CLI default setup is updated using `ng update`. Any necessary file changes will be done automatically through migration schematics.

In the `cli` folder, update the Angular CLI depedencies to the latest version:

```
ng update @angular/cli --next
```

Then update the Angular Framework dependencies to the latest version:

```
ng update @angular/core --next
```

Commit any changes to the `cli` folder to the repository.

## Updating other CLI-based projects

Along with the boilerplate files for the `cli` folder, the other cli-based projects need to be updated also. Each cli-based project has slightly modified files specific to the project type. Make sure any necessary changes to these projects are made also to be in alignment with the `cli` project files.

The specific changes to each project type are listed below:

* i18n
  - angular.json
    - Includes additional configurations for `build`, `serve`, and `e2e` for different locales
  - package.json
    - Includes custom scripts for building and serving different locales
* ivy
  - cli/tsconfig.app.json
    - Includes an `angularCompilerOptions` object with `enableIvy` set to `true`
* schematics
  - angular.json
    - Includes a `my-lib` project that contains a library with example schematics
* service-worker
  - angular.json
    - Has `serviceWorker` set to `true` in the `production` build target
  - package.json
    - Includes `@angular/service-worker` in `dependencies`
* testing
  - angular.json
    - Includes `src/test.css` in the `styles` for the `test` target
* universal
  - angular.json
    - Includes a `server` target in the `build` architect runners
  - package.json
    - Includes custom scripts for building the `server`
    - Includes additional `dependencies` on `@nguniversal/common`, `@nguniversal/express-engine`, and `@nguniversal/module-map-ngfactory-loader`
    - Includes `devDependencies` on `@angular/platform-server`, and `ts-loader`
