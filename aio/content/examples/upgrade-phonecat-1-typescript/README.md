This is the Angular Phonecat application adjusted to fit our boilerplate project
structure.

The following changes from vanilla Phonecat are applied:

*   The TypeScript config file shown in the guide is `tsconfig.ajs.json` instead
  of the default, because we don't want to enable `noImplicitAny` for migration.
*   Karma config for unit tests is in karma.conf.ajs.js because the boilerplate
  Karma config is not compatible with the way AngularJS tests need to be run.
  The shell script run-unit-tests.sh can be used to run the unit tests.
*   Instead of using Bower, AngularJS and its dependencies are fetched from a CDN
  in index.html and karma.conf.ajs.js.
*   E2E tests have been moved to the parent directory, where `gulp run-e2e-tests` can
  discover and run them along with all the other examples.
*   Most of the phone JSON and image data removed in the interest of keeping
  repo weight down. Keeping enough to retain testability of the app.

## Running the app

Start like any example

```shell
npm run start
```

You'll find the app under the /app path:

```http
http://localhost:3002/app/index.html
```

## Running unit tests

```shell
./run-unit-tests.sh
```

## Running E2E tests

Like for any example \(at the project root\):

```shell
gulp run-e2e-tests --filter=phonecat-1
```
