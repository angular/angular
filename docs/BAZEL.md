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
`bazel run @nodejs//:yarn`.

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

### Various Flags Used For Tests

If you're experiencing problems with seemingly unrelated tests failing, it may be because you're not using the proper flags with your Bazel test runs in Angular.

See also: [`//tools/bazel.rc`](https://github.com/angular/angular/blob/master/tools/bazel.rc) where `--define=ivy=false` is defined as default.

- `--config=debug`: build and launch in debug mode (see [debugging](#debugging) instructions below)
- `--define=compile=<option>` Controls if ivy or legacy mode is enabled. This is done by generating the [`src/ivy_switch.ts`](https://github.com/angular/angular/blob/master/packages/core/src/ivy_switch.ts) file from [`ivy_switch_legacy.ts`](https://github.com/angular/angular/blob/master/packages/core/src/ivy_switch_legacy.ts) (default), [`ivy_switch_jit.ts`](https://github.com/angular/angular/blob/master/packages/core/src/ivy_switch_jit.ts), or [`ivy_switch_local.ts`](https://github.com/angular/angular/blob/master/packages/core/src/ivy_switch_local.ts).
    - `legacy`: (default behavior) compile against View Engine, e.g. `--define=compile=legacy`
    - `jit`: Compile in ivy JIT mode, e.g. `--define=compile=jit`
    - `local`: Compile in ivy AOT move, e.g. `--define=compile=local`
- `--test_tag_filters=<tag>`: filter tests down to tags defined in the `tag` config
of your rules in any given `BUILD.bazel`.
    - `ivy-jit`: This flag should be set for tests that should be excuted with ivy JIT, e.g. `--test_tag_filters=ivy-jit`. For this, you may have to include `--define=compile=jit`.
    - `ivy-local`: Only run tests that have to do with ivy AOT. For this, you may have to include `--define=compile=local`, e.g. `--test_tag_filters=ivy-local`..
    - `ivy-only`: Only run ivy related tests, e.g. `--test_tag_filters=ivy-only`.


### Debugging a Node Test
<a id="debugging"></a>

- Open chrome at: [chrome://inspect](chrome://inspect)
- Click on  `Open dedicated DevTools for Node` to launch a debugger.
- Run test: `bazel test packages/core/test:test --config=debug`

The process should automatically connect to the debugger.

### Debugging a Node Test in VSCode

First time setup:
- Go to Debug > Add configuration (in the menu bar) to open `launch.json`
- Add the following to the `configurations` array:

```json
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

**Setting breakpoints directly in your code files may not work in VSCode**. This is because the files you're actually debugging are built files that exist in a `./private/...` folder.
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

Note that Bazel has a `--stamp` argument to `bazel build`, but this has no effect since our stamping takes place in Skylark rules. See https://github.com/bazelbuild/bazel/issues/1054

## Remote cache

Bazel supports fetching action results from a cache, allowing a clean build to pick up artifacts from prior builds.
This makes builds incremental, even on CI.
It works because Bazel assigns a content-based hash to all action inputs, which is used as the cache key for the action outputs.
Thanks to the hermeticity property, we can skip executing an action if the inputs hash is already present in the cache.

Of course, non-hermeticity in an action can cause problems.
At worst, you can fetch a broken artifact from the cache, making your build non-reproducible.
For this reason, we are careful to implement our Bazel rules to depend only on their inputs.

Currently we only use remote caching on CircleCI.
We could enable it for developer builds as well, which would make initial builds much faster for developers by fetching already-built artifacts from the cache.

This feature is experimental, and developed by the CircleCI team with guidance from Angular.
Contact Alex Eagle with questions.

*How it's configured*:

1. In `.circleci/config.yml`, each CircleCI job downloads a proxy binary, which is built from https://github.com/notnoopci/bazel-remote-proxy. The download is done by running `.circleci/setup_cache.sh`. When the feature graduates from experimental, this proxy will be installed by default on every CircleCI worker, and this step will not be needed.
1. Next, each job runs the `setup-bazel-remote-cache` anchor. This starts up the proxy running in the background. In the CircleCI UI, you'll see this step continues running while later steps run, and you can see logging from the proxy process.
1. Bazel must be configured to connect to the proxy on a local port. This configuration lives in `.circleci/bazel.rc` and is enabled because we overwrite the system Bazel settings in /etc/bazel.bazelrc with this file.
1. Each `bazel` command in `.circleci/config.yml` picks up and uses the caching flags.

## Known issues

### Webstorm

The autocompletion in WebStorm can be added via a Bazel plugin intended for IntelliJ IDEA, but the plugin needs to be installed in a special way.
See [bazelbuild/intellij#246](https://github.com/bazelbuild/intellij/issues/246) for more info.

### Xcode

If you see the following error:

```
$ bazel build packages/...
ERROR: /private/var/tmp/[...]/external/local_config_cc/BUILD:50:5: in apple_cc_toolchain rule @local_config_cc//:cc-compiler-darwin_x86_64: Xcode version must be specified to use an Apple CROSSTOOL
ERROR: Analysis of target '//packages/core/test/render3:render3' failed; build aborted: Analysis of target '@local_config_cc//:cc-compiler-darwin_x86_64' failed; build aborted
```

It might be linked to an interaction with VSCode.
If closing VSCode fixes the issue, you can add the following line to your VSCode configuration:

```
"files.exclude": {"bazel-*": true}
```

source: https://github.com/bazelbuild/bazel/issues/4603

If VSCode is not the root cause, you might try:

- Quit VSCode (make sure no VSCode is running).

```
bazel clean --expunge
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license
bazel build //packages/core    # Run a build outside VSCode to pre-build the xcode; then safe to run VSCode
```

Source: https://stackoverflow.com/questions/45276830/xcode-version-must-be-specified-to-use-an-apple-crosstool
