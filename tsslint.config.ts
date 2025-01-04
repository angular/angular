import {createIgnorePlugin, defineConfig, Rule} from '@tsslint/config';
import {convertRule} from '@tsslint/tslint';
import {createRequire} from 'module';
import * as path from 'path';
import {fileURLToPath} from 'url';

const rulesDirectory = [
  'tools/tslint',
  'node_modules/@angular/build-tooling/lint-rules/tslint',
  'node_modules/vrsource-tslint-rules/rules',
  'node_modules/tslint-eslint-rules/dist/rules',
  'node_modules/tslint-no-toplevel-property-access/rules',
  'node_modules/tslint/lib/rules',
];
const exclude = [
  // "**/node_modules/**/*",
  './integration/**/*',
  // Ignore output directories
  './built/**/*',
  './dist/**/*',
  './bazel-out/**/*',
  // Ignore special files
  '**/*.externs.js',
  // Ignore test files
  './packages/compiler-cli/test/compliance/test_cases/**/*',
  './packages/localize/**/test_files/**/*',
  './tools/public_api_guard/**/*.d.ts',
  './modules/benchmarks_external/**/*',
  // Ignore zone.js directory
  // TODO(JiaLiPassion): add zone.js back later
  './packages/zone.js/**/*',

  './devtools/bazel-out/**/*',
  './devtools/projects/ng-devtools/src/lib/vendor/**/*',

  // Ignore vendored code
  './third_party/**/*',
];

export default defineConfig([
  {
    plugins: [
      createIgnorePlugin('tslint:disable-next-line:?', false),
      createIgnorePlugin(['tslint:disable:?', 'tslint:enable:?'], false),
    ],
  },
  {
    include: ['**/*.ts'],
    exclude,
    rules: await importRules(
      {
        // Custom rules written in TypeScript.
        'require-internal-with-underscore': (
          await import('./tools/tslint/requireInternalWithUnderscoreRule.ts')
        ).Rule,
      },
      {
        'no-implicit-override-abstract': true,
        'validate-import-for-esm-cjs-interop': [
          true,
          {
            // The following CommonJS modules have type definitions that suggest the existence of
            // named exports. This is not true at runtime when imported from an ES module (because
            // the ESM interop only exposes statically-discoverable named exports). Instead
            // default imports should be used to ensure compatibility with both ESM or CommonJS.
            'noNamedExports': [
              'typescript/lib/tsserverlibrary',
              'typescript',
              'minimist',
              'magic-string',
              'semver',
              'yargs',
              'glob',
              'convert-source-map',
            ],
            // The following CommonJS modules appear to have a default export available (due to the `esModuleInterop` flag),
            // but at runtime with CJS (e.g. for devmode output/tests) there is no default export as these modules set
            // `__esModule`. This does not match with what happens in ESM NodeJS runtime where NodeJS exposes
            // `module.exports` as `export default`. Instead, named exports should be used for compat with CJS/ESM.
            'noDefaultExport': [],
            // List of modules which are incompatible and should never be imported at all.
            'incompatibleModules': {},
          },
        ],
        'eofline': true,
        'file-header': [
          true,
          {
            'match': 'Copyright Google LLC',
            'allow-single-line-comments': false,
            'default':
              '@license\nCopyright Google LLC All Rights Reserved.\n\nUse of this source code is governed by an MIT-style license that can be\nfound in the LICENSE file at https://angular.dev/license',
          },
        ],
        'no-console': [true, 'log'],
        'no-construct': true,
        'no-duplicate-imports': true,
        'no-duplicate-variable': true,
        'no-var-keyword': true,
        'prefer-literal': [true, 'object'],
        'no-toplevel-property-access': [
          true,
          'packages/animations/src/',
          'packages/animations/browser/',
          'packages/common/src/',
          'packages/core/src/',
          'packages/elements/src/',
          'packages/forms/src/',
          'packages/platform-browser/src/',
          'packages/router/src/',
        ],
        'semicolon': [true, 'always', 'ignore-bound-class-methods'],
        'variable-name': [true, 'ban-keywords'],
        'no-inner-declarations': [true, 'function'],
        'no-debugger': true,
        'ban': [
          true,
          {'name': 'fdescribe', 'message': "Don't keep jasmine focus methods."},
          {'name': 'fit', 'message': "Don't keep jasmine focus methods."},
          {
            'name': ['*', 'getMutableClone'],
            'message': 'Use a ts.factory.update* or ts.factory.create* method instead.',
          },
          {
            'name': ['performance', 'mark'],
            'message':
              "`performance` methods aren't not fully supported in all environments like JSDOM and Cloudflare workers. Use 'performanceMark' from '@angular/core' instead.",
          },
        ],
      },
    ),
  },
  {
    include: ['**/*.js'],
    exclude,
    rules: await importRules(
      {
        // Custom rules written in TypeScript.
        'require-internal-with-underscore': (
          await import('./tools/tslint/requireInternalWithUnderscoreRule.ts')
        ).Rule,
      },
      {
        'eofline': true,
        'file-header': [
          true,
          {
            'match': 'Copyright Google LLC',
            'allow-single-line-comments': false,
            'default':
              '@license\nCopyright Google LLC All Rights Reserved.\n\nUse of this source code is governed by an MIT-style license that can be\nfound in the LICENSE file at https://angular.dev/license',
          },
        ],
        'no-console': [true, 'log'],
        'no-duplicate-imports': true,
        'no-duplicate-variable': true,
        'semicolon': [true],
        'variable-name': [true, 'ban-keywords'],
        'no-inner-declarations': [true, 'function'],
        'ban': [
          true,
          {'name': 'fdescribe', 'message': "Don't keep jasmine focus methods."},
          {'name': 'fit', 'message': "Don't keep jasmine focus methods."},
        ],
      },
    ),
  },
]);

async function importRules(
  customRules: Record<string, any>,
  rules: Record<string, boolean | [boolean, ...any[]]>,
) {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  const resolvedRulesDirectory = rulesDirectory.map((dir) => path.resolve(projectRoot, dir));
  const require = createRequire(projectRoot);
  const result: Record<string, Rule> = {};

  for (const ruleName in customRules) {
    const rule = customRules[ruleName];
    result[ruleName] = convertRule(rule, [], 1);
  }

  for (const ruleName in rules) {
    const [enabled, ...options] =
      typeof rules[ruleName] === 'boolean' ? [rules[ruleName]] : rules[ruleName];
    if (!enabled) {
      continue;
    }
    const ruleFileName = ruleName.replace(/-[a-z]/g, (s) => s.slice(1).toUpperCase()) + 'Rule';
    const resolvedPath = require.resolve(`./${ruleFileName}`, {paths: resolvedRulesDirectory});
    const rule = require(resolvedPath).Rule;
    result[ruleName] = convertRule(rule, options, 1);
  }

  return result;
}
