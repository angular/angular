import {spawn} from 'child_process';
import {existsSync, statSync, writeFileSync, readFileSync} from 'fs-extra';
import {join, basename} from 'path';
import {task, src, dest} from 'gulp';
import {execNodeTask, execTask, sequenceTask} from '../util/task_helpers';
import {
  DIST_RELEASE, DIST_BUNDLES, DIST_MATERIAL, COMPONENTS_DIR, LICENSE_BANNER, DIST_ROOT
} from '../constants';
import * as minimist from 'minimist';

// There are no type definitions available for these imports.
const glob = require('glob');
const gulpRename = require('gulp-rename');

/** Parse command-line arguments for release task. */
const argv = minimist(process.argv.slice(3));

// Matches all Typescript definition files for Material.
const typingsGlob = join(DIST_MATERIAL, '**/*.+(d.ts|metadata.json)');
// Matches the "package.json" and "README.md" file that needs to be shipped.
const assetsGlob = join(COMPONENTS_DIR, '+(package.json|README.md)');
// Matches all UMD bundles inside of the bundles distribution.
const umdGlob = join(DIST_BUNDLES, '*.umd.*');
// Matches all flat ESM bundles (e.g material.js and material.es5.js)
const fesmGlob = [join(DIST_BUNDLES, '*.js'), `!${umdGlob}`];

// The entry-point for the scss theming bundle.
const themingEntryPointPath = join(COMPONENTS_DIR, 'core', 'theming', '_all-theme.scss');

// Output path for the scss theming bundle.
const themingBundlePath = join(DIST_RELEASE, '_theming.scss');

// Matches all pre-built theme css files
const prebuiltThemeGlob = join(DIST_MATERIAL, '**/theming/prebuilt/*.css');

task('build:release', sequenceTask(
  'library:build',
  ':package:release',
));

/** Task that combines intermediate build artifacts into the release package structure. */
task(':package:release', sequenceTask(
  [':package:typings', ':package:umd', ':package:fesm', ':package:assets', ':package:theming'],
  ':inline-metadata-resources',
  ':package:metadata',
));

/** Writes a re-export metadata */
task(':package:metadata', () => {
  const metadataReExport =
      `{"__symbolic":"module","version":3,"metadata":{},"exports":[{"from":"./typings/index"}]}`;
  writeFileSync(join(DIST_RELEASE, 'material.metadata.json'), metadataReExport, 'utf-8');
});

/** Inlines the html and css resources into all metadata.json files in dist/ */
task(':inline-metadata-resources', () => {
  // Create a map of fileName -> fullFilePath. This is needed because the templateUrl and
  // styleUrls for each component use just the filename because, in the source, the component
  // and the resources live in the same directory.
  const componentResources = new Map<string, string>();
  glob(join(DIST_ROOT, '**/*.+(html|css)'), (err: any, resourceFilePaths: any) => {
    for (const path of resourceFilePaths) {
      componentResources.set(basename(path), path);
    }
  });

  // Find all metadata files. For each one, parse the JSON content, inline the resources, and
  // reserialize and rewrite back to the original location.
  glob(join(DIST_ROOT, '**/*.metadata.json'), (err: any, metadataFilePaths: any) => {
    for (const path of metadataFilePaths) {
      let metadata = JSON.parse(readFileSync(path, 'utf-8'));
      inlineMetadataResources(metadata, componentResources);
      writeFileSync(path , JSON.stringify(metadata), 'utf-8');
    }
  });
});

task(':package:assets', () => src(assetsGlob).pipe(dest(DIST_RELEASE)));

/** Copy all d.ts except the special flat typings from ngc to typings/ in the release package. */
task(':package:typings', () => {
  return src(typingsGlob)
    .pipe(dest(join(DIST_RELEASE, 'typings')))
    .on('end', () => createTypingFile());
});

/** Copy umd bundles to the root of the release package. */
task(':package:umd', () => src(umdGlob).pipe((dest(join(DIST_RELEASE, 'bundles')))));

/** Copy primary entry-point FESM bundles to the @angular/ directory. */
task(':package:fesm', () => src(fesmGlob).pipe(dest(join(DIST_RELEASE, '@angular'))));

/** Copies all prebuilt themes into the release package under `prebuilt-themes/` */
task(':package:theming', [':bundle:theming-scss'],
    () => src(prebuiltThemeGlob)
        .pipe(gulpRename({dirname: ''}))
        .pipe(dest(join(DIST_RELEASE, 'prebuilt-themes'))));

/** Bundles all scss requires for theming into a single scss file in the root of the package. */
task(':bundle:theming-scss', execNodeTask(
    'scss-bundle',
    'scss-bundle', [
    '-e', themingEntryPointPath,
    '-d', themingBundlePath,
]));

/** Make sure we're logged in. */
task(':publish:whoami', execTask('npm', ['whoami'], {
  silent: true,
  errMessage: 'You must be logged in to publish.'
}));

/** Create a typing file that links to the bundled definitions of NGC. */
function createTypingFile() {
  writeFileSync(join(DIST_RELEASE, 'material.d.ts'),
    LICENSE_BANNER + '\nexport * from "./typings/index";'
  );
}

task(':publish:logout', execTask('npm', ['logout']));


function _execNpmPublish(label: string): Promise<{}> {
  const packageDir = DIST_RELEASE;
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


/**
 * Recurse through a parsed metadata.json file and inline all html and css.
 * Note: this assumes that all html and css files have a unique name.
 */
function inlineMetadataResources(metadata: any, componentResources: Map<string, string>) {
  // Convert `templateUrl` to `template`
  if (metadata.templateUrl) {
    const fullResourcePath = componentResources.get(metadata.templateUrl);
    metadata.template = readFileSync(fullResourcePath, 'utf-8');
    delete metadata.templateUrl;
  }

  // Convert `styleUrls` to `styles`
  if (metadata.styleUrls && metadata.styleUrls.length) {
    metadata.styles = [];
    for (const styleUrl of metadata.styleUrls) {
      const fullResourcePath = componentResources.get(styleUrl);
      metadata.styles.push(readFileSync(fullResourcePath, 'utf-8'));
    }
    delete metadata.styleUrls;
  }

  // We we did nothing at this node, go deeper.
  if (!metadata.template && !metadata.styles) {
    for (const property in metadata) {
      if (typeof metadata[property] == 'object' && metadata[property]) {
        inlineMetadataResources(metadata[property], componentResources);
      }
    }
  }
}
