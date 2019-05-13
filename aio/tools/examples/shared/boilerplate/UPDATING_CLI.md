# How to update the CLI boilerplate

The boilerplate is updated by hand so you normally update it every major version unless there is a major bug to fix.

## Getting a new boilerplate

The first thing would be updating the CLI globally

```
npm i -g @angular/cli@next
```

Then create a new dummy project in a temporary folder outside angular

```
ng new angular-io-example
```

Now you have a fresh application to get our new project files.

## Updating files

From `angular-io-example` you can replace the following files into `aio/tools/examples/shared/boilerplate/cli`:

* .editorconfig
* angular.json
* browserslist
* karma.conf.js
* package.json
* tsconfig.json
* tsconfig.spec.json
* tslint.json
* e2e/src/app.po.ts
* e2e/protractor.conf.js
* e2e/tsconfig.json
* src/environments/environment.prod.ts
* src/environments/environment.ts
* src/favicon.ico
* src/polyfills.ts
* src/styles.css
* src/test.ts
* src/typings.d.ts

### angular.json

Update all `angular-io-example` references from  to `angular.io-example`.

### package.json

Update the `name` to `angular.io-example`.

### tsconfig.app.json

Add or update the `exclude` section to filter our example progression files

```json
{
  ...
  "exclude": [
    "src/test.ts",
    "src/**/*.spec.ts",
    "src/**/*.avoid.ts",
    "src/**/*.0.ts",
    "src/**/*.1.ts",
    "src/**/*.1b.ts",
    "src/**/*.2.ts",
    "src/**/*.3.ts",
    "src/**/*.4.ts",
    "src/**/*.5.ts",
    "src/**/*.6.ts",
    "src/**/*.7.ts"
  ]
}
```

## Updating other CLI-based projects

Along with the boilerplate files for the `cli` folder, the other cli-based projects need to be updated also. Each cli-based project has slightly modified files specific to the project type. Make sure any necessary changes to these projects are made also to be in alignment with the `cli` project files.

* elements
  - tsconfig.json
* i18n
  - angular.json
  - package.json
* ivy
  - cli/tsconfig.app.json
* schematics
  - angular.json
* service-worker
  - angular.json
  - package.json
* testing
  - angular.json
* universal
  - angular.json
  - package.json