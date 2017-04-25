import {spawn} from 'child_process';
import {existsSync, statSync} from 'fs-extra';
import {join} from 'path';
import {task} from 'gulp';
import {execTask, sequenceTask} from '../util/task_helpers';
import {DIST_RELEASES} from '../constants';
import * as minimist from 'minimist';

/** Parse command-line arguments for release task. */
const argv = minimist(process.argv.slice(3));

// Path to the release output of material.
const releasePath = join(DIST_RELEASES, 'material');

/** Task that builds all releases that will be published. */
task(':publish:build-releases', ['material:build-release:clean']);

/** Make sure we're logged in. */
task(':publish:whoami', execTask('npm', ['whoami'], {
  silent: true,
  errMessage: 'You must be logged in to publish.'
}));

task(':publish:logout', execTask('npm', ['logout']));


function _execNpmPublish(label: string): Promise<{}> {
  const packageDir = releasePath;
  if (!statSync(packageDir).isDirectory()) {
    return;
  }

  if (!existsSync(join(packageDir, 'package.json'))) {
    throw new Error(`"${packageDir}" does not have a package.json.`);
  }

  if (!existsSync(join(packageDir, 'LICENSE'))) {
    throw new Error(`"${packageDir}" does not have a LICENSE file`);
  }

  process.chdir(packageDir);
  console.log(`Publishing material...`);

  const command = 'npm';
  const args = ['publish', '--access', 'public', label ? `--tag` : undefined, label || undefined];
  return new Promise((resolve, reject) => {
    console.log(`  Executing "${command} ${args.join(' ')}"...`);
    if (argv['dry']) {
      resolve();
      return;
    }

    const childProcess = spawn(command, args);
    childProcess.stdout.on('data', (data: Buffer) => {
      console.log(`  stdout: ${data.toString().split(/[\n\r]/g).join('\n          ')}`);
    });
    childProcess.stderr.on('data', (data: Buffer) => {
      console.error(`  stderr: ${data.toString().split(/[\n\r]/g).join('\n          ')}`);
    });

    childProcess.on('close', (code: number) => {
      if (code == 0) {
        resolve();
      } else {
        reject(new Error(`Material did not publish, status: ${code}.`));
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

  // Publish only the material package.
  return _execNpmPublish(label)
    .then(() => done())
    .catch((err: Error) => done(err))
    .then(() => process.chdir(currentDir));
});

task('publish', sequenceTask(
  ':publish:whoami',
  ':publish:build-releases',
  ':publish',
  ':publish:logout',
));
