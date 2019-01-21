'use strict';

const path = require('canonical-path');
const fs = require('fs');

const examplesPath = path.resolve(__dirname, '../../../examples');
const packageFolder = path.resolve(__dirname);

class PackageJsonCustomizer {
  constructor() {
    this.dependenciesPackageJson = this.readJson(path.join(examplesPath, '/shared/package.json'));
    this.scriptsPackageJson = this.readJson(path.join(examplesPath, '/shared/boilerplate/systemjs/package.json'));
    this.basePackageJson = this.readJson(`${packageFolder}/base.json`);
    this.templatePackageJson = this.readJson(`${packageFolder}/package.json`, false);
  }

  generate(type = 'systemjs') {
    let packageJson = JSON.parse(this.templatePackageJson);
    let rules = require(`${packageFolder}/${type}.json`);

    this._mergeJSON(rules, this.basePackageJson);

    rules.scripts.forEach((r) => {
      const scriptName = r.name;
      const script = this.scriptsPackageJson.scripts[scriptName];
      const finalName = r.rename ? r.rename : r.name;
      const finalScript = r.command ? r.command : script;
      packageJson.scripts[finalName] = finalScript;
    });

    rules.dependencies.forEach((name) => {
      const version = this.dependenciesPackageJson.dependencies[name];
      packageJson.dependencies[name] = version;
    });

    rules.devDependencies.forEach((name) => {
      const version = this.dependenciesPackageJson.devDependencies[name];
      packageJson.devDependencies[name] = version;
    });

    return JSON.stringify(packageJson, null, 2);
  }

  _mergeJSON(json1, json2) {
    var result = json1;
    for (var prop in json2)
    {
        if (json2.hasOwnProperty(prop))
        {
            result[prop] = (result[prop].concat(json2[prop])).sort();
        }
    }
    return result;
  }

  readJson(jsonFile, parse = true) {
    const contents = fs.readFileSync(jsonFile, 'utf8');

    return parse ? JSON.parse(contents) : contents;
  }
}

module.exports = PackageJsonCustomizer;
