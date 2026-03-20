// TODO: Define these packages in a single common location.
const localAngularPackages = new Set([
  '@angular/animations',
  '@angular/common',
  '@angular/compiler',
  '@angular/compiler-cli',
  '@angular/core',
  '@angular/elements',
  '@angular/forms',
  '@angular/language-service',
  '@angular/localize',
  '@angular/platform-browser',
  '@angular/platform-browser-dynamic',
  '@angular/platform-server',
  '@angular/router',
  '@angular/service-worker',
  '@angular/upgrade',
]);

const peerDepsToChange = new Set(['zone.js', 'rxjs']);

function readPackage(pkg, context) {
  // TODO(devversion): This allows us to make compiler/TS a production dependency of compiler-cli
  // because `rules_js` doesn't otherwise include the dependency in the `npm_package_store`.
  // See: https://github.com/aspect-build/rules_js/issues/2226
  if (pkg.name === '@angular/compiler-cli') {
    pkg.dependencies = {
      ...pkg.dependencies,
      '@angular/compiler': 'workspace:*',
      'typescript': pkg.devDependencies['typescript'],
    };

    delete pkg.devDependencies['typescript'];
  }

  for (const [key, version] of Object.entries(pkg.peerDependencies)) {
    // Any package that has a peerDependency on rxjs or zone.js, should instead treat the peerDependency as a
    // regular dependency.
    if (peerDepsToChange.has(key)) {
      pkg.dependencies = {
        ...pkg.dependencies,
        [key]: pkg.devDependencies[key] ?? version,
      };

      delete pkg.devDependencies[key];

      continue;
    }

    // Change all locally generated packages to directly depend on the other local packages, instead
    // of expecting them as peerDependencies automatically as we do not auto install peer deps. The
    // package is also removed from peerDependencies as it was moved over and will just cause errors.
    if (pkg.version === '0.0.0-PLACEHOLDER' && localAngularPackages.has(key)) {
      pkg.dependencies = {
        ...pkg.dependencies,
        [key]: 'workspace: *',
      };

      delete pkg.peerDependencies[key];
    }
  }

  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
