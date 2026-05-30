import { spawnSync } from "child_process";

const {BUILD_WORKSPACE_DIRECTORY} = process.env;

const rulesResult = spawnSync(
    'pnpm',
    ['--silent', 'bazel', 'query', 'filter("\\.update$", kind(rule, //packages/compiler-cli/test/compliance/test_cases:*))', '--output=label'],
    {cwd: BUILD_WORKSPACE_DIRECTORY, env: process.env, encoding: 'utf-8'});

if (rulesResult.status !== 0) {
  throw new Error('Failed to query Bazel for the update rules:\n' + rulesResult.stderr);
}

for (const rule of rulesResult.stdout.split('\n')) {
  if (rule.trim() !== '') {
    console.log('pnpm bazel run ' + rule);
  }
}
