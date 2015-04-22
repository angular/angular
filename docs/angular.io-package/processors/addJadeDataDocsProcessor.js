var _ = require('lodash');
var path = require('canonical-path');

var titleCase = function(text) {
  return text.replace(/(.)(.*)/, function(_, first, rest) {
    return first.toUpperCase() + rest;
  });
};

module.exports = function addJadeDataDocsProcessor(EXPORT_DOC_TYPES) {
  return {
    $runAfter: ['adding-extra-docs', 'cloneExportedFromDocs'],
    $runBefore: ['extra-docs-added'],
    $process: function(docs) {
      var extraDocs = [];
      var modules = [];
      _.forEach(docs, function(doc) {
        if (doc.docType === 'module') {
          modules.push(doc);
          var extraDoc = {
            id: doc.id + "-data",
            docType: 'jade-data',
            originalDoc: doc,
            data: _.map(doc.exports, function(exportDoc) {
              var dataDoc = {
                name: exportDoc.name + '-' + exportDoc.docType,
                title: exportDoc.name + ' ' + titleCase(exportDoc.docType)
              };
              return dataDoc;
            })
          };
          extraDocs.push(extraDoc);
        }
      });

      extraDocs.push({
        docType: 'jade-data',
        originalDoc: { id: 'angular2' },
        data: _.map(_.filter(modules, 'public'), function(moduleDoc) {
          var dataDoc = {
            name: path.basename(moduleDoc.id),
            title: _.map(path.basename(moduleDoc.id).split('_'), function(part) {
              return titleCase(part);
            }).join(' ')
          };
          if (!moduleDoc.public) {
            console.log(moduleDoc.id);
          }
          return dataDoc;
        })
      });


      return docs.concat(extraDocs);
    }
  };
};