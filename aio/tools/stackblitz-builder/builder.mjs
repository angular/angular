// Canonical path provides a consistent path (i.e. always forward slashes) across different OSes
import path from 'canonical-path';
import fs from 'fs-extra';
import { globbySync } from 'globby';
import jsdom from 'jsdom';

import regionExtractor from '../transforms/examples-package/services/region-parser.js';

export class StackblitzBuilder {
  constructor(examplePath, destPath) {
    this.examplePath = examplePath;
    this.destPath = destPath;
    this.copyrights = this._buildCopyrightStrings();
    this._boilerplatePackageJsons = {};
  }

  build() {
    this._checkForOutdatedConfig();
    const fileNames = this._getConfigFileNames();
    if (fileNames.length == 0) {
      throw new Error(`Missing stackblitz configuration file(s) from example directory ${this.examplePath}. Did you forget to include a stackblitz.json?`);
    }

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

  _getConfigFileNames() {
    const stackblitzPaths = path.join(this.examplePath, '*stackblitz.json');
    const fileNames = globbySync(stackblitzPaths, {
      dot: true // Include subpaths that begin with '.' when using a wildcard inclusion.
                // Needed to include the bazel .cache folder on Linux.
    });
    return fileNames;
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
    // replace ending 'stackblitz.json' with 'stackblitz.html' to create output file name;
    const outputFileName = configFileName.replace(/stackblitz\.json$/, 'stackblitz.html');
    const outputFilePath = path.join(this.destPath, path.basename(outputFileName));
    const config = this._initConfigAndCollectFileNames(configFileName);
    const postData = this._createPostData(config, configFileName);

    this._addStackblitzrc(postData);

    const html = this._createStackblitzHtml(config, postData);
    const outputDirName = path.dirname(outputFilePath);
    fs.ensureDirSync(outputDirName);
    fs.writeFileSync(outputFilePath, html, 'utf-8');
  }

  _checkForOutdatedConfig() {
    // Ensure that nobody is trying to use the old config filenames (i.e. `plnkr.json`).
    const plunkerPaths = path.join(this.examplePath, '**/*plnkr.json');
    const fileNames = globbySync(plunkerPaths, { ignore: ['**/node_modules/**'],
      dot: true // Include subpaths that begin with '.' when using a wildcard inclusion.
                // Needed to include the bazel .cache folder on Linux.
    });

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

  _addStackblitzrc(postData) {
    postData['project[files][.stackblitzrc]'] = JSON.stringify({
      installDependencies: true,
      startCommand: 'turbo start',
      env: {
        ENABLE_CJS_IMPORTS: true
      }
    });
  }

  _createBaseStackblitzHtml(config) {
    const file = `?file=${this._getPrimaryFile(config)}`;
    const action = `https://stackblitz.com/run${file}`;

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
      content = fs.readFileSync(fileName, 'utf-8');

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

      content = regionExtractor()(content, extn.slice(1)).contents;

      postData[`project[files][${relativeFileName}]`] = content;
    });

    const tags = ['angular', 'example', ...config.tags || []];
    tags.forEach((tag, ix) => postData[`project[tags][${ix}]`] = tag);

    postData['project[description]'] = `Angular Example - ${config.description}`;
    postData['project[template]'] = 'node';

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
    const boilerplateIncludes = ['src/environments/*.*', 'src/polyfills.ts', '*.json'];
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
        return '!' + path.join(config.basePath, fileName.slice(1));
      } else {
        includeSpec = includeSpec || /\.spec\.(ts|js)$/.test(fileName);
        return path.join(config.basePath, fileName);
      }
    });

    const defaultExcludes = [
      '!**/e2e/**/*.*',
      '!**/example-config.json',
      '!**/.editorconfig',
      '!**/wallaby.js',
      '!**/*stackblitz.*'
    ];

    // exclude all specs if no spec is mentioned in `files[]`
    if (!includeSpec) {
      defaultExcludes.push('!**/*.spec.*','!**/spec.js');
    }

    gpaths.push(...defaultExcludes);

    config.fileNames = globbySync(gpaths, {
      ignore: ['**/node_modules/**'],
      dot: true // Include subpaths that begin with '.' when using a wildcard inclusion.
                // Needed to include the bazel .cache folder on Linux.
    });

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
