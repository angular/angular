# Angular DevTools

Angular DevTools is a browser DevTools extension for debugging and profiling Angular applications.

## Developing Locally

<!-- This duplicates some general content for setting up the angular/angular repository, however it is important to
     have complete instructions here for Mozilla Add-On reviewers who need to be able to reproduce Angular DevTools
     builds and will use the same documentation. -->

### Set up

Follow the instructions below to set up your Angular DevTools development
environment. Note that all commands should be executed in the repository root, not
`devtools/`. All file paths are also relative to the repository root.

Debian Linux, MacOS, and Windows via WSL should build successfully. Building
natively on Windows without WSL is not supported at the moment.

To set up your development environment, first install the [correct version of Node](/.nvmrc). If you have
[`nvm`](https://github.com/nvm-sh/nvm) set up, this can be done with:

```shell
nvm install
```

Second, install [Yarn](https://classic.yarnpkg.com/en/):

```shell
npm install -g yarn@1
```

Third, install NPM dependencies:

```shell
yarn --frozen-lockfile
```

Now you should be ready to build the DevTools extension.

### Dev builds

To run the extension in development mode run:

```shell
yarn devtools:devserver
```

You can also run a standalone version of the demo app with:

```shell
yarn devtools:devserver:demo-standalone
```

This would start a development server that you can access on <http://localhost:4200>. In development, Angular DevTools
uses a "development shell." This is different from "chrome shell" in a way, that it runs the user's app in an iframe.
DevTools then communicate with the user's app via message passing.

### Release builds

You can build the release version of Angular DevTools for either Chrome or Firefox with:

```shell
yarn devtools:build:chrome:release
yarn devtools:build:firefox:release
```

Either way, the built extension will be at `dist/bin/devtools/projects/shell-browser/src/prodapp`.

#### Installation

For Chrome, you can install the extension from `dist/bin/devtools/projects/shell-browser/src/prodapp` by following the
guide from [here](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked).

For Firefox, to load the extension, you can go to the about:debugging page, click the "This Firefox" option and then
click the Load Temporary Add-on button. You'll have to select the manifest file in
`dist/bin/devtools/projects/shell-browser/src/prodapp` directly.

