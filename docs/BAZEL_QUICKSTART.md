# Bazel Quickstart

This document is intended for Angular contributors who have no (or hardly any) experience with [Bazel](./BAZEL.md). It includes some common troubleshooting examples which will help you get started efficiently.

## Overview

Although Bazel itself is written in various programming languages, what we can see in the Angular repo is actually Python declarations. The example [`devtools/tools/ng_module.bzl`](https://github.com/angular/angular/blob/c62b2dae8c4653996969df992e8f88887e7c83c4/devtools/tools/ng_module.bzl) file includes a declaration of `ng_module`:
```python
load("//tools:defaults.bzl", _ng_module = "ng_module")

def ng_module(name, tsconfig = "//devtools:tsconfig.json", srcs = [], angular_assets = [], **kwargs):
    _ng_module(
        name = name,
        tsconfig = tsconfig,
        srcs = srcs,
        assets = angular_assets,
        **kwargs
    )
```

which is later loaded, among others, in [`state-serializer/BUILD.bazel`](https://github.com/angular/angular/blob/c62b2dae8c4653996969df992e8f88887e7c83c4/devtools/projects/ng-devtools-backend/src/lib/state-serializer/BUILD.bazel#L2-L17) file:
```python
load("//devtools/tools:ng_module.bzl", "ng_module")

...

ng_module(
    name = "state-serializer",
    srcs = glob(
        include = ["*.ts"],
        exclude = ["*.spec.ts"],
    ),
    deps = [
        "//devtools/projects/ng-devtools-backend/src/lib/directive-forest",
        "//devtools/projects/protocol",
    ],
)
```

Another example, [`devtools/tools/typescript.bzl`](https://github.com/angular/angular/blob/c62b2dae8c4653996969df992e8f88887e7c83c4/devtools/tools/typescript.bzl) shows that the `tsconfig.json` (typescript setup) is taken from the [`devtools/tsconfig.json`](https://github.com/angular/angular/blob/c62b2dae8c4653996969df992e8f88887e7c83c4/devtools/tsconfig.json) file and **reused**, unless a python call to the `ts_library`/`ts_test_library` function (declaration) passes a different `tsconfig`:
```python
"""Helper macros for compiling typescript with consistent config"""

load("//tools:defaults.bzl", _ts_library = "ts_library")

def ts_library(name, tsconfig = "//devtools:tsconfig.json", **kwargs):
    _ts_library(
        name = name,
        tsconfig = tsconfig,
        **kwargs
    )

def ts_test_library(name, tsconfig = "//devtools:tsconfig.json", deps = [], **kwargs):
    _ts_library(
        name = name,
        tsconfig = tsconfig,
        testonly = 1,
        deps = deps,
        **kwargs
    )
```


The modular system allows Angular creators to create `ng_module`, `ts_library`, `ts_test_library` `sass_library`, `npm_sass_library`, `ts_config` and many, many others. What is important here is **defining dependencies explicitly and manually**.

## Key aspects

Working with Bazel is quite different, compared to webpack, vite, etc. From the beginner's perspective, bear in mind that:
- the fact, that a file is imported (e.g. `import {...} from '<path>'` in a TS file), **doesn't automatically make it available to the build**. The file has to be included into a Bazel build config (`BUILD.bazel`), more on that later.
- whenever changing file/directory structure, an appropriate change to a `BUILD.bazel` file is often required, as Angular repo is highly modularized (not only packages, but majority of all directories have their separate `BUILD.bazel`)
- when importing a TS file from another TS file, TypeScript itself has access to the file within your IDE. But if a file isn't included/imported in Bazel config, TS compiler (run on top of Bazel automation) will throw an error stating it cannot find a file or type.

## Common Scenarios

> sidenote: for clarity, all examples will relate to the repo content at [the `c62b2dae` commit](https://github.com/angular/angular/tree/c62b2dae8c4653996969df992e8f88887e7c83c4).

### Adding a dependency

Let's say you need to import something from an angular package:

```ts
import {Signal, WritableSignal} from '@angular/core';
```

and that hasn't been imported before, e.g. in the [`state-serializer.ts`](https://github.com/angular/angular/blob/c62b2dae8c4653996969df992e8f88887e7c83c4/devtools/projects/ng-devtools-backend/src/lib/state-serializer/state-serializer.ts) file.

After adding the line (and making use of the import, so that _dead code elimination_ doesn't kick in), the build is broken:

> devtools/projects/ng-devtools-backend/src/lib/state-serializer/state-serializer.ts:10:31 - error TS2307: Cannot find module '@angular/core' or its corresponding type declarations.
>
> ```ts
> import {Signal, WritableSignal} from '@angular/core';
>                                      ~~~~~~~~~~~~~~~
> ```

The reason is that current Bazel setup for `ng_module`:
```python
ng_module(
    name = "state-serializer",
    srcs = glob(
        include = ["*.ts"],
        exclude = ["*.spec.ts"],
    ),
    deps = [
        "//devtools/projects/ng-devtools-backend/src/lib/directive-forest",
        "//devtools/projects/protocol",
    ],
)
```
doesn't include the `@angular/code` in its `deps`. Add the `"//packages/core",`:
```python
ng_module(
    name = "state-serializer",
    srcs = glob(
        include = ["*.ts"],
        exclude = ["*.spec.ts"],
    ),
    deps = [
        "//devtools/projects/ng-devtools-backend/src/lib/directive-forest",
        "//devtools/projects/protocol",
        "//packages/core",
    ],
)
```

If you add a dependency in your tests, it has to be included the same way in the `ts_test_library` section.

### Separating files into a subdirectory

Let's say the current content of the [`state-serializer`](https://github.com/angular/angular/tree/c62b2dae8c4653996969df992e8f88887e7c83c4/devtools/projects/ng-devtools-backend/src/lib/state-serializer) is the following:

```
state-serializer/
    BUILD.bazel
    object-utils.ts
    serialized-descriptor-factory.ts
    signal-utils.ts
    state-serializer.spec.ts
    state-serializer.ts
    string-utils.ts
```

and you want to move `object-utils.ts`, `signal-utils.ts`, `string-utils.ts` to a separate `utils/` directory like in the following:

```
state-serializer/
    BUILD.bazel
    serialized-descriptor-factory.ts
    state-serializer.spec.ts
    state-serializer.ts
    utils/
        object-utils.ts
        signal-utils.ts
        string-utils.ts
```

Initially it will break the build:

> devtools/projects/ng-devtools-backend/src/lib/state-serializer/state-serializer.ts:11:23 - error TS2307: Cannot find module './utils/object-utils' or its corresponding type declarations.
>
> ```ts
> import {getKeys} from './utils/object-utils';
>                        ~~~~~~~~~~~~~~~~~~~~~~
> ```

even though the file exists at the location. That's because the current Bazel setup includes the following:

```python
ng_module(
    name = "state-serializer",
    srcs = glob(
        include = ["*.ts"],
        exclude = ["*.spec.ts"],
    ),
    deps = [
        "//devtools/projects/ng-devtools-backend/src/lib/directive-forest",
        "//devtools/projects/protocol",
    ],
)
```

Here, in `srcs`, the `include = ["*.ts"]` tells Bazel to only include all `*.ts` files from current directory, but not its subdirectories.

One solution is to replace it with `include = ["**/*.ts"],`, which would include files recursively.

Another solution is to provide a separate Bazel config:

```
state-serializer/
    BUILD.bazel
    serialized-descriptor-factory.ts
    state-serializer.spec.ts
    state-serializer.ts
    utils/
        BUILD.bazel # <- this one
        object-utils.ts
        signal-utils.ts
        string-utils.ts
```

### Adding a new implementation file

The scenario is similar to above: you need to make sure that `srcs` include the file that has been added, unless you need to import it from a separate package.

### Adding a new test file

Look at the `ts_test_library` section, [example](https://github.com/angular/angular/blob/c62b2dae8c4653996969df992e8f88887e7c83c4/devtools/projects/ng-devtools-backend/src/lib/state-serializer/BUILD.bazel#L26-L36):

```python
ts_test_library(
    name = "test_lib",
    srcs = [
        "state-serializer.spec.ts",
    ],
    deps = [
        ":state-serializer",
        "//devtools/projects/protocol",
        "//packages/core",
        "@npm//@types",
    ],
)
```

Make sure your new files are included in `srcs` and the dependencies you use are listed in `deps`.

### TypeScript settings

As it was stated in the *Overview*, a shared TypeScript setup is used. In case of `devtools`, the tsconfig is [`devtools/tsconfig.json`](https://github.com/angular/angular/blob/c62b2dae8c4653996969df992e8f88887e7c83c4/devtools/tsconfig.json) which, at the time of writing, includes:
```json
...
    "types": [
      "angular",
      "jasmine",
      "node"
    ],
    "paths": {
      "@angular/*": [
        "./packages/*",
        "./dist/bin/packages/*"
      ],
      "ng-devtools": [
        "./devtools/projects/ng-devtools/src/public-api.ts",
      ],
      "ng-devtools-backend": [
        "./devtools/projects/ng-devtools-backend/src/public-api.ts",
      ],
      "protocol": [
        "./devtools/projects/protocol/src/public-api.ts",
      ],
      "shared-utils": [
        "./devtools/projects/shared-utils/src/public-api.ts",
      ]
    },
  },
...
```

As listed above, some `types` are already available to TypeScript. Also, listed paths are overriden. That's why, for instance, you'll see:
```python
...
        "//packages/core",
        "//packages/forms",
        "//packages/platform-browser",
        "//packages/platform-browser-dynamic",
        "//packages/router",
        "//packages/zone.js/lib",
...
```
in Bazel config files (`packages/*` points to `packages/*`, and so `packages/core` points to `@angular/core`).

## Barrel files

What could also be surprising at first, is that standard `index.ts` *barrel files* don't exist. Instead, `public-api.ts` play  their role, as in [`devtools.component.ts`](https://github.com/angular/angular/blob/c62b2dae8c4653996969df992e8f88887e7c83c4/devtools/projects/ng-devtools/src/lib/devtools.component.ts#L13):

```ts
import {Events, MessageBus} from 'protocol';
```

As we've seen before, this exact path points to the [`devtools/projects/protocol/src/public-api.ts`](https://github.com/angular/angular/blob/c62b2dae8c4653996969df992e8f88887e7c83c4/devtools/projects/protocol/src/public-api.ts) file, with it's respective re-exports:
```ts
export * from './lib/messages';
export * from './lib/message-bus';
export * from './lib/priority-aware-message-bus';
```

In case of trouble, especially with importing dependencies, verify the tsconfig.json within your package - most probably it's reused across `ng_module`, `ts_library` and others.
