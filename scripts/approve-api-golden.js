const shelljs = require('shelljs');
const chalk = require('chalk');
const path = require('path');
const packageName = process.argv[2];

if (!packageName) {
  console.error(chalk.red('No package name has been passed in for API golden approval.'));
  process.exit(1);
}

// ShellJS should exit if any command fails.
shelljs.set('-e');
shelljs.cd(path.join(__dirname, '../'));
shelljs.exec(`yarn bazel run //tools/public_api_guard:${packageName}.d.ts_api.accept`);
