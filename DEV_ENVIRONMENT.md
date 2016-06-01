# Developer guide: getting your environment set up

1. Make sure you have `node` installed with a version at _least_ 5.5.0.
2. Run `npm install -g angular-cli` to install the Angular CLI.
3. Fork the `angular/material2` repo. 
4. Clone your fork. 
   Recommendation: name your git remotes `upstream` for `angular/material2`
   and `<your-username>` for your fork. Also see the [team git shortcuts](https://github.com/angular/material2/wiki/Team-git----bash-shortcuts).
5. From the root of the project, run `npm install`, then run `npm run typings` to install typescript definitions.

To build the project, run `ng build`. 
To watch for changes and automatically rebuild, run `ng build --watch`

To bring up a local server, run `ng serve`. This will automatically watch for changes and rebuild.
After the changes rebuild, the browser currently needs to be manually refreshed.

### Running unit tests

To run unit tests, run `npm test` or use the CLI with `ng test`.

### Running e2e tests

To prepare your environment, you'll need to install protractor and selenium.

```bash
# 1. Install the correct selenium version with webdriver-manager (this comes with protractor):
npm run webdriver-manager update
```

In order to run the tests:

```bash
# 1. Spin up a local server with 
MD_APP=e2e ng serve

# 2. Run tests with:
ng e2e
```

### Running benchmarks
Not yet implemented.

### Running screenshot diff tests.
Not yet implemented.
