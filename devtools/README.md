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

Second, install [pnpm](https://pnpm.io/):

```shell
npm install -g pnpm
```

Third, install NPM dependencies:

```shell
pnpm --frozen-lockfile
```

Now you should be ready to build the DevTools extension.

### Dev builds

To run the extension in development mode run:

```shell
pnpm devtools:devserver
```

This would start a development server that you can access on <http://localhost:4200>. In development, Angular DevTools
uses a "development shell." This is different from "chrome shell" in a way, that it runs the user's app in an iframe.
DevTools then communicate with the user's app via message passing.

### Running End-to-End Tests

Before running end-to-end tests, you need to start the development server using:

```shell
pnpm devtools:devserver
```
You have two options for running cypress, you can use the interactive cypress UI or you can run Cypress in headless mode.

To open Cypress for Angular DevTools in interactive mode, run:

```shell
pnpm devtools:e2e:open
```

To run Cypress tests headless, use:

```shell
pnpm devtools:test:e2e
```

### Release builds

You can build the release version of Angular DevTools for either Chrome or Firefox with:

```shell
pnpm devtools:build:chrome:release
pnpm devtools:build:firefox:release
```

Either way, the built extension will be at `dist/bin/devtools/projects/shell-browser/src/prodapp`.

#### Installation

For Chrome, you can install the extension from `dist/bin/devtools/projects/shell-browser/src/prodapp` by following the
guide from [here](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked).

For Firefox, to load the extension, you can go to the about:debugging page, click the "This Firefox" option and then
click the Load Temporary Add-on button. You'll have to select the manifest file in
`dist/bin/devtools/projects/shell-browser/src/prodapp` directly.

