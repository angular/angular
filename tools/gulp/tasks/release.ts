import {spawn} from 'child_process';
import {existsSync, statSync, writeFileSync} from 'fs-extra';
import {join} from 'path';
import {dest, src, task} from 'gulp';
import {execTask, sequenceTask} from '../util/task_helpers';
import {composeRelease} from '../util/package-build';
import {Bundler} from 'scss-bundle';
import {
  COMPONENTS_DIR,
  DIST_MATERIAL,
  DIST_RELEASES,
} from '../constants';
import * as minimist from 'minimist';

// There are no type definitions available for these imports.
const gulpRename = require('gulp-rename');

/** Parse command-line arguments for release task. */
const argv = minimist(process.argv.slice(3));

// Path to the release output of material.
const releasePath = join(DIST_RELEASES, 'material');

// The entry-point for the scss theming bundle.
const themingEntryPointPath = join(COMPONENTS_DIR, 'core', 'theming', '_all-theme.scss');

// Output path for the scss theming bundle.
const themingBundlePath = join(releasePath, '_theming.scss');

// Matches all SCSS files in the library.
const allScssGlob = join(COMPONENTS_DIR, '**/*.scss');

// Matches all pre-built theme css files
const prebuiltThemeGlob = join(DIST_MATERIAL, '**/theming/prebuilt/*.css');

task('build:release', sequenceTask(
  'library:clean-build',
  ':package:release',
));

/** Task that composes the different build files into the release structure. */
task(':package:release', [':package:theming'], () => composeRelease('material'));

/** Copies all prebuilt themes into the release package under `prebuilt-themes/` */
task(':package:theming', [':bundle:theming-scss'], () => {
  src(prebuiltThemeGlob)
    .pipe(gulpRename({dirname: ''}))
    .pipe(dest(join(releasePath, 'prebuilt-themes')));
});

/** Bundles all scss requires for theming into a single scss file in the root of the package. */
task(':bundle:theming-scss', () => {
  // Instantiates the SCSS bundler and bundles all imports of the specified entry point SCSS file.
  // A glob of all SCSS files in the library will be passed to the bundler. The bundler takes an
  // array of globs, which will match SCSS files that will be only included once in the bundle.
  new Bundler().Bundle(themingEntryPointPath, [allScssGlob]).then(result => {
    writeFileSync(themingBundlePath, result.bundledContent);
  });
});

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
  'build:release',
  ':publish',
  ':publish:logout',
));
