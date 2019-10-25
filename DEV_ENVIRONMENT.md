# Developer guide: getting your environment set up

1. Make sure you have `node` installed with a version at _least_ 10.0.0 and `yarn` with a version
   of at least 1.10.0. We recommend using `nvm` to manage your node versions.
2. angular/components uses Bazel which requires certain Bash and UNIX tools.
   - On Windows: Follow the [instructions](https://docs.bazel.build/versions/master/install-windows.html#5-optional-install-compilers-and-language-runtimes)
   to install [`MSYS2`](https://www.msys2.org/) and the listed "Common MSYS2 packages".
   Afterwards add `C:\msys64\usr\bin` to the `PATH` environment variable.
3. Run `yarn global add gulp` to install gulp.
4. Fork the `angular/components` repo on GitHub.
5. Clone your fork to your machine with `git clone`.
   Recommendation: name your git remotes `upstream` for `angular/components`
   and `<your-username>` for your fork. Also see the [team git shortcuts](https://github.com/angular/components/wiki/Team-git----bash-shortcuts).
6. From the root of the project, run `yarn`.


To build angular/components in dev mode, run `gulp material:build`.
To build angular/components in release mode, run `gulp material:build-release`

To bring up a local server, run `yarn dev-app`. This will automatically watch for changes
and rebuild. The browser should refresh automatically when changes are made.

### Running tests

To run unit tests, run `yarn test`.
To run the e2e tests, run `yarn e2e`.
To run lint, run `yarn lint`.
