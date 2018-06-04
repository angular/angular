'use strict';

// Canonical path provides a consistent path (i.e. always forward slashes) across different OSes
var path = require('canonical-path');
var Q = require('q');
var _ = require('lodash');
var jsdom = require("jsdom");
var fs = require("fs-extra");
var globby = require('globby');

var regionExtractor = require('../transforms/examples-package/services/region-parser');

class StackblitzBuilder {
  constructor(basePath, destPath) {
    this.basePath = basePath;
    this.destPath = destPath;

    // Extract npm package dependencies
    var packageJson = require(path.join(__dirname, '../examples/shared/boilerplate/cli/package.json'));
    this.examplePackageDependencies = packageJson.dependencies;

    // Add unit test packages from devDependency for unit test examples
    var devDependencies = packageJson.devDependencies;
    this.examplePackageDependencies['jasmine-core'] = devDependencies['jasmine-core'];
    this.examplePackageDependencies['jasmine-marbles'] = devDependencies['jasmine-marbles'];

    this.copyrights = {};

    this._buildCopyrightStrings();
  }

  build() {
    this._checkForOutdatedConfig();

    // When testing it sometimes helps to look a just one example directory like so:
    // var stackblitzPaths = path.join(this.basePath, '**/testing/*stackblitz.json');
    var stackblitzPaths = path.join(this.basePath, '**/*stackblitz.json');
    var fileNames = globby.sync(stackblitzPaths, { ignore: ['**/node_modules/**'] });
    fileNames.forEach((configFileName) => {
      try {
        // console.log('***'+configFileName)
        this._buildStackblitzFrom(configFileName);
      } catch (e) {
        console.log(e);
      }
    });
  }

  _addDependencies(postData) {
    postData['dependencies'] = JSON.stringify(this.examplePackageDependencies);
  }

  _buildCopyrightStrings() {
    var copyright = 'Copyright 2017-2018 Google Inc. All Rights Reserved.\n'
      + 'Use of this source code is governed by an MIT-style license that\n'
      + 'can be found in the LICENSE file at http://angular.io/license';
    var pad = '\n\n';
    this.copyrights.jsCss = `${pad}/*\n${copyright}\n*/`;
    this.copyrights.html = `${pad}<!-- \n${copyright}\n-->`;
  }

  // Build stackblitz from JSON configuration file (e.g., stackblitz.json):
  // all properties are optional
  //   files: string[] - array of globs - defaults to all js, ts, html, json, css and md files (with certain files removed)
  //   description: string - description of this stackblitz - defaults to the title in the index.html page.
  //   tags: string[] - optional array of stackblitz tags (for searchability)
  //   main: string - name of file that will become index.html in the stackblitz - defaults to index.html
  //   file: string - name of file to display within the stackblitz (e.g. `"file": "app/app.module.ts"`)
  _buildStackblitzFrom(configFileName) {
    // replace ending 'stackblitz.json' with 'stackblitz.no-link.html' to create output file name;
    var outputFileName = `stackblitz.no-link.html`;
    outputFileName = configFileName.replace(/stackblitz\.json$/, outputFileName);
    var altFileName;
    if (this.destPath && this.destPath.length > 0) {
      var partPath = path.dirname(path.relative(this.basePath, outputFileName));
      var altFileName = path.join(this.destPath, partPath, path.basename(outputFileName)).replace('.no-link.', '.');
    }
    try {
      var config = this._initConfigAndCollectFileNames(configFileName);
      var postData = this._createPostData(config, configFileName);
      this._addDependencies(postData);
      var html = this._createStackblitzHtml(config, postData);
      fs.writeFileSync(outputFileName, html, 'utf-8');
      if (altFileName) {
        var altDirName = path.dirname(altFileName);
        fs.ensureDirSync(altDirName);
        fs.writeFileSync(altFileName, html, 'utf-8');
      }
    } catch (e) {
      // if we fail delete the outputFile if it exists because it is an old one.
      if (this._existsSync(outputFileName)) {
        fs.unlinkSync(outputFileName);
      }
      if (altFileName && this._existsSync(altFileName)) {
        fs.unlinkSync(altFileName);
      }
      throw e;
    }
  }

  _checkForOutdatedConfig() {
    // Ensure that nobody is trying to use the old config filenames (i.e. `plnkr.json`).
    var plunkerPaths = path.join(this.basePath, '**/*plnkr.json');
    var fileNames = globby.sync(plunkerPaths, { ignore: ['**/node_modules/**'] });

    if (fileNames.length) {
      const readmePath = path.join(__dirname, 'README.md');
      const errorMessage =
          'One or more examples are still trying to use \'plnkr.json\' files for configuring ' +
          'live examples. This is not supported any more. \'stackblitz.json\' should be used ' +
          'instead.\n' +
          `(Slight modifications may be required. See '${readmePath}' for more info.\n\n` +
          fileNames.map(name => `- ${name}`).join('\n');

      throw Error(errorMessage);
    }
  }

