'use strict';

// Canonical path provides a consistent path (i.e. always forward slashes) across different OSes
const path = require('canonical-path');
const archiver = require('archiver');
const fs = require('fs-extra');
const globby = require('globby');

const PackageJsonCustomizer = require('./customizer/package-json/packageJsonCustomizer');
const regionExtractor = require('../transforms/examples-package/services/region-parser');

const EXAMPLE_CONFIG_NAME = 'example-config.json';

class ExampleZipper {
  constructor(sourceDirName, outputDirName) {
    this.examplesPackageJson = path.join(__dirname, '../examples/shared/package.json');
    this.examplesSystemjsConfig = path.join(__dirname, '../examples/shared/boilerplate/systemjs/src/systemjs.config.js');
    this.examplesSystemjsLoaderConfig = path.join(__dirname, '../examples/shared/boilerplate/systemjs/src/systemjs-angular-loader.js');
    this.exampleTsconfig = path.join(__dirname, '../examples/shared/boilerplate/systemjs/src/tsconfig.json');
    this.customizer = new PackageJsonCustomizer();

    let gpathStackblitz = path.join(sourceDirName, '**/*stackblitz.json');
    let gpathZipper = path.join(sourceDirName, '**/zipper.json');
    let configFileNames = globby.sync([gpathStackblitz, gpathZipper], { ignore: ['**/node_modules/**'] });
    configFileNames.forEach((configFileName) => {
      this._zipExample(configFileName, sourceDirName, outputDirName);
    });
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

  _getExampleType(sourceFolder) {
    const filePath = path.join(sourceFolder, EXAMPLE_CONFIG_NAME);
    try {
      return require(filePath, 'utf-8').projectType || 'cli';
    } catch (err) { // empty file, so it is cli
      return 'cli';
    }
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
    let json = require(configFileName, 'utf-8');
    const basePath = json.basePath || '';
    const jsonFileName = configFileName.replace(/^.*[\\\/]/, '');
    let relativeDirName = path.dirname(path.relative(sourceDirName, configFileName));
    let exampleZipName;
    const exampleType = this._getExampleType(path.join(sourceDirName, relativeDirName));
    if (relativeDirName.indexOf('/') !== -1) { // Special example
      exampleZipName = relativeDirName.split('/').join('-');
    } else {
      exampleZipName = jsonFileName.replace(/(stackblitz|zipper).json/, relativeDirName);
    }

    const exampleDirName = path.dirname(configFileName);
    const outputFileName = path.join(outputDirName, relativeDirName, exampleZipName + '.zip');
    let defaultIncludes = ['**/*.ts', '**/*.js', '**/*.es6', '**/*.css', '**/*.html', '**/*.md', '**/*.json', '**/*.png'];
    let alwaysIncludes = [
      'bs-config.json',
      'e2e/protractor.conf.js',
      'angular.json',
      '.editorconfig',
      '.gitignore',
      'tslint.json',
      'karma-test-shim.js',
      'tsconfig.json',
      'src/testing/**/*',
      'src/.babelrc',
      'src/browserslist',
      'src/favicon.ico',
      'src/karma.conf.js',
      'src/polyfills.ts',
      'src/test.ts',
      'src/typings.d.ts',
      'src/environments/**/*',
      'src/tsconfig.*',
      'src/tslint.*'
    ];
    var alwaysExcludes = [
      '!**/bs-config.e2e.json',
      '!**/*stackblitz.*',
      '!**/*zipper.*',
      '!**/systemjs.config.js',
      '!**/npm-debug.log',
      '!**/package.json',
      '!**/example-config.json',
      '!**/wallaby.js',
      // AoT related files
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

            return '!' + basePath + file.substr(1);
          }

          return basePath + file;
        });

        if (json.files[0].substr(0, 1) === '!') {
          json.files = defaultIncludes.concat(json.files);
        }
      }
    } else {
      json.files = defaultIncludes;
    }

    json.files = json.files.concat(alwaysIncludes);

    let gpaths = json.files.map((fileName) => {
      fileName = fileName.trim();
      if (fileName.substr(0, 1) === '!') {
        return '!' + path.join(exampleDirName, fileName.substr(1));
      } else {
        return path.join(exampleDirName, fileName);
      }
    });

    Array.prototype.push.apply(gpaths, alwaysExcludes);

    let fileNames = globby.sync(gpaths, { ignore: ['**/node_modules/**']});

    let zip = this._createZipArchive(outputFileName);
    fileNames.forEach((fileName) => {
      let relativePath = path.relative(exampleDirName, fileName);
      relativePath = this._renameFile(relativePath, exampleType);
      let content = fs.readFileSync(fileName, 'utf8');
      let extn = path.extname(fileName).substr(1);
      // if we don't need to clean up the file then we can do the following.
      // zip.append(fs.createReadStream(fileName), { name: relativePath });
      let output = regionExtractor()(content, extn).contents;

      zip.append(output, { name: relativePath } )
    });

    // we need the package.json from _examples root, not the _boilerplate one
    zip.append(this.customizer.generate(exampleType), { name: 'package.json' });
    // also a systemjs config
    if (exampleType === 'systemjs') {
      zip.append(fs.readFileSync(this.examplesSystemjsConfig, 'utf8'), { name: 'src/systemjs.config.js' });
      zip.append(fs.readFileSync(this.examplesSystemjsLoaderConfig, 'utf8'), { name: 'src/systemjs-angular-loader.js' });
      // a modified tsconfig
      let tsconfig = fs.readFileSync(this.exampleTsconfig, 'utf8');
      zip.append(this._changeTypeRoots(tsconfig), {name: 'src/tsconfig.json'});
    }

    zip.finalize();
  }
}

module.exports = ExampleZipper;
