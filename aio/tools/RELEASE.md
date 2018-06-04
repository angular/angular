# Docs releases

This document explains how to update the documentation examples after an Angular release. This is only needed for major and minor versions.

All the packages for the docs' examples are specified in `/aio/tools/examples/shared/package.json`

**1)** So within the `shared` folder, you need to issue the following command:

```
$ yarn upgrade-interactive --tilde
```

There, select all the packages that are updated on the new Angular release.

**2)** Changes to the tsconfig.json? There are several files in `/aio/tools/examples/shared/boilerplate/*/tsconfig.json` (based on the example type).

**3)** The files `/aio/tools/examples/shared/boilerplate/systemjs/src/systemjs.config.web[.build].js` contains the configuration for plunkers. They have some hardcoded versions that could be updated.

>N.B.: Plunkers have been replaced by Stackblitz and (almost) all examples have be replaced by CLI/WebPack-based examples that do not use SystemJS.
The upgrade examples may still rely on SystemJS.

---
> NOTE(gkalpak):
> There are some `package.json` files in `/aio/tools/examples/shared/boilerplate/*`.
> AFAICT, they are copied over to the examples (based on the example type), but they are neither
> used for installing dependencies (which come from `/aio/tools/examples/shared/package.json`) nor
> used in zips (since they are overwritten by `/aio/tools/example-zipper/customizer`).
> For all stackblitz live-examples, `/aio/tools/examples/shared/boilerplate/cli/package.json` seems
> to be used.
