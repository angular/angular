# Angular DevTools

Angular DevTools is a browser DevTools extension for debugging and profiling Angular applications.

## Installing and Running locally

To setup your local development environment for Angular DevTools, see [DEVELOPING.md](./DEVELOPING.md)

## Publish Angular DevTools

Publishing Angular DevTools is a five step process:
1.  Sync and update workspace.
1.  Update extension version numbers.
1.  Publish to Chrome.
1.  Publish to Firefox.
1.  Commit and merge the updated version numbers.

### 1. Sync workspace

Before starting anything, make sure your workspace is up to date with latest changes and dependencies.

```shell
git checkout main
git pull upstream main
nvm install
yarn --frozen-lockfile
```

### 2. Update extension version numbers

Bump the version numbers listed in
[`manifest.chrome.json`](/devtools/projects/shell-browser/src/manifest/manifest.chrome.json)
and [`manifest.firefox.json`](/devtools/projects/shell-browser/src/manifest/manifest.firefox.json).

### 3. Publish to Chrome Chrome

To publish Angular DevTools to the Chrome Web Store, first build and package the extension.

```shell
# Build the Chrome version.
yarn devtools:build:chrome

# Package the extension.
(cd dist/bin/devtools/projects/shell-browser/src/prodapp && zip -r ~/devtools-chrome.zip *)
```

Then upload it to the Chrome Web Store.

1. Go to the extension [page](https://chrome.google.com/webstore/category/extensions)
1. Make sure your email is part of the Google Group we use for publishing the extension
1. Navigate to "Developer Dashboard"
1. Enter your account credentials
1. You should be able to change the publisher to "Angular"

You can choose to either publish immediately or only get approval but hold to publish at a later time.
Note that even publishing immediately still requires approval from Chrome Web Store before it is
available to users. Historically this has been pretty quick (< 30 minutes), but there is no hard upper
limit on how long a review might take: https://developer.chrome.com/docs/webstore/review-process#review-time.

### 4. Firefox

To publish Angular DevTools as a Firefox Add-on, first build and package the extension.

```shell
# Build the Firefox version.
yarn devtools:build:firefox

# Package the extension.
(cd dist/bin/devtools/projects/shell-browser/src/prodapp ~/devtools-firefox && zip -r ~/devtools-firefox.zip *)
```

Then upload it:

1. Go to the Firefox Addons [page](https://addons.mozilla.org/developers/addons)
1. For email enter `devrel@angular.io`
1. Find the password [on Valentine](http://valentine/#/show/1651707871496288)
1. Setup Google Authenticator with the 2FA QR code. You can find the QR code on Valentine

The Firefox publishing process is slightly more involved than Chrome. In particular, they
require extension source code with instructions to build and run it. Since DevTools exists in
a monorepo with critical build tooling existing outside the `devtools/` directory, we need to
upload the entire monorepo. Package it without dependencies and generated files with the
following command and upload it.

```shell
zip -r ~/angular-source.zip * -x ".git/*" -x "node_modules/*" -x "**/node_modules/*" -x "dist/"
```

Suggested note to reviewer:

> This is a monorepo and includes much more code than just the DevTools extension. The relevant
> code is under `devtools/...` and `devtools/README.md` contains instructions for building and
> testing locally.
>
> The uploaded source is equivalent to
> https://github.com/angular/angular/tree/${permalink to current main}/ with the single change
> of a bumped version number in the `manifest.json` file.

### 5. Commit and merge

Commit the version bump:

```shell
git checkout -b devtools-release
git add . && git commit -m "release: bump Angular DevTools version to 1.0.10"
git push -u origin devtools-release
```

Then create and merge a PR targeting `patch` with this change.

Once the PR merges and both Chrome and Firefox are showing the new version to end users, then
the release is complete!
