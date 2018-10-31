# Developer guide: getting your environment set up

1. Make sure you have `node` installed with a version at _least_ 10.0.0 and `yarn` with a version
   of at least 1.10.0. We recommend using `nvm` to manage your node versions.
2. Run `yarn global add gulp` to install gulp.
3. Fork the `angular/material2` repo on GitHub.
4. Clone your fork to your machine with `git clone`.
   Recommendation: name your git remotes `upstream` for `angular/material2`
   and `<your-username>` for your fork. Also see the [team git shortcuts](https://github.com/angular/material2/wiki/Team-git----bash-shortcuts).
5. From the root of the project, run `yarn`.


To build Material in dev mode, run `gulp material:build`.
To build Material in release mode, run `gulp material:build-release`

To bring up a local server, run `gulp serve:devapp`. This will automatically watch for changes
and rebuild. The browser should refresh automatically when changes are made.

### Running tests

To run unit tests, run `gulp test`.
To run the e2e tests, run `gulp e2e`.
To run lint, run `gulp lint`.
