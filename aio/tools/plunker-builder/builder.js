'use strict';

// Canonical path provides a consistent path (i.e. always forward slashes) across different OSes
var path = require('canonical-path');
var Q = require('q');
var _ = require('lodash');
var jsdom = require("jsdom");
var fs = require("fs-extra");
var globby = require('globby');

var fileTranslator = require('./translator/fileTranslator');
var indexHtmlRules = require('./translator/rules/indexHtml');
var systemjsConfigExtrasRules = require('./translator/rules/systemjsConfigExtras');
var regionExtractor = require('../transforms/examples-package/services/region-parser');

class PlunkerBuilder {
  constructor(basePath, destPath, options) {
    this.basePath = basePath;
    this.destPath = destPath;
    this.options = options;
    this.boilerplate = path.join(__dirname, '../examples/shared/boilerplate');
    this.copyrights = {};

    this._buildCopyrightStrings();
  }

  buildPlunkers() {
    this._getPlunkerFiles();
    var errFn = this.options.errFn || function(e) { console.log(e); };
    var plunkerPaths = path.join(this.basePath, '**/*plnkr.json');
    var fileNames = globby.sync(plunkerPaths, { ignore: ['**/node_modules/**'] });
    fileNames.forEach((configFileName) => {
      try {
        this._buildPlunkerFrom(configFileName);
      } catch (e) {
        errFn(e);
      }
    });
  }

  _addPlunkerFiles(postData) {
    this.options.addField(postData, 'systemjs.config.js', this.systemjsConfig);
    this.options.addField(postData, 'systemjs-angular-loader.js', this.systemjsModulePlugin);
  }

  _buildCopyrightStrings() {
    var copyright = 'Copyright 2017 Google Inc. All Rights Reserved.\n'
      + 'Use of this source code is governed by an MIT-style license that\n'
      + 'can be found in the LICENSE file at http://angular.io/license';
    var pad = '\n\n';
    this.copyrights.jsCss = `${pad}/*\n${copyright}\n*/`;
    this.copyrights.html = `${pad}<!-- \n${copyright}\n-->`;
  }

