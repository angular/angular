import {execSync} from 'child_process';
import {readdirSync, statSync} from 'fs';
import {task} from 'gulp';
import gulpRunSequence = require('run-sequence');
import path = require('path');

import {execTask} from '../task_helpers';
import {DIST_COMPONENTS_ROOT} from '../constants';


task('build:release', function(done: () => void) {
  // Synchronously run those tasks.
  gulpRunSequence(
    'clean',
    ':build:components:ngc',
    [':clean:spec', ':clean:assets'],
    done
  );
});


/** Make sure we're logged in. */
task(':publish:whoami', execTask('npm', ['whoami'], {
  silent: true,
  errMessage: 'You must be logged in to publish.'
}));

task(':publish:logout', execTask('npm', ['logout']));

task(':publish', function() {
  const label = process.argv.slice(2)[1];  // [0] would be ':publish'
  const labelArg = label ? `--tag ${label}` : '';
  const currentDir = process.cwd();

  readdirSync(DIST_COMPONENTS_ROOT)
    .forEach(dirName => {
      const componentPath = path.join(DIST_COMPONENTS_ROOT, dirName);
      const stat = statSync(componentPath);

      if (!stat.isDirectory()) {
        return;
      }

      process.chdir(componentPath);
      execSync(`npm publish --access public ${labelArg}`);
    });
  process.chdir(currentDir);
});

task('publish', function(done: () => void) {
  gulpRunSequence(
    ':publish:whoami',
    'build:release',
    ':publish',
    ':publish:logout',
    done
  );
});
