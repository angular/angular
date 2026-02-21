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
pnpm install --frozen-lockfile
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

#### Dev Install

To actually build and install as a real browser extension in dev mode, use:

```shell
pnpm devtools:build:chrome:debug
```

This will build the extension at `dist/bin/devtools/projects/shell-browser/src/prodapp`. Then go to `chrome://extensions`,
enable developer mode, and click "Load unpacked" to load the extension from that directory.

Whenever you rebuild the extension, make sure to reload the extension in `chrome://extensions`, right click on the
Angular DevTools panel and click "Reload frame", and refresh the page you're inspecting to make sure changes are applied.

#### Debugging

Depending on which script you want to debug, you can find them in different locations. In debug mode, these should all
have sourcemaps loaded and be unminified.

- The main "Angular DevTools" panel UI runs in its own frame and can be found by clicking "Inspect Element" directly
  on that UI.
  - Note that this inspects _all_ of Chrome DevTools, which loads Angular DevTools in an iframe.
  - The right entry point is under `index.html/ienfalfjdbdpebioblfackkekamfmbnh/...`
- Scripts directly executed in the inspected page content's can be found in the normal Sources panel under "Angular DevTools".
  - `backend_bundle.js`
  - `detect_angular_bundle.js`
- Content scripts are executed in the inspected page, but within an isolated environment and found in the normal Sources panel,
  but under the "Content Scripts" section (as opposed to "Page", "Workspace", "Overrides", etc., you may need to click an
  arrow to expand the list of sections).
  - `content_script_bundle.js`
  - `ng_validate_bundle.js`
- The background service worker is found at `chrome://extensions`.
  - Click on the "Angular DevTools" extension and the "Inspect Views > service worker" button to open a debugger.

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
