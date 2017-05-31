'use strict';

// Canonical path provides a consistent path (i.e. always forward slashes) across different OSes
const path = require('canonical-path');
const archiver = require('archiver');
const fs = require('fs-extra');
const globby = require('globby');

const PackageJsonCustomizer = require('./customizer/package-json/packageJsonCustomizer');
const regionExtractor = require('../transforms/examples-package/services/region-parser');

class ExampleZipper {
  constructor(sourceDirName, outputDirName) {
    this.examplesPackageJson = path.join(__dirname, '../examples/shared/package.json');
    this.examplesSystemjsConfig = path.join(__dirname, '../examples/shared/boilerplate/src/systemjs.config.js');
    this.examplesSystemjsLoaderConfig = path.join(__dirname, '../examples/shared/boilerplate/src/systemjs-angular-loader.js');
    this.exampleTsconfig = path.join(__dirname, '../examples/shared/boilerplate/src/tsconfig.json');
    this.customizer = new PackageJsonCustomizer();

    let gpathPlnkr = path.join(sourceDirName, '**/*plnkr.json');
    let gpathZipper = path.join(sourceDirName, '**/zipper.json');
    let configFileNames = globby.sync([gpathPlnkr, gpathZipper], { ignore: ['**/node_modules/**'] });
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

  _zipExample(configFileName, sourceDirName, outputDirName) {
    let json = require(configFileName, 'utf-8');
    const exampleType = json.type || 'systemjs';
    const basePath = json.basePath || '';
    const jsonFileName = configFileName.replace(/^.*[\\\/]/, '');
    let relativeDirName = path.dirname(path.relative(sourceDirName, configFileName));
    let exampleZipName;

    if (relativeDirName.indexOf('/') !== -1) { // Special example
      exampleZipName = relativeDirName.split('/')[0];
    } else {
      exampleZipName = jsonFileName.replace(/(plnkr|zipper).json/, relativeDirName);
    }

    const exampleDirName = path.dirname(configFileName);
    const outputFileName = path.join(outputDirName, relativeDirName, exampleZipName + '.zip');
    let defaultIncludes = ['**/*.ts', '**/*.js', '**/*.es6', '**/*.css', '**/*.html', '**/*.md', '**/*.json', '**/*.png'];
    let alwaysIncludes = ['bs-config.json', 'tslint.json', 'karma-test-shim.js', 'karma.conf.js', 'src/testing/**/*', 'src/.babelrc'];
    var defaultExcludes = [
      '!**/bs-config.e2e.json',
      '!**/*plnkr.*',
      '!**/*zipper.*',
      '!**/systemjs.config.js',
      '!**/npm-debug.log',
      '!**/package.json',
      '!**/example-config.json',
      '!**/wallaby.js',
      '!**/tsconfig.json',
      '!**/package.webpack.json',
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

    Array.prototype.push.apply(gpaths, defaultExcludes);

    let fileNames = globby.sync(gpaths, { ignore: ['**/node_modules/**']});

    let zip = this._createZipArchive(outputFileName);
    fileNames.forEach((fileName) => {
      let relativePath = path.relative(exampleDirName, fileName);
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
    if (!json.removeSystemJsConfig) {
      zip.append(fs.readFileSync(this.examplesSystemjsConfig, 'utf8'), { name: 'src/systemjs.config.js' });
      zip.append(fs.readFileSync(this.examplesSystemjsLoaderConfig, 'utf8'), { name: 'src/systemjs-angular-loader.js' });
    }
    // a modified tsconfig
    let tsconfig = fs.readFileSync(this.exampleTsconfig, 'utf8');
    zip.append(this._changeTypeRoots(tsconfig), {name: 'src/tsconfig.json'});

    zip.finalize();
  }
}

module.exports = ExampleZipper;
