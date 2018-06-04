# How to update the CLI boilerplate

The boilerplate is updated by hand so you normally update it every minor version unless there is a major bug to fix.

## Getting a new boilerplate

The first thing would be updating the CLI globally

```
npm i -g @angular/cli
```

Then create a new dummy project in a temporary folder outside angular

```
ng new dummy
```

Now you have a fresh application to get our new boilerplate files.

## Updating files

From `dummy` you can replace the following files into `aio/tools/examples/shared/boilerplate/cli`:

* .editorconfig
* angular.json
* package.json
* tsconfig.json
* tslint.json
* e2e/src/app.po.ts
* e2e/protractor.conf.js
* e2e/tsconfig.e2e.json
* src/environments/environment.prod.ts
* src/environments/environment.ts
* src/browserslist
* src/favicon.ico
* src/karma.conf.js
* src/polyfills.js
* src/styles.css
* src/test.ts
* src/tsconfig.app.json
* src/tsconfig.spec.json
* src/tslint.json
* src/typings.d.ts

### angular.json

Update the `project > name` to `angular.io-example`.

### package.json

Update the `name` to `angular.io-example`.

### src/tsconfig.app.json

This file is small enough and there are a few new excludes, update by hand.
