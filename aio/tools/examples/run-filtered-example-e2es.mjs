import {spawnSync} from 'child_process';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

/**
 * Run Protractor End-to-End Tests for Doc Examples
 *
 * Flags
 *  --filter to filter/select example app subdir names
 *    Can be used multiple times to include multiple patterns.
 *    e.g. --filter=foo  // all example apps with 'foo' in their folder names.
 *
 *  --exclude to exclude example app subdir names
 *    Can be used multiple times to exclude multiple patterns.
 *    NOTE: `--exclude` is always considered after `--filter`.
 *    e.g. --exclude=bar  // Exclude all example apps with 'bar' in their folder names.
 * 
 *  --local to use the locally built Angular packages, rather than versions from npm
 */
async function main(args) {
  const bazel = fileURLToPath(await import.meta.resolve("@bazel/bazelisk"));
  const labels = queryAllE2eLabels(bazel);
    
  const includeFilters = getFiltersFromArg(args.filter);
  const excludeFilters = getFiltersFromArg(args.exclude);
    
  const includedTestLabels = filterTestLabels(labels, includeFilters, excludeFilters);
    
  runE2eTests(bazel, includedTestLabels, !!args.local);
}

function queryAllE2eLabels(bazel) {
  const stdout = spawnSync(bazel, [
    'query',
    'kind(\'nodejs_test\',//aio/content/examples/...)',
    '--output=label',
  ], {stdio: 'pipe', encoding: 'utf-8'}).stdout;
    
  const labels = stdout.split('\n').filter(line => line.startsWith('//') && line.endsWith(':e2e'));
  return labels;
}

function runE2eTests(bazel, labels, local) {
  const args = ['test', '--', ...labels];
  if (local) {
    args.splice(1, 0, '--config=aio_local_deps');
  }
  spawnSync(bazel, args, {stdio: 'inherit'});
}

function getFiltersFromArg(arg) {
  if (!arg) {
    return [];
  }
  return Array.isArray(arg) ? arg : [arg];
}

function filterTestLabels(testLabels, includeFilters, excludeFilters) {
  let includedTestLabels = testLabels;
  if (includeFilters.length) {
    includedTestLabels = includedTestLabels.filter(label =>
      includeFilters.some(str => label.includes(str))
    );
  }
  includedTestLabels = includedTestLabels.filter(label => !excludeFilters.some(str => label.includes(str)));
  return includedTestLabels;
}

(async() => await main(yargs(hideBin(process.argv)).argv))();