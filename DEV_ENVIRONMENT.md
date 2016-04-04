# Developer guide: getting your environment set up

1. Make sure you have `node` installed with a version at _least_ 4.2.3.
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

To run unit tests, run `npm test`.

###Running e2e tests:

To prepare your environment, you'll need to install protractor and selenium.

1. Globally install protractor:

```
npm install -g protractor
```

2.  Install the correct selenium version with webdriver-manager (this comes with protractor):

```
webdriver-manager update
```

When running the tests:

1.  Spin up a local server with `ng-serve`. 

2.  Run tests with:

```
protractor test/protractor.conf.js
```

Running benchmarks: not yet implemented
Running screenshot diff tests: not yet implemented
