module.exports = function processNavigationMap(versionInfo, log) {
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
        // TODO(petebd): fail if there are errors: throw new Error('processNavigationMap failed');
      }

      // Add in the version data in a "secret" field to be extracted in the docs app
      navigationDoc.data['__versionInfo'] = versionInfo.currentVersion;
    }
  };
};

function walk(node, map, path) {
  let errors = [];
  for(const key in node) {
    const child = node[key];
    if (child !== null) { // null is allowed
      if (key === 'url') {
        const url = child.replace(/#.*$/, ''); // strip hash
        if (isRelative(url) && !map[url]) {
          errors.push({ path: path.join('.'), url });
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
