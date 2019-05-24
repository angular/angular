const {resolve} = require('canonical-path');
const sh = require('shelljs');
const {CONTENTS_PATH} = require('../config');

const cliGitRef = process.argv[2] || 'master';  // Can be a branch, commit or tag.
const pkgContent = JSON.stringify({
  dependencies: {
    '@angular/cli': `https://github.com/angular/cli-builds#${cliGitRef}`,
  },
}, null, 2);

sh.set('-e');
sh.cd(resolve(CONTENTS_PATH, 'cli-src'));
sh.exec('git clean -Xfd');
sh.echo(pkgContent).to('package.json');
sh.exec('yarn install --no-lockfile --non-interactive');
