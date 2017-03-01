const path = require('path');

/**
 * Processor to group docs into top-level "Components" WRT material design, e.g., "Button", "Tabs",
 * where each group may conists of several directives and services.
 */


/** Component group data structure. */
class ComponentGroup {
  constructor(name) {
    this.name = name;
    this.id = `component-group-${name}`;
    this.aliases = [];
    this.docType = 'componentGroup';
    this.directives = [];
    this.services = [];
    this.additionalClasses = [];
    this.ngModule = null;
  }
}

module.exports = function componentGrouper() {
  return {
    $runBefore: ['docs-processed'],
    $process: function(docs) {
      // Map of group name to group instance.
      let groups = new Map();

      docs.forEach(doc => {
        // Full path to the file for this doc.
        let basePath = doc.fileInfo.basePath;
        let filePath = doc.fileInfo.filePath;

        // All of the component documentation is under `src/lib`, which will be the basePath.
        // We group the docs up by the directory immediately under `src/lib` (e.g., "button").
        let groupName = path.relative(basePath, filePath).split(path.sep)[0];

        // Get the group for this doc, or, if one does not exist, create it.
        let group;
        if (groups.has(groupName)) {
          group = groups.get(groupName);
        } else {
          group = new ComponentGroup(groupName);
          groups.set(groupName, group);
        }

        // Put this doc into the appropriate list in this group.
        if (doc.isDirective) {
          group.directives.push(doc);
        } else if (doc.isService) {
          group.services.push(doc);
        } else if (doc.isNgModule) {
          group.ngModule = doc;
        } else if (doc.docType == 'class') {
          group.additionalClasses.push(doc);
        }
      });

      return Array.from(groups.values());
    }
  };
};

