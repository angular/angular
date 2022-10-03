module.exports = function processNavigationMap(versionInfo, bazelStampedProperties, getPreviousMajorVersions, log) {
  return {
    $runAfter: ['paths-computed'],
    $runBefore: ['rendering-docs'],
    $process: function(docs) {
      const navigationDoc = docs.find(doc => doc.docType === 'navigation-json');

      if (!navigationDoc) {
        throw new Error(
            'Missing navigation map document (docType="navigation-json").' +
            'Did you forget to add it to the readFileProcessor?');
      }

      // Verify that all the navigation paths are to valid docs
      const pathMap = {};
      docs.forEach(doc => pathMap[doc.path] = true);
      const errors = walk(navigationDoc.data, pathMap, []);

      if (errors.length) {
        log.error(`Navigation doc: ${navigationDoc.fileInfo.relativePath} contains invalid urls`);
        // eslint-disable-next-line no-console
        console.log(errors);
        throw new Error('processNavigationMap failed');
      }

      navigationDoc.data['docVersions'] = getPreviousMajorVersions().map(
          v => ({title: `v${v.major}`, url: `https://v${v.major}.angular.io/`}));

      // Add in version data in a "secret" field to be extracted in the docs app
      navigationDoc.data['__versionInfo'] = {
        major: versionInfo.currentVersion.major,

        // The 'full' version needs the source tree SHA but this is not available in
        // the execroot where Bazel runs this build. Get the SHA from Bazel-stamped
        // workspace status information.
        full: `${versionInfo.currentVersion.version}+sha.${bazelStampedProperties.BUILD_SCM_ABBREV_HASH}`
      };
    }
  };
};

function walk(node, map, path) {
  let errors = [];
  for (const key in node) {
    const child = node[key];
    if (child !== null) {  // null is allowed
      if (key === 'url') {
        const url = child.replace(/#.*$/, '');  // strip hash
        if (isRelative(url) && !map[url]) {
          errors.push({path: path.join('.'), url});
        }
      } else if (typeof child !== 'string') {
        errors = errors.concat(walk(child, map, path.concat([key])));
      }
    }
  }
  return errors;
}

function isRelative(url) {
  return !/^(https?:)?\/\//.test(url);
}
