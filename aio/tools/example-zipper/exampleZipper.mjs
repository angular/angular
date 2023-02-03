// Canonical path provides a consistent path (i.e. always forward slashes) across different OSes
import archiver from 'archiver';
import path from 'canonical-path';
import fs from 'fs-extra';
import {globbySync} from 'globby';
import {fileURLToPath} from 'url';

import regionExtractor from '../transforms/examples-package/services/region-parser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXAMPLE_CONFIG_NAME = 'example-config.json';

export class ExampleZipper {
  constructor(exampleDirName, outputDirName) {
    this.examplesPackageJson = path.join(__dirname, '../examples/shared/package.json');
    this.examplesSystemjsConfig = path.join(__dirname, '../examples/shared/boilerplate/systemjs/src/systemjs.config.js');
    this.examplesSystemjsLoaderConfig = path.join(__dirname, '../examples/shared/boilerplate/systemjs/src/systemjs-angular-loader.js');
    this.exampleTsconfig = path.join(__dirname, '../examples/shared/boilerplate/systemjs/src/tsconfig.json');

    const configFileNames = this._findConfigurationFileNames(exampleDirName);
    if (configFileNames.length == 0) {
      throw new Error(`Missing zip configuration file(s) from example directory ${this.examplePath}. Did you forget to include a stackblitz.json/zipper.json?`);
    }

    configFileNames.forEach((configFileName) => {
      this._zipExample(configFileName, exampleDirName, outputDirName);
    });
  }

  _findConfigurationFileNames(exampleDirName) {
    const gpathStackblitz = path.join(exampleDirName, '*stackblitz.json');
    const gpathZipper = path.join(exampleDirName, 'zipper.json');

    const configFileNames = globbySync([gpathStackblitz, gpathZipper], {
      dot: true // Include subpaths that begin with '.' when using a wildcard inclusion.
                // Needed to include the bazel .cache folder on Linux.
    });

    return configFileNames;
  }

  _changeTypeRoots(tsconfig) {
    return tsconfig.replace('../../../', '../');
  }

  _createZipArchive(zipFileName) {
    let dirName = path.dirname(zipFileName);
    fs.ensureDirSync(dirName);
    let output = fs.createWriteStream(zipFileName);
    let archive = archiver('zip');

    archive.on('error', function (err) {
      throw err;
    });

    archive.pipe(output);
    return archive;
  }

  _getExampleType(exampleDirName) {
    const filePath = path.join(exampleDirName, EXAMPLE_CONFIG_NAME);

    try {
      return this._loadJson(filePath).projectType || 'cli';
    } catch (err) { // empty file, so it is cli
      return 'cli';
    }
  }

  _loadJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  // rename a custom main.ts or index.html file
  _renameFile(file, exampleType) {
    if (/src\/main[-.]\w+\.ts$/.test(file) && exampleType !== 'universal') {
      return 'src/main.ts';
    }

    if (/src\/index[-.]\w+\.html$/.test(file)) {
      return 'src/index.html';
    }

    return file;
  }

  _zipExample(configFileName, sourceDirName, outputDirName) {
    let json = this._loadJson(configFileName);
    const basePath = json.basePath || '';
    const jsonFileName = configFileName.replace(/^.*[\\\/]/, '');
    let relativeDirName = path.basename(sourceDirName);
    let exampleZipName;
    if (relativeDirName.indexOf('/') !== -1) { // Special example
      exampleZipName = relativeDirName.split('/').join('-');
    } else {
      exampleZipName = jsonFileName.replace(/(stackblitz|zipper).json/, relativeDirName);
    }

    const exampleDirName = path.dirname(configFileName);
    const exampleType = this._getExampleType(exampleDirName);
    const outputFileName = path.join(outputDirName, exampleZipName + '.zip');
    let defaultIncludes = ['**/*.ts', '**/*.js', '**/*.es6', '**/*.css', '**/*.html', '**/*.md', '**/*.json', '**/*.png', '**/*.svg'];
    let alwaysIncludes = [
      '.editorconfig',
      '.gitignore',
      'angular.json',
      'browserslist',
      'bs-config.json',
      'karma.conf.js',
      'karma-test-shim.js',
      'package.json',
      'tsconfig.*',
      'e2e/protractor.conf.js',
      'e2e/tsconfig.json',
      'src/favicon.ico',
      'src/polyfills.ts',
      'src/test.ts',
      'src/environments/**/*',
      'src/testing/**/*',
    ];
    var alwaysExcludes = [
      '!**/bs-config.e2e.json',
      '!**/*stackblitz.*',
      '!**/*zipper.*',
      '!**/systemjs.config.js',
      '!**/npm-debug.log',
      '!**/example-config.json',
      '!**/wallaby.js',
      '!**/e2e/protractor-bazel.conf.js',
      // AOT related files
      '!**/aot/**/*.*',
      '!**/*-aot.*'
    ];

    if (json.files) {
      if (json.files.length > 0) {
        json.files = json.files.map(file => {
          if (file.startsWith('!')) {
            if (file.startsWith('!**')) {
              return file;
            }

            return '!' + basePath + file.slice(1);
          }

          return basePath + file;
        });

        if (json.files[0][0] === '!') {
          json.files = defaultIncludes.concat(json.files);
        }
      }
    } else {
      json.files = defaultIncludes;
    }

    json.files = json.files.concat(alwaysIncludes);

    let gpaths = json.files.map((fileName) => {
      fileName = fileName.trim();
      if (fileName[0] === '!') {
        return '!' + path.join(exampleDirName, fileName.slice(1));
      } else {
        return path.join(exampleDirName, fileName);
      }
    });

    gpaths.push(...alwaysExcludes);

    let fileNames = globbySync(gpaths, {
      ignore: ['**/node_modules/**'],
      dot: true // Include subpaths that begin with '.' when using a wildcard inclusion.
                // Needed to include the bazel .cache folder on Linux.
    });

    let zip = this._createZipArchive(outputFileName);
    fileNames.forEach((fileName) => {
      let relativePath = path.relative(exampleDirName, fileName);
      relativePath = this._renameFile(relativePath, exampleType);
      let content = fs.readFileSync(fileName, 'utf8');
      let extn = path.extname(fileName).slice(1);
      // if we don't need to clean up the file then we can do the following.
      // zip.append(fs.createReadStream(fileName), { name: relativePath });
      let output = regionExtractor()(content, extn).contents;

      appendToZip(zip, output, { name: relativePath });
    });

    // also a systemjs config
    if (exampleType === 'systemjs') {
      appendToZip(zip, fs.readFileSync(this.examplesSystemjsConfig, 'utf8'), { name: 'src/systemjs.config.js' });
      appendToZip(zip, fs.readFileSync(this.examplesSystemjsLoaderConfig, 'utf8'), { name: 'src/systemjs-angular-loader.js' });
      // a modified tsconfig
      let tsconfig = fs.readFileSync(this.exampleTsconfig, 'utf8');
      appendToZip(zip, this._changeTypeRoots(tsconfig), {name: 'src/tsconfig.json' });
    }

    zip.finalize();
  }
}

// Fix the timestamp on zip entries in order create reproducible zip
// files, which improves remote Bazel cache performance.
function appendToZip(zip, source, data) {
  const FIXED_DATE = new Date(0);
  zip.append(source, {...data, date: FIXED_DATE});
}
