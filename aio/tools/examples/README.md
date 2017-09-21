# Overview

Many of the documentation pages contain snippets of code examples. We extract these snippets from
real working example applications, which are stored in subfolders of the `/aio/content/examples`
folder. Each example can be built and run independently. Each example also provides e2e specs, which
are run as part of our Travis build tasks, to verify that the examples continue to work as expected,
as changes are made to the core Angular libraries.

In order to build, run and test these examples independently we need to install dependencies into
their sub-folder. Also there are a number of common boilerplate files that are needed to configure
each example's project. We maintain these common boilerplate files centrally to reduce the amount
of effort if one of them needs to change.

## Boilerplate overview

As mentioned, many of the documentation pages contain snippets extracted from real example applications.
To achieve that, all those applications needs to contain a basic boilerplate. E.g. a `node_modules`
folder, `package.json` with scripts, `system.js` configuration, etc.

No one wants to maintain the boilerplate on each example, so the goal of this tool is to provide a
generic boilerplate that works in all the examples.

### Boilerplate files

Inside `/aio/tools/examples/shared/boilerplate` you will see all the common boilerplate you can find
in any Angular application using System.js. This is the boilerplate that will be carried to each example.

Among these files, there are a few special ones:

* **src/systemjs.config.js** - This is the configuration of System.js used to run the example locally.
* **src/systemjs.config.web.js** - This configuration replaces the previous one on Plunkers.
* **src/systemjs.config.web.build.js** - Same as the previous one but for using angular's `-builds`
  versions.
* **src/systemjs-angular-loader.js** - It is a System.js plugin that removes the need of `moduleId`.
* **package.json** - This package.json only contains scripts, no dependencies. It contains the
  different tasks needed to run any example. Doesn't matter if CLI, System.js or Webpack.
* **plnkr.json** - This file is used by the Plunker tool to generate a plunker for an example. This
  concrete file is just a placeholder. Authors needs to tweak it for each guide. More at the
  [plunker docs](../plunker-builder/README.md).
* **example-config.json** - This file serves as a flag to indicate that the current folder is an
  example. This concrete file is just a placeholder. More on this later in this readme.

### The example-config.json

So what is this **example-config.json** again? If an author wants to create a new example, say
`/aio/content/examples/awesome-example`. The author needs to create an empty `example-config.json`
in that folder. That serves as a flag so this tool will say "Hey, that is an example, let's copy
all the boilerplate there".

So when the tool runs, it finds **all** the folders with an `example-config.json` file, and puts
a copy of the boilerplate in those folders.

Normally the file is empty, but we can add information in it, for example:

```json
{
  "build": "build:cli",
  "run": "serve:cli"
}
```

In this case, this would indicate that this is a CLI example. Won't make any difference on the
boilerplate, but will be useful for e2e tests (more on this later). Also works as a hint for
the example to know how is executed.


### A node_modules to share

With all the boilerplate files in place, the only missing piece are the installed packages. For
that we have a `/aio/tools/examples/shared/package.json` which contains **all** the packages
needed to run all the examples.

After installing these dependencies, a `node_modules` will be created at
`/aio/tools/examples/shared/node_modules`. This folder will be **symlinked** into each example.
So it is not a copy like the other boilerplate files. This solution works in all OSes. Windows
may require admin rights.

### End to end tests

Each example contains an `e2e-spec.ts` file. We can find all the related configuration files for
e2e in the `/aio/tools/examples/shared` folder.

This tool expects all the examples to be build with `npm run build`. If an example is not built
with that script, the author would need to specify the new build command in the `example-config.json`
as shown earlier.

### add-example-boilerplate.js

This script installs all the dependencies that are shared among all the examples, creates the
`node_modules` symlinks and copy all the boilerplate files where needed. It won't do anything
about plunkers nor e2e tests.

It also contains a function to remove all the boilerplate. It uses a `git clean -xdf` to do
the job. It will remove all files that don't exist in the git repository, **including any
new file that you are working on that hasn't been stage yet.** So be sure to save your work
before removing the boilerplate.

### run-example-e2e.js

This script will find all the `e2e-spec.ts` files and run them.

To not run all tests, you can use the `--filter=name` flag to run the example's e2e that contains
that name.

It also has an optional `--setup` flag to run the `add-example-boilerplate.js` script and install
the latest `webdriver`.

It will create a `/aio/protractor-results-txt` file when it finishes running tests.
