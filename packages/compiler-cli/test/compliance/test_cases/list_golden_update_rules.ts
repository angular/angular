import {exec} from 'shelljs';

const {BUILD_WORKSPACE_DIRECTORY} = process.env;

const rulesResult = exec(
    'yarn --silent bazel query \'filter("\\.update$", kind(rule, //packages/compiler-cli/test/compliance/test_cases:*))\' --output label',
    {cwd: BUILD_WORKSPACE_DIRECTORY, env: process.env, silent: true});

if (rulesResult.code !== 0) {
  throw new Error('Failed to query Bazel for the update rules:\n' + rulesResult.stderr);
}

for (const rule of rulesResult.split('\n')) {
  if (rule.trim() !== '') {
    console.log('yarn bazel run ' + rule);
  }
}
