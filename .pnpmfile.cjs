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
      '@angular/core': 'workspace:*',
      '@angular/common': 'workspace:*',
      '@angular/router': 'workspace:*',
      '@angular/platform-browser': 'workspace:*',
      '@angular/platform-browser-dynamic': 'workspace:*',
      '@angular/platform-server': 'workspace:*',
      '@angular/forms': 'workspace:*',
      '@angular/elements': 'workspace:*',
      '@angular/animations': 'workspace:*',
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

  Object.entries(pkg.peerDependencies).forEach(([key, version]) => {
    // Any package that has a peerDependency on rxjs or zone.js, should instead treat the peerDependency as a
    // regular dependency.
    if (['rxjs', 'zone.js'].includes(key)) {
      pkg.dependencies = {
        ...pkg.dependencies,
        [key]: version,
      };
    }

    // Change all locally generated packages to directly depend on the other local packages, instead
    // of expecting them as peerDependencies automatically as we do not auto install peer deps.
    if (version === '0.0.0-PLACEHOLDER') {
      pkg.dependencies = {
        ...pkg.dependencies,
        [key]: 'workspace: *',
      };
    }
  });

  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
