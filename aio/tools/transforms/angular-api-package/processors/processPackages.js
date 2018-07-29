const { dirname } = require('canonical-path');

module.exports = function processPackages() {
  return {
    $runAfter: ['extractDecoratedClassesProcessor'],
    $runBefore: ['computing-ids'],
    $process(docs) {
      const packageContentFiles = {};
      const packageMap = {};

      docs = docs.filter(doc => {
        if (doc.docType === 'package-content') {
          packageContentFiles[dirname(doc.fileInfo.filePath)] = doc;
          return false;
        } else {
          return true;
        }
      });

      docs.forEach(doc => {
        if (doc.docType === 'module') {
          // Convert the doc type from "module" to "package"
          doc.docType = 'package';
          // The name is actually the full id
          doc.name = `@angular/${doc.id}`;

          // Partition the exports into groups by type
          if (doc.exports) {
            doc.classes = doc.exports.filter(doc => doc.docType === 'class');
            doc.decorators = doc.exports.filter(doc => doc.docType === 'decorator');
            doc.functions = doc.exports.filter(doc => doc.docType === 'function');
            doc.structures = doc.exports.filter(doc => doc.docType === 'enum' || doc.docType === 'interface');
            doc.directives = doc.exports.filter(doc => doc.docType === 'directive');
            doc.pipes = doc.exports.filter(doc => doc.docType === 'pipe');
            doc.types = doc.exports.filter(doc => doc.docType === 'type-alias' || doc.docType === 'const');
          }

          // Copy over docs from the PACKAGE.md file that is used to document packages
          const readmeDoc = packageContentFiles[dirname(doc.fileInfo.filePath)];
          if (readmeDoc) {
            doc.shortDescription = readmeDoc.shortDescription;
            doc.description = readmeDoc.description;
            doc.see = readmeDoc.see;
            doc.fileInfo = readmeDoc.fileInfo;
          }

          // Compute the primary/secondary entry point relationships
          const packageParts = doc.id.split('/');
          const primaryPackageName = packageParts[0];
          doc.isPrimaryPackage = packageParts.length === 1;
          doc.packageInfo = packageMap[primaryPackageName] = packageMap[primaryPackageName] || { primary: undefined, secondary: [] };
          if (doc.isPrimaryPackage) {
            doc.packageInfo.primary = doc;
          } else {
            doc.packageInfo.secondary.push(doc);
          }
        }
      });

      return docs;
    }
  };
};
