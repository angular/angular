# Overview

Many of the documentation pages contain snippets of code examples. Extract these snippets from
real working example applications, which are stored in subfolders of the `/aio/content/examples`
folder. Each example can be built and run independently. Each example also provides e2e specs, which
are run as part of our Travis build tasks, to verify that the examples continue to work as expected,
as changes are made to the core Angular libraries.

In order to build, run and test these examples independently you need to install dependencies into
their sub-folder. Also there are a number of common boilerplate files that are needed to configure
each example's project. Maintain these common boilerplate files centrally to reduce the amount
of effort if one of them needs to change.

## Boilerplate overview

As mentioned, many of the documentation pages contain snippets extracted from real example applications.
To achieve that, all those applications needs to contain a basic boilerplate. E.g. a `node_modules`
folder, `package.json` with scripts, etc.

No one wants to maintain the boilerplate on each example, so the goal of this tool is to provide a
set of boilerplates that works in all the examples.

### Boilerplate files

Inside `/aio/tools/examples/shared/boilerplate` you will find a set of folders representing each
boilerplate.

Currently you will find the next boilerplates:


* CLI - For CLI based examples. This is the default one, to be used in the majority of the examples.
* systemjs - Currently in deprecation, only used in a a few examples.
* i18n - Based on the CLI one, features a few scripts for i18n.
* universal - Based on the cli with a extra server for universal.

There is also a `common` folder that contains files used in all different examples.

### The example-config.json

Each example is identified by an **example-config.json** configuration file in its root folder.
This configuration file indicates what type of boilerplate this example needs. E.g.

```json
{ projectType: 'universal' }
```

If the file is empty then the default type of cli is assumed.
When the boilerplate tooling runs, it will copy into the example folder all of the appropriate boilerplate files.

### A node_modules to share

With all the boilerplate files in place, the only missing piece are the installed packages. For
that you have a `/aio/tools/examples/shared/package.json` which contains **all** the packages
needed to run all the examples through all different boilerplates.

After installing these dependencies, a `node_modules` will be created at
`/aio/tools/examples/shared/node_modules`. This folder will be **symlinked** into each example.
So it is not a copy like the other boilerplate files. This solution works in all OSes. Windows
may require admin rights.

### End to end tests

End to end changes between boilerplates.

For CLI applications, create a `app.e2e-spec.ts` inside the `e2e` folder. The tooling will run
`ng e2e` for each CLI based examples.

For SystemJS, each example contains an `e2e-spec.ts` file. You can find all the related configuration files
in the `/aio/tools/examples/shared` folder.

### example-boilerplate.js

This script installs all the dependencies that are shared among all the examples, creates the
`node_modules` symlinks and copy all the boilerplate files where needed. It won't do anything
about stackblitz nor e2e tests.

It also contains a function to remove all the boilerplate. It uses a `git clean -xdf` to do
the job. It will remove all files that don't exist in the git repository, **including any
new file that you are working on that hasn't been stage yet.** So be sure to save your work
before removing the boilerplate.

### run-example-e2e.js

This script will find all the `e2e-spec.ts` files and run them.

To not run all tests, you can use the `--filter=name` flag to run the example's e2e that contains
that name.

It also has an optional `--setup` flag to run the `example-boilerplate.js` script and install
the latest `webdriver`.

It will create a `/aio/protractor-results-txt` file when it finishes running tests.
