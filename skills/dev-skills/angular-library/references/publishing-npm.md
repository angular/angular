# Publishing to npm

## Overview

Publishing an Angular library to npm makes it available for any Angular project to install and use.

---

## Pre-publish Checklist

Before publishing, ensure:

- [ ] The library builds without errors: `ng build my-lib`
- [ ] All unit tests pass: `ng test my-lib`
- [ ] `peerDependencies` are correctly defined in `package.json`
- [ ] The version number follows [semantic versioning](https://semver.org/)
- [ ] `README.md` is present in the library's `dist/` or source folder

---

## Versioning with Semantic Versioning (semver)

| Change type                      | Version bump | Example           |
| -------------------------------- | ------------ | ----------------- |
| Bug fix, no breaking changes     | Patch        | `1.0.0` → `1.0.1` |
| New feature, backward compatible | Minor        | `1.0.0` → `1.1.0` |
| Breaking change                  | Major        | `1.0.0` → `2.0.0` |

Update the version in the library's `package.json`:

```json
{
  "name": "@my-org/my-lib",
  "version": "1.1.0"
}
```

Or use `npm version` from the `dist/` folder:

```bash
cd dist/my-lib
npm version patch
```

---

## `package.json` Configuration

A well-configured library `package.json`:

```json
{
  "name": "@my-org/my-lib",
  "version": "1.0.0",
  "description": "An Angular component library",
  "keywords": ["angular", "components"],
  "license": "MIT",
  "author": "Your Name",
  "repository": {
    "type": "git",
    "url": "https://github.com/my-org/my-lib.git"
  },
  "peerDependencies": {
    "@angular/core": ">=19.0.0",
    "@angular/common": ">=19.0.0"
  },
  "dependencies": {}
}
```

---

## Publishing the Built Package

Always publish from the `dist/` directory, not the source:

```bash
cd dist/my-lib
npm publish
```

For scoped packages under an npm organization, publish with public access:

```bash
npm publish --access public
```

---

## Automating with a Script

Add a publish script in the workspace root `package.json`:

```json
{
  "scripts": {
    "publish:my-lib": "ng build my-lib && cd dist/my-lib && npm publish --access public"
  }
}
```

---

## Using `.npmignore` or `ng-package.json` Assets

Files in the library source that should **not** appear in the published package (e.g., spec files, internal scripts) are automatically excluded by ng-packagr.

To include extra files (e.g., a `README.md` or `CHANGELOG.md`), add them to the `assets` array in `ng-package.json`:

```json
{
  "lib": {
    "entryFile": "src/public-api.ts"
  },
  "assets": ["README.md", "CHANGELOG.md"]
}
```

---

## Prerelease Versions

For alpha, beta, or release candidate versions:

```bash
npm version 2.0.0-beta.1
npm publish --tag beta
```

Consumers install a specific tag with:

```bash
npm install @my-org/my-lib@beta
```

---

## `ng add` Support

To support `ng add my-lib`, add an `ng-add` schematic to the library. See [schematics.md](schematics.md).

---

> Never publish from the `projects/my-lib/` source folder. Always build first and publish from `dist/my-lib/`.
