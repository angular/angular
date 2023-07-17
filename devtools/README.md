# Angular DevTools

Angular DevTools is a browser DevTools extension for debugging and profiling Angular applications.

## Installing and Running locally

To setup your local development environment for Angular DevTools, perform the following steps:

```bash
git clone git://github.com/angular/angular
cd angular
yarn
yarn run devtools:devserver
```

## Publish Angular DevTools

To publish Angular DevTools to Firefox or Chrome stores:

1. Update the version of the corresponding manifest file. Currently, Angular DevTools uses different versioning compared to the rest of the packages within the monorepo.
  * `manifest.chrome.json` for Chrome
  * `manifest.firefox.json` for Firefox
1. Build the extension:
  * `yarn devtools:build:chrome` for Chrome
  * `yarn devtools:build:firefox` for Firefox
1. Find the extension production assets in `dist/bin/devtools/projects/shell-browser/src/prodapp` relative to the root of the Angular monorepo
1. Zip the files in the directory
1. Upload them to the corresponding store

### Firefox

1. Go to the Firefox Addons [page](https://addons.mozilla.org/developers/addons)
1. For email enter `devrel@angular.io`
1. Find the password on Valentine
1. Setup Google Authenticator with the 2FA QR code. You can find the QR code on Valentine

### Chrome Web Store

1. Go to the extension [page](https://chrome.google.com/webstore/category/extensions)
1. Make sure your email is part of the Google Group we use for publishing the extension
1. Navigate to "Developer Dashboard"
1. Enter your account credentials
1. You should be able to change the publisher to "Angular"
