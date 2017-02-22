This is the Angular Phonecat application adjusted to fit our boilerplate project
structure.

The following changes from vanilla Phonecat are applied:

* Karma config for unit tests is in karma.conf.ajs.js because the boilerplate
  Karma config is not compatible with the way AngularJS tests need to be run.
  The shell script run-unit-tests.sh can be used to run the unit tests.
* There's a `package.ajs.json`, which is not used to run anything but only to
  show an example of changing the PhoneCat http-server root path.
* Also for the Karma shim, there is a `karma-test-shim.1.js` file which isn't
  used but is shown in the test appendix.
* Instead of using Bower, AngularJS and its dependencies are fetched from a CDN
  in index.html and karma.conf.ajs.js.
* E2E tests have been moved to the parent directory, where `run-e2e-tests` can
  discover and run them along with all the other examples.
* Most of the phone JSON and image data removed in the interest of keeping
  repo weight down. Keeping enough to retain testability of the app.

## Running the app

Start like any example

    npm run start

## Running unit tests

    ./run-unit-tests.sh

## Running E2E tests

Like for any example (at the project root):

    gulp run-e2e-tests --filter=phonecat-2
