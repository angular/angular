import {FormatConfig} from '@angular/dev-infra-private/ng-dev';

/**
 * Configuration for the ng-dev format command. We currently only use the buildifier
 * formatter that is responsible for formatting Bazel build and `.bzl` files.
 */
export const format: FormatConfig = {
  buildifier: true,
  prettier: true,
};
