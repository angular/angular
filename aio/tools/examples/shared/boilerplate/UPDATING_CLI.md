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

* tslint.json
* tsconfig.json
* package.json
* protractor.conf.js
* karma.conf.js
* .editorconfig
* angular-cli.json
* src/tsconfig.spec.json
* src/test.ts
* src/polyfills.js
* src/typings.d.ts
* src/environments/environment.prod.ts
* src/environments/environment.ts

### .angular-cli.json

Update the `project > name` to `angular.io-example`.

### package.json

Update the `name` to `angular.io-example`.

### src/polyfills.ts

Uncomment the `import 'web-animations-js';` line to enable `web-animations-js` package.

### src/tsconfig.app.json

This file is small enough and there are a few new excludes, update by hand.
