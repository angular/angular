// Canonical path provides a consistent path (i.e. always forward slashes) across different OSes
import path from 'canonical-path';
import fs from 'fs-extra';
import {globbySync} from 'globby';
import jsdom from 'jsdom';
import json5 from 'json5';
import {fileURLToPath} from 'url';

import regionExtractor from '../transforms/examples-package/services/region-parser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class StackblitzBuilder {
  constructor(basePath, destPath) {
    this.basePath = basePath;
    this.destPath = destPath;

    this.copyrights = this._buildCopyrightStrings();
    this._boilerplatePackageJsons = {};
  }

  build() {
    this._checkForOutdatedConfig();

    // When testing it sometimes helps to look a just one example directory like so:
    // const stackblitzPaths = path.join(this.basePath, '**/testing/*stackblitz.json');
    const stackblitzPaths = path.join(this.basePath, '**/*stackblitz.json');
    const fileNames = globbySync(stackblitzPaths, { ignore: ['**/node_modules/**'] });
    let failed = false;
    fileNames.forEach((configFileName) => {
      try {
        this._buildStackblitzFrom(configFileName);
      } catch (e) {
        failed = true;
        console.log(e);
      }
    });

    if (failed) {
      process.exit(1);
    }
  }

  _addDependencies(config, postData) {
    // Extract npm package dependencies
    const exampleType = this._getExampleType(config.basePath);
    const packageJson = this._getBoilerplatePackageJson(exampleType) || this._getBoilerplatePackageJson('cli');
    const exampleDependencies = packageJson.dependencies;

    // Add unit test packages from devDependencies for unit test examples
    const devDependencies = packageJson.devDependencies;
    (config.devDependencies || []).forEach(dep => exampleDependencies[dep] = devDependencies[dep]);

    postData.dependencies = JSON.stringify(exampleDependencies);
  }

  _getExampleType(exampleDir) {
    const configPath = `${exampleDir}/example-config.json`;
    const configSrc = fs.existsSync(configPath) && fs.readFileSync(configPath, 'utf-8').trim();
    const config = configSrc ? JSON.parse(configSrc) : {};

    return config.projectType || 'cli';
  }

  _getBoilerplatePackageJson(exampleType) {
    if (!this._boilerplatePackageJsons.hasOwnProperty(exampleType)) {
      const pkgJsonPath = `${__dirname}/../examples/shared/boilerplate/${exampleType}/package.json`;
      this._boilerplatePackageJsons[exampleType] = fs.existsSync(pkgJsonPath)
          ? JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))
          : null;
    }

    return this._boilerplatePackageJsons[exampleType];
  }

  _buildCopyrightStrings() {
    const copyright = 'Copyright Google LLC. All Rights Reserved.\n' +
        'Use of this source code is governed by an MIT-style license that\n' +
        'can be found in the LICENSE file at https://angular.io/license';
    const pad = '\n\n';

    return {
      jsCss: `${pad}/*\n${copyright}\n*/`,
      html: `${pad}<!-- \n${copyright}\n-->`,
    };
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
    const outputFileName = configFileName.replace(/stackblitz\.json$/, 'stackblitz.no-link.html');
    let altFileName;
    if (this.destPath && this.destPath.length > 0) {
      const partPath = path.dirname(path.relative(this.basePath, outputFileName));
      altFileName = path.join(this.destPath, partPath, path.basename(outputFileName)).replace('.no-link.', '.');
    }
    try {
      const config = this._initConfigAndCollectFileNames(configFileName);
      const postData = this._createPostData(config, configFileName);
      this._addDependencies(config, postData);
      const html = this._createStackblitzHtml(config, postData);
      fs.writeFileSync(outputFileName, html, 'utf-8');
      if (altFileName) {
        const altDirName = path.dirname(altFileName);
        fs.ensureDirSync(altDirName);
        fs.writeFileSync(altFileName, html, 'utf-8');
      }
    } catch (e) {
      // if we fail delete the outputFile if it exists because it is an old one.
      if (fs.existsSync(outputFileName)) {
        fs.unlinkSync(outputFileName);
      }
      if (altFileName && fs.existsSync(altFileName)) {
        fs.unlinkSync(altFileName);
      }
      throw e;
    }
  }

  _checkForOutdatedConfig() {
    // Ensure that nobody is trying to use the old config filenames (i.e. `plnkr.json`).
    const plunkerPaths = path.join(this.basePath, '**/*plnkr.json');
    const fileNames = globbySync(plunkerPaths, { ignore: ['**/node_modules/**'] });

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

  _getPrimaryFile(config) {
    if (config.file) {
      if (!fs.existsSync(path.join(config.basePath, config.file))) {
        throw new Error(`The specified primary file (${config.file}) does not exist in '${config.basePath}'.`);
      }
      return config.file;
    } else {
      const defaultPrimaryFiles = ['src/app/app.component.html', 'src/app/app.component.ts', 'src/app/main.ts'];
      const primaryFile = defaultPrimaryFiles.find(fileName =>  fs.existsSync(path.join(config.basePath, fileName)));

      if (!primaryFile) {
        throw new Error(`None of the default primary files (${defaultPrimaryFiles.join(', ')}) exists in '${config.basePath}'.`);
      }

      return primaryFile;
    }
  }

  _createBaseStackblitzHtml(config) {
    const file = `?file=${this._getPrimaryFile(config)}`;
    const action = `https://run.stackblitz.com/api/angular/v1${file}`;

    return `
      <!DOCTYPE html><html lang="en"><body>
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
      </body></html>
    `.trim();
  }

  _createPostData(config, configFileName) {
    const postData = {};

    // If `config.main` is specified, ensure that it points to an existing file.
    if (config.main && !fs.existsSync(path.join(config.basePath, config.main))) {
      throw Error(`The main file ('${config.main}') specified in '${configFileName}' does not exist.`);
    }

    config.fileNames.forEach((fileName) => {
      let content;
      const extn = path.extname(fileName);
      if (extn === '.png') {
        content = this._encodeBase64(fileName);
        fileName = `${fileName.slice(0, -extn.length)}.base64${extn}`;
      } else {
        content = fs.readFileSync(fileName, 'utf-8');
      }

      if (extn === '.js' || extn === '.ts' || extn === '.css') {
        content = content + this.copyrights.jsCss;
      } else if (extn === '.html') {
        content = content + this.copyrights.html;
      }
      // const escapedValue = escapeHtml(content);

      let relativeFileName = path.relative(config.basePath, fileName);

      // Is the main a custom index-xxx.html file? Rename it
      if (relativeFileName === config.main) {
        relativeFileName = 'src/index.html';
      }

      // A custom main.ts file? Rename it
      if (/src\/main[-.]\w+\.ts$/.test(relativeFileName)) {
        relativeFileName = 'src/main.ts';
      }

      if (relativeFileName === 'index.html') {
        if (config.description == null) {
          // set config.description to title from index.html
          const matches = /<title>(.*)<\/title>/.exec(content);
          if (matches) {
            config.description = matches[1];
          }
        }
      }

      content = regionExtractor()(content, extn.substr(1)).contents;

      postData[`files[${relativeFileName}]`] = content;
    });

    // Stackblitz defaults to ViewEngine unless `"enableIvy": true`
    // So if there is a tsconfig.json file and there is no `enableIvy` property, we need to
    // explicitly set it.
    const tsConfigJSON = postData['files[tsconfig.json]'];
    if (tsConfigJSON !== undefined) {
      const tsConfig = json5.parse(tsConfigJSON);
      if (tsConfig.angularCompilerOptions.enableIvy === undefined) {
        tsConfig.angularCompilerOptions.enableIvy = true;
        postData['files[tsconfig.json]'] = JSON.stringify(tsConfig, null, 2);
      }
    }

    const tags = ['angular', 'example', ...config.tags || []];
    tags.forEach((tag, ix) => postData[`tags[${ix}]`] = tag);

    postData.description = `Angular Example - ${config.description}`;

    return postData;
  }

  _createStackblitzHtml(config, postData) {
    const baseHtml = this._createBaseStackblitzHtml(config);
    const doc = new jsdom.JSDOM(baseHtml).window.document;
    const form = doc.querySelector('form');

    for(const [key, value] of Object.entries(postData)) {
      const ele = this._htmlToElement(doc, `<input type="hidden" name="${key}">`);
      ele.setAttribute('value', value);
      form.appendChild(ele);
    }

    return doc.documentElement.outerHTML;
  }

  _encodeBase64(file) {
    // read binary data
    return fs.readFileSync(file, { encoding: 'base64' });
  }

  _htmlToElement(document, html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.firstChild;
  }

  _initConfigAndCollectFileNames(configFileName) {
    const config = this._parseConfig(configFileName);

    const defaultIncludes = ['**/*.ts', '**/*.js', '**/*.css', '**/*.html', '**/*.md', '**/*.json', '**/*.png', '**/*.svg'];
    const boilerplateIncludes = ['src/environments/*.*', 'angular.json', 'src/polyfills.ts', 'tsconfig.json'];
    if (config.files) {
      if (config.files.length > 0) {
        if (config.files[0][0] === '!') {
          config.files = defaultIncludes.concat(config.files);
        }
      }
    } else {
      config.files = defaultIncludes;
    }
    config.files = config.files.concat(boilerplateIncludes);

    let includeSpec = false;
    const gpaths = config.files.map((fileName) => {
      fileName = fileName.trim();
      if (fileName[0] === '!') {
        return '!' + path.join(config.basePath, fileName.substr(1));
      } else {
        includeSpec = includeSpec || /\.spec\.(ts|js)$/.test(fileName);
        return path.join(config.basePath, fileName);
      }
    });

    const defaultExcludes = [
      '!**/e2e/**/*.*',
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

    config.fileNames = globbySync(gpaths, { ignore: ['**/node_modules/**'] });

    return config;
  }

  _parseConfig(configFileName) {
    try {
      const configSrc = fs.readFileSync(configFileName, 'utf-8');
      const config = (configSrc && configSrc.trim().length) ? JSON.parse(configSrc) : {};
      config.basePath = path.dirname(configFileName); // assumes 'stackblitz.json' is at `/src` level.
      return config;
    } catch (e) {
      throw new Error(`Stackblitz config - unable to parse json file: ${configFileName}\n${e}`);
    }
  }
}