  _createBaseStackblitzHtml(config) {
    var file = '';

    // TODO: Doesn't work properly yet
    if (config.file) {
      file = `?file=${config.file}`;
    }
    var action = `https://run.stackblitz.com/api/angular/v1${file}`;
    var html = `<!DOCTYPE html><html lang="en"><body>
    <form id="mainForm" method="post" action="${action}" target="_self"></form>
    <script>
      var embedded = 'ctl=1';
      var isEmbedded = window.location.search.indexOf(embedded) > -1;

      if (isEmbedded) {
        var form = document.getElementById('mainForm');
        var action = form.action;
        var actionHasParams = action.indexOf('?') > -1;
        var symbol = actionHasParams ? '&' : '?'
        form.action = form.action + symbol + embedded;
      }
      document.getElementById("mainForm").submit();
    </script>
    </body></html>`;
    return html;
  }

  _createPostData(config, configFileName) {
    var postData = {};

    // If `config.main` is specified, ensure that it points to an existing file.
    if (config.main && !this._existsSync(path.join(config.basePath, config.main))) {
      throw Error(`The main file ('${config.main}') specified in '${configFileName}' does not exist.`);
    }

    config.fileNames.forEach((fileName) => {
      var content;
      var extn = path.extname(fileName);
      if (extn == '.png') {
        content = this._encodeBase64(fileName);
        fileName = fileName.substr(0, fileName.length - 4) + '.base64.png'
      } else {
        content = fs.readFileSync(fileName, 'utf-8');
      }

      if (extn == '.js' || extn == '.ts' || extn == '.css') {
        content = content + this.copyrights.jsCss;
      } else if (extn == '.html') {
        content = content + this.copyrights.html;
      }
      // var escapedValue = escapeHtml(content);

      var relativeFileName = path.relative(config.basePath, fileName);

      // Is the main a custom index-xxx.html file? Rename it
      if (relativeFileName == config.main) {
        relativeFileName = 'src/index.html';
      }

      // A custom main.ts file? Rename it
      if (/src\/main[-.]\w+\.ts$/.test(relativeFileName)) {
        relativeFileName = 'src/main.ts'
      }

      if (relativeFileName == 'index.html') {
        if (config.description == null) {
          // set config.description to title from index.html
          var matches = /<title>(.*)<\/title>/.exec(content);
          if (matches) {
            config.description = matches[1];
          }
        }
      }

      content = regionExtractor()(content, extn.substr(1)).contents;

      postData[`files[${relativeFileName}]`] = content;
    });

    var tags = ['angular', 'example'].concat(config.tags || []);
    tags.forEach(function(tag,ix) {
      postData['tags[' + ix + ']'] = tag;
    });

    postData.description = "Angular Example - " + config.description;

    return postData;
  }

  _createStackblitzHtml(config, postData) {
    var baseHtml = this._createBaseStackblitzHtml(config);
    var doc = jsdom.jsdom(baseHtml);
    var form = doc.querySelector('form');
    _.forEach(postData, (value, key) => {
      var ele = this._htmlToElement(doc, '<input type="hidden" name="' + key + '">');
      ele.setAttribute('value', value);
      form.appendChild(ele)
    });
    var html = doc.documentElement.outerHTML;

    return html;
  }

  _encodeBase64(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return Buffer(bitmap).toString('base64');
  }

  _existsSync(filename) {
    try {
      fs.accessSync(filename);
      return true;
    } catch(ex) {
      return false;
    }
  }

  _htmlToElement(document, html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.firstChild;
  }

  _initConfigAndCollectFileNames(configFileName) {
    var configDir = path.dirname(configFileName);
    var configSrc = fs.readFileSync(configFileName, 'utf-8');
    try {
      var config = (configSrc && configSrc.trim().length) ? JSON.parse(configSrc) : {};
      config.basePath = configDir; // assumes 'stackblitz.json' is at `/src` level.
    } catch (e) {
      throw new Error(`Stackblitz config - unable to parse json file: ${configFileName}\n${e}`);
    }

    var defaultIncludes = ['**/*.ts', '**/*.js', '**/*.css', '**/*.html', '**/*.md', '**/*.json', '**/*.png'];
    var boilerplateIncludes = ['src/environments/*.*', 'angular.json', 'src/polyfills.ts'];
    if (config.files) {
      if (config.files.length > 0) {
        if (config.files[0].substr(0, 1) == '!') {
          config.files = defaultIncludes.concat(config.files);
        }
      }
    } else {
      config.files = defaultIncludes;
    }
    config.files = config.files.concat(boilerplateIncludes);

    var includeSpec = false;
    var gpaths = config.files.map(function(fileName) {
      fileName = fileName.trim();
      if (fileName.substr(0,1) == '!') {
        return '!' + path.join(config.basePath, fileName.substr(1));
      } else {
        includeSpec = includeSpec || /\.spec\.(ts|js)$/.test(fileName);
        return path.join(config.basePath, fileName);
      }
    });

    var defaultExcludes = [
      '!**/e2e/**/*.*',
      '!**/tsconfig.json',
      '!**/package.json',
      '!**/example-config.json',
      '!**/tslint.json',
      '!**/.editorconfig',
      '!**/wallaby.js',
      '!**/karma-test-shim.js',
      '!**/karma.conf.js',
      '!**/test.ts',
      '!**/tsconfig.app.json',
      '!**/*stackblitz.*'
    ];

    // exclude all specs if no spec is mentioned in `files[]`
    if (!includeSpec) {
      defaultExcludes.push('!**/*.spec.*','!**/spec.js');
    }

    gpaths.push(...defaultExcludes);

    config.fileNames = globby.sync(gpaths, { ignore: ["**/node_modules/**"] });

    return config;
  }
}

module.exports = StackblitzBuilder;
