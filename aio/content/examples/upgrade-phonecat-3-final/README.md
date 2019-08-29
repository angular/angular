This is the Angular Phonecat application adjusted to fit our boilerplate project
structure.

The following changes from vanilla Phonecat are applied:

* Karma config for unit tests is in karma.conf.ng1.js because the boilerplate
  Karma config is not compatible with the way tests in this project need to be run.
  The shell script run-unit-tests.sh can be used to run the unit tests.
* E2E tests have been moved to the parent directory, where `run-e2e-tests` can
  discover and run them along with all the other examples.
* Most of the phone JSON and image data removed in the interest of keeping
  repo weight down. Keeping enough to retain testability of the app.

## Running the app

Start like any example

    npm run start

## Running E2E tests

Like for any example (at the project root):

    gulp run-e2e-tests --filter=phonecat-3
