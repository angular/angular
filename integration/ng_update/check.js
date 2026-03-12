const fs = require('fs');
const path = require('path');

const angularRoot = path.resolve('./node_modules/@angular');
const angularModules = fs
  .readdirSync(angularRoot)
  .map(function (name) {
    const content = fs
      .readFileSync(path.join(angularRoot, name, 'package.json'), 'utf-8')
      .toString();
    return JSON.parse(content);
  })
  .reduce(function (acc, packageJson) {
    acc[packageJson.name] = packageJson;
    return acc;
  }, Object.create(null));

var error = false;
Object.keys(angularModules).forEach(function (name) {
  packageJson = angularModules[name];

  const ngUpdate = packageJson['ng-update'];
  if (!ngUpdate) {
    console.error('Package ' + JSON.stringify(name) + ' does not have an "ng-update" key.');
    error = true;
    return;
  }

  const packageGroup = ngUpdate['packageGroup'];
  if (!packageGroup) {
    console.error('Package ' + JSON.stringify(name) + ' does not have a "packageGroup" key.');
    error = true;
    return;
  }

  // Verify that every packageGroup is represented in the list of modules.
  Object.keys(angularModules).forEach(function (groupEntry) {
    if (packageGroup.indexOf(groupEntry) == -1) {
      console.error(
        'Package ' +
          JSON.stringify(name) +
          ' is missing ' +
          JSON.stringify(groupEntry) +
          ' as a packageGroup entry.',
      );
      error = true;
      return;
    }
  });
});

process.exit(error ? 1 : 0);
