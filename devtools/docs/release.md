# Publish Angular DevTools

Publishing Angular DevTools is achieved through the following steps:

## 0. Check if there's anything to release

On the `main` branch, run:

```shell
git log "HEAD...$(git log HEAD~1 --grep="release:.*Angular DevTools" --format=format:%H | head -n 1)~1" --oneline |
    grep "(devtools):\|release:.*Angular DevTools" --color=never
```

If this displays any commits since the most recent release commit, then there's something to release.

## 1. Sync workspace

Before starting anything, make sure your workspace is up to date with latest changes and dependencies.

```shell
git checkout main
git pull upstream main
nvm install
yarn --immutable
```

## 2. Update extension version numbers

Bump the version numbers listed in
[`manifest.chrome.json`](/devtools/projects/shell-browser/src/manifest/manifest.chrome.json)
and [`manifest.firefox.json`](/devtools/projects/shell-browser/src/manifest/manifest.firefox.json).

### 3. Commit and merge

Commit the version bump:

```shell
git checkout -b devtools-release
git add . && git commit -m "release: bump Angular DevTools version to ${VERSION}"
git push -u origin devtools-release
```

Then create and merge a PR targeting `patch` with this change. Merging this PR does not
have any automation associated with it and can be merged at any time.

Once the PR is merged, pull and check out that specific commit hash on `main` and reinstall
dependencies as they might have changed.

```shell
git fetch upstream main
git checkout "${MERGED_RELEASE_COMMIT}"

nvm install
yarn --immutable
```

Note that while the steps below can technically be done without merging the release PR
or checking out the merged commit, doing so is useful for release stability (actually
releasing what the commit history says we are) and is _necessary_ for accurate changelog
generation.

## 4. Publish to Chrome Chrome

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

## 5. Publish to Firefox

To publish Angular DevTools as a Firefox Add-on, first build and package the extension.

```shell
# Build the Firefox version.
yarn devtools:build:firefox

# Package the extension.
(cd dist/bin/devtools/projects/shell-browser/src/prodapp && zip -r ~/devtools-firefox.zip *)
```

Then upload it:

1.  Go to the Firefox Addons [page](https://addons.mozilla.org/developers/addons)
1.  Find the email and password [on Valentine](http://valentine/#/show/1651707871496288)
1.  Set up Google Authenticator with the 2FA QR code.
    *   You can find the QR code [on Valentine as well](http://valentine/#/show/1651792043556329)

The Firefox publishing process is slightly more involved than Chrome.

### Changelog

Mozilla asks for a changelog, which needs to be authored manually. You can generate a list of
`(devtools)`-scoped commits since the last release with the following command:

```shell
git log "HEAD...$(git log HEAD~1 --grep="release:.*Angular DevTools" --format=format:%H | head -n 1)~1" --oneline |
    grep "(devtools):\|release:.*Angular DevTools" --color=never
```

Internal refactors and non-Firefox changes don't need to be mentioned (note that
`refactor(devtools)` is frequently used for feature work, so don't entirely ignore a commit for
that reason).

Mozilla's changelog rendering does support basic markdown, so you can write these in a list format:

```md
* Fixes stuff.
* Breaks some other stuff.
```

### Source Code

Mozilla also requires extension source code with instructions to build and run it. Since DevTools
exists in a monorepo with critical build tooling existing outside the `devtools/` directory, we
need to upload the entire monorepo. Package it without dependencies and generated files with the
following command and upload it.

```shell
rm -rf dist/ && zip -r ~/angular-source.zip * -x ".git/*" -x "node_modules/*" -x "**/node_modules/*"
```

Suggested note to reviewer:

> This is a monorepo and includes much more code than just the DevTools extension. The relevant
> code is under \`devtools/...\` and \`devtools/README.md\` contains instructions for compiling
> release builds locally.
>
> The uploaded source is equivalent to
> https://github.com/angular/angular/tree/${RELEASE_COMMIT}/.

Similar to Chrome, we need to wait for approval from Mozilla before the extension is released.
There's no hard upper-bound on this, but historically it typically takes at least a week.

Once the release is in-review for both Chrome and Firefox, the process is complete.
