import {spawn} from 'child_process';
import {existsSync, readdirSync, statSync} from 'fs';
import {task} from 'gulp';
import gulpRunSequence = require('run-sequence');
import path = require('path');
import minimist = require('minimist');

import {execTask, cleanTask} from '../task_helpers';
import {DIST_COMPONENTS_ROOT} from '../constants';

const argv = minimist(process.argv.slice(3));


task(':build:release:clean-spec', cleanTask('dist/**/*.spec.*'));


task('build:release', function(done: () => void) {
  // Synchronously run those tasks.
  gulpRunSequence(
    'clean',
    ':build:components:ngc',
    ':build:release:clean-spec',
    done
  );
});


/** Make sure we're logged in. */
task(':publish:whoami', execTask('npm', ['whoami'], {
  silent: true,
  errMessage: 'You must be logged in to publish.'
}));

task(':publish:logout', execTask('npm', ['logout']));


function _execNpmPublish(componentName: string, label: string): Promise<void> {
  const componentPath = path.join(DIST_COMPONENTS_ROOT, componentName);
  const stat = statSync(componentPath);

  if (!stat.isDirectory()) {
    return;
  }

  if (!existsSync(path.join(componentPath, 'package.json'))) {
    console.log(`Skipping ${componentPath} as it does not have a package.json.`);
    return;
  }

  process.chdir(componentPath);
  console.log(`Publishing ${componentName}...`);

  const command = 'npm';
  const args = ['publish', '--access', 'public', label ? `--tag` : undefined, label || undefined];
  return new Promise((resolve, reject) => {
    console.log(`Executing "${command} ${args.join(' ')}"...`);

    const childProcess = spawn(command, args);
    childProcess.stdout.on('data', (data: Buffer) => {
      console.log(`stdout: ${data.toString().split(/[\n\r]/g).join('\n        ')}`);
    });
    childProcess.stderr.on('data', (data: Buffer) => {
      console.error(`stderr: ${data.toString().split(/[\n\r]/g).join('\n        ')}`);
    });

    childProcess.on('close', (code: number) => {
      if (code == 0) {
        resolve();
      } else {
        reject(new Error(`Component ${componentName} did not publish, status: ${code}.`));
      }
    });
  });
}

task(':publish', function(done: (err?: any) => void) {
  const label = argv['tag'];
  const currentDir = process.cwd();

  if (!label) {
    console.log('You can use a label with --tag=labelName.');
    console.log('Publishing using the latest tag.');
  } else {
    console.log(`Publishing using the ${label} tag.`);
  }
  console.log('\n\n');

  // Build a promise chain that publish each component.
  readdirSync(DIST_COMPONENTS_ROOT)
    .reduce((prev, dirName) => prev.then(() => _execNpmPublish(dirName, label)), Promise.resolve())
    .then(() => done())
    .catch((err: Error) => done(err))
    .then(() => process.chdir(currentDir));
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
