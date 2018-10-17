/**
 * Declares the global `module` variable that can be used outside of NodeJS.
 *
 * The module variable will be provided by given module bundlers (like Webpack) and helps
 * Angular to determine assets relatively to the the original file location. All components
 * within the CDK and Material specify the `module.id`.
 *
 * **Note**: This file is used by Bazel to build all `ng_module` rules. See `tools/defaults.bzl`.
 */

declare var module: {id: string};
