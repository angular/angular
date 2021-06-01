# Angular DevTools

## Table of content

- [Angular DevTools](#angular-devtools)
  - [Table of content](#table-of-content)
  - [Introduction](#introduction)
  - [Inspecting Code](#inspecting-code)
  - [Supported version](#supported-version)
  - [Working on Angular DevTools](#working-on-angular-devtools)
    - [Installing and Running locally](#installing-and-running-locally)
    - [Build and Install on Chrome locally](#build-and-install-on-chrome-locally)
  - [Reporting issues](#reporting-issues)
  - [Contributing](#contributing)
    - [General guidelines](#general-guidelines)
    - [License](#license)

## Introduction

Angular DevTools is a Chrome DevTools extension for debugging and profiling Angular applications.

You can install the extension from: [Chrome Web Store](https://chrome.google.com/webstore/detail/angular-developer-tools/ienfalfjdbdpebioblfackkekamfmbnh)

## Inspecting Code

Angular DevTools is a Chrome extension that provides debugging and profiling capabilities for Angular applications. A hard requirement is that the Angular application is running in development mode.

## Supported version

Angular DevTools supports Angular v9 and above, with Ivy enabled.

## Working on Angular DevTools

### Installing and Running locally

To setup your local development environment for Angular DevTools, perform the following steps:

```bash
git clone git://github.com/rangle/angular-devtools
cd angular-devtools
yarn
yarn start
```

### Build and Install on Chrome locally

1. After installation, generate chrome build by running `yarn build:chrome`
2. Navigate to `chrome://extensions` and enable Developer mode.
3. Choose "Load unpacked extension".
4. In the dialog, select the directory `dist/shell-chrome`.

## Reporting issues

Please search to make sure your issue is not already been reported. When opening an issue, please follow the issue template provided.

## Contributing

### General guidelines

If you'd like to help out, please read our [Development Guidelines](DEVELOPING.md) and [Contributing Guidelines](CONTRIBUTING.md).

### License

[MIT](LICENSE)
