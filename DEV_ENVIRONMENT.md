# Developer guide: getting your environment set up

1. Make sure you have both `node` and `yarn` installed.
   We recommend using `nvm` to manage your node versions.
2. angular/components uses Bazel which requires certain Bash and UNIX tools.
   - On Windows: Follow the [instructions](https://docs.bazel.build/versions/master/install-windows.html#5-optional-install-compilers-and-language-runtimes)
   to install [`MSYS2`](https://www.msys2.org/) and the listed "Common MSYS2 packages".
   Afterwards add `C:\msys64\usr\bin` to the `PATH` environment variable.
3. Fork the `angular/components` repo on GitHub.
4. Clone your fork to your machine with `git clone`.
   Recommendation: name your git remotes `upstream` for `angular/components`
   and `<your-username>` for your fork. Also see the [team git shortcuts](https://github.com/angular/components/wiki/Team-git----bash-shortcuts).
5. From the root of the project, run `yarn` to install the dependencies.


To build angular/components in release mode, run `yarn build`. The output can be found under `dist/releases`.

To bring up a local server, run `yarn dev-app`. This will automatically watch for changes
and rebuild. The browser should refresh automatically when changes are made.

### Running tests

To run unit tests, run `yarn test <target>`. The `target` can be either a short name (e.g. `yarn test button`) or an explicit path `yarn test src/cdk/stepper`.
To run the e2e tests, run `yarn e2e`.
To run lint, run `yarn lint`.
