# Building Angular with Bazel

Note: this doc is for developing Angular, it is _not_ public
documentation for building an Angular application with Bazel.

The Bazel build tool (http://bazel.build) provides fast, reliable
incremental builds. We plan to migrate Angular's build scripts to
Bazel.

## Installation

Install Bazel from the distribution, see [install] instructions.
On Mac, just `brew install bazel`.

Bazel will install a hermetic version of Node, npm, and Yarn when
you run the first build.

[install]: https://bazel.build/versions/master/docs/install.html

### Installation of ibazel

Install interactive bazel runner / fs watcher via:

```
yarn global add @bazel/ibazel
```

## Configuration

The `WORKSPACE` file indicates that our root directory is a
Bazel project. It contains the version of the Bazel rules we
use to execute build steps, from `build_bazel_rules_typescript`.
The sources on [GitHub] are published from Google's internal
repository (google3).

That repository defines dependencies on specific versions of
all the tools. You can run the tools Bazel installed, for
example rather than `yarn install` (which depends on whatever
version you have installed on your machine), you can
`bazel run @yarn//:yarn`.

Bazel accepts a lot of options. We check in some options in the
`.bazelrc` file. See the [bazelrc doc]. For example, if you don't
want Bazel to create several symlinks in your project directory
(`bazel-*`) you can add the line `build --symlink_prefix=/` to your
`.bazelrc` file.

[GitHub]: https://github.com/bazelbuild/rules_typescript
[bazelrc doc]: https://bazel.build/versions/master/docs/bazel-user-manual.html#bazelrc

## Building Angular

- Build a package: `bazel build packages/core`
- Build all packages: `bazel build packages/...`

You can use [ibazel] to get a "watch mode" that continuously
keeps the outputs up-to-date as you save sources. Note this is
new as of May 2017 and not very stable yet.

[ibazel]: https://github.com/bazelbuild/bazel-watcher

## Testing Angular

- Test package in node: `bazel test packages/core/test:test`
- Test package in karma: `bazel test packages/core/test:test_web`
- Test all packages: `bazel test packages/...`

You can use [ibazel] to get a "watch mode" that continuously
keeps the outputs up-to-date as you save sources.

### Debugging a Node Test

- Open chrome at: [chrome://inspect](chrome://inspect)
- Click on  `Open dedicated DevTools for Node` to launch a debugger.
- Run test: `bazel test packages/core/test:test --config=debug`

The process should automatically connect to the debugger.

### Debugging a Node Test in VSCode

First time setup:
- Go to Debug > Add configuration (in the menu bar) to open `launch.json`
- Add the following to the `configurations` array:

```
        {
            "name": "Attach (inspect)",
            "type": "node",
            "request": "attach",
            "port": 9229,
            "address": "localhost",
            "restart": false,
            "sourceMaps": true,
            "localRoot": "${workspaceRoot}",
            "remoteRoot": null
        },
        {
            "name": "Attach (no-sm,inspect)",
            "type": "node",
            "request": "attach",
            "port": 9229,
            "address": "localhost",
            "restart": false,
            "sourceMaps": false,
            "localRoot": "${workspaceRoot}",
            "remoteRoot": null
        },
```

The easiest way to debug a test for now is to add a `debugger` statement in the code
and launch the bazel corresponding test (`bazel test <target> --config=debug`).

Bazel will wait on a connection. Go to the debug view (by clicking on the sidebar or
Apple+Shift+D on Mac) and click on the green play icon next to the configuration name
(ie `Attach (inspect)`).

### Debugging a Karma Test

- Run test: `bazel run packages/core/test:test_web`
- Open chrome at: [http://localhost:9876/debug.html](http://localhost:9876/debug.html)
- Open chrome inspector

### Debugging Bazel rules

Open `external` directory which contains everything that bazel downloaded while executing the workspace file:
```sh
open $(bazel info output_base)/external
```

See subcommands that bazel executes (helpful for debugging):
```sh
bazel build //packages/core:package -s
```

To debug nodejs_binary executable paths uncomment `find . -name rollup 1>&2` (~ line 96) in
```sh
open $(bazel info output_base)/external/build_bazel_rules_nodejs/internal/node_launcher.sh
```

## Stamping

Bazel supports the ability to include non-hermetic information from the version control system in built artifacts. This is called stamping.
You can see an overview at https://www.kchodorow.com/blog/2017/03/27/stamping-your-builds/
In our repo, here is how it's configured:

1) In `tools/bazel_stamp_vars.sh` we run the `git` commands to generate our versioning info.
1) In `tools/bazel.rc` we register this script as the value for the `workspace_status_command` flag. Bazel will run the script when it needs to stamp a binary.
1) In `tools/BUILD.bazel` we have a target `stamp_data` with the special `stamp=1` attribute, which requests that Bazel run the `workspace_status_command`. The result is written to a text file that can be used as an input to other rules.

## FAQs

Note: recent XCode update on Mac causes the following Bazel error
```
$ bazel build packages/...
ERROR: /private/var/tmp/_bazel_iminar/9b8801a4939e9750a817dc0cb35bbbca/external/local_config_cc/BUILD:50:5: in apple_cc_toolchain rule @local_config_cc//:cc-compiler-darwin_x86_64: Xcode version must be specified to use an Apple CROSSTOOL
ERROR: Analysis of target '//packages/core/test/render3:render3' failed; build aborted: Analysis of target '@local_config_cc//:cc-compiler-darwin_x86_64' failed; build aborted
```
To resolve the error do the following:
```
bazel clean --expunge
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license
bazel build packages/...
```
Source: https://stackoverflow.com/questions/45276830/xcode-version-must-be-specified-to-use-an-apple-crosstool
