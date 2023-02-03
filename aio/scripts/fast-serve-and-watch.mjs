/*
    This script serves the aio app, watches for changes,
    and runs a fast dgeni build on any changed files.
*/

import spawn from 'cross-spawn';
import watchr from '../tools/transforms/authors-package/watchr.js';
const architectCli = require.resolve('@angular-devkit/architect-cli/bin/architect');

const serve = spawn(
  process.execPath,
  [
    '--preserve-symlinks',
    architectCli,
    'site:serve',
    '--open',
    '--poll=1000',
    '--live-reload',
    '--watch',
  ],
  {stdio: 'inherit'}
);
serve.on('error', (error) => {
  console.error('architect serve script failed');
  console.error(error);
  process.exit(1);
});
serve.on('close', (code) => {
  console.error(`architect serve script exited with code ${code}`);
  process.exit(1);
});

watchr.watch(true);
