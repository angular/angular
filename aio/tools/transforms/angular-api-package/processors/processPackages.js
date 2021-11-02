const { dirname } = require('canonical-path');

module.exports = function processPackages(collectPackageContentDocsProcessor) {
  return {
    $runAfter: ['processAliasDocs', 'collectPackageContentDocsProcessor'],
    $runBefore: ['rendering-docs', 'checkContentRules'],
    $process(docs) {
      const packageContentFiles = collectPackageContentDocsProcessor.packageContentFiles;
      const packageMap = {};

      docs.forEach(doc => {
        if (doc.docType === 'module') {
          // Convert the doc type from "module" to "package"
          doc.docType = 'package';
          // The name is actually the full id
          doc.name = `@angular/${doc.id}`;

          // Partition the exports into groups by type
          if (doc.exports) {
            const publicExports = doc.exports.filter(doc => !doc.privateExport);
            doc.hasPublicExports = publicExports.length > 0;
            doc.ngmodules = publicExports.filter(doc => doc.docType === 'ngmodule').sort(byId);
            doc.classes = publicExports.filter(doc => doc.docType === 'class').sort(byId);
            doc.decorators = publicExports.filter(doc => doc.docType === 'decorator').sort(byId);
            doc.functions = publicExports.filter(doc => doc.docType === 'function').sort(byId);
            doc.structures = publicExports.filter(doc => doc.docType === 'enum' || doc.docType === 'interface').sort(byId);
            doc.directives = publicExports.filter(doc => doc.docType === 'directive').sort(byId);
            doc.pipes = publicExports.filter(doc => doc.docType === 'pipe').sort(byId);
            doc.types = publicExports.filter(doc => doc.docType === 'type-alias' || doc.docType === 'const').sort(byId);
            doc.elements = publicExports.filter(doc => doc.docType === 'element').sort(byId);
            if (doc.hasPublicExports && publicExports.every(doc => !!doc.deprecated)) {
              doc.deprecated = 'all exports of this entry point are deprecated.';
            }
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

      // Update package deprecation status (compared to entry point status)
      Object.keys(packageMap).forEach(key => {
        const pkg = packageMap[key];
        pkg.primary.packageDeprecated = pkg.primary.deprecated !== undefined && pkg.secondary.every(entryPoint => entryPoint.deprecated !== undefined);
      });
    }
  };
};


function byId(a, b) {
  return a.id > b.id ? 1 : -1;
}