  // Build plunker from JSON configuration file (e.g., plnkr.json):
  // all properties are optional
  //   files: string[] - array of globs - defaults to all js, ts, html, json, css and md files (with certain files removed)
  //   description: string - description of this plunker - defaults to the title in the index.html page.
  //   tags: string[] - optional array of plunker tags (for searchability)
  //   main: string - name of file that will become index.html in the plunker - defaults to index.html
  //   open: string - name of file to display within the plunker as in "open": "app/app.module.ts"
  _buildPlunkerFrom(configFileName) {
    // replace ending 'plnkr.json' with 'plnkr.no-link.html' to create output file name;
    var outputFileName = `${this.options.plunkerFileName}.no-link.html`;
    outputFileName = configFileName.replace(/plnkr\.json$/, outputFileName);
    var altFileName;
    if (this.destPath && this.destPath.length > 0) {
      var partPath = path.dirname(path.relative(this.basePath, outputFileName));
      var altFileName = path.join(this.destPath, partPath, path.basename(outputFileName)).replace('.no-link.', '.');
    }
    try {
      var config = this._initConfigAndCollectFileNames(configFileName);
      var postData = this._createPostData(config);
      this._addPlunkerFiles(postData);
      var html = this._createPlunkerHtml(config, postData);
      if (this.options.writeNoLink) {
        fs.writeFileSync(outputFileName, html, 'utf-8');
      }
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

  _createBasePlunkerHtml(config, embedded) {
    var open = '';

    if (config.open) {
      open = embedded ? `&show=${config.open}` : `&open=${config.open}`;
    }
    var action = `${this.options.url}${open}`;
    var html = '<!DOCTYPE html><html lang="en"><body>';
    html += `<form id="mainForm" method="post" action="${action}" target="_self">`;

    // html += '<div class="button"><button id="formButton" type="submit">Create Plunker</button></div>'
    // html += '</form><script>document.getElementById("formButton").click();</script>'
    html +=  '</form><script>document.getElementById("mainForm").submit();</script>';
    html += '</body></html>';
    return html;
  }

  _createPostData(config) {
    var postData = {};
    config.fileNames.forEach((fileName) => {
      var content;
      var extn = path.extname(fileName);
      if (extn == '.png') {
        content = this._encodeBase64(fileName);
        fileName = fileName.substr(0, fileName.length - 4) + '.base64.png'
      } else if (-1 < fileName.indexOf('systemjs.config.extras')) {
        content = this._getSystemjsConfigExtras(config);
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

      if (relativeFileName == config.main) {
        relativeFileName = 'index.html';
      }

      if (relativeFileName == 'index.html') {
        content = fileTranslator.translate(content, indexHtmlRules);
        if (config.description == null) {
          // set config.description to title from index.html
          var matches = /<title>(.*)<\/title>/.exec(content);
          if (matches) {
            config.description = matches[1];
          }
        }
      }

      if (relativeFileName == 'systemjs.config.extras.js') {
        content = fileTranslator.translate(content, systemjsConfigExtrasRules);
      }

      content = regionExtractor()(content, extn.substr(1)).contents;

      this.options.addField(postData, relativeFileName, content);
    });

    var tags = ['angular', 'example'].concat(config.tags || []);
    tags.forEach(function(tag,ix) {
      postData['tags[' + ix + ']'] = tag;
    });

    if (!this.options.embedded) {
      postData.private = true;

      postData.description = "Angular Example - " + config.description;
    } else {
      postData.title = "Angular Example - " + config.description;
    }

    // Embedded needs to add more content, so if the callback is available, we call it
    if (this.options.extraData) {
      this.options.extraData(postData, config);
    }
    return postData;
  }

  _createPlunkerHtml(config, postData) {
    var baseHtml = this._createBasePlunkerHtml(config, this.options.embedded);
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

  _getPlunkerFiles() {
    var systemJsModulePlugin = '/src/systemjs-angular-loader.js';
    var systemJsConfigPath = '/src/systemjs.config.web.js';
    if (this.options.build) {
      systemJsConfigPath = '/src/systemjs.config.web.build.js';
    }
    this.systemjsConfig = fs.readFileSync(this.boilerplate + systemJsConfigPath, 'utf-8');
    this.systemjsModulePlugin = fs.readFileSync(this.boilerplate + systemJsModulePlugin, 'utf-8');

    // Copyright already added to web versions of systemjs.config
    // this.systemjsConfig +=  this.copyrights.jsCss;
  }

  // Try to replace `systemjs.config.extras.js` with the
  // `systemjs.config.extras.web.js` web version that
  // should default SystemJS barrels to `.ts` files rather than `.js` files
  // Example: see docs `testing`.
  // HACK-O-MATIC!
  _getSystemjsConfigExtras(config) {
    var extras =    config.basePath + '/systemjs.config.extras.js';
    var webExtras = config.basePath + '/systemjs.config.extras.web.js';
    if (this._existsSync(webExtras)) {
      // console.log('** Substituted "' + webExtras + '"  for "' + extras + '".');
      return fs.readFileSync(webExtras, 'utf-8');
    } else if (this._existsSync(extras)){
      console.log('** WARNING: no "' + webExtras + '" replacement for "' + extras + '".');
      return fs.readFileSync(extras, 'utf-8');
    } else {
      console.log('** WARNING: no "' + extras + '" file; returning empty content.');
      return '';
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
      config.basePath = config.basePath ? path.resolve(configDir, config.basePath) : configDir;
    } catch (e) {
      throw new Error(`Plunker config - unable to parse json file: ${configFileName}\n${e}`);
    }

    var defaultIncludes = ['**/*.ts', '**/*.js', '**/*.css', '**/*.html', '**/*.md', '**/*.json', '**/*.png'];
    if (config.files) {
      if (config.files.length > 0) {
        if (config.files[0].substr(0, 1) == '!') {
          config.files = defaultIncludes.concat(config.files);
        }
      }
    } else {
      config.files = defaultIncludes;
    }
    var includeSpec = false;
    var gpaths = config.files.map(function(fileName) {
      fileName = fileName.trim();
      if (fileName.substr(0,1) == '!') {
        return "!" + path.join(config.basePath, fileName.substr(1));
      } else {
        includeSpec = includeSpec || /\.spec\.(ts|js)$/.test(fileName);
        return path.join(config.basePath, fileName);
      }
    });

    var defaultExcludes = [
      '!**/tsconfig.json',
      '!**/*plnkr.*',
      '!**/package.json',
      '!**/example-config.json',
      '!**/tslint.json',
      '!**/.editorconfig',
      '!**/systemjs.config.js',
      '!**/wallaby.js',
      '!**/karma-test-shim.js',
      '!**/karma.conf.js',
      // AoT related files
      '!**/aot/**/*.*',
      '!**/*-aot.*'
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

module.exports = PlunkerBuilder;
