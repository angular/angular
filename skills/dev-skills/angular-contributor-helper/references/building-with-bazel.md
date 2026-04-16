# Building Angular with Bazel

[Full source](https://github.com/angular/angular/blob/main/contributing-docs/building-with-bazel.md)

This is for developing Angular itself, not for building Angular applications with Bazel.

## Installation

Angular installs Bazel from npm via [`@bazel/bazelisk`](https://github.com/bazelbuild/bazelisk). Run Bazel with:

```shell
pnpm bazel
```

## Configuration

- `WORKSPACE` file marks the root as a Bazel project.
- `.bazelrc` contains checked-in options.
- To hide `bazel-*` symlinks, add `build --symlink_prefix=/` to `.bazelrc`.

## Building

```shell
pnpm bazel build packages/core          # build a package
pnpm bazel build packages/...           # build all packages
```

Use [ibazel](https://github.com/bazelbuild/bazel-watcher) for watch mode.

## Testing

```shell
pnpm test packages/core/test:test       # test package in node
pnpm test packages/core/test:test_web   # test package in karma
pnpm test packages/...                  # test all packages
pnpm test //packages/core/...           # all tests for one package
```

### Test Flags

- `--config=debug`: build and launch in debug mode
- `--test_arg=--node_options=--inspect=9228`: change inspector port
- `--test_tag_filters=<tag>`: filter tests by tag

## Debugging Node Tests in Chrome DevTools

1. Open [chrome://inspect](chrome://inspect)
2. Click "Open dedicated DevTools for Node"
3. Run: `pnpm bazel test packages/core/test:test --config=debug`
4. Click "Resume script execution" to hit `debugger` statements or breakpoints

To inspect generated templates, find the component in the call stack and click the source map link.

## Debugging Node Tests in VSCode

Add to `launch.json`:

```json
{
  "name": "Attach to Process",
  "type": "node",
  "request": "attach",
  "port": 9229,
  "restart": true,
  "timeout": 600000,
  "sourceMaps": true,
  "skipFiles": ["<node_internals>/**"],
  "sourceMapPathOverrides": {
    "?:*/bin/*": "${workspaceFolder}/*"
  },
  "resolveSourceMapLocations": ["!**/node_modules/**"]
}
```

Then run `pnpm bazel test <target> --config=debug` and attach the debugger.

## Debugging Karma Tests

1. Run with `_debug` suffix: `pnpm bazel run packages/core/test:test_web_debug`
2. Open [http://localhost:9876/debug.html](http://localhost:9876/debug.html)
3. Use browser DevTools to debug (use `fit`/`fdescribe` to focus tests)

## Debugging Bazel Rules

Open external directory:

```shell
open $(pnpm -s bazel info output_base)/external
```

See subcommands:

```shell
pnpm bazel build //packages/core:package -s
```

## Diagnosing Slow Builds

Generate a profile:

```shell
pnpm bazel build //packages/compiler --profile build.profile
```

Analyze in console:

```shell
pnpm bazel analyze-profile build.profile
pnpm bazel analyze-profile build.profile --task_tree ".*" --task_tree_threshold 5000
```

Or generate an HTML report:

```shell
pnpm bazel analyze-profile build.profile --html --html_details --html_histograms
```

## Stamping

Bazel supports including version control information in built artifacts. Angular configures this via:

1. `tools/bazel_stamp_vars.js` runs `git` commands to generate versioning info.
2. `.bazelrc` registers this script as the `workspace_status_command`.

## Remote Cache

Bazel assigns a content-based hash to all action inputs as the cache key. Because builds are hermetic, it can skip executing an action if the hash is already cached. Currently only used on CI. Angular core developers can enable remote caching for local builds.

## Known Issues

### Windows

- `bazel run` only works with non-test targets. Use `bazel test` instead.
- Ensure `C:\msys64\usr\bin` is in the **system** PATH (not user PATH).

### Xcode (macOS)

If you get `Xcode version must be specified` errors:

```shell
bazel clean --expunge
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license
pnpm bazel build //packages/core
```

In VSCode, add `"files.exclude": {"bazel-*": true}` to settings to avoid conflicts.
