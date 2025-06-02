function readPackage(pkg, context) {
  // TODO(devversion): This exists temporarily during migration as we can't have `workspace:*` deps
  // in the `package.json` also processed by Yarn
  if (pkg.name === 'angular-srcs') {
    pkg.dependencies = {
      ...pkg.dependencies,
      // These dependencies are added to the workspace root so that peer dependencies
      // are resolved via these locally-built versions. e.g. compiler-cli's peer deps.
      '@angular/compiler': 'workspace:*',
      '@angular/compiler-cli': 'workspace:*',
    };
  }

  // TODO(devversion): This allows us to make compiler/TS a production dependency of compiler-cli
  // because `rules_js` doesn't otherwise include the dependency in the `npm_package_store`.
  // See: https://github.com/aspect-build/rules_js/issues/2226
  if (pkg.name === '@angular/compiler-cli') {
    pkg.dependencies = {
      ...pkg.dependencies,
      '@angular/compiler': 'workspace:*',
      'typescript': '5.8.3',
    };
  }

  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
