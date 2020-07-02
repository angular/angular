import {FormatConfig} from '../dev-infra/format/config';

/**
 * Configuration for the `ng-dev format` command.
 */
export const format: FormatConfig = {
  'clang-format': {
    'matchers': [
      '**/*.{js,ts}',
      // TODO: burn down format failures and remove aio and integration exceptions.
      '!aio/**',
      '!integration/**',
      // Both third_party and .yarn are directories containing copied code which should
      // not be modified.
      '!third_party/**',
      '!.yarn/**',
      // Do not format d.ts files as they are generated
      '!**/*.d.ts',
    ]
  },
  'buildifier': true
};
