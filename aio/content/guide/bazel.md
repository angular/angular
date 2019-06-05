# Building with Bazel

This guide explains how to build and test Angular apps with Bazel.


<div class="alert is-helpful">

This guide assumes you are already familiar with developing and building Angular applications using the [CLI](cli).

It describes features which are part of Angular Labs, and are not considered a stable, supported API.

</div>

## Using Bazel with the Angular CLI

The `@angular/bazel` package provides a builder that allows Angular CLI to use Bazel as the build tool.

To opt-in an existing application, run

```sh
ng add @angular/bazel
```

To use Bazel in a new application, first install `@angular/bazel` globally

```sh
npm install -g @angular/bazel
```

then create the new application with

```sh
ng new --collection=@angular/bazel
```

Now when you use Angular CLI build commands such as `ng build` and `ng serve`,
Bazel is used behind the scenes.
Outputs from Bazel appear in the `dist/bin` folder.

> The command-line output includes extra logging from Bazel.
> We plan to reduce this in the future.

### Removing Bazel

If you need to opt-out from using Bazel, you can restore the backup files:

- `/angular.json.bak` replaces `/angular.json`

## Advanced configuration

<div class="alert is-helpful">

Editing the Bazel configuration may prevent you opting out of Bazel.
Custom behaviors driven by Bazel won't be available in other Builders.

This section assumes you are familiar with [Bazel](https://docs.bazel.build).

</div>

You can manually adjust the Bazel configuration to:

* customize the build steps
* parallellize the build for scale and incrementality

Create the initial Bazel configuration files by running the following command:

```sh
ng build --leaveBazelFilesOnDisk
```

Now you'll find new files in the Angular workspace:

* `/WORKSPACE` tells Bazel how to download external dependencies.
* `/BUILD.bazel` and `/src/BUILD.bazel` tell Bazel about your source code.

You can find a full-featured example with custom Bazel configurations at http://github.com/angular/angular-bazel-example.

Documentation for using Bazel for frontend projects is linked from https://docs.bazel.build/versions/master/bazel-and-javascript.html.



## Running Bazel directly

In some cases you'll want to bypass the Angular CLI builder, and run the Bazel CLI directly.
The Bazel CLI is in the `@bazel/bazel` npm package.
You can install it globally to get the `bazel` command in your path, or use `$(npm bin)/bazel` in place of bazel below.

The common commands in Bazel are:

* `bazel build [targets]`: Compile the default output artifacts of the given targets.
* `bazel test [targets]`: For whichever `*_test` targets are found in the patterns, run the tests.
* `bazel run [target]`: Compile the program represented by target, and then run it.

To repeat the command any time the inputs change (watch mode), replace `bazel` with `ibazel` in these commands.

The output locations are printed in the output.

Full documentation for the Bazel CLI is at https://docs.bazel.build/versions/master/command-line-reference.html.


## Querying the build graph

Because Bazel constructs a graph out of your targets, you can find lots of useful information.

Using the graphviz optional dependency, you'll have a program `dot`, which you can use with `bazel query`:

```bash
$ bazel query --output=graph ... | dot -Tpng > graph.png
```

See https://docs.bazel.build/versions/master/query-how-to.html for more details on `bazel query`.


## Customizing `BUILD.bazel` files

"Rules" are like plugins for Bazel. Many rule sets are available. This guide documents the ones maintained by the Angular team at Google.

Rules are used in `BUILD.bazel` files, which are markers for the packages in your workspace. Each `BUILD.bazel` file declares a separate package to Bazel, though you can have more coarse-grained distributions so that the packages you publish (for example, to `npm`) can be made up of many Bazel packages.

In the `BUILD.bazel` file, each rule must first be imported, using the `load` statement. Then the rule is called with some attributes, and the result of calling the rule is that you've declared to Bazel how it can derive some outputs given some inputs and dependencies. Then later, when you run a `bazel` command line, Bazel loads all the rules you've declared to determine an absolute ordering of what needs to be run. Note that only the rules needed to produce the requested output will actually be executed.

A list of common rules for frontend development is documented in the README at https://github.com/bazelbuild/rules_nodejs/.
