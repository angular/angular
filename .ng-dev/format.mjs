/**
 * Configuration for the `ng-dev format` command.
 *
 * @type { import("@angular/ng-dev").FormatConfig }
 */
export const format = {
  'prettier': {
    'matchers': [
      '**/*.{js,cjs,mjs}',
      '**/*.{ts,cts,mts}',
      '**/*.{json,json5}',
      '**/*.{yml,yaml}',
      '**/*.md',
    ],
  },
  'buildifier': true,
};
