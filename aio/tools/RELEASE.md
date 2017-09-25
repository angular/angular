# Docs releases

This document explains how to update the documentation examples after an Angular release. This is only needed for major and minor versions.

All the packages for the docs' examples are specified in `/aio/tools/examples/shared/package.json`

**1)** So within the `shared` folder, you need to issue the following command:

```
$ yarn upgrade-interactive --tilde
```

There, select all the packages that are updated on the new Angular release.

**2)** Changes to the tsconfig.json? There is one to update at `/aio/tools/examples/shared/boilerplate/src/tsconfig.json`

**3)** The file `/aio/tools/examples/shared/boilerplate/src/systemjs.config.web.js` contains the configuration for plunkers. It has some hardcoded versions that could be updated.

**4)** As in step 3, more hardcoded versions at `/aio/tools/plunker-builder/translator/rules/indexHtml.js`
